// Đồng hồ ngày (GDD §3.1) — logic thuần TypeScript, không phụ thuộc Phaser, để test bằng Vitest.
// Scene chỉ việc cộng dồn giây thật đã chạy (khi đồng hồ không bị dừng) rồi hỏi hàm này giờ game.

export interface DayClockConfig {
  dayLengthSeconds: number;
  dayStartHour: number;
  dayEndHour: number;
}

/** Số giờ game trôi qua trong 1 giây thật (mặc định 18 giờ / 600 giây = 0.03). */
export function gameHoursPerRealSecond(cfg: DayClockConfig): number {
  return (cfg.dayEndHour - cfg.dayStartHour) / cfg.dayLengthSeconds;
}

/**
 * Đổi số giây thật đã chơi trong ngày → giờ game (số thực, vd 14.5 = 14:30).
 * Không vượt quá dayEndHour (quá giờ thì xử lý "ngủ gục" ở hệ khác).
 */
export function realSecondsToGameHour(elapsedRealSeconds: number, cfg: DayClockConfig): number {
  const seconds = Math.max(0, elapsedRealSeconds);
  const hour = cfg.dayStartHour + seconds * gameHoursPerRealSecond(cfg);
  return Math.min(hour, cfg.dayEndHour);
}

/** Đổi số phút game → số giây thật (vd đường sang chợ 30 phút game ≈ 16.7 giây). */
export function gameMinutesToRealSeconds(gameMinutes: number, cfg: DayClockConfig): number {
  return gameMinutes / 60 / gameHoursPerRealSecond(cfg);
}

/** Định dạng giờ game cho HUD: 14.5 → "14:30", 24 → "24:00". Làm tròn xuống phút. */
export function formatClock(gameHour: number): string {
  const totalMinutes = Math.floor(gameHour * 60 + 1e-6);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
