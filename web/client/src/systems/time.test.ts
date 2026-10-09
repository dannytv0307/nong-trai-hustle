import { describe, expect, it } from 'vitest';
import { gameConfig } from '../config/gameConfig';
import { formatClock, gameMinutesToRealSeconds, realSecondsToGameHour } from './time';

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
