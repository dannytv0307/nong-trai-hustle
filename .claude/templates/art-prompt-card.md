# ART-XXX-NNN — <Tên asset>

| Mục | Giá trị |
|---|---|
| Loại | CHR / ENM / ITM / ENV / UI / FX / ICO |
| Dùng ở | màn hình / sự kiện |
| Tỉ lệ gen (`--aspect`) | 1:1 / 16:9 … |
| Kích thước cuối | …×… px, hiển thị khoảng … px trên màn 1920×1080 (… ô tile) |
| Nền khi gen | màu phẳng `#…` (để tách nền) / không tách (background) |
| Pivot | bottom / center |
| Animation | bằng code (nảy, xoay, scale…) / frame: … |
| Reference (`--ref`) | `art-source/reference/…` |
| File trong game | `web/client/public/assets/art/<Loại>/<ten>.png` |
| Trạng thái | Prompted |

## Mô tả (tiếng Việt)

Asset là gì, cảm giác cần truyền tải, phải nhận ra được điều gì ở kích thước nhỏ.

## Prompt chính

```
<STYLE_PREFIX nguyên văn>
<subject + character token>
<pose/state>
<view>
<composition: centered, single subject, generous padding, isolated on a plain flat #XXXXXX background>
<palette>
<technical: no text, no ground shadow, clean silhouette, readable at small size>
```

## Negative

```
<NEGATIVE nguyên văn>, <riêng cho asset này>
```

## Lệnh

```
.venv/Scripts/python tools/gen_image.py --card docs/art/prompts/ART-XXX-NNN.md --name ART-XXX-NNN -n 4 --aspect 1:1 --ref art-source/reference/<anchor>.png
.venv/Scripts/python tools/process_image.py removebg <ảnh đã chọn> art-source/raw/ART-XXX-NNN/nobg.png
.venv/Scripts/python tools/process_image.py fit art-source/raw/ART-XXX-NNN/nobg.png web/client/public/assets/art/<Loại>/<ten>.png --size 256 --pivot bottom
.venv/Scripts/python tools/process_image.py preview web/client/public/assets/art/<Loại>/<ten>.png --display 128
```

## Nhật ký gen

| Ngày | Lần | Thay đổi prompt | Kết quả (lỗi theo checklist) | Chọn |
|---|---|---|---|---|
