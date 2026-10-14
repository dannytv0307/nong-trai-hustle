import { describe, expect, it } from 'vitest';
import { cancelClickMove, createClickMove, planWalk, startClickMove, stepClickMove, type PlanOptions } from './clickMove';
import { gardenLayout as L, blockedGrid } from './garden';
import { houseExitSpot } from './house';
import { inReach } from './farm';
import { targetInReach } from './interact';
import { boxFitsGrid, cellAt, isFreeCell, navFromBoolGrid, PathFinder, type NavGrid } from './pathfind';
import { facingFromVector } from './movement';

const T = 64;
const FOOT = { hw: 22, hh: 12 }; // hộp chân 40×20 + 2 px mỗi bên

function gridOf(rows: string[]): NavGrid {
  return navFromBoolGrid(
    rows.map((r) => [...r].map((ch) => ch === '#')),
    T,
  );
}

function opts(g: NavGrid): PlanOptions {
  return { maxNodes: 6000, spotFree: (x, y) => boxFitsGrid(g, x, y, FOOT.hw, FOOT.hh), stepPx: 8, blockedSearchRadius: 6 };
}

/** Mô phỏng đi theo đường (không vật lý): trả về số frame tới nơi, -1 nếu quá `maxFrames`. */
function walk(s: ReturnType<typeof createClickMove<string>>, from: { x: number; y: number }, speed: number, maxFrames = 2000) {
  const pos = { ...from };
  const v = { x: 0, y: 0 };
  for (let i = 0; i < maxFrames; i++) {
    const st = stepClickMove(s, pos, 1 / 60, { speed, arrivePx: 3, stuckSeconds: 0.5 }, v);
    if (st === 'arrived') return { frames: i, pos };
    pos.x += v.x / 60;
    pos.y += v.y / 60;
  }
  return { frames: -1, pos };
}

describe('planWalk — đi tới một điểm', () => {
  const finder = new PathFinder();

  it('đường vòng qua tường, mọi đoạn thẳng đều không chạm vật cản', () => {
    const g = gridOf(['........', '...#....', '...#....', '...#....', '........']);
    const o = opts(g);
    const from = { x: 1.5 * T, y: 2.5 * T };
    const res = planWalk(finder, g, from, { kind: 'point', x: 6.5 * T, y: 2.5 * T }, o);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.waypoints.at(-1)).toEqual({ x: 6.5 * T, y: 2.5 * T });
    expect(res.waypoints.length).toBeGreaterThanOrEqual(2); // phải ghé ít nhất một góc
    let prev = from;
    for (const w of res.waypoints) {
      for (let t = 0; t <= 1; t += 0.02) expect(o.spotFree(prev.x + (w.x - prev.x) * t, prev.y + (w.y - prev.y) * t)).toBe(true);
      prev = w;
    }
  });

  it('click ô bị chặn → đi tới ô trống gần nhất (phía người đứng)', () => {
    const g = gridOf(['.......', '.......', '..###..', '..###..', '.......']);
    const res = planWalk(finder, g, { x: 3.5 * T, y: 4.5 * T }, { kind: 'point', x: 3.5 * T, y: 2.5 * T }, opts(g));
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    const end = res.waypoints.at(-1)!;
    const c = cellAt(g, end.x, end.y);
    expect(isFreeCell(g, c.x, c.y)).toBe(true);
    expect(c).toEqual({ x: 3, y: 1 }); // ô (3,1) ngay trên khối — cách ô click 1 ô
  });

  it('không có đường (đích trong vòng vây) → noPath', () => {
    const g = gridOf(['.......', '.#####.', '.#...#.', '.#####.', '.......']);
    const res = planWalk(finder, g, { x: 0.5 * T, y: 0.5 * T }, { kind: 'point', x: 3.5 * T, y: 2.5 * T }, opts(g));
    expect(res).toMatchObject({ ok: false, reason: 'noPath' });
  });

  it('click ngay chỗ đang đứng → already, không đi', () => {
    const g = gridOf(['...']);
    const res = planWalk(finder, g, { x: 32, y: 32 }, { kind: 'point', x: 32.4, y: 32 }, opts(g));
    expect(res).toMatchObject({ ok: true, already: true, waypoints: [] });
  });
});

describe('planWalk — tới chỗ đứng làm việc', () => {
  const finder = new PathFinder();
  it('đã với tới → already (làm luôn)', () => {
    const g = gridOf(['.....']);
    const res = planWalk(finder, g, { x: 32, y: 32 }, { kind: 'reach', canWorkFrom: () => true }, opts(g));
    expect(res).toMatchObject({ ok: true, already: true });
  });

  it('dừng ở ô GẦN NHẤT mà với tới ô ruộng (tầm 2,35 ô), không đi tới tận ô', () => {
    const g = gridOf(['............']);
    const from = { x: 0.5 * T, y: 0.5 * T };
    const tile = { x: 10, y: 0 };
    const res = planWalk(finder, g, from, { kind: 'reach', canWorkFrom: (x, y) => inReach(x, y, tile.x, tile.y, T, 2.35) }, opts(g));
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    const end = res.waypoints.at(-1)!;
    expect(cellAt(g, end.x, end.y)).toEqual({ x: 8, y: 0 }); // cách 2 ô
    expect(inReach(end.x, end.y, tile.x, tile.y, T, 2.5)).toBe(true);
  });

  it('Vườn: từ chỗ xuất phát tới thúng bán — chỗ đứng đi được và với tới thúng', () => {
    const g = navFromBoolGrid(blockedGrid(L), T);
    const from = { x: L.spawn.x * T, y: 20.5 * T };
    const res = planWalk(finder, g, from, { kind: 'reach', canWorkFrom: (x, y) => targetInReach(L, 'sellBox', x, y, T, 2.35) }, opts(g));
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    const end = res.waypoints.at(-1)!;
    expect(targetInReach(L, 'sellBox', end.x, end.y, T, 2.5)).toBe(true);
    expect(boxFitsGrid(g, end.x, end.y, FOOT.hw, FOOT.hh)).toBe(true);
  });

  it('Vườn: đi từ sau nhà tới ô sân trước cửa (vòng qua nhà)', () => {
    const g = navFromBoolGrid(blockedGrid(L), T);
    const from = { x: (L.house.x + 3) * T, y: (L.house.y - 2.5) * T };
    const door = houseExitSpot(L.houseDoor, T);
    const res = planWalk(finder, g, from, { kind: 'point', x: door.x, y: door.y }, opts(g));
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.waypoints.at(-1)).toEqual(door);
    expect(res.waypoints.length).toBeGreaterThanOrEqual(2);
  });
});

describe('đi theo đường', () => {
  it('đi hết các điểm rồi báo arrived đúng một lần; tốc độ không vượt speed', () => {
    const s = createClickMove<string>();
    startClickMove(s, [{ x: 100, y: 0 }, { x: 100, y: 100 }], 'viec');
    const r = walk(s, { x: 0, y: 0 }, 256);
    expect(r.frames).toBeGreaterThan(0);
    // 200 px ở 256 px/s ≈ 47 frame
    expect(r.frames).toBeLessThan(60);
    expect(Math.hypot(r.pos.x - 100, r.pos.y - 100)).toBeLessThanOrEqual(3);
    expect(s.active).toBe(false);
    expect(s.action).toBe('viec'); // việc chờ để scene đọc
    expect(stepClickMove(s, r.pos, 1 / 60, { speed: 256, arrivePx: 3, stuckSeconds: 0.5 }, { x: 0, y: 0 })).toBe('idle');
  });

  it('điểm cuối: chậm lại vừa đủ, không vượt quá', () => {
    const s = createClickMove<null>();
    startClickMove(s, [{ x: 2, y: 0 }], null);
    const v = { x: 0, y: 0 };
    // Cách 5 px, mỗi frame đi được 4,3 px → vận tốc frame này ≤ 5 px / (1/60 s)
    stepClickMove(s, { x: -3, y: 0 }, 1 / 60, { speed: 256, arrivePx: 3, stuckSeconds: 0.5 }, v);
    expect(v.x).toBeLessThanOrEqual(5 * 60 + 1e-6);
  });

  it('đứng mãi một chỗ (bị chặn) → stuck sau stuckSeconds', () => {
    const s = createClickMove<null>();
    startClickMove(s, [{ x: 500, y: 0 }], null);
    const v = { x: 0, y: 0 };
    let st = '';
    let frames = 0;
    while (st !== 'stuck' && frames < 200) {
      st = stepClickMove(s, { x: 0, y: 0 }, 1 / 60, { speed: 256, arrivePx: 3, stuckSeconds: 0.5 }, v);
      frames++;
    }
    expect(st).toBe('stuck');
    expect(frames).toBeGreaterThanOrEqual(30);
    expect(frames).toBeLessThan(35);
  });

  it('huỷ (WASD) → tắt và bỏ việc chờ', () => {
    const s = createClickMove<string>();
    startClickMove(s, [{ x: 100, y: 0 }], 'cuoc');
    expect(cancelClickMove(s)).toBe(true);
    expect(s.active).toBe(false);
    expect(s.action).toBeNull();
    expect(cancelClickMove(s)).toBe(false);
  });
});

describe('hướng mặt theo vectơ', () => {
  it('trục lớn thắng, đứng yên giữ hướng cũ', () => {
    expect(facingFromVector(0, 0, 'up')).toBe('up');
    expect(facingFromVector(10, 1, 'down')).toBe('right');
    expect(facingFromVector(-1, -10, 'left')).toBe('up');
  });
  it('gần 45° thì giữ trục đang quay (không lật mặt qua lại)', () => {
    expect(facingFromVector(10, 11, 'right')).toBe('right');
    expect(facingFromVector(11, 10, 'down')).toBe('down');
    expect(facingFromVector(-10, 11, 'right')).toBe('left'); // cùng trục, đổi chiều
    expect(facingFromVector(10, 13, 'right')).toBe('down'); // lệch hẳn sang dọc
  });
});

describe('planWalk — điểm cuối đứng được dù ô của nó bị coi là chặn', () => {
  it('đi thẳng tới đúng điểm click nếu hộp chân đứng vừa (lưới ô nhỏ sát tường)', () => {
    // Ô hàng dưới bị đánh dấu chặn, nhưng điểm (48, 70) vẫn "đứng được" theo spotFree.
    const g = gridOf(['..', '##']);
    const finder = new PathFinder();
    const spotFree = (x: number, y: number) => x >= 0 && x <= 128 && y >= 0 && y <= 72;
    const res = planWalk(finder, g, { x: 32, y: 32 }, { kind: 'point', x: 48, y: 70 }, { maxNodes: 100, spotFree, stepPx: 4, blockedSearchRadius: 3 });
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.waypoints.at(-1)).toEqual({ x: 48, y: 70 });
  });
});
