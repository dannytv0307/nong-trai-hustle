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

// ---------------------------------------------------------------- T-023: tưới + cúi (gieo / hái / dọn)

/**
 * Loại hoạt ảnh động tác. Mọi dải động tác cùng chuẩn với cuốc (ART-CHR-007): 4 khung 128×128, khung 2 = CHẠM, cùng
 * điểm chân → dùng chung `hoeFrameAt` (tên giữ vì có từ T-009; thực chất là "khung theo tiến độ động tác").
 */
export type ActionAnim = 'hoe' | 'water' | 'bend';

/** Danh sách loại hoạt ảnh (để nạp ảnh / nhận ra khoá ảnh động tác). */
export const ACTION_ANIMS: readonly ActionAnim[] = ['hoe', 'water', 'bend'];

/** Việc trên ô → hoạt ảnh: cuốc → cuốc, tưới → tưới, gieo / hái / dọn → cúi. Việc lạ → null (không có dáng riêng). */
export function actionAnimFor(job: string | null): ActionAnim | null {
  switch (job) {
    case 'till':
      return 'hoe';
    case 'water':
      return 'water';
    case 'plant':
    case 'harvest':
    case 'clear':
      return 'bend';
    default:
      return null;
  }
}

/** Khung động tác `anim` ở tiến độ `progress` (0–1) — cùng luật 4 khung với cuốc, chỉ khác tỷ lệ chuẩn bị / chạm. */
export const actionFrameAt = hoeFrameAt;

/**
 * Có hiện dáng động tác không. Cuốc: luôn (cuốc khoá chân — GDD §3.3a). Việc nhanh (D-022, không khoá chân): chỉ khi
 * nhân vật ĐỨNG (`walking` false) — dải tưới / cúi không có bước chân, hiện lúc đang đi thì nhân vật "trượt" trên đất;
 * đang đi thì giữ khung bước (cùng cú nhún thân cũ để vẫn thấy có làm).
 */
export function showActionPose(anim: ActionAnim | null, walking: boolean): boolean {
  if (anim === null) return false;
  return anim === 'hoe' || !walking;
}

/** Khoá ảnh có phải dải động tác (khung 128×128, origin chân 111/128) không, vd `hero-t1-bend-left`. */
export function isActionTextureKey(key: string): boolean {
  return /^hero-t\d+-(hoe|water|bend)-/.test(key);
}
