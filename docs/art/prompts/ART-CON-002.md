# ART-CON-002 — Concept toàn cảnh "Xóm mở rộng" (D-040)

> Ảnh **concept tham chiếu** (không phải asset game): cho người dùng thấy hình dung mới của Xóm sau D-040 — bản đồ 72×50 ô, mỗi nhà có khuôn viên khép kín (rào/tường + cổng riêng), chợ phiên rộng, đình có NPC. Thay ART-CON-001 làm tham chiếu (bản cũ giữ nguyên).

| Mục | Giá trị |
|---|---|
| Loại | Concept / tham chiếu |
| Dùng ở | Tham chiếu bố cục + không khí cho bản đồ Xóm (chặng 4); không đưa vào game |
| Tỉ lệ gen (`--aspect`) | 3:2 (gần tỉ lệ bản đồ 72×50 ≈ 1,44) |
| Model | `--hq`, `--size 2K` |
| Reference (`--ref`) | `art-source/reference/sample-dat-nen-bui-cay.png` (lối đất nện, mép cỏ, cụm cây — §7.1) + `art-source/reference/concept-xom-lang-lay.png` (nét, màu, kiểu nhà) |
| File chọn | `art-source/reference/concept-xom-lang-lay-v2.png` |
| Trạng thái | Generated (chờ người dùng xem) |

## Mô tả (tiếng Việt)

Toàn cảnh Xóm nhìn từ trên cao hơi nghiêng (3/4 từ phía nam), mặt nhà song song mép ảnh. Lũy tre viền quanh. Lối đất nện: đường xóm ngang phía trên, đường cái ngang phía dưới, ngõ dọc nối, ngõ nhỏ chung giữa 2 nhà. Mỗi nhà một khuôn viên: nhà quay nam + sân + rào/tường + cổng riêng lệch một bên ở mặt nam (nhà rạ: rào tre đan / dâm bụt + cổng tre; nhà ngói: tường đất/gạch mộc thấp + chè tàu + cổng mái ngói nhỏ). Trên-trái: nhà tranh {ten} + ruộng 24 ô, rào dâm bụt; dưới nó nhà cô Ngóng (vườn rau + giàn mướp). Hàng trên: nhà ông Gật (vườn rau + chuồng gà), nhà cô Tám (quầy hạt ở hiên), giếng gạch trên bãi đất. Trên-phải: chợ phiên rộng (lều tre mái lá, quà bánh + quán chè, sạp thu mua, bà hàng xén, chị bán gà vịt, người gánh hàng). Giữa: 2 hàng × 4 khuôn viên (lò rèn khói, xưởng mộc, thửa lúa, giàn trầu + cau, nương chè, nhà hoang). Dưới-trái: hồ sen lớn, 2 bến câu, bến bậc gạch. Giữa dưới: cây đa + miếu. Dưới-phải: đình làng mái cong, cột đỏ, tường + cổng gạch, sân gạch có cụ từ, hai cụ đánh cờ tướng, ông mõ.

## Prompt chính

```
Vietnamese Dong Ho woodblock folk print style adapted for a 2D game. Every shape is outlined with a bold hand-carved woodblock ink line in near-black brown #2E2118, slightly uneven and organic like a line cut with a knife into wood, of the same medium-thick weight on every object. Colors are printed as flat solid areas of natural mineral pigments, matte and slightly chalky, like ink pressed from separate carved blocks; colors sit inside the outlines with tiny imperfections. Shading is minimal: at most one flat darker tone on the bottom-right side, light always from the top-left, no gradients, no airbrush, no glossy highlights, no rim light. Shapes are simple, rounded, stylized and decorative like folk prints: round faces with small almond eyes and short curved brush-stroke eyebrows, leaves and grass drawn as repeated simple decorative strokes, thatch and bamboo drawn as rhythmic parallel lines. Chibi proportions, warm, rustic, naive folk-art charm with deadpan humor. Clean flat color surfaces with no paper texture painted in.
The attached images are ONLY references: the first for the packed-earth dirt paths (smooth pale tan packed earth with faint wheel ruts, footprints, small pebbles, soft grassy scalloped edges over a narrow dark brown shoulder) and the clustered bushes and flowers; the second for line weight, flat colors and the style of the houses. Do NOT copy the second image's layout; follow the new layout below. People are tiny.
CONCEPT ART: a wide establishing overview of a whole traditional Northern Vietnamese (Red River Delta) village hamlet, bigger and richer than before, seen from high above at the classic top-down three-quarter angle of a cozy 2D farming game: camera looking north, every building faces south toward the viewer and is seen squarely from the front, front walls are flat rectangles parallel to the bottom edge of the image with a bit of roof visible above, all bottom edges perfectly horizontal, nothing rotated at an angle. Paths run straight left-right and up-down like streets, never diagonal. The whole hamlet fits in one frame, enclosed on all edges by a thick ring of green bamboo hedge. Warm sunny daytime, cheerful, lively and busy, not gloomy.
KEY IDEA: every house sits inside its own small walled or fenced compound: house at the back facing south, a small packed-earth or brick front yard, a clear boundary all around, and its own small gate placed off-center on the south side opening onto the path. Poor thatched houses have low woven bamboo fences or hibiscus hedges and a simple bamboo gate; better-off houses with old terracotta tile roofs have a low earthen or rough brick front wall plus trimmed tea-shrub hedges on the sides and a small gate with its own tiny tiled roof. Neighboring compounds share one fence line between them. Each compound has something growing beside the house.
PATHS: smooth pale tan packed-earth paths (#D9B577) with soft grassy edges: one long village lane running left-right across the upper part, one wide main road running left-right across the lower part, vertical alleys connecting them, and a narrow shared alley between pairs of compounds.
Layout, left to right and top to bottom:
- TOP-LEFT corner: the poorest little two-room thatched hut with cracked mud walls and a shaggy straw roof, inside a hibiscus-hedge compound together with a farm plot of 24 tilled brown soil squares (a neat 8 by 3 grid of beds).
- BELOW IT on the left edge: a thatched house compound with a woven bamboo fence, a vegetable garden of green rows and a bamboo trellis of luffa gourd vines.
- TOP ROW in the middle: a compound with a thatched house, a vegetable garden and a small woven bamboo chicken coop with tiny chickens; next to it a tiled-roof compound with a little seed stall on its front veranda (baskets and sacks of seeds); then a round red-brick village well on an open patch of bare packed earth.
- TOP-RIGHT corner: a WIDE, BUSY traditional Northern Vietnamese rural market fair on open packed ground: several open bamboo stalls and lean-tos with palm-leaf thatch roofs and vendors sitting at them: a woman with two shoulder-pole baskets of rice cakes and a little tea stall with low stools; a produce-buying stall with a hanging scale and piles of sacks, pumpkins and vegetables; an old peddler woman wearing a wooden tray box hung in front of her chest; a woman selling chickens and ducks with round woven bamboo cages. Many tiny shoppers in conical hats carrying shoulder poles walk between the stalls.
- CENTER: two straight horizontal rows of 4 compounds each (8 compounds in a neat grid separated by straight alleys), each with its own fence or wall and gate: a blacksmith compound with a forge shed and a puff of dark smoke; a carpenter compound with an open bamboo lean-to and stacked logs; a compound with a small green rice paddy plot; a compound with a betel vine trellis and a row of tall slender areca palms; a compound with a small neat patch of green tea bushes in rows; one abandoned compound with a broken-down fence, a hole in the roof and overgrown tall grass; the others plain thatched or tiled houses with yards.
- BOTTOM-LEFT: a large village pond with pink lotus flowers, round lotus leaves and duckweed, two small fishing spots on the bank, and a red-brick landing with brick steps going down into the water.
- BOTTOM MIDDLE: one huge ancient banyan tree with a broad rounded friendly canopy and hanging aerial roots, a tiny shrine at its foot; gentle and welcoming.
- BOTTOM-RIGHT: the village communal house (dinh lang): a long low wooden hall with a heavy dark tile roof whose corners curl upward, red wooden columns along the veranda, surrounded by a low brick wall with a brick gate, and a wide red-brick courtyard. In the courtyard: an old temple keeper in a dark robe and turban-like folded headband holding a big bundle of incense sticks and a broom; two old men sitting on a straw mat playing Chinese chess on a board, one with a long white beard, one bald holding a palm-leaf fan; a village crier standing at the gate tapping a wooden slit drum.
- Clusters of bushes, hibiscus, wild grass and lone bamboo clumps along fences and path edges (never on the paths), a few round longan trees, bright grass between compounds, a water buffalo and a few chickens.
Palette: limited palette using mainly #2E2118 #7A4B2A #B98550 #D9B577 #DDA933 #93B04F #3D6B4B #A93226 #2F4B73 #6E9FA6 #EFE4C8, plus brick red #9C4A32 and skin #E2B48A.
Technical: no text, no labels, no signboards, no map legend, no border frame, the whole village visible, wide establishing shot.
Avoid: isometric diagonal layout, buildings rotated 45 degrees, houses without fences, open houses with no gate, wooden pier, signboards with writing, Japanese architecture, Japanese temple, pagoda tower, Chinese palace, Thai temple, tall multi-tier roofs, torii gate, cherry blossoms, coconut trees, modern buildings, concrete, cars, power lines, photorealistic, 3D render, CGI, glossy, smooth gradients, airbrush, soft shading, rim light, bloom, neon or saturated candy colors, modern mobile-game cartoon look, anime style, thin clean vector lines, painted paper texture, canvas texture, noise, text, letters, calligraphy, seal stamp, signature, watermark, UI, HUD, border frame, grid lines, tile grid overlay, close-up zoomed-in camera, perspective distortion, giant character in foreground, spooky dark tree, night, gloomy, extra limbs, drop shadow on ground
```

## Negative

(Đã gộp vào dòng "Avoid" ở trên. Khác NEGATIVE chung: bỏ "turban / khan xep" vì cụ từ đội khăn xếp; bỏ "busy background" vì là ảnh toàn cảnh; giữ cấm cây dừa nhưng cho phép cau.)

## Ước tính chi phí

2–4 ảnh `--hq` × 0,134 ≈ 0,27–0,54 USD.

## Nhật ký gen

| Ngày | Lần | Thay đổi prompt | Kết quả (lỗi theo checklist) | Chọn |
|---|---|---|---|---|
| 2026-10-15 | 1 (2 ảnh `--hq` 2K, 3:2) | Bản đầu; `--ref` ảnh mẫu đất nện + concept cũ | #1: rào/cổng rõ, chợ đông, đình đủ 3 NPC (cụ từ hương + chổi, 2 cụ cờ tướng, ông mõ); nhưng ruộng 16 ô (4×4), khu giữa không ra lưới 2×4, cau giống dừa. #2: ruộng 24 ô (6×4), giữa đúng 2 hàng × 4 khuôn viên (lò rèn khói, xưởng mộc, thửa lúa, giàn trầu + cau / nương chè, nhà hoang rào đổ, 2 nhà thường), mỗi khuôn viên có rào/tường + cổng, vườn Ngóng có giàn mướp, nhà Gật có chuồng gà + vườn, chợ phiên đông có sạp + người gánh, đình tường + cổng gạch, ông mõ đứng cổng. Lỗi nhỏ #2: chỉ 1 người câu (thiếu bến câu thứ 2), bó hương của cụ từ khó thấy, đường cái phía dưới bị hồ/đa lấn, cau hơi giống dừa. Đủ dùng làm concept → dừng, không gen thêm | **#2** `xom-concept-v2_20261015-161203_2.png` → `art-source/reference/concept-xom-lang-lay-v2.png` |

So sánh (cũ | #1 | #2): `art-source/raw/xom-concept-v2/xom-concept-v2-compare.png`. Chi phí: 2 × 0,134 ≈ 0,27 USD.
