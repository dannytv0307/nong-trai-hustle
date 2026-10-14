// T-092: thông số bộ giao diện Lô 1 (T-091) — đọc từ `public/assets/art/ui/ui.json` do art-director viết kèm ảnh: lề cắt
// 9-slice, cỡ nhỏ nhất, vùng chữ, cửa sổ ống tre, cách đặt đuôi bong bóng. Code ĐỌC số từ file này (không chép lại) →
// art đổi ảnh chỉ cần sửa ui.json. Thuần TS (không import Phaser) để unit test; phần dựng hình ở `uiKit.ts`.
//
// Quy ước ui.json:
// - `nineSlice.<tên>.slice` = lề cắt (px nguồn); hiển thị 1:1 ở 1080p, KHÔNG phóng to khung.
// - `nineSlice.<tên>.content` = [trái, phải, trên, dưới] — lề trong tới vùng đặt chữ, tính từ mép khung hiển thị.
// - `images.<tên>.content` = [x, y, rộng, cao] — vùng chữ trong ảnh cố định (bong bóng chửi thề / nghĩ), px nguồn.
// - `images.<tên>.anchor` = origin (0–1) của ảnh; đuôi bong bóng có `overlapTop` (đè lên đáy thân bao nhiêu px).
import { palette } from '../config/palette';
import type { BubbleStyle } from '../systems/bubbles';
import { staminaBand } from '../systems/stamina';

export type { BubbleStyle };

// ui.json nằm trong public/ (art đặt cạnh ảnh) → nạp lúc build bằng import.meta.glob như props.json (systems/props.ts).
const UI_FILES = import.meta.glob('../../public/assets/art/ui/ui.json', { eager: true, import: 'default' });
const uiJson = (Object.values(UI_FILES)[0] ?? {}) as Partial<UiJson>;

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Edges {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface NineSliceSpec {
  file: string;
  size: [number, number];
  slice: Edges;
  minSize: [number, number];
  /** [trái, phải, trên, dưới]. */
  content?: [number, number, number, number];
  /** Ống tre: cửa sổ trong suốt (lề từ mép ảnh). */
  window?: Edges;
}

export interface UiImageSpec {
  file: string;
  size: [number, number];
  anchor: [number, number];
  /** [x, y, rộng, cao] — vùng chữ (px nguồn). */
  content?: [number, number, number, number];
  overlapTop?: number;
  iconCenter?: [number, number];
  iconSize?: number;
}

export interface UiJson {
  nineSlice: Record<string, NineSliceSpec>;
  images: Record<string, UiImageSpec>;
  icons: Record<string, { file: string; size: [number, number] }>;
}

const NINE: Record<string, NineSliceSpec> = uiJson.nineSlice ?? {};
const IMAGES: Record<string, UiImageSpec> = uiJson.images ?? {};
const ICONS: Record<string, { file: string; size: [number, number] }> = uiJson.icons ?? {};

/** Tên khung 9-slice có trong bộ (để code gõ sai tên thì tsc báo). */
export type NineSliceName =
  | 'panel-paper'
  | 'panel-tooltip'
  | 'hud-plank'
  | 'btn'
  | 'btn-hover'
  | 'btn-pressed'
  | 'btn-disabled'
  | 'slot'
  | 'slot-selected'
  | 'slot-hover'
  | 'slot-locked'
  | 'hud-bamboo-bar'
  | 'bubble'
  | 'bubble-boast';

export type UiIconName =
  | 'icon-sun'
  | 'icon-moon'
  | 'icon-rain'
  | 'icon-star'
  | 'icon-season-dry'
  | 'icon-season-rain'
  | 'icon-stamina'
  | 'icon-quest'
  | 'icon-bag'
  | 'icon-coin'
  | 'icon-lock'
  | 'icon-close';

export type UiImageName = 'hud-clock-disc' | 'bubble-tail' | 'bubble-boast-tail' | 'bubble-curse' | 'bubble-think';

/** Khóa texture Phaser của một ảnh giao diện, vd `ui-panel-paper`. */
export const uiKey = (name: string): string => `ui-${name}`;

const UI_DIR = 'assets/art/ui';

/** Mọi ảnh giao diện trong ui.json: khóa texture → đường dẫn (Preload nạp hết). */
export function uiAssetFiles(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const group of [NINE, IMAGES, ICONS] as Record<string, { file: string }>[]) {
    for (const [name, spec] of Object.entries(group)) {
      if (spec && typeof spec.file === 'string') out[uiKey(name)] = `${UI_DIR}/${spec.file}`;
    }
  }
  return out;
}

/** Thông số khung 9-slice (null = ui.json không có — dùng hình vẽ bằng code). */
export function nineSliceSpec(name: NineSliceName): NineSliceSpec | null {
  const s = NINE[name];
  return s && s.slice && Array.isArray(s.size) ? s : null;
}

export function uiImageSpec(name: UiImageName): UiImageSpec | null {
  const s = IMAGES[name];
  return s && Array.isArray(s.size) ? s : null;
}

/** Cỡ hiển thị không nhỏ hơn `minSize` (nhỏ hơn thì góc khung chồng lên nhau, méo). */
export function fitNineSize(name: NineSliceName, w: number, h: number): { w: number; h: number } {
  const s = nineSliceSpec(name);
  if (!s) return { w, h };
  return { w: Math.max(w, s.minSize[0]), h: Math.max(h, s.minSize[1]) };
}

/** Vùng đặt chữ bên trong một khung hiển thị ở `r` (lề `content` của ui.json; không có thì lề 0). */
export function nineContentRect(name: NineSliceName, r: Rect): Rect {
  const c = nineSliceSpec(name)?.content ?? [0, 0, 0, 0];
  const [l, rt, t, b] = c;
  return { x: r.x + l, y: r.y + t, w: Math.max(0, r.w - l - rt), h: Math.max(0, r.h - t - b) };
}

// ---------------------------------------------------------------- nút

export type ButtonState = 'normal' | 'hover' | 'pressed' | 'disabled';

/** Khung ảnh của từng trạng thái nút. */
export const BUTTON_FRAME: Readonly<Record<ButtonState, NineSliceName>> = {
  normal: 'btn',
  hover: 'btn-hover',
  pressed: 'btn-pressed',
  disabled: 'btn-disabled',
};

/**
 * Tâm dọc của chữ trên nút (toạ độ màn) theo trạng thái: giữa vùng `content`. Nút thường có gờ dày phía dưới (vùng chữ
 * lệch lên); nút nhấn lún xuống nên vùng chữ dịch xuống 12 px — chữ đi theo, nhìn như bấm lún thật.
 */
export function buttonLabelCenterY(state: ButtonState, r: Rect): number {
  const c = nineContentRect(BUTTON_FRAME[state], r);
  return c.y + c.h / 2;
}

/** Trạng thái nút từ: bấm được không, con trỏ có trên nút, chuột có đang giữ. */
export function buttonState(enabled: boolean, hover: boolean, down: boolean): ButtonState {
  if (!enabled) return 'disabled';
  if (hover) return down ? 'pressed' : 'hover';
  return 'normal';
}

// ---------------------------------------------------------------- thanh Sức (ống tre)

/** Ống tre cao cố định (3-slice, chỉ kéo ngang). */
export const BAMBOO_BAR_HEIGHT = nineSliceSpec('hud-bamboo-bar')?.size[1] ?? 72;
/** Nới ô nền mực mỗi phía để khỏi hở ở mép cửa sổ (ui.json note). */
const BAMBOO_BACKING_PAD = 4;

/**
 * Hình học thanh Sức khi ống tre hiển thị ở `bar`: `window` = cửa sổ trong suốt, `backing` = nền mực (window nới 4 px),
 * `fill` = ruột theo tỷ lệ Sức (từ mép trái cửa sổ, rộng = tỷ lệ × bề rộng cửa sổ, cũng nới 4 px trên/dưới/trái).
 */
export function staminaBarGeometry(bar: Rect, ratio: number): { window: Rect; backing: Rect; fill: Rect } {
  const win = nineSliceSpec('hud-bamboo-bar')?.window ?? { left: 57, right: 52, top: 23, bottom: 23 };
  const window: Rect = { x: bar.x + win.left, y: bar.y + win.top, w: bar.w - win.left - win.right, h: bar.h - win.top - win.bottom };
  const p = BAMBOO_BACKING_PAD;
  const backing: Rect = { x: window.x - p, y: window.y - p, w: window.w + p * 2, h: window.h + p * 2 };
  const k = Math.min(1, Math.max(0, ratio));
  const fillW = Math.round(window.w * k);
  // Ruột rỗng (0 Sức) thì rộng 0 — không để lại vệt nới ở mép trái.
  const fill: Rect = { x: backing.x, y: backing.y, w: fillW > 0 ? fillW + p : 0, h: backing.h };
  return { window, backing, fill };
}

/** Màu ruột thanh Sức: xanh mạ → vàng hoa hòe (< yellowBelow) → đỏ son (< redBelow). */
export function staminaFillColor(ratio: number, yellowBelow: number, redBelow: number): number {
  const band = staminaBand(ratio, yellowBelow, redBelow);
  return band === 'red' ? palette.vermilion : band === 'yellow' ? palette.gold : palette.sprout;
}

// ---------------------------------------------------------------- bong bóng chữ

/** Lề chữ trong thân bong bóng 9-slice (px màn) + khe giữa mũi đuôi và đầu nhân vật. */
export const BUBBLE_TEXT_PAD = { x: 32, y: 26, headGap: 4 } as const;

const BODY_FRAME: Readonly<Record<'normal' | 'boast', { body: NineSliceName; tail: UiImageName }>> = {
  normal: { body: 'bubble', tail: 'bubble-tail' },
  boast: { body: 'bubble-boast', tail: 'bubble-boast-tail' },
};

export const bubbleFrames = (style: 'normal' | 'boast') => BODY_FRAME[style];

/**
 * Bong bóng thân 9-slice + đuôi rời. Toạ độ tính từ ĐIỂM ĐẦU nhân vật (0, 0), y âm = lên trên. Đuôi: origin (0.5, 0),
 * mũi đuôi cách đầu `headGap`; đỉnh ảnh đuôi = đáy thân − overlapTop (đè viền đáy để "mở miệng" đuôi).
 */
export function bubbleBodyLayout(style: 'normal' | 'boast', textW: number, textH: number): { body: Rect; tail: { x: number; y: number }; text: { x: number; y: number } } {
  const f = BODY_FRAME[style];
  const tail = uiImageSpec(f.tail);
  const tailH = tail?.size[1] ?? 65;
  const overlap = tail?.overlapTop ?? 30;
  const size = fitNineSize(f.body, Math.ceil(textW) + BUBBLE_TEXT_PAD.x * 2, Math.ceil(textH) + BUBBLE_TEXT_PAD.y * 2);
  const tailY = -BUBBLE_TEXT_PAD.headGap - tailH;
  const bodyBottom = tailY + overlap;
  const body: Rect = { x: -size.w / 2, y: bodyBottom - size.h, w: size.w, h: size.h };
  // Thân 9-slice có viền đáy dày hơn viền trên một chút → chữ ở giữa vùng content.
  const c = nineContentRect(f.body, body);
  return { body, tail: { x: 0, y: tailY }, text: { x: 0, y: c.y + c.h / 2 } };
}

/**
 * Vùng chữ `content` trong ui.json khá dè dặt (lòng trắng của ảnh rộng hơn) → cho chữ tràn quá vùng đó tới `overflow` lần
 * mà vẫn nằm trong lòng trắng; nhờ vậy ảnh không phải phóng quá to so với màn.
 */
export const FIXED_BUBBLE_OVERFLOW = 1.1;

function fixedSpec(style: 'curse' | 'think') {
  const spec = uiImageSpec(style === 'curse' ? 'bubble-curse' : 'bubble-think');
  const size = spec?.size ?? [220, 210];
  const content = spec?.content ?? [size[0] * 0.2, size[1] * 0.2, size[0] * 0.6, size[1] * 0.35];
  const anchor = spec?.anchor ?? [0.5, 1];
  return { size, content, anchor };
}

/** Bề rộng xuống dòng cho chữ trong bong bóng ảnh cố định khi phóng tối đa `maxScale`. */
export function fixedBubbleWrapWidth(style: 'curse' | 'think', maxScale: number): number {
  return Math.floor(fixedSpec(style).content[2] * maxScale * FIXED_BUBBLE_OVERFLOW);
}

/**
 * Bong bóng ảnh cố định (chửi thề / nghĩ): co giãn cả khối cho chữ vừa vùng `content` (× overflow), kẹp trong
 * [minScale, maxScale]. Gốc ảnh đặt theo `anchor` tại điểm (0, -headGap) trên đầu nhân vật. Trả về cỡ hiển thị + tâm chữ
 * (toạ độ tính từ đầu nhân vật).
 */
export function fixedBubbleLayout(
  style: 'curse' | 'think',
  textW: number,
  textH: number,
  minScale: number,
  maxScale = Number.POSITIVE_INFINITY,
): { scale: number; w: number; h: number; origin: [number, number]; text: { x: number; y: number }; textMaxW: number } {
  const { size, content, anchor } = fixedSpec(style);
  const k = FIXED_BUBBLE_OVERFLOW;
  const need = Math.max(textW / (content[2] * k), textH / (content[3] * k));
  const scale = Math.min(Math.max(minScale, maxScale), Math.max(minScale, need));
  const w = size[0] * scale;
  const h = size[1] * scale;
  const left = -anchor[0] * w;
  const top = -BUBBLE_TEXT_PAD.headGap - anchor[1] * h;
  return {
    scale,
    w,
    h,
    origin: [anchor[0], anchor[1]],
    text: { x: left + (content[0] + content[2] / 2) * scale, y: top + (content[1] + content[3] / 2) * scale },
    textMaxW: content[2] * scale * k,
  };
}

// ---------------------------------------------------------------- viền ô ngoài tầm (ART-UI-001 phương án A)

/**
 * Các đoạn nét đứt quanh hình chữ nhật (đi vòng theo chiều kim đồng hồ từ góc trên-trái): đoạn `dash` px, hở `gap` px.
 * Trả về [x1, y1, x2, y2] — đoạn bị cắt ở góc thì gập theo cạnh kế (nhịp nét liền mạch quanh góc).
 */
export function dashedRectSegments(r: Rect, dash: number, gap: number): [number, number, number, number][] {
  const out: [number, number, number, number][] = [];
  const per = 2 * (r.w + r.h);
  if (dash <= 0 || per <= 0) return out;
  // Điểm trên chu vi ở quãng đường s (0 = góc trên-trái).
  const at = (s: number): [number, number] => {
    if (s <= r.w) return [r.x + s, r.y];
    if (s <= r.w + r.h) return [r.x + r.w, r.y + (s - r.w)];
    if (s <= 2 * r.w + r.h) return [r.x + r.w - (s - r.w - r.h), r.y + r.h];
    return [r.x, r.y + r.h - (s - 2 * r.w - r.h)];
  };
  const corners = [r.w, r.w + r.h, 2 * r.w + r.h];
  for (let s = 0; s < per; s += dash + gap) {
    const e = Math.min(per, s + dash);
    // Cắt đoạn tại các góc nằm giữa s và e.
    let a = s;
    for (const c of corners) {
      if (c > a && c < e) {
        out.push([...at(a), ...at(c)]);
        a = c;
      }
    }
    out.push([...at(a), ...at(e)]);
  }
  return out;
}
