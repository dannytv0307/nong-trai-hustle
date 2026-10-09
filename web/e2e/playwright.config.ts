import { defineConfig, devices } from '@playwright/test';

// Kiểm thử trình duyệt tự động. Mặc định chạy với dev server của client (cổng 5173):
// nếu đã có dev server đang chạy thì dùng luôn, chưa có thì Playwright tự bật rồi tự tắt.
const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:5173';

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  timeout: 60_000,
  fullyParallel: false,
  reporter: [['list']],
  use: {
    ...devices['Desktop Chrome'],
    baseURL: BASE_URL,
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium' }],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'npm run dev',
        cwd: '../client',
        url: BASE_URL,
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
