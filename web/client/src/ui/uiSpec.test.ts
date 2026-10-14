import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { gameConfig } from '../config/gameConfig';
import { palette } from '../config/palette';
import { itemTooltipText } from './itemText';
import {
  bubbleBodyLayout,
  buttonLabelCenterY,
  buttonState,
  dashedRectSegments,
  fitNineSize,
  fixedBubbleLayout,
  fixedBubbleWrapWidth,
  nineContentRect,
  nineSliceSpec,
  staminaBarGeometry,
  staminaFillColor,
  uiAssetFiles,
  uiImageSpec,
  type NineSliceName,
} from './uiSpec';

const PUBLIC = new URL('../../public/', import.meta.url);

describe('uiSpec — đọc ui.json (T-091)', () => {
  it('đủ các khung 9-slice code dùng, lề cắt nhỏ hơn ảnh, cỡ nhỏ nhất ≥ tổng lề', () => {
    const names: NineSliceName[] = [
      'panel-paper',
      'panel-tooltip',
      'hud-plank',
      'btn',
      'btn-hover',
      'btn-pressed',
      'btn-disabled',
      'slot',
      'slot-selected',
      'slot-hover',
      'slot-locked',
      'hud-bamboo-bar',
      'bubble',
      'bubble-boast',
    ];
    for (const n of names) {
      const s = nineSliceSpec(n);
      expect(s, n).not.toBeNull();
      expect(s!.slice.left + s!.slice.right).toBeLessThan(s!.size[0]);
      expect(s!.minSize[0]).toBeGreaterThanOrEqual(s!.slice.left + s!.slice.right);
    }
    // Ống tre là 3-slice: không cắt trên/dưới.
    expect(nineSliceSpec('hud-bamboo-bar')!.slice.top).toBe(0);
    expect(nineSliceSpec('hud-bamboo-bar')!.window).toBeDefined();
  });

  it('mọi file ảnh trong ui.json có thật trong public/', () => {
    const files = uiAssetFiles();
    expect(Object.keys(files).length).toBeGreaterThanOrEqual(31);
    for (const [key, url] of Object.entries(files)) {
      expect(key.startsWith('ui-')).toBe(true);
      expect(existsSync(fileURLToPath(new URL(url, PUBLIC))), url).toBe(true);
    }
  });

  it('fitNineSize không cho khung nhỏ hơn minSize; content trừ đúng lề trong', () => {
    expect(fitNineSize('panel-paper', 10, 10)).toEqual({ w: 172, h: 168 });
    expect(fitNineSize('panel-paper', 600, 400)).toEqual({ w: 600, h: 400 });
    // panel-paper content = [40, 40, 36, 40]
    expect(nineContentRect('panel-paper', { x: 100, y: 50, w: 600, h: 400 })).toEqual({ x: 140, y: 86, w: 520, h: 324 });
  });
});

describe('uiSpec — nút', () => {
  it('nút nhấn: chữ dịch xuống đúng 12 px so với nút thường (mặt nút lún)', () => {
    const r = { x: 0, y: 100, w: 250, h: 88 };
    expect(buttonLabelCenterY('pressed', r) - buttonLabelCenterY('normal', r)).toBe(12);
    expect(buttonLabelCenterY('hover', r)).toBe(buttonLabelCenterY('normal', r));
  });

  it('trạng thái nút: xám khi không bấm được, nhấn chỉ khi rê chuột + đang giữ', () => {
    expect(buttonState(false, true, true)).toBe('disabled');
    expect(buttonState(true, false, true)).toBe('normal');
    expect(buttonState(true, true, false)).toBe('hover');
    expect(buttonState(true, true, true)).toBe('pressed');
  });
});

describe('uiSpec — thanh Sức ống tre', () => {
  const bar = { x: 92, y: 34, w: 400, h: 72 };

  it('cửa sổ = ống tre trừ lề ui.json (L57 R52 T23 B23); nền mực nới 4 px mỗi phía', () => {
    const g = staminaBarGeometry(bar, 1);
    expect(g.window).toEqual({ x: 149, y: 57, w: 291, h: 26 });
    expect(g.backing).toEqual({ x: 145, y: 53, w: 299, h: 34 });
  });

  it('ruột theo tỷ lệ Sức: đầy = phủ hết nền, nửa = nửa cửa sổ, 0 = không vẽ; tỷ lệ ngoài 0–1 bị kẹp', () => {
    const full = staminaBarGeometry(bar, 1);
    expect(full.fill.x).toBe(full.backing.x);
    expect(full.fill.w).toBe(full.window.w + 4);
    expect(staminaBarGeometry(bar, 0.5).fill.w).toBe(Math.round(291 / 2) + 4);
    expect(staminaBarGeometry(bar, 0).fill.w).toBe(0);
    expect(staminaBarGeometry(bar, -1).fill.w).toBe(0);
    expect(staminaBarGeometry(bar, 3).fill.w).toBe(full.fill.w);
  });

  it('màu ruột: xanh mạ → vàng < 50% → đỏ son < 20%', () => {
    const { staminaBarYellowBelow: y, staminaBarRedBelow: r } = gameConfig;
    expect(staminaFillColor(1, y, r)).toBe(palette.sprout);
    expect(staminaFillColor(0.5, y, r)).toBe(palette.sprout);
    expect(staminaFillColor(0.49, y, r)).toBe(palette.gold);
    expect(staminaFillColor(0.2, y, r)).toBe(palette.gold);
    expect(staminaFillColor(0.19, y, r)).toBe(palette.vermilion);
    expect(staminaFillColor(0, y, r)).toBe(palette.vermilion);
  });
});

describe('uiSpec — bong bóng', () => {
  it('thân 9-slice nằm trên đầu, đuôi đè đáy thân overlapTop px, mũi đuôi sát đầu', () => {
    const tail = uiImageSpec('bubble-tail')!;
    const l = bubbleBodyLayout('normal', 300, 36);
    expect(l.body.y + l.body.h).toBe(l.tail.y + tail.overlapTop!);
    expect(l.tail.y + tail.size[1]).toBeLessThanOrEqual(0);
    expect(l.tail.y + tail.size[1]).toBeGreaterThan(-12);
    expect(l.body.w).toBeGreaterThanOrEqual(300);
    expect(l.body.x + l.body.w / 2).toBe(0);
    // Chữ nằm trong thân.
    expect(l.text.y).toBeGreaterThan(l.body.y);
    expect(l.text.y).toBeLessThan(l.body.y + l.body.h);
  });

  it('chữ ngắn: thân không nhỏ hơn minSize', () => {
    const l = bubbleBodyLayout('boast', 2, 2);
    const min = nineSliceSpec('bubble-boast')!.minSize;
    expect(l.body.w).toBeGreaterThanOrEqual(min[0]);
    expect(l.body.h).toBeGreaterThanOrEqual(min[1]);
  });

  it('chửi thề: phóng ảnh cho chữ vừa (kẹp minScale–maxScale); chữ xuống dòng theo cỡ tối đa thì vừa; chữ trong ảnh', () => {
    const wrap = fixedBubbleWrapWidth('curse', 1.8);
    const l = fixedBubbleLayout('curse', wrap, 90, 1.6, 1.8);
    const spec = uiImageSpec('bubble-curse')!;
    expect(l.scale).toBeGreaterThanOrEqual(1.6);
    expect(l.scale).toBeLessThanOrEqual(1.8);
    expect(l.textMaxW).toBeGreaterThanOrEqual(wrap);
    expect(fixedBubbleLayout('curse', 5000, 90, 1.6, 1.8).scale).toBe(1.8);
    expect(l.w).toBeCloseTo(spec.size[0] * l.scale);
    // Toàn ảnh nằm trên đầu (y < 0), chữ nằm trong ảnh.
    const top = -4 - spec.anchor[1] * l.h;
    expect(top + l.h).toBeLessThanOrEqual(0);
    expect(l.text.y).toBeGreaterThan(top);
    expect(l.text.y).toBeLessThan(top + l.h);
    // Chữ nhỏ → giữ minScale.
    expect(fixedBubbleLayout('think', 10, 10, 1).scale).toBe(1);
  });
});

describe('uiSpec — nét đứt viền ô ngoài tầm (ART-UI-001 A)', () => {
  it('đoạn 8 px hở 6 px quanh chu vi; mọi điểm nằm trên cạnh khung', () => {
    const r = { x: 10, y: 20, w: 64, h: 64 };
    const segs = dashedRectSegments(r, 8, 6);
    expect(segs.length).toBeGreaterThan(0);
    let total = 0;
    for (const [x1, y1, x2, y2] of segs) {
      for (const [x, y] of [
        [x1, y1],
        [x2, y2],
      ]) {
        const onEdge = x === r.x || x === r.x + r.w || y === r.y || y === r.y + r.h;
        expect(onEdge).toBe(true);
      }
      total += Math.hypot(x2 - x1, y2 - y1);
    }
    // Tổng nét ≈ chu vi × 8/14 (sai số đoạn cuối).
    const per = 2 * (r.w + r.h);
    expect(total).toBeGreaterThan(per * (8 / 14) - 8);
    expect(total).toBeLessThan(per * (8 / 14) + 8);
  });

  it('đoạn đi qua góc bị gập theo cạnh (không cắt chéo qua ô)', () => {
    const segs = dashedRectSegments({ x: 0, y: 0, w: 10, h: 10 }, 8, 6);
    for (const [x1, y1, x2, y2] of segs) expect(x1 === x2 || y1 === y2).toBe(true);
  });
});

describe('itemText — tooltip món', () => {
  it('nông sản: giá bán + Sức khi ăn; hạt: không bán; cuốc: cách dùng', () => {
    const khoai = itemTooltipText('khoai-lang');
    expect(khoai.name).toBe('Khoai lang');
    expect(khoai.detail).toMatch(/^Bán \d+ quan · Ăn \+8 Sức$/);
    expect(itemTooltipText('rau-cai').detail).toMatch(/^Bán \d+ quan$/);
    expect(itemTooltipText('hat-rau-cai').detail).toContain('không bán');
    expect(itemTooltipText('cuoc-go').name).toBe('Cuốc gỗ');
    expect(itemTooltipText('mon-la').detail).toBe('');
  });
});
