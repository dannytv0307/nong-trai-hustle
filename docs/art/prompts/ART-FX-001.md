# ART-FX-001 — Hiệu ứng "đất bung lên" khi cuốc (3 khung) — NHÁP

> **NHÁP — CHƯA GEN.** Ưu tiên Should — có thể để bước **4.5 Game feel**. Hiện game đã có bụi đất vẽ bằng code (T-002); sprite này chỉ thay cho đẹp, đúng nét tranh.

| Mục | Giá trị |
|---|---|
| Loại | FX |
| Dùng ở | Khung chạm của ART-CHR-007 (cuốc), phát tại tâm ô vừa cuốc; dùng lại (tô màu khác bằng code) cho dọn cây héo |
| Tỉ lệ gen (`--aspect`) | 16:9 — một ảnh = 3 khung một hàng |
| Kích thước cuối | dải **288×96** = 3 khung **96×96** (mảnh đất văng ra ngoài 1 ô một chút) |
| Nền khi gen | `#00FF00` |
| Pivot | center-bottom (đặt ở tâm ô, hơi thấp) |
| Animation | 3 khung × ~60 ms (tổng ~180 ms, phát ngay tại `actionImpactAt`), không lặp; code thêm nảy/mờ dần |
| Reference (`--ref`) | `art-source/reference/hero-front-src.png` (chỉ để giữ nét viền/màu) |
| File trong game | `web/client/public/assets/art/fx/till-dust.png` |
| Trạng thái | **Planned (NHÁP)** — chưa gen |

## Mô tả (tiếng Việt)

Cục đất nâu tròn + vài mảnh nhọn nhỏ bung lên theo hình quạt rồi rơi, kèm một cụm "khói bụi" kiểu mây cuộn tranh dân gian (vòng xoắn có viền mực), không phải bụi mờ thật. Khung 1 nhỏ, sát đất; khung 2 bung rộng nhất; khung 3 mảnh đất rơi, cụm bụi tan còn vài vòng.

## Prompt chính

```
Vietnamese Dong Ho woodblock folk print style adapted for a 2D game. Every shape is outlined with a bold hand-carved woodblock ink line in near-black brown #2E2118, slightly uneven and organic like a line cut with a knife into wood, of the same medium-thick weight on every object. Colors are printed as flat solid areas of natural mineral pigments, matte and slightly chalky, like ink pressed from separate carved blocks; colors sit inside the outlines with tiny imperfections. Shading is minimal: at most one flat darker tone on the bottom-right side, light always from the top-left, no gradients, no airbrush, no glossy highlights, no rim light. Shapes are simple, rounded, stylized and decorative like folk prints: round faces with small almond eyes and short curved brush-stroke eyebrows, leaves and grass drawn as repeated simple decorative strokes, thatch and bamboo drawn as rhythmic parallel lines. Chibi proportions, warm, rustic, naive folk-art charm with deadpan humor. Clean flat color surfaces with no paper texture painted in.
EFFECT SPRITE SHEET: 3 animation frames of a small burst of soil kicked up by a hoe strike, arranged left to right in ONE SINGLE HORIZONTAL ROW, each frame centered in its own equal invisible column with wide empty gaps, all frames sharing the same invisible ground line near the bottom of the column.
Frame 1: a small low burst just above the ground: three or four round earth-brown #7A4B2A soil clods and a tiny curled dust puff.
Frame 2: the biggest moment: soil clods of different sizes flying up and outward in a fan shape, a few small pointed chips of dry soil #B98550, and a stylized dust cloud made of three or four curling spiral cloud shapes like traditional folk-art clouds, cream #EFE4C8 with ink outlines.
Frame 3: clods falling back down lower and further apart, the cloud breaking into two small curls, fading out.
View: seen from the classic top-down farming game three-quarter angle. Composition: each frame isolated on a plain flat solid #00FF00 green background, no ground, no hoe, no character, nothing else.
Palette: limited palette using only #2E2118 #7A4B2A #B98550 #EFE4C8.
Technical: no text, no ground shadow, no ground line drawn, clean silhouettes, readable at small size.
Avoid: realistic smoke, soft blurry dust, transparent smoke, explosion fire, sparks, rocks, stones, grass, characters, tools, frame numbers, grid lines, border frame, photorealistic, 3D render, CGI, glossy, smooth gradients, airbrush, soft shading, rim light, bloom, neon or saturated candy colors, modern mobile-game cartoon look, anime style, thin clean vector lines, painted paper texture, canvas texture, noise, text, letters, signature, watermark, UI, HUD, busy background, drop shadow on ground
```

## Ước tính chi phí

2 ảnh nhanh × ~2 vòng = 4 × 0,067 ≈ **0,27 USD** (nếu cần `--hq` cho nét khớp nhân vật: ≈ 0,54).

## Nhật ký gen

| Ngày | Lần | Thay đổi prompt | Kết quả (lỗi theo checklist) | Chọn |
|---|---|---|---|---|
| — | — | Chưa gen (nháp 2026-10-10) | — | — |
