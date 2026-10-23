// Level + tiếng tăm (T-042, GDD §7). Thuần TS → unit test được.
// - Mọi nguồn XP (hái, hái lượm, cá, săn, chế đồ, sắm đồ, bán ở chợ, nhiệm vụ, bảng Thử) đi qua MỘT hàm `grantXp`: cộng vào
//   tiếng tăm trong level (`progress.xp`) + tiếng tăm hôm nay (`progress.xpToday`), đủ thì lên level (có thể nhiều level một
//   lần), trả về các level vừa đạt để scene hiện thẻ "Lên level N!".
// - Bảng XP: `xpToNextLevel` (level 1…9), từ level 10 mỗi level cần thêm `xpPerLevelAfter10` (GDD: 480 + 90 × (level − 9)).
// - Thẻ "Mở khóa" đọc từ data/levels.json (thêm level = thêm dòng); danh hiệu cạnh level = tên bậc ngoại hình (outfits.json).
import levelsJson from '../data/levels.json';
import outfitsJson from '../data/outfits.json';
import type { LevelData, LevelUnlockData, LevelUnlockKind, OutfitData } from '../data/types';
import { cropById } from './crops';
import type { ProgressState } from './progress';

export interface LevelRules {
  /** XP để lên level kế, theo level hiện tại 1, 2, … (gameConfig.xpToNextLevel). */
  xpToNextLevel: readonly number[];
  /** Từ level 10 trở đi: mỗi level cần thêm bấy nhiêu (gameConfig.xpPerLevelAfter10). */
  xpPerLevelAfter10: number;
}

/**
 * Tiếng tăm cần để từ `level` lên level kế. Level trong bảng → đọc bảng; vượt bảng (10+) → số cuối bảng + xpPerLevelAfter10 ×
 * (số level vượt): 10→11 = 480 + 90 = 570, 11→12 = 660… Luôn ≥ 1 (bảng sai cũng không lặp vô tận khi cộng XP).
 */
export function xpToNext(level: number, rules: LevelRules): number {
  const lv = Number.isFinite(level) ? Math.max(1, Math.floor(level)) : 1;
  const table = rules.xpToNextLevel;
  const need = lv - 1 < table.length ? table[lv - 1] : (table[table.length - 1] ?? 0) + rules.xpPerLevelAfter10 * (lv - table.length);
  return Math.max(1, Math.floor(need));
}

/** Nguồn tiếng tăm (GDD §7) — để debug / thống kê; luật cộng như nhau. */
export type XpSource =
  | 'harvest'
  | 'forage'
  | 'fieldHarvest'
  | 'fish'
  | 'hunt'
  | 'craft'
  | 'outfit'
  | 'marketSale'
  | 'quest'
  | 'dailyChat'
  | 'cheat';

export interface XpGrant {
  source: XpSource;
  /** Tiếng tăm thật sự đã cộng (số nguyên ≥ 0 — số lẻ làm tròn xuống, âm / NaN = 0). */
  amount: number;
  /** Các level vừa đạt, theo thứ tự (vd [3, 4] = lên 2 level một lần). Số level lên được = `levelUps.length`. */
  levelUps: number[];
}

/**
 * Cộng tiếng tăm từ một nguồn (hàm chung cho mọi nguồn). Sửa thẳng `p`: xp trong level, xpToday, level. Đủ XP thì lên level,
 * phần dư mang sang level sau — nhiều level một lần nếu đủ. Trả về số đã cộng + các level vừa đạt.
 */
export function grantXp(p: ProgressState, amount: number, source: XpSource, rules: LevelRules): XpGrant {
  const add = Number.isFinite(amount) && amount > 0 ? Math.floor(amount) : 0;
  const levelUps: number[] = [];
  if (add === 0) return { source, amount: 0, levelUps };
  p.xp += add;
  p.xpToday += add;
  for (let need = xpToNext(p.level, rules); p.xp >= need; need = xpToNext(p.level, rules)) {
    p.xp -= need;
    p.level += 1;
    levelUps.push(p.level);
  }
  return { source, amount: add, levelUps };
}

/** Còn thiếu bao nhiêu tiếng tăm nữa thì lên level kế. */
export function xpRemaining(p: ProgressState, rules: LevelRules): number {
  return Math.max(0, xpToNext(p.level, rules) - p.xp);
}

/** Tỷ lệ thanh XP (0…1) của level hiện tại. */
export function levelBarRatio(p: ProgressState, rules: LevelRules): number {
  return Math.min(1, Math.max(0, p.xp / xpToNext(p.level, rules)));
}

/** XP khi bán ở chợ (bán ngay — chợ phiên Lầy / chợ làng Sung): 1 mỗi `quanPerXp` quan, làm tròn xuống. Thùng bán ở nhà không có. */
export function marketSaleXp(quan: number, quanPerXp: number): number {
  if (!(quan > 0) || !(quanPerXp > 0)) return 0;
  return Math.floor(quan / quanPerXp);
}

/**
 * BUG-019: các level đã đạt mà CHƯA xem thẻ "Lên level" (levelSeen+1 … level, tăng dần) — lúc nạp save xếp lại vào hàng chờ, để
 * F5 / đóng tab giữa lúc thẻ đang hiện hoặc còn chờ không làm mất thẻ. levelSeen ≥ level → rỗng.
 */
export function pendingLevelCards(p: ProgressState): number[] {
  const from = Math.max(1, Math.floor(p.levelSeen)) + 1;
  const out: number[] = [];
  for (let lv = from; lv <= p.level; lv++) out.push(lv);
  return out;
}

/** BUG-019: đã xem (đóng / qua) thẻ của `level` → levelSeen không lùi, chỉ tăng. */
export function markLevelSeen(p: ProgressState, level: number): void {
  if (Number.isFinite(level)) p.levelSeen = Math.max(p.levelSeen, Math.floor(level));
}

/** Qua đêm: lấy tiếng tăm hôm nay (cho màn tổng kết) rồi đặt lại 0 cho ngày mới. */
export function takeXpToday(p: ProgressState): number {
  const n = p.xpToday;
  p.xpToday = 0;
  return n;
}

// ---------------------------------------------------------------- danh hiệu (tên bậc ngoại hình)

export const OUTFITS: readonly OutfitData[] = outfitsJson as OutfitData[];

/** Danh hiệu cạnh level trên HUD = tên bậc ngoại hình (GDD §3.14): bậc 1 "Nghèo kiết xác"… Bậc lạ → "Bậc N". */
export function outfitTitle(tier: number): string {
  return OUTFITS.find((o) => o.tier === tier)?.name ?? `Bậc ${tier}`;
}

/** Chữ HUD góc trên trái: "Lv 1 · Nghèo kiết xác". */
export function levelBadgeText(level: number, tier: number): string {
  return `Lv ${level} · ${outfitTitle(tier)}`;
}

// ---------------------------------------------------------------- thẻ "Mở khóa" (data/levels.json)

/** Nhãn loại trên thẻ (cột trái). */
export const UNLOCK_KIND_LABEL: Readonly<Record<LevelUnlockKind, string>> = {
  area: 'Khu mới',
  crop: 'Cây mới',
  recipe: 'Công thức',
  outfit: 'Có thể sắm',
  feature: 'Việc mới',
};
const UNLOCK_KINDS = Object.keys(UNLOCK_KIND_LABEL);

/** Một dòng trên thẻ, đã đủ chữ (cây đã lấy tên từ crops.json). */
export interface LevelUnlock {
  kind: LevelUnlockKind;
  label: string;
  text: string;
  detail: string | null;
}

const isObj = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x);
const optStr = (x: unknown): boolean => x === undefined || typeof x === 'string';

/** Một mục mở khóa trong JSON có đúng không (cây: id có thật và unlockLevel khớp level của dòng). */
export function isLevelUnlock(u: unknown, level: number): u is LevelUnlockData {
  if (!isObj(u) || typeof u.kind !== 'string' || !UNLOCK_KINDS.includes(u.kind)) return false;
  if (!optStr(u.text) || !optStr(u.detail) || !optStr(u.id)) return false;
  if (u.kind === 'crop') {
    const crop = typeof u.id === 'string' ? cropById(u.id) : undefined;
    return crop !== undefined && crop.unlockLevel === level;
  }
  return typeof u.text === 'string' && u.text.trim() !== '';
}

/**
 * Đọc levels.json: bỏ dòng / mục sai (console.warn — game vẫn chạy khi lỡ gõ sai), level trùng thì gộp. Unit test bắt buộc
 * file thật không có dòng sai.
 */
export function parseLevels(raw: unknown, warn: (msg: string) => void = (m) => console.warn(m)): LevelData[] {
  const rows = isObj(raw) && Array.isArray(raw.levels) ? raw.levels : [];
  const byLevel = new Map<number, LevelData>();
  for (const r of rows) {
    if (!isObj(r) || typeof r.level !== 'number' || !Number.isInteger(r.level) || r.level < 2 || !Array.isArray(r.unlocks)) {
      warn(`[Level] dòng sai trong levels.json: ${JSON.stringify(r)}`);
      continue;
    }
    const level = r.level;
    const row = byLevel.get(level) ?? { level, unlocks: [] };
    for (const u of r.unlocks) {
      if (isLevelUnlock(u, level)) row.unlocks.push(u);
      else warn(`[Level] mục mở khóa sai ở level ${level}: ${JSON.stringify(u)}`);
    }
    byLevel.set(level, row);
  }
  return [...byLevel.values()].sort((a, b) => a.level - b.level);
}

/** Dữ liệu mở khóa của game (đọc một lần). */
export const LEVELS: readonly LevelData[] = parseLevels(levelsJson);

/** Các thứ mở khi đạt `level` (rỗng = level không mở gì mới — thẻ vẫn hiện "Lên level N!"). */
export function unlocksAt(level: number, levels: readonly LevelData[] = LEVELS): LevelUnlock[] {
  const row = levels.find((l) => l.level === level);
  if (!row) return [];
  return row.unlocks.map((u) => ({
    kind: u.kind,
    label: UNLOCK_KIND_LABEL[u.kind],
    text: u.kind === 'crop' ? (u.text ?? cropById(u.id ?? '')?.name ?? u.id ?? '') : (u.text ?? ''),
    detail: u.detail ?? null,
  }));
}

/** Chữ lớn khi lên level. */
export const levelUpHeading = (level: number): string => `Lên level ${level}!`;
