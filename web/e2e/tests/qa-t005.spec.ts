// QA độc lập T-005 — đồng hồ ngày, màu trời, Tạm dừng (Esc / đổi tab / blur). Ca rìa bổ sung cho time.spec.ts.
// Chờ theo TRẠNG THÁI / frame game (BUG-006); các ca "đứng yên" chờ một khoảng thật để chứng minh không có gì đổi.
import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SHOTS = join(dirname(fileURLToPath(import.meta.url)), '..', 'screenshots');
const PROD = !!process.env.QA_PROD;
const HOURS_PER_SEC = 18 / 600;

/* eslint-disable @typescript-eslint/no-explicit-any */
type Any = any;

async function state(page: Page): Promise<Any | null> {
  return page.evaluate(() => {
    const g = (window as Any).__game;
    if (!g || !(g.scene.isActive('Garden') || g.scene.isPaused('Garden'))) return null;
    const s = g.scene.getScene('Garden').debugState;
    return s?.gardenReady && s.hud ? s : null;
  });
}
const st = async (page: Page): Promise<Any> => (await state(page))!;
async function call<T = unknown>(page: Page, method: string, ...args: unknown[]): Promise<T> {
  return page.evaluate(
    ([m, a]) => {
      const sc = (window as Any).__game.scene.getScene('Garden');
      return sc[m as string].apply(sc, a);
    },
    [method, args] as const,
  ) as Promise<T>;
}
async function waitFrames(page: Page, n: number): Promise<void> {
  const start = await page.evaluate(() => (window as Any).__game.loop.frame);
  await page.waitForFunction((t) => (window as Any).__game.loop.frame >= t, start + n, { timeout: 30_000 });
}
async function teleportAndSettle(page: Page, tx: number, ty: number): Promise<void> {
  await call(page, 'debugTeleport', tx, ty);
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
async function gameToPage(page: Page, g: { x: number; y: number }) {
  const box = (await page.locator('canvas').boundingBox())!;
  return { x: box.x + (g.x * box.width) / 1920, y: box.y + (g.y * box.height) / 1080 };
}
async function tileToPage(page: Page, tx: number, ty: number) {
  return gameToPage(page, await call<{ x: number; y: number }>(page, 'debugTileToScreen', tx, ty));
}
async function press(page: Page, key: string) {
  await page.keyboard.press(key);
  await waitFrames(page, 3);
}
async function setPhaserPaused(page: Page, paused: boolean) {
  await page.evaluate((p) => {
    const g = (window as Any).__game;
    for (const k of ['Garden', 'GardenHud']) p ? g.scene.pause(k) : g.scene.resume(k);
  }, paused);
}
async function shot(page: Page, name: string, freeze = true) {
  if (freeze) await setPhaserPaused(page, true);
  await page.screenshot({ path: join(SHOTS, name) });
  if (freeze) await setPhaserPaused(page, false);
}
async function simulateHidden(page: Page, hidden: boolean) {
  await page.evaluate((h) => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => h });
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => (h ? 'hidden' : 'visible') });
    document.dispatchEvent(new Event('visibilitychange'));
  }, hidden);
}
const plot = (s: Any, x: number, y: number) => s.farm.plots.find((p: Any) => p.x === x && p.y === y);
const overlap = (a: Any, b: Any) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
const inside = (a: Any, b: Any) => a.x >= b.x - 0.5 && a.y >= b.y - 0.5 && a.x + a.w <= b.x + b.w + 0.5 && a.y + a.h <= b.y + b.h + 0.5;

let errors: string[] = [];
let failedReq: string[] = [];
test.beforeEach(async ({ page }) => {
  errors = [];
  failedReq = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`[console.error] ${m.text()} @ ${m.location().url}`);
  });
  page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`));
  page.on('response', (r) => {
    if (r.status() >= 400) failedReq.push(`${r.status()} ${r.url()}`);
  });
  await page.goto('/');
  await expect.poll(() => state(page).then((s) => s !== null), { timeout: 30_000 }).toBe(true);
  mkdirSync(SHOTS, { recursive: true });
});
test.afterEach(() => {
  console.log('failed requests:', failedReq);
  expect(errors, errors.join('\n')).toEqual([]);
});

test('Q1 tốc độ đồng hồ: elapsedSeconds khớp Σ rawDelta và giờ thật (~30 s), 1 giờ game ≈ 33,3 s', async ({ page }) => {
  test.setTimeout(120_000);
  await page.evaluate(() => {
    const g = (window as Any).__game;
    (window as Any).__qa = { sum: 0, frames: 0, clamped: 0 };
    g.events.on('poststep', () => {
      const q = (window as Any).__qa;
      const r = g.loop.rawDelta / 1000;
      q.sum += Math.min(r, 0.25);
      q.frames++;
      if (r > 0.25) q.clamped++;
    });
  });
  await waitFrames(page, 5);
  const a = await page.evaluate(() => {
    const g = (window as Any).__game;
    return { e: g.scene.getScene('Garden').dayClock.elapsedSeconds, t: performance.now(), q: { ...(window as Any).__qa }, h: g.scene.getScene('Garden').clockHour };
  });
  await page.waitForTimeout(30_000);
  const b = await page.evaluate(() => {
    const g = (window as Any).__game;
    return { e: g.scene.getScene('Garden').dayClock.elapsedSeconds, t: performance.now(), q: { ...(window as Any).__qa }, h: g.scene.getScene('Garden').clockHour, fps: g.loop.actualFps };
  });
  const clockRan = b.e - a.e;
  const real = (b.t - a.t) / 1000;
  const rawSum = b.q.sum - a.q.sum;
  const frames = b.q.frames - a.q.frames;
  console.log('Q1', { clockRan, real, rawSum, frames, fpsAvg: frames / real, clamped: b.q.clamped - a.q.clamped, hourRan: b.h - a.h, actualFps: b.fps });
  // Đồng hồ = Σ rawDelta (kẹp 0.25) trong cùng khoảng (lệch ≤ 1–2 frame vì đọc ở thời điểm khác frame).
  expect(Math.abs(clockRan - rawSum)).toBeLessThan(0.3);
  // So với giờ thật: lệch < 3 %.
  expect(clockRan / real).toBeGreaterThan(0.97);
  expect(clockRan / real).toBeLessThan(1.03);
  // Giờ game = 0.03 h/giây thật.
  expect((b.h - a.h) / clockRan).toBeCloseTo(HOURS_PER_SEC, 5);
  const s = await st(page);
  expect(s.hud.clockText).toBe(s.time.clockText);
});

test('Q2 đồng hồ đứng khi gùi mở / Tạm dừng (đếm theo frame), chạy khi cuốc', async ({ page }) => {
  test.setTimeout(90_000);
  await press(page, 'e');
  let e0 = (await st(page)).time.elapsedSeconds;
  await waitFrames(page, 40);
  expect((await st(page)).time.elapsedSeconds).toBe(e0);
  await press(page, 'e');
  await press(page, 'Escape');
  e0 = (await st(page)).time.elapsedSeconds;
  await waitFrames(page, 40);
  let s = await st(page);
  expect(s.pause.menuOpen).toBe(true);
  expect(s.time.elapsedSeconds).toBe(e0);
  await press(page, 'Escape');
  await teleportAndSettle(page, 12, 14);
  await call(page, 'debugSetTillTuning', { strikeSeconds: 0.85 });
  const p = await tileToPage(page, 13, 14);
  await page.mouse.click(p.x, p.y);
  await expect.poll(async () => (await st(page)).action.kind, { timeout: 10_000 }).toBe('till');
  const t0 = await page.evaluate(() => performance.now());
  e0 = (await st(page)).time.elapsedSeconds;
  await expect.poll(async () => (await st(page)).action.strikesDone, { timeout: 15_000 }).toBeGreaterThanOrEqual(3);
  s = await st(page);
  const real = ((await page.evaluate(() => performance.now())) - t0) / 1000;
  console.log('Q2 cuốc: clock ran', s.time.elapsedSeconds - e0, 'real', real);
  expect(s.action.kind).toBe('till');
  expect(s.time.elapsedSeconds - e0).toBeGreaterThan(real * 0.8);
});

test('Q3 F9 liên tục tới quá 24:00: kẹp 24:00, chạm 1 lần, ngủ gục (T-007), F9 lúc ngủ gục không tác dụng, sáng ra đi lại được', async ({ page }) => {
  test.setTimeout(120_000);
  test.skip(PROD, 'F9 chỉ có ở bản dev');
  // T-007 thay hành vi tạm của T-005 ("đứng ở 24:00, chơi tiếp") bằng ngủ gục.
  const nightPhase = () =>
    page.evaluate(() => (window as Any).__game.scene.getScene('Garden').debugState.night.phase as string);
  const hours: number[] = [];
  let s = await st(page);
  for (let i = 0; i < 22 && s.time.hour < 24; i++) {
    await press(page, 'F9');
    s = await st(page); // ảnh chụp trạng thái NGAY sau lần bấm chạm 24h (ngủ gục chỉ kéo dài vài giây)
    hours.push(s.time.hour);
  }
  console.log('Q3 hours', hours.map((h) => h.toFixed(2)).join(' '), 'presses', s.time.devHourPresses);
  for (let i = 1; i < hours.length; i++) expect(hours[i]).toBeGreaterThanOrEqual(hours[i - 1]);
  expect(Math.max(...hours)).toBe(24);
  expect(s.time.dayEndHits).toBe(1);
  expect(s.time.day).toBe(1);
  expect(s.time.hour).toBe(24);
  expect(s.time.clockText).toBe('24:00');
  expect(s.hud.clockText).toBe('24:00');
  expect(s.time.phase).toBe('night');
  expect(s.hud.clockIcon).toBe('moon');
  expect(await nightPhase()).not.toBe('none'); // đang ngủ gục (máy chậm: có thể đã sang tổng kết)
  await shot(page, 'qa-t005-24h.png');
  // Bấm dồn F9 lúc ngủ gục / tổng kết: bị bỏ hết (không đếm, không cộng giờ, không qua thêm ngày).
  const presses0 = s.time.devHourPresses;
  for (let i = 0; i < 10; i++) await page.keyboard.press('F9');
  await waitFrames(page, 5);
  expect((await st(page)).time.devHourPresses).toBe(presses0);
  expect((await st(page)).time.day).toBeLessThanOrEqual(2);
  // Ngủ gục → tổng kết → Enter (lần 1 có thể chỉ hiện hết) → sáng ngày 2.
  await expect.poll(nightPhase, { timeout: 15_000 }).toBe('summary');
  await press(page, 'Enter');
  if ((await nightPhase()) === 'summary') await press(page, 'Enter');
  await expect.poll(nightPhase, { timeout: 10_000 }).toBe('none');
  expect((await st(page)).time.day).toBe(2);
  expect((await st(page)).time.dayEndHits).toBe(1);
  // đi lại vẫn được
  await teleportAndSettle(page, 12, 14);
  const x0 = (await st(page)).footX;
  await page.keyboard.down('a');
  await waitFrames(page, 15);
  await page.keyboard.up('a');
  expect((await st(page)).footX).toBeLessThan(x0 - 10);
});

test('Q4 màu trời đúng khung giờ GDD §3.1 tại các mốc biên + chuyển mượt (bước 0.01 giờ)', async ({ page }) => {
  test.setTimeout(120_000);
  // Đóng băng đồng hồ bằng gùi để giờ đặt không trôi
  await press(page, 'e');
  const marks = [6, 10.9, 11, 16.9, 17, 18.9, 19, 23.9, 24];
  const out: Any[] = [];
  for (const h of marks) {
    await call(page, 'debugSetHour', h);
    await waitFrames(page, 2);
    const s = await st(page);
    out.push({ h, phase: s.time.phase, color: s.sky.color.toString(16), alpha: +s.sky.alpha.toFixed(3), icon: s.hud.clockIcon, clock: s.hud.clockText });
  }
  console.log('Q4 marks', JSON.stringify(out));
  const expectPhase: Record<number, string> = { 6: 'morning', 10.9: 'morning', 11: 'midday', 16.9: 'midday', 17: 'dusk', 18.9: 'dusk', 19: 'night', 23.9: 'night', 24: 'night' };
  for (const o of out) expect(o.phase, `giờ ${o.h}`).toBe(expectPhase[o.h]);
  for (const o of out) expect(o.icon, `icon giờ ${o.h}`).toBe(o.h >= 19 ? 'moon' : 'sun');
  for (const o of out) expect(o.alpha).toBeLessThanOrEqual(0.45 + 1e-6);
  // Chuyển mượt: quét 6→24 bước 0.01 giờ (≈ 0.33 s thật ≈ 20 frame ở 60 FPS); lệch giữa 2 bước nhỏ.
  const scan = await page.evaluate(() => {
    const sc = (window as Any).__game.scene.getScene('Garden');
    const res: { h: number; c: number; a: number }[] = [];
    for (let i = 0; i <= 1800; i++) {
      const h = 6 + i * 0.01;
      sc.debugSetHour(h);
      const o = sc.skyOverlay;
      res.push({ h, c: o.fillColor, a: o.visible ? o.fillAlpha : 0 });
    }
    return res;
  });
  let maxDa = 0;
  let maxDc = 0;
  let at = 0;
  let atC = 0;
  for (let i = 1; i < scan.length; i++) {
    const da = Math.abs(scan[i].a - scan[i - 1].a);
    if (da > maxDa) {
      maxDa = da;
      at = scan[i].h;
    }
    // chỉ quan tâm màu khi lớp phủ đủ thấy
    if (scan[i].a > 0.02 && scan[i - 1].a > 0.02) {
      const ch = (c: number, s: number) => (c >> s) & 0xff;
      const dc = Math.max(...[16, 8, 0].map((s) => Math.abs(ch(scan[i].c, s) - ch(scan[i - 1].c, s))));
      if (dc > maxDc) {
        maxDc = dc;
        atC = scan[i].h;
      }
    }
  }
  console.log('Q4 smooth', { maxDa, at, maxDc, atC });
  expect(maxDa).toBeLessThan(0.005); // 0.01 giờ → độ đục đổi < 0.005
  expect(maxDc).toBeLessThan(6); // mỗi kênh màu đổi < 6/255 mỗi 0.01 giờ
  // Ảnh 4 khung
  await press(page, 'e');
  await teleportAndSettle(page, 12, 13);
  for (const [h, n] of [
    [7, 'sang'],
    [13, 'trua'],
    [18, 'hoang-hon'],
    [23.9, 'toi'],
  ] as const) {
    await call(page, 'debugSetHour', h);
    await waitFrames(page, 3);
    await shot(page, `qa-t005-sky-${n}.png`);
  }
});

test('Q5 nhấp nháy đỏ đúng từ 23:00 (22:59 chưa)', async ({ page }) => {
  test.skip(PROD);
  await press(page, 'e'); // đứng đồng hồ
  await call(page, 'debugSetHour', 22 + 59.5 / 60);
  await waitFrames(page, 2);
  let s = await st(page);
  expect(s.hud.clockText).toBe('22:59');
  expect(s.time.warn).toBe(false);
  const seen = new Set<string>();
  for (let i = 0; i < 25; i++) {
    seen.add((await st(page)).hud.clockColor);
    await page.waitForTimeout(60);
  }
  expect([...seen]).toEqual(['#efe4c8']);
  await call(page, 'debugSetHour', 23);
  await waitFrames(page, 2);
  s = await st(page);
  expect(s.hud.clockText).toBe('23:00');
  expect(s.time.warn).toBe(true);
  seen.clear();
  await expect
    .poll(
      async () => {
        seen.add((await st(page)).hud.clockColor);
        return seen.size;
      },
      { timeout: 10_000, intervals: [50] },
    )
    .toBe(2);
  // nháy cả khi gùi mở (đồng hồ dừng) và khi Tạm dừng — ghi nhận
  await press(page, 'e');
  await press(page, 'Escape');
  seen.clear();
  for (let i = 0; i < 25; i++) {
    seen.add((await st(page)).hud.clockColor);
    await page.waitForTimeout(60);
  }
  console.log('Q5 màu khi Tạm dừng lúc 23h', [...seen]);
});

test('Q6 Esc: thứ tự gùi/Tạm dừng; blur khi gùi mở → Esc đóng Tạm dừng rồi gùi; Esc dồn 2 lần', async ({ page }) => {
  await press(page, 'e');
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  let s = await st(page);
  expect(s.pause.menuOpen).toBe(true);
  expect(s.bagOpen).toBe(true);
  await shot(page, 'qa-t005-pause-over-bag.png');
  await press(page, 'Escape');
  s = await st(page);
  expect(s.pause.menuOpen).toBe(false);
  expect(s.bagOpen).toBe(true);
  expect(s.time.stopped).toBe(true);
  // E trong lúc gùi mở vẫn đóng gùi
  await press(page, 'Escape');
  s = await st(page);
  expect(s.bagOpen).toBe(false);
  expect(s.pause.menuOpen).toBe(false);
  // hidden khi đã Tạm dừng: không mở lần 2
  await press(page, 'Escape');
  const opens = (await st(page)).pause.opens;
  await simulateHidden(page, true);
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await simulateHidden(page, false);
  s = await st(page);
  expect(s.pause.opens).toBe(opens);
  expect(s.pause.cause).toBe('esc');
  await press(page, 'Escape');
  expect((await st(page)).pause.menuOpen).toBe(false);
  // Esc + Esc trong cùng một tác vụ JS (cùng frame): ghi nhận hành vi
  await page.evaluate(() => {
    for (let i = 0; i < 2; i++) {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, bubbles: true } as Any));
      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'Escape', code: 'Escape', keyCode: 27, bubbles: true } as Any));
    }
  });
  await waitFrames(page, 3);
  console.log('Q6 Esc×2 cùng frame → menuOpen', (await st(page)).pause.menuOpen);
});

test('Q7 Tạm dừng do ẩn tab giữa lúc cuốc + bụi + mồ hôi + bong bóng + chữ bay: mọi thứ đứng yên (2 ảnh giống hệt)', async ({ page }) => {
  test.setTimeout(120_000);
  await teleportAndSettle(page, 12, 14);
  await call(page, 'debugSetTillTuning', { strikeSeconds: 1.2 });
  const p = await tileToPage(page, 13, 14);
  await page.mouse.click(p.x, p.y);
  await page.mouse.move(5, 5);
  await expect.poll(async () => (await st(page)).action.strikesDone, { timeout: 20_000, intervals: [30] }).toBeGreaterThanOrEqual(3);
  // bong bóng chửi + chữ bay "−… Sức"
  await call(page, 'debugSetStamina', 60);
  if (!PROD) await page.keyboard.press('F8');
  await call(page, 'debugSetStamina', 0);
  await waitFrames(page, 2);
  // chờ ngay sau một nhát chạm để có bụi
  const k0 = (await st(page)).action.strikesDone;
  await expect.poll(async () => (await st(page)).action.strikesDone, { timeout: 10_000, intervals: [10] }).toBeGreaterThan(k0);
  await simulateHidden(page, true);
  const s0 = await st(page);
  console.log('Q7 lúc dừng', { bubble: s0.bubble, floats: s0.stamina.floatsActiveY, sweat: s0.till.sweatActive, prog: s0.action.progress, bars: s0.till.bars });
  expect(s0.pause.menuOpen).toBe(true);
  expect(s0.pause.cause).toBe('hidden');
  await waitFrames(page, 3);
  const img1 = await page.screenshot();
  await page.screenshot({ path: join(SHOTS, 'qa-t005-frozen-1.png') });
  await page.waitForTimeout(1500);
  await waitFrames(page, 10);
  const img2 = await page.screenshot();
  await page.screenshot({ path: join(SHOTS, 'qa-t005-frozen-2.png') });
  const s1 = await st(page);
  expect(s1.action.progress).toBe(s0.action.progress);
  expect(s1.action.strikesDone).toBe(s0.action.strikesDone);
  expect(s1.time.elapsedSeconds).toBe(s0.time.elapsedSeconds);
  expect(s1.bubble).toEqual(s0.bubble);
  expect(s1.stamina.floatsActiveY).toEqual(s0.stamina.floatsActiveY);
  expect(s1.till.sweatActive).toBe(s0.till.sweatActive);
  let diff = 0;
  const n = Math.min(img1.length, img2.length);
  for (let i = 0; i < n; i++) if (img1[i] !== img2[i]) diff++;
  console.log('Q7 png bytes differ', diff, img1.length, img2.length);
  expect(img1.equals(img2), 'hai ảnh lúc Tạm dừng phải giống hệt').toBe(true);
  await simulateHidden(page, false);
  const t0 = await page.evaluate(() => performance.now());
  await page.keyboard.press('Escape');
  await expect.poll(async () => (await st(page)).pause.menuOpen, { timeout: 5_000, intervals: [20] }).toBe(false);
  const s2 = await st(page);
  const real = ((await page.evaluate(() => performance.now())) - t0) / 1000;
  expect(s2.time.elapsedSeconds - s0.time.elapsedSeconds).toBeLessThanOrEqual(real + 0.26);
  expect(s2.till.cancels).toBe(0);
});

test('Q8 click "Tiếp tục" nằm đúng trên ô ruộng: không xuyên xuống (click nhanh và giữ chuột)', async ({ page }) => {
  test.setTimeout(90_000);
  // tìm chỗ đứng để ô (13,14) (chưa cuốc) nằm dưới nút Tiếp tục (x 810–1110, y 545–629)
  let found = false;
  for (const [tx, ty] of [
    [12, 14],
    [12, 13],
    [13, 13],
  ]) {
    await teleportAndSettle(page, tx, ty);
    const c = await call<{ x: number; y: number }>(page, 'debugTileToScreen', 13, 14);
    if (c.x > 830 && c.x < 1090 && c.y > 549 && c.y < 625) {
      found = true;
      console.log('Q8 đứng', tx, ty, 'ô 13,14 ở', c);
      break;
    }
  }
  expect(found).toBe(true);
  const c = await call<{ x: number; y: number }>(page, 'debugTileToScreen', 13, 14);
  const pt = await gameToPage(page, c);
  for (const mode of ['fast', 'hold'] as const) {
    await press(page, 'Escape');
    expect((await st(page)).pause.menuOpen).toBe(true);
    await page.mouse.move(pt.x, pt.y);
    await expect.poll(async () => (await st(page)).pause.hoverResume, { timeout: 5_000 }).toBe(true);
    if (mode === 'fast') {
      await page.mouse.down();
      await page.mouse.up();
    } else {
      await page.mouse.down();
      await expect.poll(async () => (await st(page)).pause.menuOpen, { timeout: 5_000 }).toBe(false);
      await waitFrames(page, 20);
      await page.mouse.move(pt.x + 3, pt.y + 2);
      await waitFrames(page, 10);
      await page.mouse.up();
    }
    await waitFrames(page, 15);
    const s = await st(page);
    console.log('Q8', mode, { menu: s.pause.menuOpen, busy: s.action.busy, kind: s.action.kind, strikes: plot(s, 13, 14).tillStrikes });
    expect(s.pause.menuOpen).toBe(false);
    expect(s.action.busy).toBe(false);
    expect(plot(s, 13, 14).tillStrikes).toBe(0);
  }
  // sau khi chơi tiếp, click bình thường vẫn cuốc được
  await page.mouse.move(pt.x, pt.y);
  await page.mouse.down();
  await page.mouse.up();
  await expect.poll(async () => (await st(page)).action.kind, { timeout: 5_000 }).toBe('till');
});

test('Q9 phím WASD/số/click/chuột phải lúc Tạm dừng không có tác dụng sau khi Tiếp tục (cả giữ D qua lúc dừng)', async ({ page }) => {
  test.setTimeout(90_000);
  await teleportAndSettle(page, 12, 14);
  await call(page, 'debugSetSlot', 3, 'khoai-lang', 2);
  await call(page, 'debugSetStamina', 50);
  const s0 = await st(page);
  await press(page, 'Escape');
  for (const k of ['w', 'a', 's', 'd', '5', '9', 'e', 'Tab']) await press(page, k);
  // click ô ruộng (11,13) — tránh vùng nút Tiếp tục (đè ô 13,14 khi đứng 12,14)
  const p = await tileToPage(page, 11, 13);
  await page.mouse.click(p.x, p.y);
  await page.mouse.click(p.x, p.y, { button: 'right' });
  await page.mouse.wheel(0, 100);
  await waitFrames(page, 5);
  const sp = await st(page);
  expect(sp.footX).toBe(s0.footX);
  expect(sp.footY).toBe(s0.footY);
  await press(page, 'Escape');
  await waitFrames(page, 15);
  const s = await st(page);
  expect(s.pause.menuOpen).toBe(false);
  expect(s.footX).toBe(s0.footX);
  expect(s.footY).toBe(s0.footY);
  expect(s.inventory.selected).toBe(s0.inventory.selected);
  expect(s.bagOpen).toBe(false);
  expect(s.action.busy).toBe(false);
  expect(plot(s, 13, 14).tillStrikes).toBe(0);
  expect(s.stamina.eats).toBe(0);
  // Giữ D trong lúc Tạm dừng rồi Tiếp tục mà vẫn giữ → đi (giữ là ý định thật) — ghi nhận
  await press(page, 'Escape');
  await page.keyboard.down('d');
  await waitFrames(page, 10);
  const xs = (await st(page)).footX;
  expect(xs).toBe(s0.footX);
  await press(page, 'Escape');
  await waitFrames(page, 10);
  const xr = (await st(page)).footX;
  await page.keyboard.up('d');
  console.log('Q9 giữ D qua lúc dừng: dx sau khi chơi tiếp', xr - xs);
});

test('Q10 nhạc nền nhỏ lại khi Tạm dừng và về cũ', async ({ page }) => {
  await page.mouse.click(300, 300); // mở khóa âm thanh
  await press(page, '1');
  await expect.poll(async () => (await st(page)).pause.musicVolume, { timeout: 10_000 }).not.toBeNull();
  const v0 = (await st(page)).pause.musicVolume;
  await press(page, 'Escape');
  const v1 = (await st(page)).pause.musicVolume;
  await press(page, 'Escape');
  const v2 = (await st(page)).pause.musicVolume;
  // blur
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  const v3blur = (await st(page)).pause.musicVolume;
  // Phaser treo AudioContext khi blur: gain đặt lịch chỉ áp khi context chạy lại (focus) → đọc sau focus
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect.poll(async () => (await st(page)).pause.musicVolume, { timeout: 5_000 }).toBeCloseTo(0.21, 3);
  console.log('Q10 vol ngay sau blur (context treo)', v3blur, 'menu', (await st(page)).pause.menuOpen);
  const v3 = (await st(page)).pause.musicVolume;
  await press(page, 'Escape');
  const v4 = (await st(page)).pause.musicVolume;
  console.log('Q10', { v0, v1, v2, v3, v4 });
  expect(v0).toBeCloseTo(0.6, 3);
  expect(v1).toBeCloseTo(0.21, 3);
  expect(v2).toBeCloseTo(0.6, 3);
  expect(v3).toBeCloseTo(0.21, 3);
  expect(v4).toBeCloseTo(0.6, 3);
  const playing = await page.evaluate(() => (window as Any).__game.sound.get('music-vuon')?.isPlaying);
  expect(playing).toBe(true);
});

for (const vp of [
  { w: 1920, h: 1080 },
  { w: 1366, h: 768 },
]) {
  test(`Q11 HUD ${vp.w}×${vp.h}: đồng hồ/Sức/hotbar/gợi ý không đè; chữ nằm trong khung; trời không phủ HUD`, async ({ page }) => {
    await page.setViewportSize({ width: vp.w, height: vp.h });
    await waitFrames(page, 10);
    await call(page, 'debugSetHour', 22.5);
    await waitFrames(page, 3);
    const info = await page.evaluate(() => {
      const g = (window as Any).__game;
      const hud = g.scene.getScene('GardenHud');
      const sc = g.scene.getScene('Garden');
      const b = (t: Any) => {
        const r = t.getBounds();
        return { x: r.x, y: r.y, w: r.width, h: r.height };
      };
      const texts = hud.children.list.filter((o: Any) => o.type === 'Text' && o.visible && o.text).map((o: Any) => ({ text: o.text, ...b(o), size: o.style.fontSize }));
      return {
        clockText: b(hud.clockText),
        dayText: b(hud.dayText),
        texts,
        skyDepth: sc.skyOverlay.depth,
        bubbleDepth: sc.bubble.depth,
        barDepth: sc.plotBars[0].depth,
        heroDepth: sc.hero.depth,
        hudAbove: g.scene.getIndex('GardenHud') > g.scene.getIndex('Garden'),
      };
    });
    const s = await st(page);
    const r = s.hud.hudRects;
    console.log('Q11', vp, JSON.stringify(r), JSON.stringify(s.hud.hintBounds), JSON.stringify(info));
    expect(inside(info.clockText, r.clock)).toBe(true);
    expect(inside(info.dayText, r.clock)).toBe(true);
    const all = { ...r };
    const names = Object.keys(all);
    for (let i = 0; i < names.length; i++) for (let j = i + 1; j < names.length; j++) expect(overlap((all as Any)[names[i]], (all as Any)[names[j]]), `${names[i]} vs ${names[j]}`).toBe(false);
    for (const hb of s.hud.hintBounds) for (const n of names) expect(overlap(hb, (all as Any)[n]), `hint vs ${n}`).toBe(false);
    expect(overlap(s.hud.hintBounds[0], s.hud.hintBounds[1])).toBe(false);
    expect(info.hudAbove).toBe(true);
    expect(info.skyDepth).toBeLessThan(info.bubbleDepth);
    expect(info.skyDepth).toBeLessThan(info.barDepth);
    expect(info.skyDepth).toBeGreaterThan(info.heroDepth);
    await shot(page, `qa-t005-hud-${vp.w}.png`);
    await press(page, 'e');
    const bag = await page.evaluate(() => {
      const g = (window as Any).__game;
      return g.scene.getScene('GardenHud').debugState;
    });
    console.log('Q11 bag panel?', bag.bagVisible);
    await shot(page, `qa-t005-hud-${vp.w}-bag.png`);
    await press(page, 'e');
    await press(page, 'Escape');
    await shot(page, `qa-t005-pause-${vp.w}.png`);
    await press(page, 'Escape');
  });
}

test('Q12 đêm: bong bóng + thanh tiến độ + chữ bay nằm trên lớp trời (ảnh)', async ({ page }) => {
  test.setTimeout(90_000);
  await teleportAndSettle(page, 12, 14);
  await call(page, 'debugSetTillTuning', { strikeSeconds: 2 });
  // T-007: 24h là ngủ gục → để dư ≈ 17 giây thật cho lần cuốc + chụp ảnh.
  await call(page, 'debugSetHour', 23.5);
  const p = await tileToPage(page, 13, 14);
  await page.mouse.click(p.x, p.y);
  await expect.poll(async () => (await st(page)).action.strikesDone, { timeout: 20_000 }).toBeGreaterThanOrEqual(2);
  await call(page, 'debugSetStamina', 0);
  await waitFrames(page, 4);
  await shot(page, 'qa-t005-night-ui.png');
});

test('Q13 bản build: F9 không cộng giờ, gợi ý không có phím thử, Tạm dừng chạy', async ({ page }) => {
  test.skip(!PROD, 'chỉ chạy QA_PROD=1');
  const h0 = (await st(page)).time.hour;
  for (let i = 0; i < 5; i++) await press(page, 'F9');
  const s = await st(page);
  expect(s.time.hour - h0).toBeLessThan(0.5); // chỉ giờ tự trôi, không có +1 giờ
  expect(s.time.devHourPresses).toBe(0);
  expect(s.hud.hintLines.join(' ')).not.toMatch(/Phím thử|F9/);
  await simulateHidden(page, true);
  expect((await st(page)).pause.menuOpen).toBe(true);
  await simulateHidden(page, false);
  await press(page, 'Escape');
  expect((await st(page)).pause.menuOpen).toBe(false);
  await shot(page, 'qa-t005-prod.png');
});
