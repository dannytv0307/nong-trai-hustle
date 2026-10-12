// QA độc lập T-006 — ca rìa thùng bán / tiền / sạp hạt (không tin báo cáo game-dev).
// Đọc trạng thái qua window.__game.scene.getScene('Garden').debugState; chờ theo trạng thái (BUG-006).
/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCREENSHOT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'screenshots');
const SELL_BOX = { x: 17, y: 11 };
const STALL = { x: 13, y: 26, w: 3, h: 2 };

interface XY {
  x: number;
  y: number;
}
type Slot = { id: string; count: number } | null;

async function state(page: Page): Promise<any> {
  return page.evaluate(() => {
    const g = (window as any).__game;
    if (!g || !(g.scene.isActive('Garden') || g.scene.isPaused('Garden'))) return null;
    const s = g.scene.getScene('Garden').debugState;
    return s?.gardenReady && s.hud ? s : null;
  });
}
const st = async (page: Page): Promise<any> => (await state(page))!;
async function call<T = any>(page: Page, method: string, ...args: unknown[]): Promise<T> {
  return page.evaluate(
    ([m, a]) => {
      const sc = (window as any).__game.scene.getScene('Garden');
      return sc[m as string](...(a as unknown[]));
    },
    [method, args] as const,
  ) as Promise<T>;
}
async function waitFrames(page: Page, n: number): Promise<void> {
  const start = await page.evaluate(() => (window as any).__game.loop.frame);
  await page.waitForFunction((t) => (window as any).__game.loop.frame >= t, start + n, { timeout: 30_000 });
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
async function clickGame(page: Page, g: XY, shift = false, settle = 3): Promise<void> {
  const p = await gameToPage(page, g);
  await page.mouse.move(p.x, p.y);
  await waitFrames(page, 2);
  if (shift) await page.keyboard.down('Shift');
  await page.mouse.down();
  await page.mouse.up();
  if (shift) await page.keyboard.up('Shift');
  await waitFrames(page, settle);
}
async function clickTile(page: Page, tx: number, ty: number): Promise<void> {
  await clickGame(page, await call<XY>(page, 'debugTileToScreen', tx, ty));
}
const clickSell = async (page: Page, side: 'bag' | 'box', i: number, shift = false) =>
  clickGame(page, await call<XY>(page, 'debugSellSlotCenter', side, i), shift);
const clickStall = async (page: Page, i: number, shift = false) => clickGame(page, await call<XY>(page, 'debugStallButtonCenter', i), shift);
async function press(page: Page, key: string): Promise<void> {
  await page.keyboard.press(key);
  await waitFrames(page, 3);
}
async function shot(page: Page, name: string): Promise<void> {
  await page.evaluate(() => {
    const g = (window as any).__game;
    for (const k of ['Garden', 'GardenHud']) g.scene.pause(k);
  });
  await page.screenshot({ path: join(SCREENSHOT_DIR, name) });
  await page.evaluate(() => {
    const g = (window as any).__game;
    for (const k of ['Garden', 'GardenHud']) g.scene.resume(k);
  });
}
const count = (slots: Slot[], id: string) => slots.reduce((n, s) => n + (s && s.id === id ? s.count : 0), 0);
async function clearBag(page: Page): Promise<void> {
  for (let i = 0; i < 18; i++) await call(page, 'debugSetSlot', i, null, 0);
}
async function openSellBox(page: Page): Promise<void> {
  await teleportAndSettle(page, SELL_BOX.x, SELL_BOX.y + 1);
  await press(page, 'f');
  expect((await st(page)).shop.window).toBe('sellBox');
}
async function openStall(page: Page): Promise<void> {
  await teleportAndSettle(page, STALL.x + 1, STALL.y - 1);
  await press(page, 'f');
  expect((await st(page)).shop.window).toBe('seedStall');
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

test('Q1 tiền: mua đúng bằng giá → 0; spam click khi gần hết tiền không âm; Shift chỉ mua phần đủ tiền', async ({ page }) => {
  test.setTimeout(120_000);
  await openStall(page);
  // Đúng bằng giá: 8 quan, mua khoai 8 → 0.
  await call(page, 'debugSetMoney', 8);
  await waitFrames(page, 3);
  await clickStall(page, 1);
  let s = await st(page);
  expect(s.money.current).toBe(0);
  expect(s.hud.moneyText).toBe('0 quan');
  expect(s.hud.stallButtons.every((b: any) => !b.enabled)).toBe(true);
  // Spam: 13 quan, click cải 10 lần thật nhanh (không chờ frame giữa các lần).
  await call(page, 'debugSetMoney', 13);
  await waitFrames(page, 3);
  const seeds0 = count(s.inventory.slots, 'hat-rau-cai');
  const p = await gameToPage(page, await call<XY>(page, 'debugStallButtonCenter', 0));
  await page.mouse.move(p.x, p.y);
  for (let i = 0; i < 10; i++) {
    await page.mouse.down();
    await page.mouse.up();
  }
  await waitFrames(page, 10);
  for (let i = 0; i < 5; i++) {
    await page.mouse.down();
    await page.mouse.up();
    await waitFrames(page, 1);
  }
  await waitFrames(page, 5);
  s = await st(page);
  expect(s.money.current).toBe(1);
  expect(s.money.current).toBeGreaterThanOrEqual(0);
  expect(count(s.inventory.slots, 'hat-rau-cai')).toBe(seeds0 + 3);
  expect(s.hud.moneyText).toBe('1 quan');
  // Shift+click khoai với 20 quan → 2 hạt (16), còn 4.
  await call(page, 'debugSetMoney', 20);
  await waitFrames(page, 3);
  await clickStall(page, 1, true);
  s = await st(page);
  expect(s.money.current).toBe(4);
  expect(s.money.purchases.at(-1)).toEqual({ cropId: 'khoai-lang', count: 2, cost: 16 });
  // Tiền lạ qua hook: âm → 0, số lẻ → làm tròn xuống.
  expect(await call(page, 'debugSetMoney', -50)).toBe(0);
  expect(await call(page, 'debugSetMoney', 7.9)).toBe(7);
  await waitFrames(page, 3);
  expect((await st(page)).hud.moneyText).toBe('7 quan');
  // Tổng tiền chi = tổng cost các lần mua.
  s = await st(page);
  const spent = s.money.purchases.reduce((n: number, x: any) => n + x.cost, 0);
  expect(spent).toBe(8 + 12 + 16);
  // Tiếng xu có key và audio đã nạp.
  expect(s.money.lastCoinSfx).toMatch(/^sfx-nhat-xu-[12]$/);
  const loaded = await page.evaluate((k) => (window as any).__game.cache.audio.exists(k), s.money.lastCoinSfx);
  expect(loaded).toBe(true);
});

test('Q2 bảo toàn đồ: 60 lần chuyển ngẫu nhiên gùi ⇄ thùng, tổng món + tổng tiền luôn đúng', async ({ page }) => {
  test.setTimeout(240_000);
  await clearBag(page);
  await call(page, 'debugSetSlot', 3, 'rau-cai', 7);
  await call(page, 'debugSetSlot', 4, 'khoai-lang', 5);
  await call(page, 'debugSetSlot', 10, 'rau-cai', 20);
  await call(page, 'debugSetSlot', 12, 'khoai-lang', 13);
  await call(page, 'debugSetSlot', 0, 'hat-rau-cai', 9);
  await openSellBox(page);
  const TOTAL_CAI = 27;
  const TOTAL_KHOAI = 18;
  let seed = 12345;
  const rnd = () => {
    seed = (seed * 1103515245 + 12345) % 2 ** 31;
    return seed / 2 ** 31;
  };
  for (let k = 0; k < 60; k++) {
    const s0 = await st(page);
    const side = rnd() < 0.5 ? 'bag' : 'box';
    const slots: Slot[] = side === 'bag' ? s0.inventory.slots : s0.sellBox.slots;
    const filled = slots.map((x, i) => (x && x.id !== 'hat-rau-cai' ? i : -1)).filter((i) => i >= 0);
    if (filled.length === 0) continue;
    const idx = filled[Math.floor(rnd() * filled.length)];
    await clickSell(page, side, idx, rnd() < 0.35);
    const s = await st(page);
    const cai = count(s.inventory.slots, 'rau-cai') + count(s.sellBox.slots, 'rau-cai');
    const khoai = count(s.inventory.slots, 'khoai-lang') + count(s.sellBox.slots, 'khoai-lang');
    expect(cai, `bước ${k}`).toBe(TOTAL_CAI);
    expect(khoai, `bước ${k}`).toBe(TOTAL_KHOAI);
    const expected = 10 * count(s.sellBox.slots, 'rau-cai') + 22 * count(s.sellBox.slots, 'khoai-lang');
    expect(s.sellBox.total).toBe(expected);
    expect(s.hud.sellTotalText).toBe(`Cuối ngày bán được: ${expected} quan`);
    expect(count(s.inventory.slots, 'hat-rau-cai')).toBe(9);
    expect(count(s.sellBox.slots, 'hat-rau-cai')).toBe(0);
    for (const x of [...s.inventory.slots, ...s.sellBox.slots]) if (x) expect(x.count).toBeGreaterThan(0), expect(x.count).toBeLessThanOrEqual(20);
  }
  // Bỏ hết vào thùng: 27×10 + 18×22 = 666.
  for (let pass = 0; pass < 3; pass++) {
    const s = await st(page);
    for (let i = 0; i < 18; i++) if (s.inventory.slots[i] && s.inventory.slots[i].id !== 'hat-rau-cai') await clickSell(page, 'bag', i, true);
  }
  let s = await st(page);
  expect(s.sellBox.total).toBe(666);
  expect(s.money.current).toBe(60);
  await shot(page, 'qa-t006-thung-666.png');
  // Hạt khoai cũng không bỏ được.
  await call(page, 'debugSetSlot', 5, 'hat-khoai-lang', 3);
  await waitFrames(page, 3);
  await clickSell(page, 'bag', 5, true);
  s = await st(page);
  expect(count(s.sellBox.slots, 'hat-khoai-lang')).toBe(0);
  expect(s.hud.shopStatusText).toBe('Hạt giống không bán được');
  // Đóng thùng, qua đêm bằng G: tiền KHÔNG cộng (T-007 mới nối) — thùng còn nguyên.
  await press(page, 'Escape');
  await press(page, 'g');
  s = await st(page);
  expect(s.money.current).toBe(60);
  expect(s.sellBox.total).toBe(666);
});

test('Q3 thùng đầy / gùi đầy: chuyển một phần, phần dư ở lại, không mất', async ({ page }) => {
  test.setTimeout(120_000);
  await clearBag(page);
  for (let i = 0; i < 17; i++) await call(page, 'debugSetSellBoxSlot', i, 'khoai-lang', 20);
  await call(page, 'debugSetSellBoxSlot', 17, 'rau-cai', 19);
  await call(page, 'debugSetSlot', 3, 'rau-cai', 5);
  await call(page, 'debugSetSlot', 4, 'khoai-lang', 2);
  await openSellBox(page);
  await clickSell(page, 'bag', 3, true); // chỉ còn chỗ 1 bó
  let s = await st(page);
  expect(s.sellBox.slots[17]).toMatchObject({ id: 'rau-cai', count: 20 });
  expect(s.inventory.slots[3]).toMatchObject({ id: 'rau-cai', count: 4 });
  await clickSell(page, 'bag', 3);
  s = await st(page);
  expect(s.inventory.slots[3]).toMatchObject({ id: 'rau-cai', count: 4 });
  expect(s.hud.shopStatusText).toBe('Thùng đầy rồi!');
  await clickSell(page, 'bag', 4, true);
  s = await st(page);
  expect(s.inventory.slots[4]).toMatchObject({ id: 'khoai-lang', count: 2 });
  await shot(page, 'qa-t006-thung-day.png');
  // Gùi: 17 ô đầy khoai, ô 3 = cải 18 → lấy lại Shift cả chồng cải 20 → chỉ 2.
  for (let i = 0; i < 18; i++) await call(page, 'debugSetSlot', i, 'khoai-lang', 20);
  await call(page, 'debugSetSlot', 3, 'rau-cai', 18);
  await waitFrames(page, 3);
  await clickSell(page, 'box', 17, true);
  s = await st(page);
  expect(s.inventory.slots[3]).toMatchObject({ id: 'rau-cai', count: 20 });
  expect(s.sellBox.slots[17]).toMatchObject({ id: 'rau-cai', count: 18 });
  await clickSell(page, 'box', 0);
  s = await st(page);
  expect(s.sellBox.slots[0]).toMatchObject({ id: 'khoai-lang', count: 20 });
  expect(s.hud.shopStatusText).toBe('Gùi đầy rồi!');
});

test('Q4 mua khi gùi còn đúng 1 chỗ / chồng gần đầy với Shift+click mua 5', async ({ page }) => {
  test.setTimeout(120_000);
  for (let i = 0; i < 18; i++) await call(page, 'debugSetSlot', i, 'khoai-lang', 20);
  await call(page, 'debugSetSlot', 7, null, 0);
  await openStall(page);
  await clickStall(page, 0, true);
  let s = await st(page);
  expect(s.inventory.slots[7]).toMatchObject({ id: 'hat-rau-cai', count: 5 });
  expect(s.money.current).toBe(40);
  // Chồng hạt cải còn 2 chỗ (18) → Shift mua 5 chỉ được 2, trừ 8.
  await call(page, 'debugSetSlot', 7, 'hat-rau-cai', 18);
  await waitFrames(page, 3);
  await clickStall(page, 0, true);
  s = await st(page);
  expect(s.inventory.slots[7]).toMatchObject({ id: 'hat-rau-cai', count: 20 });
  expect(s.money.current).toBe(32);
  expect(s.money.purchases.at(-1)).toEqual({ cropId: 'rau-cai', count: 2, cost: 8 });
  // Đầy hẳn: hạt khoai không có chỗ → không trừ tiền.
  await clickStall(page, 1, true);
  s = await st(page);
  expect(s.money.current).toBe(32);
  expect(s.hud.shopStatusText).toBe('Gùi đầy rồi!');
});

test('Q5 F khi đứng cạnh thùng + ô ruộng, đang cuốc dở: mở thùng → cuốc + đồng hồ + nhân vật đứng yên → đóng thì cuốc tiếp', async ({ page }) => {
  test.setTimeout(120_000);
  await teleportAndSettle(page, 16, 12);
  let s = await st(page);
  expect(s.shop.nearby).toBe('sellBox');
  const plot = s.farm.plots.find((p: any) => p.x === 15 && p.y === 13);
  expect(plot.soil).not.toBe('tilled');
  await clickTile(page, 15, 13);
  await expect.poll(async () => (await st(page)).action.strikesDone, { timeout: 15_000 }).toBeGreaterThanOrEqual(2);
  await press(page, 'f');
  s = await st(page);
  expect(s.shop.window).toBe('sellBox');
  const a0 = JSON.stringify([s.action.strikesDone, s.farm.plots.find((p: any) => p.x === 15 && p.y === 13).tillStrikes]);
  const t0 = s.time.elapsedSeconds;
  const f0 = [s.footX, s.footY];
  const stam0 = s.stamina.current;
  await page.keyboard.down('a');
  await page.waitForTimeout(2500);
  await page.keyboard.up('a');
  s = await st(page);
  expect(JSON.stringify([s.action.strikesDone, s.farm.plots.find((p: any) => p.x === 15 && p.y === 13).tillStrikes])).toBe(a0);
  expect(s.time.elapsedSeconds).toBe(t0);
  expect([s.footX, s.footY]).toEqual(f0);
  expect(s.stamina.current).toBe(stam0);
  await shot(page, 'qa-t006-cuoc-do-mo-thung.png');
  await press(page, 'f');
  s = await st(page);
  expect(s.shop.window).toBeNull();
  // Cuốc tiếp tới xong ô (không bị WASD lúc nãy hủy).
  await expect
    .poll(async () => (await st(page)).farm.plots.find((p: any) => p.x === 15 && p.y === 13).soil, { timeout: 20_000 })
    .toBe('tilled');
});

test('Q6 F khi đang đuối vẫn mở; phím tắt G/F8/F9/E/Tab/chuột phải bị chặn khi cửa sổ mở', async ({ page }) => {
  test.setTimeout(120_000);
  await call(page, 'debugSetStamina', 0);
  await waitFrames(page, 5);
  expect((await st(page)).stamina.exhausted).toBe(true);
  await call(page, 'debugSetStamina', 50);
  await call(page, 'debugSetSlot', 2, 'khoai-lang', 3);
  await press(page, '3');
  await call(page, 'debugSetStamina', 0);
  await openSellBox(page);
  await call(page, 'debugSetStamina', 50);
  await waitFrames(page, 3);
  let s = await st(page);
  const before = { day: s.time.day, hour: s.time.hour, stam: s.stamina.current, khoai: count(s.inventory.slots, 'khoai-lang'), nights: s.farmJuice.nights };
  for (const k of ['g', 'F8', 'F9', 'e', 'Tab']) await press(page, k);
  const c = await gameToPage(page, { x: 1700, y: 900 });
  await page.mouse.move(c.x, c.y);
  await page.mouse.click(c.x, c.y, { button: 'right' });
  await waitFrames(page, 5);
  s = await st(page);
  expect(s.shop.window).toBe('sellBox');
  expect(s.bagOpen).toBe(false);
  expect({ day: s.time.day, hour: s.time.hour, stam: s.stamina.current, khoai: count(s.inventory.slots, 'khoai-lang'), nights: s.farmJuice.nights }).toEqual(before);
  // Đóng → chuột phải lần trước không "lọt" sang ăn sau khi đóng.
  await press(page, 'Escape');
  await waitFrames(page, 5);
  s = await st(page);
  expect(s.stamina.current).toBe(50);
  expect(count(s.inventory.slots, 'khoai-lang')).toBe(3);
});

test('Q7 Tạm dừng chồng lên sạp hạt: click vào nút mua lúc Tạm dừng không mua; Esc đóng Tạm dừng rồi Esc đóng sạp; click ngoài đóng không xuống ruộng', async ({ page }) => {
  test.setTimeout(120_000);
  await openStall(page);
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await waitFrames(page, 3);
  let s = await st(page);
  expect(s.pause.menuOpen).toBe(true);
  await shot(page, 'qa-t006-tamdung-tren-sap.png');
  await clickStall(page, 0);
  s = await st(page);
  expect(s.money.current).toBe(60);
  await press(page, 'Escape');
  s = await st(page);
  expect(s.pause.menuOpen).toBe(false);
  expect(s.shop.window).toBe('seedStall');
  await press(page, 'Escape');
  expect((await st(page)).shop.window).toBeNull();

  // Mở thùng từ (16,12), click ra ngoài khung ngay trên ô ruộng → đóng, không cuốc.
  await teleportAndSettle(page, 16, 12);
  await press(page, 'f');
  s = await st(page);
  expect(s.shop.window).toBe('sellBox');
  const tilled0 = s.farm.tilled;
  // Góc dưới-trái màn (ngoài khung) — rất có thể là cỏ/ruộng; dù là gì cũng không được làm việc.
  await clickGame(page, { x: 40, y: 1040 });
  s = await st(page);
  expect(s.shop.window).toBeNull();
  await waitFrames(page, 20);
  s = await st(page);
  expect(s.action.busy).toBe(false);
  expect(s.farm.tilled).toBe(tilled0);
});

test('Q8 va chạm + lối đi: thùng/sạp chặn, lối dọc tường đông nhà (cột 16), lối đất (cột 10–11) tới cuối, cửa nhà', async ({ page }) => {
  test.setTimeout(120_000);
  // Lối dọc tường đông: từ (16,5) đi xuống qua cạnh thùng tới hàng 14.
  await teleportAndSettle(page, 16, 5);
  await page.keyboard.down('s');
  await expect.poll(async () => (await st(page)).tileY, { timeout: 15_000 }).toBeGreaterThanOrEqual(14);
  await page.keyboard.up('s');
  expect((await st(page)).tileX).toBe(16);
  // Đi lên ngược lại.
  await page.keyboard.down('w');
  await expect.poll(async () => (await st(page)).tileY, { timeout: 15_000 }).toBeLessThanOrEqual(5);
  await page.keyboard.up('w');
  // Thùng chặn từ bên trái (đi sang phải ở hàng 11).
  await teleportAndSettle(page, 16, 11);
  await page.keyboard.down('d');
  await waitFrames(page, 40);
  await page.keyboard.up('d');
  let s = await st(page);
  expect(s.footX).toBeLessThanOrEqual(17 * 64);
  // Sạp chặn từ trên xuống.
  await teleportAndSettle(page, 14, 24);
  await page.keyboard.down('s');
  await waitFrames(page, 60);
  await page.keyboard.up('s');
  s = await st(page);
  expect(s.footY).toBeLessThanOrEqual(26 * 64);
  // Lối đất cột 10 từ cửa (10,11) xuống tới hàng 30.
  await teleportAndSettle(page, 10, 12);
  await page.keyboard.down('s');
  await expect.poll(async () => (await st(page)).tileY, { timeout: 20_000 }).toBeGreaterThanOrEqual(30);
  await page.keyboard.up('s');
  // Vào cửa nhà: từ (11,13) đi lên tới hàng 9 (trong nhà).
  await teleportAndSettle(page, 11, 13);
  await page.keyboard.down('w');
  await expect.poll(async () => (await st(page)).tileY, { timeout: 15_000 }).toBeLessThanOrEqual(9);
  await page.keyboard.up('w');
  // Ô ruộng quanh: đứng (16,13) cạnh ruộng, đi trái vào ruộng được (ruộng không bị chặn).
  await teleportAndSettle(page, 16, 14);
  await page.keyboard.down('a');
  await expect.poll(async () => (await st(page)).tileX, { timeout: 15_000 }).toBeLessThanOrEqual(13);
  await page.keyboard.up('a');
  await teleportAndSettle(page, 15, 25);
  await shot(page, 'qa-t006-sap-canh.png');
  await teleportAndSettle(page, 16, 12);
  await shot(page, 'qa-t006-thung-canh.png');
});

test('Q9 HUD tiền: số lớn, 1366×768 và 1920×1080, cửa sổ ở 1366', async ({ page }) => {
  test.setTimeout(120_000);
  await call(page, 'debugSetMoney', 999999);
  await waitFrames(page, 5);
  await shot(page, 'qa-t006-tien-lon-1920.png');
  const r = (await st(page)).hud.hudRects;
  const tb = await page.evaluate(() => {
    const h = (window as any).__game.scene.getScene('GardenHud');
    const t = h.moneyText;
    return { x: t.x, w: t.width, right: t.x + t.width * (1 - t.originX) };
  });
  expect(tb.right, 'chữ tiền 999999 tràn khỏi khung').toBeLessThanOrEqual(r.money.x + r.money.w);
  await call(page, 'debugSetMoney', 60);
  await page.setViewportSize({ width: 1366, height: 768 });
  await waitFrames(page, 10);
  await shot(page, 'qa-t006-hud-1366.png');
  await openStall(page);
  await shot(page, 'qa-t006-sap-1366.png');
  await press(page, 'Escape');
  await call(page, 'debugSetSlot', 3, 'rau-cai', 7);
  await call(page, 'debugSetSlot', 4, 'khoai-lang', 3);
  await openSellBox(page);
  await clickSell(page, 'bag', 4);
  const bp = await gameToPage(page, await call<XY>(page, 'debugSellSlotCenter', 'box', 0));
  await page.mouse.move(bp.x, bp.y);
  await waitFrames(page, 5);
  expect((await st(page)).hud.shopMinFontPx).toBeGreaterThanOrEqual(24);
  await shot(page, 'qa-t006-thung-1366.png');
});
