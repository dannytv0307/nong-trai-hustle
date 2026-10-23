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
// T-092: giao diện Lô 1 (ảnh thật, T-091): ống tre Sức, bảng gỗ tiền / đồng hồ, ô + nút 9-slice, mọi cửa sổ là giấy điệp
// chữ mực có nút đóng (X), tooltip món + tên khu trên khung giấy nhỏ. Khung / nút / cửa sổ dựng qua `ui/uiKit.ts` (dùng
// chung cho cửa sổ làm sau: thoại, cửa hàng, Kỳ kèo); thiếu ảnh → vẽ tạm bằng code.
// T-026: cửa sổ Tạm dừng có 2 hàng âm lượng Nhạc / Hiệu ứng (nút − / + gỗ, số %). Bấm / hover do GardenScene xử lý.
import Phaser from 'phaser';
import { gameConfig } from '../config/gameConfig';
import { cssColor, palette } from '../config/palette';
import { paperText, slotText, textStyles, uiFontFamily, woodText } from '../config/theme';
import type { ItemStack } from '../systems/inventory';
import { seedItemId } from '../systems/items';
import { hasMoney, seedPriceOf, sellBoxTotal } from '../systems/economy';
import { staminaBand, staminaLabel, staminaRatio, type StaminaBand } from '../systems/stamina';
import {
  BAG_WINDOW,
  bagButtonRect,
  bagPanelRect,
  bagRows,
  bagSlotRect,
  CLOCK_PANEL,
  clockPanelRect,
  clockPlankRect,
  hotbarRect,
  hotbarSlotRect,
  KEY_HINT,
  keyHintMainBottom,
  MONEY_PANEL,
  moneyPanelRect,
  moneyTextArea,
  moneyTextScale,
  SELL_WINDOW,
  sellGridOrigin,
  sellGridsBottom,
  sellPanelRect,
  sellSlotRect,
  stallButtonRect,
  stallPanelRect,
  PAUSE_WINDOW,
  pausePanelRect,
  pauseRestartButtonRect,
  pauseResumeButtonRect,
  restartConfirmButtonRect,
  restartConfirmRect,
  sleepButtonRect,
  sleepPromptRect,
  VOLUME_BUTTONS,
  volumeButtonRect,
  volumeRowY,
  volumeValueCenter,
  type VolumeButtonId,
  summaryButtonRect,
  summaryDetailY,
  summaryLineY,
  summaryPanelRect,
  summaryRecordAnchor,
  SUMMARY_WINDOW,
  staminaBarRect,
  staminaPanelRect,
  STAMINA_BAR,
  WINDOW_CHROME,
  windowCloseRect,
  type Rect,
} from '../ui/hudLayout';
import { blinkOn, dayLabel, formatClock, isPassOutWarning, seasonOf, skyPhase } from '../systems/time';
import { lineProgress, moneyLineText, moneyShown, RECORD_TEXT, recordProgress, summarySubtitle, summaryTitle, type RevealTiming } from '../systems/daySummary';
import { bumpScale, coinProgress, flightPoint, hasIncomingCoins, trailFade, trailProgress, type Point } from '../systems/juice';
import { ensureGlowTexture, FX_GLOW, FX_GLOW_SIZE } from '../ui/fxTextures';
import { drawItemIcon, itemIconTexture, showsItemCount } from '../ui/itemArt';
import { itemTooltipText } from '../ui/itemText';
import { addUiIcon, buildPaperWindow, setCloseHover, setUiIcon, UiButton, UiFrame, type PaperWindow } from '../ui/uiKit';
import { CheatPanelView } from '../ui/CheatPanelView';
import { CHEAT_ROWS } from '../systems/cheats';
import { buttonLabelCenterY, buttonState, BUTTON_FRAME, fitNineSize, staminaBarGeometry, staminaFillColor, type NineSliceName } from '../ui/uiSpec';
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
  /** Ô hotbar đang có khung "đang chọn". */
  selectedFrame: number;
  /** Chữ số lượng đang hiện trên từng ô hotbar ('' = ô trống). */
  hotbarCounts: string[];
  /** T-009: texture ảnh icon đang hiện ở từng ô hotbar (null = icon vẽ bằng code / ô trống) — vd 'item-hoe'. */
  hotbarImages: (string | null)[];
  /** T-092: khung đang vẽ ở từng ô hotbar ('slot' / 'slot-selected' / 'slot-hover'). */
  hotbarFrames: string[];
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
  /** T-092: icon mùa cạnh giờ (quạt nan = mùa nắng, áo tơi = mùa mưa). */
  seasonIcon: 'icon-season-dry' | 'icon-season-rain';
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
  /** T-092: tên khu đang hiện ('' = không) + có nút đóng (X) đang sáng. */
  areaBanner: string;
  closeHover: boolean;
  /**
   * T-027: số chấm vệt sáng đang hiện sau icon bay; số đồng xu đang hiện trên màn; tỷ lệ "nảy" của số tiền (1 = yên); ô tiền
   * đang được đưa lên trên lớp tối (xu bay về lúc sáng ra); chữ "Kỷ lục mới!" đang hiện ('' = không) + độ đục + cỡ.
   */
  trailVisible: number;
  coinsVisible: number;
  moneyScale: number;
  moneySpotlight: boolean;
  summaryRecord: string;
  summaryRecordAlpha: number;
  summaryRecordScale: number;
  /** T-041: bảng Thử đang hiện (bản build không dựng → luôn false); chữ đang vẽ trên các nút; dòng trạng thái; dòng báo. */
  cheatPanelVisible: boolean;
  cheatButtonTexts: string[];
  cheatStatusText: string;
  cheatNoticeText: string;
}

/** Texture viền màn tối (vẽ một lần, độ phân giải thấp rồi phóng — gradient mượt nên không vỡ). */
const VIGNETTE_TEX = 'fx-vignette';
const VIGNETTE_TEX_SIZE = { w: 480, h: 270 } as const;

/** Tên object của số phím góc ô (1–9) — nhãn phụ, QA bỏ qua khi đo cỡ chữ nhỏ nhất. */
const SLOT_KEY_LABEL = 'slot-key-label';

/** Một ô vẽ (hotbar hoặc cửa sổ gùi): khung 9-slice, icon, số lượng, số phím. */
interface SlotView {
  root: Phaser.GameObjects.Container;
  frame: UiFrame;
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
  /** T-027: quầng sáng ngay sau icon + các chấm vệt sáng lùi dần trên đường bay (pool, tạo một lần). */
  glow: Phaser.GameObjects.Image;
  trail: Phaser.GameObjects.Image[];
}

/** T-027: một đồng xu bay (ảnh icon xu hoặc hình vẽ dự phòng) + tỷ lệ gốc để ra cỡ coinFlySizePx. */
interface CoinSprite {
  obj: Phaser.GameObjects.Image | Phaser.GameObjects.Graphics;
  base: number;
}

/** Cửa sổ 2 lưới gùi ⇄ thùng bán / rương (T-093): các phần cần cập nhật mỗi frame. */
interface TransferView {
  kind: 'sellBox' | 'chest';
  win: Phaser.GameObjects.Container;
  chrome: PaperWindow;
  bag: SlotView[];
  box: SlotView[];
  total: Phaser.GameObjects.Text;
  totalCoin: Phaser.GameObjects.Image | Phaser.GameObjects.Graphics | null;
  status: Phaser.GameObjects.Text;
}

/** Nút mua của sạp hạt: khung 9-slice + icon + chữ (dịch xuống khi nhấn). */
interface StallButtonView {
  frame: UiFrame;
  icon: Phaser.GameObjects.Image | Phaser.GameObjects.Graphics;
  label: Phaser.GameObjects.Text;
  owned: Phaser.GameObjects.Text;
}

/** T-093/T-092: tâm dọc (px màn) của bảng tên khu khi vừa vào. */
const AREA_BANNER_Y = 224;
/** Bảng tên khu: cao, lề ngang quanh chữ (px). */
const AREA_BANNER = { h: 78, padX: 56 } as const;
/** Tooltip món: lề ngang, cao 1 dòng / 2 dòng, khe với ô (px). */
const TOOLTIP = { padX: 34, h1: 66, h2: 96, gap: 10 } as const;

/** Sự kiện GardenScene phát khi nhận đồ (hái). */
export interface ItemGainedEvent {
  itemId: string;
  /** Ô gùi nhận đồ (-1 = không rõ). */
  slot: number;
  screenX: number;
  screenY: number;
}

/**
 * Gợi ý phím (GDD §11, T-092 theo D-038 "click/chạm đâu đi đó"). Dòng chính dài nằm trên nút gùi; dòng ngắn ở khe bên
 * phải nút gùi.
 */
const HINT_MAIN = 'Click/chạm: đi tới & làm · WASD đi · 1–9 chọn';
const HINT_MAIN_2 = 'E Gùi · Esc Menu · F dùng đồ gần · Shift+click: cả chồng';
const HINT_SIDE = ['Chuột phải: ăn món đang chọn'];
const HINT_DEV = ['F2 bảng Thử · G qua đêm', 'F8 −20 Sức · F9 +1 giờ'];

const FLY_POOL = gameConfig.actionQueueMax + 2;
/** T-022: cỡ hiện (px màn) của icon ảnh 128×128 (có đệm 6 px) ở nút sạp hạt và icon bay — ngang cỡ icon vẽ bằng code. */
const ICON_IMAGE_SIZE = { stall: 80, flyer: 72 } as const;
/** Icon bay vồng lên bao nhiêu px trước khi rơi vào ô. */
const FLY_ARC = 140;
/** Nút gùi: cỡ icon cái gùi, cỡ icon khóa trong ô khóa (px). */
const BAG_ICON = 60;
const LOCK_ICON = 46;
/** T-027: pool đồng xu bay (đủ vài mẻ chồng nhau: mua liền tay nhiều lần). */
const COIN_POOL = gameConfig.coinFlyCount * 4;
/** T-027: bề rộng tối đa chữ số tiền (px) — tính một lần, update() mỗi frame không tạo object mới. */
const MONEY_TEXT_MAX_W = moneyTextArea().w;
/**
 * T-027: lớp vẽ — xu bay nổi trên mọi cửa sổ (sạp 50) và màn tổng kết (85), dưới Tạm dừng (90). Lúc xu bay về khi màn còn
 * tối (sáng ra), ô tiền + chữ "+N quan" được đưa lên trên lớp tối (80) để thấy xu rơi vào.
 */
const DEPTH_COIN = 86;
const DEPTH_MONEY_SPOTLIGHT = 84;
const DEPTH_MONEY_FLOAT = 60;
/** Ô tiền khi đang mở sạp hạt: trên nền tối + khung cửa sổ (50), dưới chữ bay (60). */
const DEPTH_MONEY_OVER_SHOP = 55;
/** Icon bay (hái) vẽ ở lớp 100; vệt sáng ngay dưới. */
const DEPTH_FLYER = 100;

export class GardenHudScene extends Phaser.Scene {
  private garden!: GardenScene;
  private drawnRevision = -1;
  private readonly hotbar: SlotView[] = [];
  private readonly bagSlots: SlotView[] = [];
  private bagButton!: Phaser.GameObjects.Container;
  private bagButtonFrame!: UiFrame;
  private bagWindow!: Phaser.GameObjects.Container;
  private bagChrome!: PaperWindow;
  private tooltip!: Phaser.GameObjects.Container;
  private tooltipFrame!: UiFrame;
  private tooltipText!: Phaser.GameObjects.Text;
  private tooltipDetail!: Phaser.GameObjects.Text;
  /** Nguồn (gùi / hotbar) + ô + món đang hiện tooltip (chỉ vẽ lại khi đổi). */
  private tooltipSig = '';
  private readonly flyers: Flyer[] = [];
  /** Thời gian nảy còn lại của từng ô hotbar, và của nút gùi. */
  private readonly bounceT: number[] = [];
  private bagBounceT = 0;
  private landed = 0;
  // ---- Thanh Sức + viền đuối (T-004) ----
  private staminaFill!: Phaser.GameObjects.Graphics;
  private staminaText!: Phaser.GameObjects.Text;
  /** Sức lần vẽ trước — chỉ vẽ lại khi đổi. */
  private staminaDrawn = -1;
  private staminaDrawnBand: StaminaBand = 'green';
  private staminaDrawnColor: number = palette.sprout;
  private vignette!: Phaser.GameObjects.Image;
  /** 0 → 1: mức hiện của viền đuối (tăng/giảm dần trong exhaustedVignetteFadeSeconds). */
  private vignetteLevel = 0;
  private eatBounces = 0;
  private lastEatSlot = -1;
  // ---- Đồng hồ + Tạm dừng (T-005) ----
  private clockText!: Phaser.GameObjects.Text;
  private dayText!: Phaser.GameObjects.Text;
  private clockIcon!: Phaser.GameObjects.Image | Phaser.GameObjects.Graphics;
  private clockIconDrawn: 'sun' | 'moon' | null = null;
  private seasonIcon!: Phaser.GameObjects.Image | Phaser.GameObjects.Graphics;
  private seasonDrawn: 'icon-season-dry' | 'icon-season-rain' | null = null;
  private clockColor = cssColor('paper');
  private clockWarn = false;
  /** Đồng hồ riêng của HUD cho nhịp nhấp nháy (giây). */
  private blinkT = 0;
  private pauseWindow!: Phaser.GameObjects.Container;
  private pauseChrome!: PaperWindow;
  private pauseResume!: UiButton;
  private pauseRestart!: UiButton;
  // T-008: dòng "Đã lưu lúc…", nút "Chơi lại từ đầu", hộp xác nhận.
  private pauseSavedText!: Phaser.GameObjects.Text;
  private restartConfirm!: Phaser.GameObjects.Container;
  private restartChrome!: PaperWindow;
  private restartYes!: UiButton;
  private restartNo!: UiButton;
  /** T-026: nút −/+ âm lượng (theo VOLUME_BUTTONS) + chữ "80%" mỗi kênh. */
  private readonly volumeButtons = new Map<VolumeButtonId, UiButton>();
  private readonly volumeTexts: Record<'music' | 'sfx', Phaser.GameObjects.Text | null> = { music: null, sfx: null };
  private hintMain!: Phaser.GameObjects.Text;
  private hintSide!: Phaser.GameObjects.Text;
  // ---- Tiền, thùng bán, sạp hạt (T-006) ----
  private moneyText!: Phaser.GameObjects.Text;
  private moneyFloat!: Phaser.GameObjects.Text;
  private moneyFloatT = 0;
  private moneyDrawn = -1;
  // ---- T-027: ô tiền nảy theo xu, xu bay, chữ Kỷ lục ----
  /** Ô tiền (bảng gỗ + icon xu + số) gom một container để đưa lên trên lớp tối khi cần. */
  private moneyPanel!: Phaser.GameObjects.Container;
  private moneyIcon!: Phaser.GameObjects.Image | Phaser.GameObjects.Graphics;
  private moneyIconBase = 1;
  /** Số tiền đang vẽ (khác ví khi xu còn bay); -1 = chưa vẽ. */
  private moneyShownDrawn = -1;
  private coinsLandedSeen = 0;
  private moneyBumpT = 0;
  private moneySpotlight = false;
  private readonly coinSprites: CoinSprite[] = [];
  /** Điểm tạm cho đường bay (dùng lại mỗi frame, không tạo object mới). */
  private readonly flightPt: Point = { x: 0, y: 0 };
  private readonly flyFrom: Point = { x: 0, y: 0 };
  private readonly flyTo: Point = { x: 0, y: 0 };
  private summaryRecordText!: Phaser.GameObjects.Text;
  private sellView!: TransferView;
  /** T-093: cửa sổ rương (cùng bố cục với thùng bán) + tên khu khi vừa vào. */
  private chestView!: TransferView;
  private areaBanner!: Phaser.GameObjects.Container;
  private areaBannerFrame!: UiFrame;
  private areaBannerText!: Phaser.GameObjects.Text;
  private stallWindow!: Phaser.GameObjects.Container;
  private stallChrome!: PaperWindow;
  private stallMoneyText!: Phaser.GameObjects.Text;
  private stallCoin!: Phaser.GameObjects.Image | Phaser.GameObjects.Graphics;
  private stallStatusText!: Phaser.GameObjects.Text;
  private readonly stallButtons: StallButtonView[] = [];
  /** "Chữ ký" lần vẽ nút sạp gần nhất (tiền, hover, giữ chuột, gùi) — chỉ vẽ lại khi đổi. */
  private stallDrawnSig = '';
  // ---- Ngủ, ngủ gục, tổng kết (T-007) ----
  private nightOverlay!: Phaser.GameObjects.Rectangle;
  private readonly zzz: Phaser.GameObjects.Text[] = [];
  private zzzT = 0;
  private sleepPrompt!: Phaser.GameObjects.Container;
  private sleepChrome!: PaperWindow;
  private sleepYes!: UiButton;
  private sleepNo!: UiButton;
  private summaryWindow!: Phaser.GameObjects.Container;
  private summaryChrome!: PaperWindow;
  private summaryTitleText!: Phaser.GameObjects.Text;
  private summarySubText!: Phaser.GameObjects.Text;
  private summaryDetailText!: Phaser.GameObjects.Text;
  private readonly summaryLineTexts: Phaser.GameObjects.Text[] = [];
  private summaryButton!: UiButton;
  /** Kết quả đêm đang hiện trên màn tổng kết (đổi → đặt lại chữ). */
  private summaryShownFor: unknown = null;
  /** T-041: bảng Thử — chỉ dựng ở bản dev (gameConfig.devCheatsEnabled); bản build là null. */
  private cheatView: CheatPanelView | null = null;

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
    this.seasonDrawn = null;
    this.blinkT = 0;
    this.moneyDrawn = -1;
    this.moneyFloatT = 0;
    this.moneyShownDrawn = -1;
    this.coinsLandedSeen = this.garden.coins.landedIn;
    this.moneyBumpT = 0;
    this.moneySpotlight = false;
    this.coinSprites.length = 0;
    this.stallButtons.length = 0;
    this.stallDrawnSig = '';
    this.zzz.length = 0;
    this.zzzT = 0;
    this.summaryLineTexts.length = 0;
    this.summaryShownFor = null;
    this.tooltipSig = '';

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

    // Nút "Gùi" (icon đồ hái bay vào đây khi đồ rơi xuống hàng dưới của gùi; bấm để mở gùi): nút gỗ + icon cái gùi + "E".
    const br = bagButtonRect();
    this.bagButtonFrame = new UiFrame(this, 'btn', { x: -br.w / 2, y: -br.h / 2, w: br.w, h: br.h });
    const bagIcon = addUiIcon(this, 'icon-bag', 0, -6, BAG_ICON);
    const bagKey = this.add.text(br.w / 2 - 10, -br.h / 2 + 6, 'E', slotText.key).setOrigin(1, 0).setName(SLOT_KEY_LABEL);
    this.bagButton = this.add.container(br.x + br.w / 2, br.y + br.h / 2, [this.bagButtonFrame.obj, bagIcon, bagKey]);

    this.buildBagWindow();
    this.sellView = this.buildTransferWindow('sellBox');
    this.chestView = this.buildTransferWindow('chest');
    this.buildStallWindow();
    this.buildAreaBanner();
    this.buildPauseWindow();
    this.buildNight();
    this.cheatView = gameConfig.devCheatsEnabled ? new CheatPanelView(this, CHEAT_ROWS) : null;

    // T-027: quầng sáng (gradient vẽ bằng code một lần) cho vệt sáng sau icon bay — chế độ hoà màu ADD cho "sáng" thật.
    ensureGlowTexture(this);
    const glowImage = () => this.add.image(0, 0, FX_GLOW).setBlendMode(Phaser.BlendModes.ADD).setVisible(false).setDepth(DEPTH_FLYER - 1);
    for (let i = 0; i < FLY_POOL; i++) {
      this.flyers.push({
        g: this.add.graphics().setVisible(false).setDepth(DEPTH_FLYER),
        img: this.add.image(0, 0, '__DEFAULT').setVisible(false).setDepth(DEPTH_FLYER),
        imgBase: 0,
        t: 0,
        fromX: 0,
        fromY: 0,
        target: -1,
        glow: glowImage(),
        trail: Array.from({ length: gameConfig.harvestTrailCount }, glowImage),
      });
    }
    // T-027: pool đồng xu bay (icon xu thật; thiếu ảnh → hình vẽ dự phòng của uiKit).
    for (let i = 0; i < COIN_POOL; i++) {
      const obj = addUiIcon(this, 'icon-coin', 0, 0, gameConfig.coinFlySizePx).setDepth(DEPTH_COIN).setVisible(false);
      this.coinSprites.push({ obj, base: obj instanceof Phaser.GameObjects.Image ? obj.scaleX : 1 });
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

  // ---------------------------------------------------------------- dựng sẵn

  /** Cửa sổ giấy điệp dùng chung (nền tối + khung + nút X) cho khung `r`. */
  private paperWindow(r: Rect, close = true, dimAlpha?: number): PaperWindow {
    const { gameWidth: w, gameHeight: h } = gameConfig;
    return buildPaperWindow(this, r, { closeRect: close ? windowCloseRect(r) : null, dimAlpha, screen: { w, h } });
  }

  /** Tiêu đề cửa sổ (chữ mực to) ở góc trên-trái khung. */
  private windowTitle(p: Rect, text: string, x = p.x + WINDOW_CHROME.titleX): Phaser.GameObjects.Text {
    return this.add.text(x, p.y + WINDOW_CHROME.titleY, text, paperText.title).setOrigin(0, 0.5);
  }

  /**
   * Đồng hồ góc trên phải: bảng gỗ, đĩa gỗ đè mép trái (icon mặt trời / trăng giữa đĩa), dòng "Ngày 1 · Mùa nắng",
   * giờ to, icon mùa (quạt nan / áo tơi) cạnh giờ.
   */
  private buildClock(): void {
    const p = clockPlankRect();
    new UiFrame(this, 'hud-plank', p);
    const discX = p.x;
    const discY = p.y + p.h / 2;
    addUiIcon(this, 'hud-clock-disc', discX, discY, CLOCK_PANEL.disc);
    this.clockIcon = addUiIcon(this, 'icon-sun', discX, discY, CLOCK_PANEL.icon);
    const textX = p.x + CLOCK_PANEL.disc / 2 + 12;
    this.dayText = this.add.text(textX, p.y + 36, '', { ...woodText.body, fontSize: '26px', strokeThickness: 5 }).setOrigin(0, 0.5);
    this.clockText = this.add
      .text(textX, p.y + 90, '', { fontFamily: uiFontFamily, fontSize: '52px', fontStyle: 'bold', color: cssColor('paper'), stroke: cssColor('ink'), strokeThickness: 6 })
      .setOrigin(0, 0.5);
    this.seasonIcon = addUiIcon(this, 'icon-season-dry', p.x + p.w - 30 - CLOCK_PANEL.season / 2, p.y + 90, CLOCK_PANEL.season);
  }

  /** Cập nhật đồng hồ mỗi frame: chữ giờ / dòng ngày chỉ đặt lại khi đổi; từ 23h chữ giờ nháy đỏ son ↔ trắng điệp. */
  private updateClock(dt: number): void {
    const hour = this.garden.clockHour;
    const text = formatClock(hour);
    if (this.clockText.text !== text) this.clockText.setText(text);
    const dayNo = this.garden.dayClock.day;
    const day = dayLabel(dayNo, gameConfig.daysPerSeason);
    if (this.dayText.text !== day) this.dayText.setText(day);
    const icon = skyPhase(hour, gameConfig.skyPhaseStarts) === 'night' ? 'moon' : 'sun';
    if (icon !== this.clockIconDrawn) {
      this.clockIconDrawn = icon;
      setUiIcon(this.clockIcon, icon === 'moon' ? 'icon-moon' : 'icon-sun', CLOCK_PANEL.icon);
    }
    const season = seasonOf(dayNo, gameConfig.daysPerSeason) === 'dry' ? 'icon-season-dry' : 'icon-season-rain';
    if (season !== this.seasonDrawn) {
      this.seasonDrawn = season;
      setUiIcon(this.seasonIcon, season, CLOCK_PANEL.season);
    }
    this.clockWarn = isPassOutWarning(hour, gameConfig);
    this.blinkT = this.clockWarn ? this.blinkT + dt : 0;
    const color = this.clockWarn && blinkOn(this.blinkT, gameConfig.clockBlinkRate) ? cssColor('vermilion') : cssColor('paper');
    if (color !== this.clockColor) {
      this.clockColor = color;
      this.clockText.setColor(color);
    }
  }

  /**
   * Cửa sổ Tạm dừng: nền tối mờ phủ cả màn (kể cả HUD), khung giấy giữa màn, "Đã tạm dừng", dòng "Đã lưu lúc 14:30 ·
   * Ngày 2" (T-008), nút "Tiếp tục", nút "Chơi lại từ đầu", "Esc: chơi tiếp", nút X (= Tiếp tục).
   * Hộp xác nhận "Chơi lại từ đầu?" nằm TRÊN cửa sổ Tạm dừng (depth cao hơn), 2 nút Có / Không, nút X (= Không).
   */
  private buildPauseWindow(): void {
    const p = pausePanelRect();
    const cx = p.x + p.w / 2;
    this.pauseChrome = this.paperWindow(p, true, 0.6);
    this.pauseResume = new UiButton(this, pauseResumeButtonRect(), 'Tiếp tục', { ...paperText.button, fontSize: '34px' });
    this.pauseRestart = new UiButton(this, pauseRestartButtonRect(), 'Chơi lại từ đầu', { ...paperText.button, fontSize: '28px' });
    this.pauseSavedText = this.add.text(cx, p.y + PAUSE_WINDOW.savedLineY, '', { ...paperText.note, fontStyle: 'bold' }).setOrigin(0.5);
    // T-026: 2 hàng âm lượng — đường kẻ mực mảnh, chữ tên kênh, nút −, "80%", nút +.
    const volumeParts: Phaser.GameObjects.GameObject[] = [
      this.add.rectangle(p.x + PAUSE_WINDOW.volumeLabelX, p.y + PAUSE_WINDOW.volumeRuleY, p.w - PAUSE_WINDOW.volumeLabelX * 2, 3, palette.ink, 0.25).setOrigin(0, 0.5),
    ];
    for (const channel of ['music', 'sfx'] as const) {
      const rowMid = volumeRowY(channel) + PAUSE_WINDOW.volumeButton / 2;
      volumeParts.push(this.add.text(p.x + PAUSE_WINDOW.volumeLabelX, rowMid, channel === 'music' ? 'Nhạc' : 'Hiệu ứng', paperText.body).setOrigin(0, 0.5));
      const c = volumeValueCenter(channel);
      const t = this.add.text(c.x, c.y, '', { ...paperText.button, fontSize: '30px' }).setOrigin(0.5);
      this.volumeTexts[channel] = t;
      volumeParts.push(t);
    }
    for (const id of VOLUME_BUTTONS) {
      const b = new UiButton(this, volumeButtonRect(id), id.endsWith('up') ? '+' : '−', { ...paperText.button, fontSize: '40px' });
      this.volumeButtons.set(id, b);
      volumeParts.push(...b.parts);
    }
    this.pauseWindow = this.add
      .container(0, 0, [
        ...this.pauseChrome.parts,
        this.add.text(cx, p.y + PAUSE_WINDOW.titleY, 'Đã tạm dừng', { ...paperText.title, fontSize: '48px' }).setOrigin(0.5),
        this.add.text(cx, p.y + PAUSE_WINDOW.subY, 'Đồng hồ ngày đang đứng yên', { ...paperText.note, fontSize: '26px' }).setOrigin(0.5),
        this.pauseSavedText,
        ...this.pauseResume.parts,
        ...this.pauseRestart.parts,
        ...volumeParts,
        this.add.text(cx, p.y + PAUSE_WINDOW.escY, 'Esc: chơi tiếp', paperText.note).setOrigin(0.5),
      ])
      .setDepth(90)
      .setVisible(false);

    // Hộp xác nhận chơi lại.
    const c = restartConfirmRect();
    this.restartChrome = this.paperWindow(c, true, 0.35);
    this.restartYes = new UiButton(this, restartConfirmButtonRect('yes'), 'Có, xóa');
    this.restartNo = new UiButton(this, restartConfirmButtonRect('no'), 'Không (Esc)');
    this.restartConfirm = this.add
      .container(0, 0, [
        ...this.restartChrome.parts,
        this.add.text(c.x + c.w / 2, c.y + 82, 'Chơi lại từ đầu?', { ...paperText.title, fontSize: '44px' }).setOrigin(0.5),
        this.add
          .text(c.x + c.w / 2, c.y + 156, 'Xóa bản lưu, quay về Ngày 1.\nKhông lấy lại được.', {
            ...paperText.note,
            fontSize: '26px',
            color: cssColor('vermilion'),
            align: 'center',
            lineSpacing: 6,
          })
          .setOrigin(0.5),
        ...this.restartYes.parts,
        ...this.restartNo.parts,
      ])
      .setDepth(95)
      .setVisible(false);
  }

  /** Nút "Tiếp tục" / "Chơi lại từ đầu" / Có / Không: rê chuột → sáng vàng, giữ chuột → lún (GDD §11: mọi nút có hover). */
  private updatePauseWindow(): void {
    const garden = this.garden;
    const open = garden.pauseMenuOpen;
    this.pauseWindow.setVisible(open);
    const confirm = open && garden.restartConfirmOpen;
    this.restartConfirm.setVisible(confirm);
    if (!open) return;
    const down = garden.primaryDown;
    const saved = garden.savedText;
    if (this.pauseSavedText.text !== saved) this.pauseSavedText.setText(saved);
    this.pauseResume.setState(buttonState(true, !confirm && garden.pauseHoverResume, down));
    this.pauseRestart.setState(buttonState(true, !confirm && garden.pauseHoverRestart, down));
    // T-026: nút −/+ xám khi đã chạm 0% / 100%.
    for (const [id, b] of this.volumeButtons) {
      const channel = id.startsWith('music') ? 'music' : 'sfx';
      const v = garden.volumeOf(channel);
      const enabled = id.endsWith('up') ? v < 1 : v > 0;
      b.setState(buttonState(enabled, !confirm && garden.pauseVolumeHover === id, down));
    }
    for (const channel of ['music', 'sfx'] as const) {
      const t = this.volumeTexts[channel];
      const text = garden.volumeText(channel);
      if (t && t.text !== text) t.setText(text);
    }
    setCloseHover(this.pauseChrome.close, !confirm && garden.windowCloseHover, WINDOW_CHROME.closeSize);
    if (!confirm) return;
    this.restartYes.setState(buttonState(true, garden.restartConfirmHover === 'yes', down));
    this.restartNo.setState(buttonState(true, garden.restartConfirmHover === 'no', down));
    setCloseHover(this.restartChrome.close, garden.windowCloseHover, WINDOW_CHROME.closeSize);
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

    // Hộp hỏi "Đi ngủ?" — nền tối mờ (thế giới vẫn thấy), khung giấy giữa màn, 2 nút Có / Không (như ảnh mẫu T-091).
    const p = sleepPromptRect();
    this.sleepChrome = this.paperWindow(p);
    this.sleepYes = new UiButton(this, sleepButtonRect('yes'), 'Có (Enter)');
    this.sleepNo = new UiButton(this, sleepButtonRect('no'), 'Không (Esc)');
    this.sleepPrompt = this.add
      .container(0, 0, [
        ...this.sleepChrome.parts,
        this.add.text(p.x + p.w / 2, p.y + 92, 'Đi ngủ?', { ...paperText.title, fontSize: '44px' }).setOrigin(0.5),
        this.add.text(p.x + p.w / 2, p.y + 148, 'Ngủ tới sáng mai — thùng bán tự bán qua đêm.', { ...paperText.note, fontSize: '26px' }).setOrigin(0.5),
        ...this.sleepYes.parts,
        ...this.sleepNo.parts,
      ])
      .setDepth(50)
      .setVisible(false);

    // Màn tổng kết ngày: khung giấy giữa màn trên lớp tối (không cần phủ thêm), tiêu đề + dòng phụ, tối đa 6 dòng (dòng
    // tiền to, vàng viền mực) + dòng chi tiết, nút "Ngày mới". Nút X = "Ngày mới".
    const s = summaryPanelRect();
    this.summaryChrome = this.paperWindow(s, true, 0);
    const divider = this.add.graphics();
    divider.lineStyle(3, palette.earth, 0.5).lineBetween(s.x + SUMMARY_WINDOW.pad, s.y + 156, s.x + s.w - SUMMARY_WINDOW.pad, s.y + 156);
    this.summaryTitleText = this.add.text(s.x + s.w / 2, s.y + 74, '', { ...paperText.title, fontSize: '52px' }).setOrigin(0.5);
    this.summarySubText = this.add.text(s.x + s.w / 2, s.y + 126, '', { ...paperText.note, fontSize: '26px' }).setOrigin(0.5);
    this.summaryDetailText = this.add.text(s.x + SUMMARY_WINDOW.pad + 4, summaryDetailY(), '', paperText.note).setOrigin(0, 0.5);
    const parts: Phaser.GameObjects.GameObject[] = [...this.summaryChrome.parts, divider, this.summaryTitleText, this.summarySubText, this.summaryDetailText];
    for (let i = 0; i < 6; i++) {
      const t = this.add
        .text(s.x + SUMMARY_WINDOW.pad, summaryLineY(i), '', { fontFamily: uiFontFamily, fontSize: '36px', fontStyle: 'bold', color: cssColor('ink') })
        .setOrigin(0, 0.5);
      this.summaryLineTexts.push(t);
      parts.push(t);
    }
    // T-027: "Kỷ lục mới!" — chữ vàng viền mực, nghiêng như con dấu, cuối dòng tiền (summaryRecordAnchor = mép phải).
    const rec = summaryRecordAnchor();
    this.summaryRecordText = this.add
      .text(0, rec.y, RECORD_TEXT, { fontFamily: uiFontFamily, fontSize: '40px', fontStyle: 'bold', color: cssColor('gold'), stroke: cssColor('ink'), strokeThickness: 7 })
      .setOrigin(0.5)
      .setAngle(-6)
      .setVisible(false);
    // Tâm chữ lùi nửa bề ngang từ mép phải → khi nảy to thì toả đều hai bên, không lấn dòng tiền nhiều.
    this.summaryRecordText.setX(rec.x - this.summaryRecordText.width / 2);
    parts.push(this.summaryRecordText);
    this.summaryButton = new UiButton(this, summaryButtonRect(), 'Ngày mới (Enter)');
    parts.push(...this.summaryButton.parts);
    this.summaryWindow = this.add.container(0, 0, parts).setDepth(85).setVisible(false);
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

    const down = garden.primaryDown;
    // Hộp hỏi ngủ.
    const prompt = garden.nightPhase === 'sleepPrompt';
    this.sleepPrompt.setVisible(prompt);
    if (prompt) {
      const hover = garden.sleepPromptHover;
      this.sleepYes.setState(buttonState(true, hover === 'yes', down));
      this.sleepNo.setState(buttonState(true, hover === 'no', down));
      setCloseHover(this.sleepChrome.close, garden.windowCloseHover, WINDOW_CHROME.closeSize);
    }

    // Màn tổng kết.
    const sum = garden.nightPhase === 'summary' ? garden.lastSummary : null;
    this.summaryWindow.setVisible(sum !== null);
    if (!sum) {
      this.summaryShownFor = null;
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
        // Trên giấy điệp: chữ mực không viền; dòng tiền đỏ son to (nổi bật, hợp giấy), dòng cảnh báo đỏ son.
        t.setText(line.text)
          .setFontSize(money ? 44 : 36)
          .setColor(cssColor(money || line.warn ? 'vermilion' : 'ink'))
          .setStroke(cssColor('ink'), 0)
          .setVisible(true);
      });
    }
    const reveal = garden.summaryReveal;
    const timing: RevealTiming = {
      lineInterval: gameConfig.summaryLineIntervalSeconds,
      lineSlide: gameConfig.summaryLineSlideSeconds,
      countSeconds: gameConfig.summaryCountSeconds,
      recordPopSeconds: gameConfig.summaryRecordPopSeconds,
    };
    // T-027: chữ Kỷ lục đóng dấu xuống sau khi tiền đếm xong: từ to (× 1 + summaryRecordPopScale) nảy về cỡ thật, hiện nhanh.
    const rp = recordProgress(reveal, timing);
    if (rp > 0) {
      const ease = 1 - (1 - rp) * (1 - rp);
      this.summaryRecordText
        .setScale(1 + gameConfig.summaryRecordPopScale * (1 - ease))
        .setAlpha(Math.min(1, rp * 3))
        .setVisible(true);
    } else if (this.summaryRecordText.visible) {
      this.summaryRecordText.setVisible(false);
    }
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
    this.summaryButton.setState(buttonState(true, garden.summaryHoverButton, down));
    setCloseHover(this.summaryChrome.close, garden.windowCloseHover, WINDOW_CHROME.closeSize);
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

  /** Ô tiền dưới thanh Sức: bảng gỗ, icon đồng xu (quan tiền lỗ vuông), chữ "60 quan" trắng điệp viền mực. */
  private buildMoney(): void {
    const p = moneyPanelRect();
    const plank = new UiFrame(this, 'hud-plank', p);
    const cy = p.y + p.h / 2;
    this.moneyIcon = addUiIcon(this, 'icon-coin', p.x + 6 + MONEY_PANEL.icon / 2, cy, MONEY_PANEL.icon);
    this.moneyIconBase = this.moneyIcon.scaleX;
    this.moneyText = this.add.text(moneyTextArea().x, cy, '', { ...woodText.body, fontSize: '32px' }).setOrigin(0, 0.5);
    this.moneyPanel = this.add.container(0, 0, [plank.obj, this.moneyIcon, this.moneyText]);
    this.moneyFloat = this.add
      .text(p.x + p.w + 16, cy, '', { fontFamily: uiFontFamily, fontSize: '28px', fontStyle: 'bold', color: cssColor('gold'), stroke: cssColor('ink'), strokeThickness: 6 })
      .setOrigin(0, 0.5)
      // Nổi trên nền tối của cửa sổ sạp hạt — mua xong vẫn thấy "−4 quan" bay lên.
      .setDepth(DEPTH_MONEY_FLOAT)
      .setVisible(false);
  }

  /**
   * Số tiền: chỉ đặt lại chữ khi đổi; tiền đổi (moneyRevision) → chữ "−4 quan" / "+30 quan" bay lên cạnh ô rồi mờ.
   * T-027: số hiện là `garden.moneyShown` (ví trừ phần xu còn bay) — mỗi đồng xu chạm ô thì số nhảy lên + ô tiền nảy; xu
   * bay về lúc màn còn tối (sáng ra) thì ô tiền nổi lên trên lớp tối.
   */
  private updateMoney(dt: number): void {
    const garden = this.garden;
    const shown = garden.moneyShown;
    if (shown !== this.moneyShownDrawn) {
      this.moneyShownDrawn = shown;
      this.moneyText.setText(`${shown} quan`);
    }
    if (garden.coins.landedIn !== this.coinsLandedSeen) {
      this.coinsLandedSeen = garden.coins.landedIn;
      this.moneyBumpT = gameConfig.moneyBumpSeconds;
    }
    this.moneyBumpT = Math.max(0, this.moneyBumpT - dt);
    const k = bumpScale(this.moneyBumpT, gameConfig.moneyBumpSeconds, gameConfig.moneyBumpScale);
    // Chữ nảy nhưng không lòi khỏi bảng gỗ khi số dài (moneyTextScale); icon xu thì nảy đủ.
    this.moneyText.setScale(moneyTextScale(k, this.moneyText.width, MONEY_TEXT_MAX_W));
    this.moneyIcon.setScale(this.moneyIconBase * k);
    const spot = hasIncomingCoins(garden.coins) && garden.nightFade > 0.001;
    if (spot !== this.moneySpotlight) {
      this.moneySpotlight = spot;
      this.moneyFloat.setDepth(spot ? DEPTH_MONEY_SPOTLIGHT : DEPTH_MONEY_FLOAT);
    }
    // Đang mở sạp hạt: ô tiền nổi trên nền tối của cửa sổ (như chữ "−4 quan") → thấy xu bay KHỎI ô tiền khi mua.
    const depth = spot ? DEPTH_MONEY_SPOTLIGHT : garden.shopWindow === 'seedStall' ? DEPTH_MONEY_OVER_SHOP : 0;
    if (this.moneyPanel.depth !== depth) this.moneyPanel.setDepth(depth);
    const rev = garden.moneyRevision;
    if (rev !== this.moneyDrawn) {
      const first = this.moneyDrawn < 0;
      this.moneyDrawn = rev;
      const d = garden.lastMoneyDelta;
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
   * Cửa sổ 2 lưới (GDD §11, ảnh mẫu T-091): khung giấy giữa màn; trái "Gùi" (2 × 9, hàng trên = hotbar), phải "Thùng
   * bán" (2 × 9) hoặc "Rương" (T-093, chestSlots ô); giữa có mũi tên ⇄. Dưới: dòng tổng (icon xu + chữ mực), dòng báo,
   * dòng hướng dẫn. Chữ ≥ 24px.
   */
  private buildTransferWindow(kind: 'sellBox' | 'chest'): TransferView {
    const chest = kind === 'chest';
    const nBag = this.garden.inventory.slots.length;
    const nBox = (chest ? this.garden.chest : this.garden.sellBox).slots.length;
    const p = sellPanelRect(nBag, nBox);
    const chrome = this.paperWindow(p);
    const parts: Phaser.GameObjects.GameObject[] = [...chrome.parts];
    const bagO = sellGridOrigin('bag', nBag, nBox);
    const boxO = sellGridOrigin('box', nBag, nBox);
    const gridsBottom = sellGridsBottom(nBag, nBox);
    // Mũi tên hai chiều giữa hai lưới (ngang tâm 2 hàng đầu).
    const ax = (sellSlotRect('bag', SELL_WINDOW.perRow - 1, nBag, nBox).x + SELL_WINDOW.slot + boxO.x) / 2;
    const r1 = sellSlotRect('bag', Math.min(nBag - 1, SELL_WINDOW.perRow), nBag, nBox);
    const ay = (bagO.y + r1.y + r1.h) / 2;
    parts.push(this.windowTitle(p, 'Gùi', bagO.x + 24));
    parts.push(this.windowTitle(p, chest ? 'Rương' : 'Thùng bán', boxO.x + 20));
    parts.push(
      this.add
        .text(p.x + p.w - WINDOW_CHROME.titleX, p.y + WINDOW_CHROME.titleY + 2, chest ? 'Cất đồ — không bán, không mất' : 'Cuối ngày tự bán theo giá gốc', paperText.note)
        .setOrigin(1, 0.5),
    );
    parts.push(this.add.text(ax, ay, '⇄', { fontFamily: uiFontFamily, fontSize: '60px', fontStyle: 'bold', color: cssColor('earth') }).setOrigin(0.5));
    const total = this.add.text(p.x + p.w / 2 + (chest ? 0 : 26), gridsBottom + 60, '', { ...paperText.body, fontSize: '34px' }).setOrigin(0.5);
    const totalCoin = chest ? null : addUiIcon(this, 'icon-coin', total.x, total.y, 48);
    const status = this.add.text(p.x + p.w / 2, gridsBottom + 104, '', { ...paperText.note, fontStyle: 'bold' }).setOrigin(0.5);
    parts.push(total, status);
    if (totalCoin) parts.push(totalCoin);
    parts.push(
      this.add.text(p.x + p.w / 2, p.y + p.h - 56, 'Click: chuyển 1 món · Shift+click: cả chồng · F / Esc: đóng', paperText.note).setOrigin(0.5),
    );
    const win = this.add.container(0, 0, parts).setDepth(50).setVisible(false);
    const bag: SlotView[] = [];
    const box: SlotView[] = [];
    for (let i = 0; i < nBag; i++) {
      const v = this.makeSlot(sellSlotRect('bag', i, nBag, nBox), i < gameConfig.hotbarSlots ? String(i + 1) : null);
      bag.push(v);
      win.add(v.root);
    }
    // Ô gùi chưa mở (gùi chưa nâng): lấp nốt hàng cuối bằng ô khóa.
    for (let i = nBag; i < bagRows(nBag, SELL_WINDOW.perRow) * SELL_WINDOW.perRow; i++) win.add(this.makeLockedSlot(sellSlotRect('bag', i, nBag, nBox)));
    for (let i = 0; i < nBox; i++) {
      const v = this.makeSlot(sellSlotRect('box', i, nBag, nBox), null);
      box.push(v);
      win.add(v.root);
    }
    return { kind, win, chrome, bag, box, total, totalCoin, status };
  }

  /**
   * Cửa sổ sạp hạt: tiêu đề "Sạp hạt" + tiền đang có (icon xu), mỗi hạt một nút gỗ (icon, "Hạt cải — 4 quan", số đang có;
   * xám khi thiếu tiền), dòng báo, hướng dẫn.
   */
  private buildStallWindow(): void {
    const items = this.garden.seedStallItems;
    const p = stallPanelRect(items.length);
    this.stallChrome = this.paperWindow(p);
    const parts: Phaser.GameObjects.GameObject[] = [...this.stallChrome.parts];
    parts.push(this.windowTitle(p, 'Sạp hạt'));
    parts.push(this.add.text(p.x + WINDOW_CHROME.titleX, p.y + 108, 'Hộp hạt tự bán — bỏ tiền, lấy hạt', paperText.note).setOrigin(0, 0.5));
    // Tiền đang có (góc phải tiêu đề, tránh nút X) + icon xu bên trái chữ.
    this.stallMoneyText = this.add.text(p.x + p.w - 84, p.y + WINDOW_CHROME.titleY, '', { ...paperText.body, fontSize: '30px' }).setOrigin(1, 0.5);
    this.stallCoin = addUiIcon(this, 'icon-coin', 0, p.y + WINDOW_CHROME.titleY, 44);
    parts.push(this.stallCoin, this.stallMoneyText);
    for (let i = 0; i < items.length; i++) {
      const b = stallButtonRect(i, items.length);
      const frame = new UiFrame(this, 'btn', b);
      const seedId = seedItemId(items[i].cropId);
      const tex = itemIconTexture(seedId);
      const cy = buttonLabelCenterY('normal', b);
      // T-022: icon túi hạt thật; ảnh tải lỗi → vẽ bằng code như cũ.
      let icon: Phaser.GameObjects.Image | Phaser.GameObjects.Graphics;
      if (tex && this.textures.exists(tex)) {
        icon = this.add.image(b.x + 60, cy, tex).setDisplaySize(ICON_IMAGE_SIZE.stall, ICON_IMAGE_SIZE.stall);
      } else {
        const g = this.add.graphics().setPosition(b.x + 60, cy);
        drawItemIcon(g, seedId, 72);
        icon = g;
      }
      const label = this.add.text(b.x + 116, cy, '', paperText.button).setOrigin(0, 0.5);
      const owned = this.add.text(b.x + b.w - 32, cy, '', { ...paperText.body, fontSize: '26px' }).setOrigin(1, 0.5);
      parts.push(frame.obj, icon, label, owned);
      this.stallButtons.push({ frame, icon, label, owned });
    }
    const last = stallButtonRect(items.length - 1, items.length);
    this.stallStatusText = this.add.text(p.x + p.w / 2, last.y + last.h + 30, '', { ...paperText.note, fontStyle: 'bold' }).setOrigin(0.5);
    parts.push(this.stallStatusText);
    parts.push(
      this.add.text(p.x + p.w / 2, p.y + p.h - 56, `Click: mua 1 · Shift+click: mua ${gameConfig.seedBulkBuyCount} · F / Esc: đóng`, paperText.note).setOrigin(0.5),
    );
    this.stallWindow = this.add.container(0, 0, parts).setDepth(50).setVisible(false);
  }

  /** Vẽ lại nút sạp khi tiền / hover / giữ chuột / số hạt trong gùi đổi: đủ tiền = nút gỗ (rê → vàng, giữ → lún), thiếu = xám. */
  private updateStallWindow(): void {
    const open = this.garden.shopWindow === 'seedStall';
    this.stallWindow.setVisible(open);
    if (!open) return;
    setCloseHover(this.stallChrome.close, this.garden.windowCloseHover, WINDOW_CHROME.closeSize);
    const items = this.garden.seedStallItems;
    const money = this.garden.wallet.money;
    const status = this.garden.shopStatus;
    if (this.stallStatusText.text !== status.text) this.stallStatusText.setText(status.text);
    this.stallStatusText.setColor(cssColor(status.warn ? 'vermilion' : 'earth'));
    const down = this.garden.primaryDown;
    const sig = `${money}|${this.garden.stallHover}|${down}|${this.garden.inventoryRevision}`;
    if (sig === this.stallDrawnSig) return;
    this.stallDrawnSig = sig;
    this.stallMoneyText.setText(`${money} quan`);
    this.stallCoin.setX(this.stallMoneyText.x - this.stallMoneyText.width - 30);
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const price = seedPriceOf(it.cropId) ?? 0;
      const enabled = hasMoney(this.garden.wallet, price);
      const state = buttonState(enabled, this.garden.stallHover === i, down);
      const b = stallButtonRect(i, items.length);
      const v = this.stallButtons[i];
      v.frame.setFrame(BUTTON_FRAME[state]);
      // Nút nhấn: mặt nút lún 12 px → icon + chữ dịch xuống theo vùng content.
      const cy = buttonLabelCenterY(state, b);
      const color = cssColor(enabled ? 'ink' : 'inkMuted');
      v.icon.setY(cy).setAlpha(enabled ? 1 : 0.6);
      v.label.setText(`${it.label} — ${price} quan`).setY(cy).setColor(color);
      v.owned.setText(`Có: ${countInBag(this.garden, seedItemId(it.cropId))}`).setY(cy).setColor(color);
    }
  }

  /** Cửa sổ 2 lưới mỗi frame: hiện/ẩn, khung ô dưới con trỏ, dòng báo; lưới + dòng tổng vẽ lại khi inventoryRevision đổi. */
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
        v.totalCoin?.setX(v.total.x - v.total.width / 2 - 34);
      }
    }
    if (!open) return;
    // Ô dưới con trỏ: khung "rê chuột" (sáng hơn).
    const hv = this.garden.shopHover;
    v.bag.forEach((s, i) => s.frame.setFrame(hv?.side === 'bag' && hv.index === i ? 'slot-hover' : 'slot'));
    v.box.forEach((s, i) => s.frame.setFrame(hv?.side === 'box' && hv.index === i ? 'slot-hover' : 'slot'));
    setCloseHover(v.chrome.close, this.garden.windowCloseHover, WINDOW_CHROME.closeSize);
    const status = this.garden.shopStatus;
    if (v.status.text !== status.text) v.status.setText(status.text);
    v.status.setColor(cssColor(status.warn ? 'vermilion' : 'earth'));
  }

  /** T-093/T-092: bảng tên khu ("Nhà Tý") — khung giấy nhỏ giữa trên màn, hiện đậm rồi mờ dần (GardenScene giữ nhịp). */
  private buildAreaBanner(): void {
    this.areaBannerFrame = new UiFrame(this, 'panel-tooltip', { x: -100, y: -AREA_BANNER.h / 2, w: 200, h: AREA_BANNER.h });
    this.areaBannerText = this.add.text(0, -2, '', { ...paperText.title, fontSize: '36px' }).setOrigin(0.5);
    this.areaBanner = this.add
      .container(gameConfig.gameWidth / 2, AREA_BANNER_Y, [this.areaBannerFrame.obj, this.areaBannerText])
      .setDepth(40)
      .setVisible(false);
  }

  private updateAreaBanner(): void {
    const a = this.garden.areaBannerOpacity;
    if (a <= 0.001) {
      if (this.areaBanner.visible) this.areaBanner.setVisible(false);
      return;
    }
    const text = this.garden.areaBannerText;
    if (this.areaBannerText.text !== text) {
      this.areaBannerText.setText(text);
      const size = fitNineSize('panel-tooltip', Math.ceil(this.areaBannerText.width) + AREA_BANNER.padX * 2, AREA_BANNER.h);
      this.areaBannerFrame.setRect({ x: -size.w / 2, y: -size.h / 2, w: size.w, h: size.h });
    }
    this.areaBanner.setAlpha(a).setVisible(true);
  }

  /** Cỡ chữ nhỏ nhất (px) trong cửa sổ đang mở — cho QA kiểm "chữ ≥ 24px". */
  private shopMinFontPx(): number {
    const sw = this.garden.shopWindow;
    const win = sw === 'sellBox' ? this.sellView.win : sw === 'chest' ? this.chestView.win : sw === 'seedStall' ? this.stallWindow : null;
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

  /**
   * Thanh Sức góc trên trái (ảnh mẫu T-091): icon bắp tay + ống tre 3-slice. Ruột vẽ DƯỚI ảnh ống tre (cửa sổ giữa ống
   * trong suốt): nền mực phủ cửa sổ, rồi ruột màu theo tỷ lệ; số "92/100" trắng điệp viền mực đè giữa.
   */
  private buildStaminaBar(): void {
    const bar = staminaBarRect();
    const g = staminaBarGeometry(bar, 1);
    const backing = this.add.graphics();
    backing.fillStyle(palette.ink, 1).fillRect(g.backing.x, g.backing.y, g.backing.w, g.backing.h);
    this.staminaFill = this.add.graphics();
    new UiFrame(this, 'hud-bamboo-bar', bar);
    const iconC = STAMINA_BAR.margin + STAMINA_BAR.icon / 2;
    addUiIcon(this, 'icon-stamina', iconC, iconC, STAMINA_BAR.icon);
    this.staminaText = this.add
      .text(g.window.x + g.window.w / 2, g.window.y + g.window.h / 2, '', {
        fontFamily: uiFontFamily,
        fontSize: '28px',
        fontStyle: 'bold',
        color: cssColor('paper'),
        stroke: cssColor('ink'),
        strokeThickness: 5,
      })
      .setOrigin(0.5);
  }

  /** Vẽ lại ruột thanh + chữ khi Sức đổi (không vẽ Graphics mỗi frame). */
  private updateStaminaBar(): void {
    const s = this.garden.stamina;
    if (s.current === this.staminaDrawn) return;
    this.staminaDrawn = s.current;
    const ratio = staminaRatio(s);
    const { staminaBarYellowBelow: yb, staminaBarRedBelow: rb } = gameConfig;
    this.staminaDrawnBand = staminaBand(ratio, yb, rb);
    this.staminaDrawnColor = staminaFillColor(ratio, yb, rb);
    const f = staminaBarGeometry(staminaBarRect(), ratio).fill;
    const g = this.staminaFill;
    g.clear();
    if (f.w > 0) {
      g.fillStyle(this.staminaDrawnColor, 1).fillRect(f.x, f.y, f.w, f.h);
      // Vệt sáng phẳng trên mép ruột cho có khối (như ảnh mẫu).
      g.fillStyle(palette.paper, 0.22).fillRect(f.x, f.y, f.w, Math.round(f.h * 0.3));
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

  /** Một ô: khung 9-slice (thường / đang chọn / rê chuột), icon ở giữa, số lượng góc dưới-phải, số phím góc trên-trái. */
  private makeSlot(r: Rect, keyLabel: string | null): SlotView {
    const s = r.w;
    const frame = new UiFrame(this, 'slot', { x: -s / 2, y: -s / 2, w: s, h: s });
    const icon = this.add.graphics();
    // Ảnh icon thật (nông cụ): tạo sẵn, ẩn; drawSlot chỉ đổi texture + hiện/ẩn (không tạo object mới mỗi lần vẽ lại).
    const image = this.add.image(0, 0, '__DEFAULT').setVisible(false);
    const count = this.add.text(s / 2 - 8, s / 2 - 4, '', slotText.count).setOrigin(1, 1);
    const parts: Phaser.GameObjects.GameObject[] = [frame.obj, icon, image, count];
    if (keyLabel) parts.push(this.add.text(-s / 2 + 10, -s / 2 + 4, keyLabel, slotText.key).setOrigin(0, 0).setName(SLOT_KEY_LABEL));
    const root = this.add.container(r.x + s / 2, r.y + s / 2, parts);
    return { root, frame, icon, image, count, size: s };
  }

  /** Ô khóa (gùi chưa nâng): khung xám tro + icon ổ khóa giữa ô. */
  private makeLockedSlot(r: Rect): Phaser.GameObjects.Container {
    const s = r.w;
    const frame = new UiFrame(this, 'slot-locked', { x: -s / 2, y: -s / 2, w: s, h: s });
    return this.add.container(r.x + s / 2, r.y + s / 2, [frame.obj, addUiIcon(this, 'icon-lock', 0, 0, LOCK_ICON)]);
  }

  /** Cửa sổ gùi (E): khung giấy giữa màn, 2 hàng × 9 ô (hàng trên = hotbar), tooltip món, nút X. */
  private buildBagWindow(): void {
    const n = this.garden.inventory.slots.length;
    const panel = bagPanelRect(n);
    this.bagChrome = this.paperWindow(panel);
    const parts: Phaser.GameObjects.GameObject[] = [...this.bagChrome.parts];
    // Vạch ngăn hàng hotbar với hàng dưới.
    if (n > gameConfig.hotbarSlots) {
      const r0 = bagSlotRect(0, n);
      const r1 = bagSlotRect(gameConfig.hotbarSlots, n);
      const y = (r0.y + r0.h + r1.y) / 2;
      const g = this.add.graphics();
      g.lineStyle(3, palette.earth, 0.5).lineBetween(panel.x + BAG_WINDOW.pad, y, panel.x + panel.w - BAG_WINDOW.pad, y);
      parts.push(g);
    }
    parts.push(this.windowTitle(panel, 'Gùi'));
    parts.push(
      this.add.text(panel.x + panel.w - WINDOW_CHROME.titleX, panel.y + WINDOW_CHROME.titleY + 2, 'Hàng trên = thanh 1–9', paperText.note).setOrigin(1, 0.5),
    );
    parts.push(this.add.text(panel.x + panel.w / 2, panel.y + panel.h - 50, 'Rê chuột lên món để xem tên · E / Esc: đóng', paperText.note).setOrigin(0.5));
    this.bagWindow = this.add.container(0, 0, parts).setDepth(50).setVisible(false);
    for (let i = 0; i < n; i++) {
      const view = this.makeSlot(bagSlotRect(i, n), i < gameConfig.hotbarSlots ? String(i + 1) : null);
      this.bagSlots.push(view);
      this.bagWindow.add(view.root);
    }
    for (let i = n; i < bagRows(n) * gameConfig.hotbarSlots; i++) this.bagWindow.add(this.makeLockedSlot(bagSlotRect(i, n)));

    // Tooltip món (gùi + hotbar): khung giấy nhỏ, tên món (đậm) + dòng phụ "Bán 8 quan · Ăn +8 Sức".
    this.tooltipFrame = new UiFrame(this, 'panel-tooltip', { x: -100, y: -TOOLTIP.h2 / 2, w: 200, h: TOOLTIP.h2 });
    this.tooltipText = this.add.text(0, 0, '', { ...paperText.body, fontSize: '28px' }).setOrigin(0.5);
    this.tooltipDetail = this.add.text(0, 0, '', paperText.note).setOrigin(0.5);
    this.tooltip = this.add.container(0, 0, [this.tooltipFrame.obj, this.tooltipText, this.tooltipDetail]).setDepth(60).setVisible(false);
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
    // Khung ô: đang chọn > rê chuột > thường (hotbar + cửa sổ gùi). setFrame không làm gì khi không đổi.
    const hoverHot = this.garden.hotbarHoverSlot;
    this.hotbar.forEach((v, i) => v.frame.setFrame(slotFrameName(i === inv.selected, i === hoverHot)));
    const bagOpen = this.garden.bagOpen;
    this.bagWindow.setVisible(bagOpen);
    if (bagOpen) {
      const hoverBag = this.garden.bagHoverSlot;
      this.bagSlots.forEach((v, i) => v.frame.setFrame(slotFrameName(i === inv.selected, i === hoverBag)));
      setCloseHover(this.bagChrome.close, this.garden.windowCloseHover, WINDOW_CHROME.closeSize);
    }
    this.bagButtonFrame.setFrame(BUTTON_FRAME[buttonState(true, this.garden.bagButtonHover, this.garden.primaryDown)]);
    this.updateStaminaBar();
    this.updateClock(dt);
    this.updatePauseWindow();
    this.cheatView?.update(this.garden.cheatPanelModel);
    this.updateNight(dt);
    this.updateVignette(dt);
    this.updateTooltip();
    this.updateFlyers(dt);
    this.updateCoins();
    this.updateBounces(dt);
  }

  /**
   * T-027: vẽ xu bay theo trạng thái GardenScene (systems/juice.ts — Vườn tiến thời gian, Tạm dừng thì xu đứng). Đồng nào chưa
   * cất cánh / đã chạm thì ẩn. Xu "lật" (co ngang theo cos) cho có cảm giác đồng xu xoay; bay vào thì nhỏ dần cho vừa ô.
   */
  private updateCoins(): void {
    const s = this.garden.coins;
    const params = this.garden.coinParams;
    let used = 0;
    for (const b of s.batches) {
      for (const f of b.flights) {
        const p = coinProgress(b, f, params);
        if (p < 0 || p >= 1 || f.landed) continue;
        const c = this.coinSprites[used];
        if (!c) break;
        used++;
        const pt = flightPoint(f.from, f.to, p, params.arcPx, this.flightPt);
        const size = b.kind === 'in' ? 1.15 - 0.3 * p : 1 - 0.2 * p;
        const flip = 0.35 + 0.65 * Math.abs(Math.cos(Math.PI * 3 * p));
        c.obj
          .setPosition(pt.x, pt.y)
          .setScale(c.base * size * flip, c.base * size)
          .setAlpha(b.kind === 'out' && p > 0.75 ? 1 - (p - 0.75) / 0.25 : 1)
          .setVisible(true);
      }
    }
    for (let i = used; i < this.coinSprites.length; i++) if (this.coinSprites[i].obj.visible) this.coinSprites[i].obj.setVisible(false);
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

  /**
   * Tooltip món: cửa sổ gùi mở → món dưới con trỏ trong gùi (BUG-011: hàng trên hiện dưới ô, hàng dưới hiện trên ô);
   * không có cửa sổ nào → món dưới con trỏ trên hotbar (hiện ngay trên ô). Chỉ dựng lại khi ô / món đổi.
   */
  private updateTooltip(): void {
    const g = this.garden;
    const busy = g.shopWindow !== null || g.pauseMenuOpen || g.cheatPanelOpen || g.nightPhase !== 'none';
    const fromBag = g.bagOpen;
    const slot = busy ? -1 : fromBag ? g.bagHoverSlot : g.hotbarHoverSlot;
    const stack = slot >= 0 ? g.inventory.slots[slot] : null;
    const sig = stack ? `${fromBag ? 'b' : 'h'}|${slot}|${stack.id}` : '';
    if (sig === this.tooltipSig) return;
    this.tooltipSig = sig;
    if (!stack) {
      this.tooltip.setVisible(false);
      return;
    }
    const t = itemTooltipText(stack.id);
    this.tooltipText.setText(t.name);
    this.tooltipDetail.setText(t.detail).setVisible(t.detail !== '');
    const two = t.detail !== '';
    const h = two ? TOOLTIP.h2 : TOOLTIP.h1;
    const size = fitNineSize('panel-tooltip', Math.ceil(Math.max(this.tooltipText.width, two ? this.tooltipDetail.width : 0)) + TOOLTIP.padX * 2, h);
    this.tooltipFrame.setRect({ x: -size.w / 2, y: -size.h / 2, w: size.w, h: size.h });
    this.tooltipText.setY(two ? -15 : -2);
    this.tooltipDetail.setY(19);
    let x: number;
    let y: number;
    if (fromBag) {
      const r = bagSlotRect(slot, g.inventory.slots.length);
      const topRow = slot < gameConfig.hotbarSlots;
      x = r.x + r.w / 2;
      y = topRow ? r.y + r.h + size.h / 2 + 2 : r.y - size.h / 2 - 2;
    } else {
      const r = hotbarSlotRect(slot);
      x = r.x + r.w / 2;
      y = r.y - TOOLTIP.gap - size.h / 2;
    }
    // Không tràn mép màn.
    x = Math.min(gameConfig.gameWidth - size.w / 2 - 8, Math.max(size.w / 2 + 8, x));
    this.tooltip.setPosition(x, y).setVisible(true);
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

  /**
   * T-027: quầng sáng sau icon + vệt sáng: chấm k nằm ở chỗ icon đã qua k × harvestTrailGapSeconds trước (cùng đường bay —
   * tính lại từ hàm đường bay, không phải nhớ vị trí cũ), nhỏ và mờ dần về đuôi. `p` < 0 → ẩn hết.
   */
  private placeTrail(f: Flyer, from: Point, to: Point, p: number): void {
    const dur = gameConfig.harvestFlySeconds;
    const n = f.trail.length;
    const glowBase = gameConfig.harvestTrailSizePx / FX_GLOW_SIZE;
    if (p < 0) {
      f.glow.setVisible(false);
      for (const t of f.trail) t.setVisible(false);
      return;
    }
    const pt = flightPoint(from, to, p, FLY_ARC, this.flightPt);
    f.glow.setPosition(pt.x, pt.y).setScale(glowBase * 1.25).setAlpha(gameConfig.harvestTrailAlpha).setVisible(true);
    for (let k = 1; k <= n; k++) {
      const dot = f.trail[k - 1];
      const q = trailProgress(p, k, gameConfig.harvestTrailGapSeconds, dur);
      if (q < 0) {
        dot.setVisible(false);
        continue;
      }
      const fade = trailFade(k, n);
      flightPoint(from, to, q, FLY_ARC, this.flightPt);
      dot.setPosition(this.flightPt.x, this.flightPt.y).setScale(glowBase * (0.35 + 0.65 * fade)).setAlpha(gameConfig.harvestTrailAlpha * fade).setVisible(true);
    }
  }

  private updateFlyers(dt: number): void {
    const dur = gameConfig.harvestFlySeconds;
    const start = this.flyFrom;
    const to = this.flyTo;
    for (const f of this.flyers) {
      if (f.t <= 0) continue;
      f.t = Math.max(0, f.t - dt);
      const toObj = f.target >= 0 ? this.hotbar[f.target].root : this.bagButton;
      to.x = toObj.x;
      to.y = toObj.y;
      start.x = f.fromX;
      start.y = f.fromY;
      const p = 1 - f.t / dur; // 0 → 1
      // Đi đều theo ngang, vồng lên theo hình sin rồi rơi vào ô; nhỏ dần cho vừa ô (systems/juice.ts flightPoint).
      // Vệt sáng vẽ TRƯỚC (dùng điểm tạm flightPt), icon sau; tới nơi thì tắt cả vệt.
      this.placeTrail(f, start, to, f.t > 0 ? p : -1);
      const pt = flightPoint(start, to, p, FLY_ARC, this.flightPt);
      this.placeFlyer(f, pt.x, pt.y, 1.2 - 0.35 * p);
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
      selectedFrame: this.hotbar.findIndex((v) => v.frame.frameName === 'slot-selected'),
      hotbarCounts: this.hotbar.map((v) => v.count.text),
      hotbarImages: this.hotbar.map((v) => (v.image.visible ? v.image.texture.key : null)),
      hotbarFrames: this.hotbar.map((v) => v.frame.frameName),
      staminaText: this.staminaText?.text ?? '',
      staminaBand: this.staminaDrawnBand,
      staminaFillColor: this.staminaDrawnColor,
      staminaFillRatio: this.staminaDrawn < 0 || !garden ? 0 : this.staminaDrawn / garden.stamina.max,
      vignetteAlpha: this.vignette?.visible ? this.vignette.alpha : 0,
      eatBounces: this.eatBounces,
      lastEatSlot: this.lastEatSlot,
      clockText: this.clockText?.text ?? '',
      dayText: this.dayText?.text ?? '',
      clockColor: this.clockColor,
      clockWarn: this.clockWarn,
      clockIcon: this.clockIconDrawn ?? 'sun',
      seasonIcon: this.seasonDrawn ?? 'icon-season-dry',
      clockBounds: clockPanelRect(),
      pauseVisible: this.pauseWindow?.visible ?? false,
      pauseButtonHover: this.pauseResume ? this.pauseResume.currentState === 'hover' || this.pauseResume.currentState === 'pressed' : false,
      pauseSavedText: this.pauseSavedText?.text ?? '',
      pauseRestartHover: this.pauseRestart ? this.pauseRestart.currentState === 'hover' || this.pauseRestart.currentState === 'pressed' : false,
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
      sellBoxVisible: this.sellView?.win.visible ?? false,
      seedStallVisible: this.stallWindow?.visible ?? false,
      sellTotalText: this.sellView?.total.text ?? '',
      shopStatusText:
        garden?.shopWindow === 'sellBox'
          ? (this.sellView?.status.text ?? '')
          : garden?.shopWindow === 'chest'
            ? (this.chestView?.status.text ?? '')
            : (this.stallStatusText?.text ?? ''),
      sellBoxCounts: (this.sellView?.box ?? []).map((v) => v.count.text),
      stallButtons: (garden?.seedStallItems ?? []).map((it, i) => ({
        text: this.stallButtons[i]?.label.text ?? '',
        enabled: garden ? hasMoney(garden.wallet, seedPriceOf(it.cropId) ?? 0) : false,
        hover: garden?.stallHover === i,
      })),
      shopMinFontPx: garden && this.sellView ? this.shopMinFontPx() : 0,
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
      summaryButtonText: this.summaryButton?.label.text ?? '',
      summaryButtonHover: this.summaryButton ? this.summaryButton.currentState === 'hover' || this.summaryButton.currentState === 'pressed' : false,
      nightMinFontPx: this.summaryWindow ? this.nightMinFontPx() : 0,
      areaBanner: this.areaBanner?.visible ? this.areaBannerText.text : '',
      closeHover: garden?.windowCloseHover ?? false,
      trailVisible: this.flyers.reduce((n, f) => n + f.trail.filter((t) => t.visible).length, 0),
      coinsVisible: this.coinSprites.filter((c) => c.obj.visible).length,
      moneyScale: this.moneyText?.scaleX ?? 1,
      moneySpotlight: this.moneySpotlight,
      summaryRecord: this.summaryWindow?.visible && this.summaryRecordText.visible ? this.summaryRecordText.text : '',
      summaryRecordAlpha: this.summaryRecordText?.visible ? this.summaryRecordText.alpha : 0,
      summaryRecordScale: this.summaryRecordText?.visible ? this.summaryRecordText.scaleX : 0,
      cheatPanelVisible: this.cheatView?.visible ?? false,
      cheatButtonTexts: this.cheatView?.buttonTexts ?? [],
      cheatStatusText: this.cheatView?.statusText ?? '',
      cheatNoticeText: this.cheatView?.noticeText ?? '',
    };
  }
}

/** Khung ô theo trạng thái: đang chọn > rê chuột > thường. */
function slotFrameName(selected: boolean, hover: boolean): NineSliceName {
  return selected ? 'slot-selected' : hover ? 'slot-hover' : 'slot';
}

/** Số món `id` trong gùi (đếm thẳng — HUD chỉ đọc). */
function countInBag(garden: GardenScene, id: string): number {
  let n = 0;
  for (const st of garden.inventory.slots) if (st && st.id === id) n += st.count;
  return n;
}
