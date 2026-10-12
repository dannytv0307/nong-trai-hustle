// T-006: tiền (không bao giờ âm), giá, thùng bán (tổng, bán hết), mua hạt, chuyển món gùi ↔ thùng.
import { describe, expect, it } from 'vitest';
import { gameConfig } from '../config/gameConfig';
import {
  buySeeds,
  canSellItem,
  createWallet,
  earn,
  hasMoney,
  normalizeMoney,
  seedPriceOf,
  sellBoxContents,
  sellBoxTotal,
  sellPriceOf,
  setMoney,
  spend,
} from './economy';
import { countOf, createInventory, moveFromSlot, setSlot } from './inventory';
import { seedItemId } from './items';

const bag = () => createInventory(18, 9, 20);
const box = () => createInventory(18, 18, 20);

describe('ví tiền', () => {
  it('khởi đầu startMoney (60 quan)', () => {
    expect(createWallet(gameConfig.startMoney).money).toBe(60);
  });

  it('tiền không bao giờ âm: trả quá số tiền có thì không trừ', () => {
    const w = createWallet(10);
    expect(spend(w, 11)).toBe(false);
    expect(w.money).toBe(10);
    expect(spend(w, 10)).toBe(true);
    expect(w.money).toBe(0);
    expect(spend(w, 1)).toBe(false);
    expect(w.money).toBe(0);
  });

  it('tiền không bao giờ âm: giá lạ, cộng số âm, đặt số âm / NaN đều không làm âm', () => {
    const w = createWallet(-50);
    expect(w.money).toBe(0);
    expect(spend(w, -5)).toBe(false);
    expect(spend(w, Number.NaN)).toBe(false);
    expect(earn(w, -30)).toBe(0);
    expect(w.money).toBe(0);
    expect(setMoney(w, -1)).toBe(0);
    expect(setMoney(w, Number.NaN)).toBe(0);
    expect(setMoney(w, 12.9)).toBe(12);
    expect(normalizeMoney(Number.POSITIVE_INFINITY)).toBe(0);
  });

  it('chuỗi mua/bán ngẫu nhiên dài: tiền luôn là số nguyên ≥ 0', () => {
    const w = createWallet(60);
    let seed = 7;
    const rand = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
    for (let i = 0; i < 2000; i++) {
      const r = rand();
      if (r < 0.5) spend(w, Math.floor(rand() * 40) - 5);
      else if (r < 0.8) earn(w, Math.floor(rand() * 30) - 10);
      else buySeeds(w, bag(), rand() < 0.5 ? 'rau-cai' : 'khoai-lang', 1 + Math.floor(rand() * 6));
      expect(w.money).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(w.money)).toBe(true);
    }
  });

  it('hasMoney', () => {
    const w = createWallet(8);
    expect(hasMoney(w, 8)).toBe(true);
    expect(hasMoney(w, 9)).toBe(false);
  });
});

describe('giá (crops.json)', () => {
  it('giá bán gốc: rau cải 10, khoai lang 22; hạt KHÔNG bán được; món lạ không bán được', () => {
    expect(sellPriceOf('rau-cai')).toBe(10);
    expect(sellPriceOf('khoai-lang')).toBe(22);
    expect(sellPriceOf(seedItemId('rau-cai'))).toBeNull();
    expect(canSellItem(seedItemId('khoai-lang'))).toBe(false);
    expect(sellPriceOf('mon-la')).toBeNull();
  });

  it('giá hạt: cải 4, khoai lang 8', () => {
    expect(seedPriceOf('rau-cai')).toBe(4);
    expect(seedPriceOf('khoai-lang')).toBe(8);
    expect(seedPriceOf('khong-co')).toBeNull();
  });
});

describe('thùng bán', () => {
  it('tổng tiền cuối ngày = Σ giá gốc × số lượng (3 cải = 30 quan)', () => {
    const b = box();
    expect(sellBoxTotal(b)).toBe(0);
    setSlot(b, 0, 'rau-cai', 3);
    expect(sellBoxTotal(b)).toBe(30);
    setSlot(b, 5, 'khoai-lang', 2);
    setSlot(b, 6, 'rau-cai', 1);
    expect(sellBoxTotal(b)).toBe(30 + 44 + 10);
  });

  it('bán thùng: cộng tiền, thùng trống, báo từng loại (gộp chồng cùng loại)', () => {
    const b = box();
    const w = createWallet(5);
    setSlot(b, 0, 'rau-cai', 3);
    setSlot(b, 2, 'khoai-lang', 1);
    setSlot(b, 4, 'rau-cai', 2);
    const r = sellBoxContents(b, w);
    expect(r.earned).toBe(50 + 22);
    expect(r.itemsSold).toBe(6);
    expect(r.lines).toEqual([
      { id: 'rau-cai', count: 5, unitPrice: 10, subtotal: 50 },
      { id: 'khoai-lang', count: 1, unitPrice: 22, subtotal: 22 },
    ]);
    expect(w.money).toBe(77);
    expect(b.slots.every((s) => s === null)).toBe(true);
    // Bán lần nữa (thùng trống) → không cộng gì.
    expect(sellBoxContents(b, w).earned).toBe(0);
    expect(w.money).toBe(77);
  });

  it('món không bán được (nếu lọt vào) nằm lại trong thùng, không cộng tiền', () => {
    const b = box();
    const w = createWallet(0);
    setSlot(b, 0, seedItemId('rau-cai'), 4);
    expect(sellBoxContents(b, w).earned).toBe(0);
    expect(b.slots[0]).toEqual({ id: seedItemId('rau-cai'), count: 4 });
  });
});

describe('chuyển món gùi ↔ thùng (moveFromSlot)', () => {
  it('click = 1 món, Shift+click = cả chồng; lấy lại được; tổng số món không đổi', () => {
    const g = bag();
    const b = box();
    setSlot(g, 2, 'rau-cai', 5);
    expect(moveFromSlot(g, 2, b, 1)).toEqual({ moved: 1, id: 'rau-cai', toSlot: 0 });
    expect(countOf(g, 'rau-cai')).toBe(4);
    expect(countOf(b, 'rau-cai')).toBe(1);
    expect(moveFromSlot(g, 2, b, Number.POSITIVE_INFINITY).moved).toBe(4);
    expect(g.slots[2]).toBeNull();
    expect(b.slots[0]).toEqual({ id: 'rau-cai', count: 5 });
    // Lấy lại 1 món về gùi → vào ô trống đầu tiên của gùi.
    const back = moveFromSlot(b, 0, g, 1);
    expect(back).toEqual({ moved: 1, id: 'rau-cai', toSlot: 0 });
    expect(countOf(g, 'rau-cai') + countOf(b, 'rau-cai')).toBe(5);
  });

  it('bên nhận đầy → chuyển được bao nhiêu hay bấy nhiêu, phần còn lại ở nguyên ô cũ', () => {
    const g = createInventory(2, 2, 20);
    setSlot(g, 0, 'khoai-lang', 20);
    setSlot(g, 1, 'rau-cai', 18);
    const b = box();
    setSlot(b, 0, 'rau-cai', 6);
    const r = moveFromSlot(b, 0, g, 6);
    expect(r.moved).toBe(2);
    expect(g.slots[1]).toEqual({ id: 'rau-cai', count: 20 });
    expect(b.slots[0]).toEqual({ id: 'rau-cai', count: 4 });
    expect(moveFromSlot(b, 0, g, 1)).toEqual({ moved: 0, id: 'rau-cai', toSlot: -1 });
  });

  it('ô trống / số lượng 0 → không làm gì', () => {
    const g = bag();
    expect(moveFromSlot(g, 3, box(), 1)).toEqual({ moved: 0, id: null, toSlot: -1 });
    setSlot(g, 3, 'rau-cai', 1);
    expect(moveFromSlot(g, 3, box(), 0).moved).toBe(0);
  });
});

describe('mua hạt ở sạp', () => {
  it('mua 1 hạt cải: tiền giảm 4, hạt vào gùi', () => {
    const w = createWallet(60);
    const g = bag();
    const r = buySeeds(w, g, 'rau-cai', 1);
    expect(r).toEqual({ ok: true, cropId: 'rau-cai', count: 1, cost: 4, firstSlot: 0 });
    expect(w.money).toBe(56);
    expect(countOf(g, seedItemId('rau-cai'))).toBe(1);
  });

  it('thiếu tiền → không mua, tiền giữ nguyên', () => {
    const w = createWallet(7);
    const g = bag();
    expect(buySeeds(w, g, 'khoai-lang', 1)).toEqual({ ok: false, reason: 'noMoney' });
    expect(w.money).toBe(7);
    expect(countOf(g, seedItemId('khoai-lang'))).toBe(0);
  });

  it('gùi đầy → không mua, không mất tiền', () => {
    const w = createWallet(60);
    const g = createInventory(1, 1, 20);
    setSlot(g, 0, 'rau-cai', 3);
    expect(buySeeds(w, g, 'rau-cai', 1)).toEqual({ ok: false, reason: 'bagFull' });
    expect(w.money).toBe(60);
    // Có chồng hạt cùng loại còn chỗ thì vẫn mua được.
    setSlot(g, 0, seedItemId('rau-cai'), 19);
    expect(buySeeds(w, g, 'rau-cai', 5)).toMatchObject({ ok: true, count: 1, cost: 4 });
    expect(w.money).toBe(56);
  });

  it('mua 5 (Shift+click): được bao nhiêu mua bấy nhiêu theo tiền và chỗ', () => {
    const w = createWallet(30);
    const g = bag();
    expect(buySeeds(w, g, 'rau-cai', 5)).toMatchObject({ ok: true, count: 5, cost: 20 });
    expect(w.money).toBe(10);
    expect(buySeeds(w, g, 'khoai-lang', 5)).toMatchObject({ ok: true, count: 1, cost: 8 });
    expect(w.money).toBe(2);
    expect(buySeeds(w, g, 'rau-cai', 5)).toEqual({ ok: false, reason: 'noMoney' });
  });

  it('cây lạ / số lượng ≤ 0 → không mua', () => {
    const w = createWallet(60);
    expect(buySeeds(w, bag(), 'khong-co', 1)).toEqual({ ok: false, reason: 'unknown' });
    expect(buySeeds(w, bag(), 'rau-cai', 0)).toEqual({ ok: false, reason: 'unknown' });
    expect(w.money).toBe(60);
  });
});
