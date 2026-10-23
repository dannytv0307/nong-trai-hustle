// Vườn thử (T-001): bản đồ 48×32 ô dựng bằng code, nhân vật {ten} đi WASD có va chạm
// (Arcade Physics), camera bám theo trong biên bản đồ, hoạt ảnh đi bằng code (D-020).
// T-002: rê chuột chỉ ô (viền sáng trong tầm / xám ngoài tầm), click để cuốc ruộng.
// T-002 phần 2 (D-022): cuốc là "việc nặng" — một click, {ten} tự bổ 6 nhát (≈ 5 giây), thanh tiến độ 6 đốt,
// đất đổi 3 nấc, WASD = bỏ dở (ô giữ số nhát), giữ chuột rê xếp hàng tối đa 3 ô.
// T-003: click ô ruộng → nhân vật tự chọn việc (cuốc / gieo hạt đang chọn / tưới / hái / dọn cây héo). Gieo, tưới,
// hái, dọn là việc NHANH (actionDuration, hàng chờ actionQueueMax, vừa giữ chuột vừa đi được). Gùi + hotbar
// (systems/inventory.ts) do scene này giữ; GardenHudScene vẽ hotbar/cửa sổ gùi. Phím thử G (dev) = qua một đêm.
// T-004: thanh Sức (systems/stamina.ts) — mỗi việc tốn Sức (cuốc trừ 4 một lần ở nhát cuối, D-022), thiếu Sức thì
// "đuối rồi…", hết Sức thì đuối (đi chậm, viền màn tối, chửi thề 1 lần). Chuột phải = ăn món đang chọn. F8 (dev) −20 Sức.
// T-005: đồng hồ ngày (systems/time.ts) chạy 6h → 24h trong dayLengthSeconds, dừng khi có "lý do dừng" (systems/pause.ts:
// gùi, Tạm dừng…). Lớp màu trời phủ thế giới (HUD nằm scene khác nên không bị phủ). Esc / mất focus / ẩn tab → cửa sổ
// Tạm dừng: cả thế giới đứng yên (việc, bụi, bong bóng, vật lý, anim), phím bấm lúc dừng bị bỏ. F9 (dev) +1 giờ.
// T-006: tiền (systems/economy.ts), thùng bán cạnh nhà + sạp hạt tạm ở cổng (systems/interact.ts): click trong tầm hoặc F
// khi đứng cạnh → cửa sổ (HUD vẽ, scene này giữ trạng thái + xử lý click). Đồ trong thùng chưa thành tiền — T-007 bán lúc
// qua đêm (sellBoxContents). Mở cửa sổ = "lý do dừng" sellBox / seedStall: đồng hồ dừng, nhân vật đứng.
// T-007: giường (click/F từ 18h → hỏi "Đi ngủ?"), ngủ gục lúc 24h (nằm ra đất, Zzz, màn tối), qua đêm bằng MỘT hàm thuần
// (systems/overnight.ts — ruộng + bán thùng + ngày mới + Sức; phím G cũng gọi nó), màn tổng kết ngày (HUD vẽ, scene giữ
// trạng thái + phím), sáng ra đứng cạnh giường. Chuỗi "đêm" là một máy trạng thái nhỏ `nightPhase` (xem updateNight).
// T-008: tự lưu vào localStorage (systems/save.ts + net/saveLocal.ts, cấu trúc save ở @bph/shared): mỗi autoSaveIntervalSeconds,
// khi Tạm dừng / mất focus / ẩn tab / đóng tab (pagehide), trước khi ngủ, ngay lúc qua đêm và sau "Ngày mới". Mở game có save
// thì nạp lại (create). Cửa sổ Tạm dừng có "Đã lưu lúc…" + nút "Chơi lại từ đầu" (hỏi Có/Không → xóa save, dựng lại scene mới).
// T-093: cảnh trong nhà {ten} (systems/house.ts) — phòng là một KHU nằm dưới bản đồ Vườn trong cùng thế giới; bước vào bậc
// thềm (bấm W) → màn mờ (systems/areas.ts, dùng chung cho các khu sau) → trong nhà: giường (ngủ), rương (cửa sổ 2 lưới
// như thùng bán), bếp rơm (đặt sẵn, nấu ở T-048), hũ gạo, nón ông nội. Ra khe cửa (bấm S) → đứng trước nhà. Save nhớ khu.
// T-041: chỗ lưu chặng 4 (`stage4`: level, nhiệm vụ, cờ, độ bền nông cụ, bậc đồ, gia đình, thời tiết — save version 5) +
// bảng Thử (chỉ bản dev, F2 / `): nút khai báo ở data/cheatPanel.json, việc thuần ở systems/cheats.ts, HUD vẽ (CheatPanelView).
import Phaser from 'phaser';
import {
  bendHandOffset,
  CROP_FRAME,
  HERO_ACTION_FRAME,
  HERO_FRAME,
  heroActionKey,
  heroTextureKey,
  heroTurnKey,
  heroWalkKey,
  HOUSE_INTERIOR_KEY,
  TILE_SHEET,
  TILE_SHEETS,
  tileKey,
  type TileSheetName,
} from '../config/assets';
import { gameConfig } from '../config/gameConfig';
import { cssColor, palette } from '../config/palette';
import { textStyles, uiFontFamily } from '../config/theme';
import bubbles from '../data/bubbles.json';
import { InputController } from '../input/InputController';
import {
  blockedGrid,
  cornerNudge,
  gardenLayout as L,
  houseDoorClickRect,
  isHouseDoorTile,
  tileOf,
  tileSolidGrid,
  type TileRect,
} from '../systems/garden';
import {
  clearWithered,
  createFarm,
  cropStage,
  facingToward,
  harvestPlot,
  inFarmWorkRange,
  inReach,
  isRipe,
  jobFor,
  plantSeed,
  plotAt,
  strikeTill,
  strikesRemaining,
  tilledCount,
  tillStage,
  waterPlot,
  type CropStage,
  type FarmPlot,
  type OvernightReport,
  type TileJob,
} from '../systems/farm';
import { CROPS, cropById, growDaysOf } from '../systems/crops';
import { createPitchLadder, nextLadderStep, tickPitchLadder } from '../systems/pitchLadder';
import { addItem, canAdd, countOf, createInventory, moveFromSlot, removeFromSlot, scrollSelect, selectSlot, setSlot, type Inventory } from '../systems/inventory';
import {
  allItemIds,
  canTillWithSelected,
  cropItemId,
  cropOfSeed,
  createStartInventory,
  isSeedItem,
  isToolItem,
  itemInfo,
  pickSeedSlot,
  seedItemId,
  selectedToolUse,
  staminaRestoreOf,
  toolOf,
} from '../systems/items';
import { actionAnimFor, actionFrameAt, isActionTextureKey, showActionPose, type ActionAnim } from '../systems/toolAnim';
import { borderFenceLines, canopyCoversHero, fencePieces, HEDGE_MID_COLS, sellBasketKey, type FencePiece } from '../systems/propArt';
import { propMarker, propPlacement, propSpec } from '../systems/props';
import {
  houseExitSpot,
  houseExitStandSpot,
  houseNavGrid,
  houseObject,
  houseOrigin,
  houseSize,
  houseTargetAt,
  houseTargetInReach,
  isFreeHouseSpot,
  isHouseDoorAt,
  nearestHouseTarget,
  resolveHouseLayout,
  shouldEnterHouse,
  shouldExitHouse,
  type HouseTarget,
} from '../systems/house';
import {
  areaBannerAlpha,
  areaName,
  createAreaTransition,
  isAreaId,
  isTransitioning,
  startAreaTransition,
  stepAreaTransition,
  transitionAlpha,
  type AreaId,
} from '../systems/areas';
import {
  buySeeds,
  canSellItem,
  createWallet,
  hasMoney,
  seedPriceOf,
  sellBoxContents,
  sellBoxTotal,
  sellPriceOf,
  setMoney,
  type SaleReport,
} from '../systems/economy';
import { nearestKeyTarget, targetAt, targetInReach, type InteractTarget } from '../systems/interact';
import { canSleepAt, runOvernight, type OvernightCause, type OvernightSummary } from '../systems/overnight';
import {
  acceptPress,
  allRevealed,
  createReveal,
  moneyShown,
  recordProgress,
  saleDetailText,
  summaryLines,
  tickReveal,
  type RevealState,
  type RevealTiming,
  type SummaryLine,
} from '../systems/daySummary';
import {
  coinsInFlight,
  createCoinState,
  dropIncomingCoins,
  heldCoinMoney,
  ripeCueCycle,
  ripeCueOffset,
  ripeCueProgress,
  ripeHop,
  sparkleOffset,
  sparkleScale,
  startCoinBatch,
  stepCoins,
  type CoinLanding,
  type CoinParams,
  type CoinState,
} from '../systems/juice';
import { createRecords, noteDaySale } from '../systems/records';
import { ensureSparkleTexture, FX_SPARKLE, FX_SPARKLE_SIZE } from '../ui/fxTextures';
import seedStallJson from '../data/seedStall.json';
import type { SeedStallItem } from '../data/types';
import {
  canAfford,
  consume,
  createStamina,
  isFull,
  jobStaminaCost,
  restore,
  setStamina,
  staminaBand,
  staminaRatio,
  walkSpeedMultiplier,
  type JobStaminaCosts,
  type StaminaBand,
  type StaminaChange,
} from '../systems/stamina';
import { bubbleCanShow, bubbleStyleOf, createBarkState, pickBarkLine, recordBark, shouldBark, type BubbleKind, type BubbleStyle } from '../systems/bubbles';
import { BUBBLE_TEXT_PAD, bubbleBodyLayout, bubbleFrames, dashedRectSegments, fixedBubbleLayout, fixedBubbleWrapWidth, uiKey } from '../ui/uiSpec';
import { canNineSlice, hasUiTexture, UiFrame, warnUiFallback } from '../ui/uiKit';
import {
  bagPanelRect,
  bagSlotAt,
  bagSlotRect,
  bagButtonRect,
  hotbarSlotAt,
  hotbarSlotRect,
  isOverHud,
  moneyCoinCenter,
  summaryCoinOrigin,
  pausePanelRect,
  pauseRestartButtonRect,
  pauseResumeButtonRect,
  restartConfirmButtonAt,
  restartConfirmButtonRect,
  volumeButtonAt,
  volumeButtonChannel,
  volumeButtonRect,
  type VolumeButtonId,
  sellPanelRect,
  sellSlotAt,
  sellSlotRect,
  sleepButtonAt,
  sleepButtonRect,
  sleepPromptRect,
  restartConfirmRect,
  summaryButtonRect,
  summaryPanelRect,
  windowCloseRect,
  stallButtonAt,
  stallButtonRect,
  stallPanelRect,
  type Rect,
  type SellSide,
} from '../ui/hudLayout';
import {
  addGameHours,
  advanceDayClock,
  clockHour,
  createDayClock,
  dayLabel,
  formatClock,
  isDayOver,
  isPassOutWarning,
  setGameHour,
  skyPhase,
  skyTint,
  type SkyPhase,
} from '../systems/time';
import { PauseReasons, resolveEsc, shouldAutoPause, type PauseCause, type PauseReason } from '../systems/pause';
import { cropColor, drawCrop, mixColor } from '../ui/itemArt';
import {
  buildGroundKinds,
  concaveCorners,
  coreCell,
  grassEdgeMask,
  isTilledLook,
  KIND_TEXTURE,
  SOIL_TEXTURES,
  soilLookIndex,
  tilledEdgeMask,
  type GroundKind,
} from '../systems/groundTiles';
import { cropVisual, OWN_FRAME_RIPE, thirstyTint, type CropVisual } from '../systems/cropArt';
import type { GardenHudScene, HudDebugState } from './GardenHudScene';
import { facingFromDirection, facingFromVector, moveVelocity, type Facing } from '../systems/movement';
import { boxFitsGrid, navFromBoolGrid, PathFinder, type NavGrid } from '../systems/pathfind';
import {
  cancelClickMove,
  createClickMove,
  planFarmStand,
  planWalk,
  startClickMove,
  stepClickMove,
  type ClickMoveParams,
  type WalkGoal,
} from '../systems/clickMove';
import { pulseAlpha } from '../systems/pulse';
import {
  actionPose,
  cancelTileAction,
  capStrikesIfCurrent,
  createTileActionEvents,
  createTileActionState,
  isBusy,
  isPending,
  requestTile,
  stepTileAction,
  type TileActionParams,
  type TileXY,
} from '../systems/tileAction';
import { createTurnAnimState, startTurn, stepTurn, turnFrameIndex, type TurnDiagonal } from '../systems/turnAnim';
import {
  clearWalkBob,
  createWalkAnimState,
  isSideFacing,
  onWalkFrame,
  smoothSpeedRatio,
  stepWalkAnim,
  walkTimeScale,
  type WalkAnimParams,
} from '../systems/walkAnim';
import { physicsDebugFromSearch } from '../utils/sceneSelect';
import { AudioManager, type AudioDebugState, type Soundscape } from '../audio/AudioManager';
import { roosterKey } from '../config/soundCues';
import {
  chooseAmbience,
  chooseMusic,
  crossedHour,
  footstepSurface,
  newSeed,
  roosterKindForDay,
  volumeLabel,
  type AudioChannel,
  type RoosterKind,
  type RoosterRules,
  type SoundscapeRules,
} from '../systems/audio';
import { applySave, captureSave, type SaveRules, type SaveWorld } from '../systems/save';
import { clearLocalSave, loadLocalSave, SAVE_KEY, writeLocalSave } from '../net/saveLocal';
import { GAME_SAVE_VERSION, type GameSave, type SaveFamily, type SaveProgress, type SaveToolState, type SaveWeather } from '@bph/shared';
import { activeFlags, createStage4State } from '../systems/progress';
import {
  applyCheat,
  CHEAT_BUTTONS,
  CHEAT_ROWS,
  cheatButtonLabel,
  cheatButtonWidths,
  cheatStatusLine,
  defaultPickIndex,
  pickedItem,
  type CheatRules,
  type CheatState,
} from '../systems/cheats';
import { cheatButtonAt, cheatButtonSlots, cheatPanelRect } from '../ui/cheatLayout';
import type { CheatPanelModel } from '../ui/CheatPanelView';

const T = gameConfig.tileSize;
/** Mỗi ảnh tile thử 256×256 = 4×4 ô 64px (Art Bible §9.1). */

// Lớp vẽ (depth). Vật đứng (nhân vật, cây, tường) có depth = toạ độ Y chân → ai thấp hơn trên
// màn hình (gần người xem hơn) thì vẽ đè lên. Mặt đất và đồ nằm sát đất dùng depth âm.
const DEPTH_GROUND = -1000;
const DEPTH_GROUND_DECOR = -900;
const DEPTH_SHADOW = -800;
/** Viền ô dưới con trỏ: trên mặt đất + viền ruộng, dưới bóng/nhân vật. */
const DEPTH_TILE_HIGHLIGHT = -850;
/** Bụi đất văng khi cuốc: bay lên trước mặt mọi thứ sát đất (chưa cần đúng lớp với nhân vật). */
const DEPTH_TILL_DUST = 5000;
/** Thanh tiến độ cuốc + số hàng chờ: nổi trên cả nhân vật và cây (thông tin, không phải vật trong cảnh). */
const DEPTH_TILL_UI = 6000;
/** Ô "nảy" lúc cuốc xong: ngay trên các lớp nền. */
const DEPTH_TILL_MARKS = DEPTH_GROUND + 2;
/** Bong bóng chữ trên đầu nhân vật: nổi trên mọi thứ trong cảnh. */
const DEPTH_BUBBLE = 7000;
/**
 * Lớp màu trời (T-005): phủ lên mặt đất, cây, nhân vật, bụi — nhưng DƯỚI thanh tiến độ cuốc, chữ bay và bong bóng
 * (thông tin cần đọc rõ cả lúc tối). HUD nằm ở scene GardenHud vẽ sau nên không bao giờ bị phủ.
 */
const DEPTH_SKY = 5500;
/** Gốc cây nằm ở bao nhiêu phần chiều cao ô (tính từ mép trên) — cây "đứng" trên luống, depth theo gốc. */
const CROP_BASE = 0.78;
/** Pool giọt nước / hạt rơi (tưới, gieo). */
const DROP_POOL = gameConfig.waterDropCount * 3;
/** Pool hình "cây bật lên" khi hái — đủ cho cả hàng chờ việc nhanh. */
const POP_POOL = gameConfig.actionQueueMax + 2;
// Âm thanh (T-026): mọi tiếng phát qua AudioManager theo tên cue (config/soundCues.ts) — tưới, gieo, hái, càu nhàu, xu…
/** Giữ bao nhiêu lần hái gần nhất trong debugState (để test kiểm thang cao độ). */
const HARVEST_SFX_LOG = 12;
/** T-026: luật chọn nhạc nền / tiếng nền theo giờ + khu. */
const SOUNDSCAPE_RULES: SoundscapeRules = {
  nightStartHour: gameConfig.nightMusicStartHour,
  dayStartHour: gameConfig.dayStartHour,
  houseDayMusicMultiplier: gameConfig.houseDayMusicMultiplier,
};
/** T-026: luật chọn kiểu gà gáy mỗi sáng (audio list AUD-SFX-109). */
const ROOSTER_RULES: RoosterRules = {
  weights: gameConfig.roosterWeights,
  firstDayKind: gameConfig.roosterFirstDayKind,
  repeatableKind: gameConfig.roosterFirstDayKind,
  rainyFavorite: gameConfig.roosterRainyFavorite,
  rainyFavoriteMultiplier: gameConfig.roosterRainyFavoriteMultiplier,
};
/** Sức tốn của từng việc trên ô (GDD §3.2). */
const JOB_COSTS: JobStaminaCosts = {
  till: gameConfig.staminaCostTill,
  plant: gameConfig.staminaCostPlant,
  water: gameConfig.staminaCostWater,
  harvest: gameConfig.staminaCostHarvest,
};
/** Pool chữ "+8 Sức" / "−4 Sức" bay lên. */
const FLOAT_POOL = 6;
/** Giữ bao nhiêu chữ bay gần nhất trong debugState. */
const FLOAT_LOG = 8;

/** Lùi viền ô vào trong (px) = nửa bề dày viền lót lớn nhất, để viền không lấn sang ô bên. */
const HIGHLIGHT_INSET = Math.ceil(
  Math.max(...gameConfig.tileHighlightWidth.map((w, i) => w + gameConfig.tileHighlightOutline[i] * 2)) / 2,
);
/** Giọt mồ hôi "xanh nhạt" (GDD §8): trộn xanh nước với trắng điệp — không thêm màu ngoài palette. */
const SWEAT_COLOR = (() => {
  const c = Phaser.Display.Color.Interpolate.ColorWithColor(
    Phaser.Display.Color.ValueToColor(palette.water),
    Phaser.Display.Color.ValueToColor(palette.paper),
    100,
    45,
  );
  return Phaser.Display.Color.GetColor(c.r, c.g, c.b);
})();
/** Thanh tiến độ cuốc (px thế giới): rộng theo ô, cao, khoảng hở giữa các đốt, cách mép trên ô. */
const TILL_BAR = { widthRatio: 0.78, height: 11, gap: 2, top: 4 } as const;

/** Khóa texture placeholder vẽ bằng code (bakeTextures): ao — chờ hình nước Lô 2 (T-033). */
const TEX = { pond: 'ph-pond' } as const;
/**
 * T-024: tán cây luôn vẽ TRÊN mọi thứ đứng trên mặt đất (nhân vật, nhà, cây trồng; depth các thứ đó = y đáy ≤ ~2000 px),
 * dưới bụi đất / thanh cuốc / trời / bong bóng.
 */
const DEPTH_CANOPY = 4000;
/**
 * T-024: vùng LÁ của tán nhãn trong ảnh 224×224 (px, đo khung alpha của tree-nhan-canopy.png) — thân người chạm vùng này
 * thì tán mờ đi (`treeFadeAlpha`). Phần trong suốt quanh tán không tính.
 */
const CANOPY_LEAVES = { x: 13, y: 33, w: 198, h: 130 } as const;
/** Hộp thân người để xét tán che (px): nửa bề ngang, chiều cao từ chân (theo khung đi 64×96). */
const HERO_BODY_BOX = { halfW: 20, h: 88 } as const;
/** Khóa viền "ô" cho vật tương tác (khác mọi khóa ô thường = ty × cols + tx). */
const OBJECT_HIGHLIGHT_KEY = 1_000_000;

/** Hàng ở sạp hạt tạm (data/seedStall.json) — bỏ dòng có cây không còn trong crops.json. */
const SEED_STALL: readonly SeedStallItem[] = (seedStallJson.items as SeedStallItem[]).filter((it) => seedPriceOf(it.cropId) !== null);

/** T-093: phòng trong nhà {ten} (toạ độ thế giới) — nằm dưới bản đồ Vườn, camera chỉ nhìn một khu một lúc. */
const HOUSE = resolveHouseLayout(houseOrigin(L.rows, T), T);
/** Màn mờ khi chuyển khu: trên mọi thứ trong cảnh (kể cả bong bóng); HUD ở scene khác nên vẫn hiện. */
const DEPTH_AREA_FADE = 8000;
/**
 * Click vật trong nhà: tầm tính từ tâm chân tới MÉP chân đế vật. Ngoài Vườn tầm click (interactRange) đo tới TÂM ô gần nhất
 * của vật → đổi ra "tới mép" thì bớt nửa ô, để trong nhà cũng xa gần như ngoài vườn.
 */
const HOUSE_CLICK_RANGE_PX = (gameConfig.interactRange - 0.5) * T;
/** Luật game khi nạp save (systems/save.ts): số nhát cuốc, độ dài ngày, cỡ khu, món / cây có thật. */
const SAVE_RULES: SaveRules = {
  strikesPerPlot: gameConfig.tillStrikesPerPlot,
  dayLengthSeconds: gameConfig.dayLengthSeconds,
  areaWidth: L.cols * T,
  areaHeight: L.rows * T,
  isKnownItem: (id) => itemInfo(id) !== null,
  isKnownCrop: (cropId) => cropById(cropId) !== undefined,
  // T-009: save trước khi có cuốc → nạp xong tự thêm cuốc vào ô trống đầu tiên.
  requiredItems: gameConfig.startTools,
  // T-093: save đứng trong nhà (toạ độ trong ảnh phòng).
  otherAreas: { house: houseSize() },
  // T-041: bậc đồ kẹp theo số bậc; độ bền nông cụ đã bỏ khỏi dữ liệu thì bỏ.
  outfitTierCount: gameConfig.outfitTierCount,
  isKnownTool: isToolItem,
};

/** T-041: bảng Thử — chỗ từng nút (chỉ số phẳng như CHEAT_BUTTONS) + luật (mọi món cho được, trần level…). */
const CHEAT_SLOTS = cheatButtonSlots(cheatButtonWidths(CHEAT_ROWS));
const CHEAT_RULES: CheatRules = {
  items: allItemIds(),
  itemName: (id) => itemInfo(id)?.name ?? id,
  isTool: isToolItem,
  maxLevel: gameConfig.cheatMaxLevel,
  outfitTierCount: gameConfig.outfitTierCount,
  daysPerSeason: gameConfig.daysPerSeason,
};

/** Origin Y của sprite nhân vật: khung đi/đứng 64×96 chân sát đáy (1); khung động tác 128×128 chân ở hàng footY. */
const HERO_ORIGIN_Y_WALK = 1;
const HERO_ORIGIN_Y_ACTION = HERO_ACTION_FRAME.footY / HERO_ACTION_FRAME.height;

/**
 * Cửa sổ "cửa hàng" đang mở: thùng bán, sạp hạt hoặc rương trong nhà (T-093) — trùng tên lý do dừng trong systems/pause.ts.
 * Giường không phải cửa hàng.
 */
export type ShopWindow = 'sellBox' | 'seedStall' | 'chest';

/** T-096: việc chờ làm khi đi theo click tới nơi (ô ruộng, vật Vườn, vật trong nhà, cửa nhà). */
export type ClickAction =
  | { kind: 'tile'; x: number; y: number; job: TileJob }
  | { kind: 'gardenObject'; target: InteractTarget }
  | { kind: 'houseObject'; target: HouseTarget }
  | { kind: 'door'; to: AreaId };
/**
 * Giường (T-024: chõng tre vẽ trong ảnh nhà, mép trên chõng ở px 245 của ảnh ≈ 11 px trên hàng ô giường) nhô lên trên ô
 * bấy nhiêu px — viền khi trỏ chuột bao cả hình.
 */
const BED_LIFT = 12;

/**
 * Chuỗi "đêm" (T-007): none (chơi bình thường) → sleepPrompt (hộp "Đi ngủ?") → fallingAsleep (màn tối dần) → summary
 * (tổng kết) → waking (sáng dần, đứng cạnh giường) → none. Ngủ gục: none → passingOut (nằm ra đất, Zzz, tối dần) → summary…
 */
export type NightPhase = 'none' | 'sleepPrompt' | 'fallingAsleep' | 'passingOut' | 'summary' | 'waking';
/** Nhịp hiện dần của màn tổng kết (gameConfig). */
const REVEAL_TIMING: RevealTiming = {
  lineInterval: gameConfig.summaryLineIntervalSeconds,
  lineSlide: gameConfig.summaryLineSlideSeconds,
  countSeconds: gameConfig.summaryCountSeconds,
  recordPopSeconds: gameConfig.summaryRecordPopSeconds,
};
/** T-027: xu bay vào / ra ô tiền HUD (systems/juice.ts). HUD đọc qua `GardenScene.coinParams` để vẽ cùng nhịp. */
const COIN_PARAMS: CoinParams = {
  count: gameConfig.coinFlyCount,
  flySeconds: gameConfig.coinFlySeconds,
  staggerSeconds: gameConfig.coinFlyStaggerSeconds,
  spreadPx: gameConfig.coinFlySpreadPx,
  arcPx: gameConfig.coinFlyArcPx,
};
/**
 * T-027: pool đốm lấp lánh của cây chín — mỗi lần gọi hái ripeSparkleCount đốm sống ripeSparkleSeconds; các ô lệch nhịp nên
 * cả ruộng 24 ô chín cùng lúc cũng chỉ ~24 × 0.6 / 2 lần chồng nhau. Hết pool thì bỏ qua (không tạo thêm).
 */
const SPARKLE_POOL = 24;
/**
 * Đốm lấp lánh nằm theo chiều sâu của CHÍNH cây đó: depth gốc cây + chừng này → ngay trên sprite cây, dưới {ten} khi
 * {ten} đứng trước cây (chân thấp hơn gốc), dưới tán nhãn (DEPTH_CANOPY) và dưới lớp màu trời. Trước đây đốm ở trên lớp
 * trời nên đè cả lên {ten} lẫn tán cây (QA T-027). Đốm vẽ blend ADD (cộng sáng vào cây bên dưới) nên lúc chiều tối bị lớp
 * trời (tối nhất 45%) phủ vẫn là chỗ sáng nhất quanh đó — vẫn thấy cây chín gọi hái.
 */
const SPARKLE_DEPTH_ABOVE_CROP = 0.5;

/** Tham số hoạt ảnh đi, lấy từ gameConfig (D-020). */
const WALK_PARAMS: WalkAnimParams = {
  blendRate: gameConfig.walkBlendRate,
  breathScale: gameConfig.idleBreathScale,
  breathRate: gameConfig.idleBreathRate,
  dustEverySteps: gameConfig.walkDustEverySteps,
  upBobPx: gameConfig.walkUpBobPx,
  sideContactFrames: gameConfig.walkSideContactFrames,
  verticalContactFrames: gameConfig.walkVerticalContactFrames,
};
/** Mỗi khung xoay hiện bao lâu (giây). */
const TURN_FRAME_SEC = gameConfig.turnFrameMs / 1000;

/** Pool bụi đất: đủ cho nhát cuối (× tillFinishDustMultiplier) chồng với 2 nhát thường. */
const TILL_DUST_POOL = gameConfig.tillDustCount * (gameConfig.tillFinishDustMultiplier + 2);
/** Pool giọt mồ hôi. */
const SWEAT_POOL = gameConfig.tillSweatCount * 4;
/** Số nhãn hàng chờ có sẵn (đủ cho tillQueueMax tối đa theo GDD là 4, dư cho QA chỉnh). */
const QUEUE_LABEL_POOL = 6;
/** Huy hiệu số hàng chờ: bán kính, cách góc dưới-phải ô (px thế giới). */
const QUEUE_BADGE = { radius: 11, inset: 15 } as const;
/** Đất chưa cuốc vẽ đè lên tilemap theo nấc — key texture ô đất thử (để làm ô "nảy" lúc xong). */
/** T-022: màu tint cây khát (nhân màu) — trắng ngả về đất khô #B98550. */
const THIRSTY_TINT = thirstyTint(palette.wood, gameConfig.cropThirstyTintAmount);
/** T-021: các lớp nền (thứ tự vẽ: lõi → viền luống → mép cỏ → góc lõm; sau đó mới tới bóng, cây, nhân vật). */
const DEPTH_GROUND_RIDGE = DEPTH_GROUND + 0.25;
const DEPTH_GROUND_EDGE = DEPTH_GROUND + 0.5;
const DEPTH_GROUND_CORNER = DEPTH_GROUND + 0.75;
/** "Chữ ký" vẽ riêng cho lúc thanh tiến độ đang lóe sáng (xong ô). */
const FLASH_SIG = -2;

/** Thông số cuốc có thể chỉnh lúc chạy (QA đặt nhỏ cho test nhanh qua `debugSetTillTuning`). */
export interface TillTuning {
  strikesPerPlot: number;
  strikeSeconds: number;
  queueMax: number;
}

/** Trạng thái cho QA/Playwright đọc qua window.__game.scene.getScene('Garden').debugState. */
export interface GardenDebugState {
  gardenReady: boolean;
  /** Ô đang đứng (theo điểm giữa hộp va chạm chân). */
  tileX: number;
  tileY: number;
  /** Toạ độ px giữa hộp chân. */
  footX: number;
  footY: number;
  moving: boolean;
  facing: Facing;
  /** Độ nhích hiện tại của sprite (px, âm = nhấc lên; chỉ khi đi lên). */
  bobOffset: number;
  /** Số lần chạm gót từ đầu. */
  steps: number;
  /** Texture sprite đang dùng: `hero-t1-<hướng>` (đứng), `hero-t1-walk-<hướng>` (đi), `hero-t1-turn` (xoay). */
  textureKey: string;
  /** Anim đi: key, khung đang hiện (dọc 0..3, ngang 0..5, xoay 0..3; ảnh đứng -1), có đang chạy, hệ số tốc độ khung. */
  anim: { key: string | null; frame: number; playing: boolean; timeScale: number };
  /** Khung xoay chéo đang hiện (null = không xoay). */
  turnFrame: TurnDiagonal | null;
  /** T-009: khung hoạt ảnh cuốc đang hiện (0 chuẩn bị, 1 giơ, 2 chạm, 3 hồi; -1 = không cuốc). */
  hoeFrame: number;
  /**
   * T-023: dáng động tác đang hiện (`hoe` / `water` / `bend`; null = khung đi / đứng), khung 0–3 (-1 = không), lần hái
   * gần nhất icon bay từ tay hay từ ô.
   */
  actionAnim: { anim: ActionAnim | null; frame: number; lastHarvestFrom: 'hand' | 'tile' | null };
  /** T-024: đồ vật Vườn — chân đế nhà, ô cửa / điểm cửa, chỗ người bán, ảnh thúng đang hiện, độ đục tán cây, ảnh thiếu. */
  props: {
    house: TileRect;
    houseDoor: TileRect;
    houseDoorPoint: { x: number; y: number };
    seedStallFoot: TileRect;
    sellerSpot: { x: number; y: number };
    sellBasket: string;
    stakesVisible: boolean;
    canopyAlpha: number[];
    fallbacks: string[];
  };
  /** Origin Y của sprite (1 = khung đi; 111/128 = khung cuốc) — QA kiểm chân không nhảy. */
  heroOriginY: number;
  /** Vùng thế giới camera đang thấy (px). */
  view: { x: number; y: number; w: number; h: number };
  zoom: number;
  mapPx: { w: number; h: number };
  /** Ruộng (T-002): trạng thái từng ô (soil + tillStrikes 0…số nhát) + số ô đã cuốc. */
  farm: { plots: FarmPlot[]; tilled: number };
  /**
   * Ô dưới con trỏ (null = con trỏ ngoài game/bản đồ). `highlight` = màu viền đang vẽ,
   * `alpha` = độ đục viền lúc này (ô trong tầm "thở" lên xuống, ngoài tầm đứng yên 1).
   */
  hover: {
    x: number;
    y: number;
    inReach: boolean;
    tillable: boolean;
    /** Việc sẽ làm nếu click ô này (T-003), null = không làm gì. */
    job: TileJob | null;
    highlight: 'bright' | 'gray';
    alpha: number;
    /** T-006: con trỏ đang trên thùng bán / sạp hạt (null = ô thường). */
    object: InteractTarget | null;
  } | null;
  /**
   * Việc trên ô: đang làm ô nào, tiến độ NHÁT hiện tại (0–1), hàng chờ (theo thứ tự 1, 2, 3), số nhát còn lại /
   * đã bổ ở ô hiện tại trong lần làm này, loại việc của lần giữ chuột ('till' hoặc null).
   */
  action: {
    busy: boolean;
    current: TileXY | null;
    progress: number;
    queued: number;
    queue: TileXY[];
    strikesLeft: number;
    strikesDone: number;
    /** Loại việc của lần giữ chuột (chốt theo ô bấm đầu). */
    dragKind: TileJob | null;
    /** Loại việc của ô đang làm + hàng chờ (null = rảnh). */
    kind: TileJob | null;
  };
  /** Cây trên từng ô ruộng có cây (T-003). `stage` = hình đang vẽ; `thirsty` = hôm qua không tưới (lá rũ). */
  crops: {
    x: number;
    y: number;
    cropId: string;
    age: number;
    dryDays: number;
    watered: boolean;
    ripe: boolean;
    withered: boolean;
    thirsty: boolean;
    stage: CropStage;
    /** T-022: dải hình đang dùng (`crop-common` / `crop-<id>`; null = vẽ bằng code) + khung. */
    sprite: string | null;
    frame: number;
  }[];
  /**
   * T-021: nền bằng tile — hình lõi từng ô ruộng (cùng thứ tự farm.plots: soil-dry / soil-till-1 / soil-till-2 /
   * soil-tilled / soil-watered), mask viền luống từng ô, tấm tile nào đang vẽ tạm bằng code (ảnh tải lỗi).
   */
  ground: { plotLooks: string[]; ridgeMasks: number[]; fallbacks: string[] };
  /** Gùi (hàng đầu = hotbar), ô đang chọn, hạt gieo lần trước. */
  inventory: {
    slots: ({ id: string; count: number; name: string } | null)[];
    selected: number;
    selectedItem: string | null;
    /** T-009: việc của nông cụ đang cầm ('till' = cuốc; null = không cầm nông cụ). */
    heldToolUse: string | null;
    /** Số lần bấm ô cỏ / cuốc dở mà không cầm cuốc (bong bóng nhắc "cầm cuốc đã"). */
    noHoePrompts: number;
    lastSeedId: string | null;
    hotbarSize: number;
    stackMax: number;
    revision: number;
  };
  /** Cửa sổ gùi (E) đang mở; ô gùi dưới con trỏ (-1 = không). */
  bagOpen: boolean;
  bagHoverSlot: number;
  /**
   * Bong bóng chữ trên đầu nhân vật: đang hiện, chữ, số lần hiện (mỗi lần câu mới / hiện lại), loại (chửi thề /
   * báo / lầm bầm — null khi tắt), lệch ngang hiện tại (chửi thề lắc).
   */
  /** T-092: `style` = kiểu ảnh bong bóng đang hiện, `art` = có dùng ảnh thật (false = vẽ bằng code dự phòng). */
  bubble: { visible: boolean; text: string; shows: number; kind: BubbleKind | null; shakeX: number; style: BubbleStyle | null; art: boolean };
  /** Thanh Sức (T-004). */
  stamina: {
    current: number;
    max: number;
    exhausted: boolean;
    band: StaminaBand;
    /** Hệ số tốc độ đi đang áp (1 hoặc staminaExhaustedSpeedMultiplier). */
    speedMultiplier: number;
    /** Vận tốc hộp chân lúc này (px/giây) — để kiểm đi chậm khi đuối. */
    speedPx: number;
    /** Số lần chửi thề lúc chuyển sang đuối; tiếng càu nhàu vừa phát. */
    curses: number;
    lastCurseSfx: string | null;
    /** Số lần hiện "đuối rồi…" (thiếu Sức cho việc). */
    tooTired: number;
    /** Số lần ăn; Sức trừ khi xong ô cuốc gần nhất. */
    eats: number;
    /** Lầm bầm khi xong ô cuốc: số lần, câu gần nhất, xác suất / nghỉ đang dùng (QA chỉnh được). */
    barks: number;
    lastBark: string | null;
    barkChance: number;
    barkCooldownSeconds: number;
    /** Chữ bay đang hiện + vài chữ bay gần nhất (cũ → mới). */
    floatsActive: string[];
    /** Chữ bay đang hiện kèm toạ độ Y (px thế giới) — QA kiểm không chồng nhau (BUG-012). */
    floatsActiveY: { text: string; y: number }[];
    floatLog: string[];
  };
  /** Đếm việc nhanh + juice (T-003). `lastOvernight` = kết quả lần "qua đêm" gần nhất (phím G). */
  farmJuice: {
    plants: number;
    waters: number;
    harvests: number;
    clears: number;
    nights: number;
    dropsActive: number;
    popsActive: number;
    lastWaterSfx: string | null;
    /** Tiếng gieo vừa phát (key + detune cent). */
    lastPlantSfx: { key: string; detune: number } | null;
    /** Các lần phát tiếng hái gần nhất (cũ → mới), detune theo thang ngũ cung. */
    harvestSfx: { key: string; detune: number }[];
    lastOvernight: OvernightReport | null;
  };
  /** HUD (hotbar / gùi): icon đang bay, ô đang nảy, tooltip, cửa sổ gùi hiện. */
  hud: HudDebugState | null;
  /**
   * Đồng hồ ngày (T-005): ngày, giờ (số thực), chữ "14:30", dòng ngày, khung trời, giây thật đã chạy trong ngày,
   * đã chạm 24h chưa (tạm thời đứng ở 24:00 tới T-007), cảnh báo 23h, đồng hồ có đang dừng + lý do.
   */
  time: {
    day: number;
    hour: number;
    clockText: string;
    dayText: string;
    phase: SkyPhase;
    elapsedSeconds: number;
    dayOver: boolean;
    dayEndHits: number;
    warn: boolean;
    stopped: boolean;
    reasons: PauseReason[];
    devHourPresses: number;
  };
  /** Lớp màu trời đang vẽ: màu 0xRRGGBB, độ đục, có hiện không. */
  sky: { color: number; alpha: number; visible: boolean };
  /** Cửa sổ Tạm dừng: đang mở, vì sao mở, con trỏ trên nút "Tiếp tục", số lần mở, âm lượng nhạc nền hiện tại. */
  pause: {
    menuOpen: boolean;
    cause: PauseCause | null;
    hoverResume: boolean;
    opens: number;
    musicVolume: number | null;
    /** T-008: con trỏ trên nút "Chơi lại từ đầu"; hộp xác nhận đang mở; nút đang sáng trong hộp; dòng "Đã lưu lúc…". */
    hoverRestart: boolean;
    restartConfirmOpen: boolean;
    restartConfirmHover: 'yes' | 'no' | null;
    savedText: string;
  };
  /**
   * Tự lưu (T-008). `lastSaveAt` = lần lưu gần nhất (giờ game + giờ thật + lý do; null = chưa lưu lần nào trong phiên này),
   * `saveCount` = số lần đã ghi trong phiên, `loadedFromSave` = lúc mở game có nạp save, `loadStatus` = kết quả đọc save lúc
   * mở ('none' | 'ok' | 'corrupt'), `suppressed` = đã ngừng ghi (vừa bấm Chơi lại / hook test), `autoSaveIn` = giây còn lại tới
   * lần tự lưu theo nhịp, `skipped` = số lần xin lưu bị bỏ (đang trong chuỗi đêm…).
   */
  save: {
    saveKey: string;
    /** T-041: phiên bản định dạng save game này ghi ra (= GAME_SAVE_VERSION, hiện 5). */
    version: number;
    lastSaveAt: { day: number; hour: number; clockText: string; savedAt: string; reason: string } | null;
    saveCount: number;
    loadedFromSave: boolean;
    loadStatus: 'none' | 'ok' | 'corrupt';
    loadReason: string | null;
    /** T-009: món bắt buộc được tự thêm lúc nạp (save cũ chưa có cuốc → ['cuoc-go']). */
    loadAddedItems: string[];
    /** Giây đồng hồ trong ngày ngay lúc nạp save (null = không nạp) — QA đo giờ lệch sau F5. */
    loadedElapsedSeconds: number | null;
    suppressed: boolean;
    autoSaveIntervalSeconds: number;
    autoSaveIn: number;
    skipped: number;
  };
  /** Tiền (T-006): số quan, các lần mua hạt (cũ → mới), tiếng xu vừa phát. */
  money: {
    current: number;
    revision: number;
    purchases: { cropId: string; count: number; cost: number }[];
    lastCoinSfx: string | null;
  };
  /** Cửa sổ thùng bán / sạp hạt đang mở (null = không), dòng báo đang hiện, phím F. */
  shop: {
    window: ShopWindow | null;
    status: string;
    statusWarn: boolean;
    opens: { sellBox: number; seedStall: number; chest: number };
    /** Số lần bấm F; vật đứng cạnh lúc này (null = không đứng cạnh vật nào; trong nhà là vật trong nhà). */
    keyPresses: number;
    nearby: InteractTarget | HouseTarget | null;
  };
  /**
   * T-093: khu đang đứng, đang chuyển khu (bước + độ tối màn), tên khu đang hiện, số lần vào / ra nhà, vật trong nhà dưới con
   * trỏ, rương (đồ + số lần chuyển), toạ độ phòng (thế giới), chỗ đứng trong khu (px tính từ góc khu — như trong save).
   */
  area: {
    current: AreaId;
    transition: 'idle' | 'out' | 'in';
    fade: number;
    banner: { text: string; alpha: number };
    enters: number;
    exits: number;
    houseHover: { target: HouseTarget; inReach: boolean } | null;
    local: { x: number; y: number };
    house: { origin: { x: number; y: number }; floor: { x: number; y: number; w: number; h: number }; spawn: { x: number; y: number }; wakeSpot: { x: number; y: number } };
  };
  chest: {
    slots: ({ id: string; count: number; name: string } | null)[];
    transfers: number;
  };
  /**
   * T-096: click đâu đi đó — đang đi không, việc chờ (kiểu + ô / vật), các điểm còn phải qua (px thế giới), dấu đích có
   * đang hiện, bộ đếm (bắt đầu đi, tới nơi, làm việc chờ, huỷ, không có đường, lập lại đường), lần lập đường gần nhất (số
   * ô đã mở, mili-giây), việc chờ gần nhất đã làm.
   */
  clickMove: {
    active: boolean;
    action: ClickAction | null;
    waypoints: { x: number; y: number }[];
    index: number;
    markerVisible: boolean;
    starts: number;
    arrivals: number;
    actionsDone: number;
    cancels: number;
    noPath: number;
    replans: number;
    lastExpanded: number;
    lastPlanMs: number;
    lastAction: string;
  };
  /** Thùng bán: đồ trong thùng, tổng tiền cuối ngày (giá gốc), ô dưới con trỏ, số lần chuyển món. */
  sellBox: {
    slots: ({ id: string; count: number; name: string } | null)[];
    total: number;
    hover: { side: SellSide; index: number } | null;
    transfers: number;
  };
  /** Sạp hạt: các nút (giá, có đủ tiền không), nút dưới con trỏ. */
  seedStall: {
    buttons: { cropId: string; label: string; price: number; enabled: boolean }[];
    hoverButton: number;
  };
  /**
   * Ngủ / ngủ gục / tổng kết (T-007). `overnights` = số lần qua đêm (mọi cách), `lastCause` = cách gần nhất
   * ('sleep' | 'passout' | 'devG'), `passingOut` = đang trong lúc ngủ gục, `passedOut` = đêm gần nhất là ngủ gục,
   * `fade` = độ tối màn (0–1), `heroAngle` = độ nghiêng sprite (nằm ra đất), `summary` = màn tổng kết (null = không mở).
   */
  night: {
    phase: NightPhase;
    overnights: number;
    lastCause: OvernightCause | null;
    sleepPromptOpen: boolean;
    sleepPromptHover: 'yes' | 'no' | null;
    sleepPromptOpens: number;
    tooEarly: number;
    passingOut: boolean;
    passedOut: boolean;
    fade: number;
    heroAngle: number;
    zzz: boolean;
    wakes: number;
    summaryAccepts: number;
    summaryTicks: number;
    summary: {
      open: boolean;
      data: OvernightSummary;
      lines: string[];
      detail: string;
      moneyShown: number;
      allRevealed: boolean;
      hoverButton: boolean;
    } | null;
    lastSummary: OvernightSummary | null;
  };
  /** Cuốc nhiều nhát (D-022): thông số đang dùng + đếm sự kiện + thứ đang hiện trên màn. */
  till: {
    tuning: TillTuning;
    /** Số ô đã cuốc xong (nhát cuối), số lần bỏ dở, số lần khựng hình. */
    finishes: number;
    cancels: number;
    hitStops: number;
    hitStopActive: boolean;
    sweatActive: number;
    /** Ô đang nảy (nhát cuối). */
    bouncing: boolean;
    /** Thanh tiến độ đang hiện: ô, số đốt đầy, độ đục, có đang lóe sáng (xong ô) không. */
    bars: { x: number; y: number; filled: number; alpha: number; flash: boolean }[];
    /** Nấc đất đang vẽ của từng ô ruộng chưa cuốc xong mà > 0. */
    stages: { x: number; y: number; stage: number }[];
    /** Số thứ tự đang hiện trên các ô chờ. */
    queueLabels: { x: number; y: number; text: string }[];
  };
  /** Đếm juice để QA kiểm: số nhát cuốc, số lần rung màn, tiếng vừa phát (+ lệch cao độ, âm lượng), số hạt bụi đất đang bay, scale nhân vật. */
  juice: {
    tills: number;
    shakes: number;
    lastSfx: string | null;
    lastSfxDetune: number;
    lastSfxVolume: number;
    dustActive: number;
    heroScale: { x: number; y: number };
    /**
     * T-027 "khoảnh khắc sướng": cây chín gọi hái (số lần đã gọi, đốm lấp lánh đang hiện, cây đang nhún), xu bay (đồng chưa
     * chạm, các mẻ đang bay, tổng đồng "in" đã chạm, tiền chờ xu bay khi đóng tổng kết, số tiền HUD đang hiện), kỷ lục.
     */
    ripeCues: number;
    ripeSparkles: number;
    ripeHopping: number;
    coinFlights: number;
    coinBatches: { kind: 'in' | 'out'; amount: number; landed: number; total: number }[];
    coinBatchesStarted: number;
    coinsLandedIn: number;
    pendingPayout: number;
    moneyShown: number;
    record: { bestDaySale: number; newToday: boolean; badgeProgress: number; sfxPlayed: boolean };
  };
  /**
   * T-026: âm thanh — trạng thái AudioManager (kênh, nhạc / tiếng nền đang phát, jingle, vài lần phát gần nhất), seed lần
   * chơi, kiểu gà gáy hôm nay + các lần gà gáy, số lần ngáp, số tiếng bước chân, nút âm lượng dưới con trỏ (Tạm dừng).
   */
  audio: AudioDebugState & {
    seed: number;
    roosterToday: RoosterKind;
    roosters: { day: number; kind: RoosterKind }[];
    yawns: number;
    footsteps: number;
    volumeHover: string | null;
  };
  /**
   * T-041: trạng thái chặng 4 (lưu ở save version 5) — tiến trình (level, tiếng tăm trong level, nhiệm vụ, nhiệm vụ ghim),
   * cờ (object + danh sách đang bật), độ bền nông cụ, bậc đồ, gia đình, thời tiết đã chọn.
   */
  progress: SaveProgress & {
    flags: Record<string, boolean>;
    activeFlags: string[];
    tools: Record<string, SaveToolState>;
    outfitTier: number;
    family: SaveFamily;
    weather: SaveWeather;
  };
  /**
   * T-041: bảng Thử (chỉ bản dev) — có bật ở bản này không, đang mở, nút dưới con trỏ (-1 = không), chữ từng nút (đã thay
   * {item} / {on}), món đang chọn để cho, số lần bấm nút, nút bấm gần nhất, dòng báo + dòng trạng thái chân bảng.
   */
  cheatPanel: {
    enabled: boolean;
    open: boolean;
    hover: number;
    labels: string[];
    pickedItem: string | null;
    uses: number;
    lastButton: string | null;
    notice: string;
    status: string;
  };
}

export class GardenScene extends Phaser.Scene {
  private controls!: InputController;
  /** Hộp va chạm ở chân (vô hình) — vật lý chỉ lo cái hộp này; sprite đi theo nó. */
  private feet!: Phaser.GameObjects.Zone;
  private feetBody!: Phaser.Physics.Arcade.Body;
  private hero!: Phaser.GameObjects.Sprite;
  private heroShadow!: Phaser.GameObjects.Ellipse;
  private facing: Facing = 'down';
  private readonly walk = createWalkAnimState();
  private readonly turn = createTurnAnimState();
  private prevFootX = 0;
  private prevFootY = 0;
  /** Tỷ lệ tốc độ thật đã làm mượt (0..1). */
  private speedRatio = 0;
  /** Hướng ngang lần đi gần nhất — bụi bay ngược hướng này. */
  private lastDirX = 0;

  // Pool bụi chân: tạo sẵn N đốm, tái dùng — không tạo object mới khi đang chơi.
  private readonly dust: Phaser.GameObjects.Arc[] = [];
  private readonly dustLife: number[] = [];
  private readonly dustVx: number[] = [];
  /** T-024: tán cây nhãn (luôn vẽ trên nhân vật) + vùng lá (px thế giới) để làm mờ khi người đứng dưới. */
  private readonly canopies: Phaser.GameObjects.Image[] = [];
  private readonly canopyBoxes: { left: number; top: number; right: number; bottom: number }[] = [];
  /** T-024: ảnh thúng bán (đổi đóng / hé theo có đồ chờ bán) + khoá ảnh đang hiện. */
  private sellBasket: Phaser.GameObjects.Image | null = null;
  private sellBasketShown = '';
  /** T-024: cọc rào mở ruộng — tạo sẵn, ẩn tới T-044. */
  private readonly stakes: Phaser.GameObjects.Image[] = [];
  /** T-024: ảnh đồ vật không tải được → vẽ tạm bằng code (QA đọc ở debugState.props.fallbacks). */
  private readonly propFallbacks: string[] = [];

  /** Lưới ô chặn (không gồm cây) — dùng cho "nắn vào cửa". */
  private solidGrid: boolean[][] = [];
  /** Lớp va chạm Tilemap (công khai cho QA kiểm "không xuyên vật cản"). */
  collisionLayer!: Phaser.Tilemaps.TilemapLayer;

  // ---- Ruộng & làm việc trên ô (T-002) ----
  /** T-021: lớp lõi nền (cỏ / lối / sân / đất ruộng theo nấc) — ô ruộng đổi tile khi cuốc, tưới, hái. */
  private groundLayer!: Phaser.Tilemaps.TilemapLayer;
  /** T-021: lớp viền luống (chỉ trên ô đã cuốc) — vẽ lại khi ô nào đổi giữa "đã cuốc" và "chưa". */
  private ridgeLayer!: Phaser.Tilemaps.TilemapLayer;
  /** Loại nền từng ô [y][x] (dựng từ gardenLayout). */
  private groundKinds: GroundKind[][] = [];
  /** Chỉ số tile đầu tiên (firstgid) của từng tấm tile trong Tilemap nền. */
  private readonly tileGid: Partial<Record<TileSheetName, number>> = {};
  /** Lần đồng bộ gần nhất: hình lõi (SOIL_TEXTURES) và "đã cuốc" của từng ô ruộng — chỉ đặt lại tile khi đổi. */
  private readonly plotLook: number[] = [];
  private readonly plotTilled: boolean[] = [];
  /** Tấm tile nào phải vẽ tạm bằng code vì ảnh không tải được (QA đọc qua debugState.ground). */
  private readonly tileFallbacks: string[] = [];
  private readonly farm = createFarm(L.plots);
  private readonly action = createTileActionState();
  private readonly actionEvents = createTileActionEvents();
  /** Thông số cuốc đang dùng — chép từ gameConfig; QA có thể chỉnh nhỏ (debugSetTillTuning) để test chạy nhanh. */
  private readonly tillTuning: TillTuning = {
    strikesPerPlot: gameConfig.tillStrikesPerPlot,
    strikeSeconds: gameConfig.tillStrikeSeconds,
    queueMax: gameConfig.tillQueueMax,
  };
  /** Tham số hàng đợi cho cuốc: mỗi "nhát" dài tillStrikeSeconds. */
  private readonly tillParams: TileActionParams = {
    duration: gameConfig.tillStrikeSeconds,
    impactAt: gameConfig.actionImpactAt,
    queueMax: gameConfig.tillQueueMax,
  };
  /**
   * Loại việc của lần giữ chuột hiện tại, chốt theo ô bấm đầu tiên (GDD §3.3 "một lần rê một loại việc").
   * null = lần bấm này không làm gì (bấm trên cỏ…) hoặc đã buông chuột.
   */
  private dragKind: TileJob | null = null;
  /** Vừa bỏ dở bằng WASD mà chuột vẫn giữ → không tự cuốc lại cho tới khi buông chuột. */
  private dragBlocked = false;
  /** Khựng hình còn lại (giây) — nhát cuối (tillFinishHitStopSeconds). */
  private hitStop = 0;
  /** Thanh tiến độ cuốc, mỗi ô ruộng một cái, cùng thứ tự farm.plots (nấc đất cuốc dở nay là tile — T-021). */
  private readonly plotBars: Phaser.GameObjects.Graphics[] = [];
  /** "Chữ ký" lần vẽ gần nhất của từng ô — chỉ vẽ lại khi đổi (không vẽ Graphics mỗi frame). */
  private readonly plotDrawn: number[] = [];
  /** Thời gian lóe sáng còn lại của thanh tiến độ từng ô (xong ô). */
  private readonly plotFlash: number[] = [];
  /** Số thứ tự 1/2/3 trên ô chờ (pool). */
  private readonly queueLabels: Phaser.GameObjects.Text[] = [];
  /** Nền tròn sau số hàng chờ. */
  private readonly queueBadges: Phaser.GameObjects.Arc[] = [];
  /** Ô "nảy" lúc xong: ảnh cắt đúng mảnh đất của ô, phóng to rồi về. */
  private bounceImg!: Phaser.GameObjects.Image;
  private bounceT = 0;
  // Pool giọt mồ hôi.
  private readonly sweat: Phaser.GameObjects.Arc[] = [];
  private readonly sweatLife: number[] = [];
  private readonly sweatVx: number[] = [];
  private readonly sweatVy: number[] = [];
  private finishCount = 0;
  private cancelCount = 0;
  private hitStopCount = 0;
  private lastSfxDetune = 0;
  private lastSfxVolume = 0;
  private readonly pose = { scaleX: 1, scaleY: 1 };
  /** Viền ô dưới con trỏ: nét sáng/xám + nền mờ trong ô. */
  private highlight!: Phaser.GameObjects.Rectangle;
  /** Viền mực lót dưới nét sáng — tương phản trên mọi nền. */
  private highlightBacking!: Phaser.GameObjects.Rectangle;
  /**
   * T-092 (ART-UI-001 phương án A): viền ô NGOÀI tầm — nét đứt xám tro lót mực. Vẽ lại chỉ khi ô / cỡ đổi
   * (`highlightDashSig`), không vẽ mỗi frame.
   */
  private highlightDash!: Phaser.GameObjects.Graphics;
  private highlightDashSig = '';
  /** Đồng hồ nhịp thở của viền (giây) — về 0 khi con trỏ sang ô khác để ô mới hiện sáng ngay. */
  private highlightPulseT = 0;
  /** Ô viền đang chỉ (để biết khi nào đổi ô); -1 = chưa có. */
  private highlightTileKey = -1;
  /** Ô dưới con trỏ ở frame này (tái dùng object). */
  private readonly hover = {
    x: 0,
    y: 0,
    valid: false,
    inReach: false,
    tillable: false,
    job: null as TileJob | null,
    object: null as InteractTarget | null,
  };
  private readonly pointerWorldPt = new Phaser.Math.Vector2();
  private readonly pointerScreenPt = new Phaser.Math.Vector2();

  // ---- Gieo, tưới, hái + gùi/hotbar (T-003) ----
  /** Gùi (hàng đầu = hotbar). Công khai để HUD đọc và vẽ; chỉ scene này sửa. */
  readonly inventory: Inventory = createStartInventory(
    gameConfig.startSeeds,
    gameConfig.bagSlotsStart,
    gameConfig.hotbarSlots,
    gameConfig.stackMax,
    gameConfig.startTools,
  );
  /** Tăng mỗi khi gùi / ô chọn đổi → HUD biết lúc nào cần vẽ lại (không vẽ lại mỗi frame). */
  inventoryRevision = 0;
  /** Cửa sổ gùi (E) đang mở: việc trên ô đứng yên, không đi, click không xuống ruộng. */
  bagOpen = false;
  /** Ô gùi dưới con trỏ khi cửa sổ gùi mở (-1 = không) — HUD hiện tên món. */
  bagHoverSlot = -1;
  /** T-092: ô hotbar dưới con trỏ (-1 = không) — HUD đổi khung "rê chuột" + hiện tooltip món. */
  hotbarHoverSlot = -1;
  /** T-092: con trỏ trên nút Gùi; trên nút đóng (X) của cửa sổ đang mở. */
  bagButtonHover = false;
  windowCloseHover = false;

  /** T-092: chuột / ngón đang giữ — HUD vẽ nút "lún" (btn-pressed) khi giữ trên nút. */
  get primaryDown(): boolean {
    return this.controls?.isPrimaryDown() ?? false;
  }
  /** Tham số hàng đợi cho việc nhanh: 1 nhát × actionDuration, hàng chờ actionQueueMax. */
  private readonly fastParams: TileActionParams = {
    duration: gameConfig.actionDuration,
    impactAt: gameConfig.actionImpactAt,
    queueMax: gameConfig.actionQueueMax,
  };
  /** Hình cây mỗi ô ruộng: sprite dải cây (T-022) + Graphics dự phòng (vẽ bằng code khi thiếu ảnh) + chữ ký lần vẽ. */
  private readonly plotCropSprites: Phaser.GameObjects.Sprite[] = [];
  private readonly plotCrops: Phaser.GameObjects.Graphics[] = [];
  private readonly cropDrawn: number[] = [];
  // Pool giọt nước / hạt rơi.
  private readonly drops: Phaser.GameObjects.Arc[] = [];
  private readonly dropLife: number[] = [];
  private readonly dropVx: number[] = [];
  private readonly dropVy: number[] = [];
  /** Pool hình "cây bật lên" khi hái + thời gian còn lại của từng cái. */
  private readonly pops: Phaser.GameObjects.Graphics[] = [];
  /** T-022: ảnh cây chín bật lên (khung "chín" của dải cây) — cùng chỉ số với `pops` (Graphics là dự phòng). */
  private readonly popImgs: Phaser.GameObjects.Image[] = [];
  private readonly popLife: number[] = [];
  private readonly popBaseY: number[] = [];
  // Bong bóng chữ trên đầu.
  private bubble!: Phaser.GameObjects.Container;
  /** Hình vẽ bằng code — chỉ dùng khi thiếu ảnh bong bóng (dự phòng). */
  private bubbleBg!: Phaser.GameObjects.Graphics;
  private bubbleText!: Phaser.GameObjects.Text;
  /** T-092: ảnh bong bóng (null = thiếu ảnh → vẽ bằng code). */
  private bubbleArt: BubbleArt | null = null;
  private bubbleStyle: BubbleStyle | null = null;
  private bubbleT = 0;
  private bubblePopT = 0;
  private bubbleShows = 0;
  private readonly farmCounts = { plants: 0, waters: 0, harvests: 0, clears: 0, nights: 0 };
  private lastWaterSfx: string | null = null;
  /** Chuỗi hái liên tiếp → cao độ tiếng "pop" lên dần (thang harvestPitchLadderCents). */
  private readonly harvestLadder = createPitchLadder();
  private lastPlantSfx: { key: string; detune: number } | null = null;
  /** Các lần phát tiếng hái gần nhất (key + detune), cũ → mới. */
  private readonly harvestSfxLog: { key: string; detune: number }[] = [];
  private lastOvernight: OvernightReport | null = null;
  /** Loại bong bóng đang hiện (null = tắt) — để bong bóng kém quan trọng không đè bong bóng quan trọng hơn. */
  private bubbleKind: BubbleKind | null = null;
  private bubbleShakeX = 0;

  // ---- Sức, đuối, ăn, chửi thề (T-004) ----
  /** Thanh Sức. Công khai để HUD đọc và vẽ; chỉ scene này sửa. */
  readonly stamina = createStamina(gameConfig.staminaMax);
  /** Đồng hồ của scene (giây, chỉ chạy khi scene chạy) — cho thời gian nghỉ giữa các lần lầm bầm. */
  private clock = 0;
  private readonly barks = createBarkState();
  /** Xác suất / thời gian nghỉ lầm bầm đang dùng (QA chỉnh qua debugSetBarkTuning để test không phụ thuộc may rủi). */
  private barkChance: number = gameConfig.tillDoneBarkChance;
  private barkCooldown: number = gameConfig.tillDoneBarkCooldownSeconds;
  /** Bong bóng chửi thề hiện bao lâu — chép từ gameConfig; QA kéo dài qua debugSetTestTuning cho test không đua giờ (BUG-014). */
  private grumbleSeconds: number = gameConfig.grumbleBubbleSeconds;
  private curseCount = 0;
  private lastCurseSfx: string | null = null;
  private tooTiredCount = 0;
  private eatCount = 0;
  /** Pool chữ bay "+8 Sức" / "−4 Sức". */
  private readonly floats: Phaser.GameObjects.Text[] = [];
  private readonly floatLife: number[] = [];
  private readonly floatBaseY: number[] = [];
  /** Số Sức chữ bay đang hiện (cộng dồn khi gộp — BUG-012). */
  private readonly floatAmount: number[] = [];
  private readonly floatLog: string[] = [];
  // Pool bụi đất (nâu) khi cuốc — cùng cách với bụi chân: tạo sẵn, tái dùng.
  private readonly tillDust: Phaser.GameObjects.Arc[] = [];
  private readonly tillDustLife: number[] = [];
  private readonly tillDustVx: number[] = [];
  private readonly tillDustVy: number[] = [];
  private tillCount = 0;
  private shakeCount = 0;
  private lastSfx: string | null = null;

  // ---- Đồng hồ ngày, màu trời, Tạm dừng (T-005) ----
  /** Ngày + giây thật đã chạy trong ngày. Công khai để HUD đọc; chỉ scene này sửa. */
  readonly dayClock = createDayClock();
  /** Lý do dừng đồng hồ (gùi, Tạm dừng; T-006/T-007 thêm thùng bán, tổng kết…). */
  readonly pauseReasons = new PauseReasons();
  /** Cửa sổ Tạm dừng đang mở: cả thế giới đứng yên. HUD đọc để vẽ cửa sổ. */
  pauseMenuOpen = false;
  /** Con trỏ đang trên nút "Tiếp tục" (HUD tô sáng nút). */
  pauseHoverResume = false;
  private pauseCause: PauseCause | null = null;
  private pauseOpens = 0;
  /** Số lần đồng hồ chạm 24h (tạm: chỉ đứng ở 24:00 — ngủ gục làm ở T-007). */
  private dayEndHits = 0;
  private devHourPresses = 0;
  /** Lớp màu trời phủ thế giới (một hình chữ nhật dùng lại, chỉ đổi màu + độ đục). */
  private skyOverlay!: Phaser.GameObjects.Rectangle;

  // ---- Tiền, thùng bán, sạp hạt (T-006) ----
  /** Ví tiền (quan). Công khai để HUD đọc; chỉ scene này sửa (qua systems/economy.ts — không bao giờ âm). */
  readonly wallet = createWallet(gameConfig.startMoney);
  /** Đồ trong thùng bán — chưa thành tiền, cuối ngày (T-007) mới bán. HUD đọc để vẽ; vẽ lại theo inventoryRevision. */
  readonly sellBox: Inventory = createInventory(gameConfig.sellBoxSlots, gameConfig.sellBoxSlots, gameConfig.stackMax);
  /** T-093: rương trong nhà (chestSlots ô) — cất đồ, không bán. HUD đọc để vẽ; vẽ lại theo inventoryRevision. */
  readonly chest: Inventory = createInventory(gameConfig.chestSlots, gameConfig.chestSlots, gameConfig.stackMax);
  /** Hàng ở sạp hạt (HUD đọc để vẽ nút). */
  readonly seedStallItems: readonly SeedStallItem[] = SEED_STALL;
  /** Cửa sổ thùng bán / sạp hạt đang mở (null = không). Mở = "modal" như gùi. */
  shopWindow: ShopWindow | null = null;
  /** Ô dưới con trỏ trong cửa sổ thùng bán (null = không trúng ô nào). */
  shopHover: { side: SellSide; index: number } | null = null;
  /** Nút mua dưới con trỏ trong cửa sổ sạp hạt (-1 = không). */
  stallHover = -1;
  /** Tăng mỗi khi tiền đổi → HUD vẽ lại số tiền + chữ bay "−4 quan" (lastMoneyDelta). */
  moneyRevision = 0;
  lastMoneyDelta = 0;
  private shopNotice = '';
  private shopNoticeWarn = false;
  private shopNoticeT = 0;
  private readonly shopOpens = { sellBox: 0, seedStall: 0, chest: 0 };
  private chestTransfers = 0;
  private readonly purchases: { cropId: string; count: number; cost: number }[] = [];
  private transfers = 0;
  private interactKeyPresses = 0;
  private lastCoinSfx: string | null = null;

  // ---- Ngủ, ngủ gục, qua đêm, tổng kết (T-007) ----
  /** Đang ở bước nào của chuỗi "đêm" ('none' = chơi bình thường). HUD đọc để vẽ hộp hỏi / lớp tối / tổng kết. */
  nightPhase: NightPhase = 'none';
  /** Giây đã trôi trong bước hiện tại của chuỗi đêm. */
  private nightT = 0;
  /** Độ tối màn 0–1 (HUD vẽ lớp phủ mực). */
  nightFade = 0;
  /** Nút dưới con trỏ ở hộp "Đi ngủ?" (HUD tô sáng). */
  sleepPromptHover: 'yes' | 'no' | null = null;
  /** Con trỏ trên nút "Ngày mới" ở màn tổng kết. */
  summaryHoverButton = false;
  /** Kết quả đêm vừa qua + các dòng chữ của màn tổng kết (HUD đọc). */
  lastSummary: OvernightSummary | null = null;
  summaryLineList: SummaryLine[] = [];
  summaryDetail = '';
  /** Nhịp hiện dần của màn tổng kết. Công khai để HUD đọc (chỉ scene này sửa). */
  summaryReveal: RevealState = createReveal(0);
  private overnightCount = 0;
  private lastOvernightCause: OvernightCause | null = null;
  private sleepPromptOpens = 0;
  private tooEarlyCount = 0;
  private wakeCount = 0;
  private summaryAccepts = 0;
  private summaryTicks = 0;
  /** Số tiền đếm lên lần trước (để biết lúc nào phát tiếng "tách") + lúc phát lần trước (nightT). */
  private summaryMoneyPrev = 0;
  private summaryTickAt = Number.NEGATIVE_INFINITY;

  // ---- "Khoảnh khắc sướng" (T-027) ----
  /** Kỷ lục của lần chơi (lưu trong save version 4). */
  private readonly records = createRecords();
  /** Đêm vừa qua lập kỷ lục tiền bán → màn tổng kết có chữ "Kỷ lục mới!" (HUD đọc). */
  summaryRecord = false;
  private recordSfxPlayed = false;
  /** Xu bay vào / ra ô tiền HUD (systems/juice.ts). HUD đọc để vẽ; chỉ scene này sửa. */
  readonly coins: CoinState = createCoinState();
  readonly coinParams: CoinParams = COIN_PARAMS;
  /** Danh sách đồng xu vừa chạm (dùng lại mỗi frame, không tạo mảng mới). */
  private readonly coinLandings: CoinLanding[] = [];
  /** Tiền bán thùng đêm qua đã vào ví nhưng còn chờ đóng màn tổng kết mới bay xu về ô tiền. */
  private pendingPayout = 0;
  /** Đồng hồ nhịp "gọi hái" của cây chín (giây, đứng khi thế giới đứng). */
  private ripeT = 0;
  /** Chu kỳ gọi hái đã xét của từng ô ruộng (NaN = ô không có cây chín). */
  private readonly ripeCycleSeen: number[] = [];
  private ripeCueCount = 0;
  private ripeHoppingNow = 0;
  /** Pool đốm lấp lánh + đời còn lại (giây). */
  private readonly sparkles: Phaser.GameObjects.Image[] = [];
  private readonly sparkleLife: number[] = [];
  private readonly ripeHopScale = { x: 1, y: 1 };
  private readonly sparklePt = { x: 0, y: 0 };

  // ---- Tự lưu, nạp save, Chơi lại từ đầu (T-008) ----
  /** Tên nhân vật ({ten}) — chưa có màn đặt tên nên là tên mặc định, hoặc tên trong save. */
  playerName: string = gameConfig.defaultPlayerName;
  /** Kết quả đọc save lúc mở game. */
  private loadStatus: 'none' | 'ok' | 'corrupt' = 'none';
  private loadReason: string | null = null;
  private loadAddedItems: string[] = [];
  /** Số lần bấm ô cần cuốc mà không cầm cuốc (QA). */
  private noHoePrompts = 0;
  /** Khung cuốc đang hiện (-1 = không cuốc) — QA. */
  private hoeFrame = -1;
  /** T-023: dáng động tác đang hiện (null = khung đi / đứng) + khung (0–3, -1 = không) — QA. */
  private actionAnimShown: ActionAnim | null = null;
  private actionFrame = -1;
  /** T-023: lần hái gần nhất icon bay ra từ đâu: tay (dáng cúi) hay ô (đang đi) — QA. */
  private lastHarvestFrom: 'hand' | 'tile' | null = null;
  /** Toạ độ px chân lấy từ save (null = đứng ở chỗ xuất phát L.spawn). */
  private loadedFoot: { x: number; y: number } | null = null;
  private loadedElapsed: number | null = null;
  /** Lần lưu gần nhất (HUD hiện "Đã lưu lúc HH:MM · Ngày N"); lúc mới nạp save = thông tin của bản đã nạp. */
  private lastSave: { day: number; hour: number; savedAt: string; reason: string } | null = null;
  private saveCount = 0;
  private saveSkipped = 0;
  /** Ngừng ghi save (vừa bấm "Chơi lại từ đầu" — scene sắp dựng lại; hoặc hook test). */
  private saveSuppressed = false;
  /** Giây thật đã chơi kể từ lần lưu trước (chỉ đếm lúc chơi bình thường) + nhịp tự lưu (QA rút ngắn được). */
  private autoSaveT = 0;
  private autoSaveInterval: number = gameConfig.autoSaveIntervalSeconds;
  /** Con trỏ trên nút "Chơi lại từ đầu" trong cửa sổ Tạm dừng (HUD tô sáng). */
  pauseHoverRestart = false;
  /** Hộp xác nhận "Chơi lại từ đầu?" đang mở (nằm trên cửa sổ Tạm dừng) + nút đang sáng. */
  restartConfirmOpen = false;
  restartConfirmHover: 'yes' | 'no' | null = null;

  // ---- Cảnh trong nhà + chuyển khu (T-093) ----
  /** Khu đang đứng. Công khai để HUD đọc (vd tên khu). */
  area: AreaId = 'garden';
  private readonly areaTransition = createAreaTransition();
  /** Màn mờ chuyển khu (một hình cỡ màn, không cuộn theo camera — như lớp trời). */
  private areaFadeRect!: Phaser.GameObjects.Rectangle;
  /** Giây kể từ lúc vào khu gần nhất (tên khu hiện rồi mờ dần); âm = không hiện. */
  private areaBannerT = -1;
  /** Tên khu đang hiện (HUD vẽ ở giữa trên màn). */
  areaBannerText = '';
  private areaEnters = 0;
  private areaExits = 0;
  /** Khu lấy từ save lúc mở game (vị trí loadedFoot tính trong khu này). */
  private loadedArea: AreaId = 'garden';
  /** Vật trong nhà dưới con trỏ (viền) + có trong tầm click không. */
  private houseHover: { target: HouseTarget; inReach: boolean } | null = null;
  /** Bếp rơm: đốm than hồng + cụm khói (pool, tạo một lần) — chỉ cập nhật khi đang ở trong nhà. */
  private readonly stoveEmbers: Phaser.GameObjects.Arc[] = [];
  private readonly stoveSmoke: Phaser.GameObjects.Arc[] = [];
  private readonly stoveSmokeAge: number[] = [];
  private stoveFire = { x: 0, y: 0 };
  private stoveT = 0;

  // ---- Click đâu đi đó + tự tìm đường (T-096, D-038) ----
  /** Đường đang đi theo click + việc chờ làm khi tới nơi. */
  private readonly clickMove = createClickMove<ClickAction>();
  private readonly pathFinder = new PathFinder();
  /** Lưới tìm đường: Vườn (ô 64 px, từ lưới vật cản — cây tính cả ô) và trong nhà (ô houseNavCellPx). Dựng một lần. */
  private gardenNav!: NavGrid;
  private houseNav!: NavGrid;
  /** Vận tốc đi theo đường (dùng lại, không tạo object mỗi frame). */
  private readonly pathVel = { x: 0, y: 0 };
  /** Đích đang đi (để lập lại đường khi kẹt). */
  private clickGoal: WalkGoal | null = null;
  private clickReplans = 0;
  /** Dấu đích (vòng tròn chỗ click), mờ dần; thời gian còn lại (giây, ≤ 0 = ẩn). */
  private clickMarker!: Phaser.GameObjects.Graphics;
  private clickMarkerT = 0;
  /** Bộ đếm cho QA (debugState.clickMove). */
  /** Con trỏ (màn) lần xét rê trước — rê chỉ tính khi con trỏ di chuyển (T-096b). */
  private dragScreenX = Number.NaN;
  private dragScreenY = Number.NaN;
  /** Số lần kẹt khi đi tới ô đầu hàng chờ (quá clickMoveMaxReplans → bỏ ô đó). */
  private farmStuck = 0;
  private clickStats = { starts: 0, arrivals: 0, actionsDone: 0, cancels: 0, noPath: 0, replans: 0, lastExpanded: 0, lastPlanMs: 0, lastAction: '' };

  // ---- Âm thanh (T-026) ----
  /** Chỗ phát mọi âm thanh (dùng chung cả game, sống qua "Chơi lại từ đầu"). */
  private audio!: AudioManager;
  /** Seed ngẫu nhiên của lần chơi này (save version 3): kiểu gà gáy mỗi sáng tính từ seed + số ngày. */
  private worldSeed = newSeed(Math.random());
  /** Giờ game lần xét âm thanh trước (biết lúc vừa qua 23h → ngáp, kể cả nhảy giờ bằng F9). */
  private audioPrevHour = 0;
  /** Game mới (Ngày 1, mới 6h): chờ âm thanh mở khoá (lần bấm đầu) rồi cho gà gáy chào buổi sáng đầu tiên. */
  private pendingNewGameRooster = false;
  private readonly roosterLog: { day: number; kind: RoosterKind }[] = [];
  private yawnCount = 0;
  private footstepCount = 0;
  private walkContacts = 0;
  /** Nút / nút X dưới con trỏ ở frame trước — đổi sang nút khác: tiếng hover; bấm chuột lúc đang trên nút: tiếng click. */
  private lastUiHover: string | null = null;
  private seenPrimaryPresses = 0;
  /** Nút −/+ âm lượng dưới con trỏ trong cửa sổ Tạm dừng (HUD tô sáng; null = không). */
  pauseVolumeHover: VolumeButtonId | null = null;

  // ---- Chặng 4: tiến trình, cờ, nông cụ, bậc đồ, gia đình, thời tiết + bảng Thử (T-041) ----
  /** Lưu ở save version 5. T-041 chỉ có chỗ lưu + bảng Thử ghi vào; luật từng hệ làm ở T-042, T-043, T-047, T-049… */
  readonly stage4 = createStage4State();
  /** Bảng Thử (chỉ bản dev) đang mở: thế giới đứng yên như Tạm dừng. HUD đọc `cheatPanelModel` để vẽ. */
  cheatPanelOpen = false;
  /** Nút bảng Thử dưới con trỏ (chỉ số trong CHEAT_BUTTONS), -1 = không. */
  private cheatHover = -1;
  /** Món đang chọn để "Cho món" (chỉ số trong CHEAT_RULES.items). */
  private readonly cheatPicker = { itemIndex: defaultPickIndex(CHEAT_RULES) };
  private cheatNotice = '';
  private cheatUses = 0;
  private lastCheatButton: string | null = null;

  gardenReady = false;

  constructor() {
    super({
      key: 'Garden',
      // Arcade Physics: vật lý hộp chữ nhật đơn giản, không trọng lực (nhìn từ trên xuống).
      physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 0 }, debug: false } },
    });
  }

  create(): void {
    this.controls = new InputController(this);
    this.audio = AudioManager.of(this.game);
    // T-008: nạp save TRƯỚC khi dựng ruộng / nhân vật — buildGround vẽ ô đã cuốc theo trạng thái ruộng, buildPlayer đặt
    // nhân vật ở toạ độ trong save. Không có save (hoặc save hỏng) → giữ trạng thái Ngày 1 như cũ.
    this.loadFromStorage();

    this.bakeTextures();
    this.buildGround();
    const solids = this.buildObstacles();
    const houseSolids = this.buildHouse();
    this.buildPlayer();
    this.buildDustPool();
    this.buildTileHighlight();
    this.buildFarmJuice();
    this.buildFloatPool();

    // Giới hạn vật lý + camera theo KHU đang đứng (applyAreaView) — Vườn: cả bản đồ; trong nhà: sàn phòng / ảnh phòng.
    this.physics.add.collider(this.feet, solids);
    this.physics.add.collider(this.feet, houseSolids);
    this.physics.add.collider(this.feet, this.buildCollisionLayer());
    this.buildNavGrids();
    this.buildClickMarker();
    if (physicsDebugFromSearch(window.location.search)) {
      this.physics.world.drawDebug = true;
      this.physics.world.createDebugGraphic();
    }

    // Camera: phóng to cho dễ nhìn, không ra ngoài bản đồ (không lộ khoảng đen), bám theo mượt.
    const cam = this.cameras.main;
    cam.setZoom(gameConfig.cameraZoom);
    cam.startFollow(this.feet, true, gameConfig.cameraLerp, gameConfig.cameraLerp);

    this.buildSkyOverlay();
    this.buildAreaFade();
    this.applyAreaView();
    this.updateSky();
    this.listenFocusLoss();

    this.scene.launch('GardenHud');
    // Chỉ dừng HUD nếu nó còn chạy: "Chơi lại từ đầu" tự dừng HUD trước rồi mới dừng Vườn — không để lệnh dừng xếp hàng
    // (queueOp) rơi trúng HUD MỚI vừa dựng lại.
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      if (this.scene.isActive('GardenHud')) this.scene.stop('GardenHud');
    });
    // T-026: nhạc nền / tiếng nền do tickAudio chọn mỗi frame (chờ âm thanh mở khoá). Game mới lúc sáng sớm → gà gáy chào.
    this.audioPrevHour = this.clockHour;
    this.seenPrimaryPresses = this.controls.primaryPressCount;
    this.pendingNewGameRooster = this.loadStatus !== 'ok' && this.dayClock.day === 1 && this.clockHour < gameConfig.newGameRoosterBeforeHour;
    this.tickAudio(0);

    this.gardenReady = true;
    this.registry.set('gardenReady', true);
  }

  // ---------------------------------------------------------------- dựng bản đồ

  /**
   * Nền (T-021): một Tilemap dựng bằng code từ LOẠI NỀN từng ô (systems/groundTiles.ts) với 4 lớp — lõi (cỏ / lối /
   * sân / đất ruộng theo nấc) → viền luống → mép cỏ → góc lõm. Mỗi tấm tile (asset-list §3) là một tileset; ô ruộng
   * đổi tile khi cuốc / tưới / hái (syncGround). Tilemap chỉ vẽ các ô đang trong khung hình → rẻ hơn hàng nghìn sprite.
   */
  private buildGround(): void {
    this.ensureTileTextures();
    this.groundKinds = buildGroundKinds(L);
    const map = this.make.tilemap({ tileWidth: T, tileHeight: T, width: L.cols, height: L.rows });
    const sets = {} as Record<TileSheetName, Phaser.Tilemaps.Tileset>;
    let gid = 0;
    for (const [name, count] of Object.entries(TILE_SHEETS) as [TileSheetName, number][]) {
      const ts = map.addTilesetImage(name, tileKey(name), T, T, TILE_SHEET.margin, TILE_SHEET.spacing, gid);
      if (!ts) throw new Error(`Không tạo được tileset ${name}`);
      sets[name] = ts;
      this.tileGid[name] = gid;
      gid += count;
    }
    const coreSets = [sets.grass, sets.path, sets.yard, ...SOIL_TEXTURES.map((n) => sets[n])];
    const layer = (name: string, tilesets: Phaser.Tilemaps.Tileset | Phaser.Tilemaps.Tileset[], depth: number) => {
      const l = map.createBlankLayer(name, tilesets);
      if (!l) throw new Error(`Không tạo được lớp nền ${name}`);
      return l.setDepth(depth);
    };
    this.groundLayer = layer('core', coreSets, DEPTH_GROUND);
    this.ridgeLayer = layer('ridge', sets['soil-tilled-edge'], DEPTH_GROUND_RIDGE);
    const edgeLayer = layer('grass-edge', sets['path-edge'], DEPTH_GROUND_EDGE);
    // Góc lõm: một ô có thể cần tới 4 góc → mỗi góc một lớp (chỉ tạo khi bản đồ có góc đó).
    const cornerLayers: (Phaser.Tilemaps.TilemapLayer | null)[] = [null, null, null, null];

    const gEdge = this.tileGid['path-edge']!;
    const gCorner = this.tileGid['path-corner']!;
    for (let y = 0; y < L.rows; y++) {
      for (let x = 0; x < L.cols; x++) {
        const kind = this.groundKinds[y][x];
        // Ô ruộng đặt lõi ở syncGround (theo nấc cuốc / tưới).
        if (kind !== 'soil') this.groundLayer.putTileAt(this.tileGid[KIND_TEXTURE[kind]]! + coreCell(x, y), x, y);
        const mask = grassEdgeMask(this.groundKinds, x, y);
        if (mask) edgeLayer.putTileAt(gEdge + mask, x, y);
        for (const c of concaveCorners(this.groundKinds, x, y)) {
          const cl = (cornerLayers[c] ??= layer(`corner-${c}`, sets['path-corner'], DEPTH_GROUND_CORNER));
          cl.putTileAt(gCorner + c, x, y);
        }
      }
    }

    for (const plot of this.farm.plots) {
      this.plotBars.push(this.add.graphics().setDepth(DEPTH_TILL_UI));
      this.plotDrawn.push(-1);
      this.plotFlash.push(0);
      this.plotLook.push(-1);
      this.plotTilled.push(false);
      // Cây: depth = gốc cây → {ten} đứng dưới ô thì che cây, đứng trên thì bị cây che. Sprite đặt đáy-giữa ô
      // (đáy khung 64×96 = đáy ô, cây cao tràn lên ô trên); Graphics dự phòng vẽ ở góc ô như cũ.
      const depth = plot.y * T + T * CROP_BASE;
      this.plotCropSprites.push(
        this.add.sprite(plot.x * T + T / 2, (plot.y + 1) * T, '__DEFAULT').setOrigin(0.5, 1).setDepth(depth).setVisible(false),
      );
      this.plotCrops.push(this.add.graphics().setPosition(plot.x * T, plot.y * T).setDepth(depth));
      this.cropDrawn.push(-1);
    }
    this.syncGround(true);
  }

  /**
   * Tấm tile thiếu ảnh (tải lỗi) → log cảnh báo và vẽ tạm bằng code một texture CÙNG khổ / cùng đệm như bản `-ex`
   * (lõi = màu phẳng theo bảng màu, viền = vệt mảnh theo mask) — game vẫn chạy, Tilemap không phải đổi gì.
   */
  private ensureTileTextures(): void {
    const { margin, spacing } = TILE_SHEET;
    const flat: Partial<Record<TileSheetName, number>> = {
      grass: palette.sprout,
      path: palette.wood,
      yard: mixColor(palette.wood, palette.paper, 0.2),
      'soil-dry': mixColor(palette.wood, palette.earth, 0.35),
      'soil-till-1': mixColor(palette.wood, palette.earth, 0.55),
      'soil-till-2': mixColor(palette.wood, palette.earth, 0.75),
      'soil-tilled': palette.earth,
      'soil-watered': mixColor(palette.earth, palette.ink, 0.4),
    };
    for (const [name, count] of Object.entries(TILE_SHEETS) as [TileSheetName, number][]) {
      const key = tileKey(name);
      if (this.textures.exists(key)) continue;
      console.warn(`[Garden] Thiếu ảnh tile ${key} — vẽ tạm bằng code`);
      this.tileFallbacks.push(name);
      const cells = Math.round(Math.sqrt(count));
      const size = margin * 2 + cells * T + (cells - 1) * spacing;
      const g = this.make.graphics({}, false);
      for (let i = 0; i < count; i++) {
        const x0 = margin + (i % cells) * (T + spacing);
        const y0 = margin + Math.floor(i / cells) * (T + spacing);
        const color = flat[name];
        if (color !== undefined) {
          g.fillStyle(color, 1).fillRect(x0 - margin, y0 - margin, T + 2 * margin, T + 2 * margin);
        } else if (name !== 'path-corner') {
          // Viền: vệt dọc các cạnh có bit trong mask (ô thứ i = mask i).
          g.fillStyle(name === 'path-edge' ? palette.jade : palette.ink, 0.8);
          if (i & 1) g.fillRect(x0, y0, T, 5);
          if (i & 2) g.fillRect(x0 + T - 5, y0, 5, T);
          if (i & 4) g.fillRect(x0, y0 + T - 5, T, 5);
          if (i & 8) g.fillRect(x0, y0, 5, T);
        }
      }
      g.generateTexture(key, size, size);
      g.destroy();
    }
  }

  /**
   * Đồng bộ tile ô ruộng với trạng thái ruộng (gọi mỗi frame — chỉ đặt lại ô nào ĐỔI): lõi theo nấc cuốc / đã tưới,
   * viền luống tính lại cho cả ruộng khi có ô đổi giữa "đã cuốc" và "chưa" (viền ô bên cạnh cũng đổi theo).
   */
  private syncGround(force = false): void {
    const n = this.tillTuning.strikesPerPlot;
    let ridgeDirty = force;
    for (let i = 0; i < this.farm.plots.length; i++) {
      const plot = this.farm.plots[i];
      const look = soilLookIndex(plot, n, gameConfig.tillVisualStages);
      if (force || look !== this.plotLook[i]) {
        this.plotLook[i] = look;
        this.groundLayer.putTileAt(this.tileGid[SOIL_TEXTURES[look]]! + coreCell(plot.x, plot.y), plot.x, plot.y);
      }
      const tilled = isTilledLook(plot);
      if (tilled !== this.plotTilled[i]) {
        this.plotTilled[i] = tilled;
        ridgeDirty = true;
      }
    }
    if (!ridgeDirty) return;
    const tilledAt = (x: number, y: number): boolean | null => {
      if (x < 0 || y < 0 || x >= L.cols || y >= L.rows) return null;
      const p = plotAt(this.farm, x, y);
      return p ? isTilledLook(p) : false;
    };
    const gRidge = this.tileGid['soil-tilled-edge']!;
    for (const plot of this.farm.plots) {
      const mask = tilledEdgeMask(plot.x, plot.y, tilledAt);
      if (mask) this.ridgeLayer.putTileAt(gRidge + mask, plot.x, plot.y);
      else this.ridgeLayer.removeTileAt(plot.x, plot.y);
    }
  }

  /** Tên khung một ô (chỉ số `cell`) trong tấm tile `-ex` — tạo khung lần đầu cần (để Image hiện đúng một ô). */
  private tileFrame(name: TileSheetName, cell: number): string {
    const tex = this.textures.get(tileKey(name));
    const frame = `cell-${cell}`;
    if (!tex.has(frame)) {
      const { margin, spacing } = TILE_SHEET;
      const cells = Math.round(Math.sqrt(TILE_SHEETS[name]));
      tex.add(frame, 0, margin + (cell % cells) * (T + spacing), margin + Math.floor(cell / cells) * (T + spacing), T, T);
    }
    return frame;
  }

  /**
   * Lớp va chạm Tilemap (vô hình): mỗi ô rào/tường/giường/ao là một ô "collides".
   * Phaser bỏ qua mặt chung giữa hai ô chặn liền nhau → trượt dọc tường không vấp ở mối nối (BUG-001).
   */
  private buildCollisionLayer(): Phaser.Tilemaps.TilemapLayer {
    this.solidGrid = tileSolidGrid(L);
    const data = this.solidGrid.map((row) => row.map((solid) => (solid ? 0 : -1)));
    const map = this.make.tilemap({ data, tileWidth: T, tileHeight: T });
    // Cần một tileset để tạo layer; ảnh không quan trọng vì layer bị ẩn.
    const ts = map.addTilesetImage('solid', tileKey('soil-tilled'), T, T, TILE_SHEET.margin, TILE_SHEET.spacing, 0);
    const layer = ts ? map.createLayer(0, ts, 0, 0) : null;
    if (!layer) throw new Error('Không tạo được lớp va chạm Vườn');
    layer.setVisible(false).setCollision(0);
    this.collisionLayer = layer;
    return layer;
  }

  /**
   * Vẽ đồ vật Vườn (T-024: hình thật theo props/props.json) + ao; tạo hộp va chạm gốc cây. Trả về danh sách hộp.
   * Rào, nhà (chân đế), giường, ao, thúng bán, chân quầy hạt chặn bằng lớp va chạm Tilemap (buildCollisionLayer);
   * ở đây chỉ vẽ. Mọi ảnh origin (0.5, 1) tại tâm-đáy, depth = y đáy (đi phía sau thì vật che người).
   */
  private buildObstacles(): Phaser.GameObjects.Zone[] {
    const solids: Phaser.GameObjects.Zone[] = [];
    const addSolid = (x: number, y: number, w: number, h: number) => {
      const z = this.add.zone(x + w / 2, y + h / 2, w, h);
      this.physics.add.existing(z, true); // true = static: đứng yên, không bị đẩy
      solids.push(z);
    };

    // Rào: viền bản đồ + các đoạn thêm (gardenLayout `fences`) → mảnh hình theo vị trí trong đoạn (systems/propArt.ts).
    for (const line of [...borderFenceLines(L.cols, L.rows, L.borderFence), ...L.fences]) {
      for (const piece of fencePieces(line, T)) this.addFencePiece(piece);
    }

    // Nhà {ten} (bên ngoài): một ảnh, chân đế 6×2 ô chặn; mái phía trên đi sau được (depth = đáy nhà → mái che người).
    // Chõng trên hiên (L.bed, vẽ sẵn trong ảnh nhà): từ T-093 không ngủ ở đây nữa — F / click chỉ nhắc vào nhà mà ngủ.
    this.addProp(L.houseProp.prop, L.houseProp.x, L.houseProp.y);

    // Ao nước: nằm sát đất, chặn cả khối (hình khối tới T-033).
    const p = L.pond;
    this.add.image(p.x * T, p.y * T, TEX.pond).setOrigin(0).setDepth(DEPTH_GROUND_DECOR);

    // T-006 / T-024: thúng bán (đổi ảnh đóng / hé theo có đồ chờ bán — updateSellBasket) + quầy hạt (chưa người bán, D-037).
    this.sellBasket = this.addProp(sellBasketKey(false), L.sellBoxProp.x, L.sellBoxProp.y);
    this.sellBasketShown = sellBasketKey(false);
    this.addNameTag(L.sellBox, 'Thùng bán', this.sellBasket);
    const stall = this.addProp(L.seedStallProp.prop, L.seedStallProp.x, L.seedStallProp.y);
    this.addNameTag(L.seedStall, 'Sạp hạt', stall);

    // Cọc rào mở ruộng: tạo sẵn, ẩn tới T-044 (mua thêm ô ruộng).
    for (const s of L.stakes) this.stakes.push(this.addProp(s.prop, s.x, s.y).setVisible(false));

    // Cây nhãn: gốc (depth = đáy, chỉ gốc chặn — hộp nhỏ treeTrunkHitbox) + tán CÙNG toạ độ, luôn vẽ trên nhân vật.
    const [trunkW, trunkH] = gameConfig.treeTrunkHitbox;
    for (const [tx, ty] of L.trees) {
      const trunk = this.addProp(L.tree.trunk, tx, ty);
      const baseY = trunk.y - 12; // chân gốc (trên mép dưới ô một chút — rễ loe)
      addSolid(trunk.x - trunkW / 2, baseY - trunkH, trunkW, trunkH);
      const canopy = this.addProp(L.tree.canopy, tx, ty).setDepth(DEPTH_CANOPY);
      const left = canopy.x - canopy.displayWidth / 2;
      const top = canopy.y - canopy.displayHeight;
      this.canopies.push(canopy);
      this.canopyBoxes.push({
        left: left + CANOPY_LEAVES.x,
        top: top + CANOPY_LEAVES.y,
        right: left + CANOPY_LEAVES.x + CANOPY_LEAVES.w,
        bottom: top + CANOPY_LEAVES.y + CANOPY_LEAVES.h,
      });
    }
    return solids;
  }

  /**
   * Đặt một ảnh đồ vật theo props.json: chân đế bắt đầu ở ô (footX, footY) → tâm-đáy ảnh (systems/props.ts).
   * Ảnh chưa tải được → texture tạm vẽ bằng code cùng cỡ (ensurePropTexture).
   */
  private addProp(key: string, footX: number, footY: number): Phaser.GameObjects.Image {
    this.ensurePropTexture(key);
    const at = propPlacement(key, footX, footY, T);
    return this.add.image(at.x, at.bottom, key).setOrigin(0.5, 1).setDepth(at.bottom);
  }

  /** Một mảnh rào (ảnh hedge giữa nhiều cột thì cắt đúng cột). */
  private addFencePiece(piece: FencePiece): void {
    this.ensurePropTexture(piece.key);
    let frame: string | undefined;
    if (piece.col !== null) {
      const tex = this.textures.get(piece.key);
      const [w, h] = propSpec(piece.key).size;
      const colW = w / HEDGE_MID_COLS;
      frame = `col-${piece.col}`;
      if (!tex.has(frame)) tex.add(frame, 0, piece.col * colW, 0, colW, h);
    }
    this.add.image(piece.x, piece.bottom, piece.key, frame).setOrigin(0.5, 1).setDepth(piece.depth);
  }

  /**
   * Ảnh đồ vật thiếu (tải lỗi) → log cảnh báo + vẽ tạm khối gỗ viền mực cùng cỡ props.json (giống T-021) — game chạy tiếp.
   */
  private ensurePropTexture(key: string): void {
    if (this.textures.exists(key)) return;
    console.warn(`[Garden] Thiếu ảnh ${key} — vẽ tạm bằng code`);
    this.propFallbacks.push(key);
    const [w, h] = propSpec(key).size;
    const g = this.make.graphics({}, false);
    const canopy = key.endsWith('-canopy');
    g.fillStyle(canopy ? palette.jade : palette.wood, canopy ? 0.9 : 1).fillRoundedRect(2, 2, w - 4, h - 4, Math.min(12, w / 4));
    g.lineStyle(3, palette.ink, 1).strokeRoundedRect(2, 2, w - 4, h - 4, Math.min(12, w / 4));
    g.generateTexture(key, w, h);
    g.destroy();
  }

  /** Bảng tên nhỏ phía trên một vật tương tác (để người mới nhận ra). */
  private addNameTag(r: TileRect, label: string, img: Phaser.GameObjects.Image): void {
    const bottom = (r.y + r.h) * T;
    // Chữ thế giới 17px × cameraZoom 1.5 ≈ 25px trên màn 1080p.
    this.add
      .text(img.x, img.y - img.displayHeight - 4, label, { ...textStyles.nameTag, fontSize: '17px', strokeThickness: 5 })
      .setOrigin(0.5, 1)
      .setResolution(2)
      .setDepth(bottom + 1);
  }

  /** T-024: thúng bán hé nắp khi có đồ chờ bán (bán qua đêm), đóng khi trống — chỉ đổi ảnh khi trạng thái đổi. */
  private updateSellBasket(): void {
    if (!this.sellBasket) return;
    const key = sellBasketKey(this.sellBox.slots.some((s) => s !== null));
    if (key === this.sellBasketShown) return;
    this.ensurePropTexture(key);
    // Hai ảnh khác cỡ (đóng 64, hé 96) nhưng chung tâm-đáy (props.json) → chỉ đổi texture, giữ vị trí.
    this.sellBasket.setTexture(key);
    this.sellBasketShown = key;
  }

  /**
   * Vẽ sẵn hình khối placeholder thành texture MỘT lần, rồi dùng Image (rẻ, được gộp lô khi vẽ).
   * T-024: nhà, cây, rào, thúng, quầy đã có hình thật — chỉ còn ao (Lô 2).
   */
  private bakeTextures(): void {
    if (this.textures.exists(TEX.pond)) return; // đã vẽ ở lần vào Vườn trước
    const p = L.pond;
    const pw = p.w * T;
    const ph = p.h * T;
    const g = this.make.graphics({}, false);
    g.fillStyle(palette.water).fillRoundedRect(2, 2, pw - 4, ph - 4, 28);
    g.fillStyle(palette.indigo, 0.55).fillRoundedRect(40, 36, pw - 80, ph - 72, 22);
    g.lineStyle(4, palette.ink).strokeRoundedRect(2, 2, pw - 4, ph - 4, 28);
    g.lineStyle(2, palette.paper, 0.6).lineBetween(70, 60, 130, 60).lineBetween(220, 200, 300, 200);
    g.generateTexture(TEX.pond, pw, ph);
    g.destroy();
  }

  // ---------------------------------------------------------------- nhân vật

  private buildPlayer(): void {
    const [fw, fh] = gameConfig.playerFootHitbox;
    // T-008: đứng ở toạ độ trong save, trừ khi ô đó là vật cản (bản đồ đổi sau khi lưu) → về chỗ xuất phát.
    const saved = this.loadedFoot;
    let x: number;
    let y: number;
    if (this.loadedArea === 'house') {
      // T-093: save trong nhà — toạ độ tính từ góc ảnh phòng. Chỗ đó không còn trống (đồ đạc dời) → đứng ở cửa.
      const wx = saved ? HOUSE.origin.x + saved.x : Number.NaN;
      const wy = saved ? HOUSE.origin.y + saved.y : Number.NaN;
      const ok = saved !== null && isFreeHouseSpot(HOUSE, wx, wy, fw, fh);
      x = ok ? wx : HOUSE.spawn.x;
      y = ok ? wy : HOUSE.spawn.y;
      this.area = 'house';
    } else {
      const savedTile = saved ? tileOf(saved.x, saved.y, T) : null;
      // (Lưới ô chặn tính thẳng ở đây — this.solidGrid chỉ có sau buildCollisionLayer, chạy sau buildPlayer.)
      const savedOk = saved !== null && savedTile !== null && tileSolidGrid(L)[savedTile.y]?.[savedTile.x] === false;
      x = savedOk ? saved.x : L.spawn.x * T;
      y = savedOk ? saved.y : L.spawn.y * T;
      this.area = 'garden';
    }
    this.feet = this.add.zone(x, y, fw, fh);
    this.physics.add.existing(this.feet);
    this.feetBody = this.feet.body as Phaser.Physics.Arcade.Body;
    this.feetBody.setCollideWorldBounds(true);
    this.prevFootX = x;
    this.prevFootY = y;

    this.heroShadow = this.add.ellipse(x, y + fh / 2, 46, 16, palette.ink, 0.3).setDepth(DEPTH_SHADOW);
    // Gốc toạ độ ở chân (0.5, 1): co giãn quanh bàn chân, và depth = Y chân.
    // Đứng: ảnh chống nạnh (hero-t1-<hướng>). Đi: anim dọc 4 / ngang 6 khung (hero-t1-walk-<hướng>).
    // Đổi hướng: chèn khung chéo (hero-t1-turn).
    this.hero = this.add.sprite(x, y + fh / 2, heroTextureKey(1, this.facing)).setOrigin(0.5, 1);
    this.createWalkAnims();
    // Mỗi lần anim đổi khung: khung chạm gót → bụi chân; đi lên thì nhích 1px.
    this.hero.on(Phaser.Animations.Events.ANIMATION_UPDATE, this.handleWalkFrame, this);
    this.hero.on(Phaser.Animations.Events.ANIMATION_START, this.handleWalkFrame, this);
  }

  /** 4 animation đi (một cho mỗi hướng), lặp vô hạn: dọc 4 khung, ngang 6 khung. Chỉ tạo một lần cho cả game. */
  private createWalkAnims(): void {
    for (const facing of ['down', 'up', 'left', 'right'] as const) {
      const key = heroWalkKey(1, facing);
      if (this.anims.exists(key)) continue;
      const side = isSideFacing(facing);
      const count = side ? gameConfig.walkSideFrames : gameConfig.walkVerticalFrames;
      this.anims.create({
        key,
        frames: this.anims.generateFrameNumbers(key, { start: 0, end: count - 1 }),
        frameRate: side ? gameConfig.walkSideFrameRate : gameConfig.walkVerticalFrameRate,
        repeat: -1,
      });
    }
  }

  private handleWalkFrame(_anim: Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame): void {
    const index = Number(frame.textureFrame);
    const event = onWalkFrame(this.walk, index, this.facing, WALK_PARAMS);
    if (event === 'dust') this.kickDust(this.feetBody.center.x, this.feetBody.bottom, this.lastDirX);
    if (event !== 'none') this.footstep();
  }

  /**
   * T-026: chạm gót → tiếng bước nhỏ (Should, `walkFootstepSfx`): trên cỏ tiếng cỏ, còn lại (lối, sân, ruộng, sàn nhà) tiếng
   * đất. Chỉ khi đang thật sự đi (anim bước chạy) — đứng / bị tường chặn thì không có khung chạm gót nên không kêu.
   */
  private footstep(): void {
    if (!gameConfig.walkFootstepSfx || this.nightPhase !== 'none') return;
    this.walkContacts++;
    if (this.walkContacts % Math.max(1, gameConfig.walkFootstepEverySteps) !== 0) return;
    let kind: GroundKind | null = null;
    if (this.area === 'garden') {
      const t = tileOf(this.feetBody.center.x, this.feetBody.center.y, T);
      kind = this.groundKinds[t.y]?.[t.x] ?? null;
    }
    if (this.audio.play(footstepSurface(kind) === 'grass' ? 'stepGrass' : 'stepDirt')) this.footstepCount++;
  }

  private buildDustPool(): void {
    for (let i = 0; i < gameConfig.walkDustPoolSize; i++) {
      this.dust.push(this.add.circle(0, 0, 7, palette.paper, 1).setVisible(false).setDepth(DEPTH_SHADOW + 1));
      this.dustLife.push(0);
      this.dustVx.push(0);
    }
  }

  /** Tung 2 đốm bụi ở gót, bay ngược hướng đi. */
  private kickDust(x: number, y: number, dirX: number): void {
    let spawned = 0;
    for (let i = 0; i < this.dust.length && spawned < 2; i++) {
      if (this.dustLife[i] > 0) continue;
      const side = spawned === 0 ? -1 : 1;
      this.dust[i].setPosition(x + side * 10, y - 2).setVisible(true).setAlpha(0.6).setScale(0.6);
      this.dustLife[i] = gameConfig.walkDustLifeSeconds;
      this.dustVx[i] = -dirX * 30 + side * 14;
      spawned++;
    }
  }

  private updateDust(dt: number): void {
    const life = gameConfig.walkDustLifeSeconds;
    for (let i = 0; i < this.dust.length; i++) {
      if (this.dustLife[i] <= 0) continue;
      this.dustLife[i] -= dt;
      const puff = this.dust[i];
      if (this.dustLife[i] <= 0) {
        puff.setVisible(false);
        continue;
      }
      const t = 1 - this.dustLife[i] / life; // 0 → 1
      puff.x += this.dustVx[i] * dt;
      puff.y -= 18 * dt;
      puff.setAlpha(0.6 * (1 - t)).setScale(0.6 + t);
    }
  }

  // ---------------------------------------------------------------- vòng lặp

  /**
   * Game loop: Phaser gọi ~60 lần/giây; `delta` = mili-giây từ frame trước.
   * Ta chỉ ĐẶT vận tốc cho hộp chân; Arcade Physics tự di chuyển + chặn va chạm ở bước vật lý.
   */
  override update(_time: number, delta: number): void {
    this.updateFrame(delta);
    // T-026: âm thanh chạy mọi frame (kể cả Tạm dừng / chuỗi đêm / chuyển khu): nhạc theo giờ + khu, ngáp, gà, hover / click.
    // Giờ thật giữa hai frame, chặn trên như đồng hồ ngày (máy đơ / vừa quay lại tab không làm nhạc nhảy cóc).
    this.tickAudio(Math.min(this.game.loop.rawDelta / 1000, gameConfig.dayClockMaxStepSeconds));
  }

  /** Một frame của thế giới (các nhánh Tạm dừng / chuỗi đêm / chuyển khu return sớm). */
  private updateFrame(delta: number): void {
    const dt = delta / 1000;
    // T-005: đang Tạm dừng → chỉ nghe Esc / nút "Tiếp tục", bỏ mọi phím khác; thế giới không tiến (return sớm, không
    // gọi bất cứ hàm update nào bên dưới → việc, bụi, bong bóng, chữ bay, đồng hồ đều đứng yên đúng chỗ).
    if (this.pauseMenuOpen) {
      this.updatePauseMenu();
      return;
    }
    this.clock += dt;
    // T-027: xu bay về ô tiền chạy cả lúc đang sáng dần (thức dậy) / chuyển khu — chỉ đứng khi Tạm dừng (return ở trên).
    this.tickCoins(dt);
    // T-041: bảng Thử mở → chỉ xử lý bảng (thế giới đứng yên như Tạm dừng; xu bay vẫn bay để thấy "+100 quan" về ô tiền).
    if (this.cheatPanelOpen) {
      this.updateCheatPanel();
      return;
    }
    // T-007: đang hỏi ngủ / ngủ / ngủ gục / tổng kết / thức dậy → chỉ chạy chuỗi "đêm" (thế giới đứng yên, đồng hồ dừng).
    if (this.nightPhase !== 'none') {
      this.updateNight(dt);
      this.controls.endFrame();
      return;
    }
    // T-093: đang chuyển khu (màn mờ) → nhân vật đứng yên, phím bỏ qua, đồng hồ đứng (lý do 'areaFade'); vài giây là xong.
    if (isTransitioning(this.areaTransition)) {
      this.updateAreaTransition(dt);
      this.controls.endFrame();
      return;
    }
    // Tốc độ chuẩn (đủ Sức) — dùng để đo nhịp bước. Đuối thì đi chậm (moveSpeed) → tỷ lệ tốc độ thật ~0.5 → anim
    // bước tự chậm theo (walkTimeScale), chân không "trượt".
    const speed = gameConfig.walkSpeed * T;
    const moveSpeed = speed * walkSpeedMultiplier(this.stamina, gameConfig.staminaExhaustedSpeedMultiplier);
    // T-003: phím bấm-một-lần (1–9, cuộn, E/Esc, G) trước, để mở gùi có tác dụng ngay frame này.
    this.handleUiKeys();
    if (this.pauseMenuOpen || this.cheatPanelOpen) return; // Esc vừa mở Tạm dừng / F2 vừa mở bảng Thử ở frame này
    if (this.nightPhase !== 'none') {
      // F ở giường vừa mở hộp "Đi ngủ?", hoặc F9 vừa đẩy đồng hồ tới 24h (ngủ gục) → frame sau chạy chuỗi đêm.
      this.controls.endFrame();
      return;
    }
    // Đồng hồ ngày chạy khi không có lý do dừng (gùi, Tạm dừng…) — kể cả lúc đang cuốc (D-022: cuốc là làm việc).
    // Dùng thời gian THẬT giữa hai frame (rawDelta), không dùng `delta` đã làm mượt: Phaser chặn `delta` ≤ 1/60 s trong
    // ~120 frame đầu và sau khi quay lại tab → máy chậm thì ngày dài hơn 600 giây thật. Chặn trên dayClockMaxStepSeconds
    // để một frame bị treo lâu (máy đơ) không làm nhảy giờ.
    const clockDt = Math.min(this.game.loop.rawDelta / 1000, gameConfig.dayClockMaxStepSeconds);
    if (advanceDayClock(this.dayClock, clockDt, this.pauseReasons.stopped, gameConfig)) this.onDayEndReached();
    this.updateSky();
    if (this.nightPhase !== 'none') {
      this.controls.endFrame(); // vừa chạm 24h → ngủ gục bắt đầu từ frame sau
      return;
    }
    // T-008: tự lưu theo giờ thật (chỉ lúc chơi bình thường — Tạm dừng / chuỗi đêm đã return ở trên).
    this.tickAutoSave(clockDt);
    // Cửa sổ gùi / thùng bán / sạp hạt mở = "modal": không đi, việc trên ô đứng yên (không mất nhát), click không xuống ruộng.
    const modal = this.windowOpen;
    if (this.shopNoticeT > 0) this.shopNoticeT = Math.max(0, this.shopNoticeT - dt);
    if (this.areaBannerT >= 0) this.areaBannerT += dt;
    const wantDir = modal ? NO_DIR : this.controls.moveDirection();
    const wantsToMove = wantDir.x !== 0 || wantDir.y !== 0;
    // Chạm phím đi (kể cả nhấn + nhả lọt giữa hai frame — BUG-007). Luôn "tiêu thụ" mỗi frame để lần chạm cũ
    // không bỏ dở một lần cuốc sau.
    const tappedMove = this.controls.consumeMovePress() && !modal;

    // D-022: bấm phím đi khi đang CUỐC = BỎ DỞ — dừng ngay, đi được luôn trong frame này. Ô giữ số nhát
    // đã chạm (nhát đang giơ chưa chạm thì không tính), hàng chờ bị xóa. Việc nhanh (gieo/tưới/hái/dọn) thì không.
    if ((wantsToMove || tappedMove) && this.isTilling()) this.abandonTill();
    // T-096: bấm WASD = thôi đi theo click (và thôi việc chờ làm khi tới nơi). Cửa sổ mở cũng thôi.
    if ((wantsToMove || tappedMove || modal) && this.clickMove.active) this.cancelWalk();
    // T-096b: WASD cũng bỏ hàng chờ việc ruộng (đang đi tới ô kế). Việc nhanh đang làm dở thì làm nốt.
    if ((wantsToMove || tappedMove) && this.action.queue.length > 0) {
      this.action.queue.length = 0;
      if (!isBusy(this.action)) this.action.kind = null;
    }

    // Khựng hình (nhát cuối): đứng hình cả động tác lẫn bụi trong vài chục mili-giây — cảm giác "chốt".
    const frozen = this.hitStop > 0;
    if (frozen) this.hitStop = Math.max(0, this.hitStop - dt);
    const workDt = frozen || modal ? 0 : dt;

    // Chỉ ô bằng chuột → xin việc cho ô → tiến việc đang làm (quay mặt, chạm, xong ô).
    this.updatePointer(dt, wantsToMove);
    if (!wantsToMove && !modal && !frozen) this.driveTileQueue();
    this.updateTileAction(workDt, wantsToMove || this.clickMove.active);
    // Đang CUỐC thì đứng yên (GDD §3.3a) — phím đi đã xử lý ở trên (bỏ dở). Việc nhanh vẫn đi được (D-022).
    const busy = isBusy(this.action);
    const dir = this.isTilling() ? NO_DIR : wantDir;
    // T-096: không bấm WASD mà đang có đường click → đi theo đường (tới tầm với / tới nơi thì làm việc chờ).
    const following = this.clickMove.active && !wantsToMove && !modal && !this.isTilling();
    let v: { x: number; y: number };
    if (following) {
      v = this.followClickPath(dt, moveSpeed);
    } else {
      v = moveVelocity(dir, moveSpeed); // đi chéo đã chuẩn hoá, không nhanh hơn đi thẳng
      // Nắn vào cửa: đi thẳng vào tường mà chỉ lệch mép khe ≤ cornerNudgePx → tự trượt ngang vào khe.
      const b = this.feetBody;
      const blockedAhead = (dir.y < 0 && b.blocked.up) || (dir.y > 0 && b.blocked.down) || (dir.x < 0 && b.blocked.left) || (dir.x > 0 && b.blocked.right);
      // (Trong nhà không nắn: lưới ô chặn chỉ có cho Vườn; phòng không có khe hẹp nào cần nắn.)
      if (blockedAhead && this.area === 'garden') {
        const nudge = cornerNudge(this.solidGrid, b, dir, T, gameConfig.cornerNudgePx);
        if (nudge.x !== 0) v.x = nudge.x * moveSpeed;
        if (nudge.y !== 0) v.y = nudge.y * moveSpeed;
      }
    }
    this.feetBody.setVelocity(v.x, v.y);
    // T-093: bấm đi vào cửa nhà (W ở bậc thềm) / ra khe cửa (S trong nhà) → chuyển khu (màn mờ bắt đầu từ frame sau).
    // Đi theo click thì cửa do việc chờ 'door' lo (followClickPath), không xét ở đây.
    if (!following) this.checkDoors(dir.y);

    // Tốc độ THẬT (sau va chạm) quyết định nhịp bước: bị tường chặn thì đứng, không giậm chân tại chỗ.
    const fx = this.feetBody.center.x;
    const fy = this.feetBody.center.y;
    const moved = Math.hypot(fx - this.prevFootX, fy - this.prevFootY);
    this.prevFootX = fx;
    this.prevFootY = fy;
    const rawRatio = dt > 0 ? moved / (speed * dt) : 0;
    // Làm mượt: màn 144Hz có frame không có bước vật lý nào (vật lý chạy 60 lần/giây) → tốc độ đo
    // nhảy 0 ↔ 2.4; lấy trung bình ngắn để anim không giật dừng/chạy.
    this.speedRatio = smoothSpeedRatio(this.speedRatio, rawRatio, dt, gameConfig.walkSpeedSmoothing);
    if (following) {
      if (Math.abs(v.x) > 1) this.lastDirX = Math.sign(v.x);
    } else if (dir.x !== 0) this.lastDirX = dir.x;

    const newFacing = following ? facingFromVector(v.x, v.y, this.facing) : facingFromDirection(dir, this.facing);
    // Tiến khung xoay đang dở TRƯỚC, rồi mới bắt đầu cú xoay mới (nếu có) — cú mới giữ đủ thời gian.
    stepTurn(this.turn, dt, TURN_FRAME_SEC);
    if (newFacing !== this.facing) {
      startTurn(this.turn, this.facing, newFacing, this.lastDirX, TURN_FRAME_SEC);
      this.facing = newFacing;
    }

    stepWalkAnim(this.walk, this.speedRatio, dt, WALK_PARAMS);
    this.updateHeroAnim(walkTimeScale(this.speedRatio));
    const pose = this.walk.pose;
    const footBottom = this.feetBody.bottom;

    // Nhún mỗi động tác NHANH (squash & stretch) nhân với nhịp thở. Cuốc (T-009) đã có hoạt ảnh thật (updateHeroAnim)
    // → không nhún nữa (nhún thêm làm thân méo, cán cuốc co giãn theo).
    // T-023: đứng làm việc nhanh đã có dáng tưới / cúi thật → chỉ còn nhún khi ĐANG ĐI mà làm (khung bước, xem showActionPose).
    const posed = this.actionAnimShown !== null;
    const params = this.paramsFor(this.action.kind);
    const progress = busy && !posed ? this.action.elapsed / params.duration : 0;
    actionPose(progress, params.impactAt, gameConfig.actionSquash, gameConfig.actionStretch, this.pose);
    // Đang hiện dáng động tác (cuốc / tưới / cúi): hình vẽ sẵn đủ động tác → không thở / nhún (co giãn làm méo, nhòe pixel).
    this.hero
      .setPosition(fx, footBottom + (posed ? 0 : pose.offsetY))
      .setScale(posed ? 1 : this.pose.scaleX, posed ? 1 : pose.scaleY * this.pose.scaleY)
      .setDepth(footBottom);
    this.heroShadow.setPosition(fx, footBottom - 2);

    this.fadeTreesInFront(fx, footBottom);
    this.updateSellBasket();
    if (this.area === 'house') this.updateStove(dt);
    this.updateDust(dt);
    this.updateTillDust(workDt);
    this.updateSweat(workDt);
    this.updateTillVisuals(workDt);
    this.updateDrops(workDt);
    this.updatePops(workDt);
    tickPitchLadder(this.harvestLadder, workDt);
    this.updateCropVisuals();
    this.updateRipeCues(workDt);
    this.updateBubble(dt);
    this.updateFloats(dt);
    this.updateClickMarker(dt);
    // Bỏ các lần nhấn phím / cuộn chưa ai dùng tới, để không lọt sang frame sau.
    this.controls.endFrame();
  }

  // ---------------------------------------------------------------- chỉ ô & cuốc (T-002)

  /** Viền ô dưới con trỏ (một hình chữ nhật dùng lại, chỉ đổi chỗ + màu) và pool bụi đất. */
  private buildTileHighlight(): void {
    // Phaser vẽ nét viền Rectangle nằm GIỮA mép hình (nửa trong, nửa ngoài). Lùi hình vào trong ô
    // một nửa bề dày viền lót lớn nhất → cả viền lẫn lót nằm gọn trong ô, không lấn sang ô bên.
    const inset = HIGHLIGHT_INSET;
    const size = T - inset * 2;
    this.highlightBacking = this.add
      .rectangle(0, 0, size, size)
      .setOrigin(0)
      .setDepth(DEPTH_TILE_HIGHLIGHT)
      .setVisible(false);
    this.highlightBacking.isFilled = false;
    this.highlight = this.add
      .rectangle(0, 0, size, size, palette.paper, 0)
      .setOrigin(0)
      .setDepth(DEPTH_TILE_HIGHLIGHT + 1)
      .setVisible(false);
    this.highlightDash = this.add.graphics().setDepth(DEPTH_TILE_HIGHLIGHT + 1).setVisible(false);
    this.highlightDashSig = '';
    for (let i = 0; i < TILL_DUST_POOL; i++) {
      // Nâu gỗ (sáng hơn đất cuốc) + viền mực: nổi trên cả đất nâu lẫn cỏ xanh.
      this.tillDust.push(
        this.add.circle(0, 0, 6, palette.wood, 1).setStrokeStyle(2, palette.ink, 0.8).setVisible(false).setDepth(DEPTH_TILL_DUST),
      );
      this.tillDustLife.push(0);
      this.tillDustVx.push(0);
      this.tillDustVy.push(0);
    }
    for (let i = 0; i < SWEAT_POOL; i++) {
      this.sweat.push(
        this.add.circle(0, 0, 5, SWEAT_COLOR, 1).setStrokeStyle(2, palette.ink, 0.7).setVisible(false).setDepth(DEPTH_TILL_DUST + 1),
      );
      this.sweatLife.push(0);
      this.sweatVx.push(0);
      this.sweatVy.push(0);
    }
    for (let i = 0; i < QUEUE_LABEL_POOL; i++) {
      this.queueBadges.push(
        this.add
          .circle(0, 0, QUEUE_BADGE.radius, palette.ink, 0.85)
          .setStrokeStyle(2, palette.gold, 1)
          .setDepth(DEPTH_TILL_UI)
          .setVisible(false),
      );
      this.queueLabels.push(
        this.add
          .text(0, 0, '', { ...textStyles.nameTag, fontSize: '17px', color: cssColor('gold'), strokeThickness: 0 })
          .setOrigin(0.5)
          .setResolution(2)
          .setDepth(DEPTH_TILL_UI)
          .setVisible(false),
      );
    }
    // Ô vừa cuốc xong: một khung (đúng mảnh 4×4 của ô đó) trong tấm đất đã cuốc, phóng to quanh tâm ô.
    this.bounceImg = this.add.image(0, 0, '__DEFAULT').setDepth(DEPTH_TILL_MARKS + 1).setVisible(false);
  }

  /**
   * Mỗi frame: tìm ô dưới con trỏ (theo camera — camera chạy thì ô dưới chuột đổi dù chuột đứng yên),
   * kiểm tầm với từ tâm nhân vật, vẽ viền sáng/xám. Click, hoặc giữ chuột rê, trên ô ruộng trong tầm → xin việc
   * cho ô đó (GDD §3.3): chưa cuốc/cuốc dở → cuốc; đã cuốc trống → gieo; chưa tưới → tưới; chín → hái; héo → dọn.
   * Một lần giữ chuột chỉ làm MỘT loại việc, chốt theo ô bấm đầu tiên.
   * Cuốc: đang bấm phím đi thì không nhận (cuốc là việc đứng yên — D-022). Việc nhanh: vừa đi vừa làm được.
   * Con trỏ trên hotbar / nút gùi / cửa sổ gùi thì click thuộc về giao diện, không xuống ruộng.
   */
  private updatePointer(dt: number, wantsToMove: boolean): void {
    const pressed = this.controls.consumePrimaryPress();
    const held = this.controls.isPrimaryDown();
    if (!held && !pressed) {
      // Buông chuột: hết lần rê này.
      this.dragKind = null;
      this.dragBlocked = false;
    }
    const h = this.hover;
    const inside = this.controls.isPointerInside();
    const sp = this.controls.pointerScreen(this.pointerScreenPt);
    // T-092: trạng thái rê chuột cho HUD (khung ô / nút sáng lên) — đặt lại mỗi frame, nhánh nào trúng thì bật.
    this.hotbarHoverSlot = -1;
    this.bagButtonHover = false;
    this.windowCloseHover = false;

    if (this.shopWindow) {
      this.updateShopPointer(pressed, inside, sp.x, sp.y);
      return;
    }
    if (this.bagOpen) {
      // Cửa sổ gùi: chỉ biết con trỏ trên ô nào (HUD hiện tên món). Click ra ngoài khung = đóng gùi.
      this.hideHighlight();
      h.valid = false;
      const n = this.inventory.slots.length;
      this.bagHoverSlot = inside ? bagSlotAt(sp.x, sp.y, n) : -1;
      // T-092: nút đóng (X) góc trên-phải — cần cho bản cảm ứng (không có phím E / Esc).
      this.windowCloseHover = inside && rectContains(windowCloseRect(bagPanelRect(n)), sp.x, sp.y);
      if (pressed) {
        if (this.windowCloseHover || !rectContains(bagPanelRect(n), sp.x, sp.y)) this.setBagOpen(false);
        this.dragKind = null;
        this.dragBlocked = true;
      }
      return;
    }
    this.bagHoverSlot = -1;
    if (inside && isOverHud(sp.x, sp.y)) {
      // Trên hotbar: click chọn ô; trên nút gùi: mở gùi. Giữ chuột kéo ra ruộng cũng không làm gì (dragBlocked).
      this.hideHighlight();
      h.valid = false;
      this.hotbarHoverSlot = hotbarSlotAt(sp.x, sp.y);
      this.bagButtonHover = rectContains(bagButtonRect(), sp.x, sp.y);
      if (pressed) {
        const slot = hotbarSlotAt(sp.x, sp.y);
        if (slot >= 0) this.selectHotbar(slot);
        else if (rectContains(bagButtonRect(), sp.x, sp.y)) this.setBagOpen(true);
        this.dragKind = null;
        this.dragBlocked = true;
      }
      return;
    }

    const pt = this.controls.pointerWorld(this.cameras.main, this.pointerWorldPt);
    if (this.area === 'house') {
      h.valid = false;
      this.updateHousePointer(pressed, inside, pt.x, pt.y, dt);
      return;
    }
    this.houseHover = null;
    const tx = Math.floor(pt.x / T);
    const ty = Math.floor(pt.y / T);
    h.valid = inside && tx >= 0 && ty >= 0 && tx < L.cols && ty < L.rows;
    if (!h.valid) {
      this.hideHighlight();
      if (pressed) this.dragKind = null;
      return;
    }
    const c = this.feetBody.center;
    h.x = tx;
    h.y = ty;
    // T-096: khung cửa nhà → viền cửa; click (gần hay xa) = đi tới ô sân dưới bậc rồi vào nhà.
    if (isHouseDoorTile(L, tx, ty)) {
      const spot = houseExitSpot(L.houseDoor, T);
      h.object = null;
      h.job = null;
      h.tillable = false;
      h.inReach = Math.hypot(spot.x - c.x, spot.y - c.y) <= gameConfig.interactRange * T;
      this.drawHighlightBox(OBJECT_HIGHLIGHT_KEY + 5, houseDoorClickRect(L), h.inReach, dt, 0, 0, (L.house.y + L.house.h) * T + 2);
      if (pressed) {
        this.dragKind = null;
        this.dragBlocked = true;
        this.planAndGo({ kind: 'point', x: spot.x, y: spot.y }, { kind: 'door', to: 'house' }, pt);
      }
      return;
    }
    // T-006: con trỏ trên thùng bán / sạp hạt → viền cả vật (sáng trong tầm / xám ngoài tầm); click trong tầm thì mở cửa
    // sổ, KHÔNG phải click ô ruộng (lần giữ chuột này cũng không làm việc gì trên ruộng).
    const obj = targetAt(L, tx, ty);
    h.object = obj;
    if (obj) {
      h.inReach = targetInReach(L, obj, c.x, c.y, T, gameConfig.interactRange);
      h.job = null;
      h.tillable = false;
      // Viền bao cả hình vật (kể cả phần vẽ nhô lên trên ô) và nằm TRÊN vật — viền đặt dưới đất như ô ruộng sẽ bị vật che.
      // T-024: vùng click thúng / quầy hạt đã bằng cả ảnh (gardenLayout) → không cần nhô thêm; chõng nhô ~12 px.
      const lift = obj === 'bed' ? BED_LIFT : 0;
      const keyOffset = obj === 'sellBox' ? 0 : obj === 'seedStall' ? 1 : 2;
      this.drawHighlightBox(OBJECT_HIGHLIGHT_KEY + keyOffset, L[obj], h.inReach, dt, 0, lift, (L[obj].y + L[obj].h) * T + 2);
      if (pressed) {
        this.dragKind = null;
        this.dragBlocked = true;
        // T-096: ngoài tầm → đi tới chỗ đứng gần nhất với tới vật rồi mở luôn.
        if (h.inReach) {
          this.cancelWalk();
          this.interactGarden(obj);
        } else {
          const range = gameConfig.interactRange - gameConfig.clickMoveReachMargin;
          this.planAndGo({ kind: 'reach', canWorkFrom: (x, y) => targetInReach(L, obj, x, y, T, range) }, { kind: 'gardenObject', target: obj }, pt);
        }
      }
      return;
    }
    h.inReach = inReach(c.x, c.y, tx, ty, T, gameConfig.interactRange);
    h.job = jobFor(this.farm, tx, ty, growDaysOf);
    h.tillable = h.job === 'till';

    // T-096b: ô ruộng có việc luôn viền SÁNG (click là tự bước tới sát ô rồi làm); ô không có việc giữ sáng / xám theo tầm cũ.
    this.drawTileHighlight(tx, ty, h.job !== null || h.inReach, dt);

    // Một lần giữ chuột = một loại việc, chốt theo ô bấm đầu tiên (GDD §3.3). Bấm vào cỏ / cây đã tưới → lần rê
    // này không làm gì. Bấm ô chưa cuốc → chỉ cuốc; bấm ô đã cuốc → chỉ gieo; bấm cây chưa tưới → chỉ tưới…
    if (pressed) {
      this.dragKind = h.job;
      this.dragBlocked = false;
      if (this.clickMove.active) this.cancelWalk(); // click mới = lệnh mới
      // T-096 (D-038): ô không có việc → chỉ đi tới đó (gần hay xa).
      if (h.job === null) {
        this.planAndGo({ kind: 'point', x: pt.x, y: pt.y }, null, pt);
        return;
      }
      // Ngoài tầm cũ (`interactRange`) mà việc không hợp lệ với món đang cầm (không cầm cuốc, hết hạt, gùi đầy) → chỉ đi tới,
      // không nhắc. Trong tầm cũ thì nhắc bằng bong bóng như trước (bên dưới).
      if (!h.inReach) {
        const job = h.job;
        const valid = (job !== 'till' || canTillWithSelected(this.inventory)) && this.canDoJob(h, job, false);
        if (!valid) {
          this.planAndGo({ kind: 'point', x: pt.x, y: pt.y }, null, pt);
          return;
        }
      }
      // T-096b: việc hợp lệ (gần hay xa) → vào hàng chờ như click thường; hàng chờ tự bước tới SÁT từng ô (driveTileQueue).
    }
    // T-096b: rê chỉ tính khi CON TRỎ thật sự di chuyển trên màn — người đi làm camera chạy, ô dưới con trỏ đứng yên cũng đổi,
    // không được tự xếp thêm ô.
    const pointerMoved = sp.x !== this.dragScreenX || sp.y !== this.dragScreenY;
    this.dragScreenX = sp.x;
    this.dragScreenY = sp.y;
    if (!(pressed || (held && pointerMoved)) || this.dragKind === null || this.dragBlocked || h.job !== this.dragKind) return;
    if (this.dragKind === 'till') {
      // T-009 (D-026): phải CẦM CUỐC (ô hotbar đang chọn là cuốc) mới cuốc. Cầm hạt / ô trống mà bấm ô cỏ → không cuốc,
      // bong bóng nhắc (chỉ lúc bấm, giữ chuột rê không nhắc lại mỗi frame). Ô đã vào hàng chờ thì vẫn cuốc tiếp dù
      // sau đó đổi ô hotbar — giống bấm xong rồi mới đổi ý.
      if (!canTillWithSelected(this.inventory)) {
        if (pressed) {
          this.noHoePrompts++;
          this.showBubble(bubbles.noHoe);
          this.audio.play('uiError');
        }
        return;
      }
      // Click ô đang cuốc / đã trong hàng chờ, hoặc hàng chờ đầy → requestTile tự bỏ qua.
      // T-004 (D-022): đang rảnh mà thiếu Sức (< staminaCostTill) → không cuốc, "đuối rồi…". Đang cuốc thì vẫn cho
      // xếp hàng — tới lượt ô nào mà thiếu Sức thì dừng, xóa hàng chờ (updateTileAction).
      if (wantsToMove) return;
      if (!isBusy(this.action) && !this.hasStaminaFor('till', true)) return;
      requestTile(this.action, h, this.tillParams, 'till');
      return;
    }
    this.requestFastJob(h, this.dragKind);
  }

  /** Ẩn viền ô (con trỏ ra ngoài bản đồ / nằm trên giao diện / đang mở gùi). */
  private hideHighlight(): void {
    this.highlight.setVisible(false);
    this.highlightBacking.setVisible(false);
    this.highlightDash.setVisible(false);
    this.highlightTileKey = -1;
  }

  /**
   * Xin một việc nhanh cho ô `t` (gieo/tưới/hái/dọn). Kiểm trước điều kiện "ngoài ruộng": còn hạt để gieo,
   * gùi còn chỗ để hái — thiếu thì bong bóng ("hết hạt rồi", "gùi đầy") và không xếp hàng.
   */
  private requestFastJob(t: TileXY, kind: TileJob): void {
    if (isPending(this.action, t)) return;
    if (!this.canDoJob(t, kind, true)) return;
    // T-004: việc nhanh cũng cần đủ Sức (gieo/tưới/hái/dọn 1 Sức). Rảnh thì kiểm ngay; đang làm thì kiểm lúc tới lượt.
    if (!isBusy(this.action) && !this.hasStaminaFor(kind, true)) return;
    requestTile(this.action, t, this.fastParams, kind);
  }

  /**
   * Điều kiện ngoài ô ruộng của một việc (ô ruộng đúng loại việc thì jobFor đã kiểm):
   * gieo cần còn hạt (pickSeedSlot), hái cần gùi còn chỗ cho món đó. `speak` = hiện bong bóng khi không được.
   */
  private canDoJob(t: TileXY, kind: TileJob, speak: boolean): boolean {
    if (kind === 'plant' && pickSeedSlot(this.inventory) < 0) {
      if (speak) {
        this.showBubble(bubbles.noSeeds);
        this.audio.play('uiError');
      }
      return false;
    }
    if (kind === 'harvest') {
      const crop = plotAt(this.farm, t.x, t.y)?.crop;
      if (crop && !canAdd(this.inventory, cropItemId(crop.cropId), 1)) {
        if (speak) {
          this.showBubble(bubbles.bagFull);
          this.audio.play('uiError');
        }
        return false;
      }
    }
    return true;
  }

  /** Đang cuốc (việc nặng, khóa chân) không. */
  private isTilling(): boolean {
    return isBusy(this.action) && this.action.kind === 'till';
  }

  /** Tham số nhịp/hàng chờ theo loại việc: cuốc = nhát tillStrikeSeconds, còn lại = actionDuration. */
  private paramsFor(kind: string | null): TileActionParams {
    return kind === 'till' ? this.tillParams : this.fastParams;
  }

  // ---------------------------------------------------------------- phím giao diện, hotbar, gùi (T-003)

  /**
   * Phím bấm-một-lần: 1–9 / cuộn chuột chọn ô hotbar, E (Tab) mở/đóng gùi, Esc (gùi mở → đóng gùi; không thì mở Tạm
   * dừng), G (dev) qua đêm, F9 (dev) +1 giờ.
   */
  private handleUiKeys(): void {
    const c = this.controls;
    if (c.consumePressed('menu')) {
      const esc = resolveEsc(this);
      if (esc === 'closeShop') this.closeShop();
      else if (esc === 'closeBag') this.setBagOpen(false);
      else {
        this.openPauseMenu('esc');
        return; // Tạm dừng: phím khác cùng frame bị bỏ (openPauseMenu đã xóa)
      }
    }
    // T-006: F = mở thùng bán / sạp hạt khi đứng cạnh; đang mở thì F đóng lại.
    if (c.consumePressed('interact')) this.handleInteractKey();
    // Đang mở thùng bán / sạp hạt thì E / Tab không mở gùi chồng lên (gùi đã hiện sẵn bên trái cửa sổ thùng bán).
    const openBag = c.consumePressed('openBag');
    if (openBag && !this.shopWindow) this.setBagOpen(!this.bagOpen);
    // T-041: F2 / ` mở bảng Thử (chỉ bản dev) — đóng gùi / cửa sổ đang mở; phím khác cùng frame bị bỏ (openCheatPanel xoá).
    if (c.consumePressed('devCheatPanel') && gameConfig.devCheatsEnabled) {
      this.openCheatPanel();
      return;
    }
    const windowOpen = this.windowOpen;
    if (c.consumePressed('devAddHour') && gameConfig.devCheatsEnabled && !windowOpen) this.devAddHour();
    const slot = c.hotbarPressed();
    if (slot !== null) this.selectHotbar(slot);
    const wheel = c.consumeWheelSteps();
    if (wheel !== 0) {
      const before = this.inventory.selected;
      scrollSelect(this.inventory, wheel);
      this.inventoryRevision++;
      if (this.inventory.selected !== before) this.audio.play('uiSlot');
    }
    if (c.consumePressed('devNextDay') && gameConfig.devCheatsEnabled && !windowOpen) {
      // T-007: G gọi CHUNG hàm qua đêm với lúc ngủ (ruộng + bán thùng + ngày mới + Sức đầy) nhưng "im lặng": không màn
      // tối, không tổng kết, không dời nhân vật về giường — để thử nhanh.
      const summary = this.applyOvernight('devG');
      this.saveNow('devNextDay'); // T-008: sang ngày bằng G cũng lưu luôn (như sau "Ngày mới")
      this.showBubble(bubbles.devNextDay);
      this.greetMorning(summary); // T-026: sáng ra bằng G cũng có gà gáy (thử nhanh các kiểu gà theo ngày)
    }
    // T-004: chuột phải = ăn món ở ô hotbar đang chọn. Không đụng tới việc đang làm (đang cuốc vẫn cuốc tiếp).
    // Luôn "tiêu thụ" lần bấm mỗi frame để lần bấm lúc mở gùi không lọt sang sau.
    const rightClick = c.consumeSecondaryPress();
    if (rightClick && !windowOpen) this.tryEatSelected();
    if (c.consumePressed('devDrainStamina') && gameConfig.devCheatsEnabled && !windowOpen) this.devDrainStamina();
  }

  // ---------------------------------------------------------------- tiền, thùng bán, sạp hạt (T-006)

  /** Có cửa sổ nào (gùi, thùng bán, sạp hạt) đang mở không — mở thì thế giới "modal": không đi, việc trên ô đứng yên. */
  get windowOpen(): boolean {
    return this.bagOpen || this.shopWindow !== null;
  }

  /** Phím F: đang mở thùng bán / sạp hạt → đóng; gùi mở → bỏ qua; không thì mở vật đang đứng cạnh (nếu có). */
  private handleInteractKey(): void {
    this.interactKeyPresses++;
    if (this.shopWindow) {
      this.closeShop();
      return;
    }
    if (this.bagOpen) return;
    const c = this.feetBody.center;
    if (this.area === 'house') {
      const t = nearestHouseTarget(HOUSE, c.x, c.y, gameConfig.interactKeyRange * T);
      if (t) this.interactHouse(t);
      return;
    }
    const target = nearestKeyTarget(L, c.x, c.y, T, gameConfig.interactKeyRange);
    if (target) this.interactGarden(target);
  }

  /** Vật ngoài Vườn: chõng hiên (T-093: không ngủ ở đây nữa — nhắc vào nhà), thùng bán / sạp hạt mở cửa sổ. */
  private interactGarden(target: InteractTarget): void {
    if (target === 'bed') this.showBubble(bubbles.porchBed);
    else this.openShop(target);
  }

  /** Vật trong nhà (T-093): giường = hỏi ngủ như cũ; rương = cửa sổ 2 lưới; bếp / hũ gạo / nón = một câu của {ten}. */
  private interactHouse(target: HouseTarget): void {
    switch (target) {
      case 'bed':
        this.requestSleep();
        break;
      case 'chest':
        this.openShop('chest');
        break;
      case 'stove':
        this.showBubble(bubbles.stoveCold); // nấu ăn: T-048
        break;
      case 'riceJar':
        this.showBubble(bubbles.riceJar); // nấu cơm từ hũ gạo: T-048
        break;
      case 'grandpaHat':
        this.showBubble(bubbles.grandpaHat);
        break;
    }
  }

  /** Mở cửa sổ thùng bán / sạp hạt: đồng hồ dừng (lý do sellBox / seedStall), nhân vật đứng, lần giữ chuột dở bị chặn. */
  private openShop(kind: ShopWindow): void {
    if (this.shopWindow === kind) return;
    if (this.shopWindow) this.closeShop(false);
    if (this.bagOpen) this.setBagOpen(false, false);
    this.shopWindow = kind;
    // T-026: rương kêu bản lề gỗ (AUD-SFX-116); thùng bán / sạp hạt: giấy "sột" như mọi cửa sổ.
    this.audio.play(kind === 'chest' ? 'chestOpen' : 'uiOpen');
    this.pauseReasons.set(kind, true);
    this.shopOpens[kind]++;
    this.shopHover = null;
    this.stallHover = -1;
    this.shopNoticeT = 0;
    this.dragKind = null;
    this.dragBlocked = true;
    this.feetBody.setVelocity(0, 0);
    this.hideHighlight();
  }

  private closeShop(sound = true): void {
    const kind = this.shopWindow;
    if (!kind) return;
    this.shopWindow = null;
    if (sound) this.audio.play(kind === 'chest' ? 'chestClose' : 'uiClose');
    this.pauseReasons.set(kind, false);
    this.shopHover = null;
    this.stallHover = -1;
    this.shopNoticeT = 0;
    this.dragKind = null;
    this.dragBlocked = true; // chuột còn giữ sau khi đóng → không tính là click xuống ruộng
  }

  /**
   * Con trỏ khi cửa sổ thùng bán / sạp hạt mở: biết đang trên ô / nút nào; click ô = chuyển món (Shift = cả chồng), click
   * nút = mua (Shift = mua seedBulkBuyCount); click ra ngoài khung = đóng (như gùi).
   */
  private updateShopPointer(pressed: boolean, inside: boolean, px: number, py: number): void {
    this.hideHighlight();
    this.hover.valid = false;
    const shift = this.controls.primaryPressWithShift();
    if (this.shopWindow === 'sellBox' || this.shopWindow === 'chest') {
      // T-093: rương dùng chung bố cục 2 lưới với thùng bán (bên phải là rương thay vì thùng).
      const nBag = this.inventory.slots.length;
      const nBox = this.shopBoxInventory().slots.length;
      this.shopHover = inside ? sellSlotAt(px, py, nBag, nBox) : null;
      this.windowCloseHover = inside && rectContains(windowCloseRect(sellPanelRect(nBag, nBox)), px, py);
      if (pressed) {
        if (this.windowCloseHover || !rectContains(sellPanelRect(nBag, nBox), px, py)) this.closeShop();
        else if (this.shopHover) this.transferSlot(this.shopHover.side, this.shopHover.index, shift);
      }
    } else if (this.shopWindow === 'seedStall') {
      const n = this.seedStallItems.length;
      this.stallHover = inside ? stallButtonAt(px, py, n) : -1;
      this.windowCloseHover = inside && rectContains(windowCloseRect(stallPanelRect(n)), px, py);
      if (pressed) {
        if (this.windowCloseHover || !rectContains(stallPanelRect(n), px, py)) this.closeShop();
        else if (this.stallHover >= 0) this.buyFromStall(this.stallHover, shift);
      }
    }
    if (pressed) {
      this.dragKind = null;
      this.dragBlocked = true;
    }
  }

  /**
   * Chuyển món giữa gùi và thùng bán: 1 món, hoặc cả chồng (`all`). Hạt giống không bỏ vào thùng được (không bán được —
   * systems/economy.ts). Bên nhận đầy → báo, không mất đồ.
   */
  private transferSlot(side: SellSide, index: number, all: boolean): void {
    const chest = this.shopWindow === 'chest';
    const box = this.shopBoxInventory();
    const from = side === 'bag' ? this.inventory : box;
    const to = side === 'bag' ? box : this.inventory;
    const stack = from.slots[index];
    if (!stack) return;
    // Rương cất được MỌI món (hạt, nông cụ…) — chỉ thùng bán mới chặn món không bán được.
    if (!chest && side === 'bag' && !canSellItem(stack.id)) {
      const why = isSeedItem(stack.id) ? 'Hạt giống không bán được' : isToolItem(stack.id) ? 'Nông cụ không bán được' : 'Món này không bán được';
      this.setShopNotice(why, true);
      this.audio.play('uiError');
      return;
    }
    const r = moveFromSlot(from, index, to, all ? stack.count : 1);
    if (r.moved <= 0) {
      if (side === 'box') {
        this.setShopNotice(bubbles.bagFull, true);
        this.showBubble(bubbles.bagFull);
      } else {
        this.setShopNotice(chest ? 'Rương đầy rồi!' : 'Thùng đầy rồi!', true);
      }
      this.audio.play('uiError');
      return;
    }
    // T-026: thúng bán "bịch" (AUD-SFX-113) cả bỏ vào lẫn lấy ra; rương: thả món vào / nhấc món ra (AUD-UI-007).
    if (chest) this.audio.play(side === 'bag' ? 'uiDrop' : 'uiPick');
    else this.audio.play('basket');
    if (chest) this.chestTransfers++;
    else this.transfers++;
    this.inventoryRevision++;
  }

  /** Lưới bên phải của cửa sổ 2 lưới đang mở: rương (T-093) hoặc thùng bán. */
  private shopBoxInventory(): Inventory {
    return this.shopWindow === 'chest' ? this.chest : this.sellBox;
  }

  /** Mua hạt ở nút thứ i (1 hạt, Shift = tối đa seedBulkBuyCount): thiếu tiền / gùi đầy thì báo, không trừ tiền. */
  private buyFromStall(i: number, bulk: boolean): void {
    const item = this.seedStallItems[i];
    if (!item) return;
    const result = buySeeds(this.wallet, this.inventory, item.cropId, bulk ? gameConfig.seedBulkBuyCount : 1);
    if (!result.ok) {
      if (result.reason === 'bagFull') {
        this.setShopNotice(bubbles.bagFull, true);
        this.showBubble(bubbles.bagFull);
      } else if (result.reason === 'noMoney') {
        this.setShopNotice('Không đủ tiền', true);
      }
      this.audio.play('uiError');
      return;
    }
    this.inventoryRevision++;
    this.onMoneyChanged(-result.cost);
    this.purchases.push({ cropId: result.cropId, count: result.count, cost: result.cost });
    this.setShopNotice(`Đã mua ${result.count} ${item.label.toLowerCase()} (−${result.cost} quan)`, false);
    const coinSfx = this.audio.play('coin');
    if (coinSfx) {
      this.lastCoinSfx = coinSfx.key;
      this.lastSfx = coinSfx.key;
    }
    // Icon hạt bay vào ô hotbar nhận (nếu ở hotbar) — dùng chung hiệu ứng hái; xuất phát từ nút vừa bấm.
    const b = stallButtonRect(i, this.seedStallItems.length);
    this.events.emit('item-gained', { itemId: seedItemId(item.cropId), slot: result.firstSlot, screenX: b.x + 60, screenY: b.y + b.h / 2 });
    // T-027: xu bay KHỎI ô tiền rơi vào chỗ icon hạt trên nút vừa bấm (số tiền đã trừ ngay — xu chỉ là hình).
    startCoinBatch(this.coins, 'out', result.cost, moneyCoinCenter(), { x: b.x + 60, y: b.y + b.h / 2 }, COIN_PARAMS);
  }

  /** Tiền vừa đổi (`delta` quan, âm = tiêu) → HUD vẽ lại số + chữ bay. */
  private onMoneyChanged(delta: number): void {
    this.lastMoneyDelta = delta;
    this.moneyRevision++;
  }

  /**
   * T-027: số tiền HUD đang hiện = ví − tiền bán đêm qua còn chờ đóng tổng kết − phần xu đang bay chưa chạm ô tiền.
   * Xu chạm tới đâu số nhảy lên tới đó; xu bay hết thì bằng đúng ví.
   */
  get moneyShown(): number {
    return Math.max(0, this.wallet.money - this.pendingPayout - heldCoinMoney(this.coins));
  }

  /**
   * T-027: tiền bán đêm qua bay về ô tiền — mẻ xu cất cánh từ `from` (toạ độ màn: dòng tiền của màn tổng kết, hoặc đầu {ten}
   * khi qua đêm bằng phím G), mỗi đồng chạm ô tiền thì số nhảy + "leng keng".
   */
  private startPayout(from: { x: number; y: number }): void {
    const amount = this.pendingPayout;
    this.pendingPayout = 0;
    if (amount > 0) startCoinBatch(this.coins, 'in', amount, from, moneyCoinCenter(), COIN_PARAMS);
  }

  /** Mỗi frame: xu bay tiếp; đồng "in" chạm ô tiền → "leng keng" nhỏ; đồng cuối → tiếng xu đầy + chữ "+N quan" bay. */
  private tickCoins(dt: number): void {
    if (this.coins.batches.length === 0) return;
    for (const l of stepCoins(this.coins, dt, COIN_PARAMS, this.coinLandings)) {
      if (l.kind !== 'in') continue;
      if (!l.last) {
        this.audio.play('coinLand');
        continue;
      }
      this.onMoneyChanged(l.amount);
      const sfx = this.audio.play('coin');
      if (sfx) {
        this.lastCoinSfx = sfx.key;
        this.lastSfx = sfx.key;
      }
    }
  }

  private setShopNotice(text: string, warn: boolean): void {
    this.shopNotice = text;
    this.shopNoticeWarn = warn;
    this.shopNoticeT = gameConfig.shopNoticeSeconds;
  }

  /**
   * Dòng chữ chân cửa sổ: dòng báo vừa có (vd "Hạt giống không bán được") trong shopNoticeSeconds; không có thì mô tả thứ
   * dưới con trỏ (tên món + giá bán / số hạt đang có trong gùi). HUD đọc mỗi frame.
   */
  get shopStatus(): { text: string; warn: boolean } {
    if (this.shopNoticeT > 0) return { text: this.shopNotice, warn: this.shopNoticeWarn };
    if (this.shopWindow === 'sellBox' && this.shopHover) {
      const inv = this.shopHover.side === 'bag' ? this.inventory : this.sellBox;
      const st = inv.slots[this.shopHover.index];
      if (!st) return { text: '', warn: false };
      const name = itemInfo(st.id)?.name ?? st.id;
      const price = sellPriceOf(st.id);
      return { text: price === null ? `${name} · không bán được` : `${name} · ${price} quan/món`, warn: false };
    }
    if (this.shopWindow === 'chest' && this.shopHover) {
      const inv = this.shopHover.side === 'bag' ? this.inventory : this.chest;
      const st = inv.slots[this.shopHover.index];
      if (!st) return { text: '', warn: false };
      return { text: `${itemInfo(st.id)?.name ?? st.id} · ${st.count}`, warn: false };
    }
    if (this.shopWindow === 'seedStall' && this.stallHover >= 0) {
      const item = this.seedStallItems[this.stallHover];
      if (!item) return { text: '', warn: false };
      const price = seedPriceOf(item.cropId) ?? 0;
      if (!hasMoney(this.wallet, price)) return { text: 'Không đủ tiền', warn: true };
      return { text: `Trong gùi đang có ${countOf(this.inventory, seedItemId(item.cropId))} ${item.label.toLowerCase()}`, warn: false };
    }
    return { text: '', warn: false };
  }

  // ---------------------------------------------------------------- Sức, ăn, chửi thề (T-004)

  /**
   * Ăn 1 món ở ô hotbar đang chọn (GDD §3.2): món có `staminaRestore` > 0 (items.json) → bớt 1 món, +Sức (không vượt
   * staminaMax), chữ "+8 Sức" xanh bay lên, ô hotbar nảy. Hạt / món không ăn được / ô trống → không làm gì.
   * Sức đã đầy → không ăn (khỏi phí đồ), bong bóng "Còn no lắm!".
   */
  private tryEatSelected(): void {
    const slot = this.inventory.selected;
    const stack = this.inventory.slots[slot];
    if (!stack) return;
    const amount = staminaRestoreOf(stack.id);
    if (amount <= 0) return;
    if (isFull(this.stamina)) {
      this.showBubble(bubbles.notHungry);
      return;
    }
    removeFromSlot(this.inventory, slot, 1);
    this.inventoryRevision++;
    const change = restore(this.stamina, amount);
    this.eatCount++;
    this.audio.play('eat');
    this.spawnFloat(change.delta);
    this.events.emit('item-eaten', { slot });
  }

  /** Phím thử F8 (chỉ bản dev): −devStaminaDrain Sức, hết thì đuối (chửi như thật). */
  private devDrainStamina(): void {
    this.spendStamina(gameConfig.devStaminaDrain, true);
  }

  /** Trừ `cost` Sức (chặn ở 0); `float` = hiện chữ "−N Sức" bay lên. Vừa chuyển sang đuối → chửi thề. */
  private spendStamina(cost: number, float: boolean): StaminaChange {
    const change = consume(this.stamina, cost);
    if (float && change.delta < 0) this.spawnFloat(change.delta);
    if (change.becameExhausted) {
      this.curseExhausted();
      // T-026: bụng réo "ọc ọc" (AUD-SFX-106) ngay sau tiếng càu nhàu.
      this.time.delayedCall(gameConfig.stomachGrowlDelaySeconds * 1000, () => this.audio.play('stomach'));
    }
    return change;
  }

  /** Đủ Sức cho việc `kind` không; thiếu và `speak` → bong bóng "đuối rồi…". */
  private hasStaminaFor(kind: TileJob, speak: boolean): boolean {
    if (canAfford(this.stamina, jobStaminaCost(kind, JOB_COSTS))) return true;
    if (speak) this.sayTooTired();
    return false;
  }

  private sayTooTired(): void {
    if (this.showBubble(bubbles.tooTired)) this.tooTiredCount++;
  }

  /**
   * Vừa chuyển sang đuối: luôn chửi 1 câu (GDD §3.12 trigger "Đuối" — bỏ qua xác suất / thời gian nghỉ), bong bóng
   * răng cưa đỏ + tiếng càu nhàu. Chỉ gọi lúc CHUYỂN (becameExhausted) nên mỗi lần đuối chửi đúng 1 lần.
   */
  private curseExhausted(): void {
    this.curse(bubbles.grumbleExhausted);
  }

  /** Chửi một câu trong `lines` (luôn hiện — bong bóng chửi ưu tiên cao nhất) + tiếng càu nhàu. T-007: sáng sau ngủ gục. */
  private curse(lines: readonly string[]): void {
    const line = lines[Math.floor(Math.random() * lines.length)];
    this.showBubble(line, 'grumble');
    this.curseCount++;
    const curseSfx = this.audio.play('curse');
    if (curseSfx) {
      this.lastCurseSfx = curseSfx.key;
      this.lastSfx = curseSfx.key;
    }
  }

  /**
   * Xong một ô cuốc: thỉnh thoảng lầm bầm (GDD §3.3a) — xác suất `tillDoneBarkChance`, cách nhau ≥
   * `tillDoneBarkCooldownSeconds`, bong bóng thường. Đang có bong bóng quan trọng hơn (chửi thề, "đuối rồi…") thì
   * thôi, không tính lượt.
   */
  private tryTillDoneBark(): void {
    if (!bubbleCanShow(this.activeBubbleKind(), 'bark')) return;
    if (!shouldBark(this.barks, this.clock, this.barkChance, this.barkCooldown, Math.random())) return;
    const line = pickBarkLine(bubbles.tillDoneBarks, this.barks.lastLine, Math.random());
    if (!line) return;
    if (this.showBubble(line, 'bark')) recordBark(this.barks, this.clock, line);
  }

  /** Loại bong bóng đang hiện (null = không có). */
  private activeBubbleKind(): BubbleKind | null {
    return this.bubbleT > 0 ? this.bubbleKind : null;
  }

  /** Tạo sẵn pool chữ bay. */
  private buildFloatPool(): void {
    for (let i = 0; i < FLOAT_POOL; i++) {
      this.floats.push(
        this.add
          .text(0, 0, '', { fontFamily: uiFontFamily, fontSize: '26px', fontStyle: 'bold', color: cssColor('sprout'), stroke: cssColor('ink'), strokeThickness: 7 })
          .setOrigin(0.5, 1)
          .setResolution(2)
          .setDepth(DEPTH_BUBBLE - 1)
          .setVisible(false),
      );
      this.floatLife.push(0);
      this.floatBaseY.push(0);
      this.floatAmount.push(0);
    }
  }

  /** Chữ "+8 Sức" (xanh mạ) / "−4 Sức" (đỏ son) bay lên cạnh đầu {ten} rồi mờ dần (GDD §8). */
  private spawnFloat(amount: number): void {
    const gain = amount > 0;
    const dur = gameConfig.staminaFloatSeconds;
    // BUG-012: ăn / trừ liền tay thì các chữ cùng loại chồng khít nhau → GỘP vào chữ cùng dấu còn mới
    // (< staminaFloatMergeSeconds) thành một số cộng dồn ("+16 Sức"), chữ đó nảy lại và bay tiếp từ chỗ đang đứng.
    const merge = this.floats.findIndex(
      (_, k) => this.floatLife[k] > 0 && dur - this.floatLife[k] < gameConfig.staminaFloatMergeSeconds && Math.sign(this.floatAmount[k]) === Math.sign(amount),
    );
    if (merge >= 0) {
      this.floatAmount[merge] += amount;
      const f = this.floats[merge].setText(floatLabel(this.floatAmount[merge]));
      this.floatBaseY[merge] = f.y;
      this.floatLife[merge] = dur;
      this.logFloat(f.text);
      return;
    }
    let i = this.floatLife.findIndex((l) => l <= 0);
    if (i < 0) i = this.floatLife.indexOf(Math.min(...this.floatLife)); // hết pool → dùng lại chữ sắp tắt nhất
    // Bắt đầu ngang ngực, lệch sang phải, bay lên tới ngang đầu — không chui vào bong bóng (bong bóng nằm trên đầu).
    const x = this.hero.x + T * 0.75;
    let y = this.hero.y - this.heroBodyHeight * 0.4;
    // Chữ khác loại đang bay gần chỗ xuất phát → đặt chữ mới lệch lên trên chữ đó, không đè.
    const gap = gameConfig.staminaFloatStackOffset * T;
    for (let k = 0; k < this.floats.length; k++) {
      if (k === i || this.floatLife[k] <= 0) continue;
      if (Math.abs(this.floats[k].y - y) < gap) y = this.floats[k].y - gap;
    }
    this.floatAmount[i] = amount;
    const text = floatLabel(amount);
    this.logFloat(text);
    this.floats[i]
      .setText(text)
      .setColor(cssColor(gain ? 'sprout' : 'vermilion'))
      .setStroke(cssColor(gain ? 'ink' : 'paper'), gain ? 7 : 5)
      .setPosition(x, y)
      .setAlpha(1)
      .setScale(1.25)
      .setVisible(true);
    this.floatLife[i] = dur;
    this.floatBaseY[i] = y;
  }

  private logFloat(text: string): void {
    this.floatLog.push(text);
    if (this.floatLog.length > FLOAT_LOG) this.floatLog.shift();
  }

  private updateFloats(dt: number): void {
    const dur = gameConfig.staminaFloatSeconds;
    for (let i = 0; i < this.floats.length; i++) {
      if (this.floatLife[i] <= 0) continue;
      this.floatLife[i] = Math.max(0, this.floatLife[i] - dt);
      const f = this.floats[i];
      if (this.floatLife[i] <= 0) {
        f.setVisible(false);
        continue;
      }
      const p = 1 - this.floatLife[i] / dur; // 0 → 1
      const rise = 1 - (1 - p) * (1 - p); // bay nhanh rồi chậm lại
      f.setY(this.floatBaseY[i] - rise * gameConfig.staminaFloatRise * T)
        .setScale(1 + 0.25 * Math.max(0, 1 - p * 5)) // nảy to lúc hiện
        .setAlpha(p < 0.6 ? 1 : 1 - (p - 0.6) / 0.4);
    }
  }

  private selectHotbar(index: number): void {
    if (selectSlot(this.inventory, index)) {
      this.inventoryRevision++;
      this.audio.play('uiSlot');
    }
  }

  /**
   * Mở / đóng cửa sổ gùi. Mở thì ẩn viền ô và chặn lần giữ chuột đang dở (đóng lại phải bấm lại). `sound` = false khi game
   * tự đóng (đi ngủ, chuyển khu, mở cửa sổ khác) — chỉ người chơi mở / đóng mới có tiếng giấy.
   */
  private setBagOpen(open: boolean, sound = true): void {
    if (this.bagOpen === open) return;
    this.bagOpen = open;
    if (sound) this.audio.play(open ? 'uiOpen' : 'uiClose');
    this.pauseReasons.set('bag', open); // mở gùi thì đồng hồ dừng (GDD §3.1)
    this.bagHoverSlot = -1;
    this.dragKind = null;
    this.dragBlocked = true;
    if (open) this.hideHighlight();
  }

  // ---------------------------------------------------------------- ngủ, ngủ gục, qua đêm, tổng kết (T-007)

  /**
   * Qua đêm bằng MỘT hàm thuần dùng chung (systems/overnight.ts): ruộng lớn / khát / héo (ô cuốc dở giữ nhát), bán hết
   * thùng bán, ngày +1 về 6:00, Sức đầy (ngủ gục: 70). Ngủ ở giường, ngủ gục và phím G đều đi qua đây.
   * Scene chỉ báo HUD vẽ lại (gùi/thùng, tiền) và ghi lại kết quả cho màn tổng kết + QA. Hình cây tự vẽ lại theo trạng thái mới.
   */
  private applyOvernight(cause: OvernightCause): OvernightSummary {
    const summary = runOvernight(
      { farm: this.farm, sellBox: this.sellBox, wallet: this.wallet, clock: this.dayClock, stamina: this.stamina },
      cause,
      {
        growDaysOf,
        unwateredDaysToWither: gameConfig.unwateredDaysToWither,
        tillProgressKeepsOvernight: gameConfig.tillProgressKeepsOvernight,
        passOutStaminaRatio: gameConfig.passOutStaminaRatio,
        daysPerSeason: gameConfig.daysPerSeason,
      },
    );
    this.lastOvernight = summary.farm;
    this.lastSummary = summary;
    this.farmCounts.nights++;
    this.overnightCount++;
    this.lastOvernightCause = cause;
    this.inventoryRevision++; // thùng bán vừa trống
    // T-027: tiền đã vào ví (save ghi ngay) nhưng ô tiền HUD giữ số cũ tới khi xu bay về: ngủ / ngủ gục → lúc đóng màn tổng
    // kết; phím G (không có tổng kết) → bay luôn từ đầu {ten}. Kỷ lục tính cho mọi cách qua đêm.
    this.summaryRecord = noteDaySale(this.records, summary.sale.earned);
    this.pendingPayout += summary.sale.earned;
    if (cause === 'devG') this.startPayout(this.heroHeadScreen());
    this.updateSky();
    return summary;
  }

  /** Hộp hỏi "Đi ngủ?" đang mở (Esc = "Không" — systems/pause.ts resolveEsc). */
  get sleepPromptOpen(): boolean {
    return this.nightPhase === 'sleepPrompt';
  }

  /** Đang ngủ / ngủ gục / tổng kết / thức dậy: Esc không mở Tạm dừng. */
  get nightBusy(): boolean {
    return this.nightPhase !== 'none' && this.nightPhase !== 'sleepPrompt';
  }

  /** Chữ "Zzz" trên đầu nhân vật: lúc đang thiếp đi ở giường và lúc ngủ gục (HUD vẽ, nằm trên lớp tối). */
  get zzzActive(): boolean {
    return this.nightPhase === 'fallingAsleep' || this.nightPhase === 'passingOut';
  }

  /** Toạ độ màn (1920×1080) ngay trên đầu nhân vật — HUD đặt chữ "Zzz" ở đây. Nằm ra đất thì đầu ở bên cạnh. */
  heroHeadScreen(): { x: number; y: number } {
    const cam = this.cameras.main;
    const lying = Math.abs(this.hero.angle) > 45;
    const side = this.hero.angle < 0 ? -1 : 1;
    const wx = this.hero.x + (lying ? side * this.heroBodyHeight * 0.8 : 0);
    const wy = this.hero.y - (lying ? T * 0.5 : this.heroBodyHeight);
    return { x: cam.x + (wx - cam.worldView.x) * cam.zoom, y: cam.y + (wy - cam.worldView.y) * cam.zoom };
  }

  /** Click / F ở giường: từ earliestSleepHour (18h) → hỏi "Đi ngủ?"; sớm hơn → bong bóng "Còn sớm, ngủ gì giờ này". */
  private requestSleep(): void {
    if (!canSleepAt(this.clockHour, gameConfig.earliestSleepHour)) {
      this.tooEarlyCount++;
      this.showBubble(bubbles.tooEarlyToSleep);
      return;
    }
    if (this.bagOpen) this.setBagOpen(false, false);
    this.closeShop(false);
    this.sleepPromptOpens++;
    this.sleepPromptHover = null;
    this.enterNight('sleepPrompt');
    this.audio.play('uiOpen');
  }

  /** "Không" (Esc / nút Không): đóng hộp hỏi, chơi tiếp (đồng hồ chạy lại). */
  private declineSleep(): void {
    this.sleepPromptHover = null;
    this.enterNight('none');
    this.audio.play('uiClose');
  }

  /** "Có" (Enter / nút Có): việc dở trên ô dừng, màn tối dần rồi qua đêm. */
  private startFallingAsleep(): void {
    this.stopWorkForNight();
    this.sleepPromptHover = null;
    // T-008: lưu bản "trước khi ngủ" (đang ở hộp hỏi nên được phép) — F5 lúc màn đang tối dần thì vào lại đứng cạnh giường.
    this.saveNow('beforeSleep');
    this.enterNight('fallingAsleep');
  }

  /**
   * Chạm 24h mà chưa ngủ → ngủ gục (GDD §3.1, B2): đang cuốc thì bỏ dở như bấm WASD (ô giữ số nhát), đóng mọi cửa sổ,
   * tắt bong bóng, nhân vật lăn ra đất + "Zzz", màn tối dần → qua đêm → tổng kết → sáng ra ở nhà, Sức 70, chửi một câu.
   */
  private startPassOut(): void {
    if (this.nightPhase !== 'none' && this.nightPhase !== 'sleepPrompt') return;
    this.stopWorkForNight();
    if (this.bagOpen) this.setBagOpen(false, false);
    this.closeShop(false);
    this.bubbleT = 0;
    this.bubbleKind = null;
    this.bubbleShakeX = 0;
    this.bubble.setVisible(false);
    this.enterNight('passingOut');
  }

  /** Việc dở trên ô dừng trước khi ngủ: cuốc = bỏ dở như WASD (D-022, giữ nhát đã chạm), việc nhanh đang chờ thì bỏ. */
  private stopWorkForNight(): void {
    if (this.isTilling()) this.abandonTill();
    else if (isBusy(this.action)) cancelTileAction(this.action);
    this.dragKind = null;
    this.dragBlocked = true;
  }

  /**
   * Sang một bước của chuỗi đêm: đặt lý do dừng đồng hồ ('sleep' suốt chuỗi, thêm 'daySummary' lúc tổng kết), nhân vật
   * đứng yên ở ảnh tĩnh, bỏ mọi phím/chuột bấm dở (không lọt sang bước sau).
   */
  private enterNight(phase: NightPhase): void {
    this.nightPhase = phase;
    cancelClickMove(this.clickMove);
    this.hideClickMarker();
    this.nightT = 0;
    this.pauseReasons.set('sleep', phase !== 'none');
    this.pauseReasons.set('daySummary', phase === 'summary');
    this.feetBody.setVelocity(0, 0);
    this.hideHighlight();
    this.hover.valid = false;
    this.summaryHoverButton = false;
    if (phase !== 'none') {
      if (this.hero.anims.isPlaying) this.hero.anims.stop();
      clearWalkBob(this.walk);
      this.showStill(heroTextureKey(1, this.facing));
      this.hero.setScale(1);
    }
    this.controls.clearPending();
  }

  /** Mở màn tổng kết với kết quả đêm vừa qua: dòng chữ, dòng chi tiết bán, nhịp hiện dần từ đầu. */
  private openSummary(summary: OvernightSummary): void {
    this.summaryLineList = summaryLines(summary, this.stamina.max);
    this.summaryDetail = saleDetailText(summary, (id) => itemInfo(id)?.name ?? id);
    this.summaryReveal = createReveal(this.summaryLineList.length, this.summaryRecord);
    this.summaryMoneyPrev = 0;
    this.summaryTickAt = Number.NEGATIVE_INFINITY;
    this.recordSfxPlayed = false;
    this.nightFade = 1;
    this.enterNight('summary');
    // T-026: jingle "ngày mới / tổng kết" (AUD-JNG-003) — nhạc nền nhỏ lại tới khi jingle xong.
    this.audio.play('jingleDaySummary');
  }

  /** Enter / click "Ngày mới": lần 1 lúc các dòng còn trượt → hiện hết ngay; lần sau → thức dậy sang ngày mới. */
  private pressSummaryAccept(): void {
    this.summaryAccepts++;
    if (acceptPress(this.summaryReveal, REVEAL_TIMING) === 'close') this.startWaking();
  }

  /** Số tiền đang đếm lên → tiếng "tách" (AUD-SFX-118 `dem-tien-1/2`, lệch cao độ ±4%), cách nhau tối thiểu summaryTickSeconds. */
  private tickSummarySound(): void {
    // T-027: chữ "Kỷ lục mới!" bắt đầu đóng dấu (kể cả khi bấm "hiện hết") → "ting" một lần.
    if (!this.recordSfxPlayed && recordProgress(this.summaryReveal, REVEAL_TIMING) > 0) {
      this.recordSfxPlayed = true;
      this.audio.play('recordNew', { detune: gameConfig.summaryRecordSfxDetune });
    }
    const earned = this.lastSummary?.sale.earned ?? 0;
    const shown = moneyShown(this.summaryReveal, earned, REVEAL_TIMING);
    if (shown === this.summaryMoneyPrev) return;
    this.summaryMoneyPrev = shown;
    if (this.summaryReveal.skipped || this.nightT - this.summaryTickAt < gameConfig.summaryTickSeconds) return;
    if (!this.audio.play('countTick')) return;
    this.summaryTickAt = this.nightT;
    this.summaryTicks++;
  }

  /**
   * Thức dậy: TRONG NHÀ, đứng cạnh giường (houseLayout wakeSpot), mặt hướng xuống, hết nằm — kể cả đêm qua ngủ gục ngoài
   * đồng (T-093: "sáng dậy trong nhà"). Màn đang tối hẳn nên đổi khu thẳng, không cần màn mờ chuyển khu; màn sáng dần.
   */
  private startWaking(): void {
    // T-027: đóng màn tổng kết → xu bay từ dòng tiền về ô tiền HUD (HUD đưa ô tiền lên trên lớp tối lúc xu bay).
    this.startPayout(summaryCoinOrigin());
    this.area = 'house';
    this.placeHero(HOUSE.wakeSpot.x, HOUSE.wakeSpot.y, 'down');
    this.applyAreaView();
    this.enterNight('waking');
    // T-026: màn bắt đầu sáng → gà gáy (kiểu theo ngày), rồi "phù" cây héo / jingle đầu mùa nếu có.
    if (this.lastSummary) this.greetMorning(this.lastSummary);
  }

  /**
   * Đặt nhân vật đứng (không nằm, không anim) ở (x, y) = giữa hộp chân, quay mặt `facing`, trong khu `this.area`.
   * Giới hạn vật lý phải đổi sang khu mới TRƯỚC khi reset: Body.reset kiểm giới hạn thế giới ngay lúc đó — giới hạn khu cũ sẽ
   * kéo chân về mép khu cũ (lỗi đã gặp: vào nhà xong đứng dính tường sau, ra vườn xong trôi xuống mép bản đồ).
   */
  private placeHero(x: number, y: number, facing: Facing): void {
    this.applyWorldBounds();
    this.feetBody.reset(x, y);
    this.prevFootX = x;
    this.prevFootY = y;
    this.speedRatio = 0;
    this.facing = facing;
    this.turn.frame = null;
    if (this.hero.anims.isPlaying) this.hero.anims.stop();
    clearWalkBob(this.walk);
    this.hero.setAngle(0);
    this.showStill(heroTextureKey(1, facing));
    const footBottom = y + this.feetBody.height / 2;
    this.hero.setPosition(x, footBottom).setDepth(footBottom).setScale(1);
    this.heroShadow.setPosition(x, footBottom - 2);
  }

  /** Sáng hẳn: chơi tiếp (đồng hồ chạy từ 6:00). Đêm qua ngủ gục → LUÔN chửi một câu (GDD §3.12, bỏ qua xác suất). */
  private finishWaking(): void {
    this.nightFade = 0;
    this.wakeCount++;
    this.enterNight('none');
    this.saveNow('newDay'); // T-008: sau màn tổng kết ("Ngày mới") — chơi tiếp từ 6:00
    if (this.lastSummary?.passedOut) this.curse(bubbles.grumblePassOut);
  }

  /**
   * Mỗi frame trong chuỗi đêm (thế giới đứng yên): xử lý phím/chuột của bước hiện tại, độ tối màn, nhân vật nằm ra đất,
   * nhịp hiện dần của tổng kết. Vẫn vẽ lại cây / ruộng / bong bóng (qua đêm xong hình cây phải đổi ngay).
   */
  private updateNight(dt: number): void {
    const c = this.controls;
    this.feetBody.setVelocity(0, 0);
    this.nightT += dt;
    const esc = c.consumePressed('menu') ? resolveEsc(this) : null;
    const enter = c.consumePressed('accept');
    const clicked = c.consumePrimaryPress();
    const inside = c.isPointerInside();
    const sp = c.pointerScreen(this.pointerScreenPt);
    switch (this.nightPhase) {
      case 'sleepPrompt':
        this.sleepPromptHover = inside ? sleepButtonAt(sp.x, sp.y) : null;
        this.windowCloseHover = inside && rectContains(windowCloseRect(sleepPromptRect()), sp.x, sp.y);
        if (enter || (clicked && this.sleepPromptHover === 'yes')) this.startFallingAsleep();
        else if (esc === 'declineSleep' || (clicked && (this.sleepPromptHover === 'no' || this.windowCloseHover))) this.declineSleep();
        break;
      case 'fallingAsleep':
        this.nightFade = Math.min(1, this.nightT / gameConfig.sleepFadeSeconds);
        if (this.nightT >= gameConfig.sleepFadeSeconds) this.openSummary(this.overnightAndSave('sleep'));
        break;
      case 'passingOut': {
        // Nghiêng dần ra đất (xoay quanh bàn chân — gốc sprite ở chân), về phía đang quay mặt; màn tối nhanh dần về cuối.
        const tip = Math.min(1, this.nightT / gameConfig.passOutTipSeconds);
        const side = this.facing === 'left' ? -1 : 1;
        this.hero.setAngle(side * gameConfig.passOutTipDegrees * (1 - (1 - tip) * (1 - tip)));
        const p = Math.min(1, this.nightT / gameConfig.passOutSeconds);
        this.nightFade = p * p;
        if (this.nightT >= gameConfig.passOutSeconds) this.openSummary(this.overnightAndSave('passout'));
        break;
      }
      case 'summary':
        tickReveal(this.summaryReveal, dt);
        this.summaryHoverButton = inside && rectContains(summaryButtonRect(), sp.x, sp.y);
        // T-092: nút đóng (X) của màn tổng kết = "Ngày mới".
        this.windowCloseHover = inside && rectContains(windowCloseRect(summaryPanelRect()), sp.x, sp.y);
        this.tickSummarySound();
        if (enter || (clicked && (this.summaryHoverButton || this.windowCloseHover))) this.pressSummaryAccept();
        else if (clicked && !allRevealed(this.summaryReveal, REVEAL_TIMING)) this.pressSummaryAccept(); // click chỗ khác: chỉ hiện hết
        break;
      case 'waking':
        this.nightFade = Math.max(0, 1 - this.nightT / gameConfig.wakeFadeSeconds);
        if (this.nightT >= gameConfig.wakeFadeSeconds) this.finishWaking();
        break;
      default:
        break;
    }
    this.updateSky();
    this.updateCropVisuals();
    this.updateTillVisuals(0);
    this.updateBubble(dt);
    this.updateFloats(dt);
  }

  /**
   * Vẽ viền ô (tx, ty). Trong tầm: nét trắng điệp dày + lót mực + nền mờ, "thở" (alpha lên xuống) để mắt
   * bắt được ngay. Ngoài tầm: nét xám mảnh, lót nhạt, không nền, đứng yên → khác hẳn ô trong tầm.
   * Chỉ đổi thuộc tính của 2 hình có sẵn — không tạo object mới mỗi frame.
   */
  private drawTileHighlight(tx: number, ty: number, inReachNow: boolean, dt: number): void {
    // Ô đang cuốc / cuốc dở / trong hàng chờ: bỏ nền phủ trắng (giữ nét viền) để thấy rõ nấc đất + thanh tiến độ.
    const fillAlpha = this.isTillBusyTile(tx, ty) ? 0 : gameConfig.tileHighlightFillAlpha[inReachNow ? 0 : 1];
    this.drawHighlightBox(ty * L.cols + tx, { x: tx, y: ty, w: 1, h: 1 }, inReachNow, dt, fillAlpha);
  }

  /**
   * Viền một vùng ô (1 ô ruộng, hoặc cả thùng bán / sạp hạt — T-006). `key` đổi thì nhịp thở bắt đầu lại.
   * Chỉ đổi kích thước 2 hình có sẵn khi vùng đổi cỡ — không tạo object mới mỗi frame.
   */
  private drawHighlightBox(
    key: number,
    r: TileRect,
    inReachNow: boolean,
    dt: number,
    fillAlpha: number,
    liftPx = 0,
    depth = DEPTH_TILE_HIGHLIGHT,
  ): void {
    if (key !== this.highlightTileKey) {
      this.highlightTileKey = key;
      this.highlightPulseT = 0;
    } else {
      this.highlightPulseT += dt;
    }
    const k = inReachNow ? 0 : 1; // chỉ số [trong tầm, ngoài tầm] trong các mảng config
    const w = gameConfig.tileHighlightWidth[k];
    const outline = gameConfig.tileHighlightOutline[k];
    const x = r.x * T + HIGHLIGHT_INSET;
    const y = r.y * T - liftPx + HIGHLIGHT_INSET;
    const bw = r.w * T - HIGHLIGHT_INSET * 2;
    const bh = r.h * T + liftPx - HIGHLIGHT_INSET * 2;
    if (!inReachNow) {
      // Ngoài tầm: nét đứt (đứng yên, không nền) thay cho 2 hình chữ nhật nét liền.
      this.highlight.setVisible(false);
      this.highlightBacking.setVisible(false);
      this.drawOutOfReachDash(x, y, bw, bh, depth + 1, w, outline, gameConfig.tileHighlightOutlineAlpha[k]);
      return;
    }
    this.highlightDash.setVisible(false);
    if (this.highlight.width !== bw || this.highlight.height !== bh) {
      this.highlight.setSize(bw, bh);
      this.highlightBacking.setSize(bw, bh);
    }
    if (this.highlight.depth !== depth + 1) {
      this.highlightBacking.setDepth(depth);
      this.highlight.setDepth(depth + 1);
    }
    this.highlightBacking
      .setPosition(x, y)
      .setStrokeStyle(w + outline * 2, palette.ink, gameConfig.tileHighlightOutlineAlpha[k])
      .setVisible(true);
    this.highlight
      .setPosition(x, y)
      .setStrokeStyle(w, palette.paper, 1)
      .setFillStyle(palette.paper, fillAlpha)
      .setVisible(true);
    this.highlight.isFilled = fillAlpha > 0;

    const alpha = pulseAlpha(this.highlightPulseT, gameConfig.tileHighlightPulseRate, gameConfig.tileHighlightPulseMinAlpha);
    this.highlight.setAlpha(alpha);
    this.highlightBacking.setAlpha(alpha);
  }

  /**
   * Viền ngoài tầm (ART-UI-001 A): từng đoạn nét đứt vẽ 2 lớp — lót mực dày (nét + outline mỗi bên) rồi xám tro
   * `palette.ash` đè lên. Độ dài đoạn / hở tính theo px màn rồi đổi ra px thế giới (camera phóng to).
   */
  private drawOutOfReachDash(x: number, y: number, w: number, h: number, depth: number, width: number, outline: number, outlineAlpha: number): void {
    const g = this.highlightDash;
    const sig = `${x}|${y}|${w}|${h}|${depth}`;
    if (sig !== this.highlightDashSig) {
      this.highlightDashSig = sig;
      const z = this.cameras.main.zoom || 1;
      const [dash, gap] = gameConfig.tileHighlightOutDashPx;
      const segs = dashedRectSegments({ x, y, w, h }, dash / z, gap / z);
      g.clear().setDepth(depth);
      g.lineStyle(width + outline * 2, palette.ink, outlineAlpha);
      for (const [x1, y1, x2, y2] of segs) g.lineBetween(x1, y1, x2, y2);
      g.lineStyle(width, palette.ash, 1);
      for (const [x1, y1, x2, y2] of segs) g.lineBetween(x1, y1, x2, y2);
    }
    g.setAlpha(1).setVisible(true);
  }

  /**
   * Tiến việc đang làm; phản ứng với các mốc: bắt đầu ô (quay mặt; cuốc thì đứng yên), mỗi lần chạm (cuốc: ô thêm
   * 1 nhát + juice; việc nhanh: gieo/tưới/hái/dọn + juice), nhát cuối cuốc (ô thành đất cuốc + juice "chốt").
   */
  private updateTileAction(dt: number, wantsToMove: boolean): void {
    const c = this.feetBody.center;
    const n = this.tillTuning.strikesPerPlot;
    // Cả hàng chờ chung một loại việc → đọc trước khi bước (bước xong mà hết việc thì kind về null).
    const kind = this.action.kind as TileJob | null;
    // Tới lượt mà ô đã ra ngoài tầm, đã đổi việc (vd đã gieo rồi), hết hạt, gùi đầy… → bỏ, xét ô kế.
    // T-004: tới lượt mà thiếu Sức → không làm, "đuối rồi…", XÓA cả hàng chờ (D-022) — vòng lặp trong stepTileAction
    // thấy hàng chờ rỗng thì dừng.
    const stillValid = (t: TileXY) => {
      // T-096b: không còn bỏ ô vì "ngoài tầm" — chưa đứng sát thì canStart giữ ô lại, driveTileQueue bước tới.
      if (kind === null) return false;
      if (jobFor(this.farm, t.x, t.y, growDaysOf) !== kind || !this.canDoJob(t, kind, true)) return false;
      if (this.hasStaminaFor(kind, true)) return true;
      this.action.queue.length = 0;
      return false;
    };
    // Ô cuốc dở thì chỉ làm số nhát còn lại (vd 4/6 → 2 nhát). Việc nhanh: 1 "nhát".
    const strikesFor = (t: TileXY) => (kind === 'till' ? strikesRemaining(this.farm, t.x, t.y, n) : 1);
    // Đang đi tới chỗ đứng đã chọn cho ô này → chờ tới nơi (không bắt đầu giữa đường dù đã lọt tầm).
    const walkingTo = (t: TileXY) => {
      const a = this.clickMove.action;
      return this.clickMove.active && a?.kind === 'tile' && a.x === t.x && a.y === t.y;
    };
    const canStart = (t: TileXY) => !walkingTo(t) && inFarmWorkRange(c.x, c.y, t.x, t.y, T, gameConfig.farmWorkRange);
    const ev = stepTileAction(this.action, dt, this.paramsFor(kind), stillValid, this.actionEvents, strikesFor, canStart);
    if (ev.started) this.farmStuck = 0;
    // Frame dài: nhát cuối ô trước CHẠM, xong ô và bắt đầu ô kế trong CÙNG một bước — lúc hỏi stillValid thì Sức của
    // ô trước chưa bị trừ (trừ ở impactTill bên dưới). Ghi nhớ để kiểm lại sau khi trừ.
    const startedInSameStep = ev.started !== null && ev.impact !== null && ev.impact !== ev.started;

    if (ev.started) {
      // Quay mặt về ô — dùng chung đường xoay khung chéo như khi đi (turnAnim) cho mượt. Đang đi (việc nhanh)
      // thì hướng mặt theo hướng đi, không quay.
      if (kind === 'till' || !wantsToMove) {
        const to = facingToward(c.x, c.y, ev.started.x, ev.started.y, T, this.facing);
        if (to !== this.facing) {
          startTurn(this.turn, this.facing, to, this.lastDirX, TURN_FRAME_SEC);
          this.facing = to;
        }
      }
      // Cuốc: dừng ngay (vận tốc cũ còn trên body tới bước vật lý kế).
      if (kind === 'till') this.feetBody.setVelocity(0, 0);
    }
    if (!ev.impact) return;
    switch (kind) {
      case 'till':
        this.impactTill(ev.impact, n);
        break;
      case 'plant':
        this.doPlant(ev.impact);
        break;
      case 'water':
        this.doWater(ev.impact);
        break;
      case 'harvest':
        this.doHarvest(ev.impact);
        break;
      case 'clear':
        this.doClear(ev.impact);
        break;
      default:
        break;
    }
    if (startedInSameStep && kind !== null && !canAfford(this.stamina, jobStaminaCost(kind, JOB_COSTS))) {
      // Ô kế vừa bắt đầu (chưa chạm nhát nào) mà sau khi trừ Sức ô trước thì không còn đủ → dừng như tới lượt thiếu Sức.
      cancelTileAction(this.action);
      this.sayTooTired();
    }
  }

  /** Một nhát cuốc chạm ô (D-022): +1 nhát, đủ nhát thì ô thành đất cuốc + juice "chốt". */
  private impactTill(t: TileXY, n: number): void {
    const result = strikeTill(this.farm, t.x, t.y, n);
    const plot = plotAt(this.farm, t.x, t.y);
    if (result === 'invalid' || !plot) return;
    const done = result === 'done';
    if (done) {
      this.showTilled();
      // Số nhát bị chỉnh nhỏ đi giữa chừng (QA) → ô xong sớm: không bổ tiếp vào đất đã cuốc. Chỉ áp cho đúng ô vừa bổ
      // (BUG-013: frame dài có thể đã bắt đầu ô kế trong cùng bước — ô mới giữ nguyên số nhát).
      capStrikesIfCurrent(this.action, t);
    }
    this.tillJuice(t.x, t.y, plot.tillStrikes, done);
    if (done) {
      // D-022: trừ staminaCostTill MỘT LẦN ở nhát cuối (bỏ dở không mất Sức), chữ "−4 Sức" bay lên; thỉnh thoảng lầm bầm.
      this.spendStamina(gameConfig.staminaCostTill, true);
      this.tryTillDoneBark();
    }
  }

  /** Gieo hạt (GDD §3.3): hạt ô hotbar đang chọn, không phải hạt thì hạt gieo lần trước; hết hạt → bong bóng. */
  private doPlant(t: TileXY): void {
    const slot = pickSeedSlot(this.inventory);
    if (slot < 0) {
      this.showBubble(bubbles.noSeeds);
      this.audio.play('uiError');
      return;
    }
    const seedId = this.inventory.slots[slot]!.id;
    const cropId = cropOfSeed(seedId);
    if (!cropId || !plantSeed(this.farm, t.x, t.y, cropId)) return;
    removeFromSlot(this.inventory, slot, 1);
    this.inventory.lastSeedId = seedId;
    this.inventoryRevision++;
    this.farmCounts.plants++;
    this.spendStamina(gameConfig.staminaCostPlant, false);
    const plantSfx = this.audio.play('plant');
    if (plantSfx) {
      this.lastPlantSfx = { key: plantSfx.key, detune: plantSfx.detune };
      this.lastSfx = plantSfx.key;
    }
    // Juice: vài hạt rơi xuống luống (GDD §8 "hạt rơi") + tiếng "lách tách" ở trên.
    const cx = t.x * T + T / 2;
    const cy = t.y * T + T * 0.55;
    const color = mixColor(palette.earth, cropColor(cropId), 0.35);
    for (let k = 0; k < gameConfig.plantSeedDropCount; k++) {
      this.spawnDrop(cx + (Math.random() - 0.5) * T * 0.5, cy - T * 0.45, (Math.random() - 0.5) * 40, 60 + Math.random() * 40, color, 3, 0.35);
    }
  }

  /** Tưới (GDD §8): giọt nước bắn + đất sẫm (vẽ ở updateCropVisuals) + tiếng "róc rách" (2 biến thể, lệch cao độ). */
  private doWater(t: TileXY): void {
    if (!waterPlot(this.farm, t.x, t.y)) return;
    this.farmCounts.waters++;
    this.spendStamina(gameConfig.staminaCostWater, false);
    const cx = t.x * T + T / 2;
    const cy = t.y * T + T / 2;
    const speed = 2.2 * T;
    for (let k = 0; k < gameConfig.waterDropCount; k++) {
      // Nửa vòng hướng lên: nước rơi xuống đất bắn tung toé.
      const a = Math.PI * (1.05 + 0.9 * Math.random());
      const v = speed * (0.45 + 0.55 * Math.random());
      this.spawnDrop(
        cx + (Math.random() - 0.5) * T * 0.6,
        cy + (Math.random() - 0.2) * T * 0.3,
        Math.cos(a) * v,
        Math.sin(a) * v,
        palette.water,
        3 + Math.random() * 2.5,
        gameConfig.waterDropLifeSeconds,
      );
    }
    const waterSfx = this.audio.play('water');
    if (waterSfx) {
      this.lastWaterSfx = waterSfx.key;
      this.lastSfx = waterSfx.key;
    }
  }

  /**
   * Hái (GDD §3.3, §8): gùi đầy → không hái, bong bóng. Hái được → đồ vào ô cùng loại / ô trống đầu tiên, ô về đất
   * chưa cuốc (harvestResetsSoil), cây bật lên, icon bay vào ô hotbar (HUD) và ô đó nảy.
   */
  private doHarvest(t: TileXY): void {
    const plot = plotAt(this.farm, t.x, t.y);
    const crop = plot?.crop;
    if (!plot || !crop) return;
    const itemId = cropItemId(crop.cropId);
    if (!canAdd(this.inventory, itemId, 1)) {
      this.showBubble(bubbles.bagFull);
      this.audio.play('uiError');
      return;
    }
    const cropId = harvestPlot(this.farm, t.x, t.y, growDaysOf, gameConfig.harvestResetsSoil);
    if (!cropId) return;
    const added = addItem(this.inventory, itemId, 1);
    this.inventoryRevision++;
    this.farmCounts.harvests++;
    this.spendStamina(gameConfig.staminaCostHarvest, false);
    // Tiếng "pop": không random cao độ — hái liên tiếp thì lên dần theo thang ngũ cung, ngừng lâu thì về nấc đầu.
    const detune = nextLadderStep(this.harvestLadder, gameConfig.harvestPitchLadderCents, gameConfig.harvestPitchResetSeconds);
    const harvestSfx = this.audio.play('harvest', { detune });
    if (harvestSfx) {
      this.harvestSfxLog.push({ key: harvestSfx.key, detune });
      if (this.harvestSfxLog.length > HARVEST_SFX_LOG) this.harvestSfxLog.shift();
      this.lastSfx = harvestSfx.key;
    }
    if (plot.soil === 'untilled') this.showUntilled(plot);
    this.spawnPop(t, cropId);
    // Icon bay: HUD vẽ ở hệ toạ độ màn hình → đổi điểm thế giới ra toạ độ màn. T-023: đang hiện dáng cúi → bay ra từ
    // TAY {ten} (điểm tay khung cuối, HERO_BEND_HAND); đang đi (khung bước) → từ ô như cũ.
    const cam = this.cameras.main;
    let wx = (t.x + 0.5) * T;
    let wy = (t.y + 0.5) * T - T * 0.3;
    if (this.actionAnimShown === 'bend') {
      const hand = bendHandOffset(this.facing);
      wx = this.hero.x + hand.x;
      wy = this.hero.y + hand.y;
      this.lastHarvestFrom = 'hand';
    } else {
      this.lastHarvestFrom = 'tile';
    }
    const screenX = cam.x + (wx - cam.worldView.x) * cam.zoom;
    const screenY = cam.y + (wy - cam.worldView.y) * cam.zoom;
    this.events.emit('item-gained', { itemId, slot: added.firstSlot, screenX, screenY });
  }

  /** Dọn cây héo: ô về đất chưa cuốc (tillStrikes = 0), bụi đất xám bay. */
  private doClear(t: TileXY): void {
    const plot = plotAt(this.farm, t.x, t.y);
    if (!plot || !clearWithered(this.farm, t.x, t.y)) return;
    this.farmCounts.clears++;
    // Dọn cây héo tốn như hái (GDD §3.2).
    this.spendStamina(gameConfig.staminaCostHarvest, false);
    this.showUntilled(plot);
    this.audio.play('clearWithered');
    this.spawnTillDust(t.x * T + T / 2, t.y * T + T / 2, Math.ceil(gameConfig.tillDustCount / 2), gameConfig.tillDustSpeed * T * 0.8);
  }

  /** Ô (tx, ty) là ruộng đang cuốc, cuốc dở hoặc đang trong hàng chờ (để viền ô không phủ trắng lên). */
  private isTillBusyTile(tx: number, ty: number): boolean {
    const plot = plotAt(this.farm, tx, ty);
    if (!plot) return false;
    return (plot.soil === 'untilled' && plot.tillStrikes > 0) || isPending(this.action, plot);
  }

  /**
   * Bỏ dở (D-022): dừng cuốc ngay, xóa hàng chờ. Ô đang cuốc giữ nguyên số nhát đã chạm — thanh tiến độ
   * còn trên ô, mờ đi. Chuột đang giữ thì không tự cuốc lại cho tới khi buông ra bấm lại.
   */
  private abandonTill(): void {
    cancelTileAction(this.action);
    this.dragBlocked = true;
    this.cancelCount++;
  }

  /** Đổi hình ô sang đất đã cuốc (T-021: tile đất tơi + viền luống — syncGround). */
  private showTilled(): void {
    this.syncGround();
  }

  /** Đổi hình ô về đất chưa cuốc (hái xong / dọn cây héo): tile cỏ khô, thanh tiến độ vẽ lại từ đầu. */
  private showUntilled(plot: FarmPlot): void {
    this.syncGround();
    const i = this.farm.plots.indexOf(plot);
    if (i >= 0) this.plotDrawn[i] = -1;
  }

  // ---------------------------------------------------------------- cây, giọt nước, bong bóng (T-003)

  /** Tạo sẵn pool giọt nước / hạt rơi, hình "cây bật lên", bong bóng chữ — không tạo object mới khi đang chơi. */
  private buildFarmJuice(): void {
    for (let i = 0; i < DROP_POOL; i++) {
      this.drops.push(this.add.circle(0, 0, 4, palette.water, 1).setStrokeStyle(1.5, palette.ink, 0.8).setVisible(false).setDepth(DEPTH_TILL_DUST));
      this.dropLife.push(0);
      this.dropVx.push(0);
      this.dropVy.push(0);
    }
    for (let i = 0; i < POP_POOL; i++) {
      this.pops.push(this.add.graphics().setVisible(false).setDepth(DEPTH_TILL_DUST - 1));
      // Gốc ảnh = gốc cây trong khung (hàng rootY) → bật lên từ đúng chỗ cây đứng.
      this.popImgs.push(
        this.add
          .image(0, 0, '__DEFAULT')
          .setOrigin(0.5, CROP_FRAME.rootY / CROP_FRAME.height)
          .setVisible(false)
          .setDepth(DEPTH_TILL_DUST - 1),
      );
      this.popLife.push(0);
      this.popBaseY.push(0);
    }
    // T-027: đốm lấp lánh của cây chín (texture vẽ bằng code một lần) + nhịp gọi hái từng ô.
    ensureSparkleTexture(this);
    for (let i = 0; i < SPARKLE_POOL; i++) {
      // Depth đặt lúc bật đốm (theo ô cây) — xem SPARKLE_DEPTH_ABOVE_CROP.
      this.sparkles.push(this.add.image(0, 0, FX_SPARKLE).setVisible(false).setBlendMode(Phaser.BlendModes.ADD));
      this.sparkleLife.push(0);
    }
    for (let i = 0; i < this.farm.plots.length; i++) this.ripeCycleSeen.push(Number.NaN);
    // T-092: bong bóng vẽ 1:1 với màn (ảnh giao diện làm cho 1080p): container co 1/cameraZoom để bù camera phóng to →
    // toạ độ trong container = px màn. Chữ cỡ px màn (gameConfig.bubbleFontPx).
    this.bubbleBg = this.add.graphics();
    this.bubbleText = this.add
      .text(0, 0, '', {
        fontFamily: uiFontFamily,
        fontSize: `${gameConfig.bubbleFontPx}px`,
        fontStyle: 'bold',
        color: cssColor('ink'),
        align: 'center',
        wordWrap: { width: gameConfig.bubbleWrapPx, useAdvancedWrap: true },
      })
      .setOrigin(0.5);
    this.bubbleArt = this.buildBubbleArt();
    const art = this.bubbleArt;
    const parts: Phaser.GameObjects.GameObject[] = [this.bubbleBg];
    if (art) parts.push(art.normal.obj, art.normalTail, art.boast.obj, art.boastTail, art.curse, art.think);
    parts.push(this.bubbleText);
    this.bubble = this.add.container(0, 0, parts).setDepth(DEPTH_BUBBLE).setVisible(false);
  }

  /** Ảnh bong bóng (T-091): thiếu ảnh nào → cả bong bóng vẽ bằng code như cũ (dự phòng, console.warn). */
  private buildBubbleArt(): BubbleArt | null {
    const frames = canNineSlice(this, 'bubble') && canNineSlice(this, 'bubble-boast');
    const missing = ['bubble-tail', 'bubble-boast-tail', 'bubble-curse', 'bubble-think'].filter((n) => !hasUiTexture(this, n));
    for (const n of missing) warnUiFallback(n);
    if (!frames || missing.length > 0) return null;
    const start = { x: 0, y: 0, w: 120, h: 90 };
    const img = (name: string, ox: number, oy: number) => this.add.image(0, 0, uiKey(name)).setOrigin(ox, oy).setVisible(false);
    const normal = new UiFrame(this, bubbleFrames('normal').body, start);
    const boast = new UiFrame(this, bubbleFrames('boast').body, start);
    normal.obj.setVisible(false);
    boast.obj.setVisible(false);
    return {
      normal,
      normalTail: img(bubbleFrames('normal').tail, 0.5, 0),
      boast,
      boastTail: img(bubbleFrames('boast').tail, 0.5, 0),
      curse: img('bubble-curse', 0.5, 1),
      think: img('bubble-think', 0.5, 1),
    };
  }

  /** Một giọt (pool): vị trí, vận tốc (px/giây), màu, bán kính, thời gian sống. Hết pool thì bỏ qua. */
  private spawnDrop(x: number, y: number, vx: number, vy: number, color: number, radius: number, life: number): void {
    const i = this.dropLife.findIndex((l) => l <= 0);
    if (i < 0) return;
    this.drops[i].setPosition(x, y).setRadius(radius).setFillStyle(color, 1).setAlpha(1).setVisible(true);
    this.dropVx[i] = vx;
    this.dropVy[i] = vy;
    this.dropLife[i] = life;
  }

  private updateDrops(dt: number): void {
    if (dt <= 0) return;
    const gravity = 8 * T;
    for (let i = 0; i < this.drops.length; i++) {
      if (this.dropLife[i] <= 0) continue;
      this.dropLife[i] -= dt;
      const d = this.drops[i];
      if (this.dropLife[i] <= 0) {
        d.setVisible(false);
        continue;
      }
      this.dropVy[i] += gravity * dt;
      d.x += this.dropVx[i] * dt;
      d.y += this.dropVy[i] * dt;
      d.setAlpha(Math.min(1, this.dropLife[i] * 5));
    }
  }

  /** Hái: hình cây chín "bật lên" khỏi ô rồi mờ dần (GDD §8). */
  private spawnPop(t: TileXY, cropId: string): void {
    const i = this.popLife.findIndex((l) => l <= 0);
    if (i < 0) return;
    const g = this.pops[i];
    const img = this.popImgs[i];
    g.clear();
    const baseY = t.y * T + T * CROP_BASE;
    const sheet = this.cropSheetOf(cropId);
    if (sheet) {
      img.setTexture(sheet, OWN_FRAME_RIPE).setPosition(t.x * T + T / 2, baseY).setScale(1).setAlpha(1).setVisible(true);
      g.setVisible(false);
    } else {
      drawCrop(g, cropId, 'ripe', false, 0, 0);
      g.setPosition(t.x * T + T / 2, baseY).setScale(1).setAlpha(1).setVisible(true);
      img.setVisible(false);
    }
    this.popLife[i] = gameConfig.harvestPopSeconds;
    this.popBaseY[i] = baseY;
  }

  private updatePops(dt: number): void {
    if (dt <= 0) return;
    const dur = gameConfig.harvestPopSeconds;
    for (let i = 0; i < this.pops.length; i++) {
      if (this.popLife[i] <= 0) continue;
      this.popLife[i] = Math.max(0, this.popLife[i] - dt);
      const g = this.pops[i];
      const img = this.popImgs[i];
      if (this.popLife[i] <= 0) {
        g.setVisible(false);
        img.setVisible(false);
        continue;
      }
      const p = 1 - this.popLife[i] / dur; // 0 → 1
      // Bật lên nhanh rồi chậm lại (ease-out), phóng to nhẹ, mờ dần ở nửa sau.
      const rise = 1 - (1 - p) * (1 - p);
      const y = this.popBaseY[i] - rise * gameConfig.harvestPopHeight * T;
      const alpha = p < 0.5 ? 1 : 1 - (p - 0.5) * 2;
      g.setY(y).setScale(1 + 0.3 * rise).setAlpha(alpha);
      img.setY(y).setScale(1 + 0.3 * rise).setAlpha(alpha);
    }
  }

  /**
   * T-027: cây chín "gọi hái" (GDD §8): mỗi ripeSparkleIntervalSeconds mỗi cây chín nhún nhẹ (gốc đứng yên) + vài đốm lấp
   * lánh quanh ngọn; các ô lệch nhịp nhau (ripeCueOffset). Nhịp tính bằng hàm thuần (systems/juice.ts) — ở đây chỉ đặt scale
   * sprite (cây vẽ bằng code dự phòng thì chỉ lấp lánh) và bật đốm từ pool. `dt` = 0 khi thế giới đứng (cửa sổ, khựng hình).
   */
  private updateRipeCues(dt: number): void {
    this.ripeT += dt;
    const interval = gameConfig.ripeSparkleIntervalSeconds;
    let hopping = 0;
    for (let i = 0; i < this.farm.plots.length; i++) {
      const plot = this.farm.plots[i];
      const crop = plot.crop;
      if (!crop || cropStage(crop, growDaysOf) !== 'ripe') {
        this.ripeCycleSeen[i] = Number.NaN;
        continue;
      }
      const offset = ripeCueOffset(i, interval);
      const p = ripeCueProgress(this.ripeT, interval, offset, gameConfig.ripeHopSeconds);
      const cycle = ripeCueCycle(this.ripeT, interval, offset);
      if (cycle !== this.ripeCycleSeen[i]) {
        this.ripeCycleSeen[i] = cycle;
        // Vừa sang lần gọi mới (không bật khi cây vừa chín giữa lúc nghỉ — chờ lần sau cho đúng nhịp).
        if (p >= 0) this.spawnRipeSparkles(i, plot, cycle);
      }
      const sprite = this.plotCropSprites[i];
      if (!sprite.visible) continue;
      const base = crop.dryDays > 0 && !plot.watered ? gameConfig.cropThirstyScaleY : 1;
      const hop = ripeHop(p, gameConfig.ripeHopAmount, this.ripeHopScale);
      sprite.setScale(hop.x, base * hop.y);
      if (p >= 0) hopping++;
    }
    this.ripeHoppingNow = hopping;
    this.updateSparkles(dt);
  }

  /** Bật ripeSparkleCount đốm quanh ngọn cây ô `i` (chỗ tính từ ô + lần gọi — không ngẫu nhiên). Hết pool thì thôi. */
  private spawnRipeSparkles(i: number, plot: FarmPlot, cycle: number): void {
    this.ripeCueCount++;
    const depth = this.plotCropSprites[i].depth + SPARKLE_DEPTH_ABOVE_CROP;
    for (let j = 0; j < gameConfig.ripeSparkleCount; j++) {
      const k = this.sparkleLife.findIndex((l) => l <= 0);
      if (k < 0) return;
      const off = sparkleOffset(i, cycle, j, T * 0.32, T * 0.26, this.sparklePt);
      this.sparkles[k].setPosition(plot.x * T + T / 2 + off.x, plot.y * T + T * 0.08 + off.y).setScale(0).setAngle(0).setDepth(depth).setVisible(true);
      // Đốm sau lệch đời một chút → hai đốm không chớp cùng lúc.
      this.sparkleLife[k] = gameConfig.ripeSparkleSeconds * (1 + j * 0.25);
    }
  }

  private updateSparkles(dt: number): void {
    if (dt <= 0) return;
    const size = gameConfig.ripeSparkleSizePx / FX_SPARKLE_SIZE;
    const dur = gameConfig.ripeSparkleSeconds;
    for (let k = 0; k < this.sparkles.length; k++) {
      if (this.sparkleLife[k] <= 0) continue;
      this.sparkleLife[k] -= dt;
      const s = this.sparkles[k];
      if (this.sparkleLife[k] <= 0) {
        s.setVisible(false);
        continue;
      }
      // Đời đếm ngược; phần dư đầu (đốm thứ hai sống lâu hơn) = chờ ẩn trước khi chớp.
      const p = 1 - this.sparkleLife[k] / dur;
      s.setScale(size * sparkleScale(p)).setAngle(s.angle + dt * 120);
    }
  }

  /** Dải hình riêng của cây (crops.json `sprite`) nếu ảnh đã tải; null → dùng hình chung / vẽ bằng code. */
  private cropSheetOf(cropId: string): string | null {
    const key = cropById(cropId)?.sprite;
    return key && this.textures.exists(key) ? key : null;
  }

  /** Hình cây trên một ô (T-022): dải + khung theo giai đoạn / tuổi; `sheet` null = vẽ bằng code. */
  private cropVisualOf(crop: NonNullable<FarmPlot['crop']>, stage: CropStage): CropVisual {
    const v = cropVisual(crop, stage, growDaysOf(crop.cropId), this.cropSheetOf(crop.cropId), gameConfig.cropGrownFrameAt);
    return v.sheet && this.textures.exists(v.sheet) ? v : { sheet: null, frame: 0 };
  }

  /**
   * Mỗi frame: vẽ lại hình cây của ô nào ĐỔI so với lần vẽ trước (so "chữ ký" số — không đổi texture / vẽ Graphics
   * mỗi frame). T-022: cây là sprite dải 64×96 (khung theo giai đoạn); khát = tint ngả đất khô + co dọc; thiếu ảnh →
   * Graphics vẽ bằng code như cũ. Đất sẫm khi tưới nay là tile (syncGround).
   */
  private updateCropVisuals(): void {
    for (let i = 0; i < this.farm.plots.length; i++) {
      const plot = this.farm.plots[i];
      const crop = plot.crop;
      let sig = 0;
      let stage: CropStage = 'seed';
      let thirsty = false;
      let visual: CropVisual = { sheet: null, frame: 0 };
      if (crop) {
        stage = cropStage(crop, growDaysOf);
        thirsty = stage !== 'withered' && crop.dryDays > 0 && !plot.watered;
        visual = this.cropVisualOf(crop, stage);
        const cropIndex = CROPS.findIndex((cd) => cd.id === crop.cropId) + 1;
        // Chữ ký: loại cây, giai đoạn, khung (cây đang lớn đổi khung non → lớn theo tuổi), có ảnh không, khát.
        sig = ((((cropIndex + 1) * 4 + CROP_STAGE_CODE[stage]) * 4 + visual.frame) * 2 + (visual.sheet ? 1 : 0)) * 2 + (thirsty ? 1 : 0);
      }
      if (sig === this.cropDrawn[i]) continue;
      this.cropDrawn[i] = sig;
      const g = this.plotCrops[i];
      const sprite = this.plotCropSprites[i];
      g.clear();
      if (crop && visual.sheet) {
        sprite.setTexture(visual.sheet, visual.frame).setVisible(true);
        if (thirsty) sprite.setTint(THIRSTY_TINT).setScale(1, gameConfig.cropThirstyScaleY);
        else sprite.clearTint().setScale(1);
      } else {
        sprite.setVisible(false);
        if (crop) drawCrop(g, crop.cropId, stage, thirsty, T / 2, T * CROP_BASE);
      }
    }
  }

  /**
   * Bong bóng chữ trên đầu {ten} ("hết hạt rồi", "gùi đầy"). Cùng câu đang hiện thì chỉ kéo dài thời gian
   * (giữ chuột rê không làm bong bóng nháy liên tục).
   */
  showBubble(text: string, kind: BubbleKind = 'warn', style: BubbleStyle = bubbleStyleOf(kind)): boolean {
    // T-004: chỉ một bong bóng một lúc; bong bóng kém quan trọng không đè bong bóng quan trọng hơn
    // (chửi thề > "đuối rồi…"/báo > lầm bầm — systems/bubbles.ts).
    const active = this.activeBubbleKind();
    if (!bubbleCanShow(active, kind)) return false;
    const seconds = kind === 'grumble' ? this.grumbleSeconds : gameConfig.bubbleSeconds;
    if (active === kind && this.bubbleText.text === text && this.bubbleStyle === style) {
      this.bubbleT = seconds;
      return false;
    }
    if (this.bubbleArt) this.layoutBubbleArt(this.bubbleArt, text, style);
    else this.drawBubbleFallback(text, kind === 'grumble');
    this.bubbleKind = kind;
    this.bubbleStyle = style;
    this.bubbleT = seconds;
    this.bubblePopT = BUBBLE_POP_SECONDS;
    this.bubbleShows++;
    this.bubble.setVisible(true);
    return true;
  }

  /**
   * T-092: bong bóng ảnh. Thường / khoe: thân 9-slice co theo câu + đuôi rời chỉ xuống đầu. Chửi thề / nghĩ: ảnh cố định
   * phóng cho vừa câu. Gốc container = đỉnh đầu nhân vật; mọi số là px màn (uiSpec.ts tính bố cục).
   */
  private layoutBubbleArt(art: BubbleArt, text: string, style: BubbleStyle): void {
    for (const o of [art.normal.obj, art.normalTail, art.boast.obj, art.boastTail, art.curse, art.think]) o.setVisible(false);
    this.bubbleBg.clear();
    const t = this.bubbleText.setColor(cssColor('ink'));
    if (style === 'normal' || style === 'boast') {
      t.setFontSize(gameConfig.bubbleFontPx).setWordWrapWidth(gameConfig.bubbleWrapPx, true).setText(text);
      const l = bubbleBodyLayout(style, t.width, t.height);
      const frame = style === 'normal' ? art.normal : art.boast;
      const tail = style === 'normal' ? art.normalTail : art.boastTail;
      frame.setRect(l.body).obj.setVisible(true);
      tail.setPosition(l.tail.x, l.tail.y).setVisible(true);
      t.setPosition(l.text.x, l.text.y);
      return;
    }
    const [minS, maxS] = style === 'curse' ? gameConfig.curseBubbleScale : THINK_BUBBLE_SCALE;
    t.setFontSize(style === 'curse' ? gameConfig.curseBubbleFontPx : gameConfig.bubbleFontPx)
      .setWordWrapWidth(fixedBubbleWrapWidth(style, maxS), true)
      .setText(text);
    const l = fixedBubbleLayout(style, t.width, t.height, minS, maxS);
    const img = style === 'curse' ? art.curse : art.think;
    img.setOrigin(l.origin[0], l.origin[1]).setPosition(0, -BUBBLE_TEXT_PAD.headGap).setDisplaySize(l.w, l.h).setVisible(true);
    t.setPosition(l.text.x, l.text.y);
  }

  /** Dự phòng khi thiếu ảnh bong bóng: khung giấy viền mực / răng cưa đỏ son vẽ bằng code (như trước T-092). */
  private drawBubbleFallback(text: string, grumble: boolean): void {
    this.bubbleText
      .setFontSize(gameConfig.bubbleFontPx)
      .setWordWrapWidth(gameConfig.bubbleWrapPx, true)
      .setText(text)
      .setColor(cssColor(grumble ? 'paper' : 'ink'));
    const tail = grumble ? 18 : 14;
    const w = Math.ceil(this.bubbleText.width) + (grumble ? 60 : 40);
    const h = Math.ceil(this.bubbleText.height) + (grumble ? 40 : 22);
    const g = this.bubbleBg;
    g.clear();
    if (grumble) {
      // Bong bóng chửi thề (GDD §8): khung RĂNG CƯA đỏ son viền mực, chữ trắng điệp. Gốc container = mũi đuôi.
      const outer = jaggedBubblePoints(w + 12, h + 12, -tail - h / 2, 10);
      const inner = jaggedBubblePoints(w, h, -tail - h / 2, 7);
      g.fillStyle(palette.ink, 1).fillPoints(outer, true);
      g.fillTriangle(-18, -tail - 9, 15, -tail - 9, 3, 6);
      g.fillStyle(palette.vermilion, 1).fillPoints(inner, true);
      g.fillTriangle(-12, -tail - 6, 10, -tail - 6, 3, 0);
    } else {
      // Khung giấy trắng điệp viền mực + đuôi nhọn chỉ xuống đầu nhân vật. Gốc container = mũi đuôi.
      g.fillStyle(palette.ink, 1).fillRoundedRect(-w / 2 - 4, -h - tail - 4, w + 8, h + 8, 16);
      g.fillTriangle(-15, -tail - 4, 15, -tail - 4, 0, 4);
      g.fillStyle(palette.paper, 1).fillRoundedRect(-w / 2, -h - tail, w, h, 14);
      g.fillTriangle(-10, -tail - 1, 10, -tail - 1, 0, -2);
    }
    this.bubbleText.setPosition(0, -tail - h / 2);
  }

  private updateBubble(dt: number): void {
    if (this.bubbleT <= 0) return;
    this.bubbleT = Math.max(0, this.bubbleT - dt);
    if (this.bubbleT <= 0) {
      this.bubble.setVisible(false);
      this.bubbleKind = null;
      this.bubbleShakeX = 0;
      return;
    }
    this.bubblePopT = Math.max(0, this.bubblePopT - dt);
    // Chửi thề: bong bóng lắc ngang nhẹ suốt lúc hiện.
    this.bubbleShakeX =
      this.bubbleKind === 'grumble' ? Math.sin(this.clock * Math.PI * 2 * gameConfig.grumbleShakeRate) * gameConfig.grumbleShakePx : 0;
    // Hiện ra thì nảy nhẹ (to lên rồi về), sắp tắt thì mờ dần.
    // Container co 1/zoom → bong bóng hiện đúng cỡ px màn (ảnh giao diện 1:1 ở 1080p).
    const pop = (1 + 0.25 * (this.bubblePopT / BUBBLE_POP_SECONDS)) / this.cameras.main.zoom;
    this.bubble
      .setPosition(this.hero.x + this.bubbleShakeX, this.hero.y - HERO_FRAME.height - 6)
      .setScale(pop)
      .setAlpha(Math.min(1, this.bubbleT / 0.25));
  }

  /**
   * Juice một nhát cuốc (GDD §8, D-022): bụi đất văng, tiếng "bộp" lệch cao độ ±1 nửa cung, mồ hôi từ nhát
   * `tillSweatFromStrike`. Nhát cuối (`finish`): bụi × tillFinishDustMultiplier, khựng hình, ô nảy, thanh tiến độ
   * lóe sáng, tiếng chốt trầm + to hơn. Không rung màn (`tillScreenShake` false). Nhún nằm ở actionPose.
   * `strikeNo` = nhát thứ mấy của ô (1…số nhát).
   */
  private tillJuice(tx: number, ty: number, strikeNo: number, finish: boolean): void {
    this.tillCount++;
    const cx = tx * T + T / 2;
    const cy = ty * T + T / 2;
    const speed = gameConfig.tillDustSpeed * T * (finish ? 1.25 : 1);
    const count = gameConfig.tillDustCount * (finish ? gameConfig.tillFinishDustMultiplier : 1);
    this.spawnTillDust(cx, cy, count, speed);

    if (strikeNo >= gameConfig.tillSweatFromStrike) this.spawnSweat();
    if (gameConfig.tillScreenShake) this.shakeScreen(gameConfig.screenShakeLight);

    if (finish) {
      this.finishCount++;
      if (gameConfig.tillFinishHitStopSeconds > 0) {
        this.hitStop = gameConfig.tillFinishHitStopSeconds;
        this.hitStopCount++;
      }
      this.startBounce(tx, ty);
      const i = this.farm.plots.findIndex((p) => p.x === tx && p.y === ty);
      if (i >= 0) this.plotFlash[i] = gameConfig.tillFinishFlashSeconds;
    }

    // Nhát thường: "phập" lệch cao độ ±1 nửa cung cho cuốc liền nhiều nhát không nghe "máy móc". Nhát cuối (T-026): tiếng chốt
    // riêng `cuoc-chot-1/2` (AUD-SFX-103) — thôi mượn file "phập" hạ giọng.
    const tillSfx = this.audio.play(finish ? 'tillFinish' : 'till', finish ? { detuneOffset: gameConfig.tillFinishSfxDetune } : {});
    if (tillSfx) {
      this.lastSfx = tillSfx.key;
      this.lastSfxDetune = tillSfx.detune;
      this.lastSfxVolume = tillSfx.volume;
    }
  }

  /** Tung `count` hạt bụi đất (pool) quanh (cx, cy), toả nửa vòng hướng lên với tốc độ `speed` px/giây. */
  private spawnTillDust(cx: number, cy: number, count: number, speed: number): void {
    let spawned = 0;
    for (let i = 0; i < this.tillDust.length && spawned < count; i++) {
      if (this.tillDustLife[i] > 0) continue;
      // Tung toả nửa vòng hướng lên (đất bắn lên rồi rơi xuống).
      const a = Math.PI * (1.1 + 0.8 * Math.random());
      const v = speed * (0.5 + 0.5 * Math.random());
      this.tillDust[i]
        .setPosition(cx + (Math.random() - 0.5) * T * 0.5, cy + (Math.random() - 0.3) * T * 0.3)
        .setRadius(4 + Math.random() * 4)
        .setAlpha(1)
        .setVisible(true);
      this.tillDustVx[i] = Math.cos(a) * v;
      this.tillDustVy[i] = Math.sin(a) * v;
      this.tillDustLife[i] = gameConfig.tillDustLifeSeconds;
      spawned++;
    }
  }

  /** Vài giọt mồ hôi bắn ra từ đầu {ten}, bay chéo lên rồi rơi (hình tròn xanh nhạt, chưa có hình thật). */
  private spawnSweat(): void {
    const headX = this.hero.x;
    const headY = this.hero.y - this.heroBodyHeight * 0.82;
    const speed = gameConfig.tillSweatSpeed * T;
    let spawned = 0;
    for (let i = 0; i < this.sweat.length && spawned < gameConfig.tillSweatCount; i++) {
      if (this.sweatLife[i] > 0) continue;
      const side = spawned % 2 === 0 ? -1 : 1;
      const a = -Math.PI / 2 + side * (0.5 + 0.4 * Math.random()); // chéo lên trái / phải
      this.sweat[i].setPosition(headX + side * 14, headY).setAlpha(1).setScale(1).setVisible(true);
      this.sweatVx[i] = Math.cos(a) * speed;
      this.sweatVy[i] = Math.sin(a) * speed;
      this.sweatLife[i] = gameConfig.tillSweatLifeSeconds;
      spawned++;
    }
  }

  private updateSweat(dt: number): void {
    if (dt <= 0) return;
    const life = gameConfig.tillSweatLifeSeconds;
    const gravity = 7 * T;
    for (let i = 0; i < this.sweat.length; i++) {
      if (this.sweatLife[i] <= 0) continue;
      this.sweatLife[i] -= dt;
      const d = this.sweat[i];
      if (this.sweatLife[i] <= 0) {
        d.setVisible(false);
        continue;
      }
      this.sweatVy[i] += gravity * dt;
      d.x += this.sweatVx[i] * dt;
      d.y += this.sweatVy[i] * dt;
      const k = this.sweatLife[i] / life; // 1 → 0
      d.setAlpha(Math.min(1, k * 2)).setScale(0.6 + 0.4 * k);
    }
  }

  /** Ô vừa cuốc xong "nảy" một nhịp: mảnh đất đã cuốc của đúng ô đó phóng to rồi thu về. */
  private startBounce(tx: number, ty: number): void {
    this.bounceImg
      .setTexture(tileKey('soil-tilled'), this.tileFrame('soil-tilled', coreCell(tx, ty)))
      .setOrigin(0.5)
      .setPosition(tx * T + T / 2, ty * T + T / 2)
      .setDisplaySize(T, T)
      .setVisible(true);
    this.bounceT = gameConfig.tillFinishBounceSeconds;
  }


  /**
   * Mỗi frame: nấc đất + thanh tiến độ của từng ô (chỉ vẽ lại khi đổi), lóe sáng lúc xong ô, ô nảy,
   * số thứ tự trên ô chờ.
   */
  private updateTillVisuals(dt: number): void {
    // Tile đất theo nấc cuốc / tưới / hái (T-021) — chỉ đặt lại ô nào đổi.
    this.syncGround();
    const n = this.tillTuning.strikesPerPlot;
    const cur = this.action.current;
    for (let i = 0; i < this.farm.plots.length; i++) {
      const plot = this.farm.plots[i];
      const active = cur !== null && cur.x === plot.x && cur.y === plot.y;
      if (this.plotFlash[i] > 0) {
        // Xong ô: thanh đầy lóe trắng điệp rồi mờ tắt.
        this.plotFlash[i] = Math.max(0, this.plotFlash[i] - dt);
        if (this.plotDrawn[i] !== FLASH_SIG) {
          this.drawTillBar(this.plotBars[i], plot, n, n, true);
          this.plotDrawn[i] = FLASH_SIG;
        }
        this.plotBars[i].setAlpha(this.plotFlash[i] / gameConfig.tillFinishFlashSeconds);
        if (this.plotFlash[i] > 0) continue;
      }
      const bar = this.plotBars[i];
      // Chữ ký: số nhát × 4 + đang cuốc × 2 + đã cuốc — đổi thì mới vẽ lại.
      const sig = plot.tillStrikes * 4 + (active ? 2 : 0) + (plot.soil === 'tilled' ? 1 : 0);
      if (sig !== this.plotDrawn[i]) {
        this.plotDrawn[i] = sig;
        if (plot.soil === 'untilled' && (active || plot.tillStrikes > 0)) {
          this.drawTillBar(bar, plot, Math.min(plot.tillStrikes, n), n, false);
          bar.setVisible(true);
        } else {
          bar.clear().setVisible(false);
        }
      }
      if (bar.visible) {
        // Đang cuốc hoặc đang rê chuột lên: rõ 100%; bỏ dở: mờ còn ~50% (GDD §8) nhưng vẫn nằm trên ô để nhớ quay lại.
        const hovered = this.hover.valid && this.hover.x === plot.x && this.hover.y === plot.y;
        bar.setAlpha(active || hovered ? 1 : gameConfig.tillProgressIdleAlpha);
      }
    }

    if (this.bounceT > 0) {
      this.bounceT = Math.max(0, this.bounceT - dt);
      const t = 1 - this.bounceT / gameConfig.tillFinishBounceSeconds; // 0 → 1
      const size = T * (1 + gameConfig.tillFinishBounceScale * Math.sin(Math.PI * t));
      this.bounceImg.setDisplaySize(size, size);
      if (this.bounceT <= 0) this.bounceImg.setVisible(false);
    }

    const q = this.action.queue;
    for (let i = 0; i < this.queueLabels.length; i++) {
      const label = this.queueLabels[i];
      const badge = this.queueBadges[i];
      if (i < q.length) {
        // Góc dưới-phải ô: không che nấc đất ở giữa, không đè thanh tiến độ ở mép trên.
        const bx = q[i].x * T + T - QUEUE_BADGE.inset;
        const by = q[i].y * T + T - QUEUE_BADGE.inset;
        label.setText(String(i + 1)).setPosition(bx, by).setVisible(true);
        badge.setPosition(bx, by).setVisible(true);
      } else if (label.visible) {
        label.setVisible(false);
        badge.setVisible(false);
      }
    }
  }

  /** Thanh tiến độ `total` đốt ở mép trên ô, `filled` đốt đầy (vàng hoa hòe); `flash` = cả thanh trắng điệp. */
  private drawTillBar(g: Phaser.GameObjects.Graphics, plot: FarmPlot, filled: number, total: number, flash: boolean): void {
    const w = T * TILL_BAR.widthRatio;
    const h = TILL_BAR.height;
    const x0 = plot.x * T + (T - w) / 2;
    const y0 = plot.y * T + TILL_BAR.top;
    const seg = (w - TILL_BAR.gap * (total - 1)) / total;
    g.clear();
    // Lót mực cả thanh cho nổi trên cỏ / đất / nhân vật.
    g.fillStyle(palette.ink, 0.85).fillRoundedRect(x0 - 3, y0 - 3, w + 6, h + 6, 4);
    for (let s = 0; s < total; s++) {
      const sx = x0 + s * (seg + TILL_BAR.gap);
      if (flash) g.fillStyle(palette.paper, 1);
      else if (s < filled) g.fillStyle(palette.gold, 1);
      else g.fillStyle(palette.paper, 0.22);
      g.fillRect(sx, y0, seg, h);
    }
    g.setVisible(true);
  }

  /** Rung màn theo một mức của GDD §8 (dùng lại cho sự kiện lớn sau này). */
  private shakeScreen(shake: { amplitudeTiles: number; durationSeconds: number }): void {
    const cam = this.cameras.main;
    // Phaser tính độ rung theo tỷ lệ kích thước camera (X theo bề rộng, Y theo bề cao) → đổi "0.05 ô"
    // ra tỷ lệ riêng cho từng trục để hai chiều rung bằng nhau (BUG-005).
    const amp = shake.amplitudeTiles * T;
    cam.shake(shake.durationSeconds * 1000, new Phaser.Math.Vector2(amp / cam.width, amp / cam.height), true);
    this.shakeCount++;
  }

  private updateTillDust(dt: number): void {
    const life = gameConfig.tillDustLifeSeconds;
    const gravity = 9 * T; // px/giây² — đủ để đất rơi lại trong ~0.4 giây
    for (let i = 0; i < this.tillDust.length; i++) {
      if (this.tillDustLife[i] <= 0) continue;
      this.tillDustLife[i] -= dt;
      const d = this.tillDust[i];
      if (this.tillDustLife[i] <= 0) {
        d.setVisible(false);
        continue;
      }
      this.tillDustVy[i] += gravity * dt;
      d.x += this.tillDustVx[i] * dt;
      d.y += this.tillDustVy[i] * dt;
      d.setAlpha(Math.min(1, (this.tillDustLife[i] / life) * 2));
    }
  }

  /**
   * Chọn hình cho nhân vật, theo thứ tự ưu tiên:
   * 0. Đang cuốc (T-009) → khung cuốc theo tiến độ nhát (systems/toolAnim.ts), hướng = hướng đang quay về ô. Bỏ qua khung
   *    xoay chéo: nhát đầu bắt đầu bằng khung "chuẩn bị" đúng hướng mới luôn.
   * 1. Đang xoay → khung chéo (anim đi tạm dừng; vật lý vẫn chạy bình thường — chỉ đổi hình).
   * 2. Đang đi → anim bước đúng hướng, tốc độ khung theo tốc độ thật; xoay xong thì vào khung đầu.
   * 3. Đứng → ảnh chống nạnh.
   */
  private updateHeroAnim(timeScale: number): void {
    const anims = this.hero.anims;
    // T-023: cuốc / tưới / cúi (gieo, hái, dọn) cùng một luật — khung tính từ tiến độ động tác, khung 2 trùng lúc chạm.
    const kind = isBusy(this.action) ? this.action.kind : null;
    const anim = actionAnimFor(kind);
    if (anim && showActionPose(anim, timeScale > 0)) {
      const key = heroActionKey(1, anim, this.facing);
      // Thiếu ảnh động tác (tải lỗi) → bỏ qua, dùng khung đi / đứng + cú nhún bằng code như trước T-023.
      if (this.textures.exists(key)) {
        if (anims.isPlaying) anims.stop();
        clearWalkBob(this.walk);
        const params = this.paramsFor(kind);
        const hoe = anim === 'hoe';
        const frame = actionFrameAt(
          this.action.elapsed / params.duration,
          params.impactAt,
          hoe ? gameConfig.tillAnimWindupShare : gameConfig.quickAnimWindupShare,
          hoe ? gameConfig.tillAnimImpactShare : gameConfig.quickAnimImpactShare,
        );
        this.hoeFrame = hoe ? frame : -1;
        this.actionAnimShown = anim;
        this.actionFrame = frame;
        this.showStill(key, frame);
        return;
      }
    }
    this.hoeFrame = -1;
    this.actionAnimShown = null;
    this.actionFrame = -1;
    const diagonal = this.turn.frame;
    if (diagonal) {
      if (anims.isPlaying) anims.stop();
      clearWalkBob(this.walk);
      this.showStill(heroTurnKey(1), turnFrameIndex(diagonal));
    } else if (timeScale > 0) {
      const key = heroWalkKey(1, this.facing);
      if (!anims.isPlaying || anims.currentAnim?.key !== key) {
        // Luôn vào khung đầu (chạm gót) của chu trình — nối tiếp khung xoay vừa hiện.
        this.hero.play({ key, startFrame: 0 });
        this.syncHeroOrigin(); // vừa cuốc xong mà đi luôn → về origin khung đi
      }
      anims.timeScale = timeScale;
    } else {
      if (anims.isPlaying) anims.stop();
      this.showStill(heroTextureKey(1, this.facing));
    }
  }

  /** Đặt ảnh tĩnh cho sprite — chỉ khi khác ảnh đang hiện (gọi setTexture mỗi frame là thừa). */
  private showStill(key: string, frame?: number): void {
    const frameName = frame === undefined ? '__BASE' : String(frame);
    if (this.hero.texture.key === key && String(this.hero.frame.name) === frameName) return;
    this.hero.setTexture(key, frame);
    this.syncHeroOrigin();
  }

  /**
   * Khung động tác (128×128, chân ở hàng 111) và khung đi/đứng (64×96, chân sát đáy) có điểm chân khác nhau → đổi
   * texture thì đổi origin CÙNG LÚC để bàn chân đứng yên một chỗ (không nhảy lên/xuống khi bắt đầu / thôi cuốc).
   */
  private syncHeroOrigin(): void {
    const y = isActionTextureKey(this.hero.texture.key) ? HERO_ORIGIN_Y_ACTION : HERO_ORIGIN_Y_WALK;
    if (this.hero.originY !== y) this.hero.setOrigin(0.5, y);
  }

  /** Chiều cao THÂN nhân vật (px, theo khung đi 64×96) — bong bóng / mồ hôi bám theo đầu, không nhảy khi đổi sang khung cuốc 128. */
  private get heroBodyHeight(): number {
    return HERO_FRAME.height * Math.abs(this.hero.scaleY);
  }

  // ---------------------------------------------------------------- âm thanh (T-026)

  /**
   * Âm thanh mỗi frame: báo AudioManager "đang muốn nghe gì" (nhạc ngày / đêm theo giờ + khu, tiếng nền trong nhà, giảm khi
   * Tạm dừng, ngáy khi đang ngủ), ngáp lúc vừa qua 23h, gà gáy chào sáng game mới, hover / click nút giao diện.
   * Trình duyệt chặn âm thanh tới lần bấm phím / chuột đầu tiên — AudioManager tự chờ; nhạc vào ngay sau lần bấm đó.
   */
  private tickAudio(dt: number): void {
    if (!this.audio) return;
    const hour = this.clockHour;
    const state = { hour, area: this.area, raining: false }; // thời tiết chưa có (mưa → amb-mua + sấm khi có, GDD §3.1)
    const scape: Soundscape = {
      music: chooseMusic(state, SOUNDSCAPE_RULES),
      ambience: chooseAmbience(state, SOUNDSCAPE_RULES),
      bedMultiplier: this.pauseMenuOpen ? gameConfig.pauseMusicVolumeMultiplier : 1,
      snoring: this.zzzActive,
      raining: state.raining,
    };
    this.audio.update(dt, scape);

    // Ngáp dài lúc đồng hồ vừa qua 23h (đồng hồ bắt đầu nháy đỏ) — chỉ khi đang chơi (không lúc ngủ / tổng kết).
    if (this.nightPhase === 'none' && crossedHour(this.audioPrevHour, hour, gameConfig.passOutWarnHour)) {
      if (this.audio.play('yawn')) this.yawnCount++;
    }
    this.audioPrevHour = hour;

    // Game mới: gà gáy kiểu "bình thường" (Ngày 1) khi âm thanh vừa mở khoá — nếu trời còn sớm.
    if (this.pendingNewGameRooster && !this.audio.locked) {
      this.pendingNewGameRooster = false;
      if (this.dayClock.day === 1 && hour < gameConfig.newGameRoosterBeforeHour) this.crowRooster();
    }

    // Giao diện: con trỏ sang nút khác → "tích" khẽ; bấm chuột lúc con trỏ trên nút (frame trước) → "cộc" gỗ.
    const hoverNow = this.uiHoverId();
    const presses = this.controls.primaryPressCount;
    if (presses !== this.seenPrimaryPresses) {
      this.seenPrimaryPresses = presses;
      if ((this.lastUiHover ?? hoverNow) !== null) this.audio.play('uiClick');
    } else if (hoverNow !== null && hoverNow !== this.lastUiHover) {
      this.audio.play('uiHover');
    }
    this.lastUiHover = hoverNow;
  }

  /**
   * Nút giao diện dưới con trỏ lúc này (null = không trên nút nào): nút gỗ trong các cửa sổ, nút X, nút Gùi, nút sạp hạt CÒN
   * MUA ĐƯỢC (nút xám không kêu hover; bấm nút xám → tiếng lỗi ở buyFromStall).
   */
  private uiHoverId(): string | null {
    if (this.pauseMenuOpen) {
      if (this.restartConfirmOpen) return this.restartConfirmHover ?? (this.windowCloseHover ? 'close' : null);
      if (this.pauseVolumeHover) return this.pauseVolumeHover;
      if (this.pauseHoverResume) return 'resume';
      if (this.pauseHoverRestart) return 'restart';
      return this.windowCloseHover ? 'close' : null;
    }
    if (this.cheatPanelOpen) return this.cheatHover >= 0 ? `cheat-${this.cheatHover}` : this.windowCloseHover ? 'close' : null;
    if (this.nightPhase === 'sleepPrompt') return this.sleepPromptHover ?? (this.windowCloseHover ? 'close' : null);
    if (this.nightPhase === 'summary') return this.summaryHoverButton ? 'summary' : this.windowCloseHover ? 'close' : null;
    if (this.nightPhase !== 'none') return null;
    if (this.shopWindow === 'seedStall' && this.stallHover >= 0) {
      const item = this.seedStallItems[this.stallHover];
      if (item && hasMoney(this.wallet, seedPriceOf(item.cropId) ?? 0)) return `stall-${this.stallHover}`;
    }
    if (this.windowCloseHover && this.windowOpen) return 'close';
    if (this.bagButtonHover) return 'bag';
    return null;
  }

  /** Kiểu gà gáy sáng nay — xác định theo (seed lần chơi, số ngày): F5 cùng ngày → cùng kiểu (audio list AUD-SFX-109). */
  get roosterToday(): RoosterKind {
    return roosterKindForDay(this.worldSeed, this.dayClock.day, ROOSTER_RULES);
  }

  /** Gà gáy chào sáng (không lệch cao độ — giữ chất từng kiểu). */
  private crowRooster(): void {
    const kind = this.roosterToday;
    if (!this.audio.playKey(roosterKey(kind))) return;
    this.roosterLog.push({ day: this.dayClock.day, kind });
    if (this.roosterLog.length > 8) this.roosterLog.shift();
  }

  /**
   * Sáng ra (sau ngủ / ngủ gục — lúc màn bắt đầu sáng — hoặc phím G): gà gáy; đợi gà gáy xong thì "phù" nếu đêm qua có cây
   * héo, jingle "Mùa … tới rồi!" nếu sang mùa mới.
   */
  private greetMorning(summary: OvernightSummary): void {
    this.crowRooster();
    if (summary.witheredTonight > 0) this.time.delayedCall(gameConfig.morningWitherSfxDelaySeconds * 1000, () => this.audio.play('wither'));
    if (summary.seasonChanged) this.time.delayedCall(gameConfig.morningSeasonJingleDelaySeconds * 1000, () => this.audio.play('jingleNewSeason'));
  }

  /**
   * T-024: tán cây luôn vẽ TRÊN người → thân {ten} chạm vùng lá (đi sau / đứng dưới tán) thì tán mờ đi để vẫn thấy
   * nhân vật — không bị "mất" người. Chỉ 12 cây nên duyệt hết mỗi frame là đủ nhẹ.
   */
  private fadeTreesInFront(fx: number, footBottom: number): void {
    for (let i = 0; i < this.canopies.length; i++) {
      const covered = canopyCoversHero(this.canopyBoxes[i], fx, footBottom, HERO_BODY_BOX.halfW, HERO_BODY_BOX.h);
      const alpha = covered ? gameConfig.treeFadeAlpha : 1;
      if (this.canopies[i].alpha !== alpha) this.canopies[i].setAlpha(alpha);
    }
  }

  // ---------------------------------------------------------------- đồng hồ ngày, màu trời, Tạm dừng (T-005)

  /** Giờ game hiện tại (số thực, 14.5 = 14:30). HUD đọc để vẽ đồng hồ. */
  get clockHour(): number {
    return clockHour(this.dayClock, gameConfig);
  }

  /** Lớp màu trời: hình chữ nhật cỡ màn, không cuộn theo camera (scrollFactor 0) — luôn phủ đúng khung nhìn. */
  private buildSkyOverlay(): void {
    // Camera phóng to (cameraZoom) quanh tâm màn → hình cỡ màn đặt ở (0,0) vẫn phủ kín (còn dư ra ngoài).
    this.skyOverlay = this.add
      .rectangle(0, 0, gameConfig.gameWidth, gameConfig.gameHeight, palette.indigo, 0)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(DEPTH_SKY)
      .setVisible(false);
  }

  /** Tô lớp màu trời theo giờ hiện tại (GDD §3.1) — chỉ đổi màu/độ đục của hình có sẵn, không tạo object mới. */
  private updateSky(): void {
    const tint = skyTint(this.clockHour, gameConfig.skyTintKeyframes, gameConfig.skyTintMaxAlpha);
    // T-093: trong nhà trời tối dần nhẹ hơn (có mái che, có bếp) — cùng màu, độ đục × houseSkyAlphaMultiplier.
    const alpha = this.area === 'house' ? tint.alpha * gameConfig.houseSkyAlphaMultiplier : tint.alpha;
    this.skyOverlay.setFillStyle(tint.color, alpha).setVisible(alpha > 0.001);
  }

  /** Đồng hồ vừa chạm dayEndHour (24h) mà chưa ngủ → ngủ gục (T-007). */
  private onDayEndReached(): void {
    this.dayEndHits++;
    this.startPassOut();
  }

  /** Phím thử F9 (chỉ bản dev): +devAddHours giờ game, không vượt 24h. */
  private devAddHour(): void {
    this.devHourPresses++;
    if (addGameHours(this.dayClock, gameConfig.devAddHours, gameConfig)) this.onDayEndReached();
    this.updateSky();
  }

  /**
   * Chuyển tab / thu nhỏ trình duyệt (visibilitychange → hidden) hoặc Alt+Tab sang cửa sổ khác (window blur, tab vẫn hiện)
   * → tự mở Tạm dừng (pauseOnFocusLost). Quay lại thì game vẫn dừng, giờ không nhảy — người chơi bấm Esc / "Tiếp tục".
   */
  private listenFocusLoss(): void {
    // T-008: ẩn tab / mất focus / đóng tab hoặc F5 (pagehide, beforeunload) → lưu ngay (kể cả khi Tạm dừng đã mở sẵn).
    const onVisibility = (): void => {
      if (document.visibilityState !== 'hidden') return;
      this.saveNow('hidden');
      this.openPauseMenu('hidden');
    };
    const onBlur = (): void => {
      this.saveNow('blur');
      this.openPauseMenu('blur');
    };
    const onPageHide = (): void => {
      this.saveNow('pagehide');
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    window.addEventListener('pagehide', onPageHide);
    window.addEventListener('beforeunload', onPageHide);
    const detach = (): void => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('pagehide', onPageHide);
      window.removeEventListener('beforeunload', onPageHide);
    };
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, detach);
    this.events.once(Phaser.Scenes.Events.DESTROY, detach);
  }

  /**
   * Mở cửa sổ Tạm dừng: đồng hồ dừng, vật lý + anim nhân vật dừng, mọi update thế giới bị bỏ qua (xem update()).
   * Có thể gọi từ sự kiện trình duyệt (ngoài vòng lặp game) — chỉ đặt cờ, không phụ thuộc thứ tự frame.
   */
  private openPauseMenu(cause: PauseCause): void {
    if (this.pauseMenuOpen) return;
    if (!shouldAutoPause(cause, { pauseOnFocusLost: gameConfig.pauseOnFocusLost, ready: this.gardenReady })) return;
    this.pauseMenuOpen = true;
    this.pauseCause = cause;
    this.pauseOpens++;
    // T-008: mở Tạm dừng bằng Esc → lưu (mất focus / ẩn tab đã lưu ở listener). Lưu TRƯỚC khi đặt lý do dừng — không ảnh hưởng gì,
    // chỉ để dòng "Đã lưu lúc…" hiện đúng giờ vừa dừng.
    if (cause === 'esc') this.saveNow('pause');
    this.closeRestartConfirm();
    this.pauseReasons.set('pauseMenu', true);
    this.feetBody.setVelocity(0, 0);
    this.physics.world.pause();
    this.hero.anims.pause();
    this.hideHighlight();
    this.controls.clearPending();
    this.applyMusicVolume();
    this.audio.play('uiOpen');
  }

  /** Đóng Tạm dừng, chơi tiếp đúng chỗ cũ. Bỏ mọi phím/chuột bấm trong lúc dừng; lần giữ chuột đang dở không xuống ruộng. */
  private closePauseMenu(): void {
    if (!this.pauseMenuOpen) return;
    this.pauseMenuOpen = false;
    this.pauseCause = null;
    this.pauseHoverResume = false;
    this.pauseHoverRestart = false;
    this.pauseVolumeHover = null;
    this.closeRestartConfirm();
    this.pauseReasons.set('pauseMenu', false);
    // T-041: bảng Thử còn mở bên dưới → thế giới vẫn đứng (bảng đóng mới chạy lại).
    if (!this.cheatPanelOpen) {
      this.physics.world.resume();
      this.hero.anims.resume();
    }
    this.dragKind = null;
    this.dragBlocked = true; // vừa bấm nút "Tiếp tục" mà chuột còn giữ → không tính là click xuống ruộng
    this.controls.clearPending();
    this.applyMusicVolume();
    this.audio.play('uiClose');
  }

  /**
   * Mỗi frame lúc Tạm dừng: Esc hoặc click nút "Tiếp tục" để chơi tiếp; click "Chơi lại từ đầu" → hộp xác nhận (T-008).
   * Hộp xác nhận mở: Esc / "Không" đóng hộp (Tạm dừng vẫn mở), "Có" xóa save và bắt đầu lại Ngày 1. Mọi lần nhấn khác bị bỏ
   * (Enter KHÔNG chọn "Có" — tránh lỡ tay xóa save).
   */
  private updatePauseMenu(): void {
    const c = this.controls;
    const sp = c.pointerScreen(this.pointerScreenPt);
    const inside = c.isPointerInside();
    const escPressed = c.consumePressed('menu');
    const clicked = c.consumePrimaryPress();
    c.clearPending();
    if (this.restartConfirmOpen) {
      this.pauseVolumeHover = null;
      this.restartConfirmHover = inside ? restartConfirmButtonAt(sp.x, sp.y) : null;
      // T-092: nút đóng (X) của hộp xác nhận = "Không".
      this.windowCloseHover = inside && rectContains(windowCloseRect(restartConfirmRect()), sp.x, sp.y);
      const esc = escPressed && resolveEsc(this) === 'closeRestartConfirm';
      if (clicked && this.restartConfirmHover === 'yes') this.restartFresh();
      else if (esc || (clicked && (this.restartConfirmHover === 'no' || this.windowCloseHover))) this.closeRestartConfirm();
      return;
    }
    this.pauseHoverResume = inside && rectContains(pauseResumeButtonRect(), sp.x, sp.y);
    this.pauseHoverRestart = inside && rectContains(pauseRestartButtonRect(), sp.x, sp.y);
    // T-026: 2 hàng âm lượng Nhạc / Hiệu ứng (nút − / +).
    this.pauseVolumeHover = inside ? volumeButtonAt(sp.x, sp.y) : null;
    // T-092: nút đóng (X) của Tạm dừng = "Tiếp tục".
    this.windowCloseHover = inside && rectContains(windowCloseRect(pausePanelRect()), sp.x, sp.y);
    const esc = escPressed && resolveEsc(this) === 'closePause';
    if (clicked && this.pauseVolumeHover) this.pressVolumeButton(this.pauseVolumeHover);
    else if (clicked && this.pauseHoverRestart) this.openRestartConfirm();
    else if (esc || (clicked && (this.pauseHoverResume || this.windowCloseHover))) this.closePauseMenu();
  }

  /**
   * Áp NGAY âm lượng nhạc nền (Tạm dừng → nhỏ còn pauseMusicVolumeMultiplier, chơi tiếp → về cũ) — gọi được từ sự kiện
   * trình duyệt (mất focus) ngoài vòng lặp game.
   */
  private applyMusicVolume(): void {
    this.tickAudio(0);
  }

  /** Âm lượng nhạc nền đang đặt (null = chưa phát). */
  private musicVolumeNow(): number | null {
    return this.audio?.musicVolumeNow() ?? null;
  }

  /**
   * Bấm nút −/+ âm lượng trong cửa sổ Tạm dừng: lưu máy ngay, nhạc to / nhỏ ngay. Tiếng "cộc" của chính cú bấm (tickAudio,
   * sau bước này) phát ở mức Hiệu ứng MỚI — nghe thử luôn.
   */
  private pressVolumeButton(id: VolumeButtonId): void {
    const { channel, dir } = volumeButtonChannel(id);
    this.audio.stepChannel(channel, dir);
    this.tickAudio(0);
  }

  /** Âm lượng kênh (0–1) — HUD vẽ "80%". */
  volumeOf(channel: AudioChannel): number {
    return this.audio?.volumeOf(channel) ?? 0;
  }

  /** Chữ âm lượng kênh ("80%"). */
  volumeText(channel: AudioChannel): string {
    return volumeLabel(this.volumeOf(channel));
  }

  // ---------------------------------------------------------------- tự lưu, nạp save, chơi lại (T-008)

  /** Gom các object trạng thái của scene thành "thế giới" cho systems/save.ts (cùng object — nạp save là sửa thẳng chúng). */
  private saveWorld(): SaveWorld {
    const c = this.feetBody?.center;
    // T-093: toạ độ trong save tính từ góc KHU (Vườn: góc bản đồ = gốc thế giới; trong nhà: góc ảnh phòng).
    const o = this.areaOrigin(this.area);
    return {
      playerName: this.playerName,
      area: this.area,
      x: (c?.x ?? o.x) - o.x,
      y: (c?.y ?? o.y) - o.y,
      facing: this.facing,
      clock: this.dayClock,
      stamina: this.stamina,
      wallet: this.wallet,
      farm: this.farm,
      inventory: this.inventory,
      sellBox: this.sellBox,
      chest: this.chest,
      seed: this.worldSeed,
      records: this.records,
      stage4: this.stage4,
    };
  }

  /** Mở game: đọc save trong localStorage; hợp lệ thì nạp vào ruộng / gùi / thùng / ví / Sức / đồng hồ + nhớ vị trí, hướng. */
  private loadFromStorage(): void {
    const r = loadLocalSave();
    this.loadStatus = r.status;
    this.loadReason = r.status === 'corrupt' ? r.reason : null;
    if (r.status !== 'ok') return;
    const applied = applySave(r.save, this.saveWorld(), SAVE_RULES);
    this.loadAddedItems = applied.addedItems;
    this.worldSeed = applied.seed;
    this.playerName = applied.playerName;
    this.loadedFoot = applied.position;
    this.loadedArea = isAreaId(applied.area) ? applied.area : 'garden';
    this.facing = applied.facing;
    this.loadedElapsed = this.dayClock.elapsedSeconds;
    this.lastSave = { day: this.dayClock.day, hour: this.clockHour, savedAt: r.save.savedAt, reason: 'loaded' };
    this.inventoryRevision++;
    this.moneyRevision++;
  }

  /**
   * Lúc này ghi save được không: chưa bị ngừng (Chơi lại), scene đã dựng xong, và KHÔNG ở giữa chuỗi đêm — từ lúc thiếp đi /
   * ngủ gục tới lúc thức dậy hẳn chỉ có MỘT lần ghi: ngay khi qua đêm xong (`afterOvernight`). Hộp hỏi "Đi ngủ?" thì vẫn lưu
   * được (thế giới chưa đổi gì; hộp không nằm trong save).
   */
  private canSave(afterOvernight: boolean): boolean {
    if (this.saveSuppressed || !this.gardenReady || !this.feetBody) return false;
    return afterOvernight || this.nightPhase === 'none' || this.nightPhase === 'sleepPrompt';
  }

  /**
   * Ghi save ngay (lý do để debug). `afterOvernight`: bản chụp ngay sau khi qua đêm — nhân vật ghi ở chỗ sẽ thức dậy (ô cạnh
   * giường, mặt hướng xuống) chứ không ở chỗ đang nằm. Trả về save đã ghi, null nếu không ghi (không được phép / lỗi kho).
   */
  saveNow(reason: string, afterOvernight = false): GameSave | null {
    this.autoSaveT = 0;
    if (!this.canSave(afterOvernight)) {
      this.saveSkipped++;
      return null;
    }
    const w = this.saveWorld();
    if (afterOvernight) {
      // T-093: sáng ra luôn đứng trong nhà cạnh giường (kể cả ngủ gục ngoài đồng).
      w.area = 'house';
      w.x = HOUSE.wakeSpot.x - HOUSE.origin.x;
      w.y = HOUSE.wakeSpot.y - HOUSE.origin.y;
      w.facing = 'down';
    }
    const save = captureSave(w, new Date());
    if (!writeLocalSave(save)) return null;
    this.saveCount++;
    this.lastSave = { day: save.clock.day, hour: clockHour(save.clock, gameConfig), savedAt: save.savedAt, reason };
    return save;
  }

  /**
   * Qua đêm (ngủ / ngủ gục) rồi GHI NGAY: F5 lúc đang xem tổng kết / đang sáng dần → vào lại là sáng hôm sau ở cạnh giường,
   * tiền thùng đã cộng đúng một lần (thùng trong save đã trống). F5 trước lúc này → vào lại bản lưu trước khi ngủ (thùng còn
   * nguyên, chưa cộng tiền). Không có bản nào "nửa nọ nửa kia" → không mất, không nhân đôi tiền.
   */
  private overnightAndSave(cause: OvernightCause): OvernightSummary {
    const summary = this.applyOvernight(cause);
    this.saveNow(`overnight-${cause}`, true);
    return summary;
  }

  /** Tự lưu theo nhịp: cộng giây thật lúc chơi bình thường, đủ autoSaveIntervalSeconds thì ghi. */
  private tickAutoSave(realDt: number): void {
    this.autoSaveT += realDt;
    if (this.autoSaveT >= this.autoSaveInterval) this.saveNow('auto');
  }

  /** Dòng trong cửa sổ Tạm dừng: giờ GAME + ngày của lần lưu gần nhất (giống đồng hồ HUD — người chơi so được). */
  get savedText(): string {
    const s = this.lastSave;
    if (!s) return 'Chưa lưu lần nào';
    return `Đã lưu lúc ${formatClock(s.hour)} · Ngày ${s.day}`;
  }

  private openRestartConfirm(): void {
    this.restartConfirmOpen = true;
    this.audio.play('uiOpen');
    this.restartConfirmHover = null;
    this.pauseHoverResume = false;
    this.pauseHoverRestart = false;
  }

  private closeRestartConfirm(): void {
    if (this.restartConfirmOpen) this.audio?.play('uiClose');
    this.restartConfirmOpen = false;
    this.restartConfirmHover = null;
  }

  /**
   * "Chơi lại từ đầu" → Có: xóa save, ngừng ghi (pagehide / tự lưu của scene cũ không ghi lại), rồi dựng lại Vườn + HUD bằng
   * INSTANCE MỚI (scene.restart dùng lại object cũ nên các trường như ruộng / gùi / ví không về Ngày 1). Làm ngoài vòng lặp
   * Phaser (setTimeout) để SceneManager thực hiện ngay, đúng thứ tự: dừng HUD → dừng Vườn (gỡ mọi listener qua SHUTDOWN) →
   * bỏ cả hai → thêm lại (Vườn trước để HUD vẽ đè lên) → chạy Vườn (Vườn tự bật HUD như lần đầu).
   */
  private restartFresh(): void {
    clearLocalSave();
    this.saveSuppressed = true;
    this.closeRestartConfirm();
    this.registry.set('gardenReady', false);
    const game = this.game;
    const GardenCls = this.constructor as new () => Phaser.Scene;
    const HudCls = game.scene.getScene('GardenHud').constructor as new () => Phaser.Scene;
    window.setTimeout(() => {
      const mgr = game.scene;
      mgr.stop('GardenHud');
      mgr.stop('Garden');
      mgr.remove('GardenHud');
      mgr.remove('Garden');
      mgr.add('Garden', GardenCls, false);
      mgr.add('GardenHud', HudCls, false);
      mgr.start('Garden');
    }, 0);
  }

  // ---------------------------------------------------------------- cảnh trong nhà + chuyển khu (T-093)

  /**
   * Dựng phòng trong nhà (một lần, lúc vào Vườn): ảnh nền phòng đặt dưới bản đồ Vườn, đồ đạc theo data/houseLayout.json
   * (ảnh + hộp va chạm chân đế, depth = đáy ảnh như đồ vật Vườn), bảng tên, than + khói bếp rơm. Trả về hộp va chạm đồ đạc.
   * Tường không cần hộp: lúc ở trong nhà, giới hạn vật lý = sàn phòng (applyAreaView).
   */
  private buildHouse(): Phaser.GameObjects.Zone[] {
    const solids: Phaser.GameObjects.Zone[] = [];
    if (this.textures.exists(HOUSE_INTERIOR_KEY)) {
      this.add.image(HOUSE.origin.x, HOUSE.origin.y, HOUSE_INTERIOR_KEY).setOrigin(0).setDepth(DEPTH_GROUND);
    } else {
      // Ảnh nền tải lỗi → vách nâu + sàn gỗ vẽ bằng code, game vẫn chạy (như T-021 / T-024).
      console.warn(`[Garden] Thiếu ảnh ${HOUSE_INTERIOR_KEY} — vẽ tạm bằng code`);
      this.propFallbacks.push(HOUSE_INTERIOR_KEY);
      const b = HOUSE.bounds;
      const f = HOUSE.floor;
      this.add.rectangle(b.x, b.y, b.w, b.h, palette.earth).setOrigin(0).setDepth(DEPTH_GROUND);
      this.add.rectangle(f.x, f.y, f.w, f.h, palette.wood).setOrigin(0).setDepth(DEPTH_GROUND + 1);
    }
    for (const o of HOUSE.objects) {
      this.ensurePropTexture(o.prop);
      const img = this.add.image(o.x, o.y, o.prop).setOrigin(o.originX, o.originY).setDepth(o.depth);
      if (o.foot) {
        const z = this.add.zone(o.foot.x + o.foot.w / 2, o.foot.y + o.foot.h / 2, o.foot.w, o.foot.h);
        this.physics.add.existing(z, true);
        solids.push(z);
      }
      if (o.label) {
        this.add
          .text(img.x, o.image.y - 4, o.label, { ...textStyles.nameTag, fontSize: '17px', strokeThickness: 5 })
          .setOrigin(0.5, 1)
          .setResolution(2)
          .setDepth(o.depth + 1);
      }
    }
    // Bếp rơm (chưa nấu được — T-048) vẫn có than hồng + khói lững lờ cho phòng ấm cúng. Điểm lửa đo trên ảnh (props.json `fire`).
    const stove = houseObject(HOUSE, 'stove');
    const fire = propMarker(stove.prop, 'fire') ?? [stove.image.w / 2, stove.image.h * 0.75];
    this.stoveFire = { x: stove.image.x + fire[0], y: stove.image.y + fire[1] };
    for (let i = 0; i < gameConfig.stoveEmberCount; i++) {
      const dx = (i - (gameConfig.stoveEmberCount - 1) / 2) * 8;
      this.stoveEmbers.push(
        this.add
          .circle(this.stoveFire.x + dx, this.stoveFire.y - (i % 2) * 4, 4, i % 2 ? palette.gold : palette.vermilion, 1)
          .setDepth(stove.depth + 0.5),
      );
    }
    for (let i = 0; i < gameConfig.stoveSmokeCount; i++) {
      this.stoveSmoke.push(this.add.circle(this.stoveFire.x, this.stoveFire.y, 9, palette.paper, 1).setAlpha(0).setDepth(stove.depth + 1));
      this.stoveSmokeAge.push((i / gameConfig.stoveSmokeCount) * gameConfig.stoveSmokeLifeSeconds);
    }
    return solids;
  }

  /** Than nhấp nháy + khói bốc lên mờ dần (pool có sẵn, chỉ đổi vị trí / độ đục — không tạo object mỗi frame). */
  private updateStove(dt: number): void {
    this.stoveT += dt;
    const rate = gameConfig.stoveFlickerRate;
    for (let i = 0; i < this.stoveEmbers.length; i++) {
      const a = 0.6 + 0.4 * Math.sin(this.stoveT * rate + i * 2.1) * Math.sin(this.stoveT * rate * 0.37 + i);
      this.stoveEmbers[i].setAlpha(a).setScale(0.8 + 0.35 * a);
    }
    const life = gameConfig.stoveSmokeLifeSeconds;
    for (let i = 0; i < this.stoveSmoke.length; i++) {
      this.stoveSmokeAge[i] = (this.stoveSmokeAge[i] + dt) % life;
      const p = this.stoveSmokeAge[i] / life; // 0 → 1
      this.stoveSmoke[i]
        .setPosition(this.stoveFire.x + Math.sin(p * Math.PI * 2 + i * 1.7) * 6, this.stoveFire.y - 12 - p * gameConfig.stoveSmokeRisePx)
        .setAlpha(0.32 * Math.min(1, p * 5) * (1 - p))
        .setScale(0.6 + p * 1.3);
    }
  }

  /** Màn mờ chuyển khu: hình cỡ màn, không cuộn theo camera (như lớp trời — zoom quanh tâm vẫn phủ kín). */
  private buildAreaFade(): void {
    this.areaFadeRect = this.add
      .rectangle(0, 0, gameConfig.gameWidth, gameConfig.gameHeight, palette.ink, 1)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(DEPTH_AREA_FADE)
      .setAlpha(0)
      .setVisible(false);
  }

  /** Góc trên-trái của khu trong thế giới (toạ độ save tính từ đây). */
  private areaOrigin(area: AreaId): { x: number; y: number } {
    return area === 'house' ? HOUSE.origin : { x: 0, y: 0 };
  }

  /**
   * Camera + vật lý theo khu đang đứng: Vườn = cả bản đồ (camera bám theo); trong nhà = camera khoá đúng ảnh phòng (1280×720 ở
   * zoom 1,5 vừa khít màn → đứng yên), chân chỉ đi trong sàn (giới hạn vật lý = tường), nền tối ngoài tường.
   */
  private applyAreaView(): void {
    const cam = this.cameras.main;
    this.applyWorldBounds();
    if (this.area === 'house') {
      const b = HOUSE.bounds;
      cam.setBounds(b.x, b.y, b.w, b.h);
      cam.setBackgroundColor(gameConfig.houseBackdropColor);
    } else {
      cam.setBounds(0, 0, L.cols * T, L.rows * T);
      cam.setBackgroundColor(palette.jade);
    }
    const c = this.feetBody.center;
    cam.centerOn(c.x, c.y);
    this.hideHighlight();
    this.houseHover = null;
    this.updateSky();
  }

  /** Giới hạn vật lý (chân không ra ngoài) theo khu: Vườn = cả bản đồ; trong nhà = sàn phòng (tường). */
  private applyWorldBounds(): void {
    const f = HOUSE.floor;
    if (this.area === 'house') this.physics.world.setBounds(f.x, f.y, f.w, f.h);
    else this.physics.world.setBounds(0, 0, L.cols * T, L.rows * T);
  }

  /** Bấm đi vào cửa (đang ở Vườn) / ra khe cửa (đang trong nhà) → bắt đầu chuyển khu. */
  private checkDoors(dirY: number): void {
    const b = this.feetBody;
    if (this.area === 'garden') {
      if (shouldEnterHouse(L.houseDoor, T, b, dirY, gameConfig.doorTouchPx)) this.beginAreaChange('house', HOUSE.spawn, 'up');
    } else if (shouldExitHouse(HOUSE, b, dirY, gameConfig.doorTouchPx)) {
      this.beginAreaChange('garden', houseExitSpot(L.houseDoor, T), 'down');
    }
  }

  /**
   * Chuyển khu DÙNG CHUNG (T-054 cổng Núi / làng Sung gọi lại): việc dở trên ô dừng (như lúc ngủ), đóng cửa sổ, nhân vật đứng
   * yên, đồng hồ dừng (lý do 'areaFade'), màn tối dần → swapArea (dời người, đổi camera, tên khu, tự lưu) → sáng dần.
   * `spawn` = chỗ đứng (px thế giới, giữa hộp chân) ở khu mới.
   */
  private beginAreaChange(to: AreaId, spawn: { x: number; y: number }, facing: Facing): void {
    if (!startAreaTransition(this.areaTransition, to, spawn, facing)) return;
    // T-026: cửa nhà kẹt + bước chân (AUD-SFX-115) — vào / ra là 2 tiếng khác nhau.
    if (to === 'house') this.audio.play('doorIn');
    else if (this.area === 'house') this.audio.play('doorOut');
    this.stopWorkForNight();
    cancelClickMove(this.clickMove);
    this.hideClickMarker();
    if (this.bagOpen) this.setBagOpen(false, false);
    this.closeShop(false);
    this.pauseReasons.set('areaFade', true);
    this.feetBody.setVelocity(0, 0);
    if (this.hero.anims.isPlaying) this.hero.anims.stop();
    clearWalkBob(this.walk);
    this.showStill(heroTextureKey(1, this.facing));
    this.hero.setScale(1);
    this.hideHighlight();
    this.hover.valid = false;
    this.houseHover = null;
    this.controls.clearPending();
  }

  /** Mỗi frame lúc chuyển khu: tiến màn mờ; tối hẳn → đổi khu; sáng hẳn → chơi tiếp. */
  private updateAreaTransition(dt: number): void {
    this.feetBody.setVelocity(0, 0);
    const ev = stepAreaTransition(this.areaTransition, dt, gameConfig.areaFadeSeconds);
    if (ev === 'swap') this.swapArea();
    else if (ev === 'done') this.pauseReasons.set('areaFade', false);
    const a = transitionAlpha(this.areaTransition, gameConfig.areaFadeSeconds);
    this.areaFadeRect.setAlpha(a).setVisible(a > 0.001);
    this.updateDust(dt);
    this.updateBubble(dt);
    this.updateFloats(dt);
  }

  /** Lúc màn tối hẳn: dời nhân vật sang khu mới, camera / vật lý theo khu, hiện tên khu, tự lưu (F5 lúc này vào lại khu mới). */
  private swapArea(): void {
    const s = this.areaTransition;
    const to = s.to ?? 'garden';
    const spawn = s.spawn ?? (to === 'house' ? HOUSE.spawn : houseExitSpot(L.houseDoor, T));
    if (to === 'house') this.areaEnters++;
    else if (this.area === 'house') this.areaExits++;
    this.area = to;
    this.placeHero(spawn.x, spawn.y, s.facing ?? 'down');
    this.applyAreaView();
    this.areaBannerT = 0;
    this.areaBannerText = areaName(to, this.playerName);
    this.saveNow('area');
  }

  /** Độ đậm tên khu lúc này (HUD đọc): hiện đậm areaBannerHoldSeconds rồi mờ dần; 0 = không hiện. */
  get areaBannerOpacity(): number {
    if (this.areaBannerT < 0) return 0;
    return areaBannerAlpha(this.areaBannerT, gameConfig.areaBannerHoldSeconds, gameConfig.areaBannerFadeSeconds);
  }

  /**
   * Con trỏ trong nhà: trên giường / rương / bếp / hũ gạo / nón → viền cả hình (sáng trong tầm, xám ngoài tầm); click trong tầm
   * = tương tác như phím F. Sàn nhà không có việc gì (không cuốc, không gieo).
   */
  private updateHousePointer(pressed: boolean, inside: boolean, px: number, py: number, dt: number): void {
    if (pressed) {
      this.dragKind = null;
      this.dragBlocked = true;
    }
    const t = inside ? houseTargetAt(HOUSE, px, py) : null;
    const c = this.feetBody.center;
    if (!t) {
      this.houseHover = null;
      // T-096: khung cửa → viền cửa; click = đi ra giữa khe cửa rồi ra Vườn.
      if (inside && isHouseDoorAt(HOUSE, px, py)) {
        const spot = houseExitStandSpot(HOUSE, gameConfig.playerFootHitbox[1], gameConfig.pathClearancePx);
        const near = Math.hypot(spot.x - c.x, spot.y - c.y) <= gameConfig.interactRange * T;
        const d = HOUSE.doorRect;
        this.drawHighlightBox(OBJECT_HIGHLIGHT_KEY + 9, { x: d.x / T, y: d.y / T, w: d.w / T, h: d.h / T }, near, dt, 0, 0, d.y + d.h + 2);
        if (pressed) this.planAndGo({ kind: 'point', x: spot.x, y: spot.y }, { kind: 'door', to: 'garden' }, { x: px, y: py });
        return;
      }
      this.hideHighlight();
      // T-096: sàn / tường trống → đi tới đó (tường thì tới chỗ sàn gần nhất).
      if (pressed && inside) this.planAndGo({ kind: 'point', x: px, y: py }, null, { x: px, y: py });
      return;
    }
    const inReachNow = houseTargetInReach(HOUSE, t, c.x, c.y, HOUSE_CLICK_RANGE_PX);
    this.houseHover = { target: t, inReach: inReachNow };
    const o = houseObject(HOUSE, t);
    const box: TileRect = { x: o.image.x / T, y: o.image.y / T, w: o.image.w / T, h: o.image.h / T };
    this.drawHighlightBox(OBJECT_HIGHLIGHT_KEY + 10 + HOUSE.objects.indexOf(o), box, inReachNow, dt, 0, 0, o.depth + 2);
    if (!pressed) return;
    if (inReachNow) {
      this.cancelWalk();
      this.interactHouse(t);
    } else {
      // T-096: ngoài tầm → đi tới chỗ đứng gần nhất với tới vật rồi dùng luôn.
      const range = HOUSE_CLICK_RANGE_PX - gameConfig.clickMoveReachMargin * T;
      this.planAndGo({ kind: 'reach', canWorkFrom: (x, y) => houseTargetInReach(HOUSE, t, x, y, range) }, { kind: 'houseObject', target: t }, { x: px, y: py });
    }
  }

  // ---------------------------------------------------------------- click đâu đi đó (T-096, D-038)

  /** Lưới tìm đường: Vườn = lưới vật cản (cây tính cả ô — đường đi né cả tán gốc); trong nhà = ô nhỏ theo sàn + đồ đạc. */
  private buildNavGrids(): void {
    const [fw, fh] = gameConfig.playerFootHitbox;
    const m = gameConfig.pathClearancePx;
    this.gardenNav = navFromBoolGrid(blockedGrid(L), T);
    this.houseNav = houseNavGrid(HOUSE, gameConfig.houseNavCellPx, fw + 2 * m, fh + 2 * m);
  }

  /** Dấu đích: vòng tròn mực + vòng giấy + chấm giữa, vẽ một lần; mỗi click chỉ dời chỗ + cho mờ dần. */
  private buildClickMarker(): void {
    const r = gameConfig.clickMoveMarkerRadius;
    this.clickMarker = this.add
      .graphics()
      .lineStyle(7, palette.ink, 0.7)
      .strokeCircle(0, 0, r)
      .lineStyle(3, palette.paper, 1)
      .strokeCircle(0, 0, r)
      .fillStyle(palette.paper, 1)
      .fillCircle(0, 0, r * 0.25)
      .setDepth(DEPTH_TILE_HIGHLIGHT + 3)
      .setVisible(false);
  }

  private showClickMarker(x: number, y: number): void {
    this.clickMarkerT = gameConfig.clickMoveMarkerSeconds;
    this.clickMarker.setPosition(x, y).setAlpha(1).setScale(1).setVisible(true);
  }

  private hideClickMarker(): void {
    this.clickMarkerT = 0;
    this.clickMarker?.setVisible(false);
  }

  private updateClickMarker(dt: number): void {
    if (this.clickMarkerT <= 0) return;
    this.clickMarkerT -= dt;
    if (this.clickMarkerT <= 0) {
      this.hideClickMarker();
      return;
    }
    const p = 1 - this.clickMarkerT / gameConfig.clickMoveMarkerSeconds; // 0 → 1
    this.clickMarker.setAlpha(1 - p * p).setScale(1 - 0.4 * p);
  }

  /** Hộp chân (nới `pathClearancePx`) đặt giữa (x, y) có chạm vật cản không — theo khu đang đứng. */
  private readonly spotFree = (x: number, y: number): boolean => {
    const [fw, fh] = gameConfig.playerFootHitbox;
    const m = gameConfig.pathClearancePx;
    if (this.area === 'house') return isFreeHouseSpot(HOUSE, x, y, fw + 2 * m, fh + 2 * m);
    return boxFitsGrid(this.gardenNav, x, y, fw / 2 + m, fh / 2 + m);
  };

  /**
   * Lập đường tới `goal` rồi bắt đầu đi (việc `action` làm khi tới nơi / tới tầm với). Đã ở đúng chỗ → làm luôn.
   * Không có đường → bong bóng "Đường đâu mà đi?", không đi. Trả về true nếu đi / làm được.
   */
  private planAndGo(goal: WalkGoal, action: ClickAction | null, markerAt: { x: number; y: number } | null): boolean {
    const nav = this.area === 'house' ? this.houseNav : this.gardenNav;
    const c = this.feetBody.center;
    const t0 = performance.now();
    const res = planWalk(this.pathFinder, nav, { x: c.x, y: c.y }, goal, {
      maxNodes: gameConfig.pathMaxNodes,
      spotFree: this.spotFree,
      stepPx: gameConfig.pathSmoothStepPx,
      // Bán kính tính theo ô 64 px; lưới trong nhà ô nhỏ hơn → nhiều ô hơn.
      blockedSearchRadius: Math.ceil((gameConfig.clickMoveBlockedSearchRadius * T) / nav.cell),
    });
    this.clickStats.lastPlanMs = performance.now() - t0;
    this.clickStats.lastExpanded = res.expanded;
    cancelClickMove(this.clickMove);
    if (!res.ok) {
      this.clickStats.noPath++;
      this.showBubble(bubbles.noPath);
      this.audio.play('uiError');
      return false;
    }
    if (markerAt) this.showClickMarker(markerAt.x, markerAt.y);
    if (res.already) {
      if (action) this.runClickAction(action);
      return true;
    }
    // Đi = bỏ dở cuốc (như bấm WASD — D-022).
    if (this.isTilling()) this.abandonTill();
    this.clickGoal = goal;
    this.clickReplans = 0;
    startClickMove(this.clickMove, res.waypoints, action);
    this.clickStats.starts++;
    return true;
  }

  /** Thôi đi theo click (WASD, click mới, cửa sổ mở). */
  private cancelWalk(): void {
    if (cancelClickMove(this.clickMove)) this.clickStats.cancels++;
    this.clickGoal = null;
  }

  /** Việc chờ đã với tới từ (x, y) chưa — dùng ĐÚNG luật click thường (interactRange), không trừ lề. Cửa: phải tới nơi. */
  private clickActionInReach(a: ClickAction, x: number, y: number): boolean {
    switch (a.kind) {
      case 'tile':
        // T-096b: việc ruộng phải tới đúng chỗ đứng sát đã chọn (không dừng giữa đường ở tầm 2,5).
        return false;
      case 'gardenObject':
        return targetInReach(L, a.target, x, y, T, gameConfig.interactRange);
      case 'houseObject':
        return houseTargetInReach(HOUSE, a.target, x, y, HOUSE_CLICK_RANGE_PX);
      case 'door':
        return false;
    }
  }

  /** Mỗi frame đi theo đường: trả về vận tốc (dùng lại một object). Với tới việc chờ / tới nơi → dừng, làm luôn. */
  private followClickPath(dt: number, speed: number): { x: number; y: number } {
    const c = this.feetBody.center;
    const v = this.pathVel;
    const a = this.clickMove.action;
    if (a && this.clickActionInReach(a, c.x, c.y)) {
      this.arriveClick();
      v.x = 0;
      v.y = 0;
      return v;
    }
    const params: ClickMoveParams = { speed, arrivePx: gameConfig.clickMoveArrivePx, stuckSeconds: gameConfig.clickMoveStuckSeconds };
    const st = stepClickMove(this.clickMove, c, dt, params, v);
    if (st === 'arrived') {
      this.arriveClick();
    } else if (st === 'stuck') {
      // Bị vật lý chặn (gốc cây, góc nhà…) → lập lại đường từ chỗ đang đứng; quá số lần thì thôi.
      const goal = this.clickGoal;
      const action = this.clickMove.action;
      v.x = 0;
      v.y = 0;
      if (action?.kind === 'tile') {
        // Đi tới ô đầu hàng chờ mà kẹt → thôi; driveTileQueue lập lại đường (quá số lần thì bỏ ô đó).
        this.farmStuck++;
        this.clickStats.replans++;
        this.cancelWalk();
      } else if (goal && this.clickReplans < gameConfig.clickMoveMaxReplans) {
        const replans = this.clickReplans + 1;
        this.clickStats.replans++;
        if (this.planAndGo(goal, action, null)) this.clickReplans = replans;
      } else {
        this.cancelWalk();
      }
    }
    return v;
  }

  /**
   * T-096b: ô đầu hàng chờ việc ruộng mà chưa đứng sát (`farmWorkRange`) → chọn chỗ đứng cạnh ô (planFarmStand: ô kề gần nhất,
   * ưu tiên phía nam, không giẫm luống) rồi đi tới; tới nơi thì updateTileAction tự bắt đầu. Rê cả luống = bước dọc luống.
   */
  private driveTileQueue(): void {
    if (this.area !== 'garden' || isBusy(this.action) || this.action.queue.length === 0) return;
    const head = this.action.queue[0];
    const c = this.feetBody.center;
    if (inFarmWorkRange(c.x, c.y, head.x, head.y, T, gameConfig.farmWorkRange)) return;
    const a = this.clickMove.action;
    if (this.clickMove.active && a?.kind === 'tile' && a.x === head.x && a.y === head.y) return;
    const job = this.action.kind as TileJob | null;
    if (job === null || jobFor(this.farm, head.x, head.y, growDaysOf) !== job) return; // updateTileAction tự bỏ ô này
    const dropHead = () => {
      this.action.queue.shift();
      if (this.action.queue.length === 0) this.action.kind = null;
      this.farmStuck = 0;
    };
    if (this.farmStuck > gameConfig.clickMoveMaxReplans) {
      dropHead();
      return;
    }
    const t0 = performance.now();
    const res = planFarmStand(
      this.pathFinder,
      this.gardenNav,
      { x: c.x, y: c.y },
      head,
      {
        maxNodes: gameConfig.pathMaxNodes,
        spotFree: this.spotFree,
        stepPx: gameConfig.pathSmoothStepPx,
        blockedSearchRadius: gameConfig.clickMoveBlockedSearchRadius,
      },
      {
        isPlot: (x, y) => plotAt(this.farm, x, y) !== null,
        diagonalPenalty: gameConfig.farmStandDiagonalPenalty,
        onPlotPenalty: gameConfig.farmStandOnPlotPenalty,
        notSouthPenalty: gameConfig.farmStandNotSouthPenalty,
        diagonalInset: gameConfig.farmStandDiagonalInset,
      },
    );
    this.clickStats.lastPlanMs = performance.now() - t0;
    this.clickStats.lastExpanded = res.expanded;
    cancelClickMove(this.clickMove);
    if (!res.ok) {
      this.clickStats.noPath++;
      this.showBubble(bubbles.noPath);
      this.audio.play('uiError');
      dropHead();
      return;
    }
    // Đứng đúng ô kề rồi nhưng lệch tâm (vd canStart sai vì đứng trên chính ô) — đi nốt vào tâm ô kề.
    const waypoints = res.already ? (res.spot ? [res.spot] : []) : res.waypoints;
    if (waypoints.length === 0) return;
    this.clickGoal = null;
    startClickMove(this.clickMove, waypoints, { kind: 'tile', x: head.x, y: head.y, job });
    this.clickStats.starts++;
  }

  /** Tới nơi: dừng, làm việc chờ (nếu có). */
  private arriveClick(): void {
    const a = this.clickMove.action;
    cancelClickMove(this.clickMove);
    this.clickGoal = null;
    this.clickStats.arrivals++;
    this.feetBody.setVelocity(0, 0);
    if (a) this.runClickAction(a);
  }

  /** Quay mặt về điểm (px) — dùng chung khung xoay chéo như khi đi. */
  private faceTowardPoint(px: number, py: number): void {
    const c = this.feetBody.center;
    const to = facingFromVector(px - c.x, py - c.y, this.facing, 1);
    if (to === this.facing) return;
    startTurn(this.turn, this.facing, to, this.lastDirX, TURN_FRAME_SEC);
    this.facing = to;
  }

  /** Làm việc chờ khi tới nơi — kiểm lại như click thường (ô có thể đã đổi việc, hết hạt… → bong bóng như thường). */
  private runClickAction(a: ClickAction): void {
    this.clickStats.actionsDone++;
    this.clickStats.lastAction = a.kind;
    switch (a.kind) {
      case 'tile': {
        // T-096b: ô đã nằm trong hàng chờ (đi tới là do driveTileQueue) → updateTileAction tự bắt đầu khi đứng sát.
        if (isPending(this.action, a)) return;
        if (jobFor(this.farm, a.x, a.y, growDaysOf) !== a.job) return;
        if (a.job === 'till') {
          if (!canTillWithSelected(this.inventory)) {
            this.noHoePrompts++;
            this.showBubble(bubbles.noHoe);
            this.audio.play('uiError');
            return;
          }
          if (!isBusy(this.action) && !this.hasStaminaFor('till', true)) return;
          requestTile(this.action, a, this.tillParams, 'till');
          return;
        }
        this.requestFastJob(a, a.job);
        return;
      }
      case 'gardenObject': {
        const r = L[a.target];
        this.faceTowardPoint((r.x + r.w / 2) * T, (r.y + r.h / 2) * T);
        this.interactGarden(a.target);
        return;
      }
      case 'houseObject': {
        const r = houseObject(HOUSE, a.target).reach;
        this.faceTowardPoint(r.x + r.w / 2, r.y + r.h / 2);
        this.interactHouse(a.target);
        return;
      }
      case 'door':
        if (a.to === 'house') this.beginAreaChange('house', HOUSE.spawn, 'up');
        else this.beginAreaChange('garden', houseExitSpot(L.houseDoor, T), 'down');
        return;
    }
  }

  // ---------------------------------------------------------------- bảng Thử (T-041, chỉ bản dev)

  /**
   * Mở bảng Thử (F2 / `): chỉ lúc chơi bình thường (không giữa chuỗi đêm / chuyển khu / Tạm dừng). Đóng gùi / cửa sổ đang
   * mở, thế giới đứng yên như Tạm dừng (lý do dừng 'cheatPanel', vật lý + anim dừng), bỏ mọi phím bấm dở.
   */
  private openCheatPanel(): void {
    if (!gameConfig.devCheatsEnabled || this.cheatPanelOpen || this.pauseMenuOpen) return;
    if (this.nightPhase !== 'none' || isTransitioning(this.areaTransition)) return;
    if (this.bagOpen) this.setBagOpen(false, false);
    this.closeShop(false);
    this.cheatPanelOpen = true;
    this.cheatHover = -1;
    this.windowCloseHover = false;
    this.pauseReasons.set('cheatPanel', true);
    this.feetBody.setVelocity(0, 0);
    this.physics.world.pause();
    this.hero.anims.pause();
    this.hideHighlight();
    this.controls.clearPending();
    this.audio.play('uiOpen');
  }

  private closeCheatPanel(): void {
    if (!this.cheatPanelOpen) return;
    this.cheatPanelOpen = false;
    this.cheatHover = -1;
    this.windowCloseHover = false;
    this.pauseReasons.set('cheatPanel', false);
    // Mất focus lúc bảng mở → Tạm dừng nằm trên; đóng bảng sau đó không được cho thế giới chạy lại dưới Tạm dừng.
    if (!this.pauseMenuOpen) {
      this.physics.world.resume();
      this.hero.anims.resume();
    }
    this.dragKind = null;
    this.dragBlocked = true; // chuột còn giữ sau khi bấm nút → không tính là click xuống ruộng
    this.controls.clearPending();
    this.audio.play('uiClose');
  }

  /** Mỗi frame lúc bảng mở: Esc / F2 / nút X / click ra ngoài khung = đóng; click nút = làm việc của nút. Phím khác bị bỏ. */
  private updateCheatPanel(): void {
    const c = this.controls;
    const sp = c.pointerScreen(this.pointerScreenPt);
    const inside = c.isPointerInside();
    const closeKey = c.consumePressed('menu') || c.consumePressed('devCheatPanel');
    const clicked = c.consumePrimaryPress();
    c.clearPending();
    const panel = cheatPanelRect(CHEAT_ROWS.length);
    this.cheatHover = inside ? cheatButtonAt(sp.x, sp.y, CHEAT_SLOTS) : -1;
    this.windowCloseHover = inside && rectContains(windowCloseRect(panel), sp.x, sp.y);
    if (closeKey || (clicked && (this.windowCloseHover || !rectContains(panel, sp.x, sp.y)))) {
      this.closeCheatPanel();
      return;
    }
    if (clicked && this.cheatHover >= 0) this.runCheat(this.cheatHover);
  }

  /** Trạng thái bảng Thử cho systems/cheats.ts — object THẬT của scene (nút sửa thẳng). */
  private cheatState(): CheatState {
    return { stage4: this.stage4, wallet: this.wallet, inventory: this.inventory, day: this.dayClock.day, picker: this.cheatPicker };
  }

  /**
   * Làm việc của nút thứ `i` (chỉ số trong CHEAT_BUTTONS). Việc cần scene dùng lại đúng hàm của game: qua đêm = như phím G
   * (applyOvernight 'devG' + gà gáy), đi tới khu = chuyển khu có màn mờ (đóng bảng trước). Xong thì lưu ngay — F5 vẫn còn.
   * Trả về dòng báo.
   */
  private runCheat(i: number): string {
    const btn = CHEAT_BUTTONS[i];
    if (!btn) return '';
    const r = applyCheat(btn.action, this.cheatState(), CHEAT_RULES);
    this.cheatUses++;
    this.lastCheatButton = btn.label;
    this.cheatNotice = r.message;
    if (r.syncMoney) {
      // BUG-018: ví vừa bị ghi thẳng → bỏ xu bán hàng còn bay + tiền chờ bay (đã nằm trong ví) cho ô tiền khớp ví ngay.
      dropIncomingCoins(this.coins);
      this.pendingPayout = 0;
    }
    if (r.moneyDelta !== 0) this.onMoneyChanged(r.moneyDelta);
    if (r.inventoryChanged) this.inventoryRevision++;
    const task = r.task;
    if (task?.kind === 'overnight') {
      let summary: OvernightSummary | null = null;
      for (let n = 0; n < task.nights; n++) summary = this.applyOvernight('devG');
      if (summary) this.greetMorning(summary);
      this.cheatNotice = `${r.message} — giờ là ${dayLabel(this.dayClock.day, gameConfig.daysPerSeason)}`;
    } else if (task?.kind === 'setHour') {
      setGameHour(this.dayClock, task.hour, gameConfig);
      this.updateSky();
    } else if (task?.kind === 'gotoArea') {
      if (task.area === this.area) {
        this.cheatNotice = 'Đang ở khu này rồi';
      } else {
        this.closeCheatPanel();
        const to = this.areaSpawn(task.area);
        this.beginAreaChange(task.area, to.spot, to.facing); // chuyển khu tự lưu lúc đổi khu (swapArea)
        return this.cheatNotice;
      }
    }
    this.saveNow('cheat');
    return this.cheatNotice;
  }

  /** Chỗ đứng + hướng mặt khi tới một khu bằng bảng Thử (khu mới T-054 thêm nhánh ở đây). */
  private areaSpawn(area: AreaId): { spot: { x: number; y: number }; facing: Facing } {
    if (area === 'house') return { spot: HOUSE.spawn, facing: 'up' };
    return { spot: houseExitSpot(L.houseDoor, T), facing: 'down' };
  }

  /** Thứ HUD cần để vẽ bảng Thử (chỉ tính chữ nút khi bảng mở). */
  get cheatPanelModel(): CheatPanelModel {
    if (!this.cheatPanelOpen) return { open: false, hover: -1, closeHover: false, pointerDown: false, labels: [], status: '', notice: '' };
    return {
      open: true,
      hover: this.cheatHover,
      closeHover: this.windowCloseHover,
      pointerDown: this.primaryDown,
      labels: this.cheatLabels(),
      status: this.cheatStatus(),
      notice: this.cheatNotice,
    };
  }

  private cheatLabels(): string[] {
    const id = pickedItem(this.cheatState(), CHEAT_RULES);
    const view = { itemName: id ? CHEAT_RULES.itemName(id) : '—', flags: this.stage4.flags };
    return CHEAT_BUTTONS.map((b) => cheatButtonLabel(b, view));
  }

  private cheatStatus(): string {
    return cheatStatusLine({ stage4: this.stage4, money: this.wallet.money, day: this.dayClock.day, daysPerSeason: gameConfig.daysPerSeason });
  }

  // ---------------------------------------------------------------- QA

  get debugState(): GardenDebugState {
    const body = this.feetBody;
    const cam = this.cameras.main;
    const fx = body?.center.x ?? 0;
    const fy = body?.center.y ?? 0;
    const tile = tileOf(fx, fy, T);
    return {
      gardenReady: this.gardenReady,
      tileX: tile.x,
      tileY: tile.y,
      footX: fx,
      footY: fy,
      moving: this.walk.moving,
      facing: this.facing,
      bobOffset: this.walk.pose.offsetY,
      steps: this.walk.stepCount,
      textureKey: this.hero?.texture.key ?? '',
      anim: {
        key: this.hero?.anims.currentAnim?.key ?? null,
        // Khung đang HIỆN trên sprite (kể cả khi anim dừng để hiện khung xoay); ảnh đứng = -1.
        frame: this.hero && this.hero.frame.name !== '__BASE' ? Number(this.hero.frame.name) : -1,
        playing: this.hero?.anims.isPlaying ?? false,
        timeScale: this.hero?.anims.timeScale ?? 0,
      },
      turnFrame: this.turn.frame,
      hoeFrame: this.hoeFrame,
      actionAnim: { anim: this.actionAnimShown, frame: this.actionFrame, lastHarvestFrom: this.lastHarvestFrom },
      props: {
        house: { ...L.house },
        houseDoor: { ...L.houseDoor },
        houseDoorPoint: { ...L.houseDoorPoint },
        seedStallFoot: { ...L.seedStallFoot },
        sellerSpot: { ...L.sellerSpot },
        sellBasket: this.sellBasketShown,
        stakesVisible: this.stakes.some((s) => s.visible),
        canopyAlpha: this.canopies.map((c) => c.alpha),
        fallbacks: [...this.propFallbacks],
      },
      heroOriginY: this.hero?.originY ?? 1,
      view: { x: cam.worldView.x, y: cam.worldView.y, w: cam.worldView.width, h: cam.worldView.height },
      zoom: cam.zoom,
      mapPx: { w: L.cols * T, h: L.rows * T },
      farm: { plots: this.farm.plots.map((p) => ({ ...p, crop: p.crop ? { ...p.crop } : null })), tilled: tilledCount(this.farm) },
      hover: this.hover.valid
        ? {
            x: this.hover.x,
            y: this.hover.y,
            inReach: this.hover.inReach,
            tillable: this.hover.tillable,
            job: this.hover.job,
            highlight: this.hover.inReach ? 'bright' : 'gray',
            alpha: this.hover.inReach ? this.highlight.alpha : this.highlightDash.alpha,
            object: this.hover.object,
          }
        : null,
      action: {
        busy: isBusy(this.action),
        current: this.action.current ? { ...this.action.current } : null,
        progress: this.action.current ? this.action.elapsed / this.paramsFor(this.action.kind).duration : 0,
        queued: this.action.queue.length,
        queue: this.action.queue.map((q) => ({ x: q.x, y: q.y })),
        strikesLeft: this.action.strikesLeft,
        strikesDone: this.action.strikesDone,
        dragKind: this.dragKind,
        kind: this.action.kind as TileJob | null,
      },
      crops: this.farm.plots.flatMap((p) => {
        const c = p.crop;
        if (!c) return [];
        const stage = cropStage(c, growDaysOf);
        const visual = this.cropVisualOf(c, stage);
        return [
          {
            x: p.x,
            y: p.y,
            cropId: c.cropId,
            age: c.age,
            dryDays: c.dryDays,
            watered: p.watered,
            ripe: isRipe(c, growDaysOf),
            withered: c.withered,
            thirsty: stage !== 'withered' && c.dryDays > 0 && !p.watered,
            stage,
            sprite: visual.sheet,
            frame: visual.frame,
          },
        ];
      }),
      ground: {
        plotLooks: this.farm.plots.map((_, i) => SOIL_TEXTURES[this.plotLook[i]] ?? 'none'),
        ridgeMasks: this.farm.plots.map((p) => this.ridgeLayer?.getTileAt(p.x, p.y)?.index ?? -1).map((idx) =>
          idx < 0 ? 0 : idx - (this.tileGid['soil-tilled-edge'] ?? 0),
        ),
        fallbacks: [...this.tileFallbacks],
      },
      inventory: {
        slots: this.inventory.slots.map((st) => (st ? { id: st.id, count: st.count, name: itemInfo(st.id)?.name ?? st.id } : null)),
        selected: this.inventory.selected,
        selectedItem: this.inventory.slots[this.inventory.selected]?.id ?? null,
        heldToolUse: selectedToolUse(this.inventory),
        noHoePrompts: this.noHoePrompts,
        lastSeedId: this.inventory.lastSeedId,
        hotbarSize: this.inventory.hotbarSize,
        stackMax: this.inventory.stackMax,
        revision: this.inventoryRevision,
      },
      bagOpen: this.bagOpen,
      bagHoverSlot: this.bagHoverSlot,
      bubble: {
        visible: this.bubbleT > 0,
        text: this.bubbleText?.text ?? '',
        shows: this.bubbleShows,
        kind: this.activeBubbleKind(),
        shakeX: this.bubbleShakeX,
        style: this.bubbleT > 0 ? this.bubbleStyle : null,
        art: this.bubbleArt !== null,
      },
      stamina: {
        current: this.stamina.current,
        max: this.stamina.max,
        exhausted: this.stamina.exhausted,
        band: staminaBand(staminaRatio(this.stamina), gameConfig.staminaBarYellowBelow, gameConfig.staminaBarRedBelow),
        speedMultiplier: walkSpeedMultiplier(this.stamina, gameConfig.staminaExhaustedSpeedMultiplier),
        speedPx: body ? Math.hypot(body.velocity.x, body.velocity.y) : 0,
        curses: this.curseCount,
        lastCurseSfx: this.lastCurseSfx,
        tooTired: this.tooTiredCount,
        eats: this.eatCount,
        barks: this.barks.count,
        lastBark: this.barks.lastLine,
        barkChance: this.barkChance,
        barkCooldownSeconds: this.barkCooldown,
        floatsActive: this.floats.filter((_, i) => this.floatLife[i] > 0).map((f) => f.text),
        floatsActiveY: this.floats.flatMap((f, i) => (this.floatLife[i] > 0 ? [{ text: f.text, y: f.y }] : [])),
        floatLog: [...this.floatLog],
      },
      farmJuice: {
        ...this.farmCounts,
        dropsActive: this.dropLife.filter((l) => l > 0).length,
        popsActive: this.popLife.filter((l) => l > 0).length,
        lastWaterSfx: this.lastWaterSfx,
        lastPlantSfx: this.lastPlantSfx ? { ...this.lastPlantSfx } : null,
        harvestSfx: this.harvestSfxLog.map((h) => ({ ...h })),
        lastOvernight: this.lastOvernight ? { ...this.lastOvernight } : null,
      },
      hud: (this.scene.get('GardenHud') as GardenHudScene | null)?.debugState ?? null,
      time: {
        day: this.dayClock.day,
        hour: this.clockHour,
        clockText: formatClock(this.clockHour),
        dayText: dayLabel(this.dayClock.day, gameConfig.daysPerSeason),
        phase: skyPhase(this.clockHour, gameConfig.skyPhaseStarts),
        elapsedSeconds: this.dayClock.elapsedSeconds,
        dayOver: isDayOver(this.dayClock, gameConfig),
        dayEndHits: this.dayEndHits,
        warn: isPassOutWarning(this.clockHour, gameConfig),
        stopped: this.pauseReasons.stopped,
        reasons: this.pauseReasons.list(),
        devHourPresses: this.devHourPresses,
      },
      sky: {
        color: this.skyOverlay ? this.skyOverlay.fillColor : 0,
        alpha: this.skyOverlay?.visible ? this.skyOverlay.fillAlpha : 0,
        visible: this.skyOverlay?.visible ?? false,
      },
      pause: {
        menuOpen: this.pauseMenuOpen,
        cause: this.pauseCause,
        hoverResume: this.pauseHoverResume,
        opens: this.pauseOpens,
        musicVolume: this.musicVolumeNow(),
        hoverRestart: this.pauseHoverRestart,
        restartConfirmOpen: this.restartConfirmOpen,
        restartConfirmHover: this.restartConfirmHover,
        savedText: this.savedText,
      },
      save: {
        saveKey: SAVE_KEY,
        version: GAME_SAVE_VERSION,
        lastSaveAt: this.lastSave ? { ...this.lastSave, clockText: formatClock(this.lastSave.hour) } : null,
        saveCount: this.saveCount,
        loadedFromSave: this.loadStatus === 'ok',
        loadStatus: this.loadStatus,
        loadReason: this.loadReason,
        loadAddedItems: [...this.loadAddedItems],
        loadedElapsedSeconds: this.loadedElapsed,
        suppressed: this.saveSuppressed,
        autoSaveIntervalSeconds: this.autoSaveInterval,
        autoSaveIn: Math.max(0, this.autoSaveInterval - this.autoSaveT),
        skipped: this.saveSkipped,
      },
      money: {
        current: this.wallet.money,
        revision: this.moneyRevision,
        purchases: this.purchases.map((p) => ({ ...p })),
        lastCoinSfx: this.lastCoinSfx,
      },
      shop: {
        window: this.shopWindow,
        status: this.shopStatus.text,
        statusWarn: this.shopStatus.warn,
        opens: { ...this.shopOpens },
        keyPresses: this.interactKeyPresses,
        nearby: !body
          ? null
          : this.area === 'house'
            ? nearestHouseTarget(HOUSE, body.center.x, body.center.y, gameConfig.interactKeyRange * T)
            : nearestKeyTarget(L, body.center.x, body.center.y, T, gameConfig.interactKeyRange),
      },
      area: {
        current: this.area,
        transition: this.areaTransition.phase,
        fade: transitionAlpha(this.areaTransition, gameConfig.areaFadeSeconds),
        banner: { text: this.areaBannerText, alpha: this.areaBannerOpacity },
        enters: this.areaEnters,
        exits: this.areaExits,
        houseHover: this.houseHover ? { ...this.houseHover } : null,
        local: { x: fx - this.areaOrigin(this.area).x, y: fy - this.areaOrigin(this.area).y },
        house: { origin: { ...HOUSE.origin }, floor: { ...HOUSE.floor }, spawn: { ...HOUSE.spawn }, wakeSpot: { ...HOUSE.wakeSpot } },
      },
      chest: {
        slots: this.chest.slots.map((st) => (st ? { id: st.id, count: st.count, name: itemInfo(st.id)?.name ?? st.id } : null)),
        transfers: this.chestTransfers,
      },
      clickMove: {
        active: this.clickMove.active,
        action: this.clickMove.action ? { ...this.clickMove.action } : null,
        waypoints: this.clickMove.waypoints.map((w) => ({ x: Math.round(w.x), y: Math.round(w.y) })),
        index: this.clickMove.index,
        markerVisible: this.clickMarker?.visible ?? false,
        ...this.clickStats,
      },
      sellBox: {
        slots: this.sellBox.slots.map((st) => (st ? { id: st.id, count: st.count, name: itemInfo(st.id)?.name ?? st.id } : null)),
        total: sellBoxTotal(this.sellBox),
        hover: this.shopHover ? { ...this.shopHover } : null,
        transfers: this.transfers,
      },
      seedStall: {
        buttons: this.seedStallItems.map((it) => {
          const price = seedPriceOf(it.cropId) ?? 0;
          return { cropId: it.cropId, label: it.label, price, enabled: hasMoney(this.wallet, price) };
        }),
        hoverButton: this.stallHover,
      },
      night: {
        phase: this.nightPhase,
        overnights: this.overnightCount,
        lastCause: this.lastOvernightCause,
        sleepPromptOpen: this.sleepPromptOpen,
        sleepPromptHover: this.sleepPromptHover,
        sleepPromptOpens: this.sleepPromptOpens,
        tooEarly: this.tooEarlyCount,
        passingOut: this.nightPhase === 'passingOut',
        passedOut: this.lastSummary?.passedOut ?? false,
        fade: this.nightFade,
        heroAngle: this.hero?.angle ?? 0,
        zzz: this.zzzActive,
        wakes: this.wakeCount,
        summaryAccepts: this.summaryAccepts,
        summaryTicks: this.summaryTicks,
        summary:
          this.nightPhase === 'summary' && this.lastSummary
            ? {
                open: true,
                data: { ...this.lastSummary, sale: { ...this.lastSummary.sale, lines: this.lastSummary.sale.lines.map((l) => ({ ...l })) } },
                lines: this.summaryLineList.map((l) => l.text),
                detail: this.summaryDetail,
                moneyShown: moneyShown(this.summaryReveal, this.lastSummary.sale.earned, REVEAL_TIMING),
                allRevealed: allRevealed(this.summaryReveal, REVEAL_TIMING),
                hoverButton: this.summaryHoverButton,
              }
            : null,
        lastSummary: this.lastSummary ? { ...this.lastSummary } : null,
      },
      till: {
        tuning: { ...this.tillTuning },
        finishes: this.finishCount,
        cancels: this.cancelCount,
        hitStops: this.hitStopCount,
        hitStopActive: this.hitStop > 0,
        sweatActive: this.sweatLife.filter((l) => l > 0).length,
        bouncing: this.bounceT > 0,
        bars: this.farm.plots.flatMap((p, i) => {
          const bar = this.plotBars[i];
          if (!bar?.visible || bar.alpha <= 0) return [];
          const flash = this.plotFlash[i] > 0;
          return [{ x: p.x, y: p.y, filled: flash ? this.tillTuning.strikesPerPlot : p.tillStrikes, alpha: bar.alpha, flash }];
        }),
        stages: this.farm.plots
          .filter((p) => p.soil === 'untilled' && p.tillStrikes > 0)
          .map((p) => ({ x: p.x, y: p.y, stage: tillStage(p.tillStrikes, this.tillTuning.strikesPerPlot, gameConfig.tillVisualStages) })),
        queueLabels: this.queueLabels.filter((t) => t.visible).map((t) => ({ x: Math.floor(t.x / T), y: Math.floor(t.y / T), text: t.text })),
      },
      juice: {
        tills: this.tillCount,
        shakes: this.shakeCount,
        lastSfx: this.lastSfx,
        lastSfxDetune: this.lastSfxDetune,
        lastSfxVolume: this.lastSfxVolume,
        dustActive: this.tillDustLife.filter((l) => l > 0).length,
        heroScale: { x: this.hero?.scaleX ?? 1, y: this.hero?.scaleY ?? 1 },
        ripeCues: this.ripeCueCount,
        ripeSparkles: this.sparkleLife.filter((l) => l > 0).length,
        ripeHopping: this.ripeHoppingNow,
        coinFlights: coinsInFlight(this.coins),
        coinBatches: this.coins.batches.map((b) => ({ kind: b.kind, amount: b.amount, landed: b.flights.filter((f) => f.landed).length, total: b.flights.length })),
        coinBatchesStarted: this.coins.started,
        coinsLandedIn: this.coins.landedIn,
        pendingPayout: this.pendingPayout,
        moneyShown: this.moneyShown,
        record: {
          bestDaySale: this.records.bestDaySale,
          newToday: this.summaryRecord,
          badgeProgress: this.nightPhase === 'summary' ? recordProgress(this.summaryReveal, REVEAL_TIMING) : 0,
          sfxPlayed: this.recordSfxPlayed,
        },
      },
      audio: {
        ...this.audio.debugState(),
        seed: this.worldSeed,
        roosterToday: this.roosterToday,
        roosters: this.roosterLog.map((r) => ({ ...r })),
        yawns: this.yawnCount,
        footsteps: this.footstepCount,
        volumeHover: this.pauseVolumeHover,
      },
      progress: (() => {
        const s = this.stage4;
        const p = s.progress;
        return {
          xp: p.xp,
          level: p.level,
          quests: Object.fromEntries(Object.entries(p.quests).map(([id, q]) => [id, { status: q.status, counters: { ...q.counters } }])),
          trackedQuest: p.trackedQuest,
          flags: { ...s.flags },
          activeFlags: activeFlags(s.flags),
          tools: Object.fromEntries(Object.entries(s.tools).map(([id, t]) => [id, { ...t }])),
          outfitTier: s.outfit.tier,
          family: { members: s.family.members.map((m) => ({ ...m })), porridgeDays: s.family.porridgeDays },
          weather: { ...s.weather },
        };
      })(),
      cheatPanel: {
        enabled: gameConfig.devCheatsEnabled,
        open: this.cheatPanelOpen,
        hover: this.cheatHover,
        labels: this.cheatLabels(),
        pickedItem: pickedItem(this.cheatState(), CHEAT_RULES),
        uses: this.cheatUses,
        lastButton: this.lastCheatButton,
        notice: this.cheatNotice,
        status: this.cheatStatus(),
      },
    };
  }

  /**
   * T-041 (QA/test): tâm nút bảng Thử (toạ độ màn 1920×1080) theo chỉ số trong CHEAT_BUTTONS hoặc theo chữ gốc trong
   * cheatPanel.json (vd 'Lv 5', '+100 quan'). null = không có nút đó.
   */
  debugCheatButtonCenter(which: number | string): { x: number; y: number } | null {
    const i = typeof which === 'number' ? which : CHEAT_BUTTONS.findIndex((b) => b.label === which);
    const s = CHEAT_SLOTS[i];
    return s ? { x: s.rect.x + s.rect.w / 2, y: s.rect.y + s.rect.h / 2 } : null;
  }

  /** T-041 (QA/test): mở / đóng bảng Thử như bấm F2 (chỉ bản dev). Trả về bảng có đang mở không. */
  debugSetCheatPanel(open: boolean): boolean {
    if (open) this.openCheatPanel();
    else this.closeCheatPanel();
    return this.cheatPanelOpen;
  }

  /**
   * T-041 (QA/test): bấm một nút bảng Thử (theo chỉ số hoặc chữ gốc) như click — không cần mở bảng. Chỉ bản dev. Trả về dòng
   * báo của nút ('' = không có nút / bản build).
   */
  debugRunCheat(which: number | string): string {
    if (!gameConfig.devCheatsEnabled) return '';
    const i = typeof which === 'number' ? which : CHEAT_BUTTONS.findIndex((b) => b.label === which);
    return i >= 0 ? this.runCheat(i) : '';
  }

  /** T-026: toạ độ màn của nút âm lượng trong cửa sổ Tạm dừng (QA bấm thử). */
  debugVolumeButtonCenter(id: VolumeButtonId): { x: number; y: number } {
    const r = volumeButtonRect(id);
    return { x: r.x + r.w / 2, y: r.y + r.h / 2 };
  }

  /** Toạ độ trên khung game (px, hệ 1920×1080) của tâm ô (tx, ty) — cho e2e rê chuột đúng ô. */
  debugTileToScreen(tx: number, ty: number): { x: number; y: number } {
    const cam = this.cameras.main;
    return {
      x: cam.x + ((tx + 0.5) * T - cam.worldView.x) * cam.zoom,
      y: cam.y + ((ty + 0.5) * T - cam.worldView.y) * cam.zoom,
    };
  }

  /** Ô (tx, ty) đang làm hoặc đang chờ làm? (cho e2e) */
  debugIsPending(tx: number, ty: number): boolean {
    return isPending(this.action, { x: tx, y: ty });
  }

  /**
   * Chỉnh thông số cuốc lúc chạy — chỉ dùng cho QA/test (vd 2 nhát × 0.2 s cho test nhanh). Không gọi trong game.
   * Không đổi ô đang cuốc giữa chừng (số nhát của ô hiện tại đã tính lúc bắt đầu).
   */
  debugSetTillTuning(t: Partial<TillTuning>): TillTuning {
    Object.assign(this.tillTuning, t);
    this.tillParams.duration = this.tillTuning.strikeSeconds;
    this.tillParams.queueMax = this.tillTuning.queueMax;
    this.plotDrawn.fill(-1); // số đốt thanh tiến độ có thể đổi → vẽ lại
    return { ...this.tillTuning };
  }

  /** Toạ độ màn (hệ 1920×1080) của tâm ô hotbar / ô gùi thứ i — cho e2e rê chuột đúng ô giao diện. */
  debugHudSlotCenter(kind: 'hotbar' | 'bag', i: number): { x: number; y: number } {
    const r = kind === 'hotbar' ? hotbarSlotRect(i) : bagSlotRect(i, this.inventory.slots.length);
    return { x: r.x + r.w / 2, y: r.y + r.h / 2 };
  }

  /**
   * T-009 (QA/test): cầm cuốc — chọn ô hotbar đang có cuốc (như người chơi bấm số ô đó). Trả về ô đã chọn, -1 nếu cuốc
   * không nằm trên hotbar.
   */
  debugHoldHoe(): number {
    const i = this.inventory.slots.findIndex((st, k) => k < this.inventory.hotbarSize && st !== null && toolOf(st.id)?.use === 'till');
    if (i >= 0) this.selectHotbar(i);
    return i;
  }

  /** Ghi đè một ô gùi (QA/test: làm gùi đầy, hết hạt…). id null hoặc count ≤ 0 = ô trống. */
  debugSetSlot(i: number, id: string | null, count: number): void {
    setSlot(this.inventory, i, id, count);
    this.inventoryRevision++;
  }

  /**
   * Đặt Sức (QA/test). Đi qua cùng luật như khi chơi: về 0 thì đuối + chửi thề (1 lần), lên > 0 thì hết đuối.
   * Trả về Sức sau khi chặn trong [0, staminaMax].
   */
  debugSetStamina(value: number): number {
    const change = setStamina(this.stamina, value);
    if (change.becameExhausted) this.curseExhausted();
    return this.stamina.current;
  }

  /** Chỉnh xác suất / thời gian nghỉ lầm bầm (QA/test: chance 1, cooldown 0 để luôn lầm bầm; chance 0 để tắt). */
  debugSetBarkTuning(t: { chance?: number; cooldownSeconds?: number }): { chance: number; cooldownSeconds: number } {
    if (t.chance !== undefined) this.barkChance = t.chance;
    if (t.cooldownSeconds !== undefined) this.barkCooldown = t.cooldownSeconds;
    return { chance: this.barkChance, cooldownSeconds: this.barkCooldown };
  }

  /**
   * QA/test (BUG-014): kéo dài thời lượng việc NHANH (gieo/tưới/hái/dọn, giây) và bong bóng chửi thề (giây) để test trên
   * máy chậm không phải "đua" với điểm chạm / lúc bong bóng tắt. Không gọi trong game.
   */
  debugSetTestTuning(t: { fastActionSeconds?: number; grumbleSeconds?: number }): { fastActionSeconds: number; grumbleSeconds: number } {
    if (t.fastActionSeconds !== undefined) this.fastParams.duration = t.fastActionSeconds;
    if (t.grumbleSeconds !== undefined) this.grumbleSeconds = t.grumbleSeconds;
    return { fastActionSeconds: this.fastParams.duration, grumbleSeconds: this.grumbleSeconds };
  }

  /** Đặt số tiền (QA/test, vd 3 quan để thử nút xám). Đi qua luật "không âm". Trả về số tiền sau khi đặt. */
  debugSetMoney(n: number): number {
    const before = this.wallet.money;
    setMoney(this.wallet, n);
    if (this.wallet.money !== before) this.onMoneyChanged(this.wallet.money - before);
    return this.wallet.money;
  }

  /** T-027 (QA/test): đặt kỷ lục tiền bán một đêm (vd 0 để đêm sau chắc chắn "Kỷ lục mới!", 9999 để chắc chắn không). */
  debugSetRecord(bestDaySale: number): number {
    this.records.bestDaySale = Math.max(0, Math.floor(bestDaySale));
    return this.records.bestDaySale;
  }

  /** Ghi đè một ô thùng bán (QA/test). */
  debugSetSellBoxSlot(i: number, id: string | null, count: number): void {
    setSlot(this.sellBox, i, id, count);
    this.inventoryRevision++;
  }

  /** Toạ độ màn (1920×1080) tâm ô `i` bên gùi / thùng trong cửa sổ thùng bán — cho e2e. */
  debugSellSlotCenter(side: SellSide, i: number): { x: number; y: number } {
    // T-093: rương mở thì tính theo lưới rương (cùng bố cục).
    const r = sellSlotRect(side, i, this.inventory.slots.length, this.shopBoxInventory().slots.length);
    return { x: r.x + r.w / 2, y: r.y + r.h / 2 };
  }

  /** Toạ độ màn tâm nút mua thứ i ở sạp hạt — cho e2e. */
  debugStallButtonCenter(i: number): { x: number; y: number } {
    const r = stallButtonRect(i, this.seedStallItems.length);
    return { x: r.x + r.w / 2, y: r.y + r.h / 2 };
  }

  /**
   * "Bán thùng" ngay (QA/test, xem trước việc T-007 làm lúc qua đêm): bán hết theo giá gốc, cộng tiền. KHÔNG gọi trong game
   * ở T-006 — tiền thùng bán chỉ cộng cuối ngày.
   */
  debugSellBoxNow(): SaleReport {
    const report = sellBoxContents(this.sellBox, this.wallet);
    this.inventoryRevision++;
    if (report.earned > 0) this.onMoneyChanged(report.earned);
    return report;
  }

  /** Qua một đêm như phím G (QA/test): hàm qua đêm chung, "im lặng" (không tổng kết) — trả về tóm tắt ruộng. */
  debugAdvanceDay(): OvernightReport {
    return this.applyOvernight('devG').farm;
  }

  /** Toạ độ màn (1920×1080) tâm nút "Có" / "Không" ở hộp hỏi ngủ — cho e2e. */
  debugSleepButtonCenter(which: 'yes' | 'no'): { x: number; y: number } {
    const r = sleepButtonRect(which);
    return { x: r.x + r.w / 2, y: r.y + r.h / 2 };
  }

  /** Toạ độ màn tâm nút "Ngày mới" ở màn tổng kết — cho e2e. */
  debugSummaryButtonCenter(): { x: number; y: number } {
    const r = summaryButtonRect();
    return { x: r.x + r.w / 2, y: r.y + r.h / 2 };
  }

  /**
   * Đẩy đồng hồ tới 24:00 và ngủ gục ngay (QA/test) — dùng được cả khi đang mở cửa sổ (lúc chơi thật đồng hồ đứng khi mở
   * cửa sổ nên không tới được 24h). Trả về bước đêm sau khi gọi.
   */
  debugTriggerDayEnd(): NightPhase {
    if (this.nightPhase === 'none' || this.nightPhase === 'sleepPrompt') {
      setGameHour(this.dayClock, gameConfig.dayEndHour, gameConfig);
      this.onDayEndReached();
    }
    return this.nightPhase;
  }

  /** Đặt giờ game (QA/test, vd 17.5 để chụp hoàng hôn). Trả về giờ sau khi kẹp trong [6, 24]. */
  debugSetHour(hour: number): number {
    setGameHour(this.dayClock, hour, gameConfig);
    this.updateSky();
    return this.clockHour;
  }

  /** Mở / đóng cửa sổ Tạm dừng như bấm Esc (QA/test). */
  debugSetPauseMenu(open: boolean): boolean {
    if (open) this.openPauseMenu('esc');
    else this.closePauseMenu();
    return this.pauseMenuOpen;
  }

  /** T-008 (QA/test): lưu ngay như tự lưu (vẫn theo luật "không lưu giữa chuỗi đêm"). Trả về save đã ghi hoặc null. */
  debugSaveNow(reason = 'debug'): GameSave | null {
    return this.saveNow(reason);
  }

  /**
   * T-008 (QA/test): ghi một save HỎNG vào localStorage và NGỪNG ghi (để tải lại trang đọc đúng bản hỏng đó, không bị
   * pagehide ghi đè). `kind`: 'json' = JSON cụt, 'version' = version 99, 'missing' = thiếu trường farm.
   */
  debugCorruptSave(kind: 'json' | 'version' | 'missing' = 'json'): string {
    this.saveSuppressed = true;
    const good = captureSave(this.saveWorld(), new Date()) as unknown as Record<string, unknown>;
    let text: string;
    if (kind === 'json') text = JSON.stringify(good).slice(0, 80);
    else if (kind === 'version') text = JSON.stringify({ ...good, version: 99 });
    else {
      delete good.farm;
      text = JSON.stringify(good);
    }
    window.localStorage.setItem(SAVE_KEY, text);
    return text;
  }

  /**
   * T-008 (QA/test): xóa save. Mặc định NGỪNG ghi luôn tới khi tải lại trang (để `page.reload()` vào Ngày 1 sạch — không bị
   * pagehide ghi lại); `keepSaving` = true thì vẫn tự lưu tiếp như thường.
   */
  debugClearSave(keepSaving = false): void {
    clearLocalSave();
    if (!keepSaving) this.saveSuppressed = true;
  }

  /** T-008 (QA/test): đổi nhịp tự lưu (giây thật) để test không phải chờ 30 giây; đặt lại bộ đếm. */
  debugSetAutoSaveInterval(seconds: number): number {
    this.autoSaveInterval = Math.max(0.1, seconds);
    this.autoSaveT = 0;
    return this.autoSaveInterval;
  }

  /** T-008 (QA/test): đọc thẳng localStorage — object save (JSON.parse) hoặc null nếu chưa có / không đọc được. */
  debugReadSave(): unknown {
    try {
      const text = window.localStorage.getItem(SAVE_KEY);
      return text === null ? null : (JSON.parse(text) as unknown);
    } catch {
      return null;
    }
  }

  /** T-008: toạ độ màn (1920×1080) tâm nút trong cửa sổ Tạm dừng / hộp xác nhận chơi lại — cho e2e. */
  debugPauseButtonCenter(which: 'resume' | 'restart' | 'confirmYes' | 'confirmNo'): { x: number; y: number } {
    const r =
      which === 'resume'
        ? pauseResumeButtonRect()
        : which === 'restart'
          ? pauseRestartButtonRect()
          : restartConfirmButtonRect(which === 'confirmYes' ? 'yes' : 'no');
    return { x: r.x + r.w / 2, y: r.y + r.h / 2 };
  }

  /**
   * T-093 (QA/test): sang khu `area` NGAY (không màn mờ, không lưu) — đứng ở chỗ vào của khu (trong nhà: cạnh cửa; Vườn: trước
   * cửa nhà) hoặc ở `local` (px tính từ góc khu) nếu có.
   */
  debugEnterArea(area: AreaId, local?: { x: number; y: number }): AreaId {
    const o = this.areaOrigin(area);
    const spot = local ? { x: o.x + local.x, y: o.y + local.y } : area === 'house' ? HOUSE.spawn : houseExitSpot(L.houseDoor, T);
    this.area = area;
    this.placeHero(spot.x, spot.y, area === 'house' ? 'up' : 'down');
    this.applyAreaView();
    return this.area;
  }

  /** T-093 (QA/test): toạ độ màn (1920×1080) tâm ảnh một vật trong nhà — để rê / click chuột. */
  debugHouseObjectScreen(id: HouseTarget): { x: number; y: number } {
    const cam = this.cameras.main;
    const r = houseObject(HOUSE, id).image;
    return {
      x: cam.x + (r.x + r.w / 2 - cam.worldView.x) * cam.zoom,
      y: cam.y + (r.y + r.h / 2 - cam.worldView.y) * cam.zoom,
    };
  }

  /** T-096 (QA/test): toạ độ màn (1920×1080) của một điểm thế giới (px) — để click / chạm đúng chỗ. */
  debugWorldToScreen(x: number, y: number): { x: number; y: number } {
    const cam = this.cameras.main;
    return { x: cam.x + (x - cam.worldView.x) * cam.zoom, y: cam.y + (y - cam.worldView.y) * cam.zoom };
  }

  /** T-093 (QA/test): ghi đè một ô rương. */
  debugSetChestSlot(i: number, id: string | null, count: number): void {
    setSlot(this.chest, i, id, count);
    this.inventoryRevision++;
  }

  /** T-092 (QA/chụp ảnh): hiện bong bóng kiểu bất kỳ (bỏ qua ưu tiên — tắt bong bóng đang hiện trước). */
  debugShowBubble(text: string, kind: BubbleKind = 'warn', style?: BubbleStyle): boolean {
    this.bubbleT = 0;
    this.bubbleKind = null;
    return this.showBubble(text, kind, style ?? bubbleStyleOf(kind));
  }

  /** Dịch nhân vật tới giữa ô (tx, ty) — chỉ dùng cho QA/test. */
  debugTeleport(tx: number, ty: number): void {
    const x = tx * T + T / 2;
    const y = ty * T + T / 2;
    this.feetBody.reset(x, y);
    this.prevFootX = x;
    this.prevFootY = y;
    this.speedRatio = 0;
  }
}

/** Hướng "không bấm phím" dùng lại khi đang khựng (không tạo object mới mỗi frame). */
const NO_DIR = Object.freeze({ x: 0, y: 0 });

/** Mã số giai đoạn cây (cho "chữ ký" vẽ lại). */
const CROP_STAGE_CODE: Record<CropStage, number> = { seed: 0, growing: 1, ripe: 2, withered: 3 };
/** Bong bóng nảy lúc hiện bao lâu (giây). */
const BUBBLE_POP_SECONDS = 0.15;
/** Bong bóng nghĩ: phóng ảnh mây trong khoảng này (câu ngắn "…"). */
const THINK_BUBBLE_SCALE = [1, 1.4] as const;

/** T-092: các mảnh ảnh bong bóng (tạo một lần, chỉ bật/tắt + đổi cỡ). */
interface BubbleArt {
  normal: UiFrame;
  normalTail: Phaser.GameObjects.Image;
  boast: UiFrame;
  boastTail: Phaser.GameObjects.Image;
  curse: Phaser.GameObjects.Image;
  think: Phaser.GameObjects.Image;
}

/**
 * Khung răng cưa cho bong bóng chửi thề: một "siêu elip" gần chữ nhật (w × h, tâm (0, cy)), mép xen kẽ nhọn ra / lõm
 * vào `spike` px. Trả về danh sách điểm cho Graphics.fillPoints.
 */
function jaggedBubblePoints(w: number, h: number, cy: number, spike: number): { x: number; y: number }[] {
  const a = w / 2 + spike;
  const b = h / 2 + spike;
  const n = Math.max(16, Math.round((w + h) / 18)) * 2; // số đỉnh chẵn: nhọn, lõm, nhọn…
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    const c = Math.cos(t);
    const s = Math.sin(t);
    const k = i % 2 === 0 ? 0 : spike * 1.6; // đỉnh lõm thụt vào
    // Mũ 1/3 → hình gần chữ nhật bo góc (chữ trong bong bóng không bị cắt góc).
    pts.push({ x: Math.sign(c) * Math.abs(c) ** (1 / 3) * (a - k), y: cy + Math.sign(s) * Math.abs(s) ** (1 / 3) * (b - k) });
  }
  return pts;
}

/** Chữ bay: "+8 Sức" / "−4 Sức" (dấu trừ thật, không phải gạch nối). */
function floatLabel(amount: number): string {
  return amount > 0 ? `+${amount} Sức` : `−${-amount} Sức`;
}

function rectContains(r: Rect, px: number, py: number): boolean {
  return px >= r.x && px < r.x + r.w && py >= r.y && py < r.y + r.h;
}
