// Hình tạm vẽ bằng code cho cây trồng (theo giai đoạn) và icon món đồ (hotbar, gùi) — T-003, chưa có art.
// Chỉ dùng màu trong palette.ts (Art Bible §5); màu "xám" = trộn trắng điệp + mực như viền ô ngoài tầm.
// Khi art-director có ảnh thật thì thay các hàm vẽ này bằng Image, phần gameplay không phải sửa.
import type Phaser from 'phaser';
import { palette, type PaletteKey } from '../config/palette';
import type { CropStage } from '../systems/farm';
import { itemInfo } from '../systems/items';

/** Cách vẽ từng loại cây: màu lá, màu "quả"/củ, kiểu dáng lúc chín. */
interface CropLook {
  leaf: PaletteKey;
  fruit: PaletteKey;
  shape: 'leafy' | 'tuber' | 'round' | 'grain';
}

const CROP_LOOKS: Record<string, CropLook> = {
  'rau-cai': { leaf: 'sprout', fruit: 'jade', shape: 'leafy' },
  'khoai-lang': { leaf: 'jade', fruit: 'vermilion', shape: 'tuber' },
  'rau-muong': { leaf: 'sprout', fruit: 'jade', shape: 'leafy' },
  'dua-hau': { leaf: 'jade', fruit: 'jade', shape: 'round' },
  'lua-nep': { leaf: 'sprout', fruit: 'gold', shape: 'grain' },
};
const DEFAULT_LOOK: CropLook = { leaf: 'sprout', fruit: 'gold', shape: 'leafy' };

const lookOf = (cropId: string): CropLook => CROP_LOOKS[cropId] ?? DEFAULT_LOOK;

/** Trộn hai màu số 0xRRGGBB, t = 0 → a, 1 → b. */
export function mixColor(a: number, b: number, t: number): number {
  const ch = (c: number, s: number) => (c >> s) & 0xff;
  const m = (s: number) => Math.round(ch(a, s) + (ch(b, s) - ch(a, s)) * t) << s;
  return m(16) | m(8) | m(0);
}

/** Xám ấm (cây héo) — không thêm màu ngoài palette. */
export const WITHER_GRAY = mixColor(palette.paper, palette.ink, 0.5);

/** Màu "đại diện" của cây (để rắc hạt, chấm trên túi hạt…). */
export const cropColor = (cropId: string): number => palette[lookOf(cropId).fruit];

/** Hình tròn có viền mực: tô mực to hơn trước rồi tô màu đè lên (viền chỉ ở mép ngoài). */
function blob(g: Phaser.GameObjects.Graphics, circles: readonly [number, number, number][], color: number, outline = 2.5): void {
  g.fillStyle(palette.ink, 1);
  for (const [x, y, r] of circles) g.fillCircle(x, y, r + outline);
  g.fillStyle(color, 1);
  for (const [x, y, r] of circles) g.fillCircle(x, y, r);
}

function ellipse(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, color: number, outline = 2.5): void {
  g.fillStyle(palette.ink, 1).fillEllipse(x, y, w + outline * 2, h + outline * 2);
  g.fillStyle(color, 1).fillEllipse(x, y, w, h);
}

/**
 * Vẽ cây theo giai đoạn, gốc cây tại (ox, oy) (px thế giới, ô 64px):
 * hạt = vài chấm nhỏ; đang lớn = mầm 2 lá (khát thì rũ, nhạt màu); chín = hình to, màu theo loại; héo = xám rũ.
 */
export function drawCrop(
  g: Phaser.GameObjects.Graphics,
  cropId: string,
  stage: CropStage,
  thirsty: boolean,
  ox: number,
  oy: number,
): void {
  const look = lookOf(cropId);
  const leaf = thirsty ? mixColor(palette[look.leaf], palette.wood, 0.55) : palette[look.leaf];
  switch (stage) {
    case 'seed': {
      // Ba chấm hạt nằm trên luống + chấm sáng nhỏ.
      const dots: [number, number, number][] = [
        [ox - 10, oy - 6, 3.5],
        [ox + 2, oy - 10, 3.5],
        [ox + 11, oy - 4, 3.5],
      ];
      blob(g, dots, mixColor(palette.earth, cropColor(cropId), 0.35), 1.5);
      g.fillStyle(palette.paper, 0.8);
      for (const [x, y] of dots) g.fillCircle(x - 1, y - 1, 1.2);
      break;
    }
    case 'growing': {
      // Mầm: thân + 2 lá. Khát thì lá rũ xuống, nhạt màu (GDD §8 "lá rũ").
      const droop = thirsty ? 8 : 0;
      g.lineStyle(5, palette.ink, 1).lineBetween(ox, oy, ox, oy - 18 + droop / 2);
      g.lineStyle(2.5, leaf, 1).lineBetween(ox, oy, ox, oy - 18 + droop / 2);
      ellipse(g, ox - 9, oy - 18 + droop, 17, 9, leaf);
      ellipse(g, ox + 9, oy - 21 + droop, 17, 9, leaf);
      break;
    }
    case 'ripe': {
      if (look.shape === 'tuber') {
        // Khoai lang: củ đỏ son nhú lên khỏi đất + bụi lá xanh đồng thẫm.
        ellipse(g, ox - 10, oy - 6, 22, 12, palette[look.fruit]);
        ellipse(g, ox + 11, oy - 4, 20, 11, palette[look.fruit]);
        blob(g, [
          [ox - 9, oy - 22, 10],
          [ox + 9, oy - 24, 10],
          [ox, oy - 34, 11],
        ], leaf);
        g.fillStyle(palette.sprout, 0.9).fillCircle(ox - 3, oy - 37, 4).fillCircle(ox + 10, oy - 27, 3);
      } else if (look.shape === 'round') {
        blob(g, [[ox, oy - 16, 17]], palette[look.fruit]);
        g.lineStyle(2, palette.sprout, 0.9).lineBetween(ox - 8, oy - 30, ox - 8, oy - 2).lineBetween(ox + 6, oy - 31, ox + 6, oy - 1);
      } else if (look.shape === 'grain') {
        g.lineStyle(3, palette.ink, 1);
        for (const dx of [-10, 0, 10]) g.lineBetween(ox + dx, oy, ox + dx * 1.3, oy - 38);
        blob(g, [
          [ox - 13, oy - 38, 5],
          [ox, oy - 42, 5],
          [ox + 13, oy - 38, 5],
        ], palette[look.fruit], 1.5);
      } else {
        // Rau cải: bụi lá to, xanh mạ + xanh đồng thẫm, gân sáng.
        blob(g, [
          [ox - 14, oy - 14, 11],
          [ox + 14, oy - 14, 11],
          [ox - 7, oy - 27, 12],
          [ox + 8, oy - 28, 12],
          [ox, oy - 15, 12],
        ], palette[look.fruit]);
        g.fillStyle(leaf, 1).fillCircle(ox - 6, oy - 26, 8).fillCircle(ox + 8, oy - 27, 8).fillCircle(ox, oy - 14, 8);
        g.lineStyle(2, palette.paper, 0.75).lineBetween(ox, oy - 6, ox - 6, oy - 26).lineBetween(ox, oy - 6, ox + 8, oy - 27);
      }
      break;
    }
    case 'withered': {
      // Héo: thân cong gãy, lá xám nâu rũ sát đất.
      g.lineStyle(5, palette.ink, 1).lineBetween(ox, oy, ox + 3, oy - 14).lineBetween(ox + 3, oy - 14, ox + 13, oy - 8);
      g.lineStyle(2.5, WITHER_GRAY, 1).lineBetween(ox, oy, ox + 3, oy - 14).lineBetween(ox + 3, oy - 14, ox + 13, oy - 8);
      ellipse(g, ox - 9, oy - 3, 16, 7, mixColor(WITHER_GRAY, palette.earth, 0.35));
      ellipse(g, ox + 15, oy - 5, 13, 6, WITHER_GRAY);
      break;
    }
  }
}

/**
 * Icon món đồ (hotbar, gùi, icon bay), tâm tại (0, 0) trong khung `size` px.
 * Hạt = túi hạt gỗ có chấm màu cây; nông sản = hình cây chín thu nhỏ; món lạ = chấm xám.
 */
export function drawItemIcon(g: Phaser.GameObjects.Graphics, itemId: string, size: number): void {
  const info = itemInfo(itemId);
  const s = size / 64; // vẽ theo khung 64px rồi co giãn
  if (!info) {
    blob(g, [[0, 0, 14 * s]], WITHER_GRAY);
    return;
  }
  if (info.kind === 'seed') {
    // Túi hạt: thân tròn màu gỗ, cổ túi buộc dây đỏ son, chấm màu cây ở giữa.
    blob(g, [[0, 6 * s, 19 * s]], palette.wood);
    g.fillStyle(palette.ink, 1).fillRoundedRect(-9 * s - 2.5, -20 * s - 2.5, 18 * s + 5, 12 * s + 5, 3);
    g.fillStyle(palette.wood, 1).fillRoundedRect(-9 * s, -20 * s, 18 * s, 12 * s, 3);
    g.lineStyle(3 * s, palette.vermilion, 1).lineBetween(-10 * s, -10 * s, 10 * s, -10 * s);
    blob(g, [
      [-6 * s, 8 * s, 4 * s],
      [5 * s, 4 * s, 4 * s],
      [2 * s, 14 * s, 4 * s],
    ], cropColor(info.cropId), 1.5);
    return;
  }
  const look = lookOf(info.cropId);
  if (look.shape === 'tuber') {
    // Củ khoai: hình bầu dục đỏ son, vài chấm mắt củ, cuống lá nhỏ.
    ellipse(g, 0, 4 * s, 40 * s, 24 * s, palette.vermilion);
    g.fillStyle(palette.ink, 0.5).fillCircle(-8 * s, 2 * s, 1.8 * s).fillCircle(6 * s, 8 * s, 1.8 * s).fillCircle(10 * s, -1 * s, 1.8 * s);
    blob(g, [[-16 * s, -9 * s, 6 * s]], palette.jade, 1.5);
  } else {
    // Bó rau: lá tròn chồng lên nhau, cuống trắng điệp.
    g.lineStyle(5 * s, palette.ink, 1).lineBetween(0, 20 * s, -4 * s, 2 * s).lineBetween(0, 20 * s, 6 * s, 2 * s);
    g.lineStyle(3 * s, palette.paper, 1).lineBetween(0, 20 * s, -4 * s, 2 * s).lineBetween(0, 20 * s, 6 * s, 2 * s);
    blob(g, [
      [-9 * s, -4 * s, 11 * s],
      [9 * s, -4 * s, 11 * s],
      [0, -14 * s, 12 * s],
    ], palette[look.fruit]);
    g.fillStyle(palette[look.leaf], 1).fillCircle(-7 * s, -6 * s, 7 * s).fillCircle(2 * s, -15 * s, 7 * s);
  }
}
