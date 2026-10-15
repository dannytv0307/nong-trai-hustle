// Âm thanh (T-026) — phần LOGIC THUẦN (không Phaser) để unit test: 2 kênh âm lượng Nhạc / Hiệu ứng, cài đặt âm lượng
// lưu máy, lệch cao độ ngẫu nhiên, chọn nhạc nền + tiếng nền theo giờ / khu, mờ dần (fade), chọn kiểu gà gáy theo ngày.
// Phần phát thật (Phaser Sound) nằm ở audio/AudioManager.ts và chỉ gọi các hàm ở đây.

/** Kênh âm lượng: Nhạc = nhạc nền + jingle; Hiệu ứng = mọi thứ còn lại (SFX, giọng, tiếng nền amb-*, giao diện). */
export type AudioChannel = 'music' | 'sfx';

/** Âm lượng 2 kênh (0–1) — người chơi chỉnh ở cửa sổ Tạm dừng (sau này T-085 Cài đặt). */
export interface AudioSettings {
  musicVolume: number;
  sfxVolume: number;
}

/** Kẹp về 0–1, làm tròn 2 chữ số (0.1 + 0.2 không thành 0.30000000000000004). */
export function clampVolume(v: number): number {
  if (!Number.isFinite(v)) return 0;
  return Math.round(Math.min(1, Math.max(0, v)) * 100) / 100;
}

/** Nút −/+ : nhảy một nấc `step`, bám lưới nấc (0.73 + 0.1 → 0.8, không thành 0.83). */
export function stepVolume(v: number, dir: 1 | -1, step: number): number {
  if (step <= 0) return clampVolume(v);
  const x = clampVolume(v) / step;
  const n = dir > 0 ? Math.floor(x + 1e-6) + 1 : Math.ceil(x - 1e-6) - 1;
  return clampVolume(n * step);
}

/** Âm lượng kênh theo cài đặt. */
export function channelVolume(settings: AudioSettings, channel: AudioChannel): number {
  return channel === 'music' ? settings.musicVolume : settings.sfxVolume;
}

/** Âm lượng cuối cùng = tích các hệ số, kẹp 0–1. */
export function mixVolume(...factors: number[]): number {
  let v = 1;
  for (const f of factors) v *= f;
  return Math.min(1, Math.max(0, v));
}

/** Phiên bản định dạng cài đặt âm lượng (localStorage). */
export const AUDIO_SETTINGS_VERSION = 1;

/** Đọc cài đặt âm lượng từ chuỗi JSON; hỏng / thiếu / sai kiểu từng trường → dùng mặc định trường đó. Không ném lỗi. */
export function parseAudioSettings(text: string | null | undefined, defaults: AudioSettings): AudioSettings {
  const out: AudioSettings = { musicVolume: clampVolume(defaults.musicVolume), sfxVolume: clampVolume(defaults.sfxVolume) };
  if (!text) return out;
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return out;
  }
  if (typeof raw !== 'object' || raw === null) return out;
  const r = raw as Record<string, unknown>;
  if (typeof r.musicVolume === 'number' && Number.isFinite(r.musicVolume)) out.musicVolume = clampVolume(r.musicVolume);
  if (typeof r.sfxVolume === 'number' && Number.isFinite(r.sfxVolume)) out.sfxVolume = clampVolume(r.sfxVolume);
  return out;
}

export function serializeAudioSettings(s: AudioSettings): string {
  return JSON.stringify({ version: AUDIO_SETTINGS_VERSION, musicVolume: clampVolume(s.musicVolume), sfxVolume: clampVolume(s.sfxVolume) });
}

/** Chữ hiện cạnh nút −/+ ("80%"). */
export function volumeLabel(v: number): string {
  return `${Math.round(clampVolume(v) * 100)}%`;
}

// ---------------------------------------------------------------- cao độ, biến thể, phát chồng

/** Lệch cao độ theo phần trăm tần số → cent (4% ≈ 68 cent). */
export function percentToCents(percent: number): number {
  return 1200 * Math.log2(1 + percent / 100);
}

/** Lệch cao độ ngẫu nhiên trong ±maxCents, từ số ngẫu nhiên `rand` ∈ [0, 1). */
export function jitterCents(rand: number, maxCents: number): number {
  return (rand * 2 - 1) * maxCents;
}

/** Chọn chỉ số biến thể ∈ [0, n) từ `rand` ∈ [0, 1). */
export function pickIndex(rand: number, n: number): number {
  if (n <= 0) return -1;
  return Math.min(n - 1, Math.max(0, Math.floor(rand * n)));
}

/** Cùng một tiếng (gồm các biến thể) đang phát `playing` bản → được phát thêm không (giới hạn sfxMaxConcurrent). */
export function canPlayMore(playing: number, max: number): boolean {
  return max <= 0 || playing < max;
}

/** Tiếng có khoảng nghỉ tối thiểu (vd tiếng lỗi khi rê chuột qua nhiều ô): đã đủ lâu kể từ lần phát trước chưa. */
export function gapElapsed(now: number, lastAt: number | undefined, minGap: number): boolean {
  return lastAt === undefined || minGap <= 0 || now - lastAt >= minGap;
}

/** Khoảng nghỉ ngẫu nhiên trong [min, max] (giây) — ngáy lặp, sấm. */
export function randomGap(rand: number, range: readonly [number, number]): number {
  return range[0] + rand * (range[1] - range[0]);
}

// ---------------------------------------------------------------- mờ dần

/** Tiến hệ số mờ (0–1) về `target` với tốc độ hết một quãng 0↔1 trong `seconds` giây. seconds ≤ 0 = nhảy thẳng. */
export function stepFade(current: number, target: number, dt: number, seconds: number): number {
  if (seconds <= 0) return target;
  const step = dt / seconds;
  if (current < target) return Math.min(target, current + step);
  if (current > target) return Math.max(target, current - step);
  return current;
}

// ---------------------------------------------------------------- nhạc nền + tiếng nền theo giờ / khu

/** Khoá nhạc nền (config/assets.ts). */
export type MusicTrack = 'music-vuon' | 'music-dem';
/** Khoá tiếng nền lặp (kênh Hiệu ứng). */
export type AmbienceKey = 'amb-mua' | 'amb-trong-nha' | 'amb-trong-nha-dem';

export interface BedChoice<K extends string> {
  key: K;
  /** Hệ số âm lượng của bản này (chưa nhân kênh). */
  volume: number;
}

export interface SoundscapeRules {
  /** Từ giờ này là "đêm" (nhạc đêm) — 19h. */
  nightStartHour: number;
  /** Từ giờ này là "ngày" — 6h. */
  dayStartHour: number;
  /** Trong nhà ban ngày: nhạc đêm nhỏ hơn bấy nhiêu lần (0.7). */
  houseDayMusicMultiplier: number;
}

export interface SoundscapeState {
  /** Giờ game (số thực). */
  hour: number;
  /** Khu đang đứng. */
  area: string;
  /** Trời đang mưa (chưa có thời tiết → luôn false; T-0xx thời tiết nối vào đây). */
  raining: boolean;
}

/** Đêm: từ nightStartHour tới trước dayStartHour hôm sau (giờ ≥ 24 cũng tính đêm). */
export function isNightHour(hour: number, r: SoundscapeRules): boolean {
  return hour >= r.nightStartHour || hour < r.dayStartHour;
}

/**
 * Nhạc nền nên phát (audio list AUD-MUS-001 / 005): Vườn ban ngày = nhạc Vườn; 19h → 6h = nhạc đêm; trong nhà luôn nhạc đêm
 * (ban ngày nhỏ hơn — houseDayMusicMultiplier).
 */
export function chooseMusic(s: SoundscapeState, r: SoundscapeRules): BedChoice<MusicTrack> {
  const night = isNightHour(s.hour, r);
  if (s.area === 'house') return { key: 'music-dem', volume: night ? 1 : r.houseDayMusicMultiplier };
  return { key: night ? 'music-dem' : 'music-vuon', volume: 1 };
}

/** Tiếng nền lặp (kênh Hiệu ứng): trong nhà = bếp rơm (đêm có dế); ngoài trời mưa = mưa; còn lại không có. */
export function chooseAmbience(s: SoundscapeState, r: SoundscapeRules): BedChoice<AmbienceKey> | null {
  if (s.area === 'house') return { key: isNightHour(s.hour, r) ? 'amb-trong-nha-dem' : 'amb-trong-nha', volume: 1 };
  if (s.raining) return { key: 'amb-mua', volume: 1 };
  return null;
}

/** Đồng hồ vừa đi qua mốc `h` giữa hai lần đọc (prev < h ≤ now) — ngáp lúc 23h (kể cả nhảy giờ bằng F9). */
export function crossedHour(prev: number, now: number, h: number): boolean {
  return prev < h && now >= h;
}

/** Loại nền dưới chân → bộ tiếng bước: cỏ hay đất (lối, sân, ruộng, sàn nhà). */
export function footstepSurface(groundKind: string | null | undefined): 'grass' | 'dirt' {
  return groundKind === 'grass' ? 'grass' : 'dirt';
}

// ---------------------------------------------------------------- gà gáy theo ngày (AUD-SFX-109)

/** 6 kiểu gà gáy, đúng thứ tự bảng trong audio list (kiểu "kế tiếp" khi trùng hôm trước). */
export const ROOSTER_KINDS = ['binh-thuong', 'tac-hong', 'khan', 'vo-giong', 'ngai-ngu', 'gay-lai'] as const;
export type RoosterKind = (typeof ROOSTER_KINDS)[number];

export interface RoosterRules {
  /** Trọng số chọn (không cần cộng đủ 100). */
  weights: Readonly<Record<RoosterKind, number>>;
  /** Ngày 1 luôn kiểu này (người chơi mới nghe bản chuẩn trước). */
  firstDayKind: RoosterKind;
  /** Kiểu được phép lặp 2 ngày liền (bình thường). */
  repeatableKind: RoosterKind;
  /** Ngày mưa: trọng số kiểu này nhân lên (gà "cảm") — tùy chọn. */
  rainyFavorite?: RoosterKind;
  rainyFavoriteMultiplier?: number;
}

/**
 * Băm (seed, ngày) → số ngẫu nhiên xác định ∈ [0, 1): cùng seed + cùng ngày luôn ra cùng số (F5 cùng ngày → cùng tiếng gà).
 * Trộn bit kiểu "murmur3 finalizer" — đủ đều cho việc chọn 1 trong 6.
 */
export function seededUnit(seed: number, day: number, salt = 0x9e3779b9): number {
  let h = (seed ^ Math.imul(day, 0x85ebca6b) ^ salt) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x7feb352d) >>> 0;
  h = Math.imul(h ^ (h >>> 15), 0x846ca68b) >>> 0;
  h = (h ^ (h >>> 16)) >>> 0;
  return h / 0x100000000;
}

/** Chọn theo trọng số từ `rand` ∈ [0, 1). */
export function weightedPick<K extends string>(order: readonly K[], weights: Readonly<Record<K, number>>, rand: number): K {
  let total = 0;
  for (const k of order) total += Math.max(0, weights[k] ?? 0);
  if (total <= 0) return order[0];
  let x = rand * total;
  for (const k of order) {
    const w = Math.max(0, weights[k] ?? 0);
    if (x < w) return k;
    x -= w;
  }
  return order[order.length - 1];
}

/** Kiểu gà một ngày, CHƯA xét luật "không lặp" (chỉ trọng số + mưa). */
export function roosterRoll(seed: number, day: number, rules: RoosterRules, raining = false): RoosterKind {
  let weights = rules.weights;
  if (raining && rules.rainyFavorite && rules.rainyFavoriteMultiplier) {
    weights = { ...weights, [rules.rainyFavorite]: weights[rules.rainyFavorite] * rules.rainyFavoriteMultiplier };
  }
  return weightedPick(ROOSTER_KINDS, weights, seededUnit(seed, day));
}

/**
 * Kiểu gà gáy sáng ngày `day` (audio list "Luật chọn tiếng gà theo ngày"): ngày 1 = bình thường; các ngày sau bốc theo trọng
 * số từ hash(seed, ngày); trùng kiểu hôm trước (trừ bình thường) → lấy kiểu kế tiếp trong bảng. Tính lần lượt từ ngày 1 nên
 * kết quả chỉ phụ thuộc (seed, ngày, mưa các ngày) — nạp lại save bao nhiêu lần cũng vậy. `isRainy(d)` tùy chọn.
 */
export function roosterKindForDay(seed: number, day: number, rules: RoosterRules, isRainy: (d: number) => boolean = () => false): RoosterKind {
  let prev: RoosterKind = rules.firstDayKind;
  for (let d = 2; d <= Math.floor(day); d++) {
    let k = roosterRoll(seed, d, rules, isRainy(d));
    if (k === prev && k !== rules.repeatableKind) k = ROOSTER_KINDS[(ROOSTER_KINDS.indexOf(k) + 1) % ROOSTER_KINDS.length];
    prev = k;
  }
  return prev;
}

/** Seed mới cho một lần chơi mới (số nguyên 0 … 2³²−1). */
export function newSeed(rand: number): number {
  return Math.floor(rand * 0x100000000) >>> 0;
}
