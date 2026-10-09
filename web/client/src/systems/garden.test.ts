import { describe, expect, it } from 'vitest';
import { gameConfig } from '../config/gameConfig';
import { blockedGrid, gardenLayout as L, houseWallRects, isReachable, rectsOverlap, solids, tileOf } from './garden';

const grid = blockedGrid(L);
const spawnTile = { x: Math.floor(L.spawn.x), y: Math.floor(L.spawn.y) };

describe('bố cục Vườn (T-001)', () => {
  it('kích thước khớp gardenMapSize (GDD §5: 48×32)', () => {
    expect([L.cols, L.rows]).toEqual([...gameConfig.gardenMapSize]);
  });

  it('ruộng ban đầu có đúng startPlots ô', () => {
    expect(L.plots.w * L.plots.h).toBe(gameConfig.startPlots);
  });

  it('chỗ đứng đầu game không bị chặn', () => {
    expect(grid[spawnTile.y][spawnTile.x]).toBe(false);
  });

  it('ruộng, lối đi, thùng bán, sạp hạt không đè lên vật cản', () => {
    for (const area of [L.plots, L.path, L.sellBox, L.seedStall]) {
      for (const s of solids(L)) expect(rectsOverlap(area, s.rect), `${JSON.stringify(area)} vs ${s.kind}`).toBe(false);
    }
  });

  it('tường dưới nhà có ô cửa', () => {
    const bottom = L.house.y + L.house.h - 1;
    expect(grid[bottom][L.house.doorX]).toBe(false);
    expect(grid[bottom][L.house.doorX - 1]).toBe(true);
    expect(houseWallRects(L.house)).toHaveLength(5);
  });

  it('đi bộ được tới giường, mọi ô ruộng, thùng bán, sạp hạt', () => {
    const besideBed = { x: L.bed.x, y: L.bed.y + L.bed.h };
    expect(isReachable(grid, spawnTile, besideBed)).toBe(true);
    for (let y = L.plots.y; y < L.plots.y + L.plots.h; y++) {
      for (let x = L.plots.x; x < L.plots.x + L.plots.w; x++) expect(isReachable(grid, spawnTile, { x, y })).toBe(true);
    }
    expect(isReachable(grid, spawnTile, L.sellBox)).toBe(true);
    expect(isReachable(grid, spawnTile, L.seedStall)).toBe(true);
  });

  it('không ra khỏi rào', () => {
    expect(isReachable(grid, spawnTile, { x: 0, y: 5 })).toBe(false);
    expect(grid[0].every(Boolean)).toBe(true);
    expect(grid[L.rows - 1].every(Boolean)).toBe(true);
  });

  it('tileOf đổi px → ô', () => {
    expect(tileOf(704, 832, 64)).toEqual({ x: 11, y: 13 });
    expect(tileOf(63.9, 0, 64)).toEqual({ x: 0, y: 0 });
  });
});
