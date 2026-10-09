// Smoke test: mở game, chờ scene Sandbox sẵn sàng, thử click + Space, chụp màn hình,
// và bảo đảm không có lỗi console.
import { expect, test, type ConsoleMessage } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCREENSHOT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'screenshots');

/** Trạng thái Sandbox đọc qua debug hook window.__game. */
interface SandboxProbe {
  ready: boolean;
  musicStarted: boolean;
  coinSfxCount: number;
  serverStatus: string;
  musicPlaying: boolean;
}

declare global {
  interface Window {
    // Kiểu tối thiểu — e2e không phụ thuộc Phaser.
    __game?: {
      registry: { get(key: string): unknown };
      scene: { isActive(key: string): boolean; getScene(key: string): Record<string, unknown> };
      sound: { get(key: string): { isPlaying: boolean } | null };
    };
  }
}

function probe(): SandboxProbe | null {
  const g = window.__game;
  if (!g) return null;
  const ready = g.scene.isActive('Sandbox') && g.registry.get('sandboxReady') === true;
  if (!ready) return { ready, musicStarted: false, coinSfxCount: 0, serverStatus: '', musicPlaying: false };
  const s = g.scene.getScene('Sandbox');
  return {
    ready,
    musicStarted: s.musicStarted === true,
    coinSfxCount: Number(s.coinSfxCount),
    serverStatus: String(s.serverStatus),
    musicPlaying: g.sound.get('music-vuon')?.isPlaying ?? false,
  };
}

/**
 * Lỗi được bỏ qua: trình duyệt tự ghi "Failed to load resource" khi /api/health không trả lời
 * (server chưa chạy → proxy Vite trả 5xx). Game đã xử lý trường hợp này (hiện "chưa chạy").
 */
function isIgnorable(msg: ConsoleMessage): boolean {
  return msg.text().startsWith('Failed to load resource') && msg.location().url.includes('/api/');
}

test('Sandbox mở được, có nhạc sau click, Space phát tiếng xu, không lỗi console', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if ((msg.type() === 'error' || msg.type() === 'warning') && !isIgnorable(msg)) {
      // Cảnh báo autoplay của Chrome trước lần click đầu là bình thường — chỉ ghi lại, không fail.
      if (msg.type() === 'error') errors.push(`[console.error] ${msg.text()}`);
      else console.log(`[console.warn] ${msg.text()}`);
    }
  });
  page.on('pageerror', (err) => errors.push(`[pageerror] ${err.message}`));

  // Từ T-001 trang chủ vào Vườn; sân thử 3.1 mở bằng ?scene=sandbox.
  await page.goto('/?scene=sandbox');
  await page.waitForFunction(() => window.__game !== undefined, null, { timeout: 15_000 });
  await expect.poll(() => page.evaluate(probe).then((p) => p?.ready), { timeout: 30_000 }).toBe(true);

  // Chờ kiểm tra server xong (online hoặc offline, không treo ở "checking").
  await expect
    .poll(() => page.evaluate(probe).then((p) => p?.serverStatus), { timeout: 10_000 })
    .not.toBe('checking');

  // Click lần đầu → nhạc Vườn chạy (chính sách autoplay).
  await page.mouse.click(960, 900);
  await expect.poll(() => page.evaluate(probe).then((p) => p?.musicStarted), { timeout: 10_000 }).toBe(true);

  // Space → tiếng nhặt xu.
  await page.keyboard.press('Space');
  await expect
    .poll(() => page.evaluate(probe).then((p) => p?.coinSfxCount ?? 0), { timeout: 5_000 })
    .toBeGreaterThanOrEqual(1);

  // Đi thử sang phải nửa giây (nhân vật quay mặt phải).
  await page.keyboard.down('KeyD');
  await page.waitForTimeout(500);
  await page.keyboard.up('KeyD');

  mkdirSync(SCREENSHOT_DIR, { recursive: true });
  await page.screenshot({ path: join(SCREENSHOT_DIR, 'sandbox-1920x1080.png') });

  const final = await page.evaluate(probe);
  console.log('[smoke] trạng thái:', JSON.stringify(final));
  expect(errors, errors.join('\n')).toEqual([]);
});
