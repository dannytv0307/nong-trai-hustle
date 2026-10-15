// T-008: save — lưu → đọc ra giống hệt, save hỏng / sai version / thiếu trường, nâng phiên bản, luật game khi nạp,
// đọc/ghi localStorage (kho giả). Phần kiểm hình dạng nằm ở @bph/shared, phần luật game ở systems/save.ts.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GAME_SAVE_VERSION, hashSeedText, parseGameSave, serializeGameSave, validateGameSave, type GameSave } from '@bph/shared';
import { gameConfig } from '../config/gameConfig';
import { clearLocalSave, loadLocalSave, SAVE_BACKUP_KEY, SAVE_KEY, writeLocalSave, type SaveStorage } from '../net/saveLocal';
import { cropById } from './crops';
import { createWallet } from './economy';
import { createFarm, plantSeed, plotAt, strikeTill, waterPlot, type FarmState } from './farm';
import { createInventory, setSlot } from './inventory';
import { HOE_ITEM_ID as HOE, itemInfo } from './items';
import { applySave, captureSave, type SaveRules, type SaveWorld } from './save';
import { createStamina } from './stamina';
import { createDayClock } from './time';

const N = gameConfig.tillStrikesPerPlot;
const RECT = { x: 12, y: 12, w: 3, h: 3 };
const NOW = new Date('2026-10-12T08:30:00.000Z');
const RULES: SaveRules = {
  strikesPerPlot: N,
  dayLengthSeconds: gameConfig.dayLengthSeconds,
  areaWidth: 48 * 64,
  areaHeight: 32 * 64,
  isKnownItem: (id) => itemInfo(id) !== null,
  isKnownCrop: (id) => cropById(id) !== undefined,
};

/** Thế giới mới tinh (như Ngày 1). */
function freshWorld(): SaveWorld {
  return {
    playerName: gameConfig.defaultPlayerName,
    area: 'garden',
    x: 100,
    y: 100,
    facing: 'down',
    clock: createDayClock(),
    stamina: createStamina(gameConfig.staminaMax),
    wallet: createWallet(gameConfig.startMoney),
    farm: createFarm(RECT),
    inventory: createInventory(gameConfig.bagSlotsStart, gameConfig.hotbarSlots, gameConfig.stackMax),
    sellBox: createInventory(gameConfig.sellBoxSlots, gameConfig.sellBoxSlots, gameConfig.stackMax),
  };
}

function till(farm: FarmState, x: number, y: number, strikes: number): void {
  for (let i = 0; i < strikes; i++) strikeTill(farm, x, y, N);
}

/** Thế giới "phong phú": ô cuốc dở, ô đã cuốc trống, cây đã tưới, cây khát, cây héo, gùi nhiều chồng, thùng có đồ, đuối. */
function richWorld(): SaveWorld {
  const w = freshWorld();
  w.playerName = 'Tèo';
  w.x = 1234.56;
  w.y = 987.65;
  w.facing = 'left';
  w.clock.day = 6;
  w.clock.elapsedSeconds = 321.5;
  w.stamina.current = 0;
  w.stamina.exhausted = true;
  w.wallet.money = 137;
  till(w.farm, 12, 12, 3); // cuốc dở 3/6
  till(w.farm, 13, 12, N); // đã cuốc, trống
  till(w.farm, 14, 12, N);
  plantSeed(w.farm, 14, 12, 'rau-cai');
  waterPlot(w.farm, 14, 12); // đã tưới hôm nay
  till(w.farm, 12, 13, N);
  plantSeed(w.farm, 12, 13, 'khoai-lang');
  plotAt(w.farm, 12, 13)!.crop!.age = 2;
  plotAt(w.farm, 12, 13)!.crop!.dryDays = 1; // khát
  till(w.farm, 13, 13, N);
  plantSeed(w.farm, 13, 13, 'rau-cai');
  plotAt(w.farm, 13, 13)!.crop!.withered = true; // héo
  setSlot(w.inventory, 0, 'hat-rau-cai', 4);
  setSlot(w.inventory, 1, 'hat-khoai-lang', 20);
  setSlot(w.inventory, 2, 'rau-cai', 7);
  setSlot(w.inventory, 5, 'khoai-lang', 3);
  setSlot(w.inventory, 12, 'hat-khoai-lang', 2);
  w.inventory.selected = 2;
  w.inventory.lastSeedId = 'hat-khoai-lang';
  setSlot(w.sellBox, 0, 'rau-cai', 5);
  setSlot(w.sellBox, 3, 'khoai-lang', 1);
  return w;
}

/** Lưu → JSON → đọc → nạp vào thế giới mới → chụp lại. */
function roundTrip(w: SaveWorld): { first: GameSave; second: GameSave; target: SaveWorld } {
  const first = captureSave(w, NOW);
  const parsed = parseGameSave(serializeGameSave(first));
  if (!parsed.ok) throw new Error(parsed.reason);
  const target = freshWorld();
  const applied = applySave(parsed.save, target, RULES);
  target.playerName = applied.playerName;
  if (applied.position) {
    target.x = applied.position.x;
    target.y = applied.position.y;
  }
  target.facing = applied.facing;
  return { first, second: captureSave(target, NOW), target };
}

describe('save — lưu rồi đọc ra giống hệt', () => {
  it('trạng thái phong phú: deep equal sau khi lưu → JSON → nạp → lưu lại', () => {
    const w = richWorld();
    const { first, second, target } = roundTrip(w);
    expect(second).toEqual(first);
    expect(first.version).toBe(GAME_SAVE_VERSION);
    // Kiểm vài chỗ cụ thể cho chắc (không chỉ "giống chính nó").
    expect(plotAt(target.farm, 12, 12)).toMatchObject({ soil: 'untilled', tillStrikes: 3, crop: null });
    expect(plotAt(target.farm, 12, 13)!.crop).toEqual({ cropId: 'khoai-lang', age: 2, dryDays: 1, withered: false });
    expect(plotAt(target.farm, 14, 12)!.watered).toBe(true);
    expect(plotAt(target.farm, 13, 13)!.crop!.withered).toBe(true);
    expect(target.farm).toEqual(w.farm);
    expect(target.inventory).toEqual(w.inventory);
    expect(target.sellBox).toEqual(w.sellBox);
    expect(target.stamina).toEqual({ current: 0, max: gameConfig.staminaMax, exhausted: true });
    expect(target.wallet.money).toBe(137);
    expect(target.clock).toEqual({ day: 6, elapsedSeconds: 321.5 });
    expect(target.playerName).toBe('Tèo');
    expect(target.facing).toBe('left');
    expect({ x: target.x, y: target.y }).toEqual({ x: 1234.56, y: 987.65 });
  });

  it('thế giới mới (Ngày 1) cũng giống hệt', () => {
    const { first, second } = roundTrip(freshWorld());
    expect(second).toEqual(first);
  });

  it('save là bản sao: sửa game sau khi lưu không đổi save', () => {
    const w = richWorld();
    const s = captureSave(w, NOW);
    w.inventory.slots[0]!.count = 1;
    plotAt(w.farm, 12, 12)!.tillStrikes = 5;
    expect(s.inventory.slots[0]!.count).toBe(4);
    expect(s.farm.plots.find((p) => p.x === 12 && p.y === 12)!.tillStrikes).toBe(3);
  });
});

describe('save hỏng / sai version / thiếu trường → không nạp', () => {
  const good = (): Record<string, unknown> => JSON.parse(serializeGameSave(captureSave(richWorld(), NOW)));

  it('chuỗi trống, JSON lỗi, không phải object', () => {
    expect(parseGameSave(null).ok).toBe(false);
    expect(parseGameSave('').ok).toBe(false);
    expect(parseGameSave('{bad json').ok).toBe(false);
    expect(parseGameSave('[1,2]').ok).toBe(false);
    expect(parseGameSave('42').ok).toBe(false);
  });

  it('sai version: thiếu, 0, số lẻ, chữ, mới hơn game', () => {
    for (const v of [undefined, 0, 1.5, '1', GAME_SAVE_VERSION + 1]) {
      const s = good();
      s.version = v;
      expect(validateGameSave(s).ok, String(v)).toBe(false);
    }
  });

  it('thiếu / sai từng trường', () => {
    // Save thô (JSON.parse) — cố ý phá từng trường nên dùng any cho gọn.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const breakers: ((s: Record<string, any>) => void)[] = [
      (s) => delete s.player,
      (s) => (s.player.facing = 'north'),
      (s) => (s.player.x = 'a'),
      (s) => delete s.clock,
      (s) => (s.clock.day = 0),
      (s) => (s.clock.elapsedSeconds = -1),
      (s) => (s.stamina.max = 0),
      (s) => (s.money = -5),
      (s) => (s.money = null),
      (s) => (s.farm.plots = 'x'),
      (s) => (s.farm.plots[0].soil = 'mud'),
      (s) => (s.farm.plots[0].tillStrikes = 1.5),
      (s) => (s.farm.plots[3].crop.age = -1),
      (s) => (s.inventory.slots[0] = { id: 'rau-cai', count: 0 }),
      (s) => (s.inventory.slots = null),
      (s) => (s.inventory.lastSeedId = 3),
      (s) => delete s.sellBox,
      (s) => delete s.savedAt,
    ];
    breakers.forEach((breakIt, i) => {
      const s = good();
      breakIt(s);
      expect(validateGameSave(s).ok, `ca ${i}`).toBe(false);
    });
  });

  it('save đúng thì qua, fromVersion = phiên bản hiện tại (save mới không cần nâng)', () => {
    const r = validateGameSave(good());
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.fromVersion).toBe(GAME_SAVE_VERSION);
  });
});

describe('luật game khi nạp (save cũ / sửa tay)', () => {
  it('món lạ, cây lạ, số nhát quá lớn, ô hotbar ngoài khoảng, tiền lẻ, Sức quá trần, giờ quá 24h', () => {
    const s = captureSave(richWorld(), NOW);
    s.inventory.slots[3] = { id: 'vang-thoi', count: 2 };
    s.inventory.slots[2] = { id: 'rau-cai', count: 999 };
    s.inventory.selected = 30;
    s.inventory.lastSeedId = 'hat-sam';
    s.farm.plots[0].tillStrikes = 50; // ô dở → kẹp còn N−1
    s.farm.plots[2].crop = { cropId: 'sam-ngoc-linh', age: 1, dryDays: 0, withered: false };
    s.farm.plots.push({ x: 99, y: 99, soil: 'tilled', tillStrikes: N, crop: null, watered: false }); // ô không có trên bản đồ
    s.money = 12.9;
    s.stamina.current = 500;
    s.clock.elapsedSeconds = 99999;
    s.player.x = -50;
    const w = freshWorld();
    const applied = applySave(s, w, RULES);
    expect(w.inventory.slots[3]).toBeNull();
    expect(w.inventory.slots[2]).toEqual({ id: 'rau-cai', count: gameConfig.stackMax });
    expect(w.inventory.selected).toBe(gameConfig.hotbarSlots - 1);
    expect(w.inventory.lastSeedId).toBeNull();
    expect(plotAt(w.farm, 12, 12)!.tillStrikes).toBe(N - 1);
    expect(plotAt(w.farm, 14, 12)!.crop).toBeNull();
    expect(plotAt(w.farm, 14, 12)!.watered).toBe(false);
    expect(w.farm.plots).toHaveLength(9);
    expect(w.wallet.money).toBe(12);
    expect(w.stamina.current).toBe(gameConfig.staminaMax);
    expect(w.stamina.exhausted).toBe(false);
    expect(w.clock.elapsedSeconds).toBeLessThan(gameConfig.dayLengthSeconds);
    expect(w.clock.elapsedSeconds).toBeGreaterThan(gameConfig.dayLengthSeconds - 1);
    expect(applied.position).toBeNull(); // toạ độ ngoài khu → scene đặt ở chỗ xuất phát
  });

  it('gùi trong save nhiều ô hơn gùi hiện tại → phần dư xếp vào ô trống, không mất đồ', () => {
    const s = captureSave(freshWorld(), NOW);
    s.inventory.slots = Array.from({ length: gameConfig.bagSlotsStart + 2 }, () => null);
    s.inventory.slots[gameConfig.bagSlotsStart + 1] = { id: 'rau-cai', count: 3 };
    const w = freshWorld();
    applySave(s, w, RULES);
    expect(w.inventory.slots).toHaveLength(gameConfig.bagSlotsStart);
    expect(w.inventory.slots[0]).toEqual({ id: 'rau-cai', count: 3 });
  });
});

/** Kho giả kiểu localStorage. */
function memoryStorage(): SaveStorage & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
}

describe('localStorage (saveLocal.ts)', () => {
  afterEach(() => vi.restoreAllMocks());

  it('chưa có save → none; ghi rồi đọc → giống hệt', () => {
    const st = memoryStorage();
    expect(loadLocalSave(st).status).toBe('none');
    const save = captureSave(richWorld(), NOW);
    expect(writeLocalSave(save, st)).toBe(true);
    const r = loadLocalSave(st);
    expect(r.status).toBe('ok');
    if (r.status === 'ok') expect(r.save).toEqual(save);
  });

  it('save hỏng → corrupt, console.warn (không phải error), bản hỏng chuyển sang khóa backup', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const st = memoryStorage();
    st.setItem(SAVE_KEY, '{"version":1, hỏng');
    const r = loadLocalSave(st);
    expect(r.status).toBe('corrupt');
    expect(warn).toHaveBeenCalledTimes(1);
    expect(error).not.toHaveBeenCalled();
    expect(st.getItem(SAVE_KEY)).toBeNull();
    expect(st.getItem(SAVE_BACKUP_KEY)).toBe('{"version":1, hỏng');
  });

  it('sai version → corrupt', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const st = memoryStorage();
    const s = captureSave(freshWorld(), NOW) as unknown as Record<string, unknown>;
    s.version = 99;
    st.setItem(SAVE_KEY, JSON.stringify(s));
    expect(loadLocalSave(st).status).toBe('corrupt');
  });

  it('clearLocalSave xóa save, giữ bản hỏng; kho ném lỗi → không ném ra ngoài', () => {
    const st = memoryStorage();
    writeLocalSave(captureSave(freshWorld(), NOW), st);
    st.setItem(SAVE_BACKUP_KEY, 'x');
    clearLocalSave(st);
    expect(st.getItem(SAVE_KEY)).toBeNull();
    expect(st.getItem(SAVE_BACKUP_KEY)).toBe('x');
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const broken: SaveStorage = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('quota');
      },
      removeItem: () => {
        throw new Error('blocked');
      },
    };
    expect(loadLocalSave(broken).status).toBe('none');
    expect(writeLocalSave(captureSave(freshWorld(), NOW), broken)).toBe(false);
    expect(() => clearLocalSave(broken)).not.toThrow();
    expect(loadLocalSave(null).status).toBe('none');
  });
});

describe('T-093: khu trong nhà + rương trong save (version 2)', () => {
  const HOUSE_RULES: SaveRules = { ...RULES, otherAreas: { house: { width: 1280, height: 720 } }, requiredItems: [HOE] };
  const withChest = (): SaveWorld => {
    const w = freshWorld();
    w.chest = createInventory(gameConfig.chestSlots, gameConfig.chestSlots, gameConfig.stackMax);
    setSlot(w.inventory, 0, HOE, 1);
    return w;
  };

  it('save version 1 (T-008, chưa có rương) nâng lên version hiện tại: rương trống, vẫn đứng ở Vườn chỗ cũ', () => {
    const v1 = JSON.parse(serializeGameSave(captureSave(richWorld(), NOW))) as Record<string, unknown>;
    v1.version = 1;
    delete v1.chest;
    const r = validateGameSave(v1);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.fromVersion).toBe(1);
    expect(r.save.version).toBe(GAME_SAVE_VERSION);
    expect(r.save.chest).toEqual({ slots: [] });
    const w = withChest();
    setSlot(w.chest!, 4, 'rau-cai', 3); // rác trong rương mới phải bị xoá theo save
    const applied = applySave(r.save, w, HOUSE_RULES);
    expect(applied.area).toBe('garden');
    expect(applied.position).toEqual({ x: 1234.56, y: 987.65 });
    expect(w.chest!.slots.every((s) => s === null)).toBe(true);
  });

  it('T-026: save version 2 (chưa có seed) nâng lên version 3: seed suy ra từ savedAt — nạp lại bao nhiêu lần cũng cùng seed', () => {
    const v2 = JSON.parse(serializeGameSave(captureSave(withChest(), NOW))) as Record<string, unknown>;
    v2.version = 2;
    delete v2.seed;
    const a = validateGameSave(v2);
    const b = validateGameSave(JSON.parse(JSON.stringify(v2)));
    expect(a.ok && b.ok).toBe(true);
    if (!a.ok || !b.ok) return;
    expect(a.fromVersion).toBe(2);
    expect(a.save.version).toBe(GAME_SAVE_VERSION);
    expect(a.save.seed).toBe(hashSeedText(NOW.toISOString()));
    expect(b.save.seed).toBe(a.save.seed);
    expect(applySave(a.save, withChest(), HOUSE_RULES).seed).toBe(a.save.seed);
  });

  it('T-026: seed lưu → JSON → nạp ra y nguyên; seed sai kiểu → hỏng', () => {
    const w = withChest();
    w.seed = 0xdeadbeef;
    const parsed = parseGameSave(serializeGameSave(captureSave(w, NOW)));
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.save.seed).toBe(0xdeadbeef);
    expect(applySave(parsed.save, withChest(), HOUSE_RULES).seed).toBe(0xdeadbeef);
    for (const bad of [-1, 1.5, '7', null, 2 ** 32]) {
      const s = JSON.parse(serializeGameSave(captureSave(w, NOW))) as Record<string, unknown>;
      s.seed = bad;
      expect(validateGameSave(s).ok, String(bad)).toBe(false);
    }
  });

  it('version 2 thiếu rương → hỏng (không nạp nửa vời)', () => {
    const s = JSON.parse(serializeGameSave(captureSave(withChest(), NOW))) as Record<string, unknown>;
    delete s.chest;
    expect(validateGameSave(s).ok).toBe(false);
  });

  it('đứng trong nhà + đồ trong rương: lưu → JSON → nạp ra đúng khu, đúng chỗ (toạ độ trong phòng), rương còn nguyên', () => {
    const w = withChest();
    w.area = 'house';
    w.x = 640;
    w.y = 400;
    w.facing = 'up';
    setSlot(w.chest!, 0, 'khoai-lang', 5);
    setSlot(w.chest!, 19, 'hat-rau-cai', 2);
    const parsed = parseGameSave(serializeGameSave(captureSave(w, NOW)));
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.save.player.area).toBe('house');
    const target = withChest();
    const applied = applySave(parsed.save, target, HOUSE_RULES);
    expect(applied.area).toBe('house');
    expect(applied.position).toEqual({ x: 640, y: 400 });
    expect(applied.facing).toBe('up');
    expect(target.chest!.slots[0]).toEqual({ id: 'khoai-lang', count: 5 });
    expect(target.chest!.slots[19]).toEqual({ id: 'hat-rau-cai', count: 2 });
    expect(target.chest).toEqual(w.chest);
  });

  it('khu lạ (vd bản game mới hơn) → về Vườn, chỗ xuất phát; toạ độ ngoài phòng → trong nhà nhưng ở chỗ vào', () => {
    const s = captureSave(withChest(), NOW);
    s.player.area = 'nui';
    const a = applySave(s, withChest(), HOUSE_RULES);
    expect(a.area).toBe('garden');
    expect(a.position).toBeNull();
    s.player.area = 'house';
    s.player.x = 5000;
    const b = applySave(s, withChest(), HOUSE_RULES);
    expect(b.area).toBe('house');
    expect(b.position).toBeNull();
    // Luật không biết khu nhà (otherAreas thiếu) → coi như khu lạ.
    expect(applySave(s, withChest(), RULES).area).toBe('garden');
  });

  it('cuốc cất trong rương → nạp KHÔNG thêm cái cuốc thứ hai', () => {
    const w = withChest();
    setSlot(w.inventory, 0, null, 0);
    setSlot(w.chest!, 2, HOE, 1);
    const target = withChest();
    setSlot(target.inventory, 0, null, 0);
    const applied = applySave(captureSave(w, NOW), target, HOUSE_RULES);
    expect(applied.addedItems).toEqual([]);
    expect(target.chest!.slots[2]).toEqual({ id: HOE, count: 1 });
  });

  it('thế giới không có rương (kiểu cũ) vẫn lưu được: rương trống trong save', () => {
    expect(captureSave(freshWorld(), NOW).chest).toEqual({ slots: [] });
  });
});
