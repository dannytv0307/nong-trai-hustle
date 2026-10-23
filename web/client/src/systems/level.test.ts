import { describe, expect, it, vi } from 'vitest';
import { gameConfig } from '../config/gameConfig';
import levelsJson from '../data/levels.json';
import { CROPS } from './crops';
import {
  grantXp,
  LEVELS,
  levelBadgeText,
  levelBarRatio,
  levelUpHeading,
  marketSaleXp,
  markLevelSeen,
  pendingLevelCards,
  OUTFITS,
  outfitTitle,
  parseLevels,
  takeXpToday,
  UNLOCK_KIND_LABEL,
  unlocksAt,
  xpRemaining,
  xpToNext,
  type LevelRules,
} from './level';
import { createStage4State, setLevel } from './progress';

const RULES: LevelRules = { xpToNextLevel: gameConfig.xpToNextLevel, xpPerLevelAfter10: gameConfig.xpPerLevelAfter10 };
const fresh = () => createStage4State().progress;

describe('bảng XP (GDD §7)', () => {
  it('thông số đúng GDD: [30, 60, 100, 150, 200, 260, 330, 400, 480], sau level 10 +90', () => {
    expect([...gameConfig.xpToNextLevel]).toEqual([30, 60, 100, 150, 200, 260, 330, 400, 480]);
    expect(gameConfig.xpPerLevelAfter10).toBe(90);
  });

  it('level 1…9 đọc bảng; cộng dồn tới level 10 = 2010', () => {
    expect(xpToNext(1, RULES)).toBe(30);
    expect(xpToNext(9, RULES)).toBe(480);
    let sum = 0;
    for (let lv = 1; lv < 10; lv++) sum += xpToNext(lv, RULES);
    expect(sum).toBe(2010);
  });

  it('level 10+: 480 + 90 × (level − 9)', () => {
    expect(xpToNext(10, RULES)).toBe(570);
    expect(xpToNext(11, RULES)).toBe(660);
    expect(xpToNext(15, RULES)).toBe(480 + 90 * 6);
  });

  it('level lạ (0, âm, NaN, lẻ) không làm hỏng; bảng rỗng vẫn ≥ 1', () => {
    expect(xpToNext(0, RULES)).toBe(30);
    expect(xpToNext(Number.NaN, RULES)).toBe(30);
    expect(xpToNext(2.7, RULES)).toBe(60);
    expect(xpToNext(5, { xpToNextLevel: [], xpPerLevelAfter10: 0 })).toBe(1);
  });
});

describe('grantXp — hàm chung cho mọi nguồn', () => {
  it('cộng XP trong level + tiếng tăm hôm nay, chưa đủ thì không lên level', () => {
    const p = fresh();
    const g = grantXp(p, 2, 'harvest', RULES);
    expect(g).toEqual({ source: 'harvest', amount: 2, levelUps: [] });
    expect(p).toMatchObject({ xp: 2, level: 1, xpToday: 2 });
    grantXp(p, 5, 'harvest', RULES);
    expect(p).toMatchObject({ xp: 7, xpToday: 7 });
  });

  it('15 cây × 2 XP = đúng 30 → lên Lv 2, dư 0 (kịch bản "Bạn thử thế nào")', () => {
    const p = fresh();
    const ups: number[] = [];
    for (let i = 0; i < 15; i++) ups.push(...grantXp(p, 2, 'harvest', RULES).levelUps);
    expect(ups).toEqual([2]);
    expect(p).toMatchObject({ level: 2, xp: 0, xpToday: 30 });
  });

  it('phần dư mang sang level sau', () => {
    const p = fresh();
    p.xp = 28;
    const g = grantXp(p, 5, 'harvest', RULES);
    expect(g.levelUps).toEqual([2]);
    expect(p).toMatchObject({ level: 2, xp: 3 });
  });

  it('lên nhiều level một lần (thưởng nhiệm vụ lớn): trả về từng level theo thứ tự', () => {
    const p = fresh();
    const g = grantXp(p, 30 + 60 + 100 + 10, 'quest', RULES);
    expect(g.levelUps).toEqual([2, 3, 4]);
    expect(g.levelUps.length).toBe(3);
    expect(p).toMatchObject({ level: 4, xp: 10, xpToday: 200 });
  });

  it('level 10+ dùng xpPerLevelAfter10', () => {
    const p = fresh();
    p.level = 10;
    expect(grantXp(p, 569, 'quest', RULES).levelUps).toEqual([]);
    expect(grantXp(p, 1, 'quest', RULES).levelUps).toEqual([11]);
    expect(p.xp).toBe(0);
    expect(grantXp(p, 660 + 750, 'quest', RULES).levelUps).toEqual([12, 13]);
    expect(p.level).toBe(13);
  });

  it('số âm / 0 / NaN / Infinity không cộng; số lẻ làm tròn xuống', () => {
    const p = fresh();
    for (const bad of [0, -5, Number.NaN, Number.POSITIVE_INFINITY]) expect(grantXp(p, bad, 'cheat', RULES).amount).toBe(0);
    expect(p).toMatchObject({ xp: 0, xpToday: 0, level: 1 });
    expect(grantXp(p, 2.9, 'forage', RULES).amount).toBe(2);
    expect(p.xp).toBe(2);
  });

  it('thanh XP + còn thiếu', () => {
    const p = fresh();
    grantXp(p, 15, 'harvest', RULES);
    expect(levelBarRatio(p, RULES)).toBeCloseTo(0.5);
    expect(xpRemaining(p, RULES)).toBe(15);
  });

  it('qua đêm: lấy tiếng tăm hôm nay rồi về 0 (level, xp giữ nguyên)', () => {
    const p = fresh();
    grantXp(p, 40, 'quest', RULES);
    expect(takeXpToday(p)).toBe(40);
    expect(p).toMatchObject({ xpToday: 0, level: 2, xp: 10 });
    expect(takeXpToday(p)).toBe(0);
  });
});

describe('BUG-019: thẻ chưa xem (levelSeen)', () => {
  it('game mới: levelSeen 1, không có thẻ chờ', () => {
    const p = fresh();
    expect(p.levelSeen).toBe(1);
    expect(pendingLevelCards(p)).toEqual([]);
  });

  it('lên 2 level, chưa xem thẻ nào → F5 xếp lại [2, 3]; xem thẻ 2 → còn [3]; xem nốt → rỗng', () => {
    const p = fresh();
    expect(grantXp(p, 100, 'cheat', RULES).levelUps).toEqual([2, 3]);
    expect(p.levelSeen).toBe(1); // grantXp không đánh dấu đã xem — chỉ đóng thẻ mới đánh dấu
    expect(pendingLevelCards(p)).toEqual([2, 3]);
    markLevelSeen(p, 2);
    expect(pendingLevelCards(p)).toEqual([3]);
    markLevelSeen(p, 3);
    expect(pendingLevelCards(p)).toEqual([]);
  });

  it('levelSeen không lùi; levelSeen > level (đặt Lv thấp bằng bảng Thử) → không thẻ; số lạ không hỏng', () => {
    const p = fresh();
    p.level = 5;
    p.levelSeen = 5;
    markLevelSeen(p, 3);
    expect(p.levelSeen).toBe(5);
    p.level = 2;
    expect(pendingLevelCards(p)).toEqual([]);
    markLevelSeen(p, Number.NaN);
    expect(p.levelSeen).toBe(5);
  });

  it('đặt thẳng level (setLevel — bảng Thử "Lv N") = coi như đã xem tới N', () => {
    const p = fresh();
    setLevel(p, 8);
    expect(p.levelSeen).toBe(8);
    expect(pendingLevelCards(p)).toEqual([]);
    setLevel(p, 2);
    expect(p.levelSeen).toBe(2);
  });
});

describe('nguồn XP khai báo sẵn (GDD §7)', () => {
  it('hái cây đọc harvestXp trong crops.json: rau / khoai 2, dưa / lúa 5', () => {
    const xp = Object.fromEntries(CROPS.map((c) => [c.id, c.harvestXp]));
    expect(xp).toMatchObject({ 'rau-cai': 2, 'khoai-lang': 2, 'rau-muong': 2, 'dua-hau': 5, 'lua-nep': 5 });
  });

  it('thông số nguồn khác đúng GDD', () => {
    expect(gameConfig.forageXp).toBe(1);
    expect(gameConfig.fieldHarvestXp).toBe(15);
    expect(gameConfig.huntXp).toBe(15);
    expect(gameConfig.craftXp).toBe(10);
    expect(gameConfig.outfitXpReward).toBe(10);
    expect(gameConfig.marketSaleQuanPerXp).toBe(20);
  });

  it('bán ở chợ: 1 XP mỗi 20 quan, làm tròn xuống', () => {
    expect(marketSaleXp(19, 20)).toBe(0);
    expect(marketSaleXp(20, 20)).toBe(1);
    expect(marketSaleXp(130, 20)).toBe(6);
    expect(marketSaleXp(-40, 20)).toBe(0);
    expect(marketSaleXp(40, 0)).toBe(0);
  });
});

describe('danh hiệu = tên bậc ngoại hình (GDD §3.14)', () => {
  it('outfits.json đủ 4 bậc theo thứ tự, tên đúng GDD', () => {
    expect(OUTFITS.map((o) => o.tier)).toEqual([1, 2, 3, 4]);
    expect(OUTFITS.length).toBe(gameConfig.outfitTierCount);
    expect(OUTFITS.map((o) => o.name)).toEqual(['Nghèo kiết xác', 'Người bình thường', 'Khá giả', 'Phú ông']);
    expect(OUTFITS.map((o) => o.unlockLevel)).toEqual([1, 3, 7, 12]);
  });

  it('chữ HUD "Lv 1 · Nghèo kiết xác"; bậc lạ không vỡ', () => {
    expect(levelBadgeText(1, 1)).toBe('Lv 1 · Nghèo kiết xác');
    expect(levelBadgeText(5, 2)).toBe('Lv 5 · Người bình thường');
    expect(outfitTitle(9)).toBe('Bậc 9');
    expect(levelUpHeading(3)).toBe('Lên level 3!');
  });
});

describe('levels.json — thẻ "Mở khóa"', () => {
  it('mọi dòng / mục hợp lệ (không bị bỏ dòng nào)', () => {
    const warn = vi.fn();
    const rows = parseLevels(levelsJson, warn);
    expect(warn).not.toHaveBeenCalled();
    expect(rows.length).toBe(levelsJson.levels.length);
    expect(rows.flatMap((r) => r.unlocks).length).toBe(levelsJson.levels.reduce((n, r) => n + r.unlocks.length, 0));
  });

  it('level tăng dần, không trùng, mỗi thẻ ≤ 4 dòng (vừa khung)', () => {
    const levels = LEVELS.map((l) => l.level);
    expect(levels).toEqual([...new Set(levels)].sort((a, b) => a - b));
    for (const l of LEVELS) expect(l.unlocks.length, `Lv ${l.level}`).toBeLessThanOrEqual(4);
  });

  it('Lv 2: "Mở khóa: Núi sau nhà" (khu chưa có vẫn hiện — mở thật ở T-054)', () => {
    const u = unlocksAt(2);
    expect(u[0]).toMatchObject({ kind: 'area', label: UNLOCK_KIND_LABEL.area, text: 'Núi sau nhà' });
  });

  it('cây mở theo level khớp crops.json (cả hai chiều); tên cây lấy từ crops.json', () => {
    for (const crop of CROPS.filter((c) => c.unlockLevel > 1)) {
      expect(unlocksAt(crop.unlockLevel).some((u) => u.kind === 'crop' && u.text === crop.name), crop.id).toBe(true);
    }
    expect(unlocksAt(3).find((u) => u.kind === 'crop')?.text).toBe('Dưa hấu');
    expect(unlocksAt(5).find((u) => u.kind === 'crop')?.text).toBe('Lúa nếp');
  });

  it('bộ đồ sắm được hiện đúng level mở bậc (outfits.json)', () => {
    for (const o of OUTFITS.filter((x) => x.unlockLevel > 1)) {
      expect(unlocksAt(o.unlockLevel).some((u) => u.kind === 'outfit' && u.text === o.outfitName), o.outfitName).toBe(true);
    }
  });

  it('level không có dòng → không mở gì (thẻ vẫn hiện); dòng sai bị bỏ có báo', () => {
    expect(unlocksAt(99)).toEqual([]);
    const warn = vi.fn();
    const rows = parseLevels(
      {
        levels: [
          { level: 1, unlocks: [] },
          { level: 3, unlocks: [{ kind: 'crop', id: 'rau-cai' }, { kind: 'area', text: 'Ổ gà' }, { kind: 'phep-thuat', text: 'x' }, { kind: 'recipe' }] },
          { level: 4, unlocks: [{ kind: 'crop', id: 'khong-co' }] },
        ],
      },
      warn,
    );
    expect(rows.map((r) => r.level)).toEqual([3, 4]);
    expect(rows[0].unlocks).toEqual([{ kind: 'area', text: 'Ổ gà' }]);
    expect(rows[1].unlocks).toEqual([]);
    expect(warn).toHaveBeenCalledTimes(5);
    expect(parseLevels(null, warn)).toEqual([]);
  });
});
