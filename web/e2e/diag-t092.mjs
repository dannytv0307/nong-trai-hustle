// Chẩn đoán T-092 (giao diện Lô 1): chụp HUD, tooltip, bong bóng 4 kiểu, viền ô ngoài tầm (nét đứt), gùi, thùng bán,
// sạp hạt, rương, hộp hỏi ngủ, tổng kết, menu Tạm dừng, hộp xác nhận, bảng tên khu, màn 1366×768.
// Ảnh vào screenshots/t092-*.png. Chạy: node diag-t092.mjs (cần dev client ở http://localhost:5173 — stack Docker `npm run up`).
import { chromium } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const shot = (name) => fileURLToPath(new URL(`./screenshots/${name}`, import.meta.url));
const b = await chromium.launch();
const errors = [];
const out = {};

async function openPage(width, height) {
  const p = await b.newPage({ viewport: { width, height } });
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
  return p;
}

const p = await openPage(1920, 1080);
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
const setSlot = (i, id, n) => G(([a, b2, c]) => window.__game.scene.getScene('Garden').debugSetSlot(a, b2, c), [i, id, n]);
const bubble = (text, kind, style) => G(([t, k, s]) => window.__game.scene.getScene('Garden').debugShowBubble(t, k, s), [text, kind, style]);
const hotbarCenter = (i) => G((k) => window.__game.scene.getScene('Garden').debugHudSlotCenter('hotbar', k), i);
const waitFor = async (pred, label, tries = 300) => {
  for (let i = 0; i < tries; i++) {
    const s = await state();
    if (pred(s)) return s;
    await frames(2);
  }
  throw new Error(`không tới: ${label}`);
};
const lasting = { grumbleSeconds: 60 };
await G((t) => window.__game.scene.getScene('Garden').debugSetTestTuning(t), lasting);

// Gùi như ảnh mẫu: cuốc, 6 hạt cải, 3 hạt khoai, 5 rau cải, 2 khoai lang.
await setSlot(1, 'hat-rau-cai', 6);
await setSlot(2, 'hat-khoai-lang', 3);
await setSlot(3, 'rau-cai', 5);
await setSlot(4, 'khoai-lang', 2);
await G(() => window.__game.scene.getScene('Garden').debugSetStamina(92));

// ---------------- 1. HUD + bong bóng khoe + tooltip hotbar
await tp(10, 12);
await frames(20);
await bubble('Luống này thẳng như kẻ chỉ!', 'grumble', 'normal'); // kind grumble = hiện lâu (grumbleSeconds 60) cho kịp chụp
const c4 = await hotbarCenter(3);
await p.mouse.move(c4.x, c4.y);
await frames(10);
let s = await state();
out.hud = {
  stamina: s.hud.staminaText,
  money: s.hud.moneyText,
  clock: s.hud.clockText,
  day: s.hud.dayText,
  season: s.hud.seasonIcon,
  tooltip: s.hud.tooltip,
  frames: s.hud.hotbarFrames,
  selected: s.hud.selectedFrame,
  bubble: s.bubble,
  hints: s.hud.hintLines,
};
await p.screenshot({ path: shot('t092-1-hud.png') });

// ---------------- 2. Bong bóng khoe + chửi thề + nghĩ
await p.mouse.move(960, 300);
await bubble('Hừ, cuốc gỗ mà cũng phải nể tao.', 'grumble', 'boast');
await frames(15);
await p.screenshot({ path: shot('t092-2a-bong-khoe.png'), clip: { x: 560, y: 160, width: 800, height: 460 } });
await bubble('Mả cha nó, ngủ với muỗi cả đêm, lưng như bị trâu giẫm!', 'grumble');
await frames(15);
out.curse = (await state()).bubble;
await p.screenshot({ path: shot('t092-2b-chui-the.png'), clip: { x: 560, y: 0, width: 800, height: 620 } });
await bubble('…', 'grumble', 'think');
await frames(15);
await p.screenshot({ path: shot('t092-2c-nghi.png'), clip: { x: 560, y: 160, width: 800, height: 460 } });
await G(() => window.__game.scene.getScene('Garden').debugSetTestTuning({ grumbleSeconds: 0.01 }));
await frames(10);

// ---------------- 3. Viền ô ngoài tầm (nét đứt) và trong tầm
const far = await G(() => window.__game.scene.getScene('Garden').debugTileToScreen(5, 12));
await tp(10, 12);
await frames(5);
await p.mouse.move(far.x, far.y);
await frames(5);
s = await state();
out.outOfReach = s.hover && { inReach: s.hover.inReach, job: s.hover.job, highlight: s.hover.highlight, alpha: s.hover.alpha };
await p.screenshot({ path: shot('t092-3a-ngoai-tam.png'), clip: { x: Math.round(far.x - 260), y: Math.round(far.y - 200), width: 520, height: 400 } });
await tp(14, 12);
await frames(5);
const near = await G(() => window.__game.scene.getScene('Garden').debugTileToScreen(14, 13));
await p.mouse.move(near.x, near.y);
await frames(5);
s = await state();
out.inReach = s.hover && { inReach: s.hover.inReach, highlight: s.hover.highlight };
await p.screenshot({ path: shot('t092-3b-trong-tam.png'), clip: { x: Math.round(near.x - 260), y: Math.round(near.y - 200), width: 520, height: 400 } });

// ---------------- 4. Gùi (E), rê chuột lên ô 4
await p.keyboard.press('KeyE');
await frames(5);
const b3 = await G(() => window.__game.scene.getScene('Garden').debugHudSlotCenter('bag', 3));
await p.mouse.move(b3.x, b3.y);
await frames(5);
s = await state();
out.bag = { visible: s.hud.bagVisible, tooltip: s.hud.tooltip };
await p.screenshot({ path: shot('t092-4-gui.png') });
// Rê lên nút đóng (X) rồi bấm → đóng.
const bagX = await G(() => {
  const g = window.__game.scene.getScene('Garden');
  return { n: g.inventory.slots.length };
});
out.bagSlots = bagX.n;
await p.keyboard.press('KeyE');
await frames(5);

// ---------------- 5. Thùng bán (F cạnh thùng), có đồ trong thùng
await G(() => {
  const g = window.__game.scene.getScene('Garden');
  g.debugSetSellBoxSlot(0, 'rau-cai', 3);
  g.debugSetSellBoxSlot(1, 'dua-hau', 1);
});
await tp(16, 12);
await frames(5);
await p.keyboard.press('KeyF');
await frames(5);
s = await state();
out.sellOpen = s.shop?.window;
const sb = await G(() => window.__game.scene.getScene('Garden').debugSellSlotCenter('box', 2));
await p.mouse.move(sb.x, sb.y);
await frames(5);
s = await state();
out.sell = { total: s.hud.sellTotalText, minFont: s.hud.shopMinFontPx };
await p.screenshot({ path: shot('t092-5-thung-ban.png') });
// Nút X: rê vào thấy phóng to; bấm thì đóng.
const closeSell = await G(() => {
  const g = window.__game.scene.getScene('Garden');
  const hud = window.__game.scene.getScene('GardenHud');
  return { w: hud.sellView.chrome.close.x, h: hud.sellView.chrome.close.y, n: g.inventory.slots.length };
});
await p.mouse.move(closeSell.w, closeSell.h);
await frames(3);
out.sellCloseHover = (await state()).hud.closeHover;
await p.mouse.down();
await frames(2);
await p.mouse.up();
await frames(3);
out.sellAfterClose = (await state()).shop?.window ?? null;

// ---------------- 6. Sạp hạt
await tp(14, 29);
await frames(5);
await p.keyboard.press('KeyF');
await frames(5);
s = await state();
out.stallOpen = s.shop?.window;
if (s.shop?.window !== 'seedStall') {
  for (const [x, y] of [
    [13, 29],
    [12, 28],
    [15, 28],
    [13, 30],
  ]) {
    await tp(x, y);
    await frames(3);
    await p.keyboard.press('KeyF');
    await frames(5);
    if ((await state()).shop?.window === 'seedStall') break;
  }
}
const st0 = await G(() => window.__game.scene.getScene('Garden').debugStallButtonCenter(0));
await p.mouse.move(st0.x, st0.y);
await frames(5);
s = await state();
out.stall = { open: s.shop?.window, buttons: s.hud.stallButtons, minFont: s.hud.shopMinFontPx };
await p.screenshot({ path: shot('t092-6-sap-hat.png') });
await p.keyboard.press('Escape');
await frames(5);

// ---------------- 7. Vào nhà (bảng tên khu) rồi mở rương
await tp(10, 11);
await frames(5);
await p.keyboard.down('KeyW');
await waitFor((x) => x.area.current === 'house', 'vào nhà');
await p.keyboard.up('KeyW');
await waitFor((x) => x.area.transition === 'idle', 'hết chuyển cảnh');
await frames(8);
s = await state();
out.banner = s.hud.areaBanner;
await p.screenshot({ path: shot('t092-7a-ten-khu.png') });
await G(() => window.__game.scene.getScene('Garden').debugEnterArea('house', { x: 330, y: 330 }));
await frames(3);
await p.keyboard.press('KeyF');
await frames(5);
s = await state();
out.chest = s.shop?.window;
await p.screenshot({ path: shot('t092-7b-ruong.png') });
await p.keyboard.press('Escape');
await frames(5);

// ---------------- 8. Menu Tạm dừng + hộp xác nhận
await G(() => window.__game.scene.getScene('Garden').debugSetPauseMenu(true));
await frames(3);
const resume = await G(() => window.__game.scene.getScene('Garden').debugPauseButtonCenter('resume'));
await p.mouse.move(resume.x, resume.y);
await frames(3);
s = await state();
out.pause = { visible: s.hud.pauseVisible, hover: s.hud.pauseButtonHover };
await p.screenshot({ path: shot('t092-8a-tam-dung.png') });
const restart = await G(() => window.__game.scene.getScene('Garden').debugPauseButtonCenter('restart'));
await p.mouse.move(restart.x, restart.y);
await p.mouse.down();
await frames(2);
await p.mouse.up();
await frames(3);
const no = await G(() => window.__game.scene.getScene('Garden').debugPauseButtonCenter('confirmNo'));
await p.mouse.move(no.x, no.y);
await frames(3);
await p.screenshot({ path: shot('t092-8b-xac-nhan.png') });
await p.keyboard.press('Escape');
await frames(3);
await G(() => window.__game.scene.getScene('Garden').debugSetPauseMenu(false));
await frames(3);

// ---------------- 9. Hỏi ngủ (giường, 20h) → tổng kết
await G(() => window.__game.scene.getScene('Garden').debugSetHour(20));
await G(() => window.__game.scene.getScene('Garden').debugEnterArea('house', { x: 300, y: 400 }));
await frames(3);
await p.keyboard.press('KeyF');
await frames(5);
const yes = await G(() => window.__game.scene.getScene('Garden').debugSleepButtonCenter('yes'));
await p.mouse.move(yes.x, yes.y);
await frames(3);
s = await state();
out.sleep = { phase: s.night.phase, minFont: s.hud.nightMinFontPx };
await p.screenshot({ path: shot('t092-9a-hoi-ngu.png') });
await p.keyboard.press('Enter');
await waitFor((x) => x.night.phase === 'summary', 'tổng kết', 600);
await frames(200);
s = await state();
out.summary = { title: s.hud.summaryTitle, lines: s.hud.summaryLines.map((l) => l.text), minFont: s.hud.nightMinFontPx };
await p.screenshot({ path: shot('t092-9b-tong-ket.png') });
await p.keyboard.press('Enter');
await frames(10);
await p.keyboard.press('Enter');
await frames(60);

console.log(JSON.stringify(out, null, 1));
console.log('ERRORS/WARNINGS:', errors.length ? errors.join(' | ') : 'none');
errors.length = 0;
await p.close();

// ---------------- 10. Màn 1366×768 (Scale.FIT): HUD không đè
const p2 = await openPage(1366, 768);
await p2.evaluate(() => {
  const g = window.__game.scene.getScene('Garden');
  g.debugSetSlot(1, 'hat-rau-cai', 6);
  g.debugSetSlot(3, 'rau-cai', 5);
});
await p2.waitForTimeout(500);
await p2.screenshot({ path: shot('t092-10-1366.png') });
await p2.keyboard.press('KeyE');
await p2.waitForTimeout(300);
await p2.screenshot({ path: shot('t092-10b-1366-gui.png') });
console.log(JSON.stringify(out, null, 1));
console.log('1366 ERRORS/WARNINGS:', errors.length ? errors.join(' | ') : 'none');
await b.close();
