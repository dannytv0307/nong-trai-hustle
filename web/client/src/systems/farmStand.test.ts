// T-096b: việc ruộng phải đứng SÁT ô — chọn chỗ đứng cạnh ô + hàng chờ dọc luống (bước tới từng ô rồi làm).
import { describe, expect, it } from 'vitest';
import { createClickMove, planFarmStand, startClickMove, stepClickMove, type FarmStandPrefs, type PlanOptions } from './clickMove';
import { inFarmWorkRange } from './farm';
import { boxFitsGrid, cellAt, navFromBoolGrid, PathFinder, type NavGrid } from './pathfind';
import { createTileActionEvents, createTileActionState, requestTile, stepTileAction, type TileXY } from './tileAction';

const T = 64;
const RANGE = 1.2;

function gridOf(rows: string[]): NavGrid {
  return navFromBoolGrid(
    rows.map((r) => [...r].map((ch) => ch === '#')),
    T,
  );
}
const opts = (g: NavGrid): PlanOptions => ({ maxNodes: 6000, spotFree: (x, y) => boxFitsGrid(g, x, y, 22, 12), stepPx: 8, blockedSearchRadius: 6 });
const center = (x: number, y: number) => ({ x: (x + 0.5) * T, y: (y + 0.5) * T });

/** Ruộng 3×3 ở (3..5, 2..4) trên bãi trống 10×8. */
const plot = (x: number, y: number) => x >= 3 && x <= 5 && y >= 2 && y <= 4;
const prefs: FarmStandPrefs = { isPlot: plot, diagonalPenalty: 1.25, onPlotPenalty: 1, notSouthPenalty: 0.3, diagonalInset: 0.3 };
const field = () => gridOf(Array.from({ length: 8 }, () => '..........'));

describe('đứng sát ô ruộng (farmWorkRange)', () => {
  it('ô kề thẳng là sát; ô chéo chỉ sát khi xích vào góc chung; cách 2 ô thì không; đứng trên chính ô cũng không', () => {
    const t = { x: 4, y: 4 };
    expect(inFarmWorkRange(center(4, 5).x, center(4, 5).y, t.x, t.y, T, RANGE)).toBe(true);
    expect(inFarmWorkRange(center(5, 5).x, center(5, 5).y, t.x, t.y, T, RANGE)).toBe(false);
    expect(inFarmWorkRange(center(5, 5).x - 0.3 * T, center(5, 5).y - 0.3 * T, t.x, t.y, T, RANGE)).toBe(true);
    expect(inFarmWorkRange(center(4, 6).x, center(4, 6).y, t.x, t.y, T, RANGE)).toBe(false);
    expect(inFarmWorkRange(center(4, 4).x, center(4, 4).y, t.x, t.y, T, RANGE)).toBe(false);
  });
});

describe('chọn chỗ đứng cạnh ô ruộng', () => {
  const finder = new PathFinder();
  it('đứng ở phía nam (ngoài ruộng) cách 2,4 ô → bước tới ô ngay dưới ô hàng cuối, không dừng ở tầm 2,5', () => {
    const g = field();
    const from = center(4, 7);
    const res = planFarmStand(finder, g, from, { x: 4, y: 4 }, opts(g), prefs);
    expect(res.ok).toBe(true);
    expect(res.stand).toEqual({ x: 4, y: 5 });
    if (res.ok) expect(res.waypoints.at(-1)).toEqual(center(4, 5));
  });
  it('ô giữa ruộng: ô kề nào cũng là luống → chọn ô kề phía nam (mặt quay lên), gần người', () => {
    const g = field();
    const res = planFarmStand(finder, g, center(4, 7), { x: 4, y: 3 }, opts(g), prefs);
    expect(res.stand).toEqual({ x: 4, y: 4 });
  });
  it('đến từ phía tây: ô cột trái → đứng ô ngoài ruộng bên trái (gần hơn vòng xuống nam)', () => {
    const g = field();
    const res = planFarmStand(finder, g, center(0, 2), { x: 3, y: 2 }, opts(g), prefs);
    expect(res.stand).toEqual({ x: 2, y: 2 });
  });
  it('ô kề thẳng bị phạt nặng (vd luống) → đứng ô chéo, xích vào góc chung, vẫn trong tầm; vây kín → noPath', () => {
    const g = gridOf(['.....', '.....', '.....', '.....', '.....']);
    const ortho = (x: number, y: number) => Math.abs(x - 2) + Math.abs(y - 2) === 1;
    const res = planFarmStand(finder, g, center(4, 4), { x: 2, y: 2 }, opts(g), { ...prefs, isPlot: ortho, onPlotPenalty: 5 });
    expect(res.stand).toEqual({ x: 3, y: 3 });
    if (res.ok) {
      const end = res.waypoints.at(-1)!;
      expect(inFarmWorkRange(end.x, end.y, 2, 2, T, RANGE)).toBe(true);
    }
    const closed = gridOf(['.....', '.###.', '.#.#.', '.###.', '.....']);
    expect(planFarmStand(finder, closed, center(0, 0), { x: 2, y: 2 }, opts(closed), prefs)).toMatchObject({ ok: false });
  });
});

describe('hàng chờ dọc luống: bước tới sát từng ô rồi làm', () => {
  it('rê qua 3 ô hàng dưới ruộng: lần lượt đi tới đứng dưới từng ô, làm xong mới sang ô kế', () => {
    const g = field();
    const finder = new PathFinder();
    const s = createTileActionState();
    const ev = createTileActionEvents();
    const P = { duration: 0.4, impactAt: 0.5, queueMax: 4 };
    for (const t of [
      { x: 3, y: 4 },
      { x: 4, y: 4 },
      { x: 5, y: 4 },
    ])
      requestTile(s, t, P, 'water');
    const pos = center(1, 7);
    const walk = createClickMove<TileXY>();
    const v = { x: 0, y: 0 };
    const done: { tile: TileXY; stand: { x: number; y: number } }[] = [];
    for (let f = 0; f < 5000 && (s.current || s.queue.length > 0); f++) {
      const dt = 1 / 60;
      // Giống driveTileQueue: rảnh + ô đầu hàng chưa sát + chưa đi tới nó → lập đường tới chỗ đứng.
      if (!s.current && s.queue.length > 0) {
        const head = s.queue[0];
        if (!inFarmWorkRange(pos.x, pos.y, head.x, head.y, T, RANGE) && !(walk.active && walk.action === head)) {
          const res = planFarmStand(finder, g, pos, head, opts(g), prefs);
          expect(res.ok).toBe(true);
          if (res.ok) startClickMove(walk, res.waypoints.length ? res.waypoints : [res.spot!], head);
        }
      }
      stepClickMove(walk, pos, dt, { speed: 256, arrivePx: 3, stuckSeconds: 0.5 }, v);
      pos.x += v.x * dt;
      pos.y += v.y * dt;
      const r = stepTileAction(s, dt, P, () => true, ev, () => 1, (t) => !(walk.active && walk.action === t) && inFarmWorkRange(pos.x, pos.y, t.x, t.y, T, RANGE));
      if (r.started) {
        // Bắt đầu làm thì phải đang đứng yên sát ô.
        expect(inFarmWorkRange(pos.x, pos.y, r.started.x, r.started.y, T, RANGE)).toBe(true);
        done.push({ tile: { ...r.started }, stand: cellAt(g, pos.x, pos.y) });
      }
    }
    expect(done.map((d) => d.tile)).toEqual([
      { x: 3, y: 4 },
      { x: 4, y: 4 },
      { x: 5, y: 4 },
    ]);
    // Bước dọc luống: đứng ngay dưới TỪNG ô (phía nam, ngoài ruộng).
    expect(done.map((d) => d.stand)).toEqual([
      { x: 3, y: 5 },
      { x: 4, y: 5 },
      { x: 5, y: 5 },
    ]);
  });

  it('ô chưa sát: stepTileAction giữ nguyên ở đầu hàng (không bỏ, không bắt đầu)', () => {
    const s = createTileActionState();
    const ev = createTileActionEvents();
    const P = { duration: 0.4, impactAt: 0.5, queueMax: 4 };
    requestTile(s, { x: 1, y: 1 }, P, 'water');
    const r = stepTileAction(s, 1 / 60, P, () => true, ev, () => 1, () => false);
    expect(r.started).toBeNull();
    expect(s.queue).toEqual([{ x: 1, y: 1 }]);
    expect(s.kind).toBe('water');
  });
});
