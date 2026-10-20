// Màn tổng kết ngày (T-007, GDD §7, §8 "từng dòng trượt vào, số đếm lên"). Thuần TS → unit test được:
// - `summaryLines`: từ số liệu một đêm ra các dòng chữ (thứ tự cố định, dòng nào không có thì bỏ);
// - "hiện dần": dòng i bắt đầu trượt vào sau i × lineInterval giây, trượt trong lineSlide giây; số tiền đếm từ 0 lên
//   trong countSeconds giây kể từ lúc dòng tiền xuất hiện;
// - Enter / click "Ngày mới": lần 1 khi các dòng còn đang trượt → hiện hết ngay; lần 2 (hoặc khi đã hiện hết) → sang ngày.
import { dayLabel } from './time';
import type { OvernightSummary } from './overnight';

export type SummaryLineKind = 'money' | 'ripe' | 'unwatered' | 'withered' | 'passout' | 'season';

export interface SummaryLine {
  kind: SummaryLineKind;
  /** Chữ đầy đủ (dòng tiền: chữ lúc đã đếm xong). */
  text: string;
  /** Dòng cảnh báo (tô màu khác). */
  warn: boolean;
}

/** Tên món để ghi dòng chi tiết "Rau cải ×3" — truyền vào để module không phụ thuộc dữ liệu món. */
export type ItemNameOf = (itemId: string) => string;

export const moneyLineText = (amount: number): string => `Bán được: ${amount} quan`;

/** T-027: chữ vàng cạnh dòng tiền khi đêm qua bán được nhiều nhất từ trước tới giờ (systems/records.ts). */
export const RECORD_TEXT = 'Kỷ lục mới!';

/** Các dòng của màn tổng kết theo thứ tự hiện. Dòng tiền + dòng cây chín luôn có; còn lại chỉ khi xảy ra. */
export function summaryLines(s: OvernightSummary, staminaMax: number): SummaryLine[] {
  const lines: SummaryLine[] = [
    { kind: 'money', text: moneyLineText(s.sale.earned), warn: false },
    { kind: 'ripe', text: `Cây chín sáng nay: ${s.ripenedThisMorning}`, warn: false },
  ];
  if (s.unwateredYesterday > 0) lines.push({ kind: 'unwatered', text: `${s.unwateredYesterday} ô chưa tưới hôm qua`, warn: true });
  if (s.witheredTonight > 0) lines.push({ kind: 'withered', text: `${s.witheredTonight} cây đã héo — click để dọn`, warn: true });
  if (s.passedOut) lines.push({ kind: 'passout', text: `Ngủ gục ngoài đồng — sáng nay Sức ${s.staminaAfter}/${staminaMax}`, warn: true });
  if (s.seasonChanged) lines.push({ kind: 'season', text: s.newSeason === 'rainy' ? 'Mùa mưa tới rồi!' : 'Mùa nắng tới rồi!', warn: false });
  return lines;
}

/** Dòng chi tiết dưới dòng tiền: "Rau cải ×3 · Khoai lang ×1" ('' nếu không bán gì). */
export function saleDetailText(s: OvernightSummary, nameOf: ItemNameOf): string {
  return s.sale.lines.map((l) => `${nameOf(l.id)} ×${l.count}`).join(' · ');
}

/** Tiêu đề + dòng phụ: "Hết Ngày 1" / "Sáng mai: Ngày 2 · Mùa nắng". */
export function summaryTitle(s: OvernightSummary): string {
  return `Hết Ngày ${s.dayEnded}`;
}
export function summarySubtitle(s: OvernightSummary, daysPerSeason: number): string {
  return `Sáng mai: ${dayLabel(s.newDay, daysPerSeason)}`;
}

export interface RevealTiming {
  /** Giây giữa lúc hai dòng liền nhau bắt đầu trượt vào. */
  lineInterval: number;
  /** Một dòng trượt vào mất bao lâu (giây). */
  lineSlide: number;
  /** Số tiền đếm lên mất bao lâu (giây). */
  countSeconds: number;
  /** T-027: chữ "Kỷ lục mới!" đóng dấu xuống (nảy từ to về cỡ thật) mất bao lâu, bắt đầu ngay khi tiền đếm xong. Mặc định 0. */
  recordPopSeconds?: number;
}

export interface RevealState {
  /** Giây đã trôi từ lúc mở màn tổng kết. */
  t: number;
  /** Đã bấm "hiện hết" (lần 1). */
  skipped: boolean;
  lineCount: number;
  /** T-027: đêm qua lập kỷ lục tiền bán → có chữ "Kỷ lục mới!" hiện sau khi tiền đếm xong. */
  record: boolean;
}

export const createReveal = (lineCount: number, record = false): RevealState => ({ t: 0, skipped: false, lineCount, record });

/**
 * T-027: tiến độ "đóng dấu" chữ Kỷ lục mới (0 = chưa hiện, 1 = nằm yên). Bắt đầu lúc số tiền đếm xong (countSeconds) —
 * đếm lên rồi mới "bùm" kỷ lục. Không có kỷ lục → luôn 0. Đã bấm "hiện hết" → 1.
 */
export function recordProgress(r: RevealState, cfg: RevealTiming): number {
  if (!r.record) return 0;
  if (r.skipped) return 1;
  const pop = cfg.recordPopSeconds ?? 0;
  if (pop <= 0) return r.t >= cfg.countSeconds ? 1 : 0;
  return Math.min(1, Math.max(0, (r.t - cfg.countSeconds) / pop));
}

export function tickReveal(r: RevealState, dt: number): void {
  if (dt > 0) r.t += dt;
}

/** Tiến độ trượt vào của dòng i (0 = chưa hiện, 1 = nằm yên đúng chỗ). */
export function lineProgress(r: RevealState, i: number, cfg: RevealTiming): number {
  if (r.skipped) return 1;
  const start = i * cfg.lineInterval;
  if (cfg.lineSlide <= 0) return r.t >= start ? 1 : 0;
  return Math.min(1, Math.max(0, (r.t - start) / cfg.lineSlide));
}

/** Số tiền đang hiện trên dòng tiền (dòng 0) — đếm đều từ 0 lên `earned`, số nguyên. */
export function moneyShown(r: RevealState, earned: number, cfg: RevealTiming): number {
  if (r.skipped || cfg.countSeconds <= 0) return earned;
  const p = Math.min(1, Math.max(0, r.t / cfg.countSeconds));
  return Math.floor(earned * p);
}

/** Đã hiện hết (mọi dòng nằm yên + tiền đếm xong) chưa. */
export function allRevealed(r: RevealState, cfg: RevealTiming): boolean {
  if (r.skipped) return true;
  const lastLineDone = Math.max(0, r.lineCount - 1) * cfg.lineInterval + cfg.lineSlide;
  const recordDone = r.record ? cfg.countSeconds + (cfg.recordPopSeconds ?? 0) : 0;
  return r.t >= Math.max(lastLineDone, cfg.countSeconds, recordDone);
}

/** Bấm Enter / click "Ngày mới": còn đang hiện dần → 'revealAll' (hiện hết ngay); đã hiện hết → 'close' (sang ngày). */
export function acceptPress(r: RevealState, cfg: RevealTiming): 'revealAll' | 'close' {
  if (allRevealed(r, cfg)) return 'close';
  r.skipped = true;
  return 'revealAll';
}
