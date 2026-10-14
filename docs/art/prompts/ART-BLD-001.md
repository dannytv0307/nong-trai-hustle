# ART-BLD-001 + ART-BG-011 + ART-PRP-010 + ART-PRP-011 — Nhà {ten}: bên ngoài, trong nhà, nội thất, bếp

| Mục | Giá trị |
|---|---|
| Loại | BLD / BG / PRP |
| Dùng ở | Vườn → Xóm (nhà {ten}, T-024); cảnh trong nhà (T-093) |
| Tỉ lệ gen (`--aspect`) | nhà 4:3 `--hq` · trong nhà 16:9 `--hq` · bếp 16:9 `--hq` · nội thất 16:9 nhanh · nón ông nội 1:1 nhanh |
| Kích thước cuối | nhà **384×320** (6×5 ô) · nền trong nhà **1280×720** (20×11,25 ô, vừa khít màn khi `cameraZoom` 1,5) · giường 128×128 · hũ gạo, rương, nón 64×64 · bếp rơm / bếp gạch 128×128 |
| Nền khi gen | `#FF00FF` (tách bằng khóa màu: r−g>60 và b−g>60 → trong suốt, gồm khe nan giường). Nền trong nhà: không tách, chỉ xóa viền kem ngoài tường |
| Pivot | `setOrigin(0.5, 1)`; nền trong nhà origin (0,0); nón treo vách origin giữa |
| Animation | bằng code: lửa, khói bếp, cửa |
| Reference (`--ref`) | `art-source/reference/sample-dat-nen-bui-cay.png` (ảnh 1: style đất/cây/nhà tranh) + `art-source/reference/hero-front-src.png` (ảnh 2: độ dày nét) |
| File trong game | `props/house-hero.png`, `backgrounds/house-interior.png`, `props/house-bed.png`, `props/house-hu-gao.png`, `props/house-ruong.png`, `props/house-non-ong.png`, `props/stove-rom.png`, `props/stove-gach.png` — số đo, chân đế, điểm cửa trong `props/props.json` |
| Trạng thái | **Approved** (người dùng duyệt 2026-10-14) |

## Mô tả (tiếng Việt)

- **Nhà {ten}** (story bible §2.2, D-027): nhà tranh 2 gian nghèo nhất xóm, quay mặt nam, nhìn chính diện 3/4 từ trên: mái rạ xơ xác có miếng vá, vách đất vàng xám nứt, một mảng tróc lộ phên tre, cửa liếp tre hé mở, cửa sổ chấn song tre, hiên 3 cột tre cong, **chõng tre trên hiên** (giường tạm khi chờ T-093), bậc thềm đất. Hài kiểu "nghèo mà tỉnh".
- **Trong nhà**: một phòng rỗng nhìn từ trên kiểu game nông trại: vách sau (nứt, mảng tróc lộ phên, cửa sổ chấn song, xà gỗ, mép mái rạ), sàn đất nện `#D9B577`, tường trước có khe cửa + cánh liếp mở. Đồ đạc là sprite riêng để game đặt và va chạm.
- **Nội thất**: giường tre (dựng dọc, gối vá chàm), hũ gạo sành nâu, rương gỗ nắp vồng nẹp sắt, nón lá cũ của ông nội treo chốt gỗ.
- **Bếp**: bếp rơm (3 hòn đầu rau ám khói, nồi đất đen, tro, bó rơm) và bếp gạch đỏ `#9C4A32` có ống khói (nâng cấp nhiệm vụ 8). **Không vẽ lửa/khói** — code thêm.

## Prompt chính (khung chung)

`{P}` = STYLE_PREFIX (Art Bible §3) · `{REF}`, `{VIEW}`, `{NEG}`, `{TECH}` như dưới. Prompt đầy đủ đã dùng: `art-source/raw/lot1/prompts/{bld-house,bg-interior,prp-furniture,prp-stoves-v2,prp-hat}.txt` (ghép bằng `art-source/raw/lot1/tools/build_prompts.py` từ `prompts/bodies.txt`).

```
{REF} = Reference images: image 1 is the approved style of this game for ground, plants, fence and thatched hut (bold uneven dark-brown ink outline, flat chalky colors, leaves and thatch as repeated simple decorative strokes, two flat tones, light from the top-left); image 2 is the style anchor character of the game, shown only for line weight and color feel. Match that style exactly. Do not draw any person.
{VIEW} = Classic top-down 2D farming game three-quarter view: we see the front face of each object plus a little of its top, the bottom edge of each object is horizontal, no isometric angle, no perspective vanishing.
{TECH} = Technical: no text, no ground, no shadow on the ground, clean silhouettes, readable at small size, flat solid background color everywhere around and between the objects.
```

**Nhà (bld-house):**
```
{P}
{REF}
Game sprite of ONE house: the poorest little thatched hut of a North Vietnamese village (Red River Delta), for a top-down 2D farming game. {VIEW} The house faces SOUTH, toward the camera: we see its long front side and a large part of its thatched roof from above.
The hut: a small two-bay hut, wider than tall. A thick, ragged, messy rice-straw thatch roof (hip roof, the ridge running left-right) in straw yellow #DDA933 with darker #B98550 bands, drawn as rhythmic parallel thatch strokes, uneven shaggy eaves, a few tufts sticking out and one patched worn spot. Walls of yellow-grey mud plaster #B98550 with a few big CRACKS and one spot where the plaster fell off showing the bamboo lattice inside. A low front porch under the eaves held by three thin crooked bamboo posts, a low packed-earth step. In the center of the front wall a doorway closed by a woven bamboo-slat door panel propped half open, dark inside. One small square window with bamboo bars. On the porch at the left, a small low bamboo daybed. Humble, shabby, but cozy and funny, not creepy.
Composition: one single house, front view three-quarter top-down, centered, the bottom edge of the porch step horizontal at the bottom, the whole roof visible, generous padding, isolated on a plain flat solid magenta #FF00FF background. No yard, no ground, no fence, no trees, no people.
Palette: limited palette using only #2E2118 #7A4B2A #B98550 #DDA933 #EFE4C8 #3D6B4B #93B04F.
{TECH}
Avoid: {NEG}, tile roof, brick walls, glass windows, chimney, two-storey, stilts, isometric corner view, house seen from the side corner, ruin, haunted
```

**Trong nhà (bg-interior):** "Game background: the EMPTY INSIDE of the poorest little thatched hut… back (north) wall seen from the front as a band across the top, left/right walls seen from above as thick bands, front wall a thick band along the bottom edge with a doorway gap in the middle… NOT isometric. Floor of smooth packed earth #D9B577… The floor area is completely EMPTY…" (đủ ở file prompt).

**Bếp (prp-stoves-v2):** thêm khối CAMERA "both objects are seen STRAIGHT FROM THE FRONT… the front face of each object is a flat rectangle parallel to the bottom edge, NO side face, NOT seen from a corner" + Avoid "isometric cube, object seen from a corner, two visible side faces, diagonal edges".

**Nội thất (prp-furniture)**, **nón ông nội (prp-hat)**: 4 món một hàng / 1 món, cùng khung.

## Negative

```
{NEG} = photorealistic, 3D render, CGI, glossy, smooth gradients, airbrush, soft shading, rim light, bloom, neon or saturated candy colors, modern mobile-game cartoon look, anime style, thin clean vector lines, painted paper texture, canvas texture, noise, text, letters, numbers, labels, calligraphy, seal stamp, signature, watermark, UI, HUD, border frame, grid lines, tile grid overlay, isometric view, diagonal grid, close-up zoomed-in camera, perspective distortion, extra limbs, busy background, drop shadow on ground, cast shadow, ground plane, grass patch under objects, soil patch, people, characters, faces
```

## Lệnh

```
PY=.venv/Scripts/python; R=art-source/raw/lot1
$PY $R/tools/build_prompts.py
$PY tools/gen_image.py --prompt "$(cat $R/prompts/bld-house.txt)" --name bld-house-v1 --out $R/bld-house --ref art-source/reference/sample-dat-nen-bui-cay.png --ref art-source/reference/hero-front-src.png -n 2 --aspect 4:3 --hq
$PY $R/tools/props2.py house interior furniture stoves      # khóa màu, tách món, thu về cỡ ô, đặt file
$PY $R/tools/scene2.py                                      # cảnh ghép thử ngoài + trong nhà
```

## Nhật ký gen

| Ngày | Lần | Thay đổi prompt | Kết quả (lỗi theo checklist) | Chọn |
|---|---|---|---|---|
| 2026-10-14 | nhà v1 (2 hq 4:3) | Prompt trên | #1 nhìn chéo góc kiểu isometric (sai §7); #2 chính diện, đủ mái vá, vách nứt, phên lộ, cửa liếp, chõng hiên — mái hơi "hình học" (khung tre viền), chấp nhận | **#2** |
| 2026-10-14 | trong nhà v1 (2 hq 16:9) | Prompt trên | Cả 2 đạt kiểu phòng game nông trại. #1 vách cùng màu nhà bên ngoài, sạch hơn; #2 vách xám hơn | **#1** |
| 2026-10-14 | bếp v1 (2 hq 16:9) | Prompt trên | Cả 2 vẽ bếp gạch nhìn chéo góc (khối isometric) | — |
| 2026-10-14 | bếp v2 (2 hq) | Thêm khối CAMERA chính diện + Avoid góc chéo | #1 bếp gạch gần chính diện, nồi ám khói, bó rơm; #2 vẫn chéo | **#1** |
| 2026-10-14 | nội thất v1 (2 nhanh 16:9) | Prompt trên | #1 giường chéo góc; #2 giường nhìn từ trên (dựng dọc), hũ, 2 rương (dùng rương chính diện); nón treo cả 2 bản trông như cái quạt rách | **#2** (trừ nón) |
| 2026-10-14 | nón ông nội v1 (2 nhanh 1:1) | Tả nón hình tam giác chóp nhọn, quai chàm thõng, chốt gỗ | Cả 2 đạt; #1 gọn hơn | **#1** |
