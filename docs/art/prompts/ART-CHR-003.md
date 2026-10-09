# ART-CHR-003 — {ten} bậc ngoại hình 2–4 (Người bình thường, Khá giả, Phú ông)

| Mục | Giá trị |
|---|---|
| Loại | CHR |
| Dùng ở | Sprite bản đồ (đổi theo `outfitTier`, GDD §3.14), hiệu ứng "lột xác", nguồn `--ref` cho 4 hướng + chân dung từng bậc |
| Tỉ lệ gen (`--aspect`) | 1:1 |
| Kích thước cuối | 64×96 px (~1,5 ô), pivot đáy; cả 4 bậc cắt **cùng một khung** từ ảnh 1024 để giữ đúng tỉ lệ với nhau |
| Nền khi gen | màu phẳng `#00FF00` |
| Pivot | bottom |
| Animation | bằng code (như ART-CHR-002) |
| Reference (`--ref`) | `art-source/reference/hero-front-src.png` (bậc 1, chống nạnh chính diện) |
| File trong game | `web/client/public/assets/art/characters/hero-tier2-down.png`, `hero-tier3-down.png`, `hero-tier4-down.png` (tạm ở `art-source/raw/hero-tiers/`; chưa có `web/client/`) |
| Trạng thái | Generated → Processed (chờ người dùng duyệt) |

## Mô tả (tiếng Việt)

"Thay đồ, giữ người" theo story bible §3.1a: cùng mặt, cùng tỉ lệ chibi, cùng dáng chống nạnh 3/4 trước như ảnh mẫu bậc 1. Mọi bậc giữ **chi tiết đỏ son** (quai nón; bậc 3 thêm thắt lưng; bậc 4 quai vắt chéo ngực + dây xu) và **hình chóp nón lá** (bậc 2–3 trên đầu, bậc 4 sau lưng).

- **Bậc 2 — Người bình thường:** nón cũ, chỗ rách chữ V vá miếng lá ngà xanh nhạt khâu thô; áo nâu lành gấu, bỏ vá khuỷu; dây vải nâu; quần xắn gần đều; dép cói.
- **Bậc 3 — Khá giả:** nón mới lành, quai đỏ, vẫn đội lệch; áo cánh chàm tay xắn, hàng cúc vải; thắt lưng vải đỏ son; túi tiền nâu; quần nâu nhạt ống thẳng; guốc mộc.
- **Bậc 4 — Phú ông:** khăn xếp đen thấp đỉnh phẳng (không turban); nón lá đeo sau lưng, quai đỏ vắt ngang ngực; áo the nâu đỏ sẫm dài quá gối; quần trắng; guốc đen; quạt giấy; dây 3 đồng xu lỗ vuông buộc dây đỏ; bụng hơi phệ.

**Màu áo the bậc 4 (Giả định):** nâu đỏ sẫm "đậm và đỏ hơn #7A4B2A" — ra khoảng `#7E3A2A`–`#8A3F2E`, nằm giữa nâu đất `#7A4B2A` và đỏ gạch `#9C4A32` (màu phụ đã cho phép). Không thêm màu mới vào bảng khóa.

Quy tắc prompt: khối "OUTFIT CHANGE of the attached reference image… Only his clothes change" thay cho token bậc 1 (không dán token bậc 1, vì nó tả áo rách/chân đất sẽ kéo ngược lại). Bậc 2–3 giữ "khan xep" trong Avoid; bậc 4 **bỏ "khan xep" khỏi Avoid** (vì giờ cần nó) nhưng giữ turban.

## Prompt chính — bậc 2

```
Vietnamese Dong Ho woodblock folk print style adapted for a 2D game. Every shape is outlined with a bold hand-carved woodblock ink line in near-black brown #2E2118, slightly uneven and organic like a line cut with a knife into wood, of the same medium-thick weight on every object. Colors are printed as flat solid areas of natural mineral pigments, matte and slightly chalky, like ink pressed from separate carved blocks; colors sit inside the outlines with tiny imperfections. Shading is minimal: at most one flat darker tone on the bottom-right side, light always from the top-left, no gradients, no airbrush, no glossy highlights, no rim light. Shapes are simple, rounded, stylized and decorative like folk prints: round faces with small almond eyes and short curved brush-stroke eyebrows, leaves and grass drawn as repeated simple decorative strokes, thatch and bamboo drawn as rhythmic parallel lines. Chibi proportions, warm, rustic, naive folk-art charm with deadpan humor. Clean flat color surfaces with no paper texture painted in.
OUTFIT CHANGE of the attached reference image: draw EXACTLY the same character as the reference - the same face (same round face, thick black brush-stroke eyebrows, small almond eyes, the same smug toothy grin), the same skin tone, the same chibi proportions (big head about one third of body height, about 2.5 heads tall), the same pose (standing facing the viewer in three-quarter front view, both fists on his hips, chest puffed out, chin raised, feet apart), the same size and position in the frame, the same bold dark brown-black outline weight and the same flat two-tone cel coloring. Only his clothes change, as described below.
Tier 2 outfit "ordinary decent villager" - a little less poor than the reference:
- Hat: still the SAME old conical leaf hat (non la) from the reference, cream #EFE4C8 with straw #DDA933 shading, pointed tip, wide straight sloping brim, still worn tilted to one side, same thin vermilion red #A93226 chin strap knotted under the chin. The V-shaped torn notch in the brim is now MENDED with a patch of fresh pale greenish-cream leaf sewn in with big visible crude stitches; the V-shaped mended patch is clearly visible on the brim.
- Shirt: the same sleeveless earth-brown #7A4B2A peasant shirt but now INTACT: neat straight hem, no frayed or torn edges, even colour. No patch on the elbow anymore, bare arms clean. Shirt front plain.
- Belt: a simple brown cloth sash belt tied in a small knot (no more straw rope).
- Trousers: dark brown trousers rolled up almost evenly on both legs, just below the knee (only very slightly uneven).
- Feet: woven straw sandals with crossed straw-coloured #DDA933 straps.
Colours: earth brown, straw yellow, cream hat, vermilion red chin strap.
Full body, whole figure visible from the top of the head to the feet, game sprite for a top-down farming game, same scale as the reference.
Composition: centered, single subject, generous padding, isolated on a plain flat solid #00FF00 green background, nothing else in the frame.
Technical: no text, no ground shadow, clean silhouette, readable at small size.
Palette: limited palette using only #2E2118 #7A4B2A #B98550 #DDA933 #A93226 #2F4B73 #EFE4C8 plus skin tone #E2B48A.
```

Negative bậc 2:

```
torn shirt, frayed hem, rope belt, bare feet, elbow patch, missing piece of hat brim, photorealistic, 3D render, CGI, glossy, smooth gradients, airbrush, soft shading, rim light, bloom, neon or saturated candy colors, modern mobile-game cartoon look, anime style, thin clean vector lines, painted paper texture, canvas texture, noise, text, letters, calligraphy, seal stamp, signature, watermark, UI, HUD, border frame, grid lines, tile grid overlay, isometric view, diagonal grid, close-up zoomed-in camera, perspective distortion, turban, Indian turban, Indian headwrap, sombrero, straw cowboy hat, Japanese or Chinese rice hat with flat or curved brim, rounded mushroom-shaped hat, extra limbs, extra fingers, busy background, drop shadow on ground, khan xep
```

## Prompt chính — bậc 3

```
Vietnamese Dong Ho woodblock folk print style adapted for a 2D game. Every shape is outlined with a bold hand-carved woodblock ink line in near-black brown #2E2118, slightly uneven and organic like a line cut with a knife into wood, of the same medium-thick weight on every object. Colors are printed as flat solid areas of natural mineral pigments, matte and slightly chalky, like ink pressed from separate carved blocks; colors sit inside the outlines with tiny imperfections. Shading is minimal: at most one flat darker tone on the bottom-right side, light always from the top-left, no gradients, no airbrush, no glossy highlights, no rim light. Shapes are simple, rounded, stylized and decorative like folk prints: round faces with small almond eyes and short curved brush-stroke eyebrows, leaves and grass drawn as repeated simple decorative strokes, thatch and bamboo drawn as rhythmic parallel lines. Chibi proportions, warm, rustic, naive folk-art charm with deadpan humor. Clean flat color surfaces with no paper texture painted in.
OUTFIT CHANGE of the attached reference image: draw EXACTLY the same character as the reference - the same face (same round face, thick black brush-stroke eyebrows, small almond eyes, the same smug toothy grin), the same skin tone, the same chibi proportions (big head about one third of body height, about 2.5 heads tall), the same pose (standing facing the viewer in three-quarter front view, both fists on his hips, chest puffed out, chin raised, feet apart), the same size and position in the frame, the same bold dark brown-black outline weight and the same flat two-tone cel coloring. Only his clothes change, as described below.
Tier 3 outfit "well-off villager" - clean and proud:
- Hat: a BRAND-NEW intact conical leaf hat (non la): perfectly cone-shaped with a sharp pointed tip and a wide straight sloping brim with a smooth even round edge, bright clean cream #EFE4C8 with clear thin concentric ring ribs and straw #DDA933 shading, NO tear, NO notch, NO patch. Tied with a new vermilion red #A93226 silk chin strap knotted under his chin. Still worn tilted to one side (he is a show-off).
- Shirt: a clean indigo #2F4B73 Vietnamese peasant tunic (ao canh) with long sleeves rolled up to the elbows, a short row of small cloth knot buttons down the front, no patches, neat hem.
- Belt: a vermilion red #A93226 cloth sash tied in a knot at his side with two short ends hanging down - a clearly visible red band around his waist.
- A small plain brown cloth money pouch hanging at his hip.
- Trousers: light brown #B98550 trousers, neat, straight legs, not rolled up, reaching the ankles.
- Feet: simple wooden clogs: flat natural wood soles with a black cloth strap across the foot.
- Face: cheeks slightly fuller than the reference (better fed), same smug toothy grin.
Colours: indigo, cream hat, vermilion red strap and sash, light brown.
Full body, whole figure visible from the top of the head to the feet, game sprite for a top-down farming game, same scale as the reference.
Composition: centered, single subject, generous padding, isolated on a plain flat solid #00FF00 green background, nothing else in the frame.
Technical: no text, no ground shadow, clean silhouette, readable at small size.
Palette: limited palette using only #2E2118 #7A4B2A #B98550 #DDA933 #A93226 #2F4B73 #EFE4C8 plus skin tone #E2B48A.
```

Negative bậc 3:

```
torn hat, notch in hat brim, patch, sleeveless shirt, brown shirt, rope belt, bare feet, rolled-up trousers, photorealistic, 3D render, CGI, glossy, smooth gradients, airbrush, soft shading, rim light, bloom, neon or saturated candy colors, modern mobile-game cartoon look, anime style, thin clean vector lines, painted paper texture, canvas texture, noise, text, letters, calligraphy, seal stamp, signature, watermark, UI, HUD, border frame, grid lines, tile grid overlay, isometric view, diagonal grid, close-up zoomed-in camera, perspective distortion, turban, Indian turban, Indian headwrap, sombrero, straw cowboy hat, Japanese or Chinese rice hat with flat or curved brim, rounded mushroom-shaped hat, extra limbs, extra fingers, busy background, drop shadow on ground, khan xep
```

## Prompt chính — bậc 4 (bản đã sửa, vòng 2)

```
Vietnamese Dong Ho woodblock folk print style adapted for a 2D game. Every shape is outlined with a bold hand-carved woodblock ink line in near-black brown #2E2118, slightly uneven and organic like a line cut with a knife into wood, of the same medium-thick weight on every object. Colors are printed as flat solid areas of natural mineral pigments, matte and slightly chalky, like ink pressed from separate carved blocks; colors sit inside the outlines with tiny imperfections. Shading is minimal: at most one flat darker tone on the bottom-right side, light always from the top-left, no gradients, no airbrush, no glossy highlights, no rim light. Shapes are simple, rounded, stylized and decorative like folk prints: round faces with small almond eyes and short curved brush-stroke eyebrows, leaves and grass drawn as repeated simple decorative strokes, thatch and bamboo drawn as rhythmic parallel lines. Chibi proportions, warm, rustic, naive folk-art charm with deadpan humor. Clean flat color surfaces with no paper texture painted in.
OUTFIT CHANGE of the attached reference image: draw EXACTLY the same character as the reference - the same face (same round face, thick black brush-stroke eyebrows, small almond eyes, the same smug toothy grin), the same skin tone, the same chibi proportions (big head about one third of body height, about 2.5 heads tall), the same pose (standing facing the viewer in three-quarter front view, both fists on his hips, chest puffed out, chin raised, feet apart), the same size and position in the frame, the same bold dark brown-black outline weight and the same flat two-tone cel coloring. Only his clothes change, as described below.
Tier 4 outfit "rich village gentleman (phu ong)" - he now dresses like a wealthy old-style Vietnamese gentleman, but his face is still the same young smug guy:
- Head: NO conical hat on the head. Instead he wears a black Vietnamese khan xep: a SHORT, STIFF, LOW CYLINDER BAND of black #2E2118 cloth, shaped like a low flat pillbox or a short wide drum ring sitting level on his head. Its top is completely FLAT and LEVEL like a table top, it hugs the skull tightly (no wider than the head), and its height is SHORT - only about one fifth of the head height, from the hairline to just above the crown. The front of the band shows 5 or 6 thin, perfectly HORIZONTAL parallel stripes like stacked rings (the pleats), drawn as thin dark-brown lines. Short black hair is visible at the temples below the band. It is NOT a turban and NOT a cap: not tall, not puffy, not rounded or dome-shaped, not a beanie or beret, no bun or knot or topknot anywhere, no diagonal or twisted folds, no loose tail of cloth, no jewel or brooch.
- His new intact cream #EFE4C8 conical leaf hat now HANGS ON HIS BACK, tilted: its sharp POINTED TIP sticks up and out clearly behind one shoulder so the cone shape is easy to read, the rest of the brim peeks out behind his other shoulder, and its vermilion red #A93226 strap runs across the front of his neck and chest as a clear diagonal red line.
- Robe: a Vietnamese men's ao dai made of thin gauze (ao the) in a deep reddish-brown (darker and redder than #7A4B2A), long, reaching below the knees, side-fastened with buttons along the right side of the chest, wide loose sleeves, a white #EFE4C8 inner collar visible at the neck.
- Belly: a small round pot belly pushes the robe forward (only the belly is round; arms, legs and face stay chibi-slim). He leans back a little, chin raised even higher, cheeks a little chubbier.
- Accessories: a closed folded paper fan held in his right hand resting on his hip; a necklace of 3 to 5 big round bronze coins with square holes, golden #DDA933, strung on a vermilion red #A93226 cord hanging on his chest.
- Trousers: white #EFE4C8 wide-legged trousers visible below the robe. Feet: black-lacquered wooden clogs.
- No beard, no moustache, no teacup.
Full body, whole figure visible from the top of the head to the feet, game sprite for a top-down farming game, same scale as the reference.
Composition: centered, single subject, generous padding, isolated on a plain flat solid #00FF00 green background, nothing else in the frame.
Technical: no text, no ground shadow, clean silhouette, readable at small size.
Palette: limited palette using only #2E2118 #7A4B2A #B98550 #DDA933 #A93226 #2F4B73 #EFE4C8 plus skin tone #E2B48A, and the deep reddish-brown of the robe.
```

Negative bậc 4:

```
bun, topknot, hair knot, beanie, beret, knit cap, puffy cap, tall hat, rounded dome headwear, turban, tall wrapped headwrap, puffy rounded head cloth, diagonal twisted folds on head, cloth tail hanging from head, brooch on headwear, conical hat worn on the head, beard, moustache, teacup, fat body, fat arms, photorealistic, 3D render, CGI, glossy, smooth gradients, airbrush, soft shading, rim light, bloom, neon or saturated candy colors, modern mobile-game cartoon look, anime style, thin clean vector lines, painted paper texture, canvas texture, noise, text, letters, calligraphy, seal stamp, signature, watermark, UI, HUD, border frame, grid lines, tile grid overlay, isometric view, diagonal grid, close-up zoomed-in camera, perspective distortion, turban, Indian turban, Indian headwrap, sombrero, straw cowboy hat, Japanese or Chinese rice hat with flat or curved brim, rounded mushroom-shaped hat, extra limbs, extra fingers, busy background, drop shadow on ground
```

## Lệnh

```
.venv/Scripts/python tools/gen_image.py --prompt "<prompt bậc N + Avoid>" --name hero-tierN --out art-source/raw/hero-tiers --ref art-source/reference/hero-front-src.png -n 2 --aspect 1:1 --hq
.venv/Scripts/python tools/process_image.py removebg art-source/raw/hero-tiers/tierN-src.png art-source/raw/hero-tiers/tierN-nobg.png --color "#00FF00" --tol 70 --holes 30 --despill
# cắt cùng một khung cho cả 4 bậc (hợp bbox, tỉ lệ 2:3, neo đáy) rồi thu về 64×96 -> hero-tierN-down.png (script tạm, không phải fit riêng từng ảnh,
# vì fit riêng sẽ phóng bậc có đầu thấp hơn to hơn)
.venv/Scripts/python tools/process_image.py sheet tier1-big.png tier2-big.png tier3-big.png tier4-big.png --out art-source/raw/hero-tiers/tiers-sheet.png
.venv/Scripts/python tools/process_image.py preview art-source/raw/hero-tiers/tiers-strip-64x96.png --display 280 --out art-source/raw/hero-tiers/tiers-preview.png
```

## Nhật ký gen

| Ngày | Lần | Thay đổi prompt | Kết quả (lỗi theo checklist) | Chọn |
|---|---|---|---|---|
| 2026-10-09 | 1 | Bậc 2, 3, 4 mỗi bậc 2 ảnh, `--hq`, `--ref` bậc 1. Khối "OUTFIT CHANGE… same face, same pose" + mô tả đồ từng món | Bậc 2: cả 2 đúng người, đúng dáng, miếng vá nón rõ; #2 thắt lưng vẫn ra dây thừng xoắn → chọn #1 (dây vải). Bậc 3: cả 2 đạt (chàm, thắt lưng đỏ, túi tiền, guốc) → chọn #1. Bậc 4: áo the, quạt, dây xu, nón sau lưng đều đúng, nhưng **khăn xếp cao, phồng, có búi tóc phía sau** — giống mũ nồi/turban; chóp nón sau lưng khó đọc | bậc 2 #1, bậc 3 #1 |
| 2026-10-09 | 2 | Chỉ bậc 4: khăn tả lại thành "SHORT STIFF LOW CYLINDER BAND… low flat pillbox… top FLAT and LEVEL… 5–6 HORIZONTAL stripes… no bun/knot/topknot, not a beanie/beret"; nón sau lưng "POINTED TIP sticks up and out behind one shoulder"; Avoid thêm bun, topknot, beanie, beret, knit cap, puffy cap, tall hat, dome | #2: **hết búi**, đỉnh phẳng, nếp ngang, chóp nón lộ rõ sau vai trái → đạt (khăn vẫn hơi cao hơn khăn xếp thật một chút). #1 vẫn còn búi | bậc 4 #2 |

Bản prompt bậc 4 vòng 1 (để so): khăn tả là "LOW, flat, stiff ring… like a short flat drum… about one quarter of the head height" — model vẫn vẽ thành mũ phồng có búi.
