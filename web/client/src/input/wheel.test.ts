// BUG-009: cuộn touchpad cộng dồn đủ wheelStepDelta mới tính 1 nấc; chuột thường vẫn 1 nấc/lần.
import { describe, expect, it } from 'vitest';
import { gameConfig } from '../config/gameConfig';
import { createPitchLadder, nextLadderStep, tickPitchLadder } from '../systems/pitchLadder';
import { accumulateWheel, createWheelAccumulator, WHEEL_LINE_PX, wheelDeltaPx } from './wheel';

const STEP = gameConfig.wheelStepDelta;

describe('accumulateWheel — cuộn chuột thành nấc hotbar', () => {
  it('chuột thường: mỗi sự kiện deltaY 100 = 1 nấc, hai chiều', () => {
    const acc = createWheelAccumulator();
    expect(accumulateWheel(acc, 100, STEP)).toBe(1);
    expect(accumulateWheel(acc, 100, STEP)).toBe(1);
    expect(accumulateWheel(acc, -100, STEP)).toBe(-1);
  });
  it('touchpad: 4 sự kiện deltaY 4 (16 px) không đổi ô; dồn đủ 100 px mới 1 nấc', () => {
    const acc = createWheelAccumulator();
    let steps = 0;
    for (let i = 0; i < 4; i++) steps += accumulateWheel(acc, 4, STEP);
    expect(steps).toBe(0);
    for (let i = 0; i < 21; i++) steps += accumulateWheel(acc, 4, STEP); // tổng 100 px
    expect(steps).toBe(1);
  });
  it('một sự kiện rất lớn (cuộn nhanh) → nhiều nấc', () => {
    expect(accumulateWheel(createWheelAccumulator(), 300, STEP)).toBe(3);
  });
  it('đổi chiều thì bỏ phần dư cũ', () => {
    const acc = createWheelAccumulator();
    accumulateWheel(acc, 90, STEP);
    expect(accumulateWheel(acc, -100, STEP)).toBe(-1);
    expect(acc.rest).toBe(0);
  });
  it('deltaMode dòng (Firefox) đổi ra px', () => {
    expect(wheelDeltaPx(3, 1)).toBe(3 * WHEEL_LINE_PX);
    expect(wheelDeltaPx(57, 0)).toBe(57);
  });
});

describe('pitchLadder — tiếng hái lên dần theo thang ngũ cung', () => {
  const L = gameConfig.harvestPitchLadderCents;
  const R = gameConfig.harvestPitchResetSeconds;
  it('thang đúng thông số: 0, 200, 400, 700, 900, 1200 cent', () => {
    expect([...L]).toEqual([0, 200, 400, 700, 900, 1200]);
  });
  it('hái liên tiếp lên từng nấc, tới nấc cao nhất thì giữ', () => {
    const s = createPitchLadder();
    const got: number[] = [];
    for (let i = 0; i < 8; i++) {
      got.push(nextLadderStep(s, L, R));
      tickPitchLadder(s, 0.4);
    }
    expect(got).toEqual([0, 200, 400, 700, 900, 1200, 1200, 1200]);
  });
  it('ngừng hái quá harvestPitchResetSeconds thì về nấc đầu; chưa quá thì lên tiếp', () => {
    const s = createPitchLadder();
    nextLadderStep(s, L, R);
    tickPitchLadder(s, R - 0.1);
    expect(nextLadderStep(s, L, R)).toBe(200);
    tickPitchLadder(s, R + 0.1);
    expect(nextLadderStep(s, L, R)).toBe(0);
  });
});
