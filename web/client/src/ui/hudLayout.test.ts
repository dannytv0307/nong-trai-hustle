import { describe, expect, it } from 'vitest';
import { gameConfig } from '../config/gameConfig';
import {
  bagButtonRect,
  bagPanelRect,
  bagSlotAt,
  bagSlotRect,
  CLOCK_PANEL,
  clockPanelRect,
  hotbarRect,
  hotbarSlotAt,
  hotbarSlotRect,
  isOverHud,
  keyHintMainBottom,
  keyHintSideMaxWidth,
  moneyPanelRect,
  SELL_WINDOW,
  sellGridsBottom,
  sellPanelRect,
  sellSlotAt,
  sellSlotRect,
  stallButtonAt,
  stallButtonRect,
  stallPanelRect,
  pausePanelRect,
  pauseResumeButtonRect,
  pauseRestartButtonRect,
  restartConfirmButtonAt,
  restartConfirmButtonRect,
  restartConfirmRect,
  rectContains,
  staminaPanelRect,
} from './hudLayout';

const W = gameConfig.gameWidth;
const H = gameConfig.gameHeight;

describe('hudLayout — hotbar giữa dưới màn', () => {
  it('9 ô căn giữa, nằm trong màn, sát mép dưới', () => {
    const bar = hotbarRect();
    expect(Math.abs(bar.x + bar.w / 2 - W / 2)).toBeLessThanOrEqual(1);
    expect(bar.y + bar.h).toBeLessThan(H);
    expect(bar.y).toBeGreaterThan(H * 0.8);
    expect(hotbarSlotRect(8).x + hotbarSlotRect(8).w).toBe(bar.x + bar.w);
  });
  it('hotbarSlotAt tìm đúng ô theo toạ độ, khe giữa ô = -1', () => {
    for (let i = 0; i < 9; i++) {
      const r = hotbarSlotRect(i);
      expect(hotbarSlotAt(r.x + r.w / 2, r.y + r.h / 2)).toBe(i);
    }
    const r0 = hotbarSlotRect(0);
    expect(hotbarSlotAt(r0.x + r0.w + 2, r0.y + 10)).toBe(-1);
    expect(hotbarSlotAt(W / 2, 100)).toBe(-1);
  });
  it('nút gùi bên phải hotbar, không đè hotbar, vẫn trong màn', () => {
    const b = bagButtonRect();
    const bar = hotbarRect();
    expect(b.x).toBeGreaterThan(bar.x + bar.w);
    expect(b.x + b.w).toBeLessThan(W);
    expect(isOverHud(b.x + 5, b.y + 5)).toBe(true);
    expect(isOverHud(W / 2, H / 2)).toBe(false);
  });
});

describe('hudLayout — cửa sổ gùi 2 × 9', () => {
  it('18 ô nằm trong khung, khung nằm trong màn', () => {
    const p = bagPanelRect(18);
    expect(p.x).toBeGreaterThan(0);
    expect(p.x + p.w).toBeLessThan(W);
    expect(p.y).toBeGreaterThan(0);
    expect(p.y + p.h).toBeLessThan(H);
    for (let i = 0; i < 18; i++) {
      const r = bagSlotRect(i, 18);
      expect(r.x).toBeGreaterThanOrEqual(p.x);
      expect(r.y + r.h).toBeLessThanOrEqual(p.y + p.h);
      expect(bagSlotAt(r.x + r.w / 2, r.y + r.h / 2, 18)).toBe(i);
    }
    // Hàng 2 nằm dưới hàng 1, cùng cột.
    expect(bagSlotRect(9, 18).x).toBe(bagSlotRect(0, 18).x);
    expect(bagSlotRect(9, 18).y).toBeGreaterThan(bagSlotRect(0, 18).y + bagSlotRect(0, 18).h);
  });
});

describe('hudLayout — đồng hồ + Tạm dừng (T-005)', () => {
  const overlap = (a: { x: number; y: number; w: number; h: number }, b: typeof a) =>
    a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

  it('đồng hồ bám góc trên phải, trong màn, không đè thanh Sức / hotbar / nút gùi', () => {
    const c = clockPanelRect();
    expect(c.x + c.w).toBe(W - CLOCK_PANEL.margin);
    expect(c.y).toBe(CLOCK_PANEL.margin);
    expect(c.x).toBeGreaterThan(W / 2);
    expect(overlap(c, staminaPanelRect())).toBe(false);
    expect(overlap(c, hotbarRect())).toBe(false);
    expect(overlap(c, bagButtonRect())).toBe(false);
  });

  it('nút "Tiếp tục" nằm trong cửa sổ Tạm dừng, cửa sổ giữa màn', () => {
    const p = pausePanelRect();
    const b = pauseResumeButtonRect();
    expect(Math.abs(p.x + p.w / 2 - W / 2)).toBeLessThanOrEqual(1);
    expect(b.x).toBeGreaterThan(p.x);
    expect(b.x + b.w).toBeLessThan(p.x + p.w);
    expect(b.y + b.h).toBeLessThan(p.y + p.h);
    expect(rectContains(b, b.x + 1, b.y + 1)).toBe(true);
    expect(rectContains(b, b.x - 1, b.y)).toBe(false);
  });

  it('T-008: nút Chơi lại từ đầu dưới nút Tiếp tục, trong khung; hộp xác nhận có 2 nút không chồng', () => {
    const p = pausePanelRect();
    const b = pauseResumeButtonRect();
    const r = pauseRestartButtonRect();
    expect(r.y).toBeGreaterThan(b.y + b.h);
    expect(r.x).toBeGreaterThan(p.x);
    expect(r.x + r.w).toBeLessThan(p.x + p.w);
    expect(r.y + r.h).toBeLessThan(p.y + p.h - 40); // chừa chỗ dòng Esc ở chân
    const c = restartConfirmRect();
    const yes = restartConfirmButtonRect('yes');
    const no = restartConfirmButtonRect('no');
    expect(yes.x + yes.w).toBeLessThan(no.x);
    expect(yes.x).toBeGreaterThan(c.x);
    expect(no.x + no.w).toBeLessThan(c.x + c.w);
    expect(restartConfirmButtonAt(yes.x + 2, yes.y + 2)).toBe('yes');
    expect(restartConfirmButtonAt(no.x + 2, no.y + 2)).toBe('no');
    expect(restartConfirmButtonAt(c.x + 2, c.y + 2)).toBeNull();
  });

  it('gợi ý phím: dòng chính nằm trên nút gùi; khe cho dòng ngắn đủ rộng', () => {
    expect(keyHintMainBottom()).toBeLessThan(bagButtonRect().y);
    expect(keyHintSideMaxWidth()).toBeGreaterThan(250);
  });
});

describe('hudLayout — tiền, thùng bán, sạp hạt (T-006)', () => {
  const overlap = (a: { x: number; y: number; w: number; h: number }, b: typeof a) =>
    a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

  it('ô tiền ngay dưới thanh Sức, thẳng mép trái, không đè thanh Sức / đồng hồ / hotbar', () => {
    const m = moneyPanelRect();
    const s = staminaPanelRect();
    expect(m.x).toBe(s.x);
    expect(m.y).toBeGreaterThan(s.y + s.h);
    expect(overlap(m, s)).toBe(false);
    expect(overlap(m, clockPanelRect())).toBe(false);
    expect(overlap(m, hotbarRect())).toBe(false);
  });

  it('cửa sổ thùng bán: 2 lưới 18 ô nằm trong khung, khung trong màn, không đè hotbar; sellSlotAt đúng ô', () => {
    const p = sellPanelRect(18, 18);
    expect(p.x).toBeGreaterThan(0);
    expect(p.x + p.w).toBeLessThan(W);
    expect(p.y).toBeGreaterThan(0);
    expect(p.y + p.h).toBeLessThan(hotbarRect().y);
    for (const side of ['bag', 'box'] as const) {
      for (let i = 0; i < 18; i++) {
        const r = sellSlotRect(side, i, 18, 18);
        expect(r.x).toBeGreaterThanOrEqual(p.x);
        expect(r.x + r.w).toBeLessThanOrEqual(p.x + p.w);
        expect(r.y + r.h).toBeLessThanOrEqual(sellGridsBottom(18, 18));
        expect(sellSlotAt(r.x + r.w / 2, r.y + r.h / 2, 18, 18)).toEqual({ side, index: i });
      }
    }
    // Thùng nằm bên phải gùi, không chồng nhau.
    expect(sellSlotRect('box', 0, 18, 18).x).toBeGreaterThan(sellSlotRect('bag', 8, 18, 18).x + SELL_WINDOW.slot);
    expect(sellSlotAt(p.x + 2, p.y + 2, 18, 18)).toBeNull();
    expect(sellGridsBottom(18, 18) + 150).toBeLessThan(p.y + p.h);
  });

  it('cửa sổ sạp hạt: nút nằm trong khung, không chồng nhau; stallButtonAt đúng nút', () => {
    const p = stallPanelRect(2);
    expect(Math.abs(p.x + p.w / 2 - W / 2)).toBeLessThanOrEqual(1);
    expect(p.y + p.h).toBeLessThan(H);
    const a = stallButtonRect(0, 2);
    const b = stallButtonRect(1, 2);
    expect(overlap(a, b)).toBe(false);
    expect(b.y + b.h).toBeLessThan(p.y + p.h - 60);
    expect(stallButtonAt(a.x + 5, a.y + 5, 2)).toBe(0);
    expect(stallButtonAt(b.x + b.w - 5, b.y + b.h - 5, 2)).toBe(1);
    expect(stallButtonAt(p.x + 2, p.y + 2, 2)).toBe(-1);
  });
});

describe('hudLayout — hỏi đi ngủ, tổng kết ngày (T-007)', () => {
  it('hộp hỏi ngủ: 2 nút nằm trong khung, không chồng nhau, bấm trúng đúng nút', async () => {
    const { sleepPromptRect, sleepButtonRect, sleepButtonAt } = await import('./hudLayout');
    const p = sleepPromptRect();
    const yes = sleepButtonRect('yes');
    const no = sleepButtonRect('no');
    for (const b of [yes, no]) {
      expect(b.x).toBeGreaterThanOrEqual(p.x);
      expect(b.x + b.w).toBeLessThanOrEqual(p.x + p.w);
      expect(b.y + b.h).toBeLessThanOrEqual(p.y + p.h);
    }
    expect(yes.x + yes.w).toBeLessThan(no.x);
    expect(sleepButtonAt(yes.x + 5, yes.y + 5)).toBe('yes');
    expect(sleepButtonAt(no.x + no.w - 5, no.y + 5)).toBe('no');
    expect(sleepButtonAt(p.x + 2, p.y + 2)).toBeNull();
  });

  it('tổng kết: khung nằm trong màn 1920×1080; 6 dòng + chi tiết nằm trên nút "Ngày mới"', async () => {
    const { summaryPanelRect, summaryLineY, summaryDetailY, summaryButtonRect } = await import('./hudLayout');
    const p = summaryPanelRect();
    expect(p.x).toBeGreaterThanOrEqual(0);
    expect(p.y).toBeGreaterThanOrEqual(0);
    expect(p.x + p.w).toBeLessThanOrEqual(gameConfig.gameWidth);
    expect(p.y + p.h).toBeLessThanOrEqual(gameConfig.gameHeight);
    const b = summaryButtonRect();
    expect(summaryDetailY()).toBeLessThan(summaryLineY(1));
    for (let i = 1; i < 6; i++) expect(summaryLineY(i)).toBeGreaterThan(summaryLineY(i - 1));
    expect(summaryLineY(5) + 24).toBeLessThan(b.y);
    expect(b.y + b.h).toBeLessThanOrEqual(p.y + p.h);
  });
});
