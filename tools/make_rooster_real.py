"""T-025 vòng 3: 6 kiểu gà gáy "lầy" từ bản ghi gà trống THẬT (public domain), chỉ bằng numpy.

Nguồn (xem docs/audio/credits.md):
  Medium rooster crowing — alys, pdsounds.org #539, Public domain — qua Wikimedia Commons
  https://commons.wikimedia.org/wiki/File:Medium_rooster_crowing.ogg
Tải về + giải mã sẵn: audio-source/raw/T-025/rooster_real/Medium_rooster_crowing.wav (mono 44.1 kHz).

Cấu trúc tiếng gáy trong bản ghi (đo bằng dò cao độ 40 ms): 2.88 s "ò" · 3.06 "ó" · 3.34 "o" · 3.82–4.92 "oooo" dài
(~790 Hz tụt về ~525 Hz) · 4.96–5.36 hai tiếng đuôi. Trước 2.8 s là gà mái cục tác (lấy làm tiếng "khục" ho).

Chạy:  .venv/Scripts/python tools/make_rooster_real.py   -> audio-source/raw/T-025/rooster_real/out/ga-gay-<kiểu>.wav
Rồi chuẩn hóa To A −13 và chép vào web/client/public/assets/audio/sfx/ (xem prompt card AUD-LO1-SFX).
"""
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import ROOT, read_wav, write_wav  # noqa: E402
from gen_folk_sfx import fft_filter, reverb  # noqa: E402

SRC = ROOT / "audio-source" / "raw" / "T-025" / "rooster_real"
OUT = SRC / "out"
SR = 44100


def load():
    s, sr = read_wav(SRC / "Medium_rooster_crowing.wav")
    assert sr == SR
    x = s[:, 0].astype(np.float64)
    return fft_filter(x, lo=180)  # bỏ ù gió / tiếng trầm nền


def seg(x, a, b, fin=0.008, fout=0.02):
    y = x[int(a * SR): int(b * SR)].copy()
    i, o = int(fin * SR), int(fout * SR)
    if i:
        y[:i] *= np.linspace(0, 1, i)
    if o:
        y[-o:] *= np.linspace(1, 0, o)
    return y


def varispeed(x, rate):
    """Phát lại với tốc độ thay đổi theo thời gian (rate: số hoặc mảng theo mẫu ĐẦU RA, có thể là hàm).
    rate > 1 = cao + nhanh hơn, < 1 = trầm + chậm hơn (như băng cassette)."""
    if np.max(np.atleast_1d(rate)) > 1.05:
        x = fft_filter(x, hi=SR / 2 / np.max(rate) * 0.9, order=4)  # chống aliasing
    pos, out = 0.0, []
    if np.isscalar(rate):
        idx = np.arange(0, len(x) - 1, rate)
        return np.interp(idx, np.arange(len(x)), x)
    r = np.asarray(rate)
    idx = np.cumsum(np.concatenate([[0], r[:-1]]))
    idx = idx[idx < len(x) - 1]
    return np.interp(idx, np.arange(len(x)), x)


def rate_curve(n_out, pts):
    """Đường tốc độ nội suy theo các điểm (giây đầu ra, rate)."""
    t = np.arange(n_out) / SR
    a, b = zip(*pts)
    return np.interp(t, a, b)


def wsola(x, stretch, frame=0.04, tol=0.012):
    """Kéo dài thời gian giữ nguyên cao độ (WSOLA): khung Hann chồng 50%, tìm độ lệch khớp nhất trong ±tol."""
    N = int(frame * SR)
    H = N // 2
    T = int(tol * SR)
    win = np.hanning(N)
    n_out = int(len(x) * stretch)
    out = np.zeros(n_out + N)
    norm = np.zeros(n_out + N)
    prev = None
    for k, o in enumerate(range(0, n_out - N, H)):
        c = int(o / stretch)
        if prev is None:
            best = c
        else:
            target = x[prev + H: prev + H + N]
            lo, hi = max(0, c - T), min(len(x) - N - 1, c + T)
            if hi <= lo or len(target) < N:
                best = min(max(c, 0), len(x) - N - 1)
            else:
                cands = np.lib.stride_tricks.sliding_window_view(x[lo: hi + N], N)
                best = lo + int(np.argmax(cands @ target))
        if best + N > len(x):
            break
        out[o: o + N] += x[best: best + N] * win
        norm[o: o + N] += win
        prev = best
    return out[:n_out] / np.maximum(norm[:n_out], 1e-3)


def place(buf, y, at):
    i = int(at * SR)
    e = min(len(buf), i + len(y))
    buf[i:e] += y[: e - i]


def soft(x, drive):
    m = np.abs(x).max() + 1e-9
    return np.tanh(drive * x / m) / np.tanh(drive) * m


def crush(x, keep=11025):
    """Bitcrush nhẹ: giữ mẫu (sample-and-hold) về `keep` Hz + lượng tử 7 bit, trộn mỏng."""
    step = SR / keep
    idx = (np.floor(np.arange(len(x)) / step) * step).astype(int)
    y = x[idx]
    q = 2 ** 6
    m = np.abs(y).max() + 1e-9
    return np.round(y / m * q) / q * m


def gasp(rng, x):
    """'Ặc': một lát 70 ms của tiếng gáy, bóp cao độ tụt gấp + bão hòa, đóng họng cụt."""
    s = seg(x, 4.10, 4.19, 0.003, 0.004)
    y = varispeed(s, rate_curve(int(len(s) / 0.8), [(0, 1.15), (0.08, 0.55)]))
    y = soft(y, 4.0)[: int(0.075 * SR)]
    y[-int(0.004 * SR):] *= np.linspace(1, 0, int(0.004 * SR))
    click = fft_filter(rng.standard_normal(int(0.004 * SR)), lo=900, hi=5000) * np.exp(-np.arange(int(0.004 * SR)) / 40)
    out = np.zeros(len(y) + len(click))
    out[: len(y)] += y
    out[len(y) - 10: len(y) - 10 + len(click)] += click * np.abs(y).max() * 0.6
    return out


def cough(x, which=0, gain=1.0):
    """'Khục': tiếng gà mái cục tác trong cùng bản ghi (trước tiếng gáy), hạ cao độ + bão hòa cho ra tiếng ho."""
    spots = [(0.13, 0.25), (0.62, 0.74), (1.43, 1.55)]
    a, b = spots[which % len(spots)]
    s = seg(x, a, b, 0.003, 0.03)
    y = soft(varispeed(s, 0.78), 3.0)
    return y / (np.abs(y).max() + 1e-9) * gain


def crow_full(x):
    return seg(x, 2.86, 5.40, 0.01, 0.08)


def main():
    rng = np.random.default_rng(1)
    x = load()
    pk = np.abs(crow_full(x)).max()
    OUT.mkdir(parents=True, exist_ok=True)
    res = {}

    # 1) bình thường: cả câu gáy, cắt gọn
    res["binh-thuong"] = crow_full(x)

    # 2) tắc họng: gáy tới giữa tiếng dài (đang lên cao) thì tắt cụt -> 'ặc' -> im -> ho khục khục nhỏ dần
    b = np.zeros(int(2.3 * SR))
    place(b, seg(x, 2.86, 4.22, 0.01, 0.006), 0)
    t0 = 4.22 - 2.86
    g = gasp(rng, x)
    place(b, g / np.abs(g).max() * pk * 0.85, t0 + 0.14)
    for k, (at, gn) in enumerate(((0.48, 0.55), (0.72, 0.45), (0.92, 0.3))):
        place(b, cough(x, k, pk * gn), t0 + at)
    res["tac-hong"] = b

    # 3) khàn cổ: hạ ~3 nửa cung rồi tụt dần ở tiếng dài, rè (nhiễu điều biên + bão hòa + bitcrush mỏng),
    #    hai chỗ đứt hơi, kết bằng hơi 'khè'
    c = seg(x, 2.86, 5.0, 0.01, 0.06)
    n_out = int(len(c) / 0.8)
    y = varispeed(c, rate_curve(n_out, [(0, 0.86), (1.2, 0.84), (1.9, 0.74), (2.7, 0.66)]))
    rough = fft_filter(rng.standard_normal(len(y)), lo=20, hi=90)
    rough /= np.abs(rough).max()
    y = y * (1 + 0.55 * rough)
    y = 0.75 * soft(y, 3.5) + 0.25 * crush(y)
    breath = fft_filter(rng.standard_normal(len(y)), lo=1500, hi=6000)
    env = np.abs(fft_filter(np.abs(y), hi=30))
    y = y + 0.35 * breath / np.abs(breath).max() * env / (env.max() + 1e-9) * np.abs(y).max()
    t = np.arange(len(y)) / SR
    for at in (1.38, 1.86):  # đứt hơi
        y *= 1 - 0.88 * np.exp(-0.5 * ((t - at) / 0.025) ** 2)
    tail_n = int(0.35 * SR)
    khe = fft_filter(rng.standard_normal(tail_n), lo=900, hi=4500) * np.exp(-np.arange(tail_n) / (0.09 * SR))
    khe *= np.minimum(1, np.arange(tail_n) / (0.03 * SR))
    y = np.concatenate([y, np.zeros(tail_n)])
    place(y, khe * np.abs(y).max() * 0.35, len(y) / SR - tail_n / SR - 0.05)
    res["khan"] = y

    # 4) vỡ giọng: tiếng dài đang gáy bỗng vọt lên ~quãng tám (the thé, rung nhanh) rồi rơi phịch xuống thấp
    pre = seg(x, 2.86, 3.92, 0.01, 0.0)
    lng = seg(x, 3.92, 5.0, 0.0, 0.06)
    n_out = int(len(lng) / 0.95)
    tt_ = np.arange(n_out) / SR
    r = rate_curve(n_out, [(0, 1.0), (0.07, 1.0), (0.085, 1.85), (0.38, 1.95), (0.395, 0.82), (0.8, 0.72)])
    r *= 1 + 0.035 * np.sin(2 * np.pi * 9 * tt_) * ((tt_ > 0.085) & (tt_ < 0.395))
    v = varispeed(lng, r)
    res["vo-giong"] = np.concatenate([pre, v])

    # 5) ngái ngủ: chậm rì + trầm (băng chạy chậm), dài thêm bằng WSOLA, tiếng dài tụt như ngáp, nhỏ dần
    c = seg(x, 2.86, 5.0, 0.03, 0.1)
    c = wsola(c, 1.18)
    n_out = int(len(c) / 0.7)
    y = varispeed(c, rate_curve(n_out, [(0, 0.86), (1.6, 0.84), (2.4, 0.7), (3.2, 0.55)]))
    t = np.arange(len(y)) / SR
    y *= np.clip(0.55 + t / 1.2, 0, 1) * np.clip(1 - (t - (len(y) / SR - 0.9)) / 0.9, 0, 1) ** 0.7
    res["ngai-ngu"] = y

    # 6) gáy lại: "ò ó—ặc", ho 1 tiếng, lấy hơi, rồi gáy lại đủ câu (nhanh hơn chút)
    d = np.zeros(int(3.0 * SR))
    place(d, seg(x, 2.86, 3.27, 0.01, 0.005), 0)
    place(d, gasp(rng, x) / np.abs(gasp(rng, x)).max() * pk * 0.7, 0.44)
    place(d, cough(x, 1, pk * 0.4), 0.62)
    full = varispeed(seg(x, 2.86, 5.0, 0.01, 0.08), 1.06)
    place(d, full, 0.98)
    res["gay-lai"] = d[: int((0.98 + len(full) / SR + 0.05) * SR)]

    for k, y in res.items():
        y = reverb(y, rt=0.5, mix=0.08, tone=6000, rng=np.random.default_rng(7))  # vang sân nhẹ, đồng nhất 6 bản
        write_wav(OUT / f"ga-gay-{k}.wav", y / (np.abs(y).max() + 1e-9) * 0.89, SR)
        print(f"ga-gay-{k}: {len(y) / SR:.2f}s")


if __name__ == "__main__":
    main()
