// HUD của Vườn: scene chạy song song, vẽ đè lên GardenScene. Tách riêng vì camera Vườn
// được phóng to (cameraZoom) — chữ UI để ở scene này thì không bị phóng/nhòe theo.
// Các task sau (đồng hồ T-005, hotbar T-003, thanh Sức T-004) sẽ thêm vào đây.
import Phaser from 'phaser';
import { gameConfig } from '../config/gameConfig';
import { textStyles } from '../config/theme';

export class GardenHudScene extends Phaser.Scene {
  constructor() {
    super('GardenHud');
  }

  create(): void {
    const { gameWidth: w, gameHeight: h } = gameConfig;
    // Góc dưới phải: gợi ý phím (T-001, T-002). T-005 thay bằng dòng đầy đủ.
    this.add.text(w - 40, h - 32, 'WASD: đi (đang cuốc thì bỏ dở) · Click: cuốc · Giữ chuột rê: xếp hàng', textStyles.body).setOrigin(1, 1);
  }
}
