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
| ART-CHR-004 | {ten} — chu trình bước đi 4 khung × 4 hướng (**bậc 1** xong; bậc 2–4 sau) | CHR | 64×96/khung, dải 256×96 | 4/hướng, 8 fps | Bản đồ | Must | **Processed** (chờ người dùng duyệt) — sheet `art-source/raw/hero-walk/walk-sheet.png`, GIF `preview-<hướng>.gif` | [ART-CHR-004](prompts/ART-CHR-004.md) |
| ART-CHR-005 | {ten} — chu trình đi **ngang** v2: 6 khung, profile rõ, sải dài, tay đổi bên (bậc 1); trái = lật gương | CHR | 64×96/khung, dải 384×96 | 6/hướng, 12 fps trong game (gợi ý 10) | Bản đồ (thay hướng ngang của ART-CHR-004) | Must | **Đã gắn vào game** (người dùng duyệt 2026-10-10) — `characters/hero-t1-walk-right.png`, `-left.png` | [ART-CHR-005](prompts/ART-CHR-005.md) |
| ART-CHR-006 | {ten} — 4 khung xoay chéo 3/4 (xuống-phải/trái, lên-phải/trái) chèn 1 nhịp khi đổi hướng (bậc 1) | CHR | 64×96 ×4, dải 256×96 | 1 khung × 70 ms (quay 180° = 2 khung) | Bản đồ — đổi hướng | Should | **Đã gắn vào game** (người dùng duyệt 2026-10-10) — `characters/hero-t1-turn.png` | [ART-CHR-006](prompts/ART-CHR-006.md) |
| ART-CHR-007 | {ten} — động tác **cuốc** 4 hướng (bậc 1), cuốc vẽ chung vào sprite | CHR | khung **128×128** (hộp 64×96 của dáng đi tại x32–95, y16–111), dải 512×128 | 4/hướng, mỗi khung 25% `actionDuration`; **khung 3 = chạm** (bắt đầu đúng `actionImpactAt` 0.5) | Vườn — cuốc ô (T-002) | Must | **Planned — làm ở 4.2** (NHÁP, chưa gen) | [ART-CHR-007](prompts/ART-CHR-007.md) |
| ART-CHR-008 | {ten} — động tác **tưới** (bình tưới tôn) 4 hướng (bậc 1) | CHR | 128×128, dải 384×128 | 3/hướng (50/25/25%); **khung 2 = chạm** | Vườn — tưới (T-003) | Must | **Planned — làm ở 4.2** (NHÁP) | [ART-CHR-008](prompts/ART-CHR-008.md) |
| ART-CHR-009 | {ten} — động tác **cúi** (gieo / hái / dọn / hái lượm, tay không) 4 hướng (bậc 1) | CHR | 128×128, dải 384×128 | 3/hướng (50/25/25%); **khung 2 = chạm** | Vườn, Núi — gieo, hái (T-003) | Must | **Planned — làm ở 4.2** (NHÁP) | [ART-CHR-009](prompts/ART-CHR-009.md) |
| ART-TIL-003 | Đất ruộng **chưa cuốc** (khô) — texture + 9 ô viền ruộng↔cỏ (script vẽ) | TIL | 256 = 4×4 ô 64; viền 9 ô 64 | — | Vườn — vùng ruộng | Must | **Planned — làm ở 4.2** (NHÁP) | [ART-TIL-003](prompts/ART-TIL-003.md) |
| ART-TIL-004 | Đất **đã cuốc** — texture (dùng lại ART-TIL-002 nếu ưng) + **16 ô viền 4-bit** (script vẽ, lớp phủ trong suốt) | TIL | 256 = 4×4 ô 64; viền 256 = 16 ô | — | Vườn — ô đã cuốc | Must | **Planned — làm ở 4.2** (NHÁP) | [ART-TIL-003](prompts/ART-TIL-003.md) |
| ART-TIL-005 | Đất **đã cuốc + đã tưới** (sẫm `#553522`, đốm nước) — script làm từ TIL-004, dùng chung viền | TIL | 256 = 4×4 ô 64 | — | Vườn — ô đã tưới | Must | **Planned — làm ở 4.2** (NHÁP) | [ART-TIL-003](prompts/ART-TIL-003.md) |
| ART-FX-001 | Hiệu ứng **đất bung lên** khi cuốc | FX | 96×96 ×3, dải 288×96 | 3 khung × ~60 ms, phát tại khung chạm | Vườn — cuốc, dọn | Should | **Planned — 4.2 hoặc 4.5** (NHÁP; hiện dùng bụi bằng code) | [ART-FX-001](prompts/ART-FX-001.md) |
| ART-UI-001 | Màu **"xám tro ấm"** viền ô ngoài tầm: lót mực 1 px + `#B5AA94` 2 px, nét đứt (thay màu trộn `#8E8270` bị mờ trên ruộng) | UI (màu) | — (hằng số `palette.ts`) | — | Vườn — viền ô dưới con trỏ | Must | **Planned — chốt ở 4.2** (NHÁP, đề xuất game-dev/QA; 0 USD) | [ART-UI-001](prompts/ART-UI-001.md) |

**Vị trí file trong game** (bước 3.1, `game-dev` copy từ `art-source/raw/`; gốc `web/client/public/assets/art/`):

| ID | File game |
|---|---|
| ART-CHR-002 | `characters/hero-t1-down.png`, `hero-t1-up.png`, `hero-t1-left.png`, `hero-t1-right.png` (từ `raw/hero-directions/hero-<hướng>.png`) |
| ART-CHR-003 | `characters/hero-tier1-down.png` … `hero-tier4-down.png` (từ `raw/hero-tiers/`) |
| ART-POR-001…009 | `portraits/portrait-hero-a-smirk.png` … `portrait-hero-i-money-eyes.png` (từ `raw/hero-expressions/final/`) |
| ART-CHR-004 | `characters/hero-t1-walk-down.png`, `-up.png`, `-right.png`, `-left.png` — mỗi file 256×96 = 4 khung 64×96 một hàng, pivot giữa đáy (từ `raw/hero-walk/final/`; bản 2x ở `raw/hero-walk/final-2x/`) |
| ART-CHR-005 | `characters/hero-t1-walk-right.png`, `-left.png` — dải 384×96 = 6 khung 64×96 (đã ghi đè bản 4 khung, nguồn `art-source/raw/hero-walk2/final/hero-t1-walk-<right|left>.v2.png`) |
| ART-CHR-006 | `characters/hero-t1-turn.png` — dải 256×96 = 4 khung 64×96: 0 xuống-phải, 1 xuống-trái, 2 lên-phải, 3 lên-trái (nguồn `art-source/raw/hero-walk2/final/hero-t1-turn.v2.png`) |
| ART-TIL-001 / 002 | `tiles/tile-grass-test.png`, `tiles/tile-dirt-test.png` (256×256 = 4×4 ô, từ `raw/tile-test/tiletest-*-256_256.png`) |
| ART-CHR-007/008/009 *(dự kiến, 4.2)* | `characters/hero-t1-hoe-<hướng>.png` (512×128), `hero-t1-water-<hướng>.png`, `hero-t1-bend-<hướng>.png` (384×128); khung 128×128, `setOrigin(0.5, 111/128)` ⇔ cùng điểm chân với dải đi `setOrigin(0.5, 95/96)` |
| ART-TIL-003/004/005 *(dự kiến, 4.2)* | `tiles/soil-dry.png`, `soil-dry-edge.png`, `soil-tilled.png`, `soil-tilled-edge.png` (16 ô, chỉ số = bitmask 4 cạnh), `soil-watered.png` |
| ART-FX-001 *(dự kiến)* | `fx/till-dust.png` (288×96 = 3 khung 96×96) |

## Changelog

- 2026-10-09 — Tạo danh sách.
- 2026-10-09 — Thêm ART-CHR-001 (concept {ten} đội nón lá, ảnh chọn: `art-source/raw/hero-concept/hero-best.png`).
- 2026-10-09 — Bước 2.2: ART-CHR-001 Approved (người dùng chọn #4, làm style anchor). Thêm ART-CHR-002 (4 hướng), ART-POR-001…009 (9 biểu cảm), ART-TIL-001/002 (thử tile). Chưa có `web/client/` nên file cuối tạm ở `art-source/raw/hero-directions/`, `art-source/raw/hero-expressions/final/`, `art-source/raw/tile-test/` (Giả định).
- 2026-10-09 — Thêm ART-CHR-003 (bậc ngoại hình 2–4, D-015): gen 8 ảnh `--hq`, đã tách nền + cắt chung khung 64×96 ở `art-source/raw/hero-tiers/` (`hero-tier1..4-down.png`). Chờ người dùng duyệt; sau đó mới gen 3 hướng còn lại cho mỗi bậc (9 ảnh) và chân dung theo bậc (Should).
- 2026-10-09 — Người dùng duyệt: 9 biểu cảm, 4 hướng, 4 bậc ngoại hình → Approved. Ảnh mẫu bậc 2–4 chép vào `art-source/reference/hero-tier{2,3,4}-src.png`.
- 2026-10-09 — Bước 3.1: copy asset Approved + tile thử vào `web/client/public/assets/art/` (bảng "Vị trí file trong game").
- 2026-10-09 — ART-CHR-004 bậc 1 (làm sớm theo yêu cầu người dùng): gen 10 ảnh `--hq` 21:9 (một ảnh = 4 khung một hướng), cắt bằng `process_image.py sheet-split`, đặt 4 spritesheet vào `characters/hero-t1-walk-*.png`. Chờ duyệt.
- 2026-10-10 — Góp ý người dùng (đi ngang chưa tự nhiên, xoay hướng giật): thêm ART-CHR-005 (đi ngang 6 khung v2) và ART-CHR-006 (4 khung xoay chéo). Gen 12 ảnh `--hq` (≈ 1,61 USD). Phát hiện lỗi: dải `hero-t1-walk-left.png` cũ bị đảo thứ tự khung (đi lùi) do `sheet-split --flip`; đã sửa tool. Ứng viên ở `art-source/raw/hero-walk2/final/`, chưa ghi đè file game.
- 2026-10-10 — ART-CHR-005/006 người dùng duyệt → game-dev gắn vào game: ghi đè `hero-t1-walk-right/left.png` (6 khung), thêm `hero-t1-turn.png`.
- 2026-10-10 — Sau khi thử T-002, người dùng quyết định **làm hình thật ở bước 4.2, chưa gen bây giờ**. Thêm (Planned, prompt card NHÁP): ART-CHR-007 cuốc, ART-CHR-008 tưới, ART-CHR-009 cúi gieo/hái — khung 128×128 vẽ chung nông cụ, khung chạm khớp `actionImpactAt`; ART-TIL-003/004/005 đất khô / đã cuốc / đã tưới — AI chỉ gen texture lõi, viền 16 ô (4-bit) + 9 ô do script vẽ; ART-FX-001 đất bung (Should, 4.2 hoặc 4.5); ART-UI-001 màu xám tro ấm cho viền ngoài tầm. Ước tính ≈ 5,5 USD (tối đa ≈ 8,9 USD) cho bậc 1; động tác cho bậc 2–4 chưa tính (thêm ≈ 7–11 USD nếu làm).
