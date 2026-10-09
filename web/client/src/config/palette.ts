// Bảng màu khóa — Art Bible §5 (Đông Hồ hiện đại hóa). Dùng cho hình placeholder, chữ, UI.
// Hai dạng: số (Phaser Graphics/Rectangle) và chuỗi CSS (Text, DOM).

export const palette = {
  ink: 0x2e2118, // Mực viền — mọi viền, chữ tối. Không dùng đen thuần.
  earth: 0x7a4b2a, // Nâu đất — đất cuốc, áo nâu
  wood: 0xb98550, // Gỗ / đất khô / đường
  gold: 0xdda933, // Vàng hoa hòe — tiền, thu hoạch, điều tốt
  sprout: 0x93b04f, // Xanh mạ — cỏ sáng
  jade: 0x3d6b4b, // Xanh đồng thẫm — tre, bóng cỏ
  vermilion: 0xa93226, // Đỏ son — quai nón, nguy hiểm
  indigo: 0x2f4b73, // Chàm — nước sâu, đêm
  water: 0x6e9fa6, // Xanh nước
  paper: 0xefe4c8, // Trắng điệp — giấy UI, điểm sáng
} as const;

export type PaletteKey = keyof typeof palette;

/** Đổi màu số 0xRRGGBB sang chuỗi CSS "#rrggbb" (cho Phaser Text). */
export function cssColor(key: PaletteKey): string {
  return '#' + palette[key].toString(16).padStart(6, '0');
}
