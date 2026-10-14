import { describe, expect, it } from 'vitest';
import { cropSpritesheets, images } from '../config/assets';
import { gameConfig } from '../config/gameConfig';
import { CROPS } from './crops';
import { CROP_COMMON_SHEET, cropVisual, thirstyTint } from './cropArt';
import type { PlotCrop } from './farm';
import { HOE_ITEM_ID, itemIconKey, seedItemId } from './items';

// Danh sách file ảnh thật trong public/ (Vite liệt kê lúc chạy test, không tải nội dung).
const PUBLIC_FILES = new Set(Object.keys(import.meta.glob('../../public/assets/art/**/*.png')).map((k) => k.replace('../../public/', '')));
const existsSync = (path: string): boolean => PUBLIC_FILES.has(path);

const crop = (over: Partial<PlotCrop>): PlotCrop => ({ cropId: 'khoai-lang', age: 0, dryDays: 0, withered: false, ...over });
const AT = gameConfig.cropGrownFrameAt;

describe('cropVisual — khung cây theo giai đoạn (T-022)', () => {
  it('hạt và héo dùng dải chung (khung 0, 2)', () => {
    expect(cropVisual(crop({}), 'seed', 2, 'crop-khoai-lang', AT)).toEqual({ sheet: CROP_COMMON_SHEET, frame: 0 });
    expect(cropVisual(crop({ withered: true }), 'withered', 2, 'crop-khoai-lang', AT)).toEqual({ sheet: CROP_COMMON_SHEET, frame: 2 });
  });
  it('đang lớn: tuổi / số ngày < 0.5 → non (0), còn lại → lớn (1)', () => {
    expect(cropVisual(crop({ age: 1 }), 'growing', 3, 'crop-dua-hau', AT)).toEqual({ sheet: 'crop-dua-hau', frame: 0 });
    expect(cropVisual(crop({ age: 2 }), 'growing', 3, 'crop-dua-hau', AT)).toEqual({ sheet: 'crop-dua-hau', frame: 1 });
    expect(cropVisual(crop({ age: 1 }), 'growing', 2, 'crop-khoai-lang', AT)).toEqual({ sheet: 'crop-khoai-lang', frame: 1 });
  });
  it('chín → dải riêng khung 2', () => {
    expect(cropVisual(crop({ age: 2 }), 'ripe', 2, 'crop-khoai-lang', AT)).toEqual({ sheet: 'crop-khoai-lang', frame: 2 });
  });
  it('cây chưa có hình riêng: đang lớn → mầm chung, chín → vẽ bằng code (sheet null)', () => {
    expect(cropVisual(crop({ age: 1 }), 'growing', 2, null, AT)).toEqual({ sheet: CROP_COMMON_SHEET, frame: 1 });
    expect(cropVisual(crop({ age: 2 }), 'ripe', 2, null, AT).sheet).toBeNull();
  });
});

describe('thirstyTint — cây khát ngả màu đất khô', () => {
  it('0 = giữ nguyên (trắng), 1 = đúng màu đất khô, 0.35 ở giữa', () => {
    expect(thirstyTint(0xb98550, 0)).toBe(0xffffff);
    expect(thirstyTint(0xb98550, 1)).toBe(0xb98550);
    const t = thirstyTint(0xb98550, 0.35);
    // Kênh lam tụt nhiều nhất → lá ngả vàng nâu.
    expect(t & 0xff).toBeLessThan((t >> 16) & 0xff);
  });
});

describe('itemIconKey — bảng ánh xạ icon món (dữ liệu, không theo tên file)', () => {
  it('cuốc → item-hoe; hạt → túi hạt; nông sản → icon nông sản', () => {
    expect(itemIconKey(HOE_ITEM_ID)).toBe('item-hoe');
    expect(itemIconKey(seedItemId('rau-cai'))).toBe('item-hat-rau-cai');
    expect(itemIconKey('khoai-lang')).toBe('item-khoai-lang');
  });
  it('món lạ → null (vẽ bằng code)', () => {
    expect(itemIconKey('khong-co')).toBeNull();
    expect(itemIconKey('hat-khong-co')).toBeNull();
  });
  it('mọi cây đều có sprite + icon + icon hạt, được nạp và có file thật', () => {
    for (const c of CROPS) {
      for (const key of [c.icon, c.seedIcon]) {
        expect(key, `${c.id}`).toBeTruthy();
        expect(images[key!], key).toBeDefined();
        expect(existsSync(images[key!]), images[key!]).toBe(true);
      }
      expect(cropSpritesheets[c.sprite!], c.sprite).toBeDefined();
      expect(existsSync(cropSpritesheets[c.sprite!])).toBe(true);
    }
    expect(existsSync(cropSpritesheets[CROP_COMMON_SHEET])).toBe(true);
  });
  it('mọi tấm tile nền (bản -ex) có file thật', () => {
    const tiles = Object.entries(images).filter(([k]) => k.startsWith('tile-'));
    expect(tiles.length).toBe(11);
    for (const [, path] of tiles) expect(existsSync(path), path).toBe(true);
  });
});
