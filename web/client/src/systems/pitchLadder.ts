// Chuỗi hái liên tiếp: tiếng "pop" cao dần theo thang ngũ cung (GDD §8 "Pop, cao dần nếu hái liên tiếp").
// Thuần TS → unit test được. Scene giữ trạng thái, gọi `nextLadderStep` mỗi lần hái.

export interface PitchLadderState {
  /** Nấc vừa phát (-1 = chưa phát lần nào / đã về đầu). */
  index: number;
  /** Số giây (giờ game) kể từ lần hái trước. */
  sinceLast: number;
}

export const createPitchLadder = (): PitchLadderState => ({ index: -1, sinceLast: Number.POSITIVE_INFINITY });

/** Cho thời gian trôi (giây). */
export function tickPitchLadder(s: PitchLadderState, dt: number): void {
  s.sinceLast += dt;
}

/**
 * Lần hái mới: ngừng quá `resetSeconds` thì về nấc đầu, không thì lên một nấc; tới nấc cao nhất thì giữ.
 * Trả về độ lệch cao độ (cent) của nấc đó trong `ladderCents`.
 */
export function nextLadderStep(s: PitchLadderState, ladderCents: readonly number[], resetSeconds: number): number {
  if (ladderCents.length === 0) return 0;
  const last = ladderCents.length - 1;
  s.index = s.index < 0 || s.sinceLast > resetSeconds ? 0 : Math.min(last, s.index + 1);
  s.sinceLast = 0;
  return ladderCents[s.index];
}
