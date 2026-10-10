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
  private readonly input: Phaser.Input.InputPlugin;
  /**
   * Con trỏ đang nằm trên khung game (ra ngoài canvas thì ẩn viền ô). Bắt đầu là false: con trỏ
   * Phaser mặc định ở (0,0) nên chưa rê chuột lần nào thì không được vẽ viền ở góc màn (BUG-004).
   */
  private pointerInside = false;
  /**
   * Đã bấm chuột trái từ lần hỏi trước chưa. Ghi theo SỰ KIỆN chứ không đọc trạng thái nút mỗi frame:
   * click nhanh (nhấn + nhả lọt giữa hai frame) vẫn không bị mất.
   */
  private primaryPressed = false;
  /**
   * Đã nhấn một phím đi (WASD/mũi tên) từ lần hỏi trước chưa — cũng ghi theo SỰ KIỆN keydown: chạm phím cực nhanh
   * (nhấn + nhả lọt giữa hai frame, dễ gặp khi FPS thấp) vẫn được tính, để "bấm phím đi = bỏ dở cuốc" không trượt (BUG-007).
   */
  private movePressed = false;

  constructor(scene: Phaser.Scene) {
    const kb = scene.input.keyboard;
    if (!kb) throw new Error('InputController cần bàn phím (input.keyboard đang tắt)');
    for (const [action, codes] of Object.entries(DEFAULT_BINDINGS) as [Action, number[]][]) {
      // enableCapture = true: chặn hành vi mặc định của trình duyệt (Space cuộn trang, Tab đổi ô).
      this.keys.set(action, codes.map((c) => kb.addKey(c, true)));
    }
    this.hotbarKeys = HOTBAR_KEYS.map((c) => kb.addKey(c, true));
    const moveCodes = new Set<number>(
      (['moveUp', 'moveDown', 'moveLeft', 'moveRight'] as const).flatMap((a) => DEFAULT_BINDINGS[a]),
    );
    kb.on(Phaser.Input.Keyboard.Events.ANY_KEY_DOWN, (e: KeyboardEvent) => {
      if (moveCodes.has(e.keyCode)) this.movePressed = true;
    });
    // Chuột phải dùng để ăn (GDD §4) → tắt menu chuột phải của trình duyệt.
    scene.input.mouse?.disableContextMenu();

    this.input = scene.input;
    scene.input.on(Phaser.Input.Events.POINTER_DOWN, (p: Phaser.Input.Pointer) => {
      if (p.leftButtonDown()) this.primaryPressed = true;
    });
    scene.input.on(Phaser.Input.Events.GAME_OUT, () => (this.pointerInside = false));
    scene.input.on(Phaser.Input.Events.GAME_OVER, () => (this.pointerInside = true));
    scene.input.on(Phaser.Input.Events.POINTER_MOVE, () => (this.pointerInside = true));
  }

  // ---------------------------------------------------------------- chuột

  /** Con trỏ có đang ở trên khung game không. */
  isPointerInside(): boolean {
    return this.pointerInside;
  }

  /** Chuột trái đang được giữ (để "giữ và rê" làm cả luống). */
  isPrimaryDown(): boolean {
    return this.input.activePointer.leftButtonDown();
  }

  /** Chuột trái vừa được bấm kể từ lần hỏi trước (true một lần mỗi lần bấm). Gọi một lần mỗi frame. */
  consumePrimaryPress(): boolean {
    const pressed = this.primaryPressed;
    this.primaryPressed = false;
    return pressed;
  }

  /**
   * Toạ độ THẾ GIỚI dưới con trỏ, theo camera (đã tính zoom + cuộn). Tính lại mỗi frame chứ không dùng
   * pointer.worldX: camera chạy theo nhân vật nên đứng yên chuột vẫn trỏ sang ô khác.
   * Ghi vào `out` để không tạo object mới mỗi frame.
   */
  pointerWorld(camera: Phaser.Cameras.Scene2D.Camera, out: Phaser.Math.Vector2): Phaser.Math.Vector2 {
    const p = this.input.activePointer;
    return camera.getWorldPoint(p.x, p.y, out);
  }

  /** Vừa nhấn phím đi kể từ lần hỏi trước (true một lần mỗi lần nhấn, kể cả chạm rất nhanh). Gọi một lần mỗi frame. */
  consumeMovePress(): boolean {
    const pressed = this.movePressed;
    this.movePressed = false;
    return pressed;
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
