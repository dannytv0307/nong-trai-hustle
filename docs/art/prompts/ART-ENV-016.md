# ART-ENV-016 / 017 / 003 / 002 / 004 — Bụi cỏ, lùm hoa, lùm cây, cây nhãn, rào tre + rào dâm bụt

| Mục | Giá trị |
|---|---|
| Loại | ENV |
| Dùng ở | Vườn (cây nhãn, rào, thúng — D-035: Vườn không thêm cụm bụi) → Xóm (mọi cụm theo Art Bible §7.1) |
| Tỉ lệ gen (`--aspect`) | bụi cỏ + hoa 4:3 (12 món/ảnh) · lùm cây 16:9 · cây nhãn 1:1 · rào 1:1 — model nhanh |
| Kích thước cuối | bụi cỏ / hoa 64×64 (dâm bụt 64×80, bụi to 128×112) · lùm cây 64–192 rộng · cây nhãn **224×224** tách tán / gốc · rào tre 64×80 / ô · dâm bụt ngang 64×96 / ô, dọc 64×64 / ô |
| Nền khi gen | `#FF00FF` (nhiều xanh lá) |
| Pivot | `setOrigin(0.5, 1)` tại đáy ô; chân đế trong `props/props.json` |
| Animation | bằng code: rung lá (Should), tán nhãn mờ khi {ten} đứng dưới (Should) |
| Reference (`--ref`) | `sample-dat-nen-bui-cay.png` + `hero-front-src.png` (D-035) |
| File trong game | `props/grass-{tuft-1,tuft-2,reed-1,reed-2,flower,stone}.png`, `props/flower-{dambut-1,dambut-2,muoigio-1,muoigio-2,cuc-1,cuc-2}.png`, `props/bush-{che-tron,che-dai,che-dai-3,duoi,tan-thap}.png`, `props/tree-nhan{,-canopy,-trunk}.png`, `props/fence-tre-{h,post,v}.png`, `props/hedge-dambut-{h-l,h-mid3,h-r,v-top,v-mid,v-bottom}.png` |
| Trạng thái | **Approved** (người dùng duyệt 2026-10-14) |

## Mô tả (tiếng Việt)

Theo Art Bible §7.1 (ảnh mẫu `sample-dat-nen-bui-cay.png`): bụi cỏ gà, cỏ lau bông nâu, búi cỏ hoa dại, đá nhỏ + cỏ dại (ruộng chưa mở, thay ENV-008); dâm bụt bụi 1 ô + 2 ô (chặn), mười giờ hồng, cúc dại trắng (đi xuyên); chè tàu gối tròn, chè dải 2 ô + 3 ô (ghép hàng rào xanh), duối bù xù (quả cam nhỏ — đúng cây duối), cây bụi tán thấp 2 ô. **Cây nhãn** già: thân xù thấp, tán tròn 2 tông, chùm nhãn nhỏ; tách **tán** (luôn vẽ trên nhân vật) và **gốc** (sắp theo y), cùng canvas. **Rào tre** thấp mắt cáo (cao 70 px < {ten} 96) và **rào dâm bụt** cắt xén có hoa đỏ son.

**Cách dựng rào (script, 0 USD):** rào tre ngang cắt đúng 1 nhịp từ tâm trụ tới tâm trụ → lặp liền; đầu/cuối đặt thêm `fence-tre-post` tại mép ô. Rào dọc (vẽ lại theo người dùng 2026-10-14, `art-source/raw/lot1/tools/fence_v.py`): mỗi ô 1 **trụ ngắn 46 px** (nắp + chân của trụ ngang) để có khe giữa các trụ, **2 thanh dọc** lệch phải trụ chạy suốt ô (nối liền), **chéo X** ở khe — không còn "cây sào". Dâm bụt ngang: đầu trái + khúc giữa 3 ô (soi gương A + lật A → mép nối nào cũng trùng cột) + đầu phải (= lật đầu trái); dâm bụt dọc: đầu trên + khúc giữa 64 (A + lật dọc A) + chân (đầu 12 hàng trộn nối từ khúc giữa).

## Prompt chính

Khung chung như [ART-BLD-001](ART-BLD-001.md). Prompt đầy đủ: `art-source/raw/lot1/prompts/{env-plants,env-shrubs,env-longan,env-fence}.txt`. Đoạn riêng cây nhãn:

```
Game sprite of ONE old longan tree from a North Vietnamese village garden, for a top-down 2D village game. {VIEW}
The tree: a short thick gnarled trunk, rough bark drawn with rhythmic short ink strokes in brown #7A4B2A with a darker side, splitting into two or three low thick branches; a big ROUND dense dome-shaped canopy, wider than tall, made of many clusters of small elongated leaves drawn as repeated decorative strokes, two flat tones: light green #93B04F upper-left and dark copper green #3D6B4B lower-right, with a few small gaps. A few tiny round tan longan fruit clusters #B98550 hanging under the canopy. The canopy bottom edge is well ABOVE the ground so that the lower trunk and the base of the trunk are clearly visible below it (a person could walk behind the trunk). Friendly, rounded, gentle, no spikes.
Composition: one single tree, centered, the trunk base at the bottom center, the whole tree visible, generous padding, isolated on a plain flat solid magenta #FF00FF background. No roots spreading on the ground, no grass, no soil.
Palette: limited palette using only #2E2118 #3D6B4B #93B04F #7A4B2A #B98550 #DDA933.
Avoid: {NEG}, palm, pine, banyan aerial roots, orange or red fruit, autumn colors, tall thin tree
```

Sheet bụi cỏ + hoa: lưới 4×3, liệt kê 12 món theo hàng (cỏ gà ×2, cỏ lau ×2 / cỏ hoa dại, đá nâu (NOT grey), dâm bụt nhỏ, dâm bụt rộng / mười giờ ×2, cúc dại ×2). Rào: lưới 2×2 (tre ngang 6 nhịp, tre chạy xa, dâm bụt ngang, dâm bụt chạy xa).

## Lệnh

```
$PY $R/tools/props2.py plants shrubs longan longan_split fences
```

## Nhật ký gen

| Ngày | Lần | Thay đổi prompt | Kết quả (lỗi theo checklist) | Chọn |
|---|---|---|---|---|
| 2026-10-14 | bụi cỏ + hoa v1 (3 nhanh 4:3) | Prompt trên | Cả 3 đạt 12 món đúng thứ tự, đá màu nâu; #3 nhạt nét hơn | **#1** |
| 2026-10-14 | lùm cây v1 (2 nhanh 16:9) | Prompt trên | #1 ra 5 món (thêm chè dải dài — giữ làm `bush-che-dai-3`), nét đậm; #2 món nhỏ | **#1** |
| 2026-10-14 | cây nhãn v1 (3 nhanh 1:1) | Prompt trên | Cả 3 đạt; #1 thân lộ rõ dưới tán (đi sau được) | **#1** |
| 2026-10-14 | rào v1 (3 nhanh 1:1) | Prompt trên | #2 rào tre đều nhịp (trụ cách đều ~116 px) + dâm bụt ngang/dọc gọn; #1 dâm bụt thành lá rời; #3 ít món | **#2** |
| 2026-10-14 | rào tre dọc v1 (3 nhanh 9:16, ref ảnh mẫu + rào ngang đã duyệt) | Tả đoạn rào chạy bắc–nam, trụ có khe, thanh + chéo X nhìn nghiêng | Cả 3 ra hình "cái thang" (trụ nằm ngang / nhìn thẳng từ trên) — lệch góc 3/4 → **không dùng**; dựng bằng script từ mảnh rào ngang | Script |
