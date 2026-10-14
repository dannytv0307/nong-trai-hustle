// T-024: mảnh rào theo vị trí, ảnh thúng bán, tán cây che người, đặt ảnh theo props.json, mọi file ảnh có thật.
import { describe, expect, it } from 'vitest';
import { images, PROP_IMAGES } from '../config/assets';
import { borderFenceLines, canopyCoversHero, FENCE_KEYS, fencePieces, fencePieceSize, sellBasketKey } from './propArt';
import { hasPropSpec, propFootRect, propImageTiles, propPlacement, propPoint } from './props';

const PUBLIC_FILES = new Set(Object.keys(import.meta.glob('../../public/assets/art/**/*.png')).map((k) => k.replace('../../public/', '')));
const T = 64;

describe('fencePieces — rào tre (đường rào qua tâm ô)', () => {
  it('ngang n ô: n − 1 nhịp ở mép chung giữa hai ô + trụ ở tâm ô đầu, ô cuối', () => {
    const p = fencePieces({ style: 'tre', x: 2, y: 3, len: 4, dir: 'h' }, T);
    const spans = p.filter((q) => q.key === 'fence-tre-h');
    const posts = p.filter((q) => q.key === 'fence-tre-post');
    expect(spans.map((q) => q.x)).toEqual([3 * T, 4 * T, 5 * T]);
    expect(posts.map((q) => q.x)).toEqual([2.5 * T, 5.5 * T]);
    expect(p.every((q) => q.bottom === 4 * T && q.depth === 4 * T && q.col === null)).toBe(true);
  });

  it('ngang 1 ô: chỉ một trụ', () => {
    const p = fencePieces({ style: 'tre', x: 0, y: 0, len: 1, dir: 'h' }, T);
    expect(p.map((q) => q.key)).toEqual(['fence-tre-post']);
  });

  it('dọc: mỗi ô một fence-tre-v ở tâm ô, đáy = đáy ô (depth tăng dần → trụ dưới che trụ trên)', () => {
    const p = fencePieces({ style: 'tre', x: 5, y: 1, len: 3, dir: 'v' }, T);
    expect(p.map((q) => q.key)).toEqual(['fence-tre-v', 'fence-tre-v', 'fence-tre-v']);
    expect(p.map((q) => q.x)).toEqual([5.5 * T, 5.5 * T, 5.5 * T]);
    expect(p.map((q) => q.bottom)).toEqual([2 * T, 3 * T, 4 * T]);
  });

  it('dài 0 → không có mảnh', () => {
    expect(fencePieces({ style: 'tre', x: 0, y: 0, len: 0, dir: 'h' }, T)).toEqual([]);
  });

  it('viền bản đồ: góc trên-trái — trụ rào ngang trùng tâm cột rào dọc', () => {
    const lines = borderFenceLines(48, 32, 'tre');
    const top = fencePieces(lines[0], T);
    const left = fencePieces(lines[2], T);
    expect(top.find((q) => q.key === 'fence-tre-post')!.x).toBe(left[0].x);
    expect(left).toHaveLength(30);
  });
});

describe('fencePieces — rào dâm bụt', () => {
  it('ngang: ô đầu h-l, ô cuối h-r, ô giữa thứ i dùng cột i % 3 của h-mid3', () => {
    const p = fencePieces({ style: 'dambut', x: 0, y: 0, len: 6, dir: 'h' }, T);
    expect(p.map((q) => q.key)).toEqual([
      'hedge-dambut-h-l',
      'hedge-dambut-h-mid3',
      'hedge-dambut-h-mid3',
      'hedge-dambut-h-mid3',
      'hedge-dambut-h-mid3',
      'hedge-dambut-h-r',
    ]);
    expect(p.map((q) => q.col)).toEqual([null, 1, 2, 0, 1, null]);
    expect(p.map((q) => q.x)).toEqual([0.5, 1.5, 2.5, 3.5, 4.5, 5.5].map((v) => v * T));
  });

  it('dọc: v-top đáy ở đỉnh ô đầu, v-mid mọi ô trừ ô cuối, v-bottom ô cuối', () => {
    const p = fencePieces({ style: 'dambut', x: 3, y: 2, len: 3, dir: 'v' }, T);
    expect(p.map((q) => q.key)).toEqual(['hedge-dambut-v-top', 'hedge-dambut-v-mid', 'hedge-dambut-v-mid', 'hedge-dambut-v-bottom']);
    expect(p.map((q) => q.bottom)).toEqual([2 * T, 3 * T, 4 * T, 5 * T]);
  });

  it('cỡ ảnh mảnh rào đọc từ props.json (rào dọc gen lại cùng tên vẫn đúng cỡ)', () => {
    for (const k of FENCE_KEYS) {
      const [w, h] = fencePieceSize(k);
      expect(w, k).toBeGreaterThan(0);
      expect(h, k).toBeGreaterThan(0);
    }
    expect(fencePieceSize('hedge-dambut-h-mid3')[0] % 3).toBe(0);
  });
});

describe('thúng bán', () => {
  it('có đồ chờ bán → hé nắp; trống → đóng', () => {
    expect(sellBasketKey(true)).toBe('sell-basket-open');
    expect(sellBasketKey(false)).toBe('sell-basket-closed');
  });

  it('hai ảnh chung tâm-đáy (props.json) → đổi ảnh không dời chỗ', () => {
    const a = propPlacement('sell-basket-closed', 17, 11, T);
    const b = propPlacement('sell-basket-open', 17, 11, T);
    expect([b.x, b.bottom]).toEqual([a.x, a.bottom]);
    expect(b.width).toBeGreaterThan(a.width);
  });
});

describe('canopyCoversHero — tán che người', () => {
  const box = { left: 100, top: 100, right: 300, bottom: 230 };
  it('đứng sau gốc (chân trong vùng lá) → che', () => {
    expect(canopyCoversHero(box, 200, 200, 20, 88)).toBe(true);
  });
  it('đứng ngay trước gốc, đầu chạm mép dưới tán → che (tán vẽ trên người)', () => {
    expect(canopyCoversHero(box, 200, 300, 20, 88)).toBe(true);
  });
  it('đứng xa dưới / bên cạnh → không che', () => {
    expect(canopyCoversHero(box, 200, 330, 20, 88)).toBe(false);
    expect(canopyCoversHero(box, 330, 200, 20, 88)).toBe(false);
    expect(canopyCoversHero(box, 200, 95, 20, 88)).toBe(false);
  });
});

describe('props.json — đặt ảnh theo chân đế', () => {
  it('nhà: chân đế 6×2 ở (8, 9) → ảnh 384×320 mép trái x 8, đáy hàng 11', () => {
    const p = propPlacement('house-hero', 8, 9, T);
    expect(p).toEqual({ x: 8 * T + 192, bottom: 11 * T, left: 8 * T, top: 11 * T - 320, width: 384, height: 320 });
    expect(propFootRect('house-hero', 8, 9)).toEqual({ x: 8, y: 9, w: 6, h: 2 });
    expect(propPoint('house-hero', 8, 9, T, [196, 316])).toEqual({ x: 8 * T + 196, y: 11 * T - 4 });
  });

  it('cây nhãn 224 px (3,5 ô): chân đế 1 ô lệch 1,25 ô → tâm ảnh = tâm ô gốc', () => {
    const p = propPlacement('tree-nhan-trunk', 10, 5, T);
    expect(p.x).toBe(10.5 * T);
    expect(p.bottom).toBe(6 * T);
    const c = propPlacement('tree-nhan-canopy', 10, 5, T);
    expect([c.x, c.bottom]).toEqual([p.x, p.bottom]);
  });

  it('vật đi xuyên (foot null) đặt giữa-đáy ô mốc; không có chân đế va chạm', () => {
    expect(propFootRect('stake-row', 14, 16)).toBeNull();
    const p = propPlacement('stake-row', 14, 16, T);
    expect([p.x, p.bottom]).toEqual([14.5 * T, 17 * T]);
  });

  it('vùng click "cả ảnh" của quầy hạt = 3×2 ô', () => {
    expect(propImageTiles('seed-stall', 13, 27, T)).toEqual({ x: 13, y: 26, w: 3, h: 2 });
  });

  it('mọi ảnh đồ vật Vườn có mục props.json và có file thật', () => {
    for (const k of PROP_IMAGES) {
      expect(hasPropSpec(k), k).toBe(true);
      expect(PUBLIC_FILES.has(images[k]), images[k]).toBe(true);
    }
  });

  it('tên lạ → lỗi rõ ràng', () => {
    expect(() => propPlacement('khong-co', 0, 0, T)).toThrow(/props\.json/);
  });
});
