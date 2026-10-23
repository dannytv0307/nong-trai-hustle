// T-027: đường bay vồng + vệt sáng, mẻ xu bay (chia tiền, chạm lần lượt, số tiền hiện tăng theo xu), cây chín gọi hái.
import { describe, expect, it } from 'vitest';
import {
  bumpScale,
  coinProgress,
  coinShares,
  coinSpawnOffset,
  coinsInFlight,
  createCoinState,
  dropIncomingCoins,
  flightPoint,
  hasIncomingCoins,
  heldCoinMoney,
  ripeCueCycle,
  ripeCueOffset,
  ripeCueProgress,
  ripeHop,
  sparkleOffset,
  sparkleScale,
  startCoinBatch,
  stepCoins,
  trailFade,
  trailProgress,
  type CoinLanding,
  type CoinParams,
} from './juice';

const P: CoinParams = { count: 6, flySeconds: 0.6, staggerSeconds: 0.05, spreadPx: 30, arcPx: 100 };
const FROM = { x: 960, y: 400 };
const TO = { x: 100, y: 150 };

describe('flightPoint + vệt sáng', () => {
  it('đầu = from, cuối = to, giữa vồng lên trên đường thẳng đúng arcPx', () => {
    expect(flightPoint(FROM, TO, 0, 100)).toEqual({ x: 960, y: 400 });
    const end = flightPoint(FROM, TO, 1, 100);
    expect(end.x).toBeCloseTo(100);
    expect(end.y).toBeCloseTo(150);
    const mid = flightPoint(FROM, TO, 0.5, 100);
    expect(mid.x).toBeCloseTo(530);
    expect(mid.y).toBeCloseTo(275 - 100);
  });

  it('kẹp p ngoài [0, 1]; ghi vào out (không tạo object mới)', () => {
    const out = { x: 0, y: 0 };
    expect(flightPoint(FROM, TO, -1, 50, out)).toBe(out);
    expect(out).toEqual({ x: 960, y: 400 });
    flightPoint(FROM, TO, 3, 50, out);
    expect(out.x).toBeCloseTo(100);
  });

  it('chấm vệt k nằm lùi k × gap giây; đầu đường bay chưa có vệt; mờ dần về đuôi', () => {
    expect(trailProgress(0.5, 1, 0.05, 0.5)).toBeCloseTo(0.4);
    expect(trailProgress(0.5, 3, 0.05, 0.5)).toBeCloseTo(0.2);
    expect(trailProgress(0.05, 1, 0.05, 0.5)).toBe(-1);
    expect(trailProgress(0.5, 1, 0.05, 0)).toBe(-1);
    expect(trailFade(1, 5)).toBe(1);
    expect(trailFade(5, 5)).toBeCloseTo(0.2);
    expect(trailFade(3, 5)).toBeGreaterThan(trailFade(4, 5));
    expect(trailFade(0, 5)).toBe(0);
    expect(trailFade(6, 5)).toBe(0);
  });
});

describe('xu bay', () => {
  it('coinShares: tổng đúng, tối đa count đồng, chênh nhau ≤ 1; tiền ít → mỗi đồng 1 quan; 0 → không xu', () => {
    const s = coinShares(52, 6);
    expect(s).toHaveLength(6);
    expect(s.reduce((a, b) => a + b, 0)).toBe(52);
    expect(Math.max(...s) - Math.min(...s)).toBeLessThanOrEqual(1);
    expect(coinShares(4, 6)).toEqual([1, 1, 1, 1]);
    expect(coinShares(0, 6)).toEqual([]);
    expect(coinShares(-3, 6)).toEqual([]);
    expect(coinShares(10, 0)).toEqual([]);
    expect(coinShares(7.9, 6).reduce((a, b) => a + b, 0)).toBe(7);
  });

  it('chỗ xuất phát toả trong bán kính spreadPx, không trùng nhau; 1 đồng → đúng tâm', () => {
    const pts = Array.from({ length: 6 }, (_, i) => coinSpawnOffset(i, 6, 30));
    for (const p of pts) expect(Math.hypot(p.x, p.y)).toBeLessThanOrEqual(30 + 1e-9);
    const keys = new Set(pts.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`));
    expect(keys.size).toBe(6);
    expect(coinSpawnOffset(0, 1, 30)).toEqual({ x: 0, y: 0 });
  });

  it('mẻ "in": đồng sau cất cánh trễ stagger; chạm lần lượt; tiền giữ lại giảm dần theo xu; đồng cuối báo last', () => {
    const s = createCoinState();
    const b = startCoinBatch(s, 'in', 60, FROM, TO, P)!;
    expect(b.flights).toHaveLength(6);
    b.flights.forEach((f, i) => expect(f.delay).toBeCloseTo(i * 0.05));
    expect(b.flights.every((f) => f.to.x === TO.x && f.to.y === TO.y)).toBe(true); // vào đúng ô tiền
    expect(heldCoinMoney(s)).toBe(60);
    expect(coinsInFlight(s)).toBe(6);
    expect(hasIncomingCoins(s)).toBe(true);
    expect(coinProgress(b, b.flights[1], P)).toBe(-1);

    const out: CoinLanding[] = [];
    stepCoins(s, 0.3, P, out);
    expect(out).toEqual([]);
    expect(coinProgress(b, b.flights[0], P)).toBeCloseTo(0.5);
    stepCoins(s, 0.31, P, out); // t = 0.61 → đồng 0 chạm (0.6), đồng 1 chưa (0.65)
    expect(out).toEqual([{ kind: 'in', value: 10, last: false, amount: 60 }]);
    expect(heldCoinMoney(s)).toBe(50);
    expect(s.landedIn).toBe(1);
    stepCoins(s, 1, P, out); // còn lại chạm hết trong một bước
    expect(out).toHaveLength(5);
    expect(out.map((l) => l.last)).toEqual([false, false, false, false, true]);
    expect(heldCoinMoney(s)).toBe(0);
    expect(s.batches).toHaveLength(0);
    expect(s.landedIn).toBe(6);
    expect(hasIncomingCoins(s)).toBe(false);
  });

  it('mẻ "out": không giữ tiền (đã trừ ngay), cùng cất cánh từ ô tiền, toả quanh đích, không tính vào landedIn', () => {
    const s = createCoinState();
    const b = startCoinBatch(s, 'out', 4, TO, FROM, P)!;
    expect(b.flights).toHaveLength(4);
    expect(b.flights.every((f) => f.from.x === TO.x && f.from.y === TO.y)).toBe(true);
    expect(heldCoinMoney(s)).toBe(0);
    expect(hasIncomingCoins(s)).toBe(false);
    const out: CoinLanding[] = [];
    stepCoins(s, 2, P, out);
    expect(out.every((l) => l.kind === 'out')).toBe(true);
    expect(s.landedIn).toBe(0);
    expect(coinsInFlight(s)).toBe(0);
  });

  it('không có tiền → không có mẻ; hai mẻ chồng nhau tính riêng', () => {
    const s = createCoinState();
    expect(startCoinBatch(s, 'in', 0, FROM, TO, P)).toBeNull();
    expect(s.started).toBe(0);
    startCoinBatch(s, 'in', 3, FROM, TO, P);
    startCoinBatch(s, 'out', 2, TO, FROM, P);
    expect(s.started).toBe(2);
    expect(heldCoinMoney(s)).toBe(3);
    expect(coinsInFlight(s)).toBe(5);
  });

  it('BUG-018: dropIncomingCoins bỏ mẻ "in" đang bay (số hiện = ví ngay, không còn "+N" sau đó); mẻ "out" bay nốt', () => {
    const s = createCoinState();
    startCoinBatch(s, 'in', 60, FROM, TO, P);
    startCoinBatch(s, 'out', 4, TO, FROM, P);
    const out: CoinLanding[] = [];
    stepCoins(s, 0.61, P, out); // đồng "in" đầu đã chạm (10 quan)
    expect(heldCoinMoney(s)).toBe(50);
    expect(dropIncomingCoins(s)).toBe(50);
    expect(heldCoinMoney(s)).toBe(0);
    expect(hasIncomingCoins(s)).toBe(false);
    expect(s.landedIn).toBe(1); // đồng bị bỏ không tính là đã chạm
    expect(s.batches.map((b) => b.kind)).toEqual(['out']);
    stepCoins(s, 2, P, out);
    expect(out.some((l) => l.kind === 'in')).toBe(false);
    expect(dropIncomingCoins(createCoinState())).toBe(0);
  });

  it('dt 0 (đang tạm dừng) → không đồng nào bay thêm', () => {
    const s = createCoinState();
    startCoinBatch(s, 'in', 6, FROM, TO, P);
    stepCoins(s, 0, P);
    stepCoins(s, 0, P);
    expect(s.batches[0].t).toBe(0);
    expect(heldCoinMoney(s)).toBe(6);
  });

  it('bumpScale: nửa hình sin, hết thời gian → 1', () => {
    expect(bumpScale(0, 0.25, 0.2)).toBe(1);
    expect(bumpScale(0.125, 0.25, 0.2)).toBeCloseTo(1.2);
    expect(bumpScale(0.25, 0.25, 0.2)).toBeCloseTo(1);
    expect(bumpScale(0.1, 0, 0.2)).toBe(1);
  });
});

describe('cây chín gọi hái', () => {
  it('lệch nhịp các ô nằm trong [0, interval) và khác nhau giữa các ô cạnh nhau', () => {
    const offs = Array.from({ length: 9 }, (_, i) => ripeCueOffset(i, 2));
    for (const o of offs) {
      expect(o).toBeGreaterThanOrEqual(0);
      expect(o).toBeLessThan(2);
    }
    expect(new Set(offs.map((o) => o.toFixed(3))).size).toBe(9);
    expect(ripeCueOffset(5, 0)).toBe(0);
  });

  it('mỗi interval một lần: tiến độ 0 → 1 trong duration đầu chu kỳ, nghỉ (-1) phần còn lại; chu kỳ đổi đúng lúc', () => {
    const off = 0.5;
    expect(ripeCueProgress(0.5, 2, off, 0.4)).toBe(0);
    expect(ripeCueProgress(0.7, 2, off, 0.4)).toBeCloseTo(0.5);
    expect(ripeCueProgress(1.0, 2, off, 0.4)).toBe(-1);
    expect(ripeCueProgress(2.6, 2, off, 0.4)).toBeCloseTo(0.25);
    expect(ripeCueProgress(0.2, 2, off, 0.4)).toBe(-1); // trước lệch nhịp (t − off âm) vẫn đúng chu kỳ
    expect(ripeCueCycle(0.49, 2, off)).toBe(-1);
    expect(ripeCueCycle(0.5, 2, off)).toBe(0);
    expect(ripeCueCycle(2.49, 2, off)).toBe(0);
    expect(ripeCueCycle(2.5, 2, off)).toBe(1);
    expect(ripeCueProgress(1, 0, 0, 0.4)).toBe(-1);
  });

  it('nhún: bẹp trước (Y < 1, X > 1) rồi vươn (Y > 1), về 1 ở hai đầu; ngoài khoảng → không nhún', () => {
    const a = ripeHop(0.25, 0.1);
    expect(a.y).toBeLessThan(1);
    expect(a.x).toBeGreaterThan(1);
    const b = ripeHop(0.75, 0.1);
    expect(b.y).toBeGreaterThan(1);
    expect(b.x).toBeLessThan(1);
    expect(ripeHop(0, 0.1)).toEqual({ x: 1, y: 1 });
    expect(ripeHop(-1, 0.1)).toEqual({ x: 1, y: 1 });
    expect(ripeHop(1, 0.1)).toEqual({ x: 1, y: 1 });
    expect(1 - a.y).toBeLessThanOrEqual(0.1);
  });

  it('đốm lấp lánh: chỗ nằm trong hộp, tính lại ra y nguyên, khác nhau giữa các lần; to rồi nhỏ', () => {
    const p1 = sparkleOffset(3, 7, 0, 20, 15);
    const p2 = sparkleOffset(3, 7, 0, 20, 15);
    const p3 = sparkleOffset(3, 8, 0, 20, 15);
    expect(p1).toEqual(p2);
    expect(p1).not.toEqual(p3);
    for (let c = 0; c < 50; c++) {
      const p = sparkleOffset(c, c * 3, c % 2, 20, 15);
      expect(Math.abs(p.x)).toBeLessThanOrEqual(20);
      expect(Math.abs(p.y)).toBeLessThanOrEqual(15);
    }
    expect(sparkleScale(0)).toBe(0);
    expect(sparkleScale(0.5)).toBeCloseTo(1);
    expect(sparkleScale(1)).toBe(0);
  });
});
