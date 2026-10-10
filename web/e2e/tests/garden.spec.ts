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
  turnFrame: string | null;
  view: { x: number; y: number; w: number; h: number };
  zoom: number;
  mapPx: { w: number; h: number };
}

/** Kiểu tối thiểu của debug hook — e2e không phụ thuộc Phaser. */
type GameHook = {
  registry: { get(key: string): unknown };
  scene: { isActive(key: string): boolean; isPaused(key: string): boolean; getScene(key: string): Record<string, unknown> };
};

async function gardenState(page: Page): Promise<GardenState | null> {
  return page.evaluate(() => {
    const g = (window as unknown as { __game?: GameHook }).__game;
    // Scene đang tạm dừng (lúc chụp ảnh) thì isActive = false nhưng vẫn đọc trạng thái được.
    if (!g || !(g.scene.isActive('Garden') || g.scene.isPaused('Garden'))) return null;
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

/**
 * Đang giữ phím đi: chờ anim tới khung thuộc `frames` thì dừng scene NGAY trong sự kiện đổi khung
 * (không hỏi-rồi-dừng từ ngoài, vì giữa hai lệnh khung có thể đã nhảy), chụp, chạy tiếp. Trả về khung đã chụp.
 */
async function snapFrame(page: Page, frames: number[], file: string, heldKey = 'KeyD'): Promise<number> {
  await page.evaluate(
    (wanted) =>
      new Promise<void>((resolve, reject) => {
        type Hero = { on(e: string, f: (...a: unknown[]) => void): void; off(e: string, f: (...a: unknown[]) => void): void };
        const g = (window as unknown as { __game: GameHook & { scene: { pause(k: string): void } } }).__game;
        const hero = (g.scene.getScene('Garden') as unknown as { hero: Hero }).hero;
        const timer = setTimeout(() => {
          hero.off('animationupdate', onFrame);
          reject(new Error(`Không bắt được khung ${wanted.join('/')} trong 10 giây`));
        }, 10_000);
        function onFrame(_anim: unknown, frame: unknown): void {
          if (!wanted.includes(Number((frame as { textureFrame: unknown }).textureFrame))) return;
          hero.off('animationupdate', onFrame);
          clearTimeout(timer);
          g.scene.pause('Garden');
          resolve();
        }
        hero.on('animationupdate', onFrame);
      }),
    frames,
  );
  const s = (await gardenState(page))!;
  await page.screenshot({ path: join(SCREENSHOT_DIR, file) });
  await setPaused(page, false);
  // Phaser tự "nhả" mọi phím khi scene tạm dừng (KeyboardPlugin.resetKeys) → nhấn lại phím đang giữ.
  await page.keyboard.up(heldKey);
  await page.keyboard.down(heldKey);
  return s.anim.frame;
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

  // Đi ngang 6 khung (ART-CHR-005): chạm gót (0/3), hạ thấp (1/4), qua chân (2/5).
  const f1 = await snapFrame(page, [0, 3], 't001-garden-walking-a.png');
  const f2 = await snapFrame(page, [2, 5], 't001-garden-walking-b.png');
  const f3 = await snapFrame(page, [1, 4], 't001-garden-walking-c.png');
  expect(new Set([f1, f2, f3]).size).toBe(3);

  // Đi tiếp tới khi đã qua ≥ 4 ô (theo trạng thái — FPS headless thấp, thời gian không đáng tin).
  await expect
    .poll(async () => (await gardenState(page))!.footX, { timeout: 15_000, intervals: [16] })
    .toBeGreaterThan(start.footX + 4 * TILE);
  await page.keyboard.up('KeyD');
  const end = (await gardenState(page))!;

  expect(end.footX).toBeGreaterThan(start.footX + 4 * TILE);
  expect(Math.abs(end.footY - start.footY)).toBeLessThan(1);
  expect(end.steps).toBeGreaterThanOrEqual(3); // có chạm gót (khung 0, 3)
  expect(end.view.x).toBeGreaterThan(start.view.x + 2 * TILE); // camera chạy theo

  await expect.poll(async () => (await gardenState(page))?.anim.playing, { timeout: 5_000 }).toBe(false);
  const stopped = (await gardenState(page))!;
  expect(stopped.moving).toBe(false);
  expect(stopped.textureKey).toBe('hero-t1-right'); // về ảnh đứng chống nạnh hướng phải
});

/**
 * Ghi mỗi frame game (sau update): khung xoay, texture, khung đang hiện, vị trí chân. Nếu có `snapAt`
 * thì lần đầu thấy khung xoay đó sẽ dừng scene NGAY trong frame ấy (để chụp đúng khung xoay ~70 ms).
 */
async function startTurnRec(page: Page, snapAt: string | null): Promise<void> {
  await page.evaluate((wanted) => {
    type Rec = { turn: string | null; tex: string; frame: number; key: string | null; fx: number; fy: number; facing: string };
    const w = window as unknown as {
      __game: GameHook & { scene: { pause(k: string): void } };
      __turnRec: Rec[];
      __turnSnapped: boolean;
      __turnFn?: () => void;
    };
    const sc = w.__game.scene.getScene('Garden') as unknown as {
      debugState: GardenState;
      events: { on(e: string, f: () => void): void; off(e: string, f: () => void): void };
    };
    if (w.__turnFn) sc.events.off('postupdate', w.__turnFn);
    w.__turnRec = [];
    w.__turnSnapped = false;
    w.__turnFn = () => {
      const s = sc.debugState;
      w.__turnRec.push({ turn: s.turnFrame, tex: s.textureKey, frame: s.anim.frame, key: s.anim.key, fx: s.footX, fy: s.footY, facing: s.facing });
      if (wanted && !w.__turnSnapped && s.turnFrame === wanted) {
        w.__turnSnapped = true;
        w.__game.scene.pause('Garden');
      }
    };
    sc.events.on('postupdate', w.__turnFn);
  }, snapAt);
}

type TurnRec = { turn: string | null; tex: string; frame: number; key: string | null; fx: number; fy: number; facing: string };

async function stopTurnRec(page: Page): Promise<TurnRec[]> {
  return page.evaluate(() => {
    const w = window as unknown as { __game: GameHook; __turnRec: TurnRec[]; __turnFn?: () => void };
    const sc = w.__game.scene.getScene('Garden') as unknown as { events: { off(e: string, f: () => void): void } };
    if (w.__turnFn) sc.events.off('postupdate', w.__turnFn);
    w.__turnFn = undefined;
    return w.__turnRec;
  });
}

/** Chờ recorder đã dừng scene ở khung xoay mong muốn, chụp ảnh, chạy tiếp và nhấn lại các phím đang giữ. */
async function snapTurn(page: Page, file: string, heldKeys: string[]): Promise<GardenState> {
  await page.waitForFunction(() => (window as unknown as { __turnSnapped: boolean }).__turnSnapped, null, { timeout: 10_000 });
  const s = (await gardenState(page))!;
  await page.screenshot({ path: join(SCREENSHOT_DIR, file) });
  await setPaused(page, false);
  for (const k of heldKeys) {
    await page.keyboard.up(k);
    await page.keyboard.down(k);
  }
  return s;
}

/** Bỏ các bản ghi trùng liền nhau của khung xoay, chỉ giữ dãy khung chéo đã hiện. */
const turnSequence = (rec: TurnRec[]): string[] =>
  rec.map((r) => r.turn).filter((t, i, a): t is string => t !== null && t !== a[i - 1]);

test('đổi hướng khi đang đi: chèn khung xoay chéo (90° một khung, 180° hai khung), vẫn đi tiếp', async ({ page }) => {
  await teleport(page, 26, 21);
  await page.keyboard.down('KeyD');
  await expect.poll(async () => (await gardenState(page))?.anim.key, { timeout: 5_000 }).toBe('hero-t1-walk-right');

  // 90°: phải → xuống (nhấn S rồi thả D) → khung xuống-phải.
  await startTurnRec(page, 'down-right');
  await page.keyboard.down('KeyS');
  await page.keyboard.up('KeyD');
  const t90 = await snapTurn(page, 't001-turn-90-down-right.png', ['KeyS']);
  expect(t90.textureKey).toBe('hero-t1-turn');
  expect(t90.anim.frame).toBe(0); // dải hero-t1-turn: 0 = xuống-phải
  await expect.poll(async () => (await gardenState(page))?.anim.key, { timeout: 5_000 }).toBe('hero-t1-walk-down');
  let rec = await stopTurnRec(page);
  expect(turnSequence(rec)).toEqual(['down-right']);
  // Xoay xong vào khung đầu chu trình đi xuống.
  const firstWalk = rec.find((r) => r.turn === null && r.key === 'hero-t1-walk-down' && r.tex === 'hero-t1-walk-down');
  expect(firstWalk?.frame).toBe(0);

  // Chuẩn bị 180°: xuống → phải (đi một đoạn cho chu trình ngang chạy).
  await page.keyboard.down('KeyD');
  await page.keyboard.up('KeyS');
  await expect.poll(async () => (await gardenState(page))?.anim.key, { timeout: 5_000 }).toBe('hero-t1-walk-right');

  // 180°: phải → trái → xuống-phải rồi xuống-trái (vòng qua phía xuống).
  await startTurnRec(page, 'down-left');
  await page.keyboard.up('KeyD');
  await page.keyboard.down('KeyA');
  const t180 = await snapTurn(page, 't001-turn-180-down-left.png', ['KeyA']);
  expect(t180.anim.frame).toBe(1); // 1 = xuống-trái
  await expect.poll(async () => (await gardenState(page))?.anim.key, { timeout: 5_000 }).toBe('hero-t1-walk-left');
  await page.waitForTimeout(200);
  rec = await stopTurnRec(page);
  await page.keyboard.up('KeyA');
  const seq = turnSequence(rec);
  console.log('dãy khung xoay 180°:', seq);
  // Phải → trái có thể đi qua frame "không phím" (thả D trước khi nhấn A) — vẫn phải ra đúng 2 khung chéo.
  expect(seq).toEqual(['down-right', 'down-left']);
  // Trong lúc xoay vẫn di chuyển (chỉ đổi hình, không khựng điều khiển): chân sang trái khi đang hiện khung xoay.
  const during = rec.filter((r) => r.turn === 'down-left');
  const after = rec[rec.length - 1];
  expect(after.fx).toBeLessThan(during[0].fx);
  expect(after.facing).toBe('left');
  expect(after.tex).toBe('hero-t1-walk-left');
});

test('đi thẳng vào tường nhà thì bị chặn, đi chéo thì trượt dọc tường', async ({ page }) => {
  // Ô (5,12): ngay dưới góc trái tường dưới của nhà (hàng 10), cách cửa (cột 10–11) khá xa.
  await teleport(page, 5, 12);
  await page.waitForTimeout(100);
  const before = (await gardenState(page))!;
  const wallBottom = 11 * TILE;
  // Giữ W tới khi chạm chân tường rồi tới khi nhịp bước tắt — vẫn đang ép phím (đo theo trạng thái,
  // không theo thời gian: máy test vẽ bằng CPU nên game chạy chậm hơn đồng hồ thật).
  await page.keyboard.down('KeyW');
  await expect
    .poll(async () => (await gardenState(page))!.footY, { timeout: 10_000, intervals: [16] })
    .toBeLessThan(wallBottom + 10 + 0.5);
  await expect.poll(async () => (await gardenState(page))!.moving, { timeout: 5_000, intervals: [16] }).toBe(false);
  const blocked = (await gardenState(page))!;
  await page.keyboard.up('KeyW');
  expect(blocked.footY).toBeGreaterThanOrEqual(wallBottom + 10 - 0.5); // mép trên hộp chân dừng ở chân tường
  expect(blocked.tileY).toBe(11);
  expect(Math.abs(blocked.footX - before.footX)).toBeLessThan(1);
  expect(blocked.anim.playing).toBe(false); // ép vào tường thì không giậm chân tại chỗ
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

/** Dịch hộp chân tới toạ độ px (tâm hộp) — để đặt sát mặt tường chính xác. */
async function teleportPx(page: Page, x: number, y: number): Promise<void> {
  await page.evaluate(
    ([px, py]) => {
      const g = (window as unknown as { __game: GameHook }).__game;
      const sc = g.scene.getScene('Garden') as unknown as {
        feetBody: { reset(x: number, y: number): void };
        prevFootX: number;
        prevFootY: number;
      };
      sc.feetBody.reset(px, py);
      sc.prevFootX = px;
      sc.prevFootY = py;
    },
    [x, y],
  );
}

test('BUG-001: ép chéo dọc cả 4 mặt ngoài nhà (và ao) qua mọi mối nối — không kẹt', async ({ page }) => {
  test.setTimeout(180_000); // 10 ca, máy test vẽ bằng CPU (FPS thấp)
  // Nhà: ô (5,3) rộng 11 cao 8 → px x 320..1024, y 192..704; cửa ở cột 10–11 (x 640..768).
  // Ao: ô (31,7) 7×5 → px x 1984..2432, y 448..768. Hộp chân 40×20 → tâm cách mặt tường 20 (ngang) / 10 (dọc).
  // Mỗi ca: đứng sát mặt, giữ 2 phím (1 phím ép vào tường, 1 phím trượt dọc), phải đi hết mặt đó.
  type Case = { name: string; at: [number, number]; keys: string[]; done: (s: GardenState) => boolean };
  const cases: Case[] = [
    { name: 'nhà mặt trái, D+W (lên)', at: [300, 690], keys: ['KeyD', 'KeyW'], done: (s) => s.footY < 175 },
    { name: 'nhà mặt trái, D+S (xuống)', at: [300, 205], keys: ['KeyD', 'KeyS'], done: (s) => s.footY > 720 },
    { name: 'nhà mặt phải, A+W (lên)', at: [1044, 690], keys: ['KeyA', 'KeyW'], done: (s) => s.footY < 175 },
    { name: 'nhà mặt phải, A+S (xuống)', at: [1044, 205], keys: ['KeyA', 'KeyS'], done: (s) => s.footY > 720 },
    { name: 'nhà mặt trên, S+D (sang phải)', at: [330, 182], keys: ['KeyS', 'KeyD'], done: (s) => s.footX > 1050 },
    { name: 'nhà mặt trên, S+A (sang trái)', at: [1010, 182], keys: ['KeyS', 'KeyA'], done: (s) => s.footX < 295 },
    { name: 'nhà mặt dưới trái cửa, W+D', at: [300, 714], keys: ['KeyW', 'KeyD'], done: (s) => s.footX > 600 },
    { name: 'nhà mặt dưới phải cửa, W+A', at: [1044, 714], keys: ['KeyW', 'KeyA'], done: (s) => s.footX < 800 },
    { name: 'ao mặt trái, D+W (lên)', at: [1964, 755], keys: ['KeyD', 'KeyW'], done: (s) => s.footY < 432 },
    { name: 'ao mặt trên, S+D (sang phải)', at: [1990, 438], keys: ['KeyS', 'KeyD'], done: (s) => s.footX > 2455 },
  ];
  const stuck: string[] = [];
  for (const c of cases) {
    await teleportPx(page, c.at[0], c.at[1]);
    await page.waitForTimeout(150);
    for (const k of c.keys) await page.keyboard.down(k);
    // Đo theo trạng thái (máy test vẽ bằng CPU, FPS thấp): kẹt thì không bao giờ tới đích → hết giờ.
    let s = (await gardenState(page))!;
    const deadline = Date.now() + 15_000;
    while (!c.done(s) && Date.now() < deadline) {
      await page.waitForTimeout(30);
      s = (await gardenState(page))!;
    }
    for (const k of c.keys) await page.keyboard.up(k);
    if (!c.done(s)) {
      stuck.push(`${c.name}: dừng ở (${s.footX.toFixed(0)}, ${s.footY.toFixed(0)})`);
      await page.screenshot({ path: join(SCREENSHOT_DIR, `t001-bug001-stuck-${stuck.length}.png`) });
    }
  }
  expect(stuck, stuck.join(' | ')).toEqual([]);
});

test('sát góc dưới trái: rào chặn, camera dừng ở mép bản đồ (không lộ đen)', async ({ page }) => {
  await teleport(page, 2, 29);
  // Giữ A+S tới khi chạm cả rào trái lẫn rào dưới (theo trạng thái, không theo thời gian).
  await page.keyboard.down('KeyA');
  await page.keyboard.down('KeyS');
  await expect
    .poll(
      async () => {
        const st = (await gardenState(page))!;
        return st.footX <= TILE + 20 + 0.5 && st.footY >= 31 * TILE - 10 - 0.5;
      },
      { timeout: 10_000, intervals: [16] },
    )
    .toBe(true);
  await page.keyboard.up('KeyA');
  await page.keyboard.up('KeyS');
  // Chờ camera lerp đuổi kịp mép bản đồ.
  await expect
    .poll(async () => {
      const st = (await gardenState(page))!;
      return Math.abs(st.view.x) < 0.5 && Math.abs(st.view.y + st.view.h - st.mapPx.h) < 0.5;
    }, { timeout: 10_000 })
    .toBe(true);
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
