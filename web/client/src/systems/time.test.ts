import { describe, expect, it } from 'vitest';
import { gameConfig } from '../config/gameConfig';
import { palette } from '../config/palette';
import {
  addGameHours,
  advanceDayClock,
  blinkOn,
  clockHour,
  createDayClock,
  dayLabel,
  formatClock,
  gameMinutesToRealSeconds,
  isDayOver,
  isPassOutWarning,
  lerpColor,
  realSecondsToGameHour,
  seasonOf,
  setGameHour,
  skyPhase,
  skyTint,
} from './time';

describe('đồng hồ ngày (GDD §3.1)', () => {
  it('bắt đầu lúc 6h', () => {
    expect(realSecondsToGameHour(0, gameConfig)).toBe(6);
  });

  it('1 giờ game ≈ 33 giây thật (600 giây cho 18 giờ)', () => {
    expect(realSecondsToGameHour(600 / 18, gameConfig)).toBeCloseTo(7, 6);
  });

  it('giữa ngày (300 giây) là 15h', () => {
    expect(realSecondsToGameHour(300, gameConfig)).toBeCloseTo(15, 6);
  });

  it('không vượt quá 24h và không âm', () => {
    expect(realSecondsToGameHour(10_000, gameConfig)).toBe(24);
    expect(realSecondsToGameHour(-5, gameConfig)).toBe(6);
  });

  it('đổi theo dayLengthSeconds khi chỉnh cấu hình', () => {
    const shortDay = { ...gameConfig, dayLengthSeconds: 420 };
    expect(realSecondsToGameHour(210, shortDay)).toBeCloseTo(15, 6);
  });

  it('đường sang chợ 30 phút game ≈ 16.7 giây thật', () => {
    expect(gameMinutesToRealSeconds(gameConfig.marketTravelGameMinutes, gameConfig)).toBeCloseTo(16.67, 1);
  });

  it('định dạng giờ cho HUD', () => {
    expect(formatClock(6)).toBe('06:00');
    expect(formatClock(14.5)).toBe('14:30');
    expect(formatClock(23.999)).toBe('23:59');
    expect(formatClock(24)).toBe('24:00');
  });
});

describe('T-005: đồng hồ trong ngày (DayClockState)', () => {
  it('ngày 1 bắt đầu 6:00; chạy theo giây thật; 300 giây là 15:00', () => {
    const c = createDayClock();
    expect(c.day).toBe(1);
    expect(clockHour(c, gameConfig)).toBe(6);
    advanceDayClock(c, 300, false, gameConfig);
    expect(clockHour(c, gameConfig)).toBeCloseTo(15, 6);
    expect(formatClock(clockHour(c, gameConfig))).toBe('15:00');
  });

  it('dừng khi có lý do dừng (gùi, Tạm dừng…) — không nhảy giờ', () => {
    const c = createDayClock();
    advanceDayClock(c, 10, false, gameConfig);
    const before = c.elapsedSeconds;
    expect(advanceDayClock(c, 999, true, gameConfig)).toBe(false);
    expect(c.elapsedSeconds).toBe(before);
  });

  it('chạm 24:00 thì dừng ở 24:00, báo "vừa hết ngày" đúng một lần (T-007 bắt để ngủ gục)', () => {
    const c = createDayClock();
    expect(advanceDayClock(c, 599, false, gameConfig)).toBe(false);
    expect(advanceDayClock(c, 5, false, gameConfig)).toBe(true);
    expect(clockHour(c, gameConfig)).toBe(24);
    expect(isDayOver(c, gameConfig)).toBe(true);
    expect(advanceDayClock(c, 5, false, gameConfig)).toBe(false);
    expect(formatClock(clockHour(c, gameConfig))).toBe('24:00');
  });

  it('F9: +1 giờ game, không vượt 24h', () => {
    const c = createDayClock();
    addGameHours(c, 1, gameConfig);
    expect(clockHour(c, gameConfig)).toBeCloseTo(7, 6);
    setGameHour(c, 23.5, gameConfig);
    expect(addGameHours(c, 1, gameConfig)).toBe(true);
    expect(clockHour(c, gameConfig)).toBe(24);
    expect(addGameHours(c, 1, gameConfig)).toBe(false);
  });

  it('setGameHour kẹp trong [6, 24]', () => {
    const c = createDayClock();
    setGameHour(c, 3, gameConfig);
    expect(clockHour(c, gameConfig)).toBe(6);
    setGameHour(c, 30, gameConfig);
    expect(clockHour(c, gameConfig)).toBe(24);
    setGameHour(c, 14.5, gameConfig);
    expect(formatClock(clockHour(c, gameConfig))).toBe('14:30');
  });

  it('cảnh báo ngủ gục từ 23h', () => {
    expect(isPassOutWarning(22.99, gameConfig)).toBe(false);
    expect(isPassOutWarning(23, gameConfig)).toBe(true);
    expect(isPassOutWarning(24, gameConfig)).toBe(true);
  });

  it('nhấp nháy: nửa nhịp bật, nửa nhịp tắt', () => {
    expect(blinkOn(0, 2)).toBe(true);
    expect(blinkOn(0.2, 2)).toBe(true);
    expect(blinkOn(0.3, 2)).toBe(false);
    expect(blinkOn(0.5, 2)).toBe(true);
    expect(blinkOn(1.7, 0)).toBe(true);
  });
});

describe('T-005: mùa và dòng ngày', () => {
  it('ngày 1–4 nắng, 5–8 mưa, 9 nắng', () => {
    expect(seasonOf(1, 4)).toBe('dry');
    expect(seasonOf(4, 4)).toBe('dry');
    expect(seasonOf(5, 4)).toBe('rainy');
    expect(seasonOf(8, 4)).toBe('rainy');
    expect(seasonOf(9, 4)).toBe('dry');
  });
  it('"Ngày 1 · Mùa nắng"', () => {
    expect(dayLabel(1, gameConfig.daysPerSeason)).toBe('Ngày 1 · Mùa nắng');
    expect(dayLabel(6, gameConfig.daysPerSeason)).toBe('Ngày 6 · Mùa mưa');
  });
});

describe('T-005: màu trời', () => {
  const kf = gameConfig.skyTintKeyframes;
  const max = gameConfig.skyTintMaxAlpha;

  it('khung trời theo GDD §3.1', () => {
    const s = gameConfig.skyPhaseStarts;
    expect(skyPhase(6, s)).toBe('morning');
    expect(skyPhase(10.99, s)).toBe('morning');
    expect(skyPhase(11, s)).toBe('midday');
    expect(skyPhase(16.99, s)).toBe('midday');
    expect(skyPhase(17, s)).toBe('dusk');
    expect(skyPhase(19, s)).toBe('night');
    expect(skyPhase(24, s)).toBe('night');
  });

  it('nửa đêm tối nhất = skyTintMaxAlpha (0.45), màu chàm', () => {
    expect(max).toBe(0.45);
    const t = skyTint(24, kf, max);
    expect(t.alpha).toBeCloseTo(0.45, 6);
    expect(t.color).toBe(palette.indigo);
  });

  it('trưa trong (không phủ), không giờ nào vượt skyTintMaxAlpha', () => {
    expect(skyTint(13, kf, max).alpha).toBe(0);
    for (let h = 6; h <= 24; h += 0.25) {
      const a = skyTint(h, kf, max).alpha;
      expect(a).toBeGreaterThanOrEqual(0);
      expect(a).toBeLessThanOrEqual(max + 1e-9);
    }
  });

  it('tối dần đều từ 19h tới 24h; hoàng hôn 18h ngả đỏ son', () => {
    let prev = -1;
    for (let h = 19; h <= 24; h += 0.5) {
      const a = skyTint(h, kf, max).alpha;
      expect(a).toBeGreaterThan(prev);
      prev = a;
    }
    expect(skyTint(18, kf, max).color).toBe(palette.vermilion);
  });

  it('chuyển mượt: 1 phút game đổi độ đục rất ít (không giật)', () => {
    for (let h = 6; h < 24; h += 1 / 60) {
      const d = Math.abs(skyTint(h + 1 / 60, kf, max).alpha - skyTint(h, kf, max).alpha);
      expect(d).toBeLessThan(0.01);
    }
  });

  it('trộn màu từng kênh', () => {
    expect(lerpColor(0x000000, 0xffffff, 0.5)).toBe(0x808080);
    expect(lerpColor(0x102030, 0x405060, 0)).toBe(0x102030);
    expect(lerpColor(0x102030, 0x405060, 1)).toBe(0x405060);
  });

  it('ngoài khoảng mốc thì giữ mốc đầu/cuối; không có mốc thì không phủ', () => {
    expect(skyTint(2, kf, max)).toEqual(skyTint(6, kf, max));
    expect(skyTint(30, kf, max)).toEqual(skyTint(24, kf, max));
    expect(skyTint(12, [], max)).toEqual({ color: 0, alpha: 0 });
  });
});
