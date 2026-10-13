# ART-CON-001 — Concept toàn cảnh "Xóm làng Lầy"

> Ảnh **concept tham chiếu** (không phải asset game): cho người dùng thấy sớm không khí bản đồ xóm (xây thật ở chặng 4). Bố cục theo phác thảo `docs/design/sketches/xom-layout-nguoi-dung-2026-10-13.png`.

| Mục | Giá trị |
|---|---|
| Loại | Concept / tham chiếu |
| Dùng ở | Tham chiếu bố cục + không khí cho bản đồ xóm (chặng 4); không đưa vào game |
| Tỉ lệ gen (`--aspect`) | 16:9 |
| Model | `--hq` |
| Reference (`--ref`) | `art-source/reference/hero-front-src.png` (chỉ để khớp nét viền/màu) |
| File chọn | `art-source/reference/concept-xom-lang-lay.png` |
| Trạng thái | Generated — chọn #3 (chờ người dùng xem) |

## Mô tả (tiếng Việt)

Toàn cảnh xóm nhìn từ trên cao hơi nghiêng (3/4, phía nam nhìn lên). Trên-trái: nhà tranh nghèo của {ten} + ruộng 8×3 luống + cây nhãn. Cột trái dưới: nhà cô Ngóng, rào tre, giàn mướp. Hàng trên giữa: nhà ông Gật (chuồng gà), nhà cô Tám Thóc (quầy hạt ở hiên), giếng gạch tròn. Trên-phải: chợ cóc nhỏ. Giữa: lưới 2×4 nhà Bắc Bộ (có lò rèn khói đen, xưởng mộc lán tre, 1 nhà bỏ hoang). Dưới-trái: hồ làng sen bèo, bến bậc gạch, người câu cá. Dưới-phải: đình làng mái cong, cột đỏ, sân gạch. Giữa hồ và đình: cây đa cổ thụ hiền, miếu nhỏ. Đường đất, bụi cây, lũy tre bao quanh. Nắng ấm.

## Prompt chính

```
Vietnamese Dong Ho woodblock folk print style adapted for a 2D game. Every shape is outlined with a bold hand-carved woodblock ink line in near-black brown #2E2118, slightly uneven and organic like a line cut with a knife into wood, of the same medium-thick weight on every object. Colors are printed as flat solid areas of natural mineral pigments, matte and slightly chalky, like ink pressed from separate carved blocks; colors sit inside the outlines with tiny imperfections. Shading is minimal: at most one flat darker tone on the bottom-right side, light always from the top-left, no gradients, no airbrush, no glossy highlights, no rim light. Shapes are simple, rounded, stylized and decorative like folk prints: round faces with small almond eyes and short curved brush-stroke eyebrows, leaves and grass drawn as repeated simple decorative strokes, thatch and bamboo drawn as rhythmic parallel lines. Chibi proportions, warm, rustic, naive folk-art charm with deadpan humor. Clean flat color surfaces with no paper texture painted in.
The attached image is ONLY a reference for line weight, outline color and flat coloring style. Do NOT draw that character large; people in this scene are tiny.
CONCEPT ART: a wide establishing shot of a whole small traditional Northern Vietnamese (Red River Delta) village hamlet, seen from high above at the classic top-down three-quarter angle of a cozy 2D farming game, camera looking north, every building facing straight south toward the viewer, seen squarely from the front: its front wall is a flat rectangle parallel to the bottom edge of the image with a bit of its roof visible above, bottom edges perfectly horizontal, no building rotated at an angle. Main dirt paths run straight left-right and up-down like streets between blocks, not diagonal. The whole hamlet fits in one wide landscape frame, enclosed on all edges by a ring of dense green bamboo hedges. Warm sunny daytime, cheerful and peaceful mood.
Layout, left to right and top to bottom:
- TOP-LEFT corner: a small poor two-room thatched hut with cracked mud walls and a shaggy straw roof, beside it a tiny square farm field with 8 short rows of tilled brown soil in 3 strips, and one longan tree.
- LEFT COLUMN below it: a tall plot with a modest thatched house, a low woven bamboo fence and a trellis of luffa gourd vines.
- TOP MIDDLE: two neighbor houses side by side: one with a small woven bamboo chicken coop and a few tiny chickens; the other with a little seed stall on its front porch (baskets and sacks of seeds). Next to them, a round red-brick village well on a patch of bare packed earth.
- TOP-RIGHT corner: a SMALL humble village market: three or four little thatched huts and open bamboo stalls with baskets of vegetables, and a tiny tea stall with a palm-leaf roof. Small and modest, not grand.
- CENTER: a neat block of exactly 8 houses arranged in 2 straight horizontal rows of 4, evenly spaced like a grid of plots with straight paths between them, in old Northern Vietnamese countryside style: most with thatched straw roofs and earthen walls, a few with old weathered terracotta fish-scale tile roofs and bare red-brick walls, each with a front veranda of wooden posts. Among them: a blacksmith shed with a broken tile roof and a puff of dark smoke from its chimney; a carpenter workshop under an open bamboo lean-to with stacked logs; and one abandoned house with a hole in its roof.
- BOTTOM-LEFT: a large village pond covering much of the lower left, with pink lotus flowers, round lotus leaves and floating duckweed, a little red-brick bathing landing with brick steps going down into the water at its edge (not a wooden dock), and one tiny villager in a conical hat sitting fishing with a bamboo rod.
- BOTTOM-RIGHT: the village communal house (dinh lang): a long low wooden hall with a heavy dark tile roof whose four corners curl gently upward, red-painted wooden columns along the front veranda, and a wide courtyard paved with red bricks.
- BETWEEN THE POND AND THE COMMUNAL HOUSE: one huge ancient banyan tree with a broad rounded friendly canopy and many aerial roots hanging down like a curtain, with a tiny little shrine at its foot. The banyan looks gentle, kind and welcoming, not spooky.
- Winding light-brown packed-dirt paths connect all the houses; low hedges of tea shrubs, wild hedge shrubs and red hibiscus flowers line the alleys; a few round longan trees scattered around; patches of bright grass between plots.
- A few tiny villagers, chickens and a water buffalo, all very small, just small details among many elements.
Palette: limited palette using mainly #2E2118 #7A4B2A #B98550 #DDA933 #93B04F #3D6B4B #A93226 #2F4B73 #6E9FA6 #EFE4C8, plus brick red #9C4A32.
Technical: no text, no labels, no signboards, no map legend, no border frame, the whole village visible, wide establishing shot.
Avoid: isometric diagonal layout, buildings rotated 45 degrees, wooden pier, signboards with writing, Japanese architecture, Japanese temple, pagoda tower, Chinese palace, Thai temple, tall multi-tier roofs, torii gate, cherry blossoms, palm trees, coconut trees, modern buildings, concrete, cars, power lines, photorealistic, 3D render, CGI, glossy, smooth gradients, airbrush, soft shading, rim light, bloom, neon or saturated candy colors, modern mobile-game cartoon look, anime style, thin clean vector lines, painted paper texture, canvas texture, noise, text, letters, calligraphy, seal stamp, signature, watermark, UI, HUD, border frame, grid lines, tile grid overlay, isometric view, diagonal grid, close-up zoomed-in camera, perspective distortion, giant character in foreground, spooky dark tree, night, gloomy, extra limbs, drop shadow on ground
```

## Negative

(Đã gộp vào dòng "Avoid" ở trên.)

## Ước tính chi phí

2–4 ảnh `--hq` × 0,134 ≈ 0,27–0,54 USD.

## Nhật ký gen

| Ngày | Lần | Thay đổi prompt | Kết quả (lỗi theo checklist) | Chọn |
|---|---|---|---|---|
| 2026-10-13 | 1 (2 ảnh `--hq`) | Bản đầu | Đúng chất Bắc Bộ, cây đa hiền, đình cột đỏ; nhưng bố cục chéo kiểu isometric, nhà xoay nghiêng, lưới 2×4 không rõ; #1 có biển hiệu nhỏ giống chữ; #2 bến nước thành cầu gỗ | — |
| 2026-10-13 | 2 (2 ảnh `--hq`) | Thêm: mặt nhà song song mép ảnh, đường thẳng ngang/dọc, "đúng 8 nhà 2 hàng 4", bến bậc gạch (không cầu gỗ), không biển hiệu; Avoid isometric/xoay 45° | Cả 2 khớp phác thảo; #3 lưới 2×4 liền khối, xưởng mộc + nhà hoang nằm trong lưới, giống sketch nhất | **#3** `xom-concept_20261013-144332_1.png` → `art-source/reference/concept-xom-lang-lay.png` |

So sánh 4 bản: `art-source/raw/xom-concept/xom-concept-compare.png`.
