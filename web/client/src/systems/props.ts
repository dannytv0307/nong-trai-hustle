// T-024: đặt vật thể (nhà, quầy hạt, thúng bán, cây, rào…) theo `public/assets/art/props/props.json` — file art-director
// viết kèm ảnh: kích thước ảnh, chân đế va chạm (ô), điểm cửa, chỗ đứng người bán… Code ĐỌC số từ file này, không chép
// lại → art đổi ảnh (vd gen lại rào dọc cùng tên file) chỉ cần sửa props.json. Thuần TS để test.
//
// Quy ước của props.json:
// - ảnh vẽ với setOrigin(0.5, 1) — tâm-đáy ảnh;
// - `foot` (ô) tính từ góc DƯỚI-TRÁI của ảnh, x sang phải, y LÊN trên; `foot: null` = đi xuyên;
// - điểm `px` tính từ góc TRÊN-TRÁI của ảnh.
// Trong bản đồ (gardenLayout.json) mỗi vật ghi vị trí Ô TRÊN-TRÁI của chân đế — chân đế luôn khớp lưới ô, còn ảnh có thể
// rộng lẻ ô (vd cây nhãn 224 px = 3,5 ô) nên lấy chân đế làm mốc.
import type { TileRect } from './garden';

// props.json nằm trong public/ (art-director đặt cạnh ảnh). Nạp lúc build bằng import.meta.glob (eager) — import thẳng
// file trong public/ thì Vite cảnh báo mỗi lần nạp lại; glob thì không, mà sửa props.json vẫn tự nạp lại khi dev.
const PROPS_FILES = import.meta.glob('../../public/assets/art/props/props.json', { eager: true, import: 'default' });
const propsJson = Object.values(PROPS_FILES)[0] ?? {};

export interface PropFoot {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface PropSpec {
  /** Kích thước ảnh [rộng, cao] (px). */
  size: [number, number];
  foot?: PropFoot | null;
  door?: { px: [number, number]; tiles: PropFoot };
  porchBed?: { px: [number, number] };
  sellerSpot?: { px: [number, number] };
  click?: string;
}

const PROPS = propsJson as unknown as Record<string, PropSpec | string>;

/** Thông số một vật theo tên file (không đuôi), vd `house-hero`. Không có trong props.json → lỗi (sai tên trong bản đồ). */
export function propSpec(name: string): PropSpec {
  const spec = PROPS[name];
  if (!spec || typeof spec === 'string' || !Array.isArray(spec.size)) throw new Error(`props.json không có mục "${name}"`);
  return spec;
}

/** Có mục trong props.json không (để nạp ảnh / kiểm test). */
export function hasPropSpec(name: string): boolean {
  const spec = PROPS[name];
  return !!spec && typeof spec !== 'string' && Array.isArray(spec.size);
}

/** Vị trí ảnh trong thế giới (px): tâm-đáy (đặt với origin 0.5, 1) + mép trái/trên + cỡ. */
export interface PropPlacement {
  x: number;
  bottom: number;
  left: number;
  top: number;
  width: number;
  height: number;
}

/** Chân đế dùng làm mốc đặt (vật đi xuyên không có chân đế → coi như ô 1×1 ở giữa-đáy ảnh). */
function anchorFoot(spec: PropSpec, tileSize: number): PropFoot {
  if (spec.foot) return spec.foot;
  const wTiles = spec.size[0] / tileSize;
  return { x: (wTiles - 1) / 2, y: 0, w: 1, h: 1 };
}

/**
 * Ảnh của vật có chân đế bắt đầu ở ô (footX, footY) (góc trên-trái chân đế): mép trái ảnh = footX − foot.x ô,
 * đáy ảnh = đáy chân đế + foot.y ô (foot.y đo từ đáy ảnh LÊN).
 */
export function propPlacement(name: string, footX: number, footY: number, tileSize: number): PropPlacement {
  const spec = propSpec(name);
  const foot = anchorFoot(spec, tileSize);
  const [width, height] = spec.size;
  const left = (footX - foot.x) * tileSize;
  const bottom = (footY + foot.h + foot.y) * tileSize;
  return { x: left + width / 2, bottom, left, top: bottom - height, width, height };
}

/** Chân đế va chạm trong thế giới (ô); null nếu vật đi xuyên. */
export function propFootRect(name: string, footX: number, footY: number): TileRect | null {
  const foot = propSpec(name).foot;
  return foot ? { x: footX, y: footY, w: foot.w, h: foot.h } : null;
}

/** Vùng ô phủ trọn ảnh (vùng click "cả ảnh"): mọi ô mà ảnh chạm tới. */
export function propImageTiles(name: string, footX: number, footY: number, tileSize: number): TileRect {
  const p = propPlacement(name, footX, footY, tileSize);
  const x0 = Math.floor(p.left / tileSize + 1e-6);
  const y0 = Math.floor(p.top / tileSize + 1e-6);
  const x1 = Math.ceil((p.left + p.width) / tileSize - 1e-6);
  const y1 = Math.ceil(p.bottom / tileSize - 1e-6);
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

/** Một điểm px trong ảnh (gốc trên-trái ảnh) → toạ độ thế giới (px). */
export function propPoint(name: string, footX: number, footY: number, tileSize: number, px: readonly [number, number]): { x: number; y: number } {
  const p = propPlacement(name, footX, footY, tileSize);
  return { x: p.left + px[0], y: p.top + px[1] };
}

/** T-093: nền phòng trong nhà (props.json `_interior`) — cỡ ảnh, sàn đi được, khe cửa, chỗ xuất hiện, chỗ treo nón, vị trí gợi ý. */
export interface InteriorSpec {
  file: string;
  size: [number, number];
  /** Sàn đi được [x0, y0, x1, y1] (px trong ảnh) — chân nhân vật trong vùng này. */
  floor: { px: [number, number, number, number] };
  /** Khe cửa [x0, y0, x1, y1] + chỗ đứng khi vừa vào. */
  door: { px: [number, number, number, number]; spawn: [number, number] };
  wallDecor?: { px: [number, number, number, number] };
  suggested?: Record<string, [number, number] | string>;
}

/** Thông số nền phòng trong nhà. Thiếu / sai hình dạng → lỗi ngay lúc nạp (art đổi file thì sửa props.json). */
export function interiorSpec(): InteriorSpec {
  const spec = (propsJson as Record<string, unknown>)._interior as InteriorSpec | undefined;
  if (!spec || !Array.isArray(spec.size) || !Array.isArray(spec.floor?.px) || !Array.isArray(spec.door?.px)) {
    throw new Error('props.json thiếu mục "_interior" (nền phòng trong nhà)');
  }
  return spec;
}

/** Điểm `fire` / `smoke` (px trong ảnh) của bếp — null nếu props.json không ghi. */
export function propMarker(name: string, marker: 'fire' | 'smoke'): [number, number] | null {
  const spec = propSpec(name) as PropSpec & Partial<Record<'fire' | 'smoke', { px: [number, number] }>>;
  return spec[marker]?.px ?? null;
}
