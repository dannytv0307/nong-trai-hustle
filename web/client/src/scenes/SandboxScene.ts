// Sandbox: màn thử của bước 3.1 — kiểm tra project chạy đúng trước khi làm gameplay thật.
// Hiện: nền cỏ ghép từ tile thử (Tilemap), ô ruộng 3×3, nhân vật {ten} bậc 1 đi bằng WASD,
// tên game (tiếng Việt có dấu), đồng hồ ngày chạy thật, 4 bậc ngoại hình + 1 chân dung,
// trạng thái kết nối server. Click lần đầu → nhạc Vườn; Space → tiếng nhặt xu.
import Phaser from 'phaser';
import { heroTextureKey } from '../config/assets';
import { gameConfig } from '../config/gameConfig';
import { cssColor, palette } from '../config/palette';
import { textStyles } from '../config/theme';
import { InputController } from '../input/InputController';
import { getHealth } from '../net/api';
import { facingFromDirection, moveVelocity, type Facing } from '../systems/movement';
import { formatClock, realSecondsToGameHour } from '../systems/time';
import { fillPlayerName } from '../utils/text';

/** Mỗi ảnh tile thử 256×256 = 4×4 ô 64px (Art Bible §9.1). */
const TILE_TEXTURE_CELLS = 4;
const TILES_PER_TEXTURE = TILE_TEXTURE_CELLS * TILE_TEXTURE_CELLS;

export type ServerStatus = 'checking' | 'online' | 'offline';

export class SandboxScene extends Phaser.Scene {
  private controls!: InputController;
  private hero!: Phaser.GameObjects.Image;
  private nameTag!: Phaser.GameObjects.Text;
  private clockText!: Phaser.GameObjects.Text;
  private serverText!: Phaser.GameObjects.Text;
  private facing: Facing = 'down';
  private mapWidthPx = 0;
  private mapHeightPx = 0;
  /** Giây thật đã trôi trong ngày (đồng hồ ngày, GDD §3.1). */
  private dayElapsedSeconds = 0;

  // Trạng thái công khai cho QA đọc qua window.__game.scene.getScene('Sandbox')
  musicStarted = false;
  coinSfxCount = 0;
  serverStatus: ServerStatus = 'checking';

  constructor() {
    super('Sandbox');
  }

  create(): void {
    this.controls = new InputController(this);
    this.buildGround();
    this.buildHero();
    this.buildUi();
    this.setupAudio();
    void this.checkServer();

    // Đánh dấu sẵn sàng cho Playwright/QA (chờ cờ này thay vì chờ thời gian cố định).
    this.registry.set('sandboxReady', true);
  }

  /** Nền: Tilemap tạo bằng code (chưa có bản đồ Tiled). Cỏ khắp nơi + 1 mảnh ruộng 3×3. */
  private buildGround(): void {
    const t = gameConfig.tileSize;
    const cols = Math.ceil(gameConfig.gameWidth / t); // 30
    const rows = Math.ceil(gameConfig.gameHeight / t); // 17
    const plotSide = Math.round(Math.sqrt(gameConfig.startPlots)); // 3
    const plotX0 = Math.floor(cols / 2) - plotSide - 2;
    const plotY0 = Math.floor(rows / 2);

    // Chỉ số ô: cỏ dùng 0..15, đất dùng 16..31. Lấy ô theo (x mod 4, y mod 4) để 16 mảnh
    // của ảnh 256px ghép lại liền mạch như ảnh gốc lặp lại.
    const data: number[][] = [];
    for (let y = 0; y < rows; y++) {
      const row: number[] = [];
      for (let x = 0; x < cols; x++) {
        const local = (y % TILE_TEXTURE_CELLS) * TILE_TEXTURE_CELLS + (x % TILE_TEXTURE_CELLS);
        const inPlot = x >= plotX0 && x < plotX0 + plotSide && y >= plotY0 && y < plotY0 + plotSide;
        row.push(inPlot ? TILES_PER_TEXTURE + local : local);
      }
      data.push(row);
    }

    const map = this.make.tilemap({ data, tileWidth: t, tileHeight: t });
    const grass = map.addTilesetImage('grass', 'tile-grass-test', t, t, 0, 0, 0);
    const dirt = map.addTilesetImage('dirt', 'tile-dirt-test', t, t, 0, 0, TILES_PER_TEXTURE);
    if (!grass || !dirt) throw new Error('Không tạo được tileset thử — kiểm tra tile-grass-test/tile-dirt-test');
    map.createLayer(0, [grass, dirt], 0, 0)?.setDepth(-1000);

    this.mapWidthPx = map.widthInPixels;
    this.mapHeightPx = map.heightInPixels;
    this.cameras.main.setBounds(0, 0, this.mapWidthPx, this.mapHeightPx);

    // Viền mực quanh ruộng cho dễ thấy ranh giới (placeholder, sau này là tile viền).
    this.add
      .rectangle(plotX0 * t, plotY0 * t, plotSide * t, plotSide * t)
      .setOrigin(0)
      .setStrokeStyle(3, palette.ink, 0.6)
      .setDepth(-999);
  }

  private buildHero(): void {
    const { gameWidth: w, gameHeight: h } = gameConfig;
    // Gốc tọa độ ở chân (0.5, 1) để sắp lớp theo trục Y đúng (depth = y, GDD §12).
    this.hero = this.add.image(w / 2, h / 2 + 96, heroTextureKey(1, this.facing)).setOrigin(0.5, 1);
    this.hero.setDepth(this.hero.y);
    const name = fillPlayerName('{ten}', gameConfig.defaultPlayerName);
    this.nameTag = this.add.text(this.hero.x, this.hero.y - 104, name, textStyles.nameTag).setOrigin(0.5, 1);
  }

  private buildUi(): void {
    const { gameWidth: w, gameHeight: h } = gameConfig;
    const ui = 10_000; // UI luôn vẽ trên cùng

    this.add.text(w / 2, 70, 'Bride Price Hustle', textStyles.title).setOrigin(0.5, 0).setDepth(ui);
    this.add
      .text(w / 2, 175, 'Làng Lầy Cưới Vợ — sân thử', textStyles.subtitle)
      .setOrigin(0.5, 0)
      .setDepth(ui);

    // Góc trên phải: đồng hồ ngày (GDD §11) — chạy theo giây thật, 600 giây = 6h→24h.
    this.clockText = this.add.text(w - 40, 32, '', textStyles.subtitle).setOrigin(1, 0).setDepth(ui);

    // Góc trên trái: trạng thái kết nối server.
    this.serverText = this.add.text(40, 32, '', textStyles.body).setOrigin(0, 0).setDepth(ui);
    this.renderServerStatus();

    // Góc dưới phải: gợi ý phím.
    this.add
      .text(w - 40, h - 32, 'WASD: đi · Click: bật nhạc · Space: tiếng xu', textStyles.body)
      .setOrigin(1, 1)
      .setDepth(ui);

    // Bên phải: 4 bậc ngoại hình (D-015) để duyệt asset.
    const tierNames = ['Nghèo kiết xác', 'Bình thường', 'Khá giả', 'Phú ông'];
    const startX = w - 560;
    tierNames.forEach((label, i) => {
      const x = startX + i * 140;
      const y = h - 220;
      this.add.image(x, y, `hero-tier${i + 1}-down`).setOrigin(0.5, 1).setDepth(ui);
      this.add
        .text(x, y + 8, label, { ...textStyles.body, fontSize: '20px', strokeThickness: 5 })
        .setOrigin(0.5, 0)
        .setDepth(ui);
    });

    // Bên trái: một chân dung thoại trong khung giấy điệp.
    const px = 230;
    const py = h - 250;
    this.add.rectangle(px, py, 300, 300, palette.paper).setStrokeStyle(6, palette.ink).setDepth(ui);
    this.add.image(px, py, 'portrait-hero-smirk').setDisplaySize(280, 280).setDepth(ui);
  }

  /** Chính sách autoplay: trình duyệt chỉ cho phát tiếng sau tương tác đầu tiên của người chơi. */
  private setupAudio(): void {
    this.input.once(Phaser.Input.Events.POINTER_DOWN, () => {
      if (this.sound.locked) this.sound.once(Phaser.Sound.Events.UNLOCKED, () => this.startMusic());
      else this.startMusic();
    });
  }

  private startMusic(): void {
    if (this.musicStarted) return;
    this.sound.play('music-vuon', { loop: true, volume: gameConfig.musicVolume });
    this.musicStarted = true;
  }

  private playCoin(): void {
    // 2 biến thể ngẫu nhiên để tiếng lặp lại không nhàm (audio-list AUD-SFX-002).
    const key = Phaser.Math.Between(1, 2) === 1 ? 'sfx-nhat-xu-1' : 'sfx-nhat-xu-2';
    this.sound.play(key, { volume: gameConfig.sfxVolume });
    this.coinSfxCount++;
  }

  private async checkServer(): Promise<void> {
    const res = await getHealth();
    this.serverStatus = res.ok && res.data.ok ? 'online' : 'offline';
    // Scene có thể đã tắt khi request trả về.
    if (this.sys.isActive()) this.renderServerStatus();
  }

  private renderServerStatus(): void {
    // Chữ sáng viền mực để đọc được trên nền cỏ; offline tô vàng cho dễ để ý.
    const labels: Record<ServerStatus, [string, string]> = {
      checking: ['Server: đang kiểm tra…', cssColor('paper')],
      online: ['Server: đã kết nối ✓', cssColor('paper')],
      offline: ['Server: chưa chạy (chơi offline)', cssColor('gold')],
    };
    const [text, color] = labels[this.serverStatus];
    this.serverText.setText(text).setColor(color);
  }

  /**
   * Game loop: Phaser gọi update ~60 lần/giây. `delta` = số mili-giây từ frame trước,
   * nhân tốc độ với delta để nhân vật đi cùng tốc độ dù máy chạy 30 hay 144 FPS.
   */
  override update(_time: number, delta: number): void {
    const dt = delta / 1000;

    // Đồng hồ ngày
    this.dayElapsedSeconds += dt;
    this.clockText.setText(`Ngày 1 · ${formatClock(realSecondsToGameHour(this.dayElapsedSeconds, gameConfig))}`);

    // Đi lại 8 hướng
    const dir = this.controls.moveDirection();
    const v = moveVelocity(dir, gameConfig.walkSpeed * gameConfig.tileSize);
    const halfW = this.hero.displayWidth / 2;
    this.hero.x = Phaser.Math.Clamp(this.hero.x + v.x * dt, halfW, this.mapWidthPx - halfW);
    this.hero.y = Phaser.Math.Clamp(this.hero.y + v.y * dt, this.hero.displayHeight, this.mapHeightPx);
    const newFacing = facingFromDirection(dir, this.facing);
    if (newFacing !== this.facing) {
      this.facing = newFacing;
      this.hero.setTexture(heroTextureKey(1, newFacing));
    }
    this.hero.setDepth(this.hero.y);
    this.nameTag.setPosition(this.hero.x, this.hero.y - 104).setDepth(this.hero.y + 1);

    if (this.controls.justPressed('confirm')) this.playCoin();
  }
}
