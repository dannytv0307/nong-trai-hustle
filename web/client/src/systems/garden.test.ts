import { describe, expect, it } from 'vitest';
import { gameConfig } from '../config/gameConfig';
import {
  blockedGrid,
  cornerNudge,
  gardenLayout as L,
  isReachable,
  rectsOverlap,
  resolveLayout,
  solids,
  tileOf,
  tileSolidGrid,
  type GardenLayoutData,
} from './garden';
import layoutJson from '../data/gardenLayout.json';
import { propSpec } from './props';

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

  it('ruộng, lối đi, sân, thùng bán, sạp hạt không đè lên vật cản khác', () => {
    const areas = [
      { name: 'plots', rect: L.plots },
      { name: 'path', rect: L.path },
      { name: 'yard', rect: L.yard! },
      { name: 'sellBox', rect: L.sellBox },
      { name: 'seedStall', rect: L.seedStallFoot },
    ];
    for (const area of areas) {
      for (const s of solids(L)) {
        if (s.kind === area.name) continue; // T-006: thùng bán / sạp hạt chính là vật cản
        if (area.name === 'yard' && s.kind === 'sellBox') continue; // thúng đứng trên sân
        expect(rectsOverlap(area.rect, s.rect), `${area.name} vs ${s.kind}`).toBe(false);
      }
    }
  });

  it('đi bộ được tới giường, mọi ô ruộng, thùng bán, sạp hạt', () => {
    const besideBed = { x: L.bed.x, y: L.bed.y + L.bed.h };
    expect(isReachable(grid, spawnTile, besideBed)).toBe(true);
    for (let y = L.plots.y; y < L.plots.y + L.plots.h; y++) {
      for (let x = L.plots.x; x < L.plots.x + L.plots.w; x++) expect(isReachable(grid, spawnTile, { x, y })).toBe(true);
    }
    // T-006: thùng bán / sạp hạt có va chạm → đi tới được ô cạnh chúng (đứng cạnh để bấm F).
    expect(isReachable(grid, spawnTile, { x: L.sellBox.x, y: L.sellBox.y + L.sellBox.h })).toBe(true);
    expect(isReachable(grid, spawnTile, { x: L.seedStall.x, y: L.seedStall.y - 1 })).toBe(true);
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

describe('T-024: nhà {ten}, quầy hạt, thúng bán theo props.json', () => {
  it('chân đế nhà = foot props.json (6×2), chặn; mái phía trên đi sau được', () => {
    const foot = propSpec('house-hero').foot!;
    expect([L.house.w, L.house.h]).toEqual([foot.w, foot.h]);
    for (let y = L.house.y; y < L.house.y + L.house.h; y++) {
      for (let x = L.house.x; x < L.house.x + L.house.w; x++) expect(grid[y][x], `${x},${y}`).toBe(true);
    }
    expect(grid[L.house.y - 1][L.house.x]).toBe(false);
    expect(isReachable(grid, spawnTile, { x: L.house.x + 2, y: L.house.y - 1 })).toBe(true);
  });

  it('cửa nằm ở hàng đáy chân đế, ngay trên lối dọc; điểm cửa trong ô cửa; chừa ô trống dưới cửa', () => {
    const d = L.houseDoor;
    expect(d.y).toBe(L.house.y + L.house.h - 1);
    expect(d.x).toBe(L.path.x);
    expect(d.w).toBe(L.path.w);
    const p = L.houseDoorPoint;
    expect(p.x).toBeGreaterThanOrEqual(d.x * 64);
    expect(p.x).toBeLessThanOrEqual((d.x + d.w) * 64);
    expect(Math.floor(p.y / 64)).toBe(d.y);
    for (let x = d.x; x < d.x + d.w; x++) expect(grid[d.y + 1][x]).toBe(false);
  });

  it('quầy hạt: vùng click cả ảnh 3×2, chỉ hàng dưới chặn; chỗ người bán (sellerSpot) sau mặt quầy', () => {
    expect([L.seedStall.w, L.seedStall.h]).toEqual([3, 2]);
    expect(L.seedStallFoot).toEqual({ x: L.seedStall.x, y: L.seedStall.y + 1, w: 3, h: 1 });
    expect(grid[L.seedStall.y][L.seedStall.x]).toBe(false);
    expect(grid[L.seedStallFoot.y][L.seedStallFoot.x]).toBe(true);
    // sellerSpot px (96, 52) trong ảnh 192×128 (mép trên ảnh = mép trên vùng click).
    expect(L.sellerSpot).toEqual({ x: L.seedStall.x * 64 + 96, y: L.seedStall.y * 64 + 52 });
  });

  it('chừa ≥ 1 ô trống quanh thúng bán (4 phía) và trước quầy hạt', () => {
    const b = L.sellBox;
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      expect(grid[b.y + dy][b.x + dx], `${dx},${dy}`).toBe(false);
    }
    const f = L.seedStallFoot;
    for (let x = f.x; x < f.x + f.w; x++) expect(grid[f.y + 1][x]).toBe(false);
  });

  it('giường tạm (chõng hiên) nằm trong chân đế nhà; ô thức dậy ngay dưới, đi được', () => {
    expect(rectsOverlap(L.bed, L.house)).toBe(true);
    expect(L.wakeSpot.y).toBe(L.bed.y + L.bed.h);
    expect(grid[L.wakeSpot.y][L.wakeSpot.x]).toBe(false);
  });

  it('resolveLayout: mốc là ô trên-trái chân đế, dời nhà thì cửa dời theo', () => {
    const raw = { ...(layoutJson as unknown as GardenLayoutData), house: { prop: 'house-hero', x: 2, y: 4 } };
    const r = resolveLayout(raw, 64);
    expect(r.house).toEqual({ x: 2, y: 4, w: 6, h: 2 });
    expect(r.houseDoor).toEqual({ x: 4, y: 5, w: 2, h: 1 });
    expect(r.houseDoorPoint).toEqual({ x: 2 * 64 + 196, y: 6 * 64 - 320 + 316 });
  });

  it('cây nhãn không đè nhà / ruộng / thúng / quầy / lối', () => {
    for (const [x, y] of L.trees) {
      const t = { x, y, w: 1, h: 1 };
      for (const r of [L.house, L.plots, L.sellBox, L.seedStall, L.path, L.yard!]) expect(rectsOverlap(t, r), `${x},${y}`).toBe(false);
    }
  });
});

describe('tileSolidGrid + cornerNudge (BUG-001)', () => {
  const solid = tileSolidGrid(L);
  const T = 64;

  it('lưới va chạm không chứa cây nhưng có nhà', () => {
    const [tx, ty] = L.trees[0];
    expect(solid[ty][tx]).toBe(false);
    expect(solid[L.house.y][L.house.x]).toBe(true);
  });

  // Tường giả có khe cửa 2 ô (x 10–11) ở hàng 10 — kiểm luật nắn vào khe độc lập với bố cục Vườn (T-024: nhà mới
  // không còn khe cửa đi xuyên — vào nhà ở T-093).
  const wall: boolean[][] = Array.from({ length: 14 }, (_, y) => Array.from({ length: 20 }, (_, x) => y === 10 && (x < 10 || x > 11)));
  const doorL = 10 * T;
  const doorR = 12 * T;
  const below = 11 * T;
  const box = (cx: number) => ({ left: cx - 20, right: cx + 20, top: below, bottom: below + 20 });

  it('lệch trái mép cửa ≤ 16px khi đi lên → nắn sang phải vào cửa', () => {
    expect(cornerNudge(wall, box(doorL + 20 - 10), { x: 0, y: -1 }, T, 16)).toEqual({ x: 1, y: 0 });
  });
  it('lệch phải mép cửa → nắn sang trái', () => {
    expect(cornerNudge(wall, box(doorR - 20 + 12), { x: 0, y: -1 }, T, 16)).toEqual({ x: -1, y: 0 });
  });
  it('lệch quá xa thì không nắn; đã thẳng cửa thì không cần nắn', () => {
    expect(cornerNudge(wall, box(doorL - 20), { x: 0, y: -1 }, T, 16)).toEqual({ x: 0, y: 0 });
    expect(cornerNudge(wall, box(doorL + 64), { x: 0, y: -1 }, T, 16)).toEqual({ x: 0, y: 0 });
  });
  it('đi chéo thì không nắn', () => {
    expect(cornerNudge(wall, box(doorL + 10), { x: 1, y: -1 }, T, 16)).toEqual({ x: 0, y: 0 });
  });
});
