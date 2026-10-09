/// <reference types="vitest/config" />
import { defineConfig } from 'vite';

// Cấu hình Vite (công cụ chạy thử + đóng gói web).
// - Cổng 5173 cố định để Playwright/QA luôn biết địa chỉ.
// - /api được chuyển tiếp (proxy) sang server Fastify ở cổng 3000, nên client gọi
//   cùng địa chỉ với trang (không vướng CORS, cookie đăng nhập dùng được).
export default defineConfig({
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
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
