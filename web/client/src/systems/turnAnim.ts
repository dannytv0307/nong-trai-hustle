// Khung xoay khi đổi hướng (ART-CHR-006, thay cú bóp scaleX cũ).
// Ý tưởng: giữa hai hướng thẳng (xuống/lên/trái/phải) chèn ảnh chéo 3/4 trong ~70 ms, để mắt thấy
// nhân vật "xoay người" thay vì bật tức thì sang hình khác. Chỉ là HÌNH — điều khiển không bị khựng.
// Thuần TS (không dùng Phaser) để unit test.
import type { Facing } from './movement';

/** Bốn ảnh chéo, đúng thứ tự khung trong dải `hero-t1-turn.png` (0..3). */
export const TURN_DIAGONALS = ['down-right', 'down-left', 'up-right', 'up-left'] as const;
export type TurnDiagonal = (typeof TURN_DIAGONALS)[number];

type Vertical = 'down' | 'up';
type Horizontal = 'left' | 'right';

/** Chỉ số khung trong spritesheet xoay. */
export function turnFrameIndex(d: TurnDiagonal): number {
  return TURN_DIAGONALS.indexOf(d);
}

const isVertical = (f: Facing): f is Vertical => f === 'down' || f === 'up';
const diag = (v: Vertical, h: Horizontal): TurnDiagonal => `${v}-${h}`;
const opposite = (f: Facing): Facing =>
  f === 'down' ? 'up' : f === 'up' ? 'down' : f === 'left' ? 'right' : 'left';

/**
 * Các ảnh chéo cần chèn khi xoay từ hướng `from` sang `to`.
 * - Quay 90°: 1 ảnh chéo nằm giữa hai hướng (xuống↔phải → xuống-phải…).
 * - Quay 180°: 2 ảnh, đi vòng qua phía hợp lý — trái↔phải vòng qua phía XUỐNG (mặt hướng về người
 *   chơi, nhìn tự nhiên hơn quay lưng); xuống↔lên vòng qua phía ngang vừa đi (`lastDirX`, mặc định phải).
 */
export function turnPath(from: Facing, to: Facing, lastDirX: number): TurnDiagonal[] {
  if (from === to) return [];
  if (opposite(from) !== to) {
    // 90°: một hướng dọc + một hướng ngang.
    const v = (isVertical(from) ? from : to) as Vertical;
    const h = (isVertical(from) ? to : from) as Horizontal;
    return [diag(v, h)];
  }
  if (!isVertical(from)) {
    // trái ↔ phải: vòng qua phía xuống.
    return [diag('down', from), diag('down', to as Horizontal)];
  }
  const side: Horizontal = lastDirX < 0 ? 'left' : 'right';
  return [diag(from, side), diag(to as Vertical, side)];
}

/**
 * Đang hiện ảnh chéo `shown` mà người chơi lại đổi sang hướng `to`: tính đường xoay TỪ ảnh đang hiện
 * (không chạy nốt đường cũ → không kẹt khung). Ảnh chéo kề sẵn `to` (45°) thì vào thẳng hướng mới.
 */
export function turnPathFromDiagonal(shown: TurnDiagonal, to: Facing): TurnDiagonal[] {
  const [v, h] = shown.split('-') as [Vertical, Horizontal];
  if (to === v || to === h) return [];
  return isVertical(to) ? [diag(to, h)] : [diag(v, to)];
}

export interface TurnAnimState {
  /** Ảnh chéo đang hiện; null = không xoay (hiện ảnh đứng / chu trình bước bình thường). */
  frame: TurnDiagonal | null;
  /** Các ảnh chéo còn chờ hiện tiếp (quay 180°). */
  queue: TurnDiagonal[];
  /** Ảnh hiện tại còn hiện bao lâu nữa (giây). */
  left: number;
}

export function createTurnAnimState(): TurnAnimState {
  return { frame: null, queue: [], left: 0 };
}

/**
 * Gọi đúng frame nhân vật đổi hướng `from` → `to`. `frameSeconds` = mỗi ảnh chéo hiện bao lâu
 * (≤ 0 = tắt khung xoay, đổi hình thẳng).
 */
export function startTurn(s: TurnAnimState, from: Facing, to: Facing, lastDirX: number, frameSeconds: number): void {
  const path = frameSeconds <= 0 ? [] : s.frame ? turnPathFromDiagonal(s.frame, to) : turnPath(from, to, lastDirX);
  s.frame = path[0] ?? null;
  s.queue = path.slice(1);
  s.left = s.frame ? frameSeconds : 0;
}

/** Tiến thời gian `dt` giây: hết giờ ảnh hiện tại thì sang ảnh kế, hết hàng đợi thì `frame = null`. */
export function stepTurn(s: TurnAnimState, dt: number, frameSeconds: number): void {
  if (!s.frame) return;
  s.left -= dt;
  // Vòng lặp (không phải if): một frame giật dài (tab vừa hiện lại) có thể vượt qua nhiều ảnh cùng lúc.
  while (s.frame && s.left <= 0) {
    const next = s.queue.shift();
    if (next) {
      s.frame = next;
      s.left += frameSeconds;
    } else {
      s.frame = null;
      s.left = 0;
    }
  }
}
