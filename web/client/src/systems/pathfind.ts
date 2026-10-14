// T-096 (D-038): tìm đường trên lưới ô cho "click đâu đi đó". Thuần TS → test được, không phụ thuộc Phaser.
//
// - Lưới điều hướng (NavGrid): mỗi ô "đi được" hay "chặn". Vườn dùng thẳng lưới vật cản sẵn có (blockedGrid, ô 64 px);
//   trong nhà dựng lưới ô 32 px từ sàn + chân đế đồ đạc (house.ts). Bản đồ Xóm 60×42 (T-032) dùng y như Vườn.
// - A* 8 hướng, KHÔNG cắt góc vật cản: đi chéo chỉ khi cả hai ô kề thẳng đều trống (không lách qua khe giữa hai góc nhà).
// - Làm mượt ("kéo dây"): bỏ các điểm giữa nếu đi thẳng từ điểm trước tới điểm sau mà hộp chân không chạm vật cản
//   → nhân vật đi chéo tự nhiên thay vì đi răng cưa theo ô.
// - Bộ nhớ dùng lại giữa các lần tìm (PathFinder) — tìm đường chỉ chạy lúc click, nhưng vẫn không tạo mảng to mỗi lần.

export interface Cell {
  x: number;
  y: number;
}

export interface Point {
  x: number;
  y: number;
}

/** Lưới điều hướng: `blocked[y * cols + x]` = 1 là ô chặn. `cell` = cỡ ô (px), `originX/Y` = góc trên-trái lưới (px thế giới). */
export interface NavGrid {
  cols: number;
  rows: number;
  cell: number;
  originX: number;
  originY: number;
  blocked: Uint8Array;
}

export function createNavGrid(cols: number, rows: number, cell: number, originX = 0, originY = 0): NavGrid {
  return { cols, rows, cell, originX, originY, blocked: new Uint8Array(cols * rows) };
}

/** Lưới từ mảng boolean [y][x] (true = chặn) — vd `blockedGrid(layout)` của Vườn. */
export function navFromBoolGrid(grid: readonly (readonly boolean[])[], cell: number, originX = 0, originY = 0): NavGrid {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  const g = createNavGrid(cols, rows, cell, originX, originY);
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) g.blocked[y * cols + x] = grid[y][x] ? 1 : 0;
  return g;
}

export function inGrid(g: NavGrid, x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < g.cols && y < g.rows;
}

/** Ô (x, y) đi được không (ngoài lưới = chặn). */
export function isFreeCell(g: NavGrid, x: number, y: number): boolean {
  return inGrid(g, x, y) && g.blocked[y * g.cols + x] === 0;
}

/** Ô chứa điểm px thế giới (có thể nằm ngoài lưới). */
export function cellAt(g: NavGrid, px: number, py: number): Cell {
  return { x: Math.floor((px - g.originX) / g.cell), y: Math.floor((py - g.originY) / g.cell) };
}

/** Tâm ô (px thế giới). */
export function cellCenter(g: NavGrid, x: number, y: number): Point {
  return { x: g.originX + (x + 0.5) * g.cell, y: g.originY + (y + 0.5) * g.cell };
}

/**
 * Ô đi được gần `target` nhất (khoảng cách thẳng giữa hai tâm ô), tìm trong bán kính `maxRadius` ô. Bằng nhau thì ưu tiên ô
 * gần `prefer` hơn (vd click vào tường nhà từ phía nam → đứng phía nam, không vòng ra sau). null nếu quanh đó toàn ô chặn.
 */
export function nearestFreeCell(g: NavGrid, target: Cell, maxRadius: number, prefer?: Point): Cell | null {
  if (isFreeCell(g, target.x, target.y)) return { x: target.x, y: target.y };
  let best: Cell | null = null;
  let bestD = Number.POSITIVE_INFINITY;
  let bestP = Number.POSITIVE_INFINITY;
  for (let r = 1; r <= maxRadius; r++) {
    // Ô ở vòng r có khoảng cách ≥ r; đã có ô cách < r thì vòng ngoài không thể tốt hơn.
    if (best && bestD < r - 1e-9) break;
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        const x = target.x + dx;
        const y = target.y + dy;
        if (!isFreeCell(g, x, y)) continue;
        const d = Math.hypot(dx, dy);
        const c = cellCenter(g, x, y);
        const p = prefer ? Math.hypot(c.x - prefer.x, c.y - prefer.y) : 0;
        if (d < bestD - 1e-9 || (Math.abs(d - bestD) <= 1e-9 && p < bestP)) {
          best = { x, y };
          bestD = d;
          bestP = p;
        }
      }
    }
  }
  return best;
}

const SQRT2 = Math.SQRT2;
// 8 hướng: 4 thẳng trước, 4 chéo sau.
const DX = [1, -1, 0, 0, 1, 1, -1, -1];
const DY = [0, 0, 1, -1, 1, -1, 1, -1];

/** Khoảng cách "octile" (đi 8 hướng, chéo = √2) — heuristic không bao giờ ước quá đường thật. */
export function octile(ax: number, ay: number, bx: number, by: number): number {
  const dx = Math.abs(ax - bx);
  const dy = Math.abs(ay - by);
  return Math.max(dx, dy) + (SQRT2 - 1) * Math.min(dx, dy);
}

/** Kết quả một lần tìm: dãy ô từ ô xuất phát tới ô đích (kể cả hai đầu), số nút đã mở (để đo hiệu năng). */
export interface PathResult {
  cells: Cell[];
  expanded: number;
}

/**
 * Bộ tìm đường A* dùng lại bộ nhớ. Một PathFinder dùng cho nhiều lưới được (tự nới mảng khi lưới to hơn).
 * Dùng "số thế hệ" để khỏi xoá mảng mỗi lần tìm.
 */
export class PathFinder {
  private g = new Float64Array(0);
  private f = new Float64Array(0);
  private parent = new Int32Array(0);
  private gen = new Uint32Array(0);
  private closed = new Uint32Array(0);
  private heap = new Int32Array(0);
  private heapSize = 0;
  private stamp = 0;

  private ensure(n: number): void {
    if (this.g.length >= n) return;
    this.g = new Float64Array(n);
    this.f = new Float64Array(n);
    this.parent = new Int32Array(n);
    this.gen = new Uint32Array(n);
    this.closed = new Uint32Array(n);
    this.heap = new Int32Array(n * 8 + 8);
    this.stamp = 0;
  }

  /**
   * Tìm đường từ ô `start` tới ô đầu tiên thoả `isGoal` (A*; `heuristic` = 0 thì thành Dijkstra — tìm ô đích gần nhất theo
   * đường đi thật). Mở quá `maxNodes` nút thì bỏ (null). Ô xuất phát chặn → null (người gọi tự chọn ô trống gần đó).
   */
  search(
    grid: NavGrid,
    start: Cell,
    isGoal: (x: number, y: number) => boolean,
    heuristic: (x: number, y: number) => number,
    maxNodes: number,
  ): PathResult | null {
    if (!isFreeCell(grid, start.x, start.y)) return null;
    const cols = grid.cols;
    this.ensure(cols * grid.rows);
    this.stamp++;
    if (this.stamp === 0xffffffff) {
      this.gen.fill(0);
      this.closed.fill(0);
      this.stamp = 1;
    }
    const s = this.stamp;
    const startIdx = start.y * cols + start.x;
    this.heapSize = 0;
    this.gen[startIdx] = s;
    this.g[startIdx] = 0;
    this.parent[startIdx] = -1;
    this.f[startIdx] = heuristic(start.x, start.y);
    this.push(startIdx);
    let expanded = 0;
    while (this.heapSize > 0) {
      const cur = this.pop();
      if (this.closed[cur] === s) continue; // bản cũ còn trong heap (đã có đường ngắn hơn)
      this.closed[cur] = s;
      const cx = cur % cols;
      const cy = (cur - cx) / cols;
      if (isGoal(cx, cy)) return { cells: this.trace(cur, cols), expanded };
      if (++expanded > maxNodes) return null;
      for (let k = 0; k < 8; k++) {
        const nx = cx + DX[k];
        const ny = cy + DY[k];
        if (!isFreeCell(grid, nx, ny)) continue;
        // Không cắt góc: đi chéo cần cả hai ô kề thẳng trống.
        if (k >= 4 && (!isFreeCell(grid, nx, cy) || !isFreeCell(grid, cx, ny))) continue;
        const ni = ny * cols + nx;
        if (this.closed[ni] === s) continue;
        const ng = this.g[cur] + (k >= 4 ? SQRT2 : 1);
        if (this.gen[ni] === s && ng >= this.g[ni]) continue;
        this.gen[ni] = s;
        this.g[ni] = ng;
        this.parent[ni] = cur;
        this.f[ni] = ng + heuristic(nx, ny);
        this.push(ni);
      }
    }
    return null;
  }

  /** Đường từ ô `start` tới đúng ô `goal` (A* + heuristic octile). */
  findPath(grid: NavGrid, start: Cell, goal: Cell, maxNodes: number): PathResult | null {
    if (!isFreeCell(grid, goal.x, goal.y)) return null;
    return this.search(
      grid,
      start,
      (x, y) => x === goal.x && y === goal.y,
      (x, y) => octile(x, y, goal.x, goal.y),
      maxNodes,
    );
  }

  private trace(idx: number, cols: number): Cell[] {
    const out: Cell[] = [];
    for (let i = idx; i >= 0; i = this.parent[i]) out.push({ x: i % cols, y: Math.floor(i / cols) });
    return out.reverse();
  }

  // Heap nhị phân theo f (nhỏ nhất ở đỉnh). Cho phép một nút nằm trong heap nhiều lần (bản cũ bị bỏ khi lấy ra).
  private push(i: number): void {
    if (this.heapSize >= this.heap.length) {
      const bigger = new Int32Array(this.heap.length * 2);
      bigger.set(this.heap);
      this.heap = bigger;
    }
    const h = this.heap;
    const f = this.f;
    let n = this.heapSize++;
    h[n] = i;
    while (n > 0) {
      const p = (n - 1) >> 1;
      if (f[h[p]] <= f[h[n]]) break;
      const t = h[p];
      h[p] = h[n];
      h[n] = t;
      n = p;
    }
  }

  private pop(): number {
    const h = this.heap;
    const f = this.f;
    const top = h[0];
    const last = h[--this.heapSize];
    if (this.heapSize > 0) {
      h[0] = last;
      let n = 0;
      for (;;) {
        const l = n * 2 + 1;
        const r = l + 1;
        let m = n;
        if (l < this.heapSize && f[h[l]] < f[h[m]]) m = l;
        if (r < this.heapSize && f[h[r]] < f[h[m]]) m = r;
        if (m === n) break;
        const t = h[m];
        h[m] = h[n];
        h[n] = t;
        n = m;
      }
    }
    return top;
  }
}

/**
 * Đoạn thẳng a → b có đi được không: lấy mẫu mỗi `stepPx` px, tại mỗi mẫu hỏi `spotFree(x, y)` (hộp chân đặt giữa điểm đó
 * có chạm vật cản không). Dùng để làm mượt đường.
 */
export function segmentClear(ax: number, ay: number, bx: number, by: number, stepPx: number, spotFree: (x: number, y: number) => boolean): boolean {
  const len = Math.hypot(bx - ax, by - ay);
  const n = Math.max(1, Math.ceil(len / Math.max(1, stepPx)));
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    if (!spotFree(ax + (bx - ax) * t, ay + (by - ay) * t)) return false;
  }
  return true;
}

/**
 * "Kéo dây": từ mỗi điểm neo, nhảy thẳng tới điểm XA NHẤT còn đi thẳng được (segmentClear), bỏ các điểm giữa.
 * Điểm đầu (chỗ đang đứng) không nằm trong kết quả; điểm cuối luôn giữ.
 */
export function smoothPath(points: readonly Point[], stepPx: number, spotFree: (x: number, y: number) => boolean): Point[] {
  if (points.length <= 1) return points.slice(1);
  const out: Point[] = [];
  let anchor = 0;
  while (anchor < points.length - 1) {
    let next = anchor + 1;
    for (let j = points.length - 1; j > anchor + 1; j--) {
      if (segmentClear(points[anchor].x, points[anchor].y, points[j].x, points[j].y, stepPx, spotFree)) {
        next = j;
        break;
      }
    }
    out.push({ x: points[next].x, y: points[next].y });
    anchor = next;
  }
  return out;
}

/** Hộp chân (nửa rộng / nửa cao, px) đặt giữa (x, y) nằm trọn trong các ô trống của lưới không. */
export function boxFitsGrid(g: NavGrid, x: number, y: number, halfW: number, halfH: number): boolean {
  const x0 = Math.floor((x - halfW - g.originX) / g.cell);
  const x1 = Math.floor((x + halfW - 0.001 - g.originX) / g.cell);
  const y0 = Math.floor((y - halfH - g.originY) / g.cell);
  const y1 = Math.floor((y + halfH - 0.001 - g.originY) / g.cell);
  for (let cy = y0; cy <= y1; cy++) for (let cx = x0; cx <= x1; cx++) if (!isFreeCell(g, cx, cy)) return false;
  return true;
}
