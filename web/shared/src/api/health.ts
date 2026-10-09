/** GET /healthz và GET /api/health */
export interface HealthResponse {
  /** Server đang chạy. */
  ok: boolean;
  /** Kết nối CSDL được (truy vấn `SELECT 1` thành công). */
  db: boolean;
  /** Phiên bản server (từ package.json). */
  version: string;
}
