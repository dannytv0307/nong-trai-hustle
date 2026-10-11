// QA độc lập T-002 phần 2 (D-022 — cuốc là việc nặng, 6 nhát × 0.85 s/ô). Các ca rìa:
// WASD đúng frame chạm của nhát cuối; bỏ dở rồi click ô khác; click ô dở khi hàng chờ đang có; click ô đã cuốc;
// spam click; ô trong hàng chờ ra ngoài tầm; tab ẩn giữa nhát; chuột phải giữa lúc cuốc; cuốc hết 9 ô;
// thời gian 1 ô với thông số thật (đo bằng đồng hồ game = tổng delta frame); dọn UI sau khi xong; console sạch.
// Ruộng: ô x 13..15, y 13..15. Chờ theo trạng thái (BUG-006).
/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SHOTS = join(dirname(fileURLToPath(import.meta.url)), '..', 'screenshots');
let errors: string[] = [];

const st = (page: Page) => page.evaluate(() => (window as any).__game.scene.getScene('Garden').debugState);
const plot = async (page: Page, x: number, y: number) =>
  ((await st(page)).farm.plots as any[]).find((p) => p.x === x && p.y === y);

async function tune(page: Page, t: Record<string, number>) {
  await page.evaluate((t) => (window as any).__game.scene.getScene('Garden').debugSetTillTuning(t), t);
}
async function tp(page: Page, tx: number, ty: number) {
  await page.evaluate(([x, y]) => (window as any).__game.scene.getScene('Garden').debugTeleport(x, y), [tx, ty]);
  // chờ camera ổn định
  let prev = '';
  for (let i = 0; i < 100; i++) {
    const v = JSON.stringify((await st(page)).view);
    if (v === prev) return;
    prev = v;
    await page.waitForTimeout(100);
  }
}
async function waitFrames(page: Page, n: number) {
  const start = await page.evaluate(() => (window as any).__game.loop.frame);
  await page.waitForFunction((t) => (window as any).__game.loop.frame >= t, start + n, { timeout: 20_000 });
}
async function toPage(page: Page, tx: number, ty: number) {
  const g = await page.evaluate(([x, y]) => (window as any).__game.scene.getScene('Garden').debugTileToScreen(x, y), [tx, ty]);
  const box = (await page.locator('canvas').boundingBox())!;
  return { x: box.x + (g.x * box.width) / 1920, y: box.y + (g.y * box.height) / 1080 };
}
async function click(page: Page, tx: number, ty: number, button: 'left' | 'right' = 'left') {
  const p = await toPage(page, tx, ty);
  await page.mouse.move(p.x, p.y);
  await waitFrames(page, 2);
  await page.mouse.down({ button });
  await waitFrames(page, 2);
  await page.mouse.up({ button });
  await waitFrames(page, 1);
}
const waitStrikes = (page: Page, x: number, y: number, n: number, timeout = 30_000) =>
  expect.poll(async () => (await plot(page, x, y)).tillStrikes, { timeout, intervals: [30] }).toBeGreaterThanOrEqual(n);
const waitIdle = (page: Page, timeout = 60_000) =>
  expect.poll(async () => (await st(page)).action.busy, { timeout, intervals: [50] }).toBe(false);

test.beforeEach(async ({ page }) => {
  errors = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push('pageerror ' + e.message));
  page.on('response', (r) => {
    if (r.status() >= 400) errors.push(`HTTP ${r.status()} ${r.url()}`);
  });
  await page.goto('/');
  await page.waitForFunction(() => (window as any).__game?.scene?.getScene('Garden')?.debugState?.gardenReady === true, null, { timeout: 30_000 });
  mkdirSync(SHOTS, { recursive: true });
});
test.afterEach(() => {
  expect(errors, errors.join('\n')).toEqual([]);
});

test('B1 thông số thật: 1 ô ≈ 5.1 s game-time, 6 nhát đều, đứng yên, nấc đất sau nhát 2/4, mồ hôi từ nhát 3, nhát cuối chốt', async ({ page }) => {
  test.setTimeout(120_000);
  const tun = (await st(page)).till.tuning;
  expect(tun).toMatchObject({ strikeSeconds: 0.85, strikesPerPlot: 6, queueMax: 3 });
  await tp(page, 14, 12);
  // Ghi log theo từng frame trong trang: thời gian game (tổng delta), số nhát, busy, vị trí chân, mồ hôi, nấc.
  await page.evaluate(() => {
    const g = (window as any).__game;
    const sc = g.scene.getScene('Garden');
    const w = window as any;
    w.__log = [];
    w.__t = 0;
    g.events.on('poststep', (_t: number, d: number) => {
      w.__t += d / 1000;
      const p = sc.farm.plots.find((q: any) => q.x === 14 && q.y === 13);
      const s = sc.debugState;
      w.__log.push({ t: w.__t, k: p.tillStrikes, busy: s.action.busy, fx: s.footX, fy: s.footY, sweat: s.till.sweatActive, stage: s.till.stages.find((q: any) => q.x === 14 && q.y === 13)?.stage ?? (p.soil === 'tilled' ? 3 : 0), hs: s.till.hitStopActive, det: s.juice.lastSfxDetune, vol: s.juice.lastSfxVolume, shakes: s.juice.shakes, bars: s.till.bars.length });
    });
  });
  const p = await toPage(page, 14, 13);
  await page.mouse.move(p.x, p.y);
  await waitFrames(page, 2);
  await page.mouse.down();
  await waitFrames(page, 2);
  await page.mouse.up(); // thả chuột vẫn cuốc tiếp
  // ảnh giữa chừng (nấc 1, nấc 2) — chuột vẫn trên ô để xem viền + bụi có che nấc không
  await waitStrikes(page, 14, 13, 2);
  await waitFrames(page, 3);
  await page.screenshot({ path: join(SHOTS, 'qa-t002b-real-stage1.png') });
  await waitStrikes(page, 14, 13, 4);
  await waitFrames(page, 3);
  await page.screenshot({ path: join(SHOTS, 'qa-t002b-real-stage2.png') });
  await waitStrikes(page, 14, 13, 6);
  await page.screenshot({ path: join(SHOTS, 'qa-t002b-real-finish.png') });
  await waitIdle(page);
  await waitFrames(page, 40);
  const log: any[] = await page.evaluate(() => (window as any).__log);
  const startI = log.findIndex((e) => e.busy);
  const endI = log.findIndex((e, i) => i > startI && !e.busy);
  const dur = log[endI].t - log[startI - 1 >= 0 ? startI - 1 : startI].t;
  const impacts: number[] = [];
  for (let i = 1; i < log.length; i++) if (log[i].k > log[i - 1].k) impacts.push(log[i].t);
  const gaps = impacts.slice(1).map((t, i) => +(t - impacts[i]).toFixed(3));
  const stageAt = (k: number) => log.find((e) => e.k === k)?.stage;
  const sweatAt = (k: number) => Math.max(...log.filter((e) => e.k === k).slice(0, 8).map((e) => e.sweat));
  const moved = log.slice(startI, endI).some((e) => Math.abs(e.fx - log[startI].fx) > 0.5 || Math.abs(e.fy - log[startI].fy) > 0.5);
  const fpsInfo = { frames: endI - startI, avgDt: dur / (endI - startI) };
  console.log('B1', { dur, impacts: impacts.length, gaps, stages: [1, 2, 3, 4, 5, 6].map(stageAt), sweat: [1, 2, 3, 4, 5, 6].map(sweatAt), moved, fpsInfo, hitStop: log.some((e) => e.hs), last: log[endI] });
  expect(impacts.length).toBe(6);
  expect(dur).toBeGreaterThan(4.9);
  expect(dur).toBeLessThan(5.5);
  for (const g of gaps) {
    expect(g).toBeGreaterThan(0.7);
    expect(g).toBeLessThan(1.0);
  }
  expect([1, 2, 3, 4, 5, 6].map(stageAt)).toEqual([0, 1, 1, 2, 2, 3]);
  expect(sweatAt(1)).toBe(0);
  expect(sweatAt(2)).toBe(0);
  expect(sweatAt(3)).toBeGreaterThan(0);
  expect(moved).toBe(false);
  expect(log.some((e) => e.hs)).toBe(true);
  expect(log[endI].shakes).toBe(0);
  const s = await st(page);
  expect(s.juice.lastSfxDetune).toBeLessThan(-300);
  expect(s.juice.lastSfxVolume).toBeGreaterThan(0);
  // dọn UI: không thanh, không số, không nấc dở
  expect(s.till.bars).toEqual([]);
  expect(s.till.queueLabels).toEqual([]);
  expect(s.till.stages).toEqual([]);
  expect(s.till.finishes).toBe(1);
  await page.screenshot({ path: join(SHOTS, 'qa-t002b-real-done.png') });
});

test('B2 WASD đúng frame chạm của nhát cuối → nhát đó không tính (5/6), đi được ngay; frame sau chạm → ô xong', async ({ page }) => {
  await tune(page, { strikeSeconds: 0.3 });
  await tp(page, 14, 12);
  // Cài "bẫy": ngay trước update của frame mà nhát cuối SẼ chạm, bắn keydown D (Phaser đặt isDown ngay khi nhận sự kiện).
  await page.evaluate(() => {
    const sc = (window as any).__game.scene.getScene('Garden');
    const w = window as any;
    const origFn = sc.sys.sceneUpdate;
    const orig = (t: number, d: number) => origFn.call(sc, t, d);
    w.__trap = { mode: 'onImpact', fired: false, info: null };
    const fire = (type: string) => {
      const ev = new KeyboardEvent(type, { key: 'd', code: 'KeyD', bubbles: true });
      Object.defineProperty(ev, 'keyCode', { get: () => 68 });
      Object.defineProperty(ev, 'which', { get: () => 68 });
      window.dispatchEvent(ev);
    };
    w.__fire = fire;
    sc.sys.sceneUpdate = (time: number, delta: number) => {
      const a = sc.action;
      const tr = w.__trap;
      if (!tr.fired && a.current && sc.hitStop <= 0) {
        const thr = sc.tillParams.duration * sc.tillParams.impactAt;
        const p = sc.farm.plots.find((q: any) => q.x === a.current.x && q.y === a.current.y);
        if (tr.mode === 'onImpact' && a.strikesLeft === 1 && !a.impacted && a.elapsed + delta / 1000 >= thr) {
          tr.fired = true;
          tr.info = { strikesBefore: p.tillStrikes, elapsed: a.elapsed, delta };
          fire('keydown');
        }
        if (tr.mode === 'afterImpact' && a.strikesLeft === 1 && a.impacted) {
          tr.fired = true;
          tr.info = { strikesBefore: p.tillStrikes, elapsed: a.elapsed, delta };
          fire('keydown');
        }
      }
      orig(time, delta);
    };
  });
  await click(page, 14, 13);
  await expect.poll(async () => page.evaluate(() => (window as any).__trap.fired), { timeout: 20_000 }).toBe(true);
  await waitFrames(page, 3);
  let s = await st(page);
  const p1 = await plot(page, 14, 13);
  const info1 = await page.evaluate(() => (window as any).__trap.info);
  console.log('B2 onImpact', info1, p1, s.action, s.till.bars);
  expect(p1).toMatchObject({ soil: 'untilled', tillStrikes: 5 });
  expect(s.action.busy).toBe(false);
  expect(s.till.finishes).toBe(0);
  await waitFrames(page, 10);
  const moved = (await st(page)).footX - s.footX;
  await page.evaluate(() => (window as any).__fire('keyup'));
  expect(moved).toBeGreaterThan(2); // đi được
  s = await st(page);
  expect(s.till.bars.find((b: any) => b.x === 14 && b.y === 13)).toMatchObject({ filled: 5, alpha: 0.5 });
  await page.screenshot({ path: join(SHOTS, 'qa-t002b-abandon-5of6.png') });

  // Biến thể: phím đến 1 frame SAU khi nhát cuối đã chạm (đang nảy về) → ô đã xong, không kẹt.
  await tp(page, 14, 12);
  await page.evaluate(() => {
    (window as any).__trap = { mode: 'afterImpact', fired: false, info: null };
  });
  await click(page, 14, 13); // làm tiếp 1 nhát còn lại
  await expect.poll(async () => page.evaluate(() => (window as any).__trap.fired), { timeout: 20_000 }).toBe(true);
  await waitFrames(page, 3);
  await page.evaluate(() => (window as any).__fire('keyup'));
  s = await st(page);
  console.log('B2 afterImpact', await page.evaluate(() => (window as any).__trap.info), await plot(page, 14, 13), s.action);
  expect(await plot(page, 14, 13)).toMatchObject({ soil: 'tilled', tillStrikes: 6 });
  expect(s.action.busy).toBe(false);
  expect(s.till.finishes).toBe(1);
  await waitFrames(page, 40);
  expect((await st(page)).till.bars).toEqual([]);
});

test('B3 bỏ dở rồi click ô khác; ô dở giữ thanh mờ; click ô dở khi hàng chờ đang có → vào hàng, tới lượt làm đúng số nhát còn lại', async ({ page }) => {
  await tune(page, { strikeSeconds: 0.35 });
  await tp(page, 14, 12);
  await click(page, 13, 13);
  await waitStrikes(page, 13, 13, 3);
  await page.keyboard.down('ArrowRight'); // mũi tên cũng bỏ dở
  await waitFrames(page, 4);
  await page.keyboard.up('ArrowRight');
  const a = await plot(page, 13, 13);
  expect(a.soil).toBe('untilled');
  expect(a.tillStrikes).toBeGreaterThanOrEqual(3);
  expect(a.tillStrikes).toBeLessThan(6);
  const aStrikes = a.tillStrikes;
  await tp(page, 14, 12);
  // click ô khác (B = 15,13) → bắt đầu từ 0
  await tune(page, { strikeSeconds: 20 }); // nhát dài trong lúc xếp hàng (máy test chậm/nhanh không ảnh hưởng)
  await click(page, 15, 13);
  let s = await st(page);
  expect(s.action.current).toEqual({ x: 15, y: 13 });
  expect(s.action.strikesLeft).toBe(6);
  expect((await plot(page, 15, 13)).tillStrikes).toBe(0);
  // ô dở A vẫn còn thanh mờ
  expect(s.till.bars.find((b: any) => b.x === 13 && b.y === 13)).toMatchObject({ filled: aStrikes, alpha: 0.5 });
  // xếp hàng: C = 14,13 rồi A (ô dở)
  await click(page, 14, 13);
  await click(page, 13, 13);
  s = await st(page);
  expect(s.action.queue).toEqual([{ x: 14, y: 13 }, { x: 13, y: 13 }]);
  expect(s.till.queueLabels).toEqual(expect.arrayContaining([{ x: 14, y: 13, text: '1' }, { x: 13, y: 13, text: '2' }]));
  await page.screenshot({ path: join(SHOTS, 'qa-t002b-queue-with-partial.png') });
  await tune(page, { strikeSeconds: 0.2 });
  // chờ tới lượt A
  await expect.poll(async () => (await st(page)).action.current, { timeout: 30_000, intervals: [20] }).toEqual({ x: 13, y: 13 });
  s = await st(page);
  console.log('B3 A start', s.action, aStrikes);
  // Lúc poll thấy A bắt đầu, máy test chậm có thể đã qua 1 nhát (BUG-006) → chỉ đòi "không quá số nhát còn lại";
  // số nhát đúng được kiểm chặt ở tổng juice.tills bên dưới.
  expect(s.action.strikesLeft).toBeLessThanOrEqual(6 - aStrikes);
  expect(s.action.strikesLeft + s.action.strikesDone).toBeGreaterThanOrEqual(6 - aStrikes);
  await waitIdle(page);
  s = await st(page);
  expect(s.farm.tilled).toBe(3);
  expect(s.till.finishes).toBe(3);
  expect(s.juice.tills).toBe(aStrikes + 6 + 6 + (6 - aStrikes)); // không nhát thừa / thiếu
});

test('B4 click ô đã cuốc (rảnh & đang bận) không làm gì; spam click cùng ô đang cuốc không thêm hàng chờ/nhát', async ({ page }) => {
  await tune(page, { strikeSeconds: 0.2 });
  await tp(page, 14, 12);
  await click(page, 14, 13);
  await waitIdle(page);
  expect((await plot(page, 14, 13)).soil).toBe('tilled');
  const before = await st(page);
  await click(page, 14, 13); // ô đã cuốc, đang rảnh
  await waitFrames(page, 10);
  let s = await st(page);
  expect(s.action.busy).toBe(false);
  expect(s.juice.tills).toBe(before.juice.tills);
  expect(s.action.dragKind).toBe(null);
  // đang bận ô 13,13 → click ô đã cuốc 14,13 không vào hàng
  await tune(page, { strikeSeconds: 20 });
  await click(page, 13, 13);
  await click(page, 14, 13);
  s = await st(page);
  expect(s.action.queue).toEqual([]);
  // spam click ô đang cuốc 15 lần thật nhanh
  const p = await toPage(page, 13, 13);
  await page.mouse.move(p.x, p.y);
  for (let i = 0; i < 15; i++) await page.mouse.click(p.x, p.y);
  await waitFrames(page, 3);
  s = await st(page);
  expect(s.action.current).toEqual({ x: 13, y: 13 });
  expect(s.action.queue).toEqual([]);
  expect(s.till.queueLabels).toEqual([]);
  await tune(page, { strikeSeconds: 0.2 });
  await waitIdle(page);
  await waitFrames(page, 10);
  s = await st(page);
  expect((await plot(page, 13, 13)).tillStrikes).toBe(6);
  expect(s.juice.tills).toBe(12);
  expect(s.till.finishes).toBe(2);
});

test('B5 hàng chờ có ô bị ra ngoài tầm (dịch nhân vật giữa chừng) → tới lượt bị bỏ, ô trong tầm vẫn làm', async ({ page }) => {
  await tune(page, { strikeSeconds: 20 });
  await tp(page, 14, 14);
  await click(page, 14, 14); // ô dưới chân
  await click(page, 15, 15);
  await click(page, 13, 13);
  let s = await st(page);
  expect(s.action.queue).toEqual([{ x: 15, y: 15 }, { x: 13, y: 13 }]);
  // dịch nhân vật sang (12,12): 15,15 ra ngoài tầm (4.24 ô), 13,13 vẫn trong (1.41 ô). Camera không cần ổn định.
  await page.evaluate(() => (window as any).__game.scene.getScene('Garden').debugTeleport(12, 12));
  await tune(page, { strikeSeconds: 0.2 });
  await expect.poll(async () => (await st(page)).action.current, { timeout: 30_000, intervals: [20] }).toEqual({ x: 13, y: 13 });
  await waitIdle(page);
  s = await st(page);
  console.log('B5', s.farm.plots.filter((p: any) => p.tillStrikes > 0));
  expect((await plot(page, 15, 15)).tillStrikes).toBe(0);
  expect((await plot(page, 13, 13)).soil).toBe('tilled');
  expect((await plot(page, 14, 14)).soil).toBe('tilled');
  expect(s.till.queueLabels).toEqual([]);
});

test('B6 tab ẩn giữa nhát (mô phỏng: trình duyệt ngừng rAF = loop.sleep, kèm visibilitychange) → đứng, quay lại không nhảy cóc, đủ 6 nhát', async ({ page }) => {
  // Playwright luôn giữ trang ở trạng thái "visible" (kể cả --headed, tab khác bringToFront) nên không ẩn tab thật được.
  // Chrome/Firefox ngừng requestAnimationFrame ở tab ẩn → mô phỏng bằng loop.sleep()/wake() + sự kiện visibilitychange.
  await tune(page, { strikeSeconds: 0.5 });
  await tp(page, 14, 12);
  await click(page, 14, 13);
  await waitStrikes(page, 14, 13, 2);
  const setHidden = (h: boolean) =>
    page.evaluate((h) => {
      const g = (window as any).__game;
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => h });
      Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => (h ? 'hidden' : 'visible') });
      if (h) {
        document.dispatchEvent(new Event('visibilitychange'));
        g.loop.sleep();
      } else {
        g.loop.wake();
        document.dispatchEvent(new Event('visibilitychange'));
      }
    }, h);
  await setHidden(true);
  const before = await st(page);
  await page.waitForTimeout(2500);
  const after = await st(page);
  await setHidden(false);
  // T-005: mất focus / ẩn tab → game tự Tạm dừng (pauseOnFocusLost); quay lại vẫn dừng → Esc để chơi tiếp.
  await expect.poll(() => page.evaluate(() => (window as any).__game.scene.getScene('Garden').debugState.pause.menuOpen)).toBe(true);
  await page.keyboard.press('Escape');
  await expect.poll(() => page.evaluate(() => (window as any).__game.scene.getScene('Garden').debugState.pause.menuOpen)).toBe(false);
  await waitFrames(page, 2);
  const resumed = await st(page);
  console.log('B6', { p0: before.action.progress, p1: after.action.progress, p2: resumed.action.progress, k0: before.juice.tills, k1: after.juice.tills, k2: resumed.juice.tills });
  expect(after.juice.tills).toBe(before.juice.tills);
  expect(after.action.progress).toBeCloseTo(before.action.progress, 5);
  expect(resumed.juice.tills - after.juice.tills).toBeLessThanOrEqual(1);
  expect(resumed.action.progress - after.action.progress).toBeLessThan(0.5); // không dồn 2.5 s vào một frame
  await waitIdle(page);
  const s = await st(page);
  expect((await plot(page, 14, 13)).tillStrikes).toBe(6);
  expect(s.juice.tills).toBe(6);
  expect(s.till.cancels).toBe(0);
});

test('B6b mất focus cửa sổ (blur, tab vẫn hiện) giữa nhát → (quan sát) cuốc có dừng không', async ({ page }) => {
  await tune(page, { strikeSeconds: 0.5 });
  await tp(page, 14, 12);
  await click(page, 14, 13);
  await waitStrikes(page, 14, 13, 1);
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  const k0 = (await st(page)).juice.tills;
  await waitFrames(page, 60);
  const k1 = (await st(page)).juice.tills;
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  console.log('B6b blur', { k0, k1, paused: k1 === k0 });
  // T-005: blur (Alt+Tab) → tự Tạm dừng → cuốc phải đứng yên.
  expect(k1).toBe(k0);
  // T-005: mất focus / ẩn tab → game tự Tạm dừng (pauseOnFocusLost); quay lại vẫn dừng → Esc để chơi tiếp.
  await expect.poll(() => page.evaluate(() => (window as any).__game.scene.getScene('Garden').debugState.pause.menuOpen)).toBe(true);
  await page.keyboard.press('Escape');
  await expect.poll(() => page.evaluate(() => (window as any).__game.scene.getScene('Garden').debugState.pause.menuOpen)).toBe(false);
  await waitIdle(page);
});

test('B7 chuột phải giữa lúc cuốc không ngắt, không mở menu, không vào hàng chờ', async ({ page }) => {
  await tune(page, { strikeSeconds: 0.4 });
  await tp(page, 14, 12);
  await page.evaluate(() => {
    (window as any).__ctx = [];
    window.addEventListener('contextmenu', (e) => (window as any).__ctx.push(e.defaultPrevented));
  });
  await click(page, 14, 13);
  await waitStrikes(page, 14, 13, 2);
  await tune(page, { strikeSeconds: 20 });
  await click(page, 14, 13, 'right');
  await click(page, 13, 13, 'right'); // chuột phải ô khác cũng không xếp hàng
  let s = await st(page);
  expect(s.action.current).toEqual({ x: 14, y: 13 });
  expect(s.action.queue).toEqual([]);
  expect(s.till.cancels).toBe(0);
  await tune(page, { strikeSeconds: 0.2 });
  await waitIdle(page);
  const ctx: boolean[] = await page.evaluate(() => (window as any).__ctx);
  console.log('B7 contextmenu defaultPrevented', ctx);
  expect(ctx.length).toBeGreaterThan(0);
  expect(ctx.every(Boolean)).toBe(true);
  s = await st(page);
  expect((await plot(page, 14, 13)).soil).toBe('tilled');
  expect((await plot(page, 13, 13)).tillStrikes).toBe(0);
});

test('B8 cuốc xong cả 9 ô (hàng chờ ≤3, số 1/2/3), sau cùng không còn thanh/số/nấc; ảnh', async ({ page }) => {
  test.setTimeout(120_000);
  await tune(page, { strikeSeconds: 0.15 });
  await tp(page, 14, 14);
  const order: [number, number][] = [];
  for (let y = 13; y <= 15; y++) for (let x = 13; x <= 15; x++) order.push([x, y]);
  let maxQ = 0;
  let sawLabels: string[] = [];
  for (let i = 0; i < order.length; i += 4) {
    await tune(page, { strikeSeconds: 20 });
    for (const [x, y] of order.slice(i, i + 4)) {
      await click(page, x, y);
      const s = await st(page);
      maxQ = Math.max(maxQ, s.action.queued);
      if (s.till.queueLabels.length > sawLabels.length) sawLabels = s.till.queueLabels.map((l: any) => l.text);
      if (s.action.queued === 3 && i === 0) await page.screenshot({ path: join(SHOTS, 'qa-t002b-all9-queue.png') });
    }
    await tune(page, { strikeSeconds: 0.15 });
    await waitIdle(page);
  }
  await waitIdle(page);
  await waitFrames(page, 40);
  const s = await st(page);
  console.log('B8', { maxQ, sawLabels, tilled: s.farm.tilled, tills: s.juice.tills });
  expect(maxQ).toBe(3);
  expect(sawLabels).toEqual(['1', '2', '3']);
  expect(s.farm.tilled).toBe(9);
  expect(s.juice.tills).toBe(54);
  expect(s.till.bars).toEqual([]);
  expect(s.till.queueLabels).toEqual([]);
  expect(s.till.stages).toEqual([]);
  expect(s.juice.shakes).toBe(0);
  await page.mouse.move(10, 10);
  await waitFrames(page, 3);
  await page.screenshot({ path: join(SHOTS, 'qa-t002b-all9-done.png') });
});

test('B9 giữ chuột rê qua 5 ô: nhận 1+3; giữ chuột đứng trên ô thứ 5 tới khi có chỗ → (quan sát) có tự xếp hàng không', async ({ page }) => {
  await tune(page, { strikeSeconds: 20 });
  await tp(page, 14, 14);
  const path: [number, number][] = [[13, 13], [14, 13], [15, 13], [15, 14], [13, 14]];
  let p = await toPage(page, ...path[0]);
  await page.mouse.move(p.x, p.y);
  await waitFrames(page, 2);
  await page.mouse.down();
  for (const t of path.slice(1)) {
    p = await toPage(page, ...t);
    await page.mouse.move(p.x, p.y, { steps: 4 });
    await waitFrames(page, 3);
  }
  let s = await st(page);
  expect(s.action.current).toEqual({ x: 13, y: 13 });
  expect(s.action.queue).toEqual([{ x: 14, y: 13 }, { x: 15, y: 13 }, { x: 15, y: 14 }]);
  // vẫn giữ chuột trên ô thứ 5 (13,14) tới khi ô đầu xong
  await tune(page, { strikeSeconds: 0.25 });
  await expect.poll(async () => (await st(page)).action.current, { timeout: 20_000, intervals: [20] }).toEqual({ x: 14, y: 13 });
  await waitFrames(page, 3);
  s = await st(page);
  console.log('B9 sau khi có chỗ, vẫn giữ chuột trên ô thứ 5:', s.action.queue);
  await page.mouse.up();
  await waitIdle(page);
  s = await st(page);
  console.log('B9 tilled', s.farm.tilled);
});

test('B10 chạm phím D rất nhanh (keydown+keyup liền nhau) khi đang cuốc → có bỏ dở không', async ({ page }) => {
  await tune(page, { strikeSeconds: 0.6 });
  await tp(page, 14, 12);
  await click(page, 14, 13);
  await waitStrikes(page, 14, 13, 1);
  // keydown + keyup trong cùng một tác vụ JS (giống chạm phím cực nhanh lọt giữa hai frame)
  await page.evaluate(() => {
    for (const type of ['keydown', 'keyup']) {
      const ev = new KeyboardEvent(type, { key: 'd', code: 'KeyD', bubbles: true });
      Object.defineProperty(ev, 'keyCode', { get: () => 68 });
      window.dispatchEvent(ev);
    }
  });
  await waitFrames(page, 3);
  const s = await st(page);
  console.log('B10 quick tap', { busy: s.action.busy, cancels: s.till.cancels });
  // BUG-007 đã sửa: phím đi ghi theo sự kiện keydown → chạm cực nhanh vẫn bỏ dở.
  expect(s.action.busy).toBe(false);
  expect(s.till.cancels).toBe(1);
  await waitIdle(page);
});
