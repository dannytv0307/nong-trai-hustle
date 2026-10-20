# Danh sách task

> Chủ sở hữu: `game-planner`. Dùng cho các bước "nhiều buổi" (3.3, 4.2, 4.4…). Mỗi lần `/next` làm task đầu tiên chưa xong.
> Trạng thái: ⬜ chưa làm · 🔄 đang làm · 👀 chờ bạn thử · ✅ xong · ⛔ bị chặn (ghi lý do)

## Chặng 3 — Prototype "một ngày ở Vườn" (D-019)

Mục tiêu: trả lời câu hỏi **"làm nông có vui không?"** bằng hình khối, trước khi tốn công làm đẹp. Phạm vi: chỉ bản đồ Vườn; đi lại, cuốc–gieo–tưới–hái, thanh Sức, đồng hồ ngày, gùi + hotbar tối thiểu, thùng bán, ngủ sang ngày mới, tổng kết ngày, tự lưu trong trình duyệt. **Chưa có**: NPC, mặc cả, khu khác, nấu ăn, thời tiết, level/nhiệm vụ, meme, đăng nhập (đăng nhập + lưu server ở bước 3.4).

Mỗi task được `qa-tester` kiểm (Playwright chụp màn hình + đọc trạng thái game) trước khi chuyển sang 👀 cho bạn thử.

| ID | Bước | Task | Ai làm | Size | Cần trước | Trạng thái |
|---|---|---|---|---|---|---|
| T-001 | 3.3 | Dựng bản đồ Vườn thử, va chạm và camera đi theo | game-dev | M | — | ✅ |
| T-002 | 3.3 | Chỉ ô bằng chuột, tầm với và cuốc đất — **cuốc nhiều nhát ≈ 5 s/ô, thanh tiến độ, WASD bỏ dở** (D-022) | game-dev | M + M (phần 2) | T-001 | ✅ |
| T-003 | 3.3 | Gieo, tưới, hái + hotbar 9 ô và gùi tối thiểu | game-dev | L | T-002 | ✅ |
| T-004 | 3.3 | Thanh Sức, "đuối", ăn khoai bằng chuột phải, bong bóng chửi thề | game-dev | M | T-003 | ✅ |
| T-005 | 3.3 | Đồng hồ ngày trên HUD, trời tối dần, tạm dừng (Esc / chuyển tab) | game-dev | M | T-001 | ✅ |
| T-006 | 3.3 | Thùng bán, tiền và sạp hạt tạm | game-dev | M | T-003, T-005 | ✅ |
| T-007 | 3.3 | Ngủ, ngủ gục sau 24h, sang ngày mới (cây lớn, héo) và tổng kết ngày | game-dev | L | T-004, T-006 | ✅ |
| T-008 | 3.3 | Tự lưu trong trình duyệt, F5 vào lại đúng chỗ, đúng giờ | game-dev | M | T-007 | ✅ |
| T-009 | 3.3 | Tinh chỉnh cảm giác chơi theo góp ý của bạn | game-planner + game-dev | M | T-008 | ✅ |

**Tổng ước lượng:** 2 L + 7 M ≈ **40–46 giờ** (+3–4 giờ cho T-002 phần 2 theo D-022 → ≈ 43–50 giờ) (S = 1–2 giờ, M = 3–4 giờ, L = 6–8 giờ), cộng thời gian bạn thử và góp ý. Với **15 giờ/tuần**: khoảng **3 tuần** cho bước 3.3.

> Chặng 4 (đã lên lịch, D-020): chu trình bước đi thật 4 khung × 4 hướng cho {ten} (AI gen + chỉnh), áp dụng lần lượt cho 4 bậc ngoại hình — `art-director` + `game-dev`.

## Chặng 3 — Bước 3.4 Tài khoản & lưu game (D-029)

Mục tiêu: **phải đăng nhập mới chơi được**; tiến độ lưu trên server, máy nào đăng nhập cũng chơi tiếp được. Làm **email + mật khẩu trước**, rồi **Google**, **Facebook là task cuối** (cắt được nếu Facebook làm khó — GDD §14 mục cắt 0 (b)). **Chưa làm**: quên mật khẩu, xác minh email (không có dịch vụ gửi mail), chơi khách, menu chính (chặng 4), xóa tài khoản (bước 5.3).

Thứ tự theo rủi ro: sửa môi trường (BUG-003) → đăng nhập email chạy được thật trong trình duyệt → lưu lên server (phần dễ mất dữ liệu nhất) → Google → Facebook → QA cả luồng. Mỗi task `qa-tester` kiểm trước khi chuyển 👀 như bước 3.3.

> **D-031 (2026-10-13):** người dùng dời phần tài khoản xuống cuối → T-011 … T-017 thuộc **bước 5.5** — việc xây dựng cuối cùng, khi game đã hoàn thiện và lên mạng (D-032). T-010 vẫn làm ngay.

| ID | Bước | Task | Ai làm | Size | Cần trước | Trạng thái |
|---|---|---|---|---|---|---|
| T-010 | 3.4 | Sửa BUG-003: `start.bat` bật được cả stack trên máy bạn (cổng DB đổi được, tự tạo `.env`, tự `prisma generate`) | backend-dev | M | — | ✅ |
| T-011 | 5.5 | Server: đăng ký / đăng nhập / đăng xuất bằng email + mật khẩu, phiên cookie, `/api/me`, chống dò mật khẩu | backend-dev | L | T-010 | ⬜ |
| T-012 | 5.5 | Màn đăng nhập / đăng ký trước khi vào game, tên tài khoản + "Đăng xuất" trong cửa sổ Tạm dừng | game-dev | L | T-011 | ⬜ |
| T-013 | 5.5 | Server: API tải / lưu save (kiểm `GameSave`, số `revision` chống ghi đè bản cũ) | backend-dev | M | T-011 | ⬜ |
| T-014 | 5.5 | Game tự lưu lên server: bản đệm trên máy, mất mạng vẫn chơi, đẩy save cũ lên tài khoản lần đầu | game-dev | L | T-012, T-013 | ⬜ |
| T-015 | 5.5 | Đăng nhập bằng Google (bạn tạo OAuth client theo hướng dẫn), tự liên kết với tài khoản email cùng địa chỉ | backend-dev + bạn | L | T-012 | ⬜ |
| T-016 | 5.5 | Đăng nhập bằng Facebook (bạn tạo app Facebook theo hướng dẫn) | backend-dev + bạn | M | T-015 | ⬜ |
| T-017 | 5.5 | Kiểm toàn bộ luồng tài khoản + lưu (2 "máy", mất mạng, 2 tab, bảo mật cơ bản) | qa-tester | M | T-014, T-015 (+ T-016 nếu làm) | ⬜ |

**Tổng ước lượng:** 4 L + 4 M ≈ **36–48 giờ** (cao hơn mức 25–35 giờ dự tính ở GDD §14 vì tách thêm chống ghi đè save, mất mạng và QA cả luồng). Với **15 giờ/tuần**: khoảng **2,5–3 tuần** → xong 3.4 khoảng **03–06/11/2026** (vẫn sớm hơn mốc 13/11 vì 3.3 xong sớm). Thêm thời gian bạn tự tạo OAuth client Google (~15 phút) và app Facebook (~20 phút). Nếu trễ: bỏ T-016 trước (phát hành với email + Google).

**API dự kiến** (type để ở `@bph/shared`, `backend-dev` được đổi tên nếu có lý do, ghi lại ở ghi chú task):

| Lệnh | Việc | Task |
|---|---|---|
| `GET /api/auth/providers` | `{ email: true, google: bool, facebook: bool }` — nút Google/Facebook chỉ hiện khi server đã có khóa | T-011 |
| `POST /api/auth/register` `{ email, password }` | Tạo tài khoản + đăng nhập luôn (đặt cookie) | T-011 |
| `POST /api/auth/login` `{ email, password }` | Đăng nhập | T-011 |
| `POST /api/auth/logout` | Xóa phiên hiện tại | T-011 |
| `GET /api/me` | `{ user: { id, email, displayName, providers[] } }` hoặc 401 | T-011 |
| `GET /api/save` | `{ save, revision, updatedAt }` hoặc `{ save: null, revision: 0 }` | T-013 |
| `PUT /api/save` `{ save, baseRevision }` | Lưu nếu `baseRevision` khớp → `{ revision }`; không khớp → **409** `{ revision, updatedAt }` | T-013 |
| `GET /api/auth/google/start` · `/callback` | Đăng nhập Google (chuyển hướng) | T-015 |
| `GET /api/auth/facebook/start` · `/callback` | Đăng nhập Facebook | T-016 |

## Chặng 4 — Làm game đầy đủ (D-034)

Mục tiêu: từ prototype "một ngày ở Vườn" thành game trọn vòng **Chơi mới → Ngày 1 → cưới vợ → chơi tiếp**, đủ **Must** trong GDD §14, hình và tiếng thật. Tài khoản + lưu server vẫn ở bước **5.5** (T-011 … T-017, giữ nguyên); tới lúc đó game lưu trong trình duyệt (D-025).

**Cách đọc bảng:**
- Làm theo **Đợt A → I**, trong đợt theo thứ tự bảng (mỗi `/next` làm task đầu tiên chưa xong và đã đủ "Cần trước"). Thứ tự theo lựa chọn của bạn: **Vườn thật (Lô 1) trước**, rồi **Xóm + NPC (Lô 2)**, rồi các phần còn lại.
- Cột **Bước** = bước của hành trình: 4.2 hình thật · 4.3 âm thanh thật · 4.4 tính năng · 4.5 game feel. Các bước này **chạy xen kẽ**; một bước coi là xong khi mọi task của bước đó ✅ (Giả định).
- Asset chỉ ghi theo **Lô** + tên mô tả. ID, số ảnh, chi phí nằm ở `docs/art/asset-list.md` và `docs/audio/audio-list.md` (do `art-director`, `audio-director` lập). **Lô 1** = Vườn thật (kể cả nhà {ten}, trong nhà, giao diện HUD) · **Lô 2** = Xóm + NPC Xóm + {ten} bậc 2 · **Lô 3** = khu khác + mặc cả + meme (kèm bậc 3–4, gia đình, cảnh cưới) · **Lô 4** = menu, logo, intro, hoàn thiện. Nếu asset list chia lô hơi khác thì task "Gắn …" theo đúng asset list.
- Task code **không chờ hình**: chưa có asset thì làm bằng hình khối, task "Gắn …" thay hình sau. Task art/audio chạy song song với code (agent khác nhau).
- **Luật chung cho mọi task code:** (1) trạng thái mới phải vào save (save version 2 từ T-041, nâng cấp được từ v1) và có unit test; (2) có debug hook cho QA đọc; (3) **không bắt buộc e2e** (D-036: người dùng bỏ e2e) — kiểm bằng unit test + `qa-tester` mở trình duyệt xem thật + người dùng tự thử; e2e cũ không cần sửa cho xanh; (4) thông số đặt trong `gameConfig.ts` / `src/data/*.json` đúng tên GDD; (5) chữ ≥ 24px ở 1080p; (6) thông tin quan trọng luôn có hình, không chỉ âm thanh.
- Size: S = 1–2 giờ · M = 3–4 giờ · L = 6–8 giờ (1 ngày).

| ID | Đợt | Bước | Task | Ai làm | Size | Cần trước | Trạng thái |
|---|---|---|---|---|---|---|---|
| T-018 | A Nền móng | 4.4 | ~~Làm test e2e ổn định (BUG-006) + bộ test "smoke" chạy nhanh~~ — **bỏ (D-036)** | game-dev + qa-tester | M | — | ⏭ Bỏ |
| T-019 | B Vườn thật | 4.2 | Gen hình **Lô 1** phần 1: đất ruộng, cỏ, đường đất, cây trồng 5 loại, icon món | art-director | L | asset list Lô 1 | ✅ |
| T-020 | B Vườn thật | 4.2 | Gen hình **Lô 1** phần 2: động tác tưới / cúi, nhà {ten} + **trong nhà**, bếp, thúng bán, cọc rào, quầy hạt, cây nhãn, rào | art-director | L | asset list Lô 1 ✅ |
| T-091 | B Vườn thật | 4.2 | Gen hình **Lô 1** phần 3: giao diện vườn (khung cửa sổ, ô hotbar, nút, khung HUD, icon HUD, bong bóng) | art-director | M | asset list Lô 1 | ✅ |
| T-021 | B Vườn thật | 4.2 | Gắn Lô 1: đất ruộng 3 trạng thái, viền tự nối, nấc cuốc dở | game-dev | M | T-019 | ✅ |
| T-022 | B Vườn thật | 4.2 | Gắn Lô 1: cây trồng theo giai đoạn + icon món | game-dev | M | T-019 | ✅ |
| T-023 | B Vườn thật | 4.2 | Gắn Lô 1: động tác tưới và cúi (gieo / hái / dọn) | game-dev | M | T-020 | ✅ |
| T-024 | B Vườn thật | 4.2 | Gắn Lô 1: nhà {ten} (bên ngoài), thúng bán, cọc rào, quầy hạt thay sạp hạt hộp, cây nhãn, rào, đường đất | game-dev | M | T-020 | ✅ |
| T-093 | B Vườn thật | 4.4 | **Cảnh trong nhà {ten}**: bước qua cửa vào phòng riêng (giường, bếp, rương), chuyển cảnh dùng chung, save nhớ trong / ngoài nhà | game-dev | L | T-024 | ✅ |
| T-096 | B Vườn thật | 4.4 | **Click đâu đi đó + tự tìm đường** (chuột và chạm như nhau — chuẩn bị bản điện thoại, D-038) | game-dev | L | T-093 | ✅ |
| T-092 | B Vườn thật | 4.2 | Gắn giao diện Lô 1 vào HUD và các cửa sổ đang có | game-dev | M | T-091 | ✅ |
| T-025 | B Vườn thật | 4.3 | Làm âm thanh **Lô 1** (tiếng vườn còn thiếu, nhạc đêm, cửa nhà) | audio-director | L | audio list Lô 1 | ✅ |
| T-026 | B Vườn thật | 4.3 | Gắn âm thanh Lô 1 + tách kênh Nhạc / Hiệu ứng | game-dev | M | T-025 | ✅ |
| T-027 | B Vườn thật | 4.5 | "Khoảnh khắc sướng" khi hái, bán, tổng kết ngày (giả thuyết 2) | game-dev | M | T-022, T-026 | 👀 |
| T-041 | B2 Mục tiêu sớm | 4.4 | Save version 2 + bảng phím thử cho chặng 4 | game-dev | M | T-024 | ⬜ |
| T-042 | B2 Mục tiêu sớm | 4.4 | Level và tiếng tăm (XP, HUD, thẻ mở khóa) | game-dev | L | T-041 | ⬜ |
| T-043 | B2 Mục tiêu sớm | 4.4 | Nhiệm vụ, sổ nhiệm vụ (Q) và hướng dẫn ngày 1 | game-dev | L | T-042 | ⬜ |
| T-028 | C Xóm + NPC | 4.2 | Gen hình **Lô 2a**: nhà và công trình Xóm + **mảnh tường / cổng khuôn viên (D-040)** | art-director | L | asset list Lô 2 | ⬜ |
| T-029 | C Xóm + NPC | 4.2 | Gen hình **Lô 2b**: nền, nước hồ, cây đa, lũy tre, bụi, đồ trang trí + **vườn NPC: giàn trầu, nương chè, cau (D-040)** | art-director | L | asset list Lô 2 | ⬜ |
| T-030 | C Xóm + NPC | 4.2 | Gen hình **Lô 2c**: NPC chính ở Xóm (sprite + chân dung) + khung thoại, tab cửa hàng | art-director | L | asset list Lô 2 | ⬜ |
| T-031 | C Xóm + NPC | 4.2 | Gen hình **Lô 2d**: 5 dân làng phụ | art-director | L | asset list Lô 2 | ⬜ |
| T-097 | C Xóm + NPC | 4.2 | Gen hình **Lô 2f** (D-040): người bán chợ phiên, sạp phiên, người đi chợ, icon món mới, **NPC đình** (cụ Từ, hai cụ cờ, ông Mõ) | art-director | M | asset list Lô 2 (D-040) | ⬜ |
| T-065 | C Xóm + NPC | 4.2 | Gen hình **Lô 2e**: {ten} bậc 2 (đi, cuốc, tưới, cúi), hiệu ứng lột xác, icon nông cụ / bộ đồ | art-director | L | asset list Lô 2 | ⬜ |
| T-032 | C Xóm + NPC | 4.4 | Dựng bản đồ Xóm làng Lầy **72×50** (D-040) bằng hình khối + khuôn viên từng nhà, thay bản đồ Vườn | game-dev | L | T-043, T-093 | ⬜ |
| T-033 | C Xóm + NPC | 4.2 | Gắn hình Lô 2 lên bản đồ Xóm | game-dev | L | T-028, T-029, T-032 | ⬜ |
| T-099 | C Xóm + NPC | 4.2 | **Khuôn viên từng nhà** (ghép rào / tường / cổng) + **vườn NPC theo mùa** (D-040) | game-dev | M | T-032 | ⬜ |
| T-034 | C Xóm + NPC | 4.4 | Hệ NPC: đứng tại chỗ, nói chuyện, khung thoại có chân dung | game-dev | L | T-032 | ⬜ |
| T-035 | C Xóm + NPC | 4.4 | Lịch trình 4 khung giờ + giờ mở cửa hàng + **ngày phiên (D-040)** | game-dev | M | T-034 | ⬜ |
| T-036 | C Xóm + NPC | 4.4 | Quầy hạt cô Tám Thóc + cửa sổ cửa hàng dùng chung (bỏ sạp hạt tạm) | game-dev | M | T-035 | ⬜ |
| T-037 | C Xóm + NPC | 4.4 | Chốt thoại Xóm thành bảng câu cho `npcs.json` (+ NPC đình, người bán chợ phiên, món mới — D-040) | game-planner | M | — | ⬜ |
| T-038 | C Xóm + NPC | 4.4 | Dân làng phụ + **NPC đình** (cụ Từ "xem ngày", hai cụ cờ, ông Mõ) + các câu đùa trong Xóm | game-dev | L | T-034, T-037 | ⬜ |
| T-095 | C Xóm + NPC | 4.4 | **"Kỳ kèo"**: mặc cả nhẹ khi mua ở quầy cô Tám (hệ dùng chung cho cả 3 quầy — D-037) | game-dev | M | T-036, T-037 | ⬜ |
| T-098 | C Xóm + NPC | 4.4 | **Chợ phiên Lầy** (D-040): họp mỗi 3 ngày 6–12h, 4 gian bán thật, cô Lanh thu mua, băng chữ báo phiên | game-dev | L | T-035, T-036 | ⬜ |
| T-039 | C Xóm + NPC | 4.3 | Làm âm thanh **Lô 2** (nhạc ngày Xóm, nền làng, giọng NPC, cửa hàng) | audio-director | L | audio list Lô 2 | ⬜ |
| T-040 | C Xóm + NPC | 4.3 | Gắn âm thanh Lô 2 (môi trường theo vị trí, giọng NPC) | game-dev | M | T-038, T-039 | ⬜ |
| T-044 | D Mục tiêu | 4.4 | Mở rộng ruộng bằng cọc rào (9 → 24 ô) | game-dev | M | T-032, T-042 | ⬜ |
| T-045 | D Mục tiêu | 4.4 | Đủ 5 cây, theo mùa, mở theo level | game-dev | M | T-036, T-042 | ⬜ |
| T-046 | D Mục tiêu | 4.4 | Thời tiết: ngày mưa tự tưới | game-dev | M | T-045 | ⬜ |
| T-047 | D Mục tiêu | 4.4 | Kéo thả trong gùi, tooltip đầy đủ, ăn trong gùi | game-dev | M | — | ⬜ |
| T-048 | D Mục tiêu | 4.4 | Bếp: nấu ăn và nồi cơm | game-dev | M | T-047, T-093 | ⬜ |
| T-049 | D Mục tiêu | 4.4 | Nông cụ trên hotbar + độ bền, cùn | game-dev | M | T-042 | ⬜ |
| T-050 | D Mục tiêu | 4.4 | Chế đồ, nâng cấp, sửa ở lò rèn / xưởng mộc | game-dev | L | T-036, T-049 | ⬜ |
| T-051 | D Mục tiêu | 4.4 | Chửi thề đủ các trigger | game-dev | S | — | ⬜ |
| T-052 | D Mục tiêu | 4.4 | **Mốc giữa chặng 4**: chơi thử PT-002 (giả thuyết 1–3) + soát tiến độ | game-planner + bạn | S | T-027, T-043, T-045 | ⬜ |
| T-053 | E Núi + hồ câu | 4.2 | Gen hình **Lô 3a**: Núi, đồ hái lượm, động tác chặt / cầm cần | art-director | L | asset list Lô 3 | ⬜ |
| T-054 | E Núi + hồ câu | 4.4 | Chuyển khu qua cổng (dùng lại chuyển cảnh của T-093) + bản đồ Núi (hình khối) + cổng chặn theo level | game-dev | M | T-033, T-042, T-093 | ⬜ |
| T-055 | E Núi + hồ câu | 4.4 | Hái lượm và chặt củi, tre trên Núi | game-dev | M | T-049, T-054 | ⬜ |
| T-056 | E Núi + hồ câu | 4.2 | Gắn hình Lô 3a lên Núi | game-dev | M | T-053, T-055 | ⬜ |
| T-057 | E Núi + hồ câu | 4.2 | Gen hình **Lô 3b**: mini-game câu cá + bắn nỏ | art-director | M | asset list Lô 3 | ⬜ |
| T-058 | E Núi + hồ câu | 4.4 | Mini-game câu cá ở hồ làng | game-dev | L | T-033, T-046, T-050 | ⬜ |
| T-059 | E Núi + hồ câu | 4.4 | Mini-game bắn nỏ săn gà rừng | game-dev | L | T-050, T-054 | ⬜ |
| T-060 | E Núi + hồ câu | 4.3 | Làm âm thanh **Lô 3a** (Núi, câu cá, nỏ) | audio-director | L | audio list Lô 3 | ⬜ |
| T-061 | E Núi + hồ câu | 4.3 | Gắn âm thanh Lô 3a (+ tiếng Đồng Lầy — D-041) | game-dev | S | T-058, T-059, T-060 | ⬜ |
| T-100 | E Núi + hồ câu + đồng | 4.2 | Gen hình **Lô 3i** (D-041): Đồng Lầy — ruộng nước, thửa lúa theo giai đoạn, mương, chòi canh, ông Sào, bù nhìn, icon lúa / mạ | art-director | M | asset list Lô 3 (D-041) | ⬜ |
| T-101 | E Núi + hồ câu + đồng | 4.4 | Khu **Đồng Lầy** (hình khối) + cổng đông Xóm mở Lv 5 | game-dev | M | T-054, T-042 | ⬜ |
| T-102 | E Núi + hồ câu + đồng | 4.4 | **Thửa ruộng lớn**: thuê theo vụ / mua đứt ở ông Sào, cày – cấy – gặt lúa tẻ / nếp cả thửa | game-dev | L | T-101, T-036, T-045 | ⬜ |
| T-103 | E Núi + hồ câu + đồng | 4.2 | Gắn hình Đồng Lầy + juice gặt, bù nhìn, cò (Should) | game-dev | M | T-100, T-102 | ⬜ |
| T-062 | F Chợ + cưới | 4.2 | Gen hình **Lô 3c**: làng Sung + bà Cân, cụ Bá Kẹo (4 mặt), cô Bưởi | art-director | L | asset list Lô 3 | ⬜ |
| T-063 | F Chợ + cưới | 4.4 | Bản đồ làng Sung + đường sang chợ (cổng Lv 6, tốn giờ) | game-dev | L | T-054, T-062 | ⬜ |
| T-064 | F Chợ + cưới | 4.4 | Sạp bà Cân: bán ngay giá cao, mua lễ vật | game-dev | M | T-036, T-063 | ⬜ |
| T-066 | F Chợ + cưới | 4.2 | Gen hình **Lô 3d**: {ten} bậc 2 chặt + câu; bậc 3 đủ bộ khung; **bậc 4 chỉ đi / đứng** (làm việc mượn khung bậc 3) | art-director | L | T-065 | ⬜ |
| T-067 | F Chợ + cưới | 4.4 | Bậc ngoại hình: sắm sửa, "lột xác", danh hiệu, giảm giá | game-dev | L | T-064, T-065 | ⬜ |
| T-068 | F Chợ + cưới | 4.4 | Màn mặc cả sính lễ với cụ Bá Kẹo | game-dev | L | T-062, T-063 | ⬜ |
| T-069 | F Chợ + cưới | 4.4 | Nối nhiệm vụ 5–9 + bà mối gõ cửa | game-dev | M | T-043, T-048, T-050, T-064, T-068 | ⬜ |
| T-070 | F Chợ + cưới | 4.2 | Gen hình **Lô 3f**: cảnh cưới 3 khung (vẽ trọn tranh), cô Bưởi / vợ trên bản đồ | art-director | M | asset list Lô 3 | ⬜ |
| T-071 | F Chợ + cưới | 4.4 | Cảnh cưới, vợ về nhà, chơi tiếp sau cưới | game-dev | M | T-069, T-070 | ⬜ |
| T-072 | G Gia đình | 4.2 | Gen hình **Lô 3g**: con, gà, lợn, chuồng, icon | art-director | M | asset list Lô 3 | ⬜ |
| T-073 | G Gia đình | 4.4 | Vợ giúp tưới, tiền cơm cả nhà, ngày "ăn cháo" | game-dev | M | T-071 | ⬜ |
| T-074 | G Gia đình | 4.4 | Con cái: tin vui, ôm con, con lớn giúp việc | game-dev | M | T-073 | ⬜ |
| T-075 | G Gia đình | 4.4 | Chuồng, gà và lợn | game-dev | M | T-050, T-064, T-073 | ⬜ |
| T-076 | G Gia đình | 4.4 | Bốn sự kiện gia đình (Must) | game-dev | M | T-074, T-075 | ⬜ |
| T-077 | H Meme + menu | 4.2 | Gen hình **Lô 3h**: ảnh meme Must | art-director | M | asset list Lô 3 | ⬜ |
| T-078 | H Meme + menu | 4.4 | Bộ điều phối meme + 6 kiểu hiệu ứng dùng chung | game-dev | L | T-042 | ⬜ |
| T-079 | H Meme + menu | 4.4 | Nối 8 meme Must vào trò chơi | game-dev | M | T-068, T-077, T-078 | ⬜ |
| T-080 | H Meme + menu | 4.3 | Làm âm thanh **Lô 3b** (chợ, mặc cả, cưới, jingle, meme, gia đình) | audio-director | L | audio list Lô 3 | ⬜ |
| T-081 | H Meme + menu | 4.3 | Gắn âm thanh Lô 3b | game-dev | M | T-080 | ⬜ |
| T-082 | H Meme + menu | 4.2 | Gen hình **Lô 4**: logo, nền menu, **intro 4 khung (vẽ trọn tranh)**, kit menu / cài đặt / ô nhập tên | art-director | L | asset list Lô 4 | ⬜ |
| T-083 | H Meme + menu | 4.4 | Menu chính + "Về Menu" | game-dev | M | T-041 | ⬜ |
| T-084 | H Meme + menu | 4.4 | Intro 4 khung + đặt tên nhân vật | game-dev | M | T-082, T-083 | ⬜ |
| T-085 | H Meme + menu | 4.4 | Cửa sổ Cài đặt (âm lượng, rung màn, toàn màn hình…) | game-dev | M | T-026, T-083 | ⬜ |
| T-086 | H Meme + menu | 4.2 | Gắn kit menu Lô 4 + rà đồng bộ giao diện mọi cửa sổ, cỡ chữ | game-dev | M | T-082, T-085 | ⬜ |
| T-094 | H Meme + menu | 4.3 | Âm thanh **Lô 4**: âm giao diện, nhạc menu, **cân mix cuối** cả game | audio-director + game-dev | M | T-081, T-086 | ⬜ |
| T-087 | I Game feel | 4.5 | Juice phần 1: rung màn 3 mức, tiền, level, nhiệm vụ, chặt, hái lượm | game-dev | M | T-043, T-055 | ⬜ |
| T-088 | I Game feel | 4.5 | Juice phần 2: chuyển khu, giờ trong ngày, trạng thái nhân vật, mưa | game-dev | M | T-046, T-054 | ⬜ |
| T-089 | I Game feel | 4.5 | Juice phần 3: mini-game, mặc cả, cưới | game-dev | M | T-058, T-059, T-068, T-071 | ⬜ |
| T-090 | I Game feel | 4.4 | Kiểm trọn vòng Ngày 1 → cưới + hồi quy cả game | qa-tester | L | mọi task chặng 4 | ⬜ |

**Người dùng chốt (2026-10-14, D-034):** giữ đủ Must, soát giờ thật ở T-052 · bậc ngoại hình 2–3 đủ động tác, **bậc 4 chỉ đi / đứng, làm việc mượn khung bậc 3** · **level + nhiệm vụ (T-041 … T-043) chen lên ngay sau T-027** (đợt "B2") · **có cảnh trong nhà riêng** (T-093). Đội chọn: intro 4 khung + cảnh cưới vẽ trọn tranh; Xóm dùng nhạc ngày bản B; mỗi NPC một bộ giọng lẩm bẩm tổng hợp. Lô asset theo đúng `docs/art/asset-list.md` (nhà {ten}, trong nhà, quầy hạt, cây nhãn, rào, đường đất, giao diện HUD ở **Lô 1**; {ten} bậc 2 ở **Lô 2**; intro ở **Lô 4**).

**Theo bước:** 4.2 = 24 task (16 gen hình + 8 gắn hình) · 4.3 = 9 task · 4.4 = 42 task · 4.5 = 4 task. Tổng **79 task**: 4 S + 45 M + 30 L. (ID T-091 … T-096 thêm sau nên nằm xen trong bảng; làm theo thứ tự dòng, không theo số.)

**Cập nhật D-041 (2026-10-15, Đồng Lầy):** thêm **T-100** (M, art), **T-101** (M), **T-102** (L), **T-103** (M) ở đợt E; T-060 / T-061 thêm tiếng đồng (cùng size) → **+≈ 19 giờ (16–24)** → **≈ 357–484 giờ, mốc ≈ 419 giờ** (4.2 ≈ 144 · 4.3 ≈ 45 · 4.4 ≈ 216 · 4.5 ≈ 14). **86 task**: 3 S + 50 M + 33 L (4.2 = 28 · 4.3 = 9 · 4.4 = 45 · 4.5 = 4). Với 15 giờ/tuần: 24–32 tuần, **mốc kế hoạch ~05/05/2027**. Hình thêm ≈ 2,8 USD (3,2 có dự phòng, Lô 3). Thứ tự: T-101 ngay sau T-054; T-102 sau T-045 + T-036 (T-045 ở đợt D nên xong trước); T-100 gen cùng phiên Lô 3a (T-053).

**Cập nhật D-040 (2026-10-15, Xóm 72×50 + khuôn viên + chợ phiên + đình có người):** thêm **T-097** (M, art), **T-098** (L), **T-099** (M); T-037 S → M, T-038 M → L; T-028, T-029, T-032, T-033, T-035, T-040 thêm việc trong cùng size (~+4,5 giờ). Tổng **+≈ 25 giờ (21–31)** → **≈ 341–460 giờ, mốc ≈ 400 giờ** (4.2 ≈ 137 · 4.3 ≈ 44 · 4.4 ≈ 205 · 4.5 ≈ 14). **82 task**: 3 S + 47 M + 32 L (4.2 = 26 · 4.3 = 9 · 4.4 = 43 · 4.5 = 4). Với 15 giờ/tuần: 23–31 tuần, **mốc kế hoạch ~26/04/2027** (trước ~14/04). Hình thêm ≈ 6,5 USD (7,4 có dự phòng — asset list §1 mục D-040). Thứ tự trong đợt C: T-097 làm cùng phiên gen với T-031; T-099 ngay sau T-032; T-098 sau T-036 (trước T-095 cũng được).

**Cập nhật D-038 (2026-10-14, click đâu đi đó):** thêm T-096 (L, ~7 giờ, đợt B ngay sau T-093) → **≈ 320–429 giờ, mốc ≈ 375 giờ** (4.4 ≈ 191,5 giờ) → 21,5–28,5 tuần, **mốc kế hoạch lùi ~3–4 ngày, ~14/04/2027**.

**Cập nhật D-037 (2026-10-14, kỳ kèo):** thêm T-095 (M, 3,5 giờ) + phần nhỏ ở T-037 (+0,5 giờ, vẫn S) và T-050 (+0,5–1 giờ, vẫn L) → **≈ 314–421 giờ, mốc ≈ 368 giờ** (4.4 ≈ 184,5 giờ) → 21–28 tuần, **mốc kế hoạch lùi ~2 ngày, ~10/04/2027**. Các con số D-034 bên dưới giữ để đối chiếu.

**Tổng ước lượng (D-034):** khoảng **310–416 giờ, lấy mốc 363 giờ** (4.2 ≈ 126 · 4.3 ≈ 43,5 · 4.4 ≈ 179,5 · 4.5 ≈ 14 giờ; tính S 1–2, M 3–4, L 6–8 giờ). Với **15 giờ/tuần**: khoảng **20,5–28 tuần, mốc 24 tuần** tính từ 14/10/2026 → xong chặng 4 khoảng **14/03 – 03/05/2027, mốc kế hoạch ~08/04/2027** (đã cộng ~1 tuần nghỉ Tết 06/02/2027). So với bản đầu (345 giờ, ~30/03) thêm ~18 giờ: cảnh trong nhà + rương, giao diện Lô 1, âm thanh theo ước lượng của audio list, âm Lô 4 + cân mix. Cao hơn ước cũ ở GDD §14 (9,5–12 tuần) vì lần này tính đủ từng việc gắn hình, gắn tiếng, cửa sổ, kiểm tra. Lưu ý: chặng 3 ước 43–50 giờ nhưng xong trong ~5 ngày lịch — nếu nhịp đó giữ được dù chỉ một nửa, chặng 4 có thể xong sớm hơn nhiều; **soát lại ở T-052** bằng giờ thật.

**Nếu trễ:** cắt theo thứ tự ở GDD §14 "Thứ tự cắt khi sản xuất (D-034)" (C1 meme rút gọn → C2 bậc ngoại hình rút gọn → C3 gia đình rút gọn → …). Không cắt: Xóm + NPC chính, level + nhiệm vụ, mặc cả, juice cơ bản (đều là pillar).

## Chi tiết task

### T-001 — Dựng bản đồ Vườn thử, va chạm và camera đi theo

**Bước:** 3.3 · **Ai làm:** game-dev · **Size:** M (3–4h) · **Cần trước:** —

**Mục tiêu:** đi bằng WASD trên một bản đồ Vườn lớn hơn màn hình, đụng nhà/cây/ao thì dừng lại, camera bám theo nhân vật — để cảm được "đi lại có sướng tay không".

**Điều kiện xong** (kiểm chứng được, ưu tiên thấy được trong trình duyệt):
- [x] Mở game vào thẳng scene mới **`GardenScene`** (Vườn thử). Sandbox cũ vẫn mở được bằng `http://localhost:5173/?scene=sandbox`.
- [x] Bản đồ Vườn **48 × 32 ô** (GDD §5), dựng bằng code (chưa cần Tiled). Nền cỏ bằng tile thử; có **khối nhà** (hình chữ nhật, có ô cửa và giường bên trong), **vài khối cây**, **một ao nước**, **hàng rào** quanh mép, **vùng ruộng 3×3** (9 ô, `startPlots`) gần nhà; chừa chỗ đặt thùng bán và sạp hạt (T-006).
- [x] Nhân vật dùng **Arcade Physics**, hộp va chạm nhỏ ở chân (`playerFootHitbox`): đi sát nhà, cây, ao, rào thì dừng lại, trượt dọc theo cạnh (không bị kẹt). Đi được 8 hướng, đi chéo không nhanh hơn đi thẳng.
- [x] Nhân vật đi sau cây/nhà đúng lớp (depth theo trục Y).
- [x] **Hoạt ảnh đi bằng code (D-020)** để hết cảm giác "trượt": khi đi, sprite nảy theo nhịp bước (`walkBobHeight`, `walkBobRate`), nghiêng nhẹ theo hướng đi (`walkTiltDeg`), co giãn nhẹ khi đặt chân, bụi chân mỗi vài bước; khi đứng yên thì "thở" nhẹ (scale Y ±2%); đổi hướng có cú lật/xoay ngắn. Nhịp nảy khớp tốc độ đi. *(2026-10-10: đã thay bằng chu trình bước thật 4 khung × 4 hướng ART-CHR-004 — xem ghi chú bên dưới; nảy/nghiêng bằng code bỏ để khỏi "nảy đôi", giữ bụi chân, thở khi đứng, cú co ngang khi đổi hướng.)*
- [x] Camera đi theo mượt (`cameraLerp`), dừng ở mép bản đồ, không lộ khoảng đen.
- [x] Gợi ý phím góc dưới phải: "WASD: đi".
- [x] Trạng thái cho QA đọc: vị trí nhân vật (ô), cờ `gardenReady`.

**Thông số / ghi chú:** dùng `walkSpeed`, `tileSize`. Thêm vào `gameConfig.ts`: `walkBobHeight` (6 px), `walkBobRate` (bước/giây khớp `walkSpeed`), `walkTiltDeg` (4), `cameraLerp` (0.12), `playerFootHitbox` ([40, 20] px), `gardenMapSize` ([48, 32] ô). Asset: chỉ tile thử cỏ/đất và sprite Tý 4 hướng có sẵn; nhà, cây, ao là hình khối màu theo `palette.ts`.

**Ghi chú khi làm (game-dev, 2026-10-10, theo góp ý người dùng "đi ngang chưa tự nhiên, xoay chưa mượt"):** đã thay đi trái/phải bằng chu trình **6 khung** ART-CHR-005 (profile, `walkSideFrames` 6, `walkSideFrameRate` 12 → 4 lần chạm gót/giây như đi dọc, sải ≈ 1 ô; bụi chân ở khung 0/3 `walkSideContactFrames`; dải trái cũ bị đảo thứ tự khung = đi lùi, hết khi thay file). Đi lên/xuống giữ 4 khung 8 fps. Bỏ cú bóp scaleX (`turnFlipSeconds`/`turnFlipSquash`), thay bằng **khung xoay chéo** ART-CHR-006 (`hero-t1-turn.png`): quay 90° hiện 1 khung, quay 180° hiện 2 khung nối tiếp (trái↔phải vòng qua phía xuống; xuống↔lên vòng qua phía ngang vừa đi), mỗi khung `turnFrameMs` 70 ms, rồi vào khung đầu chu trình hướng mới; đổi hướng giữa lúc xoay thì tính lại từ khung đang hiện; điều khiển không khựng (chỉ đổi hình). Đứng yên mà đổi hướng cũng dùng cùng đường xoay rồi về ảnh đứng. Logic ở `src/systems/turnAnim.ts` + unit test; e2e thêm ca "đổi hướng khi đang đi" (`garden.spec.ts`), Q6 kiểm khung xoay thay cho co ngang. Ghi chú: ảnh đứng trái/phải vẫn là dáng 3/4, đi ngang là profile — chấp nhận, không gen lại. T-001 vẫn 👀 chờ người dùng thử lại.

**Ghi chú khi làm (game-dev, 2026-10-10):** đã gắn chu trình bước thật ART-CHR-004 (`hero-t1-walk-<hướng>.png`, spritesheet 4 khung 64×96, `walkFrameRate` 8 → sải ≈ 1 ô/bước ở `walkSpeed` 4); tốc độ chạy khung tỷ lệ tốc độ thật (ép tường → dừng anim, về dáng đứng chống nạnh `hero-t1-<hướng>`); bụi chân ở khung chạm gót 0/2; đi lên nhích 1px (`walkUpBobPx`). Va chạm rào/tường/giường/ao chuyển sang **lớp va chạm Tilemap** (sửa BUG-001); cây vẫn là hộp gốc nhỏ. E2E thêm ca "BUG-001: ép chéo dọc cả 4 mặt ngoài nhà (và ao)" trong `garden.spec.ts`; các test e2e đo theo trạng thái thay vì thời gian (máy test vẽ bằng CPU ~13–40 FPS).

**Ghi chú khi làm (game-dev, 2026-10-09):** `cameraZoom` = 1.5 (ô hiện 96px, nhân vật 96×144px, thấy ~20×11 ô); tán cây mờ còn `treeFadeAlpha` khi đứng sau cây để không "mất" nhân vật; bố cục Vườn ở `web/client/src/data/gardenLayout.json`; `?debug=physics` vẽ hộp va chạm. E2E: `web/e2e/tests/garden.spec.ts`.

**Bạn thử thế nào:** chạy `web/start.bat`, mở http://localhost:5173. Bấm W A S D đi một vòng quanh vườn. Phải thấy: camera chạy theo, đụng nhà/cây/ao/rào thì đứng lại, đi ra sau cây thì cây che người. Tự hỏi: đi **nhanh quá hay chậm quá**? Ghi lại để T-009 chỉnh.

---

### T-002 — Chỉ ô bằng chuột, tầm với và cuốc đất (giữ chuột để cuốc cả luống)

**Bước:** 3.3 · **Ai làm:** game-dev · **Size:** M (3–4h) · **Cần trước:** T-001

**Mục tiêu:** rê chuột thấy ô được chọn, click ô ruộng trong tầm với thì nhân vật cuốc — "chạm ô ruộng" là cảm giác quan trọng nhất của game.

**Điều kiện xong:**
- [x] Ô dưới con trỏ có **viền sáng** nếu nằm trong tầm `interactRange` tính từ tâm nhân vật; ngoài tầm thì **viền xám** và click không làm gì (GDD §3.3).
- [x] Click ô ruộng chưa cuốc trong tầm → nhân vật **quay mặt về ô đó**, đứng khựng `actionDuration` giây, ô đổi sang đất đã cuốc (tile đất thử).
- [x] **Giữ chuột trái và rê** qua các ô → cuốc lần lượt từng ô, mỗi `actionDuration` một ô. Vừa giữ chuột vừa đi WASD dọc luống vẫn cuốc được.
- [x] Juice tối thiểu (GDD §8): nhân vật nhún, vài hạt bụi (hình tròn nâu), ~~rung màn nhẹ (`screenShakeLight`)~~ → người dùng chọn **cuốc không rung** (2026-10-10), tiếng **"bộp"** (`cuoc-dat-1/2`, chọn ngẫu nhiên).
- [x] Logic ruộng tách riêng thành module thuần (ví dụ `systems/farm.ts`: trạng thái từng ô, hàm `till`) có **unit test**.
- [x] Trình duyệt không mở menu khi bấm chuột phải trên game.

**Thông số / ghi chú:** dùng `interactRange`, `actionDuration`. Thêm `screenShakeLight` (cường độ 0.05 ô, 0.1 giây — GDD §8). Chưa trừ Sức (T-004).

**Ghi chú khi làm (game-dev, 2026-10-10):** chỉ **9 ô ruộng** (`plots` trong `gardenLayout.json`) cuốc được — GDD §3.4 coi ruộng là vùng đặt sẵn, mở dần; cỏ ngoài ruộng viền sáng khi trong tầm nhưng click không làm gì. Ô ruộng chưa cuốc giờ là cỏ phủ màu đất khô; cuốc xong đổi sang tile đất thử (T-001 cũ vẽ sẵn đất cho cả ruộng). Tầm với đo từ **giữa hộp chân** tới tâm ô (`interactRange` 1.5 → với 8 ô quanh mình). Động tác `actionDuration` 0.4 s: nửa đầu giơ cuốc (vươn cao `actionStretch` 5%), **chạm ở giữa** (`actionImpactAt` 0.5: ô đổi, bụi, "bộp", rung), nửa sau nảy về; trong lúc làm nhân vật đứng khựng (bỏ qua WASD), quay mặt bằng khung xoay sẵn có. Rê chuột nhanh hơn tốc độ cuốc thì các ô xếp hàng chờ (`actionQueueMax` 4), tới lượt mà ô đã ra ngoài tầm thì bỏ. Thêm vào `gameConfig.ts`: `screenShakeLight`, `actionImpactAt`, `actionQueueMax`, `actionSquash` (0.12), `actionStretch`, `tillDustCount` (7), `tillDustLifeSeconds`, `tillDustSpeed`, `tileHighlightWidth`. Logic: `src/systems/farm.ts` (ô ruộng, `till`, `inReach`, `facingToward`) + `src/systems/tileAction.ts` (hàng đợi + nhún) có unit test; chuột qua `InputController` (bấm ghi theo sự kiện nên click nhanh không mất). Tiếng `cuoc-dat-1/2` đã có sẵn, lệch cao độ ±1 nửa cung cho đỡ lặp. Viền xám = trộn trắng điệp + mực (palette chưa có xám — đề xuất art-director thêm màu "xám ấm" cho UI). E2E: `web/e2e/tests/farm.spec.ts` (5 ca), ảnh `web/e2e/screenshots/t002-*.png`.

**Góp ý người dùng sau khi thử (2026-10-10) — đã chỉnh (game-dev), T-002 vẫn 👀 chờ thử lại:** (1) **Tầm với xa hơn**: `interactRange` 1.5 → **2.5 ô** (đứng giữa ô với tới ô cách 2 thẳng và chéo gần (2,1) 2.24 ô; không tới góc (2,2) 2.83 ô) — đã sửa GDD §3.3. (2) **Tắt rung màn khi cuốc**: cờ mới `tillScreenShake: false`; `screenShakeLight` giữ trong config cho sự kiện lớn sau này (hàm `shakeScreen` dùng lại được). Bù "lực" bằng bụi đất nhiều/xa hơn: `tillDustCount` 7 → 9, `tillDustSpeed` 2.2 → 2.6. (3) **Viền ô rõ hơn**: trong tầm = nét trắng điệp dày `tileHighlightWidth` 6 px + viền mực lót `tileHighlightOutline` 3 px/bên (độ đục 0.95) + nền trắng điệp mờ `tileHighlightFillAlpha` 0.3 + **thở** (`tileHighlightPulseRate` 1.6 nhịp/giây, alpha 0.6–1, rê sang ô mới thì bắt đầu sáng nhất); ngoài tầm = nét xám 3 px, lót mực nhạt 2 px (0.4), không nền, đứng yên. Viền lùi vào trong ô, không lấn ô bên. Không thêm màu palette (dùng paper + ink + xám trộn sẵn). (4) Âm thanh cuốc do audio-director làm lại (giữ key `sfx-cuoc-dat-1/2`). Kiểm: build/test (93 unit)/lint xanh, e2e `farm` + `qa-t002` + `garden` 23/23 (test A1 biên 2.484/2.516 ô, A9 đổi thành "cuốc không rung", test mới chụp viền trên đường đất/cỏ/ruộng chưa cuốc/đã cuốc/ngoài tầm: `web/e2e/screenshots/t002-highlight-*.png`). Đề xuất sửa GDD (chưa sửa, chờ duyệt): bảng thông số dòng `screenShakeLight` ghi "Rung màn nhẹ khi cuốc (§8)" → "dành cho sự kiện lớn; cuốc không rung (`tillScreenShake` false)"; điều kiện xong T-002 dòng juice còn ghi rung màn nhẹ.

**Phần 2 — Cuốc là "việc nặng" ≈ 5 giây/ô (D-022, người dùng chọn 2026-10-10)** · Size M (3–4h) · **thay** các dòng "đứng khựng `actionDuration`", "mỗi `actionDuration` một ô", "vừa giữ chuột vừa đi WASD vẫn cuốc" ở trên (chỉ áp dụng cho cuốc; gieo/tưới/hái ở T-003 vẫn nhanh). Luật đầy đủ: GDD §3.3a.

**Điều kiện xong (phần 2):**
- [x] Click ô chưa cuốc trong tầm → {ten} quay mặt về ô, đứng tại chỗ, tự bổ **`tillStrikesPerPlot` (6) nhát**, mỗi nhát **`tillStrikeSeconds` (0.85 s)** → tổng ≈ 5,1 s. Thả chuột vẫn cuốc tiếp. Mỗi nhát chạm ở `actionImpactAt`: "bộp" (2 biến thể, lệch cao độ), bụi, nhún. **Không rung màn.**
- [x] **Thanh tiến độ 6 đốt** ngay trên ô đang cuốc, mỗi nhát đầy 1 đốt. Ô cuốc dở luôn hiện thanh (mờ ~50% khi không cuốc).
- [x] **Đất đổi 3 nấc** (`tillVisualStages`): sau nhát 2, sau nhát 4, nhát 6 = đã cuốc. Prototype vẽ bằng code (phủ màu/vệt đất), chưa cần ảnh mới.
- [x] **Nhát cuối**: bụi × `tillFinishDustMultiplier` (2), khựng hình `tillFinishHitStopSeconds` (0.05 s), ô nảy, tiếng chốt khác (tạm dùng "bộp" thấp hơn + to hơn nếu audio chưa có tiếng riêng). Từ nhát `tillSweatFromStrike` (3) có giọt mồ hôi (hình tròn xanh nhạt) bay.
- [x] **WASD / mũi tên khi đang cuốc = bỏ dở**: dừng ngay, đi được luôn; nhát chưa chạm không tính; ô giữ số nhát đã cuốc; **hàng chờ bị xóa**.
- [x] **Click lại ô cuốc dở** (trong tầm) → làm tiếp số nhát còn lại. Ngoài tầm → viền xám, không làm gì (như mọi ô).
- [x] **Hàng chờ**: đang cuốc mà click hoặc giữ chuột rê qua ô chưa cuốc / cuốc dở khác trong tầm → xếp hàng, tối đa **`tillQueueMax` (3)**, hiện số 1/2/3 nhỏ trên ô chờ; xong ô này tự quay sang ô kế. Đầy thì bỏ qua. Click ô đang cuốc hoặc đã trong hàng chờ: không làm gì. Không đổi ô giữa chừng. Tới lượt mà ô đã ra ngoài tầm (không xảy ra vì nhân vật đứng yên, nhưng vẫn kiểm) thì bỏ.
- [x] **Một lần rê một loại việc**: lần giữ chuột bắt đầu trên ô chưa cuốc thì chỉ nhận ô chưa cuốc/cuốc dở (chuẩn bị cho T-003, khi ô đã cuốc sẽ là "gieo").
- [x] Mở gùi / Esc / chuyển tab giữa lúc cuốc → cuốc dừng cùng game, quay lại cuốc tiếp, không mất nhát (khi T-005 có tạm dừng; trước đó chỉ cần Phaser pause đúng).
- [x] Logic trong module thuần có unit test: `farm.ts` thêm trạng thái `tillStrikes` (0…6) mỗi ô, hàm "bổ 1 nhát" trả về đã xong ô chưa; `tileAction.ts` (hàng chờ, bỏ dở, làm tiếp). E2E: click 1 ô → sau ~5 s ô đã cuốc; bấm D giữa chừng → ô dở, đi được; click lại → xong với số nhát còn lại; rê qua 5 ô → chỉ 1 + 3 ô được nhận.
- [x] Trạng thái QA đọc được: `tillStrikes` của từng ô, ô đang cuốc, hàng chờ.

**Thông số mới (phần 2):** `tillStrikesPerPlot` 6, `tillStrikeSeconds` 0.85, `tillVisualStages` 3, `tillQueueMax` 3, `tillFinishDustMultiplier` 2, `tillFinishHitStopSeconds` 0.05, `tillSweatFromStrike` 3, `tillProgressKeepsOvernight` true (dùng ở T-007/T-008). Giữ `actionDuration` 0.4 + `actionQueueMax` 4 cho việc nhanh (T-003). `staminaCostTill` (4, trừ khi xong ô) để T-004. Ghi chú cho art: ART-CHR-007 (động tác cuốc) đổi nhịp — mỗi khung = 25% `tillStrikeSeconds` thay vì `actionDuration`; nên có thêm tile đất "cuốc dở" 2 nấc ở chặng 4 (prototype vẽ bằng code).

**Ghi chú khi làm phần 2 (game-dev, 2026-10-10) — T-002 → 👀 chờ bạn thử:** `farm.ts`: mỗi ô thêm `tillStrikes` (0…6, có trong save), hàm `strikeTill` bổ 1 nhát trả `'progress' | 'done' | 'invalid'`, `strikesRemaining`, `tillStage` (nấc đất). `tileAction.ts`: một ô = nhiều nhát (`strikesFor` hỏi lúc bắt đầu → ô dở 4/6 chỉ làm 2), `cancelTileAction` (bỏ dở + xóa hàng chờ), phần thời gian dư cuối nhát chuyển sang nhát sau để cả ô đúng 6 × 0.85 s, mỗi frame chạm tối đa 1 nhát; hàng chờ `tillQueueMax` 3 (đang rảnh thì luôn nhận click, kể cả khi tắt hàng chờ = 0). Scene: thanh 6 đốt vàng hoa hòe ở mép trên ô (mờ `tillProgressIdleAlpha` 0.5 khi bỏ dở, lóe trắng điệp rồi tắt khi xong), nấc đất vẽ bằng code (nấc 1 vệt cuốc trên nền nâu nhạt, nấc 2 nâu đậm + cục đất), số 1/2/3 trên ô chờ, mồ hôi (chấm xanh nước pha trắng điệp) từ nhát 3, nhát cuối bụi ×2 + khựng hình 0.05 s + ô nảy (ảnh cắt đúng mảnh đất phóng 12%) + "bộp" trầm 4 nửa cung, to ×1.25. **Cách hiểu luật cần bạn biết:** (a) đang **giữ** phím đi thì click ruộng không cuốc (cuốc là việc đứng yên) — dừng chân rồi click; (b) bỏ dở bằng WASD mà vẫn giữ chuột thì không tự cuốc lại cho tới khi buông chuột và bấm lại; (c) bấm chuột trên cỏ / ô đã cuốc rồi rê qua ruộng chưa cuốc thì không cuốc ("một lần rê một loại việc" theo ô bấm đầu). Thông số mới trong `gameConfig.ts` (đủ bảng GDD §3.3a + vài số hiệu ứng: `tillProgressIdleAlpha`, `tillFinishSfxDetune` −400, `tillFinishSfxVolumeMultiplier` 1.25, `tillFinishBounceScale/Seconds`, `tillFinishFlashSeconds`, `tillSweatCount/LifeSeconds/Speed`); `staminaCostTill` 2 → 4, `tillDoneBark*` chỉ để sẵn cho T-004. Debug cho QA: `debugState.farm.plots[].tillStrikes`, `action.{current, queue, strikesLeft, strikesDone, dragKind}`, `till.{tuning, finishes, cancels, hitStops, bars, stages, queueLabels, sweatActive, bouncing}`, `juice.lastSfxDetune/lastSfxVolume`; `debugSetTillTuning({ strikeSeconds, strikesPerPlot, queueMax })` cho test chạy nhanh. Kiểm: build + 104 unit + lint xanh; e2e `farm` + `qa-t002` + `garden` 26/26 (chạy 2 lần liền đều xanh). Ca **thông số thật** 6 × 0.85 s đo theo đồng hồ game: cả ô 4.9–5.5 s, các nhát cách nhau 0.75–0.98 s, đứng yên suốt lúc cuốc. Ca hàng chờ / bỏ dở dùng nhát rất dài lúc kiểm rồi rút ngắn để không phụ thuộc máy test nhanh/chậm (BUG-006). Ảnh: `web/e2e/screenshots/t002b-progress-3of6.png`, `t002b-progress-4of6.png`, `t002b-finish.png`, `t002b-done.png`, `t002b-abandoned.png`, `t002b-queue.png`, `t002b-queue-done.png`. Đề xuất art (chặng 4): tile đất "cuốc dở" 2 nấc + tiếng chốt riêng cho audio (đang tạm dùng "bộp" hạ giọng).

**Bạn thử thế nào:** mở http://localhost:5173, đi tới vùng ruộng 3×3. Rê chuột qua các ô: gần thì viền sáng, xa thì viền xám. Click một ô rồi **buông tay**: {ten} tự bổ 6 nhát (khoảng 5 giây), nghe "bộp" mỗi nhát, thanh nhỏ trên ô đầy dần, đất đổi màu 2 lần trước khi thành đất nâu tơi; nhát cuối bụi bung to. Click ô khác, đang cuốc thì **bấm D**: nhân vật bỏ dở và đi ngay, ô còn thanh dở dang. Quay lại click ô đó: cuốc nốt mấy nhát còn lại. Thử click 1 ô rồi giữ chuột rê qua cả hàng: thấy số 1, 2, 3 trên các ô chờ, {ten} cuốc lần lượt. Tự hỏi: 5 giây một ô thấy **"đáng công" hay "sốt ruột"**? Ghi lại cho T-009.

---

### T-003 — Gieo, tưới, hái + hotbar 9 ô và gùi tối thiểu

**Bước:** 3.3 · **Ai làm:** game-dev · **Size:** L (1 ngày) · **Cần trước:** T-002

**Mục tiêu:** làm trọn vòng một ô ruộng: cuốc → gieo hạt đang chọn trên hotbar → tưới → (sang ngày, ở T-007) chín → hái vào gùi.

**Điều kiện xong:**
- [x] Click ô theo bảng GDD §3.3, nhân vật **tự chọn việc**: đã cuốc + trống → gieo **hạt đang chọn**; đã gieo + chưa tưới hôm nay → tưới; cây chín → hái (ô về đất chưa cuốc, `harvestResetsSoil`); cây héo → dọn.
- [x] Ô hotbar đang chọn không phải hạt → dùng hạt gieo lần trước; hết hạt → bong bóng "hết hạt rồi".
- [x] Cây vẽ bằng hình khối theo giai đoạn: hạt (chấm nhỏ), đang lớn (mầm), chín (hình to, màu theo loại), ô đã tưới sẫm màu hơn. Prototype có **2 cây**: rau cải (1 ngày), khoai lang (2 ngày) lấy từ `crops.json`.
- [x] **Hotbar 9 ô** giữa dưới màn (`hotbarSlots`): phím 1–9 và cuộn chuột đổi ô, ô chọn viền vàng, số lượng ở góc ô.
- [x] **Gùi** `bagSlotsStart` = 18 ô, hàng đầu là hotbar, mỗi ô chồng tối đa `stackMax`. Đồ hái vào ô cùng loại hoặc ô trống đầu tiên. Gùi đầy → không hái, bong bóng "gùi đầy".
- [x] Phím **E** mở cửa sổ xem gùi (2 hàng × 9, rê chuột thấy tên món). **Chưa cần kéo thả** (Giả định — để chặng 4).
- [x] Khởi đầu có sẵn hạt `startSeeds` trong hotbar.
- [x] Juice: tưới có giọt nước + tiếng `tuoi-nuoc-1/2`; hái thì cây bật lên, icon bay vào hotbar, ô hotbar nảy.
- [x] Để thử ngay không chờ ngủ: **phím thử G (chỉ bản dev)** cho mọi ô đã tưới lớn thêm 1 ngày. Logic gieo/tưới/lớn/hái có unit test.

**Ghi chú D-022:** gieo, tưới, hái, dọn **giữ nhanh** (`actionDuration` 0.4 s, hàng chờ `actionQueueMax` 4, vừa giữ chuột vừa đi WASD được như T-002 cũ) — chỉ cuốc là việc nặng. Một lần giữ chuột rê chỉ làm một loại việc theo ô bấm đầu tiên (GDD §3.3). Ô cuốc dở (chưa đủ 6 nhát) **không gieo được**; click vào = cuốc tiếp. Dọn cây héo → ô về đất chưa cuốc (`tillStrikes` = 0).

**Thông số / ghi chú:** dùng `staminaCost*` chưa trừ (T-004). Thêm `bagSlotsStart` (18), `stackMax` (20), `startSeeds` ({ "rau-cai": 6, "khoai-lang": 3 } — id theo `crops.json`), `devCheatsEnabled` (true khi chạy dev, false khi build). Dữ liệu cây: `src/data/crops.json` (đã có).

**Bạn thử thế nào:** mở http://localhost:5173. Bấm phím 1 chọn hạt cải, click ô đã cuốc: thấy chấm hạt. Click lại ô đó: tưới, đất sẫm. Bấm **G** (phím thử): cải chín. Click: cải bay vào hotbar. Bấm **E**: thấy gùi có cải. Thử phím 2 gieo khoai lang, bấm G hai lần mới chín (**nhớ tưới lại trước lần G thứ hai** — G là "qua đêm" thật: cây chỉ lớn nếu hôm đó được tưới, không tưới thì khát, khát 2 đêm liền thì héo).

**Ghi chú khi làm (game-dev, 2026-10-10) — T-003 → 👀 chờ bạn thử:** Click ô ruộng → {ten} tự chọn việc theo bảng GDD §3.3 (`jobFor`): chưa cuốc / cuốc dở → cuốc (vẫn 6 nhát, D-022); đã cuốc trống → gieo; có cây chưa tưới → tưới; chín → hái; héo → dọn. Gieo/tưới/hái/dọn là **việc nhanh** (`actionDuration` 0.4 s, hàng chờ `actionQueueMax` 4), không khóa chân, WASD không bỏ dở; một lần giữ chuột chỉ làm một loại việc theo ô bấm đầu (đang cuốc thì không nhận gieo/tưới và ngược lại). Hái → ô về đất chưa cuốc (`harvestResetsSoil`, `tillStrikes` 0); dọn cây héo cũng vậy. **Logic thuần + unit test:** `src/systems/farm.ts` (thêm `crop`/`watered` cho mỗi ô, `jobFor`, `plantSeed`, `waterPlot`, `harvestPlot`, `clearWithered`, `cropStage`, `advanceDay` = hàm "qua đêm" cho T-007: tưới → +1 ngày; không tưới → +1 đêm khát, đủ `unwateredDaysToWither` → héo; cây chín không hỏng; mọi ô bỏ "đã tưới"; ô cuốc dở giữ nhát theo `tillProgressKeepsOvernight`), `src/systems/inventory.ts` (gùi 18 ô, hàng đầu = hotbar, chồng `stackMax`, thêm vào ô cùng loại rồi ô trống đầu tiên, bớt, chọn ô 1–9 / cuộn vòng quanh), `src/systems/items.ts` (món hạt `hat-<cây>` / nông sản `<cây>` suy từ `crops.json`, `pickSeedSlot`, gùi khởi đầu), `src/systems/crops.ts`, `tileAction.ts` thêm `kind` (cả hàng chờ chung một loại việc). **UI:** `GardenHudScene.ts` vẽ hotbar 9 ô giữa dưới màn (số phím góc trên, số lượng góc dưới, viền vàng ô chọn), nút "Gùi (E)" bên phải, cửa sổ gùi 2 × 9 (E/Tab mở-đóng, Esc / click ra ngoài đóng, rê chuột thấy tên món; chưa kéo thả); click ô hotbar cũng chọn ô và không xuyên xuống ruộng; mở gùi thì nhân vật đứng, việc trên ô dừng không mất nhát. Bố cục ở `src/ui/hudLayout.ts`, icon + hình cây vẽ bằng code ở `src/ui/itemArt.ts` (chỉ màu palette). Bong bóng chữ trên đầu (`showBubble`, câu ở `src/data/bubbles.json`): "Hết hạt rồi!", "Gùi đầy rồi!". **Hình cây:** hạt = 3 chấm, mầm = 2 lá (khát thì lá rũ nhạt màu + ô phủ màu đất khô), chín = rau cải bụi lá xanh / khoai lang lá + củ đỏ son, héo = xám rũ; ô đã tưới phủ mực mờ (sẫm). **Juice:** gieo — hạt rơi; tưới — giọt nước bắn + `sfx-tuoi-nuoc-1/2` lệch cao độ ±1 nửa cung; hái — cây bật lên mờ dần, icon bay vồng vào ô hotbar nhận đồ (đồ rơi xuống hàng dưới thì bay vào nút Gùi), ô đó nảy. **Phím thử G** (chỉ `npm run dev`, `devCheatsEnabled` = `import.meta.env.DEV`, bản build tắt) gọi `runOvernight` → `advanceDay`, bong bóng "(Thử) Qua một đêm…". `InputController`: phím 1–9 / E / Esc / G ghi theo sự kiện keydown (gõ nhanh không mất, giống BUG-007), cuộn chuột, `endFrame()` bỏ lần nhấn thừa. Thông số mới trong `gameConfig.ts`: `bagSlotsStart` 18, `stackMax` 20, `startSeeds` { rau-cai 6, khoai-lang 3 }, `devCheatsEnabled`, `bubbleSeconds` 1.8, `waterDropCount` 10, `waterDropLifeSeconds` 0.5, `plantSeedDropCount` 4, `wateredSoilAlpha` 0.32, `thirstySoilAlpha` 0.35, `harvestPopHeight` 0.7 ô, `harvestPopSeconds` 0.35, `harvestFlySeconds` 0.5, `hotbarBounceScale` 0.2, `hotbarBounceSeconds` 0.22. **Tự chọn (GDD chưa nói):** chưa gieo lần nào mà ô chọn không phải hạt → gieo hạt đầu tiên trong gùi; đã từng gieo mà hạt đó hết → "hết hạt rồi" (không tự đổi sang hạt khác, tránh gieo nhầm cả luống); phím G làm trọn "qua đêm" (cả khát/héo) chứ không chỉ "cây đã tưới lớn thêm". Tiếng gieo / hái đã gắn sau QA (AUD-SFX-101/102, xem changelog). Debug cho QA: `debugState.crops[]`, `farm.plots[].crop/watered`, `inventory`, `bagOpen`, `bagHoverSlot`, `bubble`, `farmJuice`, `hud` (icon bay, ô nảy, tooltip), `action.kind`, `hover.job`; hàm `debugSetSlot`, `debugAdvanceDay`, `debugHudSlotCenter`. E2E: `web/e2e/tests/crops.spec.ts` (6 ca), ảnh `web/e2e/screenshots/t003-*.png`.

---

### T-004 — Thanh Sức, "đuối", ăn khoai bằng chuột phải, bong bóng chửi thề

**Bước:** 3.3 · **Ai làm:** game-dev · **Size:** M (3–4h) · **Cần trước:** T-003

**Mục tiêu:** mỗi việc tốn Sức, hết Sức thì đi chậm và không làm được việc — để thấy "làm được bao nhiêu trong một ngày".

**Điều kiện xong:**
- [x] Thanh Sức góc trên trái, số "64/100", màu xanh lá → vàng (< 50%) → đỏ (< 20%) (GDD §11).
- [x] Cuốc −`staminaCostTill`, gieo −`staminaCostPlant`, tưới −`staminaCostWater`, hái/dọn −`staminaCostHarvest`. Đi lại không tốn.
- [x] Không đủ Sức cho việc → không làm, bong bóng "đuối rồi…".
- [x] Hết Sức → **đuối**: đi chậm còn `walkSpeed × staminaExhaustedSpeedMultiplier`, viền màn tối nhẹ.
- [x] **Chuột phải** khi ô hotbar đang chọn là đồ ăn → ăn 1 món: khoai lang sống +8 Sức (không vượt `staminaMax`), chữ "+8 Sức" xanh bay lên. Hạt giống thì chuột phải không làm gì.
- [x] **Bong bóng chửi thề** (rẻ, làm luôn): lúc vừa chuyển sang đuối luôn hiện 1 câu — "Mả cha cái bụng, réo như trống hội làng!" (story bible §6.3) — bong bóng răng cưa đỏ, lắc nhẹ, hiện `grumbleBubbleSeconds` giây, kèm tiếng `voice-cau-nhau-1/2`. Chỉ chửi 1 lần mỗi lần đuối.
- [x] Phím thử **F8 (chỉ bản dev)**: −20 Sức.

**Ghi chú D-022 (cuốc):** `staminaCostTill` = **4 Sức/ô** (không phải mỗi nhát). Bắt đầu hoặc làm tiếp một ô (kể cả ô trong hàng chờ khi tới lượt) phải có Sức ≥ 4, thiếu → không làm, "đuối rồi…", hàng chờ xóa. **Trừ 4 Sức một lần ở nhát cuối** + chữ "−4 Sức" bay lên; bỏ dở không trừ. Thêm bong bóng lầm bầm khi xong ô: xác suất `tillDoneBarkChance` (0.25), cách nhau ≥ `tillDoneBarkCooldownSeconds` (20 s), bong bóng thường (không phải răng cưa đỏ), 6 câu tạm — "Ối cái lưng tôi…", "Luống này thẳng như kẻ chỉ!", "Đất gì mà rắn như đá đình!", "Thêm luống nữa là có tiền cưới vợ!", "Mồ hôi rơi xuống, quan tiền mọc lên.", "Hừ, cuốc gỗ mà cũng phải nể tao." (≤ 40 ký tự, `game-planner` bổ sung story bible sau).

**Thông số / ghi chú:** dùng `staminaMax`, `staminaCostTill/Plant/Water/Harvest`, `staminaExhaustedSpeedMultiplier`. Thêm `grumbleBubbleSeconds` (2.5), `tillDoneBarkChance`, `tillDoneBarkCooldownSeconds`. Khoai lang cần `staminaRestore: 8` (dữ liệu món — tạo `items.json` tối thiểu nếu chưa có).

**Ghi chú khi làm (game-dev, 2026-10-10) — T-004 → 👀 chờ bạn thử:** Logic thuần + unit test: `src/systems/stamina.ts` (đủ/không đủ `canAfford`, trừ chặn ở 0 `consume`, ăn chặn trần `restore`, cờ đuối = Sức 0, báo "vừa chuyển sang đuối" để chửi đúng 1 lần, dải màu `staminaBand`, Sức từng việc `jobStaminaCost` — dọn = hái), `src/systems/bubbles.ts` (ưu tiên bong bóng: chửi thề > báo ("đuối rồi…", "hết hạt", "gùi đầy") > lầm bầm; lầm bầm theo xác suất + thời gian nghỉ, không lặp câu vừa nói). Dữ liệu: `src/data/items.json` (mới, kiểu `ItemData` ở `data/types.ts`): khoai lang `staminaRestore` 8; tên/loại món vẫn suy từ crops.json (`items.ts` thêm `staminaRestoreOf`). Câu bong bóng (`bubbles.json`): "Đuối rồi…", "Còn no lắm!", câu chửi đuối (story bible §6.3 câu 3), 6 câu lầm bầm. **Cuốc (D-022):** bắt đầu / làm tiếp / tới lượt trong hàng chờ cần Sức ≥ 4 — thiếu thì không làm, "đuối rồi…", hàng chờ xóa; trừ 4 một lần ở nhát cuối + chữ "−4 Sức" đỏ son bay lên; bỏ dở không trừ. Đang cuốc vẫn cho xếp hàng (tới lượt mới kiểm). Việc nhanh trừ 1 lúc việc xảy ra (không hiện chữ bay cho đỡ rối khi rê cả luống). **HUD:** thanh Sức góc trên trái (nhãn "Sức", ruột xanh mạ / vàng hoa hòe < 50% / đỏ son < 20%, chữ "64/100"); đuối → viền màn tối dần (gradient màu mực, `exhaustedVignetteAlpha` 0.6, hiện/tắt trong 0.5 s), đi chậm × 0.5 (anim bước tự chậm theo tốc độ thật ≈ 0.5). **Chuột phải** (ô hotbar đang chọn là đồ ăn) → ăn 1 món, "+8 Sức" xanh bay lên, ô hotbar nảy; không ngắt việc đang làm; hạt / rau cải sống / ô trống → không làm gì; đang mở gùi thì chuột phải không ăn (ăn trong gùi để chặng 4). **Chửi thề:** lúc chuyển sang đuối luôn hiện bong bóng răng cưa đỏ son, chữ trắng điệp, lắc ngang (`grumbleShakePx` 3, `grumbleShakeRate` 9), 2.5 s, tiếng `sfx-voice-cau-nhau-1/2`; đuối tiếp (F8) không chửi lại; ăn rồi đuối lại thì chửi lại. **Lầm bầm** xong ô cuốc: 0.25, nghỉ 20 s (đồng hồ scene), bong bóng thường; hết Sức đúng ô đó thì chửi, không lầm bầm. **F8** (chỉ dev): −20 Sức + chữ "−20 Sức"; bản build F8 không làm gì (đã kiểm bằng vite preview). Gợi ý phím góc dưới phải thêm "Chuột phải: ăn món đang chọn", "Phím thử: G qua đêm · F8 −20 Sức". Thông số mới trong `gameConfig.ts`: `grumbleBubbleSeconds` 2.5, `grumbleShakePx` 3, `grumbleShakeRate` 9, `staminaBarYellowBelow` 0.5, `staminaBarRedBelow` 0.2, `staminaFloatSeconds` 1, `staminaFloatRise` 0.6, `exhaustedVignetteAlpha` 0.6, `exhaustedVignetteFadeSeconds` 0.5, `devStaminaDrain` 20 (giữ `tillDoneBarkChance` 0.25, `tillDoneBarkCooldownSeconds` 20; `staminaMax` / `staminaCost*` / `staminaExhaustedSpeedMultiplier` khớp GDD, có unit test). **Tự chọn (GDD chưa nói):** Sức đầy thì chuột phải không ăn (khỏi phí khoai), bong bóng "Còn no lắm!"; gần đầy thì ăn và chỉ cộng tới 100 (chữ hiện số thật, vd "+4 Sức"); đang cuốc mà Sức tụt (F8) thì ô đó vẫn xong và trừ tới 0. Debug cho QA: `debugState.stamina.{current, max, exhausted, band, speedMultiplier, speedPx, curses, lastCurseSfx, tooTired, eats, barks, lastBark, barkChance, barkCooldownSeconds, floatsActive, floatLog}`, `bubble.kind/shakeX`, `hud.{staminaText, staminaBand, staminaFillColor, staminaFillRatio, vignetteAlpha, eatBounces, lastEatSlot}`; hàm `debugSetStamina(v)` (đi qua luật thật: về 0 thì chửi), `debugSetBarkTuning({ chance, cooldownSeconds })`. E2E: `web/e2e/tests/stamina.spec.ts` (7 ca dev + 1 ca bản build chạy với `QA_PROD=1`), ảnh `web/e2e/screenshots/t004-*.png`.

**Bạn thử thế nào:** mở http://localhost:5173. Cuốc vài ô, thấy thanh Sức tụt. Bấm **F8** vài lần tới khi hết Sức: nhân vật chửi bằng bong bóng đỏ, đi chậm hẳn, click ruộng thì hiện "đuối rồi…". Chọn ô hotbar có khoai, **chuột phải**: Sức tăng 8.

---

### T-005 — Đồng hồ ngày trên HUD, trời tối dần, tạm dừng (Esc / chuyển tab)

**Bước:** 3.3 · **Ai làm:** game-dev · **Size:** M (3–4h) · **Cần trước:** T-001

**Mục tiêu:** ngày trôi từ 6h tới 24h trong 10 phút thật, trời đổi màu theo giờ, game tự dừng khi bạn rời tab.

**Điều kiện xong:**
- [x] HUD góc trên phải: "Ngày 1 · Mùa nắng" + đồng hồ "14:30" + icon mặt trời/trăng (hình khối). Dùng `systems/time.ts` có sẵn.
- [x] 6h → 24h trong `dayLengthSeconds`. Đồng hồ **dừng** khi mở gùi (E), cửa sổ tạm dừng, các cửa sổ sau này (thùng bán, tổng kết).
- [x] Lớp màu trời phủ toàn màn: sáng 6–11h, trưa/chiều 11–17h, hoàng hôn 17–19h, tối 19–24h (GDD §3.1), chuyển mượt, HUD không bị phủ.
- [x] Từ `passOutWarnHour` (23h) đồng hồ nhấp nháy đỏ.
- [x] **Esc** mở cửa sổ Tạm dừng (Tiếp tục, ghi chú "Đã tạm dừng"); Esc lần nữa đóng.
- [x] **Chuyển tab / Alt+Tab / thu nhỏ trình duyệt** → tự mở Tạm dừng (`pauseOnFocusLost`); quay lại vẫn đúng giờ, không nhảy giờ.
- [x] Phím thử **F9 (chỉ bản dev)**: +1 giờ game.
- [x] Gợi ý phím góc dưới phải cập nhật: "WASD đi · Click làm · 1–9 chọn · E Gùi · Esc Menu".

**Ghi chú D-022:** đồng hồ **chạy** trong lúc cuốc (là làm việc). Tạm dừng (Esc / mất focus / mở gùi) giữa lúc đang cuốc → nhát cuốc và thanh tiến độ đứng yên, tiếp tục thì chạy đúng chỗ, không nhảy nhát. Thêm 1 ca e2e cho việc này.

**Thông số / ghi chú:** dùng `dayLengthSeconds`, `dayStartHour`, `dayEndHour`, `passOutWarnHour`, `pauseOnFocusLost`. Thêm `skyTintMaxAlpha` (0.45 — độ tối lúc nửa đêm). Prototype luôn nắng, chưa có thời tiết (Giả định).

**Ghi chú khi làm (game-dev, 2026-10-11) — T-005 → 👀 chờ bạn thử:** Logic thuần + unit test: `src/systems/time.ts` (trạng thái đồng hồ `DayClockState` {ngày, giây thật đã chạy}, tiến giờ khi không bị dừng, chạm 24h báo đúng 1 lần, F9 `addGameHours`, `setGameHour`, cảnh báo 23h, nhấp nháy, mùa + dòng "Ngày 1 · Mùa nắng", khung trời sáng/trưa-chiều/hoàng hôn/tối, màu trời nội suy giữa các mốc), `src/systems/pause.ts` (**"lý do dừng" dùng chung** `PauseReasons`: gùi `bag`, Tạm dừng `pauseMenu`; đã khai sẵn `sellBox`, `seedStall`, `daySummary`, `sleep` cho T-006/T-007 — cửa sổ mở thì `set(lý do, true)`, đóng thì `false`, đồng hồ chỉ chạy khi hết lý do; `resolveEsc` quyết định Esc làm gì; `shouldAutoPause`), `src/input/pressBuffer.ts` (bộ đệm lần nhấn của InputController, có `clearAll`). **HUD góc trên phải**: khung nâu đất, "Ngày 1 · Mùa nắng", icon mặt trời (vàng hoa hòe) / trăng khuyết (trắng điệp, từ 19h), giờ "14:30" chữ to; từ 23h chữ giờ nháy đỏ son ↔ trắng điệp (`clockBlinkRate` 2 lần/giây). **Màu trời**: lớp phủ trong GardenScene (dưới thanh tiến độ cuốc, chữ bay, bong bóng; HUD là scene khác nên không bị phủ), mốc `skyTintKeyframes`: 6h xanh sương nhẹ → 8–11h vàng rất nhẹ → 11–15h trong → 17h vàng chiều → 18h đỏ son → 19h chàm → 24h chàm đậm 0.45. **Đồng hồ** chạy theo giây thật giữa hai frame (`rawDelta`, chặn `dayClockMaxStepSeconds` 0.25/frame — Phaser làm mượt `delta` nên máy chậm/vừa quay lại tab sẽ chậm giờ), chạy cả lúc cuốc, dừng khi mở gùi / Tạm dừng. **Tới 24:00 (tạm, tới T-007):** đồng hồ đứng ở 24:00, vẫn nháy đỏ, vẫn chơi tiếp được, không ngủ gục; `debugState.time.dayEndHits` đếm lần chạm. **Tạm dừng**: Esc (gùi đóng) → cửa sổ "Đã tạm dừng" + "Đồng hồ ngày đang đứng yên" + nút **Tiếp tục** (rê chuột vào sáng vàng) + "Esc: chơi tiếp"; Esc / click nút để chơi tiếp. Gùi mở thì Esc chỉ đóng gùi. Mất focus (`window blur` — Alt+Tab) hoặc ẩn tab (`visibilitychange` — đổi tab, thu nhỏ) → tự mở Tạm dừng (`pauseOnFocusLost`); nếu đang mở gùi thì Tạm dừng nằm trên gùi (Esc đầu đóng Tạm dừng, Esc sau đóng gùi). Lúc dừng cả thế giới đứng yên: việc trên ô + thanh tiến độ cuốc (không nhảy nhát, D-022), bụi, mồ hôi, giọt nước, bong bóng, chữ bay, vật lý, anim nhân vật; **mọi phím/chuột bấm trong lúc dừng bị bỏ** (E, Tab, G, F8, F9, 1–9, cuộn, chạm WASD, chuột phải) để không "lọt" sang lúc chơi tiếp; vừa bấm "Tiếp tục" mà còn giữ chuột không tính là click xuống ruộng. Nhạc nền nhỏ lại còn 35% khi Tạm dừng (`pauseMusicVolumeMultiplier`), chơi tiếp thì về như cũ (Phaser tự tắt tiếng khi cửa sổ mất focus). **F9** (chỉ dev): +1 giờ (`devAddHours`), không tác dụng khi mở gùi. **Gợi ý phím** góc dưới phải: dòng chính "WASD đi · Click làm · 1–9 chọn · E Gùi · Esc Menu" nằm ngay trên nút gùi (dòng dài không vừa khe bên phải nút), dưới là "Chuột phải: ăn món đang chọn" và (bản dev) "Phím thử: G qua đêm" / "F8 −20 Sức · F9 +1 giờ". Thông số mới trong `gameConfig.ts`: `skyTintMaxAlpha` 0.45, `skyPhaseStarts` {11, 17, 19}, `skyTintKeyframes`, `dayClockMaxStepSeconds` 0.25, `clockBlinkRate` 2, `devAddHours` 1, `pauseMusicVolumeMultiplier` 0.35. Debug cho QA: `debugState.time.{day, hour, clockText, dayText, phase, elapsedSeconds, dayOver, dayEndHits, warn, stopped, reasons, devHourPresses}`, `sky.{color, alpha, visible}`, `pause.{menuOpen, cause, hoverResume, opens, musicVolume}`, `hud.{clockText, dayText, clockColor, clockWarn, clockIcon, clockBounds, pauseVisible, pauseButtonHover, hintLines, hintBounds, hudRects}`; hàm `debugSetHour(h)`, `debugSetPauseMenu(open)`. E2E: `web/e2e/tests/time.spec.ts` (8 ca dev + 1 ca bản build với `QA_PROD=1`), ảnh `web/e2e/screenshots/t005-*.png`. Playwright chỉ giả lập được sự kiện đổi tab / blur — bạn cần thử thật.

**Bạn thử thế nào:** mở http://localhost:5173. Nhìn đồng hồ góc trên phải chạy (khoảng 33 giây thật = 1 giờ game). Bấm **F9** nhiều lần: trời chiều vàng rồi tối dần; tới 23h đồng hồ nhấp nháy đỏ. Chuyển sang tab khác 10 giây rồi quay lại: game đang tạm dừng, giờ không nhảy. Bấm Esc để chơi tiếp.

---

### T-006 — Thùng bán, tiền và sạp hạt tạm

**Bước:** 3.3 · **Ai làm:** game-dev · **Size:** M (3–4h) · **Cần trước:** T-003, T-005

**Mục tiêu:** có chỗ bỏ hàng để bán cuối ngày và chỗ mua hạt — khép vòng "trồng → bán → mua hạt → trồng nhiều hơn".

**Điều kiện xong:**
- [x] HUD góc trên trái có **tiền**: icon xu + số quan, khởi đầu `startMoney`.
- [x] **Thùng bán** (hình khối cạnh nhà): click khi trong tầm, hoặc phím **F** khi đứng cạnh → cửa sổ 2 lưới: gùi ↔ thùng. Click món để chuyển 1 món, **Shift+click** chuyển cả chồng. Lấy lại được. Dòng "Cuối ngày bán được: 30 quan" tính theo giá gốc. Esc đóng; đồng hồ dừng khi mở.
- [x] Tiền trong thùng **chưa cộng ngay** — cộng ở cuối ngày (T-007).
- [x] **Sạp hạt tạm** (Giả định — hình khối "hộp hạt" ở cổng vườn, **không phải NPC**, thay quán chị Thóc cho prototype): click/F → cửa sổ 2 nút "Hạt cải — 4 quan", "Hạt khoai lang — 8 quan" (giá từ `crops.json`). Thiếu tiền thì nút xám. Mua xong hạt vào gùi, tiền giảm, có tiếng `nhat-xu`.
- [x] Tiền không bao giờ âm (unit test).

**Thông số / ghi chú:** dùng `startMoney` (60). Giá bán: rau cải 10, khoai lang 22 (`crops.json`). Không cần asset mới.

**Ghi chú khi làm (game-dev, 2026-10-11) — T-006 → 👀 chờ bạn thử:** Logic thuần + unit test: `src/systems/economy.ts` (ví tiền `Wallet`: số nguyên ≥ 0, `spend` từ chối khi thiếu tiền, `earn` bỏ số âm; giá bán gốc `sellPriceOf` / giá hạt `seedPriceOf` từ `crops.json`; `sellBoxTotal`; **hàm "bán thùng" `sellBoxContents`** — bán hết, cộng tiền, trả từng dòng cho màn tổng kết; `buySeeds` mua được bao nhiêu mua bấy nhiêu theo tiền + chỗ trống, không bao giờ trừ tiền mà không có hạt), `inventory.moveFromSlot` (chuyển món gùi ↔ thùng, bên nhận đầy thì phần dư nằm lại, không mất/sinh đồ), `src/systems/interact.ts` (vật tương tác: click trong `interactRange` tính tới tâm ô gần nhất của vật; phím F khi tâm hộp chân cách MÉP vật ≤ `interactKeyRange` 1 ô = đứng ô kề, kể cả chéo; nhiều vật lấy vật gần nhất), `pause.resolveEsc` thêm `closeShop`. **Thùng bán** (ô 17,11, cạnh góc dưới-phải nhà, dời 1 ô so với khung chừa chỗ T-001 để không chắn lối đi dọc tường đông — test trượt tường BUG-001): thùng gỗ có đồng xu, bảng tên "Thùng bán", **có va chạm**. Click khi trong tầm hoặc F khi đứng cạnh → cửa sổ 2 lưới **Gùi (trái, 2×9, hàng trên = hotbar) ⇄ Thùng bán (phải, 2×9 = `sellBoxSlots` 18)**; click = 1 món, **Shift+click = cả chồng**, click ô bên thùng = lấy lại; dòng vàng **"Cuối ngày bán được: N quan"** (giá gốc); dòng báo hiện tên + giá món dưới chuột ("Rau cải · 10 quan/món"). **Hạt giống KHÔNG bỏ vào thùng được** ("Hạt giống không bán được") — Giả định: GDD §3.9 chỉ nói bán theo giá gốc, `crops.json` chỉ có giá bán nông sản; tránh mua hạt rồi bán lại. Lấy lại khi gùi đầy → "Gùi đầy rồi!" (dòng báo + bong bóng). **Tiền thùng chưa cộng**: hàm `sellBoxContents` viết sẵn + test nhưng **chưa nối** vào phím G / `advanceDay` — T-007 gọi lúc qua đêm (GDD: cuối ngày bán, hiện ở tổng kết). **Sạp hạt tạm** (ô 13–15 × 26–27, cổng dưới vườn, D-019: bàn gỗ 3 bao hạt, không NPC, bảng tên "Sạp hạt", có va chạm): cửa sổ "Sạp hạt" + tiền đang có, nút **"Hạt cải — 4 quan"**, **"Hạt khoai lang — 8 quan"** (giá từ `crops.json`, tên ngắn + danh sách ở `src/data/seedStall.json`) + "Có: N" trong gùi; rê chuột sáng vàng; **thiếu tiền nút xám** (bấm → "Không đủ tiền"); mua xong hạt vào gùi (icon bay vào hotbar), tiền giảm, tiếng `sfx-nhat-xu-1/2`, chữ "−4 quan" bay cạnh ô tiền; **Shift+click mua tối đa 5** (`seedBulkBuyCount`, thiếu tiền/chỗ thì mua được bao nhiêu hay bấy nhiêu); gùi đầy → không mua, không mất tiền, bong bóng "Gùi đầy rồi!". Hai cửa sổ: Esc / F / click ra ngoài khung để đóng; mở = lý do dừng `sellBox` / `seedStall` (đồng hồ đứng, nhân vật đứng, việc trên ô đứng yên như gùi; E, G, F8, F9, chuột phải không tác dụng); mất focus lúc đang mở → Tạm dừng nằm trên (Esc đầu đóng Tạm dừng, Esc sau đóng cửa sổ). **Click ưu tiên**: con trỏ trên thùng/sạp → viền bao cả hình vật (nằm trên vật; sáng trong tầm, xám ngoài tầm), click không bao giờ thành việc trên ruộng. **HUD**: ô tiền (icon xu vàng lỗ vuông + "60 quan") ngay dưới thanh Sức; gợi ý phím thêm dòng thứ hai "F mở thùng bán / sạp hạt · Shift+click: cả chồng" (24px, dưới dòng chính, trên nút gùi). Chữ trong cửa sổ ≥ 24px. Thông số mới `gameConfig.ts`: `startMoney` 60, `sellBoxSlots` 18, `interactKeyRange` 1, `seedBulkBuyCount` 5, `shopNoticeSeconds` 2.2, `moneyFloatSeconds` 1.2, `moneyFloatRisePx` 20. Bố cục: `hudLayout.ts` (`moneyPanelRect`, `sellPanelRect/sellSlotRect/sellSlotAt`, `stallPanelRect/stallButtonRect/stallButtonAt`). Debug cho QA: `debugState.money.{current, revision, purchases, lastCoinSfx}`, `shop.{window, status, statusWarn, opens, keyPresses, nearby}`, `sellBox.{slots, total, hover, transfers}`, `seedStall.{buttons, hoverButton}`, `hover.object`, `hud.{moneyText, moneyFloat, sellBoxVisible, seedStallVisible, sellTotalText, shopStatusText, sellBoxCounts, stallButtons, shopMinFontPx, hudRects.money}`; hàm `debugSetMoney(n)`, `debugSetSellBoxSlot(i, id, n)`, `debugSellSlotCenter(side, i)`, `debugStallButtonCenter(i)`, `debugSellBoxNow()` (xem trước việc T-007). E2E: `web/e2e/tests/economy.spec.ts` (6 ca), ảnh `web/e2e/screenshots/t006-*.png`.

**Bạn thử thế nào:** mở http://localhost:5173. Hái vài cây (dùng phím G cho nhanh). Đi tới thùng bán, bấm **F**: click cải để bỏ vào thùng, thấy dòng "Cuối ngày bán được…". Shift+click để bỏ cả chồng. Đi tới hộp hạt ở cổng, bấm F, mua 1 hạt cải: tiền giảm 4.

---

### T-007 — Ngủ, ngủ gục sau 24h, sang ngày mới (cây lớn, héo) và tổng kết ngày

**Bước:** 3.3 · **Ai làm:** game-dev · **Size:** L (1 ngày) · **Cần trước:** T-004, T-006

**Mục tiêu:** chơi trọn một ngày và bước sang ngày 2 — cây lớn qua đêm, tiền bán được hiện ở màn tổng kết.

**Điều kiện xong:**
- [x] **Giường** trong nhà: click/F từ `earliestSleepHour` (18h) → hỏi "Đi ngủ?" (Có/Không). Trước 18h: bong bóng "Còn sớm, ngủ gì giờ này".
- [x] **Ngủ gục**: tới `dayEndHour` (24h) mà chưa ngủ → màn tối dần, nhân vật nằm ra đất, "Zzz" → sáng hôm sau tỉnh dậy **ở nhà** với Sức = `staminaMax × passOutStaminaRatio` (70) và **luôn** có bong bóng chửi: "Mả cha nó, ngủ với muỗi cả đêm, lưng như bị trâu giẫm!" (GDD §3.12). Không mất tiền, không mất đồ.
- [x] **Qua đêm**: ô đã tưới → cây lớn +1 ngày; ô đã gieo mà không tưới → cộng 1 ngày khát (ô màu khô, lá rũ); khát `unwateredDaysToWither` (2) ngày liền → **héo** (màu xám, click để dọn). Cây chín để đó không hỏng. Mọi ô bỏ trạng thái "đã tưới".
- [x] Đồ trong thùng bán → bán hết, cộng tiền.
- [x] **Màn tổng kết ngày** (GDD §7): từng dòng trượt vào — "Bán được: 52 quan" (số đếm lên, tiếng "tách tách" nếu có, không có thì im), "Cây chín sáng nay: 3", cảnh báo "2 ô chưa tưới hôm qua", "Ngủ gục ngoài đồng" nếu có. Nút **"Ngày mới"** (Enter).
- [x] Ngày mới: 6h, ngày +1, Sức đầy (hoặc 70% nếu ngủ gục), nhân vật đứng cạnh giường.
- [x] Phím thử G (T-003) gọi chung hàm "qua đêm" với lúc ngủ. Logic qua đêm có unit test (lớn, khát, héo, bán).

**Ghi chú D-022:** qua đêm, ô **cuốc dở giữ nguyên số nhát** (`tillProgressKeepsOvernight` true); ô đã cuốc chưa gieo giữ nguyên. Ngủ gục giữa lúc đang cuốc (24h) → dừng như bỏ dở. Thêm 1 unit test cho ô cuốc dở qua đêm.

**Thông số / ghi chú:** dùng `earliestSleepHour`, `dayEndHour`, `passOutStaminaRatio`, `unwateredDaysToWither`, `harvestResetsSoil`, `tillProgressKeepsOvernight`.

**Ghi chú khi làm (game-dev, 2026-10-12) — T-007 → 👀 chờ bạn thử:** **Một hàm qua đêm duy nhất** `src/systems/overnight.ts` `runOvernight(world, cause, cfg)` (cause = `sleep` | `passout` | `devG`): đếm ô đã gieo mà hôm qua chưa tưới → `farm.advanceDay` (lớn / khát / héo, bỏ "đã tưới", ô cuốc dở giữ nhát, ô đã cuốc chưa gieo giữ nguyên) → `economy.sellBoxContents` (bán hết thùng, cộng tiền) → ngày +1, đồng hồ về 6:00 → Sức: ngủ / G = đầy, ngủ gục = `staminaMax × passOutStaminaRatio` = 70 (hết "đuối"). Không đụng gùi, không trừ tiền. Trả về số liệu cho tổng kết (tiền + từng dòng bán, cây chín sáng nay, ô chưa tưới hôm qua, cây héo đêm nay, ngủ gục, ngày mới, đổi mùa, Sức mới). Unit test `overnight.test.ts` (lớn, khát, héo 2 đêm, chín để đó không hỏng, bán thùng, cuốc dở giữ nhát, ô đã cuốc giữ nguyên, Sức đầy/70, đuối → hết đuối, ngày +1 về 6:00, đổi mùa ngày 5, giờ được ngủ). Màn tổng kết thuần TS `src/systems/daySummary.ts` (+ test): dòng "Bán được: N quan" (số đếm lên trong `summaryCountSeconds`), dòng chi tiết "Rau cải ×3 · Khoai lang ×1", "Cây chín sáng nay: N", cảnh báo "N ô chưa tưới hôm qua", "N cây đã héo — click để dọn", "Ngủ gục ngoài đồng — sáng nay Sức 70/100", "Mùa mưa tới rồi!" (nếu ngày mới là đầu mùa); dòng thứ i trượt vào sau i × `summaryLineIntervalSeconds`. **Giường** = vật tương tác thứ 3 trong `interact.ts` (click trong tầm / F khi đứng cạnh, viền bao cả giường): trước 18h bong bóng "Còn sớm, ngủ gì giờ này"; từ 18h hộp **"Đi ngủ?"** — "Có (Enter)" / "Không (Esc)" (click nút cũng được). Có → màn tối dần (`sleepFadeSeconds` 1.2) + "Zzz" → tổng kết. **Ngủ gục** nối vào `onDayEndReached` (24h, kể cả khi F9 đẩy tới): đang cuốc → bỏ dở như WASD (giữ nhát), đóng gùi / thùng bán / sạp hạt, tắt bong bóng, nhân vật nghiêng 90° nằm ra đất (xoay sprite bằng code — chưa có hình nằm), 3 chữ "Z" bay lên, màn tối dần trong `passOutSeconds` 3 → tổng kết. Lưu ý: lúc chơi thật đồng hồ ĐỨNG khi mở gùi / thùng / sạp nên không thể chạm 24h lúc đang mở cửa sổ — đóng cửa sổ ra thì mới ngủ gục; việc "đóng mọi cửa sổ" vẫn làm cho chắc (thử bằng hook `debugTriggerDayEnd`). **Tổng kết**: lớp mực phủ kín, khung giữa màn "Hết Ngày 1" / "Sáng mai: Ngày 2 · Mùa nắng", chữ ≥ 24px; đếm tiền có tiếng "tách" (tạm dùng `sfx-nhat-xu` nhỏ + cao 7 nửa cung, cách nhau ≥ `summaryTickSeconds`); nút **"Ngày mới (Enter)"**. **Bấm Enter / click khi các dòng còn đang trượt → hiện hết ngay (lần 1), lần 2 mới sang ngày** (Giả định — chống lỡ tay bỏ qua tổng kết). Lý do dừng đồng hồ: `sleep` suốt chuỗi đêm (hỏi ngủ, thiếp đi, ngủ gục, thức dậy) + `daySummary` lúc tổng kết. Esc lúc hộp hỏi = Không; lúc đang ngủ / tổng kết Esc không làm gì (mất focus thì Tạm dừng vẫn hiện trên cùng). **Sáng ra**: đứng ở ô `wakeSpot` (7,5) ngay dưới giường (thêm vào `gardenLayout.json`), mặt hướng xuống, camera nhảy về nhà, màn sáng dần `wakeFadeSeconds` 0.8; đồng hồ 6:00 chạy tiếp; nhạc không ngắt. Ngủ gục → **luôn** bong bóng chửi răng cưa đỏ "Mả cha nó, ngủ với muỗi cả đêm, lưng như bị trâu giẫm!" + tiếng càu nhàu (`bubbles.json` `grumblePassOut`). **Phím G (D-023 đổi): G giờ gọi CHUNG hàm qua đêm nên CÓ bán thùng + ngày +1 + về 6:00 + Sức đầy**, nhưng "im lặng": không màn tối, không tổng kết, không dời về giường, chỉ bong bóng "(Thử) Qua một đêm…" — để thử nhanh (Giả định). Thông số mới `gameConfig.ts`: `sleepFadeSeconds` 1.2, `passOutSeconds` 3, `passOutTipSeconds` 0.45, `passOutTipDegrees` 90, `wakeFadeSeconds` 0.8, `zzzRiseSeconds` 1.4, `zzzIntervalSeconds` 0.45, `summaryLineIntervalSeconds` 0.45, `summaryLineSlideSeconds` 0.35, `summaryLineSlidePx` 140, `summaryCountSeconds` 1.2, `summaryTickSeconds` 0.11, `summaryTickVolume` 0.35. Phím Enter = hành động `accept` trong `InputController`. Bố cục `hudLayout.ts`: `sleepPromptRect/sleepButtonRect/sleepButtonAt`, `summaryPanelRect/summaryLineY/summaryDetailY/summaryButtonRect`. Debug cho QA: `debugState.night.{phase, overnights, lastCause, sleepPromptOpen, sleepPromptHover, tooEarly, passingOut, passedOut, fade, heroAngle, zzz, wakes, summaryAccepts, summaryTicks, summary{data, lines, detail, moneyShown, allRevealed, hoverButton}, lastSummary}`, `hud.{sleepPromptVisible, nightOverlayAlpha, zzzVisible, summaryVisible, summaryTitle, summarySubtitle, summaryLines, summaryDetail, summaryButtonText, nightMinFontPx}`; hàm `debugTriggerDayEnd()`, `debugSleepButtonCenter('yes'|'no')`, `debugSummaryButtonCenter()`; `debugAdvanceDay()` = như phím G. E2E: `web/e2e/tests/day.spec.ts` (11 ca), ảnh `web/e2e/screenshots/t007-*.png`. Sửa e2e cũ theo hành vi mới: `time.spec` + `qa-t005` Q3/Q12 (24h giờ là ngủ gục), `qa-t004` Q1 (qua đêm = Sức đầy), `qa-t006` (G có bán thùng).

**Bạn thử thế nào:** mở http://localhost:5173. Gieo và tưới 3 ô cải, bỏ 1 món vào thùng bán. Bấm **F9** tới 18h, vào nhà click giường, chọn "Có": thấy màn tổng kết có tiền bán; bấm Enter → Ngày 2, cải đã chín. Thử lần nữa: không ngủ, F9 tới 24h → nhân vật ngủ gục, sáng ra Sức 70/100 và chửi một câu.

---

### T-008 — Tự lưu trong trình duyệt, F5 vào lại đúng chỗ, đúng giờ

**Bước:** 3.3 · **Ai làm:** game-dev · **Size:** M (3–4h) · **Cần trước:** T-007

**Mục tiêu:** tắt tab hoặc bấm F5 rồi mở lại vẫn chơi tiếp đúng ngày, đúng giờ, đúng chỗ, ruộng và gùi còn nguyên.

**Điều kiện xong:**
- [x] Save là một object JSON có số `version` (GDD §12): tên nhân vật, ngày, giờ, Sức, tọa độ, trạng thái từng ô ruộng, gùi + ô hotbar đang chọn, thùng bán, tiền. Ghi vào **localStorage**.
- [x] Tự lưu: mỗi `autoSaveIntervalSeconds` (30 giây), khi tạm dừng / mất focus, khi đóng tab hoặc F5 (`visibilitychange` / `pagehide`), sau màn tổng kết ngày.
- [x] Mở game: có save thì nạp lại đúng như cũ; không có thì bắt đầu Ngày 1.
- [x] Cửa sổ Tạm dừng (Esc) có dòng "Đã lưu lúc 14:30" và nút **"Chơi lại từ đầu"** (hỏi xác nhận) để xóa save khi thử.
- [x] Save hỏng / sai `version` → không treo game, bắt đầu mới và ghi cảnh báo trong console.
- [x] Hàm tạo/đọc save có unit test (lưu → đọc ra giống hệt). Cấu trúc save đặt ở chỗ dùng chung được (`web/shared` nếu hợp) để bước 3.4 gửi lên server không phải viết lại.

**Ghi chú D-022:** save lưu `tillStrikes` (0…6) của từng ô để ô cuốc dở còn nguyên sau F5. Đang cuốc mà F5 → vào lại ô đó là cuốc dở (nhát chưa chạm không tính), hàng chờ không lưu.

**Thông số / ghi chú:** dùng `autoSaveIntervalSeconds`. Lưu server: **để bước 3.4**.

**Ghi chú khi làm (game-dev, 2026-10-12) — T-008 → 👀 chờ bạn thử:** **Cấu trúc save dùng chung** ở `web/shared/src/save/gameSave.ts` (`@bph/shared`, bước 3.4 gửi đúng object này): `GAME_SAVE_VERSION` = 1, kiểu `GameSave` { `version`, `savedAt` (giờ thật ISO), `player` { `name` ({ten}, hiện là "Tý" mặc định), `area` ('garden'), `x`, `y` (px giữa hộp chân), `facing` }, `clock` { `day`, `elapsedSeconds` (giây đồng hồ đã chạy trong ngày → giờ game) }, `stamina` { `current`, `max`, `exhausted` }, `money`, `farm.plots[]` { `x`, `y`, `soil`, `tillStrikes`, `crop` { `cropId`, `age`, `dryDays`, `withered` } | null, `watered` }, `inventory` { `slots[]` ({ `id`, `count` } | null), `selected`, `lastSeedId` }, `sellBox.slots[]` }; `serializeGameSave` / `parseGameSave` / `validateGameSave` kiểm **hình dạng** viết tay (không thư viện), `SAVE_MIGRATIONS` khung nâng phiên bản (hiện chưa có bước nào; save mới hơn game → hỏng). **Luật game khi nạp** ở client `src/systems/save.ts` (`captureSave` / `applySave`): ô ruộng ghép theo toạ độ, món / cây lạ bị bỏ, `tillStrikes` kẹp (ô dở ≤ 5, ô đã cuốc = 6), cây chỉ trên đất đã cuốc, số lượng ≤ `stackMax`, ô hotbar kẹp, tiền / Sức kẹp (trần Sức theo game, không theo save), giờ < 24:00, toạ độ ngoài khu / trúng vật cản → đứng ở chỗ xuất phát. **localStorage** ở `src/net/saveLocal.ts`: khóa `bph-save`; save hỏng / JSON lỗi / sai version / thiếu trường → `console.warn` (không phải error), chép nguyên chuỗi sang khóa `bph-save-corrupt` để soi, xóa khóa chính, game bắt đầu Ngày 1; kho bị chặn / đầy → chỉ cảnh báo, game vẫn chạy. **Khi nào lưu** (GardenScene): mỗi `autoSaveIntervalSeconds` 30 giây THẬT lúc chơi bình thường; mở Tạm dừng bằng Esc; mất focus (`blur`), ẩn tab (`visibilitychange`), đóng tab / F5 (`pagehide` + `beforeunload`); bấm "Có" ở hộp "Đi ngủ?" (bản trước khi ngủ); **ngay lúc qua đêm xong** (ngủ / ngủ gục — bản "sáng hôm sau": nhân vật ghi ở ô cạnh giường, mặt hướng xuống, thùng đã trống, tiền đã cộng); sau "Ngày mới"; phím G. **Không lưu giữa chuỗi đêm** (thiếp đi → tổng kết → thức dậy): ngoài bản chụp lúc qua đêm, mọi lần xin lưu khác bị bỏ (`save.skipped`). Nhờ vậy F5 lúc màn đang tối dần → vào lại bản trước khi ngủ (thùng còn nguyên, chưa cộng tiền); F5 lúc đang xem tổng kết / đang sáng dần → vào lại sáng hôm sau (tiền cộng đúng một lần, không thấy lại màn tổng kết) — không có bản "nửa nọ nửa kia" nên không mất / nhân đôi tiền. **Không lưu (cố ý):** hàng chờ việc, nhát cuốc đang giơ chưa chạm (ô = số nhát đã chạm, D-022), cửa sổ đang mở (gùi, thùng, sạp, hộp hỏi ngủ, Tạm dừng), bong bóng, nghỉ lầm bầm. **Mở game:** nạp save trước khi dựng ruộng / nhân vật → đúng ô ruộng (cả ô cuốc dở, cây khát, cây héo), gùi + ô chọn + hạt gieo lần trước, thùng bán, tiền, Sức (+ đuối), ngày, mùa, giờ + lớp trời theo giờ, vị trí + hướng mặt. **Cửa sổ Tạm dừng** cao thêm (nút "Tiếp tục" giữ đúng chỗ cũ): dòng vàng **"Đã lưu lúc 14:30 · Ngày 2"** (giờ GAME của lần lưu gần nhất — so được với đồng hồ HUD; chưa lưu thì "Chưa lưu lần nào"), nút đỏ **"Chơi lại từ đầu"** → hộp **"Chơi lại từ đầu?"** "Xóa bản lưu, quay về Ngày 1. Không lấy lại được." — **"Có, xóa"** / **"Không (Esc)"** (Esc = Không; Enter KHÔNG chọn Có để tránh lỡ tay). Có → xóa save, ngừng ghi, dựng lại Vườn + HUD bằng **instance scene mới** (scene.restart của Phaser dùng lại object cũ nên ruộng / gùi không về Ngày 1) — e2e đếm listener trên window/document qua CDP trước/sau 2 lần chơi lại: bằng nhau (không rò). Chữ ≥ 24px. Thông số: dùng `autoSaveIntervalSeconds` 30 (đã có), không thêm số mới. Bố cục `hudLayout.ts`: `PAUSE_WINDOW` thêm `savedLineY/resumeY/restartY…`, `pauseRestartButtonRect`, `restartConfirmRect/restartConfirmButtonRect/restartConfirmButtonAt`. `pause.resolveEsc` thêm `closeRestartConfirm`. Debug cho QA: `debugState.save.{saveKey, lastSaveAt{day, hour, clockText, savedAt, reason}, saveCount, loadedFromSave, loadStatus, loadReason, loadedElapsedSeconds, suppressed, autoSaveIntervalSeconds, autoSaveIn, skipped}`, `pause.{hoverRestart, restartConfirmOpen, restartConfirmHover, savedText}`, `hud.{pauseSavedText, pauseRestartHover, restartConfirmVisible}`; hàm `debugSaveNow()`, `debugCorruptSave('json'|'version'|'missing')` (ghi bản hỏng + ngừng ghi để reload đọc đúng bản đó), `debugClearSave(keepSaving?)` (mặc định ngừng ghi tới lúc tải lại — test muốn reload vào Ngày 1 sạch thì gọi trước `page.reload()`), `debugSetAutoSaveInterval(s)`, `debugReadSave()`, `debugPauseButtonCenter('resume'|'restart'|'confirmYes'|'confirmNo')`. Unit test `src/systems/save.test.ts` (13 ca: lưu → JSON → nạp → lưu lại deep equal cho trạng thái phong phú + Ngày 1, save là bản sao, JSON lỗi / sai version / 18 kiểu thiếu-sai trường, luật game khi nạp, gùi dư ô, kho localStorage giả: ghi-đọc, hỏng → warn + backup, kho ném lỗi). E2E: `web/e2e/tests/save.spec.ts` (12 ca), ảnh `web/e2e/screenshots/t008-*.png`. Sửa e2e cũ: `qa-t002` A-cuối gọi `debugClearSave()` trước `page.reload()` (trước đây reload = Ngày 1 mới; giờ reload nạp save). Mỗi test Playwright chạy trong browser context mới nên localStorage sạch, không dính save của nhau.

**Bạn thử thế nào:** mở http://localhost:5173. Cuốc, gieo vài ô, đi ra góc vườn, nhớ giờ trên đồng hồ. Bấm **F5**: game mở lại, nhân vật đứng đúng chỗ, giờ gần như cũ (lệch không quá 30 giây thật), ruộng và gùi còn nguyên. Esc → "Chơi lại từ đầu" → xác nhận: về Ngày 1.

---

### T-009 — Tinh chỉnh cảm giác chơi theo góp ý của bạn

**Bước:** 3.3 · **Ai làm:** game-planner + game-dev · **Size:** M (3–4h) · **Cần trước:** T-008

**Mục tiêu:** chơi trọn 1–2 ngày, nói cảm giác, đội chỉnh số cho tới khi bạn thấy "làm nông vui".

**Điều kiện xong:**
- [x] Bạn chơi ít nhất **1 ngày trọn vẹn** (10 phút, không dùng phím thử) và trả lời 5 câu: đi nhanh/chậm? tầm với đủ chưa? động tác có đã tay không? Sức có hết quá sớm/quá muộn? ngày 10 phút dài hay ngắn?
- [x] `game-planner` ghi góp ý vào `docs/playtests.md` (buổi 0 — tự chơi), quy ra thay đổi tham số cụ thể (tối đa 5–8 thay đổi một lượt). → PT-000: không cần đổi.
- [x] `game-dev` sửa **chỉ trong `gameConfig.ts`** (cần sửa code thì tách task mới); bạn chơi lại xác nhận. → Không có gì để sửa (cái cuốc trong hotbar làm riêng theo D-026).
- [x] Bảng tham số trong GDD cập nhật giá trị mới; thay đổi lớn ghi `D-NNN`. → Giá trị giữ nguyên, ghi D-028.
- [x] Ghi rõ câu trả lời "làm nông có vui không?": Có / Tạm / Chưa + lý do 1 câu. "Chưa" thì `game-planner` đề xuất 2–3 hướng sửa trước khi sang 3.4. → **Tạm**: cảm giác tay ổn, nhưng thiếu mục tiêu và thế giới.

**Thông số / ghi chú:** nút chỉnh chính: `walkSpeed`, `interactRange`, `actionDuration`, `staminaMax`, `staminaCost*`, `dayLengthSeconds`, `cameraLerp`, `screenShakeLight`. **Thêm theo D-022:** `tillStrikesPerPlot`, `tillStrikeSeconds`, `tillQueueMax`, `staminaCostTill`. Hỏi thêm câu thứ 6: "cuốc 5 giây một ô thấy **đáng công** hay **sốt ruột**?" — sốt ruột thì thử `tillStrikeSeconds` 0.7 (≈ 4,2 s) trước, rồi mới giảm số nhát; thấy dễ quá thì `staminaCostTill` 5.

**Bạn thử thế nào:** mở http://localhost:5173, Esc → "Chơi lại từ đầu". Chơi một ngày như người chơi thật: trồng hết 9 ô, mua hạt, bán đồ, ngủ. Sau đó kể lại bằng lời thường, ví dụ "đi hơi chậm", "cuốc cả luống đã tay", "tới 3h chiều là hết việc".

**Kết quả (2026-10-13) — ✅:** bạn chơi bản `e246fcd` (có cái cuốc, D-026): đi, tầm với, cuốc ≈ 5 s/ô ("đáng công"), Sức, ngày 10 phút đều ổn → **không đổi thông số nào**. Làm nông vui không: **Tạm** — cảm giác tay ổn nhưng thiếu mục tiêu ngắn hạn / phần thưởng / thế giới (giả thuyết và hướng xử lý ở `docs/playtests.md` PT-000, quyết định D-028). Ngoài thông số, đợt này có thêm cái cuốc trong hotbar + hoạt ảnh vung cuốc (D-026).

---

### T-010 — Sửa BUG-003: bấm `start.bat` là bật được cả database + server + game

**Bước:** 3.4 · **Ai làm:** backend-dev · **Size:** M (3–4h) · **Cần trước:** —

**Mục tiêu:** trên máy bạn (đang có Postgres của dự án khác chiếm cổng 5432), bấm đúp `web/start.bat` là cả 3 phần chạy, không phải gõ lệnh tay — vì từ 3.4 game cần server mới đăng nhập được.

**Điều kiện xong:**
- [x] **Cổng DB đổi được**: đọc `POSTGRES_PORT` từ `web/.env` (gitignore, có `web/.env.example`); mặc định **5433** (Giả định: tránh hẳn 5432 hay bị dự án khác chiếm). Server trong Docker vẫn nối `db:5432` bên trong mạng Docker nên không đổi gì phía code. Cập nhật mọi chỗ ghi `5432` dành cho máy (CLAUDE.md mục Web, `.env.example`, script cũ `db:up`).
- [x] `start.bat` **kiểm cổng trước khi bật**: cổng DB / 3000 / 5173 bận → báo bằng tiếng Việt dễ hiểu (cổng nào, gợi ý đổi `POSTGRES_PORT` hoặc tắt chương trình đang dùng), không bật nửa chừng.
- [x] **Thiếu `web/server/.env`** → `start.bat` tự tạo từ `.env.example` với `SESSION_SECRET` ngẫu nhiên (≥ 32 byte), báo "Đã tạo file cấu hình server lần đầu". Không bao giờ in giá trị bí mật ra màn hình / log.
- [x] Server thiếu biến bắt buộc → dừng với **một dòng lỗi dễ hiểu** (thiếu biến gì, sửa ở file nào), không phải stack trace dài.
- [x] Entrypoint container server **tự `prisma generate`** khi thiếu Prisma client (volume `node_modules` mới) rồi mới `migrate deploy`.
- [x] Thử từ trạng thái "sạch" (xóa volume `bph-nm-*`, xóa `web/server/.env`, có một Postgres khác chiếm 5432): `start.bat` → mở được http://localhost:5173, `GET /api/health` trả `{ ok: true, db: true }`.
- [x] `npm run test` + e2e hiện có vẫn xanh. BUG-003 → Đã sửa. *(test server xanh; e2e không chạy lại theo quyết định của bạn — phiên chính bảo bỏ qua e2e cho T-010)*

**Thông số / ghi chú:** không đổi `gameConfig.ts`. `start.bat` vẫn dùng được với người chưa cài gì ngoài Docker Desktop.

**Bạn thử thế nào:** tắt mọi thứ (`stop.bat`), bấm đúp `web/start.bat`. Phải thấy cửa sổ đen báo từng bước, rồi trình duyệt tự mở game. Mở thêm http://localhost:3000/api/health: thấy chữ `"db":true`. Không cần gõ lệnh nào.

**Ghi chú khi làm (2026-10-13, backend-dev):**
- Thêm `web/.env.example` (`POSTGRES_PORT=5433`); `docker-compose.yml` mặc định `${POSTGRES_PORT:-5433}`. Chưa tạo `web/.env` thật (không cần — mặc định đã là 5433). `web/server/.env.example`: `DATABASE_URL` trỏ `localhost:5433`, mật khẩu dev công khai `bph_dev_only`.
- Mới: `web/docker/preflight.ps1` (PowerShell có sẵn trong Windows, không cần cài gì): Docker chạy chưa → cổng DB/3000/5173 (bỏ qua cổng đang do chính stack bph giữ; bận thì báo **ai** chiếm: tên container Docker hoặc tên chương trình + PID, kèm cách sửa; không bật gì) → thiếu `server/.env` thì tạo từ `.env.example` (SESSION_SECRET 48 byte ngẫu nhiên base64url, DATABASE_URL khớp cổng/tài khoản DB của compose, UTF-8 không BOM), không in bí mật. Biến `BPH_SERVER_ENV_FILE` chỉ dùng để kiểm thử (trỏ file khác). `start.bat` báo Bước 1/2/3 và gọi script này; `npm run up` = `npm run preflight && docker compose up …`.
- `dev-entrypoint.sh` (chỉ container server): thiếu `server/.env` và không có `SESSION_SECRET` → một dòng `[config] …` rồi dừng; tự `prisma generate` khi thiếu `server/src/generated/prisma/client.ts` hoặc `schema.prisma`/`package-lock.json` đổi (dấu `server/src/generated/.bph-generate-hash`, gitignore).
- `src/config.ts`: `ConfigError` một dòng (`[config] Thiếu hoặc sai biến môi trường: SESSION_SECRET (thiếu) — sửa ở web/server/.env …`), không lộ giá trị; `src/server.ts` in đúng dòng đó rồi thoát, không stack trace. +2 unit test.
- Kiểm: (1) trạng thái sạch bằng một stack tách riêng (`-p bphtest`, cổng 5436/3001/5174, volume node_modules + DB **mới tinh**): build + `npm ci` + `prisma generate` + migrate → cả 3 healthy, `/api/health` `{ok:true, db:true}`, client 200; đã dọn sạch (chỉ volume `bphtest_*` của bản thử). (2) Stack thật: `stop.bat` → `start.bat` 1 phút 19 giây → 3 container healthy, DB ở 127.0.0.1:5433, dữ liệu DB giữ nguyên (không có migration chờ), `/api/health` db:true (cả qua proxy 5173), client 200; `npm run up` chạy được. (3) Thiếu `.env` mô phỏng bằng `BPH_SERVER_ENV_FILE` trỏ thư mục tạm (không đụng `.env` thật) → tạo đúng, có SESSION_SECRET ≥ 64 ký tự; server không có SESSION_SECRET → đúng một dòng `[config]`, exit 1. (4) Cổng bận: `POSTGRES_PORT` trỏ cổng do một chương trình node khác giữ → "chương trình node.exe (PID …)"; trỏ cổng của container dự án khác → 'container Docker "amano-mysql"'; `start.bat` dừng ở Bước 1, stack không bị đụng. (5) `docker compose exec server npm run test -w @bph/server`: 16/16 xanh.
- Lưu ý: `web/server/.env` cũ của bạn (tạo trước T-010) có thể vẫn ghi `DATABASE_URL` cổng **5432** — chỉ ảnh hưởng khi chạy server/test **ngoài** Docker (trong Docker không dùng dòng này). Khi cần thì sửa `5432` → `5433` trong dòng đó.

---

### T-011 — Server: đăng ký, đăng nhập, đăng xuất bằng email + mật khẩu

**Bước:** 3.4 · **Ai làm:** backend-dev · **Size:** L (1 ngày) · **Cần trước:** T-010

**Mục tiêu:** server tạo được tài khoản, nhớ người đã đăng nhập bằng cookie an toàn, và chặn người dò mật khẩu — nền cho màn đăng nhập (T-012) và Google/Facebook (T-015, T-016).

**Điều kiện xong:**
- [ ] `POST /api/auth/register` `{ email, password }`: email chuẩn hóa chữ thường + bỏ khoảng trắng, đúng dạng email; mật khẩu **8–128 ký tự**. Tạo `User` (`displayName` = phần trước @, Giả định) + `AuthAccount` provider `email` với **hash argon2id**. Đăng ký xong là đăng nhập luôn.
- [ ] Email đã có tài khoản (kể cả tài khoản tạo bằng Google/Facebook có cùng email) → **409** "Email này đã có tài khoản" — nếu tài khoản đó chỉ có Google thì thêm gợi ý "hãy đăng nhập bằng Google" (không cho gắn mật khẩu vào email chưa xác minh — D-029).
- [ ] `POST /api/auth/login`: sai email hoặc sai mật khẩu → **cùng một thông báo** "Sai email hoặc mật khẩu" (không lộ email có tồn tại hay không), thời gian trả lời gần giống nhau.
- [ ] **Phiên**: session ID ngẫu nhiên ≥ 32 byte trong cookie `bph_sid` — `httpOnly`, `SameSite=Lax`, `Path=/`, `Secure` khi chạy production; DB chỉ lưu SHA-256 (bảng `Session` đã có). Hạn **30 ngày**, tự gia hạn khi dùng (`sessionTtlDays` 30, `sessionRenewAfterHours` 24 trong config server). Phiên hết hạn bị bỏ qua và dọn định kỳ.
- [ ] `POST /api/auth/logout` xóa phiên hiện tại + xóa cookie. `GET /api/me` → thông tin tài khoản (`id`, `email`, `displayName`, danh sách `providers`) hoặc **401**.
- [ ] **Chống dò mật khẩu**: tối đa **5 lần sai / 15 phút** cho mỗi email và **20 lần / 15 phút** cho mỗi IP → **429** "Thử lại sau N phút"; đăng ký tối đa **10 / giờ / IP** (số để trong config server). Đăng nhập đúng thì xóa đếm sai của email đó.
- [ ] **Chống CSRF** (trang khác lừa trình duyệt gửi lệnh ghi): mọi lệnh POST/PUT/DELETE dưới `/api` bắt buộc `Content-Type: application/json` và header `Origin` khớp `CLIENT_ORIGIN`; sai → 403.
- [ ] `GET /api/auth/providers` → `{ email: true, google: false, facebook: false }` (google/facebook = true khi `.env` có đủ khóa — T-015/T-016).
- [ ] Type request/response ở `@bph/shared`. Không bao giờ log mật khẩu, hash, session ID, cookie.
- [ ] Test (Vitest + `app.inject`): đăng ký → `/api/me` ok; email trùng; mật khẩu ngắn; đăng nhập sai/đúng; 6 lần sai → 429; đăng xuất → `/api/me` 401; cookie hết hạn → 401; thiếu Origin → 403.

**Thông số / ghi chú:** chọn thư viện nhỏ, ít phụ thuộc (gợi ý: `@fastify/cookie`, argon2 bản có sẵn file chạy cho Linux/Windows như `@node-rs/argon2`; giới hạn số lần có thể tự viết bằng bảng trong DB hoặc bộ nhớ). Thêm thư viện thì ghi vào ghi chú task. Chưa có quên mật khẩu / xác minh email (D-029).

**Bạn thử thế nào:** task này chưa có màn hình (màn hình ở T-012). Bạn chỉ cần xem `qa-tester` báo kết quả. Muốn tự xem: mở http://localhost:3000/api/me → thấy lỗi 401 "chưa đăng nhập" là đúng.

---

### T-012 — Màn đăng nhập / đăng ký trước khi vào game

**Bước:** 3.4 · **Ai làm:** game-dev · **Size:** L (1 ngày) · **Cần trước:** T-011

**Mục tiêu:** mở game thấy màn đăng nhập theo phong cách Đông Hồ; chưa đăng nhập thì không vào được Vườn; đăng nhập rồi thì F5 vào thẳng game.

**Điều kiện xong:**
- [ ] Luồng: `Boot → Preload →` gọi `GET /api/me` → có phiên thì vào `Garden` như cũ; **401 → màn tài khoản**, không vào Garden. (Chưa có Menu chính — chặng 4.)
- [ ] **Màn tài khoản là lớp HTML đè lên game** (GDD §11, để trình duyệt tự điền mật khẩu và gõ tiếng Việt được), style theo art bible: nền giấy điệp / ảnh làng có sẵn, viền mực `#2E2118`, màu trong `palette.ts`, chữ ≥ 24px ở 1080p, co theo cửa sổ (1366×768 vẫn đủ chỗ).
- [ ] Hai thẻ **"Đăng nhập"** / **"Đăng ký"**: email, mật khẩu (nút hiện/ẩn mật khẩu), Đăng ký thêm "Nhập lại mật khẩu". Enter = gửi. Nút bấm xong thì khóa + chữ "Đang vào…" tới khi có trả lời (không gửi 2 lần).
- [ ] Lỗi hiện **chữ đỏ dưới ô**, tiếng Việt: "Sai email hoặc mật khẩu", "Email này đã có tài khoản", "Mật khẩu cần ít nhất 8 ký tự", "Hai mật khẩu không khớp", "Thử sai nhiều quá, đợi N phút", "**Không kết nối được máy chủ**" + nút "Thử lại" (server tắt / mất mạng lúc mở game — bắt buộc đăng nhập nên chưa chơi offline được, D-029).
- [ ] Nút **"Đăng nhập bằng Google"** / **"…Facebook"** chỉ hiện khi `GET /api/auth/providers` báo có (T-011) — bấm thì chuyển trang tới `/api/auth/<provider>/start` (T-015/T-016 làm phía server).
- [ ] Dòng nhỏ "Quên mật khẩu? Hiện chưa hỗ trợ — hãy tạo tài khoản mới hoặc dùng Google" (Giả định — D-029).
- [ ] Cửa sổ **Tạm dừng (Esc)** có dòng tài khoản (email hoặc "Google: tên") + nút **"Đăng xuất"** (hỏi "Đăng xuất?" Có / Không (Esc), như "Chơi lại từ đầu"). Có → lưu như khi đóng tab → `POST /api/auth/logout` → về màn tài khoản (dựng lại scene sạch như "Chơi lại", không rò listener).
- [ ] Đang chơi mà phiên hết hạn (server trả 401) → chưa cần xử lý đẹp ở task này (T-014 làm), nhưng không treo game.
- [ ] Nhạc chỉ bắt đầu sau lần click đầu (chính sách autoplay) — click trên màn tài khoản cũng tính.
- [ ] **E2E**: helper `loginAsTestUser(page)` tạo tài khoản ngẫu nhiên qua API rồi vào game; **mọi test cũ** dùng helper này và vẫn xanh. Test mới: chưa đăng nhập → thấy màn tài khoản, không có `gardenReady`; đăng ký → vào Vườn; F5 → vẫn vào thẳng; đăng xuất → về màn tài khoản; sai mật khẩu → chữ đỏ; server tắt → "Không kết nối được máy chủ".
- [ ] Debug cho QA: `registry.authState` (`checking` / `signedOut` / `signedIn`), `debugState.account`.

**Thông số / ghi chú:** ở task này save **vẫn chỉ ở localStorage `bph-save`** như T-008 (chưa tách theo tài khoản — T-014 làm). Nghĩa là tạm thời đăng xuất rồi đăng nhập tài khoản khác trên cùng máy sẽ thấy cùng một save — chấp nhận tới T-014. Gọi server qua `src/net/api.ts`, `credentials: 'same-origin'`.

**Bạn thử thế nào:** mở http://localhost:5173 → thấy màn đăng nhập, không thấy Vườn. Bấm "Đăng ký", nhập email của bạn + mật khẩu 8 ký tự trở lên → vào Vườn. Bấm F5 → vào thẳng Vườn, không hỏi lại. Esc → thấy email của bạn + nút "Đăng xuất" → bấm, chọn Có → về màn đăng nhập. Thử nhập sai mật khẩu: thấy chữ đỏ.

---

### T-013 — Server: API tải và lưu save, chống ghi đè bản cũ

**Bước:** 3.4 · **Ai làm:** backend-dev · **Size:** M (3–4h) · **Cần trước:** T-011

**Mục tiêu:** mỗi tài khoản có đúng 1 save trên server; bản cũ hơn (tab cũ, máy khác) không thể đè lên bản mới hơn.

**Điều kiện xong:**
- [ ] Bảng `Save` thêm cột **`revision Int @default(0)`** (migration mới). Mỗi lần lưu thành công `revision` + 1.
- [ ] `GET /api/save` (cần đăng nhập) → `{ save, revision, updatedAt }`; chưa có save → `{ save: null, revision: 0 }`.
- [ ] `PUT /api/save` `{ save, baseRevision }`: kiểm bằng **`validateGameSave` của `@bph/shared`** (sai → 400 kèm lý do ngắn); body > **256 KB** → 413 (GDD §12); `baseRevision` = `revision` hiện tại → lưu, trả `{ revision, updatedAt }`; **khác → 409** `{ revision, updatedAt }`, không ghi. Chưa có save + `baseRevision` 0 → tạo mới. Lưu `save` đã qua `validateGameSave` (đã nâng phiên bản) + cột `version`.
- [ ] Ghi bằng một lệnh "chỉ cập nhật khi `revision` còn khớp" (không đọc-rồi-ghi hai bước) để 2 yêu cầu cùng lúc không cùng thắng.
- [ ] Giới hạn: tối đa **60 lần lưu / phút / tài khoản** → 429 (game lưu ~2 lần/phút, dư nhiều).
- [ ] Chưa đăng nhập → 401. Kiểm CSRF như T-011. Lệnh `PUT` gửi bằng `keepalive` lúc đóng tab vẫn là PUT JSON cùng origin → nhận bình thường, không cần đường riêng.
- [ ] Test: tạo mới; lưu tiếp đúng revision; revision cũ → 409 và dữ liệu không đổi; save sai hình dạng → 400; quá 256 KB → 413; người A không đọc / ghi được save của người B; hai PUT cùng `baseRevision` gửi song song → đúng một cái thắng.

**Thông số / ghi chú:** server không kiểm luật game (đúng GDD §12 "không chống gian lận"). Không có `DELETE` — "Chơi lại từ đầu" chỉ là lưu một save Ngày 1 mới (T-014).

**Bạn thử thế nào:** chưa có gì mới trên màn hình — xem `qa-tester` báo kết quả. Phần thấy được nằm ở T-014.

---

### T-014 — Game tự lưu lên server, mất mạng vẫn chơi tiếp

**Bước:** 3.4 · **Ai làm:** game-dev · **Size:** L (1 ngày) · **Cần trước:** T-012, T-013

**Mục tiêu:** chơi ở máy này, đăng nhập ở máy khác thấy đúng tiến độ; rút mạng vẫn chơi, cắm lại thì tự gửi lên.

**Điều kiện xong (cách xử lý theo D-029):**
- [ ] **Server là bản chính.** Trên máy chỉ còn **bản đệm theo tài khoản**: localStorage `bph-save:<userId>` gồm `{ save, baseRevision, dirty }` (`dirty` = có thay đổi chưa gửi được lên server).
- [ ] **Mỗi lần lưu** (đúng các lúc của D-025: 30 s, Esc, mất focus, ẩn tab, đi ngủ, qua đêm, Ngày mới, phím G): ghi bản đệm trước (`dirty: true`), rồi gửi `PUT /api/save` — gom các lần lưu sát nhau, gửi tối đa **1 lần / `cloudSaveDebounceSeconds` (5 s)**; trừ **qua đêm, Ngày mới, đóng tab, đăng xuất** thì gửi ngay. Gửi được → cập nhật `baseRevision`, `dirty: false`.
- [ ] **Đóng tab / F5**: ghi bản đệm + gửi bằng `fetch(..., { keepalive: true })`. Gửi không kịp cũng không sao: lần mở sau bản đệm `dirty` sẽ được gửi lên.
- [ ] **Mở game sau khi đăng nhập**: lấy `GET /api/save` rồi so với bản đệm:
  - bản đệm `dirty` **và** `baseRevision` = `revision` server → dùng bản đệm, gửi lên ngay (trường hợp mất mạng / đóng tab lần trước);
  - còn lại → **dùng bản server** (ghi đè bản đệm);
  - server chưa có save → xem mục "save cũ" bên dưới; không có gì → Ngày 1.
- [ ] **Save cũ trước khi có tài khoản** (khóa `bph-save` của T-008): lần đăng nhập đầu tiên mà **server chưa có save** → đọc `bph-save`, nếu hợp lệ thì **đẩy lên tài khoản này một lần**, đổi tên khóa thành `bph-save-imported` (giữ làm bản sao, không bao giờ đẩy lại cho tài khoản khác). Server **đã có** save → giữ save server, `bph-save` cũng đổi thành `bph-save-imported`, không hỏi. Bong bóng nhỏ "Đã chuyển tiến độ cũ vào tài khoản" khi có chuyển.
- [ ] **Mất mạng / server lỗi**: game chơi tiếp bình thường; góc HUD hiện icon nhỏ **"Chưa lưu lên mạng"** (chữ + icon, không chỉ màu); thử lại mỗi **`cloudSaveRetrySeconds` (30 s)** và ngay khi trình duyệt báo `online`. Gửi được → icon tắt. Cửa sổ Tạm dừng: "Đã lưu lúc 14:30 · Ngày 2" thêm "· đã lưu lên mạng" / "· chỉ trên máy này".
- [ ] **409 (có bản mới hơn ở tab / máy khác)**: dừng gửi, tạm dừng game, hộp **"Game đang được chơi ở nơi khác"** — nút **"Tải bản mới nhất"** (tải lại trang, lấy bản server) và **"Dùng bản ở đây"** (gửi lại với `revision` mới — đè bản kia, hỏi xác nhận). Không bao giờ tự đè.
- [ ] **401 giữa chừng (phiên hết hạn)**: game tạm dừng, hiện màn đăng nhập đè lên; đăng nhập lại **đúng tài khoản cũ** → gửi bản đệm, chơi tiếp; đăng nhập tài khoản khác → tải lại trang (bản đệm của người cũ vẫn giữ cho họ).
- [ ] **Đăng xuất**: gửi ngay; gửi không được → hỏi "Chưa lưu lên mạng được. Đăng xuất vẫn giữ bản tạm trên máy này cho lần sau." Có / Không. Bản đệm của người đã đồng bộ xong thì **xóa khỏi máy** (máy dùng chung không lộ save).
- [ ] **"Chơi lại từ đầu"**: xóa bản đệm + lưu save Ngày 1 mới lên server (không cần lệnh xóa).
- [ ] Logic so bản / chọn bản / chuyển save cũ là **hàm thuần có unit test** (`systems/cloudSave.ts`); e2e: lưu → mở context trình duyệt mới (= máy khác) đăng nhập cùng tài khoản → đúng ngày / tiền / ruộng; chặn mạng (`page.route` trả lỗi) → icon hiện, chơi tiếp, bỏ chặn → icon tắt, server có bản mới; 2 tab → tab cũ thấy hộp 409; có `bph-save` cũ + tài khoản mới → save cũ lên server.
- [ ] Debug cho QA: `debugState.save.cloud` (`baseRevision`, `dirty`, `lastSyncAt`, `lastError`, `pending`), `debugForceOffline(bool)`.

**Thông số mới (`gameConfig.ts`):** `cloudSaveDebounceSeconds` 5 (s, khoảng 2–15: nhỏ = ít mất tiến độ hơn nhưng gọi server nhiều hơn), `cloudSaveRetrySeconds` 30 (s, 10–60). Giữ `autoSaveIntervalSeconds` 30.

**Bạn thử thế nào:** đăng nhập, chơi tới chiều, gieo vài ô. Mở **một trình duyệt khác** (ví dụ Edge nếu đang dùng Chrome, hoặc cửa sổ ẩn danh), vào http://localhost:5173, đăng nhập cùng tài khoản → thấy đúng ngày, đúng ruộng, đúng tiền. Thử "mất mạng": bấm `stop.bat` lúc đang chơi → góc màn hiện "Chưa lưu lên mạng", game vẫn chơi; bấm `start.bat` lại → chờ chút, dòng đó tắt.

---

### T-015 — Đăng nhập bằng Google

**Người dùng chốt (2026-10-13):** dùng luôn project GCP `hp-ecommerce-v2` (không tạo project mới). Người dùng sẽ **tự thiết lập credential sau** — khi tới T-015, `backend-dev` làm phần code + hướng dẫn trước; nút Google tự ẩn khi `.env` chưa có `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`, nên không chặn các task khác. **Địa chỉ đã chốt cho credential local:** Authorized JavaScript origin `http://localhost:5173`; Authorized redirect URI `http://localhost:5173/api/auth/google/callback` (đi qua proxy Vite để cookie cùng origin với game). Domain thật thêm vào client này khi deploy (bước 5.2).

**Bước:** 3.4 · **Ai làm:** backend-dev + bạn · **Size:** L (1 ngày) · **Cần trước:** T-012

**Mục tiêu:** bấm "Đăng nhập bằng Google" là vào game; ai đã đăng ký bằng email đó thì vào đúng tài khoản cũ.

**Điều kiện xong:**
- [ ] `backend-dev` viết **hướng dẫn từng bước có ảnh/chữ cụ thể** (`docs/setup/google-oauth.md`) để bạn tạo **OAuth client** (loại "Web application") trong Google Cloud Console ở project bạn chọn (xem câu hỏi bên dưới): màn đồng ý (consent screen) chế độ **Testing**, thêm email của bạn làm người thử, `Authorized redirect URI` = `http://localhost:5173/api/auth/google/callback`. Việc này **miễn phí**, không tạo tài nguyên tốn tiền.
- [ ] **Bạn tự dán** `GOOGLE_CLIENT_ID` và `GOOGLE_CLIENT_SECRET` vào `web/server/.env` (**không dán vào chat**). `.env.example` có 2 dòng trống mẫu.
- [ ] Server: `/api/auth/google/start` tạo `state` + PKCE (lưu trong cookie ngắn hạn httpOnly) → chuyển sang Google (chỉ xin `openid email profile`); `/callback` kiểm `state`, đổi code lấy token phía server, đọc `sub`, `email`, `email_verified`, `name`.
- [ ] **Ghép tài khoản (D-029)**: đã có `AuthAccount` google + `sub` → đăng nhập tài khoản đó. Chưa có, mà **email Google đã xác minh** trùng email một `User` → **gắn Google vào User đó** (tài khoản email cũ dùng được cả 2 cách). Không trùng → tạo `User` mới (`displayName` = tên Google). Xong → đặt cookie phiên, chuyển về `/` (game vào thẳng Vườn).
- [ ] Người dùng bấm "Hủy" ở Google / lỗi → về màn tài khoản với chữ đỏ "Đăng nhập Google không thành công".
- [ ] Thiếu khóa trong `.env` → `providers.google = false` → nút ẩn, server vẫn chạy.
- [ ] Test với Google giả (mock HTTP): tạo mới, đăng nhập lại, ghép với tài khoản email, `state` sai → từ chối, `email_verified: false` → không ghép (tạo tài khoản riêng).
- [ ] Bạn đăng nhập Google thật thành công ở local (bước người dùng).

**Câu hỏi cho bạn (phiên chính hỏi trước khi bắt đầu T-015):** tạo OAuth client ở đâu? (A) **project GCP mới riêng cho game**, ví dụ `bride-price-hustle` — đề xuất; (B) dùng luôn `hp-ecommerce-v2`. Xem báo cáo của `game-planner`.

**Bạn thử thế nào:** làm theo `docs/setup/google-oauth.md` (khoảng 15 phút), dán 2 khóa vào `web/server/.env`, chạy lại `start.bat`. Mở game → thấy nút "Đăng nhập bằng Google" → bấm → chọn tài khoản Google → vào Vườn. Nếu email Google trùng email bạn đã đăng ký ở T-012: thấy đúng tiến độ cũ.

---

### T-016 — Đăng nhập bằng Facebook

**Bước:** 3.4 · **Ai làm:** backend-dev + bạn · **Size:** M (3–4h) · **Cần trước:** T-015

**Mục tiêu:** bấm "Đăng nhập bằng Facebook" là vào game (chạy ở local; mở cho người ngoài cần duyệt app — để bước 5.3).

**Điều kiện xong:**
- [ ] Hướng dẫn `docs/setup/facebook-login.md`: tạo app trên Facebook Developers (loại Consumer, sản phẩm "Facebook Login"), chế độ **Development** (chỉ bạn và người thử được thêm vào app đăng nhập được), redirect `http://localhost:5173/api/auth/facebook/callback` (`backend-dev` kiểm lúc làm xem Facebook có cho localhost không HTTPS ở chế độ Development; nếu không, ghi cách khác vào hướng dẫn và báo phiên chính).
- [ ] Bạn tự dán `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET` vào `web/server/.env` (không dán vào chat).
- [ ] Server dùng chung khung với Google (`state`, đổi code phía server), xin quyền `public_profile`, `email`.
- [ ] Ghép tài khoản như T-015, **chỉ khi Facebook trả email**; không có email → tạo `User` mới với `email` null (Facebook không cho biết email đã xác minh hay chưa theo cách giống Google — `backend-dev` ghi rõ cách xử lý chọn, Giả định: coi email Facebook trả về là đã xác minh).
- [ ] Hủy / lỗi → chữ đỏ "Đăng nhập Facebook không thành công". Thiếu khóa → nút ẩn.
- [ ] Test với Facebook giả (mock HTTP) như T-015. Bạn đăng nhập Facebook thật thành công ở local.

**Thông số / ghi chú:** cắt được nếu trễ hoặc Facebook làm khó (GDD §14 mục cắt 0 (b)): khi đó nút không hiện, mọi thứ khác chạy bình thường.

**Bạn thử thế nào:** làm theo `docs/setup/facebook-login.md` (khoảng 20 phút), dán 2 khóa vào `web/server/.env`, chạy lại `start.bat`, bấm "Đăng nhập bằng Facebook" → vào Vườn.

---

### T-017 — Kiểm toàn bộ luồng tài khoản và lưu game

**Bước:** 3.4 · **Ai làm:** qa-tester · **Size:** M (3–4h) · **Cần trước:** T-014, T-015 (+ T-016 nếu làm)

**Mục tiêu:** chắc chắn điều kiện xong của bước 3.4 đúng: "đăng ký → chơi → F5 → đăng nhập lại vẫn còn tiến độ; Google (và Facebook) chạy được ở local".

**Điều kiện xong:**
- [ ] Kịch bản Playwright end-to-end (dùng stack Docker): đăng ký → chơi (cuốc, gieo, bán, ngủ) → F5 → đăng xuất → đăng nhập lại → đúng ngày / tiền / ruộng / gùi.
- [ ] "Hai máy" (2 browser context): chơi ở A → đăng nhập B thấy tiến độ A; A và B mở cùng lúc → bên cũ hơn thấy hộp 409, không mất dữ liệu.
- [ ] Mất mạng giữa ngày (chặn `/api`) → chơi tiếp, icon "Chưa lưu lên mạng"; đóng tab khi đang mất mạng → mở lại khi có mạng → bản đệm được gửi lên, không mất tiến độ.
- [ ] Save cũ `bph-save` + tài khoản mới → chuyển lên đúng 1 lần; tài khoản thứ 2 trên cùng máy không nhận save đó.
- [ ] Bảo mật cơ bản: cookie có `HttpOnly` + `SameSite=Lax`; 6 lần sai mật khẩu → 429; gọi `PUT /api/save` từ Origin khác → 403; người A không đọc được save người B; trong log server không có mật khẩu / session ID.
- [ ] Google / Facebook: kiểm bằng mock (không đăng nhập thật tự động); ghi rõ phần bạn đã tự thử bằng tài khoản thật.
- [ ] Bug tìm được ghi vào bảng Lỗi; không còn bug mức "Nặng" thì đánh dấu xong.

**Bạn thử thế nào:** đọc báo cáo của `qa-tester` (có ảnh chụp ở `web/e2e/screenshots/t017-*.png`). Tự làm 1 lần: đăng nhập ở Chrome, chơi một chút, đăng nhập cùng tài khoản ở Edge → thấy tiến độ giống hệt. Đây cũng là điều kiện để đánh dấu xong bước 3.4.

---

## Chi tiết task chặng 4

### T-018 — Làm test e2e ổn định (BUG-006) và có bộ "smoke" chạy nhanh — ⏭ BỎ (D-036, người dùng chọn 2026-10-14)

**Bước:** 4.4 · **Ai làm:** game-dev + qa-tester · **Size:** M (3–4h) · **Cần trước:** —

**Mục tiêu:** cả bộ e2e không còn đỏ ngẫu nhiên, và có một bộ test ngắn chạy sau mỗi task — để chặng 4 thêm nhiều code mà không mất công đoán "lỗi thật hay test chập chờn" (14 ca chập chờn đang tăng).

**Điều kiện xong:**
- [ ] Rà mọi `waitForTimeout` cố định trong `web/e2e/tests/`: đổi sang chờ theo trạng thái (`expect.poll` / `waitForFunction` trên `debugState`) hoặc đếm frame. Chỗ nào buộc phải giữ thì ghi lý do ngay cạnh.
- [ ] Hiệu ứng "thoáng qua" (giọt nước, chữ bay, tiếng hái, `action.kind` của việc nhanh) kiểm bằng **bộ đếm / nhật ký** (vd `farmJuice.waterDrops` tổng, `money.floatLog`) hoặc **hook kéo dài** (`debugSetTestTuning` thêm `harvestPitchResetSeconds`, thời gian chữ bay). Sửa đủ 5 ca nêu trong BUG-006.
- [ ] Gắn nhãn `@smoke` cho ~15–25 ca chính (vào game, đi, cuốc, gieo–tưới–hái, Sức, đồng hồ, thùng bán, ngủ, lưu/F5); lệnh `npm run test:e2e:smoke` chạy ≤ 5 phút.
- [ ] Cả bộ chạy **2 lần liền** trên stack Docker đều xanh (ghi số ca, thời gian). Ca nào còn đỏ → ghi bug riêng, không nới điều kiện cho qua.
- [ ] BUG-006 → Đã sửa; báo phiên chính thêm lệnh smoke vào CLAUDE.md mục Web.

**Thông số / ghi chú:** không đổi gameplay, không đổi `gameConfig.ts`. Từ task này, mọi task code chạy smoke trước khi báo xong; cả bộ chạy ở cuối mỗi Đợt.

**Bạn thử thế nào:** không cần mở game. Đọc báo cáo: "cả bộ N ca xanh 2 lần liền, smoke M ca trong X phút".

---

### T-019 — Gen hình Lô 1 (phần 1): đất ruộng, cỏ, đường đất, cây trồng, icon món

**Bước:** 4.2 · **Ai làm:** art-director · **Size:** L (1 ngày) · **Cần trước:** asset list Lô 1 (bước 4.1)

**Mục tiêu:** đủ hình để ruộng và gùi trông như game thật.

**Điều kiện xong:**
- [x] Theo asset list Lô 1: đất **chưa cuốc / đã cuốc / đã tưới** (texture + viền tự nối), 2 nấc **cuốc dở**, cỏ nền chính thức, **đường đất** + mép cỏ.
- [x] Đường đất là **đất nện** (nâu vàng, nén chặt, vài viên sỏi) — khác rõ đất ruộng tơi sẫm; dùng cho mọi lối đi ở Vườn và Xóm (GDD §5, D-035).
- [x] Cây trồng **5 loại** (rau cải, khoai lang, rau muống, dưa hấu, lúa nếp) × giai đoạn hạt / mầm / chín, có cách hiện **khát** và **héo** (vẽ riêng hoặc để code tô màu — art-director chọn, ghi vào asset list).
- [x] Icon **hạt + nông sản** cho 5 cây, cùng phong cách icon cái cuốc.
- [x] Tự review theo checklist art bible, hậu kỳ, đặt file vào `web/client/public/assets/art/<loại>/`, cập nhật asset list (đã làm) · **Bạn duyệt ảnh so sánh** (đã duyệt 2026-10-14)

**Thông số / ghi chú:** chi phí theo asset list, trong ngân sách D-034. Gen vừa đủ 2–4 bản/lần.

**Bạn thử thế nào:** mở ảnh so sánh `art-director` gửi, chọn bản ưng hoặc nói chỗ cần sửa.

**Kết quả (art-director, 2026-10-14) — ✅ người dùng duyệt 2026-10-14** (cỏ mới, bỏ vệt bánh xe, túi hạt tô màu dây buộc theo loại — cải xanh lá, khoai tím, muống xanh ngọc, dưa đỏ, nếp vàng; script 0 USD, giữ tên file): ảnh duyệt `art-source/raw/lot1/lot1-part1-preview.png` (cảnh ghép thử zoom 1,5 như trong game: lối đất nện ngã ba + sân + ruộng 6×4 đủ nấc đất + 18 cây các giai đoạn + {ten}; dưới là texture, viền, dải cây, icon trong ô hotbar). File cuối: `tiles/` (8 texture + `path-edge`, `path-corner`, `soil-tilled-edge`, mỗi file thêm bản `-ex`), `props/crop-*.png` (6 dải), `items/item-*.png` (18 icon). Khát = code tô nhạt (không vẽ riêng); héo = khung chung. Viền do script `tools/tile_edges.py` (0 USD). Chi: 30 ảnh nhanh + 4 hq = **2,55 USD** (ước ~3,49). Bụi cỏ / lùm hoa / lùm cây (ENV-016/017/003) chuyển làm cùng T-020. Cách ghép cho game-dev: asset-list §3 mục "Ghép tile Lô 1".

---

### T-020 — Gen hình Lô 1 (phần 2): động tác tưới / cúi, nhà {ten} và trong nhà, đồ vật vườn

**Bước:** 4.2 · **Ai làm:** art-director · **Size:** L (1 ngày) · **Cần trước:** asset list Lô 1

**Mục tiêu:** {ten} có dáng thật khi tưới, gieo, hái; nhà, trong nhà và đồ vật quanh nhà có hình thật — dùng ngay ở Vườn rồi mang sang Xóm.

**Điều kiện xong:**
- [x] Động tác **tưới** (bình tưới tôn — món bậc 1 đổi tên "bình tưới cũ", D-034) và **cúi** (gieo / hái / dọn) 4 hướng, bậc 1, cùng khung 128×128 và điểm chân với động tác cuốc (ART-CHR-007).
- [x] Theo asset list Lô 1: **nhà {ten}** (bên ngoài), **nền trong nhà** + nội thất (giường tre, hũ gạo, rương gỗ, nón ông nội), bếp rơm + bếp gạch (2 trạng thái), thúng bán có nắp + cọc rào, **quầy hạt** ở hiên, **cây nhãn** (tách tán / gốc), **rào** dâm bụt / tre.
- [x] Hậu kỳ, đặt file, cập nhật asset list. — [x] Bạn duyệt (2026-10-14).

**Kết quả (art-director, 2026-10-14) — ✅ người dùng duyệt 2026-10-14** (chọn: rào tre dọc vẽ lại — bản mới `props/fence-tre-v.png` dựng bằng script `art-source/raw/lot1/tools/fence_v.py`, trụ ngắn có khe + 2 thanh + chéo X, thêm 3 ảnh nhanh thử gen 0,20 USD; miếng vá chàm đũng quần khi cúi quay lưng giữ làm câu đùa): ảnh xem `art-source/raw/lot1/lot1-part2-preview.png` (cảnh ghép thử ở cỡ game thật: nhà + sân đất nện + ruộng + thúng bán + quầy hạt + cây nhãn + rào tre + rào dâm bụt + cụm bụi; cảnh trong nhà; dải động tác cuốc / tưới / cúi 4 hướng), GIF `art-source/raw/lot1/hero-anim/gif/actions-<down|up|left|right>.gif`, xám `art-source/raw/lot1/scene2-outside-gray.png`. File cuối: `characters/hero-t1-{water,bend}-{down,up,left,right}.png` (**4 khung như cuốc**, khung chỉ số 2 = chạm — đổi từ 3 khung để game-dev dùng chung `hoeFrameAt`); `props/house-hero.png` (384×320), `backgrounds/house-interior.png` (1280×720), `props/house-{bed,hu-gao,ruong,non-ong}.png`, `props/stove-{rom,gach}.png`, `props/sell-basket-{closed,open}.png`, `props/stake-{1,row}.png`, `props/seed-stall.png` (không người bán, D-037), `props/tree-nhan{,-canopy,-trunk}.png`, `props/fence-tre-{h,post,v}.png`, `props/hedge-dambut-*.png` (6), bụi cỏ / hoa / lùm cây (ENV-016/017/003, 17 file `grass-*`, `flower-*`, `bush-*`). **Kích thước, chân đế va chạm, điểm cửa, chỗ đứng người bán, điểm lửa/khói, sàn + cửa trong nhà: `props/props.json`.** Script: `tools/action_split.py` (chuyển từ `hoe_split.py`, thêm `--dx/--dy`, gán giọt nước theo mép gần nhất), hậu kỳ vật thể `art-source/raw/lot1/tools/props2.py`, cảnh ghép `scene2.py`. Chi: 22 hq + 22 nhanh = **4,42 USD** (ước ~6,5); Lô 1 đã chi 7,17 / 14,87.

**Thông số / ghi chú:** theo asset list mới, các món này ở **Lô 1** (Vườn có hình thật sớm; nhà, cây, rào dùng lại ở Xóm, không vẽ hai lần). Ao / nước hồ vẫn ở Lô 2 — ao ở Vườn tạm giữ hình khối tới T-033.

**Bạn thử thế nào:** xem GIF động tác tưới / cúi 4 hướng và ảnh nhà + trong nhà, duyệt.

---

### T-091 — Gen hình Lô 1 (phần 3): giao diện vườn

**Bước:** 4.2 · **Ai làm:** art-director · **Size:** M (3–4h) · **Cần trước:** asset list Lô 1

**Mục tiêu:** HUD và các cửa sổ đang có (gùi, thùng bán, tổng kết, Tạm dừng) có giao diện thật thay khung vẽ bằng code.

**Điều kiện xong:**
- [ ] Theo asset list Lô 1: khung giấy điệp 9-slice (lớn + tooltip), ô hotbar / gùi (thường / chọn / khóa), nút 9-slice (thường / rê chuột / nhấn / xám), khung HUD (ống tre thanh Sức, đĩa đồng hồ, ô tiền, bảng level), sheet icon HUD, 4 kiểu bong bóng (thường, chửi thề, khoe, "…").
- [ ] Màu viền ô ngoài tầm ART-UI-001 chốt. Hậu kỳ, đặt file + `ui/ui.json` (lề cắt). Bạn duyệt.

**Bạn thử thế nào:** xem bản ghép mẫu HUD + cửa sổ gùi, duyệt.

**Ghi chú khi làm (art-director, 2026-10-14):** gen 4 sheet (6 hq + 3 nhanh = 1,01 USD), hậu kỳ thành 31 file trong `web/client/public/assets/art/ui/` + `ui/ui.json` (lề cắt 9-slice, cỡ nhỏ nhất, vùng chữ, cửa sổ ống tre, cách đặt đuôi bong bóng). Trạng thái nút / ô tô lại bằng script. Ảnh ghép để duyệt: `art-source/raw/lot1/ui-mockup-1-hud.png` (HUD + bong bóng + tooltip + banner), `ui-mockup-2-thung-ban.png`, `ui-mockup-3-hoi-ngu.png`, bảng bộ `ui-kit-sheet.png`. Màu viền ngoài tầm ART-UI-001: đề xuất phương án A, chờ bạn chốt. Card: `docs/art/prompts/ART-UI-002.md`.

**Người dùng duyệt 2026-10-14 (✅):** đúng như ảnh ghép — cửa sổ giấy điệp trắng chữ mực, icon mùa quạt nan / áo tơi, ART-UI-001 phương án A.

---

### T-021 — Gắn hình Lô 1: đất ruộng 3 trạng thái, viền tự nối, nấc cuốc dở

**Bước:** 4.2 · **Ai làm:** game-dev · **Size:** M (3–4h) · **Cần trước:** T-019 (T-018 đã bỏ — D-036)

**Mục tiêu:** ruộng trông thật: cỏ khô → vỡ cỏ → lổn nhổn → đất tơi, sẫm khi tưới, viền liền giữa các ô.

**Điều kiện xong:**
- [x] Ô ruộng vẽ bằng tile thật theo trạng thái: `soil`, nấc cuốc dở (`tillStrikes` → `tillVisualStages`), `watered`. Viền 4-bit tự chọn theo ô bên cạnh.
- [x] Nền cỏ Vườn đổi sang tile thật. Cỏ chỉ ở ngoài lối đi; lối đi là đất nện (gắn ở T-024) — hai nền ghép viền không lộ đường kẻ (D-035). *(Lối dọc + sân + nhánh tới sạp hạt đã gắn luôn ở đây theo GDD §5 "Vườn prototype"; T-024 còn nhà, thúng bán, quầy hạt, cây nhãn, rào.)*
- [x] Thanh tiến độ cuốc, viền chọn ô (sáng / xám), số hàng chờ vẫn đọc rõ trên nền mới (ảnh chụp, không dùng e2e — D-036). Màu viền ngoài tầm giữ như cũ (ART-UI-001 chưa chốt).
- [x] Thiếu file ảnh → game không treo, log cảnh báo, vẽ bằng code như cũ.

**Thông số / ghi chú:** không đổi thông số gameplay. Tên file theo asset list.

**Bạn thử thế nào:** mở http://localhost:5173, cuốc một ô: đất đổi 3 nấc bằng hình thật. Tưới: đất sẫm. Cuốc 2 ô cạnh nhau: viền nối liền, không thấy đường kẻ ô.

**Ghi chú khi làm (game-dev, 2026-10-14) — T-021 → 👀 chờ bạn thử:** Nền Vườn là **một Tilemap dựng bằng code** từ *loại nền* từng ô (cỏ / lối / sân / ruộng) với 4 lớp theo asset-list §3 "Ghép tile Lô 1": lõi (texture 4×4, ô = `(y%4)*4 + x%4`) → viền luống `soil-tilled-edge` (chỉ ô đã cuốc/tưới, mask cạnh giáp ô chưa cuốc) → mép cỏ `path-edge` (mọi ô đất có cạnh giáp cỏ) → góc lõm `path-corner` (một lớp mỗi góc, chỉ tạo khi bản đồ có). Dùng bản `-ex` (margin 1, spacing 2) — không lộ khe khi zoom 1,5. Nấc đất: 0–1 nhát `soil-dry`, 2–3 `soil-till-1`, 4–5 `soil-till-2`, 6 `soil-tilled`, đã tưới `soil-watered` (viền giữ). Ô ruộng chỉ đặt lại tile khi đổi (so trạng thái mỗi frame, ≤ 24 ô); viền luống tính lại cả ruộng khi có ô đổi giữa "đã cuốc"/"chưa" (cuốc xong, hái, dọn). Bỏ: lớp phủ màu đất khô, lớp phủ mực khi tưới / màu khô khi khát (`wateredSoilAlpha`, `thirstySoilAlpha` xóa khỏi `gameConfig.ts`), nấc cuốc dở vẽ bằng code, lưới kẻ ô ruộng, dải lối vẽ bằng hình chữ nhật. Ô "nảy" lúc cuốc xong dùng đúng mảnh đất đã cuốc của ô (khung cắt từ tấm tile). **Lối đất nện (D-035, GDD §5):** `gardenLayout.json` thêm `yard` (x 8–18, y 11–12) và `pathBranches` (x 12, y 26–27); **nền nhà cũng tính là đất** (bị tường/sàn che) để sân trước cửa không có mép cỏ chạy dọc chân tường (Giả định nhỏ, nhìn liền hơn). Logic thuần + unit test: `src/systems/groundTiles.ts` (`coreCell`, `buildGroundKinds`, `grassEdgeMask`, `concaveCorners`, `tilledEdgeMask`, `soilLookIndex`). **Thiếu ảnh:** tấm nào không tải được → `console.warn` + texture tạm vẽ bằng code cùng khổ (lõi màu phẳng bảng màu, viền vệt mảnh), game chạy tiếp; danh sách ở `debugState.ground.fallbacks`. Debug cho QA: `debugState.ground.{plotLooks, ridgeMasks, fallbacks}`. Gỡ `tile-grass-test.png` / `tile-dirt-test.png` (màn Sandbox chuyển sang `grass` + `soil-tilled`). Lỗi nhỏ đã biết từ art, chấp nhận: sân giáp lối có mảng sáng bị cắt thẳng theo mép ô; hai ô ruộng cạnh nhau khác nấc lệch hàng luống. Kiểm: tsc + build + lint + 315 unit client xanh (không chạy e2e — D-036); ảnh `web/e2e/screenshots/t021-1-ruong-moi.png`, `t021-1b-dang-cuoc.png` (đang cuốc, thanh tiến độ + viền chọn ô), `t021-1c-cuoc-xong-2-o.png`, `t021-2-ruong-du-nac.png`, `t021-3-nhanh-sap-hat.png` (script `web/e2e/diag-t021.mjs`).

---

### T-022 — Gắn hình Lô 1: cây trồng theo giai đoạn và icon món

**Bước:** 4.2 · **Ai làm:** game-dev · **Size:** M (3–4h) · **Cần trước:** T-019

**Mục tiêu:** cây và món trong gùi bằng hình thật.

**Điều kiện xong:**
- [x] Cây vẽ bằng sprite theo `cropStage` + khát / héo.
- [x] Icon thật ở hotbar, gùi, thùng bán, sạp hạt, icon bay khi hái.
- [x] `crops.json` thêm trường tên hình (vd `sprite`, `icon`) — để T-045 thêm cây chỉ cần thêm dữ liệu.

**Thông số / ghi chú:** 3 cây mới (rau muống, dưa hấu, lúa nếp) đã có hình nhưng chưa trồng được tới T-045.

**Bạn thử thế nào:** gieo cải + khoai, bấm **G** vài lần: thấy mầm → chín bằng hình thật. Bấm **E**: icon thật.

**Ghi chú khi làm (game-dev, 2026-10-14) — T-022 → 👀 chờ bạn thử:** `crops.json` mỗi cây thêm `sprite` (`crop-<id>`), `icon` (`item-<id>`), `seedIcon` (`item-hat-<id>`) = khóa texture, cũng là tên file (bảng ánh xạ nằm trong dữ liệu, không suy từ id — art đổi tên file thì chỉ sửa JSON). `config/assets.ts` tự nạp dải cây (`cropSpritesheets`, khung 64×96 `CROP_FRAME`) + icon từ `crops.json`, nên **thêm cây ở T-045 chỉ cần thêm dữ liệu + file**. 5 cây đều nạp sẵn (rau muống, dưa hấu, lúa nếp có hình nhưng chưa bán hạt / chưa trồng được cho tới T-045). Chọn khung (thuần TS + test, `src/systems/cropArt.ts`): hạt → `crop-common` khung 0; đang lớn → dải riêng, tuổi/số ngày < `cropGrownFrameAt` 0.5 → khung 0 (non), còn lại khung 1 (lớn); chín → khung 2; héo → `crop-common` khung 2; cây không có dải riêng → mầm chung / chín vẽ bằng code. Sprite đặt đáy-giữa ô, `setOrigin(0.5, 1)`, depth giữ `y ô + CROP_BASE`. **Khát** = tint nhân màu trắng ngả `#B98550` (`cropThirstyTintAmount` 0.35) + co dọc `cropThirstyScaleY` 0.92 — chưa giảm bão hoà riêng (tint đã làm lá ngả vàng nâu, bớt tươi; thêm bộ lọc ColorMatrix tốn thêm lượt vẽ cho mỗi cây — để sau nếu bạn thấy chưa đủ "khát"). Hái: cây bật lên dùng khung "chín" thật. Icon: `itemIconKey` (`systems/items.ts`) — cuốc → `item-hoe`, hạt → `seedIcon`, nông sản → `icon`, món lạ → vẽ bằng code; dùng ở hotbar, gùi, cửa sổ thùng bán (chung `drawSlot`), nút sạp hạt, icon bay khi hái. Icon chưa có món trong data (`item-binh-tuoi`, `item-bat-com`, `item-khoai-nuong`, `item-bat-chao`, `item-trung`, `item-xau-tien`, `item-tui-tien-rong`, `item-day-rom`) chưa nạp — thêm khi món đó vào data. Thông số mới (`gameConfig.ts`): `cropGrownFrameAt` 0.5, `cropThirstyTintAmount` 0.35, `cropThirstyScaleY` 0.92. Lưu ý theo luật 0.5: rau cải (1 ngày) đi thẳng hạt → chín; khoai (2 ngày) hạt → "lớn" → chín (khung "non" chỉ thấy ở cây ≥ 3 ngày như dưa hấu, lúa nếp). Debug cho QA: `debugState.crops[].{sprite, frame}`, `hud.hotbarImages`. Kiểm: unit test (khung theo tuổi/khát/héo, màu tint, bảng icon, mọi file hình/icon có thật); ảnh `web/e2e/screenshots/t021-2-ruong-du-nac.png` (hạt, lớn, khát, chín, héo), `t021-4-gui-icon.png`, `t021-5-sap-hat.png`.

---

### T-023 — Gắn hình Lô 1: động tác tưới và cúi

**Bước:** 4.2 · **Ai làm:** game-dev · **Size:** M (3–4h) · **Cần trước:** T-020

**Mục tiêu:** gieo, hái, dọn có dáng cúi; tưới có dáng cầm gáo — thay cú nhún thân bằng code.

**Điều kiện xong:**
- [x] Gieo / hái / dọn dùng khung cúi, tưới dùng khung tưới, 4 hướng, khung "chạm" khớp `actionImpactAt`, điểm chân như cuốc (`HERO_ACTION_FRAME`). Khung tính từ tiến độ động tác (như `systems/toolAnim.ts`).
- [x] Việc nhanh vẫn không khóa chân (D-022). Đang đi mà làm việc nhanh: game-dev chọn hiện khung đi hay khung cúi sao cho không "trượt", ghi lý do.
- [ ] ~~e2e cũ (crops, qa-t003) xanh.~~ Không chạy theo D-036 (bỏ e2e) — thay bằng unit test + ảnh chụp, xem ghi chú.

**Thông số / ghi chú:** dùng `actionDuration` 0.4. Nếu cần số mới (vd thời lượng khung) thì thêm vào `gameConfig.ts` và ghi ở ghi chú khi làm.

**Bạn thử thế nào:** giữ chuột rê gieo cả luống: {ten} cúi gieo từng ô. Tưới: thấy cầm gáo nghiêng.

**Ghi chú khi làm (game-dev, 2026-10-14) — T-023 → 👀 chờ bạn thử:** Nạp 8 dải mới `characters/hero-t1-{water,bend}-{down,up,left,right}.png` (khung 128×128, origin chân 111/128 như cuốc). Logic thuần + test ở `systems/toolAnim.ts`: `actionAnimFor(việc)` (cuốc → `hoe`, tưới → `water`, gieo / hái / dọn → `bend`), `actionFrameAt` = luật 4 khung của `hoeFrameAt` (khung 2 trùng đúng lúc chạm `actionImpactAt`), `showActionPose`, `isActionTextureKey`; khoá ảnh `heroActionKey(tier, 'hoe'|'water'|'bend', hướng)` ở `config/assets.ts` (`heroHoeKey` gọi lại hàm này). Thông số mới (`gameConfig.ts`): `quickAnimWindupShare` 0.4, `quickAnimImpactShare` 0.6 → trong `actionDuration` 0.4 s: khung 0 = 0,08 s, khung 1 = 0,12 s, khung 2 (chạm) = 0,12 s, khung 3 = 0,08 s. **Đang đi mà làm việc nhanh → giữ khung bước** (cùng cú nhún bằng code cũ): dải tưới / cúi không có bước chân, hiện lúc đang trượt đi thì như "lướt" trên đất; dừng chân giữa chừng thì dáng tưới / cúi hiện ngay khung đúng tiến độ. Đứng làm thì bỏ nhún + thở (hình vẽ đủ động tác, co giãn làm méo). Hái lúc đang cúi: icon bay vào hotbar xuất phát từ **tay** (điểm tay khung cuối `HERO_BEND_HAND`: phải (90,65), trái (38,65), xuống (36,59), lên (88,61)); đang đi thì từ ô như cũ. Thiếu ảnh động tác → dùng khung đi / đứng + nhún như trước (Preload đã log cảnh báo). Debug cho QA: `debugState.actionAnim.{anim, frame, lastHarvestFrom}` (`hoeFrame` giữ nguyên). Kiểm: tsc + build + lint + unit (346 client xanh); ảnh dừng đúng khung chạm `web/e2e/screenshots/t023-1-tuoi-phai.png`, `t023-2-cui-gieo-len.png`, `t023-3-cui-hai-phai.png` (icon rau bay từ tay), script `web/e2e/diag-t023-t024.mjs` (cũng thử: đang đi + tưới → `hero-t1-walk-down`, việc vẫn chạy). e2e cũ không chạy (D-036); lưu ý chạy thử `crops.spec.ts` thấy đỏ ca "vừa đi vừa gieo" do test cũ cầm cuốc ở ô 1 (từ T-009), không liên quan T-023.

---

### T-024 — Gắn hình Lô 1: nhà {ten}, thúng bán, quầy hạt, cây nhãn, rào, đường đất

**Bước:** 4.2 · **Ai làm:** game-dev · **Size:** M (3–4h) · **Cần trước:** T-020

**Mục tiêu:** Vườn có hình thật: nhà tranh, cây nhãn, rào, lối đất, thúng bán, quầy hạt.

**Điều kiện xong:**
- [x] Nhà {ten} (bên ngoài) thay khối nhà; va chạm theo chân đế trong `props/props.json`, có **điểm cửa** (dùng ở T-093). Trong lúc chờ T-093, giường tạm đặt ở hiên để vẫn ngủ được (Giả định).
- [x] Thúng bán, cọc rào (ẩn tới T-044), **quầy hạt** thay hộp sạp hạt (vẫn là sạp không người tới T-036), cây nhãn (tán che người), rào, đường đất (viền tự nối).
- [x] Lối đi Vườn là **đất nện** theo GDD §5 mục "Vườn prototype" (D-035): lối dọc sẵn có + sân đất trước cửa nối ruộng và thúng bán + nhánh tới sạp hạt. Vườn không thêm cụm thực vật.
- [x] Vùng click khớp hình. — [ ] ~~e2e economy / day / garden xanh~~: không chạy theo D-036 (thay bằng unit test bố cục + thử va chạm bằng script).

**Bạn thử thế nào:** đi quanh vườn: nhà tranh, cây nhãn che người khi đi sau, rào, lối đất; F ở thúng bán và quầy hạt vẫn mở như cũ.

**Ghi chú khi làm (game-dev, 2026-10-14) — T-024 → 👀 chờ bạn thử:** **Đọc số từ `props/props.json`** (`systems/props.ts`: `propSpec`, `propPlacement`, `propFootRect`, `propImageTiles`, `propPoint`) — nạp lúc build bằng `import.meta.glob` (import thẳng file trong `public/` thì Vite cảnh báo); art đổi ảnh / cỡ (vd rào dọc gen lại) chỉ sửa props.json. **`gardenLayout.json`**: vật có hình ghi `{ prop, x, y }` = tên ảnh + ô TRÊN-TRÁI của **chân đế** (chân đế luôn khớp lưới; ảnh có thể lẻ ô như cây nhãn 3,5 ô); `garden.ts` `resolveLayout` đổi ra TileRect. **Bố cục mới** (khối nhà 11×8 cũ bỏ): nhà 6×5 ô, chân đế 6×2 x 8–13, y 9–10 (chặn cả khối — không còn đi vào trong; vào nhà ở T-093), mái y 6–8 đi phía sau được (mái che người); bậc cửa x 10–11 ngay trên lối dọc, `houseDoor` + `houseDoorPoint` (708, 700) cho T-093; nền dưới chân đế tính là đất (không có mép cỏ dọc thềm). **Giường tạm = chõng trên hiên** (Giả định): `bed` x 8–9, y 10 (nằm trong chân đế, viền nhô 12 px), `wakeSpot` (9, 11) ngay dưới ở sân. **Thúng bán** (17, 11) như cũ, đổi ảnh `sell-basket-closed` ↔ `sell-basket-open` theo thùng có đồ chờ bán (`sellBasketKey`, chung tâm-đáy). **Quầy hạt** `seed-stall` chân đế x 13–15, y 27 (chặn), vùng click / F = cả ảnh 3×2 (y 26–27; hàng trên đi xuyên), nhánh lối x 12 chạm đầu quầy; `sellerSpot` → `L.sellerSpot` (928, 1716) cho T-036. Tên trên đầu giữ "Thùng bán" / "Sạp hạt" cho khớp tiêu đề cửa sổ HUD. **Cọc rào** `stake-row` ở ô (14, 16) — dưới ruộng, tạo sẵn và **ẩn** tới T-044. **Cây nhãn**: 12 gốc cũ giữ chỗ (GDD §5), gốc `tree-nhan-trunk` (depth = đáy, hộp chặn nhỏ `treeTrunkHitbox`) + tán `tree-nhan-canopy` cùng toạ độ, **depth cố định trên nhân vật** (4000); thân người chạm vùng lá → tán mờ `treeFadeAlpha` (0.55 → **0.5** theo gợi ý art). **Rào tre** cả 4 cạnh viền bản đồ (người dùng chọn tre cho ngang lẫn dọc): `fencePieces` (`systems/propArt.ts`) — **đường rào chạy qua TÂM ô** (khác ghi chú props.json "trụ ở mép ô") để góc rào ngang gặp đúng cột rào dọc: ngang n ô = n − 1 nhịp `fence-tre-h` + `fence-tre-post` ở tâm ô đầu / cuối; dọc mỗi ô một `fence-tre-v`. **Dâm bụt** đã có luật ghép (h-l / cột i%3 của h-mid3 / h-r; v-top / v-mid / v-bottom) + test, dùng qua `gardenLayout.fences` (`{style:'dambut', x, y, len, dir}`), nhưng **chưa đặt đoạn nào ở Vườn** (D-035: Vườn không thêm cụm; dâm bụt dùng ở Xóm T-032). Va chạm vẫn là lớp Tilemap theo ô (BUG-001). Thiếu ảnh → `console.warn` + khối vẽ tạm cùng cỡ props.json (`debugState.props.fallbacks`) — đã thử chặn 3 ảnh: game chạy. Debug cho QA: `debugState.props.{house, houseDoor, houseDoorPoint, seedStallFoot, sellerSpot, sellBasket, stakesVisible, canopyAlpha, fallbacks}`. Kiểm: tsc + build + lint + unit (346 client xanh: bố cục, cửa, chừa ô quanh thúng / quầy / cửa, mảnh rào, thúng, tán che, đặt ảnh, mọi file có thật); thử va chạm bằng script (giữ phím đi vào vật): nhà dừng ở chân thềm (y 714), sau mái dừng ở mép trên chân đế (566), quầy (1718), gốc nhãn (1022), rào trên (74) / trái (84), thúng (778). Ảnh: `t024-1-nha-thung-dong.png`, `t024-2-thung-he-ruong.png`, `t024-3-sau-cay-nhan.png` (tán mờ khi đi sau), `t024-4-quay-hat.png`, `t024-5-goc-rao.png`, `t024-6-goc-rao-duoi-phai.png`. Save cũ đứng trong nhà cũ (nay là cỏ / sau mái) vẫn nạp được: ô không bị chặn thì đứng đó, bị chặn thì về chỗ xuất phát.

---

### T-093 — Cảnh trong nhà {ten}: bước qua cửa vào phòng riêng

**Bước:** 4.4 · **Ai làm:** game-dev · **Size:** L (1 ngày) · **Cần trước:** T-024

**Mục tiêu:** bước qua cửa nhà là vào một cảnh nhỏ bên trong (giường, bếp, rương) — có cảm giác "về nhà"; đồng thời làm sẵn **chuyển cảnh dùng chung** cho cổng Núi / làng Sung sau này.

**Điều kiện xong:**
- [x] Đi vào **điểm cửa** nhà → màn mờ → cảnh trong nhà (nền phòng + nội thất Lô 1, va chạm tường, camera cố định hoặc bám nhẹ); đi ra cửa → về đứng trước cửa. Hàm chuyển cảnh chung (mờ, điểm xuất hiện, tên khu, tự lưu) để T-054 dùng lại.
- [x] Bên trong: **giường** (ngủ / hỏi "Đi ngủ?" như cũ, `wakeSpot` trong nhà), **bếp** (đặt sẵn, nấu ở T-048), **rương** (cửa sổ 2 lưới gùi ⇄ rương như thùng bán, `chestSlots` 20 ô — rương lên Must theo D-034).
- [x] Save: `player.area` thêm giá trị `house`; F5 trong nhà vào lại trong nhà; ngủ gục ngoài đồng → sáng dậy trong nhà cạnh giường; save cũ (đứng ngoài) nạp bình thường.
- [x] Đồng hồ vẫn chạy trong nhà; trời tối dần cũng phủ trong nhà (nhẹ hơn — game-dev chọn, ghi chú).
- [ ] ~~e2e: vào / ra nhà, ngủ trong nhà, F5 trong nhà, rương cất / lấy không mất đồ~~ — không viết e2e theo D-036; thay bằng unit test (`house.test.ts`, `areas.test.ts`, `save.test.ts`) + script chụp `web/e2e/diag-t093.mjs` (chạy đủ các bước này bằng phím thật).

**Thông số / ghi chú:** thêm `chestSlots` 20 (GDD §3.9), `areaFadeSeconds` 0.4 (Giả định).

**Bạn thử thế nào:** đi tới cửa nhà: màn mờ, vào trong thấy giường, bếp, rương. Cất 5 củ khoai vào rương, F5: vẫn ở trong nhà, khoai còn trong rương. Ra cửa: đứng trước nhà.

**Ghi chú khi làm (game-dev, 2026-10-14) — T-093 → 👀 chờ bạn thử:**
- **Cách làm:** phòng là một **khu** nằm cùng thế giới với Vườn nhưng đặt dưới bản đồ Vườn 4 ô (`systems/house.ts`, `HOUSE_GAP_TILES`); camera + giới hạn vật lý đổi theo khu nên chỉ thấy một khu một lúc. Nhờ vậy đồng hồ, Sức, gùi, bong bóng, chuỗi đêm, tự lưu… chạy y nguyên trong nhà, không phải tách scene. Số đo phòng (sàn, khe cửa, chỗ vào) đọc từ `props.json` `_interior`; vị trí đồ đạc + chỗ thức dậy + bề ngang khe cửa ở `src/data/houseLayout.json` (lấy đúng vị trí gợi ý của art).
- **Vào / ra:** đứng ô sân ngay dưới bậc thềm (x 10–11, hàng 11) bấm **W** chạm bậc → màn mờ 0,4 s (`areaFadeSeconds`) → đứng ở cửa trong nhà (640, 520), mặt hướng lên, tên khu "Nhà {ten}" hiện giữa trên màn rồi mờ. Trong nhà đứng sát tường trước trong khe cửa (x 576–716) bấm **S** → ra đứng ô sân dưới bậc, mặt hướng xuống ("Vườn nhà {ten}"). Lúc mờ màn: việc dở trên ô dừng như khi ngủ, cửa sổ đóng, đồng hồ đứng (lý do `areaFade`). Đổi khu xong **tự lưu** (lý do `area`).
- **Chuyển khu dùng chung** (`systems/areas.ts`): máy trạng thái `out → swap → in` + `beginAreaChange(khu, chỗ đứng, hướng)` trong GardenScene — T-054 chỉ cần thêm id khu vào `AreaId` / `AREA_NAMES` và gọi lại.
- **Camera trong nhà cố định:** ảnh phòng 1280×720 × zoom 1,5 = đúng 1920×1080; ngoài tường là nền tối `houseBackdropColor` #1C1612. Tường = giới hạn vật lý = sàn phòng (không cần hộp tường).
- **Đồ đạc:** giường (chân đế 2×2 ô — click / F hỏi "Đi ngủ?" như cũ, từ 18h), **rương** (cửa sổ 2 lưới như thùng bán, `chestSlots` 20 ô = 3 hàng; cất được mọi món kể cả hạt và cuốc; dòng chân "Rương: n/20 ô có đồ"), **bếp rơm** (va chạm 2×1 ô; than hồng nhấp nháy + khói lững lờ vẽ bằng code tại điểm `fire`; F → "Bếp nguội ngắt. Nấu nướng tính sau." — nấu ở T-048), **hũ gạo** (va chạm; F → câu đùa, nấu cơm ở T-048), **nón ông nội** treo vách (đi xuyên; đứng sát vách dưới nón bấm F / click → "Nón ông nội. Rách thế mà ông vẫn cưới được bà!" — câu tạm, Giả định, game-planner duyệt). Bảng tên "Rương", "Bếp". `stove-gach.png` đã nạp, chưa dùng. Bếp + hũ gạo + nón đọc bong bóng kiểu "warn" (click chủ động thì luôn hiện).
- **Chõng trên hiên** không ngủ được nữa: F / click → "Ngủ hiên à? Muỗi nó khiêng đi mất!".
- **Ngủ / thức:** sáng ra luôn đứng **trong nhà cạnh giường** (`wakeSpot` (300, 400) trong ảnh phòng, bên phải giường), kể cả ngủ gục ngoài đồng; bản lưu ngay sau qua đêm cũng ghi khu `house`.
- **Trời trong nhà:** cùng màu lớp trời, độ đục × `houseSkyAlphaMultiplier` 0,6 (Giả định — trong nhà có mái, có bếp).
- **Save version 2** (`@bph/shared`): thêm `chest.slots`; `player.area` = `garden` | `house`; toạ độ người tính **từ góc khu** (trong nhà: góc ảnh phòng). Save version 1 tự nâng (rương trống, vẫn đứng ở Vườn chỗ cũ). Khu lạ → về Vườn chỗ xuất phát; chỗ đứng trong nhà đè đồ đạc / ngoài sàn → đứng ở cửa. Cuốc cất trong rương thì nạp không thêm cuốc thứ hai.
- **Lỗi đã gặp + sửa:** Phaser `Body.reset` kiểm giới hạn thế giới NGAY lúc gọi → phải đổi giới hạn sang khu mới trước khi đặt người (không thì vào nhà xong dính tường sau, ra vườn trôi xuống mép bản đồ).
- **Kiểm:** tsc + lint + Vitest 31 file / 376 test xanh (thêm `house.test.ts`, `areas.test.ts`, 6 test save T-093). Script `web/e2e/diag-t093.mjs` (phím thật trên stack Docker): vào bằng W (màn mờ tới 1, tên khu, tự lưu), va chạm tường sau / trái / phải / trước, giường, rương, bếp đúng mép; nón F ra câu; rương cất 5 khoai (Shift+click) → F5 vẫn trong nhà, khoai còn; 21h trong nhà tối nhẹ; ngủ ở giường → Ngày 2 cạnh giường; ra cửa bằng S → đứng ô (11, 11) trước bậc; ngủ gục ngoài ruộng → sáng dậy trong nhà, save `house` version 2. Ảnh `web/e2e/screenshots/t093-*.png`.
- **Để ý:** e2e cũ ngủ ở chõng (`day.spec`, `qa-t007`, `qa-t008`, `save.spec`) sẽ đỏ — muốn chạy lại thì `debugEnterArea('house')` + đứng `area.house.wakeSpot` (D-036: không bắt buộc). Tiếng mở cửa nhà chưa có (T-025). Nón ông nội treo vách trong khi {ten} vẫn đang đội nón ông — story bible nói nón treo vách là sau "lột xác" (§8); để tạm, game-planner quyết.

---

### T-096 — Click đâu đi đó + tự tìm đường (chuột và chạm như nhau)

**Bước:** 4.4 · **Ai làm:** game-dev · **Size:** L (1 ngày) · **Cần trước:** T-093 · **Quyết định:** D-038

**Mục tiêu:** đi lại hợp cả PC lẫn điện thoại sau này: click / chạm chỗ nào thì {ten} tự tìm đường đi tới, có việc thì tới nơi làm luôn; WASD vẫn dùng được.

**Điều kiện xong:**
- [x] Click ô / vật **trong tầm** → làm ngay như cũ (giữ chuột rê cả luống, hàng chờ, phải cầm cuốc mới cuốc — D-026; không cầm cuốc → bong bóng như cũ).
- [x] Click **ngoài tầm** ô có việc hợp lệ với món đang cầm (cuốc / gieo / tưới / hái / dọn) → đi tới chỗ đứng gần nhất trong tầm rồi làm (cuốc bắt đầu nhát như click thường); trên đường hễ với tới là dừng làm. Việc không hợp lệ (không cầm cuốc, hết hạt, gùi đầy) hay ô trống → chỉ đi tới.
- [x] Click thùng bán / quầy hạt / chõng (Vườn), giường / rương / bếp / hũ gạo / nón (trong nhà) ngoài tầm → tới nơi rồi mở / dùng. Click **khung cửa nhà** (Vườn: ô bậc thềm + hàng trên; trong nhà: khung cửa tường trước) gần hay xa → đi tới cửa rồi vào / ra (màn mờ, tự lưu như T-093).
- [x] **Tự tìm đường vòng** (A* 8 hướng không cắt góc + làm mượt, tự viết) qua nhà, rào, cây, ao, quầy, đồ trong nhà; ô đích bị chặn → ô đi được gần nhất; không có đường → bong bóng `noPath`, không đi. Hiệu năng đủ cho Xóm 60×42 (test 200 lần tìm).
- [x] **Dấu đích** (vòng tròn vẽ bằng code, mờ dần `clickMoveMarkerSeconds`); đi bằng hoạt ảnh đi bộ thật, đổi hướng theo đường, tốc độ `walkSpeed` (đuối chậm như cũ).
- [x] Bấm **WASD** = huỷ đường + việc chờ; mở cửa sổ cũng huỷ; click lên hotbar / nút gùi / cửa sổ không đi; chuột phải vẫn là ăn.
- [x] **Bổ sung (góp ý người dùng, D-038 bổ sung):** việc ruộng phải đứng **sát ô** (`farmWorkRange` 1.2): click ô ruộng xa hơn — kể cả trong tầm 2.5 — tự bước tới đứng cạnh ô (ô kề gần nhất, ưu tiên ô thẳng, không giẫm luống, ưu tiên phía nam), quay mặt rồi làm; rê cả luống = bước dọc luống tới sát từng ô (hàng chờ giữ nguyên, WASD bỏ cả hàng); ô ruộng có việc luôn viền sáng. Unit test `farmStand.test.ts`.
- [x] **Chạm** (touch) = click trái, không phụ thuộc hover; giữ ngón rê = giữ chuột rê. Ghi chỗ còn phụ thuộc bàn phím ở GDD §4 (bản mobile).
- [x] Logic thuần + unit test (`systems/pathfind.ts`, `systems/clickMove.ts`, phần mới ở `house.ts`, `garden.ts`, `movement.ts`); tham số trong `gameConfig.ts`; debug hook `debugState.clickMove`, `debugWorldToScreen`. Không e2e (D-036) — script chụp `web/e2e/diag-t096.mjs`.

**Thông số mới:** `clickMoveMarkerSeconds` 0.6, `clickMoveMarkerRadius` 16, `pathMaxNodes` 6000, `clickMoveBlockedSearchRadius` 6, `clickMoveArrivePx` 3, `clickMoveStuckSeconds` 0.5, `clickMoveMaxReplans` 2, `clickMoveReachMargin` 0.15, `pathSmoothStepPx` 8, `pathClearancePx` 2, `houseNavCellPx` 32 (Giả định, chỉnh khi thử).

**Bạn thử thế nào:** mở http://localhost:5173. (1) Đứng trước sân, click bãi cỏ **sau nhà** → {ten} tự đi vòng hông nhà ra sau (vòng tròn nhỏ hiện chỗ click rồi mờ). (2) Cầm cuốc (ô 1), click một ô ruộng ở xa → đi tới cạnh ruộng rồi tự cuốc. Đổi sang ô hạt rồi click ô cỏ chưa cuốc ở xa → chỉ đi tới, không cuốc. (3) Click **thùng bán** từ xa → tới nơi mở cửa sổ. (4) Click **cửa nhà** từ xa → đi tới rồi vào nhà; trong nhà click **bếp** → đi tới, "Bếp nguội ngắt…"; click **khung cửa** (phần trên hotbar) → ra Vườn. (5) Đang đi bấm **A/D** → dừng ngay, điều khiển bằng phím như cũ. (6) Click giữa **ao** → đi tới bờ ao gần nhất. (7) Nếu có laptop màn cảm ứng / mở DevTools chế độ điện thoại: chạm chỗ nào đi chỗ đó. Cảm giác cần bạn tự đánh giá: tốc độ phản hồi, đường đi có "ngố" không, dấu đích có đủ rõ không.

**Ghi chú khi làm (game-dev, 2026-10-14) — T-096 → 👀 chờ bạn thử:**
- **Tìm đường** `src/systems/pathfind.ts`: lưới `NavGrid` (Uint8Array), `PathFinder` A* 8 hướng dùng lại bộ nhớ (heap nhị phân, "số thế hệ" thay vì xoá mảng), không cắt góc; `search(isGoal, heuristic)` dùng chung cho "tới đúng ô" (A* octile) và "tới ô gần nhất làm được việc" (Dijkstra); `nearestFreeCell` (ô chặn → ô trống gần nhất, hoà thì gần người); `smoothPath` "kéo dây" kiểm bằng cách đặt thử hộp chân dọc đoạn thẳng. Vườn dùng thẳng `blockedGrid` (cây tính cả ô — đường né rộng gốc cây); trong nhà lưới ô 32 px (`houseNavGrid`: ô đi được = hộp chân đứng vừa ở tâm ô, theo `isFreeHouseSpot`). Xóm 60×42 (T-032) chỉ cần đưa lưới vật cản mới vào.
- **Đi theo đường** `src/systems/clickMove.ts`: `planWalk` (điểm / chỗ đứng làm việc), `stepClickMove` (vận tốc mỗi frame, điểm cuối chạy chậm vừa đủ, phát hiện kẹt → GardenScene lập lại đường tối đa `clickMoveMaxReplans` lần). Hướng mặt theo vectơ có "trễ" (`facingFromVector`) để đi chéo không lật mặt liên tục.
- **Bổ sung "đứng sát ô ruộng" (sau góp ý người dùng):** `planFarmStand` (`clickMove.ts`) thử 8 ô kề ô ruộng (ô chéo thì điểm đứng xích vào góc chung `farmStandDiagonalInset`), chi phí = đường đi + phạt (chéo 1.25, giẫm luống 1, không ở phía nam 0.3) → chọn rẻ nhất. `stepTileAction` thêm `canStart`: ô đầu hàng hợp lệ mà chưa đứng sát thì **giữ trong hàng** (không bỏ như trước); `GardenScene.driveTileQueue` thấy rảnh + ô đầu hàng chưa sát → lập đường tới chỗ đứng, tới nơi mới bắt đầu (không bắt đầu giữa đường). Kẹt quá `clickMoveMaxReplans` lần → bỏ ô đó. Rê chỉ xếp thêm ô khi con trỏ (màn) thật sự di chuyển. Diag: click ô (14, 14) từ (8, 17) → đứng cách đúng **1,0 ô** rồi cuốc (`t096-3-toi-roi-cuoc.png`); rê hàng y = 15 → đứng (13, 16) rồi (14, 16) — ngay dưới từng ô, mặt quay lên (`t096-3b-re-ca-luong.png`). Ô giữa ruộng 3×3 thì ô kề nào cũng là luống → đứng trên luống bên cạnh (không tránh được).
- **Đo trên Docker (headless):** lập đường 0,1–5 ms; Vườn đi vòng nhà 21 ô mở; tới thùng bán 155 ô mở.
- **Để ý:** trong nhà nửa dưới khung cửa nằm dưới hotbar → click nửa trên khung cửa (hoặc bấm S như cũ). Đi ra sau nhà thì mái che {ten} (đúng thiết kế T-024). Lưới Vườn tính cả ô gốc cây là chặn nên đường đi hơi "né rộng" cây.

---

### T-092 — Gắn giao diện Lô 1 vào HUD và các cửa sổ đang có

**Bước:** 4.2 · **Ai làm:** game-dev · **Size:** M (3–4h) · **Cần trước:** T-091

**Mục tiêu:** HUD, hotbar, gùi, thùng bán, rương, tổng kết, Tạm dừng, bong bóng dùng giao diện thật.

**Điều kiện xong:**
- [x] Khung 9-slice (`nineslice` của Phaser), ô hotbar, nút, khung HUD, icon HUD, 4 kiểu bong bóng thay hình vẽ bằng code; chữ vẫn ≥ 24px, bố cục 1920×1080 và 1366×768 không đè (D-036: kiểm bằng unit test bố cục + ảnh chụp, không e2e).
- [x] Các cửa sổ làm sau (thoại, cửa hàng, sổ Q…) dùng chung các khung này (`src/ui/uiKit.ts`: `buildPaperWindow`, `UiButton`, `UiFrame`, `addUiIcon`).

**Ghi chú khi làm (game-dev, 2026-10-14):** trạng thái 👀 chờ bạn thử.
- Số lề / cỡ / vùng chữ đọc thẳng từ `public/assets/art/ui/ui.json` (`src/ui/uiSpec.ts`, thuần TS + test) — art đổi ảnh chỉ sửa ui.json. Preload nạp cả 31 ảnh theo ui.json (khóa `ui-<tên>`).
- HUD theo ảnh mẫu `ui-mockup-1-hud.png`: icon bắp tay + ống tre Sức (ruột vẽ dưới ống: nền mực, xanh mạ / vàng < 50% / đỏ son < 20%), bảng gỗ tiền + icon xu, đồng hồ = bảng gỗ + đĩa gỗ (mặt trời / trăng 80 px) + icon mùa quạt nan / áo tơi cạnh giờ; ô hotbar `slot` / `slot-selected` (thay viền vàng vẽ code) / `slot-hover` (rê chuột); nút Gùi = `btn` 92×92 + icon gùi + "E". Tooltip món (rê lên ô hotbar hoặc ô gùi) = khung giấy nhỏ, tên + dòng phụ "Bán 10 quan · Ăn +8 Sức" (`src/ui/itemText.ts`). Tên khu ("Nhà Tý") = khung giấy nhỏ giữa trên màn.
- Mọi cửa sổ (gùi, thùng bán, rương, sạp hạt, hộp hỏi ngủ, tổng kết, Tạm dừng, hộp xác nhận chơi lại) = giấy điệp chữ mực `#2E2118`, dòng phụ nâu đất `#7A4B2A`, nền mực mờ phía sau, **nút X góc trên-phải** (click/chạm: gùi / thùng / sạp / rương = đóng; Tạm dừng = Tiếp tục; hộp hỏi ngủ + xác nhận = Không; tổng kết = Ngày mới). Nút gỗ 4 trạng thái: thường / rê chuột (vàng) / giữ chuột (lún, chữ +12 px) / xám (thiếu tiền, chữ `#6E6658`); nút cao ≥ 84 px. Ô gùi chưa mở (nếu gùi < đủ hàng) hiện `slot-locked` + ổ khóa.
- Bong bóng (vẽ 1:1 với màn dù camera phóng 1,5: container co 1/zoom; chữ 26 px): câu báo → `bubble`, lầm bầm khi xong ô → `bubble-boast` (vàng lấp lánh), chửi thề → ảnh răng cưa phóng 1,6–2 lần (chữ 24 px, 2–3 dòng, vẫn lắc ngang), `bubble-think` có sẵn cho thoại sau (`showBubble(text, kind, style)`).
- Viền ô ngoài tầm (ART-UI-001 A): nét đứt xám tro `#B5AA94` lót mực, đoạn 8 / hở 6 px màn (`tileHighlightOutDashPx`); thêm màu phụ `palette.ash`, `palette.inkMuted`. Ô ruộng có việc mà ngoài tầm vẫn viền sáng (click = đi tới rồi làm, D-038).
- Gợi ý phím đổi theo D-038: "Click/chạm: đi tới & làm · WASD đi · 1–9 chọn" / "E Gùi · Esc Menu · F dùng đồ gần · Shift+click: cả chồng"; phím thử G/F8/F9 chỉ ở bản dev.
- Màn tổng kết: dòng "Bán được: N quan" là chữ đỏ son `#A93226` 44 px, không viền (bỏ kiểu vàng viền đậm của UI cũ).
- Thiếu ảnh / máy không WebGL (NineSlice của Phaser chỉ vẽ trên WebGL) → vẽ hình khối bằng code cùng bố cục + `console.warn('[UI] …')` một lần mỗi ảnh.
- Kiểm: `npm run build`, `lint`, `test` (439 test xanh, thêm `uiSpec.test.ts`, test bố cục nút X / nút ≥ 84 px / ống tre). Ảnh chụp: `web/e2e/diag-t092.mjs` → `web/e2e/screenshots/t092-*.png` (HUD, bong bóng 4 kiểu, viền ngoài tầm, gùi, thùng bán, sạp hạt, tên khu, rương, Tạm dừng, xác nhận, hỏi ngủ, tổng kết, 1366×768). Không có lỗi console.

**Bạn thử thế nào:** mở gùi (E), thùng bán (F), Tạm dừng (Esc): khung giấy điệp, nút có hover.

---

### T-025 — Làm âm thanh Lô 1 (vườn)

**Bước:** 4.3 · **Ai làm:** audio-director · **Size:** L (1 ngày — audio list ước 5–7 giờ) · **Cần trước:** audio list Lô 1

**Mục tiêu:** đủ tiếng cho mọi việc ở vườn trong bảng juice GDD §8.

**Điều kiện xong:**
- [ ] Theo audio list Lô 1, ví dụ: tiếng **chốt** khi xong ô cuốc (thay "bộp" hạ giọng), héo "phù", ăn "nhồm nhoàm", bụng réo khi đuối, ngáp lúc 23h, ngáy khi ngủ gục, gà gáy 6h, "tách tách" tổng kết, "leng keng" nhận tiền, cửa nhà {ten} (T-093), **nhạc đêm**, jingle Lô 1; thay các tiếng "đang mượn tạm" của Lô 1. Âm giao diện cơ bản (miễn phí) có thể kéo lên làm cùng.
- [ ] Hậu kỳ (chuẩn hóa âm lượng, cắt), đặt file `web/client/public/assets/audio/<music|sfx|ui>/`, cập nhật audio list. Bạn nghe duyệt.

**Bạn thử thế nào:** nghe bản nghe thử `audio-director` gửi, chọn bản ưng.

---

### T-026 — Gắn âm thanh Lô 1 và tách kênh Nhạc / Hiệu ứng

**Bước:** 4.3 · **Ai làm:** game-dev · **Size:** M (3–4h) · **Cần trước:** T-025

**Mục tiêu:** tiếng đúng lúc, và có sẵn 2 nút âm lượng riêng cho Cài đặt sau này.

**Điều kiện xong:**
- [x] Gắn từng tiếng vào đúng sự kiện (GDD §8).
- [x] Mọi âm thanh đi qua **một chỗ** (vd `src/systems/audio.ts`) với 2 kênh **Nhạc** và **Hiệu ứng**, âm lượng riêng — để T-085 chỉ cần nối thanh trượt.
- [x] Tiếng lặp có lệch cao độ; cùng một tiếng không phát chồng quá `sfxMaxConcurrent` bản.

**Thông số / ghi chú:** thêm `musicVolume` 0.8, `sfxVolume` 0.9, `sfxMaxConcurrent` 4 (Giả định, chỉnh khi nghe).

**Bạn thử thế nào:** F9 tới 23h: nghe ngáp. Không ngủ tới 24h: nghe ngáy. Sáng ra: gà gáy.

**Ghi chú khi làm (game-dev, 2026-10-15) — T-026 → 👀 chờ bạn nghe thử:**
- **Một chỗ phát:** `src/audio/AudioManager.ts` (Phaser, một cái cho cả game — `AudioManager.of(game)`, sống qua "Chơi lại từ đầu" nên nhạc không ngắt) + logic thuần `src/systems/audio.ts` (kênh, cài đặt, lệch cao độ, chọn nhạc / tiếng nền theo giờ + khu, mờ dần, gà theo ngày — `audio.test.ts`). Mỗi sự kiện gọi theo **tên cue** ở `src/config/soundCues.ts` (biến thể, kênh, âm lượng riêng, có lệch cao độ không, khoảng nghỉ tối thiểu); khoá file ở `config/assets.ts` (nạp đủ 50 file Lô 1 + UI; `soundCues.test.ts` kiểm mọi khoá có WAV thật, không còn `ga-gay.wav` cũ).
- **2 kênh:** Nhạc = nhạc nền + jingle; Hiệu ứng = mọi thứ còn lại (SFX, giọng, tiếng nền `amb-*`, giao diện). Cửa sổ **Tạm dừng** có 2 hàng **Nhạc / Hiệu ứng** với nút gỗ **− / +** (84 px, chạm được), mỗi lần 10 % (`volumeStep`), nút xám ở 0 % / 100 %. Âm lượng lưu **localStorage `bph-settings`** (riêng với save: là cài đặt của máy, "Chơi lại từ đầu" không reset) — T-085 chỉ cần gọi `AudioManager.setChannelVolume`. Mặc định **giữ 0.6 / 0.8** như đang nghe từ bước 2.3 (spec gợi ý 0.8 / 0.9 — muốn to hơn thì đổi `musicVolume` / `sfxVolume` trong gameConfig).
- **Nhạc theo giờ / khu:** Vườn 6h–19h nhạc Vườn; 19h–6h nhạc đêm (`dem-loop`); trong nhà luôn nhạc đêm, ban ngày nhỏ hơn ×0.7 (`houseDayMusicMultiplier`). Đổi bài = đan chéo 1,5 s (`musicCrossfadeSeconds`). Tiếng nền trong nhà ngày / đêm (dế) hiện / tắt dần 1,5 s. Tạm dừng: nhạc + tiếng nền ×0.35 như cũ. Jingle phát → nhạc nền hạ ×0.35 (`jingleMusicDuckMultiplier`) rồi trả lại.
- **Gắn tiếng:** cuốc chốt = file riêng `cuoc-chot` (`tillFinishSfxDetune` 0, `tillFinishSfxVolumeMultiplier` 1); đếm tiền tổng kết = `dem-tien` (`summaryTickVolume` 0.35 → 0.7, bỏ +700 cent) + jingle tổng kết khi mở màn tổng kết; dọn cây héo; sáng ra thấy cây héo → "phù" (sau gà gáy); ăn; vừa hết Sức → càu nhàu rồi bụng réo (0,9 s sau); 23h → ngáp (cả khi F9 nhảy qua); thiếp đi ở giường / ngủ gục → ngáy lặp (nghỉ ngẫu nhiên 0,3–0,6 s; thôi ngủ thì bản đang kêu kêu nốt); cửa nhà vào / ra; rương mở / đóng; thúng bán bỏ / lấy "bịch"; rương: thả món vào / nhấc món ra (UI-007 — chưa có kéo thả, gắn vào click chuyển món); mở / đóng cửa sổ (gùi, thùng, sạp, Tạm dừng, hộp "Đi ngủ?", hộp "Chơi lại?") — game TỰ đóng (đi ngủ, chuyển khu) thì im; hover + click mọi nút gỗ / nút X / nút Gùi / nút sạp còn mua được; lỗi "cộc" (thiếu tiền, gùi đầy, hết hạt, chưa cầm cuốc, không có đường, món không bán được, thùng / rương đầy — nghỉ ≥ 0,25 s); đổi ô hotbar (1–9, cuộn, click). Jingle đầu mùa phát sáng ngày đầu mùa (sau gà gáy). **Nạp sẵn chưa gắn:** nấu bếp (bếp đang "nguội", nấu ở T-048), đóng cọc (T-044), xong nhiệm vụ (T-043), mưa + sấm (chưa có thời tiết — `chooseAmbience` nhận `raining`, AudioManager tự phát sấm 1/2 file cách 25–60 s khi mưa).
- **Gà gáy 6h theo ngày:** gáy lúc màn bắt đầu sáng (sau ngủ / ngủ gục), khi bấm G (dev), và lúc mở game mới Ngày 1 (sau lần bấm đầu — trình duyệt chặn âm thanh tới lúc đó). Kiểu chọn bằng `roosterKindForDay(seed, ngày)`: trọng số 45/15/15/10/10/5, ngày 1 luôn bình thường, trùng hôm trước (trừ bình thường) → kiểu kế tiếp, ngày mưa "khàn" ×3 (chờ thời tiết). Không lệch cao độ. **Save version 3** thêm `seed` (số ngẫu nhiên của lần chơi, tạo lúc game mới); save cũ (v1/v2) nâng lên tự suy seed từ `savedAt` (`@bph/shared` `SAVE_MIGRATIONS[2]`) → F5 cùng ngày cùng kiểu gà.
- **Lệch cao độ ±4 %** (`sfxPitchJitterPercent`): bước chân, thúng, dọn héo, ăn, đếm tiền, click. Giữ số riêng cũ: cuốc ±100 cent, tưới ±100, gieo ±70, xu ±60, cuốc chốt ±30. Không random: gà, jingle, xong nhiệm vụ, hái (thang cao độ). **Phát chồng:** cùng cue (gồm biến thể) đang kêu đủ `sfxMaxConcurrent` 4 bản thì bỏ lần mới.
- **Bước chân khi đi (Should — đã bật):** mỗi lần chạm gót, nhỏ ×0.5 (`walkFootstepVolume`), cỏ → `buoc-co`, lối / sân / ruộng / sàn nhà → `buoc-dat`, lệch cao độ ±4 %, chặn chồng 4 bản. Thấy rối tai thì tắt bằng `walkFootstepSfx: false` hoặc giảm `walkFootstepVolume` / tăng `walkFootstepEverySteps`. Qua cửa nhà đã có bước chân trong tiếng cửa. Dấu đích click: không âm.
- **QA:** `debugState.audio` (khoá, kênh, nhạc / tiếng nền đang phát + âm lượng thật, jingle, ngáy, `recent` các lần phát, `seed`, `roosterToday`, `roosters`, `yawns`, `footsteps`, `volumeHover`), `debugVolumeButtonCenter(id)`. Bố cục Tạm dừng đổi (cao 760, rộng 680) → e2e `time.spec.ts`, `qa-t005` Q8 lấy toạ độ nút "Tiếp tục" qua `debugPauseButtonCenter`; `farm.spec.ts` / `qa-t002b` kiểm tiếng chốt là `sfx-cuoc-chot-*` (chưa chạy lại — D-036).
- **Kiểm chứng:** `npm run test` (client 469 test xanh: thêm `audio.test.ts`, `soundCues.test.ts`, `settingsLocal.test.ts`, ca save v2→v3 / seed, hàng âm lượng trong `hudLayout.test.ts`), `npm run lint`, `tsc`, `npm run build -w @bph/client` (audio:convert sinh OGG/MP3 cho file mới) đều xanh. Không chụp màn hình / e2e (D-036).
- **Đề xuất cho audio-director:** cập nhật bảng "Đang mượn tạm" (đếm tiền, cuốc chốt, nhạc đêm đã gắn) và trạng thái Lô 1 → In-game.

---

### T-027 — "Khoảnh khắc sướng" khi hái, bán và tổng kết ngày (giả thuyết 2)

**Bước:** 4.5 · **Ai làm:** game-dev · **Size:** M (3–4h) · **Cần trước:** T-022, T-026

**Mục tiêu:** cuối vòng có phần thưởng rõ ràng: cây chín gọi người hái, tiền đổ vào túi, tổng kết "rung lên" — kiểm giả thuyết 2 của PT-000 ("phần thưởng còn nhạt").

**Điều kiện xong:**
- [x] Cây chín lấp lánh / nhún nhẹ định kỳ để gọi hái.
- [x] Hái: icon bay có vệt sáng; tiếng pop cao dần (đã có) giữ nguyên.
- [x] Tổng kết ngày: đóng màn tổng kết thì xu bay vào ô tiền HUD, số tiền nhảy, "leng keng". Ngày tiền bán cao nhất từ trước tới giờ → dòng vàng **"Kỷ lục mới!"** (chừa chỗ cho meme `profitArrow` ở T-079; kỷ lục lưu trong save).
- [x] Mua hạt: xu bay khỏi ô tiền.

**Thông số / ghi chú:** thêm `ripeSparkleIntervalSeconds` (2), `coinFlyCount` (6), `coinFlySeconds` (0.6) — Giả định, chỉnh khi thử.

**Bạn thử thế nào:** hái cả luống, bỏ vào thùng, ngủ. Tự hỏi: **"hái và bán đã sướng hơn chưa?"** — câu trả lời ghi vào PT-002 (T-052).

**Ghi chú khi làm (game-dev, 2026-10-20) — T-027 → 👀 chờ bạn chơi thử:**
- **Cây chín gọi hái:** mỗi `ripeSparkleIntervalSeconds` 2 s mỗi cây chín nhún nhẹ (bẹp rồi vươn, gốc đứng yên — `ripeHopSeconds` 0.45, `ripeHopAmount` 0.1) + 2 đốm lấp lánh 4 cánh quanh ngọn (`ripeSparkleCount`, `ripeSparkleSeconds` 0.6, `ripeSparkleSizePx` 22). Các ô **lệch nhịp nhau** theo tỷ lệ vàng (cả luống không nhún đồng loạt như máy). Đốm nằm theo chiều sâu của cây (xem dòng sửa sau QA bên dưới). Nhịp đứng khi mở cửa sổ / Tạm dừng. Đốm là texture vẽ bằng code (`ui/fxTextures.ts`, trắng điệp + vàng hoa hòe) — chưa cần gen ảnh. Cây vẽ bằng code dự phòng (thiếu ảnh) thì chỉ lấp lánh, không nhún.
- **Hái — vệt sáng:** icon món bay vào hotbar có quầng sáng + 5 chấm vệt sáng lùi dần trên đường bay (`harvestTrailCount` 5, `harvestTrailGapSeconds` 0.035, `harvestTrailAlpha` 0.75, `harvestTrailSizePx` 60; hoà màu ADD). Mua hạt (icon hạt bay vào hotbar) cũng có vệt. Tiếng pop cao dần **không đổi**.
- **Tổng kết → xu bay về ô tiền:** tiền bán vẫn vào ví ngay lúc qua đêm (save ghi ngay như cũ — F5 không mất / không nhân đôi), nhưng ô tiền HUD **giữ số cũ** tới khi bấm "Ngày mới": 6 đồng xu (`coinFlyCount`; tiền ít hơn 6 quan thì ít xu hơn) cất cánh lần lượt (`coinFlyStaggerSeconds` 0.07) từ dòng "Bán được…", bay vồng (`coinFlyArcPx` 150), lật xoay, rơi vào icon xu ở ô tiền trong `coinFlySeconds` 0.6. **Mỗi đồng chạm: số nhảy lên đúng phần của đồng đó** + ô tiền nảy (`moneyBumpScale` 0.25, `moneyBumpSeconds` 0.22) + "leng keng" nhỏ (cue `coinLand`, × `coinLandSfxVolume` 0.55, nghỉ 0,12 s); đồng cuối: "leng keng" đầy (`coin`) + chữ "+N quan" bay. Lúc đó màn còn đang sáng dần → ô tiền được đưa lên trên lớp tối cho thấy xu rơi vào. Qua đêm bằng **G** (dev, không có tổng kết): xu bay ngay từ đầu {ten}.
- **"Kỷ lục mới!":** đêm bán được nhiều tiền nhất từ trước tới giờ (nhiều hơn hẳn; đêm bán 0 không tính; **đêm có tiền đầu tiên của lần chơi luôn là kỷ lục** — lần đầu thấy thùng ra tiền cũng là khoảnh khắc sướng) → chữ vàng viền mực, nghiêng như con dấu, ở **cuối dòng tiền** (bên phải "Bán được: N quan"), đóng dấu xuống ngay khi số tiền đếm xong (`summaryRecordPopSeconds` 0.35, nảy từ ×1.7 — `summaryRecordPopScale`) + "ting" (tiếng xu nâng +700 cent — `summaryRecordSfxDetune`, cue `recordNew`; chờ tiếng sáo của meme `profitArrow`). Enter lần 1 hiện luôn dấu. **Chỗ chừa cho T-079:** `summaryRecordAnchor()` (hudLayout) — mũi tên đặt ngay trái chữ / chen xuống giữa dòng tiền và dòng sau, không phải dời dòng khác (tổng kết vẫn đủ 6 dòng trên nút). Logic `systems/records.ts` (`noteDaySale`), nhịp dấu `recordProgress` (daySummary.ts).
- **Save version 4** (`@bph/shared`): thêm `records: { bestDaySale }`; save cũ (v1–v3) nâng lên → kỷ lục 0 (`SAVE_MIGRATIONS[3]`). Kỷ lục tính cho mọi cách qua đêm (ngủ, ngủ gục, G).
- **Mua hạt:** xu (bằng số quan vừa trả, tối đa 6) cùng cất cánh từ ô tiền HUD, toả ra rơi vào chỗ icon hạt trên nút vừa bấm; số tiền trừ ngay như cũ (xu chỉ là hình), chữ "−4 quan" giữ nguyên. Đang mở sạp thì ô tiền nổi trên nền tối của cửa sổ để thấy xu bay ra.
- **Logic thuần + test:** `src/systems/juice.ts` (đường bay vồng + vệt, mẻ xu: chia tiền / chạm lần lượt / tiền giữ lại, nhịp gọi hái, nhún, chỗ đốm lấp lánh) — `juice.test.ts`; `records.test.ts`; thêm ca kỷ lục trong `daySummary.test.ts`, `save.test.ts` (v3→v4, v1→v4, kỷ lục hỏng → không nạp), `hudLayout.test.ts` (chỗ chữ Kỷ lục không đè dòng tiền).
- **QA:** `debugState.juice` thêm `ripeCues`, `ripeSparkles`, `ripeHopping`, `coinFlights`, `coinBatches`, `coinBatchesStarted`, `coinsLandedIn`, `pendingPayout`, `moneyShown`, `record { bestDaySale, newToday, badgeProgress, sfxPlayed }`; `debugState.hud` thêm `trailVisible`, `coinsVisible`, `moneyScale`, `moneySpotlight`, `summaryRecord`, `summaryRecordAlpha/Scale`; hàm `debugSetRecord(n)`. **E2E đọc `hud.moneyText` ngay sau khi qua đêm phải chờ xu bay xong** (~1 s, hoặc `juice.coinFlights === 0`) — đã sửa `day.spec.ts` sang `expect.poll`; chưa chạy e2e (D-036).
- **Kiểm chứng:** `npm run test` (client 497 test xanh, +28), `npm run lint`, `tsc` (client + e2e), `npm run build` (shared → server → client) đều xanh. Không chụp màn hình / e2e (D-036).
- **Sửa sau QA (game-dev, 2026-10-20):** (1) đốm lấp lánh không còn ở trên lớp trời (đè lên {ten} và tán nhãn) — depth = gốc cây + 0.5 (`SPARKLE_DEPTH_ABOVE_CROP`, GardenScene): ngay trên cây, dưới {ten} khi {ten} đứng trước, dưới tán nhãn và lớp trời; đốm vẽ blend **ADD** (cộng sáng vào cây) nên chiều tối bị trời phủ (tối nhất 45%) vẫn là chỗ sáng nhất quanh đó. (2) Chữ số tiền nảy bị giới hạn để không lòi khỏi bảng gỗ: `moneyTextArea()` / `moneyTextScale(bump, rộng chữ, rộng vùng)` (hudLayout + test) — số dài nảy ít hơn, nếu ngay lúc đứng yên đã quá vùng chữ (~158 px) thì co lại cho vừa; icon xu vẫn nảy đủ. BUG-016 (`save.spec.ts` so với `GAME_SAVE_VERSION`) đã sửa. Kiểm: client 499 test xanh (+2), lint, `tsc` client + e2e xanh; chưa chạy e2e (D-036).
- **Giả định cần bạn cảm nhận:** độ "lố" của nhún / lấp lánh (thấy rối mắt → tăng `ripeSparkleIntervalSeconds` hoặc giảm `ripeHopAmount`), xu bay nhanh / chậm (`coinFlySeconds`), tiếng leng keng mỗi đồng có ồn không (`coinLandSfxVolume`).

---

### T-028 — Gen hình Lô 2a: nhà và công trình Xóm

**Bước:** 4.2 · **Ai làm:** art-director · **Size:** L (1 ngày) · **Cần trước:** asset list Lô 2

**Mục tiêu:** đủ nhà và công trình để dựng Xóm làng Lầy (GDD §5, D-027).

**Điều kiện xong:**
- [ ] Theo asset list Lô 2: nhà {ten}, 3 biến thể nhà + nhà bỏ hoang, lò rèn, xưởng mộc, cổng ngõ, đình, giếng, miếu, quán chè, lều chợ phiên, bến câu (gãy / lành), bến nước.
- [ ] **(D-040)** Mảnh ranh giới khuôn viên ART-BLD-017: tường đất thấp, tường gạch mộc thấp, tường gạch đình + cổng 2 trụ biểu, cổng tre ngõ chung — ghép nối được theo ô (ngang / dọc / góc), cùng chuẩn với mảnh rào tre / dâm bụt Lô 1. Sạp phiên có mái ART-BLD-018 làm ở T-097.
- [ ] Nhà quay mặt về nam, nhìn 3/4 trên-nam, đúng kích thước ô gợi ý. Hậu kỳ, đặt file, cập nhật asset list. Bạn duyệt.

**Thông số / ghi chú (D-040):** ảnh tham chiếu bố cục: concept mới ART-CON-002 (`art-source/reference/concept-xom-lang-lay-v2.png`). Size vẫn L (+~0,5 giờ cho mảnh tường).

**Bạn thử thế nào:** xem ảnh so sánh, duyệt.

---

### T-029 — Gen hình Lô 2b: nền, nước hồ, cây, rào, đồ trang trí

**Bước:** 4.2 · **Ai làm:** art-director · **Size:** L (1 ngày) · **Cần trước:** asset list Lô 2

**Mục tiêu:** đủ nền và cây để Xóm liền mạch.

**Điều kiện xong:**
- [ ] Theo asset list Lô 2: sân gạch, nước hồ + bờ (viền tự nối), lũy tre, cây đa (tách tán / gốc), bụi cây, lau sậy / sen, 2 sheet đồ trang trí, vật chặn cổng theo level. (Đường đất, cây nhãn, rào đã làm ở Lô 1 — T-019, T-020.)
- [ ] Đủ các loại cụm thực vật GDD §5 (D-035): bụi cỏ, mười giờ, cúc dại (đi xuyên — thấp, không có chân đế); dâm bụt, chè tàu, duối, **khóm tre lẻ** khác lũy tre viền (chặn — tách gốc / lá để vẽ lá đè người); sen trên mặt hồ.
- [ ] **(D-040)** Sheet vườn nhà NPC ART-ENV-018: giàn trầu, nương chè xanh (luống chè cắt bằng — **khác hẳn luống rau**), gốc rạ + đống rơm; cây cau ART-ENV-007 (Should trong ngân sách) — cau **thân mảnh thẳng, tán nhỏ chùm trên ngọn, có buồng cau**, không giống dừa. Rau / lúa trong vườn dùng hình cây Lô 1, không gen thêm.
- [ ] Hậu kỳ, đặt file, cập nhật asset list. Bạn duyệt.

**Bạn thử thế nào:** xem ảnh so sánh, duyệt.

---

### T-030 — Gen hình Lô 2c: NPC chính ở Xóm

**Bước:** 4.2 · **Ai làm:** art-director · **Size:** L (1 ngày) · **Cần trước:** asset list Lô 2

**Mục tiêu:** U Hến, ông Gật + gà Mái Mơ, cô Tám Thóc, ông Hai Bễ, chú Đục, bà Ba Trầu có hình trên bản đồ và chân dung thoại.

**Điều kiện xong:**
- [ ] Sprite bản đồ (đứng 2 khung) + chân dung thoại (số biểu cảm theo asset list), giữ visual hook trong story bible.
- [ ] Giao diện đi kèm: khung thoại dưới màn + khung chân dung, tab cửa hàng + dòng món (asset list Lô 2) — dùng ở T-034, T-036.
- [ ] Hậu kỳ, đặt file, cập nhật asset list. Bạn duyệt.

**Bạn thử thế nào:** xem ảnh so sánh, duyệt.

---

### T-031 — Gen hình Lô 2d: năm dân làng phụ

**Bước:** 4.2 · **Ai làm:** art-director · **Size:** L (1 ngày) · **Cần trước:** asset list Lô 2

**Mục tiêu:** bà Chém, ông Khướt, cô Ngóng, anh Tráng, trẻ trâu Sún–Hĩm–Cò có hình + hoạt ảnh tại chỗ (GDD §14 mục D-021).

**Điều kiện xong:**
- [ ] Theo asset list Lô 2 (~12 ảnh: ngồi, nằm ngủ, sau rào, tập võ, trẻ trâu 3 đầu nhảy).
- [ ] Hậu kỳ, đặt file, cập nhật asset list. Bạn duyệt.

**Thông số / ghi chú:** nếu trễ: mục cắt C4 giữ 3 người (ông Khướt, cô Ngóng, trẻ trâu). **(D-040)** NPC đình (cụ Từ Nhang, cụm cụ Hoàn + cụ Chiếu) và người bán chợ phiên gen ở **T-097** (cùng đợt, có thể làm liền sau T-031 trong một phiên gen); ông Mõ ART-CHR-072 lên Should **trong ngân sách** — gen ở T-097.

**Bạn thử thế nào:** xem ảnh so sánh, duyệt.

---

### T-032 — Dựng bản đồ Xóm làng Lầy 72×50 bằng hình khối, thay bản đồ Vườn

**Bước:** 4.4 · **Ai làm:** game-dev · **Size:** L (1 ngày) · **Cần trước:** T-043, T-093

**Mục tiêu:** mở game là ở trong Xóm: nhà {ten} + ruộng góc tây-bắc, ra ngõ thấy các nhà, giếng, hồ, cây đa, đình (hình khối + nhãn tên) — mọi thứ của prototype vẫn chạy.

**Điều kiện xong:**
- [ ] Bản đồ dạng **Tilemap JSON** (định dạng Tiled; game-dev được sinh bằng script từ dữ liệu bố cục nếu không dùng Tiled — Giả định). Lớp Nền / Vật cản / Trên đầu; lớp đối tượng: ruộng 24 ô (`maxPlots`, mở trước `startPlots` 9), giường, bếp, thùng bán, 2 cổng (chặn), quầy hạt, lò rèn, xưởng mộc, điểm `npcSpots`, 2 bến câu.
- [ ] Đúng bảng tọa độ GDD §5 (bản D-040), `villageMapSize` [72, 50]; nhà quay mặt về nam. **Mỗi nhà một khuôn viên khép kín** bằng khối ranh giới (màu khác nhau cho rào tre / dâm bụt / chè tàu / tường đất / tường gạch) theo mục "Khuôn viên từng nhà": cổng lệch, thụt 1 ô, ngõ chung Gật–Tám và Cu Sún–Tráng; vào được sân, không vào nhà. Dữ liệu khuôn viên dạng `{ id, rect, fence, gate }` (ghép mảnh thật ở T-099). Chừa ô cho vườn NPC (T-099) và 5 gian + quán chè ở chợ phiên (T-098).
- [ ] Va chạm bằng lớp Tilemap (bài học BUG-001); tán cây đa / mái nhà vẽ trên người; camera dừng ở mép.
- [ ] Lối đi **đất nện** (khối màu đất) và **cụm thực vật** (khối màu xanh, phân biệt chặn / đi xuyên) đặt theo GDD §5 mục "Lối đi đất nện và cụm thực vật" (D-035): tre, lùm cây, dâm bụt chặn; bụi cỏ, mười giờ, cúc dại đi xuyên; không cụm chặn nào trên đường / ngõ / lối, cách điểm tương tác ≥ 1 ô.
- [ ] Cuốc–gieo–tưới–hái, thùng bán, ngủ, qua đêm chạy như cũ ở tọa độ mới; nhà {ten} + cửa vào **cảnh trong nhà** (T-093) giữ nguyên; quầy hạt chuyển sang hiên nhà cô Tám (vẫn không người tới T-036).
- [ ] Level, nhiệm vụ, hướng dẫn ngày 1 (T-041 … T-043, đã làm trên Vườn) vẫn chạy: mũi tên chỉ đúng ô ruộng mới.
- [ ] Save: `player.area` = `village`. Save Vườn cũ nạp được: 9 ô cũ chuyển sang 9 ô đầu của ruộng Xóm theo thứ tự, nhân vật đứng cạnh giường, không mất cây / tiền / gùi (Giả định).
- [ ] e2e cũ sửa theo tọa độ mới; thêm ca đi từ cổng nhà tới giếng, bến câu, sân đình không kẹt.

**Thông số / ghi chú:** `villageMapSize` [72, 50] (D-040). Bảng cụm thực vật D-035 còn tọa độ 60×42 — đặt lại theo tên vùng (GDD §5 ghi chú D-040). Ảnh tham chiếu: concept ART-CON-002 (đã duyệt — chừa ô cổng đình mặt nam như concept; bến câu thứ 2 theo GDD, concept thiếu). Đối chiếu thời gian đi bộ với bảng GDD §5; lệch > 30% thì báo `game-planner`. Có thể giữ `?scene=garden` để so (game-dev quyết, ghi chú). Size vẫn L nhưng ở đầu trên (~8 giờ).

**Bạn thử thế nào:** mở game, đi từ cổng nhà tới quầy cô Tám (~7–8 giây), giếng (~11 giây), sân đình (~21 giây, đi vòng vào cổng mặt nam). Đi vào sân nhà ông Gật qua ngõ chung, thử đi tắt qua rào — phải bị chặn. Tự hỏi: đi trong xóm **xa quá hay vừa**?

---

### T-033 — Gắn hình Lô 2 lên bản đồ Xóm

**Bước:** 4.2 · **Ai làm:** game-dev · **Size:** L (1 ngày) · **Cần trước:** T-028, T-029, T-032

**Mục tiêu:** Xóm trông như ảnh concept: nhà Bắc Bộ, cây đa, hồ, lũy tre.

**Điều kiện xong:**
- [ ] Thay hình khối bằng nhà, cây, nước, đường, rào, lũy tre thật; viền nước / đường tự nối; tán cây, mái vẽ trên người.
- [ ] Đường đất nện + cụm thực vật bằng hình thật (D-035): khóm tre / lùm cây / dâm bụt chỉ chặn ở gốc, lá vẽ đè người; bụi cỏ / hoa thấp không va chạm. e2e đi hết đường xóm, ngõ giữa, đường cái không kẹt.
- [ ] Vùng va chạm khớp chân nhà / gốc cây: không kẹt, không đi xuyên tường (e2e ép tường 4 mặt một nhà mẫu và gốc đa).
- [ ] Ghi tổng dung lượng asset sau Lô 2 (mục tiêu tải lần đầu < 30 MB, GDD §12) và FPS khi đi qua chỗ nhiều đồ nhất (mục tiêu ≥ 50 trên máy test — chợ phiên ngày phiên là chỗ đông nhất).
- [ ] **(D-040)** Đặt ~60–80 cụm thực vật trên bản 72×50; đình có tường gạch + cổng trụ biểu, chợ phiên có lều + sạp thật (sạp phiên từ T-097 khi có).

**Thông số / ghi chú:** D-040 thêm ~2 giờ (bản đồ rộng hơn, nhiều cụm hơn); vẫn L. Ranh giới khuôn viên + vườn gắn ở T-099.

**Bạn thử thế nào:** đi một vòng Xóm, so với ảnh concept ART-CON-002, chụp màn hình chỗ đẹp nhất và chỗ "lạ" nhất gửi lại.

---

### T-034 — Hệ NPC: đứng tại chỗ, nói chuyện, khung thoại có chân dung

**Bước:** 4.4 · **Ai làm:** game-dev · **Size:** L (1 ngày) · **Cần trước:** T-032

**Mục tiêu:** đi tới NPC bấm F là nói chuyện được — nền móng cho cửa hàng, nhiệm vụ, mặc cả.

**Điều kiện xong:**
- [ ] `src/data/npcs.json` + kiểu `NpcData` (id, tên, sprite, chân dung, `schedule` 4 khung, `lines` có điều kiện) theo GDD §3.16.
- [ ] NPC chính đứng ở chỗ của khung "Sáng" (lịch đầy đủ ở T-035), có va chạm nhỏ, quay mặt về {ten} khi nói.
- [ ] F khi đứng cạnh / click / chuột phải trong `interactRange` → **khung thoại** dưới màn: chân dung trái, tên, tối đa 2 câu, Space / click qua câu, thay `{ten}`. Đồng hồ dừng (`PauseReasons` thêm `dialogue`), Esc đóng.
- [ ] Chọn câu theo điều kiện (khung giờ, mùa, level tối thiểu, bậc ngoại hình, cờ sự kiện): câu đúng điều kiện ưu tiên hơn câu chung, không lặp câu vừa nói — hàm thuần + unit test.
- [ ] Chưa có art T-030 thì NPC là hình khối màu + nhãn tên; có rồi thì gắn luôn.

**Bạn thử thế nào:** nói chuyện với U Hến ở hiên nhà và ông Hai Bễ ở lò rèn: khung thoại hiện, Space qua câu, đồng hồ đứng yên.

---

### T-035 — Lịch trình 4 khung giờ và giờ mở cửa hàng

**Bước:** 4.4 · **Ai làm:** game-dev · **Size:** M (3–4h) · **Cần trước:** T-034

**Mục tiêu:** làng "sống": NPC đổi chỗ theo giờ, quầy hàng có giờ mở cửa.

**Điều kiện xong:**
- [ ] Sang khung mới (`npcSlotHours` 6 / 12 / 19 / 22): NPC ngoài màn chuyển ngay; trong màn mờ đi `npcSwapFadeSeconds` rồi hiện chỗ mới; đêm ẩn (về nhà), riêng ông Khướt ngủ gốc đa. Theo bảng lịch GDD §3.16.
- [ ] Mở game / F5 giữa ngày → NPC đúng chỗ theo giờ (không lưu vị trí NPC).
- [ ] Cửa hàng mở `shopOpenHour`–`shopCloseHour` (6–19h); ngoài giờ click quầy → bong bóng chủ quán (story bible §3.14), không mở cửa sổ.
- [ ] Unit test "NPC đứng đâu lúc h giờ".
- [ ] **(D-040)** Lịch hiểu **ngày đặc biệt**: `schedule` cho phép chỗ đứng riêng khi `marketDay` (ngày phiên), `eveOfMarketDay` (hôm trước phiên), `seasonFirstDay`; không khai thì dùng chỗ thường; "ẩn" là một chỗ hợp lệ. Hàm thuần `isMarketDay(day)` (từ `marketDayFirst`, `marketDayInterval`) + unit test (ngày 1 không phiên; 3, 6, 9 có). NPC đình (cụ Từ, cụm cờ) có lịch theo GDD §3.16.

**Thông số / ghi chú:** `npcSlotHours`, `shopOpenHour`, `shopCloseHour`, `npcSwapFadeSeconds` (GDD §3.16); `marketDayFirst`, `marketDayInterval` (§3.9b). D-040 +~1 giờ, vẫn M.

**Bạn thử thế nào:** đứng ở lò rèn, F9 tới 19h: ông Hai Bễ mờ đi; ra quán chè thấy ông ở đó; click lò rèn → "TAO ĐI UỐNG CHÈ! MAI!".

---

### T-036 — Quầy hạt cô Tám Thóc và cửa sổ cửa hàng dùng chung

**Bước:** 4.4 · **Ai làm:** game-dev · **Size:** M (3–4h) · **Cần trước:** T-035

**Mục tiêu:** mua hạt ở quầy cô Tám thay cái hộp hạt tạm; có một cửa sổ cửa hàng dùng lại cho mọi quầy.

**Điều kiện xong:**
- [ ] Bỏ sạp hạt tạm. Nói chuyện với cô Tám trong giờ mở → cửa sổ cửa hàng.
- [ ] Cửa sổ **dùng chung**: danh sách món (icon, tên, giá, "Có: N", nút Mua), có tab — lò rèn / xưởng mộc (T-050), sạp bà Cân (T-064), tab Sắm sửa (T-067) dùng lại.
- [ ] Giữ luật T-006: Shift+click mua 5, thiếu tiền nút xám, gùi đầy không mất tiền. Món chưa mở theo level: xám + "Lv N" (khi có level, T-042).
- [ ] Cô Tám nói câu theo tình huống mua sắm (story bible §6.6 câu 1–5): mở sạp, mua ít, mua nhiều, bấm Mua khi thiếu tiền — trong khung thoại của cửa sổ, không chặn bấm tiếp.
- [ ] Chừa chỗ trên cửa sổ cho nút **"Kỳ kèo [K]"** cạnh tên chủ quán và một dải phiếu bớt / thêm trên danh sách món (T-095 làm luật; tính giá đi qua **một hàm giá chung** để T-095 cắm phiếu vào, D-037).

**Bạn thử thế nào:** 8h sáng tới quầy cô Tám mua hạt cải; 20h tới thì cô báo đóng cửa.

---

### T-037 — Chốt thoại Xóm cho `npcs.json`

**Bước:** 4.4 · **Ai làm:** game-planner · **Size:** ~~S~~ **M (3h — D-040)** · **Cần trước:** —

**Mục tiêu:** game-dev có bảng câu chép thẳng vào dữ liệu, không phải tự nghĩ câu.

**Điều kiện xong:**
- [ ] Rà story bible §3.13, §3.14, §6.1: đủ câu cho 6 NPC chính ở Xóm (chào, theo giờ, đóng cửa, khu chưa mở) và 5 dân làng phụ (2–4 câu, có điều kiện giờ / level / bậc); câu cửa nhà ông Khướt, nhà bỏ hoang, sạp chợ phiên trống, bến gãy.
- [ ] **(D-040)** Thêm: cụ Từ Nhang (câu "xem ngày" mưa / nắng có điều kiện `tomorrowWeather`), cụ Hoàn + cụ Chiếu (cặp câu cãi nhau), ông Mõ (rao phiên, rao mùa), 5 người bán chợ phiên (câu mở gian, mua ít / nhiều, thiếu tiền, cô Lanh "hết tiền" khi chạm trần), câu click vườn + cửa nhà hàng xóm. Tên + giá món mới chợ phiên (GDD §3.9b) thành bảng cho `items.json`.
- [ ] Mỗi câu ≤ 90 ký tự; điều kiện ghi bằng tên trường; tổng chữ cả game vẫn ≤ ~300 câu.
- [ ] **Kỳ kèo (D-037)**: chép story bible §6.6 vào bảng — 9 câu chọn (`kyKeoStyle`: `flatter` / `sob` / `brag`), `kyKeoAffinity` của 3 người bán, đủ ~2 câu/kết quả (`success` / `fail` / `backfire`) cho cô Tám, ông Hai Bễ, chú Đục, câu "lần 2 trong ngày", 1 câu "Làng đồn". Câu chọn ≤ 60 ký tự.

**Bạn thử thế nào:** đọc bảng câu, gạch câu không thích.

---

### T-038 — Dân làng phụ, NPC đình và các câu đùa trong Xóm

**Bước:** 4.4 · **Ai làm:** game-dev · **Size:** ~~M~~ **L (6–7h — D-040)** · **Cần trước:** T-034, T-037 (gắn hình T-031, T-097 khi có)

**Mục tiêu:** đi đâu trong xóm cũng có người nói một câu "lầy" (pillar "Mặc cả lầy lội"); sân đình có người.

**Điều kiện xong:**
- [ ] Bà Chém, ông Khướt, cô Ngóng, anh Tráng, trẻ trâu Sún–Hĩm–Cò đứng đúng chỗ theo khung giờ (GDD §3.16), hoạt ảnh tại chỗ 2–3 khung.
- [ ] **(D-040)** Cụ Từ Nhang (quét sân / ngủ gật hiên / thắp hương), **cụm cụ Hoàn + cụ Chiếu** (một NPC hai người: click → một cụ nói, đôi khi cụ kia cãi lại bằng bong bóng thứ hai sau ~1,5 s), ông Mõ (Should: rao chiều trước phiên ở cổng đình, sáng phiên ở đầu chợ, sáng đầu mùa ở đường cái).
- [ ] **(D-040, Should)** Câu "xem ngày" của cụ Từ đọc thời tiết ngày mai tính từ `seed` + số ngày (`weatherHintFromTempleKeeper`); hàm thuần `weatherForDay(seed, day)` dùng chung với T-046 + unit test "cụ nói mưa thì mai mưa thật".
- [ ] F / click → bong bóng trên đầu `npcBubbleSeconds` (3 s), không khóa điều khiển, đồng hồ chạy, xoay vòng câu theo điều kiện; tối đa 1 bong bóng NPC trên màn (riêng cặp cụ cờ được 2, nối tiếp).
- [ ] Click cửa nhà ông Khướt, nhà bỏ hoang, sạp chợ phiên trống, **cửa nhà hàng xóm** → bong bóng như GDD §5 / story bible §3.14.

**Bạn thử thế nào:** nói chuyện với ông Khướt ở gốc đa buổi sáng rồi ở quán chè buổi tối: câu khác nhau. Click cửa nhà ông: nghe "giọng" bà Khướt. Ra sân đình: click hai cụ đánh cờ xem cãi nhau; hỏi cụ Từ rồi ngủ — mai đúng như cụ nói.

---

### T-095 — "Kỳ kèo": mặc cả nhẹ khi mua (D-037)

**Bước:** 4.4 · **Ai làm:** game-dev · **Size:** M (3–4h) · **Cần trước:** T-036, T-037 (chưa có T-037 thì dùng câu ở story bible §6.6)

**Mục tiêu:** mua hạt ở quầy cô Tám có thêm một trò đùa nhỏ: xin bớt tiền bằng một câu nói, được bớt hoặc bị cà khịa (pillar "Mặc cả lầy lội"). Hệ làm **dùng chung**, T-050 chỉ cần bật cho 2 thợ.

**Điều kiện xong:**
- [ ] Nút **"Kỳ kèo [K]"** trong cửa sổ cửa hàng (chỉ ở quầy có trong `kyKeoShops`). Bấm → 3 câu chọn (click / phím 1–3, nhãn nhỏ "Nịnh", "Kể khổ", "Khoác lác"); Esc thôi, không mất lượt. Dùng rồi → nút xám "Mai kỳ kèo tiếp"; bấm lần nữa → câu "lần 2" của NPC.
- [ ] Hàm thuần `rollKyKeo(affinity, level, rng)` → `success` / `fail` / `backfire` theo `kyKeoOutcomeOdds`, cộng `kyKeoLevelBonusPerLevel` (trần `kyKeoLevelBonusMax`) chuyển từ thất bại sang thành công. Unit test: đúng tỷ lệ với rng giả, level 1 và level 10, tổng xác suất = 1.
- [ ] **Phiếu một lần** cho quầy đó: thành công → bớt `kyKeoDiscountByAffinity`; phản tác dụng → thêm `kyKeoBackfireMarkup`. Áp cho lần trả tiền kế tiếp (một lần Mua kể cả Shift×5 / Chế / Sửa), **không** áp cho tab Sắm sửa. Giữ tới khi dùng hoặc hết ngày; đóng cửa sổ không mất.
- [ ] Hàm giá chung: gộp `shopDiscount` (bậc ngoại hình) + phiếu, trần `kyKeoMaxTotalDiscount` 20% và `kyKeoMaxDiscountQuan` 40, thêm tối đa `kyKeoMaxMarkupQuan` 20; bớt làm tròn xuống tới quan, giá ≥ 1. Unit test các trần (vd bếp gạch 400 chỉ bớt tối đa 40).
- [ ] Hiện: dải xanh "Bớt 15% lần mua tới" / đỏ "Thêm 10% lần mua tới"; giá cũ gạch ngang, giá mới trên nút. NPC nói câu kết quả trong khung thoại của cửa sổ (chân dung sẵn có).
- [ ] Juice theo GDD §8 (3 dòng kỳ kèo): chữ "−15%" xanh / "+10%" đỏ bay, cửa sổ nảy / chân dung lắc; âm dùng tạm tiếng có sẵn ("leng keng", "bộp") nếu chưa có SFX riêng. Thất bại → gọi meme "Trừ sĩ diện" nếu bộ điều phối meme đã có (T-078), chưa có thì bỏ qua (có cờ `kyKeoFailFaceDamage`).
- [ ] Phản tác dụng ở cô Tám → bật cờ `kyKeoGossipToday` (để "Làng đồn" ưu tiên câu kỳ kèo khi làm "Làng đồn" — Should).
- [ ] Save (v2): quầy đã kỳ kèo hôm nay, phiếu đang giữ, cờ đồn; sang ngày mới xóa. Debug hook: `debugState.kyKeo` (lượt, phiếu, kết quả cuối) + hàm ép kết quả `debugForceKyKeo('success'|'fail'|'backfire')` cho QA.
- [ ] Thông số trong `gameConfig.ts` đúng tên GDD §3.9a; `kyKeoAffinity` + câu trong `npcs.json`.

**Thông số / ghi chú:** GDD §3.9a (bảng `kyKeo*`), §8; câu ở story bible §6.6. Không có nút ở sạp bà Cân, nhà cụ Bá Kẹo.

**Bạn thử thế nào:** 8h sáng tới quầy cô Tám, bấm **N**, chọn câu **"Khoác lác"** (cô mê nhất). Được bớt → thấy dải xanh và giá gạch ngang; mua 1 gói hạt → giá rẻ hơn, dải biến mất. Bấm N lần nữa → cô bảo "Kỳ kèo một lần thôi em". Muốn xem đủ 3 kết quả: dùng bảng Thử (T-041) ép kết quả, hoặc ngủ sang ngày mới thử lại.

---

### T-097 — Gen hình Lô 2f: chợ phiên, NPC đình, người bán (D-040)

**Bước:** 4.2 · **Ai làm:** art-director · **Size:** M (3–4h) · **Cần trước:** asset list Lô 2 (mục D-040); nên làm sau T-031 để dùng chung `--ref`

**Mục tiêu:** chợ phiên có người bán và sạp có hàng, sân đình có cụ Từ và hai cụ đánh cờ — đủ hình để T-038, T-098 gắn.

**Điều kiện xong:**
- [ ] Người bán (đứng sau sạp, 2 khung, 64×96): **cô Lanh, bà Xén, chị Cục Tác** (Must); ông Vung, ông Lái Giống (Should trong ngân sách nếu Lô 2 không vượt) — đúng visual hook story bible §3.13.
- [ ] NPC đình: **cụ Từ Nhang** 2 khung (bó hương phải **to, khói rõ** — concept ART-CON-002 bó hương khó thấy); **cụm cụ Hoàn + cụ Chiếu** một ảnh 2 khung (~192×128) gồm chiếu + bàn cờ; **ông Mõ** 2 khung (ART-CHR-072, lên Should trong ngân sách).
- [ ] Sạp phiên có mái ART-BLD-018 (bản trống + bản có hàng: thúng rau / hòm hàng xén / lồng gà / chồng nồi / thúng hạt); người đi chợ ART-CHR-080 (2–3 dáng tĩnh, đổi màu áo bằng script); sheet icon món mới ART-ITM-008 (chè xanh, bánh đúc, kẹo lạc, muối, khăn vuông, nồi đất, **icon HUD "gánh hàng" báo phiên**, bó mạ tẻ / nếp cho Đồng Lầy — D-041; trứng luộc, men rượu đã có ở ITM-007 / ITM-005).
- [ ] Hậu kỳ, đặt file, cập nhật asset list (chi thật so với ước ~5,8 USD gồm Should trong ngân sách). Bạn duyệt.

**Thông số / ghi chú:** gen bằng `--ref` ảnh mẫu nhân vật chính (D-014) và concept ART-CON-002. Trẻ con / người đi chợ có thể tô màu lại bằng script (0 USD).

**Bạn thử thế nào:** xem ảnh so sánh, duyệt: nhận ra từng người ở cỡ nhỏ không (lồng gà, vung nồi, bàn tính, bó hương)?

---

### T-098 — Chợ phiên Lầy: lịch phiên, gian hàng, thu mua (D-040)

**Bước:** 4.4 · **Ai làm:** game-dev · **Size:** L (6–7h) · **Cần trước:** T-035, T-036 (gắn hình T-097 khi có)

**Mục tiêu:** cứ 3 ngày một lần, buổi sáng chợ đông người, mua được đồ ăn / men rượu / trứng, bán nông sản ngay cho cô Lanh (pillar "Làm giàu từ hai bàn tay").

**Điều kiện xong:**
- [ ] Ngày phiên (`isMarketDay` từ T-035), 6–12h: người bán đứng sau gian, người đi chợ (`phienCrowdCount`, Should) đứng quanh sạp; 12h tan (mờ đi), sạp về trống. Ngày thường: sạp trống, chỉ quán chè bà Chém mở.
- [ ] Click người bán lúc chợ họp → **cửa sổ cửa hàng chung** (T-036) với tên + biểu tượng gian (không chân dung, không nút Kỳ kèo). Đang mở cửa sổ lúc 12h → mua nốt, đóng mới tan.
- [ ] 4 gian Must: bà Chém (chè xanh mọi ngày; bánh đúc, kẹo lạc ngày phiên), bà Xén (men rượu, muối, khăn vuông), chị Cục Tác (trứng luộc; gà con chỉ hiện sau cưới — cờ `married`), **cô Lanh thu mua**: kéo / click món trong gùi để bán ngay giá × `phienSellMultiplier`, tổng mỗi phiên ≤ `phienSellCapPerDay`, quá trần → câu "Hết tiền rồi anh, phiên sau." (dùng lại luật bán ngay của T-064 nếu đã có, chưa có thì viết hàm chung để T-064 dùng lại). Should: ông Vung (câu đùa + Could nồi to), ông Lái Giống (1–2 hạt đã mở, rẻ `phienSeedDiscount`, chọn theo `seed` + ngày).
- [ ] Món mới trong `items.json` (tên, giá, Sức hồi — bảng ở T-037 / GDD §3.9b); ăn được bằng chuột phải như khoai.
- [ ] Báo phiên **bằng hình**: sáng ngày phiên băng chữ "Hôm nay phiên chợ Lầy — họp tới trưa" + icon gánh hàng cạnh đồng hồ HUD (tắt lúc 12h); tổng kết ngày hôm trước có dòng "Mai phiên chợ".
- [ ] Hàm thuần + unit test: tính tiền thu mua có trần, hạt hạ giá theo seed, ngày phiên. Save: tiền đã bán cho cô Lanh hôm nay (xóa sang ngày). Debug: `debugState.market` (`isMarketDay`, `open`, `soldToLanhToday`), `debugSetDay(n)` hoặc dùng bảng Thử (T-041).
- [ ] Thông số `marketDayFirst`, `marketDayInterval`, `marketOpenHour`, `marketCloseHour`, `phienSellMultiplier`, `phienSellCapPerDay`, `phienSeedDiscount`, `phienCrowdCount` trong `gameConfig.ts`.

**Thông số / ghi chú:** GDD §3.9b; câu ở story bible §3.13 (người bán chợ phiên). Cắt nếu trễ: C4a(d) — chợ chỉ là cảnh, giữ bát chè (task còn M).

**Bạn thử thế nào:** dùng bảng Thử nhảy tới sáng ngày 3: thấy băng chữ + icon gánh hàng; ra chợ thấy người bán; mua bánh đúc, ăn (+Sức); bán 10 củ khoai cho cô Lanh, thấy tiền về ngay và đắt hơn thùng bán; bán tiếp tới khi cô hết tiền. Chờ tới 12h: chợ tan. Sang ngày 4: sạp trống, quán chè vẫn mở.

---

### T-099 — Khuôn viên từng nhà + vườn NPC theo mùa (D-040)

**Bước:** 4.2 · **Ai làm:** game-dev · **Size:** M (3–4h) · **Cần trước:** T-032 (hình T-028 mảnh tường, T-029 sheet vườn khi có). Đổi theo mùa dùng mùa của T-045 — làm T-099 trước T-045 thì vườn để hình mùa nắng, hàm đổi mùa có sẵn và tự chạy khi T-045 xong

**Mục tiêu:** mỗi nhà trong Xóm có rào / tường / cổng thật và vài nhà có vườn xanh đổi theo mùa — làng trông "có người ở", đi theo ngõ, không đi tắt qua sân.

**Điều kiện xong:**
- [ ] Từ dữ liệu khuôn viên (`fence`, `gate`, T-032) code tự rải mảnh ranh giới theo cạnh: rào tre, dâm bụt (Lô 1, `systems/propArt.ts`), chè tàu, tường đất, gạch mộc, tường gạch đình (ART-BLD-017); góc nối đúng; cổng là ô đi được, cánh cổng vẽ mở. Va chạm chỉ ở chân mảnh (bài học BUG-001).
- [ ] 5 vườn (GDD §5 "Khuôn viên từng nhà"): đặt hình cây trồng Lô 1 giai đoạn chín trên nền đất ruộng (không phải ô ruộng của người chơi), đổi theo mùa; nương chè, giàn trầu, gốc rạ / đống rơm từ ART-ENV-018. Hàm thuần `npcGardenSprite(garden, season)` + unit test.
- [ ] Click vườn → bong bóng chủ nhà nếu đang ở nhà, không thì {ten} (câu T-037). Vườn không cuốc / gieo / hái được (con trỏ không hiện viền ô ruộng).
- [ ] Debug: `debugState.compounds` (số mảnh, cổng), `debugState.npcGardens` (mùa, hình).

**Thông số / ghi chú:** chưa có hình mới thì tường = khối màu, nương chè / giàn trầu = khối xanh + nhãn. Cắt nếu trễ: C4a(c) vườn không đổi mùa.

**Bạn thử thế nào:** đi quanh xóm: nhà nào cũng có rào hoặc tường, chỉ vào được qua cổng; nhìn rào biết nhà nghèo, tường + cổng mái là nhà khá. Ngày 1 (mùa nắng) vườn cô Ngóng là cải; nhảy sang mùa mưa (bảng Thử) thành rau muống, thửa lúa anh Tráng xanh mạ.

---

### T-039 — Làm âm thanh Lô 2 (Xóm)

**Bước:** 4.3 · **Ai làm:** audio-director · **Size:** L (1 ngày — audio list ước 8–10 giờ) · **Cần trước:** audio list Lô 2

**Mục tiêu:** Xóm nghe như có người ở.

**Điều kiện xong:**
- [ ] Theo audio list Lô 2: **nhạc ngày Xóm bản B** (đội chọn, D-034), lớp môi trường (gà, búa lò rèn xa, cưa xa, giếng, hồ), **mỗi NPC một bộ giọng "lẩm bẩm" tổng hợp** (NPC chính + 5 dân làng phụ), ngáy, "hây-a", trẻ con cười, tiếng cửa hàng (trả tiền, cửa gỗ).
- [ ] Hậu kỳ, đặt file, cập nhật audio list. Bạn nghe duyệt.
- [ ] (D-037, nếu `audio-director` thêm vào audio list Lô 2) 3 SFX tổng hợp cho kỳ kèo: "ting" được bớt, kèn hỏng "phụt" phản tác dụng; thất bại dùng chung "bộp" trừ sĩ diện. Không có thì T-095 dùng tiếng sẵn có.

**Bạn thử thế nào:** nghe bản nghe thử, duyệt.

---

### T-040 — Gắn âm thanh Lô 2

**Bước:** 4.3 · **Ai làm:** game-dev · **Size:** M (3–4h) · **Cần trước:** T-038, T-039

**Mục tiêu:** đi gần lò rèn nghe búa to dần; NPC nói có giọng riêng.

**Điều kiện xong:**
- [ ] Lớp môi trường to / nhỏ theo khoảng cách tới nguồn (lò rèn, xưởng mộc, giếng, hồ), qua kênh Hiệu ứng.
- [ ] Mở thoại / bong bóng → giọng lẩm bẩm của NPC đó (mỗi người một cao độ). Nhạc Xóm thay nhạc Vườn.
- [ ] **(D-040)** Ngày phiên 6–12h: lớp tiếng nền **chợ phiên** (ồn chợ, gà kêu, rao xa — dùng lại tiếng nền chợ của audio list nếu có, hạ âm lượng) to dần khi lại gần chợ; người bán + NPC đình dùng bộ giọng sẵn có đổi cao độ (Giả định: không gen giọng mới); mõ "cốc cốc" khi ông Mõ rao. Thêm ~0,5 giờ, vẫn M.

**Bạn thử thế nào:** đi ngang lò rèn: tiếng búa to dần rồi nhỏ dần. Nói chuyện với trẻ trâu: nghe cười. Sáng ngày 3 đi về phía chợ: tiếng chợ to dần.

---

### T-041 — Save version 2 và bảng phím thử cho chặng 4

**Bước:** 4.4 · **Ai làm:** game-dev · **Size:** M (3–4h) · **Cần trước:** T-024 (chen sớm theo D-034: T-041 … T-043 làm ngay sau T-027, trên bản đồ Vườn; T-032 chuyển sang Xóm sau)

**Mục tiêu:** có chỗ lưu cho level, nhiệm vụ, nông cụ, gia đình…; bạn và QA nhảy nhanh tới phần muốn thử mà không phải chơi lại từ đầu.

**Điều kiện xong:**
- [ ] `GAME_SAVE_VERSION` = 2 ở `@bph/shared`: thêm `progress` (xp, level, quests), `flags`, `tools` (độ bền), `outfitTier`, `family`, `weather`, `records` (kỷ lục) — mặc định rỗng. **Nâng cấp từ v1** trong `SAVE_MIGRATIONS` + unit test (save v1 thật của prototype nạp được, không mất gì).
- [ ] **Bảng "Thử"** (chỉ bản dev, `devCheatsEnabled`): đặt level, +100 quan, nhảy ngày / mùa, cho món bất kỳ, bật cờ (đã cưới, bếp gạch…), mở khu. Gợi ý phím dev có dòng mở bảng. Bản build không có.

**Thông số / ghi chú:** các task sau thêm nút vào bảng Thử khi cần. Không đổi luật "không lưu giữa chuỗi đêm" (D-025).

**Bạn thử thế nào:** bản dev mở bảng Thử, cho mình 500 quan và Lv 5; bấm F5: vẫn còn.

---

### T-042 — Level và tiếng tăm

**Bước:** 4.4 · **Ai làm:** game-dev · **Size:** L (1 ngày) · **Cần trước:** T-041

**Mục tiêu:** làm gì cũng thấy "tiếng tăm" tăng, lên level có thứ mới để mong (giả thuyết 1: thiếu mục tiêu).

**Điều kiện xong:**
- [ ] XP theo bảng GDD §7 (hái 2/5, hái lượm 1, cá, gà rừng, chế đồ / sắm đồ 10, bán ở chợ 1 mỗi 20 quan, nhiệm vụ) qua một hàm chung `grantXp`; `xpToNextLevel`, `xpPerLevelAfter10`.
- [ ] HUD góc trên trái: "Lv 1 · Nghèo kiết xác" + thanh XP mảnh; chữ "+2 tiếng tăm" bay khi hái (gộp khi hái liên tiếp, như BUG-012).
- [ ] Lên level: chữ lớn "Lên level 3!" + thẻ **"Mở khóa"** (cây, khu, công thức, bộ đồ — đọc từ dữ liệu); đồng hồ dừng khi thẻ hiện. Tổng kết ngày thêm dòng "Tiếng tăm hôm nay: +N".
- [ ] Dữ liệu mở khóa theo level ở một file dữ liệu (vd `src/data/levels.json` — Giả định) để task sau chỉ thêm dòng.
- [ ] Unit test: cộng XP, lên nhiều level một lần, level 10+.

**Thông số / ghi chú:** `xpToNextLevel` [30, 60, 100, 150, 200, 260, 330, 400, 480], `xpPerLevelAfter10` 90.

**Bạn thử thế nào:** Chơi lại từ đầu, hái 15 cây (G cho nhanh): lên Lv 2, thẻ "Mở khóa: Núi sau nhà" (khu chưa có thì thẻ vẫn hiện — mở thật ở T-054).

---

### T-043 — Nhiệm vụ, sổ nhiệm vụ (Q) và hướng dẫn ngày 1

**Bước:** 4.4 · **Ai làm:** game-dev · **Size:** L (1 ngày) · **Cần trước:** T-042

**Mục tiêu:** luôn có một việc cụ thể đang làm ("Ruộng đầu tay 2/3"), người mới được dắt tay ngày 1.

**Điều kiện xong:**
- [ ] `quests.json` đủ **9 nhiệm vụ** (GDD §7) với yêu cầu dạng dữ liệu (đếm việc: cuốc / gieo / tưới N ô, mua ô, nộp món, chế món, câu N cá…). Task này làm **chạy trọn nhiệm vụ 1**; nhiệm vụ khác hoàn thành được khi tính năng của nó có (ghi ở từng task).
- [ ] Phím **Q** mở sổ: đang làm (thanh tiến độ), đã xong; chọn 1 nhiệm vụ hiện ở HUD góc trên phải.
- [ ] Xong: con dấu đỏ **"XONG"** đóng xuống + thưởng XP / tiền ngay.
- [ ] **Ngày 1:** đồng hồ đứng tới khi xong "Ruộng đầu tay"; mũi tên nhấp nháy chỉ chỗ cần click + một dòng nhắc phím theo thứ tự (WASD đi → cuốc đang ở ô 1, click ô ruộng → phím 2 chọn hạt, gieo → tưới) — GDD §11.
- [ ] Gợi ý phím thêm "Q Nhiệm vụ".

**Bạn thử thế nào:** Esc → Chơi lại từ đầu. Làm theo mũi tên tới khi dấu "XONG" đóng xuống; đồng hồ bắt đầu chạy.

---

### T-044 — Mở rộng ruộng bằng cọc rào

**Bước:** 4.4 · **Ai làm:** game-dev · **Size:** M (3–4h) · **Cần trước:** T-032, T-042

**Mục tiêu:** có chỗ tiêu tiền thấy ngay kết quả: ruộng to dần (giả thuyết 3: 9 ô quá ít).

**Điều kiện xong:**
- [ ] Click / F cọc rào mép ruộng → hỏi "Mua thêm 3 ô — 40 quan?"; mua xong 3 ô mới hiện (bụi cỏ bung). Tới `maxPlots` 24 thì cọc biến mất.
- [ ] Lần mua đầu tính cho nhiệm vụ 2 "Rào vườn" (phần ruộng).
- [ ] Save lưu số ô đã mở; unit test giá từng lần + trần.

**Thông số / ghi chú:** `plotExpansionSize` 3, `plotExpansionCosts` [40, 100, 180, 280, 400], `maxPlots` 24.

**Bạn thử thế nào:** bảng Thử cho 200 quan, mua 2 lần: ruộng 15 ô.

---

### T-045 — Đủ 5 cây, theo mùa, mở theo level

**Bước:** 4.4 · **Ai làm:** game-dev · **Size:** M (3–4h) · **Cần trước:** T-036, T-042 (hình ở T-022)

**Mục tiêu:** mỗi mùa có quyết định "trồng gì lãi hơn" (giả thuyết 3).

**Điều kiện xong:**
- [ ] Thêm rau muống (mưa), dưa hấu (nắng, Lv 3), lúa nếp (mưa, Lv 5) vào `crops.json` theo bảng GDD §3.4.
- [ ] Quầy cô Tám bán theo mùa + level; hạt trái mùa xám ("Trái mùa"), không gieo được hạt trái mùa; cây gieo trước khi đổi mùa vẫn lớn tới khi hái (A1).
- [ ] Sáng ngày đầu mùa: băng chữ "Mùa mưa tới rồi!" trên màn (ngoài dòng ở tổng kết).

**Bạn thử thế nào:** bảng Thử nhảy tới ngày 5: quầy chỉ bán rau muống, khoai (và lúa nếp nếu Lv 5); hạt cải xám.

---

### T-046 — Thời tiết: ngày mưa tự tưới

**Bước:** 4.4 · **Ai làm:** game-dev · **Size:** M (3–4h) · **Cần trước:** T-045

**Mục tiêu:** mùa mưa thật sự "mưa": được tưới miễn phí, câu cá và hái nấm khác đi.

**Điều kiện xong:**
- [ ] 6h chọn thời tiết theo `rainChanceDrySeason` / `rainChanceRainySeason`; ngày 1 luôn nắng; ngày đầu của mùa mưa đầu tiên luôn mưa. Lưu trong save.
- [ ] Ngày mưa: mọi ô đã gieo tự được tưới, hạt mưa + màn sẫm nhẹ (không che ruộng, giữ FPS), icon mưa cạnh "Ngày 6 · Mùa mưa".
- [ ] Có cờ "đang mưa" cho câu cá (T-058) và nấm (T-055) dùng.

**Thông số / ghi chú:** `rainChanceDrySeason` 0.15, `rainChanceRainySeason` 0.6; thêm `rainTintAlpha` (0.15 — Giả định).

**Bạn thử thế nào:** bảng Thử nhảy tới ngày 5: trời mưa, ô đã gieo tự sẫm màu.

---

### T-047 — Kéo thả trong gùi, tooltip đầy đủ, ăn trong gùi

**Bước:** 4.4 · **Ai làm:** game-dev · **Size:** M (3–4h) · **Cần trước:** —

**Mục tiêu:** tự xếp đồ lên hotbar (GDD §3.9), xem đủ thông tin món.

**Điều kiện xong:**
- [ ] Cửa sổ gùi (E): kéo thả món giữa các ô (đổi chỗ / gộp chồng), kéo lên hàng hotbar.
- [ ] Chuột phải món ăn trong gùi = ăn (như chuột phải trên hotbar).
- [ ] Tooltip: tên, giá bán, hồi Sức, giá trị lễ vật (nếu có), độ bền (nông cụ — khi có T-049).
- [ ] Unit test đổi chỗ / gộp không mất, không sinh đồ.

**Bạn thử thế nào:** bấm E, kéo khoai từ hàng dưới lên ô 3; chuột phải một củ khoai trong gùi để ăn.

---

### T-048 — Bếp: nấu ăn và nồi cơm

**Bước:** 4.4 · **Ai làm:** game-dev · **Size:** M (3–4h) · **Cần trước:** T-047, T-093

**Mục tiêu:** có chỗ biến nông sản / cá / nấm thành đồ ăn hồi nhiều Sức; áp lực tiền cơm nhẹ.

**Điều kiện xong:**
- [ ] Click / F bếp trong nhà → cửa sổ món: Cơm (trả `riceCost`), Khoai nướng, Nấm xào, Măng luộc, Cá nướng (theo loại), Trứng luộc, Gà rừng nướng; thiếu nguyên liệu thì xám. Nấu tốn `cookGameMinutes` (đồng hồ nhảy, không chờ thật), món vào gùi.
- [ ] `items.json`: `staminaRestore` theo bảng GDD §3.2; có cờ bếp gạch → nhân `kitchenUpgradeStaminaMultiplier`.
- [ ] Chừa chỗ công thức hũ rượu nếp (T-069).

**Thông số / ghi chú:** `riceCost` 5, `cookGameMinutes` 30, `kitchenUpgradeStaminaMultiplier` 1.5.

**Bạn thử thế nào:** vào bếp nấu 1 bát cơm: mất 5 quan, đồng hồ nhảy 30 phút; ăn được +30 Sức.

---

### T-049 — Nông cụ trên hotbar, độ bền và "cùn"

**Bước:** 4.4 · **Ai làm:** game-dev · **Size:** M (3–4h) · **Cần trước:** T-042

**Mục tiêu:** nông cụ mòn dần, phải ghé thợ sửa — lý do quay lại lò rèn, tiêu tiền nhẹ (D-008).

**Điều kiện xong:**
- [ ] `tools.json` đủ: cuốc gỗ / sắt, rìu cũ / sắt, cần tre / trúc, nỏ, **bình tưới cũ** / thùng tưới (D-034: đổi tên từ "gáo dừa" cho khớp hình ART-CHR-008; thùng tưới dùng chung hoạt ảnh, chỉ khác icon) (`maxDurability`, `tillStrikesPerPlot` cho cuốc…).
- [ ] (Giả định theo D-026) rìu, cần câu, nỏ là món hotbar, **phải cầm** mới chặt / câu / bắn; tưới vẫn không cần cầm gì, có thùng tưới trong gùi thì tự tưới 3 ô. Game mới có rìu cũ ở ô trống kế cuốc.
- [ ] Độ bền −1 (cuốc: xong ô; rìu: mỗi nhát; cần: mỗi lượt quăng; nỏ: mỗi lượt bắn). ≤ `toolLowDurabilityWarn` → thanh bền dưới icon hotbar vàng; 0 → **cùn** đỏ + chửi "cuốc cùn" + Sức × `brokenToolStaminaMultiplier` (cần / nỏ: vùng × `brokenToolZoneMultiplier` ở mini-game).
- [ ] Độ bền hiện ngay trên ô hotbar (bỏ ô "Nông cụ" góc dưới trái của GDD §11 — Giả định, vì D-026 đưa nông cụ lên hotbar).

**Thông số / ghi chú:** `toolLowDurabilityWarn` 0.25, `brokenToolStaminaMultiplier` 2, `brokenToolZoneMultiplier` 0.7.

**Bạn thử thế nào:** bảng Thử đặt cuốc còn 1 điểm bền, cuốc 1 ô: icon đỏ, {ten} chửi; ô sau tốn 8 Sức.

---

### T-050 — Chế đồ, nâng cấp và sửa ở lò rèn, xưởng mộc

**Bước:** 4.4 · **Ai làm:** game-dev · **Size:** L (1 ngày) · **Cần trước:** T-036, T-049

**Mục tiêu:** đổi củi, tre, tiền thành công cụ tốt hơn — thấy rõ "làm giàu từ hai bàn tay".

**Điều kiện xong:**
- [ ] Cửa sổ cửa hàng chung (T-036) có tab **Chế** và **Sửa** ở lò rèn ông Hai Bễ / xưởng mộc chú Đục: công thức bảng GDD §3.8 (tối đa 2 vật liệu + tiền công, mở theo level, xám khi thiếu); thợ "chê khó" 1 câu (giá cố định).
- [ ] Chế xong có ngay: cuốc sắt (5 nhát, 2 Sức / ô), rìu sắt, cần tre, cần trúc, thùng tưới (3 ô cùng hàng), gùi to (`bagSlotsUpgraded` 27), nỏ, bếp gạch (cờ `kitchenUpgraded`); chuồng để T-075.
- [ ] Sửa: `repairCostPerPoint` × số điểm thiếu, làm tròn lên, về đầy ngay.
- [ ] Nhiệm vụ 3 "Cuốc mới, sức mới" và 8 "Có bếp mới có vợ" hoàn thành được.
- [ ] **Kỳ kèo (D-037)**: bật hệ T-095 cho lò rèn ông Hai Bễ và xưởng mộc chú Đục (thêm id vào `kyKeoShops`, `kyKeoAffinity` + câu từ T-037); phiếu áp cho một lần Chế hoặc Sửa; bếp gạch 400 chỉ bớt tối đa 40 quan.

**Thông số / ghi chú:** `repairCostPerPoint` 0.5, `bagSlotsUpgraded` 27, `bambooRodZoneBonus` 0.2. Vật liệu củi / tre có từ T-055; trước đó thử bằng bảng Thử.

**Bạn thử thế nào:** bảng Thử cho 5 củi + 100 quan + Lv 3; chế cuốc sắt ở ông Hai Bễ; cuốc 1 ô: chỉ 5 nhát. Thử thêm: bấm N ở ông Hai, chọn câu "Nịnh" (khen khỏe) → thường được bớt; chọn "Khoác lác" → ông hay nghe nhầm thành "thêm tiền".

---

### T-051 — Chửi thề đủ các trigger

**Bước:** 4.4 · **Ai làm:** game-dev · **Size:** S (1–2h) · **Cần trước:** —

**Mục tiêu:** {ten} "lầy" đúng lúc (GDD §3.12), không chỉ khi đuối.

**Điều kiện xong:**
- [ ] Trigger: mệt (Sức < `grumbleLowStaminaThreshold` và vừa làm việc), buồn ngủ (≥ `grumbleSleepyHour`), hỏng việc, mất tiền — các trigger hỏng việc / mất tiền là **hàm gọi được** để task sau nối (cá sổng, nỏ trượt, gà mổ rau, lợn sổng, bố vợ từ chối, ăn cháo).
- [ ] `grumbleChance`, `grumbleCooldownSeconds`; không chửi khi đang thoại / trong nhà bố vợ; câu từ story bible §6.3, không lặp câu vừa nói. Unit test chọn câu + nghỉ.

**Thông số / ghi chú:** `grumbleChance` 0.35, `grumbleCooldownSeconds` 45, `grumbleLowStaminaThreshold` 0.2, `grumbleSleepyHour` 22.

**Bạn thử thế nào:** F8 tới dưới 20 Sức rồi cuốc vài ô; F9 tới 22h: thỉnh thoảng có câu chửi.

---

### T-052 — Mốc giữa chặng 4: chơi thử PT-002 và soát tiến độ

**Bước:** 4.4 · **Ai làm:** game-planner + bạn · **Size:** S (1–2h) · **Cần trước:** T-027, T-043, T-045

**Mục tiêu:** biết sớm game đã "vui" hơn chưa (giả thuyết 1–3 của PT-000) và chặng 4 có kịp mốc D-034 không.

**Điều kiện xong:**
- [ ] Bạn chơi **2 ngày game** từ "Chơi lại từ đầu", không dùng phím thử, theo kịch bản "Kế hoạch PT-002" trong `docs/playtests.md`; trả lời các câu về mục tiêu, phần thưởng, lựa chọn.
- [ ] `game-planner` ghi PT-002, so giờ thật đã dùng với ước lượng, dự báo lại ngày xong chặng 4.
- [ ] Dự báo trễ > 3 tuần so với mốc D-034 → đề xuất cắt theo "Thứ tự cắt khi sản xuất" (GDD §14), bạn chọn, ghi D-NNN. Nhanh hơn nhiều → cập nhật mốc.

**Bạn thử thế nào:** chơi như người chơi thật rồi kể lại bằng lời thường.

---

### T-053 — Gen hình Lô 3a: Núi sau nhà

**Bước:** 4.2 · **Ai làm:** art-director · **Size:** L (1 ngày) · **Cần trước:** asset list Lô 3

**Mục tiêu:** đủ hình cho khu Núi và việc ở Núi.

**Điều kiện xong:**
- [ ] Theo asset list Lô 3: nền / cảnh Núi, đường mòn, cây củi, bụi tre, bụi nấm / măng / sim, bụi rậm có gà; icon nấm, măng, sim, củi, tre; động tác **chặt** (rìu) 4 hướng + dáng **cầm cần câu** (bậc 1).
- [ ] Hậu kỳ, đặt file, cập nhật asset list. Bạn duyệt.

**Bạn thử thế nào:** xem ảnh so sánh, duyệt.

---

### T-054 — Chuyển khu qua cổng và bản đồ Núi (hình khối)

**Bước:** 4.4 · **Ai làm:** game-dev · **Size:** M (3–4h — nhẹ hơn vì T-093 đã làm chuyển cảnh chung) · **Cần trước:** T-033, T-042, T-093

**Mục tiêu:** đi bộ ra cổng là sang khu khác; cổng khu chưa mở bị chặn (pillar "Mỗi khu một trò").

**Điều kiện xong:**
- [ ] Dùng lại hàm chuyển cảnh của T-093 cho cổng: tới cổng → màn mờ → hiện ở đầu đường khu kia, tên khu hiện 2 giây, **tự lưu khi qua cổng**, save lưu `area`; mỗi khu một Tilemap, chỉ nạp khu đang đứng.
- [ ] Cổng chặn theo level (thân cây đổ / biển "Lv 2"); click → bong bóng.
- [ ] Bản đồ Núi 48×36 bằng hình khối: đường mòn, lớp đối tượng chỗ đặt điểm tài nguyên, bụi rậm gà rừng.
- [ ] Ngủ gục ở Núi → sáng dậy ở nhà (GDD §3.1). e2e: qua lại 2 khu; F5 ở Núi vào lại đúng Núi.

**Bạn thử thế nào:** bảng Thử Lv 2, đi ra cổng bắc sau nhà: màn mờ, chữ "Núi sau nhà"; quay về Xóm được.

---

### T-055 — Hái lượm và chặt củi, tre trên Núi

**Bước:** 4.4 · **Ai làm:** game-dev · **Size:** M (3–4h) · **Cần trước:** T-049, T-054

**Mục tiêu:** Núi có việc riêng: hái đồ ăn, gom vật liệu chế đồ.

**Điều kiện xong:**
- [ ] Mỗi sáng đặt lại điểm tài nguyên ngẫu nhiên trong chỗ đặt sẵn theo `mountainNodeCounts` (nắng / mưa, bảng GDD §3.5); nấm gấp đôi ngày mưa.
- [ ] Hái: click = 1 món (`staminaCostForage`, +1 XP). Chặt: cầm rìu, mỗi nhát 1 món (rìu sắt `ironAxeYieldPerChop`), `staminaCostChop`, hết `chopsPerNode` nhát thì cây biến mất tới sáng.
- [ ] Giá bán vào dữ liệu; nhiệm vụ 2 (nộp 5 củi) hoàn thành được.

**Thông số / ghi chú:** `staminaCostForage` 2, `staminaCostChop` 4, `chopsPerNode` 3, `ironAxeYieldPerChop` 2.

**Bạn thử thế nào:** lên Núi hái 2 nấm, cầm rìu chặt 1 cây củi 3 nhát.

---

### T-056 — Gắn hình Lô 3a lên Núi

**Bước:** 4.2 · **Ai làm:** game-dev · **Size:** M (3–4h) · **Cần trước:** T-053, T-055

**Mục tiêu:** Núi có hình thật, {ten} vung rìu thật.

**Điều kiện xong:**
- [ ] Cảnh, điểm tài nguyên, icon vật liệu, động tác chặt (khung chạm khớp nhát chặt); va chạm khớp hình.

**Bạn thử thế nào:** lên Núi đi một vòng, chặt một cây.

---

### T-057 — Gen hình Lô 3b: mini-game câu cá và bắn nỏ

**Bước:** 4.2 · **Ai làm:** art-director · **Size:** M (3–4h) · **Cần trước:** asset list Lô 3

**Điều kiện xong:**
- [ ] Theo asset list Lô 3: phao, 5 icon "cá" (rô, trê, chép, lóc, dép tổ ong), khung bụi rậm phóng to, gà rừng (chạy 2–3 khung + mổ đất), nỏ, mũi tên. Hậu kỳ, đặt file. Bạn duyệt.

**Thông số / ghi chú:** nếu cắt C6 (bỏ nỏ) thì chỉ làm phần câu cá.

**Bạn thử thế nào:** xem ảnh so sánh, duyệt.

---

### T-058 — Mini-game câu cá ở hồ làng

**Bước:** 4.4 · **Ai làm:** game-dev · **Size:** L (1 ngày) · **Cần trước:** T-033, T-046, T-050

**Mục tiêu:** đứng trên bến câu, giữ chuột kéo cá — trò thứ hai của "Mỗi khu một trò".

**Điều kiện xong:**
- [ ] Luật GDD §3.6 đầy đủ: chỉ câu khi đứng trên bến câu; bến **gãy** tới Lv 4 (click mặt hồ → "Tiên sư cái bến!"), Lv 4 nói chuyện với chú Đục là bến được sửa (Giả định) → bến lành.
- [ ] Cầm cần, click mặt nước: quăng (`staminaCostMinigame`, −1 bền) → chờ `fishBiteWaitMin/Max` (mưa × `rainBiteWaitMultiplier`) → phao giật, dấu "!" → trong `fishBiteWindowSeconds` giữ chuột / Space → thanh kéo trên đầu (kim, vùng xanh theo cá, thanh "bắt được").
- [ ] Cá chọn theo trọng số mùa / thời tiết (`fish.json`); cần trúc rộng vùng; cần cùn hẹp vùng. Esc bỏ cuộc (không hoàn Sức). Đồng hồ vẫn chạy.
- [ ] Cá sổng / dép tổ ong → gọi trigger chửi; nhiệm vụ 4 (chế cần tre + câu 3 cá) hoàn thành được.
- [ ] Logic thuần + unit test (kim, thanh, chọn cá).

**Thông số / ghi chú:** đủ bảng tham số GDD §3.6 (`fishBiteWaitMin` 2 … `catchDrainPerSecond` 0.2).

**Bạn thử thế nào:** bảng Thử Lv 4 + cần tre; nói chuyện chú Đục; đứng trên bến Tây click mặt hồ, chờ "!" rồi giữ / thả chuột cho kim nằm trong vùng xanh.

---

### T-059 — Mini-game bắn nỏ săn gà rừng

**Bước:** 4.4 · **Ai làm:** game-dev · **Size:** L (1 ngày) · **Cần trước:** T-050, T-054

**Mục tiêu:** trò của Núi: canh đúng lúc bắn gà rừng — lễ vật quý cho sính lễ.

**Điều kiện xong:**
- [ ] GDD §3.7: gà xuất hiện `junglefowlSpawnsPerDay` lần ở bụi rậm (7–17h), ở lại `junglefowlStayGameMinutes`, bụi rung + icon lông gà.
- [ ] Cầm nỏ, click bụi trong tầm → khung giữa màn, `crossbowArrowsPerRound` mũi, gà chạy qua lại, thỉnh thoảng dừng mổ; vùng tâm `crossbowHitZoneWidth`; trượt thì gà nhanh hơn; trúng +1 gà rừng (+15 XP); hết tên → chửi.
- [ ] Nhiệm vụ 7 hoàn thành được. Logic thuần + unit test.

**Thông số / ghi chú:** đủ bảng tham số GDD §3.7. Cắt C6 → bỏ task này, nhiệm vụ 7 đổi thành "bán 20 bó củi".

**Bạn thử thế nào:** bảng Thử Lv 8 + nỏ; lên Núi chờ bụi rung, click bụi, bắn khi gà vào vạch đỏ.

---

### T-060 — Làm âm thanh Lô 3a (Núi, câu cá, nỏ)

**Bước:** 4.3 · **Ai làm:** audio-director · **Size:** L (1 ngày — Lô 3 âm thanh ước 15–19 giờ, chia T-060 + T-080) · **Cần trước:** audio list Lô 3

**Điều kiện xong:**
- [ ] Theo audio list Lô 3: nhạc Núi, chặt "cốc", hái lượm "pụp", quăng câu "vút + tõm", phao giật, cuộn dây, jingle bắt được cá, cá sổng "phựt", dép "bẹp", nỏ "phập", gà "cục tác". Hậu kỳ, đặt file. Bạn nghe duyệt.
- [ ] **(D-041)** Đồng Lầy: tiếng nền đồng (gió lúa, ếch nhái chiều, cò xa — CC0 theo D-039), cày "xoạt" đất ướt, gặt "roạt" + bó lúa "bịch", jingle gặt ngắn (dùng lại jingle hái nếu được), sào gõ "cộc". Nhạc: dùng lại nhạc ngày Xóm (Giả định, không gen nhạc mới). +~0,5 giờ, vẫn L.

**Bạn thử thế nào:** nghe bản nghe thử, duyệt.

---

### T-061 — Gắn âm thanh Lô 3a

**Bước:** 4.3 · **Ai làm:** game-dev · **Size:** S (1–2h) · **Cần trước:** T-058, T-059, T-060 (+ T-102 cho phần Đồng)

**Điều kiện xong:**
- [ ] Gắn từng tiếng vào sự kiện tương ứng; nhạc đổi theo khu khi qua cổng (mờ chéo).
- [ ] **(D-041)** Tiếng nền Đồng Lầy + tiếng cày / gặt / sào (T-060). +~0,5 giờ, vẫn S.

**Bạn thử thế nào:** lên Núi nghe nhạc đổi; câu một con cá nghe đủ tiếng. Ra Đồng nghe gió lúa, gặt một thửa nghe "roạt".

---

### T-100 — Gen hình Lô 3i: Đồng Lầy (D-041)

**Bước:** 4.2 · **Ai làm:** art-director · **Size:** M (3–4h) · **Cần trước:** asset list Lô 3 (mục D-041)

**Mục tiêu:** đủ hình để Đồng Lầy trông như cánh đồng Bắc Bộ: thửa lúa đổi theo giai đoạn, mương, chòi canh, ông Sào, bù nhìn.

**Điều kiện xong:**
- [ ] Tile **ruộng nước + bờ ruộng** (viền script như ART-TIL-004) và đê đất nện (dùng lại TIL-006).
- [ ] **Thửa lúa** 3×3 ô (192×192): đất cỏ, đất cày (bùn nước), mạ mới cấy, lúa xanh, **lúa chín vàng**, gốc rạ sau gặt — lúa tẻ; lúa nếp = tô màu lại bằng script (0 USD). Dùng lại cho ruộng làng trang trí.
- [ ] Sheet đồ đồng: mương nước + cầu tre, chòi canh sàn tre mái rạ, cọc gỗ khắc tên (thửa đã mua), biển "Đồng đang cấy — Lv 5" + rào chặn cổng đông.
- [ ] **Ông Sào** 2 khung (cây sào vượt khung, vải đỏ đầu sào); **bù nhìn "thằng Rơm"** (nón rách quai đỏ y hệt {ten} bậc 1 — `--ref` nón của {ten}).
- [ ] Icon ART-ITM-009: bó lúa tẻ, giấy thuê ruộng (bó mạ tẻ / nếp đã ở ART-ITM-008 — T-097; lúa nếp dùng icon cây Lô 1).
- [ ] Should: cò trắng 3 khung (đứng / vỗ cánh / bay).
- [ ] Hậu kỳ, đặt file, cập nhật asset list (ước ~2,8 USD). Bạn duyệt.

**Thông số / ghi chú:** GDD §3.4a, §5 "Bố cục Đồng Lầy"; story bible §2.2 Đồng Lầy, §3.13a.

**Bạn thử thế nào:** xem ảnh so sánh, duyệt: nhìn thửa lúa có nhận ra "chín, gặt được" không; bù nhìn có giống mình không.

---

### T-101 — Khu Đồng Lầy (hình khối) + cổng đông Lv 5 (D-041)

**Bước:** 4.4 · **Ai làm:** game-dev · **Size:** M (3–4h) · **Cần trước:** T-054 (chuyển khu qua cổng), T-042 (level)

**Mục tiêu:** từ Lv 5 đi qua cổng đông cuối đường xóm là tới Đồng Lầy; trước đó cổng chặn.

**Điều kiện xong:**
- [ ] Thêm khu `field` vào `AreaId` / `AREA_NAMES` ("Đồng Lầy"), chuyển khu bằng `beginAreaChange` (như T-093 / T-054), tự lưu; camera + giới hạn vật lý theo khu.
- [ ] Bản đồ 40×28 dựng bằng hình khối theo GDD §5 "Bố cục Đồng Lầy": đê, 6 thửa (khối có nhãn số), bờ ruộng đi được, mương (chặn) + cầu, chòi canh, ruộng làng (trang trí), bù nhìn, đầm sen. Tìm đường (D-038) chạy trong khu mới.
- [ ] Cổng đông Xóm (x 70–71, y 14–15): trước `fieldUnlockLevel` có rào + biển "Đồng đang cấy — Lv 5", click → bong bóng ông Sào / {ten}; đủ level thì mở, thẻ mở khóa ở lên Lv 5 (T-042) có dòng "Đồng Lầy".
- [ ] Save: `player.area` = `field`, tọa độ trong khu. Debug: `debugEnterArea('field')`, `debugState.area`.

**Thông số / ghi chú:** `fieldMapSize`, `fieldUnlockLevel` (GDD §3.4a). Đo thời gian đi từ cổng nhà tới cổng đông (~15 s); lệch > 30% thì báo `game-planner`.

**Bạn thử thế nào:** bảng Thử lên Lv 5, đi từ nhà ra cuối đường xóm qua cổng đông: màn mờ, vào Đồng; quay ra lại đúng chỗ cổng. Lv 4 thì cổng chặn, có biển.

---

### T-102 — Thửa ruộng lớn: thuê / mua ở ông Sào, cày – cấy – gặt lúa (D-041)

**Bước:** 4.4 · **Ai làm:** game-dev · **Size:** L (1 ngày) · **Cần trước:** T-101, T-036 (cửa sổ cửa hàng chung), T-045 (mùa)

**Mục tiêu:** thuê 2 thửa từ Lv 5, cày – cấy một lèo, 4 ngày sau ra gặt về cả gùi lúa; Lv 8 mua đứt (pillar "Làm giàu từ hai bàn tay").

**Điều kiện xong:**
- [ ] Ông Sào đứng ở chòi canh 6–19h (lịch T-035, khu `field`); click → cửa sổ "Ruộng đồng" (dùng cửa sổ cửa hàng chung): danh sách 6 thửa (trống / đang thuê / của mình), nút **Thuê vụ này** (`fieldRentPerCrop`), **Mua đứt** (`fieldBuyPrice`, xám + "Lv 8" khi chưa đủ), giới hạn `fieldMaxPlotsByLevel`; tab bán **bó mạ tẻ / nếp** (trái mùa xám). Không nút Kỳ kèo; áp `shopDiscount` bậc ngoại hình.
- [ ] Mỗi thửa là **một đơn vị**: cầm cuốc click thửa → bước tới sát bờ (`planFarmStand` / `farmWorkRange` của D-038) → **cày** `fieldPlowSeconds` có thanh tiến độ, WASD bỏ dở giữ tiến độ (dùng lại logic §3.3a), trừ `fieldPlowStamina` khi xong; cầm bó mạ click → **cấy** `fieldPlantSeconds`; lớn mỗi đêm tới `fieldGrowDays` (không cần tưới, không héo); chín → click **gặt** `fieldHarvestSeconds` → `fieldYield` bó lúa vào gùi (dư thì thành đống nhặt được ở bờ), +`fieldHarvestXp`; thửa thuê trả về "trống", thửa mua về "đất cỏ".
- [ ] Món mới: lúa tẻ (bán 18), bó mạ tẻ / nếp; lúa nếp dùng chung món "lúa nếp" của ruộng nhà (rượu nếp, nhiệm vụ 5).
- [ ] Hàm thuần + unit test: trạng thái thửa qua đêm, giới hạn theo level, giá có giảm giá bậc, sản lượng, thuê → gặt → trả.
- [ ] Save: mảng `fields` (6 phần tử: `owner` none / rented / owned, `stage`, `crop`, `days`, tiến độ cày dở); nâng cấp save cũ (không có `fields` → 6 thửa trống). Debug: `debugState.fields`, `debugSetField(i, stage)`.
- [ ] Juice tối thiểu (đủ phản hồi): thanh tiến độ, đất đổi màu khi cày, chữ "+12 bó lúa"; juice đầy đủ ở T-103.

**Thông số / ghi chú:** toàn bộ bảng `field*` GDD §3.4a; câu ông Sào story bible §3.13a. Should (làm nếu kịp, không chặn xong): trâu Ì cày nhanh `fieldBuffaloPlowMultiplier` (cần T-075), U nấu cơm bằng lúa tẻ nhà. Cắt C6b(b): bỏ mua đứt.

**Bạn thử thế nào:** bảng Thử Lv 5 + 200 quan, mùa nắng: ra Đồng, thuê 2 thửa, mua 2 bó mạ tẻ; cầm cuốc click thửa 1 → cày ~15 giây; cấy; làm thửa 2. Ngủ 4 đêm (bảng Thử) → thửa vàng; gặt → 12 bó lúa vào gùi, thửa trả về trống. Lên Lv 8: mua đứt một thửa, thấy cọc tên mình.

---

### T-103 — Gắn hình Đồng Lầy + juice gặt (D-041)

**Bước:** 4.2 · **Ai làm:** game-dev · **Size:** M (3–4h) · **Cần trước:** T-100, T-102

**Mục tiêu:** Đồng trông thật và gặt lúa "đã tay".

**Điều kiện xong:**
- [ ] Thay hình khối bằng tile ruộng nước / bờ, thửa lúa theo giai đoạn (tẻ / nếp tô màu), mương, cầu, chòi, ông Sào, bù nhìn, cọc tên; ruộng làng đổi màu theo mùa.
- [ ] Juice gặt (GDD §8): lúa ngả rạp theo nhịp gặt, bó lúa bay vào gùi, chữ "+12 bó lúa", jingle ngắn; gặt thửa đầu tiên → bong bóng khoe vàng của {ten}. Click bù nhìn → câu {ten} (story bible §3.13a).
- [ ] Should: cò bay lên khi {ten} tới gần đầm; lá cờ bù nhìn lắc.
- [ ] FPS ≥ 50 khi đứng giữa đồng.

**Bạn thử thế nào:** ra Đồng lúc lúa chín, gặt một thửa: xem lúa đổ, bó lúa bay, nghe jingle (khi T-061 xong). Click bù nhìn.

---

### T-062 — Gen hình Lô 3c: làng Sung và người làng Sung

**Bước:** 4.2 · **Ai làm:** art-director · **Size:** L (1 ngày) · **Cần trước:** asset list Lô 3

**Mục tiêu:** làng giàu bên cạnh và nhà bố vợ có hình thật.

**Điều kiện xong:**
- [ ] Theo asset list Lô 3: nền / nhà làng Sung (ngói mới, gạch đỏ), sạp bà Cân, nhà cụ Bá Kẹo; sprite + chân dung bà Cân, cô Bưởi; cụ Bá Kẹo sprite + chân dung **4 mặt** (nhăn / im lặng / nhấp trà / cười) + mặt **nhướng mày** (meme `browBoom`).
- [ ] Hậu kỳ, đặt file, cập nhật asset list. Bạn duyệt.

**Bạn thử thế nào:** xem ảnh so sánh, duyệt (nhất là 4 mặt cụ Bá Kẹo — phải đọc được ngay).

---

### T-063 — Bản đồ làng Sung và đường sang chợ

**Bước:** 4.4 · **Ai làm:** game-dev · **Size:** L (1 ngày) · **Cần trước:** T-054, T-062

**Mục tiêu:** khu thứ 3: đi đường cái sang làng Sung bán hàng giá cao, gặp nhà bố vợ.

**Điều kiện xong:**
- [ ] Bản đồ 40×28 (gắn luôn hình Lô 3c; thiếu thì hình khối). Cổng tây Xóm chặn tới Lv 6 ("đường đang sửa").
- [ ] Đi qua tốn `marketTravelGameMinutes` (màn mờ, đồng hồ nhảy, không chờ thật).
- [ ] Bà Cân ở sạp, cô Bưởi đứng ngoài (thoại), cửa nhà cụ Bá Kẹo (vào = màn mặc cả, T-068; trước đó bong bóng).

**Thông số / ghi chú:** `marketTravelGameMinutes` 30.

**Bạn thử thế nào:** bảng Thử Lv 6, đi cổng tây: đồng hồ nhảy 30 phút, tới làng Sung.

---

### T-064 — Sạp bà Cân: bán ngay giá cao, mua lễ vật

**Bước:** 4.4 · **Ai làm:** game-dev · **Size:** M (3–4h) · **Cần trước:** T-036, T-063

**Mục tiêu:** lý do đi chợ: bán ngay × 1.3 và mua lễ vật.

**Điều kiện xong:**
- [ ] Cửa sổ cửa hàng chung, tab **Bán**: bán ngay × `marketPriceMultiplier` (+1 XP mỗi 20 quan). Tab **Mua**: trầu cau, lợn lễ (`giftValue`), gà / lợn con (chỉ hiện sau cưới — T-075). Tab Sắm sửa để T-067.
- [ ] Nhiệm vụ 6 "Đơn hàng chợ" hoàn thành được.

**Thông số / ghi chú:** `marketPriceMultiplier` 1.3; giá theo bảng GDD §3.9.

**Bạn thử thế nào:** mang 10 cải sang chợ bán: được 130 quan thay vì 100.

---

### T-065 — Gen hình Lô 2e: {ten} bậc 2, hiệu ứng lột xác, icon nông cụ / bộ đồ

**Bước:** 4.2 · **Ai làm:** art-director · **Size:** L (1 ngày) · **Cần trước:** asset list Lô 2 (làm trong Đợt C theo lô hình; game dùng ở T-067)

**Mục tiêu:** sắm "Bộ đồ lành" xong thì {ten} đi lại, làm việc ở vườn bằng bộ đồ mới.

**Điều kiện xong:**
- [ ] Bậc 2 theo asset list Lô 2: **đi 4 hướng** (đứng = khung 1 của dải đi), **cuốc + tưới + cúi** ("thay đồ giữ dáng" `--ref` dải bậc 1), giữ khung + điểm chân; khung xoay là Should.
- [ ] Hiệu ứng lột xác (nếu không làm bằng code), icon nông cụ + icon bộ đồ sắm sửa.
- [ ] Hậu kỳ, đặt file. Bạn duyệt.

**Thông số / ghi chú:** chặt + câu của bậc 2 ở Lô 3 (T-066). Bậc 2–3 **đủ động tác** (người dùng chọn, D-034).

**Bạn thử thế nào:** xem GIF từng động tác, duyệt.

---

### T-066 — Gen hình Lô 3d: bậc 2 chặt + câu, bậc 3 đủ bộ, bậc 4 chỉ đi / đứng

**Bước:** 4.2 · **Ai làm:** art-director · **Size:** L (1 ngày) · **Cần trước:** T-065

**Điều kiện xong:**
- [ ] Bậc 2: chặt + câu. Bậc 3 (Khá giả): đi, cuốc, tưới, cúi, chặt, câu (khung xoay Should). Mọi bậc giữ chi tiết đỏ son.
- [ ] **Bậc 4 (Phú ông): chỉ đi 4 hướng** (đứng = khung 1). Khi làm việc game **mượn khung bậc 3** + khăn xếp vẽ đè bằng code (mục cắt 0b(d) — người dùng chọn, D-034; chỉ thấy sau cưới, Lv 12).
- [ ] Hậu kỳ, đặt file. Bạn duyệt.

**Thông số / ghi chú:** nếu trễ thêm: mục cắt C2 còn lại (bỏ chân dung theo bậc — vốn đã là Should; gộp 3 bậc).

**Bạn thử thế nào:** xem GIF, duyệt.

---

### T-067 — Bậc ngoại hình: sắm sửa, "lột xác", danh hiệu, giảm giá

**Bước:** 4.4 · **Ai làm:** game-dev · **Size:** L (1 ngày) · **Cần trước:** T-064, T-065 (bậc 3–4 gắn khi T-066 xong)

**Mục tiêu:** giàu lên là thấy trên chính nhân vật (pillar "Làm giàu từ hai bàn tay").

**Điều kiện xong:**
- [ ] `outfits.json` (GDD §3.14). Tab **Sắm sửa** ở quầy cô Tám (bậc 2) và sạp bà Cân (bậc 3–4; bậc 4 cần đã cưới); xem trước nhân vật mặc bộ đó; giá đã giảm thì gạch giá cũ.
- [ ] Mua → **lột xác** `outfitTransformSeconds` (xoay, khói, đổi bộ sprite theo bậc, băng chữ tên bậc); danh hiệu HUD đổi; +`outfitXpReward`.
- [ ] Bậc 4 làm việc (cuốc / tưới / cúi / chặt / câu) dùng khung **bậc 3** + khăn xếp vẽ đè bằng code, đi / đứng dùng khung bậc 4 (D-034). Khóa sprite theo bậc có bảng "mượn khung" trong dữ liệu, không viết cứng.
- [ ] `shopDiscount` áp cho mọi giá mua bằng tiền (làm tròn lên, không áp sính lễ); `haggleDiscount` để T-068 dùng; câu làng gọi theo bậc ("thằng / anh / ông {ten}", story bible §3.0).
- [ ] Save `outfitTier`; unit test giá giảm.

**Thông số / ghi chú:** `OutfitData.*`, `outfitXpReward` 10, `outfitTransformSeconds` 1.5, `weddingGrantsOutfitTier` 3 (dùng ở T-071).

**Bạn thử thế nào:** bảng Thử Lv 3 + 50 quan, mua "Bộ đồ lành" ở quầy cô Tám: xem lột xác; đi cuốc thấy dáng mới; trẻ trâu gọi khác đi.

---

### T-068 — Màn mặc cả sính lễ với cụ Bá Kẹo

**Bước:** 4.4 · **Ai làm:** game-dev · **Size:** L (1 ngày) · **Cần trước:** T-062, T-063

**Mục tiêu:** điểm khác biệt của game: chọn giá, đưa lễ vật, đọc mặt bố vợ.

**Điều kiện xong:**
- [ ] `brides.json` (`askPrice`, `acceptRatioMin/Max`, `favoriteGift`, `patienceTurns`): mức ưng ẩn chọn 1 lần khi nhiệm vụ 9 mở, lưu save; mỗi lần thua giảm `failRetryDiscount` (tối đa `failRetryDiscountMaxTimes`); nhân (1 − `haggleDiscount`).
- [ ] Vào nhà cụ cần ≥ 1 lễ vật trong gùi, mỗi ngày 1 buổi. Màn: chân dung cụ to (4 mặt), 5 chén trà = lượt kiên nhẫn, 3 nút giá theo thang (chỉ nấc cao hơn, thiếu tiền xám), "Thêm lễ vật" (tối đa `maxGiftsPerHaggle`, món ông mê × `favoriteGiftMultiplier`), "Xin phép về" (Esc); phím 1–4; dòng "Đã đưa: …".
- [ ] Mặt cố định theo `r` (`faceSipTeaRatio`, `faceSilentRatio`; < `insultRatio` mất thêm 1 lượt), 2–3 câu mỗi mặt (story bible §6.2). Hết lượt → về, không mất gì; chửi khi đã ra cổng.
- [ ] Chốt (r ≥ 1) → trừ tiền + lễ vật → gọi cảnh cưới (T-071; trước đó chỉ báo "Chốt!").
- [ ] Logic thuần + unit test (thang giá, r, mặt, lượt, giảm sau thua).

**Thông số / ghi chú:** đủ bảng tham số GDD §3.10.

**Bạn thử thế nào:** bảng Thử bật nhiệm vụ 9 + 1500 quan + rượu nếp. Vào nhà cụ: trả 800 → mặt nhăn "Coi thường nhà tôi à?"; tăng dần, đưa rượu nếp → nhìn mặt đổi.

---

### T-069 — Nối nhiệm vụ 5–9 và bà mối gõ cửa

**Bước:** 4.4 · **Ai làm:** game-dev · **Size:** M (3–4h) · **Cần trước:** T-043, T-048, T-050, T-064, T-068

**Mục tiêu:** chuỗi 9 nhiệm vụ đi trọn tới đám cưới.

**Điều kiện xong:**
- [ ] Hũ rượu nếp ở bếp (3 lúa nếp + 10 quan men); nhiệm vụ 5–8 hoàn thành được.
- [ ] Nhiệm vụ 9 mở khi đủ: Lv ≥ `weddingUnlockLevel`, `kitchenUpgraded`, ≥ `weddingMinPlots` ô → sáng hôm sau bà Ba Trầu đến nhà (thoại, gợi ý lễ vật ông mê).
- [ ] Đi trọn chuỗi 1 → 9 bằng bảng Thử không kẹt; ghi số ngày / XP thật để cân bằng ở 5.1.

**Thông số / ghi chú:** `weddingUnlockLevel` 10, `weddingMinPlots` 12.

**Bạn thử thế nào:** bảng Thử Lv 10 + bếp gạch + 12 ô, ngủ: sáng ra bà mối gõ cửa.

---

### T-070 — Gen hình Lô 3f: cảnh cưới 3 khung và vợ trên bản đồ

**Bước:** 4.2 · **Ai làm:** art-director · **Size:** M (3–4h) · **Cần trước:** asset list Lô 3

**Điều kiện xong:**
- [ ] Theo asset list Lô 3: **đám cưới 3 khung vẽ trọn tranh** (story bible §5.3; đội chọn, D-034 — khung nào lệch nhân vật quá 3 vòng thì khung đó lùi về nền + sprite ghép bằng code); cô Bưởi (vợ) đứng trên bản đồ Xóm (sprite cô Bưởi có thể đã làm ở T-062). Intro 4 khung ở Lô 4 (T-082). Hậu kỳ, đặt file. Bạn duyệt.

**Bạn thử thế nào:** xem 3 khung theo thứ tự như truyện tranh, duyệt.

---

### T-071 — Cảnh cưới, vợ về nhà, chơi tiếp sau cưới

**Bước:** 4.4 · **Ai làm:** game-dev · **Size:** M (3–4h) · **Cần trước:** T-069, T-070

**Mục tiêu:** phần thưởng lớn nhất game, rồi chơi tiếp mãi.

**Điều kiện xong:**
- [ ] Chốt sính lễ → 3 khung cưới (click / Space qua, pháo) → về nhà: vợ ở nhà theo giờ, cờ `married`, bậc ngoại hình lên ít nhất `weddingGrantsOutfitTier`, +2 gà (chưa có chuồng thì gà ở sân tới T-075 — Giả định), mở level 11+.
- [ ] F5 giữa cảnh cưới → vào lại đã cưới, tiền không bị trừ hai lần.

**Bạn thử thế nào:** chốt sính lễ, xem cảnh cưới; sáng hôm sau vợ ở nhà.

---

### T-072 — Gen hình Lô 3g: con cái và gia súc

**Bước:** 4.2 · **Ai làm:** art-director · **Size:** M (3–4h) · **Cần trước:** asset list Lô 3

**Điều kiện xong:**
- [ ] Theo asset list Lô 3: con nhỏ, con lớn (1 kiểu), gà, lợn (nhỏ / lớn), chuồng, ổ trứng, icon trứng, bát cháo. Hậu kỳ, đặt file. Bạn duyệt.

**Thông số / ghi chú:** cắt C3 → bỏ con lớn và lợn.

**Bạn thử thế nào:** xem ảnh so sánh, duyệt.

---

### T-073 — Vợ giúp tưới, tiền cơm cả nhà, ngày "ăn cháo"

**Bước:** 4.4 · **Ai làm:** game-dev · **Size:** M (3–4h) · **Cần trước:** T-071

**Mục tiêu:** sau cưới nhà đông thì tốn, nhưng ai cũng giúp việc (GDD §3.11).

**Điều kiện xong:**
- [ ] Mỗi sáng vợ tưới `wifeAutoWaterPlots` ô (ô chưa tưới gần nhà trước), có bong bóng ngắn.
- [ ] Tổng kết thêm dòng "Tiền cơm cả nhà: −X quan" + icon từng miệng ăn. Thiếu tiền → tiền về 0, hôm sau "ăn cháo" (`porridgeDayPenaltyDays`: con không giúp, gia súc không cho sản phẩm), câu chửi "ăn cháo".
- [ ] Tiền không bao giờ âm — unit test.

**Thông số / ghi chú:** `wifeDailyUpkeep` 15, `wifeAutoWaterPlots` 4, `porridgeDayPenaltyDays` 1.

**Bạn thử thế nào:** bảng Thử "đã cưới" + 0 quan, ngủ: sáng ra cả nhà ăn cháo.

---

### T-074 — Con cái: tin vui, ôm con, con lớn giúp việc

**Bước:** 4.4 · **Ai làm:** game-dev · **Size:** M (3–4h) · **Cần trước:** T-073

**Điều kiện xong:**
- [ ] Mỗi sáng xác suất `childChancePerDay` vợ báo tin vui (tối đa `maxChildren`), con xuất hiện ngay.
- [ ] Con nhỏ: click lần đầu mỗi ngày +`childHugStamina` Sức + tiếng tăm. Sau `childGrowDays` thành con lớn: mỗi sáng hái tối đa `childHarvestPlots` ô chín hoặc mang về 1 món.
- [ ] Tiền cơm `childSmallUpkeep` / `childBigUpkeep` vào dòng tổng kết.

**Thông số / ghi chú:** tham số gia đình GDD §3.11.

**Bạn thử thế nào:** bảng Thử cho có con; click con: +20 Sức, "Ôm con là hết mệt".

---

### T-075 — Chuồng, gà và lợn

**Bước:** 4.4 · **Ai làm:** game-dev · **Size:** M (3–4h) · **Cần trước:** T-050, T-064, T-073

**Điều kiện xong:**
- [ ] Dựng chuồng ở xưởng mộc (`penBuildCost` + 10 tre), tối đa `penCapacity` con; mua gà / lợn ở sạp bà Cân.
- [ ] Gà đẻ 1 trứng / ngày (click ổ nhặt; bán `eggPrice` hoặc nấu trứng luộc). Lợn lớn sau `pigGrowDays` → bán `pigSellPrice` hoặc làm lễ vật. Tiền cơm theo con.

**Thông số / ghi chú:** `penBuildCost` 150, `penCapacity` 6, `chickenPrice` / `chickenUpkeep` / `eggPrice` 30 / 3 / 8, `pigPrice` / `pigUpkeep` / `pigGrowDays` / `pigSellPrice` 60 / 8 / 6 / 250.

**Bạn thử thế nào:** bảng Thử "đã cưới" + 300 quan + 10 tre: dựng chuồng, mua 1 gà; sáng hôm sau nhặt trứng.

---

### T-076 — Bốn sự kiện gia đình (Must)

**Bước:** 4.4 · **Ai làm:** game-dev · **Size:** M (3–4h) · **Cần trước:** T-074, T-075

**Điều kiện xong:**
- [ ] Mỗi sáng xác suất `familyEventChance` chọn 1 sự kiện đủ điều kiện: gà đẻ trứng đôi, con lớn mang cá to về, ông bà ngoại dúi tiền, lợn sổng chuồng (click lợn 3 lần để lùa về; không lùa thì mất 1 ô rau + chửi). Bong bóng + icon; mất tối đa `familyEventMaxLoss`.
- [ ] Bảng Thử ép được từng sự kiện.

**Thông số / ghi chú:** `familyEventChance` 0.3, `familyEventMaxLoss` 30. Cắt C3 → chỉ giữ trứng đôi + ông bà ngoại.

**Bạn thử thế nào:** bảng Thử ép "lợn sổng chuồng": đuổi bắt con lợn 3 click.

---

### T-077 — Gen hình Lô 3h: ảnh meme Must

**Bước:** 4.2 · **Ai làm:** art-director · **Size:** M (3–4h) · **Cần trước:** asset list Lô 3

**Điều kiện xong:**
- [ ] Theo asset list Lô 3 (đúng luật nhái D-016, không tên meme trong prompt): mèo Mướp 2 khung, hạt nước mắt / vòi nước, mũi tên đỏ son trên giấy dó, túi tiền + sợi dây nịt. (Cụ Bá Kẹo nhướng mày đã ở T-062.) Hậu kỳ, đặt file. Bạn duyệt.

**Thông số / ghi chú:** cắt C1 → bỏ task này (giữ 4 meme chỉ cần chữ + code).

**Bạn thử thế nào:** xem ảnh, duyệt — phải buồn cười kể cả khi không biết meme gốc.

---

### T-078 — Bộ điều phối meme và 6 kiểu hiệu ứng dùng chung

**Bước:** 4.4 · **Ai làm:** game-dev · **Size:** L (1 ngày) · **Cần trước:** T-042

**Mục tiêu:** meme hiếm mà đắt, không chặn chơi (GDD §3.15).

**Điều kiện xong:**
- [ ] `memes.json` (trigger, `chance`, `maxPerDay`, `cooldownDays`); luật chung: `memeMaxPerDay`, `memeGlobalCooldownSeconds`, `memeFirstTimeGuaranteed`, meme thay câu chửi lần đó, meme cảnh lớn không tính giới hạn, click / Space bỏ qua, khóa tối đa `memeMaxLockSeconds`.
- [ ] 6 kiểu hiệu ứng: zoom 3 nấc + chữ kéo dài; chữ to nảy rồi vỡ; thẻ góc phải có phụ đề; số "−N SĨ DIỆN"; hạt nước mắt; mũi tên trong tổng kết. Tắt rung màn → vẫn zoom, không giật.
- [ ] Unit test điều phối (giới hạn, nghỉ, lần đầu luôn hiện). Bảng Thử "phát meme" từng kiểu.

**Thông số / ghi chú:** bảng tham số chung GDD §3.15 (`memeMaxPerDay` 4 … `faceDamageCritChance` 0.1).

**Bạn thử thế nào:** bảng Thử phát lần lượt 6 kiểu hiệu ứng.

---

### T-079 — Nối 8 meme Must vào trò chơi

**Bước:** 4.4 · **Ai làm:** game-dev · **Size:** M (3–4h) · **Cần trước:** T-068, T-077, T-078

**Điều kiện xong:**
- [ ] `smugCatSubtitle`, `cryRiver`, `dramaticZoom`, `profitArrow`, `oiDoiOi`, `onlyBeltLeft`, `browBoom`, `faceDamage` với đúng trigger bảng GDD §3.15; chữ theo story bible §6.5. Trigger nào thuộc tính năng chưa xong (vd lợn sổng trước T-076) thì nối khi tính năng có — ghi chú.

**Bạn thử thế nào:** câu được dép tổ ong → "ỐI DỒI ÔI!"; trả giá quá rẻ cụ Bá Kẹo → nhướng mày + "BÙM".

---

### T-080 — Làm âm thanh Lô 3b (chợ, mặc cả, cưới, menu, jingle, meme, gia đình)

**Bước:** 4.3 · **Ai làm:** audio-director · **Size:** L (1 ngày) · **Cần trước:** audio list Lô 3

**Điều kiện xong:**
- [ ] Theo audio list Lô 3: nhạc làng Sung, nhạc màn mặc cả, kèn trống cưới (nhạc menu ở Lô 4 — T-094); jingle lên level / xong nhiệm vụ / lột xác; 8 SFX meme Must (nhạc cụ dân tộc, tạo mới); tiếng gà, lợn, trẻ con; tiếng bố vợ ("hừm", "xụp", "khà khà"). Hậu kỳ, đặt file. Bạn nghe duyệt.

**Bạn thử thế nào:** nghe bản nghe thử, duyệt.

---

### T-081 — Gắn âm thanh Lô 3b

**Bước:** 4.3 · **Ai làm:** game-dev · **Size:** M (3–4h) · **Cần trước:** T-080

**Điều kiện xong:**
- [ ] Gắn nhạc theo khu / màn (chợ, mặc cả, cưới, menu), jingle, SFX meme, gia đình, bố vợ; nhạc đổi mờ chéo, không phát chồng.

**Bạn thử thế nào:** vào màn mặc cả: nhạc đổi; lên level: nghe kèn trống.

---

### T-082 — Gen hình Lô 4: logo, nền menu, intro 4 khung, kit menu

**Bước:** 4.2 · **Ai làm:** art-director · **Size:** L (1 ngày) · **Cần trước:** asset list Lô 4

**Điều kiện xong:**
- [ ] Theo asset list Lô 4: **logo** (chữ đặt bằng font), **nền menu** (dùng lại concept Xóm nếu bạn ưng), **intro 4 khung vẽ trọn tranh** (story bible §5.1; đội chọn, D-034 — khung lệch quá 3 vòng thì lùi về ghép bằng code), **kit menu / cài đặt** (nút to, thanh trượt, công tắc, ô nhập tên). Hậu kỳ, đặt file. Bạn duyệt.

**Thông số / ghi chú:** khung cửa sổ, nút, icon HUD đã ở Lô 1 (T-091); khung thoại / cửa hàng ở Lô 2 (T-030); thẻ mở khóa, con dấu "XONG", UI mặc cả / câu cá / nỏ ở Lô 3 (T-057, T-062, T-077). Favicon, ảnh giới thiệu làm ở bước 5.3.

**Bạn thử thế nào:** xem logo, nền menu và 4 khung intro theo thứ tự, duyệt.

---

### T-083 — Menu chính và "Về Menu"

**Bước:** 4.4 · **Ai làm:** game-dev · **Size:** M (3–4h) · **Cần trước:** T-041

**Điều kiện xong:**
- [ ] Scene **Menu**: logo, "Chơi tiếp" (chỉ khi có save), "Chơi mới" (có save → hỏi xác nhận 2 lần), "Cài đặt"; không có nút Thoát. Nhạc bắt đầu sau click đầu.
- [ ] Mở game: Boot → Preload → Menu (2 click là vào chơi tiếp).
- [ ] Cửa sổ Tạm dừng thêm "Cài đặt", "Về Menu (đã tự lưu)"; "Chơi lại từ đầu" chuyển thành "Chơi mới" ở Menu (Giả định).

**Bạn thử thế nào:** F5 → thấy Menu → "Chơi tiếp" vào đúng chỗ, đúng giờ.

---

### T-084 — Intro 4 khung và đặt tên nhân vật

**Bước:** 4.4 · **Ai làm:** game-dev · **Size:** M (3–4h) · **Cần trước:** T-082, T-083

**Điều kiện xong:**
- [ ] "Chơi mới" → khung 1 → **đặt tên** ("Còn anh, anh tên gì?", thẻ `<input>` HTML đè lên game để gõ tiếng Việt bằng Unikey / EVKey, mặc định "Tý", tối đa 10 ký tự, nút "Ngẫu nhiên", Enter) → khung 2–4 → Xóm ngày 1. Click / Space qua khung, nút "Bỏ qua".
- [ ] Tên lưu save (`player.name`); mọi thoại thay `{ten}`.

**Bạn thử thế nào:** Chơi mới, gõ "Tèo" có dấu; U Hến gọi "Tèo".

---

### T-085 — Cửa sổ Cài đặt

**Bước:** 4.4 · **Ai làm:** game-dev · **Size:** M (3–4h) · **Cần trước:** T-026, T-083

**Điều kiện xong:**
- [ ] Thanh trượt **Nhạc**, **Hiệu ứng** (0–100%); **rung màn** bật / tắt (mọi rung + meme zoom tôn trọng); **toàn màn hình**; **tự tạm dừng khi chuyển tab** (`pauseOnFocusLost`); **hiện gợi ý phím**.
- [ ] Lưu localStorage riêng (vd `bph-settings`), không nằm trong save. Mở từ Menu và từ Tạm dừng.

**Bạn thử thế nào:** kéo Nhạc về 0, F5: nhạc vẫn tắt. Bật toàn màn hình.

---

### T-086 — Gắn kit menu Lô 4, rà đồng bộ giao diện và cỡ chữ

**Bước:** 4.2 · **Ai làm:** game-dev · **Size:** M (3–4h) · **Cần trước:** T-082, T-085

**Điều kiện xong:**
- [ ] Menu, Cài đặt, ô đặt tên dùng kit Lô 4 + logo + nền menu. Rà mọi cửa sổ (gùi, thùng bán, rương, cửa hàng / chế đồ, bếp, thoại, mặc cả, sổ Q, tổng kết, Tạm dừng) đều dùng chung khung Lô 1–3, không còn khung vẽ bằng code sót lại.
- [ ] Chữ ≥ 24px ở 1080p; 1366×768 và 2560×1440 không đè nhau (e2e chụp từng cửa sổ).
- [ ] Gợi ý phím đúng bảng GDD §4.

**Bạn thử thế nào:** mở lần lượt từng cửa sổ, báo chỗ nào khó đọc.

---

### T-094 — Âm thanh Lô 4: âm giao diện, nhạc menu, cân mix cuối

**Bước:** 4.3 · **Ai làm:** audio-director + game-dev · **Size:** M (3–4h) · **Cần trước:** T-081, T-086

**Mục tiêu:** bấm nút có tiếng, menu có nhạc riêng, cả game nghe đều tai (không tiếng nào to / nhỏ lạc).

**Điều kiện xong:**
- [ ] Theo audio list Lô 4: âm giao diện còn lại (rê chuột, bấm, mở / đóng cửa sổ, lỗi), nhạc menu; gắn vào Menu, Cài đặt và mọi cửa sổ.
- [ ] **Cân mix cuối**: audio-director đo lại toàn bộ (peak / RMS), game-dev chỉnh âm lượng từng nhóm trong `gameConfig.ts`; ghi bảng mức âm lượng vào audio list.

**Bạn thử thế nào:** chơi 10 phút có đủ nhạc + tiếng; báo tiếng nào quá to / quá nhỏ.

---

### T-087 — Juice phần 1: rung màn 3 mức, tiền, level, nhiệm vụ, chặt, hái lượm

**Bước:** 4.5 · **Ai làm:** game-dev · **Size:** M (3–4h) · **Cần trước:** T-043, T-055

**Điều kiện xong:**
- [ ] Hàm rung chung `screenShakeLight / Medium / Strong` (tắt được ở Cài đặt).
- [ ] Theo GDD §8: lên level (pháo giấy, rung vừa), xong nhiệm vụ (dấu đóng, rung mạnh), nhận tiền (xu bay vào HUD, số nhảy), chặt (cây rung, mảnh gỗ, khựng 0.05 s, rung vừa), hái lượm (món nảy bay vào gùi).

**Thông số / ghi chú:** thêm `screenShakeMedium` (0.1 ô / 0.15 s), `screenShakeStrong` (0.2 ô / 0.25 s).

**Bạn thử thế nào:** chặt một cây, xong một nhiệm vụ. Tự hỏi: "đã tay" chưa?

---

### T-088 — Juice phần 2: chuyển khu, giờ trong ngày, trạng thái nhân vật, mưa

**Bước:** 4.5 · **Ai làm:** game-dev · **Size:** M (3–4h) · **Cần trước:** T-046, T-054

**Điều kiện xong:**
- [ ] Theo GDD §8: qua cổng (tên khu + bước chân), 6h trời hửng, 23h nhân vật ngáp, đuối (mồ hôi), ăn (má phồng), cây héo (ruồi bay), nông cụ cùn (icon lắc + "cạch"), trời đổ mưa (sấm rung nhẹ), đầu mùa (băng chữ).

**Bạn thử thế nào:** chơi trọn 1 ngày có mưa, để ý từng chi tiết nhỏ.

---

### T-089 — Juice phần 3: mini-game, mặc cả, cưới

**Bước:** 4.5 · **Ai làm:** game-dev · **Size:** M (3–4h) · **Cần trước:** T-058, T-059, T-068, T-071

**Điều kiện xong:**
- [ ] Theo GDD §8: phao giật (dấu "!" + rung vừa — báo được cả khi tắt tiếng), cá bắt được bay lên phóng to, cá sổng / dép, nỏ trúng (chậm hình 0.2 s + lông gà, rung mạnh), nỏ trượt; mặc cả (mặt đỏ lắc, hơi trà, lấp lánh + vỗ đùi khi cười); pháo cưới.

**Bạn thử thế nào:** câu 3 con cá, mặc cả một buổi.

---

### T-090 — Kiểm trọn vòng Ngày 1 → cưới và hồi quy cả game

**Bước:** 4.4 · **Ai làm:** qa-tester · **Size:** L (1 ngày) · **Cần trước:** mọi task chặng 4

**Mục tiêu:** chắc chắn điều kiện xong chặng 4: chơi từ Menu → ngày 1 → cưới trơn tru (phần đăng nhập dời sang 5.5).

**Điều kiện xong:**
- [ ] E2E "trọn vòng" (dùng bảng Thử để nhảy): Menu → Chơi mới → intro / đặt tên → nhiệm vụ 1 → Núi → câu cá → nỏ → làng Sung → sắm sửa → mặc cả → cưới → ngày sau cưới (vợ tưới, tiền cơm). F5 ở mỗi khu vào lại đúng chỗ.
- [ ] Cả bộ e2e xanh 2 lần liền; ghi FPS ở Xóm / làng Sung, dung lượng tải lần đầu; console không lỗi.
- [ ] Bug ghi bảng Lỗi; không còn bug "Nặng" thì chặng 4 xong.

**Bạn thử thế nào:** đọc báo cáo; tự chơi 30 phút đầu game như người mới (Chơi mới, không phím thử).

## Lỗi (bug)

| ID | Mô tả | Mức độ | Trạng thái |
|---|---|---|---|
| BUG-001 | (T-001) **Kẹt ở mối nối tường nhà khi đi chéo.** Đứng sát mặt ngoài **bên trái** nhà, giữ **D+W** (ép vào tường và đi lên): nhân vật đứng khựng ở y=650px (mối nối khối tường dưới ↔ tường trái, hàng 10/9) và thỉnh thoảng ở y≈266px (tường trái ↔ tường trên, hàng 4/3); `blocked.up` bật dù phía trên không có vật cản. Chỉ thả D mới đi tiếp. Lần chạy khác lại kẹt ở mặt **phải** nhà khi giữ **A+W** (dừng ở y=266px) — kẹt hay không tùy độ dài frame, nên người chơi sẽ gặp ngẫu nhiên ở mọi mối nối khi đi lên; chiều đi xuống chưa thấy kẹt. Nguyên nhân: tường nhà là nhiều hộp Arcade nằm nối mép ngoài thẳng hàng → va chạm "mép trong" của hộp kế bên. Tái hiện: `node web/e2e/diag-t001.mjs seam3` hoặc test `Q2` trong `web/e2e/tests/qa-t001.spec.ts`; ảnh `web/e2e/screenshots/qa-t001-stuck-1.png`. Gợi ý: dùng lớp va chạm Tilemap (`setCollision`, Phaser tự bỏ mép trong giữa các ô liền nhau); chỉ đổi cách chia hộp thì mối nối sẽ chuyển sang mặt khác. Thêm test trượt chéo cả 4 mặt ngoài nhà. Không đạt điều kiện "trượt dọc theo cạnh (không bị kẹt)". **Đã sửa (2026-10-10):** rào, tường, giường, ao không còn là nhiều hộp Arcade nối nhau mà là một **lớp va chạm Tilemap** ẩn (`buildCollisionLayer` trong `GardenScene.ts`, lưới từ `tileSolidGrid` trong `systems/garden.ts`); Phaser tự tắt mặt chung giữa hai ô chặn liền nhau nên không còn mép trong ở mối nối. Kiểm: e2e `BUG-001: ép chéo dọc cả 4 mặt ngoài nhà (và ao)` (`garden.spec.ts`, 10 ca: trái lên/xuống, phải lên/xuống, trên sang phải/trái, dưới hai bên cửa, ao trái/trên) + `Q2` xanh; unit test vòng tường liền mạch. Ghi chú: Q2 cũ đặt điểm xuất phát cách góc tường 14px (< `cornerNudgePx` 16) nên frame chỉ có một phím bị "nắn" vòng qua góc (đúng thiết kế) — đã dời điểm xuất phát và đổi giới hạn 80 frame thành 4 giây game. | Nhẹ | Đã sửa |
| BUG-002 | (T-001) **Console báo lỗi 404 `/favicon.ico`** ("Failed to load resource … 404") khi mở game — thấy trên Edge (Playwright kênh msedge), chromium headless không báo. Vi phạm mục "không console error". Tái hiện: `curl http://localhost:5173/favicon.ico` → 404; `node web/e2e/diag-edge.mjs`. Gợi ý: thêm favicon hoặc `<link rel="icon" href="data:,">` trong `web/client/index.html`. **Đã sửa:** thêm `web/client/public/favicon.svg` + `<link rel="icon" type="image/svg+xml" href="/favicon.svg">` trong `web/client/index.html` (kiểm 2026-10-10: `GET /favicon.svg` → 200; e2e không còn lỗi console). | Nhẹ | Đã sửa |
| BUG-003 | (Môi trường dev) **`web/start.bat` / `npm run up` không bật được server trên máy người dùng**: (1) cổng 5432 bị container Postgres của dự án khác (`hoaphap-postgres`) chiếm → phải chạy tay `POSTGRES_PORT=5433`; (2) volume node_modules mới thì container server thiếu Prisma client (phải `npx prisma generate` tay); (3) thiếu `web/server/.env` (`SESSION_SECRET`) → server dừng, không báo rõ. Game T-001 vẫn chạy vì chỉ cần client. Gợi ý (`backend-dev`): entrypoint tự `prisma generate`; tự tạo `.env` dev từ `.env.example` (sinh secret ngẫu nhiên) hoặc báo lỗi dễ hiểu; cho đổi cổng DB qua `web/.env` và để `start.bat` báo khi cổng bận. Cần sửa trước bước 3.4 (tài khoản). **→ Sửa ở T-010.** **Đã sửa (2026-10-13, T-010):** cổng DB trên máy mặc định 5433, đổi được bằng `POSTGRES_PORT` trong `web/.env`; `start.bat`/`npm run up` chạy `web/docker/preflight.ps1` trước (cổng bận → báo rõ ai chiếm + cách sửa, không bật nửa chừng; thiếu `web/server/.env` → tự tạo với SESSION_SECRET ngẫu nhiên); entrypoint tự `prisma generate`; thiếu biến → một dòng `[config] …`. Kiểm: stack sạch tách riêng + stack thật đều healthy, `/api/health` db:true. | Vừa | Đã sửa (người dùng xác nhận start.bat chạy, 2026-10-13) |
| BUG-004 | (T-002) **Mới vào game, chưa rê chuột lên khung game đã có một viền xám ở góc trên-trái màn hình.** `InputController.pointerInside` mặc định `true`, con trỏ Phaser mặc định ở (0,0) → `updatePointer` vẽ viền ô ngoài tầm ở ô góc trên-trái khung nhìn cho tới khi chuột di chuyển lần đầu. Tái hiện: mở http://localhost:5173 mà không đụng chuột (hoặc chuột đang nằm ngoài cửa sổ trình duyệt) → nhìn góc trên-trái; `debugState.hover` = `{ x: 1, y: 7, highlight: 'gray' }`. Test `A10` trong `web/e2e/tests/qa-t002.spec.ts`, ảnh `web/e2e/screenshots/qa-t002-load-no-mouse.png`. Gợi ý: để `pointerInside = false` cho tới sự kiện `GAME_OVER`/`POINTER_MOVE` đầu tiên. | Nh Đã sửa 2026-10-10: `pointerInside` bắt đầu là false, bật khi có `POINTER_MOVE`/`GAME_OVER`. | Nhẹ | Đã sửa |
| BUG-005 | (T-002) **Rung màn khi cuốc theo chiều dọc chỉ còn ~0.02 ô thay vì 0.05 ô (GDD §8 `screenShakeLight`).** `cam.shake(…, (0.05·T)/cam.width)` truyền một số → Phaser nhân cùng tỷ lệ với bề rộng cho trục X (đúng 0.052 ô) nhưng với **bề cao** cho trục Y → 0.021 ô (màn 16:9 nên dọc chỉ bằng 56%). Thời gian 0.1 s đúng. Tái hiện: test `A9` trong `web/e2e/tests/qa-t002.spec.ts` (in `max ox (ô) 0.052 max oy (ô) 0.021`). Gợi ý: truyền `new Phaser.Math.Vector2(a / cam.width, a / cam.height)`. Ảnh hưởng nhỏ (rung hơi "ngang"), sửa khi tiện — các mức rung vừa/mạnh về sau sẽ dùng chung hàm. | Nh Đã sửa 2026-10-10: truyền `Vector2(amp/width, amp/height)` cho `cam.shake`. | Nhẹ | Đã sửa |
| BUG-006 | (Test, không phải game) **Vài test e2e đo theo giờ thật nên đỏ ngẫu nhiên khi máy bận / chạy cả bộ** (thấy ở `qa-t002` A1/A2, `garden.spec` BUG-001, `qa-t001` Q4, `farm.spec` đi+cuốc): chạy riêng thì xanh. Chromium headless chạy đồng hồ game chậm hơn giờ thật nên `waitForTimeout(ms)` không đủ. A2 đã nới chờ 600→1500 ms. Gợi ý: đổi các chờ cố định sang chờ theo trạng thái game (`expect.poll`/`waitForFunction` trên `debugState`), hoặc đặt `workers: 1` + retries 1 cho e2e. **QA T-007 (2026-10-12):** chạy cả bộ (142 ca, 1 worker, 58 phút; máy 32 luồng dùng ~24% CPU, chrome-headless ~5,6 lõi, có League Client + OneDrive chạy nền) đỏ 5 ca — chạy lại riêng `--repeat-each 2` thì xanh 10/10, cả 5 file test không bị T-007 sửa → đều do đọc trạng thái "thoáng qua" trễ khi máy chậm (~16 FPS): (1) `crops.spec:219` dòng 259 `dropsActive > 0` — giọt nước đã tắt trước khi đọc; (2) `crops.spec:536` dòng 558 và (3) `qa-t003.spec:642` Q11 dòng 674 — chờ `action.kind` = `plant`/`water` nhưng việc nhanh 0.4 s đã xong trước lần hỏi đầu; (4) `crops.spec:615` dòng 649 tiếng hái `[0, 200, 0]` thay vì `[0, 200, 400]` — giữa hai lần hái quá `harvestPitchResetSeconds` 1.2 s; (5) `economy.spec:186` dòng 260 `moneyFloat` rỗng — chữ "−4 quan" (1.2 s) đã bay xong. Gợi ý: (2)(3) gọi `debugSetTestTuning({ fastActionSeconds: 30 })` trước khi chờ `action.kind` (như Q10b của BUG-014); (1)(5) kiểm bằng bộ đếm/nhật ký (vd `farmJuice.waterDrops` tổng, `money.floatLog`) thay vì "đang hiện"; (4) thêm hook kéo dài `harvestPitchResetSeconds` lúc kiểm, hoặc chỉ đòi các nấc tăng dần khi khoảng cách giữa hai lần hái < ngưỡng. **→ Sửa ở T-018** (đầu chặng 4, trước các task code lớn — D-034). | Nhẹ | Mở (T-018) |
| BUG-007 | (T-002 phần 2) **Chạm phím đi thật nhanh khi đang cuốc có thể không bỏ dở.** Bỏ dở chỉ xét `isDown` của phím tại lúc `update()` (`GardenScene.update` → `controls.moveDirection()`); nếu keydown + keyup lọt giữa hai frame (chạm phím ngắn hơn 1 frame — dễ gặp hơn khi FPS thấp, máy vẽ bằng CPU 13–40 FPS) thì {ten} cuốc tiếp như không có gì. Chuột đã ghi theo sự kiện (`primaryPressed`) nhưng phím đi thì chưa. **Tái hiện:** `qa-t002b.spec.ts` B10 — đang cuốc, bắn `keydown`+`keyup` D liền nhau trong cùng một tác vụ JS → `action.busy` vẫn `true`, `till.cancels` = 0. Gợi ý: ghi "vừa nhấn phím đi" theo sự kiện (như chuột) hoặc dùng `JustDown` cho các phím đi để bỏ dở. **Đã sửa 2026-10-10:** `InputController` ghi "vừa nhấn phím đi" theo sự kiện keydown (`consumeMovePress`, giống chuột); `GardenScene` bỏ dở khi có lần nhấn đó hoặc đang giữ phím. B10 trong `qa-t002b.spec.ts` giờ kiểm cứng (`busy` false, `cancels` 1) — xanh. | Nhẹ | Đã sửa |
| BUG-008 | (Test, không phải game — cùng loại BUG-006) **Chạy cả bộ `npm run test:e2e` (nhiều worker song song) có 2 ca T-002 đỏ ngẫu nhiên, chạy riêng thì xanh (3/3 lần):** (1) `farm.spec` "THÔNG SỐ THẬT" — `heroScale.y` = 0.964 không < 0.95 vì cảnh bị dừng trễ 1 frame sau điểm chạm khi máy bận; (2) `qa-t002` A3 — `tilled` dừng ở 3 thay vì 4 trong 30 s (đồng hồ game quá chậm khi 4 worker chạy WebGL phần mềm cùng lúc). Gợi ý: `workers: 1` cho e2e hoặc nới điều kiện (kiểm bẹp trong cửa sổ vài frame quanh điểm chạm; timeout theo frame). **Đã sửa 2026-10-10:** `web/e2e/playwright.config.ts` đặt `workers: 1` (chậm hơn nhưng ổn định); ca "THÔNG SỐ THẬT" nới kiểm bẹp còn `heroScale.y < 0.98`; A3 và các ca hàng chờ/bỏ dở đặt nhát rất dài lúc kiểm rồi mới rút ngắn (không phụ thuộc tốc độ máy). | Nhẹ | Đã sửa |
| BUG-009 | (T-003) **Cuộn bằng touchpad laptop làm ô hotbar chạy vèo vèo.** `InputController` cộng `Math.sign(deltaY)` cho MỖI sự kiện wheel, bất kể độ lớn: chuột thường 1 nấc = 1 sự kiện deltaY 100 (đúng), nhưng touchpad / chuột cuộn mượt bắn hàng chục sự kiện deltaY nhỏ (2–20) mỗi lần vuốt → nhảy vài ô, thậm chí vòng cả thanh. **Tái hiện:** `qa-t003.spec.ts` Q8 — 4 sự kiện `mouse.wheel(0, 4)` (tổng chỉ 16 px) đổi ô chọn từ 8 sang 3 (nhảy 4 ô). Trên laptop: vuốt hai ngón nhẹ trên touchpad khi đang chơi. Gợi ý: cộng dồn deltaY, đủ ngưỡng (~50–100 px) mới tính 1 nấc, hoặc giới hạn tối đa 1 nấc mỗi ~80 ms. **Đã sửa 2026-10-10:** cộng dồn deltaY (deltaMode dòng/trang đổi ra px), đủ `wheelStepDelta` (100 px, gameConfig) mới tính 1 nấc, đổi chiều thì bỏ phần dư (`src/input/wheel.ts` + unit test `wheel.test.ts`). Chuột thường (deltaY 100) vẫn 1 ô/nấc; 4 × deltaY 4 không đổi ô. E2E `crops.spec` ca Hotbar kiểm cả hai. | Nhẹ | Đã sửa |
| BUG-010 | (T-003) **Bấm 2 phím số gần như cùng lúc (trong 1 frame) thì ô chọn theo phím SỐ LỚN hơn chứ không theo phím bấm SAU.** `hotbarPressed()` duyệt phím 1→9 và lấy phím cuối trong thứ tự đó, không theo thứ tự bấm. **Tái hiện:** `qa-t003.spec.ts` Q8 — bắn keydown 7 rồi keydown 3 trong cùng một tác vụ JS → ô chọn là 7 (mong đợi 3); chạy Q8 trên Edge (`npx playwright test -c playwright.qa-edge.config.ts tests/qa-t003.spec.ts -g Q8`) gõ nhanh "94" → chọn ô 9 thay vì 4. Người thật khó gặp (phải bấm 2 phím cách nhau < 16 ms, máy FPS thấp thì dễ hơn). Gợi ý: nhớ mã phím số bấm SAU CÙNG theo sự kiện keydown. **Đã sửa 2026-10-10:** `InputController` nhớ ô của phím số bấm SAU CÙNG theo thứ tự keydown. Nguyên nhân sâu hơn: `ANY_KEY_DOWN` của Phaser 3.90 xử lý lại hàng đợi phím nhiều lần trong một frame nên có thể phát lại keydown cũ SAU keydown mới (đo được thứ tự 7, 7, 3, 7) → đổi sang nghe `keydown` thẳng trên `window` (gỡ khi scene tắt; vẫn bỏ phím lặp do giữ). E2E `crops.spec` ca Hotbar: bắn 7 rồi 3 cùng frame → ô 3. | Nhẹ | Đã sửa |
| BUG-011 | (T-003) **Tên món (tooltip) của các ô hàng trên trong cửa sổ gùi đè lên chữ tiêu đề "Gùi".** Tooltip đặt ngay trên ô, mà hàng trên sát tiêu đề → rê chuột lên ô 1–2 thì nhãn "Hạt rau cải" che mất chữ "Gùi". **Tái hiện:** bấm E, rê chuột lên ô 1. Ảnh `web/e2e/screenshots/qa-t003-1366-bag.png`. Gợi ý: hàng trên đặt tooltip phía dưới ô, hoặc nới khoảng tiêu đề. Chỉ là thẩm mỹ. **Đã sửa 2026-10-10:** tooltip nằm trong khe giữa hai hàng — hàng trên hiện BÊN DƯỚI ô, hàng dưới hiện BÊN TRÊN ô → không đè tiêu đề "Gùi", chú thích góc phải hay dòng hướng dẫn chân cửa sổ (chữ 22 px). `debugState.hud.tooltipCenter` cho QA kiểm; ảnh `web/e2e/screenshots/t003-bag-tooltip-top.png`. | Nhẹ | Đã sửa |
| BUG-012 | (T-004) **Ăn liền tay vài củ khoai (chuột phải nhanh) thì các chữ "+8 Sức" chồng khít lên nhau, nhìn như chỉ có một "+8 Sức"** dù Sức đã tăng +24. Chữ bay nào cũng bắt đầu đúng một chỗ (`spawnFloat`: cạnh ngực {ten}) và bay cùng quỹ đạo, nên các lần ăn cách nhau < ~0.3 s lệch nhau chỉ 2–5 px. Cũng gặp khi ăn khoai lúc Sức gần đầy ("+3 Sức" đè "+8 Sức"). **Tái hiện:** chọn ô có khoai, Sức 20, bấm chuột phải 3 lần thật nhanh → Sức 44 nhưng chỉ thấy một chữ "+8 Sức"; `node web/e2e/diag-t004-stack.mjs` (in 3 chữ đang bay ở y 889/892/894), ảnh `web/e2e/screenshots/qa-t004-eat-stack.png`. Gợi ý: lệch dần chữ mới (vd chữ trước còn sống thì đặt chữ mới cao/thấp hơn ~0.4 ô), hoặc gộp thành một chữ cộng dồn ("+24 Sức") khi ăn liên tiếp trong ~0.5 s. Chỉ là thẩm mỹ / phản hồi. **Đã sửa (game-dev, 2026-10-11):** chữ bay cùng dấu còn mới (< `staminaFloatMergeSeconds` 0.5 s) thì GỘP thành một số cộng dồn ("+8" → "+16" → "+24 Sức"), chữ đó nảy lại và bay tiếp từ chỗ đang đứng; chữ khác dấu ("−20 Sức" + "+8 Sức") thì chữ mới đặt cao hơn `staminaFloatStackOffset` 0.45 ô. Debug thêm `stamina.floatsActiveY`. E2E `stamina.spec.ts` ca "BUG-012" (ảnh `t004-eat-merged.png`, `t004-float-stacked.png`); `qa-t004` Q5/Q6 chỉnh theo hành vi gộp. | Nhẹ | Đã sửa |
| BUG-013 | (T-002/T-004, thấy khi QA T-005 chạy cả bộ e2e) **Ô kế trong hàng chờ cuốc chỉ được bổ 1 nhát rồi bị bỏ lại dở (1/6), {ten} chuyển luôn sang ô sau.** Khi nhát CUỐI của ô trước chạm và ô kế bắt đầu trong CÙNG một bước (`stepTileAction` trả `impact` = ô cũ + `started` = ô mới), `impactTill` gặp `done` và chạy dòng "số nhát bị chỉnh nhỏ giữa chừng (QA)": `if (isBusy(this.action) && this.action.strikesLeft > 1) this.action.strikesLeft = 1;` — lúc đó `this.action` đã là ô MỚI nên ô mới bị ép còn 1 nhát. **Tái hiện:** `qa-t004.spec.ts` Q3 đỏ ngẫu nhiên (~1/4 lần, `--repeat-each 4`): hàng chờ 13,13 → 13,14 → 13,15, `strikeSeconds` 0.1 → kết quả `13,14: 1 nhát, untilled`, `13,15: tilled` (trace: `test-results/qa-t004-Q3-…-repeat3/trace.zip`). Chỉ xảy ra khi một frame dài hơn nửa nhát: Phaser kẹp `delta` ≤ 200 ms nên với thông số thật (0.85 s/nhát) gần như không gặp, nhưng sẽ gặp nếu T-009 chỉnh `tillStrikeSeconds` < 0.4 s, và làm test chập chờn. Gợi ý: chỉ ép `strikesLeft` khi ô vừa xong chính là `this.action.current` (so tọa độ), hoặc làm việc đó trong `stepTileAction`. **Đã sửa (game-dev, 2026-10-11):** hàm thuần `capStrikesIfCurrent(state, ô)` trong `systems/tileAction.ts` chỉ ép "còn 1 nhát" khi ô vừa bổ CHÍNH LÀ ô đang làm (so tọa độ); `impactTill` gọi hàm này thay dòng cũ → ô mới bắt đầu cùng bước giữ đủ số nhát. Unit test frame dài (0.1 s/nhát, bước 0.2 s) trong `tileAction.test.ts`; `qa-t004.spec.ts:371` (Q3) `--repeat-each 4` xanh 4/4. | Nhẹ | Đã sửa |
| BUG-014 | (Test, không phải game — cùng loại BUG-006) **Còn 2 ca e2e cũ đỏ ngẫu nhiên khi chạy cả bộ (chạy riêng thì xanh):** (1) `qa-t004` Q2 — sau khi chửi thề còn chụp ảnh + chờ hỏi trạng thái (nhịp hỏi mặc định giãn tới 1 s) nên tới lúc click ô 14,14 thì bong bóng chửi (2.5 s) đã hết → hiện "Đuối rồi…" (đúng luật) nhưng test đòi `grumble`; (2) `qa-t003` Q10b — gieo 0.4 s, điểm chạm 0.2 s: máy chậm thì hạt đã rơi trước khi kịp mở gùi (`farmJuice.plants` = 1). Gợi ý: Q2 click ngay sau khi xác nhận chửi (bỏ chụp ảnh ở giữa, hỏi `intervals: [50]`) hoặc đặt `grumbleBubbleSeconds` dài qua debug; Q10b kéo dài `actionDuration` qua hàm debug lúc kiểm (giống `debugSetTillTuning`). **Đã sửa (game-dev, 2026-10-11):** thêm hàm QA `debugSetTestTuning({ fastActionSeconds, grumbleSeconds })` trong GardenScene. Q2: kéo dài bong bóng chửi lên 30 s trước khi cuốc → lúc click ô 14,14 câu chửi chắc chắn còn, kiểm chặt `kind: 'grumble'`; ngoài ra lần chờ "≥ 4 nhát" hỏi mỗi 50 ms. Q10b: việc nhanh kéo dài 30 s (điểm chạm 15 s) qua hàm debug thay vì 4 s ghi thẳng vào biến riêng. | Nhẹ | Đã sửa |
| BUG-015 | (T-005) **Chữ phụ của cửa sổ Tạm dừng 22 px và gợi ý phím 20 px — dưới mức "chữ thân ≥ 24px ở 1080p" (GDD §11).** "Đồng hồ ngày đang đứng yên", "Esc: chơi tiếp" (22 px) và cả khối gợi ý góc dưới phải (20 px) ở cửa sổ 1366×768 chỉ còn ~14–15 px, đọc được nhưng nhỏ. **Tái hiện:** ảnh `web/e2e/screenshots/qa-t005-pause-1366.png`, `qa-t005-hud-1366.png`; `qa-t005.spec.ts` Q11 in cỡ chữ. Gợi ý: nâng lên 24 px (gợi ý phím có thể bỏ dòng phím thử ở bản build cho đỡ chật). Thẩm mỹ / dễ đọc. **Đã sửa (game-dev, 2026-10-11):** chữ phụ cửa sổ Tạm dừng ("Đồng hồ ngày đang đứng yên", "Esc: chơi tiếp") và cả khối gợi ý phím nâng lên 24 px; dòng gợi ý chính vẫn nằm trên nút gùi, các dòng ngắn ở khe bên phải nút gùi — e2e `time.spec.ts` (bố cục 1920×1080 + 1366×768) kiểm không đè đồng hồ / thanh Sức / hotbar / nút gùi. | Nhẹ | Đã sửa |
| BUG-016 | (Test, không phải game — thấy khi QA T-027 đọc code, chưa chạy e2e theo D-036) **`web/e2e/tests/save.spec.ts:540` vẫn đòi save `version` = 1** (`expect(saved.version).toBe(1)` trong ca "tự lưu theo nhịp: hook rút ngắn 0.5 s…"), trong khi save đã lên version 2 (T-093), 3 (T-026), nay 4 (T-027) → ca này chắc chắn đỏ khi chạy e2e. **Tái hiện:** `npm run test:e2e -- save.spec.ts -g "tự lưu theo nhịp"`. Gợi ý: so với `GAME_SAVE_VERSION` (import từ `@bph/shared`) thay vì số cứng. Các e2e khác đọc `hud.moneyText` ngay sau qua đêm đã được rà: chỉ `day.spec.ts:568` cần chờ xu bay (đã sửa sang `expect.poll`), `qa-t007.spec.ts:341` có chờ 1,5 s nên vẫn đủ. **Đã sửa (game-dev, 2026-10-20):** `save.spec.ts` import `GAME_SAVE_VERSION` từ `@bph/shared` và so `expect(saved.version).toBe(GAME_SAVE_VERSION)`; `tsc -p e2e` xanh, chưa chạy e2e (D-036). | Nhẹ | Đã sửa |

## Changelog

- 2026-10-20 — T-027 👀: "khoảnh khắc sướng" — cây chín nhún + lấp lánh gọi hái (lệch nhịp từng ô), icon hái bay có vệt sáng, đóng tổng kết thì 6 đồng xu bay về ô tiền (số nhảy theo từng đồng + leng keng), "Kỷ lục mới!" khi bán được nhiều nhất từ trước tới giờ (save version 4 có `records`), mua hạt xu bay khỏi ô tiền. Chờ người dùng chơi thử.
- 2026-10-20 — T-026 ✅ (người dùng gõ `/next đi` — duyệt âm thanh Lô 1). Bắt đầu T-027.
- 2026-10-15 — D-041 (game-planner): Đồng Lầy. Thêm T-100 (gen hình Lô 3i), T-101 (khu + cổng đông Lv 5), T-102 (thửa ruộng lớn: thuê / mua, cày – cấy – gặt), T-103 (gắn hình + juice gặt); T-060, T-061 thêm tiếng đồng. Tổng ≈ 419 giờ / 86 task, mốc ~05/05/2027. T-028, T-032, T-033 trỏ concept ART-CON-002 (đã duyệt).
- 2026-10-15 — D-040 (game-planner): Xóm 72×50 + khuôn viên + chợ phiên + đình có người. Thêm T-097 (gen hình Lô 2f), T-098 (chợ phiên), T-099 (khuôn viên + vườn NPC); sửa T-028, T-029, T-031, T-032 (72×50, khuôn viên), T-033, T-035 (ngày phiên), T-037 (S → M), T-038 (M → L, NPC đình), T-040. Tổng ≈ 400 giờ / 82 task, mốc ~26/04/2027.
- 2026-10-15 — T-026 👀: gắn âm thanh Lô 1 qua một chỗ (`AudioManager` + cue), 2 kênh Nhạc / Hiệu ứng có nút −/+ ở Tạm dừng (lưu `bph-settings`), nhạc ngày ↔ đêm / trong nhà đan chéo, gà gáy theo ngày (save version 3 có `seed`).
- 2026-10-15 — T-025 ✅ (người dùng nghe vòng 3: gà gáy 6 kiểu từ bản ghi thật + 9 âm CC0 — ổn). Bắt đầu T-026.
- 2026-10-15 — T-092 ✅ (người dùng thử giao diện mới: ổn). Bắt đầu T-025.
- 2026-10-15 — T-025 vẫn 👀 (vòng 3, D-039): người dùng thấy gà tổng hợp không giống gà, đồng ý dùng bản ghi CC0 / Public domain → 6 kiểu gà làm lại từ bản ghi gà thật; ăn, ngáp, ngáy, sấm, mưa, nấu bếp, nền trong nhà, cửa nhà, rương cũng chuyển sang bản ghi thật (cùng tên file). Nguồn: `docs/audio/credits.md`. Chờ người dùng nghe.
- 2026-10-15 — T-025 vẫn 👀 (vòng 2): người dùng nghe Lô 1, chấp nhận các bản đề xuất (Approved); riêng gà gáy góp ý "lầy hơn, mỗi ngày một kiểu" → làm bộ 6 kiểu `sfx/ga-gay-<kiểu>.wav` (bình thường / tắc họng / khàn / vỡ giọng / ngái ngủ / gáy lại) + luật chọn theo ngày cho T-026 (xem audio-list AUD-SFX-109). Chờ người dùng nghe bộ gà.
- 2026-10-15 — T-025 👀: audio-director làm xong bản nghe thử Lô 1 (nhạc đêm, 2 jingle Lyria — 6 lần gọi = 0,48 USD; 26 công thức SFX / UI / nền tổng hợp, 0 USD), 45 file WAV đã đặt vào `web/client/public/assets/audio/` (bản đề xuất), chờ người dùng nghe chọn. Chi tiết: `docs/audio/audio-list.md`, card `docs/audio/prompts/AUD-LO1-SFX.md`.
- 2026-10-14 — T-093 ✅, T-096 ✅ (người dùng thử: ổn, gồm bản "đứng sát ô ruộng"). Bắt đầu T-091.
- 2026-10-14 — T-096 bổ sung (góp ý người dùng "đứng hơi xa ô canh tác"): việc ruộng phải bước tới sát ô (`farmWorkRange` 1.2), rê cả luống bước dọc luống; vẫn 👀.
- 2026-10-14 — D-038: thêm **T-096 "Click đâu đi đó + tự tìm đường"** (L, đợt B, cần T-093) → 👀 (game-dev): click / chạm ngoài tầm tự đi tới (A* 8 hướng tự viết, làm mượt, dấu đích mờ dần), tới nơi làm luôn (ruộng, thùng bán, quầy hạt, đồ trong nhà, cửa nhà vào / ra), WASD huỷ, chạm = click. Tổng 79 task (4 S + 45 M + 30 L) ≈ 320–429 giờ, mốc ≈ 375 → mốc kế hoạch ~14/04/2027.
- 2026-10-14 — T-093 👀 (game-dev): cảnh trong nhà {ten} — W ở bậc thềm vào nhà (màn mờ 0,4 s, tên khu, tự lưu), S ở khe cửa ra; giường (ngủ, sáng dậy cạnh giường kể cả ngủ gục ngoài đồng), rương 20 ô (cửa sổ như thùng bán), bếp rơm có than + khói (nấu ở T-048), hũ gạo, nón ông nội; chõng hiên thôi ngủ; save version 2 (rương + khu `house`, save cũ tự nâng); chuyển khu dùng chung `systems/areas.ts` cho T-054. Chờ người dùng thử.
- 2026-10-14 — T-023 ✅, T-024 ✅ (người dùng thử: ổn). Bắt đầu T-093.
- 2026-10-14 — T-023 👀, T-024 👀 (game-dev): dáng tưới / cúi thật (khung theo tiến độ, đang đi giữ khung bước, icon hái bay từ tay); Vườn có nhà tranh 6×5 (chõng hiên = giường tạm), thúng bán đóng / hé, quầy hạt (chừa `sellerSpot`), cọc rào ẩn, 12 cây nhãn tách tán / gốc, rào tre 4 cạnh; vật đặt theo `props/props.json`. Chờ người dùng thử.
- 2026-10-14 — T-020 ✅ người dùng duyệt (rào tre dọc vẽ lại bằng script, giữ miếng vá đũng quần). Trước đó — T-020 👀 (art-director): gen xong Lô 1 phần 2 (động tác tưới / cúi 4 hướng **4 khung như cuốc**, nhà {ten} + trong nhà + nội thất + 2 bếp, thúng bán, cọc rào, quầy hạt không người bán, cây nhãn tách tán / gốc, rào tre + dâm bụt, bụi cỏ / hoa / lùm cây); `props/props.json` cho game-dev; 4,42 USD (gồm rào dọc).
- 2026-10-14 — D-037: người dùng giữ kế hoạch người bán ở đợt C; thêm **T-095 "Kỳ kèo"** (M, đợt C, cần T-036 + T-037) — mặc cả nhẹ khi mua, hệ dùng chung. Thêm điều kiện xong vào T-036 (câu mua sắm cô Tám, chừa chỗ nút + hàm giá chung), T-037 (câu kỳ kèo), T-050 (bật kỳ kèo ở 2 thợ), T-039 (SFX kỳ kèo nếu audio list có). Tổng 78 task (4 S + 45 M + 29 L) ≈ 314–421 giờ, mốc ≈ 368 → mốc kế hoạch ~10/04/2027.
- 2026-10-14 — T-021 ✅, T-022 ✅ (người dùng thử Vườn hình thật: ổn). Bắt đầu T-020.
- 2026-10-14 — D-036: bỏ T-018 (e2e) theo lựa chọn người dùng; T-021 không còn phụ thuộc T-018; bắt đầu T-019.
- 2026-10-14 — D-035 (bước 4.2): lối đi đất nện + cụm thực vật. Thêm 1 dòng điều kiện xong vào T-019 (đất nện khác đất ruộng), T-021 (cỏ ghép viền với đất nện), T-024 (lối đất nện Vườn, không thêm cụm), T-029 (đủ loại cụm thực vật), T-032 (đặt lối + cụm bằng khối, luật va chạm), T-033 (hình thật, chặn ở gốc, e2e không kẹt). Không thêm task, không đổi size.
- 2026-10-14 — D-034 (người dùng chốt kế hoạch 4.1): T-041 … T-043 chen lên ngay sau T-027 (đợt B2, T-041 cần T-024; T-032 cần T-043, T-093); bậc 2–3 đủ động tác, bậc 4 chỉ đi / đứng (T-065 thành Lô 2e trong Đợt C, T-066 sửa, T-067 thêm "mượn khung bậc 3"); thêm **T-093 cảnh trong nhà** (giường, bếp, rương — rương lên Must; chuyển cảnh chung, T-054 L → M); khớp lô với asset list mới (nhà {ten}, trong nhà, quầy hạt, cây nhãn, rào, đường đất, giao diện HUD ở Lô 1 → sửa T-019, T-020, T-024 S → M, thêm T-091 / T-092; intro sang Lô 4 → T-070 L → M, T-082, T-084, T-086 L → M) và audio list (T-025, T-039, T-060 M → L; thêm T-094 âm Lô 4 + cân mix). Tổng 77 task (4 S + 44 M + 29 L) ≈ 310–416 giờ, mốc 363 → xong chặng 4 ~08/04/2027.
- 2026-10-13 — Bước 4.1 (D-034): thêm **73 task chặng 4** T-018 … T-090 theo 9 đợt (A nền móng → B Vườn thật Lô 1 → C Xóm + NPC Lô 2 → D mục tiêu & tiến trình → E Núi + hồ câu + nỏ → F làng Sung, sắm sửa, mặc cả, cưới → G gia đình → H meme, menu, cài đặt, UI → I game feel + QA trọn vòng). Theo bước: 4.2 = 22, 4.3 = 8, 4.4 = 39, 4.5 = 4. 5 S + 40 M + 28 L ≈ 290–395 giờ (mốc 345) ≈ 19,5–26 tuần với 15 giờ/tuần → mốc kế hoạch xong chặng 4 ~30/03/2027, soát lại ở T-052. BUG-006 giao cho T-018. T-011 … T-017 (bước 5.5) giữ nguyên.
- 2026-10-13 — T-010 👀 (backend-dev): start.bat/npm run up kiểm trước khi bật (cổng, tự tạo server/.env), cổng DB máy mặc định 5433 (POSTGRES_PORT trong web/.env), entrypoint tự prisma generate; BUG-003 → Đã sửa (chờ QA). Chờ qa-tester.
- 2026-10-13 — Bước 3.4 (D-029): thêm 8 task T-010 … T-017 (bắt buộc đăng nhập; email + Google, Facebook là task cuối cắt được; server là bản chính, bản đệm trên máy theo tài khoản, save cũ đẩy lên tài khoản đầu tiên một lần; số `revision` chống ghi đè). 4 L + 4 M ≈ 36–48 giờ ≈ 2,5–3 tuần. BUG-003 giao cho T-010.
- 2026-10-13 — T-009 ✅: bạn tự chơi (PT-000), giữ nguyên mọi thông số, đánh giá "Tạm" (D-028). Mọi task chặng 3 (T-001 … T-009) xong. Còn mở BUG-003 (sửa trước 3.4), BUG-006.
- 2026-10-13 — T-008 ✅ (người dùng xác nhận ổn).

- 2026-10-12 — T-008: tự lưu localStorage (cấu trúc save có `version` ở `@bph/shared`, luật nạp ở client), F5 vào lại đúng chỗ / giờ / ruộng / gùi / tiền / thùng / Sức; không lưu giữa chuỗi đêm (bản chụp ngay lúc qua đêm → không mất / nhân đôi tiền); save hỏng → Ngày 1 + console.warn + giữ bản hỏng; cửa sổ Tạm dừng có "Đã lưu lúc…" + "Chơi lại từ đầu" (hỏi Có/Không); → 👀 chờ bạn thử.

- 2026-10-10 — T-003 (sau QA đạt): gắn tiếng gieo `sfx-gieo-hat-1/2` (AUD-SFX-101, lệch ±70 cent) và hái `sfx-hai-cay-1/2` (AUD-SFX-102, hái liên tiếp lên dần thang ngũ cung 0/200/400/700/900/1200 cent, ngừng `harvestPitchResetSeconds` 1.2 s thì về nấc đầu); sửa BUG-009 (cuộn touchpad), BUG-010 (phím số bấm sau cùng), BUG-011 (tooltip đè tiêu đề gùi). T-003 vẫn 👀.

- 2026-10-10 — T-003: gieo / tưới / hái / dọn (việc nhanh, tự chọn theo ô), hotbar 9 ô + gùi 18 ô (E), bong bóng "hết hạt rồi" / "gùi đầy", hình cây theo giai đoạn, hàm "qua đêm" thuần (phím thử G ở bản dev); → 👀 chờ bạn thử.

- 2026-10-10 — T-002 phần 2: sửa BUG-007 (chạm phím đi nhanh vẫn bỏ dở), BUG-008 (e2e 1 worker); viền ô không phủ trắng lên ô đang cuốc/cuốc dở/đang chờ, rê chuột lên ô dở thì thanh tiến độ rõ 100%, số hàng chờ dời xuống góc ô (huy hiệu tròn nhỏ). T-002 vẫn 👀.
- 2026-10-10 — T-002 phần 2 (D-022): cuốc 6 nhát × 0.85 s/ô, thanh tiến độ 6 đốt, đất đổi 3 nấc, mồ hôi, nhát cuối chốt (bụi ×2, khựng hình, ô nảy, tiếng trầm), WASD bỏ dở giữ tiến độ, click lại làm tiếp, hàng chờ 3 ô có số; → 👀 chờ bạn thử.
- 2026-10-10 — D-022: cuốc thành "việc nặng" ≈ 5 s/ô. T-002 → 🔄, thêm **phần 2** (6 nhát × 0.85 s, thanh tiến độ, đất đổi 3 nấc, WASD bỏ dở giữ tiến độ, click lại làm tiếp, hàng chờ 3 ô, Size M). Ghi chú ảnh hưởng cho T-003 (việc khác giữ nhanh), T-004 (4 Sức/ô trừ khi xong, bong bóng lầm bầm), T-005 (tạm dừng giữa lúc cuốc), T-007 (cuốc dở giữ qua đêm), T-008 (lưu `tillStrikes`), T-009 (nút chỉnh mới). Tổng bước 3.3 thêm ≈ 3–4 giờ.

- 2026-10-10 — Sửa: nhạc nền `music-vuon` chỉ có ở Sandbox nên từ T-001 (game mở vào Vườn) mất nhạc → GardenScene tự phát nhạc lặp sau lần bấm đầu tiên (chính sách autoplay), không phát chồng.
- 2026-10-10 — T-002: chỉ ô bằng chuột (viền sáng/xám theo tầm với), click / giữ chuột rê để cuốc ruộng, juice (nhún, bụi đất, rung nhẹ, "bộp"); → 👀 chờ bạn thử.
- 2026-10-10 — T-001: thay đi ngang bằng 6 khung (ART-CHR-005) và thêm khung xoay khi đổi hướng (ART-CHR-006) theo góp ý người dùng; vẫn 👀.
- 2026-10-10 — T-001: gắn chu trình bước thật ART-CHR-004; BUG-001 (kẹt mối nối tường) và BUG-002 (favicon) → Đã sửa. T-001 vẫn 👀 chờ người dùng tự thử.
- 2026-10-09 — Bước 3.2 (D-019): thêm 9 task chặng 3 (T-001 … T-009) cho prototype "một ngày ở Vườn", ước lượng 40–46 giờ ≈ 3 tuần với 15 giờ/tuần.
