# ART-TIL-001 / ART-TIL-002 — Thử tile cỏ và đất cuốc (nối liền)

| Mục | Giá trị |
|---|---|
| Loại | TIL (tile địa hình) |
| Dùng ở | Nền bản đồ Vườn nhà (thử nối liền, Art Bible §9.1) |
| Tỉ lệ gen (`--aspect`) | 1:1 |
| Kích thước cuối | 1 ảnh gen = **4×4 ô** (thu về 256 px, cắt 16 ô 64 px) — xem kết luận |
| Nền khi gen | không tách (texture phủ kín) |
| Pivot | — |
| Animation | không |
| Reference (`--ref`) | không dùng (Giả định: ref ảnh nhân vật dễ làm model vẽ thêm người lên tile) |
| File trong game | `web/client/public/assets/art/tiles/grass.png`, `tilled.png` (sau) |
| Trạng thái | Generated (thử nghiệm) |

## Prompt — cỏ (ART-TIL-001)

```
Vietnamese Dong Ho woodblock folk print style adapted for a 2D game. Every shape is outlined with a bold hand-carved woodblock ink line in near-black brown #2E2118, slightly uneven and organic like a line cut with a knife into wood, of the same medium-thick weight on every object. Colors are printed as flat solid areas of natural mineral pigments, matte and slightly chalky, like ink pressed from separate carved blocks; colors sit inside the outlines with tiny imperfections. Shading is minimal: at most one flat darker tone on the bottom-right side, light always from the top-left, no gradients, no airbrush, no glossy highlights, no rim light. Shapes are simple, rounded, stylized and decorative like folk prints: round faces with small almond eyes and short curved brush-stroke eyebrows, leaves and grass drawn as repeated simple decorative strokes, thatch and bamboo drawn as rhythmic parallel lines. Chibi proportions, warm, rustic, naive folk-art charm with deadpan humor. Clean flat color surfaces with no paper texture painted in.
Tile: one single square seamless tileable ground texture for a top-down 2D farming game map, seen straight down from directly above (orthographic, completely flat, no perspective, no horizon, no light falloff). The texture fills the entire square edge to edge with no border and no frame, and the pattern continues seamlessly across all four edges so identical copies placed side by side join without any visible seam. Muted and low contrast so characters stand out on top of it. Even, uniform distribution with no large shapes, no focal point, no vignette.
Surface: short village grass lawn. Flat solid base color fresh rice-seedling green #93B04F covering the whole square, with many small evenly scattered decorative grass tufts, each tuft drawn as three short curved strokes in darker bronze green #3D6B4B, like a repeated folk-print pattern; a few tufts have a tiny dark #2E2118 ink line. No flowers, no stones, no paths.
Palette: only #93B04F #3D6B4B #2E2118.
Technical: no text, no grid lines, no tile border, no objects, no characters, no shadows.
Avoid: photorealistic, 3D render, CGI, glossy, smooth gradients, airbrush, soft shading, rim light, bloom, neon or saturated candy colors, modern mobile-game cartoon look, anime style, thin clean vector lines, painted paper texture, canvas texture, noise, text, letters, calligraphy, seal stamp, signature, watermark, UI, HUD, border frame, grid lines, tile grid overlay, isometric view, diagonal grid, close-up zoomed-in camera, perspective distortion, turban, Indian turban, Indian headwrap, khan xep, sombrero, straw cowboy hat, Japanese or Chinese rice hat with flat or curved brim, rounded mushroom-shaped hat, extra limbs, extra fingers, busy background, drop shadow on ground, objects, characters, perspective, 3D grass blades, photo texture, border, frame, vignette
```

## Prompt — đất cuốc (ART-TIL-002)

```
Vietnamese Dong Ho woodblock folk print style adapted for a 2D game. Every shape is outlined with a bold hand-carved woodblock ink line in near-black brown #2E2118, slightly uneven and organic like a line cut with a knife into wood, of the same medium-thick weight on every object. Colors are printed as flat solid areas of natural mineral pigments, matte and slightly chalky, like ink pressed from separate carved blocks; colors sit inside the outlines with tiny imperfections. Shading is minimal: at most one flat darker tone on the bottom-right side, light always from the top-left, no gradients, no airbrush, no glossy highlights, no rim light. Shapes are simple, rounded, stylized and decorative like folk prints: round faces with small almond eyes and short curved brush-stroke eyebrows, leaves and grass drawn as repeated simple decorative strokes, thatch and bamboo drawn as rhythmic parallel lines. Chibi proportions, warm, rustic, naive folk-art charm with deadpan humor. Clean flat color surfaces with no paper texture painted in.
Tile: one single square seamless tileable ground texture for a top-down 2D farming game map, seen straight down from directly above (orthographic, completely flat, no perspective, no horizon, no light falloff). The texture fills the entire square edge to edge with no border and no frame, and the pattern continues seamlessly across all four edges so identical copies placed side by side join without any visible seam. Muted and low contrast so characters stand out on top of it. Even, uniform distribution with no large shapes, no focal point, no vignette.
Surface: freshly hoed farm soil of a vegetable field. Flat solid base color earth brown #7A4B2A covering the whole square, with exactly four evenly spaced straight horizontal furrow rows running across the full width from the left edge to the right edge, each furrow a darker brown band with a thin dark #2E2118 ink line along its lower edge and a thin lighter #B98550 highlight along its upper edge, plus a few tiny scattered soil clods drawn as small dots. Rows reach both side edges so the rows continue into the next tile.
Palette: only #7A4B2A #B98550 #2E2118.
Technical: no text, no grid lines, no tile border, no objects, no characters, no plants, no shadows.
Avoid: photorealistic, 3D render, CGI, glossy, smooth gradients, airbrush, soft shading, rim light, bloom, neon or saturated candy colors, modern mobile-game cartoon look, anime style, thin clean vector lines, painted paper texture, canvas texture, noise, text, letters, calligraphy, seal stamp, signature, watermark, UI, HUD, border frame, grid lines, tile grid overlay, isometric view, diagonal grid, close-up zoomed-in camera, perspective distortion, turban, Indian turban, Indian headwrap, khan xep, sombrero, straw cowboy hat, Japanese or Chinese rice hat with flat or curved brim, rounded mushroom-shaped hat, extra limbs, extra fingers, busy background, drop shadow on ground, objects, characters, perspective, plants, seedlings, photo texture, border, frame, vignette
```

## Lệnh

```
.venv/Scripts/python tools/gen_image.py --prompt "<prompt>" --name tile-grass --out art-source/raw/tile-test -n 1 --aspect 1:1
.venv/Scripts/python tools/process_image.py tiletest <tile.png> --out tiletest-grass.png --size 64 --n 3 --zoom 2
.venv/Scripts/python tools/process_image.py tiletest <tile.png> --out tiletest-grass-256.png --size 256 --n 2 --zoom 1
```

## Nhật ký gen

| Ngày | Lần | Thay đổi prompt | Kết quả | Chọn |
|---|---|---|---|---|
| 2026-10-09 | 1 | Bản đầu (model nhanh, không ref) | **Nối liền đạt**: ghép thẳng và lệch nửa ô đều không thấy đường nối, cả cỏ lẫn đất. **Nhưng mật độ chi tiết sai thang**: thu cả ảnh về 64 px thì búi cỏ thành lấm chấm nhiễu, đất 6 luống thành sọc như ván gỗ. Thu về 256 px (= 4×4 ô) thì đẹp, đúng nét. Đất ra 6 luống thay vì 4 | cả hai (dùng làm texture 4×4 ô) |
