# ART-PRP-012 + ART-PRP-001 — Thúng bán, cọc rào tre, quầy hạt ở hiên

| Mục | Giá trị |
|---|---|
| Loại | PRP |
| Dùng ở | Vườn: thùng bán (F), mở rộng ruộng (cọc, ẩn tới T-044), sạp hạt (F) → Xóm: quầy hạt hiên nhà cô Tám Thóc |
| Tỉ lệ gen (`--aspect`) | thúng + cọc 16:9 (4 món/ảnh) · quầy hạt 4:3 — model nhanh |
| Kích thước cuối | thúng đóng 64×64 · thúng hé có đồ 96×64 · cọc đơn 64×64 · hàng cọc 128×64 · quầy hạt **192×128** (3×2 ô) |
| Nền khi gen | `#FF00FF` |
| Pivot | `setOrigin(0.5, 1)` tại đáy chân đế (xem `props/props.json`) |
| Animation | bằng code (thúng nảy khi bỏ đồ, nắp bật) |
| Reference (`--ref`) | `sample-dat-nen-bui-cay.png` + `hero-front-src.png` |
| File trong game | `props/sell-basket-closed.png`, `props/sell-basket-open.png`, `props/stake-1.png`, `props/stake-row.png`, `props/seed-stall.png` |
| Trạng thái | **Approved** (người dùng duyệt 2026-10-14) |

## Mô tả (tiếng Việt)

- **Thúng bán**: thúng tre đan có nắp (story bible §2.2), 2 trạng thái: đóng / nắp tựa bên hé ra đầy rau, khoai, dưa (khi có đồ chờ bán). Tròn + vàng rơm = "có lợi".
- **Cọc rào**: cọc tre vót nhọn buộc dây rơm; hàng 3 cọc + dây võng + giẻ đỏ = ô ruộng chưa mở.
- **Quầy hạt** (ART-PRP-001): chõng tre thấp bày nong/thúng hạt (gạo nếp, đậu, mạ, ngô, túi hạt), biển gỗ vẽ hình hạt + mầm (**không chữ**). **Không có người bán** (cô Tám Thóc là sprite NPC riêng, D-037) — chừa chỗ đứng sau chõng (`sellerSpot` trong `props.json`).

## Prompt chính

Khung chung (`{P}`, `{REF}`, `{VIEW}`, `{TECH}`, `{NEG}`) như [ART-BLD-001](ART-BLD-001.md). Prompt đầy đủ: `art-source/raw/lot1/prompts/{prp-garden,prp-seedstall}.txt`.

```
{P}
{REF}
Game sprite sheet for a top-down 2D farming game: small garden objects. {VIEW}
Composition: FOUR separate objects in one horizontal row with wide empty background between them, all at the SAME SCALE, each centered in its own quarter of the image, standing on the same invisible baseline, generous padding, isolated on a plain flat solid magenta #FF00FF background. No ground under them.
1) a round Vietnamese woven bamboo basket with a lid, about knee high on an adult, the woven bamboo drawn as a rhythmic crisscross pattern in straw yellow #DDA933 with wood #B98550 shading, a darker rim band of wrapped rattan, the round woven lid CLOSED on top with a small knob.
2) the SAME basket with the lid tilted open and leaning against its side, showing the basket full of harvested produce: a bunch of green leafy vegetables, a purple-brown sweet potato, a small round striped watermelon peeking out.
3) a single sharpened bamboo stake about knee high, straw yellow #DDA933 with node rings, a loop of straw rope #B98550 tied near the top with a short loose rope end hanging.
4) a short row of three such bamboo stakes in a line linked by one sagging straw rope, a small vermilion #A93226 cloth rag tied on the middle stake.
Palette: limited palette using only #2E2118 #3D6B4B #93B04F #7A4B2A #B98550 #DDA933 #A93226 #6B3F6E #EFE4C8.
{TECH}
Avoid: {NEG}, plastic, crates, metal, signs with writing
```

```
{P}
{REF}
Game sprite of ONE village seed stall on a porch, for a top-down 2D farming game, with NOBODY at it. {VIEW}
The stall: a low wide Vietnamese bamboo daybed table about three times wider than tall, made of parallel bamboo slats in straw yellow #DDA933 and wood #B98550 with four short legs; on top of it, side by side, four or five round flat woven bamboo trays and small baskets full of seeds: pale cream #EFE4C8 rice grains, brown #7A4B2A beans, light green #93B04F seedlings, yellow #DDA933 corn kernels, little cloth seed bags; behind the table at the right end, a small wooden signboard on a pole painted with simple pictures of a seed and a sprout (pictures only, no letters). The space directly BEHIND the table is left empty (the shopkeeper character will be placed there by the game).
Composition: one single stall, centered, generous padding, isolated on a plain flat solid magenta #FF00FF background. No ground, no porch floor, no house.
Palette: limited palette using only #2E2118 #3D6B4B #93B04F #7A4B2A #B98550 #DDA933 #A93226 #EFE4C8.
{TECH}
Avoid: {NEG}, shopkeeper, vendor, person, letters or writing on the sign, price tags, roof, umbrella
```

## Lệnh

```
$PY $R/tools/props2.py garden seedstall
```

## Nhật ký gen

| Ngày | Lần | Thay đổi prompt | Kết quả (lỗi theo checklist) | Chọn |
|---|---|---|---|---|
| 2026-10-14 | thúng + cọc v1 (2 nhanh 16:9) | Prompt trên | #1 vẽ 2 hàng lặp lại; #2 đúng 4 món một hàng, rõ ở 64 px | **#2** |
| 2026-10-14 | quầy hạt v1 (2 nhanh 4:3) | Prompt trên | #1 nhìn chéo góc (sai §7); #2 chính diện, biển chỉ có hình, có bóng tím dưới chõng → khóa màu magenta xóa luôn | **#2** |
