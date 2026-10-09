// Boot: scene đầu tiên, chạy ngay. Chỉ làm việc tối thiểu (chưa tải asset nặng) rồi sang Preload.
// Về sau: đọc cài đặt từ localStorage, kiểm tra đăng nhập...
import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create(): void {
    this.scene.start('Preload');
  }
}
