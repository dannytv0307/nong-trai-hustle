// QA T-003: bản build production (vite preview trên dist/) KHÔNG có phím thử G (devCheatsEnabled = false).
// Chỉ chạy khi đặt QA_PROD=1 và E2E_BASE_URL trỏ vào bản preview, ví dụ:
//   (cd web/client && npx vite preview --port 4173 --strictPort)
//   QA_PROD=1 E2E_BASE_URL=http://localhost:4173 npx playwright test qa-t003-prod
import { expect, test, type Page } from '@playwright/test';

type GameHook = {
  loop: { frame: number };
  scene: { isActive(k: string): boolean; getScene(k: string): Record<string, unknown> & { debugState: Record<string, unknown> } };
};

test.skip(!process.env.QA_PROD, 'chỉ chạy với QA_PROD=1 trên bản build');

async function ds(page: Page): Promise<Record<string, any> | null> {
  return page.evaluate(() => {
    const g = (window as unknown as { __game?: GameHook }).__game;
    if (!g || !g.scene.isActive('Garden')) return null;
    const s = g.scene.getScene('Garden').debugState as Record<string, any>;
    return s?.gardenReady ? s : null;
  });
}

test('bản build: G không qua đêm, cây đã tưới không lớn', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error' && !m.location().url.includes('/api/')) errors.push(m.text());
  });
  await page.goto('/');
  await expect.poll(() => ds(page).then((s) => s !== null), { timeout: 30_000 }).toBe(true);
  // Ruộng giả lập trực tiếp bằng logic (không cần click): gieo + tưới qua debug của scene nếu có.
  const r = await page.evaluate(() => {
    const sc = (window as unknown as { __game: GameHook }).__game.scene.getScene('Garden') as Record<string, any>;
    const farm = sc.farm as { plots: { soil: string; tillStrikes: number; watered: boolean; crop: unknown }[] };
    const p = farm.plots[0];
    p.soil = 'tilled';
    p.tillStrikes = 6;
    p.crop = { cropId: 'rau-cai', age: 0, dryDays: 0, withered: false };
    p.watered = true;
    return { hasFarm: !!farm };
  });
  expect(r.hasFarm).toBe(true);
  const nights0 = (await ds(page))!.farmJuice.nights;
  await page.locator('canvas').click({ position: { x: 5, y: 5 } }).catch(() => undefined);
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('g');
    const f = await page.evaluate(() => (window as unknown as { __game: GameHook }).__game.loop.frame);
    await page.waitForFunction((t) => (window as unknown as { __game: GameHook }).__game.loop.frame >= t, f + 5);
  }
  const s = (await ds(page))!;
  expect(s.farmJuice.nights).toBe(nights0);
  expect(s.crops[0]).toMatchObject({ age: 0, watered: true, ripe: false });
  await page.screenshot({ path: 'screenshots/qa-t003-prod-no-g.png' });
  expect(errors).toEqual([]);
});
