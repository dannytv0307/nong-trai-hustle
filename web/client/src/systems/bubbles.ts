// Luật bong bóng chữ trên đầu {ten} (T-004, GDD §3.12, §11). Thuần TS để unit test.
// Chỉ có MỘT bong bóng một lúc. Bong bóng mới chỉ thay được bong bóng đang hiện nếu quan trọng bằng hoặc hơn —
// để câu lầm bầm vu vơ không đè mất câu chửi lúc vừa đuối, hay câu "đuối rồi…" báo vì sao không làm được việc.

/**
 * Loại bong bóng:
 * - `grumble`: chửi thề (răng cưa đỏ, lắc) — vừa chuyển sang đuối.
 * - `warn`: báo không làm được việc ("đuối rồi…", "hết hạt rồi", "gùi đầy") và tin phím thử.
 * - `bark`: lầm bầm vu vơ khi xong ô cuốc.
 */
export type BubbleKind = 'grumble' | 'warn' | 'bark';

/** Thứ tự ưu tiên: chửi thề > "đuối rồi…" (và các câu báo khác) > lầm bầm. */
export const BUBBLE_PRIORITY: Readonly<Record<BubbleKind, number>> = { grumble: 3, warn: 2, bark: 1 };

/** Bong bóng `next` có được hiện khi đang hiện `current` không (null = không có bong bóng nào). */
export function bubbleCanShow(current: BubbleKind | null, next: BubbleKind): boolean {
  return current === null || BUBBLE_PRIORITY[next] >= BUBBLE_PRIORITY[current];
}

/** Đồng hồ + lần lầm bầm gần nhất (giây, theo đồng hồ của scene — dừng khi game dừng). */
export interface BarkState {
  /** Lúc lầm bầm lần trước (-Infinity = chưa lần nào). */
  lastAt: number;
  /** Câu vừa nói (để lần sau không lặp đúng câu đó). */
  lastLine: string | null;
  count: number;
}

export function createBarkState(): BarkState {
  return { lastAt: Number.NEGATIVE_INFINITY, lastLine: null, count: 0 };
}

/**
 * Xong một ô cuốc: có lầm bầm không (GDD §3.3a)? Cần qua đủ `cooldownSeconds` từ lần trước VÀ trúng xác suất
 * `chance`. `roll` = số ngẫu nhiên 0–1 (truyền vào để test). Không đổi state — gọi `recordBark` khi đã hiện thật.
 */
export function shouldBark(s: BarkState, now: number, chance: number, cooldownSeconds: number, roll: number): boolean {
  if (now - s.lastAt < cooldownSeconds) return false;
  return roll < chance;
}

/**
 * Chọn câu lầm bầm: ngẫu nhiên theo `roll` (0–1), bỏ câu vừa nói lần trước nếu còn câu khác.
 * Trả về null nếu danh sách rỗng.
 */
export function pickBarkLine(lines: readonly string[], lastLine: string | null, roll: number): string | null {
  const pool = lines.length > 1 && lastLine !== null ? lines.filter((l) => l !== lastLine) : lines;
  if (pool.length === 0) return null;
  const i = Math.min(pool.length - 1, Math.floor(Math.max(0, roll) * pool.length));
  return pool[i];
}

/** Ghi nhận đã lầm bầm câu `line` lúc `now`. */
export function recordBark(s: BarkState, now: number, line: string): void {
  s.lastAt = now;
  s.lastLine = line;
  s.count++;
}
