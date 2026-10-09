// Bố cục bản đồ Vườn (T-001) ở dạng dữ liệu thuần: đâu là nhà, rào, ao, cây, ruộng.
// Scene dựa vào đây để vẽ hình khối + tạo hộp va chạm; test dựa vào đây để kiểm
// "đi được tới giường, tới ruộng, tới thùng bán" mà không cần mở trình duyệt.
import layoutJson from '../data/gardenLayout.json';

/** Hình chữ nhật theo ô. */
export interface TileRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface GardenLayout {
  cols: number;
  rows: number;
  /** Vị trí chân nhân vật lúc vào Vườn (ô, cho phép số lẻ). */
  spawn: { x: number; y: number };
  /** Khung nhà (tường dày 1 ô), cửa ở tường dưới từ cột doorX, rộng doorW ô. */
  house: TileRect & { doorX: number; doorW: number };
  bed: TileRect;
  /** Ruộng ban đầu (startPlots ô). */
  plots: TileRect;
  /** Lối đất từ cửa nhà xuống Đầu ngõ (chỉ trang trí). */
  path: TileRect;
  pond: TileRect;
  /** Chừa chỗ cho T-006 (chưa chặn đường). */
  sellBox: TileRect;
  seedStall: TileRect;
  /** Gốc cây [x, y] (ô). */
  trees: [number, number][];
}

export const gardenLayout = layoutJson as unknown as GardenLayout;

export type SolidKind = 'fence' | 'wall' | 'bed' | 'pond' | 'tree';

export interface Solid {
  kind: SolidKind;
  rect: TileRect;
}

/** Bốn cạnh hàng rào quanh mép bản đồ (mỗi cạnh một khối liền → trượt dọc không bị vấp). */
export function fenceRects(cols: number, rows: number): TileRect[] {
  return [
    { x: 0, y: 0, w: cols, h: 1 },
    { x: 0, y: rows - 1, w: cols, h: 1 },
    { x: 0, y: 1, w: 1, h: rows - 2 },
    { x: cols - 1, y: 1, w: 1, h: rows - 2 },
  ];
}

/** Tường nhà: trên, trái, phải, và tường dưới bị khoét ô cửa. */
export function houseWallRects(h: GardenLayout['house']): TileRect[] {
  const bottom = h.y + h.h - 1;
  const rects: TileRect[] = [
    { x: h.x, y: h.y, w: h.w, h: 1 },
    { x: h.x, y: h.y + 1, w: 1, h: h.h - 2 },
    { x: h.x + h.w - 1, y: h.y + 1, w: 1, h: h.h - 2 },
  ];
  const leftW = h.doorX - h.x;
  const rightX = h.doorX + h.doorW;
  if (leftW > 0) rects.push({ x: h.x, y: bottom, w: leftW, h: 1 });
  if (rightX < h.x + h.w) rects.push({ x: rightX, y: bottom, w: h.x + h.w - rightX, h: 1 });
  return rects;
}

/** Mọi vật cản, theo ô. Cây tính là 1 ô (hộp va chạm thật nhỏ hơn — xem treeTrunkHitbox). */
export function solids(layout: GardenLayout): Solid[] {
  return [
    ...fenceRects(layout.cols, layout.rows).map((rect) => ({ kind: 'fence' as const, rect })),
    ...houseWallRects(layout.house).map((rect) => ({ kind: 'wall' as const, rect })),
    { kind: 'bed', rect: layout.bed },
    { kind: 'pond', rect: layout.pond },
    ...layout.trees.map(([x, y]) => ({ kind: 'tree' as const, rect: { x, y, w: 1, h: 1 } })),
  ];
}

/** Lưới chặn [y][x]: true = ô có vật cản. */
export function blockedGrid(layout: GardenLayout): boolean[][] {
  const grid = Array.from({ length: layout.rows }, () => new Array<boolean>(layout.cols).fill(false));
  for (const { rect } of solids(layout)) {
    for (let y = rect.y; y < rect.y + rect.h; y++) {
      for (let x = rect.x; x < rect.x + rect.w; x++) {
        if (grid[y] && x >= 0 && x < layout.cols) grid[y][x] = true;
      }
    }
  }
  return grid;
}

/** Có đường đi (4 hướng) giữa hai ô không bị chặn không? Dùng để test bố cục. */
export function isReachable(grid: boolean[][], from: { x: number; y: number }, to: { x: number; y: number }): boolean {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  const key = (x: number, y: number) => y * cols + x;
  if (grid[from.y]?.[from.x] !== false || grid[to.y]?.[to.x] !== false) return false;
  const seen = new Set<number>([key(from.x, from.y)]);
  const queue: [number, number][] = [[from.x, from.y]];
  while (queue.length > 0) {
    const [x, y] = queue.shift()!;
    if (x === to.x && y === to.y) return true;
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= cols || ny >= rows || grid[ny][nx]) continue;
      const k = key(nx, ny);
      if (seen.has(k)) continue;
      seen.add(k);
      queue.push([nx, ny]);
    }
  }
  return false;
}

/** Ô chứa điểm (px). */
export function tileOf(px: number, py: number, tileSize: number): { x: number; y: number } {
  return { x: Math.floor(px / tileSize), y: Math.floor(py / tileSize) };
}

export function rectsOverlap(a: TileRect, b: TileRect): boolean {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}
