// Chẩn đoán QA T-001: ghi quỹ đạo từng frame khi trượt dọc tường nhà.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto('http://localhost:5173/');
await p.waitForFunction(() => window.__game?.scene?.getScene('Garden')?.debugState?.gardenReady);
const T = 64;
async function run(name, x, y, keys, frames) {
  await p.evaluate(([a, c]) => { const sc = window.__game.scene.getScene('Garden'); sc.feetBody.reset(a, c); sc.prevFootX = a; sc.prevFootY = c; }, [x, y]);
  await p.waitForTimeout(200);
  await p.evaluate((n) => { const sc = window.__game.scene.getScene('Garden'); window.__r = []; window.__f = () => { const bd = sc.feetBody; window.__r.push([+bd.center.x.toFixed(1), +bd.center.y.toFixed(1), +bd.velocity.x.toFixed(0), +bd.velocity.y.toFixed(0), bd.blocked.up?'U':'', bd.blocked.right?'R':'', bd.blocked.left?'L':'', bd.blocked.down?'D':'' ].join(' ')); }; sc.events.on('postupdate', window.__f); }, frames);
  for (const k of keys) await p.keyboard.down(k);
  await p.waitForFunction((n) => window.__r.length >= n, frames, { timeout: 120000, polling: 50 });
  for (const k of keys) await p.keyboard.up(k);
  const r = await p.evaluate(() => { const sc = window.__game.scene.getScene('Garden'); sc.events.off('postupdate', window.__f); return window.__r; });
  console.log('==', name, 'frames', r.length, 'fps', await p.evaluate(() => window.__game.loop.actualFps.toFixed(1)));
  const out = r.filter((_, i) => i % Math.ceil(r.length / 25) === 0 || i === r.length - 1);
  console.log(out.join('\n'));
}
const which = process.argv[2] || 'all';
if (which === 'bed') {
  await run('spawn đi W', 704, 832, ['KeyW'], 12);
  await run('trong nhà đi A', 704, 480, ['KeyA'], 30);
}
if (which === 'seam3') {
  await run('mặt trái nhà qua y=256, D+W', 300, 290, ['KeyD', 'KeyW'], 40);
  await run('mặt trái nhà lại qua 640, D+W (lần 2)', 300, 700, ['KeyD', 'KeyW'], 30);
  await run('mặt trái rào phải (x=47) qua…, D+W', 2988, 1900, ['KeyD', 'KeyW'], 30);
  await run('gốc cây (24,19) từ trái ép D+W', 1500, 1290, ['KeyD', 'KeyW'], 40);
}
if (which === 'seam2') {
  await run('mặt trái nhà từ giữa lên qua y=256, D+W', 300, 400, ['KeyD', 'KeyW'], 40);
  await run('mặt trái nhà xuống qua y=256 và 640, D+S', 300, 230, ['KeyD', 'KeyS'], 70);
  await run('mặt phải nhà lên qua 640 và 256, A+W', 1044, 690, ['KeyA', 'KeyW'], 70);
  await run('mặt trái nhà chỉ W', 300, 690, ['KeyW'], 40);
}
if (which === 'seam') {
  await run('mặt trái nhà, D+W', 300, 690, ['KeyD', 'KeyW'], 60);
  await run('mặt phải nhà, A+S', 1044, 200, ['KeyA', 'KeyS'], 60);
  await run('mặt trên nhà, S+D', 330, 182, ['KeyS', 'KeyD'], 60);
  await run('mặt dưới trái cửa, W+D', 330, 714, ['KeyW', 'KeyD'], 40);
  await run('trong nhà mặt phải trong, D+S', 940, 340, ['KeyD', 'KeyS'], 40);
}
if (which === 'all' || which === 'a') await run('cạnh trái nhà, D+W', 4 * T + 20, 12 * T + 10, ['KeyD', 'KeyW'], 120);
if (which === 'all' || which === 'b') await run('cạnh phải nhà, A+S', 16 * T + 30, 2 * T + 32, ['KeyA', 'KeyS'], 120);
if (which === 'all' || which === 'c') await run('trên nhà, S+D', 4 * T + 32, 2 * T + 40, ['KeyS', 'KeyD'], 120);
if (which === 'all' || which === 'd') await run('dưới nhà phải cửa, W+A', 15 * T + 32, 11 * T + 30, ['KeyW', 'KeyA'], 80);
if (which === 'all' || which === 'e') await run('trong nhà, S+D ra cửa', 6 * T + 30, 9 * T + 40, ['KeyS', 'KeyD'], 80);
await b.close();
