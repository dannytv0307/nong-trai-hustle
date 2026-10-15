# AUD-MUS-005 — Nhạc đêm / trong nhà

| Mục | Giá trị |
|---|---|
| Loại | MUS (mood phụ) |
| Cách tạo | Lyria (`gen_music.py`), seed 5051 / 5052 |
| Sự kiện kích hoạt | Xóm 19h–6h (chuyển mờ từ nhạc ngày lúc 19h), màn đi ngủ; **cảnh trong nhà** cả ban ngày (nhỏ hơn) |
| Độ dài | ~30 s · Loop: có (crossfade 2 s) |
| Kênh | stereo, 48 kHz |
| Biến thể | 1 |
| File trong game | `web/client/public/assets/audio/music/dem-loop.wav` (key đề xuất `music-dem`) |
| Trạng thái | Approved (người dùng nghe 2026-10-15, seed 5051) |

## Mô tả (tiếng Việt)

Mood phụ của audio bible §4: **cùng palette** với nhạc Vườn nhưng chậm và êm (≈ 92 BPM): ukulele gảy thưa, marimba mềm, sáo trúc thong thả là màu Việt duy nhất, glockenspiel lấp lánh như sao. Vẫn trưởng, ấm, hơi tinh nghịch; **không buồn, không hoài cổ** (người dùng đã chê hướng dân tộc trầm). Nghe nhiều lần mỗi đêm game và mỗi lần vào nhà, nên phải đều, không có cao trào.

## Prompt chính

```
Upbeat, bright, modern casual farming game music in a catchy cartoon style, sunny and funny, with one small Vietnamese folk instrument accent for local color.
Evening background loop for the village home at night and cozy indoor scenes, after a busy farming day.
Warm, cozy, softly playful and content, still major and happy, a gentle hummable melody.
Tempo 92 BPM, C major. Sparse fingerpicked ukulele, soft marimba, a relaxed bamboo flute melody with a few gentle slides, light glockenspiel twinkles like stars, soft round bass, a very light shaker; no claps, no cajon.
Steady loopable groove, calm, gentle, low energy, no intro, no ending, no big build-ups. Instrumental, clean bright mix, not bass-heavy, balanced for laptop speakers and headphones.
```

## Negative

```
vocals, singing, speech, choir, sad, melancholic, nostalgic, ballad, dark, epic orchestra, heavy drums, distortion, EDM drop
```

## Lệnh

```
.venv/Scripts/python tools/gen_music.py --card docs/audio/prompts/AUD-MUS-005.md --name AUD-MUS-005 --seed 5051 -n 2
.venv/Scripts/python tools/audio_tools.py loop audio-source/raw/AUD-MUS-005/<clip>.wav audio-source/raw/AUD-MUS-005/final-<i>.wav --crossfade 2 --rms -18 --limit
```

## Số liệu

Thô (32.77 s, Lyria): seed 5051 — 38% năng lượng < 150 Hz, tâm phổ 620 Hz, tempo đo ~92–96; seed 5052 — **66% < 150 Hz, tâm phổ 332 Hz** (rất nặng trầm, loa laptop sẽ đục/mất nhiều).

| Bản | File | Dài | Peak | RMS | To A | < 150 Hz | Tâm phổ | RMS theo 2 s | Chỗ nối |
|---|---|---|---|---|---|---|---|---|---|
| **seed 5051 (đề xuất)** | `audio-source/raw/AUD-MUS-005/final-1.wav` → `music/dem-loop.wav` | 30.77 s | −1.0 | −18.0 | −12.4 | 37% | 620 Hz | −19.6…−16.7 | crossfade 2 s, liền mẫu; RMS 0.5 s cuối −21.3 / đầu −18.7 |
| seed 5052 | `audio-source/raw/AUD-MUS-005/final-2.wav` | 30.77 s | −3.0 | −18.0 | −17.8 | 66% | 331 Hz | −19.0…−17.4 | liền, đều hơn |

Bản mẫu nhạc Vườn để so: To A −12.7, 42% < 150 Hz, tâm 758 Hz. Chỗ nối không căn phách (như nhạc Vườn): nghe đoạn giây ~29 → 0.

## Nhật ký

| Ngày | Lần | Thay đổi | Kết quả | Chọn |
|---|---|---|---|---|
| 2026-10-15 | 1 | Prompt mood phụ 92 BPM, sáo trúc, seed 5051/5052 (2 lần gọi = 0,16 USD) | 5051 sáng, cân giống bản mẫu; 5052 đục trầm | Đề xuất **5051**, chờ người dùng nghe |
| 2026-10-15 | — | Người dùng nghe | Không góp ý → chấp nhận bản đề xuất | **seed 5051** (Approved) |
