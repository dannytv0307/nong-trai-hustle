// T-007: màn tổng kết ngày — các dòng, hiện dần, số tiền đếm lên, Enter lần 1 hiện hết / lần 2 sang ngày.
import { describe, expect, it } from 'vitest';
import {
  acceptPress,
  allRevealed,
  createReveal,
  lineProgress,
  moneyShown,
  saleDetailText,
  summaryLines,
  summarySubtitle,
  summaryTitle,
  tickReveal,
  type RevealTiming,
} from './daySummary';
import type { OvernightSummary } from './overnight';

const base = (over: Partial<OvernightSummary> = {}): OvernightSummary => ({
  cause: 'sleep',
  passedOut: false,
  dayEnded: 1,
  newDay: 2,
  newSeason: 'dry',
  seasonChanged: false,
  sale: { earned: 52, itemsSold: 3, lines: [{ id: 'rau-cai', count: 3, unitPrice: 10, subtotal: 30 }, { id: 'khoai-lang', count: 1, unitPrice: 22, subtotal: 22 }] },
  ripenedThisMorning: 3,
  unwateredYesterday: 0,
  witheredTonight: 0,
  farm: { grew: 3, ripened: 3, thirsty: 0, withered: 0 },
  staminaAfter: 100,
  ...over,
});

const TIMING: RevealTiming = { lineInterval: 0.5, lineSlide: 0.3, countSeconds: 1 };

describe('summaryLines', () => {
  it('ngủ bình thường: chỉ dòng tiền + cây chín', () => {
    expect(summaryLines(base(), 100).map((l) => l.text)).toEqual(['Bán được: 52 quan', 'Cây chín sáng nay: 3']);
  });

  it('đủ mọi dòng: chưa tưới, héo, ngủ gục, đổi mùa — đúng thứ tự, cảnh báo tô khác', () => {
    const lines = summaryLines(
      base({ unwateredYesterday: 2, witheredTonight: 1, passedOut: true, staminaAfter: 70, seasonChanged: true, newSeason: 'rainy', newDay: 5, dayEnded: 4 }),
      100,
    );
    expect(lines.map((l) => l.kind)).toEqual(['money', 'ripe', 'unwatered', 'withered', 'passout', 'season']);
    expect(lines[2].text).toBe('2 ô chưa tưới hôm qua');
    expect(lines[4].text).toBe('Ngủ gục ngoài đồng — sáng nay Sức 70/100');
    expect(lines[5].text).toBe('Mùa mưa tới rồi!');
    expect(lines.filter((l) => l.warn).map((l) => l.kind)).toEqual(['unwatered', 'withered', 'passout']);
  });

  it('dòng chi tiết bán, tiêu đề, dòng phụ', () => {
    const s = base();
    expect(saleDetailText(s, (id) => (id === 'rau-cai' ? 'Rau cải' : 'Khoai lang'))).toBe('Rau cải ×3 · Khoai lang ×1');
    expect(saleDetailText(base({ sale: { earned: 0, itemsSold: 0, lines: [] } }), (id) => id)).toBe('');
    expect(summaryTitle(s)).toBe('Hết Ngày 1');
    expect(summarySubtitle(s, 4)).toBe('Sáng mai: Ngày 2 · Mùa nắng');
    expect(summarySubtitle(base({ newDay: 5 }), 4)).toBe('Sáng mai: Ngày 5 · Mùa mưa');
  });
});

describe('hiện dần + Enter', () => {
  it('dòng i bắt đầu trượt sau i × lineInterval, trượt trong lineSlide', () => {
    const r = createReveal(3);
    expect(lineProgress(r, 0, TIMING)).toBe(0);
    tickReveal(r, 0.15);
    expect(lineProgress(r, 0, TIMING)).toBeCloseTo(0.5);
    expect(lineProgress(r, 1, TIMING)).toBe(0);
    tickReveal(r, 0.5); // t = 0.65
    expect(lineProgress(r, 0, TIMING)).toBe(1);
    expect(lineProgress(r, 1, TIMING)).toBeCloseTo(0.5);
    expect(lineProgress(r, 2, TIMING)).toBe(0);
  });

  it('số tiền đếm từ 0 lên trong countSeconds, số nguyên, không vượt', () => {
    const r = createReveal(2);
    expect(moneyShown(r, 52, TIMING)).toBe(0);
    tickReveal(r, 0.5);
    expect(moneyShown(r, 52, TIMING)).toBe(26);
    tickReveal(r, 5);
    expect(moneyShown(r, 52, TIMING)).toBe(52);
  });

  it('Enter lần 1 khi đang trượt → hiện hết ngay (tiền đủ, mọi dòng yên); lần 2 → sang ngày', () => {
    const r = createReveal(4);
    tickReveal(r, 0.2);
    expect(allRevealed(r, TIMING)).toBe(false);
    expect(acceptPress(r, TIMING)).toBe('revealAll');
    expect(allRevealed(r, TIMING)).toBe(true);
    expect(lineProgress(r, 3, TIMING)).toBe(1);
    expect(moneyShown(r, 52, TIMING)).toBe(52);
    expect(acceptPress(r, TIMING)).toBe('close');
  });

  it('chờ hết các dòng rồi Enter → sang ngày luôn (một lần bấm)', () => {
    const r = createReveal(2);
    tickReveal(r, 0.79);
    expect(allRevealed(r, TIMING)).toBe(false); // tiền đếm 1 giây
    tickReveal(r, 0.3);
    expect(allRevealed(r, TIMING)).toBe(true);
    expect(acceptPress(r, TIMING)).toBe('close');
  });
});
