# ART-ITM-002 / ART-ITM-003 — Sheet icon Vườn 1 (hạt + đồ ăn) và Vườn 2 (nông sản + đồ meme)

| Mục | Giá trị |
|---|---|
| Loại | ITM |
| Dùng ở | Hotbar, gùi, thùng bán, sạp hạt, tổng kết, icon bay khi hái |
| Tỉ lệ gen (`--aspect`) | 1:1, lưới 3×3, `--hq`, n = 2 |
| Kích thước cuối | 128×128 RGBA, đệm 6, căn giữa (hiển thị ~72 px trong ô 92) |
| Nền khi gen | `#FF00FF` |
| Reference (`--ref`) | icon cuốc `items/item-hoe.png` ghép lên nền magenta (`art-source/raw/lot1/ref/item-hoe-magenta.png`) + ảnh mẫu đất/cây |
| File trong game | `items/item-<id>.png` — hạt `item-hat-<cropId>`, nông sản `item-<cropId>`; món chưa có id trong dữ liệu: tên Giả định bên dưới |
| Trạng thái | **Approved** (người dùng duyệt 2026-10-14) |

Tên Giả định: `item-binh-tuoi`, `item-bat-com`, `item-khoai-nuong`, `item-bat-chao`, `item-trung`, `item-xau-tien`, `item-tui-tien-rong`, `item-day-rom`.

## Prompt — sheet 1

```
[STYLE_PREFIX — Art Bible §3, dán nguyên văn]
Reference images: image 1 is this game's approved inventory icon (an iron hoe): copy its icon style exactly — bold uneven dark-brown #2E2118 ink outline of the same thickness, flat chalky colors with one flat darker tone on the bottom-right, a slight front three-quarter view, chunky simple shapes that read at 64 pixels. Image 2 shows the game's plant style.
Game inventory icon sheet: exactly NINE separate item icons arranged in a neat 3 by 3 layout (three rows of three), each icon centered in its own equal square cell, all icons at a similar visual size filling about 70 percent of their cell, wide empty background gaps between icons so none touch, isolated on a plain flat solid magenta #FF00FF background. No cell borders, no frames, no lines between cells.
Icons, row by row, left to right:
Row 1: (1) seed bag for mustard greens; (2) seed bag for sweet potato; (3) seed bag for water spinach.
Row 2: (4) seed bag for watermelon; (5) seed bag for glutinous rice; (6) a battered old tin watering can, dull grey-blue tin #6E9FA6 with dents and an indigo #2F4B73 darker side, long spout pointing right, a small rust patch.
Row 3: (7) a round bowl of steamed white rice: cream #EFE4C8 rice mound in an indigo-patterned #2F4B73 rustic ceramic bowl, with a pair of wooden chopsticks resting on top; (8) a roasted sweet potato: charred dark-skinned tuber broken open showing steaming golden-orange #DDA933 flesh, two little steam curls; (9) a bowl of rice porridge: pale cream #EFE4C8 porridge in a plain earthen brown #7A4B2A bowl with a few green #93B04F scallion bits.
All five seed bags (1)-(5) share the SAME shape: a small plump rustic straw-brown #B98550 cloth pouch tied at the neck with a vermilion red #A93226 string, the top slightly open with a few seeds peeking out, and on the front of each pouch a round cream #EFE4C8 badge painted with a tiny picture of its crop: (1) a green mustard-green leaf rosette, (2) a reddish-purple #A93226 sweet potato, (3) long green arrow-shaped water spinach leaves, (4) a striped green watermelon, (5) a golden #DDA933 rice ear. The pictures must be different and clearly recognisable; no letters.
Palette: limited palette using only #2E2118 #7A4B2A #B98550 #DDA933 #93B04F #3D6B4B #A93226 #2F4B73 #6E9FA6 #EFE4C8 #6B3F6E (and the magenta background).
Technical: no text, no letters, no numbers, no ground shadow, clean closed silhouettes, readable at 64 pixels.
Avoid: photorealistic, 3D render, CGI, glossy, smooth gradients, airbrush, soft shading, rim light, bloom, neon or saturated candy colors, modern mobile-game cartoon look, anime style, thin clean vector lines, painted paper texture, canvas texture, noise, text, letters, numbers, labels, calligraphy, seal stamp, signature, watermark, UI, HUD, border frame, grid lines, tile grid overlay, isometric view, close-up zoomed-in camera, perspective distortion, extra limbs, busy background, drop shadow on ground, cast shadow, ground plane, soil patch under plants, pots, planters, people, characters, faces on plants, cell borders, grid lines, frames, letters on bags, labels with writing
```

## Prompt — sheet 2

```
[STYLE_PREFIX — Art Bible §3, dán nguyên văn]
Reference images: image 1 is this game's approved inventory icon (an iron hoe): copy its icon style exactly — bold uneven dark-brown #2E2118 ink outline of the same thickness, flat chalky colors with one flat darker tone on the bottom-right, a slight front three-quarter view, chunky simple shapes that read at 64 pixels. Image 2 shows the game's plant style.
Game inventory icon sheet: exactly NINE separate item icons arranged in a neat 3 by 3 layout (three rows of three), each icon centered in its own equal square cell, all icons at a similar visual size filling about 70 percent of their cell, wide empty background gaps between icons so none touch, isolated on a plain flat solid magenta #FF00FF background. No cell borders, no frames, no lines between cells.
Icons, row by row, left to right:
Row 1: (1) a bunch of harvested mustard greens tied with a straw band: broad rounded leaves #93B04F and #3D6B4B with thick cream #EFE4C8 stalks; (2) two fat sweet potato tubers, reddish purple #A93226 skin with darker #6B3F6E side and a few tiny root hairs; (3) a bundle of harvested water spinach tied with a straw band: long hollow pale green stems and arrow-shaped leaves #93B04F.
Row 2: (4) a whole round-oval striped watermelon, dark bronze green #3D6B4B with wavy pale #93B04F stripes and a cream #EFE4C8 highlight on the top-left, short curly stem; (5) a sheaf of harvested golden glutinous rice: golden straw stalks tied with a straw band, heavy drooping ears of golden #DDA933 grains; (6) one cream-white chicken egg #EFE4C8 with a light brown #B98550 speckle.
Row 3: (7) a string of old Vietnamese copper cash coins: round bronze-gold #DDA933 coins each with a square hole in the middle, threaded on a red #A93226 string, slightly fanned out; (8) an EMPTY cloth money pouch turned inside out, pockets pulled out and hanging limp, dull brown #7A4B2A outside and indigo #2F4B73 inner lining showing, a single moth-hole, comically empty; (9) a single coiled twisted straw rope, golden straw #DDA933 with darker #B98550 twist lines, a sad short plain rope.
Palette: limited palette using only #2E2118 #7A4B2A #B98550 #DDA933 #93B04F #3D6B4B #A93226 #2F4B73 #6E9FA6 #EFE4C8 #6B3F6E (and the magenta background).
Technical: no text, no letters, no numbers, no ground shadow, clean closed silhouettes, readable at 64 pixels.
Avoid: photorealistic, 3D render, CGI, glossy, smooth gradients, airbrush, soft shading, rim light, bloom, neon or saturated candy colors, modern mobile-game cartoon look, anime style, thin clean vector lines, painted paper texture, canvas texture, noise, text, letters, numbers, labels, calligraphy, seal stamp, signature, watermark, UI, HUD, border frame, grid lines, tile grid overlay, isometric view, close-up zoomed-in camera, perspective distortion, extra limbs, busy background, drop shadow on ground, cast shadow, ground plane, soil patch under plants, pots, planters, people, characters, faces on plants, cell borders, grid lines, frames, characters on coins, writing, sliced watermelon
```

## Lệnh

```
.venv/Scripts/python tools/gen_image.py --prompt "$(cat art-source/raw/lot1/prompts/icons-1.txt)" --name icons-1 --out art-source/raw/lot1/icons-1 -n 2 --aspect 1:1 --hq --ref art-source/raw/lot1/ref/item-hoe-magenta.png --ref art-source/reference/sample-dat-nen-bui-cay.png
.venv/Scripts/python tools/process_image.py removebg <ảnh chọn> art-source/raw/lot1/icons-1/nobg.png --tol 70 --holes 30 --despill
.venv/Scripts/python art-source/raw/lot1/tools/icons.py      # tách theo vùng liền (món tràn ô không bị cắt), 128×128
```

## Nhật ký gen

| Ngày | Lần | Kết quả | Chọn |
|---|---|---|---|
| 2026-10-14 | 1 (2 sheet × 2 ảnh hq) | Cùng nét/màu icon cuốc. 5 túi hạt cùng dáng, phân biệt bằng huy hiệu hình cây (nhỏ — đọc được ở 72 px nhưng không nổi bật). Sheet 2 #1 có vạch lưới mờ giữa ô → chọn #2. Đũa bát cơm tràn sang ô bên → tách theo vùng liền thay vì cắt lưới | sheet 1 #1, sheet 2 #2 |
| 2026-10-14 | script | Người dùng chọn tô màu dây buộc túi hạt theo loại (`art-source/raw/lot1/tools/seed_strings.py`, gốc ở `art-source/raw/lot1/icons-1/orig/`): cải `#4F8A3A`, khoai `#5A2F5E`, muống `#6EB5A6`, dưa `#A93226`, nếp `#E8C040` — khác cả độ sáng xám. Kiểm ở 72 px + xám: `art-source/raw/lot1/seed-strings-check.png` | Approved |
