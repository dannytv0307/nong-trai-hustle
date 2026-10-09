# ART-CHR-002 — {ten} sprite bản đồ 4 hướng

| Mục | Giá trị |
|---|---|
| Loại | CHR |
| Dùng ở | Bản đồ (đi WASD), 4 hướng: down (mặt), up (lưng), left, right |
| Tỉ lệ gen (`--aspect`) | 1:1 |
| Kích thước cuối | 64×96 px (~1,5 ô), pivot đáy |
| Nền khi gen | màu phẳng `#00FF00` |
| Pivot | bottom |
| Animation | bằng code (nảy khi đi, co giãn); chưa có frame bước chân |
| Reference (`--ref`) | `art-source/reference/hero-front-src.png` |
| File trong game | `web/client/public/assets/art/characters/hero-down.png`, `hero-up.png`, `hero-left.png`, `hero-right.png` (tạm ở `art-source/raw/hero-directions/`) |
| Trạng thái | Processed (chờ người dùng duyệt) |

## Mô tả (tiếng Việt)

- **down** = chính ảnh mẫu đã duyệt (#4, chống nạnh, 3/4 trước) — không gen lại.
- **up** = gen riêng, thấy rõ miếng vá chàm vuông giữa lưng, không lộ mặt.
- **right** = gen (prompt xin "facing LEFT" nhưng model vẽ quay phải — dùng luôn làm hướng phải).
- **left** = lật ngang bản right (mảnh rách vành nón đổi phía — chấp nhận, khó thấy ở 64 px).

## Prompt chính — lưng (up)

```
Vietnamese Dong Ho woodblock folk print style adapted for a 2D game. Every shape is outlined with a bold hand-carved woodblock ink line in near-black brown #2E2118, slightly uneven and organic like a line cut with a knife into wood, of the same medium-thick weight on every object. Colors are printed as flat solid areas of natural mineral pigments, matte and slightly chalky, like ink pressed from separate carved blocks; colors sit inside the outlines with tiny imperfections. Shading is minimal: at most one flat darker tone on the bottom-right side, light always from the top-left, no gradients, no airbrush, no glossy highlights, no rim light. Shapes are simple, rounded, stylized and decorative like folk prints: round faces with small almond eyes and short curved brush-stroke eyebrows, leaves and grass drawn as repeated simple decorative strokes, thatch and bamboo drawn as rhythmic parallel lines. Chibi proportions, warm, rustic, naive folk-art charm with deadpan humor. Clean flat color surfaces with no paper texture painted in.
Match the attached reference image exactly: the same character, same proportions (big head, about 2.5 heads tall), same cream conical leaf hat with the ragged torn notch in the brim and the thin vermilion red chin strap, same sleeveless earth-brown frayed shirt, rolled-up trousers with one leg higher, straw rope belt, bare feet, same bold dark brown-black outline weight and flat two-tone cel coloring.
Character: a skinny young Vietnamese peasant man, about 20, chibi proportions with a big round head about one third of body height, long thin limbs; wearing a Vietnamese conical leaf hat (non la): a perfectly cone-shaped hat with a sharp pointed tip and a wide straight sloping brim, made of layered pale palm leaves with thin concentric ring ribs, cream #EFE4C8 with straw #DDA933 shading, with a ragged torn notch missing from one side of the brim, tied with a bright vermilion red #A93226 cloth chin strap knotted under his chin, worn slightly tilted to one side; thick black brush-stroke eyebrows, small almond eyes, smug toothy grin, slightly hollow cheeks, chin raised, chest puffed out, proud and poor; a sleeveless faded earth-brown #7A4B2A peasant shirt with a frayed hem, a big square indigo #2F4B73 patch on the back and a small indigo patch on one elbow; dark brown trousers rolled up unevenly, one leg higher than the other; a twisted straw rope belt; barefoot.
View: BACK VIEW. The character is seen from directly behind, walking away from the viewer. We see the back of his head (short black hair at the nape of the neck) under the back of the conical hat, the back of his shirt with ONE BIG SQUARE INDIGO #2F4B73 PATCH sewn with visible stitches in the middle of his back, the backs of his arms with the small indigo patch on one elbow, the straw rope belt knot seen from behind, the backs of his calves and his heels. His face is completely hidden: no eyes, no nose, no mouth, no eyebrows visible. The red chin strap is only visible as two thin lines going from the hat down behind his ears. Arms relaxed hanging at his sides.
Full body, whole figure visible from hat tip to bare feet, standing still, game sprite for a top-down farming game, same scale as the reference.
Composition: centered, single subject, generous padding, isolated on a plain flat solid #00FF00 green background, nothing else in the frame.
Palette: limited palette using only #2E2118 #7A4B2A #B98550 #DDA933 #A93226 #2F4B73 #EFE4C8 plus skin tone #E2B48A.
Technical: no text, no ground shadow, clean silhouette, readable at small size.
Avoid: face, eyes, mouth, front view, three-quarter front view, looking back over shoulder, photorealistic, 3D render, CGI, glossy, smooth gradients, airbrush, soft shading, rim light, bloom, neon or saturated candy colors, modern mobile-game cartoon look, anime style, thin clean vector lines, painted paper texture, canvas texture, noise, text, letters, calligraphy, seal stamp, signature, watermark, UI, HUD, border frame, grid lines, tile grid overlay, isometric view, diagonal grid, close-up zoomed-in camera, perspective distortion, turban, Indian turban, Indian headwrap, khan xep, sombrero, straw cowboy hat, Japanese or Chinese rice hat with flat or curved brim, rounded mushroom-shaped hat, extra limbs, extra fingers, busy background, drop shadow on ground
```

## Prompt chính — ngang (side)

```
Vietnamese Dong Ho woodblock folk print style adapted for a 2D game. Every shape is outlined with a bold hand-carved woodblock ink line in near-black brown #2E2118, slightly uneven and organic like a line cut with a knife into wood, of the same medium-thick weight on every object. Colors are printed as flat solid areas of natural mineral pigments, matte and slightly chalky, like ink pressed from separate carved blocks; colors sit inside the outlines with tiny imperfections. Shading is minimal: at most one flat darker tone on the bottom-right side, light always from the top-left, no gradients, no airbrush, no glossy highlights, no rim light. Shapes are simple, rounded, stylized and decorative like folk prints: round faces with small almond eyes and short curved brush-stroke eyebrows, leaves and grass drawn as repeated simple decorative strokes, thatch and bamboo drawn as rhythmic parallel lines. Chibi proportions, warm, rustic, naive folk-art charm with deadpan humor. Clean flat color surfaces with no paper texture painted in.
Match the attached reference image exactly: the same character, same proportions (big head, about 2.5 heads tall), same cream conical leaf hat with the ragged torn notch in the brim and the thin vermilion red chin strap, same sleeveless earth-brown frayed shirt, rolled-up trousers with one leg higher, straw rope belt, bare feet, same bold dark brown-black outline weight and flat two-tone cel coloring.
Character: a skinny young Vietnamese peasant man, about 20, chibi proportions with a big round head about one third of body height, long thin limbs; wearing a Vietnamese conical leaf hat (non la): a perfectly cone-shaped hat with a sharp pointed tip and a wide straight sloping brim, made of layered pale palm leaves with thin concentric ring ribs, cream #EFE4C8 with straw #DDA933 shading, with a ragged torn notch missing from one side of the brim, tied with a bright vermilion red #A93226 cloth chin strap knotted under his chin, worn slightly tilted to one side; thick black brush-stroke eyebrows, small almond eyes, smug toothy grin, slightly hollow cheeks, chin raised, chest puffed out, proud and poor; a sleeveless faded earth-brown #7A4B2A peasant shirt with a frayed hem, a big square indigo #2F4B73 patch on the back and a small indigo patch on one elbow; dark brown trousers rolled up unevenly, one leg higher than the other; a twisted straw rope belt; barefoot.
View: SIDE VIEW, strict profile facing LEFT. The character is turned 90 degrees, walking toward the left edge of the image: his nose and toes point to the left, only one eye and one ear visible, the conical hat seen from the side as a tall triangle with its wide brim sticking out to the front and back, the torn notch visible on the brim edge, one arm in front swinging slightly, mid-stride standing pose with feet close together, chest puffed out proudly. The big indigo patch on his back is seen at the edge of his back on the right side.
Full body, whole figure visible from hat tip to bare feet, standing still, game sprite for a top-down farming game, same scale as the reference.
Composition: centered, single subject, generous padding, isolated on a plain flat solid #00FF00 green background, nothing else in the frame.
Palette: limited palette using only #2E2118 #7A4B2A #B98550 #DDA933 #A93226 #2F4B73 #EFE4C8 plus skin tone #E2B48A.
Technical: no text, no ground shadow, clean silhouette, readable at small size.
Avoid: front view, three-quarter view, both eyes visible, facing right, photorealistic, 3D render, CGI, glossy, smooth gradients, airbrush, soft shading, rim light, bloom, neon or saturated candy colors, modern mobile-game cartoon look, anime style, thin clean vector lines, painted paper texture, canvas texture, noise, text, letters, calligraphy, seal stamp, signature, watermark, UI, HUD, border frame, grid lines, tile grid overlay, isometric view, diagonal grid, close-up zoomed-in camera, perspective distortion, turban, Indian turban, Indian headwrap, khan xep, sombrero, straw cowboy hat, Japanese or Chinese rice hat with flat or curved brim, rounded mushroom-shaped hat, extra limbs, extra fingers, busy background, drop shadow on ground
```

## Lệnh

```
.venv/Scripts/python tools/gen_image.py --prompt "<prompt lưng>" --name hero-back --out art-source/raw/hero-directions --ref art-source/reference/hero-front-src.png -n 2 --aspect 1:1 --hq
.venv/Scripts/python tools/gen_image.py --prompt "<prompt ngang>" --name hero-left --out art-source/raw/hero-directions --ref art-source/reference/hero-front-src.png -n 1 --aspect 1:1 --hq
.venv/Scripts/python tools/process_image.py removebg <in> <nobg> --color "#00FF00" --tol 70 --holes 30 --despill   (lưng: --tol 100 --holes 4)
.venv/Scripts/python tools/process_image.py fit <nobg> hero-<dir>.png --size 64x96 --pad 1 --pivot bottom
```

## Nhật ký gen

| Ngày | Lần | Thay đổi prompt | Kết quả (lỗi theo checklist) | Chọn |
|---|---|---|---|---|
| 2026-10-09 | 1 | Lưng: "BACK VIEW… face completely hidden: no eyes, no nose, no mouth", liệt kê thứ thấy được từ sau (gáy, vá lưng, gót chân); Avoid thêm "face, eyes, front view, looking back over shoulder". Ngang: "strict profile facing LEFT" | Lưng **đạt ngay lần 1** (đã khắc phục lỗi #6 của 2.1): #2 chuẩn, vá chàm vuông rõ, không mặt; #1 nón nghiêng lạ. Ngang: ra hướng **phải**, mặt hơi 3/4 chứ không profile tuyệt đối, dáng đang bước — chấp nhận | lưng #2, ngang #1 |

Lỗi nhỏ còn lại: down chống nạnh, left/right đang bước, up đứng thả tay — dáng không đồng nhất nhưng ở 64×96 không lộ; nếu muốn đồng bộ thì gen lại down ở dáng đứng thả tay (1 ảnh). Tách nền lưng cần `--tol 100 --holes 4` + khử ám xanh vì khe giữa quai nón và cổ có viền xanh tối.
