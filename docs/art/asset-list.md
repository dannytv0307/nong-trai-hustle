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
| ART-CHR-007 | {ten} — động tác **cuốc** 4 hướng (bậc 1), cuốc vẽ chung vào sprite | CHR | khung **128×128**, dải 512×128 (bản 2x 1024×256 ở `art-source/raw/hero-hoe/final/`) | 4/hướng, mỗi khung 25% `actionDuration`; **khung 3 (chỉ số 2) = chạm** | Vườn — cuốc ô (T-002, T-009) | Must | **In-game files đã đặt** (chờ game-dev gắn + người dùng duyệt) — xem `art-source/raw/hero-hoe/hoe-review.png` | [ART-CHR-007](prompts/ART-CHR-007.md) |
| ART-ITM-001 | Icon **cái cuốc** (hotbar, gùi) | ITM | 128×128 (hiển thị ~64–80 trong ô 92) | tĩnh | HUD — hotbar, gùi (T-009) | Must | **In-game files đã đặt** (chờ người dùng duyệt) | [ART-CHR-007](prompts/ART-CHR-007.md) (mục Icon) |
| ART-CHR-008 | {ten} — động tác **tưới** (bình tưới tôn) 4 hướng (bậc 1) | CHR | 128×128, dải 384×128 | 3/hướng (50/25/25%); **khung 2 = chạm** | Vườn — tưới (T-003) | Must | **Planned — làm ở 4.2** (NHÁP) | [ART-CHR-008](prompts/ART-CHR-008.md) |
| ART-CHR-009 | {ten} — động tác **cúi** (gieo / hái / dọn / hái lượm, tay không) 4 hướng (bậc 1) | CHR | 128×128, dải 384×128 | 3/hướng (50/25/25%); **khung 2 = chạm** | Vườn, Núi — gieo, hái (T-003) | Must | **Planned — làm ở 4.2** (NHÁP) | [ART-CHR-009](prompts/ART-CHR-009.md) |
| ART-TIL-003 | Đất ruộng **chưa cuốc** (khô) — texture + 9 ô viền ruộng↔cỏ (script vẽ) | TIL | 256 = 4×4 ô 64; viền 9 ô 64 | — | Vườn — vùng ruộng | Must | **Planned — làm ở 4.2** (NHÁP) | [ART-TIL-003](prompts/ART-TIL-003.md) |
| ART-TIL-004 | Đất **đã cuốc** — texture (dùng lại ART-TIL-002 nếu ưng) + **16 ô viền 4-bit** (script vẽ, lớp phủ trong suốt) | TIL | 256 = 4×4 ô 64; viền 256 = 16 ô | — | Vườn — ô đã cuốc | Must | **Planned — làm ở 4.2** (NHÁP) | [ART-TIL-003](prompts/ART-TIL-003.md) |
| ART-TIL-005 | Đất **đã cuốc + đã tưới** (sẫm `#553522`, đốm nước) — script làm từ TIL-004, dùng chung viền | TIL | 256 = 4×4 ô 64 | — | Vườn — ô đã tưới | Must | **Planned — làm ở 4.2** (NHÁP) | [ART-TIL-003](prompts/ART-TIL-003.md) |
| ART-FX-001 | Hiệu ứng **đất bung lên** khi cuốc | FX | 96×96 ×3, dải 288×96 | 3 khung × ~60 ms, phát tại khung chạm | Vườn — cuốc, dọn | Should | **Planned — 4.2 hoặc 4.5** (NHÁP; hiện dùng bụi bằng code) | [ART-FX-001](prompts/ART-FX-001.md) |
| ART-UI-001 | Màu **"xám tro ấm"** viền ô ngoài tầm: lót mực 1 px + `#B5AA94` 2 px, nét đứt (thay màu trộn `#8E8270` bị mờ trên ruộng) | UI (màu) | — (hằng số `palette.ts`) | — | Vườn — viền ô dưới con trỏ | Must | **Planned — chốt ở 4.2** (NHÁP, đề xuất game-dev/QA; 0 USD) | [ART-UI-001](prompts/ART-UI-001.md) |
| ART-CON-001 | Concept toàn cảnh **Xóm làng Lầy** (không khí + bố cục theo phác thảo người dùng) | Concept / tham chiếu | 1376×768 (16:9) | tĩnh | Tham chiếu dựng bản đồ xóm (chặng 4), không đưa vào game | Should | **Generated** — chọn #3, chờ người dùng xem: `art-source/reference/concept-xom-lang-lay.png` (so sánh `art-source/raw/xom-concept/xom-concept-compare.png`) | [ART-CON-001](prompts/ART-CON-001.md) |

**Lô Xóm (D-027)** — cảnh Xóm làng Lầy 60×42 theo phác thảo người dùng (`game-planner` thêm 2026-10-13; bố cục, tọa độ, "ai ở nhà nào": GDD §5; mô tả hình: story bible §2.2). Tất cả **Planned — gen ở 4.2**, prompt card do `art-director` viết ở 4.1. Kích thước dưới đây là ô 64 px, **gợi ý** (art-director chốt). Kiến trúc Bắc Bộ, nhà quay mặt về nam, nhìn từ trên-nam góc 3/4; cây cối hiền, tán tròn. Ước tính 28 mục Must (~26–28 ảnh gen, vài mục là sheet) ≈ 8–13 USD. Khu Suối đã bỏ (D-027): không có asset Suối nào cần gỡ khỏi danh sách.

| ID | Tên | Loại | Kích thước cuối (gợi ý) | Frames | Dùng ở | Ưu tiên | Trạng thái | Prompt card |
|---|---|---|---|---|---|---|---|---|
| ART-BLD-001 | Nhà {ten}: nhà tranh 2 gian, mái rạ xơ xác, vách đất nứt, cửa liếp tre, hiên + chõng | BLD | ~6×4 ô (384×256) | tĩnh | Xóm — khuôn viên nhà {ten} | Must | Planned (4.2) | — |
| ART-BLD-002 | Nhà biến thể A: 3 gian mái rạ, vách đất, hiên cột tre | BLD | ~7×5 ô | tĩnh | Nhà cô Ngóng, ông Khướt, Cu Sún, anh Tráng | Must | Planned (4.2) | — |
| ART-BLD-003 | Nhà biến thể B: 3 gian mái ngói vảy cá cũ rêu, tường gạch mộc, hiên cột gỗ, bậc thềm | BLD | ~7×5 ô | tĩnh | Nhà cô Tám Thóc, ông Gật, bà Ba Trầu | Must | Planned (4.2) | — |
| ART-BLD-004 | Nhà biến thể C: 2 gian nhỏ mái rạ thấp | BLD | ~5×4 ô | tĩnh | Nhà bà Chém, nhà phụ | Must | Planned (4.2) | — |
| ART-BLD-005 | Nhà bỏ hoang: từ biến thể A (`--ref`), mái thủng, cỏ mọc trên nóc, cửa xiêu, biển gỗ "Nhà bán" | BLD | ~7×5 ô | tĩnh | Nhà bỏ hoang gần đình (khóa, bản 1.1) | Must | Planned (4.2) | — |
| ART-BLD-006 | Lò rèn ông Hai Bễ: lều mái ngói vỡ, lò than đỏ, đe sắt, ống bễ da (khói bằng code) | BLD | ~6×5 ô | tĩnh | Xóm — hàng nhà giữa | Must | Planned (4.2) | — |
| ART-BLD-007 | Xưởng mộc chú Đục: lán tre, ngựa cưa, đống gỗ, phoi bào | BLD | ~6×5 ô | tĩnh | Xóm — hàng nhà giữa | Must | Planned (4.2) | — |
| ART-BLD-008 | Cổng ngõ Bắc Bộ: cổng có mái (trụ gạch, mái ngói nhỏ, 2 cánh gỗ) + cổng tre đơn (1 sheet) | BLD | ~3×3 ô mỗi cổng | tĩnh | Cổng nhà {ten} + cổng các nhà | Must | Planned (4.2) | — |
| ART-BLD-009 | Đình làng: 3 gian, mái cong đầu đao, cột đỏ, bậc thềm | BLD | ~15×4 ô (ảnh lớn) | tĩnh | Xóm — góc đông-nam | Must | Planned (4.2) | — |
| ART-BLD-010 | Lều chợ cóc mái tranh (dùng lặp 2 lần) | BLD | ~5×4 ô | tĩnh | Chợ cóc đầu xóm (chỉ trang trí) | Must | Planned (4.2) | — |
| ART-BLD-011 | Quán chè bà Chém: mái lá nhỏ, chõng tre, ghế đẩu, ấm tích trong giỏ ủ, lọ kẹo lạc | BLD | ~4×3 ô | tĩnh | Góc chợ cóc | Must | Planned (4.2) | — |
| ART-BLD-012 | Giếng làng: thành gạch tròn, gáo dừa buộc dây | BLD | ~3×3 ô | tĩnh | Bãi đất trống hàng trên | Must | Planned (4.2) | — |
| ART-BLD-013 | Miếu nhỏ gốc đa | BLD | ~2×2 ô | tĩnh | Gốc cây đa | Must | Planned (4.2) | — |
| ART-BLD-014 | **Bến câu** tre nhô ra hồ — 2 trạng thái: **gãy** (sập một nửa, chăng dây, biển "Bến gãy — cấm câu") / **lành** | BLD | ~2×3 ô mỗi trạng thái | tĩnh ×2 | Hồ làng — câu cá Lv 4 (thay vai trò Suối) | Must | Planned (4.2) | — |
| ART-BLD-015 | **Bến nước** bậc gạch xuống hồ (kiểu cầu ao Bắc Bộ) | BLD | ~3×2 ô | tĩnh | Hồ làng — trẻ trâu tắm | Must | Planned (4.2) | — |
| ART-PRP-001 | Quầy hạt ở hiên: chõng tre, thúng hạt, biển gỗ vẽ hạt (ghép lên ART-BLD-003) | PRP | ~3×2 ô | tĩnh | Nhà cô Tám Thóc | Must | Planned (4.2) | — |
| ART-PRP-002 | Sạp tre chợ cóc bày hàng tĩnh (rổ rau, buồng chuối, gà trong lồng) — 3 biến thể 1 sheet | PRP | ~2×2 ô mỗi sạp | tĩnh | Chợ cóc | Must | Planned (4.2) | — |
| ART-PRP-003 | Sheet đồ trang trí 1: chum vại, đống rơm, giàn mướp, chõng tre, rổ rá | PRP | 1–2 ô mỗi món | tĩnh | Khắp Xóm | Must | Planned (4.2) | — |
| ART-PRP-004 | Sheet đồ trang trí 2 (đánh dấu nhà từng người): chổi dựng + then cửa (nhà ông Khướt), ấm tích phơi (bà Chém), ngựa rơm (Cu Sún), cọc tập võ + đòn gánh (anh Tráng), chậu trầu (bà Ba Trầu), chuồng gà tre (ông Gật) | PRP | 1–2 ô mỗi món | tĩnh | 11 nhà hàng xóm | Must | Planned (4.2) | — |
| ART-PRP-005 | Chặn cổng theo level: thân cây đổ (Núi, Lv 2), rào tre + biển "đường đang sửa" (làng Sung, Lv 6), biển "Lv N" | PRP | ~3×2 ô mỗi món | tĩnh | 2 cổng Xóm | Must | Planned (4.2) | — |
| ART-ENV-001 | **Cây đa cổ thụ** (tham khảo cây đa đình làng Việt xưa, hiền, thân thiện): tán tròn rộng + rễ buông mềm; **tách 2 lớp** tán (vẽ đè người) / gốc (vật cản 2×2) | ENV | tán ~7×7 ô | tĩnh (Should: lá rung bằng code) | Bờ hồ, cạnh đình | Must | Planned (4.2) | — |
| ART-ENV-002 | **Cây nhãn** (tham khảo cây nhãn vườn Bắc Bộ): tán tròn xanh đậm, thân xù thấp; tách tán / gốc | ENV | ~3×3 ô | tĩnh (Could: biến thể có chùm quả) | Vườn {ten}, ông Gật, cô Ngóng, dọc đường xóm | Must | Planned (4.2) | — |
| ART-ENV-003 | Bụi cây — 3 biến thể (chè tàu, duối, bụi hoa) | ENV | 1–2 ô mỗi bụi | tĩnh | Mép ngõ, khe giữa nhà, mép hồ | Must | Planned (4.2) | — |
| ART-ENV-004 | Rào dâm bụt đỏ + rào tre thấp (tile ngang/dọc + góc) | ENV | tile 64 | — | Khuôn viên nhà, rào cô Ngóng | Must | Planned (4.2) | — |
| ART-ENV-005 | Lũy tre viền (tile dải 2 ô) + bụi tre lẻ | ENV | tile 64, dải 2 ô | — | Viền bản đồ | Must | Planned (4.2) | — |
| ART-ENV-006 | Lau sậy ven hồ + bèo tấm + khóm sen (props đặt trên nước) | ENV | 1–2 ô mỗi món | tĩnh | Hồ làng | Must | Planned (4.2) | — |
| ART-TIL-006 | Đường đất nâu + mép cỏ (texture + viền) | TIL | 256 = 4×4 ô 64 + viền | — | Đường xóm, ngõ, đường cái | Must | Planned (4.2) | — |
| ART-TIL-007 | Sân gạch bát (gạch vuông đỏ sẫm) | TIL | 256 = 4×4 ô 64 | — | Sân đình, sân nhà ngói | Must | Planned (4.2) | — |
| ART-TIL-008 | **Nước hồ** xanh rêu + **bờ hồ** (viền 9 ô hoặc 16 ô 4-bit, script vẽ như ART-TIL-004) — thay tile nước suối cũ | TIL | 256 = 4×4 ô 64 + viền | (Should: gợn nước bằng code) | Hồ làng | Must | Planned (4.2) | — |
| ART-ENV-007 | Cây cau, bụi chuối | ENV | ~2×3 ô | tĩnh | Trang trí vườn | Should | Planned (4.2) | — |

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
| ART-CHR-007 | `characters/hero-t1-hoe-down.png`, `-up.png`, `-left.png`, `-right.png` — mỗi file **512×128 = 4 khung 128×128** một hàng (nguồn `art-source/raw/hero-hoe/final/`). **Điểm chân:** tâm hai bàn chân x = 64, hàng pixel thấp nhất của bàn chân y = 110 (đáy ô cách 17 px) ở mọi khung, mọi hướng → `setOrigin(0.5, 111/128)` ⇔ dải đi `setOrigin(0.5, 95/96)`; nhân vật cùng tỉ lệ dải đi (đỉnh nón → chân ≈ 91–92 px ở khung 1). Khung 0 chuẩn bị (cuốc trên vai / ngang ngực), 1 giơ cao, **2 = chạm đất** (lưỡi cắm ô trước mặt), 3 hồi. Trái = lật gương từng ô của phải (giữ thứ tự khung). Lưỡi cuốc ở khung chạm: phải ≈ x 100–107 (vươn ~0,6 ô trước chân), xuống ≈ dưới-phải chân tới y 111, lên = lưỡi ló trên đỉnh nón |
| ART-ITM-001 | `items/item-hoe.png` — 128×128 nền trong suốt, căn giữa, đệm 6 px |
| ART-CHR-008/009 *(dự kiến, 4.2)* | `hero-t1-water-<hướng>.png`, `hero-t1-bend-<hướng>.png` (384×128); cùng khung 128×128 + điểm chân như ART-CHR-007 |
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
- 2026-10-13 — T-009 (người dùng muốn thấy cái cuốc + phải chọn cuốc ở hotbar): làm ART-CHR-007 bậc 1 sớm và thêm ART-ITM-001 icon cuốc. Gen 13 ảnh `--hq` (≈ 1,74 USD): icon 3, phải 4 (2 vòng), xuống 2, lên 4 (2 vòng). Cắt bằng `art-source/raw/hero-hoe/tools/hoe_split.py` (tỉ lệ theo chiều cao đỉnh nón→chân của khung 1, neo tâm bàn chân). Đặt file vào `characters/hero-t1-hoe-*.png`, `items/item-hoe.png`.
- 2026-10-13 — Thêm ART-CON-001 concept toàn cảnh Xóm làng Lầy (người dùng muốn thấy sớm không khí). Gen 4 ảnh `--hq` 16:9 (2 vòng, ≈ 0,54 USD); chọn #3, chép vào `art-source/reference/concept-xom-lang-lay.png`.
- 2026-10-13 — (`game-planner`, D-027) Thêm **Lô Xóm**: 29 mục Planned (28 Must + 1 Should) — nhà Bắc Bộ 3 biến thể + nhà {ten} + nhà bỏ hoang, lò rèn, xưởng mộc, cổng ngõ, đình, chợ cóc, quán chè, giếng, miếu, **bến câu (gãy/lành)**, bến nước, cây đa, cây nhãn, bụi cây, rào, lũy tre, lau sậy/sen, tile đường đất, sân gạch, **nước + bờ hồ**. Bỏ khu Suối: danh sách không có mục Suối nào; tile nước suối dự kiến trước đây thay bằng ART-TIL-008. Ghi chú cho `art-director`: `art-bible.md` dòng màu "Xanh nước (suối, giếng)" nên đổi thành "(hồ, giếng)"; prompt card ART-CON-001 có thể còn nhắc tên cũ — kiểm khi viết prompt lô Xóm.
