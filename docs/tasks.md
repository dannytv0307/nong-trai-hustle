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
| T-010 | 3.4 | Sửa BUG-003: `start.bat` bật được cả stack trên máy bạn (cổng DB đổi được, tự tạo `.env`, tự `prisma generate`) | backend-dev | M | — | 👀 |
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

## Lỗi (bug)

| ID | Mô tả | Mức độ | Trạng thái |
|---|---|---|---|
| BUG-001 | (T-001) **Kẹt ở mối nối tường nhà khi đi chéo.** Đứng sát mặt ngoài **bên trái** nhà, giữ **D+W** (ép vào tường và đi lên): nhân vật đứng khựng ở y=650px (mối nối khối tường dưới ↔ tường trái, hàng 10/9) và thỉnh thoảng ở y≈266px (tường trái ↔ tường trên, hàng 4/3); `blocked.up` bật dù phía trên không có vật cản. Chỉ thả D mới đi tiếp. Lần chạy khác lại kẹt ở mặt **phải** nhà khi giữ **A+W** (dừng ở y=266px) — kẹt hay không tùy độ dài frame, nên người chơi sẽ gặp ngẫu nhiên ở mọi mối nối khi đi lên; chiều đi xuống chưa thấy kẹt. Nguyên nhân: tường nhà là nhiều hộp Arcade nằm nối mép ngoài thẳng hàng → va chạm "mép trong" của hộp kế bên. Tái hiện: `node web/e2e/diag-t001.mjs seam3` hoặc test `Q2` trong `web/e2e/tests/qa-t001.spec.ts`; ảnh `web/e2e/screenshots/qa-t001-stuck-1.png`. Gợi ý: dùng lớp va chạm Tilemap (`setCollision`, Phaser tự bỏ mép trong giữa các ô liền nhau); chỉ đổi cách chia hộp thì mối nối sẽ chuyển sang mặt khác. Thêm test trượt chéo cả 4 mặt ngoài nhà. Không đạt điều kiện "trượt dọc theo cạnh (không bị kẹt)". **Đã sửa (2026-10-10):** rào, tường, giường, ao không còn là nhiều hộp Arcade nối nhau mà là một **lớp va chạm Tilemap** ẩn (`buildCollisionLayer` trong `GardenScene.ts`, lưới từ `tileSolidGrid` trong `systems/garden.ts`); Phaser tự tắt mặt chung giữa hai ô chặn liền nhau nên không còn mép trong ở mối nối. Kiểm: e2e `BUG-001: ép chéo dọc cả 4 mặt ngoài nhà (và ao)` (`garden.spec.ts`, 10 ca: trái lên/xuống, phải lên/xuống, trên sang phải/trái, dưới hai bên cửa, ao trái/trên) + `Q2` xanh; unit test vòng tường liền mạch. Ghi chú: Q2 cũ đặt điểm xuất phát cách góc tường 14px (< `cornerNudgePx` 16) nên frame chỉ có một phím bị "nắn" vòng qua góc (đúng thiết kế) — đã dời điểm xuất phát và đổi giới hạn 80 frame thành 4 giây game. | Nhẹ | Đã sửa |
| BUG-002 | (T-001) **Console báo lỗi 404 `/favicon.ico`** ("Failed to load resource … 404") khi mở game — thấy trên Edge (Playwright kênh msedge), chromium headless không báo. Vi phạm mục "không console error". Tái hiện: `curl http://localhost:5173/favicon.ico` → 404; `node web/e2e/diag-edge.mjs`. Gợi ý: thêm favicon hoặc `<link rel="icon" href="data:,">` trong `web/client/index.html`. **Đã sửa:** thêm `web/client/public/favicon.svg` + `<link rel="icon" type="image/svg+xml" href="/favicon.svg">` trong `web/client/index.html` (kiểm 2026-10-10: `GET /favicon.svg` → 200; e2e không còn lỗi console). | Nhẹ | Đã sửa |
| BUG-003 | (Môi trường dev) **`web/start.bat` / `npm run up` không bật được server trên máy người dùng**: (1) cổng 5432 bị container Postgres của dự án khác (`hoaphap-postgres`) chiếm → phải chạy tay `POSTGRES_PORT=5433`; (2) volume node_modules mới thì container server thiếu Prisma client (phải `npx prisma generate` tay); (3) thiếu `web/server/.env` (`SESSION_SECRET`) → server dừng, không báo rõ. Game T-001 vẫn chạy vì chỉ cần client. Gợi ý (`backend-dev`): entrypoint tự `prisma generate`; tự tạo `.env` dev từ `.env.example` (sinh secret ngẫu nhiên) hoặc báo lỗi dễ hiểu; cho đổi cổng DB qua `web/.env` và để `start.bat` báo khi cổng bận. Cần sửa trước bước 3.4 (tài khoản). **→ Sửa ở T-010.** **Đã sửa (2026-10-13, T-010):** cổng DB trên máy mặc định 5433, đổi được bằng `POSTGRES_PORT` trong `web/.env`; `start.bat`/`npm run up` chạy `web/docker/preflight.ps1` trước (cổng bận → báo rõ ai chiếm + cách sửa, không bật nửa chừng; thiếu `web/server/.env` → tự tạo với SESSION_SECRET ngẫu nhiên); entrypoint tự `prisma generate`; thiếu biến → một dòng `[config] …`. Kiểm: stack sạch tách riêng + stack thật đều healthy, `/api/health` db:true. | Vừa | Đã sửa (chờ QA) |
| BUG-004 | (T-002) **Mới vào game, chưa rê chuột lên khung game đã có một viền xám ở góc trên-trái màn hình.** `InputController.pointerInside` mặc định `true`, con trỏ Phaser mặc định ở (0,0) → `updatePointer` vẽ viền ô ngoài tầm ở ô góc trên-trái khung nhìn cho tới khi chuột di chuyển lần đầu. Tái hiện: mở http://localhost:5173 mà không đụng chuột (hoặc chuột đang nằm ngoài cửa sổ trình duyệt) → nhìn góc trên-trái; `debugState.hover` = `{ x: 1, y: 7, highlight: 'gray' }`. Test `A10` trong `web/e2e/tests/qa-t002.spec.ts`, ảnh `web/e2e/screenshots/qa-t002-load-no-mouse.png`. Gợi ý: để `pointerInside = false` cho tới sự kiện `GAME_OVER`/`POINTER_MOVE` đầu tiên. | Nh Đã sửa 2026-10-10: `pointerInside` bắt đầu là false, bật khi có `POINTER_MOVE`/`GAME_OVER`. | Nhẹ | Đã sửa |
| BUG-005 | (T-002) **Rung màn khi cuốc theo chiều dọc chỉ còn ~0.02 ô thay vì 0.05 ô (GDD §8 `screenShakeLight`).** `cam.shake(…, (0.05·T)/cam.width)` truyền một số → Phaser nhân cùng tỷ lệ với bề rộng cho trục X (đúng 0.052 ô) nhưng với **bề cao** cho trục Y → 0.021 ô (màn 16:9 nên dọc chỉ bằng 56%). Thời gian 0.1 s đúng. Tái hiện: test `A9` trong `web/e2e/tests/qa-t002.spec.ts` (in `max ox (ô) 0.052 max oy (ô) 0.021`). Gợi ý: truyền `new Phaser.Math.Vector2(a / cam.width, a / cam.height)`. Ảnh hưởng nhỏ (rung hơi "ngang"), sửa khi tiện — các mức rung vừa/mạnh về sau sẽ dùng chung hàm. | Nh Đã sửa 2026-10-10: truyền `Vector2(amp/width, amp/height)` cho `cam.shake`. | Nhẹ | Đã sửa |
| BUG-006 | (Test, không phải game) **Vài test e2e đo theo giờ thật nên đỏ ngẫu nhiên khi máy bận / chạy cả bộ** (thấy ở `qa-t002` A1/A2, `garden.spec` BUG-001, `qa-t001` Q4, `farm.spec` đi+cuốc): chạy riêng thì xanh. Chromium headless chạy đồng hồ game chậm hơn giờ thật nên `waitForTimeout(ms)` không đủ. A2 đã nới chờ 600→1500 ms. Gợi ý: đổi các chờ cố định sang chờ theo trạng thái game (`expect.poll`/`waitForFunction` trên `debugState`), hoặc đặt `workers: 1` + retries 1 cho e2e. **QA T-007 (2026-10-12):** chạy cả bộ (142 ca, 1 worker, 58 phút; máy 32 luồng dùng ~24% CPU, chrome-headless ~5,6 lõi, có League Client + OneDrive chạy nền) đỏ 5 ca — chạy lại riêng `--repeat-each 2` thì xanh 10/10, cả 5 file test không bị T-007 sửa → đều do đọc trạng thái "thoáng qua" trễ khi máy chậm (~16 FPS): (1) `crops.spec:219` dòng 259 `dropsActive > 0` — giọt nước đã tắt trước khi đọc; (2) `crops.spec:536` dòng 558 và (3) `qa-t003.spec:642` Q11 dòng 674 — chờ `action.kind` = `plant`/`water` nhưng việc nhanh 0.4 s đã xong trước lần hỏi đầu; (4) `crops.spec:615` dòng 649 tiếng hái `[0, 200, 0]` thay vì `[0, 200, 400]` — giữa hai lần hái quá `harvestPitchResetSeconds` 1.2 s; (5) `economy.spec:186` dòng 260 `moneyFloat` rỗng — chữ "−4 quan" (1.2 s) đã bay xong. Gợi ý: (2)(3) gọi `debugSetTestTuning({ fastActionSeconds: 30 })` trước khi chờ `action.kind` (như Q10b của BUG-014); (1)(5) kiểm bằng bộ đếm/nhật ký (vd `farmJuice.waterDrops` tổng, `money.floatLog`) thay vì "đang hiện"; (4) thêm hook kéo dài `harvestPitchResetSeconds` lúc kiểm, hoặc chỉ đòi các nấc tăng dần khi khoảng cách giữa hai lần hái < ngưỡng. | Nhẹ | Mở |
| BUG-007 | (T-002 phần 2) **Chạm phím đi thật nhanh khi đang cuốc có thể không bỏ dở.** Bỏ dở chỉ xét `isDown` của phím tại lúc `update()` (`GardenScene.update` → `controls.moveDirection()`); nếu keydown + keyup lọt giữa hai frame (chạm phím ngắn hơn 1 frame — dễ gặp hơn khi FPS thấp, máy vẽ bằng CPU 13–40 FPS) thì {ten} cuốc tiếp như không có gì. Chuột đã ghi theo sự kiện (`primaryPressed`) nhưng phím đi thì chưa. **Tái hiện:** `qa-t002b.spec.ts` B10 — đang cuốc, bắn `keydown`+`keyup` D liền nhau trong cùng một tác vụ JS → `action.busy` vẫn `true`, `till.cancels` = 0. Gợi ý: ghi "vừa nhấn phím đi" theo sự kiện (như chuột) hoặc dùng `JustDown` cho các phím đi để bỏ dở. **Đã sửa 2026-10-10:** `InputController` ghi "vừa nhấn phím đi" theo sự kiện keydown (`consumeMovePress`, giống chuột); `GardenScene` bỏ dở khi có lần nhấn đó hoặc đang giữ phím. B10 trong `qa-t002b.spec.ts` giờ kiểm cứng (`busy` false, `cancels` 1) — xanh. | Nhẹ | Đã sửa |
| BUG-008 | (Test, không phải game — cùng loại BUG-006) **Chạy cả bộ `npm run test:e2e` (nhiều worker song song) có 2 ca T-002 đỏ ngẫu nhiên, chạy riêng thì xanh (3/3 lần):** (1) `farm.spec` "THÔNG SỐ THẬT" — `heroScale.y` = 0.964 không < 0.95 vì cảnh bị dừng trễ 1 frame sau điểm chạm khi máy bận; (2) `qa-t002` A3 — `tilled` dừng ở 3 thay vì 4 trong 30 s (đồng hồ game quá chậm khi 4 worker chạy WebGL phần mềm cùng lúc). Gợi ý: `workers: 1` cho e2e hoặc nới điều kiện (kiểm bẹp trong cửa sổ vài frame quanh điểm chạm; timeout theo frame). **Đã sửa 2026-10-10:** `web/e2e/playwright.config.ts` đặt `workers: 1` (chậm hơn nhưng ổn định); ca "THÔNG SỐ THẬT" nới kiểm bẹp còn `heroScale.y < 0.98`; A3 và các ca hàng chờ/bỏ dở đặt nhát rất dài lúc kiểm rồi mới rút ngắn (không phụ thuộc tốc độ máy). | Nhẹ | Đã sửa |
| BUG-009 | (T-003) **Cuộn bằng touchpad laptop làm ô hotbar chạy vèo vèo.** `InputController` cộng `Math.sign(deltaY)` cho MỖI sự kiện wheel, bất kể độ lớn: chuột thường 1 nấc = 1 sự kiện deltaY 100 (đúng), nhưng touchpad / chuột cuộn mượt bắn hàng chục sự kiện deltaY nhỏ (2–20) mỗi lần vuốt → nhảy vài ô, thậm chí vòng cả thanh. **Tái hiện:** `qa-t003.spec.ts` Q8 — 4 sự kiện `mouse.wheel(0, 4)` (tổng chỉ 16 px) đổi ô chọn từ 8 sang 3 (nhảy 4 ô). Trên laptop: vuốt hai ngón nhẹ trên touchpad khi đang chơi. Gợi ý: cộng dồn deltaY, đủ ngưỡng (~50–100 px) mới tính 1 nấc, hoặc giới hạn tối đa 1 nấc mỗi ~80 ms. **Đã sửa 2026-10-10:** cộng dồn deltaY (deltaMode dòng/trang đổi ra px), đủ `wheelStepDelta` (100 px, gameConfig) mới tính 1 nấc, đổi chiều thì bỏ phần dư (`src/input/wheel.ts` + unit test `wheel.test.ts`). Chuột thường (deltaY 100) vẫn 1 ô/nấc; 4 × deltaY 4 không đổi ô. E2E `crops.spec` ca Hotbar kiểm cả hai. | Nhẹ | Đã sửa |
| BUG-010 | (T-003) **Bấm 2 phím số gần như cùng lúc (trong 1 frame) thì ô chọn theo phím SỐ LỚN hơn chứ không theo phím bấm SAU.** `hotbarPressed()` duyệt phím 1→9 và lấy phím cuối trong thứ tự đó, không theo thứ tự bấm. **Tái hiện:** `qa-t003.spec.ts` Q8 — bắn keydown 7 rồi keydown 3 trong cùng một tác vụ JS → ô chọn là 7 (mong đợi 3); chạy Q8 trên Edge (`npx playwright test -c playwright.qa-edge.config.ts tests/qa-t003.spec.ts -g Q8`) gõ nhanh "94" → chọn ô 9 thay vì 4. Người thật khó gặp (phải bấm 2 phím cách nhau < 16 ms, máy FPS thấp thì dễ hơn). Gợi ý: nhớ mã phím số bấm SAU CÙNG theo sự kiện keydown. **Đã sửa 2026-10-10:** `InputController` nhớ ô của phím số bấm SAU CÙNG theo thứ tự keydown. Nguyên nhân sâu hơn: `ANY_KEY_DOWN` của Phaser 3.90 xử lý lại hàng đợi phím nhiều lần trong một frame nên có thể phát lại keydown cũ SAU keydown mới (đo được thứ tự 7, 7, 3, 7) → đổi sang nghe `keydown` thẳng trên `window` (gỡ khi scene tắt; vẫn bỏ phím lặp do giữ). E2E `crops.spec` ca Hotbar: bắn 7 rồi 3 cùng frame → ô 3. | Nhẹ | Đã sửa |
| BUG-011 | (T-003) **Tên món (tooltip) của các ô hàng trên trong cửa sổ gùi đè lên chữ tiêu đề "Gùi".** Tooltip đặt ngay trên ô, mà hàng trên sát tiêu đề → rê chuột lên ô 1–2 thì nhãn "Hạt rau cải" che mất chữ "Gùi". **Tái hiện:** bấm E, rê chuột lên ô 1. Ảnh `web/e2e/screenshots/qa-t003-1366-bag.png`. Gợi ý: hàng trên đặt tooltip phía dưới ô, hoặc nới khoảng tiêu đề. Chỉ là thẩm mỹ. **Đã sửa 2026-10-10:** tooltip nằm trong khe giữa hai hàng — hàng trên hiện BÊN DƯỚI ô, hàng dưới hiện BÊN TRÊN ô → không đè tiêu đề "Gùi", chú thích góc phải hay dòng hướng dẫn chân cửa sổ (chữ 22 px). `debugState.hud.tooltipCenter` cho QA kiểm; ảnh `web/e2e/screenshots/t003-bag-tooltip-top.png`. | Nhẹ | Đã sửa |
| BUG-012 | (T-004) **Ăn liền tay vài củ khoai (chuột phải nhanh) thì các chữ "+8 Sức" chồng khít lên nhau, nhìn như chỉ có một "+8 Sức"** dù Sức đã tăng +24. Chữ bay nào cũng bắt đầu đúng một chỗ (`spawnFloat`: cạnh ngực {ten}) và bay cùng quỹ đạo, nên các lần ăn cách nhau < ~0.3 s lệch nhau chỉ 2–5 px. Cũng gặp khi ăn khoai lúc Sức gần đầy ("+3 Sức" đè "+8 Sức"). **Tái hiện:** chọn ô có khoai, Sức 20, bấm chuột phải 3 lần thật nhanh → Sức 44 nhưng chỉ thấy một chữ "+8 Sức"; `node web/e2e/diag-t004-stack.mjs` (in 3 chữ đang bay ở y 889/892/894), ảnh `web/e2e/screenshots/qa-t004-eat-stack.png`. Gợi ý: lệch dần chữ mới (vd chữ trước còn sống thì đặt chữ mới cao/thấp hơn ~0.4 ô), hoặc gộp thành một chữ cộng dồn ("+24 Sức") khi ăn liên tiếp trong ~0.5 s. Chỉ là thẩm mỹ / phản hồi. **Đã sửa (game-dev, 2026-10-11):** chữ bay cùng dấu còn mới (< `staminaFloatMergeSeconds` 0.5 s) thì GỘP thành một số cộng dồn ("+8" → "+16" → "+24 Sức"), chữ đó nảy lại và bay tiếp từ chỗ đang đứng; chữ khác dấu ("−20 Sức" + "+8 Sức") thì chữ mới đặt cao hơn `staminaFloatStackOffset` 0.45 ô. Debug thêm `stamina.floatsActiveY`. E2E `stamina.spec.ts` ca "BUG-012" (ảnh `t004-eat-merged.png`, `t004-float-stacked.png`); `qa-t004` Q5/Q6 chỉnh theo hành vi gộp. | Nhẹ | Đã sửa |
| BUG-013 | (T-002/T-004, thấy khi QA T-005 chạy cả bộ e2e) **Ô kế trong hàng chờ cuốc chỉ được bổ 1 nhát rồi bị bỏ lại dở (1/6), {ten} chuyển luôn sang ô sau.** Khi nhát CUỐI của ô trước chạm và ô kế bắt đầu trong CÙNG một bước (`stepTileAction` trả `impact` = ô cũ + `started` = ô mới), `impactTill` gặp `done` và chạy dòng "số nhát bị chỉnh nhỏ giữa chừng (QA)": `if (isBusy(this.action) && this.action.strikesLeft > 1) this.action.strikesLeft = 1;` — lúc đó `this.action` đã là ô MỚI nên ô mới bị ép còn 1 nhát. **Tái hiện:** `qa-t004.spec.ts` Q3 đỏ ngẫu nhiên (~1/4 lần, `--repeat-each 4`): hàng chờ 13,13 → 13,14 → 13,15, `strikeSeconds` 0.1 → kết quả `13,14: 1 nhát, untilled`, `13,15: tilled` (trace: `test-results/qa-t004-Q3-…-repeat3/trace.zip`). Chỉ xảy ra khi một frame dài hơn nửa nhát: Phaser kẹp `delta` ≤ 200 ms nên với thông số thật (0.85 s/nhát) gần như không gặp, nhưng sẽ gặp nếu T-009 chỉnh `tillStrikeSeconds` < 0.4 s, và làm test chập chờn. Gợi ý: chỉ ép `strikesLeft` khi ô vừa xong chính là `this.action.current` (so tọa độ), hoặc làm việc đó trong `stepTileAction`. **Đã sửa (game-dev, 2026-10-11):** hàm thuần `capStrikesIfCurrent(state, ô)` trong `systems/tileAction.ts` chỉ ép "còn 1 nhát" khi ô vừa bổ CHÍNH LÀ ô đang làm (so tọa độ); `impactTill` gọi hàm này thay dòng cũ → ô mới bắt đầu cùng bước giữ đủ số nhát. Unit test frame dài (0.1 s/nhát, bước 0.2 s) trong `tileAction.test.ts`; `qa-t004.spec.ts:371` (Q3) `--repeat-each 4` xanh 4/4. | Nhẹ | Đã sửa |
| BUG-014 | (Test, không phải game — cùng loại BUG-006) **Còn 2 ca e2e cũ đỏ ngẫu nhiên khi chạy cả bộ (chạy riêng thì xanh):** (1) `qa-t004` Q2 — sau khi chửi thề còn chụp ảnh + chờ hỏi trạng thái (nhịp hỏi mặc định giãn tới 1 s) nên tới lúc click ô 14,14 thì bong bóng chửi (2.5 s) đã hết → hiện "Đuối rồi…" (đúng luật) nhưng test đòi `grumble`; (2) `qa-t003` Q10b — gieo 0.4 s, điểm chạm 0.2 s: máy chậm thì hạt đã rơi trước khi kịp mở gùi (`farmJuice.plants` = 1). Gợi ý: Q2 click ngay sau khi xác nhận chửi (bỏ chụp ảnh ở giữa, hỏi `intervals: [50]`) hoặc đặt `grumbleBubbleSeconds` dài qua debug; Q10b kéo dài `actionDuration` qua hàm debug lúc kiểm (giống `debugSetTillTuning`). **Đã sửa (game-dev, 2026-10-11):** thêm hàm QA `debugSetTestTuning({ fastActionSeconds, grumbleSeconds })` trong GardenScene. Q2: kéo dài bong bóng chửi lên 30 s trước khi cuốc → lúc click ô 14,14 câu chửi chắc chắn còn, kiểm chặt `kind: 'grumble'`; ngoài ra lần chờ "≥ 4 nhát" hỏi mỗi 50 ms. Q10b: việc nhanh kéo dài 30 s (điểm chạm 15 s) qua hàm debug thay vì 4 s ghi thẳng vào biến riêng. | Nhẹ | Đã sửa |
| BUG-015 | (T-005) **Chữ phụ của cửa sổ Tạm dừng 22 px và gợi ý phím 20 px — dưới mức "chữ thân ≥ 24px ở 1080p" (GDD §11).** "Đồng hồ ngày đang đứng yên", "Esc: chơi tiếp" (22 px) và cả khối gợi ý góc dưới phải (20 px) ở cửa sổ 1366×768 chỉ còn ~14–15 px, đọc được nhưng nhỏ. **Tái hiện:** ảnh `web/e2e/screenshots/qa-t005-pause-1366.png`, `qa-t005-hud-1366.png`; `qa-t005.spec.ts` Q11 in cỡ chữ. Gợi ý: nâng lên 24 px (gợi ý phím có thể bỏ dòng phím thử ở bản build cho đỡ chật). Thẩm mỹ / dễ đọc. **Đã sửa (game-dev, 2026-10-11):** chữ phụ cửa sổ Tạm dừng ("Đồng hồ ngày đang đứng yên", "Esc: chơi tiếp") và cả khối gợi ý phím nâng lên 24 px; dòng gợi ý chính vẫn nằm trên nút gùi, các dòng ngắn ở khe bên phải nút gùi — e2e `time.spec.ts` (bố cục 1920×1080 + 1366×768) kiểm không đè đồng hồ / thanh Sức / hotbar / nút gùi. | Nhẹ | Đã sửa |

## Changelog

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
