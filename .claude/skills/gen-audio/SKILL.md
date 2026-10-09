---
name: gen-audio
description: Gen ngay nhạc nền (Lyria trên Vertex AI) hoặc hiệu ứng âm thanh (tổng hợp) theo đúng bản sắc âm thanh đã khóa — audio-director tạo, hậu kỳ, đưa vào game, rồi đưa bạn nghe duyệt. Ví dụ "/gen-audio tiếng nhảy", "/gen-audio nhạc menu".
argument-hint: "<mô tả âm thanh hoặc AUD-ID>"
---

# /gen-audio — Gen âm thanh

Âm thanh: $ARGUMENTS (trống → asset Must đầu tiên chưa Approved trong `docs/audio/audio-list.md`).

1. Kiểm tra `docs/audio/audio-bible.md` đã có MUSIC_STYLE_PREFIX / SFX profile. Chưa có → đề nghị `/next` (bước 2.3); dừng.
2. Giao `audio-director`: tạo/cập nhật prompt card + dòng audio list; nhạc → `gen_music.py` 2 bản → `audio_tools.py loop`; SFX → `gen_sfx.py --variants 3` → `audio_tools.py process`; đo số liệu; đặt vào `web/client/public/assets/audio/...` (nếu `web/client/` đã có).
3. Trình bày danh sách file (link để bấm nghe), mỗi file 1 dòng mô tả. Hỏi: chọn bản nào / sửa gì (to hơn, mềm hơn, ngắn hơn, vui hơn…).
4. Duyệt → Approved. Sửa → giao lại `audio-director` với góp ý (dịch góp ý cảm tính sang tham số: "mềm hơn" → lowpass thấp hơn / sine; "vui hơn" → pitch đi lên, BPM cao hơn…).
