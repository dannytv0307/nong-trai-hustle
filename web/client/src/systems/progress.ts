// Trạng thái chặng 4 (T-041): tiến trình (tiếng tăm, level, nhiệm vụ), cờ, độ bền nông cụ, bậc ngoại hình, gia đình, thời
// tiết. Thuần TS → unit test được. T-041 chỉ làm CHỖ LƯU (save version 5) + bảng Thử ghi vào đây; luật của từng hệ làm ở
// task sau: XP / lên level T-042, nhiệm vụ T-043, thời tiết T-047, độ bền T-049, bậc đồ T-065…, gia đình T-086….
// Hình dạng lấy thẳng từ type save ở @bph/shared (một chỗ khai báo) — scene giữ object, save chép ra / nạp vào.
import { defaultV5Fields, type SaveFamily, type SaveProgress, type SaveToolState, type SaveWeather } from '@bph/shared';

export type ProgressState = SaveProgress;
export type FlagState = Record<string, boolean>;
export type ToolWearState = Record<string, SaveToolState>;
export type FamilyState = SaveFamily;
export type WeatherState = SaveWeather;

/** Bậc ngoại hình đang mặc (object để scene giữ một chỗ, save / bảng Thử sửa thẳng). */
export interface OutfitState {
  tier: number;
}

/**
 * Cờ đã biết (tên trong save `flags`). Thêm cờ mới: thêm ở đây (+ nút ở data/cheatPanel.json nếu muốn bật bằng bảng Thử).
 * Save có cờ lạ (bản game mới hơn) vẫn giữ nguyên — chỉ cờ trong bảng này mới có nghĩa với game.
 */
export const FLAGS = {
  /** Đã cưới vợ (T-085). */
  married: 'married',
  /** Đã cải tạo bếp gạch (GDD §2: điều kiện cưới; T-048). */
  brickKitchen: 'brickKitchen',
  /** Đã dựng chuồng (sau cưới, GDD §3.11). */
  penBuilt: 'penBuilt',
} as const;
export type FlagId = (typeof FLAGS)[keyof typeof FLAGS];
export const KNOWN_FLAGS: readonly string[] = Object.values(FLAGS);
/** Tên ngắn tiếng Việt của cờ (dòng trạng thái bảng Thử, debug). Cờ lạ hiện nguyên mã. */
export const FLAG_LABELS: Readonly<Record<FlagId, string>> = { married: 'đã cưới', brickKitchen: 'bếp gạch', penBuilt: 'chuồng' };
export const flagLabel = (id: string): string => (FLAG_LABELS as Readonly<Record<string, string>>)[id] ?? id;

/** Mọi trạng thái chặng 4 của MỘT lần chơi (game mới = mặc định của save version 5). */
export interface Stage4State {
  progress: ProgressState;
  flags: FlagState;
  tools: ToolWearState;
  outfit: OutfitState;
  family: FamilyState;
  weather: WeatherState;
}

export function createStage4State(): Stage4State {
  const d = defaultV5Fields();
  return { progress: d.progress, flags: d.flags, tools: d.tools, outfit: { tier: d.outfitTier }, family: d.family, weather: d.weather };
}

// ---------------------------------------------------------------- level (cộng XP / lên level: systems/level.ts, T-042)

/**
 * Đặt THẲNG level (bảng Thử "Lv N", save sửa tay): số nguyên ≥ 1; tiếng tăm trong level về 0, tiếng tăm hôm nay giữ nguyên.
 * Không qua grantXp → không có thẻ "Lên level"; BUG-019: coi như đã xem thẻ tới level này (levelSeen = level) — F5 không bật
 * thẻ của các level vừa nhảy qua. Trả về level sau khi đặt.
 */
export function setLevel(p: ProgressState, level: number): number {
  p.level = Number.isFinite(level) ? Math.max(1, Math.floor(level)) : 1;
  p.xp = 0;
  p.levelSeen = p.level;
  return p.level;
}

// ---------------------------------------------------------------- cờ

export const hasFlag = (flags: FlagState, id: string): boolean => flags[id] === true;

/** Bật / tắt cờ. Tắt = xoá khỏi object (save gọn: chỉ ghi cờ đang bật). */
export function setFlag(flags: FlagState, id: string, on: boolean): void {
  if (on) flags[id] = true;
  else delete flags[id];
}

/** Đảo cờ, trả về trạng thái mới. */
export function toggleFlag(flags: FlagState, id: string): boolean {
  const on = !hasFlag(flags, id);
  setFlag(flags, id, on);
  return on;
}

/** Tên các cờ đang bật, xếp theo tên (debug / dòng trạng thái bảng Thử). */
export function activeFlags(flags: FlagState): string[] {
  return Object.keys(flags)
    .filter((k) => flags[k] === true)
    .sort();
}

// ---------------------------------------------------------------- bậc ngoại hình

/** Kẹp bậc trong 1 … tierCount (số lẻ → làm tròn xuống). */
export function clampOutfitTier(tier: number, tierCount: number): number {
  if (!Number.isFinite(tier)) return 1;
  return Math.min(Math.max(1, Math.floor(tierCount)), Math.max(1, Math.floor(tier)));
}

// ---------------------------------------------------------------- nạp từ save (đã qua kiểm hình dạng ở @bph/shared)

export interface Stage4LoadRules {
  outfitTierCount: number;
  /** Mã nông cụ có thật (tools.json) — độ bền của nông cụ đã bỏ khỏi dữ liệu thì bỏ. */
  isKnownTool: (id: string) => boolean;
}

/** Bản sao sâu của các trường chặng 4 trong save — sửa game sau đó không đổi save và ngược lại. */
export function copyStage4(s: Stage4State): Stage4State {
  return {
    progress: {
      xp: s.progress.xp,
      level: s.progress.level,
      xpToday: s.progress.xpToday,
      levelSeen: s.progress.levelSeen,
      quests: Object.fromEntries(Object.entries(s.progress.quests).map(([id, q]) => [id, { status: q.status, counters: { ...q.counters } }])),
      trackedQuest: s.progress.trackedQuest,
    },
    flags: { ...s.flags },
    tools: Object.fromEntries(Object.entries(s.tools).map(([id, t]) => [id, { durability: t.durability }])),
    outfit: { tier: s.outfit.tier },
    family: { members: s.family.members.map((m) => ({ ...m })), porridgeDays: s.family.porridgeDays },
    weather: { day: s.weather.day, kind: s.weather.kind },
  };
}

/**
 * Nạp phần chặng 4 của save vào trạng thái game — SỬA THẲNG các object trong `into` (scene giữ tham chiếu). Luật khi nạp:
 * bậc đồ kẹp 1…outfitTierCount; nông cụ lạ bỏ; cờ lạ giữ (bản game mới hơn có thể đã đặt — vô hại); nhiệm vụ giữ nguyên
 * (T-043 sẽ bỏ nhiệm vụ không có trong quests.json).
 */
export function loadStage4(from: Stage4State, into: Stage4State, rules: Stage4LoadRules): void {
  const c = copyStage4(from);
  Object.assign(into.progress, c.progress);
  into.progress.level = Math.max(1, Math.floor(into.progress.level));
  replaceRecord(into.flags, c.flags);
  replaceRecord(
    into.tools,
    Object.fromEntries(Object.entries(c.tools).filter(([id]) => rules.isKnownTool(id))),
  );
  into.outfit.tier = clampOutfitTier(c.outfit.tier, rules.outfitTierCount);
  into.family.members = c.family.members;
  into.family.porridgeDays = c.family.porridgeDays;
  into.weather.day = c.weather.day;
  into.weather.kind = c.weather.kind;
}

/** Thay toàn bộ khoá của `target` bằng của `src` (giữ nguyên object `target`). */
function replaceRecord<T>(target: Record<string, T>, src: Record<string, T>): void {
  for (const k of Object.keys(target)) delete target[k];
  Object.assign(target, src);
}
