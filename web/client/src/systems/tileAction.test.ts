import { describe, expect, it } from 'vitest';
import {
  actionPose,
  cancelTileAction,
  createTileActionEvents,
  createTileActionState,
  isBusy,
  isPending,
  queuePosition,
  requestTile,
  stepTileAction,
  type TileXY,
} from './tileAction';

const P = { duration: 0.4, impactAt: 0.5, queueMax: 4 };
const always = () => true;

/** Chạy n bước dt, gom các sự kiện. */
function run(s = createTileActionState(), steps: number, dt: number, valid: (t: TileXY) => boolean = always) {
  const ev = createTileActionEvents();
  const log = { started: [] as TileXY[], impact: [] as TileXY[], finished: 0 };
  for (let i = 0; i < steps; i++) {
    stepTileAction(s, dt, P, valid, ev);
    if (ev.started) log.started.push({ ...ev.started });
    if (ev.impact) log.impact.push({ ...ev.impact });
    if (ev.finished) log.finished++;
  }
  return log;
}

describe('tileAction — một cú click', () => {
  it('bắt đầu ngay, chạm ở giữa, xong sau actionDuration', () => {
    const s = createTileActionState();
    const ev = createTileActionEvents();
    requestTile(s, { x: 1, y: 2 }, P);

    stepTileAction(s, 0.016, P, always, ev);
    expect(ev.started).toEqual({ x: 1, y: 2 });
    expect(ev.impact).toBeNull();
    expect(isBusy(s)).toBe(true);

    stepTileAction(s, 0.19, P, always, ev); // 0.19 < 0.2
    expect(ev.impact).toBeNull();
    stepTileAction(s, 0.02, P, always, ev); // 0.21 ≥ 0.2
    expect(ev.impact).toEqual({ x: 1, y: 2 });

    stepTileAction(s, 0.15, P, always, ev); // 0.36
    expect(ev.finished).toBe(false);
    stepTileAction(s, 0.05, P, always, ev); // 0.41
    expect(ev.finished).toBe(true);
    expect(isBusy(s)).toBe(false);
  });

  it('chạm đúng một lần dù frame giật dài', () => {
    const s = createTileActionState();
    requestTile(s, { x: 0, y: 0 }, P);
    const log = run(s, 3, 0.5);
    expect(log.impact).toHaveLength(1);
    expect(log.finished).toBe(1);
  });

  it('impactAt = 0 → chạm ngay frame bắt đầu', () => {
    const s = createTileActionState();
    const ev = createTileActionEvents();
    requestTile(s, { x: 3, y: 3 }, P);
    stepTileAction(s, 0.016, { ...P, impactAt: 0 }, always, ev);
    expect(ev.started).toEqual({ x: 3, y: 3 });
    expect(ev.impact).toEqual({ x: 3, y: 3 });
  });
});

describe('tileAction — giữ chuột rê qua nhiều ô', () => {
  it('làm lần lượt từng ô, mỗi actionDuration một ô, liền mạch', () => {
    const s = createTileActionState();
    for (let x = 0; x < 3; x++) requestTile(s, { x, y: 0 }, P);
    const log = run(s, 80, 0.016); // 1.28 s
    expect(log.started.map((t) => t.x)).toEqual([0, 1, 2]);
    expect(log.impact.map((t) => t.x)).toEqual([0, 1, 2]);
    expect(log.finished).toBe(3);
  });

  it('ô kế bắt đầu ngay frame ô trước xong (không hụt nhịp)', () => {
    const s = createTileActionState();
    const ev = createTileActionEvents();
    requestTile(s, { x: 0, y: 0 }, P);
    requestTile(s, { x: 1, y: 0 }, P);
    stepTileAction(s, 0.01, P, always, ev);
    stepTileAction(s, 0.4, P, always, ev);
    expect(ev.finished).toBe(true);
    expect(ev.started).toEqual({ x: 1, y: 0 });
  });

  it('không xếp hàng một ô hai lần (giữ chuột đứng yên trên một ô)', () => {
    const s = createTileActionState();
    expect(requestTile(s, { x: 5, y: 5 }, P)).toBe(true);
    expect(requestTile(s, { x: 5, y: 5 }, P)).toBe(false);
    run(s, 1, 0.016); // ô đang làm
    expect(isPending(s, { x: 5, y: 5 })).toBe(true);
    expect(requestTile(s, { x: 5, y: 5 }, P)).toBe(false);
  });

  it('hàng đợi đầy thì không nhận thêm', () => {
    const s = createTileActionState();
    for (let x = 0; x < P.queueMax; x++) expect(requestTile(s, { x, y: 0 }, P)).toBe(true);
    expect(requestTile(s, { x: 99, y: 0 }, P)).toBe(false);
  });

  it('ô hết hợp lệ lúc tới lượt (đi xa / đã cuốc) thì bỏ qua, làm ô kế', () => {
    const s = createTileActionState();
    for (let x = 0; x < 3; x++) requestTile(s, { x, y: 0 }, P);
    const log = run(s, 80, 0.016, (t) => t.x !== 1);
    expect(log.started.map((t) => t.x)).toEqual([0, 2]);
  });
});

/** Thông số cuốc thật (D-022): mỗi nhát 0.85 s, chạm giữa nhát, hàng chờ 3. */
const TILL = { duration: 0.85, impactAt: 0.5, queueMax: 3 };

/** Chạy n bước dt với thông số cuốc, đếm nhát chạm theo ô, ghi thời điểm chạm. */
function runTill(s: ReturnType<typeof createTileActionState>, seconds: number, strikesFor: (t: TileXY) => number, dt = 1 / 60) {
  const ev = createTileActionEvents();
  const log = { started: [] as TileXY[], impacts: [] as { x: number; t: number; last: boolean }[], finished: 0 };
  let t = 0;
  const steps = Math.round(seconds / dt);
  for (let i = 0; i < steps; i++) {
    t += dt;
    stepTileAction(s, dt, TILL, always, ev, strikesFor);
    if (ev.started) log.started.push({ ...ev.started });
    if (ev.impact) log.impacts.push({ x: ev.impact.x, t, last: ev.impactIsLast });
    if (ev.finished) log.finished++;
  }
  return log;
}

describe('tileAction — cuốc nhiều nhát (D-022)', () => {
  it('một click: 6 nhát, mỗi nhát chạm ở giữa (0.425 s), cách nhau 0.85 s, xong sau ≈ 5,1 s', () => {
    const s = createTileActionState();
    requestTile(s, { x: 1, y: 1 }, TILL);
    const log = runTill(s, 6, () => 6);
    expect(log.started).toEqual([{ x: 1, y: 1 }]);
    expect(log.impacts).toHaveLength(6);
    expect(log.impacts[0].t).toBeCloseTo(0.425 + 1 / 60, 1);
    for (let i = 1; i < 6; i++) expect(log.impacts[i].t - log.impacts[i - 1].t).toBeCloseTo(0.85, 1);
    expect(log.impacts.map((i) => i.last)).toEqual([false, false, false, false, false, true]);
    expect(log.finished).toBe(1);
    expect(isBusy(s)).toBe(false);
  });

  it('tổng thời gian đúng 6 × 0.85 s dù frame lệch nhịp (phần dư chuyển sang nhát sau)', () => {
    const s = createTileActionState();
    requestTile(s, { x: 0, y: 0 }, TILL);
    const ev = createTileActionEvents();
    let t = 0;
    let doneAt = -1;
    for (let i = 0; i < 2000 && doneAt < 0; i++) {
      const dt = i % 2 ? 0.007 : 0.031; // 2 nhịp frame xen kẽ
      t += dt;
      stepTileAction(s, dt, TILL, always, ev, () => 6);
      if (ev.finished) doneAt = t;
    }
    expect(doneAt).toBeGreaterThan(5.1);
    expect(doneAt).toBeLessThan(5.1 + 0.07);
  });

  it('frame giật rất dài: mỗi lần gọi chạm tối đa một nhát', () => {
    const s = createTileActionState();
    requestTile(s, { x: 0, y: 0 }, TILL);
    const ev = createTileActionEvents();
    stepTileAction(s, 0.016, TILL, always, ev, () => 6);
    let impacts = 0;
    for (let i = 0; i < 3; i++) {
      stepTileAction(s, 3, TILL, always, ev, () => 6);
      if (ev.impact) impacts++;
    }
    expect(impacts).toBe(3);
    expect(s.strikesDone).toBe(3);
  });

  it('bỏ dở giữa nhát 3 (đã chạm 2): dừng ngay, xóa hàng chờ, nhát đang giơ không tính', () => {
    const s = createTileActionState();
    requestTile(s, { x: 0, y: 0 }, TILL);
    runTill(s, 0.016, () => 6); // bắt đầu
    requestTile(s, { x: 1, y: 0 }, TILL);
    requestTile(s, { x: 2, y: 0 }, TILL);
    // 2 nhát chạm ở 0.425 + 1.275; tới 1.9 s đang giơ nhát 3 (chạm ở 2.125).
    const log = runTill(s, 1.9, () => 6);
    expect(log.impacts).toHaveLength(2);
    expect(cancelTileAction(s)).toEqual({ x: 0, y: 0 });
    expect(isBusy(s)).toBe(false);
    expect(s.queue).toEqual([]);
    // Sau khi bỏ: không còn nhát nào nữa.
    expect(runTill(s, 3, () => 6).impacts).toHaveLength(0);
    expect(cancelTileAction(s)).toBeNull(); // đang rảnh
  });

  it('làm tiếp ô dở: chỉ bổ số nhát còn lại (strikesFor lúc bắt đầu)', () => {
    const s = createTileActionState();
    requestTile(s, { x: 4, y: 4 }, TILL);
    const log = runTill(s, 3, () => 2); // ô đã 4/6
    expect(log.impacts).toHaveLength(2);
    expect(log.impacts[1].last).toBe(true);
    expect(log.finished).toBe(1);
  });

  it('hàng chờ: rê qua 5 ô → nhận 1 (đang cuốc) + 3 chờ, số thứ tự 1/2/3; xong ô tự sang ô kế', () => {
    const s = createTileActionState();
    const accepted: boolean[] = [];
    for (let x = 0; x < 5; x++) {
      accepted.push(requestTile(s, { x, y: 0 }, TILL));
      runTill(s, 1 / 60, () => 6); // mỗi ô rê qua trong một frame
    }
    expect(accepted).toEqual([true, true, true, true, false]);
    expect(s.current).toEqual({ x: 0, y: 0 });
    expect([1, 2, 3, 4].map((x) => queuePosition(s, { x, y: 0 }))).toEqual([1, 2, 3, 0]);
    // Click lại ô đang cuốc / ô đã chờ: không làm gì.
    expect(requestTile(s, { x: 0, y: 0 }, TILL)).toBe(false);
    expect(requestTile(s, { x: 2, y: 0 }, TILL)).toBe(false);
    const log = runTill(s, 4 * 5.1 + 0.2, () => 6);
    expect(log.started.map((t) => t.x)).toEqual([1, 2, 3]);
    expect(log.finished).toBe(4);
  });

  it('tillQueueMax = 0: tắt hàng chờ nhưng click lúc rảnh vẫn cuốc', () => {
    const s = createTileActionState();
    const P0 = { ...TILL, queueMax: 0 };
    expect(requestTile(s, { x: 0, y: 0 }, P0)).toBe(true);
    stepTileAction(s, 0.016, P0, always, createTileActionEvents(), () => 6);
    expect(requestTile(s, { x: 1, y: 0 }, P0)).toBe(false);
  });
});

describe('actionPose — nhún bằng code', () => {
  const pose = { scaleX: 1, scaleY: 1 };
  it('ngoài động tác: dáng thường', () => {
    expect(actionPose(0, 0.5, 0.12, 0.05, pose)).toEqual({ scaleX: 1, scaleY: 1 });
    expect(actionPose(1, 0.5, 0.12, 0.05, pose)).toEqual({ scaleX: 1, scaleY: 1 });
  });

  it('trước điểm chạm vươn cao, ngay sau điểm chạm bẹp xuống và phình ngang', () => {
    expect(actionPose(0.45, 0.5, 0.12, 0.05, pose).scaleY).toBeGreaterThan(1.04);
    actionPose(0.51, 0.5, 0.12, 0.05, pose);
    expect(pose.scaleY).toBeLessThan(0.9);
    expect(pose.scaleX).toBeGreaterThan(1.05);
  });

  it('gần hết động tác thì gần về dáng thường', () => {
    expect(Math.abs(actionPose(0.98, 0.5, 0.12, 0.05, pose).scaleY - 1)).toBeLessThan(0.02);
  });
});
