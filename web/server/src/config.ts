// Đọc và kiểm tra biến môi trường. Sai/thiếu thì báo lỗi rõ ràng ngay lúc khởi động
// (chỉ in tên biến và lý do, không bao giờ in giá trị bí mật).
import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HOST: z.string().default('localhost'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info'),
  DATABASE_URL: z
    .string()
    .refine((v) => /^postgres(ql)?:\/\//.test(v), 'phải là chuỗi kết nối postgresql://'),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  SESSION_SECRET: z.string().min(32, 'cần ít nhất 32 ký tự ngẫu nhiên'),
});

/** Lỗi cấu hình: message một dòng, chỉ có tên biến + lý do (không bao giờ có giá trị). */
export class ConfigError extends Error {
  override name = 'ConfigError';
}

export interface AppConfig {
  nodeEnv: 'development' | 'test' | 'production';
  isProduction: boolean;
  host: string;
  port: number;
  logLevel: string;
  databaseUrl: string;
  clientOrigins: string[];
  sessionSecret: string;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const parsed = EnvSchema.safeParse(env);
  if (!parsed.success) {
    const problems = parsed.error.issues.map((i) => {
      const key = i.path.join('.');
      const raw = env[key];
      return raw === undefined || raw === '' ? `${key} (thiếu)` : `${key} (${i.message})`;
    });
    throw new ConfigError(
      `[config] Thiếu hoặc sai biến môi trường: ${problems.join(', ')} — sửa ở web/server/.env ` +
        '(mẫu: web/server/.env.example; bấm web/start.bat sẽ tự tạo file này nếu chưa có).',
    );
  }
  const e = parsed.data;
  return {
    nodeEnv: e.NODE_ENV,
    isProduction: e.NODE_ENV === 'production',
    host: e.HOST,
    port: e.PORT,
    logLevel: e.LOG_LEVEL,
    databaseUrl: e.DATABASE_URL,
    clientOrigins: e.CLIENT_ORIGIN.split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    sessionSecret: e.SESSION_SECRET,
  };
}
