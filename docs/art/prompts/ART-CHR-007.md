# ART-CHR-007 — {ten} động tác CUỐC 4 hướng (bậc 1) + ART-ITM-001 icon cuốc

> **Đã gen 2026-10-13 (T-009)** — làm sớm theo yêu cầu người dùng (muốn thấy cái cuốc). Prompt thật đã dùng: `art-source/raw/hero-hoe/prompt-{right-v2,down-v1,up-v2,icon-v1}.txt`. Thông số cuối: xem `docs/art/asset-list.md` (bảng Vị trí file).
> Thẻ này cũng là **thẻ gốc** cho các động tác dùng nông cụ: ART-CHR-008 (tưới), ART-CHR-009 (cúi gieo/hái) dùng chung khung, neo, quy ước khung chạm.

| Mục | Giá trị |
|---|---|
| Loại | CHR (animation khung) |
| Dùng ở | Vườn — click ô đất chưa cuốc (GDD §3.3, §3.4); juice "Cuốc đất" §8 |
| Tỉ lệ gen (`--aspect`) | **21:9** — một ảnh = 4 khung **một hướng** (bài học §10.4); gen 3 hướng: phải, xuống, lên. Trái = lật gương phải |
| Kích thước cuối | dải ngang **512×128** = 4 khung **128×128**; bản 2x để dự phòng |
| Nền khi gen | màu phẳng `#00FF00` |
| Pivot | bottom — xem "Khung & neo" |
| Animation | 4 khung, mỗi khung = 25% `actionDuration` (0.4 s → 100 ms/khung); **khung 3 = chạm** |
| Reference (`--ref`) | Phải: `art-source/raw/hero-walk2/ref/hero-side-green.png`. Xuống: `art-source/reference/hero-front-src.png` + ảnh lưng nền xanh (`art-source/raw/hero-walk/ref/`) làm ref góc máy. Lên: ảnh lưng nền xanh |
| File trong game | `web/client/public/assets/art/characters/hero-t1-hoe-<down\|up\|left\|right>.png` |
| Trạng thái | **File đã đặt trong game** (`characters/hero-t1-hoe-*.png`, `items/item-hoe.png`) — chờ game-dev gắn và người dùng duyệt |

## Mô tả (tiếng Việt)

{ten} giơ cuốc qua vai rồi bổ mạnh xuống ô đất trước mặt, kiểu nông dân thật: hai tay cầm cán, lưng hơi khom, nón lá xóc nảy. Phải đọc được ở 64 px: **cán cuốc gỗ + lưỡi sắt** rõ, khung chạm lưỡi cuốc cắm hẳn xuống đất. Hài nhẹ: mặt nhăn gắng sức ở khung chạm.

Cuốc của Việt Nam: cán gỗ dài thẳng (`#B98550`), lưỡi sắt bản rộng gần vuông góc với cán, vẽ bằng mực `#2E2118` + một nét sáng trắng điệp `#EFE4C8` ở mép lưỡi (bảng màu không có xám kim loại).

## Khung & neo (đề xuất, Giả định — chốt với game-dev)

- **Nông cụ vẽ chung vào sprite, khung rộng 128×128** (thay vì 64×96). Lý do: cuốc giơ quá đầu và vươn ra trước ~0,5–0,75 ô; vẽ nông cụ thành sprite riêng thì phải khớp vị trí tay + góc xoay từng khung, từng hướng (nhiều code, dễ lệch, AI không vẽ tay cầm khớp được). Nhược: nâng cấp cuốc (§3.8) không đổi hình trên người — **chỉ hiện ở icon HUD** (Giả định).
- Trong khung 128×128: hộp 64×96 của dáng đi nằm tại **x 32–95, y 16–111** (đệm trên 16 px cho cuốc giơ, dưới 16 px cho lưỡi cuốc khi bổ hướng xuống, hai bên 32 px). Chân chạm y = 110 (cùng quy ước "đáy cách 1 px" của sprite 64×96).
- Phaser: `setOrigin(0.5, 111/128)` cho dải động tác ⇔ cùng điểm chân với dải đi `setOrigin(0.5, 95/96)` → đổi texture không bị giật vị trí. Nhân vật **cùng tỉ lệ pixel** với dải đi (bề ngang nón ≈ 50–53 px).
- Lệnh cắt: `sheet-split` (hoặc `split_cc` nếu cán cuốc chạm hình kề) với `--cell 128x128` và tham số tỉ lệ cố định theo nón (như `--scale-ref` ở ART-CHR-005), không fit theo bbox (cuốc làm bbox to nhỏ thất thường).

## Nhịp & khung chạm (cho game-dev)

| Khung | Tư thế | Thời gian (0.4 s) | Tỉ lệ |
|---|---|---|---|
| 1 | Chuẩn bị: hai tay nắm cán, kéo cuốc ra sau vai, gối chùng | 0–100 ms | 0–25% |
| 2 | Giơ cao: cuốc trên vai/qua đầu, người ngả sau, nón nghiêng | 100–200 ms | 25–50% |
| 3 | **CHẠM**: lưỡi cuốc cắm xuống ô trước mặt, lưng khom, mặt nhăn | 200–300 ms | **50–75%** |
| 4 | Hồi: kéo cuốc lên ngang hông, đứng thẳng dần (nối lại khung 1 khi rê chuột cuốc liên tiếp) | 300–400 ms | 75–100% |

- Khung chạm bắt đầu đúng **`actionImpactAt` 0.5 × `actionDuration`** → game phát bụi đất (ART-FX-001), tiếng "Bộp", rung nhẹ, đổi ô **cùng lúc hiện khung 3**.
- Nếu đổi `actionDuration`: giữ ranh giới khung theo tỉ lệ (0/25/50/75%). Nếu đổi `actionImpactAt`: khung 3 luôn bắt đầu tại `impactAt`, khung 1–2 chia đều trước đó, khung 4 phần còn lại.
- Ô bị cuốc: hướng phải = ô bên phải; xuống = ô dưới (lưỡi cuốc thấp hơn chân trên màn → cần đệm dưới); lên = ô trên (lưỡi bị thân che một phần — chấp nhận).

## Prompt chính — phải

```
Vietnamese Dong Ho woodblock folk print style adapted for a 2D game. Every shape is outlined with a bold hand-carved woodblock ink line in near-black brown #2E2118, slightly uneven and organic like a line cut with a knife into wood, of the same medium-thick weight on every object. Colors are printed as flat solid areas of natural mineral pigments, matte and slightly chalky, like ink pressed from separate carved blocks; colors sit inside the outlines with tiny imperfections. Shading is minimal: at most one flat darker tone on the bottom-right side, light always from the top-left, no gradients, no airbrush, no glossy highlights, no rim light. Shapes are simple, rounded, stylized and decorative like folk prints: round faces with small almond eyes and short curved brush-stroke eyebrows, leaves and grass drawn as repeated simple decorative strokes, thatch and bamboo drawn as rhythmic parallel lines. Chibi proportions, warm, rustic, naive folk-art charm with deadpan humor. Clean flat color surfaces with no paper texture painted in.
HOEING ANIMATION SPRITE SHEET of the character in the attached reference image: 4 animation frames of one hoe strike, STRICT SIDE PROFILE VIEW, character facing RIGHT, arranged left to right in ONE SINGLE HORIZONTAL ROW. LAYOUT IS CRITICAL: the image is divided into 4 equal invisible columns, exactly one figure centered in each column; the figures are SMALL, each only about 60% of the image height, with WIDE empty green gaps between neighbours so that the hoe, hat brim, hands or feet never touch a neighbouring figure.
The tool: a traditional Vietnamese farming hoe (cuoc) with a long straight light wooden handle #B98550 and a wide flat iron blade set almost at a right angle to the handle, the blade drawn in dark ink #2E2118 with one thin cream #EFE4C8 highlight line on its cutting edge. He holds the handle with BOTH hands in every frame. The hoe is the same size in every frame.
The character is EXACTLY the same in every frame and matches the attached side-view reference: big round head (about 2.5 heads tall chibi), cream conical leaf hat with sharp pointed tip, ring ribs and a ragged torn notch in the brim, thin vermilion red #A93226 chin strap, short black hair, sleeveless faded earth-brown #7A4B2A shirt with frayed hem, small indigo #2F4B73 patch on the elbow, twisted straw rope belt, dark brown trousers rolled up unevenly, barefoot. Same size, same hat size, same colors in all 4 frames; feet stay planted at the same spot on the same invisible horizontal ground line in every frame.
Frame 1 WIND-UP: knees slightly bent, both hands pull the hoe back over the rear shoulder, blade pointing behind him.
Frame 2 RAISED: hoe lifted high above and behind the head, body leaning back, chest out, hat tilted back, determined squint.
Frame 3 IMPACT: body bent forward at the waist, arms extended down in front, the hoe blade buried in the ground about half a body-width in front of his toes, a strained grimace with gritted teeth; this is the strongest, most readable pose.
Frame 4 RECOVER: pulling the hoe back up to hip height, standing half upright, blade just above the ground in front of him.
SAME SCALE: hat, head and torso drawn at exactly the same size in all four frames; only arms, hoe and torso angle change.
Composition: full body and the whole hoe visible in every frame, nothing cropped, isolated on a plain flat solid #00FF00 green background, no frame borders, no dividing lines, no numbers, no ground, no dirt, nothing else in the image.
Palette: limited palette using only #2E2118 #7A4B2A #B98550 #DDA933 #A93226 #2F4B73 #EFE4C8 plus skin tone #E2B48A.
Technical: no text, no ground shadow, no ground line drawn, no dust or dirt particles, clean silhouettes, readable at small size.
Avoid: figures touching each other, overlapping hoes, large figures filling the whole height, three-quarter view, body turned toward the camera, both eyes visible, facing left, one-handed grip, shovel, spade, pickaxe, axe, rake, golf swing, swinging sideways like a bat, identical frames, different characters, different hat sizes, dirt clods, dust clouds, motion lines, frame numbers, grid lines, border frame, photorealistic, 3D render, CGI, glossy, smooth gradients, airbrush, soft shading, rim light, bloom, neon or saturated candy colors, modern mobile-game cartoon look, anime style, thin clean vector lines, painted paper texture, canvas texture, noise, text, letters, calligraphy, seal stamp, signature, watermark, UI, HUD, isometric view, perspective distortion, turban, sombrero, straw cowboy hat, flat or curved brim hat, rounded mushroom-shaped hat, extra limbs, extra fingers, three arms, busy background, drop shadow on ground
```

## Biến thể hướng (thay đoạn "STRICT SIDE PROFILE…" và 4 dòng Frame)

**Xuống (mặt về camera):** `FRONT VIEW facing the camera (camera slightly above, classic top-down farming game three-quarter angle), symmetrical body`. Frame 1: hoe held across the chest, blade up beside one shoulder. Frame 2: hoe raised straight up above the hat with both hands, blade behind the head, only its tip visible above the hat. Frame 3 IMPACT: bent forward toward the camera, arms extended down, the blade striking the ground just BELOW and in front of his feet (closer to the viewer than his toes), handle foreshortened. Frame 4: pulling the hoe back up to waist height. Ref: ảnh mặt trước + ảnh lưng (ảnh 2 = góc máy, §10.4). Avoid thêm: `side view, profile`.

**Lên (lưng về camera):** `BACK VIEW, character facing AWAY from the camera, we see the back of the hat, the nape of the neck and the big square indigo #2F4B73 patch on the back of the shirt; face completely hidden: no eyes, no nose, no mouth`. Frame 2: hoe raised above the hat, blade sticking up above the hat tip. Frame 3 IMPACT: leaning forward away from the camera, the blade hitting the ground ABOVE his head on screen (in front of him), partly hidden by his back, the handle visible over one shoulder. Avoid thêm: `looking back over shoulder, face visible`.

## Lệnh (dự kiến)

```
PY=.venv/Scripts/python
R=art-source/raw/hero-tool
$PY tools/gen_image.py --prompt "$(cat $R/prompt-hoe-right.txt)" --name hoe-right --out $R --ref art-source/raw/hero-walk2/ref/hero-side-green.png -n 2 --aspect 21:9 --hq
# tương tự hoe-down (2 ref), hoe-up (ref lưng)
$PY tools/process_image.py sheet-split <ảnh chọn> --n 4 --cell 128x128 --pad 1 --holes 5 --despill-all --out $R/final/hero-t1-hoe-right.png --gif $R/final/preview-hoe-right.gif
# trái: lật gương dải phải (giữ thứ tự khung — lỗi --flip đã sửa)
$PY tools/process_image.py preview $R/final/hero-t1-hoe-right.png --display 128
```

(Có thể cần thêm tùy chọn tỉ lệ cố định cho `sheet-split` để nhân vật cùng cỡ với dải đi — kiểm khi làm.)

## Ước tính chi phí

3 hướng × 2 ảnh `--hq` × ~2 vòng = **12 ảnh ≈ 1,61 USD** (tối đa 3 vòng = 18 ảnh ≈ 2,41 USD).

## Nhật ký gen

| Ngày | Lần | Thay đổi prompt | Kết quả (lỗi theo checklist) | Chọn |
|---|---|---|---|---|
| 2026-10-13 | icon v1 (3 ảnh hq 1:1, ref hero-front-src chỉ để lấy style) | Tả cuốc hình số 7, cán chéo trái-dưới → phải-trên, lưỡi sắt bản rộng vuông góc, mặt lưỡi chàm, mép trắng điệp | Cả 3 đạt (đúng cuốc, không thành xẻng/rìu). #3 lưỡi chữ nhật thuôn rõ nhất | **#3** |
| 2026-10-13 | phải v1 (2 ảnh hq 21:9, ref ảnh nghiêng) | Prompt card + tả cuốc hình số 7 | Cuốc đúng; #1 khung 2 nón lật che mặt, khung 4 cuốc cầm ngược; #2 khung 4 lưỡi chĩa lên | — |
| 2026-10-13 | phải v2 (2 ảnh hq) | Tả lại khung 4 (lưỡi vẫn ở đầu xa, chĩa xuống), giữ nón, chân đứng yên | #1 đạt (khung 1–2 thân hơi 3/4, chấp nhận); #2 khung 3 có cục đất | **#1** |
| 2026-10-13 | xuống v1 (2 ảnh hq, ref mặt trước + lưng làm góc máy) | Biến thể FRONT VIEW | #2 đạt (đúng nhân vật); khung 4 lưỡi ở bên trái trong khi khung 3 ở bên phải → **lật gương khung 4** khi cắt. #1 nón dẹt, mặt khác style | **#2** (khung 4 lật) |
| 2026-10-13 | lên v1 (2 ảnh hq, ref lưng) | Biến thể BACK VIEW | #1 khung 4 cuốc thõng xuống cạnh chân (khó hiểu); #2 không có khung chạm | — |
| 2026-10-13 | lên v2 (2 ảnh hq) | Khung 3: chỉ lưỡi ló trên đỉnh nón (cắm đất phía trước), khung 4: cuốc vác chéo vai phải | #2 đạt; #1 khung 3 cuốc chưa bổ xuống | **#2** |

Cắt: `art-source/raw/hero-hoe/tools/hoe_split.py <ảnh> --n 4 --stand-h 91 [--flip-frames 4] [--mirror] --out … --x2 … --gif …` (lên: `--stand-h 92`). Tỉ lệ = chiều cao đỉnh nón→đáy chân của khung 1 so với dải đi; neo tâm hai bàn chân (màu da) tại x 64, đáy chân y 110. Icon: `removebg --tol 70 --holes 30 --despill` → `fit --size 128 --pad 6`.
