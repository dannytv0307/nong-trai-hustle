// T-003: gieo, tưới, lớn qua đêm, chín, héo, hái, dọn — logic thuần trong farm.ts (+ dữ liệu crops.json).
import { describe, expect, it } from 'vitest';
import { gameConfig } from '../config/gameConfig';
import { growDaysOf, cropById } from './crops';
import {
  advanceDay,
  clearWithered,
  createFarm,
  cropStage,
  harvestPlot,
  isRipe,
  jobFor,
  plantSeed,
  plotAt,
  strikeTill,
  waterPlot,
  type FarmState,
  type OvernightOptions,
} from './farm';

const N = gameConfig.tillStrikesPerPlot;
const NIGHT: OvernightOptions = {
  growDaysOf,
  unwateredDaysToWither: gameConfig.unwateredDaysToWither,
  tillProgressKeepsOvernight: gameConfig.tillProgressKeepsOvernight,
};

/** Ruộng 3×1 ở (0..2, 0); cuốc xong các ô trong `tilled`. */
function farmWith(tilled: number[] = [0, 1, 2]): FarmState {
  const farm = createFarm({ x: 0, y: 0, w: 3, h: 1 });
  for (const x of tilled) for (let i = 0; i < N; i++) strikeTill(farm, x, 0, N);
  return farm;
}

describe('crops.json — thông số 2 cây prototype', () => {
  it('rau cải 1 ngày, khoai lang 2 ngày (GDD §3.4)', () => {
    expect(growDaysOf('rau-cai')).toBe(1);
    expect(growDaysOf('khoai-lang')).toBe(2);
    expect(cropById('khoai-lang')?.name).toBe('Khoai lang');
  });
  it('cây lạ coi như 1 ngày (không kẹt ô)', () => {
    expect(growDaysOf('khong-co')).toBe(1);
  });
});

describe('jobFor — click ô thì tự chọn việc (GDD §3.3)', () => {
  it('chưa cuốc / cuốc dở → cuốc; đã cuốc trống → gieo; ngoài ruộng → null', () => {
    const farm = farmWith([1]);
    strikeTill(farm, 2, 0, N); // cuốc dở 1/6
    expect(jobFor(farm, 0, 0, growDaysOf)).toBe('till');
    expect(jobFor(farm, 2, 0, growDaysOf)).toBe('till'); // D-022: ô cuốc dở không gieo, click = cuốc tiếp
    expect(jobFor(farm, 1, 0, growDaysOf)).toBe('plant');
    expect(jobFor(farm, 5, 5, growDaysOf)).toBeNull();
  });

  it('gieo rồi chưa tưới → tưới; tưới rồi → không làm gì; chín → hái; héo → dọn', () => {
    const farm = farmWith();
    plantSeed(farm, 0, 0, 'rau-cai');
    expect(jobFor(farm, 0, 0, growDaysOf)).toBe('water');
    waterPlot(farm, 0, 0);
    expect(jobFor(farm, 0, 0, growDaysOf)).toBeNull();
    advanceDay(farm, NIGHT);
    expect(jobFor(farm, 0, 0, growDaysOf)).toBe('harvest');

    plantSeed(farm, 1, 0, 'rau-cai');
    advanceDay(farm, NIGHT);
    advanceDay(farm, NIGHT);
    expect(plotAt(farm, 1, 0)?.crop?.withered).toBe(true);
    expect(jobFor(farm, 1, 0, growDaysOf)).toBe('clear');
  });
});

describe('plantSeed / waterPlot', () => {
  it('chỉ gieo được trên đất đã cuốc, đang trống', () => {
    const farm = farmWith([0]);
    expect(plantSeed(farm, 1, 0, 'rau-cai')).toBe(false); // chưa cuốc
    strikeTill(farm, 1, 0, N); // cuốc dở
    expect(plantSeed(farm, 1, 0, 'rau-cai')).toBe(false);
    expect(plantSeed(farm, 0, 0, 'rau-cai')).toBe(true);
    expect(plotAt(farm, 0, 0)?.crop).toEqual({ cropId: 'rau-cai', age: 0, dryDays: 0, withered: false });
    expect(plantSeed(farm, 0, 0, 'khoai-lang')).toBe(false); // đã có cây
    expect(plantSeed(farm, 9, 9, 'rau-cai')).toBe(false); // ngoài ruộng
  });

  it('tưới: cần có cây, mỗi ngày một lần, cây héo không tưới', () => {
    const farm = farmWith();
    expect(waterPlot(farm, 0, 0)).toBe(false); // chưa có cây
    plantSeed(farm, 0, 0, 'rau-cai');
    expect(waterPlot(farm, 0, 0)).toBe(true);
    expect(plotAt(farm, 0, 0)?.watered).toBe(true);
    expect(waterPlot(farm, 0, 0)).toBe(false); // đã tưới hôm nay
    plantSeed(farm, 1, 0, 'rau-cai');
    advanceDay(farm, NIGHT);
    advanceDay(farm, NIGHT);
    expect(waterPlot(farm, 1, 0)).toBe(false); // héo rồi
  });
});

describe('advanceDay — qua đêm (lớn, khát, héo)', () => {
  it('rau cải tưới → sáng mai chín; khoai lang cần 2 ngày được tưới', () => {
    const farm = farmWith();
    plantSeed(farm, 0, 0, 'rau-cai');
    plantSeed(farm, 1, 0, 'khoai-lang');
    waterPlot(farm, 0, 0);
    waterPlot(farm, 1, 0);
    const r1 = advanceDay(farm, NIGHT);
    expect(r1).toEqual({ grew: 2, ripened: 1, thirsty: 0, withered: 0 });
    const cai = plotAt(farm, 0, 0)!.crop!;
    const khoai = plotAt(farm, 1, 0)!.crop!;
    expect(isRipe(cai, growDaysOf)).toBe(true);
    expect(cropStage(cai, growDaysOf)).toBe('ripe');
    expect(cropStage(khoai, growDaysOf)).toBe('growing');
    expect(isRipe(khoai, growDaysOf)).toBe(false);
    // Mọi ô bỏ "đã tưới".
    expect(farm.plots.every((p) => !p.watered)).toBe(true);

    waterPlot(farm, 1, 0);
    const r2 = advanceDay(farm, NIGHT);
    expect(r2.ripened).toBe(1);
    expect(isRipe(khoai, growDaysOf)).toBe(true);
  });

  it('giai đoạn: hạt (0 ngày) → mầm → chín', () => {
    const farm = farmWith();
    plantSeed(farm, 0, 0, 'khoai-lang');
    const c = plotAt(farm, 0, 0)!.crop!;
    expect(cropStage(c, growDaysOf)).toBe('seed');
    waterPlot(farm, 0, 0);
    advanceDay(farm, NIGHT);
    expect(cropStage(c, growDaysOf)).toBe('growing');
  });

  it('không tưới: cây không lớn, khát 1 đêm; khát unwateredDaysToWither (2) đêm liền → héo', () => {
    const farm = farmWith();
    plantSeed(farm, 0, 0, 'rau-cai');
    const r1 = advanceDay(farm, NIGHT);
    const c = plotAt(farm, 0, 0)!.crop!;
    expect(r1).toEqual({ grew: 0, ripened: 0, thirsty: 1, withered: 0 });
    expect(c).toMatchObject({ age: 0, dryDays: 1, withered: false });
    const r2 = advanceDay(farm, NIGHT);
    expect(r2.withered).toBe(1);
    expect(c.withered).toBe(true);
    expect(cropStage(c, growDaysOf)).toBe('withered');
    // Héo rồi thì đêm sau không đếm lại.
    expect(advanceDay(farm, NIGHT)).toEqual({ grew: 0, ripened: 0, thirsty: 0, withered: 0 });
  });

  it('khát 1 đêm rồi được tưới → hết khát, lớn tiếp (đếm khát phải là đêm LIỀN nhau)', () => {
    const farm = farmWith();
    plantSeed(farm, 0, 0, 'khoai-lang');
    advanceDay(farm, NIGHT); // khát 1
    waterPlot(farm, 0, 0);
    advanceDay(farm, NIGHT); // lớn, hết khát
    const c = plotAt(farm, 0, 0)!.crop!;
    expect(c).toMatchObject({ age: 1, dryDays: 0, withered: false });
    advanceDay(farm, NIGHT); // khát 1 lại — chưa héo
    expect(c.withered).toBe(false);
  });

  it('cây chín để đó không hỏng (không khát, không héo dù không tưới nhiều đêm)', () => {
    const farm = farmWith();
    plantSeed(farm, 0, 0, 'rau-cai');
    waterPlot(farm, 0, 0);
    advanceDay(farm, NIGHT);
    for (let d = 0; d < 5; d++) advanceDay(farm, NIGHT);
    const c = plotAt(farm, 0, 0)!.crop!;
    expect(c).toMatchObject({ withered: false, dryDays: 0 });
    expect(isRipe(c, growDaysOf)).toBe(true);
  });

  it('ô cuốc dở giữ số nhát qua đêm (tillProgressKeepsOvernight), tắt cờ thì về 0; ô đã cuốc chưa gieo giữ nguyên', () => {
    const farm = farmWith([0]);
    strikeTill(farm, 1, 0, N);
    strikeTill(farm, 1, 0, N);
    advanceDay(farm, NIGHT);
    expect(plotAt(farm, 1, 0)).toMatchObject({ soil: 'untilled', tillStrikes: 2 });
    expect(plotAt(farm, 0, 0)).toMatchObject({ soil: 'tilled', tillStrikes: N, crop: null });
    advanceDay(farm, { ...NIGHT, tillProgressKeepsOvernight: false });
    expect(plotAt(farm, 1, 0)?.tillStrikes).toBe(0);
    expect(plotAt(farm, 0, 0)?.soil).toBe('tilled');
  });
});

describe('harvestPlot / clearWithered', () => {
  it('chưa chín thì không hái được', () => {
    const farm = farmWith();
    plantSeed(farm, 0, 0, 'khoai-lang');
    expect(harvestPlot(farm, 0, 0, growDaysOf, true)).toBeNull();
    expect(harvestPlot(farm, 1, 0, growDaysOf, true)).toBeNull(); // không có cây
  });

  it('hái → trả mã cây, ô về đất chưa cuốc (harvestResetsSoil, tillStrikes = 0)', () => {
    const farm = farmWith();
    plantSeed(farm, 0, 0, 'rau-cai');
    waterPlot(farm, 0, 0);
    advanceDay(farm, NIGHT);
    expect(harvestPlot(farm, 0, 0, growDaysOf, gameConfig.harvestResetsSoil)).toBe('rau-cai');
    expect(plotAt(farm, 0, 0)).toMatchObject({ soil: 'untilled', tillStrikes: 0, crop: null, watered: false });
    expect(jobFor(farm, 0, 0, growDaysOf)).toBe('till');
  });

  it('harvestResetsSoil = false → ô vẫn là đất đã cuốc, gieo tiếp được', () => {
    const farm = farmWith();
    plantSeed(farm, 0, 0, 'rau-cai');
    waterPlot(farm, 0, 0);
    advanceDay(farm, NIGHT);
    expect(harvestPlot(farm, 0, 0, growDaysOf, false)).toBe('rau-cai');
    expect(plotAt(farm, 0, 0)).toMatchObject({ soil: 'tilled', crop: null });
    expect(jobFor(farm, 0, 0, growDaysOf)).toBe('plant');
  });

  it('dọn cây héo → ô về đất chưa cuốc, tillStrikes = 0; cây chưa héo thì không dọn', () => {
    const farm = farmWith();
    plantSeed(farm, 0, 0, 'rau-cai');
    expect(clearWithered(farm, 0, 0)).toBe(false);
    advanceDay(farm, NIGHT);
    advanceDay(farm, NIGHT);
    expect(clearWithered(farm, 0, 0)).toBe(true);
    expect(plotAt(farm, 0, 0)).toMatchObject({ soil: 'untilled', tillStrikes: 0, crop: null, watered: false });
    expect(clearWithered(farm, 0, 0)).toBe(false);
  });
});
