# ART-CHR-004 — {ten} chu trình bước đi 4 hướng (bậc 1)

| Mục | Giá trị |
|---|---|
| Loại | CHR |
| Dùng ở | Bản đồ — khi nhân vật di chuyển (thay hoạt ảnh nảy/nghiêng bằng code của D-020 giai đoạn 1) |
| Tỉ lệ gen (`--aspect`) | **21:9** — một ảnh = một hướng, 4 khung trên một hàng |
| Kích thước cuối | spritesheet ngang **256×96** = 4 khung **64×96** (cùng thang với `hero-t1-<hướng>.png`); bản 2x 512×192 ở `art-source/raw/hero-walk/final-2x/` |
| Nền khi gen | màu phẳng `#00FF00` |
| Pivot | bottom (giữa đáy ô, chân chạm đáy ô cách 1 px) |
| Animation | frame: 4 khung/hướng, thứ tự 1-2-3-4 lặp, **8 fps** gợi ý (6–10 tùy tốc độ đi) |
| Reference (`--ref`) | phải: `art-source/raw/hero-walk/ref/hero-side-green.png` + `art-source/reference/hero-front-src.png` · lên: `ref/hero-back-green.png` + `hero-front-src.png` · xuống: `hero-front-src.png` + `ref/hero-back-green.png` (ảnh lưng chỉ để khóa góc nhìn chính diện) |
| File trong game | `web/client/public/assets/art/characters/hero-t1-walk-down.png`, `-up.png`, `-right.png`, `-left.png` |
| Trạng thái | Processed (chờ người dùng duyệt) |

## Mô tả (tiếng Việt)

Chu trình đi 4 khung kiểu cổ điển: **chạm gót (contact) – qua chân (passing) – chạm gót chân kia – qua chân**, tay vung ngược chân, đầu nảy nhẹ ở khung passing. Nhân vật giữ nguyên nón lá rách quai đỏ, áo nâu rách, vá chàm khuỷu tay (lưng: vá vuông giữa lưng), quần xắn lệch, chân đất.

- **right**: gen. **left** = lật ngang right (`--flip`).
- **down**: chính diện thẳng (không 3/4) — khác dáng đứng `hero-t1-down.png` (3/4, chống nạnh) nhưng cùng thang.
- **up**: lưng, tay vung rất ít (đúng tự nhiên khi nhìn từ sau), **không có nảy đầu** — game có thể cộng 1 px nảy bằng code.

Gen **một ảnh nhiều khung** cho mỗi hướng (nhất quán hơn gen từng khung), rồi `process_image.py sheet-split` cắt, tách nền, đưa về cùng tỉ lệ (theo khung cao nhất), căn đáy + căn giữa theo nón/đầu.

## Prompt chính — phải (right, v1 — đạt)

```
Vietnamese Dong Ho woodblock folk print style adapted for a 2D game. Every shape is outlined with a bold hand-carved woodblock ink line in near-black brown #2E2118, slightly uneven and organic like a line cut with a knife into wood, of the same medium-thick weight on every object. Colors are printed as flat solid areas of natural mineral pigments, matte and slightly chalky, like ink pressed from separate carved blocks; colors sit inside the outlines with tiny imperfections. Shading is minimal: at most one flat darker tone on the bottom-right side, light always from the top-left, no gradients, no airbrush, no glossy highlights, no rim light. Shapes are simple, rounded, stylized and decorative like folk prints: round faces with small almond eyes and short curved brush-stroke eyebrows, leaves and grass drawn as repeated simple decorative strokes, thatch and bamboo drawn as rhythmic parallel lines. Chibi proportions, warm, rustic, naive folk-art charm with deadpan humor. Clean flat color surfaces with no paper texture painted in.
WALK CYCLE SPRITE SHEET of the character in the attached reference images: 4 animation frames of a walk cycle, side view, character facing RIGHT and walking toward the right edge, arranged left to right in ONE SINGLE HORIZONTAL ROW, evenly spaced with clear empty green space between the figures so they never touch or overlap.
The character is EXACTLY the same in every frame and exactly matches the attached side-view reference: same big round head (about 2.5 heads tall chibi), same cream conical leaf hat with sharp pointed tip, ring ribs and a ragged torn notch in the brim, thin vermilion red #A93226 chin strap knotted under the chin, short black hair, sleeveless faded earth-brown #7A4B2A shirt with frayed hem, small indigo #2F4B73 patch on the elbow, twisted straw rope belt, dark brown trousers rolled up unevenly with one leg higher, barefoot, calm smug smile. Same size, same height, same hat, same colors in all 4 frames; all 4 figures stand on the same invisible horizontal ground line (feet bottoms aligned at the same height).
Frames (classic 4-frame walk cycle, arms swing opposite to legs):
Frame 1 CONTACT: right leg stepping forward with heel touching the ground, left leg stretched back on its toes, widest stride; left arm swings forward, right arm swings back; body slightly lower.
Frame 2 PASSING: left leg straight under the body carrying the weight, right leg bent with the knee lifted and foot passing beside the supporting leg; both arms close to the body near the sides; body and head slightly higher (head bob up).
Frame 3 CONTACT: mirror of frame 1 — left leg stepping forward with heel touching the ground, right leg stretched back on its toes, widest stride; right arm swings forward, left arm swings back; body slightly lower.
Frame 4 PASSING: right leg straight under the body carrying the weight, left leg bent with the knee lifted passing beside it; arms close to the sides; body and head slightly higher.
Clear readable leg and arm silhouettes, each arm and leg visible, natural human walking motion, game sprite animation frames for a top-down farming game.
Composition: full body of every figure visible from hat tip to bare feet, nothing cropped, isolated on a plain flat solid #00FF00 green background, no frame borders, no dividing lines, no numbers, nothing else in the image.
Palette: limited palette using only #2E2118 #7A4B2A #B98550 #DDA933 #A93226 #2F4B73 #EFE4C8 plus skin tone #E2B48A.
Technical: no text, no ground shadow, no ground line drawn, clean silhouettes, readable at small size.
Avoid: front view, three-quarter view, facing left, different characters, different hat sizes, running, jumping, overlapping figures, frame numbers, grid lines, border frame, photorealistic, 3D render, CGI, glossy, smooth gradients, airbrush, soft shading, rim light, bloom, neon or saturated candy colors, modern mobile-game cartoon look, anime style, thin clean vector lines, painted paper texture, canvas texture, noise, text, letters, calligraphy, seal stamp, signature, watermark, UI, HUD, tile grid overlay, isometric view, close-up zoomed-in camera, perspective distortion, turban, Indian turban, sombrero, straw cowboy hat, Japanese or Chinese rice hat with flat or curved brim, rounded mushroom-shaped hat, extra limbs, extra fingers, three arms, three legs, busy background, drop shadow on ground
```

## Prompt chính — xuống (down, v3 — đạt)

```
Vietnamese Dong Ho woodblock folk print style adapted for a 2D game. Every shape is outlined with a bold hand-carved woodblock ink line in near-black brown #2E2118, slightly uneven and organic like a line cut with a knife into wood, of the same medium-thick weight on every object. Colors are printed as flat solid areas of natural mineral pigments, matte and slightly chalky, like ink pressed from separate carved blocks; colors sit inside the outlines with tiny imperfections. Shading is minimal: at most one flat darker tone on the bottom-right side, light always from the top-left, no gradients, no airbrush, no glossy highlights, no rim light. Shapes are simple, rounded, stylized and decorative like folk prints: round faces with small almond eyes and short curved brush-stroke eyebrows, leaves and grass drawn as repeated simple decorative strokes, thatch and bamboo drawn as rhythmic parallel lines. Chibi proportions, warm, rustic, naive folk-art charm with deadpan humor. Clean flat color surfaces with no paper texture painted in.
Two reference images are attached. Image 1 (smiling, front) defines the CHARACTER: face, hat, clothes, colors, proportions. Image 2 (seen from behind) defines the CAMERA ANGLE and BODY ORIENTATION: perfectly symmetrical, body squarely aligned with the camera, hat cone centered over the head. Draw the character of image 1 from the opposite side of image 2, i.e. seen squarely from the FRONT.
WALK CYCLE SPRITE SHEET: 4 animation frames of a walk cycle, STRAIGHT-ON FRONT VIEW, perfectly symmetrical camera angle: the character's body, chest, face and both feet point DIRECTLY at the viewer, both shoulders at the same distance, he walks straight TOWARD the viewer (straight down the screen in a top-down farming game, camera slightly above), NOT turned to the side and NOT walking diagonally. His nose is in the exact middle of his face, both eyes equally visible, both ears equally visible, the hat tip exactly above the middle of his face, the rope belt knot in the middle of his belly, toes of both feet pointing down toward the viewer, arranged left to right in ONE SINGLE HORIZONTAL ROW, evenly spaced with clear empty green space between the figures so they never touch or overlap.
The character is EXACTLY the same in every frame and exactly matches the attached reference: same big round head (about 2.5 heads tall chibi), same face with thick brush-stroke eyebrows, small almond eyes and a smug toothy grin, same cream conical leaf hat with sharp pointed tip, ring ribs and a ragged torn notch in the brim, worn slightly tilted, thin vermilion red #A93226 chin strap knotted under the chin, sleeveless faded earth-brown #7A4B2A shirt with frayed hem and a plain front, small indigo #2F4B73 patch on one elbow, twisted straw rope belt with the knot in front, dark brown trousers rolled up unevenly with one leg higher, barefoot. Same size, same height, same hat, same colors in all 4 frames; all 4 figures stand on the same invisible horizontal ground line.
His arms are NOT on his hips: both arms hang free and swing forward and back while walking.
Frames (classic 4-frame walk cycle seen from the front, arms swing opposite to legs):
Frame 1 CONTACT: his right leg steps toward the viewer (that foot slightly lower in the image and slightly bigger), his left leg behind (that foot slightly higher, only toes on the ground); his left arm swings forward toward the viewer with the fist slightly lower and bigger, his right arm swings back and is partly hidden behind his body; body slightly lower.
Frame 2 PASSING: legs close together under the body, the right knee raised and bent with that foot lifted off the ground; both arms hanging at his sides; body and head slightly higher (head bob up).
Frame 3 CONTACT: mirror of frame 1 — his left leg steps toward the viewer, right leg behind; his right arm swings forward, left arm swings back; body slightly lower.
Frame 4 PASSING: legs close together, the left knee raised and bent with that foot lifted off the ground; arms at his sides; body and head slightly higher.
Clear readable leg and arm silhouettes, natural human walking motion, game sprite animation frames.
Composition: full body of every figure visible from hat tip to bare feet, nothing cropped, isolated on a plain flat solid #00FF00 green background, no frame borders, no dividing lines, no numbers, nothing else in the image.
Palette: limited palette using only #2E2118 #7A4B2A #B98550 #DDA933 #A93226 #2F4B73 #EFE4C8 plus skin tone #E2B48A.
Technical: no text, no ground shadow, no ground line drawn, clean silhouettes, readable at small size.
Avoid: hands on hips, three-quarter view, body turned to the side, walking diagonally, walking sideways, feet pointing sideways, side view, profile, back view, different characters, different hat sizes, running, jumping, overlapping figures, frame numbers, grid lines, border frame, photorealistic, 3D render, CGI, glossy, smooth gradients, airbrush, soft shading, rim light, bloom, neon or saturated candy colors, modern mobile-game cartoon look, anime style, thin clean vector lines, painted paper texture, canvas texture, noise, text, letters, calligraphy, seal stamp, signature, watermark, UI, HUD, tile grid overlay, isometric view, close-up zoomed-in camera, perspective distortion, turban, Indian turban, sombrero, straw cowboy hat, Japanese or Chinese rice hat with flat or curved brim, rounded mushroom-shaped hat, extra limbs, extra fingers, three arms, three legs, busy background, drop shadow on ground
```

## Prompt chính — lên (up, v1 — đạt)

```
Vietnamese Dong Ho woodblock folk print style adapted for a 2D game. Every shape is outlined with a bold hand-carved woodblock ink line in near-black brown #2E2118, slightly uneven and organic like a line cut with a knife into wood, of the same medium-thick weight on every object. Colors are printed as flat solid areas of natural mineral pigments, matte and slightly chalky, like ink pressed from separate carved blocks; colors sit inside the outlines with tiny imperfections. Shading is minimal: at most one flat darker tone on the bottom-right side, light always from the top-left, no gradients, no airbrush, no glossy highlights, no rim light. Shapes are simple, rounded, stylized and decorative like folk prints: round faces with small almond eyes and short curved brush-stroke eyebrows, leaves and grass drawn as repeated simple decorative strokes, thatch and bamboo drawn as rhythmic parallel lines. Chibi proportions, warm, rustic, naive folk-art charm with deadpan humor. Clean flat color surfaces with no paper texture painted in.
WALK CYCLE SPRITE SHEET of the character in the attached reference images: 4 animation frames of a walk cycle, BACK VIEW, the character is seen from directly behind and walks straight AWAY from the viewer (toward the top of the screen in a top-down farming game, camera slightly above), arranged left to right in ONE SINGLE HORIZONTAL ROW, evenly spaced with clear empty green space between the figures so they never touch or overlap.
The character is EXACTLY the same in every frame and exactly matches the attached back-view reference: same big round head (about 2.5 heads tall chibi) seen from behind with short black hair at the nape, same cream conical leaf hat with sharp pointed tip, ring ribs and a ragged torn notch in the brim, the thin vermilion red #A93226 chin strap only visible as two thin lines behind the ears, sleeveless faded earth-brown #7A4B2A shirt with frayed hem and ONE BIG SQUARE INDIGO #2F4B73 PATCH with visible stitches in the middle of his back, small indigo patch on one elbow, twisted straw rope belt, dark brown trousers rolled up unevenly with one leg higher, the backs of his bare calves and heels. His face is completely hidden in every frame: no eyes, no nose, no mouth. Same size, same height, same hat, same colors in all 4 frames; all 4 figures stand on the same invisible horizontal ground line.
Frames (classic 4-frame walk cycle seen from behind, arms swing opposite to legs):
Frame 1 CONTACT: his right leg steps forward away from the viewer (that foot slightly higher in the image), his left leg behind with the heel lifted showing the sole of the bare foot; his left arm swings forward (hand partly hidden in front of his body), his right arm swings back toward the viewer; body slightly lower.
Frame 2 PASSING: legs close together under the body, one heel lifted; both arms hanging at his sides; body and head slightly higher (head bob up).
Frame 3 CONTACT: mirror of frame 1 — his left leg steps forward, right leg behind with the sole of the foot showing; right arm swings forward, left arm swings back; body slightly lower.
Frame 4 PASSING: legs close together, the other heel lifted; arms at his sides; body and head slightly higher.
Clear readable leg and arm silhouettes, natural human walking motion, game sprite animation frames.
Composition: full body of every figure visible from hat tip to bare feet, nothing cropped, isolated on a plain flat solid #00FF00 green background, no frame borders, no dividing lines, no numbers, nothing else in the image.
Palette: limited palette using only #2E2118 #7A4B2A #B98550 #DDA933 #A93226 #2F4B73 #EFE4C8 plus skin tone #E2B48A.
Technical: no text, no ground shadow, no ground line drawn, clean silhouettes, readable at small size.
Avoid: face, eyes, mouth, front view, three-quarter front view, looking back over shoulder, side view, profile, different characters, different hat sizes, running, jumping, overlapping figures, frame numbers, grid lines, border frame, photorealistic, 3D render, CGI, glossy, smooth gradients, airbrush, soft shading, rim light, bloom, neon or saturated candy colors, modern mobile-game cartoon look, anime style, thin clean vector lines, painted paper texture, canvas texture, noise, text, letters, calligraphy, seal stamp, signature, watermark, UI, HUD, tile grid overlay, isometric view, close-up zoomed-in camera, perspective distortion, turban, Indian turban, sombrero, straw cowboy hat, Japanese or Chinese rice hat with flat or curved brim, rounded mushroom-shaped hat, extra limbs, extra fingers, three arms, three legs, busy background, drop shadow on ground
```

## Negative

Nằm ở dòng `Avoid:` cuối mỗi prompt (NEGATIVE §4 + "different characters, different hat sizes, running, jumping, overlapping figures, frame numbers, three arms, three legs"; xuống thêm "hands on hips, three-quarter view, walking diagonally…"; lên thêm "face, eyes, looking back over shoulder…").

## Lệnh

```
PY=.venv/Scripts/python
$PY tools/gen_image.py --prompt "$(cat art-source/raw/hero-walk/prompt-right-v1.txt)" --name walk-right-v1 --out art-source/raw/hero-walk --ref art-source/raw/hero-walk/ref/hero-side-green.png --ref art-source/reference/hero-front-src.png -n 2 --aspect 21:9 --hq
$PY tools/gen_image.py --prompt "$(cat art-source/raw/hero-walk/prompt-up-v1.txt)" --name walk-up-v1 --out art-source/raw/hero-walk --ref art-source/raw/hero-walk/ref/hero-back-green.png --ref art-source/reference/hero-front-src.png -n 2 --aspect 21:9 --hq
$PY tools/gen_image.py --prompt "$(cat art-source/raw/hero-walk/prompt-down-v3.txt)" --name walk-down-v3 --out art-source/raw/hero-walk --ref art-source/reference/hero-front-src.png --ref art-source/raw/hero-walk/ref/hero-back-green.png -n 2 --aspect 21:9 --hq
# cắt + căn (left = right lật):
$PY tools/process_image.py sheet-split <sheet.png> --n 4 --cell 64x96 --pad 1 --holes 5 --despill-all [--flip] --out web/client/public/assets/art/characters/hero-t1-walk-<dir>.png --gif art-source/raw/hero-walk/preview-<dir>.gif --fps 8
```

Ảnh `hero-side.png`, `hero-back.png` là RGBA trong suốt → tạo bản nền xanh `ref/hero-*-green.png` trước khi `--ref` (Giả định: model đọc nền trong suốt thành đen, dễ kéo nền tối vào ảnh).

## Nhật ký gen

| Ngày | Lần | Thay đổi prompt | Kết quả (lỗi theo checklist) | Chọn |
|---|---|---|---|---|
| 2026-10-09 | right v1 (2 ảnh hq, 21:9) | Prompt sheet 4 khung một hàng, tả từng khung contact/passing, "same invisible ground line" | **Đạt ngay** cả 2: đúng nhân vật, cùng cỡ nón (bề ngang nón lệch 0 px giữa các khung), chân cùng đáy. #1 có khung passing nhấc gối rõ hơn. Khung 1 và 3 gần giống nhau (tay cùng tư thế) — chấp nhận ở 64 px | #1 |
| 2026-10-09 | up v1 (2 ảnh hq) | Lưng: liệt kê thứ thấy từ sau, "face completely hidden" | Cả 2 đúng lưng, vá chàm vuông rõ. #1 khung 4 mất mảnh rách vành nón. #2 đồng đều; tay vung rất ít, không nảy đầu | #2 |
| 2026-10-09 | down v1 (2 ảnh hq) | "FRONT VIEW… walks toward the viewer" + ref ảnh mẫu mặt trước | **Lỗi:** cả 2 ra 3/4 quay phải, bước chéo (ảnh mẫu 3/4 kéo mạnh) | — |
| 2026-10-09 | down v2 (2 ảnh hq) | Thêm "STRAIGHT-ON… perfectly symmetrical… NOT walking diagonally" + Avoid "three-quarter view, walking diagonally…" | **Vẫn 3/4** cả 2 — chữ không thắng ảnh mẫu | — |
| 2026-10-09 | down v3 (2 ảnh hq) | Thêm `--ref` ảnh **lưng** (đối xứng) làm "ảnh khóa góc máy", ghi rõ ảnh 1 = nhân vật, ảnh 2 = góc nhìn; tả "mũi giữa mặt, hai tai như nhau, nút dây lưng giữa bụng" | #1 **đạt**: chính diện thẳng, tay vung, chân bước to-nhỏ theo phối cảnh, đầu nảy rõ (khung passing cao hơn ~5 px/96). #2 vẫn 3/4 | #1 |
