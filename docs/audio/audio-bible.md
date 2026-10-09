# Audio Bible — Bride Price Hustle

> Chủ sở hữu: `audio-director` · Trạng thái style: **ĐÃ KHÓA** (bước 2.3, D-018)
> **Hướng: V1 "Ukulele vui nhún"**: nhạc game nông trại casual/cartoon tươi sáng, năng lượng cao, **điểm xuyết** chất làng Việt (mõ, sáo trúc, đàn bầu). Người dùng đã nghe và chọn; hướng "nhạc cụ dân tộc" (A) bị loại vì nghe hoài cổ, thiếu vui.
> **Bản mẫu chuẩn (sound anchor):** `audio-source/raw/AUD-MUS-001/final.wav` (nhạc Vườn, Lyria seed 1201). Nếu chữ trong prefix và bản mẫu lệch nhau thì theo bản mẫu.
> Lịch sử thử nghiệm (A/B/C, V1–V3) và số liệu: `audio-source/raw/sound-test/directions.md`.

## 1. Bản sắc âm thanh

**Vui · nảy · tươi · tinh nghịch · điểm xuyết chất làng**

Hình là tranh Đông Hồ mộc mạc, tiếng là nhạc game hiện đại vui nhún. Hai thứ trái nhau một chút, và chính chỗ đó tạo ra cái "lầy". Chất Việt chỉ là **gia vị**: vài tiếng mõ gõ đúng lúc hỏng việc, một câu sáo hay đàn bầu luyến trêu. Không để chất truyền thống chiếm chủ đạo, tránh mood hoài cổ / trầm buồn / chậm.

## 2. Công cụ

| Loại | Công cụ | Ghi chú |
|---|---|---|
| Nhạc nền, jingle, stinger có giai điệu | Lyria (`lyria-002`, Vertex AI) — `tools/gen_music.py` | Nhạc không lời, ~32 s/clip, WAV 48 kHz stereo; ≈ 0.08 USD/clip. `-n N` = N lần gọi với seed `seed, seed+1…` |
| SFX gõ / va / tiếng động, giọng càu nhàu | `tools/gen_folk_sfx.py` (modal + additive) | Marimba, glockenspiel, vỗ tay, xu, mõ, trống, chũm chọe, chiêng, nước, giọng. Miễn phí; tái tạo bằng `--recipe … --seed …` |
| UI đơn giản (click, tap) | `tools/gen_sfx.py` | sine/triangle + lowpass, không dùng square |
| Hậu kỳ | `tools/audio_tools.py` | `info` / `process` / `loop` (`--limit`: đạt đúng RMS bằng limiter; với loop limiter vòng tròn qua chỗ nối) |
| Thư viện ngoài (CC0) | Không dùng | Chưa có sự đồng ý của người dùng |

## 3. Instrument palette

| Vai trò | Nhạc cụ | Ghi chú |
|---|---|---|
| Nền hòa âm, nhịp | **Ukulele** (gảy/quạt) | Chữ ký của game |
| Riff | **Marimba** (+ xylophone) | Cũng là âm sắc SFX tích cực |
| Giai điệu | **Huýt sáo / whistle lead** | Dễ nhớ, vui |
| Lấp lánh | **Glockenspiel** | Tiền, lên level, thu hoạch |
| Nhịp | **Bass nảy**, **vỗ tay + cajon** | Bass giữ gọn (xem §10) |
| Màu Việt (điểm xuyết) | **Mõ gỗ** nhấn hài; **sáo trúc** hoặc **đàn bầu** vài câu luyến | Tối đa 1 nhạc cụ Việt nổi bật trong mỗi track |
| Meme / stinger | Trống cái, chũm chọe, chiêng, mõ, đàn bầu, nhị | Nhóm "dân tộc" chỉ dùng cho meme (D-017) |

## 4. Hòa âm

| Mục | Giá trị |
|---|---|
| Key chung | **Đô trưởng (C major)** cho nhạc ngày, jingle, SFX có cao độ (lên level C–E–G–C). Khu khác có thể dùng Sol / Fa trưởng (cách quãng 4/5, chuyển cảnh không chõi) |
| Dải BPM | Nhạc ngày **110–128** (Vườn 120). Mood phụ (đêm / trong nhà / tổng kết ngày) **85–100** |

**Mood phụ** (đêm, trong nhà, tổng kết ngày): **cùng palette**, chậm và êm hơn. Ukulele gảy thưa, marimba mềm, whistle hoặc sáo trúc thong thả, bỏ cajon/claps hoặc chỉ gõ rất nhẹ, bass ít. Vẫn trưởng và ấm, không buồn. (Không dùng hướng lo-fi B cũ.)

## 5. MUSIC_STYLE_PREFIX (dán nguyên văn vào mọi prompt Lyria)

```
Upbeat, bright, modern casual farming game music in a catchy cartoon style, sunny and funny, with one small Vietnamese folk instrument accent for local color.
```

Sau prefix, ghi rõ: mục đích, mood, `Tempo N BPM, <key>`, nhạc cụ trong palette (nêu đúng 1 màu Việt). Kết bằng một trong hai dòng:
- Loop: `Steady loopable groove, consistent high energy, no intro, no ending, no big build-ups. Instrumental, clean bright mix, not bass-heavy, balanced for laptop speakers and headphones.`
- Jingle / stinger: `Short jingle with a clear ending. Instrumental, clean bright mix, not bass-heavy, balanced for laptop speakers and headphones.`
- Mood phụ: thay `consistent high energy` bằng `calm, gentle, low energy`.

## 5a. NEGATIVE

```
vocals, singing, speech, choir, sad, melancholic, nostalgic, slow, ballad, dark, epic orchestra, heavy drums, distortion, EDM drop
```
(Mood phụ: bỏ `slow`.) Không đưa tên nghệ sĩ, bài hát, thương hiệu, tên meme vào prompt.

## 6. SFX profile

- **Phản hồi tích cực**: tươi, sáng, đi lên; marimba + glockenspiel + xu, có thể kèm vỗ tay. Ví dụ `levelup_bright`, `coin_bright`.
- **Hành động** (cuốc, tưới, chặt…): tiếng động thật, ngắn, có lớp dải giữa để loa laptop nghe được. Ví dụ `hoe`, `water`.
- **Tiêu cực / hài**: mõ "cốc", đàn bầu luyến xuống, trống trầm; buồn cười, không chói. Ví dụ `frown`.
- **Meme**: nhóm gõ dân tộc tổng hợp (`damn`, `oidoioi`). Meme có giai điệu (đàn bầu tụt, nhị khóc, sáo lãi/lỗ, kèn trống cưới) → **jingle Lyria ngắn có kết** theo prefix trên, cắt 1–3 s (chặng 4).
- **Giọng**: `grumble`, peak −6.

Công thức đã dùng (`--seed 1`): `levelup_bright` v2, `coin_bright` v1+v2, `hoe` v1+v2, `water` v1+v2, `frown` v2, `damn` v2, `oidoioi` v1, `grumble` v1+v2.

```json
{"seed": 1, "gameplay_peak_db": -1, "voice_peak_db": -6, "ui_peak_db": -5,
 "ui_default": {"wave": "triangle", "lowpass": 5000, "attack": 0.001, "decay": 0.05}}
```

## 7. Ngôn ngữ âm thanh & phân cấp mix

- **Tích cực** (tiền, thu hoạch, lên level, xong việc): sáng, đi lên, ngắn; glockenspiel/marimba.
- **Tiêu cực** (hỏng việc, bố vợ nhăn, mất tiền): trầm, đi xuống, **buồn cười chứ không đáng sợ**: mõ, đàn bầu, trống trầm.
- **Meme**: đậm nhất, dài được tới ~3 s nhưng hiếm (≤ 4/ngày game). Luôn tạo mới (D-016, D-017).
- **UI**: < 150 ms, gỗ/marimba nhẹ.
- **Thứ tự âm lượng**: meme & phản hồi gameplay (peak −1) > giọng (−6) ≈ UI (−4…−6) > nhạc nền (RMS −18).
- Âm phát thường xuyên (xu, cuốc, tưới, càu nhàu) có 2 biến thể + random pitch ±4% trong game.

## 8. Thông số kỹ thuật

| Loại | File trong game | Kênh | Mức | Độ dài | Định dạng web |
|---|---|---|---|---|---|
| Nhạc | `web/client/public/assets/audio/music/*.wav` | stereo | RMS −18 dBFS, peak ≤ −1 | loop ~30 s | OGG + MP3 (stream) |
| SFX | `web/client/public/assets/audio/sfx/*.wav` | mono | peak ≈ −1 dBFS | < 1 s (lên level ≤ 2 s, meme ≤ 3 s) | OGG + MP3 |
| Giọng | `web/client/public/assets/audio/sfx/voice-*.wav` | mono | peak −6 dBFS | < 0.6 s | OGG + MP3 |
| UI | `web/client/public/assets/audio/ui/*.wav` | mono | peak −4 đến −6 dBFS | < 150 ms | OGG + MP3 |

Tên file: chữ thường, gạch nối. Khi `web/client/` chưa có thì file cuối nằm tạm ở `audio-source/raw/<ID>/final.wav` (+ `final-2.wav` cho biến thể). **Thư mục này bị gitignore**: bước 3.1 phải chuyển vào `web/client/public/assets/audio/` (xem `audio-list.md`).

## 9. Pipeline

1. Prompt card `docs/audio/prompts/<ID>.md`.
2. Gen → `audio-source/raw/<ID>/` (giữ bản gốc + log JSON có seed).
   - Nhạc: `gen_music.py --card … --name <ID> -n 2` (2 lần gọi ≈ 0.16 USD; tối đa ~3 vòng/track).
   - SFX: `gen_folk_sfx.py --recipe … --seed … --variants 2 --out audio-source/raw/<ID>`.
3. Đo (`audio_tools.py info`, năng lượng trầm, độ đều), người dùng nghe chọn.
4. Hậu kỳ: nhạc `loop <in> <out> --crossfade 2 --rms -18 --limit`; SFX `process --mono --trim --peak -1` (giọng `--peak -6`).
5. `game-dev` gắn vào game, random pitch, chuyển OGG/MP3 khi build.

## 10. Giới hạn & lưu ý đã biết

- **Bass khá nhiều**: bản mẫu có 43% năng lượng dưới 150 Hz, dù prompt ghi "not bass-heavy". Kiểm trên **loa laptop** (dưới ~150 Hz gần như mất). Nếu nhạc khu sau bị đục thì thêm "light bass" hoặc bỏ "bouncy bass".
- **Chỗ nối loop không căn theo phách** (crossfade 2 s đuôi vào đầu). Nghe đoạn giây ~30 → 0. Nếu hụt nhịp thì thử crossfade khác hoặc gen lại.
- **Lyria bỏ qua `sample_count`**: đã xử lý trong `gen_music.py -n`.
- **Lyria thỉnh thoảng lỗi 500** "Could not generate audio" (2/15 lần ở bước 2.3), nhất là với prompt dài hoặc tả "silence/sobbing". Rút gọn prompt hoặc đổi seed.
- **Lyria không tạo khoảng lặng**: không cắt được nhiều stinger từ 1 clip. Mỗi stinger = 1 jingle có kết.
- **Tổng hợp sáo/kèn/đàn bầu/giọng chỉ xấp xỉ** (có thể nghe "điện tử"). Gõ/kim loại/nước đạt hơn.

## Changelog

- 2026-10-09 — Tạo khung audio bible, chọn công cụ Vertex AI Lyria + tổng hợp SFX.
- 2026-10-09 — Bước 2.3: thử A/B/C (dân tộc / lo-fi / xiếc). Người dùng nghe A thấy hoài cổ, thiếu vui → vòng 2 V1/V2/V3.
- 2026-10-09 — **Khóa style (D-018)**: V1 "Ukulele vui nhún", prefix + negative nguyên văn, palette, Đô trưởng 110–128 BPM, mood phụ cùng palette, SFX profile tươi + nhóm gõ dân tộc cho meme. Thêm `gen_folk_sfx.py`, `gen_music.py -n` gọi nhiều lần, `loop --limit`.
