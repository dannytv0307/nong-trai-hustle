// Tìm request 4xx/5xx khi mở game — QA.
import { chromium } from '@playwright/test';
for (const channel of ['msedge', undefined]) {
  const b = await chromium.launch(channel ? { channel } : {});
  const p = await b.newPage();
  p.on('response', (r) => r.status() >= 400 && console.log(channel ?? 'chromium', r.status(), r.url()));
  await p.goto('http://localhost:5173/');
  await p.waitForTimeout(5000);
  await b.close();
}
