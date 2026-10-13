// QA độc lập T-004 — Thanh Sức, "đuối", ăn khoai bằng chuột phải, bong bóng chửi thề (GDD §3.2, §3.3a, §3.12, §8, §11; D-022).
// Ca rìa bổ sung cho stamina.spec.ts (của game-dev). Đọc trạng thái qua window.__game → scene 'Garden'.debugState.
// Chờ theo TRẠNG THÁI / số frame game, không chờ giờ cố định (BUG-006).
// Ruộng: ô x 13..15, y 13..15. Đứng ở (12,14): với tới cột 13 và (14,13..15).
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
  crop: { cropId: string; age: number; dryDays: number; withered: boolean } | null;
  watered: boolean;
}
interface GState {
  gardenReady: boolean;
  footX: number;
  footY: number;
  view: { x: number; y: number; w: number; h: number };
  farm: { plots: Plot[] };
  action: { busy: boolean; current: XY | null; queue: XY[]; kind: string | null; strikesDone: number };
  till: { finishes: number; cancels: number };
  inventory: { slots: ({ id: string; count: number } | null)[]; selected: number };
  bagOpen: boolean;
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
    floatLog: string[];
  };
  farmJuice: { plants: number; waters: number; harvests: number; clears: number };
  hud: {
    staminaText: string;
    staminaBand: string;
    staminaFillColor: number;
    staminaFillRatio: number;
    vignetteAlpha: number;
    hotbarCounts: string[];
    eatBounces: number;
  } | null;
}
type SceneHook = Record<string, unknown> & {
  debugState: GState;
  events: { on(e: string, f: (t: number, d: number) => void): void };
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

const CURSE = 'Mả cha cái bụng, réo như trống hội làng!';
const TOO_TIRED = 'Đuối rồi…';
const BARKS = [
  'Ối cái lưng tôi…',
  'Luống này thẳng như kẻ chỉ!',
  'Đất gì mà rắn như đá đình!',
  'Thêm luống nữa là có tiền cưới vợ!',
  'Mồ hôi rơi xuống, quan tiền mọc lên.',
  'Hừ, cuốc gỗ mà cũng phải nể tao.',
];

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
  await page.waitForFunction((t) => (window as unknown as { __game: GameHook }).__game.loop.frame >= t, start + n, {
    timeout: 30_000,
  });
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
async function tileToPage(page: Page, tx: number, ty: number): Promise<XY> {
  const g = await call<XY>(page, 'debugTileToScreen', tx, ty);
  const box = (await page.locator('canvas').boundingBox())!;
  return { x: box.x + (g.x * box.width) / 1920, y: box.y + (g.y * box.height) / 1080 };
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
async function rightClickAtTile(page: Page, tx = 11, ty = 12): Promise<void> {
  const p = await tileToPage(page, tx, ty);
  await page.mouse.click(p.x, p.y, { button: 'right' });
  await waitFrames(page, 3);
}
/** Chuột phải ngay cạnh nhân vật (ô trên-trái chân, luôn trong màn). */
async function rightClickNearHero(page: Page): Promise<void> {
  const s = await st(page);
  const tx = Math.floor(s.footX / 64) - 1;
  const ty = Math.floor(s.footY / 64) - 1;
  await rightClickAtTile(page, tx, ty);
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
async function shot(page: Page, name: string): Promise<void> {
  await setPaused(page, true);
  await page.screenshot({ path: join(SCREENSHOT_DIR, name) });
  await setPaused(page, false);
}
async function bubbleGone(page: Page): Promise<void> {
  await expect.poll(async () => (await st(page)).bubble.visible, { timeout: 20_000 }).toBe(false);
}
async function idle(page: Page): Promise<void> {
  await expect.poll(async () => (await st(page)).action.busy, { timeout: 30_000 }).toBe(false);
}
async function tillOne(page: Page, x: number, y: number): Promise<void> {
  await call(page, 'debugHoldHoe'); // T-009 (D-026): phải cầm cuốc mới cuốc
  await clickTile(page, x, y);
  await expect.poll(async () => plotOf(await st(page), x, y).soil, { timeout: 20_000 }).toBe('tilled');
  await idle(page);
}
/** Cài bộ đếm thời gian game (tổng delta của scene Garden, ms). */
async function installClock(page: Page): Promise<void> {
  await page.evaluate(() => {
    const w = window as unknown as { __game: GameHook; __qaT?: { t: number } };
    if (w.__qaT) return;
    w.__qaT = { t: 0 };
    w.__game.scene.getScene('Garden').events.on('update', (_t: number, d: number) => {
      w.__qaT!.t += d;
    });
  });
}
const gameMs = (page: Page) => page.evaluate(() => (window as unknown as { __qaT: { t: number } }).__qaT.t);
/** Đo tốc độ đi xuống (px / giây game) theo quãng đường thật của hộp chân, đi dọc đường mòn x=11. */
async function measureWalkSpeed(page: Page): Promise<number> {
  await installClock(page);
  await teleportAndSettle(page, 11, 13);
  await page.keyboard.down('s');
  await waitFrames(page, 6);
  const y0 = (await st(page)).footY;
  const t0 = await gameMs(page);
  await waitFrames(page, 30);
  const y1 = (await st(page)).footY;
  const t1 = await gameMs(page);
  await page.keyboard.up('s');
  await waitFrames(page, 2);
  return (y1 - y0) / ((t1 - t0) / 1000);
}

let errors: string[] = [];
test.beforeEach(async ({ page }) => {
  errors = [];
  page.on('console', (msg) => {
    const ignorable = msg.text().startsWith('Failed to load resource') && msg.location().url.includes('/api/');
    if (msg.type() === 'error' && !ignorable) errors.push(`[console.error] ${msg.text()}`);
  });
  page.on('pageerror', (err) => errors.push(`[pageerror] ${err.message}`));
  page.on('response', (r) => {
    if (r.status() >= 400 && !r.url().includes('/api/')) errors.push(`[http ${r.status()}] ${r.url()}`);
  });
  await page.goto('/');
  await expect.poll(() => state(page).then((s) => s !== null), { timeout: 30_000 }).toBe(true);
  await call(page, 'debugSetBarkTuning', { chance: 0 });
  mkdirSync(SCREENSHOT_DIR, { recursive: true });
});
test.afterEach(() => {
  expect(errors, errors.join('\n')).toEqual([]);
});

test('Q1 trừ Sức đúng từng việc: đi 0, cuốc 4 ở nhát cuối, bỏ dở 0, gieo/tưới/hái/dọn 1', async ({ page }) => {
  test.setTimeout(150_000);
  // Đi lại không tốn
  await teleportAndSettle(page, 11, 13);
  await page.keyboard.down('s');
  await waitFrames(page, 30);
  await page.keyboard.up('s');
  expect((await st(page)).stamina.current).toBe(100);

  await teleportAndSettle(page, 12, 14);
  // Cuốc: theo dõi Sức sau từng nhát — chỉ đổi đúng 1 lần, ở nhát thứ 6.
  await call(page, 'debugSetTillTuning', { strikeSeconds: 0.4 });
  await clickTile(page, 13, 14);
  const seen: string[] = [];
  await expect
    .poll(
      async () => {
        const s = await st(page);
        const p = plotOf(s, 13, 14);
        const k = `${p.tillStrikes}:${s.stamina.current}`;
        if (seen.at(-1) !== k) seen.push(k);
        return p.soil;
      },
      { timeout: 30_000, intervals: [30] },
    )
    .toBe('tilled');
  console.log('nhát:Sức', seen.join(' '));
  for (const k of seen) {
    const [strikes, cur] = k.split(':').map(Number);
    if (strikes > 0 && strikes < 6) expect(cur, `nhát ${strikes}`).toBe(100);
  }
  let s = await st(page);
  expect(s.stamina.current).toBe(96);
  expect(s.stamina.floatLog.at(-1)).toBe('−4 Sức');
  await idle(page);

  // Bỏ dở: không trừ
  await call(page, 'debugSetTillTuning', { strikeSeconds: 0.5 });
  await clickTile(page, 13, 13);
  await expect.poll(async () => plotOf(await st(page), 13, 13).tillStrikes, { timeout: 15_000 }).toBeGreaterThanOrEqual(3);
  await press(page, 'w');
  s = await st(page);
  expect(s.till.cancels).toBe(1);
  expect(plotOf(s, 13, 13).soil).not.toBe('tilled');
  expect(s.stamina.current).toBe(96);
  await teleportAndSettle(page, 12, 14);

  // Gieo (13,14) −1 (T-009: ô 2 = hạt cải)
  await press(page, '2');
  await clickTile(page, 13, 14);
  await expect.poll(async () => (await st(page)).farmJuice.plants).toBe(1);
  expect((await st(page)).stamina.current).toBe(95);
  await idle(page);
  // Tưới −1
  await clickTile(page, 13, 14);
  await expect.poll(async () => (await st(page)).farmJuice.waters).toBe(1);
  expect((await st(page)).stamina.current).toBe(94);
  await idle(page);
  // Qua đêm → rau cải chín → hái −1. T-007: qua đêm (kể cả phím thử) = sáng ra Sức đầy 100.
  await call(page, 'debugAdvanceDay');
  await waitFrames(page, 3);
  expect((await st(page)).stamina.current).toBe(100);
  await clickTile(page, 13, 14);
  await expect.poll(async () => (await st(page)).farmJuice.harvests).toBe(1);
  expect((await st(page)).stamina.current).toBe(99);
  await idle(page);

  // Dọn cây héo −1: cuốc (13,15) (−4 → 95), gieo (−1 → 94), không tưới 2 đêm (sáng ra Sức đầy 100) → héo → dọn (−1 → 99)
  await call(page, 'debugSetTillTuning', { strikeSeconds: 0.08 });
  await tillOne(page, 13, 15);
  expect((await st(page)).stamina.current).toBe(95);
  await clickTile(page, 13, 15);
  await expect.poll(async () => (await st(page)).farmJuice.plants).toBe(2);
  await idle(page);
  expect((await st(page)).stamina.current).toBe(94);
  await call(page, 'debugAdvanceDay');
  await call(page, 'debugAdvanceDay');
  await waitFrames(page, 3);
  expect(plotOf(await st(page), 13, 15).crop?.withered).toBe(true);
  await clickTile(page, 13, 15);
  await expect.poll(async () => (await st(page)).farmJuice.clears).toBe(1);
  expect((await st(page)).stamina.current).toBe(99);
  expect((await st(page)).hud!.staminaText).toBe('99/100');
});

test('Q2 đúng 4 Sức cuốc được → 0, đuối + chửi; 3 Sức thì "đuối rồi…"; ô dở 4/6 với 3 Sức không cho', async ({ page }) => {
  test.setTimeout(120_000);
  await teleportAndSettle(page, 12, 14);
  // Tạo ô dở ≥4 nhát ở (13,13)
  await call(page, 'debugSetTillTuning', { strikeSeconds: 0.5 });
  await clickTile(page, 13, 13);
  // Hỏi dày (50 ms): nhịp hỏi mặc định giãn dần tới 1 s → bắt được "≥ 4 nhát" quá muộn, ô đã xong 6/6 (máy test chậm).
  await expect.poll(async () => plotOf(await st(page), 13, 13).tillStrikes, { timeout: 20_000, intervals: [50] }).toBeGreaterThanOrEqual(4);
  await press(page, 'w');
  await teleportAndSettle(page, 12, 14);
  const partial = plotOf(await st(page), 13, 13).tillStrikes;
  expect(partial).toBeGreaterThanOrEqual(4);
  expect(partial).toBeLessThan(6);
  expect((await st(page)).stamina.current).toBe(100);

  // 3 Sức: ô mới → không cuốc
  await call(page, 'debugSetStamina', 3);
  await clickTile(page, 13, 14);
  await expect.poll(async () => (await st(page)).bubble).toMatchObject({ visible: true, kind: 'warn', text: TOO_TIRED });
  await waitFrames(page, 20);
  let s = await st(page);
  expect(s.action.busy).toBe(false);
  expect(plotOf(s, 13, 14).tillStrikes).toBe(0);
  // 3 Sức: ô dở → không cuốc tiếp
  await clickTile(page, 13, 13);
  await waitFrames(page, 20);
  s = await st(page);
  expect(s.action.busy).toBe(false);
  expect(plotOf(s, 13, 13).tillStrikes).toBe(partial);
  expect(s.stamina.current).toBe(3);
  await shot(page, 'qa-t004-too-tired-3.png');
  await bubbleGone(page);

  // Đúng 4: cuốc được, về 0 → đuối, chửi đúng 1 lần, bong bóng đỏ
  // BUG-014: kéo dài bong bóng chửi (2.5 s → 30 s) để lúc click ô 14,14 bên dưới câu chửi chắc chắn còn hiện (máy chậm).
  await call(page, 'debugSetTestTuning', { grumbleSeconds: 30 });
  await call(page, 'debugSetStamina', 4);
  await call(page, 'debugSetTillTuning', { strikeSeconds: 0.08 });
  await tillOne(page, 13, 14);
  s = await st(page);
  expect(s.stamina).toMatchObject({ current: 0, exhausted: true, curses: 1 });
  expect(s.bubble).toMatchObject({ visible: true, kind: 'grumble', text: CURSE });
  expect(s.stamina.lastCurseSfx).toMatch(/^sfx-voice-cau-nhau-[12]$/);
  await shot(page, 'qa-t004-curse-after-till.png');
  // Click ô khác trong lúc câu chửi còn hiện: không làm, chửi không bị "đuối rồi…" đè
  const tiredBefore = (await st(page)).stamina.tooTired;
  await clickTile(page, 14, 14);
  await waitFrames(page, 3);
  s = await st(page);
  expect(s.action.busy).toBe(false);
  expect(plotOf(s, 14, 14).tillStrikes).toBe(0);
  expect(s.bubble).toMatchObject({ visible: true, kind: 'grumble' });
  console.log('tooTired trước/sau click khi đang chửi', tiredBefore, s.stamina.tooTired, s.bubble.kind);
  expect(s.stamina.curses).toBe(1);
});

test('Q3 hàng chờ 3 ô với đúng 8 Sức: cuốc 2 ô, ô 3 không bắt đầu, hàng chờ xóa, đuối + chửi 1 lần', async ({ page }) => {
  test.setTimeout(120_000);
  await teleportAndSettle(page, 12, 14);
  await call(page, 'debugSetStamina', 8);
  await call(page, 'debugSetTillTuning', { strikeSeconds: 3 });
  await moveMouseToTile(page, 13, 13);
  await page.mouse.down();
  await expect.poll(async () => (await st(page)).action.current).toEqual({ x: 13, y: 13 });
  for (const [x, y] of [
    [13, 14],
    [13, 15],
    [14, 14],
  ] as const) {
    await moveMouseToTile(page, x, y);
    await waitFrames(page, 2);
  }
  await page.mouse.up();
  expect((await st(page)).action.queue).toHaveLength(3);
  await call(page, 'debugSetTillTuning', { strikeSeconds: 0.1 });
  await expect.poll(async () => (await st(page)).till.finishes, { timeout: 30_000 }).toBe(2);
  await idle(page);
  await waitFrames(page, 10);
  const s = await st(page);
  expect(plotOf(s, 13, 13).soil).toBe('tilled');
  expect(plotOf(s, 13, 14).soil).toBe('tilled');
  expect(plotOf(s, 13, 15).tillStrikes).toBe(0);
  expect(plotOf(s, 14, 14).tillStrikes).toBe(0);
  expect(s.action.queue).toHaveLength(0);
  expect(s.stamina).toMatchObject({ current: 0, exhausted: true, curses: 1 });
  expect(s.bubble.kind).toBe('grumble');
});

test('Q4 việc nhanh: Sức 0 không tưới; Sức 2 rê tưới 4 ô → tưới 2 rồi dừng', async ({ page }) => {
  test.setTimeout(150_000);
  await teleportAndSettle(page, 12, 14);
  await call(page, 'debugSetTillTuning', { strikeSeconds: 0.06 });
  const tiles: [number, number][] = [
    [13, 13],
    [13, 14],
    [13, 15],
    [14, 14],
  ];
  for (const [x, y] of tiles) await tillOne(page, x, y);
  await press(page, '2'); // T-009: ô 2 = hạt cải
  for (const [x, y] of tiles) {
    const before = (await st(page)).farmJuice.plants;
    await clickTile(page, x, y);
    await expect.poll(async () => (await st(page)).farmJuice.plants).toBe(before + 1);
    await idle(page);
  }
  expect((await st(page)).stamina.current).toBe(100 - 16 - 4);

  // Sức 0: click tưới → "đuối rồi…", không tưới
  await call(page, 'debugSetStamina', 0);
  await bubbleGone(page);
  await clickTile(page, 13, 13);
  await expect.poll(async () => (await st(page)).bubble.text).toBe(TOO_TIRED);
  await waitFrames(page, 15);
  expect((await st(page)).farmJuice.waters).toBe(0);
  expect((await st(page)).action.busy).toBe(false);

  // Sức 2: rê tưới cả 4 ô
  await call(page, 'debugSetStamina', 2);
  await bubbleGone(page);
  await moveMouseToTile(page, 13, 13);
  await page.mouse.down();
  for (const [x, y] of tiles.slice(1)) {
    await moveMouseToTile(page, x, y);
    await waitFrames(page, 1);
  }
  const q = (await st(page)).action;
  await page.mouse.up();
  console.log('hàng chờ tưới lúc thả chuột', JSON.stringify(q));
  await idle(page);
  await waitFrames(page, 10);
  const s = await st(page);
  expect(s.farmJuice.waters).toBe(2);
  expect(s.stamina).toMatchObject({ current: 0, exhausted: true, curses: 2 });
  expect(s.action.queue).toHaveLength(0);
  expect(s.farm.plots.filter((p) => p.watered).length).toBe(2);
});

test('Q5 chửi đúng 1 lần mỗi lần đuối: F8 liên tục không chửi lại, ăn rồi đuối lại thì chửi lại', async ({ page }) => {
  test.setTimeout(90_000);
  for (let i = 0; i < 5; i++) await press(page, 'F8');
  let s = await st(page);
  expect(s.stamina).toMatchObject({ current: 0, exhausted: true, curses: 1 });
  for (let i = 0; i < 4; i++) await press(page, 'F8');
  s = await st(page);
  expect(s.stamina.curses).toBe(1);
  expect(s.stamina.current).toBe(0);
  // F8 khi 0 không hiện "−0 Sức"
  expect(s.stamina.floatLog).not.toContain('−0 Sức'); // BUG-012: F8 liền tay gộp thành −40/−60… nên so đúng chữ
  // Ăn → thoát đuối
  await call(page, 'debugSetSlot', 3, 'khoai-lang', 5);
  await press(page, '4');
  await rightClickAtTile(page);
  s = await st(page);
  expect(s.stamina).toMatchObject({ current: 8, exhausted: false, curses: 1 });
  // Đuối lại → chửi lại (dù câu chửi trước còn đang hiện hay không)
  await press(page, 'F8');
  s = await st(page);
  expect(s.stamina).toMatchObject({ current: 0, exhausted: true, curses: 2 });
  expect(s.bubble).toMatchObject({ visible: true, kind: 'grumble', text: CURSE });
  // Ăn + F8 nhanh nhiều lần liền
  for (let i = 0; i < 3; i++) {
    await rightClickAtTile(page);
    await press(page, 'F8');
  }
  expect((await st(page)).stamina.curses).toBe(5);
});

test('Q6 ăn: đầy / gần đầy / hạt / rau cải / ô trống / gùi mở / khi đuối → tốc độ về bình thường', async ({ page }) => {
  test.setTimeout(120_000);
  await call(page, 'debugSetSlot', 2, 'khoai-lang', 4);
  await press(page, '3');
  // Đầy: không ăn
  await rightClickAtTile(page);
  let s = await st(page);
  expect(s.stamina.eats).toBe(0);
  expect(s.inventory.slots[2]?.count).toBe(4);
  // 97 → +3 (trần 100, chữ số thật)
  await call(page, 'debugSetStamina', 97);
  await rightClickAtTile(page);
  s = await st(page);
  expect(s.stamina.current).toBe(100);
  expect(s.stamina.floatLog.at(-1)).toBe('+3 Sức');
  expect(s.inventory.slots[2]?.count).toBe(3);
  // 50 → 58, chữ "+8 Sức", ô hotbar nảy. Chờ chữ "+3" bay hết để không bị gộp thành "+11" (BUG-012).
  await expect.poll(async () => (await st(page)).stamina.floatsActive, { timeout: 10_000 }).toEqual([]);
  await call(page, 'debugSetStamina', 50);
  await rightClickAtTile(page);
  s = await st(page);
  expect(s.stamina.current).toBe(58);
  expect(s.stamina.floatsActive).toContain('+8 Sức');
  await shot(page, 'qa-t004-eat-plus8.png');
  // Cuốc / hạt / rau cải sống / ô trống: không làm gì (T-009: ô 1 = cuốc, ô 2 = hạt cải)
  await call(page, 'debugSetSlot', 5, 'rau-cai', 2);
  for (const k of ['1', '2', '6', '9']) {
    await press(page, k);
    await rightClickAtTile(page);
  }
  s = await st(page);
  expect(s.stamina.current).toBe(58);
  expect(s.stamina.eats).toBe(2);
  expect(s.inventory.slots[0]).toMatchObject({ id: 'cuoc-go', count: 1 });
  expect(s.inventory.slots[1]?.count).toBe(6);
  expect(s.inventory.slots[5]?.count).toBe(2);
  // Gùi mở: chuột phải không ăn, đóng gùi xong cũng không "ăn bù"
  await press(page, '3');
  await press(page, 'e');
  expect((await st(page)).bagOpen).toBe(true);
  await rightClickAtTile(page, 11, 12);
  await rightClickAtTile(page, 20, 18);
  await press(page, 'e');
  await waitFrames(page, 5);
  s = await st(page);
  expect(s.bagOpen).toBe(false);
  expect(s.stamina.current).toBe(58);
  expect(s.inventory.slots[2]?.count).toBe(2);

  // Đuối → ăn → thoát đuối, tốc độ về bình thường
  const normal = await measureWalkSpeed(page);
  await call(page, 'debugSetStamina', 0);
  const tired = await measureWalkSpeed(page);
  await rightClickNearHero(page);
  s = await st(page);
  expect(s.stamina).toMatchObject({ current: 8, exhausted: false, speedMultiplier: 1 });
  const after = await measureWalkSpeed(page);
  console.log(`tốc độ px/s game: bình thường ${normal.toFixed(1)}, đuối ${tired.toFixed(1)}, sau ăn ${after.toFixed(1)}; tỷ lệ ${(tired / normal).toFixed(3)}`);
  expect(normal).toBeGreaterThan(256 * 0.9);
  expect(normal).toBeLessThan(256 * 1.1);
  expect(tired / normal).toBeGreaterThan(0.45);
  expect(tired / normal).toBeLessThan(0.55);
  expect(after / normal).toBeGreaterThan(0.9);
  await expect.poll(async () => (await st(page)).hud!.vignetteAlpha, { timeout: 10_000 }).toBe(0);
});

test('Q7 màu thanh ở ngưỡng 100/50/49/20/19/0; viền tối chỉ khi đuối', async ({ page }) => {
  const cases: [number, string][] = [
    [100, 'green'],
    [50, 'green'],
    [49, 'yellow'],
    [20, 'yellow'],
    [19, 'red'],
    [0, 'red'],
  ];
  for (const [v, band] of cases) {
    await call(page, 'debugSetStamina', v);
    await waitFrames(page, 3);
    const s = await st(page);
    expect(s.hud!.staminaText).toBe(`${v}/100`);
    expect(s.hud!.staminaBand).toBe(band);
    expect(s.stamina.band).toBe(band);
  }
  await expect.poll(async () => (await st(page)).hud!.vignetteAlpha, { timeout: 10_000 }).toBeCloseTo(0.6, 2);
  await call(page, 'debugSetStamina', 1);
  await expect.poll(async () => (await st(page)).hud!.vignetteAlpha, { timeout: 10_000 }).toBe(0);
});

test('Q8 thứ tự ưu tiên bong bóng: chửi > báo > lầm bầm', async ({ page }) => {
  test.setTimeout(120_000);
  await teleportAndSettle(page, 12, 14);
  // báo đang hiện → chửi thề thay được
  await call(page, 'debugSetStamina', 3);
  await clickTile(page, 13, 14);
  await expect.poll(async () => (await st(page)).bubble.kind).toBe('warn');
  await call(page, 'debugSetStamina', 0);
  expect((await st(page)).bubble).toMatchObject({ kind: 'grumble', text: CURSE });
  // chửi đang hiện → báo không đè
  await call(page, 'showBubble', 'báo thử');
  expect((await st(page)).bubble.kind).toBe('grumble');
  await bubbleGone(page);

  // báo đang hiện → lầm bầm (xác suất 1) không đè
  await call(page, 'debugSetStamina', 100);
  await call(page, 'debugSetBarkTuning', { chance: 1, cooldownSeconds: 0 });
  await call(page, 'debugSetTillTuning', { strikeSeconds: 3 });
  await clickTile(page, 13, 14);
  await expect.poll(async () => (await st(page)).action.busy).toBe(true);
  await call(page, 'showBubble', 'báo thử');
  await call(page, 'debugSetTillTuning', { strikeSeconds: 0.05 });
  await expect.poll(async () => plotOf(await st(page), 13, 14).soil, { timeout: 20_000 }).toBe('tilled');
  let s = await st(page);
  if (s.bubble.visible) expect(s.bubble.text).toBe('báo thử');
  expect(s.stamina.barks).toBe(0);
  await idle(page);
  await bubbleGone(page);
  // lầm bầm đang hiện → báo đè được
  await tillOne(page, 13, 13);
  s = await st(page);
  expect(s.bubble.kind).toBe('bark');
  expect(BARKS).toContain(s.bubble.text);
  await shot(page, 'qa-t004-bark.png');
  await call(page, 'showBubble', 'báo thử 2');
  expect((await st(page)).bubble).toMatchObject({ kind: 'warn', text: 'báo thử 2' });
});

test('Q9 lầm bầm: chance 1 + cooldown 20 s → ô 2 ngay sau không lầm bầm; chance 1 cooldown 0 → mỗi ô 1 lần, không lặp câu', async ({ page }) => {
  test.setTimeout(150_000);
  await teleportAndSettle(page, 12, 14);
  await call(page, 'debugSetTillTuning', { strikeSeconds: 0.06 });
  await call(page, 'debugSetBarkTuning', { chance: 1, cooldownSeconds: 20 });
  await tillOne(page, 13, 13);
  expect((await st(page)).stamina.barks).toBe(1);
  await tillOne(page, 13, 14);
  expect((await st(page)).stamina.barks).toBe(1);
  await call(page, 'debugSetBarkTuning', { cooldownSeconds: 0 });
  const lines: string[] = [];
  for (const [x, y] of [
    [13, 15],
    [14, 13],
    [14, 14],
    [14, 15],
  ] as const) {
    await bubbleGone(page);
    await tillOne(page, x, y);
    lines.push((await st(page)).stamina.lastBark!);
  }
  console.log('các câu lầm bầm', lines);
  expect((await st(page)).stamina.barks).toBe(5);
  for (let i = 1; i < lines.length; i++) expect(lines[i]).not.toBe(lines[i - 1]);
  for (const l of lines) expect(l.length).toBeLessThanOrEqual(40);
  // Bong bóng lầm bầm là bong bóng thường (không phải răng cưa đỏ)
  expect((await st(page)).bubble.kind).toBe('bark');
});

test('Q10 F8 khi đang cuốc làm Sức < 4: ô vẫn xong, Sức không âm', async ({ page }) => {
  await teleportAndSettle(page, 12, 14);
  await call(page, 'debugSetStamina', 22);
  await call(page, 'debugSetTillTuning', { strikeSeconds: 0.5 });
  await clickTile(page, 13, 14);
  await expect.poll(async () => (await st(page)).action.strikesDone, { timeout: 15_000 }).toBeGreaterThanOrEqual(1);
  await press(page, 'F8'); // 22 → 2
  expect((await st(page)).stamina.current).toBe(2);
  await call(page, 'debugSetTillTuning', { strikeSeconds: 0.05 });
  await expect.poll(async () => plotOf(await st(page), 13, 14).soil, { timeout: 20_000 }).toBe('tilled');
  const s = await st(page);
  expect(s.stamina.current).toBe(0);
  expect(s.stamina.exhausted).toBe(true);
  expect(s.stamina.curses).toBe(1);
});

test('Q11 ảnh 1366×768: thanh Sức, chửi đỏ, viền tối, "+8 Sức" không đè hotbar', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  const page = await ctx.newPage();
  const errs: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  page.on('pageerror', (e) => errs.push(e.message));
  await page.goto('/');
  await expect.poll(() => state(page).then((s) => s !== null), { timeout: 30_000 }).toBe(true);
  await call(page, 'debugSetBarkTuning', { chance: 0 });
  await teleportAndSettle(page, 12, 14);
  await call(page, 'debugSetStamina', 64);
  await waitFrames(page, 3);
  await shot(page, 'qa-t004-1366-hud.png');
  await call(page, 'debugSetStamina', 0);
  await expect.poll(async () => (await st(page)).hud!.vignetteAlpha, { timeout: 10_000 }).toBeGreaterThan(0.3);
  await waitFrames(page, 10);
  await shot(page, 'qa-t004-1366-curse-vignette.png');
  await call(page, 'debugSetSlot', 2, 'khoai-lang', 3);
  await press(page, '3');
  const p = await tileToPage(page, 11, 12);
  await page.mouse.click(p.x, p.y, { button: 'right' });
  await waitFrames(page, 4);
  await shot(page, 'qa-t004-1366-eat.png');
  expect((await st(page)).stamina.current).toBe(8);
  await ctx.close();
  expect(errs).toEqual([]);
});
