// Cấu trúc save game (T-008, GDD §12) — DÙNG CHUNG client và server (bước 3.4 gửi đúng object này lên PUT /api/save).
// Ở đây chỉ kiểm HÌNH DẠNG (đúng kiểu, đủ trường, số hữu hạn…) — không biết luật game. Kiểm theo luật game (mã cây có
// tồn tại không, ô ruộng có khớp bản đồ không, số nhát cuốc tối đa…) do client làm lúc nạp (client/src/systems/save.ts).
// Không dùng thư viện kiểm tra (zod…) — viết tay cho nhẹ, dễ đọc.

/**
 * Phiên bản định dạng save hiện tại. Đổi cấu trúc → tăng số này + thêm một bước trong SAVE_MIGRATIONS.
 * - 1 (T-008): bản đầu.
 * - 2 (T-093): thêm `chest` (rương trong nhà {ten}); `player.area` có thêm giá trị 'house' (cảnh trong nhà).
 */
export const GAME_SAVE_VERSION = 2;

export type SaveFacing = 'up' | 'down' | 'left' | 'right';
export type SaveSoil = 'untilled' | 'tilled';

/** Cây trên một ô ruộng. */
export interface SaveCrop {
  cropId: string;
  /** Số ngày đã lớn. */
  age: number;
  /** Số đêm liền không được tưới (khát). */
  dryDays: number;
  withered: boolean;
}

/** Một ô ruộng (khớp với ô trên bản đồ theo toạ độ x, y). */
export interface SavePlot {
  x: number;
  y: number;
  soil: SaveSoil;
  /** Số nhát cuốc đã bổ (D-022) — ô cuốc dở còn nguyên sau F5. */
  tillStrikes: number;
  crop: SaveCrop | null;
  /** Đã tưới hôm nay. */
  watered: boolean;
}

/** Một chồng đồ (ô trống là null). */
export interface SaveStack {
  id: string;
  count: number;
}

export interface GameSaveV1 {
  version: 1;
  /** Lúc lưu (giờ thật, ISO 8601) — để so bản mới hơn khi có server (bước 3.4). */
  savedAt: string;
  player: {
    /** Tên nhân vật ({ten}). */
    name: string;
    /** Khu đang đứng: 'garden' (Vườn) hoặc 'house' (trong nhà {ten}, từ version 2). Khu lạ → client cho đứng ở Vườn. */
    area: string;
    /** Toạ độ px giữa hộp chân, tính TỪ GÓC TRÊN-TRÁI của khu (không phải toạ độ thế giới Phaser). */
    x: number;
    y: number;
    facing: SaveFacing;
  };
  /** Ngày thứ mấy + số giây thật đồng hồ đã CHẠY trong ngày (giờ game suy ra từ đây). */
  clock: { day: number; elapsedSeconds: number };
  stamina: { current: number; max: number; exhausted: boolean };
  /** Tiền (quan). */
  money: number;
  farm: { plots: SavePlot[] };
  /** Gùi (hàng đầu = hotbar), ô hotbar đang chọn, hạt gieo lần trước. */
  inventory: { slots: (SaveStack | null)[]; selected: number; lastSeedId: string | null };
  /** Đồ trong thùng bán (chưa thành tiền — bán lúc qua đêm). */
  sellBox: { slots: (SaveStack | null)[] };
}

/** Version 2 (T-093): như version 1 + rương trong nhà. */
export interface GameSaveV2 extends Omit<GameSaveV1, 'version'> {
  version: 2;
  /** Đồ trong rương (cất giữ, không bán). Save version 1 nâng lên → rương trống. */
  chest: { slots: (SaveStack | null)[] };
}

/** Save ở định dạng hiện tại. */
export type GameSave = GameSaveV2;

export type SaveParseResult =
  | { ok: true; save: GameSave; /** Phiên bản gốc trước khi nâng cấp (= GAME_SAVE_VERSION nếu không cần nâng). */ fromVersion: number }
  | { ok: false; reason: string };

/**
 * Các bước nâng cấp save cũ: khóa n = hàm biến save phiên bản n thành phiên bản n + 1 (object thô, chưa kiểm).
 * 1 → 2 (T-093): thêm rương trống; khu cũ ('garden') giữ nguyên — người chơi vẫn đứng ở Vườn như lúc lưu.
 */
export const SAVE_MIGRATIONS: Readonly<Record<number, (old: Record<string, unknown>) => Record<string, unknown>>> = {
  1: (old) => ({ ...old, version: 2, chest: { slots: [] } }),
};

/** Ghi save ra chuỗi JSON (để lưu localStorage / gửi server). */
export function serializeGameSave(save: GameSave): string {
  return JSON.stringify(save);
}

/** Đọc chuỗi JSON → save hợp lệ (đã nâng cấp lên phiên bản hiện tại), hoặc lý do hỏng. Không bao giờ ném lỗi. */
export function parseGameSave(text: string | null | undefined): SaveParseResult {
  if (text === null || text === undefined || text === '') return { ok: false, reason: 'trống' };
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, reason: 'JSON lỗi' };
  }
  return validateGameSave(raw);
}

/** Kiểm một object (đã JSON.parse) → save hợp lệ, có nâng cấp từ phiên bản cũ. */
export function validateGameSave(raw: unknown): SaveParseResult {
  if (!isObj(raw)) return { ok: false, reason: 'không phải object' };
  const v = raw.version;
  if (typeof v !== 'number' || !Number.isInteger(v) || v < 1) return { ok: false, reason: 'thiếu / sai version' };
  if (v > GAME_SAVE_VERSION) return { ok: false, reason: `version ${v} mới hơn game (${GAME_SAVE_VERSION})` };
  let cur: Record<string, unknown> = raw;
  for (let n = v; n < GAME_SAVE_VERSION; n++) {
    const step = SAVE_MIGRATIONS[n];
    if (!step) return { ok: false, reason: `không có cách nâng version ${n} → ${n + 1}` };
    try {
      cur = step(cur);
    } catch {
      return { ok: false, reason: `nâng version ${n} lỗi` };
    }
  }
  const problem = checkCurrent(cur);
  if (problem) return { ok: false, reason: problem };
  return { ok: true, save: cur as unknown as GameSave, fromVersion: v };
}

// ---------------------------------------------------------------- kiểm hình dạng

function isObj(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}
const isNum = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x);
const isInt = (x: unknown): x is number => isNum(x) && Number.isInteger(x);
const isStr = (x: unknown): x is string => typeof x === 'string';
const isBool = (x: unknown): x is boolean => typeof x === 'boolean';
const FACINGS: readonly string[] = ['up', 'down', 'left', 'right'];

function checkStack(s: unknown): boolean {
  return s === null || (isObj(s) && isStr(s.id) && s.id.length > 0 && isInt(s.count) && s.count > 0);
}

function checkSlots(slots: unknown): boolean {
  return Array.isArray(slots) && slots.every(checkStack);
}

function checkCrop(c: unknown): boolean {
  if (c === null) return true;
  return isObj(c) && isStr(c.cropId) && isInt(c.age) && c.age >= 0 && isInt(c.dryDays) && c.dryDays >= 0 && isBool(c.withered);
}

function checkPlot(p: unknown): boolean {
  return (
    isObj(p) &&
    isInt(p.x) &&
    isInt(p.y) &&
    (p.soil === 'untilled' || p.soil === 'tilled') &&
    isInt(p.tillStrikes) &&
    p.tillStrikes >= 0 &&
    checkCrop(p.crop) &&
    isBool(p.watered)
  );
}

/** Trả về mô tả trường sai đầu tiên, hoặc null nếu đúng hình dạng phiên bản hiện tại (2). */
function checkCurrent(s: Record<string, unknown>): string | null {
  if (s.version !== GAME_SAVE_VERSION) return 'version';
  if (!isStr(s.savedAt)) return 'savedAt';
  const p = s.player;
  if (!isObj(p) || !isStr(p.name) || !isStr(p.area) || !isNum(p.x) || !isNum(p.y) || !isStr(p.facing) || !FACINGS.includes(p.facing)) {
    return 'player';
  }
  const c = s.clock;
  if (!isObj(c) || !isInt(c.day) || c.day < 1 || !isNum(c.elapsedSeconds) || c.elapsedSeconds < 0) return 'clock';
  const st = s.stamina;
  if (!isObj(st) || !isNum(st.current) || !isNum(st.max) || st.max <= 0 || !isBool(st.exhausted)) return 'stamina';
  if (!isNum(s.money) || s.money < 0) return 'money';
  const f = s.farm;
  if (!isObj(f) || !Array.isArray(f.plots) || !f.plots.every(checkPlot)) return 'farm';
  const inv = s.inventory;
  if (!isObj(inv) || !checkSlots(inv.slots) || !isInt(inv.selected) || inv.selected < 0 || !(inv.lastSeedId === null || isStr(inv.lastSeedId))) {
    return 'inventory';
  }
  const box = s.sellBox;
  if (!isObj(box) || !checkSlots(box.slots)) return 'sellBox';
  const chest = s.chest;
  if (!isObj(chest) || !checkSlots(chest.slots)) return 'chest';
  return null;
}
