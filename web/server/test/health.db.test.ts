// Test với Postgres THẬT (docker compose up -d db + đã migrate).
// Bỏ qua bằng biến môi trường SKIP_DB_TESTS=1 (vd. máy không có Docker).
import 'dotenv/config';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import type { HealthResponse } from '@bph/shared';
import { buildApp } from '../src/app.js';
import { loadConfig } from '../src/config.js';

const skip = process.env.SKIP_DB_TESTS === '1';

describe.skipIf(skip)('health (Postgres thật)', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    const config = { ...loadConfig(), logLevel: 'silent' };
    app = await buildApp({ config });
  });
  afterAll(async () => {
    await app?.close();
  });

  it('/api/health báo db:true (nếu fail: chạy `cd web && docker compose up -d db`)', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/health' });
    expect(res.statusCode).toBe(200);
    expect(res.json<HealthResponse>()).toMatchObject({ ok: true, db: true });
  });

  it('migration đầu tiên đã chạy: đủ 4 bảng User, AuthAccount, Session, Save', async () => {
    const rows = await app.db.$queryRaw<{ table_name: string }[]>`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name IN ('User', 'AuthAccount', 'Session', 'Save')`;
    expect(rows.map((r) => r.table_name).sort()).toEqual(['AuthAccount', 'Save', 'Session', 'User']);
  });
});
