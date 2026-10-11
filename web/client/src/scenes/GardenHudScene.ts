// HUD của Vườn: scene chạy song song, vẽ đè lên GardenScene. Tách riêng vì camera Vườn
// được phóng to (cameraZoom) — chữ UI để ở scene này thì không bị phóng/nhòe theo.
// T-003: hotbar 9 ô giữa dưới màn (ô chọn viền vàng, số lượng ở góc), nút "Gùi", cửa sổ gùi (E) 2 × 9 có tên món
// khi rê chuột, icon đồ hái bay vào ô + ô nảy. Scene này CHỈ VẼ: gùi, ô chọn, cửa sổ mở/đóng, ô dưới con trỏ
// đều do GardenScene giữ (qua InputController) — HUD đọc mỗi frame, chỉ vẽ lại khi `inventoryRevision` đổi.
// T-004: thanh Sức góc trên trái (xanh lá → vàng < 50% → đỏ < 20%), viền màn tối khi đuối, ô hotbar nảy khi ăn.
// T-005: đồng hồ góc trên phải ("Ngày 1 · Mùa nắng", "14:30", icon mặt trời/trăng, nhấp nháy đỏ từ 23h), cửa sổ
// Tạm dừng (Esc / mất focus — trạng thái do GardenScene giữ), gợi ý phím góc dưới phải theo GDD §11.
// Các task sau (tiền T-006) sẽ thêm vào đây.
import Phaser from 'phaser';
import { gameConfig } from '../config/gameConfig';
import { cssColor, palette } from '../config/palette';
import { textStyles, uiFontFamily } from '../config/theme';
import type { ItemStack } from '../systems/inventory';
import { itemInfo } from '../systems/items';
import { staminaBand, staminaLabel, staminaRatio, type StaminaBand } from '../systems/stamina';
import {
  BAG_WINDOW,
  bagButtonRect,
  bagPanelRect,
  bagSlotRect,
  CLOCK_PANEL,
  clockPanelRect,
  hotbarRect,
  hotbarSlotRect,
  KEY_HINT,
  keyHintMainBottom,
  pausePanelRect,
  pauseResumeButtonRect,
  staminaFillRect,
  staminaPanelRect,
  type Rect,
} from '../ui/hudLayout';
import { blinkOn, dayLabel, formatClock, isPassOutWarning, skyPhase } from '../systems/time';
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
  /** Thanh Sức (T-004): chữ "64/100", dải màu, màu ruột đang tô (0xRRGGBB), tỷ lệ ruột đang vẽ. */
  staminaText: string;
  staminaBand: StaminaBand;
  staminaFillColor: number;
  staminaFillRatio: number;
  /** Độ đục viền màn tối (đuối) đang hiện (0 = tắt). */
  vignetteAlpha: number;
  /** Số lần ô hotbar nảy vì ăn (chuột phải) + ô nảy lần gần nhất. */
  eatBounces: number;
  lastEatSlot: number;
  /** Đồng hồ (T-005): chữ giờ, dòng ngày, màu chữ giờ đang hiện (CSS), có đang cảnh báo 23h, icon đang vẽ. */
  clockText: string;
  dayText: string;
  clockColor: string;
  clockWarn: boolean;
  clockIcon: 'sun' | 'moon';
  /** Khung đồng hồ (toạ độ màn 1920×1080) — QA kiểm không đè thanh Sức / hotbar. */
  clockBounds: Rect;
  /** Cửa sổ Tạm dừng đang hiện; nút "Tiếp tục" đang sáng (con trỏ trên nút). */
  pauseVisible: boolean;
  pauseButtonHover: boolean;
  /** Gợi ý phím: các dòng đang hiện (dòng chính trước) + khung bao từng khối chữ. */
  hintLines: string[];
  hintBounds: Rect[];
  /** Khung các thành phần HUD cố định (QA kiểm không đè nhau). */
  hudRects: { stamina: Rect; hotbar: Rect; bagButton: Rect; clock: Rect };
}

/** Màu ruột thanh Sức theo dải (palette Art Bible). */
const STAMINA_COLORS: Readonly<Record<StaminaBand, number>> = { green: palette.sprout, yellow: palette.gold, red: palette.vermilion };
/** Texture viền màn tối (vẽ một lần, độ phân giải thấp rồi phóng — gradient mượt nên không vỡ). */
const VIGNETTE_TEX = 'fx-vignette';
const VIGNETTE_TEX_SIZE = { w: 480, h: 270 } as const;

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

/** Gợi ý phím (GDD §11). Dòng chính dài nằm trên nút gùi; dòng ngắn ở khe bên phải nút gùi. */
const HINT_MAIN = 'WASD đi · Click làm · 1–9 chọn · E Gùi · Esc Menu';
const HINT_SIDE = ['Chuột phải: ăn món đang chọn'];
const HINT_DEV = ['Phím thử: G qua đêm', 'F8 −20 Sức · F9 +1 giờ'];

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
  // ---- Thanh Sức + viền đuối (T-004) ----
  private staminaFill!: Phaser.GameObjects.Graphics;
  private staminaText!: Phaser.GameObjects.Text;
  /** Sức + dải màu lần vẽ trước — chỉ vẽ lại khi đổi. */
  private staminaDrawn = -1;
  private staminaDrawnBand: StaminaBand = 'green';
  private vignette!: Phaser.GameObjects.Image;
  /** 0 → 1: mức hiện của viền đuối (tăng/giảm dần trong exhaustedVignetteFadeSeconds). */
  private vignetteLevel = 0;
  private eatBounces = 0;
  private lastEatSlot = -1;
  // ---- Đồng hồ + Tạm dừng (T-005) ----
  private clockText!: Phaser.GameObjects.Text;
  private dayText!: Phaser.GameObjects.Text;
  private clockIcon!: Phaser.GameObjects.Graphics;
  private clockIconDrawn: 'sun' | 'moon' | null = null;
  private clockColor = cssColor('paper');
  private clockWarn = false;
  /** Đồng hồ riêng của HUD cho nhịp nhấp nháy (giây). */
  private blinkT = 0;
  private pauseWindow!: Phaser.GameObjects.Container;
  private pauseButton!: Phaser.GameObjects.Graphics;
  private pauseButtonHover: boolean | null = null;
  private hintMain!: Phaser.GameObjects.Text;
  private hintSide!: Phaser.GameObjects.Text;

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
    this.staminaDrawn = -1;
    this.vignetteLevel = 0;
    this.clockIconDrawn = null;
    this.pauseButtonHover = null;
    this.blinkT = 0;

    // Viền màn tối khi đuối: vẽ trước tiên để mọi thứ HUD khác nằm đè lên.
    this.buildVignette();
    this.buildStaminaBar();
    this.buildClock();

    // Góc dưới phải: gợi ý phím (GDD §11). Dòng chính dài → đặt ngay TRÊN nút gùi (khe bên phải nút gùi chỉ ~340px);
    // dòng ngắn (chuột phải ăn, phím thử ở bản dev) nằm ở khe đó. Không đè hotbar / nút gùi.
    // BUG-015: chữ thân ≥ 24px ở 1080p (GDD §11).
    const hintStyle = { ...textStyles.body, fontSize: '24px', strokeThickness: 5, align: 'right' } as const;
    this.hintMain = this.add.text(w - KEY_HINT.margin, keyHintMainBottom(), HINT_MAIN, hintStyle).setOrigin(1, 1);
    const side = gameConfig.devCheatsEnabled ? [...HINT_SIDE, ...HINT_DEV] : HINT_SIDE;
    this.hintSide = this.add.text(w - KEY_HINT.margin, h - KEY_HINT.bottom, side.join('\n'), hintStyle).setOrigin(1, 1);

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
    this.buildPauseWindow();

    for (let i = 0; i < FLY_POOL; i++) {
      this.flyers.push({ g: this.add.graphics().setVisible(false).setDepth(100), t: 0, fromX: 0, fromY: 0, target: -1 });
    }

    const onGained = (e: ItemGainedEvent) => this.spawnFlyer(e);
    // Ăn (chuột phải): ô hotbar vừa bớt 1 món nảy một nhịp.
    const onEaten = (e: { slot: number }) => {
      if (e.slot < 0 || e.slot >= this.bounceT.length) return;
      this.bounceT[e.slot] = gameConfig.hotbarBounceSeconds;
      this.eatBounces++;
      this.lastEatSlot = e.slot;
    };
    this.garden.events.on('item-gained', onGained);
    this.garden.events.on('item-eaten', onEaten);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.garden.events.off('item-gained', onGained);
      this.garden.events.off('item-eaten', onEaten);
    });
  }

  /** Đồng hồ góc trên phải: khung mực + nền nâu đất, dòng "Ngày 1 · Mùa nắng", icon mặt trời/trăng, chữ giờ to. */
  private buildClock(): void {
    const p = clockPanelRect();
    const bg = this.add.graphics();
    bg.fillStyle(palette.ink, 0.92).fillRoundedRect(p.x - 3, p.y - 3, p.w + 6, p.h + 6, 14);
    bg.fillStyle(palette.earth, 1).fillRoundedRect(p.x, p.y, p.w, p.h, 12);
    // Vạch ngăn mảnh giữa dòng ngày và dòng giờ.
    bg.lineStyle(2, palette.wood, 0.8).lineBetween(p.x + 18, p.y + 50, p.x + p.w - 18, p.y + 50);
    this.dayText = this.add
      .text(p.x + p.w / 2, p.y + 26, '', { ...textStyles.nameTag, fontSize: '24px', strokeThickness: 5 })
      .setOrigin(0.5);
    const rowY = p.y + 50 + (p.h - 50) / 2;
    this.clockIcon = this.add.graphics().setPosition(p.x + 26 + CLOCK_PANEL.icon / 2, rowY);
    this.clockText = this.add
      .text(p.x + 40 + CLOCK_PANEL.icon, rowY, '', {
        fontFamily: uiFontFamily,
        fontSize: '50px',
        fontStyle: 'bold',
        color: cssColor('paper'),
        stroke: cssColor('ink'),
        strokeThickness: 8,
      })
      .setOrigin(0, 0.5);
  }

  /** Icon mặt trời (vàng hoa hòe, tia nắng) hoặc trăng khuyết (trắng điệp) — chỉ vẽ lại khi đổi. */
  private drawClockIcon(kind: 'sun' | 'moon'): void {
    if (kind === this.clockIconDrawn) return;
    this.clockIconDrawn = kind;
    const g = this.clockIcon;
    const r = CLOCK_PANEL.icon / 2;
    g.clear();
    if (kind === 'sun') {
      const core = r * 0.55;
      g.lineStyle(6, palette.ink, 1);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        g.lineBetween(Math.cos(a) * (core + 4), Math.sin(a) * (core + 4), Math.cos(a) * r, Math.sin(a) * r);
      }
      g.lineStyle(3, palette.gold, 1);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        g.lineBetween(Math.cos(a) * (core + 5), Math.sin(a) * (core + 5), Math.cos(a) * (r - 1), Math.sin(a) * (r - 1));
      }
      g.fillStyle(palette.ink, 1).fillCircle(0, 0, core + 3);
      g.fillStyle(palette.gold, 1).fillCircle(0, 0, core);
    } else {
      // Trăng khuyết: đĩa trắng điệp rồi "khoét" bằng một đĩa màu nền lệch sang phải-trên.
      const mr = r * 0.78;
      g.fillStyle(palette.ink, 1).fillCircle(0, 0, mr + 3);
      g.fillStyle(palette.paper, 1).fillCircle(0, 0, mr);
      g.fillStyle(palette.earth, 1).fillCircle(mr * 0.55, -mr * 0.35, mr * 0.85);
    }
  }

  /** Cập nhật đồng hồ mỗi frame: chữ giờ / dòng ngày chỉ đặt lại khi đổi; từ 23h chữ giờ nháy đỏ son ↔ trắng điệp. */
  private updateClock(dt: number): void {
    const hour = this.garden.clockHour;
    const text = formatClock(hour);
    if (this.clockText.text !== text) this.clockText.setText(text);
    const day = dayLabel(this.garden.dayClock.day, gameConfig.daysPerSeason);
    if (this.dayText.text !== day) this.dayText.setText(day);
    this.drawClockIcon(skyPhase(hour, gameConfig.skyPhaseStarts) === 'night' ? 'moon' : 'sun');
    this.clockWarn = isPassOutWarning(hour, gameConfig);
    this.blinkT = this.clockWarn ? this.blinkT + dt : 0;
    const color = this.clockWarn && blinkOn(this.blinkT, gameConfig.clockBlinkRate) ? cssColor('vermilion') : cssColor('paper');
    if (color !== this.clockColor) {
      this.clockColor = color;
      this.clockText.setColor(color);
    }
  }

  /** Cửa sổ Tạm dừng: nền tối mờ phủ cả màn (kể cả HUD), khung giữa màn, "Đã tạm dừng", nút "Tiếp tục", "Esc: chơi tiếp". */
  private buildPauseWindow(): void {
    const { gameWidth: w, gameHeight: h } = gameConfig;
    const p = pausePanelRect();
    const b = pauseResumeButtonRect();
    const g = this.add.graphics();
    g.fillStyle(palette.ink, 1).fillRoundedRect(p.x - 5, p.y - 5, p.w + 10, p.h + 10, 22);
    g.fillStyle(palette.earth, 1).fillRoundedRect(p.x, p.y, p.w, p.h, 18);
    this.pauseButton = this.add.graphics();
    this.pauseWindow = this.add
      .container(0, 0, [
        this.add.rectangle(0, 0, w, h, palette.ink, 0.6).setOrigin(0),
        g,
        this.add.text(p.x + p.w / 2, p.y + 78, 'Đã tạm dừng', { ...textStyles.subtitle, fontSize: '52px' }).setOrigin(0.5),
        this.add
          .text(p.x + p.w / 2, p.y + 134, 'Đồng hồ ngày đang đứng yên', { ...textStyles.body, fontSize: '24px', strokeThickness: 5 })
          .setOrigin(0.5),
        this.pauseButton,
        this.add.text(b.x + b.w / 2, b.y + b.h / 2, 'Tiếp tục', { ...textStyles.nameTag, fontSize: '34px', color: cssColor('ink'), strokeThickness: 0 }).setOrigin(0.5),
        this.add
          .text(p.x + p.w / 2, p.y + p.h - 30, 'Esc: chơi tiếp', { ...textStyles.body, fontSize: '24px', strokeThickness: 5 })
          .setOrigin(0.5),
      ])
      .setDepth(90)
      .setVisible(false);
  }

  /** Nút "Tiếp tục": nền gỗ, rê chuột vào thì sáng vàng (GDD §11: mọi nút có trạng thái hover). Chỉ vẽ lại khi đổi. */
  private updatePauseWindow(): void {
    const open = this.garden.pauseMenuOpen;
    this.pauseWindow.setVisible(open);
    if (!open) {
      this.pauseButtonHover = null; // mở lại thì vẽ nút từ đầu
      return;
    }
    const hover = this.garden.pauseHoverResume;
    if (hover === this.pauseButtonHover) return;
    this.pauseButtonHover = hover;
    const b = pauseResumeButtonRect();
    const g = this.pauseButton;
    g.clear();
    g.fillStyle(palette.ink, 1).fillRoundedRect(b.x - 4, b.y - 4, b.w + 8, b.h + 8, 16);
    g.fillStyle(hover ? palette.gold : palette.wood, 1).fillRoundedRect(b.x, b.y, b.w, b.h, 13);
    g.fillStyle(palette.paper, hover ? 0.35 : 0.2).fillRoundedRect(b.x + 6, b.y + 6, b.w - 12, 10, 5);
  }

  /** Thanh Sức góc trên trái: nhãn "Sức", khung mực, ruột tô màu theo tỷ lệ, chữ "64/100" giữa thanh. */
  private buildStaminaBar(): void {
    const p = staminaPanelRect();
    const f = staminaFillRect();
    const bg = this.add.graphics();
    bg.fillStyle(palette.ink, 0.92).fillRoundedRect(p.x - 3, p.y - 3, p.w + 6, p.h + 6, 14);
    bg.fillStyle(palette.earth, 1).fillRoundedRect(p.x, p.y, p.w, p.h, 12);
    // Rãnh tối dưới ruột thanh (phần Sức đã mất).
    bg.fillStyle(palette.ink, 0.75).fillRoundedRect(f.x, f.y, f.w, f.h, 8);
    this.add
      .text(p.x + (f.x - p.x) / 2 + 2, p.y + p.h / 2, 'Sức', { ...textStyles.nameTag, fontSize: '24px', strokeThickness: 5 })
      .setOrigin(0.5);
    this.staminaFill = this.add.graphics();
    this.staminaText = this.add
      .text(f.x + f.w / 2, f.y + f.h / 2, '', { fontFamily: uiFontFamily, fontSize: '26px', fontStyle: 'bold', color: cssColor('paper'), stroke: cssColor('ink'), strokeThickness: 6 })
      .setOrigin(0.5);
  }

  /** Vẽ lại ruột thanh + chữ khi Sức đổi (không vẽ Graphics mỗi frame). */
  private updateStaminaBar(): void {
    const s = this.garden.stamina;
    if (s.current === this.staminaDrawn) return;
    this.staminaDrawn = s.current;
    const ratio = staminaRatio(s);
    const band = staminaBand(ratio, gameConfig.staminaBarYellowBelow, gameConfig.staminaBarRedBelow);
    this.staminaDrawnBand = band;
    const f = staminaFillRect();
    const g = this.staminaFill;
    g.clear();
    const w = Math.round(f.w * Math.min(1, Math.max(0, ratio)));
    if (w > 0) {
      g.fillStyle(STAMINA_COLORS[band], 1).fillRoundedRect(f.x, f.y, w, f.h, Math.min(8, w / 2));
      // Vệt sáng trên mép ruột cho có khối.
      g.fillStyle(palette.paper, 0.25).fillRect(f.x + 4, f.y + 4, Math.max(0, w - 8), 5);
    }
    this.staminaText.setText(staminaLabel(s));
  }

  /** Texture gradient tối dần ra mép màn (mực, không đen thuần) — tạo một lần cho cả game. */
  private buildVignette(): void {
    const { gameWidth: w, gameHeight: h } = gameConfig;
    if (!this.textures.exists(VIGNETTE_TEX)) {
      const { w: tw, h: th } = VIGNETTE_TEX_SIZE;
      const tex = this.textures.createCanvas(VIGNETTE_TEX, tw, th);
      const ctx = tex?.getContext();
      if (tex && ctx) {
        // Elip theo tỷ lệ màn: giữa trong suốt, mép mực đậm dần.
        ctx.save();
        ctx.translate(tw / 2, th / 2);
        ctx.scale(1, th / tw);
        const r = tw * 0.62;
        const grad = ctx.createRadialGradient(0, 0, r * 0.45, 0, 0, r);
        grad.addColorStop(0, 'rgba(46,33,24,0)');
        grad.addColorStop(0.6, 'rgba(46,33,24,0.55)');
        grad.addColorStop(1, 'rgba(46,33,24,1)');
        ctx.fillStyle = grad;
        ctx.fillRect(-tw, -tw, tw * 2, tw * 2);
        ctx.restore();
        tex.refresh();
      }
    }
    this.vignette = this.add.image(0, 0, VIGNETTE_TEX).setOrigin(0).setDisplaySize(w, h).setAlpha(0).setVisible(false);
  }

  /** Viền màn tối hiện / tắt dần theo trạng thái đuối. */
  private updateVignette(dt: number): void {
    const target = this.garden.stamina.exhausted ? 1 : 0;
    const step = dt / Math.max(0.01, gameConfig.exhaustedVignetteFadeSeconds);
    this.vignetteLevel = target > this.vignetteLevel ? Math.min(target, this.vignetteLevel + step) : Math.max(target, this.vignetteLevel - step);
    const alpha = this.vignetteLevel * gameConfig.exhaustedVignetteAlpha;
    this.vignette.setAlpha(alpha).setVisible(alpha > 0);
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
    this.updateStaminaBar();
    this.updateClock(dt);
    this.updatePauseWindow();
    this.updateVignette(dt);
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
      staminaText: this.staminaText?.text ?? '',
      staminaBand: this.staminaDrawnBand,
      staminaFillColor: STAMINA_COLORS[this.staminaDrawnBand],
      staminaFillRatio: this.staminaDrawn < 0 ? 0 : this.staminaDrawn / this.garden.stamina.max,
      vignetteAlpha: this.vignette?.visible ? this.vignette.alpha : 0,
      eatBounces: this.eatBounces,
      lastEatSlot: this.lastEatSlot,
      clockText: this.clockText?.text ?? '',
      dayText: this.dayText?.text ?? '',
      clockColor: this.clockColor,
      clockWarn: this.clockWarn,
      clockIcon: this.clockIconDrawn ?? 'sun',
      clockBounds: clockPanelRect(),
      pauseVisible: this.pauseWindow?.visible ?? false,
      pauseButtonHover: this.pauseButtonHover === true,
      hintLines: [this.hintMain, this.hintSide].flatMap((t) => (t ? t.text.split('\n') : [])),
      hintBounds: [this.hintMain, this.hintSide].flatMap((t) => {
        if (!t) return [];
        const r = t.getBounds();
        return [{ x: r.x, y: r.y, w: r.width, h: r.height }];
      }),
      hudRects: { stamina: staminaPanelRect(), hotbar: hotbarRect(), bagButton: bagButtonRect(), clock: clockPanelRect() },
    };
  }
}
