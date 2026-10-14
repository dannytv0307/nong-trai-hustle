# ART-CHR-008 — {ten} động tác TƯỚI 4 hướng (bậc 1)

> **Đã gen 2026-10-14 (T-020).** Đổi so với nháp: **4 khung** (không phải 3) để cùng chuẩn với cuốc ART-CHR-007 — khung chỉ số 2 = chạm, game-dev dùng chung hàm tính khung. Khung 128×128, tâm bàn chân x 64, đáy chân y 110, `setOrigin(0.5, 111/128)`. Cắt bằng `tools/action_split.py` (chuyển từ `hoe_split.py`). Prompt thật: `art-source/raw/lot1/prompts/{water-right,water-down-v2,water-up}.txt`. Xem: `art-source/raw/lot1/actions-strip.png`, GIF `art-source/raw/lot1/hero-anim/gif/actions-<hướng>.gif`.

| Mục | Giá trị |
|---|---|
| Loại | CHR (animation khung) |
| Dùng ở | Vườn — click ô đã gieo chưa tưới (GDD §3.3); juice "Tưới" §8 |
| Tỉ lệ gen (`--aspect`) | **21:9** `--hq` — một ảnh = **4 khung** một hướng (như cuốc); gen phải, xuống, lên; trái = lật gương từng ô |
| Kích thước cuối | dải **512×128** = 4 khung 128×128 (bản 2x 1024×256 ở `art-source/raw/lot1/hero-anim/`) |
| Nền khi gen | `#00FF00` |
| Pivot | bottom — hộp 64×96 tại x 32–95, y 16–111 (như ART-CHR-007) |
| Animation | **4 khung, khung chỉ số 2 = CHẠM** — y hệt cuốc: dùng thẳng `hoeFrameAt` (`systems/toolAnim.ts`) với `actionImpactAt` |
| Reference (`--ref`) | như ART-CHR-007 theo hướng |
| File trong game | `web/client/public/assets/art/characters/hero-t1-water-<down\|up\|left\|right>.png` |
| Trạng thái | **Approved** (người dùng duyệt 2026-10-14; chờ game-dev gắn T-023) |

## Mô tả (tiếng Việt)

{ten} xách **bình tưới tôn cũ móp méo** (vòi dài, quai cong) nghiêng đổ nước xuống ô trước mặt. Bình màu xanh nước `#6E9FA6` + mép trắng điệp (không có xám kim loại trong bảng màu); dòng nước vẽ như **3–4 nét cong trắng điệp + xanh nước** kiểu tranh dân gian. Mặt tỉnh bơ, hơi lười.

(Giả định) Không dùng đôi thùng gánh / gáo dừa: hai vật thể khó giữ nhất quán và vươn xa hơn khung.

## Nhịp & khung chạm

| Khung | Tư thế | 0.4 s | Tỉ lệ |
|---|---|---|---|
| 0 | Nhấc bình ngang bụng, vòi chĩa trước (chưa có nước) | 0–100 ms | 0–25% |
| 1 | Bắt đầu nghiêng, 2 giọt đầu | 100–200 ms | 25–50% |
| 2 | **CHẠM**: nghiêng hẳn, dòng nước + vũng bắn ở ô trước mặt (xuống: giữa hai chân, thấp hơn ngón chân; lên: cạnh chân phải) | 200–300 ms | **50–75%** |
| 3 | Dựng bình lại, 2–3 giọt cuối | 300–400 ms | 75–100% |

(Cập nhật 2026-10-14: 4 khung, chia như cuốc — `hoeFrameAt(progress, actionImpactAt, windupShare, impactShare)`.)

Game phát giọt nước bắn + đổi ô sẫm (ART-TIL-005) + tiếng "róc rách" đúng lúc hiện khung 2. Tưới liên tiếp khi rê chuột: lặp khung 2–3 cũng được (game-dev chọn).

## Prompt chính — phải

```
Vietnamese Dong Ho woodblock folk print style adapted for a 2D game. Every shape is outlined with a bold hand-carved woodblock ink line in near-black brown #2E2118, slightly uneven and organic like a line cut with a knife into wood, of the same medium-thick weight on every object. Colors are printed as flat solid areas of natural mineral pigments, matte and slightly chalky, like ink pressed from separate carved blocks; colors sit inside the outlines with tiny imperfections. Shading is minimal: at most one flat darker tone on the bottom-right side, light always from the top-left, no gradients, no airbrush, no glossy highlights, no rim light. Shapes are simple, rounded, stylized and decorative like folk prints: round faces with small almond eyes and short curved brush-stroke eyebrows, leaves and grass drawn as repeated simple decorative strokes, thatch and bamboo drawn as rhythmic parallel lines. Chibi proportions, warm, rustic, naive folk-art charm with deadpan humor. Clean flat color surfaces with no paper texture painted in.
WATERING ANIMATION SPRITE SHEET of the character in the attached reference image: 3 animation frames, STRICT SIDE PROFILE VIEW, character facing RIGHT, arranged left to right in ONE SINGLE HORIZONTAL ROW. LAYOUT IS CRITICAL: the image is divided into 3 equal invisible columns, exactly one figure centered in each column; the figures are SMALL, each only about 60% of the image height, with WIDE empty green gaps between neighbours so that the watering can and water never touch a neighbouring figure.
The tool: an old dented tin watering can with a long thin straight spout, a round body and a curved top handle, painted faded water-blue #6E9FA6 with cream #EFE4C8 rim highlights and ink #2E2118 outlines, a few dents. He holds it by the handle with one hand and supports the bottom with the other. Same can size in every frame.
The character is EXACTLY the same in every frame and matches the attached side-view reference: big round head (about 2.5 heads tall chibi), cream conical leaf hat with sharp pointed tip, ring ribs and a ragged torn notch in the brim, thin vermilion red #A93226 chin strap, short black hair, sleeveless faded earth-brown #7A4B2A shirt with frayed hem, small indigo #2F4B73 patch on the elbow, twisted straw rope belt, dark brown trousers rolled up unevenly, barefoot. Same size, same hat size, same colors in all 3 frames; feet planted at the same spot on the same invisible ground line.
Frame 1 LIFT: the can lifted to belly height, spout pointing forward and slightly up, no water yet, bored deadpan face.
Frame 2 POUR: the can tilted forward, a stream of water drawn as 3 to 4 decorative curved strokes of cream #EFE4C8 and water-blue #6E9FA6 pouring from the spout down to the ground about half a body-width in front of his toes, ending in a small stylized splash.
Frame 3 LAST DROPS: the can tilted further, only a few round droplets falling from the spout, he starts to straighten up.
SAME SCALE in all frames. Composition: full body, the whole can and the whole water stream visible, nothing cropped, isolated on a plain flat solid #00FF00 green background, no frame borders, no dividing lines, no numbers, no ground, no puddle, nothing else.
Palette: limited palette using only #2E2118 #7A4B2A #B98550 #DDA933 #A93226 #2F4B73 #6E9FA6 #EFE4C8 plus skin tone #E2B48A.
Technical: no text, no ground shadow, no ground line drawn, clean silhouettes, readable at small size.
Avoid: figures touching each other, large figures filling the whole height, three-quarter view, body turned toward the camera, both eyes visible, facing left, garden hose, bucket, plastic watering can, shower head rose spout, realistic water, transparent water, water spray mist, rainbow, identical frames, different characters, different hat sizes, frame numbers, grid lines, border frame, photorealistic, 3D render, CGI, glossy, smooth gradients, airbrush, soft shading, rim light, bloom, neon or saturated candy colors, modern mobile-game cartoon look, anime style, thin clean vector lines, painted paper texture, canvas texture, noise, text, letters, calligraphy, seal stamp, signature, watermark, UI, HUD, isometric view, perspective distortion, turban, sombrero, straw cowboy hat, flat or curved brim hat, rounded mushroom-shaped hat, extra limbs, extra fingers, three arms, busy background, drop shadow on ground
```

## Biến thể hướng

- **Xuống:** FRONT VIEW (như ART-CHR-007); bình cầm trước bụng, vòi chĩa về phía camera-chếch xuống, dòng nước rơi xuống **dưới và trước chân** (gần người xem hơn ngón chân).
- **Lên:** BACK VIEW, mặt khuất hoàn toàn, thấy vá chàm lưng; bình chìa ra trước, dòng nước rơi **phía trên đầu trên màn** (trước mặt nhân vật), bị thân che một phần.

## Ước tính chi phí

3 hướng × 2 ảnh `--hq` × ~2 vòng = **12 ảnh ≈ 1,61 USD** (tối đa 18 ảnh ≈ 2,41 USD).

## Nhật ký gen

| Ngày | Lần | Thay đổi prompt | Kết quả (lỗi theo checklist) | Chọn |
|---|---|---|---|---|
| 2026-10-14 | phải v1 (2 hq 21:9, ref ảnh nghiêng + icon bình tưới nền xanh) | 4 khung LIFT / TILT / POUR / LAST DROPS, bình tưới = icon `item-binh-tuoi` | #1 đạt (góc 3/4 như dải cuốc phải, khung 3 bước chân nhẹ); giọt nước khung 2 bị gán nhầm sang khung kề → `clean_specks.py` xóa | **#1** |
| 2026-10-14 | xuống v1 (2 hq, ref mặt + lưng + bình) | Biến thể FRONT | Cả 2 ra 3/4 quay phải, nước đổ sang bên → trùng hướng phải | — |
| 2026-10-14 | xuống v2 (2 hq) | Thêm "thân vuông với camera, bình giữa bụng, vòi chĩa THẲNG về người xem, nước rơi giữa hai chân" + Avoid quay phải | #1 đạt (chính diện, dòng nước giữa); #2 quần xanh chàm (sai token) | **#1** (khung 3 hạ 3 px: đáy vũng nước làm lệch dò chân) |
| 2026-10-14 | lên v1 (2 hq, ref lưng + bình) | Biến thể BACK | #2 đạt (vòi ló bên hông, dòng nước bên chân); #1 khung 2 quay nghiêng | **#2** |
