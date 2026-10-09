// Hoạt ảnh nhân vật (D-020, đã sửa): khi ĐI dùng chu trình bước thật 4 khung (ART-CHR-004),
// code chỉ lo những thứ khung hình không có:
//   - tốc độ chạy khung tỷ lệ với tốc độ thật (đi chậm / ép tường → khung chậm / dừng),
//   - bụi chân đúng lúc gót chạm đất (khung 0 và 2),
//   - nhích 1px ở khung "nhấc chân" khi đi lên (dải hướng lên ít chuyển động dọc),
//   - thở khi đứng (dáng chống nạnh), cú co ngang khi đổi hướng.
// KHÔNG còn nảy/nghiêng/lắc bằng code khi đi — khung thật đã có, thêm vào sẽ thành "nảy đôi".
// Thuần TS (không dùng Phaser) để unit test.

export interface WalkAnimParams {
  /** Tốc độ chuyển đứng ↔ đi (1/giây) — chỉ dùng để nhịp thở hiện/tắt mềm. */
  blendRate: number;
  /** Biên độ thở khi đứng (tỷ lệ scale Y). */
  breathScale: number;
  /** Nhịp thở (lần/giây). */
  breathRate: number;
  /** Thời gian cú co ngang khi đổi hướng (giây). */
  turnSeconds: number;
  /** Độ co ngang lúc bắt đầu đổi hướng. */
  turnSquash: number;
  /** Mấy lần chạm gót thì tung bụi một lần. */
  dustEverySteps: number;
  /** Đi lên: nhích sprite lên bao nhiêu px ở khung nhấc chân (1, 3). */
  upBobPx: number;
}

/** Tư thế sprite ở frame hiện tại — scene chỉ việc áp vào sprite. */
export interface WalkPose {
  /** Lệch dọc so với chân (px, âm = nhấc lên). */
  offsetY: number;
  scaleX: number;
  scaleY: number;
}

export interface WalkAnimState {
  /** 0 = đứng hẳn, 1 = đi hẳn; chuyển dần để nhịp thở không bật/tắt giật. */
  blend: number;
  /** Đã đứng yên bao lâu (giây) — cho nhịp thở. */
  idleTime: number;
  /** Còn bao lâu nữa hết cú co ngang đổi hướng (giây). */
  turnLeft: number;
  /** Tổng số lần chạm gót (để biết khi nào tung bụi). */
  stepCount: number;
  /** Đang đi hay đứng (theo tốc độ thật). */
  moving: boolean;
  /** Kết quả — tái dùng một object, không tạo mới mỗi frame. */
  pose: WalkPose;
}

export interface WalkAnimInput {
  /** Tốc độ thật / tốc độ đi chuẩn, 0..1. */
  speedRatio: number;
  /** true đúng frame nhân vật vừa đổi hướng mặt. */
  turned: boolean;
}

/** Sự kiện khi đổi khung: không có gì, chạm gót, hoặc chạm gót kèm tung bụi. */
export type WalkEvent = 'none' | 'step' | 'dust';

/** Dưới ngưỡng này coi như đứng yên (tránh chạy khung khi chỉ nhích vài px do va chạm). */
export const MOVING_THRESHOLD = 0.05;

/** Khung gót chạm đất trong chu trình 0-1-2-3 (ART-CHR-004). */
export const CONTACT_FRAMES: readonly number[] = [0, 2];

export function createWalkAnimState(): WalkAnimState {
  return {
    blend: 0,
    idleTime: 0,
    turnLeft: 0,
    stepCount: 0,
    moving: false,
    pose: { offsetY: 0, scaleX: 1, scaleY: 1 },
  };
}

/**
 * Hệ số tốc độ chạy khung: 1 = đúng `walkFrameRate`. Tỷ lệ với tốc độ thật để chân khớp mặt đất
 * (không "trượt"); dưới ngưỡng đi thì 0 = dừng anim, về dáng đứng.
 */
export function walkTimeScale(speedRatio: number): number {
  const r = Math.min(1, Math.max(0, speedRatio));
  return r > MOVING_THRESHOLD ? r : 0;
}

/**
 * Làm mượt tỷ lệ tốc độ đo được (trung bình trượt theo hàm mũ, `rate` 1/giây).
 * Kết quả KHÔNG kẹp về 1 (kẹp sẽ làm trung bình lệch thấp) — walkTimeScale tự kẹp khi dùng.
 * Giá trị thô được phép > 1 trước khi làm mượt: ở màn 144Hz, frame có bước vật lý đo ra ~2.4,
 * frame không có đo ra 0 — trung bình mới đúng ~1.
 */
export function smoothSpeedRatio(prev: number, raw: number, dt: number, rate: number): number {
  const r = Math.min(4, Math.max(0, raw));
  return prev + (r - prev) * (1 - Math.exp(-rate * dt));
}

/** Tiến trạng thái thêm `dt` giây. Sửa trực tiếp `state` (kể cả `state.pose`). */
export function stepWalkAnim(state: WalkAnimState, input: WalkAnimInput, dt: number, p: WalkAnimParams): void {
  const moving = walkTimeScale(input.speedRatio) > 0;
  state.moving = moving;

  // Chuyển dần theo hàm mũ: độc lập với FPS (30 hay 144 FPS đều mượt như nhau).
  const target = moving ? 1 : 0;
  state.blend += (target - state.blend) * (1 - Math.exp(-p.blendRate * dt));
  state.idleTime = moving ? 0 : state.idleTime + dt;
  if (!moving) state.pose.offsetY = 0; // dáng đứng không nhích

  if (input.turned) state.turnLeft = p.turnSeconds;
  state.turnLeft = Math.max(0, state.turnLeft - dt);

  const pose = state.pose;
  // Thở: chỉ khi đứng (1 − blend), scale Y ±breathScale.
  pose.scaleY = 1 + p.breathScale * Math.sin(2 * Math.PI * p.breathRate * state.idleTime) * (1 - state.blend);
  // Đổi hướng: bề ngang co lại rồi bung ra như lật tấm thẻ.
  pose.scaleX = 1;
  if (p.turnSeconds > 0 && state.turnLeft > 0) {
    const k = state.turnLeft / p.turnSeconds; // 1 → 0
    pose.scaleX = 1 - p.turnSquash * k * k;
  }
}

/**
 * Gọi mỗi khi anim đi đổi sang khung `frame` (0..3). Trả về sự kiện bụi chân,
 * và đặt nhích 1px cho khung nhấc chân khi đi lên.
 */
export function onWalkFrame(state: WalkAnimState, frame: number, facingUp: boolean, p: WalkAnimParams): WalkEvent {
  state.pose.offsetY = facingUp && !CONTACT_FRAMES.includes(frame) ? -p.upBobPx : 0;
  if (!CONTACT_FRAMES.includes(frame)) return 'none';
  state.stepCount++;
  return p.dustEverySteps > 0 && state.stepCount % p.dustEverySteps === 0 ? 'dust' : 'step';
}
