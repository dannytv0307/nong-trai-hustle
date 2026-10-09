import { describe, expect, it } from 'vitest';
import { gameConfig } from '../config/gameConfig';
import {
  blockedGrid,
  cornerNudge,
  gardenLayout as L,
  houseWallRects,
  isReachable,
  rectsOverlap,
  solids,
  tileOf,
  tileSolidGrid,
} from './garden';

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

describe('tileSolidGrid + cornerNudge (BUG-001)', () => {
  const solid = tileSolidGrid(L);
  const T = 64;
  const doorL = L.house.doorX * T; // 640
  const doorR = (L.house.doorX + L.house.doorW) * T; // 768
  const belowWall = (L.house.y + L.house.h) * T; // 704
  const box = (cx: number) => ({ left: cx - 20, right: cx + 20, top: belowWall, bottom: belowWall + 20 });

  it('lưới va chạm không chứa cây nhưng có tường', () => {
    const [tx, ty] = L.trees[0];
    expect(solid[ty][tx]).toBe(false);
    expect(solid[L.house.y][L.house.x]).toBe(true);
  });
  it('lệch trái mép cửa ≤ 16px khi đi lên → nắn sang phải vào cửa', () => {
    expect(cornerNudge(solid, box(doorL + 20 - 10), { x: 0, y: -1 }, T, 16)).toEqual({ x: 1, y: 0 });
  });
  it('lệch phải mép cửa → nắn sang trái', () => {
    expect(cornerNudge(solid, box(doorR - 20 + 12), { x: 0, y: -1 }, T, 16)).toEqual({ x: -1, y: 0 });
  });
  it('lệch quá xa thì không nắn; đã thẳng cửa thì không cần nắn', () => {
    expect(cornerNudge(solid, box(doorL - 20), { x: 0, y: -1 }, T, 16)).toEqual({ x: 0, y: 0 });
    expect(cornerNudge(solid, box(doorL + 64), { x: 0, y: -1 }, T, 16)).toEqual({ x: 0, y: 0 });
  });
  it('đi chéo thì không nắn', () => {
    expect(cornerNudge(solid, box(doorL + 10), { x: 1, y: -1 }, T, 16)).toEqual({ x: 0, y: 0 });
  });
});
