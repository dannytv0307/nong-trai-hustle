import { describe, expect, it } from 'vitest';
import {
  createTurnAnimState,
  startTurn,
  stepTurn,
  turnFrameIndex,
  turnPath,
  turnPathFromDiagonal,
  type TurnAnimState,
} from './turnAnim';

const SEC = 0.07;

describe('turnFrameIndex — thứ tự khung trong hero-t1-turn.png', () => {
  it('0 xuống-phải, 1 xuống-trái, 2 lên-phải, 3 lên-trái', () => {
    expect(turnFrameIndex('down-right')).toBe(0);
    expect(turnFrameIndex('down-left')).toBe(1);
    expect(turnFrameIndex('up-right')).toBe(2);
    expect(turnFrameIndex('up-left')).toBe(3);
  });
});

describe('turnPath — quay 90°: một ảnh chéo ở giữa', () => {
  it.each([
    ['down', 'right', 'down-right'],
    ['right', 'down', 'down-right'],
    ['down', 'left', 'down-left'],
    ['left', 'down', 'down-left'],
    ['up', 'right', 'up-right'],
    ['right', 'up', 'up-right'],
    ['up', 'left', 'up-left'],
    ['left', 'up', 'up-left'],
  ] as const)('%s → %s = %s', (from, to, d) => {
    expect(turnPath(from, to, 0)).toEqual([d]);
  });
  it('không đổi hướng = không xoay', () => {
    expect(turnPath('left', 'left', 1)).toEqual([]);
  });
});

describe('turnPath — quay 180°: hai ảnh chéo, đi vòng qua phía hợp lý', () => {
  it('trái ↔ phải vòng qua phía xuống (bất kể lastDirX)', () => {
    expect(turnPath('right', 'left', 1)).toEqual(['down-right', 'down-left']);
    expect(turnPath('left', 'right', -1)).toEqual(['down-left', 'down-right']);
  });
  it('xuống ↔ lên vòng qua phía ngang vừa đi', () => {
    expect(turnPath('down', 'up', 1)).toEqual(['down-right', 'up-right']);
    expect(turnPath('down', 'up', -1)).toEqual(['down-left', 'up-left']);
    expect(turnPath('up', 'down', -1)).toEqual(['up-left', 'down-left']);
    expect(turnPath('up', 'down', 0)).toEqual(['up-right', 'down-right']); // chưa đi ngang lần nào → phải
  });
});

describe('turnPathFromDiagonal — đổi hướng giữa lúc xoay', () => {
  it('hướng mới kề ảnh đang hiện → vào thẳng', () => {
    expect(turnPathFromDiagonal('down-right', 'down')).toEqual([]);
    expect(turnPathFromDiagonal('down-right', 'right')).toEqual([]);
  });
  it('hướng mới ở phía bên kia → một ảnh chéo kề', () => {
    expect(turnPathFromDiagonal('down-right', 'left')).toEqual(['down-left']);
    expect(turnPathFromDiagonal('down-right', 'up')).toEqual(['up-right']);
    expect(turnPathFromDiagonal('up-left', 'down')).toEqual(['down-left']);
  });
});

function frames(s: TurnAnimState, dt: number, n: number): (string | null)[] {
  const out: (string | null)[] = [];
  for (let i = 0; i < n; i++) {
    stepTurn(s, dt, SEC);
    out.push(s.frame);
  }
  return out;
}

describe('startTurn / stepTurn — giữ mỗi ảnh đúng thời gian', () => {
  it('90°: hiện ảnh chéo ~70 ms rồi hết', () => {
    const s = createTurnAnimState();
    startTurn(s, 'down', 'right', 1, SEC);
    expect(s.frame).toBe('down-right');
    const seq = frames(s, 0.01, 10); // 100 ms
    expect(seq.slice(0, 6).every((f) => f === 'down-right')).toBe(true);
    expect(seq[9]).toBeNull();
  });

  it('180°: hai ảnh nối tiếp, mỗi ảnh ~70 ms', () => {
    const s = createTurnAnimState();
    startTurn(s, 'right', 'left', 1, SEC);
    const seq = frames(s, 0.01, 16);
    expect(seq[3]).toBe('down-right');
    expect(seq[9]).toBe('down-left');
    expect(seq[15]).toBeNull();
  });

  it('frame giật dài vượt qua nhiều ảnh cùng lúc, không kẹt', () => {
    const s = createTurnAnimState();
    startTurn(s, 'up', 'down', -1, SEC);
    stepTurn(s, 0.5, SEC);
    expect(s.frame).toBeNull();
    expect(s.queue).toEqual([]);
  });

  it('đổi hướng giữa lúc xoay: tính lại từ ảnh đang hiện', () => {
    const s = createTurnAnimState();
    startTurn(s, 'right', 'left', 1, SEC); // đang hiện xuống-phải, chờ xuống-trái
    stepTurn(s, 0.03, SEC);
    startTurn(s, 'left', 'up', 1, SEC); // người chơi bấm W
    expect(s.frame).toBe('up-right');
    expect(s.queue).toEqual([]);
    expect(s.left).toBeCloseTo(SEC);
    // Rồi lại bấm phải: ảnh lên-phải kề sẵn hướng phải → vào thẳng.
    startTurn(s, 'up', 'right', 1, SEC);
    expect(s.frame).toBeNull();
  });

  it('frameSeconds ≤ 0: tắt khung xoay', () => {
    const s = createTurnAnimState();
    startTurn(s, 'down', 'left', -1, 0);
    expect(s.frame).toBeNull();
  });
});
