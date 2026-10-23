// Thẻ "Lên level N! / Mở khóa" (T-042, GDD §7, §8) trên HUD: nền mờ, chữ lớn vàng viền mực nảy xuống ("đóng dấu"), khung giấy
// điệp với các dòng mở khóa (nhãn loại + tên + dòng phụ), nút "Hay quá!", pháo giấy rơi lả tả. CHỈ VẼ — thẻ nào đang hiện,
// con trỏ trên nút, thời gian từ lúc mở do GardenScene giữ (`levelCardModel`). Mỗi thẻ mới (level khác) dựng lại phần
// khung + chữ một lần (số dòng khác nhau); mỗi frame chỉ đổi cỡ chữ lớn, trạng thái nút, vị trí pháo giấy (pool, tạo một lần).
import Phaser from 'phaser';
import { gameConfig } from '../config/gameConfig';
import { cssColor, palette } from '../config/palette';
import { paperText, textStyles } from '../config/theme';
import type { LevelUnlock } from '../systems/level';
import { WINDOW_CHROME } from './hudLayout';
import {
  confettiAt,
  LEVEL_CARD,
  levelCardButtonRect,
  levelCardCloseRect,
  levelCardRect,
  levelHeadingCenter,
  levelRowCenterY,
  type ConfettiPiece,
} from './levelLayout';
import { buildPaperWindow, setCloseHover, UiButton, type PaperWindow } from './uiKit';
import { buttonState } from './uiSpec';

/** Thứ HUD cần để vẽ thẻ (GardenScene tính). */
export interface LevelCardModel {
  open: boolean;
  level: number;
  heading: string;
  unlocks: readonly LevelUnlock[];
  /** Thẻ thứ mấy trong đợt (1…total) — lên nhiều level một lần thì hiện lần lượt. */
  index: number;
  total: number;
  /** Giây từ lúc thẻ này hiện (nhịp nảy chữ lớn, pháo giấy). */
  t: number;
  hoverButton: boolean;
  closeHover: boolean;
  pointerDown: boolean;
}

/** Thẻ nằm trên các cửa sổ khác (50–75), dưới màn tối đêm (80) và Tạm dừng (90). Pháo giấy ngay trên thẻ. */
const DEPTH_CARD = 78;
const DEPTH_CONFETTI = 79;
/** Câu khi level không mở gì mới (levels.json không có dòng). */
export const NO_UNLOCK_TEXT = 'Tiếng tăm vang khắp làng Lầy!';
/** Màu pháo giấy (palette Art Bible). */
const CONFETTI_COLORS = [palette.vermilion, palette.gold, palette.sprout, palette.water, palette.paper];
const CONFETTI_SIZE = { w: 14, h: 22 } as const;

export class LevelUpCardView {
  private readonly scene: Phaser.Scene;
  private root: Phaser.GameObjects.Container | null = null;
  private chrome: PaperWindow | null = null;
  private button: UiButton | null = null;
  private heading: Phaser.GameObjects.Text | null = null;
  private readonly confetti: Phaser.GameObjects.Rectangle[] = [];
  private readonly piece: ConfettiPiece = { x: 0, y: 0, angle: 0, alpha: 0, color: 0 };
  /** Thẻ đang dựng (level + thứ tự) — đổi thì dựng lại. */
  private builtFor = '';
  private rowTexts: string[] = [];
  private confettiOn = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    for (let i = 0; i < gameConfig.levelUpConfettiCount; i++) {
      this.confetti.push(scene.add.rectangle(0, 0, CONFETTI_SIZE.w, CONFETTI_SIZE.h, palette.gold, 1).setDepth(DEPTH_CONFETTI).setVisible(false));
    }
  }

  get visible(): boolean {
    return this.root?.visible ?? false;
  }

  /** Chữ lớn đang hiện ('' = không). */
  get headingText(): string {
    return this.visible ? (this.heading?.text ?? '') : '';
  }

  /** Các dòng mở khóa đang hiện ("Khu mới: Núi sau nhà"). */
  get unlockTexts(): string[] {
    return this.visible ? [...this.rowTexts] : [];
  }

  get buttonText(): string {
    return this.visible ? (this.button?.label.text ?? '') : '';
  }

  /** Số mảnh pháo giấy đang hiện. */
  get confettiVisible(): number {
    return this.confettiOn;
  }

  /** Cỡ chữ nhỏ nhất (px) trên thẻ đang hiện — QA kiểm "chữ ≥ 24px". 0 = không hiện. */
  minFontPx(): number {
    if (!this.root?.visible) return 0;
    let min = Number.POSITIVE_INFINITY;
    for (const o of this.root.list) {
      if (o instanceof Phaser.GameObjects.Text && o.visible && o.text.trim() !== '') min = Math.min(min, parseFloat(String(o.style.fontSize)));
    }
    return Number.isFinite(min) ? min : 0;
  }

  update(m: LevelCardModel): void {
    if (!m.open) {
      if (this.root?.visible) this.root.setVisible(false);
      this.builtFor = '';
      this.hideConfetti();
      return;
    }
    const sig = `${m.level}|${m.index}|${m.total}`;
    if (sig !== this.builtFor) this.build(m, sig);
    const root = this.root!;
    root.setVisible(true);

    // Chữ lớn "đóng dấu": từ to (× 1 + popScale) nảy về cỡ thật, hiện nhanh. Thẻ hiện dần cùng lúc.
    const pop = Math.min(1, m.t / Math.max(0.001, gameConfig.levelUpPopSeconds));
    const ease = 1 - (1 - pop) * (1 - pop) * (1 - pop);
    this.heading?.setScale(1 + gameConfig.levelUpPopScale * (1 - ease)).setAlpha(Math.min(1, pop * 2.5));
    root.setAlpha(Math.min(1, 0.3 + pop));

    const rows = Math.max(1, m.unlocks.length);
    this.button?.setState(buttonState(true, m.hoverButton, m.pointerDown));
    setCloseHover(this.chrome?.close ?? null, m.closeHover, levelCardCloseRect(rows).w);

    // Pháo giấy: chỉ thẻ ĐẦU của đợt (lên 2 level một lần không bắn 2 lần chồng nhau).
    this.confettiOn = 0;
    const seconds = gameConfig.levelUpConfettiSeconds;
    for (let i = 0; i < this.confetti.length; i++) {
      const c = this.confetti[i];
      if (m.index !== 1 || !confettiAt(i, m.t, seconds, CONFETTI_COLORS.length, this.piece)) {
        if (c.visible) c.setVisible(false);
        continue;
      }
      const p = this.piece;
      c.setPosition(p.x, p.y).setAngle(p.angle).setAlpha(p.alpha).setFillStyle(CONFETTI_COLORS[p.color], 1).setVisible(true);
      this.confettiOn++;
    }
  }

  private hideConfetti(): void {
    if (this.confettiOn === 0) return;
    for (const c of this.confetti) c.setVisible(false);
    this.confettiOn = 0;
  }

  /** Dựng khung + chữ cho thẻ `m` (thay thẻ cũ). Chỉ chạy khi sang thẻ khác. */
  private build(m: LevelCardModel, sig: string): void {
    this.root?.destroy();
    this.builtFor = sig;
    const scene = this.scene;
    const { gameWidth: w, gameHeight: h } = gameConfig;
    const rows = Math.max(1, m.unlocks.length);
    const p = levelCardRect(rows);
    this.chrome = buildPaperWindow(scene, p, { closeRect: levelCardCloseRect(rows), screen: { w, h }, dimAlpha: 0.55 });
    const parts: Phaser.GameObjects.GameObject[] = [...this.chrome.parts];

    const hc = levelHeadingCenter(rows);
    this.heading = scene.add.text(hc.x, hc.y, m.heading, { ...textStyles.title, fontSize: '88px', strokeThickness: 12 }).setOrigin(0.5);
    parts.push(this.heading);

    const left = p.x + LEVEL_CARD.pad;
    parts.push(scene.add.text(left, p.y + WINDOW_CHROME.titleY + 6, 'Mở khóa', { ...paperText.title, fontSize: '44px' }).setOrigin(0, 0.5));
    if (m.total > 1) {
      parts.push(
        scene.add
          .text(p.x + p.w - LEVEL_CARD.pad - 40, p.y + WINDOW_CHROME.titleY + 8, `Thẻ ${m.index}/${m.total}`, { ...paperText.note, fontStyle: 'bold' })
          .setOrigin(1, 0.5),
      );
    }
    const rule = scene.add.graphics();
    rule.lineStyle(3, palette.earth, 0.5).lineBetween(left, p.y + LEVEL_CARD.header - 18, p.x + p.w - LEVEL_CARD.pad, p.y + LEVEL_CARD.header - 18);
    parts.push(rule);

    this.rowTexts = [];
    if (m.unlocks.length === 0) {
      parts.push(scene.add.text(p.x + p.w / 2, levelRowCenterY(0, rows), NO_UNLOCK_TEXT, { ...paperText.body, fontSize: '32px' }).setOrigin(0.5));
      this.rowTexts.push(NO_UNLOCK_TEXT);
    }
    m.unlocks.forEach((u, i) => {
      const cy = levelRowCenterY(i, rows);
      const textX = left + LEVEL_CARD.labelW;
      parts.push(scene.add.text(left, cy, u.label, { ...paperText.note, fontSize: '26px', fontStyle: 'bold', color: cssColor('vermilion') }).setOrigin(0, 0.5));
      const main = scene.add.text(textX, u.detail ? cy - 16 : cy, u.text, { ...paperText.body, fontSize: '34px' }).setOrigin(0, 0.5);
      parts.push(main);
      if (u.detail) parts.push(scene.add.text(textX, cy + 22, u.detail, paperText.note).setOrigin(0, 0.5));
      this.rowTexts.push(`${u.label}: ${u.text}`);
    });

    const last = m.index >= m.total;
    this.button = new UiButton(scene, levelCardButtonRect(rows), last ? 'Hay quá! (Enter)' : 'Tiếp (Enter)', { ...paperText.button, fontSize: '32px' });
    parts.push(...this.button.parts);
    this.root = scene.add.container(0, 0, parts).setDepth(DEPTH_CARD);
  }
}
