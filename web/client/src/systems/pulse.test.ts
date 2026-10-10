import { describe, expect, it } from 'vitest';
import { pulseAlpha } from './pulse';

describe('pulseAlpha — nhịp thở của viền ô', () => {
  it('bắt đầu sáng nhất, mờ nhất ở nửa chu kỳ, sáng lại sau 1 chu kỳ', () => {
    expect(pulseAlpha(0, 2, 0.6)).toBeCloseTo(1);
    expect(pulseAlpha(0.25, 2, 0.6)).toBeCloseTo(0.6);
    expect(pulseAlpha(0.5, 2, 0.6)).toBeCloseTo(1);
  });

  it('luôn nằm trong [minAlpha, 1]', () => {
    for (let t = 0; t < 3; t += 0.037) {
      const a = pulseAlpha(t, 1.6, 0.6);
      expect(a).toBeGreaterThanOrEqual(0.6 - 1e-9);
      expect(a).toBeLessThanOrEqual(1 + 1e-9);
    }
  });

  it('tắt nhịp thở khi rate ≤ 0 hoặc minAlpha ≥ 1', () => {
    expect(pulseAlpha(0.3, 0, 0.5)).toBe(1);
    expect(pulseAlpha(0.3, 2, 1)).toBe(1);
  });
});
