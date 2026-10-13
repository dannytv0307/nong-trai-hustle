# Playtest

> Mỗi buổi thử thêm một mục. Khi quan sát: không giải thích trước, không giúp, chỉ nhìn và ghi.

<!-- Mẫu:
## PT-NNN — YYYY-MM-DD — <bản build / bước>
**Người chơi:** (ẩn danh) tuổi, hay chơi game không · **Thiết bị:** …
**Câu hỏi cần trả lời:** …

**Quan sát:** người chơi làm gì, chỗ nào lúng túng, lúc nào cười/bực.

**Hỏi sau khi chơi:**
1. Mô tả game trong 1 câu? 2. Lúc nào vui nhất / bực nhất? 3. Có chỗ nào không hiểu? 4. Muốn chơi thêm ván nữa không?

**Phát hiện → hành động:** | Phát hiện | Mức độ | Hành động (task/bug/bỏ qua) |
-->

## PT-000 — 2026-10-13 — Prototype "một ngày ở Vườn", commit `e246fcd` (T-009, có cái cuốc theo D-026)

**Người chơi:** tác giả game (tự chơi — "buổi 0"), biết rõ game nên không tính là người lạ · **Thiết bị:** PC Windows, trình duyệt, WASD + chuột
**Câu hỏi cần trả lời:** làm nông có vui không? Có cần chỉnh thông số trong `gameConfig.ts` không?

**Bản đang thử:** đi lại + va chạm, cuốc nhiều nhát ≈ 5 s/ô (D-022), gieo/tưới/hái, hotbar + gùi, cái cuốc là món ở ô 1 của hotbar + hoạt ảnh vung cuốc 4 hướng (D-026), Sức + đuối + ăn khoai, đồng hồ ngày 10 phút, thùng bán + sạp hạt tạm, ngủ / ngủ gục + tổng kết ngày, tự lưu (D-025).

**Câu trả lời của người chơi:**

| Câu hỏi | Trả lời |
|---|---|
| Cảm nhận chung | "Có vẻ oke rồi" |
| Hoạt ảnh vung cuốc + cuốc trong hotbar | Ổn |
| Ngày 10 phút (`dayLengthSeconds` 600) | Vừa, giữ nguyên |
| Sức (`staminaMax`, `staminaCost*`) | Vừa, giữ nguyên. Sức không tự giảm khi đứng yên — "cũng không sao", giữ |
| Cuốc ≈ 5 s/ô (`tillStrikesPerPlot` 6 × `tillStrikeSeconds` 0.85) | **Đáng công**, giữ nguyên |
| Tốc độ đi (`walkSpeed`) | Ổn |
| Tầm với (`interactRange`) | Ổn |
| **Làm nông có vui không?** | **Tạm** |

**Kết luận:** "Tạm" — cảm giác tay (đi, cuốc, nhịp ngày, Sức) đã ổn, nhưng chưa thấy "vui hẳn". Không phải lỗi thông số. **Không đổi thông số nào** trong `gameConfig.ts`. T-009 xong (D-028).

**Hướng xử lý (vì sao mới "Tạm" — giả thuyết, chưa kiểm chứng):**

| # | Giả thuyết | Hướng cải thiện rẻ nhất | Xếp vào |
|---|---|---|---|
| 1 | **Thiếu mục tiêu ngắn hạn trong ngày.** Chưa có nhiệm vụ, level, sính lễ phải gom → trồng xong không biết "để làm gì". Vòng meta (cưới vợ) là thứ tạo động lực nhưng prototype chưa có. | Một dòng mục tiêu nhỏ trên HUD ("Hôm nay: bán đủ 50 quan") hoặc nhiệm vụ level 1 của chặng 4. Ở 3.5 chỉ cần **nói trước** với người chơi mục tiêu tạm ("cố kiếm 100 quan trong 2 ngày") xem có vui hơn không. | Kiểm chứng ở playtest 3.5 (nói mục tiêu bằng lời) → làm thật ở chặng 4 (nhiệm vụ, §7) |
| 2 | **Phần thưởng cuối vòng còn nhạt.** Hái và bán tiền có chữ bay + tiếng, nhưng chưa có "khoảnh khắc sướng": tiền đổ vào túi, tổng kết ngày rung lên, cây chín lấp lánh gọi người hái. | Bảng juice GDD §8 cho hái / bán / tổng kết ngày (hạt, nảy, tiếng xu) — đúng việc của bước 4.5. | Làm ở chặng 4 (bước 4.5 game feel) |
| 3 | **Ruộng 9 ô và chỉ 2 loại cây quá ít lựa chọn.** Ngày nào cũng y hệt: cuốc 9 ô, gieo, tưới, chờ. Không có quyết định "trồng gì lãi hơn". | Chưa làm gì ở 3.3. Đã có sẵn trong kế hoạch: ruộng mở dần tới 24 ô, 5 loại cây theo mùa (§3.4). Ở 3.5 hỏi người chơi "có muốn thêm ô / thêm cây không" để biết có đúng là nguyên nhân. | Kiểm chứng ở playtest 3.5 → làm ở chặng 4 |
| 4 | **Thế giới còn trống.** Không có NPC, xóm làng, câu chửi, meme — mà "lầy" là cái chất riêng của game. Hình khối chưa có hồn. | Đã lên kế hoạch: Xóm làng Lầy + dân làng (D-021, D-027), art/âm thanh thật (4.2, 4.3), meme (§3.15). | Làm ở chặng 4 |
| 5 | **Tác giả tự chơi thì khó thấy "vui"** — đã biết hết, không còn bất ngờ. "Tạm" có thể là mức bình thường của người làm game. | Không làm gì thêm. Để người lạ chơi ở 3.5 và so sánh. | Kiểm chứng ở playtest 3.5 |

Không thêm task mới cho bước 3.3. Ở playtest 3.5 hỏi thêm 2 câu: "Lúc nào bạn thấy chán?" và "Bạn muốn có thêm gì để chơi tiếp?" để biết giả thuyết nào đúng.

**Phát hiện → hành động:**

| Phát hiện | Mức độ | Hành động |
|---|---|---|
| Cảm giác tay (đi, tầm với, cuốc, Sức, ngày 10 phút) ổn | — | Giữ nguyên thông số (D-028) |
| Làm nông mới "Tạm" | Vừa | Kiểm chứng giả thuyết 1, 3, 5 ở playtest 3.5; giả thuyết 2, 4 làm ở chặng 4 |
| Sức không tự giảm khi đứng yên | Nhẹ | Bỏ qua (người chơi thấy không sao) |

## PT-001 — 2026-10-13 — Prototype "một ngày ở Vườn" (bước 3.5, commit `e8c8a4c`)
**Người chơi:** người quen của tác giả (người dùng không ghi số người/chi tiết) · **Thiết bị:** máy tác giả, trình duyệt PC
**Câu hỏi cần trả lời:** người lạ có tự hiểu vòng cuốc → gieo → tưới → ngủ → bán không; giả thuyết 1, 3, 5 của PT-000.

**Quan sát / góp ý:** người dùng báo **đã cho chơi thử, không ai góp ý gì**. Không có ghi chú quan sát chi tiết.

**Phát hiện → hành động:**
| Phát hiện | Mức độ | Hành động |
|---|---|---|
| Không có góp ý / không phát hiện vấn đề | — | Chốt 3.5, sang chặng 4 (D-033) |
| Giả thuyết 1, 3, 5 (PT-000) chưa được kiểm chứng rõ vì thiếu ghi chú quan sát | Vừa | Kiểm lại ở buổi chơi thử 5.1 (có hình thật); quan sát kỹ hơn, ghi theo mẫu |

## Kế hoạch kiểm giả thuyết PT-000 trong chặng 4–5 (D-034)

| Giả thuyết | Đã làm gì để sửa | Kiểm ở đâu | Coi là "đúng / đã sửa" khi |
|---|---|---|---|
| 1. Thiếu mục tiêu ngắn hạn | T-042 level, T-043 nhiệm vụ + hướng dẫn ngày 1, T-044 mở rộng ruộng | **PT-002** (T-052, bạn tự chơi) → PT-003 (người lạ) | Người chơi tự nói được "mình đang làm gì / để làm gì" mà không cần hỏi |
| 2. Phần thưởng cuối vòng nhạt | T-027 (hái / bán / tổng kết), T-087 … T-089 | Hỏi ngay sau T-027; PT-002; PT-003 | Có ít nhất 1 khoảnh khắc người chơi tự khen / cười |
| 3. Ít lựa chọn (9 ô, 2 cây) | T-044 ruộng tới 24 ô, T-045 5 cây theo mùa, T-046 mưa | **PT-002** → PT-003 | Người chơi có lần cân nhắc "trồng gì / mua ô hay mua đồ" |
| 4. Thế giới trống | Đợt C Xóm + NPC, art / âm thanh thật | PT-003 | Người chơi chủ động đi nói chuyện với NPC, nhắc tới một nhân vật |
| 5. Tác giả tự chơi khó thấy vui | — | **Chỉ PT-003** (người lạ, bước 5.1) | So câu "vui không" của người lạ với của bạn |

### Kế hoạch PT-002 — mốc giữa chặng 4 (T-052, bạn tự chơi)

- **Bản thử:** sau Đợt D (có Xóm, NPC, level, nhiệm vụ, 5 cây, ruộng mở rộng, mưa, bếp, chế đồ). Esc → Chơi lại từ đầu, **không dùng phím thử**, chơi 2 ngày game (~20 phút).
- **Hỏi sau khi chơi** (trả lời bằng lời thường): (1) Lúc nào bạn biết mình nên làm gì tiếp? Có lúc nào "không biết làm gì" không? (giả thuyết 1) (2) Hái / bán / tổng kết có lúc nào thấy "sướng" không? (giả thuyết 2) (3) Có lúc nào phải nghĩ "trồng gì lãi hơn" hay "mua ô hay mua đồ"? (giả thuyết 3) (4) Lúc nào chán nhất? (5) Muốn có thêm gì để chơi tiếp?
- **So với PT-000:** "Làm nông có vui không?" — Có / Tạm / Chưa. Vẫn "Tạm" → `game-planner` đề xuất 2–3 hướng rẻ trước khi sang Đợt E.

### Kế hoạch PT-003 — playtest vòng 2 với người lạ (bước 5.1)

- **Người chơi:** 2–3 người **chưa xem game** (không phải tác giả), có ít nhất 1 người ít chơi game nông trại. Chơi trên máy bạn, từ Menu → Chơi mới, 30–40 phút.
- **Cách quan sát:** không giải thích, không giúp. Bạn ghi (hoặc quay màn hình nếu họ đồng ý) 4 thứ: chỗ dừng lại lâu > 10 giây không biết làm gì; lúc cười / lúc bực; có tự đi nói chuyện với NPC không; có mở sổ nhiệm vụ (Q) không.
- **Hỏi sau khi chơi:** 4 câu mẫu ở đầu file + (a) "Bạn đang cố đạt được điều gì?" (giả thuyết 1) (b) "Lúc nào vui nhất?" (giả thuyết 2) (c) "Bạn có phải chọn giữa hai thứ lần nào không?" (giả thuyết 3) (d) "Kể tên một nhân vật bạn nhớ" (giả thuyết 4) (e) "Làm nông có vui không: Có / Tạm / Chưa?" (giả thuyết 5 — so với câu trả lời của bạn ở PT-000 / PT-002).
- **Ghi theo mẫu** ở đầu file; mỗi phát hiện quy ra hành động (task / bug / bỏ qua).

## Changelog

- 2026-10-13 — D-034 (bước 4.1): thêm bảng kế hoạch kiểm 5 giả thuyết PT-000 trong chặng 4–5, kế hoạch PT-002 (mốc giữa chặng 4, T-052) và PT-003 (playtest người lạ, bước 5.1).

- 2026-10-13 — Thêm PT-001 (bước 3.5): đã chơi thử, không góp ý; chốt 3.5 (D-033).
- 2026-10-13 — Thêm PT-000 (tác giả tự chơi, T-009): giữ nguyên thông số, làm nông "Tạm", 5 giả thuyết + hướng xử lý (D-028).
