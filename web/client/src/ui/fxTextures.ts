// T-027: hai texture hiệu ứng vẽ bằng code một lần cho cả game (chưa cần ảnh gen): đốm lấp lánh 4 cánh (cây chín gọi hái)
// và quầng sáng tròn mờ dần ra mép (vệt sáng sau icon món hái bay). Màu theo bảng màu Art Bible (trắng điệp + vàng hoa hòe).
import Phaser from 'phaser';
import { palette } from '../config/palette';

export const FX_SPARKLE = 'fx-sparkle';
export const FX_GLOW = 'fx-glow';
/** Cỡ gốc (px) của hai texture — người dùng phóng theo cỡ muốn hiện. */
export const FX_SPARKLE_SIZE = 32;
export const FX_GLOW_SIZE = 64;

/** Đốm lấp lánh: ngôi sao 4 cánh nhọn trắng điệp, viền vàng, nhân vàng. Tạo một lần (đã có thì thôi). */
export function ensureSparkleTexture(scene: Phaser.Scene): void {
  if (scene.textures.exists(FX_SPARKLE)) return;
  const s = FX_SPARKLE_SIZE;
  const c = s / 2;
  const outer = c - 1;
  const inner = s * 0.11;
  const pts: Phaser.Types.Math.Vector2Like[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI / 4) * i - Math.PI / 2;
    const r = i % 2 === 0 ? outer : inner;
    pts.push({ x: c + Math.cos(a) * r, y: c + Math.sin(a) * r });
  }
  const g = scene.make.graphics({}, false);
  g.fillStyle(palette.paper, 1).fillPoints(pts, true);
  g.lineStyle(1.5, palette.gold, 1).strokePoints(pts, true);
  g.fillStyle(palette.gold, 1).fillCircle(c, c, s * 0.09);
  g.generateTexture(FX_SPARKLE, s, s);
  g.destroy();
}

/** Quầng sáng: tâm trắng điệp → vàng hoa hòe → trong suốt ở mép (gradient tròn trên canvas). Tạo một lần. */
export function ensureGlowTexture(scene: Phaser.Scene): void {
  if (scene.textures.exists(FX_GLOW)) return;
  const s = FX_GLOW_SIZE;
  const tex = scene.textures.createCanvas(FX_GLOW, s, s);
  const ctx = tex?.getContext();
  if (!tex || !ctx) return;
  const grad = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  grad.addColorStop(0, rgba(palette.paper, 1));
  grad.addColorStop(0.35, rgba(palette.gold, 0.85));
  grad.addColorStop(1, rgba(palette.gold, 0));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, s, s);
  tex.refresh();
}

function rgba(color: number, alpha: number): string {
  return `rgba(${(color >> 16) & 0xff},${(color >> 8) & 0xff},${color & 0xff},${alpha})`;
}
