// Danh sách asset (khóa → đường dẫn trong public/). Preload đọc danh sách này,
// scene dùng khóa — đổi tên file chỉ sửa một chỗ.
import type { Facing } from '../systems/movement';

const ART = 'assets/art';
const AUDIO = 'assets/audio';

/** Khóa texture nhân vật theo bậc ngoại hình + hướng, vd `hero-t1-down`. */
export const heroTextureKey = (tier: number, facing: Facing): string => `hero-t${tier}-${facing}`;

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
  'sfx-bo-vo-nhan': `${AUDIO}/sfx/bo-vo-nhan`,
  'sfx-meme-zoom-trong': `${AUDIO}/sfx/meme-zoom-trong`,
  'sfx-meme-oi-doi-oi': `${AUDIO}/sfx/meme-oi-doi-oi`,
  'sfx-voice-cau-nhau-1': `${AUDIO}/sfx/voice-cau-nhau-1`,
  'sfx-voice-cau-nhau-2': `${AUDIO}/sfx/voice-cau-nhau-2`,
};
