// T-006 — Thùng bán, tiền và sạp hạt tạm (GDD §3.9, §11; D-019).
// Theo "Bạn thử thế nào" của T-006: có nông sản trong gùi → tới thùng bán bấm F → click cải bỏ vào thùng, thấy "Cuối ngày
// bán được…" → Shift+click bỏ cả chồng → tới hộp hạt ở cổng bấm F → mua 1 hạt cải: tiền giảm 4.
// Thêm: lấy lại từ thùng, hạt không bỏ vào thùng, tiền chưa cộng ngay, Esc đóng, đồng hồ dừng khi mở, thiếu tiền nút xám,
// gùi đầy khi mua, Shift+click mua 5, F khi không đứng cạnh thì không mở, click ngoài tầm / trong tầm, viền khi trỏ vào
// thùng, va chạm, Tạm dừng chồng lên cửa sổ, bố cục 1366×768, chữ trong cửa sổ ≥ 24px.
// Đọc trạng thái qua window.__game.scene.getScene('Garden').debugState. Chờ theo TRẠNG THÁI (expect.poll / frame game),
// không chờ giờ cố định (BUG-006) — riêng ca "đồng hồ đứng yên" phải chờ một khoảng thật để chứng minh không đổi.
import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCREENSHOT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'screenshots');

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
type Slot = { id: string; count: number; name: string } | null;
interface GState {
  gardenReady: boolean;
  view: { x: number; y: number; w: number; h: number };
  footX: number;
  footY: number;
  tileX: number;
  tileY: number;
  hover: { x: number; y: number; inReach: boolean; job: string | null; highlight: string; object: string | null } | null;
  action: { busy: boolean; kind: string | null };
  inventory: { slots: Slot[]; selected: number; revision: number };
  bagOpen: boolean;
  bubble: { visible: boolean; text: string };
  time: { elapsedSeconds: number; stopped: boolean; reasons: string[] };
  pause: { menuOpen: boolean };
  money: { current: number; purchases: { cropId: string; count: number; cost: number }[]; lastCoinSfx: string | null };
  shop: { window: string | null; status: string; statusWarn: boolean; opens: { sellBox: number; seedStall: number }; keyPresses: number; nearby: string | null };
  sellBox: { slots: Slot[]; total: number; transfers: number; hover: { side: string; index: number } | null };
  seedStall: { buttons: { cropId: string; label: string; price: number; enabled: boolean }[]; hoverButton: number };
  hud: {
    moneyText: string;
    moneyFloat: string;
    sellBoxVisible: boolean;
    seedStallVisible: boolean;
    sellTotalText: string;
    shopStatusText: string;
    stallButtons: { text: string; enabled: boolean; hover: boolean }[];
    shopMinFontPx: number;
    hintLines: string[];
    hintBounds: Rect[];
    hudRects: { stamina: Rect; hotbar: Rect; bagButton: Rect; clock: Rect; money: Rect };
  } | null;
}

type SceneHook = Record<string, unknown> & { debugState: GState };
type GameHook = {
  loop: { frame: number };
  scene: { isActive(key: string): boolean; isPaused(key: string): boolean; getScene(key: string): SceneHook; pause(k: string): void; resume(k: string): void };
};

/** Bố cục bản đồ (web/client/src/data/gardenLayout.json). */
// Thùng bán cách góc nhà 1 ô (không chắn lối đi dọc tường đông của nhà — test BUG-001 trượt dọc tường).
const SELL_BOX = { x: 17, y: 11 };
const STALL = { x: 13, y: 26, w: 3, h: 2 };
const HINT_MAIN = 'WASD đi · Click làm · 1–9 chọn · E Gùi · Esc Menu';
const HINT_MAIN_2 = 'F mở thùng bán / sạp hạt · Shift+click: cả chồng';

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
async function clickGame(page: Page, g: XY, shift = false): Promise<void> {
  const p = await gameToPage(page, g);
  await page.mouse.move(p.x, p.y);
  await waitFrames(page, 2);
  if (shift) await page.keyboard.down('Shift');
  await page.mouse.down();
  await page.mouse.up();
  if (shift) await page.keyboard.up('Shift');
  await waitFrames(page, 3);
}
async function hoverTile(page: Page, tx: number, ty: number): Promise<void> {
  const p = await gameToPage(page, await call<XY>(page, 'debugTileToScreen', tx, ty));
  await page.mouse.move(p.x, p.y);
  await waitFrames(page, 3);
}
async function clickTile(page: Page, tx: number, ty: number): Promise<void> {
  await hoverTile(page, tx, ty);
  await page.mouse.down();
  await page.mouse.up();
  await waitFrames(page, 3);
}
async function clickSellSlot(page: Page, side: 'bag' | 'box', i: number, shift = false): Promise<void> {
  await clickGame(page, await call<XY>(page, 'debugSellSlotCenter', side, i), shift);
}
async function clickStallButton(page: Page, i: number, shift = false): Promise<void> {
  await clickGame(page, await call<XY>(page, 'debugStallButtonCenter', i), shift);
}
async function press(page: Page, key: string): Promise<void> {
  await page.keyboard.press(key);
  await waitFrames(page, 3);
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

const count = (slots: Slot[], id: string) => slots.reduce((n, s) => n + (s && s.id === id ? s.count : 0), 0);
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

test('Bạn thử thế nào: F ở thùng bán → click cải bỏ vào, "Cuối ngày bán được…", Shift+click cả chồng → sạp hạt mua 1 hạt cải: −4 quan', async ({ page }) => {
  test.setTimeout(120_000);
  let s = await st(page);
  expect(s.money.current).toBe(60);
  expect(s.hud!.moneyText).toBe('60 quan');
  // "Hái vài cây": cho nhanh, đặt thẳng 5 bó cải + 2 củ khoai vào gùi (luồng hái thật đã có e2e T-003).
  await call(page, 'debugSetSlot', 3, 'rau-cai', 5);
  await call(page, 'debugSetSlot', 4, 'khoai-lang', 2);

  // Đứng ngay dưới thùng bán, bấm F.
  await teleportAndSettle(page, SELL_BOX.x, SELL_BOX.y + 1);
  expect((await st(page)).shop.nearby).toBe('sellBox');
  await press(page, 'f');
  s = await st(page);
  expect(s.shop.window).toBe('sellBox');
  expect(s.hud!.sellBoxVisible).toBe(true);
  expect(s.time.reasons).toEqual(['sellBox']);
  expect(s.hud!.sellTotalText).toBe('Cuối ngày bán được: 0 quan');

  // Click cải: 1 bó vào thùng → 10 quan.
  await clickSellSlot(page, 'bag', 3);
  s = await st(page);
  expect(count(s.sellBox.slots, 'rau-cai')).toBe(1);
  expect(count(s.inventory.slots, 'rau-cai')).toBe(4);
  expect(s.sellBox.total).toBe(10);
  expect(s.hud!.sellTotalText).toBe('Cuối ngày bán được: 10 quan');
  // Shift+click: cả chồng còn lại (4 bó) → 50 quan.
  await clickSellSlot(page, 'bag', 3, true);
  s = await st(page);
  expect(count(s.sellBox.slots, 'rau-cai')).toBe(5);
  expect(s.inventory.slots[3]).toBeNull();
  expect(s.hud!.sellTotalText).toBe('Cuối ngày bán được: 50 quan');
  // Khoai lang 1 củ → 72 quan.
  await clickSellSlot(page, 'bag', 4);
  s = await st(page);
  expect(s.sellBox.total).toBe(72);
  expect(s.hud!.sellTotalText).toBe('Cuối ngày bán được: 72 quan');
  // Tiền CHƯA cộng (cuối ngày mới bán — T-007).
  expect(s.money.current).toBe(60);
  expect(s.hud!.moneyText).toBe('60 quan');
  // Rê chuột lên món trong thùng → tên + giá.
  const boxSlot = await call<XY>(page, 'debugSellSlotCenter', 'box', 0);
  const bp = await gameToPage(page, boxSlot);
  await page.mouse.move(bp.x, bp.y);
  await expect.poll(async () => (await st(page)).hud!.shopStatusText, { timeout: 5_000 }).toBe('Rau cải · 10 quan/món');
  expect((await st(page)).hud!.shopMinFontPx).toBeGreaterThanOrEqual(24);
  await shot(page, 't006-thung-ban.png');

  // Esc đóng; đồng hồ chạy lại.
  await press(page, 'Escape');
  s = await st(page);
  expect(s.shop.window).toBeNull();
  expect(s.hud!.sellBoxVisible).toBe(false);
  expect(s.pause.menuOpen).toBe(false);
  expect(s.time.reasons).toEqual([]);

  // Tới hộp hạt ở cổng, bấm F, mua 1 hạt cải.
  await teleportAndSettle(page, STALL.x + 1, STALL.y - 1);
  expect((await st(page)).shop.nearby).toBe('seedStall');
  await press(page, 'f');
  s = await st(page);
  expect(s.shop.window).toBe('seedStall');
  expect(s.time.reasons).toEqual(['seedStall']);
  expect(s.hud!.stallButtons.map((b) => b.text)).toEqual(['Hạt cải — 4 quan', 'Hạt khoai lang — 8 quan']);
  expect(s.hud!.stallButtons.every((b) => b.enabled)).toBe(true);
  const seeds0 = count(s.inventory.slots, 'hat-rau-cai');
  await clickStallButton(page, 0);
  s = await st(page);
  expect(s.money.current).toBe(56);
  expect(s.hud!.moneyText).toBe('56 quan');
  expect(count(s.inventory.slots, 'hat-rau-cai')).toBe(seeds0 + 1);
  expect(s.money.purchases).toEqual([{ cropId: 'rau-cai', count: 1, cost: 4 }]);
  expect(s.money.lastCoinSfx).toMatch(/^sfx-nhat-xu-[12]$/);
  expect(s.hud!.shopStatusText).toContain('Đã mua 1 hạt cải');
  expect(s.hud!.moneyFloat).toBe('−4 quan');
  expect(s.hud!.shopMinFontPx).toBeGreaterThanOrEqual(24);
  await shot(page, 't006-sap-hat.png');
  await press(page, 'Escape');
  expect((await st(page)).shop.window).toBeNull();
});

test('thùng bán: lấy lại được (click / Shift+click), hạt không bỏ vào thùng, gùi đầy khi lấy lại, F đóng', async ({ page }) => {
  test.setTimeout(90_000);
  await call(page, 'debugSetSlot', 5, 'rau-cai', 3);
  await teleportAndSettle(page, SELL_BOX.x + 1, SELL_BOX.y);
  await press(page, 'f');
  expect((await st(page)).shop.window).toBe('sellBox');
  await clickSellSlot(page, 'bag', 5, true);
  let s = await st(page);
  expect(s.sellBox.slots[0]).toMatchObject({ id: 'rau-cai', count: 3 });
  // Lấy lại 1 món.
  await clickSellSlot(page, 'box', 0);
  s = await st(page);
  expect(count(s.sellBox.slots, 'rau-cai')).toBe(2);
  expect(count(s.inventory.slots, 'rau-cai')).toBe(1);
  expect(s.sellBox.total).toBe(20);
  // Shift+click lấy lại cả chồng.
  await clickSellSlot(page, 'box', 0, true);
  s = await st(page);
  expect(s.sellBox.slots.every((x) => x === null)).toBe(true);
  expect(count(s.inventory.slots, 'rau-cai')).toBe(3);
  expect(s.hud!.sellTotalText).toBe('Cuối ngày bán được: 0 quan');

  // Hạt (ô 1 = hạt cải lúc bắt đầu) không bỏ vào thùng.
  expect(s.inventory.slots[0]?.id).toBe('hat-rau-cai');
  const seedCount = s.inventory.slots[0]!.count;
  await clickSellSlot(page, 'bag', 0);
  s = await st(page);
  expect(s.inventory.slots[0]?.count).toBe(seedCount);
  expect(s.sellBox.slots.every((x) => x === null)).toBe(true);
  expect(s.hud!.shopStatusText).toBe('Hạt giống không bán được');
  expect(s.shop.statusWarn).toBe(true);

  // Gùi đầy → không lấy lại được, báo "Gùi đầy rồi!", không mất đồ.
  await call(page, 'debugSetSellBoxSlot', 0, 'khoai-lang', 2);
  for (let i = 0; i < 18; i++) await call(page, 'debugSetSlot', i, 'rau-cai', 20);
  await clickSellSlot(page, 'box', 0);
  s = await st(page);
  expect(s.sellBox.slots[0]).toMatchObject({ id: 'khoai-lang', count: 2 });
  expect(s.hud!.shopStatusText).toBe('Gùi đầy rồi!');
  expect(s.bubble.text).toBe('Gùi đầy rồi!');

  // F lần nữa = đóng.
  await press(page, 'f');
  s = await st(page);
  expect(s.shop.window).toBeNull();
  expect(s.time.reasons).toEqual([]);
});

test('đồng hồ dừng + nhân vật đứng khi mở thùng bán / sạp hạt; Tạm dừng chồng lên: Esc đóng Tạm dừng trước', async ({ page }) => {
  test.setTimeout(90_000);
  await teleportAndSettle(page, SELL_BOX.x, SELL_BOX.y + 1);
  await press(page, 'f');
  let s = await st(page);
  expect(s.time.stopped).toBe(true);
  const e0 = s.time.elapsedSeconds;
  const y0 = s.footY;
  await page.keyboard.down('s');
  await page.waitForTimeout(1200);
  await page.keyboard.up('s');
  s = await st(page);
  expect(s.time.elapsedSeconds).toBe(e0);
  expect(Math.abs(s.footY - y0)).toBeLessThan(1);
  // G / F9 / E không có tác dụng khi cửa sổ mở.
  for (const k of ['g', 'F9', 'e']) await press(page, k);
  s = await st(page);
  expect(s.time.elapsedSeconds).toBe(e0);
  expect(s.bagOpen).toBe(false);
  expect(s.shop.window).toBe('sellBox');

  // Mất focus lúc đang mở thùng: Tạm dừng nằm trên; Esc đầu đóng Tạm dừng, Esc sau đóng thùng.
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  s = await st(page);
  expect(s.time.reasons).toEqual(['pauseMenu', 'sellBox']);
  await press(page, 'Escape');
  s = await st(page);
  expect(s.pause.menuOpen).toBe(false);
  expect(s.shop.window).toBe('sellBox');
  expect(s.time.stopped).toBe(true);
  await press(page, 'Escape');
  s = await st(page);
  expect(s.shop.window).toBeNull();
  expect(s.pause.menuOpen).toBe(false);
  await expect.poll(async () => (await st(page)).time.elapsedSeconds, { timeout: 5_000 }).toBeGreaterThan(e0);

  // Sạp hạt cũng dừng đồng hồ.
  await teleportAndSettle(page, STALL.x - 1, STALL.y);
  await press(page, 'f');
  s = await st(page);
  expect(s.shop.window).toBe('seedStall');
  expect(s.time.reasons).toEqual(['seedStall']);
  const e1 = s.time.elapsedSeconds;
  await page.waitForTimeout(1000);
  expect((await st(page)).time.elapsedSeconds).toBe(e1);
  // Click ra ngoài khung = đóng (như gùi).
  await clickGame(page, { x: 60, y: 540 });
  s = await st(page);
  expect(s.shop.window).toBeNull();
  expect(s.time.reasons).toEqual([]);
});

test('sạp hạt: thiếu tiền nút xám, Shift+click mua 5, gùi đầy không mua được', async ({ page }) => {
  test.setTimeout(90_000);
  await teleportAndSettle(page, STALL.x + 1, STALL.y - 1);
  await press(page, 'f');
  // Shift+click khoai lang: 5 × 8 = 40 quan.
  const k0 = count((await st(page)).inventory.slots, 'hat-khoai-lang');
  await clickStallButton(page, 1, true);
  let s = await st(page);
  expect(s.money.current).toBe(20);
  expect(count(s.inventory.slots, 'hat-khoai-lang')).toBe(k0 + 5);
  expect(s.money.purchases).toEqual([{ cropId: 'khoai-lang', count: 5, cost: 40 }]);
  // Shift+click khoai lang lần nữa: chỉ đủ tiền 2 hạt → mua 2.
  await clickStallButton(page, 1, true);
  s = await st(page);
  expect(s.money.current).toBe(4);
  expect(s.money.purchases.at(-1)).toEqual({ cropId: 'khoai-lang', count: 2, cost: 16 });
  // Còn 4 quan: nút khoai lang (8) xám, nút cải (4) còn bấm được.
  expect(s.seedStall.buttons.map((b) => b.enabled)).toEqual([true, false]);
  expect(s.hud!.stallButtons.map((b) => b.enabled)).toEqual([true, false]);
  await clickStallButton(page, 1);
  s = await st(page);
  expect(s.money.current).toBe(4);
  expect(s.hud!.shopStatusText).toBe('Không đủ tiền');
  // Đặt 3 quan: cả hai nút xám, bấm không mua, tiền không âm.
  await call(page, 'debugSetMoney', 3);
  await waitFrames(page, 3);
  s = await st(page);
  expect(s.hud!.stallButtons.every((b) => !b.enabled)).toBe(true);
  const seeds = count(s.inventory.slots, 'hat-rau-cai');
  await clickStallButton(page, 0);
  await clickStallButton(page, 0, true);
  s = await st(page);
  expect(s.money.current).toBe(3);
  expect(count(s.inventory.slots, 'hat-rau-cai')).toBe(seeds);
  expect(s.hud!.moneyText).toBe('3 quan');
  // Rê chuột lên nút xám → "Không đủ tiền".
  const bp = await gameToPage(page, await call<XY>(page, 'debugStallButtonCenter', 0));
  await page.mouse.move(bp.x + 30, bp.y);
  await expect.poll(async () => (await st(page)).seedStall.hoverButton, { timeout: 5_000 }).toBe(0);
  await waitFrames(page, 3);
  await shot(page, 't006-thieu-tien.png');

  // Gùi đầy (18 ô × 20 khoai) + đủ tiền → không mua, bong bóng "Gùi đầy rồi!", tiền giữ nguyên.
  await call(page, 'debugSetMoney', 60);
  for (let i = 0; i < 18; i++) await call(page, 'debugSetSlot', i, 'khoai-lang', 20);
  await clickStallButton(page, 0);
  s = await st(page);
  expect(s.money.current).toBe(60);
  expect(count(s.inventory.slots, 'hat-rau-cai')).toBe(0);
  expect(s.bubble.visible).toBe(true);
  expect(s.bubble.text).toBe('Gùi đầy rồi!');
  expect(s.hud!.shopStatusText).toBe('Gùi đầy rồi!');
  await shot(page, 't006-gui-day.png');
});

test('F khi không đứng cạnh thì không mở; click ngoài tầm không mở, trong tầm thì mở (không phải click ruộng); viền cả thùng; có va chạm', async ({ page }) => {
  test.setTimeout(90_000);
  // Cách thùng 3 ô (dưới): F không mở, click cũng ngoài tầm.
  await teleportAndSettle(page, SELL_BOX.x, SELL_BOX.y + 3);
  let s = await st(page);
  expect(s.shop.nearby).toBeNull();
  await press(page, 'f');
  s = await st(page);
  expect(s.shop.keyPresses).toBe(1);
  expect(s.shop.window).toBeNull();
  expect(s.time.reasons).toEqual([]);
  await hoverTile(page, SELL_BOX.x, SELL_BOX.y);
  s = await st(page);
  expect(s.hover?.object).toBe('sellBox');
  expect(s.hover?.inReach).toBe(false);
  expect(s.hover?.highlight).toBe('gray');
  expect(s.hover?.job).toBeNull();
  await clickTile(page, SELL_BOX.x, SELL_BOX.y);
  expect((await st(page)).shop.window).toBeNull();
  // F ở ô cách 2 ô cũng không mở (phải đứng ô kề).
  await teleportAndSettle(page, SELL_BOX.x, SELL_BOX.y + 2);
  await press(page, 'f');
  expect((await st(page)).shop.window).toBeNull();

  // Trong tầm (cách 2 ô): viền sáng, click mở thùng — ruộng không có việc gì.
  await hoverTile(page, SELL_BOX.x, SELL_BOX.y);
  s = await st(page);
  expect(s.hover?.object).toBe('sellBox');
  expect(s.hover?.inReach).toBe(true);
  expect(s.hover?.highlight).toBe('bright');
  await shot(page, 't006-vien-thung.png');
  await clickTile(page, SELL_BOX.x, SELL_BOX.y);
  s = await st(page);
  expect(s.shop.window).toBe('sellBox');
  expect(s.action.busy).toBe(false);
  await press(page, 'Escape');

  // Click sạp hạt (ô bất kỳ của sạp) trong tầm → mở sạp.
  await teleportAndSettle(page, STALL.x + STALL.w + 1, STALL.y);
  await clickTile(page, STALL.x + STALL.w - 1, STALL.y + 1);
  expect((await st(page)).shop.window).toBe('seedStall');
  await press(page, 'Escape');

  // Va chạm: đứng dưới thùng, đi lên — không đi xuyên qua thùng.
  await teleportAndSettle(page, SELL_BOX.x, SELL_BOX.y + 1);
  await page.keyboard.down('w');
  await waitFrames(page, 40);
  await page.keyboard.up('w');
  s = await st(page);
  expect(s.footY).toBeGreaterThanOrEqual((SELL_BOX.y + 1) * 64);
});

test('bố cục: ô tiền dưới thanh Sức, gợi ý phím F / Shift, không đè nhau (1920×1080 và 1366×768)', async ({ page }) => {
  let s = await st(page);
  const r = s.hud!.hudRects;
  expect(r.money.y).toBeGreaterThan(r.stamina.y + r.stamina.h);
  for (const other of [r.stamina, r.clock, r.hotbar, r.bagButton]) expect(overlap(r.money, other)).toBe(false);
  expect(s.hud!.hintLines[0]).toBe(HINT_MAIN);
  expect(s.hud!.hintLines[1]).toBe(HINT_MAIN_2);
  for (const b of s.hud!.hintBounds) {
    for (const other of [r.hotbar, r.bagButton, r.clock, r.money, r.stamina]) expect(overlap(b, other)).toBe(false);
    expect(b.x + b.w).toBeLessThanOrEqual(1920);
  }
  await page.setViewportSize({ width: 1366, height: 768 });
  await waitFrames(page, 10);
  await call(page, 'debugSetMoney', 1234);
  await waitFrames(page, 3);
  s = await st(page);
  expect(s.hud!.moneyText).toBe('1234 quan');
  await shot(page, 't006-1366.png');
  // Cửa sổ thùng bán ở 1366×768.
  await teleportAndSettle(page, SELL_BOX.x, SELL_BOX.y + 1);
  await call(page, 'debugSetSlot', 3, 'rau-cai', 7);
  await press(page, 'f');
  await clickSellSlot(page, 'bag', 3);
  s = await st(page);
  expect(s.sellBox.total).toBe(10);
  await shot(page, 't006-1366-thung.png');
});
