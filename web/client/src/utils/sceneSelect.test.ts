import { describe, expect, it } from 'vitest';
import { physicsDebugFromSearch, startSceneFromSearch } from './sceneSelect';

describe('startSceneFromSearch', () => {
  it('mặc định vào Vườn', () => {
    expect(startSceneFromSearch('')).toBe('Garden');
    expect(startSceneFromSearch('?scene=lung-tung')).toBe('Garden');
  });
  it('?scene=sandbox mở sân thử', () => {
    expect(startSceneFromSearch('?scene=sandbox')).toBe('Sandbox');
    expect(startSceneFromSearch('?debug=physics&scene=Sandbox')).toBe('Sandbox');
  });
  it('?debug=physics bật vẽ hộp va chạm', () => {
    expect(physicsDebugFromSearch('?debug=physics')).toBe(true);
    expect(physicsDebugFromSearch('')).toBe(false);
  });
});
