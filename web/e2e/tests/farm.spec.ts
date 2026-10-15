// T-002 — Chỉ ô bằng chuột, tầm với, cuốc đất. Phần 2 (D-022, GDD §3.3a): cuốc là "việc nặng" — một click,
// {ten} tự bổ 6 nhát × 0.85 s, thanh tiến độ 6 đốt, đất đổi 3 nấc, WASD = bỏ dở (ô giữ số nhát), click lại
// làm tiếp, giữ chuột rê xếp hàng tối đa 3 ô, một lần rê một loại việc.
// Đọc trạng thái qua window.__game.scene.getScene('Garden').debugState (farm / hover / action / till / juice).
// Vùng ruộng Vườn: ô x 13..15, y 13..15 (gardenLayout.json). Tầm với interactRange = 2.5 ô từ tâm nhân vật.
// Chờ theo TRẠNG THÁI game (expect.poll / waitFrames), không chờ giờ cố định (BUG-006): mỗi ô mất ~5 s game.
// Ca "thông số thật" chạy đúng 6 × 0.85 s; các ca khác đặt nhát ngắn (debugSetTillTuning) cho nhanh.
import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCREENSHOT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'screenshots');
const TILE = 64;

interface XY {
  x: number;
  y: number;
}
interface Plot {
  x: number;
  y: number;
  soil: string;
  tillStrikes: number;
}
interface FarmState {
  footX: number;
  footY: number;
  facing: string;
  moving: boolean;
  view: { x: number; y: number; w: number; h: number };
  farm: { plots: Plot[]; tilled: number };
  hover: { x: number; y: number; inReach: boolean; tillable: boolean; highlight: 'bright' | 'gray'; alpha: number } | null;
  action: {
    busy: boolean;
    current: XY | null;
    progress: number;
    queued: number;
    queue: XY[];
    strikesLeft: number;
    strikesDone: number;
    dragKind: 'till' | null;
  };
  till: {
    tuning: { strikesPerPlot: number; strikeSeconds: number; queueMax: number };
    finishes: number;
    cancels: number;
    hitStops: number;
    hitStopActive: boolean;
    sweatActive: number;
    bouncing: boolean;
    bars: { x: number; y: number; filled: number; alpha: number; flash: boolean }[];
    stages: { x: number; y: number; stage: number }[];
    queueLabels: { x: number; y: number; text: string }[];
  };
  juice: {
    tills: number;
    shakes: number;
    lastSfx: string | null;
    lastSfxDetune: number;
    lastSfxVolume: number;
    dustActive: number;
    heroScale: XY;
  };
}

type SceneHook = Record<string, unknown> & {
  debugState: FarmState;
  events: { on(e: string, f: (time?: number, delta?: number) => void): void; off(e: string, f: (time?: number, delta?: number) => void): void };
};
type GameHook = {
  loop: { frame: number };
  scene: {
    isActive(key: string): boolean;
    isPaused(key: string): boolean;
    getScene(key: string): SceneHook;
    pause(k: string): void;
    resume(k: string): void;
  };
};

async function state(page: Page): Promise<FarmState | null> {
  return page.evaluate(() => {
    const g = (window as unknown as { __game?: GameHook }).__game;
    if (!g || !(g.scene.isActive('Garden') || g.scene.isPaused('Garden'))) return null;
    const s = g.scene.getScene('Garden').debugState as FarmState & { gardenReady?: boolean };
    return s?.gardenReady ? s : null;
  });
}
const st = async (page: Page): Promise<FarmState> => (await state(page))!;

const plotOf = (s: FarmState, x: number, y: number) => s.farm.plots.find((p) => p.x === x && p.y === y)!;
const soilAt = (s: FarmState, x: number, y: number) => plotOf(s, x, y)?.soil;

/** Nhát cuốc ngắn cho các ca không đo thời gian (6 nhát × 0.2 s = 1.2 s/ô). */
async function fastTill(page: Page, strikeSeconds = 0.2): Promise<void> {
  await page.evaluate((sec) => {
    const sc = (window as unknown as { __game: GameHook }).__game.scene.getScene('Garden');
    (sc.debugSetTillTuning as (t: { strikeSeconds: number }) => void).call(sc, { strikeSeconds: sec });
  }, strikeSeconds);
}

/** Dịch nhân vật tới giữa ô rồi chờ camera đứng yên (camera bám theo có độ trễ cameraLerp). */
async function teleportAndSettle(page: Page, tx: number, ty: number): Promise<void> {
  await page.evaluate(
    ([x, y]) => {
      const sc = (window as unknown as { __game: GameHook }).__game.scene.getScene('Garden');
      (sc.debugTeleport as (a: number, b: number) => void).call(sc, x, y);
    },
    [tx, ty],
  );
  let prev = '';
  await expect
    .poll(
      async () => {
        const v = JSON.stringify((await st(page)).view);
        const same = v === prev;
        prev = v;
        return same;
      },
      { timeout: 15_000, intervals: [150] },
    )
    .toBe(true);
}

/** Toạ độ trang (px) của tâm ô — đổi từ hệ 1920×1080 của game sang khung canvas thật. */
async function tileToPage(page: Page, tx: number, ty: number): Promise<XY> {
  const g = await page.evaluate(
    ([x, y]) => {
      const sc = (window as unknown as { __game: GameHook }).__game.scene.getScene('Garden');
      return (sc.debugTileToScreen as (a: number, b: number) => XY).call(sc, x, y);
    },
    [tx, ty],
  );
  const box = (await page.locator('canvas').boundingBox())!;
  return { x: box.x + (g.x * box.width) / 1920, y: box.y + (g.y * box.height) / 1080 };
}

async function moveMouseToTile(page: Page, tx: number, ty: number): Promise<void> {
  const p = await tileToPage(page, tx, ty);
  await page.mouse.move(p.x, p.y);
}

/** Chờ game chạy thêm `n` frame (đếm theo vòng lặp game, không theo giờ thật — máy bận không làm đỏ test). */
async function waitFrames(page: Page, n: number): Promise<void> {
  const start = await page.evaluate(() => (window as unknown as { __game: GameHook }).__game.loop.frame);
  await page.waitForFunction(
    (target) => (window as unknown as { __game: GameHook }).__game.loop.frame >= target,
    start + n,
    { timeout: 30_000 },
  );
}

async function setPaused(page: Page, paused: boolean): Promise<void> {
  await page.evaluate((p) => {
    const g = (window as unknown as { __game: GameHook }).__game;
    if (p) g.scene.pause('Garden');
    else g.scene.resume('Garden');
  }, paused);
}

/**
 * Ghi lại mỗi frame game (sau update): thời gian game, nhát của ô (tx,ty), ô đang làm, hướng, vị trí chân.
 * `pauseAtTills` = các mốc số nhát cuốc (juice.tills) mà tới đó thì dừng scene ngay frame ấy (để chụp đúng lúc).
 */
async function startRec(page: Page, tx: number, ty: number, pauseAtTills: number[] = []): Promise<void> {
  await page.evaluate(
    ([x, y, marks]) => {
      const w = window as unknown as {
        __game: GameHook;
        __rec: unknown[];
        __recFn?: (time?: number, delta?: number) => void;
        __recPausedAt: number;
      };
      const sc = w.__game.scene.getScene('Garden');
      if (w.__recFn) sc.events.off('postupdate', w.__recFn);
      w.__rec = [];
      w.__recPausedAt = 0;
      const pending = [...(marks as number[])];
      // t = tổng delta (ms) mà game đưa cho update — đúng "đồng hồ" mà nhát cuốc dùng
      // (khác giờ thật khi máy test chậm/giật, và không tính lúc scene tạm dừng để chụp).
      let t = 0;
      w.__recFn = (_time?: number, delta?: number) => {
        t += delta ?? 0;
        const s = sc.debugState;
        const plot = s.farm.plots.find((p) => p.x === x && p.y === y)!;
        w.__rec.push({
          t,
          strikes: plot.tillStrikes,
          soil: plot.soil,
          busy: s.action.busy,
          facing: s.facing,
          fx: s.footX,
          fy: s.footY,
          sfx: s.juice.lastSfx,
          tills: s.juice.tills,
        });
        if (pending.length > 0 && s.juice.tills >= pending[0]) {
          w.__recPausedAt = pending.shift()!;
          w.__game.scene.pause('Garden');
        }
      };
      sc.events.on('postupdate', w.__recFn);
    },
    [tx, ty, pauseAtTills] as const,
  );
}

type Rec = { t: number; strikes: number; soil: string; busy: boolean; facing: string; fx: number; fy: number; sfx: string | null; tills: number };

async function waitRecPausedAt(page: Page, n: number): Promise<void> {
  await page.waitForFunction((m) => (window as unknown as { __recPausedAt: number }).__recPausedAt === m, n, { timeout: 30_000 });
}

async function stopRec(page: Page): Promise<Rec[]> {
  return page.evaluate(() => {
    const w = window as unknown as { __game: GameHook; __rec: Rec[]; __recFn?: () => void };
    const sc = w.__game.scene.getScene('Garden');
    if (w.__recFn) sc.events.off('postupdate', w.__recFn);
    w.__recFn = undefined;
    return w.__rec;
  });
}

/** Click (nhấn + nhả ngay) vào ô. */
async function clickTile(page: Page, tx: number, ty: number): Promise<void> {
  await moveMouseToTile(page, tx, ty);
  await page.mouse.down();
  await page.mouse.up();
}

let errors: string[] = [];

test.beforeEach(async ({ page }) => {
  errors = [];
  page.on('console', (msg) => {
    const ignorable = msg.text().startsWith('Failed to load resource') && msg.location().url.includes('/api/');
    if (msg.type() === 'error' && !ignorable) errors.push(`[console.error] ${msg.text()}`);
  });
  page.on('pageerror', (err) => errors.push(`[pageerror] ${err.message}`));
  await page.goto('/');
  await expect.poll(() => state(page).then((s) => s !== null), { timeout: 30_000 }).toBe(true);
  mkdirSync(SCREENSHOT_DIR, { recursive: true });
});

test.afterEach(() => {
  expect(errors, errors.join('\n')).toEqual([]);
});

test('rê chuột: ô trong tầm viền sáng, ngoài tầm viền xám; click ngoài tầm / trên cỏ không làm gì', async ({ page }) => {
  await teleportAndSettle(page, 12, 14); // đứng sát mép trái ruộng
  expect((await st(page)).farm.tilled).toBe(0);

  await moveMouseToTile(page, 13, 14); // kề bên phải → trong tầm
  await expect.poll(async () => (await st(page)).hover).toMatchObject({ x: 13, y: 14, inReach: true, tillable: true, highlight: 'bright' });
  await setPaused(page, true);
  await page.screenshot({ path: join(SCREENSHOT_DIR, 't002-hover-bright.png') });
  await setPaused(page, false);

  await moveMouseToTile(page, 15, 14); // cách 3 ô → ngoài tầm (tầm với 2.5 ô)
  await expect.poll(async () => (await st(page)).hover).toMatchObject({ x: 15, y: 14, inReach: false, tillable: true, highlight: 'gray' });
  await setPaused(page, true);
  await page.screenshot({ path: join(SCREENSHOT_DIR, 't002-hover-gray.png') });
  await setPaused(page, false);

  // Click ô ngoài tầm: không cuốc, không động tác (chờ 60 frame ≈ hơn 1 nhát).
  await page.mouse.down();
  await waitFrames(page, 5);
  await page.mouse.up();
  await waitFrames(page, 60);
  const s1 = await st(page);
  expect(s1.farm.tilled).toBe(0);
  expect(s1.action.busy).toBe(false);
  expect(s1.juice.tills).toBe(0);
  expect(plotOf(s1, 15, 14).tillStrikes).toBe(0);

  // Ô cỏ trong tầm: viền sáng nhưng không cuốc được (chỉ ruộng mới cuốc).
  await moveMouseToTile(page, 11, 14);
  await expect.poll(async () => (await st(page)).hover).toMatchObject({ x: 11, y: 14, inReach: true, tillable: false });
  await clickTile(page, 11, 14);
  await waitFrames(page, 60);
  expect((await st(page)).juice.tills).toBe(0);
});

test('THÔNG SỐ THẬT: click 1 lần rồi buông → tự bổ 6 nhát × 0.85 s ≈ 5,1 s, thanh tiến độ, đất 3 nấc, mồ hôi, nhát cuối chốt', async ({ page }) => {
  test.setTimeout(90_000);
  await teleportAndSettle(page, 12, 14);
  const s0 = await st(page);
  expect(s0.till.tuning).toEqual({ strikesPerPlot: 6, strikeSeconds: 0.85, queueMax: 3 });
  expect(s0.facing).toBe('down');
  await moveMouseToTile(page, 13, 14);
  await expect.poll(async () => (await st(page)).hover?.inReach).toBe(true);

  // Dừng scene ở nhát 2 (đất đổi nấc 1), nhát 3 (mồ hôi), nhát 4 (nấc 2), nhát 6 (xong) để kiểm + chụp.
  await startRec(page, 13, 14, [2, 3, 4, 6]);
  await page.mouse.down();
  await page.mouse.up(); // buông chuột ngay — vẫn cuốc tiếp

  await waitRecPausedAt(page, 2);
  let s = await st(page);
  expect(s.action.busy).toBe(true);
  expect(s.action.current).toEqual({ x: 13, y: 14 });
  expect(s.facing).toBe('right');
  expect(plotOf(s, 13, 14)).toMatchObject({ soil: 'untilled', tillStrikes: 2 });
  expect(s.till.stages).toEqual([{ x: 13, y: 14, stage: 1 }]);
  expect(s.till.bars).toEqual([{ x: 13, y: 14, filled: 2, alpha: 1, flash: false }]);
  expect(s.juice.shakes).toBe(0); // không rung màn
  expect(s.juice.lastSfx).toMatch(/^sfx-cuoc-dat-[12]$/);
  expect(Math.abs(s.juice.lastSfxDetune)).toBeLessThanOrEqual(100); // ±1 nửa cung
  expect(s.juice.dustActive).toBeGreaterThan(0);
  // T-009: hoạt ảnh cuốc thật thay nhún — lúc chạm hiện khung "chạm đất" (2), thân không co giãn.
  expect((s as unknown as { hoeFrame: number }).hoeFrame).toBe(2);
  expect(s.juice.heroScale).toEqual({ x: 1, y: 1 });
  expect(s.till.sweatActive).toBe(0); // chưa tới nhát 3
  await setPaused(page, false);

  await waitRecPausedAt(page, 3);
  s = await st(page);
  expect(plotOf(s, 13, 14).tillStrikes).toBe(3);
  expect(s.till.sweatActive).toBeGreaterThan(0); // từ nhát 3 có mồ hôi
  expect(s.till.stages[0].stage).toBe(1);
  await page.screenshot({ path: join(SCREENSHOT_DIR, 't002b-progress-3of6.png') });
  await setPaused(page, false);

  await waitRecPausedAt(page, 4);
  s = await st(page);
  expect(s.till.stages).toEqual([{ x: 13, y: 14, stage: 2 }]);
  expect(s.till.bars[0].filled).toBe(4);
  await page.screenshot({ path: join(SCREENSHOT_DIR, 't002b-progress-4of6.png') });
  await setPaused(page, false);

  await waitRecPausedAt(page, 6);
  s = await st(page);
  expect(plotOf(s, 13, 14)).toMatchObject({ soil: 'tilled', tillStrikes: 6 });
  expect(s.till.finishes).toBe(1);
  expect(s.till.hitStops).toBe(1);
  expect(s.till.hitStopActive).toBe(true); // khựng hình đúng frame chạm cuối
  expect(s.till.bouncing).toBe(true);
  expect(s.till.bars[0]).toMatchObject({ x: 13, y: 14, flash: true });
  expect(s.juice.dustActive).toBeGreaterThan(9); // bụi × 2 (9 hạt mỗi nhát thường)
  // T-026: tiếng chốt là file riêng cuoc-chot-1/2 (AUD-SFX-103) — to sẵn, không hạ giọng / nhân âm lượng nữa.
  expect(s.juice.lastSfx).toMatch(/^sfx-cuoc-chot-[12]$/);
  expect(Math.abs(s.juice.lastSfxDetune)).toBeLessThanOrEqual(30);
  expect(s.juice.lastSfxVolume).toBeGreaterThan(0);
  await page.screenshot({ path: join(SCREENSHOT_DIR, 't002b-finish.png') });
  await setPaused(page, false);

  await expect.poll(async () => (await st(page)).action.busy, { timeout: 10_000 }).toBe(false);
  const rec = await stopRec(page);
  const busy = rec.filter((r) => r.busy);
  // Cả ô ≈ 6 × 0.85 = 5.1 s theo đồng hồ game (cho lệch vài frame của máy test chậm).
  const dur = (busy[busy.length - 1].t - busy[0].t) / 1000;
  expect(dur).toBeGreaterThan(4.9);
  expect(dur).toBeLessThan(5.5);
  // Thời điểm từng nhát chạm: cách nhau ≈ 0.85 s.
  const hits: number[] = [];
  for (let i = 1; i < rec.length; i++) if (rec[i].strikes > rec[i - 1].strikes) hits.push(rec[i].t);
  expect(hits).toHaveLength(6);
  for (let i = 1; i < hits.length; i++) {
    const gap = (hits[i] - hits[i - 1]) / 1000;
    expect(gap).toBeGreaterThan(0.75);
    expect(gap).toBeLessThan(0.98);
  }
  // Đứng yên suốt lúc cuốc.
  const fxs = busy.map((r) => r.fx);
  expect(Math.max(...fxs) - Math.min(...fxs)).toBeLessThan(1.5);
  await waitFrames(page, 30); // thanh lóe sáng tắt
  s = await st(page);
  expect(s.till.bars).toEqual([]);
  expect(s.till.stages).toEqual([]);

  // Click lại ô đã cuốc: không làm gì.
  await clickTile(page, 13, 14);
  await waitFrames(page, 60);
  s = await st(page);
  expect(s.juice.tills).toBe(6);
  expect(s.action.busy).toBe(false);
  await page.screenshot({ path: join(SCREENSHOT_DIR, 't002b-done.png') });
});

test('WASD giữa chừng = bỏ dở: dừng ngay, đi được, ô giữ số nhát, thanh mờ; click lại làm tiếp phần còn lại', async ({ page }) => {
  await fastTill(page, 0.3);
  await teleportAndSettle(page, 12, 14);
  await clickTile(page, 13, 14);
  await expect.poll(async () => plotOf(await st(page), 13, 14).tillStrikes, { timeout: 15_000, intervals: [20] }).toBeGreaterThanOrEqual(2);
  // Kéo dài nhát đang giơ để chắc chắn bấm D lúc "nhát chưa chạm" (không phụ thuộc máy test nhanh/chậm).
  await fastTill(page, 30);
  const s0 = await st(page);
  // Cũng thử chuột phải giữa lúc cuốc: không ngắt (chuột phải để ăn — GDD §3.3a).
  const p = await tileToPage(page, 13, 14);
  await page.mouse.click(p.x, p.y, { button: 'right' });
  await waitFrames(page, 3);
  expect((await st(page)).action.busy).toBe(true);

  // Bấm D: bỏ dở.
  await page.keyboard.down('KeyD');
  await expect.poll(async () => (await st(page)).action.busy, { intervals: [10] }).toBe(false);
  const cut = await st(page);
  const kept = plotOf(cut, 13, 14).tillStrikes;
  expect(kept).toBe(plotOf(s0, 13, 14).tillStrikes); // nhát đang giơ dở không được tính
  expect(kept).toBeLessThan(6);
  expect(cut.till.cancels).toBe(1);
  expect(cut.action.queued).toBe(0);
  // Đi được luôn; nhát đang giơ không tính — ô giữ nguyên số nhát dù chờ thêm.
  await expect.poll(async () => (await st(page)).footX, { timeout: 5_000 }).toBeGreaterThan(cut.footX + TILE);
  await page.keyboard.up('KeyD');
  await waitFrames(page, 30);
  const after = await st(page);
  expect(plotOf(after, 13, 14)).toMatchObject({ soil: 'untilled', tillStrikes: kept });
  // Thanh tiến độ vẫn trên ô, mờ ~50%; đất ở nấc tương ứng.
  expect(after.till.bars).toEqual([{ x: 13, y: 14, filled: kept, alpha: 0.5, flash: false }]);
  await setPaused(page, true);
  await page.screenshot({ path: join(SCREENSHOT_DIR, 't002b-abandoned.png') });
  await setPaused(page, false);

  // Quay lại, rê chuột lên ô dở: thanh hiện rõ 100%, viền không phủ trắng lên nấc đất (chỉ còn nét viền).
  await teleportAndSettle(page, 12, 14);
  await moveMouseToTile(page, 13, 14);
  await expect.poll(async () => (await st(page)).till.bars).toEqual([{ x: 13, y: 14, filled: kept, alpha: 1, flash: false }]);
  const filled = await page.evaluate(() => {
    const h = (window as unknown as { __game: GameHook }).__game.scene.getScene('Garden').highlight as { isFilled: boolean; visible: boolean };
    return { isFilled: h.isFilled, visible: h.visible };
  });
  expect(filled).toEqual({ isFilled: false, visible: true });
  await setPaused(page, true);
  {
    const c = await tileToPage(page, 13, 14);
    const box = (await page.locator('canvas').boundingBox())!;
    const half = (2.5 * TILE * 1.5 * box.width) / 1920;
    await page.screenshot({ path: join(SCREENSHOT_DIR, 't002b-abandoned-hover.png') });
    await page.screenshot({ path: join(SCREENSHOT_DIR, 't002b-abandoned-hover-zoom.png'), clip: { x: c.x - half, y: c.y - half, width: half * 2, height: half * 2 } });
  }
  await setPaused(page, false);

  // Click ô dở → làm tiếp đúng số nhát còn lại.
  const tillsBefore = after.juice.tills;
  // Nhát rất dài trong lúc đọc số nhát còn lại (không phụ thuộc máy test nhanh/chậm), đọc xong cho chạy nhanh.
  await fastTill(page, 30);
  await clickTile(page, 13, 14);
  await expect.poll(async () => (await st(page)).action.busy, { intervals: [10] }).toBe(true);
  expect((await st(page)).action.strikesLeft).toBe(6 - kept);
  await fastTill(page, 0.3);
  await expect.poll(async () => soilAt(await st(page), 13, 14), { timeout: 15_000 }).toBe('tilled');
  await expect.poll(async () => (await st(page)).action.busy, { timeout: 5_000 }).toBe(false);
  const done = await st(page);
  expect(done.juice.tills - tillsBefore).toBe(6 - kept);
  expect(done.till.finishes).toBe(1);
});

test('hàng chờ: click rồi giữ chuột rê qua 5 ô → nhận 1 + 3 ô (số 1/2/3 trên ô), cuốc lần lượt, ô thứ 5 bỏ qua', async ({ page }) => {
  test.setTimeout(90_000);
  // Nhát rất dài trong lúc rê để ô đầu chắc chắn còn đang cuốc (không phụ thuộc máy test nhanh/chậm);
  // kiểm hàng chờ xong thì cho nhát ngắn lại (đổi giữa chừng có hiệu lực ngay với nhát đang làm).
  await fastTill(page, 30);
  await teleportAndSettle(page, 14, 12); // trên hàng ruộng đầu (y = 13), giữa
  const path: [number, number][] = [
    [13, 13],
    [14, 13],
    [15, 13],
    [15, 14],
    [14, 14],
  ];
  await moveMouseToTile(page, 13, 13);
  await expect.poll(async () => (await st(page)).hover?.inReach).toBe(true);
  await page.mouse.down();
  for (const [x, y] of path.slice(1)) {
    await moveMouseToTile(page, x, y);
    await expect.poll(async () => (await st(page)).hover).toMatchObject({ x, y });
    await waitFrames(page, 2);
  }
  const q = await st(page);
  expect(q.action.current).toEqual({ x: 13, y: 13 });
  expect(q.action.queue).toEqual([
    { x: 14, y: 13 },
    { x: 15, y: 13 },
    { x: 15, y: 14 },
  ]);
  expect(q.till.queueLabels).toEqual([
    { x: 14, y: 13, text: '1' },
    { x: 15, y: 13, text: '2' },
    { x: 15, y: 14, text: '3' },
  ]);
  expect(q.action.dragKind).toBe('till');
  await setPaused(page, true);
  await page.screenshot({ path: join(SCREENSHOT_DIR, 't002b-queue.png') });
  {
    const c = await tileToPage(page, 14, 13);
    const box = (await page.locator('canvas').boundingBox())!;
    const half = (2.5 * TILE * 1.5 * box.width) / 1920;
    await page.screenshot({ path: join(SCREENSHOT_DIR, 't002b-queue-zoom.png'), clip: { x: c.x - half, y: c.y - half, width: half * 2, height: half * 2 } });
  }
  await setPaused(page, false);
  await page.mouse.up();
  await fastTill(page, 0.2);

  // Cuốc lần lượt cả 4 ô; ô thứ 5 (14,14) không được nhận.
  await expect.poll(async () => (await st(page)).farm.tilled, { timeout: 30_000 }).toBe(4);
  await expect.poll(async () => (await st(page)).action.busy, { timeout: 5_000 }).toBe(false);
  const s = await st(page);
  for (const [x, y] of path.slice(0, 4)) expect(soilAt(s, x, y), `ô (${x}, ${y})`).toBe('tilled');
  expect(plotOf(s, 14, 14).tillStrikes).toBe(0);
  expect(s.till.finishes).toBe(4);
  expect(s.till.queueLabels).toEqual([]);
  await page.screenshot({ path: join(SCREENSHOT_DIR, 't002b-queue-done.png') });
});

test('tạm dừng scene giữa lúc cuốc: nhát dừng theo, mở lại cuốc tiếp không mất nhát', async ({ page }) => {
  await fastTill(page, 0.3);
  await teleportAndSettle(page, 12, 14);
  await clickTile(page, 13, 14);
  await expect.poll(async () => plotOf(await st(page), 13, 14).tillStrikes, { timeout: 15_000, intervals: [20] }).toBeGreaterThanOrEqual(1);
  await setPaused(page, true);
  const p0 = await st(page);
  await waitFrames(page, 90); // vòng lặp game vẫn chạy, chỉ scene Vườn dừng (≈ 1.5 s > 5 nhát)
  const p1 = await st(page);
  expect(plotOf(p1, 13, 14).tillStrikes).toBe(plotOf(p0, 13, 14).tillStrikes);
  expect(p1.action.progress).toBe(p0.action.progress);
  expect(p1.action.busy).toBe(true);
  await setPaused(page, false);
  await expect.poll(async () => soilAt(await st(page), 13, 14), { timeout: 15_000 }).toBe('tilled');
  await expect.poll(async () => (await st(page)).action.busy, { timeout: 5_000 }).toBe(false);
  expect((await st(page)).juice.tills).toBe(6);
});

test('một lần rê một loại việc: bấm trên cỏ / ô đã cuốc rồi rê qua ruộng chưa cuốc → không cuốc', async ({ page }) => {
  await fastTill(page, 0.15);
  await teleportAndSettle(page, 14, 12);
  // Cuốc sẵn (13,13).
  await clickTile(page, 13, 13);
  await expect.poll(async () => soilAt(await st(page), 13, 13), { timeout: 15_000 }).toBe('tilled');
  await expect.poll(async () => (await st(page)).action.busy, { timeout: 5_000 }).toBe(false);

  // Bấm trên cỏ (14,12 — ngay dưới chân) rồi rê qua (14,13), (15,13).
  await moveMouseToTile(page, 14, 12);
  await page.mouse.down();
  for (const [x, y] of [
    [14, 13],
    [15, 13],
  ]) {
    await moveMouseToTile(page, x, y);
    await expect.poll(async () => (await st(page)).hover).toMatchObject({ x, y, inReach: true, tillable: true });
    await waitFrames(page, 3);
  }
  let s = await st(page);
  expect(s.action.dragKind).toBeNull();
  expect(s.action.busy).toBe(false);
  await page.mouse.up();

  // Bấm trên ô đã cuốc (13,13) rồi rê sang ô chưa cuốc: cũng không cuốc (T-003: lần rê này sẽ là "gieo").
  await moveMouseToTile(page, 13, 13);
  await page.mouse.down();
  await moveMouseToTile(page, 14, 13);
  await expect.poll(async () => (await st(page)).hover).toMatchObject({ x: 14, y: 13 });
  await waitFrames(page, 10);
  s = await st(page);
  expect(s.action.busy).toBe(false);
  expect(plotOf(s, 14, 13).tillStrikes).toBe(0);
  await page.mouse.up();
});

test('giữ chuột + giữ phím đi (S): bỏ dở rồi đi, không tự cuốc lại khi còn giữ chuột (không còn "vừa giữ chuột vừa đi vẫn cuốc")', async ({ page }) => {
  await fastTill(page, 30); // nhát dài: chắc chắn còn đang cuốc lúc bấm S
  await teleportAndSettle(page, 12, 13);
  await moveMouseToTile(page, 13, 13);
  await expect.poll(async () => (await st(page)).hover?.inReach).toBe(true);
  await page.mouse.down();
  await expect.poll(async () => (await st(page)).action.busy, { intervals: [10] }).toBe(true);
  await page.keyboard.down('KeyS');
  await expect.poll(async () => (await st(page)).action.busy, { intervals: [10] }).toBe(false);
  await expect.poll(async () => (await st(page)).footY, { timeout: 5_000 }).toBeGreaterThan(14 * TILE);
  await page.keyboard.up('KeyS');
  // Vẫn giữ chuột, đứng yên, con trỏ trên một ô ruộng chưa cuốc trong tầm → không tự cuốc lại.
  await moveMouseToTile(page, 13, 14);
  await waitFrames(page, 30);
  const s = await st(page);
  expect(s.action.busy).toBe(false);
  expect(s.till.cancels).toBe(1);
  expect(s.farm.tilled).toBe(0);
  await page.mouse.up();
  // Click mới thì cuốc bình thường.
  await clickTile(page, 13, 14);
  await expect.poll(async () => (await st(page)).action.busy, { intervals: [10] }).toBe(true);
});

test('chuột phải trên game: không mở menu trình duyệt, không cuốc', async ({ page }) => {
  await teleportAndSettle(page, 12, 14);
  await page.evaluate(() => {
    const w = window as unknown as { __ctxPrevented: boolean[] };
    w.__ctxPrevented = [];
    window.addEventListener('contextmenu', (e) => w.__ctxPrevented.push(e.defaultPrevented));
  });
  const p = await tileToPage(page, 13, 14);
  await page.mouse.click(p.x, p.y, { button: 'right' });
  await waitFrames(page, 40);
  const prevented = await page.evaluate(() => (window as unknown as { __ctxPrevented: boolean[] }).__ctxPrevented);
  expect(prevented.length).toBeGreaterThan(0);
  expect(prevented.every(Boolean)).toBe(true);
  const s = await st(page);
  expect(s.farm.tilled).toBe(0);
  expect(s.action.busy).toBe(false);
});

test('viền ô nổi rõ trên cỏ / ruộng chưa cuốc / ruộng đã cuốc; trong tầm thở, ngoài tầm đứng yên', async ({ page }) => {
  await fastTill(page, 0.15);
  await teleportAndSettle(page, 12, 14);
  // Cuốc sẵn ô (13,14) để có nền "đất đã cuốc".
  await moveMouseToTile(page, 13, 14);
  await expect.poll(async () => (await st(page)).hover?.inReach).toBe(true);
  await page.mouse.down();
  await page.mouse.up();
  await expect.poll(async () => soilAt(await st(page), 13, 14), { timeout: 10_000 }).toBe('tilled');
  await expect.poll(async () => (await st(page)).action.busy, { timeout: 5_000 }).toBe(false);

  const shot = async (name: string, tx: number, ty: number) => {
    const p = await tileToPage(page, tx, ty);
    const box = (await page.locator('canvas').boundingBox())!;
    const half = (3 * TILE * 1.5 * box.width) / 1920; // khung cắt ±3 ô quanh ô (camera zoom 1.5)
    await setPaused(page, true);
    await page.screenshot({ path: join(SCREENSHOT_DIR, `t002-highlight-${name}.png`) });
    await page.screenshot({
      path: join(SCREENSHOT_DIR, `t002-highlight-${name}-zoom.png`),
      clip: { x: p.x - half, y: p.y - half, width: half * 2, height: half * 2 },
    });
    await setPaused(page, false);
  };

  const cases: [string, number, number, boolean][] = [
    ['path', 11, 14, true], // đường đất
    ['grass', 12, 16, true], // cỏ, cách 2 ô dọc
    ['untilled', 14, 14, true], // ruộng chưa cuốc, cách 2 ô
    ['tilled', 13, 14, true], // đất đã cuốc
    ['gray-untilled', 15, 14, false], // ruộng chưa cuốc, cách 3 ô → ngoài tầm
    ['gray-grass', 12, 11, false], // cỏ, cách 3 ô dọc → ngoài tầm
  ];
  for (const [name, tx, ty, want] of cases) {
    await moveMouseToTile(page, tx, ty);
    await expect.poll(async () => (await st(page)).hover).toMatchObject({ x: tx, y: ty, inReach: want });
    if (want) {
      // Thở: thấy cả lúc mờ (< 0.8) lẫn lúc sáng (> 0.95); chụp lúc sáng nhất.
      await expect.poll(async () => (await st(page)).hover!.alpha, { timeout: 5_000, intervals: [30] }).toBeLessThan(0.8);
      await expect.poll(async () => (await st(page)).hover!.alpha, { timeout: 5_000, intervals: [30] }).toBeGreaterThan(0.95);
    } else {
      // Ngoài tầm: đứng yên, không nhấp nháy.
      for (let i = 0; i < 5; i++) {
        expect((await st(page)).hover!.alpha).toBe(1);
        await waitFrames(page, 6);
      }
    }
    await shot(name, tx, ty);
  }
});
