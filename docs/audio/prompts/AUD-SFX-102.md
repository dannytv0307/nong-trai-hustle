# AUD-SFX-102 — Hái cây "pop" (cao dần khi hái liên tiếp)

| Mục | Giá trị |
|---|---|
| Loại | SFX |
| Cách tạo | Tổng hợp: `tools/gen_folk_sfx.py --recipe harvest_pop --seed 1` |
| Sự kiện kích hoạt | Hái cây (T-003), lúc cây bật lên (`harvestPopSeconds` 0.35 s) |
| Độ dài | 0.34 s / 0.35 s · Loop: không |
| Kênh | mono, 44.1 kHz |
| Biến thể | 2, **cùng nốt gốc Đô 5 (C5 ≈ 523 Hz)**. Game detune tăng dần khi hái liên tiếp (xem dưới); **không** random pitch khi đang chuỗi |
| File trong game | `web/client/public/assets/audio/sfx/hai-cay-1.wav`, `hai-cay-2.wav` (key đề xuất `sfx-hai-cay-1`, `sfx-hai-cay-2`) |
| Trạng thái | Processed, **chờ người dùng nghe duyệt** (chưa chép vào game) |

## Mô tả (tiếng Việt)

GDD §8: hái cây, hình là "cây bật lên, icon bay vào hotbar", tiếng là "Pop, cao dần nếu hái liên tiếp". Âm tích cực, theo bible §7 là "sáng, đi lên, ngắn". Âm này phải có **cao độ rõ** để game đẩy nốt lên dần, và hai biến thể phải **cùng nốt gốc**. Nếu khác nốt, chọn ngẫu nhiên biến thể sẽ làm chuỗi "cao dần" lên xuống lộn xộn.

Ghép 4 lớp:
1. **Rễ bật** (0–20 ms): 5–9 tiếng "tách" nhỏ dồn dập (nhiễu 1.2–6 kHz tắt sau ~1 ms) + "kéo" đất (nhiễu 250–1000 Hz phồng lên trong 10 ms).
2. **Pop** (bắt đầu ở 12 ms): sine vuốt nhanh từ ~0.5× lên đúng nốt đích (hằng số 7 ms), kiểu tiếng bật nút bần / bật môi, tắt sau 50–70 ms, thêm bồi âm 2 và 3 nhỏ để loa laptop vẫn nghe ra.
3. **Lớp nhạc cụ** (tùy biến thể): marimba dùi mềm hoặc glockenspiel cùng hợp âm Đô trưởng, nhỏ hơn pop. Đây là các nhạc cụ trong palette "thu hoạch".
4. **Đất rơi lại**: khoảng 10 hạt đất vụn thưa dần + 2 cục đất "bụp" mềm (150–700 Hz). Thêm vang rất ngắn (0.25 s, 7%).

### Gợi ý cho `game-dev`: thang cao dần

Nên dùng **thang ngũ cung Đô** để luôn hợp nhạc Vườn (Đô trưởng): detune `0, +200, +400, +700, +900, +1200` cent (Đô–Rê–Mi–Sol–La–Đô cao), giữ ở nấc cao nhất nếu hái tiếp, và reset khi ngừng hái khoảng 1–1.5 s. Ở +1200 cent, tiếng dài khoảng 0.17 s và có nốt C6, vẫn không chói. File `gia-lap-hai-4-cay-cao-dan.wav` dùng đúng 4 nấc đầu.

## Thông số SFX

```json
{"tool": "gen_folk_sfx.py", "recipe": "harvest_pop", "seed": 1, "variants": 4,
 "params": {
   "1": {"pop_to": 523.3, "pop_from": 0.55, "pop_dec": 0.055, "tone": "marimba", "tone_hz": 1046.5, "tone_amp": 0.35, "roots": 6, "root_amp": 0.80, "soil": 0.75, "dur": 0.34},
   "2": {"pop_to": 659.3, "pop_from": 0.55, "pop_dec": 0.050, "tone": "glock",   "tone_hz": 1568.0, "tone_amp": 0.22, "roots": 5, "root_amp": 0.70, "soil": 0.65, "dur": 0.34},
   "3": {"pop_to": 523.3, "pop_from": 0.50, "pop_dec": 0.060, "tone": null,      "tone_hz": 0,      "tone_amp": 0,    "roots": 9, "root_amp": 1.00, "soil": 1.00, "dur": 0.36},
   "4": {"pop_to": 392.0, "pop_from": 0.55, "pop_dec": 0.060, "tone": "marimba", "tone_hz": 784.0,  "tone_amp": 0.40, "roots": 7, "root_amp": 0.85, "soil": 0.85, "dur": 0.36}},
 "chosen_proposal": {"hai-cay-1": "harvest_pop v1 (--rms -16.3 --limit)", "hai-cay-2": "harvest_pop v3 (--rms -16.1)"},
 "backup": "harvest_pop v2 (E5; nếu chọn thì gen lại ở C5 để cùng nốt gốc)"}
```

(Bảng `HARVEST_POP` trong `tools/gen_folk_sfx.py` là nguồn thật.)

## Lệnh

```
.venv/Scripts/python tools/gen_folk_sfx.py --recipe harvest_pop --variants 4 --seed 1 --out audio-source/raw/T-003-sfx/harvest_pop/candidates --prefix ung-vien
.venv/Scripts/python tools/audio_tools.py process audio-source/raw/T-003-sfx/harvest_pop/candidates/ung-vien-1.wav audio-source/raw/T-003-sfx/hai-cay-1.wav --mono --trim --rms -16.3 --limit
.venv/Scripts/python tools/audio_tools.py process audio-source/raw/T-003-sfx/harvest_pop/candidates/ung-vien-3.wav audio-source/raw/T-003-sfx/hai-cay-2.wav --mono --trim --rms -16.1
# Sau khi người dùng duyệt:
cp audio-source/raw/T-003-sfx/hai-cay-1.wav web/client/public/assets/audio/sfx/hai-cay-1.wav
cp audio-source/raw/T-003-sfx/hai-cay-2.wav web/client/public/assets/audio/sfx/hai-cay-2.wav
```

## Số liệu

(Cột giống [AUD-SFX-101](AUD-SFX-101.md). "Rễ" = peak phần trên 1.2 kHz trong 25 ms đầu, "Đất" = peak phần trên 1.2 kHz từ 60 ms trở đi.)

| File | Dài | Peak | RMS | To A | Tâm phổ | 150–700 | 700–2k | Cao độ (độ rõ) | Rễ | Đất |
|---|---|---|---|---|---|---|---|---|---|---|
| Cuốc `cuoc-dat-1/2` (tham chiếu) | 0.36/0.38 | −1.0 | −14.0/−12.7 | −13.0/−12.3 | 652/566 Hz | 55/43% | 15/14% | không rõ (20 dB) | | |
| Tưới `tuoi-nuoc-1/2` (tham chiếu) | 0.60 | −1.0 | −16.9/−16.1 | −14.3/−13.2 | 1283/1373 Hz | 4/2% | 87/90% | | | |
| Ứng viên 1 (thô) | 0.38 s | −1.0 | −17.7 | −14.9 | 634 Hz | 84% | 15% | 522 Hz C5 −4 cent (49 dB) | −6.5 | −19.7 |
| Ứng viên 2 (thô) | 0.38 s | −1.0 | −15.9 | −11.9 | 779 Hz | 84% | 14% | 658 Hz E5 −3 cent (48 dB) | −5.7 | −12.4 |
| Ứng viên 3 (thô) | 0.38 s | −1.0 | −15.6 | −13.0 | 619 Hz | 90% | 7% | 522 Hz C5 −4 cent (40 dB) | −3.6 | −12.9 |
| Ứng viên 4 (thô) | 0.40 s | −1.0 | −17.4 | −15.4 | 556 Hz | 65% | 34% | 392 Hz G4 −2 cent (44 dB) | −10.8 | −15.7 |
| **hai-cay-1** (ƯV 1, đã xử lý) | 0.34 s | −1.0 | −16.7 | −14.4 | 650 Hz | 82% | 16% | C5 −4 cent (49 dB) | | |
| **hai-cay-2** (ƯV 3, đã xử lý) | 0.35 s | −1.8 | −16.1 | −13.9 | 613 Hz | 90% | 7% | C5 −4 cent (40 dB) | | |

Cặp đề xuất có độ to cảm nhận ngang tiếng tưới (−14), thấp hơn cuốc khoảng 1.5 dB. Cao độ rõ gấp đôi cuốc (40–49 dB so với 20 dB).

## Nhật ký

| Ngày | Lần | Thay đổi | Kết quả | Chọn |
|---|---|---|---|---|
| 2026-10-10 | 1 | Công thức mới `harvest_pop` 4 lớp, 4 biến thể | Cao độ rõ nhưng rễ/đất quá nhỏ (2–5 kHz ≤ 1%), nốt hụt ~12 cent, v4 dài 0.46 s | — |
| 2026-10-10 | 2 | Rễ ×1.7, đất ×1.8, vuốt pop nhanh hơn (10 → 7 ms), cắt vang đúng độ dài | Nốt lệch ≤ 4 cent, dài 0.38–0.40 s (0.34–0.35 s sau trim), rễ −3.6…−10.8 dB | Đề xuất v1 + v3 (cùng C5, chờ duyệt) |
