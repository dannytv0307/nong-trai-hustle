// KHUNG cho bước 3.4 — route chưa được viết. Nội dung `data` do client định nghĩa.

/** Giới hạn kích thước body PUT /api/save (byte). */
export const SAVE_MAX_BYTES = 256 * 1024;

/** GET /api/save → 200 (404 nếu chưa có save). */
export interface SaveResponse<TData = unknown> {
  /** Phiên bản định dạng save (client tăng khi đổi cấu trúc). */
  version: number;
  updatedAt: string; // ISO 8601
  data: TData;
}

/** PUT /api/save — server trả 409 nếu bản trên server mới hơn `baseUpdatedAt`. */
export interface PutSaveRequest<TData = unknown> {
  version: number;
  data: TData;
  /** `updatedAt` của bản client đã tải về lần cuối; null nếu chưa từng có save. */
  baseUpdatedAt: string | null;
}
