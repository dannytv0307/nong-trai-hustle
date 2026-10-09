// QA độc lập cho T-001 (qa-tester). Bổ sung các ca game-dev có thể bỏ sót:
// tốc độ chéo, trượt qua mối nối tường nhà/góc ao/cây, vào nhà tới giường, hạ chân khi thả phím,
// hoạt ảnh (nghiêng, thở, lật, bụi, nhịp bước khớp tốc độ), đi lung tung 60 giây, 1366×768, ẩn/hiện tab,
// phím "kẹt" khi mất focus. Đo theo TRẠNG THÁI từng frame (headless ~20 FPS).
import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SHOTS = join(dirname(fileURLToPath(import.meta.url)), '..', 'screenshots');
const TILE = 64;

interface S {
  gardenReady: boolean;
  tileX: number;
  tileY: number;
  footX: number;
  footY: number;
  moving: boolean;
  facing: string;
  bobOffset: number;
  rotationDeg: number;
  steps: number;
  view: { x: number; y: number; w: number; h: number };
  zoom: number;
  mapPx: { w: number; h: number };
}

async function st(page: Page): Promise<S> {
  return page.evaluate(() => {
    const g = (window as any).__game;
    return g.scene.getScene('Garden').debugState;
  });
}

async function tp(page: Page, x: number, y: number) {
  await page.evaluate(([a, b]) => {
    const sc = (window as any).__game.scene.getScene('Garden');
    sc.debugTeleport(a, b);
  }, [x, y]);
  // chờ camera
  await page.waitForTimeout(300);
}

/** Đặt chân ở toạ độ px tuỳ ý (không chỉ tâm ô). */
async function tpPx(page: Page, x: number, y: number) {
  await page.evaluate(([a, b]) => {
    const sc = (window as any).__game.scene.getScene('Garden');
    sc.feetBody.reset(a, b);
    sc.prevFootX = a;
    sc.prevFootY = b;
  }, [x, y]);
  await page.waitForTimeout(150);
}

/** Bắt đầu ghi mỗi frame: delta, vị trí chân, tư thế sprite. */
async function startRec(page: Page) {
  await page.evaluate(() => {
    const g = (window as any).__game;
    const sc = g.scene.getScene('Garden');
    const w = window as any;
    w.__rec = [];
    if (w.__recFn) sc.events.off('postupdate', w.__recFn);
    w.__recFn = () => {
      const hero = sc.hero;
      const s = sc.debugState;
      w.__rec.push({
        d: g.loop.delta,
        fx: s.footX,
        fy: s.footY,
        moving: s.moving,
        off: s.bobOffset,
        rot: s.rotationDeg,
        sx: hero.scaleX,
        sy: hero.scaleY,
        steps: s.steps,
        dust: sc.dust.filter((p: any) => p.visible).length,
        heroY: hero.y,
        body: sc.feetBody.bottom,
      });
    };
    sc.events.on('postupdate', w.__recFn);
  });
}
async function waitFrames(page: Page, n: number) {
  await page.waitForFunction((k) => (window as any).__rec.length >= k, n, { timeout: 120000, polling: 30 });
}
async function stopRec(page: Page): Promise<any[]> {
  return page.evaluate(() => {
    const w = window as any;
    const sc = w.__game.scene.getScene('Garden');
    sc.events.off('postupdate', w.__recFn);
    w.__recFn = null;
    return w.__rec;
  });
}

/** Hộp chân có chồng lên vật cản tĩnh nào > tol px không. */
async function overlapsSolid(page: Page, tol = 1): Promise<string | null> {
  return page.evaluate((t) => {
    const sc = (window as any).__game.scene.getScene('Garden');
    const b = sc.feetBody;
    for (const s of sc.physics.world.staticBodies.entries) {
      const ox = Math.min(b.right, s.right) - Math.max(b.left, s.left);
      const oy = Math.min(b.bottom, s.bottom) - Math.max(b.top, s.top);
      if (ox > t && oy > t) return `foot(${b.left.toFixed(1)},${b.top.toFixed(1)}) ∩ solid(${s.left},${s.top},${s.width}x${s.height}) ox=${ox.toFixed(1)} oy=${oy.toFixed(1)}`;
    }
    return null;
  }, tol);
}

async function holdUntil(page: Page, keys: string[], cond: (s: S) => boolean, timeout = 15000): Promise<S> {
  for (const k of keys) await page.keyboard.down(k);
  const t0 = Date.now();
  let s = await st(page);
  while (!cond(s) && Date.now() - t0 < timeout) {
    await page.waitForTimeout(30);
    s = await st(page);
  }
  for (const k of keys) await page.keyboard.up(k);
  return s;
}

const KEYCODES: Record<string, number> = { KeyW: 87, KeyA: 65, KeyS: 83, KeyD: 68 };
/** Giữ phím tới khi điều kiện (biểu thức JS trên debugState `s`) đúng — thả phím NGAY trong frame game đó. */
async function holdUntilFrame(page: Page, keys: string[], cond: string, maxFrames = 200): Promise<S> {
  await page.evaluate(([ks, c, mf]) => {
    const w = window as any;
    const sc = w.__game.scene.getScene('Garden');
    const f = new Function('s', `return (${c});`) as (s: any) => boolean;
    let n = 0;
    w.__holdDone = false;
    const fn = () => {
      n++;
      if (f(sc.debugState) || n > (mf as number)) {
        for (const k of ks as string[]) window.dispatchEvent(new KeyboardEvent('keyup', { code: k, key: k.slice(3).toLowerCase(), keyCode: ({ KeyW: 87, KeyA: 65, KeyS: 83, KeyD: 68 } as any)[k], bubbles: true }));
        sc.events.off('postupdate', fn);
        w.__holdDone = true;
      }
    };
    sc.events.on('postupdate', fn);
  }, [keys, cond, maxFrames] as const);
  for (const k of keys) await page.keyboard.down(k);
  await page.waitForFunction(() => (window as any).__holdDone, null, { timeout: 120000, polling: 30 });
  for (const k of keys) await page.keyboard.up(k);
  await page.waitForTimeout(100);
  void KEYCODES;
  return st(page);
}

let errors: string[] = [];
let badReq: string[] = [];

test.beforeEach(async ({ page }) => {
  errors = [];
  badReq = [];
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') errors.push(`[${m.type()}] ${m.text()} @ ${m.location().url}`);
  });
  page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`));
  page.on('response', (r) => {
    if (r.status() >= 400) badReq.push(`${r.status()} ${r.url()}`);
  });
  page.on('requestfailed', (r) => badReq.push(`FAILED ${r.url()} ${r.failure()?.errorText}`));
  await page.goto('/');
  await expect.poll(() => page.evaluate(() => (window as any).__game?.scene?.getScene('Garden')?.debugState?.gardenReady ?? false), { timeout: 30000 }).toBe(true);
  mkdirSync(SHOTS, { recursive: true });
});

test.afterEach(async ({}, info) => {
  if (errors.length || badReq.length) console.log(`[${info.title}] console:`, errors, 'requests:', badReq);
  expect(errors.filter((e) => e.startsWith('[pageerror]') || e.startsWith('[error]')), errors.join('\n')).toEqual([]);
});

test('Q1 đi chéo không nhanh hơn đi thẳng (đo theo frame)', async ({ page }) => {
  // Vùng trống rộng: quanh ô (28,20)
  const speeds: Record<string, number> = {};
  const combos: [string, string[]][] = [
    ['D', ['KeyD']],
    ['S', ['KeyS']],
    ['DS', ['KeyD', 'KeyS']],
    ['AW', ['KeyA', 'KeyW']],
    ['DW', ['KeyD', 'KeyW']],
  ];
  for (const [name, keys] of combos) {
    await tp(page, 28, 18);
    for (const k of keys) await page.keyboard.down(k);
    await page.waitForTimeout(250); // bỏ frame đầu
    await startRec(page);
    await page.waitForTimeout(900);
    const rec = await stopRec(page);
    for (const k of keys) await page.keyboard.up(k);
    let dist = 0;
    let time = 0;
    for (let i = 1; i < rec.length; i++) {
      dist += Math.hypot(rec[i].fx - rec[i - 1].fx, rec[i].fy - rec[i - 1].fy);
      time += rec[i].d;
    }
    speeds[name] = dist / (time / 1000) / TILE;
    expect(await overlapsSolid(page)).toBeNull();
  }
  console.log('speeds (ô/giây):', speeds);
  for (const v of Object.values(speeds)) {
    expect(v).toBeLessThan(4 * 1.08);
    expect(v).toBeGreaterThan(4 * 0.85);
  }
  expect(speeds.DS).toBeLessThan(speeds.D * 1.08);
});

test('Q2 ép chéo vào mặt ngoài tường nhà và trượt qua mối nối khối tường: không kẹt', async ({ page }) => {
  // Hộp chân 40×20. Mặt trái ngoài nhà x=320 (cột 5), mối nối khối tường ở y=256 và y=640.
  const cases: { name: string; at: [number, number]; keys: string[]; done: (s: S) => boolean }[] = [
    { name: 'mặt trái, D+W lên qua y=640', at: [300, 700], keys: ['KeyD', 'KeyW'], done: (s) => s.footY < 600 },
    { name: 'mặt trái, D+W lên qua y=256', at: [300, 300], keys: ['KeyD', 'KeyW'], done: (s) => s.footY < 230 },
    { name: 'mặt trái, D+S xuống', at: [300, 230], keys: ['KeyD', 'KeyS'], done: (s) => s.footY > 720 },
    { name: 'mặt phải, A+W lên', at: [1044, 700], keys: ['KeyA', 'KeyW'], done: (s) => s.footY < 230 },
    { name: 'mặt phải, A+S xuống', at: [1044, 230], keys: ['KeyA', 'KeyS'], done: (s) => s.footY > 720 },
  ];
  const stuck: string[] = [];
  for (const c of cases) {
    await tpPx(page, c.at[0], c.at[1]);
    await startRec(page);
    for (const k of c.keys) await page.keyboard.down(k);
    // tối đa 80 frame game (đủ ~2 lần quãng đường cần đi)
    let s = await st(page);
    for (let i = 0; i < 400 && !c.done(s); i++) {
      const n = await page.evaluate(() => (window as any).__rec.length);
      if (n > 80) break;
      await page.waitForTimeout(40);
      s = await st(page);
    }
    for (const k of c.keys) await page.keyboard.up(k);
    await stopRec(page);
    console.log(c.name, '→', s.footX.toFixed(1), s.footY.toFixed(1), c.done(s) ? 'OK' : 'KẸT');
    if (!c.done(s)) {
      stuck.push(`${c.name}: dừng ở (${s.footX.toFixed(0)}, ${s.footY.toFixed(0)})`);
      await page.screenshot({ path: join(SHOTS, `qa-t001-stuck-${stuck.length}.png`) });
    }
  }
  expect(stuck, stuck.join(' | ')).toEqual([]);
});

test('Q3 trong nhà: trượt góc trong, mép cửa; đi từ chỗ xuất phát vào nhà tới giường', async ({ page }) => {
  // từ spawn đi thẳng lên qua cửa
  const s0 = await st(page);
  let s = await holdUntilFrame(page, ['KeyW'], 's.footY < 8 * 64');
  expect(s.footY).toBeLessThan(8 * TILE);
  expect(s.footY).toBeGreaterThan(5 * TILE + 20); // chưa chạm hàng giường
  // sang trái tới trên giường (giường x 6..7, y 4)
  s = await holdUntilFrame(page, ['KeyA'], 's.footX < 7 * 64');
  expect(s.footX).toBeLessThan(7 * TILE + 1);
  // lên: phải bị giường chặn ở hàng 5
  s = await holdUntil(page, ['KeyW'], () => false, 1500);
  console.log('cạnh giường:', s.footX, s.footY, s.tileX, s.tileY);
  expect(s.tileY).toBe(5);
  expect(s.footY).toBeCloseTo(5 * TILE + 10, 0);
  await page.screenshot({ path: join(SHOTS, 'qa-t001-bed.png') });
  // ép vào góc trong trên-trái (W+A) quanh giường → không xuyên
  s = await holdUntil(page, ['KeyA', 'KeyW'], () => false, 1500);
  expect(await overlapsSolid(page)).toBeNull();
  expect(s.footX).toBeGreaterThanOrEqual(6 * TILE + 20 - 0.5);
  // ra lại cửa: trượt cạnh dưới trong (S + D) về phía cửa
  await tpPx(page, 6 * TILE + 30, 9 * TILE + 40);
  s = await holdUntil(page, ['KeyS', 'KeyD'], (x) => x.footY > 11 * TILE, 15000);
  console.log('trượt ra cửa:', s.footX, s.footY);
  expect(s.footY).toBeGreaterThan(10 * TILE); // trượt dọc tường dưới rồi lọt ra cửa
  expect(await overlapsSolid(page)).toBeNull();
  // hai mép khung cửa: đứng giữa mép cửa trái, đi lên chéo vào khung
  await tpPx(page, 10 * TILE + 10, 11 * TILE + 30); // hộp chân lệch nửa vào mép cửa trái
  s = await holdUntil(page, ['KeyW'], (x) => x.footY < 9 * TILE, 4000);
  console.log('mép cửa trái, giữ W:', s.footX, s.footY);
  expect(await overlapsSolid(page)).toBeNull();
  void s0;
});

test('Q4 trượt quanh ao và gốc cây không kẹt', async ({ page }) => {
  // Ao x 31..37, y 7..11. Ép cạnh dưới ao (W) và đi D từ cột 30 tới 39.
  await tpPx(page, 30 * TILE + 32, 12 * TILE + 20);
  let s = await holdUntil(page, ['KeyW', 'KeyD'], (x) => x.footX > 39 * TILE, 15000);
  expect(s.footX).toBeGreaterThan(38 * TILE);
  // Ép cạnh phải ao (A) từ dưới lên (W)
  await tpPx(page, 38 * TILE + 30, 12 * TILE + 30);
  s = await holdUntil(page, ['KeyA', 'KeyW'], (x) => x.footY < 6 * TILE, 15000);
  expect(s.footY).toBeLessThan(7 * TILE);
  expect(await overlapsSolid(page)).toBeNull();
  // Cây (24,19): đi thẳng D vào gốc từ trái — phải dừng; lệch tâm 10px thì giữ D+S trượt qua
  await tpPx(page, 22 * TILE + 32, 20 * TILE - 12 - 11);
  s = await holdUntil(page, ['KeyD'], () => false, 1500);
  const blockedX = s.footX;
  console.log('chặn bởi gốc cây tại', blockedX);
  expect(blockedX).toBeLessThan(24 * TILE + 32);
  s = await holdUntil(page, ['KeyD', 'KeyS'], (x) => x.footX > 26 * TILE, 8000);
  expect(s.footX).toBeGreaterThan(25 * TILE);
  expect(await overlapsSolid(page)).toBeNull();
});

test('Q5 thả phím giữa bước: hạ chân về đứng, không đứng khựng giữa không trung; có thở', async ({ page }) => {
  await tp(page, 28, 18);
  await page.keyboard.down('KeyD');
  await expect.poll(async () => (await st(page)).bobOffset, { timeout: 5000, intervals: [10] }).toBeLessThan(-4);
  await page.evaluate(() => {
    window.addEventListener('keyup', () => { (window as any).__upAt = (window as any).__rec.length; }, { once: true });
  });
  await startRec(page);
  await page.keyboard.up('KeyD');
  await waitFrames(page, 25);
  const rec = await stopRec(page);
  const upAt = await page.evaluate(() => (window as any).__upAt);
  const first = rec[Math.min(upAt, rec.length - 1)];
  const moveFrames = rec.slice(upAt + 1).filter((r, i, a) => i > 0 && Math.abs(r.fx - a[i - 1].fx) > 0.01).length;
  console.log('frame sau keyup còn di chuyển:', moveFrames, 'offY lúc thả', first.off);
  expect(moveFrames).toBeLessThanOrEqual(1);
  const last = rec[rec.length - 1];
  console.log('lúc thả off=', first.off, 'cuối off=', last.off, 'rot=', last.rot, 'sx', last.sx, 'sy', last.sy);
  expect(Math.abs(last.off)).toBeLessThan(0.05);
  expect(Math.abs(last.rot)).toBeLessThan(0.2);
  // nhân vật dừng ngay (không trôi quá 1 frame bước)
  // chân sprite không bao giờ dưới chân hộp (không lún) và không lơ lửng khi đứng
  expect(Math.abs(last.heroY - last.body)).toBeLessThan(0.1);
  await page.screenshot({ path: join(SHOTS, 'qa-t001-released.png') });

  // thở: đứng yên 2.5s, scaleY dao động trong ±2% và có thay đổi
  await startRec(page);
  await waitFrames(page, 60);
  const idle = await stopRec(page);
  const sys = idle.map((r) => r.sy);
  const min = Math.min(...sys);
  const max = Math.max(...sys);
  console.log('thở scaleY', min, max);
  expect(max - min).toBeGreaterThan(0.01);
  expect(max).toBeLessThan(1.021);
  expect(min).toBeGreaterThan(0.979);
  expect(idle.every((r) => Math.abs(r.off) < 0.05)).toBe(true);
});

test('Q6 hoạt ảnh khi đi: nghiêng theo hướng, lật khi đổi hướng, bụi, nhịp bước khớp quãng đường', async ({ page }) => {
  await tp(page, 20, 22);
  await page.keyboard.down('KeyD');
  await page.waitForTimeout(300);
  await startRec(page);
  await waitFrames(page, 50);
  let rec = await stopRec(page);
  await page.keyboard.up('KeyD');
  const dist = Math.hypot(rec[rec.length - 1].fx - rec[0].fx, rec[rec.length - 1].fy - rec[0].fy);
  const steps = rec[rec.length - 1].steps - rec[0].steps;
  const stride = dist / steps / TILE;
  const maxRot = Math.max(...rec.map((r) => r.rot));
  const minOff = Math.min(...rec.map((r) => r.off));
  const maxDust = Math.max(...rec.map((r) => r.dust));
  const sy = rec.map((r) => r.sy);
  console.log({ stride, steps, maxRot, minOff, maxDust, syMin: Math.min(...sy), syMax: Math.max(...sy) });
  expect(stride).toBeGreaterThan(0.7);
  expect(stride).toBeLessThan(0.95); // sải 0.8 ô = walkSpeed/walkBobRate
  expect(maxRot).toBeGreaterThan(3); // nghiêng phải
  expect(minOff).toBeLessThan(-4.5);
  expect(minOff).toBeGreaterThan(-6.01);
  expect(maxDust).toBeGreaterThan(0);
  expect(Math.max(...sy) - Math.min(...sy)).toBeGreaterThan(0.05); // co giãn đặt chân

  // đi trái → nghiêng âm; đổi hướng có scaleX co lại
  await startRec(page);
  await page.keyboard.down('KeyA');
  await waitFrames(page, 30);
  rec = await stopRec(page);
  await page.keyboard.up('KeyA');
  const minSx = Math.min(...rec.map((r: any) => r.sx));
  const minRot = Math.min(...rec.map((r) => r.rot));
  console.log({ turnMinScaleX: minSx, minRot, facing: (await st(page)).facing });
  // Cú lật chỉ 0.12 s: ở FPS headless rất thấp có thể lọt giữa 2 frame → chỉ yêu cầu có co ngang.
  expect(minSx).toBeLessThan(1);
  expect(minRot).toBeLessThan(-3);
  expect((await st(page)).facing).toBe('left');

  // ép tường: không nảy tại chỗ (rào dưới)
  await tp(page, 20, 30);
  await page.keyboard.down('KeyS');
  await page.waitForTimeout(500);
  await startRec(page);
  await waitFrames(page, 20);
  rec = await stopRec(page);
  await page.keyboard.up('KeyS');
  expect(rec.every((r) => !r.moving)).toBe(true);
  expect(Math.min(...rec.map((r) => r.off))).toBeGreaterThan(-0.3);
});

test('Q7 camera ở 4 góc bản đồ không lộ khoảng đen', async ({ page }) => {
  const corners: [number, number, string][] = [
    [1, 1, 'tl'],
    [46, 1, 'tr'],
    [1, 30, 'bl'],
    [46, 30, 'br'],
  ];
  for (const [x, y, n] of corners) {
    await tp(page, x, y);
    await page.waitForTimeout(1800);
    const s = await st(page);
    expect(s.view.x).toBeGreaterThanOrEqual(-0.5);
    expect(s.view.y).toBeGreaterThanOrEqual(-0.5);
    expect(s.view.x + s.view.w).toBeLessThanOrEqual(s.mapPx.w + 0.5);
    expect(s.view.y + s.view.h).toBeLessThanOrEqual(s.mapPx.h + 0.5);
    await page.screenshot({ path: join(SHOTS, `qa-t001-corner-${n}.png`) });
  }
});

test('Q8 đi lung tung 60 giây: không lỗi console, không xuyên vật cản, không ra khỏi bản đồ', async ({ page }) => {
  test.setTimeout(150_000);
  const keys = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowLeft'];
  let seed = 12345;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31);
  const t0 = Date.now();
  const tiles = new Set<string>();
  const problems: string[] = [];
  let i = 0;
  while (Date.now() - t0 < 60_000) {
    const pick = keys.filter(() => rnd() < 0.35);
    for (const k of pick) await page.keyboard.down(k);
    await page.waitForTimeout(150 + Math.floor(rnd() * 700));
    for (const k of pick) await page.keyboard.up(k);
    const s = await st(page);
    tiles.add(`${s.tileX},${s.tileY}`);
    const ov = await overlapsSolid(page, 2);
    if (ov) problems.push(ov);
    if (s.footX < TILE || s.footY < TILE || s.footX > 47 * TILE || s.footY > 31 * TILE) problems.push(`ngoài rào ${s.footX},${s.footY}`);
    if (Math.abs(s.view.x) < -0.5 || s.view.x + s.view.w > s.mapPx.w + 0.5) problems.push('camera lộ mép');
    // thỉnh thoảng nhảy tới chỗ khác cho phủ nhiều vùng
    if (++i % 12 === 0) await tp(page, 2 + Math.floor(rnd() * 44), 2 + Math.floor(rnd() * 28));
  }
  const fps = await page.evaluate(() => (window as any).__game.loop.actualFps);
  console.log('ô đã đi qua:', tiles.size, 'fps:', fps, 'vấn đề:', problems);
  await page.screenshot({ path: join(SHOTS, 'qa-t001-random-60s.png') });
  expect(problems).toEqual([]);
  expect(errors).toEqual([]);
});

test('Q9 mất focus khi đang giữ phím: nhân vật không đi mãi (phím kẹt); ẩn/hiện tab không lỗi', async ({ page }) => {
  await tp(page, 28, 18);
  await page.keyboard.down('KeyD');
  await page.waitForTimeout(300);
  // Mô phỏng Alt+Tab: cửa sổ mất focus, keyup rơi ở cửa sổ khác (không tới game).
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
    window.dispatchEvent(new Event('blur'));
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.waitForTimeout(1500);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' });
    document.dispatchEvent(new Event('visibilitychange'));
    window.dispatchEvent(new Event('focus'));
  });
  // keyup "bị mất": KHÔNG gọi keyboard.up. Playwright vẫn giữ trạng thái D nhưng không gửi lại sự kiện.
  await page.waitForTimeout(300);
  const a = await st(page);
  await page.waitForTimeout(1000);
  const b = await st(page);
  console.log('sau khi quay lại tab: moving', b.moving, 'dx', b.footX - a.footX);
  await page.keyboard.up('KeyD');
  expect(b.footX - a.footX).toBeLessThan(5);
  // game vẫn chạy sau khi quay lại
  const s1 = await st(page);
  await holdUntil(page, ['KeyS'], () => false, 600);
  const s2 = await st(page);
  expect(s2.footY).toBeGreaterThan(s1.footY + 20);
});

test('Q10 tab thật: mở tab khác rồi quay lại, game vẫn chạy', async ({ page, context }) => {
  const other = await context.newPage();
  await other.goto('about:blank');
  await other.bringToFront();
  await page.waitForTimeout(2000);
  await page.bringToFront();
  await page.waitForTimeout(500);
  const s1 = await st(page);
  await holdUntil(page, ['KeyA'], () => false, 700);
  const s2 = await st(page);
  expect(s2.footX).toBeLessThan(s1.footX - 20);
  await other.close();
});

test.describe('1366x768', () => {
  test.use({ viewport: { width: 1366, height: 768 } });
  test('Q11 1366×768: canvas FIT 16:9, gợi ý phím còn trong màn', async ({ page }) => {
    const box = await page.locator('canvas').boundingBox();
    console.log('canvas', box);
    expect(box).not.toBeNull();
    expect(box!.width / box!.height).toBeCloseTo(16 / 9, 2);
    expect(box!.width).toBeLessThanOrEqual(1366);
    expect(box!.height).toBeLessThanOrEqual(768);
    const hint = await page.evaluate(() => {
      const hud = (window as any).__game.scene.getScene('GardenHud');
      const t = hud.children.list.find((o: any) => o.type === 'Text');
      const b = t.getBounds();
      return { text: t.text, x: b.x, y: b.y, w: b.width, h: b.height, fontSize: t.style.fontSize };
    });
    console.log('hint', hint);
    expect(hint.text).toContain('WASD');
    expect(hint.x + hint.w).toBeLessThanOrEqual(1920);
    expect(hint.y + hint.h).toBeLessThanOrEqual(1080);
    await holdUntil(page, ['KeyD', 'KeyS'], () => false, 800);
    await page.screenshot({ path: join(SHOTS, 'qa-t001-1366x768.png') });
  });
});
