import { describe, expect, it } from 'vitest';
import { gameConfig } from '../config/gameConfig';
import { clockPanelRect, hotbarRect, moneyPanelRect, staminaPanelRect, type Rect } from './hudLayout';
import {
  confettiAt,
  levelBadgeRect,
  levelBarRect,
  levelCardButtonRect,
  levelCardCloseRect,
  levelCardRect,
  levelHeadingCenter,
  levelIconCenter,
  levelRowCenterY,
  levelTextArea,
  levelTextScale,
  type ConfettiPiece,
} from './levelLayout';

const W = gameConfig.gameWidth;
const H = gameConfig.gameHeight;
const overlaps = (a: Rect, b: Rect): boolean => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
const inside = (r: Rect, outer: Rect): boolean => r.x >= outer.x && r.y >= outer.y && r.x + r.w <= outer.x + outer.w && r.y + r.h <= outer.y + outer.h;

describe('bảng level góc trên trái (T-042)', () => {
  it('ngay dưới ô tiền, không đè thanh Sức / ô tiền / đồng hồ / hotbar, nằm trong màn', () => {
    const r = levelBadgeRect();
    const m = moneyPanelRect();
    expect(r.y).toBeGreaterThan(m.y + m.h);
    expect(r.x).toBe(m.x);
    for (const other of [staminaPanelRect(), m, clockPanelRect(), hotbarRect()]) expect(overlaps(r, other)).toBe(false);
    expect(inside(r, { x: 0, y: 0, w: W, h: H })).toBe(true);
    // Chừa chỗ bảng tên khu giữa trên màn (tâm y 224, rộng tối đa ~700 quanh giữa màn).
    expect(r.x + r.w).toBeLessThan(W / 2 - 350);
  });

  it('icon, chữ, thanh XP nằm trong bảng gỗ; thanh mảnh dưới chữ', () => {
    const r = levelBadgeRect();
    const t = levelTextArea();
    const bar = levelBarRect();
    const ic = levelIconCenter();
    expect(ic.x).toBeGreaterThan(r.x);
    expect(t.x).toBeGreaterThan(ic.x);
    expect(t.x + t.w).toBeLessThanOrEqual(r.x + r.w);
    expect(inside(bar, r)).toBe(true);
    expect(bar.h).toBeLessThanOrEqual(12);
    expect(bar.y).toBeGreaterThan(t.y + 14); // dưới nửa dưới chữ 28px
    // "Lv 12 · Người bình thường" (~26 ký tự × ~15px) vừa hoặc co lại vừa.
    expect(levelTextScale(26 * 15, t.w)).toBeLessThanOrEqual(1);
    expect(levelTextScale(100, t.w)).toBe(1);
  });
});

describe('thẻ "Lên level / Mở khóa"', () => {
  it('1…4 dòng: khung + chữ lớn + nút + X nằm trong màn; dòng nằm giữa phần đầu và nút', () => {
    for (let rows = 0; rows <= 4; rows++) {
      const p = levelCardRect(rows);
      expect(inside(p, { x: 0, y: 0, w: W, h: H }), `rows ${rows}`).toBe(true);
      const hc = levelHeadingCenter(rows);
      expect(hc.y - 50).toBeGreaterThan(0);
      expect(hc.y + 44).toBeLessThan(p.y);
      const b = levelCardButtonRect(rows);
      expect(inside(b, p)).toBe(true);
      expect(b.h).toBeGreaterThanOrEqual(84);
      const c = levelCardCloseRect(rows);
      expect(c.y).toBeGreaterThanOrEqual(0);
      expect(c.x + c.w).toBeLessThanOrEqual(W);
      const n = Math.max(1, rows);
      expect(levelRowCenterY(n - 1, rows) + 40).toBeLessThan(b.y);
      expect(levelRowCenterY(0, rows) - 40).toBeGreaterThan(p.y + 80);
    }
  });
});

describe('pháo giấy', () => {
  it('bắn lên rồi rơi, mờ dần, tắt sau thời gian; không tạo object (ghi vào out)', () => {
    const out: ConfettiPiece = { x: 0, y: 0, angle: 0, alpha: 0, color: 0 };
    expect(confettiAt(0, -0.1, 2, 5, out)).toBe(false);
    expect(confettiAt(0, 2, 2, 5, out)).toBe(false);
    expect(confettiAt(3, 0, 2, 5, out)).toBe(true);
    const y0 = out.y;
    confettiAt(3, 0.3, 2, 5, out);
    expect(out.y).toBeLessThan(y0); // đang bay lên
    confettiAt(3, 1.9, 2, 5, out);
    expect(out.alpha).toBeLessThan(0.5);
    for (let i = 0; i < 40; i++) {
      confettiAt(i, 0.5, 2, 5, out);
      expect(out.color).toBeGreaterThanOrEqual(0);
      expect(out.color).toBeLessThan(5);
      expect(Number.isFinite(out.x) && Number.isFinite(out.y)).toBe(true);
    }
  });
});
