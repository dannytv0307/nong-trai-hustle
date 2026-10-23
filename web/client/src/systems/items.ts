// Món đồ trong gùi (T-003). Prototype chỉ có 2 loại món, suy ra từ crops.json:
// - hạt giống: id 'hat-<cropId>' (vd 'hat-rau-cai'), gieo được;
// - nông sản: id = cropId (vd 'rau-cai'), hái được, bán được (T-006).
// T-004: món ăn được + số Sức hồi lấy từ data/items.json (`staminaRestore`) — hiện chỉ khoai lang sống +8.
// T-009 (D-026): thêm loại thứ ba — nông cụ (data/tools.json, vd 'cuoc-go'). Nông cụ nằm trong gùi/hotbar như món
// khác nhưng không tiêu hao, không bán, không ăn; phải CHỌN ô nông cụ thì mới làm việc của nó (cuốc).
import itemsJson from '../data/items.json';
import toolsJson from '../data/tools.json';
import type { ItemData, ToolData, ToolUse } from '../data/types';
import { CROPS, cropById } from './crops';
import { addItem, countOf, createInventory, findSlot, type Inventory } from './inventory';

export type ItemKind = 'seed' | 'crop' | 'tool';

export interface ItemInfo {
  id: string;
  kind: ItemKind;
  /** Cây tương ứng (hạt của cây nào / nông sản của cây nào). Nông cụ: chuỗi rỗng. */
  cropId: string;
  /** Tên hiện cho người chơi (tooltip trong gùi). */
  name: string;
  /** Ăn hồi bao nhiêu Sức (0 = không ăn được). Hạt giống luôn 0. */
  staminaRestore: number;
}

const ITEM_DATA = new Map<string, ItemData>((itemsJson as ItemData[]).map((d) => [d.id, d]));
const TOOL_DATA = new Map<string, ToolData>((toolsJson as ToolData[]).map((d) => [d.id, d]));

/** Mã món cái cuốc (cuốc gỗ, bậc 1) — có sẵn ở ô 1 khi bắt đầu game mới. */
export const HOE_ITEM_ID = 'cuoc-go';

/** Dữ liệu nông cụ (null nếu không phải nông cụ). */
export const toolOf = (id: string): ToolData | null => TOOL_DATA.get(id) ?? null;

export const isToolItem = (id: string): boolean => TOOL_DATA.has(id);

/** Việc nông cụ ở ô hotbar đang chọn làm được (null = ô trống / không phải nông cụ). */
export function selectedToolUse(inv: Inventory): ToolUse | null {
  const s = inv.slots[inv.selected];
  return s ? (toolOf(s.id)?.use ?? null) : null;
}

/** Đang cầm cuốc (ô hotbar đang chọn là nông cụ cuốc) — điều kiện để click ô cỏ / cuốc dở mới cuốc (D-026). */
export const canTillWithSelected = (inv: Inventory): boolean => selectedToolUse(inv) === 'till';

/** Số Sức món này hồi khi ăn (0 = không phải đồ ăn: hạt giống, nông cụ, rau cải sống, mã lạ…). */
export function staminaRestoreOf(id: string): number {
  if (isSeedItem(id) || isToolItem(id)) return 0;
  return Math.max(0, ITEM_DATA.get(id)?.staminaRestore ?? 0);
}

const SEED_PREFIX = 'hat-';

/** Mã món hạt giống của một cây. */
export const seedItemId = (cropId: string): string => SEED_PREFIX + cropId;

/** Mã món nông sản khi hái một cây. */
export const cropItemId = (cropId: string): string => cropId;

export function isSeedItem(id: string): boolean {
  return id.startsWith(SEED_PREFIX) && cropById(id.slice(SEED_PREFIX.length)) !== undefined;
}

/** Thông tin món (null nếu mã lạ — vd save cũ có món đã bỏ). */
export function itemInfo(id: string): ItemInfo | null {
  const tool = toolOf(id);
  if (tool) return { id, kind: 'tool', cropId: '', name: tool.name, staminaRestore: 0 };
  if (isSeedItem(id)) {
    const crop = cropById(id.slice(SEED_PREFIX.length))!;
    return { id, kind: 'seed', cropId: crop.id, name: `Hạt ${crop.name.toLowerCase()}`, staminaRestore: 0 };
  }
  const crop = cropById(id);
  if (crop) return { id, kind: 'crop', cropId: crop.id, name: crop.name, staminaRestore: staminaRestoreOf(id) };
  return null;
}

/**
 * T-022: khóa texture icon thật của món (bảng ánh xạ nằm trong dữ liệu — tools.json `icon`, crops.json `icon` /
 * `seedIcon`; tên file do art đặt, không cần trùng id món). null = món chưa có icon → vẽ bằng code.
 */
export function itemIconKey(id: string): string | null {
  const tool = toolOf(id);
  if (tool) return tool.icon || null;
  if (isSeedItem(id)) return cropById(id.slice(SEED_PREFIX.length))?.seedIcon ?? null;
  return cropById(id)?.icon ?? null;
}

/**
 * T-041: mã MỌI món có thật, theo thứ tự nông cụ → (hạt, nông sản) từng cây theo crops.json — bảng Thử chọn "cho món bất
 * kỳ" từ danh sách này. Thêm món mới vào dữ liệu là tự có ở đây.
 */
export function allItemIds(): string[] {
  return [...TOOL_DATA.keys(), ...CROPS.flatMap((c) => [seedItemId(c.id), cropItemId(c.id)])];
}

/** Cây sẽ mọc từ món hạt này (null nếu không phải hạt). */
export function cropOfSeed(id: string): string | null {
  return isSeedItem(id) ? id.slice(SEED_PREFIX.length) : null;
}

/**
 * Chọn ô hạt để gieo (GDD §3.3):
 * 1. Ô hotbar đang chọn là hạt → hạt đó.
 * 2. Không phải hạt → hạt gieo lần trước (`lastSeedId`), lấy ở ô đầu tiên còn hạt đó.
 * 3. Chưa gieo lần nào (`lastSeedId` null) → hạt đầu tiên trong gùi (Giả định — GDD không nói; để người mới
 *    lỡ chọn ô trống vẫn gieo được). Đã từng gieo mà hạt đó hết → KHÔNG tự đổi sang hạt khác (tránh gieo nhầm
 *    cả luống), trả -1 → bong bóng "hết hạt rồi".
 * Trả về index ô, -1 nếu không có hạt để gieo.
 */
export function pickSeedSlot(inv: Inventory): number {
  const sel = inv.slots[inv.selected];
  if (sel && isSeedItem(sel.id)) return inv.selected;
  if (inv.lastSeedId) return countOf(inv, inv.lastSeedId) > 0 ? findSlot(inv, inv.lastSeedId) : -1;
  return inv.slots.findIndex((s) => s !== null && isSeedItem(s.id));
}

/**
 * Gùi lúc bắt đầu: nông cụ `startTools` (mỗi món 1 cái, theo thứ tự — cuốc ở ô 1) rồi `startSeeds` (id cây → số hạt,
 * theo thứ tự khai báo) xếp vào hotbar từ ô 1. Ô chọn ban đầu = ô 1 (đang cầm cuốc — vào game là cuốc được ngay).
 */
export function createStartInventory(
  startSeeds: Readonly<Record<string, number>>,
  bagSlots: number,
  hotbarSlots: number,
  stackMax: number,
  startTools: readonly string[] = [],
): Inventory {
  const inv = createInventory(bagSlots, hotbarSlots, stackMax);
  for (const id of startTools) if (isToolItem(id)) addItem(inv, id, 1);
  for (const [cropId, count] of Object.entries(startSeeds)) {
    if (cropById(cropId) && count > 0) addItem(inv, seedItemId(cropId), count);
  }
  return inv;
}
