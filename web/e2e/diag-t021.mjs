// Chẩn đoán T-021/T-022: chụp nền tile thật (lối / sân / ruộng các nấc / viền luống) + cây các giai đoạn + icon thật.
// Chạy: node diag-t021.mjs (cần dev client ở http://localhost:5173). Ảnh lưu ở screenshots/t021-*.png.
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
await p.goto('http://localhost:5173/');
await p.waitForFunction(() => window.__game?.scene?.getScene('Garden')?.debugState?.gardenReady, null, { timeout: 60000 });
await p.evaluate(() => window.__game.scene.getScene('Garden').debugClearSave());
await p.reload();
await p.waitForFunction(() => window.__game?.scene?.getScene('Garden')?.debugState?.gardenReady, null, { timeout: 60000 });
const frames = (n) =>
  p.evaluate(
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

// 1) Ruộng mới: đứng trên sân, chưa cuốc gì.
await p.evaluate(() => window.__game.scene.getScene('Garden').debugTeleport(12, 14));
await frames(40);
await p.screenshot({ path: shot('t021-1-ruong-moi.png') });

// 1b) Cuốc thật bằng chuột: bấm ô (13,13), giữ rê sang (14,13), (15,13) để xếp hàng; chụp lúc đang cuốc + viền chọn ô.
await p.evaluate(() => {
  const sc = window.__game.scene.getScene('Garden');
  sc.debugHoldHoe();
  sc.debugSetTillTuning({ strikeSeconds: 0.5 });
  sc.debugTeleport(12, 13);
});
await frames(10);
const pt = (x, y) => p.evaluate(([a, c]) => window.__game.scene.getScene('Garden').debugTileToScreen(a, c), [x, y]);
let s0 = await pt(13, 13);
await p.mouse.move(s0.x, s0.y);
await p.mouse.down();
for (const tx of [14, 15]) {
  const q = await pt(tx, 13);
  await p.mouse.move(q.x, q.y, { steps: 4 });
}
await p.mouse.up();
await p.waitForFunction(() => window.__game.scene.getScene('Garden').debugState.farm.plots.find((q) => q.x === 13 && q.y === 13).tillStrikes >= 3, null, { timeout: 60000 });
const hov = await pt(13, 14);
await p.mouse.move(hov.x, hov.y);
await frames(5);
await p.screenshot({ path: shot('t021-1b-dang-cuoc.png') });
await p.waitForFunction(() => window.__game.scene.getScene('Garden').debugState.farm.tilled >= 2, null, { timeout: 120000 });
await frames(5);
await p.screenshot({ path: shot('t021-1c-cuoc-xong-2-o.png') });
await p.evaluate(() => window.__game.scene.getScene('Garden').debugSetTillTuning({ strikeSeconds: 0.85 }));

// 2) Đặt ruộng đủ nấc: hàng 13 = 0/2/4 nhát; hàng 14 = đã cuốc, đã tưới, đã cuốc+hạt; hàng 15 = cây các giai đoạn.
await p.evaluate(() => {
  const sc = window.__game.scene.getScene('Garden');
  const at = (x, y) => sc.farm.plots.find((q) => q.x === x && q.y === y);
  const set = (x, y, o) => Object.assign(at(x, y), { soil: 'untilled', tillStrikes: 0, crop: null, watered: false }, o);
  const T6 = { soil: 'tilled', tillStrikes: 6 };
  set(13, 13, {});
  set(14, 13, { tillStrikes: 2 });
  set(15, 13, { tillStrikes: 4 });
  set(13, 14, { ...T6, crop: { cropId: 'khoai-lang', age: 1, dryDays: 0, withered: false } });
  set(14, 14, { ...T6, watered: true, crop: { cropId: 'rau-cai', age: 0, dryDays: 0, withered: false } });
  set(15, 14, { ...T6, crop: { cropId: 'khoai-lang', age: 1, dryDays: 1, withered: false } });
  set(13, 15, { ...T6, watered: true, crop: { cropId: 'rau-cai', age: 1, dryDays: 0, withered: false } });
  set(14, 15, { ...T6, crop: { cropId: 'khoai-lang', age: 2, dryDays: 0, withered: false } });
  set(15, 15, { ...T6, crop: { cropId: 'rau-cai', age: 0, dryDays: 2, withered: true } });
  sc.debugTeleport(11, 17);
});
await frames(40);
await p.screenshot({ path: shot('t021-2-ruong-du-nac.png') });
const state = await p.evaluate(() => {
  const d = window.__game.scene.getScene('Garden').debugState;
  return { ground: d.ground, crops: d.crops.map((c) => `${c.x},${c.y} ${c.cropId} ${c.stage} thirsty=${c.thirsty} ${c.sprite}#${c.frame}`) };
});
console.log(JSON.stringify(state, null, 1));

// 3) Nhánh lối tới sạp hạt (góc lõm, mép cỏ).
await p.evaluate(() => window.__game.scene.getScene('Garden').debugTeleport(11, 25));
await frames(40);
await p.screenshot({ path: shot('t021-3-nhanh-sap-hat.png') });

// 4) Icon thật: gùi có hạt + nông sản, mở gùi (E).
await p.evaluate(() => {
  const sc = window.__game.scene.getScene('Garden');
  sc.debugSetSlot(3, 'rau-cai', 5);
  sc.debugSetSlot(4, 'khoai-lang', 3);
  sc.debugSetSlot(5, 'hat-rau-muong', 4);
  sc.debugSetSlot(6, 'dua-hau', 1);
  sc.debugSetSlot(7, 'lua-nep', 2);
  sc.debugSetSlot(8, 'hat-dua-hau', 2);
  sc.debugSetSlot(10, 'hat-lua-nep', 7);
  sc.debugTeleport(12, 14);
});
await frames(10);
await p.keyboard.press('KeyE');
await frames(20);
await p.screenshot({ path: shot('t021-4-gui-icon.png') });
await p.keyboard.press('KeyE');
await frames(10);

// 5) Sạp hạt (icon túi hạt trong cửa sổ).
await p.evaluate(() => window.__game.scene.getScene('Garden').openShop('seedStall'));
await frames(20);
await p.screenshot({ path: shot('t021-5-sap-hat.png') });
const hud = await p.evaluate(() => window.__game.scene.getScene('Garden').debugState.hud?.hotbarImages);
console.log('hotbarImages', JSON.stringify(hud));
console.log('fps', await p.evaluate(() => window.__game.loop.actualFps.toFixed(1)));
console.log('console errors/warnings:', errors.length ? errors.join('\n') : 'none');
await b.close();
