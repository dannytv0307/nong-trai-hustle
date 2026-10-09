# Hành trình làm game

> Bạn chỉ cần gõ **`/next`** — Claude sẽ làm bước đang tới, hỏi bạn những gì cần quyết định, rồi đánh dấu xong.
> Gõ `/map` để xem bản đồ này kèm tiến độ.

**Đang ở: 3.2**

Ký hiệu: 👤 việc của bạn · 🤖 agent phụ trách · ✅ điều kiện để coi là xong

---

## Chặng 1 — Ý tưởng 💡 *(game của bạn là gì?)*

- [x] **1.1 Kể ý tưởng của bạn**
  Tại sao: ý tưởng rõ ràng giúp mọi bước sau không bị lạc hướng.
  👤 Kể ý tưởng (vài câu là đủ), chọn 1 trong 2–3 phương án được đề xuất.
  🤖 `game-planner` biến ý tưởng thành 2–3 phương án concept (cách chơi, điểm hay, độ khó làm).
  ✅ GDD §1–2 có logline, 3 pillars, core loop; quyết định ghi vào `docs/decisions.md`.

- [x] **1.2 Thiết kế cách chơi**
  Tại sao: biết chính xác người chơi bấm gì, làm gì, thắng/thua thế nào trước khi viết code.
  👤 Trả lời vài câu lựa chọn (điều khiển, độ khó, tính điểm), duyệt bản tóm tắt.
  🤖 `game-planner` viết cơ chế + bảng thông số, điều khiển, luồng màn hình, danh sách tính năng bản đầu (Must) và "Để sau".
  ✅ GDD §3–8, §11, §14 đã điền.

- [x] **1.3 Thế giới & nhân vật**
  Tại sao: nhân vật và câu chuyện cho game "hồn" và là đầu vào để gen hình ảnh, âm thanh.
  👤 Chọn tông giọng, duyệt nhân vật.
  🤖 `game-planner` viết story bible (kèm mô tả bàn giao cho Art/Audio).
  ✅ `docs/design/story-bible.md` có logline, nhân vật chính, cách kể chuyện.

## Chặng 2 — Phong cách 🎨 *(game trông và nghe thế nào?)*

- [x] **2.1 Chọn hướng hình ảnh**
  Tại sao: chọn bằng mắt dễ hơn mô tả bằng lời; khóa style sớm để mọi asset sau thống nhất.
  👤 Xem ảnh so sánh, chọn hướng thích nhất (hoặc kết hợp).
  🤖 `art-director` đề xuất 3 hướng style, gen thử mỗi hướng (nhân vật chính + 1 vật thể + nền) bằng Vertex AI.
  ✅ Art Bible ghi hướng đã chọn (keywords, STYLE_PREFIX, bảng màu).

- [x] **2.2 Khóa style & thiết kế nhân vật chính**
  Tại sao: có "ảnh mẫu chuẩn" làm tham chiếu thì AI gen asset sau mới giống nhau.
  👤 Duyệt nhân vật chính và các ảnh style test.
  🤖 `art-director` gen bộ style test + nhân vật chính, tự review theo checklist, chọn ảnh mẫu vào `art-source/reference/`.
  ✅ Art Bible trạng thái **đã khóa**, có ảnh style anchor + character token.

- [x] **2.3 Chọn âm thanh**
  Tại sao: âm thanh chiếm một nửa cảm giác chơi; chọn sớm để hợp với hình ảnh.
  👤 Nghe 2–3 đoạn nhạc thử và bộ SFX mẫu, chọn cái thích.
  🤖 `audio-director` gen nhạc thử bằng Lyria (Vertex AI) + SFX mẫu bằng `tools/gen_sfx.py`.
  ✅ Audio Bible trạng thái **đã khóa**.

## Chặng 3 — Prototype 🧪 *(chơi có vui không?)*

- [x] **3.1 Dựng project web**
  Tại sao: dựng "xưởng" để làm game; Claude tự chạy và mở game trong trình duyệt để kiểm tra.
  👤 Không cần làm gì ngoài xác nhận khi được hỏi cài thư viện.
  🤖 `game-dev` tạo `web/client` (Phaser 3 + TypeScript + Vite, màn 1920×1080, cấu trúc thư mục, `gameConfig.ts`, Playwright chụp màn hình); `backend-dev` tạo khung `web/server` (Fastify + Prisma + Postgres trong Docker, `/healthz`) và `web/shared`; chuyển các asset đã Approved đang nằm tạm ở `art-source/raw/` (bị gitignore) vào `web/client/public/assets/art/`; `git init` làm điểm lưu.
  ✅ `npm run dev` mở được trang game có scene trống; server trả `/healthz`; test chạy xanh.

- [ ] **3.2 Lên kế hoạch prototype**
  Tại sao: chia nhỏ để mỗi buổi làm xong một phần chạy được.
  👤 Cho biết mỗi tuần làm được bao nhiêu giờ, duyệt danh sách task.
  🤖 `game-planner` tách core loop (đi lại, cuốc–gieo–tưới–hái, Sức, đồng hồ ngày, bán đồ, ngủ) thành task nhỏ vào `docs/tasks.md`.
  ✅ `docs/tasks.md` có task cho chặng 3.

- [ ] **3.3 Làm prototype bằng hình khối** *(nhiều buổi — mỗi lần `/next` làm 1 task)*
  Tại sao: thử "độ vui" bằng hình vuông/tròn trước, chưa tốn công làm đẹp.
  👤 Mở trình duyệt thử sau mỗi task, nói cảm giác (nhanh quá? chậm quá?).
  🤖 `game-dev` làm task, `qa-tester` chạy Playwright, chụp màn hình, kiểm tra lỗi.
  ✅ Mọi task chặng 3 trong `docs/tasks.md` đã xong; chơi trọn một ngày trong game.

- [ ] **3.4 Tài khoản & lưu game**
  Tại sao: người chơi đăng nhập ở máy nào cũng chơi tiếp được.
  👤 Tạo OAuth client trên Google Cloud Console và app trên Facebook Developers (Claude hướng dẫn từng bước), điền vào `.env`.
  🤖 `backend-dev` làm đăng ký/đăng nhập email, Google, Facebook, phiên đăng nhập, API lưu/tải; `game-dev` làm màn đăng nhập + tự lưu; `qa-tester` thử toàn bộ luồng.
  ✅ Đăng ký → chơi → F5 → đăng nhập lại vẫn còn tiến độ; đăng nhập Google và Facebook chạy được ở local.

- [ ] **3.5 Cho người khác chơi thử**
  Tại sao: bạn quá quen game của mình; người lạ cho biết chỗ khó hiểu thật sự.
  👤 Cho 2–3 người chơi trên máy bạn (hoặc qua link nội bộ), quan sát, kể lại cho Claude.
  🤖 `game-planner` ghi `docs/playtests.md`, đề xuất chỉnh sửa; bạn quyết định đi tiếp.
  ✅ Có kết quả playtest + quyết định trong `docs/decisions.md`.

## Chặng 4 — Làm game đầy đủ 🛠️

- [ ] **4.1 Kế hoạch sản xuất**
  🤖 `art-director` + `audio-director` lập danh sách asset đầy đủ (song song); `game-planner` thêm task các tính năng còn lại (khu mới, nhiệm vụ, mặc cả, gia đình, cài đặt…).
  ✅ Asset list + `docs/tasks.md` chặng 4 đầy đủ.

- [ ] **4.2 Hình ảnh thật** *(nhiều buổi)*
  👤 Duyệt ảnh so sánh của từng lô.
  🤖 `art-director` gen → review → hậu kỳ → đưa vào `web/client/public/assets/art/`; `game-dev` thay hình khối bằng sprite/tileset.
  ✅ Mọi asset hình ảnh Must ở trạng thái Approved.

- [ ] **4.3 Âm thanh thật**
  👤 Nghe duyệt.
  🤖 `audio-director` gen nhạc/SFX → hậu kỳ → `web/client/public/assets/audio/`; `game-dev` gắn vào game + chỉnh âm lượng Nhạc/Hiệu ứng.
  ✅ Mọi asset âm thanh Must ở trạng thái Approved.

- [ ] **4.4 Các tính năng còn lại** *(nhiều buổi)*
  🤖 `game-dev` (và `backend-dev` khi cần API) làm từng task, `qa-tester` kiểm tra.
  ✅ Mọi task chặng 4 xong; chơi từ đăng nhập → ngày 1 → cưới vợ trơn tru.

- [ ] **4.5 Game feel (độ "đã tay")**
  Tại sao: hiệu ứng nhỏ (rung màn, nảy, hạt, âm thanh) làm game sống động hẳn.
  🤖 `game-dev` thêm juice theo bảng GDD §8.
  ✅ Mỗi hành động chính có phản hồi hình ảnh + âm thanh.

## Chặng 5 — Hoàn thiện & phát hành 🚀

- [ ] **5.1 Playtest vòng 2 & cân bằng độ khó**
- [ ] **5.2 Kiểm tra kỹ** — FPS, nhiều trình duyệt/độ phân giải, thời gian tải trang, lưu/tải, bảo mật tài khoản (`qa-tester` + `game-dev` + `backend-dev`)
- [ ] **5.3 Chuẩn bị ra mắt** — `art-director` gen logo, ảnh giới thiệu, favicon; `backend-dev` trang chính sách quyền riêng tư + xóa dữ liệu (bắt buộc cho đăng nhập Google/Facebook), chuyển OAuth sang chế độ công khai
- [ ] **5.4 Đưa lên mạng** — `backend-dev` triển khai lên GCP (Cloud Run + Cloud SQL, hỏi bạn trước vì tốn phí), gắn tên miền (nếu có); gửi link cho bạn bè
- [ ] **5.5 Nhìn lại** — ghi bài học; cân nhắc bản điện thoại / itch.io
