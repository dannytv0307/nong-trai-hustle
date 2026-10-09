# Danh sách asset âm thanh

> Chủ sở hữu: `audio-director` · Trạng thái: Planned → Prompted → Generated → Processed → In-game → Approved
> **Vị trí file:** bản gốc `audio-source/raw/<ID>/final.wav` (gitignore). Từ **bước 3.1** file game nằm ở `web/client/public/assets/audio/<music|sfx>/<tên file game>.wav` (cột "File game", tên đã copy đúng như bảng). `npm run audio:convert` (tự chạy trước `npm run dev` / `npm run build`) sinh `.ogg` + `.mp3` cùng tên bên cạnh; game tải OGG (MP3 cho Safari); WAV bị bỏ khỏi `dist/`. Nếu mất `raw/` thì tái tạo được: nhạc từ log seed trong prompt card, SFX bằng `gen_folk_sfx.py --seed 1`.
> "Approved" ở bước 2.3: người dùng đã nghe nhạc Vườn V1; 8 SFX do đội chọn theo ủy quyền của người dùng ("phù hợp với concept").

## Đã có

| ID | Tên | Loại | Sự kiện kích hoạt | Độ dài | Loop | Biến thể | File tạm → File game | Ưu tiên | Trạng thái | Prompt card |
|---|---|---|---|---|---|---|---|---|---|---|
| AUD-MUS-001 | Nhạc Vườn (ngày) | MUS | Ở khu Vườn + Nhà + Đầu ngõ ban ngày | 30.77 s | có | 1 | `raw/AUD-MUS-001/final.wav` → `music/vuon-loop.wav` | Must | Approved | [AUD-MUS-001](prompts/AUD-MUS-001.md) |
| AUD-SFX-001 | Lên level (tươi) | SFX | Lên level; dùng lại cao hơn 1 nấc khi lên bậc ngoại hình | 1.66 s | không | 1 | `raw/AUD-SFX-001/final.wav` → `sfx/len-level.wav` | Must | Approved | [AUD-SFX-FOLK](prompts/AUD-SFX-FOLK.md) |
| AUD-SFX-002 | Nhặt xu "leng keng" | SFX | Nhận tiền | 0.83 / 0.89 s | không | 2 | `raw/AUD-SFX-002/final(-2).wav` → `sfx/nhat-xu-1/2.wav` | Must | Approved | AUD-SFX-FOLK |
| AUD-SFX-003 | Cuốc đất "bộp" | SFX | Cuốc đất | 0.35 s | không | 2 | `raw/AUD-SFX-003/final(-2).wav` → `sfx/cuoc-dat-1/2.wav` | Must | Approved | AUD-SFX-FOLK |
| AUD-SFX-004 | Tưới nước | SFX | Tưới | 0.60 s | không | 2 | `raw/AUD-SFX-004/final(-2).wav` → `sfx/tuoi-nuoc-1/2.wav` | Must | Approved | AUD-SFX-FOLK |
| AUD-SFX-005 | Bố vợ nhăn (mõ + đàn bầu) | SFX | Mặc cả: mặt nhăn | 1.23 s | không | 1 | `raw/AUD-SFX-005/final.wav` → `sfx/bo-vo-nhan.wav` | Must | Approved | AUD-SFX-FOLK |
| AUD-SFX-006 | Meme zoom "tùng–tùng–TÙNG" | SFX | `dramaticZoom` | 2.35 s | không | 1 | `raw/AUD-SFX-006/final.wav` → `sfx/meme-zoom-trong.wav` | Must | Approved | AUD-SFX-FOLK |
| AUD-SFX-007 | Meme "ối dồi ôi" (chũm chọe + chiêng) | SFX | `oiDoiOi` | 2.62 s | không | 1 | `raw/AUD-SFX-007/final.wav` → `sfx/meme-oi-doi-oi.wav` | Must | Approved | AUD-SFX-FOLK |
| AUD-SFX-008 | Càu nhàu "ú ớ" (+ "hừm") | SFX (giọng) | Bong bóng chửi thề | 0.48 / 0.47 s | không | 2 | `raw/AUD-SFX-008/final(-2).wav` → `sfx/voice-cau-nhau-1/2.wav` | Must | Approved | AUD-SFX-FOLK |

## Kế hoạch (Planned — chi tiết hóa ở chặng 4)

| ID | Tên | Loại | Cách tạo | Nguồn | Ưu tiên | Trạng thái |
|---|---|---|---|---|---|---|
| AUD-MUS-002…004 | Nhạc khu Núi, Suối, Chợ làng bên | MUS | Lyria, prefix V1 | GDD §5 | Must | Planned |
| AUD-MUS-005 | Nhạc đêm / trong nhà (mood phụ) | MUS | Lyria, mood phụ | Bible §4 | Must | Planned |
| AUD-MUS-006 | Nhạc Menu | MUS | Lyria | GDD §5 | Must | Planned |
| AUD-MUS-007 | Nhạc mặc cả nhà bố vợ | MUS | Lyria | GDD §3.10 | Should | Planned |
| AUD-JNG-001…004 | Jingle: bắt được cá, xong nhiệm vụ (chiêng), tổng kết ngày, cảnh cưới (kèn trống) | JNG | Lyria jingle có kết | GDD §8 | Must | Planned |
| AUD-SFX-1xx | Hành động: gieo hạt, hái cây (pop cao dần), cây héo, chặt củi "cốc", hái nấm, nông cụ cùn, quăng câu "vút + tõm", phao giật, cuộn dây, cá sổng "phựt", dép "bẹp", nỏ trúng/trượt, ăn, bụng réo, ngáp, ngáy, bước chân, vải "phạch" | SFX | `gen_folk_sfx.py` (thêm công thức) | GDD §8 | Must/Should | Planned |
| AUD-SFX-2xx | Mặc cả: "hừm", quạt, trà "xụp", cười "khà khà" + trống; đếm "tách tách"; ăn cháo "xì" | SFX | tổng hợp | GDD §8 | Must | Planned |
| AUD-AMB-001…003 | Nền: mưa + sấm xa, gà gáy 6h, chim, búa rèn, cưa bào, ồn chợ | AMB | tổng hợp / Lyria | GDD §8, story bible | Should | Planned |
| AUD-VOX-001… | Giọng lẩm bẩm NPC (U Hến, bà Ba Trầu, cụ Bá Kẹo, cô Bưởi, ông Bễ, chú Đục, chị Thóc, bà Cân, ông Gật), "hế hế!" khoe, gia súc, mèo Mướp "mi-ao" | VOX | `gen_folk_sfx.py` (giọng formant) | story bible Handoff | Should | Planned |
| AUD-MEME-xx | Meme có giai điệu: còn cái nịt (đàn bầu tụt), khóc thành suối (nhị), mũi tên lãi/lỗ (sáo), đỉnh nóc (kèn trống), gét gô, ét o ét (mõ), trừ sĩ diện, chọn/không chọn, vỗ tay chậm, ổn mà, mèo phụ đề, cười gượng, nhướng mày "BÙM" (trống cái) | SFX/JNG | Giai điệu: Lyria jingle ngắn rồi cắt; gõ: tổng hợp | GDD §3.15 | Must 8 / Should / Could | Planned |
| AUD-UI-001…003 | Click, mở/đóng cửa sổ, lỗi | UI | `gen_sfx.py` | GDD §11 | Must | Planned |

## Changelog

- 2026-10-09 — Tạo danh sách.
- 2026-10-09 — Bước 2.3 (D-018): AUD-MUS-001 + AUD-SFX-001…008 Approved (file tạm trong `audio-source/raw/`, chuyển ở bước 3.1); thêm danh sách Planned.
- 2026-10-09 — Bước 3.1: copy nhạc Vườn + 8 SFX (13 file) vào `web/client/public/assets/audio/`, thêm `npm run audio:convert` (WAV → OGG + MP3 bằng ffmpeg-static).
