// "Lý do dừng" đồng hồ ngày (GDD §3.1: đồng hồ dừng khi tạm dừng, túi đồ, cửa hàng, tổng kết…). Thuần TS → test bằng Vitest.
// Mỗi cửa sổ khi mở thì THÊM lý do của mình, đóng thì BỎ đi; đồng hồ chỉ chạy khi không còn lý do nào.
// Nhờ vậy nhiều cửa sổ chồng nhau (vd mất focus lúc đang mở gùi) không làm đồng hồ chạy lại sớm khi mới đóng một cái.
// T-006 (thùng bán, sạp hạt) và T-007 (tổng kết ngày) chỉ cần gọi set('sellBox', true) / set('daySummary', true).

/** Các lý do đã biết. Thêm cửa sổ mới thì thêm tên ở đây. */
export type PauseReason = 'bag' | 'pauseMenu' | 'sellBox' | 'seedStall' | 'daySummary' | 'sleep';

export class PauseReasons {
  private readonly reasons = new Set<PauseReason>();

  /** Bật / tắt một lý do. Gọi lặp lại cùng giá trị không sao. */
  set(reason: PauseReason, on: boolean): void {
    if (on) this.reasons.add(reason);
    else this.reasons.delete(reason);
  }

  has(reason: PauseReason): boolean {
    return this.reasons.has(reason);
  }

  /** Đồng hồ có đang bị dừng không (còn ít nhất một lý do). */
  get stopped(): boolean {
    return this.reasons.size > 0;
  }

  /** Danh sách lý do đang bật, xếp theo tên (ổn định cho debug/test). */
  list(): PauseReason[] {
    return [...this.reasons].sort();
  }

  clear(): void {
    this.reasons.clear();
  }
}

/** Việc phím Esc làm, theo cửa sổ đang mở (cửa sổ trên cùng được đóng trước). */
export type EscAction = 'closePause' | 'closeBag' | 'openPause';

/**
 * Esc: cửa sổ Tạm dừng đang mở → đóng (chơi tiếp); gùi đang mở → chỉ đóng gùi; không có gì → mở Tạm dừng.
 * (Mất focus lúc đang mở gùi thì Tạm dừng nằm trên gùi → Esc đầu đóng Tạm dừng, Esc sau đóng gùi.)
 */
export function resolveEsc(state: { pauseMenuOpen: boolean; bagOpen: boolean }): EscAction {
  if (state.pauseMenuOpen) return 'closePause';
  if (state.bagOpen) return 'closeBag';
  return 'openPause';
}

/** Vì sao cửa sổ Tạm dừng mở: bấm Esc, cửa sổ mất focus (Alt+Tab), tab bị ẩn (đổi tab / thu nhỏ). */
export type PauseCause = 'esc' | 'blur' | 'hidden';

/** Mất focus / ẩn tab có tự mở Tạm dừng không: chỉ khi bật pauseOnFocusLost và game đã sẵn sàng. */
export function shouldAutoPause(cause: PauseCause, opts: { pauseOnFocusLost: boolean; ready: boolean }): boolean {
  if (cause === 'esc') return opts.ready;
  return opts.pauseOnFocusLost && opts.ready;
}
