// T-003 — Gieo, tưới, hái + hotbar 9 ô và gùi tối thiểu (GDD §3.3, §3.4, §3.9, §8; D-022).
// Theo "Bạn thử thế nào" của T-003: phím 1 chọn hạt cải → click ô đã cuốc gieo → click lại tưới → G (phím thử, bản dev)
// cải chín → click hái, cải bay vào hotbar → E thấy cải trong gùi. Thêm: khoai lang 2 ngày, khát/héo/dọn, phím 1–9 +
// cuộn chuột, hết hạt, gùi đầy, giữ chuột rê cả hàng (một lần rê một loại việc), vừa đi vừa làm việc nhanh,
// ô cuốc dở click = cuốc tiếp.
// Đọc trạng thái qua window.__game.scene.getScene('Garden').debugState. Chờ theo TRẠNG THÁI (expect.poll / frame
// game), không chờ giờ cố định (BUG-006). Cuốc chạy nhanh bằng debugSetTillTuning.
// Vùng ruộng: ô x 13..15, y 13..15. Đứng ở (12,14): với tới cột 13 và (14,13..15) (tầm 2.5 ô).
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
  stage: 'seed' | 'growing' | 'ripe' | 'withered';
}
interface GState {
  gardenReady: boolean;
  footX: number;
  footY: number;
  view: { x: number; y: number; w: number; h: number };
  farm: { plots: Plot[]; tilled: number };
  hover: { x: number; y: number; inReach: boolean; job: string | null } | null;
  action: { busy: boolean; current: XY | null; queue: XY[]; dragKind: string | null; kind: string | null };
  till: { cancels: number; finishes: number };
  crops: CropInfo[];
  inventory: {
    slots: ({ id: string; count: number; name: string } | null)[];
    selected: number;
    selectedItem: string | null;
    lastSeedId: string | null;
  };
  bagOpen: boolean;
  bagHoverSlot: number;
  bubble: { visible: boolean; text: string; shows: number };
  farmJuice: {
    plants: number;
    waters: number;
    harvests: number;
    clears: number;
    nights: number;
    dropsActive: number;
    popsActive: number;
    lastWaterSfx: string | null;
    lastPlantSfx: { key: string; detune: number } | null;
    harvestSfx: { key: string; detune: number }[];
  };
  hud: {
    flying: number;
    landed: number;
    bouncingSlot: number;
    bagVisible: boolean;
    tooltip: string | null;
    tooltipCenter: XY | null;
    selectedFrame: number;
    hotbarCounts: string[];
  } | null;
}

type SceneHook = Record<string, unknown> & {
  debugState: GState;
  events: { on(e: string, f: () => void): void; off(e: string, f: () => void): void };
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

async function state(page: Page): Promise<GState | null> {
  return page.evaluate(() => {
    const g = (window as unknown as { __game?: GameHook }).__game;
    if (!g || !(g.scene.isActive('Garden') || g.scene.isPaused('Garden'))) return null;
    const s = g.scene.getScene('Garden').debugState;
    return s?.gardenReady && s.hud ? s : null;
  });
}
const st = async (page: Page): Promise<GState> => (await state(page))!;

/** Gọi một hàm debug của GardenScene. */
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

/** Đổi toạ độ hệ 1920×1080 của game sang toạ độ trang (khung canvas thật). */
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

async function waitFrames(page: Page, n: number): Promise<void> {
  const start = await page.evaluate(() => (window as unknown as { __game: GameHook }).__game.loop.frame);
  await page.waitForFunction(
    (target) => (window as unknown as { __game: GameHook }).__game.loop.frame >= target,
    start + n,
    { timeout: 30_000 },
  );
}

/** Dừng / chạy cả Vườn lẫn HUD (để chụp đúng khoảnh khắc icon đang bay). */
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

/** Cuốc nhanh các ô (6 nhát × 0.08 s) bằng click, chờ xong từng ô. */
async function tillTiles(page: Page, tiles: [number, number][]): Promise<void> {
  await call(page, 'debugSetTillTuning', { strikeSeconds: 0.08 });
  for (const [x, y] of tiles) {
    await clickTile(page, x, y);
    await expect.poll(async () => plotOf(await st(page), x, y).soil, { timeout: 20_000 }).toBe('tilled');
  }
  await expect.poll(async () => (await st(page)).action.busy).toBe(false);
}

/** Bấm một phím và chờ game chạy qua vài frame (phím được xử lý theo sự kiện, không mất khi gõ nhanh). */
async function press(page: Page, key: string): Promise<void> {
  await page.keyboard.press(key);
  await waitFrames(page, 3);
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

test('Bạn thử thế nào: phím 1 → gieo cải → tưới → G chín → hái bay vào hotbar → E thấy cải trong gùi', async ({ page }) => {
  test.setTimeout(90_000);
  const s0 = await st(page);
  // Khởi đầu: hạt cải ×6 ô 1, hạt khoai ×3 ô 2, hotbar hiện số lượng.
  expect(s0.inventory.slots[0]).toMatchObject({ id: 'hat-rau-cai', count: 6, name: 'Hạt rau cải' });
  expect(s0.inventory.slots[1]).toMatchObject({ id: 'hat-khoai-lang', count: 3 });
  expect(s0.inventory.slots).toHaveLength(18);
  expect(s0.hud!.hotbarCounts.slice(0, 3)).toEqual(['6', '3', '']);

  await teleportAndSettle(page, 12, 14);
  await tillTiles(page, [[13, 14]]);

  await press(page, '3');
  expect((await st(page)).inventory.selected).toBe(2);
  await press(page, '1');
  expect((await st(page)).inventory.selected).toBe(0);

  // Gieo: click ô đã cuốc trống.
  await moveMouseToTile(page, 13, 14);
  await expect.poll(async () => (await st(page)).hover?.job).toBe('plant');
  await clickTile(page, 13, 14);
  await expect.poll(async () => cropAt(await st(page), 13, 14)?.stage).toBe('seed');
  let s = await st(page);
  expect(cropAt(s, 13, 14)).toMatchObject({ cropId: 'rau-cai', age: 0, watered: false });
  expect(s.inventory.slots[0]?.count).toBe(5);
  expect(s.inventory.lastSeedId).toBe('hat-rau-cai');
  expect(s.farmJuice.plants).toBe(1);
  // Tiếng gieo (AUD-SFX-101): 1 trong 2 biến thể, lệch cao độ ngẫu nhiên trong ±70 cent (≈ ±4%).
  expect(s.farmJuice.lastPlantSfx?.key).toMatch(/^sfx-gieo-hat-[12]$/);
  expect(Math.abs(s.farmJuice.lastPlantSfx!.detune)).toBeLessThanOrEqual(70);
  await expect.poll(async () => (await st(page)).action.busy).toBe(false);
  await shot(page, 't003-planted.png');

  // Tưới: click lại → đất sẫm, giọt nước, tiếng tưới.
  await expect.poll(async () => (await st(page)).hover?.job).toBe('water');
  await clickTile(page, 13, 14);
  await expect.poll(async () => (await st(page)).farmJuice.waters).toBe(1);
  await setPaused(page, true);
  s = await st(page);
  expect(cropAt(s, 13, 14)?.watered).toBe(true);
  expect(s.farmJuice.dropsActive).toBeGreaterThan(0);
  expect(s.farmJuice.lastWaterSfx).toMatch(/^sfx-tuoi-nuoc-[12]$/);
  await page.screenshot({ path: join(SCREENSHOT_DIR, 't003-watered.png') });
  await setPaused(page, false);
  await expect.poll(async () => (await st(page)).action.busy).toBe(false);
  // Đã tưới rồi: click không làm gì.
  await clickTile(page, 13, 14);
  await waitFrames(page, 30);
  expect((await st(page)).farmJuice.waters).toBe(1);

  // G (phím thử bản dev): qua một đêm → cải chín.
  await press(page, 'g');
  await expect.poll(async () => cropAt(await st(page), 13, 14)?.ripe).toBe(true);
  s = await st(page);
  expect(s.farmJuice.nights).toBe(1);
  expect(cropAt(s, 13, 14)).toMatchObject({ stage: 'ripe', watered: false, age: 1 });
  await shot(page, 't003-ripe.png');

  // Hái: ghi lại ô hotbar nảy (HUD) mỗi frame.
  await page.evaluate(() => {
    const w = window as unknown as { __game: GameHook; __bounces: number[] };
    w.__bounces = [];
    const hud = w.__game.scene.getScene('GardenHud') as unknown as {
      debugState: { bouncingSlot: number };
      events: { on(e: string, f: () => void): void };
    };
    hud.events.on('postupdate', () => {
      const b = hud.debugState.bouncingSlot;
      if (b >= 0) w.__bounces.push(b);
    });
  });
  await expect.poll(async () => (await st(page)).hover?.job).toBe('harvest');
  // Dừng cả Vườn + HUD ~0.12 s (giờ game) sau lúc hái để chụp đúng lúc cây đang bật lên, icon đang bay.
  await page.evaluate(() => {
    const w = window as unknown as { __game: GameHook; __harvestPaused: boolean };
    w.__harvestPaused = false;
    const sc = w.__game.scene.getScene('Garden') as unknown as SceneHook & {
      events: { on(e: string, f: (t: number, d: number) => void): void; off(e: string, f: (t: number, d: number) => void): void };
    };
    let since = -1;
    const fn = (_t: number, d: number) => {
      const h = sc.debugState.farmJuice.harvests;
      if (h < 1) return;
      since = since < 0 ? 0 : since + d;
      if (since >= 120) {
        sc.events.off('postupdate', fn);
        w.__game.scene.pause('Garden');
        w.__game.scene.pause('GardenHud');
        w.__harvestPaused = true;
      }
    };
    sc.events.on('postupdate', fn);
  });
  await clickTile(page, 13, 14);
  await page.waitForFunction(() => (window as unknown as { __harvestPaused: boolean }).__harvestPaused, null, { timeout: 15_000 });
  s = await st(page);
  expect(s.farmJuice.harvests).toBe(1);
  // Tiếng hái (AUD-SFX-102): lần đầu ở nấc gốc, không random cao độ.
  expect(s.farmJuice.harvestSfx).toHaveLength(1);
  expect(s.farmJuice.harvestSfx[0].key).toMatch(/^sfx-hai-cay-[12]$/);
  expect(s.farmJuice.harvestSfx[0].detune).toBe(0);
  expect(s.farmJuice.popsActive).toBeGreaterThan(0); // cây bật lên
  expect(s.hud!.flying).toBeGreaterThan(0); // icon đang bay vào hotbar
  await page.screenshot({ path: join(SCREENSHOT_DIR, 't003-harvest-fly.png') });
  await setPaused(page, false);
  await expect.poll(async () => (await st(page)).hud!.landed, { timeout: 15_000 }).toBe(1);
  await expect.poll(() => page.evaluate(() => (window as unknown as { __bounces: number[] }).__bounces.includes(2))).toBe(true);
  s = await st(page);
  // Cải vào ô trống đầu tiên (ô 3), ô ruộng về đất chưa cuốc (harvestResetsSoil), tillStrikes = 0.
  expect(s.inventory.slots[2]).toMatchObject({ id: 'rau-cai', count: 1, name: 'Rau cải' });
  expect(s.hud!.hotbarCounts[2]).toBe('1');
  expect(plotOf(s, 13, 14)).toMatchObject({ soil: 'untilled', tillStrikes: 0, crop: null });
  expect(s.hover?.job).toBe('till');

  // E: mở gùi, rê chuột lên ô cải → tên món.
  await press(page, 'e');
  await expect.poll(async () => (await st(page)).hud!.bagVisible).toBe(true);
  expect((await st(page)).bagOpen).toBe(true);
  const p = await hudToPage(page, 'bag', 2);
  await page.mouse.move(p.x, p.y);
  await expect.poll(async () => (await st(page)).hud!.tooltip).toBe('Rau cải');
  expect((await st(page)).bagHoverSlot).toBe(2);
  // BUG-011: ô hàng trên → tên món hiện BÊN DƯỚI ô (không đè tiêu đề "Gùi"). Ô 1 sát tiêu đề nhất.
  const p0 = await hudToPage(page, 'bag', 0);
  await page.mouse.move(p0.x, p0.y);
  await expect.poll(async () => (await st(page)).hud!.tooltip).toBe('Hạt rau cải');
  const slot0 = await call<XY>(page, 'debugHudSlotCenter', 'bag', 0);
  expect((await st(page)).hud!.tooltipCenter!.y).toBeGreaterThan(slot0.y + 40); // dưới mép dưới ô (ô 96 px)
  await shot(page, 't003-bag-tooltip-top.png');
  await page.mouse.move(p.x, p.y);
  await expect.poll(async () => (await st(page)).hud!.tooltip).toBe('Rau cải');
  // Đang mở gùi: phím đi không làm nhân vật đi.
  const before = await st(page);
  await page.keyboard.down('d');
  await waitFrames(page, 20);
  await page.keyboard.up('d');
  expect(Math.abs((await st(page)).footX - before.footX)).toBeLessThan(1);
  await shot(page, 't003-bag.png');
  await press(page, 'e');
  await expect.poll(async () => (await st(page)).hud!.bagVisible).toBe(false);
  // Esc cũng đóng.
  await press(page, 'e');
  await expect.poll(async () => (await st(page)).bagOpen).toBe(true);
  await press(page, 'Escape');
  await expect.poll(async () => (await st(page)).bagOpen).toBe(false);
});

test('Khoai lang: phím 2, cần 2 ngày được tưới; không tưới thì khát rồi héo, click dọn → đất chưa cuốc', async ({ page }) => {
  test.setTimeout(90_000);
  await teleportAndSettle(page, 12, 14);
  await tillTiles(page, [
    [13, 13],
    [13, 15],
    [14, 14],
  ]);

  await press(page, '2');
  await clickTile(page, 13, 13);
  await expect.poll(async () => cropAt(await st(page), 13, 13)?.cropId).toBe('khoai-lang');
  expect((await st(page)).inventory.slots[1]?.count).toBe(2);
  await press(page, '1');
  await expect.poll(async () => (await st(page)).action.busy).toBe(false);
  await clickTile(page, 13, 15); // cải — để khát
  await expect.poll(async () => cropAt(await st(page), 13, 15)?.cropId).toBe('rau-cai');
  await expect.poll(async () => (await st(page)).action.busy).toBe(false);
  await clickTile(page, 13, 13); // tưới khoai
  await expect.poll(async () => cropAt(await st(page), 13, 13)?.watered).toBe(true);
  // Ảnh so màu đất: (13,13) đã tưới (sẫm) cạnh (13,15) chưa tưới.
  await moveMouseToTile(page, 11, 12);
  await expect.poll(async () => (await st(page)).farmJuice.dropsActive, { timeout: 10_000 }).toBe(0);
  await shot(page, 't003-watered-soil.png');

  await press(page, 'g');
  await expect.poll(async () => (await st(page)).farmJuice.nights).toBe(1);
  let s = await st(page);
  expect(cropAt(s, 13, 13)).toMatchObject({ stage: 'growing', age: 1, ripe: false });
  expect(cropAt(s, 13, 15)).toMatchObject({ stage: 'seed', dryDays: 1, thirsty: true, withered: false });
  // Gieo thêm 1 hạt cải ở (14,14) để ảnh có đủ: hạt / mầm / mầm khát.
  await expect.poll(async () => (await st(page)).action.busy).toBe(false);
  await clickTile(page, 14, 14);
  await expect.poll(async () => cropAt(await st(page), 14, 14)?.stage).toBe('seed');
  await moveMouseToTile(page, 11, 12); // con trỏ ra khỏi ruộng cho ảnh sạch
  await waitFrames(page, 10);
  await shot(page, 't003-stages.png');

  // G lần 2 mà KHÔNG tưới lại → khoai khát (chưa chín) — đúng luật "chỉ lớn khi được tưới".
  // Tưới lại khoai rồi mới G: khoai chín; cải bỏ khát 2 đêm liền → héo.
  await clickTile(page, 13, 13);
  await expect.poll(async () => cropAt(await st(page), 13, 13)?.watered).toBe(true);
  await press(page, 'g');
  await expect.poll(async () => (await st(page)).farmJuice.nights).toBe(2);
  s = await st(page);
  expect(cropAt(s, 13, 13)).toMatchObject({ stage: 'ripe', ripe: true, age: 2 });
  expect(cropAt(s, 13, 15)).toMatchObject({ stage: 'withered', withered: true });
  await moveMouseToTile(page, 11, 12);
  await waitFrames(page, 10);
  await shot(page, 't003-ripe-withered.png');

  // Dọn cây héo → đất chưa cuốc, tillStrikes 0.
  await moveMouseToTile(page, 13, 15);
  await expect.poll(async () => (await st(page)).hover?.job).toBe('clear');
  await clickTile(page, 13, 15);
  await expect.poll(async () => (await st(page)).farmJuice.clears).toBe(1);
  s = await st(page);
  expect(plotOf(s, 13, 15)).toMatchObject({ soil: 'untilled', tillStrikes: 0, crop: null });

  // Hái khoai.
  await expect.poll(async () => (await st(page)).action.busy).toBe(false);
  await clickTile(page, 13, 13);
  await expect.poll(async () => (await st(page)).inventory.slots.find((x) => x?.id === 'khoai-lang')?.count ?? 0).toBe(1);
});

test('Hotbar: phím 1–9 và cuộn chuột đổi ô (vòng quanh), click ô hotbar chọn ô, không xuyên xuống ruộng', async ({ page }) => {
  await teleportAndSettle(page, 12, 14);
  for (const [key, idx] of [
    ['5', 4],
    ['9', 8],
    ['2', 1],
    ['1', 0],
  ] as const) {
    await press(page, key);
    expect((await st(page)).inventory.selected).toBe(idx);
  }
  await expect.poll(async () => (await st(page)).hud!.selectedFrame).toBe(0);

  // Cuộn chuột (con trỏ trên khung game).
  await moveMouseToTile(page, 12, 12);
  await page.mouse.wheel(0, 100); // xuống → ô 2
  await expect.poll(async () => (await st(page)).inventory.selected).toBe(1);
  await page.mouse.wheel(0, -100);
  await expect.poll(async () => (await st(page)).inventory.selected).toBe(0);
  await page.mouse.wheel(0, -100); // ô 1 cuộn lên → ô 9
  await expect.poll(async () => (await st(page)).inventory.selected).toBe(8);
  await page.mouse.wheel(0, 100); // ô 9 cuộn xuống → ô 1
  await expect.poll(async () => (await st(page)).inventory.selected).toBe(0);

  // BUG-009: touchpad bắn nhiều sự kiện deltaY nhỏ → cộng dồn đủ 100 px mới 1 nấc.
  for (let i = 0; i < 4; i++) await page.mouse.wheel(0, 4); // 16 px
  await waitFrames(page, 10);
  expect((await st(page)).inventory.selected).toBe(0);
  for (let i = 0; i < 21; i++) await page.mouse.wheel(0, 4); // tổng 100 px
  await expect.poll(async () => (await st(page)).inventory.selected).toBe(1);
  await page.mouse.wheel(0, -100);
  await expect.poll(async () => (await st(page)).inventory.selected).toBe(0);

  // BUG-010: bấm "7" rồi "3" trong cùng một frame → chọn theo phím bấm SAU (ô 3).
  await page.evaluate(() => {
    for (const [key, code] of [
      ['7', 55],
      ['3', 51],
    ] as const) {
      window.dispatchEvent(new KeyboardEvent('keydown', { key, keyCode: code, bubbles: true } as KeyboardEventInit));
      window.dispatchEvent(new KeyboardEvent('keyup', { key, keyCode: code, bubbles: true } as KeyboardEventInit));
    }
  });
  await expect.poll(async () => (await st(page)).inventory.selected).toBe(2);
  await press(page, '1');

  // Click ô hotbar thứ 2 → chọn ô 2; con trỏ trên hotbar thì không có viền ô ruộng.
  const p = await hudToPage(page, 'hotbar', 1);
  await page.mouse.move(p.x, p.y);
  await page.mouse.down();
  await page.mouse.up();
  await expect.poll(async () => (await st(page)).inventory.selected).toBe(1);
  const s = await st(page);
  expect(s.hover).toBeNull();
  expect(s.action.busy).toBe(false);
  expect(s.hud!.selectedFrame).toBe(1);
  await shot(page, 't003-hotbar.png');
});

test('Hết hạt: bong bóng "Hết hạt rồi!", không gieo', async ({ page }) => {
  await teleportAndSettle(page, 12, 14);
  await tillTiles(page, [
    [13, 13],
    [13, 14],
  ]);
  await call(page, 'debugSetSlot', 0, 'hat-rau-cai', 1);
  await call(page, 'debugSetSlot', 1, null, 0);
  await clickTile(page, 13, 13);
  await expect.poll(async () => cropAt(await st(page), 13, 13)?.cropId).toBe('rau-cai');
  expect((await st(page)).inventory.slots[0]).toBeNull();
  await expect.poll(async () => (await st(page)).action.busy).toBe(false);

  await clickTile(page, 13, 14);
  await expect.poll(async () => (await st(page)).bubble).toMatchObject({ visible: true, text: 'Hết hạt rồi!' });
  await shot(page, 't003-no-seeds.png'); // chụp ngay khi bong bóng còn hiện (bubbleSeconds tính theo giờ game)
  await waitFrames(page, 20);
  const s = await st(page);
  expect(cropAt(s, 13, 14)).toBeNull();
  expect(s.farmJuice.plants).toBe(1);
});

test('Gùi đầy: không hái, bong bóng "Gùi đầy rồi!", cây vẫn chín trên ô', async ({ page }) => {
  await teleportAndSettle(page, 12, 14);
  await tillTiles(page, [[13, 14]]);
  await clickTile(page, 13, 14); // gieo cải
  await expect.poll(async () => cropAt(await st(page), 13, 14)?.stage).toBe('seed');
  await expect.poll(async () => (await st(page)).action.busy).toBe(false);
  await clickTile(page, 13, 14); // tưới
  await expect.poll(async () => cropAt(await st(page), 13, 14)?.watered).toBe(true);
  await call(page, 'debugAdvanceDay');
  await expect.poll(async () => cropAt(await st(page), 13, 14)?.ripe).toBe(true);
  // 18 ô đều đầy khoai (20/20) → không còn chỗ cho cải.
  for (let i = 0; i < 18; i++) await call(page, 'debugSetSlot', i, 'khoai-lang', 20);
  await expect.poll(async () => (await st(page)).action.busy).toBe(false);

  await clickTile(page, 13, 14);
  await expect.poll(async () => (await st(page)).bubble).toMatchObject({ visible: true, text: 'Gùi đầy rồi!' });
  await shot(page, 't003-bag-full.png');
  await waitFrames(page, 30);
  const s = await st(page);
  expect(s.farmJuice.harvests).toBe(0);
  expect(cropAt(s, 13, 14)).toMatchObject({ ripe: true });
  expect(s.inventory.slots.every((x) => x?.id === 'khoai-lang' && x.count === 20)).toBe(true);
});

test('Việc nhanh: vừa đi vừa gieo; giữ chuột rê cả hàng chỉ gieo (một loại việc); ô cuốc dở click = cuốc tiếp', async ({ page }) => {
  test.setTimeout(90_000);
  await teleportAndSettle(page, 12, 14);
  await tillTiles(page, [
    [13, 13],
    [13, 14],
    [13, 15],
  ]);
  // Ô (14,14) cuốc dở: nhát dài, bổ được 1 nhát thì bấm D bỏ dở.
  await call(page, 'debugSetTillTuning', { strikeSeconds: 0.5 });
  await clickTile(page, 14, 14);
  await expect.poll(async () => plotOf(await st(page), 14, 14).tillStrikes, { timeout: 15_000 }).toBeGreaterThanOrEqual(1);
  await press(page, 'd');
  await expect.poll(async () => (await st(page)).action.busy).toBe(false);
  const partial = plotOf(await st(page), 14, 14).tillStrikes;
  expect(partial).toBeGreaterThanOrEqual(1);
  expect(partial).toBeLessThan(6);
  await teleportAndSettle(page, 12, 14);
  const cancels0 = (await st(page)).till.cancels;

  // Vừa đi vừa gieo: click gieo (13,13) rồi giữ S — việc nhanh không bỏ dở, nhân vật vẫn đi.
  await clickTile(page, 13, 13);
  await expect.poll(async () => (await st(page)).action.kind).toBe('plant');
  const y0 = (await st(page)).footY;
  await page.keyboard.down('s');
  await expect.poll(async () => (await st(page)).footY - y0, { timeout: 10_000 }).toBeGreaterThan(8);
  await page.keyboard.up('s');
  await expect.poll(async () => cropAt(await st(page), 13, 13)?.cropId).toBe('rau-cai');
  expect((await st(page)).till.cancels).toBe(cancels0);
  await expect.poll(async () => (await st(page)).action.busy).toBe(false);

  // Giữ chuột rê: bấm trên ô đã cuốc trống (13,14) → chỉ gieo; rê qua (13,15) [gieo], (14,14) [cuốc dở → bỏ qua],
  // (13,13) [đã gieo, chưa tưới → bỏ qua].
  await teleportAndSettle(page, 12, 14);
  await moveMouseToTile(page, 13, 14);
  await page.mouse.down();
  await expect.poll(async () => (await st(page)).action.dragKind).toBe('plant');
  for (const [x, y] of [
    [13, 15],
    [14, 14],
    [13, 13],
  ] as const) {
    await moveMouseToTile(page, x, y);
    await waitFrames(page, 4);
  }
  await page.mouse.up();
  await expect.poll(async () => (await st(page)).action.busy, { timeout: 10_000 }).toBe(false);
  let s = await st(page);
  expect(cropAt(s, 13, 14)?.cropId).toBe('rau-cai');
  expect(cropAt(s, 13, 15)?.cropId).toBe('rau-cai');
  expect(plotOf(s, 14, 14)).toMatchObject({ soil: 'untilled', tillStrikes: partial }); // không bị cuốc tiếp
  expect(cropAt(s, 13, 13)?.watered).toBe(false); // không bị tưới
  expect(s.farmJuice.plants).toBe(3);
  await shot(page, 't003-drag-plant.png');

  // Rê lần mới, bắt đầu trên cây chưa tưới → tưới cả hàng.
  await moveMouseToTile(page, 13, 13);
  await page.mouse.down();
  for (const [x, y] of [
    [13, 14],
    [13, 15],
  ] as const) {
    await moveMouseToTile(page, x, y);
    await waitFrames(page, 4);
  }
  await page.mouse.up();
  await expect.poll(async () => (await st(page)).farmJuice.waters, { timeout: 10_000 }).toBe(3);

  // Ô cuốc dở: click = cuốc tiếp (không gieo).
  await call(page, 'debugSetTillTuning', { strikeSeconds: 0.08 });
  await expect.poll(async () => (await st(page)).action.busy).toBe(false);
  await moveMouseToTile(page, 14, 14);
  await expect.poll(async () => (await st(page)).hover?.job).toBe('till');
  await clickTile(page, 14, 14);
  await expect.poll(async () => plotOf(await st(page), 14, 14).soil, { timeout: 15_000 }).toBe('tilled');
  s = await st(page);
  expect(cropAt(s, 14, 14)).toBeNull();
});

test('Hái liên tiếp: tiếng "pop" lên dần theo thang ngũ cung 0/200/400/…, ngừng lâu thì về nấc đầu', async ({ page }) => {
  test.setTimeout(90_000);
  await teleportAndSettle(page, 12, 14);
  const tiles: [number, number][] = [
    [13, 13],
    [13, 14],
    [13, 15],
    [14, 14],
  ];
  await tillTiles(page, tiles);
  for (const [x, y] of tiles) {
    await clickTile(page, x, y); // gieo
    await expect.poll(async () => cropAt(await st(page), x, y)?.cropId).toBe('rau-cai');
    await expect.poll(async () => (await st(page)).action.busy).toBe(false);
    await clickTile(page, x, y); // tưới
    await expect.poll(async () => cropAt(await st(page), x, y)?.watered).toBe(true);
    await expect.poll(async () => (await st(page)).action.busy).toBe(false);
  }
  await call(page, 'debugAdvanceDay');
  await expect.poll(async () => (await st(page)).crops.filter((c) => c.ripe).length).toBe(4);

  // Giữ chuột rê nhanh qua 3 cây chín → cả 3 vào hàng chờ, hái liền mạch mỗi 0.4 s (< harvestPitchResetSeconds 1.2 s).
  // Tính sẵn toạ độ để rê không bị chậm bởi các lần hỏi trang (máy test chậm có thể làm hở > 1.2 s giữa 2 lần hái).
  const pts = [await tileToPage(page, 13, 13), await tileToPage(page, 13, 14), await tileToPage(page, 13, 15)];
  await page.mouse.move(pts[0].x, pts[0].y);
  await page.mouse.down();
  for (const q of pts.slice(1)) {
    await waitFrames(page, 1);
    await page.mouse.move(q.x, q.y);
  }
  await waitFrames(page, 2);
  await page.mouse.up();
  await expect.poll(async () => (await st(page)).farmJuice.harvests, { timeout: 15_000 }).toBe(3);
  let s = await st(page);
  expect(s.farmJuice.harvestSfx.map((h) => h.detune)).toEqual([0, 200, 400]);
  expect(s.farmJuice.harvestSfx.every((h) => /^sfx-hai-cay-[12]$/.test(h.key))).toBe(true);

  // Đợi quá 1.2 s giờ game (≥ 90 frame ở 60 FPS; máy chậm thì frame dài hơn nên còn dư) → về nấc đầu.
  await waitFrames(page, 90);
  await expect.poll(async () => (await st(page)).action.busy).toBe(false);
  await clickTile(page, 14, 14);
  await expect.poll(async () => (await st(page)).farmJuice.harvests, { timeout: 15_000 }).toBe(4);
  s = await st(page);
  expect(s.farmJuice.harvestSfx.at(-1)!.detune).toBe(0);
});
