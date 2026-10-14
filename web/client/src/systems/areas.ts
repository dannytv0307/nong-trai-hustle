// T-093: chuyển khu dùng chung (Vườn ⇄ trong nhà; sau này cổng Núi / làng Sung — T-054). Thuần TS → test được.
//
// Một lần chuyển khu là một máy trạng thái nhỏ:
//   idle → out (màn tối dần trong `fadeSeconds`) → [swap: dời nhân vật sang khu mới, đổi camera, tự lưu, hiện tên khu]
//        → in (màn sáng dần) → idle.
// Scene chỉ việc gọi `stepAreaTransition` mỗi frame và làm việc "swap" khi hàm báo; độ tối màn lấy từ `transitionAlpha`.
// Trong lúc chuyển (out / in) nhân vật đứng yên, phím đi bị bỏ (scene lo).
import type { Facing } from './movement';

/** Các khu có thật. Thêm khu mới (T-054: 'mountain', 'sung'…) thì thêm ở đây + tên ở AREA_NAMES. */
export type AreaId = 'garden' | 'house';
export const AREA_IDS: readonly AreaId[] = ['garden', 'house'];

export function isAreaId(s: string): s is AreaId {
  return (AREA_IDS as readonly string[]).includes(s);
}

/** Tên khu hiện lên khi vừa vào (`{ten}` = tên nhân vật). */
export const AREA_NAMES: Readonly<Record<AreaId, string>> = {
  garden: 'Vườn nhà {ten}',
  house: 'Nhà {ten}',
};

export function areaName(area: AreaId, playerName: string): string {
  return AREA_NAMES[area].split('{ten}').join(playerName);
}

export type AreaTransitionPhase = 'idle' | 'out' | 'in';

export interface AreaTransition {
  phase: AreaTransitionPhase;
  /** Giây đã trôi trong bước hiện tại. */
  t: number;
  /** Khu sẽ tới + chỗ đứng (px thế giới, giữa hộp chân) + hướng mặt khi tới. */
  to: AreaId | null;
  spawn: { x: number; y: number } | null;
  facing: Facing | null;
}

export function createAreaTransition(): AreaTransition {
  return { phase: 'idle', t: 0, to: null, spawn: null, facing: null };
}

export function isTransitioning(s: AreaTransition): boolean {
  return s.phase !== 'idle';
}

/** Bắt đầu chuyển khu. Đang chuyển dở → bỏ qua (false) — không chồng hai lần chuyển. */
export function startAreaTransition(s: AreaTransition, to: AreaId, spawn: { x: number; y: number }, facing: Facing): boolean {
  if (s.phase !== 'idle') return false;
  s.phase = 'out';
  s.t = 0;
  s.to = to;
  s.spawn = { x: spawn.x, y: spawn.y };
  s.facing = facing;
  return true;
}

/**
 * Tiến một frame. Trả về 'swap' đúng MỘT lần lúc màn tối hẳn (scene dời nhân vật sang khu mới), 'done' lúc sáng hẳn,
 * null các frame khác. `fadeSeconds` ≤ 0 → không mờ: swap ở frame đầu, done ở frame sau.
 */
export function stepAreaTransition(s: AreaTransition, dt: number, fadeSeconds: number): 'swap' | 'done' | null {
  if (s.phase === 'idle') return null;
  s.t += Math.max(0, dt);
  if (s.t < fadeSeconds) return null;
  if (s.phase === 'out') {
    s.phase = 'in';
    s.t = 0;
    return 'swap';
  }
  s.phase = 'idle';
  s.t = 0;
  s.to = null;
  s.spawn = null;
  s.facing = null;
  return 'done';
}

/** Độ tối màn 0–1 lúc này: tối dần khi `out`, sáng dần khi `in`. */
export function transitionAlpha(s: AreaTransition, fadeSeconds: number): number {
  if (s.phase === 'idle') return 0;
  const p = fadeSeconds > 0 ? Math.min(1, s.t / fadeSeconds) : 1;
  return s.phase === 'out' ? p : 1 - p;
}

/**
 * Tên khu hiện bao đậm sau khi vào `t` giây: hiện đủ `holdSeconds`, rồi mờ dần trong `fadeSeconds`; 0 khi đã tắt.
 */
export function areaBannerAlpha(t: number, holdSeconds: number, fadeSeconds: number): number {
  if (t < 0) return 0;
  if (t <= holdSeconds) return 1;
  if (fadeSeconds <= 0) return 0;
  return Math.max(0, 1 - (t - holdSeconds) / fadeSeconds);
}
