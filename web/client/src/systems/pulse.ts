// Nhịp "thở" cho thứ cần gây chú ý (viền ô đang chọn…): độ đục lên xuống mượt theo hàm cos.
// Thuần TS để test được không cần Phaser.

/**
 * Độ đục tại thời điểm `t` (giây) của nhịp thở `rateHz` lần/giây, dao động giữa `minAlpha` và 1.
 * t = 0 → 1 (sáng nhất), nên vừa rê vào ô là thấy rõ ngay rồi mới mờ dần.
 * rateHz ≤ 0 hoặc minAlpha ≥ 1 → luôn 1 (tắt nhịp thở).
 */
export function pulseAlpha(t: number, rateHz: number, minAlpha: number): number {
  if (rateHz <= 0 || minAlpha >= 1) return 1;
  const wave = 0.5 + 0.5 * Math.cos(2 * Math.PI * rateHz * t); // 1 → 0 → 1
  return minAlpha + (1 - minAlpha) * wave;
}
