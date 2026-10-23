// T-041: bảng Thử — dữ liệu nút (cheatPanel.json) hợp lệ + vừa khung, việc của từng loại nút, chữ nút, dòng trạng thái.
import { describe, expect, it, vi } from 'vitest';
import cheatPanelJson from '../data/cheatPanel.json';
import { gameConfig } from '../config/gameConfig';
import { CHEAT_PANEL, cheatButtonAt, cheatButtonSlots, cheatFooterLines, cheatPanelRect, cheatRowWidth } from '../ui/cheatLayout';
import {
  applyCheat,
  CHEAT_BUTTONS,
  CHEAT_ROWS,
  cheatButtonLabel,
  cheatButtonWidths,
  cheatStatusLine,
  defaultPickIndex,
  isCheatAction,
  nightsToNextSeason,
  parseCheatRows,
  pickedItem,
  type CheatAction,
  type CheatRules,
  type CheatState,
} from './cheats';
import { createWallet } from './economy';
import { countOf, createInventory, setSlot } from './inventory';
import { allItemIds, HOE_ITEM_ID, isToolItem, itemInfo } from './items';
import { createStage4State, KNOWN_FLAGS } from './progress';

const RULES: CheatRules = {
  items: allItemIds(),
  itemName: (id) => itemInfo(id)?.name ?? id,
  isTool: isToolItem,
  maxLevel: gameConfig.cheatMaxLevel,
  outfitTierCount: gameConfig.outfitTierCount,
  daysPerSeason: 4,
};

function state(): CheatState {
  return {
    stage4: createStage4State(),
    wallet: createWallet(60),
    inventory: createInventory(gameConfig.bagSlotsStart, gameConfig.hotbarSlots, gameConfig.stackMax),
    day: 3,
    picker: { itemIndex: 0 },
  };
}

const run = (a: CheatAction, s = state()) => ({ s, r: applyCheat(a, s, RULES) });

describe('cheatPanel.json', () => {
  it('mọi hàng / nút đều hợp lệ (không dòng nào bị bỏ)', () => {
    const warn = vi.fn();
    const rows = parseCheatRows(cheatPanelJson, warn);
    expect(warn).not.toHaveBeenCalled();
    expect(rows.length).toBe(cheatPanelJson.rows.length);
    expect(rows.flatMap((r) => r.buttons).length).toBe(cheatPanelJson.rows.reduce((n, r) => n + r.buttons.length, 0));
    expect(CHEAT_BUTTONS.length).toBeGreaterThan(10);
  });

  it('có đủ các nút đặc tả: đặt level, +100 quan, đặt 500 quan, nhảy ngày / mùa, cho món, bật cờ, mở khu', () => {
    const kinds = new Set(CHEAT_BUTTONS.map((b) => b.action.kind));
    for (const k of ['setLevel', 'addMoney', 'setMoney', 'nextDay', 'nextSeason', 'giveItem', 'pickItem', 'toggleFlag', 'gotoArea'] as const) {
      expect(kinds.has(k), k).toBe(true);
    }
    expect(CHEAT_BUTTONS.some((b) => b.action.kind === 'addMoney' && b.action.amount === 100)).toBe(true);
    expect(CHEAT_BUTTONS.some((b) => b.action.kind === 'setMoney' && b.action.amount === 500)).toBe(true);
    expect(CHEAT_BUTTONS.some((b) => b.action.kind === 'setLevel' && b.action.level === 5)).toBe(true);
  });

  it('cờ trong bảng đều là cờ đã biết; nhãn nút không trùng nhau (QA bấm theo chữ)', () => {
    for (const b of CHEAT_BUTTONS) if (b.action.kind === 'toggleFlag') expect(KNOWN_FLAGS).toContain(b.action.flag);
    const labels = CHEAT_BUTTONS.map((b) => b.label);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it('nút / hàng sai bị bỏ + cảnh báo, bảng vẫn dựng được', () => {
    const warn = vi.fn();
    const rows = parseCheatRows(
      {
        rows: [
          { id: 'a', label: 'A', buttons: [{ label: 'ok', action: { kind: 'nextDay' } }, { label: 'sai', action: { kind: 'bay' } }] },
          { id: 'b', label: 'B', buttons: [{ label: 'khu lạ', action: { kind: 'gotoArea', area: 'mat-trang' } }] },
          'rác',
        ],
      },
      warn,
    );
    expect(rows).toEqual([{ id: 'a', label: 'A', buttons: [{ label: 'ok', action: { kind: 'nextDay' } }] }]);
    expect(warn).toHaveBeenCalledTimes(3);
    expect(parseCheatRows(null, warn)).toEqual([]);
    expect(isCheatAction({ kind: 'setWeather', weather: 'snow' })).toBe(false);
    expect(isCheatAction({ kind: 'giveItem', count: 0 })).toBe(false);
  });
});

describe('bố cục bảng Thử', () => {
  const widths = cheatButtonWidths(CHEAT_ROWS);
  const slots = cheatButtonSlots(widths);
  const panel = cheatPanelRect(CHEAT_ROWS.length);

  it('bảng nằm gọn trong màn 1920×1080 (kể cả nút X nhô lên), mọi hàng nút vừa khung', () => {
    expect(panel.x).toBeGreaterThanOrEqual(0);
    expect(panel.y).toBeGreaterThanOrEqual(30);
    expect(panel.y + panel.h).toBeLessThanOrEqual(gameConfig.gameHeight);
    for (const ws of widths) expect(CHEAT_PANEL.pad + CHEAT_PANEL.labelW + cheatRowWidth(ws) + CHEAT_PANEL.pad).toBeLessThanOrEqual(panel.w);
    for (const s of slots) expect(s.rect.x + s.rect.w).toBeLessThanOrEqual(panel.x + panel.w - CHEAT_PANEL.pad);
    const lastRowBottom = Math.max(...slots.map((s) => s.rect.y + s.rect.h));
    expect(cheatFooterLines(CHEAT_ROWS.length).status).toBeGreaterThan(lastRowBottom + 12);
  });

  it('một nút cho mỗi mục CHEAT_BUTTONS; tâm nút trỏ đúng nút đó, khe giữa nút không trúng', () => {
    expect(slots.length).toBe(CHEAT_BUTTONS.length);
    for (const s of slots) expect(cheatButtonAt(s.rect.x + s.rect.w / 2, s.rect.y + s.rect.h / 2, slots)).toBe(s.flat);
    const a = slots[0].rect;
    expect(cheatButtonAt(a.x + a.w + CHEAT_PANEL.buttonGap / 2, a.y + 10, slots)).toBe(-1);
    expect(cheatButtonAt(panel.x + 10, panel.y + 10, slots)).toBe(-1);
  });
});

describe('việc của nút (applyCheat)', () => {
  it('đặt level / +1 (trần cheatMaxLevel, sàn 1)', () => {
    const { s } = run({ kind: 'setLevel', level: 5 });
    expect(s.stage4.progress.level).toBe(5);
    applyCheat({ kind: 'addLevel', delta: 1 }, s, RULES);
    expect(s.stage4.progress.level).toBe(6);
    applyCheat({ kind: 'setLevel', level: 999 }, s, RULES);
    expect(s.stage4.progress.level).toBe(gameConfig.cheatMaxLevel);
    applyCheat({ kind: 'addLevel', delta: -999 }, s, RULES);
    expect(s.stage4.progress.level).toBe(1);
  });

  it('+100 quan, đặt 500, đặt 0: báo đúng số tiền đổi', () => {
    const { s, r } = run({ kind: 'addMoney', amount: 100 });
    expect(s.wallet.money).toBe(160);
    expect(r.moneyDelta).toBe(100);
    const r2 = applyCheat({ kind: 'setMoney', amount: 500 }, s, RULES);
    expect(s.wallet.money).toBe(500);
    expect(r2.moneyDelta).toBe(340);
    const r3 = applyCheat({ kind: 'setMoney', amount: 0 }, s, RULES);
    expect(s.wallet.money).toBe(0);
    expect(r3.moneyDelta).toBe(-500);
    expect(r3.message).toContain('0 quan');
    // BUG-018: mọi nút ghi thẳng vào ví đều báo scene xả xu đang bay (kể cả đặt đúng số đang có — chênh 0).
    expect([r.syncMoney, r2.syncMoney, r3.syncMoney]).toEqual([true, true, true]);
    expect(applyCheat({ kind: 'setMoney', amount: 0 }, s, RULES).syncMoney).toBe(true);
    expect(applyCheat({ kind: 'nextDay' }, s, RULES).syncMoney).toBe(false);
    expect(applyCheat({ kind: 'giveItem', count: 1 }, s, RULES).syncMoney).toBe(false);
  });

  it('BUG-017: món chọn sẵn không phải nông cụ; nông cụ chỉ cho 1 cái và chỉ khi gùi chưa có', () => {
    const start = defaultPickIndex(RULES);
    expect(isToolItem(RULES.items[start])).toBe(false);
    expect(defaultPickIndex({ ...RULES, items: ['cuoc-go'] })).toBe(0); // toàn nông cụ → vẫn chọn được
    // Gùi game mới: cuốc ở ô 1. "Cho 10" với cuốc → không đổi gì.
    const s = state();
    setSlot(s.inventory, 0, HOE_ITEM_ID, 1);
    s.picker.itemIndex = RULES.items.indexOf(HOE_ITEM_ID);
    const r = applyCheat({ kind: 'giveItem', count: 10 }, s, RULES);
    expect(r.inventoryChanged).toBe(false);
    expect(r.message).toContain('đã có');
    expect(s.inventory.slots[0]).toEqual({ id: HOE_ITEM_ID, count: 1 });
    expect(countOf(s.inventory, HOE_ITEM_ID)).toBe(1);
    // Gùi chưa có cuốc → "Cho 10" chỉ cho đúng 1.
    const empty = state();
    empty.picker.itemIndex = RULES.items.indexOf(HOE_ITEM_ID);
    const r2 = applyCheat({ kind: 'giveItem', count: 10 }, empty, RULES);
    expect(r2.inventoryChanged).toBe(true);
    expect(countOf(empty.inventory, HOE_ITEM_ID)).toBe(1);
    expect(r2.message).toBe(`Cho 1 ${itemInfo(HOE_ITEM_ID)!.name}`);
    // Món chọn sẵn "Cho 10" → 10 cái xếp một chồng.
    const fresh = state();
    fresh.picker.itemIndex = start;
    applyCheat({ kind: 'giveItem', count: 10 }, fresh, RULES);
    expect(countOf(fresh.inventory, RULES.items[start])).toBe(10);
  });

  it('nhảy ngày / mùa trả việc qua đêm cho scene; đặt giờ; đi tới khu', () => {
    expect(run({ kind: 'nextDay' }).r.task).toEqual({ kind: 'overnight', nights: 1 });
    expect(run({ kind: 'nextSeason' }).r.task).toEqual({ kind: 'overnight', nights: 2 }); // ngày 3 → ngày 5 (mùa mưa)
    expect(run({ kind: 'setHour', hour: 18 }).r.task).toEqual({ kind: 'setHour', hour: 18 });
    expect(run({ kind: 'gotoArea', area: 'house' }).r.task).toEqual({ kind: 'gotoArea', area: 'house' });
  });

  it('nightsToNextSeason: ngày nào cũng tới ĐÚNG ngày đầu mùa kế', () => {
    for (let day = 1; day <= 20; day++) {
      const to = day + nightsToNextSeason(day, 4);
      expect((to - 1) % 4, `ngày ${day}`).toBe(0);
      expect(to).toBeGreaterThan(day);
      expect(to - day).toBeLessThanOrEqual(4);
    }
    expect(nightsToNextSeason(1, 4)).toBe(4);
    expect(nightsToNextSeason(4, 4)).toBe(1);
  });

  it('chọn món vòng quanh danh sách; cho món vào gùi; gùi đầy thì báo, không mất', () => {
    const s = state();
    expect(pickedItem(s, RULES)).toBe(RULES.items[0]);
    applyCheat({ kind: 'pickItem', delta: -1 }, s, RULES);
    expect(pickedItem(s, RULES)).toBe(RULES.items[RULES.items.length - 1]);
    applyCheat({ kind: 'pickItem', delta: 1 }, s, RULES);
    applyCheat({ kind: 'pickItem', delta: 1 }, s, RULES);
    const id = RULES.items[1];
    expect(pickedItem(s, RULES)).toBe(id);
    const r = applyCheat({ kind: 'giveItem', count: 10 }, s, RULES);
    expect(r.inventoryChanged).toBe(true);
    expect(countOf(s.inventory, id)).toBe(10);
    // Gùi đầy (mọi ô có món khác, đầy chồng).
    const full = state();
    for (let i = 0; i < full.inventory.slots.length; i++) setSlot(full.inventory, i, RULES.items[0], gameConfig.stackMax);
    full.picker.itemIndex = 1;
    const r2 = applyCheat({ kind: 'giveItem', count: 1 }, full, RULES);
    expect(r2.inventoryChanged).toBe(false);
    expect(r2.message).toContain('Gùi đầy');
  });

  it('danh sách món gồm nông cụ, hạt và nông sản — món nào cũng có tên', () => {
    expect(RULES.items).toContain('cuoc-go');
    expect(RULES.items).toContain('hat-rau-cai');
    expect(RULES.items).toContain('khoai-lang');
    for (const id of RULES.items) expect(itemInfo(id), id).not.toBeNull();
  });

  it('bật / tắt cờ, bậc đồ (kẹp), thời tiết hôm nay', () => {
    const s = state();
    applyCheat({ kind: 'toggleFlag', flag: 'married' }, s, RULES);
    expect(s.stage4.flags).toEqual({ married: true });
    applyCheat({ kind: 'toggleFlag', flag: 'married' }, s, RULES);
    expect(s.stage4.flags).toEqual({});
    applyCheat({ kind: 'setOutfitTier', tier: 3 }, s, RULES);
    expect(s.stage4.outfit.tier).toBe(3);
    applyCheat({ kind: 'setOutfitTier', tier: 9 }, s, RULES);
    expect(s.stage4.outfit.tier).toBe(4);
    applyCheat({ kind: 'setWeather', weather: 'rain' }, s, RULES);
    expect(s.stage4.weather).toEqual({ day: 3, kind: 'rain' });
  });
});

describe('chữ trên bảng', () => {
  it('{item} = tên món đang chọn, {on} = cờ của nút có / không', () => {
    const flagBtn = CHEAT_BUTTONS.find((b) => b.action.kind === 'toggleFlag' && b.action.flag === 'married')!;
    expect(cheatButtonLabel(flagBtn, { itemName: '', flags: {} })).toBe('Đã cưới: không');
    expect(cheatButtonLabel(flagBtn, { itemName: '', flags: { married: true } })).toBe('Đã cưới: có');
    const itemBtn = CHEAT_BUTTONS.find((b) => b.label.includes('{item}'))!;
    expect(cheatButtonLabel(itemBtn, { itemName: 'Hạt rau cải', flags: {} })).toBe('Hạt rau cải');
  });

  it('dòng trạng thái: level, tiền, ngày + mùa, bậc đồ, trời, cờ', () => {
    const s = state();
    s.stage4.progress.level = 5;
    s.stage4.flags.brickKitchen = true;
    expect(cheatStatusLine({ stage4: s.stage4, money: 500, day: 6, daysPerSeason: 4 })).toBe(
      'Lv 5 · 500 quan · Ngày 6 · Mùa mưa · Bậc đồ 1 · Trời: — · Cờ: bếp gạch',
    );
    s.stage4.weather = { day: 6, kind: 'rain' };
    expect(cheatStatusLine({ stage4: s.stage4, money: 0, day: 6, daysPerSeason: 4 })).toContain('Trời: mưa');
  });
});
