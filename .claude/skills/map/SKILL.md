---
name: map
description: Xem bản đồ hành trình làm game — đang ở chặng/bước nào, đã xong gì, còn bao nhiêu, task và lỗi đang mở, chi phí AI đã dùng. Chỉ đọc, không thay đổi gì.
---

# /map — Bản đồ hành trình

Chỉ đọc: `docs/journey.md`, `docs/tasks.md`, `docs/art/asset-list.md`, `docs/audio/audio-list.md`.

Trình bày gọn:

1. 5 chặng, mỗi chặng một dòng: ✅ xong / 📍 đang ở / ⬜ chưa tới, kèm số bước xong / tổng.
2. Bước hiện tại: tên + việc người dùng sẽ cần làm.
3. Nếu đang ở bước nhiều task: task xong / tổng, task 👀 đang chờ người dùng thử, bug đang mở.
4. Asset (nếu đã có danh sách): hình ảnh và âm thanh Approved / tổng Must.
5. Chi phí AI: đọc mọi file log `.json` trong `art-source/raw/**` và `audio-source/raw/**` (trường `model` + số file trong `files`), nhân với `prices_usd` trong `tools/config.json` → số ảnh/đoạn nhạc theo model và tiền ước tính đã tiêu, so với `budget_usd` (đã duyệt / trần). Cảnh báo nếu vượt 80% mức đã duyệt. Ghi rõ đây là ước tính.
6. Kết bằng: "Gõ `/next` để tiếp tục."
