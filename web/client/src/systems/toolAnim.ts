// Hoạt ảnh cuốc thật (T-009, ART-CHR-007): mỗi nhát cuốc chạy trọn 4 khung, khung CHẠM ĐẤT trùng đúng lúc "chạm" của
// nhát (lúc ô thêm 1 nhát, bụi, tiếng "bộp" — systems/tileAction.ts). Khung được TÍNH từ tiến độ nhát chứ không chạy
// bằng đồng hồ animation riêng của Phaser → luôn khớp: mở gùi / khựng hình làm nhát đứng yên thì khung cũng đứng yên.
// Thuần TS để unit test.

/** Thứ tự khung trong dải ảnh cuốc (128×128 mỗi khung). */
export const HOE_FRAME = { ready: 0, raised: 1, impact: 2, recover: 3 } as const;

/**
 * Khung cuốc ở tiến độ `progress` (0–1) của MỘT nhát:
 * - [0, impactAt): chuẩn bị (khung 0) phần `windupShare` đầu, còn lại giơ cao (khung 1);
 * - [impactAt, 1): chạm đất (khung 2) phần `impactShare` đầu, còn lại hồi (khung 3).
 * Đúng tại `impactAt` là khung 2. Ngoài khoảng thì kẹp (≤ 0 → khung 0, ≥ 1 → khung 3).
 */
export function hoeFrameAt(progress: number, impactAt: number, windupShare: number, impactShare: number): number {
  const p = Math.min(1, Math.max(0, Number.isFinite(progress) ? progress : 0));
  const hit = Math.min(1, Math.max(0, impactAt));
  if (p < hit) return p < hit * clamp01(windupShare) ? HOE_FRAME.ready : HOE_FRAME.raised;
  if (p >= 1) return HOE_FRAME.recover;
  return p < hit + (1 - hit) * clamp01(impactShare) ? HOE_FRAME.impact : HOE_FRAME.recover;
}

const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));
