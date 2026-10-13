import { describe, expect, it } from 'vitest';
import { gameConfig } from '../config/gameConfig';
import { HOE_FRAME, hoeFrameAt } from './toolAnim';

describe('hoeFrameAt — 4 khung mỗi nhát, khung chạm trùng lúc chạm', () => {
  const at = (p: number) => hoeFrameAt(p, 0.5, 0.4, 0.5);

  it('chạy đủ 0 → 1 → 2 → 3 trong một nhát', () => {
    expect(at(0)).toBe(HOE_FRAME.ready);
    expect(at(0.19)).toBe(HOE_FRAME.ready);
    expect(at(0.2)).toBe(HOE_FRAME.raised);
    expect(at(0.49)).toBe(HOE_FRAME.raised);
    expect(at(0.74)).toBe(HOE_FRAME.impact);
    expect(at(0.75)).toBe(HOE_FRAME.recover);
    expect(at(0.999)).toBe(HOE_FRAME.recover);
  });

  it('đúng điểm chạm là khung chạm đất (khớp tileAction: chạm khi elapsed ≥ duration × impactAt)', () => {
    expect(at(0.5)).toBe(HOE_FRAME.impact);
    const { actionImpactAt: hit, tillAnimWindupShare: w, tillAnimImpactShare: i } = gameConfig;
    expect(hoeFrameAt(hit, hit, w, i)).toBe(HOE_FRAME.impact);
    expect(hoeFrameAt(hit - 1e-6, hit, w, i)).toBe(HOE_FRAME.raised);
  });

  it('kẹp giá trị ngoài khoảng / lỗi', () => {
    expect(at(-1)).toBe(HOE_FRAME.ready);
    expect(at(1)).toBe(HOE_FRAME.recover);
    expect(at(5)).toBe(HOE_FRAME.recover);
    expect(at(Number.NaN)).toBe(HOE_FRAME.ready);
  });

  it('chạm ngay từ đầu (impactAt 0) → khung chạm luôn', () => {
    expect(hoeFrameAt(0, 0, 0.4, 0.5)).toBe(HOE_FRAME.impact);
  });
});
