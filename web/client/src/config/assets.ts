// Danh sách asset (khóa → đường dẫn trong public/). Preload đọc danh sách này,
// scene dùng khóa — đổi tên file chỉ sửa một chỗ.
import type { Facing } from '../systems/movement';

const ART = 'assets/art';
const AUDIO = 'assets/audio';

/** Khóa texture nhân vật theo bậc ngoại hình + hướng, vd `hero-t1-down`. */
export const heroTextureKey = (tier: number, facing: Facing): string => `hero-t${tier}-${facing}`;

/**
 * Khóa spritesheet chu trình bước đi, vd `hero-t1-walk-down`. Cũng là khóa animation.
 * Dọc 4 khung (ART-CHR-004), ngang 6 khung (ART-CHR-005) — số khung/fps ở gameConfig.
 */
export const heroWalkKey = (tier: number, facing: Facing): string => `hero-t${tier}-walk-${facing}`;

/** Khóa spritesheet khung xoay chéo (ART-CHR-006): 0 xuống-phải, 1 xuống-trái, 2 lên-phải, 3 lên-trái. */
export const heroTurnKey = (tier: number): string => `hero-t${tier}-turn`;

/**
 * Khóa spritesheet động tác CUỐC (ART-CHR-007), vd `hero-t1-hoe-down`: dải 512×128 = 4 khung HERO_ACTION_FRAME —
 * 0 chuẩn bị, 1 giơ cao, 2 chạm đất, 3 hồi (systems/toolAnim.ts).
 */
export const heroHoeKey = (tier: number, facing: Facing): string => `hero-t${tier}-hoe-${facing}`;

/** Khóa icon nông cụ cái cuốc (ART-ITM-001) — data/tools.json `icon`. */
export const ITEM_HOE_ICON = 'item-hoe';

const facings: Facing[] = ['down', 'up', 'left', 'right'];

export const images: Record<string, string> = {
  // Bậc 1 "Nghèo kiết xác", 4 hướng (ART-CHR-002)
  ...Object.fromEntries(facings.map((d) => [heroTextureKey(1, d), `${ART}/characters/hero-t1-${d}.png`])),
  // Mẫu 4 bậc ngoại hình hướng xuống (ART-CHR-003, D-015) — cùng khung cắt để so sánh
  'hero-tier1-down': `${ART}/characters/hero-tier1-down.png`,
  'hero-tier2-down': `${ART}/characters/hero-tier2-down.png`,
  'hero-tier3-down': `${ART}/characters/hero-tier3-down.png`,
  'hero-tier4-down': `${ART}/characters/hero-tier4-down.png`,
  // 9 chân dung biểu cảm (ART-POR-001…009)
  'portrait-hero-smirk': `${ART}/portraits/portrait-hero-a-smirk.png`,
  'portrait-hero-wink-haggle': `${ART}/portraits/portrait-hero-b-wink-haggle.png`,
  'portrait-hero-boast': `${ART}/portraits/portrait-hero-c-boast.png`,
  'portrait-hero-curse': `${ART}/portraits/portrait-hero-d-curse.png`,
  'portrait-hero-exhausted': `${ART}/portraits/portrait-hero-e-exhausted.png`,
  'portrait-hero-sleepy': `${ART}/portraits/portrait-hero-f-sleepy.png`,
  'portrait-hero-fawning': `${ART}/portraits/portrait-hero-g-fawning.png`,
  'portrait-hero-rejected': `${ART}/portraits/portrait-hero-h-rejected.png`,
  'portrait-hero-money-eyes': `${ART}/portraits/portrait-hero-i-money-eyes.png`,
  // Tile thử (ART-TIL-001/002): ảnh 256×256 = 4×4 ô 64px, nối liền khi lặp
  'tile-grass-test': `${ART}/tiles/tile-grass-test.png`,
  'tile-dirt-test': `${ART}/tiles/tile-dirt-test.png`,
  // Icon cái cuốc (ART-ITM-001): 128×128 nền trong suốt, hiện ~72 px trong ô hotbar
  [ITEM_HOE_ICON]: `${ART}/items/item-hoe.png`,
};

/** Kích thước một khung trong mọi spritesheet nhân vật (px). */
export const HERO_FRAME = { width: 64, height: 96 } as const;

/**
 * Khung động tác cầm nông cụ (ART-CHR-007 cuốc; sau này tưới/cúi): 128×128, rộng hơn khung đi vì cán cuốc giơ quá nón.
 * Cùng tỷ lệ pixel với khung đi (KHÔNG co giãn). Bàn chân: giữa ngang (x 64), đáy chân hàng 110 → `footY` 111 = mép dưới
 * bàn chân → origin Y = footY / height (khung đi 64×96 dùng origin Y = 1, chân sát đáy). Đổi texture thì đổi origin cùng
 * lúc để chân không nhảy.
 */
export const HERO_ACTION_FRAME = { width: 128, height: 128, footY: 111 } as const;

/** Spritesheet: dải ngang nhiều khung 64×96 bằng nhau. Bậc 1: đi 4 hướng + khung xoay. */
export const spritesheets: Record<string, string> = {
  ...Object.fromEntries(facings.map((d) => [heroWalkKey(1, d), `${ART}/characters/hero-t1-walk-${d}.png`])),
  [heroTurnKey(1)]: `${ART}/characters/hero-t1-turn.png`,
};

/** Spritesheet động tác (khung HERO_ACTION_FRAME 128×128). Bậc 1: cuốc 4 hướng (ART-CHR-007). */
export const actionSpritesheets: Record<string, string> = {
  ...Object.fromEntries(facings.map((d) => [heroHoeKey(1, d), `${ART}/characters/hero-t1-hoe-${d}.png`])),
};

/** Âm thanh: ghi đường dẫn không đuôi; Preload tự thêm .ogg (ưu tiên) và .mp3 (Safari). */
export const audio: Record<string, string> = {
  'music-vuon': `${AUDIO}/music/vuon-loop`,
  'sfx-len-level': `${AUDIO}/sfx/len-level`,
  'sfx-nhat-xu-1': `${AUDIO}/sfx/nhat-xu-1`,
  'sfx-nhat-xu-2': `${AUDIO}/sfx/nhat-xu-2`,
  'sfx-cuoc-dat-1': `${AUDIO}/sfx/cuoc-dat-1`,
  'sfx-cuoc-dat-2': `${AUDIO}/sfx/cuoc-dat-2`,
  'sfx-tuoi-nuoc-1': `${AUDIO}/sfx/tuoi-nuoc-1`,
  'sfx-tuoi-nuoc-2': `${AUDIO}/sfx/tuoi-nuoc-2`,
  // Gieo hạt "lách tách" (AUD-SFX-101), hái cây "pop" nốt gốc C5 để detune lên dần (AUD-SFX-102)
  'sfx-gieo-hat-1': `${AUDIO}/sfx/gieo-hat-1`,
  'sfx-gieo-hat-2': `${AUDIO}/sfx/gieo-hat-2`,
  'sfx-hai-cay-1': `${AUDIO}/sfx/hai-cay-1`,
  'sfx-hai-cay-2': `${AUDIO}/sfx/hai-cay-2`,
  'sfx-bo-vo-nhan': `${AUDIO}/sfx/bo-vo-nhan`,
  'sfx-meme-zoom-trong': `${AUDIO}/sfx/meme-zoom-trong`,
  'sfx-meme-oi-doi-oi': `${AUDIO}/sfx/meme-oi-doi-oi`,
  'sfx-voice-cau-nhau-1': `${AUDIO}/sfx/voice-cau-nhau-1`,
  'sfx-voice-cau-nhau-2': `${AUDIO}/sfx/voice-cau-nhau-2`,
};
