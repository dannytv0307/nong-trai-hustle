// Bảng "Thử" (T-041, chỉ bản dev — gameConfig.devCheatsEnabled): nhảy nhanh tới phần muốn thử (level, tiền, ngày / mùa,
// món, cờ, bậc đồ, thời tiết, khu) mà không phải chơi lại từ đầu. Thuần TS → unit test được.
//
// Danh sách nút là DỮ LIỆU (data/cheatPanel.json): task sau thêm nút = thêm một dòng JSON. Việc mới chưa có thì thêm một
// loại vào `CheatAction` + một nhánh trong `applyCheat` (và trong `isCheatAction` để JSON được kiểm).
// `applyCheat` chỉ sửa trạng thái thuần (ví, gùi, tiến trình, cờ…); việc cần scene (qua đêm, đặt giờ, đổi khu) trả về
// dạng `task` để GardenScene làm — scene dùng lại đúng các hàm của game (qua đêm như phím G, chuyển khu có màn mờ).
import type { SaveWeatherKind } from '@bph/shared';
import cheatPanelJson from '../data/cheatPanel.json';
import { isAreaId, type AreaId } from './areas';
import { normalizeMoney, setMoney, type Wallet } from './economy';
import { addItem, countOf, type Inventory } from './inventory';
import { grantXp, xpRemaining, xpToNext, type LevelRules } from './level';
import { activeFlags, clampOutfitTier, flagLabel, hasFlag, setLevel, toggleFlag, type FlagState, type Stage4State } from './progress';
import { dayLabel } from './time';

export type CheatAction =
  /** Đặt THẲNG level (không thẻ "Lên level" — nhảy nhanh tới level muốn thử). */
  | { kind: 'setLevel'; level: number }
  /** T-042: lên `delta` level bằng cách cho ĐÚNG số tiếng tăm còn thiếu (qua grantXp → có thẻ "Lên level"). Âm = đặt thẳng. */
  | { kind: 'addLevel'; delta: number }
  /** T-042: cho tiếng tăm (qua grantXp như hái cây — đủ thì lên level, có thẻ). */
  | { kind: 'addXp'; amount: number }
  | { kind: 'addMoney'; amount: number }
  | { kind: 'setMoney'; amount: number }
  /** Qua một đêm như phím G (ruộng lớn, bán thùng, Sức đầy). */
  | { kind: 'nextDay' }
  /** Qua đêm liên tiếp tới ngày đầu mùa kế tiếp. */
  | { kind: 'nextSeason' }
  | { kind: 'setHour'; hour: number }
  /** Đổi món sẽ cho (vòng quanh danh sách mọi món). */
  | { kind: 'pickItem'; delta: number }
  | { kind: 'giveItem'; count: number }
  | { kind: 'toggleFlag'; flag: string }
  | { kind: 'setOutfitTier'; tier: number }
  | { kind: 'setWeather'; weather: SaveWeatherKind }
  /** Đi tới khu (hiện có Vườn, trong nhà; khu sau thêm ở systems/areas.ts là dùng được). */
  | { kind: 'gotoArea'; area: AreaId };

export type CheatActionKind = CheatAction['kind'];

export interface CheatButton {
  /** Chữ trên nút; `{item}` = tên món đang chọn để cho, `{on}` = cờ của nút đang bật ("có" / "không"). */
  label: string;
  action: CheatAction;
  /** Bề rộng nút (px, 1080p). Thiếu = CHEAT_DEFAULT_BUTTON_W. */
  w?: number;
}

export interface CheatRow {
  id: string;
  label: string;
  buttons: CheatButton[];
}

export const CHEAT_DEFAULT_BUTTON_W = 170;

const isNum = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x);
const isObj = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x);

/** Một việc trong JSON có đúng loại + đủ tham số không. */
export function isCheatAction(a: unknown): a is CheatAction {
  if (!isObj(a)) return false;
  switch (a.kind) {
    case 'setLevel':
      return isNum(a.level) && a.level >= 1;
    case 'addLevel':
      return isNum(a.delta);
    case 'addXp':
      return isNum(a.amount) && a.amount > 0;
    case 'addMoney':
    case 'setMoney':
      return isNum(a.amount);
    case 'nextDay':
    case 'nextSeason':
      return true;
    case 'setHour':
      return isNum(a.hour);
    case 'pickItem':
      return isNum(a.delta) && a.delta !== 0;
    case 'giveItem':
      return isNum(a.count) && a.count > 0;
    case 'toggleFlag':
      return typeof a.flag === 'string' && a.flag.length > 0;
    case 'setOutfitTier':
      return isNum(a.tier);
    case 'setWeather':
      return a.weather === 'sun' || a.weather === 'rain';
    case 'gotoArea':
      return typeof a.area === 'string' && isAreaId(a.area);
    default:
      return false;
  }
}

/**
 * Đọc bảng từ JSON: bỏ nút / hàng sai (console.warn — để bảng vẫn mở được khi lỡ gõ sai một dòng). Unit test bắt buộc
 * cheatPanel.json không có dòng sai nào.
 */
export function parseCheatRows(raw: unknown, warn: (msg: string) => void = (m) => console.warn(m)): CheatRow[] {
  const rows = isObj(raw) && Array.isArray(raw.rows) ? raw.rows : [];
  const out: CheatRow[] = [];
  for (const r of rows) {
    if (!isObj(r) || typeof r.id !== 'string' || typeof r.label !== 'string' || !Array.isArray(r.buttons)) {
      warn(`[Thử] hàng sai trong cheatPanel.json: ${JSON.stringify(r)}`);
      continue;
    }
    const buttons: CheatButton[] = [];
    for (const b of r.buttons) {
      if (!isObj(b) || typeof b.label !== 'string' || !isCheatAction(b.action) || (b.w !== undefined && !(isNum(b.w) && b.w > 0))) {
        warn(`[Thử] nút sai ở hàng ${r.id}: ${JSON.stringify(b)}`);
        continue;
      }
      buttons.push({ label: b.label, action: b.action, ...(b.w !== undefined ? { w: b.w as number } : {}) });
    }
    if (buttons.length > 0) out.push({ id: r.id, label: r.label, buttons });
  }
  return out;
}

/** Bảng Thử của game (đọc một lần từ data/cheatPanel.json). */
export const CHEAT_ROWS: readonly CheatRow[] = parseCheatRows(cheatPanelJson);
/** Mọi nút theo thứ tự hàng → nút (chỉ số "phẳng" dùng cho hover / debug). */
export const CHEAT_BUTTONS: readonly CheatButton[] = CHEAT_ROWS.flatMap((r) => r.buttons);

/** Bề rộng từng nút theo hàng (thiếu `w` = CHEAT_DEFAULT_BUTTON_W) — đưa vào ui/cheatLayout.ts để đặt chỗ. */
export function cheatButtonWidths(rows: readonly CheatRow[]): number[][] {
  return rows.map((r) => r.buttons.map((b) => b.w ?? CHEAT_DEFAULT_BUTTON_W));
}

// ---------------------------------------------------------------- chữ trên bảng

export interface CheatLabelView {
  /** Tên món đang chọn để cho. */
  itemName: string;
  flags: FlagState;
}

/** Chữ hiện trên nút (thay {item}, {on}). */
export function cheatButtonLabel(b: CheatButton, v: CheatLabelView): string {
  let s = b.label.split('{item}').join(v.itemName);
  if (b.action.kind === 'toggleFlag') s = s.split('{on}').join(hasFlag(v.flags, b.action.flag) ? 'có' : 'không');
  return s;
}

/** Số đêm phải qua để tới ngày đầu mùa kế tiếp (ngày 1 → 4 đêm → ngày 5 khi mỗi mùa 4 ngày). */
export function nightsToNextSeason(day: number, daysPerSeason: number): number {
  const n = Math.max(1, Math.floor(daysPerSeason));
  const d = Math.max(1, Math.floor(day));
  return n - ((d - 1) % n);
}

export interface CheatStatusView {
  stage4: Stage4State;
  money: number;
  day: number;
  daysPerSeason: number;
  /** T-042: tiếng tăm cần cho level kế — có thì dòng trạng thái ghi "Lv 5 (12/150)". */
  xpNeed?: number;
}

const WEATHER_TEXT: Readonly<Record<SaveWeatherKind, string>> = { sun: 'nắng', rain: 'mưa' };

/**
 * Dòng trạng thái chân bảng (để thấy ngay nút vừa bấm có tác dụng — level chưa có trên HUD tới T-042):
 * "Lv 5 · 500 quan · Ngày 3 · Mùa nắng · Bậc đồ 1 · Trời: — · Cờ: đã cưới".
 */
export function cheatStatusLine(v: CheatStatusView): string {
  const s = v.stage4;
  const w = s.weather.day === v.day ? WEATHER_TEXT[s.weather.kind] : '—';
  const flags = activeFlags(s.flags).map(flagLabel);
  const lv = v.xpNeed !== undefined ? `Lv ${s.progress.level} (${s.progress.xp}/${v.xpNeed})` : `Lv ${s.progress.level}`;
  return [
    lv,
    `${v.money} quan`,
    dayLabel(v.day, v.daysPerSeason),
    `Bậc đồ ${s.outfit.tier}`,
    `Trời: ${w}`,
    `Cờ: ${flags.length > 0 ? flags.join(', ') : '—'}`,
  ].join(' · ');
}

// ---------------------------------------------------------------- làm việc của nút

/** Trạng thái bảng Thử sửa được (scene đưa object thật vào — sửa thẳng). */
export interface CheatState {
  stage4: Stage4State;
  wallet: Wallet;
  inventory: Inventory;
  /** Ngày hiện tại (thời tiết ép là của ngày này). */
  day: number;
  /** Món đang chọn để cho (chỉ số trong `rules.items`). */
  picker: { itemIndex: number };
}

export interface CheatRules {
  /** Mọi mã món cho được (systems/items.ts allItemIds) + tên hiện. */
  items: readonly string[];
  itemName: (id: string) => string;
  /** Món là nông cụ (D-026: mỗi loại một cái, không xếp chồng) — "Cho món" chỉ cho 1 và chỉ khi gùi chưa có (BUG-017). */
  isTool: (id: string) => boolean;
  maxLevel: number;
  outfitTierCount: number;
  daysPerSeason: number;
  /** T-042: bảng XP (nút "Lv +1" / "+50 XP" cộng tiếng tăm qua grantXp). */
  level: LevelRules;
}

/** Việc scene phải làm tiếp (qua đêm n lần như phím G, đặt giờ, đi tới khu). */
export type CheatTask = { kind: 'overnight'; nights: number } | { kind: 'setHour'; hour: number } | { kind: 'gotoArea'; area: AreaId };

export interface CheatResult {
  /** Dòng báo hiện ở chân bảng. */
  message: string;
  /** Tiền đổi bao nhiêu (HUD vẽ chữ bay "+100 quan"). */
  moneyDelta: number;
  /** Gùi đổi → HUD vẽ lại. */
  inventoryChanged: boolean;
  /**
   * Ví bị ghi thẳng (cộng / đặt tiền) → scene bỏ mẻ xu bán hàng đang bay + tiền chờ bay (BUG-018), để số trên HUD khớp ví
   * ngay thay vì tụt rồi hiện "+N quan" của mẻ xu cũ.
   */
  syncMoney: boolean;
  task: CheatTask | null;
  /** T-042: các level vừa đạt qua grantXp ("Lv +1", "+50 XP") → scene xếp thẻ "Lên level" (hiện khi đóng bảng). */
  levelUps: number[];
}

const done = (message: string, extra: Partial<CheatResult> = {}): CheatResult => ({
  message,
  moneyDelta: 0,
  inventoryChanged: false,
  syncMoney: false,
  task: null,
  levelUps: [],
  ...extra,
});

/** Chữ báo sau khi cộng tiếng tăm: "+50 tiếng tăm → Lv 2 (20/60)" / "… — lên Lv 3, 4!". */
function xpMessage(prefix: string, levelUps: readonly number[], p: Stage4State['progress'], rules: CheatRules): string {
  const now = `Lv ${p.level} (${p.xp}/${p.xp + xpRemaining(p, rules.level)})`;
  return levelUps.length > 0 ? `${prefix} — lên Lv ${levelUps.join(', ')}! Thẻ hiện khi đóng bảng · ${now}` : `${prefix} · ${now}`;
}

/** Món đang chọn để cho (chỉ số vòng quanh danh sách). */
export function pickedItem(s: CheatState, rules: CheatRules): string | null {
  const n = rules.items.length;
  if (n === 0) return null;
  return rules.items[((Math.floor(s.picker.itemIndex) % n) + n) % n];
}

/** Chỉ số món chọn sẵn khi mở game: món đầu tiên KHÔNG phải nông cụ (BUG-017 — "Cho 10" ngay là ra 10 hạt). */
export function defaultPickIndex(rules: CheatRules): number {
  return Math.max(0, rules.items.findIndex((id) => !rules.isTool(id)));
}

/** Làm việc của một nút. Không bao giờ ném lỗi; tiền không âm (economy). */
export function applyCheat(action: CheatAction, s: CheatState, rules: CheatRules): CheatResult {
  const p = s.stage4.progress;
  switch (action.kind) {
    case 'addLevel': {
      if (action.delta <= 0) {
        const level = setLevel(p, Math.max(1, p.level + action.delta));
        return done(`Đặt Lv ${level} (tiếng tăm trong level về 0, không hiện thẻ)`);
      }
      // Cho đúng số tiếng tăm còn thiếu tới level đích (không vượt trần nút) → đi qua grantXp như chơi thật, có thẻ.
      const target = Math.min(rules.maxLevel, p.level + Math.floor(action.delta));
      if (target <= p.level) return done(`Đã ở Lv ${p.level} (trần nút thử ${rules.maxLevel})`);
      let amount = -p.xp;
      for (let lv = p.level; lv < target; lv++) amount += xpToNext(lv, rules.level);
      const g = grantXp(p, amount, 'cheat', rules.level);
      return done(xpMessage(`+${g.amount} tiếng tăm`, g.levelUps, p, rules), { levelUps: g.levelUps });
    }
    case 'setLevel': {
      const level = setLevel(p, Math.min(rules.maxLevel, Math.max(1, action.level)));
      return done(`Đặt Lv ${level} (tiếng tăm trong level về 0, không hiện thẻ)`);
    }
    case 'addXp': {
      const g = grantXp(p, action.amount, 'cheat', rules.level);
      return done(xpMessage(`+${g.amount} tiếng tăm`, g.levelUps, p, rules), { levelUps: g.levelUps });
    }
    case 'addMoney':
    case 'setMoney': {
      const before = s.wallet.money;
      setMoney(s.wallet, action.kind === 'addMoney' ? before + normalizeMoney(action.amount) : action.amount);
      const delta = s.wallet.money - before;
      return done(`Tiền: ${s.wallet.money} quan (${delta >= 0 ? '+' : '−'}${Math.abs(delta)})`, { moneyDelta: delta, syncMoney: true });
    }
    case 'nextDay':
      return done('Qua 1 đêm (như phím G)', { task: { kind: 'overnight', nights: 1 } });
    case 'nextSeason': {
      const nights = nightsToNextSeason(s.day, rules.daysPerSeason);
      return done(`Qua ${nights} đêm tới đầu mùa sau`, { task: { kind: 'overnight', nights } });
    }
    case 'setHour':
      return done(`Đặt giờ ${String(Math.floor(action.hour)).padStart(2, '0')}:00`, { task: { kind: 'setHour', hour: action.hour } });
    case 'pickItem': {
      const n = rules.items.length;
      if (n > 0) s.picker.itemIndex = (((s.picker.itemIndex + Math.sign(action.delta)) % n) + n) % n;
      const id = pickedItem(s, rules);
      return done(id ? `Chọn món: ${rules.itemName(id)}` : 'Không có món nào');
    }
    case 'giveItem': {
      const id = pickedItem(s, rules);
      if (!id) return done('Không có món nào');
      const name = rules.itemName(id);
      // BUG-017: nông cụ mỗi loại một cái (D-026) — gùi đã có thì không cho thêm (chồng "cuốc ×11" không thấy, lại bị lưu).
      const tool = rules.isTool(id);
      if (tool && countOf(s.inventory, id) > 0) return done(`Gùi đã có ${name} rồi (nông cụ mỗi loại 1 cái)`);
      const want = tool ? 1 : Math.floor(action.count);
      const r = addItem(s.inventory, id, want);
      if (r.added <= 0) return done('Gùi đầy rồi — không cho thêm được');
      const msg = r.added < want ? `Cho ${r.added} ${name} (gùi đầy, thiếu ${want - r.added})` : `Cho ${r.added} ${name}`;
      return done(msg, { inventoryChanged: true });
    }
    case 'toggleFlag': {
      const on = toggleFlag(s.stage4.flags, action.flag);
      return done(`Cờ "${flagLabel(action.flag)}": ${on ? 'bật' : 'tắt'}`);
    }
    case 'setOutfitTier': {
      s.stage4.outfit.tier = clampOutfitTier(action.tier, rules.outfitTierCount);
      return done(`Bậc đồ ${s.stage4.outfit.tier} (hình nhân vật đổi ở T-065…)`);
    }
    case 'setWeather': {
      s.stage4.weather.day = s.day;
      s.stage4.weather.kind = action.weather;
      return done(`Trời hôm nay: ${WEATHER_TEXT[action.weather]} (mưa có tác dụng từ T-047)`);
    }
    case 'gotoArea':
      return done(`Đi tới khu ${action.area}`, { task: { kind: 'gotoArea', area: action.area } });
  }
}
