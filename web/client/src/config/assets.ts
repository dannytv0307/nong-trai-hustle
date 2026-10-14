// Danh sách asset (khóa → đường dẫn trong public/). Preload đọc danh sách này,
// scene dùng khóa — đổi tên file chỉ sửa một chỗ.
import cropsJson from '../data/crops.json';
import type { CropData } from '../data/types';
import type { Facing } from '../systems/movement';
import { FENCE_KEYS, SELL_BASKET } from '../systems/propArt';
import { ACTION_ANIMS, type ActionAnim } from '../systems/toolAnim';

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
export const heroHoeKey = (tier: number, facing: Facing): string => heroActionKey(tier, 'hoe', facing);

/**
 * T-023: khoá dải động tác bất kỳ, vd `hero-t1-water-left`, `hero-t1-bend-up` — cùng chuẩn với cuốc (4 khung
 * HERO_ACTION_FRAME, khung 2 = chạm, chân ở hàng 111). Cũng là tên file trong characters/.
 */
export function heroActionKey(tier: number, anim: ActionAnim, facing: Facing): string {
  return `hero-t${tier}-${anim}-${facing}`;
}

/**
 * T-023: điểm TAY ở khung cuối (khung 3) của dáng cúi, px trong khung 128×128 (art-director đo, ±4 px) — icon cây vừa hái
 * bay ra từ đây. Đổi ra toạ độ thế giới: chân nhân vật + (px − (64, footY)).
 */
export const HERO_BEND_HAND: Readonly<Record<Facing, readonly [number, number]>> = {
  right: [90, 65],
  left: [38, 65],
  down: [36, 59],
  up: [88, 61],
};

/** Điểm tay cúi so với CHÂN nhân vật (px; âm = lên trên / sang trái). */
export function bendHandOffset(facing: Facing): { x: number; y: number } {
  const [hx, hy] = HERO_BEND_HAND[facing];
  return { x: hx - HERO_ACTION_FRAME.width / 2, y: hy - HERO_ACTION_FRAME.footY };
}

/** Khóa icon nông cụ cái cuốc (ART-ITM-001) — data/tools.json `icon`. */
export const ITEM_HOE_ICON = 'item-hoe';

const facings: Facing[] = ['down', 'up', 'left', 'right'];

/**
 * T-021: tấm tile nền Lô 1 (asset-list §3 "Ghép tile Lô 1") → số ô trong tấm. Texture lõi 4×4 = 16 ô; viền 16 ô
 * (ô = mask N1 E2 S4 W8); góc lõm 2×2 = 4 ô. Nạp bản `-ex.png`: mỗi ô có đệm 1 px lặp mép (TILE_SHEET margin/spacing)
 * để khi game co giãn (Scale.FIT, zoom 1.5) không lộ khe giữa các ô.
 */
export const TILE_SHEETS = {
  grass: 16,
  path: 16,
  yard: 16,
  'soil-dry': 16,
  'soil-till-1': 16,
  'soil-till-2': 16,
  'soil-tilled': 16,
  'soil-watered': 16,
  'soil-tilled-edge': 16,
  'path-edge': 16,
  'path-corner': 4,
} as const;
export type TileSheetName = keyof typeof TILE_SHEETS;
/** Khóa texture của một tấm tile, vd `tile-grass`. */
export const tileKey = (name: string): string => `tile-${name}`;
/** Đệm của bản `-ex`: lề ngoài 1 px, khe giữa hai ô 2 px. */
export const TILE_SHEET = { margin: 1, spacing: 2 } as const;

/**
 * T-024: ảnh đồ vật Vườn (props/, khoá = tên file). Cỡ, chân đế, điểm cửa… ở props/props.json (systems/props.ts).
 * Nội thất trong nhà (house-bed, stove-…, backgrounds/house-interior) nạp ở T-093.
 */
export const PROP_IMAGES: readonly string[] = [
  'house-hero',
  SELL_BASKET.closed,
  SELL_BASKET.open,
  'seed-stall',
  'stake-1',
  'stake-row',
  'tree-nhan-trunk',
  'tree-nhan-canopy',
  ...FENCE_KEYS,
];

/** Dữ liệu hình của 5 cây (crops.json) — cây chưa trồng được (T-045) vẫn nạp sẵn. */
const CROP_ART: readonly CropData[] = cropsJson as CropData[];

/** T-022: khung dải cây trồng 64×96; đáy khung = đáy ô, gốc cây ở hàng 86 (`rootY`). */
export const CROP_FRAME = { width: 64, height: 96, rootY: 86 } as const;

/** T-022: dải cây (khung CROP_FRAME): `crop-common` (0 hạt, 1 mầm, 2 héo) + `crop-<id>` (0 non, 1 lớn, 2 chín). */
export const cropSpritesheets: Record<string, string> = {
  'crop-common': `${ART}/props/crop-common.png`,
  ...Object.fromEntries(CROP_ART.filter((c) => c.sprite).map((c) => [c.sprite!, `${ART}/props/${c.sprite}.png`])),
};

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
  // T-021: tile nền Lô 1 (bản -ex đệm 1 px — xem TILE_SHEET), khóa `tile-<tên>`
  ...Object.fromEntries(Object.entries(TILE_SHEETS).map(([name]) => [tileKey(name), `${ART}/tiles/${name}-ex.png`])),
  // T-022: icon hạt + nông sản (128×128) — khóa = tên file, lấy từ crops.json `icon` / `seedIcon`
  ...Object.fromEntries(
    CROP_ART.flatMap((c) => [c.icon, c.seedIcon]).filter((k): k is string => !!k).map((k) => [k, `${ART}/items/${k}.png`]),
  ),
  // Icon cái cuốc (ART-ITM-001): 128×128 nền trong suốt, hiện ~72 px trong ô hotbar
  [ITEM_HOE_ICON]: `${ART}/items/item-hoe.png`,
  // T-024: đồ vật Vườn (nhà, thúng, quầy hạt, cọc, cây nhãn, rào)
  ...Object.fromEntries(PROP_IMAGES.map((k) => [k, `${ART}/props/${k}.png`])),
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

/** Spritesheet động tác (khung HERO_ACTION_FRAME 128×128). Bậc 1: cuốc (ART-CHR-007), tưới + cúi (T-020/T-023) 4 hướng. */
export const actionSpritesheets: Record<string, string> = Object.fromEntries(
  ACTION_ANIMS.flatMap((a) => facings.map((d) => [heroActionKey(1, a, d), `${ART}/characters/${heroActionKey(1, a, d)}.png`])),
);

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
