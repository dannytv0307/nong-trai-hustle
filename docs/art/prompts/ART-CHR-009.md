# ART-CHR-009 — {ten} động tác CÚI (gieo / hái / dọn / hái lượm) 4 hướng (bậc 1)

> **Đã gen 2026-10-14 (T-020).** Đổi so với nháp: **4 khung** (không phải 3) để cùng chuẩn với cuốc ART-CHR-007 — khung chỉ số 2 = chạm, game-dev dùng chung hàm tính khung. Khung 128×128, tâm bàn chân x 64, đáy chân y 110, `setOrigin(0.5, 111/128)`. Cắt bằng `tools/action_split.py` (chuyển từ `hoe_split.py`). Prompt thật: `art-source/raw/lot1/prompts/{bend-right,bend-down,bend-up}.txt`. Xem: `art-source/raw/lot1/actions-strip.png`, GIF `art-source/raw/lot1/hero-anim/gif/actions-<hướng>.gif`.
> **Một động tác dùng chung cho nhiều việc:** gieo hạt, hái cây chín, dọn cây héo, hái nấm/măng/sim (§3.5). Khác nhau ở hiệu ứng code (hạt rơi / cây bật lên bay vào gùi), không cần sprite riêng → tiết kiệm 3 bộ.

| Mục | Giá trị |
|---|---|
| Loại | CHR (animation khung) |
| Dùng ở | Vườn, Núi — gieo, hái, dọn (GDD §3.3 bảng "Click vào"); juice §8 |
| Tỉ lệ gen (`--aspect`) | **21:9** `--hq` — một ảnh = **4 khung** một hướng (như cuốc); gen phải, xuống, lên; trái = lật gương từng ô |
| Kích thước cuối | dải **512×128** = 4 khung 128×128 (bản 2x 1024×256 ở `art-source/raw/lot1/hero-anim/`) |
| Nền khi gen | `#00FF00` |
| Pivot | bottom — hộp 64×96 tại x 32–95, y 16–111 |
| Animation | **4 khung, khung chỉ số 2 = CHẠM** — y hệt cuốc: dùng thẳng `hoeFrameAt` (`systems/toolAnim.ts`) với `actionImpactAt` |
| Reference (`--ref`) | như ART-CHR-007 theo hướng |
| File trong game | `web/client/public/assets/art/characters/hero-t1-bend-<down\|up\|left\|right>.png` |
| Trạng thái | **Approved** (người dùng duyệt 2026-10-14; chờ game-dev gắn T-023) |

## Mô tả (tiếng Việt)

{ten} khom lưng, khuỵu gối, một tay chống đầu gối, tay kia với xuống ô trước mặt (nhón hạt / nhổ cây). **Tay không cầm gì** — hạt, rau, cây héo do game vẽ đè (icon vật phẩm) để dùng chung cho mọi loại cây. Hài: mông chổng, nón trễ xuống che nửa mặt ở khung chạm.

## Nhịp & khung chạm

| Khung | Tư thế | 0.4 s | Tỉ lệ |
|---|---|---|---|
| 0 | Đứng, gối chùng, nhìn xuống đất trước chân | 0–100 ms | 0–25% |
| 1 | Khom xuống, một tay chống gối, tay kia với | 100–200 ms | 25–50% |
| 2 | **CHẠM**: cúi thấp nhất, tay chụm chạm đất ô trước mặt, nón chúc che mặt | 200–300 ms | **50–75%** |
| 3 | Đứng dậy, tay nhón giơ lên (chỗ gắn icon vừa hái) | 300–400 ms | 75–100% |

(Cập nhật 2026-10-14: 4 khung như cuốc.) **Điểm tay khung 3** (px trong ô 128, gắn icon cây vừa hái, đo thô ±4): phải (90, 65) · trái (38, 65) (lật) · xuống (36, 59) · lên (88, 61).

Game: khung 2 → hạt rơi/ô lún (gieo) hoặc cây bật lên (hái); khung 3 → icon bay vào gùi. Đề xuất game-dev gắn icon vào tay theo điểm cố định của khung 3 (ghi tọa độ khi cắt sprite).

## Prompt chính — phải

```
Vietnamese Dong Ho woodblock folk print style adapted for a 2D game. Every shape is outlined with a bold hand-carved woodblock ink line in near-black brown #2E2118, slightly uneven and organic like a line cut with a knife into wood, of the same medium-thick weight on every object. Colors are printed as flat solid areas of natural mineral pigments, matte and slightly chalky, like ink pressed from separate carved blocks; colors sit inside the outlines with tiny imperfections. Shading is minimal: at most one flat darker tone on the bottom-right side, light always from the top-left, no gradients, no airbrush, no glossy highlights, no rim light. Shapes are simple, rounded, stylized and decorative like folk prints: round faces with small almond eyes and short curved brush-stroke eyebrows, leaves and grass drawn as repeated simple decorative strokes, thatch and bamboo drawn as rhythmic parallel lines. Chibi proportions, warm, rustic, naive folk-art charm with deadpan humor. Clean flat color surfaces with no paper texture painted in.
BENDING DOWN ANIMATION SPRITE SHEET of the character in the attached reference image: 3 animation frames of bending down to pick something from the ground, STRICT SIDE PROFILE VIEW, character facing RIGHT, arranged left to right in ONE SINGLE HORIZONTAL ROW. LAYOUT IS CRITICAL: the image is divided into 3 equal invisible columns, exactly one figure centered in each column; the figures are SMALL, each only about 60% of the image height, with WIDE empty green gaps between neighbours.
The character is EXACTLY the same in every frame and matches the attached side-view reference: big round head (about 2.5 heads tall chibi), cream conical leaf hat with sharp pointed tip, ring ribs and a ragged torn notch in the brim, thin vermilion red #A93226 chin strap, short black hair, sleeveless faded earth-brown #7A4B2A shirt with frayed hem, small indigo #2F4B73 patch on the elbow, twisted straw rope belt, dark brown trousers rolled up unevenly, barefoot. Same size, same hat size, same colors in all 3 frames; feet planted at the same spot on the same invisible ground line. His hands are EMPTY in every frame.
Frame 1 CROUCH: knees bent, back starting to bend forward, one hand on his knee, the other hand starting to reach down.
Frame 2 REACH: bent down at his lowest, bottom sticking out comically, the free hand touching the ground about half a body-width in front of his toes with the fingers pinched together, the hat brim tipped forward hiding half of his face.
Frame 3 RISE: half standing up, the pinched hand pulled up to knee height as if holding something tiny, smug little grin.
SAME SCALE: hat and head drawn at exactly the same size in all frames. Composition: full body visible, nothing cropped, isolated on a plain flat solid #00FF00 green background, no frame borders, no dividing lines, no numbers, no ground, no plants, no seeds, nothing else.
Palette: limited palette using only #2E2118 #7A4B2A #B98550 #DDA933 #A93226 #2F4B73 #EFE4C8 plus skin tone #E2B48A.
Technical: no text, no ground shadow, no ground line drawn, clean silhouettes, readable at small size.
Avoid: holding any object, tools, plants, vegetables, seeds, basket, kneeling on both knees, sitting, lying down, figures touching each other, large figures filling the whole height, three-quarter view, body turned toward the camera, both eyes visible, facing left, identical frames, different characters, different hat sizes, frame numbers, grid lines, border frame, photorealistic, 3D render, CGI, glossy, smooth gradients, airbrush, soft shading, rim light, bloom, neon or saturated candy colors, modern mobile-game cartoon look, anime style, thin clean vector lines, painted paper texture, canvas texture, noise, text, letters, calligraphy, seal stamp, signature, watermark, UI, HUD, isometric view, perspective distortion, turban, sombrero, straw cowboy hat, flat or curved brim hat, rounded mushroom-shaped hat, extra limbs, extra fingers, three arms, busy background, drop shadow on ground
```

## Biến thể hướng

- **Xuống:** FRONT VIEW; cúi về phía camera, nón chúc xuống che gần hết mặt ở khung 2 (thấy chóp và mặt trên nón — rất dễ nhận ra), tay với xuống **trước chân, gần người xem**.
- **Lên:** BACK VIEW, mặt khuất hoàn toàn; cúi về phía xa, thấy vá chàm lưng và mông chổng, tay khuất sau thân (chấp nhận).

## Ước tính chi phí

3 hướng × 2 ảnh `--hq` × ~2 vòng = **12 ảnh ≈ 1,61 USD** (tối đa 18 ảnh ≈ 2,41 USD).

## Nhật ký gen

| Ngày | Lần | Thay đổi prompt | Kết quả (lỗi theo checklist) | Chọn |
|---|---|---|---|---|
| 2026-10-14 | phải v1 (2 hq 21:9, ref ảnh nghiêng) | 4 khung READY / GOING DOWN / TOUCH / RISE, tay không | #1 đạt (khung chạm ngồi xổm, nón chúc, tay chụm chạm đất; khung 4 nhón tay khoe) | **#1** |
| 2026-10-14 | xuống v1 (2 hq, ref mặt + lưng) | Biến thể FRONT | #1 đạt (khung chạm chỉ thấy chóp nón — rất dễ nhận; khung 4 hơi xoay 3/4, chấp nhận) | **#1** |
| 2026-10-14 | lên v1 (2 hq, ref lưng) | Biến thể BACK | #2 đạt (khung chạm mông chổng — lộ **miếng vá chàm ở đũng quần**, chỉ thấy khi cúi: giữ làm câu đùa, Giả định); #1 các khung quay 3/4 | **#2** |
