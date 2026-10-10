// T-003: gùi 18 ô (hàng đầu = hotbar), chồng tối đa stackMax, thêm/bớt, chọn ô, chọn hạt để gieo.
import { describe, expect, it } from 'vitest';
import { gameConfig } from '../config/gameConfig';
import {
  addItem,
  canAdd,
  countOf,
  createInventory,
  findSlot,
  removeFromSlot,
  scrollSelect,
  selectedStack,
  selectSlot,
  setSlot,
  spaceFor,
} from './inventory';
import { createStartInventory, cropOfSeed, isSeedItem, itemInfo, pickSeedSlot, seedItemId } from './items';

const start = () =>
  createStartInventory(gameConfig.startSeeds, gameConfig.bagSlotsStart, gameConfig.hotbarSlots, gameConfig.stackMax);

describe('createStartInventory — gùi lúc bắt đầu', () => {
  it('18 ô, hotbar 9, chồng tối đa 20, ô chọn = ô 1', () => {
    const inv = start();
    expect(inv.slots).toHaveLength(18);
    expect(inv.hotbarSize).toBe(9);
    expect(inv.stackMax).toBe(20);
    expect(inv.selected).toBe(0);
    expect(inv.lastSeedId).toBeNull();
  });

  it('startSeeds: 6 hạt rau cải ở ô 1, 3 hạt khoai lang ở ô 2', () => {
    const inv = start();
    expect(inv.slots[0]).toEqual({ id: 'hat-rau-cai', count: 6 });
    expect(inv.slots[1]).toEqual({ id: 'hat-khoai-lang', count: 3 });
    expect(inv.slots.slice(2).every((s) => s === null)).toBe(true);
  });
});

describe('addItem — vào ô cùng loại hoặc ô trống đầu tiên', () => {
  it('lấp chồng cùng loại trước, rồi ô trống đầu tiên', () => {
    const inv = createInventory(4, 2, 20);
    setSlot(inv, 1, 'rau-cai', 18);
    let r = addItem(inv, 'rau-cai', 1);
    expect(r).toEqual({ added: 1, firstSlot: 1 });
    expect(inv.slots[1]).toEqual({ id: 'rau-cai', count: 19 });
    r = addItem(inv, 'rau-cai', 3); // 1 vào ô 2 (đầy 20), 2 vào ô trống đầu tiên (ô 0)
    expect(r).toEqual({ added: 3, firstSlot: 1 });
    expect(inv.slots[1]?.count).toBe(20);
    expect(inv.slots[0]).toEqual({ id: 'rau-cai', count: 2 });
    expect(countOf(inv, 'rau-cai')).toBe(22);
  });

  it('món mới vào ô trống đầu tiên (hotbar trước)', () => {
    const inv = start();
    const r = addItem(inv, 'rau-cai', 1);
    expect(r.firstSlot).toBe(2);
    expect(inv.slots[2]).toEqual({ id: 'rau-cai', count: 1 });
  });

  it('gùi đầy → canAdd false, addItem không nhét được', () => {
    const inv = createInventory(2, 2, 20);
    setSlot(inv, 0, 'khoai-lang', 20);
    setSlot(inv, 1, 'hat-rau-cai', 20);
    expect(spaceFor(inv, 'rau-cai')).toBe(0);
    expect(canAdd(inv, 'rau-cai')).toBe(false);
    expect(addItem(inv, 'rau-cai', 1)).toEqual({ added: 0, firstSlot: -1 });
    // Chồng cùng loại còn chỗ thì vẫn nhét được dù không còn ô trống.
    setSlot(inv, 0, 'rau-cai', 19);
    expect(canAdd(inv, 'rau-cai')).toBe(true);
    expect(canAdd(inv, 'rau-cai', 2)).toBe(false);
  });

  it('đủ chỗ một phần → nhét được bao nhiêu hay bấy nhiêu', () => {
    const inv = createInventory(1, 1, 20);
    expect(addItem(inv, 'rau-cai', 25)).toEqual({ added: 20, firstSlot: 0 });
  });
});

describe('removeFromSlot / setSlot', () => {
  it('bớt hết thì ô thành trống', () => {
    const inv = start();
    expect(removeFromSlot(inv, 1, 2)).toBe(2);
    expect(inv.slots[1]?.count).toBe(1);
    expect(removeFromSlot(inv, 1, 5)).toBe(1);
    expect(inv.slots[1]).toBeNull();
    expect(removeFromSlot(inv, 1, 1)).toBe(0);
  });
  it('setSlot giới hạn ở stackMax, count 0 = trống', () => {
    const inv = start();
    setSlot(inv, 3, 'rau-cai', 99);
    expect(inv.slots[3]?.count).toBe(20);
    setSlot(inv, 3, 'rau-cai', 0);
    expect(inv.slots[3]).toBeNull();
    expect(findSlot(inv, 'hat-khoai-lang')).toBe(1);
  });
});

describe('chọn ô hotbar — phím 1–9 và cuộn chuột', () => {
  it('selectSlot chỉ trong hotbar', () => {
    const inv = start();
    expect(selectSlot(inv, 4)).toBe(true);
    expect(inv.selected).toBe(4);
    expect(selectSlot(inv, 4)).toBe(false); // không đổi
    expect(selectSlot(inv, 9)).toBe(false); // ô hàng dưới không chọn được
    expect(selectSlot(inv, -1)).toBe(false);
    expect(inv.selected).toBe(4);
  });
  it('cuộn vòng quanh: ô 9 cuộn xuống → ô 1, ô 1 cuộn lên → ô 9', () => {
    const inv = start();
    scrollSelect(inv, -1);
    expect(inv.selected).toBe(8);
    scrollSelect(inv, 1);
    expect(inv.selected).toBe(0);
    scrollSelect(inv, 3);
    expect(inv.selected).toBe(3);
    scrollSelect(inv, -12);
    expect(inv.selected).toBe(0);
  });
  it('selectedStack = chồng ở ô đang chọn', () => {
    const inv = start();
    expect(selectedStack(inv)?.id).toBe('hat-rau-cai');
    selectSlot(inv, 5);
    expect(selectedStack(inv)).toBeNull();
  });
});

describe('items — hạt và nông sản', () => {
  it('tên món, loại món, hạt của cây nào', () => {
    expect(seedItemId('rau-cai')).toBe('hat-rau-cai');
    expect(isSeedItem('hat-rau-cai')).toBe(true);
    expect(isSeedItem('rau-cai')).toBe(false);
    expect(isSeedItem('hat-khong-co')).toBe(false);
    expect(cropOfSeed('hat-khoai-lang')).toBe('khoai-lang');
    expect(itemInfo('hat-rau-cai')).toEqual({ id: 'hat-rau-cai', kind: 'seed', cropId: 'rau-cai', name: 'Hạt rau cải' });
    expect(itemInfo('khoai-lang')?.name).toBe('Khoai lang');
    expect(itemInfo('la-la')).toBeNull();
  });
});

describe('pickSeedSlot — gieo hạt nào (GDD §3.3)', () => {
  it('ô đang chọn là hạt → hạt đó', () => {
    const inv = start();
    selectSlot(inv, 1);
    expect(pickSeedSlot(inv)).toBe(1);
  });
  it('ô đang chọn không phải hạt → hạt gieo lần trước', () => {
    const inv = start();
    inv.lastSeedId = 'hat-khoai-lang';
    setSlot(inv, 4, 'rau-cai', 1);
    selectSlot(inv, 4);
    expect(pickSeedSlot(inv)).toBe(1);
  });
  it('chưa gieo lần nào mà chọn ô trống → hạt đầu tiên trong gùi (giả định)', () => {
    const inv = start();
    selectSlot(inv, 6);
    expect(pickSeedSlot(inv)).toBe(0);
  });
  it('hạt gieo lần trước đã hết → -1 (hết hạt rồi), không tự đổi sang hạt khác', () => {
    const inv = start();
    inv.lastSeedId = 'hat-rau-cai';
    setSlot(inv, 0, null, 0);
    selectSlot(inv, 0);
    expect(pickSeedSlot(inv)).toBe(-1);
  });
  it('không còn hạt nào → -1', () => {
    const inv = createInventory(18, 9, 20);
    expect(pickSeedSlot(inv)).toBe(-1);
  });
});
