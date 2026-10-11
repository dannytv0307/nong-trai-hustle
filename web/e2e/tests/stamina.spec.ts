// T-004 — Thanh Sức, "đuối", ăn khoai bằng chuột phải, bong bóng chửi thề (GDD §3.2, §3.3a, §3.12, §8, §11; D-022).
// Theo "Bạn thử thế nào" của T-004: cuốc vài ô thấy Sức tụt → F8 tới khi hết Sức: chửi bằng bong bóng đỏ, đi chậm, click
// ruộng thì "đuối rồi…" → chọn khoai, chuột phải: +8 Sức. Thêm: thiếu Sức giữa hàng chờ cuốc, bỏ dở không trừ, ăn khi đang
// cuốc, chuột phải trên hạt, màu thanh theo ngưỡng, lầm bầm khi xong ô, việc nhanh tốn 1 Sức, bản build không có F8.
// Đọc trạng thái qua window.__game.scene.getScene('Garden').debugState. Chờ theo TRẠNG THÁI (expect.poll / frame game),
// không chờ giờ cố định (BUG-006). Cuốc chạy nhanh bằng debugSetTillTuning; xác suất lầm bầm ép bằng debugSetBarkTuning.
// Vùng ruộng: ô x 13..15, y 13..15. Đứng ở (12,14): với tới cột 13 và (14,13..15) (tầm 2.5 ô).
import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCREENSHOT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'screenshots');
const PROD = !!process.env.QA_PROD;

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
interface GState {
  gardenReady: boolean;
  view: { x: number; y: number; w: number; h: number };
  farm: { plots: Plot[] };
  hover: { x: number; y: number; job: string | null } | null;
  action: { busy: boolean; current: XY | null; queue: XY[]; kind: string | null; strikesDone: number };
  till: { finishes: number; cancels: number };
  anim: { timeScale: number; playing: boolean };
  inventory: { slots: ({ id: string; count: number } | null)[]; selected: number };
  bubble: { visible: boolean; text: string; shows: number; kind: string | null; shakeX: number };
  stamina: {
    current: number;
    max: number;
    exhausted: boolean;
    band: string;
    speedMultiplier: number;
    speedPx: number;
    curses: number;
    lastCurseSfx: string | null;
    tooTired: number;
    eats: number;
    barks: number;
    lastBark: string | null;
    floatsActive: string[];
    floatsActiveY: { text: string; y: number }[];
    floatLog: string[];
  };
  farmJuice: { plants: number; waters: number };
  hud: {
    staminaText: string;
    staminaBand: string;
    staminaFillColor: number;
    staminaFillRatio: number;
    vignetteAlpha: number;
    hotbarCounts: string[];
    bouncingSlot: number;
    eatBounces: number;
    lastEatSlot: number;
  } | null;
}

type SceneHook = Record<string, unknown> & { debugState: GState };
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

const BARKS = [
  'Ối cái lưng tôi…',
  'Luống này thẳng như kẻ chỉ!',
  'Đất gì mà rắn như đá đình!',
  'Thêm luống nữa là có tiền cưới vợ!',
  'Mồ hôi rơi xuống, quan tiền mọc lên.',
  'Hừ, cuốc gỗ mà cũng phải nể tao.',
];
const CURSE = 'Mả cha cái bụng, réo như trống hội làng!';
const TOO_TIRED = 'Đuối rồi…';
// Màu palette (Art Bible): xanh mạ, vàng hoa hòe, đỏ son.
const GREEN = 0x93b04f;
const YELLOW = 0xdda933;
const RED = 0xa93226;

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

const plotOf = (s: GState, x: number, y: number) => s.farm.plots.find((p) => p.x === x && p.y === y)!;

async function waitFrames(page: Page, n: number): Promise<void> {
  const start = await page.evaluate(() => (window as unknown as { __game: GameHook }).__game.loop.frame);
  await page.waitForFunction(
    (target) => (window as unknown as { __game: GameHook }).__game.loop.frame >= target,
    start + n,
    { timeout: 30_000 },
  );
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
async function tileToPage(page: Page, tx: number, ty: number): Promise<XY> {
  return gameToPage(page, await call<XY>(page, 'debugTileToScreen', tx, ty));
}
async function moveMouseToTile(page: Page, tx: number, ty: number): Promise<void> {
  const p = await tileToPage(page, tx, ty);
  await page.mouse.move(p.x, p.y);
}
async function clickTile(page: Page, tx: number, ty: number): Promise<void> {
  await moveMouseToTile(page, tx, ty);
  await page.mouse.down();
  await page.mouse.up();
}
/** Chuột phải tại một ô cỏ trống (không trên HUD). */
async function rightClick(page: Page): Promise<void> {
  const p = await tileToPage(page, 11, 12);
  await page.mouse.click(p.x, p.y, { button: 'right' });
  await waitFrames(page, 3);
}
async function press(page: Page, key: string): Promise<void> {
  await page.keyboard.press(key);
  await waitFrames(page, 3);
}

async function setPaused(page: Page, paused: boolean): Promise<void> {
  await page.evaluate((p) => {
    const g = (window as unknown as { __game: GameHook }).__game;
    for (const k of ['Garden', 'GardenHud']) {
      if (p) g.scene.pause(k);
      else g.scene.resume(k);
    }
  }, paused);
}
async function shot(page: Page, name: string, clip?: { x: number; y: number; width: number; height: number }): Promise<void> {
  await setPaused(page, true);
  await page.screenshot({ path: join(SCREENSHOT_DIR, name), clip });
  await setPaused(page, false);
}
/** Chờ bong bóng hiện tại tắt (bong bóng chửi thề 2.5 s chặn "đuối rồi…"). */
async function bubbleGone(page: Page): Promise<void> {
  await expect.poll(async () => (await st(page)).bubble.visible, { timeout: 20_000 }).toBe(false);
}
async function idle(page: Page): Promise<void> {
  await expect.poll(async () => (await st(page)).action.busy, { timeout: 30_000 }).toBe(false);
}
/** Cuốc một ô (đã chỉnh nhát ngắn) và chờ xong. */
async function tillOne(page: Page, x: number, y: number): Promise<void> {
  await clickTile(page, x, y);
  await expect.poll(async () => plotOf(await st(page), x, y).soil, { timeout: 20_000 }).toBe('tilled');
  await idle(page);
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

test.describe('bản dev', () => {
  test.skip(PROD, 'các ca này dùng phím thử F8 — chỉ có ở bản dev');

  test('Bạn thử thế nào: cuốc tụt Sức → F8 tới hết → chửi đỏ, đi chậm, "đuối rồi…" → chuột phải ăn khoai +8', async ({ page }) => {
    test.setTimeout(120_000);
    let s = await st(page);
    expect(s.stamina).toMatchObject({ current: 100, max: 100, exhausted: false, band: 'green', speedMultiplier: 1 });
    expect(s.hud!.staminaText).toBe('100/100');
    expect(s.hud!.staminaFillColor).toBe(GREEN);
    expect(s.hud!.vignetteAlpha).toBe(0);
    await call(page, 'debugSetBarkTuning', { chance: 0 });

    await teleportAndSettle(page, 12, 14);
    // Đi lại không tốn Sức: tốc độ thường = walkSpeed 4 ô/giây × 64 px.
    await page.keyboard.down('s');
    await waitFrames(page, 8);
    s = await st(page);
    await page.keyboard.up('s');
    expect(s.stamina.speedPx).toBeCloseTo(256, 0);
    await teleportAndSettle(page, 12, 14);
    expect((await st(page)).stamina.current).toBe(100);

    // Cuốc 2 ô: mỗi ô −4 MỘT LẦN ở nhát cuối, chữ "−4 Sức" bay lên.
    await call(page, 'debugSetTillTuning', { strikeSeconds: 0.12 });
    await clickTile(page, 13, 14);
    // Giữa chừng (đã chạm vài nhát nhưng chưa xong) chưa trừ.
    await expect.poll(async () => (await st(page)).action.strikesDone, { timeout: 15_000 }).toBeGreaterThanOrEqual(2);
    s = await st(page);
    if (plotOf(s, 13, 14).soil !== 'tilled') expect(s.stamina.current).toBe(100);
    await expect.poll(async () => plotOf(await st(page), 13, 14).soil, { timeout: 20_000 }).toBe('tilled');
    s = await st(page);
    expect(s.stamina.current).toBe(96);
    expect(s.stamina.floatLog.at(-1)).toBe('−4 Sức');
    await shot(page, 't004-till-minus4.png');
    await idle(page);
    await tillOne(page, 13, 13);
    s = await st(page);
    expect(s.stamina.current).toBe(92);
    expect(s.hud!.staminaText).toBe('92/100');

    // F8 (phím thử): −20 mỗi lần. 92 → 72 → 52 (xanh) → 32 (vàng) → 12 (đỏ) → 0 (đuối).
    const seen: { cur: number; band: string }[] = [];
    for (let i = 0; i < 4; i++) {
      await press(page, 'F8');
      s = await st(page);
      seen.push({ cur: s.stamina.current, band: s.hud!.staminaBand });
      expect(s.stamina.exhausted).toBe(false);
      expect(s.stamina.curses).toBe(0);
      if (i === 2) await shot(page, 't004-bar-yellow.png', { x: 0, y: 0, width: 520, height: 130 });
      if (i === 3) await shot(page, 't004-bar-red.png', { x: 0, y: 0, width: 520, height: 130 });
    }
    expect(seen).toEqual([
      { cur: 72, band: 'green' },
      { cur: 52, band: 'green' },
      { cur: 32, band: 'yellow' },
      { cur: 12, band: 'red' },
    ]);
    // F8 liền tay: chữ gộp cộng dồn (BUG-012) → −20 / −40 / −60 / −80 tuỳ nhịp máy.
    expect((await st(page)).stamina.floatLog.at(-1)).toMatch(/^−(20|40|60|80) Sức$/);

    // Lần F8 cuối: hết Sức → đuối, chửi đúng 1 câu bong bóng đỏ + tiếng càu nhàu.
    await press(page, 'F8');
    s = await st(page);
    expect(s.stamina).toMatchObject({ current: 0, exhausted: true, band: 'red', speedMultiplier: 0.5, curses: 1 });
    expect(s.stamina.lastCurseSfx).toMatch(/^sfx-voice-cau-nhau-[12]$/);
    expect(s.bubble).toMatchObject({ visible: true, kind: 'grumble', text: CURSE });
    expect(s.hud!.staminaText).toBe('0/100');
    await shot(page, 't004-exhausted-curse.png'); // chụp ngay khi bong bóng chửi còn hiện (2.5 s)
    await expect.poll(async () => (await st(page)).hud!.vignetteAlpha, { timeout: 10_000 }).toBeGreaterThan(0.5);
    // Bong bóng lắc nhẹ: lệch ngang thay đổi giữa các frame.
    const shakes = new Set<number>();
    for (let i = 0; i < 6; i++) {
      shakes.add(Math.round((await st(page)).bubble.shakeX * 10));
      await waitFrames(page, 2);
    }
    expect(shakes.size).toBeGreaterThan(1);
    await shot(page, 't004-exhausted-vignette.png');
    // F8 tiếp khi đang đuối: không chửi lại.
    await press(page, 'F8');
    expect((await st(page)).stamina.curses).toBe(1);

    // Đuối → đi chậm còn ×0.5 (128 px/giây), anim bước chậm theo tốc độ thật.
    await page.keyboard.down('s');
    await waitFrames(page, 20);
    s = await st(page);
    await page.keyboard.up('s');
    expect(s.stamina.speedPx).toBeCloseTo(128, 0);
    expect(s.anim.playing).toBe(true);
    expect(s.anim.timeScale).toBeGreaterThan(0.35);
    expect(s.anim.timeScale).toBeLessThan(0.65);
    await teleportAndSettle(page, 12, 14);

    // Click ruộng khi đuối → không làm, bong bóng "đuối rồi…" (chờ câu chửi tắt — chửi thề được ưu tiên hơn).
    await bubbleGone(page);
    await clickTile(page, 14, 14);
    await expect.poll(async () => (await st(page)).bubble).toMatchObject({ visible: true, kind: 'warn', text: TOO_TIRED });
    s = await st(page);
    expect(s.action.busy).toBe(false);
    expect(plotOf(s, 14, 14).tillStrikes).toBe(0);
    expect(s.stamina.tooTired).toBeGreaterThanOrEqual(1);
    await moveMouseToTile(page, 14, 14);
    await shot(page, 't004-too-tired.png');

    // Chọn ô hotbar có khoai, chuột phải: +8 Sức, chữ "+8 Sức" xanh, ô giảm 1, hết đuối.
    await call(page, 'debugSetSlot', 2, 'khoai-lang', 3);
    await press(page, '3');
    await rightClick(page);
    s = await st(page);
    expect(s.stamina).toMatchObject({ current: 8, exhausted: false, speedMultiplier: 1, eats: 1 });
    expect(s.inventory.slots[2]).toMatchObject({ id: 'khoai-lang', count: 2 });
    expect(s.stamina.floatLog.at(-1)).toBe('+8 Sức');
    expect(s.stamina.floatsActive).toContain('+8 Sức');
    expect(s.hud!.hotbarCounts[2]).toBe('2');
    expect(s.hud!).toMatchObject({ eatBounces: 1, lastEatSlot: 2 }); // ô hotbar nảy
    await shot(page, 't004-eat.png');
    await expect.poll(async () => (await st(page)).hud!.vignetteAlpha, { timeout: 10_000 }).toBe(0);
    // Hết đuối: lại cuốc được (8 ≥ 4).
    await tillOne(page, 14, 14);
    expect((await st(page)).stamina.current).toBe(4);
  });

  test('thiếu Sức giữa hàng chờ cuốc: ô kế tới lượt không làm, "đuối rồi…", xóa hàng chờ; bỏ dở không trừ', async ({ page }) => {
    test.setTimeout(120_000);
    await call(page, 'debugSetBarkTuning', { chance: 0 });
    await teleportAndSettle(page, 12, 14);

    // Bỏ dở bằng WASD: không mất Sức.
    await call(page, 'debugSetStamina', 50);
    await call(page, 'debugSetTillTuning', { strikeSeconds: 0.5 });
    await clickTile(page, 13, 15);
    await expect.poll(async () => plotOf(await st(page), 13, 15).tillStrikes, { timeout: 15_000 }).toBeGreaterThanOrEqual(2);
    await press(page, 'd');
    let s = await st(page);
    expect(s.till.cancels).toBe(1);
    expect(s.stamina.current).toBe(50);
    expect(plotOf(s, 13, 15).soil).toBe('untilled');
    await teleportAndSettle(page, 12, 14);

    // Thiếu Sức ngay từ đầu (3 < 4): click ô không cuốc, "đuối rồi…", không bổ nhát nào.
    await call(page, 'debugSetStamina', 3);
    await clickTile(page, 13, 14);
    await expect.poll(async () => (await st(page)).bubble).toMatchObject({ visible: true, text: TOO_TIRED });
    await waitFrames(page, 20);
    s = await st(page);
    expect(s.action.busy).toBe(false);
    expect(plotOf(s, 13, 14).tillStrikes).toBe(0);
    expect(s.stamina.current).toBe(3);
    // Ô cuốc dở cũng vậy: làm tiếp cần đủ Sức.
    await clickTile(page, 13, 15);
    await waitFrames(page, 20);
    expect((await st(page)).action.busy).toBe(false);
    await bubbleGone(page);

    // Sức 9: ô 1 (13,13) xong → 5; ô 2 (13,14) tới lượt 5 ≥ 4 → xong → 1; ô 3 (14,14) tới lượt 1 < 4 → dừng, xóa hàng chờ.
    await call(page, 'debugSetStamina', 9);
    await call(page, 'debugSetTillTuning', { strikeSeconds: 3 }); // nhát rất dài lúc xếp hàng (máy test chậm cũng kịp)
    await moveMouseToTile(page, 13, 13);
    await page.mouse.down();
    await expect.poll(async () => (await st(page)).action.current).toEqual({ x: 13, y: 13 });
    for (const [x, y] of [
      [13, 14],
      [14, 14],
      [14, 13],
    ] as const) {
      await moveMouseToTile(page, x, y);
      await waitFrames(page, 2);
    }
    await page.mouse.up();
    s = await st(page);
    expect(s.action.queue).toEqual([
      { x: 13, y: 14 },
      { x: 14, y: 14 },
      { x: 14, y: 13 },
    ]);
    await shot(page, 't004-queue-before.png');
    // Rút ngắn nhát để ca chạy nhanh (ô đang cuốc giữ số nhát đã tính).
    await call(page, 'debugSetTillTuning', { strikeSeconds: 0.12 });
    await expect.poll(async () => (await st(page)).till.finishes, { timeout: 30_000 }).toBe(2);
    await idle(page);
    s = await st(page);
    expect(plotOf(s, 13, 13).soil).toBe('tilled');
    expect(plotOf(s, 13, 14).soil).toBe('tilled');
    expect(plotOf(s, 14, 14)).toMatchObject({ soil: 'untilled', tillStrikes: 0 });
    expect(plotOf(s, 14, 13)).toMatchObject({ soil: 'untilled', tillStrikes: 0 });
    expect(s.action.queue).toHaveLength(0);
    expect(s.stamina.current).toBe(1);
    expect(s.stamina.exhausted).toBe(false);
    expect(s.bubble).toMatchObject({ visible: true, text: TOO_TIRED });
    await shot(page, 't004-queue-out-of-stamina.png');

    // Việc nhanh vẫn được với 1 Sức: gieo −1 → 0 → đuối + chửi; tưới tiếp thì "đuối rồi…".
    await bubbleGone(page);
    await press(page, '1');
    await clickTile(page, 13, 14);
    await expect.poll(async () => (await st(page)).farmJuice.plants).toBe(1);
    s = await st(page);
    expect(s.stamina).toMatchObject({ current: 0, exhausted: true, curses: 1 });
    expect(s.bubble).toMatchObject({ kind: 'grumble', text: CURSE });
    await idle(page);
    await bubbleGone(page);
    await clickTile(page, 13, 14);
    await expect.poll(async () => (await st(page)).bubble.text).toBe(TOO_TIRED);
    await waitFrames(page, 20);
    expect((await st(page)).farmJuice.waters).toBe(0);
  });

  test('việc nhanh tốn 1 Sức mỗi lần: gieo, tưới', async ({ page }) => {
    await call(page, 'debugSetBarkTuning', { chance: 0 });
    await teleportAndSettle(page, 12, 14);
    await call(page, 'debugSetTillTuning', { strikeSeconds: 0.08 });
    await tillOne(page, 13, 14);
    expect((await st(page)).stamina.current).toBe(96);
    await press(page, '1');
    await clickTile(page, 13, 14);
    await expect.poll(async () => (await st(page)).farmJuice.plants).toBe(1);
    expect((await st(page)).stamina.current).toBe(95);
    await idle(page);
    await clickTile(page, 13, 14);
    await expect.poll(async () => (await st(page)).farmJuice.waters).toBe(1);
    expect((await st(page)).stamina.current).toBe(94);
  });

  test('ăn khi đang cuốc: Sức +8, không ngắt việc, xong ô vẫn −4', async ({ page }) => {
    await call(page, 'debugSetBarkTuning', { chance: 0 });
    await teleportAndSettle(page, 12, 14);
    await call(page, 'debugSetStamina', 40);
    await call(page, 'debugSetSlot', 2, 'khoai-lang', 2);
    await press(page, '3');
    await call(page, 'debugSetTillTuning', { strikeSeconds: 0.5 });
    await clickTile(page, 13, 14);
    await expect.poll(async () => (await st(page)).action.strikesDone, { timeout: 15_000 }).toBeGreaterThanOrEqual(1);
    await rightClick(page);
    let s = await st(page);
    expect(s.stamina.current).toBe(48);
    expect(s.stamina.eats).toBe(1);
    expect(s.action).toMatchObject({ busy: true, current: { x: 13, y: 14 }, kind: 'till' });
    expect(s.till.cancels).toBe(0);
    expect(s.inventory.slots[2]?.count).toBe(1);
    await call(page, 'debugSetTillTuning', { strikeSeconds: 0.1 });
    await expect.poll(async () => plotOf(await st(page), 13, 14).soil, { timeout: 20_000 }).toBe('tilled');
    s = await st(page);
    expect(s.stamina.current).toBe(44);
    expect(s.till.cancels).toBe(0);
  });

  test('chuột phải trên hạt / ô trống không làm gì; Sức đầy thì không ăn ("Còn no lắm!")', async ({ page }) => {
    await call(page, 'debugSetStamina', 60);
    await press(page, '1'); // hạt cải
    const before = await st(page);
    await rightClick(page);
    let s = await st(page);
    expect(s.stamina.current).toBe(60);
    expect(s.stamina.eats).toBe(0);
    expect(s.inventory.slots[0]).toEqual(before.inventory.slots[0]);
    expect(s.bubble.visible).toBe(false);
    await press(page, '5'); // ô trống
    await rightClick(page);
    s = await st(page);
    expect(s.stamina.current).toBe(60);
    // Rau cải sống không phải đồ ăn (GDD §3.2 không có).
    await call(page, 'debugSetSlot', 5, 'rau-cai', 2);
    await press(page, '6');
    await rightClick(page);
    expect((await st(page)).stamina.current).toBe(60);
    expect((await st(page)).inventory.slots[5]?.count).toBe(2);
    // Gần đầy: ăn khoai chỉ lên tới 100 (chữ hiện số thật được cộng).
    await call(page, 'debugSetStamina', 96);
    await call(page, 'debugSetSlot', 2, 'khoai-lang', 2);
    await press(page, '3');
    await rightClick(page);
    s = await st(page);
    expect(s.stamina.current).toBe(100);
    expect(s.stamina.floatLog.at(-1)).toBe('+4 Sức');
    expect(s.inventory.slots[2]?.count).toBe(1);
    // Đầy rồi: không ăn nữa.
    await rightClick(page);
    s = await st(page);
    expect(s.inventory.slots[2]?.count).toBe(1);
    expect(s.stamina.eats).toBe(1);
    expect(s.bubble).toMatchObject({ visible: true, text: 'Còn no lắm!' });
  });

  test('BUG-012: ăn liền tay 3 củ → một chữ cộng dồn "+24 Sức"; chữ khác loại không đè nhau', async ({ page }) => {
    await call(page, 'debugSetStamina', 20);
    await call(page, 'debugSetSlot', 2, 'khoai-lang', 5);
    await press(page, '3');
    const p = await tileToPage(page, 11, 12);
    // 3 lần chuột phải thật nhanh (không chờ frame giữa các lần).
    for (let i = 0; i < 3; i++) await page.mouse.click(p.x, p.y, { button: 'right' });
    await waitFrames(page, 3);
    let s = await st(page);
    expect(s.stamina.current).toBe(44);
    expect(s.stamina.eats).toBe(3);
    expect(s.stamina.floatsActive).toEqual(['+24 Sức']);
    expect(s.stamina.floatLog.slice(-3)).toEqual(['+8 Sức', '+16 Sức', '+24 Sức']);
    await shot(page, 't004-eat-merged.png');
    // Chữ khác loại cùng lúc: "−20 Sức" (F8) rồi ăn ngay "+8 Sức" → 2 chữ, lệch nhau theo chiều dọc.
    await expect.poll(async () => (await st(page)).stamina.floatsActive, { timeout: 10_000 }).toEqual([]);
    await page.keyboard.press('F8');
    await page.mouse.click(p.x, p.y, { button: 'right' });
    await waitFrames(page, 3);
    s = await st(page);
    expect(s.stamina.current).toBe(32);
    const ys = s.stamina.floatsActiveY;
    expect(ys.map((f) => f.text).sort()).toEqual(['+8 Sức', '−20 Sức']);
    expect(Math.abs(ys[0].y - ys[1].y)).toBeGreaterThanOrEqual(20);
    await shot(page, 't004-float-stacked.png');
  });

  test('màu thanh Sức theo ngưỡng: 50 xanh, 49 vàng, 20 vàng, 19 đỏ; chữ "64/100"', async ({ page }) => {
    const cases: [number, string, number][] = [
      [64, 'green', GREEN],
      [50, 'green', GREEN],
      [49, 'yellow', YELLOW],
      [20, 'yellow', YELLOW],
      [19, 'red', RED],
      [1, 'red', RED],
    ];
    for (const [v, band, color] of cases) {
      await call(page, 'debugSetStamina', v);
      await waitFrames(page, 2);
      const s = await st(page);
      expect(s.hud!.staminaText).toBe(`${v}/100`);
      expect(s.hud!.staminaBand).toBe(band);
      expect(s.hud!.staminaFillColor).toBe(color);
      expect(s.hud!.staminaFillRatio).toBeCloseTo(v / 100, 5);
      expect(s.stamina.exhausted).toBe(false);
      if (v === 64) await shot(page, 't004-bar-green-64.png', { x: 0, y: 0, width: 520, height: 130 });
    }
    await call(page, 'debugSetStamina', 64);
    await waitFrames(page, 2);
    await shot(page, 't004-hud.png');
  });

  test('lầm bầm khi xong ô cuốc: bong bóng thường, có thời gian nghỉ, không đè câu chửi', async ({ page }) => {
    test.setTimeout(90_000);
    await teleportAndSettle(page, 12, 14);
    await call(page, 'debugSetTillTuning', { strikeSeconds: 0.08 });
    // Ép xác suất 1, nghỉ 20 s: ô đầu lầm bầm, ô thứ hai (ngay sau) thì không.
    await call(page, 'debugSetBarkTuning', { chance: 1, cooldownSeconds: 20 });
    await tillOne(page, 13, 14);
    let s = await st(page);
    expect(s.stamina.barks).toBe(1);
    expect(BARKS).toContain(s.stamina.lastBark);
    expect(s.bubble).toMatchObject({ visible: true, kind: 'bark' });
    expect(BARKS).toContain(s.bubble.text);
    await shot(page, 't004-bark.png');
    const first = s.stamina.lastBark;
    await tillOne(page, 13, 13);
    expect((await st(page)).stamina.barks).toBe(1);
    // Hết nghỉ (0 s): lầm bầm tiếp, không lặp câu vừa nói.
    await call(page, 'debugSetBarkTuning', { cooldownSeconds: 0 });
    await tillOne(page, 13, 15);
    s = await st(page);
    expect(s.stamina.barks).toBe(2);
    expect(s.stamina.lastBark).not.toBe(first);
    // Xong ô mà hết Sức đúng lúc đó: chửi thề, KHÔNG lầm bầm đè lên.
    await bubbleGone(page);
    await call(page, 'debugSetStamina', 4);
    await tillOne(page, 14, 14);
    s = await st(page);
    expect(s.stamina).toMatchObject({ current: 0, exhausted: true, curses: 1, barks: 2 });
    expect(s.bubble).toMatchObject({ kind: 'grumble', text: CURSE });
    // Xác suất 0: không bao giờ lầm bầm.
    await call(page, 'debugSetStamina', 100);
    await call(page, 'debugSetBarkTuning', { chance: 0 });
    await bubbleGone(page);
    await tillOne(page, 14, 13);
    expect((await st(page)).stamina.barks).toBe(2);
  });
});

// Bản build (vite preview trên dist/): F8 không trừ Sức (devCheatsEnabled = false). Chỉ chạy khi đặt QA_PROD=1 và
// E2E_BASE_URL trỏ vào bản preview, ví dụ:
//   (cd web/client && npx vite preview --port 4173 --strictPort)
//   QA_PROD=1 E2E_BASE_URL=http://localhost:4173 npx playwright test stamina
test('bản build: F8 không trừ Sức', async ({ page }) => {
  test.skip(!PROD, 'chỉ chạy với QA_PROD=1 trên bản build');
  for (let i = 0; i < 3; i++) await press(page, 'F8');
  const s = await st(page);
  expect(s.stamina.current).toBe(100);
  expect(s.stamina.floatLog).toEqual([]);
  expect(s.hud!.staminaText).toBe('100/100');
});
