// T-096 (D-038): "click đâu đi đó, tới nơi thì làm luôn" — lập đường + đi theo đường. Thuần TS → test được.
//
// Scene làm 3 việc:
//   1. Lúc click: gọi `planWalk` (đi tới một ĐIỂM, hoặc tới CHỖ ĐỨNG gần nhất làm được việc) → dãy điểm (px thế giới).
//      Không có đường → scene hiện bong bóng, không đi.
//   2. `startClickMove(state, đường, việc chờ)`; mỗi frame `stepClickMove` → vận tốc cho hộp chân. Hết đường → 'arrived',
//      kẹt (bị vật lý chặn quá lâu) → 'stuck' (scene lập lại đường hoặc thôi).
//   3. Bấm WASD / mở cửa sổ / chuyển khu → `cancelClickMove`.
// Việc chờ (`action`) là kiểu tuỳ scene (ô ruộng, thùng bán, cửa nhà…) — ở đây chỉ giữ hộ.
import {
  cellAt,
  cellCenter,
  isFreeCell,
  nearestFreeCell,
  segmentClear,
  smoothPath,
  type NavGrid,
  type PathFinder,
  type Point,
} from './pathfind';

/** Đích đi bộ: tới một điểm (ô trống / ô không có việc), hoặc tới chỗ đứng gần nhất mà `canWorkFrom` đúng (có việc). */
export type WalkGoal =
  | { kind: 'point'; x: number; y: number }
  | { kind: 'reach'; canWorkFrom: (px: number, py: number) => boolean };

export interface PlanOptions {
  /** Mở tối đa bấy nhiêu nút khi tìm đường (`pathMaxNodes`). */
  maxNodes: number;
  /** Hộp chân đặt giữa (x, y) có trống không (dùng để làm mượt + kiểm điểm cuối). */
  spotFree: (x: number, y: number) => boolean;
  /** Bước lấy mẫu khi kiểm một đoạn thẳng (px). */
  stepPx: number;
  /** Ô đích bị chặn → tìm ô trống gần nhất trong bấy nhiêu ô. */
  blockedSearchRadius: number;
}

export type PlanResult =
  /** `waypoints` = các điểm phải đi qua (không gồm chỗ đang đứng); rỗng + `already` = đã ở đúng chỗ, làm luôn. */
  | { ok: true; waypoints: Point[]; already: boolean; expanded: number }
  | { ok: false; reason: 'noPath'; expanded: number };

/** Ô xuất phát: ô đang đứng; ô đó bị coi là chặn (đứng sát vật) → ô trống sát bên. */
export function startCell(nav: NavGrid, from: Point): { x: number; y: number } | null {
  const c = cellAt(nav, from.x, from.y);
  if (isFreeCell(nav, c.x, c.y)) return c;
  return nearestFreeCell(nav, c, 2, from);
}

/** Lập đường từ `from` (giữa hộp chân, px) tới `goal`. */
export function planWalk(finder: PathFinder, nav: NavGrid, from: Point, goal: WalkGoal, opt: PlanOptions): PlanResult {
  const start = startCell(nav, from);
  if (!start) return { ok: false, reason: 'noPath', expanded: 0 };

  if (goal.kind === 'reach') {
    if (goal.canWorkFrom(from.x, from.y)) return { ok: true, waypoints: [], already: true, expanded: 0 };
    // Dijkstra (heuristic 0): ô đầu tiên lấy ra mà đứng ở tâm làm được việc = chỗ đứng GẦN NHẤT theo đường đi thật.
    const res = finder.search(
      nav,
      start,
      (x, y) => {
        const c = cellCenter(nav, x, y);
        return goal.canWorkFrom(c.x, c.y) && opt.spotFree(c.x, c.y);
      },
      () => 0,
      opt.maxNodes,
    );
    if (!res) return { ok: false, reason: 'noPath', expanded: opt.maxNodes };
    const pts = [from, ...res.cells.slice(1).map((c) => cellCenter(nav, c.x, c.y))];
    if (res.cells.length === 1) pts.push(cellCenter(nav, start.x, start.y));
    return { ok: true, waypoints: smoothPath(pts, opt.stepPx, opt.spotFree), already: false, expanded: res.expanded };
  }

  const clicked = cellAt(nav, goal.x, goal.y);
  const target = nearestFreeCell(nav, clicked, opt.blockedSearchRadius, from);
  if (!target) return { ok: false, reason: 'noPath', expanded: 0 };
  const res = finder.findPath(nav, start, target, opt.maxNodes);
  if (!res) return { ok: false, reason: 'noPath', expanded: opt.maxNodes };
  // Điểm cuối: đúng chỗ click nếu hộp chân đứng vừa ở đó (và từ ô đích đi thẳng tới được — lưới ô nhỏ trong nhà có thể coi
  // ô sát tường là "chặn" dù điểm click vẫn đứng được); không thì tâm ô trống gần nhất.
  const targetCenter = cellCenter(nav, target.x, target.y);
  const sameCell = target.x === clicked.x && target.y === clicked.y;
  const exact =
    opt.spotFree(goal.x, goal.y) && (sameCell || segmentClear(targetCenter.x, targetCenter.y, goal.x, goal.y, opt.stepPx, opt.spotFree));
  const end = exact ? { x: goal.x, y: goal.y } : targetCenter;
  const mid = res.cells.slice(1, sameCell || !exact ? -1 : undefined).map((c) => cellCenter(nav, c.x, c.y));
  const pts = [from, ...mid, end];
  if (Math.hypot(end.x - from.x, end.y - from.y) < 1) return { ok: true, waypoints: [], already: true, expanded: res.expanded };
  return { ok: true, waypoints: smoothPath(pts, opt.stepPx, opt.spotFree), already: false, expanded: res.expanded };
}

export interface FarmStandPrefs {
  /** Ô (x, y) có phải ô ruộng không (đứng trên luống khác bị phạt). */
  isPlot: (x: number, y: number) => boolean;
  diagonalPenalty: number;
  onPlotPenalty: number;
  notSouthPenalty: number;
  /** Đứng ô kề chéo: xích về phía ô ruộng bấy nhiêu ô mỗi trục (để còn trong `farmWorkRange`). */
  diagonalInset: number;
}

/** Chi phí một dãy ô (thẳng 1, chéo √2). */
function cellsCost(cells: readonly { x: number; y: number }[]): number {
  let c = 0;
  for (let i = 1; i < cells.length; i++) c += cells[i].x !== cells[i - 1].x && cells[i].y !== cells[i - 1].y ? Math.SQRT2 : 1;
  return c;
}

/**
 * T-096b: chọn chỗ đứng SÁT ô ruộng `tile` (một trong 8 ô kề — ô chéo thì đứng xích vào góc chung; không phải chính ô đó) và lập đường tới đó. Chi phí = đường đi
 * + phạt (ô chéo, giẫm luống khác, không ở phía nam) — gần nhất mà tự nhiên nhất. Lưới phải là lưới ô cỡ ô ruộng (Vườn / Xóm).
 * Trả về `noPath` nếu không tới được ô kề nào.
 */
export function planFarmStand(
  finder: PathFinder,
  nav: NavGrid,
  from: Point,
  tile: { x: number; y: number },
  opt: PlanOptions,
  prefs: FarmStandPrefs,
): PlanResult & { stand?: { x: number; y: number }; spot?: Point } {
  const start = startCell(nav, from);
  if (!start) return { ok: false, reason: 'noPath', expanded: 0 };
  let best: { cells: { x: number; y: number }[]; cost: number; stand: { x: number; y: number }; spot: Point } | null = null;
  let expanded = 0;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const n = { x: tile.x + dx, y: tile.y + dy };
      if (!isFreeCell(nav, n.x, n.y)) continue;
      // Chỗ đứng: tâm ô kề thẳng; ô kề CHÉO thì xích về phía ô ruộng `diagonalInset` ô mỗi trục (tâm ô chéo cách 1,41 ô — quá xa).
      const c = cellCenter(nav, n.x, n.y);
      const diag = dx !== 0 && dy !== 0;
      const spot = diag ? { x: c.x - dx * prefs.diagonalInset * nav.cell, y: c.y - dy * prefs.diagonalInset * nav.cell } : c;
      if (!opt.spotFree(spot.x, spot.y)) continue;
      const res = finder.findPath(nav, start, n, opt.maxNodes);
      if (!res) continue;
      expanded += res.expanded;
      const penalty = (diag ? prefs.diagonalPenalty : 0) + (prefs.isPlot(n.x, n.y) ? prefs.onPlotPenalty : 0) + (dy === 1 ? 0 : prefs.notSouthPenalty);
      const cost = cellsCost(res.cells) + penalty;
      if (!best || cost < best.cost - 1e-9) best = { cells: res.cells, cost, stand: n, spot };
    }
  }
  if (!best) return { ok: false, reason: 'noPath', expanded };
  const end = best.spot;
  if (Math.hypot(end.x - from.x, end.y - from.y) < 1) return { ok: true, waypoints: [], already: true, expanded, stand: best.stand, spot: end };
  const pts = [from, ...best.cells.slice(1).map((c) => cellCenter(nav, c.x, c.y)), end];
  // Ô kề thẳng: điểm cuối = tâm ô cuối → bỏ trùng.
  if (pts.length >= 2 && pts[pts.length - 2].x === end.x && pts[pts.length - 2].y === end.y) pts.splice(pts.length - 2, 1);
  return { ok: true, waypoints: smoothPath(pts, opt.stepPx, opt.spotFree), already: false, expanded, stand: best.stand, spot: end };
}

/** Trạng thái đang đi theo đường. `A` = kiểu việc chờ làm khi tới nơi (scene định nghĩa). */
export interface ClickMoveState<A> {
  active: boolean;
  waypoints: Point[];
  /** Điểm đang hướng tới. */
  index: number;
  action: A | null;
  /** Khoảng cách gần nhất tới điểm đang hướng tới + thời gian không gần thêm (phát hiện kẹt). */
  bestDist: number;
  stuckT: number;
}

export function createClickMove<A>(): ClickMoveState<A> {
  return { active: false, waypoints: [], index: 0, action: null, bestDist: Number.POSITIVE_INFINITY, stuckT: 0 };
}

export function startClickMove<A>(s: ClickMoveState<A>, waypoints: Point[], action: A | null): void {
  s.active = true;
  s.waypoints = waypoints;
  s.index = 0;
  s.action = action;
  s.bestDist = Number.POSITIVE_INFINITY;
  s.stuckT = 0;
}

/** Thôi đi (WASD, cửa sổ, chuyển khu…). Việc chờ cũng bỏ. Trả về true nếu đang đi. */
export function cancelClickMove<A>(s: ClickMoveState<A>): boolean {
  const was = s.active;
  s.active = false;
  s.waypoints = [];
  s.index = 0;
  s.action = null;
  return was;
}

export interface ClickMoveParams {
  /** Tốc độ tối đa (px/giây) — đã nhân hệ số đuối. */
  speed: number;
  /** Cách điểm cuối ≤ bấy nhiêu px là tới (`clickMoveArrivePx`). */
  arrivePx: number;
  /** Bao lâu không lại gần điểm đang hướng tới thì coi là kẹt (`clickMoveStuckSeconds`). */
  stuckSeconds: number;
}

export type ClickMoveStep = 'idle' | 'moving' | 'arrived' | 'stuck';

/**
 * Một frame đi theo đường: ghi vận tốc (px/giây) vào `out`. Điểm giữa: tới được trong frame này thì coi như qua, nhắm
 * điểm kế (không giật lại). Điểm cuối: chạy chậm lại vừa đủ để không vượt quá.
 * 'arrived' (out = 0) đúng một lần khi tới điểm cuối — state tự tắt, việc chờ còn trong `s.action` cho scene đọc.
 */
export function stepClickMove<A>(s: ClickMoveState<A>, pos: Point, dt: number, p: ClickMoveParams, out: { x: number; y: number }): ClickMoveStep {
  out.x = 0;
  out.y = 0;
  if (!s.active) return 'idle';
  const reachThisFrame = Math.max(p.arrivePx, p.speed * Math.max(dt, 0));
  while (s.index < s.waypoints.length) {
    const wp = s.waypoints[s.index];
    const d = Math.hypot(wp.x - pos.x, wp.y - pos.y);
    const last = s.index === s.waypoints.length - 1;
    if (d <= (last ? p.arrivePx : reachThisFrame)) {
      s.index++;
      s.bestDist = Number.POSITIVE_INFINITY;
      s.stuckT = 0;
      continue;
    }
    // Kẹt: không lại gần thêm ít nhất 1 px trong `stuckSeconds`.
    if (d < s.bestDist - 1) {
      s.bestDist = d;
      s.stuckT = 0;
    } else {
      s.stuckT += Math.max(dt, 0);
      if (s.stuckT >= p.stuckSeconds) return 'stuck';
    }
    const v = last && dt > 0 ? Math.min(p.speed, d / dt) : p.speed;
    out.x = ((wp.x - pos.x) / d) * v;
    out.y = ((wp.y - pos.y) / d) * v;
    return 'moving';
  }
  s.active = false;
  s.waypoints = [];
  s.index = 0;
  return 'arrived';
}
