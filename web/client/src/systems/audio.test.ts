// T-026: logic âm thanh thuần — kênh âm lượng, cài đặt, cao độ, nhạc / tiếng nền theo giờ-khu, gà gáy theo ngày.
import { describe, expect, it } from 'vitest';
import { gameConfig } from '../config/gameConfig';
import {
  canPlayMore,
  chooseAmbience,
  chooseMusic,
  clampVolume,
  crossedHour,
  footstepSurface,
  gapElapsed,
  isNightHour,
  jitterCents,
  mixVolume,
  newSeed,
  parseAudioSettings,
  percentToCents,
  pickIndex,
  randomGap,
  ROOSTER_KINDS,
  roosterKindForDay,
  roosterRoll,
  seededUnit,
  serializeAudioSettings,
  stepFade,
  stepVolume,
  volumeLabel,
  weightedPick,
  type RoosterKind,
  type RoosterRules,
  type SoundscapeRules,
} from './audio';

const RULES: SoundscapeRules = { nightStartHour: 19, dayStartHour: 6, houseDayMusicMultiplier: 0.7 };
const ROOSTER: RoosterRules = {
  weights: { 'binh-thuong': 45, 'tac-hong': 15, khan: 15, 'vo-giong': 10, 'ngai-ngu': 10, 'gay-lai': 5 },
  firstDayKind: 'binh-thuong',
  repeatableKind: 'binh-thuong',
  rainyFavorite: 'khan',
  rainyFavoriteMultiplier: 3,
};

describe('âm lượng 2 kênh + cài đặt', () => {
  it('kẹp 0–1, làm tròn, nấc −/+ bám lưới', () => {
    expect(clampVolume(1.4)).toBe(1);
    expect(clampVolume(-0.2)).toBe(0);
    expect(clampVolume(Number.NaN)).toBe(0);
    expect(clampVolume(0.1 + 0.2)).toBe(0.3);
    expect(stepVolume(0.8, 1, 0.1)).toBe(0.9);
    expect(stepVolume(0.6, -1, 0.1)).toBe(0.5);
    expect(stepVolume(0.73, 1, 0.1)).toBe(0.8);
    expect(stepVolume(0.73, -1, 0.1)).toBe(0.7);
    expect(stepVolume(1, 1, 0.1)).toBe(1);
    expect(stepVolume(0, -1, 0.1)).toBe(0);
    // Bấm 10 lần từ 0 → đúng 1, không trôi số.
    let v = 0;
    for (let i = 0; i < 10; i++) v = stepVolume(v, 1, 0.1);
    expect(v).toBe(1);
    expect(volumeLabel(0.8)).toBe('80%');
  });

  it('âm lượng cuối = tích hệ số (cue × kênh × giảm khi Tạm dừng…), kẹp 0–1', () => {
    expect(mixVolume(0.7, 0.8)).toBeCloseTo(0.56, 6);
    expect(mixVolume(1, gameConfig.musicVolume, gameConfig.pauseMusicVolumeMultiplier)).toBeCloseTo(0.21, 6);
    expect(mixVolume(2, 1)).toBe(1);
  });

  it('cài đặt: đọc lại đúng; hỏng / thiếu trường / sai kiểu → mặc định từng trường', () => {
    const def = { musicVolume: gameConfig.musicVolume, sfxVolume: gameConfig.sfxVolume };
    expect(parseAudioSettings(serializeAudioSettings({ musicVolume: 0.3, sfxVolume: 1 }), def)).toEqual({ musicVolume: 0.3, sfxVolume: 1 });
    expect(parseAudioSettings(null, def)).toEqual(def);
    expect(parseAudioSettings('{hỏng', def)).toEqual(def);
    expect(parseAudioSettings('[1,2]', def)).toEqual(def);
    expect(parseAudioSettings('{"musicVolume":"cao","sfxVolume":0.2}', def)).toEqual({ musicVolume: def.musicVolume, sfxVolume: 0.2 });
    expect(parseAudioSettings('{"musicVolume":7}', def).musicVolume).toBe(1);
  });
});

describe('cao độ, biến thể, phát chồng', () => {
  it('±4% ≈ ±68 cent; lệch ngẫu nhiên nằm trong khoảng', () => {
    expect(percentToCents(4)).toBeCloseTo(67.9, 1);
    expect(jitterCents(0, 68)).toBe(-68);
    expect(jitterCents(0.5, 68)).toBe(0);
    expect(jitterCents(0.999, 68)).toBeLessThan(68);
  });

  it('chọn biến thể trong [0, n)', () => {
    expect(pickIndex(0, 2)).toBe(0);
    expect(pickIndex(0.99, 2)).toBe(1);
    expect(pickIndex(1, 3)).toBe(2);
    expect(pickIndex(0.5, 0)).toBe(-1);
  });

  it('giới hạn phát chồng + khoảng nghỉ tối thiểu + khoảng nghỉ ngẫu nhiên', () => {
    expect(canPlayMore(3, gameConfig.sfxMaxConcurrent)).toBe(true);
    expect(canPlayMore(gameConfig.sfxMaxConcurrent, gameConfig.sfxMaxConcurrent)).toBe(false);
    expect(canPlayMore(99, 0)).toBe(true);
    expect(gapElapsed(1, undefined, 0.2)).toBe(true);
    expect(gapElapsed(1.1, 1, 0.2)).toBe(false);
    expect(gapElapsed(1.25, 1, 0.2)).toBe(true);
    const [lo, hi] = gameConfig.snoreGapSeconds;
    expect(randomGap(0, gameConfig.snoreGapSeconds)).toBe(lo);
    expect(randomGap(0.999999, gameConfig.snoreGapSeconds)).toBeCloseTo(hi, 4);
  });

  it('mờ dần: tiến đều về đích, không vượt; 0 giây = nhảy thẳng', () => {
    expect(stepFade(0, 1, 0.5, 1)).toBe(0.5);
    expect(stepFade(0.9, 1, 0.5, 1)).toBe(1);
    expect(stepFade(1, 0, 0.25, 1)).toBe(0.75);
    expect(stepFade(0.2, 1, 0.016, 0)).toBe(1);
  });
});

describe('nhạc nền + tiếng nền theo giờ / khu', () => {
  it('đêm = 19h → trước 6h', () => {
    expect(isNightHour(18.99, RULES)).toBe(false);
    expect(isNightHour(19, RULES)).toBe(true);
    expect(isNightHour(24, RULES)).toBe(true);
    expect(isNightHour(5.5, RULES)).toBe(true);
    expect(isNightHour(6, RULES)).toBe(false);
  });

  it('Vườn: ngày nhạc Vườn, từ 19h nhạc đêm; trong nhà luôn nhạc đêm, ban ngày nhỏ hơn (×0.7)', () => {
    expect(chooseMusic({ hour: 8, area: 'garden', raining: false }, RULES)).toEqual({ key: 'music-vuon', volume: 1 });
    expect(chooseMusic({ hour: 19, area: 'garden', raining: false }, RULES)).toEqual({ key: 'music-dem', volume: 1 });
    expect(chooseMusic({ hour: 10, area: 'house', raining: false }, RULES)).toEqual({ key: 'music-dem', volume: 0.7 });
    expect(chooseMusic({ hour: 21, area: 'house', raining: false }, RULES)).toEqual({ key: 'music-dem', volume: 1 });
    // Sáng ra (6h) ở Vườn → về nhạc Vườn.
    expect(chooseMusic({ hour: 6, area: 'garden', raining: false }, RULES).key).toBe('music-vuon');
  });

  it('tiếng nền: trong nhà ngày / đêm; Vườn mưa → mưa; Vườn khô → im', () => {
    expect(chooseAmbience({ hour: 9, area: 'house', raining: false }, RULES)?.key).toBe('amb-trong-nha');
    expect(chooseAmbience({ hour: 20, area: 'house', raining: true }, RULES)?.key).toBe('amb-trong-nha-dem');
    expect(chooseAmbience({ hour: 9, area: 'garden', raining: true }, RULES)?.key).toBe('amb-mua');
    expect(chooseAmbience({ hour: 9, area: 'garden', raining: false }, RULES)).toBeNull();
  });

  it('qua mốc giờ (ngáp 23h): chỉ đúng lần đi qua, kể cả nhảy giờ F9', () => {
    expect(crossedHour(22.99, 23.01, 23)).toBe(true);
    expect(crossedHour(22, 24, 23)).toBe(true);
    expect(crossedHour(23, 23.5, 23)).toBe(false);
    expect(crossedHour(23.5, 23.6, 23)).toBe(false);
  });

  it('bước chân: cỏ → tiếng cỏ, còn lại (lối, sân, ruộng, sàn nhà) → đất', () => {
    expect(footstepSurface('grass')).toBe('grass');
    expect(footstepSurface('path')).toBe('dirt');
    expect(footstepSurface(null)).toBe('dirt');
  });
});

describe('gà gáy theo ngày (AUD-SFX-109)', () => {
  it('số ngẫu nhiên theo (seed, ngày): xác định, trong [0, 1), đổi seed / ngày thì đổi', () => {
    const a = seededUnit(1234, 5);
    expect(seededUnit(1234, 5)).toBe(a);
    expect(a).toBeGreaterThanOrEqual(0);
    expect(a).toBeLessThan(1);
    expect(seededUnit(1235, 5)).not.toBe(a);
    expect(seededUnit(1234, 6)).not.toBe(a);
    expect(newSeed(0.5)).toBe(2 ** 31);
  });

  it('chọn theo trọng số', () => {
    const order = ['a', 'b'] as const;
    expect(weightedPick(order, { a: 1, b: 3 }, 0.2)).toBe('a');
    expect(weightedPick(order, { a: 1, b: 3 }, 0.3)).toBe('b');
    expect(weightedPick(order, { a: 0, b: 0 }, 0.9)).toBe('a');
  });

  it('ngày 1 luôn bình thường; F5 cùng ngày (cùng seed) → cùng kiểu', () => {
    for (let seed = 0; seed < 50; seed++) expect(roosterKindForDay(seed * 7919, 1, ROOSTER)).toBe('binh-thuong');
    expect(roosterKindForDay(42, 9, ROOSTER)).toBe(roosterKindForDay(42, 9, ROOSTER));
  });

  it('không lặp cùng kiểu 2 ngày liền (trừ bình thường)', () => {
    for (let seed = 1; seed <= 40; seed++) {
      let prev: RoosterKind | null = null;
      for (let day = 1; day <= 60; day++) {
        const k = roosterKindForDay(seed * 104729, day, ROOSTER);
        if (prev !== null && k === prev) expect(k).toBe('binh-thuong');
        prev = k;
      }
    }
  });

  it('tỷ lệ gần đúng trọng số (bình thường nhiều nhất, gáy lại ít nhất), đủ cả 6 kiểu', () => {
    const count: Record<string, number> = {};
    for (let seed = 0; seed < 400; seed++) {
      for (let day = 2; day <= 30; day++) {
        const k = roosterRoll(seed * 2654435761, day, ROOSTER);
        count[k] = (count[k] ?? 0) + 1;
      }
    }
    const total = Object.values(count).reduce((a, b) => a + b, 0);
    for (const k of ROOSTER_KINDS) expect(count[k] ?? 0).toBeGreaterThan(0);
    expect((count['binh-thuong'] ?? 0) / total).toBeGreaterThan(0.38);
    expect((count['binh-thuong'] ?? 0) / total).toBeLessThan(0.52);
    expect((count['gay-lai'] ?? 0) / total).toBeLessThan(0.09);
  });

  it('ngày mưa ưu tiên khàn (gà "cảm")', () => {
    let dry = 0;
    let wet = 0;
    for (let seed = 0; seed < 300; seed++) {
      for (let day = 2; day <= 20; day++) {
        if (roosterRoll(seed * 31337, day, ROOSTER, false) === 'khan') dry++;
        if (roosterRoll(seed * 31337, day, ROOSTER, true) === 'khan') wet++;
      }
    }
    expect(wet).toBeGreaterThan(dry * 1.8);
  });

  it('trọng số trong gameConfig đủ 6 kiểu, ngày 1 = bình thường', () => {
    for (const k of ROOSTER_KINDS) expect(gameConfig.roosterWeights[k]).toBeGreaterThan(0);
    expect(gameConfig.roosterFirstDayKind).toBe('binh-thuong');
  });
});
