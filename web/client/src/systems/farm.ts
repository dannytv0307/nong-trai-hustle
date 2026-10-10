// Ruộng (T-002, GDD §3.3–3.4, §3.3a): trạng thái từng ô ruộng, cuốc đất nhiều nhát, kiểm tầm với.
// Thuần TS (không dùng Phaser) → unit test được, và sau này lưu save chỉ việc ghi object `FarmState` ra JSON.
// T-003 sẽ thêm gieo/tưới/hái vào đây (thêm trường cho FarmPlot, giữ nguyên cách đánh số ô).
import type { Facing } from './movement';

/** Hình chữ nhật theo ô (trùng kiểu TileRect của garden.ts, khai lại để module này đứng riêng được). */
export interface PlotRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Trạng thái đất của một ô ruộng. T-003 thêm cây (crop), đã tưới (watered)… */
export type SoilState = 'untilled' | 'tilled';

export interface FarmPlot {
  /** Toạ độ ô trên bản đồ. */
  x: number;
  y: number;
  soil: SoilState;
  /**
   * Số nhát cuốc đã bổ vào ô (D-022). Đất chưa cuốc: 0 = chưa đụng, 1…(số nhát − 1) = "cuốc dở".
   * Cuốc xong: bằng số nhát của ô (soil = 'tilled'). Hái xong / dọn cây héo → về 0 (T-003).
   * Nằm trong save và giữ qua đêm (`tillProgressKeepsOvernight`).
   */
  tillStrikes: number;
}

/**
 * Toàn bộ ruộng: các ô thuộc vùng ruộng đặt sẵn trên bản đồ. Chỉ những ô này cuốc được —
 * GDD §3.4: ruộng là "vùng đặt sẵn trên bản đồ Vườn, mở dần" (9 → 24 ô), cỏ ngoài ruộng không cuốc.
 */
export interface FarmState {
  plots: FarmPlot[];
}

/** Tạo ruộng mới: mọi ô trong `rect` là đất chưa cuốc. Thứ tự: từng hàng trên → dưới, trái → phải. */
export function createFarm(rect: PlotRect): FarmState {
  const plots: FarmPlot[] = [];
  for (let y = rect.y; y < rect.y + rect.h; y++) {
    for (let x = rect.x; x < rect.x + rect.w; x++) plots.push({ x, y, soil: 'untilled', tillStrikes: 0 });
  }
  return { plots };
}

/** Ô ruộng ở (x, y), hoặc null nếu ô đó không phải ruộng (cỏ, lối đi, nhà…). */
export function plotAt(farm: FarmState, x: number, y: number): FarmPlot | null {
  // Tối đa 24 ô (maxPlots) → duyệt thẳng là đủ nhanh, khỏi cần bảng băm.
  for (const p of farm.plots) if (p.x === x && p.y === y) return p;
  return null;
}

/** Ô này cuốc được không: phải là ô ruộng và chưa cuốc xong (kể cả ô cuốc dở — click lại là làm tiếp). */
export function canTill(farm: FarmState, x: number, y: number): boolean {
  return plotAt(farm, x, y)?.soil === 'untilled';
}

/** Ô đang "cuốc dở": đã bổ ít nhất 1 nhát nhưng chưa xong. */
export function isPartiallyTilled(plot: FarmPlot): boolean {
  return plot.soil === 'untilled' && plot.tillStrikes > 0;
}

/** Còn bao nhiêu nhát nữa thì xong ô (0 nếu không cuốc được). */
export function strikesRemaining(farm: FarmState, x: number, y: number, strikesPerPlot: number): number {
  const plot = plotAt(farm, x, y);
  if (!plot || plot.soil !== 'untilled') return 0;
  return Math.max(1, strikesPerPlot - plot.tillStrikes);
}

/** Kết quả một nhát cuốc. */
export type StrikeResult = 'invalid' | 'progress' | 'done';

/**
 * Bổ MỘT nhát cuốc vào ô (x, y) (D-022). `strikesPerPlot` = số nhát cần cho một ô (cuốc gỗ 6, sau này
 * lấy từ dữ liệu nông cụ). Trả về:
 * - 'invalid': không phải ruộng hoặc đã cuốc xong — không đổi gì;
 * - 'progress': thêm 1 nhát, ô vẫn cuốc dở;
 * - 'done': nhát cuối — ô thành đất đã cuốc.
 */
export function strikeTill(farm: FarmState, x: number, y: number, strikesPerPlot: number): StrikeResult {
  const plot = plotAt(farm, x, y);
  if (!plot || plot.soil !== 'untilled') return 'invalid';
  plot.tillStrikes++;
  // ">=" chứ không "===": nếu số nhát/ô bị chỉnh nhỏ đi (đổi sang cuốc sắt) mà ô đang dở nhiều hơn → xong luôn.
  if (plot.tillStrikes >= strikesPerPlot) {
    plot.tillStrikes = strikesPerPlot;
    plot.soil = 'tilled';
    return 'done';
  }
  return 'progress';
}

/**
 * Nấc hình của đất (0 … `stages`) theo số nhát đã cuốc — chia đều số nhát cho số nấc.
 * 6 nhát / 3 nấc: 0–1 nhát → 0 "cỏ khô", 2–3 → 1 "vỡ cỏ", 4–5 → 2 "lổn nhổn", 6 → 3 "đất tơi" (= đã cuốc).
 */
export function tillStage(strikes: number, strikesPerPlot: number, stages: number): number {
  if (strikesPerPlot <= 0 || stages <= 0) return 0;
  if (strikes >= strikesPerPlot) return stages;
  return Math.max(0, Math.floor((strikes * stages) / strikesPerPlot));
}

/** Số ô đã cuốc (cho QA / tổng kết). */
export function tilledCount(farm: FarmState): number {
  let n = 0;
  for (const p of farm.plots) if (p.soil === 'tilled') n++;
  return n;
}

/**
 * Ô (tx, ty) có nằm trong tầm với không (GDD §3.3): khoảng cách từ TÂM nhân vật (px — giữa hộp chân,
 * chỗ nhân vật đứng trên mặt đất) tới TÂM ô ≤ `rangeTiles` ô.
 * Với 2.5 ô: đứng giữa ô thì với được các ô trong vòng 2 ô, trừ 4 góc chéo (2,2) (2.83 ô).
 */
export function inReach(centerX: number, centerY: number, tx: number, ty: number, tileSize: number, rangeTiles: number): boolean {
  const dx = (tx + 0.5) * tileSize - centerX;
  const dy = (ty + 0.5) * tileSize - centerY;
  const r = rangeTiles * tileSize;
  return dx * dx + dy * dy <= r * r;
}

/**
 * Hướng nhân vật nên quay mặt để làm việc trên ô (tx, ty) (GDD §3.3 "quay mặt về phía ô được click").
 * Lệch ngang nhiều hơn → trái/phải, ngược lại → lên/xuống. Ô ngay dưới chân (lệch ~0) → giữ hướng cũ.
 */
export function facingToward(centerX: number, centerY: number, tx: number, ty: number, tileSize: number, previous: Facing): Facing {
  const dx = (tx + 0.5) * tileSize - centerX;
  const dy = (ty + 0.5) * tileSize - centerY;
  const dead = tileSize * 0.25; // lệch dưới 1/4 ô coi như "ngay chỗ đứng"
  if (Math.abs(dx) < dead && Math.abs(dy) < dead) return previous;
  if (Math.abs(dx) > Math.abs(dy)) return dx < 0 ? 'left' : 'right';
  return dy < 0 ? 'up' : 'down';
}
