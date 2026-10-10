# ART-CHR-005 — {ten} chu trình đi NGANG v2 (6 khung, profile rõ) — bậc 1

| Mục | Giá trị |
|---|---|
| Loại | CHR |
| Dùng ở | Bản đồ — đi trái/phải (thay dải 4 khung ngang của ART-CHR-004) |
| Tỉ lệ gen (`--aspect`) | **21:9** — một ảnh = 6 khung một hàng |
| Kích thước cuối | dải ngang **384×96** = 6 khung **64×96**; bản 2x `art-source/raw/hero-walk2/final/hero-t1-walk-right.v2@2x.png` (768×192) |
| Nền khi gen | màu phẳng `#00FF00` |
| Pivot | bottom (chân chạm y = 94, đáy ô cách 1 px — giống mọi sprite {ten} 64×96) |
| Animation | frame: 6 khung, thứ tự 1→6 lặp, **10 fps (100 ms/khung)**; khung 1 và 4 = chạm gót |
| Reference (`--ref`) | `art-source/raw/hero-walk2/ref/hero-side-green.png` (= `art-source/reference/hero-side.png` dán nền #00FF00). **Không** dùng `hero-front-src.png` (ảnh 3/4 kéo thân xoay về camera — nguyên nhân bản cũ) |
| File ứng viên | `art-source/raw/hero-walk2/final/hero-t1-walk-right.v2.png`, `hero-t1-walk-left.v2.png` (lật gương) |
| File trong game (sau khi duyệt) | `web/client/public/assets/art/characters/hero-t1-walk-right.png`, `-left.png` (ghi đè, 384×96) |
| Trạng thái | **Processed — chờ người dùng duyệt** |

## Mô tả (tiếng Việt)

Người dùng thấy đi ngang "chưa tự nhiên". Chẩn đoán: bản cũ (ART-CHR-004) 4 khung gần giống nhau, sải ngắn, thân xoay 3/4 về camera; **và dải trái bị đảo thứ tự khung (4-3-2-1) do `sheet-split --flip` lật cả ảnh → chu trình chạy ngược = đi lùi** (lỗi tool, đã sửa trong `tools/process_image.py`).

Bản mới: profile thẳng 90°, sải dài, chu trình 6 khung (mỗi bước 3 nhịp): **chạm gót – hạ thấp – qua chân (cao)**, tay vung ngược chân và **đổi bên rõ** (tay có vá chàm ra sau ở khung 1–2, ra trước ở khung 4–5). Đầu nảy: khung 3 và 6 cao nhất, 2 và 5 thấp nhất (chênh ~5 px/96). Trái = lật gương phải (art bible §6 cho phép; vá khuỷu tay đổi bên khi lật — không thấy ở 64 px).

Chọn 6 khung thay vì 4: 4 khung kiểu contact/passing chỉ có 2 tư thế khác nhau thật (khung 1≈3), nhìn như "đá chân"; 6 khung thêm nhịp "hạ thấp" làm nhún rõ, vẫn rẻ (một ảnh). 8 khung (contact-down-passing-up ×2) thì model không giữ nổi nhất quán trong một ảnh.

## Prompt chính — phải (v3, đạt)

```
Vietnamese Dong Ho woodblock folk print style adapted for a 2D game. Every shape is outlined with a bold hand-carved woodblock ink line in near-black brown #2E2118, slightly uneven and organic like a line cut with a knife into wood, of the same medium-thick weight on every object. Colors are printed as flat solid areas of natural mineral pigments, matte and slightly chalky, like ink pressed from separate carved blocks; colors sit inside the outlines with tiny imperfections. Shading is minimal: at most one flat darker tone on the bottom-right side, light always from the top-left, no gradients, no airbrush, no glossy highlights, no rim light. Shapes are simple, rounded, stylized and decorative like folk prints: round faces with small almond eyes and short curved brush-stroke eyebrows, leaves and grass drawn as repeated simple decorative strokes, thatch and bamboo drawn as rhythmic parallel lines. Chibi proportions, warm, rustic, naive folk-art charm with deadpan humor. Clean flat color surfaces with no paper texture painted in.
WALK CYCLE SPRITE SHEET of the character in the attached reference image: 6 animation frames of one full walk cycle, STRICT SIDE PROFILE VIEW (camera exactly 90 degrees to the side), character facing RIGHT and walking toward the right edge, arranged left to right in ONE SINGLE HORIZONTAL ROW. LAYOUT IS CRITICAL: the image is divided into 6 equal invisible columns, exactly one figure centered in each column; the figures are SMALL, each only about 70% of the image height, with WIDE empty green gaps between neighbours (gap at least one third of a figure width) so that no hat brim, hand or foot ever touches or overlaps a neighbouring figure.
PROFILE: the chest, belly, nose and toes all point to the right edge of the image; we see only ONE eye, the nose tip and chin in profile, one ear; the body is NOT turned toward the camera; the far arm and far leg are partly hidden behind the body and drawn one tone darker.
The character is EXACTLY the same in every frame and matches the attached side-view reference: big round head (about 2.5 heads tall chibi), cream conical leaf hat with sharp pointed tip, ring ribs and a ragged torn notch in the brim, thin vermilion red #A93226 chin strap knotted under the chin, short black hair, sleeveless faded earth-brown #7A4B2A shirt with frayed hem, small indigo #2F4B73 patch on the elbow, twisted straw rope belt, dark brown trousers rolled up unevenly, barefoot, calm smug smile. Same size, same hat size, same colors in all 6 frames; all figures stand on the same invisible horizontal ground line.
Frames (energetic cheerful walk with a LONG clear stride, legs open wide like scissors, arms swing big and opposite to the legs):
ARMS ARE CRITICAL: the NEAR arm (the one with the indigo elbow patch, drawn in front of the torso) swings like a pendulum and must clearly ALTERNATE: far BEHIND the back in frames 1-2, hanging straight down at the side in frame 3, far IN FRONT of the chest with the fist forward in frames 4-5, hanging straight at the side in frame 6. The far arm does the opposite and is mostly hidden behind the torso.
Frame 1 CONTACT: near leg reaching far forward, heel touching the ground and toes up; far leg stretched far back on its toes; legs make a wide inverted V; near patched arm swung far BACK.
Frame 2 DOWN: weight lands on the front near leg, knee bent, body slightly lower; back far foot lifting off the ground behind; near patched arm still BACK.
Frame 3 PASSING-UP: near leg straight under the body, body and head at their HIGHEST; far leg bent with knee lifted, foot passing beside the supporting ankle; near arm hanging straight down.
Frame 4 CONTACT: far leg reaching far forward with heel touching the ground, near leg stretched far back on its toes; wide inverted V; near patched arm swung far FORWARD in front of the chest.
Frame 5 DOWN: weight lands on the front far leg, knee bent, body slightly lower; back near foot lifting off; near patched arm still FORWARD.
Frame 6 PASSING-UP: far leg straight under the body, body HIGHEST; near leg bent with knee lifted passing beside it; near arm hanging straight down.
SAME SCALE: the hat, head and torso are drawn at exactly the same size in all six frames; only the legs and arms change and the whole body moves up or down by a few pixels.
Clearly different leg silhouettes in every frame, natural bouncy human walking motion, classic 2D game sprite animation frames.
Composition: full body of every figure visible from hat tip to bare feet, nothing cropped, isolated on a plain flat solid #00FF00 green background, no frame borders, no dividing lines, no numbers, nothing else in the image.
Palette: limited palette using only #2E2118 #7A4B2A #B98550 #DDA933 #A93226 #2F4B73 #EFE4C8 plus skin tone #E2B48A.
Technical: no text, no ground shadow, no ground line drawn, clean silhouettes, readable at small size.
Avoid: figures touching each other, overlapping hats, crowded layout, large figures filling the whole height, three-quarter view, body turned toward the camera, front view, both eyes visible, facing left, short shuffling steps, feet together, identical frames, running, jumping, both feet off the ground, different characters, different hat sizes, overlapping figures, frame numbers, grid lines, border frame, photorealistic, 3D render, CGI, glossy, smooth gradients, airbrush, soft shading, rim light, bloom, neon or saturated candy colors, modern mobile-game cartoon look, anime style, thin clean vector lines, painted paper texture, canvas texture, noise, text, letters, calligraphy, seal stamp, signature, watermark, UI, HUD, isometric view, perspective distortion, turban, sombrero, straw cowboy hat, flat or curved brim hat, rounded mushroom-shaped hat, extra limbs, extra fingers, three arms, three legs, busy background, drop shadow on ground
```

## Negative

Ở dòng `Avoid:` cuối prompt (NEGATIVE §4 + "three-quarter view, body turned toward the camera, both eyes visible, short shuffling steps, identical frames, figures touching each other, overlapping hats…").

## Lệnh

```
PY=.venv/Scripts/python
R=art-source/raw/hero-walk2
$PY tools/gen_image.py --prompt "$(cat $R/prompt-right-v3.txt)" --name walk6-right-v3 --out $R --ref $R/ref/hero-side-green.png -n 2 --aspect 21:9 --hq
# cắt: nón các hình chạm nhau nên sheet-split (tìm cột trống) không tách được -> dùng split_cc (thành phần liên thông + đường cắt men theo nét viền)
$PY $R/tools/split_cc.py $R/walk6-right-v3_20261010-133959_1.png --n 6 --out $R/final/hero-t1-walk-right.v2.png --scale-ref 490.8 --gif $R/final/preview-walk-right-v2.gif --fps 10
$PY $R/tools/split_cc.py $R/walk6-right-v3_20261010-133959_1.png --n 6 --out $R/final/hero-t1-walk-left.v2.png --scale-ref 490.8 --flip
```

`--scale-ref 490.8`: khung cao nhất = 95 px (đỉnh nón chạm mép trên ô) để bề ngang nón ≈ 50 px, gần ảnh đứng (52–53 px). Script `split_cc.py` chỉ nằm trong `art-source/raw/` (không commit) — nếu cần dùng lại lâu dài, nên chuyển vào `tools/`.

## Nhật ký gen

| Ngày | Lần | Thay đổi prompt | Kết quả (lỗi theo checklist) | Chọn |
|---|---|---|---|---|
| 2026-10-10 | v1 (2 ảnh hq, 21:9) | 6 khung, "STRICT SIDE PROFILE", tả 6 nhịp; chỉ ref ảnh nghiêng (bỏ ảnh 3/4) | Cả 2 đã nghiêng hẳn, sải dài hơn. #1 khung 3 lệch hình. #2 tốt nhưng nón hình kề nhau chồng lên nhau (khó cắt); tay khung 1 và 4 giống hệt | — |
| 2026-10-10 | v2 (2 ảnh hq) | Bố cục 6 cột đều, hình nhỏ, khe rộng; tay vá chàm phải đổi bên | Model vẫn vẽ to, nón vẫn chạm. #1 đồng đều nhưng tay vẫn không đổi bên. #2 tay đổi bên nhưng khung 2, 5 bị vẽ nhỏ hơn hẳn (đổi tỉ lệ) | dự phòng #1 |
| 2026-10-10 | v3 (2 ảnh hq) | Tả vị trí tay vá chàm từng khung (sau-sau-thẳng-trước-trước-thẳng) + "SAME SCALE" | #1 **đạt**: tay đổi bên rõ, nón cùng cỡ (270–274 px nguồn), nhún đúng nhịp, các hình không chạm. #2 chỉ vẽ 5 hình | **#1** |
