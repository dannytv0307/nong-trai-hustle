// Ruộng (T-002, GDD §3.3–3.4, §3.3a): trạng thái từng ô ruộng, cuốc đất nhiều nhát, kiểm tầm với.
// T-003: gieo, tưới, hái, dọn cây héo, việc nào khi click (jobFor) và "qua đêm" (advanceDay — T-007 dùng lại).
// Thuần TS (không dùng Phaser) → unit test được, và sau này lưu save chỉ việc ghi object `FarmState` ra JSON.
import type { Facing } from './movement';

/** Hình chữ nhật theo ô (trùng kiểu TileRect của garden.ts, khai lại để module này đứng riêng được). */
export interface PlotRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Trạng thái đất của một ô ruộng. */
export type SoilState = 'untilled' | 'tilled';

/** Cây đang trồng trên một ô (T-003, GDD §3.4). */
export interface PlotCrop {
  /** Mã cây trong crops.json. */
  cropId: string;
  /** Số ngày đã lớn (chỉ tăng qua đêm nếu hôm đó được tưới). Đủ `growDays` = chín. */
  age: number;
  /** Số đêm liền không được tưới (khát). Đủ `unwateredDaysToWither` → héo. Được tưới qua đêm → về 0. */
  dryDays: number;
  /** Đã héo (mất cây, click để dọn). */
  withered: boolean;
}

/** Việc nhân vật tự chọn khi click một ô ruộng (GDD §3.3 bảng "Click vào"). */
export type TileJob = 'till' | 'plant' | 'water' | 'harvest' | 'clear';

/** Hình của cây theo giai đoạn (để vẽ). */
export type CropStage = 'seed' | 'growing' | 'ripe' | 'withered';

/** Hỏi "cây này cần mấy ngày để chín" — truyền vào để farm.ts không phụ thuộc file dữ liệu. */
export type GrowDaysOf = (cropId: string) => number;

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
  /** Cây đang trồng (null = ô trống). */
  crop: PlotCrop | null;
  /** Đã tưới HÔM NAY (ô sẫm màu). Qua đêm mọi ô bỏ trạng thái này. */
  watered: boolean;
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
    for (let x = rect.x; x < rect.x + rect.w; x++) plots.push({ x, y, soil: 'untilled', tillStrikes: 0, crop: null, watered: false });
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

// ---------------------------------------------------------------- cây trồng (T-003)

/** Cây đã chín chưa (đủ ngày, chưa héo). */
export function isRipe(crop: PlotCrop, growDaysOf: GrowDaysOf): boolean {
  return !crop.withered && crop.age >= growDaysOf(crop.cropId);
}

/** Giai đoạn hình của cây: hạt (0 ngày), đang lớn (mầm), chín, héo. */
export function cropStage(crop: PlotCrop, growDaysOf: GrowDaysOf): CropStage {
  if (crop.withered) return 'withered';
  if (isRipe(crop, growDaysOf)) return 'ripe';
  return crop.age <= 0 ? 'seed' : 'growing';
}

/**
 * Click ô (x, y) thì nhân vật làm việc gì (GDD §3.3):
 * chưa cuốc / cuốc dở → cuốc; đã cuốc + trống → gieo; cây héo → dọn; cây chín → hái;
 * đang lớn mà chưa tưới hôm nay → tưới; đã tưới rồi (hoặc không phải ruộng) → null (không làm gì).
 */
export function jobFor(farm: FarmState, x: number, y: number, growDaysOf: GrowDaysOf): TileJob | null {
  const plot = plotAt(farm, x, y);
  if (!plot) return null;
  if (plot.soil === 'untilled') return 'till';
  const crop = plot.crop;
  if (!crop) return 'plant';
  if (crop.withered) return 'clear';
  if (isRipe(crop, growDaysOf)) return 'harvest';
  return plot.watered ? null : 'water';
}

/** Gieo hạt cây `cropId` vào ô đã cuốc, đang trống. Ô cuốc dở không gieo được (D-022). Trả về true nếu gieo được. */
export function plantSeed(farm: FarmState, x: number, y: number, cropId: string): boolean {
  const plot = plotAt(farm, x, y);
  if (!plot || plot.soil !== 'tilled' || plot.crop) return false;
  plot.crop = { cropId, age: 0, dryDays: 0, withered: false };
  return true;
}

/** Tưới ô có cây (chưa héo, chưa tưới hôm nay). Trả về true nếu tưới được. */
export function waterPlot(farm: FarmState, x: number, y: number): boolean {
  const plot = plotAt(farm, x, y);
  if (!plot || !plot.crop || plot.crop.withered || plot.watered) return false;
  plot.watered = true;
  return true;
}

/** Đưa ô về đất chưa cuốc (hái xong khi `harvestResetsSoil`, hoặc dọn cây héo): tillStrikes = 0. */
function resetSoil(plot: FarmPlot): void {
  plot.soil = 'untilled';
  plot.tillStrikes = 0;
}

/**
 * Hái cây chín ở ô (x, y). Trả về mã cây đã hái (để bỏ vào gùi), null nếu chưa chín / không có cây.
 * `resetsSoil` (`harvestResetsSoil`): hái xong ô về đất chưa cuốc, phải cuốc lại 6 nhát.
 * Người gọi kiểm gùi còn chỗ TRƯỚC khi hái (gùi đầy → không hái).
 */
export function harvestPlot(farm: FarmState, x: number, y: number, growDaysOf: GrowDaysOf, resetsSoil: boolean): string | null {
  const plot = plotAt(farm, x, y);
  if (!plot || !plot.crop || !isRipe(plot.crop, growDaysOf)) return null;
  const cropId = plot.crop.cropId;
  plot.crop = null;
  plot.watered = false;
  if (resetsSoil) resetSoil(plot);
  return cropId;
}

/** Dọn cây héo: ô về đất chưa cuốc (`tillStrikes` = 0, T-003 ghi chú D-022). Trả về true nếu dọn được. */
export function clearWithered(farm: FarmState, x: number, y: number): boolean {
  const plot = plotAt(farm, x, y);
  if (!plot || !plot.crop || !plot.crop.withered) return false;
  plot.crop = null;
  plot.watered = false;
  resetSoil(plot);
  return true;
}

export interface OvernightOptions {
  growDaysOf: GrowDaysOf;
  /** Khát bấy nhiêu đêm liền thì héo (`unwateredDaysToWither`). */
  unwateredDaysToWither: number;
  /** Ô cuốc dở giữ số nhát qua đêm (`tillProgressKeepsOvernight`). */
  tillProgressKeepsOvernight: boolean;
}

/** Tóm tắt một đêm — cho màn tổng kết ngày (T-007) và QA. */
export interface OvernightReport {
  /** Số cây lớn thêm 1 ngày (vì được tưới). */
  grew: number;
  /** Số cây vừa chín sáng nay. */
  ripened: number;
  /** Số cây bị khát (không tưới) mà chưa héo. */
  thirsty: number;
  /** Số cây vừa héo đêm nay. */
  withered: number;
}

/**
 * "Qua đêm" (GDD §3.4, T-007; phím thử G ở T-003 gọi chung hàm này):
 * - ô có cây đang lớn mà được tưới → +1 ngày, hết khát;
 * - không được tưới → +1 đêm khát; khát đủ `unwateredDaysToWither` đêm liền → héo;
 * - cây chín để đó không hỏng (không khát, không héo); cây héo giữ nguyên chờ dọn;
 * - mọi ô bỏ trạng thái "đã tưới";
 * - ô cuốc dở giữ số nhát nếu `tillProgressKeepsOvernight` (mặc định), không thì về 0; ô đã cuốc chưa gieo giữ nguyên.
 */
export function advanceDay(farm: FarmState, opts: OvernightOptions): OvernightReport {
  const report: OvernightReport = { grew: 0, ripened: 0, thirsty: 0, withered: 0 };
  for (const plot of farm.plots) {
    const crop = plot.crop;
    if (crop && !crop.withered && !isRipe(crop, opts.growDaysOf)) {
      if (plot.watered) {
        crop.age++;
        crop.dryDays = 0;
        report.grew++;
        if (isRipe(crop, opts.growDaysOf)) report.ripened++;
      } else {
        crop.dryDays++;
        if (crop.dryDays >= opts.unwateredDaysToWither) {
          crop.withered = true;
          report.withered++;
        } else {
          report.thirsty++;
        }
      }
    }
    if (!opts.tillProgressKeepsOvernight && plot.soil === 'untilled') plot.tillStrikes = 0;
    plot.watered = false;
  }
  return report;
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
