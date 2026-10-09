"""Hậu kỳ ảnh gen AI cho game.

Lệnh:
  removebg  Tách nền đơn sắc (nền phẳng mà prompt yêu cầu) -> PNG trong suốt
  fit       Cắt sát, thêm padding, thu nhỏ về kích thước cuối (pivot giữa hoặc đáy)
  sheet     Ghép nhiều ảnh thành 1 ảnh đánh số để so sánh
  preview   Xem asset ở kích thước thật trên nền sáng/tối + thang xám (kiểm tra độ đọc được)
  tiletest  Thu tile về N px rồi ghép lưới 3x3 (và bản dịch nửa ô) để soi đường nối

Ví dụ:
  python tools/process_image.py removebg in.png out.png
  python tools/process_image.py fit in.png game/Assets/Art/Characters/hero.png --size 256 --pivot bottom
  python tools/process_image.py preview game/Assets/Art/Characters/hero.png --display 128
"""
import argparse
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageOps

from common import ROOT  # noqa: F401 — đảm bảo stdout UTF-8


def _hex(c):
    c = c.lstrip("#")
    return tuple(int(c[i:i + 2], 16) for i in (0, 2, 4))


def remove_bg(src, dst, color=None, tol=40.0, holes=0, despill=False):
    """Xóa nền nối liền với mép ảnh và gần màu nền (mặc định: màu trung bình 4 góc)."""
    img = Image.open(src).convert("RGBA")
    a = np.asarray(img).astype(np.float32)
    rgb = a[..., :3]
    if color:
        bg = np.array(_hex(color), np.float32)
    else:
        h, w = rgb.shape[:2]
        k = max(4, min(h, w) // 50)
        corners = np.concatenate([rgb[:k, :k].reshape(-1, 3), rgb[:k, -k:].reshape(-1, 3),
                                  rgb[-k:, :k].reshape(-1, 3), rgb[-k:, -k:].reshape(-1, 3)])
        bg = np.median(corners, axis=0)
    dist = np.linalg.norm(rgb - bg, axis=-1)
    near = dist < tol

    # Chỉ xóa vùng nền nối với mép ảnh (giữ chi tiết bên trong trùng màu nền)
    reach = np.zeros_like(near)
    reach[0, :], reach[-1, :], reach[:, 0], reach[:, -1] = near[0, :], near[-1, :], near[:, 0], near[:, -1]
    while True:
        grown = reach.copy()
        grown[1:] |= reach[:-1]
        grown[:-1] |= reach[1:]
        grown[:, 1:] |= reach[:, :-1]
        grown[:, :-1] |= reach[:, 1:]
        grown &= near
        if (grown == reach).all():
            break
        reach = grown

    if holes:
        # Xóa cả vùng nền bị bao kín (khe giữa tay và thân...) nếu đủ lớn (>= holes px)
        cand = near & ~reach
        seen = np.zeros_like(cand)
        H, W = cand.shape
        for y0, x0 in zip(*np.nonzero(cand)):
            if seen[y0, x0]:
                continue
            stack, comp = [(y0, x0)], []
            seen[y0, x0] = True
            while stack:
                y, x = stack.pop()
                comp.append((y, x))
                for yy, xx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
                    if 0 <= yy < H and 0 <= xx < W and cand[yy, xx] and not seen[yy, xx]:
                        seen[yy, xx] = True
                        stack.append((yy, xx))
            if len(comp) >= holes:
                ys, xs = zip(*comp)
                reach[list(ys), list(xs)] = True

    alpha = a[..., 3].copy()
    alpha[reach] = 0
    # Viền mềm: pixel sát vùng nền và hơi giống nền -> trong suốt một phần
    edge = np.zeros_like(reach)
    edge[1:] |= reach[:-1]
    edge[:-1] |= reach[1:]
    edge[:, 1:] |= reach[:, :-1]
    edge[:, :-1] |= reach[:, 1:]
    edge &= ~reach
    soft = edge & (dist < tol * 2.5)
    alpha[soft] = np.minimum(alpha[soft], 255 * (dist[soft] - tol) / (tol * 1.5)).clip(0, 255)
    a[..., 3] = alpha
    if despill:
        # Khử viền ám màu nền (xanh lá/hồng) ở pixel sát nền
        ring = edge.copy()
        for _ in range(2):
            g = ring.copy()
            g[1:] |= ring[:-1]; g[:-1] |= ring[1:]; g[:, 1:] |= ring[:, :-1]; g[:, :-1] |= ring[:, 1:]
            ring = g
        ring &= ~reach
        r, gg, b = a[..., 0], a[..., 1], a[..., 2]
        if bg[1] > bg[0] and bg[1] > bg[2]:
            lim = np.maximum(r, b)
            m = ring & (gg > lim)
            a[..., 1][m] = lim[m]
        else:
            lim = gg
            m = ring & ((r > lim) & (b > lim))
            a[..., 0][m] = np.minimum(r[m], lim[m] + (r[m] - lim[m]) * 0.3)
            a[..., 2][m] = np.minimum(b[m], lim[m] + (b[m] - lim[m]) * 0.3)
    Image.fromarray(a.astype(np.uint8)).save(dst)
    removed = reach.mean() * 100
    print(f"{dst}: nền {tuple(int(x) for x in bg)} đã xóa {removed:.0f}% ảnh")
    if removed < 5:
        print("  Cảnh báo: xóa rất ít — nền có thể không phẳng, thử --color hoặc --tol lớn hơn")


def fit(src, dst, size, pad=4, pivot="center", nearest=False):
    """Cắt sát vùng không trong suốt rồi đặt vào canvas vuông/chữ nhật `size`."""
    img = Image.open(src).convert("RGBA")
    box = img.getchannel("A").getbbox()
    if box:
        img = img.crop(box)
    tw, th = size
    scale = min((tw - 2 * pad) / img.width, (th - 2 * pad) / img.height)
    new = (max(1, round(img.width * scale)), max(1, round(img.height * scale)))
    img = img.resize(new, Image.NEAREST if nearest else Image.LANCZOS)
    canvas = Image.new("RGBA", (tw, th), (0, 0, 0, 0))
    x = (tw - new[0]) // 2
    y = th - pad - new[1] if pivot == "bottom" else (th - new[1]) // 2
    canvas.paste(img, (x, y), img)
    Path(dst).parent.mkdir(parents=True, exist_ok=True)
    canvas.save(dst)
    print(f"{dst}: {tw}x{th}, pivot {pivot}")


def _checker(w, h, s=16):
    bg = Image.new("RGB", (w, h), (235, 235, 235))
    d = ImageDraw.Draw(bg)
    for y in range(0, h, s):
        for x in range((y // s % 2) * s, w, 2 * s):
            d.rectangle([x, y, x + s - 1, y + s - 1], fill=(205, 205, 205))
    return bg


def contact_sheet(files, dst, cell=320):
    files = [Path(f) for f in files]
    cols = min(4, len(files))
    rows = (len(files) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * cell, rows * (cell + 28)), (40, 40, 40))
    d = ImageDraw.Draw(sheet)
    for i, f in enumerate(files):
        im = Image.open(f).convert("RGBA")
        im.thumbnail((cell - 8, cell - 8))
        tile = _checker(cell - 8, cell - 8)
        tile.paste(im, ((tile.width - im.width) // 2, (tile.height - im.height) // 2), im)
        x, y = (i % cols) * cell, (i // cols) * (cell + 28)
        sheet.paste(tile, (x + 4, y + 4))
        d.text((x + 8, y + cell - 2), f"#{i + 1}  {f.name[-40:]}", fill=(255, 255, 255))
    sheet.save(dst)


def preview(src, dst, display=128, light="#F5F0E6", dark="#2B2D42"):
    """Asset ở kích thước hiển thị thật: nền sáng, nền tối, thang xám."""
    im = Image.open(src).convert("RGBA")
    im.thumbnail((display, display), Image.LANCZOS)
    gray = ImageOps.grayscale(im.convert("RGB")).convert("RGBA")
    gray.putalpha(im.getchannel("A"))
    pad = 16
    out = Image.new("RGB", (3 * (display + 2 * pad), display + 2 * pad), (0, 0, 0))
    for i, (bg, sprite) in enumerate([(light, im), (dark, im), (light, gray)]):
        tile = Image.new("RGB", (display + 2 * pad, display + 2 * pad), _hex(bg))
        tile.paste(sprite, (pad + (display - sprite.width) // 2, pad + (display - sprite.height) // 2), sprite)
        out.paste(tile, (i * (display + 2 * pad), 0))
    out.save(dst)
    print(f"{dst}: preview {display}px (sáng | tối | xám)")


def tiletest(src, dst, size=64, n=3, zoom=2):
    """Thu tile về size px, ghép n x n; bên phải là bản dịch nửa ô (đường nối nằm giữa)."""
    t = Image.open(src).convert("RGB")
    w, h = t.size
    s = min(w, h)
    t = t.crop(((w - s) // 2, (h - s) // 2, (w - s) // 2 + s, (h - s) // 2 + s)).resize((size, size), Image.LANCZOS)
    small = Path(dst).with_name(Path(dst).stem + f"_{size}.png")
    t.save(small)
    grid = Image.new("RGB", (size * n, size * n))
    for y in range(n):
        for x in range(n):
            grid.paste(t, (x * size, y * size))
    arr = np.asarray(grid)
    shifted = Image.fromarray(np.roll(np.roll(arr, size // 2, 0), size // 2, 1))
    gap = 12
    out = Image.new("RGB", (2 * size * n + gap, size * n), (40, 40, 40))
    out.paste(grid, (0, 0))
    out.paste(shifted, (size * n + gap, 0))
    out = out.resize((out.width * zoom, out.height * zoom), Image.NEAREST)
    out.save(dst)
    print(f"{dst}: {n}x{n} ô {size}px (trái: ghép thẳng | phải: lệch nửa ô), tile {small}")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    p = sub.add_parser("removebg")
    p.add_argument("src")
    p.add_argument("dst")
    p.add_argument("--color", help="Màu nền hex, mặc định tự lấy từ 4 góc")
    p.add_argument("--tol", type=float, default=40)
    p.add_argument("--holes", type=int, default=0, help="Xóa cả vùng nền bị bao kín có >= N px (0 = tắt)")
    p.add_argument("--despill", action="store_true", help="Khử viền ám màu nền")
    p = sub.add_parser("fit")
    p.add_argument("src")
    p.add_argument("dst")
    p.add_argument("--size", required=True, help="N hoặc WxH")
    p.add_argument("--pad", type=int, default=4)
    p.add_argument("--pivot", choices=["center", "bottom"], default="center")
    p.add_argument("--nearest", action="store_true", help="Cho pixel art")
    p = sub.add_parser("sheet")
    p.add_argument("files", nargs="+")
    p.add_argument("--out", required=True)
    p = sub.add_parser("preview")
    p.add_argument("src")
    p.add_argument("--out")
    p.add_argument("--display", type=int, default=128)
    p = sub.add_parser("tiletest")
    p.add_argument("src")
    p.add_argument("--out", required=True)
    p.add_argument("--size", type=int, default=64)
    p.add_argument("--n", type=int, default=3)
    p.add_argument("--zoom", type=int, default=2)
    a = ap.parse_args()

    if a.cmd == "removebg":
        remove_bg(a.src, a.dst, a.color, a.tol, a.holes, a.despill)
    elif a.cmd == "fit":
        w, _, h = a.size.partition("x")
        fit(a.src, a.dst, (int(w), int(h or w)), a.pad, a.pivot, a.nearest)
    elif a.cmd == "sheet":
        contact_sheet(a.files, a.out)
        print(a.out)
    elif a.cmd == "preview":
        preview(a.src, a.out or str(Path(a.src).with_name(Path(a.src).stem + "_preview.png")), a.display)

    elif a.cmd == "tiletest":
        tiletest(a.src, a.out, a.size, a.n, a.zoom)


if __name__ == "__main__":
    main()
