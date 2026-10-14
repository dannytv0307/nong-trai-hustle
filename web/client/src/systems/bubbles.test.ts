import { describe, expect, it } from 'vitest';
import bubbles from '../data/bubbles.json';
import { bubbleCanShow, createBarkState, pickBarkLine, recordBark, shouldBark } from './bubbles';

describe('ưu tiên bong bóng: chửi thề > "đuối rồi…" > lầm bầm', () => {
  it('không có bong bóng → loại nào cũng hiện', () => {
    expect(bubbleCanShow(null, 'bark')).toBe(true);
    expect(bubbleCanShow(null, 'warn')).toBe(true);
    expect(bubbleCanShow(null, 'grumble')).toBe(true);
  });
  it('kém quan trọng hơn không đè; bằng hoặc hơn thì thay', () => {
    expect(bubbleCanShow('grumble', 'warn')).toBe(false);
    expect(bubbleCanShow('grumble', 'bark')).toBe(false);
    expect(bubbleCanShow('warn', 'bark')).toBe(false);
    expect(bubbleCanShow('bark', 'warn')).toBe(true);
    expect(bubbleCanShow('warn', 'grumble')).toBe(true);
    expect(bubbleCanShow('warn', 'warn')).toBe(true);
    expect(bubbleCanShow('grumble', 'grumble')).toBe(true);
  });
});

describe('lầm bầm khi xong ô cuốc (xác suất + thời gian nghỉ)', () => {
  it('lần đầu chỉ cần trúng xác suất', () => {
    const s = createBarkState();
    expect(shouldBark(s, 0, 0.25, 20, 0.1)).toBe(true);
    expect(shouldBark(s, 0, 0.25, 20, 0.25)).toBe(false);
    expect(shouldBark(s, 0, 0.25, 20, 0.9)).toBe(false);
  });
  it('chưa đủ thời gian nghỉ thì không lầm bầm dù trúng', () => {
    const s = createBarkState();
    recordBark(s, 100, 'x');
    expect(s.count).toBe(1);
    expect(shouldBark(s, 119.9, 1, 20, 0)).toBe(false);
    expect(shouldBark(s, 120, 1, 20, 0)).toBe(true);
  });
  it('xác suất 0 thì không bao giờ; 1 thì luôn (khi hết nghỉ)', () => {
    const s = createBarkState();
    expect(shouldBark(s, 0, 0, 0, 0)).toBe(false);
    expect(shouldBark(s, 0, 1, 0, 0.999)).toBe(true);
  });
  it('chọn câu không lặp câu vừa nói', () => {
    const lines = ['a', 'b', 'c'];
    for (let r = 0; r < 1; r += 0.05) expect(pickBarkLine(lines, 'b', r)).not.toBe('b');
    expect(pickBarkLine(lines, null, 0)).toBe('a');
    expect(pickBarkLine(lines, null, 0.9999)).toBe('c');
    expect(pickBarkLine(['a'], 'a', 0.5)).toBe('a'); // chỉ một câu thì đành lặp
    expect(pickBarkLine([], null, 0.5)).toBeNull();
  });
  it('bubbles.json: 6 câu lầm bầm ≤ 40 ký tự, câu chửi đuối đúng story bible §6.3 (≤ 60 ký tự)', () => {
    expect(bubbles.tillDoneBarks).toHaveLength(6);
    for (const l of bubbles.tillDoneBarks) expect(l.length, l).toBeLessThanOrEqual(40);
    expect(bubbles.grumbleExhausted).toContain('Mả cha cái bụng, réo như trống hội làng!');
    for (const l of bubbles.grumbleExhausted) expect(l.length).toBeLessThanOrEqual(60);
    expect(bubbles.tooTired).toBe('Đuối rồi…');
  });
});

describe('bubbleStyleOf (T-092)', () => {
  it('chửi thề → răng cưa, lầm bầm → khoe, báo → thường', async () => {
    const { bubbleStyleOf } = await import('./bubbles');
    expect(bubbleStyleOf('grumble')).toBe('curse');
    expect(bubbleStyleOf('bark')).toBe('boast');
    expect(bubbleStyleOf('warn')).toBe('normal');
  });
});
