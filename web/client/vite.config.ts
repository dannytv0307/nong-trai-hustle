/// <reference types="vitest/config" />
import { defineConfig } from 'vite';

// Cấu hình Vite (công cụ chạy thử + đóng gói web).
// - Cổng 5173 cố định để Playwright/QA luôn biết địa chỉ.
// - /api được chuyển tiếp (proxy) sang server Fastify ở cổng 3000, nên client gọi
//   cùng địa chỉ với trang (không vướng CORS, cookie đăng nhập dùng được).
// - Khi chạy trong Docker (docker-compose.yml) các biến môi trường dưới đây được đặt:
//   BPH_DEV_HOST=0.0.0.0 (cho máy ngoài container truy cập), BPH_API_TARGET=http://server:3000,
//   BPH_USE_POLLING=1 (Docker trên Windows không báo file đổi → quét định kỳ để hot reload).
//   Chạy thẳng trên máy (npm run dev:client) thì không có biến nào → giữ mặc định cũ.
const devHost = process.env.BPH_DEV_HOST || undefined;
const apiTarget = process.env.BPH_API_TARGET || 'http://localhost:3000';
const usePolling = process.env.BPH_USE_POLLING === '1';

export default defineConfig({
  server: {
    port: 5173,
    strictPort: true,
    host: devHost,
    watch: usePolling ? { usePolling: true, interval: 300 } : undefined,
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 4173,
    strictPort: true,
  },
  build: {
    target: 'es2022',
    // Phaser nặng ~1.2 MB (chưa nén) — chấp nhận, không cần cảnh báo.
    chunkSizeWarningLimit: 2000,
  },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
