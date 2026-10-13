// Preload: tải mọi asset trong config/assets.ts, vẽ thanh tiến độ, xong thì sang Vườn
// (hoặc Sandbox nếu địa chỉ có ?scene=sandbox).
import Phaser from 'phaser';
import { actionSpritesheets, audio, HERO_ACTION_FRAME, HERO_FRAME, images, spritesheets } from '../config/assets';
import { gameConfig } from '../config/gameConfig';
import { palette } from '../config/palette';
import { textStyles } from '../config/theme';
import { startSceneFromSearch } from '../utils/sceneSelect';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  preload(): void {
    const { gameWidth: w, gameHeight: h } = gameConfig;
    const barW = 640;
    const barH = 28;
    const x = (w - barW) / 2;
    const y = h / 2;

    this.add.text(w / 2, y - 60, 'Đang tải…', textStyles.subtitle).setOrigin(0.5);
    this.add.rectangle(x, y, barW, barH, palette.earth).setOrigin(0, 0.5).setStrokeStyle(4, palette.ink);
    const fill = this.add.rectangle(x, y, 0, barH, palette.gold).setOrigin(0, 0.5);
    this.load.on(Phaser.Loader.Events.PROGRESS, (p: number) => {
      fill.width = barW * p;
    });
    // Lỗi tải asset: ghi cảnh báo (không chặn game) để QA thấy file nào thiếu.
    this.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, (file: Phaser.Loader.File) => {
      console.warn(`[Preload] Không tải được ${file.key} (${String(file.url)})`);
    });

    for (const [key, url] of Object.entries(images)) this.load.image(key, url);
    // Spritesheet: Phaser tự cắt dải ảnh thành các khung đánh số 0, 1, 2, 3.
    const frame = { frameWidth: HERO_FRAME.width, frameHeight: HERO_FRAME.height };
    for (const [key, url] of Object.entries(spritesheets)) this.load.spritesheet(key, url, frame);
    // Động tác (cuốc…): khung to hơn 128×128 — cắt theo khung riêng.
    const actionFrame = { frameWidth: HERO_ACTION_FRAME.width, frameHeight: HERO_ACTION_FRAME.height };
    for (const [key, url] of Object.entries(actionSpritesheets)) this.load.spritesheet(key, url, actionFrame);
    // Phaser chọn định dạng đầu tiên trình duyệt hỗ trợ: OGG (Chrome/Edge/Firefox), MP3 (Safari).
    for (const [key, base] of Object.entries(audio)) this.load.audio(key, [`${base}.ogg`, `${base}.mp3`]);
  }

  create(): void {
    this.scene.start(startSceneFromSearch(window.location.search));
  }
}
