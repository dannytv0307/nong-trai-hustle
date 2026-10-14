"""Cắt ảnh gen N khung động tác (cuốc, tưới, cúi...) -> dải ngang ô WxH, tỉ lệ cố định theo bề ngang nón,
neo theo bàn chân (tâm hai bàn chân -> x = cx, đáy bàn chân -> y = foot_y).

Khác `process_image.py sheet-split`: không fit theo bbox (nông cụ làm bbox to nhỏ thất thường),
tách hình bằng thành phần liên thông (cán cuốc có thể lấn sang cột hình kề).

Ví dụ:
  python tools/action_split.py src.png --n 4 --out right.png --hat-w 45 --flip-frames 4 --gif right.gif
"""
import argparse
import sys
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageOps

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
from process_image import remove_bg  # noqa: E402


def masks(arr):
    r, g, b = (arr[..., i].astype(int) for i in range(3))
    a = arr[..., 3] > 40
    cream = a & (r > 205) & (g > 190) & (b > 150)
    straw = a & (r > 180) & (g > 145) & (b < 110)
    skin = a & (r > 185) & (g > 135) & (g < 205) & (b > 85) & (b < 175) & (r - b > 45) & (r - g > 20)
    return a, cream, straw, skin


def components(mask, k=4):
    """Nhãn thành phần liên thông trên lưới thu nhỏ k lần (max-pool)."""
    H, W = mask.shape
    h, w = H // k, W // k
    small = mask[: h * k, : w * k].reshape(h, k, w, k).any(axis=(1, 3))
    lab = np.zeros((h, w), np.int32)
    sizes = [0]
    n = 0
    for y0, x0 in zip(*np.nonzero(small)):
        if lab[y0, x0]:
            continue
        n += 1
        lab[y0, x0] = n
        q = deque([(y0, x0)])
        cnt = 0
        while q:
            y, x = q.popleft()
            cnt += 1
            for yy in (y - 1, y, y + 1):
                for xx in (x - 1, x, x + 1):
                    if 0 <= yy < h and 0 <= xx < w and small[yy, xx] and not lab[yy, xx]:
                        lab[yy, xx] = n
                        q.append((yy, xx))
        sizes.append(cnt)
    full = np.zeros((H, W), np.int32)
    full[: h * k, : w * k] = np.repeat(np.repeat(lab, k, 0), k, 1)
    return full, sizes


def split_frames(img, n, cuts=None):
    arr = np.asarray(img)
    a = arr[..., 3] > 40
    H, W = a.shape
    if cuts:
        xs = [0] + cuts + [W]
        out = []
        for i in range(n):
            m = np.zeros_like(a)
            m[:, xs[i]:xs[i + 1]] = a[:, xs[i]:xs[i + 1]]
            out.append(m)
        return out
    lab, sizes = components(a)
    order = sorted(range(1, len(sizes)), key=lambda i: -sizes[i])
    big = order[:n]
    if len(big) < n or sizes[big[-1]] < sizes[big[0]] * 0.15:
        raise SystemExit(f"Chỉ thấy {len([i for i in order if sizes[i] > sizes[order[0]] * 0.15])} hình lớn, cần {n} -> dùng --cuts")
    centers = {i: np.nonzero(lab == i)[1].mean() for i in big}
    spans = {}
    for i in big:
        xs_ = np.nonzero(lab == i)[1]
        spans[i] = (xs_.min(), xs_.max())
    big.sort(key=lambda i: centers[i])
    # mẩu nhỏ (giọt nước, vụn) -> gán cho hình có MÉP (bbox ngang) gần nhất, không theo tâm
    owner = np.zeros(len(sizes), np.int32)
    for i in range(1, len(sizes)):
        if i in big:
            owner[i] = i
        else:
            ys, xs_ = np.nonzero(lab == i)
            if len(xs_) == 0:
                continue
            cx = xs_.mean()
            owner[i] = min(big, key=lambda j: max(spans[j][0] - cx, cx - spans[j][1], 0) * 1000 + abs(centers[j] - cx))
    own = owner[lab]
    return [a & (own == i) for i in big]


def hat_width(cream, straw):
    rows = np.nonzero(cream.sum(axis=1) >= max(3, cream.shape[1] // 60))[0]
    if len(rows) == 0:
        return None
    best = 0
    hm = cream | straw
    for y in range(rows.min(), rows.max() + 1):
        xs = np.nonzero(hm[y])[0]
        if len(xs):
            best = max(best, xs[-1] - xs[0] + 1)
    return best


def feet(alpha, skin, hoe_free=None):
    """(tâm x hai bàn chân, đáy bàn chân y) trong toạ độ ảnh."""
    ys, xs = np.nonzero(skin)
    if len(ys) == 0:
        raise SystemExit("không thấy da (bàn chân)")
    total_h = np.nonzero(alpha.any(axis=1))[0]
    hgt = total_h.max() - total_h.min()
    low = ys.max()
    band = ys > low - 0.07 * hgt
    fx0, fx1 = xs[band].min(), xs[band].max()
    cols = alpha[:, fx0:fx1 + 1]
    # đáy = hàng thấp nhất có pixel trong dải cột bàn chân, nhưng không xa hơn da quá 4% (viền mực)
    rows = np.nonzero(cols.any(axis=1))[0]
    bottom = min(rows.max(), low + int(0.04 * hgt))
    return (fx0 + fx1) / 2, bottom, (fx0, fx1)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("src")
    p.add_argument("--n", type=int, default=4)
    p.add_argument("--out", required=True)
    p.add_argument("--cell", default="128x128")
    p.add_argument("--stand-h", type=float, default=0, help="Chiều cao đỉnh nón -> đáy chân (px) của khung --ref-frame; ưu tiên hơn --hat-w")
    p.add_argument("--ref-frame", type=int, default=1)
    p.add_argument("--hat-w", type=float, default=0, help="Bề ngang nón đích (px) — khớp dải đi cùng hướng")
    p.add_argument("--cx", type=float, default=64, help="x đích của tâm hai bàn chân trong ô")
    p.add_argument("--foot-y", type=int, default=110, help="hàng pixel thấp nhất của bàn chân trong ô")
    p.add_argument("--flip-frames", default="", help="Khung lật gương riêng (đánh số từ 1), vd 4")
    p.add_argument("--order", default="", help="Thứ tự khung, vd 1,2,3,4")
    p.add_argument("--mirror", action="store_true", help="Lật từng ô (phải -> trái), giữ thứ tự khung")
    p.add_argument("--cuts", default="", help="Cắt theo x cố định nếu các hình dính nhau, vd 400,800,1200")
    p.add_argument("--dx", default="", help="Dời ngang từng khung (px ở ô 1x), vd 0,0,-4,0 — sửa khi tay chạm đất lẫn vào dò bàn chân")
    p.add_argument("--dy", default="", help="Dời dọc từng khung (px ở ô 1x)")
    p.add_argument("--tol", type=float, default=70)
    p.add_argument("--holes", type=int, default=30)
    p.add_argument("--color")
    p.add_argument("--gif")
    p.add_argument("--fps", type=int, default=10)
    p.add_argument("--x2", help="Lưu thêm bản 2x (ô gấp đôi)")
    a = p.parse_args()

    tw, th = map(int, a.cell.split("x"))
    tmp = Path(a.out).with_suffix(".nobg.png")
    remove_bg(a.src, tmp, a.color, a.tol, a.holes, True)
    img = Image.open(tmp).convert("RGBA")
    arr = np.asarray(img).astype(np.int16).copy()
    lim = np.maximum(arr[..., 0], arr[..., 2])
    m = arr[..., 1] > lim
    arr[..., 1][m] = lim[m]
    img = Image.fromarray(arr.astype(np.uint8), "RGBA")
    tmp.unlink()

    cuts = [int(x) for x in a.cuts.split(",")] if a.cuts else None
    fmasks = split_frames(img, a.n, cuts)
    base = np.asarray(img)
    flips = {int(x) - 1 for x in a.flip_frames.split(",") if x}
    frames = []
    for i, fm in enumerate(fmasks):
        f = base.copy()
        f[..., 3] = np.where(fm, f[..., 3], 0)
        fim = Image.fromarray(f, "RGBA")
        fim = fim.crop(fim.getchannel("A").getbbox())
        if i in flips:
            fim = ImageOps.mirror(fim)
        frames.append(fim)
    if a.order:
        frames = [frames[int(x) - 1] for x in a.order.split(",")]

    info = []
    for fim in frames:
        arr = np.asarray(fim)
        al, cream, straw, skin = masks(arr)
        info.append((hat_width(cream, straw), *feet(al, skin)))
    hats = [h for h, *_ in info if h]
    scale = a.hat_w / float(np.median(hats)) if a.hat_w else 0
    tops = []
    for fim in frames:
        al, cream, straw, skin = masks(np.asarray(fim))
        hy = np.nonzero((cream | straw).any(axis=1))[0]
        tops.append(hy.min() if len(hy) else 0)
    hs = [fb - t for t, (_, _, fb, _) in zip(tops, info)]
    print("chiều cao đỉnh nón -> chân (nguồn):", hs)
    if a.stand_h:
        scale = a.stand_h / hs[a.ref_frame - 1]
    print("bề ngang nón nguồn:", [h for h, *_ in info], "-> tỉ lệ", round(scale, 4))

    for z, suffix in ((1, a.out), (2, a.x2)):
        if not suffix:
            continue
        strip = Image.new("RGBA", (tw * z * len(frames), th * z), (0, 0, 0, 0))
        cells = []
        for i, (fim, (hw, fx, fb, fr)) in enumerate(zip(frames, info)):
            s = scale * z
            im = fim.resize((max(1, round(fim.width * s)), max(1, round(fim.height * s))), Image.LANCZOS)
            c = Image.new("RGBA", (tw * z, th * z), (0, 0, 0, 0))
            ddx = [float(v) for v in a.dx.split(",")] if a.dx else [0] * len(frames)
            ddy = [float(v) for v in a.dy.split(",")] if a.dy else [0] * len(frames)
            x = round(a.cx * z - fx * s + ddx[i] * z)
            y = round((a.foot_y + 1) * z - (fb + 1) * s + ddy[i] * z)
            c.paste(im, (x, y), im)
            bb = c.getchannel("A").getbbox()
            if z == 1:
                print(f"  khung {i + 1}: bbox {bb}, bàn chân nguồn x {fr}, đáy {fb}, nón {hw}")
                if bb and (bb[0] <= 0 or bb[1] <= 0 or bb[2] >= tw or bb[3] >= th):
                    print("    CẢNH BÁO: chạm mép ô")
            if a.mirror:
                c = ImageOps.mirror(c)
            strip.paste(c, (i * tw * z, 0))
            cells.append(c)
        Path(suffix).parent.mkdir(parents=True, exist_ok=True)
        strip.save(suffix)
        print(f"{suffix}: {len(frames)} khung {tw * z}x{th * z}")
        if z == 1 and a.gif:
            k = 3
            g = []
            for c in cells:
                bg = Image.new("RGBA", (tw * k, th * k), (245, 240, 230, 255))
                bg.alpha_composite(c.resize((tw * k, th * k), Image.NEAREST))
                d = ImageDraw.Draw(bg)
                d.line([(0, (a.foot_y + 1) * k), (tw * k, (a.foot_y + 1) * k)], fill=(180, 160, 140))
                d.line([(tw * k // 2, 0), (tw * k // 2, th * k)], fill=(220, 200, 190))
                g.append(bg.convert("RGB"))
            g[0].save(a.gif, save_all=True, append_images=g[1:], duration=int(1000 / a.fps), loop=0)
            print(f"{a.gif}: GIF {a.fps} fps")


if __name__ == "__main__":
    main()
