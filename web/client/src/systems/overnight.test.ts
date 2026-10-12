// T-007: hàm "qua đêm" dùng chung (ngủ, ngủ gục, phím G) — lớn, khát, héo, chín để đó, bán thùng, cuốc dở, Sức, ngày mới.
import { describe, expect, it } from 'vitest';
import { gameConfig } from '../config/gameConfig';
import { growDaysOf } from './crops';
import { createWallet } from './economy';
import { createFarm, plantSeed, plotAt, strikeTill, waterPlot, type FarmState } from './farm';
import { countOf, createInventory, setSlot } from './inventory';
import { canSleepAt, countUnwateredGrowing, morningStamina, runOvernight, type OvernightConfig, type OvernightWorld } from './overnight';
import { createStamina } from './stamina';
import { clockHour, createDayClock, setGameHour } from './time';

const N = gameConfig.tillStrikesPerPlot;
const CFG: OvernightConfig = {
  growDaysOf,
  unwateredDaysToWither: gameConfig.unwateredDaysToWither,
  tillProgressKeepsOvernight: gameConfig.tillProgressKeepsOvernight,
  passOutStaminaRatio: gameConfig.passOutStaminaRatio,
  daysPerSeason: gameConfig.daysPerSeason,
};

function world(): OvernightWorld {
  return {
    farm: createFarm({ x: 0, y: 0, w: 3, h: 3 }),
    sellBox: createInventory(gameConfig.sellBoxSlots, gameConfig.sellBoxSlots, gameConfig.stackMax),
    wallet: createWallet(gameConfig.startMoney),
    clock: createDayClock(),
    stamina: createStamina(gameConfig.staminaMax, 35),
  };
}

const tillFully = (farm: FarmState, x: number, y: number) => {
  for (let i = 0; i < N; i++) strikeTill(farm, x, y, N);
};
const plant = (farm: FarmState, x: number, y: number, cropId = 'rau-cai') => {
  tillFully(farm, x, y);
  expect(plantSeed(farm, x, y, cropId)).toBe(true);
};

describe('runOvernight — ruộng', () => {
  it('ô đã tưới → cây lớn +1 ngày (cải 1 ngày = chín sáng nay); mọi ô bỏ "đã tưới"', () => {
    const w = world();
    plant(w.farm, 0, 0);
    plant(w.farm, 1, 0, 'khoai-lang');
    waterPlot(w.farm, 0, 0);
    waterPlot(w.farm, 1, 0);
    const s = runOvernight(w, 'sleep', CFG);
    expect(plotAt(w.farm, 0, 0)!.crop).toMatchObject({ age: 1, dryDays: 0, withered: false });
    expect(plotAt(w.farm, 1, 0)!.crop).toMatchObject({ age: 1, dryDays: 0 }); // khoai 2 ngày: chưa chín
    expect(s.ripenedThisMorning).toBe(1);
    expect(s.farm.grew).toBe(2);
    expect(s.unwateredYesterday).toBe(0);
    expect(w.farm.plots.every((p) => !p.watered)).toBe(true);
  });

  it('ô đã gieo mà không tưới → +1 ngày khát, không lớn; đếm vào "ô chưa tưới hôm qua"', () => {
    const w = world();
    plant(w.farm, 0, 0);
    plant(w.farm, 2, 2);
    waterPlot(w.farm, 2, 2);
    expect(countUnwateredGrowing(w.farm, growDaysOf)).toBe(1);
    const s = runOvernight(w, 'sleep', CFG);
    expect(plotAt(w.farm, 0, 0)!.crop).toMatchObject({ age: 0, dryDays: 1, withered: false });
    expect(s.unwateredYesterday).toBe(1);
    expect(s.farm.thirsty).toBe(1);
    expect(s.witheredTonight).toBe(0);
  });

  it('khát unwateredDaysToWither (2) đêm liền → héo; đêm thứ 2 vẫn tính là "chưa tưới hôm qua"', () => {
    expect(gameConfig.unwateredDaysToWither).toBe(2);
    const w = world();
    plant(w.farm, 0, 0);
    runOvernight(w, 'sleep', CFG);
    expect(plotAt(w.farm, 0, 0)!.crop!.withered).toBe(false);
    const s2 = runOvernight(w, 'sleep', CFG);
    expect(plotAt(w.farm, 0, 0)!.crop).toMatchObject({ dryDays: 2, withered: true });
    expect(s2.witheredTonight).toBe(1);
    expect(s2.unwateredYesterday).toBe(1);
    // Cây héo nằm chờ dọn: đêm sau không đếm nữa, không đổi.
    const s3 = runOvernight(w, 'sleep', CFG);
    expect(s3.unwateredYesterday).toBe(0);
    expect(s3.witheredTonight).toBe(0);
    expect(plotAt(w.farm, 0, 0)!.crop!.withered).toBe(true);
  });

  it('khát 1 đêm rồi được tưới → hết khát, lớn tiếp (không héo)', () => {
    const w = world();
    plant(w.farm, 0, 0);
    runOvernight(w, 'sleep', CFG);
    waterPlot(w.farm, 0, 0);
    runOvernight(w, 'sleep', CFG);
    expect(plotAt(w.farm, 0, 0)!.crop).toMatchObject({ age: 1, dryDays: 0, withered: false });
  });

  it('cây chín để đó không hỏng: nhiều đêm không tưới vẫn chín, không héo, không đếm "chưa tưới"', () => {
    const w = world();
    plant(w.farm, 0, 0);
    waterPlot(w.farm, 0, 0);
    runOvernight(w, 'sleep', CFG); // chín
    for (let i = 0; i < 4; i++) {
      const s = runOvernight(w, 'sleep', CFG);
      expect(s.unwateredYesterday).toBe(0);
      expect(s.ripenedThisMorning).toBe(0); // chín từ trước, không phải "sáng nay"
    }
    expect(plotAt(w.farm, 0, 0)!.crop).toMatchObject({ age: 1, withered: false, dryDays: 0 });
  });

  it('D-022: ô cuốc dở giữ nguyên số nhát qua đêm; ô đã cuốc chưa gieo giữ nguyên', () => {
    expect(gameConfig.tillProgressKeepsOvernight).toBe(true);
    const w = world();
    for (let i = 0; i < 4; i++) strikeTill(w.farm, 1, 1, N); // dở 4/6
    tillFully(w.farm, 2, 1); // đã cuốc, chưa gieo
    runOvernight(w, 'passout', CFG);
    expect(plotAt(w.farm, 1, 1)).toMatchObject({ soil: 'untilled', tillStrikes: 4, crop: null });
    expect(plotAt(w.farm, 2, 1)).toMatchObject({ soil: 'tilled', tillStrikes: N, crop: null });
  });
});

describe('runOvernight — bán thùng, tiền, đồ', () => {
  it('bán hết thùng theo giá gốc, cộng tiền vào ví, thùng trống; dòng chi tiết gộp theo loại', () => {
    const w = world();
    setSlot(w.sellBox, 0, 'rau-cai', 3);
    setSlot(w.sellBox, 1, 'khoai-lang', 1);
    setSlot(w.sellBox, 5, 'rau-cai', 2);
    const s = runOvernight(w, 'sleep', CFG);
    expect(s.sale.earned).toBe(5 * 10 + 22);
    expect(s.sale.itemsSold).toBe(6);
    expect(s.sale.lines).toEqual([
      { id: 'rau-cai', count: 5, unitPrice: 10, subtotal: 50 },
      { id: 'khoai-lang', count: 1, unitPrice: 22, subtotal: 22 },
    ]);
    expect(w.wallet.money).toBe(60 + 72);
    expect(w.sellBox.slots.every((x) => x === null)).toBe(true);
  });

  it('thùng trống → 0 quan, tiền giữ nguyên; ngủ gục không mất tiền, không đụng gùi', () => {
    const w = world();
    const bag = createInventory(18, 9, 20);
    setSlot(bag, 0, 'hat-rau-cai', 6);
    const s = runOvernight(w, 'passout', CFG);
    expect(s.sale).toEqual({ earned: 0, itemsSold: 0, lines: [] });
    expect(w.wallet.money).toBe(60);
    expect(countOf(bag, 'hat-rau-cai')).toBe(6);
  });
});

describe('runOvernight — ngày mới, Sức', () => {
  it('ngày +1, đồng hồ về 6:00', () => {
    const w = world();
    setGameHour(w.clock, 22.5, gameConfig);
    const s = runOvernight(w, 'sleep', CFG);
    expect(s.dayEnded).toBe(1);
    expect(s.newDay).toBe(2);
    expect(w.clock.day).toBe(2);
    expect(clockHour(w.clock, gameConfig)).toBe(gameConfig.dayStartHour);
  });

  it('ngủ ở giường → Sức đầy; ngủ gục → staminaMax × passOutStaminaRatio = 70; phím G → đầy', () => {
    const a = world();
    expect(runOvernight(a, 'sleep', CFG).staminaAfter).toBe(100);
    expect(a.stamina.current).toBe(100);
    const b = world();
    const sb = runOvernight(b, 'passout', CFG);
    expect(sb.passedOut).toBe(true);
    expect(sb.staminaAfter).toBe(70);
    expect(b.stamina.current).toBe(70);
    const c = world();
    expect(runOvernight(c, 'devG', CFG).staminaAfter).toBe(100);
  });

  it('đang đuối (Sức 0) lúc ngủ gục → sáng ra hết đuối, Sức 70', () => {
    const w = world();
    w.stamina = createStamina(gameConfig.staminaMax, 0);
    expect(w.stamina.exhausted).toBe(true);
    runOvernight(w, 'passout', CFG);
    expect(w.stamina.exhausted).toBe(false);
    expect(w.stamina.current).toBe(70);
  });

  it('morningStamina: làm tròn xuống, ít nhất 1', () => {
    expect(morningStamina(100, true, 0.7)).toBe(70);
    expect(morningStamina(100, false, 0.7)).toBe(100);
    expect(morningStamina(10, true, 0.05)).toBe(1);
  });

  it('đổi mùa: ngày 4 → 5 là đầu mùa mưa (daysPerSeason 4)', () => {
    const w = world();
    w.clock.day = 3;
    expect(runOvernight(w, 'sleep', CFG).seasonChanged).toBe(false);
    const s = runOvernight(w, 'sleep', CFG);
    expect(s.newDay).toBe(5);
    expect(s.newSeason).toBe('rainy');
    expect(s.seasonChanged).toBe(true);
  });

  it('giường: từ earliestSleepHour (18h) mới ngủ được', () => {
    expect(gameConfig.earliestSleepHour).toBe(18);
    expect(canSleepAt(17.99, 18)).toBe(false);
    expect(canSleepAt(18, 18)).toBe(true);
    expect(canSleepAt(24, 18)).toBe(true);
  });
});
