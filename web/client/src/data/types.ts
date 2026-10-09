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
}
