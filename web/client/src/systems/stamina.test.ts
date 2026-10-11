import { describe, expect, it } from 'vitest';
import { gameConfig } from '../config/gameConfig';
import itemsJson from '../data/items.json';
import { itemInfo, seedItemId, staminaRestoreOf } from './items';
import {
  canAfford,
  consume,
  createStamina,
  isFull,
  jobStaminaCost,
  restore,
  setStamina,
  staminaBand,
  staminaLabel,
  staminaRatio,
  walkSpeedMultiplier,
} from './stamina';

const costs = {
  till: gameConfig.staminaCostTill,
  plant: gameConfig.staminaCostPlant,
  water: gameConfig.staminaCostWater,
  harvest: gameConfig.staminaCostHarvest,
};

describe('thông số Sức khớp GDD §3.2 (D-022)', () => {
  it('staminaMax 100, cuốc 4/ô, gieo/tưới/hái 1, đuối ×0.5', () => {
    expect(gameConfig.staminaMax).toBe(100);
    expect(gameConfig.staminaCostTill).toBe(4);
    expect(gameConfig.staminaCostPlant).toBe(1);
    expect(gameConfig.staminaCostWater).toBe(1);
    expect(gameConfig.staminaCostHarvest).toBe(1);
    expect(gameConfig.staminaExhaustedSpeedMultiplier).toBe(0.5);
    expect(gameConfig.grumbleBubbleSeconds).toBe(2.5);
    expect(gameConfig.tillDoneBarkChance).toBe(0.25);
    expect(gameConfig.tillDoneBarkCooldownSeconds).toBe(20);
  });
  it('mỗi việc tốn đúng Sức; dọn cây héo tính như hái', () => {
    expect(jobStaminaCost('till', costs)).toBe(4);
    expect(jobStaminaCost('plant', costs)).toBe(1);
    expect(jobStaminaCost('water', costs)).toBe(1);
    expect(jobStaminaCost('harvest', costs)).toBe(1);
    expect(jobStaminaCost('clear', costs)).toBe(1);
  });
});

describe('stamina — trừ, đủ/không đủ, đuối, ăn, chặn trần', () => {
  it('bắt đầu đầy, không đuối', () => {
    const s = createStamina(100);
    expect(s).toEqual({ current: 100, max: 100, exhausted: false });
    expect(isFull(s)).toBe(true);
    expect(staminaLabel(s)).toBe('100/100');
  });

  it('đủ Sức: cần ≥ cost (đúng bằng vẫn được); việc không tốn luôn được kể cả khi đuối', () => {
    const s = createStamina(100, 4);
    expect(canAfford(s, 4)).toBe(true);
    expect(canAfford(s, 5)).toBe(false);
    setStamina(s, 3);
    expect(canAfford(s, 4)).toBe(false); // cuốc cần 4
    expect(canAfford(s, 1)).toBe(true); // gieo vẫn được
    setStamina(s, 0);
    expect(canAfford(s, 1)).toBe(false);
    expect(canAfford(s, 0)).toBe(true);
  });

  it('trừ Sức; về 0 thì CHUYỂN sang đuối đúng một lần', () => {
    const s = createStamina(100, 5);
    let c = consume(s, 4);
    expect(c).toEqual({ delta: -4, becameExhausted: false, recovered: false });
    expect(s.current).toBe(1);
    c = consume(s, 1);
    expect(c.becameExhausted).toBe(true);
    expect(s.exhausted).toBe(true);
    // Đang đuối mà trừ tiếp (vd F8): không âm, không "chuyển" lần nữa → không chửi lại.
    c = consume(s, 20);
    expect(s.current).toBe(0);
    expect(c).toEqual({ delta: 0, becameExhausted: false, recovered: false });
  });

  it('trừ quá số còn lại thì chặn ở 0 (không âm) và vào đuối', () => {
    const s = createStamina(100, 12);
    const c = consume(s, 20);
    expect(s.current).toBe(0);
    expect(c.delta).toBe(-12);
    expect(c.becameExhausted).toBe(true);
  });

  it('ăn: +Sức không vượt staminaMax, delta = số thật được cộng; thoát đuối khi > 0', () => {
    const s = createStamina(100, 0);
    expect(s.exhausted).toBe(true);
    let c = restore(s, 8);
    expect(c).toEqual({ delta: 8, becameExhausted: false, recovered: true });
    expect(s.exhausted).toBe(false);
    setStamina(s, 96);
    c = restore(s, 8);
    expect(s.current).toBe(100);
    expect(c.delta).toBe(4);
    expect(c.recovered).toBe(false);
  });

  it('đuối lại sau khi đã ăn → lại chuyển sang đuối (chửi lần nữa)', () => {
    const s = createStamina(100, 1);
    expect(consume(s, 1).becameExhausted).toBe(true);
    restore(s, 8);
    expect(consume(s, 8).becameExhausted).toBe(true);
  });

  it('setStamina chặn trong [0, max], số lạ (NaN) coi như 0', () => {
    const s = createStamina(100);
    setStamina(s, 250);
    expect(s.current).toBe(100);
    setStamina(s, -5);
    expect(s.current).toBe(0);
    setStamina(s, 50);
    setStamina(s, Number.NaN);
    expect(s.current).toBe(0);
  });

  it('đuối thì đi chậm × staminaExhaustedSpeedMultiplier, không đuối thì 1', () => {
    const s = createStamina(100, 1);
    expect(walkSpeedMultiplier(s, 0.5)).toBe(1);
    consume(s, 1);
    expect(walkSpeedMultiplier(s, 0.5)).toBe(0.5);
  });
});

describe('màu thanh Sức (GDD §11): xanh lá → vàng < 50% → đỏ < 20%', () => {
  const band = (cur: number) => staminaBand(staminaRatio(createStamina(100, cur)), 0.5, 0.2);
  it('ngưỡng', () => {
    expect(band(100)).toBe('green');
    expect(band(50)).toBe('green'); // đúng 50% vẫn xanh
    expect(band(49)).toBe('yellow');
    expect(band(20)).toBe('yellow'); // đúng 20% vẫn vàng
    expect(band(19)).toBe('red');
    expect(band(0)).toBe('red');
  });
  it('chữ "64/100"', () => {
    expect(staminaLabel(createStamina(100, 64))).toBe('64/100');
  });
});

describe('đồ ăn (items.json, GDD §3.2)', () => {
  it('khoai lang sống +8; hạt, rau cải sống, mã lạ không ăn được', () => {
    expect(staminaRestoreOf('khoai-lang')).toBe(8);
    expect(itemInfo('khoai-lang')?.staminaRestore).toBe(8);
    expect(staminaRestoreOf(seedItemId('khoai-lang'))).toBe(0);
    expect(itemInfo(seedItemId('khoai-lang'))?.staminaRestore).toBe(0);
    expect(staminaRestoreOf('rau-cai')).toBe(0);
    expect(staminaRestoreOf('khong-co')).toBe(0);
  });
  it('mọi món trong items.json đều có trong gùi được (id của cây trong crops.json)', () => {
    for (const d of itemsJson) expect(itemInfo(d.id), d.id).not.toBeNull();
  });
});
