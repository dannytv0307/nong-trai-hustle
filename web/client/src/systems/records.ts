// Kỷ lục của một lần chơi (T-027, GDD §7 "Ngày lập kỷ lục tiền bán … `profitArrow`"). Thuần TS → unit test được.
// Hiện có một kỷ lục: số tiền bán được nhiều nhất trong MỘT đêm. Đêm nào bán được nhiều hơn mọi đêm trước → màn tổng kết
// có dòng vàng "Kỷ lục mới!" (T-079 sẽ chen meme mũi tên lãi vào cùng chỗ). Lưu trong save (`records`, version 4).

export interface DayRecords {
  /** Tiền bán được nhiều nhất trong một đêm (quan). 0 = chưa bán lần nào. */
  bestDaySale: number;
}

export const createRecords = (): DayRecords => ({ bestDaySale: 0 });

/**
 * Ghi tiền bán của đêm vừa qua. Trả về true nếu là KỶ LỤC MỚI: nhiều hơn hẳn kỷ lục cũ (bằng thì không tính) và > 0
 * (đêm không bán gì không bao giờ là kỷ lục). Đêm bán được tiền ĐẦU TIÊN của lần chơi luôn là kỷ lục mới — cố ý: lần đầu
 * thấy thùng bán ra tiền cũng là một "khoảnh khắc sướng".
 */
export function noteDaySale(r: DayRecords, earned: number): boolean {
  const amount = Math.floor(earned);
  if (!(amount > 0) || amount <= r.bestDaySale) return false;
  r.bestDaySale = amount;
  return true;
}

/** Số kỷ lục hợp lệ từ save (số nguyên ≥ 0; hỏng → 0). */
export function normalizeRecordValue(v: number): number {
  return Number.isFinite(v) && v > 0 ? Math.floor(v) : 0;
}
