// Bộ đệm "lần nhấn" của InputController — thuần TS (không Phaser) để test bằng Vitest.
// Phím/chuột được GHI theo sự kiện (keydown, pointerdown, wheel) vào đây, gameplay "tiêu thụ" mỗi frame.
// T-005: trình duyệt vẫn báo keydown khi game đang Tạm dừng → lúc đó phải XÓA HẾT (clearAll), không thì phím E / G / F9
// hay cú chạm D bấm trong lúc dừng sẽ bất ngờ có tác dụng ngay khi chơi tiếp (mở gùi, qua đêm, bỏ dở cuốc…).

export class PressBuffer {
  /** Mã phím vừa nhấn (bỏ lặp do giữ phím) chờ gameplay hỏi. */
  private readonly codes = new Set<number>();
  /** Ô hotbar của phím số bấm SAU CÙNG (BUG-010), null = chưa bấm. */
  private hotbar: number | null = null;
  /** Đã chạm phím đi (kể cả nhấn + nhả lọt giữa hai frame — BUG-007). */
  private move = false;
  private primary = false;
  private secondary = false;
  /** Số nấc cuộn dồn lại (dương = cuộn xuống). */
  private wheel = 0;

  /** Ghi một keydown. `repeat` = trình duyệt tự lặp khi giữ phím. `hotbarIndex` ≥ 0 nếu là phím 1–9. */
  keyDown(code: number, repeat: boolean, isMove: boolean, hotbarIndex: number): void {
    if (isMove) this.move = true;
    if (repeat) return;
    this.codes.add(code);
    if (hotbarIndex >= 0) this.hotbar = hotbarIndex;
  }

  pointerDown(left: boolean, right: boolean): void {
    if (left) this.primary = true;
    if (right) this.secondary = true;
  }

  addWheelSteps(steps: number): void {
    this.wheel += steps;
  }

  /** Có phím nào trong `codes` vừa được nhấn không — và xóa chúng (true một lần mỗi lần nhấn). */
  consumeCodes(codes: readonly number[]): boolean {
    let pressed = false;
    for (const c of codes) if (this.codes.delete(c)) pressed = true;
    return pressed;
  }

  /** Ô hotbar vừa chọn (hoặc null), xóa luôn mã các phím số `hotbarCodes`. */
  consumeHotbar(hotbarCodes: readonly number[]): number | null {
    const index = this.hotbar;
    this.hotbar = null;
    for (const c of hotbarCodes) this.codes.delete(c);
    return index;
  }

  consumeMove(): boolean {
    const v = this.move;
    this.move = false;
    return v;
  }

  consumePrimary(): boolean {
    const v = this.primary;
    this.primary = false;
    return v;
  }

  consumeSecondary(): boolean {
    const v = this.secondary;
    this.secondary = false;
    return v;
  }

  consumeWheel(): number {
    const v = this.wheel;
    this.wheel = 0;
    return v;
  }

  /** Cuối frame: bỏ phím / cuộn chưa ai hỏi tới (chuột và chạm phím đi do gameplay tự tiêu thụ mỗi frame). */
  endFrame(): void {
    this.codes.clear();
    this.wheel = 0;
    this.hotbar = null;
  }

  /** Xóa SẠCH mọi lần nhấn tồn đọng (phím, phím đi, chuột trái/phải, cuộn) — dùng khi đang / vừa hết Tạm dừng. */
  clearAll(): void {
    this.endFrame();
    this.move = false;
    this.primary = false;
    this.secondary = false;
  }

  /** Còn lần nhấn nào chưa xử lý không (cho test). */
  get hasPending(): boolean {
    return this.codes.size > 0 || this.hotbar !== null || this.move || this.primary || this.secondary || this.wheel !== 0;
  }
}
