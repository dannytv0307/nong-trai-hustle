// Bố cục HUD (hệ toạ độ 1920×1080 của UI, không theo camera): hotbar giữa dưới màn, nút gùi, cửa sổ gùi.
// Thuần TS — HUD dùng để vẽ, GardenScene dùng để biết con trỏ đang nằm trên ô nào (không click xuyên xuống ruộng),
// e2e dùng để rê chuột đúng ô. Đây là số bố cục giao diện, không phải thông số gameplay.
import { gameConfig } from '../config/gameConfig';

export interface Rect {
  /** Góc trên-trái. */
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Hotbar: cạnh ô, khoảng hở giữa ô, cách mép dưới màn (px). */
export const HOTBAR = { slot: 92, gap: 10, bottom: 28 } as const;
/** Nút "Gùi" bên phải hotbar: rộng, cách hotbar. */
export const BAG_BUTTON = { w: 92, gap: 22 } as const;
/** Cửa sổ gùi: ô, khoảng hở, lề trong, chiều cao phần tiêu đề, khoảng cách thêm giữa hàng hotbar và hàng dưới. */
export const BAG_WINDOW = { slot: 96, gap: 10, pad: 36, header: 92, footer: 64, rowSplit: 18 } as const;

const W = gameConfig.gameWidth;
const H = gameConfig.gameHeight;

const inside = (r: Rect, px: number, py: number): boolean => px >= r.x && px < r.x + r.w && py >= r.y && py < r.y + r.h;

/** Khung bao cả thanh hotbar. */
export function hotbarRect(slots = gameConfig.hotbarSlots): Rect {
  const w = slots * HOTBAR.slot + (slots - 1) * HOTBAR.gap;
  return { x: Math.round((W - w) / 2), y: H - HOTBAR.bottom - HOTBAR.slot, w, h: HOTBAR.slot };
}

/** Ô hotbar thứ i (0…slots-1). */
export function hotbarSlotRect(i: number, slots = gameConfig.hotbarSlots): Rect {
  const bar = hotbarRect(slots);
  return { x: bar.x + i * (HOTBAR.slot + HOTBAR.gap), y: bar.y, w: HOTBAR.slot, h: HOTBAR.slot };
}

/** Ô hotbar dưới điểm (px, py), -1 nếu không trúng ô nào (khe giữa các ô cũng là -1). */
export function hotbarSlotAt(px: number, py: number, slots = gameConfig.hotbarSlots): number {
  for (let i = 0; i < slots; i++) if (inside(hotbarSlotRect(i, slots), px, py)) return i;
  return -1;
}

/** Nút "Gùi" (bấm để mở cửa sổ gùi; icon đồ hái bay vào đây khi đồ rơi xuống hàng dưới của gùi). */
export function bagButtonRect(slots = gameConfig.hotbarSlots): Rect {
  const bar = hotbarRect(slots);
  return { x: bar.x + bar.w + BAG_BUTTON.gap, y: bar.y, w: BAG_BUTTON.w, h: HOTBAR.slot };
}

/** Con trỏ có đang nằm trên thanh hotbar / nút gùi không (để click không xuyên xuống ruộng). */
export function isOverHud(px: number, py: number, slots = gameConfig.hotbarSlots): boolean {
  const bar = hotbarRect(slots);
  const pad = HOTBAR.gap;
  const zone: Rect = { x: bar.x - pad, y: bar.y - pad, w: bar.w + pad * 2, h: bar.h + pad * 2 };
  return inside(zone, px, py) || inside(bagButtonRect(slots), px, py);
}

/** Số hàng của cửa sổ gùi. */
export const bagRows = (slotCount: number, perRow = gameConfig.hotbarSlots): number => Math.ceil(slotCount / perRow);

/** Khung cửa sổ gùi (giữa màn). */
export function bagPanelRect(slotCount: number, perRow = gameConfig.hotbarSlots): Rect {
  const rows = bagRows(slotCount, perRow);
  const gridW = perRow * BAG_WINDOW.slot + (perRow - 1) * BAG_WINDOW.gap;
  const gridH = rows * BAG_WINDOW.slot + (rows - 1) * BAG_WINDOW.gap + (rows > 1 ? BAG_WINDOW.rowSplit : 0);
  const w = gridW + BAG_WINDOW.pad * 2;
  const h = gridH + BAG_WINDOW.header + BAG_WINDOW.footer;
  return { x: Math.round((W - w) / 2), y: Math.round((H - h) / 2) - 40, w, h };
}

/** Ô thứ i của cửa sổ gùi (hàng đầu = hotbar, tách hàng dưới một khoảng `rowSplit`). */
export function bagSlotRect(i: number, slotCount: number, perRow = gameConfig.hotbarSlots): Rect {
  const panel = bagPanelRect(slotCount, perRow);
  const row = Math.floor(i / perRow);
  const col = i % perRow;
  return {
    x: panel.x + BAG_WINDOW.pad + col * (BAG_WINDOW.slot + BAG_WINDOW.gap),
    y: panel.y + BAG_WINDOW.header + row * (BAG_WINDOW.slot + BAG_WINDOW.gap) + (row > 0 ? BAG_WINDOW.rowSplit : 0),
    w: BAG_WINDOW.slot,
    h: BAG_WINDOW.slot,
  };
}

/** Ô gùi dưới điểm (px, py), -1 nếu không trúng ô nào. */
export function bagSlotAt(px: number, py: number, slotCount: number, perRow = gameConfig.hotbarSlots): number {
  for (let i = 0; i < slotCount; i++) if (inside(bagSlotRect(i, slotCount, perRow), px, py)) return i;
  return -1;
}

/** Thanh Sức góc trên trái (GDD §11): lề, rộng/cao khung, nhãn "Sức" bên trái thanh. */
export const STAMINA_BAR = { margin: 32, w: 420, h: 56, label: 78, pad: 8 } as const;

/** Khung thanh Sức (gồm nhãn). */
export function staminaPanelRect(): Rect {
  return { x: STAMINA_BAR.margin, y: STAMINA_BAR.margin, w: STAMINA_BAR.w, h: STAMINA_BAR.h };
}

/** Phần ruột thanh (chỗ tô màu theo tỷ lệ Sức), nằm bên phải nhãn "Sức". */
export function staminaFillRect(): Rect {
  const p = staminaPanelRect();
  return { x: p.x + STAMINA_BAR.label, y: p.y + STAMINA_BAR.pad, w: p.w - STAMINA_BAR.label - STAMINA_BAR.pad, h: p.h - STAMINA_BAR.pad * 2 };
}

/** Đồng hồ góc trên phải (GDD §11, T-005): lề, rộng/cao khung, cỡ icon mặt trời/trăng. */
export const CLOCK_PANEL = { margin: 32, w: 330, h: 124, icon: 48 } as const;

/** Khung đồng hồ + dòng "Ngày 1 · Mùa nắng" (bám góc trên phải). */
export function clockPanelRect(): Rect {
  return { x: W - CLOCK_PANEL.margin - CLOCK_PANEL.w, y: CLOCK_PANEL.margin, w: CLOCK_PANEL.w, h: CLOCK_PANEL.h };
}

/** Cửa sổ Tạm dừng (Esc, T-005): rộng/cao khung, nút "Tiếp tục". */
export const PAUSE_WINDOW = { w: 620, h: 330, buttonW: 300, buttonH: 84 } as const;

/** Khung cửa sổ Tạm dừng (giữa màn). */
export function pausePanelRect(): Rect {
  return { x: Math.round((W - PAUSE_WINDOW.w) / 2), y: Math.round((H - PAUSE_WINDOW.h) / 2), w: PAUSE_WINDOW.w, h: PAUSE_WINDOW.h };
}

/** Nút "Tiếp tục" trong cửa sổ Tạm dừng. */
export function pauseResumeButtonRect(): Rect {
  const p = pausePanelRect();
  return {
    x: Math.round(p.x + (p.w - PAUSE_WINDOW.buttonW) / 2),
    y: p.y + 170,
    w: PAUSE_WINDOW.buttonW,
    h: PAUSE_WINDOW.buttonH,
  };
}

/** Điểm (px, py) có nằm trong hình chữ nhật r không. */
export const rectContains = inside;

/** Gợi ý phím góc dưới phải: lề, khoảng cách dòng chính (dài) nằm TRÊN nút gùi. */
export const KEY_HINT = { margin: 32, bottom: 28, aboveBagGap: 14 } as const;

/**
 * Đáy dòng gợi ý chính ("WASD đi · Click làm · …" — dài, không vừa khe giữa nút gùi và mép phải) = ngay trên nút gùi.
 * Các dòng ngắn (chuột phải ăn, phím thử) nằm dưới, ở khe bên phải nút gùi.
 */
export function keyHintMainBottom(): number {
  return bagButtonRect().y - KEY_HINT.aboveBagGap;
}

/** Bề rộng tối đa cho các dòng gợi ý ngắn bên phải nút gùi (không đè nút). */
export function keyHintSideMaxWidth(): number {
  const b = bagButtonRect();
  return W - KEY_HINT.margin - (b.x + b.w) - 16;
}
