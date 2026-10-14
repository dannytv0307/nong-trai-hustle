// HUD của Vườn: scene chạy song song, vẽ đè lên GardenScene. Tách riêng vì camera Vườn
// được phóng to (cameraZoom) — chữ UI để ở scene này thì không bị phóng/nhòe theo.
// T-003: hotbar 9 ô giữa dưới màn (ô chọn viền vàng, số lượng ở góc), nút "Gùi", cửa sổ gùi (E) 2 × 9 có tên món
// khi rê chuột, icon đồ hái bay vào ô + ô nảy. Scene này CHỈ VẼ: gùi, ô chọn, cửa sổ mở/đóng, ô dưới con trỏ
// đều do GardenScene giữ (qua InputController) — HUD đọc mỗi frame, chỉ vẽ lại khi `inventoryRevision` đổi.
// T-004: thanh Sức góc trên trái (xanh lá → vàng < 50% → đỏ < 20%), viền màn tối khi đuối, ô hotbar nảy khi ăn.
// T-005: đồng hồ góc trên phải ("Ngày 1 · Mùa nắng", "14:30", icon mặt trời/trăng, nhấp nháy đỏ từ 23h), cửa sổ
// Tạm dừng (Esc / mất focus — trạng thái do GardenScene giữ), gợi ý phím góc dưới phải theo GDD §11.
// T-006: ô tiền dưới thanh Sức (icon xu + "60 quan", chữ bay "−4 quan" khi tiêu), cửa sổ thùng bán (gùi ↔ thùng, dòng
// "Cuối ngày bán được: N quan") và cửa sổ sạp hạt (nút mua, xám khi thiếu tiền). Trạng thái do GardenScene giữ.
// T-007: hộp hỏi "Đi ngủ?" (Có/Không), lớp tối khi ngủ / ngủ gục / thức dậy, chữ "Zzz" trên đầu nhân vật, màn tổng kết ngày
// (các dòng trượt vào, số tiền đếm lên, nút "Ngày mới"). Trạng thái + nhịp do GardenScene giữ — HUD chỉ vẽ.
import Phaser from 'phaser';
import { gameConfig } from '../config/gameConfig';
import { cssColor, palette } from '../config/palette';
import { textStyles, uiFontFamily } from '../config/theme';
import type { ItemStack } from '../systems/inventory';
import { itemInfo, seedItemId } from '../systems/items';
import { hasMoney, seedPriceOf, sellBoxTotal } from '../systems/economy';
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
  MONEY_PANEL,
  moneyPanelRect,
  SELL_WINDOW,
  sellGridOrigin,
  sellGridsBottom,
  sellPanelRect,
  sellSlotRect,
  stallButtonRect,
  stallPanelRect,
  STALL_WINDOW,
  PAUSE_WINDOW,
  pausePanelRect,
  pauseRestartButtonRect,
  pauseResumeButtonRect,
  restartConfirmButtonRect,
  restartConfirmRect,
  sleepButtonRect,
  sleepPromptRect,
  summaryButtonRect,
  summaryDetailY,
  summaryLineY,
  summaryPanelRect,
  SUMMARY_WINDOW,
  staminaFillRect,
  staminaPanelRect,
  type Rect,
} from '../ui/hudLayout';
import { blinkOn, dayLabel, formatClock, isPassOutWarning, skyPhase } from '../systems/time';
import { lineProgress, moneyLineText, moneyShown, summarySubtitle, summaryTitle } from '../systems/daySummary';
import { drawItemIcon, itemIconTexture, mixColor, showsItemCount } from '../ui/itemArt';
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
  /** T-009: texture ảnh icon đang hiện ở từng ô hotbar (null = icon vẽ bằng code / ô trống) — vd 'item-hoe'. */
  hotbarImages: (string | null)[];
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
  /** T-008: dòng "Đã lưu lúc…" đang hiện, nút "Chơi lại từ đầu" đang sáng, hộp xác nhận đang hiện. */
  pauseSavedText: string;
  pauseRestartHover: boolean;
  restartConfirmVisible: boolean;
  /** Gợi ý phím: các dòng đang hiện (dòng chính trước) + khung bao từng khối chữ. */
  hintLines: string[];
  hintBounds: Rect[];
  /** Khung các thành phần HUD cố định (QA kiểm không đè nhau). */
  hudRects: { stamina: Rect; hotbar: Rect; bagButton: Rect; clock: Rect; money: Rect };
  /** T-006: chữ ô tiền ("60 quan"), chữ bay đang hiện ('' = không). */
  moneyText: string;
  moneyFloat: string;
  /** Cửa sổ thùng bán / sạp hạt đang hiện. */
  sellBoxVisible: boolean;
  seedStallVisible: boolean;
  /** Dòng "Cuối ngày bán được: 30 quan", dòng báo chân cửa sổ, chữ số lượng trên ô thùng ('' = trống). */
  sellTotalText: string;
  shopStatusText: string;
  sellBoxCounts: string[];
  /** Nút sạp hạt: chữ trên nút, có bấm được không (đủ tiền), đang sáng (hover). */
  stallButtons: { text: string; enabled: boolean; hover: boolean }[];
  /** Cỡ chữ NHỎ NHẤT (px) trong cửa sổ đang mở (thùng bán / sạp hạt) — GDD §11: chữ ≥ 24px. 0 = không mở cửa sổ nào. */
  shopMinFontPx: number;
  /** T-007: hộp hỏi "Đi ngủ?" đang hiện; nút đang sáng. */
  sleepPromptVisible: boolean;
  sleepPromptHover: 'yes' | 'no' | null;
  /** Lớp tối (ngủ / ngủ gục / thức dậy): độ đục đang vẽ (0 = tắt). */
  nightOverlayAlpha: number;
  /** Số chữ "Z" đang hiện trên đầu nhân vật. */
  zzzVisible: number;
  /** Màn tổng kết đang hiện; tiêu đề, dòng phụ, các dòng đang hiện (chữ + độ đục + lệch ngang so với chỗ nằm yên), nút. */
  summaryVisible: boolean;
  summaryTitle: string;
  summarySubtitle: string;
  summaryLines: { text: string; alpha: number; offsetX: number }[];
  summaryDetail: string;
  summaryButtonText: string;
  summaryButtonHover: boolean;
  /** Cỡ chữ nhỏ nhất (px) trên màn tổng kết / hộp hỏi ngủ đang hiện (0 = không hiện). */
  nightMinFontPx: number;
}

/** Màu ruột thanh Sức theo dải (palette Art Bible). */
const STAMINA_COLORS: Readonly<Record<StaminaBand, number>> = { green: palette.sprout, yellow: palette.gold, red: palette.vermilion };
/** Texture viền màn tối (vẽ một lần, độ phân giải thấp rồi phóng — gradient mượt nên không vỡ). */
const VIGNETTE_TEX = 'fx-vignette';
const VIGNETTE_TEX_SIZE = { w: 480, h: 270 } as const;

/** Tên object của số phím góc ô (1–9) — nhãn phụ, QA bỏ qua khi đo cỡ chữ nhỏ nhất. */
const SLOT_KEY_LABEL = 'slot-key-label';

/** Một ô vẽ (hotbar hoặc cửa sổ gùi): khung, icon, số lượng, số phím. */
interface SlotView {
  root: Phaser.GameObjects.Container;
  icon: Phaser.GameObjects.Graphics;
  /** Icon ảnh thật (T-009: cái cuốc) — ẩn khi món vẽ bằng code. */
  image: Phaser.GameObjects.Image;
  count: Phaser.GameObjects.Text;
  size: number;
}

/** Icon đang bay: từ toạ độ màn (ô ruộng) tới ô hotbar / nút gùi. */
interface Flyer {
  g: Phaser.GameObjects.Graphics;
  /** T-022: icon ảnh thật (ẩn khi món vẽ bằng code). */
  img: Phaser.GameObjects.Image;
  /** Tỷ lệ gốc của ảnh để ra cỡ hiện (0 = đang dùng Graphics). */
  imgBase: number;
  t: number;
  fromX: number;
  fromY: number;
  /** Ô hotbar đích (≥ 0) hoặc -1 = nút gùi. */
  target: number;
}

/** Cửa sổ 2 lưới gùi ⇄ thùng bán / rương (T-093): các phần cần cập nhật mỗi frame. */
interface TransferView {
  kind: 'sellBox' | 'chest';
  win: Phaser.GameObjects.Container;
  bag: SlotView[];
  box: SlotView[];
  hover: Phaser.GameObjects.Graphics;
  total: Phaser.GameObjects.Text;
  status: Phaser.GameObjects.Text;
}

/** T-093: tâm dọc (px màn) của tên khu khi vừa vào. */
const AREA_BANNER_Y = 150;

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
/** T-006: dòng thứ hai của khối gợi ý chính (phím mới F, Shift). */
const HINT_MAIN_2 = 'F dùng thùng / sạp / rương · Shift+click: cả chồng';
const HINT_SIDE = ['Chuột phải: ăn món đang chọn'];
const HINT_DEV = ['Phím thử: G qua đêm', 'F8 −20 Sức · F9 +1 giờ'];

const FLY_POOL = gameConfig.actionQueueMax + 2;
/** T-022: cỡ hiện (px màn) của icon ảnh 128×128 (có đệm 6 px) ở nút sạp hạt và icon bay — ngang cỡ icon vẽ bằng code. */
const ICON_IMAGE_SIZE = { stall: 80, flyer: 72 } as const;
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
  // T-008: dòng "Đã lưu lúc…", nút "Chơi lại từ đầu", hộp xác nhận.
  private pauseSavedText!: Phaser.GameObjects.Text;
  private pauseRestartButton!: Phaser.GameObjects.Graphics;
  private pauseRestartHover: boolean | null = null;
  private restartConfirm!: Phaser.GameObjects.Container;
  private restartYesBg!: Phaser.GameObjects.Graphics;
  private restartNoBg!: Phaser.GameObjects.Graphics;
  private restartHoverDrawn: string | null = null;
  private hintMain!: Phaser.GameObjects.Text;
  private hintSide!: Phaser.GameObjects.Text;
  // ---- Tiền, thùng bán, sạp hạt (T-006) ----
  private moneyText!: Phaser.GameObjects.Text;
  private moneyFloat!: Phaser.GameObjects.Text;
  private moneyFloatT = 0;
  private moneyDrawn = -1;
  private sellWindow!: Phaser.GameObjects.Container;
  private readonly sellBagSlots: SlotView[] = [];
  private readonly sellBoxSlots: SlotView[] = [];
  private sellTotalText!: Phaser.GameObjects.Text;
  private sellStatusText!: Phaser.GameObjects.Text;
  private sellView!: TransferView;
  /** T-093: cửa sổ rương (cùng bố cục với thùng bán) + tên khu khi vừa vào. */
  private chestView!: TransferView;
  private areaBanner!: Phaser.GameObjects.Text;
  private stallWindow!: Phaser.GameObjects.Container;
  private stallMoneyText!: Phaser.GameObjects.Text;
  private stallStatusText!: Phaser.GameObjects.Text;
  private readonly stallButtons: { bg: Phaser.GameObjects.Graphics; label: Phaser.GameObjects.Text; owned: Phaser.GameObjects.Text }[] = [];
  /** "Chữ ký" lần vẽ nút sạp gần nhất (tiền, hover, gùi) — chỉ vẽ lại khi đổi. */
  private stallDrawnSig = '';
  // ---- Ngủ, ngủ gục, tổng kết (T-007) ----
  private nightOverlay!: Phaser.GameObjects.Rectangle;
  private readonly zzz: Phaser.GameObjects.Text[] = [];
  private zzzT = 0;
  private sleepPrompt!: Phaser.GameObjects.Container;
  private sleepYesBg!: Phaser.GameObjects.Graphics;
  private sleepNoBg!: Phaser.GameObjects.Graphics;
  private sleepHoverDrawn: string | null = null;
  private summaryWindow!: Phaser.GameObjects.Container;
  private summaryTitleText!: Phaser.GameObjects.Text;
  private summarySubText!: Phaser.GameObjects.Text;
  private summaryDetailText!: Phaser.GameObjects.Text;
  private readonly summaryLineTexts: Phaser.GameObjects.Text[] = [];
  private summaryButtonBg!: Phaser.GameObjects.Graphics;
  private summaryButtonLabel!: Phaser.GameObjects.Text;
  private summaryButtonHoverDrawn: boolean | null = null;
  /** Kết quả đêm đang hiện trên màn tổng kết (đổi → đặt lại chữ). */
  private summaryShownFor: unknown = null;

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
    this.pauseRestartHover = null;
    this.restartHoverDrawn = null;
    this.blinkT = 0;
    this.moneyDrawn = -1;
    this.moneyFloatT = 0;
    this.sellBagSlots.length = 0;
    this.sellBoxSlots.length = 0;
    this.stallButtons.length = 0;
    this.stallDrawnSig = '';
    this.zzz.length = 0;
    this.zzzT = 0;
    this.summaryLineTexts.length = 0;
    this.sleepHoverDrawn = null;
    this.summaryButtonHoverDrawn = null;
    this.summaryShownFor = null;

    // Viền màn tối khi đuối: vẽ trước tiên để mọi thứ HUD khác nằm đè lên.
    this.buildVignette();
    this.buildStaminaBar();
    this.buildMoney();
    this.buildClock();

    // Góc dưới phải: gợi ý phím (GDD §11). Dòng chính dài → đặt ngay TRÊN nút gùi (khe bên phải nút gùi chỉ ~340px);
    // dòng ngắn (chuột phải ăn, phím thử ở bản dev) nằm ở khe đó. Không đè hotbar / nút gùi.
    // BUG-015: chữ thân ≥ 24px ở 1080p (GDD §11).
    const hintStyle = { ...textStyles.body, fontSize: '24px', strokeThickness: 5, align: 'right' } as const;
    this.hintMain = this.add.text(w - KEY_HINT.margin, keyHintMainBottom(), `${HINT_MAIN}\n${HINT_MAIN_2}`, hintStyle).setOrigin(1, 1);
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
    this.buildSellWindow();
    this.chestView = this.buildTransferWindow('chest');
    this.buildStallWindow();
    // T-093: tên khu khi vừa vào (giữa trên màn — trống giữa thanh Sức và đồng hồ).
    this.areaBanner = this.add
      .text(w / 2, AREA_BANNER_Y, '', { ...textStyles.subtitle, fontSize: '44px', strokeThickness: 8 })
      .setOrigin(0.5)
      .setDepth(40)
      .setVisible(false);
    this.buildPauseWindow();
    this.buildNight();

    for (let i = 0; i < FLY_POOL; i++) {
      this.flyers.push({
        g: this.add.graphics().setVisible(false).setDepth(100),
        img: this.add.image(0, 0, '__DEFAULT').setVisible(false).setDepth(100),
        imgBase: 0,
        t: 0,
        fromX: 0,
        fromY: 0,
        target: -1,
      });
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

  /**
   * Cửa sổ Tạm dừng: nền tối mờ phủ cả màn (kể cả HUD), khung giữa màn, "Đã tạm dừng", dòng "Đã lưu lúc 14:30 · Ngày 2"
   * (T-008), nút "Tiếp tục", nút "Chơi lại từ đầu" (T-008, nền đất nhạt hơn — việc phụ), "Esc: chơi tiếp".
   * Hộp xác nhận "Chơi lại từ đầu?" nằm TRÊN cửa sổ Tạm dừng (depth cao hơn), 2 nút Có / Không.
   */
  private buildPauseWindow(): void {
    const { gameWidth: w, gameHeight: h } = gameConfig;
    const p = pausePanelRect();
    const b = pauseResumeButtonRect();
    const rb = pauseRestartButtonRect();
    const g = this.add.graphics();
    g.fillStyle(palette.ink, 1).fillRoundedRect(p.x - 5, p.y - 5, p.w + 10, p.h + 10, 22);
    g.fillStyle(palette.earth, 1).fillRoundedRect(p.x, p.y, p.w, p.h, 18);
    this.pauseButton = this.add.graphics();
    this.pauseRestartButton = this.add.graphics();
    const bodyStyle = { ...textStyles.body, fontSize: '24px', strokeThickness: 5 };
    this.pauseSavedText = this.add.text(p.x + p.w / 2, p.y + PAUSE_WINDOW.savedLineY, '', { ...bodyStyle, color: cssColor('gold') }).setOrigin(0.5);
    this.pauseWindow = this.add
      .container(0, 0, [
        this.add.rectangle(0, 0, w, h, palette.ink, 0.6).setOrigin(0),
        g,
        this.add.text(p.x + p.w / 2, p.y + PAUSE_WINDOW.titleY, 'Đã tạm dừng', { ...textStyles.subtitle, fontSize: '52px' }).setOrigin(0.5),
        this.add.text(p.x + p.w / 2, p.y + PAUSE_WINDOW.subY, 'Đồng hồ ngày đang đứng yên', bodyStyle).setOrigin(0.5),
        this.pauseSavedText,
        this.pauseButton,
        this.add.text(b.x + b.w / 2, b.y + b.h / 2, 'Tiếp tục', { ...textStyles.nameTag, fontSize: '34px', color: cssColor('ink'), strokeThickness: 0 }).setOrigin(0.5),
        this.pauseRestartButton,
        this.add.text(rb.x + rb.w / 2, rb.y + rb.h / 2, 'Chơi lại từ đầu', { ...textStyles.nameTag, fontSize: '28px', strokeThickness: 5 }).setOrigin(0.5),
        this.add.text(p.x + p.w / 2, p.y + p.h - 34, 'Esc: chơi tiếp', bodyStyle).setOrigin(0.5),
      ])
      .setDepth(90)
      .setVisible(false);

    // Hộp xác nhận chơi lại.
    const c = restartConfirmRect();
    const cg = this.add.graphics();
    cg.fillStyle(palette.ink, 1).fillRoundedRect(c.x - 6, c.y - 6, c.w + 12, c.h + 12, 24);
    cg.fillStyle(palette.earth, 1).fillRoundedRect(c.x, c.y, c.w, c.h, 20);
    cg.lineStyle(4, palette.vermilion, 0.9).strokeRoundedRect(c.x + 8, c.y + 8, c.w - 16, c.h - 16, 14);
    this.restartYesBg = this.add.graphics();
    this.restartNoBg = this.add.graphics();
    const yes = restartConfirmButtonRect('yes');
    const no = restartConfirmButtonRect('no');
    const btnStyle = { ...textStyles.nameTag, fontSize: '32px', color: cssColor('ink'), strokeThickness: 0 };
    this.restartConfirm = this.add
      .container(0, 0, [
        this.add.rectangle(0, 0, w, h, palette.ink, 0.35).setOrigin(0),
        cg,
        this.add.text(c.x + c.w / 2, c.y + 70, 'Chơi lại từ đầu?', { ...textStyles.subtitle, fontSize: '48px' }).setOrigin(0.5),
        this.add
          .text(c.x + c.w / 2, c.y + 150, 'Xóa bản lưu, quay về Ngày 1.\nKhông lấy lại được.', { ...bodyStyle, align: 'center', lineSpacing: 6 })
          .setOrigin(0.5),
        this.restartYesBg,
        this.restartNoBg,
        this.add.text(yes.x + yes.w / 2, yes.y + yes.h / 2, 'Có, xóa', btnStyle).setOrigin(0.5),
        this.add.text(no.x + no.w / 2, no.y + no.h / 2, 'Không (Esc)', btnStyle).setOrigin(0.5),
      ])
      .setDepth(95)
      .setVisible(false);
  }

  /** Nút "Tiếp tục" / "Chơi lại từ đầu": rê chuột vào thì sáng vàng (GDD §11: mọi nút có trạng thái hover). Chỉ vẽ lại khi đổi. */
  private updatePauseWindow(): void {
    const garden = this.garden;
    const open = garden.pauseMenuOpen;
    this.pauseWindow.setVisible(open);
    const confirm = open && garden.restartConfirmOpen;
    this.restartConfirm.setVisible(confirm);
    if (!open) {
      this.pauseButtonHover = null; // mở lại thì vẽ nút từ đầu
      this.pauseRestartHover = null;
      this.restartHoverDrawn = null;
      return;
    }
    const saved = garden.savedText;
    if (this.pauseSavedText.text !== saved) this.pauseSavedText.setText(saved);
    const hover = garden.pauseHoverResume;
    if (hover !== this.pauseButtonHover) {
      this.pauseButtonHover = hover;
      this.drawWoodButton(this.pauseButton, pauseResumeButtonRect(), hover);
    }
    const hoverRestart = garden.pauseHoverRestart;
    if (hoverRestart !== this.pauseRestartHover) {
      this.pauseRestartHover = hoverRestart;
      // Nút phụ: nền mực nhạt viền gỗ (khác nút chính), rê chuột → viền + chữ nền đỏ son nhạt cho biết là việc "xóa".
      const r = pauseRestartButtonRect();
      const g = this.pauseRestartButton;
      g.clear();
      g.fillStyle(palette.ink, 1).fillRoundedRect(r.x - 4, r.y - 4, r.w + 8, r.h + 8, 14);
      g.fillStyle(hoverRestart ? palette.vermilion : palette.earth, 1).fillRoundedRect(r.x, r.y, r.w, r.h, 11);
      g.lineStyle(3, palette.wood, 1).strokeRoundedRect(r.x + 3, r.y + 3, r.w - 6, r.h - 6, 9);
    }
    if (!confirm) {
      this.restartHoverDrawn = null;
      return;
    }
    const ch = String(garden.restartConfirmHover);
    if (ch !== this.restartHoverDrawn) {
      this.restartHoverDrawn = ch;
      this.drawWoodButton(this.restartYesBg, restartConfirmButtonRect('yes'), garden.restartConfirmHover === 'yes');
      this.drawWoodButton(this.restartNoBg, restartConfirmButtonRect('no'), garden.restartConfirmHover === 'no');
    }
  }

  // ---------------------------------------------------------------- ngủ, ngủ gục, tổng kết (T-007)

  /**
   * Dựng một lần: lớp tối phủ cả màn (kể cả HUD), 3 chữ "Z", hộp hỏi "Đi ngủ?", màn tổng kết. Lớp tối nằm dưới tổng kết và
   * cửa sổ Tạm dừng (mất focus lúc tổng kết thì Tạm dừng vẫn hiện trên cùng).
   */
  private buildNight(): void {
    const { gameWidth: w, gameHeight: h } = gameConfig;
    this.nightOverlay = this.add.rectangle(0, 0, w, h, palette.ink, 1).setOrigin(0).setDepth(80).setAlpha(0).setVisible(false);
    for (let i = 0; i < 3; i++) {
      this.zzz.push(
        this.add
          .text(0, 0, 'Z', { fontFamily: uiFontFamily, fontSize: '40px', fontStyle: 'bold', color: cssColor('paper'), stroke: cssColor('indigo'), strokeThickness: 7 })
          .setOrigin(0.5)
          .setDepth(82)
          .setVisible(false),
      );
    }

    // Hộp hỏi "Đi ngủ?" — nền tối mờ (thế giới vẫn thấy), khung giữa màn, 2 nút Có / Không.
    const p = sleepPromptRect();
    const g = this.add.graphics();
    g.fillStyle(palette.ink, 1).fillRoundedRect(p.x - 5, p.y - 5, p.w + 10, p.h + 10, 22);
    g.fillStyle(palette.earth, 1).fillRoundedRect(p.x, p.y, p.w, p.h, 18);
    this.sleepYesBg = this.add.graphics();
    this.sleepNoBg = this.add.graphics();
    const yes = sleepButtonRect('yes');
    const no = sleepButtonRect('no');
    const btnStyle = { ...textStyles.nameTag, fontSize: '32px', color: cssColor('ink'), strokeThickness: 0 };
    this.sleepPrompt = this.add
      .container(0, 0, [
        this.add.rectangle(0, 0, w, h, palette.ink, 0.45).setOrigin(0),
        g,
        this.add.text(p.x + p.w / 2, p.y + 66, 'Đi ngủ?', { ...textStyles.subtitle, fontSize: '52px' }).setOrigin(0.5),
        this.add
          .text(p.x + p.w / 2, p.y + 132, 'Ngủ tới sáng mai — thùng bán tự bán qua đêm.', { ...textStyles.body, fontSize: '24px', strokeThickness: 5 })
          .setOrigin(0.5),
        this.sleepYesBg,
        this.sleepNoBg,
        this.add.text(yes.x + yes.w / 2, yes.y + yes.h / 2, 'Có (Enter)', btnStyle).setOrigin(0.5),
        this.add.text(no.x + no.w / 2, no.y + no.h / 2, 'Không (Esc)', btnStyle).setOrigin(0.5),
      ])
      .setDepth(50)
      .setVisible(false);

    // Màn tổng kết ngày: khung giữa màn trên lớp tối, tiêu đề + dòng phụ, tối đa 6 dòng (dòng tiền to, vàng) + dòng chi tiết.
    const s = summaryPanelRect();
    const sg = this.add.graphics();
    sg.fillStyle(palette.ink, 1).fillRoundedRect(s.x - 6, s.y - 6, s.w + 12, s.h + 12, 26);
    sg.fillStyle(palette.earth, 1).fillRoundedRect(s.x, s.y, s.w, s.h, 22);
    sg.lineStyle(3, palette.wood, 0.9).lineBetween(s.x + SUMMARY_WINDOW.pad, s.y + 142, s.x + s.w - SUMMARY_WINDOW.pad, s.y + 142);
    this.summaryTitleText = this.add.text(s.x + s.w / 2, s.y + 58, '', { ...textStyles.subtitle, fontSize: '54px', color: cssColor('gold') }).setOrigin(0.5);
    this.summarySubText = this.add.text(s.x + s.w / 2, s.y + 114, '', { ...textStyles.body, fontSize: '26px', strokeThickness: 5 }).setOrigin(0.5);
    this.summaryDetailText = this.add
      .text(s.x + SUMMARY_WINDOW.pad + 4, summaryDetailY(), '', { ...textStyles.body, fontSize: '24px', strokeThickness: 5 })
      .setOrigin(0, 0.5);
    const parts: Phaser.GameObjects.GameObject[] = [sg, this.summaryTitleText, this.summarySubText, this.summaryDetailText];
    for (let i = 0; i < 6; i++) {
      const t = this.add
        .text(s.x + SUMMARY_WINDOW.pad, summaryLineY(i), '', { fontFamily: uiFontFamily, fontSize: '36px', fontStyle: 'bold', color: cssColor('paper'), stroke: cssColor('ink'), strokeThickness: 7 })
        .setOrigin(0, 0.5);
      this.summaryLineTexts.push(t);
      parts.push(t);
    }
    const b = summaryButtonRect();
    this.summaryButtonBg = this.add.graphics();
    this.summaryButtonLabel = this.add.text(b.x + b.w / 2, b.y + b.h / 2, 'Ngày mới (Enter)', btnStyle).setOrigin(0.5);
    parts.push(this.summaryButtonBg, this.summaryButtonLabel);
    this.summaryWindow = this.add.container(0, 0, parts).setDepth(85).setVisible(false);
  }

  /** Vẽ một nút gỗ (rê chuột → vàng hoa hòe), giống nút "Tiếp tục". */
  private drawWoodButton(g: Phaser.GameObjects.Graphics, b: Rect, hover: boolean): void {
    g.clear();
    g.fillStyle(palette.ink, 1).fillRoundedRect(b.x - 4, b.y - 4, b.w + 8, b.h + 8, 16);
    g.fillStyle(hover ? palette.gold : palette.wood, 1).fillRoundedRect(b.x, b.y, b.w, b.h, 13);
    g.fillStyle(palette.paper, hover ? 0.35 : 0.2).fillRoundedRect(b.x + 6, b.y + 6, b.w - 12, 10, 5);
  }

  /** Mỗi frame: lớp tối, chữ "Zzz", hộp hỏi ngủ, màn tổng kết theo trạng thái GardenScene. */
  private updateNight(dt: number): void {
    const garden = this.garden;
    const fade = garden.nightFade;
    this.nightOverlay.setAlpha(fade).setVisible(fade > 0.001);

    // "Zzz": 3 chữ Z lần lượt bay lên chéo từ đầu nhân vật, to dần, mờ dần. Nằm trên lớp tối để vẫn thấy khi màn đã tối.
    if (garden.zzzActive) {
      this.zzzT += dt;
      const head = garden.heroHeadScreen();
      const rise = gameConfig.zzzRiseSeconds;
      const gap = gameConfig.zzzIntervalSeconds;
      const cycle = Math.max(rise, gap * this.zzz.length);
      this.zzz.forEach((z, i) => {
        const local = this.zzzT - i * gap;
        if (local < 0) {
          z.setVisible(false);
          return;
        }
        const k = (local % cycle) / rise;
        if (k >= 1) {
          z.setVisible(false);
          return;
        }
        z.setPosition(head.x + 24 + k * 50 + Math.sin(k * Math.PI * 2) * 8, head.y - 10 - k * 110)
          .setScale(0.7 + 0.6 * k)
          .setAlpha(k < 0.7 ? 1 : 1 - (k - 0.7) / 0.3)
          .setVisible(true);
      });
    } else if (this.zzzT !== 0) {
      this.zzzT = 0;
      for (const z of this.zzz) z.setVisible(false);
    }

    // Hộp hỏi ngủ.
    const prompt = garden.nightPhase === 'sleepPrompt';
    this.sleepPrompt.setVisible(prompt);
    if (prompt) {
      const hover = garden.sleepPromptHover;
      if (String(hover) !== this.sleepHoverDrawn) {
        this.sleepHoverDrawn = String(hover);
        this.drawWoodButton(this.sleepYesBg, sleepButtonRect('yes'), hover === 'yes');
        this.drawWoodButton(this.sleepNoBg, sleepButtonRect('no'), hover === 'no');
      }
    } else {
      this.sleepHoverDrawn = null;
    }

    // Màn tổng kết.
    const sum = garden.nightPhase === 'summary' ? garden.lastSummary : null;
    this.summaryWindow.setVisible(sum !== null);
    if (!sum) {
      this.summaryShownFor = null;
      this.summaryButtonHoverDrawn = null;
      return;
    }
    const lines = garden.summaryLineList;
    if (this.summaryShownFor !== sum) {
      this.summaryShownFor = sum;
      this.summaryTitleText.setText(summaryTitle(sum));
      this.summarySubText.setText(summarySubtitle(sum, gameConfig.daysPerSeason));
      this.summaryLineTexts.forEach((t, i) => {
        const line = lines[i];
        if (!line) {
          t.setText('').setVisible(false);
          return;
        }
        const money = line.kind === 'money';
        t.setText(line.text)
          .setFontSize(money ? 44 : 36)
          .setColor(cssColor(money ? 'gold' : line.warn ? 'vermilion' : 'paper'))
          .setStroke(cssColor(line.warn ? 'paper' : 'ink'), line.warn ? 5 : 7)
          .setVisible(true);
      });
    }
    const reveal = garden.summaryReveal;
    const timing = {
      lineInterval: gameConfig.summaryLineIntervalSeconds,
      lineSlide: gameConfig.summaryLineSlideSeconds,
      countSeconds: gameConfig.summaryCountSeconds,
    };
    const left = summaryPanelRect().x + SUMMARY_WINDOW.pad;
    this.summaryLineTexts.forEach((t, i) => {
      if (!lines[i]) return;
      const p = lineProgress(reveal, i, timing);
      const ease = 1 - (1 - p) * (1 - p) * (1 - p);
      t.setX(left + (1 - ease) * gameConfig.summaryLineSlidePx).setAlpha(p);
      if (lines[i].kind === 'money') {
        const txt = moneyLineText(moneyShown(reveal, sum.sale.earned, timing));
        if (t.text !== txt) t.setText(txt);
      }
    });
    const detail = garden.summaryDetail;
    if (this.summaryDetailText.text !== detail) this.summaryDetailText.setText(detail);
    this.summaryDetailText.setAlpha(lineProgress(reveal, 0, timing));
    const hover = garden.summaryHoverButton;
    if (hover !== this.summaryButtonHoverDrawn) {
      this.summaryButtonHoverDrawn = hover;
      this.drawWoodButton(this.summaryButtonBg, summaryButtonRect(), hover);
    }
  }

  /** Cỡ chữ nhỏ nhất (px) trong hộp hỏi ngủ / màn tổng kết đang hiện — QA kiểm "chữ ≥ 24px". */
  private nightMinFontPx(): number {
    const win = this.summaryWindow?.visible ? this.summaryWindow : this.sleepPrompt?.visible ? this.sleepPrompt : null;
    if (!win) return 0;
    let min = Number.POSITIVE_INFINITY;
    for (const o of win.list) {
      if (o instanceof Phaser.GameObjects.Text && o.visible && o.text.trim() !== '') min = Math.min(min, parseFloat(String(o.style.fontSize)));
    }
    return Number.isFinite(min) ? min : 0;
  }

  /** Ô tiền dưới thanh Sức: khung mực + nền nâu đất, icon đồng xu vàng (lỗ vuông — quan tiền), chữ "60 quan". */
  private buildMoney(): void {
    const p = moneyPanelRect();
    const g = this.add.graphics();
    g.fillStyle(palette.ink, 0.92).fillRoundedRect(p.x - 3, p.y - 3, p.w + 6, p.h + 6, 14);
    g.fillStyle(palette.earth, 1).fillRoundedRect(p.x, p.y, p.w, p.h, 12);
    const cx = p.x + 14 + MONEY_PANEL.icon / 2;
    const cy = p.y + p.h / 2;
    drawCoin(g, cx, cy, MONEY_PANEL.icon / 2);
    this.moneyText = this.add
      .text(cx + MONEY_PANEL.icon / 2 + 14, cy, '', { fontFamily: uiFontFamily, fontSize: '28px', fontStyle: 'bold', color: cssColor('paper'), stroke: cssColor('ink'), strokeThickness: 6 })
      .setOrigin(0, 0.5);
    this.moneyFloat = this.add
      .text(p.x + p.w + 16, cy, '', { fontFamily: uiFontFamily, fontSize: '28px', fontStyle: 'bold', color: cssColor('gold'), stroke: cssColor('ink'), strokeThickness: 6 })
      .setOrigin(0, 0.5)
      // Nổi trên nền tối của cửa sổ sạp hạt — mua xong vẫn thấy "−4 quan" bay lên.
      .setDepth(60)
      .setVisible(false);
  }

  /** Số tiền: chỉ đặt lại chữ khi đổi; tiền đổi (moneyRevision) → chữ "−4 quan" / "+30 quan" bay lên cạnh ô rồi mờ. */
  private updateMoney(dt: number): void {
    const money = this.garden.wallet.money;
    const rev = this.garden.moneyRevision;
    if (rev !== this.moneyDrawn) {
      const first = this.moneyDrawn < 0;
      this.moneyDrawn = rev;
      this.moneyText.setText(`${money} quan`);
      const d = this.garden.lastMoneyDelta;
      if (!first && d !== 0) {
        this.moneyFloat
          .setText(d > 0 ? `+${d} quan` : `−${-d} quan`)
          .setColor(cssColor(d > 0 ? 'gold' : 'vermilion'))
          .setStroke(cssColor(d > 0 ? 'ink' : 'paper'), d > 0 ? 6 : 4)
          .setVisible(true);
        this.moneyFloatT = gameConfig.moneyFloatSeconds;
      }
    }
    if (this.moneyFloatT > 0) {
      this.moneyFloatT = Math.max(0, this.moneyFloatT - dt);
      const p = 1 - this.moneyFloatT / gameConfig.moneyFloatSeconds;
      const m = moneyPanelRect();
      this.moneyFloat.setY(m.y + m.h / 2 - p * gameConfig.moneyFloatRisePx).setAlpha(p < 0.6 ? 1 : 1 - (p - 0.6) / 0.4);
      if (this.moneyFloatT <= 0) this.moneyFloat.setVisible(false);
    }
  }

  /**
   * Cửa sổ 2 lưới (GDD §11): nền tối mờ, khung giữa màn; trái "Gùi" (2 × 9, hàng trên = hotbar), phải "Thùng bán" (2 × 9)
   * hoặc "Rương" (T-093, chestSlots ô); giữa có mũi tên ⇄. Dưới: dòng tổng (vàng), dòng báo, dòng hướng dẫn. Chữ ≥ 24px.
   */
  private buildTransferWindow(kind: 'sellBox' | 'chest'): TransferView {
    const { gameWidth: w, gameHeight: h } = gameConfig;
    const chest = kind === 'chest';
    const nBag = this.garden.inventory.slots.length;
    const nBox = (chest ? this.garden.chest : this.garden.sellBox).slots.length;
    const p = sellPanelRect(nBag, nBox);
    const parts: Phaser.GameObjects.GameObject[] = [this.add.rectangle(0, 0, w, h, palette.ink, 0.55).setOrigin(0)];
    const g = this.add.graphics();
    g.fillStyle(palette.ink, 1).fillRoundedRect(p.x - 5, p.y - 5, p.w + 10, p.h + 10, 22);
    g.fillStyle(palette.earth, 1).fillRoundedRect(p.x, p.y, p.w, p.h, 18);
    // Nền tối nhẹ sau từng lưới cho rõ hai bên.
    for (const side of ['bag', 'box'] as const) {
      const o = sellGridOrigin(side, nBag, nBox);
      const last = sellSlotRect(side, (side === 'bag' ? nBag : nBox) - 1, nBag, nBox);
      g.fillStyle(palette.ink, 0.25).fillRoundedRect(o.x - 10, o.y - 10, last.x + last.w - o.x + 20, last.y + last.h - o.y + 20, 12);
    }
    const bagO = sellGridOrigin('bag', nBag, nBox);
    const boxO = sellGridOrigin('box', nBag, nBox);
    const gridsBottom = sellGridsBottom(nBag, nBox);
    // Mũi tên hai chiều giữa hai lưới.
    const ax = (sellSlotRect('bag', SELL_WINDOW.perRow - 1, nBag, nBox).x + SELL_WINDOW.slot + boxO.x) / 2;
    const ay = (bagO.y + gridsBottom) / 2;
    parts.push(g);
    parts.push(this.add.text(bagO.x, p.y + 24, 'Gùi', textStyles.subtitle).setOrigin(0, 0));
    parts.push(this.add.text(boxO.x, p.y + 24, chest ? 'Rương' : 'Thùng bán', textStyles.subtitle).setOrigin(0, 0));
    parts.push(
      this.add
        .text(p.x + p.w - SELL_WINDOW.pad, p.y + 40, chest ? 'Cất đồ — không bán, không mất' : 'Cuối ngày tự bán theo giá gốc', {
          ...textStyles.body,
          fontSize: '24px',
          strokeThickness: 5,
        })
        .setOrigin(1, 0),
    );
    parts.push(this.add.text(ax, ay, '⇄', { ...textStyles.subtitle, fontSize: '56px', color: cssColor('gold') }).setOrigin(0.5));
    const total = this.add
      .text(p.x + p.w / 2, gridsBottom + 26, '', { ...textStyles.subtitle, fontSize: '34px', color: cssColor('gold') })
      .setOrigin(0.5, 0);
    const status = this.add.text(p.x + p.w / 2, gridsBottom + 86, '', { ...textStyles.body, fontSize: '24px', strokeThickness: 5 }).setOrigin(0.5, 0);
    parts.push(total, status);
    parts.push(
      this.add
        .text(p.x + p.w / 2, p.y + p.h - 22, 'Click: chuyển 1 món · Shift+click: cả chồng · F / Esc: đóng', { ...textStyles.body, fontSize: '24px', strokeThickness: 5 })
        .setOrigin(0.5, 1),
    );
    // Ô dưới con trỏ: "đế" vàng hoa hòe viền mực đặt SAU ô (ô vẽ đè lên → còn lại một vòng vàng quanh ô). Không dùng
    // strokeRoundedRect nét dày vì WebGL vẽ lòi một mũi nhọn ở chỗ nối nét.
    const s = SELL_WINDOW.slot;
    const hover = this.add.graphics().setVisible(false);
    hover.fillStyle(palette.ink, 1).fillRoundedRect(-s / 2 - 10, -s / 2 - 10, s + 20, s + 20, 16);
    hover.fillStyle(palette.gold, 1).fillRoundedRect(-s / 2 - 7, -s / 2 - 7, s + 14, s + 14, 14);
    parts.push(hover);
    const win = this.add.container(0, 0, parts).setDepth(50).setVisible(false);
    const bag: SlotView[] = [];
    const box: SlotView[] = [];
    for (let i = 0; i < nBag; i++) {
      const v = this.makeSlot(sellSlotRect('bag', i, nBag, nBox), i < gameConfig.hotbarSlots ? String(i + 1) : null);
      bag.push(v);
      win.add(v.root);
    }
    for (let i = 0; i < nBox; i++) {
      const v = this.makeSlot(sellSlotRect('box', i, nBag, nBox), null);
      box.push(v);
      win.add(v.root);
    }
    return { kind, win, bag, box, hover, total, status };
  }

  /** Thùng bán: dựng cửa sổ 2 lưới + giữ các trường cũ (QA đọc debugState). */
  private buildSellWindow(): void {
    const v = this.buildTransferWindow('sellBox');
    this.sellWindow = v.win;
    this.sellBagSlots.push(...v.bag);
    this.sellBoxSlots.push(...v.box);
    this.sellTotalText = v.total;
    this.sellStatusText = v.status;
    this.sellView = v;
  }

  /** Cửa sổ sạp hạt: tiêu đề "Sạp hạt" + "Tiền: 60 quan", mỗi hạt một nút (icon, "Hạt cải — 4 quan", số đang có), dòng báo, hướng dẫn. */
  private buildStallWindow(): void {
    const { gameWidth: w, gameHeight: h } = gameConfig;
    const items = this.garden.seedStallItems;
    const p = stallPanelRect(items.length);
    const parts: Phaser.GameObjects.GameObject[] = [this.add.rectangle(0, 0, w, h, palette.ink, 0.55).setOrigin(0)];
    const g = this.add.graphics();
    g.fillStyle(palette.ink, 1).fillRoundedRect(p.x - 5, p.y - 5, p.w + 10, p.h + 10, 22);
    g.fillStyle(palette.earth, 1).fillRoundedRect(p.x, p.y, p.w, p.h, 18);
    parts.push(g);
    parts.push(this.add.text(p.x + STALL_WINDOW.pad, p.y + 26, 'Sạp hạt', textStyles.subtitle).setOrigin(0, 0));
    parts.push(
      this.add
        .text(p.x + STALL_WINDOW.pad, p.y + 84, 'Hộp hạt tự bán — bỏ tiền, lấy hạt', { ...textStyles.body, fontSize: '24px', strokeThickness: 5 })
        .setOrigin(0, 0),
    );
    // Tiền đang có (góc phải tiêu đề) + icon xu.
    const coin = this.add.graphics();
    const mx = p.x + p.w - STALL_WINDOW.pad;
    this.stallMoneyText = this.add
      .text(mx, p.y + 46, '', { fontFamily: uiFontFamily, fontSize: '30px', fontStyle: 'bold', color: cssColor('paper'), stroke: cssColor('ink'), strokeThickness: 6 })
      .setOrigin(1, 0.5);
    parts.push(coin, this.stallMoneyText);
    for (let i = 0; i < items.length; i++) {
      const b = stallButtonRect(i, items.length);
      const bg = this.add.graphics();
      const seedId = seedItemId(items[i].cropId);
      const tex = itemIconTexture(seedId);
      // T-022: icon túi hạt thật; ảnh tải lỗi → vẽ bằng code như cũ.
      let icon: Phaser.GameObjects.Image | Phaser.GameObjects.Graphics;
      if (tex && this.textures.exists(tex)) {
        icon = this.add.image(b.x + 56, b.y + b.h / 2, tex).setDisplaySize(ICON_IMAGE_SIZE.stall, ICON_IMAGE_SIZE.stall);
      } else {
        const g = this.add.graphics().setPosition(b.x + 56, b.y + b.h / 2);
        drawItemIcon(g, seedId, 72);
        icon = g;
      }
      const label = this.add
        .text(b.x + 112, b.y + b.h / 2, '', { fontFamily: uiFontFamily, fontSize: '32px', fontStyle: 'bold', color: cssColor('ink') })
        .setOrigin(0, 0.5);
      const owned = this.add
        .text(b.x + b.w - 24, b.y + b.h / 2, '', { fontFamily: uiFontFamily, fontSize: '24px', fontStyle: 'bold', color: cssColor('ink') })
        .setOrigin(1, 0.5);
      parts.push(bg, icon, label, owned);
      this.stallButtons.push({ bg, label, owned });
    }
    const footY = stallButtonRect(items.length - 1, items.length);
    this.stallStatusText = this.add
      .text(p.x + p.w / 2, footY.y + footY.h + 22, '', { ...textStyles.body, fontSize: '24px', strokeThickness: 5 })
      .setOrigin(0.5, 0);
    parts.push(this.stallStatusText);
    parts.push(
      this.add
        .text(p.x + p.w / 2, p.y + p.h - 22, `Click: mua 1 · Shift+click: mua ${gameConfig.seedBulkBuyCount} · F / Esc: đóng`, { ...textStyles.body, fontSize: '24px', strokeThickness: 5 })
        .setOrigin(0.5, 1),
    );
    this.stallWindow = this.add.container(0, 0, parts).setDepth(50).setVisible(false);
    // Icon xu đặt bên trái chữ tiền — vị trí phụ thuộc bề rộng chữ nên vẽ ở updateStallWindow.
    this.stallCoin = coin;
  }

  private stallCoin!: Phaser.GameObjects.Graphics;

  /** Vẽ lại nút sạp khi tiền / hover / số hạt trong gùi đổi: đủ tiền = nền gỗ (hover sáng vàng), thiếu tiền = xám mờ. */
  private updateStallWindow(): void {
    const open = this.garden.shopWindow === 'seedStall';
    this.stallWindow.setVisible(open);
    if (!open) return;
    const items = this.garden.seedStallItems;
    const money = this.garden.wallet.money;
    const status = this.garden.shopStatus;
    if (this.stallStatusText.text !== status.text) this.stallStatusText.setText(status.text);
    this.stallStatusText.setColor(cssColor(status.warn ? 'gold' : 'paper'));
    const sig = `${money}|${this.garden.stallHover}|${this.garden.inventoryRevision}`;
    if (sig === this.stallDrawnSig) return;
    this.stallDrawnSig = sig;
    this.stallMoneyText.setText(`${money} quan`);
    const p = stallPanelRect(items.length);
    this.stallCoin.clear();
    drawCoin(this.stallCoin, p.x + p.w - STALL_WINDOW.pad - this.stallMoneyText.width - 26, p.y + 46, 18);
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const price = seedPriceOf(it.cropId) ?? 0;
      const enabled = hasMoney(this.garden.wallet, price);
      const hover = this.garden.stallHover === i;
      const b = stallButtonRect(i, items.length);
      const v = this.stallButtons[i];
      v.bg.clear();
      v.bg.fillStyle(palette.ink, 1).fillRoundedRect(b.x - 4, b.y - 4, b.w + 8, b.h + 8, 16);
      const fill = !enabled ? GRAY_BUTTON : hover ? palette.gold : palette.wood;
      v.bg.fillStyle(fill, 1).fillRoundedRect(b.x, b.y, b.w, b.h, 13);
      if (enabled) v.bg.fillStyle(palette.paper, hover ? 0.35 : 0.2).fillRoundedRect(b.x + 6, b.y + 6, b.w - 12, 10, 5);
      v.label.setText(`${it.label} — ${price} quan`).setAlpha(enabled ? 1 : 0.55);
      v.owned.setText(`Có: ${countInBag(this.garden, seedItemId(it.cropId))}`).setAlpha(enabled ? 1 : 0.55);
    }
  }

  /** Cửa sổ 2 lưới mỗi frame: hiện/ẩn, viền ô dưới con trỏ, dòng báo; lưới + dòng tổng vẽ lại khi inventoryRevision đổi. */
  private updateTransferWindow(v: TransferView, redraw: boolean): void {
    const open = this.garden.shopWindow === v.kind;
    v.win.setVisible(open);
    if (redraw) {
      const inv = this.garden.inventory;
      const box = v.kind === 'chest' ? this.garden.chest : this.garden.sellBox;
      for (let i = 0; i < v.bag.length; i++) this.drawSlot(v.bag[i], inv.slots[i] ?? null);
      for (let i = 0; i < v.box.length; i++) this.drawSlot(v.box[i], box.slots[i] ?? null);
      if (v.kind === 'chest') {
        const used = box.slots.filter((st) => st !== null).length;
        v.total.setText(`Rương: ${used}/${box.slots.length} ô có đồ`);
      } else {
        v.total.setText(`Cuối ngày bán được: ${sellBoxTotal(box)} quan`);
      }
    }
    if (!open) return;
    const hv = this.garden.shopHover;
    if (hv) {
      const slot = (hv.side === 'bag' ? v.bag : v.box)[hv.index];
      if (slot) v.hover.setPosition(slot.root.x, slot.root.y).setVisible(true);
    } else {
      v.hover.setVisible(false);
    }
    const status = this.garden.shopStatus;
    if (v.status.text !== status.text) v.status.setText(status.text);
    v.status.setColor(cssColor(status.warn ? 'gold' : 'paper'));
  }

  /** T-093: tên khu ("Nhà Tý") giữa trên màn khi vừa vào khu — hiện đậm rồi mờ dần (GardenScene giữ nhịp). */
  private updateAreaBanner(): void {
    const a = this.garden.areaBannerOpacity;
    if (a <= 0.001) {
      if (this.areaBanner.visible) this.areaBanner.setVisible(false);
      return;
    }
    if (this.areaBanner.text !== this.garden.areaBannerText) this.areaBanner.setText(this.garden.areaBannerText);
    this.areaBanner.setAlpha(a).setVisible(true);
  }

  /** Cỡ chữ nhỏ nhất (px) trong cửa sổ đang mở — cho QA kiểm "chữ ≥ 24px". */
  private shopMinFontPx(): number {
    const sw = this.garden.shopWindow;
    const win = sw === 'sellBox' ? this.sellWindow : sw === 'chest' ? this.chestView.win : sw === 'seedStall' ? this.stallWindow : null;
    if (!win) return 0;
    let min = Number.POSITIVE_INFINITY;
    const visit = (o: Phaser.GameObjects.GameObject) => {
      if (o instanceof Phaser.GameObjects.Text) {
        if (o.text.trim() !== '') min = Math.min(min, parseFloat(String(o.style.fontSize)));
      } else if (o instanceof Phaser.GameObjects.Container) {
        // Số phím góc ô (1–9) là nhãn phụ trong ô, không phải chữ thân — bỏ qua như cửa sổ gùi.
        // (Nhận theo tên chứ không theo vị trí trong ô — T-009 thêm ảnh icon vào ô làm lệch thứ tự.)
        o.list.forEach((c) => {
          if (c.name !== SLOT_KEY_LABEL) visit(c);
        });
      }
    };
    visit(win);
    return Number.isFinite(min) ? min : 0;
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
    // Ảnh icon thật (nông cụ): tạo sẵn, ẩn; drawSlot chỉ đổi texture + hiện/ẩn (không tạo object mới mỗi lần vẽ lại).
    const image = this.add.image(0, 0, '__DEFAULT').setVisible(false);
    const count = this.add
      .text(s / 2 - 8, s / 2 - 4, '', { fontFamily: uiFontFamily, fontSize: '24px', fontStyle: 'bold', color: cssColor('paper'), stroke: cssColor('ink'), strokeThickness: 5 })
      .setOrigin(1, 1);
    const parts: Phaser.GameObjects.GameObject[] = [bg, icon, image, count];
    if (keyLabel) {
      parts.push(
        this.add
          .text(-s / 2 + 8, -s / 2 + 4, keyLabel, { fontFamily: uiFontFamily, fontSize: '17px', fontStyle: 'bold', color: cssColor('earth') })
          .setOrigin(0, 0)
          .setName(SLOT_KEY_LABEL),
      );
    }
    const root = this.add.container(r.x + s / 2, r.y + s / 2, parts);
    return { root, icon, image, count, size: s };
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
    const redraw = this.garden.inventoryRevision !== this.drawnRevision;
    if (redraw) {
      this.drawnRevision = this.garden.inventoryRevision;
      for (let i = 0; i < this.hotbar.length; i++) this.drawSlot(this.hotbar[i], inv.slots[i] ?? null);
      for (let i = 0; i < this.bagSlots.length; i++) this.drawSlot(this.bagSlots[i], inv.slots[i] ?? null);
    }
    this.updateTransferWindow(this.sellView, redraw);
    this.updateTransferWindow(this.chestView, redraw);
    this.updateAreaBanner();
    this.updateStallWindow();
    this.updateMoney(dt);
    const sel = this.hotbar[inv.selected];
    if (sel) this.selectFrame.setPosition(sel.root.x, sel.root.y);
    const bagSel = this.bagSlots[inv.selected];
    if (bagSel) this.bagSelectFrame.setPosition(bagSel.root.x, bagSel.root.y);

    this.bagWindow.setVisible(this.garden.bagOpen);
    this.updateStaminaBar();
    this.updateClock(dt);
    this.updatePauseWindow();
    this.updateNight(dt);
    this.updateVignette(dt);
    this.updateTooltip();
    this.updateFlyers(dt);
    this.updateBounces(dt);
  }

  private drawSlot(view: SlotView, stack: ItemStack | null): void {
    view.icon.clear();
    view.image.setVisible(false);
    if (!stack) {
      view.count.setText('');
      return;
    }
    const tex = itemIconTexture(stack.id);
    if (tex && this.textures.exists(tex)) {
      // Ảnh 128×128 có đệm → hiện cỡ ~0.8 ô (≈ 74 px trong ô hotbar 92) cho to ngang icon vẽ.
      const d = view.size * 0.8;
      view.image.setTexture(tex).setDisplaySize(d, d).setVisible(true);
    } else {
      drawItemIcon(view.icon, stack.id, view.size * 0.78);
    }
    view.count.setText(showsItemCount(stack.id) ? String(stack.count) : '');
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
    const tex = itemIconTexture(e.itemId);
    if (tex && this.textures.exists(tex)) {
      // Ảnh 128 → base ~74 px (cỡ icon vẽ 64 px + đệm trong ảnh); setScale sau đó nhân thêm như Graphics.
      f.img.setTexture(tex);
      f.imgBase = ICON_IMAGE_SIZE.flyer / f.img.width;
      f.g.setVisible(false);
    } else {
      drawItemIcon(f.g, e.itemId, 64);
      f.imgBase = 0;
      f.img.setVisible(false);
    }
    f.fromX = e.screenX;
    f.fromY = e.screenY;
    f.target = e.slot >= 0 && e.slot < this.hotbar.length ? e.slot : -1;
    f.t = gameConfig.harvestFlySeconds;
    this.placeFlyer(f, f.fromX, f.fromY, 1.2);
  }

  /** Đặt icon bay (ảnh thật hoặc Graphics dự phòng) ở (x, y) với hệ số phóng `scale`. */
  private placeFlyer(f: Flyer, x: number, y: number, scale: number): void {
    if (f.imgBase > 0) f.img.setPosition(x, y).setScale(f.imgBase * scale).setAlpha(1).setVisible(true);
    else f.g.setPosition(x, y).setScale(scale).setAlpha(1).setVisible(true);
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
      this.placeFlyer(f, x, y, 1.2 - 0.35 * p);
      if (f.t <= 0) {
        f.g.setVisible(false);
        f.img.setVisible(false);
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
    // Có thể được hỏi trước khi create() chạy (QA đọc debugState sớm) → garden chưa có.
    const garden = this.garden as GardenScene | undefined;
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
      hotbarImages: this.hotbar.map((v) => (v.image.visible ? v.image.texture.key : null)),
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
      pauseSavedText: this.pauseSavedText?.text ?? '',
      pauseRestartHover: this.pauseRestartHover === true,
      restartConfirmVisible: this.restartConfirm?.visible ?? false,
      hintLines: [this.hintMain, this.hintSide].flatMap((t) => (t ? t.text.split('\n') : [])),
      hintBounds: [this.hintMain, this.hintSide].flatMap((t) => {
        if (!t) return [];
        const r = t.getBounds();
        return [{ x: r.x, y: r.y, w: r.width, h: r.height }];
      }),
      hudRects: { stamina: staminaPanelRect(), hotbar: hotbarRect(), bagButton: bagButtonRect(), clock: clockPanelRect(), money: moneyPanelRect() },
      moneyText: this.moneyText?.text ?? '',
      moneyFloat: this.moneyFloat?.visible ? this.moneyFloat.text : '',
      sellBoxVisible: this.sellWindow?.visible ?? false,
      seedStallVisible: this.stallWindow?.visible ?? false,
      sellTotalText: this.sellTotalText?.text ?? '',
      shopStatusText: garden?.shopWindow === 'sellBox' ? (this.sellStatusText?.text ?? '') : (this.stallStatusText?.text ?? ''),
      sellBoxCounts: this.sellBoxSlots.map((v) => v.count.text),
      stallButtons: (garden?.seedStallItems ?? []).map((it, i) => ({
        text: this.stallButtons[i]?.label.text ?? '',
        enabled: garden ? hasMoney(garden.wallet, seedPriceOf(it.cropId) ?? 0) : false,
        hover: garden?.stallHover === i,
      })),
      shopMinFontPx: garden && this.sellWindow ? this.shopMinFontPx() : 0,
      sleepPromptVisible: this.sleepPrompt?.visible ?? false,
      sleepPromptHover: garden?.sleepPromptHover ?? null,
      nightOverlayAlpha: this.nightOverlay?.visible ? this.nightOverlay.alpha : 0,
      zzzVisible: this.zzz.filter((z) => z.visible).length,
      summaryVisible: this.summaryWindow?.visible ?? false,
      summaryTitle: this.summaryWindow?.visible ? this.summaryTitleText.text : '',
      summarySubtitle: this.summaryWindow?.visible ? this.summarySubText.text : '',
      summaryLines: this.summaryWindow?.visible
        ? this.summaryLineTexts.filter((t) => t.visible).map((t) => ({ text: t.text, alpha: t.alpha, offsetX: t.x - (summaryPanelRect().x + SUMMARY_WINDOW.pad) }))
        : [],
      summaryDetail: this.summaryWindow?.visible ? this.summaryDetailText.text : '',
      summaryButtonText: this.summaryButtonLabel?.text ?? '',
      summaryButtonHover: this.summaryButtonHoverDrawn === true,
      nightMinFontPx: this.summaryWindow ? this.nightMinFontPx() : 0,
    };
  }
}

/** Nút sạp hạt khi thiếu tiền: xám ấm (trộn trắng điệp + mực, không thêm màu ngoài palette). */
const GRAY_BUTTON = mixColor(palette.paper, palette.ink, 0.45);

/** Đồng xu (quan tiền): đĩa vàng hoa hòe viền mực, lỗ vuông giữa, vệt sáng — tâm (cx, cy), bán kính r. */
function drawCoin(g: Phaser.GameObjects.Graphics, cx: number, cy: number, r: number): void {
  g.fillStyle(palette.ink, 1).fillCircle(cx, cy, r + 3);
  g.fillStyle(palette.gold, 1).fillCircle(cx, cy, r);
  g.lineStyle(2, palette.ink, 0.5).strokeCircle(cx, cy, r * 0.72);
  const hole = r * 0.42;
  g.fillStyle(palette.ink, 1).fillRect(cx - hole / 2, cy - hole / 2, hole, hole);
  g.fillStyle(palette.paper, 0.55).fillCircle(cx - r * 0.45, cy - r * 0.45, r * 0.18);
}

/** Số món `id` trong gùi (đếm thẳng — HUD chỉ đọc). */
function countInBag(garden: GardenScene, id: string): number {
  let n = 0;
  for (const st of garden.inventory.slots) if (st && st.id === id) n += st.count;
  return n;
}
