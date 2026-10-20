// "Khoảnh khắc sướng" (T-027, GDD §8 "Hái cây", "Nhận tiền", giả thuyết 2 của PT-000). Thuần TS → unit test được:
// - đường bay vồng dùng chung (icon món hái bay vào hotbar, xu bay) + vệt sáng bám sau icon;
// - "mẻ xu": tiền chia thành vài đồng xu bay lần lượt (cách nhau một nhịp), mỗi đồng mang một phần số tiền. Xu BAY VÀO ô
//   tiền (bán qua đêm): số trên HUD chỉ tăng khi từng đồng chạm ô → "số tiền nhảy" theo xu. Xu BAY RA (mua hạt): số đã trừ
//   ngay, xu chỉ là hình;
// - cây chín "gọi hái": mỗi `ripeSparkleIntervalSeconds` nhún nhẹ + lấp lánh, các ô lệch nhịp nhau cho đỡ máy móc.
// Scene giữ trạng thái + vẽ; ở đây chỉ có số.

export interface Point {
  x: number;
  y: number;
}

const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));

/**
 * Điểm trên đường bay vồng từ `from` tới `to` ở tiến độ p (0 → 1): đi ngang / dọc êm (smoothstep — nhanh ở giữa, chậm hai
 * đầu), cộng một vòng cung lên trên cao `arcPx` (sin nửa vòng). Ghi vào `out` (không tạo object mới mỗi frame).
 */
export function flightPoint(from: Point, to: Point, p: number, arcPx: number, out: Point = { x: 0, y: 0 }): Point {
  const q = clamp01(p);
  const ease = q * q * (3 - 2 * q);
  out.x = from.x + (to.x - from.x) * ease;
  out.y = from.y + (to.y - from.y) * ease - arcPx * Math.sin(Math.PI * q);
  return out;
}

/**
 * Vệt sáng sau icon bay: chấm thứ k (1 = sát icon) nằm ở chỗ icon đã qua `k × gapSeconds` trước → tiến độ p − k·gap/dur.
 * Trả về -1 nếu icon chưa bay tới đó (đầu đường bay chưa có vệt).
 */
export function trailProgress(p: number, k: number, gapSeconds: number, durationSeconds: number): number {
  if (durationSeconds <= 0) return -1;
  const q = p - (k * gapSeconds) / durationSeconds;
  return q < 0 ? -1 : q;
}

/** Chấm vệt thứ k (1…count) mờ và nhỏ dần về phía đuôi: hệ số 0–1 (nhân với độ đục / cỡ gốc). */
export function trailFade(k: number, count: number): number {
  if (count <= 0 || k < 1 || k > count) return 0;
  return 1 - (k - 1) / count;
}

// ---------------------------------------------------------------- xu bay

/** Xu bay VÀO ô tiền (nhận tiền) hoặc bay RA khỏi ô tiền (trả tiền). */
export type CoinKind = 'in' | 'out';

export interface CoinParams {
  /** Tối đa bấy nhiêu đồng xu một mẻ (tiền ít hơn thì ít xu hơn — mỗi xu ít nhất 1 quan). */
  count: number;
  /** Một đồng bay mất bao lâu (giây). */
  flySeconds: number;
  /** Đồng sau cất cánh sau đồng trước bấy nhiêu giây. */
  staggerSeconds: number;
  /** Các đồng xuất phát toả quanh điểm gốc trong bán kính này (px màn). */
  spreadPx: number;
  /** Vồng lên cao bao nhiêu (px màn). */
  arcPx: number;
}

export interface CoinFlight {
  from: Point;
  to: Point;
  /** Cất cánh sau bấy nhiêu giây kể từ lúc mẻ bắt đầu. */
  delay: number;
  /** Số quan đồng xu này mang (mẻ "in": cộng vào số hiện khi chạm ô tiền). */
  value: number;
  landed: boolean;
}

export interface CoinBatch {
  kind: CoinKind;
  /** Tổng số quan của mẻ. */
  amount: number;
  /** Giây đã trôi từ lúc mẻ bắt đầu. */
  t: number;
  flights: CoinFlight[];
}

export interface CoinState {
  batches: CoinBatch[];
  /** Tổng số đồng xu "in" đã chạm ô tiền (HUD so để biết lúc nào cho ô tiền nảy). */
  landedIn: number;
  /** Tổng số mẻ đã bắt đầu (QA). */
  started: number;
}

/** Một đồng vừa chạm đích trong lần `stepCoins` này. `last` = đồng cuối của mẻ. */
export interface CoinLanding {
  kind: CoinKind;
  value: number;
  last: boolean;
  /** Tổng số quan của mẻ (để báo "+30 quan" khi đồng cuối chạm). */
  amount: number;
}

export const createCoinState = (): CoinState => ({ batches: [], landedIn: 0, started: 0 });

/**
 * Chia `amount` quan thành tối đa `maxCount` đồng (số nguyên, tổng đúng bằng amount, các đồng chênh nhau ≤ 1). Tiền ít hơn
 * số xu → mỗi đồng 1 quan. amount ≤ 0 → không có xu.
 */
export function coinShares(amount: number, maxCount: number): number[] {
  const a = Math.floor(amount);
  if (!(a > 0) || maxCount < 1) return [];
  const n = Math.min(Math.floor(maxCount), a);
  const out: number[] = [];
  for (let i = 0; i < n; i++) out.push(Math.floor((a * (i + 1)) / n) - Math.floor((a * i) / n));
  return out;
}

/** Chỗ xuất phát của đồng thứ i trong n đồng: toả đều quanh tâm theo góc vàng (không trùng nhau, không ngẫu nhiên). */
export function coinSpawnOffset(i: number, n: number, spreadPx: number, out: Point = { x: 0, y: 0 }): Point {
  if (n <= 1 || spreadPx <= 0) {
    out.x = 0;
    out.y = 0;
    return out;
  }
  const angle = i * 2.399963229728653; // góc vàng (rad)
  const r = spreadPx * Math.sqrt((i + 0.5) / n);
  out.x = Math.cos(angle) * r;
  out.y = Math.sin(angle) * r;
  return out;
}

/**
 * Bắt đầu một mẻ xu bay từ `from` tới `to` (toạ độ màn). Mẻ "in" bay vào ô tiền: các đồng toả quanh điểm gốc; mẻ "out" bay
 * ra khỏi ô tiền: các đồng toả quanh ĐÍCH (cùng cất cánh từ ô tiền, rơi lả tả vào chỗ mua). Không có tiền → null.
 */
export function startCoinBatch(s: CoinState, kind: CoinKind, amount: number, from: Point, to: Point, p: CoinParams): CoinBatch | null {
  const shares = coinShares(amount, p.count);
  if (shares.length === 0) return null;
  const off: Point = { x: 0, y: 0 };
  const flights = shares.map((value, i) => {
    coinSpawnOffset(i, shares.length, p.spreadPx, off);
    const f = kind === 'in' ? { x: from.x + off.x, y: from.y + off.y } : { x: from.x, y: from.y };
    const d = kind === 'in' ? { x: to.x, y: to.y } : { x: to.x + off.x, y: to.y + off.y };
    return { from: f, to: d, delay: i * p.staggerSeconds, value, landed: false };
  });
  const batch: CoinBatch = { kind, amount: shares.reduce((a, b) => a + b, 0), t: 0, flights };
  s.batches.push(batch);
  s.started++;
  return batch;
}

/** Tiến độ bay của một đồng: -1 = chưa cất cánh, 0 → 1 = đang bay, ≥ 1 = đã chạm. */
export function coinProgress(batch: CoinBatch, f: CoinFlight, p: CoinParams): number {
  const local = batch.t - f.delay;
  if (local < 0) return -1;
  if (p.flySeconds <= 0) return 1;
  return Math.min(1, local / p.flySeconds);
}

/**
 * Cho thời gian trôi: đồng nào bay đủ `flySeconds` thì chạm (ghi vào `out`, mỗi đồng đúng một lần, theo thứ tự cất cánh).
 * Mẻ đã chạm hết thì bỏ. `out` được xoá trước khi ghi — truyền lại cùng mảng mỗi frame (không tạo mảng mới).
 */
export function stepCoins(s: CoinState, dt: number, p: CoinParams, out: CoinLanding[] = []): CoinLanding[] {
  out.length = 0;
  if (dt > 0) for (const b of s.batches) b.t += dt;
  for (const b of s.batches) {
    for (let i = 0; i < b.flights.length; i++) {
      const f = b.flights[i];
      if (f.landed || coinProgress(b, f, p) < 1) continue;
      f.landed = true;
      if (b.kind === 'in') s.landedIn++;
      out.push({ kind: b.kind, value: f.value, last: b.flights.every((x) => x.landed), amount: b.amount });
    }
  }
  for (let i = s.batches.length - 1; i >= 0; i--) if (s.batches[i].flights.every((f) => f.landed)) s.batches.splice(i, 1);
  return out;
}

/** Số quan đã vào ví nhưng xu chưa chạm ô tiền (mẻ "in" còn bay) — HUD hiện ví trừ đi số này. */
export function heldCoinMoney(s: CoinState): number {
  let n = 0;
  for (const b of s.batches) if (b.kind === 'in') for (const f of b.flights) if (!f.landed) n += f.value;
  return n;
}

/** Số đồng xu chưa chạm (gồm cả đồng chờ cất cánh) — QA. */
export function coinsInFlight(s: CoinState): number {
  let n = 0;
  for (const b of s.batches) for (const f of b.flights) if (!f.landed) n++;
  return n;
}

/** Có mẻ xu "in" đang bay (HUD đưa ô tiền lên trên lớp tối khi xu bay về lúc sáng ra). */
export function hasIncomingCoins(s: CoinState): boolean {
  return s.batches.some((b) => b.kind === 'in');
}

/** "Nảy" (ô tiền, ô hotbar): phóng thêm `amount` theo nửa hình sin trong `duration` giây; `remaining` ≤ 0 → 1. */
export function bumpScale(remaining: number, duration: number, amount: number): number {
  if (remaining <= 0 || duration <= 0) return 1;
  const p = 1 - Math.min(1, remaining / duration);
  return 1 + amount * Math.sin(Math.PI * p);
}

// ---------------------------------------------------------------- cây chín gọi hái

/**
 * Lệch nhịp của ô thứ `index` trong chu kỳ (giây, 0 … interval): rải đều theo tỷ lệ vàng → các cây chín cạnh nhau không
 * nhún cùng lúc (cả luống nhún đồng loạt trông như máy).
 */
export function ripeCueOffset(index: number, interval: number): number {
  if (interval <= 0) return 0;
  const frac = (index * 0.6180339887498949) % 1;
  return frac * interval;
}

/** Chu kỳ thứ mấy (số nguyên, có thể âm lúc đầu) — đổi số = một lần "gọi hái" mới bắt đầu. */
export function ripeCueCycle(t: number, interval: number, offset: number): number {
  if (interval <= 0) return 0;
  return Math.floor((t - offset) / interval);
}

/** Tiến độ lần "gọi hái" đang chạy (0 → 1 trong `duration` giây đầu mỗi chu kỳ), -1 = đang nghỉ giữa hai lần. */
export function ripeCueProgress(t: number, interval: number, offset: number, duration: number): number {
  if (interval <= 0 || duration <= 0) return -1;
  const local = (((t - offset) % interval) + interval) % interval;
  return local < duration ? local / duration : -1;
}

/**
 * Nhún nhẹ của cây chín ở tiến độ p (gốc cây đứng yên — sprite có gốc ở chân): nửa đầu bẹp xuống (Y nhỏ, X to), nửa sau
 * vươn lên (Y to, X nhỏ), tắt dần về 1. `amount` = độ bẹp lớn nhất (0.1 = 10%). p ngoài [0, 1) → không nhún.
 */
export function ripeHop(p: number, amount: number, out: { x: number; y: number } = { x: 1, y: 1 }): { x: number; y: number } {
  if (p < 0 || p >= 1 || amount <= 0) {
    out.x = 1;
    out.y = 1;
    return out;
  }
  const s = Math.sin(Math.PI * 2 * p) * (1 - p);
  out.y = 1 - amount * s;
  out.x = 1 + amount * 0.5 * s;
  return out;
}

/**
 * Chỗ đốm lấp lánh thứ j của lần gọi hái thứ `cycle` trên ô `index` — lệch quanh ngọn cây trong hộp ±halfW / ±halfH (px),
 * "ngẫu nhiên" nhưng tính được (cùng đầu vào → cùng chỗ; không dùng Math.random để test được).
 */
export function sparkleOffset(index: number, cycle: number, j: number, halfW: number, halfH: number, out: Point = { x: 0, y: 0 }): Point {
  out.x = (hash01(index, cycle, j, 1) * 2 - 1) * halfW;
  out.y = (hash01(index, cycle, j, 2) * 2 - 1) * halfH;
  return out;
}

/** Đốm lấp lánh: phóng to rồi thu lại theo nửa hình sin trong đời của nó (p 0 → 1); ngoài khoảng → 0 (ẩn). */
export function sparkleScale(p: number): number {
  if (p <= 0 || p >= 1) return 0;
  return Math.sin(Math.PI * p);
}

/** Băm vài số nguyên → số trong [0, 1). */
function hash01(a: number, b: number, c: number, d: number): number {
  let h = 0x811c9dc5;
  for (const v of [a, b, c, d]) {
    h ^= v | 0;
    h = Math.imul(h, 0x01000193);
    h ^= h >>> 13;
  }
  return (h >>> 0) / 0x100000000;
}
