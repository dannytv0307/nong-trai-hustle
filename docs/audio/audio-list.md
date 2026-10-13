# Danh sách asset âm thanh

> Chủ sở hữu: `audio-director` · Trạng thái: Planned → Prompted → Generated → Processed → In-game → Approved
> **Vị trí file:** bản gốc `audio-source/raw/<ID>/final.wav` (gitignore). Từ **bước 3.1** file game nằm ở `web/client/public/assets/audio/<music|sfx>/<tên file game>.wav` (cột "File game", tên đã copy đúng như bảng). `npm run audio:convert` (tự chạy trước `npm run dev` / `npm run build`) sinh `.ogg` + `.mp3` cùng tên bên cạnh; game tải OGG (MP3 cho Safari); WAV bị bỏ khỏi `dist/`. Nếu mất `raw/` thì tái tạo được: nhạc từ log seed trong prompt card, SFX bằng `gen_folk_sfx.py --seed 1`.
> "Approved" ở bước 2.3: người dùng đã nghe nhạc Vườn V1; 8 SFX do đội chọn theo ủy quyền của người dùng ("phù hợp với concept").

## Đã có

| ID | Tên | Loại | Sự kiện kích hoạt | Độ dài | Loop | Biến thể | File tạm → File game | Ưu tiên | Trạng thái | Prompt card |
|---|---|---|---|---|---|---|---|---|---|---|
| AUD-MUS-001 | Nhạc Vườn (ngày) | MUS | Ở khu Xóm (Vườn + Nhà) ban ngày | 30.77 s | có | 1 | `raw/AUD-MUS-001/final.wav` → `music/vuon-loop.wav` | Must | Approved | [AUD-MUS-001](prompts/AUD-MUS-001.md) |
| AUD-SFX-001 | Lên level (tươi) | SFX | Lên level; dùng lại cao hơn 1 nấc khi lên bậc ngoại hình | 1.66 s | không | 1 | `raw/AUD-SFX-001/final.wav` → `sfx/len-level.wav` | Must | Approved | [AUD-SFX-FOLK](prompts/AUD-SFX-FOLK.md) |
| AUD-SFX-002 | Nhặt xu "leng keng" | SFX | Nhận tiền | 0.83 / 0.89 s | không | 2 | `raw/AUD-SFX-002/final(-2).wav` → `sfx/nhat-xu-1/2.wav` | Must | Approved | AUD-SFX-FOLK |
| AUD-SFX-003 | Cuốc đất — bản 2 "phập" lưỡi sắt xắn đất ẩm + đất vụn (thay "bộp") | SFX | Cuốc đất (khung chạm) | 0.36 / 0.38 s | không | 2 | `raw/AUD-SFX-003-v2/moi-cuoc-dat-1/2.wav` → `sfx/cuoc-dat-1/2.wav` (chưa ghi đè; game vẫn dùng bản "bộp" cũ) | Must | Approved (người dùng chọn 1 + 2, 2026-10-10) — In-game | [AUD-SFX-003](prompts/AUD-SFX-003.md) |
| AUD-SFX-004 | Tưới nước | SFX | Tưới | 0.60 s | không | 2 | `raw/AUD-SFX-004/final(-2).wav` → `sfx/tuoi-nuoc-1/2.wav` | Must | Approved | AUD-SFX-FOLK |
| AUD-SFX-005 | Bố vợ nhăn (mõ + đàn bầu) | SFX | Mặc cả: mặt nhăn | 1.23 s | không | 1 | `raw/AUD-SFX-005/final.wav` → `sfx/bo-vo-nhan.wav` | Must | Approved | AUD-SFX-FOLK |
| AUD-SFX-006 | Meme zoom "tùng–tùng–TÙNG" | SFX | `dramaticZoom` | 2.35 s | không | 1 | `raw/AUD-SFX-006/final.wav` → `sfx/meme-zoom-trong.wav` | Must | Approved | AUD-SFX-FOLK |
| AUD-SFX-007 | Meme "ối dồi ôi" (chũm chọe + chiêng) | SFX | `oiDoiOi` | 2.62 s | không | 1 | `raw/AUD-SFX-007/final.wav` → `sfx/meme-oi-doi-oi.wav` | Must | Approved | AUD-SFX-FOLK |
| AUD-SFX-008 | Càu nhàu "ú ớ" (+ "hừm") | SFX (giọng) | Bong bóng chửi thề | 0.48 / 0.47 s | không | 2 | `raw/AUD-SFX-008/final(-2).wav` → `sfx/voice-cau-nhau-1/2.wav` | Must | Approved | AUD-SFX-FOLK |
| AUD-SFX-101 | Gieo hạt "lách tách" + tay vùi đất | SFX | Gieo hạt (việc nhanh 0.4 s, lặp khi rê luống) | 0.26 / 0.28 s | không | 2 | `raw/T-003-sfx/gieo-hat-1/2.wav` → `sfx/gieo-hat-1/2.wav` (key `sfx-gieo-hat-1/2`) | Must | Approved / In-game (T-003: chọn ngẫu nhiên 1/2, lệch cao độ ±70 cent ≈ ±4%) | [AUD-SFX-101](prompts/AUD-SFX-101.md) |
| AUD-SFX-102 | Hái cây "pop" (rễ bật + đất rơi), nốt gốc C5 để game detune cao dần | SFX | Hái cây | 0.34 / 0.35 s | không | 2 | `raw/T-003-sfx/hai-cay-1/2.wav` → `sfx/hai-cay-1/2.wav` (key `sfx-hai-cay-1/2`) | Must | Approved / In-game (T-003: chọn ngẫu nhiên 1/2, không random cao độ; hái liên tiếp detune 0/+200/+400/+700/+900/+1200 cent, giữ nấc cao nhất, ngừng 1.2 s về nấc đầu — `harvestPitchLadderCents`, `harvestPitchResetSeconds`) | [AUD-SFX-102](prompts/AUD-SFX-102.md) |

> Lô của các mục đã có: Lô 1 — AUD-MUS-001, AUD-SFX-001…004, 008, 101, 102 (đang chạy trong prototype); Lô 3 — AUD-SFX-005 (bố vợ nhăn), 006, 007 (2 meme Must đã xong).

## Kế hoạch sản xuất chặng 4 (bước 4.1, 2026-10-13)

> Nguồn: GDD §3 (cơ chế), §3.15 (15 meme), §3.16 (Xóm, dân làng), §5 (khu), §7 (nhiệm vụ, tổng kết), §8 (juice), §11 (UI); story bible "Handoff cho Audio" từng nhân vật; D-021, D-027 (bỏ Suối, câu cá ở hồ làng).
> **Lô** (tiêu đề từng bảng) khớp lô hình: **Lô 1 Vườn** (một ngày ở nhà: làm ruộng, ăn, ngủ, thời tiết, tổng kết) → **Lô 2 Xóm + NPC** (cửa hàng, dân làng, bậc ngoại hình 2, nền làng) → **Lô 3 khu khác + mặc cả + meme** (Núi, câu cá ở hồ làng, nỏ, làng Sung, mặc cả, cưới, gia đình, meme) → **Lô 4 UI / hoàn thiện** (âm giao diện, Menu, cân mix lần cuối). Mini-game câu cá xếp vào Lô 3 dù hồ nằm trong Xóm, vì mở ở Lv 4 và đi cùng phần mini-game.
> **Cách làm**: `folk` = `tools/gen_folk_sfx.py` thêm công thức mới (miễn phí, tái tạo bằng `--seed`); `sfx` = `tools/gen_sfx.py` preset (UI); `Lyria` = `tools/gen_music.py` theo prefix + negative của audio bible (1 vòng = 2 clip = 0,16 USD; tối đa 3 vòng = 0,48 USD); `dùng lại` = file đã có, đổi cao độ/âm lượng trong game.
> Dấu **(r)** = tổng hợp có rủi ro nghe "điện tử" (sáo, nhị, đàn bầu, giọng người, tiếng gà/mèo — audio bible §10); nếu người dùng chê thì thử Lyria (chỉ với âm có giai điệu) hoặc chấp nhận bản gần nhất.
> Mức âm (audio bible §7–8): SFX gameplay/meme peak −1, giọng peak −6, UI peak −4…−6, nhạc RMS −18, nền (AMB) RMS khoảng −30 để nằm dưới nhạc.
> **Người dùng đã duyệt kế hoạch (2026-10-14)**: Xóm có nhạc ngày bản B luân phiên (AUD-MUS-008 lên Must); **mỗi NPC một bộ giọng lẩm bẩm tổng hợp riêng** (AUD-VOX-001…016, không gộp giọng chung); trần âm thanh chặng 4 **12 USD**; có cảnh trong nhà riêng → thêm AUD-SFX-115, AUD-AMB-011.
> Âm phát thường xuyên có 2 biến thể + random pitch ±4% trong game (cột "Biến thể").

### Lô 1 — Vườn (dùng được ngay trên prototype)

| ID | Tên | Loại | Dùng ở đâu | Độ dài · loop | Biến thể | Cách làm | Ưu tiên | Chi phí (USD) | Trạng thái |
|---|---|---|---|---|---|---|---|---|---|
| AUD-MUS-005 | Nhạc đêm / trong nhà (mood phụ: Đô trưởng 88–96 BPM, ukulele gảy thưa, marimba mềm, sáo trúc thong thả) | MUS | Xóm 19h–6h (chuyển mờ từ nhạc ngày lúc 19h), màn đi ngủ, **cảnh trong nhà** (cả ban ngày, nhỏ hơn) | ~30 s · loop | 1 | Lyria | Must | 0,16–0,48 | Planned |
| AUD-JNG-003 | Ngày mới / tổng kết ngày (jingle ấm, ngắn, có kết) | JNG | Mở màn tổng kết ngày (§7); nhạc nền nhỏ lại khi phát | 3–6 s · không | 1 | Lyria (cắt + fade) | Must | 0,16–0,48 | Planned |
| AUD-JNG-006 | "Mùa mưa tới rồi!" / "Mùa nắng tới rồi!" | JNG | Băng chữ ngày đầu mùa (§3.1) | 2–4 s · không | 1 | Lyria (cắt) | Should | 0,16–0,48 | Planned |
| AUD-JNG-002 | Xong nhiệm vụ: con dấu "cộp" + chiêng "bùng" + marimba 3 nốt đi lên | JNG | Con dấu đỏ "XONG" (§8), từ nhiệm vụ 1 "Ruộng đầu tay" | 1,5–2 s · không | 1 | folk (chiêng + gỗ đã có) — đổi từ Lyria sang tổng hợp | Must | 0 | Planned |
| AUD-SFX-103 | Cuốc nhát chốt (xong ô): "phập" đầy + đất vỡ tung | SFX | Nhát cuối mỗi ô (§3.3a) — **thay bản mượn** | 0,5 s | 2 | folk (`hoe_finish`, phát triển từ `hoe_soil`) | Must | 0 | Planned |
| AUD-SFX-104 | Cây héo "phù" + dọn cây héo (lá khô sột soạt) | SFX | Click dọn ô héo; sáng thấy ô héo (§8) | 0,5 s | 2 | folk | Must | 0 | Planned |
| AUD-SFX-105 | Ăn "nhồm nhoàm" | SFX | Chuột phải ăn (§3.2) | 0,6–0,8 s | 2 | folk (giọng formant + nhai) (r) | Must | 0 | Planned |
| AUD-SFX-106 | Bụng réo "ọc ọc" | SFX | Vừa hết Sức → "đuối" (§8) | 0,8–1,2 s | 1 | folk | Must | 0 | Planned |
| AUD-SFX-107 | Ngáp dài | SFX (giọng) | 23h, đồng hồ nhấp nháy (§8) | 1–1,5 s | 1 | folk (r), peak −6 | Must | 0 | Planned |
| AUD-SFX-108 | Ngáy "khò… khò…" | SFX (giọng) | Ngủ gục 24h, ngủ giường; ông Khướt dùng lại (Lô 2) | 2–3 s · lặp được | 1 | folk (r), peak −6 | Must | 0 | Planned |
| AUD-SFX-109 | Gà gáy 6h sáng | SFX | Trời hửng mỗi sáng (§8) | 1,5–2 s | 1 | folk (r) — nếu quá "điện tử" thì thay bằng gà "cục tác" + chim sáng | Must | 0 | Planned |
| AUD-SFX-110 | Nấu ở bếp: lửa rơm lách tách + xèo | SFX | Click nấu món (§3.2) | 1,5 s | 1 | folk | Must | 0 | Planned |
| AUD-SFX-118 | Đếm tiền "tách tách" (xu chạm nhẹ / bàn tính) | SFX | Số tiền đếm lên ở tổng kết ngày (§8) — **thay bản mượn** | 60–90 ms | 2 | folk | Must | 0 | Planned |
| AUD-AMB-001 | Mưa rơi trên lá + mái rạ | AMB | Cả ngày mưa (§3.1, §8), nằm dưới nhạc | 15–20 s · loop (stereo) | 1 | folk (nhiễu lọc) | Must | 0 | Planned |
| AUD-SFX-121 | Sấm xa ì ầm | SFX | Ngẫu nhiên trong ngày mưa, lúc trời đổ mưa | 2–3 s | 2 | folk | Must | 0 | Planned |
| AUD-SFX-111 | Bước chân trên đất / cỏ | SFX | Khi đi (nhỏ) và khi qua cổng (§8) | 0,1–0,15 s | 3 mỗi nền (6 file) | folk | Should (riêng bản 1 nền chung khi qua cổng: Must) | 0 | Planned |
| AUD-SFX-112 | Đóng cọc rào "cộc cộc" | SFX | Mua thêm 3 ô ruộng (§3.4) | 0,8 s | 1 | folk | Should | 0 | Planned |
| AUD-SFX-115 | Bước qua cửa nhà {ten}: liếp tre / cửa gỗ cũ "kẹt" + bước chân đất nện | SFX | Vào / ra cảnh trong nhà (chuyển cảnh qua cửa) | 0,5–0,7 s | 2 (vào / ra) | folk | Must | 0 | Planned |
| AUD-AMB-011 | Nền trong nhà: bếp rơm lách tách khẽ, gió lùa vách, (đêm) dế ngoài sân vọng vào | AMB | Cảnh trong nhà, dưới AUD-MUS-005 | 10–15 s · loop | 1 | folk | Should | 0 | Planned |
| AUD-SFX-113 | Bỏ đồ vào / lấy ra thùng bán "bịch" | SFX | Cửa sổ thùng bán (§3.9) | 0,15 s | 2 | folk | Should | 0 | Planned |

### Lô 2 — Xóm làng + NPC

| ID | Tên | Loại | Dùng ở đâu | Độ dài · loop | Biến thể | Cách làm | Ưu tiên | Chi phí (USD) | Trạng thái |
|---|---|---|---|---|---|---|---|---|---|
| AUD-MUS-008 | Nhạc Xóm ngày bản B (cùng palette, Đô trưởng 116–124 BPM, màu Việt đổi sang sáo trúc) | MUS | Phát luân phiên với AUD-MUS-001 ở Xóm ban ngày cho đỡ nhàm (người dùng chọn 2026-10-14) | ~30 s · loop | 1 | Lyria | Must | 0,16–0,48 | Planned |
| AUD-SFX-201 | Chế đồ / sửa xong: búa "keng keng" + "ting" | SFX | Lò rèn, xưởng mộc, bếp (§3.8) | 1 s | 1 | folk | Must | 0 | Planned |
| AUD-SFX-203 | Nông cụ cùn "cạch" lệch tông | SFX | Độ bền về 0 (§3.8, §8) | 0,4 s | 1 | folk | Must | 0 | Planned |
| AUD-SFX-204 | "Lột xác": vải "phạch" + khói "phụt" | SFX | Lên bậc ngoại hình (§3.14, §8); đi cùng AUD-SFX-001 cao 1 nấc + AUD-VOX-011 | 0,6 s | 1 | folk | Must | 0 | Planned |
| AUD-SFX-202 | Trả tiền: xu rơi xuống quầy | SFX | Mua ở quầy hạt / lò rèn / xưởng mộc / sạp bà Cân — **thay bản mượn** "nhặt xu" (nhặt xu giữ cho lúc *nhận* tiền) | 0,4 s | 2 | folk | Should | 0 | Planned |
| AUD-SFX-205 | Cửa gỗ cót két / then cài "cạch cạch" | SFX | Cửa nhà ông Khướt (câu đùa bà Khướt), cổng ngõ nhà {ten} (cửa nhà {ten}: AUD-SFX-115, Lô 1) | 0,6–0,8 s | 2 | folk | Should | 0 | Planned |
| AUD-SFX-114 | Bước chân trên gạch / ván tre | SFX | Sân đình, bến câu, làng Sung | 0,1–0,15 s | 3 mỗi nền (6 file) | folk | Should | 0 | Planned |
| AUD-VOX-001 | U Hến: lẩm bẩm trầm, chậm, cụt + "chậc" | VOX | Mở thoại / bong bóng | ≤ 0,6 s | 2 | folk (formant) (r) | Must | 0 | Planned |
| AUD-VOX-002 | Ông Gật: "ừ ừ" trầm, run | VOX | như trên | ≤ 0,6 s | 2 | folk (r) | Must | 0 | Planned |
| AUD-VOX-003 | Cô Tám Thóc: líu lo trung cao, rất nhanh | VOX | như trên | ≤ 0,6 s | 2 | folk (r) | Must | 0 | Planned |
| AUD-VOX-004 | Ông Hai Bễ: lẩm bẩm rất trầm, to (hét) | VOX | như trên | ≤ 0,6 s | 2 | folk (r) | Must | 0 | Planned |
| AUD-VOX-005 | Chú Đục: lẩm bẩm trung, kéo dài + thở dài "hàaa…" | VOX | như trên | ≤ 0,8 s | 2 | folk (r) | Must | 0 | Planned |
| AUD-VOX-006 | Bà Chém: líu lo trầm khàn + cười "hà hà" | VOX | Bong bóng dân làng (§3.16) | ≤ 0,6 s | 2 | folk (r) | Must | 0 | Planned |
| AUD-VOX-007 | Ông Khướt: lẩm bẩm nhòe + nấc "hức" (ngáy dùng AUD-SFX-108 hạ cao độ) | VOX | Bong bóng; gốc đa | ≤ 0,8 s | 2 | folk (r) | Must | 0 | Planned |
| AUD-VOX-008 | Cô Ngóng: thì thầm "ư ứ?" + cười "hí hí" | VOX | Bong bóng; sau rào | ≤ 0,6 s | 2 | folk (r) | Must | 0 | Planned |
| AUD-VOX-009 | Anh Tráng: "hây-a!", "hự!" + đòn gánh "vút" | VOX | Bong bóng; tập võ ở sân đình (thỉnh thoảng) | ≤ 0,6 s | 2 | folk (r) | Must | 0 | Planned |
| AUD-VOX-010 | Trẻ trâu: cười khanh khách (+ Should: huýt 4 nốt đồng dao khi đi ngang) | VOX | Bong bóng; quanh giếng, bến nước | ≤ 0,8 s | 2 (+1 huýt) | folk (r) | Must (huýt: Should) | 0 | Planned |
| AUD-VOX-011 | {ten} "hế hế!" khoe | VOX | Bong bóng khoe vàng (story bible §6.4), lột xác | ≤ 0,6 s | 2 | folk (r) | Must | 0 | Planned |
| AUD-VOX-012 | Bà Ba Trầu: líu lo cao, nhanh + nhai trầu "chóp chép" | VOX | Thoại (sau nhiệm vụ 5, 9) | ≤ 0,6 s | 2 | folk (r) | Must | 0 | Planned |
| AUD-VOX-020 | Gà Mái Mơ: "cục tác" hớn hở / "quác" bị đuổi (dùng chung cho gà nhà sau cưới) | VOX | Gà mổ rau (sự kiện Should), ông Gật ôm gà, chuồng gà | 0,5 s | 2 | folk (r) | Should | 0 | Planned |
| AUD-VOX-013 | Ông Mõ: mõ "cốc cốc" + giọng rao kéo dài | VOX | Rao ngày đầu mùa | 1,5 s | 1 | folk (mõ có sẵn) | Could | 0 | Planned |
| AUD-AMB-002 | Nền Xóm ngày: chim sẻ, lá tre xào xạc, gà xa | AMB | Xóm 6h–19h, dưới nhạc | 15–20 s · loop | 1 | folk | Should | 0 | Planned |
| AUD-AMB-003 | Lò rèn: búa "keng" đều + lửa bễ phì phò | AMB | Theo khoảng cách tới lò rèn (6h–19h) | 4–8 s · loop | 1 | folk | Should | 0 | Planned |
| AUD-AMB-004 | Xưởng mộc: cưa xoẹt xoẹt + bào sột soạt | AMB | Theo khoảng cách tới xưởng mộc | 4–8 s · loop | 1 | folk | Should | 0 | Planned |
| AUD-AMB-005 | Mặt hồ: nước vỗ bờ, ếch, chim bói cá | AMB | Gần hồ làng / bến câu | 10–15 s · loop | 1 | folk | Should | 0 | Planned |
| AUD-AMB-006 | Đêm: dế + ếch | AMB | 19h–6h, dưới nhạc đêm | 10–15 s · loop | 1 | folk | Should | 0 | Planned |
| AUD-AMB-007 | Quán chè buổi tối: bát sành "cạch", rót nước, lao xao | AMB | Gần quán chè bà Chém 19–22h | 8–10 s · loop | 1 | folk (r) | Could | 0 | Planned |
| AUD-AMB-008 | Giếng: kéo gàu, nước đổ | SFX | Click giếng / NPC gánh nước | 1 s | 1 | folk | Could | 0 | Planned |

### Lô 3 — Núi, câu cá, nỏ, làng Sung, mặc cả, cưới, gia đình, meme

| ID | Tên | Loại | Dùng ở đâu | Độ dài · loop | Biến thể | Cách làm | Ưu tiên | Chi phí (USD) | Trạng thái |
|---|---|---|---|---|---|---|---|---|---|
| AUD-MUS-002 | Nhạc Núi (Sol trưởng 112–118 BPM, ukulele + marimba + whistle, màu Việt: sáo trúc) | MUS | Khu Núi sau nhà (ban ngày; đêm dùng AUD-MUS-005) | ~30 s · loop | 1 | Lyria | Must | 0,16–0,48 | Planned |
| AUD-MUS-003 | Nhạc chợ làng Sung (Fa trưởng 124–128 BPM, nhộn nhịp, màu Việt: mõ) | MUS | Khu làng Sung | ~30 s · loop | 1 | Lyria | Must | 0,16–0,48 | Planned |
| AUD-MUS-004 | ~~Nhạc Suối~~ | — | **Bỏ (D-027)** — hồ làng dùng nhạc Xóm + AUD-AMB-005 | — | — | — | — | 0 | Bỏ |
| AUD-MUS-007 | Nhạc mặc cả nhà bố vợ (căng mà hài, 90–100 BPM, thưa, màu Việt: đàn bầu) | MUS | Màn mặc cả (§3.10) | ~30 s · loop | 1 | Lyria (mood phụ, bỏ `slow` khỏi negative) | Should | 0,16–0,48 | Planned |
| AUD-JNG-001 | Bắt được cá (vui, nảy, glockenspiel) | JNG | Cá bay lên đầu (§8) | 2–3 s · không | 1 | Lyria (cắt) | Must | 0,16–0,48 | Planned |
| AUD-JNG-004 | Cảnh cưới: kèn trống rộn ràng, màu Việt: đàn tranh (motif cô Bưởi) | JNG | 3 khung cảnh cưới (story bible §5.3) | 20–30 s · có kết | 1 | Lyria | Must | 0,16–0,48 | Planned |
| AUD-SFX-301 | Chặt củi "cốc" chắc / chặt tre "cắc" rỗng | SFX | Chặt cây khô, bụi tre (§3.5) | 0,4 s | 2 + 2 | folk | Must | 0 | Planned |
| AUD-SFX-303 | Hái nấm / măng / sim "pụp" | SFX | Hái lượm (§8) | 0,25 s | 2 | folk (biến từ `harvest_pop`) | Must | 0 | Planned |
| AUD-SFX-302 | Cây / bụi hết nhát: "rắc… ào" đổ | SFX | Nhát cuối `chopsPerNode` | 1 s | 1 | folk | Should | 0 | Planned |
| AUD-SFX-304 | Bụi rung có gà rừng (lá xào + "cục" khẽ) | SFX | Bụi có gà (§3.7), phát khi lại gần | 1 s | 1 | folk | Should | 0 | Planned |
| AUD-AMB-009 | Nền Núi: gió rừng + chim rừng + suối xa | AMB | Khu Núi | 15–20 s · loop | 1 | folk | Should | 0 | Planned |
| AUD-SFX-311 | Quăng câu "vút" + "tõm" nhẹ | SFX | Quăng câu (§3.6) | 0,8 s | 2 | folk | Must | 0 | Planned |
| AUD-SFX-312 | Phao giật "tõm" mạnh | SFX | Cá cắn, dấu "!" (§8) | 0,5 s | 1 | folk | Must | 0 | Planned |
| AUD-SFX-313 | Cuộn dây "rè rè" đều | SFX | Lúc giữ chuột kéo cá | 0,5–1 s · loop | 1 | folk | Must | 0 | Planned |
| AUD-SFX-314 | Cá sổng "phựt" (dây đứt + nước bắn) | SFX | Thanh bắt được về 0 | 0,5 s | 1 | folk | Must | 0 | Planned |
| AUD-SFX-315 | Dép tổ ong "bẹp" | SFX | Câu được dép, dép úp mặt | 0,3 s | 1 | folk | Must | 0 | Planned |
| AUD-SFX-316 | Cá quẫy nước | SFX | Lớp phụ khi đang kéo | 0,4 s | 2 | folk | Should | 0 | Planned |
| AUD-SFX-321 | Bắn nỏ: dây "phựt" | SFX | Click bắn (§3.7) | 0,3 s | 2 | folk | Must | 0 | Planned |
| AUD-SFX-322 | Nỏ trúng "phập" | SFX | Trúng gà (chậm hình) | 0,3 s | 1 | folk | Must | 0 | Planned |
| AUD-SFX-323 | Nỏ trượt: tên cắm đất "phịch" | SFX | Trượt | 0,3 s | 1 | folk | Must | 0 | Planned |
| AUD-VOX-021 | Gà rừng "cục tác" hoảng + đập cánh bay | VOX | Trúng / trượt / hết tên gà bay mất | 0,6 s | 2 | folk (r) — có thể dùng lại AUD-VOX-020 cao độ khác | Must | 0 | Planned |
| AUD-AMB-010 | Ồn chợ: gà kêu, xu, bước chân, lao xao xa (không thành lời) | AMB | Làng Sung, dưới nhạc | 15–20 s · loop | 1 | folk (r) | Should | 0 | Planned |
| AUD-VOX-014 | Bà Cân: lẩm bẩm trung, chắc, nhanh cụt | VOX | Thoại, sạp chợ | ≤ 0,6 s | 2 | folk (r) | Must | 0 | Planned |
| AUD-VOX-015 | Cô Bưởi: lẩm bẩm trung cao, gọn + "hứ" | VOX | Thoại, gặp lần đầu, sau cưới | ≤ 0,6 s | 2 | folk (r) | Must | 0 | Planned |
| AUD-VOX-016 | Cụ Bá Kẹo: "ừm / hừm!" rất trầm, chậm | VOX | Thoại; mặc cả mặt nhăn (đi cùng AUD-SFX-005) | ≤ 0,8 s | 2 | folk (r) | Must | 0 | Planned |
| AUD-SFX-341 | Quạt giấy "phạch phạch" | SFX | Mặc cả: mặt im lặng (§8) | 0,6 s | 1 | folk | Must | 0 | Planned |
| AUD-SFX-342 | Nhấp trà "xụp" | SFX | Mặc cả: mặt nhấp trà | 0,5 s | 1 | folk | Must | 0 | Planned |
| AUD-SFX-343 | Cười "khà khà" + trống | SFX | Mặc cả: chốt (mặt cười) | 1,5 s | 1 | folk (r ở phần giọng) | Must | 0 | Planned |
| AUD-SFX-344 | Mất 1 chén kiên nhẫn: chén trà úp "cạch" | SFX | Mỗi lượt / trả giá coi khinh | 0,3 s | 1 | folk | Should | 0 | Planned |
| AUD-SFX-345 | Đặt lễ vật lên mâm "cộp" | SFX | Nút "Thêm lễ vật" | 0,3 s | 1 | folk | Should | 0 | Planned |
| AUD-SFX-346 | Bị tiễn về: mõ + đàn bầu tụt dài | SFX | Hết lượt kiên nhẫn "Thôi, anh về đi" | 1,2 s | 1 | folk (biến từ `frown`) (r) | Should | 0 | Planned |
| AUD-SFX-351 | Pháo đỏ nổ lách tách | SFX | Cảnh cưới, liên tục dưới AUD-JNG-004 | 1,5–2 s · loop | 2 | folk | Must | 0 | Planned |
| AUD-SFX-352 | Ăn cháo "xì" buồn cười | SFX | Ngày ăn cháo (§3.11) | 0,6 s | 1 | folk | Must | 0 | Planned |
| AUD-SFX-353 | Nhặt trứng: "tách" nhẹ + "cục tác" | SFX | Click ổ trứng / chuồng | 0,6 s | 1 | folk (+ AUD-VOX-020) | Must | 0 | Planned |
| AUD-VOX-023 | Lợn "ụt ịt" + "eng éc" khi sổng / bị lùa | VOX | Chuồng, sự kiện lợn sổng (§3.11 #4) | 0,5 s | 2 | folk (r) | Must | 0 | Planned |
| AUD-VOX-025 | Con nhỏ cười "hì hì" khi được ôm | VOX | Click con nhỏ | 0,5 s | 1 | dùng lại AUD-VOX-010, nâng cao độ | Must | 0 | Planned |
| AUD-VOX-024 | Trâu "ọ…" dài lười | VOX | Chuồng, trâu cuốc hộ buổi sáng | 1,2 s | 1 | folk (r) | Should | 0 | Planned |
| AUD-SFX-354 | Tin vui có con | SFX | Thoại "tin vui" | — | — | dùng lại AUD-JNG-002 (bỏ con dấu) | Should | 0 | Planned |
| AUD-MEME-001 | Mèo Mướp "mi-ao" kéo lên giọng hỏi đểu (+ "prrr") + "đinh" khi phụ đề hiện | SFX | `smugCatSubtitle` | 1,2–1,8 s | 1 | folk (r) | Must | 0 | Planned |
| AUD-MEME-002 | Khóc thành suối: nhị rít "hu hu" 3 nhịp + nước phun "xè" | SFX | `cryRiver` | 2–3 s | 1 | folk (r); dự phòng Lyria nếu nhị nghe điện tử | Must | 0 (dự phòng 0,16–0,48) | Planned |
| AUD-MEME-003 | Mũi tên lãi: sáo chạy lên 5 nốt + leng keng xu | SFX | `profitArrow` chiều lên | 1,5–2 s | 1 | folk (r); dự phòng Lyria | Must | 0 (dự phòng 0,16–0,48) | Planned |
| AUD-MEME-004 | Mũi tên lỗ: cùng câu sáo chạy xuống, nốt cuối lạc | SFX | `profitArrow` chiều xuống | 1,5–2 s | 1 | folk (r); làm cùng MEME-003 | Must | 0 (chung dự phòng MEME-003) | Planned |
| AUD-MEME-005 | Còn cái nịt: đàn bầu luyến tụt 3 nốt + gió "vù" | SFX | `onlyBeltLeft` | 1,5–2,5 s | 1 | folk (r); dự phòng Lyria | Must | 0 (dự phòng 0,16–0,48) | Planned |
| AUD-MEME-006 | Nhướng mày: trống cái "BÙM" rất trầm, vang dài | SFX | `browBoom` | 1,5–2 s | 1 | folk (trống có sẵn) | Must | 0 | Planned |
| AUD-MEME-007 | Trừ sĩ diện: "bốp" + lò xo "tưng"; chí mạng thêm chiêng nhỏ | SFX | `faceDamage` (thường / chí mạng) | 0,6 s / 1,2 s | 2 (thường + chí mạng) | folk | Must | 0 | Planned |
| AUD-MEME-008 | Ổn mà: chim hót bình thản + chuông "keng" | SFX | `fineTeaSip` | 2 s | 1 | folk | Should | 0 | Planned |
| AUD-MEME-009 | Chọn / không chọn: "bụp" trầm + "ting" sáng | SFX | `pickNotPick` | 0,4 + 0,4 s | 1 | folk | Should | 0 | Planned |
| AUD-MEME-010 | Cười giấu đau: quạt run "phạch phạch" + "hừ" nghẹn | SFX | `painSmile` | 1,2 s | 1 | folk (dùng lại AUD-SFX-341 + AUD-VOX-016) | Should | 0 | Planned |
| AUD-MEME-011 | Đỉnh nóc: 3 tiếng trống theo 3 nhịp chữ | SFX | `peakRoof` (phát sau AUD-SFX-001 — mượn có chủ ý theo GDD) | 1,5 s | 1 | folk | Should | 0 | Planned |
| AUD-MEME-012 | Vỗ tay chậm "bộp… bộp… bộp" vang sân | SFX | `slowClap` | 2 s | 1 | folk (vỗ tay có sẵn) | Should | 0 | Planned |
| AUD-MEME-013 | Ét o ét: mõ gõ 3 ngắn – 3 dài – 3 ngắn | SFX | `sosLogs` | 2,5 s | 1 | folk (mõ có sẵn) | Could | 0 | Planned |
| AUD-MEME-014 | Gét gô: trống dồn ngắn + "vút" | SFX | `letsGoDash` | 1 s | 1 | folk | Could | 0 | Planned |

### Lô 4 — UI / hoàn thiện

| ID | Tên | Loại | Dùng ở đâu | Độ dài · loop | Biến thể | Cách làm | Ưu tiên | Chi phí (USD) | Trạng thái |
|---|---|---|---|---|---|---|---|---|---|
| AUD-MUS-006 | Nhạc Menu (+ intro 4 khung, màn đặt tên) — Đô trưởng 110–116, tươi, "chào mừng tới làng Lầy" | MUS | Menu, intro (§5, §11) | ~30 s · loop | 1 | Lyria | Must | 0,16–0,48 | Planned |
| AUD-UI-001 | Click nút (gõ gỗ / marimba nhẹ) | UI | Mọi nút | 60–100 ms | 2 | sfx (triangle, lowpass 5000) | Must | 0 | Planned |
| AUD-UI-003 | Mở cửa sổ (giấy dó "sột" + gỗ) | UI | Túi đồ, thùng bán, cửa hàng, nhiệm vụ, tạm dừng | 120–150 ms | 1 | sfx / folk | Must | 0 | Planned |
| AUD-UI-004 | Đóng cửa sổ | UI | như trên, Esc | 100–150 ms | 1 | sfx / folk | Must | 0 | Planned |
| AUD-UI-005 | Lỗi / không được (mõ trầm nhỏ "cộc") | UI | Nút xám, thiếu tiền, gùi đầy, hết hạt, ngoài tầm | ≤ 150 ms | 1 | folk | Must | 0 | Planned |
| AUD-UI-006 | Đổi ô hotbar (tick nhẹ) | UI | Phím 1–9, cuộn chuột | 40–60 ms | 1 | sfx | Must | 0 | Planned |
| AUD-UI-002 | Hover nút (rất khẽ) | UI | Rê chuột vào nút | 30–50 ms | 1 | sfx | Should | 0 | Planned |
| AUD-UI-007 | Nhấc / thả món khi kéo thả | UI | Túi đồ, rương | 60–100 ms | 2 | sfx | Should | 0 | Planned |
| AUD-UI-008 | Lật khung intro (giấy) | UI | Intro, cảnh cưới | ≤ 150 ms | 1 | folk | Should | 0 | Planned |
| AUD-UI-009 | Thẻ meme trượt vào "xoẹt" | UI | Thẻ góc meme (§11) | ≤ 150 ms | 1 | folk | Should | 0 | Planned |
| AUD-UI-010 | Thông báo nhỏ "Đã lưu" | UI | Toast lưu game | ≤ 150 ms | 1 | sfx | Could | 0 | Planned |
| AUD-MUS-009 | Nhạc Xóm ngày mưa (bản mềm, ít gõ) | MUS | Ngày mưa ở Xóm (thay MUS-001) | ~30 s · loop | 1 | Lyria | Could | 0,16–0,48 | Planned |

> UI cơ bản (UI-001, 003, 004, 005, 006) miễn phí, làm khoảng 1 giờ: có thể **kéo lên làm cùng Lô 1** vì prototype đã có cửa sổ thùng bán, sạp hạt, tạm dừng. Lô 4 còn là đợt **cân mix cuối**: đo lại toàn bộ (peak/RMS), cùng `game-dev` chỉnh âm lượng từng nhóm trong `gameConfig`.

### Tổng hợp

**Số mục mới: 111** (+ 11 đã có = 122). Must 70 · Should 34 · Could 7. Lyria: 11 track (8 Must, 2 Should, 1 Could) + 3 dự phòng cho meme có giai điệu; còn lại là tổng hợp, miễn phí.

| Lô | Số mục (Must / Should / Could) | Track Lyria | Chi phí dự kiến (2 vòng/track) | Trần (3 vòng/track + dự phòng meme) | Công agent ước tính | Người dùng nghe duyệt |
|---|---|---|---|---|---|---|
| Lô 1 Vườn | 20 (15 / 5 / 0) | 3 (MUS-005, JNG-003, JNG-006) | 0,96 USD | 1,44 USD | 5–7 giờ | ~15 phút |
| Lô 2 Xóm + NPC | 28 (16 / 9 / 3) | 1 (MUS-008) | 0,32 USD | 0,48 USD | 8–10 giờ | ~20 phút |
| Lô 3 khu khác + mặc cả + meme | 51 (33 / 16 / 2) | 5 (MUS-002, 003, 007, JNG-001, 004) + 3 dự phòng meme | 2,24 USD | 3,84 USD | 15–19 giờ | ~30–40 phút (chia 2–3 buổi) |
| Lô 4 UI / hoàn thiện | 12 (6 / 4 / 2) | 2 (MUS-006, MUS-009) | 0,64 USD | 0,96 USD | 3–4 giờ | ~10 phút |
| **Cộng** | **111 (70 / 34 / 7)** | **11 + 3 dự phòng** | **≈ 4,2 USD** | **≈ 6,7 USD** | **31–40 giờ** | **~1,5 giờ** |

- Cộng dự phòng gen lại khi người dùng chê cả hướng (+50% trần ≈ 3,4 USD) → **trần âm thanh chặng 4: 12 USD (người dùng chốt 2026-10-14)**. Chỉ tính Must: trần ≈ 5,3 USD.
- Giá Lyria 0,08 USD/clip (`tools/config.json`). SFX, giọng, nền, UI: tổng hợp, 0 USD.
- Chi phí thật chủ yếu là **công** (viết công thức tổng hợp mới cho từng âm), không phải tiền.

### Danh sách cắt (nếu trễ / vượt — cắt từ trên xuống, không cắt Must)

1. **Could (7 mục)**: AUD-VOX-013 ông Mõ, AUD-AMB-007 quán chè, AUD-AMB-008 giếng, AUD-MEME-013 ét o ét, AUD-MEME-014 gét gô, AUD-UI-010, AUD-MUS-009 nhạc ngày mưa (−0,48 USD).
2. **Nền theo vị trí**: AUD-AMB-003, 004, 005, 009, 010 → chỉ giữ AUD-AMB-002 (nền Xóm) + AUD-AMB-006 (đêm).
3. **Bước chân theo nền** (AUD-SFX-111, 114) → 1 bộ bước chân chung, chỉ phát khi qua cổng.
4. **AUD-MUS-007 nhạc mặc cả** → tắt nhạc khi mặc cả, chỉ còn quạt / trà / "hừm" (im lặng cũng kịch tính) (−0,48 USD).
5. **AUD-JNG-006 mùa mưa** → đầu mùa dùng sấm + mưa (−0,48 USD). (AUD-MUS-008 nay là Must; giọng riêng từng NPC người dùng đã chốt — không cắt.)
6. **Should SFX phụ**: AUD-SFX-112, 113, 202, 205, 302, 304, 316, 344, 345, 346; AUD-VOX-020, 024; AUD-UI-002, 007, 008, 009; AUD-AMB-011.
7. **Lyria dự phòng meme** → chấp nhận bản tổng hợp gần nhất (−1,44 USD).

### Đang mượn tạm — cần làm thật

| Chỗ trong game | Đang dùng | Thay bằng | Ghi chú |
|---|---|---|---|
| Đếm tiền "tách tách" ở tổng kết ngày (`GardenScene.tickSummarySound`) | `nhat-xu-1/2` nâng +700 cent, âm lượng ×0,35 | AUD-SFX-118 | Lô 1, Must |
| Nhát cuốc chốt khi xong ô (`tillFinishSfxDetune` −400, âm lượng ×1,25) | `cuoc-dat-1/2` hạ cao độ | AUD-SFX-103 | Lô 1, Must (GDD §3.3a: "tiếng chốt riêng") |
| Mua hạt ở sạp (`COIN_SFX` khi mua) | `nhat-xu-1/2` (tiếng *nhận* tiền) | AUD-SFX-202 "trả tiền" | Lô 2, Should — nghĩa ngược: mất tiền mà nghe như được tiền |
| Nhạc ban đêm | `vuon-loop` chạy suốt 6h–24h | AUD-MUS-005 | Lô 1, Must |
| Bố vợ "Hừm!" (GDD §8) | AUD-SFX-005 chỉ có mõ + đàn bầu | thêm AUD-VOX-016 phát cùng | Lô 3, Must |
| Mượn **có chủ ý** (giữ): lên bậc ngoại hình = AUD-SFX-001 cao 1 nấc; đỉnh nóc = AUD-SFX-001 + trống; ông Khướt ngáy = AUD-SFX-108 hạ cao độ; Xóm + hồ làng = nhạc Vườn (+ nền hồ); con nhỏ cười = giọng trẻ trâu nâng cao độ | — | — | Theo GDD / D-021 |

## Changelog

- 2026-10-09 — Tạo danh sách.
- 2026-10-09 — Bước 2.3 (D-018): AUD-MUS-001 + AUD-SFX-001…008 Approved (file tạm trong `audio-source/raw/`, chuyển ở bước 3.1); thêm danh sách Planned.
- 2026-10-10 — Bước 3.3 (T-002): người dùng góp ý "bộp" chưa giống cuốc → làm lại AUD-SFX-003 bằng công thức mới `hoe_soil` (4 ứng viên, chọn v1 + v2), trạng thái Processed — chờ người dùng nghe duyệt rồi mới ghi đè file game.
- 2026-10-10 — AUD-SFX-003 bản 2: người dùng duyệt ứng viên 1 + 2 → chép vào `web/client/public/assets/audio/sfx/cuoc-dat-1/2.wav`, chạy `audio:convert`.
- 2026-10-10 — Bước 3.3 (T-003): thêm AUD-SFX-101 gieo hạt (`sow_seed`) và AUD-SFX-102 hái cây (`harvest_pop`), mỗi loại 4 ứng viên, đề xuất 2. Trạng thái Processed, chờ người dùng nghe duyệt rồi mới chép vào game.
- 2026-10-14 — Người dùng duyệt kế hoạch 4.1: AUD-MUS-008 lên Must, giọng riêng từng NPC (16 bộ), trần 12 USD; thêm AUD-SFX-115 (cửa nhà, Must) + AUD-AMB-011 (nền trong nhà, Should) cho cảnh trong nhà; AUD-MUS-005 dùng cả trong nhà. Tổng 111 mục (Must 70 / Should 34 / Could 7).
- 2026-10-13 — Bước 4.1: thay bảng "Kế hoạch" gộp bằng **danh sách sản xuất chặng 4 đầy đủ** (109 mục mới chia 4 lô khớp lô hình; Must 68 / Should 34 / Could 7), bảng chi phí theo lô (dự kiến ≈ 4,2 USD, trần ≈ 6,7 USD, đề xuất trần 12 USD kể cả gen lại), danh sách cắt, danh sách âm đang mượn tạm. AUD-MUS-004 (Suối) bỏ theo D-027; AUD-JNG-002 (xong nhiệm vụ) đổi từ Lyria sang tổng hợp (chiêng có sẵn). Bảng "Đã có" giữ nguyên. Chưa gen, chưa tốn phí.
- 2026-10-09 — Bước 3.1: copy nhạc Vườn + 8 SFX (13 file) vào `web/client/public/assets/audio/`, thêm `npm run audio:convert` (WAV → OGG + MP3 bằng ffmpeg-static).
