// T-041: trạng thái chặng 4 — mặc định, level, cờ, bậc đồ, nạp từ save (bản sao, kẹp, bỏ nông cụ lạ).
import { describe, expect, it } from 'vitest';
import { defaultV5Fields } from '@bph/shared';
import {
  activeFlags,
  clampOutfitTier,
  copyStage4,
  createStage4State,
  FLAGS,
  flagLabel,
  hasFlag,
  KNOWN_FLAGS,
  loadStage4,
  setFlag,
  setLevel,
  toggleFlag,
} from './progress';

describe('progress (T-041)', () => {
  it('game mới = mặc định của save version 5; mỗi lần tạo là object mới', () => {
    const a = createStage4State();
    const d = defaultV5Fields();
    expect(a).toEqual({ progress: d.progress, flags: d.flags, tools: d.tools, outfit: { tier: d.outfitTier }, family: d.family, weather: d.weather });
    const b = createStage4State();
    a.flags.married = true;
    a.progress.level = 4;
    expect(b.flags).toEqual({});
    expect(b.progress.level).toBe(1);
  });

  it('setLevel: số nguyên ≥ 1, tiếng tăm trong level về 0', () => {
    const p = createStage4State().progress;
    p.xp = 25;
    expect(setLevel(p, 5)).toBe(5);
    expect(p.xp).toBe(0);
    expect(setLevel(p, 0)).toBe(1);
    expect(setLevel(p, 3.7)).toBe(3);
    expect(setLevel(p, Number.NaN)).toBe(1);
  });

  it('cờ: bật / tắt / đảo; tắt = xoá khỏi object; danh sách đang bật xếp theo tên', () => {
    const f = createStage4State().flags;
    expect(hasFlag(f, FLAGS.married)).toBe(false);
    setFlag(f, FLAGS.married, true);
    expect(toggleFlag(f, FLAGS.brickKitchen)).toBe(true);
    expect(activeFlags(f)).toEqual(['brickKitchen', 'married']);
    setFlag(f, FLAGS.married, false);
    expect(f).toEqual({ brickKitchen: true });
    expect(toggleFlag(f, FLAGS.brickKitchen)).toBe(false);
    expect(f).toEqual({});
    expect(KNOWN_FLAGS).toContain('penBuilt');
    expect(flagLabel('married')).toBe('đã cưới');
    expect(flagLabel('laLam')).toBe('laLam');
  });

  it('clampOutfitTier: kẹp 1…số bậc', () => {
    expect(clampOutfitTier(0, 4)).toBe(1);
    expect(clampOutfitTier(3, 4)).toBe(3);
    expect(clampOutfitTier(7, 4)).toBe(4);
    expect(clampOutfitTier(2.9, 4)).toBe(2);
    expect(clampOutfitTier(Number.NaN, 4)).toBe(1);
  });

  it('loadStage4: sửa thẳng object đích (giữ tham chiếu), bản sao sâu, kẹp bậc, bỏ nông cụ lạ', () => {
    const from = createStage4State();
    from.progress.level = 6;
    from.progress.quests.q = { status: 'active', counters: { n: 2 } };
    from.flags.married = true;
    from.tools['cuoc-go'] = { durability: 3 };
    from.tools['la'] = { durability: 9 };
    from.outfit.tier = 8;
    from.family.members.push({ id: 'v', kind: 'wife', days: 1 });
    from.weather = { day: 2, kind: 'rain' };
    const into = createStage4State();
    const refs = { progress: into.progress, flags: into.flags, tools: into.tools, outfit: into.outfit, family: into.family, weather: into.weather };
    into.flags.penBuilt = true;
    loadStage4(from, into, { outfitTierCount: 4, isKnownTool: (id) => id === 'cuoc-go' });
    expect(into.progress).toBe(refs.progress);
    expect(into.flags).toBe(refs.flags);
    expect(into.tools).toBe(refs.tools);
    expect(into.progress.level).toBe(6);
    expect(into.flags).toEqual({ married: true });
    expect(into.tools).toEqual({ 'cuoc-go': { durability: 3 } });
    expect(into.outfit.tier).toBe(4);
    expect(into.weather).toEqual({ day: 2, kind: 'rain' });
    // Bản sao: sửa nguồn không đổi đích.
    from.progress.quests.q.counters.n = 9;
    from.family.members[0].days = 5;
    expect(into.progress.quests.q.counters.n).toBe(2);
    expect(into.family.members[0].days).toBe(1);
    expect(copyStage4(into)).toEqual(into);
  });
});
