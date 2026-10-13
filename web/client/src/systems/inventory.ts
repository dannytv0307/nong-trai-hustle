// Gùi + hotbar (T-003, GDD §3.3 "hotbar", §3.9 "gùi"). Thuần TS → unit test được, save chỉ việc ghi object ra JSON.
// Gùi là một dãy ô; HÀNG ĐẦU (hotbarSize ô đầu tiên) chính là hotbar (giống Stardew). Mỗi ô chứa một chồng
// đồ cùng loại, tối đa `stackMax` món. T-009 (D-026): nông cụ (cuốc) cũng là một món trong gùi, chồng 1 cái.

/** Một chồng đồ trong một ô. */
export interface ItemStack {
  /** Mã món (vd 'hat-rau-cai', 'rau-cai' — xem systems/items.ts). */
  id: string;
  /** Số lượng, 1…stackMax. Ô trống là null chứ không phải count 0. */
  count: number;
}

export interface Inventory {
  /** Mọi ô của gùi; ô 0…hotbarSize-1 là hotbar. */
  slots: (ItemStack | null)[];
  /** Ô hotbar đang chọn (0…hotbarSize-1). */
  selected: number;
  hotbarSize: number;
  stackMax: number;
  /** Hạt gieo lần trước (GDD §3.3: ô đang chọn không phải hạt → dùng hạt gieo lần trước). null = chưa gieo lần nào. */
  lastSeedId: string | null;
}

export function createInventory(slotCount: number, hotbarSize: number, stackMax: number): Inventory {
  const size = Math.max(1, Math.floor(slotCount));
  return {
    slots: Array.from({ length: size }, () => null),
    selected: 0,
    hotbarSize: Math.max(1, Math.min(size, Math.floor(hotbarSize))),
    stackMax: Math.max(1, Math.floor(stackMax)),
    lastSeedId: null,
  };
}

/** Tổng số món `id` trong gùi. */
export function countOf(inv: Inventory, id: string): number {
  let n = 0;
  for (const s of inv.slots) if (s && s.id === id) n += s.count;
  return n;
}

/** Ô đầu tiên chứa món `id` (theo thứ tự hotbar trước, rồi hàng dưới), -1 nếu không có. */
export function findSlot(inv: Inventory, id: string): number {
  return inv.slots.findIndex((s) => s !== null && s.id === id);
}

/** Còn nhét thêm được bao nhiêu món `id` (chỗ trống trong chồng cùng loại + ô trống). */
export function spaceFor(inv: Inventory, id: string): number {
  let n = 0;
  for (const s of inv.slots) {
    if (!s) n += inv.stackMax;
    else if (s.id === id) n += Math.max(0, inv.stackMax - s.count);
  }
  return n;
}

/** Nhét đủ `count` món `id` được không (gùi đầy → false, GDD §3.9 "gùi đầy"). */
export function canAdd(inv: Inventory, id: string, count = 1): boolean {
  return spaceFor(inv, id) >= count;
}

export interface AddResult {
  /** Số món đã nhét được (có thể ít hơn yêu cầu nếu gùi đầy). */
  added: number;
  /** Ô đầu tiên nhận đồ (để icon bay đúng ô), -1 nếu không nhét được gì. */
  firstSlot: number;
}

/**
 * Thêm đồ vào gùi (T-003: "đồ hái vào ô cùng loại hoặc ô trống đầu tiên"):
 * lấp các chồng cùng loại còn chỗ trước (theo thứ tự ô), rồi mới mở ô trống đầu tiên.
 * Không đủ chỗ thì nhét được bao nhiêu hay bấy nhiêu — người gọi muốn "tất cả hoặc không" thì kiểm canAdd trước.
 */
export function addItem(inv: Inventory, id: string, count = 1): AddResult {
  let left = Math.max(0, Math.floor(count));
  let firstSlot = -1;
  const take = (i: number, n: number) => {
    if (n <= 0) return;
    if (firstSlot < 0) firstSlot = i;
    left -= n;
  };
  for (let i = 0; i < inv.slots.length && left > 0; i++) {
    const s = inv.slots[i];
    if (!s || s.id !== id) continue;
    const n = Math.min(left, inv.stackMax - s.count);
    if (n <= 0) continue;
    s.count += n;
    take(i, n);
  }
  for (let i = 0; i < inv.slots.length && left > 0; i++) {
    if (inv.slots[i]) continue;
    const n = Math.min(left, inv.stackMax);
    inv.slots[i] = { id, count: n };
    take(i, n);
  }
  return { added: Math.max(0, Math.floor(count)) - left, firstSlot };
}

/** Bớt tối đa `count` món ở ô `index`; hết thì ô thành trống. Trả về số món đã bớt. */
export function removeFromSlot(inv: Inventory, index: number, count = 1): number {
  const s = inv.slots[index];
  if (!s || count <= 0) return 0;
  const n = Math.min(s.count, Math.floor(count));
  s.count -= n;
  if (s.count <= 0) inv.slots[index] = null;
  return n;
}

/** Ghi đè một ô (dùng cho dữ liệu khởi đầu / phím thử). count ≤ 0 hoặc id null → ô trống. Giới hạn ở stackMax. */
export function setSlot(inv: Inventory, index: number, id: string | null, count: number): void {
  if (index < 0 || index >= inv.slots.length) return;
  inv.slots[index] = id && count > 0 ? { id, count: Math.min(inv.stackMax, Math.floor(count)) } : null;
}

/** Chọn ô hotbar (phím 1–9 → index 0–8). Ngoài khoảng hotbar thì không đổi. Trả về true nếu đổi. */
export function selectSlot(inv: Inventory, index: number): boolean {
  if (!Number.isInteger(index) || index < 0 || index >= inv.hotbarSize || index === inv.selected) return false;
  inv.selected = index;
  return true;
}

/** Cuộn chuột: dịch ô chọn `steps` ô (dương = sang phải), vòng quanh hotbar (ô 9 → ô 1). */
export function scrollSelect(inv: Inventory, steps: number): void {
  const n = inv.hotbarSize;
  inv.selected = (((inv.selected + Math.trunc(steps)) % n) + n) % n;
}

/** Chồng đồ ở ô hotbar đang chọn (null nếu ô trống). */
export function selectedStack(inv: Inventory): ItemStack | null {
  return inv.slots[inv.selected] ?? null;
}

export interface MoveResult {
  /** Số món đã chuyển (0 = không chuyển được gì: ô trống, bên nhận đầy…). */
  moved: number;
  /** Mã món đã chuyển (null nếu ô nguồn trống). */
  id: string | null;
  /** Ô đầu tiên bên nhận có đồ mới (-1 nếu không chuyển được). */
  toSlot: number;
}

/**
 * Chuyển tối đa `count` món từ ô `index` của gùi `from` sang gùi `to` (T-006: gùi ↔ thùng bán). Bên nhận xếp như
 * addItem (lấp chồng cùng loại trước, rồi ô trống đầu tiên). Bên nhận không đủ chỗ → chuyển được bao nhiêu hay bấy
 * nhiêu, phần còn lại ở nguyên ô cũ — không bao giờ mất đồ hay sinh thêm đồ.
 */
export function moveFromSlot(from: Inventory, index: number, to: Inventory, count: number): MoveResult {
  const s = from.slots[index];
  if (!s || count <= 0) return { moved: 0, id: s?.id ?? null, toSlot: -1 };
  const id = s.id;
  const want = Math.min(s.count, Math.floor(count), spaceFor(to, id));
  if (want <= 0) return { moved: 0, id, toSlot: -1 };
  const added = addItem(to, id, want);
  removeFromSlot(from, index, added.added);
  return { moved: added.added, id, toSlot: added.firstSlot };
}
