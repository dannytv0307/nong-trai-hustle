# Danh sách asset hình ảnh

> Chủ sở hữu: `art-director` · Trạng thái: Planned → Prompted → Generated → Processed → In-game → Approved

| ID | Tên | Loại | Kích thước cuối | Frames | Dùng ở | Ưu tiên | Trạng thái | Prompt card |
|---|---|---|---|---|---|---|---|---|
| ART-CHR-001 | {ten} — concept nhân vật chính (nón lá) = **style anchor** (ảnh #4) | CHR | concept 1024 | tĩnh | Tham chiếu `--ref` | Must | **Approved** (người dùng chọn #4) | [ART-CHR-001](prompts/ART-CHR-001.md) |
| ART-CHR-002 | {ten} — sprite bản đồ 4 hướng (down/up/left/right) | CHR | 64×96 | tĩnh, anim bằng code | Bản đồ | Must | Approved | [ART-CHR-002](prompts/ART-CHR-002.md) |
| ART-POR-001 | Chân dung {ten} — cười đểu / nhếch mép xoa cằm | POR | 512 | tĩnh, anim bằng code | Khung thoại, bong bóng | Must | Approved | [ART-POR-001](prompts/ART-POR-001.md) |
| ART-POR-002 | Chân dung {ten} — nháy mắt xoa tay (mặc cả) | POR | 512 | tĩnh, anim bằng code | Khung thoại, bong bóng | Must | Approved | [ART-POR-001](prompts/ART-POR-001.md) |
| ART-POR-003 | Chân dung {ten} — khoe khoang tự mãn | POR | 512 | tĩnh, anim bằng code | Khung thoại, bong bóng | Must | Approved | [ART-POR-001](prompts/ART-POR-001.md) |
| ART-POR-004 | Chân dung {ten} — chửi thề mặt đỏ | POR | 512 | tĩnh, anim bằng code | Khung thoại, bong bóng | Must | Approved | [ART-POR-001](prompts/ART-POR-001.md) |
| ART-POR-005 | Chân dung {ten} — đuối, lè lưỡi | POR | 512 | tĩnh, anim bằng code | Khung thoại, bong bóng | Must | Approved | [ART-POR-001](prompts/ART-POR-001.md) |
| ART-POR-006 | Chân dung {ten} — buồn ngủ, chảy dãi, bong bóng mũi | POR | 512 | tĩnh, anim bằng code | Khung thoại, bong bóng | Must | Approved | [ART-POR-001](prompts/ART-POR-001.md) |
| ART-POR-007 | Chân dung {ten} — nịnh bợ chắp tay (trước bố vợ) | POR | 512 | tĩnh, anim bằng code | Khung thoại, bong bóng | Must | Approved | [ART-POR-001](prompts/ART-POR-001.md) |
| ART-POR-008 | Chân dung {ten} — bị từ chối, mếu | POR | 512 | tĩnh, anim bằng code | Khung thoại, bong bóng | Must | Approved | [ART-POR-001](prompts/ART-POR-001.md) |
| ART-POR-009 | Chân dung {ten} — thấy tiền, mắt đồng xu | POR | 512 | tĩnh, anim bằng code | Khung thoại, bong bóng | Must | Approved | [ART-POR-001](prompts/ART-POR-001.md) |
| ART-CHR-003 | {ten} — bậc ngoại hình 2–4 (Người bình thường / Khá giả / Phú ông), hướng xuống, dáng chống nạnh | CHR | 64×96 | tĩnh, anim bằng code | Bản đồ, "lột xác", `--ref` cho 4 hướng + chân dung từng bậc | Must | Approved — sheet `art-source/raw/hero-tiers/tiers-sheet.png` | [ART-CHR-003](prompts/ART-CHR-003.md) |
| ART-TIL-001 | Tile cỏ (thử nối liền) | TIL | 256 = 4×4 ô 64 | — | Bản đồ | Must | Generated (thử) | [ART-TIL-001](prompts/ART-TIL-001.md) |
| ART-TIL-002 | Tile đất cuốc (thử nối liền) | TIL | 256 = 4×4 ô 64 | — | Ruộng | Must | Generated (thử) | [ART-TIL-001](prompts/ART-TIL-001.md) |

**Vị trí file trong game** (bước 3.1, `game-dev` copy từ `art-source/raw/`; gốc `web/client/public/assets/art/`):

| ID | File game |
|---|---|
| ART-CHR-002 | `characters/hero-t1-down.png`, `hero-t1-up.png`, `hero-t1-left.png`, `hero-t1-right.png` (từ `raw/hero-directions/hero-<hướng>.png`) |
| ART-CHR-003 | `characters/hero-tier1-down.png` … `hero-tier4-down.png` (từ `raw/hero-tiers/`) |
| ART-POR-001…009 | `portraits/portrait-hero-a-smirk.png` … `portrait-hero-i-money-eyes.png` (từ `raw/hero-expressions/final/`) |
| ART-TIL-001 / 002 | `tiles/tile-grass-test.png`, `tiles/tile-dirt-test.png` (256×256 = 4×4 ô, từ `raw/tile-test/tiletest-*-256_256.png`) |

## Changelog

- 2026-10-09 — Tạo danh sách.
- 2026-10-09 — Thêm ART-CHR-001 (concept {ten} đội nón lá, ảnh chọn: `art-source/raw/hero-concept/hero-best.png`).
- 2026-10-09 — Bước 2.2: ART-CHR-001 Approved (người dùng chọn #4, làm style anchor). Thêm ART-CHR-002 (4 hướng), ART-POR-001…009 (9 biểu cảm), ART-TIL-001/002 (thử tile). Chưa có `web/client/` nên file cuối tạm ở `art-source/raw/hero-directions/`, `art-source/raw/hero-expressions/final/`, `art-source/raw/tile-test/` (Giả định).
- 2026-10-09 — Thêm ART-CHR-003 (bậc ngoại hình 2–4, D-015): gen 8 ảnh `--hq`, đã tách nền + cắt chung khung 64×96 ở `art-source/raw/hero-tiers/` (`hero-tier1..4-down.png`). Chờ người dùng duyệt; sau đó mới gen 3 hướng còn lại cho mỗi bậc (9 ảnh) và chân dung theo bậc (Should).
- 2026-10-09 — Người dùng duyệt: 9 biểu cảm, 4 hướng, 4 bậc ngoại hình → Approved. Ảnh mẫu bậc 2–4 chép vào `art-source/reference/hero-tier{2,3,4}-src.png`.
- 2026-10-09 — Bước 3.1: copy asset Approved + tile thử vào `web/client/public/assets/art/` (bảng "Vị trí file trong game").
