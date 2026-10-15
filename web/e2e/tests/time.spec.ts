// T-005 — Đồng hồ ngày trên HUD, trời tối dần, Tạm dừng (Esc / chuyển tab) (GDD §3.1, §11; D-019, D-022).
// Theo "Bạn thử thế nào" của T-005: đồng hồ góc trên phải chạy → F9 nhiều lần: chiều vàng, tối dần, 23h nháy đỏ →
// chuyển tab rồi quay lại: đang Tạm dừng, giờ không nhảy → Esc chơi tiếp. Thêm: gùi dừng đồng hồ, cuốc thì đồng hồ chạy,
// Esc khi gùi mở chỉ đóng gùi, nút "Tiếp tục", Alt+Tab (window blur), Tạm dừng giữa lúc cuốc không nhảy nhát (D-022),
// phím bấm lúc dừng không có tác dụng sau khi chơi tiếp, 24:00 ngủ gục (T-007), bố cục HUD 1366×768,
// bản build không có F9.
// Đọc trạng thái qua window.__game.scene.getScene('Garden').debugState. Chờ theo TRẠNG THÁI (expect.poll / frame game),
// không chờ giờ cố định (BUG-006) — riêng các ca "đứng yên" phải chờ một khoảng thật để chứng minh không có gì đổi.
// Playwright KHÔNG chuyển tab / Alt+Tab thật được: giả lập bằng sự kiện visibilitychange (document.hidden = true) và
// window blur — người dùng cần tự thử thật (xem báo cáo).
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
interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}
interface GState {
  gardenReady: boolean;
  view: { x: number; y: number; w: number; h: number };
  farm: { plots: { x: number; y: number; soil: string; tillStrikes: number }[] };
  action: { busy: boolean; current: XY | null; progress: number; strikesDone: number; kind: string | null };
  till: { finishes: number; cancels: number; bars: { x: number; y: number; filled: number }[]; tuning: { strikeSeconds: number } };
  inventory: { selected: number };
  bagOpen: boolean;
  bubble: { visible: boolean; shows: number };
  stamina: { current: number; eats: number };
  farmJuice: { nights: number };
  time: {
    day: number;
    hour: number;
    clockText: string;
    dayText: string;
    phase: string;
    elapsedSeconds: number;
    dayOver: boolean;
    dayEndHits: number;
    warn: boolean;
    stopped: boolean;
    reasons: string[];
    devHourPresses: number;
  };
  sky: { color: number; alpha: number; visible: boolean };
  pause: { menuOpen: boolean; cause: string | null; hoverResume: boolean; opens: number; musicVolume: number | null };
  anim: { playing: boolean };
  footX: number;
  footY: number;
  hud: {
    clockText: string;
    dayText: string;
    clockColor: string;
    clockWarn: boolean;
    clockIcon: string;
    pauseVisible: boolean;
    pauseButtonHover: boolean;
    bagVisible: boolean;
    hintLines: string[];
    hintBounds: Rect[];
    hudRects: { stamina: Rect; hotbar: Rect; bagButton: Rect; clock: Rect };
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

// Palette (Art Bible) — màu trời và chữ đồng hồ.
const INDIGO = 0x2f4b73;
const VERMILION = 0xa93226;
const RED_CSS = '#a93226';
const PAPER_CSS = '#efe4c8';
const SKY_MAX = 0.45;
const HINT_MAIN = 'WASD đi · Click làm · 1–9 chọn · E Gùi · Esc Menu';
/** 1 giây thật = 18 / 600 giờ game. */
const HOURS_PER_SEC = 18 / 600;

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
async function clickTile(page: Page, tx: number, ty: number): Promise<void> {
  const p = await tileToPage(page, tx, ty);
  await page.mouse.move(p.x, p.y);
  await page.mouse.down();
  await page.mouse.up();
}
async function press(page: Page, key: string): Promise<void> {
  await page.keyboard.press(key);
  await waitFrames(page, 3);
}

/** Dừng hẳn 2 scene của Phaser lúc chụp ảnh để ảnh ổn định (không liên quan Tạm dừng của game). */
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

/** Giả lập đổi tab / thu nhỏ trình duyệt: document.hidden = true + sự kiện visibilitychange (rồi hiện lại). */
async function simulateHidden(page: Page, hidden: boolean): Promise<void> {
  await page.evaluate((h) => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => h });
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => (h ? 'hidden' : 'visible') });
    document.dispatchEvent(new Event('visibilitychange'));
  }, hidden);
}
/** Giả lập Alt+Tab sang cửa sổ khác khi tab vẫn hiện: sự kiện blur trên window. */
async function simulateBlur(page: Page): Promise<void> {
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
}

/** Hai màu 0xRRGGBB gần nhau (mỗi kênh lệch ≤ tol) — đồng hồ vẫn chạy vài frame sau khi đặt giờ nên màu trời nhích nhẹ. */
const colorNear = (a: number, b: number, tol = 12) =>
  [16, 8, 0].every((sh) => Math.abs(((a >> sh) & 0xff) - ((b >> sh) & 0xff)) <= tol);
const now = (page: Page) => page.evaluate(() => performance.now());

/**
 * Bấm Esc để chơi tiếp rồi kiểm "không nhảy giờ": số giây đồng hồ chạy thêm không vượt thời gian THẬT tính từ lúc bấm
 * Esc (+ một frame dư). Máy test headless chậm (vài frame/giây) nên không so với một số cố định.
 */
async function resumeAndCheckNoJump(page: Page, e0: number, awaySeconds: number): Promise<void> {
  const t0 = await now(page);
  await page.keyboard.press('Escape');
  await expect.poll(async () => (await st(page)).pause.menuOpen, { timeout: 5_000, intervals: [20] }).toBe(false);
  const s = await st(page);
  const real = ((await now(page)) - t0) / 1000;
  const ran = s.time.elapsedSeconds - e0;
  expect(ran).toBeGreaterThanOrEqual(0);
  expect(ran).toBeLessThanOrEqual(real + 0.26);
  expect(ran).toBeLessThan(awaySeconds);
}

const overlap = (a: Rect, b: Rect) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

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
  test.skip(PROD, 'các ca này dùng phím thử F9 — chỉ có ở bản dev');

  test('Bạn thử thế nào: đồng hồ chạy → F9: chiều vàng, hoàng hôn, tối dần → 23h nháy đỏ', async ({ page }) => {
    test.setTimeout(120_000);
    let s = await st(page);
    // Ngày 1 bắt đầu 6h, chưa ai bấm gì, không tự Tạm dừng.
    expect(s.time.day).toBe(1);
    expect(s.time.hour).toBeLessThan(6.2);
    expect(s.hud!.dayText).toBe('Ngày 1 · Mùa nắng');
    expect(s.hud!.clockText).toMatch(/^06:\d\d$/);
    expect(s.hud!.clockIcon).toBe('sun');
    expect(s.time.phase).toBe('morning');
    expect(s.pause.opens).toBe(0);
    expect(s.time.stopped).toBe(false);

    // Đồng hồ chạy theo giờ thật: đo trong ~1.5 s, ~0.03 giờ game mỗi giây (lỏng tay vì máy test chậm).
    const t0 = await page.evaluate(() => performance.now());
    const h0 = s.time.hour;
    await expect.poll(async () => (await st(page)).time.hour, { timeout: 10_000 }).toBeGreaterThan(h0 + 0.04);
    const t1 = await page.evaluate(() => performance.now());
    s = await st(page);
    const rate = (s.time.hour - h0) / ((t1 - t0) / 1000);
    expect(rate).toBeGreaterThan(HOURS_PER_SEC * 0.5);
    expect(rate).toBeLessThan(HOURS_PER_SEC * 1.6);
    expect(s.hud!.clockText).toBe(s.time.clockText);
    await shot(page, 't005-sang.png');
    expect((await st(page)).sky.visible).toBe(true); // sáng sớm hơi xanh sương

    // F9 = +1 giờ game.
    const before = (await st(page)).time.hour;
    await press(page, 'F9');
    s = await st(page);
    expect(s.time.devHourPresses).toBe(1);
    expect(s.time.hour - before).toBeGreaterThan(0.99);
    expect(s.time.hour - before).toBeLessThan(1.05);

    // F9 tới trưa/chiều: trời trong (không phủ).
    for (let i = 0; i < 7; i++) await press(page, 'F9');
    s = await st(page);
    expect(s.time.hour).toBeGreaterThanOrEqual(14);
    expect(s.time.phase).toBe('midday');
    expect(s.sky.alpha).toBe(0);
    await call(page, 'debugSetHour', 14.5);
    await waitFrames(page, 3);
    expect((await st(page)).hud!.clockText).toMatch(/^14:3\d$/);
    await shot(page, 't005-chieu.png');

    // Chiều muộn ngả vàng → hoàng hôn đỏ son (17–19h).
    await call(page, 'debugSetHour', 16.5);
    await press(page, 'F9'); // 17:30
    s = await st(page);
    expect(s.time.phase).toBe('dusk');
    expect(s.sky.alpha).toBeGreaterThan(0.1);
    await call(page, 'debugSetHour', 18);
    await waitFrames(page, 3);
    s = await st(page);
    expect(colorNear(s.sky.color, VERMILION)).toBe(true);
    expect(s.hud!.clockIcon).toBe('sun');
    await shot(page, 't005-hoang-hon.png');

    // Tối 19–24h: màu chàm, đậm dần; icon trăng.
    const alphas: number[] = [];
    await call(page, 'debugSetHour', 19);
    for (let i = 0; i < 3; i++) {
      await press(page, 'F9'); // 20, 21, 22
      s = await st(page);
      expect(s.time.phase).toBe('night');
      expect(s.sky.color).toBe(INDIGO);
      alphas.push(s.sky.alpha);
    }
    expect(alphas[1]).toBeGreaterThan(alphas[0]);
    expect(alphas[2]).toBeGreaterThan(alphas[1]);
    expect(s.hud!.clockIcon).toBe('moon');
    expect(s.time.warn).toBe(false);
    expect(s.hud!.clockColor).toBe(PAPER_CSS);
    await call(page, 'debugSetHour', 21);
    await waitFrames(page, 3);
    await shot(page, 't005-toi.png');

    // 23h: đồng hồ nhấp nháy đỏ son ↔ trắng điệp.
    await call(page, 'debugSetHour', 22.5);
    await press(page, 'F9'); // 23:30
    s = await st(page);
    expect(s.time.warn).toBe(true);
    expect(s.hud!.clockWarn).toBe(true);
    const colors = new Set<string>();
    await expect
      .poll(
        async () => {
          colors.add((await st(page)).hud!.clockColor);
          return colors.has(RED_CSS) && colors.has(PAPER_CSS);
        },
        { timeout: 10_000, intervals: [60] },
      )
      .toBe(true);
    await expect.poll(async () => (await st(page)).hud!.clockColor, { timeout: 5_000, intervals: [30] }).toBe(RED_CSS);
    await shot(page, 't005-23h-do.png');
    // Gần nửa đêm: tối nhất nhưng không quá skyTintMaxAlpha.
    s = await st(page);
    expect(s.sky.alpha).toBeGreaterThan(0.4);
    expect(s.sky.alpha).toBeLessThanOrEqual(SKY_MAX + 1e-6);
  });

  test('24:00: đồng hồ dừng ở 24:00, ngủ gục (T-007) — F9 lúc ngủ gục không tác dụng — sáng ngày 2 đi lại được', async ({ page }) => {
    test.setTimeout(90_000);
    await call(page, 'debugSetHour', 23.5);
    await press(page, 'F9');
    let s = await st(page);
    expect(s.time.hour).toBe(24);
    expect(s.time.clockText).toBe('24:00');
    expect(s.time.dayOver).toBe(true);
    expect(s.time.dayEndHits).toBe(1);
    expect(s.sky.alpha).toBeCloseTo(SKY_MAX, 5);
    await press(page, 'F9');
    await waitFrames(page, 20);
    s = await st(page);
    expect(s.time.clockText).toBe('24:00');
    expect(s.hud!.clockText).toBe('24:00');
    expect(s.time.dayEndHits).toBe(1);
    expect(s.time.warn).toBe(true);
    expect(s.time.reasons).toEqual(['sleep']); // đang ngủ gục
    // Tổng kết → Enter (lần 1 có thể chỉ hiện hết) → sáng ngày 2.
    await expect.poll(async () => (await st(page)).time.reasons, { timeout: 15_000 }).toContain('daySummary');
    await press(page, 'Enter');
    if ((await st(page)).time.reasons.includes('daySummary')) await press(page, 'Enter');
    await expect.poll(async () => (await st(page)).time.reasons, { timeout: 10_000 }).toEqual([]);
    expect((await st(page)).time.day).toBe(2);
    expect((await st(page)).time.dayEndHits).toBe(1);
    // Đi lại được.
    await teleportAndSettle(page, 12, 14);
    const y0 = (await st(page)).footY;
    await page.keyboard.down('s');
    await waitFrames(page, 10);
    await page.keyboard.up('s');
    expect((await st(page)).footY).toBeGreaterThan(y0);
  });

  test('đồng hồ dừng khi mở gùi (E), chạy khi đang cuốc (D-022)', async ({ page }) => {
    test.setTimeout(90_000);
    await press(page, 'e');
    let s = await st(page);
    expect(s.bagOpen).toBe(true);
    expect(s.time.stopped).toBe(true);
    expect(s.time.reasons).toEqual(['bag']);
    const e0 = s.time.elapsedSeconds;
    await page.waitForTimeout(1200);
    s = await st(page);
    expect(s.time.elapsedSeconds).toBe(e0);
    // F9 lúc mở gùi không làm gì (giống G).
    await press(page, 'F9');
    expect((await st(page)).time.elapsedSeconds).toBe(e0);
    await press(page, 'e');
    s = await st(page);
    expect(s.bagOpen).toBe(false);
    expect(s.time.reasons).toEqual([]);
    await expect.poll(async () => (await st(page)).time.elapsedSeconds, { timeout: 5_000 }).toBeGreaterThan(e0);

    // Cuốc (nhát dài 0.6 s): đồng hồ vẫn chạy trong lúc cuốc.
    await teleportAndSettle(page, 12, 14);
    await call(page, 'debugSetTillTuning', { strikeSeconds: 0.6 });
    await clickTile(page, 13, 14);
    await expect.poll(async () => (await st(page)).action.kind, { timeout: 10_000 }).toBe('till');
    const h1 = (await st(page)).time.hour;
    await expect.poll(async () => (await st(page)).action.strikesDone, { timeout: 10_000 }).toBeGreaterThanOrEqual(2);
    s = await st(page);
    expect(s.action.kind).toBe('till');
    expect(s.time.stopped).toBe(false);
    expect(s.time.hour).toBeGreaterThan(h1);
  });

  test('Esc mở / đóng Tạm dừng; gùi mở thì Esc chỉ đóng gùi; nút "Tiếp tục"; nhạc nhỏ lại khi dừng', async ({ page }) => {
    test.setTimeout(90_000);
    // Bấm một phím để trình duyệt mở khóa âm thanh (nhạc nền bắt đầu).
    await press(page, '1');
    await press(page, 'Escape');
    let s = await st(page);
    expect(s.pause.menuOpen).toBe(true);
    expect(s.pause.cause).toBe('esc');
    expect(s.hud!.pauseVisible).toBe(true);
    expect(s.time.reasons).toEqual(['pauseMenu']);
    expect(s.anim.playing).toBe(false);
    if (s.pause.musicVolume !== null) expect(s.pause.musicVolume).toBeCloseTo(0.6 * 0.35, 2);
    const e0 = s.time.elapsedSeconds;
    await page.waitForTimeout(1000);
    expect((await st(page)).time.elapsedSeconds).toBe(e0);
    await shot(page, 't005-tam-dung.png');
    await press(page, 'Escape');
    s = await st(page);
    expect(s.pause.menuOpen).toBe(false);
    expect(s.hud!.pauseVisible).toBe(false);
    expect(s.time.reasons).toEqual([]);
    if (s.pause.musicVolume !== null) expect(s.pause.musicVolume).toBeCloseTo(0.6, 2);
    await expect.poll(async () => (await st(page)).time.elapsedSeconds, { timeout: 5_000 }).toBeGreaterThan(e0);

    // Gùi mở → Esc chỉ đóng gùi, KHÔNG mở Tạm dừng.
    await press(page, 'e');
    expect((await st(page)).bagOpen).toBe(true);
    await press(page, 'Escape');
    s = await st(page);
    expect(s.bagOpen).toBe(false);
    expect(s.pause.menuOpen).toBe(false);
    expect(s.pause.opens).toBe(1);

    // Nút "Tiếp tục": rê vào thì sáng (hover), click thì chơi tiếp.
    await press(page, 'Escape');
    expect((await st(page)).pause.menuOpen).toBe(true);
    // T-026: cửa sổ Tạm dừng cao thêm (2 hàng âm lượng) → lấy tâm nút từ game thay vì toạ độ cố định.
    const btn = await gameToPage(page, await call<{ x: number; y: number }>(page, 'debugPauseButtonCenter', 'resume'));
    await page.mouse.move(btn.x, btn.y);
    await expect.poll(async () => (await st(page)).hud!.pauseButtonHover, { timeout: 5_000 }).toBe(true);
    await page.mouse.down();
    await page.mouse.up();
    await waitFrames(page, 3);
    s = await st(page);
    expect(s.pause.menuOpen).toBe(false);
    expect(s.time.reasons).toEqual([]);
  });

  test('chuyển tab (visibilitychange) và Alt+Tab (blur) → tự Tạm dừng; quay lại không nhảy giờ', async ({ page }) => {
    test.setTimeout(90_000);
    await waitFrames(page, 10);
    // Đổi tab / thu nhỏ.
    await simulateHidden(page, true);
    let s = await st(page);
    expect(s.pause.menuOpen).toBe(true);
    expect(s.pause.cause).toBe('hidden');
    const e0 = s.time.elapsedSeconds;
    await page.waitForTimeout(3000);
    await simulateHidden(page, false);
    await waitFrames(page, 10);
    s = await st(page);
    expect(s.pause.menuOpen).toBe(true); // quay lại vẫn đang dừng, chờ người chơi
    expect(s.time.elapsedSeconds).toBe(e0);
    // Chơi tiếp đúng giờ cũ: không cộng dồn 3 giây đã ở ngoài.
    await resumeAndCheckNoJump(page, e0, 3);

    // Alt+Tab khi tab vẫn hiện.
    await waitFrames(page, 10);
    await simulateBlur(page);
    s = await st(page);
    expect(s.pause.menuOpen).toBe(true);
    expect(s.pause.cause).toBe('blur');
    const e1 = s.time.elapsedSeconds;
    await page.waitForTimeout(3000);
    s = await st(page);
    expect(s.time.elapsedSeconds).toBe(e1);
    await resumeAndCheckNoJump(page, e1, 3);

    // Mất focus lúc đang mở gùi: Tạm dừng nằm trên gùi; Esc đầu đóng Tạm dừng, Esc sau đóng gùi.
    await press(page, 'e');
    await simulateBlur(page);
    s = await st(page);
    expect(s.time.reasons).toEqual(['bag', 'pauseMenu']);
    await press(page, 'Escape');
    s = await st(page);
    expect(s.pause.menuOpen).toBe(false);
    expect(s.bagOpen).toBe(true);
    expect(s.time.stopped).toBe(true);
    await press(page, 'Escape');
    s = await st(page);
    expect(s.bagOpen).toBe(false);
    expect(s.time.stopped).toBe(false);
  });

  test('D-022: Tạm dừng giữa lúc cuốc → nhát cuốc và thanh tiến độ đứng yên, chơi tiếp chạy đúng chỗ, không nhảy nhát', async ({ page }) => {
    test.setTimeout(90_000);
    await teleportAndSettle(page, 12, 14);
    await call(page, 'debugSetTillTuning', { strikeSeconds: 0.8 });
    await clickTile(page, 13, 14);
    // Chờ giữa một nhát (đã chạm ≥ 1 nhát, nhát đang làm đi được 20–70%).
    await expect
      .poll(
        async () => {
          const a = (await st(page)).action;
          return a.kind === 'till' && a.strikesDone >= 1 && a.progress > 0.2 && a.progress < 0.7;
        },
        { timeout: 15_000, intervals: [20] },
      )
      .toBe(true);
    await simulateBlur(page);
    const p0 = await st(page);
    expect(p0.pause.menuOpen).toBe(true);
    const plot0 = p0.farm.plots.find((p) => p.x === 13 && p.y === 14)!;
    await page.waitForTimeout(1500);
    const p1 = await st(page);
    expect(p1.action.progress).toBe(p0.action.progress);
    expect(p1.action.strikesDone).toBe(p0.action.strikesDone);
    expect(p1.farm.plots.find((p) => p.x === 13 && p.y === 14)!.tillStrikes).toBe(plot0.tillStrikes);
    expect(p1.till.bars).toEqual(p0.till.bars);
    expect(p1.time.elapsedSeconds).toBe(p0.time.elapsedSeconds);
    expect(p1.till.cancels).toBe(0);

    await page.keyboard.press('Escape');
    await waitFrames(page, 2);
    const p2 = await st(page);
    expect(p2.pause.menuOpen).toBe(false);
    expect(p2.action.kind).toBe('till');
    // Vài frame sau khi chơi tiếp: nhát đang làm chỉ nhích một chút từ đúng chỗ cũ (0.8 s/nhát → mỗi frame ~2%).
    const advanced = p2.action.strikesDone === p0.action.strikesDone ? p2.action.progress - p0.action.progress : 1;
    expect(advanced).toBeGreaterThanOrEqual(0);
    expect(advanced).toBeLessThan(0.25);
    expect(p2.till.cancels).toBe(0);
    // Rồi cuốc tiếp tới xong ô như thường.
    await expect.poll(async () => (await st(page)).farm.plots.find((p) => p.x === 13 && p.y === 14)!.soil, { timeout: 30_000 }).toBe('tilled');
  });

  test('phím bấm trong lúc Tạm dừng không có tác dụng sau khi chơi tiếp (E, G, F8, F9, 4, chạm D, chuột phải)', async ({ page }) => {
    test.setTimeout(90_000);
    await teleportAndSettle(page, 12, 14);
    await call(page, 'debugSetTillTuning', { strikeSeconds: 0.8 });
    await call(page, 'debugSetSlot', 3, 'khoai-lang', 2);
    await call(page, 'debugSetStamina', 50);
    await clickTile(page, 13, 14);
    await expect.poll(async () => (await st(page)).action.kind, { timeout: 10_000 }).toBe('till');
    await press(page, 'Escape');
    const s0 = await st(page);
    expect(s0.pause.menuOpen).toBe(true);
    for (const k of ['e', 'g', 'F8', 'F9', '4', 'd', 'Tab']) await press(page, k);
    const p = await tileToPage(page, 11, 12);
    await page.mouse.click(p.x, p.y, { button: 'right' });
    await page.mouse.wheel(0, 300);
    await waitFrames(page, 3);
    let s = await st(page);
    expect(s.pause.menuOpen).toBe(true);
    expect(s.bagOpen).toBe(false);
    await press(page, 'Escape');
    await waitFrames(page, 10);
    s = await st(page);
    expect(s.pause.menuOpen).toBe(false);
    expect(s.bagOpen).toBe(false); // E / Tab không mở gùi
    expect(s.farmJuice.nights).toBe(s0.farmJuice.nights); // G không qua đêm
    expect(s.time.devHourPresses).toBe(0); // F9 không cộng giờ
    expect(s.stamina.current).toBe(50); // F8 không trừ, chuột phải không ăn
    expect(s.stamina.eats).toBe(0);
    expect(s.inventory.selected).toBe(s0.inventory.selected); // phím 4 / cuộn không đổi ô
    expect(s.till.cancels).toBe(0); // chạm D không bỏ dở cuốc
    expect(s.action.kind).toBe('till');
  });

  test('bố cục HUD: đồng hồ, thanh Sức, hotbar, nút gùi, gợi ý phím không đè nhau (1920×1080 và 1366×768)', async ({ page }) => {
    let s = await st(page);
    const r = s.hud!.hudRects;
    expect(overlap(r.clock, r.stamina)).toBe(false);
    expect(overlap(r.clock, r.hotbar)).toBe(false);
    expect(overlap(r.clock, r.bagButton)).toBe(false);
    expect(s.hud!.hintLines[0]).toBe(HINT_MAIN);
    expect(s.hud!.hintLines).toContain('Chuột phải: ăn món đang chọn');
    expect(s.hud!.hintLines.join(' ')).toContain('F9 +1 giờ');
    for (const b of s.hud!.hintBounds) {
      expect(overlap(b, r.hotbar)).toBe(false);
      expect(overlap(b, r.bagButton)).toBe(false);
      expect(overlap(b, r.clock)).toBe(false);
      expect(b.x + b.w).toBeLessThanOrEqual(1920);
      expect(b.y + b.h).toBeLessThanOrEqual(1080);
    }
    await call(page, 'debugSetHour', 23.4);
    await page.setViewportSize({ width: 1366, height: 768 });
    await waitFrames(page, 10);
    await expect.poll(async () => (await st(page)).hud!.clockColor, { timeout: 5_000, intervals: [30] }).toBe(RED_CSS);
    await setPhaserPaused(page, true);
    await page.screenshot({ path: join(SCREENSHOT_DIR, 't005-1366.png') });
    await setPhaserPaused(page, false);
    s = await st(page);
    expect(s.hud!.clockText).toMatch(/^23:/);
  });
});

// Bản build (vite preview trên dist/): F9 không cộng giờ, gợi ý phím không có dòng phím thử. Chỉ chạy khi đặt QA_PROD=1:
//   cd web/client && npm run build && npx vite preview --port 4173
//   QA_PROD=1 E2E_BASE_URL=http://localhost:4173 npx playwright test time
test('bản build: F9 không cộng giờ; gợi ý phím không có "Phím thử"', async ({ page }) => {
  test.skip(!PROD, 'chỉ chạy với QA_PROD=1 trên bản build');
  const h0 = (await st(page)).time.hour;
  for (let i = 0; i < 3; i++) await press(page, 'F9');
  const s = await st(page);
  expect(s.time.devHourPresses).toBe(0);
  expect(s.time.hour - h0).toBeLessThan(0.1);
  expect(s.hud!.hintLines[0]).toBe(HINT_MAIN);
  expect(s.hud!.hintLines.join(' ')).not.toContain('Phím thử');
  // Esc / Tạm dừng vẫn chạy ở bản build.
  await press(page, 'Escape');
  expect((await st(page)).pause.menuOpen).toBe(true);
  await press(page, 'Escape');
  expect((await st(page)).pause.menuOpen).toBe(false);
});
