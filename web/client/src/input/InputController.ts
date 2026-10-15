// Lớp "action" bọc bàn phím/chuột của Phaser (GDD §4). Gameplay chỉ hỏi theo TÊN hành động
// (moveUp, interact, openBag...), không đọc phím trực tiếp — sau này thêm gamepad/màn cảm ứng
// hay cho đổi phím chỉ cần sửa file này.
import Phaser from 'phaser';
import { gameConfig } from '../config/gameConfig';
import type { Vec2 } from '../systems/movement';
import { PressBuffer } from './pressBuffer';
import { accumulateWheel, createWheelAccumulator, wheelDeltaPx } from './wheel';

export type Action =
  | 'moveUp'
  | 'moveDown'
  | 'moveLeft'
  | 'moveRight'
  | 'interact' // F — mở thùng bán / sạp hạt khi đứng cạnh (T-006)
  | 'openBag' // E hoặc Tab
  | 'openQuests' // Q
  | 'menu' // Esc
  | 'confirm' // Space
  | 'accept' // Enter — "Có" ở hộp hỏi đi ngủ, "Ngày mới" ở màn tổng kết (T-007)
  | 'devNextDay' // G — phím thử "qua đêm" (chỉ bản dev, gameConfig.devCheatsEnabled)
  | 'devDrainStamina' // F8 — phím thử −20 Sức (chỉ bản dev)
  | 'devAddHour'; // F9 — phím thử +1 giờ game (chỉ bản dev, T-005)

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
  accept: [KC.ENTER],
  devNextDay: [KC.G],
  devDrainStamina: [KC.F8],
  devAddHour: [KC.F9],
};

const HOTBAR_KEYS = [KC.ONE, KC.TWO, KC.THREE, KC.FOUR, KC.FIVE, KC.SIX, KC.SEVEN, KC.EIGHT, KC.NINE];

export class InputController {
  private readonly keys = new Map<Action, Phaser.Input.Keyboard.Key[]>();
  private readonly input: Phaser.Input.InputPlugin;
  /**
   * Con trỏ đang nằm trên khung game (ra ngoài canvas thì ẩn viền ô). Bắt đầu là false: con trỏ
   * Phaser mặc định ở (0,0) nên chưa rê chuột lần nào thì không được vẽ viền ở góc màn (BUG-004).
   */
  private pointerInside = false;
  /**
   * Mọi lần nhấn (phím, phím đi, chuột trái/phải, cuộn) GHI THEO SỰ KIỆN rồi gameplay "tiêu thụ" mỗi frame — gõ nhanh
   * (nhấn + nhả lọt giữa hai frame) không bị mất (BUG-007, BUG-010). Xem input/pressBuffer.ts.
   */
  private readonly buf = new PressBuffer();
  /** Phần cuộn chưa đủ một nấc (BUG-009: touchpad bắn nhiều sự kiện deltaY nhỏ → cộng dồn đủ wheelStepDelta). */
  private readonly wheelAcc = createWheelAccumulator();
  /** Lần bấm chuột trái gần nhất có giữ Shift không (T-006). */
  private primaryShift = false;
  /** T-026: số lần bấm chuột trái từ đầu (không "tiêu thụ") — âm thanh biết vừa có cú bấm để phát tiếng click nút. */
  private primaryPresses = 0;

  constructor(scene: Phaser.Scene) {
    const kb = scene.input.keyboard;
    if (!kb) throw new Error('InputController cần bàn phím (input.keyboard đang tắt)');
    for (const [action, codes] of Object.entries(DEFAULT_BINDINGS) as [Action, number[]][]) {
      // enableCapture = true: chặn hành vi mặc định của trình duyệt (Space cuộn trang, Tab đổi ô).
      this.keys.set(action, codes.map((c) => kb.addKey(c, true)));
    }
    // Phím 1–9: chỉ đăng ký để chặn hành vi mặc định; lần nhấn đọc từ keydown (pressBuffer).
    for (const c of HOTBAR_KEYS) kb.addKey(c, true);
    const moveCodes = new Set<number>(
      (['moveUp', 'moveDown', 'moveLeft', 'moveRight'] as const).flatMap((a) => DEFAULT_BINDINGS[a]),
    );
    // Nghe keydown thẳng từ trình duyệt (không qua ANY_KEY_DOWN của Phaser): Phaser xử lý lại hàng đợi phím nhiều
    // lần trong một frame nên có thể phát lại một keydown CŨ sau keydown mới → sai thứ tự "phím bấm sau cùng"
    // (BUG-010) và có thể đếm trùng. Sự kiện DOM thì đúng thứ tự, mỗi lần nhấn một lần.
    const onKeyDown = (e: KeyboardEvent) => {
      this.buf.keyDown(e.keyCode, e.repeat, moveCodes.has(e.keyCode), HOTBAR_KEYS.indexOf(e.keyCode));
    };
    window.addEventListener('keydown', onKeyDown);
    const detach = () => window.removeEventListener('keydown', onKeyDown);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, detach);
    scene.events.once(Phaser.Scenes.Events.DESTROY, detach);
    // Chuột phải dùng để ăn (GDD §4) → tắt menu chuột phải của trình duyệt.
    scene.input.mouse?.disableContextMenu();

    this.input = scene.input;
    scene.input.on(Phaser.Input.Events.POINTER_DOWN, (p: Phaser.Input.Pointer) => {
      // T-096: chạm màn hình (điện thoại) không có "rê chuột vào khung" trước → lần chạm đầu cũng tính là con trỏ trong khung.
      // Phaser coi một ngón chạm như chuột TRÁI (buttons = 1) → chạm = click trái, giữ ngón rê = giữ chuột rê.
      this.pointerInside = true;
      this.buf.pointerDown(p.leftButtonDown(), p.rightButtonDown());
      // T-006: Shift+click (chuyển cả chồng / mua 5) — đọc Shift NGAY LÚC BẤM từ sự kiện chuột, không đọc phím Shift
      // lúc xử lý (người chơi có thể đã nhả Shift trước frame kế).
      if (p.leftButtonDown()) {
        this.primaryShift = (p.event as MouseEvent | undefined)?.shiftKey === true;
        this.primaryPresses++;
      }
    });
    scene.input.on(
      Phaser.Input.Events.POINTER_WHEEL,
      (p: Phaser.Input.Pointer, _over: unknown, _dx: number, dy: number) => {
        const mode = (p.event as WheelEvent | undefined)?.deltaMode ?? 0;
        this.buf.addWheelSteps(accumulateWheel(this.wheelAcc, wheelDeltaPx(dy, mode), gameConfig.wheelStepDelta));
      },
    );
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
    return this.buf.consumePrimary();
  }

  /** Số lần bấm chuột trái từ lúc tạo (chỉ đọc, không tiêu thụ lần bấm — T-026 tiếng click nút). */
  get primaryPressCount(): number {
    return this.primaryPresses;
  }

  /** Lần bấm chuột trái gần nhất có giữ Shift không (Shift+click: chuyển cả chồng, mua nhiều — T-006). */
  primaryPressWithShift(): boolean {
    return this.primaryShift;
  }

  /** Chuột phải vừa được bấm kể từ lần hỏi trước (true một lần mỗi lần bấm). Gọi một lần mỗi frame. */
  consumeSecondaryPress(): boolean {
    return this.buf.consumeSecondary();
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

  /** Toạ độ con trỏ trên khung game (hệ 1920×1080 của UI, không theo camera). Ghi vào `out`. */
  pointerScreen(out: Phaser.Math.Vector2): Phaser.Math.Vector2 {
    const p = this.input.activePointer;
    return out.set(p.x, p.y);
  }

  /** Số nấc cuộn chuột từ lần hỏi trước (dương = cuộn xuống), rồi xóa. Gọi một lần mỗi frame. */
  consumeWheelSteps(): number {
    return this.buf.consumeWheel();
  }

  /**
   * Hành động vừa được nhấn kể từ lần hỏi trước (theo sự kiện — gõ nhanh không mất). true một lần mỗi lần nhấn.
   * Dùng cho phím bấm-một-lần (E mở gùi, Esc, G). Gọi một lần cho mỗi action mỗi frame.
   */
  consumePressed(action: Action): boolean {
    return this.buf.consumeCodes(DEFAULT_BINDINGS[action]);
  }

  /** Vừa nhấn phím đi kể từ lần hỏi trước (true một lần mỗi lần nhấn, kể cả chạm rất nhanh). Gọi một lần mỗi frame. */
  consumeMovePress(): boolean {
    return this.buf.consumeMove();
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

  /**
   * Ô hotbar vừa chọn bằng phím 1–9 (đếm từ 0), hoặc null. Theo sự kiện keydown (gõ nhanh không mất);
   * nhấn nhiều phím trong một frame thì lấy phím BẤM SAU CÙNG (BUG-010). Gọi một lần mỗi frame.
   */
  hotbarPressed(): number | null {
    return this.buf.consumeHotbar(HOTBAR_KEYS);
  }

  /**
   * Gọi CUỐI mỗi frame: bỏ các lần nhấn phím / cuộn chưa ai hỏi tới (vd phím F khi chưa có tính năng F) —
   * để một lần nhấn cũ không bất ngờ "lọt" sang frame sau hay sang tính năng thêm về sau.
   */
  endFrame(): void {
    this.buf.endFrame();
  }

  /**
   * T-005: xóa SẠCH mọi lần nhấn tồn đọng (phím, chạm phím đi, chuột trái/phải, cuộn dở). Gọi mỗi frame lúc đang Tạm
   * dừng và lúc vừa chơi tiếp — trình duyệt vẫn ghi phím khi game dừng, không xóa thì E/G/F9/chạm D bấm lúc dừng sẽ
   * "lọt" sang lúc chơi tiếp.
   */
  clearPending(): void {
    this.buf.clearAll();
    this.wheelAcc.rest = 0;
  }
}
