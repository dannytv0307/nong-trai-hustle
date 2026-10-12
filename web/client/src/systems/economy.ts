// Tiền, giá, thùng bán, mua hạt (T-006, GDD §3.9). Thuần TS → unit test được, save chỉ việc ghi số tiền + thùng ra JSON.
// Luật chính: tiền KHÔNG BAO GIỜ âm (nút mua xám khi thiếu tiền); đồ bỏ vào thùng bán chưa thành tiền ngay — cuối ngày
// (T-007, lúc qua đêm) mới gọi `sellBoxContents` để bán hết theo giá gốc trong crops.json.
import { cropById } from './crops';
import { addItem, spaceFor, type Inventory } from './inventory';
import { isSeedItem, itemInfo, seedItemId } from './items';

/** Ví tiền (quan). Chỉ sửa qua các hàm dưới đây để luật "không âm, số nguyên" luôn đúng. */
export interface Wallet {
  money: number;
}

/** Chuẩn hóa một số tiền: số nguyên ≥ 0 (NaN / âm / vô cực → 0, số lẻ làm tròn xuống). */
export function normalizeMoney(n: number): number {
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.floor(n);
}

export function createWallet(start: number): Wallet {
  return { money: normalizeMoney(start) };
}

/** Đủ tiền trả `price` không (giá lạ — âm / NaN — coi như không mua được). */
export function hasMoney(w: Wallet, price: number): boolean {
  return Number.isFinite(price) && price >= 0 && w.money >= price;
}

/** Trả `price` quan. Thiếu tiền (hoặc giá lạ) → không trừ, trả false. Tiền không bao giờ âm. */
export function spend(w: Wallet, price: number): boolean {
  if (!hasMoney(w, price)) return false;
  w.money = normalizeMoney(w.money - price);
  return true;
}

/** Nhận `amount` quan (âm / NaN bị bỏ qua). Trả về số tiền thật sự được cộng. */
export function earn(w: Wallet, amount: number): number {
  const a = normalizeMoney(amount);
  w.money += a;
  return a;
}

/** Đặt thẳng số tiền (save cũ / hook test) — vẫn qua luật không âm. */
export function setMoney(w: Wallet, n: number): number {
  w.money = normalizeMoney(n);
  return w.money;
}

/**
 * Giá bán ở thùng bán (giá gốc `sellPrice` trong crops.json) của một món; null = không bán được.
 * Hạt giống KHÔNG bán được: GDD §3.9 chỉ nói bán nông sản theo giá gốc, crops.json chỉ có giá bán của nông sản
 * (Giả định T-006 — tránh mua hạt rồi bán lại; game-planner chốt sau nếu muốn khác).
 */
export function sellPriceOf(itemId: string): number | null {
  if (isSeedItem(itemId)) return null;
  const info = itemInfo(itemId);
  if (!info || info.kind !== 'crop') return null;
  return cropById(info.cropId)?.sellPrice ?? null;
}

export const canSellItem = (itemId: string): boolean => sellPriceOf(itemId) !== null;

/** Giá một hạt của cây (seedPrice trong crops.json); null = cây không có trong dữ liệu. */
export function seedPriceOf(cropId: string): number | null {
  return cropById(cropId)?.seedPrice ?? null;
}

/** Tổng tiền thùng bán sẽ bán được cuối ngày (giá gốc × số lượng; món không bán được tính 0). */
export function sellBoxTotal(box: Inventory): number {
  let total = 0;
  for (const s of box.slots) if (s) total += (sellPriceOf(s.id) ?? 0) * s.count;
  return total;
}

export interface SaleLine {
  id: string;
  count: number;
  unitPrice: number;
  subtotal: number;
}

export interface SaleReport {
  /** Tổng tiền vừa cộng vào ví. */
  earned: number;
  /** Tổng số món đã bán. */
  itemsSold: number;
  /** Từng loại món (gộp các chồng cùng loại), theo thứ tự gặp trong thùng — cho màn tổng kết ngày (T-007). */
  lines: SaleLine[];
}

/**
 * "Bán thùng" (cuối ngày — T-007 gọi lúc qua đêm): bán hết món bán được theo giá gốc, cộng tiền vào ví, ô đó thành
 * trống. Món không bán được (không nên có, vì thùng không nhận) để nguyên trong thùng.
 */
export function sellBoxContents(box: Inventory, w: Wallet): SaleReport {
  const lines: SaleLine[] = [];
  let earned = 0;
  let itemsSold = 0;
  for (let i = 0; i < box.slots.length; i++) {
    const s = box.slots[i];
    if (!s) continue;
    const price = sellPriceOf(s.id);
    if (price === null) continue;
    const subtotal = price * s.count;
    const line = lines.find((l) => l.id === s.id);
    if (line) {
      line.count += s.count;
      line.subtotal += subtotal;
    } else {
      lines.push({ id: s.id, count: s.count, unitPrice: price, subtotal });
    }
    earned += subtotal;
    itemsSold += s.count;
    box.slots[i] = null;
  }
  earn(w, earned);
  return { earned, itemsSold, lines };
}

export type BuyResult =
  | { ok: true; cropId: string; count: number; cost: number; firstSlot: number }
  | { ok: false; reason: 'noMoney' | 'bagFull' | 'unknown' };

/**
 * Mua hạt ở sạp (T-006): mua tối đa `maxCount` hạt của cây `cropId` — được bao nhiêu mua bấy nhiêu (theo tiền có và
 * chỗ trống trong gùi), ít nhất 1. Không đủ tiền cho 1 hạt → 'noMoney'; gùi không còn chỗ cho 1 hạt → 'bagFull'.
 * Tiền trừ đúng số hạt vào gùi; không bao giờ trừ tiền mà không có hạt, không bao giờ âm tiền.
 */
export function buySeeds(w: Wallet, inv: Inventory, cropId: string, maxCount = 1): BuyResult {
  const price = seedPriceOf(cropId);
  const want = Math.floor(maxCount);
  if (price === null || want <= 0) return { ok: false, reason: 'unknown' };
  const id = seedItemId(cropId);
  const affordable = price > 0 ? Math.floor(w.money / price) : want;
  if (affordable <= 0) return { ok: false, reason: 'noMoney' };
  const room = spaceFor(inv, id);
  if (room <= 0) return { ok: false, reason: 'bagFull' };
  const count = Math.min(want, affordable, room);
  const cost = price * count;
  if (!spend(w, cost)) return { ok: false, reason: 'noMoney' };
  const added = addItem(inv, id, count);
  return { ok: true, cropId, count, cost, firstSlot: added.firstSlot };
}
