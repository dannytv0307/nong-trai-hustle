// QA độc lập T-007 — ca rìa của ngủ / ngủ gục / qua đêm / tổng kết (qa-tester, 2026-10-12).
// Bổ sung cho day.spec.ts (của game-dev): giờ biên 17:59 / 18:00, Có/Không bằng click/Enter/Esc, tổng kết nhiều món
// (cải 10, khoai 22) + chi tiết + cây chín + ô chưa tưới + héo, tiền chỉ cộng 1 lần khi Enter/click dồn, NGỦ GỤC TỰ NHIÊN
// (để đồng hồ chạy qua 23:59, không dùng hook) khi đang đi / đang cuốc giữ chuột / đang đuối / đang có hàng chờ, mùa đổi
// ngày 5, đồng hồ đứng suốt chuỗi đêm, mất focus giữa chuỗi đêm, phím bấm lúc tổng kết không lọt, G bán thùng,
// 3 đêm liên tiếp, bố cục 1366×768. Chờ theo trạng thái game (BUG-006).
import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCREENSHOT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'screenshots');

interface XY {
  x: number;
  y: number;
}
type Slot = { id: string; count: number; name: string } | null;
interface Plot {
  x: number;
  y: number;
  soil: string;
  tillStrikes: number;
  crop: { cropId: string; age: number; dryDays: number; withered: boolean } | null;
  watered: boolean;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;
interface GState {
  gardenReady: boolean;
  view: { x: number; y: number; w: number; h: number };
  tileX: number;
  tileY: number;
  facing: string;
  farm: { plots: Plot[] };
  crops: { x: number; y: number; ripe: boolean; withered: boolean; thirsty: boolean; stage: string }[];
  action: { busy: boolean; kind: string | null; strikesDone: number };
  inventory: { slots: Slot[]; selected: number };
  bagOpen: boolean;
  bubble: { visible: boolean; text: string; kind: string | null };
  stamina: { current: number; exhausted: boolean; curses: number; speedPx: number };
  time: { day: number; hour: number; clockText: string; dayText: string; elapsedSeconds: number; stopped: boolean; reasons: string[]; devHourPresses: number };
  pause: { menuOpen: boolean; cause: string | null };
  money: { current: number };
  shop: { window: string | null; nearby: string | null };
  sellBox: { slots: Slot[]; total: number };
  till: { cancels: number; queueLabels: { x: number; y: number; text: string }[]; tuning: Any };
  night: Any;
  hud: Any;
}
type SceneHook = Record<string, unknown> & { debugState: GState };
type GameHook = {
  loop: { frame: number; actualFps: number };
  scene: { isActive(key: string): boolean; isPaused(key: string): boolean; getScene(key: string): SceneHook; pause(k: string): void; resume(k: string): void };
};

const BED = { x: 6, y: 4 };
const WAKE = { x: 7, y: 5 };
const CURSE = 'Mả cha nó, ngủ với muỗi cả đêm, lưng như bị trâu giẫm!';

async function state(page: Page): Promise<GState | null> {
  return page.evaluate(() => {
    const g = (window as unknown as { __game?: GameHook }).__game;
    if (!g || !(g.scene.isActive('Garden') || g.scene.isPaused('Garden'))) return null;
    const s = g.scene.getScene('Garden').debugState;
    return s?.gardenReady && s.hud ? s : null;
  });
}
const st = async (page: Page): Promise<GState> => (await state(page))!;
async function call<T = unknown>(page: Page, method: string, ...args: unknown[]): Promise<T> {
  return page.evaluate(
    ([m, a]) => {
      const sc = (window as unknown as { __game: GameHook }).__game.scene.getScene('Garden');
      return (sc[m as string] as (...x: unknown[]) => T).apply(sc, a as unknown[]);
    },
    [method, args] as const,
  ) as Promise<T>;
}
async function waitFrames(page: Page, n: number): Promise<void> {
  const start = await page.evaluate(() => (window as unknown as { __game: GameHook }).__game.loop.frame);
  await page.waitForFunction((t) => (window as unknown as { __game: GameHook }).__game.loop.frame >= t, start + n, { timeout: 30_000 });
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
async function gameToPage(page: Page, g: XY): Promise<XY> {
  const box = (await page.locator('canvas').boundingBox())!;
  return { x: box.x + (g.x * box.width) / 1920, y: box.y + (g.y * box.height) / 1080 };
}
async function clickGame(page: Page, g: XY): Promise<void> {
  const p = await gameToPage(page, g);
  await page.mouse.move(p.x, p.y);
  await waitFrames(page, 2);
  await page.mouse.down();
  await page.mouse.up();
  await waitFrames(page, 3);
}
async function clickTile(page: Page, tx: number, ty: number): Promise<void> {
  await clickGame(page, await call<XY>(page, 'debugTileToScreen', tx, ty));
}
async function press(page: Page, key: string): Promise<void> {
  await page.keyboard.press(key);
  await waitFrames(page, 3);
}
async function idle(page: Page): Promise<void> {
  await expect.poll(async () => (await st(page)).action.busy, { timeout: 30_000 }).toBe(false);
}
const plotOf = (s: GState, x: number, y: number) => s.farm.plots.find((p) => p.x === x && p.y === y)!;

async function plantTiles(page: Page, tiles: [number, number][], water: boolean): Promise<void> {
  await call(page, 'debugSetTillTuning', { strikeSeconds: 0.08 });
  for (const [x, y] of tiles) {
    await clickTile(page, x, y);
    await expect.poll(async () => plotOf(await st(page), x, y).soil, { timeout: 20_000 }).toBe('tilled');
    await idle(page);
    await clickTile(page, x, y);
    await expect.poll(async () => plotOf(await st(page), x, y).crop?.cropId ?? null, { timeout: 10_000 }).toBe('rau-cai');
    await idle(page);
    if (water) {
      await clickTile(page, x, y);
      await expect.poll(async () => plotOf(await st(page), x, y).watered, { timeout: 10_000 }).toBe(true);
      await idle(page);
    }
  }
}
async function setPhaserPaused(page: Page, paused: boolean): Promise<void> {
  await page.evaluate((p) => {
    const g = (window as unknown as { __game: GameHook }).__game;
    for (const k of ['Garden', 'GardenHud']) {
      if (p) g.scene.pause(k);
      else g.scene.resume(k);
    }
  }, paused);
}
async function shot(page: Page, name: string): Promise<void> {
  await setPhaserPaused(page, true);
  await page.screenshot({ path: join(SCREENSHOT_DIR, name) });
  await setPhaserPaused(page, false);
}
async function waitPhase(page: Page, phase: string, timeout = 20_000): Promise<void> {
  await expect.poll(async () => (await st(page)).night.phase, { timeout, intervals: [40] }).toBe(phase);
}
async function finishSummary(page: Page): Promise<void> {
  await waitPhase(page, 'summary');
  await press(page, 'Enter');
  if ((await st(page)).night.phase === 'summary') await press(page, 'Enter');
  await waitPhase(page, 'none');
}
/** Để đồng hồ chạy TỰ NHIÊN qua 23:59 → 24:00 (không hook triggerDayEnd). 23.99 ≈ 0,33 giây thật trước 24h. */
async function naturalPassOut(page: Page): Promise<void> {
  await call(page, 'debugSetHour', 23.99);
  await waitPhase(page, 'passingOut', 20_000);
}
async function sleepAtBed(page: Page, hour = 20): Promise<void> {
  await call(page, 'debugSetHour', hour);
  await teleportAndSettle(page, WAKE.x, WAKE.y);
  await press(page, 'f');
  expect((await st(page)).night.phase).toBe('sleepPrompt');
  await press(page, 'Enter');
}

let errors: string[] = [];
test.beforeEach(async ({ page }) => {
  errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`[console.error] ${msg.text()}`);
  });
  page.on('pageerror', (err) => errors.push(`[pageerror] ${err.message}`));
  page.on('response', (r) => {
    if (r.status() >= 400 && !r.url().includes('/api/')) errors.push(`[http ${r.status()}] ${r.url()}`);
  });
  await page.goto('/');
  await expect.poll(() => state(page).then((s) => s !== null), { timeout: 30_000 }).toBe(true);
  mkdirSync(SCREENSHOT_DIR, { recursive: true });
});
test.afterEach(() => {
  expect(errors, errors.join('\n')).toEqual([]);
});

test('E1 giờ biên: 17:59 → "Còn sớm" (F và click), 18:00 đúng → hỏi; đồng hồ tự chạy qua 18:00 rồi F → hỏi', async ({ page }) => {
  await teleportAndSettle(page, WAKE.x, WAKE.y);
  await call(page, 'debugSetHour', 17 + 59 / 60);
  let s = await st(page);
  expect(s.time.clockText).toBe('17:59');
  await press(page, 'f');
  s = await st(page);
  expect(s.night.phase).toBe('none');
  expect(s.bubble.text).toBe('Còn sớm, ngủ gì giờ này');
  // Rê chuột lên giường trước, rồi mới đặt 17:59 và click ngay (17:59 → 18:00 chỉ ≈ 0,55 giây thật).
  const bedPt = await gameToPage(page, await call<XY>(page, 'debugTileToScreen', BED.x, BED.y));
  await page.mouse.move(bedPt.x, bedPt.y);
  await waitFrames(page, 3);
  await call(page, 'debugSetHour', 17 + 59 / 60);
  await page.mouse.down();
  await page.mouse.up();
  await waitFrames(page, 3);
  s = await st(page);
  expect(s.night.phase).toBe('none');
  expect(s.night.tooEarly).toBe(2);
  // Đúng 18:00.
  await call(page, 'debugSetHour', 18);
  s = await st(page);
  expect(s.time.clockText).toBe('18:00');
  await press(page, 'f');
  expect((await st(page)).night.phase).toBe('sleepPrompt');
  await press(page, 'Escape');
  // Tự chạy qua mốc: 17:59.4 → chờ đồng hồ hiện 18:00 rồi F.
  await call(page, 'debugSetHour', 17.99);
  await expect.poll(async () => (await st(page)).time.clockText, { timeout: 10_000 }).toBe('18:00');
  await press(page, 'f');
  expect((await st(page)).night.phase).toBe('sleepPrompt');
});

test('E2 hộp "Đi ngủ?": click ngoài nút không làm gì; click Không / Esc đóng; Enter và click Có ngủ; Enter dồn chỉ 1 đêm', async ({ page }) => {
  test.setTimeout(120_000);
  await call(page, 'debugSetHour', 19);
  await teleportAndSettle(page, WAKE.x, WAKE.y);
  await press(page, 'f');
  expect((await st(page)).night.phase).toBe('sleepPrompt');
  // Click chỗ trống (góc trên trái khung) → vẫn hỏi.
  await clickGame(page, { x: 200, y: 200 });
  expect((await st(page)).night.phase).toBe('sleepPrompt');
  await shot(page, 'qa-t007-prompt.png');
  // G / F9 / E lúc đang hỏi không làm gì.
  const d0 = (await st(page)).time.day;
  await press(page, 'g');
  await press(page, 'F9');
  await press(page, 'e');
  let s = await st(page);
  expect(s.time.day).toBe(d0);
  expect(s.bagOpen).toBe(false);
  expect(s.night.phase).toBe('sleepPrompt');
  await clickGame(page, await call<XY>(page, 'debugSleepButtonCenter', 'no'));
  expect((await st(page)).night.phase).toBe('none');
  await press(page, 'f');
  await press(page, 'Escape');
  s = await st(page);
  expect(s.night.phase).toBe('none');
  expect(s.pause.menuOpen).toBe(false);
  // Enter dồn 5 lần liền ở hộp hỏi → chỉ 1 đêm.
  const money0 = s.money.current;
  await press(page, 'f');
  for (let i = 0; i < 5; i++) await page.keyboard.press('Enter');
  await finishSummary(page);
  s = await st(page);
  expect(s.night.overnights).toBe(1);
  expect(s.time.day).toBe(2);
  expect(s.money.current).toBe(money0);
  // Click "Có".
  await call(page, 'debugSetHour', 20);
  await teleportAndSettle(page, WAKE.x, WAKE.y);
  await press(page, 'f');
  await clickGame(page, await call<XY>(page, 'debugSleepButtonCenter', 'yes'));
  expect(['fallingAsleep', 'summary']).toContain((await st(page)).night.phase);
  await finishSummary(page);
  expect((await st(page)).time.day).toBe(3);
});

test('E3 tổng kết đầy đủ + tiền cộng đúng 1 lần (Enter dồn, click dồn) + đồng hồ đứng suốt chuỗi + héo 2 đêm + chín không hỏng + cuốc dở giữ nhát', async ({ page }) => {
  test.setTimeout(240_000);
  await teleportAndSettle(page, 12, 14);
  await plantTiles(page, [[13, 13], [14, 13]], true);
  await teleportAndSettle(page, 14, 14);
  await plantTiles(page, [[15, 13]], false);
  await teleportAndSettle(page, 12, 14);
  // Ô cuốc dở 13,15: cuốc 2 nhát rồi bỏ dở bằng D.
  await call(page, 'debugSetTillTuning', { strikeSeconds: 0.3 });
  await clickTile(page, 13, 15);
  await expect.poll(async () => plotOf(await st(page), 13, 15).tillStrikes, { timeout: 20_000 }).toBeGreaterThanOrEqual(2);
  await page.keyboard.press('d');
  await idle(page);
  const strikes = plotOf(await st(page), 13, 15).tillStrikes;
  expect(strikes).toBeGreaterThanOrEqual(2);
  expect(strikes).toBeLessThan(6);
  await shot(page, 'qa-t007-field-day1.png');

  // Thùng: cải ×2 (10) + khoai ×1 (22) = 42.
  await call(page, 'debugSetSellBoxSlot', 0, 'rau-cai', 2);
  await call(page, 'debugSetSellBoxSlot', 1, 'khoai-lang', 1);
  let s = await st(page);
  expect(s.sellBox.total).toBe(42);
  const money0 = s.money.current;
  const inv0 = s.inventory.slots;

  // Ngủ: ghi giờ lúc hỏi, đồng hồ phải đứng suốt hộp hỏi + thiếp đi.
  await call(page, 'debugSetHour', 19.5);
  await teleportAndSettle(page, WAKE.x, WAKE.y);
  await press(page, 'f');
  s = await st(page);
  expect(s.night.phase).toBe('sleepPrompt');
  const e0 = s.time.elapsedSeconds;
  await page.waitForTimeout(500);
  expect((await st(page)).time.elapsedSeconds).toBe(e0);
  await press(page, 'Enter');
  const phasesSeen = new Set<string>();
  await expect
    .poll(
      async () => {
        const x = await st(page);
        phasesSeen.add(x.night.phase);
        if (x.night.phase === 'fallingAsleep') expect(x.time.elapsedSeconds).toBe(e0);
        if (x.night.phase === 'summary') expect(x.time.elapsedSeconds).toBe(0);
        expect(x.time.stopped).toBe(true);
        return x.night.phase;
      },
      { timeout: 20_000, intervals: [30] },
    )
    .toBe('summary');
  s = await st(page);
  expect(s.night.summary.data).toMatchObject({ dayEnded: 1, newDay: 2, ripenedThisMorning: 2, unwateredYesterday: 1, witheredTonight: 0, passedOut: false });
  expect(s.night.summary.data.sale.earned).toBe(42);
  expect(s.money.current).toBe(money0 + 42);
  // Enter dồn 6 lần + click dồn 6 lần ngay khi mở tổng kết (không chờ frame).
  for (let i = 0; i < 6; i++) await page.keyboard.press('Enter');
  const btn = await gameToPage(page, await call<XY>(page, 'debugSummaryButtonCenter'));
  await page.mouse.move(btn.x, btn.y);
  for (let i = 0; i < 6; i++) {
    await page.mouse.down();
    await page.mouse.up();
  }
  await waitPhase(page, 'none');
  await page.waitForTimeout(1500);
  s = await st(page);
  expect(s.money.current).toBe(money0 + 42);
  expect(s.night.overnights).toBe(1);
  expect(s.time.day).toBe(2);
  expect(s.inventory.slots).toEqual(inv0);
  expect(s.sellBox.total).toBe(0);
  expect(s.hud.moneyText).toBe(`${money0 + 42} quan`);
  expect(plotOf(s, 13, 15)).toMatchObject({ soil: 'untilled', tillStrikes: strikes });
  expect(s.crops.find((c) => c.x === 15 && c.y === 13)).toMatchObject({ thirsty: true, withered: false });
  await teleportAndSettle(page, 12, 14);
  await shot(page, 'qa-t007-field-day2-thirsty.png');

  // Đêm 2: không tưới, không hái. Kiểm chữ chi tiết lần này qua lần trước (đọc lại từ lastSummary).
  await call(page, 'debugSetSellBoxSlot', 0, 'khoai-lang', 2);
  await call(page, 'debugSetSellBoxSlot', 1, 'rau-cai', 3);
  await sleepAtBed(page, 22);
  await waitPhase(page, 'summary');
  await expect.poll(async () => (await st(page)).night.summary.allRevealed, { timeout: 15_000 }).toBe(true);
  s = await st(page);
  expect(s.night.summary.data).toMatchObject({ ripenedThisMorning: 0, unwateredYesterday: 1, witheredTonight: 1 });
  expect(s.hud.summaryLines.map((l: { text: string }) => l.text)).toEqual([
    'Bán được: 74 quan',
    'Cây chín sáng nay: 0',
    '1 ô chưa tưới hôm qua',
    '1 cây đã héo — click để dọn',
  ]);
  expect(s.hud.summaryDetail).toBe('Khoai lang ×2 · Rau cải ×3');
  expect(s.night.summary.moneyShown).toBe(74);
  expect(s.hud.summaryTitle).toBe('Hết Ngày 2');
  expect(s.hud.summarySubtitle).toBe('Sáng mai: Ngày 3 · Mùa nắng');
  await shot(page, 'qa-t007-summary-wither.png');
  await press(page, 'Enter');
  await waitPhase(page, 'none');
  s = await st(page);
  expect(s.money.current).toBe(money0 + 42 + 74);
  const c1313 = s.crops.find((c) => c.x === 13 && c.y === 13)!;
  const c1513 = s.crops.find((c) => c.x === 15 && c.y === 13)!;
  expect(c1313).toMatchObject({ ripe: true, withered: false });
  expect(c1513).toMatchObject({ withered: true, stage: 'withered' });
  expect(plotOf(s, 13, 15).tillStrikes).toBe(strikes);
  // Đêm 3 bằng ngủ gục tự nhiên: chín vẫn chín, cuốc dở vẫn giữ nhát.
  await naturalPassOut(page);
  await finishSummary(page);
  s = await st(page);
  expect(s.crops.find((c) => c.x === 13 && c.y === 13)).toMatchObject({ ripe: true, withered: false });
  expect(s.crops.find((c) => c.x === 14 && c.y === 13)).toMatchObject({ ripe: true, withered: false });
  expect(plotOf(s, 13, 15).tillStrikes).toBe(strikes);
  expect(s.time.day).toBe(4);
  await teleportAndSettle(page, 12, 14);
  await shot(page, 'qa-t007-field-day4.png');
  // Dọn cây héo bằng click.
  await teleportAndSettle(page, 14, 14);
  await call(page, 'debugSetTillTuning', { strikeSeconds: 0.08 });
  await clickTile(page, 15, 13);
  await expect.poll(async () => plotOf(await st(page), 15, 13).crop, { timeout: 15_000 }).toBeNull();
});

test('E4 ngủ gục tự nhiên khi đang ĐI (giữ D suốt chuỗi đêm): nằm yên, không trôi; sáng ra cạnh giường 6:00, chửi đúng câu, không mất gì', async ({ page }) => {
  test.setTimeout(120_000);
  await call(page, 'debugSetTestTuning', { grumbleSeconds: 30 });
  await call(page, 'debugSetSellBoxSlot', 0, 'rau-cai', 1);
  await teleportAndSettle(page, 18, 18);
  const s0 = await st(page);
  await page.keyboard.down('d');
  await expect.poll(async () => (await st(page)).stamina.speedPx, { timeout: 5_000 }).toBeGreaterThan(0);
  await naturalPassOut(page);
  let s = await st(page);
  const tile = { x: s.tileX, y: s.tileY };
  await page.waitForTimeout(800);
  s = await st(page);
  expect(s.night.phase === 'passingOut' || s.night.phase === 'summary').toBe(true);
  expect({ x: s.tileX, y: s.tileY }).toEqual(tile);
  expect(s.stamina.speedPx).toBe(0);
  expect(Math.abs(s.night.heroAngle)).toBeGreaterThan(80);
  await shot(page, 'qa-t007-passout-walking.png');
  await waitPhase(page, 'summary');
  // Vẫn giữ D trong tổng kết, rồi Enter ×2.
  await press(page, 'Enter');
  if ((await st(page)).night.phase === 'summary') await press(page, 'Enter');
  await waitPhase(page, 'waking');
  await page.keyboard.up('d');
  await waitPhase(page, 'none');
  s = await st(page);
  expect(s.time.day).toBe(2);
  expect(s.time.clockText).toBe('06:00');
  expect({ x: s.tileX, y: s.tileY }).toEqual(WAKE);
  expect(s.stamina.current).toBe(70);
  expect(s.bubble).toMatchObject({ visible: true, text: CURSE, kind: 'grumble' });
  expect(s.money.current).toBe(s0.money.current + 10);
  expect(s.inventory.slots).toEqual(s0.inventory.slots);
  await shot(page, 'qa-t007-wake-curse.png');
});

test('E4b giữ D qua lúc thức dậy: chỉ ghi nhận hành vi (đi tiếp ngay khi sáng hẳn?)', async ({ page }) => {
  await call(page, 'debugTriggerDayEnd');
  await waitPhase(page, 'summary');
  await page.keyboard.down('d');
  await press(page, 'Enter');
  if ((await st(page)).night.phase === 'summary') await press(page, 'Enter');
  await waitPhase(page, 'none');
  await waitFrames(page, 20);
  const s = await st(page);
  await page.keyboard.up('d');
  console.log('[E4b] giữ D suốt lúc thức dậy → ô sau 20 frame', s.tileX, s.tileY, 'speedPx', s.stamina.speedPx);
});

test('E5 ngủ gục tự nhiên khi đang CUỐC (giữ chuột): bỏ dở, giữ nhát; sáng ra chuột còn giữ cũng không cuốc lung tung; click lại cuốc tiếp', async ({ page }) => {
  test.setTimeout(120_000);
  await teleportAndSettle(page, 12, 14);
  await call(page, 'debugSetTillTuning', { strikeSeconds: 0.3 });
  const p = await gameToPage(page, await call<XY>(page, 'debugTileToScreen', 13, 14));
  await page.mouse.move(p.x, p.y);
  await waitFrames(page, 2);
  await page.mouse.down();
  await expect.poll(async () => (await st(page)).action.strikesDone, { timeout: 15_000 }).toBeGreaterThanOrEqual(2);
  await call(page, 'debugSetTillTuning', { strikeSeconds: 6 });
  await naturalPassOut(page);
  let s = await st(page);
  expect(s.action.busy).toBe(false);
  const strikes = plotOf(s, 13, 14).tillStrikes;
  expect(strikes).toBeGreaterThanOrEqual(2);
  expect(strikes).toBeLessThan(6);
  await waitPhase(page, 'summary');
  await press(page, 'Enter');
  if ((await st(page)).night.phase === 'summary') await press(page, 'Enter');
  await waitPhase(page, 'none');
  await waitFrames(page, 20);
  s = await st(page);
  expect(s.action.busy).toBe(false);
  expect(plotOf(s, 13, 14).tillStrikes).toBe(strikes);
  await page.mouse.up();
  // Click lại ô đó (đi ra ruộng) → cuốc tiếp từ số nhát cũ.
  await teleportAndSettle(page, 12, 14);
  await call(page, 'debugSetTillTuning', { strikeSeconds: 0.08 });
  await clickTile(page, 13, 14);
  await expect.poll(async () => plotOf(await st(page), 13, 14).soil, { timeout: 15_000 }).toBe('tilled');
});

test('E6 ngủ gục tự nhiên khi có HÀNG CHỜ cuốc: hàng chờ xóa, số trên ô biến mất, ô đang cuốc giữ nhát', async ({ page }) => {
  test.setTimeout(120_000);
  await teleportAndSettle(page, 12, 14);
  await call(page, 'debugSetTillTuning', { strikeSeconds: 1.0 });
  await clickTile(page, 13, 13);
  await clickTile(page, 14, 13);
  await clickTile(page, 13, 14);
  expect(await call(page, 'debugIsPending', 14, 13)).toBe(true);
  expect(await call(page, 'debugIsPending', 13, 14)).toBe(true);
  await expect.poll(async () => (await st(page)).action.strikesDone, { timeout: 15_000 }).toBeGreaterThanOrEqual(1);
  await call(page, 'debugSetTillTuning', { strikeSeconds: 6 });
  await naturalPassOut(page);
  const strikes = plotOf(await st(page), 13, 13).tillStrikes;
  await finishSummary(page);
  const s = await st(page);
  expect(await call(page, 'debugIsPending', 14, 13)).toBe(false);
  expect(await call(page, 'debugIsPending', 13, 14)).toBe(false);
  expect(plotOf(s, 13, 14).tillStrikes).toBe(0);
  expect(s.till.queueLabels).toEqual([]);
  expect(s.action.busy).toBe(false);
  expect(plotOf(s, 13, 13).tillStrikes).toBe(strikes);
  expect(plotOf(s, 14, 13).tillStrikes).toBe(0);
});

test('E7 ngủ gục tự nhiên khi đang ĐUỐI: sáng ra hết đuối, Sức 70, chửi câu ngủ gục', async ({ page }) => {
  await call(page, 'debugSetTestTuning', { grumbleSeconds: 30 });
  await call(page, 'debugSetStamina', 0);
  expect((await st(page)).stamina.exhausted).toBe(true);
  await naturalPassOut(page);
  await finishSummary(page);
  const s = await st(page);
  expect(s.stamina).toMatchObject({ current: 70, exhausted: false });
  expect(s.bubble).toMatchObject({ visible: true, text: CURSE, kind: 'grumble' });
  expect(s.hud.staminaText).toBe('70/100');
});

test('E8 mùa đổi ở ngày 5: G×3 rồi ngủ → tổng kết "Mùa mưa tới rồi!", HUD Ngày 5 · Mùa mưa; G×4 → Ngày 9 · Mùa nắng', async ({ page }) => {
  test.setTimeout(90_000);
  for (let i = 0; i < 3; i++) await press(page, 'g');
  expect((await st(page)).time.day).toBe(4);
  await sleepAtBed(page);
  await waitPhase(page, 'summary');
  await press(page, 'Enter');
  let s = await st(page);
  expect(s.hud.summarySubtitle).toBe('Sáng mai: Ngày 5 · Mùa mưa');
  expect(s.hud.summaryLines.map((l: { text: string }) => l.text)).toContain('Mùa mưa tới rồi!');
  await press(page, 'Enter');
  await waitPhase(page, 'none');
  s = await st(page);
  expect(s.hud.dayText).toBe('Ngày 5 · Mùa mưa');
  for (let i = 0; i < 4; i++) await press(page, 'g');
  s = await st(page);
  expect(s.time.day).toBe(9);
  expect(s.hud.dayText).toBe('Ngày 9 · Mùa nắng');
});

test('E9 mất focus giữa chuỗi đêm: lúc ngủ gục và lúc tổng kết → Tạm dừng nằm trên, thế giới đứng; Esc đóng Tạm dừng rồi tiếp đúng', async ({ page }) => {
  test.setTimeout(120_000);
  await naturalPassOut(page);
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await waitFrames(page, 3);
  let s = await st(page);
  expect(s.pause.menuOpen).toBe(true);
  expect(s.night.phase).toBe('passingOut');
  const fade0 = s.night.fade;
  await page.waitForTimeout(1500);
  s = await st(page);
  expect(s.night.phase).toBe('passingOut');
  expect(s.night.fade).toBe(fade0);
  await shot(page, 'qa-t007-blur-passout.png');
  await press(page, 'Escape');
  s = await st(page);
  expect(s.pause.menuOpen).toBe(false);
  await waitPhase(page, 'summary');
  // Mất focus lúc tổng kết.
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await waitFrames(page, 3);
  s = await st(page);
  expect(s.pause.menuOpen).toBe(true);
  expect(s.night.phase).toBe('summary');
  await shot(page, 'qa-t007-blur-summary.png');
  // Enter lúc Tạm dừng không được sang ngày.
  await press(page, 'Enter');
  s = await st(page);
  expect(s.night.phase).toBe('summary');
  expect(s.pause.menuOpen).toBe(true);
  await press(page, 'Escape');
  s = await st(page);
  expect(s.pause.menuOpen).toBe(false);
  expect(s.night.phase).toBe('summary');
  expect(s.time.reasons).toEqual(['daySummary', 'sleep']);
  await finishSummary(page);
  s = await st(page);
  expect(s.time.day).toBe(2);
  expect(s.time.reasons).toEqual([]);
  // visibilitychange → hidden lúc đang thiếp đi ở giường.
  await sleepAtBed(page);
  await waitFrames(page, 2);
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await waitFrames(page, 3);
  s = await st(page);
  expect(s.pause.menuOpen).toBe(true);
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' });
  });
  await press(page, 'Escape');
  await finishSummary(page);
  expect((await st(page)).time.day).toBe(3);
});

test('E10 phím bấm trong lúc tổng kết / thức dậy không lọt sang ngày mới', async ({ page }) => {
  await call(page, 'debugSetStamina', 50);
  await sleepAtBed(page);
  await waitPhase(page, 'summary');
  const s0 = await st(page);
  const sel0 = s0.inventory.selected;
  for (const k of ['e', '5', 'g', 'F9', 'F8', 'f', 'Escape', 'd', 'Tab']) await page.keyboard.press(k);
  await page.mouse.wheel(0, 300);
  await waitFrames(page, 3);
  let s = await st(page);
  expect(s.night.phase).toBe('summary');
  expect(s.pause.menuOpen).toBe(false);
  await press(page, 'Enter');
  if ((await st(page)).night.phase === 'summary') await press(page, 'Enter');
  // Bấm thêm lúc đang sáng dần.
  if ((await st(page)).night.phase === 'waking') for (const k of ['e', '3', 'g']) await page.keyboard.press(k);
  await waitPhase(page, 'none');
  await waitFrames(page, 10);
  s = await st(page);
  expect(s.bagOpen).toBe(false);
  expect(s.inventory.selected).toBe(sel0);
  expect(s.time.day).toBe(2);
  expect(s.time.hour).toBeLessThan(6.2);
  expect(s.stamina.current).toBe(100);
  expect(s.time.devHourPresses).toBe(s0.time.devHourPresses);
  expect(s.night.overnights).toBe(1);
  expect(s.shop.window).toBeNull();
  expect(s.pause.menuOpen).toBe(false);
  expect({ x: s.tileX, y: s.tileY }).toEqual(WAKE);
});

test('E11 G vẫn chạy và bán thùng (cải 10 + khoai 22), không tổng kết, không mất đồ trong gùi', async ({ page }) => {
  await call(page, 'debugSetSellBoxSlot', 0, 'rau-cai', 1);
  await call(page, 'debugSetSellBoxSlot', 1, 'khoai-lang', 1);
  const s0 = await st(page);
  await press(page, 'g');
  const s = await st(page);
  expect(s.money.current).toBe(s0.money.current + 32);
  expect(s.sellBox.total).toBe(0);
  expect(s.time.day).toBe(2);
  expect(s.night.phase).toBe('none');
  expect(s.hud.summaryVisible).toBe(false);
  expect(s.inventory.slots).toEqual(s0.inventory.slots);
});

test('E12 ngủ 3 đêm liên tiếp (giường, ngủ gục tự nhiên, giường) ổn định; FPS', async ({ page }) => {
  test.setTimeout(150_000);
  await sleepAtBed(page);
  await finishSummary(page);
  await naturalPassOut(page);
  await finishSummary(page);
  await sleepAtBed(page, 23.5);
  await finishSummary(page);
  const s = await st(page);
  expect(s.time.day).toBe(4);
  expect(s.night.overnights).toBe(3);
  expect(s.night.wakes).toBe(3);
  expect(s.stamina.current).toBe(100);
  expect(s.time.reasons).toEqual([]);
  expect({ x: s.tileX, y: s.tileY }).toEqual(WAKE);
  await expect.poll(async () => (await st(page)).time.elapsedSeconds, { timeout: 5_000 }).toBeGreaterThan(0);
  const fps = await page.evaluate(() => (window as unknown as { __game: GameHook }).__game.loop.actualFps);
  console.log('[E12] actualFps', fps.toFixed(1));
});

test('E13 1366×768: tổng kết nhiều dòng (tiền, chín, chưa tưới, héo, ngủ gục, mùa mưa) vừa khung, chữ ≥ 24px', async ({ page }) => {
  test.setTimeout(150_000);
  await page.setViewportSize({ width: 1366, height: 768 });
  await waitFrames(page, 10);
  await press(page, 'g');
  await press(page, 'g'); // ngày 3
  await teleportAndSettle(page, 12, 14);
  await plantTiles(page, [[13, 13], [14, 13]], false);
  await press(page, 'g'); // ngày 4: 2 ô khát
  await call(page, 'debugSetSellBoxSlot', 0, 'rau-cai', 3);
  await call(page, 'debugSetSellBoxSlot', 1, 'khoai-lang', 2);
  await naturalPassOut(page);
  await waitPhase(page, 'summary');
  await expect.poll(async () => (await st(page)).night.summary.allRevealed, { timeout: 15_000 }).toBe(true);
  const s = await st(page);
  const lines = s.hud.summaryLines.map((l: { text: string }) => l.text);
  console.log('[E13] lines', JSON.stringify(lines), 'detail', s.hud.summaryDetail, 'minFont', s.hud.nightMinFontPx);
  expect(lines).toEqual([
    'Bán được: 74 quan',
    'Cây chín sáng nay: 0',
    '2 ô chưa tưới hôm qua',
    '2 cây đã héo — click để dọn',
    'Ngủ gục ngoài đồng — sáng nay Sức 70/100',
    'Mùa mưa tới rồi!',
  ]);
  expect(s.hud.nightMinFontPx).toBeGreaterThanOrEqual(24);
  await shot(page, 'qa-t007-summary-1366.png');
  await finishSummary(page);
  await shot(page, 'qa-t007-wake-1366.png');
});
