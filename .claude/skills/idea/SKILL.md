---
name: idea
description: Ghi nhận một ý tưởng mới bất cứ lúc nào (tính năng, nhân vật, màn chơi, hiệu ứng…) — đội đánh giá có hợp game không, tốn bao nhiêu công, rồi đề xuất làm ngay, để sau, hay bỏ.
argument-hint: "<ý tưởng của bạn>"
---

# /idea — Ý tưởng mới

Ý tưởng: $ARGUMENTS (trống → hỏi người dùng ý tưởng là gì).

1. Giao `game-planner` đánh giá (chưa ghi file): hợp pillar nào, ảnh hưởng code/hình ảnh/âm thanh, size S/M/L, rủi ro scope, đề xuất **Làm ngay / Để sau / Bỏ** + lý do 1 câu. Nếu có cách làm nhỏ hơn mà vẫn giữ cái hay của ý tưởng, đề xuất luôn.
2. Trình bày ngắn cho người dùng, hỏi bằng AskUserQuestion (đề xuất đặt đầu).
3. Theo lựa chọn:
   - **Làm ngay** → `game-planner` cập nhật GDD + thêm task vào `docs/tasks.md` (đặt đúng bước), ghi `docs/decisions.md`.
   - **Để sau** → `game-planner` thêm vào GDD §14 mục "Để sau" / Could.
   - **Bỏ** → không làm gì, cảm ơn ý tưởng.
4. Nhắc: "Gõ `/next` để tiếp tục bước X.Y."

Tinh thần: khuyến khích người dùng sáng tạo, nhưng bảo vệ khả năng hoàn thành game. Sau khi game đã ở chặng 4–5, mặc định đề xuất "Để sau" cho tính năng mới.
