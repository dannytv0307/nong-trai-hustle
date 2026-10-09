// T-001 — Vườn thử: vào thẳng Vườn, đi WASD có nảy bước, va chạm nhà/rào, camera bám theo.
// Đọc trạng thái qua window.__game.scene.getScene('Garden').debugState; chụp ảnh vào screenshots/.
import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCREENSHOT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'screenshots');
const TILE = 64;

interface GardenState {
  gardenReady: boolean;
  tileX: number;
  tileY: number;
  footX: number;
  footY: number;
  moving: boolean;
  facing: string;
  bobOffset: number;
  steps: number;
  textureKey: string;
  anim: { key: string | null; frame: number; playing: boolean; timeScale: number };
  view: { x: number; y: number; w: number; h: number };
  zoom: number;
  mapPx: { w: number; h: number };
}

/** Kiểu tối thiểu của debug hook — e2e không phụ thuộc Phaser. */
type GameHook = {
  registry: { get(key: string): unknown };
  scene: { isActive(key: string): boolean; getScene(key: string): Record<string, unknown> };
};

async function gardenState(page: Page): Promise<GardenState | null> {
  return page.evaluate(() => {
    const g = (window as unknown as { __game?: GameHook }).__game;
    if (!g || !g.scene.isActive('Garden')) return null;
    return (g.scene.getScene('Garden').debugState as GardenState) ?? null;
  });
}

async function teleport(page: Page, tx: number, ty: number): Promise<void> {
  await page.evaluate(
    ([x, y]) => {
      const g = (window as unknown as { __game: GameHook }).__game;
      (g.scene.getScene('Garden').debugTeleport as (a: number, b: number) => void).call(g.scene.getScene('Garden'), x, y);
    },
    [tx, ty],
  );
}

/** Tạm dừng / chạy lại scene Vườn để chụp đúng khung đang thấy (máy test vẽ chậm, chụp mất vài trăm ms). */
async function setPaused(page: Page, paused: boolean): Promise<void> {
  await page.evaluate((p) => {
    const g = (window as unknown as { __game: { scene: { pause(k: string): void; resume(k: string): void } } }).__game;
    if (p) g.scene.pause('Garden');
    else g.scene.resume('Garden');
  }, paused);
}

/** Giữ D tới khi anim đang ở khung thuộc `frames`, dừng scene, chụp, chạy tiếp. Trả về khung đã chụp. */
async function snapFrame(page: Page, frames: number[], file: string): Promise<number> {
  await expect
    .poll(async () => frames.includes((await gardenState(page))?.anim.frame ?? -1), { timeout: 10_000, intervals: [10] })
    .toBe(true);
  await setPaused(page, true);
  const s = (await gardenState(page))!;
  await page.screenshot({ path: join(SCREENSHOT_DIR, file) });
  await setPaused(page, false);
  return s.anim.frame;
}

async function hold(page: Page, keys: string[], ms: number): Promise<void> {
  for (const k of keys) await page.keyboard.down(k);
  await page.waitForTimeout(ms);
  for (const k of keys) await page.keyboard.up(k);
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
  await expect.poll(() => gardenState(page).then((s) => s?.gardenReady), { timeout: 30_000 }).toBe(true);
  mkdirSync(SCREENSHOT_DIR, { recursive: true });
});

test.afterEach(() => {
  expect(errors, errors.join('\n')).toEqual([]);
});

test('vào thẳng Vườn 48×32, camera phóng to, đứng yên thì không nảy', async ({ page }) => {
  const s = (await gardenState(page))!;
  expect(s.mapPx).toEqual({ w: 48 * TILE, h: 32 * TILE });
  expect(s.zoom).toBeGreaterThan(1);
  expect(s.moving).toBe(false);
  expect([s.tileX, s.tileY]).toEqual([11, 13]);
  await page.waitForTimeout(800); // để nhịp thở chạy một lúc
  const s2 = (await gardenState(page))!;
  expect(Math.abs(s2.bobOffset)).toBeLessThan(0.01);
  expect(s2.anim.playing).toBe(false);
  expect(s2.textureKey).toBe('hero-t1-down'); // dáng đứng chống nạnh
  await page.screenshot({ path: join(SCREENSHOT_DIR, 't001-garden-standing.png') });
});

test('giữ D: đi sang phải bằng anim bước thật, camera bám theo, thả phím về dáng đứng', async ({ page }) => {
  const start = (await gardenState(page))!;
  await page.keyboard.down('KeyD');
  await expect.poll(async () => (await gardenState(page))?.anim.playing, { timeout: 5_000 }).toBe(true);
  const mid = (await gardenState(page))!;
  expect(mid.moving).toBe(true);
  expect(mid.facing).toBe('right');
  expect(mid.anim.key).toBe('hero-t1-walk-right');
  expect(mid.textureKey).toBe('hero-t1-walk-right');
  expect(mid.anim.timeScale).toBeGreaterThan(0.5);
  expect(Math.abs(mid.bobOffset)).toBe(0); // đi ngang: không nảy bằng code (khung thật lo)

  // Hai ảnh ở hai khung khác nhau: chạm gót (0/2) và nhấc chân (1/3).
  const f1 = await snapFrame(page, [0, 2], 't001-garden-walking-a.png');
  const f2 = await snapFrame(page, [1, 3], 't001-garden-walking-b.png');
  expect(f1).not.toBe(f2);

  await page.waitForTimeout(800);
  await page.keyboard.up('KeyD');
  const end = (await gardenState(page))!;

  expect(end.footX).toBeGreaterThan(start.footX + 4 * TILE);
  expect(Math.abs(end.footY - start.footY)).toBeLessThan(1);
  expect(end.steps).toBeGreaterThanOrEqual(3); // có chạm gót (khung 0, 2)
  expect(end.view.x).toBeGreaterThan(start.view.x + 2 * TILE); // camera chạy theo

  await expect.poll(async () => (await gardenState(page))?.anim.playing, { timeout: 5_000 }).toBe(false);
  const stopped = (await gardenState(page))!;
  expect(stopped.moving).toBe(false);
  expect(stopped.textureKey).toBe('hero-t1-right'); // về ảnh đứng chống nạnh hướng phải
});

test('đi thẳng vào tường nhà thì bị chặn, đi chéo thì trượt dọc tường', async ({ page }) => {
  // Ô (5,12): ngay dưới góc trái tường dưới của nhà (hàng 10), cách cửa (cột 10–11) khá xa.
  await teleport(page, 5, 12);
  await page.waitForTimeout(100);
  const before = (await gardenState(page))!;
  await hold(page, ['KeyW'], 1000);
  const blocked = (await gardenState(page))!;
  const wallBottom = 11 * TILE;
  expect(blocked.footY).toBeGreaterThanOrEqual(wallBottom + 10 - 0.5); // mép trên hộp chân dừng ở chân tường
  expect(blocked.tileY).toBe(11);
  expect(Math.abs(blocked.footX - before.footX)).toBeLessThan(1);
  expect(blocked.moving).toBe(false); // ép vào tường thì không giậm chân tại chỗ
  expect(blocked.anim.playing).toBe(false);
  expect(blocked.textureKey).toBe('hero-t1-up');

  // Giữ W+D (chéo lên-phải) tới khi đã dịch sang phải ≥ 40px. Đo theo trạng thái chứ không theo
  // thời gian vì máy test vẽ bằng CPU (FPS thấp, thời gian giữ phím không chính xác).
  await page.keyboard.down('KeyW');
  await page.keyboard.down('KeyD');
  await expect.poll(async () => (await gardenState(page))!.footX, { timeout: 10_000, intervals: [16] }).toBeGreaterThan(blocked.footX + 40);
  await page.keyboard.up('KeyD');
  await page.keyboard.up('KeyW');
  const slid = (await gardenState(page))!;
  expect(slid.footX).toBeLessThan(10 * TILE - 20); // chưa tới cửa → vẫn đang trượt dọc tường
  expect(slid.footY).toBeGreaterThanOrEqual(wallBottom + 10 - 0.5);
});

test('sát góc dưới trái: rào chặn, camera dừng ở mép bản đồ (không lộ đen)', async ({ page }) => {
  await teleport(page, 2, 29);
  await hold(page, ['KeyA', 'KeyS'], 1200);
  await page.waitForTimeout(1500); // chờ camera lerp đuổi kịp
  const s = (await gardenState(page))!;
  expect(s.tileX).toBe(1);
  expect(s.tileY).toBe(30);
  expect(s.footX).toBeCloseTo(TILE + 20, 0); // mép trái hộp chân chạm rào trái
  expect(s.footY).toBeCloseTo(31 * TILE - 10, 0); // mép dưới hộp chân chạm rào dưới
  expect(s.view.x).toBeCloseTo(0, 0);
  expect(s.view.y + s.view.h).toBeCloseTo(s.mapPx.h, 0);
  await page.screenshot({ path: join(SCREENSHOT_DIR, 't001-garden-edge.png') });
});

test('đi ra sau cây thì tán cây che người (và mờ đi)', async ({ page }) => {
  // Cây ở ô (19,15) → đứng ở ô ngay trên gốc cây.
  await teleport(page, 19, 14);
  await page.waitForTimeout(1500);
  const depths = await page.evaluate(() => {
    const g = (window as unknown as { __game: GameHook }).__game;
    const scene = g.scene.getScene('Garden') as unknown as {
      children: { list: { type: string; depth: number; alpha: number; texture?: { key: string } }[] };
    };
    const hero = scene.children.list.find((o) => o.texture?.key?.startsWith('hero-t1-'));
    const faded = scene.children.list.filter((o) => o.texture?.key === 'ph-tree' && o.alpha < 1).length;
    return { hero: hero?.depth ?? -1, faded };
  });
  const treeBase = 16 * TILE - 12;
  expect(depths.hero).toBeLessThan(treeBase); // vẽ sau cây (cây đè lên người)
  expect(depths.faded).toBe(1); // tán cây đó mờ đi để vẫn thấy nhân vật
  await page.screenshot({ path: join(SCREENSHOT_DIR, 't001-garden-behind-tree.png') });
});
