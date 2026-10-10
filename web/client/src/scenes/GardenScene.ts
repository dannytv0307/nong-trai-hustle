// Vườn thử (T-001): bản đồ 48×32 ô dựng bằng code, nhân vật {ten} đi WASD có va chạm
// (Arcade Physics), camera bám theo trong biên bản đồ, hoạt ảnh đi bằng code (D-020).
// T-002: rê chuột chỉ ô (viền sáng trong tầm / xám ngoài tầm), click để cuốc ruộng.
// T-002 phần 2 (D-022): cuốc là "việc nặng" — một click, {ten} tự bổ 6 nhát (≈ 5 giây), thanh tiến độ 6 đốt,
// đất đổi 3 nấc, WASD = bỏ dở (ô giữ số nhát), giữ chuột rê xếp hàng tối đa 3 ô.
// Nhà, cây, ao, rào là hình khối màu theo palette (chưa có asset thật).
import Phaser from 'phaser';
import { heroTextureKey, heroTurnKey, heroWalkKey } from '../config/assets';
import { gameConfig } from '../config/gameConfig';
import { cssColor, palette } from '../config/palette';
import { textStyles } from '../config/theme';
import { InputController } from '../input/InputController';
import {
  cornerNudge,
  fenceRects,
  gardenLayout as L,
  houseWallRects,
  tileOf,
  tileSolidGrid,
  type TileRect,
} from '../systems/garden';
import {
  canTill,
  createFarm,
  facingToward,
  inReach,
  plotAt,
  strikeTill,
  strikesRemaining,
  tilledCount,
  tillStage,
  type FarmPlot,
} from '../systems/farm';
import { facingFromDirection, moveVelocity, type Facing } from '../systems/movement';
import { pulseAlpha } from '../systems/pulse';
import {
  actionPose,
  cancelTileAction,
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

const T = gameConfig.tileSize;
/** Mỗi ảnh tile thử 256×256 = 4×4 ô 64px (Art Bible §9.1). */
const TILE_TEXTURE_CELLS = 4;
const TILES_PER_TEXTURE = TILE_TEXTURE_CELLS * TILE_TEXTURE_CELLS;

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
/** Nấc đất cuốc dở (vẽ bằng code) + ô "nảy" lúc xong: ngay trên nền, dưới viền ruộng. */
const DEPTH_TILL_MARKS = DEPTH_GROUND + 2;

/**
 * Viền xám (ngoài tầm): palette chưa có xám → trộn nửa-nửa trắng điệp + mực = xám ấm, vẫn hợp tông.
 * (Không dùng mực mờ vì trùng màu với viền ô ruộng, khó thấy.)
 */
const HIGHLIGHT_OUT_COLOR = Phaser.Display.Color.Interpolate.ColorWithColor(
  Phaser.Display.Color.ValueToColor(palette.paper),
  Phaser.Display.Color.ValueToColor(palette.ink),
  100,
  50,
);
const HIGHLIGHT_OUT_HEX = Phaser.Display.Color.GetColor(HIGHLIGHT_OUT_COLOR.r, HIGHLIGHT_OUT_COLOR.g, HIGHLIGHT_OUT_COLOR.b);
const HIGHLIGHT_OUT_ALPHA = 0.9;
/** Lùi viền ô vào trong (px) = nửa bề dày viền lót lớn nhất, để viền không lấn sang ô bên. */
const HIGHLIGHT_INSET = Math.ceil(
  Math.max(...gameConfig.tileHighlightWidth.map((w, i) => w + gameConfig.tileHighlightOutline[i] * 2)) / 2,
);
/** Màu phủ lên cỏ ở ô ruộng chưa cuốc ("đất khô lẫn cỏ"), để thấy rõ vùng ruộng. */
const UNTILLED_TINT_ALPHA = 0.45;
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

// Kích thước hình khối placeholder (chỉ để nhìn, không ảnh hưởng gameplay).
/** Tường nhà "cao" bao nhiêu px trên màn (mặt trước tường). */
const WALL_LIFT = 40;

/** Khóa texture placeholder vẽ bằng code (bakeTextures). */
const TEX = {
  fenceH: 'ph-fence-h',
  fenceV: 'ph-fence-v',
  wall: 'ph-wall',
  tree: 'ph-tree',
  bed: 'ph-bed',
  pond: 'ph-pond',
} as const;
/** Khung ảnh cây: rộng, cao, và toạ độ Y của chân gốc trong ảnh. */
const TREE_TEX = { w: 160, h: 192, baseY: 186 } as const;

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
const DIRT_TEXTURE = 'tile-dirt-test';
/** "Chữ ký" vẽ riêng cho lúc thanh tiến độ đang lóe sáng (xong ô). */
const FLASH_SIG = -2;

/** Thông số cuốc có thể chỉnh lúc chạy (QA đặt nhỏ cho test nhanh qua `debugSetTillTuning`). */
export interface TillTuning {
  strikesPerPlot: number;
  strikeSeconds: number;
  queueMax: number;
}
/** Tiếng "bộp" khi cuốc — chọn ngẫu nhiên một trong hai (GDD §8). */
const TILL_SFX = ['sfx-cuoc-dat-1', 'sfx-cuoc-dat-2'] as const;

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
  hover: { x: number; y: number; inReach: boolean; tillable: boolean; highlight: 'bright' | 'gray'; alpha: number } | null;
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
    dragKind: 'till' | null;
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
  /** Ảnh cây (để làm mờ tán khi nhân vật đứng sau). */
  private readonly trees: Phaser.GameObjects.Image[] = [];

  /** Lưới ô chặn (không gồm cây) — dùng cho "nắn vào cửa". */
  private solidGrid: boolean[][] = [];
  /** Lớp va chạm Tilemap (công khai cho QA kiểm "không xuyên vật cản"). */
  collisionLayer!: Phaser.Tilemaps.TilemapLayer;

  // ---- Ruộng & làm việc trên ô (T-002) ----
  private groundLayer!: Phaser.Tilemaps.TilemapLayer;
  private readonly farm = createFarm(L.plots);
  /** Lớp phủ "đất khô" trên từng ô ruộng chưa cuốc, cùng thứ tự với farm.plots. */
  private readonly plotTints: Phaser.GameObjects.Rectangle[] = [];
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
  private dragKind: 'till' | null = null;
  /** Vừa bỏ dở bằng WASD mà chuột vẫn giữ → không tự cuốc lại cho tới khi buông chuột. */
  private dragBlocked = false;
  /** Khựng hình còn lại (giây) — nhát cuối (tillFinishHitStopSeconds). */
  private hitStop = 0;
  /** Nấc đất cuốc dở (vẽ bằng code) và thanh tiến độ, mỗi ô ruộng một cái, cùng thứ tự farm.plots. */
  private readonly plotMarks: Phaser.GameObjects.Graphics[] = [];
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
  /** Đồng hồ nhịp thở của viền (giây) — về 0 khi con trỏ sang ô khác để ô mới hiện sáng ngay. */
  private highlightPulseT = 0;
  /** Ô viền đang chỉ (để biết khi nào đổi ô); -1 = chưa có. */
  private highlightTileKey = -1;
  /** Ô dưới con trỏ ở frame này (tái dùng object). */
  private readonly hover = { x: 0, y: 0, valid: false, inReach: false, tillable: false };
  private readonly pointerWorldPt = new Phaser.Math.Vector2();
  // Pool bụi đất (nâu) khi cuốc — cùng cách với bụi chân: tạo sẵn, tái dùng.
  private readonly tillDust: Phaser.GameObjects.Arc[] = [];
  private readonly tillDustLife: number[] = [];
  private readonly tillDustVx: number[] = [];
  private readonly tillDustVy: number[] = [];
  private tillCount = 0;
  private shakeCount = 0;
  private lastSfx: string | null = null;

  gardenReady = false;

  constructor() {
    super({
      key: 'Garden',
      // Arcade Physics: vật lý hộp chữ nhật đơn giản, không trọng lực (nhìn từ trên xuống).
      physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 0 }, debug: false } },
    });
  }

  create(): void {
    const mapW = L.cols * T;
    const mapH = L.rows * T;
    this.controls = new InputController(this);

    this.bakeTextures();
    this.buildGround();
    const solids = this.buildObstacles();
    this.buildPlayer();
    this.buildDustPool();
    this.buildTileHighlight();

    this.physics.world.setBounds(0, 0, mapW, mapH);
    this.physics.add.collider(this.feet, solids);
    this.physics.add.collider(this.feet, this.buildCollisionLayer());
    if (physicsDebugFromSearch(window.location.search)) {
      this.physics.world.drawDebug = true;
      this.physics.world.createDebugGraphic();
    }

    // Camera: phóng to cho dễ nhìn, không ra ngoài bản đồ (không lộ khoảng đen), bám theo mượt.
    const cam = this.cameras.main;
    cam.setBounds(0, 0, mapW, mapH);
    cam.setZoom(gameConfig.cameraZoom);
    cam.setBackgroundColor(palette.jade);
    cam.centerOn(this.feet.x, this.feet.y);
    cam.startFollow(this.feet, true, gameConfig.cameraLerp, gameConfig.cameraLerp);

    this.scene.launch('GardenHud');
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.scene.stop('GardenHud'));
    this.startMusic();

    this.gardenReady = true;
    this.registry.set('gardenReady', true);
  }

  // ---------------------------------------------------------------- dựng bản đồ

  /** Nền: Tilemap tạo bằng code — cỏ khắp nơi, đất ở ruộng. */
  private buildGround(): void {
    const data: number[][] = [];
    for (let y = 0; y < L.rows; y++) {
      const row: number[] = [];
      for (let x = 0; x < L.cols; x++) {
        // Lấy mảnh theo (x mod 4, y mod 4) để 16 mảnh của ảnh 256px ghép liền như ảnh gốc lặp lại.
        const local = (y % TILE_TEXTURE_CELLS) * TILE_TEXTURE_CELLS + (x % TILE_TEXTURE_CELLS);
        // Ruộng chưa cuốc vẫn là cỏ (phủ màu đất khô bên dưới); cuốc xong mới đổi sang tile đất (tilledTileIndex).
        row.push(local);
      }
      data.push(row);
    }
    const map = this.make.tilemap({ data, tileWidth: T, tileHeight: T });
    const grass = map.addTilesetImage('grass', 'tile-grass-test', T, T, 0, 0, 0);
    const dirt = map.addTilesetImage('dirt', 'tile-dirt-test', T, T, 0, 0, TILES_PER_TEXTURE);
    if (!grass || !dirt) throw new Error('Không tạo được tileset thử — kiểm tra tile-grass-test/tile-dirt-test');
    const layer = map.createLayer(0, [grass, dirt], 0, 0);
    if (!layer) throw new Error('Không tạo được lớp nền Vườn');
    this.groundLayer = layer.setDepth(DEPTH_GROUND);

    // Ô ruộng chưa cuốc: phủ màu gỗ/đất khô lên cỏ cho thấy rõ vùng ruộng (placeholder).
    for (const plot of this.farm.plots) {
      const tint = this.add
        .rectangle(plot.x * T, plot.y * T, T, T, palette.wood, UNTILLED_TINT_ALPHA)
        .setOrigin(0)
        .setDepth(DEPTH_GROUND + 1);
      this.plotTints.push(tint);
      this.plotMarks.push(this.add.graphics().setDepth(DEPTH_TILL_MARKS));
      this.plotBars.push(this.add.graphics().setDepth(DEPTH_TILL_UI));
      this.plotDrawn.push(-1);
      this.plotFlash.push(0);
      if (plot.soil === 'tilled') this.showTilled(plot);
    }

    // Lối đất từ cửa nhà xuống Đầu ngõ.
    const p = L.path;
    this.add.rectangle(p.x * T + 8, p.y * T, p.w * T - 16, p.h * T, palette.wood, 0.55).setOrigin(0).setDepth(DEPTH_GROUND_DECOR);

    // Viền từng ô ruộng cho dễ thấy (placeholder, sau này là tile viền).
    const g = this.add.graphics().setDepth(DEPTH_GROUND_DECOR);
    g.lineStyle(2, palette.ink, 0.45);
    for (let y = L.plots.y; y < L.plots.y + L.plots.h; y++) {
      for (let x = L.plots.x; x < L.plots.x + L.plots.w; x++) g.strokeRect(x * T + 1, y * T + 1, T - 2, T - 2);
    }

    // Chừa chỗ cho thùng bán và sạp hạt (T-006): khung mờ + nhãn.
    this.markReserved(L.sellBox, 'Thùng bán');
    this.markReserved(L.seedStall, 'Sạp hạt');
  }

  private markReserved(r: TileRect, label: string): void {
    this.add
      .rectangle(r.x * T + 4, r.y * T + 4, r.w * T - 8, r.h * T - 8)
      .setOrigin(0)
      .setStrokeStyle(3, palette.gold, 0.7)
      .setDepth(DEPTH_GROUND_DECOR);
    this.add
      .text((r.x + r.w / 2) * T, (r.y + r.h / 2) * T, label, { ...textStyles.body, fontSize: '16px', strokeThickness: 4 })
      .setOrigin(0.5)
      .setResolution(2)
      .setAlpha(0.85)
      .setDepth(DEPTH_GROUND_DECOR);
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
    const ts = map.addTilesetImage('solid', 'tile-dirt-test', T, T, 0, 0, 0);
    const layer = ts ? map.createLayer(0, ts, 0, 0) : null;
    if (!layer) throw new Error('Không tạo được lớp va chạm Vườn');
    layer.setVisible(false).setCollision(0);
    this.collisionLayer = layer;
    return layer;
  }

  /** Vẽ nhà, giường, ao, cây, rào; tạo hộp va chạm gốc cây. Trả về danh sách hộp. */
  private buildObstacles(): Phaser.GameObjects.Zone[] {
    const solids: Phaser.GameObjects.Zone[] = [];
    const addSolid = (x: number, y: number, w: number, h: number) => {
      const z = this.add.zone(x + w / 2, y + h / 2, w, h);
      this.physics.add.existing(z, true); // true = static: đứng yên, không bị đẩy
      solids.push(z);
    };

    // Rào quanh mép: va chạm theo cả cạnh (khối liền → trượt dọc không vấp), vẽ từng ô.
    // Rào, tường, giường, ao chặn bằng lớp va chạm Tilemap (buildCollisionLayer); ở đây chỉ vẽ.
    for (const r of fenceRects(L.cols, L.rows)) {
      const horizontal = r.h === 1;
      for (let ty = r.y; ty < r.y + r.h; ty++) {
        for (let tx = r.x; tx < r.x + r.w; tx++) {
          this.add
            .image(tx * T, ty * T, horizontal ? TEX.fenceH : TEX.fenceV)
            .setOrigin(0)
            .setDepth((ty + 1) * T);
        }
      }
    }

    // Nhà: sàn gỗ + tường có ô cửa ở tường dưới.
    const h = L.house;
    this.add
      .rectangle((h.x + 1) * T, (h.y + 1) * T, (h.w - 2) * T, (h.h - 2) * T, palette.wood)
      .setOrigin(0)
      .setDepth(DEPTH_GROUND_DECOR);
    // Ô cửa lát sàn luôn cho liền với trong nhà.
    this.add
      .rectangle(h.doorX * T, (h.y + h.h - 1) * T, h.doorW * T, T, palette.wood)
      .setOrigin(0)
      .setDepth(DEPTH_GROUND_DECOR);
    const floorLines = this.add.graphics().setDepth(DEPTH_GROUND_DECOR);
    floorLines.lineStyle(2, palette.earth, 0.35);
    for (let ty = h.y + 1; ty < h.y + h.h - 1; ty++) {
      floorLines.lineBetween((h.x + 1) * T, ty * T + T / 2, (h.x + h.w - 1) * T, ty * T + T / 2);
    }
    for (const r of houseWallRects(h)) {
      // Vẽ từng ô một, mỗi ô depth riêng = đáy ô → đi cạnh tường dọc vẫn đúng lớp trước/sau.
      for (let ty = r.y; ty < r.y + r.h; ty++) {
        for (let tx = r.x; tx < r.x + r.w; tx++) {
          this.add.image(tx * T, (ty + 1) * T, TEX.wall).setOrigin(0, 1).setDepth((ty + 1) * T);
        }
      }
    }

    // Giường trong nhà.
    const b = L.bed;
    this.add.image(b.x * T, b.y * T - 12, TEX.bed).setOrigin(0).setDepth((b.y + b.h) * T);

    // Ao nước: nằm sát đất, chặn cả khối.
    const p = L.pond;
    this.add.image(p.x * T, p.y * T, TEX.pond).setOrigin(0).setDepth(DEPTH_GROUND_DECOR);

    // Cây: chỉ gốc chặn (hộp nhỏ), tán cây vẽ cao → đi ra sau cây thì tán che người.
    const [trunkW, trunkH] = gameConfig.treeTrunkHitbox;
    for (const [tx, ty] of L.trees) {
      const cx = tx * T + T / 2;
      const baseY = (ty + 1) * T - 12; // chân gốc cây
      addSolid(cx - trunkW / 2, baseY - trunkH, trunkW, trunkH);
      this.add.ellipse(cx, baseY, 84, 26, palette.ink, 0.25).setDepth(DEPTH_SHADOW);
      const tree = this.add
        .image(cx, baseY, TEX.tree)
        .setOrigin(0.5, TREE_TEX.baseY / TREE_TEX.h)
        .setDepth(baseY);
      this.trees.push(tree);
    }
    return solids;
  }

  /**
   * Vẽ sẵn các hình khối placeholder thành texture MỘT lần, rồi dùng Image (rẻ, được gộp lô khi vẽ).
   * Nếu để Graphics thì WebGL phải dựng lại hình mỗi frame → tụt FPS khi có vài trăm cọc rào.
   */
  private bakeTextures(): void {
    if (this.textures.exists(TEX.fenceH)) return; // đã vẽ ở lần vào Vườn trước
    const bake = (key: string, w: number, h: number, draw: (g: Phaser.GameObjects.Graphics) => void) => {
      const g = this.make.graphics({}, false);
      draw(g);
      g.generateTexture(key, w, h);
      g.destroy();
    };
    const post = (g: Phaser.GameObjects.Graphics) => {
      g.fillStyle(palette.wood).fillRect(T / 2 - 7, 6, 14, 52);
      g.lineStyle(2, palette.ink).strokeRect(T / 2 - 7, 6, 14, 52);
    };
    bake(TEX.fenceH, T, T, (g) => {
      g.fillStyle(palette.earth).fillRect(0, 22, T, 8).fillRect(0, 40, T, 8); // 2 thanh ngang
      post(g);
    });
    bake(TEX.fenceV, T, T, (g) => {
      g.fillStyle(palette.earth).fillRect(24, 0, 8, T).fillRect(36, 0, 8, T); // 2 thanh dọc
      post(g);
    });
    // Một ô tường: mặt trên (đỉnh tường) cao T, mặt trước WALL_LIFT bên dưới.
    bake(TEX.wall, T, T + WALL_LIFT, (g) => {
      g.fillStyle(palette.earth).fillRect(0, 0, T, T);
      g.fillStyle(palette.wood).fillRect(0, T, T, WALL_LIFT);
      g.lineStyle(3, palette.ink).lineBetween(0, 1.5, T, 1.5).lineBetween(0, T + WALL_LIFT - 1.5, T, T + WALL_LIFT - 1.5);
      g.lineStyle(2, palette.ink, 0.6).lineBetween(0, T, T, T);
      g.lineStyle(2, palette.ink, 0.25).lineBetween(1, 0, 1, T + WALL_LIFT);
    });
    const tr = TREE_TEX;
    bake(TEX.tree, tr.w, tr.h, (g) => {
      const cx = tr.w / 2;
      const by = tr.baseY;
      g.fillStyle(palette.earth).fillRect(cx - 12, by - 56, 24, 56);
      g.lineStyle(3, palette.ink).strokeRect(cx - 12, by - 56, 24, 56);
      // Tán: 3 vòng xanh đồng thẫm + điểm sáng xanh mạ.
      const crown: [number, number, number][] = [
        [cx - 30, by - 96, 40],
        [cx + 30, by - 96, 40],
        [cx, by - 128, 46],
      ];
      // Tô vòng mực to hơn trước rồi tô xanh đè lên → viền chỉ còn ở mép ngoài, không vẽ chồng bên trong.
      g.fillStyle(palette.ink);
      for (const [x, y, r] of crown) g.fillCircle(x, y, r + 3);
      g.fillStyle(palette.jade);
      for (const [x, y, r] of crown) g.fillCircle(x, y, r);
      g.fillStyle(palette.sprout, 0.9).fillCircle(cx - 14, by - 138, 16).fillCircle(cx + 26, by - 104, 10);
    });
    const b = L.bed;
    bake(TEX.bed, b.w * T, b.h * T + 16, (g) => {
      g.fillStyle(palette.earth).fillRoundedRect(4, 2, b.w * T - 8, b.h * T + 6, 8);
      g.fillStyle(palette.paper).fillRoundedRect(10, 8, b.w * T - 20, b.h * T - 8, 6);
      g.fillStyle(palette.vermilion).fillRoundedRect(14, 12, 34, b.h * T - 16, 6);
      g.lineStyle(3, palette.ink).strokeRoundedRect(4, 2, b.w * T - 8, b.h * T + 6, 8);
    });
    const p = L.pond;
    const pw = p.w * T;
    const ph = p.h * T;
    bake(TEX.pond, pw, ph, (g) => {
      g.fillStyle(palette.water).fillRoundedRect(2, 2, pw - 4, ph - 4, 28);
      g.fillStyle(palette.indigo, 0.55).fillRoundedRect(40, 36, pw - 80, ph - 72, 22);
      g.lineStyle(4, palette.ink).strokeRoundedRect(2, 2, pw - 4, ph - 4, 28);
      g.lineStyle(2, palette.paper, 0.6).lineBetween(70, 60, 130, 60).lineBetween(220, 200, 300, 200);
    });
  }

  // ---------------------------------------------------------------- nhân vật

  private buildPlayer(): void {
    const [fw, fh] = gameConfig.playerFootHitbox;
    const x = L.spawn.x * T;
    const y = L.spawn.y * T;
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
    const dt = delta / 1000;
    const speed = gameConfig.walkSpeed * T;
    const wantDir = this.controls.moveDirection();
    const wantsToMove = wantDir.x !== 0 || wantDir.y !== 0;
    // Chạm phím đi (kể cả nhấn + nhả lọt giữa hai frame — BUG-007). Luôn "tiêu thụ" mỗi frame để lần chạm cũ
    // không bỏ dở một lần cuốc sau.
    const tappedMove = this.controls.consumeMovePress();

    // D-022: bấm phím đi khi đang cuốc = BỎ DỞ — dừng ngay, đi được luôn trong frame này. Ô giữ số nhát
    // đã chạm (nhát đang giơ chưa chạm thì không tính), hàng chờ bị xóa.
    if ((wantsToMove || tappedMove) && isBusy(this.action)) this.abandonTill();

    // Khựng hình (nhát cuối): đứng hình cả động tác lẫn bụi trong vài chục mili-giây — cảm giác "chốt".
    const frozen = this.hitStop > 0;
    if (frozen) this.hitStop = Math.max(0, this.hitStop - dt);
    const workDt = frozen ? 0 : dt;

    // T-002: chỉ ô bằng chuột → xin cuốc ô → tiến nhát cuốc đang làm (quay mặt, chạm, xong ô).
    this.updatePointer(dt, wantsToMove);
    this.updateTileAction(workDt);
    // Đang cuốc thì đứng yên (GDD §3.3a) — phím đi đã xử lý ở trên (bỏ dở), nên ở đây busy = không bấm phím.
    const busy = isBusy(this.action);
    const dir = busy ? NO_DIR : wantDir;
    const v = moveVelocity(dir, speed); // đi chéo đã chuẩn hoá, không nhanh hơn đi thẳng
    // Nắn vào cửa: đi thẳng vào tường mà chỉ lệch mép khe ≤ cornerNudgePx → tự trượt ngang vào khe.
    const b = this.feetBody;
    const blockedAhead = (dir.y < 0 && b.blocked.up) || (dir.y > 0 && b.blocked.down) || (dir.x < 0 && b.blocked.left) || (dir.x > 0 && b.blocked.right);
    if (blockedAhead) {
      const nudge = cornerNudge(this.solidGrid, b, dir, T, gameConfig.cornerNudgePx);
      if (nudge.x !== 0) v.x = nudge.x * speed;
      if (nudge.y !== 0) v.y = nudge.y * speed;
    }
    this.feetBody.setVelocity(v.x, v.y);

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
    if (dir.x !== 0) this.lastDirX = dir.x;

    const newFacing = facingFromDirection(dir, this.facing);
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

    // Nhún mỗi nhát cuốc (squash & stretch) nhân với nhịp thở.
    const progress = busy ? this.action.elapsed / this.tillParams.duration : 0;
    actionPose(progress, this.tillParams.impactAt, gameConfig.actionSquash, gameConfig.actionStretch, this.pose);
    this.hero
      .setPosition(fx, footBottom + pose.offsetY)
      .setScale(this.pose.scaleX, pose.scaleY * this.pose.scaleY)
      .setDepth(footBottom);
    this.heroShadow.setPosition(fx, footBottom - 2);

    this.fadeTreesInFront(fx, footBottom);
    this.updateDust(dt);
    this.updateTillDust(workDt);
    this.updateSweat(workDt);
    this.updateTillVisuals(workDt);
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
    // Ảnh 256px gồm 4×4 ô đất; cắt (setCrop) đúng mảnh của ô vừa xong rồi phóng to quanh tâm mảnh đó.
    this.bounceImg = this.add.image(0, 0, DIRT_TEXTURE).setDepth(DEPTH_TILL_MARKS + 1).setVisible(false);
  }

  /**
   * Mỗi frame: tìm ô dưới con trỏ (theo camera — camera chạy thì ô dưới chuột đổi dù chuột đứng yên),
   * kiểm tầm với từ tâm nhân vật, vẽ viền sáng/xám. Click, hoặc giữ chuột rê, trên ô ruộng chưa cuốc / cuốc dở
   * trong tầm → xin cuốc (rảnh thì cuốc ngay, đang cuốc thì vào hàng chờ tối đa tillQueueMax ô).
   * Đang bấm phím đi thì không nhận ô (cuốc là việc đứng yên — D-022).
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
    const pt = this.controls.pointerWorld(this.cameras.main, this.pointerWorldPt);
    const tx = Math.floor(pt.x / T);
    const ty = Math.floor(pt.y / T);
    h.valid = this.controls.isPointerInside() && tx >= 0 && ty >= 0 && tx < L.cols && ty < L.rows;
    if (!h.valid) {
      this.highlight.setVisible(false);
      this.highlightBacking.setVisible(false);
      this.highlightTileKey = -1;
      if (pressed) this.dragKind = null;
      return;
    }
    const c = this.feetBody.center;
    h.x = tx;
    h.y = ty;
    h.inReach = inReach(c.x, c.y, tx, ty, T, gameConfig.interactRange);
    h.tillable = canTill(this.farm, tx, ty);

    this.drawTileHighlight(tx, ty, h.inReach, dt);

    // Một lần giữ chuột = một loại việc, chốt theo ô bấm đầu tiên (GDD §3.3). Bấm vào cỏ → lần rê này không làm gì.
    // (T-003 thêm 'plant' khi bấm vào ô đã cuốc.)
    if (pressed) {
      this.dragKind = h.tillable ? 'till' : null;
      this.dragBlocked = false;
    }
    // Ngoài tầm: click không làm gì (GDD §3.3).
    if ((pressed || held) && this.dragKind === 'till' && !this.dragBlocked && !wantsToMove && h.inReach && h.tillable) {
      // Click ô đang cuốc / đã trong hàng chờ, hoặc hàng chờ đầy → requestTile tự bỏ qua.
      requestTile(this.action, h, this.tillParams);
    }
  }

  /**
   * Vẽ viền ô (tx, ty). Trong tầm: nét trắng điệp dày + lót mực + nền mờ, "thở" (alpha lên xuống) để mắt
   * bắt được ngay. Ngoài tầm: nét xám mảnh, lót nhạt, không nền, đứng yên → khác hẳn ô trong tầm.
   * Chỉ đổi thuộc tính của 2 hình có sẵn — không tạo object mới mỗi frame.
   */
  private drawTileHighlight(tx: number, ty: number, inReachNow: boolean, dt: number): void {
    const key = ty * L.cols + tx;
    if (key !== this.highlightTileKey) {
      this.highlightTileKey = key;
      this.highlightPulseT = 0;
    } else {
      this.highlightPulseT += dt;
    }
    const k = inReachNow ? 0 : 1; // chỉ số [trong tầm, ngoài tầm] trong các mảng config
    // Ô đang cuốc / cuốc dở / trong hàng chờ: bỏ nền phủ trắng (giữ nét viền) để thấy rõ nấc đất + thanh tiến độ.
    const fillAlpha = this.isTillBusyTile(tx, ty) ? 0 : gameConfig.tileHighlightFillAlpha[k];
    const w = gameConfig.tileHighlightWidth[k];
    const outline = gameConfig.tileHighlightOutline[k];
    const x = tx * T + HIGHLIGHT_INSET;
    const y = ty * T + HIGHLIGHT_INSET;
    this.highlightBacking
      .setPosition(x, y)
      .setStrokeStyle(w + outline * 2, palette.ink, gameConfig.tileHighlightOutlineAlpha[k])
      .setVisible(true);
    this.highlight
      .setPosition(x, y)
      .setStrokeStyle(w, inReachNow ? palette.paper : HIGHLIGHT_OUT_HEX, inReachNow ? 1 : HIGHLIGHT_OUT_ALPHA)
      .setFillStyle(palette.paper, fillAlpha)
      .setVisible(true);
    this.highlight.isFilled = fillAlpha > 0;

    const alpha = inReachNow ? pulseAlpha(this.highlightPulseT, gameConfig.tileHighlightPulseRate, gameConfig.tileHighlightPulseMinAlpha) : 1;
    this.highlight.setAlpha(alpha);
    this.highlightBacking.setAlpha(alpha);
  }

  /**
   * Tiến nhát cuốc; phản ứng với các mốc: bắt đầu ô (quay mặt, đứng yên), mỗi nhát chạm (ô thêm 1 nhát + juice),
   * nhát cuối (ô thành đất cuốc + juice "chốt").
   */
  private updateTileAction(dt: number): void {
    const c = this.feetBody.center;
    const n = this.tillTuning.strikesPerPlot;
    // Tới lượt mà ô đã ra ngoài tầm hoặc đã cuốc xong rồi → bỏ, xét ô kế.
    const stillValid = (t: TileXY) =>
      canTill(this.farm, t.x, t.y) && inReach(c.x, c.y, t.x, t.y, T, gameConfig.interactRange);
    // Ô cuốc dở thì chỉ làm số nhát còn lại (vd 4/6 → 2 nhát).
    const strikesFor = (t: TileXY) => strikesRemaining(this.farm, t.x, t.y, n);
    const ev = stepTileAction(this.action, dt, this.tillParams, stillValid, this.actionEvents, strikesFor);

    if (ev.started) {
      // Quay mặt về ô — dùng chung đường xoay khung chéo như khi đi (turnAnim) cho mượt.
      const to = facingToward(c.x, c.y, ev.started.x, ev.started.y, T, this.facing);
      if (to !== this.facing) {
        startTurn(this.turn, this.facing, to, this.lastDirX, TURN_FRAME_SEC);
        this.facing = to;
      }
      // Dừng ngay (vận tốc cũ còn trên body tới bước vật lý kế).
      this.feetBody.setVelocity(0, 0);
    }
    if (ev.impact) {
      const result = strikeTill(this.farm, ev.impact.x, ev.impact.y, n);
      const plot = plotAt(this.farm, ev.impact.x, ev.impact.y);
      if (result !== 'invalid' && plot) {
        const done = result === 'done';
        if (done) {
          this.showTilled(plot);
          // Số nhát bị chỉnh nhỏ đi giữa chừng (QA) → ô xong sớm: không bổ tiếp vào đất đã cuốc.
          if (isBusy(this.action) && this.action.strikesLeft > 1) this.action.strikesLeft = 1;
        }
        this.tillJuice(ev.impact.x, ev.impact.y, plot.tillStrikes, done);
      }
    }
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

  /** Đổi hình ô sang đất đã cuốc: tile đất thử (ghép liền theo mod 4 như cỏ) + bỏ lớp phủ đất khô. */
  private showTilled(plot: FarmPlot): void {
    const local = (plot.y % TILE_TEXTURE_CELLS) * TILE_TEXTURE_CELLS + (plot.x % TILE_TEXTURE_CELLS);
    this.groundLayer.putTileAt(TILES_PER_TEXTURE + local, plot.x, plot.y);
    const i = this.farm.plots.indexOf(plot);
    this.plotTints[i]?.setVisible(false);
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

    const key = TILL_SFX[Math.floor(Math.random() * TILL_SFX.length)];
    if (this.cache.audio.exists(key)) {
      // Nhát thường: lệch cao độ ±1 nửa cung (±100 cent) cho cuốc liền nhiều nhát không nghe "máy móc".
      // Nhát cuối: tạm dùng cùng file nhưng trầm + to hơn làm "tiếng chốt" (chờ audio có tiếng riêng).
      const detune = finish ? gameConfig.tillFinishSfxDetune + (Math.random() - 0.5) * 60 : (Math.random() * 2 - 1) * 100;
      const volume = finish ? Math.min(1, gameConfig.sfxVolume * gameConfig.tillFinishSfxVolumeMultiplier) : gameConfig.sfxVolume;
      this.sound.play(key, { volume, detune });
      this.lastSfx = key;
      this.lastSfxDetune = detune;
      this.lastSfxVolume = volume;
    }
  }

  /** Vài giọt mồ hôi bắn ra từ đầu {ten}, bay chéo lên rồi rơi (hình tròn xanh nhạt, chưa có hình thật). */
  private spawnSweat(): void {
    const headX = this.hero.x;
    const headY = this.hero.y - this.hero.displayHeight * 0.82;
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

  /** Ô vừa cuốc xong "nảy" một nhịp: ảnh đất của đúng ô đó phóng to rồi thu về. */
  private startBounce(tx: number, ty: number): void {
    const cell = TILE_TEXTURE_CELLS;
    const lx = tx % cell;
    const ly = ty % cell;
    const size = cell * T;
    this.bounceImg
      .setCrop(lx * T, ly * T, T, T)
      .setOrigin((lx + 0.5) / cell, (ly + 0.5) / cell)
      .setPosition(tx * T + T / 2, ty * T + T / 2)
      .setDisplaySize(size, size)
      .setVisible(true);
    this.bounceT = gameConfig.tillFinishBounceSeconds;
  }

  /**
   * Mỗi frame: nấc đất + thanh tiến độ của từng ô (chỉ vẽ lại khi đổi), lóe sáng lúc xong ô, ô nảy,
   * số thứ tự trên ô chờ.
   */
  private updateTillVisuals(dt: number): void {
    const n = this.tillTuning.strikesPerPlot;
    const cur = this.action.current;
    for (let i = 0; i < this.farm.plots.length; i++) {
      const plot = this.farm.plots[i];
      const active = cur !== null && cur.x === plot.x && cur.y === plot.y;
      if (this.plotFlash[i] > 0) {
        // Xong ô: thanh đầy lóe trắng điệp rồi mờ tắt.
        this.plotFlash[i] = Math.max(0, this.plotFlash[i] - dt);
        if (this.plotDrawn[i] !== FLASH_SIG) {
          this.drawTillMarks(i, plot, n);
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
        this.drawTillMarks(i, plot, n);
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
      const size = TILE_TEXTURE_CELLS * T * (1 + gameConfig.tillFinishBounceScale * Math.sin(Math.PI * t));
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

  /**
   * Nấc đất cuốc dở, vẽ bằng code (chưa có tile riêng — đề xuất art ở chặng 4):
   * nấc 1 "vỡ cỏ" = vài vệt cuốc trên nền đất khô; nấc 2 "lổn nhổn" = đất nâu lộ gần kín ô + cục đất.
   * Vị trí vệt/cục lấy từ toạ độ ô (giả ngẫu nhiên cố định) → mỗi ô một kiểu nhưng không nhảy giữa các lần vẽ.
   */
  private drawTillMarks(i: number, plot: FarmPlot, n: number): void {
    const g = this.plotMarks[i];
    g.clear();
    if (plot.soil === 'tilled') return;
    const stages = gameConfig.tillVisualStages;
    const stage = tillStage(plot.tillStrikes, n, stages);
    if (stage <= 0) return;
    const x0 = plot.x * T;
    const y0 = plot.y * T;
    let seed = ((plot.x * 73856093) ^ (plot.y * 19349663)) & 0x7fffffff;
    const rand = (): number => {
      // LCG nhỏ — đủ "ngẫu nhiên" cho vài vệt, luôn ra cùng kết quả với cùng ô.
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };
    // Tỷ lệ "đã cuốc" của nấc này (0–1): nấc càng cao đất nâu lộ càng nhiều.
    const k = stage / stages;
    g.fillStyle(palette.earth, 0.25 + 0.5 * k).fillRect(x0 + 3, y0 + 3, T - 6, T - 6);
    // Vệt cuốc: các rãnh ngang ngắn, sẫm.
    const furrows = 2 + Math.round(3 * k);
    g.lineStyle(4, palette.ink, 0.6);
    for (let f = 0; f < furrows; f++) {
      const fy = y0 + 8 + ((f + 0.5) / furrows) * (T - 16) + (rand() - 0.5) * 4;
      const len = T * (0.3 + 0.3 * k + 0.15 * rand());
      const fx = x0 + 6 + rand() * (T - 12 - len);
      g.lineBetween(fx, fy, fx + len, fy + (rand() - 0.5) * 4);
    }
    // Cục đất lổn nhổn (từ nấc thứ 2 trở đi).
    if (stage >= 2) {
      const clods = 4 + Math.round(4 * k);
      for (let c = 0; c < clods; c++) {
        const cx = x0 + 9 + rand() * (T - 18);
        const cy = y0 + 9 + rand() * (T - 18);
        const r = 3 + rand() * 3;
        g.fillStyle(palette.ink, 0.5).fillCircle(cx + 1, cy + 1.5, r);
        g.fillStyle(palette.wood, 0.95).fillCircle(cx, cy, r);
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
   * 1. Đang xoay → khung chéo (anim đi tạm dừng; vật lý vẫn chạy bình thường — chỉ đổi hình).
   * 2. Đang đi → anim bước đúng hướng, tốc độ khung theo tốc độ thật; xoay xong thì vào khung đầu.
   * 3. Đứng → ảnh chống nạnh.
   */
  private updateHeroAnim(timeScale: number): void {
    const anims = this.hero.anims;
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
  }

  /**
   * Nhạc nền Vườn, lặp. Trình duyệt chỉ cho phát tiếng sau lần bấm phím/chuột đầu tiên → nếu âm thanh
   * còn khóa thì chờ UNLOCKED (Phaser tự mở khóa ở lần bấm đầu, kể cả phím WASD). Không phát chồng
   * khi vào lại Vườn.
   */
  private startMusic(): void {
    const play = (): void => {
      if (this.sound.get('music-vuon')?.isPlaying) return;
      this.sound.play('music-vuon', { loop: true, volume: gameConfig.musicVolume });
    };
    if (this.sound.locked) this.sound.once(Phaser.Sound.Events.UNLOCKED, play);
    else play();
  }

  /**
   * Đứng sau cây thì tán che người (đúng lớp) nhưng mờ đi để vẫn thấy {ten} — không bị "mất" nhân vật.
   * Chỉ 12 cây nên duyệt hết mỗi frame là đủ nhẹ.
   */
  private fadeTreesInFront(fx: number, footBottom: number): void {
    const halfW = TREE_TEX.w / 2;
    for (const tree of this.trees) {
      const behind =
        footBottom < tree.y && footBottom > tree.y - TREE_TEX.baseY + 24 && Math.abs(fx - tree.x) < halfW;
      tree.setAlpha(behind ? gameConfig.treeFadeAlpha : 1);
    }
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
      view: { x: cam.worldView.x, y: cam.worldView.y, w: cam.worldView.width, h: cam.worldView.height },
      zoom: cam.zoom,
      mapPx: { w: L.cols * T, h: L.rows * T },
      farm: { plots: this.farm.plots.map((p) => ({ ...p })), tilled: tilledCount(this.farm) },
      hover: this.hover.valid
        ? {
            x: this.hover.x,
            y: this.hover.y,
            inReach: this.hover.inReach,
            tillable: this.hover.tillable,
            highlight: this.hover.inReach ? 'bright' : 'gray',
            alpha: this.highlight.alpha,
          }
        : null,
      action: {
        busy: isBusy(this.action),
        current: this.action.current ? { ...this.action.current } : null,
        progress: this.action.current ? this.action.elapsed / this.tillParams.duration : 0,
        queued: this.action.queue.length,
        queue: this.action.queue.map((q) => ({ x: q.x, y: q.y })),
        strikesLeft: this.action.strikesLeft,
        strikesDone: this.action.strikesDone,
        dragKind: this.dragKind,
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
      },
    };
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
