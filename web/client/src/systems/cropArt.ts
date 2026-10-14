// Chọn hình cây trồng (T-022, asset-list §3): dải khung 64×96 `crop-common` (0 hạt, 1 mầm chung, 2 héo) và
// `crop-<id>` riêng từng cây (0 non, 1 lớn, 2 chín). Thuần TS — test được không cần Phaser.
import type { CropStage, PlotCrop } from './farm';

/** Dải khung chung cho mọi cây. */
export const CROP_COMMON_SHEET = 'crop-common';
export const COMMON_FRAME_SEED = 0;
export const COMMON_FRAME_SPROUT = 1;
export const COMMON_FRAME_WITHERED = 2;
export const OWN_FRAME_YOUNG = 0;
export const OWN_FRAME_GROWN = 1;
export const OWN_FRAME_RIPE = 2;

/** Hình một cây: dải nào, khung nào; `sheet` null = không có hình → nơi gọi vẽ bằng code (drawCrop). */
export interface CropVisual {
  sheet: string | null;
  frame: number;
}

/**
 * Khung cây theo giai đoạn:
 * - hạt → chung khung 0; héo → chung khung 2;
 * - đang lớn → dải riêng: tuổi / số ngày chín < `grownAt` → khung 0 (non), còn lại khung 1 (lớn);
 * - chín → dải riêng khung 2.
 * `ownSheet` = dải riêng của cây (null nếu cây chưa có hình / ảnh không tải được): đang lớn lùi về mầm chung,
 * chín → `sheet` null (vẽ bằng code).
 */
export function cropVisual(crop: PlotCrop, stage: CropStage, growDays: number, ownSheet: string | null, grownAt: number): CropVisual {
  switch (stage) {
    case 'seed':
      return { sheet: CROP_COMMON_SHEET, frame: COMMON_FRAME_SEED };
    case 'withered':
      return { sheet: CROP_COMMON_SHEET, frame: COMMON_FRAME_WITHERED };
    case 'growing': {
      if (!ownSheet) return { sheet: CROP_COMMON_SHEET, frame: COMMON_FRAME_SPROUT };
      const ratio = growDays > 0 ? crop.age / growDays : 1;
      return { sheet: ownSheet, frame: ratio < grownAt ? OWN_FRAME_YOUNG : OWN_FRAME_GROWN };
    }
    case 'ripe':
      return ownSheet ? { sheet: ownSheet, frame: OWN_FRAME_RIPE } : { sheet: null, frame: 0 };
  }
}

/** Trộn hai màu 0xRRGGBB (t = 0 → a, 1 → b). */
export function mixRgb(a: number, b: number, t: number): number {
  const ch = (c: number, s: number) => (c >> s) & 0xff;
  const m = (s: number) => Math.round(ch(a, s) + (ch(b, s) - ch(a, s)) * t) << s;
  return m(16) | m(8) | m(0);
}

/**
 * Màu tint (nhân màu) cho cây khát: trắng (= giữ nguyên) ngả về màu đất khô `color` theo `amount`. Nhân với màu này
 * làm kênh xanh lam/lục tụt nhiều hơn đỏ → lá ngả vàng nâu, bớt tươi.
 */
export const thirstyTint = (color: number, amount: number): number => mixRgb(0xffffff, color, amount);
