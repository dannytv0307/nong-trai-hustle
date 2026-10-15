# AUD-JNG-006 — "Mùa mưa / mùa nắng tới rồi!"

| Mục | Giá trị |
|---|---|
| Loại | JNG |
| Cách tạo | Lyria (`gen_music.py`), seed 6061 / 6062, cắt 1 câu + fade |
| Sự kiện kích hoạt | Băng chữ ngày đầu mùa (GDD §3.1) |
| Độ dài | 2–4 s · Loop: không |
| Kênh | stereo, 48 kHz |
| Biến thể | 1 (dùng chung cho mùa mưa và mùa nắng; mùa mưa game có thể phát thêm sấm AUD-SFX-121) |
| File trong game | `web/client/public/assets/audio/music/dau-mua.wav` (key đề xuất `jng-dau-mua`) |
| Trạng thái | Approved (người dùng nghe 2026-10-15, seed 6061) — Should |

## Mô tả (tiếng Việt)

Câu "loa làng" vui, ngắn: ukulele quạt, marimba chạy lên, vỗ tay, một câu sáo trúc láy làm màu Việt. Đô trưởng, 120 BPM như nhạc Vườn để nối không chõi.

## Prompt chính

```
Upbeat, bright, modern casual farming game music in a catchy cartoon style, sunny and funny, with one small Vietnamese folk instrument accent for local color.
Short announcement fanfare jingle: a new season has arrived in the village.
Excited, bright, bouncy and playful.
Tempo 120 BPM, C major. Strummed ukulele, a fast upward marimba run, handclaps, glockenspiel, a short bamboo flute flourish.
Short jingle with a clear ending. Instrumental, clean bright mix, not bass-heavy, balanced for laptop speakers and headphones.
```

## Negative

```
vocals, singing, speech, choir, sad, melancholic, nostalgic, slow, ballad, dark, epic orchestra, heavy drums, distortion, EDM drop
```

## Lệnh

```
.venv/Scripts/python tools/gen_music.py --card docs/audio/prompts/AUD-JNG-006.md --name AUD-JNG-006 --seed 6061 -n 2
```

## Số liệu

Cũng như AUD-JNG-003: Lyria chạy liên tục 32.77 s, tempo đo ~124 BPM. Cắt từ 0 s tới phách 1 sau 1 ô nhịp (có đoạn dạo ~1.3–1.4 s trước phách 1), giữ nốt kết 120 ms rồi tắt dần 0.6 s; RMS −16 bằng limiter.

| Bản | File | Dài | Peak | RMS | To A | < 150 Hz | Tâm phổ |
|---|---|---|---|---|---|---|---|
| **seed 6061 (đề xuất)** | `audio-source/raw/AUD-JNG-006/final-1.wav` → `music/dau-mua.wav` | 3.97 s (kết ở 3.37 s) | −1.5 | −16.0 | −13.0 | 31% | 1094 Hz |
| seed 6062 | `audio-source/raw/AUD-JNG-006/final-2.wav` | 3.83 s (kết ở 3.23 s) | −1.0 | −16.0 | −14.3 | 40% | 741 Hz |

## Nhật ký

| Ngày | Lần | Thay đổi | Kết quả | Chọn |
|---|---|---|---|---|
| 2026-10-15 | 1 | seed 6061/6062 (0,16 USD), cắt 1 ô nhịp + fade | 6061 sáng hơn | Đề xuất **6061**, chờ nghe |
| 2026-10-15 | — | Người dùng nghe | Không góp ý → chấp nhận bản đề xuất | **seed 6061** (Approved) |
