import type { FastifyPluginAsync } from 'fastify';
import type { HealthResponse } from '@bph/shared';
import { pingDb } from '../db.js';
import { SERVER_VERSION } from '../version.js';

/** GET /healthz (Cloud Run / Docker) và GET /api/health (client gọi qua proxy Vite). */
export const healthRoutes: FastifyPluginAsync = async (app) => {
  const handler = async (): Promise<HealthResponse> => ({
    ok: true,
    db: await pingDb(app.db),
    version: SERVER_VERSION,
  });

  const opts = { config: { rateLimit: false as const } };
  // /healthz bị Docker/Cloud Run gọi định kỳ -> không ghi log từng lần cho đỡ rác.
  app.get('/healthz', { ...opts, logLevel: 'silent' }, handler);
  app.get('/api/health', opts, handler);
};
