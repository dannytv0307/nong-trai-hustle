// QA độc lập T-003 — Gieo, tưới, hái + hotbar 9 ô và gùi tối thiểu (GDD §3.3, §3.3a, §3.4, §8; D-022).
// Ca rìa do qa-tester tự viết, không dựa vào crops.spec.ts. Chờ theo TRẠNG THÁI game (expect.poll / frame), không
// waitForTimeout cố định (BUG-006). Ruộng: ô x 13..15, y 13..15. Đứng (12,14) với tới cột 13 và cột 14.
import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCREENSHOT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'screenshots');

interface XY {
  x: number;
  y: number;
}
interface Plot {
  x: number;
  y: number;
  soil: string;
  tillStrikes: number;
  watered: boolean;
  crop: { cropId: string; age: number; dryDays: number; withered: boolean } | null;
}
interface CropInfo {
  x: number;
  y: number;
  cropId: string;
  age: number;
  dryDays: number;
  watered: boolean;
  ripe: boolean;
  withered: boolean;
  thirsty: boolean;
  stage: string;
}
type Slot = { id: string; count: number; name: string } | null;
interface GState {
  gardenReady: boolean;
  footX: number;
  footY: number;
  zoom: number;
  view: { x: number; y: number; w: number; h: number };
  mapPx: { w: number; h: number };
  farm: { plots: Plot[]; tilled: number };
  hover: { x: number; y: number; inReach: boolean; job: string | null } | null;
  action: { busy: boolean; current: XY | null; queue: XY[]; dragKind: string | null; kind: string | null; strikesDone: number };
  till: { cancels: number; finishes: number };
  crops: CropInfo[];
  inventory: { slots: Slot[]; selected: number; selectedItem: string | null; lastSeedId: string | null };
  bagOpen: boolean;
  bagHoverSlot: number;
  bubble: { visible: boolean; text: string; shows: number };
  farmJuice: { plants: number; waters: number; harvests: number; clears: number; nights: number; dropsActive: number; popsActive: number };
  hud: {
    flying: number;
    landed: number;
    bouncingSlot: number;
    bagButtonBouncing: boolean;
    bagVisible: boolean;
    tooltip: string | null;
    selectedFrame: number;
    hotbarCounts: string[];
  } | null;
}
type SceneHook = Record<string, unknown> & { debugState: GState };
type GameHook = {
  loop: { frame: number };
  scene: { isActive(k: string): boolean; isPaused(k: string): boolean; getScene(k: string): SceneHook; pause(k: string): void; resume(k: string): void };
};

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
const cropAt = (s: GState, x: number, y: number) => s.crops.find((c) => c.x === x && c.y === y) ?? null;

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
async function tileToPage(page: Page, tx: number, ty: number): Promise<XY> {
  return gameToPage(page, await call<XY>(page, 'debugTileToScreen', tx, ty));
}
async function hudToPage(page: Page, kind: 'hotbar' | 'bag', i: number): Promise<XY> {
  return gameToPage(page, await call<XY>(page, 'debugHudSlotCenter', kind, i));
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
async function clickGame(page: Page, gx: number, gy: number): Promise<void> {
  const p = await gameToPage(page, { x: gx, y: gy });
  await page.mouse.move(p.x, p.y);
  await page.mouse.down();
  await page.mouse.up();
}
async function press(page: Page, key: string): Promise<void> {
  await page.keyboard.press(key);
  await waitFrames(page, 3);
}
async function idle(page: Page): Promise<void> {
  await expect.poll(async () => (await st(page)).action.busy, { timeout: 15_000 }).toBe(false);
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
async function shot(page: Page, name: string): Promise<void> {
  await setPaused(page, true);
  await page.screenshot({ path: join(SCREENSHOT_DIR, name) });
  await setPaused(page, false);
}
async function tillTiles(page: Page, tiles: [number, number][]): Promise<void> {
  await call(page, 'debugSetTillTuning', { strikeSeconds: 0.06 });
  for (const [x, y] of tiles) {
    await idle(page);
    await clickTile(page, x, y);
    await expect.poll(async () => plotOf(await st(page), x, y).soil, { timeout: 20_000 }).toBe('tilled');
  }
  await idle(page);
}
/** Gieo 1 ô bằng click, chờ có cây. */
async function plant(page: Page, x: number, y: number): Promise<void> {
  await idle(page);
  await clickTile(page, x, y);
  await expect.poll(async () => cropAt(await st(page), x, y)?.stage ?? null).toBe('seed');
  await idle(page);
}
async function water(page: Page, x: number, y: number): Promise<void> {
  await idle(page);
  await clickTile(page, x, y);
  await expect.poll(async () => cropAt(await st(page), x, y)?.watered ?? null).toBe(true);
  await idle(page);
}
/** Ghi mỗi frame của Garden: độ dài hàng chờ, busy, kind. */
async function startRecorder(page: Page): Promise<void> {
  await page.evaluate(() => {
    const w = window as unknown as { __game: GameHook; __rec: { q: number; busy: boolean; kind: string | null; plants: number }[] };
    w.__rec = [];
    const sc = w.__game.scene.getScene('Garden') as unknown as SceneHook & { events: { on(e: string, f: (t: number, d: number) => void): void } };
    sc.events.on('postupdate', (_t: number, d: number) => {
      const s = sc.debugState;
      const cur = s.action.current;
      w.__rec.push({
        q: s.action.queue.length,
        busy: s.action.busy,
        kind: s.action.kind,
        plants: s.farmJuice.plants,
        d: Math.round(d),
        cur: cur ? `${cur.x},${cur.y}` : '-',
        hov: s.hover ? `${s.hover.x},${s.hover.y}:${s.hover.job}` : '-',
        drag: s.action.dragKind,
      } as never);
    });
  });
}
async function recorded(page: Page): Promise<{ q: number; busy: boolean; kind: string | null; plants: number }[]> {
  return page.evaluate(() => (window as unknown as { __rec: { q: number; busy: boolean; kind: string | null; plants: number }[] }).__rec);
}

let errors: string[] = [];
let failedRequests: string[] = [];

test.beforeEach(async ({ page }) => {
  errors = [];
  failedRequests = [];
  page.on('console', (msg) => {
    const ignorable = msg.text().startsWith('Failed to load resource') && msg.location().url.includes('/api/');
    if (msg.type() === 'error' && !ignorable) errors.push(`[console.error] ${msg.text()}`);
  });
  page.on('pageerror', (err) => errors.push(`[pageerror] ${err.message}`));
  page.on('response', (r) => {
    if (r.status() >= 400 && !r.url().includes('/api/')) failedRequests.push(`${r.status()} ${r.url()}`);
  });
  await page.goto('/');
  await expect.poll(() => state(page).then((s) => s !== null), { timeout: 30_000 }).toBe(true);
  mkdirSync(SCREENSHOT_DIR, { recursive: true });
});

test.afterEach(() => {
  expect(errors, errors.join('\n')).toEqual([]);
  expect(failedRequests, failedRequests.join('\n')).toEqual([]);
});

test('Q1 vòng đủ cả 2 cây: cuốc → gieo → tưới → G → hái; khoai cần 2 đêm có tưới', async ({ page }) => {
  test.setTimeout(120_000);
  await teleportAndSettle(page, 12, 14);
  await tillTiles(page, [
    [13, 13],
    [13, 15],
  ]);
  await press(page, '1');
  await plant(page, 13, 13);
  await press(page, '2');
  await plant(page, 13, 15);
  let s = await st(page);
  expect(cropAt(s, 13, 13)?.cropId).toBe('rau-cai');
  expect(cropAt(s, 13, 15)?.cropId).toBe('khoai-lang');
  expect(s.inventory.slots[0]?.count).toBe(5);
  expect(s.inventory.slots[1]?.count).toBe(2);
  await water(page, 13, 13);
  await water(page, 13, 15);
  await press(page, 'g');
  await expect.poll(async () => (await st(page)).farmJuice.nights).toBe(1);
  s = await st(page);
  expect(cropAt(s, 13, 13)).toMatchObject({ ripe: true, stage: 'ripe' });
  expect(cropAt(s, 13, 15)).toMatchObject({ ripe: false, stage: 'growing', age: 1, watered: false });
  // Hái cải ngay.
  await idle(page);
  await clickTile(page, 13, 13);
  await expect.poll(async () => (await st(page)).farmJuice.harvests).toBe(1);
  // Tưới khoai lần 2 rồi G.
  await water(page, 13, 15);
  await press(page, 'g');
  await expect.poll(async () => (await st(page)).farmJuice.nights).toBe(2);
  expect(cropAt(await st(page), 13, 15)).toMatchObject({ ripe: true, age: 2 });
  await idle(page);
  await clickTile(page, 13, 15);
  await expect.poll(async () => (await st(page)).farmJuice.harvests).toBe(2);
  await expect.poll(async () => (await st(page)).hud!.landed, { timeout: 15_000 }).toBe(2);
  s = await st(page);
  expect(s.inventory.slots.find((x) => x?.id === 'rau-cai')?.count).toBe(1);
  expect(s.inventory.slots.find((x) => x?.id === 'khoai-lang')?.count).toBe(1);
  expect(plotOf(s, 13, 13)).toMatchObject({ soil: 'untilled', tillStrikes: 0, crop: null, watered: false });
  expect(plotOf(s, 13, 15)).toMatchObject({ soil: 'untilled', tillStrikes: 0, crop: null, watered: false });
  await moveMouseToTile(page, 11, 11);
  await shot(page, 'qa-t003-loop-done.png');
});

test('Q2 tưới 2 lần cùng ngày & click cây chưa chín đã tưới: không làm gì, không bong bóng', async ({ page }) => {
  await teleportAndSettle(page, 12, 14);
  await tillTiles(page, [[13, 14]]);
  await press(page, '2'); // khoai 2 ngày → sau 1 đêm vẫn chưa chín
  await plant(page, 13, 14);
  await water(page, 13, 14);
  await moveMouseToTile(page, 13, 14);
  await expect.poll(async () => (await st(page)).hover?.job ?? 'none').toBe('none');
  const b0 = (await st(page)).bubble.shows;
  await clickTile(page, 13, 14);
  await waitFrames(page, 40);
  let s = await st(page);
  expect(s.farmJuice.waters).toBe(1);
  expect(s.action.busy).toBe(false);
  expect(s.bubble.shows).toBe(b0);
  // Qua đêm → mầm (chưa chín), tưới lại được 1 lần, lần 2 không.
  await call(page, 'debugAdvanceDay');
  await water(page, 13, 14);
  await clickTile(page, 13, 14);
  await waitFrames(page, 40);
  s = await st(page);
  expect(s.farmJuice.waters).toBe(2);
  expect(cropAt(s, 13, 14)).toMatchObject({ stage: 'growing', watered: true });
  expect(s.bubble.shows).toBe(b0);
});

test('Q3 khát 1 đêm → lá rũ; khát 2 đêm → héo; dọn → đất chưa cuốc; tưới cứu cây khát', async ({ page }) => {
  test.setTimeout(90_000);
  await teleportAndSettle(page, 12, 14);
  await tillTiles(page, [
    [13, 13],
    [13, 14],
    [13, 15],
  ]);
  await plant(page, 13, 13); // sẽ khát rồi héo
  await plant(page, 13, 14); // khát 1 đêm rồi được tưới
  await press(page, '2');
  await plant(page, 13, 15); // khoai: tưới đều — để so màu
  await water(page, 13, 15);
  await call(page, 'debugAdvanceDay');
  let s = await st(page);
  expect(cropAt(s, 13, 13)).toMatchObject({ thirsty: true, dryDays: 1, withered: false, stage: 'seed' });
  expect(cropAt(s, 13, 14)).toMatchObject({ thirsty: true, dryDays: 1 });
  // Ảnh: khát (13,13) + (13,14), khoai mầm chưa tưới (13,15) — rồi tưới (13,14) và khoai → so sánh.
  await water(page, 13, 14);
  await water(page, 13, 15);
  s = await st(page);
  expect(cropAt(s, 13, 14)).toMatchObject({ watered: true, thirsty: false });
  await moveMouseToTile(page, 11, 11);
  await expect.poll(async () => (await st(page)).farmJuice.dropsActive, { timeout: 10_000 }).toBe(0);
  await shot(page, 'qa-t003-thirsty-vs-watered.png'); // (13,13) khát · (13,14) khát nhưng vừa tưới · (13,15) khoai mầm đã tưới
  await call(page, 'debugAdvanceDay');
  s = await st(page);
  expect(cropAt(s, 13, 13)).toMatchObject({ withered: true, stage: 'withered' });
  expect(cropAt(s, 13, 14)).toMatchObject({ ripe: true, dryDays: 0, age: 1 }); // được cứu, lớn tiếp
  expect(cropAt(s, 13, 15)).toMatchObject({ ripe: true, age: 2 });
  await moveMouseToTile(page, 11, 11);
  await waitFrames(page, 5);
  await shot(page, 'qa-t003-withered-ripe.png');
  // Cây chín bỏ đó qua 3 đêm không tưới: không héo.
  for (let i = 0; i < 3; i++) await call(page, 'debugAdvanceDay');
  s = await st(page);
  expect(cropAt(s, 13, 14)).toMatchObject({ ripe: true, withered: false });
  // Dọn cây héo.
  await moveMouseToTile(page, 13, 13);
  await expect.poll(async () => (await st(page)).hover?.job).toBe('clear');
  await clickTile(page, 13, 13);
  await expect.poll(async () => (await st(page)).farmJuice.clears).toBe(1);
  s = await st(page);
  expect(plotOf(s, 13, 13)).toMatchObject({ soil: 'untilled', tillStrikes: 0, crop: null });
  expect(s.inventory.slots.some((x) => x?.id === 'rau-cai')).toBe(false); // dọn héo không cho đồ
  await idle(page);
  await moveMouseToTile(page, 13, 13);
  await expect.poll(async () => (await st(page)).hover?.job).toBe('till');
});

test('Q4 gieo khi ô chọn là ô trống / nông sản: dùng hạt đầu tiên rồi hạt gieo lần trước; hạt đó hết → bong bóng', async ({ page }) => {
  test.setTimeout(90_000);
  await teleportAndSettle(page, 12, 14);
  await tillTiles(page, [
    [13, 13],
    [13, 14],
    [13, 15],
    [14, 13],
    [14, 14],
  ]);
  // (a) Chưa gieo lần nào, chọn ô 5 (trống) → gieo hạt đầu tiên trong gùi (cải).
  await press(page, '5');
  expect((await st(page)).inventory.selectedItem).toBeNull();
  await plant(page, 13, 13);
  expect(cropAt(await st(page), 13, 13)?.cropId).toBe('rau-cai');
  // (b) Gieo khoai (phím 2) → lastSeed = khoai. Chọn ô có NÔNG SẢN (rau cải) → gieo khoai.
  await press(page, '2');
  await plant(page, 13, 14);
  await call(page, 'debugSetSlot', 3, 'rau-cai', 5);
  await press(page, '4');
  expect((await st(page)).inventory.selectedItem).toBe('rau-cai');
  await plant(page, 13, 15);
  let s = await st(page);
  expect(cropAt(s, 13, 15)?.cropId).toBe('khoai-lang');
  expect(s.inventory.slots[1]?.count).toBe(1);
  expect(s.inventory.slots[3]).toMatchObject({ id: 'rau-cai', count: 5 }); // nông sản không bị đụng
  // (c) Hết khoai: gieo nốt 1 hạt khoai, rồi click nữa → "Hết hạt rồi!" dù còn hạt cải (thiết kế game-dev chọn).
  await plant(page, 14, 13);
  s = await st(page);
  expect(s.inventory.slots[1]).toBeNull();
  await clickTile(page, 14, 14);
  await expect.poll(async () => (await st(page)).bubble).toMatchObject({ visible: true, text: 'Hết hạt rồi!' });
  await waitFrames(page, 20);
  expect(cropAt(await st(page), 14, 14)).toBeNull();
  await shot(page, 'qa-t003-no-seed-bubble.png');
  // Chọn lại ô hạt cải → gieo được.
  await press(page, '1');
  await plant(page, 14, 14);
  expect(cropAt(await st(page), 14, 14)?.cropId).toBe('rau-cai');
});

test('Q5 hết hạt giữa lúc rê cả hàng: gieo đủ số hạt còn, ô sau không gieo, bong bóng, không treo', async ({ page }) => {
  test.setTimeout(90_000);
  await teleportAndSettle(page, 12, 14);
  await tillTiles(page, [
    [13, 13],
    [13, 14],
    [13, 15],
    [14, 13],
  ]);
  await call(page, 'debugSetSlot', 0, 'hat-rau-cai', 2);
  await call(page, 'debugSetSlot', 1, null, 0);
  await moveMouseToTile(page, 13, 13);
  await page.mouse.down();
  for (const [x, y] of [
    [13, 14],
    [13, 15],
    [14, 13],
  ] as const) {
    await moveMouseToTile(page, x, y);
    await waitFrames(page, 2);
  }
  await page.mouse.up();
  await idle(page);
  const s = await st(page);
  expect(s.farmJuice.plants).toBe(2);
  expect(s.crops).toHaveLength(2);
  expect(s.inventory.slots[0]).toBeNull();
  expect(s.bubble.text).toBe('Hết hạt rồi!');
  expect(s.action.queue).toHaveLength(0);
  // Bong bóng tắt sau bubbleSeconds (không bị kéo dài mãi khi đã buông chuột).
  await expect.poll(async () => (await st(page)).bubble.visible, { timeout: 20_000 }).toBe(false);
});

test('Q6 gùi đầy khi hái: cây không mất; còn đúng 1 chỗ mà rê 2 cây chín → hái 1, cây kia còn chín', async ({ page }) => {
  test.setTimeout(90_000);
  await teleportAndSettle(page, 12, 14);
  await tillTiles(page, [
    [13, 13],
    [13, 14],
  ]);
  await plant(page, 13, 13);
  await plant(page, 13, 14);
  await water(page, 13, 13);
  await water(page, 13, 14);
  await call(page, 'debugAdvanceDay');
  // Gùi: ô 0 cải 19 (còn 1 chỗ), 17 ô còn lại khoai 20.
  await call(page, 'debugSetSlot', 0, 'rau-cai', 19);
  for (let i = 1; i < 18; i++) await call(page, 'debugSetSlot', i, 'khoai-lang', 20);
  await moveMouseToTile(page, 13, 13);
  await page.mouse.down();
  await moveMouseToTile(page, 13, 14);
  await waitFrames(page, 3);
  await page.mouse.up();
  await idle(page);
  await expect.poll(async () => (await st(page)).bubble).toMatchObject({ visible: true, text: 'Gùi đầy rồi!' });
  let s = await st(page);
  expect(s.farmJuice.harvests).toBe(1);
  expect(s.inventory.slots[0]).toMatchObject({ id: 'rau-cai', count: 20 });
  const remaining = s.crops.filter((c) => c.ripe);
  expect(remaining).toHaveLength(1); // cây không mất
  // Click lại cây còn lại → vẫn gùi đầy, vẫn còn cây.
  await clickTile(page, remaining[0].x, remaining[0].y);
  await waitFrames(page, 40);
  s = await st(page);
  expect(s.farmJuice.harvests).toBe(1);
  expect(s.crops.filter((c) => c.ripe)).toHaveLength(1);
  await shot(page, 'qa-t003-bag-full.png');
});

test('Q7 chồng 20 tràn sang ô trống đầu tiên; hotbar đầy thì vào hàng dưới, icon bay vào nút Gùi', async ({ page }) => {
  test.setTimeout(90_000);
  await teleportAndSettle(page, 12, 14);
  await tillTiles(page, [
    [13, 13],
    [13, 14],
  ]);
  await plant(page, 13, 13);
  await plant(page, 13, 14);
  await water(page, 13, 13);
  await water(page, 13, 14);
  await call(page, 'debugAdvanceDay');
  // Ô 2 (index 2) cải 20 → món cải mới phải sang ô trống đầu tiên (index 3).
  await call(page, 'debugSetSlot', 2, 'rau-cai', 20);
  await idle(page);
  await clickTile(page, 13, 13);
  await expect.poll(async () => (await st(page)).hud!.landed, { timeout: 15_000 }).toBe(1);
  let s = await st(page);
  expect(s.inventory.slots[2]).toMatchObject({ id: 'rau-cai', count: 20 });
  expect(s.inventory.slots[3]).toMatchObject({ id: 'rau-cai', count: 1 });
  // Hotbar 9 ô đều đầy món khác → cải vào ô 10 (hàng dưới) nếu ô 3 đã đầy.
  for (let i = 0; i < 9; i++) await call(page, 'debugSetSlot', i, 'khoai-lang', 20);
  await page.evaluate(() => {
    const w = window as unknown as { __game: GameHook; __bagBounce: boolean };
    w.__bagBounce = false;
    const hud = w.__game.scene.getScene('GardenHud') as unknown as { debugState: { bagButtonBouncing: boolean }; events: { on(e: string, f: () => void): void } };
    hud.events.on('postupdate', () => {
      if (hud.debugState.bagButtonBouncing) w.__bagBounce = true;
    });
  });
  await idle(page);
  await clickTile(page, 13, 14);
  await expect.poll(async () => (await st(page)).hud!.landed, { timeout: 15_000 }).toBe(2);
  s = await st(page);
  expect(s.inventory.slots[9]).toMatchObject({ id: 'rau-cai', count: 1 });
  await expect.poll(() => page.evaluate(() => (window as unknown as { __bagBounce: boolean }).__bagBounce)).toBe(true);
});

test('Q8 phím 1–9 gõ nhanh + cuộn chuột nhiều nấc hai chiều; cuộn khi mở gùi', async ({ page }) => {
  await teleportAndSettle(page, 12, 14);
  await moveMouseToTile(page, 12, 12);
  // Gõ nhanh cả dãy (không chờ frame giữa các phím).
  await page.keyboard.type('123456789', { delay: 0 });
  await waitFrames(page, 3);
  expect((await st(page)).inventory.selected).toBe(8);
  await page.keyboard.type('94', { delay: 0 });
  await waitFrames(page, 3);
  expect((await st(page)).inventory.selected).toBe(3);
  // 2 phím trong CÙNG một frame (7 rồi 3) — ghi lại phím nào thắng.
  await page.evaluate(() => {
    for (const [key, code] of [
      ['7', 55],
      ['3', 51],
    ] as const) {
      window.dispatchEvent(new KeyboardEvent('keydown', { key, keyCode: code, bubbles: true } as KeyboardEventInit));
      window.dispatchEvent(new KeyboardEvent('keyup', { key, keyCode: code, bubbles: true } as KeyboardEventInit));
    }
  });
  await waitFrames(page, 3);
  console.log('[Q8] cùng frame bấm 7 rồi 3 → ô chọn index', (await st(page)).inventory.selected);
  await press(page, '1');
  // Cuộn 3 nấc xuống liền nhau → ô 4.
  for (let i = 0; i < 3; i++) await page.mouse.wheel(0, 100);
  await expect.poll(async () => (await st(page)).inventory.selected).toBe(3);
  // Cuộn 5 nấc lên → 3 - 5 = -2 → vòng về ô 8 (index 7).
  for (let i = 0; i < 5; i++) await page.mouse.wheel(0, -100);
  await expect.poll(async () => (await st(page)).inventory.selected).toBe(7);
  // Cuộn rất nhỏ (kiểu touchpad, deltaY 4) — mỗi sự kiện = 1 nấc?
  const before = (await st(page)).inventory.selected;
  for (let i = 0; i < 4; i++) await page.mouse.wheel(0, 4);
  await waitFrames(page, 3);
  console.log('[Q8] 4 sự kiện cuộn deltaY=4 → ô đổi từ', before, 'sang', (await st(page)).inventory.selected);
  await shot(page, 'qa-t003-hotbar-select.png');
});

test('Q9 gùi: E/Tab/Esc/click ngoài đóng; click trong khung không đóng; click hotbar/nút gùi không xuyên xuống ruộng', async ({ page }) => {
  test.setTimeout(90_000);
  await teleportAndSettle(page, 12, 14);
  await tillTiles(page, [[13, 14]]);
  for (const [open, close] of [
    ['e', 'e'],
    ['Tab', 'Tab'],
    ['e', 'Escape'],
    ['Tab', 'e'],
  ] as const) {
    await press(page, open);
    await expect.poll(async () => (await st(page)).bagOpen).toBe(true);
    await press(page, close);
    await expect.poll(async () => (await st(page)).bagOpen).toBe(false);
  }
  // Tab không làm mất focus khỏi game (trang không đổi focus).
  const active = await page.evaluate(() => document.activeElement?.tagName ?? null);
  console.log('[Q9] activeElement sau Tab:', active);

  // Mở gùi bằng nút "Gùi (E)" (click chuột).
  const bagBtn = await call<{ x: number; y: number }>(page, 'debugHudSlotCenter', 'hotbar', 8);
  const btn = { x: bagBtn.x + 92 / 2 + 22 + 92 / 2, y: bagBtn.y };
  await clickGame(page, btn.x, btn.y);
  await expect.poll(async () => (await st(page)).bagOpen).toBe(true);
  await shot(page, 'qa-t003-bag-open.png');
  // Click vào khung (khoảng giữa hai ô) → không đóng.
  const s0 = await call<XY>(page, 'debugHudSlotCenter', 'bag', 0);
  await clickGame(page, s0.x + 53, s0.y);
  await waitFrames(page, 5);
  expect((await st(page)).bagOpen).toBe(true);
  // Ô ruộng trong tầm luôn nằm dưới khung gùi (khung giữa màn, nhân vật giữa màn) → click ra ngoài khung trên cỏ.
  const tile = await call<XY>(page, 'debugTileToScreen', 13, 14);
  await clickGame(page, 120, 120);
  await expect.poll(async () => (await st(page)).bagOpen).toBe(false);
  await waitFrames(page, 40);
  let s = await st(page);
  expect(cropAt(s, 13, 14)).toBeNull();
  expect(s.farmJuice.plants).toBe(0);
  // Nhưng nếu panel che ô (13,14) thì click ở trên là click "trong khung" — ghi lại.
  console.log('[Q9] ô (13,14) trên màn:', tile);

  // Click ô hotbar → chọn ô, không gieo dù ruộng ở dưới; giữ chuột từ hotbar kéo ra ruộng cũng không làm.
  const h = await hudToPage(page, 'hotbar', 4);
  await page.mouse.move(h.x, h.y);
  await page.mouse.down();
  await waitFrames(page, 2);
  await moveMouseToTile(page, 13, 14);
  await waitFrames(page, 20);
  await page.mouse.up();
  s = await st(page);
  expect(s.inventory.selected).toBe(4);
  expect(s.farmJuice.plants).toBe(0);
  expect(s.action.busy).toBe(false);
});

test('Q10 mở gùi giữa lúc cuốc và giữa lúc gieo: việc dừng, không mất; đóng lại làm tiếp', async ({ page }) => {
  test.setTimeout(90_000);
  await teleportAndSettle(page, 12, 14);
  await tillTiles(page, [
    [13, 13],
    [13, 15],
  ]);
  // Cuốc (13,14) với nhát dài 0.5 s, sau 1 nhát mở gùi.
  await call(page, 'debugSetTillTuning', { strikeSeconds: 0.5 });
  await clickTile(page, 13, 14);
  await expect.poll(async () => plotOf(await st(page), 13, 14).tillStrikes, { timeout: 15_000 }).toBeGreaterThanOrEqual(1);
  await press(page, 'e');
  await expect.poll(async () => (await st(page)).bagOpen).toBe(true);
  const k = plotOf(await st(page), 13, 14).tillStrikes;
  const foot0 = await st(page);
  await page.keyboard.down('d'); // phím đi khi mở gùi: không đi, không bỏ dở
  await waitFrames(page, 60);
  await page.keyboard.up('d');
  let s = await st(page);
  expect(plotOf(s, 13, 14).tillStrikes).toBe(k);
  expect(s.action.busy).toBe(true);
  expect(s.till.cancels).toBe(foot0.till.cancels);
  expect(Math.abs(s.footX - foot0.footX)).toBeLessThan(1);
  await press(page, 'e');
  await call(page, 'debugSetTillTuning', { strikeSeconds: 0.06 });
  await expect.poll(async () => plotOf(await st(page), 13, 14).soil, { timeout: 20_000 }).toBe('tilled');
  await idle(page);
  // Gieo hàng đợi 3 ô rồi mở gùi ngay (cùng tác vụ JS với lần thả chuột cuối).
  await moveMouseToTile(page, 13, 13);
  await page.mouse.down();
  await moveMouseToTile(page, 13, 14);
  await waitFrames(page, 1);
  await moveMouseToTile(page, 13, 15);
  await waitFrames(page, 1);
  await page.mouse.up();
  await page.keyboard.press('e');
  await expect.poll(async () => (await st(page)).bagOpen).toBe(true);
  const plantsAtOpen = (await st(page)).farmJuice.plants;
  const pendingAtOpen = await st(page);
  await waitFrames(page, 60);
  s = await st(page);
  expect(s.farmJuice.plants).toBe(plantsAtOpen); // đứng yên khi mở gùi
  console.log('[Q10] lúc mở gùi: plants', plantsAtOpen, 'current', JSON.stringify(pendingAtOpen.action.current), 'queue', pendingAtOpen.action.queue.length);
  await press(page, 'Escape');
  await idle(page);
  s = await st(page);
  expect(s.farmJuice.plants).toBe(3); // không mất việc nào
});

test('Q11 việc nhanh không khóa chân; chạm WASD không bỏ dở việc nhanh/hàng chờ', async ({ page }) => {
  test.setTimeout(90_000);
  await teleportAndSettle(page, 12, 14);
  await tillTiles(page, [
    [13, 13],
    [13, 14],
    [13, 15],
  ]);
  await startRecorder(page);
  await moveMouseToTile(page, 13, 13);
  await page.mouse.down();
  await moveMouseToTile(page, 13, 14);
  await waitFrames(page, 1);
  await moveMouseToTile(page, 13, 15);
  await waitFrames(page, 1);
  await page.mouse.up();
  // Chạm D nhanh (nhấn-nhả cùng tác vụ JS, như BUG-007).
  const cancels0 = (await st(page)).till.cancels;
  await page.evaluate(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'd', keyCode: 68, bubbles: true } as KeyboardEventInit));
    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'd', keyCode: 68, bubbles: true } as KeyboardEventInit));
  });
  await waitFrames(page, 2);
  const mid = await st(page);
  expect(mid.till.cancels).toBe(cancels0);
  await idle(page);
  const s = await st(page);
  expect(s.farmJuice.plants).toBe(3);
  // Giữ W một chút trong lúc tưới cả hàng: nhân vật đi được trong khi việc vẫn chạy.
  await moveMouseToTile(page, 13, 13);
  await page.mouse.down();
  await page.mouse.up();
  await expect.poll(async () => (await st(page)).action.kind).toBe('water');
  const y0 = (await st(page)).footY;
  await page.keyboard.down('w');
  await expect.poll(async () => y0 - (await st(page)).footY, { timeout: 10_000 }).toBeGreaterThan(5);
  await page.keyboard.up('w');
  await expect.poll(async () => (await st(page)).farmJuice.waters).toBe(1);
});

test('Q12 một lần rê một loại việc: bắt đầu trên cây chín chỉ hái; trên cỏ/đã tưới thì không làm gì', async ({ page }) => {
  test.setTimeout(90_000);
  await teleportAndSettle(page, 12, 14);
  await tillTiles(page, [
    [13, 13],
    [13, 14],
    [13, 15],
    [14, 13],
  ]);
  await plant(page, 13, 13);
  await water(page, 13, 13);
  await call(page, 'debugAdvanceDay'); // (13,13) chín
  await plant(page, 13, 14); // chưa tưới
  // (13,15) đã cuốc trống, (14,14) chưa cuốc.
  // Rê bắt đầu trên cây chín → qua cây chưa tưới, ô trống, ô chưa cuốc → chỉ hái.
  await moveMouseToTile(page, 13, 13);
  await page.mouse.down();
  for (const [x, y] of [
    [13, 14],
    [13, 15],
    [14, 14],
  ] as const) {
    await moveMouseToTile(page, x, y);
    await waitFrames(page, 4);
  }
  await page.mouse.up();
  await idle(page);
  let s = await st(page);
  expect(s.farmJuice.harvests).toBe(1);
  expect(s.farmJuice.waters).toBe(1); // chỉ lần tưới trước đêm
  expect(s.farmJuice.plants).toBe(2);
  expect(plotOf(s, 14, 14).tillStrikes).toBe(0);
  // Bắt đầu trên cỏ (12,13) → rê qua ruộng: không làm gì.
  await moveMouseToTile(page, 12, 13);
  await page.mouse.down();
  for (const [x, y] of [
    [13, 14],
    [13, 15],
    [14, 13],
  ] as const) {
    await moveMouseToTile(page, x, y);
    await waitFrames(page, 4);
  }
  await page.mouse.up();
  await waitFrames(page, 30);
  s = await st(page);
  expect(s.farmJuice.plants).toBe(2);
  expect(s.farmJuice.waters).toBe(1);
  expect(s.action.busy).toBe(false);
});

test('Q13 hàng chờ việc nhanh tối đa 4 (ô đang làm + 4 chờ)', async ({ page }) => {
  test.setTimeout(120_000);
  await teleportAndSettle(page, 14, 14); // đứng giữa ruộng: với tới cả 9 ô
  const tiles: [number, number][] = [
    [13, 13],
    [14, 13],
    [15, 13],
    [13, 14],
    [15, 14],
    [13, 15],
    [14, 15],
    [15, 15],
  ];
  await tillTiles(page, tiles);
  await call(page, 'debugSetSlot', 0, 'hat-rau-cai', 20);
  // Máy test headless chỉ ~16 FPS, rê chuột 1 ô mất ~1 s game > actionDuration 0.4 s → hàng chờ không bao giờ đầy.
  // Chỉ để ĐO hàng chờ: kéo dài việc nhanh lên 6 s bằng cách sửa tham số đang chạy (không sửa code game).
  await page.evaluate(() => {
    const sc = (window as unknown as { __game: GameHook }).__game.scene.getScene('Garden') as unknown as { fastParams: { duration: number } };
    sc.fastParams.duration = 6;
  });
  await startRecorder(page);
  // Rê qua 8 ô rồi buông.
  await moveMouseToTile(page, 13, 13);
  await page.mouse.down();
  for (const [x, y] of tiles.slice(1)) {
    await moveMouseToTile(page, x, y);
    await waitFrames(page, 1);
  }
  await page.mouse.up();
  await page.evaluate(() => {
    const sc = (window as unknown as { __game: GameHook }).__game.scene.getScene('Garden') as unknown as { fastParams: { duration: number } };
    sc.fastParams.duration = 0.4;
  });
  await idle(page);
  const rec = await recorded(page);
  const maxQ = Math.max(...rec.map((r) => r.q));
  const s = await st(page);
  console.log('[Q13] max queue', maxQ, 'plants', s.farmJuice.plants, 'frames ghi', rec.length);
  const lines = (rec as unknown as Record<string, unknown>[]).map((r) => `${r.hov}|cur=${r.cur}|q=${r.q}|p=${r.plants}|drag=${r.drag}`);
  const compact = lines.map((l, i) => `${i} ${l}`).filter((_, i) => i === 0 || lines[i] !== lines[i - 1]);
  console.log('[Q13] thay đổi:\n' + compact.join('\n'));
  console.log('[Q13] cây:', JSON.stringify(s.crops.map((c) => `${c.x},${c.y}`)));
  expect(maxQ).toBeLessThanOrEqual(4);
  expect(maxQ).toBe(4);
  expect(s.farmJuice.plants).toBeLessThan(8); // hàng chờ đầy thì bỏ qua ô (14,15),(15,15)
  await shot(page, 'qa-t003-queue-cap.png');
});

test('Q14 hotbar có che ruộng/viền ô? đứng mép dưới bản đồ & đứng dưới ruộng', async ({ page }) => {
  const HOTBAR_TOP = 1080 - 28 - 92 - 10; // hotbarRect.y - pad
  // Đứng ngay dưới ruộng (14,17): ô ruộng hàng 15 trong tầm — có nằm dưới hotbar không?
  await teleportAndSettle(page, 14, 17);
  for (const y of [13, 14, 15]) {
    const p = await call<XY>(page, 'debugTileToScreen', 14, y);
    expect(p.y).toBeLessThan(HOTBAR_TOP);
  }
  // Đứng trên ruộng (14,11): ô hàng 13 trong tầm (2 ô dưới) — tâm ô phải nằm trên hotbar.
  await teleportAndSettle(page, 14, 11);
  const s1 = await st(page);
  const tilePx = 64 * s1.zoom;
  const p13 = await call<XY>(page, 'debugTileToScreen', 14, 13);
  console.log('[Q14] zoom', s1.zoom, 'ô (14,13) trên màn', p13, 'đáy ô', p13.y + tilePx / 2, 'hotbar top', HOTBAR_TOP);
  // Mép dưới bản đồ: hàng 30 — nhân vật + ô trong tầm (hàng 28–30) có bị hotbar che?
  await teleportAndSettle(page, 14, 30);
  const s2 = await st(page);
  const hero = await call<XY>(page, 'debugTileToScreen', 14, 30);
  const below = await call<XY>(page, 'debugTileToScreen', 14, 29);
  console.log('[Q14] mép dưới: view', JSON.stringify(s2.view), 'mapPx', JSON.stringify(s2.mapPx), 'tâm ô hàng 30', hero, 'hàng 29', below);
  await moveMouseToTile(page, 14, 30);
  await shot(page, 'qa-t003-bottom-edge.png');
  await teleportAndSettle(page, 14, 11);
  await moveMouseToTile(page, 14, 13);
  await shot(page, 'qa-t003-above-farm.png');
});

test('Q15 1366×768: hotbar, gùi đọc được, không méo', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await waitFrames(page, 10);
  await teleportAndSettle(page, 12, 14);
  await moveMouseToTile(page, 13, 14);
  await shot(page, 'qa-t003-1366-hotbar.png');
  await press(page, 'e');
  const p = await hudToPage(page, 'bag', 0);
  await page.mouse.move(p.x, p.y);
  await expect.poll(async () => (await st(page)).hud!.tooltip).toBe('Hạt rau cải');
  await shot(page, 'qa-t003-1366-bag.png');
  const box = (await page.locator('canvas').boundingBox())!;
  expect(Math.abs(box.width / box.height - 16 / 9)).toBeLessThan(0.01);
});

test('Q10b mở gùi giữa lúc GIEO (trước điểm chạm): việc đứng yên, hàng chờ giữ, đóng gùi làm tiếp', async ({ page }) => {
  test.setTimeout(90_000);
  await teleportAndSettle(page, 12, 14);
  await tillTiles(page, [
    [13, 13],
    [13, 14],
  ]);
  // Kéo dài việc nhanh lên 4 s (chỉ để kịp mở gùi trước điểm chạm trên máy test chậm).
  const setDur = (d: number) =>
    page.evaluate((dur) => {
      const sc = (window as unknown as { __game: GameHook }).__game.scene.getScene('Garden') as unknown as { fastParams: { duration: number } };
      sc.fastParams.duration = dur;
    }, d);
  await setDur(4);
  await moveMouseToTile(page, 13, 13);
  await page.mouse.down();
  await moveMouseToTile(page, 13, 14);
  await waitFrames(page, 2);
  await page.mouse.up();
  await expect.poll(async () => (await st(page)).action.queue.length).toBe(1);
  await press(page, 'e');
  await expect.poll(async () => (await st(page)).bagOpen).toBe(true);
  const a = await page.evaluate(() => {
    const sc = (window as unknown as { __game: GameHook }).__game.scene.getScene('Garden') as unknown as { action: { elapsed: number } };
    return sc.action.elapsed;
  });
  await waitFrames(page, 60); // ~60 frame ≈ vài giây game ở máy test
  const s = await st(page);
  const b = await page.evaluate(() => {
    const sc = (window as unknown as { __game: GameHook }).__game.scene.getScene('Garden') as unknown as { action: { elapsed: number } };
    return sc.action.elapsed;
  });
  expect(b).toBeCloseTo(a, 5); // đồng hồ việc đứng yên
  expect(s.farmJuice.plants).toBe(0);
  expect(s.action.current).toEqual({ x: 13, y: 13 });
  expect(s.action.queue).toHaveLength(1);
  await shot(page, 'qa-t003-bag-over-plant.png');
  await press(page, 'e');
  await setDur(0.4);
  await idle(page);
  expect((await st(page)).farmJuice.plants).toBe(2);
});
