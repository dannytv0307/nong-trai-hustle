# AUD-XXX-NNN — <Tên âm thanh>

| Mục | Giá trị |
|---|---|
| Loại | MUS / JNG / SFX / UI / AMB |
| Cách tạo | Lyria (`gen_music.py`) / tổng hợp (`gen_sfx.py`) |
| Sự kiện kích hoạt | … |
| Độ dài | … s · Loop: có / không |
| Kênh | mono (SFX) / stereo (nhạc) |
| Biến thể | 1–3 (+ random pitch ±…% trong game) |
| File trong game | `web/client/public/assets/audio/<music|sfx>/<ten>.wav` |
| Trạng thái | Prompted |

## Mô tả (tiếng Việt)

Âm thanh này báo hiệu điều gì, cảm giác ra sao, nghe bao nhiêu lần mỗi phút.

<!-- Nhạc / jingle (Lyria) — giữ 2 mục dưới, xóa mục "Thông số SFX" -->

## Prompt chính

```
<MUSIC_STYLE_PREFIX nguyên văn>
<mục đích: gameplay loop / menu / jingle thắng…>
<mood, năng lượng>
<tempo BPM, key, nhạc cụ từ instrument palette>
<cấu trúc: steady loopable groove, no intro, no ending | short jingle with clear ending>
<instrumental, mix sạch, cân bằng cho loa máy tính và tai nghe>
```

## Negative

```
vocals, singing, speech, <…>
```

<!-- SFX (tổng hợp) — giữ mục dưới, xóa 2 mục trên -->

## Thông số SFX

```json
{"preset": "jump", "wave": "square", "freq": 300, "freq_end": 750, "lowpass": 5000}
```

## Lệnh

```
.venv/Scripts/python tools/gen_music.py --card docs/audio/prompts/AUD-XXX-NNN.md --name AUD-XXX-NNN -n 2
.venv/Scripts/python tools/audio_tools.py loop <bản đã chọn> web/client/public/assets/audio/music/<ten>.wav --crossfade 2 --rms -18
.venv/Scripts/python tools/gen_sfx.py --card docs/audio/prompts/AUD-XXX-NNN.md --name AUD-XXX-NNN --variants 3
.venv/Scripts/python tools/audio_tools.py process <bản đã chọn> web/client/public/assets/audio/sfx/<ten>.wav --mono --trim --peak -1
```

## Nhật ký

| Ngày | Lần | Thay đổi | Kết quả | Chọn |
|---|---|---|---|---|
