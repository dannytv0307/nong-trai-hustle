# AUD-SFX-001…008 — Bộ SFX tổng hợp (card gộp)

| Mục | Giá trị |
|---|---|
| Loại | SFX (+ giọng) |
| Cách tạo | Tổng hợp — `tools/gen_folk_sfx.py --seed 1` |
| Kênh | mono, 44.1 kHz |
| File trong game | `web/client/public/assets/audio/sfx/…` (tạm: `audio-source/raw/<ID>/final.wav`, xem `audio-list.md`) |
| Trạng thái | Approved (đội chọn theo ủy quyền người dùng, bước 2.3) |

## Bảng âm

| ID | Âm | Công thức · biến thể | Peak | Random pitch trong game |
|---|---|---|---|---|
| AUD-SFX-001 | Lên level: marimba C–E–G–C đi lên (nốt đà Sol) + mõ + glockenspiel + vỗ tay | `levelup_bright` v2 | −1 | không |
| AUD-SFX-002 | Nhặt xu: xu chạm + "ting" glockenspiel đi lên | `coin_bright` v1 (chính), v2 (biến thể) | −1 | ±4% |
| AUD-SFX-003 | Cuốc đất "bộp" | `hoe` v1, v2 | −1 | ±4% |
| AUD-SFX-004 | Tưới nước | `water` v1, v2 | −1 | ±4% |
| AUD-SFX-005 | Bố vợ nhăn: mõ + đàn bầu luyến xuống Rê → La | `frown` v2 | −1 | không |
| AUD-SFX-006 | Meme zoom: 3 tiếng trống to dần + chũm chọe nhẹ | `damn` v2 | −1 | không |
| AUD-SFX-007 | Meme ối dồi ôi: chũm chọe + chiêng | `oidoioi` v1 | −1 | không |
| AUD-SFX-008 | Càu nhàu "ú ớ" (chính), "hừm" (biến thể) | `grumble` v1, v2 | −6 | ±3% |

## Thông số SFX

```json
{"tool": "gen_folk_sfx.py", "seed": 1, "variants": 2,
 "chosen": {"AUD-SFX-001": "levelup_bright-2", "AUD-SFX-002": ["coin_bright-1", "coin_bright-2"],
            "AUD-SFX-003": ["hoe-1", "hoe-2"], "AUD-SFX-004": ["water-1", "water-2"],
            "AUD-SFX-005": "frown-2", "AUD-SFX-006": "damn-2", "AUD-SFX-007": "oidoioi-1",
            "AUD-SFX-008": ["grumble-1", "grumble-2"]}}
```

(Card này dùng `gen_folk_sfx.py`, không đọc bằng `gen_sfx.py --card`.)

## Lệnh

```
.venv/Scripts/python tools/gen_folk_sfx.py --recipe <công thức> --seed 1 --variants 2 --out audio-source/raw/<ID>/src
.venv/Scripts/python tools/audio_tools.py process audio-source/raw/<ID>/src/<file>-<v>.wav audio-source/raw/<ID>/final.wav --mono --trim --peak -1   # giọng: --peak -6
```

## Nhật ký

| Ngày | Lần | Thay đổi | Kết quả | Chọn |
|---|---|---|---|---|
| 2026-10-09 | 1 | 8 công thức dân tộc (trống/mõ/xu/chũm chọe/chiêng/nước/giọng) | Trống trầm chỉ có ~90 Hz → thêm bão hòa + nhấn dải giữa | — |
| 2026-10-09 | 2 | Thêm `levelup_bright`, `coin_bright` (marimba, glockenspiel, vỗ tay) theo hướng V1 vui hơn | | lên level tươi #2, xu tươi #1 |
