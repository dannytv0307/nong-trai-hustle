// HUD của Vườn: scene chạy song song, vẽ đè lên GardenScene. Tách riêng vì camera Vườn
// được phóng to (cameraZoom) — chữ UI để ở scene này thì không bị phóng/nhòe theo.
// T-003: hotbar 9 ô giữa dưới màn (ô chọn viền vàng, số lượng ở góc), nút "Gùi", cửa sổ gùi (E) 2 × 9 có tên món
// khi rê chuột, icon đồ hái bay vào ô + ô nảy. Scene này CHỈ VẼ: gùi, ô chọn, cửa sổ mở/đóng, ô dưới con trỏ
// đều do GardenScene giữ (qua InputController) — HUD đọc mỗi frame, chỉ vẽ lại khi `inventoryRevision` đổi.
// Các task sau (đồng hồ T-005, thanh Sức T-004) sẽ thêm vào đây.
import Phaser from 'phaser';
import { gameConfig } from '../config/gameConfig';
import { cssColor, palette } from '../config/palette';
import { textStyles, uiFontFamily } from '../config/theme';
import type { ItemStack } from '../systems/inventory';
import { itemInfo } from '../systems/items';
import { BAG_WINDOW, bagButtonRect, bagPanelRect, bagSlotRect, hotbarSlotRect, type Rect } from '../ui/hudLayout';
import { drawItemIcon } from '../ui/itemArt';
import type { GardenScene } from './GardenScene';

/** Trạng thái HUD cho QA đọc (qua GardenScene.debugState.hud). */
export interface HudDebugState {
  /** Số icon đang bay vào hotbar / gùi. */
  flying: number;
  /** Số lần icon bay tới nơi (ô nảy). */
  landed: number;
  /** Ô hotbar đang nảy (-1 = không); nút gùi đang nảy. */
  bouncingSlot: number;
  bagButtonBouncing: boolean;
  /** Cửa sổ gùi đang hiện; tên món trong tooltip (null = không hiện). */
  bagVisible: boolean;
  tooltip: string | null;
  /** Tâm tooltip (toạ độ màn 1920×1080), null = không hiện — QA kiểm không đè tiêu đề (BUG-011). */
  tooltipCenter: { x: number; y: number } | null;
  /** Ô hotbar đang có viền vàng. */
  selectedFrame: number;
  /** Chữ số lượng đang hiện trên từng ô hotbar ('' = ô trống). */
  hotbarCounts: string[];
}

/** Một ô vẽ (hotbar hoặc cửa sổ gùi): khung, icon, số lượng, số phím. */
interface SlotView {
  root: Phaser.GameObjects.Container;
  icon: Phaser.GameObjects.Graphics;
  count: Phaser.GameObjects.Text;
  size: number;
}

/** Icon đang bay: từ toạ độ màn (ô ruộng) tới ô hotbar / nút gùi. */
interface Flyer {
  g: Phaser.GameObjects.Graphics;
  t: number;
  fromX: number;
  fromY: number;
  /** Ô hotbar đích (≥ 0) hoặc -1 = nút gùi. */
  target: number;
}

/** Sự kiện GardenScene phát khi nhận đồ (hái). */
export interface ItemGainedEvent {
  itemId: string;
  /** Ô gùi nhận đồ (-1 = không rõ). */
  slot: number;
  screenX: number;
  screenY: number;
}

const FLY_POOL = gameConfig.actionQueueMax + 2;
/** Icon bay vồng lên bao nhiêu px trước khi rơi vào ô. */
const FLY_ARC = 140;

export class GardenHudScene extends Phaser.Scene {
  private garden!: GardenScene;
  private drawnRevision = -1;
  private readonly hotbar: SlotView[] = [];
  private readonly bagSlots: SlotView[] = [];
  private selectFrame!: Phaser.GameObjects.Graphics;
  private bagSelectFrame!: Phaser.GameObjects.Graphics;
  private bagButton!: Phaser.GameObjects.Container;
  private bagWindow!: Phaser.GameObjects.Container;
  private tooltip!: Phaser.GameObjects.Container;
  private tooltipBg!: Phaser.GameObjects.Graphics;
  private tooltipText!: Phaser.GameObjects.Text;
  /** Ô + món đang hiện tooltip (chỉ vẽ lại khi đổi). */
  private tooltipSlot = -2;
  private tooltipItem: string | null = null;
  private readonly flyers: Flyer[] = [];
  /** Thời gian nảy còn lại của từng ô hotbar, và của nút gùi. */
  private readonly bounceT: number[] = [];
  private bagBounceT = 0;
  private landed = 0;

  constructor() {
    super('GardenHud');
  }

  create(): void {
    const { gameWidth: w, gameHeight: h } = gameConfig;
    this.garden = this.scene.get('Garden') as GardenScene;
    this.drawnRevision = -1;
    this.flyers.length = 0;
    this.bounceT.length = 0;
    this.hotbar.length = 0;
    this.bagSlots.length = 0;

    // Góc dưới phải: gợi ý phím (T-005 thay bằng dòng đầy đủ). Nằm phải nút gùi, không đè hotbar.
    const hint = ['WASD: đi · Click: làm việc', '1–9 / cuộn: chọn ô · E: gùi'];
    if (gameConfig.devCheatsEnabled) hint.push('G: qua một đêm (phím thử)');
    this.add
      .text(w - 32, h - 28, hint.join('\n'), { ...textStyles.body, fontSize: '20px', strokeThickness: 5, align: 'right' })
      .setOrigin(1, 1);

    // Hotbar 9 ô giữa dưới màn.
    for (let i = 0; i < gameConfig.hotbarSlots; i++) {
      const view = this.makeSlot(hotbarSlotRect(i), String(i + 1));
      this.hotbar.push(view);
      this.bounceT.push(0);
    }
    this.selectFrame = this.add.graphics();
    this.drawSelectFrame(this.selectFrame, hotbarSlotRect(0).w);

    // Nút "Gùi" (icon đồ hái bay vào đây khi đồ rơi xuống hàng dưới của gùi; bấm để mở gùi).
    const br = bagButtonRect();
    const btnBg = this.add.graphics();
    btnBg.fillStyle(palette.ink, 1).fillRoundedRect(-br.w / 2 - 3, -br.h / 2 - 3, br.w + 6, br.h + 6, 12);
    btnBg.fillStyle(palette.earth, 1).fillRoundedRect(-br.w / 2, -br.h / 2, br.w, br.h, 10);
    // Hình cái gùi tre đơn giản.
    btnBg.fillStyle(palette.wood, 1).fillRoundedRect(-22, -22, 44, 34, 8);
    btnBg.lineStyle(3, palette.ink, 1).strokeRoundedRect(-22, -22, 44, 34, 8);
    btnBg.lineStyle(2, palette.ink, 0.6).lineBetween(-22, -8, 22, -8).lineBetween(-22, 2, 22, 2);
    const btnText = this.add.text(0, 30, 'Gùi (E)', { ...textStyles.nameTag, fontSize: '17px', strokeThickness: 4 }).setOrigin(0.5);
    this.bagButton = this.add.container(br.x + br.w / 2, br.y + br.h / 2, [btnBg, btnText]);

    this.buildBagWindow();

    for (let i = 0; i < FLY_POOL; i++) {
      this.flyers.push({ g: this.add.graphics().setVisible(false).setDepth(100), t: 0, fromX: 0, fromY: 0, target: -1 });
    }

    const onGained = (e: ItemGainedEvent) => this.spawnFlyer(e);
    this.garden.events.on('item-gained', onGained);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.garden.events.off('item-gained', onGained));
  }

  /** Một ô: nền giấy viền mực, icon ở giữa, số lượng góc dưới-phải, (tuỳ chọn) số phím góc trên-trái. */
  private makeSlot(r: Rect, keyLabel: string | null): SlotView {
    const s = r.w;
    const bg = this.add.graphics();
    bg.fillStyle(palette.ink, 0.9).fillRoundedRect(-s / 2 - 3, -s / 2 - 3, s + 6, s + 6, 12);
    bg.fillStyle(palette.paper, 0.92).fillRoundedRect(-s / 2, -s / 2, s, s, 10);
    const icon = this.add.graphics();
    const count = this.add
      .text(s / 2 - 8, s / 2 - 4, '', { fontFamily: uiFontFamily, fontSize: '24px', fontStyle: 'bold', color: cssColor('paper'), stroke: cssColor('ink'), strokeThickness: 5 })
      .setOrigin(1, 1);
    const parts: Phaser.GameObjects.GameObject[] = [bg, icon, count];
    if (keyLabel) {
      parts.push(
        this.add
          .text(-s / 2 + 8, -s / 2 + 4, keyLabel, { fontFamily: uiFontFamily, fontSize: '17px', fontStyle: 'bold', color: cssColor('earth') })
          .setOrigin(0, 0),
      );
    }
    const root = this.add.container(r.x + s / 2, r.y + s / 2, parts);
    return { root, icon, count, size: s };
  }

  /** Viền vàng hoa hòe (lót mực) quanh ô đang chọn — vẽ một lần, chỉ dời chỗ. */
  private drawSelectFrame(g: Phaser.GameObjects.Graphics, s: number): void {
    g.clear();
    g.lineStyle(10, palette.ink, 0.9).strokeRoundedRect(-s / 2 - 6, -s / 2 - 6, s + 12, s + 12, 14);
    g.lineStyle(6, palette.gold, 1).strokeRoundedRect(-s / 2 - 6, -s / 2 - 6, s + 12, s + 12, 14);
  }

  /** Cửa sổ gùi (E): nền tối mờ, khung giữa màn, 2 hàng × 9 ô (hàng trên = hotbar), tooltip tên món. */
  private buildBagWindow(): void {
    const { gameWidth: w, gameHeight: h } = gameConfig;
    const n = this.garden.inventory.slots.length;
    const panel = bagPanelRect(n);
    const parts: Phaser.GameObjects.GameObject[] = [];
    parts.push(this.add.rectangle(0, 0, w, h, palette.ink, 0.55).setOrigin(0));
    const g = this.add.graphics();
    g.fillStyle(palette.ink, 1).fillRoundedRect(panel.x - 5, panel.y - 5, panel.w + 10, panel.h + 10, 22);
    g.fillStyle(palette.earth, 1).fillRoundedRect(panel.x, panel.y, panel.w, panel.h, 18);
    // Vạch ngăn hàng hotbar với hàng dưới.
    if (n > gameConfig.hotbarSlots) {
      const r0 = bagSlotRect(0, n);
      const r1 = bagSlotRect(gameConfig.hotbarSlots, n);
      const y = (r0.y + r0.h + r1.y) / 2;
      g.lineStyle(3, palette.wood, 0.9).lineBetween(panel.x + BAG_WINDOW.pad, y, panel.x + panel.w - BAG_WINDOW.pad, y);
    }
    parts.push(g);
    parts.push(this.add.text(panel.x + BAG_WINDOW.pad, panel.y + 22, 'Gùi', textStyles.subtitle).setOrigin(0, 0));
    parts.push(
      this.add
        .text(panel.x + panel.w - BAG_WINDOW.pad, panel.y + 40, 'Hàng trên = thanh 1–9', { ...textStyles.body, fontSize: '20px', strokeThickness: 5 })
        .setOrigin(1, 0),
    );
    parts.push(
      this.add
        .text(panel.x + panel.w / 2, panel.y + panel.h - 22, 'Rê chuột lên món để xem tên · E / Esc: đóng', { ...textStyles.body, fontSize: '20px', strokeThickness: 5 })
        .setOrigin(0.5, 1),
    );
    this.bagWindow = this.add.container(0, 0, parts).setDepth(50).setVisible(false);
    for (let i = 0; i < n; i++) {
      const view = this.makeSlot(bagSlotRect(i, n), i < gameConfig.hotbarSlots ? String(i + 1) : null);
      this.bagSlots.push(view);
      this.bagWindow.add(view.root);
    }
    this.bagSelectFrame = this.add.graphics();
    this.drawSelectFrame(this.bagSelectFrame, BAG_WINDOW.slot);
    this.bagWindow.add(this.bagSelectFrame);

    this.tooltipBg = this.add.graphics();
    this.tooltipText = this.add.text(0, 0, '', { ...textStyles.body, fontSize: '22px', color: cssColor('ink'), strokeThickness: 0 }).setOrigin(0.5);
    this.tooltip = this.add.container(0, 0, [this.tooltipBg, this.tooltipText]).setDepth(60).setVisible(false);
  }

  override update(_time: number, delta: number): void {
    const dt = delta / 1000;
    const inv = this.garden.inventory;
    if (this.garden.inventoryRevision !== this.drawnRevision) {
      this.drawnRevision = this.garden.inventoryRevision;
      for (let i = 0; i < this.hotbar.length; i++) this.drawSlot(this.hotbar[i], inv.slots[i] ?? null);
      for (let i = 0; i < this.bagSlots.length; i++) this.drawSlot(this.bagSlots[i], inv.slots[i] ?? null);
    }
    const sel = this.hotbar[inv.selected];
    if (sel) this.selectFrame.setPosition(sel.root.x, sel.root.y);
    const bagSel = this.bagSlots[inv.selected];
    if (bagSel) this.bagSelectFrame.setPosition(bagSel.root.x, bagSel.root.y);

    this.bagWindow.setVisible(this.garden.bagOpen);
    this.updateTooltip();
    this.updateFlyers(dt);
    this.updateBounces(dt);
  }

  private drawSlot(view: SlotView, stack: ItemStack | null): void {
    view.icon.clear();
    if (!stack) {
      view.count.setText('');
      return;
    }
    drawItemIcon(view.icon, stack.id, view.size * 0.78);
    view.count.setText(String(stack.count));
  }

  /** Tên món trên ô gùi dưới con trỏ (GardenScene tính ô nào), hiện ngay trên ô đó. */
  private updateTooltip(): void {
    const slot = this.garden.bagOpen ? this.garden.bagHoverSlot : -1;
    const stack = slot >= 0 ? this.garden.inventory.slots[slot] : null;
    const shown = stack ? slot : -1;
    const item = stack?.id ?? null;
    if (shown === this.tooltipSlot && item === this.tooltipItem) return;
    this.tooltipSlot = shown;
    this.tooltipItem = item;
    if (!stack) {
      this.tooltip.setVisible(false);
      return;
    }
    const name = itemInfo(stack.id)?.name ?? stack.id;
    this.tooltipText.setText(name);
    const w = Math.ceil(this.tooltipText.width) + 28;
    const h = Math.ceil(this.tooltipText.height) + 8;
    this.tooltipBg.clear();
    this.tooltipBg.fillStyle(palette.ink, 1).fillRoundedRect(-w / 2 - 3, -h / 2 - 3, w + 6, h + 6, 10);
    this.tooltipBg.fillStyle(palette.paper, 1).fillRoundedRect(-w / 2, -h / 2, w, h, 8);
    const r = bagSlotRect(slot, this.garden.inventory.slots.length);
    // BUG-011: tooltip nằm trong khe giữa hai hàng — hàng trên hiện BÊN DƯỚI ô (không đè tiêu đề "Gùi" / chú thích
    // góc phải), hàng dưới hiện BÊN TRÊN ô (không đè dòng hướng dẫn ở chân cửa sổ).
    const topRow = slot < gameConfig.hotbarSlots;
    const y = topRow ? r.y + r.h + h / 2 + 2 : r.y - h / 2 - 2;
    this.tooltip.setPosition(r.x + r.w / 2, y).setVisible(true);
  }

  /** Hái xong: icon món bay từ ô ruộng (toạ độ màn) vào ô hotbar nhận đồ, hoặc vào nút gùi nếu đồ nằm hàng dưới. */
  private spawnFlyer(e: ItemGainedEvent): void {
    const f = this.flyers.find((x) => x.t <= 0);
    if (!f) return;
    f.g.clear();
    drawItemIcon(f.g, e.itemId, 64);
    f.fromX = e.screenX;
    f.fromY = e.screenY;
    f.target = e.slot >= 0 && e.slot < this.hotbar.length ? e.slot : -1;
    f.t = gameConfig.harvestFlySeconds;
    f.g.setPosition(f.fromX, f.fromY).setScale(1.2).setAlpha(1).setVisible(true);
  }

  private updateFlyers(dt: number): void {
    const dur = gameConfig.harvestFlySeconds;
    for (const f of this.flyers) {
      if (f.t <= 0) continue;
      f.t = Math.max(0, f.t - dt);
      const to = f.target >= 0 ? this.hotbar[f.target].root : this.bagButton;
      const p = 1 - f.t / dur; // 0 → 1
      // Đi đều theo ngang, vồng lên theo hình sin rồi rơi vào ô; nhỏ dần cho vừa ô.
      const ease = p * p * (3 - 2 * p);
      const x = f.fromX + (to.x - f.fromX) * ease;
      const y = f.fromY + (to.y - f.fromY) * ease - FLY_ARC * Math.sin(Math.PI * p);
      f.g.setPosition(x, y).setScale(1.2 - 0.35 * p);
      if (f.t <= 0) {
        f.g.setVisible(false);
        this.landed++;
        if (f.target >= 0) this.bounceT[f.target] = gameConfig.hotbarBounceSeconds;
        else this.bagBounceT = gameConfig.hotbarBounceSeconds;
      }
    }
  }

  /** Ô hotbar / nút gùi "nảy": phóng to theo nửa hình sin rồi về. */
  private updateBounces(dt: number): void {
    const dur = gameConfig.hotbarBounceSeconds;
    const k = gameConfig.hotbarBounceScale;
    for (let i = 0; i < this.hotbar.length; i++) {
      if (this.bounceT[i] <= 0) continue;
      this.bounceT[i] = Math.max(0, this.bounceT[i] - dt);
      const p = 1 - this.bounceT[i] / dur;
      this.hotbar[i].root.setScale(1 + k * Math.sin(Math.PI * p));
    }
    if (this.bagBounceT > 0) {
      this.bagBounceT = Math.max(0, this.bagBounceT - dt);
      const p = 1 - this.bagBounceT / dur;
      this.bagButton.setScale(1 + k * Math.sin(Math.PI * p));
    }
  }

  get debugState(): HudDebugState {
    return {
      flying: this.flyers.filter((f) => f.t > 0).length,
      landed: this.landed,
      bouncingSlot: this.bounceT.findIndex((t) => t > 0),
      bagButtonBouncing: this.bagBounceT > 0,
      bagVisible: this.bagWindow?.visible ?? false,
      tooltip: this.tooltip?.visible ? this.tooltipText.text : null,
      tooltipCenter: this.tooltip?.visible ? { x: this.tooltip.x, y: this.tooltip.y } : null,
      selectedFrame: this.hotbar.findIndex((v) => v.root.x === this.selectFrame?.x),
      hotbarCounts: this.hotbar.map((v) => v.count.text),
    };
  }
}
