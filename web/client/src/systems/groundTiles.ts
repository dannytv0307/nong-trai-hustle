// Nền bản đồ bằng tile thật (T-021, ghép theo asset-list §3 "Ghép tile Lô 1"). Thuần TS — test được không cần Phaser.
//
// Ý tưởng: mỗi ô chỉ ghi LOẠI NỀN (cỏ / lối / sân / ruộng). Hình vẽ dựng từ loại nền theo 3 lớp:
//   1. lõi: texture 4×4 ô (256 px) — ô (x, y) lấy mảnh (y % 4) * 4 + (x % 4) để các ô liền nhau như ảnh gốc lặp lại;
//   2. viền luống: chỉ trên ô ruộng ĐÃ cuốc (kể cả đã tưới), mask = cạnh giáp ô không đã cuốc;
//   3. mép cỏ: trên mọi ô đất (lối, sân, ruộng mọi nấc), mask = cạnh giáp cỏ; thêm "góc lõm" khi ô chéo là cỏ còn
//      hai ô kề góc đó không phải cỏ.
// Mask 4-bit: N = 1, E = 2, S = 4, W = 8 → chỉ số ô trong tấm viền 16 ô (lưới 4×4) chính là mask.
import type { FarmPlot } from './farm';
import { tillStage } from './farm';

/** Loại nền một ô. Lối, sân, ruộng đều là "đất" — giữa chúng KHÔNG có mép (D-035). */
export type GroundKind = 'grass' | 'path' | 'yard' | 'soil';

export const EDGE_N = 1;
export const EDGE_E = 2;
export const EDGE_S = 4;
export const EDGE_W = 8;

/** Góc lõm trong tấm `path-corner` (2×2): 0 tây-bắc, 1 đông-bắc, 2 tây-nam, 3 đông-nam. */
export const CORNER_NW = 0;
export const CORNER_NE = 1;
export const CORNER_SW = 2;
export const CORNER_SE = 3;

/** Số ô mỗi chiều của texture lõi (256 px = 4 ô 64 px). */
export const CORE_CELLS = 4;
/** Số ô của một texture lõi / một tấm viền 16 ô. */
export const TILES_PER_SHEET = CORE_CELLS * CORE_CELLS;

/** Mảnh nào của texture lõi 4×4 dùng cho ô (x, y). Không rải ngẫu nhiên — chỉ đúng thứ tự này mới liền. */
export function coreCell(x: number, y: number): number {
  const m = (v: number) => ((v % CORE_CELLS) + CORE_CELLS) % CORE_CELLS;
  return m(y) * CORE_CELLS + m(x);
}

/** Hình chữ nhật theo ô (khớp TileRect của garden.ts). */
interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Phần bố cục cần để dựng lưới loại nền. */
export interface GroundLayoutInput {
  cols: number;
  rows: number;
  path: Rect;
  yard?: Rect;
  pathBranches?: Rect[];
  /** Nhà: nền nhà tính là đất nện (bị tường / sàn che) — để sân trước cửa không có mép cỏ chạy dọc chân tường. */
  house?: Rect;
  plots: Rect;
}

/**
 * Lưới loại nền [y][x]: mặc định cỏ; nền nhà + lối dọc + nhánh = lối; sân = sân; vùng ruộng = ruộng (ghi sau cùng, đè lên).
 * Ô ngoài bản đồ không nằm trong lưới (xem `kindAt`).
 */
export function buildGroundKinds(layout: GroundLayoutInput): GroundKind[][] {
  const grid: GroundKind[][] = [];
  for (let y = 0; y < layout.rows; y++) grid.push(new Array<GroundKind>(layout.cols).fill('grass'));
  const fill = (r: Rect | undefined, kind: GroundKind) => {
    if (!r) return;
    for (let y = Math.max(0, r.y); y < Math.min(layout.rows, r.y + r.h); y++) {
      for (let x = Math.max(0, r.x); x < Math.min(layout.cols, r.x + r.w); x++) grid[y][x] = kind;
    }
  };
  fill(layout.house, 'path');
  fill(layout.path, 'path');
  for (const b of layout.pathBranches ?? []) fill(b, 'path');
  fill(layout.yard, 'yard');
  fill(layout.plots, 'soil');
  return grid;
}

/** Loại nền ô (x, y); ngoài bản đồ → null. */
export function kindAt(grid: readonly (readonly GroundKind[])[], x: number, y: number): GroundKind | null {
  return grid[y]?.[x] ?? null;
}

/**
 * Mask 4-bit theo "hàng xóm có khác loại không". `differs(nx, ny)` trả true = cạnh đó cần viền, null = ngoài bản đồ
 * (coi như CÙNG loại với ô đang xét → không viền, để mép bản đồ không lộ khung).
 */
export function edgeMask(x: number, y: number, differs: (nx: number, ny: number) => boolean | null): number {
  let mask = 0;
  if (differs(x, y - 1) === true) mask |= EDGE_N;
  if (differs(x + 1, y) === true) mask |= EDGE_E;
  if (differs(x, y + 1) === true) mask |= EDGE_S;
  if (differs(x - 1, y) === true) mask |= EDGE_W;
  return mask;
}

/** Hàm "ô (x, y) có phải cỏ không" trên lưới (null = ngoài bản đồ). */
const isGrassFn = (grid: readonly (readonly GroundKind[])[]) => (x: number, y: number): boolean | null => {
  const k = kindAt(grid, x, y);
  return k === null ? null : k === 'grass';
};

/** Mép cỏ của một ô đất (0 = không viền). Ô cỏ luôn 0 — mép vẽ trên phần ĐẤT. */
export function grassEdgeMask(grid: readonly (readonly GroundKind[])[], x: number, y: number): number {
  const k = kindAt(grid, x, y);
  if (k === null || k === 'grass') return 0;
  return edgeMask(x, y, isGrassFn(grid));
}

/**
 * Góc lõm của một ô đất: ô chéo là cỏ nhưng hai ô kề cạnh góc đó KHÔNG phải cỏ (chỗ lối rẽ / ngã ba — mép cỏ hai
 * phía gặp nhau thành một góc nhỏ). Ngoài bản đồ coi như không phải cỏ. Trả danh sách chỉ số góc (0…3).
 */
export function concaveCorners(grid: readonly (readonly GroundKind[])[], x: number, y: number): number[] {
  const k = kindAt(grid, x, y);
  if (k === null || k === 'grass') return [];
  const grass = (nx: number, ny: number) => kindAt(grid, nx, ny) === 'grass';
  const out: number[] = [];
  const check = (dx: number, dy: number, corner: number) => {
    if (grass(x + dx, y + dy) && !grass(x + dx, y) && !grass(x, y + dy)) out.push(corner);
  };
  check(-1, -1, CORNER_NW);
  check(1, -1, CORNER_NE);
  check(-1, 1, CORNER_SW);
  check(1, 1, CORNER_SE);
  return out;
}

/** Ô ruộng "đã cuốc" theo nghĩa hình: đất tơi (có/không cây, đã/chưa tưới). Cuốc dở vẫn là chưa cuốc. */
export const isTilledLook = (plot: FarmPlot): boolean => plot.soil === 'tilled';

/**
 * Viền luống của ô ruộng đã cuốc: bit = cạnh giáp ô KHÔNG đã cuốc (cỏ, lối, ruộng chưa cuốc / cuốc dở).
 * `tilledAt(x, y)`: true/false theo ô, null = ngoài bản đồ (coi như cùng loại). Ô chưa cuốc → 0 (không vẽ).
 */
export function tilledEdgeMask(x: number, y: number, tilledAt: (nx: number, ny: number) => boolean | null): number {
  if (tilledAt(x, y) !== true) return 0;
  return edgeMask(x, y, (nx, ny) => {
    const t = tilledAt(nx, ny);
    return t === null ? null : !t;
  });
}

/**
 * Texture lõi của ô ruộng, theo thứ tự chỉ số: 0 cỏ khô (chưa cuốc), 1 vỡ cỏ, 2 lổn nhổn, 3 đất tơi (đã cuốc),
 * 4 đã tưới (lõi sẫm, viền luống giữ như đã cuốc).
 */
export const SOIL_TEXTURES = ['soil-dry', 'soil-till-1', 'soil-till-2', 'soil-tilled', 'soil-watered'] as const;
export type SoilTexture = (typeof SOIL_TEXTURES)[number];

/** Nấc hình cuốc dở có tile riêng: 2 nấc giữa (vỡ cỏ, lổn nhổn). */
const PARTIAL_LOOKS = 2;

/**
 * Chỉ số trong SOIL_TEXTURES cho một ô ruộng. Nấc cuốc tính bằng `tillStage(strikes, n, stages)` (cùng hàm thanh tiến
 * độ dùng): 0 → cỏ khô, `stages` → đất tơi, nấc giữa chia đều vào 2 hình cuốc dở (stages = 3 thì 1 → vỡ cỏ, 2 → lổn
 * nhổn). Đã tưới chỉ có nghĩa trên đất đã cuốc.
 */
export function soilLookIndex(plot: FarmPlot, strikesPerPlot: number, stages: number): number {
  if (plot.soil === 'tilled') return plot.watered ? 4 : 3;
  const stage = tillStage(plot.tillStrikes, strikesPerPlot, stages);
  if (stage <= 0) return 0;
  if (stage >= stages) return 3;
  // stage 1…stages−1 → 1…PARTIAL_LOOKS
  return 1 + Math.min(PARTIAL_LOOKS - 1, Math.floor(((stage - 1) * PARTIAL_LOOKS) / Math.max(1, stages - 1)));
}

/** Texture lõi của các loại nền không phải ruộng. */
export const KIND_TEXTURE = {
  grass: 'grass',
  path: 'path',
  yard: 'yard',
} as const satisfies Record<Exclude<GroundKind, 'soil'>, string>;
