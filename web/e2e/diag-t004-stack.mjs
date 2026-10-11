// QA T-004: ăn 3 khoai liền tay (chuột phải nhanh) → chữ "+8 Sức" chồng lên nhau?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto('http://localhost:5173/');
await page.waitForFunction(() => window.__game?.scene.getScene('Garden')?.debugState?.gardenReady, null, { timeout: 30000 });
const sc = (f) => page.evaluate((f) => new Function('s', f)(window.__game.scene.getScene('Garden')), f);
await sc('s.debugTeleport(12,14); s.debugSetStamina(20); s.debugSetSlot(2,"khoai-lang",5);');
await page.keyboard.press('3');
await page.waitForTimeout(800);
for (let i = 0; i < 3; i++) { await page.mouse.click(700, 400, { button: 'right' }); await page.waitForTimeout(60); }
await page.waitForTimeout(100);
console.log(JSON.stringify(await sc('return {cur:s.debugState.stamina.current, active:s.floats.map((f,i)=>s.floatLife[i]>0?{t:f.text,y:Math.round(f.y)}:null).filter(Boolean)}')));
await page.screenshot({ path: 'screenshots/qa-t004-eat-stack.png', clip: { x: 760, y: 300, width: 500, height: 300 } });
await b.close();
