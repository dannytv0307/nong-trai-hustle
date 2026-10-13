// Điểm khởi động: đọc .env, dựng app, mở cổng, tắt êm khi nhận tín hiệu dừng.
import 'dotenv/config';
import { buildApp } from './app.js';
import { ConfigError, loadConfig, type AppConfig } from './config.js';

let config: AppConfig;
try {
  config = loadConfig();
} catch (err) {
  // Thiếu/sai biến môi trường: in MỘT dòng dễ hiểu (tên biến + chỗ sửa), không stack trace.
  if (err instanceof ConfigError) {
    console.error(err.message);
    process.exit(1);
  }
  throw err;
}
const app = await buildApp({ config });

const shutdown = async (signal: string): Promise<void> => {
  app.log.info({ signal }, 'đang tắt server');
  await app.close();
  process.exit(0);
};
process.once('SIGINT', () => void shutdown('SIGINT'));
process.once('SIGTERM', () => void shutdown('SIGTERM'));

try {
  await app.listen({ host: config.host, port: config.port });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
