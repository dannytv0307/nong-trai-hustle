// T-008 — Tự lưu trong trình duyệt, F5 vào lại đúng chỗ, đúng giờ (GDD §12).
// Theo "Bạn thử thế nào" của T-008: cuốc, gieo vài ô, ra góc vườn, nhớ giờ → F5 (page.reload thật) → đứng đúng chỗ, giờ gần
// như cũ, ruộng + gùi còn nguyên → Esc → "Chơi lại từ đầu" → xác nhận → về Ngày 1.
// Thêm: F5 lúc đang cuốc (ô cuốc dở, nhát chưa chạm không tính, hàng chờ không lưu), F5 lúc đang ngủ / tổng kết (tiền thùng
// cộng đúng một lần), F5 sau ngủ gục, save hỏng (JSON cụt / sai version / thiếu trường) → Ngày 1 không treo + console.warn,
// tự lưu theo nhịp (rút ngắn bằng hook) + nhịp thật 30 giây (chặn ghi lúc thoát để chứng minh giờ lệch ≤ 30 s thật), không tự lưu
// giữa chuỗi đêm, Chơi lại không rò listener.
// Mỗi test là một browser context MỚI của Playwright → localStorage sạch, không dính save của test khác.
// Chờ theo TRẠNG THÁI (expect.poll / frame game), không chờ giờ cố định (BUG-006).
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
interface Plot {
  x: number;
  y: number;
  soil: string;
  tillStrikes: number;
  crop: { cropId: string; age: number; dryDays: number; withered: boolean } | null;
  watered: boolean;
}
interface SaveDebug {
  saveKey: string;
  lastSaveAt: { day: number; hour: number; clockText: string; savedAt: string; reason: string } | null;
  saveCount: number;
  loadedFromSave: boolean;
  loadStatus: string;
  loadReason: string | null;
  loadedElapsedSeconds: number | null;
  suppressed: boolean;
  autoSaveIntervalSeconds: number;
  autoSaveIn: number;
  skipped: number;
}
interface GState {
  gardenReady: boolean;
  view: { x: number; y: number; w: number; h: number };
  tileX: number;
  tileY: number;
  footX: number;
  footY: number;
  facing: string;
  farm: { plots: Plot[]; tilled: number };
  action: { busy: boolean; kind: string | null; queued: number; strikesDone: number };
  inventory: { slots: Slot[]; selected: number; lastSeedId: string | null };
  stamina: { current: number; exhausted: boolean };
  time: { day: number; hour: number; clockText: string; dayText: string; elapsedSeconds: number; phase: string; reasons: string[] };
  sky: { color: number; alpha: number; visible: boolean };
  pause: { menuOpen: boolean; hoverRestart: boolean; restartConfirmOpen: boolean; restartConfirmHover: string | null; savedText: string; opens: number };
  save: SaveDebug;
  money: { current: number };
  sellBox: { slots: Slot[]; total: number };
  night: { phase: string; overnights: number };
  hud: {
    clockText: string;
    dayText: string;
    moneyText: string;
    staminaText: string;
    vignetteAlpha: number;
    pauseVisible: boolean;
    pauseSavedText: string;
    pauseRestartHover: boolean;
    restartConfirmVisible: boolean;
  } | null;
}

type SceneHook = Record<string, unknown> & { debugState: GState };
type GameHook = {
  loop: { frame: number };
  scene: { isActive(key: string): boolean; isPaused(key: string): boolean; getScene(key: string): SceneHook; pause(k: string): void; resume(k: string): void };
};

/** Bố cục bản đồ (web/client/src/data/gardenLayout.json). */
const WAKE = { x: 7, y: 5 };
const SPAWN_FOOT = { x: 11 * 64, y: 13 * 64 };
const CORNER = { x: 45, y: 29 };

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

async function waitReady(page: Page): Promise<void> {
  await expect.poll(() => state(page).then((s) => s !== null), { timeout: 30_000 }).toBe(true);
}

/** F5 thật: tải lại trang (pagehide → game tự lưu) rồi chờ Vườn sẵn sàng. */
async function reload(page: Page): Promise<void> {
  await page.reload();
  await waitReady(page);
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
async function clickGame(page: Page, g: XY): Promise<void> {
  const p = await gameToPage(page, g);
  await page.mouse.move(p.x, p.y);
  await waitFrames(page, 2);
  await page.mouse.down();
  await page.mouse.up();
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
const plotOf = (s: GState, x: number, y: number) => s.farm.plots.find((p) => p.x === x && p.y === y)!;

/** Cuốc nhanh rồi gieo cải các ô; `water` = tưới luôn. */
async function plantTiles(page: Page, tiles: [number, number][], water: boolean): Promise<void> {
  await call(page, 'debugSetTillTuning', { strikeSeconds: 0.08 });
  await call(page, 'debugHoldHoe'); // T-009: cầm cuốc (gieo vẫn lấy hạt đầu tiên trong gùi)
  for (const [x, y] of tiles) {
    await clickTile(page, x, y);
    await expect.poll(async () => plotOf(await st(page), x, y).soil, { timeout: 20_000 }).toBe('tilled');
    await idle(page);
    await clickTile(page, x, y);
    await expect.poll(async () => plotOf(await st(page), x, y).crop?.cropId ?? null, { timeout: 10_000 }).toBe('rau-cai');
    await idle(page);
    if (water) {
      await clickTile(page, x, y);
      await expect.poll(async () => plotOf(await st(page), x, y).watered, { timeout: 10_000 }).toBe(true);
      await idle(page);
    }
  }
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
async function waitPhase(page: Page, phase: string, timeout = 15_000): Promise<void> {
  await expect.poll(async () => (await st(page)).night.phase, { timeout, intervals: [30] }).toBe(phase);
}

/** Những gì phải còn nguyên sau F5. */
function snapshot(s: GState) {
  return {
    tile: { x: s.tileX, y: s.tileY },
    facing: s.facing,
    day: s.time.day,
    plots: s.farm.plots,
    slots: s.inventory.slots,
    selected: s.inventory.selected,
    lastSeedId: s.inventory.lastSeedId,
    money: s.money.current,
    sellBox: s.sellBox.slots,
    stamina: { current: s.stamina.current, exhausted: s.stamina.exhausted },
  };
}

/**
 * Giả lập trình duyệt bị tắt ngang (không kịp lưu lúc rời trang): từ giờ mọi lần ghi khóa save đều bị bỏ (localStorage.setItem
 * thành no-op cho khóa này). Trang mới sau reload có localStorage bình thường.
 */
async function blockUnloadSaves(page: Page): Promise<void> {
  await page.evaluate(() => {
    const orig = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k: string, v: string) {
      if (k === 'bph-save') return;
      orig.call(this, k, v);
    };
  });
}

let errors: string[] = [];
let warnings: string[] = [];

test.beforeEach(async ({ page }) => {
  errors = [];
  warnings = [];
  page.on('console', (msg) => {
    const ignorable = msg.text().startsWith('Failed to load resource') && msg.location().url.includes('/api/');
    if (msg.type() === 'error' && !ignorable) errors.push(`[console.error] ${msg.text()}`);
    if (msg.type() === 'warning') warnings.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(`[pageerror] ${err.message}`));
  await page.goto('/');
  await waitReady(page);
  mkdirSync(SCREENSHOT_DIR, { recursive: true });
});

test.afterEach(() => {
  expect(errors, errors.join('\n')).toEqual([]);
});

test('mở game lần đầu: không có save → Ngày 1, đứng ở chỗ xuất phát', async ({ page }) => {
  const s = await st(page);
  expect(s.save.loadStatus).toBe('none');
  expect(s.save.loadedFromSave).toBe(false);
  expect(s.save.saveKey).toBe('bph-save');
  expect(s.time.day).toBe(1);
  expect(s.time.hour).toBeLessThan(6.2);
  expect(s.money.current).toBe(60);
  expect(s.farm.tilled).toBe(0);
  expect(Math.abs(s.footX - SPAWN_FOOT.x)).toBeLessThan(2);
  expect(Math.abs(s.footY - SPAWN_FOOT.y)).toBeLessThan(2);
  expect(s.pause.savedText).toBe('Chưa lưu lần nào');
});

test('Bạn thử thế nào: cuốc, gieo, ra góc vườn, nhớ giờ → F5 → đúng chỗ, giờ gần như cũ, ruộng + gùi còn nguyên → Chơi lại từ đầu → Ngày 1', async ({ page }) => {
  test.setTimeout(180_000);
  await teleportAndSettle(page, 12, 14);
  await plantTiles(page, [[13, 13], [13, 14]], false);
  await clickTile(page, 13, 14); // tưới ô thứ hai
  await expect.poll(async () => plotOf(await st(page), 13, 14).watered).toBe(true);
  await idle(page);
  // Thêm đồ cho phong phú: thùng bán có cải, gùi có khoai ở ô 6, chọn ô 3, giờ 14:30, Sức 37.
  await call(page, 'debugSetSellBoxSlot', 0, 'rau-cai', 2);
  await call(page, 'debugSetSlot', 5, 'khoai-lang', 4);
  await press(page, '3');
  await call(page, 'debugSetHour', 14.5);
  await call(page, 'debugSetStamina', 37);
  // Ra góc vườn, đi vài bước sang trái để hướng mặt là "left".
  await teleportAndSettle(page, CORNER.x, CORNER.y);
  await page.keyboard.down('a');
  await expect.poll(async () => (await st(page)).facing).toBe('left');
  await page.keyboard.up('a');
  await waitFrames(page, 10);
  const before = await st(page);
  expect(before.save.loadedFromSave).toBe(false);
  await shot(page, 't008-truoc-f5.png');

  await reload(page);
  const after = await st(page);
  expect(after.save.loadedFromSave).toBe(true);
  expect(after.save.loadStatus).toBe('ok');
  expect(snapshot(after)).toEqual(snapshot(before));
  expect(Math.abs(after.footX - before.footX)).toBeLessThan(1);
  expect(Math.abs(after.footY - before.footY)).toBeLessThan(1);
  // Giờ lệch không quá 30 giây thật (thường chỉ vài khung hình vì pagehide lưu ngay lúc F5).
  const lag = before.time.elapsedSeconds - after.save.loadedElapsedSeconds!;
  expect(Math.abs(lag)).toBeLessThanOrEqual(30);
  console.log('lệch giờ sau F5 (giây thật):', lag.toFixed(2), before.time.clockText, '→', after.time.clockText);
  // HUD hiện đúng: giờ, ngày, tiền, Sức; lớp trời theo giờ (14:30 chưa tối).
  expect(after.hud!.clockText).toBe(after.time.clockText);
  expect(after.hud!.dayText).toBe('Ngày 1 · Mùa nắng');
  expect(after.hud!.moneyText).toBe('60 quan');
  expect(after.hud!.staminaText).toBe('37/100');
  expect(after.time.phase).toBe('midday');
  expect(after.sellBox.total).toBe(20);
  expect(after.pause.savedText).toMatch(/^Đã lưu lúc 14:\d\d · Ngày 1$/);
  await shot(page, 't008-sau-f5.png');

  // Esc → cửa sổ Tạm dừng có "Đã lưu lúc…" (vừa lưu lúc mở Tạm dừng).
  await press(page, 'Escape');
  let s = await st(page);
  expect(s.pause.menuOpen).toBe(true);
  expect(s.hud!.pauseVisible).toBe(true);
  expect(s.save.lastSaveAt!.reason).toBe('pause');
  expect(s.hud!.pauseSavedText).toBe(`Đã lưu lúc ${s.time.clockText} · Ngày 1`);
  // Rê lên "Chơi lại từ đầu" → sáng.
  const restart = await gameToPage(page, await call<XY>(page, 'debugPauseButtonCenter', 'restart'));
  await page.mouse.move(restart.x, restart.y);
  await expect.poll(async () => (await st(page)).hud!.pauseRestartHover).toBe(true);
  await shot(page, 't008-tam-dung-da-luu.png');
  // Click → hộp xác nhận. Esc = Không (Tạm dừng vẫn mở).
  await page.mouse.down();
  await page.mouse.up();
  await expect.poll(async () => (await st(page)).hud!.restartConfirmVisible).toBe(true);
  await press(page, 'Escape');
  s = await st(page);
  expect(s.pause.restartConfirmOpen).toBe(false);
  expect(s.pause.menuOpen).toBe(true);
  // Lần nữa → "Không" bằng chuột.
  await clickGame(page, await call<XY>(page, 'debugPauseButtonCenter', 'restart'));
  await expect.poll(async () => (await st(page)).pause.restartConfirmOpen).toBe(true);
  await clickGame(page, await call<XY>(page, 'debugPauseButtonCenter', 'confirmNo'));
  s = await st(page);
  expect(s.pause.restartConfirmOpen).toBe(false);
  expect(s.pause.menuOpen).toBe(true);
  expect(s.time.day).toBe(1);
  expect(s.farm.tilled).toBe(2); // chưa xóa gì
  // Lần ba → Enter KHÔNG chọn "Có"; rê lên "Có" → chụp → click.
  await clickGame(page, await call<XY>(page, 'debugPauseButtonCenter', 'restart'));
  await press(page, 'Enter');
  expect((await st(page)).pause.restartConfirmOpen).toBe(true);
  const yes = await gameToPage(page, await call<XY>(page, 'debugPauseButtonCenter', 'confirmYes'));
  await page.mouse.move(yes.x, yes.y);
  await expect.poll(async () => (await st(page)).pause.restartConfirmHover).toBe('yes');
  await shot(page, 't008-xac-nhan-choi-lai.png');
  await page.mouse.down();
  await page.mouse.up();

  // Scene mới: Ngày 1 sạch, không nạp save, save cũ đã xóa.
  await expect
    .poll(async () => {
      const n = await state(page);
      return n ? { loaded: n.save.loadStatus, day: n.time.day, tilled: n.farm.tilled, paused: n.pause.menuOpen } : null;
    }, { timeout: 15_000 })
    .toEqual({ loaded: 'none', day: 1, tilled: 0, paused: false });
  s = await st(page);
  expect(s.money.current).toBe(60);
  expect(s.sellBox.total).toBe(0);
  expect(s.stamina.current).toBe(100);
  expect(s.time.hour).toBeLessThan(6.2);
  expect(s.inventory.selected).toBe(0);
  expect(Math.abs(s.footX - SPAWN_FOOT.x)).toBeLessThan(2);
  expect(s.save.saveCount).toBe(0);
  expect(await call(page, 'debugReadSave')).toBeNull();
  await shot(page, 't008-choi-lai-ngay1.png');
  // Game mới chơi được: đi xuống được, Esc mở Tạm dừng đúng một lần.
  const y0 = s.footY;
  await page.keyboard.down('s');
  await expect.poll(async () => (await st(page)).footY, { timeout: 10_000 }).toBeGreaterThan(y0 + 20);
  await page.keyboard.up('s');
  await press(page, 'Escape');
  s = await st(page);
  expect(s.pause.opens).toBe(1);
  expect(s.save.lastSaveAt!.reason).toBe('pause');
  await press(page, 'Escape');
  // F5 lần nữa → nạp đúng bản mới (Ngày 1, không có ruộng cũ).
  await reload(page);
  s = await st(page);
  expect(s.save.loadedFromSave).toBe(true);
  expect(s.farm.tilled).toBe(0);
});

test('Chơi lại từ đầu không rò listener (đếm listener trên window/document qua CDP)', async ({ page }) => {
  const cdp = await page.context().newCDPSession(page);
  const countListeners = async (): Promise<Record<string, number>> => {
    const out: Record<string, number> = {};
    for (const expr of ['window', 'document']) {
      const { result } = await cdp.send('Runtime.evaluate', { expression: expr });
      const { listeners } = await cdp.send('DOMDebugger.getEventListeners', { objectId: result.objectId! });
      // Bỏ listener của chính Playwright (tự gắn khi chạy).
      for (const l of listeners) if (!l.type.startsWith('__playwright')) out[`${expr}:${l.type}`] = (out[`${expr}:${l.type}`] ?? 0) + 1;
    }
    return out;
  };
  const restartOnce = async (): Promise<void> => {
    await press(page, 'Escape');
    await clickGame(page, await call<XY>(page, 'debugPauseButtonCenter', 'restart'));
    await clickGame(page, await call<XY>(page, 'debugPauseButtonCenter', 'confirmYes'));
    await expect
      .poll(async () => {
        const s = await state(page);
        return s !== null && !s.save.suppressed && !s.pause.menuOpen && s.save.loadStatus === 'none';
      }, { timeout: 15_000 })
      .toBe(true);
    await waitFrames(page, 5);
  };
  // Một vòng "khởi động": Phaser / trình duyệt gắn vài listener chuột toàn cục ở lần bấm chuột đầu tiên (một lần cho cả game).
  await restartOnce();
  const before = await countListeners();
  await restartOnce();
  await restartOnce();
  const after = await countListeners();
  console.log('listener trước / sau 2 lần chơi lại:', JSON.stringify(before), JSON.stringify(after));
  expect(after).toEqual(before);
});

test('F5 lúc đang cuốc: ô là cuốc dở đúng số nhát đã chạm, hàng chờ không lưu', async ({ page }) => {
  test.setTimeout(120_000);
  await teleportAndSettle(page, 12, 14);
  await call(page, 'debugSetTillTuning', { strikeSeconds: 0.3 });
  await clickTile(page, 13, 14);
  await expect.poll(async () => plotOf(await st(page), 13, 14).tillStrikes, { timeout: 20_000, intervals: [30] }).toBeGreaterThanOrEqual(2);
  // Nhát đang giơ kéo dài 30 s → chắc chắn không chạm thêm trước lúc F5.
  await call(page, 'debugSetTillTuning', { strikeSeconds: 30 });
  // Xếp thêm 2 ô vào hàng chờ.
  await clickTile(page, 14, 14);
  await clickTile(page, 14, 13);
  const s0 = await st(page);
  expect(s0.action.busy).toBe(true);
  expect(s0.action.queued).toBe(2);
  const n = plotOf(s0, 13, 14).tillStrikes;
  expect(n).toBeGreaterThanOrEqual(2);
  expect(n).toBeLessThan(6);
  await reload(page);
  const s = await st(page);
  expect(plotOf(s, 13, 14)).toMatchObject({ soil: 'untilled', tillStrikes: n });
  expect(plotOf(s, 14, 14).tillStrikes).toBe(0);
  expect(plotOf(s, 14, 13).tillStrikes).toBe(0);
  expect(s.action.busy).toBe(false);
  expect(s.action.queued).toBe(0);
  // Click lại → làm tiếp phần còn lại (6 − n nhát) rồi xong ô.
  await call(page, 'debugSetTillTuning', { strikeSeconds: 0.08 });
  await clickTile(page, 13, 14);
  await expect.poll(async () => plotOf(await st(page), 13, 14).soil, { timeout: 20_000 }).toBe('tilled');
});

test('F5 lúc đang ngủ / tổng kết: tiền thùng cộng đúng một lần, sáng ra ở cạnh giường', async ({ page }) => {
  test.setTimeout(180_000);
  const money0 = (await st(page)).money.current;
  await call(page, 'debugSetSellBoxSlot', 0, 'rau-cai', 3); // 30 quan cuối ngày
  await call(page, 'debugSetHour', 18.5);
  const sleep = async (): Promise<void> => {
    await teleportAndSettle(page, WAKE.x, WAKE.y);
    await press(page, 'f');
    await waitPhase(page, 'sleepPrompt');
    await press(page, 'Enter');
  };
  // Lần 1: F5 ngay lúc đang thiếp đi. Bản lưu "trước khi ngủ" hoặc (nếu qua đêm kịp xong trước F5) bản "sáng hôm sau" —
  // bản nào cũng phải nhất quán: tiền + thùng = money0 + 30.
  await sleep();
  await expect.poll(async () => (await st(page)).night.phase, { intervals: [20] }).not.toBe('sleepPrompt');
  await reload(page);
  let s = await st(page);
  expect(s.night.phase).toBe('none');
  expect(s.money.current + s.sellBox.total).toBe(money0 + 30);
  expect(s.time.day === 1 ? s.sellBox.total : 0).toBe(s.time.day === 1 ? 30 : 0);
  console.log('F5 lúc thiếp đi → nạp bản', s.save.lastSaveAt?.day === 1 ? 'trước khi ngủ' : 'sau khi qua đêm', s.time.clockText);
  if (s.time.day === 1) {
    expect({ x: s.tileX, y: s.tileY }).toEqual(WAKE); // đứng chỗ bấm F ở giường
    await sleep();
  } else {
    // Đã sang ngày 2 → cho ngủ thêm một đêm để vẫn thử F5 lúc tổng kết (thùng trống, tiền không đổi).
    await call(page, 'debugSetSellBoxSlot', 0, 'rau-cai', 3);
    await call(page, 'debugSetHour', 18.5);
    await sleep();
  }
  const dayBefore = s.time.day;
  const moneyBefore = s.money.current;
  // Lần 2: F5 lúc đang xem tổng kết.
  await waitPhase(page, 'summary');
  s = await st(page);
  expect(s.money.current).toBe(moneyBefore + 30);
  expect(s.save.lastSaveAt!.reason).toBe('overnight-sleep');
  await reload(page);
  s = await st(page);
  expect(s.night.phase).toBe('none');
  expect(s.time.day).toBe(dayBefore + 1);
  expect(s.money.current).toBe(moneyBefore + 30); // không nhân đôi
  expect(s.sellBox.total).toBe(0);
  expect({ x: s.tileX, y: s.tileY }).toEqual(WAKE);
  expect(s.facing).toBe('down');
  expect(s.time.hour).toBeLessThan(6.2);
  expect(s.stamina.current).toBe(100);
  expect(s.time.phase).toBe('morning'); // lớp trời theo giờ: sáng sớm, không còn hoàng hôn như 18h
  await shot(page, 't008-f5-sau-ngu.png');
  // F5 thêm lần nữa: vẫn vậy (bản sau qua đêm không bị cộng lại).
  await reload(page);
  s = await st(page);
  expect(s.money.current).toBe(moneyBefore + 30);
  expect(s.time.day).toBe(dayBefore + 1);
});

test('F5 sau ngủ gục (lúc tổng kết): sáng hôm sau ở nhà, Sức 70, tiền thùng cộng một lần', async ({ page }) => {
  test.setTimeout(120_000);
  const money0 = (await st(page)).money.current;
  await call(page, 'debugSetSellBoxSlot', 0, 'khoai-lang', 1); // 22 quan
  await call(page, 'debugTriggerDayEnd');
  await waitPhase(page, 'summary');
  await reload(page);
  const s = await st(page);
  expect(s.time.day).toBe(2);
  expect(s.stamina.current).toBe(70);
  expect(s.money.current).toBe(money0 + 22);
  expect(s.sellBox.total).toBe(0);
  expect({ x: s.tileX, y: s.tileY }).toEqual(WAKE);
});

test('không tự lưu giữa chuỗi đêm (nhịp tự lưu rút ngắn 0.3 s vẫn đứng yên lúc tổng kết)', async ({ page }) => {
  await call(page, 'debugSetAutoSaveInterval', 0.3);
  await call(page, 'debugTriggerDayEnd');
  await waitPhase(page, 'summary');
  const c0 = (await st(page)).save.saveCount;
  await waitFrames(page, 60);
  const s = await st(page);
  expect(s.night.phase).toBe('summary');
  expect(s.save.saveCount).toBe(c0);
  // Esc lúc tổng kết không làm gì; mất focus thì lưu bị bỏ qua (đếm skipped), không ghi đè bản sau qua đêm.
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await waitFrames(page, 3);
  const s2 = await st(page);
  expect(s2.save.saveCount).toBe(c0);
  expect(s2.save.skipped).toBeGreaterThan(s.save.skipped);
});

test('tự lưu theo nhịp: hook rút ngắn 0.5 s → ghi đều; đóng gùi / thùng không ảnh hưởng', async ({ page }) => {
  await call(page, 'debugSetAutoSaveInterval', 0.5);
  const c0 = (await st(page)).save.saveCount;
  await expect.poll(async () => (await st(page)).save.saveCount, { timeout: 15_000 }).toBeGreaterThanOrEqual(c0 + 2);
  const s = await st(page);
  expect(s.save.lastSaveAt!.reason).toBe('auto');
  const saved = (await call<{ version: number; clock: { day: number } }>(page, 'debugReadSave'))!;
  expect(saved.version).toBe(1);
  expect(saved.clock.day).toBe(1);
});

test('tự lưu thật mỗi 30 giây: tắt ngang trình duyệt (không kịp lưu lúc thoát) → vào lại lệch ≤ 30 giây thật', async ({ page }) => {
  test.setTimeout(150_000);
  await teleportAndSettle(page, 20, 20);
  const s0 = await st(page);
  expect(s0.save.autoSaveIntervalSeconds).toBe(30);
  // Chờ lần tự lưu theo nhịp đầu tiên (≈ 30 giây thật kể từ lúc vào game).
  await expect
    .poll(async () => (await st(page)).save.lastSaveAt?.reason ?? null, { timeout: 60_000, intervals: [500] })
    .toBe('auto');
  const autoAt = (await st(page)).time.elapsedSeconds;
  console.log('tự lưu lần đầu lúc', autoAt.toFixed(1), 'giây đồng hồ (≈ giây thật)');
  expect(autoAt).toBeGreaterThan(25);
  // Chơi thêm ~3 giây rồi "tắt ngang": chặn mọi lần ghi save để lúc F5 game không kịp lưu.
  await teleportAndSettle(page, 22, 20);
  await expect.poll(async () => (await st(page)).time.elapsedSeconds, { timeout: 20_000 }).toBeGreaterThan(autoAt + 3);
  const before = await st(page);
  await blockUnloadSaves(page);
  await reload(page);
  const after = await st(page);
  expect(after.save.loadedFromSave).toBe(true);
  const lag = before.time.elapsedSeconds - after.save.loadedElapsedSeconds!;
  console.log('lệch giờ khi không kịp lưu lúc tắt:', lag.toFixed(2), 'giây thật');
  expect(lag).toBeGreaterThan(2); // đúng là nạp bản tự lưu, không phải bản lúc tắt
  expect(lag).toBeLessThanOrEqual(30);
  expect({ x: after.tileX, y: after.tileY }).toEqual({ x: 20, y: 20 }); // vị trí lúc tự lưu
});

for (const kind of ['json', 'version', 'missing'] as const) {
  test(`save hỏng (${kind}) → không treo, bắt đầu Ngày 1, console.warn, giữ bản hỏng ở khóa backup`, async ({ page }) => {
    // Có tiến độ để chắc là KHÔNG nạp: Ngày 3, tiền 500.
    await call(page, 'debugSetMoney', 500);
    await call(page, 'debugAdvanceDay');
    await call(page, 'debugAdvanceDay');
    const bad = await call<string>(page, 'debugCorruptSave', kind);
    await reload(page);
    const s = await st(page);
    expect(s.save.loadStatus).toBe('corrupt');
    expect(s.save.loadReason).toBeTruthy();
    expect(s.save.loadedFromSave).toBe(false);
    expect(s.time.day).toBe(1);
    expect(s.money.current).toBe(60);
    expect(s.farm.tilled).toBe(0);
    expect(warnings.some((w) => w.includes('[save] Bản lưu hỏng'))).toBe(true);
    const backup = await page.evaluate(() => window.localStorage.getItem('bph-save-corrupt'));
    expect(backup).toBe(bad);
    expect(await call(page, 'debugReadSave')).toBeNull();
    // Game vẫn chơi được + lưu lại bình thường.
    const y0 = s.footY;
    await page.keyboard.down('s');
    await expect.poll(async () => (await st(page)).footY, { timeout: 10_000 }).toBeGreaterThan(y0 + 20);
    await page.keyboard.up('s');
    expect(await call(page, 'debugSaveNow')).not.toBeNull();
    if (kind === 'json') await shot(page, 't008-save-hong-ngay1.png');
  });
}
