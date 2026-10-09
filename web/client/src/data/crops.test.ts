import { describe, expect, it } from 'vitest';
import crops from './crops.json';
import type { CropData } from './types';

describe('crops.json khớp GDD §3.4', () => {
  const list = crops as CropData[];
  it('có 5 cây, id không trùng', () => {
    expect(list).toHaveLength(5);
    expect(new Set(list.map((c) => c.id)).size).toBe(list.length);
  });
  it('lãi/ô/ngày đúng bảng GDD (rau cải 6, dưa hấu ~17)', () => {
    const profit = (c: CropData) => (c.sellPrice - c.seedPrice) / c.growDays;
    expect(profit(list.find((c) => c.id === 'rau-cai')!)).toBe(6);
    expect(Math.round(profit(list.find((c) => c.id === 'dua-hau')!))).toBe(17);
  });
});
