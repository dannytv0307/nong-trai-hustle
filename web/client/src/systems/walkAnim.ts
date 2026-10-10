// Hoạt ảnh nhân vật (D-020, đã sửa): khi ĐI dùng chu trình bước thật — dọc 4 khung (ART-CHR-004),
// ngang 6 khung (ART-CHR-005). Đổi hướng dùng khung xoay chéo (ART-CHR-006, xem turnAnim.ts).
// Code chỉ lo những thứ khung hình không có:
//   - tốc độ chạy khung tỷ lệ với tốc độ thật (đi chậm / ép tường → khung chậm / dừng),
//   - bụi chân đúng lúc gót chạm đất (khung chạm gót khác nhau theo hướng),
//   - nhích 1px ở khung "nhấc chân" khi đi lên (dải hướng lên ít chuyển động dọc),
//   - thở khi đứng (dáng chống nạnh).
// KHÔNG nảy/nghiêng/lắc bằng code khi đi — khung thật đã có, thêm vào sẽ thành "nảy đôi".
// Thuần TS (không dùng Phaser) để unit test.
import type { Facing } from './movement';

export interface WalkAnimParams {
  /** Tốc độ chuyển đứng ↔ đi (1/giây) — chỉ dùng để nhịp thở hiện/tắt mềm. */
  blendRate: number;
  /** Biên độ thở khi đứng (tỷ lệ scale Y). */
  breathScale: number;
  /** Nhịp thở (lần/giây). */
  breathRate: number;
  /** Mấy lần chạm gót thì tung bụi một lần. */
  dustEverySteps: number;
  /** Đi lên: nhích sprite lên bao nhiêu px ở khung nhấc chân. */
  upBobPx: number;
  /** Khung chạm gót khi đi ngang (trái/phải). */
  sideContactFrames: readonly number[];
  /** Khung chạm gót khi đi dọc (lên/xuống). */
  verticalContactFrames: readonly number[];
}

/** Tư thế sprite ở frame hiện tại — scene chỉ việc áp vào sprite. */
export interface WalkPose {
  /** Lệch dọc so với chân (px, âm = nhấc lên). */
  offsetY: number;
  scaleY: number;
}

export interface WalkAnimState {
  /** 0 = đứng hẳn, 1 = đi hẳn; chuyển dần để nhịp thở không bật/tắt giật. */
  blend: number;
  /** Đã đứng yên bao lâu (giây) — cho nhịp thở. */
  idleTime: number;
  /** Tổng số lần chạm gót (để biết khi nào tung bụi). */
  stepCount: number;
  /** Đang đi hay đứng (theo tốc độ thật). */
  moving: boolean;
  /** Kết quả — tái dùng một object, không tạo mới mỗi frame. */
  pose: WalkPose;
}

/** Sự kiện khi đổi khung: không có gì, chạm gót, hoặc chạm gót kèm tung bụi. */
export type WalkEvent = 'none' | 'step' | 'dust';

/** Dưới ngưỡng này coi như đứng yên (tránh chạy khung khi chỉ nhích vài px do va chạm). */
export const MOVING_THRESHOLD = 0.05;

export const isSideFacing = (f: Facing): boolean => f === 'left' || f === 'right';

/** Khung chạm gót của chu trình đi theo hướng. */
export function contactFrames(facing: Facing, p: WalkAnimParams): readonly number[] {
  return isSideFacing(facing) ? p.sideContactFrames : p.verticalContactFrames;
}

export function createWalkAnimState(): WalkAnimState {
  return {
    blend: 0,
    idleTime: 0,
    stepCount: 0,
    moving: false,
    pose: { offsetY: 0, scaleY: 1 },
  };
}

/**
 * Hệ số tốc độ chạy khung: 1 = đúng frameRate của hướng đó. Tỷ lệ với tốc độ thật để chân khớp mặt đất
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
export function stepWalkAnim(state: WalkAnimState, speedRatio: number, dt: number, p: WalkAnimParams): void {
  const moving = walkTimeScale(speedRatio) > 0;
  state.moving = moving;

  // Chuyển dần theo hàm mũ: độc lập với FPS (30 hay 144 FPS đều mượt như nhau).
  const target = moving ? 1 : 0;
  state.blend += (target - state.blend) * (1 - Math.exp(-p.blendRate * dt));
  state.idleTime = moving ? 0 : state.idleTime + dt;
  if (!moving) state.pose.offsetY = 0; // dáng đứng không nhích

  // Thở: chỉ khi đứng (1 − blend), scale Y ±breathScale.
  state.pose.scaleY = 1 + p.breathScale * Math.sin(2 * Math.PI * p.breathRate * state.idleTime) * (1 - state.blend);
}

/**
 * Gọi mỗi khi anim đi của hướng `facing` đổi sang khung `frame`. Trả về sự kiện bụi chân,
 * và đặt nhích 1px cho khung nhấc chân khi đi lên.
 */
export function onWalkFrame(state: WalkAnimState, frame: number, facing: Facing, p: WalkAnimParams): WalkEvent {
  const contact = contactFrames(facing, p).includes(frame);
  state.pose.offsetY = facing === 'up' && !contact ? -p.upBobPx : 0;
  if (!contact) return 'none';
  state.stepCount++;
  return p.dustEverySteps > 0 && state.stepCount % p.dustEverySteps === 0 ? 'dust' : 'step';
}

/** Khi đang hiện khung xoay / ảnh đứng: bỏ nhích của hướng lên. */
export function clearWalkBob(state: WalkAnimState): void {
  state.pose.offsetY = 0;
}
