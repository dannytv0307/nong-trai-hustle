// Dựng app Fastify (không listen) để test gọi bằng app.inject() mà không mở cổng.
import Fastify, { type FastifyInstance } from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { SAVE_MAX_BYTES } from '@bph/shared';
import type { AppConfig } from './config.js';
import { createDb, type Db } from './db.js';
import { healthRoutes } from './routes/health.js';

declare module 'fastify' {
  interface FastifyInstance {
    appConfig: AppConfig;
    db: Db;
  }
}

export interface BuildAppOptions {
  config: AppConfig;
  /** Test có thể truyền DB giả; mặc định tạo Prisma client thật từ config.databaseUrl. */
  db?: Db;
}

export async function buildApp({ config, db }: BuildAppOptions): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: config.logLevel,
      // Không bao giờ ghi cookie/authorization ra log.
      redact: ['req.headers.cookie', 'req.headers.authorization', 'res.headers["set-cookie"]'],
    },
    // Lớn hơn giới hạn save một chút để route save (bước 3.4) tự trả lỗi rõ ràng.
    bodyLimit: SAVE_MAX_BYTES + 16 * 1024,
    // Cloud Run đứng sau proxy của Google: tin X-Forwarded-For để rate limit đúng IP.
    trustProxy: config.isProduction,
  });

  const ownsDb = !db;
  const database = db ?? createDb(config.databaseUrl);
  app.decorate('appConfig', config);
  app.decorate('db', database);
  if (ownsDb) {
    app.addHook('onClose', async () => {
      await database.$disconnect();
    });
  }

  await app.register(helmet);
  await app.register(cors, {
    origin: config.clientOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  });
  await app.register(cookie, { secret: config.sessionSecret });
  // Giới hạn chung khá rộng; route đăng nhập/đăng ký (bước 3.4) sẽ đặt mức chặt hơn riêng.
  await app.register(rateLimit, {
    global: true,
    max: 300,
    timeWindow: '1 minute',
  });

  await app.register(healthRoutes);

  return app;
}
