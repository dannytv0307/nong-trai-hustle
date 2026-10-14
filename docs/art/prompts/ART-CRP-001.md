# ART-CRP-001 … 006 — Cây trồng: chung (hạt / mầm / héo) + 5 loại × 3 giai đoạn

| Mục | Giá trị |
|---|---|
| Loại | CRP |
| Dùng ở | Vườn — ô ruộng |
| Tỉ lệ gen (`--aspect`) | 16:9, 3 cây một hàng, model nhanh, n = 2 |
| Kích thước cuối | dải 192×96 = 3 khung **64×96**; đáy khung = đáy ô; đáy cây ở hàng 86 (≈ `CROP_BASE` 0,78 ô) |
| Nền khi gen | `#FF00FF` (cây nhiều xanh lá) |
| Pivot | `setOrigin(0.5, 1)` tại (giữa ô, đáy ô) |
| Animation | bằng code (rung lá, nảy khi hái); **khát = code tô nhạt + ngả vàng** (không vẽ riêng) |
| Reference (`--ref`) | `art-source/reference/sample-dat-nen-bui-cay.png` + `art-source/reference/hero-front-src.png` |
| File trong game | `props/crop-common.png` (0 hạt · 1 mầm chung · 2 **héo** chung), `props/crop-<rau-cai / khoai-lang / rau-muong / dua-hau / lua-nep>.png` (0 non · 1 lớn · 2 chín) |
| Trạng thái | **Approved** (người dùng duyệt 2026-10-14) |

## Cách hiện trạng thái (art-director chọn)

- `seed` → `crop-common` khung 0 · `growing` → khung 0 (non) hoặc 1 (lớn) của cây · `ripe` → khung 2 · `withered` → `crop-common` khung 2.
- Gợi ý khi đang lớn: `age / growDays < 0,5` → khung 0, ngược lại khung 1.
- **Khát:** code tint ngả màu gỗ `#B98550` ~35% + giảm bão hòa, co dọc ~0,92 cho "rũ" (xem cây cải ô (13,2) trong `art-source/raw/lot1/scene-1x.png`).
- Mầm chung (`crop-common` khung 1) để dự phòng cho cây mới sau này.

## Phần đầu chung (sau STYLE_PREFIX)

```
Reference images: image 1 is the approved style of this game's plants and ground (bold uneven dark-brown ink outline, flat chalky colors, leaves as repeated simple decorative strokes, two flat tones); image 2 is the game's style anchor character for line weight. Match that style exactly.
Game sprite sheet for a top-down 2D farming game, plants seen from the classic farming-game three-quarter top-down view (front of the plant plus a little of its top), light from the top-left.
Composition: exactly THREE separate small plant sprites standing in one horizontal row, left to right, evenly spaced with wide empty background between them, all at the SAME SCALE and standing on the same invisible horizontal baseline (the base of each plant at the same height), each plant centered in its own third of the image, generous padding, isolated on a plain flat solid magenta #FF00FF background. Each plant's base is where it comes out of the ground: no soil patch, no ground, no pot under it.
```

## Phần riêng từng cây

### common

```
Plants: (1) LEFT - a freshly sown seed spot: a small low rounded mound of loose earth brown #7A4B2A soil with a #2E2118 ink outline and a lighter #B98550 top-left edge, three or four tiny cream #EFE4C8 seeds sitting on top, small and flat. (2) MIDDLE - a generic tiny seedling sprout: a short thin stem with two small round rice-seedling green #93B04F leaves (darker #3D6B4B on the bottom-right side), about the same width as the mound. (3) RIGHT - a generic WITHERED dead plant of the same small size: drooping limp stems bent over, three or four thin POINTED jagged leaves hanging down, dull dead colors straw brown #B98550 and earth brown #7A4B2A, a few dark #2E2118 spots, sad and dried-up, clearly dead.
```

### rau-cai

```
Plants: three growth stages of a Vietnamese mustard green / bok choy vegetable (rau cai). (1) LEFT - young plant: a small rosette of four round spoon-shaped leaves, rice-seedling green #93B04F with darker #3D6B4B bottom-right tone and pale #EFE4C8 midribs, small. (2) MIDDLE - growing plant: a bigger rosette of six to eight upright spoon-shaped leaves with white-cream #EFE4C8 stalks, about twice the size of the young one. (3) RIGHT - RIPE ready to harvest: a big full lush upright head of mustard greens, many broad rounded leaves in #93B04F and deep #3D6B4B with cream #EFE4C8 thick stalks at the base, a few tiny straw yellow #DDA933 flower buds on top, the largest and fullest of the three, about as wide as it is tall.
```

### khoai-lang

```
Plants: three growth stages of a Vietnamese sweet potato plant (khoai lang). (1) LEFT - young vine: a small low cluster of four heart-shaped leaves on short purple-brown stems, leaves bronze green #3D6B4B with lighter #93B04F top-left tone. (2) MIDDLE - big vine: a wider low spreading mound of many heart-shaped leaves with trailing vines curling out to the sides, about twice as wide as the young one but still low. (3) RIGHT - RIPE ready to harvest: the same big spreading leafy mound with two or three fat rounded sweet potato tubers in reddish purple #A93226 with darker #6B3F6E tone poking out of the base in front, clearly visible.
```

### rau-muong

```
Plants: three growth stages of Vietnamese water spinach (rau muong). (1) LEFT - young: a few thin upright hollow stems with small arrow-shaped (long pointed lance) leaves, rice-seedling green #93B04F, small. (2) MIDDLE - growing: a taller loose clump of many upright hollow pale green stems with long arrow-shaped leaves pointing up and out. (3) RIGHT - RIPE ready to harvest: a tall lush dense bunch of long hollow stems, pale cream-green stems and many long arrow-shaped leaves in #93B04F and #3D6B4B, slightly fanning out, the tallest of the three (taller than wide).
```

### dua-hau

```
Plants: three growth stages of a watermelon plant (dua hau). (1) LEFT - young vine: a small low creeping vine with three or four deeply lobed jagged-round leaves in #93B04F and #3D6B4B and one curly tendril. (2) MIDDLE - vine with a baby fruit: a bigger low spreading vine with lobed leaves, one small yellow #DDA933 flower and one SMALL round baby watermelon (dark green #3D6B4B with lighter #93B04F stripes) in front. (3) RIGHT - RIPE ready to harvest: one BIG round-oval striped watermelon (dark bronze green #3D6B4B with wavy pale #93B04F stripes, a small cream #EFE4C8 highlight at top-left) lying in front, with a few lobed leaves and a curly tendril behind it; the melon is the main shape, about as wide as the whole plant.
```

### lua-nep

```
Plants: three growth stages of a Vietnamese glutinous rice plant (lua nep) growing as a single clump. (1) LEFT - rice seedling: a small clump of thin upright bright rice-seedling green #93B04F blades. (2) MIDDLE - green rice: a taller dense clump of long slender upright green blades #93B04F and #3D6B4B, gracefully arching at the tips, no grains yet. (3) RIGHT - RIPE golden rice ready to harvest: a tall clump of golden straw stems with long leaves turned straw yellow #DDA933 and heavy drooping panicles full of golden #DDA933 grains (each grain a tiny oval with an ink outline) bending down over to one side, the tallest of the three, clearly golden.
```

Tiếp theo là dòng `Palette: …` riêng từng cây và `Technical: no text, no numbers, no labels, no ground shadow, clean closed silhouettes, readable at 64 pixels.` (file đầy đủ: `art-source/raw/lot1/prompts/crop-<id>.txt`).

## Negative

```
photorealistic, 3D render, CGI, glossy, smooth gradients, airbrush, soft shading, rim light, bloom, neon or saturated candy colors, modern mobile-game cartoon look, anime style, thin clean vector lines, painted paper texture, canvas texture, noise, text, letters, numbers, labels, calligraphy, seal stamp, signature, watermark, UI, HUD, border frame, grid lines, tile grid overlay, isometric view, close-up zoomed-in camera, perspective distortion, extra limbs, busy background, drop shadow on ground, cast shadow, ground plane, soil patch under plants, pots, planters, people, characters, faces on plants
```

## Lệnh

```
.venv/Scripts/python tools/gen_image.py --prompt "$(cat art-source/raw/lot1/prompts/crop-<id>.txt)" --name crop-<id> --out art-source/raw/lot1/crop-<id> -n 2 --aspect 16:9 --ref art-source/reference/sample-dat-nen-bui-cay.png --ref art-source/reference/hero-front-src.png
.venv/Scripts/python tools/process_image.py removebg <ảnh chọn> art-source/raw/lot1/crop-<id>/nobg.png --tol 70 --holes 20 --despill
.venv/Scripts/python art-source/raw/lot1/tools/crops.py      # cắt 3 cây → dải 64×96, chiều cao đích từng khung
```

## Nhật ký gen

| Ngày | Lần | Kết quả | Chọn |
|---|---|---|---|
| 2026-10-14 | 1 (6 lượt × 2 ảnh nhanh) | Cả 6 đạt ngay lần 1: đúng nét ảnh mẫu, 3 giai đoạn đọc rõ, héo có lá nhọn rũ (nhọn = xấu). Muống #1 khung chín như bó đã buộc → chọn #2. Lúa #1 nền hơi hồng nhạt (tách nền vẫn sạch) | common #1, cải #1, khoai #1, muống #2, dưa #1, lúa #1 |
| 2026-10-14 | hậu kỳ | Một tỉ lệ chung làm cây non quá to → đặt chiều cao đích từng khung (non nhỏ, chín to). Lúa chín thu thêm cho vừa 62×78. Nét mực khung non mảnh hơn khung chín một chút — chấp nhận | — |
