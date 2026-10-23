// Bố cục HUD (hệ toạ độ 1920×1080 của UI, không theo camera): hotbar giữa dưới màn, nút gùi, cửa sổ gùi.
// Thuần TS — HUD dùng để vẽ, GardenScene dùng để biết con trỏ đang nằm trên ô nào (không click xuyên xuống ruộng),
// e2e dùng để rê chuột đúng ô. Đây là số bố cục giao diện, không phải thông số gameplay.
import { gameConfig } from '../config/gameConfig';
import { BAMBOO_BAR_HEIGHT, staminaBarGeometry, type Rect } from './uiSpec';

export type { Rect };

/** Hotbar: cạnh ô, khoảng hở giữa ô, cách mép dưới màn (px). */
export const HOTBAR = { slot: 92, gap: 10, bottom: 28 } as const;
/** Nút "Gùi" bên phải hotbar: rộng, cách hotbar. */
export const BAG_BUTTON = { w: 92, gap: 22 } as const;
/** Cửa sổ gùi: ô, khoảng hở, lề trong, chiều cao phần tiêu đề, khoảng cách thêm giữa hàng hotbar và hàng dưới. */
export const BAG_WINDOW = { slot: 96, gap: 10, pad: 40, header: 100, footer: 92, rowSplit: 18 } as const;

/**
 * T-092: tiêu đề cửa sổ giấy điệp (tâm dọc, cách mép trái/trên khung) và nút đóng (X) ở góc trên-phải — nằm đè mép khung
 * như ảnh mẫu (lệch ra ngoài `raise` px), cạnh `size` ≥ 76 px để chạm được trên màn cảm ứng.
 */
export const WINDOW_CHROME = { titleX: 60, titleY: 58, closeSize: 76, closeInset: 46, closeRaise: 26 } as const;

/** Nút đóng (X) của cửa sổ khung `p`. */
export function windowCloseRect(p: Rect): Rect {
  const s = WINDOW_CHROME.closeSize;
  return { x: p.x + p.w - WINDOW_CHROME.closeInset, y: p.y - WINDOW_CHROME.closeRaise, w: s, h: s };
}

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

/**
 * Thanh Sức góc trên trái (GDD §11, T-092): icon bắp tay (`icon`, vuông) ở góc + ống tre `hud-bamboo-bar` (3-slice cao
 * cố định 72) bên phải icon. Số theo ảnh mẫu T-091 (ui_mockup.py hud()).
 */
export const STAMINA_BAR = { margin: 24, icon: 84, barX: 92, barY: 34, barW: 400 } as const;

/** Khung bao cả cụm thanh Sức (icon + ống tre). */
export function staminaPanelRect(): Rect {
  const b = staminaBarRect();
  return { x: STAMINA_BAR.margin, y: STAMINA_BAR.margin, w: b.x + b.w - STAMINA_BAR.margin, h: STAMINA_BAR.icon };
}

/** Ống tre (hiển thị 1:1). */
export function staminaBarRect(): Rect {
  return { x: STAMINA_BAR.barX, y: STAMINA_BAR.barY, w: STAMINA_BAR.barW, h: BAMBOO_BAR_HEIGHT };
}

/** Phần ruột thanh = cửa sổ trong suốt của ống tre (ui.json `window`). */
export function staminaFillRect(): Rect {
  return staminaBarGeometry(staminaBarRect(), 1).window;
}

/**
 * Đồng hồ góc trên phải (GDD §11, T-092): bảng gỗ `hud-plank` (plankW × h) + đĩa gỗ `hud-clock-disc` (disc) đè mép trái
 * (tâm đĩa ở mép trái bảng), icon mặt trời / trăng (icon) giữa đĩa, icon mùa (season) cạnh giờ.
 */
export const CLOCK_PANEL = { margin: 30, plankW: 336, h: 128, disc: 128, icon: 80, season: 52 } as const;

/** Khung bao đồng hồ (gồm nửa đĩa thò ra trái bảng gỗ), bám góc trên phải. */
export function clockPanelRect(): Rect {
  const w = CLOCK_PANEL.plankW + CLOCK_PANEL.disc / 2;
  return { x: W - CLOCK_PANEL.margin - w, y: CLOCK_PANEL.margin, w, h: CLOCK_PANEL.h };
}

/** Bảng gỗ của đồng hồ (không gồm phần đĩa thò ra). */
export function clockPlankRect(): Rect {
  const c = clockPanelRect();
  return { x: c.x + CLOCK_PANEL.disc / 2, y: c.y, w: CLOCK_PANEL.plankW, h: CLOCK_PANEL.h };
}

/**
 * Cửa sổ Tạm dừng (Esc, T-005): rộng/cao khung, nút "Tiếp tục". T-008 thêm dòng "Đã lưu lúc…" (`savedLineY`) và nút
 * "Chơi lại từ đầu" (nhỏ hơn, dưới nút Tiếp tục). T-026 thêm 2 hàng âm lượng (Nhạc / Hiệu ứng: chữ + nút − + số % + nút +,
 * nút vuông 84 px chạm được) dưới nút Chơi lại — khung cao + rộng thêm. Các số y tính từ mép trên khung.
 */
export const PAUSE_WINDOW = {
  w: 680,
  h: 760,
  buttonW: 300,
  buttonH: 88,
  titleY: 92,
  subY: 150,
  savedLineY: 198,
  resumeY: 250,
  restartY: 358,
  restartW: 340,
  restartH: 84,
  /** T-026: đường kẻ + 2 hàng âm lượng (đỉnh hàng), cỡ nút −/+, chữ tên kênh (lề trái), nút − (lề trái), ô số % (rộng). */
  volumeRuleY: 474,
  volumeRowsY: [500, 598] as readonly [number, number],
  volumeButton: 84,
  volumeLabelX: 64,
  volumeMinusX: 316,
  volumeValueW: 132,
  escY: 716,
} as const;

/** Khung cửa sổ Tạm dừng (giữa màn). */
export function pausePanelRect(): Rect {
  return { x: Math.round((W - PAUSE_WINDOW.w) / 2), y: Math.round((H - PAUSE_WINDOW.h) / 2), w: PAUSE_WINDOW.w, h: PAUSE_WINDOW.h };
}

/** Nút "Tiếp tục" trong cửa sổ Tạm dừng. */
export function pauseResumeButtonRect(): Rect {
  const p = pausePanelRect();
  return {
    x: Math.round(p.x + (p.w - PAUSE_WINDOW.buttonW) / 2),
    y: p.y + PAUSE_WINDOW.resumeY,
    w: PAUSE_WINDOW.buttonW,
    h: PAUSE_WINDOW.buttonH,
  };
}

/** Nút "Chơi lại từ đầu" trong cửa sổ Tạm dừng (T-008). */
export function pauseRestartButtonRect(): Rect {
  const p = pausePanelRect();
  return {
    x: Math.round(p.x + (p.w - PAUSE_WINDOW.restartW) / 2),
    y: p.y + PAUSE_WINDOW.restartY,
    w: PAUSE_WINDOW.restartW,
    h: PAUSE_WINDOW.restartH,
  };
}

/** T-026: nút −/+ của hàng âm lượng: `music-down`, `music-up`, `sfx-down`, `sfx-up`. */
export type VolumeButtonId = 'music-down' | 'music-up' | 'sfx-down' | 'sfx-up';
export const VOLUME_BUTTONS: readonly VolumeButtonId[] = ['music-down', 'music-up', 'sfx-down', 'sfx-up'];

/** Kênh + hướng của nút âm lượng. */
export function volumeButtonChannel(id: VolumeButtonId): { channel: 'music' | 'sfx'; dir: 1 | -1 } {
  return { channel: id.startsWith('music') ? 'music' : 'sfx', dir: id.endsWith('up') ? 1 : -1 };
}

/** Đỉnh hàng âm lượng của kênh (0 = Nhạc, 1 = Hiệu ứng) — y tâm hàng = y + volumeButton/2. */
export function volumeRowY(channel: 'music' | 'sfx'): number {
  return pausePanelRect().y + PAUSE_WINDOW.volumeRowsY[channel === 'music' ? 0 : 1];
}

/** Nút −/+ âm lượng trong cửa sổ Tạm dừng. */
export function volumeButtonRect(id: VolumeButtonId): Rect {
  const p = pausePanelRect();
  const { channel, dir } = volumeButtonChannel(id);
  const b = PAUSE_WINDOW.volumeButton;
  const minusX = p.x + PAUSE_WINDOW.volumeMinusX;
  return { x: dir < 0 ? minusX : minusX + b + PAUSE_WINDOW.volumeValueW, y: volumeRowY(channel), w: b, h: b };
}

/** Tâm chữ "80%" giữa hai nút của hàng. */
export function volumeValueCenter(channel: 'music' | 'sfx'): { x: number; y: number } {
  const p = pausePanelRect();
  const b = PAUSE_WINDOW.volumeButton;
  return { x: p.x + PAUSE_WINDOW.volumeMinusX + b + PAUSE_WINDOW.volumeValueW / 2, y: volumeRowY(channel) + b / 2 };
}

/** Nút âm lượng dưới điểm (px, py), null nếu không trúng. */
export function volumeButtonAt(px: number, py: number): VolumeButtonId | null {
  for (const id of VOLUME_BUTTONS) if (inside(volumeButtonRect(id), px, py)) return id;
  return null;
}

/** Hộp xác nhận "Chơi lại từ đầu?" (T-008): nằm trên cửa sổ Tạm dừng, 2 nút Có / Không. */
export const RESTART_CONFIRM = { w: 760, h: 360, buttonW: 240, buttonH: 84, gap: 40 } as const;

export function restartConfirmRect(): Rect {
  return { x: Math.round((W - RESTART_CONFIRM.w) / 2), y: Math.round((H - RESTART_CONFIRM.h) / 2), w: RESTART_CONFIRM.w, h: RESTART_CONFIRM.h };
}

/** Nút "Có" (trái) / "Không" (phải) trong hộp xác nhận chơi lại. */
export function restartConfirmButtonRect(which: 'yes' | 'no'): Rect {
  const p = restartConfirmRect();
  const total = RESTART_CONFIRM.buttonW * 2 + RESTART_CONFIRM.gap;
  const x0 = p.x + Math.round((p.w - total) / 2);
  return {
    x: which === 'yes' ? x0 : x0 + RESTART_CONFIRM.buttonW + RESTART_CONFIRM.gap,
    y: p.y + p.h - RESTART_CONFIRM.buttonH - 40,
    w: RESTART_CONFIRM.buttonW,
    h: RESTART_CONFIRM.buttonH,
  };
}

/** Nút trong hộp xác nhận chơi lại dưới điểm (px, py), null nếu không trúng. */
export function restartConfirmButtonAt(px: number, py: number): 'yes' | 'no' | null {
  if (inside(restartConfirmButtonRect('yes'), px, py)) return 'yes';
  if (inside(restartConfirmButtonRect('no'), px, py)) return 'no';
  return null;
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

// ---------------------------------------------------------------- T-006: tiền, thùng bán, sạp hạt

/**
 * Ô tiền góc trên trái, ngay dưới thanh Sức (GDD §11): khoảng cách với thanh Sức, rộng, cao, cỡ icon xu; chữ "60 quan"
 * bắt đầu sau icon `textGap` px và không được vượt quá mép phải bảng gỗ trừ `textPadRight` px.
 */
export const MONEY_PANEL = { gap: 10, indent: 10, w: 240, h: 66, icon: 62, textGap: 14, textPadRight: 6 } as const;

/** Khung ô tiền (bảng gỗ + icon xu + "60 quan"), dưới thanh Sức, thụt vào `indent` so với icon bắp tay (như ảnh mẫu). */
export function moneyPanelRect(): Rect {
  const s = staminaPanelRect();
  return { x: s.x + MONEY_PANEL.indent, y: s.y + s.h + MONEY_PANEL.gap, w: MONEY_PANEL.w, h: MONEY_PANEL.h };
}

/** Vùng chữ số tiền trong ô tiền: x = mép trái chữ (origin trái), w = bề rộng tối đa chữ được chiếm. */
export function moneyTextArea(): { x: number; w: number } {
  const p = moneyPanelRect();
  const x = p.x + MONEY_PANEL.icon + MONEY_PANEL.textGap;
  return { x, w: p.x + p.w - MONEY_PANEL.textPadRight - x };
}

/**
 * T-027: scale chữ số tiền = độ "nảy" (`bump` ≥ 1) nhưng không để chữ (bề rộng gốc `textWidth`, origin trái) lòi khỏi
 * vùng chữ `maxWidth`. Số dài (≥ 4 chữ số) nảy ít hơn, thậm chí co lại < 1 nếu ngay cả lúc đứng yên đã không vừa —
 * thà chữ nhỏ đi chút còn hơn tràn ra ngoài bảng gỗ.
 */
export function moneyTextScale(bump: number, textWidth: number, maxWidth: number): number {
  if (textWidth <= 0 || maxWidth <= 0) return bump;
  return Math.min(bump, maxWidth / textWidth);
}

/**
 * Cửa sổ thùng bán (GDD §11 "Hai lưới cạnh nhau"): gùi bên trái, thùng bên phải, mỗi bên 9 cột (gùi giữ hàng trên =
 * hotbar như cửa sổ gùi). Ô nhỏ hơn cửa sổ gùi để hai lưới vừa ngang màn.
 * header = phần tiêu đề, footer = dòng "Cuối ngày bán được…" + dòng báo + dòng hướng dẫn.
 */
export const SELL_WINDOW = { slot: 80, gap: 8, pad: 36, midGap: 84, header: 100, rowSplit: 12, footer: 196, perRow: 9 } as const;

export type SellSide = 'bag' | 'box';

function sellGridSize(slotCount: number): { w: number; h: number } {
  const per = SELL_WINDOW.perRow;
  const rows = Math.ceil(slotCount / per);
  return {
    w: per * SELL_WINDOW.slot + (per - 1) * SELL_WINDOW.gap,
    h: rows * SELL_WINDOW.slot + (rows - 1) * SELL_WINDOW.gap + (rows > 1 ? SELL_WINDOW.rowSplit : 0),
  };
}

/** Khung cửa sổ thùng bán (giữa màn, hơi lệch lên để không đè hotbar). */
export function sellPanelRect(bagSlots: number, boxSlots: number): Rect {
  const a = sellGridSize(bagSlots);
  const b = sellGridSize(boxSlots);
  const w = SELL_WINDOW.pad * 2 + a.w + SELL_WINDOW.midGap + b.w;
  const h = SELL_WINDOW.header + Math.max(a.h, b.h) + SELL_WINDOW.footer;
  return { x: Math.round((W - w) / 2), y: Math.max(16, Math.round((H - h) / 2) - 40), w, h };
}

/** Góc trên-trái lưới một bên (gùi / thùng). */
export function sellGridOrigin(side: SellSide, bagSlots: number, boxSlots: number): { x: number; y: number } {
  const p = sellPanelRect(bagSlots, boxSlots);
  const a = sellGridSize(bagSlots);
  const x = side === 'bag' ? p.x + SELL_WINDOW.pad : p.x + SELL_WINDOW.pad + a.w + SELL_WINDOW.midGap;
  return { x, y: p.y + SELL_WINDOW.header };
}

/** Ô thứ i của một bên (hàng đầu tách hàng dưới một khoảng rowSplit, như cửa sổ gùi). */
export function sellSlotRect(side: SellSide, i: number, bagSlots: number, boxSlots: number): Rect {
  const o = sellGridOrigin(side, bagSlots, boxSlots);
  const row = Math.floor(i / SELL_WINDOW.perRow);
  const col = i % SELL_WINDOW.perRow;
  return {
    x: o.x + col * (SELL_WINDOW.slot + SELL_WINDOW.gap),
    y: o.y + row * (SELL_WINDOW.slot + SELL_WINDOW.gap) + (row > 0 ? SELL_WINDOW.rowSplit : 0),
    w: SELL_WINDOW.slot,
    h: SELL_WINDOW.slot,
  };
}

/** Ô dưới điểm (px, py) trong cửa sổ thùng bán, null nếu không trúng ô nào. */
export function sellSlotAt(px: number, py: number, bagSlots: number, boxSlots: number): { side: SellSide; index: number } | null {
  for (let i = 0; i < bagSlots; i++) if (inside(sellSlotRect('bag', i, bagSlots, boxSlots), px, py)) return { side: 'bag', index: i };
  for (let i = 0; i < boxSlots; i++) if (inside(sellSlotRect('box', i, bagSlots, boxSlots), px, py)) return { side: 'box', index: i };
  return null;
}

/** Đáy hai lưới (y) — các dòng chữ chân cửa sổ xếp dưới mốc này. */
export function sellGridsBottom(bagSlots: number, boxSlots: number): number {
  const p = sellPanelRect(bagSlots, boxSlots);
  return p.y + SELL_WINDOW.header + Math.max(sellGridSize(bagSlots).h, sellGridSize(boxSlots).h);
}

/** Cửa sổ sạp hạt: rộng, tiêu đề (tên + tiền), mỗi nút cao, khoảng hở, chân (dòng báo + hướng dẫn), lề trong. */
export const STALL_WINDOW = { w: 820, header: 160, buttonH: 104, buttonGap: 18, footer: 130, pad: 56 } as const;

export function stallPanelRect(buttons: number): Rect {
  const n = Math.max(1, buttons);
  const h = STALL_WINDOW.header + n * STALL_WINDOW.buttonH + (n - 1) * STALL_WINDOW.buttonGap + STALL_WINDOW.footer;
  return { x: Math.round((W - STALL_WINDOW.w) / 2), y: Math.max(16, Math.round((H - h) / 2) - 40), w: STALL_WINDOW.w, h };
}

/** Nút mua thứ i. */
export function stallButtonRect(i: number, buttons: number): Rect {
  const p = stallPanelRect(buttons);
  return {
    x: p.x + STALL_WINDOW.pad,
    y: p.y + STALL_WINDOW.header + i * (STALL_WINDOW.buttonH + STALL_WINDOW.buttonGap),
    w: p.w - STALL_WINDOW.pad * 2,
    h: STALL_WINDOW.buttonH,
  };
}

/** Nút mua dưới điểm (px, py), -1 nếu không trúng. */
export function stallButtonAt(px: number, py: number, buttons: number): number {
  for (let i = 0; i < buttons; i++) if (inside(stallButtonRect(i, buttons), px, py)) return i;
  return -1;
}

// ---------------------------------------------------------------- T-007: hỏi đi ngủ, màn tổng kết ngày

/** Hộp hỏi "Đi ngủ?" (giữa màn): rộng/cao khung, cỡ 2 nút Có / Không, khoảng hở giữa 2 nút. */
export const SLEEP_PROMPT = { w: 680, h: 330, buttonW: 250, buttonH: 88, gap: 40 } as const;

export function sleepPromptRect(): Rect {
  return { x: Math.round((W - SLEEP_PROMPT.w) / 2), y: Math.round((H - SLEEP_PROMPT.h) / 2) - 40, w: SLEEP_PROMPT.w, h: SLEEP_PROMPT.h };
}

/** Nút "Có" (trái) / "Không" (phải) trong hộp hỏi ngủ. */
export function sleepButtonRect(which: 'yes' | 'no'): Rect {
  const p = sleepPromptRect();
  const total = SLEEP_PROMPT.buttonW * 2 + SLEEP_PROMPT.gap;
  const x0 = p.x + Math.round((p.w - total) / 2);
  return {
    x: which === 'yes' ? x0 : x0 + SLEEP_PROMPT.buttonW + SLEEP_PROMPT.gap,
    y: p.y + p.h - SLEEP_PROMPT.buttonH - 44,
    w: SLEEP_PROMPT.buttonW,
    h: SLEEP_PROMPT.buttonH,
  };
}

/** Nút trong hộp hỏi ngủ dưới điểm (px, py), null nếu không trúng. */
export function sleepButtonAt(px: number, py: number): 'yes' | 'no' | null {
  if (inside(sleepButtonRect('yes'), px, py)) return 'yes';
  if (inside(sleepButtonRect('no'), px, py)) return 'no';
  return null;
}

/**
 * Màn tổng kết ngày (GDD §7): khung giữa màn; tiêu đề "Hết Ngày 1" + dòng phụ "Sáng mai: …"; các dòng bắt đầu từ
 * `firstLine`, cách nhau `lineGap`; dòng tiền có thêm dòng chi tiết nhỏ (`detailGap`); nút "Ngày mới" ở chân.
 * Tối đa 7 dòng (T-042 thêm dòng "Tiếng tăm hôm nay" — khung cao thêm, dòng khít lại) + chi tiết vẫn nằm trên nút (kiểm ở
 * hudLayout.test.ts).
 */
export const SUMMARY_WINDOW = { w: 980, h: 840, pad: 72, firstLine: 196, lineGap: 62, detailGap: 48, buttonW: 380, buttonH: 92, buttonBottom: 52 } as const;

export function summaryPanelRect(): Rect {
  return { x: Math.round((W - SUMMARY_WINDOW.w) / 2), y: Math.round((H - SUMMARY_WINDOW.h) / 2), w: SUMMARY_WINDOW.w, h: SUMMARY_WINDOW.h };
}

/** Toạ độ Y (tâm dòng) của dòng thứ i; dòng 0 = tiền, có dòng chi tiết bên dưới nên các dòng sau lùi xuống detailGap. */
export function summaryLineY(i: number): number {
  const p = summaryPanelRect();
  return p.y + SUMMARY_WINDOW.firstLine + i * SUMMARY_WINDOW.lineGap + (i > 0 ? SUMMARY_WINDOW.detailGap : 0);
}

/** Toạ độ Y dòng chi tiết dưới dòng tiền ("Rau cải ×3 · Khoai lang ×1"). */
export function summaryDetailY(): number {
  return summaryLineY(0) + SUMMARY_WINDOW.detailGap;
}

/**
 * T-027: chữ vàng "Kỷ lục mới!" — mép PHẢI ở mép phải vùng chữ, ngang dòng tiền (dòng tiền nằm bên trái nên không đè).
 * Chỗ này cũng là chỗ chừa cho meme mũi tên lãi `profitArrow` (T-079): mũi tên đặt ngay trái chữ / chen xuống giữa dòng
 * tiền và dòng sau, không phải dời các dòng khác.
 */
export function summaryRecordAnchor(): { x: number; y: number } {
  const p = summaryPanelRect();
  return { x: p.x + p.w - SUMMARY_WINDOW.pad, y: summaryLineY(0) };
}

/** T-027: xu bay về ô tiền lúc đóng tổng kết cất cánh từ đây (khoảng giữa chữ "Bán được: N quan" của dòng tiền). */
export function summaryCoinOrigin(): { x: number; y: number } {
  const p = summaryPanelRect();
  return { x: p.x + SUMMARY_WINDOW.pad + 240, y: summaryLineY(0) };
}

/** T-027: tâm icon đồng xu trong ô tiền HUD — đích của xu bay vào, chỗ cất cánh của xu bay ra. */
export function moneyCoinCenter(): { x: number; y: number } {
  const m = moneyPanelRect();
  return { x: m.x + 6 + MONEY_PANEL.icon / 2, y: m.y + m.h / 2 };
}

/** Nút "Ngày mới" (Enter). */
export function summaryButtonRect(): Rect {
  const p = summaryPanelRect();
  return {
    x: Math.round(p.x + (p.w - SUMMARY_WINDOW.buttonW) / 2),
    y: p.y + p.h - SUMMARY_WINDOW.buttonH - SUMMARY_WINDOW.buttonBottom,
    w: SUMMARY_WINDOW.buttonW,
    h: SUMMARY_WINDOW.buttonH,
  };
}
