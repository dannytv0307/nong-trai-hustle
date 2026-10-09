// Điểm vào của game: tạo Phaser.Game với cấu hình màn hình và danh sách scene.
import Phaser from 'phaser';
import { gameConfig } from './config/gameConfig';
import { palette } from './config/palette';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { SandboxScene } from './scenes/SandboxScene';

declare global {
  interface Window {
    /** Debug hook cho QA/Playwright: truy cập game đang chạy. */
    __game?: Phaser.Game;
  }
}

const game = new Phaser.Game({
  type: Phaser.AUTO, // WebGL, tự lùi về Canvas nếu máy không hỗ trợ (GDD §12)
  parent: 'game',
  width: gameConfig.gameWidth,
  height: gameConfig.gameHeight,
  backgroundColor: palette.ink,
  // Art Bible: Đông Hồ (không phải pixel art) → giữ khử răng cưa. Làm tròn tọa độ cho nét sắc.
  pixelArt: false,
  roundPixels: true,
  scale: {
    // Co theo cửa sổ, giữ 16:9 (thừa thì viền tối), căn giữa (GDD §11)
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, PreloadScene, SandboxScene],
});

window.__game = game;
