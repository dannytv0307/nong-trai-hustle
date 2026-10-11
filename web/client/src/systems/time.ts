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

// ---------------------------------------------------------------- T-005: trạng thái đồng hồ trong ngày

/** Đồng hồ của một ngày: ngày thứ mấy + số giây thật đã CHẠY trong ngày (không tính lúc dừng). Sẽ vào save (T-008). */
export interface DayClockState {
  day: number;
  elapsedSeconds: number;
}

export const createDayClock = (day = 1): DayClockState => ({ day, elapsedSeconds: 0 });

/** Số giây thật của cả ngày tính tới dayEndHour (= dayLengthSeconds). */
const secondsToEnd = (cfg: DayClockConfig): number => cfg.dayLengthSeconds;

/** Giờ game hiện tại (số thực, vd 14.5 = 14:30). */
export function clockHour(state: DayClockState, cfg: DayClockConfig): number {
  return realSecondsToGameHour(state.elapsedSeconds, cfg);
}

/** Đã chạm dayEndHour (24h) chưa. */
export function isDayOver(state: DayClockState, cfg: DayClockConfig): boolean {
  return state.elapsedSeconds >= secondsToEnd(cfg);
}

/**
 * Tiến đồng hồ `dt` giây thật. `stopped` = đang có lý do dừng (gùi, Tạm dừng, thùng bán…) → không chạy.
 * Không vượt dayEndHour. Trả về true đúng MỘT lần: ở lần gọi làm đồng hồ chạm dayEndHour (T-007 bắt để "ngủ gục").
 */
export function advanceDayClock(state: DayClockState, dt: number, stopped: boolean, cfg: DayClockConfig): boolean {
  if (stopped || dt <= 0 || isDayOver(state, cfg)) return false;
  state.elapsedSeconds = Math.min(secondsToEnd(cfg), state.elapsedSeconds + dt);
  return isDayOver(state, cfg);
}

/** Cộng `hours` giờ game (phím thử F9). Không vượt dayEndHour. Trả về true nếu lần này chạm dayEndHour. */
export function addGameHours(state: DayClockState, hours: number, cfg: DayClockConfig): boolean {
  const wasOver = isDayOver(state, cfg);
  state.elapsedSeconds = Math.min(secondsToEnd(cfg), Math.max(0, state.elapsedSeconds + hours / gameHoursPerRealSecond(cfg)));
  return !wasOver && isDayOver(state, cfg);
}

/** Đặt giờ game (QA/test, sau này nạp save). Kẹp trong [dayStartHour, dayEndHour]. */
export function setGameHour(state: DayClockState, hour: number, cfg: DayClockConfig): void {
  const h = Math.min(cfg.dayEndHour, Math.max(cfg.dayStartHour, hour));
  state.elapsedSeconds = (h - cfg.dayStartHour) / gameHoursPerRealSecond(cfg);
}

/** Từ passOutWarnHour (23h) đồng hồ HUD nhấp nháy đỏ (GDD §3.1). */
export function isPassOutWarning(hour: number, cfg: { passOutWarnHour: number }): boolean {
  return hour >= cfg.passOutWarnHour;
}

/** Nhấp nháy `rate` lần/giây: nửa đầu mỗi nhịp "bật", nửa sau "tắt". t = giây. */
export function blinkOn(t: number, rate: number): boolean {
  if (rate <= 0) return true;
  const phase = (t * rate) % 1;
  return phase < 0.5;
}

// ---------------------------------------------------------------- mùa (GDD §3.1)

export type Season = 'dry' | 'rainy';

/** Mùa của ngày `day` (đếm từ 1): mỗi mùa daysPerSeason ngày, bắt đầu mùa nắng. */
export function seasonOf(day: number, daysPerSeason: number): Season {
  const index = Math.floor((Math.max(1, day) - 1) / Math.max(1, daysPerSeason));
  return index % 2 === 0 ? 'dry' : 'rainy';
}

const SEASON_LABEL: Readonly<Record<Season, string>> = { dry: 'Mùa nắng', rainy: 'Mùa mưa' };

/** Dòng HUD "Ngày 1 · Mùa nắng". Prototype luôn nắng (chưa có thời tiết) — icon mưa để sau. */
export function dayLabel(day: number, daysPerSeason: number): string {
  return `Ngày ${day} · ${SEASON_LABEL[seasonOf(day, daysPerSeason)]}`;
}

// ---------------------------------------------------------------- màu trời (GDD §3.1: chỉ là màu, không có luật)

/** Khung giờ: sáng 6–11h, trưa/chiều 11–17h, hoàng hôn 17–19h, tối 19–24h. */
export type SkyPhase = 'morning' | 'midday' | 'dusk' | 'night';

export interface SkyPhaseStarts {
  midday: number;
  dusk: number;
  night: number;
}

export function skyPhase(hour: number, starts: SkyPhaseStarts): SkyPhase {
  if (hour >= starts.night) return 'night';
  if (hour >= starts.dusk) return 'dusk';
  if (hour >= starts.midday) return 'midday';
  return 'morning';
}

/** Một mốc màu trời: giờ game, màu 0xRRGGBB, độ đậm (0–1, nhân với skyTintMaxAlpha). */
export interface SkyKeyframe {
  hour: number;
  color: number;
  strength: number;
}

export interface SkyTint {
  color: number;
  alpha: number;
}

/** Trộn hai màu 0xRRGGBB theo t (0 → a, 1 → b), từng kênh. */
export function lerpColor(a: number, b: number, t: number): number {
  const k = Math.min(1, Math.max(0, t));
  const ch = (c: number, s: number) => (c >> s) & 0xff;
  const mix = (s: number) => Math.round(ch(a, s) + (ch(b, s) - ch(a, s)) * k);
  return (mix(16) << 16) | (mix(8) << 8) | mix(0);
}

/**
 * Màu + độ đục lớp phủ trời lúc `hour`: nội suy tuyến tính giữa hai mốc kề nhau (chuyển mượt, không giật).
 * Trước mốc đầu / sau mốc cuối thì giữ mốc đó. Độ đục = strength × maxAlpha, không bao giờ vượt maxAlpha.
 * `keyframes` phải xếp theo giờ tăng dần.
 */
export function skyTint(hour: number, keyframes: readonly SkyKeyframe[], maxAlpha: number): SkyTint {
  if (keyframes.length === 0) return { color: 0, alpha: 0 };
  const clampA = (s: number) => Math.min(maxAlpha, Math.max(0, s * maxAlpha));
  const first = keyframes[0];
  if (hour <= first.hour) return { color: first.color, alpha: clampA(first.strength) };
  for (let i = 1; i < keyframes.length; i++) {
    const b = keyframes[i];
    if (hour <= b.hour) {
      const a = keyframes[i - 1];
      const t = b.hour === a.hour ? 1 : (hour - a.hour) / (b.hour - a.hour);
      return { color: lerpColor(a.color, b.color, t), alpha: clampA(a.strength + (b.strength - a.strength) * t) };
    }
  }
  const last = keyframes[keyframes.length - 1];
  return { color: last.color, alpha: clampA(last.strength) };
}
