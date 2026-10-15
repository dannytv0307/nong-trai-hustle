# Lô 1 Vườn — SFX, giọng, nền, UI tổng hợp (card gộp, T-025)

| Mục | Giá trị |
|---|---|
| Loại | SFX / giọng / AMB / UI / JNG-002 |
| Cách tạo | Tổng hợp — `tools/gen_folk_sfx.py --seed 1` (26 công thức mới, mục "T-025: Lô 1 Vườn" trong script). 0 USD |
| Kênh | mono 44.1 kHz (nền AMB: stereo) |
| Ứng viên thô | `audio-source/raw/T-025/<công thức>/ung-vien-<v>.wav` (gitignore) |
| File trong game | `web/client/public/assets/audio/{sfx,ui}/…` — bản **đề xuất**, chưa gắn vào game (T-026) |
| Trạng thái | **Approved** (người dùng nghe 2026-10-15) — cả phần tổng hợp, bộ gà 6 kiểu từ bản ghi thật và 9 âm CC0 / Public domain (vòng 3) |

## Bảng âm

"To A" = độ to cảm nhận gần đúng (RMS trọng số A, cửa sổ 100 ms to nhất, dB). Mốc so sánh: cuốc `cuoc-dat-1` To A −13.0, nhặt xu `nhat-xu-1` −10.1, nhạc Vườn −12.7.

| ID | Âm (mô tả) | Công thức · ứng viên chọn | File game | Dài | Peak | To A | Dự phòng (nghe so sánh) |
|---|---|---|---|---|---|---|---|
| AUD-SFX-103 | Nhát cuốc chốt: "phập" cuốc đầy hơn + "thụp" trầm sâu + đất vỡ tung + cục đất rơi lả tả | `hoe_finish` v1, v2 | `sfx/cuoc-chot-1/2.wav` | 0.52 / 0.53 s | −1.0 | −10.3 / −10.6 (to hơn cuốc thường ~2.5 dB) | v3: thêm 1 nốt marimba Đô trầm báo "xong" |
| AUD-SFX-104a | Cây héo "phù": hơi xì (dải trượt xuống) + nốt tụt mềm Si4 → Si3 + lá rũ | `wither` v1 | `sfx/cay-heo.wav` | 0.60 s | −1.9 | −14.0 | v2: nốt tụt nhỏ hơn, hơi nhiều hơn |
| AUD-SFX-104b | Dọn cây héo: thân khô gãy "rắc" + lá khô sột soạt + vứt "phịch" | `clear_wither` v1, v2 | `sfx/don-cay-heo-1/2.wav` | 0.43 / 0.44 s | −1.0 / −2.0 | −15.8 / −15.1 | — |
| AUD-SFX-105 | Ăn "nhồm nhoàm": 3 tiếng nhai giọng mũi (n-ồ-m / nh-oà-m) + "chóp" ướt; v2 thêm giòn "rộp" | `eat` v1, v2 | `sfx/an-nhom-nhoam-1/2.wav` | 0.62 / 0.56 s | −3.5 / −1.5 | −14.0 | — (r: giọng tổng hợp) |
| AUD-SFX-106 | Bụng réo "ọc ọc": 2 tiếng ọc trầm rè + bọt trầm | `stomach` v1 | `sfx/bung-reo.wav` | 1.02 s | −1.4 | −14.0 | v2: tiếng ọc thứ hai đi lên (như hỏi "ọc?") |
| AUD-SFX-107 | Ngáp dài "hà–ááá–ồm" | `yawn` v1 | `sfx/voice-ngap.wav` | 1.43 s | −6.0 | −14.9 | v2: ngắn hơn, thấp hơn (r) |
| AUD-SFX-108 | Ngáy "khò… phù…" 2 nhịp, đầu/cuối lặng → lặp được | `snore` v1 | `sfx/voice-ngay.wav` | 2.53 s | −4.9 | −17.0 | v2: thở ra có huýt nhẹ (hài hơn) (r) |
| AUD-SFX-109 (vòng 2) | **Bộ gà gáy "lầy" theo ngày** — chung: giọng formant sáng 12 bồi âm + rè AM ~55 Hz, bão hòa nhẹ, vang xa (rt 0.8, mix 0.22) + vài tiếng chim sẻ khẽ | `rooster_fun` v1–6 | `sfx/ga-gay-<kiểu>.wav` | 1.88–2.78 s | −3.0…−9.0 | −13.0 (cả 6) | vòng 1: `rooster` v1–v3 (bỏ khỏi game) |
| ↳ `binh-thuong` | "ò – ó – o – oooo" đủ hơi, câu cuối rướn lên rồi buông, có rung nhẹ | v1 | `ga-gay-binh-thuong.wav` | 1.88 s | −9.0 | −13.0 | |
| ↳ `tac-hong` | gáy 3 tiếng đầu bình thường, tiếng dài rướn lên rồi **tắt cụt**, im 0.15 s, "ặc" (rè bị bóp, tụt giọng + tiếng họng đóng), rồi ho "khục khục khục" nhỏ dần | v2 | `ga-gay-tac-hong.wav` | 2.21 s | −7.6 | −13.0 | |
| ↳ `khan` | thấp hơn ~18%, rè mạnh + bán điều hòa (tiếng vỡ đôi), hơi nhiều; tiếng dài **đứt hơi 2 lần** rồi tụt giọng, kết bằng "khè" hết hơi | v3 | `ga-gay-khan.wav` | 2.24 s | −3.0 | −13.0 | |
| ↳ `vo-giong` | đang gáy thì **vỡ giọng vọt lên quãng tám** (~1.7 kHz, formant cao, rung nhanh 9 Hz) rồi rơi phịch về thấp | v4 | `ga-gay-vo-giong.wav` | 1.94 s | −8.3 | −13.0 | |
| ↳ `ngai-ngu` | chậm ×1.45, thấp hơn, 3 tiếng đầu nhỏ uể oải; tiếng dài trượt xuống và khép miệng thành **ngáp "oáp…"** | v5 | `ga-gay-ngai-ngu.wav` | 2.67 s | −5.3 | −13.0 | |
| ↳ `gay-lai` | "ò ó—ặc", ho 1 tiếng, lấy hơi, rồi **gáy lại đủ câu** (nhanh hơn chút) | v6 | `ga-gay-gay-lai.wav` | 2.78 s | −8.5 | −13.0 | |
| AUD-SFX-110 | Nấu bếp rơm: lửa bùng "phừng" + lách tách + xèo | `cook` v1 | `sfx/nau-bep.wav` | 1.50 s | −1.6 | −16.0 | v2: xèo to hơn |
| AUD-SFX-118 | Đếm tiền "tách": xu chạm khẽ, 2 cao độ | `count_tick` v1, v2 | `sfx/dem-tien-1/2.wav` | 0.09 s | −3.1 / −3.3 | −17.1 | v3, v4: hạt bàn tính gỗ (ấm, trầm hơn) |
| AUD-SFX-121 | Sấm xa "ì ầm" nhiều đợt, vào mềm; v2 có tiếng "rạch" đầu gần hơn | `thunder` v1, v2 | `sfx/sam-xa-1/2.wav` | 2.69 / 2.48 s | −1.0 | −19.9 / −19.8 | — |
| AUD-SFX-111 | Bước chân đất nện ×3, cỏ ×3 (đất nện dùng cho qua cổng / cửa) | `footstep` v1–3, v4–6 | `sfx/buoc-dat-1..3.wav`, `sfx/buoc-co-1..3.wav` | 0.14–0.15 s | −1.4…−6.7 | −21.0 (đều nhau) | — |
| AUD-SFX-115 | Cửa nhà {ten}: v1 **vào** (kẹt lên giọng + liếp tre lạch cạch + 2 bước), v2 **ra** (bước + kẹt xuống giọng + khép "cộc") | `door` v1, v2 | `sfx/cua-nha-vao.wav`, `sfx/cua-nha-ra.wav` | 0.71 / 0.66 s | −1.1 / −1.2 | −15.5 | — |
| AUD-SFX-116 (mới) | Rương gỗ: mở (bản lề kẹt ngắn + nắp tựa "cộc"), đóng (kẹt ngắn + nắp sập "cộp") | `chest` v1, v2 | `sfx/ruong-mo.wav`, `sfx/ruong-dong.wav` | 0.35 / 0.25 s | −3.8 / −2.5 | −16.0 | — |
| AUD-SFX-112 | Đóng cọc rào "cộc cộc cộc", nhát sau chắc dần | `fence` v1 | `sfx/dong-coc.wav` | 0.77 s | −1.0 | −15.3 | — |
| AUD-SFX-113 | Bỏ đồ vào / lấy ra thúng bán "bịch" (+ nan tre lạo xạo) | `basket_drop` v1, v2 | `sfx/thung-bich-1/2.wav` | 0.15 s | −1.0 | −18.0 / −18.2 | — |
| AUD-JNG-002 | Xong nhiệm vụ: con dấu "cộp" + chiêng "bùng" + marimba Đô–Mi–Sol + "ting" glockenspiel | `quest_done` v1 | `sfx/xong-nhiem-vu.wav` | 1.97 s | −1.0 | −11.0 | v2: chiêng cao hơn (La) |
| AUD-AMB-001 | Mưa trên lá + mái rạ (nền xào xạc + giọt trên lá + "lộp" trên rạ), stereo | `rain` v1 → `loop --crossfade 2 --rms -30` | `sfx/amb-mua.wav` | 20.0 s loop | −14.4 | RMS −30 | — |
| AUD-AMB-011 | Nền trong nhà: bếp rơm lách tách khẽ + lửa thì thầm + gió lùa vách; bản đêm thêm dế ngoài sân | `indoor` v1, v2 → `loop … --rms -32` | `sfx/amb-trong-nha.wav`, `sfx/amb-trong-nha-dem.wav` | 14.0 s loop | −11.4 / −10.9 | RMS −32 | — |
| AUD-UI-001 | Click nút: gõ gỗ + marimba ngắn (Đô6 / Sol5) | `ui_click` v1, v2 | `ui/click-1/2.wav` | 0.09 s | −5.0 | −19.2 | — |
| AUD-UI-002 | Hover nút: "tích" rất khẽ (Đô7) | `ui_hover` v1 | `ui/hover.wav` | 0.04 s | −9.0 | −19.9 | — |
| AUD-UI-003 | Mở cửa sổ: giấy điệp "sột" trượt lên + gõ gỗ | `ui_open` v1 | `ui/mo-cua-so.wav` | 0.14 s | −5.0 | −18.5 | — |
| AUD-UI-004 | Đóng cửa sổ: gõ gỗ trầm hơn + giấy trượt xuống | `ui_close` v1 | `ui/dong-cua-so.wav` | 0.12 s | −5.0 | −19.6 | — |
| AUD-UI-005 | Lỗi / không được: mõ trầm nhỏ "cộc" | `ui_error` v1 | `ui/loi.wav` | 0.12 s | −5.0 | −19.6 | v2: "cộc-cộc" đi xuống (rõ nghĩa "không" hơn) |
| AUD-UI-006 | Đổi ô hotbar: tick gỗ khô | `ui_tick` v1 | `ui/doi-o.wav` | 0.04 s | −6.0 | −19.4 | — |
| AUD-UI-007 | Kéo thả món: nhấc "pụt" đi lên / thả "bụp" đi xuống | `ui_pick` v1, v2 | `ui/nhac-mon.wav`, `ui/tha-mon.wav` | 0.08 s | −6.0 | −20.4 / −18.9 | — |

Không có clip (0 mẫu chạm 0 dBFS) ở mọi file. Mọi SFX mono, UI < 150 ms.

## Nguyên tắc mức âm (audio bible §7–8, chi tiết thêm)

- Chuẩn hóa theo **độ to cảm nhận** (To A) chứ không chỉ peak, để tiếng ngắn nhọn (xu, gỗ) và tiếng dày (ăn, bụng réo) nghe cân nhau: phản hồi gameplay nổi bật −10…−14, tiếng phụ / môi trường −15…−18, lặp nhiều (bước chân, đếm tiền) −17…−21, UI ≈ −19 (peak −5), nền AMB RMS −30…−32 (dưới nhạc RMS −18).
- Tiếng nhiều đỉnh nhọn (ngáy, nấu, cửa, rương đóng, cọc, thúng) đạt To A bằng limiter nhìn trước 5 ms (`audio_tools.limit_to_rms`) thay vì hạ cả tiếng.
- Giọng (ngáp, ngáy) giữ dưới SFX: ngáp peak −6; ngáy peak −4.9 (GDD ghi "ngáy to" nên To A −17, cao hơn giọng càu nhàu).
- Sấm: 60% năng lượng dưới 150 Hz (bản chất sấm xa), đã thêm lớp 150–700 Hz để loa laptop nghe được "ì ầm"; trên loa laptop sẽ nhỏ, đúng ý "sấm xa".

## Thông số SFX

```json
{"tool": "gen_folk_sfx.py", "seed": 1,
 "variants": {"hoe_finish": 3, "wither": 2, "clear_wither": 2, "eat": 2, "stomach": 2, "yawn": 2, "snore": 2,
              "rooster": 3, "cook": 2, "count_tick": 4, "thunder": 2, "rain": 1, "indoor": 2, "footstep": 6,
              "door": 2, "chest": 2, "fence": 1, "basket_drop": 2, "quest_done": 2, "ui_click": 2, "ui_hover": 1,
              "ui_open": 1, "ui_close": 1, "ui_error": 2, "ui_tick": 1, "ui_pick": 2},
 "rooster_fun_round2": {"ga-gay-binh-thuong": "v1", "ga-gay-tac-hong": "v2", "ga-gay-khan": "v3", "ga-gay-vo-giong": "v4", "ga-gay-ngai-ngu": "v5", "ga-gay-gay-lai": "v6", "target_toa_db": -13},
 "chosen_proposal": {"cuoc-chot-1/2": "hoe_finish v1/v2", "cay-heo": "wither v1", "don-cay-heo-1/2": "clear_wither v1/v2",
   "an-nhom-nhoam-1/2": "eat v1/v2", "bung-reo": "stomach v1", "voice-ngap": "yawn v1", "voice-ngay": "snore v1",
   "ga-gay (vòng 1, đã bỏ)": "rooster v2", "nau-bep": "cook v1", "dem-tien-1/2": "count_tick v1/v2", "sam-xa-1/2": "thunder v1/v2",
   "buoc-dat-1..3": "footstep v1-3", "buoc-co-1..3": "footstep v4-6", "cua-nha-vao/ra": "door v1/v2",
   "ruong-mo/dong": "chest v1/v2", "dong-coc": "fence v1", "thung-bich-1/2": "basket_drop v1/v2",
   "xong-nhiem-vu": "quest_done v1", "amb-mua": "rain v1", "amb-trong-nha(-dem)": "indoor v1/v2",
   "ui/*": "ui_click v1/v2, ui_hover, ui_open, ui_close, ui_error v1, ui_tick, ui_pick v1/v2"},
 "loudness_target_toa_db": {"cuoc-chot": "peak -1", "cay-heo": -14, "don-cay-heo": -15, "an-nhom-nhoam": -14,
   "bung-reo": -14, "voice-ngap": "peak -6", "voice-ngay": "-17 (limiter, trần -3)", "ga-gay": -13,
   "nau-bep": "-16 (limiter)", "dem-tien": -17, "sam-xa": "peak -1", "buoc": -21, "cua-nha": "-15.5 (limiter)",
   "ruong-mo": -16, "ruong-dong": "-16 (limiter)", "dong-coc": "-15 (limiter)", "thung-bich": "-18 (limiter)",
   "xong-nhiem-vu": "peak -1", "ui": "peak -5 (hover -9, doi-o / keo-tha -6)", "amb": "RMS -30 / -32 (loop)"}}
```

(Hàm `r_<tên>` trong `tools/gen_folk_sfx.py` là nguồn thật; card này không đọc bằng `gen_sfx.py --card`.)

## Lệnh

```
# Ứng viên (vd. cửa nhà, 2 biến thể):
.venv/Scripts/python tools/gen_folk_sfx.py --recipe door --variants 2 --seed 1 --out audio-source/raw/T-025/door --prefix ung-vien
# Hậu kỳ một tiếng: mono + cắt lặng + chuẩn hóa (peak hoặc --rms … --limit cho tiếng cần đạt độ to bằng limiter)
.venv/Scripts/python tools/audio_tools.py process audio-source/raw/T-025/door/ung-vien-1.wav web/client/public/assets/audio/sfx/cua-nha-vao.wav --mono --trim --rms -16 --limit
# Nền lặp:
cd tools && ../.venv/Scripts/python audio_tools.py loop ../audio-source/raw/T-025/rain/ung-vien-1.wav ../web/client/public/assets/audio/sfx/amb-mua.wav --crossfade 2 --rms -30
```

Mức To A ở bảng trên đo bằng script phân tích tạm (A-weighting, cửa sổ 100 ms); khi làm lại chỉ cần chỉnh `--rms` cho tới khi To A khớp bảng.

## Nhật ký

| Ngày | Lần | Thay đổi | Kết quả | Chọn |
|---|---|---|---|---|
| 2026-10-15 | 1 | 26 công thức mới cho Lô 1 (T-025), 53 ứng viên | Sấm lần đầu 78% năng lượng < 150 Hz (laptop gần như mất) → thêm lớp 150–700 Hz (còn 60%). Dọn cây héo / nấu bếp > 5 kHz tới 21–33% → hạ lọc trên (còn 9–27%) | Đề xuất như bảng, chờ người dùng nghe |
| 2026-10-15 | 2 | Người dùng nghe: chấp nhận cả lô, riêng gà gáy "làm lầy hơn, mỗi ngày một kiểu: bình thường / tắc họng / khàn" → công thức `rooster_fun` 6 kiểu (thêm vỡ giọng, ngái ngủ, gáy lại), chuẩn hóa cùng To A −13 (chỉ đổi âm lượng, không cần limiter; peak −3…−9) | 6 file 1.9–2.8 s, 0 clip; chim sẻ chỉ hót trong 55% đầu để file không kéo dài | Chờ người dùng nghe bộ gà |
| 2026-10-15 | 3 | Người dùng: gà tổng hợp "không giống gà"; đồng ý dùng bản ghi CC0 / Public domain (D-039) | Gà: 6 kiểu từ bản ghi thật; 9 âm "thật" khác thay bằng CC0 (bảng Vòng 3) | Chờ nghe |

## Vòng 3 — bản ghi thật CC0 / Public domain (D-039)

Công cụ: `tools/make_rooster_real.py` (gà), `tools/make_cc0_lot1.py` (còn lại) — chỉ numpy: cắt, ghép, phát nhanh/chậm (varispeed), WSOLA kéo dài, lọc, cổng nhiễu, bão hòa, chuẩn To A. Nguồn chi tiết: [credits.md](../credits.md). Bản tổng hợp cũ: `audio-source/raw/<ID>/tong-hop-cu/` (gà vòng 2: `raw/T-025/rooster_fun/game-v2-tong-hop/`).

| File game | Làm thế nào | Dài | Peak | To A |
|---|---|---|---|---|
| `ga-gay-binh-thuong` | Medium rooster crowing (alys) cắt nguyên câu gáy 2.86–5.40 s, lọc < 180 Hz, vang sân nhẹ | 2.71 s | −7.8 | −13.0 |
| `ga-gay-tac-hong` | gáy tới giữa tiếng dài thì cắt cụt → "ặc" (lát 70 ms bóp cao độ tụt + bão hòa) → ho "khục" ×3 nhỏ dần (tiếng gà mái cục tác trong cùng bản ghi, hạ cao độ + bão hòa) | 2.44 s | −8.2 | −13.0 |
| `ga-gay-khan` | hạ ~3 nửa cung rồi tụt dần (0.86 → 0.66), rè (điều biên nhiễu 20–90 Hz + bão hòa + bitcrush mỏng 11 kHz/7 bit), 2 chỗ đứt hơi, kết "khè" | 2.98 s | −8.4 | −13.0 |
| `ga-gay-vo-giong` | tiếng dài đang gáy vọt lên ×1.85–1.95 (≈ quãng tám, rung 9 Hz) trong 0.3 s rồi rơi xuống ×0.72 | 2.12 s | −7.9 | −13.0 |
| `ga-gay-ngai-ngu` | WSOLA kéo dài ×1.18 + phát chậm 0.86 → 0.55 (trầm dần như ngáp), to dần rồi nhỏ dần | 3.27 s | −7.7 | −13.0 |
| `ga-gay-gay-lai` | "ò ó—ặc" + ho 1 tiếng + nghỉ, rồi gáy lại đủ câu (×1.06) | 3.13 s | −8.0 | −13.0 |
| `voice-ngap` | Yawning twice (ezwa) tiếng ngáp thứ 2 (2.88–5.15 s), cổng nhiễu | 1.96 s | −6.0 | −15.4 |
| `voice-ngay` | Ronflements (Joseph Sardin, CC0): 2 tiếng ngáy, nghỉ 0.6 s, đầu/cuối lặng → lặp được | 3.80 s | −3.0 | −17.2 |
| `an-nhom-nhoam-1/2` | 3 nhát nhai ướt (Chewing gum mouth open) ghép sát nhịp ~0.19 s + lớp "rộp" (Crunching munching grinding), lọc < 220 Hz, cổng nhiễu | 0.44 / 0.61 s | −1.0 | −14.7 / −15.0 |
| `sam-xa-1/2` | Rain and thunder 2.6–7.6 s / Thunder and rain on a veranda 6.6–12.0 s, fade-in 0.15 s, fade-out 1.5 s (có mưa lẫn) | 4.95 / 5.36 s | −1.0 | −17.0 |
| `amb-mua` | Rain on a veranda 0–13 s, stereo giả (2 kênh lệch 0.4 s), loop crossfade 2 s, limiter vòng tròn | 10.6 s | −16.1 | RMS −30 |
| `nau-bep` | đoạn 1.5 s lửa rơm bùng mạnh nhất của Dry grass burning (lọc 150–8000 Hz, fade-in) + lớp xèo tổng hợp cũ 30% | 1.50 s | −1.1 | −16.0 |
| `amb-trong-nha(-dem)` | 16 s lửa thật (lọc 120–7000 Hz, stereo giả) + lớp tổng hợp cũ 50% (gió lùa; bản đêm có dế), loop 2 s, limiter trần −3 | 13.7 s | −3.0 | RMS −32 |
| `cua-nha-vao` | Squeaky door: tiếng kẹt mở 4.6–5.15 s + 2 bước `buoc-dat` | 0.80 s | −6.8 | −15.5 |
| `cua-nha-ra` | 2 bước `buoc-dat` + kẹt khép + sập "cạch" 6.55–7.32 s | 0.97 s | −2.7 | −15.5 |
| `ruong-mo` / `ruong-dong` | cùng bản ghi cửa, phát nhanh ×1.3 (bản lề nhỏ): kẹt mở / kẹt + sập | 0.27 / 0.33 s | −7.0 / −2.5 | −16.0 |

Giữ tổng hợp (lý do): **bụng réo** (không tìm được bản ghi CC0), **dế** đêm (không có CC0 trên Commons), **bước chân** đất/cỏ (tiếng nhỏ, lặp nhiều, bản tổng hợp đạt; bản CC0 sỏi / lá khô bị chặn tải 429 và không đúng nền), **lá khô / dọn cây héo**, **thúng**, **cọc rào**, **cuốc**, **gieo / hái / tưới** (đã duyệt từ trước), **UI, xu, jingle** (âm "game", D-039 giữ tổng hợp).

Nhật ký: 2026-10-15 — người dùng nghe vòng 3: "oke ổn rồi" → Approved toàn bộ.
