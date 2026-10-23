// Kiểu dữ liệu cho các file JSON trong src/data (GDD §3: CropData → crops.json, ...).
// Thêm kiểu mới ở đây khi tạo fish.json, items.json, tools.json, quests.json, brides.json...

/** Mùa trồng: nắng, mưa, hoặc cả hai (GDD §3.1, §3.4). */
export type CropSeason = 'dry' | 'rainy' | 'both';

/** Một loại cây trồng (GDD §3.4 "Danh sách cây"). */
export interface CropData {
  /** Mã kebab-case, dùng làm khóa trong save và tên asset. */
  id: string;
  /** Tên hiển thị tiếng Việt. */
  name: string;
  season: CropSeason;
  /** Mở ở level. */
  unlockLevel: number;
  /** Giá hạt (quan). */
  seedPrice: number;
  /** Số ngày (được tưới) để chín. */
  growDays: number;
  /** Giá bán ở thùng bán (quan). */
  sellPrice: number;
  /** XP khi hái. */
  harvestXp: number;
  /** Ghi chú thiết kế (không hiện trong game). */
  note?: string;
  /**
   * T-022: khóa texture dải hình cây `props/<sprite>.png` (3 khung 64×96: 0 non, 1 lớn, 2 chín). Không có → hạt/mầm/héo
   * dùng hình chung, chín vẽ bằng code.
   */
  sprite?: string;
  /** T-022: khóa texture icon nông sản `items/<icon>.png` (128×128). Không có → icon vẽ bằng code. */
  icon?: string;
  /** T-022: khóa texture icon túi hạt `items/<seedIcon>.png` (128×128). */
  seedIcon?: string;
}

/**
 * Thông tin thêm của một món đồ (GDD §3.2 `ItemData`) — file `items.json`. Prototype chỉ ghi những gì crops.json
 * chưa có: món ăn được và hồi bao nhiêu Sức. Tên / loại món (hạt, nông sản) vẫn suy ra từ crops.json (systems/items.ts).
 */
export interface ItemData {
  /** Mã món, trùng mã trong gùi (vd nông sản 'khoai-lang' = id cây). */
  id: string;
  /** Ăn (chuột phải) hồi bao nhiêu Sức. Không có / 0 = không ăn được. */
  staminaRestore?: number;
  /** Ghi chú thiết kế (không hiện trong game). */
  note?: string;
}

/** Một món bán ở sạp hạt tạm (T-006) — file `seedStall.json`. Giá lấy từ crops.json (`seedPrice`). */
export interface SeedStallItem {
  /** Cây có hạt bán (id trong crops.json). */
  cropId: string;
  /** Tên ngắn trên nút ("Hạt cải"). */
  label: string;
}

/** Việc một nông cụ làm được trên ô ruộng (T-009: mới có cuốc). */
export type ToolUse = 'till';

/**
 * Một nông cụ (GDD §3.8 `ToolData`) — file `tools.json`. T-009 (D-026): nông cụ là MÓN trong gùi/hotbar (kiểu Stardew),
 * phải chọn ô nông cụ thì mới làm việc của nó. Không tiêu hao, không bán, không ăn. Độ bền / số nhát theo bậc: sau.
 */
export interface ToolData {
  /** Mã món trong gùi (kebab-case), vd 'cuoc-go'. */
  id: string;
  /** Tên hiển thị (tooltip gùi). */
  name: string;
  /** Việc làm được khi cầm. */
  use: ToolUse;
  /** Khóa texture icon (config/assets.ts `images`). */
  icon: string;
  note?: string;
}

/** Loại thứ được mở khi lên level (T-042, data/levels.json): khu, cây, công thức / đồ chế, bộ đồ sắm được, việc mới khác. */
export type LevelUnlockKind = 'area' | 'crop' | 'recipe' | 'outfit' | 'feature';

/** Một thứ mở khóa trên thẻ "Mở khóa" (GDD §7). */
export interface LevelUnlockData {
  kind: LevelUnlockKind;
  /** Chữ trên thẻ. Cây (`crop`) bỏ trống được — lấy tên trong crops.json. */
  text?: string;
  /** Cây: id trong crops.json (unlockLevel của cây phải bằng level của dòng này). */
  id?: string;
  /** Dòng phụ nhỏ dưới chữ chính (tuỳ chọn). */
  detail?: string;
}

/** Một dòng levels.json: đạt level này thì mở những gì. */
export interface LevelData {
  level: number;
  unlocks: LevelUnlockData[];
}

/**
 * Một bậc ngoại hình (GDD §3.14 `OutfitData`) — file `outfits.json`. T-042 dùng `name` làm danh hiệu cạnh level trên HUD;
 * phần sắm sửa (giá, giảm giá…) dùng ở T-065….
 */
export interface OutfitData {
  tier: number;
  /** Tên bậc = danh hiệu ("Nghèo kiết xác"). */
  name: string;
  /** Tên bộ đồ ("Bộ đồ lành"). */
  outfitName: string;
  unlockLevel: number;
  cost: number;
  requiresMarried: boolean;
  shopDiscount: number;
  haggleDiscount: number;
}
