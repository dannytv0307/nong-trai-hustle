# AUD-MUS-001 — Nhạc Vườn (ngày)

| Mục | Giá trị |
|---|---|
| Loại | MUS |
| Cách tạo | Lyria (`gen_music.py`), seed 1201 |
| Sự kiện kích hoạt | Ở khu Vườn + Nhà + Đầu ngõ ban ngày |
| Độ dài | 30.77 s · Loop: có (crossfade 2 s) |
| Kênh | stereo, 48 kHz |
| Biến thể | 1 |
| File trong game | `web/client/public/assets/audio/music/vuon-loop.wav` (tạm: `audio-source/raw/AUD-MUS-001/final.wav`) |
| Trạng thái | Approved (người dùng nghe và chọn, bước 2.3) |

## Mô tả (tiếng Việt)

Nhạc nền chính của game, nghe nhiều nhất. Vui nhún, tươi, năng lượng cao: ukulele + marimba nảy, giai điệu kiểu huýt sáo, glockenspiel, bass nảy, vỗ tay + cajon; vài tiếng mõ gỗ nhấn hài là màu làng Việt. Đây là **bản mẫu chuẩn** của Audio Bible.

## Prompt chính

```
Upbeat, bright, modern casual farming game music in a catchy cartoon style, sunny and funny, with one small Vietnamese folk instrument accent for local color.
Gameplay background loop for farming the home garden on a sunny morning.
Happy, bouncy, playful and energetic, a catchy memorable hook.
Tempo 120 BPM, C major. Strummed ukulele and marimba play a bouncy riff, a cheerful whistle-like lead melody, glockenspiel sparkles, bouncy bass, handclaps and light cajon on a skipping beat; a wooden block adds a few comic accents.
Steady loopable groove, consistent high energy, no intro, no ending, no big build-ups. Instrumental, clean bright mix, not bass-heavy, balanced for laptop speakers and headphones.
```

## Negative

```
vocals, singing, speech, choir, sad, melancholic, nostalgic, slow, ballad, dark, epic orchestra, heavy drums, distortion, EDM drop
```

## Lệnh

```
.venv/Scripts/python tools/gen_music.py --card docs/audio/prompts/AUD-MUS-001.md --name AUD-MUS-001 --seed 1201 -n 1
.venv/Scripts/python tools/audio_tools.py loop audio-source/raw/AUD-MUS-001/<clip>.wav audio-source/raw/AUD-MUS-001/final.wav --crossfade 2 --rms -18 --limit
```

## Số liệu

Bản thô: 32.77 s, 43% năng lượng < 150 Hz, trọng tâm phổ 754 Hz, tempo đo ~125 BPM, RMS theo 2 s dao động −24.1…−26.0 dB. Bản cuối: 30.77 s, peak −1.0, RMS −18.0. Chỗ nối không có bước nhảy mẫu nhưng không căn phách. Bass khá nhiều, cần kiểm trên loa laptop.

## Nhật ký

| Ngày | Lần | Thay đổi | Kết quả | Chọn |
|---|---|---|---|---|
| 2026-10-09 | 1 | Hướng A dân tộc (2 clip) | Người dùng: "hoài cổ, thiếu vui" | — |
| 2026-10-09 | 2 | Prompt V1 ukulele, seed 1201/1202 (cùng lượt với V2, V3) | seed 1201 sáng hơn (centroid 754 vs 673 Hz) | **seed 1201** |
