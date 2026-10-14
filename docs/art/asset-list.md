# Danh sách asset hình ảnh

> Chủ sở hữu: `art-director` · Trạng thái: Planned → Prompted → Generated → Processed → In-game → Approved
> **Kế hoạch sản xuất chặng 4 (bước 4.1, 2026-10-13).** Ngân sách người dùng duyệt cho cả chặng 4: **tối đa ~100 USD** hình + âm thanh; phần hình **trần ~85 USD gồm dự phòng 15%** (âm thanh ~5–12 USD; người dùng chốt 2026-10-14). Thứ tự: **Lô 1 Vườn thật → Lô 2 Xóm + NPC → Lô 3 khu khác + mặc cả + meme → Lô 4 menu/giới thiệu**. Chưa gen ảnh nào cho kế hoạch này.

**Cách đọc cột ước tính:** "Ảnh gen" là số ảnh dự kiến **kể cả các lần gen lại bình thường** (theo số liệu thật chặng 2–3: dải đi bộ ≈ 2,5 ảnh, dải cuốc ≈ 3,3 ảnh, bậc ngoại hình ≈ 2,7 ảnh). Giá: **hq** (`--hq`, gemini-3-pro-image) 0,134 USD/ảnh · **nhanh** (gemini-3.1-flash-image) 0,067 USD/ảnh (`tools/config.json`, giá 2026-10 — kiểm lại trước khi gen). Dùng **hq** cho nhân vật, chân dung, icon, tranh lớn; **nhanh** + `--ref` cho tile, vật thể, UI.

## 1. Bảng tổng (đã theo lựa chọn của người dùng 2026-10-14)

**Người dùng đã chốt:** (1) **kịch bản B** — bậc 2–3 đủ động tác, **bậc 4 Phú ông chỉ đi/đứng**, khi làm việc mượn khung bậc 3 (ART-CHR-042/043 = "Cắt (B)", 0 USD); (2) **có cảnh trong nhà riêng** (ART-BG-011 + ART-PRP-010); (3) **intro 4 khung + cưới 3 khung vẽ trọn tranh** (khung hỏng quá 3 vòng thì lùi về nền + chân dung ghép). **Trần hình: ~85 USD gồm dự phòng** (tổng 100 USD, âm thanh dự kiến ~5–12 USD).

**Kế hoạch được duyệt = toàn bộ Must + 21 mục Should "trong ngân sách"** (cột Trạng thái ghi **trong ngân sách** / *ngoài ngân sách*):

| Lô | Nội dung | Số mục làm | USD (Must + Should trong ngân sách) | +15% dự phòng |
|---|---|---|---|---|
| 1 | Vườn thật: đất 3 trạng thái + cuốc dở, **lối đất nện + sân**, **bụi cỏ / lùm hoa / lùm cây** (§7.1 Art Bible), 5 cây theo giai đoạn, nhà {ten} + trong nhà, bếp, thúng bán, quầy hạt, cây nhãn, rào, động tác tưới + cúi, HUD, icon vườn | 40 | 12,93 | **14,87** |
| 2 | Xóm làng Lầy (nhà, đình, đa, hồ, bến, chợ cóc, tile, lũy tre + khóm tre lẻ), 5 NPC chính Xóm + 5 nhóm dân làng phụ (sprite + chân dung), {ten} bậc 2, hiệu ứng lột xác, icon nông cụ/sắm sửa | 53 | 23,92 | **27,51** |
| 3 | Núi, làng Sung, mặc cả (cụ Bá Kẹo 4 mặt), cô Bưởi, bà mối, bà Cân, câu cá + bắn nỏ, gia đình + gia súc, cảnh cưới, meme, {ten} bậc 3 + bậc 4 đi/đứng, động tác chặt + câu | 65 | 33,03 | **37,99** |
| 4 | Nền menu, logo, intro 4 khung, kit menu/cài đặt, favicon, ảnh giới thiệu | 7 | 3,95 | **4,55** |
| | **Tổng kế hoạch** | **164** | **73,83** (Must 65,66 + Should 8,17) | **84,90** ≤ 85 |

- **Must:** 145 mục, 366 ảnh hq + 248 ảnh nhanh ≈ **65,66 USD → 75,51 có dự phòng**.
- **Should trong ngân sách (19 mục, ≈ 8,17 USD → 9,40 có dự phòng)**, chọn theo thứ tự ngược của danh sách cắt §2 (cắt sau cùng thì đưa vào trước): meme Should (xua/chỉ tay, cụ cười gượng, thẻ "Ổn mà", icon vỗ tay) → nhóm nhỏ (khung xoay bậc 2–3–4, gà Mái Mơ, trâu Ì, đất bung, vân giấy, FX nhỏ, đá núi, ống khói bếp gạch, cau/chuối, key art, ảnh chụp giới thiệu) → **chân dung {ten} bậc 3** → **chân dung bậc 2**.
- **Thay đổi 2026-10-14 (mặt đất & thảm thực vật, Art Bible §7.1) — tổng không đổi:** thêm Must ART-ENV-016 bụi cỏ + ART-ENV-017 lùm hoa (+0,54); bỏ 2 Should mà cụm cây thay được vai: ART-ENV-008 trang trí ruộng hoang (gộp vào ENV-016) và ART-TIL-009 cỏ biến thể (cụm cây đã phá lộ ô lặp) (−0,54). ART-ENV-003 lùm cây chuyển từ Lô 2 lên Lô 1 (cùng lượt chốt style cây). ART-TIL-006 viết lại thành đất nện + sân (ART-TIL-014, cùng lượt gen, 0 USD thêm). Ảnh mẫu `sample-dat-nen-bui-cay.png` đã tiêu **0,20 USD** (3 ảnh nhanh) — tính vào dự phòng Lô 1.
- **Ngoài ngân sách (10 mục, ≈ 6,84 USD):** chân dung bậc 4 (1,07), NPC đi bộ + trẻ trâu chạy + cô Bưởi đi + cô Ngóng đứng cả người (4,16), mọi Could (1,61). Chỉ làm nếu các lô trước tiêu ít hơn ước tính — thứ tự đưa vào: chân dung bậc 4 → NPC đi bộ → Could.
- **Chi thật Lô 1 (cập nhật 2026-10-14, T-019 xong phần gen):** 30 ảnh nhanh + 4 ảnh hq = **2,55 USD** (ước cho các mục T-019: ~3,49 USD) + ảnh mẫu 0,20 USD. Lô 1 đã chi 2,75 / 14,87 USD.
- **Chi thật T-020 (Lô 1 phần 2, 2026-10-14):** 22 ảnh hq (tưới 8, cúi 6, nhà 2, trong nhà 2, bếp 4) + 22 ảnh nhanh (bụi cỏ/hoa 3, lùm cây 2, nhãn 3, rào 3 + rào dọc thử 3, thúng/cọc 2, quầy hạt 2, nội thất 2, nón 2) = 2,95 + 1,47 = **4,42 USD** (ước cho các mục này ~6,5 USD). **Lô 1 đã chi 7,17 / 14,87 USD**; còn T-091 giao diện (ước ~1,9 USD) + Should trong ngân sách (FX, vân giấy, ống khói bếp gạch ~1,1 USD).
- Toàn bộ danh sách (kể cả ngoài ngân sách) ≈ 80,67 USD → 92,77 có dự phòng.
- **Theo dõi chi:** sau mỗi lô so số thật với cột "USD (ước)". Lô nào vượt > 20% thì dừng, báo, và cắt Should "trong ngân sách" theo thứ tự §2 trước khi sang lô sau.

**Đã chi trước chặng 4 (tham khảo):** khoảng 9–11 USD hình (chặng 2–3, theo D-027 + changelog). Ngân sách chặng 4 tính riêng.

## 2. Danh sách cắt (thứ tự cắt khi vượt ngân sách) và mẹo tiết kiệm

**Thứ tự cắt** — cắt từ trên xuống, dừng khi về dưới ngân sách. Mục 1–5 là Should/Could; từ mục 6 là cắt vào Must (cần người dùng đồng ý; số mục cắt GDD §14 ghi trong ngoặc):

| # | Cắt gì | Tiết kiệm (USD, chưa +15%) | Thay bằng |
|---|---|---|---|
| 1 | Mọi Could: {ten} nằm ngủ gục, ông Mõ, cụ Bá Kẹo ngồi sập, bụi "gét gô", con trỏ chuột | 1,61 | Xoay sprite bằng code; băng chữ đổi mùa như cũ |
| 2 | NPC đi bộ + trẻ trâu chạy (CHR-070/071), cô Bưởi đi 4 hướng, cô Ngóng đứng cả người | 4,16 | NPC đổi chỗ bằng mờ (đã là Must) |
| 3 | Chân dung {ten} theo bậc (POR-010…023) (0b(a)) | 3,75 | Mọi bậc dùng 9 chân dung bậc 1 |
| 4 | Khung xoay bậc 2–4; gà Mái Mơ; trâu Ì; FX gen (đất bung, vân giấy, FX nhỏ); đá núi, ống khói bếp gạch, cau/chuối; key art (cỏ biến thể + trang trí ruộng hoang đã bỏ 2026-10-14, thay bằng ENV-016/017) | 4,04 | Hiệu ứng bằng code (hạt, hình tròn), vân giấy bằng nhiễu script, không có biến thể |
| 5 | Meme Should: {ten} xua/chỉ tay, cụ cười gượng, thẻ "Ổn mà", icon vỗ tay (0c(a)) | 1,48 | Bỏ 5 meme Should |
| 6 | ~~Bậc 4: động tác dùng khung bậc 3~~ — **đã áp dụng** (người dùng chọn kịch bản B) | (đã trừ) | Khăn xếp vẽ đè bằng code (lệch nhẹ, chỉ ở endless) |
| 7 | Intro 4 khung + cưới 3 khung: vẽ trọn → **nền vẽ + chân dung/sprite có sẵn ghép bằng code** (người dùng chọn vẽ trọn; chỉ lùi từng khung hỏng quá 3 vòng) | ≈ 2,34 | Kiểu "truyện tranh cắt dán" |
| 8 | Meme Must còn 4 meme chỉ cần code + chữ (bỏ mèo Mướp, mũi tên, cụ nhướng mày, nước mắt) (0c(b)) | ≈ 1,21 | Zoom, ối dồi ôi, trừ sĩ diện, còn cái nịt |
| 9 | Dân làng phụ còn 3: bỏ bà Chém, anh Tráng (0d(c)) | 1,21 | Quán chè là đồ trang trí |
| 10 | Bỏ bắn nỏ: gà rừng, khung nỏ, bụi rậm, UI nỏ (mục 5) | ≈ 1,47 | Nhiệm vụ 7 "bán 20 bó củi" |
| 11 | Gộp còn 3 bậc ngoại hình, bỏ bậc 2 (0b(c)) — thay đổi thiết kế | 4,56 | Nghèo → Khá giả (Lv 5) → Phú ông |
| 12 | Gia đình rút gọn: bỏ lợn, con lớn (mục 1–3) | ≈ 1,07 | Gà + con nhỏ + tiền cơm |

**Mẹo tiết kiệm (đã tính vào ước tính, áp dụng bắt buộc khi gen):**
1. **Lật gương**: hướng trái = lật phải (nhân vật, động tác, con vật); NPC chỉ có mặt trước, quay sang trái/phải bằng lật; mũi tên lỗ = lật dọc mũi tên lãi.
2. **Đứng = khung 1 của dải đi** cho bậc 2–4 (không gen dáng đứng riêng; Art Bible §10.4 mục 6).
3. **Sheet nhiều món một ảnh**: icon 9 món/ảnh hq (≈ 0,045 USD/icon thay vì ~0,4), đồ trang trí 3–6 món/ảnh, FX 9 món/ảnh, nhân vật nhiều khung trong một ảnh 16:9/21:9.
4. **"Thay đồ giữ dáng"** cho bậc 2–4: `--ref` chính dải bậc 1 cùng động tác → ước 2 ảnh/dải (Art Bible §10.3).
5. **Script vẽ viền tile** (lệnh `autotile16` + 9 ô, ART-TIL-003): AI chỉ gen texture lõi 4×4 ô; mọi viền cỏ↔đất / cỏ↔đường / cỏ↔nước do script vẽ (0 USD).
6. **Tô màu lại bằng script** (0 USD): đất đã tưới từ đất cuốc, nước hồ mùa mưa, cỏ núi từ cỏ Xóm (thử trước), gà Đỏ/Đen từ một con gà, trẻ trâu đổi màu áo, nhà làng Sung ngói đỏ từ nhà ngói cũ, cá nướng dùng một icon.
7. **Sửa bằng `--ref`** thay vì gen mới: nhà bỏ hoang từ nhà A, nhà {ten} có ống khói từ BLD-001, cụ Bá Kẹo các mặt từ mặt Nhăn, chân dung bậc từ chân dung bậc 1.
8. **Dùng lại**: ART-CON-001 làm nền menu (nếu người dùng ưng: −0,54), tile thử cỏ/đất cuốc làm bản chính thức, icon gia súc ở chợ = thu nhỏ sprite, favicon cắt từ đầu {ten}, ảnh chụp giới thiệu chụp bằng Playwright.
9. **Hoạt ảnh bằng code** trên sprite tĩnh: thở, nhún, gật, lửa bếp, khói, rung lá, mây trôi, giọt nước; chỉ gen khung khi code không diễn được.
10. **Duyệt theo lô bằng một sheet so sánh**, chốt style của mỗi loại mới (nhà, NPC, cây trồng, icon) bằng **1 mẫu đầu tiên** trước khi gen cả loạt → ít vòng sửa.
11. Dừng ở **~3 vòng sửa/asset**; quá thì báo và chuyển phương án lùi (code/hình khối) thay vì gen tiếp.

## 3. Quy cách kỹ thuật cho `game-dev` (đã đối chiếu code hiện tại)

Đối chiếu `web/client/src/config/assets.ts` (`HERO_FRAME` 64×96, `HERO_ACTION_FRAME` 128×128 `footY` 111, khóa `heroWalkKey/heroTurnKey/heroHoeKey(tier, facing)`), `gameConfig.tileSize` 64, Phaser 3.90. **Không cần thư viện mới.**

| Loại | File (trong `public/assets/art/`) | Quy cách | Gắn trong Phaser |
|---|---|---|---|
| {ten} đi / xoay (mọi bậc) | `characters/hero-t{bậc}-walk-{down,up,left,right}.png`, `hero-t{bậc}-turn.png` | Dải ngang khung **64×96**: xuống/lên 4 khung, ngang 6 khung, xoay 4 khung (thứ tự như bậc 1). Chân sát đáy | `spritesheet` 64×96, `setOrigin(0.5, 1)` — **chỉ đổi số bậc trong khóa** |
| {ten} động tác (mọi bậc) | `characters/hero-t{bậc}-{hoe,water,bend,chop,fish}-{hướng}.png` | Khung **128×128**, tâm bàn chân x 64, đáy chân y 110 → `setOrigin(0.5, 111/128)`. Cuốc 4 khung, **tưới 4, cúi 4** (cùng chuẩn cuốc, khung chỉ số 2 = chạm — đổi 2026-10-14 ở T-020), chặt 4, câu 6 (0–3 quăng, **khung 2 = chạm**; 4–5 giữ/kéo lặp). Câu cá chỉ có `down`, `right`, `left` | Như `actionSpritesheets` hiện tại; thêm khóa `heroActionKey(tier, action, facing)` |
| NPC người lớn | `characters/npc-{id}-{trạng-thái}.png` (vd `npc-u-hen-idle.png`) | Dải ngang khung **64×96** (vật cầm vượt khung → 128×128 cùng điểm chân như {ten}); mặt trước; ông Khướt nằm **128×64** | `spritesheet`, origin chân; quay trái/phải = `setFlipX` |
| Trẻ con | `characters/npc-{tre-trau,con-nho,con-lon}-*.png` | Khung **48×64**, chân sát đáy | origin (0.5, 1) |
| Con vật | `animals/{ga-mai-mo,ga,lon,lon-con,trau,ga-rung}-*.png` | Gà 64×64, lợn 96×64, lợn con 64×48, trâu 128×96, gà rừng 192×192 (chỉ trong khung mini-game); nhìn ngang, trái = lật | origin (0.5, 1) |
| Cây trồng | `props/crop-{id}.png` | Dải khung **64×96**, chỉ số khung = giai đoạn (ghi trong `crops.json`), gốc cây ở đáy khung = đáy ô; cây cao tràn lên ô trên | vẽ tại đáy-giữa ô, `depth` = y đáy ô |
| Nhà, công trình, cây lớn | `props/{id}.png` (+ `props/{id}-canopy.png`, `-trunk.png` cho cây đa/nhãn/cây rừng) | Khổ **bội số 64**, nền trong suốt, đáy công trình ở đáy ảnh. Mỗi file có mục trong `props/props.json` (**đã tạo ở T-020** cho mọi vật Lô 1): kích thước ô, **chân đế va chạm** (ô, tính từ góc dưới-trái), vị trí cửa/điểm click. Nhà quay mặt nam → **một ảnh là đủ**, `depth` = y đáy (đi phía sau thì mái tự che). Cây tách 2 lớp, cùng khổ canvas để đặt chung một tọa độ | `image`, `setOrigin(0.5, 1)`; va chạm từ `props.json` hoặc lớp Object của Tiled |
| Tile nền | `tiles/{loại}.png` 256×256 = 4×4 ô 64; viền `tiles/{loại}-edge16.png` 256×256 = 16 ô | **Texture lõi chỉ liền khi giữ đúng thứ tự 4×4** → chỉ số ô = `(y % 4) * 4 + (x % 4)`, không rải ngẫu nhiên. Viền: ô chỉ số = bitmask cạnh giáp loại khác **N=1, E=2, S=4, W=8**, lớp trong suốt đặt trên. Bản `-ex.png` có **đệm 1 px** (chống khe khi game co giãn FIT) | `addTilesetImage(…, 64, 64, margin 1, spacing 2)` với bản `-ex`. **Đề xuất:** trong Tiled chỉ vẽ *loại nền* mỗi ô (cỏ/đất/đường/nước/gạch/ruộng), code dựng lớp texture + viền lúc nạp — khỏi làm bộ Wang trong Tiled |
| Icon vật phẩm | `items/item-{id}.png` (tách từ sheet, tên = id trong dữ liệu) | **128×128**, trong suốt, căn giữa, đệm 6 px; hiển thị 64–80 | `image`; trường `icon` trong JSON |
| Chân dung | `portraits/portrait-{npc}-{mặt}.png` | **512×512** RGBA (cụ Bá Kẹo **768×768** cho màn mặc cả), ngang ngực, đầu cùng vị trí giữa các mặt | `image`, đổi texture khi đổi mặt |
| UI 9-slice | `ui/{id}.png` + `ui/ui.json` (lề cắt trái/phải/trên/dưới) | Khung giấy, nút, ô, bong bóng, khung thoại | `this.add.nineslice(...)` (có sẵn từ Phaser 3.60) |
| Nền toàn màn | `backgrounds/{id}.jpg` hoặc `.webp` | 1920×1080, ≤ 400 KB | `image` ở camera UI |
| Vân giấy | `fx/paper-overlay.png` | 512 seamless | `tileSprite` toàn màn, `setScrollFactor(0)`, blend MULTIPLY, alpha 0,08–0,15 |
| FX | `fx/{id}.png` | Dải khung đều hoặc ảnh rời 64–192 | particles / spritesheet |

- **Dung lượng tải:** ~180 file; art phẳng ít màu nên script lượng tử hóa PNG (Pillow, 0 USD) giảm ~50–60% → ước 10–15 MB toàn bộ hình, đạt mục tiêu < 30 MB (GDD §12). Tải theo khu (Núi, làng Sung, meme, cưới) để vào game nhanh.
- **Ảnh lớn nhất** (đình ~960×448, cây đa ~448×448) dưới giới hạn texture 4096 → không cần cắt.
- **Hướng NPC:** chỉ mặt trước + lật; NPC không quay lưng (GDD §3.16 "quay mặt về {ten}" = lật trái/phải).
- **Không vẽ bóng dưới chân** vào sprite (Art Bible §6.3): game vẽ elip chàm bằng code cho mọi nhân vật/con vật.
- Đổi texture giữa khung 64×96 và 128×128 luôn đổi origin cùng lúc (đã làm cho cuốc) — áp dụng y hệt cho tưới/cúi/chặt/câu và mọi bậc.

**Ghép tile Lô 1 (T-019 → T-021/T-022/T-024), đã kiểm bằng cảnh ghép `art-source/raw/lot1/scene-1x.png`:**
- Texture lõi 256 (4×4 ô): `grass`, `path`, `yard`, `soil-dry`, `soil-till-1`, `soil-till-2`, `soil-tilled`, `soil-watered` — ô = `(y % 4) * 4 + (x % 4)`. Nấc cuốc (`tillStage` 0..3) → `soil-dry` / `soil-till-1` / `soil-till-2` / `soil-tilled`; đã tưới → đổi lõi sang `soil-watered` (viền giữ nguyên).
- Lớp 2 — `soil-tilled-edge.png` (16 ô, ô = mask): chỉ trên ô **đã cuốc/đã tưới**, bit = cạnh giáp ô **không** đã cuốc (N1 E2 S4 W8). Góc ngoài tô màu đất khô.
- Lớp 3 — `path-edge.png` (16 ô, ô = mask) trên **mọi ô đất** (lối, sân, ruộng mọi nấc) có cạnh giáp **cỏ**; `path-corner.png` (2×2: 0 TB, 1 ĐB, 2 TN, 3 ĐN) khi ô chéo là cỏ còn hai ô kề cạnh góc đó không phải cỏ. Lối ↔ sân ↔ ruộng không có mép giữa nhau. Ngoài mép bản đồ: coi như cùng loại với ô đang xét.
- Thứ tự vẽ: lõi → viền luống → mép cỏ → cây/nhân vật. Mỗi file có bản `-ex.png` (margin 1, spacing 2).
- Cây: dải 3 khung 64×96, **đáy khung = đáy ô**, đáy cây ở hàng 86 → `setOrigin(0.5, 1)` đặt tại (giữa ô, đáy ô); depth giữ `y ô + CROP_BASE`. Cây cao (lúa, muống) tràn lên ô trên là có chủ ý.

**Điểm lệch tài liệu cần `game-planner` xem (không tự sửa GDD):**
1. ART-CHR-008 vẽ **bình tưới tôn**, GDD §3.8 ghi bậc 1 là **gáo dừa**, bậc 2 thùng tưới. Đề xuất: đổi tên món bậc 1 thành "bình tưới cũ" (dễ đọc hình ở 64 px), thùng tưới dùng chung hoạt ảnh, chỉ khác icon.
2. HUD "4 icon nông cụ góc dưới trái" (GDD §11) trùng vai với hotbar sau D-026 → art chỉ làm icon nông cụ (ART-ITM-004), không làm khung HUD nông cụ riêng cho tới khi chốt.
3. Cụ Bá Kẹo **sprite ngồi sập** chỉ cần nếu cảnh cưới ghép bằng code (câu hỏi 3) → để Could.
4. Cá nướng rô/trê/chép/lóc dùng **một icon** (tên khác nhau) để tiết kiệm.

## 4. Quyết định đã chốt (người dùng, 2026-10-14)

1. **Bậc ngoại hình:** kịch bản **B** — bậc 2–3 đủ đi + xoay + cuốc/tưới/cúi/chặt/câu; bậc 4 Phú ông chỉ đi/đứng (+ xoay, Should), động tác mượn khung bậc 3 + khăn xếp vẽ đè bằng code (−3,75 USD).
2. **Trong nhà {ten}:** **cảnh trong nhà riêng** khi bước qua cửa — ART-BG-011 nền phòng + ART-PRP-010 nội thất + ART-PRP-011 bếp (~0,8 USD cho nền + nội thất). `game-dev` thêm một cảnh nhỏ.
3. **Intro 4 khung + cưới 3 khung:** **vẽ trọn tranh** (`--hq`, `--ref` nhân vật), ~3,75 USD; khung nào lệch nhân vật quá 3 vòng thì riêng khung đó lùi về nền vẽ + chân dung ghép bằng code.

## 5. Danh sách chi tiết theo lô

### Lô 0 — Đã có (chặng 2–3, không tính chi phí)

| ID | Tên | Loại | Kích thước / khung | Frames | Dùng ở | Ưu tiên | Ảnh gen (ước) | USD (ước) | Trạng thái | Prompt card |
|---|---|---|---|---|---|---|---|---|---|---|
| ART-CHR-001 | {ten} — concept nhân vật chính (nón lá) = **style anchor** (ảnh #4) | CHR | concept 1024 | tĩnh | Tham chiếu `--ref` | Must | — | — | **Approved** (người dùng chọn #4) | [ART-CHR-001](prompts/ART-CHR-001.md) |
| ART-CHR-002 | {ten} — sprite bản đồ 4 hướng (down/up/left/right) | CHR | 64×96 | tĩnh, anim bằng code | Bản đồ | Must | — | — | Approved | [ART-CHR-002](prompts/ART-CHR-002.md) |
| ART-POR-001 | Chân dung {ten} — cười đểu / nhếch mép xoa cằm | POR | 512 | tĩnh, anim bằng code | Khung thoại, bong bóng | Must | — | — | Approved | [ART-POR-001](prompts/ART-POR-001.md) |
| ART-POR-002 | Chân dung {ten} — nháy mắt xoa tay (mặc cả) | POR | 512 | tĩnh, anim bằng code | Khung thoại, bong bóng | Must | — | — | Approved | [ART-POR-001](prompts/ART-POR-001.md) |
| ART-POR-003 | Chân dung {ten} — khoe khoang tự mãn | POR | 512 | tĩnh, anim bằng code | Khung thoại, bong bóng | Must | — | — | Approved | [ART-POR-001](prompts/ART-POR-001.md) |
| ART-POR-004 | Chân dung {ten} — chửi thề mặt đỏ | POR | 512 | tĩnh, anim bằng code | Khung thoại, bong bóng | Must | — | — | Approved | [ART-POR-001](prompts/ART-POR-001.md) |
| ART-POR-005 | Chân dung {ten} — đuối, lè lưỡi | POR | 512 | tĩnh, anim bằng code | Khung thoại, bong bóng | Must | — | — | Approved | [ART-POR-001](prompts/ART-POR-001.md) |
| ART-POR-006 | Chân dung {ten} — buồn ngủ, chảy dãi, bong bóng mũi | POR | 512 | tĩnh, anim bằng code | Khung thoại, bong bóng | Must | — | — | Approved | [ART-POR-001](prompts/ART-POR-001.md) |
| ART-POR-007 | Chân dung {ten} — nịnh bợ chắp tay (trước bố vợ) | POR | 512 | tĩnh, anim bằng code | Khung thoại, bong bóng | Must | — | — | Approved | [ART-POR-001](prompts/ART-POR-001.md) |
| ART-POR-008 | Chân dung {ten} — bị từ chối, mếu | POR | 512 | tĩnh, anim bằng code | Khung thoại, bong bóng | Must | — | — | Approved | [ART-POR-001](prompts/ART-POR-001.md) |
| ART-POR-009 | Chân dung {ten} — thấy tiền, mắt đồng xu | POR | 512 | tĩnh, anim bằng code | Khung thoại, bong bóng | Must | — | — | Approved | [ART-POR-001](prompts/ART-POR-001.md) |
| ART-CHR-003 | {ten} — bậc ngoại hình 2–4 (Người bình thường / Khá giả / Phú ông), hướng xuống, dáng chống nạnh | CHR | 64×96 | tĩnh, anim bằng code | Bản đồ, "lột xác", `--ref` cho 4 hướng + chân dung từng bậc | Must | — | — | Approved — sheet `art-source/raw/hero-tiers/tiers-sheet.png` | [ART-CHR-003](prompts/ART-CHR-003.md) |
| ART-CHR-004 | {ten} — chu trình bước đi 4 khung × 4 hướng (**bậc 1** xong; bậc 2–4 sau) | CHR | 64×96/khung, dải 256×96 | 4/hướng, 8 fps | Bản đồ | Must | — | — | **Processed** (chờ người dùng duyệt) — sheet `art-source/raw/hero-walk/walk-sheet.png`, GIF `preview-<hướng>.gif` | [ART-CHR-004](prompts/ART-CHR-004.md) |
| ART-CHR-005 | {ten} — chu trình đi **ngang** v2: 6 khung, profile rõ, sải dài, tay đổi bên (bậc 1); trái = lật gương | CHR | 64×96/khung, dải 384×96 | 6/hướng, 12 fps trong game (gợi ý 10) | Bản đồ (thay hướng ngang của ART-CHR-004) | Must | — | — | **Đã gắn vào game** (người dùng duyệt 2026-10-10) — `characters/hero-t1-walk-right.png`, `-left.png` | [ART-CHR-005](prompts/ART-CHR-005.md) |
| ART-CHR-006 | {ten} — 4 khung xoay chéo 3/4 (xuống-phải/trái, lên-phải/trái) chèn 1 nhịp khi đổi hướng (bậc 1) | CHR | 64×96 ×4, dải 256×96 | 1 khung × 70 ms (quay 180° = 2 khung) | Bản đồ — đổi hướng | Should | — | — | **Đã gắn vào game** (người dùng duyệt 2026-10-10) — `characters/hero-t1-turn.png` | [ART-CHR-006](prompts/ART-CHR-006.md) |
| ART-CHR-007 | {ten} — động tác **cuốc** 4 hướng (bậc 1), cuốc vẽ chung vào sprite | CHR | khung **128×128**, dải 512×128 (bản 2x 1024×256 ở `art-source/raw/hero-hoe/final/`) | 4/hướng, mỗi khung 25% `actionDuration`; **khung 3 (chỉ số 2) = chạm** | Vườn — cuốc ô (T-002, T-009) | Must | — | — | **In-game files đã đặt** (chờ game-dev gắn + người dùng duyệt) — xem `art-source/raw/hero-hoe/hoe-review.png` | [ART-CHR-007](prompts/ART-CHR-007.md) |
| ART-ITM-001 | Icon **cái cuốc** (hotbar, gùi) | ITM | 128×128 (hiển thị ~64–80 trong ô 92) | tĩnh | HUD — hotbar, gùi (T-009) | Must | — | — | **In-game files đã đặt** (chờ người dùng duyệt) | [ART-CHR-007](prompts/ART-CHR-007.md) (mục Icon) |
| ART-CON-001 | Concept toàn cảnh **Xóm làng Lầy** (không khí + bố cục theo phác thảo người dùng) | Concept / tham chiếu | 1376×768 (16:9) | tĩnh | Tham chiếu dựng bản đồ xóm; **ứng viên nền menu** (ART-BG-001, 0 USD nếu người dùng ưng) | Should | — | — | **Generated** — chọn #3, chờ người dùng xem: `art-source/reference/concept-xom-lang-lay.png` (so sánh `art-source/raw/xom-concept/xom-concept-compare.png`) | [ART-CON-001](prompts/ART-CON-001.md) |

### Lô 1 — Vườn thật (làm đầu tiên ở 4.2)

41 mục (+ 2 dòng đã gộp/bỏ, 0 USD) · 52 ảnh hq + 93 ảnh nhanh ≈ **13,20 USD** (chưa cộng dự phòng)

> **Mặt đất & thảm thực vật** theo Art Bible §7.1: lối đi = **đất nện** (không phải cỏ), cây theo cụm. Gen theo thứ tự **TIL-006 → ENV-016 → ENV-017 → ENV-003** ngay đầu Lô 1 (chốt style cây trước nhà/cây trồng), mọi lần gen `--ref art-source/reference/sample-dat-nen-bui-cay.png` + style anchor.

| ID | Tên | Loại | Kích thước / khung | Frames | Dùng ở | Ưu tiên | Ảnh gen (ước) | USD (ước) | Trạng thái | Prompt card |
|---|---|---|---|---|---|---|---|---|---|---|
| ART-CHR-008 | {ten} — động tác **tưới** 4 hướng (bậc 1). Card hiện vẽ *bình tưới tôn*; GDD §3.8 ghi bậc 1 là *gáo dừa* → chốt khi gen (đề xuất giữ bình tưới cho dễ đọc, đổi tên món) | CHR | 128×128, dải **512×128** | **4**/hướng (25% mỗi khung như cuốc); **khung chỉ số 2 = chạm** | Vườn — tưới (T-003) | Must | 10 hq | 1,34 | **Approved** (người dùng duyệt 2026-10-14, T-020; chờ game-dev gắn T-023) — `characters/hero-t1-water-{down,up,left,right}.png`, bình tưới = icon `item-binh-tuoi` · **4 khung như cuốc** (khung 2 = chạm) · thật: 8 hq | [ART-CHR-008](prompts/ART-CHR-008.md) |
| ART-CHR-009 | {ten} — động tác **cúi** (gieo / hái / dọn / hái lượm, tay không) 4 hướng (bậc 1) | CHR | 128×128, dải **512×128** | **4**/hướng (như cuốc); **khung chỉ số 2 = chạm** | Vườn, Núi — gieo, hái (T-003) | Must | 10 hq | 1,34 | **Approved** (người dùng duyệt 2026-10-14, T-020; chờ game-dev gắn T-023) — `characters/hero-t1-bend-{down,up,left,right}.png` · miếng vá chàm đũng quần khi cúi quay lưng: **giữ làm câu đùa** (người dùng chọn) · 4 khung, khung 2 = chạm; điểm tay khung 3 trong card · thật: 6 hq | [ART-CHR-009](prompts/ART-CHR-009.md) |
| ART-CHR-012 | {ten} — nằm ngủ gục ngoài đồng (1 khung; Zzz bằng code) | CHR | 128×128 (nằm ngang) | tĩnh | Ngủ gục 24h (GDD §3.1). Lùi: xoay sprite bằng code | Could | 2 hq | 0,27 | Planned — ngoài ngân sách (chỉ làm nếu còn dư) | — |
| ART-TIL-001 | Tile cỏ (thử nối liền) — **dùng làm cỏ nền chính thức** nếu người dùng ưng | TIL | 256 = 4×4 ô 64 | — | Bản đồ | Must | 0 | 0,00 | **Approved** (người dùng duyệt 2026-10-14, T-019) — thay ảnh thử bằng cỏ mới theo ảnh mẫu (búi thưa, script rải lại búi) `tiles/grass.png` · thật: 2 nhanh | [ART-TIL-003](prompts/ART-TIL-003.md) |
| ART-TIL-002 | Tile đất cuốc (thử nối liền) — dùng lại cho ART-TIL-004 | TIL | 256 = 4×4 ô 64 | — | Ruộng | Must | 0 | 0,00 | Thay bằng `tiles/soil-tilled.png` gen lại cùng bộ (ảnh thử còn ở `tiles/tile-dirt-test.png`, game-dev gỡ khi gắn T-021) | [ART-TIL-001](prompts/ART-TIL-001.md) |
| ART-TIL-003 | Đất ruộng **chưa cuốc** (khô) — texture + 9 ô viền ruộng↔cỏ (script vẽ) | TIL | 256 = 4×4 ô 64; viền 9 ô 64 | — | Vườn — vùng ruộng | Must | 6 nhanh | 0,40 | **Approved** (người dùng duyệt 2026-10-14, T-019) — `tiles/soil-dry.png`; viền ruộng↔cỏ dùng chung `path-edge`/`path-corner` (thay bộ 9 ô) · thật: 2 nhanh | [ART-TIL-003](prompts/ART-TIL-003.md) |
| ART-TIL-004 | Đất **đã cuốc** — texture (dùng lại ART-TIL-002 nếu ưng) + **16 ô viền 4-bit** (script vẽ, lớp phủ trong suốt) | TIL | 256 = 4×4 ô 64; viền 256 = 16 ô | — | Vườn — ô đã cuốc | Must | 0 | 0,00 | **Approved** (người dùng duyệt 2026-10-14, T-019) — gen lại 8 luống cho cùng bộ `tiles/soil-tilled.png` + viền 16 ô `tiles/soil-tilled-edge.png` (script) · thật: 2 nhanh | [ART-TIL-003](prompts/ART-TIL-003.md) |
| ART-TIL-005 | Đất **đã cuốc + đã tưới** (sẫm `#553522`, đốm nước) — script làm từ TIL-004, dùng chung viền | TIL | 256 = 4×4 ô 64 | — | Vườn — ô đã tưới | Must | 0 | 0,00 | **Approved** (người dùng duyệt 2026-10-14, T-019) — `tiles/soil-watered.png` (script từ TIL-004, 0 USD) | [ART-TIL-003](prompts/ART-TIL-003.md) |
| ART-TIL-013 | Đất **cuốc dở** 2 nấc: "vỡ cỏ" (cỏ lẫn cục đất) + "lổn nhổn" (đất thô còn sợi cỏ) — D-022 đất đổi 3 nấc | TIL | 2 × 256 = 4×4 ô 64 | — | Vườn — trong lúc cuốc (nhát 2, 4) | Must | 6 nhanh | 0,40 | **Approved** (người dùng duyệt 2026-10-14, T-019) — `tiles/soil-till-1.png` (vỡ cỏ), `tiles/soil-till-2.png` (lổn nhổn) · thật: 8 nhanh (lổn nhổn 3 vòng) | [ART-TIL-003](prompts/ART-TIL-003.md) |
| ART-TIL-006 | **Lối đi đất nện** (Art Bible §7.1): nâu vàng nhạt `#D9B577`, nện chặt, vệt mòn sáng, 2 vệt bánh xe mờ, dấu chân trần, sỏi nhỏ — **không phải cỏ**. Texture lõi seamless + **mép mềm chuyển cỏ 16 ô 4-bit + 4 ô góc lõm** (ngã ba/ngã tư) do script vẽ (vai đường `#7A4B2A` + răng cưa cỏ cắt từ TIL-001), lớp phủ trong suốt | TIL | lõi 256 = 4×4 ô 64; mép `path-edge.png` 256 (16 ô) + `path-corner.png` 128 (4 ô) | — | Lối vườn (cửa nhà → cổng → ruộng), đường xóm, ngõ trái, ngõ giữa, đường cái | Must | 4 nhanh (gen chung lượt với TIL-014) | 0,27 | **Approved** (người dùng duyệt 2026-10-14, T-019) — `tiles/path.png` + mép `path-edge.png` (16) + `path-corner.png` (4, 2×2) do `tools/tile_edges.py` vẽ; **bỏ vệt bánh xe khỏi lõi** (Giả định, texture lặp 2 chiều) · thật: 2 nhanh | [ART-TIL-006](prompts/ART-TIL-006.md) |
| ART-TIL-014 | **Sân đất nện**: cùng texture TIL-006 nhưng **không vệt bánh xe**, ít sỏi; sân nối liền lối đi ở chỗ cổng (không có mép cỏ) | TIL | 256 = 4×4 ô 64 (dùng chung mép TIL-006) | — | Sân nhà {ten} (y 7–8), sân giếng, bãi trống, sân nhà tranh | Must | 0 (2 trong 4 ảnh của TIL-006) | 0,00 | **Approved** (người dùng duyệt 2026-10-14, T-019) — `tiles/yard.png` (dùng chung mép TIL-006) · thật: 2 nhanh | [ART-TIL-006](prompts/ART-TIL-006.md) |
| ART-TIL-009 | ~~Cỏ biến thể~~ — **bỏ 2026-10-14**: cụm bụi cỏ / hoa (ENV-016/017) đã phá lộ ô lặp | TIL | — | — | — | Cắt | 0 | 0,00 | Cắt (thay bằng ENV-016/017) | — |
| ART-ENV-016 | Sheet **bụi cỏ** (6 món, Art Bible §7.1): cỏ gà thấp ×2, cỏ lau thấp bông nâu ×2, búi cỏ có hoa dại ×1, hòn đá nhỏ + cỏ dại ×1 (ruộng chưa mở — thay ART-ENV-008) | ENV | ≤ 1 ô mỗi món (nguồn 128×128) | tĩnh (lá rung bằng code — Should) | Mép lối đi, quanh ruộng, gốc đa, bờ hồ, ruộng chưa mở | Must | 4 nhanh | 0,27 | **Approved** (người dùng duyệt 2026-10-14, T-020) — `props/grass-{tuft-1,tuft-2,reed-1,reed-2,flower,stone}.png` (64×64, đi xuyên) · gen chung sheet 12 món với ENV-017 · thật: 3 nhanh (chung) | [ART-ENV-016](prompts/ART-ENV-016.md) |
| ART-ENV-017 | Sheet **lùm hoa** (6 món): dâm bụt bụi 1 ô + bụi 2 ô (lá tròn xanh đậm, hoa đỏ son), khóm hoa mười giờ hồng ×2, khóm cúc dại trắng nhụy vàng ×2. Sen ở hồ thuộc ART-ENV-006 | ENV | 1–2 ô mỗi món | tĩnh | Góc rào (dâm bụt), mép lối, sân giếng, gốc đa | Must | 4 nhanh | 0,27 | **Approved** (người dùng duyệt 2026-10-14, T-020) — `props/flower-dambut-1.png` (64×80, chặn), `flower-dambut-2.png` (128×112, chặn 2 ô), `flower-muoigio-{1,2}.png`, `flower-cuc-{1,2}.png` (64×64, đi xuyên) · 0 thêm (chung sheet ENV-016) | [ART-ENV-016](prompts/ART-ENV-016.md) |
| ART-ENV-003 | **Lùm cây** — 4 biến thể 1 sheet (chuyển từ Lô 2, 2026-10-14): chè tàu gối tròn 1 ô, chè tàu dải 2 ô ngang (cắt tỉa, ghép thành hàng rào xanh), duối bù xù, cây bụi tán thấp 2 ô | ENV | 1–2 ô mỗi bụi | tĩnh | Quanh vườn {ten}, mép ngõ, khe giữa nhà (chặn đi tắt), mép hồ | Must | 4 nhanh | 0,27 | **Approved** (người dùng duyệt 2026-10-14, T-020) — `props/bush-che-tron.png` (1 ô), `bush-che-dai.png` (2 ô), `bush-che-dai-3.png` (3 ô, thêm), `bush-duoi.png` (1 ô), `bush-tan-thap.png` (2 ô) · thật: 2 nhanh | [ART-ENV-016](prompts/ART-ENV-016.md) |
| ART-CRP-001 | Cây trồng **chung**: hạt vừa gieo (ụ đất), mầm chung, cây **héo** chung (nâu xám, lá nhọn rũ); "khát" = code làm nhạt + nghiêng lá | CRP | ô 64×96 (gốc ở đáy ô), dải 3 khung | 3 trạng thái | Vườn — mọi cây | Must | 4 nhanh | 0,27 | **Approved** (người dùng duyệt 2026-10-14, T-019) — `props/crop-common.png` dải 3 khung 64×96: 0 hạt · 1 mầm chung · 2 héo; **khát = code** (tint ngả `#B98550` ~35% + co dọc 0,92) · thật: 2 nhanh | [ART-CRP-001](prompts/ART-CRP-001.md) |
| ART-CRP-002 | **Rau cải** — lớn / chín | CRP | 64×96, dải 2–3 khung | theo giai đoạn | Vườn | Must | 4 nhanh | 0,27 | **Approved** (người dùng duyệt 2026-10-14, T-019) — `props/crop-rau-cai.png` dải 3 khung 64×96: 0 non · 1 lớn · 2 chín · thật: 2 nhanh | [ART-CRP-001](prompts/ART-CRP-001.md) |
| ART-CRP-003 | **Khoai lang** — dây non / dây lớn / chín (củ lộ) | CRP | 64×96, dải 3 khung | theo giai đoạn | Vườn | Must | 4 nhanh | 0,27 | **Approved** (người dùng duyệt 2026-10-14, T-019) — `props/crop-khoai-lang.png` dải 3 khung 64×96: 0 non · 1 lớn · 2 chín · thật: 2 nhanh | [ART-CRP-001](prompts/ART-CRP-001.md) |
| ART-CRP-004 | **Rau muống** — lớn / chín | CRP | 64×96, dải 2–3 khung | theo giai đoạn | Vườn (mùa mưa) | Must | 4 nhanh | 0,27 | **Approved** (người dùng duyệt 2026-10-14, T-019) — `props/crop-rau-muong.png` dải 3 khung 64×96: 0 non · 1 lớn · 2 chín · thật: 2 nhanh | [ART-CRP-001](prompts/ART-CRP-001.md) |
| ART-CRP-005 | **Dưa hấu** — dây / quả non / chín (quả to tràn ô) | CRP | 64×96, dải 3 khung | theo giai đoạn | Vườn (Lv 3) | Must | 4 nhanh | 0,27 | **Approved** (người dùng duyệt 2026-10-14, T-019) — `props/crop-dua-hau.png` dải 3 khung 64×96: 0 non · 1 lớn · 2 chín · thật: 2 nhanh | [ART-CRP-001](prompts/ART-CRP-001.md) |
| ART-CRP-006 | **Lúa nếp** — mạ / lúa xanh / lúa chín vàng | CRP | 64×96, dải 3 khung | theo giai đoạn | Vườn (Lv 5, mùa mưa) | Must | 4 nhanh | 0,27 | **Approved** (người dùng duyệt 2026-10-14, T-019) — `props/crop-lua-nep.png` dải 3 khung 64×96: 0 non · 1 lớn · 2 chín · thật: 2 nhanh | [ART-CRP-001](prompts/ART-CRP-001.md) |
| ART-BLD-001 | Nhà {ten}: nhà tranh 2 gian, mái rạ xơ xác, vách đất nứt, cửa liếp tre, hiên + chõng | BLD | **384×320** (6×5 ô) | tĩnh | Khuôn viên nhà {ten} (Vườn → Xóm) | Must | 4 hq | 0,54 | **Approved** (người dùng duyệt 2026-10-14, T-020) — `props/house-hero.png` **384×320** (6×5 ô), chân đế 6×2 ô, cửa ở x 2–3 hàng đáy (`props/props.json`) · thật: 2 hq | [ART-BLD-001](prompts/ART-BLD-001.md) |
| ART-BLD-016 | Nhà {ten} sau nâng **bếp gạch**: thêm ống khói gạch đỏ (sửa từ BLD-001 bằng `--ref`) | BLD | ~6×4 ô | tĩnh | Sau nhiệm vụ 8 | Should | 3 nhanh | 0,20 | Planned — **trong ngân sách** | — |
| ART-BG-011 | **Trong nhà {ten}** — cảnh riêng khi bước qua cửa (người dùng chốt 2026-10-14): nền phòng vách đất, sàn đất nện, cửa liếp | BG | **1280×720** (20×11,25 ô) | tĩnh | Ngủ, nấu, rương | Must | 4 hq | 0,54 | **Approved** (người dùng duyệt 2026-10-14, T-020) — `backgrounds/house-interior.png` **1280×720** (vừa màn khi zoom 1,5; ngoài tường trong suốt), sàn / cửa trong `props.json` `_interior` · thật: 2 hq | [ART-BLD-001](prompts/ART-BLD-001.md) |
| ART-PRP-010 | Sheet nội thất: giường tre, hũ gạo, rương gỗ, nón ông nội treo vách | PRP | 1–2 ô mỗi món | tĩnh | Trong nhà {ten} | Must | 4 nhanh | 0,27 | **Approved** (người dùng duyệt 2026-10-14, T-020) — `props/house-bed.png` 128×128 (2×2 ô), `house-hu-gao.png`, `house-ruong.png`, `house-non-ong.png` (64×64) · thật: 4 nhanh (nón vẽ lại 1 lượt) | [ART-BLD-001](prompts/ART-BLD-001.md) |
| ART-PRP-011 | **Bếp rơm** (3 hòn đầu rau, ám khói) + **bếp gạch đỏ** (nâng cấp) — 1 ảnh 2 trạng thái | PRP | ~2×2 ô mỗi bếp | tĩnh ×2 (lửa bằng code) | Trong nhà — nấu; nhiệm vụ 8 | Must | 4 hq | 0,54 | **Approved** (người dùng duyệt 2026-10-14, T-020) — `props/stove-rom.png`, `props/stove-gach.png` 128×128 (chân 2×1 ô; điểm lửa / khói trong `props.json`) · thật: 4 hq (v1 nhìn chéo góc) | [ART-BLD-001](prompts/ART-BLD-001.md) |
| ART-PRP-012 | Sheet vườn: **thúng bán có nắp** (đóng / hé có đồ) + **cọc rào tre** mở ruộng (cọc + dây) | PRP | 1 ô mỗi món | tĩnh ×3 | Thùng bán, mở rộng ruộng | Must | 4 nhanh | 0,27 | **Approved** (người dùng duyệt 2026-10-14, T-020) — `props/sell-basket-closed.png` (64×64), `sell-basket-open.png` (96×64), `stake-1.png`, `stake-row.png` · thật: 2 nhanh | [ART-PRP-012](prompts/ART-PRP-012.md) |
| ART-PRP-001 | Quầy hạt ở hiên: chõng tre, thúng hạt, biển gỗ vẽ hạt (ghép lên ART-BLD-003) — dùng ngay thay sạp hạt hộp của prototype | PRP | ~3×2 ô | tĩnh | Nhà cô Tám Thóc (Vườn prototype: sạp hạt) | Must | 4 nhanh | 0,27 | **Approved** (người dùng duyệt 2026-10-14, T-020) — `props/seed-stall.png` **192×128** (3×2 ô), không người bán, `sellerSpot` trong `props.json` (D-037) · thật: 2 nhanh | [ART-PRP-012](prompts/ART-PRP-012.md) |
| ART-ENV-002 | **Cây nhãn** (tham khảo cây nhãn vườn Bắc Bộ): tán tròn xanh đậm, thân xù thấp; tách tán / gốc | ENV | ~3×3 ô | tĩnh (Could: biến thể có chùm quả) | Vườn {ten}, ông Gật, cô Ngóng, dọc đường xóm | Must | 4 nhanh | 0,27 | **Approved** (người dùng duyệt 2026-10-14, T-020) — `props/tree-nhan-trunk.png` + `tree-nhan-canopy.png` (cùng canvas **224×224**, gốc chặn 1 ô) + bản gộp `tree-nhan.png` · thật: 3 nhanh | [ART-ENV-016](prompts/ART-ENV-016.md) |
| ART-ENV-004 | Rào dâm bụt đỏ + rào tre thấp (tile ngang/dọc + góc) | ENV | tile 64 | — | Khuôn viên nhà, rào cô Ngóng | Must | 4 nhanh | 0,27 | **Approved** (người dùng duyệt 2026-10-14, T-020) — rào tre `props/fence-tre-{h,post,v}.png` (64×80 / ô, cao 70 px), dâm bụt `props/hedge-dambut-{h-l,h-mid3,h-r}.png` (ngang 64×96 / ô) + `{v-top,v-mid,v-bottom}` (dọc) — ghép bằng script, không lộ nối · rào tre **dọc vẽ lại** theo yêu cầu người dùng: script `art-source/raw/lot1/tools/fence_v.py` (trụ ngắn có khe + 2 thanh + chéo X; 3 ảnh gen thử đều ra "thang" nằm → không dùng) · thật: 6 nhanh | [ART-ENV-016](prompts/ART-ENV-016.md) |
| ART-ENV-008 | ~~Sheet trang trí ruộng hoang~~ — **gộp vào ART-ENV-016** (2026-10-14) | ENV | — | — | — | Gộp | 0 | 0,00 | Gộp vào ENV-016 | — |
| ART-ITM-002 | Sheet icon **Vườn 1** (9): 5 túi hạt (cải, khoai, muống, dưa, nếp) + gáo dừa/bình tưới + bát cơm + khoai nướng + bát cháo | ITM | 9 × 128×128 (lưới 3×3 → tách) | tĩnh | Hotbar, gùi, cửa hàng, tổng kết | Must | 3 hq | 0,40 | **Approved** (người dùng duyệt 2026-10-14, T-019) — 9 file `items/item-hat-<cropId>.png` ×5 (dây buộc tô màu theo loại bằng script: cải xanh lá, khoai tím, muống xanh ngọc, dưa đỏ, nếp vàng), `item-binh-tuoi`, `item-bat-com`, `item-khoai-nuong`, `item-bat-chao` · thật: 2 hq | [ART-ITM-002](prompts/ART-ITM-002.md) |
| ART-ITM-003 | Sheet icon **Vườn 2** (9): bó cải, củ khoai, bó muống, quả dưa, bó lúa nếp, trứng, xâu quan tiền, túi tiền lộn trái, sợi dây rơm (meme "còn cái nịt") | ITM | 9 × 128×128 | tĩnh | Hotbar, gùi, HUD, meme | Must | 3 hq | 0,40 | **Approved** (người dùng duyệt 2026-10-14, T-019) — 9 file `items/item-<cropId>.png` ×5, `item-trung`, `item-xau-tien`, `item-tui-tien-rong`, `item-day-rom` · thật: 2 hq | [ART-ITM-002](prompts/ART-ITM-002.md) |
| ART-UI-001 | Màu **"xám tro ấm"** viền ô ngoài tầm: lót mực 1 px + `#B5AA94` 2 px, nét đứt | UI (màu) | — (hằng số `palette.ts`) | — | Vườn — viền ô dưới con trỏ | Must | 0 | 0,00 | **Planned — chốt ở 4.2** (NHÁP, đề xuất game-dev/QA; 0 USD) | [ART-UI-001](prompts/ART-UI-001.md) |
| ART-UI-002 | Khung **giấy điệp** cửa sổ 9-slice (lớn) + khung tooltip (nhỏ) | UI | nguồn 512, nhúng 9-slice (góc 48 px) | tĩnh | Mọi cửa sổ: gùi, thùng bán, tổng kết, tạm dừng | Must | 3 hq | 0,40 | Planned | — |
| ART-UI-003 | Ô hotbar/gùi: thường / đang chọn (viền vàng) / khóa | UI | 3 × 96×96 | tĩnh ×3 | Hotbar, gùi, thùng bán | Must | 3 nhanh | 0,20 | Planned | — |
| ART-UI-004 | Nút 9-slice: thường / hover / nhấn / xám | UI | 4 × nguồn 256×96 | tĩnh ×4 | Mọi cửa sổ | Must | 3 nhanh | 0,20 | Planned | — |
| ART-UI-005 | Khung HUD: ống tre thanh Sức (ruột màu bằng code), đĩa đồng hồ gỗ, ô tiền, bảng level + danh hiệu | UI | sheet, mỗi món 128–512 | tĩnh | HUD 4 góc | Must | 3 hq | 0,40 | Planned | — |
| ART-UI-006 | Sheet icon HUD (9): mặt trời, trăng, nắng, mưa, mùa nắng, mùa mưa, sao level, Sức, sổ nhiệm vụ | UI | 9 × 128×128 | tĩnh | HUD, tổng kết | Must | 3 hq | 0,40 | Planned | — |
| ART-UI-007 | Bong bóng: thường (tròn), **chửi thề** (răng cưa), **khoe** (vàng), "…" | UI | 4 × nguồn 256 (9-slice hoặc co giãn) | tĩnh | Bong bóng trên đầu (§3.12) | Must | 4 nhanh | 0,27 | Planned | — |
| ART-FX-001 | Hiệu ứng **đất bung lên** khi cuốc | FX | 96×96 ×3, dải 288×96 | 3 khung × ~60 ms, phát tại khung chạm | Vườn — cuốc, dọn | Should | 4 nhanh | 0,27 | **Planned — 4.2 hoặc 4.5** (NHÁP; hiện dùng bụi bằng code) · **trong ngân sách** | [ART-FX-001](prompts/ART-FX-001.md) |
| ART-FX-002 | Vân **giấy điệp** phủ toàn màn (ô seamless) — thử script tạo nhiễu trước (0 USD) | FX | 512 seamless | — | Phủ Multiply 8–15% (Art Bible §6.4) | Should | 4 nhanh | 0,27 | Planned — **trong ngân sách** | — |
| ART-FX-006 | Sheet FX nhỏ (9): mồ hôi, Zzz, "!", khói giận, ruồi (cây héo), giọt nước, lấp lánh, mũi tên hướng dẫn, hạt rơi | FX | 9 × 64–128 | tĩnh (chuyển động bằng code) | Juice §8, hướng dẫn ngày 1 | Should | 3 hq | 0,40 | Planned — **trong ngân sách** | — |

### Lô 2 — Xóm làng Lầy + NPC Xóm + {ten} bậc 2

> Lô 2 gồm **Lô Xóm (D-027)** do `game-planner` thêm 2026-10-13 (bố cục, tọa độ, "ai ở nhà nào": GDD §5; mô tả hình: story bible §2.2). Kiến trúc Bắc Bộ, nhà quay mặt về nam, nhìn từ trên-nam góc 3/4; cây cối hiền, tán tròn. Kích thước nhà là ô 64 px, **gợi ý** — chốt khi gen. Nhà {ten}, quầy hạt, cây nhãn, rào, đường đất đã chuyển lên Lô 1. Prompt card các mục mới viết ngay trước khi gen (mẫu `.claude/templates/art-prompt-card.md`).

57 mục · 158 ảnh hq + 93 ảnh nhanh ≈ **27,40 USD** (chưa cộng dự phòng)

> Mặt đất Xóm dùng lại tile Lô 1 (đất nện TIL-006, sân TIL-014, mép 20 ô) và các sheet cây ENV-003/016/017 — đặt theo quy tắc cụm ở Art Bible §7.1 (mép đường, góc rào, quanh giếng / gốc đa / bờ hồ, khe giữa nhà; **không đặt trên lối đi**). Lô 2 chỉ thêm khóm tre lẻ (ENV-005) và cây ven hồ (ENV-006).

| ID | Tên | Loại | Kích thước / khung | Frames | Dùng ở | Ưu tiên | Ảnh gen (ước) | USD (ước) | Trạng thái | Prompt card |
|---|---|---|---|---|---|---|---|---|---|---|
| ART-BLD-002 | Nhà biến thể A: 3 gian mái rạ, vách đất, hiên cột tre | BLD | ~7×5 ô | tĩnh | Nhà cô Ngóng, ông Khướt, Cu Sún, anh Tráng | Must | 4 hq | 0,54 | Planned (4.2) | — |
| ART-BLD-003 | Nhà biến thể B: 3 gian mái ngói vảy cá cũ rêu, tường gạch mộc, hiên cột gỗ, bậc thềm | BLD | ~7×5 ô | tĩnh | Nhà cô Tám Thóc, ông Gật, bà Ba Trầu | Must | 4 hq | 0,54 | Planned (4.2) | — |
| ART-BLD-004 | Nhà biến thể C: 2 gian nhỏ mái rạ thấp | BLD | ~5×4 ô | tĩnh | Nhà bà Chém, nhà phụ | Must | 6 nhanh | 0,40 | Planned (4.2) | — |
| ART-BLD-005 | Nhà bỏ hoang: từ biến thể A (`--ref`), mái thủng, cỏ mọc trên nóc, cửa xiêu, biển gỗ "Nhà bán" | BLD | ~7×5 ô | tĩnh | Nhà bỏ hoang gần đình (khóa, bản 1.1) | Must | 3 nhanh | 0,20 | Planned (4.2) | — |
| ART-BLD-006 | Lò rèn ông Hai Bễ: lều mái ngói vỡ, lò than đỏ, đe sắt, ống bễ da (khói bằng code) | BLD | ~6×5 ô | tĩnh | Xóm — hàng nhà giữa | Must | 6 nhanh | 0,40 | Planned (4.2) | — |
| ART-BLD-007 | Xưởng mộc chú Đục: lán tre, ngựa cưa, đống gỗ, phoi bào | BLD | ~6×5 ô | tĩnh | Xóm — hàng nhà giữa | Must | 6 nhanh | 0,40 | Planned (4.2) | — |
| ART-BLD-008 | Cổng ngõ Bắc Bộ: cổng có mái (trụ gạch, mái ngói nhỏ, 2 cánh gỗ) + cổng tre đơn (1 sheet) | BLD | ~3×3 ô mỗi cổng | tĩnh | Cổng nhà {ten} + cổng các nhà | Must | 4 nhanh | 0,27 | Planned (4.2) | — |
| ART-BLD-009 | Đình làng: 3 gian, mái cong đầu đao, cột đỏ, bậc thềm | BLD | ~15×4 ô (ảnh lớn) | tĩnh | Xóm — góc đông-nam | Must | 6 hq | 0,80 | Planned (4.2) | — |
| ART-BLD-010 | Lều chợ cóc mái tranh (dùng lặp 2 lần) | BLD | ~5×4 ô | tĩnh | Chợ cóc đầu xóm (chỉ trang trí) | Must | 4 nhanh | 0,27 | Planned (4.2) | — |
| ART-BLD-011 | Quán chè bà Chém: mái lá nhỏ, chõng tre, ghế đẩu, ấm tích trong giỏ ủ, lọ kẹo lạc | BLD | ~4×3 ô | tĩnh | Góc chợ cóc | Must | 4 nhanh | 0,27 | Planned (4.2) | — |
| ART-BLD-012 | Giếng làng: thành gạch tròn, gáo dừa buộc dây | BLD | ~3×3 ô | tĩnh | Bãi đất trống hàng trên | Must | 4 nhanh | 0,27 | Planned (4.2) | — |
| ART-BLD-013 | Miếu nhỏ gốc đa | BLD | ~2×2 ô | tĩnh | Gốc cây đa | Must | 3 nhanh | 0,20 | Planned (4.2) | — |
| ART-BLD-014 | **Bến câu** tre nhô ra hồ — 2 trạng thái: **gãy** (sập một nửa, chăng dây, biển "Bến gãy — cấm câu") / **lành** | BLD | ~2×3 ô mỗi trạng thái | tĩnh ×2 | Hồ làng — câu cá Lv 4 (thay vai trò Suối) | Must | 6 nhanh | 0,40 | Planned (4.2) | — |
| ART-BLD-015 | **Bến nước** bậc gạch xuống hồ (kiểu cầu ao Bắc Bộ) | BLD | ~3×2 ô | tĩnh | Hồ làng — trẻ trâu tắm | Must | 4 nhanh | 0,27 | Planned (4.2) | — |
| ART-PRP-002 | Sạp tre chợ cóc bày hàng tĩnh (rổ rau, buồng chuối, gà trong lồng) — 3 biến thể 1 sheet | PRP | ~2×2 ô mỗi sạp | tĩnh | Chợ cóc | Must | 4 nhanh | 0,27 | Planned (4.2) | — |
| ART-PRP-003 | Sheet đồ trang trí 1: chum vại, đống rơm, giàn mướp, chõng tre, rổ rá | PRP | 1–2 ô mỗi món | tĩnh | Khắp Xóm | Must | 4 nhanh | 0,27 | Planned (4.2) | — |
| ART-PRP-004 | Sheet đồ trang trí 2 (đánh dấu nhà từng người): chổi dựng + then cửa (nhà ông Khướt), ấm tích phơi (bà Chém), ngựa rơm (Cu Sún), cọc tập võ + đòn gánh (anh Tráng), chậu trầu (bà Ba Trầu), chuồng gà tre (ông Gật) | PRP | 1–2 ô mỗi món | tĩnh | 11 nhà hàng xóm | Must | 6 nhanh | 0,40 | Planned (4.2) | — |
| ART-PRP-005 | Chặn cổng theo level: thân cây đổ (Núi, Lv 2), rào tre + biển "đường đang sửa" (làng Sung, Lv 6), biển "Lv N" | PRP | ~3×2 ô mỗi món | tĩnh | 2 cổng Xóm | Must | 4 nhanh | 0,27 | Planned (4.2) | — |
| ART-ENV-001 | **Cây đa cổ thụ** (tham khảo cây đa đình làng Việt xưa, hiền, thân thiện): tán tròn rộng + rễ buông mềm; **tách 2 lớp** tán (vẽ đè người) / gốc (vật cản 2×2) | ENV | tán ~7×7 ô | tĩnh (Should: lá rung bằng code) | Bờ hồ, cạnh đình | Must | 6 hq | 0,80 | Planned (4.2) | — |
| ART-ENV-005 | Lũy tre viền (tile dải 2 ô, tường tre dày) + **khóm tre lẻ 3 biến thể** (4–6 thân thưa + chùm lá lông chim, gốc 1 ô, cao 2–3 ô; khác hẳn lũy tre — Art Bible §7.1) | ENV | tile 64, dải 2 ô; khóm 64×192 / 128×192 | — | Viền bản đồ; khóm lẻ ở mép đường, góc vườn, cạnh giếng, bờ hồ | Must | 6 nhanh | 0,40 | Planned (4.2) — nền `#FF00FF` | — |
| ART-ENV-006 | Lau sậy ven hồ + bèo tấm + khóm sen (props đặt trên nước) | ENV | 1–2 ô mỗi món | tĩnh | Hồ làng | Must | 4 nhanh | 0,27 | Planned (4.2) | — |
| ART-TIL-007 | Sân gạch bát (gạch vuông đỏ sẫm) | TIL | 256 = 4×4 ô 64 | — | Sân đình, sân nhà ngói | Must | 4 nhanh | 0,27 | Planned (4.2) | — |
| ART-TIL-008 | **Nước hồ** xanh rêu + **bờ hồ** (viền 9 ô hoặc 16 ô 4-bit, script vẽ như ART-TIL-004) — thay tile nước suối cũ; nước mùa mưa đục = tô màu lại bằng script | TIL | 256 = 4×4 ô 64 + viền | (Should: gợn nước bằng code) | Hồ làng | Must | 4 nhanh | 0,27 | Planned (4.2) | — |
| ART-ENV-007 | Cây cau, bụi chuối (cau dùng lại cho hàng cau nhà cụ Bá Kẹo) | ENV | ~2×3 ô | tĩnh | Trang trí vườn, làng Sung | Should | 4 nhanh | 0,27 | Planned (4.2) · **trong ngân sách** | — |
| ART-CHR-050 | **U Hến** — đứng chống nạnh cầm gáo dừa, 2 khung (đứng / chậc lưỡi) | CHR | 64×96 ×2 | 2 khung lặp chậm | Xóm theo giờ (hiên, giếng) | Must | 4 hq | 0,54 | Planned | — |
| ART-POR-030 | Chân dung U Hến — lườm (ảnh gốc) | POR | 512 | tĩnh | Thoại, intro, nhiệm vụ 1, 5 | Must | 3 hq | 0,40 | Planned | — |
| ART-POR-031 | Chân dung U Hến — cười mỉm (đám cưới) | POR | 512 | tĩnh | Cưới, câu hiếm | Must | 2 hq | 0,27 | Planned | — |
| ART-CHR-051 | **Ông Gật** ôm gà Mái Mơ — gật 2 khung | CHR | 64×96 ×2 | 2 khung lặp | Vườn ông, gốc đa, hiên | Must | 4 hq | 0,54 | Planned | — |
| ART-POR-032 | Chân dung ông Gật — gật (gốc) | POR | 512 | tĩnh | Thoại, nhiệm vụ 2, 7 | Must | 3 hq | 0,40 | Planned | — |
| ART-POR-033 | Chân dung ông Gật — cười móm | POR | 512 | tĩnh | Thoại | Must | 2 hq | 0,27 | Planned | — |
| ART-ANI-001 | **Gà Mái Mơ** (mào lệch sứt) — đi / mổ / chạy, nhìn ngang (trái = lật) | ANI | 64×64 ×4–6 | 4–6 khung | Sự kiện gà mổ rau, băng qua ngõ | Should | 4 hq | 0,54 | Planned — **trong ngân sách** | — |
| ART-CHR-052 | **Cô Tám Thóc** — ngồi xổm cạnh chõng hạt, quạt mo cau, 2 khung (miệng há / khép) | CHR | 64×96 ×2 | 2 khung | Quầy hạt, quán chè | Must | 4 hq | 0,54 | Planned | — |
| ART-POR-034 | Chân dung cô Tám Thóc — há miệng kể chuyện (gốc) | POR | 512 | tĩnh | Cửa hàng hạt, "Làng đồn" | Must | 3 hq | 0,40 | Planned | — |
| ART-POR-035 | Chân dung cô Tám Thóc — che miệng thì thầm | POR | 512 | tĩnh | Thoại | Must | 2 hq | 0,27 | Planned | — |
| ART-CHR-053 | **Ông Hai Bễ** — đứng cạnh đe vác búa, 2 khung (búa trên vai / giơ) | CHR | 64×96 ×2 (khung 128 nếu búa vượt) | 2 khung | Lò rèn | Must | 4 hq | 0,54 | Planned | — |
| ART-POR-036 | Chân dung ông Hai Bễ — hét (gốc) | POR | 512 | tĩnh | Lò rèn, nhiệm vụ 3 | Must | 3 hq | 0,40 | Planned | — |
| ART-POR-037 | Chân dung ông Hai Bễ — nghiêng tai "HẢ?" | POR | 512 | tĩnh | Thoại | Must | 2 hq | 0,27 | Planned | — |
| ART-CHR-054 | **Chú Đục** — đứng cầm thước chữ L, đục giắt tai, 2 khung (xoa cằm / thở dài) | CHR | 64×96 ×2 | 2 khung | Xưởng mộc, giếng | Must | 4 hq | 0,54 | Planned | — |
| ART-POR-038 | Chân dung chú Đục — xoa cằm than (gốc) | POR | 512 | tĩnh | Xưởng mộc, nhiệm vụ 4 | Must | 3 hq | 0,40 | Planned | — |
| ART-POR-039 | Chân dung chú Đục — thở dài cam chịu | POR | 512 | tĩnh | Thoại | Must | 2 hq | 0,27 | Planned | — |
| ART-CHR-060 | **Bà Chém** — ngồi xổm trên chõng, ôm giỏ ấm tích, 2 khung (tay hạ / giơ chỉ trời) | CHR | 64×96 ×2 | 2 khung | Quán chè | Must | 4 hq | 0,54 | Planned | — |
| ART-CHR-061 | **Ông Khướt** — nằm gối bầu rượu 2 khung (bụng phập phồng) + 1 khung ngồi dậy | CHR | 128×64 ×2 (nằm) + 64×96 | 3 khung | Gốc đa, quán chè | Must | 5 hq | 0,67 | Planned | — |
| ART-CHR-062 | **Cô Ngóng** — nửa người sau rào, 2 khung (nhìn thẳng / ghé tai) | CHR | 64×96 ×2 | 2 khung | Sau rào nhà cô | Must | 4 hq | 0,54 | Planned | — |
| ART-CHR-062b | Cô Ngóng — đứng cả người ôm rổ rau (lúc ở giếng) | CHR | 64×96 | tĩnh | Giếng làng | Should | 3 hq | 0,40 | Planned — ngoài ngân sách (chỉ làm nếu còn dư) | — |
| ART-CHR-063 | **Anh Tráng** — tập võ 3 khung (đứng tấn → giơ đòn gánh → đánh xuống) | CHR | 64×96 ×3 (khung 128 nếu đòn gánh vượt) | 3 khung lặp | Sân đình | Must | 5 hq | 0,67 | Planned | — |
| ART-CHR-064 | **Trẻ trâu Sún–Hĩm–Cò** — cùng một dáng, 3 đầu/màu áo × 2 khung nhún nhảy | CHR | 48×64 ×6 | 2 khung × 3 | Giếng, bến nước, sân đình | Must | 6 hq | 0,80 | Planned | — |
| ART-CHR-070 | Khung **đi ngang** 4 khung cho 5 NPC chính Xóm (U, ông Gật, cô Tám, ông Hai Bễ, chú Đục); trái = lật | CHR | 64×96 ×4 × 5 dải | 4 khung | NPC đi bộ theo đường (Should §3.16) | Should | 15 hq | 2,01 | Planned — ngoài ngân sách (chỉ làm nếu còn dư) | — |
| ART-CHR-071 | Trẻ trâu **chạy** 4 khung (1 dáng, đổi đầu/màu bằng `--ref` hoặc script) | CHR | 48×64 ×4 | 4 khung | Trẻ trâu chạy vòng | Should | 4 hq | 0,54 | Planned — ngoài ngân sách (chỉ làm nếu còn dư) | — |
| ART-CHR-072 | Ông Mõ — đi 2 khung (mõ tre trước ngực) | CHR | 64×96 ×2 | 2 khung | Rao đầu mùa | Could | 4 hq | 0,54 | Planned — ngoài ngân sách (chỉ làm nếu còn dư) | — |
| ART-CHR-020 | {ten} **bậc 2** — đi 4 hướng (xuống/lên 4 khung, ngang 6 khung; đứng = khung 1 của dải đi, không gen riêng) | CHR | 64×96, dải như bậc 1 | 4/6 khung | Bản đồ (Lv 3+) | Must | 6 hq | 0,80 | Planned | — |
| ART-CHR-021 | {ten} bậc 2 — khung xoay chéo | CHR | dải 256×96 | 4 khung | Đổi hướng | Should | 2 hq | 0,27 | Planned — **trong ngân sách** | — |
| ART-CHR-022 | {ten} bậc 2 — **cuốc + tưới + cúi** (9 dải, "thay đồ giữ dáng" `--ref` dải bậc 1) | CHR | 128×128, như bậc 1 | 4/3/3 khung | Vườn | Must | 18 hq | 2,41 | Planned | — |
| ART-FX-005 | Hiệu ứng **"lột xác"**: cuộn khói kiểu mây Đông Hồ 3 khung + mảnh vải vụn + lấp lánh | FX | dải 3 × 192×192 + mảnh rời | 3 khung | Lên bậc ngoại hình (§3.14, §8) | Must | 4 hq | 0,54 | Planned | — |
| ART-UI-008 | Khung thoại dưới màn 9-slice + khung chân dung | UI | nguồn 1024×256 + 384×384 | tĩnh | Thoại NPC chính | Must | 3 hq | 0,40 | Planned | — |
| ART-UI-010 | Tab cửa hàng + dòng món (khung món, ô giá) | UI | sheet nhỏ | tĩnh | Quầy hạt, lò rèn, xưởng mộc | Must | 3 nhanh | 0,20 | Planned | — |
| ART-ITM-004 | Sheet icon **Nông cụ** (9): cuốc sắt, rìu cũ, rìu sắt, cần tre, cần trúc, thùng tưới, nỏ, gùi to, búa (sửa đồ) | ITM | 9 × 128×128 | tĩnh | Hotbar, lò rèn, xưởng mộc | Must | 3 hq | 0,40 | Planned | — |
| ART-ITM-005 | Sheet icon **Sắm sửa & nâng cấp** (9): Bộ đồ lành, Bộ áo chàm, Bộ áo the, bếp gạch, chuồng tre, mở ruộng (cọc), men rượu, chìa khóa/biển "Lv", hũ rượu nếp | ITM | 9 × 128×128 | tĩnh | Cửa hàng, thẻ "Mở khóa" | Must | 3 hq | 0,40 | Planned | — |

### Lô 3 — Núi, làng Sung, mặc cả, mini-game, gia đình, cưới, meme, bậc 3–4

71 mục · 228 ảnh hq + 81 ảnh nhanh ≈ **35,98 USD** (chưa cộng dự phòng)

| ID | Tên | Loại | Kích thước / khung | Frames | Dùng ở | Ưu tiên | Ảnh gen (ước) | USD (ước) | Trạng thái | Prompt card |
|---|---|---|---|---|---|---|---|---|---|---|
| ART-CHR-010 | {ten} bậc 1 — **chặt** (rìu) 4 hướng | CHR | 128×128, dải 384–512×128 | 3–4 khung; khung chạm | Núi — củi, tre | Must | 10 hq | 1,34 | Planned | — |
| ART-CHR-011 | {ten} bậc 1 — **câu cá**: quăng 4 khung + giữ/kéo 2 khung; hướng xuống + phải (trái = lật; không câu hướng lên) | CHR | 128×128, dải 768×128 | 6 khung | Bến câu hồ làng | Must | 7 hq | 0,94 | Planned | — |
| ART-CHR-023 | {ten} bậc 2 — chặt + câu (5 dải) | CHR | 128×128 | như bậc 1 | Núi, hồ | Must | 10 hq | 1,34 | Planned | — |
| ART-CHR-030 | {ten} **bậc 3** — đi 4 hướng (đứng = khung 1) | CHR | 64×96 | 4/6 khung | Bản đồ (Lv 7+), sau cưới | Must | 6 hq | 0,80 | Planned | — |
| ART-CHR-031 | {ten} bậc 3 — khung xoay | CHR | dải 256×96 | 4 khung | Đổi hướng | Should | 2 hq | 0,27 | Planned — **trong ngân sách** | — |
| ART-CHR-032 | {ten} bậc 3 — cuốc + tưới + cúi (9 dải) | CHR | 128×128 | 4/3/3 khung | Vườn | Must | 18 hq | 2,41 | Planned | — |
| ART-CHR-033 | {ten} bậc 3 — chặt + câu (5 dải) | CHR | 128×128 | như bậc 1 | Núi, hồ | Must | 10 hq | 1,34 | Planned | — |
| ART-CHR-040 | {ten} **bậc 4 Phú ông** — đi 4 hướng (đứng = khung 1) | CHR | 64×96 | 4/6 khung | Sau cưới, Lv 12 | Must | 6 hq | 0,80 | Planned | — |
| ART-CHR-041 | {ten} bậc 4 — khung xoay | CHR | dải 256×96 | 4 khung | Đổi hướng | Should | 2 hq | 0,27 | Planned — **trong ngân sách** | — |
| ART-CHR-042 | {ten} bậc 4 — cuốc + tưới + cúi: **không gen** — mượn khung bậc 3 + khăn xếp vẽ đè bằng code (người dùng chọn kịch bản B, 2026-10-14) | CHR | 128×128 | — | Vườn (endless) | Cắt (B) | 0 | 0,00 | Cắt — mượn ART-CHR-032 | — |
| ART-CHR-043 | {ten} bậc 4 — chặt + câu: **không gen** — mượn khung bậc 3 (kịch bản B) | CHR | 128×128 | — | Núi, hồ (endless) | Cắt (B) | 0 | 0,00 | Cắt — mượn ART-CHR-033 | — |
| ART-POR-010…013 | Chân dung {ten} **bậc 2** — smirk, boast, curse, exhausted (4 ảnh, `--ref` chân dung bậc 1) | POR | 512 | tĩnh | Thoại | Should | 8 hq | 1,07 | Planned — **trong ngân sách** | — |
| ART-POR-014…019 | Chân dung {ten} **bậc 3** — 4 cái trên + fawning, rejected (6 ảnh) | POR | 512 | tĩnh | Thoại, mặc cả | Should | 12 hq | 1,61 | Planned — **trong ngân sách** | — |
| ART-POR-020…023 | Chân dung {ten} **bậc 4** — smirk, boast, curse, exhausted (4 ảnh) | POR | 512 | tĩnh | Thoại | Should | 8 hq | 1,07 | Planned — ngoài ngân sách (chỉ làm nếu còn dư) | — |
| ART-CHR-055 | **Bà Ba Trầu** — đứng che ô giấy vàng, cơi trầu, 2 khung | CHR | 64×96 ×2 (khung 96×128 nếu ô vượt) | 2 khung | Quán chè, nhà bà, cưới | Must | 4 hq | 0,54 | Planned | — |
| ART-POR-040 | Chân dung bà Ba Trầu — cười híp che miệng (gốc) | POR | 512 | tĩnh | Nhiệm vụ 5, 9 | Must | 3 hq | 0,40 | Planned | — |
| ART-POR-041 | Chân dung bà Ba Trầu — nháy mắt mách nước | POR | 512 | tĩnh | Dạy đọc mặt | Must | 2 hq | 0,27 | Planned | — |
| ART-POR-042 | Chân dung bà Ba Trầu — bĩu môi | POR | 512 | tĩnh | Chưa đủ điều kiện | Must | 2 hq | 0,27 | Planned | — |
| ART-CHR-056 | **Bà Cân** — đứng sau sạp cầm cân đòn | CHR | 64×96 | tĩnh (+ code) | Sạp bà Cân | Must | 4 hq | 0,54 | Planned | — |
| ART-POR-043 | Chân dung bà Cân — nheo mắt soi hàng (gốc) | POR | 512 | tĩnh | Chợ làng Sung, nhiệm vụ 6 | Must | 3 hq | 0,40 | Planned | — |
| ART-POR-044 | Chân dung bà Cân — gật gù | POR | 512 | tĩnh | Thoại | Must | 2 hq | 0,27 | Planned | — |
| ART-POR-045 | Chân dung to **cụ Bá Kẹo — Nhăn** (gốc; lông mày chữ V, mặt đỏ, râu vểnh) | POR | 768 (nguồn 1024) | tĩnh | Màn mặc cả (r < 0.75) | Must | 4 hq | 0,54 | Planned | — |
| ART-POR-046 | Cụ Bá Kẹo — **Im lặng** (mắt khép hờ, quạt che nửa mặt) | POR | 768 | tĩnh | Mặc cả (0.75–0.9) | Must | 2 hq | 0,27 | Planned | — |
| ART-POR-047 | Cụ Bá Kẹo — **Nhấp trà** (chén lên môi, mắt nheo) | POR | 768 | tĩnh | Mặc cả (0.9–1.0) | Must | 2 hq | 0,27 | Planned | — |
| ART-POR-048 | Cụ Bá Kẹo — **Cười** khà khà vỗ đùi | POR | 768 | tĩnh | Mặc cả (≥ 1.0), chốt | Must | 2 hq | 0,27 | Planned | — |
| ART-CHR-057 | Cụ Bá Kẹo — ngồi xếp bằng trên sập (sprite) | CHR | 96×96 | tĩnh | Chỉ cần nếu một khung cưới phải lùi về ghép | Could | 4 hq | 0,54 | Planned — ngoài ngân sách (chỉ làm nếu còn dư) | — |
| ART-POR-049 | Chân dung **cô Bưởi** — cười khẩy khoanh tay (gốc) | POR | 512 | tĩnh | Chợ làng Sung, nhiệm vụ 8, sau cưới | Must | 3 hq | 0,40 | Planned | — |
| ART-POR-050 | Cô Bưởi — nhướng mày (dùng cho zoom gặp lần đầu) | POR | 512 | tĩnh | Meme `dramaticZoom`, thoại | Must | 2 hq | 0,27 | Planned | — |
| ART-POR-051 | Cô Bưởi — cười thật | POR | 512 | tĩnh | Chốt sính lễ, cưới | Must | 2 hq | 0,27 | Planned | — |
| ART-CHR-058 | **Cô Bưởi** — sprite đứng khoanh tay, hướng xuống + ngang (lật) | CHR | 64×96 ×2 | tĩnh | Chợ làng Sung, sân nhà sau cưới | Must | 5 hq | 0,67 | Planned | — |
| ART-CHR-059 | Cô Bưởi — đi 4 hướng | CHR | 64×96, 3 dải | 4/6 khung | Đi lại ở Vườn sau cưới | Should | 9 hq | 1,21 | Planned — ngoài ngân sách (chỉ làm nếu còn dư) | — |
| ART-CHR-065 | **Con nhỏ** — chập chững / ôm chân, 2 khung | CHR | 48×64 ×2 | 2 khung | Sau cưới (§3.11) | Must | 4 hq | 0,54 | Planned | — |
| ART-CHR-066 | **Con lớn** — đội nón rách cũ của bố (quá khổ, lệch), 2 khung | CHR | 48×64 ×2 | 2 khung | Sau cưới | Must | 4 hq | 0,54 | Planned | — |
| ART-ANI-002 | **Gà nhà** — đi / mổ 4 khung, ngang; gà Đỏ / gà Đen = tô màu lại bằng script | ANI | 64×64 ×4 | 4 khung | Chuồng, sân (sau cưới) | Must | 4 hq | 0,54 | Planned | — |
| ART-ANI-003 | **Lợn Phệ** (lớn) + lợn con — đứng/đi 2–3 khung (1 ảnh) | ANI | 96×64 / 64×48 | 2–3 khung | Chuồng, sự kiện lợn sổng | Must | 4 hq | 0,54 | Planned | — |
| ART-ANI-004 | **Trâu Ì** — đứng + nằm ngủ | ANI | 128×96 ×2 | 2 khung | Sau cưới (Should §3.11) | Should | 4 hq | 0,54 | Planned — **trong ngân sách** | — |
| ART-ANI-005 | **Gà rừng** — chạy 4 khung + mổ đất 2 khung, ngang (to cho khung mini-game) | ANI | 192×192 ×6 | 6 khung | Mini-game bắn nỏ | Must | 6 hq | 0,80 | Planned | — |
| ART-PRP-017 | Chuồng tre + ổ trứng + máng ăn | PRP | ~3×2 ô | tĩnh | Vườn sau cưới | Must | 4 nhanh | 0,27 | Planned | — |
| ART-TIL-010 | Núi — đường mòn **đất đỏ** + mép (viền script) | TIL | 256 = 4×4 ô 64 + viền | — | Núi sau nhà | Must | 4 nhanh | 0,27 | Planned | — |
| ART-TIL-011 | Núi — nền đồi cỏ (thử tô màu lại TIL-001 trước, 0 USD) | TIL | 256 | — | Núi | Must | 4 nhanh | 0,27 | Planned | — |
| ART-ENV-010 | Cây khô để chặt: nguyên / gốc sau chặt | ENV | ~2×2 ô ×2 | tĩnh ×2 (rung bằng code) | Núi — củi | Must | 4 nhanh | 0,27 | Planned | — |
| ART-ENV-011 | Bụi tre chặt được: nguyên / gốc | ENV | ~2×2 ô ×2 | tĩnh ×2 | Núi — tre | Must | 4 nhanh | 0,27 | Planned | — |
| ART-ENV-012 | Bụi rậm gà rừng (tối màu; có gà = rung lá + icon lông bằng code) | ENV | ~2×2 ô | tĩnh | Núi — bắn nỏ | Must | 3 nhanh | 0,20 | Planned | — |
| ART-ENV-013 | Sheet điểm hái lượm: bụi sim có quả / hết quả, nấm hương dưới gốc mục, măng tre nhú | ENV | 1 ô mỗi món | tĩnh | Núi — hái | Must | 4 nhanh | 0,27 | Planned | — |
| ART-ENV-014 | Cây rừng thấp + tre nền (vật cản) — 3 biến thể, tách tán / gốc | ENV | 2–3 ô | tĩnh | Núi | Must | 4 nhanh | 0,27 | Planned | — |
| ART-ENV-015 | Tảng đá phẳng nhìn xuống làng + đá nhỏ | ENV | 2–3 ô | tĩnh | Núi (trang trí) | Should | 3 nhanh | 0,20 | Planned — **trong ngân sách** | — |
| ART-BLD-020 | Cổng làng Sung xây gạch, hoa văn (không chữ đọc được) | BLD | ~4×3 ô | tĩnh | Làng Sung | Must | 4 nhanh | 0,27 | Planned | — |
| ART-BLD-021 | **Nhà cụ Bá Kẹo**: nhà ngói 3 gian, sân gạch, bể nước, hòn non bộ, cổng gạch 2 cánh | BLD | ~8×6 ô | tĩnh | Làng Sung — vào màn mặc cả | Must | 6 hq | 0,80 | Planned | — |
| ART-BLD-022 | Lều chợ dài mái tranh (ghép lặp) | BLD | ~6×3 ô | tĩnh | Chợ làng Sung | Must | 4 nhanh | 0,27 | Planned | — |
| ART-BLD-023 | Nhà làng Sung "ngói mới, gạch đỏ" — làm từ BLD-003 bằng `--ref` + tô màu | BLD | ~7×5 ô | tĩnh | Làng Sung (trang trí) | Must | 3 nhanh | 0,20 | Planned | — |
| ART-PRP-020 | Sạp bà Cân (cân đòn treo, túi tiền) | PRP | ~3×2 ô | tĩnh | Chợ làng Sung | Must | 4 nhanh | 0,27 | Planned | — |
| ART-PRP-021 | Sheet sạp chợ làng Sung (rau, cá, gà, lợn trong rọ, trầu cau, vải) — 4 biến thể | PRP | ~2×2 ô mỗi sạp | tĩnh | Chợ làng Sung | Must | 4 nhanh | 0,27 | Planned | — |
| ART-TIL-012 | Ngõ lát gạch nghiêng (làng Sung) | TIL | 256 = 4×4 ô 64 | — | Làng Sung | Must | 4 nhanh | 0,27 | Planned | — |
| ART-BG-009 | Nền **màn mặc cả**: trong nhà cụ Bá Kẹo (sập gụ, ấm trà, rèm tre, bóng cô Bưởi sau rèm) | BG | 1920×1080 | tĩnh | Mặc cả (§3.10, §11) | Must | 4 hq | 0,54 | Planned | — |
| ART-UI-011 | UI mặc cả: chén trà đầy / cạn (5 lượt kiên nhẫn), khay lễ vật | UI | sheet | tĩnh | Mặc cả | Must | 3 nhanh | 0,20 | Planned | — |
| ART-UI-012 | UI câu cá: thanh tre ngang, vùng xanh, kim, phao (trên nước + trên thanh), dấu "!" | UI | sheet | tĩnh | Mini-game câu cá | Must | 3 nhanh | 0,20 | Planned | — |
| ART-BG-010 | Nền khung **bắn nỏ**: bụi rậm phóng to | BG | ~1280×640 | tĩnh | Mini-game bắn nỏ | Must | 4 nhanh | 0,27 | Planned | — |
| ART-UI-013 | UI bắn nỏ: nỏ nhìn từ sau, mũi tên, vạch tâm đỏ son | UI | sheet | tĩnh | Mini-game bắn nỏ | Must | 3 nhanh | 0,20 | Planned | — |
| ART-UI-009 | Thẻ "Mở khóa", **con dấu đỏ** (chữ "XONG" vẽ bằng font), pháo giấy | UI | sheet | tĩnh | Lên level, xong nhiệm vụ | Must | 3 nhanh | 0,20 | Planned | — |
| ART-ITM-006 | Sheet icon **Núi & hồ** (9): nấm hương, măng, quả sim, củi, tre, cá rô, cá trê, cá chép, cá lóc | ITM | 9 × 128×128 | tĩnh | Gùi, bán, nấu | Must | 3 hq | 0,40 | Planned | — |
| ART-ITM-007 | Sheet icon **Bếp & lễ vật** (9): dép tổ ong, nấm xào, măng luộc, cá nướng, gà rừng nướng, trứng luộc, trầu cau, lợn lễ, gà rừng; icon gà/lợn con/trâu ở chợ = thu nhỏ sprite (0 USD) | ITM | 9 × 128×128 | tĩnh | Gùi, chợ, mặc cả | Must | 3 hq | 0,40 | Planned | — |
| ART-BG-006…008 | **Cảnh cưới 3 khung** vẽ trọn tranh (người dùng chốt; khung hỏng quá 3 vòng thì lùi về nền + chân dung ghép) — rước dâu / bếp gạch + cỗ / đêm sân nhà | BG | 3 × 1920×1080 | tĩnh | Sau chốt sính lễ (story bible §5.3) | Must | 12 hq | 1,61 | Planned | — |
| ART-MEM-001 | **Mèo Mướp** — chân dung 2 khung (nhìn thẳng / nheo mắt nhếch mép) | MEM | 2 × 420 | 2 khung | Meme `smugCatSubtitle` (Must) | Must | 5 hq | 0,67 | Planned | — |
| ART-MEM-003 | Tờ **giấy dó + mũi tên đỏ son** gãy khúc đi lên (xuống = lật bằng code); {ten} dùng sprite có sẵn | MEM | ~640×420 | tĩnh | Meme `profitArrow` (Must) | Must | 4 nhanh | 0,27 | Planned | — |
| ART-MEM-004 | Cụ Bá Kẹo — **nhướng một bên mày** (từ POR-045 `--ref`) | MEM | 768 | tĩnh | Meme `browBoom` (Must) | Must | 2 hq | 0,27 | Planned | — |
| ART-FX-007 | Sheet FX (9): **vòi + giọt nước mắt** (meme `cryRiver`, Must), vòng nước "tõm", lông gà bay, mảnh gỗ văng, xác pháo đỏ, xu rơi, hơi trà, sao choáng, khói bếp | FX | 9 × 64–192 | tĩnh (chuyển động bằng code) | Meme, câu cá, nỏ, chặt, cưới | Must | 3 hq | 0,40 | Planned | — |
| ART-MEM-010 | {ten} bậc 1 — **xua tay** / **chỉ tay** (thẻ 2 khung) | MEM | 2 × 320 | 2 khung | Meme `pickNotPick` | Should | 4 hq | 0,54 | Planned — **trong ngân sách** | — |
| ART-MEM-011 | Cụ Bá Kẹo — **cười giấu đau** (mồ hôi, chén trà run) | MEM | 768 | tĩnh | Meme `painSmile` | Should | 2 hq | 0,27 | Planned — **trong ngân sách** | — |
| ART-MEM-012 | Thẻ **"Ổn mà"**: {ten} ngồi chõng nhấp trà giữa ruộng héo, ruồi bay | MEM | 420×420 | tĩnh | Meme `fineTeaSip` | Should | 4 hq | 0,54 | Planned — **trong ngân sách** | — |
| ART-MEM-013 | Icon hai bàn tay vỗ (2 khung) | MEM | 2 × 128 | 2 khung | Meme `slowClap` | Should | 2 nhanh | 0,13 | Planned — **trong ngân sách** | — |
| ART-MEM-020 | Bụi chạy "gét gô" + mảnh giấy vỡ | MEM | sheet | tĩnh | Meme Could | Could | 2 nhanh | 0,13 | Planned — ngoài ngân sách (chỉ làm nếu còn dư) | — |

### Lô 4 — Menu, intro, logo, ảnh giới thiệu

8 mục · 28 ảnh hq + 5 ảnh nhanh ≈ **4,09 USD** (chưa cộng dự phòng)

| ID | Tên | Loại | Kích thước / khung | Frames | Dùng ở | Ưu tiên | Ảnh gen (ước) | USD (ước) | Trạng thái | Prompt card |
|---|---|---|---|---|---|---|---|---|---|---|
| ART-BG-001 | **Nền menu chính** + màn tài khoản: toàn cảnh làng Lầy, chừa chỗ logo + nút (thử dùng ART-CON-001 trước, 0 USD) | BG | 1920×1080 | tĩnh (mây trôi bằng code) | Menu, đăng nhập | Must | 4 hq | 0,54 | Planned | — |
| ART-LOGO-001 | **Logo** Bride Price Hustle: khung hoa văn + nón lá rách quai đỏ; **chữ đặt bằng font** (AI vẽ chữ Việt có dấu hay sai) | UI | 1024×512 | tĩnh | Menu, intro, store | Must | 4 hq | 0,54 | Planned | — |
| ART-BG-002…005 | **Intro 4 khung** vẽ trọn tranh (người dùng chốt; lùi như cảnh cưới) — hội đình / đứng lên ghế khoe / tin lan sang làng Sung / U đưa cuốc | BG | 4 × 1920×1080 | tĩnh | Chơi mới (story bible §5.1) | Must | 16 hq | 2,14 | Planned | — |
| ART-UI-016 | Kit menu & cài đặt: nút to, thanh trượt âm lượng, công tắc bật/tắt, ô nhập tên | UI | sheet | tĩnh | Menu, Cài đặt, Đặt tên | Must | 3 nhanh | 0,20 | Planned | — |
| ART-UI-017 | Con trỏ chuột riêng (tay / nông cụ) | UI | 32–48 px | tĩnh | Toàn game | Could | 2 nhanh | 0,13 | Planned — ngoài ngân sách (chỉ làm nếu còn dư) | — |
| ART-MKT-001 | Favicon + icon trang (cắt từ đầu {ten} bằng script) | MKT | 16/32/180/512 | tĩnh | Tab trình duyệt, chia sẻ | Must | 0 | 0,00 | Planned | — |
| ART-MKT-002 | Key art bìa: itch.io 630×500 + ảnh chia sẻ 1200×630 (cắt từ 1 ảnh 16:9) | MKT | 1920×1080 nguồn | tĩnh | Trang giới thiệu, mạng xã hội | Should | 4 hq | 0,54 | Planned — **trong ngân sách** | — |
| ART-MKT-003 | Ảnh chụp màn hình giới thiệu (chụp trong game bằng Playwright) | MKT | 1920×1080 | tĩnh | Store, trang giới thiệu | Should | 0 | 0,00 | Planned — **trong ngân sách** | — |

**Vị trí file trong game** (bước 3.1, `game-dev` copy từ `art-source/raw/`; gốc `web/client/public/assets/art/`; quy cách các file mới: §3):

| ID | File game |
|---|---|
| ART-CHR-002 | `characters/hero-t1-down.png`, `hero-t1-up.png`, `hero-t1-left.png`, `hero-t1-right.png` (từ `raw/hero-directions/hero-<hướng>.png`) |
| ART-CHR-003 | `characters/hero-tier1-down.png` … `hero-tier4-down.png` (từ `raw/hero-tiers/`) |
| ART-POR-001…009 | `portraits/portrait-hero-a-smirk.png` … `portrait-hero-i-money-eyes.png` (từ `raw/hero-expressions/final/`) |
| ART-CHR-004 | `characters/hero-t1-walk-down.png`, `-up.png`, `-right.png`, `-left.png` — mỗi file 256×96 = 4 khung 64×96 một hàng, pivot giữa đáy (từ `raw/hero-walk/final/`; bản 2x ở `raw/hero-walk/final-2x/`) |
| ART-CHR-005 | `characters/hero-t1-walk-right.png`, `-left.png` — dải 384×96 = 6 khung 64×96 (đã ghi đè bản 4 khung, nguồn `art-source/raw/hero-walk2/final/hero-t1-walk-<right\|left>.v2.png`) |
| ART-CHR-006 | `characters/hero-t1-turn.png` — dải 256×96 = 4 khung 64×96: 0 xuống-phải, 1 xuống-trái, 2 lên-phải, 3 lên-trái (nguồn `art-source/raw/hero-walk2/final/hero-t1-turn.v2.png`) |
| ART-TIL-001 / 002 | `tiles/tile-grass-test.png`, `tiles/tile-dirt-test.png` (256×256 = 4×4 ô, từ `raw/tile-test/tiletest-*-256_256.png`) |
| ART-CHR-007 | `characters/hero-t1-hoe-down.png`, `-up.png`, `-left.png`, `-right.png` — mỗi file **512×128 = 4 khung 128×128** một hàng (nguồn `art-source/raw/hero-hoe/final/`). **Điểm chân:** tâm hai bàn chân x = 64, hàng pixel thấp nhất của bàn chân y = 110 (đáy ô cách 17 px) ở mọi khung, mọi hướng → `setOrigin(0.5, 111/128)` ⇔ dải đi `setOrigin(0.5, 95/96)`; nhân vật cùng tỉ lệ dải đi (đỉnh nón → chân ≈ 91–92 px ở khung 1). Khung 0 chuẩn bị (cuốc trên vai / ngang ngực), 1 giơ cao, **2 = chạm đất** (lưỡi cắm ô trước mặt), 3 hồi. Trái = lật gương từng ô của phải (giữ thứ tự khung). Lưỡi cuốc ở khung chạm: phải ≈ x 100–107 (vươn ~0,6 ô trước chân), xuống ≈ dưới-phải chân tới y 111, lên = lưỡi ló trên đỉnh nón |
| ART-ITM-001 | `items/item-hoe.png` — 128×128 nền trong suốt, căn giữa, đệm 6 px |
| ART-CHR-008/009 *(dự kiến, 4.2)* | `hero-t1-water-<hướng>.png`, `hero-t1-bend-<hướng>.png` (384×128); cùng khung 128×128 + điểm chân như ART-CHR-007 |
| ART-TIL-006/014 *(dự kiến, 4.2)* | `tiles/path-dirt.png` (lõi 4×4), `tiles/yard-dirt.png` (sân, lõi 4×4), `tiles/path-edge.png` (16 ô, chỉ số = bitmask cạnh giáp cỏ N=1 E=2 S=4 W=8), `tiles/path-corner.png` (4 ô góc lõm: 0 NE, 1 SE, 2 SW, 3 NW — đặt khi hai cạnh kề là đất nện nhưng ô chéo là cỏ) |
| ART-ENV-003/016/017 *(dự kiến, 4.2)* | `props/bush-*.png`, `props/grass-*.png`, `props/flower-*.png` (tách từ sheet, gốc ở đáy ảnh, kèm chân đế va chạm trong `props/props.json`; bụi cỏ, mười giờ, cúc: không va chạm) |
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
- 2026-10-13 — **Bước 4.1 — kế hoạch sản xuất chặng 4** (`art-director`, chưa gen ảnh, 0 USD). Viết lại danh sách theo **4 lô** + Lô 0 (đã có), thêm cột ảnh gen / USD ước tính; giữ nguyên trạng thái mọi dòng cũ. Thêm ~130 mục Planned từ GDD + story bible: cây trồng 5 loại theo giai đoạn, đất cuốc dở 2 nấc, trong nhà + nội thất + bếp rơm/bếp gạch, thúng bán + cọc rào, động tác chặt + câu, {ten} bậc 2–4 (đi + động tác), chân dung theo bậc (Should), sprite + chân dung 9 NPC chính, 5 nhóm dân làng phụ, gia đình + gia súc + gà rừng, Núi, làng Sung, màn mặc cả, UI (giấy 9-slice, nút, ô, HUD, bong bóng, khung thoại, mặc cả, câu cá, nỏ), 7 sheet icon (~60 món), FX, meme, cảnh cưới, menu/logo/intro, favicon/ảnh giới thiệu. Chuyển BLD-001, PRP-001, ENV-002, ENV-004, TIL-006 từ lô Xóm sang **Lô 1** (cần ngay cho Vườn). Thêm bảng tổng (§1), danh sách cắt + mẹo tiết kiệm (§2), quy cách kỹ thuật cho `game-dev` (§3), 3 câu hỏi cho người dùng (§4). Đã kiểm: Art Bible dòng màu xanh nước đã ghi "(hồ, giếng)".
- 2026-10-14 — (`art-director`) Người dùng muốn lối đi trong làng là **đất nện** + có bụi cỏ, bụi tre, lùm cây, lùm hoa. Art Bible thêm §7.1. Viết lại ART-TIL-006 (đất nện, mép mềm 16 + 4 ô script), thêm ART-TIL-014 sân đất nện (0 USD), ART-ENV-016 bụi cỏ, ART-ENV-017 lùm hoa; chuyển ART-ENV-003 lùm cây (4 biến thể) lên Lô 1; ART-ENV-005 ghi rõ 3 khóm tre lẻ; gộp ART-ENV-008 vào ENV-016, bỏ ART-TIL-009 → **tổng kế hoạch giữ 73,83 USD (84,90 có dự phòng)**; Lô 1 +0,27, Lô 2 −0,27. Gen ảnh mẫu 3 ảnh nhanh (0,20 USD) → `art-source/reference/sample-dat-nen-bui-cay.png`.
- 2026-10-14 — Người dùng chốt 3 câu hỏi theo đề xuất: kịch bản B (ART-CHR-042/043 → "Cắt (B)", mượn khung bậc 3), cảnh trong nhà riêng, intro + cưới vẽ trọn tranh. Trần hình ~85 USD gồm dự phòng. Kế hoạch = Must 65,12 + 21 Should trong ngân sách 8,71 = 73,83 USD → **84,90 có dự phòng**. Đánh dấu từng dòng Should/Could "trong ngân sách" / "ngoài ngân sách". Chưa gen ảnh.
- 2026-10-14 — (`art-director`, T-019) Gen Lô 1 phần 1: cỏ nền mới, lối + sân đất nện, đất chưa cuốc / vỡ cỏ / lổn nhổn / đã cuốc (gen lại 8 luống) / đã tưới (script), mép cỏ 16+4 ô + viền luống 16 ô (`tools/tile_edges.py`), cây chung + 5 cây × 3 khung, 18 icon (2 sheet hq). 30 ảnh nhanh + 4 hq = 2,55 USD. ENV-016/017/003 chuyển làm cùng T-020. Thêm mục "Ghép tile Lô 1" ở §3. Tất cả chờ người dùng duyệt (`art-source/raw/lot1/lot1-part1-preview.png`).
- 2026-10-14 — Người dùng **duyệt toàn bộ Lô 1 phần 1** (T-019): cỏ nền mới, bỏ vệt bánh xe, túi hạt tô màu dây buộc theo loại (script `art-source/raw/lot1/tools/seed_strings.py`, 0 USD; xám L dây: khoai 65 · dưa 84 · cải 111 · muống 158 · nếp 189). Các mục T-019 → Approved.
