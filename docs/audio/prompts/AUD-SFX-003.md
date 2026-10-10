# AUD-SFX-003 — Cuốc đất (bản 2: lưỡi sắt xắn đất ẩm)

| Mục | Giá trị |
|---|---|
| Loại | SFX |
| Cách tạo | Tổng hợp — `tools/gen_folk_sfx.py --recipe hoe_soil --seed 1` (không dùng `gen_sfx.py`: 1 dao động kiểu chip không ra được tiếng đất) |
| Sự kiện kích hoạt | Cuốc đất (T-002) — phát đúng khung "chạm" của động tác cuốc 0.4 s |
| Độ dài | 0.36 s / 0.38 s · Loop: không |
| Kênh | mono, 44.1 kHz |
| Biến thể | 2 (+ random pitch ±4% trong game) |
| File trong game | `web/client/public/assets/audio/sfx/cuoc-dat-1.wav`, `cuoc-dat-2.wav` (key `cuoc-dat-1`, `cuoc-dat-2` giữ nguyên) |
| Trạng thái | Processed — **chờ người dùng nghe duyệt** (bản cũ "bộp" vẫn đang trong game) |

## Mô tả (tiếng Việt)

Góp ý người dùng (bước 3.3, T-002): tiếng "bộp" cũ chưa giống cuốc đất. Nguyên nhân đo được: bản cũ là một sine 150 Hz tụt pitch có bão hòa — 60% năng lượng dưới 100 Hz, gần như không có nhiễu (flatness 0.006) → nghe như trống, và trên loa laptop chỉ còn "bộp".

Bản 2 ghép 4 lớp, attack ở t = 0:
1. **Lưỡi cuốc cắm**: nhiễu rộng 600–7000 Hz tắt trong ~5 ms + vài mode kim loại (≈1.7–2.4 kHz) bị đất "bóp" tắt sau ~30 ms.
2. **"Thụp" trầm**: nhiễu lọc 45–380 Hz (không có cao độ như trống) + chút sine tụt pitch cho sức nặng.
3. **"Phập" đất ẩm**: hai dải nhiễu 500–1100 Hz rồi 220–650 Hz nối tiếp → tâm âm trượt xuống, cảm giác đất đặc, ướt.
4. **Đuôi lạo xạo**: nền nhiễu 1.2–5.5 kHz nhỏ + 11–22 hạt đất vụn rơi thưa dần + 1–4 viên sỏi "tích".

Cuối cùng nhấn dải 300–2500 Hz (loa laptop) và bão hòa nhẹ để độ to ngang bản cũ. Hợp SFX profile bible §6: "tiếng động thật, ngắn, có lớp dải giữa".

## Thông số SFX

```json
{"tool": "gen_folk_sfx.py", "recipe": "hoe_soil", "seed": 1, "variants": 4,
 "params": {
   "1": {"body_hz": 105, "dec": 0.050, "metal": 0.30, "metal_hz": 1900, "wet": 0.55, "grains": 16, "pebbles": 2, "dur": 0.36},
   "2": {"body_hz": 85,  "dec": 0.065, "metal": 0.18, "metal_hz": 1650, "wet": 0.85, "grains": 11, "pebbles": 1, "dur": 0.38},
   "3": {"body_hz": 120, "dec": 0.045, "metal": 0.30, "metal_hz": 2100, "wet": 0.40, "grains": 22, "pebbles": 4, "dur": 0.34},
   "4": {"body_hz": 95,  "dec": 0.055, "metal": 0.50, "metal_hz": 2350, "wet": 0.55, "grains": 13, "pebbles": 2, "dur": 0.36}},
 "chosen": {"cuoc-dat-1": "hoe_soil v1", "cuoc-dat-2": "hoe_soil v2"},
 "backup": "hoe_soil v3"}
```

(Bảng `HOE_SOIL` trong `tools/gen_folk_sfx.py` là nguồn thật; card này không đọc bằng `gen_sfx.py --card`.)

## Lệnh

```
.venv/Scripts/python tools/gen_folk_sfx.py --recipe hoe_soil --variants 4 --seed 1 --out audio-source/raw/AUD-SFX-003-v2/candidates --prefix ung-vien
.venv/Scripts/python tools/audio_tools.py process audio-source/raw/AUD-SFX-003-v2/candidates/ung-vien-1.wav audio-source/raw/AUD-SFX-003-v2/moi-cuoc-dat-1.wav --mono --trim --peak -1
.venv/Scripts/python tools/audio_tools.py process audio-source/raw/AUD-SFX-003-v2/candidates/ung-vien-2.wav audio-source/raw/AUD-SFX-003-v2/moi-cuoc-dat-2.wav --mono --trim --peak -1
# Sau khi người dùng duyệt:
cp audio-source/raw/AUD-SFX-003-v2/moi-cuoc-dat-1.wav web/client/public/assets/audio/sfx/cuoc-dat-1.wav
cp audio-source/raw/AUD-SFX-003-v2/moi-cuoc-dat-2.wav web/client/public/assets/audio/sfx/cuoc-dat-2.wav
```

## Số liệu (đo bằng `audio_tools.py info` + phân tích phổ)

| File | Dài | Peak | RMS | Đỉnh sau | Tâm phổ | < 100 Hz | 250–700 | 700–2k | 2–5k | Đuôi (0.15 s→hết) |
|---|---|---|---|---|---|---|---|---|---|---|
| Cũ cuoc-dat-1 | 0.35 s | −1.2 | −15.1 | 12 ms | 158 Hz | 62% | 5% | 2% | 0.8% | −30.8 dB |
| Cũ cuoc-dat-2 | 0.34 s | −1.0 | −14.9 | 6 ms | 158 Hz | 59% | 4% | 2% | 0.8% | −30.3 dB |
| Ứng viên 1 (chọn → cuoc-dat-1) | 0.36 s | −1.0 | −14.0 | 13 ms | 652 Hz | 4% | 44% | 15% | 6% | −26.6 dB |
| Ứng viên 2 (chọn → cuoc-dat-2) | 0.38 s | −1.0 | −12.7 | 5 ms | 566 Hz | 28% | 34% | 14% | 5% | −27.9 dB |
| Ứng viên 3 (dự phòng) | 0.34 s | −1.0 | −14.1 | 7 ms | 819 Hz | 1% | 31% | 7% | 14% | −23.7 dB |
| Ứng viên 4 | 0.36 s | −1.0 | −15.7 | 9 ms | 779 Hz | 13% | 42% | 10% | 12% | −28.8 dB |

## Nhật ký

| Ngày | Lần | Thay đổi | Kết quả | Chọn |
|---|---|---|---|---|
| 2026-10-09 | 1 | `hoe` (bước 2.3): sine 150 Hz tụt pitch + nhiễu đất | Người dùng (3.3): "bộp" chưa giống cuốc | — |
| 2026-10-10 | 2 | Công thức mới `hoe_soil` 4 lớp, 4 biến thể | Đuôi đất vụn quá nhỏ (−40 dB), RMS −19…−21 (nhỏ hơn bản cũ) | — |
| 2026-10-10 | 3 | Tăng hạt đất vụn/sỏi/nền lạo xạo ×3, sine trầm 0.45→0.8, bão hòa nhẹ cuối | Đuôi −24…−29 dB, RMS −13…−16, attack ≤ 13 ms | v1 + v2 (chờ duyệt), v3 dự phòng |
