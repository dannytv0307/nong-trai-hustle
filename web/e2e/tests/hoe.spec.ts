// T-009 (D-026) — Cái cuốc là món trong hotbar, phải CHỌN cuốc mới cuốc được; hoạt ảnh cuốc thật 4 khung (ART-CHR-007)
// với khung 2 "chạm đất" trùng đúng lúc chạm (ô +1 nhát, bụi, tiếng "bộp"); save cũ chưa có cuốc → tự thêm vào ô trống.
// Đọc trạng thái qua window.__game.scene.getScene('Garden').debugState. Chờ theo trạng thái / frame (BUG-006).
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
interface S {
  gardenReady: boolean;
  footX: number;
  footY: number;
  facing: string;
  textureKey: string;
  hoeFrame: number;
  heroOriginY: number;
  farm: { plots: { x: number; y: number; soil: string; tillStrikes: number }[]; tilled: number };
  action: { busy: boolean };
  inventory: { slots: Slot[]; selected: number; selectedItem: string | null; heldToolUse: string | null; noHoePrompts: number };
  juice: { tills: number; heroScale: XY };
  bubble: { visible: boolean; text: string };
  stamina: { current: number };
  save: { loadedFromSave: boolean; loadAddedItems: string[] };
  hud: { hotbarCounts: string[]; hotbarImages: (string | null)[] } | null;
}

type SceneHook = Record<string, unknown> & {
  debugState: S;
  events: { on(e: string, f: () => void): void; off(e: string, f: () => void): void };
};
type GameHook = {
  loop: { frame: number };
  scene: { isActive(k: string): boolean; isPaused(k: string): boolean; getScene(k: string): SceneHook; pause(k: string): void; resume(k: string): void };
};

async function state(page: Page): Promise<S | null> {
  return page.evaluate(() => {
    const g = (window as unknown as { __game?: GameHook }).__game;
    if (!g || !(g.scene.isActive('Garden') || g.scene.isPaused('Garden'))) return null;
    const s = g.scene.getScene('Garden').debugState;
    return s?.gardenReady ? s : null;
  });
}
const st = async (page: Page): Promise<S> => (await state(page))!;

async function call<T = unknown>(page: Page, method: string, ...args: unknown[]): Promise<T> {
  return page.evaluate(
    ([m, a]) => {
      const sc = (window as unknown as { __game: GameHook }).__game.scene.getScene('Garden');
      return (sc[m as string] as (...x: unknown[]) => unknown).apply(sc, a as unknown[]);
    },
    [method, args] as const,
  ) as Promise<T>;
}

async function waitReady(page: Page): Promise<void> {
  await expect.poll(() => state(page).then((s) => s !== null), { timeout: 30_000 }).toBe(true);
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
        const v = JSON.stringify(await page.evaluate(() => (window as unknown as { __game: GameHook }).__game.scene.getScene('Garden').debugState.footX));
        const v2 = JSON.stringify(((await st(page)) as unknown as { view: unknown }).view);
        const same = v + v2 === prev;
        prev = v + v2;
        return same;
      },
      { timeout: 15_000, intervals: [150] },
    )
    .toBe(true);
}

async function tileToPage(page: Page, tx: number, ty: number): Promise<XY> {
  const g = await call<XY>(page, 'debugTileToScreen', tx, ty);
  const box = (await page.locator('canvas').boundingBox())!;
  return { x: box.x + (g.x * box.width) / 1920, y: box.y + (g.y * box.height) / 1080 };
}

async function clickTile(page: Page, tx: number, ty: number): Promise<void> {
  const p = await tileToPage(page, tx, ty);
  await page.mouse.move(p.x, p.y);
  await page.mouse.down();
  await page.mouse.up();
}

/** Vào Ngày 1 sạch (xóa save rồi tải lại). */
async function freshGame(page: Page): Promise<void> {
  await page.goto('/');
  await waitReady(page);
  await call(page, 'debugClearSave');
  await page.reload();
  await waitReady(page);
}

let errors: string[] = [];

test.beforeEach(async ({ page }) => {
  errors = [];
  page.on('console', (msg) => {
    const ignorable = msg.text().startsWith('Failed to load resource') && msg.location().url.includes('/api/');
    if (msg.type() === 'error' && !ignorable) errors.push(`[console.error] ${msg.text()}`);
    if (msg.type() === 'warning' && msg.text().includes('[Preload]')) errors.push(`[preload] ${msg.text()}`);
  });
  page.on('pageerror', (err) => errors.push(`[pageerror] ${err.message}`));
  mkdirSync(SCREENSHOT_DIR, { recursive: true });
});

test.afterEach(() => {
  expect(errors, errors.join('\n')).toEqual([]);
});

test('game mới: cuốc ở ô 1 (ảnh thật, không số), đang chọn; cầm hạt bấm ô cỏ → không cuốc, bong bóng nhắc', async ({ page }) => {
  test.setTimeout(180_000);
  await freshGame(page);
  const s0 = await st(page);
  expect(s0.inventory.slots[0]).toMatchObject({ id: 'cuoc-go', count: 1, name: 'Cuốc gỗ' });
  expect(s0.inventory.slots[1]?.id).toBe('hat-rau-cai');
  expect(s0.inventory.slots[2]?.id).toBe('hat-khoai-lang');
  expect(s0.inventory.selected).toBe(0);
  expect(s0.inventory.heldToolUse).toBe('till');
  expect(s0.hud!.hotbarImages[0]).toBe('item-hoe');
  expect(s0.hud!.hotbarCounts[0]).toBe('');
  expect(s0.hud!.hotbarCounts[1]).toBe('6');

  await teleportAndSettle(page, 12, 14);
  // Cầm hạt (phím 2) bấm ô ruộng chưa cuốc → không cuốc, nhắc "cầm cuốc đã".
  await page.keyboard.press('2');
  await expect.poll(async () => (await st(page)).inventory.heldToolUse).toBeNull();
  await clickTile(page, 13, 14);
  await waitFrames(page, 60);
  let s = await st(page);
  expect(s.action.busy).toBe(false);
  expect(s.juice.tills).toBe(0);
  expect(s.inventory.noHoePrompts).toBe(1);
  expect(s.bubble.visible).toBe(true);
  expect(s.bubble.text).toContain('cuốc');
  await page.screenshot({ path: join(SCREENSHOT_DIR, 't009-no-hoe-bubble.png') });

  // Chuột phải khi cầm cuốc: không ăn, cuốc vẫn còn.
  await page.keyboard.press('1');
  await expect.poll(async () => (await st(page)).inventory.heldToolUse).toBe('till');
  await call(page, 'debugSetStamina', 50);
  const p = await tileToPage(page, 13, 14);
  await page.mouse.click(p.x, p.y, { button: 'right' });
  await waitFrames(page, 10);
  s = await st(page);
  expect(s.inventory.slots[0]).toMatchObject({ id: 'cuoc-go', count: 1 });
  expect(s.stamina.current).toBe(50);
});

test('cầm cuốc: hoạt ảnh 4 khung mỗi nhát, khung 2 trùng lúc chạm, chân không nhảy, không nhún thân', async ({ page }) => {
  test.setTimeout(240_000);
  await freshGame(page);
  await teleportAndSettle(page, 12, 14);
  const before = await st(page);
  expect(before.heroOriginY).toBe(1);

  // Ghi mỗi frame (sau update): khung cuốc, số nhát đã chạm, texture, origin, chân, scale. Đọc thẳng vài trường của scene
  // (debugState dựng cả object lớn — gọi mỗi frame làm game headless chậm hẳn). Dừng scene đúng frame chạm nhát 2 (chụp
  // khung "chạm đất") và frame "giơ cao" đầu tiên của nhát 3.
  await page.evaluate(() => {
    type Raw = {
      hoeFrame: number;
      tillCount: number;
      hero: { texture: { key: string }; originY: number; scaleY: number };
      feetBody: { center: { y: number } };
      action: { current: unknown };
    };
    const w = window as unknown as { __game: GameHook; __rec: unknown[]; __fn?: () => void; __pausedAt: number };
    const sc = w.__game.scene.getScene('Garden') as unknown as Raw & SceneHook;
    w.__rec = [];
    w.__pausedAt = 0;
    w.__fn = () => {
      const r = { f: sc.hoeFrame, t: sc.tillCount, k: sc.hero.texture.key, o: sc.hero.originY, fy: sc.feetBody.center.y, sy: sc.hero.scaleY, busy: sc.action.current !== null };
      w.__rec.push(r);
      if (w.__pausedAt === 0 && r.t === 2) {
        w.__pausedAt = 2;
        w.__game.scene.pause('Garden');
      } else if (w.__pausedAt === 2 && r.t === 2 && r.f === 1) {
        w.__pausedAt = 1;
        w.__game.scene.pause('Garden');
      }
    };
    sc.events.on('postupdate', w.__fn);
  });
  await clickTile(page, 13, 14);
  await page.waitForFunction(() => (window as unknown as { __pausedAt: number }).__pausedAt === 2, null, { timeout: 60_000 });
  const atImpact = await st(page);
  expect(atImpact.hoeFrame).toBe(2);
  expect(atImpact.textureKey).toBe('hero-t1-hoe-right');
  expect(atImpact.heroOriginY).toBeCloseTo(111 / 128, 5);
  await page.screenshot({ path: join(SCREENSHOT_DIR, 't009-hoe-impact.png') });
  await page.evaluate(() => (window as unknown as { __game: GameHook }).__game.scene.resume('Garden'));

  await page.waitForFunction(() => (window as unknown as { __pausedAt: number }).__pausedAt === 1, null, { timeout: 60_000 });
  expect((await st(page)).hoeFrame).toBe(1);
  await page.screenshot({ path: join(SCREENSHOT_DIR, 't009-hoe-raised.png') });
  await page.evaluate(() => (window as unknown as { __game: GameHook }).__game.scene.resume('Garden'));

  // Chờ xong ô (6 nhát) rồi về dáng đứng.
  await expect.poll(async () => (await st(page)).farm.plots.find((q) => q.x === 13 && q.y === 14)?.soil, { timeout: 60_000 }).toBe('tilled');
  await expect.poll(async () => (await st(page)).action.busy, { timeout: 30_000 }).toBe(false);
  await waitFrames(page, 5);
  const after = await st(page);
  expect(after.hoeFrame).toBe(-1);
  expect(after.heroOriginY).toBe(1);
  expect(after.textureKey).toBe('hero-t1-right');

  const rec = await page.evaluate(() => {
    const w = window as unknown as { __game: GameHook; __rec: { f: number; t: number; k: string; o: number; fy: number; sy: number; busy: boolean }[]; __fn?: () => void };
    w.__game.scene.getScene('Garden').events.off('postupdate', w.__fn!);
    return w.__rec;
  });
  const working = rec.filter((r) => r.busy);
  // Frame nào số nhát vừa tăng → khung đang hiện phải là khung chạm (2).
  for (let i = 1; i < rec.length; i++) {
    if (rec[i].t > rec[i - 1].t) expect(rec[i].f, `nhát ${rec[i].t}`).toBe(2);
  }
  // Mỗi nhát đi đủ 0 → 1 → 2 → 3 (lọc các khung liền giống nhau).
  const seq: number[] = [];
  for (const r of working) if (seq[seq.length - 1] !== r.f) seq.push(r.f);
  expect(seq.join('')).toBe('0123'.repeat(6));
  // Lúc cuốc: texture cuốc, origin chân 111/128, không nhún (scale 1), chân đứng yên.
  for (const r of working) {
    expect(r.k).toBe('hero-t1-hoe-right');
    expect(r.o).toBeCloseTo(111 / 128, 5);
    expect(r.sy).toBe(1);
  }
  const fys = new Set(rec.map((r) => Math.round(r.fy)));
  expect(fys.size).toBe(1);
});

test('save cũ (trước T-009) chưa có cuốc → nạp xong cuốc nằm ở ô trống đầu tiên, đồ cũ giữ nguyên', async ({ page }) => {
  test.setTimeout(180_000);
  await freshGame(page);
  // Tạo save kiểu cũ: lấy save hiện tại rồi bỏ cuốc khỏi gùi (hạt dồn về ô 1–2, ô 3 trống).
  await call(page, 'debugSaveNow', 'test');
  const old = await page.evaluate(() => {
    const raw = JSON.parse(window.localStorage.getItem('bph-save')!) as { inventory: { slots: unknown[]; selected: number } };
    const slots = raw.inventory.slots.filter((x) => !(x && (x as { id: string }).id === 'cuoc-go'));
    while (slots.length < 18) slots.push(null);
    raw.inventory.slots = slots;
    raw.inventory.selected = 0;
    window.localStorage.setItem('bph-save', JSON.stringify(raw));
    return raw;
  });
  expect(JSON.stringify(old)).not.toContain('cuoc-go');
  await call(page, 'debugClearSave'); // ngừng ghi (pagehide không ghi đè)…
  await page.evaluate((text) => window.localStorage.setItem('bph-save', text), JSON.stringify(old)); // …rồi đặt lại bản cũ
  await page.reload();
  await waitReady(page);
  const s = await st(page);
  expect(s.save.loadedFromSave).toBe(true);
  expect(s.save.loadAddedItems).toEqual(['cuoc-go']);
  expect(s.inventory.slots[0]?.id).toBe('hat-rau-cai');
  expect(s.inventory.slots[1]?.id).toBe('hat-khoai-lang');
  expect(s.inventory.slots[2]).toMatchObject({ id: 'cuoc-go', count: 1 });
  expect(s.inventory.slots.filter((x) => x?.id === 'cuoc-go').length).toBe(1);
  expect(s.hud!.hotbarImages[2]).toBe('item-hoe');
  // Nạp lần nữa không thêm cái thứ hai.
  await call(page, 'debugSaveNow', 'test');
  await page.reload();
  await waitReady(page);
  const s2 = await st(page);
  expect(s2.save.loadAddedItems).toEqual([]);
  expect(s2.inventory.slots.filter((x) => x?.id === 'cuoc-go').length).toBe(1);
  await page.screenshot({ path: join(SCREENSHOT_DIR, 't009-old-save-hoe-slot3.png') });
  await call(page, 'debugClearSave');
});
