// QA T-004: đo độ đục chữ "+8 Sức" theo thời gian sau khi ăn (1366×768), chụp vài khung.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 1366, height: 768 } });
await page.goto('http://localhost:5173/');
await page.waitForFunction(() => window.__game?.scene.getScene('Garden')?.debugState?.gardenReady, null, { timeout: 30000 });
const sc = (fn, ...a) => page.evaluate(([f, a]) => { const s = window.__game.scene.getScene('Garden'); return new Function('s', 'a', f)(s, a); }, [fn, a]);
await sc('s.debugTeleport(12,14); s.debugSetStamina(30); s.debugSetSlot(2,"khoai-lang",3);');
await page.keyboard.press('3');
await page.waitForTimeout(800);
const box = await page.locator('canvas').boundingBox();
const t0 = await sc('return s.debugTileToScreen(11,12)');
await page.mouse.click(box.x + t0.x * box.width / 1920, box.y + t0.y * box.height / 1080, { button: 'right' });
for (let i = 0; i < 8; i++) {
  const r = await sc('const i = s.floatLife.findIndex(l=>l>0); if(i<0) return null; const f=s.floats[i]; return {life:s.floatLife[i], alpha:f.alpha, text:f.text, y:f.y, frame: window.__game.loop.frame, fps: window.__game.loop.actualFps}');
  console.log(JSON.stringify(r));
  if (i === 1) await page.screenshot({ path: 'screenshots/qa-t004-1366-eat-early.png', clip: { x: 500, y: 200, width: 400, height: 250 } });
  await page.waitForTimeout(120);
}
await b.close();
