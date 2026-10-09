import { describe, expect, it } from 'vitest';
import {
  createWalkAnimState,
  onWalkFrame,
  smoothSpeedRatio,
  stepWalkAnim,
  walkTimeScale,
  type WalkAnimParams,
  type WalkAnimState,
} from './walkAnim';

const P: WalkAnimParams = {
  blendRate: 12,
  breathScale: 0.02,
  breathRate: 0.5,
  turnSeconds: 0.12,
  turnSquash: 0.55,
  dustEverySteps: 2,
  upBobPx: 1,
};
const DT = 1 / 60;

function run(state: WalkAnimState, frames: number, speedRatio: number) {
  const scaleY: number[] = [];
  for (let i = 0; i < frames; i++) {
    stepWalkAnim(state, { speedRatio, turned: false }, DT, P);
    scaleY.push(state.pose.scaleY);
  }
  return scaleY;
}

describe('walkTimeScale — tốc độ chạy khung theo tốc độ thật', () => {
  it('đủ tốc độ = 1, nửa tốc độ = 0.5', () => {
    expect(walkTimeScale(1)).toBe(1);
    expect(walkTimeScale(0.5)).toBe(0.5);
  });
  it('gần như đứng (ép tường) = 0 → dừng anim', () => {
    expect(walkTimeScale(0.01)).toBe(0);
    expect(walkTimeScale(0)).toBe(0);
  });
  it('không vượt 1 khi khung hình giật', () => {
    expect(walkTimeScale(3)).toBe(1);
  });
});

describe('stepWalkAnim', () => {
  it('đứng yên: thở nhẹ ±breathScale, không nhích', () => {
    const s = createWalkAnimState();
    const sy = run(s, 240, 0);
    expect(Math.max(...sy)).toBeGreaterThan(1.015);
    expect(Math.min(...sy)).toBeLessThan(0.985);
    for (const v of sy) expect(Math.abs(v - 1)).toBeLessThanOrEqual(P.breathScale + 1e-9);
    expect(Math.abs(s.pose.offsetY)).toBe(0);
    expect(s.moving).toBe(false);
  });

  it('đang đi: không thở, không co giãn bằng code (khung thật lo dáng đi)', () => {
    const s = createWalkAnimState();
    const sy = run(s, 60, 1);
    expect(s.moving).toBe(true);
    expect(sy[sy.length - 1]).toBeCloseTo(1, 6);
    expect(s.pose.scaleX).toBe(1);
  });

  it('đổi hướng: bề ngang co lại rồi trở về 1', () => {
    const s = createWalkAnimState();
    stepWalkAnim(s, { speedRatio: 0, turned: true }, DT, P);
    expect(s.pose.scaleX).toBeLessThan(0.7);
    run(s, 20, 0);
    expect(s.pose.scaleX).toBeCloseTo(1, 6);
  });

  it('dừng lại thì bỏ nhích của hướng lên', () => {
    const s = createWalkAnimState();
    run(s, 10, 1);
    onWalkFrame(s, 1, true, P);
    expect(s.pose.offsetY).toBe(-1);
    run(s, 1, 0);
    expect(Math.abs(s.pose.offsetY)).toBe(0);
  });
});

describe('onWalkFrame — bụi chân theo khung chạm gót', () => {
  it('khung 0 và 2 là chạm gót; bụi mỗi dustEverySteps lần', () => {
    const s = createWalkAnimState();
    const events = [0, 1, 2, 3, 0, 1, 2, 3].map((f) => onWalkFrame(s, f, false, P));
    expect(events).toEqual(['step', 'none', 'dust', 'none', 'step', 'none', 'dust', 'none']);
    expect(s.stepCount).toBe(4);
  });

  it('đi lên: nhích 1px ở khung nhấc chân (1, 3), các hướng khác không nhích', () => {
    const s = createWalkAnimState();
    onWalkFrame(s, 1, true, P);
    expect(s.pose.offsetY).toBe(-P.upBobPx);
    onWalkFrame(s, 2, true, P);
    expect(Math.abs(s.pose.offsetY)).toBe(0);
    onWalkFrame(s, 3, false, P);
    expect(Math.abs(s.pose.offsetY)).toBe(0);
  });
});

describe('smoothSpeedRatio — đo tốc độ ổn định', () => {
  it('màn 144Hz (bước vật lý 60Hz: 2.4, 0, 0, …) vẫn ra gần 1', () => {
    let r = 0;
    const dt = 1 / 144;
    let min = Infinity;
    for (let i = 0; i < 288; i++) {
      // Frame nào có bước vật lý (60 lần/giây) thì đo được 144/60 = 2.4, còn lại đo 0.
      const physicsStep = Math.floor(((i + 1) * 60) / 144) > Math.floor((i * 60) / 144);
      r = smoothSpeedRatio(r, physicsStep ? 2.4 : 0, dt, 20);
      if (i > 144) min = Math.min(min, walkTimeScale(r));
    }
    // Sau khi ổn định, anim luôn chạy (không lúc dừng lúc chạy), tốc độ khung gần đủ.
    expect(min).toBeGreaterThan(0.7);
  });
  it('dừng hẳn thì về dưới ngưỡng đi trong ~0.2 giây', () => {
    let r = 1;
    for (let i = 0; i < 12; i++) r = smoothSpeedRatio(r, 0, 1 / 60, 20);
    expect(walkTimeScale(r)).toBe(0);
  });
});
