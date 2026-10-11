import { describe, expect, it } from 'vitest';
import { PauseReasons, resolveEsc, shouldAutoPause } from './pause';

describe('PauseReasons — lý do dừng đồng hồ', () => {
  it('không có lý do → đồng hồ chạy', () => {
    expect(new PauseReasons().stopped).toBe(false);
  });

  it('nhiều cửa sổ chồng nhau: chỉ chạy lại khi đóng hết', () => {
    const r = new PauseReasons();
    r.set('bag', true);
    r.set('pauseMenu', true);
    expect(r.list()).toEqual(['bag', 'pauseMenu']);
    r.set('pauseMenu', false);
    expect(r.stopped).toBe(true);
    r.set('bag', false);
    expect(r.stopped).toBe(false);
  });

  it('bật lặp lại cùng lý do không đếm hai lần', () => {
    const r = new PauseReasons();
    r.set('sellBox', true);
    r.set('sellBox', true);
    r.set('sellBox', false);
    expect(r.stopped).toBe(false);
    expect(r.has('sellBox')).toBe(false);
  });
});

describe('Esc', () => {
  it('gùi mở → chỉ đóng gùi; không có gì → mở Tạm dừng; Tạm dừng mở → đóng', () => {
    expect(resolveEsc({ pauseMenuOpen: false, bagOpen: true })).toBe('closeBag');
    expect(resolveEsc({ pauseMenuOpen: false, bagOpen: false })).toBe('openPause');
    expect(resolveEsc({ pauseMenuOpen: true, bagOpen: false })).toBe('closePause');
    // Mất focus lúc đang mở gùi: Tạm dừng nằm trên → đóng Tạm dừng trước.
    expect(resolveEsc({ pauseMenuOpen: true, bagOpen: true })).toBe('closePause');
  });
});

describe('tự tạm dừng khi mất focus', () => {
  it('chỉ khi bật pauseOnFocusLost và game sẵn sàng', () => {
    expect(shouldAutoPause('blur', { pauseOnFocusLost: true, ready: true })).toBe(true);
    expect(shouldAutoPause('hidden', { pauseOnFocusLost: true, ready: true })).toBe(true);
    expect(shouldAutoPause('hidden', { pauseOnFocusLost: false, ready: true })).toBe(false);
    expect(shouldAutoPause('blur', { pauseOnFocusLost: true, ready: false })).toBe(false);
    expect(shouldAutoPause('esc', { pauseOnFocusLost: false, ready: true })).toBe(true);
  });
});
