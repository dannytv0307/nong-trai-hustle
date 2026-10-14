import { describe, expect, it } from 'vitest';
import { blockedGrid, gardenLayout as L } from './garden';
import {
  boxFitsGrid,
  cellAt,
  cellCenter,
  createNavGrid,
  isFreeCell,
  navFromBoolGrid,
  nearestFreeCell,
  octile,
  PathFinder,
  segmentClear,
  smoothPath,
  type Cell,
  type NavGrid,
} from './pathfind';

/** Lưới từ chuỗi: '#' = chặn, '.' = trống. */
function gridOf(rows: string[], cell = 64): NavGrid {
  return navFromBoolGrid(
    rows.map((r) => [...r].map((ch) => ch === '#')),
    cell,
  );
}

/** Mỗi bước trong dãy ô là một ô kề (8 hướng), đi chéo thì không cắt góc. */
function assertValidPath(g: NavGrid, cells: Cell[]): void {
  for (const c of cells) expect(isFreeCell(g, c.x, c.y)).toBe(true);
  for (let i = 1; i < cells.length; i++) {
    const dx = cells[i].x - cells[i - 1].x;
    const dy = cells[i].y - cells[i - 1].y;
    expect(Math.max(Math.abs(dx), Math.abs(dy))).toBe(1);
    if (dx !== 0 && dy !== 0) {
      expect(isFreeCell(g, cells[i - 1].x + dx, cells[i - 1].y)).toBe(true);
      expect(isFreeCell(g, cells[i - 1].x, cells[i - 1].y + dy)).toBe(true);
    }
  }
}

describe('lưới điều hướng', () => {
  it('ô ↔ px theo gốc lưới và cỡ ô', () => {
    const g = createNavGrid(4, 3, 32, 100, 200);
    expect(cellAt(g, 100, 200)).toEqual({ x: 0, y: 0 });
    expect(cellAt(g, 163, 231)).toEqual({ x: 1, y: 0 });
    expect(cellCenter(g, 1, 2)).toEqual({ x: 148, y: 280 });
    expect(isFreeCell(g, -1, 0)).toBe(false);
    expect(isFreeCell(g, 4, 0)).toBe(false);
  });

  it('octile: thẳng = 1/ô, chéo = √2/ô', () => {
    expect(octile(0, 0, 3, 0)).toBe(3);
    expect(octile(0, 0, 2, 2)).toBeCloseTo(2 * Math.SQRT2);
  });
});

describe('A* 8 hướng', () => {
  const finder = new PathFinder();

  it('đường thẳng khi không có vật cản', () => {
    const g = gridOf(['.....', '.....', '.....']);
    const r = finder.findPath(g, { x: 0, y: 1 }, { x: 4, y: 1 }, 1000);
    expect(r?.cells).toHaveLength(5);
    assertValidPath(g, r!.cells);
  });

  it('đi vòng qua bức tường', () => {
    const g = gridOf([
      '.......',
      '..###..',
      '..#.#..',
      '..#.#..',
      '.......',
    ]);
    const r = finder.findPath(g, { x: 0, y: 2 }, { x: 6, y: 2 }, 1000);
    expect(r).not.toBeNull();
    assertValidPath(g, r!.cells);
    expect(r!.cells.at(-1)).toEqual({ x: 6, y: 2 });
  });

  it('không cắt góc: hai khối chéo nhau chặn đường chéo', () => {
    const g = gridOf(['.#', '#.']);
    expect(finder.findPath(g, { x: 0, y: 0 }, { x: 1, y: 1 }, 100)).toBeNull();
  });

  it('không có đường (đích bị vây kín) → null; đích là ô chặn → null', () => {
    const g = gridOf(['.....', '.###.', '.#.#.', '.###.', '.....']);
    expect(finder.findPath(g, { x: 0, y: 0 }, { x: 2, y: 2 }, 1000)).toBeNull();
    expect(finder.findPath(g, { x: 0, y: 0 }, { x: 1, y: 1 }, 1000)).toBeNull();
  });

  it('vượt giới hạn số nút → null', () => {
    const g = createNavGrid(40, 40, 64);
    expect(finder.findPath(g, { x: 0, y: 0 }, { x: 39, y: 39 }, 10)).toBeNull();
    expect(finder.findPath(g, { x: 0, y: 0 }, { x: 39, y: 39 }, 5000)).not.toBeNull();
  });

  it('đường ngắn nhất: chi phí bằng octile khi không vật cản', () => {
    const g = createNavGrid(10, 10, 64);
    const r = finder.findPath(g, { x: 1, y: 1 }, { x: 7, y: 4 }, 1000)!;
    let cost = 0;
    for (let i = 1; i < r.cells.length; i++) {
      const diag = r.cells[i].x !== r.cells[i - 1].x && r.cells[i].y !== r.cells[i - 1].y;
      cost += diag ? Math.SQRT2 : 1;
    }
    expect(cost).toBeCloseTo(octile(1, 1, 7, 4));
  });

  it('tìm theo điều kiện (Dijkstra): lấy ô thoả gần nhất theo đường đi thật', () => {
    // Ô thoả ở (4,0) gần theo đường chim bay nhưng sau tường; ô (0,4) xa hơn chút mà đi thẳng tới được.
    const g = gridOf(['..#..', '..#..', '..#..', '..#..', '.....']);
    const goals = new Set(['4,0', '0,4']);
    const r = finder.search(g, { x: 0, y: 0 }, (x, y) => goals.has(`${x},${y}`), () => 0, 1000);
    expect(r?.cells.at(-1)).toEqual({ x: 0, y: 4 });
  });

  it('dùng lại một PathFinder cho nhiều lưới khác cỡ', () => {
    const small = gridOf(['...', '...']);
    const big = createNavGrid(60, 42, 64);
    expect(finder.findPath(big, { x: 0, y: 0 }, { x: 59, y: 41 }, 6000)).not.toBeNull();
    expect(finder.findPath(small, { x: 0, y: 0 }, { x: 2, y: 1 }, 100)?.cells.at(-1)).toEqual({ x: 2, y: 1 });
  });

  it('hiệu năng: bản đồ 60×42 (Xóm) nhiều vật cản — tìm 200 lần vẫn nhanh', () => {
    // Lưới có nhiều "nhà" 4×3 rải đều, chừa lối đi.
    const g = createNavGrid(60, 42, 64);
    for (let by = 2; by < 40; by += 6) {
      for (let bx = 2; bx < 58; bx += 7) {
        for (let y = by; y < by + 3; y++) for (let x = bx; x < bx + 4; x++) g.blocked[y * 60 + x] = 1;
      }
    }
    const t0 = performance.now();
    let found = 0;
    for (let i = 0; i < 200; i++) {
      const r = finder.findPath(g, { x: 0, y: 0 }, { x: 59, y: 41 - (i % 2) }, 6000);
      if (r) found++;
    }
    const ms = (performance.now() - t0) / 200;
    expect(found).toBe(200);
    // Một lần tìm (chỉ chạy lúc click) phải dưới vài mili-giây; ngưỡng rộng để máy CI chậm không đỏ.
    expect(ms).toBeLessThan(20);
  });
});

describe('ô trống gần nhất', () => {
  it('ô trống thì giữ nguyên; ô chặn thì lấy ô trống gần nhất, hoà thì gần chỗ đứng hơn', () => {
    const g = gridOf(['.....', '.###.', '.###.', '.###.', '.....'], 64);
    expect(nearestFreeCell(g, { x: 0, y: 0 }, 3)).toEqual({ x: 0, y: 0 });
    // Giữa khối 3×3: 4 ô cách 2 (thẳng) — người đứng phía dưới thì chọn ô dưới.
    const below = cellCenter(g, 2, 4);
    expect(nearestFreeCell(g, { x: 2, y: 2 }, 3, { x: below.x, y: below.y + 200 })).toEqual({ x: 2, y: 4 });
    const above = cellCenter(g, 2, 0);
    expect(nearestFreeCell(g, { x: 2, y: 2 }, 3, { x: above.x, y: above.y - 200 })).toEqual({ x: 2, y: 0 });
  });
  it('quanh đó toàn ô chặn → null', () => {
    const g = gridOf(['###', '###', '###']);
    expect(nearestFreeCell(g, { x: 1, y: 1 }, 3)).toBeNull();
  });
});

describe('làm mượt đường', () => {
  it('đi thẳng được thì bỏ hết điểm giữa', () => {
    const pts = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 20, y: 10 },
      { x: 30, y: 20 },
    ];
    expect(smoothPath(pts, 4, () => true)).toEqual([{ x: 30, y: 20 }]);
  });
  it('giữ điểm góc khi đi thẳng sẽ cắt qua vật cản', () => {
    // Vật cản ở góc trên-phải (x > 5 và y < 25): đường chéo (0,0) → (30,30) cắt qua → phải ghé góc (0,30).
    const free = (x: number, y: number) => !(x > 5 && y < 25);
    const pts = [
      { x: 0, y: 0 },
      { x: 0, y: 30 },
      { x: 30, y: 30 },
    ];
    expect(smoothPath(pts, 2, free)).toEqual([
      { x: 0, y: 30 },
      { x: 30, y: 30 },
    ]);
  });
  it('segmentClear kiểm cả hai đầu mút', () => {
    expect(segmentClear(0, 0, 100, 0, 10, (x) => x < 100)).toBe(false);
    expect(segmentClear(0, 0, 99, 0, 10, (x) => x < 100)).toBe(true);
  });
});

describe('hộp chân nằm trong ô trống', () => {
  it('hộp 40×20 giữa ô 64 trống thì vừa; lấn sang ô chặn thì không', () => {
    const g = gridOf(['..', '.#']);
    expect(boxFitsGrid(g, 32, 32, 20, 10)).toBe(true);
    expect(boxFitsGrid(g, 64, 32, 20, 10)).toBe(true); // giữa hai ô trống hàng trên
    expect(boxFitsGrid(g, 64, 64, 20, 10)).toBe(false); // chạm ô (1,1) chặn
  });
});

describe('bản đồ Vườn thật', () => {
  const g = navFromBoolGrid(blockedGrid(L), 64);
  const finder = new PathFinder();
  it('từ chỗ xuất phát đi vòng nhà ra sau nhà được', () => {
    const behind = { x: L.house.x + 2, y: L.house.y - 3 };
    expect(isFreeCell(g, behind.x, behind.y)).toBe(true);
    const r = finder.findPath(g, { x: Math.floor(L.spawn.x), y: Math.floor(L.spawn.y) }, behind, 6000);
    expect(r).not.toBeNull();
    assertValidPath(g, r!.cells);
    // Đường không xuyên chân đế nhà.
    for (const c of r!.cells) {
      const inHouse = c.x >= L.house.x && c.x < L.house.x + L.house.w && c.y >= L.house.y && c.y < L.house.y + L.house.h;
      expect(inHouse).toBe(false);
    }
  });
  it('tới cạnh quầy hạt và thùng bán được', () => {
    const start = { x: Math.floor(L.spawn.x), y: Math.floor(L.spawn.y) };
    const near = (r: { x: number; y: number; w: number; h: number }) => nearestFreeCell(g, { x: r.x, y: r.y + r.h }, 4)!;
    expect(finder.findPath(g, start, near(L.seedStallFoot), 6000)).not.toBeNull();
    expect(finder.findPath(g, start, near(L.sellBox), 6000)).not.toBeNull();
  });
});
