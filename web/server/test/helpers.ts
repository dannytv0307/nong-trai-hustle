import type { AppConfig } from '../src/config.js';
import type { Db } from '../src/db.js';

export function testConfig(overrides: Partial<AppConfig> = {}): AppConfig {
  return {
    nodeEnv: 'test',
    isProduction: false,
    host: '127.0.0.1',
    port: 0,
    logLevel: 'silent',
    databaseUrl: 'postgresql://unused@localhost:1/unused',
    clientOrigins: ['http://localhost:5173'],
    sessionSecret: 'test-secret-test-secret-test-secret-123',
    ...overrides,
  };
}

/** DB giả: chỉ có $queryRaw (đủ cho health), có thể cho "sống" hoặc "chết". */
export function fakeDb(alive: boolean): Db {
  const fake = {
    $queryRaw: () => (alive ? Promise.resolve([{ '?column?': 1 }]) : Promise.reject(new Error('down'))),
    $disconnect: () => Promise.resolve(),
  };
  return fake as unknown as Db;
}
