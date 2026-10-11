// QA T-004: bản build (vite preview :4173) — F8 không trừ Sức, gợi ý phím không có "Phím thử"; chuột phải ăn vẫn chạy.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 1920, height: 1080 } });
const errs = [];
page.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
page.on('pageerror', (e) => errs.push(e.message));
await page.goto('http://localhost:4173/');
await page.waitForFunction(() => window.__game?.scene.getScene('Garden')?.debugState?.gardenReady, null, { timeout: 30000 });
const sc = (fn) => page.evaluate((f) => new Function('s', f)(window.__game.scene.getScene('Garden')), fn);
for (let i = 0; i < 4; i++) { await page.keyboard.press('F8'); await page.waitForTimeout(150); }
const after = await sc('return {cur: s.debugState.stamina.current, floats: s.debugState.stamina.floatLog}');
const hint = await page.evaluate(() => window.__game.scene.getScene('GardenHud').children.list.filter(o => o.type === 'Text').map(o => o.text).join(' | '));
console.log('F8 x4 →', JSON.stringify(after));
console.log('HUD text:', hint);
await sc('s.debugSetStamina(10); s.debugSetSlot(2,"khoai-lang",2);');
await page.keyboard.press('3');
await page.waitForTimeout(300);
await page.mouse.click(700, 400, { button: 'right' });
await page.waitForTimeout(300);
console.log('ăn ở bản build →', JSON.stringify(await sc('return s.debugState.stamina.current')));
await page.screenshot({ path: 'screenshots/qa-t004-prod.png' });
console.log('errors', errs);
await b.close();
