# ART-TIL-003 / 004 / 005 — Bộ tile đất ruộng: chưa cuốc (khô) · đã cuốc · đã cuốc + tưới — NHÁP

> **NHÁP — CHƯA GEN.** Làm ở bước **4.2**. Kế thừa kết quả thử ART-TIL-001/002 (Art Bible §9.1: Gemini ra texture nối liền tốt; **một ảnh gen = 4×4 ô**, thu về 256 px).
> Cần thống nhất với `game-dev` cách dựng lớp (mục "Cách nối") trước khi gen.

| Mục | Giá trị |
|---|---|
| Loại | TIL (tile địa hình) |
| Dùng ở | Vườn — vùng ruộng đặt sẵn (24 ô, mở dần), GDD §3.4; Núi/khu khác dùng lại nếu có ruộng |
| Tỉ lệ gen (`--aspect`) | 1:1 (texture phủ kín, không tách nền) |
| Kích thước cuối | texture **256×256 = 4×4 ô 64** cho mỗi trạng thái + sheet viền do script vẽ (xem dưới) |
| Reference (`--ref`) | không ref ảnh nhân vật (§9.1). Có thể ref `tiles/tile-dirt-test.png` khi gen TIL-003 để cùng nét với đất cuốc |
| File trong game | `tiles/soil-dry.png` (TIL-003), `tiles/soil-dry-edge.png` (9 ô viền ruộng↔cỏ), `tiles/soil-tilled.png` (TIL-004), `tiles/soil-tilled-edge.png` (16 ô viền), `tiles/soil-watered.png` (TIL-005) — gốc `web/client/public/assets/art/` |
| Trạng thái | **Planned (NHÁP)** — chưa gen |

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
