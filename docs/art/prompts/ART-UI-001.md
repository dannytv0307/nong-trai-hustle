# ART-UI-001 — Màu "xám tro ấm" cho viền ô NGOÀI TẦM (palette, không gen ảnh) — NHÁP

> **NHÁP — không tốn phí gen.** Đề xuất từ `game-dev`/QA khi thử T-002: viền ngoài tầm hiện là màu trộn 50% trắng điệp + mực (`#8E8270`, L ≈ 132, alpha 0.9) → **mờ trên nền ruộng** vì nằm đúng giữa cỏ/đất khô (L 143–156) và đất cuốc (L 85). Chốt ở bước **4.2** (có thể áp sớm nếu game-dev cần — chỉ là hằng số màu).

| Mục | Giá trị |
|---|---|
| Loại | UI (màu bảng màu, vẽ bằng code) |
| Dùng ở | Viền ô dưới con trỏ khi ngoài `interactRange` (GDD §3.3, §8 dòng đầu); có thể dùng lại cho chữ/nút bị khóa |
| Kích thước | nét viền ô 64 px |
| File trong game | hằng số trong `web/client/src/config/palette.ts` (game-dev thêm khóa mới, vd. `ash`) — **không phải ảnh** |
| Trạng thái | **Approved — phương án A** (người dùng chốt 2026-10-14) |

## Vấn đề (thang xám, L = 0.299R + 0.587G + 0.114B)

| Nền dưới viền | L |
|---|---|
| Cỏ `#93B04F` | 156 |
| Đất khô / ruộng chưa cuốc (`#B98550`, hoặc cỏ phủ màu) | ~143–150 |
| Đất cuốc `#7A4B2A` | 85 |
| Đất tưới (đề xuất `#553522`) | 60 |
| Viền **trong tầm** — trắng điệp `#EFE4C8`, nét 4 px | 228 |

Một màu đơn nào ở giữa (L 100–140) cũng lẫn với một trong hai nhóm nền. Không có màu xám ấm đơn nào nổi trên **cả** cỏ sáng lẫn đất tối.

## Đề xuất (phương án A — đề xuất)

**Nét đôi:** lót **mực `#2E2118` 1 px phía ngoài** + **"xám tro ấm" `#B5AA94` 2 px phía trong**, alpha 1 (đặc), **nét đứt** (đoạn 8 px, hở 6 px).

- `#B5AA94` L ≈ 171: nổi rõ trên đất cuốc/tưới (85/60); trên cỏ/đất khô thì chính **lót mực** (L 36) tạo tương phản.
- Phân biệt với viền trong tầm (trắng điệp 228, nét liền 4 px) bằng **3 thứ cùng lúc**: tối hơn + ít ngả vàng hơn, mỏng hơn, **nét đứt** → vẫn đọc được ở thang xám và với người mù màu (Art Bible §5: không chỉ dựa vào màu).
- Hợp tông: xám ngả nâu như tro bếp, cùng họ với mực và trắng điệp — không phải xám lạnh.
- Thêm vào bảng màu dưới dạng **màu phụ** "xám tro (UI ngoài tầm/khóa)" `#B5AA94` (sẽ ghi changelog Art Bible §5 khi người dùng chốt).

## Phương án khác

- **B — một màu, nét liền:** `#5E5548` "xám khói" (L ≈ 87) alpha 1 — nổi trên cỏ nhưng **mất trên đất cuốc** (85). Không đề xuất.
- **C — giữ màu trộn hiện tại nhưng thêm lót mực 1 px + nét đứt:** rẻ nhất (sửa 2 dòng code), kém hơn A trên đất cuốc (132 vs 85 vẫn tạm được). Dùng nếu không muốn thêm màu mới.

## Cách kiểm (0 USD)

Game-dev đổi hằng số → chụp màn hình con trỏ ngoài tầm trên cỏ, ruộng chưa cuốc, đất cuốc → art-director chạy `process_image.py preview <ảnh chụp>` (sáng/tối/xám) và duyệt.

## Ước tính chi phí

**0 USD** (không gen ảnh).

## Nhật ký

| Ngày | Lần | Thay đổi | Kết quả | Chọn |
|---|---|---|---|---|
| 2026-10-10 | nháp | Đề xuất A/B/C | Chưa thử trong game | — |
| 2026-10-14 | chốt | Người dùng chọn phương án A | game-dev áp ở T-092 | A |
