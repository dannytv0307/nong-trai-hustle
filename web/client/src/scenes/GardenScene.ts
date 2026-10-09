// Vườn thử (T-001): bản đồ 48×32 ô dựng bằng code, nhân vật {ten} đi WASD có va chạm
// (Arcade Physics), camera bám theo trong biên bản đồ, hoạt ảnh đi bằng code (D-020).
// Nhà, cây, ao, rào là hình khối màu theo palette (chưa có asset thật).
import Phaser from 'phaser';
import { heroTextureKey, heroWalkKey, HERO_WALK_FRAME } from '../config/assets';
import { gameConfig } from '../config/gameConfig';
import { palette } from '../config/palette';
import { textStyles } from '../config/theme';
import { InputController } from '../input/InputController';
import { gardenLayout as L, houseWallRects, fenceRects, tileOf, type TileRect } from '../systems/garden';
import { facingFromDirection, moveVelocity, type Facing } from '../systems/movement';
import {
  createWalkAnimState,
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
  turnSeconds: gameConfig.turnFlipSeconds,
  turnSquash: gameConfig.turnFlipSquash,
  dustEverySteps: gameConfig.walkDustEverySteps,
  upBobPx: gameConfig.walkUpBobPx,
};

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
  /** Texture sprite đang dùng: `hero-t1-<hướng>` (đứng) hoặc `hero-t1-walk-<hướng>` (đi). */
  textureKey: string;
  /** Anim đi: key, khung (0..3), có đang chạy, hệ số tốc độ khung. */
  anim: { key: string | null; frame: number; playing: boolean; timeScale: number };
  /** Vùng thế giới camera đang thấy (px). */
  view: { x: number; y: number; w: number; h: number };
  zoom: number;
  mapPx: { w: number; h: number };
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

    this.physics.world.setBounds(0, 0, mapW, mapH);
    this.physics.add.collider(this.feet, solids);
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
        row.push(inRect(x, y, L.plots) ? TILES_PER_TEXTURE + local : local);
      }
      data.push(row);
    }
    const map = this.make.tilemap({ data, tileWidth: T, tileHeight: T });
    const grass = map.addTilesetImage('grass', 'tile-grass-test', T, T, 0, 0, 0);
    const dirt = map.addTilesetImage('dirt', 'tile-dirt-test', T, T, 0, 0, TILES_PER_TEXTURE);
    if (!grass || !dirt) throw new Error('Không tạo được tileset thử — kiểm tra tile-grass-test/tile-dirt-test');
    map.createLayer(0, [grass, dirt], 0, 0)?.setDepth(DEPTH_GROUND);

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

  /** Vẽ nhà, giường, ao, cây, rào và tạo hộp va chạm tĩnh cho chúng. Trả về danh sách hộp. */
  private buildObstacles(): Phaser.GameObjects.Zone[] {
    const solids: Phaser.GameObjects.Zone[] = [];
    const addSolid = (x: number, y: number, w: number, h: number) => {
      const z = this.add.zone(x + w / 2, y + h / 2, w, h);
      this.physics.add.existing(z, true); // true = static: đứng yên, không bị đẩy
      solids.push(z);
    };

    // Rào quanh mép: va chạm theo cả cạnh (khối liền → trượt dọc không vấp), vẽ từng ô.
    for (const r of fenceRects(L.cols, L.rows)) {
      addSolid(r.x * T, r.y * T, r.w * T, r.h * T);
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
      addSolid(r.x * T, r.y * T, r.w * T, r.h * T);
      // Vẽ từng ô một, mỗi ô depth riêng = đáy ô → đi cạnh tường dọc vẫn đúng lớp trước/sau.
      for (let ty = r.y; ty < r.y + r.h; ty++) {
        for (let tx = r.x; tx < r.x + r.w; tx++) {
          this.add.image(tx * T, (ty + 1) * T, TEX.wall).setOrigin(0, 1).setDepth((ty + 1) * T);
        }
      }
    }

    // Giường trong nhà.
    const b = L.bed;
    addSolid(b.x * T, b.y * T, b.w * T, b.h * T);
    this.add.image(b.x * T, b.y * T - 12, TEX.bed).setOrigin(0).setDepth((b.y + b.h) * T);

    // Ao nước: nằm sát đất, chặn cả khối.
    const p = L.pond;
    addSolid(p.x * T, p.y * T, p.w * T, p.h * T);
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
    // Đứng: ảnh chống nạnh (hero-t1-<hướng>). Đi: anim 4 khung (hero-t1-walk-<hướng>).
    this.hero = this.add.sprite(x, y + fh / 2, heroTextureKey(1, this.facing)).setOrigin(0.5, 1);
    this.createWalkAnims();
    // Mỗi lần anim đổi khung: khung 0, 2 = gót chạm đất → bụi chân; đi lên thì nhích 1px.
    this.hero.on(Phaser.Animations.Events.ANIMATION_UPDATE, this.handleWalkFrame, this);
    this.hero.on(Phaser.Animations.Events.ANIMATION_START, this.handleWalkFrame, this);
  }

  /** 4 animation đi (một cho mỗi hướng), khung 0-1-2-3 lặp. Chỉ tạo một lần cho cả game. */
  private createWalkAnims(): void {
    for (const facing of ['down', 'up', 'left', 'right'] as const) {
      const key = heroWalkKey(1, facing);
      if (this.anims.exists(key)) continue;
      this.anims.create({
        key,
        frames: this.anims.generateFrameNumbers(key, { start: 0, end: HERO_WALK_FRAME.count - 1 }),
        frameRate: gameConfig.walkFrameRate,
        repeat: -1,
      });
    }
  }

  private handleWalkFrame(_anim: Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame): void {
    const index = Number(frame.textureFrame);
    const event = onWalkFrame(this.walk, index, this.facing === 'up', WALK_PARAMS);
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

    const dir = this.controls.moveDirection();
    const v = moveVelocity(dir, speed); // đi chéo đã chuẩn hoá, không nhanh hơn đi thẳng
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
    const turned = newFacing !== this.facing;
    if (turned) this.facing = newFacing;

    stepWalkAnim(this.walk, { speedRatio: this.speedRatio, turned }, dt, WALK_PARAMS);
    this.updateHeroAnim(walkTimeScale(this.speedRatio), turned);
    const pose = this.walk.pose;
    const footBottom = this.feetBody.bottom;

    this.hero
      .setPosition(fx, footBottom + pose.offsetY)
      .setScale(pose.scaleX, pose.scaleY)
      .setDepth(footBottom);
    this.heroShadow.setPosition(fx, footBottom - 2);

    this.fadeTreesInFront(fx, footBottom);
    this.updateDust(dt);
  }

  /** Đang đi → chạy anim đúng hướng với tốc độ khung theo tốc độ thật; dừng → về ảnh đứng. */
  private updateHeroAnim(timeScale: number, turned: boolean): void {
    const anims = this.hero.anims;
    if (timeScale > 0) {
      const key = heroWalkKey(1, this.facing);
      if (!anims.isPlaying || anims.currentAnim?.key !== key) {
        // Đổi hướng giữa chừng: giữ nguyên khung đang bước cho liền nhịp chân.
        const startFrame = anims.isPlaying ? (anims.currentFrame?.index ?? 1) - 1 : 0;
        this.hero.play({ key, startFrame });
      }
      anims.timeScale = timeScale;
    } else if (anims.isPlaying) {
      anims.stop();
      this.hero.setTexture(heroTextureKey(1, this.facing));
    } else if (turned) {
      this.hero.setTexture(heroTextureKey(1, this.facing));
    }
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
        frame: Number(this.hero?.anims.currentFrame?.textureFrame ?? -1),
        playing: this.hero?.anims.isPlaying ?? false,
        timeScale: this.hero?.anims.timeScale ?? 0,
      },
      view: { x: cam.worldView.x, y: cam.worldView.y, w: cam.worldView.width, h: cam.worldView.height },
      zoom: cam.zoom,
      mapPx: { w: L.cols * T, h: L.rows * T },
    };
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

function inRect(x: number, y: number, r: TileRect): boolean {
  return x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h;
}
