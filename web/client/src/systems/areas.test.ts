// T-093: chuyển khu dùng chung — màn mờ ra, đổi khu đúng một lần, mờ vào; tên khu.
import { describe, expect, it } from 'vitest';
import {
  areaBannerAlpha,
  areaName,
  createAreaTransition,
  isAreaId,
  isTransitioning,
  startAreaTransition,
  stepAreaTransition,
  transitionAlpha,
} from './areas';

const FADE = 0.4;

describe('chuyển khu (T-093)', () => {
  it('idle → out (tối dần) → swap đúng 1 lần → in (sáng dần) → done → idle', () => {
    const s = createAreaTransition();
    expect(isTransitioning(s)).toBe(false);
    expect(startAreaTransition(s, 'house', { x: 10, y: 20 }, 'up')).toBe(true);
    expect(isTransitioning(s)).toBe(true);
    expect(transitionAlpha(s, FADE)).toBe(0);
    expect(stepAreaTransition(s, 0.2, FADE)).toBeNull();
    expect(transitionAlpha(s, FADE)).toBeCloseTo(0.5);
    const events: string[] = [];
    for (let i = 0; i < 60; i++) {
      const e = stepAreaTransition(s, 1 / 60, FADE);
      if (e) {
        events.push(e);
        if (e === 'swap') {
          // Lúc đổi khu còn biết đi đâu, đứng đâu, quay mặt hướng nào.
          expect(s.to).toBe('house');
          expect(s.spawn).toEqual({ x: 10, y: 20 });
          expect(s.facing).toBe('up');
          expect(transitionAlpha(s, FADE)).toBe(1);
        }
      }
    }
    expect(events).toEqual(['swap', 'done']);
    expect(isTransitioning(s)).toBe(false);
    expect(transitionAlpha(s, FADE)).toBe(0);
    expect(s.to).toBeNull();
  });

  it('đang chuyển dở thì không nhận lần chuyển khác', () => {
    const s = createAreaTransition();
    startAreaTransition(s, 'house', { x: 0, y: 0 }, 'up');
    expect(startAreaTransition(s, 'garden', { x: 5, y: 5 }, 'down')).toBe(false);
    expect(s.to).toBe('house');
  });

  it('fadeSeconds = 0: đổi khu ngay frame đầu, xong ở frame sau', () => {
    const s = createAreaTransition();
    startAreaTransition(s, 'garden', { x: 0, y: 0 }, 'down');
    expect(stepAreaTransition(s, 0, 0)).toBe('swap');
    expect(stepAreaTransition(s, 0, 0)).toBe('done');
  });

  it('idle: step không làm gì', () => {
    const s = createAreaTransition();
    expect(stepAreaTransition(s, 1, FADE)).toBeNull();
  });

  it('tên khu thay {ten}', () => {
    expect(areaName('house', 'Tý')).toBe('Nhà Tý');
    expect(areaName('garden', 'Tèo')).toBe('Vườn nhà Tèo');
  });

  it('isAreaId', () => {
    expect(isAreaId('house')).toBe(true);
    expect(isAreaId('garden')).toBe(true);
    expect(isAreaId('mountain')).toBe(false);
  });

  it('tên khu: đậm trong holdSeconds rồi mờ dần về 0', () => {
    expect(areaBannerAlpha(-1, 1.6, 0.6)).toBe(0);
    expect(areaBannerAlpha(0, 1.6, 0.6)).toBe(1);
    expect(areaBannerAlpha(1.6, 1.6, 0.6)).toBe(1);
    expect(areaBannerAlpha(1.9, 1.6, 0.6)).toBeCloseTo(0.5);
    expect(areaBannerAlpha(5, 1.6, 0.6)).toBe(0);
  });
});
