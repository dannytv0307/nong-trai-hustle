// Smoke T-001 trên Microsoft Edge (kênh msedge) — QA.
import { chromium } from '@playwright/test';
const b = await chromium.launch({ channel: 'msedge' });
const p = await b.newPage({ viewport: { width: 1366, height: 768 } });
const errs = [];
p.on('response', (r) => r.status() >= 400 && errs.push(r.status() + ' ' + r.url()));
p.on('pageerror', (e) => errs.push(e.message));
p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
await p.goto('http://localhost:5173/');
await p.waitForFunction(() => window.__game?.scene?.getScene('Garden')?.debugState?.gardenReady, null, { timeout: 30000 });
const a = await p.evaluate(() => window.__game.scene.getScene('Garden').debugState);
await p.keyboard.down('KeyD'); await p.keyboard.down('KeyS');
await p.waitForTimeout(1200);
await p.keyboard.up('KeyD'); await p.keyboard.up('KeyS');
const c = await p.evaluate(() => window.__game.scene.getScene('Garden').debugState);
console.log('edge', await b.version(), 'from', a.footX, a.footY, 'to', c.footX.toFixed(0), c.footY.toFixed(0), 'facing', c.facing, 'fps', await p.evaluate(() => window.__game.loop.actualFps.toFixed(1)), 'errors', errs);
await p.screenshot({ path: 'screenshots/qa-t001-edge-1366.png' });
await b.close();
