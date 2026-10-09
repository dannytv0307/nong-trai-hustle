# Art Bible — Bride Price Hustle

> Chủ sở hữu: `art-director` · Trạng thái style: **ĐÃ KHÓA** (bước 2.2, D-014) — hướng #2 Đông Hồ hiện đại hóa (D-012), ảnh mẫu là nhân vật chính #4 người dùng đã duyệt.
> **Style anchor:** `art-source/reference/hero-front.png` (đã tách nền) · bản gốc nền xanh để truyền `--ref`: `art-source/reference/hero-front-src.png` · thêm `hero-back.png`, `hero-side.png` cho các hướng khác.
> **Khi chữ trong STYLE_PREFIX và ảnh mẫu lệch nhau thì theo ảnh mẫu** (xem §10.2).
> Ảnh thử bước 2.1: `art-source/raw/style-test/style-compare.png` (ảnh #2 = `best-2-dongho.png`). Ảnh này chỉ để tham khảo hướng, **không dùng làm `--ref`** vì còn giống hoạt hình phổ thông, sai zoom và có lưới.

## 1. Mood & keywords

**Mộc mạc · dân gian · ấm · lầy (hài tưng tửng)**

Như một bức tranh Đông Hồ được "chuyển động": nét mực in mộc, màu khoáng phẳng, hình tròn trịa, mặt người và con vật hơi ngộ nghĩnh. Hài nằm ở **dáng và biểu cảm**, không nằm ở màu chói.

## 2. Công cụ

| Mục | Giá trị |
|---|---|
| Gen ảnh | Gemini image trên Vertex AI — `tools/gen_image.py` (model trong `tools/config.json`; `--hq` cho ảnh mẫu, nhân vật chính, chân dung, icon) |
| Hậu kỳ | `tools/process_image.py` (removebg / fit / preview / sheet) |
| Nền khi gen | Màu phẳng `#00FF00` cho sprite (không có màu xanh lá nào trong bảng màu đạt độ tươi này). Sprite có nhiều xanh lá (tre, cây, cỏ lau) → dùng `#FF00FF` |
| Ảnh mẫu (style anchor) | `art-source/reference/hero-front-src.png` (nền `#00FF00`, dùng cho `--ref`) và `hero-front.png` (đã tách nền) — truyền `--ref` cho **mọi** lần gen sprite/chân dung/vật thể. Tile nền: không truyền ảnh nhân vật (Giả định, xem §9.1) |
| Vân giấy điệp | **Không vẽ vào asset.** Phủ bằng code trong game (xem §6.4) |

## 3. STYLE_PREFIX (dán nguyên văn vào mọi prompt)

```
Vietnamese Dong Ho woodblock folk print style adapted for a 2D game. Every shape is outlined with a bold hand-carved woodblock ink line in near-black brown #2E2118, slightly uneven and organic like a line cut with a knife into wood, of the same medium-thick weight on every object. Colors are printed as flat solid areas of natural mineral pigments, matte and slightly chalky, like ink pressed from separate carved blocks; colors sit inside the outlines with tiny imperfections. Shading is minimal: at most one flat darker tone on the bottom-right side, light always from the top-left, no gradients, no airbrush, no glossy highlights, no rim light. Shapes are simple, rounded, stylized and decorative like folk prints: round faces with small almond eyes and short curved brush-stroke eyebrows, leaves and grass drawn as repeated simple decorative strokes, thatch and bamboo drawn as rhythmic parallel lines. Chibi proportions, warm, rustic, naive folk-art charm with deadpan humor. Clean flat color surfaces with no paper texture painted in.
```

Ghi chú: so với bản thử (`p2b.txt`), bản này **bỏ vân giấy vẽ vào ảnh**, đẩy mạnh nét khắc gỗ, màu in mộc/khoáng, mắt hạnh nhân + lông mày nét bút kiểu tranh dân gian, lá/rơm/tre vẽ bằng nét lặp trang trí — để không trông giống hoạt hình phổ thông. Bước 2.2 sẽ kiểm lại; nếu vẫn lệch thì sửa ở đây (ghi changelog).

## 4. NEGATIVE

```
photorealistic, 3D render, CGI, glossy, smooth gradients, airbrush, soft shading, rim light, bloom, neon or saturated candy colors, modern mobile-game cartoon look, anime style, thin clean vector lines, painted paper texture, canvas texture, noise, text, letters, calligraphy, seal stamp, signature, watermark, UI, HUD, border frame, grid lines, tile grid overlay, isometric view, diagonal grid, close-up zoomed-in camera, perspective distortion, turban, Indian turban, Indian headwrap, khan xep, sombrero, straw cowboy hat, Japanese or Chinese rice hat with flat or curved brim, rounded mushroom-shaped hat, extra limbs, extra fingers, busy background, drop shadow on ground
```

(Với sprite cần tách nền: bỏ "busy background", thêm "isolated on a plain flat #00FF00 background". Với tile nền: thêm "objects, characters".)

## 5. Bảng màu khóa

Màu lấy cảm hứng từ màu tranh Đông Hồ (đen than lá tre, đỏ son, vàng hoa hòe, xanh chàm, xanh đồng, trắng điệp). Độ sáng thang xám: L = 0.299R + 0.587G + 0.114B (0–255).

| Vai trò | Hex | L (xám) | Ghi chú |
|---|---|---|---|
| Mực viền (outline) | `#2E2118` | 36 | Mọi viền, mắt, tóc. Không dùng đen thuần `#000` |
| Nâu đất (đất cuốc, áo nâu, vách) | `#7A4B2A` | 85 | Màu đất ruộng, áo cánh của {ten} |
| Gỗ / đất khô / đường | `#B98550` | 143 | Đường mòn, cột, chõng, rương |
| Vàng hoa hòe (rơm, mái rạ, xu, thứ có lợi) | `#DDA933` | 171 | Màu "tốt": tiền, thu hoạch, lấp lánh |
| Xanh mạ (cỏ sáng, cây con) | `#93B04F` | 156 | Cỏ nền tông sáng, mầm cây |
| Xanh đồng thẫm (tre, lá, bóng cỏ) | `#3D6B4B` | 90 | Lũy tre, tán cây, tông tối của cỏ |
| Đỏ son (quai nón, mào gà, nguy hiểm) | `#A93226` | 84 | Quai nón {ten}, cột đình, pháo cưới; dấu hiệu nguy hiểm |
| Chàm (miếng vá, nước sâu, bóng tối) | `#2F4B73` | 71 | Miếng vá lưng áo, nước sâu, màn đêm |
| Xanh nước (suối, giếng) | `#6E9FA6` | 145 | Mặt nước sáng |
| Trắng điệp (highlight, nón lá, giấy UI) | `#EFE4C8` | 228 | Điểm sáng, mắt, mặt nón lá, giấy UI, bọt nước |

Màu phụ cho phép khi cần (chỉ thêm khi asset bắt buộc, ghi changelog): tím sim `#6B3F6E`, đỏ gạch làng Sung `#9C4A32`, da người `#E2B48A`.

**Kiểm tra thang xám (đã tính):**
- Đạt: cây con (156) và rơm/xu (171) nổi rõ trên đất cuốc (85); viền mực (36) tách mọi thứ khỏi nền; trắng điệp (228) luôn là điểm sáng nhất.
- **Rủi ro 1:** đỏ son (84) ≈ nâu đất (85) ≈ xanh đồng (90) ở thang xám. Vì vậy **nguy hiểm không được chỉ dựa vào màu đỏ**: vật nguy hiểm (gai, cây héo, rắn, mũi tên) phải có **hình nhọn/răng cưa + viền mực dày + điểm trắng điệp**; vật có lợi **tròn + vàng hoa hòe**. Nón lá của {ten} (228) là điểm sáng nhất trên bản đồ nên nhận ra ngay ở mọi nền; quai đỏ chỉ là điểm nhấn màu.
- **Rủi ro 2:** xanh nước (145) ≈ xanh mạ (156) ≈ gỗ (143). Mép nước bắt buộc có **viền mực + một dải bọt trắng điệp**; đường mòn gỗ/đất khô có viền mép đất nâu.
- Mỗi asset mới phải qua `process_image.py preview` (sáng / tối / xám) trước khi duyệt.

## 6. Hình khối, tỉ lệ, ánh sáng

### 6.1 Hình khối
- **Tròn = thân thiện / có lợi** (người, gà, bí, xu, thúng). **Nhọn, răng cưa = nguy hiểm / xấu** (gai, cây héo, bong bóng chửi thề, mũi nỏ).
- Đơn giản kiểu tranh in: ít chi tiết nhỏ; chi tiết lặp lại thành hoa văn (lá tre, sợi rơm, vảy cá, lông gà) bằng nét mực ngắn đều.
- Mặt người: mặt tròn, mắt hạnh nhân nhỏ, lông mày nét bút cong, má ửng một chấm đỏ son nhạt (tùy nhân vật). Biểu cảm phóng đại ở miệng và lông mày.

### 6.2 Tỉ lệ
- Chibi **khoảng 2,5 đầu** (đầu ≈ 1/3 chiều cao, đúng handoff story bible §3.1).
- Trên bản đồ: nhân vật cao **khoảng 1,5 ô** (64×96 px), gà ≈ 0,6 ô, nhà tranh ≈ 3×3 ô, lũy tre cao ≈ 2–3 ô.
- {ten}: nón lá chóp nhọn, vành rộng ≈ 1,6–1,8 lần bề ngang đầu, đội lệch, vành rách một mảnh, quai đỏ — phải nhận ra ở 32 px.

### 6.3 Viền, đổ bóng, ánh sáng
- **Viền:** một màu `#2E2118`, cùng độ dày cho mọi vật ở cùng thang đo. Ở sprite cuối 64 px/ô: viền ngoài ≈ 3 px, nét trong ≈ 2 px (Giả định, kiểm ở 2.2).
- **Đổ bóng:** tối đa 2 tông (màu gốc + 1 tông tối phẳng ở phía dưới-phải). Không gradient.
- **Hướng sáng cố định: trên-trái.**
- **Bóng dưới chân:** không vẽ vào sprite (game tự vẽ một hình elip mờ màu chàm dưới chân bằng code, để đồng nhất).

### 6.4 Vân giấy điệp — phủ bằng code, không vẽ vào asset
- Mọi tile, sprite, chân dung, UI gen ra **mặt màu sạch, không vân**. Lý do: vân giấy vẽ vào từng tile sẽ không nối liền qua mép ô, và lặp lại lộ ô.
- Trong game (`game-dev` làm): một lớp ảnh vân giấy điệp (ánh lấp lánh vỏ sò rất nhẹ) phủ toàn màn, cố định theo màn hình hoặc cuộn chậm, chế độ hòa trộn Multiply/Overlay, độ đậm khoảng 8–15%. Ảnh vân giấy (`fx/paper-overlay.png`, ô vân seamless 512px) do `art-director` làm ở chặng sau.

## 7. Góc nhìn camera

| Loại asset | Góc nhìn |
|---|---|
| Tile địa hình (cỏ, đất, ruộng, nước, đường) | **Nhìn thẳng từ trên xuống (orthogonal)**, lưới ô song song mép màn hình. Mặt phẳng, không phối cảnh. **Không isometric, không lưới chéo** |
| Vật thể lớn (nhà, cây, đá, chuồng, lũy tre, giếng) | **Top-down hơi nghiêng (3/4 kiểu game nông trại cổ điển)**: thấy mặt trước + một chút mái/đỉnh; cạnh đáy nằm ngang |
| Nhân vật, con vật trên bản đồ | Cùng góc 3/4: thấy mặt trước + chút đỉnh đầu. 4 hướng: xuống (mặt), lên (lưng — lộ miếng vá chàm), trái, phải (phải = lật trái nếu đối xứng được) |
| Vật phẩm, icon | Nhìn chính diện hơi nghiêng, đơn lẻ, giữa khung |
| Chân dung thoại | Chính diện hoặc 3/4, ngang ngực, tông tranh dân gian |
| Ảnh toàn cảnh (menu, cưới) | Tự do bố cục, giữ đúng nét và màu |

## 8. Character tokens

### {ten} — nhân vật chính

> Đổi ngày 2026-10-09 theo yêu cầu người dùng: bỏ khăn xếp đỏ (trông như turban Ấn Độ), thay bằng **nón lá rách vành, quai đỏ** cho thuần Việt hơn. Visual hook mới: nón lá đội lệch + quai đỏ + miếng vá chàm trên lưng.

```
a skinny young Vietnamese peasant man, about 20, chibi proportions with a big round head about one third of body height, long thin limbs; wearing a Vietnamese conical leaf hat (non la): a perfectly cone-shaped hat with a sharp pointed tip and a wide straight sloping brim, made of layered pale palm leaves with thin concentric ring ribs, cream #EFE4C8 with straw #DDA933 shading, with a ragged torn notch missing from one side of the brim, tied with a bright vermilion red #A93226 cloth chin strap knotted under his chin, worn slightly tilted to one side; thick black brush-stroke eyebrows, small almond eyes, smug toothy grin, slightly hollow cheeks, chin raised, chest puffed out, proud and poor; a sleeveless faded earth-brown #7A4B2A peasant shirt with a frayed hem, a big square indigo #2F4B73 patch on the back and a small indigo patch on one elbow; dark brown trousers rolled up unevenly, one leg higher than the other; a twisted straw rope belt; barefoot
```

Ghi chú hình: nón là hình **nón nhọn thẳng** (không cong như sombrero, không dẹt như nón Nhật/Trung), vành rộng khoảng **1,6–1,8 lần bề ngang đầu**; mảnh rách ở vành phải còn thấy ở 32 px. Quai đỏ son là điểm màu nhận diện duy nhất trên người.

Reference: `art-source/reference/hero-front-src.png` (gốc, nền xanh — dùng `--ref`), `hero-front.png` (tách nền), `hero-back.png` (lưng, vá chàm), `hero-side.png` (ngang, quay phải). Chân dung thoại: 9 biểu cảm, prompt card `ART-POR-001`.

Ghi chú thêm từ 2.2: khi gen chân dung **phải ghi "very short neck, head sitting directly on the shoulders"**, nếu không model vẽ cổ dài; và ghi "shirt front plain, only the small elbow patch" để vá chàm không nhảy ra ngực.

## 9. Thông số kỹ thuật (màn tham chiếu 1920×1080 ngang, bản đồ Tilemap)

| Loại | `--aspect` | Kích thước cuối | Hiển thị trên màn | Pivot | Thư mục (trong `assets/art/`) |
|---|---|---|---|---|---|
| Nhân vật (bản đồ) | 1:1 | 64×96 (khung 128 để dư) | ~1,5 ô | bottom | `characters/` |
| Con vật (gà, lợn, trâu, cá) | 1:1 | ~1 ô | | bottom | `animals/` |
| Vật thể lớn (nhà, cây, đá, chuồng) | 1:1 | nhiều ô (bội số 64) | | bottom | `props/` |
| Chân dung thoại (bố vợ, thợ…) | 1:1 | 512 | khung thoại | center | `portraits/` |
| Vật phẩm | 1:1 | 128 (hiển thị 64) | ~64px trên hotbar | center | `items/` |
| Tile địa hình | 1:1 | 64/ô | 1 ô | — | `tiles/` |
| Ảnh toàn cảnh (menu, cưới) | 16:9 | 1920×1080 | toàn màn | — | `backgrounds/` |
| UI (nút, panel, icon) | 1:1 | 128–512 | nút ≥ 48px | center | `ui/` |
| Hiệu ứng, vân giấy phủ | 1:1 | 128–512 | | center | `fx/` |

Thư mục gốc: `web/client/public/assets/art/` (nếu chưa có `web/client/` thì để `art-source/raw/<ID>/final.png`). Tên file chữ thường, gạch nối (vd. `hero-down.png`).

### 9.1 Cách làm tileset 64px (rủi ro lớn nhất, thử sớm ở 2.2)
1. Gen **từng loại nền riêng** (cỏ, đất cuốc, đất cuốc ướt, đường đất, nước) dạng ô vuông nhìn thẳng từ trên, `--aspect 1:1`, prompt "seamless tileable texture, flat colors, no objects, no texture grain", **không vân giấy**.
2. Thu về 64px (hoặc 128 rồi 64), kiểm nối liền bằng cách ghép 3×3 ô (`sheet`). Sửa mép nối bằng script nếu cần (offset + vá).
3. Viền chuyển cỏ↔đất, cỏ↔nước làm theo bộ Terrain/Wang của Tiled (ít nhất 13 ô/bộ). Nếu AI không ra được bộ chuyển nối khớp sau ~3 vòng → **phương án lùi**: nền mỗi khu là **một ảnh lớn vẽ sẵn** (Giả định ~3072×2048, cắt thành mảnh), chỉ ruộng, vật cản và vật tương tác là ô/sprite.
4. **Kết quả thử 2.2 (ART-TIL-001/002):** Gemini ra texture **nối liền tốt** ngay lần 1 (ghép 3×3 và lệch nửa ô không thấy đường nối). Nhưng **một ảnh gen phải tương ứng 4×4 ô** (thu về 256 px rồi cắt 16 ô 64 px, hoặc dùng nguyên ảnh 256 làm ô lặp): thu cả ảnh về 1 ô 64 px thì chi tiết thành nhiễu. Kiểm bằng `process_image.py tiletest <tile> --out <x>.png --size 256 --n 2`. Bộ chuyển cỏ↔đất (Wang) chưa thử.
5. Màu tile nền nên **dịu hơn** sprite một chút (ít tương phản, ít nét mực bên trong) để nhân vật và vật tương tác nổi lên.

## 10. Bài học từ bước 2.1 — lỗi zoom và cách khắc phục cho bước 2.2

**Lỗi đã gặp** (cả 3 hướng, 9 ảnh):
1. **Zoom quá gần:** nhân vật cao ~4–5 ô thay vì 1,5 ô, dù prompt ghi "zoomed out, ~20×11 tiles, hero 1.5 tiles". Gemini luôn ưu tiên nhân vật được mô tả kỹ → phóng to.
2. **Lưới isometric/chéo** ở vòng 1 → đã khắc phục ở vòng 2 bằng "orthogonal, grid aligned with screen edges, NOT isometric".
3. **Vẽ cả đường kẻ lưới** lên cỏ (do nhắc "tile grid").
4. **Khăn xếp thành turban Ấn Độ** ở vòng 1; vòng 2 đỡ hơn nhưng người dùng vẫn thấy giống turban → **đổi sang nón lá** (token §8).
5. Ba hướng trông khá giống nhau (Gemini kéo về "hoạt hình phổ thông") → STYLE_PREFIX §3 đã đẩy mạnh đặc trưng tranh dân gian.

**Cách khắc phục cho bước 2.2:**
- **Không gen "ảnh màn hình" một lần nữa để khóa style.** Tách ra: (a) ảnh mẫu style = **bộ ba trên nền phẳng** (nhân vật + gà + một vật thể, `--aspect 1:1`, `--hq`); (b) nhân vật riêng `hero.png`; (c) tile nền riêng.
- Nếu cần ảnh "khung cảnh" để duyệt cảm giác: **ghép bằng code/script** từ tile + sprite đã thu đúng tỉ lệ (64px/ô, nhân vật 96px) — chính xác hơn để AI tự canh zoom.
- Nếu vẫn gen ảnh cảnh: mô tả nhân vật **ngắn** (không dán full token), liệt kê nhiều vật thể ở xa ("a tiny figure, one of many small elements"), ghi "wide establishing shot", và **không dùng chữ "grid/tile"** trong prompt (thay bằng "square farm plots").
- Luôn để "grid lines, tile grid overlay, close-up, isometric, turban, sombrero" trong NEGATIVE (đã có ở §4).

### 10.2 Bài học bước 2.2 (khóa style)

1. **Ảnh mẫu thắng chữ.** Ảnh #4 người dùng chọn có nét viền nâu đen đậm đều, màu phẳng 2 tông kiểu cel, mặt hoạt hình dễ thương — ít "khắc gỗ" hơn mô tả STYLE_PREFIX. Khi truyền `--ref`, Gemini bám ảnh mẫu rất chặt (9/9 chân dung, 3/3 hướng đúng nhân vật). Giữ STYLE_PREFIX để giữ bảng màu và quy tắc sáng/bóng, nhưng đánh giá nhất quán bằng cách **đặt cạnh ảnh mẫu**.
2. **Chân dung:** chỉ định khung bằng tỉ lệ ("hat brim spans about three quarters of the image width, shoulders cut off by the bottom edge") giúp các ảnh gần cùng khung; vẫn lệch khi biểu cảm có tay (b, g, i). Má đỏ/mặt tái có loang mềm — chấp nhận.
3. **Hướng lưng:** liệt kê những gì *thấy được* từ sau (gáy, vá lưng, gót chân) + "face completely hidden: no eyes, no nose, no mouth" + Avoid "looking back over shoulder" → đạt ngay lần 1 (sửa lỗi #6 của 2.1).
4. **Hướng ngang:** model có thể vẽ ngược chiều yêu cầu (xin trái, ra phải) → kiểm chiều mũi trước khi đặt tên; hướng còn lại lật ngang.
5. **Tách nền:** `removebg --color "#00FF00" --tol 70 --holes 30 --despill` (khe kín giữa tay–thân, quai–cổ cần `--holes`; lưng cần `--tol 100 --holes 4`). Model đôi khi trả nền xanh xám thay vì `#00FF00` → bỏ `--color` để lấy màu góc.
6. **Tile:** xem §9.1 bước 4 — một ảnh gen = 4×4 ô.

### 10.3 Bài học bậc ngoại hình (ART-CHR-003, D-015)

1. **"Thay đồ, giữ người" chạy tốt** với `--ref` ảnh bậc 1 + khối "OUTFIT CHANGE of the attached reference image… same face, same pose, same size and position in the frame… Only his clothes change". **Không dán token bậc 1** (tả áo rách, chân đất sẽ kéo ngược lại); tả từng món đồ mới dạng gạch đầu dòng. 3/3 bậc đúng mặt, đúng dáng chống nạnh, đúng vị trí khung ngay lần 1.
2. **Khăn xếp:** "low flat ring… like a short flat drum" vẫn ra mũ phồng có **búi tóc** sau đầu. Đạt hơn khi tả là "SHORT STIFF LOW CYLINDER BAND… low flat pillbox… top FLAT and LEVEL like a table top… 5–6 perfectly HORIZONTAL stripes" + Avoid "bun, topknot, hair knot, beanie, beret, knit cap, puffy cap, tall hat, rounded dome headwear". Nhân vật đội khăn xếp (bậc 4, cụ Bá Kẹo…) **bỏ "khan xep" khỏi Avoid**, giữ turban.
3. **Nón đeo sau lưng:** ghi "its sharp POINTED TIP sticks up and out clearly behind one shoulder" để chóp nón đọc được ở 64 px.
4. **Cắt sprite cùng một khung:** các bậc gen cùng thang trong ảnh 1024 → cắt **chung một hộp** (hợp bbox, 2:3, neo đáy) rồi mới thu về 64×96. `fit` riêng từng ảnh sẽ phóng to bậc có đầu thấp hơn (bậc 4 không có nón trên đầu).
5. **Ở 64 px bậc 1 và bậc 2 rất giống nhau** (cùng áo nâu, chỉ khác vá nón và dép): nếu cần khác rõ hơn, đổi màu áo bậc 2 (vd. nâu nhạt `#B98550`) — chờ người dùng quyết.

### 10.4 Bài học chu trình bước đi (ART-CHR-004)

1. **Một ảnh 21:9 = 4 khung một hướng** (`--hq`, `--ref` ảnh mẫu cùng hướng + ảnh mặt trước) cho nhân vật nhất quán gần tuyệt đối giữa các khung (bề ngang nón lệch ≤ 2 px/1584). Tả **từng khung** (CONTACT / PASSING, chân nào trước, tay nào vung) + "same invisible horizontal ground line" + "clear empty green space between the figures".
2. **Ảnh mẫu thắng chữ cả về góc nhìn:** hướng xuống với ref mặt trước 3/4 luôn ra 3/4 bước chéo (4/4 ảnh), dù prompt ghi "straight-on, symmetrical". Khắc phục: thêm **ảnh lưng đối xứng làm ref thứ hai** và nói rõ "ảnh 1 = nhân vật, ảnh 2 = góc máy" → ra chính diện (1/2).
3. Ảnh mẫu RGBA trong suốt (`hero-side.png`, `hero-back.png`) → ghép lên nền `#00FF00` trước khi `--ref` (`art-source/raw/hero-walk/ref/`).
4. Hậu kỳ: `process_image.py sheet-split <sheet> --n 4 --cell 64x96 --pad 1 --holes 5 --despill-all [--flip] --out … --gif …` — tách nền, **một tỉ lệ chung** theo khung cao nhất (giữ nảy đầu thật), căn đáy, căn giữa theo nón/đầu (30% trên), xuất dải đều ô cho Phaser + GIF. `--despill-all` chỉ dùng cho nhân vật không có màu xanh lá.
5. Nhìn từ sau, tay gần như không lộ và đầu không nảy — bình thường; nảy 1 px có thể cộng bằng code.
6. Dáng đứng `hero-t1-down` (3/4 chống nạnh) khác dáng đi xuống (chính diện) — chuyển đứng↔đi sẽ "xoay người" nhẹ. Nếu chướng, dùng khung 2 của dải đi làm dáng đứng hướng xuống.

## 11. Checklist QA nhất quán

- [ ] Viền một màu `#2E2118`, cùng độ dày với asset đã duyệt, nét kiểu khắc gỗ (không mảnh, không vector trơn)
- [ ] Màu phẳng kiểu in mộc, tối đa 2 tông, sáng từ trên-trái, không gradient/bóng loáng
- [ ] Màu nằm trong bảng màu khóa (§5)
- [ ] Không vân giấy, không chữ, không lưới, không watermark, không tay chân thừa
- [ ] Tỉ lệ đúng (chibi 2,5 đầu; nhân vật ~1,5 ô; nón lá chóp nhọn, vành rách, quai đỏ, đội lệch)
- [ ] Góc nhìn đúng §7 (tile orthogonal; vật thể 3/4; không isometric)
- [ ] Đọc được ở kích thước thật, trên nền sáng & tối, cả thang xám (`preview`); nguy hiểm vs có lợi phân biệt bằng **hình** chứ không chỉ màu
- [ ] Đặt cạnh asset đã duyệt — trông cùng một bộ

## Meme (D-016)

- Chỉ **nhái lại** bố cục/biểu cảm/câu nói của meme, vẽ bằng nhân vật game ({ten}, cụ Bá Kẹo, chú Đục…) theo style đã khóa và `--ref` ảnh mẫu.
- Không dùng ảnh meme gốc, không dựa vào ảnh chụp/cảnh phim, không vẽ mặt người thật hay người nổi tiếng, không chèn logo/watermark.
- Prompt mô tả bố cục và cảm xúc (vd. "two-panel reaction: disapproving turn-away, then delighted point"), không ghi tên meme hay tên người.

## Changelog

- 2026-10-09 — Tạo khung art bible, chọn công cụ Vertex AI Gemini image.
- 2026-10-09 — Bước 2.1: người dùng chọn hướng **#2 Đông Hồ hiện đại hóa** (D-012). Viết keywords, STYLE_PREFIX (đẩy mạnh chất tranh dân gian, bỏ vân giấy khỏi asset), NEGATIVE, bảng màu 10 màu + kiểm thang xám, hình khối/tỉ lệ/ánh sáng, góc nhìn, token {ten}, cách làm tileset, bài học zoom. Style chưa khóa (khóa ở 2.2).
- 2026-10-09 — Đổi visual hook {ten}: khăn xếp đỏ → **nón lá chóp nhọn rách vành, quai đỏ son** (người dùng yêu cầu thuần Việt hơn). Cập nhật token §8, NEGATIVE §4 (sombrero, nón Nhật/Trung, khan xep), vai trò màu §5, tỉ lệ §6.2, checklist.
- 2026-10-09 — Bước 2.2: **khóa style** (D-014). Style anchor = ảnh #4 người dùng chọn (`art-source/reference/hero-front*.png`), thêm `hero-back.png`, `hero-side.png`. Thêm §10.2 bài học, kết quả thử tile ở §9.1, quy tắc "ảnh mẫu thắng chữ".
- 2026-10-09 — ART-CHR-003 (4 bậc ngoại hình, D-015): thêm §10.3 bài học (prompt "thay đồ giữ người", cách tả khăn xếp không thành mũ/turban, nón đeo sau lưng, cắt chung khung cho các bậc). Màu áo the bậc 4: nâu đỏ sẫm giữa `#7A4B2A` và `#9C4A32` (Giả định, không thêm màu khóa).
- 2026-10-09 — ART-CHR-004 (chu trình đi bậc 1): thêm §10.4 bài học (sheet 21:9 nhiều khung, ref lưng để khóa góc chính diện, lệnh `sheet-split`).
