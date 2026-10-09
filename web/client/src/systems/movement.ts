// Tính vận tốc đi bộ từ hướng phím (GDD §3.3: WASD 8 hướng). Thuần TS để test.

export interface Vec2 {
  x: number;
  y: number;
}

export type Facing = 'down' | 'up' | 'left' | 'right';

/**
 * Hướng phím (-1/0/1 mỗi trục) → vận tốc px/giây.
 * Chuẩn hóa đường chéo để đi chéo không nhanh hơn đi thẳng (nếu không sẽ nhanh gấp √2).
 */
export function moveVelocity(dir: Vec2, speedPxPerSec: number): Vec2 {
  const len = Math.hypot(dir.x, dir.y);
  if (len === 0) return { x: 0, y: 0 };
  return { x: (dir.x / len) * speedPxPerSec, y: (dir.y / len) * speedPxPerSec };
}

/** Chọn hướng mặt nhân vật theo hướng đi; đi chéo thì ưu tiên trục ngang. Đứng yên giữ hướng cũ. */
export function facingFromDirection(dir: Vec2, previous: Facing): Facing {
  if (dir.x < 0) return 'left';
  if (dir.x > 0) return 'right';
  if (dir.y < 0) return 'up';
  if (dir.y > 0) return 'down';
  return previous;
}
