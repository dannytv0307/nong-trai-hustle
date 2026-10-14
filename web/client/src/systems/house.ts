// T-093: cảnh trong nhà {ten} — bố cục phòng + luật vào / ra cửa + vật tương tác (giường, rương, bếp, hũ gạo, nón ông nội).
// Thuần TS → test được.
//
// Cách làm: phòng là một "khu" nằm CÙNG thế giới Phaser với Vườn nhưng đặt xa hẳn bên dưới bản đồ Vườn (HOUSE_GAP_TILES ô) —
// camera chỉ nhìn một khu một lúc (giới hạn camera + giới hạn vật lý theo khu), nên người chơi không bao giờ thấy hai khu
// cùng lúc. Nhờ vậy mọi thứ đang có (đồng hồ, Sức, gùi, bong bóng, chuỗi đêm, tự lưu…) chạy y nguyên trong nhà, không phải
// chép sang scene khác.
//
// Số đo phòng (sàn đi được, khe cửa, chỗ xuất hiện) đọc từ props.json `_interior` (art-director đo trên ảnh); vị trí đồ đạc
// ở data/houseLayout.json. Toạ độ trong hai file đó là px TRONG ẢNH PHÒNG; ở đây cộng gốc khu (`origin`) ra toạ độ thế giới.
import houseJson from '../data/houseLayout.json';
import type { Box, TileRect } from './garden';
import { createNavGrid, type NavGrid } from './pathfind';
import { interiorSpec, propSpec } from './props';

/** Vật tương tác trong nhà. */
export type HouseTarget = 'bed' | 'chest' | 'stove' | 'riceJar' | 'grandpaHat';
export const HOUSE_TARGETS: readonly HouseTarget[] = ['bed', 'chest', 'stove', 'riceJar', 'grandpaHat'];

/** Hình chữ nhật theo px (thế giới). */
export interface PxRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface HouseObject {
  id: HouseTarget;
  /** Tên ảnh (props.json). */
  prop: string;
  /** Điểm neo ảnh (thế giới) + origin của ảnh (mặc định tâm-đáy 0.5, 1). */
  x: number;
  y: number;
  originX: number;
  originY: number;
  /** Cả ảnh (thế giới) — vùng click, viền khi trỏ chuột. */
  image: PxRect;
  /** Chân đế va chạm (thế giới); null = đi xuyên (nón treo vách). */
  foot: PxRect | null;
  /** Vùng tính "đứng cạnh / trong tầm": chân đế; vật treo vách thì dải tường từ đáy ảnh xuống mép sàn. */
  reach: PxRect;
  /** Bảng tên nhỏ trên vật (null = không). */
  label: string | null;
  /** depth = đáy ảnh (như đồ vật Vườn). */
  depth: number;
}

export interface HouseLayout {
  /** Góc trên-trái ảnh nền phòng trong thế giới. */
  origin: { x: number; y: number };
  /** Cả ảnh nền (thế giới) = vùng camera trong nhà. */
  bounds: PxRect;
  /** Sàn đi được (thế giới) = giới hạn vật lý khi ở trong nhà (chân không ra khỏi đây). */
  floor: PxRect;
  /** Khe cửa: đứng sát mép dưới sàn với tâm chân trong [x0, x1] + bấm đi xuống = ra ngoài. */
  exit: { x0: number; x1: number };
  /** T-096: khung cửa trong ảnh phòng (thế giới, props.json `_interior.door.px`) — click vào đây = đi ra cửa rồi ra ngoài. */
  doorRect: PxRect;
  /** Chỗ đứng khi vừa vào nhà. */
  spawn: { x: number; y: number };
  /** Chỗ đứng khi thức dậy (cạnh giường). */
  wakeSpot: { x: number; y: number };
  objects: HouseObject[];
}

/** Phòng đặt cách mép dưới bản đồ Vườn bấy nhiêu ô (đủ xa để camera Vườn không bao giờ lộ phòng). */
export const HOUSE_GAP_TILES = 4;

/** Gốc khu nhà trong thế giới: ngay dưới bản đồ Vườn (cols × rows ô) + HOUSE_GAP_TILES ô. */
export function houseOrigin(gardenRows: number, tileSize: number): { x: number; y: number } {
  return { x: 0, y: (gardenRows + HOUSE_GAP_TILES) * tileSize };
}

interface HouseLayoutData {
  objects: { id: string; prop: string; at: [number, number]; label?: string | null }[];
  wakeSpot: [number, number];
  exitX: [number, number];
}

/** Cỡ ảnh nền phòng (px) — để kiểm toạ độ save trong nhà. */
export function houseSize(): { width: number; height: number } {
  const [width, height] = interiorSpec().size;
  return { width, height };
}

/** Dựng bố cục phòng (thế giới) từ props.json + houseLayout.json, gốc khu tại `origin`. */
export function resolveHouseLayout(origin: { x: number; y: number }, tileSize: number, data: HouseLayoutData = houseJson as unknown as HouseLayoutData): HouseLayout {
  const spec = interiorSpec();
  const ox = origin.x;
  const oy = origin.y;
  const [fx0, fy0, fx1, fy1] = spec.floor.px;
  const floor: PxRect = { x: ox + fx0, y: oy + fy0, w: fx1 - fx0, h: fy1 - fy0 };
  const objects = data.objects.map((o): HouseObject => {
    if (!(HOUSE_TARGETS as readonly string[]).includes(o.id)) throw new Error(`houseLayout.json: vật lạ "${o.id}"`);
    const ps = propSpec(o.prop) as ReturnType<typeof propSpec> & { origin?: [number, number] };
    const [w, h] = ps.size;
    const [originX, originY] = ps.origin ?? [0.5, 1];
    const x = ox + o.at[0];
    const y = oy + o.at[1];
    const image: PxRect = { x: x - w * originX, y: y - h * originY, w, h };
    const bottom = image.y + image.h;
    // Chân đế (ô) đo từ góc DƯỚI-TRÁI ảnh, y lên trên (quy ước props.json).
    const foot: PxRect | null = ps.foot
      ? { x: image.x + ps.foot.x * tileSize, y: bottom - (ps.foot.y + ps.foot.h) * tileSize, w: ps.foot.w * tileSize, h: ps.foot.h * tileSize }
      : null;
    const reach: PxRect = foot ?? { x: image.x, y: image.y, w: image.w, h: Math.max(image.h, floor.y - image.y) };
    return { id: o.id as HouseTarget, prop: o.prop, x, y, originX, originY, image, foot, reach, label: o.label ?? null, depth: bottom };
  });
  return {
    origin: { x: ox, y: oy },
    bounds: { x: ox, y: oy, w: spec.size[0], h: spec.size[1] },
    floor,
    exit: { x0: ox + data.exitX[0], x1: ox + data.exitX[1] },
    doorRect: { x: ox + spec.door.px[0], y: oy + spec.door.px[1], w: spec.door.px[2] - spec.door.px[0], h: spec.door.px[3] - spec.door.px[1] },
    spawn: { x: ox + spec.door.spawn[0], y: oy + spec.door.spawn[1] },
    wakeSpot: { x: ox + data.wakeSpot[0], y: oy + data.wakeSpot[1] },
    objects,
  };
}

export function houseObject(h: HouseLayout, id: HouseTarget): HouseObject {
  const o = h.objects.find((k) => k.id === id);
  if (!o) throw new Error(`Trong nhà không có "${id}"`);
  return o;
}

const inRect = (r: PxRect, px: number, py: number): boolean => px >= r.x && px < r.x + r.w && py >= r.y && py < r.y + r.h;

/** Khoảng cách (px) từ điểm tới mép gần nhất của hình chữ nhật (0 nếu điểm nằm trong). */
export function distanceToRect(r: PxRect, px: number, py: number): number {
  const dx = Math.max(r.x - px, 0, px - (r.x + r.w));
  const dy = Math.max(r.y - py, 0, py - (r.y + r.h));
  return Math.hypot(dx, dy);
}

/** Vật dưới con trỏ (ảnh chứa điểm); chồng nhau thì lấy vật vẽ trước mặt (depth lớn hơn). null nếu không trúng vật nào. */
export function houseTargetAt(h: HouseLayout, px: number, py: number): HouseTarget | null {
  let best: HouseObject | null = null;
  for (const o of h.objects) if (inRect(o.image, px, py) && (!best || o.depth > best.depth)) best = o;
  return best?.id ?? null;
}

/** Vật trong tầm (px) tính từ điểm (tâm chân) tới mép vùng `reach` của vật. */
export function houseTargetInReach(h: HouseLayout, id: HouseTarget, px: number, py: number, rangePx: number): boolean {
  return distanceToRect(houseObject(h, id).reach, px, py) <= rangePx;
}

/** Vật gần nhất trong tầm phím F (px tới mép `reach`), null nếu không đứng cạnh vật nào. */
export function nearestHouseTarget(h: HouseLayout, px: number, py: number, rangePx: number): HouseTarget | null {
  let best: HouseTarget | null = null;
  let bestD = Number.POSITIVE_INFINITY;
  for (const o of h.objects) {
    const d = distanceToRect(o.reach, px, py);
    if (d <= rangePx && d < bestD) {
      best = o.id;
      bestD = d;
    }
  }
  return best;
}

/**
 * Vào nhà (Vườn): đang bấm đi LÊN, mép trên hộp chân chạm mép dưới bậc thềm (ô cửa thuộc chân đế nhà — vật cản, nên chân
 * dừng đúng ở đó), và tâm chân nằm trong bề ngang cửa. `touchPx` = sai số "chạm".
 */
export function shouldEnterHouse(door: TileRect, tileSize: number, feet: Box, dirY: number, touchPx: number): boolean {
  if (dirY >= 0) return false;
  const doorBottom = (door.y + door.h) * tileSize;
  const cx = (feet.left + feet.right) / 2;
  return Math.abs(feet.top - doorBottom) <= touchPx && cx >= door.x * tileSize && cx <= (door.x + door.w) * tileSize;
}

/** Ra khỏi nhà: đang bấm đi XUỐNG, mép dưới hộp chân chạm mép dưới sàn, tâm chân trong khe cửa. */
export function shouldExitHouse(h: HouseLayout, feet: Box, dirY: number, touchPx: number): boolean {
  if (dirY <= 0) return false;
  const cx = (feet.left + feet.right) / 2;
  return feet.bottom >= h.floor.y + h.floor.h - touchPx && cx >= h.exit.x0 && cx <= h.exit.x1;
}

/** Chỗ đứng khi vừa ra khỏi nhà: ô sân ngay dưới bậc thềm, giữa bề ngang cửa (px thế giới Vườn). */
export function houseExitSpot(door: TileRect, tileSize: number): { x: number; y: number } {
  return { x: (door.x + door.w / 2) * tileSize, y: (door.y + door.h) * tileSize + tileSize / 2 };
}

/**
 * Hộp chân (giữa (x, y), cỡ w × h) đứng hợp lệ trong nhà: nằm trọn trong sàn và không đè chân đế đồ đạc nào.
 * Dùng khi nạp save trong nhà (đồ đạc dời chỗ sau khi lưu → về chỗ cửa).
 */
export function isFreeHouseSpot(h: HouseLayout, x: number, y: number, w: number, hh: number): boolean {
  const box: PxRect = { x: x - w / 2, y: y - hh / 2, w, h: hh };
  const f = h.floor;
  if (box.x < f.x || box.y < f.y || box.x + box.w > f.x + f.w || box.y + box.h > f.y + f.h) return false;
  return !h.objects.some((o) => o.foot && box.x < o.foot.x + o.foot.w && o.foot.x < box.x + box.w && box.y < o.foot.y + o.foot.h && o.foot.y < box.y + box.h);
}

/** T-096: điểm khung cửa (click) chứa (px, py) không. */
export function isHouseDoorAt(h: HouseLayout, px: number, py: number): boolean {
  return inRect(h.doorRect, px, py);
}

/**
 * T-096: chỗ đứng để ra cửa (click khung cửa): giữa khe cửa, sát tường trước (hộp chân cao `footH` cách mép dưới sàn
 * `gapPx` px). Tới đây là ra ngoài luôn, không phải bấm S.
 */
export function houseExitStandSpot(h: HouseLayout, footH: number, gapPx = 2): { x: number; y: number } {
  return { x: (h.exit.x0 + h.exit.x1) / 2, y: h.floor.y + h.floor.h - footH / 2 - gapPx };
}

/**
 * T-096: lưới tìm đường trong nhà (ô `cell` px, phủ cả ảnh phòng): ô đi được = hộp chân (w × hh) đặt ở TÂM ô đứng hợp lệ
 * (trong sàn, không đè chân đế đồ đạc — isFreeHouseSpot). Phòng không khớp lưới 64 px của Vườn nên dùng ô nhỏ hơn.
 */
export function houseNavGrid(h: HouseLayout, cell: number, w: number, hh: number): NavGrid {
  const cols = Math.ceil(h.bounds.w / cell);
  const rows = Math.ceil(h.bounds.h / cell);
  const g = createNavGrid(cols, rows, cell, h.bounds.x, h.bounds.y);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const cx = h.bounds.x + (x + 0.5) * cell;
      const cy = h.bounds.y + (y + 0.5) * cell;
      g.blocked[y * cols + x] = isFreeHouseSpot(h, cx, cy, w, hh) ? 0 : 1;
    }
  }
  return g;
}
