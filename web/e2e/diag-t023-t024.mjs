// Chẩn đoán T-023 (dáng tưới / cúi) + T-024 (nhà, thúng bán, quầy hạt, cây nhãn, rào): chụp ảnh + thử va chạm.
// Chạy: node diag-t023-t024.mjs (cần dev client ở http://localhost:5173). Ảnh lưu ở screenshots/t023-*.png, t024-*.png.
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
const ready = () => p.waitForFunction(() => window.__game?.scene?.getScene('Garden')?.debugState?.gardenReady, null, { timeout: 60000 });
await p.goto('http://localhost:5173/');
await ready();
await p.evaluate(() => window.__game.scene.getScene('Garden').debugClearSave());
await p.reload();
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
const pt = (x, y) => G(([a, c]) => window.__game.scene.getScene('Garden').debugTileToScreen(a, c), [x, y]);
const out = {};

// ---------------- T-024: va chạm (giữ phím đi một lúc, đọc chân dừng ở đâu)
const push = async (name, tx, ty, key, n = 45) => {
  await tp(tx, ty);
  await frames(3);
  await p.keyboard.down(key);
  await frames(n);
  await p.keyboard.up(key);
  await frames(3);
  const s = await state();
  out[name] = { footX: Math.round(s.footX), footY: Math.round(s.footY), tile: [s.tileX, s.tileY] };
};
await push('nha (đi lên từ sân 9,12)', 9, 12, 'KeyW');
await push('quay hat (đi xuống từ 14,25)', 14, 25, 'KeyS');
await push('goc nhan 19,15 (đi lên từ 19,17)', 19, 17, 'KeyW');
await push('rao tren (đi lên từ 5,2)', 5, 2, 'KeyW');
await push('rao trai (đi trái từ 2,20)', 2, 20, 'KeyA');
await push('thung (đi lên từ 17,13)', 17, 13, 'KeyW');
await push('sau mai nha (đi xuống từ 10,7)', 10, 7, 'KeyS');

// ---------------- T-024: nhà + sân + thúng đóng
await tp(11, 11);
await frames(40);
await p.screenshot({ path: shot('t024-1-nha-thung-dong.png') });
// thúng hé: có đồ chờ bán
await G(() => window.__game.scene.getScene('Garden').debugSetSellBoxSlot(0, 'rau-cai', 3));
await frames(5);
out.basketWithItems = (await state()).props.sellBasket;
await tp(15, 12);
await frames(40);
await p.screenshot({ path: shot('t024-2-thung-he-ruong.png') });
await G(() => window.__game.scene.getScene('Garden').debugSetSellBoxSlot(0, null, 0));
await frames(5);
out.basketEmpty = (await state()).props.sellBasket;

// ---------------- T-024: đi sau cây nhãn (tán che + mờ), quầy hạt, góc rào
await tp(19, 4);
await frames(40);
out.canopyBehind = (await state()).props.canopyAlpha.filter((a) => a < 1).length;
await p.screenshot({ path: shot('t024-3-sau-cay-nhan.png') });
await tp(13, 25);
await frames(40);
await p.screenshot({ path: shot('t024-4-quay-hat.png') });
await tp(3, 3);
await frames(40);
await p.screenshot({ path: shot('t024-5-goc-rao.png') });

// ---------------- T-023: tưới / cúi (chậm động tác lại 3 s để chụp đúng khung chạm)
await G(() => {
  const sc = window.__game.scene.getScene('Garden');
  const at = (x, y) => sc.farm.plots.find((q) => q.x === x && q.y === y);
  const set = (x, y, o) => Object.assign(at(x, y), { soil: 'untilled', tillStrikes: 0, crop: null, watered: false }, o);
  const T6 = { soil: 'tilled', tillStrikes: 6 };
  set(13, 14, { ...T6, crop: { cropId: 'rau-cai', age: 0, dryDays: 0, withered: false } }); // chưa tưới → tưới
  set(14, 15, { ...T6 }); // đất cuốc trống → gieo
  set(13, 15, { ...T6, watered: true, crop: { cropId: 'rau-cai', age: 1, dryDays: 0, withered: false } }); // chín → hái
  sc.debugSetTestTuning({ fastActionSeconds: 3 });
});
const doJob = async (heroTx, heroTy, tx, ty, name, wantAnim) => {
  await tp(heroTx, heroTy);
  await frames(90); // camera bám kịp (lerp) rồi mới đổi ô → toạ độ màn
  const s0 = await pt(tx, ty);
  await p.mouse.move(s0.x, s0.y);
  await p.mouse.down();
  await frames(2);
  await p.mouse.up();
  // Dừng vòng lặp game ngay khi khung CHẠM hiện → ảnh chụp đúng khung đó.
  await p.waitForFunction(
    () => {
      const g = window.__game;
      if (g.scene.getScene('Garden').debugState.actionAnim.frame !== 2) return false;
      g.loop.sleep();
      return true;
    },
    null,
    { timeout: 20000, polling: 'raf' },
  );
  const s = await state();
  out[name] = { anim: s.actionAnim.anim, frame: s.actionAnim.frame, texture: s.textureKey, originY: s.heroOriginY, facing: s.facing };
  if (s.actionAnim.anim !== wantAnim) out[name].WRONG = true;
  await p.screenshot({ path: shot(`${name}.png`), clip: { x: 560, y: 240, width: 800, height: 600 } });
  await G(() => window.__game.loop.wake());
  await p.waitForFunction(() => !window.__game.scene.getScene('Garden').debugState.action.busy, null, { timeout: 20000 });
  await frames(5);
};
await doJob(12, 14, 13, 14, 't023-1-tuoi-phai', 'water');
await doJob(14, 16, 14, 15, 't023-2-cui-gieo-len', 'bend');
await doJob(12, 15, 13, 15, 't023-3-cui-hai-phai', 'bend');
out.harvestFrom = (await state()).actionAnim.lastHarvestFrom;

// Đang đi mà làm việc nhanh → giữ khung bước (không trượt).
await G(() => {
  const sc = window.__game.scene.getScene('Garden');
  const at = (x, y) => sc.farm.plots.find((q) => q.x === x && q.y === y);
  Object.assign(at(15, 13), { soil: 'tilled', tillStrikes: 6, crop: { cropId: 'rau-cai', age: 0, dryDays: 0, withered: false }, watered: false });
  sc.debugSetTestTuning({ fastActionSeconds: 6 });
});
await tp(16, 14);
await frames(90);
const sw = await pt(15, 13);
await p.mouse.move(sw.x, sw.y);
await p.mouse.down();
await frames(2);
await p.mouse.up();
await p.keyboard.down('KeyS');
await frames(6);
const walking = await state();
await p.keyboard.up('KeyS');
out.walkingWhileWater = { busy: walking.action.busy, kind: walking.action.kind, anim: walking.actionAnim.anim, texture: walking.textureKey };
await G(() => window.__game.scene.getScene('Garden').debugSetTestTuning({ fastActionSeconds: 0.4 }));

console.log(JSON.stringify(out, null, 1));
console.log('fallbacks:', JSON.stringify((await state()).props.fallbacks));
console.log('errors:', errors.length ? errors.join('\n') : 'none');
await b.close();
