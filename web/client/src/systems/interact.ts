// Vật tương tác được trong Vườn (T-006): thùng bán, sạp hạt tạm; T-007: giường. Thuần TS → test được.
// - Click: con trỏ trên ô thuộc vật + vật trong tầm `interactRange` (tính như ô ruộng: từ tâm nhân vật tới TÂM Ô gần nhất
//   của vật — vật to nhiều ô thì với tới ô nào cũng được).
// - Phím F: "đứng cạnh" = khoảng cách từ tâm hộp chân tới MÉP vật ≤ `interactKeyRange` ô; nhiều vật thì lấy vật gần nhất
//   (GDD §4: F = tương tác với vật gần nhất).
// Sau này giường (T-007), bếp, rương… chỉ cần thêm tên vào INTERACT_TARGETS + toạ độ trong gardenLayout.json.
import type { GardenLayout, TileRect } from './garden';

export type InteractTarget = 'sellBox' | 'seedStall' | 'bed';

/** T-007: giường trong nhà — click / F để đi ngủ (từ earliestSleepHour). */
export const INTERACT_TARGETS: readonly InteractTarget[] = ['sellBox', 'seedStall', 'bed'];

export function targetRect(layout: GardenLayout, t: InteractTarget): TileRect {
  return layout[t];
}

const inRect = (r: TileRect, tx: number, ty: number): boolean => tx >= r.x && tx < r.x + r.w && ty >= r.y && ty < r.y + r.h;

/** Vật nằm ở ô (tx, ty), null nếu không có. */
export function targetAt(layout: GardenLayout, tx: number, ty: number): InteractTarget | null {
  for (const t of INTERACT_TARGETS) if (inRect(layout[t], tx, ty)) return t;
  return null;
}

/** Click được không: tâm ô gần nhất của vật cách điểm (px, py) ≤ `range` ô. */
export function targetInReach(layout: GardenLayout, t: InteractTarget, px: number, py: number, tileSize: number, range: number): boolean {
  const r = layout[t];
  let best = Number.POSITIVE_INFINITY;
  for (let y = r.y; y < r.y + r.h; y++) {
    for (let x = r.x; x < r.x + r.w; x++) {
      best = Math.min(best, Math.hypot((x + 0.5) * tileSize - px, (y + 0.5) * tileSize - py));
    }
  }
  return best <= range * tileSize;
}

/** Khoảng cách (ô) từ điểm (px, py) tới mép gần nhất của vật (0 nếu điểm nằm trong vật). */
export function distanceToTarget(layout: GardenLayout, t: InteractTarget, px: number, py: number, tileSize: number): number {
  const r = layout[t];
  const left = r.x * tileSize;
  const top = r.y * tileSize;
  const dx = Math.max(left - px, 0, px - (left + r.w * tileSize));
  const dy = Math.max(top - py, 0, py - (top + r.h * tileSize));
  return Math.hypot(dx, dy) / tileSize;
}

/** Vật gần nhất trong tầm phím F (≤ `range` ô tính tới mép vật), null nếu không đứng cạnh vật nào. */
export function nearestKeyTarget(layout: GardenLayout, px: number, py: number, tileSize: number, range: number): InteractTarget | null {
  let best: InteractTarget | null = null;
  let bestD = Number.POSITIVE_INFINITY;
  for (const t of INTERACT_TARGETS) {
    const d = distanceToTarget(layout, t, px, py, tileSize);
    if (d <= range && d < bestD) {
      best = t;
      bestD = d;
    }
  }
  return best;
}
