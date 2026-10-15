// T-026: cài đặt âm lượng (2 kênh Nhạc / Hiệu ứng) lưu ở localStorage khoá `bph-settings` — RIÊNG với save game: cài đặt
// thuộc về máy / người ngồi trước máy, không thuộc về một lần chơi (bấm "Chơi lại từ đầu" không reset âm lượng; sau này
// đăng nhập máy khác không kéo âm lượng máy này theo). Không bao giờ ném lỗi: localStorage bị chặn → dùng mặc định.
import { parseAudioSettings, serializeAudioSettings, type AudioSettings } from '../systems/audio';
import type { SaveStorage } from './saveLocal';

export const SETTINGS_KEY = 'bph-settings';

function defaultStorage(): SaveStorage | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function loadAudioSettings(defaults: AudioSettings, storage: SaveStorage | null = defaultStorage()): AudioSettings {
  let text: string | null;
  try {
    text = storage?.getItem(SETTINGS_KEY) ?? null;
  } catch {
    text = null;
  }
  return parseAudioSettings(text, defaults);
}

export function saveAudioSettings(s: AudioSettings, storage: SaveStorage | null = defaultStorage()): boolean {
  if (!storage) return false;
  try {
    storage.setItem(SETTINGS_KEY, serializeAudioSettings(s));
    return true;
  } catch (err) {
    console.warn('[settings] Không ghi được cài đặt âm lượng:', err);
    return false;
  }
}
