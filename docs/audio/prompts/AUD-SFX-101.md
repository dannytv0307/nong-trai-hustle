# AUD-SFX-101 — Gieo hạt "lách tách"

| Mục | Giá trị |
|---|---|
| Loại | SFX |
| Cách tạo | Tổng hợp: `tools/gen_folk_sfx.py --recipe sow_seed --seed 1` |
| Sự kiện kích hoạt | Gieo hạt (T-003), phát ở khung "chạm" của việc nhanh 0.4 s. Rê chuột cả luống thì phát liên tục mỗi 0.4 s |
| Độ dài | 0.26 s / 0.28 s · Loop: không |
| Kênh | mono, 44.1 kHz |
| Biến thể | 2 (+ random pitch ±4% trong game) |
| File trong game | `web/client/public/assets/audio/sfx/gieo-hat-1.wav`, `gieo-hat-2.wav` (key đề xuất `sfx-gieo-hat-1`, `sfx-gieo-hat-2`) |
| Trạng thái | Processed, **chờ người dùng nghe duyệt** (chưa chép vào game) |

## Mô tả (tiếng Việt)

GDD §8: gieo hạt, hình là "hạt rơi, ô hơi lún", tiếng là "lách tách". Đây là việc nhanh (0.4 s) và lặp rất nhiều lần khi rê cả luống, nên tiếng phải **nhẹ hơn cuốc rõ rệt** (thấp hơn khoảng 5 dB), không có thân trầm, không chói, và hai biến thể phải cùng "chất" để xen kẽ không bị lệch.

Ghép 3 lớp, hạt đầu tiên rơi ở t = 0 (khớp khung chạm):
1. **Hạt rơi**: 3–6 tiếng "tách" rất ngắn (vỏ hạt cứng: nhiễu 1.5–7 kHz tắt sau ~1.5 ms + mode nhỏ 1.7–5 kHz tắt sau ~4 ms) + tiếng "sụt" nhỏ khi hạt lún vào đất tơi (nhiễu 300–1200 Hz). Khoảng cách giữa các hạt không đều, giống tay rắc thật. Game thả 4 hạt hình (`plantSeedDropCount`) và tiếng cũng có khoảng 4 hạt.
2. **Tay vùi đất "sột"**: nhiễu 250–1600 Hz cộng khoảng 40 hạt nhiễu nhỏ (500–2600 Hz), phồng lên sau hạt cuối.
3. **Vỗ nhẹ "bụp"**: nhiễu trầm vừa 90–450 Hz, không có cao độ, tắt sau ~18 ms.

Cuối cùng cắt dưới 110 Hz và trên 7 kHz (lặp nhiều không mỏi tai), nhấn nhẹ dải 400–2500 Hz cho loa laptop. Hợp SFX profile bible §6: "tiếng động thật, ngắn, có lớp dải giữa".

## Thông số SFX

```json
{"tool": "gen_folk_sfx.py", "recipe": "sow_seed", "seed": 1, "variants": 4,
 "params": {
   "1": {"seeds": 4, "spread": 0.085, "seed_hz": [2600, 4200], "cover": 0.45, "pat": 0.30, "dur": 0.26},
   "2": {"seeds": 3, "spread": 0.070, "seed_hz": [2400, 3800], "cover": 0.70, "pat": 0.55, "dur": 0.31},
   "3": {"seeds": 6, "spread": 0.120, "seed_hz": [3000, 5000], "cover": 0.25, "pat": 0.12, "dur": 0.24},
   "4": {"seeds": 5, "spread": 0.100, "seed_hz": [1700, 2900], "cover": 0.45, "pat": 0.30, "dur": 0.28}},
 "chosen_proposal": {"gieo-hat-1": "sow_seed v1 (--rms -20.0 --limit)", "gieo-hat-2": "sow_seed v4 (--rms -20.6)"},
 "backup": "sow_seed v2"}
```

(Bảng `SOW_SEED` trong `tools/gen_folk_sfx.py` là nguồn thật; card này không đọc bằng `gen_sfx.py --card`.)

## Lệnh

```
.venv/Scripts/python tools/gen_folk_sfx.py --recipe sow_seed --variants 4 --seed 1 --out audio-source/raw/T-003-sfx/sow_seed/candidates --prefix ung-vien
.venv/Scripts/python tools/audio_tools.py process audio-source/raw/T-003-sfx/sow_seed/candidates/ung-vien-1.wav audio-source/raw/T-003-sfx/gieo-hat-1.wav --mono --trim --rms -20.0 --limit
.venv/Scripts/python tools/audio_tools.py process audio-source/raw/T-003-sfx/sow_seed/candidates/ung-vien-4.wav audio-source/raw/T-003-sfx/gieo-hat-2.wav --mono --trim --rms -20.6
# Sau khi người dùng duyệt:
cp audio-source/raw/T-003-sfx/gieo-hat-1.wav web/client/public/assets/audio/sfx/gieo-hat-1.wav
cp audio-source/raw/T-003-sfx/gieo-hat-2.wav web/client/public/assets/audio/sfx/gieo-hat-2.wav
```

Mức RMS chọn sao cho hai biến thể có độ to cảm nhận bằng nhau (−17.8, xem bảng dưới) và thấp hơn cuốc khoảng 5 dB. Vì vậy peak của `gieo-hat-2` là −2.7 chứ không phải −1. Đây là chủ ý: tiếng gieo nhẹ hơn mức "phản hồi gameplay" thông thường.

## Số liệu

"To A" = độ to cảm nhận gần đúng: RMS có trọng số A, lấy cửa sổ 100 ms to nhất (dB). "Cao độ" = đỉnh phổ đoạn 15–120 ms (độ rõ = đỉnh so với trung vị). Tiếng gieo là tiếng động, không cần cao độ.

| File | Dài | Peak | RMS | To A | Tâm phổ | 150–700 | 700–2k | 2–5k | > 5k | Đuôi (0.15 s→hết) |
|---|---|---|---|---|---|---|---|---|---|---|
| Cuốc `cuoc-dat-1` (tham chiếu) | 0.36 s | −1.0 | −14.0 | −13.0 | 652 Hz | 55% | 15% | 6% | 1% | −26.6 |
| Cuốc `cuoc-dat-2` (tham chiếu) | 0.38 s | −1.0 | −12.7 | −12.3 | 566 Hz | 43% | 14% | 5% | 1% | −27.9 |
| Ứng viên 1 (thô) | 0.26 s | −1.0 | −21.1 | −18.6 | 1606 Hz | 35% | 35% | 26% | 3% | −33.6 |
| Ứng viên 2 (thô) | 0.31 s | −1.0 | −18.1 | −15.0 | 1382 Hz | 42% | 33% | 22% | 2% | −32.5 |
| Ứng viên 3 (thô) | 0.24 s | −1.0 | −20.4 | −17.1 | 2483 Hz | 16% | 31% | 47% | 5% | −33.1 |
| Ứng viên 4 (thô) | 0.28 s | −1.0 | −18.9 | −15.8 | 1617 Hz | 26% | 38% | 33% | 2% | −30.7 |
| **gieo-hat-1** (ƯV 1, đã xử lý) | 0.26 s | −1.0 | −20.4 | −17.8 | 1538 Hz | 34% | 37% | 24% | 3% | −32.4 |
| **gieo-hat-2** (ƯV 4, đã xử lý) | 0.28 s | −2.7 | −20.9 | −17.8 | 1529 Hz | 27% | 40% | 29% | 2% | −32.3 |

Ứng viên 3 sáng nhất (47% năng lượng ở 2–5 kHz, tâm phổ 2.5 kHz), dễ chói khi lặp mỗi 0.4 s. Ứng viên 2 có tiếng vùi đất rõ nhất nhưng to nhất (chỉ thấp hơn cuốc ~3 dB). Ứng viên 1 và 4 có cân bằng phổ gần như giống nhau (tâm ~1.5 kHz), khác nhau ở số hạt (4 / 5) và cao độ vỏ hạt.

## Nhật ký

| Ngày | Lần | Thay đổi | Kết quả | Chọn |
|---|---|---|---|---|
| 2026-10-10 | 1 | Công thức mới `sow_seed` 3 lớp, 4 biến thể | Dài 0.24–0.31 s; thấp hơn cuốc 3–6 dB; > 5 kHz ≤ 5% | Đề xuất v1 + v4 (chờ duyệt), dự phòng v2 |
