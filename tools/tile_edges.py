"""Dựng tile nền + viền tự nối cho Tilemap (art-director, Lô 1 — T-019).

AI chỉ gen texture lõi (1 ảnh = 4×4 ô 64 px). Script này:
  - thu texture về 256 px, rải lại búi cỏ (phá lưới đều), làm đất đã tưới từ đất đã cuốc;
  - vẽ lớp phủ viền trong suốt theo bitmask cạnh N=1 E=2 S=4 W=8 (ô chỉ số = mask, lưới 4×4):
      * `soft`  — mép mềm cỏ lấn vào đất (răng cưa búi cỏ + viền mực + vai đường nâu) + 4 ô góc lõm;
      * `ridge` — viền luống đất đã cuốc (mực + mép sáng trên + mặt đứng tối phía nam);
  - xuất bản `-ex.png` có đệm 1 px (margin 1, spacing 2) chống khe khi game co giãn.

Chạy:  .venv/Scripts/python tools/tile_edges.py lot1      (đường dẫn nguồn ghi trong LOT1 bên dưới)
"""
from __future__ import annotations

import argparse
import math
import random
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
T = 64           # px / ô trong game
SS = 4           # siêu lấy mẫu khi vẽ viền (vẽ 256 rồi thu về 64 để mép mịn)
INK = (0x2E, 0x21, 0x18)
SHOULDER = (0x7A, 0x4B, 0x2A)
DARK_SOIL = (0x5E, 0x3A, 0x21)
LIP = (0xB9, 0x85, 0x50)


# ----------------------------------------------------------------------------- tiện ích

def hex2rgb(h: str) -> tuple[int, int, int]:
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))  # type: ignore[return-value]


def load256(path: Path) -> Image.Image:
    return Image.open(path).convert('RGB').resize((256, 256), Image.LANCZOS)


def dilate(mask: np.ndarray, r: float) -> np.ndarray:
    """Nở mask theo đĩa bán kính r (px) — dịch mảng, không cần scipy."""
    out = mask.copy()
    ri = int(math.ceil(r))
    H, W = mask.shape
    for dy in range(-ri, ri + 1):
        for dx in range(-ri, ri + 1):
            if dx * dx + dy * dy > r * r or (dx == 0 and dy == 0):
                continue
            sy0, sy1 = max(0, -dy), min(H, H - dy)
            sx0, sx1 = max(0, -dx), min(W, W - dx)
            out[sy0 + dy:sy1 + dy, sx0 + dx:sx1 + dx] |= mask[sy0:sy1, sx0:sx1]
    return out


def to_tile(rgba_big: np.ndarray) -> Image.Image:
    """Ảnh RGBA siêu lấy mẫu (SS×) → ô 64 px, thu theo alpha nhân trước để mép không ám màu."""
    a = rgba_big.astype(np.float32) / 255.0
    rgb = a[:, :, :3] * a[:, :, 3:4]
    H, W = a.shape[:2]
    h, w = H // SS, W // SS
    rgb = rgb.reshape(h, SS, w, SS, 3).mean((1, 3))
    al = a[:, :, 3].reshape(h, SS, w, SS).mean((1, 3))
    with np.errstate(invalid='ignore', divide='ignore'):
        col = np.where(al[..., None] > 0, rgb / np.maximum(al[..., None], 1e-6), 0)
    out = np.dstack([col, al[..., None]])
    return Image.fromarray((np.clip(out, 0, 1) * 255 + 0.5).astype(np.uint8), 'RGBA')


def extrude(sheet: Image.Image, cols: int, rows: int) -> Image.Image:
    """Lưới ô 64 → bản có đệm 1 px quanh mỗi ô (margin 1, spacing 2) cho Phaser addTilesetImage."""
    sheet = sheet.convert('RGBA')
    W = 2 + cols * T + (cols - 1) * 2
    H = 2 + rows * T + (rows - 1) * 2
    out = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    for r in range(rows):
        for c in range(cols):
            tile = np.array(sheet.crop((c * T, r * T, c * T + T, r * T + T)))
            pad = np.pad(tile, ((1, 1), (1, 1), (0, 0)), mode='edge')
            x = 1 + c * (T + 2) - 1
            y = 1 + r * (T + 2) - 1
            out.paste(Image.fromarray(pad), (x, y))
    return out


def save_with_ex(img: Image.Image, path: Path, cols: int, rows: int) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path)
    extrude(img, cols, rows).save(path.with_name(path.stem + '-ex.png'))
    print('  ->', path.relative_to(ROOT), '(+ -ex)')


# ----------------------------------------------------------------------------- texture

def label(mask: np.ndarray) -> tuple[np.ndarray, int]:
    lab = np.zeros(mask.shape, np.int32)
    n = 0
    H, W = mask.shape
    for y0, x0 in zip(*np.nonzero(mask)):
        if lab[y0, x0]:
            continue
        n += 1
        lab[y0, x0] = n
        q = deque([(y0, x0)])
        while q:
            y, x = q.popleft()
            for yy, xx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
                if 0 <= yy < H and 0 <= xx < W and mask[yy, xx] and not lab[yy, xx]:
                    lab[yy, xx] = n
                    q.append((yy, xx))
    return lab, n


def scatter_tufts(src: Path, seed: int = 7) -> Image.Image:
    """Cỏ: nhặt từng búi trên nền phẳng rồi rải lại ngẫu nhiên (bỏ lưới đều 1 búi/ô).
    Búi không cắt qua ranh giới ô 64 → mép cỏ giáp đất nện không bị cắt nửa búi."""
    big = np.array(Image.open(src).convert('RGB')).astype(np.int16)  # 1024
    base = np.median(big.reshape(-1, 3), 0)
    diff = np.abs(big - base).sum(2) > 40
    mask = dilate(diff, 3)
    lab, n = label(mask)
    tufts = []
    for k in range(1, n + 1):
        ys, xs = np.nonzero(lab == k)
        if len(ys) < 40:
            continue
        y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
        m = (lab[y0:y1, x0:x1] == k)
        tufts.append((big[y0:y1, x0:x1].copy(), m))
    rng = random.Random(seed)
    S = 1024
    cell = S // 4  # = 1 ô
    out = np.empty_like(big)
    out[:] = base.astype(np.int16)
    placed: list[tuple[float, float]] = []
    order = tufts * 2  # nhân đôi số búi một chút cho đỡ trống (ảnh gốc ~ 12 búi lớn + búi nhỏ)
    rng.shuffle(order)
    count = 0
    for patch, m in order:
        h, w = m.shape
        for _ in range(200):
            x = rng.randrange(0, S - w)
            y = rng.randrange(0, S - h)
            # không cắt ranh giới ô (cách mép ô >= 10 px ở ảnh 1024)
            if (x % cell) < 10 or ((x + w) % cell) < (x % cell) or (x % cell) + w > cell - 10:
                continue
            if (y % cell) < 10 or (y % cell) + h > cell - 10:
                continue
            cx, cy = x + w / 2, y + h / 2
            if all((cx - px) ** 2 + (cy - py) ** 2 > 150 ** 2 for px, py in placed):
                region = out[y:y + h, x:x + w]
                region[m] = patch[m]
                placed.append((cx, cy))
                count += 1
                break
        if count >= 26:
            break
    print(f'  cỏ: {len(tufts)} búi gốc → rải {count} búi')
    return Image.fromarray(out.astype(np.uint8)).resize((256, 256), Image.LANCZOS)


def make_watered(tilled: Image.Image, seed: int = 3) -> Image.Image:
    """Đất đã tưới = đất đã cuốc sẫm lại (nền #7A4B2A → #553522) + vài đốm nước, đặt vòng (seamless)."""
    a = np.array(tilled.convert('RGB')).astype(np.float32)
    k = np.array([0x55 / 0x7A, 0x35 / 0x4B, 0x22 / 0x2A], np.float32)
    lum = a.mean(2, keepdims=True)
    # mực (rất tối) giữ nguyên, phần còn lại nhân hệ số
    w = np.clip((lum - 45) / 30, 0, 1)
    out = a * (1 - w) + a * k * w
    img = Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).convert('RGBA')
    # đốm nước: elip xanh nước viền mực mảnh + chấm trắng điệp, vẽ ở 4× rồi thu
    rng = random.Random(seed)
    big = np.zeros((256 * SS, 256 * SS, 4), np.uint8)
    yy, xx = np.mgrid[0:256 * SS, 0:256 * SS]
    cells = rng.sample(range(16), 7)  # mỗi đốm nằm gọn trong một ô (ô tưới cạnh ô chưa tưới không bị cắt nửa đốm)
    for ci in cells:
        cx = (ci % 4) * 64 + rng.uniform(14, 50)
        cy = (ci // 4) * 64 + rng.uniform(10, 54)
        rx, ry = rng.uniform(4, 7), rng.uniform(1.8, 2.8)
        for ox in (-256, 0, 256):
            for oy in (-256, 0, 256):
                X, Y = (cx + ox) * SS, (cy + oy) * SS
                d = ((xx - X) / (rx * SS)) ** 2 + ((yy - Y) / (ry * SS)) ** 2
                ring = (d <= (1 + 2.2 / ry) ** 2) & (d > 1)
                big[ring] = (*INK, 200)
                big[d <= 1] = (*hex2rgb('#6E9FA6'), 255)
                dot = ((xx - (X - rx * SS * 0.4)) ** 2 + (yy - (Y - ry * SS * 0.3)) ** 2) <= (1.1 * SS) ** 2
                big[dot] = (*hex2rgb('#EFE4C8'), 255)
    ov = to_tile(big)  # 256
    img.alpha_composite(ov)
    return img.convert('RGB')


# ----------------------------------------------------------------------------- viền

def _profile(n: int, k: int, amp: float, phase: float) -> np.ndarray:
    """Độ sâu lượn sóng dọc cạnh, = 0 và phẳng ở hai đầu ô (để nối liền với ô bên cạnh)."""
    t = np.arange(n) / n
    env = np.sin(np.pi * t) ** 2
    return amp * env * np.sin(2 * np.pi * k * t + phase)


def soft_edge_tile(mask_bits: int, corner: int | None = None, seed: int = 0,
                   grass=(151, 177, 72), depth=7.0, shoulder=6.0) -> Image.Image:
    """Một ô phủ mép mềm. mask_bits: cạnh giáp cỏ (N1 E2 S4 W8). corner: 0 NW 1 NE 2 SW 3 SE (ô góc lõm)."""
    P = T * SS  # 256
    PAD = 24 * SS
    N = P + 2 * PAD
    g = np.zeros((N, N), bool)
    yy, xx = np.mgrid[0:N, 0:N]
    lx, ly = xx - PAD, yy - PAD  # tọa độ trong ô (px siêu lấy mẫu)
    d0 = depth * SS
    rng = random.Random(1000 + seed * 31 + mask_bits)
    sides = {1: 'N', 2: 'E', 4: 'S', 8: 'W'}
    for bit, side in sides.items():
        if not mask_bits & bit:
            continue
        prof = _profile(P, rng.choice((2, 3)), 2.2 * SS, rng.uniform(0, 6.28))
        full = np.full(N, d0)
        full[PAD:PAD + P] = d0 + prof
        if side == 'N':
            g |= ly < full[xx]
        elif side == 'S':
            g |= (P - ly) <= full[xx]
        elif side == 'W':
            g |= lx < full[yy]
        else:
            g |= (P - lx) <= full[yy]
        # búi cỏ lấn ra (răng cưa): tam giác nhỏ dọc mép, chỉ ở khúc giữa ô
        for _ in range(rng.randint(3, 5)):
            t = rng.uniform(0.12, 0.88) * P
            L = rng.uniform(3.0, 6.0) * SS
            w = rng.uniform(2.0, 3.2) * SS
            lean = rng.uniform(-1.5, 1.5) * SS
            base_d = d0 + prof[int(t)] - 1 * SS
            # tam giác: đáy rộng w ở độ sâu base_d, đỉnh ở base_d + L (lệch lean)
            if side in ('N', 'S'):
                u, v = lx, (ly if side == 'N' else P - ly)
            else:
                u, v = ly, (lx if side == 'W' else P - lx)
            frac = (v - base_d) / L
            inside = (frac >= 0) & (frac <= 1) & (np.abs(u - (t + lean * frac)) <= (w / 2) * (1 - frac))
            g |= inside
    # bo góc trong cho góc lồi (hai cạnh kề cùng giáp cỏ)
    r = 9 * SS
    for a, b, cx, cy in ((1, 8, 0, 0), (1, 2, P, 0), (4, 8, 0, P), (4, 2, P, P)):
        if mask_bits & a and mask_bits & b:
            ccx = cx + (d0 + r if cx == 0 else -(d0 + r))
            ccy = cy + (d0 + r if cy == 0 else -(d0 + r))
            inbox = (np.abs(lx - cx) <= d0 + r) & (np.abs(ly - cy) <= d0 + r)
            g |= inbox & (((lx - ccx) ** 2 + (ly - ccy) ** 2) > r * r)
    if corner is not None:
        cx, cy = ((0, 0), (P, 0), (0, P), (P, P))[corner]
        g |= ((lx - cx) ** 2 + (ly - cy) ** 2) <= (d0 + 1.0 * SS) ** 2
    # vùng ngoài ô theo hướng có cỏ: coi là cỏ (để vai đường nở đúng tới mép ô)
    outside = (lx < 0) | (lx >= P) | (ly < 0) | (ly >= P)
    if mask_bits & 1:
        g |= outside & (ly < 0)
    if mask_bits & 4:
        g |= outside & (ly >= P)
    if mask_bits & 8:
        g |= outside & (lx < 0)
    if mask_bits & 2:
        g |= outside & (lx >= P)
    sh = dilate(g, shoulder * SS) & ~g
    ink = g & dilate(sh, 2.2 * SS)  # dải mực ~2 px ở mép cỏ (phía trong cỏ, giáp vai đường)
    img = np.zeros((N, N, 4), np.uint8)
    img[sh] = (*SHOULDER, 255)
    img[g] = (*grass, 255)
    img[ink] = (*INK, 255)
    tile = img[PAD:PAD + P, PAD:PAD + P]
    return to_tile(tile)


def soft_edge_sets(grass_rgb) -> tuple[Image.Image, Image.Image]:
    sheet = Image.new('RGBA', (T * 4, T * 4), (0, 0, 0, 0))
    for m in range(16):
        if m:
            sheet.paste(soft_edge_tile(m, grass=grass_rgb), ((m % 4) * T, (m // 4) * T))
    corners = Image.new('RGBA', (T * 2, T * 2), (0, 0, 0, 0))
    for c in range(4):
        corners.paste(soft_edge_tile(0, corner=c, grass=grass_rgb), ((c % 2) * T, (c // 2) * T))
    return sheet, corners


def ridge_edge_tile(mask_bits: int, fill_rgb, seed: int = 0) -> Image.Image:
    """Viền luống đất đã cuốc: cạnh nào giáp ô KHÔNG phải đất cuốc thì có viền mực;
    bắc: mép sáng; nam: mặt đứng tối (nhìn 3/4); góc lồi bo tròn, phần ngoài góc tô màu đất khô."""
    P = T * SS
    yy, xx = np.mgrid[0:P, 0:P]
    rng = random.Random(77 + mask_bits + seed)
    img = np.zeros((P, P, 4), np.uint8)
    lw = 2.6 * SS            # nét mực
    face = 6 * SS            # mặt đứng phía nam
    m_in = 1.0 * SS          # lề ngoài nét
    wob = {}
    for bit in (1, 2, 4, 8):
        wob[bit] = _profile(P, rng.choice((1, 2)), 1.0 * SS, rng.uniform(0, 6.28))
    # khoảng cách tới từng cạnh có viền (lượn nhẹ)
    dN = yy - wob[1][xx] if mask_bits & 1 else np.full((P, P), 1e9)
    dS = (P - 1 - yy) - wob[4][xx] if mask_bits & 4 else np.full((P, P), 1e9)
    dW = xx - wob[8][yy] if mask_bits & 8 else np.full((P, P), 1e9)
    dE = (P - 1 - xx) - wob[2][yy] if mask_bits & 2 else np.full((P, P), 1e9)
    # bo góc lồi: thay khoảng cách bằng khoảng cách tới cung tròn
    R = 10 * SS
    for a, b, cx, cy in ((1, 8, 0, 0), (1, 2, P - 1, 0), (4, 8, 0, P - 1), (4, 2, P - 1, P - 1)):
        if mask_bits & a and mask_bits & b:
            ccx = cx + (R if cx == 0 else -R)
            ccy = cy + (R if cy == 0 else -R)
            region = (np.abs(xx - cx) < R) & (np.abs(yy - cy) < R)
            dist = R - np.sqrt((xx - ccx) ** 2 + (yy - ccy) ** 2)
            if a == 1:
                dN = np.where(region, np.minimum(dN, dist), dN)
            else:
                dS = np.where(region, np.minimum(dS, dist), dS)
    dmin = np.minimum(np.minimum(dN, dS), np.minimum(dW, dE))
    outside = dmin < m_in
    img[outside] = (*fill_rgb, 255)
    # mặt đứng phía nam: từ nét trên của mặt đứng tới nét đáy
    if mask_bits & 4:
        facem = (dS >= m_in) & (dS < m_in + lw + face)
        img[facem] = (*DARK_SOIL, 255)
        topline = (dS >= m_in + face) & (dS < m_in + face + lw * 0.8)
        img[topline] = (*INK, 255)
    # mép sáng phía bắc + nhẹ phía tây
    if mask_bits & 1:
        img[(dN >= m_in + lw) & (dN < m_in + lw + 2.5 * SS) & (dS >= m_in + face + lw)] = (*LIP, 255)
    if mask_bits & 8:
        img[(dW >= m_in + lw) & (dW < m_in + lw + 1.5 * SS) & (dN >= m_in + lw) & (dS >= m_in + face + lw)] = (*LIP, 210)
    if mask_bits & 2:
        img[(dE >= m_in + lw) & (dE < m_in + lw + 2.0 * SS) & (dN >= m_in + lw)] = (*DARK_SOIL, 255)
    line = (dmin >= m_in) & (dmin < m_in + lw)
    img[line] = (*INK, 255)
    return to_tile(img)


def ridge_edge_set(fill_rgb) -> Image.Image:
    sheet = Image.new('RGBA', (T * 4, T * 4), (0, 0, 0, 0))
    for m in range(16):
        if m:
            sheet.paste(ridge_edge_tile(m, fill_rgb), ((m % 4) * T, (m // 4) * T))
    return sheet


# ----------------------------------------------------------------------------- Lô 1

RAW = ROOT / 'art-source/raw/lot1'
TILES = ROOT / 'web/client/public/assets/art/tiles'
LOT1 = {
    'grass': RAW / 'til-grass/til-grass_20261014-101241_2.png',
    'path': RAW / 'til-path/til-path_20261014-101307_1.png',
    'yard': RAW / 'til-yard/til-yard_20261014-101332_2.png',
    'soil-dry': RAW / 'til-soil-dry/til-soil-dry_20261014-101444_2.png',
    'soil-till-1': RAW / 'til-soil-till1/til-soil-till1_20261014-101510_2.png',
    'soil-till-2': RAW / 'til-soil-till2/til-soil-till2-v3_20261014-101756_1.png',
    'soil-tilled': RAW / 'til-soil-tilled/til-soil-tilled_20261014-101713_1.png',
}


def build_lot1() -> None:
    print('Texture lõi (256 = 4×4 ô):')
    grass = scatter_tufts(LOT1['grass'])
    save_with_ex(grass, TILES / 'grass.png', 4, 4)
    for name in ('path', 'yard', 'soil-dry', 'soil-till-1', 'soil-till-2', 'soil-tilled'):
        save_with_ex(load256(LOT1[name]), TILES / f'{name}.png', 4, 4)
    tilled = load256(LOT1['soil-tilled'])
    save_with_ex(make_watered(tilled), TILES / 'soil-watered.png', 4, 4)
    g = np.array(grass).reshape(-1, 3)
    grass_rgb = tuple(int(v) for v in np.median(g, 0))
    dry = np.array(load256(LOT1['soil-dry'])).reshape(-1, 3)
    dry_rgb = tuple(int(v) for v in np.median(dry, 0))
    print('Viền (cỏ', grass_rgb, '· đất khô', dry_rgb, '):')
    edge, corner = soft_edge_sets(grass_rgb)
    save_with_ex(edge, TILES / 'path-edge.png', 4, 4)
    save_with_ex(corner, TILES / 'path-corner.png', 2, 2)
    save_with_ex(ridge_edge_set(dry_rgb), TILES / 'soil-tilled-edge.png', 4, 4)


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('cmd', choices=['lot1'])
    args = ap.parse_args()
    if args.cmd == 'lot1':
        build_lot1()


if __name__ == '__main__':
    main()
