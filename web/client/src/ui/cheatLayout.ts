// Bố cục bảng Thử (T-041, chỉ bản dev) — hệ toạ độ 1920×1080 của UI. Thuần TS: HUD dùng để vẽ, GardenScene dùng để biết
// con trỏ trên nút nào, unit test kiểm mọi hàng vừa khung. Số bố cục giao diện, không phải thông số gameplay.
import { gameConfig } from '../config/gameConfig';
import type { Rect } from './uiSpec';

/**
 * Khung: rộng, lề trong, phần tiêu đề, cột nhãn hàng, cao + khe giữa các hàng nút, khe giữa nút, phần chân (dòng trạng
 * thái, dòng báo, "Esc / F2: đóng"). Nút cao 74 px: chữ 26 px nằm gọn vùng chữ của ảnh nút (lề trên 14, dưới 30).
 */
export const CHEAT_PANEL = { w: 1420, pad: 60, header: 116, labelW: 240, rowH: 74, rowGap: 12, buttonGap: 16, footer: 150 } as const;

/** Bề rộng cần cho một hàng nút. */
export function cheatRowWidth(widths: readonly number[]): number {
  return widths.reduce((a, w) => a + w, 0) + Math.max(0, widths.length - 1) * CHEAT_PANEL.buttonGap;
}

/** Khung bảng (giữa màn) cho `rowCount` hàng. */
export function cheatPanelRect(rowCount: number): Rect {
  const P = CHEAT_PANEL;
  const h = P.header + rowCount * P.rowH + Math.max(0, rowCount - 1) * P.rowGap + P.footer;
  return { x: Math.round((gameConfig.gameWidth - P.w) / 2), y: Math.round((gameConfig.gameHeight - h) / 2), w: P.w, h };
}

/** Mép trên của hàng `row`. */
export function cheatRowTop(row: number, rowCount: number): number {
  const p = cheatPanelRect(rowCount);
  return p.y + CHEAT_PANEL.header + row * (CHEAT_PANEL.rowH + CHEAT_PANEL.rowGap);
}

/** Một nút đã đặt chỗ: hàng, thứ tự trong hàng, chỉ số phẳng (hàng → nút), khung. */
export interface CheatButtonSlot {
  row: number;
  index: number;
  flat: number;
  rect: Rect;
}

/** Đặt chỗ mọi nút: mỗi hàng bắt đầu sau cột nhãn, nút nối nhau trái → phải. `widths[r][i]` = bề rộng nút. */
export function cheatButtonSlots(widths: readonly (readonly number[])[]): CheatButtonSlot[] {
  const p = cheatPanelRect(widths.length);
  const out: CheatButtonSlot[] = [];
  let flat = 0;
  widths.forEach((row, r) => {
    let x = p.x + CHEAT_PANEL.pad + CHEAT_PANEL.labelW;
    const y = cheatRowTop(r, widths.length);
    row.forEach((w, i) => {
      out.push({ row: r, index: i, flat: flat++, rect: { x, y, w, h: CHEAT_PANEL.rowH } });
      x += w + CHEAT_PANEL.buttonGap;
    });
  });
  return out;
}

/** Nút dưới con trỏ (chỉ số phẳng), -1 = không trúng nút nào. */
export function cheatButtonAt(px: number, py: number, slots: readonly CheatButtonSlot[]): number {
  for (const s of slots) {
    const r = s.rect;
    if (px >= r.x && px < r.x + r.w && py >= r.y && py < r.y + r.h) return s.flat;
  }
  return -1;
}

/** Tâm dọc 3 dòng chân bảng: trạng thái, dòng báo, hướng dẫn đóng. */
export function cheatFooterLines(rowCount: number): { status: number; notice: number; hint: number } {
  const p = cheatPanelRect(rowCount);
  const bottom = p.y + p.h;
  return { status: bottom - 118, notice: bottom - 78, hint: bottom - 40 };
}
