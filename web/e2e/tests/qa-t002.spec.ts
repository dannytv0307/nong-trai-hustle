// QA độc lập T-002 — các ca rìa: ranh giới tầm với, click khi đang đi/xoay, click dồn dập, giữ chuột rồi
// thả ngoài canvas, mất focus khi giữ chuột (mouseup bị mất), camera ở mép bản đồ, chuột phải/giữa, FPS.
// Ruộng: ô x 13..15, y 13..15. Tầm với 2.5 ô từ giữa hộp chân (người dùng chỉnh 1.5 → 2.5 sau thử T-002).
// T-002 phần 2 (D-022): cuốc 6 nhát/ô, WASD bỏ dở, hàng chờ 3 ô. Các ca ở đây không đo thời gian nên đặt
// nhát ngắn (fastTill) và chờ theo trạng thái (BUG-006); ca thông số thật nằm ở farm.spec.ts.
/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SHOTS = join(dirname(fileURLToPath(import.meta.url)), '..', 'screenshots');
const T = 64;

let errors: string[] = [];
let warnings: string[] = [];

const st = (page: Page) => page.evaluate(() => (window as any).__game.scene.getScene('Garden').debugState);

async function placeFoot(page: Page, x: number, y: number) {
  await page.evaluate(
    ([x, y]) => {
      const sc = (window as any).__game.scene.getScene('Garden');
      sc.feetBody.reset(x, y);
      sc.prevFootX = x;
      sc.prevFootY = y;
    },
    [x, y],
  );
}

async function settle(page: Page) {
  let prev = '';
  for (let i = 0; i < 100; i++) {
    const v = JSON.stringify((await st(page)).view);
    if (v === prev) return;
    prev = v;
    await page.waitForTimeout(120);
  }
}

/** Chờ game chạy thêm `n` frame (theo vòng lặp game, không theo giờ thật — BUG-006). */
async function waitFrames(page: Page, n: number) {
  const start = await page.evaluate(() => (window as any).__game.loop.frame);
  await page.waitForFunction((target) => (window as any).__game.loop.frame >= target, start + n, { timeout: 15_000 });
}

/** Nhát cuốc ngắn (mặc định 6 × 0.15 s ≈ 0.9 s/ô) — chỉ cho test. */
async function fastTill(page: Page, strikeSeconds = 0.15) {
  await page.evaluate((sec) => (window as any).__game.scene.getScene('Garden').debugSetTillTuning({ strikeSeconds: sec }), strikeSeconds);
}

const tilledOf = async (page: Page) => (await st(page)).farm.tilled as number;

async function tp(page: Page, tx: number, ty: number) {
  await placeFoot(page, tx * T + T / 2, ty * T + T / 2);
  await settle(page);
}

async function tileToPage(page: Page, tx: number, ty: number, fx = 0.5, fy = 0.5) {
  const g = await page.evaluate(
    ([x, y, fx, fy]) => {
      const cam = (window as any).__game.scene.getScene('Garden').cameras.main;
      return { x: cam.x + ((x + fx) * 64 - cam.worldView.x) * cam.zoom, y: cam.y + ((y + fy) * 64 - cam.worldView.y) * cam.zoom };
    },
    [tx, ty, fx, fy],
  );
  const box = (await page.locator('canvas').boundingBox())!;
  return { x: box.x + (g.x * box.width) / 1920, y: box.y + (g.y * box.height) / 1080 };
}

/** Ô thế giới dưới toạ độ trang — tính độc lập từ worldView (không qua hàm của game). */
async function pageToTile(page: Page, px: number, py: number) {
  const box = (await page.locator('canvas').boundingBox())!;
  const s = await st(page);
  const gx = ((px - box.x) * 1920) / box.width;
  const gy = ((py - box.y) * 1080) / box.height;
  return { x: Math.floor((s.view.x + gx / s.zoom) / T), y: Math.floor((s.view.y + gy / s.zoom) / T) };
}

const highlightInfo = (page: Page) =>
  page.evaluate(() => {
    const h = (window as any).__game.scene.getScene('Garden').highlight;
    return { visible: h.visible, x: h.x, y: h.y, color: h.strokeColor, width: h.lineWidth, alpha: h.strokeAlpha };
  });

test.beforeEach(async ({ page }) => {
  errors = [];
  warnings = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
    if (m.type() === 'warning') warnings.push(m.text());
  });
  page.on('pageerror', (e) => errors.push('pageerror ' + e.message));
  page.on('response', (r) => {
    if (r.status() >= 400) errors.push(`HTTP ${r.status()} ${r.url()}`);
  });
  await page.goto('/');
  await page.waitForFunction(() => (window as any).__game?.scene?.getScene('Garden')?.debugState?.gardenReady === true, null, { timeout: 30_000 });
  await fastTill(page);
  mkdirSync(SHOTS, { recursive: true });
});

test.afterEach(() => {
  console.log('warnings:', warnings);
  expect(errors, errors.join('\n')).toEqual([]);
});

test('A1 ranh giới tầm với 2.5 ô: ngay trong / ngay ngoài (2.484 / 2.516 ô), ngang và chéo; viền đúng màu', async ({ page }) => {
  const R = 2.5 * T;
  const tile = { x: 14, y: 14 };
  const cx = tile.x * T + 32;
  const cy = tile.y * T + 32;
  const results: any[] = [];
  for (const [ang, label] of [
    [0, 'ngang trái'],
    [Math.PI / 2, 'dọc trên'],
    [Math.PI / 4, 'chéo'],
  ] as [number, string][]) {
    for (const d of [R - 1, R + 1]) {
      await placeFoot(page, cx - Math.cos(ang) * d, cy - Math.sin(ang) * d);
      await settle(page);
      const p = await tileToPage(page, tile.x, tile.y);
      await page.mouse.move(p.x, p.y);
      await expect.poll(async () => (await st(page)).hover).toMatchObject({ x: 14, y: 14, inReach: d < R });
      await waitFrames(page, 2);
      const s = await st(page);
      const h = await highlightInfo(page);
      results.push({ label, d: d / T, hover: s.hover, h });
      expect(s.hover).toMatchObject({ x: 14, y: 14, inReach: d < R });
      expect(h.visible).toBe(true);
      // Viền lùi vào trong ô (không lấn sang ô bên) — góc trên-trái vẫn thuộc ô 14.
      expect(Math.floor(h.x / T)).toBe(14);
      expect(Math.floor(h.y / T)).toBe(14);
    }
  }
  // Màu: trong tầm khác ngoài tầm.
  const inC = results.filter((r) => r.hover.inReach).map((r) => r.h.color);
  const outC = results.filter((r) => !r.hover.inReach).map((r) => r.h.color);
  expect(new Set(inC).size).toBe(1);
  expect(new Set(outC).size).toBe(1);
  expect(inC[0]).not.toBe(outC[0]);
  console.log(JSON.stringify(results.map((r) => [r.label, r.d.toFixed(3), r.hover.inReach, r.h.color.toString(16), r.h.width])));

  // Đứng giữa ô (12,12): (14,13) chéo 2.24 ô và (14,12) cách 2 trong tầm; góc chéo (14,14) 2.83 ô và (15,12) cách 3 ngoài tầm.
  await tp(page, 12, 12);
  for (const [tx, ty, want] of [
    [13, 13, true],
    [14, 13, true],
    [13, 14, true],
    [14, 12, true],
    [14, 14, false],
    [15, 12, false],
  ] as [number, number, boolean][]) {
    const p = await tileToPage(page, tx, ty);
    await page.mouse.move(p.x, p.y);
    await expect.poll(async () => (await st(page)).hover).toMatchObject({ x: tx, y: ty, inReach: want });
  }
  // Ngay mép ô (pixel sát biên trong): vẫn đúng ô.
  const pe = await tileToPage(page, 13, 13, 0.02, 0.98);
  await page.mouse.move(pe.x, pe.y);
  await waitFrames(page, 3);
  const indep = await pageToTile(page, pe.x, pe.y);
  expect((await st(page)).hover).toMatchObject(indep);
  await page.screenshot({ path: join(SHOTS, 'qa-t002-reach-diag.png') });
});

test('A2 click khi đang đi (giữ S): không cuốc — cuốc là việc đứng yên (D-022); dừng lại click thì cuốc', async ({ page }) => {
  await tp(page, 12, 12);
  await page.keyboard.down('KeyS');
  await expect.poll(async () => (await st(page)).moving).toBe(true);
  const s0 = await st(page);
  const ty = Math.floor(s0.footY / T);
  const p = await tileToPage(page, 13, ty);
  await page.mouse.click(p.x, p.y);
  await waitFrames(page, 10);
  const s1 = await st(page);
  console.log('khi click', s0.footY, 'sau', s1.footY, s1.action);
  expect(s1.action.busy).toBe(false);
  expect(s1.juice.tills).toBe(0);
  expect(s1.footY).toBeGreaterThan(s0.footY); // vẫn đi tiếp
  await page.keyboard.up('KeyS');
  await expect.poll(async () => (await st(page)).moving).toBe(false);
  // Đứng yên rồi click ô ruộng trong tầm → cuốc.
  const s2 = await st(page);
  const ty2 = Math.min(15, Math.max(13, Math.floor(s2.footY / T)));
  const q = await tileToPage(page, 13, ty2);
  await page.mouse.click(q.x, q.y);
  await expect.poll(async () => (await st(page)).action.busy, { intervals: [10] }).toBe(true);
  await expect.poll(async () => (await st(page)).till.finishes, { timeout: 15_000 }).toBe(1);
});

test('A3 click dồn dập 9 ô trong ~0.2 giây từ giữa ruộng', async ({ page }) => {
  // Nhát rất dài để cả chuỗi click lọt trong lúc ô đầu còn đang cuốc (không phụ thuộc tốc độ máy test).
  await fastTill(page, 30);
  await tp(page, 14, 14);
  const order: [number, number][] = [];
  for (let y = 13; y <= 15; y++) for (let x = 13; x <= 15; x++) order.push([x, y]);
  const pts = [];
  for (const [x, y] of order) pts.push(await tileToPage(page, x, y));
  for (const p of pts) {
    await page.mouse.move(p.x, p.y);
    await page.mouse.down();
    await page.mouse.up();
  }
  // D-022: đang cuốc chỉ nhớ thêm tillQueueMax (3) ô → chuỗi click này nhận đúng 1 + 3 = 4 ô.
  const q = await st(page);
  expect(q.action.current).toEqual({ x: 13, y: 13 });
  expect(q.action.queued).toBe(3);
  await fastTill(page, 0.15);
  await expect.poll(() => tilledOf(page), { timeout: 30_000 }).toBe(4);
  await expect.poll(async () => (await st(page)).action.busy, { timeout: 5_000 }).toBe(false);
  await waitFrames(page, 30);
  const s = await st(page);
  console.log('click 9 ô nhanh → đã cuốc', s.farm.tilled, 'tills', s.juice.tills, s.action);
  await page.screenshot({ path: join(SHOTS, 'qa-t002-rapid-clicks.png') });
  expect(s.farm.tilled).toBe(4);
  expect(s.till.finishes).toBe(4);
  expect(s.juice.tills).toBe(4 * 6);
});

test.describe('khung có viền đen (để thả chuột ngoài canvas)', () => {
  test.use({ viewport: { width: 1920, height: 1300 } });
  test('A4 giữ chuột rồi rê ra ngoài canvas, thả ngoài: không kẹt "đang giữ"', async ({ page }) => {
    const box = (await page.locator('canvas').boundingBox())!;
    console.log('canvas', box);
    await tp(page, 14, 12); // trên hàng y=13
    const p = await tileToPage(page, 13, 13);
    await page.mouse.move(p.x, p.y);
    await page.mouse.down();
    await expect.poll(async () => (await st(page)).action.busy, { intervals: [10] }).toBe(true);
    // rê ra viền đen phía dưới canvas
    await page.mouse.move(p.x, box.y + box.height + 60, { steps: 5 });
    await expect.poll(async () => (await st(page)).hover).toBeNull();
    const out = await st(page);
    const hOut = await highlightInfo(page);
    await page.mouse.up();
    await expect.poll(async () => (await st(page)).action.busy, { timeout: 15_000 }).toBe(false);
    const held = await page.evaluate(() => (window as any).__game.scene.getScene('Garden').controls.isPrimaryDown());
    console.log('ngoài canvas hover', out.hover, 'viền hiện', hOut.visible, 'sau thả isPrimaryDown', held);
    expect(held).toBe(false);
    expect(hOut.visible).toBe(false);
    const before = (await st(page)).farm.tilled;
    // quay lại rê qua ô chưa cuốc, KHÔNG bấm
    const q = await tileToPage(page, 15, 13);
    await page.mouse.move(q.x, q.y, { steps: 8 });
    await waitFrames(page, 60);
    const after = await st(page);
    expect(after.farm.tilled).toBe(before);
    expect(after.action.busy).toBe(false);
  });
});

test('A5 mất focus khi đang giữ chuột (mouseup rơi ở cửa sổ khác): không tự cuốc khi quay lại', async ({ page }) => {
  await tp(page, 14, 12);
  const p = await tileToPage(page, 13, 13);
  await page.mouse.move(p.x, p.y);
  await page.mouse.down();
  await expect.poll(async () => (await st(page)).action.busy, { intervals: [10] }).toBe(true); // đang cuốc ô (13,13)
  // Alt+Tab: blur + ẩn, mouseup đến cửa sổ khác → game không nhận.
  await page.evaluate(() => {
    const stop = (e: Event) => e.stopImmediatePropagation();
    (window as any).__swallow = stop;
    window.addEventListener('mouseup', stop, true);
    window.addEventListener('pointerup', stop, true);
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
    window.dispatchEvent(new Event('blur'));
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.mouse.up();
  console.log('ngay sau mouseup bị nuốt, isPrimaryDown =', await page.evaluate(() => (window as any).__game.scene.getScene('Garden').controls.isPrimaryDown()));
  await page.evaluate(() => {
    window.removeEventListener('mouseup', (window as any).__swallow, true);
    window.removeEventListener('pointerup', (window as any).__swallow, true);
  });
  await page.waitForTimeout(800);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' });
    document.dispatchEvent(new Event('visibilitychange'));
    window.dispatchEvent(new Event('focus'));
  });
  // T-005: mất focus / ẩn tab → game tự Tạm dừng (pauseOnFocusLost); quay lại vẫn dừng → Esc để chơi tiếp.
  await expect.poll(() => page.evaluate(() => (window as any).__game.scene.getScene('Garden').debugState.pause.menuOpen)).toBe(true);
  await page.keyboard.press('Escape');
  await expect.poll(() => page.evaluate(() => (window as any).__game.scene.getScene('Garden').debugState.pause.menuOpen)).toBe(false);
  // Ô đang cuốc dở lúc mất focus thì cuốc nốt (mất focus không phải bỏ dở) — chờ xong rồi mới đo.
  await expect.poll(async () => (await st(page)).action.busy, { timeout: 15_000 }).toBe(false);
  const before = await st(page);
  // Người chơi quay lại, chỉ RÊ chuột (không bấm) qua 2 ô chưa cuốc.
  const q = await tileToPage(page, 15, 13);
  await page.mouse.move(q.x, q.y, { steps: 10 });
  await waitFrames(page, 70);
  const after = await st(page);
  const held = await page.evaluate(() => (window as any).__game.scene.getScene('Garden').controls.isPrimaryDown());
  console.log('trước', before.farm.tilled, 'sau khi chỉ rê', after.farm.tilled, 'isPrimaryDown', held);
  await page.screenshot({ path: join(SHOTS, 'qa-t002-blur-stuck.png') });
  expect(held, 'chuột trái bị kẹt ở trạng thái đang giữ').toBe(false);
  expect(after.farm.tilled).toBe(before.farm.tilled);
});

test('A6 click khi đang xoay người + click ô đã cuốc không làm gì', async ({ page }) => {
  await tp(page, 14, 12);
  // Quay người: bấm A thật ngắn (bắt đầu khung xoay) rồi click ô bên dưới phải ngay.
  const p = await tileToPage(page, 14, 13);
  await page.mouse.move(p.x, p.y);
  await page.keyboard.down('KeyA');
  await page.waitForTimeout(30);
  await page.keyboard.up('KeyA');
  const t0 = await st(page);
  await page.mouse.down();
  await page.mouse.up();
  await expect.poll(() => tilledOf(page), { timeout: 15_000 }).toBe(1);
  await expect.poll(async () => (await st(page)).action.busy, { timeout: 5_000 }).toBe(false);
  const s = await st(page);
  console.log('lúc click turnFrame', t0.turnFrame, 'facing', t0.facing, '→ sau', s.facing, s.farm.tilled);
  expect(s.farm.tilled).toBe(1);
  // ô (15,13) so với chân (đã lệch trái chút): dx ≈ 1 ô, dy ≈ 1 ô → right hoặc down
  expect(s.facing).toBe('down');
  const tills = s.juice.tills;
  const p2 = await tileToPage(page, 14, 13);
  await page.mouse.click(p2.x, p2.y);
  await waitFrames(page, 40);
  const s2 = await st(page);
  expect(s2.juice.tills).toBe(tills);
  expect(s2.action.busy).toBe(false);
});

test('A7 viền đúng ô khi camera đang trượt và khi ở mép bản đồ', async ({ page }) => {
  // camera đang trượt theo nhân vật đi bộ (giữ D). (Dịch chớp nhoáng xa thì viền trễ 1 frame camera — chỉ debug mới gặp.)
  await tp(page, 22, 20);
  await page.keyboard.down('KeyD');
  await page.waitForTimeout(300);
  const mism: any[] = [];
  for (let i = 0; i < 12; i++) {
    const box = (await page.locator('canvas').boundingBox())!;
    const px = box.x + box.width * 0.6;
    const py = box.y + box.height * 0.4;
    await page.mouse.move(px, py);
    // đọc hover + view trong cùng một lần evaluate. Cho lệch tối đa 1 ô: hover tính trong update() trước khi camera
    // bám theo (preRender) → trễ 1 frame camera (~4px), ở sát mép ô đôi khi ra ô kề — không thấy bằng mắt.
    const r = await page.evaluate(
      ([gx, gy]) => {
        const sc = (window as any).__game.scene.getScene('Garden');
        const s = sc.debugState;
        const cam = sc.cameras.main;
        return { hover: s.hover, tx: Math.floor((cam.worldView.x + gx / cam.zoom) / 64), ty: Math.floor((cam.worldView.y + gy / cam.zoom) / 64) };
      },
      [1920 * 0.6, 1080 * 0.4],
    );
    if (r.hover && (Math.abs(r.hover.x - r.tx) > 1 || Math.abs(r.hover.y - r.ty) > 1)) mism.push(r);
    await page.waitForTimeout(50);
  }
  await page.keyboard.up('KeyD');
  console.log('lệch khi camera trượt:', mism);
  expect(mism).toEqual([]);
  // mép bản đồ: góc trên trái
  await tp(page, 1, 1);
  const s = await st(page);
  expect(s.view.x).toBe(0);
  expect(s.view.y).toBe(0);
  for (const [fx, fy] of [
    [0.01, 0.01],
    [0.5, 0.5],
    [0.99, 0.99],
  ]) {
    const box = (await page.locator('canvas').boundingBox())!;
    const px = box.x + box.width * fx;
    const py = box.y + box.height * fy;
    await page.mouse.move(px, py);
    await page.waitForTimeout(80);
    const h = (await st(page)).hover;
    const ind = await pageToTile(page, px, py);
    expect(h).toMatchObject(ind);
  }
  const box = (await page.locator('canvas').boundingBox())!;
  await page.mouse.move(box.x + 5, box.y + 5);
  await page.waitForTimeout(80);
  await page.screenshot({ path: join(SHOTS, 'qa-t002-map-edge.png') });
});

test('A8 cuốc cả 9 ô rồi tiếp tục giữ chuột rê lung tung; FPS khi bụi; chuột phải + giữa', async ({ page }) => {
  await tp(page, 14, 14);
  const fpsSamples: number[] = [];
  const order: [number, number][] = [
    [13, 13], [14, 13], [15, 13], [15, 14], [14, 14], [13, 14], [13, 15], [14, 15], [15, 15],
  ];
  const first = await tileToPage(page, 13, 13);
  await page.mouse.move(first.x, first.y);
  await page.mouse.down();
  for (const [x, y] of order) {
    const p = await tileToPage(page, x, y);
    await page.mouse.move(p.x, p.y, { steps: 3 });
    // giữ trên ô tới khi cuốc xong ô đó (D-022: rê chỉ xếp hàng, nên chờ từng ô xong mới rê tiếp)
    await expect
      .poll(async () => (await st(page)).farm.plots.find((q: any) => q.x === x && q.y === y).soil, { timeout: 15_000 })
      .toBe('tilled');
    fpsSamples.push(await page.evaluate(() => (window as any).__game.loop.actualFps));
  }
  const s9 = await st(page);
  expect(s9.farm.tilled).toBe(9);
  await page.screenshot({ path: join(SHOTS, 'qa-t002-all-tilled.png') });
  // vẫn giữ chuột, rê vòng quanh 3 giây
  for (let i = 0; i < 6; i++) {
    const p = await tileToPage(page, 13 + (i % 3), 13 + ((i * 2) % 3));
    await page.mouse.move(p.x, p.y, { steps: 6 });
    await page.waitForTimeout(400);
  }
  await page.mouse.up();
  const s = await st(page);
  expect(s.till.finishes).toBe(9);
  expect(s.juice.tills).toBe(9 * 6);
  expect(s.action.busy).toBe(false);
  console.log('fps lúc cuốc', fpsSamples.map((f) => f.toFixed(1)).join(' '));

  // chuột giữa và chuột phải lên ô (reset bằng trang mới khó → dùng ô cỏ & kiểm không động tác)
  // T-008: game tự lưu — xóa save (và ngừng ghi tới lúc tải lại) để trang mới bắt đầu Ngày 1 sạch, ruộng chưa cuốc.
  await page.evaluate(() => (window as any).__game.scene.getScene('Garden').debugClearSave());
  await page.reload();
  await page.waitForFunction(() => (window as any).__game?.scene?.getScene('Garden')?.debugState?.gardenReady === true);
  await fastTill(page);
  await tp(page, 14, 14);
  await page.evaluate(() => {
    (window as any).__ctx = 0;
    window.addEventListener('contextmenu', (e) => {
      if (!e.defaultPrevented) (window as any).__ctx++;
    });
  });
  const p = await tileToPage(page, 13, 13);
  await page.mouse.click(p.x, p.y, { button: 'middle' });
  await page.mouse.click(p.x, p.y, { button: 'right' });
  // giữ chuột phải rồi rê
  await page.mouse.down({ button: 'right' });
  const p2 = await tileToPage(page, 15, 13);
  await page.mouse.move(p2.x, p2.y, { steps: 5 });
  await page.mouse.up({ button: 'right' });
  await waitFrames(page, 40);
  const r = await st(page);
  const ctx = await page.evaluate(() => (window as any).__ctx);
  console.log('chuột giữa/phải → tilled', r.farm.tilled, 'menu không chặn', ctx);
  expect(r.farm.tilled).toBe(0);
  expect(ctx).toBe(0);
});

test('A9 cuốc không rung màn (góp ý T-002: tillScreenShake = false)', async ({ page }) => {
  await tp(page, 12, 14);
  const p = await tileToPage(page, 13, 14);
  await page.mouse.move(p.x, p.y);
  await expect.poll(async () => (await st(page)).hover).toMatchObject({ x: 13, y: 14, inReach: true });
  await page.evaluate(() => {
    const w = window as any;
    const sc = w.__game.scene.getScene('Garden');
    const cam = sc.cameras.main;
    w.__shake = [];
    w.__shakeFn = () => {
      const sh = cam.shakeEffect;
      if (sh.isRunning || sh._offsetX !== 0 || sh._offsetY !== 0) w.__shake.push({ ox: sh._offsetX, oy: sh._offsetY });
    };
    sc.events.on('render', w.__shakeFn);
  });
  await page.mouse.down();
  await page.mouse.up();
  await expect.poll(async () => (await st(page)).till.finishes, { timeout: 15_000 }).toBe(1);
  await waitFrames(page, 20); // thêm ~0.3 giây game — dài hơn cả rung nhẹ cũ (0.1 giây)
  const sh = await page.evaluate(() => (window as any).__shake);
  const s = await st(page);
  console.log('shake frames', sh.length, 'shakes', s.juice.shakes);
  expect(sh).toEqual([]);
  expect(s.juice.shakes).toBe(0);
});

test.describe('1366x768', () => {
  test.use({ viewport: { width: 1366, height: 768 } });
  test('A10 1366×768: viền đúng ô dưới con trỏ, cuốc được; ảnh lúc mới vào (chưa rê chuột)', async ({ page }) => {
    await waitFrames(page, 30);
    const s0 = await st(page);
    console.log('mới vào, chưa rê chuột: hover =', s0.hover);
    await page.screenshot({ path: join(SHOTS, 'qa-t002-load-no-mouse.png') });
    await tp(page, 12, 14);
    const p = await tileToPage(page, 13, 14, 0.9, 0.1);
    await page.mouse.move(p.x, p.y);
    await expect.poll(async () => (await st(page)).hover).toMatchObject({ x: 13, y: 14, inReach: true });
    await page.mouse.down();
    await page.mouse.up();
    await expect.poll(() => tilledOf(page), { timeout: 15_000 }).toBe(1);
    const q = await tileToPage(page, 15, 14);
    await page.mouse.move(q.x, q.y);
    await expect.poll(async () => (await st(page)).hover).toMatchObject({ x: 15, y: 14, inReach: false });
    await page.screenshot({ path: join(SHOTS, 'qa-t002-1366-gray.png') });
  });
});
