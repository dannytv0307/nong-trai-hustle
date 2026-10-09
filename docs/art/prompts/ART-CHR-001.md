# ART-CHR-001 — {ten} (nhân vật chính) — concept

| Mục | Giá trị |
|---|---|
| Loại | CHR |
| Dùng ở | Concept khóa ngoại hình {ten}; sau đó làm `art-source/reference/hero.png` và sprite 4 hướng |
| Tỉ lệ gen (`--aspect`) | 1:1 |
| Kích thước cuối | concept 1024; sprite bản đồ 64×96 px (~1,5 ô) |
| Nền khi gen | màu phẳng `#00FF00` |
| Pivot | bottom |
| Animation | bằng code (nảy, co giãn) |
| Reference (`--ref`) | chưa có (đây là lần tạo đầu) — **ảnh này trở thành style anchor** `art-source/reference/hero-front-src.png` / `hero-front.png` |
| File trong game | `web/client/public/assets/art/characters/hero-down.png` (sau) |
| Trạng thái | **Approved** (người dùng chọn ảnh #4 = `art-source/raw/hero-concept/hero-best.png`) |

## Mô tả (tiếng Việt)

Anh nông dân nghèo mà sĩ diện: nón lá chóp nhọn rách một mảnh vành, quai đỏ son, đội lệch; áo nâu cộc tay, vá chàm; quần xắn lệch; chân đất; ưỡn ngực, cằm hếch. Đây cũng là lần đầu thử STYLE_PREFIX Đông Hồ mới.

## Prompt chính

```
Vietnamese Dong Ho woodblock folk print style adapted for a 2D game. Every shape is outlined with a bold hand-carved woodblock ink line in near-black brown #2E2118, slightly uneven and organic like a line cut with a knife into wood, of the same medium-thick weight on every object. Colors are printed as flat solid areas of natural mineral pigments, matte and slightly chalky, like ink pressed from separate carved blocks; colors sit inside the outlines with tiny imperfections. Shading is minimal: at most one flat darker tone on the bottom-right side, light always from the top-left, no gradients, no airbrush, no glossy highlights, no rim light. Shapes are simple, rounded, stylized and decorative like folk prints: round faces with small almond eyes and short curved brush-stroke eyebrows, leaves and grass drawn as repeated simple decorative strokes, thatch and bamboo drawn as rhythmic parallel lines. Chibi proportions, warm, rustic, naive folk-art charm with deadpan humor. Clean flat color surfaces with no paper texture painted in.
Character concept sheet of the hero: a skinny young Vietnamese peasant man, about 20, chibi proportions with a big round head about one third of body height, long thin limbs; wearing a Vietnamese conical leaf hat (non la): a perfectly cone-shaped hat with a sharp pointed tip and a wide straight sloping brim, made of layered pale palm leaves with thin concentric ring ribs, cream #EFE4C8 with straw #DDA933 shading, with a ragged torn notch missing from one side of the brim, tied with a bright vermilion red #A93226 cloth chin strap knotted under his chin, worn slightly tilted to one side; thick black brush-stroke eyebrows, small almond eyes, smug toothy grin, slightly hollow cheeks, chin raised, chest puffed out, proud and poor; a sleeveless faded earth-brown #7A4B2A peasant shirt with a frayed hem, a big square indigo #2F4B73 patch on the back and a small indigo patch on one elbow; dark brown trousers rolled up unevenly, one leg higher than the other; a twisted straw rope belt; barefoot.
Proportion fix: super-deformed chibi, the head (without the hat) is as big as the whole torso, total height about 2.5 heads, short small body, short stubby legs, no realistic anatomy, no muscle definition.
Face fix: folk-print face, round simple face, two small almond eyes drawn as simple ink strokes, short curved brush-stroke eyebrows, tiny nose as a small curve, no wrinkles, no cheekbones, no detailed realistic features.
Hat strap fix: a thin red cord strap runs from inside the hat down along both cheeks and ties in a small knot under the chin; no scarf, no neckerchief.
Trousers fix: one trouser leg rolled up to the knee, the other rolled only to the ankle.
Shading fix: flat woodblock-print colors with only one flat darker tone, no soft shading, no gradients.
Pose: standing full body, relaxed proud stance, hands on hips, chin up, smug grin, weight on one leg.
View: front three-quarter view, whole figure visible from hat tip to bare feet. The front of the shirt is plain with no patch (the big square indigo patch is on the back, hidden in this view); only the small indigo elbow patch is visible.
Composition: centered, single subject, generous padding, isolated on a plain flat #00FF00 background, nothing else in the frame.
Palette: limited palette using only #2E2118 #7A4B2A #B98550 #DDA933 #A93226 #2F4B73 #EFE4C8 plus skin tone #E2B48A.
Technical: no text, no ground shadow, clean silhouette, readable at small size.
```

## Negative

```
photorealistic, 3D render, CGI, glossy, smooth gradients, airbrush, soft shading, rim light, bloom, neon or saturated candy colors, modern mobile-game cartoon look, anime style, thin clean vector lines, painted paper texture, canvas texture, noise, text, letters, calligraphy, seal stamp, signature, watermark, UI, HUD, border frame, grid lines, tile grid overlay, isometric view, diagonal grid, close-up zoomed-in camera, perspective distortion, turban, Indian turban, Indian headwrap, khan xep, sombrero, straw cowboy hat, Japanese or Chinese rice hat with flat or curved brim, rounded mushroom-shaped hat, extra limbs, extra fingers, drop shadow on ground
```

## Lệnh

```
.venv/Scripts/python tools/gen_image.py --card docs/art/prompts/ART-CHR-001.md --name hero-concept --out art-source/raw/hero-concept -n 3 --aspect 1:1 --hq
```

## Nhật ký gen

| Ngày | Lần | Thay đổi prompt | Kết quả (lỗi theo checklist) | Chọn |
|---|---|---|---|---|
| 2026-10-09 | 1 | Bản đầu (STYLE_PREFIX Đông Hồ mới, `--hq`) | Nón lá đúng (chóp nhọn, vành rách, quai đỏ). Lỗi: tỉ lệ ~4 đầu (không chibi), mặt kiểu hoạt hình thực tế (mũi, nếp nhăn), quai thành khăn quàng cổ, miếng vá lớn ở ngực thay vì lưng, quần xắn đều, đổ bóng mềm; #2 nền xanh không phẳng | — |
| 2026-10-09 | 2 | Thêm các dòng 'fix' tỉ lệ chibi 2,5 đầu, mặt kiểu tranh dân gian, quai dây dưới cằm, quần xắn lệch, màu phẳng; ghi rõ mặt trước áo không có vá. Gen thêm 1 ảnh nhìn sau lưng | (xem dưới) | |
| 2026-10-09 | — | Người dùng chọn #4 (`hero-best.png`) | Tách nền `--color #00FF00 --tol 70 --holes 30 --despill` (bản cũ `hero-best-nobg.png` còn ~6600 px xanh ở khe tay–thân và cạnh miếng vá; bản mới sạch). Lưu `art-source/reference/hero-front.png` + gốc `hero-front-src.png`. Thu 64×96 đọc tốt trên nền sáng/tối/xám | **#4 — Approved** |
