// T-092: dựng giao diện Lô 1 bằng Phaser — khung 9-slice (`this.add.nineslice`), nút 4 trạng thái, icon, cửa sổ giấy
// điệp dùng chung (nền tối + khung + nút đóng). Mọi cửa sổ (gùi, thùng bán, sạp hạt, rương, hộp hỏi, tổng kết, Tạm dừng
// — và sau này thoại, cửa hàng, Kỳ kèo) dựng qua đây để cùng một kiểu.
//
// Dự phòng: ảnh chưa tải được (hoặc máy không có WebGL — NineSlice của Phaser chỉ vẽ được trên WebGL) → vẽ hình khối bằng
// code cùng bố cục, console.warn một lần mỗi ảnh (như T-021). Số lề / cỡ lấy từ ui.json qua `uiSpec.ts`.
import Phaser from 'phaser';
import { cssColor, palette } from '../config/palette';
import { paperText } from '../config/theme';
import { mixColor } from './itemArt';
import {
  BUTTON_FRAME,
  buttonLabelCenterY,
  nineSliceSpec,
  uiKey,
  type ButtonState,
  type NineSliceName,
  type Rect,
  type UiIconName,
  type UiImageName,
} from './uiSpec';

const warned = new Set<string>();

/** Báo thiếu ảnh giao diện một lần mỗi ảnh (QA đọc console). */
export function warnUiFallback(name: string, why = 'chưa tải được ảnh'): void {
  if (warned.has(name)) return;
  warned.add(name);
  console.warn(`[UI] ${name}: ${why} — vẽ tạm bằng code`);
}

/** Ảnh giao diện có sẵn để dùng (đã tải). */
export function hasUiTexture(scene: Phaser.Scene, name: string): boolean {
  return scene.textures.exists(uiKey(name));
}

/** Khung 9-slice dùng được: ảnh đã tải VÀ đang chạy WebGL (Canvas không vẽ NineSlice). */
export function canNineSlice(scene: Phaser.Scene, name: NineSliceName): boolean {
  if (!nineSliceSpec(name)) {
    warnUiFallback(name, 'ui.json không có mục này');
    return false;
  }
  if (!hasUiTexture(scene, name)) {
    warnUiFallback(name);
    return false;
  }
  if (scene.game.renderer.type !== Phaser.WEBGL) {
    warnUiFallback(name, 'trình duyệt không chạy WebGL (NineSlice cần WebGL)');
    return false;
  }
  return true;
}

/** Xám ấm của nút khóa khi vẽ dự phòng (không thêm màu ngoài palette). */
const FALLBACK_GRAY = mixColor(palette.paper, palette.ink, 0.45);

/** Hình khối dự phòng cho từng khung (giữ đúng bố cục, màu Art Bible). */
function drawFallbackFrame(g: Phaser.GameObjects.Graphics, name: NineSliceName, w: number, h: number): void {
  g.clear();
  const box = (border: number, fill: number, radius: number, fillAlpha = 1) => {
    g.fillStyle(palette.ink, 1).fillRoundedRect(0, 0, w, h, radius);
    g.fillStyle(fill, fillAlpha).fillRoundedRect(border, border, w - border * 2, h - border * 2, Math.max(2, radius - border));
  };
  switch (name) {
    case 'panel-paper':
      box(5, palette.paper, 20);
      g.lineStyle(3, palette.vermilion, 0.8).strokeRoundedRect(14, 14, w - 28, h - 28, 12);
      break;
    case 'panel-tooltip':
    case 'bubble':
      box(3, palette.paper, 12);
      break;
    case 'bubble-boast':
      box(3, palette.gold, 12);
      break;
    case 'hud-plank':
      box(3, palette.earth, 12);
      break;
    case 'btn':
      box(4, palette.wood, 14);
      break;
    case 'btn-hover':
      box(4, palette.gold, 14);
      break;
    case 'btn-pressed':
      box(4, palette.earth, 14);
      break;
    case 'btn-disabled':
      box(4, FALLBACK_GRAY, 14);
      break;
    case 'slot':
      box(3, palette.paper, 12, 0.92);
      break;
    case 'slot-hover':
      box(3, palette.paper, 12, 1);
      g.lineStyle(3, palette.gold, 1).strokeRoundedRect(4, 4, w - 8, h - 8, 10);
      break;
    case 'slot-selected':
      box(7, palette.paper, 12, 0.92);
      g.lineStyle(5, palette.gold, 1).strokeRoundedRect(3, 3, w - 6, h - 6, 11);
      break;
    case 'slot-locked':
      box(3, palette.ash, 12);
      break;
    case 'hud-bamboo-bar':
      // Ống tre: chỉ vẽ vành (giữa trong suốt để thấy ruột vẽ bên dưới).
      g.lineStyle(10, palette.ink, 1).strokeRoundedRect(5, 5, w - 10, h - 10, 18);
      g.lineStyle(6, palette.gold, 1).strokeRoundedRect(5, 5, w - 10, h - 10, 18);
      break;
  }
}

/**
 * Một khung giao diện: NineSlice (ảnh thật) hoặc Graphics (dự phòng). Gốc = góc trên-trái `r`. Đổi kiểu khung (vd ô thường
 * → ô đang chọn, nút thường → rê chuột) bằng `setFrame` — không tạo object mới.
 */
export class UiFrame {
  readonly obj: Phaser.GameObjects.NineSlice | Phaser.GameObjects.Graphics;
  private current: NineSliceName;
  private w: number;
  private h: number;

  constructor(scene: Phaser.Scene, name: NineSliceName, r: Rect) {
    this.current = name;
    this.w = r.w;
    this.h = r.h;
    if (canNineSlice(scene, name)) {
      const s = nineSliceSpec(name)!.slice;
      this.obj = scene.add.nineslice(r.x, r.y, uiKey(name), undefined, r.w, r.h, s.left, s.right, s.top, s.bottom).setOrigin(0, 0);
    } else {
      const g = scene.add.graphics().setPosition(r.x, r.y);
      drawFallbackFrame(g, name, r.w, r.h);
      this.obj = g;
    }
  }

  get frameName(): NineSliceName {
    return this.current;
  }

  /** Dời + đổi cỡ khung (bong bóng co giãn theo câu, tooltip theo tên món). */
  setRect(r: Rect): this {
    const o = this.obj;
    o.setPosition(r.x, r.y);
    if (r.w === this.w && r.h === this.h) return this;
    this.w = r.w;
    this.h = r.h;
    if (o instanceof Phaser.GameObjects.NineSlice) o.setSize(r.w, r.h);
    else drawFallbackFrame(o, this.current, r.w, r.h);
    return this;
  }

  /** Đổi kiểu khung (chỉ làm việc khi khác kiểu đang hiện). */
  setFrame(name: NineSliceName): this {
    if (name === this.current) return this;
    this.current = name;
    const o = this.obj;
    if (o instanceof Phaser.GameObjects.NineSlice) {
      const spec = nineSliceSpec(name);
      if (spec && o.scene.textures.exists(uiKey(name))) {
        o.setTexture(uiKey(name));
        // Nút nhấn có lề trên/dưới khác nút thường → đặt lại lề (setSlices tính lại UV theo ảnh mới).
        o.setSlices(this.w, this.h, spec.slice.left, spec.slice.right, spec.slice.top, spec.slice.bottom);
      }
    } else {
      drawFallbackFrame(o, name, this.w, this.h);
    }
    return this;
  }
}

/** Icon dự phòng (vẽ bằng code) cho vài icon quan trọng; còn lại để trống. */
function drawFallbackIcon(g: Phaser.GameObjects.Graphics, name: UiIconName | UiImageName, size: number): void {
  const r = size / 2;
  g.clear();
  switch (name) {
    case 'icon-coin':
      g.fillStyle(palette.ink, 1).fillCircle(0, 0, r * 0.8 + 3);
      g.fillStyle(palette.gold, 1).fillCircle(0, 0, r * 0.8);
      g.fillStyle(palette.ink, 1).fillRect(-r * 0.17, -r * 0.17, r * 0.34, r * 0.34);
      break;
    case 'icon-sun':
      g.fillStyle(palette.ink, 1).fillCircle(0, 0, r * 0.6 + 3);
      g.fillStyle(palette.gold, 1).fillCircle(0, 0, r * 0.6);
      break;
    case 'icon-moon':
      g.fillStyle(palette.ink, 1).fillCircle(0, 0, r * 0.7 + 3);
      g.fillStyle(palette.paper, 1).fillCircle(0, 0, r * 0.7);
      g.fillStyle(palette.earth, 1).fillCircle(r * 0.38, -r * 0.25, r * 0.6);
      break;
    case 'icon-close':
      g.fillStyle(palette.ink, 1).fillCircle(0, 0, r * 0.8 + 3);
      g.fillStyle(palette.vermilion, 1).fillCircle(0, 0, r * 0.8);
      g.lineStyle(Math.max(3, r * 0.16), palette.paper, 1);
      g.lineBetween(-r * 0.35, -r * 0.35, r * 0.35, r * 0.35).lineBetween(-r * 0.35, r * 0.35, r * 0.35, -r * 0.35);
      break;
    case 'icon-lock':
      g.fillStyle(palette.ink, 1).fillRoundedRect(-r * 0.5, -r * 0.1, r, r * 0.8, 4);
      g.lineStyle(Math.max(3, r * 0.14), palette.ink, 1).strokeCircle(0, -r * 0.2, r * 0.32);
      break;
    case 'icon-bag':
      g.fillStyle(palette.wood, 1).fillRoundedRect(-r * 0.5, -r * 0.5, r, r * 0.8, 8);
      g.lineStyle(3, palette.ink, 1).strokeRoundedRect(-r * 0.5, -r * 0.5, r, r * 0.8, 8);
      break;
    case 'hud-clock-disc':
      g.fillStyle(palette.ink, 1).fillCircle(0, 0, r);
      g.fillStyle(palette.earth, 1).fillCircle(0, 0, r - 5);
      g.fillStyle(palette.paper, 1).fillCircle(0, 0, r - 16);
      break;
    default:
      break;
  }
}

/**
 * Icon / ảnh giao diện cố định, TÂM tại (x, y), cạnh `size` px (ảnh vuông) — ảnh thật hoặc hình vẽ dự phòng.
 * Đổi icon sau đó bằng `setUiIcon`.
 */
export function addUiIcon(scene: Phaser.Scene, name: UiIconName | UiImageName, x: number, y: number, size: number): Phaser.GameObjects.Image | Phaser.GameObjects.Graphics {
  if (hasUiTexture(scene, name)) return scene.add.image(x, y, uiKey(name)).setDisplaySize(size, size);
  warnUiFallback(name);
  const g = scene.add.graphics().setPosition(x, y);
  drawFallbackIcon(g, name, size);
  return g;
}

/** Đổi icon (mặt trời ↔ trăng, quạt nan ↔ áo tơi) giữ nguyên cỡ hiện. */
export function setUiIcon(obj: Phaser.GameObjects.Image | Phaser.GameObjects.Graphics, name: UiIconName, size: number): void {
  if (obj instanceof Phaser.GameObjects.Image) {
    if (obj.scene.textures.exists(uiKey(name))) obj.setTexture(uiKey(name)).setDisplaySize(size, size);
  } else {
    drawFallbackIcon(obj, name, size);
  }
}

/** Nút gỗ 4 trạng thái (thường / rê chuột / nhấn — chữ lún 12 px / xám) + chữ mực giữa vùng content. */
export class UiButton {
  readonly frame: UiFrame;
  readonly label: Phaser.GameObjects.Text;
  private state: ButtonState = 'normal';

  constructor(
    scene: Phaser.Scene,
    readonly rect: Rect,
    text: string,
    style: Phaser.Types.GameObjects.Text.TextStyle = paperText.button,
  ) {
    this.frame = new UiFrame(scene, 'btn', rect);
    this.label = scene.add.text(rect.x + rect.w / 2, buttonLabelCenterY('normal', rect), text, style).setOrigin(0.5);
  }

  get parts(): Phaser.GameObjects.GameObject[] {
    return [this.frame.obj, this.label];
  }

  get currentState(): ButtonState {
    return this.state;
  }

  setState(state: ButtonState): this {
    if (state === this.state) return this;
    this.state = state;
    this.frame.setFrame(BUTTON_FRAME[state]);
    this.label.setY(buttonLabelCenterY(state, this.rect));
    this.label.setColor(cssColor(state === 'disabled' ? 'inkMuted' : 'ink'));
    return this;
  }
}

/** Cửa sổ giấy điệp dựng sẵn: các phần để cho vào Container + nút đóng (có thể null). */
export interface PaperWindow {
  parts: Phaser.GameObjects.GameObject[];
  panel: UiFrame;
  close: Phaser.GameObjects.Image | Phaser.GameObjects.Graphics | null;
}

/** Nền tối phủ màn sau cửa sổ (ui.json palette.dim: mực alpha 0.45). */
export const WINDOW_DIM_ALPHA = 0.45;

/**
 * Cửa sổ dùng chung: nền mực mờ phủ cả màn (dimAlpha, 0 = không phủ), khung `panel-paper` ở `r`, icon đóng (X) ở
 * `closeRect` (null = cửa sổ không có nút đóng). Người gọi thêm chữ / ô / nút vào `parts` rồi bỏ cả vào một Container.
 */
export function buildPaperWindow(
  scene: Phaser.Scene,
  r: Rect,
  opts: { closeRect: Rect | null; dimAlpha?: number; screen: { w: number; h: number } },
): PaperWindow {
  const parts: Phaser.GameObjects.GameObject[] = [];
  const dim = opts.dimAlpha ?? WINDOW_DIM_ALPHA;
  if (dim > 0) parts.push(scene.add.rectangle(0, 0, opts.screen.w, opts.screen.h, palette.ink, dim).setOrigin(0));
  const panel = new UiFrame(scene, 'panel-paper', r);
  parts.push(panel.obj);
  let close: PaperWindow['close'] = null;
  if (opts.closeRect) {
    const c = opts.closeRect;
    close = addUiIcon(scene, 'icon-close', c.x + c.w / 2, c.y + c.h / 2, c.w);
    parts.push(close);
  }
  return { parts, panel, close };
}

/** Nút đóng phóng nhẹ khi rê chuột (biết là bấm được). */
export function setCloseHover(close: PaperWindow['close'], hover: boolean, size: number): void {
  if (!close) return;
  const k = hover ? 1.12 : 1;
  if (close instanceof Phaser.GameObjects.Image) close.setDisplaySize(size * k, size * k);
  else close.setScale(k);
}
