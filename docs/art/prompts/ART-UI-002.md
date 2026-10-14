# ART-UI-002 … ART-UI-007 — Bộ giao diện Vườn (Lô 1, T-091)

Một card cho cả bộ vì gen chung 4 sheet: khung giấy + tooltip (UI-002), ô (UI-003), nút (UI-004), khung HUD (UI-005), icon HUD (UI-006), bong bóng (UI-007).

| Mục | Giá trị |
|---|---|
| Loại | UI |
| Dùng ở | HUD Vườn, mọi cửa sổ (gùi, thùng bán, rương, sạp hạt, tổng kết, tạm dừng, hộp hỏi), bong bóng trên đầu {ten}; dùng lại cho cửa hàng / khung thoại Lô 2 |
| Tỉ lệ gen (`--aspect`) | 1:1 (khung, HUD, bong bóng), 4:3 (icon 4×3) |
| Kích thước cuối | xem `web/client/public/assets/art/ui/ui.json` (9-slice: lề cắt, cỡ nhỏ nhất, vùng chữ) — ảnh gen 1024 thu **×0,5** → nét mực ~4–5 px ở 1080p; icon 128×128 |
| Nền khi gen | `#00FF00` (khung giấy, bong bóng — không có xanh lá) · `#FF00FF` (HUD có tre vàng, icon có áo tơi xanh) |
| Pivot | 9-slice: góc trên-trái · icon: giữa · đuôi bong bóng: (0.5, 0) |
| Animation | bằng code (nảy nút, rung bong bóng chửi, nhấp nháy đồng hồ đỏ từ 23h) |
| Reference (`--ref`) | `art-source/raw/lot1/ui/ref/icons-ref.png` (= sheet icon Vườn 2 đã duyệt) + `ui/ref/wood-ref.png` (= quầy hạt đã duyệt); icon chỉ ref sheet icon |
| File trong game | `web/client/public/assets/art/ui/*.png` + `ui.json` |
| Trạng thái | Approved (người dùng duyệt 2026-10-14) |

## Mô tả (tiếng Việt)

- **Cửa sổ = tờ giấy điệp** in mộc: nền trắng điệp phẳng, viền mực, đường khung đôi nâu đất, 4 góc mây cát tường đỏ son + vàng (kiểu viền tranh Đông Hồ). Chữ trong cửa sổ màu **mực** (đổi so với bản code: chữ kem trên nền nâu).
- **HUD = đồ gỗ / tre** (tách khỏi cửa sổ giấy): thanh Sức là **ống tre vàng có khe**, ruột màu vẽ bằng code bên dưới; ô tiền / đồng hồ / level dùng chung **bảng gỗ nâu**; đồng hồ có **đĩa gỗ** chứa mặt trời / trăng.
- **Nút gỗ** có gờ dày (bấm thì lún). **Ô** giấy lõm; ô chọn viền vàng; ô khóa xám tro + ổ khóa.
- **Bong bóng:** thường (bo tròn), chửi thề (răng cưa, viền trong đỏ son — hình nhọn = xấu), khoe (vàng + lấp lánh — vàng = tốt), nghĩ "…" (mây).
- **Icon HUD:** mặt trời, trăng (mặt tranh dân gian), mưa, sao level, mùa nắng = **quạt nan**, mùa mưa = **áo tơi**, Sức = **bắp tay**, sổ nhiệm vụ = cuộn giấy, gùi, đồng xu lỗ vuông, ổ khóa, nút đóng X (cho bản cảm ứng).
- Trạng thái nút / ô (hover, nhấn, xám, chọn, khóa) **tô lại bằng script** từ một ảnh → khớp tuyệt đối, 0 USD.

## Prompt chính

Prompt đầy đủ (STYLE_PREFIX + ref + nội dung + Avoid) ở `art-source/raw/lot1/prompts/ui-panel.txt`, `ui-hud.txt`, `ui-bubbles.txt`, `ui-icons.txt` (phần nội dung riêng: `ui-*-body.txt`). Khối chung:

```
<STYLE_PREFIX nguyên văn>
Reference images: image 1 shows this game's approved inventory icons and image 2 an approved bamboo-and-wood prop: copy their style exactly — bold uneven dark-brown #2E2118 woodblock ink outline of the same thickness, flat chalky folk-print colors with at most one flat darker tone on the bottom-right, light from the top-left, chunky simple shapes. Do not copy their objects.
Game user-interface kit ..., drawn flat and perfectly straight-on (orthographic, no perspective, edges parallel to the image borders). ... EMPTY panels ... The four straight sides between the corner ornaments are perfectly plain and uniform ...
Palette: limited palette using only #2E2118 #7A4B2A #B98550 #DDA933 #A93226 #EFE4C8 (and the green background).
Technical: no text, no letters, no ground shadow, completely empty panels, clean closed outlines, flat colors.
```

## Negative

```
photorealistic, 3D render, CGI, glossy, bevel and emboss, metallic, smooth gradients, airbrush, soft shading, inner glow, outer glow, rim light, bloom, neon or saturated candy colors, modern mobile-game cartoon look, glossy casual-game buttons, anime style, thin clean vector lines, painted paper texture, canvas texture, parchment stains, noise, text, letters, numbers, labels, calligraphy, seal stamp, signature, watermark, icons inside the panels, characters, people, perspective, isometric view, tilted 3D view, drop shadow, cast shadow, busy background
```

## Lệnh

```
R=art-source/raw/lot1/ui/ref
.venv/Scripts/python tools/gen_image.py --prompt "$(cat art-source/raw/lot1/prompts/ui-panel.txt)" --ref $R/icons-ref.png --ref $R/wood-ref.png --name ui-panel -n 2 --aspect 1:1 --hq --out art-source/raw/lot1/ui/panel
.venv/Scripts/python tools/gen_image.py --prompt "$(cat art-source/raw/lot1/prompts/ui-hud.txt)" --ref $R/icons-ref.png --ref $R/wood-ref.png --name ui-hud -n 2 --aspect 1:1 --hq --out art-source/raw/lot1/ui/hud
.venv/Scripts/python tools/gen_image.py --prompt "$(cat art-source/raw/lot1/prompts/ui-bubbles.txt)" --ref $R/icons-ref.png --ref $R/wood-ref.png --name ui-bubbles -n 3 --aspect 1:1 --out art-source/raw/lot1/ui/bubbles
.venv/Scripts/python tools/gen_image.py --prompt "$(cat art-source/raw/lot1/prompts/ui-icons.txt)" --ref $R/icons-ref.png --name ui-icons -n 2 --aspect 4:3 --hq --out art-source/raw/lot1/ui/icons
.venv/Scripts/python art-source/raw/lot1/tools/ui_pieces.py   # khóa màu nền, tách từng món, thu x0,5
.venv/Scripts/python art-source/raw/lot1/tools/ui_build.py    # 9-slice, trạng thái, ống tre, đuôi bong bóng, icon 128, ui.json
.venv/Scripts/python art-source/raw/lot1/tools/ui_mockup.py   # ảnh ghép mẫu + bảng bộ UI
```

## Nhật ký gen

| Ngày | Lần | Thay đổi prompt | Kết quả (lỗi theo checklist) | Chọn |
|---|---|---|---|---|
| 2026-10-14 | 1 | Khung giấy + tooltip (2 hq) | Cả 2 đạt; #1 góc mây cân, đường khung đôi thẳng, cạnh trơn → hợp 9-slice | #1 |
| 2026-10-14 | 1 | HUD 5 món (2 hq) | Cả 2 đạt; #2 bảng gỗ có khía mẻ (khó 9-slice) | #1 |
| 2026-10-14 | 1 | Bong bóng 4 kiểu (3 nhanh) | Đạt cả 3; #3 có tông tối dưới-phải đúng Art Bible | #3 |
| 2026-10-14 | 1 | Icon 12 (2 hq) | #1 sao có vệt bóng loáng, bắp tay cắt cụt; #2 đạt (nền hồng nhạt, khóa màu vẫn tách được). Bắp tay #2 mép vai thiếu viền → script tô mực | #2 |

Hậu kỳ: khóa màu nền (alpha mềm ở mép, mép pha nền kéo về mực) → làm phẳng phần giữa 9-slice → tô lại trạng thái (giữ tỉ lệ sáng/tối từng pixel) → ống tre: khoét cửa sổ trong suốt (giữ 3 px viền mực) → bong bóng: tách đuôi thành ảnh riêng, dải đáy thân thay bằng cột sạch.
