import { describe, expect, it } from 'vitest';
import { PressBuffer } from './pressBuffer';

const E = 69;
const G = 71;
const ESC = 27;

describe('PressBuffer — lần nhấn theo sự kiện', () => {
  it('phím nhấn được tiêu thụ đúng một lần; giữ phím (repeat) không tính thêm', () => {
    const b = new PressBuffer();
    b.keyDown(E, false, false, -1);
    b.keyDown(E, true, false, -1);
    expect(b.consumeCodes([E])).toBe(true);
    expect(b.consumeCodes([E])).toBe(false);
  });

  it('endFrame bỏ phím chưa ai hỏi nhưng KHÔNG bỏ chuột / chạm phím đi (gameplay tự tiêu thụ)', () => {
    const b = new PressBuffer();
    b.keyDown(G, false, false, -1);
    b.keyDown(68, false, true, -1);
    b.pointerDown(true, false);
    b.endFrame();
    expect(b.consumeCodes([G])).toBe(false);
    expect(b.consumeMove()).toBe(true);
    expect(b.consumePrimary()).toBe(true);
  });

  it('T-005: phím bấm trong lúc Tạm dừng bị xóa sạch khi chơi tiếp (clearAll) — không mở gùi / qua đêm / bỏ dở cuốc', () => {
    const b = new PressBuffer();
    b.keyDown(E, false, false, -1); // E: mở gùi
    b.keyDown(G, false, false, -1); // G: qua đêm
    b.keyDown(68, false, true, -1); // chạm D: bỏ dở cuốc
    b.keyDown(52, false, false, 3); // phím 4
    b.pointerDown(true, true);
    b.addWheelSteps(2);
    expect(b.hasPending).toBe(true);
    b.clearAll();
    expect(b.hasPending).toBe(false);
    expect(b.consumeCodes([E])).toBe(false);
    expect(b.consumeCodes([G])).toBe(false);
    expect(b.consumeMove()).toBe(false);
    expect(b.consumeHotbar([52])).toBeNull();
    expect(b.consumePrimary()).toBe(false);
    expect(b.consumeSecondary()).toBe(false);
    expect(b.consumeWheel()).toBe(0);
  });

  it('Esc vẫn đọc được trước khi xóa (để Esc đóng cửa sổ Tạm dừng)', () => {
    const b = new PressBuffer();
    b.keyDown(ESC, false, false, -1);
    b.keyDown(E, false, false, -1);
    expect(b.consumeCodes([ESC])).toBe(true);
    b.clearAll();
    expect(b.consumeCodes([E])).toBe(false);
  });

  it('phím số bấm sau cùng thắng (BUG-010)', () => {
    const b = new PressBuffer();
    b.keyDown(57, false, false, 8);
    b.keyDown(52, false, false, 3);
    expect(b.consumeHotbar([52, 57])).toBe(3);
    expect(b.consumeHotbar([52, 57])).toBeNull();
  });
});
