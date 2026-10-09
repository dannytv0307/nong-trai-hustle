// Lớp "action" bọc bàn phím/chuột của Phaser (GDD §4). Gameplay chỉ hỏi theo TÊN hành động
// (moveUp, interact, openBag...), không đọc phím trực tiếp — sau này thêm gamepad/màn cảm ứng
// hay cho đổi phím chỉ cần sửa file này.
import Phaser from 'phaser';
import type { Vec2 } from '../systems/movement';

export type Action =
  | 'moveUp'
  | 'moveDown'
  | 'moveLeft'
  | 'moveRight'
  | 'interact' // F
  | 'openBag' // E hoặc Tab
  | 'openQuests' // Q
  | 'menu' // Esc
  | 'confirm'; // Space

const KC = Phaser.Input.Keyboard.KeyCodes;

/** Bảng phím mặc định: mỗi hành động có thể có nhiều phím. */
const DEFAULT_BINDINGS: Record<Action, number[]> = {
  moveUp: [KC.W, KC.UP],
  moveDown: [KC.S, KC.DOWN],
  moveLeft: [KC.A, KC.LEFT],
  moveRight: [KC.D, KC.RIGHT],
  interact: [KC.F],
  openBag: [KC.E, KC.TAB],
  openQuests: [KC.Q],
  menu: [KC.ESC],
  confirm: [KC.SPACE],
};

const HOTBAR_KEYS = [KC.ONE, KC.TWO, KC.THREE, KC.FOUR, KC.FIVE, KC.SIX, KC.SEVEN, KC.EIGHT, KC.NINE];

export class InputController {
  private readonly keys = new Map<Action, Phaser.Input.Keyboard.Key[]>();
  private readonly hotbarKeys: Phaser.Input.Keyboard.Key[];

  constructor(scene: Phaser.Scene) {
    const kb = scene.input.keyboard;
    if (!kb) throw new Error('InputController cần bàn phím (input.keyboard đang tắt)');
    for (const [action, codes] of Object.entries(DEFAULT_BINDINGS) as [Action, number[]][]) {
      // enableCapture = true: chặn hành vi mặc định của trình duyệt (Space cuộn trang, Tab đổi ô).
      this.keys.set(action, codes.map((c) => kb.addKey(c, true)));
    }
    this.hotbarKeys = HOTBAR_KEYS.map((c) => kb.addKey(c, true));
    // Chuột phải dùng để ăn (GDD §4) → tắt menu chuột phải của trình duyệt.
    scene.input.mouse?.disableContextMenu();
  }

  /** Hành động đang được giữ. */
  isDown(action: Action): boolean {
    return this.keys.get(action)?.some((k) => k.isDown) ?? false;
  }

  /**
   * Hành động vừa được nhấn ở frame này (true đúng một lần mỗi lần nhấn).
   * Chỉ gọi một lần cho mỗi action mỗi frame (JustDown "tiêu thụ" lần nhấn).
   */
  justPressed(action: Action): boolean {
    let pressed = false;
    // Không dùng .some() để mọi phím của action đều được "tiêu thụ" cùng lúc.
    for (const k of this.keys.get(action) ?? []) {
      if (Phaser.Input.Keyboard.JustDown(k)) pressed = true;
    }
    return pressed;
  }

  /** Hướng đi từ WASD/mũi tên: mỗi trục -1, 0 hoặc 1 (y dương = xuống). */
  moveDirection(): Vec2 {
    return {
      x: (this.isDown('moveRight') ? 1 : 0) - (this.isDown('moveLeft') ? 1 : 0),
      y: (this.isDown('moveDown') ? 1 : 0) - (this.isDown('moveUp') ? 1 : 0),
    };
  }

  /** Ô hotbar vừa chọn bằng phím 1–9 (đếm từ 0), hoặc null. */
  hotbarPressed(): number | null {
    let index: number | null = null;
    this.hotbarKeys.forEach((k, i) => {
      if (Phaser.Input.Keyboard.JustDown(k)) index = i;
    });
    return index;
  }
}
