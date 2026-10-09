import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    environment: 'node',
    // Test dùng chung CSDL local nên chạy tuần tự từng file cho an toàn.
    fileParallelism: false,
    // Lần chạy đầu trên Windows nạp plugin khá chậm.
    testTimeout: 20_000,
    hookTimeout: 20_000,
  },
});
