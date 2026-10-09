// Chọn scene mở đầu từ địa chỉ trang: mặc định Vườn (T-001); `?scene=sandbox` mở sân thử 3.1.
// Thuần TS để test; PreloadScene gọi với `window.location.search`.

export type StartScene = 'Garden' | 'Sandbox';

export function startSceneFromSearch(search: string): StartScene {
  const wanted = new URLSearchParams(search).get('scene')?.toLowerCase();
  return wanted === 'sandbox' ? 'Sandbox' : 'Garden';
}

/** `?debug=physics` → vẽ hộp va chạm để soi (cho QA / khi chỉnh bản đồ). */
export function physicsDebugFromSearch(search: string): boolean {
  return new URLSearchParams(search).get('debug')?.toLowerCase() === 'physics';
}
