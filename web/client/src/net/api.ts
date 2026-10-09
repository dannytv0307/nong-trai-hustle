// Lớp gọi server. MỌI request tới backend đi qua đây (không fetch rải rác trong scene).
// - Đường dẫn tương đối /api/... : khi dev, Vite proxy chuyển sang http://localhost:3000.
// - credentials: 'include' để gửi cookie phiên đăng nhập (httpOnly, GDD §12).
// - Không ném lỗi ra ngoài khi mất mạng: trả về kết quả có cờ ok, để game vẫn chạy.
import { gameConfig } from '../config/gameConfig';
import type { HealthResponse } from '@bph/shared';

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number | null; error: string };

async function request<T>(path: string, init: RequestInit = {}): Promise<ApiResult<T>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), gameConfig.apiTimeoutMs);
  try {
    const res = await fetch(path, {
      ...init,
      credentials: 'include',
      headers: { Accept: 'application/json', ...(init.headers ?? {}) },
      signal: controller.signal,
    });
    if (!res.ok) return { ok: false, status: res.status, error: `HTTP ${res.status}` };
    const data = (await res.json()) as T;
    return { ok: true, data };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, status: null, error: controller.signal.aborted ? 'timeout' : msg };
  } finally {
    clearTimeout(timer);
  }
}

/** Kiểm tra server có sống không (GET /api/health). */
export function getHealth(): Promise<ApiResult<HealthResponse>> {
  return request<HealthResponse>('/api/health');
}
