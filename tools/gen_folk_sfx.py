"""Tổng hợp SFX "nhạc cụ dân tộc / tiếng động làng quê" bằng mô hình modal + additive (miễn phí, offline).

gen_sfx.py chỉ có 1 dao động kiểu chip nên không ra được trống, mõ, chiêng, chũm chọe, tiếng người.
Script này ghép nhiều lớp: mặt trống (modal, tụt pitch), gỗ rỗng (mõ), đĩa kim loại (xu, chũm chọe, chiêng),
bọt nước, giọng càu nhàu (formant), sáo / kèn bầu / đàn bầu xấp xỉ (additive). Mọi thứ tái tạo được bằng --seed.

Ví dụ:
  python tools/gen_folk_sfx.py --list
  python tools/gen_folk_sfx.py --recipe hoe --variants 2 --seed 1 --out audio-source/raw/sound-test/sfx --prefix sfx-cuoc-dat
  python tools/gen_folk_sfx.py --recipe all --seed 1 --out audio-source/raw/sound-test/sfx

Giới hạn (nói thẳng): trống / mõ / xu / chũm chọe / chiêng tổng hợp nghe khá gần thật;
sáo, kèn bầu, đàn bầu, giọng người chỉ là xấp xỉ, có thể nghe "điện tử". Xem audio bible / directions.md.
"""
import argparse
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import ROOT, rel, write_wav  # noqa: E402

SR = 44100


# ---------- tiện ích ----------
def tt(dur):
    return np.arange(int(SR * dur)) / SR


def place(buf, x, at):
    i = int(SR * at)
    end = min(len(buf), i + len(x))
    buf[i:end] += x[: end - i]
    return buf


def fft_filter(x, lo=None, hi=None, order=2):
    n = len(x)
    pad = 1 << int(np.ceil(np.log2(n + SR // 10)))
    X = np.fft.rfft(x, pad)
    f = np.fft.rfftfreq(pad, 1 / SR)
    H = np.ones_like(f)
    if hi:
        H /= np.sqrt(1 + (f / hi) ** (2 * order))
    if lo:
        H /= np.sqrt(1 + (lo / np.maximum(f, 1e-3)) ** (2 * order))
    return np.fft.irfft(X * H, pad)[:n]


def reverb(x, rt=0.8, mix=0.25, tone=4000, rng=None, predelay=0.012):
    rng = rng or np.random.default_rng(0)
    t = tt(rt * 1.5)
    ir = rng.standard_normal(len(t)) * np.exp(-6.9 * t / rt)
    ir = fft_filter(ir, lo=150, hi=tone)
    ir = np.concatenate([np.zeros(int(SR * predelay)), ir])
    ir /= np.sqrt(np.sum(ir ** 2)) + 1e-9
    n = len(x) + len(ir)
    pad = 1 << int(np.ceil(np.log2(n)))
    wet = np.fft.irfft(np.fft.rfft(x, pad) * np.fft.rfft(ir, pad), pad)[:n]
    dry = np.concatenate([x, np.zeros(len(ir))])
    wet *= np.abs(x).max() / (np.abs(wet).max() + 1e-9)
    return (1 - mix) * dry + mix * wet


def noise(dur, rng):
    return rng.standard_normal(int(SR * dur))


def modal(f0, ratios, amps, decays, dur, rng, bend=0.0, bend_tau=0.04, glide=0.0):
    """Tổng các mode sin tắt dần. bend: tụt pitch lúc đánh (mặt trống). glide: trượt pitch cả nốt (tỉ lệ)."""
    t = tt(dur)
    out = np.zeros_like(t)
    for r, a, d in zip(ratios, amps, decays):
        f = f0 * r * (1 + bend * np.exp(-t / bend_tau)) * (1 + glide * (1 - np.exp(-t / 0.25)))
        ph = 2 * np.pi * np.cumsum(f) / SR + rng.uniform(0, 2 * np.pi)
        out += a * np.sin(ph) * np.exp(-t / d)
    return out


def finish(x, peak_db=-1.0, tail_db=-60):
    x = np.asarray(x, dtype=np.float64)
    x -= np.mean(x)
    pk = np.abs(x).max() + 1e-12
    x = x / pk
    # cắt đuôi lặng
    env = np.abs(x)
    above = np.where(env > 10 ** (tail_db / 20))[0]
    if len(above):
        x = x[: min(len(x), above[-1] + int(SR * 0.02))]
    f_in, f_out = int(SR * 0.002), int(SR * 0.015)
    x[:f_in] *= np.linspace(0, 1, f_in)
    x[-f_out:] *= np.linspace(1, 0, f_out)
    return x / (np.abs(x).max() + 1e-12) * 10 ** (peak_db / 20)


# ---------- nhạc cụ / nguồn âm ----------
def big_drum(rng, f0=72, dur=1.2, decay=0.45, hit=1.0):
    """Trống cái / trống chầu: mặt da lớn, tụt pitch, thân âm trầm."""
    ratios = [1, 1.59, 2.14, 2.30, 2.65, 2.92]
    amps = [1, 0.45, 0.3, 0.22, 0.12, 0.08]
    decs = [decay, decay * 0.5, decay * 0.35, decay * 0.3, decay * 0.2, decay * 0.15]
    body = modal(f0, ratios, amps, decs, dur, rng, bend=0.35, bend_tau=0.035)
    # bão hòa nhẹ -> sinh bồi âm 200–800 Hz để loa laptop vẫn nghe được tiếng trống trầm
    body = np.tanh(3.0 * body / (np.abs(body).max() + 1e-9)) / np.tanh(3.0)
    skin = modal(f0 * 4.1, [1, 1.37, 1.83, 2.6], [1, 0.7, 0.5, 0.3], [0.06, 0.04, 0.03, 0.02], dur, rng) * 0.25
    stick = fft_filter(noise(0.05, rng), lo=250, hi=4000) * np.exp(-tt(0.05) / 0.01) * 1.0 * hit
    out = body + skin
    place(out, stick, 0)
    # nhấn dải giữa (+ cắt hạ âm < 50 Hz) để loa laptop vẫn nghe ra "tùng"
    return fft_filter(out, lo=50) + 1.5 * fft_filter(out, lo=250, hi=2500)


def barrel_drum(rng, f0=190, dur=0.5):
    """Trống cơm / trống con: nhỏ, cao, có cao độ rõ, ngắn."""
    body = modal(f0, [1, 1.5, 1.98, 2.44], [1, 0.35, 0.2, 0.1], [0.16, 0.07, 0.05, 0.04], dur, rng,
                 bend=0.12, bend_tau=0.02)
    slap = fft_filter(noise(0.02, rng), lo=800, hi=6000) * np.exp(-tt(0.02) / 0.004) * 0.35
    return place(body, slap, 0)


def wood_block(rng, f0=880, dur=0.25):
    """Mõ gỗ: rỗng, khô, 'cốc'."""
    body = modal(f0, [1, 2.57, 4.1, 5.9], [1, 0.4, 0.15, 0.06], [0.045, 0.02, 0.012, 0.008], dur, rng)
    click = fft_filter(noise(0.006, rng), lo=1500, hi=8000) * np.exp(-tt(0.006) / 0.0015) * 0.5
    return place(body, click, 0)


def coin(rng, f0=2300, dur=0.6):
    """Đồng xu chạm nhau: kim loại mỏng, partial không điều hòa."""
    ratios = [1, 1.72, 2.36, 3.58, 4.47, 5.9]
    amps = [1, 0.7, 0.5, 0.35, 0.2, 0.12]
    decs = [0.32, 0.22, 0.16, 0.1, 0.07, 0.05]
    body = modal(f0, ratios, amps, decs, dur, rng)
    tick = fft_filter(noise(0.004, rng), lo=4000) * 0.4
    return place(body, tick, 0)


def cymbals(rng, dur=1.4, low=900, high=11000, n=70, decay=0.7):
    """Chũm chọe / não bạt: rất nhiều partial kim loại + nhiễu sáng."""
    t = tt(dur)
    out = np.zeros_like(t)
    freqs = np.exp(rng.uniform(np.log(low), np.log(high), n))
    for f in freqs:
        d = decay * rng.uniform(0.4, 1.3) * (1500 / f) ** 0.25
        out += rng.uniform(0.3, 1) * np.sin(2 * np.pi * f * t + rng.uniform(0, 6.28)) * np.exp(-t / d)
    out /= np.abs(out).max()
    hiss = fft_filter(noise(dur, rng), lo=2500, hi=12000) * np.exp(-t / (decay * 0.6))
    hiss /= np.abs(hiss).max()
    crash = fft_filter(noise(0.05, rng), lo=1500) * np.exp(-tt(0.05) / 0.01)
    out = 0.6 * out + 0.5 * hiss
    return place(out, crash * 0.8, 0)


def gong(rng, f0=210, dur=2.0, glide=-0.03):
    """Chiêng / thanh la trầm: 'oàng' ngân, hơi trượt pitch."""
    ratios = [1, 1.48, 2.02, 2.47, 3.13, 4.21]
    amps = [1, 0.6, 0.45, 0.3, 0.2, 0.12]
    decs = [1.1, 0.8, 0.6, 0.45, 0.3, 0.2]
    body = modal(f0, ratios, amps, decs, dur, rng, glide=glide)
    # 'nở' tiếng sau khi đánh (chiêng to dần nhẹ ở 50 ms đầu)
    t = tt(dur)
    swell = 1 - 0.5 * np.exp(-t / 0.05)
    mallet = fft_filter(noise(0.03, rng), lo=100, hi=1500) * np.exp(-tt(0.03) / 0.008) * 0.4
    return place(body * swell, mallet, 0)


def harmonic_tone(rng, f_curve, amp_env, harm_amps, breath=0.0, breath_band=(800, 6000)):
    """Âm điều hòa với đường pitch tùy ý (sáo, kèn, đàn bầu)."""
    n = len(f_curve)
    ph = 2 * np.pi * np.cumsum(f_curve) / SR
    out = np.zeros(n)
    for k, a in enumerate(harm_amps, 1):
        lim = (k * f_curve < SR / 2 - 1000).astype(float)
        out += a * np.sin(k * ph) * lim
    out *= amp_env
    if breath:
        b = fft_filter(rng.standard_normal(n), lo=breath_band[0], hi=breath_band[1]) * amp_env
        out += breath * b / (np.abs(b).max() + 1e-9) * np.abs(out).max()
    return out


def note_env(n, attack=0.02, release=0.04):
    e = np.ones(n)
    a, r = int(SR * attack), int(SR * release)
    e[:a] = np.linspace(0, 1, a)
    e[-r:] = np.linspace(1, 0, r)
    return e


def melody(rng, notes, instrument="sao", vib_last=True):
    """notes: [(freq, dur), …]. sáo: luyến từ dưới lên mỗi nốt; kèn: mũi, nhiều bồi âm."""
    total = sum(d for _, d in notes)
    n = int(SR * total)
    f = np.zeros(n)
    env = np.zeros(n)
    i = 0
    for j, (fr, d) in enumerate(notes):
        m = int(SR * d)
        t = np.arange(m) / SR
        scoop = 1 - 0.06 * np.exp(-t / 0.018)  # vuốt nốt từ dưới lên kiểu sáo
        vib = 1.0
        if vib_last and j == len(notes) - 1:
            vib = 1 + 0.012 * np.sin(2 * np.pi * 5.5 * t) * np.clip(t / 0.15, 0, 1)
        f[i:i + m] = fr * scoop * vib
        env[i:i + m] = note_env(m, 0.012, 0.03 if j < len(notes) - 1 else 0.12)
        i += m
    if instrument == "sao":
        return harmonic_tone(rng, f, env, [1, 0.25, 0.1, 0.04], breath=0.18, breath_band=(1500, 7000))
    # kèn bầu xấp xỉ: nhiều bồi âm, lọc mũi
    x = harmonic_tone(rng, f, env, [1 / k ** 0.8 for k in range(1, 16)], breath=0.06)
    return fft_filter(x, lo=400, hi=3500)


def voice(rng, segs, breathy=0.08):
    """Giọng càu nhàu (không thành chữ). segs: [(dur, f0_start, f0_end, (F1,F2,F3), gain, fry)]."""
    parts = []
    for dur, fa, fb, (F1, F2, F3), gain, fry in segs:
        if gain == 0:
            parts.append(np.zeros(int(SR * dur)))
            continue
        t = tt(dur)
        f0 = fa * (fb / fa) ** (t / dur) * (1 + 0.012 * rng.standard_normal(len(t)).cumsum() / np.sqrt(len(t)))
        ph = 2 * np.pi * np.cumsum(f0) / SR
        out = np.zeros_like(t)
        for k in range(1, 60):
            fk = k * f0
            H = sum(A / np.sqrt(1 + ((fk - F) / (B / 2)) ** 2)
                    for F, B, A in ((F1, 90, 1.0), (F2, 120, 0.5), (F3, 180, 0.25)))
            out += (k ** -0.9) * H * np.sin(k * ph) * (fk < 6000)
        if fry:
            out *= 1 - fry * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 28 * t)))
        e = note_env(len(t), 0.025, 0.06)
        b = fft_filter(rng.standard_normal(len(t)), lo=F1, hi=F3) * breathy
        parts.append(gain * (out / (np.abs(out).max() + 1e-9) + b) * e)
    return np.concatenate(parts)


def bubbles(rng, dur=0.6, count=14, fmin=500, fmax=1500):
    out = np.zeros(int(SR * dur))
    for _ in range(count):
        at = rng.uniform(0, dur - 0.08)
        f = rng.uniform(fmin, fmax)
        tau = rng.uniform(0.008, 0.025)
        t = tt(0.08)
        b = np.sin(2 * np.pi * np.cumsum(f * (1 + 6 * t)) / SR) * np.exp(-t / tau) * rng.uniform(0.3, 1)
        place(out, b, at)
    return out


# ---------- công thức ----------
def r_hoe(rng, v):
    """Cuốc đất 'bộp': thịch trầm + đất vụn."""
    j = 1 + 0.06 * (v - 1) * rng.choice([-1, 1])
    t = tt(0.35)
    f = 150 * j * (0.45 + 0.55 * np.exp(-t / 0.02))
    thud = np.tanh(2.5 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.065)) / np.tanh(2.5)
    thud = fft_filter(thud, lo=60) + 1.2 * fft_filter(thud, lo=250, hi=2000)
    dirt = fft_filter(noise(0.35, rng), lo=200, hi=1800) * np.exp(-t / 0.045)
    dirt /= np.abs(dirt).max()
    out = thud + 0.85 * dirt
    for _ in range(5):  # đất vụn lách tách
        g = fft_filter(noise(0.01, rng), lo=2000, hi=6000) * np.exp(-tt(0.01) / 0.002)
        place(out, g * rng.uniform(0.04, 0.1), rng.uniform(0.04, 0.2))
    return out


def r_coin(rng, v):
    """Nhặt xu 'leng keng': 2–3 đồng chạm nhau, lần sau cao hơn (tích cực)."""
    base = 2300 * (1 + 0.04 * (v - 1))
    out = np.zeros(int(SR * 0.75))
    place(out, coin(rng, base), 0)
    place(out, coin(rng, base * 1.19) * 0.8, 0.075)
    if v == 2:
        place(out, coin(rng, base * 1.5) * 0.55, 0.15)
    return reverb(out, rt=0.4, mix=0.12, tone=9000, rng=rng)


def r_water(rng, v):
    """Tưới nước 'róc rách' ngắn: bọt nước + tiếng xối nhẹ."""
    dur = 0.6
    t = tt(dur)
    pour = fft_filter(noise(dur, rng), lo=700, hi=4500)
    pour *= np.clip(t / 0.05, 0, 1) * np.exp(-np.maximum(t - 0.25, 0) / 0.12)
    pour /= np.abs(pour).max()
    b = bubbles(rng, dur, count=12 + 4 * v, fmin=550 + 80 * v, fmax=1500)
    b /= np.abs(b).max() + 1e-9
    return 0.35 * pour + b


def r_levelup(rng, v):
    """Lên level: trống cơm 'tùng tùng' + câu 5 nốt ngũ cung đi lên (v1 sáo, v2 kèn bầu) + não bạt nhỏ."""
    G4, A4, B4, D5, E5, G5 = 392.0, 440.0, 493.9, 587.3, 659.3, 784.0
    notes = [(G4, 0.09), (A4, 0.09), (B4, 0.09), (D5, 0.09), (G5, 0.5)]
    out = np.zeros(int(SR * 1.6))
    place(out, barrel_drum(rng, 190) * 0.7, 0)
    place(out, barrel_drum(rng, 190) * 0.8, 0.12)
    mel = melody(rng, notes, "sao" if v == 1 else "ken")
    place(out, mel * 0.75 / (np.abs(mel).max() + 1e-9), 0.24)
    place(out, barrel_drum(rng, 150), 0.6)
    place(out, cymbals(rng, 0.8, low=1500, decay=0.35) * 0.25, 0.6)
    return reverb(out, rt=0.9, mix=0.18, rng=rng)


def r_frown(rng, v):
    """Mặt bố vợ nhăn. v1: trống trầm 'tùng' một tiếng. v2: mõ 'cốc' + đàn bầu luyến xuống (theo story bible)."""
    if v == 1:
        out = big_drum(rng, f0=82, dur=1.0, decay=0.35)
        return reverb(out, rt=0.7, mix=0.2, tone=2500, rng=rng)
    out = np.zeros(int(SR * 1.0))
    place(out, wood_block(rng, 760), 0)
    n = int(SR * 0.75)
    t = np.arange(n) / SR
    D4, A3 = 293.7, 220.0
    bendt = np.clip((t - 0.18) / 0.35, 0, 1)
    f = D4 * (A3 / D4) ** (bendt ** 1.4) * (1 + 0.015 * np.sin(2 * np.pi * 5 * t) * bendt)
    env = np.exp(-t / 0.9) * note_env(n, 0.004, 0.08)
    db = harmonic_tone(rng, f, env, [1, 0.12, 0.05])
    place(out, db * 0.9 / (np.abs(db).max() + 1e-9), 0.12)
    return reverb(out, rt=0.8, mix=0.2, rng=rng)


def r_damn(rng, v):
    """Meme zoom 'daaamn': 3 tiếng trống to dần, nấc cuối có vang."""
    gap = 0.28 if v == 1 else 0.22
    out = np.zeros(int(SR * 3.0))
    place(out, big_drum(rng, 105, 0.6, 0.18) * 0.35, 0)
    place(out, big_drum(rng, 96, 0.7, 0.22) * 0.6, gap)
    last = big_drum(rng, 84, 1.6, 0.6, hit=1.3)
    if v == 2:
        last = last + 0.12 * cymbals(rng, 1.6, low=800, decay=0.6)
    place(out, reverb(last, rt=1.6, mix=0.35, tone=3000, rng=rng)[: int(SR * 2.4)], 2 * gap)
    return out


def r_oidoioi(rng, v):
    """Meme 'ối dồi ôi': chũm chọe 'xoảng' + chiêng 'oàng' ngân."""
    out = np.zeros(int(SR * 2.4))
    place(out, cymbals(rng, 1.3, low=700, high=10000, decay=0.45 if v == 1 else 0.7), 0)
    place(out, gong(rng, 200 if v == 1 else 240, 2.1, glide=-0.04) * 0.9, 0.16)
    return reverb(out, rt=1.2, mix=0.2, rng=rng)


def r_grumble(rng, v):
    """Càu nhàu không thành chữ. v1 'ú ớ' (hai tiếng thanh sắc, bực). v2 'hừm' (thở ra rồi gằn trầm, huyền)."""
    if v == 1:
        segs = [(0.17, 135, 175, (330, 820, 2400), 1.0, 0.0),
                (0.05, 1, 1, (0, 0, 0), 0, 0),
                (0.26, 150, 205, (520, 1350, 2500), 1.0, 0.15)]
        return voice(rng, segs)
    h = fft_filter(noise(0.07, rng), lo=600, hi=3000) * note_env(int(SR * 0.07), 0.01, 0.02) * 0.25
    segs = [(0.26, 135, 100, (360, 1350, 2500), 1.0, 0.35),
            (0.14, 100, 92, (260, 1000, 2300), 0.45, 0.4)]
    return np.concatenate([h, voice(rng, segs, breathy=0.12)])


# ---------- âm sáng kiểu nhạc game casual (vòng 2: "vui nhộn hiện đại") ----------
def marimba(rng, f0, dur=0.6):
    body = modal(f0, [1, 3.93, 9.2], [1, 0.35, 0.08], [0.28, 0.06, 0.02], dur, rng)
    return place(body, fft_filter(noise(0.005, rng), lo=1000, hi=5000) * 0.15, 0)


def glock(rng, f0, dur=0.9):
    return modal(f0, [1, 2.76, 5.40], [1, 0.25, 0.08], [0.45, 0.12, 0.05], dur, rng)


def clap(rng):
    out = np.zeros(int(SR * 0.15))
    for k, at in enumerate((0, 0.008, 0.017)):
        b = fft_filter(noise(0.1, rng), lo=900, hi=5000) * np.exp(-tt(0.1) / (0.006 if k < 2 else 0.035))
        place(out, b * (0.7 if k < 2 else 1.0), at)
    return out


def r_levelup_bright(rng, v):
    """Lên level tươi: marimba chạy hợp âm Đô trưởng đi lên + glockenspiel lấp lánh + vỗ tay (v2 thêm mõ + nốt kết cao hơn)."""
    C5, E5, G5, C6, E6 = 523.3, 659.3, 784.0, 1046.5, 1318.5
    out = np.zeros(int(SR * 1.6))
    seq = [C5, E5, G5, C6] if v == 1 else [392.0, C5, E5, G5, C6]  # v2: thêm nốt đà Sol4
    step = 0.075
    for i, f in enumerate(seq):
        place(out, marimba(rng, f) * 0.8, i * step)
    top = len(seq) * step
    sparkle = ((C6, 0), (E6, 0.05), (C6 * 2, 0.1)) if v == 1 else ((E6, 0), (C6 * 2, 0.06), (E6 * 2, 0.12))
    for f, at in sparkle:
        place(out, glock(rng, f, 1.0) * 0.45, top + at)
    place(out, clap(rng) * 0.6, top)
    if v == 2:
        place(out, wood_block(rng, 1100) * 0.5, 0)
    return reverb(out, rt=0.7, mix=0.15, tone=9000, rng=rng)


def r_coin_bright(rng, v):
    """Nhặt xu tươi: xu chạm + 'ting' glockenspiel lên quãng 4/5 (v2: 3 nốt nhanh)."""
    base = 2300 * (1 + 0.03 * (v - 1))
    out = np.zeros(int(SR * 0.8))
    place(out, coin(rng, base) * 0.7, 0)
    place(out, glock(rng, 1568.0, 0.7) * 0.6, 0.03)          # G6
    place(out, glock(rng, 2093.0, 0.7) * 0.7, 0.10)          # C7
    if v == 2:
        place(out, glock(rng, 2637.0, 0.6) * 0.5, 0.16)      # E7
    return reverb(out, rt=0.4, mix=0.1, tone=10000, rng=rng)


RECIPES = {
    "hoe": (r_hoe, "sfx-cuoc-dat", "Cuốc đất 'bộp'"),
    "coin": (r_coin, "sfx-nhat-xu", "Nhặt xu 'leng keng'"),
    "water": (r_water, "sfx-tuoi-nuoc", "Tưới nước 'róc rách'"),
    "levelup": (r_levelup, "sfx-len-level", "Lên level: trống + sáo (v1) / kèn bầu (v2)"),
    "frown": (r_frown, "sfx-bo-vo-nhan", "Bố vợ nhăn: trống trầm (v1) / mõ + đàn bầu luyến xuống (v2)"),
    "damn": (r_damn, "meme-daaamn-trong", "Meme zoom: 3 tiếng trống to dần"),
    "oidoioi": (r_oidoioi, "meme-oi-doi-oi-chum-choe", "Meme ối dồi ôi: chũm chọe + chiêng"),
    "levelup_bright": (r_levelup_bright, "sfx-len-level-tuoi", "Lên level tươi: marimba + glockenspiel + vỗ tay"),
    "coin_bright": (r_coin_bright, "sfx-nhat-xu-tuoi", "Nhặt xu tươi: xu + 'ting' glockenspiel đi lên"),
    "grumble": (r_grumble, "voice-cau-nhau", "Càu nhàu: 'ú ớ' (v1) / 'hừm' (v2)"),
}
# Peak mặc định riêng (dBFS): giọng càu nhàu đi kèm bong bóng chữ, nhỏ hơn SFX gameplay
PEAKS = {"grumble": -6.0}


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--list", action="store_true")
    ap.add_argument("--recipe", help="Tên công thức hoặc 'all'")
    ap.add_argument("--variants", type=int, default=2)
    ap.add_argument("--seed", type=int, default=1)
    ap.add_argument("--peak", type=float, help="Peak dBFS (mặc định -1, càu nhàu -6)")
    ap.add_argument("--prefix", help="Tiền tố tên file (mặc định theo công thức)")
    ap.add_argument("--out", default=str(ROOT / "audio-source" / "raw" / "folk-sfx"))
    a = ap.parse_args()
    if a.list or not a.recipe:
        for k, (_, p, d) in RECIPES.items():
            print(f"{k:9} {p:28} {d}")
        return
    names = list(RECIPES) if a.recipe == "all" else [a.recipe]
    out = Path(a.out)
    for name in names:
        fn, prefix, _ = RECIPES[name]
        for v in range(1, a.variants + 1):
            rng = np.random.default_rng(a.seed * 1000 + v)
            x = finish(fn(rng, v), a.peak if a.peak is not None else PEAKS.get(name, -1.0))
            path = out / f"{a.prefix or prefix}-{v}.wav"
            write_wav(path, x, SR)
            print(f"{rel(path)}  seed={a.seed} v={v}  {len(x) / SR:.2f}s")


if __name__ == "__main__":
    main()
