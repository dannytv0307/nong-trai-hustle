// Thanh Sức (T-004, GDD §3.2, §3.3a, §11). Thuần TS để unit test; scene chỉ gọi hàm và phản ứng với kết quả.
// - Mỗi việc tốn Sức: kiểm "đủ Sức" TRƯỚC khi làm (canAfford), trừ lúc việc xảy ra (consume). Cuốc: kiểm khi
//   bắt đầu / làm tiếp / tới lượt trong hàng chờ, trừ một lần ở nhát cuối (D-022).
// - Hết Sức (= 0) → "đuối": đi chậm, không làm được việc tốn Sức. Chỉ thoát đuối khi Sức > 0 (ăn).
// - Sức luôn nằm trong [0, max] — không âm, ăn không vượt trần.
import type { TileJob } from './farm';

export interface StaminaState {
  current: number;
  max: number;
  /** Đang đuối (Sức về 0 và chưa ăn lại). */
  exhausted: boolean;
}

/** Kết quả một lần đổi Sức. `becameExhausted` = vừa CHUYỂN sang đuối (để chửi đúng 1 lần mỗi lần đuối). */
export interface StaminaChange {
  /** Sức đã đổi thật (âm = mất, dương = được) sau khi chặn trong [0, max]. */
  delta: number;
  becameExhausted: boolean;
  /** Vừa thoát đuối (Sức từ 0 lên > 0). */
  recovered: boolean;
}

export function createStamina(max: number, current = max): StaminaState {
  const s: StaminaState = { current: 0, max: Math.max(1, max), exhausted: false };
  setStamina(s, current);
  // Mới vào game mà Sức đã 0 thì coi như đang đuối (không chửi vì không có "chuyển sang").
  s.exhausted = s.current <= 0;
  return s;
}

const clamp = (v: number, max: number): number => Math.min(max, Math.max(0, v));

/** Đặt Sức về `value` (chặn trong [0, max]) và cập nhật cờ đuối. Dùng chung cho mọi thay đổi. */
export function setStamina(s: StaminaState, value: number): StaminaChange {
  const before = s.current;
  const wasExhausted = s.exhausted;
  s.current = clamp(Number.isFinite(value) ? value : 0, s.max);
  s.exhausted = s.current <= 0;
  return {
    delta: s.current - before,
    becameExhausted: s.exhausted && !wasExhausted,
    recovered: wasExhausted && !s.exhausted,
  };
}

/** Đủ Sức cho việc tốn `cost` không. Việc không tốn (cost ≤ 0) thì luôn được, kể cả khi đuối. */
export function canAfford(s: StaminaState, cost: number): boolean {
  return cost <= 0 || s.current >= cost;
}

/**
 * Trừ `cost` Sức (chặn ở 0 — không bao giờ âm). Người gọi đã kiểm canAfford lúc BẮT ĐẦU việc; nếu Sức tụt giữa
 * chừng (vd phím thử F8 lúc đang cuốc) thì vẫn cho xong việc và chỉ trừ tới 0.
 */
export function consume(s: StaminaState, cost: number): StaminaChange {
  return setStamina(s, s.current - Math.max(0, cost));
}

/** Ăn / hồi `amount` Sức, không vượt `max`. `delta` = số Sức thật được cộng (hiện "+N Sức"). */
export function restore(s: StaminaState, amount: number): StaminaChange {
  return setStamina(s, s.current + Math.max(0, amount));
}

/** Sức đã đầy chưa. */
export const isFull = (s: StaminaState): boolean => s.current >= s.max;

/** Tỷ lệ Sức 0–1. */
export const staminaRatio = (s: StaminaState): number => s.current / s.max;

export type StaminaBand = 'green' | 'yellow' | 'red';

/**
 * Màu thanh Sức theo tỷ lệ (GDD §11): xanh lá → vàng khi < `yellowBelow` (50%) → đỏ khi < `redBelow` (20%).
 * Đúng 50% vẫn xanh, đúng 20% vẫn vàng ("dưới" là nhỏ hơn hẳn).
 */
export function staminaBand(ratio: number, yellowBelow: number, redBelow: number): StaminaBand {
  if (ratio < redBelow) return 'red';
  if (ratio < yellowBelow) return 'yellow';
  return 'green';
}

/** Hệ số tốc độ đi: đuối thì × `exhaustedMultiplier` (GDD `staminaExhaustedSpeedMultiplier`), không thì 1. */
export function walkSpeedMultiplier(s: StaminaState, exhaustedMultiplier: number): number {
  return s.exhausted ? exhaustedMultiplier : 1;
}

/** Sức tốn của từng việc trên ô (GDD §3.2: `staminaCostTill/Plant/Water/Harvest`). */
export interface JobStaminaCosts {
  till: number;
  plant: number;
  water: number;
  harvest: number;
}

/** Việc trên ô tốn bao nhiêu Sức. Dọn cây héo tính như hái (GDD §3.2 "Hái, dọn cây héo"). Cuốc = cả ô (D-022). */
export function jobStaminaCost(job: TileJob, c: JobStaminaCosts): number {
  switch (job) {
    case 'till':
      return c.till;
    case 'plant':
      return c.plant;
    case 'water':
      return c.water;
    case 'harvest':
    case 'clear':
      return c.harvest;
  }
}

/** Chữ trên thanh Sức, vd "64/100" (làm tròn xuống để không hiện số lẻ). */
export function staminaLabel(s: StaminaState): string {
  return `${Math.floor(s.current)}/${s.max}`;
}
