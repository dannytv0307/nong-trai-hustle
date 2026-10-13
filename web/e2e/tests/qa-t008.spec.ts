// QA độc lập T-008 — Tự lưu trong trình duyệt (ca rìa ngoài save.spec.ts).
// Q1 trạng thái phong phú → F5 thật / đóng tab + mở trang mới cùng context → khớp hết.
// Q2 F5 lúc: đang cuốc (nhát thật), hàng chờ, gùi / thùng / sạp / Tạm dừng / hộp xác nhận / hộp "Đi ngủ?" mở, chiều tối,
//    đang thiếp đi, đang ngủ gục, tổng kết, đang sáng dần → tiền bảo toàn, không kẹt màn đen, không qua đêm hai lần.
// Q3 F5 liên tục nhanh.
// Q4 save hỏng / bị sửa tay nhiều kiểu → không treo, kẹp / đặt lại hợp lý.
// Q5 Chơi lại từ đầu 3 lần liền: Enter không xóa, G / F9 một lần = một tác dụng, nhạc không phát đôi.
// Q6 "Đã lưu lúc" cập nhật đúng; tự lưu không chạy lúc Tạm dừng / chuỗi đêm.
// Q7 localStorage bị chặn / đầy → game vẫn chạy, không console error.
import { expect, test, type BrowserContext, type Page } from '@playwright/test';
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
  crop: { cropId: string; age: number; dryDays: number; withered: boolean; ripe?: boolean; thirsty?: boolean; stage?: string } | null;
  watered: boolean;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GState = any;
type SceneHook = Record<string, unknown> & { debugState: GState };
type GameHook = {
  loop: { frame: number };
  sound: { sounds: { key: string; isPlaying: boolean }[]; locked: boolean };
  scene: { isActive(key: string): boolean; isPaused(key: string): boolean; getScene(key: string): SceneHook; pause(k: string): void; resume(k: string): void };
};

const WAKE = { x: 7, y: 5 };
const SPAWN_FOOT = { x: 11 * 64, y: 13 * 64 };
const SELL_BOX = { x: 17, y: 11 };
const STALL = { x: 13, y: 26 };
const INSIDE_HOUSE = { x: 12, y: 7 };

async function state(page: Page): Promise<GState | null> {
  return page.evaluate(() => {
    const g = (window as unknown as { __game?: GameHook }).__game;
    if (!g || !(g.scene.isActive('Garden') || g.scene.isPaused('Garden'))) return null;
    const s = g.scene.getScene('Garden')?.debugState;
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
async function waitReady(page: Page): Promise<void> {
  await expect.poll(() => state(page).then((s) => s !== null), { timeout: 30_000 }).toBe(true);
}
async function reload(page: Page): Promise<void> {
  await page.reload();
  await waitReady(page);
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
const plotOf = (s: GState, x: number, y: number): Plot => s.farm.plots.find((p: Plot) => p.x === x && p.y === y)!;

async function till(page: Page, x: number, y: number): Promise<void> {
  await call(page, 'debugSetTillTuning', { strikeSeconds: 0.08 });
  await call(page, 'debugHoldHoe'); // T-009 (D-026): phải cầm cuốc mới cuốc
  await clickTile(page, x, y);
  await expect.poll(async () => plotOf(await st(page), x, y).soil, { timeout: 20_000 }).toBe('tilled');
  await idle(page);
}
async function plant(page: Page, x: number, y: number, slot: number, cropId: string): Promise<void> {
  await press(page, String(slot + 1));
  await clickTile(page, x, y);
  await expect.poll(async () => plotOf(await st(page), x, y).crop?.cropId ?? null, { timeout: 10_000 }).toBe(cropId);
  await idle(page);
}
async function water(page: Page, x: number, y: number): Promise<void> {
  await clickTile(page, x, y);
  await expect.poll(async () => plotOf(await st(page), x, y).watered, { timeout: 10_000 }).toBe(true);
  await idle(page);
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
async function shot(page: Page, name: string, freeze = true): Promise<void> {
  if (freeze) await setPhaserPaused(page, true);
  await page.screenshot({ path: join(SCREENSHOT_DIR, name) });
  if (freeze) await setPhaserPaused(page, false);
}
async function waitPhase(page: Page, phase: string, timeout = 20_000): Promise<void> {
  await expect.poll(async () => (await st(page)).night.phase, { timeout, intervals: [30] }).toBe(phase);
}
const itemTotal = (slots: Slot[]): Record<string, number> => {
  const out: Record<string, number> = {};
  for (const s of slots) if (s) out[s.id] = (out[s.id] ?? 0) + s.count;
  return out;
};
function snapshot(s: GState) {
  return {
    tile: { x: s.tileX, y: s.tileY },
    facing: s.facing,
    day: s.time.day,
    phase: s.time.phase,
    plots: s.farm.plots,
    crops: s.crops,
    slots: s.inventory.slots,
    selected: s.inventory.selected,
    lastSeedId: s.inventory.lastSeedId,
    money: s.money.current,
    sellBox: s.sellBox.slots,
    stamina: { current: s.stamina.current, exhausted: s.stamina.exhausted },
    hud: { money: s.hud.moneyText, stamina: s.hud.staminaText, day: s.hud.dayText },
  };
}
/** Sau khi vào lại: không kẹt màn đen / cửa sổ, đồng hồ chạy. */
async function expectPlayable(page: Page): Promise<void> {
  const s = await st(page);
  expect(s.night.phase).toBe('none');
  expect(s.night.fade).toBe(0);
  expect(s.hud.nightOverlayAlpha ?? 0).toBe(0);
  expect(s.hud.summaryVisible).toBe(false);
  expect(s.hud.sleepPromptVisible).toBe(false);
  expect(s.pause.menuOpen).toBe(false);
  expect(s.bagOpen).toBe(false);
  expect(s.shop.window).toBeNull();
  expect(s.action.busy).toBe(false);
  expect(s.action.queued).toBe(0);
  expect(s.time.reasons).toEqual([]);
  const e0 = s.time.elapsedSeconds;
  await expect.poll(async () => (await st(page)).time.elapsedSeconds, { timeout: 10_000 }).toBeGreaterThan(e0 + 0.2);
}

let errors: string[] = [];
let warnings: string[] = [];
function watch(page: Page): void {
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`[console.error] ${msg.text()}`);
    if (msg.type() === 'warning') warnings.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(`[pageerror] ${err.message}`));
  page.on('response', (r) => {
    if (r.status() >= 400) errors.push(`[http ${r.status()}] ${r.url()}`);
  });
}

test.beforeEach(async ({ page }) => {
  errors = [];
  warnings = [];
  watch(page);
  await page.goto('/');
  await waitReady(page);
  mkdirSync(SCREENSHOT_DIR, { recursive: true });
});
test.afterEach(() => {
  expect(errors, errors.join('\n')).toEqual([]);
});

// ------------------------------------------------------------------------------------------------ Q1

async function buildRichState(page: Page): Promise<void> {
  await teleportAndSettle(page, 14, 16);
  // Gùi: cuốc ô 1 (T-009), hạt cải ô 2, hạt khoai ô 3 (đủ dùng).
  await call(page, 'debugSetSlot', 1, 'hat-rau-cai', 10);
  await call(page, 'debugSetSlot', 2, 'hat-khoai-lang', 10);
  // Ngày 1: A khoai (tưới), B cải (tưới), D cải (không tưới).
  for (const [x, y] of [[13, 15], [14, 15], [15, 15]] as [number, number][]) await till(page, x, y);
  await plant(page, 13, 15, 2, 'khoai-lang');
  await water(page, 13, 15);
  await plant(page, 14, 15, 1, 'rau-cai');
  await water(page, 14, 15);
  await plant(page, 15, 15, 1, 'rau-cai');
  await call(page, 'debugAdvanceDay'); // → Ngày 2: B chín, D khát 1
  // Ngày 2: tưới A, B; trồng C (15,14) không tưới; D để khát tiếp.
  await water(page, 13, 15); // B (14,15) đã chín — click là hái nên để nguyên
  await till(page, 15, 14);
  await plant(page, 15, 14, 1, 'rau-cai');
  await call(page, 'debugAdvanceDay'); // → Ngày 3: A chín, D héo, C khát
  // Ô cuốc dở 3 nhát ở (13,13); ô cuốc xong trống (14,13).
  await teleportAndSettle(page, 12, 14);
  await till(page, 14, 13);
  await call(page, 'debugSetTillTuning', { strikeSeconds: 0.25 });
  await clickTile(page, 13, 13);
  await expect.poll(async () => plotOf(await st(page), 13, 13).tillStrikes, { timeout: 20_000, intervals: [20] }).toBeGreaterThanOrEqual(3);
  await page.keyboard.press('a'); // bỏ dở
  await idle(page);
  // Gùi nhiều chồng (cả hàng dưới), ô chọn 7, thùng có đồ, tiền 137, Sức 0 (đuối), 19:15 (chiều tối).
  await call(page, 'debugSetSlot', 3, 'rau-cai', 7);
  await call(page, 'debugSetSlot', 5, 'khoai-lang', 20);
  await call(page, 'debugSetSlot', 9, 'khoai-lang', 3);
  await call(page, 'debugSetSlot', 17, 'hat-rau-cai', 1);
  await call(page, 'debugSetSellBoxSlot', 0, 'rau-cai', 4);
  await call(page, 'debugSetSellBoxSlot', 5, 'khoai-lang', 2);
  await call(page, 'debugSetMoney', 137);
  await press(page, '7');
  await call(page, 'debugSetStamina', 0);
  await call(page, 'debugSetHour', 19.25);
  // Vào trong nhà, đi lên một chút → mặt hướng lên.
  await teleportAndSettle(page, INSIDE_HOUSE.x, INSIDE_HOUSE.y);
  await page.keyboard.down('w');
  await expect.poll(async () => (await st(page)).facing).toBe('up');
  await page.keyboard.up('w');
  await waitFrames(page, 10);
}

test('Q1 trạng thái phong phú → F5 thật và đóng tab + mở trang mới cùng context: khớp hết', async ({ page, context }) => {
  test.setTimeout(300_000);
  await buildRichState(page);
  const before = await st(page);
  // Có đủ loại ô.
  const kinds = [...before.crops.map((c: { stage: string }) => c.stage), ...before.farm.plots.map((p: Plot) => (p.tillStrikes > 0 && p.soil === 'untilled' ? 'partial' : p.soil))];
  console.log('ô ruộng trước F5:', JSON.stringify(before.farm.plots.filter((p: Plot) => p.soil === 'tilled' || p.tillStrikes > 0)));
  expect(kinds).toContain('partial');
  expect(kinds).toContain('ripe');
  expect(kinds).toContain('withered');
  expect(before.crops.some((c: { thirsty: boolean }) => c.thirsty)).toBe(true);
  expect(before.stamina.exhausted).toBe(true);
  expect(before.time.day).toBe(3);
  expect(before.inventory.selected).toBe(6);
  await shot(page, 'qa-t008-rich-before.png');

  await reload(page);
  const after = await st(page);
  expect(after.save.loadedFromSave).toBe(true);
  expect(snapshot(after)).toEqual(snapshot(before));
  const lag = before.time.elapsedSeconds - after.save.loadedElapsedSeconds;
  console.log('lệch giờ sau F5 (giây thật):', lag.toFixed(2));
  expect(lag).toBeGreaterThan(-5); // âm = bản lưu lúc F5 muộn hơn lần đọc (đồng hồ chạy tiếp)
  expect(lag).toBeLessThan(5);
  expect(Math.abs(after.footX - before.footX)).toBeLessThan(1);
  expect(Math.abs(after.footY - before.footY)).toBeLessThan(1);
  expect(after.sky.visible).toBe(before.sky.visible);
  expect(Math.abs(after.sky.alpha - before.sky.alpha)).toBeLessThan(0.02);
  await shot(page, 'qa-t008-rich-after-f5.png');

  // Đóng tab (có beforeunload/pagehide) rồi mở trang mới cùng context.
  await page.close({ runBeforeUnload: true });
  const p2 = await context.newPage();
  watch(p2);
  await p2.goto('/');
  await waitReady(p2);
  const again = await st(p2);
  expect(again.save.loadedFromSave).toBe(true);
  const a = snapshot(again);
  const b = snapshot(before);
  // Giờ có thể nhích vài giây (đã chạy giữa F5 và đóng tab) — so riêng.
  expect(Math.abs(again.time.elapsedSeconds - before.time.elapsedSeconds)).toBeLessThan(15);
  expect(a).toEqual(b);
  await shot(p2, 'qa-t008-rich-newtab.png');
});

// ------------------------------------------------------------------------------------------------ Q2

test('Q2a F5 giữa nhát cuốc thật (0.85 s) + hàng chờ: ô giữ số nhát đã chạm, không mất Sức ảo', async ({ page }) => {
  test.setTimeout(120_000);
  await teleportAndSettle(page, 12, 14);
  await clickTile(page, 13, 14);
  await clickTile(page, 14, 14); // hàng chờ
  await expect.poll(async () => plotOf(await st(page), 13, 14).tillStrikes, { timeout: 20_000, intervals: [20] }).toBeGreaterThanOrEqual(2);
  const s0 = await st(page);
  const n0 = plotOf(s0, 13, 14).tillStrikes;
  expect(s0.action.queued).toBeGreaterThanOrEqual(1);
  await reload(page);
  const s = await st(page);
  const n = plotOf(s, 13, 14).tillStrikes;
  console.log('nhát trước F5', n0, 'sau F5', n, 'Sức', s0.stamina.current, '→', s.stamina.current);
  expect(n === n0 || n === n0 + 1).toBe(true);
  expect(plotOf(s, 13, 14).soil).toBe('untilled');
  expect(plotOf(s, 14, 14).tillStrikes).toBe(0);
  // Sức chỉ trừ khi xong ô (D-022) → không đổi.
  expect(s.stamina.current).toBe(s0.stamina.current);
  await expectPlayable(page);
});

test('Q2b F5 khi gùi / thùng bán / sạp hạt đang mở: đồ và tiền bảo toàn, cửa sổ đóng', async ({ page }) => {
  test.setTimeout(180_000);
  await call(page, 'debugSetSlot', 3, 'rau-cai', 5);
  // Gùi mở.
  await press(page, 'e');
  expect((await st(page)).bagOpen).toBe(true);
  const bag0 = itemTotal((await st(page)).inventory.slots);
  await reload(page);
  await expectPlayable(page);
  expect(itemTotal((await st(page)).inventory.slots)).toEqual(bag0);

  // Thùng bán mở, chuyển 2 bó rồi F5 ngay.
  await teleportAndSettle(page, SELL_BOX.x, SELL_BOX.y + 1);
  await press(page, 'f');
  expect((await st(page)).shop.window).toBe('sellBox');
  await clickGame(page, await call<XY>(page, 'debugSellSlotCenter', 'bag', 3));
  await clickGame(page, await call<XY>(page, 'debugSellSlotCenter', 'bag', 3));
  let s = await st(page);
  const all0 = itemTotal([...s.inventory.slots, ...s.sellBox.slots]);
  const box0 = s.sellBox.total;
  expect(box0).toBe(20);
  await reload(page);
  await expectPlayable(page);
  s = await st(page);
  expect(itemTotal([...s.inventory.slots, ...s.sellBox.slots])).toEqual(all0);
  expect(s.sellBox.total).toBe(box0);
  expect(s.money.current).toBe(60);

  // Sạp hạt: mua 1 hạt (−4) rồi F5 ngay — tiền và hạt cùng còn.
  await teleportAndSettle(page, STALL.x + 1, STALL.y - 1);
  await press(page, 'f');
  expect((await st(page)).shop.window).toBe('seedStall');
  const seeds0 = itemTotal((await st(page)).inventory.slots)['hat-rau-cai'] ?? 0;
  await clickGame(page, await call<XY>(page, 'debugStallButtonCenter', 0));
  s = await st(page);
  expect(s.money.current).toBe(56);
  await reload(page);
  await expectPlayable(page);
  s = await st(page);
  expect(s.money.current).toBe(56);
  expect(itemTotal(s.inventory.slots)['hat-rau-cai'] ?? 0).toBe(seeds0 + 1);
});

test('Q2c F5 khi Tạm dừng / hộp "Chơi lại?" đang mở: save còn nguyên, không bị xóa', async ({ page }) => {
  await call(page, 'debugSetMoney', 333);
  await call(page, 'debugAdvanceDay');
  await press(page, 'Escape');
  await clickGame(page, await call<XY>(page, 'debugPauseButtonCenter', 'restart'));
  expect((await st(page)).pause.restartConfirmOpen).toBe(true);
  await reload(page);
  const s = await st(page);
  expect(s.save.loadedFromSave).toBe(true);
  expect(s.time.day).toBe(2);
  expect(s.money.current).toBe(333);
  expect(s.pause.restartConfirmOpen).toBe(false);
  await expectPlayable(page);
  // F5 khi Tạm dừng (không hộp).
  await press(page, 'Escape');
  expect((await st(page)).pause.menuOpen).toBe(true);
  await reload(page);
  expect((await st(page)).time.day).toBe(2);
  await expectPlayable(page);
});

test('Q2d F5 lúc hộp "Đi ngủ?" mở và lúc chiều tối dần: không vào chuỗi đêm, trời đúng giờ', async ({ page }) => {
  await call(page, 'debugSetHour', 18.7);
  await teleportAndSettle(page, WAKE.x, WAKE.y);
  await press(page, 'f');
  await waitPhase(page, 'sleepPrompt');
  const s0 = await st(page);
  await reload(page);
  const s = await st(page);
  expect(s.time.day).toBe(1);
  expect(Math.abs(s.time.hour - s0.time.hour)).toBeLessThan(0.05);
  expect(s.time.phase).toBe(s0.time.phase);
  expect(Math.abs(s.sky.alpha - s0.sky.alpha)).toBeLessThan(0.02);
  await expectPlayable(page);
});

async function nightInvariants(page: Page, money0: number, value: number): Promise<GState> {
  const s = await st(page);
  expect(s.money.current + s.sellBox.total).toBe(money0 + value);
  return s;
}
/** Chạy hết chuỗi đêm nếu đang ở giữa (qua tổng kết bằng Enter). */
async function finishNight(page: Page): Promise<void> {
  await waitPhase(page, 'summary', 30_000);
  await page.keyboard.press('Enter');
  await waitFrames(page, 3);
  await page.keyboard.press('Enter');
  await waitPhase(page, 'none', 30_000);
}

test('Q2e F5 lúc đang ngủ gục (nghiêng dần): vào lại bản trước, ngủ gục lại → tiền cộng một lần', async ({ page }) => {
  test.setTimeout(120_000);
  const money0 = (await st(page)).money.current;
  await call(page, 'debugSetSellBoxSlot', 0, 'khoai-lang', 2); // 44
  await call(page, 'debugSetHour', 23.5);
  expect(await call(page, 'debugSaveNow')).not.toBeNull();
  await call(page, 'debugTriggerDayEnd');
  expect((await st(page)).night.phase).toBe('passingOut');
  await reload(page);
  let s = await nightInvariants(page, money0, 44);
  expect(s.time.day).toBe(1);
  expect(s.sellBox.total).toBe(44);
  expect(s.night.overnights).toBe(0);
  // Chơi tiếp → chạm 24h → ngủ gục thật.
  await call(page, 'debugTriggerDayEnd');
  await finishNight(page);
  s = await nightInvariants(page, money0, 44);
  expect(s.time.day).toBe(2);
  expect(s.money.current).toBe(money0 + 44);
  expect(s.stamina.current).toBe(70);
  await reload(page);
  s = await nightInvariants(page, money0, 44);
  expect(s.time.day).toBe(2);
});

test('Q2f F5 lúc đang sáng dần (waking): sáng hôm sau, tiền một lần, không thấy lại tổng kết', async ({ page }) => {
  test.setTimeout(120_000);
  const money0 = (await st(page)).money.current;
  await call(page, 'debugSetSellBoxSlot', 0, 'rau-cai', 3);
  await call(page, 'debugTriggerDayEnd');
  await waitPhase(page, 'summary', 30_000);
  await page.keyboard.press('Enter');
  await waitFrames(page, 2);
  await page.keyboard.press('Enter');
  await waitPhase(page, 'waking');
  await reload(page);
  const s = await nightInvariants(page, money0, 30);
  expect(s.time.day).toBe(2);
  expect(s.money.current).toBe(money0 + 30);
  expect({ x: s.tileX, y: s.tileY }).toEqual(WAKE);
  await expectPlayable(page);
  await shot(page, 'qa-t008-f5-waking.png');
});

test('Q2g F5 lúc thiếp đi (màn tối dần) bằng hộp Đi ngủ: thùng còn, ngủ lại một lần', async ({ page }) => {
  test.setTimeout(120_000);
  const money0 = (await st(page)).money.current;
  await call(page, 'debugSetSellBoxSlot', 0, 'rau-cai', 2);
  await call(page, 'debugSetHour', 20);
  await teleportAndSettle(page, WAKE.x, WAKE.y);
  await press(page, 'f');
  await waitPhase(page, 'sleepPrompt');
  await page.keyboard.press('Enter');
  await waitPhase(page, 'fallingAsleep');
  await reload(page);
  let s = await nightInvariants(page, money0, 20);
  console.log('F5 lúc thiếp đi → ngày', s.time.day, 'thùng', s.sellBox.total);
  await expectPlayable(page);
  if (s.time.day === 1) {
    await press(page, 'f');
    await waitPhase(page, 'sleepPrompt');
    await page.keyboard.press('Enter');
    await finishNight(page);
  }
  s = await nightInvariants(page, money0, 20);
  expect(s.time.day).toBe(2);
  expect(s.money.current).toBe(money0 + 20);
});

// ------------------------------------------------------------------------------------------------ Q3

test('Q3 F5 liên tục 6 lần thật nhanh (có lần chưa kịp nạp xong): không mất / không về Ngày 1', async ({ page }) => {
  test.setTimeout(180_000);
  await call(page, 'debugSetMoney', 250);
  await call(page, 'debugAdvanceDay');
  await call(page, 'debugSetSellBoxSlot', 2, 'khoai-lang', 3);
  await teleportAndSettle(page, 30, 20);
  const before = await st(page);
  for (let i = 0; i < 6; i++) {
    await page.reload({ waitUntil: i % 2 === 0 ? 'commit' : 'domcontentloaded' });
    await page.waitForTimeout(i * 60);
  }
  await waitReady(page);
  const s = await st(page);
  expect(s.save.loadedFromSave).toBe(true);
  expect(s.time.day).toBe(2);
  expect(s.money.current).toBe(250);
  expect(s.sellBox.total).toBe(66);
  expect({ x: s.tileX, y: s.tileY }).toEqual({ x: before.tileX, y: before.tileY });
  await expectPlayable(page);
});

// ------------------------------------------------------------------------------------------------ Q4

type Mut = (s: Record<string, any>) => unknown; // eslint-disable-line @typescript-eslint/no-explicit-any
const BAD: { name: string; raw?: string; mut?: Mut; expect: 'corrupt' | 'ok' }[] = [
  { name: 'chuỗi rỗng', raw: '', expect: 'corrupt' },
  { name: 'JSON là mảng', raw: '[1,2,3]', expect: 'corrupt' },
  { name: 'JSON null', raw: 'null', expect: 'corrupt' },
  { name: 'JSON số', raw: '42', expect: 'corrupt' },
  { name: 'day = 0', mut: (s) => (s.clock.day = 0), expect: 'corrupt' },
  { name: 'tiền âm', mut: (s) => (s.money = -50), expect: 'corrupt' },
  { name: 'version chuỗi', mut: (s) => (s.version = '1'), expect: 'corrupt' },
  { name: 'facing lạ', mut: (s) => (s.player.facing = 'nw'), expect: 'corrupt' },
  { name: 'Sức âm', mut: (s) => (s.stamina.current = -40), expect: 'ok' },
  { name: 'Sức max khác game', mut: (s) => { s.stamina.current = 9999; s.stamina.max = 5; }, expect: 'ok' },
  { name: 'toạ độ trong tường nhà', mut: (s) => { s.player.x = 5 * 64 + 32; s.player.y = 6 * 64 + 32; }, expect: 'ok' },
  { name: 'toạ độ giữa ao', mut: (s) => { s.player.x = 34 * 64 + 32; s.player.y = 9 * 64 + 32; }, expect: 'ok' },
  { name: 'toạ độ trên gốc cây', mut: (s) => { s.player.x = 27 * 64 + 32; s.player.y = 10 * 64 + 32; }, expect: 'ok' },
  { name: 'toạ độ sát tường (hộp chân chạm tường)', mut: (s) => { s.player.x = 6 * 64 + 4; s.player.y = 6 * 64 + 32; }, expect: 'ok' },
  { name: 'toạ độ ngoài bản đồ', mut: (s) => { s.player.x = -500; s.player.y = 99999; }, expect: 'ok' },
  { name: 'crop id lạ', mut: (s) => { s.farm.plots[0].soil = 'tilled'; s.farm.plots[0].tillStrikes = 6; s.farm.plots[0].crop = { cropId: 'cay-tien', age: 1, dryDays: 0, withered: false }; }, expect: 'ok' },
  { name: 'cây trên đất chưa cuốc', mut: (s) => { s.farm.plots[1].soil = 'untilled'; s.farm.plots[1].crop = { cropId: 'rau-cai', age: 1, dryDays: 0, withered: false }; }, expect: 'ok' },
  { name: 'tillStrikes 99 ô chưa cuốc', mut: (s) => { s.farm.plots[2].soil = 'untilled'; s.farm.plots[2].tillStrikes = 99; }, expect: 'ok' },
  { name: 'slot count 999 > stackMax', mut: (s) => (s.inventory.slots[4] = { id: 'khoai-lang', count: 999 }), expect: 'ok' },
  { name: 'món lạ trong gùi + thùng', mut: (s) => { s.inventory.slots[4] = { id: 'vang-thoi', count: 3 }; s.sellBox.slots[0] = { id: 'kim-cuong', count: 2 }; }, expect: 'ok' },
  { name: 'ô chọn 99', mut: (s) => (s.inventory.selected = 99), expect: 'ok' },
  { name: 'gùi 40 ô (dư)', mut: (s) => { s.inventory.slots = Array.from({ length: 40 }, (_, i) => (i % 2 ? { id: 'rau-cai', count: 1 } : null)); }, expect: 'ok' },
  { name: 'giờ quá 24h (elapsed 1e9)', mut: (s) => (s.clock.elapsedSeconds = 1e9), expect: 'ok' },
  { name: 'tiền rất lớn 1e15', mut: (s) => (s.money = 1e15), expect: 'ok' },
  { name: 'tên rỗng', mut: (s) => (s.player.name = '   '), expect: 'ok' },
  { name: 'ô ruộng toạ độ lạ + trùng', mut: (s) => { s.farm.plots.push({ ...s.farm.plots[0], x: 999, y: 999 }); s.farm.plots.unshift({ ...s.farm.plots[0], soil: 'tilled', tillStrikes: 6 }); }, expect: 'ok' },
  { name: 'version 0', mut: (s) => (s.version = 0), expect: 'corrupt' },
  { name: 'savedAt số', mut: (s) => (s.savedAt = 123), expect: 'corrupt' },
];

test('Q4 save hỏng / bị sửa tay nhiều kiểu → không treo, kẹp / đặt lại hợp lý', async ({ page }) => {
  test.setTimeout(600_000);
  const good = (await call<Record<string, unknown>>(page, 'debugSaveNow'))!;
  const results: string[] = [];
  for (const c of BAD) {
    let raw = c.raw;
    if (raw === undefined) {
      const s = JSON.parse(JSON.stringify(good));
      c.mut!(s);
      raw = JSON.stringify(s);
    }
    await call(page, 'debugClearSave');
    await page.evaluate((r) => window.localStorage.setItem('bph-save', r), raw);
    warnings = [];
    await reload(page);
    const s = await st(page);
    results.push(`${c.name}: ${s.save.loadStatus}${s.save.loadReason ? ' (' + s.save.loadReason + ')' : ''} · Ngày ${s.time.day} · ${s.time.clockText} · tiền ${s.money.current} · Sức ${s.stamina.current} · ô ${s.tileX},${s.tileY} · chọn ${s.inventory.selected} · phase ${s.night.phase}`);
    expect(s.save.loadStatus, c.name).toBe(c.expect);
    if (c.expect === 'corrupt') {
      expect(s.time.day).toBe(1);
      expect(warnings.some((w) => w.includes('[save]')), c.name).toBe(true);
    }
    // Không treo: khung hình chạy; nếu đang chuỗi đêm (giờ ≥ 24h) thì cho qua đêm.
    await waitFrames(page, 10);
    if ((await st(page)).night.phase !== 'none') await finishNight(page);
    const n = await st(page);
    expect(n.stamina.current).toBeGreaterThanOrEqual(0);
    expect(n.stamina.current).toBeLessThanOrEqual(100);
    expect(n.inventory.selected).toBeLessThan(9);
    for (const sl of [...n.inventory.slots, ...n.sellBox.slots]) if (sl) expect(sl.count).toBeLessThanOrEqual(20);
    expect(n.inventory.slots.length).toBe(18);
    // Không đứng trong vật cản: đi được 4 hướng ít nhất 1 hướng, và ô đứng không là vật cản (ao/tường/cây).
    const y0 = n.footY;
    const x0 = n.footX;
    await page.keyboard.down('s');
    await waitFrames(page, 15);
    await page.keyboard.up('s');
    await page.keyboard.down('d');
    await waitFrames(page, 15);
    await page.keyboard.up('d');
    const m = await st(page);
    expect(Math.hypot(m.footX - x0, m.footY - y0), `${c.name}: kẹt tại ${x0},${y0}`).toBeGreaterThan(5);
    if (c.name.startsWith('toạ độ')) await shot(page, `qa-t008-bad-${c.name.split(' ').slice(0, 3).join('-').normalize('NFD').replace(/[^\w-]/g, '')}.png`);
  }
  console.log(results.join('\n'));
});

// ------------------------------------------------------------------------------------------------ Q5

async function soundCount(page: Page): Promise<number> {
  return page.evaluate(() => (window as unknown as { __game: GameHook }).__game.sound.sounds.filter((s) => s.key === 'music-vuon' && s.isPlaying).length);
}
async function restartViaMenu(page: Page): Promise<void> {
  await press(page, 'Escape');
  await clickGame(page, await call<XY>(page, 'debugPauseButtonCenter', 'restart'));
  expect((await st(page)).pause.restartConfirmOpen).toBe(true);
  // Enter KHÔNG được xóa.
  await press(page, 'Enter');
  expect((await st(page)).pause.restartConfirmOpen).toBe(true);
  expect(await call(page, 'debugReadSave')).not.toBeNull();
  await clickGame(page, await call<XY>(page, 'debugPauseButtonCenter', 'confirmYes'));
  await expect
    .poll(async () => {
      const s = await state(page);
      return s !== null && !s.save.suppressed && !s.pause.menuOpen && s.save.loadStatus === 'none';
    }, { timeout: 15_000 })
    .toBe(true);
  await waitFrames(page, 5);
}

test('Q5 Chơi lại từ đầu 3 lần liền: Ngày 1 sạch, G / F9 / phím số một lần = một tác dụng, nhạc không phát đôi', async ({ page }) => {
  test.setTimeout(240_000);
  // Mở khoá âm thanh bằng một click.
  await clickGame(page, { x: 960, y: 540 });
  await expect.poll(() => soundCount(page), { timeout: 10_000 }).toBe(1);
  for (let round = 1; round <= 3; round++) {
    // Có tiến độ để chơi lại có cái mà xóa.
    await call(page, 'debugSetMoney', 500 + round);
    await call(page, 'debugAdvanceDay');
    await call(page, 'debugSetSlot', 6, 'khoai-lang', 9);
    await teleportAndSettle(page, 25, 20);
    await restartViaMenu(page);
    let s = await st(page);
    expect(s.time.day).toBe(1);
    expect(s.money.current).toBe(60);
    expect(s.farm.tilled).toBe(0);
    expect(s.inventory.slots[6]).toBeNull();
    expect(s.sellBox.total).toBe(0);
    expect(s.stamina.current).toBe(100);
    expect(Math.abs(s.footX - SPAWN_FOOT.x)).toBeLessThan(2);
    expect(s.pause.savedText).toBe('Chưa lưu lần nào');
    expect(s.night.overnights).toBe(0);
    expect(await call(page, 'debugReadSave')).toBeNull();
    expect(await soundCount(page), `vòng ${round}: số bản nhạc đang phát`).toBe(1);
    // G một lần = đúng một ngày.
    await press(page, 'g');
    s = await st(page);
    expect(s.time.day, `vòng ${round}: G`).toBe(2);
    // F9 một lần = +1 giờ.
    const h0 = s.time.hour;
    await press(page, 'F9');
    s = await st(page);
    expect(s.time.hour - h0, `vòng ${round}: F9`).toBeGreaterThan(0.9);
    expect(s.time.hour - h0, `vòng ${round}: F9`).toBeLessThan(1.2);
    // Phím số: một lần bấm.
    await press(page, '4');
    expect((await st(page)).inventory.selected).toBe(3);
    // Esc mở Tạm dừng đúng một lần.
    await press(page, 'Escape');
    s = await st(page);
    expect(s.pause.opens).toBe(1);
    await press(page, 'Escape');
    expect((await st(page)).pause.menuOpen).toBe(false);
  }
  // F5 sau 3 lần chơi lại: nạp đúng tiến độ mới (Ngày 2 do G).
  await reload(page);
  const s = await st(page);
  expect(s.time.day).toBe(2);
  expect(s.money.current).toBe(60);
});

// ------------------------------------------------------------------------------------------------ Q6

test('Q6 "Đã lưu lúc" cập nhật đúng; sau F5 hiện giờ của bản đã nạp; tự lưu không chạy lúc Tạm dừng / hộp ngủ', async ({ page }) => {
  test.setTimeout(120_000);
  expect((await st(page)).pause.savedText).toBe('Chưa lưu lần nào');
  await call(page, 'debugSetHour', 9);
  await press(page, 'Escape');
  let s = await st(page);
  expect(s.hud.pauseSavedText).toBe(`Đã lưu lúc ${s.time.clockText} · Ngày 1`);
  expect(s.time.clockText).toBe('09:00');
  // Tự lưu không chạy lúc Tạm dừng.
  await call(page, 'debugSetAutoSaveInterval', 0.3);
  const c0 = s.save.saveCount;
  await waitFrames(page, 60);
  expect((await st(page)).save.saveCount).toBe(c0);
  await press(page, 'Escape');
  // Chạy → tự lưu ghi, dòng đổi theo giờ.
  await call(page, 'debugSetHour', 14.5);
  await expect.poll(async () => (await st(page)).save.lastSaveAt?.hour ?? 0, { timeout: 10_000 }).toBeGreaterThanOrEqual(14.5);
  s = await st(page);
  expect(s.pause.savedText).toMatch(/^Đã lưu lúc 14:3\d · Ngày 1$/);
  // Hộp hỏi ngủ: tự lưu không chạy (đồng hồ dừng) — chỉ ghi nhận.
  await call(page, 'debugSetHour', 19);
  await teleportAndSettle(page, WAKE.x, WAKE.y);
  await press(page, 'f');
  await waitPhase(page, 'sleepPrompt');
  const c1 = (await st(page)).save.saveCount;
  await waitFrames(page, 60);
  console.log('tự lưu trong lúc hộp Đi ngủ? mở:', (await st(page)).save.saveCount - c1, 'lần');
  await press(page, 'Escape');
  await waitPhase(page, 'none');
  // Gùi mở: tự lưu có chạy không (chỉ ghi nhận — D-025 không cấm).
  await press(page, 'e');
  const c2 = (await st(page)).save.saveCount;
  await waitFrames(page, 60);
  console.log('tự lưu trong lúc gùi mở:', (await st(page)).save.saveCount - c2, 'lần');
  await press(page, 'e');
  // F5 → dòng "Đã lưu lúc" = giờ của bản đã nạp (trước khi lưu lần mới).
  await call(page, 'debugSetAutoSaveInterval', 30);
  await call(page, 'debugSetHour', 20.25);
  const hBefore = (await st(page)).time.clockText;
  await reload(page);
  s = await st(page);
  expect(s.save.lastSaveAt.reason).toBe('loaded');
  console.log('sau F5 savedText', s.pause.savedText, 'giờ trước F5', hBefore);
  expect(s.pause.savedText).toBe(`Đã lưu lúc ${hBefore} · Ngày 1`);
});

// ------------------------------------------------------------------------------------------------ Q7

async function freshWithInit(context: BrowserContext, init: () => void): Promise<Page> {
  await context.addInitScript(init);
  const p = await context.newPage();
  watch(p);
  await p.goto('/');
  await waitReady(p);
  return p;
}

test('Q7a localStorage đầy (setItem ném QuotaExceededError) → game chạy, không console error, "Chưa lưu"', async ({ page, context }) => {
  await call(page, 'debugClearSave');
  await page.close();
  const p = await freshWithInit(context, () => {
    Storage.prototype.setItem = function () {
      throw new DOMException('quota', 'QuotaExceededError');
    };
  });
  await call(p, 'debugSetAutoSaveInterval', 0.3);
  await waitFrames(p, 60);
  await press(p, 'Escape');
  const s = await st(p);
  expect(s.save.saveCount).toBe(0);
  expect(s.hud.pauseSavedText).toBe('Chưa lưu lần nào');
  await press(p, 'Escape');
  const y0 = s.footY;
  await p.keyboard.down('s');
  await expect.poll(async () => (await st(p)).footY, { timeout: 10_000 }).toBeGreaterThan(y0 + 20);
  await p.keyboard.up('s');
  expect(warnings.some((w) => w.includes('[save] Không ghi được'))).toBe(true);
  console.log('số cảnh báo save khi kho đầy:', warnings.filter((w) => w.includes('[save]')).length);
  await shot(p, 'qa-t008-storage-full.png');
  await p.reload();
  await waitReady(p);
  expect((await st(p)).time.day).toBe(1);
});

test('Q7b localStorage bị chặn hẳn (truy cập ném SecurityError) → game chạy, không console error', async ({ page, context }) => {
  await call(page, 'debugClearSave');
  await page.close();
  const p = await freshWithInit(context, () => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() {
        throw new DOMException('denied', 'SecurityError');
      },
    });
  });
  const s = await st(p);
  expect(s.save.loadStatus).toBe('none');
  await press(p, 'Escape');
  await press(p, 'Escape');
  await p.keyboard.down('d');
  await expect.poll(async () => (await st(p)).footX, { timeout: 10_000 }).toBeGreaterThan(s.footX + 20);
  await p.keyboard.up('d');
  await p.reload();
  await waitReady(p);
});

test('Q7c getItem ném lỗi lúc mở game → Ngày 1, cảnh báo, chơi được', async ({ page, context }) => {
  await call(page, 'debugClearSave');
  await page.close();
  const p = await freshWithInit(context, () => {
    Storage.prototype.getItem = function () {
      throw new Error('blocked read');
    };
  });
  const s = await st(p);
  expect(s.save.loadStatus).toBe('none');
  expect(s.time.day).toBe(1);
  await expectPlayable(p);
});

// ------------------------------------------------------------------------------------------------ 1366×768

test('Q8 1366×768: cửa sổ Tạm dừng có dòng "Đã lưu lúc" + nút Chơi lại, hộp xác nhận đọc được', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await waitFrames(page, 10);
  await call(page, 'debugSetHour', 14.5);
  await press(page, 'Escape');
  await shot(page, 'qa-t008-pause-1366.png');
  await clickGame(page, await call<XY>(page, 'debugPauseButtonCenter', 'restart'));
  expect((await st(page)).hud.restartConfirmVisible).toBe(true);
  await shot(page, 'qa-t008-confirm-1366.png');
  await press(page, 'Escape');
  expect((await st(page)).pause.restartConfirmOpen).toBe(false);
  expect((await st(page)).pause.menuOpen).toBe(true);
});

// ------------------------------------------------------------------------------------------------ Q9 (ghi nhận)

test('Q9 hai tab cùng mở (ghi nhận, ngoài điều kiện T-008): tab cũ đóng sau ghi đè tiến độ tab mới', async ({ page, context }) => {
  test.setTimeout(120_000);
  await call(page, 'debugSaveNow'); // Ngày 1, 60 quan
  const b = await context.newPage(); // tab B mở cùng save (Ngày 1)
  watch(b);
  await b.goto('/');
  await waitReady(b);
  // Chơi tiếp ở tab A: sang Ngày 3, 500 quan, rồi đóng tab A (tự lưu lúc đóng).
  await page.bringToFront();
  await call(page, 'debugSetMoney', 500);
  await call(page, 'debugAdvanceDay');
  await call(page, 'debugAdvanceDay');
  console.log('A trước khi đóng: count', (await st(page)).save.saveCount, JSON.stringify((await st(page)).save.lastSaveAt), 'B', JSON.stringify((await st(b)).save.lastSaveAt));
  await page.close({ runBeforeUnload: true });
  const mid = await b.evaluate(() => JSON.parse(localStorage.getItem('bph-save') ?? 'null'));
  console.log('sau khi đóng tab A: save = Ngày', mid?.clock?.day, mid?.money, 'quan', 'B lastSave', JSON.stringify((await st(b)).save.lastSaveAt), 'B count', (await st(b)).save.saveCount);
  // Đóng tab B (bị bỏ quên, vẫn Ngày 1).
  await b.close({ runBeforeUnload: true });
  const c = await context.newPage();
  watch(c);
  await c.goto('/');
  await waitReady(c);
  const s = await st(c);
  console.log('mở lại sau khi đóng cả hai: Ngày', s.time.day, s.money.current, 'quan');
});

test('Q10 đóng tab (không F5) vẫn lưu: đổi tiền rồi đóng tab, mở tab mới cùng context', async ({ page, context }) => {
  await call(page, 'debugSetMoney', 432);
  await call(page, 'debugAdvanceDay');
  const before = (await st(page)).save.saveCount;
  console.log('saveCount trước khi đóng', before, 'lastSave', JSON.stringify((await st(page)).save.lastSaveAt));
  await page.close({ runBeforeUnload: true });
  const p = await context.newPage();
  watch(p);
  await p.goto('/');
  await waitReady(p);
  const s = await st(p);
  console.log('tab mới: Ngày', s.time.day, s.money.current, 'quan', s.save.loadStatus);
  expect(s.money.current).toBe(432);
  expect(s.time.day).toBe(2);
});
