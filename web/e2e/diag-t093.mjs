// Chẩn đoán T-093 (cảnh trong nhà {ten}): vào / ra cửa bằng phím, va chạm tường + đồ đạc, rương, F5 trong nhà, ngủ,
// ngủ gục ngoài đồng → sáng dậy trong nhà. Chụp ảnh vào screenshots/t093-*.png.
// Chạy: node diag-t093.mjs (cần dev client ở http://localhost:5173 — stack Docker `npm run up`).
import { chromium } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const shot = (name) => fileURLToPath(new URL(`./screenshots/${name}`, import.meta.url));
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
const errors = [];
p.on('console', (m) => {
  if (m.type() === 'error' || m.type() === 'warning') errors.push(`${m.type()}: ${m.text()}`);
});
p.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
p.on('framenavigated', (f) => console.log('NAV', f.url()));
p.on('console', (m) => { if (m.text().includes('[vite]')) console.log(m.text()); });
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
const goArea = (area, local) => G(([a, l]) => window.__game.scene.getScene('Garden').debugEnterArea(a, l), [area, local]);
const waitArea = async (area) => {
  for (let i = 0; i < 200; i++) {
    const s = await state();
    if (s.area.current === area && s.area.transition === 'idle') return s;
    await frames(2);
  }
  throw new Error(`không tới khu ${area}`);
};
const out = {};

// ---------------- 1. Đứng trước cửa (Vườn), bấm W → màn mờ → trong nhà
await tp(10, 11);
await frames(30);
await p.screenshot({ path: shot('t093-0-truoc-cua.png') });
await p.keyboard.down('KeyW');
let fadeSeen = 0;
for (let i = 0; i < 60; i++) {
  const s = await state();
  fadeSeen = Math.max(fadeSeen, s.area.fade);
  if (s.area.current === 'house') break;
  await frames(1);
}
await p.keyboard.up('KeyW');
let s = await waitArea('house');
out.enter = { fadeSeen: Number(fadeSeen.toFixed(2)), area: s.area.current, local: s.area.local, facing: s.facing, enters: s.area.enters, banner: s.area.banner, lastSave: s.save.lastSaveAt?.reason, view: s.view };
await frames(10);
await p.screenshot({ path: shot('t093-1-vao-nha.png') });

// ---------------- 2. Va chạm: giữ phím đi một lúc từ một chỗ trong phòng, đọc chân dừng ở đâu (toạ độ trong ảnh phòng)
const push = async (name, local, key, n = 50) => {
  await goArea('house', local);
  await frames(3);
  await p.keyboard.down(key);
  await frames(n);
  await p.keyboard.up(key);
  await frames(3);
  const st = await state();
  out[name] = { area: st.area.current, x: Math.round(st.area.local.x), y: Math.round(st.area.local.y) };
};
await push('tuong sau (W từ 640,330) → y≈258', { x: 640, y: 330 }, 'KeyW');
await push('tuong trai (A từ 300,500) → x≈132', { x: 300, y: 500 }, 'KeyA', 80);
await push('tuong phai (D từ 900,480) → x≈1132', { x: 900, y: 480 }, 'KeyD', 80);
await push('giuong (A từ 420,360) → x≈284', { x: 420, y: 360 }, 'KeyA');
await push('ruong (W từ 330,420) → y≈310', { x: 330, y: 420 }, 'KeyW');
await push('bep (W từ 1040,470) → y≈340', { x: 1040, y: 470 }, 'KeyW');
await push('tuong truoc ngoai khe cua (S từ 300,460) → y≈526, vẫn trong nhà', { x: 300, y: 460 }, 'KeyS');

// ---------------- 3. Nón ông nội (F) + rương: cất 5 khoai, F5 → vẫn trong nhà, khoai còn
await goArea('house', { x: 732, y: 262 });
await frames(3);
await p.keyboard.press('KeyF');
await frames(5);
out.hat = (await state()).bubble.text;
await p.screenshot({ path: shot('t093-2-non-ong.png') });

await G(() => window.__game.scene.getScene('Garden').debugSetSlot(4, 'khoai-lang', 5));
await goArea('house', { x: 330, y: 330 });
await frames(3);
await p.keyboard.press('KeyF');
await frames(5);
out.chestOpen = (await state()).shop.window;
const slot = await G(() => window.__game.scene.getScene('Garden').debugSellSlotCenter('bag', 4));
await p.mouse.move(slot.x, slot.y);
await frames(2);
await p.keyboard.down('Shift');
await p.mouse.down();
await frames(2);
await p.mouse.up();
await p.keyboard.up('Shift');
await frames(5);
s = await state();
out.chestAfterMove = { chest0: s.chest.slots[0], bag4: s.inventory.slots[4], hud: s.time.reasons };
await p.screenshot({ path: shot('t093-3-ruong.png') });
await p.keyboard.press('Escape');
await frames(3);
await G(() => window.__game.scene.getScene('Garden').debugSaveNow('diag'));
await p.reload({ waitUntil: 'domcontentloaded', timeout: 120000 });
await ready();
await frames(10);
s = await state();
out.afterF5 = { area: s.area.current, local: s.area.local, chest0: s.chest.slots[0], camView: s.view };

// ---------------- 4. Ngủ ở giường trong nhà (20h), tối trong nhà nhẹ hơn ngoài vườn
await G(() => window.__game.scene.getScene('Garden').debugSetHour(21));
await frames(3);
out.skyInside21h = (await state()).sky.alpha;
await p.screenshot({ path: shot('t093-4-dem-trong-nha.png') });
await goArea('house', { x: 300, y: 400 });
await frames(3);
await p.keyboard.press('KeyF');
await frames(5);
out.sleepPrompt = (await state()).night.phase;
await p.keyboard.press('Enter');
for (let i = 0; i < 300; i++) {
  if ((await state()).night.phase === 'summary') break;
  await frames(3);
}
await frames(20);
await p.keyboard.press('Enter');
await frames(3);
await p.keyboard.press('Enter');
for (let i = 0; i < 300; i++) {
  if ((await state()).night.phase === 'none') break;
  await frames(3);
}
s = await state();
out.afterSleep = { day: s.time.day, area: s.area.current, local: s.area.local, facing: s.facing };

// ---------------- 5. Ra cửa: đứng giữa khe cửa bấm S → đứng trước nhà
await goArea('house', { x: 640, y: 480 });
await frames(3);
await p.keyboard.down('KeyS');
for (let i = 0; i < 80; i++) {
  if ((await state()).area.current === 'garden') break;
  await frames(1);
}
await p.keyboard.up('KeyS');
s = await waitArea('garden');
out.exit = { area: s.area.current, tile: [s.tileX, s.tileY], foot: [Math.round(s.footX), Math.round(s.footY)], facing: s.facing, exits: s.area.exits, banner: s.area.banner.text };
await frames(10);
await p.screenshot({ path: shot('t093-5-ra-ngoai.png') });
out.skyOutside = (await state()).sky.alpha;

// ---------------- 6. Ngủ gục ngoài đồng → sáng dậy trong nhà cạnh giường
await tp(14, 17);
await frames(3);
await G(() => window.__game.scene.getScene('Garden').debugTriggerDayEnd());
for (let i = 0; i < 400; i++) {
  if ((await state()).night.phase === 'summary') break;
  await frames(3);
}
await frames(20);
await p.keyboard.press('Enter');
await frames(3);
await p.keyboard.press('Enter');
for (let i = 0; i < 300; i++) {
  if ((await state()).night.phase === 'none') break;
  await frames(3);
}
await frames(5);
s = await state();
const saved = await G(() => window.__game.scene.getScene('Garden').debugReadSave());
out.afterPassOut = { area: s.area.current, local: s.area.local, passedOut: s.night.passedOut, savedArea: saved?.player?.area, savedVersion: saved?.version };
await p.screenshot({ path: shot('t093-6-day-sau-ngu-guc.png') });

console.log(JSON.stringify(out, null, 2));
console.log('errors:', errors.length ? errors.join('\n') : 'none');
await b.close();
