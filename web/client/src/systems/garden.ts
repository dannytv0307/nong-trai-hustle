// Bố cục bản đồ Vườn (T-001) ở dạng dữ liệu thuần: đâu là nhà, rào, ao, cây, ruộng.
// Scene dựa vào đây để vẽ hình + tạo hộp va chạm; test dựa vào đây để kiểm
// "đi được tới giường, tới ruộng, tới thùng bán" mà không cần mở trình duyệt.
// T-024: nhà, thúng bán, quầy hạt, cọc rào ghi trong gardenLayout.json dạng { prop, x, y } (ô trên-trái của chân đế);
// cỡ ảnh, chân đế, điểm cửa, chỗ người bán đọc từ props/props.json (systems/props.ts) → ở đây đổi ra TileRect.
import layoutJson from '../data/gardenLayout.json';
import { gameConfig } from '../config/gameConfig';
import { propFootRect, propImageTiles, propPoint, propSpec } from './props';
import type { FenceLine, FenceStyle } from './propArt';

/** Hình chữ nhật theo ô. */
export interface TileRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Một vật có hình thật: tên ảnh trong props.json + ô trên-trái của chân đế. */
export interface PropAt {
  prop: string;
  x: number;
  y: number;
}

/** Bố cục như trong gardenLayout.json. */
export interface GardenLayoutData {
  cols: number;
  rows: number;
  spawn: { x: number; y: number };
  house: PropAt;
  bed: TileRect;
  wakeSpot: { x: number; y: number };
  plots: TileRect;
  path: TileRect;
  yard?: TileRect;
  pathBranches?: TileRect[];
  pond: TileRect;
  sellBox: PropAt;
  seedStall: PropAt;
  stakes?: PropAt[];
  borderFence?: FenceStyle;
  fences?: FenceLine[];
  tree: { trunk: string; canopy: string };
  trees: [number, number][];
}

export interface GardenLayout {
  cols: number;
  rows: number;
  /** Vị trí chân nhân vật lúc vào Vườn (ô, cho phép số lẻ). */
  spawn: { x: number; y: number };
  /** T-024: chân đế nhà {ten} (vật cản liền khối; mái phía trên đi sau được). */
  house: TileRect;
  /** Ảnh + mốc đặt nhà (props.json `house-hero`). */
  houseProp: PropAt;
  /** Ô bậc thềm cửa (thuộc chân đế) — T-093 dùng: đứng ô ngay dưới + đi lên = vào nhà. */
  houseDoor: TileRect;
  /** Điểm cửa (px thế giới, props.json `door.px`). */
  houseDoorPoint: { x: number; y: number };
  /** Chõng tre trên hiên (T-007 / T-024 là giường tạm). T-093: giường thật ở trong nhà — chõng chỉ nhắc "vào nhà mà ngủ". */
  bed: TileRect;
  /** Ô cạnh chõng (T-007). T-093: không dùng nữa — thức dậy trong nhà (houseLayout.json `wakeSpot`). */
  wakeSpot: { x: number; y: number };
  /** Ruộng ban đầu (startPlots ô). */
  plots: TileRect;
  /** Lối đất nện từ cửa nhà xuống Đầu ngõ (chỉ trang trí, đi xuyên). */
  path: TileRect;
  /** T-021 (D-035): sân đất nện trước cửa, nối lối dọc với ruộng và thùng bán. */
  yard?: TileRect;
  /** T-021 (D-035): nhánh lối đất nện (vd tới sạp hạt). */
  pathBranches?: TileRect[];
  pond: TileRect;
  /** Thúng bán (T-006) — ô chân đế = vùng click (ảnh 1 ô). */
  sellBox: TileRect;
  sellBoxProp: PropAt;
  /** Quầy hạt (T-006, D-019 / D-037: chưa có người bán) — VÙNG CLICK = cả ảnh 3×2 ô. */
  seedStall: TileRect;
  /** Chân đế quầy hạt (vật cản): hàng ô dưới cùng. */
  seedStallFoot: TileRect;
  seedStallProp: PropAt;
  /** Chỗ chân người bán đứng sau quầy (px thế giới, props.json `sellerSpot`) — T-036. */
  sellerSpot: { x: number; y: number };
  /** Cọc rào mở ruộng (ẩn tới T-044). */
  stakes: PropAt[];
  /** Kiểu rào viền bản đồ. */
  borderFence: FenceStyle;
  /** Đoạn rào thêm bên trong (có va chạm). */
  fences: FenceLine[];
  tree: { trunk: string; canopy: string };
  /** Gốc cây [x, y] (ô). */
  trees: [number, number][];
}

/** Đổi bố cục JSON → TileRect (đọc chân đế / điểm cửa từ props.json). */
export function resolveLayout(d: GardenLayoutData, tileSize: number = gameConfig.tileSize): GardenLayout {
  const foot = (p: PropAt): TileRect => propFootRect(p.prop, p.x, p.y) ?? { x: p.x, y: p.y, w: 1, h: 1 };
  const house = foot(d.house);
  const houseSpec = propSpec(d.house.prop);
  const door = houseSpec.door;
  // door.tiles đo từ góc dưới-trái ảnh, y LÊN trên → hàng thế giới = hàng đáy chân đế − y − (h − 1).
  const houseDoor: TileRect = door
    ? { x: house.x + door.tiles.x, y: house.y + house.h - 1 - door.tiles.y - (door.tiles.h - 1), w: door.tiles.w, h: door.tiles.h }
    : { x: house.x + Math.floor(house.w / 2), y: house.y + house.h - 1, w: 1, h: 1 };
  const houseDoorPoint = door
    ? propPoint(d.house.prop, d.house.x, d.house.y, tileSize, door.px)
    : { x: (houseDoor.x + houseDoor.w / 2) * tileSize, y: (houseDoor.y + 1) * tileSize };
  const stallSpot = propSpec(d.seedStall.prop).sellerSpot;
  const seedStallFoot = foot(d.seedStall);
  return {
    cols: d.cols,
    rows: d.rows,
    spawn: d.spawn,
    house,
    houseProp: d.house,
    houseDoor,
    houseDoorPoint,
    bed: d.bed,
    wakeSpot: d.wakeSpot,
    plots: d.plots,
    path: d.path,
    yard: d.yard,
    pathBranches: d.pathBranches,
    pond: d.pond,
    sellBox: foot(d.sellBox),
    sellBoxProp: d.sellBox,
    seedStall: propImageTiles(d.seedStall.prop, d.seedStall.x, d.seedStall.y, tileSize),
    seedStallFoot,
    seedStallProp: d.seedStall,
    sellerSpot: stallSpot
      ? propPoint(d.seedStall.prop, d.seedStall.x, d.seedStall.y, tileSize, stallSpot.px)
      : { x: (seedStallFoot.x + seedStallFoot.w / 2) * tileSize, y: seedStallFoot.y * tileSize },
    stakes: d.stakes ?? [],
    borderFence: d.borderFence ?? 'tre',
    fences: d.fences ?? [],
    tree: d.tree,
    trees: d.trees,
  };
}

export const gardenLayout: GardenLayout = resolveLayout(layoutJson as unknown as GardenLayoutData);

export type SolidKind = 'fence' | 'wall' | 'bed' | 'pond' | 'tree' | 'sellBox' | 'seedStall';

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

/** Ô của một đoạn rào thêm. */
export function fenceLineRect(f: FenceLine): TileRect {
  return f.dir === 'h' ? { x: f.x, y: f.y, w: f.len, h: 1 } : { x: f.x, y: f.y, w: 1, h: f.len };
}

/** Mọi vật cản, theo ô. Cây tính là 1 ô (hộp va chạm thật nhỏ hơn — xem treeTrunkHitbox). T-006: thùng bán, sạp hạt. */
export function solids(layout: GardenLayout): Solid[] {
  return [
    ...fenceRects(layout.cols, layout.rows).map((rect) => ({ kind: 'fence' as const, rect })),
    ...layout.fences.map((f) => ({ kind: 'fence' as const, rect: fenceLineRect(f) })),
    { kind: 'wall', rect: layout.house },
    { kind: 'bed', rect: layout.bed },
    { kind: 'pond', rect: layout.pond },
    { kind: 'sellBox', rect: layout.sellBox },
    { kind: 'seedStall', rect: layout.seedStallFoot },
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

/**
 * Lưới vật cản cho lớp va chạm Tilemap: rào, tường, giường, ao, thùng bán, sạp hạt (KHÔNG gồm cây — cây dùng hộp gốc nhỏ).
 * Dùng Tilemap thay vì nhiều hộp nối nhau vì Phaser tự tắt "mặt trong" giữa hai ô chặn liền nhau
 * → đi trượt dọc tường không bị vấp ở chỗ nối (BUG-001).
 */
export function tileSolidGrid(layout: GardenLayout): boolean[][] {
  const noTrees: GardenLayout = { ...layout, trees: [] };
  return blockedGrid(noTrees);
}

// Kết quả cố định (không tạo object mới mỗi frame).
const NUDGE_NONE = Object.freeze({ x: 0, y: 0 });
const NUDGE_LEFT = Object.freeze({ x: -1, y: 0 });
const NUDGE_RIGHT = Object.freeze({ x: 1, y: 0 });
const NUDGE_UP = Object.freeze({ x: 0, y: -1 });
const NUDGE_DOWN = Object.freeze({ x: 0, y: 1 });

/** Hộp theo px (mép trái/trên/phải/dưới). */
export interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/**
 * "Nắn vào cửa" (corner nudge): đang đi thẳng vào vật cản mà chỉ lệch ≤ maxPx so với một khe trống
 * (ô cửa, khe giữa hai vật) thì trả về hướng trượt ngang/dọc để tự lọt vào khe.
 * Trả về {x, y} mỗi trục -1/0/1. Chỉ xét khi đi thẳng một trục (đi chéo đã tự trượt rồi).
 */
export function cornerNudge(
  grid: boolean[][],
  box: Box,
  dir: { x: number; y: number },
  tileSize: number,
  maxPx: number,
): Readonly<{ x: number; y: number }> {
  const blockedAt = (col: number, row: number) => grid[row]?.[col] ?? true;
  const EPS = 0.001;
  if (dir.y !== 0 && dir.x === 0) {
    const row = dir.y < 0 ? Math.floor((box.top - 1) / tileSize) : Math.floor((box.bottom + 1) / tileSize);
    const free = (l: number, r: number) => {
      for (let c = Math.floor(l / tileSize); c <= Math.floor((r - EPS) / tileSize); c++) if (blockedAt(c, row)) return false;
      return true;
    };
    if (free(box.left, box.right)) return NUDGE_NONE;
    for (let d = 1; d <= maxPx; d++) {
      if (free(box.left - d, box.right - d)) return NUDGE_LEFT;
      if (free(box.left + d, box.right + d)) return NUDGE_RIGHT;
    }
  } else if (dir.x !== 0 && dir.y === 0) {
    const col = dir.x < 0 ? Math.floor((box.left - 1) / tileSize) : Math.floor((box.right + 1) / tileSize);
    const free = (t: number, b: number) => {
      for (let r = Math.floor(t / tileSize); r <= Math.floor((b - EPS) / tileSize); r++) if (blockedAt(col, r)) return false;
      return true;
    };
    if (free(box.top, box.bottom)) return NUDGE_NONE;
    for (let d = 1; d <= maxPx; d++) {
      if (free(box.top - d, box.bottom - d)) return NUDGE_UP;
      if (free(box.top + d, box.bottom + d)) return NUDGE_DOWN;
    }
  }
  return NUDGE_NONE;
}

/**
 * T-096: ô (tx, ty) thuộc khung cửa nhà để click "vào nhà": các ô bậc thềm + một hàng ô ngay trên (khung cửa trong ảnh nhà).
 * Click ở đây (gần hay xa) = đi tới ô sân dưới bậc rồi vào nhà.
 */
export function isHouseDoorTile(layout: GardenLayout, tx: number, ty: number): boolean {
  const d = layout.houseDoor;
  return tx >= d.x && tx < d.x + d.w && ty >= d.y - 1 && ty < d.y + d.h;
}

/** T-096: vùng ô của khung cửa nhà (để vẽ viền khi trỏ chuột). */
export function houseDoorClickRect(layout: GardenLayout): TileRect {
  const d = layout.houseDoor;
  return { x: d.x, y: d.y - 1, w: d.w, h: d.h + 1 };
}
