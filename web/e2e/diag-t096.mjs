// Chẩn đoán T-096 (click đâu đi đó + tự tìm đường): click xa đi vòng nhà, click ruộng xa khi cầm cuốc → tới rồi cuốc,
// click thúng bán xa → tới mở, WASD huỷ, click cửa nhà từ xa → vào nhà, trong nhà click bếp / cửa, chạm màn hình (touch).
// Chụp ảnh vào screenshots/t096-*.png. Chạy: node diag-t096.mjs (cần dev client ở http://localhost:5173 — `npm run up`).
import { chromium } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const shot = (name) => fileURLToPath(new URL(`./screenshots/${name}`, import.meta.url));
const b = await chromium.launch();
const errors = [];
const out = {};

async function openPage(opts = {}) {
  const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 }, ...opts });
  const p = await ctx.newPage();
  p.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') errors.push(`${m.type()}: ${m.text()}`);
  });
  p.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  const ready = () => p.waitForFunction(() => window.__game?.scene?.getScene('Garden')?.debugState?.gardenReady, null, { timeout: 60000 });
  await p.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await ready();
  await p.evaluate(() => window.__game.scene.getScene('Garden').debugClearSave());
  await p.reload({ waitUntil: 'domcontentloaded', timeout: 120000 });
  await ready();
  const G = (fn, arg) => p.evaluate(fn, arg);
  const frames = (n) =>
    G(
      (k) =>
        new Promise((res) => {
          const sc = window.__game.scene.getScene('Garden');
          let c = 0;
          const f = () => {
            if (++c >= k) {
              sc.events.off('postupdate', f);
              res(c);
            }
          };
          sc.events.on('postupdate', f);
        }),
      n,
    );
  const state = () => G(() => window.__game.scene.getScene('Garden').debugState);
  const tp = (x, y) => G(([a, c]) => window.__game.scene.getScene('Garden').debugTeleport(a, c), [x, y]);
  const tileScreen = (x, y) => G(([a, c]) => window.__game.scene.getScene('Garden').debugTileToScreen(a, c), [x, y]);
  const worldScreen = (x, y) => G(([a, c]) => window.__game.scene.getScene('Garden').debugWorldToScreen(a, c), [x, y]);
  /** Chờ tới khi điều kiện đúng (đếm frame, không chờ cố định). */
  const until = async (name, pred, maxFrames = 900) => {
    for (let i = 0; i < maxFrames; i += 5) {
      const s = await state();
      if (pred(s)) return s;
      await frames(5);
    }
    console.log(JSON.stringify(out, null, 1));
    console.log('LAST', JSON.stringify(brief(await state())), 'bubble', (await state()).bubble.text);
    throw new Error(`hết giờ chờ: ${name}`);
  };
  return { p, G, frames, state, tp, tileScreen, worldScreen, until };
}

const brief = (s) => ({
  tile: [s.tileX, s.tileY],
  foot: [Math.round(s.footX), Math.round(s.footY)],
  facing: s.facing,
  area: s.area.current,
  click: { active: s.clickMove.active, action: s.clickMove.action, waypoints: s.clickMove.waypoints.length, starts: s.clickMove.starts, arrivals: s.clickMove.arrivals, actionsDone: s.clickMove.actionsDone, cancels: s.clickMove.cancels, noPath: s.clickMove.noPath, replans: s.clickMove.replans, lastExpanded: s.clickMove.lastExpanded, lastPlanMs: Number(s.clickMove.lastPlanMs.toFixed(2)), lastAction: s.clickMove.lastAction },
});

// ================= Chuột =================
{
  const { p, G, frames, state, tp, tileScreen, worldScreen, until } = await openPage();

  // ---- 1. Click sau nhà (đứng trước sân) → đi vòng nhà
  await tp(11, 12);
  await frames(30);
  let pt = await tileScreen(12, 7);
  await p.mouse.click(pt.x, pt.y);
  await frames(20);
  let s = await state();
  out.behindStart = brief(s);
  out.behindPath = s.clickMove.waypoints;
  await p.screenshot({ path: shot('t096-1-di-vong-nha.png') });
  s = await until('tới sau nhà', (st) => !st.clickMove.active);
  out.behindEnd = brief(s);
  await frames(10);
  await p.screenshot({ path: shot('t096-2-sau-nha.png') });

  // ---- 2. Cầm cuốc, click ô ruộng xa → tới rồi cuốc
  await tp(8, 17);
  await G(() => window.__game.scene.getScene('Garden').debugHoldHoe());
  await frames(20);
  pt = await tileScreen(14, 14);
  await p.mouse.click(pt.x, pt.y);
  await frames(3);
  out.tillStart = brief(await state());
  s = await until('bắt đầu cuốc', (st) => st.hoeFrame >= 0);
  out.tillWorking = { ...brief(s), hoeFrame: s.hoeFrame, pending: await G(() => window.__game.scene.getScene('Garden').debugIsPending(14, 14)) };
  await frames(20);
  await p.screenshot({ path: shot('t096-3-toi-roi-cuoc.png') });
  // WASD bỏ dở cuốc
  await p.keyboard.down('KeyA');
  await frames(4);
  await p.keyboard.up('KeyA');
  await frames(4);
  out.tillDistanceTiles = Number((Math.hypot(out.tillWorking.foot[0] - 14.5 * 64, out.tillWorking.foot[1] - 14.5 * 64) / 64).toFixed(2));

  // ---- 2b (T-096b). Rê cả luống hàng dưới ruộng (y = 15, x 13 → 15) khi đứng xa: bước tới sát từng ô rồi cuốc
  await G(() => window.__game.scene.getScene('Garden').debugSetTillTuning({ strikesPerPlot: 2, strikeSeconds: 0.3 }));
  await tp(9, 19);
  await frames(20);
  const row = [];
  for (const x of [13, 14, 15]) row.push(await tileScreen(x, 15));
  await p.mouse.move(row[0].x, row[0].y);
  await p.mouse.down();
  for (let i = 1; i < row.length; i++) {
    await p.mouse.move(row[i].x, row[i].y, { steps: 4 });
    await frames(2);
  }
  await p.mouse.up();
  const stands = [];
  let shotTaken = false;
  for (let i = 0; i < 400; i++) {
    const st = await state();
    if (st.hoeFrame >= 0) {
      const key = `${st.tileX},${st.tileY}`;
      if (stands.at(-1)?.key !== key) stands.push({ key, foot: brief(st).foot });
      if (!shotTaken && stands.length >= 2) {
        await p.screenshot({ path: shot('t096-3b-re-ca-luong.png') });
        shotTaken = true;
      }
    }
    const pend = await G(() => [13, 14, 15].some((x) => window.__game.scene.getScene('Garden').debugIsPending(x, 15)));
    if (!pend && !st.clickMove.active && i > 5) break;
    await frames(3);
  }
  out.dragRow = { stands, tilled: (await state()).till?.finishes };
  await G(() => window.__game.scene.getScene('Garden').debugSetTillTuning({ strikesPerPlot: 6, strikeSeconds: 0.85 }));

  // ---- 3. Click thúng bán xa → tới mở cửa sổ
  await tp(9, 16);
  await frames(20);
  const sb = (await state()).props?.sellBox ?? null;
  pt = await tileScreen(17, 11);
  await p.mouse.click(pt.x, pt.y);
  s = await until('mở thúng bán', (st) => st.shop.window === 'sellBox');
  out.sellBox = { ...brief(s), shop: s.shop.window, sb };
  await frames(10);
  await p.screenshot({ path: shot('t096-4-toi-thung-ban.png') });
  await p.keyboard.press('Escape');
  await frames(5);

  // ---- 4. WASD huỷ đường
  await tp(11, 13);
  await frames(10);
  pt = await tileScreen(4, 16);
  await p.mouse.click(pt.x, pt.y);
  await frames(15);
  const before = brief(await state());
  await p.keyboard.down('KeyD');
  await frames(3);
  await p.keyboard.up('KeyD');
  await frames(20);
  out.wasdCancel = { before, after: brief(await state()) };

  // ---- 5. Click lên hotbar: không đi
  const slot = await G(() => window.__game.scene.getScene('Garden').debugHudSlotCenter('hotbar', 2));
  const starts0 = (await state()).clickMove.starts;
  await p.mouse.click(slot.x, slot.y);
  await frames(10);
  s = await state();
  out.hotbarClick = { startsBefore: starts0, startsAfter: s.clickMove.starts, active: s.clickMove.active, selected: s.inventory?.selected };

  // ---- 6. Click cửa nhà từ xa → đi tới rồi vào nhà
  await tp(15, 14);
  await frames(20);
  pt = await tileScreen(10, 10);
  await p.mouse.move(pt.x, pt.y);
  await frames(5);
  await p.screenshot({ path: shot('t096-5-tro-cua-nha.png') });
  await p.mouse.click(pt.x, pt.y);
  s = await until('vào nhà', (st) => st.area.current === 'house' && st.area.transition === 'idle');
  out.doorEnter = brief(s);

  // ---- 7. Trong nhà: click bếp (xa) → tới, bong bóng bếp
  const stove = await G(() => window.__game.scene.getScene('Garden').debugHouseObjectScreen('stove'));
  await p.mouse.click(stove.x, stove.y);
  await frames(10);
  await p.screenshot({ path: shot('t096-6-trong-nha-di-toi-bep.png') });
  s = await until('tới bếp', (st) => !st.clickMove.active);
  out.stove = { ...brief(s), bubble: s.bubble.text };
  await frames(5);
  await p.screenshot({ path: shot('t096-7-toi-bep.png') });

  // ---- 8. Trong nhà: click sàn trống dưới giường (bên trái phòng) rồi click khung cửa → ra Vườn
  const house = s.area.house;
  pt = await worldScreen(house.origin.x + 250, house.origin.y + 470);
  await p.mouse.click(pt.x, pt.y);
  s = await until('tới sàn dưới giường', (st) => !st.clickMove.active);
  out.houseFloor = brief(s);
  pt = await worldScreen(house.origin.x + 646, house.origin.y + 580);
  await p.mouse.click(pt.x, pt.y);
  s = await until('ra Vườn', (st) => st.area.current === 'garden' && st.area.transition === 'idle');
  out.doorExit = brief(s);

  // ---- 9. Click giữa ao (ô chặn) → đi tới bờ ao gần nhất
  await tp(28, 12);
  await frames(15);
  pt = await tileScreen(34, 9);
  await p.mouse.click(pt.x, pt.y);
  s = await until('tới bờ ao', (st) => !st.clickMove.active);
  out.pond = brief(s);
  await frames(5);
  await p.screenshot({ path: shot('t096-8-bo-ao.png') });

  // ---- 10. Đuối Sức → đi chậm: so thời gian đi cùng quãng
  const timeWalk = async () => {
    await tp(4, 20);
    await frames(10);
    const q = await tileScreen(12, 20);
    const t0 = await G(() => window.__game.loop.frame);
    await p.mouse.click(q.x, q.y);
    await until('đi xong', (st) => st.clickMove.arrivals > 0 && !st.clickMove.active);
    return (await G(() => window.__game.loop.frame)) - t0;
  };
  const fullFrames = await timeWalk();
  await G(() => window.__game.scene.getScene('Garden').debugSetStamina(0));
  const tiredFrames = await timeWalk();
  out.speed = { fullFrames, tiredFrames };
  await G(() => window.__game.scene.getScene('Garden').debugSetStamina(100));
  await p.context().close();
}

// ================= Chạm (màn hình cảm ứng) =================
{
  const { p, frames, state, tp, tileScreen, until } = await openPage({ hasTouch: true });
  await tp(11, 13);
  await frames(30);
  const pt = await tileScreen(5, 17);
  await p.touchscreen.tap(pt.x, pt.y);
  await frames(15);
  const mid = brief(await state());
  await p.screenshot({ path: shot('t096-9-cham-man-hinh.png') });
  const s = await until('chạm → tới nơi', (st) => !st.clickMove.active);
  out.touch = { mid, end: brief(s) };
  await p.context().close();
}

console.log(JSON.stringify(out, null, 1));
console.log('ERRORS', errors.filter((e) => !e.includes('[vite]')).slice(0, 20));
await b.close();
