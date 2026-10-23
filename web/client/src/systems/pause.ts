// "Lý do dừng" đồng hồ ngày (GDD §3.1: đồng hồ dừng khi tạm dừng, túi đồ, cửa hàng, tổng kết…). Thuần TS → test bằng Vitest.
// Mỗi cửa sổ khi mở thì THÊM lý do của mình, đóng thì BỎ đi; đồng hồ chỉ chạy khi không còn lý do nào.
// Nhờ vậy nhiều cửa sổ chồng nhau (vd mất focus lúc đang mở gùi) không làm đồng hồ chạy lại sớm khi mới đóng một cái.
// T-006: thùng bán / sạp hạt gọi set('sellBox' | 'seedStall', true). T-007: hỏi ngủ / đang ngủ / ngủ gục = 'sleep',
// màn tổng kết ngày = 'daySummary'. T-093: cửa sổ rương = 'chest', đang mờ màn chuyển khu = 'areaFade'. T-041: bảng Thử
// (chỉ bản dev) = 'cheatPanel'. T-042: thẻ "Lên level / Mở khóa" = 'levelUp'.

/** Các lý do đã biết. Thêm cửa sổ mới thì thêm tên ở đây. */
export type PauseReason = 'bag' | 'pauseMenu' | 'sellBox' | 'seedStall' | 'chest' | 'daySummary' | 'sleep' | 'areaFade' | 'cheatPanel' | 'levelUp';

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
export type EscAction = 'closeRestartConfirm' | 'closePause' | 'declineSleep' | 'ignore' | 'closeShop' | 'closeBag' | 'openPause';

/**
 * Esc: cửa sổ Tạm dừng đang mở → đóng (chơi tiếp); thùng bán / sạp hạt đang mở → đóng nó (T-006); gùi đang mở → chỉ
 * đóng gùi; không có gì → mở Tạm dừng.
 * T-007: hộp hỏi "Đi ngủ?" đang mở → Esc = "Không"; đang ngủ / ngủ gục / màn tổng kết → Esc không làm gì (không mở Tạm
 * dừng chồng lên — tổng kết đã dừng đồng hồ rồi).
 * (Mất focus lúc đang mở gùi / thùng bán thì Tạm dừng nằm trên → Esc đầu đóng Tạm dừng, Esc sau đóng cửa sổ kia.)
 */
export function resolveEsc(state: {
  pauseMenuOpen: boolean;
  /** T-008: hộp xác nhận "Chơi lại từ đầu?" (nằm trên cửa sổ Tạm dừng) — Esc = Không. */
  restartConfirmOpen?: boolean;
  bagOpen: boolean;
  shopWindow?: string | null;
  sleepPromptOpen?: boolean;
  nightBusy?: boolean;
}): EscAction {
  if (state.pauseMenuOpen && state.restartConfirmOpen) return 'closeRestartConfirm';
  if (state.pauseMenuOpen) return 'closePause';
  if (state.sleepPromptOpen) return 'declineSleep';
  if (state.nightBusy) return 'ignore';
  if (state.shopWindow) return 'closeShop';
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
