// T-024: chọn hình cho đồ vật Vườn — mảnh rào theo vị trí trong đoạn, ảnh thúng bán đóng / hé, tán cây mờ khi người
// đứng dưới. Thuần TS (không Phaser) → unit test. Cỡ ảnh đọc từ props.json (systems/props.ts), không ghi cứng ở đây.
import { propSpec } from './props';

export type FenceStyle = 'tre' | 'dambut';

/** Một đoạn rào thẳng theo ô: bắt đầu ở (x, y), dài `len` ô theo chiều `dir` (h = ngang sang phải, v = dọc xuống). */
export interface FenceLine {
  style: FenceStyle;
  x: number;
  y: number;
  len: number;
  dir: 'h' | 'v';
}

/** Một mảnh hình rào: ảnh `key` (cột `col` nếu là ảnh ghép nhiều cột), đặt origin (0.5, 1) tại (x, bottom), depth = `depth`. */
export interface FencePiece {
  key: string;
  /** Cột 64 px trong ảnh nhiều cột (hedge-dambut-h-mid3), null = cả ảnh. */
  col: number | null;
  x: number;
  bottom: number;
  depth: number;
}

/** Số cột của mảnh giữa rào dâm bụt ngang (ảnh 192 px = 3 cột 64). */
export const HEDGE_MID_COLS = 3;

/**
 * Mảnh hình của một đoạn rào.
 *
 * Rào tre: đường rào chạy qua TÂM các ô (không theo mép ô như ghi chú props.json) — để góc rào ngang gặp rào dọc
 * (mỗi ô một trụ ở tâm) đúng một chỗ. Ngang: n ô → n − 1 nhịp `fence-tre-h` (mỗi nhịp nối tâm ô i với tâm ô i + 1, tức
 * tâm nhịp ở mép chung) + `fence-tre-post` ở tâm ô đầu và ô cuối. Dọc: mỗi ô một `fence-tre-v`, tâm ô, đáy = đáy ô.
 *
 * Rào dâm bụt (props.json): ngang — ô đầu `h-l`, ô cuối `h-r`, ô giữa thứ i dùng cột (i % 3) của `h-mid3`; dọc —
 * `v-top` đặt đáy ở ĐỈNH ô đầu, `v-mid` mọi ô trừ ô cuối, `v-bottom` ô cuối.
 */
export function fencePieces(line: FenceLine, tileSize: number): FencePiece[] {
  const T = tileSize;
  const n = Math.max(0, Math.floor(line.len));
  const out: FencePiece[] = [];
  if (n === 0) return out;
  const cx = (i: number) => (line.dir === 'h' ? (line.x + i + 0.5) * T : (line.x + 0.5) * T);
  const bottomOf = (i: number) => (line.dir === 'h' ? (line.y + 1) * T : (line.y + i + 1) * T);
  const piece = (key: string, x: number, bottom: number, col: number | null = null, depth = bottom): FencePiece => ({ key, col, x, bottom, depth });

  if (line.style === 'tre') {
    if (line.dir === 'h') {
      const bottom = bottomOf(0);
      for (let i = 0; i < n - 1; i++) out.push(piece('fence-tre-h', (line.x + i + 1) * T, bottom));
      out.push(piece('fence-tre-post', cx(0), bottom));
      if (n > 1) out.push(piece('fence-tre-post', cx(n - 1), bottom));
    } else {
      for (let i = 0; i < n; i++) out.push(piece('fence-tre-v', cx(i), bottomOf(i)));
    }
    return out;
  }

  if (line.dir === 'h') {
    const bottom = bottomOf(0);
    for (let i = 0; i < n; i++) {
      if (i === 0) out.push(piece('hedge-dambut-h-l', cx(i), bottom));
      else if (i === n - 1) out.push(piece('hedge-dambut-h-r', cx(i), bottom));
      else out.push(piece('hedge-dambut-h-mid3', cx(i), bottom, i % HEDGE_MID_COLS));
    }
  } else {
    const top = line.y * T;
    out.push(piece('hedge-dambut-v-top', cx(0), top, null, top + 1));
    for (let i = 0; i < n; i++) out.push(piece(i === n - 1 ? 'hedge-dambut-v-bottom' : 'hedge-dambut-v-mid', cx(i), bottomOf(i)));
  }
  return out;
}

/** Bốn đoạn rào viền bản đồ (khớp fenceRects của garden.ts): hàng trên, hàng dưới, cột trái, cột phải (trừ góc). */
export function borderFenceLines(cols: number, rows: number, style: FenceStyle): FenceLine[] {
  return [
    { style, x: 0, y: 0, len: cols, dir: 'h' },
    { style, x: 0, y: rows - 1, len: cols, dir: 'h' },
    { style, x: 0, y: 1, len: rows - 2, dir: 'v' },
    { style, x: cols - 1, y: 1, len: rows - 2, dir: 'v' },
  ];
}

/** Mọi tên ảnh rào cần nạp. */
export const FENCE_KEYS = [
  'fence-tre-h',
  'fence-tre-post',
  'fence-tre-v',
  'hedge-dambut-h-l',
  'hedge-dambut-h-mid3',
  'hedge-dambut-h-r',
  'hedge-dambut-v-top',
  'hedge-dambut-v-mid',
  'hedge-dambut-v-bottom',
] as const;

/** Thúng bán: có đồ chờ bán (sẽ bán qua đêm) → ảnh hé nắp; trống → đóng. */
export const SELL_BASKET = { closed: 'sell-basket-closed', open: 'sell-basket-open' } as const;
export function sellBasketKey(hasItems: boolean): string {
  return hasItems ? SELL_BASKET.open : SELL_BASKET.closed;
}

/**
 * Tán cây có che người không (để làm mờ — props.json: "làm mờ 50% khi {ten} đứng dưới tán"): hộp thân người
 * (rộng `heroHalfW` × 2, cao `heroH` tính từ chân) giao với hộp phần lá của tán. `canopyBox` = hộp phần lá (px thế giới).
 */
export function canopyCoversHero(
  canopyBox: { left: number; top: number; right: number; bottom: number },
  footX: number,
  footY: number,
  heroHalfW: number,
  heroH: number,
): boolean {
  return footX + heroHalfW > canopyBox.left && footX - heroHalfW < canopyBox.right && footY > canopyBox.top && footY - heroH < canopyBox.bottom;
}

/** Cỡ ảnh một mảnh rào (px) theo props.json — đổi ảnh thì đổi theo, không ghi cứng. */
export function fencePieceSize(key: string): [number, number] {
  return propSpec(key).size;
}
