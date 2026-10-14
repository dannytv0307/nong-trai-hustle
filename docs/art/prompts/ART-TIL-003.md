# ART-TIL-003 / 004 / 005 / 013 — Bộ tile đất ruộng: chưa cuốc · cuốc dở 2 nấc · đã cuốc · đã cuốc + tưới (+ cỏ nền ART-TIL-001)

> **Đã gen ở 4.2 (T-019, 2026-10-14)** — xem mục "Kết quả 4.2" cuối file. Phần dưới là bản nháp gốc (giữ để tham khảo).
> Kế thừa kết quả thử ART-TIL-001/002 (Art Bible §9.1: Gemini ra texture nối liền tốt; **một ảnh gen = 4×4 ô**, thu về 256 px).
> Cần thống nhất với `game-dev` cách dựng lớp (mục "Cách nối") trước khi gen.

| Mục | Giá trị |
|---|---|
| Loại | TIL (tile địa hình) |
| Dùng ở | Vườn — vùng ruộng đặt sẵn (24 ô, mở dần), GDD §3.4; Núi/khu khác dùng lại nếu có ruộng |
| Tỉ lệ gen (`--aspect`) | 1:1 (texture phủ kín, không tách nền) |
| Kích thước cuối | texture **256×256 = 4×4 ô 64** cho mỗi trạng thái + sheet viền do script vẽ (xem dưới) |
| Reference (`--ref`) | không ref ảnh nhân vật (§9.1). Có thể ref `tiles/tile-dirt-test.png` khi gen TIL-003 để cùng nét với đất cuốc |
| File trong game | `tiles/soil-dry.png` (TIL-003), `tiles/soil-till-1.png` + `soil-till-2.png` (TIL-013), `tiles/soil-tilled.png` (TIL-004), `tiles/soil-watered.png` (TIL-005), `tiles/soil-tilled-edge.png` (16 ô viền luống), `tiles/grass.png` (TIL-001); viền ruộng↔cỏ dùng chung `tiles/path-edge.png` + `path-corner.png` (thay bộ 9 ô) — mỗi file có bản `-ex.png` |
| Trạng thái | **Approved** (người dùng duyệt 2026-10-14) |

## Mô tả (tiếng Việt)

| ID | Trạng thái ô | Hình | Thang xám (mục tiêu) |
|---|---|---|---|
| ART-TIL-003 | Đất ruộng **chưa cuốc** (khô) | Nền gỗ/đất khô `#B98550`, vài vết nứt mực ngắn, lác đác búi cỏ khô vàng `#DDA933`/xanh mạ — đọc là "ruộng bỏ không", khác hẳn cỏ sân | L ≈ 143 (khác cỏ 156 ít → **bắt buộc có viền ruộng** để tách vùng) |
| ART-TIL-004 | **Đã cuốc** | Như ART-TIL-002 (nâu đất `#7A4B2A`, luống ngang có nét mực + nét sáng) — có thể dùng lại luôn ảnh thử nếu người dùng ưng | L ≈ 85 |
| ART-TIL-005 | **Đã cuốc + đã tưới** | Cùng texture TIL-004, **sẫm hơn** (màu phụ đề xuất "nâu đất ướt" `#553522`, L ≈ 60) + vài đốm bóng nước xanh nước/trắng điệp nhỏ | L ≈ 60 (phải phân biệt được với 85 ở thang xám) |

## Cách nối (đề xuất rẻ nhất mà vẫn đẹp, hợp Phaser Tilemap)

Phaser không có autotile sẵn; Tiled có Terrain/Wang nhưng ở đây ô đổi trạng thái **lúc chơi** (người chơi cuốc ô nào tùy ý) nên game phải tự tính ô viền. Đề xuất:

1. **AI chỉ gen texture lõi** (3 ảnh 4×4 ô, không viền) — thứ Gemini làm tốt. Không bắt AI vẽ 16/47 ô viền khớp nhau (rủi ro cao, nhiều vòng).
2. **Viền do script vẽ** (thêm lệnh `autotile16` vào `tools/process_image.py`, art-director viết ở 4.2):
   - **Đất đã cuốc / đã tưới: bộ 16 ô (4-bit, chỉ xét 4 cạnh trên-dưới-trái-phải).** Lớp viền là ảnh trong suốt đặt **trên** lớp texture: nét mực `#2E2118` ~3 px lượn nhẹ (kiểu khắc gỗ) ở cạnh nào giáp ô chưa cuốc, mép trên có dải sáng `#B98550` (bờ đất nhô), mép dưới dải tối (nhìn 3/4 thấy thành luống), góc ngoài bo tròn (dải ngoài góc tô màu đất khô để che lõi). 16 ô đủ vì ô đứng lẻ / hàng / khối chữ L đều đúng; 47 ô chỉ cần khi muốn bo cả góc lõm — không đáng ở 64 px.
   - **Đất khô ↔ cỏ: 9 ô (9-slice: 4 góc, 4 cạnh, giữa)** vì vùng ruộng là hình chữ nhật đặt sẵn, không đổi lúc chơi; dựng tĩnh trong Tiled. Nếu vùng ruộng thành hình chữ L thì thêm 4 góc lõm = 13 ô.
3. **Game dựng 2–3 lớp:** (a) texture lõi chọn ô theo tọa độ thế giới (`x mod 4`, `y mod 4`) để vân liền mạch; (b) lớp viền 16 ô, chỉ số = bitmask 4 hàng xóm (game-dev tính, ~20 dòng code); (c) **tưới = đổi lớp (a) sang `soil-watered.png`**, lớp viền giữ nguyên.
4. **ART-TIL-005 không cần gen**: script làm sẫm texture TIL-004 về `#553522` + chấm đốm nước (0 USD). Nếu trông "bẩn" thì gen riêng 2 ảnh nhanh.

Phương án lùi nếu viền script trông máy móc: mỗi ô cuốc là **một "mô đất" độc lập có viền riêng** (1 ô duy nhất mỗi trạng thái, không nối) — xấu hơn khi làm cả luống nhưng không cần bitmask.

## Prompt — đất ruộng chưa cuốc (ART-TIL-003)

```
Vietnamese Dong Ho woodblock folk print style adapted for a 2D game. Every shape is outlined with a bold hand-carved woodblock ink line in near-black brown #2E2118, slightly uneven and organic like a line cut with a knife into wood, of the same medium-thick weight on every object. Colors are printed as flat solid areas of natural mineral pigments, matte and slightly chalky, like ink pressed from separate carved blocks; colors sit inside the outlines with tiny imperfections. Shading is minimal: at most one flat darker tone on the bottom-right side, light always from the top-left, no gradients, no airbrush, no glossy highlights, no rim light. Shapes are simple, rounded, stylized and decorative like folk prints: round faces with small almond eyes and short curved brush-stroke eyebrows, leaves and grass drawn as repeated simple decorative strokes, thatch and bamboo drawn as rhythmic parallel lines. Chibi proportions, warm, rustic, naive folk-art charm with deadpan humor. Clean flat color surfaces with no paper texture painted in.
Tile: one single square seamless tileable ground texture for a top-down 2D farming game map, seen straight down from directly above (orthographic, completely flat, no perspective, no horizon, no light falloff). The texture fills the entire square edge to edge with no border and no frame, and the pattern continues seamlessly across all four edges so identical copies placed side by side join without any visible seam. Muted and low contrast so characters stand out on top of it. Even, uniform distribution with no large shapes, no focal point, no vignette.
Surface: dry, unploughed, hard-packed farm field soil waiting to be hoed. Flat solid base color dry earth tan #B98550 covering the whole square, with a few short thin dark #2E2118 ink crack lines, a few small slightly darker #7A4B2A flat patches, and sparse evenly scattered tiny dry grass tufts, each tuft three short strokes in straw yellow #DDA933 or a few in pale green #93B04F, like a repeated folk-print pattern. No furrows, no rows, no stones, no paths.
Palette: only #B98550 #7A4B2A #DDA933 #93B04F #2E2118.
Technical: no text, no grid lines, no tile border, no objects, no characters, no shadows.
Avoid: photorealistic, 3D render, CGI, glossy, smooth gradients, airbrush, soft shading, rim light, bloom, neon or saturated candy colors, modern mobile-game cartoon look, anime style, thin clean vector lines, painted paper texture, canvas texture, noise, text, letters, calligraphy, seal stamp, signature, watermark, UI, HUD, border frame, grid lines, tile grid overlay, isometric view, diagonal grid, close-up zoomed-in camera, perspective distortion, extra limbs, extra fingers, busy background, drop shadow on ground, objects, characters, perspective, furrows, ploughed rows, desert sand dunes, large cracks like broken tiles, photo texture, border, frame, vignette
```

## Prompt — đất đã cuốc (ART-TIL-004)

Dùng lại **prompt ART-TIL-002** ([ART-TIL-001.md](ART-TIL-001.md)) — đã nối liền tốt. Sửa nếu gen lại: "exactly four furrow rows" → model ra 6; chấp nhận 6 luống/256 px (≈ 1,5 luống/ô) hoặc ghi "exactly 8 thin furrow rows" để mỗi ô đúng 2 luống. Ưu tiên **dùng lại ảnh thử** `tiles/tile-dirt-test.png` nếu người dùng ưng (0 USD).

## Prompt — đất đã tưới (ART-TIL-005, chỉ khi script không đạt)

Như ART-TIL-004, thay câu màu nền: `Flat solid base color dark wet earth brown #553522 …, with a few small irregular flat puddle glints in water-blue #6E9FA6 with a tiny cream #EFE4C8 dot`. Palette: `#553522 #7A4B2A #6E9FA6 #EFE4C8 #2E2118`.

## Lệnh (dự kiến)

```
PY=.venv/Scripts/python
R=art-source/raw/soil
$PY tools/gen_image.py --prompt "$(cat $R/prompt-dry.txt)" --name soil-dry --out $R -n 3 --aspect 1:1
$PY tools/process_image.py tiletest <ảnh chọn> --out $R/tiletest-dry-256.png --size 256 --n 2
# 4.2: viết lệnh autotile16 / slice9 trong tools/process_image.py rồi:
# $PY tools/process_image.py autotile16 --base tiles/soil-tilled.png --out tiles/soil-tilled-edge.png --tile 64 --ink "#2E2118" --lip "#B98550"
```

## Ước tính chi phí

- TIL-003: 3 ảnh nhanh × ~2 vòng = 6 × 0,067 ≈ **0,40 USD** (tối đa 0,60).
- TIL-004: dùng lại ảnh thử **0 USD**; nếu gen lại ≈ 0,40.
- TIL-005: script **0 USD**; nếu phải gen 2 ảnh ≈ 0,13.
- Viền 16 ô + 9 ô: script, 0 USD (tốn công viết lệnh `autotile16`).

## Nhật ký gen

| Ngày | Lần | Thay đổi prompt | Kết quả (lỗi theo checklist) | Chọn |
|---|---|---|---|---|
| — | — | Chưa gen (nháp 2026-10-10) | — | — |
| 2026-10-14 | 1 | Cỏ: viết lại theo ảnh mẫu (búi thưa), ref `sample-dat-nen-bui-cay.png`, 2 ảnh | Nối liền, đúng màu ảnh mẫu, nhưng búi xếp thành lưới đều 1 búi/ô → script `scatter_tufts` rải lại ngẫu nhiên, búi không cắt qua mép ô | #2 → `grass.png` |
| 2026-10-14 | 1 | Đất chưa cuốc: thêm "weedy, tufts not in a grid", ref ảnh mẫu + `tile-dirt-test.png`, 2 ảnh | #1 búi dày, rối; #2 thưa, dịu, nối liền | #2 |
| 2026-10-14 | 1 | Cuốc dở 1 "vỡ cỏ", 2 ảnh | #1 cục đất viền mực đậm như đá, rối; #2 cục đất lẫn cỏ khô + rễ, đọc đúng "vỡ cỏ" | #2 |
| 2026-10-14 | 1 | Cuốc dở 2 "lổn nhổn", 2 ảnh | #1 thành đá lát; #2 cục to tròn như đá | — |
| 2026-10-14 | 2 | Lổn nhổn: "many small crumbly clumps", ref thêm ảnh đất khô + vỡ cỏ | Model chép gần y ảnh vỡ cỏ (ref thứ 3 quá mạnh) | — |
| 2026-10-14 | 1 | Đất đã cuốc gen lại cho cùng bộ: "exactly EIGHT furrow rows" (2 luống/ô), ref ảnh mẫu + đất khô + vỡ cỏ | #1 đúng 8 luống, nét cùng bộ, nối liền; ảnh thử cũ `tile-dirt-test` mịn/loang hơn nên thay | #1 → `soil-tilled.png` |
| 2026-10-14 | 3 | Lổn nhổn: tả là "luống 8 hàng còn méo, gãy, nhiều vụn đất nhỏ", ref ảnh mẫu + đất đã cuốc mới | Đúng ý: bước trung gian giữa vỡ cỏ và luống phẳng | #1 → `soil-till-2.png` |
| 2026-10-14 | script | Đất tưới = đất cuốc sẫm về `#553522` + 7 đốm nước (mỗi đốm gọn trong 1 ô); viền luống 16 ô (mực + mép sáng bắc + mặt đứng tối nam, góc lồi bo, ngoài góc tô màu đất khô) | Xám: cuốc 85 / tưới ~60 phân biệt được. Hai luống ô cạnh nhau ở nấc khác nhau lệch hàng — chấp nhận | — |

## Kết quả 4.2 — prompt đã dùng

Đất chưa cuốc:

```
[STYLE_PREFIX — Art Bible §3]
Reference images: image 1 shows the approved ground style (line weight, flat colors); image 2 is the approved hoed-soil tile of this game. Match their drawing style and scale; do NOT copy their layout.
Tile: one single square seamless tileable ground texture for a top-down 2D farming game map, seen straight down from directly above (orthographic, completely flat, no perspective, no horizon, no light falloff). The texture fills the entire square edge to edge with no border and no frame, and the pattern continues seamlessly across all four edges so identical copies placed side by side join without any visible seam. Even, uniform distribution with no focal point, no vignette.
Surface: an abandoned, never-ploughed dry farm plot overgrown with withered weeds, waiting to be hoed. Flat solid base color dry earth tan #B98550 covering the whole square, with a few short thin dark #2E2118 ink crack lines, a few small flat slightly darker #7A4B2A patches, and many small dry grass tufts scattered irregularly (not in rows, not in a grid), each tuft three to five short strokes in straw yellow #DDA933 with a thin #2E2118 ink line, a few tufts in faded green #93B04F. Reads clearly as "dry weedy field", different from a smooth footpath and from green lawn. No furrows, no rows, no stones, no path.
Palette: only #B98550 #7A4B2A #DDA933 #93B04F #2E2118.
Technical: no text, no grid lines, no tile border, no shadows.
Avoid: photorealistic, 3D render, CGI, glossy, smooth gradients, airbrush, soft shading, rim light, bloom, neon or saturated candy colors, modern mobile-game cartoon look, anime style, thin clean vector lines, painted paper texture, canvas texture, noise, text, letters, calligraphy, seal stamp, signature, watermark, UI, HUD, border frame, grid lines, tile grid overlay, isometric view, diagonal grid, close-up zoomed-in camera, perspective distortion, extra limbs, extra fingers, busy background, drop shadow on ground, objects, characters, houses, fences, plants, bushes, flowers, perspective, photo texture, border, frame, vignette, furrows, ploughed rows, desert sand dunes, large cracks like broken tiles, tufts arranged in a grid
```

Cuốc dở 1 (vỡ cỏ):

```
[STYLE_PREFIX — Art Bible §3]
Reference images: image 1 shows the approved ground style (line weight, flat colors); image 2 is the approved hoed-soil tile of this game. Match their drawing style and scale; do NOT copy their layout.
Tile: one single square seamless tileable ground texture for a top-down 2D farming game map, seen straight down from directly above (orthographic, completely flat, no perspective, no horizon, no light falloff). The texture fills the entire square edge to edge with no border and no frame, and the pattern continues seamlessly across all four edges so identical copies placed side by side join without any visible seam. Even, uniform distribution with no focal point, no vignette.
Surface: a dry weedy farm plot in the MIDDLE of being hoed for the first time, stage one "sod broken": the dry earth tan #B98550 ground with straw yellow #DDA933 dry grass tufts is chopped up — about half of the surface is still dry weedy ground, the other half is broken into many irregular overturned chunks of darker earth brown #7A4B2A soil clods, each clod a rounded lumpy shape with a #2E2118 ink outline and a lighter #B98550 top-left edge, with torn grass tufts and roots sticking out of the clods. Chunks scattered irregularly all over, not in rows. No neat furrows yet.
Palette: only #B98550 #7A4B2A #DDA933 #93B04F #2E2118.
Technical: no text, no grid lines, no tile border, no shadows.
Avoid: photorealistic, 3D render, CGI, glossy, smooth gradients, airbrush, soft shading, rim light, bloom, neon or saturated candy colors, modern mobile-game cartoon look, anime style, thin clean vector lines, painted paper texture, canvas texture, noise, text, letters, calligraphy, seal stamp, signature, watermark, UI, HUD, border frame, grid lines, tile grid overlay, isometric view, diagonal grid, close-up zoomed-in camera, perspective distortion, extra limbs, extra fingers, busy background, drop shadow on ground, objects, characters, houses, fences, plants, bushes, flowers, perspective, photo texture, border, frame, vignette, neat furrows, straight rows, stones, rocks, tufts arranged in a grid
```

Cuốc dở 2 (lổn nhổn, bản chọn v3):

```
[STYLE_PREFIX — Art Bible §3]
Reference images: image 1 shows the approved ground style; image 2 is the approved FINISHED hoed bed of this field (eight neat horizontal furrows). The new tile is the stage JUST BEFORE it: match its colors, line weight and scale exactly, do not copy it.
Tile: one single square seamless tileable ground texture for a top-down 2D farming game map, seen straight down from directly above (orthographic, completely flat, no perspective). The texture fills the entire square edge to edge with no border, and the pattern continues seamlessly across all four edges. Even, uniform distribution with no focal point, no vignette.
Surface: stage "rough lumpy soil, not yet raked": the same earth brown #7A4B2A soil as image 2, but the eight horizontal furrow rows are only roughly formed — wobbly, broken and interrupted, with MANY SMALL crumbly soil crumbs and small flat clumps (small, soft-edged, each no bigger than one sixteenth of the tile width) scattered along and between the rows, drawn with thin #2E2118 ink outlines and a lighter #B98550 top-left edge, plus a few short bits of dead straw yellow #DDA933 grass stems poking out. Messy but clearly on its way to becoming the neat bed of image 2.
Palette: only #7A4B2A #5E3A21 #B98550 #DDA933 #2E2118.
Technical: no text, no grid lines, no tile border, no shadows.
Avoid: photorealistic, 3D render, CGI, glossy, smooth gradients, airbrush, soft shading, rim light, bloom, neon or saturated candy colors, modern mobile-game cartoon look, anime style, thin clean vector lines, painted paper texture, canvas texture, noise, text, letters, calligraphy, seal stamp, signature, watermark, UI, HUD, border frame, grid lines, tile grid overlay, isometric view, diagonal grid, close-up zoomed-in camera, perspective distortion, extra limbs, extra fingers, busy background, drop shadow on ground, objects, characters, houses, fences, plants, bushes, flowers, perspective, photo texture, border, frame, vignette, stones, rocks, pebbles, boulders, cobblestones, large lumps, green grass, diagonal rows, vertical rows
```

Đất đã cuốc (8 luống):

```
[STYLE_PREFIX — Art Bible §3]
Reference images: image 1 shows the approved ground style (line weight, flat colors); image 2 is the approved "dry weedy field" tile and image 3 the approved "half-hoed, broken sod" tile of this same field. The new tile is the next stage of the same field: match their drawing style, line weight, colors and scale exactly; do NOT copy their layout.
Tile: one single square seamless tileable ground texture for a top-down 2D farming game map, seen straight down from directly above (orthographic, completely flat, no perspective, no horizon, no light falloff). The texture fills the entire square edge to edge with no border and no frame, and the pattern continues seamlessly across all four edges so identical copies placed side by side join without any visible seam. Even, uniform distribution with no focal point, no vignette.
Surface: final stage "finished hoed vegetable bed": the whole surface is smooth loose earth brown #7A4B2A soil raked into exactly EIGHT evenly spaced straight horizontal furrow rows running across the full width from the left edge to the right edge (rows reach both side edges so they continue into the next tile). Each row is a low rounded ridge: a thin lighter #B98550 highlight along its upper edge, flat earth brown body, and a thin uneven dark #2E2118 ink line plus a narrow flat darker #5E3A21 band along its lower edge; a few tiny crumbly soil specks on the ridges. Flat colors only, same line weight as the reference tiles. No grass, no stones, no clods.
Palette: only #7A4B2A #5E3A21 #B98550 #2E2118.
Technical: no text, no grid lines, no tile border, no shadows.
Avoid: photorealistic, 3D render, CGI, glossy, smooth gradients, airbrush, soft shading, rim light, bloom, neon or saturated candy colors, modern mobile-game cartoon look, anime style, thin clean vector lines, painted paper texture, canvas texture, noise, text, letters, calligraphy, seal stamp, signature, watermark, UI, HUD, border frame, grid lines, tile grid overlay, isometric view, diagonal grid, close-up zoomed-in camera, perspective distortion, extra limbs, extra fingers, busy background, drop shadow on ground, objects, characters, houses, fences, plants, bushes, flowers, perspective, photo texture, border, frame, vignette, gradients, wood planks, stones, rocks, clods, grass, diagonal rows, vertical rows
```

Cỏ nền:

```
[STYLE_PREFIX — Art Bible §3]
Use the attached reference image ONLY for its colors, line weight and drawing style of the ground (the packed-earth path and the grass lawn); do NOT copy its layout, house, fence, plants or path edges.
Tile: one single square seamless tileable ground texture for a top-down 2D farming game map, seen straight down from directly above (orthographic, completely flat, no perspective, no horizon, no light falloff). The texture fills the entire square edge to edge with no border and no frame, and the pattern continues seamlessly across all four edges so identical copies placed side by side join without any visible seam. Muted and low contrast so characters stand out on top of it. Even, uniform distribution with no large shapes, no focal point, no vignette, no direction (nothing runs only horizontally or only vertically).
Surface: short village grass lawn exactly like the lawn in the reference image. Flat solid base color fresh rice-seedling green #93B04F covering almost the whole square, with SPARSE small grass tufts scattered evenly and far apart (about twelve tufts in the whole square, lots of plain flat green between them), each tuft drawn as three to four short upward strokes in darker bronze green #3D6B4B, a few tufts with a thin dark #2E2118 ink stroke. No flowers, no stones, no paths, no dirt patches.
Palette: only #93B04F #3D6B4B #2E2118.
Technical: no text, no grid lines, no tile border, no shadows.
Avoid: photorealistic, 3D render, CGI, glossy, smooth gradients, airbrush, soft shading, rim light, bloom, neon or saturated candy colors, modern mobile-game cartoon look, anime style, thin clean vector lines, painted paper texture, canvas texture, noise, text, letters, calligraphy, seal stamp, signature, watermark, UI, HUD, border frame, grid lines, tile grid overlay, isometric view, diagonal grid, close-up zoomed-in camera, perspective distortion, extra limbs, extra fingers, busy background, drop shadow on ground, objects, characters, houses, fences, plants, bushes, flowers, perspective, photo texture, border, frame, vignette, dense grass, grass blades covering everything, yellow grass
```

Hậu kỳ: `.venv/Scripts/python tools/tile_edges.py lot1` (thu 256, rải búi cỏ, đất tưới, viền, bản `-ex`).

