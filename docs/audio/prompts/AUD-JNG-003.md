# AUD-JNG-003 — Tổng kết ngày / ngày mới

| Mục | Giá trị |
|---|---|
| Loại | JNG |
| Cách tạo | Lyria (`gen_music.py`), seed 3031 / 3032, cắt 1 câu + fade |
| Sự kiện kích hoạt | Mở màn tổng kết ngày (GDD §7); nhạc nền nhỏ lại khi phát |
| Độ dài | 3–6 s · Loop: không |
| Kênh | stereo, 48 kHz |
| Biến thể | 1 |
| File trong game | `web/client/public/assets/audio/music/tong-ket-ngay.wav` (key đề xuất `jng-tong-ket-ngay`) |
| Trạng thái | Approved (người dùng nghe 2026-10-15, seed 3031) |

## Mô tả (tiếng Việt)

Câu nhạc ngắn ấm áp, "xong một ngày rồi, cũng ra gì đấy": ukulele + marimba + huýt sáo, kết trên hợp âm Đô trưởng sáng có glockenspiel. Tempo mood phụ (≈ 96 BPM). Phát 1 lần mỗi ngày game, trước tiếng đếm tiền "tách tách" (AUD-SFX-118). Lyria luôn trả ~30 s nên cắt lấy một câu có kết rồi fade.

## Prompt chính

```
Upbeat, bright, modern casual farming game music in a catchy cartoon style, sunny and funny, with one small Vietnamese folk instrument accent for local color.
Short end-of-day jingle for the daily results screen after a long day of farming.
Warm, satisfied, cheerful and a little proud.
Tempo 96 BPM, C major. Strummed ukulele, marimba, a whistle-like lead melody, glockenspiel sparkles on the final chord, one wooden block tap for a comic accent.
Short jingle with a clear ending. Instrumental, clean bright mix, not bass-heavy, balanced for laptop speakers and headphones.
```

## Negative

```
vocals, singing, speech, choir, sad, melancholic, nostalgic, ballad, dark, epic orchestra, heavy drums, distortion, EDM drop
```

## Lệnh

```
.venv/Scripts/python tools/gen_music.py --card docs/audio/prompts/AUD-JNG-003.md --name AUD-JNG-003 --seed 3031 -n 2
# cắt: xem mục Số liệu (đoạn chọn + fade), chuẩn hóa peak -1 / RMS ~ -16
```

## Số liệu

Lyria **không tự kết** dù prompt ghi "short jingle with a clear ending": cả 2 clip là nhạc chạy liên tục 32.77 s, và **tempo đo ~120 / ~135 BPM chứ không phải 96** như prompt. Cách cắt: dò lưới phách (spectral flux), lấy từ 0 s tới phách 1 của ô nhịp sau 2 ô, giữ nguyên 120 ms đầu nốt kết rồi tắt dần 0.9 s; chuẩn hóa RMS −16 bằng limiter (peak −1).

| Bản | File | Dài | Peak | RMS | To A | < 150 Hz | Tâm phổ |
|---|---|---|---|---|---|---|---|
| **seed 3031 (đề xuất)** | `audio-source/raw/AUD-JNG-003/final-1.wav` → `music/tong-ket-ngay.wav` | 5.59 s (kết ở 4.69 s) | −1.0 | −16.0 | −12.6 | 21% | 1467 Hz |
| seed 3032 | `audio-source/raw/AUD-JNG-003/final-2.wav` | 5.88 s (kết ở 4.98 s) | −1.0 | −16.1 | −16.3 | 65% | 424 Hz |

Rủi ro: "kết" là nhát cắt + fade, không phải câu nhạc tự kết; nếu nghe cụt thì vòng 2 thử cắt chỗ khác (miễn phí) trước khi gen lại.

## Nhật ký

| Ngày | Lần | Thay đổi | Kết quả | Chọn |
|---|---|---|---|---|
| 2026-10-15 | 1 | seed 3031/3032 (0,16 USD), cắt 2 ô nhịp + fade | Lyria chạy liên tục, tempo nhanh hơn yêu cầu; 3031 sáng, 3032 nặng trầm | Đề xuất **3031**, chờ nghe |
| 2026-10-15 | — | Người dùng nghe | Không góp ý → chấp nhận bản đề xuất | **seed 3031** (Approved) |
