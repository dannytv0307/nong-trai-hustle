// Tạo save từ trạng thái game và nạp save vào trạng thái game (T-008, GDD §12). Thuần TS → unit test được.
// Cấu trúc save + kiểm hình dạng + nâng phiên bản nằm ở @bph/shared (bước 3.4 server dùng lại). File này thêm phần
// "luật game" khi nạp: ô ruộng khớp bản đồ theo toạ độ, mã món / mã cây lạ bị bỏ, số nhát cuốc kẹp trong khoảng,
// Sức / tiền / giờ kẹp hợp lệ — save cũ hoặc bị sửa tay cũng không làm game kẹt.
// Cái KHÔNG lưu (cố ý): hàng chờ việc, nhát cuốc đang giơ chưa chạm, cửa sổ đang mở, bong bóng, nghỉ lầm bầm, chuỗi đêm.
import { GAME_SAVE_VERSION, type GameSave, type SaveFacing, type SaveStack } from '@bph/shared';
import { normalizeMoney, type Wallet } from './economy';
import type { FarmState } from './farm';
import { addItem, type Inventory, type ItemStack } from './inventory';
import type { Facing } from './movement';
import { setStamina, type StaminaState } from './stamina';
import type { DayClockState } from './time';

/** Mọi trạng thái game được lưu (scene gom lại rồi gọi captureSave / applySave). */
export interface SaveWorld {
  playerName: string;
  area: string;
  /** Toạ độ px giữa hộp chân. */
  x: number;
  y: number;
  facing: Facing;
  clock: DayClockState;
  stamina: StaminaState;
  wallet: Wallet;
  farm: FarmState;
  inventory: Inventory;
  sellBox: Inventory;
}

/** Luật game dùng khi nạp (lấy từ gameConfig / dữ liệu). */
export interface SaveRules {
  /** Số nhát cuốc một ô (ô đã cuốc = bằng số này, ô dở = 0 … số này − 1). */
  strikesPerPlot: number;
  /** Độ dài một ngày (giây thật) — giờ lưu không vượt quá. */
  dayLengthSeconds: number;
  /** Kích thước khu (px) — toạ độ ngoài khu bị bỏ (đứng ở chỗ xuất phát). */
  areaWidth: number;
  areaHeight: number;
  isKnownItem: (id: string) => boolean;
  isKnownCrop: (cropId: string) => boolean;
}

/** Kết quả nạp: vị trí nhân vật (null = toạ độ hỏng → để scene đặt ở chỗ xuất phát), tên, hướng mặt. */
export interface AppliedSave {
  playerName: string;
  position: { x: number; y: number } | null;
  facing: Facing;
}

const copyStack = (s: ItemStack | null): SaveStack | null => (s ? { id: s.id, count: s.count } : null);

/** Chụp trạng thái game thành object save (bản sao — sửa game sau đó không đổi save). */
export function captureSave(w: SaveWorld, now: Date): GameSave {
  return {
    version: GAME_SAVE_VERSION,
    savedAt: now.toISOString(),
    player: { name: w.playerName, area: w.area, x: round2(w.x), y: round2(w.y), facing: w.facing as SaveFacing },
    clock: { day: w.clock.day, elapsedSeconds: round3(w.clock.elapsedSeconds) },
    stamina: { current: w.stamina.current, max: w.stamina.max, exhausted: w.stamina.exhausted },
    money: w.wallet.money,
    farm: {
      plots: w.farm.plots.map((p) => ({
        x: p.x,
        y: p.y,
        soil: p.soil,
        tillStrikes: p.tillStrikes,
        crop: p.crop ? { cropId: p.crop.cropId, age: p.crop.age, dryDays: p.crop.dryDays, withered: p.crop.withered } : null,
        watered: p.watered,
      })),
    },
    inventory: { slots: w.inventory.slots.map(copyStack), selected: w.inventory.selected, lastSeedId: w.inventory.lastSeedId },
    sellBox: { slots: w.sellBox.slots.map(copyStack) },
  };
}

/**
 * Nạp save (đã qua parseGameSave) vào trạng thái game — SỬA THẲNG các object trong `w` (farm, gùi, thùng, ví, Sức, đồng hồ).
 * Ô ruộng ghép theo toạ độ (ô có trên bản đồ mà save không có → giữ như mới). Trả về vị trí / tên / hướng để scene đặt nhân vật.
 */
export function applySave(save: GameSave, w: SaveWorld, rules: SaveRules): AppliedSave {
  // Ruộng.
  for (const plot of w.farm.plots) {
    const s = save.farm.plots.find((p) => p.x === plot.x && p.y === plot.y);
    if (!s) continue;
    plot.soil = s.soil;
    plot.tillStrikes = s.soil === 'tilled' ? rules.strikesPerPlot : clampInt(s.tillStrikes, 0, Math.max(0, rules.strikesPerPlot - 1));
    // Cây chỉ nằm trên đất đã cuốc; cây lạ (đã bỏ khỏi crops.json) → ô trống.
    const c = s.crop;
    plot.crop = c && s.soil === 'tilled' && rules.isKnownCrop(c.cropId) ? { cropId: c.cropId, age: Math.max(0, c.age), dryDays: Math.max(0, c.dryDays), withered: c.withered } : null;
    plot.watered = plot.crop !== null && !plot.crop.withered && s.watered;
  }

  // Gùi + thùng bán.
  loadSlots(w.inventory, save.inventory.slots, rules);
  w.inventory.selected = clampInt(save.inventory.selected, 0, w.inventory.hotbarSize - 1);
  const last = save.inventory.lastSeedId;
  w.inventory.lastSeedId = last !== null && rules.isKnownItem(last) ? last : null;
  loadSlots(w.sellBox, save.sellBox.slots, rules);

  // Tiền, Sức (trần Sức theo game hiện tại, không theo save), đồng hồ.
  w.wallet.money = normalizeMoney(save.money);
  setStamina(w.stamina, save.stamina.current);
  w.clock.day = Math.max(1, Math.floor(save.clock.day));
  // Lưu đúng lúc 24:00 (hiếm) → lùi một chút để vào game đồng hồ chạm 24h như thường (ngủ gục), không kẹt ở 24:00.
  w.clock.elapsedSeconds = Math.min(Math.max(0, save.clock.elapsedSeconds), Math.max(0, rules.dayLengthSeconds - 0.001));

  const p = save.player;
  const inside = p.area === w.area && p.x >= 0 && p.y >= 0 && p.x <= rules.areaWidth && p.y <= rules.areaHeight;
  return {
    playerName: p.name.trim() !== '' ? p.name : w.playerName,
    position: inside ? { x: p.x, y: p.y } : null,
    facing: p.facing,
  };
}

/** Chép các ô đồ vào gùi/thùng: bỏ món lạ, kẹp số lượng ≤ stackMax; save có nhiều ô hơn → phần dư xếp vào ô trống. */
function loadSlots(inv: Inventory, slots: readonly (SaveStack | null)[], rules: SaveRules): void {
  const overflow: SaveStack[] = [];
  for (let i = 0; i < inv.slots.length; i++) inv.slots[i] = null;
  slots.forEach((s, i) => {
    if (!s || !rules.isKnownItem(s.id) || s.count <= 0) return;
    const count = Math.min(inv.stackMax, Math.floor(s.count));
    if (i < inv.slots.length) inv.slots[i] = { id: s.id, count };
    else overflow.push({ id: s.id, count });
  });
  for (const s of overflow) addItem(inv, s.id, s.count);
}

function clampInt(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, Math.floor(v)));
}
const round2 = (v: number): number => Math.round(v * 100) / 100;
const round3 = (v: number): number => Math.round(v * 1000) / 1000;
