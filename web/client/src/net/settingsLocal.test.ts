// T-026: cài đặt âm lượng lưu máy (khoá riêng với save game).
import { describe, expect, it } from 'vitest';
import { loadAudioSettings, saveAudioSettings, SETTINGS_KEY } from './settingsLocal';
import { SAVE_KEY } from './saveLocal';

const DEF = { musicVolume: 0.6, sfxVolume: 0.8 };

function fakeStorage(): Storage & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
    clear: () => data.clear(),
    key: () => null,
    length: 0,
  } as unknown as Storage & { data: Map<string, string> };
}

describe('cài đặt âm lượng (localStorage bph-settings)', () => {
  it('chưa có → mặc định; lưu rồi đọc lại đúng; khoá khác khoá save', () => {
    const st = fakeStorage();
    expect(loadAudioSettings(DEF, st)).toEqual(DEF);
    expect(saveAudioSettings({ musicVolume: 0.3, sfxVolume: 1 }, st)).toBe(true);
    expect(loadAudioSettings(DEF, st)).toEqual({ musicVolume: 0.3, sfxVolume: 1 });
    expect(SETTINGS_KEY).not.toBe(SAVE_KEY);
    expect(st.data.has(SAVE_KEY)).toBe(false);
  });

  it('kho hỏng / bị chặn → không ném lỗi, dùng mặc định', () => {
    const broken = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('full');
      },
      removeItem: () => undefined,
    };
    expect(loadAudioSettings(DEF, broken)).toEqual(DEF);
    expect(saveAudioSettings(DEF, broken)).toBe(false);
    expect(loadAudioSettings(DEF, null)).toEqual(DEF);
  });
});
