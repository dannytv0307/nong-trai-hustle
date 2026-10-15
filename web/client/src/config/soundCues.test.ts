// T-026: mọi cue âm thanh trỏ tới khoá đã nạp, mọi khoá nạp có file WAV gốc thật (OGG / MP3 do audio:convert sinh ra).
import { describe, expect, it } from 'vitest';
import { ROOSTER_KINDS } from '../systems/audio';
import { audio } from './assets';
import { roosterKey, SOUND_CUES } from './soundCues';

// File WAV gốc trong public/ (Vite liệt kê lúc chạy test, không tải nội dung).
const WAVS = new Set(Object.keys(import.meta.glob('../../public/assets/audio/**/*.wav')).map((k) => k.replace('../../public/', '').replace(/\.wav$/, '')));

describe('âm thanh nạp sẵn + bảng cue (T-026)', () => {
  it('mọi khoá trong assets.audio có file WAV thật (không còn tham chiếu file đã gỡ như ga-gay.wav)', () => {
    for (const [key, base] of Object.entries(audio)) expect(WAVS.has(base), `${key} → ${base}.wav`).toBe(true);
    expect(Object.values(audio).some((b) => b.endsWith('/ga-gay'))).toBe(false);
  });

  it('mọi cue chỉ dùng khoá đã nạp; jingle ở kênh Nhạc, còn lại kênh Hiệu ứng', () => {
    for (const [name, cue] of Object.entries(SOUND_CUES)) {
      expect(cue.keys.length, name).toBeGreaterThan(0);
      for (const k of cue.keys) expect(audio[k], `${name}: ${k}`).toBeDefined();
      expect(cue.channel, name).toBe(name.startsWith('jingle') ? 'music' : 'sfx');
    }
  });

  it('6 kiểu gà gáy đều có file', () => {
    for (const k of ROOSTER_KINDS) expect(audio[roosterKey(k)], k).toBeDefined();
  });

  it('nhạc đêm, 3 tiếng nền và Lô 1 UI được nạp', () => {
    for (const k of ['music-vuon', 'music-dem', 'amb-mua', 'amb-trong-nha', 'amb-trong-nha-dem', 'ui-click-1', 'ui-hover', 'ui-loi']) expect(audio[k], k).toBeDefined();
  });

  it('tiếng lặp nhiều có lệch cao độ (audio bible §8); gà / jingle / xong nhiệm vụ / hái thì không random', () => {
    const jittered = (c: (typeof SOUND_CUES)[keyof typeof SOUND_CUES]) => ('jitter' in c && c.jitter === true) || ('jitterCents' in c && (c.jitterCents ?? 0) > 0);
    for (const n of ['stepDirt', 'stepGrass', 'basket', 'clearWithered', 'eat', 'countTick', 'uiClick'] as const) expect(jittered(SOUND_CUES[n]), n).toBe(true);
    for (const n of ['jingleDaySummary', 'jingleNewSeason', 'questDone', 'harvest', 'snore'] as const) expect(jittered(SOUND_CUES[n]), n).toBe(false);
  });
});
