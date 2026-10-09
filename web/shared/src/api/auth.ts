// KHUNG cho bước 3.4 — route chưa được viết. Có thể đổi khi làm thật.

export type AuthProvider = 'email' | 'google' | 'facebook';

/** Thông tin người dùng trả về cho client (không bao giờ có mật khẩu/hash). */
export interface PublicUser {
  id: string;
  email: string | null;
  displayName: string;
  providers: AuthProvider[];
  createdAt: string; // ISO 8601
}

/** POST /api/auth/register */
export interface RegisterRequest {
  email: string;
  /** Tối thiểu 8 ký tự. */
  password: string;
  displayName: string;
}

/** POST /api/auth/login */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Trả về bởi register, login, GET /api/auth/me */
export interface AuthUserResponse {
  user: PublicUser;
}

export const PASSWORD_MIN_LENGTH = 8;
