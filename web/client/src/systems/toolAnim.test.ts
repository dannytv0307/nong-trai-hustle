import { describe, expect, it } from 'vitest';
import { gameConfig } from '../config/gameConfig';
import { actionSpritesheets, bendHandOffset, heroActionKey, heroHoeKey } from '../config/assets';
import { ACTION_ANIMS, actionAnimFor, actionFrameAt, HOE_FRAME, hoeFrameAt, isActionTextureKey, showActionPose } from './toolAnim';

describe('hoeFrameAt — 4 khung mỗi nhát, khung chạm trùng lúc chạm', () => {
  const at = (p: number) => hoeFrameAt(p, 0.5, 0.4, 0.5);

  it('chạy đủ 0 → 1 → 2 → 3 trong một nhát', () => {
    expect(at(0)).toBe(HOE_FRAME.ready);
    expect(at(0.19)).toBe(HOE_FRAME.ready);
    expect(at(0.2)).toBe(HOE_FRAME.raised);
    expect(at(0.49)).toBe(HOE_FRAME.raised);
    expect(at(0.74)).toBe(HOE_FRAME.impact);
    expect(at(0.75)).toBe(HOE_FRAME.recover);
    expect(at(0.999)).toBe(HOE_FRAME.recover);
  });

  it('đúng điểm chạm là khung chạm đất (khớp tileAction: chạm khi elapsed ≥ duration × impactAt)', () => {
    expect(at(0.5)).toBe(HOE_FRAME.impact);
    const { actionImpactAt: hit, tillAnimWindupShare: w, tillAnimImpactShare: i } = gameConfig;
    expect(hoeFrameAt(hit, hit, w, i)).toBe(HOE_FRAME.impact);
    expect(hoeFrameAt(hit - 1e-6, hit, w, i)).toBe(HOE_FRAME.raised);
  });

  it('kẹp giá trị ngoài khoảng / lỗi', () => {
    expect(at(-1)).toBe(HOE_FRAME.ready);
    expect(at(1)).toBe(HOE_FRAME.recover);
    expect(at(5)).toBe(HOE_FRAME.recover);
    expect(at(Number.NaN)).toBe(HOE_FRAME.ready);
  });

  it('chạm ngay từ đầu (impactAt 0) → khung chạm luôn', () => {
    expect(hoeFrameAt(0, 0, 0.4, 0.5)).toBe(HOE_FRAME.impact);
  });
});

describe('T-023: tưới + cúi — cùng chuẩn 4 khung với cuốc', () => {
  it('việc → dáng: cuốc → hoe, tưới → water, gieo / hái / dọn → bend, rảnh → null', () => {
    expect(actionAnimFor('till')).toBe('hoe');
    expect(actionAnimFor('water')).toBe('water');
    for (const j of ['plant', 'harvest', 'clear']) expect(actionAnimFor(j), j).toBe('bend');
    expect(actionAnimFor(null)).toBeNull();
    expect(actionAnimFor('xyz')).toBeNull();
  });

  it('khung tưới / cúi: khung 2 đúng lúc chạm (actionImpactAt), chạy đủ 0 → 3 trong actionDuration', () => {
    const { actionImpactAt: hit, quickAnimWindupShare: w, quickAnimImpactShare: i } = gameConfig;
    expect(actionFrameAt(0, hit, w, i)).toBe(0);
    expect(actionFrameAt(hit * w + 1e-6, hit, w, i)).toBe(1);
    expect(actionFrameAt(hit, hit, w, i)).toBe(2);
    expect(actionFrameAt(hit - 1e-6, hit, w, i)).toBe(1);
    expect(actionFrameAt(0.999, hit, w, i)).toBe(3);
  });

  it('dáng động tác: cuốc luôn hiện; việc nhanh chỉ khi đứng (đang đi giữ khung bước — không trượt)', () => {
    expect(showActionPose('hoe', true)).toBe(true);
    expect(showActionPose('water', false)).toBe(true);
    expect(showActionPose('bend', false)).toBe(true);
    expect(showActionPose('water', true)).toBe(false);
    expect(showActionPose('bend', true)).toBe(false);
    expect(showActionPose(null, false)).toBe(false);
  });

  it('khoá ảnh động tác: heroActionKey + nhận ra để đổi origin chân', () => {
    expect(heroActionKey(1, 'water', 'left')).toBe('hero-t1-water-left');
    expect(heroActionKey(1, 'bend', 'up')).toBe('hero-t1-bend-up');
    expect(heroHoeKey(1, 'down')).toBe('hero-t1-hoe-down');
    for (const a of ACTION_ANIMS) expect(isActionTextureKey(heroActionKey(1, a, 'right'))).toBe(true);
    expect(isActionTextureKey('hero-t1-walk-right')).toBe(false);
    expect(isActionTextureKey('hero-t1-down')).toBe(false);
    expect(isActionTextureKey('hero-t1-turn')).toBe(false);
  });

  it('nạp đủ 12 dải động tác (3 dáng × 4 hướng), file có thật', () => {
    const files = new Set(Object.keys(import.meta.glob('../../public/assets/art/**/*.png')).map((k) => k.replace('../../public/', '')));
    for (const a of ACTION_ANIMS) {
      for (const f of ['down', 'up', 'left', 'right'] as const) {
        const url = actionSpritesheets[heroActionKey(1, a, f)];
        expect(url, `${a}-${f}`).toBeDefined();
        expect(files.has(url), url).toBe(true);
      }
    }
  });

  it('điểm tay cúi so với chân: phải lệch phải, trái lệch trái, đều ở trên chân', () => {
    expect(bendHandOffset('right')).toEqual({ x: 26, y: -46 });
    expect(bendHandOffset('left')).toEqual({ x: -26, y: -46 });
    expect(bendHandOffset('down')).toEqual({ x: -28, y: -52 });
    expect(bendHandOffset('up')).toEqual({ x: 24, y: -50 });
  });
});
