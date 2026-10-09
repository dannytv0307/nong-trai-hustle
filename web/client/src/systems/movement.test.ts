import { describe, expect, it } from 'vitest';
import { facingFromDirection, moveVelocity } from './movement';

describe('moveVelocity', () => {
  it('đứng yên khi không bấm phím', () => {
    expect(moveVelocity({ x: 0, y: 0 }, 256)).toEqual({ x: 0, y: 0 });
  });
  it('đi chéo không nhanh hơn đi thẳng', () => {
    const v = moveVelocity({ x: 1, y: 1 }, 256);
    expect(Math.hypot(v.x, v.y)).toBeCloseTo(256, 6);
  });
});

describe('facingFromDirection', () => {
  it('giữ hướng cũ khi đứng yên, ưu tiên ngang khi đi chéo', () => {
    expect(facingFromDirection({ x: 0, y: 0 }, 'up')).toBe('up');
    expect(facingFromDirection({ x: -1, y: 1 }, 'down')).toBe('left');
    expect(facingFromDirection({ x: 0, y: 1 }, 'up')).toBe('down');
  });
});
