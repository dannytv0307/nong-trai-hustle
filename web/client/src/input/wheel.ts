// Đổi các sự kiện cuộn (wheel) thành "nấc" hotbar (BUG-009). Thuần TS → unit test được.
// Chuột thường: 1 nấc vật lý = 1 sự kiện deltaY ≈ 100 px → 1 nấc. Touchpad / chuột cuộn mượt: hàng chục sự kiện
// deltaY nhỏ (2–20 px) mỗi lần vuốt → phải CỘNG DỒN, đủ `stepDelta` px mới tính 1 nấc, không thì ô chạy vèo vèo.

/** Số px một "dòng" khi trình duyệt báo deltaMode = 1 (Firefox cuộn theo dòng). */
export const WHEEL_LINE_PX = 33;
/** deltaMode = 2 (cuộn theo trang) — coi một trang như một nấc lớn. */
export const WHEEL_PAGE_PX = 800;

export interface WheelAccumulator {
  /** Phần cuộn còn dư chưa đủ một nấc (px, dương = xuống). */
  rest: number;
}

export const createWheelAccumulator = (): WheelAccumulator => ({ rest: 0 });

/** Đổi deltaY của sự kiện ra px theo deltaMode (0 = px, 1 = dòng, 2 = trang). */
export function wheelDeltaPx(deltaY: number, deltaMode = 0): number {
  if (deltaMode === 1) return deltaY * WHEEL_LINE_PX;
  if (deltaMode === 2) return deltaY * WHEEL_PAGE_PX;
  return deltaY;
}

/**
 * Cộng một sự kiện cuộn `deltaPx` vào bộ dồn, trả về số nấc trọn vẹn (dương = xuống) và giữ phần dư.
 * Đổi chiều cuộn thì bỏ phần dư cũ (vuốt lên ngay sau khi vuốt xuống không phải "trả nợ" trước).
 */
export function accumulateWheel(acc: WheelAccumulator, deltaPx: number, stepDelta: number): number {
  if (deltaPx === 0) return 0;
  const step = Math.max(1, stepDelta);
  if (acc.rest !== 0 && Math.sign(acc.rest) !== Math.sign(deltaPx)) acc.rest = 0;
  acc.rest += deltaPx;
  const steps = Math.trunc(acc.rest / step);
  acc.rest -= steps * step;
  return steps;
}
