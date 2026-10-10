# ART-CHR-006 — {ten} khung xoay chéo 3/4 (chuyển hướng) — bậc 1

| Mục | Giá trị |
|---|---|
| Loại | CHR |
| Dùng ở | Bản đồ — chèn **1 khung** khi đổi hướng (thay bóp scaleX bằng code) |
| Tỉ lệ gen (`--aspect`) | 4:3 — một ảnh = 2 hình (3/4 trước-phải, 3/4 sau-phải) |
| Kích thước cuối | 4 khung **64×96**; dải gộp 256×96 thứ tự: xuống-phải, xuống-trái, lên-phải, lên-trái |
| Nền khi gen | `#00FF00` |
| Pivot | bottom (chân y = 94) |
| Animation | frame đơn, giữ **70 ms** (60–80) rồi vào chu trình hướng mới |
| Reference (`--ref`) | `art-source/reference/hero-front-src.png` (3/4 trước, quay phải) + `art-source/raw/hero-walk2/ref/hero-back-green.png` |
| File ứng viên | `art-source/raw/hero-walk2/final/hero-t1-turn-<down-right|down-left|up-right|up-left>.v2.png`, gộp `hero-t1-turn.v2.png`; bản 2x `*-right.v2@2x.png` |
| Trạng thái | **Processed — chờ người dùng duyệt** |

## Mô tả (tiếng Việt)

Dáng giữa bước (qua chân: một chân trụ, chân kia nhấc khỏi đất, tay thả lỏng — không chống nạnh) để chèn được cả khi đang đi lẫn khi bắt đầu đi. Bản trái = lật gương bản phải. Cùng thang với ảnh đứng (nón 50–53 px, chân y = 94).

## Prompt chính (v3, đạt)

```
Vietnamese Dong Ho woodblock folk print style adapted for a 2D game. Every shape is outlined with a bold hand-carved woodblock ink line in near-black brown #2E2118, slightly uneven and organic like a line cut with a knife into wood, of the same medium-thick weight on every object. Colors are printed as flat solid areas of natural mineral pigments, matte and slightly chalky, like ink pressed from separate carved blocks; colors sit inside the outlines with tiny imperfections. Shading is minimal: at most one flat darker tone on the bottom-right side, light always from the top-left, no gradients, no airbrush, no glossy highlights, no rim light. Shapes are simple, rounded, stylized and decorative like folk prints: round faces with small almond eyes and short curved brush-stroke eyebrows, leaves and grass drawn as repeated simple decorative strokes, thatch and bamboo drawn as rhythmic parallel lines. Chibi proportions, warm, rustic, naive folk-art charm with deadpan humor. Clean flat color surfaces with no paper texture painted in.
TURNAROUND SPRITES of the character in the attached reference images (reference 1 = three-quarter front view facing right, reference 2 = back view; both the same character). Draw exactly TWO figures of this same character side by side in one row, both at exactly the same size and standing on the same invisible ground line, with a wide empty green gap between them so they never touch:
LEFT FIGURE — THREE-QUARTER FRONT VIEW at EXACTLY THE SAME CAMERA ANGLE AS REFERENCE 1: body turned 45 degrees toward the RIGHT edge; we clearly see the FACE with BOTH EYES, the mouth, the front of the chest and the rope belt knot at the front; the nose points to the lower right; this is NOT a side profile.
RIGHT FIGURE — THREE-QUARTER BACK VIEW: the back view of reference 2 rotated 45 degrees so the character walks AWAY from the camera toward the UPPER RIGHT; we see the back of the shirt with the square indigo patch shifted toward the left part of the torso, the right side of the body, the right arm swinging, and the edge of the right cheek and the right ear in lost profile; no eyes visible; this is NOT a straight back view.
POSE for both figures: mid-stride PASSING walking pose — the weight on one straight leg, the other leg slightly bent with the bare foot lifted just off the ground next to the supporting ankle; arms relaxed and slightly bent close to the sides (NOT hands on hips); calm smug face.
Character details identical to the references: big ROUND chubby childlike head (about 2.5 heads tall chibi, short stubby limbs), simple cute folk-print face with small almond eyes, tiny nose, short curved eyebrows (not a realistic or handsome face), cream conical leaf hat with sharp pointed tip, concentric ring ribs drawn as thin ochre lines on the outside, a ragged torn notch in the brim, and the UNDERSIDE of the brim painted golden ochre #DDA933 with radiating ribs (clearly visible as a golden band under the brim), thin vermilion red #A93226 chin strap knotted under the chin, short black hair, sleeveless faded earth-brown #7A4B2A shirt with frayed hem, small indigo #2F4B73 patch on the elbow and a square indigo patch in the middle of the back, twisted straw rope belt, dark brown trousers rolled up unevenly, barefoot.
Composition: full body of both figures visible from hat tip to bare feet, nothing cropped, centered, generous padding, isolated on a plain flat solid #00FF00 green background, no frame borders, no numbers, nothing else in the image.
Palette: limited palette using only #2E2118 #7A4B2A #B98550 #DDA933 #A93226 #2F4B73 #EFE4C8 plus skin tone #E2B48A.
Technical: no text, no ground shadow, no ground line drawn, clean silhouettes, readable at small size.
Avoid: blush on cheeks, pink cheeks, side profile for the left figure, realistic face, handsome teenager, adult proportions, long legs, plain white hat underside, hands on hips, straight front view, straight back view, pure side profile, facing left, different characters, different hat sizes, figures touching, more than two figures, photorealistic, 3D render, CGI, glossy, smooth gradients, airbrush, soft shading, rim light, bloom, neon or saturated candy colors, modern mobile-game cartoon look, anime style, thin clean vector lines, painted paper texture, canvas texture, noise, text, letters, calligraphy, seal stamp, signature, watermark, UI, HUD, isometric view, perspective distortion, turban, sombrero, straw cowboy hat, flat or curved brim hat, rounded mushroom-shaped hat, extra limbs, extra fingers, three arms, three legs, busy background, drop shadow on ground
```

## Negative

Ở dòng `Avoid:` (NEGATIVE §4 + "blush on cheeks, side profile for the left figure, hands on hips, straight front/back view, plain white hat underside, realistic face…").

## Lệnh

```
PY=.venv/Scripts/python
R=art-source/raw/hero-walk2
$PY tools/gen_image.py --prompt "$(cat $R/prompt-turn-v3.txt)" --name turn-diag-v3 --out $R --ref art-source/reference/hero-front-src.png --ref $R/ref/hero-back-green.png -n 2 --aspect 4:3 --hq
$PY $R/tools/split_cc.py $R/turn-diag-v3_20261010-134501_1.png --n 2 --out $R/cand/turn-r.png   # rồi cắt từng ô + lật gương cho bản trái
```

## Nhật ký gen

| Ngày | Lần | Thay đổi prompt | Kết quả (lỗi theo checklist) | Chọn |
|---|---|---|---|---|
| 2026-10-10 | v1 (2 ảnh hq) | 2 hình 3/4 trước-phải + 3/4 sau-phải, dáng qua chân; ref trước + lưng + nghiêng | #1 đúng góc nhưng mặt "đẹp trai" người lớn, mặt dưới vành nón trắng (thiếu dải vàng). #2 sai màu nền + nón | — |
| 2026-10-10 | v2 (2 ảnh hq) | Ép mặt chibi, mặt dưới vành nón vàng #DDA933 | #1 đúng style nhưng hình trước thành nghiêng hẳn, hình sau gần thẳng lưng (ảnh nghiêng kéo góc). #2 đúng góc nhưng má hồng, nét mảnh, nền lệch | — |
| 2026-10-10 | v3 (2 ảnh hq) | Bỏ ref ảnh nghiêng; "same camera angle as reference 1"; tả chi tiết thấy được ở 3/4 sau; cấm má hồng | #1 **đạt**: 3/4 trước rõ 2 mắt, 3/4 sau thấy tai + má phải, nón có dải vàng, cùng nét. #2 nón vàng sai màu | **#1** |
