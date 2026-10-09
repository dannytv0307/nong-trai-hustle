// Test bằng DB GIẢ (không cần Postgres): khung app, health, helmet, CORS, config.
import { afterEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import type { HealthResponse } from '@bph/shared';
import { buildApp } from '../src/app.js';
import { loadConfig } from '../src/config.js';
import { SERVER_VERSION } from '../src/version.js';
import { fakeDb, testConfig } from './helpers.js';

let app: FastifyInstance | undefined;
afterEach(async () => {
  await app?.close();
  app = undefined;
});

describe('health (DB giả)', () => {
  for (const url of ['/healthz', '/api/health']) {
    it(`${url} trả ok + db:true khi DB sống`, async () => {
      app = await buildApp({ config: testConfig(), db: fakeDb(true) });
      const res = await app.inject({ method: 'GET', url });
      expect(res.statusCode).toBe(200);
      expect(res.json<HealthResponse>()).toEqual({ ok: true, db: true, version: SERVER_VERSION });
    });

    it(`${url} vẫn trả 200 nhưng db:false khi DB chết`, async () => {
      app = await buildApp({ config: testConfig(), db: fakeDb(false) });
      const res = await app.inject({ method: 'GET', url });
      expect(res.statusCode).toBe(200);
      expect(res.json<HealthResponse>().db).toBe(false);
    });
  }

  it('route không tồn tại trả 404', async () => {
    app = await buildApp({ config: testConfig(), db: fakeDb(true) });
    const res = await app.inject({ method: 'GET', url: '/api/khong-co' });
    expect(res.statusCode).toBe(404);
  });
});

describe('plugin bảo mật', () => {
  it('helmet gắn header bảo mật', async () => {
    app = await buildApp({ config: testConfig(), db: fakeDb(true) });
    const res = await app.inject({ method: 'GET', url: '/healthz' });
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['content-security-policy']).toBeDefined();
  });

  it('CORS cho phép origin của client, kèm credentials', async () => {
    app = await buildApp({ config: testConfig(), db: fakeDb(true) });
    const res = await app.inject({
      method: 'GET',
      url: '/api/health',
      headers: { origin: 'http://localhost:5173' },
    });
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });

  it('CORS không cho origin lạ', async () => {
    app = await buildApp({ config: testConfig(), db: fakeDb(true) });
    const res = await app.inject({
      method: 'GET',
      url: '/api/health',
      headers: { origin: 'https://evil.example' },
    });
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('rate limit chung đã bật (có header x-ratelimit) cho route API thường', async () => {
    app = await buildApp({ config: testConfig(), db: fakeDb(true) });
    app.get('/api/_probe', async () => ({ ok: true }));
    const res = await app.inject({ method: 'GET', url: '/api/_probe' });
    expect(res.headers['x-ratelimit-limit']).toBeDefined();
  });
});

describe('loadConfig', () => {
  const base = {
    DATABASE_URL: 'postgresql://u:p@localhost:5432/db',
    SESSION_SECRET: 'x'.repeat(40),
  };

  it('đọc giá trị mặc định', () => {
    const c = loadConfig(base);
    expect(c.port).toBe(3000);
    expect(c.clientOrigins).toEqual(['http://localhost:5173']);
    expect(c.isProduction).toBe(false);
  });

  it('báo lỗi khi SESSION_SECRET quá ngắn, không lộ giá trị', () => {
    const secret = 'ngan-qua-123';
    expect(() => loadConfig({ ...base, SESSION_SECRET: secret })).toThrow(/SESSION_SECRET/);
    try {
      loadConfig({ ...base, SESSION_SECRET: secret });
    } catch (e) {
      expect(String(e)).not.toContain(secret);
    }
  });

  it('báo lỗi khi DATABASE_URL sai dạng', () => {
    expect(() => loadConfig({ ...base, DATABASE_URL: 'mysql://x' })).toThrow(/DATABASE_URL/);
  });
});
