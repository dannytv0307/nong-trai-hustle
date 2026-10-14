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

/**
 * T-096: hướng mặt theo một VECTƠ bất kỳ (đi theo đường click — hướng không chỉ -1/0/1). Trục lớn hơn thắng; gần 45° thì
 * giữ trục đang quay (phải lớn hơn `hysteresis` lần mới đổi trục) — đi chéo theo đường không bị lật mặt qua lại mỗi frame.
 */
export function facingFromVector(vx: number, vy: number, previous: Facing, hysteresis = 1.2): Facing {
  const ax = Math.abs(vx);
  const ay = Math.abs(vy);
  if (ax < 1e-6 && ay < 1e-6) return previous;
  const wasSide = previous === 'left' || previous === 'right';
  const side = wasSide ? ay <= ax * hysteresis : ax > ay * hysteresis;
  if (side) return vx < 0 ? 'left' : 'right';
  return vy < 0 ? 'up' : 'down';
}
