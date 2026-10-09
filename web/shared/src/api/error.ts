/** Dạng lỗi chung server trả về (mọi mã 4xx/5xx). */
export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}
