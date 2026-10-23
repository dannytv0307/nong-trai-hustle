// Bố cục level trên HUD (T-042, hệ toạ độ 1920×1080): bảng gỗ "Lv 1 · Nghèo kiết xác" + thanh XP mảnh ở góc trên trái
// (dưới ô tiền — GDD §11), thẻ "Lên level N! / Mở khóa" giữa màn, pháo giấy. Thuần TS: HUD dùng để vẽ, GardenScene dùng để
// biết con trỏ trên nút nào, unit test kiểm không đè các phần HUD có sẵn. Số bố cục giao diện, không phải thông số gameplay.
import { gameConfig } from '../config/gameConfig';
import { moneyPanelRect, windowCloseRect } from './hudLayout';
import type { Rect } from './uiSpec';

const W = gameConfig.gameWidth;
const H = gameConfig.gameHeight;

/**
 * Bảng level: cách ô tiền `gap`, rộng / cao, icon ngôi sao (cạnh), chữ 28 px (tâm dọc cách mép trên `textY`), thanh XP mảnh
 * (cao `barH`, đáy cách mép dưới `barBottom`, lề trái / phải theo vùng content của hud-plank 22 px).
 */
export const LEVEL_BADGE = { gap: 10, w: 470, h: 80, icon: 52, iconX: 8, textGap: 8, textY: 32, barH: 10, barBottom: 16, padX: 22 } as const;

/** Khung bảng level (bảng gỗ), ngay dưới ô tiền, thẳng mép trái với ô tiền. */
export function levelBadgeRect(): Rect {
  const m = moneyPanelRect();
  return { x: m.x, y: m.y + m.h + LEVEL_BADGE.gap, w: LEVEL_BADGE.w, h: LEVEL_BADGE.h };
}

/** Tâm icon ngôi sao. */
export function levelIconCenter(): { x: number; y: number } {
  const r = levelBadgeRect();
  return { x: r.x + LEVEL_BADGE.iconX + LEVEL_BADGE.icon / 2, y: r.y + LEVEL_BADGE.textY + 2 };
}

/** Vùng chữ "Lv 1 · Nghèo kiết xác": x = mép trái (origin trái), y = tâm dọc, w = bề rộng tối đa. */
export function levelTextArea(): { x: number; y: number; w: number } {
  const r = levelBadgeRect();
  const x = r.x + LEVEL_BADGE.iconX + LEVEL_BADGE.icon + LEVEL_BADGE.textGap;
  return { x, y: r.y + LEVEL_BADGE.textY, w: r.x + r.w - LEVEL_BADGE.padX - x };
}

/** Thanh XP mảnh (nền mực + ruột vàng), nằm dưới chữ, trong vùng content của bảng gỗ. */
export function levelBarRect(): Rect {
  const r = levelBadgeRect();
  const t = levelTextArea();
  return { x: t.x, y: r.y + r.h - LEVEL_BADGE.barBottom - LEVEL_BADGE.barH, w: t.w, h: LEVEL_BADGE.barH };
}

/** Chữ co lại (≤ 1) nếu dài hơn vùng chữ — "Lv 12 · Người bình thường" vẫn nằm gọn trong bảng gỗ. */
export function levelTextScale(textWidth: number, maxWidth: number): number {
  if (textWidth <= 0 || maxWidth <= 0) return 1;
  return Math.min(1, maxWidth / textWidth);
}

/**
 * Thẻ "Mở khóa": rộng, lề trong, phần đầu (tiêu đề "Mở khóa" + "1/2"), mỗi dòng mở khóa cao `rowH`, phần chân (nút), cột
 * nhãn loại ("Khu mới") rộng `labelW`. Chữ lớn "Lên level N!" nằm TRÊN khung (`headingGap` px trên mép trên).
 */
export const LEVEL_CARD = { w: 920, pad: 64, header: 132, rowH: 92, minRows: 1, footer: 170, labelW: 200, headingGap: 78, buttonW: 380, buttonH: 92, buttonBottom: 48 } as const;

/** Khung thẻ cho `rows` dòng mở khóa (0 dòng vẫn chừa 1 dòng cho câu "Tiếng tăm vang khắp làng Lầy"). Lệch xuống chừa chỗ chữ lớn. */
export function levelCardRect(rows: number): Rect {
  const n = Math.max(LEVEL_CARD.minRows, Math.floor(rows));
  const h = LEVEL_CARD.header + n * LEVEL_CARD.rowH + LEVEL_CARD.footer;
  return { x: Math.round((W - LEVEL_CARD.w) / 2), y: Math.round((H - h) / 2 + LEVEL_CARD.headingGap / 2), w: LEVEL_CARD.w, h };
}

/** Tâm chữ lớn "Lên level N!" (trên khung thẻ). */
export function levelHeadingCenter(rows: number): { x: number; y: number } {
  const p = levelCardRect(rows);
  return { x: W / 2, y: p.y - LEVEL_CARD.headingGap + 10 };
}

/** Tâm dọc dòng mở khóa thứ i. */
export function levelRowCenterY(i: number, rows: number): number {
  const p = levelCardRect(rows);
  return p.y + LEVEL_CARD.header + i * LEVEL_CARD.rowH + LEVEL_CARD.rowH / 2;
}

/** Nút "Hay quá!" (Enter / Space). */
export function levelCardButtonRect(rows: number): Rect {
  const p = levelCardRect(rows);
  return {
    x: Math.round(p.x + (p.w - LEVEL_CARD.buttonW) / 2),
    y: p.y + p.h - LEVEL_CARD.buttonH - LEVEL_CARD.buttonBottom,
    w: LEVEL_CARD.buttonW,
    h: LEVEL_CARD.buttonH,
  };
}

/** Nút đóng (X) của thẻ. */
export const levelCardCloseRect = (rows: number): Rect => windowCloseRect(levelCardRect(rows));

/** Một mảnh pháo giấy lúc `t` giây sau khi bắn: toạ độ màn, góc (độ), độ đục, màu (chỉ số trong bảng màu người gọi đưa). */
export interface ConfettiPiece {
  x: number;
  y: number;
  angle: number;
  alpha: number;
  color: number;
}

/** Số giả-ngẫu-nhiên 0…1 cố định theo (i, k) — mảnh nào bay kiểu nào không đổi giữa các frame, không tạo object. */
function hash01(i: number, k: number): number {
  const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return v - Math.floor(v);
}

/**
 * Pháo giấy (GDD §8 "pháo giấy"): `count` mảnh bắn lên từ hai bên mép dưới thẻ rồi rơi lả tả, xoay, mờ dần trong
 * `seconds` giây. Ghi vào `out` (dùng lại object). Trả về false khi mảnh đã tắt (t ≥ seconds hoặc chưa bắn).
 */
export function confettiAt(i: number, t: number, seconds: number, colorCount: number, out: ConfettiPiece): boolean {
  if (t < 0 || t >= seconds || seconds <= 0) return false;
  const left = i % 2 === 0;
  const r1 = hash01(i, 1);
  const r2 = hash01(i, 2);
  const r3 = hash01(i, 3);
  const x0 = left ? W * (0.22 + 0.08 * r1) : W * (0.78 - 0.08 * r1);
  const y0 = H * 0.72;
  const vx = (left ? 1 : -1) * (180 + 420 * r2);
  const vy = -(900 + 500 * r3);
  const g = 1500;
  // Lực cản đơn giản: vận tốc ngang giảm dần, rơi chậm lại (tờ giấy) — rơi tối đa ~260 px/giây.
  const drag = 1 - Math.exp(-2.2 * t);
  out.x = x0 + (vx / 2.2) * drag + Math.sin(t * (4 + 4 * r1) + i) * 26;
  out.y = y0 + vy * t + 0.5 * g * t * t;
  const fallCap = y0 + vy * 0.6 + 0.5 * g * 0.36 + 260 * Math.max(0, t - 0.6);
  if (t > 0.6) out.y = Math.min(out.y, fallCap);
  out.angle = (r2 * 360 + t * (220 + 380 * r3) * (left ? 1 : -1)) % 360;
  out.alpha = t < seconds * 0.7 ? 1 : Math.max(0, 1 - (t - seconds * 0.7) / (seconds * 0.3));
  out.color = Math.floor(r3 * Math.max(1, colorCount)) % Math.max(1, colorCount);
  return true;
}
