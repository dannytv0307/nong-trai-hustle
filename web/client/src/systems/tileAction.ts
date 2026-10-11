// Hàng đợi việc trên ô (T-002, GDD §3.3, §3.3a). Click hoặc giữ chuột rê qua các ô → làm lần lượt từng ô.
// Mỗi ô là một "việc" gồm một hay nhiều NHÁT (cuốc gỗ: 6 nhát × `tillStrikeSeconds`; việc nhanh ở T-003
// như gieo/tưới: 1 nhát × `actionDuration`). Mỗi nhát có điểm "chạm" (`actionImpactAt`).
// Các mốc: bắt đầu việc (quay mặt, đứng yên) → mỗi nhát chạm (ô đổi, juice) → xong việc (sang ô kế).
// Bỏ dở (WASD, D-022): dừng ngay, nhát chưa chạm không tính, hàng chờ bị xóa.
// Thuần TS để unit test; scene chỉ việc phản ứng với các mốc.

export interface TileXY {
  x: number;
  y: number;
}

export interface TileActionState {
  /** Ô đang làm (null = rảnh). */
  current: TileXY | null;
  /** Thời gian đã trôi trong NHÁT hiện tại (giây). */
  elapsed: number;
  /** Nhát hiện tại đã qua điểm "chạm" chưa. */
  impacted: boolean;
  /** Số nhát còn phải làm ở ô hiện tại, tính cả nhát đang làm. */
  strikesLeft: number;
  /** Số nhát đã chạm ở ô hiện tại trong lần làm này (cho QA / hiệu ứng). */
  strikesDone: number;
  /** Các ô chờ làm tiếp. */
  queue: TileXY[];
  /**
   * Loại việc của ô đang làm + hàng chờ (T-003: "till", "plant", "water"…). Cả hàng chung một loại — GDD §3.3
   * "một lần rê một loại việc"; đang cuốc thì không nhận gieo/tưới (D-022: không đổi việc giữa chừng).
   * null = rảnh và hàng chờ trống.
   */
  kind: string | null;
}

export interface TileActionParams {
  /** Thời gian một nhát (giây) — `tillStrikeSeconds` cho cuốc, `actionDuration` cho việc nhanh. */
  duration: number;
  /** Điểm chạm theo tỷ lệ thời gian một nhát (0–1) — `actionImpactAt`. */
  impactAt: number;
  /** Đang làm thì nhớ thêm tối đa mấy ô chờ — `tillQueueMax` / `actionQueueMax`. 0 = không xếp hàng. */
  queueMax: number;
}

export function createTileActionState(): TileActionState {
  return { current: null, elapsed: 0, impacted: false, strikesLeft: 0, strikesDone: 0, queue: [], kind: null };
}

export const isBusy = (s: TileActionState): boolean => s.current !== null;

const same = (a: TileXY | null, b: TileXY): boolean => a !== null && a.x === b.x && a.y === b.y;

/** Ô này đã đang làm hoặc đã nằm trong hàng đợi? (giữ chuột trên một ô không xếp hàng nó nhiều lần). */
export function isPending(s: TileActionState, t: TileXY): boolean {
  return same(s.current, t) || s.queue.some((q) => same(q, t));
}

/** Vị trí của ô trong hàng chờ (1, 2, 3… — số hiện trên ô), 0 nếu không chờ. */
export function queuePosition(s: TileActionState, t: TileXY): number {
  return s.queue.findIndex((q) => same(q, t)) + 1;
}

/**
 * Xin làm ô `t` (người gọi đã kiểm "trong tầm + làm được"). Trả về true nếu đã nhận.
 * Không nhận nếu ô đang làm / đã chờ sẵn, hoặc hàng chờ đầy. Đang rảnh thì luôn nhận
 * (kể cả `queueMax` = 0 — tắt hàng chờ chứ không tắt click).
 * `kind` = loại việc; đang làm / đang chờ việc loại khác thì không nhận (hàng chờ luôn chung một loại).
 */
export function requestTile(s: TileActionState, t: TileXY, p: TileActionParams, kind: string | null = null): boolean {
  if (isPending(s, t)) return false;
  const occupied = s.current !== null || s.queue.length > 0;
  if (occupied && s.kind !== kind) return false;
  const limit = s.current ? p.queueMax : Math.max(1, p.queueMax);
  if (s.queue.length >= limit) return false;
  s.queue.push({ x: t.x, y: t.y });
  s.kind = kind;
  return true;
}

/**
 * Bỏ dở (D-022: bấm phím đi khi đang cuốc): dừng ngay, xóa hàng chờ. Nhát đang giơ mà chưa chạm thì
 * coi như chưa bổ (tiến độ ô chỉ tăng ở điểm chạm nên tự đúng). Trả về ô đang làm dở (null nếu đang rảnh).
 */
export function cancelTileAction(s: TileActionState): TileXY | null {
  const was = s.current;
  s.current = null;
  s.elapsed = 0;
  s.impacted = false;
  s.strikesLeft = 0;
  s.strikesDone = 0;
  s.queue.length = 0;
  s.kind = null;
  return was;
}

/** Sự kiện trong một bước `stepTileAction` — tái dùng object, không tạo mới mỗi frame. */
export interface TileActionEvents {
  /** Bắt đầu làm ô này (quay mặt, đứng yên). */
  started: TileXY | null;
  /** Một nhát chạm vào ô này (ô đổi trạng thái + juice). */
  impact: TileXY | null;
  /** Nhát vừa chạm là nhát cuối của ô (theo số nhát tính lúc bắt đầu). */
  impactIsLast: boolean;
  /** Vừa xong việc ở một ô (hết nhát cuối). */
  finished: boolean;
}

export function createTileActionEvents(): TileActionEvents {
  return { started: null, impact: null, impactIsLast: false, finished: false };
}

/**
 * Tiến thời gian `dt` giây.
 * - `stillValid(t)` được hỏi ngay trước khi BẮT ĐẦU một ô trong hàng đợi (ô có thể đã được làm xong, hoặc
 *   đã ra ngoài tầm) — trả false thì bỏ ô đó, xét ô kế.
 * - `strikesFor(t)` = số nhát cần làm ở ô này, hỏi lúc bắt đầu (ô cuốc dở 4/6 → 2). Mặc định 1 (việc nhanh).
 * Mỗi lần gọi chạm tối đa một lần (frame giật dài không bổ 2 nhát cùng lúc). Phần thời gian dư cuối một nhát
 * được chuyển sang nhát sau để tổng thời gian một ô đúng (6 × 0.85 s). Xong ô thì bắt đầu ô kế ngay trong
 * cùng lần gọi (có thể vừa `finished` vừa `started`).
 */
export function stepTileAction(
  s: TileActionState,
  dt: number,
  p: TileActionParams,
  stillValid: (t: TileXY) => boolean,
  out: TileActionEvents,
  strikesFor: (t: TileXY) => number = () => 1,
): TileActionEvents {
  out.started = null;
  out.impact = null;
  out.impactIsLast = false;
  out.finished = false;

  if (s.current) {
    s.elapsed += dt;
    if (!s.impacted && s.elapsed >= p.duration * p.impactAt) {
      s.impacted = true;
      s.strikesDone++;
      out.impact = s.current;
      out.impactIsLast = s.strikesLeft <= 1;
    }
    if (s.elapsed >= p.duration && s.impacted) {
      s.strikesLeft--;
      if (s.strikesLeft > 0) {
        // Sang nhát kế, giữ phần dư (nhưng không để dư quá một nhát).
        s.elapsed = Math.min(s.elapsed - p.duration, p.duration * 0.999);
        s.impacted = false;
        return out;
      }
      out.finished = true;
      s.current = null;
      s.elapsed = 0;
      s.impacted = false;
      s.strikesDone = 0;
    }
    // Còn đang làm → chờ. Vừa xong → bắt đầu ô kế NGAY lần gọi này (cuốc liền mạch, không hụt nhịp).
    if (s.current) return out;
  }

  while (s.queue.length > 0) {
    const next = s.queue.shift()!;
    if (!stillValid(next)) continue;
    s.current = next;
    s.elapsed = 0;
    s.impacted = false;
    s.strikesDone = 0;
    s.strikesLeft = Math.max(1, Math.floor(strikesFor(next)));
    out.started = next;
    // Điểm chạm = 0 → nhát đầu chạm ngay trong lần bắt đầu.
    if (p.impactAt <= 0) {
      s.impacted = true;
      s.strikesDone = 1;
      out.impact = next;
      out.impactIsLast = s.strikesLeft <= 1;
    }
    break;
  }
  // Hết việc và hàng chờ trống → rảnh, lần bấm sau chọn loại việc mới.
  if (!s.current && s.queue.length === 0) s.kind = null;
  return out;
}

/** Tư thế "nhún" của nhân vật trong lúc làm việc — áp thẳng vào sprite. */
export interface ActionPose {
  scaleX: number;
  scaleY: number;
}

/**
 * Nhún bằng code (chưa có hình cuốc riêng): trước điểm chạm vươn cao dần (giơ cuốc),
 * đúng lúc chạm bẹp xuống `squash`, rồi nảy về dáng thường tới hết nhát.
 * Phình ngang ngược với bẹp dọc để "khối lượng" giữ nguyên (nguyên tắc squash & stretch).
 * `progress` = elapsed / duration của MỘT nhát (0–1); ngoài nhát trả về 1, 1.
 */
export function actionPose(progress: number, impactAt: number, squash: number, stretch: number, out: ActionPose): ActionPose {
  let sy = 1;
  if (progress > 0 && progress < 1) {
    if (progress < impactAt) {
      sy = 1 + stretch * (progress / impactAt); // giơ cuốc
    } else {
      const t = (progress - impactAt) / (1 - impactAt || 1); // 0 lúc chạm → 1 lúc xong
      // Bẹp mạnh ngay lúc chạm rồi hồi về (ease-out), nảy quá nhẹ một chút cho "đàn hồi".
      const recover = 1 - (1 - t) * (1 - t);
      sy = 1 - squash * (1 - recover) + squash * 0.25 * Math.sin(Math.PI * recover);
    }
  }
  out.scaleY = sy;
  out.scaleX = 1 + (1 - sy) * 0.8;
  return out;
}

/**
 * Ô `t` vừa xong sớm (vd số nhát/ô bị chỉnh nhỏ giữa chừng) → nếu `t` CHÍNH LÀ ô đang làm thì chỉ còn nhát này, không
 * bổ tiếp vào đất đã cuốc. BUG-013: phải so toạ độ — frame dài có thể vừa chạm nhát cuối ô trước vừa bắt đầu ô kế trong
 * cùng một bước; lúc đó `s.current` đã là ô MỚI và không được đụng tới số nhát của nó.
 */
export function capStrikesIfCurrent(s: TileActionState, t: TileXY): boolean {
  if (!s.current || s.current.x !== t.x || s.current.y !== t.y || s.strikesLeft <= 1) return false;
  s.strikesLeft = 1;
  return true;
}
