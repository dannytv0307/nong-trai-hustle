// T-027: kỷ lục ngày bán nhiều tiền nhất.
import { describe, expect, it } from 'vitest';
import { createRecords, noteDaySale, normalizeRecordValue } from './records';

describe('noteDaySale', () => {
  it('đêm bán được tiền đầu tiên là kỷ lục mới', () => {
    const r = createRecords();
    expect(noteDaySale(r, 30)).toBe(true);
    expect(r.bestDaySale).toBe(30);
  });

  it('nhiều hơn → kỷ lục; bằng hoặc ít hơn → không, kỷ lục giữ nguyên', () => {
    const r = { bestDaySale: 50 };
    expect(noteDaySale(r, 50)).toBe(false);
    expect(noteDaySale(r, 20)).toBe(false);
    expect(r.bestDaySale).toBe(50);
    expect(noteDaySale(r, 51)).toBe(true);
    expect(r.bestDaySale).toBe(51);
  });

  it('đêm không bán gì (0) / số lạ không bao giờ là kỷ lục', () => {
    const r = createRecords();
    expect(noteDaySale(r, 0)).toBe(false);
    expect(noteDaySale(r, -5)).toBe(false);
    expect(noteDaySale(r, Number.NaN)).toBe(false);
    expect(r.bestDaySale).toBe(0);
  });

  it('số lẻ làm tròn xuống', () => {
    const r = createRecords();
    expect(noteDaySale(r, 12.9)).toBe(true);
    expect(r.bestDaySale).toBe(12);
    expect(noteDaySale(r, 12.5)).toBe(false);
  });
});

describe('normalizeRecordValue', () => {
  it('số nguyên ≥ 0; hỏng → 0', () => {
    expect(normalizeRecordValue(7)).toBe(7);
    expect(normalizeRecordValue(7.8)).toBe(7);
    expect(normalizeRecordValue(-3)).toBe(0);
    expect(normalizeRecordValue(Number.POSITIVE_INFINITY)).toBe(0);
    expect(normalizeRecordValue(Number.NaN)).toBe(0);
  });
});
