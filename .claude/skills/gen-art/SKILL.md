---
name: gen-art
description: Gen ngay một hoặc nhiều asset hình ảnh bằng AI (Vertex AI Gemini image) theo đúng phong cách đã khóa — art-director viết prompt, gen, tự review, hậu kỳ, đưa vào game, rồi đưa bạn duyệt. Ví dụ "/gen-art nhân vật chính đang nhảy", "/gen-art ART-ITM-002".
argument-hint: "<mô tả asset hoặc ART-ID>"
---

# /gen-art — Gen hình ảnh

Asset: $ARGUMENTS (trống → asset Must đầu tiên chưa Approved trong `docs/art/asset-list.md`).

1. Kiểm tra `docs/art/art-bible.md` đã có STYLE_PREFIX và bảng màu. Chưa có → giải thích cần chọn style trước và đề nghị `/next` (bước 2.1); dừng.
2. Giao `art-director`: tạo/cập nhật prompt card + dòng asset list, gen 3–4 ảnh với `--ref` ảnh mẫu (nếu style đã khóa), tự review theo checklist, sửa prompt tối đa ~3 vòng, hậu kỳ bản tốt nhất (removebg → fit → preview), đặt vào `web/client/public/assets/art/...` (nếu `web/client/` đã có). Nhiều asset → làm lần lượt, mỗi asset một sheet.
3. Tự xem sheet/preview bằng Read, rồi trình bày cho người dùng: link sheet (các phương án đánh số) + link preview của bản đã chọn. Hỏi: duyệt / chọn số khác / sửa gì.
4. Duyệt → `art-director` đặt trạng thái Approved. Sửa → giao lại `art-director` với góp ý của người dùng.
5. Nếu asset đã vào game và đang thay hình khối placeholder, đề nghị `game-dev` gắn sprite (hoặc để bước 4.2 làm).
