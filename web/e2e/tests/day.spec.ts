// T-007 — Ngủ, ngủ gục sau 24h, sang ngày mới (cây lớn, héo) và tổng kết ngày (GDD §3.1, §3.4, §3.12, §7, §8).
// Theo "Bạn thử thế nào" của T-007: gieo + tưới 3 ô cải, bỏ 1 món vào thùng bán → 18h vào nhà click giường, "Có" → màn
// tổng kết có tiền bán → Enter → Ngày 2, cải chín. Lần nữa: không ngủ, F9 tới 24h → ngủ gục, sáng ra Sức 70/100 + chửi.
// Thêm: trước 18h bong bóng "Còn sớm…", "Không" / Esc đóng hộp hỏi, ngủ gục giữa lúc cuốc (giữ nhát) / đang mở thùng bán /
// đang mở gùi / đang đuối, héo sau 2 đêm + dòng cảnh báo, Enter nhanh (lần 1 hiện hết, lần 2 sang ngày), đồng hồ dừng
// khi tổng kết, tiền cộng đúng, phím G vẫn chạy (gọi chung hàm qua đêm, có bán thùng, không mở tổng kết), bố cục 1366×768.
// Chờ theo TRẠNG THÁI (expect.poll / frame game), không chờ giờ cố định (BUG-006) — trừ ca "đồng hồ đứng yên" phải chờ một
// khoảng thật để chứng minh không đổi.
import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCREENSHOT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'screenshots');
const PROD = process.env.QA_PROD === '1';

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
interface Summary {
  cause: string;
  passedOut: boolean;
  dayEnded: number;
  newDay: number;
  sale: { earned: number; itemsSold: number; lines: { id: string; count: number }[] };
  ripenedThisMorning: number;
  unwateredYesterday: number;
  witheredTonight: number;
  staminaAfter: number;
}
interface GState {
  gardenReady: boolean;
  view: { x: number; y: number; w: number; h: number };
  tileX: number;
  tileY: number;
  facing: string;
  farm: { plots: Plot[] };
  crops: { x: number; y: number; ripe: boolean; withered: boolean; stage: string }[];
  action: { busy: boolean; kind: string | null; strikesDone: number };
  inventory: { slots: Slot[] };
  bagOpen: boolean;
  bubble: { visible: boolean; text: string; kind: string | null };
  stamina: { current: number; exhausted: boolean; curses: number; lastCurseSfx: string | null };
  farmJuice: { nights: number };
  time: { day: number; hour: number; clockText: string; dayText: string; elapsedSeconds: number; stopped: boolean; reasons: string[]; phase: string };
  pause: { menuOpen: boolean };
  money: { current: number };
  shop: { window: string | null; nearby: string | null };
  sellBox: { slots: Slot[]; total: number };
  till: { cancels: number };
  night: {
    phase: string;
    overnights: number;
    lastCause: string | null;
    sleepPromptOpen: boolean;
    sleepPromptHover: string | null;
    tooEarly: number;
    passingOut: boolean;
    passedOut: boolean;
    fade: number;
    heroAngle: number;
    zzz: boolean;
    wakes: number;
    summaryTicks: number;
    summary: { open: boolean; data: Summary; lines: string[]; detail: string; moneyShown: number; allRevealed: boolean } | null;
  };
  hud: {
    moneyText: string;
    dayText: string;
    clockText: string;
    sleepPromptVisible: boolean;
    nightOverlayAlpha: number;
    zzzVisible: number;
    summaryVisible: boolean;
    summaryTitle: string;
    summarySubtitle: string;
    summaryLines: { text: string; alpha: number; offsetX: number }[];
    summaryDetail: string;
    summaryButtonText: string;
    nightMinFontPx: number;
    vignetteAlpha: number;
    staminaText: string;
  } | null;
}

type SceneHook = Record<string, unknown> & { debugState: GState };
type GameHook = {
  loop: { frame: number };
  scene: { isActive(key: string): boolean; isPaused(key: string): boolean; getScene(key: string): SceneHook; pause(k: string): void; resume(k: string): void };
};

/** Bố cục bản đồ (web/client/src/data/gardenLayout.json). */
const BED = { x: 6, y: 4 };
const WAKE = { x: 7, y: 5 };
const SELL_BOX = { x: 17, y: 11 };
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
  await page.waitForFunction((target) => (window as unknown as { __game: GameHook }).__game.loop.frame >= target, start + n, { timeout: 30_000 });
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
const count = (slots: Slot[], id: string) => slots.reduce((n, s) => n + (s && s.id === id ? s.count : 0), 0);

/** Cuốc nhanh (nhát 0.08 s) rồi gieo cải (hạt ô 1) các ô; `water` = tưới luôn. */
async function plantTiles(page: Page, tiles: [number, number][], water: boolean): Promise<void> {
  await call(page, 'debugSetTillTuning', { strikeSeconds: 0.08 });
  await call(page, 'debugHoldHoe'); // T-009: cầm cuốc (gieo vẫn lấy hạt đầu tiên trong gùi)
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

/** Đứng cạnh giường (ô thức dậy), bấm F. */
async function fAtBed(page: Page): Promise<void> {
  await teleportAndSettle(page, WAKE.x, WAKE.y);
  expect((await st(page)).shop.nearby).toBe('bed');
  await press(page, 'f');
}
async function waitPhase(page: Page, phase: string, timeout = 15_000): Promise<void> {
  await expect.poll(async () => (await st(page)).night.phase, { timeout, intervals: [50] }).toBe(phase);
}
/** Ở màn tổng kết: Enter tới khi chơi lại bình thường (lần 1 có thể chỉ "hiện hết"). */
async function finishSummary(page: Page): Promise<void> {
  await waitPhase(page, 'summary');
  await press(page, 'Enter');
  if ((await st(page)).night.phase === 'summary') await press(page, 'Enter');
  await waitPhase(page, 'none');
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

test('Bạn thử thế nào (1): gieo + tưới 3 ô cải, 1 món vào thùng → 18h click giường "Có" → tổng kết → Enter → Ngày 2, cải chín', async ({ page }) => {
  test.setTimeout(180_000);
  await teleportAndSettle(page, 12, 14);
  await plantTiles(page, [[13, 13], [13, 14], [13, 15]], true);

  // Bỏ 1 bó cải vào thùng bán (F ở thùng → click ô gùi có cải).
  await call(page, 'debugSetSlot', 4, 'rau-cai', 1);
  await teleportAndSettle(page, SELL_BOX.x, SELL_BOX.y + 1);
  await press(page, 'f');
  expect((await st(page)).shop.window).toBe('sellBox');
  await clickGame(page, await call<XY>(page, 'debugSellSlotCenter', 'bag', 4));
  expect((await st(page)).sellBox.total).toBe(10);
  await press(page, 'Escape');
  const money0 = (await st(page)).money.current;
  const stamina0 = (await st(page)).stamina.current;
  expect(stamina0).toBeLessThan(100);

  // F9 tới 18h (17:30 + 1 giờ).
  await call(page, 'debugSetHour', 17.5);
  await press(page, 'F9');
  expect((await st(page)).time.hour).toBeGreaterThanOrEqual(18);
  // Vào nhà, click giường → hỏi "Đi ngủ?".
  await teleportAndSettle(page, WAKE.x, WAKE.y);
  await clickTile(page, BED.x, BED.y);
  let s = await st(page);
  expect(s.night.phase).toBe('sleepPrompt');
  expect(s.night.sleepPromptOpen).toBe(true);
  expect(s.hud!.sleepPromptVisible).toBe(true);
  expect(s.time.reasons).toEqual(['sleep']);
  expect(s.hud!.nightMinFontPx).toBeGreaterThanOrEqual(24);
  // Rê chuột lên "Có" → sáng; chụp.
  const yes = await gameToPage(page, await call<XY>(page, 'debugSleepButtonCenter', 'yes'));
  await page.mouse.move(yes.x, yes.y);
  await expect.poll(async () => (await st(page)).night.sleepPromptHover).toBe('yes');
  await shot(page, 't007-hoi-ngu.png');
  await page.mouse.down();
  await page.mouse.up();

  // Màn tối dần → tổng kết.
  await expect.poll(async () => (await st(page)).night.phase, { intervals: [30] }).toBe('fallingAsleep');
  await waitPhase(page, 'summary');
  s = await st(page);
  expect(s.time.reasons).toEqual(['daySummary', 'sleep']);
  expect(s.time.stopped).toBe(true);
  expect(s.night.lastCause).toBe('sleep');
  expect(s.night.summary!.data).toMatchObject({ cause: 'sleep', passedOut: false, dayEnded: 1, newDay: 2, ripenedThisMorning: 3, unwateredYesterday: 0 });
  expect(s.night.summary!.data.sale.earned).toBe(10);
  // Tiền đã cộng (ví), thùng trống.
  expect(s.money.current).toBe(money0 + 10);
  expect(s.sellBox.total).toBe(0);
  // Chờ hiện hết (không bấm): số tiền đếm lên tới 10, các dòng nằm yên.
  await expect.poll(async () => (await st(page)).night.summary!.allRevealed, { timeout: 10_000 }).toBe(true);
  s = await st(page);
  expect(s.night.summary!.moneyShown).toBe(10);
  expect(s.hud!.summaryTitle).toBe('Hết Ngày 1');
  expect(s.hud!.summarySubtitle).toBe('Sáng mai: Ngày 2 · Mùa nắng');
  expect(s.hud!.summaryLines.map((l) => l.text)).toEqual(['Bán được: 10 quan', 'Cây chín sáng nay: 3']);
  expect(s.hud!.summaryLines.every((l) => l.alpha === 1 && l.offsetX === 0)).toBe(true);
  expect(s.hud!.summaryDetail).toBe('Rau cải ×1');
  expect(s.hud!.summaryButtonText).toBe('Ngày mới (Enter)');
  expect(s.hud!.nightMinFontPx).toBeGreaterThanOrEqual(24);
  expect(s.night.summaryTicks).toBeGreaterThan(0); // "tách tách" khi đếm
  // Đồng hồ đứng yên trong lúc tổng kết.
  const e0 = s.time.elapsedSeconds;
  await page.waitForTimeout(1000);
  expect((await st(page)).time.elapsedSeconds).toBe(e0);
  await shot(page, 't007-tong-ket.png');

  // Enter → sáng ngày 2 ở nhà cạnh giường.
  await press(page, 'Enter');
  await waitPhase(page, 'none');
  s = await st(page);
  expect(s.time.day).toBe(2);
  expect(s.time.hour).toBeLessThan(6.1); // 6:00, đồng hồ đã chạy tiếp vài giây thật
  expect(s.hud!.dayText).toBe('Ngày 2 · Mùa nắng');
  expect(s.stamina.current).toBe(100);
  expect(s.hud!.staminaText).toBe('100/100');
  expect({ x: s.tileX, y: s.tileY }).toEqual(WAKE);
  expect(s.facing).toBe('down');
  expect(s.time.reasons).toEqual([]);
  expect(s.night.heroAngle).toBe(0);
  expect(s.night.wakes).toBe(1);
  expect(s.bubble.kind).not.toBe('grumble'); // ngủ đàng hoàng thì không chửi
  expect(s.crops.filter((c) => c.ripe).length).toBe(3);
  expect(s.farm.plots.every((p) => !p.watered)).toBe(true);
  // Đồng hồ chạy lại.
  await expect.poll(async () => (await st(page)).time.elapsedSeconds, { timeout: 5_000 }).toBeGreaterThan(0);
  // Ra ruộng xem cải chín.
  await teleportAndSettle(page, 12, 14);
  await shot(page, 't007-ngay-2.png');
});

test('Bạn thử thế nào (2): không ngủ, F9 tới 24h → ngủ gục (nằm ra đất, Zzz, tối dần) → sáng ra ở nhà, Sức 70/100 + chửi', async ({ page }) => {
  test.skip(PROD, 'F9 chỉ có ở bản dev');
  test.setTimeout(120_000);
  await call(page, 'debugSetTestTuning', { grumbleSeconds: 30 });
  await call(page, 'debugSetSlot', 5, 'khoai-lang', 3);
  await teleportAndSettle(page, 20, 18);
  const s0 = await st(page);
  await call(page, 'debugSetHour', 23.5);
  await press(page, 'F9');
  await waitPhase(page, 'passingOut', 5_000);
  let s = await st(page);
  expect(s.night.passingOut).toBe(true);
  expect(s.time.reasons).toEqual(['sleep']);
  // Nằm ra đất + Zzz + màn tối dần.
  await expect.poll(async () => Math.abs((await st(page)).night.heroAngle), { timeout: 5_000 }).toBeGreaterThan(85);
  await expect.poll(async () => (await st(page)).hud!.zzzVisible, { timeout: 5_000 }).toBeGreaterThan(0);
  await expect.poll(async () => (await st(page)).night.fade, { timeout: 5_000 }).toBeGreaterThan(0.15);
  s = await st(page);
  expect(s.night.zzz).toBe(true);
  expect(s.night.fade).toBeLessThan(1);
  await shot(page, 't007-ngu-guc.png');

  await waitPhase(page, 'summary');
  s = await st(page);
  expect(s.night.summary!.data).toMatchObject({ cause: 'passout', passedOut: true, staminaAfter: 70 });
  await expect.poll(async () => (await st(page)).night.summary!.allRevealed, { timeout: 10_000 }).toBe(true);
  expect((await st(page)).hud!.summaryLines.map((l) => l.text)).toContain('Ngủ gục ngoài đồng — sáng nay Sức 70/100');
  await shot(page, 't007-tong-ket-ngu-guc.png');
  await press(page, 'Enter');
  await waitPhase(page, 'none');
  s = await st(page);
  expect(s.time.day).toBe(2);
  expect(s.time.hour).toBeLessThan(6.1); // 6:00, đồng hồ đã chạy tiếp vài giây thật
  expect(s.stamina.current).toBe(70);
  expect(s.hud!.staminaText).toBe('70/100');
  expect({ x: s.tileX, y: s.tileY }).toEqual(WAKE); // tỉnh dậy ở nhà
  expect(s.night.heroAngle).toBe(0);
  // LUÔN chửi: bong bóng răng cưa đỏ + tiếng càu nhàu.
  expect(s.bubble).toMatchObject({ visible: true, text: CURSE, kind: 'grumble' });
  expect(s.stamina.curses).toBe(s0.stamina.curses + 1);
  expect(s.stamina.lastCurseSfx).toMatch(/^sfx-voice-cau-nhau-[12]$/);
  // Không mất tiền, không mất đồ.
  expect(s.money.current).toBe(s0.money.current);
  expect(s.inventory.slots).toEqual(s0.inventory.slots);
  await shot(page, 't007-chui-sang.png');
});

test('Trước 18h: giường chỉ bong bóng "Còn sớm, ngủ gì giờ này" (F và click); từ 18h mới hỏi', async ({ page }) => {
  await call(page, 'debugSetHour', 10);
  await fAtBed(page);
  let s = await st(page);
  expect(s.night.phase).toBe('none');
  expect(s.bubble).toMatchObject({ visible: true, text: 'Còn sớm, ngủ gì giờ này' });
  expect(s.night.tooEarly).toBe(1);
  expect(s.time.reasons).toEqual([]);
  await call(page, 'debugSetHour', 17.5); // còn ≈ 17 giây thật tới 18h
  await clickTile(page, BED.x, BED.y);
  s = await st(page);
  expect(s.night.phase).toBe('none');
  expect(s.night.tooEarly).toBe(2);
  await call(page, 'debugSetHour', 18);
  await clickTile(page, BED.x, BED.y);
  expect((await st(page)).night.phase).toBe('sleepPrompt');
});

test('"Không": Esc và nút Không đều đóng hộp hỏi, đồng hồ chạy lại, không qua đêm', async ({ page }) => {
  await call(page, 'debugSetHour', 19);
  await fAtBed(page);
  let s = await st(page);
  expect(s.night.phase).toBe('sleepPrompt');
  const e0 = s.time.elapsedSeconds;
  await page.waitForTimeout(600);
  expect((await st(page)).time.elapsedSeconds).toBe(e0); // hộp hỏi mở → đồng hồ đứng
  await press(page, 'Escape');
  s = await st(page);
  expect(s.night.phase).toBe('none');
  expect(s.pause.menuOpen).toBe(false);
  expect(s.time.reasons).toEqual([]);
  expect(s.hud!.sleepPromptVisible).toBe(false);
  await expect.poll(async () => (await st(page)).time.elapsedSeconds, { timeout: 5_000 }).toBeGreaterThan(e0);
  // Mở lại, bấm nút "Không".
  await press(page, 'f');
  expect((await st(page)).night.phase).toBe('sleepPrompt');
  await clickGame(page, await call<XY>(page, 'debugSleepButtonCenter', 'no'));
  s = await st(page);
  expect(s.night.phase).toBe('none');
  expect(s.night.overnights).toBe(0);
  expect(s.time.day).toBe(1);
  // F lần nữa + Enter = "Có".
  await press(page, 'f');
  await press(page, 'Enter');
  expect(['fallingAsleep', 'summary']).toContain((await st(page)).night.phase);
  await finishSummary(page);
  expect((await st(page)).time.day).toBe(2);
});

test('Ngủ gục giữa lúc đang cuốc: bỏ dở như WASD (ô giữ nhát qua đêm), sáng ra ô vẫn cuốc dở', async ({ page }) => {
  test.setTimeout(120_000);
  await teleportAndSettle(page, 12, 14);
  await call(page, 'debugSetTillTuning', { strikeSeconds: 0.6 });
  // Còn ≈ 10 giây thật tới 24h. (Máy test chậm: đồng hồ ngày đi theo giờ thật, nhịp cuốc theo delta của game → cuốc chậm hơn.)
  await call(page, 'debugSetHour', 23.7);
  await clickTile(page, 13, 14);
  await expect.poll(async () => (await st(page)).action.strikesDone, { timeout: 10_000 }).toBeGreaterThanOrEqual(2);
  // Giữ cho lần cuốc kéo dài tới lúc ngủ gục: nhát dài ra (ô hiện tại giữ số nhát đã chạm).
  await call(page, 'debugSetTillTuning', { strikeSeconds: 3 });
  const cancels0 = (await st(page)).till.cancels;
  await waitPhase(page, 'passingOut', 30_000);
  let s = await st(page);
  expect(s.action.busy).toBe(false);
  expect(s.till.cancels).toBe(cancels0 + 1);
  const strikes = plotOf(s, 13, 14).tillStrikes;
  expect(strikes).toBeGreaterThanOrEqual(2);
  expect(strikes).toBeLessThan(6);
  await finishSummary(page);
  s = await st(page);
  expect(plotOf(s, 13, 14)).toMatchObject({ soil: 'untilled', tillStrikes: strikes });
  expect(s.stamina.current).toBe(70);
});

test('Đang mở thùng bán lúc 23:59: đồng hồ đứng (không ngủ gục); đóng thùng → ngủ gục. Ngủ gục cưỡng bức đóng thùng / gùi', async ({ page }) => {
  test.setTimeout(120_000);
  await teleportAndSettle(page, SELL_BOX.x, SELL_BOX.y + 1);
  await call(page, 'debugSetHour', 23.99);
  await press(page, 'f');
  let s = await st(page);
  expect(s.shop.window).toBe('sellBox');
  const e0 = s.time.elapsedSeconds;
  await page.waitForTimeout(1000);
  s = await st(page);
  expect(s.night.phase).toBe('none');
  expect(s.time.elapsedSeconds).toBe(e0);
  await press(page, 'Escape');
  await waitPhase(page, 'passingOut', 5_000);
  await finishSummary(page);
  expect((await st(page)).time.day).toBe(2);

  // Cưỡng bức 24h (hook QA) lúc đang mở thùng bán → thùng đóng, ngủ gục.
  await teleportAndSettle(page, SELL_BOX.x, SELL_BOX.y + 1);
  await press(page, 'f');
  expect((await st(page)).shop.window).toBe('sellBox');
  expect(await call(page, 'debugTriggerDayEnd')).toBe('passingOut');
  await waitFrames(page, 3);
  s = await st(page);
  expect(s.shop.window).toBeNull();
  expect(s.hud!.sleepPromptVisible).toBe(false);
  expect(s.time.reasons).toEqual(['sleep']);
  await finishSummary(page);
  // … và lúc đang mở gùi.
  await press(page, 'e');
  expect((await st(page)).bagOpen).toBe(true);
  await call(page, 'debugTriggerDayEnd');
  await waitFrames(page, 3);
  expect((await st(page)).bagOpen).toBe(false);
  await finishSummary(page);
  expect((await st(page)).time.day).toBe(4);
});

test('Ngủ gục khi đang đuối: sáng ra hết đuối, Sức 70, viền tối tắt, vẫn chửi câu ngủ gục', async ({ page }) => {
  await call(page, 'debugSetTestTuning', { grumbleSeconds: 30 });
  await call(page, 'debugSetStamina', 0);
  expect((await st(page)).stamina.exhausted).toBe(true);
  await call(page, 'debugTriggerDayEnd');
  await finishSummary(page);
  const s = await st(page);
  expect(s.stamina).toMatchObject({ current: 70, exhausted: false });
  expect(s.bubble).toMatchObject({ visible: true, text: CURSE, kind: 'grumble' });
  await expect.poll(async () => (await st(page)).hud!.vignetteAlpha, { timeout: 5_000 }).toBe(0);
});

test('Héo sau 2 đêm không tưới: đêm 1 cảnh báo "2 ô chưa tưới hôm qua", đêm 2 héo + "2 cây đã héo"', async ({ page }) => {
  test.setTimeout(150_000);
  await teleportAndSettle(page, 12, 14);
  await plantTiles(page, [[13, 13], [14, 13]], false);
  // Đêm 1: ngủ ở giường.
  await call(page, 'debugSetHour', 20);
  await fAtBed(page);
  await press(page, 'Enter');
  await waitPhase(page, 'summary');
  await press(page, 'Enter'); // hiện hết ngay
  let s = await st(page);
  expect(s.night.summary!.allRevealed).toBe(true);
  expect(s.night.summary!.data).toMatchObject({ unwateredYesterday: 2, witheredTonight: 0 });
  expect(s.hud!.summaryLines.map((l) => l.text)).toContain('2 ô chưa tưới hôm qua');
  await press(page, 'Enter');
  await waitPhase(page, 'none');
  s = await st(page);
  expect(s.crops.map((c) => c.withered)).toEqual([false, false]);
  // Đêm 2: ngủ gục.
  await call(page, 'debugTriggerDayEnd');
  await waitPhase(page, 'summary');
  await press(page, 'Enter');
  s = await st(page);
  expect(s.night.summary!.data).toMatchObject({ unwateredYesterday: 2, witheredTonight: 2, passedOut: true });
  expect(s.hud!.summaryLines.map((l) => l.text)).toEqual([
    'Bán được: 0 quan',
    'Cây chín sáng nay: 0',
    '2 ô chưa tưới hôm qua',
    '2 cây đã héo — click để dọn',
    'Ngủ gục ngoài đồng — sáng nay Sức 70/100',
  ]);
  await press(page, 'Enter');
  await waitPhase(page, 'none');
  s = await st(page);
  expect(s.crops.map((c) => c.stage)).toEqual(['withered', 'withered']);
  expect(s.time.day).toBe(3);
});

test('Enter nhanh lúc các dòng đang trượt: lần 1 hiện hết ngay (tiền đủ), lần 2 mới sang ngày', async ({ page }) => {
  await call(page, 'debugSetSellBoxSlot', 0, 'khoai-lang', 5); // 110 quan
  const money0 = (await st(page)).money.current;
  await call(page, 'debugSetHour', 21);
  await fAtBed(page);
  await press(page, 'Enter');
  await waitPhase(page, 'summary');
  let s = await st(page);
  expect(s.night.summary!.allRevealed).toBe(false);
  expect(s.night.summary!.moneyShown).toBeLessThan(110);
  await page.keyboard.press('Enter');
  await waitFrames(page, 2);
  s = await st(page);
  expect(s.night.phase).toBe('summary');
  expect(s.night.summary!.allRevealed).toBe(true);
  expect(s.night.summary!.moneyShown).toBe(110);
  expect(s.hud!.summaryLines[0]).toMatchObject({ text: 'Bán được: 110 quan', alpha: 1, offsetX: 0 });
  expect(s.hud!.summaryDetail).toBe('Khoai lang ×5');
  await page.keyboard.press('Enter');
  await waitFrames(page, 2);
  expect(['waking', 'none']).toContain((await st(page)).night.phase); // lần 2 → sang ngày (máy chậm: có thể đã sáng hẳn)
  await waitPhase(page, 'none');
  s = await st(page);
  expect(s.money.current).toBe(money0 + 110);
  // T-027: số trên HUD nhảy lên theo từng đồng xu bay về (bay xong ~1 s sau khi đóng tổng kết) → chờ theo trạng thái.
  await expect.poll(async () => (await st(page)).hud!.moneyText).toBe(`${money0 + 110} quan`);
  expect(s.time.day).toBe(2);
});

test('Phím G vẫn chạy: gọi chung hàm qua đêm (bán thùng, ngày +1, 6:00, Sức đầy, cây lớn) nhưng không mở tổng kết', async ({ page }) => {
  test.skip(PROD, 'G chỉ có ở bản dev');
  test.setTimeout(120_000);
  await teleportAndSettle(page, 12, 14);
  await plantTiles(page, [[13, 13]], true);
  await call(page, 'debugSetSellBoxSlot', 0, 'rau-cai', 4);
  await call(page, 'debugSetHour', 15);
  await call(page, 'debugSetStamina', 40);
  const s0 = await st(page);
  await press(page, 'g');
  const s = await st(page);
  expect(s.night.phase).toBe('none');
  expect(s.hud!.summaryVisible).toBe(false);
  expect(s.night.lastCause).toBe('devG');
  expect(s.night.overnights).toBe(1);
  expect(s.farmJuice.nights).toBe(s0.farmJuice.nights + 1);
  expect(s.money.current).toBe(s0.money.current + 40);
  expect(s.sellBox.total).toBe(0);
  expect(s.time.day).toBe(2);
  expect(s.time.hour).toBeLessThan(6.2); // về 6:00 (đồng hồ chạy tiếp ngay vì không có tổng kết)
  expect(s.stamina.current).toBe(100);
  expect(s.crops[0].ripe).toBe(true);
  expect(s.bubble.text).toBe('(Thử) Qua một đêm…');
  expect({ x: s.tileX, y: s.tileY }).toEqual({ x: s0.tileX, y: s0.tileY }); // không dời về giường
});

test('Bố cục 1366×768: hộp hỏi ngủ và màn tổng kết vừa màn, chữ ≥ 24px (hệ 1080p)', async ({ page }) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 1366, height: 768 });
  await waitFrames(page, 10);
  await call(page, 'debugSetSellBoxSlot', 0, 'rau-cai', 3);
  await call(page, 'debugSetHour', 22);
  await fAtBed(page);
  let s = await st(page);
  expect(s.hud!.sleepPromptVisible).toBe(true);
  expect(s.hud!.nightMinFontPx).toBeGreaterThanOrEqual(24);
  await shot(page, 't007-1366-hoi-ngu.png');
  await press(page, 'Enter');
  await waitPhase(page, 'summary');
  await press(page, 'Enter');
  s = await st(page);
  expect(s.hud!.summaryVisible).toBe(true);
  expect(s.hud!.nightMinFontPx).toBeGreaterThanOrEqual(24);
  const box = (await page.locator('canvas').boundingBox())!;
  expect(box.width).toBeLessThanOrEqual(1366);
  expect(box.height).toBeLessThanOrEqual(768);
  await shot(page, 't007-1366-tong-ket.png');
  // Click nút "Ngày mới".
  await clickGame(page, await call<XY>(page, 'debugSummaryButtonCenter'));
  await waitPhase(page, 'none');
  expect((await st(page)).time.day).toBe(2);
});
