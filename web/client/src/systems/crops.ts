// Tra cứu dữ liệu cây trồng (GDD §3.4, dữ liệu ở src/data/crops.json). Thuần TS — test được.
import cropsJson from '../data/crops.json';
import type { CropData } from '../data/types';

export const CROPS: readonly CropData[] = cropsJson as CropData[];

const byId = new Map<string, CropData>(CROPS.map((c) => [c.id, c]));

/** Cây theo id (undefined nếu không có — vd save cũ có cây đã bị xóa khỏi dữ liệu). */
export function cropById(id: string): CropData | undefined {
  return byId.get(id);
}

/**
 * Số ngày (được tưới) để cây chín. Cây không có trong dữ liệu → coi như 1 ngày
 * (không để ô kẹt mãi một cây "ma" không bao giờ chín được).
 */
export function growDaysOf(cropId: string): number {
  return byId.get(cropId)?.growDays ?? 1;
}
