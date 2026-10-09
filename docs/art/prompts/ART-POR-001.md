# ART-POR-001…009 — Chân dung thoại {ten} (bộ 9 biểu cảm)

| Mục | Giá trị |
|---|---|
| Loại | POR (chân dung thoại) |
| Dùng ở | Khung thoại (chân dung bên trái, GDD §11), bong bóng chửi/khoe (GDD §8), màn mặc cả |
| Tỉ lệ gen (`--aspect`) | 1:1 |
| Kích thước cuối | 512×512, bán thân đầu–vai, pivot đáy (vai chạm mép dưới) |
| Nền khi gen | màu phẳng `#00FF00` |
| Pivot | bottom |
| Animation | bằng code (lắc khi chửi, nảy khi khoe) |
| Reference (`--ref`) | `art-source/reference/hero-front-src.png` (bản gốc nền xanh của style anchor) |
| File trong game | `web/client/public/assets/art/portraits/portrait-hero-<ma>.png` (chưa có `web/client/` → tạm ở `art-source/raw/hero-expressions/final/`) |
| Trạng thái | Processed (chờ người dùng duyệt) |

## Mô tả (tiếng Việt)

Bộ biểu cảm "lầy" của {ten}, cùng khung đầu–vai, cùng góc chính diện hơi 3/4, nón lá rách + quai đỏ giống hệt ảnh mẫu. Mức "đê tiện": gian xảo kiểu hoạt hình, buồn cười, không ghê, không tục, không cử chỉ thô.

| ID | Mã | Biểu cảm | Trigger (story bible §6 / GDD §8) | File |
|---|---|---|---|---|
| ART-POR-001 | `a-smirk` | Cười đểu, nhếch mép gian xảo, xoa cằm | Lúc nảy ra mưu (mặc cả, mua rẻ bán đắt) | `art-source/raw/hero-expressions/final/portrait-hero-a-smirk.png` |
| ART-POR-002 | `b-wink-haggle` | Nháy mắt gian manh, xoa hai tay | Màn mặc cả, mua bán ở chợ | `art-source/raw/hero-expressions/final/portrait-hero-b-wink-haggle.png` |
| ART-POR-003 | `c-boast` | Khoe khoang: nhắm mắt tự mãn, ngón cái chỉ ngực | Bong bóng khoe (§6.4), lên level | `art-source/raw/hero-expressions/final/portrait-hero-c-boast.png` |
| ART-POR-004 | `d-curse` | Chửi thề: mặt đỏ, há mồm, gân cổ, khói trên đầu | Bong bóng chửi (§6.3): cá sổng, cuốc cùn, bị từ chối | `art-source/raw/hero-expressions/final/portrait-hero-d-curse.png` |
| ART-POR-005 | `e-exhausted` | Đuối: mắt lờ đờ, lè lưỡi, mồ hôi | Sức < 20%, hết Sức | `art-source/raw/hero-expressions/final/portrait-hero-e-exhausted.png` |
| ART-POR-006 | `f-sleepy` | Gật gù: mắt nhắm, chảy dãi, bong bóng mũi | ≥ 22h, ngủ gục | `art-source/raw/hero-expressions/final/portrait-hero-f-sleepy.png` |
| ART-POR-007 | `g-fawning` | Nịnh bợ: chắp tay, cười nhe răng, mồ hôi | Trước bố vợ, chào cụ Bá Kẹo | `art-source/raw/hero-expressions/final/portrait-hero-g-fawning.png` |
| ART-POR-008 | `h-rejected` | Bị từ chối: mếu, mắt rưng, mặt tái có vạch u ám | Mặc cả thua, bị đuổi ra cổng | `art-source/raw/hero-expressions/final/portrait-hero-h-rejected.png` |
| ART-POR-009 | `i-money-eyes` | Thấy tiền: mắt thành đồng xu lỗ vuông, chảy dãi | Bán được nhiều tiền, nhận thưởng | `art-source/raw/hero-expressions/final/portrait-hero-i-money-eyes.png` |

## Prompt chính

Thay `EXPRESSION_LINE` bằng một dòng trong danh sách biểu cảm bên dưới.

```
Vietnamese Dong Ho woodblock folk print style adapted for a 2D game. Every shape is outlined with a bold hand-carved woodblock ink line in near-black brown #2E2118, slightly uneven and organic like a line cut with a knife into wood, of the same medium-thick weight on every object. Colors are printed as flat solid areas of natural mineral pigments, matte and slightly chalky, like ink pressed from separate carved blocks; colors sit inside the outlines with tiny imperfections. Shading is minimal: at most one flat darker tone on the bottom-right side, light always from the top-left, no gradients, no airbrush, no glossy highlights, no rim light. Shapes are simple, rounded, stylized and decorative like folk prints: round faces with small almond eyes and short curved brush-stroke eyebrows, leaves and grass drawn as repeated simple decorative strokes, thatch and bamboo drawn as rhythmic parallel lines. Chibi proportions, warm, rustic, naive folk-art charm with deadpan humor. Clean flat color surfaces with no paper texture painted in.
Match the attached reference image exactly: the same young man, same face shape, same thick black brush-stroke eyebrows, same small almond eyes, same skin tone #E2B48A, same cream conical leaf hat (non la) with concentric rib lines, the same ragged torn notch on the right side of the brim, the same thin vermilion red #A93226 chin strap knotted under the chin, the same sleeveless faded earth-brown #7A4B2A frayed shirt with the small indigo #2F4B73 elbow patch; the same bold dark brown-black #2E2118 outline weight and the same flat two-tone cel coloring as the reference.
Subject: dialogue portrait of the hero, a skinny poor-but-proud Vietnamese peasant man about 20, comedic chibi folk-print look.
Framing: head-and-shoulders bust portrait, front view turned very slightly three-quarter, framed from just above the hat tip down to mid-chest, the whole hat inside the frame with a little margin, the face large and centered, the same camera distance and framing as a set of matching dialogue portraits: the hat brim spans about three quarters of the image width, the hat tip near the top edge, the shoulders cut off by the bottom edge.
Proportions: chibi, a big round head sitting directly on the shoulders with a very short neck (no long neck), the shoulders about as wide as the head; the shirt front is plain with no patch, the only indigo patch is the small one on the elbow.
EXPRESSION_LINE
Tone: cartoon slapstick humor, exaggerated like a comedic folk cartoon, cheeky and funny, never gross, never vulgar, no rude hand gestures.
Composition: single subject, isolated on a plain flat solid #00FF00 green background filling the whole frame, nothing else in the frame, no frame border.
Palette: limited palette using only #2E2118 #7A4B2A #B98550 #DDA933 #A93226 #2F4B73 #EFE4C8 plus skin tone #E2B48A.
Technical: no text, no letters, no speech bubble, no ground shadow, clean silhouette, readable at small size.
```

### Dòng biểu cảm

- `a-smirk`: Expression: sly scheming smirk. One corner of the mouth pulled up in a lopsided crooked grin, eyes half-lidded and glancing sideways, one eyebrow raised high and the other pressed low, chin slightly lowered, a cheeky rascal who just had a sneaky idea.
- `b-wink-haggle`: Expression: crafty haggler. Winking one eye, sly toothy grin, both hands raised in front of his chest rubbing his palms together greedily, shoulders hunched up, leaning slightly toward the viewer as if about to make a dodgy deal.
- `c-boast`: Expression: boasting show-off. Chin raised high with the nose up in the air, both eyes closed in smug self-satisfaction, eyebrows lifted, a big proud closed-mouth smile, puffed-out chest, one thumb pointing at his own chest, the hat tilted even more to one side.
- `d-curse`: Expression: furious cursing tantrum. Whole face flushed bright red, eyebrows slammed down in a sharp V, eyes squeezed into angry slits, mouth stretched wide open yelling with teeth and tongue showing, a tense bulging vein on the neck, fists clenched near his face, two small dark puffs of steam shooting up above the hat.
- `e-exhausted`: Expression: completely exhausted. Dazed half-closed droopy eyes looking in slightly different directions, tongue flopping out of the side of the mouth, eyebrows drooping, shoulders slumped, several sweat drops flying off his head, the hat slipping down crooked over one eye.
- `f-sleepy`: Expression: dozing off while standing. Head lolling to one side, eyes closed as two thin downward arcs, mouth hanging open with a small drip of drool from one corner, a round clear snot bubble swelling from one nostril, the hat sliding down over the forehead.
- `g-fawning`: Expression: fawning flatterer in front of his future father-in-law. Bowing forward with head lowered and shoulders hunched, both hands pressed together in front of his chest in a polite greeting, a huge over-eager toothy suck-up grin, eyes squeezed into happy upside-down crescents, eyebrows raised pleadingly, one nervous sweat drop on the temple.
- `h-rejected`: Expression: rejected and crushed. Jaw dropped, mouth a wobbly wavy line about to cry, eyes wide open with tiny shaking pupils and welling tears, eyebrows raised up in despair, face drained pale with a few vertical gloom lines on the forehead, the hat knocked askew.
- `i-money-eyes`: Expression: struck by greed at the sight of money. Both eyes turned into two shining round gold #DDA933 coins with a square hole in the middle like old Vietnamese copper coins, small sparkle marks around them, a huge open-mouth grin with a little drool, both hands raised with fingers wiggling greedily.
- `a-smirk2`: Expression: sneaky shady schemer, cheeky and mischievous. Eyes narrowed to half-lidded slits with the pupils pushed into the corners, glancing sideways at the viewer; one eyebrow cocked high, the other pressed low; a lopsided crooked grin pulled up on one side only, showing a few teeth; one hand raised stroking his chin with thumb and finger; head slightly lowered — a cartoon rascal plotting a dodgy trick.

## Negative

```
photorealistic, 3D render, CGI, glossy, smooth gradients, airbrush, soft shading, rim light, bloom, neon or saturated candy colors, modern mobile-game cartoon look, anime style, thin clean vector lines, painted paper texture, canvas texture, noise, text, letters, calligraphy, seal stamp, signature, watermark, UI, HUD, border frame, grid lines, tile grid overlay, isometric view, diagonal grid, close-up zoomed-in camera, perspective distortion, turban, Indian turban, Indian headwrap, khan xep, sombrero, straw cowboy hat, Japanese or Chinese rice hat with flat or curved brim, rounded mushroom-shaped hat, extra limbs, extra fingers, busy background, drop shadow on ground
```

## Lệnh

```
.venv/Scripts/python tools/gen_image.py --prompt "<prompt đã thay EXPRESSION_LINE>" --name por-<ma> --out art-source/raw/hero-expressions --ref art-source/reference/hero-front-src.png -n 1 --aspect 1:1 --hq
.venv/Scripts/python tools/process_image.py removebg <in.png> <nobg.png> --color "#00FF00" --tol 70 --holes 30 --despill
.venv/Scripts/python tools/process_image.py fit <nobg.png> portrait-hero-<ma>.png --size 512 --pad 8 --pivot bottom
```

## Nhật ký gen

| Ngày | Lần | Thay đổi prompt | Kết quả (lỗi theo checklist) | Chọn |
|---|---|---|---|---|
| 2026-10-09 | 1 | Bản đầu, thử 2 biểu cảm (a, d) | d (chửi) đạt rất tốt. a: **cổ dài như hươu**, vá chàm ở ngực áo, khung xa hơn d | d |
| 2026-10-09 | 2 | Thêm dòng "Proportions: chibi, very short neck… shirt front plain, only elbow patch" + chỉ định khung (vành nón ≈ 3/4 bề ngang, vai chạm mép dưới). Gen a, b, c, e, f, g, h, i | Tất cả giống nhân vật, đúng nón/quai/mảnh rách. b và g khung xa hơn (thấy cả hai tay). g nền ra xanh xám `#619761` thay vì `#00FF00` (vẫn phẳng, tách bằng màu góc). a vẫn hiền, chưa "đểu" | b, c, e, f, g, h, i |
| 2026-10-09 | 3 | a viết lại: mắt híp liếc ngang, một mày nhướn, cười lệch một bên hở răng, tay xoa cằm (`a-smirk2`) | Đạt — gian xảo rõ, vẫn vui | a-smirk2 |

Ghi chú: má đỏ ở d và mặt tái ở h có loang mềm (không hoàn toàn phẳng) — chấp nhận vì đúng tinh thần ảnh mẫu đã chọn. Cỡ đầu trong khung chênh nhau chút (d có khói trên đầu, i thấy tới thắt lưng) — game có thể chỉnh scale riêng từng ảnh nếu cần.
