// Đọc / ghi save trong localStorage của trình duyệt (T-008). Bước 3.4 thêm gửi server — vẫn "ghi localStorage trước" (GDD §12).
// Nhận `Storage` qua tham số (mặc định window.localStorage) để unit test bằng một kho giả.
// Không bao giờ ném lỗi ra ngoài: localStorage có thể bị chặn (chế độ riêng tư, đầy bộ nhớ…) — game vẫn chạy, chỉ cảnh báo.
// Cảnh báo dùng console.warn (không phải console.error): save hỏng là chuyện game tự xử lý được (bắt đầu mới).
import { parseGameSave, SAVE_MAX_BYTES, serializeGameSave, type GameSave } from '@bph/shared';

/** Khóa chứa save chính. */
export const SAVE_KEY = 'bph-save';
/** Khóa giữ bản save HỎNG gần nhất (để soi lỗi) — game không đọc khóa này. */
export const SAVE_BACKUP_KEY = 'bph-save-corrupt';

/** Kho kiểu localStorage (chỉ cần 3 hàm). */
export type SaveStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export type LocalLoad =
  | { status: 'none' }
  | { status: 'ok'; save: GameSave; fromVersion: number }
  | { status: 'corrupt'; reason: string };

function defaultStorage(): SaveStorage | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null; // trình duyệt chặn truy cập localStorage
  }
}

/**
 * Đọc save. Không có → 'none'. Hỏng (JSON lỗi, sai / mới hơn version, thiếu trường) → chép nguyên chuỗi sang SAVE_BACKUP_KEY,
 * xóa khóa chính, console.warn, trả 'corrupt' — người gọi bắt đầu game mới.
 */
export function loadLocalSave(storage: SaveStorage | null = defaultStorage()): LocalLoad {
  if (!storage) return { status: 'none' };
  let text: string | null;
  try {
    text = storage.getItem(SAVE_KEY);
  } catch (err) {
    console.warn('[save] Không đọc được localStorage:', err);
    return { status: 'none' };
  }
  if (text === null) return { status: 'none' };
  const parsed = parseGameSave(text);
  if (parsed.ok) return { status: 'ok', save: parsed.save, fromVersion: parsed.fromVersion };
  console.warn(`[save] Bản lưu hỏng (${parsed.reason}) — bắt đầu game mới. Bản hỏng giữ ở localStorage["${SAVE_BACKUP_KEY}"].`);
  try {
    storage.setItem(SAVE_BACKUP_KEY, text);
    storage.removeItem(SAVE_KEY);
  } catch {
    // bỏ qua — lần lưu sau sẽ ghi đè khóa chính
  }
  return { status: 'corrupt', reason: parsed.reason };
}

/** Ghi save. Trả về true nếu ghi được. Quá SAVE_MAX_BYTES (giới hạn của server) vẫn ghi local nhưng cảnh báo. */
export function writeLocalSave(save: GameSave, storage: SaveStorage | null = defaultStorage()): boolean {
  if (!storage) return false;
  const text = serializeGameSave(save);
  const bytes = new TextEncoder().encode(text).length;
  if (bytes > SAVE_MAX_BYTES) console.warn(`[save] Bản lưu ${bytes} byte, vượt giới hạn server ${SAVE_MAX_BYTES}.`);
  try {
    storage.setItem(SAVE_KEY, text);
    return true;
  } catch (err) {
    console.warn('[save] Không ghi được localStorage:', err);
    return false;
  }
}

/** Xóa save (nút "Chơi lại từ đầu"). Bản hỏng ở khóa backup giữ nguyên. */
export function clearLocalSave(storage: SaveStorage | null = defaultStorage()): void {
  try {
    storage?.removeItem(SAVE_KEY);
  } catch {
    // bỏ qua
  }
}
