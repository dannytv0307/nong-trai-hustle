// T-006: chọn vật để click / bấm F (thùng bán, sạp hạt).
import { describe, expect, it } from 'vitest';
import { gameConfig } from '../config/gameConfig';
import { blockedGrid, gardenLayout as L } from './garden';
import { distanceToTarget, nearestKeyTarget, targetAt, targetInReach } from './interact';

const T = 64;
const center = (tx: number, ty: number) => ({ x: (tx + 0.5) * T, y: (ty + 0.5) * T });

describe('vật tương tác (thùng bán, sạp hạt)', () => {
  it('targetAt: mọi ô của vật trả đúng tên, ô khác null', () => {
    expect(targetAt(L, L.sellBox.x, L.sellBox.y)).toBe('sellBox');
    for (let y = L.seedStall.y; y < L.seedStall.y + L.seedStall.h; y++) {
      for (let x = L.seedStall.x; x < L.seedStall.x + L.seedStall.w; x++) expect(targetAt(L, x, y)).toBe('seedStall');
    }
    expect(targetAt(L, L.plots.x, L.plots.y)).toBeNull();
    expect(targetAt(L, L.spawn.x, L.spawn.y)).toBeNull();
  });

  it('vật chặn đường (có va chạm)', () => {
    const grid = blockedGrid(L);
    expect(grid[L.sellBox.y][L.sellBox.x]).toBe(true);
    expect(grid[L.seedStallFoot.y][L.seedStallFoot.x]).toBe(true);
  });

  it('click: trong tầm interactRange (tính tới tâm ô gần nhất của vật)', () => {
    const b = L.sellBox;
    const near = center(b.x, b.y + 2); // cách 2 ô
    const far = center(b.x, b.y + 3); // cách 3 ô
    expect(targetInReach(L, 'sellBox', near.x, near.y, T, gameConfig.interactRange)).toBe(true);
    expect(targetInReach(L, 'sellBox', far.x, far.y, T, gameConfig.interactRange)).toBe(false);
    // Sạp 3 ô ngang: đứng lệch về một đầu vẫn với tới ô gần nhất.
    const s = L.seedStall;
    const p = center(s.x + s.w + 1, s.y);
    expect(targetInReach(L, 'seedStall', p.x, p.y, T, gameConfig.interactRange)).toBe(true);
  });

  it('phím F: đứng ô kề (kể cả chéo) thì có; cách một ô thì không', () => {
    const b = L.sellBox;
    const r = gameConfig.interactKeyRange;
    for (const [dx, dy] of [[0, 1], [1, 0], [-1, 0], [0, -1], [1, 1]]) {
      const p = center(b.x + dx, b.y + dy);
      expect(nearestKeyTarget(L, p.x, p.y, T, r), `${dx},${dy}`).toBe('sellBox');
    }
    const p2 = center(b.x, b.y + 2);
    expect(nearestKeyTarget(L, p2.x, p2.y, T, r)).toBeNull();
    const ps = center(L.seedStall.x + 1, L.seedStall.y - 1);
    expect(nearestKeyTarget(L, ps.x, ps.y, T, r)).toBe('seedStall');
    expect(nearestKeyTarget(L, center(L.spawn.x, L.spawn.y).x, center(L.spawn.x, L.spawn.y).y, T, r)).toBeNull();
  });

  it('distanceToTarget: 0 khi ở trong, đo tới mép', () => {
    const b = L.sellBox;
    expect(distanceToTarget(L, 'sellBox', (b.x + 0.5) * T, (b.y + 0.5) * T, T)).toBe(0);
    expect(distanceToTarget(L, 'sellBox', (b.x + 0.5) * T, (b.y + b.h + 1) * T, T)).toBeCloseTo(1);
  });
});

describe('giường (T-007)', () => {
  it('targetAt / phím F: đứng ô thức dậy (ngay dưới giường) thì F chọn giường; thùng bán ở xa', () => {
    const b = L.bed;
    expect(targetAt(L, b.x, b.y)).toBe('bed');
    expect(targetAt(L, b.x + b.w - 1, b.y)).toBe('bed');
    const p = center(L.wakeSpot.x, L.wakeSpot.y);
    expect(nearestKeyTarget(L, p.x, p.y, T, gameConfig.interactKeyRange)).toBe('bed');
    expect(targetInReach(L, 'bed', p.x, p.y, T, gameConfig.interactRange)).toBe(true);
  });

  it('ô thức dậy đi được (không bị chặn) và ở ngay trước hiên nhà (T-024: chõng hiên là giường tạm tới T-093)', () => {
    const grid = blockedGrid(L);
    expect(grid[L.wakeSpot.y][L.wakeSpot.x]).toBe(false);
    const h = L.house;
    expect(L.wakeSpot.x).toBeGreaterThanOrEqual(h.x);
    expect(L.wakeSpot.x).toBeLessThan(h.x + h.w);
    expect(L.wakeSpot.y).toBe(h.y + h.h);
  });

  it('T-024: quầy hạt bấm được cả ảnh (cả hàng trên — không chặn — lẫn chân đế)', () => {
    const s = L.seedStall;
    expect(targetAt(L, s.x + 1, s.y)).toBe('seedStall');
    expect(targetAt(L, s.x + 1, s.y + 1)).toBe('seedStall');
  });
});
