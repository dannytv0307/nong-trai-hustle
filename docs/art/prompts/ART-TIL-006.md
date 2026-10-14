# ART-TIL-006 / ART-TIL-014 — Lối đất nện + sân đất nện (+ mép cỏ tự nối)

| Mục | Giá trị |
|---|---|
| Loại | TIL (tile địa hình) |
| Dùng ở | Mọi lối đi Vườn + Xóm (D-035), sân nhà {ten}, sân giếng, bãi trống |
| Tỉ lệ gen (`--aspect`) | 1:1 (texture phủ kín, không tách nền), model nhanh |
| Kích thước cuối | lõi 256 = 4×4 ô 64; mép `path-edge.png` 256 (16 ô 4-bit) + `path-corner.png` 128 (4 ô góc lõm, 2×2) — mép do script `tools/tile_edges.py` vẽ |
| Reference (`--ref`) | `art-source/reference/sample-dat-nen-bui-cay.png` (người dùng duyệt, D-035) |
| File trong game | `tiles/path.png`, `tiles/yard.png`, `tiles/path-edge.png`, `tiles/path-corner.png` (+ bản `-ex.png` đệm 1 px) |
| Trạng thái | **Approved** (người dùng duyệt 2026-10-14) |

## Mô tả

Đất nện nâu vàng `#D9B577`, vệt mòn sáng `#E6CD8B`, sỏi nhỏ viền mực, vài dấu chân trần. **Bỏ 2 vệt bánh xe khỏi texture lõi** (Giả định): texture lặp theo cả hai chiều, vệt chạy dọc sẽ cắt ngang khi đường đi ngang → nếu cần vệt bánh xe cho đường cái thì làm lớp trang trí riêng sau. Sân = cùng màu, mảng quét sáng to hơn, ít sỏi, không dấu chân.

Mép cỏ (script): cỏ lấn vào đất thành răng cưa búi nhỏ + viền mực ~2 px + vai đường `#7A4B2A` 6 px. Dùng chung cho **mọi ô đất (lối, sân, ruộng mọi trạng thái) giáp cỏ**. Giữa lối và sân không có mép.

## Prompt — lối đất nện

```
[STYLE_PREFIX — Art Bible §3, dán nguyên văn]
Use the attached reference image ONLY for its colors, line weight and drawing style of the ground (the packed-earth path and the grass lawn); do NOT copy its layout, house, fence, plants or path edges.
Tile: one single square seamless tileable ground texture for a top-down 2D farming game map, seen straight down from directly above (orthographic, completely flat, no perspective, no horizon, no light falloff). The texture fills the entire square edge to edge with no border and no frame, and the pattern continues seamlessly across all four edges so identical copies placed side by side join without any visible seam. Muted and low contrast so characters stand out on top of it. Even, uniform distribution with no large shapes, no focal point, no vignette, no direction (nothing runs only horizontally or only vertically).
Surface: hard-packed bare earth of a Vietnamese village footpath, exactly like the path in the reference image, seen from directly above. Flat solid base color warm sandy ochre #D9B577 covering the whole square; a few soft-edged irregular flat worn patches in lighter cream ochre #E6CD8B; a few slightly darker flat #C9A267 patches; several tiny pebbles drawn as small ovals filled #B98550 with a thin #2E2118 ink outline, scattered evenly and sparsely; two or three small pairs of faint bare footprints drawn with thin #B98550 lines, pointing in different directions. Compacted, smooth and flat, not sand, not soil clods. No wheel ruts, no long lines, no grass, no edges, no stones paving.
Palette: only #D9B577 #E6CD8B #C9A267 #B98550 #2E2118.
Technical: no text, no grid lines, no tile border, no shadows.
Avoid: photorealistic, 3D render, CGI, glossy, smooth gradients, airbrush, soft shading, rim light, bloom, neon or saturated candy colors, modern mobile-game cartoon look, anime style, thin clean vector lines, painted paper texture, canvas texture, noise, text, letters, calligraphy, seal stamp, signature, watermark, UI, HUD, border frame, grid lines, tile grid overlay, isometric view, diagonal grid, close-up zoomed-in camera, perspective distortion, extra limbs, extra fingers, busy background, drop shadow on ground, objects, characters, houses, fences, plants, bushes, flowers, perspective, photo texture, border, frame, vignette, grass, wheel ruts, long straight streaks, cobblestones, paving stones, brick, sand dunes, cracks, mud puddles
```

## Prompt — sân đất nện

```
[STYLE_PREFIX — Art Bible §3, dán nguyên văn]
Use the attached reference image ONLY for its colors, line weight and drawing style of the ground (the packed-earth path and the grass lawn); do NOT copy its layout, house, fence, plants or path edges.
Tile: one single square seamless tileable ground texture for a top-down 2D farming game map, seen straight down from directly above (orthographic, completely flat, no perspective, no horizon, no light falloff). The texture fills the entire square edge to edge with no border and no frame, and the pattern continues seamlessly across all four edges so identical copies placed side by side join without any visible seam. Muted and low contrast so characters stand out on top of it. Even, uniform distribution with no large shapes, no focal point, no vignette, no direction (nothing runs only horizontally or only vertically).
Surface: smooth swept hard-packed bare earth courtyard in front of a Vietnamese thatched farmhouse, the same color as the path in the reference image, seen from directly above. Flat solid base color warm sandy ochre #D9B577 covering the whole square; a few large soft-edged irregular flat swept patches in lighter cream ochre #E6CD8B; very few tiny pebbles (four or five in the whole square) drawn as small ovals filled #B98550 with a thin #2E2118 ink outline; a few very faint short broom-sweep arcs in #C9A267. Calmer and cleaner than a footpath. No footprints, no wheel ruts, no grass, no edges.
Palette: only #D9B577 #E6CD8B #C9A267 #B98550 #2E2118.
Technical: no text, no grid lines, no tile border, no shadows.
Avoid: photorealistic, 3D render, CGI, glossy, smooth gradients, airbrush, soft shading, rim light, bloom, neon or saturated candy colors, modern mobile-game cartoon look, anime style, thin clean vector lines, painted paper texture, canvas texture, noise, text, letters, calligraphy, seal stamp, signature, watermark, UI, HUD, border frame, grid lines, tile grid overlay, isometric view, diagonal grid, close-up zoomed-in camera, perspective distortion, extra limbs, extra fingers, busy background, drop shadow on ground, objects, characters, houses, fences, plants, bushes, flowers, perspective, photo texture, border, frame, vignette, grass, wheel ruts, footprints, cobblestones, paving stones, brick, sand dunes, cracks, mud puddles
```

## Lệnh

```
.venv/Scripts/python tools/gen_image.py --prompt "$(cat art-source/raw/lot1/prompts/path.txt)" --name til-path --out art-source/raw/lot1/til-path -n 2 --aspect 1:1 --ref art-source/reference/sample-dat-nen-bui-cay.png
.venv/Scripts/python tools/process_image.py tiletest <ảnh> --out <x>.png --size 256 --n 2
.venv/Scripts/python tools/tile_edges.py lot1      # thu 256, vẽ mép, xuất -ex
```

## Nhật ký gen

| Ngày | Lần | Thay đổi prompt | Kết quả (lỗi theo checklist) | Chọn |
|---|---|---|---|---|
| 2026-10-14 | 1 | Bản đầu, ref ảnh mẫu, 2 ảnh lối + 2 ảnh sân | Lối #1: đúng màu ảnh mẫu, sỏi + vệt mòn + dấu chân, nối liền (ghép thẳng và lệch nửa ô). #2: lặp 2×2 bên trong ảnh → lộ ô. Sân #1 sỏi quá to; #2 mảng quét sáng, ít sỏi, nối liền | lối #1 (`til-path_20261014-101307_1`), sân #2 (`til-yard_20261014-101332_2`) |
| 2026-10-14 | script | Mép 16 + 4 ô bằng `tools/tile_edges.py` | Ngã ba, góc lõm, sân nối lối đều liền; xám: lối sáng hơn cỏ, vai đường tách rõ. Lỗi nhỏ: chỗ sân giáp lối thấy mảng sáng của sân bị cắt thẳng theo mép ô | — |
