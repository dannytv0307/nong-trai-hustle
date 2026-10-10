import { describe, expect, it } from 'vitest';
import { gameConfig } from '../config/gameConfig';
import { bagButtonRect, bagPanelRect, bagSlotAt, bagSlotRect, hotbarRect, hotbarSlotAt, hotbarSlotRect, isOverHud } from './hudLayout';

const W = gameConfig.gameWidth;
const H = gameConfig.gameHeight;

describe('hudLayout — hotbar giữa dưới màn', () => {
  it('9 ô căn giữa, nằm trong màn, sát mép dưới', () => {
    const bar = hotbarRect();
    expect(Math.abs(bar.x + bar.w / 2 - W / 2)).toBeLessThanOrEqual(1);
    expect(bar.y + bar.h).toBeLessThan(H);
    expect(bar.y).toBeGreaterThan(H * 0.8);
    expect(hotbarSlotRect(8).x + hotbarSlotRect(8).w).toBe(bar.x + bar.w);
  });
  it('hotbarSlotAt tìm đúng ô theo toạ độ, khe giữa ô = -1', () => {
    for (let i = 0; i < 9; i++) {
      const r = hotbarSlotRect(i);
      expect(hotbarSlotAt(r.x + r.w / 2, r.y + r.h / 2)).toBe(i);
    }
    const r0 = hotbarSlotRect(0);
    expect(hotbarSlotAt(r0.x + r0.w + 2, r0.y + 10)).toBe(-1);
    expect(hotbarSlotAt(W / 2, 100)).toBe(-1);
  });
  it('nút gùi bên phải hotbar, không đè hotbar, vẫn trong màn', () => {
    const b = bagButtonRect();
    const bar = hotbarRect();
    expect(b.x).toBeGreaterThan(bar.x + bar.w);
    expect(b.x + b.w).toBeLessThan(W);
    expect(isOverHud(b.x + 5, b.y + 5)).toBe(true);
    expect(isOverHud(W / 2, H / 2)).toBe(false);
  });
});

describe('hudLayout — cửa sổ gùi 2 × 9', () => {
  it('18 ô nằm trong khung, khung nằm trong màn', () => {
    const p = bagPanelRect(18);
    expect(p.x).toBeGreaterThan(0);
    expect(p.x + p.w).toBeLessThan(W);
    expect(p.y).toBeGreaterThan(0);
    expect(p.y + p.h).toBeLessThan(H);
    for (let i = 0; i < 18; i++) {
      const r = bagSlotRect(i, 18);
      expect(r.x).toBeGreaterThanOrEqual(p.x);
      expect(r.y + r.h).toBeLessThanOrEqual(p.y + p.h);
      expect(bagSlotAt(r.x + r.w / 2, r.y + r.h / 2, 18)).toBe(i);
    }
    // Hàng 2 nằm dưới hàng 1, cùng cột.
    expect(bagSlotRect(9, 18).x).toBe(bagSlotRect(0, 18).x);
    expect(bagSlotRect(9, 18).y).toBeGreaterThan(bagSlotRect(0, 18).y + bagSlotRect(0, 18).h);
  });
});
