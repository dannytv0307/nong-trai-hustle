// T-009 (D-026): cái cuốc là một món trong gùi/hotbar — phải chọn ô cuốc mới cuốc; không bán, không ăn, không mất;
// save cũ chưa có cuốc → nạp xong tự thêm vào ô trống đầu tiên.
import { describe, expect, it } from 'vitest';
import { GAME_SAVE_VERSION, type GameSave } from '@bph/shared';
import { gameConfig } from '../config/gameConfig';
import { cropById } from './crops';
import { canSellItem, createWallet, sellBoxContents, sellPriceOf } from './economy';
import { createFarm } from './farm';
import { addItem, countOf, createInventory, moveFromSlot, selectSlot, setSlot } from './inventory';
import {
  canTillWithSelected,
  createStartInventory,
  HOE_ITEM_ID,
  isToolItem,
  itemInfo,
  pickSeedSlot,
  seedItemId,
  selectedToolUse,
  staminaRestoreOf,
} from './items';
import { applySave, ensureItem, type SaveRules, type SaveWorld } from './save';
import { createStamina } from './stamina';
import { createDayClock } from './time';

const startInv = () =>
  createStartInventory(gameConfig.startSeeds, gameConfig.bagSlotsStart, gameConfig.hotbarSlots, gameConfig.stackMax, gameConfig.startTools);

describe('cái cuốc là món trong gùi', () => {
  it('có trong tools.json, gameConfig.startTools có cuốc', () => {
    expect(isToolItem(HOE_ITEM_ID)).toBe(true);
    expect(gameConfig.startTools).toContain(HOE_ITEM_ID);
    expect(itemInfo(HOE_ITEM_ID)).toMatchObject({ kind: 'tool', name: 'Cuốc gỗ', staminaRestore: 0 });
    expect(isToolItem('hat-rau-cai')).toBe(false);
  });

  it('game mới: cuốc ở ô 1 (đang chọn), hạt xếp sau từ ô 2', () => {
    const inv = startInv();
    expect(inv.selected).toBe(0);
    expect(inv.slots[0]).toEqual({ id: HOE_ITEM_ID, count: 1 });
    expect(inv.slots[1]?.id).toBe(seedItemId('rau-cai'));
    expect(inv.slots[2]?.id).toBe(seedItemId('khoai-lang'));
    expect(canTillWithSelected(inv)).toBe(true);
  });

  it('chỉ cuốc được khi ô hotbar đang chọn là cuốc', () => {
    const inv = startInv();
    expect(selectedToolUse(inv)).toBe('till');
    selectSlot(inv, 1); // cầm hạt
    expect(canTillWithSelected(inv)).toBe(false);
    expect(selectedToolUse(inv)).toBeNull();
    selectSlot(inv, 5); // ô trống
    expect(canTillWithSelected(inv)).toBe(false);
    // Cuốc đổi chỗ sang ô 4 → chọn ô 4 mới cuốc được.
    setSlot(inv, 0, null, 0);
    setSlot(inv, 3, HOE_ITEM_ID, 1);
    selectSlot(inv, 3);
    expect(canTillWithSelected(inv)).toBe(true);
  });

  it('cầm cuốc vẫn gieo được hạt gieo lần trước / hạt đầu tiên (luật gieo giữ nguyên)', () => {
    const inv = startInv();
    expect(pickSeedSlot(inv)).toBe(1);
  });

  it('không ăn được, không bán được', () => {
    expect(staminaRestoreOf(HOE_ITEM_ID)).toBe(0);
    expect(sellPriceOf(HOE_ITEM_ID)).toBeNull();
    expect(canSellItem(HOE_ITEM_ID)).toBe(false);
  });

  it('lỡ nằm trong thùng bán thì qua đêm KHÔNG bị bán / xoá', () => {
    const box = createInventory(4, 4, 20);
    addItem(box, HOE_ITEM_ID, 1);
    addItem(box, 'rau-cai', 2);
    const w = createWallet(0);
    const r = sellBoxContents(box, w);
    expect(countOf(box, HOE_ITEM_ID)).toBe(1);
    expect(r.lines.map((l) => l.id)).toEqual(['rau-cai']);
  });

  it('đổi chỗ được như món khác (chuyển gùi ↔ thùng giữ nguyên 1 cái)', () => {
    const inv = startInv();
    const box = createInventory(4, 4, 20);
    expect(moveFromSlot(inv, 0, box, 1).moved).toBe(1);
    expect(moveFromSlot(box, 0, inv, 1).moved).toBe(1);
    expect(countOf(inv, HOE_ITEM_ID)).toBe(1);
  });
});

describe('ensureItem / nạp save cũ chưa có cuốc', () => {
  it('thiếu → thêm vào ô trống ĐẦU TIÊN, có rồi thì thôi', () => {
    const inv = createInventory(6, 3, 20);
    const box = createInventory(4, 4, 20);
    setSlot(inv, 0, 'hat-rau-cai', 5);
    setSlot(inv, 2, 'rau-cai', 1);
    expect(ensureItem(inv, box, HOE_ITEM_ID)).toBe(true);
    expect(inv.slots[1]).toEqual({ id: HOE_ITEM_ID, count: 1 });
    expect(ensureItem(inv, box, HOE_ITEM_ID)).toBe(false);
    expect(countOf(inv, HOE_ITEM_ID)).toBe(1);
  });

  it('cuốc đang nằm trong thùng bán → không thêm cái thứ hai', () => {
    const inv = createInventory(6, 3, 20);
    const box = createInventory(4, 4, 20);
    addItem(box, HOE_ITEM_ID, 1);
    expect(ensureItem(inv, box, HOE_ITEM_ID)).toBe(false);
    expect(countOf(inv, HOE_ITEM_ID)).toBe(0);
  });

  it('gùi kín → bỏ cuốc vào thùng bán, không đụng đồ của người chơi', () => {
    const inv = createInventory(3, 3, 20);
    const box = createInventory(2, 2, 20);
    for (let i = 0; i < 3; i++) setSlot(inv, i, 'rau-cai', 20);
    expect(ensureItem(inv, box, HOE_ITEM_ID)).toBe(true);
    expect(countOf(inv, 'rau-cai')).toBe(60);
    expect(box.slots[0]).toEqual({ id: HOE_ITEM_ID, count: 1 });
  });

  const RULES: SaveRules = {
    strikesPerPlot: gameConfig.tillStrikesPerPlot,
    dayLengthSeconds: gameConfig.dayLengthSeconds,
    areaWidth: 48 * 64,
    areaHeight: 32 * 64,
    isKnownItem: (id) => itemInfo(id) !== null,
    isKnownCrop: (id) => cropById(id) !== undefined,
    requiredItems: gameConfig.startTools,
  };

  const world = (): SaveWorld => ({
    playerName: gameConfig.defaultPlayerName,
    area: 'garden',
    x: 100,
    y: 100,
    facing: 'down',
    clock: createDayClock(),
    stamina: createStamina(gameConfig.staminaMax),
    wallet: createWallet(gameConfig.startMoney),
    farm: createFarm({ x: 12, y: 12, w: 3, h: 3 }),
    inventory: startInv(),
    sellBox: createInventory(gameConfig.sellBoxSlots, gameConfig.sellBoxSlots, gameConfig.stackMax),
  });

  /** Save kiểu T-008 (trước khi có cuốc): hạt ở ô 1–2, đang chọn ô 1 (đã nâng lên version hiện tại: thêm rương trống). */
  const oldSave = (): GameSave => ({
    version: GAME_SAVE_VERSION as 2,
    savedAt: '2026-10-12T08:30:00.000Z',
    player: { name: 'Tèo', area: 'garden', x: 500, y: 600, facing: 'left' },
    clock: { day: 3, elapsedSeconds: 120 },
    stamina: { current: 50, max: 100, exhausted: false },
    money: 42,
    farm: { plots: [] },
    inventory: {
      slots: [{ id: 'hat-rau-cai', count: 4 }, { id: 'hat-khoai-lang', count: 3 }, null, { id: 'rau-cai', count: 2 }],
      selected: 0,
      lastSeedId: 'hat-rau-cai',
    },
    sellBox: { slots: [] },
    chest: { slots: [] },
  });

  it('save cũ: cuốc vào ô trống đầu tiên (ô 3), đồ cũ và ô đang chọn giữ nguyên', () => {
    const w = world();
    const applied = applySave(oldSave(), w, RULES);
    expect(applied.addedItems).toEqual([HOE_ITEM_ID]);
    expect(w.inventory.slots[0]).toEqual({ id: 'hat-rau-cai', count: 4 });
    expect(w.inventory.slots[1]).toEqual({ id: 'hat-khoai-lang', count: 3 });
    expect(w.inventory.slots[2]).toEqual({ id: HOE_ITEM_ID, count: 1 });
    expect(w.inventory.slots[3]).toEqual({ id: 'rau-cai', count: 2 });
    expect(w.inventory.selected).toBe(0);
    expect(countOf(w.inventory, HOE_ITEM_ID)).toBe(1);
    expect(w.wallet.money).toBe(42);
  });

  it('save mới đã có cuốc (ở chỗ người chơi xếp) → không thêm, không dời', () => {
    const s = oldSave();
    s.inventory.slots[5] = { id: HOE_ITEM_ID, count: 1 };
    const w = world();
    const applied = applySave(s, w, RULES);
    expect(applied.addedItems).toEqual([]);
    expect(w.inventory.slots[5]).toEqual({ id: HOE_ITEM_ID, count: 1 });
    expect(countOf(w.inventory, HOE_ITEM_ID)).toBe(1);
  });
});
