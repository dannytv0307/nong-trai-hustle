import { describe, expect, it } from 'vitest';
import { gameConfig } from '../config/gameConfig';
import {
  canTill,
  createFarm,
  facingToward,
  inReach,
  isPartiallyTilled,
  plotAt,
  strikeTill,
  strikesRemaining,
  tilledCount,
  tillStage,
} from './farm';
import { gardenLayout as L } from './garden';

const T = 64;
const R = gameConfig.interactRange;
const N = gameConfig.tillStrikesPerPlot;
/** Tâm ô (tx, ty) theo px. */
const center = (tx: number, ty: number): [number, number] => [(tx + 0.5) * T, (ty + 0.5) * T];

describe('createFarm — ruộng ban đầu', () => {
  it('vùng ruộng Vườn có đúng startPlots ô, tất cả chưa cuốc', () => {
    const farm = createFarm(L.plots);
    expect(farm.plots).toHaveLength(gameConfig.startPlots);
    expect(farm.plots.every((p) => p.soil === 'untilled' && p.tillStrikes === 0)).toBe(true);
    expect(tilledCount(farm)).toBe(0);
  });

  it('plotAt tìm được ô trong ruộng, ngoài ruộng (cỏ) trả về null', () => {
    const farm = createFarm({ x: 2, y: 3, w: 3, h: 2 });
    expect(plotAt(farm, 2, 3)).toEqual({ x: 2, y: 3, soil: 'untilled', tillStrikes: 0 });
    expect(plotAt(farm, 4, 4)).not.toBeNull();
    expect(plotAt(farm, 5, 3)).toBeNull();
    expect(plotAt(farm, 1, 3)).toBeNull();
    expect(plotAt(farm, 2, 5)).toBeNull();
  });
});

/** Cuốc trọn một ô bằng N nhát (helper test). */
const tillFully = (farm: ReturnType<typeof createFarm>, x: number, y: number, n = N) => {
  let r = strikeTill(farm, x, y, n);
  while (r === 'progress') r = strikeTill(farm, x, y, n);
  return r;
};

describe('strikeTill — cuốc nhiều nhát (D-022)', () => {
  it('thông số mặc định: 6 nhát × 0.85 giây ≈ 5,1 giây/ô, 3 nấc đất, hàng chờ 3', () => {
    expect(gameConfig.tillStrikesPerPlot).toBe(6);
    expect(gameConfig.tillStrikeSeconds).toBe(0.85);
    expect(gameConfig.tillStrikesPerPlot * gameConfig.tillStrikeSeconds).toBeCloseTo(5.1);
    expect(gameConfig.tillVisualStages).toBe(3);
    expect(gameConfig.tillQueueMax).toBe(3);
    expect(gameConfig.staminaCostTill).toBe(4);
    expect(gameConfig.tillScreenShake).toBe(false);
  });

  it('5 nhát đầu: "progress", ô vẫn chưa cuốc (cuốc dở); nhát 6: "done", ô thành đất cuốc', () => {
    const farm = createFarm({ x: 0, y: 0, w: 3, h: 3 });
    for (let i = 1; i < N; i++) {
      expect(strikeTill(farm, 1, 1, N)).toBe('progress');
      expect(plotAt(farm, 1, 1)).toMatchObject({ soil: 'untilled', tillStrikes: i });
      expect(isPartiallyTilled(plotAt(farm, 1, 1)!)).toBe(true);
      expect(canTill(farm, 1, 1)).toBe(true); // cuốc dở vẫn click được (làm tiếp)
    }
    expect(strikeTill(farm, 1, 1, N)).toBe('done');
    expect(plotAt(farm, 1, 1)).toMatchObject({ soil: 'tilled', tillStrikes: N });
    expect(isPartiallyTilled(plotAt(farm, 1, 1)!)).toBe(false);
    expect(tilledCount(farm)).toBe(1);
  });

  it('ô đã cuốc / ô ngoài ruộng: "invalid", không đổi gì', () => {
    const farm = createFarm({ x: 0, y: 0, w: 3, h: 3 });
    tillFully(farm, 0, 0);
    expect(canTill(farm, 0, 0)).toBe(false);
    expect(strikeTill(farm, 0, 0, N)).toBe('invalid');
    expect(plotAt(farm, 0, 0)?.tillStrikes).toBe(N);
    expect(canTill(farm, 3, 0)).toBe(false);
    expect(strikeTill(farm, 3, 0, N)).toBe('invalid');
    expect(tilledCount(farm)).toBe(1);
  });

  it('strikesRemaining: ô mới 6, ô dở 4/6 còn 2, ô xong / ngoài ruộng 0', () => {
    const farm = createFarm({ x: 0, y: 0, w: 3, h: 1 });
    expect(strikesRemaining(farm, 0, 0, N)).toBe(6);
    for (let i = 0; i < 4; i++) strikeTill(farm, 1, 0, N);
    expect(strikesRemaining(farm, 1, 0, N)).toBe(2);
    tillFully(farm, 2, 0);
    expect(strikesRemaining(farm, 2, 0, N)).toBe(0);
    expect(strikesRemaining(farm, 9, 9, N)).toBe(0);
  });

  it('đổi số nhát nhỏ đi (cuốc sắt 4) khi ô đang dở 5/6 → nhát kế xong luôn', () => {
    const farm = createFarm({ x: 0, y: 0, w: 1, h: 1 });
    for (let i = 0; i < 5; i++) strikeTill(farm, 0, 0, 6);
    expect(strikesRemaining(farm, 0, 0, 4)).toBe(1);
    expect(strikeTill(farm, 0, 0, 4)).toBe('done');
    expect(plotAt(farm, 0, 0)).toMatchObject({ soil: 'tilled', tillStrikes: 4 });
  });

  it('cuốc cả 9 ô của Vườn', () => {
    const farm = createFarm(L.plots);
    for (const p of [...farm.plots]) expect(tillFully(farm, p.x, p.y)).toBe('done');
    expect(tilledCount(farm)).toBe(9);
  });

  it('trạng thái ruộng (cả ô cuốc dở) là JSON thuần (lưu save được)', () => {
    const farm = createFarm({ x: 0, y: 0, w: 2, h: 1 });
    tillFully(farm, 1, 0);
    strikeTill(farm, 0, 0, N);
    strikeTill(farm, 0, 0, N);
    expect(JSON.parse(JSON.stringify(farm))).toEqual(farm);
    expect(farm.plots[0].tillStrikes).toBe(2);
  });
});

describe('tillStage — đất đổi 3 nấc', () => {
  it('6 nhát / 3 nấc: đổi sau nhát 2, 4; nhát 6 = nấc cuối (đã cuốc)', () => {
    expect([0, 1, 2, 3, 4, 5, 6].map((k) => tillStage(k, 6, 3))).toEqual([0, 0, 1, 1, 2, 2, 3]);
  });

  it('chia đều với thông số khác (4 nhát / 2 nấc), không vượt quá nấc cuối', () => {
    expect([0, 1, 2, 3, 4, 9].map((k) => tillStage(k, 4, 2))).toEqual([0, 0, 1, 1, 2, 2]);
    expect(tillStage(3, 0, 3)).toBe(0);
  });
});

describe('inReach — tầm với tính từ tâm nhân vật (interactRange)', () => {
  it('tầm với hiện tại là 2.5 ô (người dùng chỉnh sau thử T-002)', () => {
    expect(R).toBe(2.5);
  });

  it('đứng giữa ô: với được mọi ô trong vòng 2 ô, trừ 4 góc chéo (2,2) (2.83 ô)', () => {
    const [cx, cy] = center(10, 10);
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const corner = Math.abs(dx) === 2 && Math.abs(dy) === 2;
        expect(inReach(cx, cy, 10 + dx, 10 + dy, T, R), `${dx},${dy}`).toBe(!corner);
      }
    }
  });

  it('ô cách 3 thì ngoài tầm', () => {
    const [cx, cy] = center(10, 10);
    expect(inReach(cx, cy, 13, 10, T, R)).toBe(false);
    expect(inReach(cx, cy, 10, 7, T, R)).toBe(false);
    expect(inReach(cx, cy, 13, 11, T, R)).toBe(false);
  });

  it('đúng biên: khoảng cách = tầm với vẫn tính là trong tầm', () => {
    // Tâm ô (2,0) = (160, 32); đứng ở (160 - 2.5×64, 32) = (0, 32) → cách đúng 2.5 ô.
    expect(inReach(160 - 2.5 * T, 32, 2, 0, T, 2.5)).toBe(true);
    expect(inReach(160 - 2.5 * T - 0.5, 32, 2, 0, T, 2.5)).toBe(false);
  });

  it('đứng lệch mép ô thì tầm với dịch theo', () => {
    // Ô 13 (tâm 13.5 ô): đứng ở x = 10.95 ô → cách 2.55 ô (ngoài); x = 11.05 ô → cách 2.45 ô (trong).
    expect(inReach(10.95 * T, 10.5 * T, 13, 10, T, R)).toBe(false);
    expect(inReach(11.05 * T, 10.5 * T, 13, 10, T, R)).toBe(true);
  });
});

describe('facingToward — quay mặt về ô được click', () => {
  const [cx, cy] = center(10, 10);
  it.each([
    [11, 10, 'right'],
    [9, 10, 'left'],
    [10, 9, 'up'],
    [10, 11, 'down'],
  ] as const)('ô (%i, %i) → %s', (tx, ty, want) => {
    expect(facingToward(cx, cy, tx, ty, T, 'down')).toBe(want);
  });

  it('ô chéo: lệch trục nào nhiều hơn thì quay theo trục đó', () => {
    // Đứng lệch lên trên trong ô → ô chéo dưới-phải lệch dọc nhiều hơn → xuống.
    expect(facingToward(10.5 * T, 10.2 * T, 11, 11, T, 'up')).toBe('down');
    expect(facingToward(10.2 * T, 10.5 * T, 11, 11, T, 'up')).toBe('right');
  });

  it('ô ngay dưới chân → giữ hướng cũ', () => {
    expect(facingToward(cx, cy, 10, 10, T, 'left')).toBe('left');
  });
});
