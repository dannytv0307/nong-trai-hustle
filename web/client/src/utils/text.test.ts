import { describe, expect, it } from 'vitest';
import { fillPlayerName } from './text';

describe('fillPlayerName', () => {
  it('thay mọi {ten}, giữ dấu tiếng Việt', () => {
    expect(fillPlayerName('thằng {ten} Khoác, {ten} ơi!', 'Tý')).toBe('thằng Tý Khoác, Tý ơi!');
  });
  it('câu không có {ten} thì giữ nguyên', () => {
    expect(fillPlayerName('Mả cha cái cuốc!', 'Tý')).toBe('Mả cha cái cuốc!');
  });
});
