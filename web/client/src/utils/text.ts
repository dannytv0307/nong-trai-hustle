// Thay placeholder trong thoại. Story bible dùng {ten} = tên người chơi tự đặt.
// Viết thành hàm thuần để mọi chỗ (thoại, bong bóng, HUD) dùng chung một cách thay.

/** Thay mọi `{ten}` trong câu bằng tên người chơi. */
export function fillPlayerName(text: string, playerName: string): string {
  return text.replaceAll('{ten}', playerName);
}
