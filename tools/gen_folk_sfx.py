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
    if x.ndim == 2:  # nền stereo (AMB): chỉ bỏ DC + chuẩn hóa peak; làm loop bằng audio_tools loop
        x = x - x.mean(axis=0)
        return x / (np.abs(x).max() + 1e-12) * 10 ** (peak_db / 20)
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


# Biến thể của hoe_soil (T-002, góp ý "bộp chưa giống cuốc"): mỗi v là một tính cách khác nhau
HOE_SOIL = {
    #     body_hz: "thụp" trầm  dec: độ dài thân  metal: lưỡi sắt  wet: đất ẩm "phập"  grains/pebbles: đất vụn/sỏi
    1: dict(body_hz=105, dec=0.050, metal=0.30, metal_hz=1900, wet=0.55, grains=16, pebbles=2, dur=0.36),
    2: dict(body_hz=85, dec=0.065, metal=0.18, metal_hz=1650, wet=0.85, grains=11, pebbles=1, dur=0.38),
    3: dict(body_hz=120, dec=0.045, metal=0.30, metal_hz=2100, wet=0.40, grains=22, pebbles=4, dur=0.34),
    4: dict(body_hz=95, dec=0.055, metal=0.50, metal_hz=2350, wet=0.55, grains=13, pebbles=2, dur=0.36),
}


def r_hoe_soil(rng, v):
    """Cuốc xắn đất ẩm: lưỡi sắt cắm (transient + kim loại tắt ngay) + 'thụp' nhiễu trầm không cao độ
    + 'phập' đất ẩm (dải 250–900 Hz trượt xuống) + đuôi đất vụn / sỏi lạo xạo. Attack ở t=0 (khớp khung chạm)."""
    P = HOE_SOIL[(v - 1) % len(HOE_SOIL) + 1]
    j = rng.uniform(0.97, 1.03)
    dur = P["dur"]
    t = tt(dur)
    # 1) lưỡi cuốc cắm: nhiễu rộng rất ngắn + mode kim loại bị đất "bóp" tắt nhanh
    bite = fft_filter(noise(dur, rng), lo=600, hi=7000) * np.exp(-t / 0.005)
    bite /= np.abs(bite).max()
    metal = modal(P["metal_hz"] * j, [1, 2.31, 3.68, 5.13], [1, 0.55, 0.3, 0.15],
                  [0.028, 0.018, 0.011, 0.007], dur, rng)
    metal /= np.abs(metal).max()
    # 2) thân "thụp": nhiễu trầm (không cao độ như trống) + một chút sine tụt pitch cho sức nặng
    a = 1 - np.exp(-t / 0.002)
    body = fft_filter(noise(dur, rng), lo=45, hi=380, order=3) * a * np.exp(-t / P["dec"])
    body /= np.abs(body).max()
    f = P["body_hz"] * j * (1 + 0.7 * np.exp(-t / 0.012))
    low = np.sin(2 * np.pi * np.cumsum(f) / SR) * a * np.exp(-t / (P["dec"] * 0.8))
    # 3) "phập" đất ẩm: dải giữa, đỉnh muộn hơn một chút, tâm trượt xuống (ghép 2 dải chồng thời gian)
    wa = fft_filter(noise(dur, rng), lo=500, hi=1100) * (t / 0.006) * np.exp(1 - t / 0.006)
    wb = fft_filter(noise(dur, rng), lo=220, hi=650) * ((t / 0.022) * np.exp(1 - t / 0.022))
    wet = wa / (np.abs(wa).max() + 1e-9) * 0.6 + wb / (np.abs(wb).max() + 1e-9)
    out = 0.9 * body + 0.8 * low + P["wet"] * wet + 0.5 * bite + P["metal"] * metal
    # 4) đuôi: nền lạo xạo + hạt đất vụn rơi thưa dần + vài viên sỏi "tích"
    bed_env = ((t - 0.03).clip(0) / 0.05) * np.exp(1 - (t - 0.03).clip(0) / 0.05)
    bed = fft_filter(noise(dur, rng), lo=1200, hi=5500) * bed_env
    out += 0.22 * bed / (np.abs(bed).max() + 1e-9)
    for _ in range(P["grains"]):
        at = 0.03 + rng.exponential(0.07)
        if at > dur - 0.03:
            continue
        gl = rng.uniform(0.004, 0.012)
        lo = rng.uniform(900, 2500)
        g = fft_filter(noise(gl, rng), lo=lo, hi=lo * 2.5) * np.exp(-tt(gl) / (gl / 4))
        place(out, g / (np.abs(g).max() + 1e-9) * rng.uniform(0.15, 0.4) * np.exp(-at / 0.15), at)
    for _ in range(P["pebbles"]):
        at = rng.uniform(0.06, min(0.22, dur - 0.06))
        p = modal(rng.uniform(2600, 4200), [1, 1.9, 2.8], [1, 0.4, 0.2], [0.012, 0.007, 0.004], 0.05, rng)
        place(out, p / (np.abs(p).max() + 1e-9) * rng.uniform(0.18, 0.32), at)
    # nhấn dải giữa cho loa laptop, bỏ hạ âm, mềm phần chói (bản sắc mộc, không gắt)
    out = fft_filter(out, lo=55, hi=8000) + 0.5 * fft_filter(out, lo=300, hi=2500)
    # bão hòa nhẹ: nén đỉnh transient để tổng thể chắc, to ngang bản cũ
    out = np.tanh(2.2 * out / (np.abs(out).max() + 1e-9)) / np.tanh(2.2)
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


# ---------- T-003: gieo hạt, hái cây ----------
def _grain(rng, length, lo, hi):
    """Một hạt nhiễu cực ngắn trong dải lo–hi, tắt rất nhanh, chuẩn hóa về 1."""
    g = fft_filter(noise(length, rng), lo=lo, hi=hi) * np.exp(-tt(length) / (length / 4))
    return g / (np.abs(g).max() + 1e-9)


def _seed_tick(rng, f_lo, f_hi):
    """Một hạt giống rơi xuống đất tơi: 'tách' khô rất ngắn (vỏ hạt cứng) + 'sụt' nhỏ khi lún vào đất."""
    tick = _grain(rng, 0.006, 1500, 7000)
    shell = modal(rng.uniform(f_lo, f_hi), [1, 1.7, 2.6], [1, 0.45, 0.2], [0.004, 0.0025, 0.0015], 0.03, rng)
    shell /= np.abs(shell).max() + 1e-9
    sink = fft_filter(noise(0.03, rng), lo=300, hi=1200) * np.exp(-tt(0.03) / 0.006)
    sink /= np.abs(sink).max() + 1e-9
    out = np.zeros(int(SR * 0.03))
    place(out, 0.55 * tick, 0)
    place(out, 0.6 * shell, 0)
    place(out, 0.35 * sink, 0.002)
    return out


# Biến thể gieo hạt: seeds = số hạt (game cũng thả 4 hạt hình), spread = rải trong bao lâu,
# seed_hz = cao độ vỏ hạt, cover = tay vùi đất "sột", pat = vỗ nhẹ "bụp" cuối
SOW_SEED = {
    1: dict(seeds=4, spread=0.085, seed_hz=(2600, 4200), cover=0.45, pat=0.30, dur=0.26),
    2: dict(seeds=3, spread=0.070, seed_hz=(2400, 3800), cover=0.70, pat=0.55, dur=0.31),
    3: dict(seeds=6, spread=0.120, seed_hz=(3000, 5000), cover=0.25, pat=0.12, dur=0.24),
    4: dict(seeds=5, spread=0.100, seed_hz=(1700, 2900), cover=0.45, pat=0.30, dur=0.28),
}


def r_sow_seed(rng, v):
    """Gieo hạt 'lách tách': vài hạt rơi xuống đất tơi (hạt đầu ở t=0) + tay vùi đất 'sột' + vỗ nhẹ.
    Nhẹ hơn cuốc nhiều: không có thân trầm, lọc bớt phần chói, việc nhanh lặp nhiều lần."""
    P = SOW_SEED[(v - 1) % len(SOW_SEED) + 1]
    dur = P["dur"]
    t = tt(dur)
    out = np.zeros(len(t))
    # 1) hạt rơi: khoảng cách không đều (nghe như tay rắc thật, không đều như máy)
    gaps = rng.uniform(0.35, 1.0, P["seeds"] - 1)
    times = np.concatenate([[0.0], np.cumsum(gaps) / gaps.sum() * P["spread"]])
    for k, at in enumerate(times):
        amp = (1.0 if k == 0 else rng.uniform(0.45, 0.85)) * (1 - 0.08 * k)
        place(out, _seed_tick(rng, *P["seed_hz"]) * amp, at)
    # 2) tay vùi đất: nhiễu dải giữa có hạt (nhiều hạt nhỏ chồng nhau), phồng lên sau hạt cuối
    c0 = P["spread"] * 0.55
    cov_env = ((t - c0).clip(0) / 0.035) * np.exp(1 - (t - c0).clip(0) / 0.035)
    grit = np.zeros(len(t))
    for _ in range(40):
        at = c0 + rng.uniform(0, 0.12)
        if at < dur - 0.02:
            place(grit, _grain(rng, rng.uniform(0.003, 0.008), 500, 2600) * rng.uniform(0.3, 1), at)
    bed = fft_filter(noise(dur, rng), lo=250, hi=1600)
    bed /= np.abs(bed).max() + 1e-9
    cover = (0.6 * bed + 0.5 * grit / (np.abs(grit).max() + 1e-9)) * cov_env
    out += P["cover"] * cover
    # 3) vỗ nhẹ: 'bụp' mềm, trầm vừa (không có cao độ), sau khi vùi
    pat_at = c0 + 0.05
    pt = tt(0.06)
    pat = fft_filter(noise(0.06, rng), lo=90, hi=450, order=3) * (1 - np.exp(-pt / 0.003)) * np.exp(-pt / 0.018)
    place(out, P["pat"] * pat / (np.abs(pat).max() + 1e-9), pat_at)
    # bỏ hạ âm, mềm phần chói (lặp nhiều lần không mỏi tai), nhấn nhẹ dải laptop
    out = fft_filter(out, lo=110, hi=7000) + 0.3 * fft_filter(out, lo=400, hi=2500)
    return out


def marimba_soft(rng, f0, dur=0.4):
    """Marimba gõ dùi mềm, ngắn (cho tiếng hái: cao độ rõ để game detune tăng dần)."""
    body = modal(f0, [1, 3.93, 9.2], [1, 0.22, 0.04], [0.16, 0.04, 0.015], dur, rng)
    return place(body, fft_filter(noise(0.004, rng), lo=800, hi=4000) * 0.08, 0)


# Biến thể hái: pop = "bộp" môi miệng/nút bần (sine vuốt lên tới nốt đích), tone = lớp nhạc cụ cùng nốt
# (Đô trưởng) để cao độ rõ; roots = tiếng rễ đứt lách tách; soil = đất rơi lại
HARVEST_POP = {
    1: dict(pop_to=523.3, pop_from=0.55, pop_dec=0.055, tone="marimba", tone_hz=1046.5, tone_amp=0.35,
            roots=6, root_amp=0.80, soil=0.75, dur=0.34),   # C5 + marimba C6
    2: dict(pop_to=659.3, pop_from=0.55, pop_dec=0.050, tone="glock", tone_hz=1568.0, tone_amp=0.22,
            roots=5, root_amp=0.70, soil=0.65, dur=0.34),   # E5 + glock G6
    3: dict(pop_to=523.3, pop_from=0.50, pop_dec=0.060, tone=None, tone_hz=0, tone_amp=0,
            roots=9, root_amp=1.00, soil=1.00, dur=0.36),   # C5 trơn, nhiều rễ + đất (thật nhất)
    4: dict(pop_to=392.0, pop_from=0.55, pop_dec=0.060, tone="marimba", tone_hz=784.0, tone_amp=0.40,
            roots=7, root_amp=0.85, soil=0.85, dur=0.36),   # G4 + marimba G5 (trầm, "plộp")
}


def r_harvest_pop(rng, v):
    """Hái cây 'pop': rễ bật lách tách (0–20 ms) + 'pop' vuốt lên có cao độ rõ (nốt Đô trưởng)
    + lớp marimba/glockenspiel cùng hợp âm + đất rơi lại nhẹ. Tiếng gốc; game detune tăng dần khi hái liên tiếp."""
    P = HARVEST_POP[(v - 1) % len(HARVEST_POP) + 1]
    dur = P["dur"]
    t = tt(dur)
    out = np.zeros(len(t))
    # 1) rễ đứt: vài 'tách' nhỏ dồn dập + 'kéo' đất (nhiễu dải giữa phồng lên nhanh)
    for k in range(P["roots"]):
        at = rng.uniform(0, 0.02)
        place(out, _grain(rng, rng.uniform(0.002, 0.005), 1200, 6000) * rng.uniform(0.4, 1) * P["root_amp"], at)
    tug = fft_filter(noise(0.05, rng), lo=250, hi=1000) * (tt(0.05) / 0.01) * np.exp(1 - tt(0.05) / 0.01)
    place(out, 0.35 * P["root_amp"] * tug / (np.abs(tug).max() + 1e-9), 0)
    # 2) pop: sine vuốt nhanh từ dưới lên tới nốt đích rồi tắt; thêm bồi âm 2 nhỏ cho chắc trên loa laptop
    pop_at = 0.012
    pt = tt(dur - pop_at)
    f = P["pop_to"] * (1 - (1 - P["pop_from"]) * np.exp(-pt / 0.007))
    ph = 2 * np.pi * np.cumsum(f) / SR
    env = (1 - np.exp(-pt / 0.0015)) * np.exp(-pt / P["pop_dec"])
    pop = (np.sin(ph) + 0.25 * np.sin(2 * ph) + 0.08 * np.sin(3 * ph)) * env
    click = _grain(rng, 0.004, 600, 3500)
    place(out, 1.0 * pop / (np.abs(pop).max() + 1e-9), pop_at)
    place(out, 0.25 * click, pop_at)
    # 3) lớp nhạc cụ (tích cực = sáng): cùng hợp âm, nhỏ hơn pop
    if P["tone"] == "marimba":
        tone = marimba_soft(rng, P["tone_hz"], dur - pop_at)
    elif P["tone"] == "glock":
        tone = modal(P["tone_hz"], [1, 2.76, 5.40], [1, 0.2, 0.05], [0.14, 0.05, 0.02], dur - pop_at, rng)
    else:
        tone = None
    if tone is not None:
        place(out, P["tone_amp"] * tone / (np.abs(tone).max() + 1e-9), pop_at + 0.004)
    # 4) đất rơi lại: hạt đất vụn thưa dần + 1–2 cục đất 'bụp' mềm
    for _ in range(10):
        at = 0.05 + rng.exponential(0.06)
        if at < dur - 0.03:
            lo = rng.uniform(800, 2200)
            place(out, _grain(rng, rng.uniform(0.003, 0.009), lo, lo * 2.5)
                  * rng.uniform(0.12, 0.3) * P["soil"] * np.exp(-(at - 0.05) / 0.12), at)
    for _ in range(2):
        at = rng.uniform(0.08, min(0.2, dur - 0.06))
        ct = tt(0.05)
        clump = fft_filter(noise(0.05, rng), lo=150, hi=700) * (1 - np.exp(-ct / 0.002)) * np.exp(-ct / 0.012)
        place(out, clump / (np.abs(clump).max() + 1e-9) * rng.uniform(0.15, 0.28) * P["soil"], at)
    out = fft_filter(out, lo=100, hi=9000)
    # vang rất ngắn cho ấm, cắt đúng độ dài (finish() fade-out 15 ms)
    return reverb(out, rt=0.25, mix=0.07, tone=6000, rng=rng)[: int(SR * (dur + 0.04))]



# ---------- T-025: Lô 1 Vườn (một ngày ở nhà) ----------
def conv(x, ir):
    n = len(x) + len(ir) - 1
    pad = 1 << int(np.ceil(np.log2(n)))
    return np.fft.irfft(np.fft.rfft(x, pad) * np.fft.rfft(ir, pad), pad)[:n]


def norm(x):
    return x / (np.abs(x).max() + 1e-9)


def env_ad(t, attack, decay):
    """Đường bao: lên tuyến tính trong `attack` giây rồi tắt mũ với hằng số `decay` (t là mảng giây)."""
    return np.clip(t / max(attack, 1e-4), 0, 1) * np.exp(-np.maximum(t - attack, 0) / decay)


def smooth_noise(rng, dur, rate, lo=0.0):
    """Nhiễu chậm (LFO ngẫu nhiên) trong [lo, 1], đổi hướng khoảng `rate` lần/giây."""
    n = int(SR * dur)
    k = max(2, int(dur * rate) + 2)
    pts = rng.uniform(0, 1, k)
    v = np.interp(np.linspace(0, k - 1, n), np.arange(k), pts)
    return lo + (1 - lo) * v


def vox(rng, dur, f0_pts, form_pts, amp_pts, breathy=0.06, nharm=60, fry=0.0, fry_hz=30.0, jitter=0.012):
    """Giọng formant liền mạch: f0, formant (F1, F2, F3), âm lượng nội suy theo các điểm (t, giá trị)."""
    t = tt(dur)
    ft, fv = zip(*f0_pts)
    f0 = np.interp(t, ft, fv) * (1 + jitter * rng.standard_normal(len(t)).cumsum() / np.sqrt(len(t)))
    fmt = [np.interp(t, [p[0] for p in form_pts], [p[1][i] for p in form_pts]) for i in range(3)]
    at, av = zip(*amp_pts)
    amp = np.interp(t, at, av)
    ph = 2 * np.pi * np.cumsum(f0) / SR
    out = np.zeros_like(t)
    for k in range(1, nharm + 1):
        fk = k * f0
        H = (1.0 / np.sqrt(1 + ((fk - fmt[0]) / 55) ** 2) + 0.5 / np.sqrt(1 + ((fk - fmt[1]) / 70) ** 2)
             + 0.25 / np.sqrt(1 + ((fk - fmt[2]) / 100) ** 2))
        out += (k ** -0.8) * H * np.sin(k * ph) * (fk < 7000)
    out = norm(out)
    if fry:
        out *= 1 - fry * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * fry_hz * t)))
    b = norm(fft_filter(rng.standard_normal(len(t)), lo=400, hi=4500))
    return (out + breathy * b) * amp


def creak(rng, dur, rate0, rate1, modes=(420, 980, 1650, 2700), decay=0.012, jitter=0.25):
    """Cót két (gỗ / tre / bản lề): chuỗi xung 'dính-trượt' tốc độ rate0 -> rate1 kích các mode cộng hưởng."""
    n = int(SR * dur)
    t = np.arange(n) / SR
    rate = rate0 + (rate1 - rate0) * t / dur
    rate = rate * (1 + jitter * (smooth_noise(rng, dur, 18) - 0.5))
    ph = np.cumsum(rate) / SR
    imp = np.zeros(n)
    idx = np.where(np.diff(np.floor(ph)) > 0)[0]
    imp[idx] = rng.uniform(0.5, 1.0, len(idx))
    ir = modal(modes[0], [m / modes[0] for m in modes], [1, 0.7, 0.45, 0.25][:len(modes)],
               [decay, decay * 0.7, decay * 0.5, decay * 0.35][:len(modes)], 0.06, rng)
    out = conv(imp, ir)[:n] * note_env(n, 0.02, 0.04)
    return fft_filter(out, lo=250, hi=5000)


def dirt_step(rng, soft=1.0):
    """Bước chân đất nện: 'thịch' trầm vừa + quẹt đất + vài hạt."""
    d = 0.14
    t = tt(d)
    thud = norm(fft_filter(noise(d, rng), lo=70, hi=380, order=3)) * env_ad(t, 0.003, 0.022)
    ts = np.maximum(t - 0.006, 0)
    scuff = norm(fft_filter(noise(d, rng), lo=350, hi=2200)) * env_ad(ts, 0.006, 0.03) * (t > 0.006)
    out = thud + 0.45 * scuff
    for _ in range(4):
        place(out, _grain(rng, rng.uniform(0.003, 0.006), 1500, 4500) * rng.uniform(0.08, 0.2), rng.uniform(0.01, 0.08))
    out = fft_filter(out, lo=60, hi=6000) + 0.4 * fft_filter(out, lo=250, hi=1500)
    return out * soft


def grass_step(rng, soft=1.0):
    """Bước chân trên cỏ: 'thụp' mềm + cỏ sột soạt."""
    d = 0.15
    t = tt(d)
    thud = norm(fft_filter(noise(d, rng), lo=80, hi=320, order=3)) * env_ad(t, 0.006, 0.02) * 0.6
    rustle = np.zeros(int(SR * d))
    for _ in range(22):
        at = rng.uniform(0.0, 0.09)
        lo = rng.uniform(1500, 3500)
        place(rustle, _grain(rng, rng.uniform(0.004, 0.012), lo, lo * 2.4) * rng.uniform(0.3, 1), at)
    bed = norm(fft_filter(noise(d, rng), lo=1200, hi=6000)) * env_ad(t, 0.012, 0.035)
    out = thud + 0.55 * norm(rustle) + 0.35 * bed
    return fft_filter(out, lo=70, hi=7500) * soft


def r_footstep(rng, v):
    """Bước chân: v1–3 đất nện, v4–6 cỏ (AUD-SFX-111)."""
    return dirt_step(rng) if v <= 3 else grass_step(rng)


def r_hoe_finish(rng, v):
    """Nhát cuốc chốt (xong ô): 'phập' cuốc đầy hơn + đất vỡ tung + cục đất rơi lả tả.
    v1/v2 chỉ tiếng đất; v3 thêm 1 nốt marimba trầm mềm (Đô) báo 'xong'."""
    base = r_hoe_soil(rng, 2 if v != 2 else 1)
    dur = 0.55
    t = tt(dur)
    out = np.zeros(len(t))
    place(out, base * 1.0, 0)
    f = (70 if v != 2 else 82) * (1 + 0.8 * np.exp(-t / 0.015))
    low = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_ad(t, 0.002, 0.07)
    out += 0.55 * low
    tb = np.maximum(t - 0.02, 0)
    burst = norm(fft_filter(noise(dur, rng), lo=350, hi=2600)) * env_ad(tb, 0.03, 0.09) * (t > 0.02)
    out += 0.5 * burst
    for _ in range(4):
        at = rng.uniform(0.12, 0.38)
        ct = tt(0.05)
        clump = norm(fft_filter(noise(0.05, rng), lo=120, hi=650)) * (1 - np.exp(-ct / 0.002)) * np.exp(-ct / 0.014)
        place(out, clump * rng.uniform(0.15, 0.3), at)
    for _ in range(26):
        at = 0.05 + rng.exponential(0.11)
        if at < dur - 0.03:
            lo = rng.uniform(900, 2600)
            place(out, _grain(rng, rng.uniform(0.003, 0.01), lo, lo * 2.4) * rng.uniform(0.1, 0.3)
                  * np.exp(-(at - 0.05) / 0.2), at)
    if v == 3:
        place(out, marimba_soft(rng, 261.6, 0.45) * 0.35 + marimba_soft(rng, 392.0, 0.45) * 0.2, 0.03)
    out = fft_filter(out, lo=50, hi=8000) + 0.35 * fft_filter(out, lo=300, hi=2500)
    return np.tanh(2.0 * norm(out)) / np.tanh(2.0)


def r_wither(rng, v):
    """Cây héo 'phù': hơi xì ra (tâm dải trượt xuống) + nốt 'xẹp' tụt mềm Si4 -> Si3 + lá khô rũ sột soạt."""
    dur = 0.6
    t = tt(dur)
    a = norm(fft_filter(noise(dur, rng), lo=1200, hi=3200))
    b = norm(fft_filter(noise(dur, rng), lo=350, hi=1100))
    mix = np.clip(t / 0.35, 0, 1)
    breath = ((1 - mix) * a + mix * b) * env_ad(t, 0.04, 0.16)
    f = 494 * (247 / 494) ** np.clip(t / 0.42, 0, 1)
    ph = 2 * np.pi * np.cumsum(f) / SR
    tone = (np.sin(ph) + 0.3 * np.sin(2 * ph) + 0.1 * np.sin(3 * ph)) * env_ad(t, 0.03, 0.18)
    out = 0.8 * breath + (0.45 if v == 1 else 0.3) * tone
    for _ in range(14):
        at = rng.uniform(0.18, 0.45)
        lo = rng.uniform(1800, 4000)
        place(out, _grain(rng, rng.uniform(0.004, 0.01), lo, lo * 2) * rng.uniform(0.08, 0.2), at)
    return fft_filter(out, lo=120, hi=7000)


def r_clear_wither(rng, v):
    """Dọn cây héo: thân khô gãy 'rắc' nhỏ + lá khô sột soạt + vứt 'phịch'."""
    dur = 0.5
    t = tt(dur)
    out = np.zeros(len(t))
    snap = modal(rng.uniform(1300, 1700), [1, 2.3, 3.9], [1, 0.5, 0.25], [0.008, 0.005, 0.003], 0.04, rng)
    place(out, norm(snap) * 0.6, 0)
    place(out, _grain(rng, 0.006, 1500, 7000) * 0.6, 0)
    crunch = np.zeros(len(t))
    for _ in range(55 if v == 1 else 40):
        at = rng.uniform(0.0, 0.22) if v == 1 else rng.exponential(0.07)
        if at < dur - 0.03:
            lo = rng.uniform(1100, 3200)
            place(crunch, _grain(rng, rng.uniform(0.003, 0.012), lo, lo * 2.2) * rng.uniform(0.25, 1), at)
    bed = norm(fft_filter(noise(dur, rng), lo=1000, hi=5000)) * env_ad(t, 0.02, 0.09)
    out += 0.7 * norm(crunch) + 0.3 * bed
    th = tt(0.06)
    toss = norm(fft_filter(noise(0.06, rng), lo=100, hi=600, order=3)) * env_ad(th, 0.003, 0.015)
    place(out, toss * 0.45, 0.28 if v == 1 else 0.24)
    return fft_filter(out, lo=110, hi=6000)


def r_eat(rng, v):
    """Ăn 'nhồm nhoàm': 3 tiếng nhai có giọng mũi (n-ồ-m / nh-oà-m) + 'chóp' ướt (v2 thêm giòn 'rộp')."""
    syll = [(0.0, 0.17, (420, 820), 175), (0.2, 0.21, (700, 1150), 165), (0.45, 0.17, (430, 850), 180)]
    if v == 2:
        syll = [(0.0, 0.15, (650, 1100), 180), (0.17, 0.15, (420, 820), 170), (0.36, 0.2, (700, 1150), 160)]
    total = syll[-1][0] + syll[-1][1] + 0.08
    out = np.zeros(int(SR * total))
    for at, d, (F1, F2), f0 in syll:
        x = vox(rng, d,
                [(0, f0 * 1.04), (d, f0 * 0.9)],
                [(0, (260, 1700, 2600)), (0.035, (F1, F2, 2500)), (d * 0.7, (F1 * 0.9, F2 * 0.95, 2500)),
                 (d, (250, 900, 2300))],
                [(0, 0), (0.02, 0.6), (0.04, 1.0), (d * 0.65, 0.9), (d * 0.85, 0.45), (d, 0)],
                breathy=0.05)
        place(out, x, at)
        sm = norm(fft_filter(noise(0.015, rng), lo=900, hi=3800)) * env_ad(tt(0.015), 0.0008, 0.003)
        place(out, sm * 0.5, at + 0.025)
        if v == 2:
            for _ in range(8):
                place(out, _grain(rng, rng.uniform(0.003, 0.007), 1200, 4500) * rng.uniform(0.2, 0.45),
                      at + rng.uniform(0.03, 0.09))
    return fft_filter(out, lo=120, hi=7000)


def r_stomach(rng, v):
    """Bụng réo 'ọc ọc': 2 tiếng ọc trầm (giọng rè rất thấp + bọt trầm), lớp dải giữa cho loa laptop."""
    dur = 1.1
    out = np.zeros(int(SR * dur))
    second = (0.52, 0.5, 120, 80) if v == 1 else (0.48, 0.55, 110, 165)
    for at, d, f0a, f0b in ((0.0, 0.42, 95, 140), second):
        x = vox(rng, d, [(0, f0a), (d * 0.5, (f0a + f0b) / 2 * 1.1), (d, f0b)],
                [(0, (300, 650, 1400)), (d * 0.5, (420, 800, 1600)), (d, (280, 600, 1300))],
                [(0, 0), (0.05, 0.7), (d * 0.3, 1), (d * 0.6, 0.6), (d * 0.8, 0.9), (d, 0)],
                breathy=0.02, nharm=40, fry=0.7, fry_hz=rng.uniform(16, 24), jitter=0.04)
        place(out, x, at)
        b = bubbles(rng, d, count=9, fmin=160, fmax=420)
        place(out, 0.5 * norm(b), at + 0.03)
    out = np.tanh(2.5 * norm(out)) / np.tanh(2.5)
    return fft_filter(out, lo=60, hi=2500) + 0.5 * fft_filter(out, lo=250, hi=1200)


def r_yawn(rng, v):
    """Ngáp dài 'hà-ááá-ồm': hít hơi, mở to giọng đi lên rồi tụt dài, khép miệng 'm'."""
    d = 1.35 if v == 1 else 1.2
    hi = 290 if v == 1 else 250
    x = vox(rng, d,
            [(0, 170), (0.18, hi), (0.45, hi * 0.95), (1.0, 140), (d, 110)],
            [(0, (700, 1200, 2600)), (0.2, (850, 1300, 2700)), (0.75, (750, 1150, 2600)),
             (1.0, (450, 850, 2400)), (d, (260, 900, 2300))],
            [(0, 0), (0.12, 0.35), (0.25, 1.0), (0.7, 0.85), (1.05, 0.55), (d, 0)],
            breathy=0.35, jitter=0.02)
    h = norm(fft_filter(noise(0.2, rng), lo=700, hi=4000)) * env_ad(tt(0.2), 0.08, 0.06) * 0.25
    out = np.zeros(int(SR * (d + 0.1)))
    place(out, h, 0)
    place(out, x, 0.08)
    return fft_filter(out, lo=110, hi=7000)


def r_snore(rng, v):
    """Ngáy 'khò… phù…' 2 nhịp: hít vào rè trầm (~40 Hz) + thở ra 'phù' (v2 có huýt nhẹ). Đầu/cuối lặng -> lặp được."""
    cyc = 1.35 if v == 1 else 1.5
    out = np.zeros(int(SR * 2 * cyc))
    for c in range(2):
        at = c * cyc
        d_in = 0.62
        x = vox(rng, d_in, [(0, 36), (d_in, 44)],
                [(0, (450, 1000, 2400)), (d_in, (550, 1100, 2500))],
                [(0, 0), (0.15, 0.7), (0.45, 1.0), (d_in, 0)],
                breathy=0.6, nharm=150, jitter=0.05)
        rumble = 0.6 + 0.4 * np.sign(np.sin(2 * np.pi * rng.uniform(26, 34) * tt(d_in)))
        place(out, x * rumble, at + 0.05)
        d_out = 0.5
        to = tt(d_out)
        exh = norm(fft_filter(noise(d_out, rng), lo=500, hi=2600)) * env_ad(to, 0.06, 0.16) * 0.45
        if v == 2:
            f = 1100 * (1 - 0.35 * to / d_out)
            exh += 0.25 * np.sin(2 * np.pi * np.cumsum(f) / SR) * env_ad(to, 0.05, 0.12)
        place(out, exh, at + 0.05 + d_in + 0.06)
    return fft_filter(out, lo=60, hi=6000) + 0.5 * fft_filter(out, lo=250, hi=1500)


def r_rooster(rng, v):
    """Gà gáy 'ò ó o oooo' (v1 gà gần, v2 gà xa có vang + chim sẻ sáng, v3 chỉ chim sáng — dự phòng)."""
    total = 2.0
    out = np.zeros(int(SR * total))
    if v in (1, 2):
        d = 1.55
        x = vox(rng, d,
                [(0, 520), (0.14, 560), (0.17, 690), (0.38, 760), (0.42, 820), (0.9, 880), (1.25, 830), (d, 560)],
                [(0, (850, 1500, 3000)), (0.2, (950, 1700, 3200)), (0.5, (1000, 1650, 3200)),
                 (1.2, (900, 1500, 3000)), (d, (700, 1300, 2800))],
                [(0, 0), (0.02, 0.8), (0.13, 0.7), (0.15, 0.25), (0.18, 0.9), (0.36, 0.8), (0.4, 0.3),
                 (0.44, 1.0), (1.2, 0.9), (d, 0)],
                breathy=0.25, nharm=12, jitter=0.03)
        t = tt(d)
        x *= 1 + 0.35 * np.sin(2 * np.pi * 55 * t)
        x *= 1 + 0.04 * np.sin(2 * np.pi * 6 * t)
        x = np.tanh(2.2 * norm(x)) / np.tanh(2.2)
        x = fft_filter(x, lo=400, hi=6500)
        if v == 2:
            x = reverb(x * 0.7, rt=0.9, mix=0.3, tone=4500, rng=rng)
        place(out, x, 0.05)
    if v in (2, 3):
        for _ in range(7 if v == 2 else 12):
            at = rng.uniform(0.0, total - 0.35)
            for k in range(int(rng.integers(2, 5))):
                dch = rng.uniform(0.035, 0.06)
                tc = tt(dch)
                f = rng.uniform(3200, 4800) * (1 + rng.choice([-1, 1]) * 0.25 * tc / dch)
                ch = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tc / dch) ** 2
                place(out, ch * rng.uniform(0.15, 0.35), at + k * rng.uniform(0.06, 0.09))
    return reverb(out, rt=0.6, mix=0.15, tone=7000, rng=rng)


def crackle(rng, dur, rate, amp=1.0, lo=600, hi=6000):
    """Lách tách ngẫu nhiên (lửa, mưa lá): hạt nhiễu cực ngắn theo phân bố Poisson."""
    out = np.zeros(int(SR * dur))
    t = 0.0
    while True:
        t += rng.exponential(1 / rate)
        if t > dur - 0.01:
            break
        place(out, _grain(rng, rng.uniform(0.0015, 0.004), lo, hi) * rng.uniform(0.2, 1) ** 2 * amp, t)
    return out


def r_cook(rng, v):
    """Nấu ở bếp rơm: lửa rơm bùng 'phừng' + lách tách + xèo (thức ăn vào chảo)."""
    dur = 1.5
    t = tt(dur)
    flame = norm(fft_filter(noise(dur, rng), lo=90, hi=700)) * env_ad(t, 0.12, 0.6) * smooth_noise(rng, dur, 8, 0.5)
    cr = crackle(rng, dur, 38) * (np.exp(-t / 1.0) * 0.8 + 0.2)
    sz_env = np.clip((t - 0.2) / 0.08, 0, 1) * np.exp(-np.maximum(t - 0.45, 0) / 0.45)
    sizzle = norm(fft_filter(noise(dur, rng), lo=2800, hi=9000)) * sz_env * smooth_noise(rng, dur, 25, 0.4)
    out = 0.5 * flame + 0.9 * norm(cr) + (0.45 if v == 1 else 0.6) * sizzle
    return fft_filter(out, lo=80, hi=8000)


def r_count_tick(rng, v):
    """Đếm tiền 'tách' 60–90 ms: v1/v2 xu chạm khẽ (2 cao độ), v3/v4 hạt bàn tính gỗ."""
    d = 0.09
    if v <= 2:
        f0 = 2900 if v == 1 else 3250
        out = norm(modal(f0, [1, 1.72, 2.36, 3.58], [1, 0.6, 0.4, 0.2], [0.03, 0.02, 0.014, 0.008], d, rng))
        place(out, _grain(rng, 0.003, 3000, 9000) * 0.5, 0)
    else:
        f0 = 1500 if v == 3 else 1750
        out = norm(modal(f0, [1, 2.57, 4.1], [1, 0.35, 0.12], [0.012, 0.007, 0.004], d, rng))
        place(out, _grain(rng, 0.003, 1500, 7000) * 0.45, 0)
        place(out, norm(modal(f0 * 1.08, [1, 2.57], [1, 0.3], [0.008, 0.005], 0.03, rng)) * 0.35, 0.018)
    return fft_filter(out, lo=400, hi=11000)


def r_thunder(rng, v):
    """Sấm xa 'ì ầm': ầm trầm nhiều đợt chồng nhau, vào mềm (xa); v2 có tiếng 'rạch' đầu, gần hơn."""
    dur = 2.8 if v == 1 else 2.6
    t = tt(dur)
    rum = fft_filter(np.cumsum(noise(dur, rng)) / 100, lo=30, hi=220, order=2)
    rum = norm(rum)
    envl = np.zeros(len(t))
    for c, w, a in ((0.25, 0.35, 1.0), (0.7, 0.5, 0.8), (1.2, 0.5, 0.65), (1.8, 0.6, 0.4)):
        envl += a * np.exp(-0.5 * ((t - c * (dur / 2.8)) / (w * 0.6)) ** 2)
    envl *= np.clip(t / 0.15, 0, 1) * (1 - np.clip((t - dur + 0.6) / 0.6, 0, 1))
    x = rum * envl * smooth_noise(rng, dur, 14, 0.55)
    x = np.tanh(2.5 * norm(x)) / np.tanh(2.5)
    # lớp 'ì ầm' dải giữa (cùng đường bao) để loa laptop vẫn nghe ra sấm (dưới ~150 Hz loa gần như mất)
    mid = norm(fft_filter(noise(dur, rng), lo=150, hi=700)) * envl * smooth_noise(rng, dur, 20, 0.4)
    mid = np.tanh(2.0 * norm(mid)) / np.tanh(2.0)
    out = 0.6 * fft_filter(x, lo=35, hi=900) + 1.4 * fft_filter(x, lo=150, hi=700) + 0.35 * mid
    if v == 2:
        crack = norm(fft_filter(noise(0.4, rng), lo=400, hi=3500)) * env_ad(tt(0.4), 0.01, 0.07)
        place(out, crack * 0.35 * np.abs(out).max(), 0.05)
    return out


def _stereo(rng, make):
    """Hai kênh độc lập (cùng công thức, rng riêng) -> nền stereo rộng."""
    return np.stack([make(np.random.default_rng(int(rng.integers(1 << 30)))) for _ in range(2)], axis=1)


def r_rain(rng, v):
    """Mưa trên lá + mái rạ (AMB stereo ~22 s, làm loop bằng audio_tools loop): nền xào xạc + giọt trên lá + 'lộp' trên rạ."""
    dur = 22.0

    def chan(r):
        t = tt(dur)
        bed = fft_filter(r.standard_normal(len(t)), lo=500, hi=6500)
        bed = norm(bed - 0.5 * fft_filter(bed, lo=3500)) * (0.8 + 0.2 * smooth_noise(r, dur, 0.3))
        leaves = crackle(r, dur, 55, lo=1800, hi=7000)
        thatch = np.zeros(len(t))
        tk = 0.0
        while True:
            tk += r.exponential(1 / 14)
            if tk > dur - 0.05:
                break
            p = norm(fft_filter(noise(0.04, r), lo=250, hi=1300)) * env_ad(tt(0.04), 0.002, 0.009)
            place(thatch, p * r.uniform(0.2, 1), tk)
        return 0.55 * bed + 0.35 * norm(leaves) + 0.3 * norm(thatch)
    return _stereo(rng, chan)


def r_indoor(rng, v):
    """Nền trong nhà (AMB stereo ~16 s): bếp rơm lách tách khẽ + lửa thì thầm + gió lùa vách; v2 (đêm) thêm dế ngoài sân."""
    dur = 16.0

    def chan(r):
        t = tt(dur)
        fire = norm(fft_filter(r.standard_normal(len(t)), lo=90, hi=500)) * (0.5 + 0.5 * smooth_noise(r, dur, 3))
        cr = crackle(r, dur, 4.5, lo=700, hi=5000)
        wind = norm(fft_filter(r.standard_normal(len(t)), lo=250, hi=1100)) * smooth_noise(r, dur, 0.35, 0.15) ** 2
        out = 0.25 * fire + 0.6 * norm(cr) + 0.35 * wind
        if v == 2:
            cri = np.zeros(len(t))
            f0 = r.uniform(4300, 4800)
            tk = r.uniform(0, 0.4)
            while tk < dur - 0.2:
                for k in range(3):
                    dp = 0.018
                    tp = tt(dp)
                    place(cri, np.sin(2 * np.pi * f0 * tp) * np.sin(np.pi * tp / dp), tk + k * 0.032)
                tk += r.uniform(0.38, 0.6)
            out += 0.22 * fft_filter(cri, lo=3000, hi=6500) * (0.6 + 0.4 * smooth_noise(r, dur, 0.5))
        return out
    return _stereo(rng, chan)


def bamboo_rattle(rng, n=3, start=0.0, spacing=0.035, f=(620, 880)):
    """Nan tre / liếp tre lạch cạch: vài tiếng gõ rỗng nhỏ."""
    out = np.zeros(int(SR * (start + n * spacing * 1.3 + 0.12)))
    for k in range(n):
        x = modal(rng.uniform(*f), [1, 2.4, 4.4], [1, 0.4, 0.15], [0.03, 0.015, 0.008], 0.1, rng)
        place(out, norm(x) * rng.uniform(0.5, 1.0), start + k * spacing * rng.uniform(0.7, 1.3))
    return out


def r_door(rng, v):
    """Cửa nhà {ten}: liếp tre / cửa gỗ cũ 'kẹt' + lạch cạch + bước chân đất nện.
    v1 vào (kẹt lên giọng rồi 2 bước), v2 ra (bước, kẹt xuống giọng, khép 'cộc')."""
    out = np.zeros(int(SR * 0.75))
    if v == 1:
        place(out, norm(creak(rng, 0.32, 45, 95)) * 0.75, 0.0)
        place(out, bamboo_rattle(rng, 3) * 0.4, 0.26)
        place(out, norm(dirt_step(rng)) * 0.85, 0.4)
        place(out, norm(dirt_step(rng)) * 0.7, 0.58)
    else:
        place(out, norm(dirt_step(rng)) * 0.8, 0.0)
        place(out, norm(creak(rng, 0.3, 90, 40, modes=(380, 900, 1500, 2500))) * 0.7, 0.12)
        place(out, norm(dirt_step(rng)) * 0.7, 0.2)
        place(out, norm(wood_block(rng, 330, 0.2)) * 0.55, 0.46)
        place(out, bamboo_rattle(rng, 2) * 0.3, 0.48)
    return fft_filter(out, lo=60, hi=7000)


def r_chest(rng, v):
    """Rương gỗ: v1 mở (bản lề kẹt ngắn + nắp tựa 'cộc' nhẹ), v2 đóng (kẹt ngắn + nắp sập 'cộp' chắc)."""
    out = np.zeros(int(SR * 0.45))
    hinge = (700, 1500, 2300, 3300)
    if v == 1:
        place(out, norm(creak(rng, 0.18, 70, 130, modes=hinge, decay=0.008)) * 0.6, 0.0)
        place(out, norm(wood_block(rng, 520, 0.15)) * 0.45, 0.2)
    else:
        place(out, norm(creak(rng, 0.12, 120, 70, modes=hinge, decay=0.008)) * 0.45, 0.0)
        th = tt(0.12)
        body = norm(fft_filter(noise(0.12, rng), lo=70, hi=420, order=3)) * env_ad(th, 0.002, 0.03)
        place(out, body * 0.9 + norm(wood_block(rng, 280, 0.12)) * 0.6, 0.13)
    return fft_filter(out, lo=60, hi=8000)


def r_fence(rng, v):
    """Đóng cọc rào 'cộc cộc cộc': vồ gỗ nện cọc tre 3 nhát, nhát sau cao + chắc dần (cọc lún xuống)."""
    out = np.zeros(int(SR * 0.85))
    for k, at in enumerate((0.0, 0.26, 0.52)):
        hit = norm(wood_block(rng, 300 * (1 + 0.08 * k), 0.25)) * 0.9
        hit += norm(fft_filter(noise(0.25, rng), lo=60, hi=350, order=3)) * env_ad(tt(0.25), 0.002, 0.03) * 0.7
        place(out, hit * (0.8 + 0.1 * k), at)
    return fft_filter(out, lo=55, hi=7000) + 0.4 * fft_filter(out, lo=250, hi=1500)


def r_basket_drop(rng, v):
    """Bỏ đồ vào / lấy ra thúng bán 'bịch': 'phịch' trầm mềm + nan tre lạo xạo."""
    d = 0.17
    t = tt(d)
    thud = norm(fft_filter(noise(d, rng), lo=90, hi=500, order=3)) * env_ad(t, 0.003, 0.025)
    wick = np.zeros(len(t))
    for _ in range(10 if v == 1 else 14):
        lo = rng.uniform(1300, 3500)
        place(wick, _grain(rng, rng.uniform(0.003, 0.008), lo, lo * 2.2) * rng.uniform(0.3, 1), rng.uniform(0.003, 0.07))
    out = thud + 0.5 * norm(wick)
    return fft_filter(out, lo=70, hi=7500) + 0.4 * fft_filter(out, lo=250, hi=1500)


def r_quest_done(rng, v):
    """Xong nhiệm vụ: con dấu 'cộp' + chiêng 'bùng' + marimba Đô–Mi–Sol đi lên + 'ting' glockenspiel (v2 chiêng cao hơn)."""
    out = np.zeros(int(SR * 2.0))
    th = tt(0.15)
    stamp = norm(fft_filter(noise(0.15, rng), lo=70, hi=450, order=3)) * env_ad(th, 0.002, 0.03)
    stamp += 0.6 * norm(wood_block(rng, 260, 0.15))
    stamp += 0.35 * norm(fft_filter(noise(0.15, rng), lo=900, hi=5000)) * env_ad(th, 0.001, 0.008)
    place(out, stamp * 0.9, 0)
    place(out, norm(gong(rng, 196 if v == 1 else 220, 1.8, glide=-0.02)) * 0.55, 0.03)
    for i, f in enumerate((523.3, 659.3, 784.0)):
        place(out, marimba(rng, f) * 0.6, 0.32 + i * 0.11)
    place(out, glock(rng, 1046.5, 1.0) * 0.35, 0.65)
    place(out, glock(rng, 1568.0, 0.9) * 0.2, 0.7)
    return reverb(out, rt=0.8, mix=0.16, tone=8000, rng=rng)


# ---- UI (gỗ / marimba nhẹ, < 150 ms) ----
def _cut(x, d, fade=0.012):
    n = int(SR * d)
    x = np.concatenate([x, np.zeros(max(0, n - len(x)))])[:n]
    f = int(SR * fade)
    x[-f:] *= np.linspace(1, 0, f)
    return x


def r_ui_click(rng, v):
    """Click nút: gõ gỗ + marimba ngắn (v1 Đô6, v2 Sol5)."""
    f = 1046.5 if v == 1 else 784.0
    x = 0.55 * norm(modal(f * 1.18, [1, 2.57, 4.1], [1, 0.3, 0.1], [0.012, 0.006, 0.004], 0.1, rng))
    x += 0.6 * norm(modal(f, [1, 3.93], [1, 0.15], [0.03, 0.01], 0.1, rng))
    place(x, _grain(rng, 0.003, 2000, 7000) * 0.3, 0)
    return _cut(x, 0.09)


def r_ui_hover(rng, v):
    """Rê chuột vào nút: 'tích' rất khẽ, cao (Đô7)."""
    return _cut(norm(modal(2093.0, [1, 2.76], [1, 0.2], [0.01, 0.005], 0.05, rng)), 0.045, 0.008)


def r_ui_open(rng, v):
    """Mở cửa sổ: giấy điệp 'sột' trượt lên + gõ gỗ nhẹ cuối."""
    d = 0.14
    t = tt(d)
    a = norm(fft_filter(noise(d, rng), lo=1500, hi=4000))
    b = norm(fft_filter(noise(d, rng), lo=2500, hi=7000))
    mix = np.clip(t / 0.09, 0, 1)
    x = 0.6 * ((1 - mix) * a + mix * b) * env_ad(t, 0.05, 0.03)
    place(x, norm(modal(988.0, [1, 2.57, 4.1], [1, 0.3, 0.1], [0.02, 0.008, 0.004], 0.06, rng)) * 0.55, 0.075)
    return _cut(x, d)


def r_ui_close(rng, v):
    """Đóng cửa sổ: gõ gỗ trầm hơn + giấy 'sột' trượt xuống, ngắn."""
    d = 0.12
    t = tt(d)
    a = norm(fft_filter(noise(d, rng), lo=2500, hi=6500))
    b = norm(fft_filter(noise(d, rng), lo=900, hi=2800))
    mix = np.clip(t / 0.07, 0, 1)
    x = 0.55 * ((1 - mix) * a + mix * b) * env_ad(t, 0.01, 0.035)
    place(x, norm(modal(659.3, [1, 2.57, 4.1], [1, 0.3, 0.1], [0.022, 0.009, 0.004], 0.06, rng)) * 0.6, 0.0)
    return _cut(x, d)


def r_ui_error(rng, v):
    """Lỗi / không được: mõ trầm nhỏ 'cộc' (v1 một tiếng, v2 'cộc-cộc' đi xuống)."""
    x = np.zeros(int(SR * 0.15))
    place(x, norm(wood_block(rng, 520, 0.12)) * 0.9, 0)
    if v == 2:
        place(x, norm(wood_block(rng, 400, 0.1)) * 0.8, 0.07)
    return _cut(fft_filter(x, lo=200, hi=6000), 0.15 if v == 2 else 0.12)


def r_ui_tick(rng, v):
    """Đổi ô hotbar: tick gỗ nhỏ, khô."""
    x = norm(modal(1650.0, [1, 2.57], [1, 0.3], [0.007, 0.004], 0.05, rng))
    place(x, _grain(rng, 0.002, 2500, 8000) * 0.3, 0)
    return _cut(x, 0.05, 0.008)


def r_ui_pick(rng, v):
    """Kéo thả món: v1 nhấc 'pụt' đi lên, v2 thả 'bụp' đi xuống."""
    d = 0.08
    t = tt(d)
    f = (420 * (1.6 ** (t / d))) if v == 1 else (640 * (0.6 ** (t / d)))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_ad(t, 0.004, 0.025)
    place(x, _grain(rng, 0.004, 900, 3500) * 0.25, 0)
    return _cut(x, d)

# ---- Gà gáy "lầy" theo ngày (T-025 vòng 2, góp ý người dùng) ----
ROOSTER_FORM = ((850, 1500, 3000), (1000, 1650, 3200), (700, 1300, 2800))


def crow_syl(rng, d, f_pts, amp_pts, rough=0.3, rough_hz=55.0, breathy=0.25, sub=0.0,
             form=ROOSTER_FORM, vib=0.0, vib_hz=6.0):
    """Một âm tiết gà gáy: giọng formant sáng (12 bồi âm) + rè (AM ~55 Hz) + bán điều hòa (sub, giọng khàn vỡ)."""
    t = tt(d)
    x = vox(rng, d, f_pts, [(0, form[0]), (d * 0.4, form[1]), (d, form[2])], amp_pts,
            breathy=breathy, nharm=12, jitter=0.03)
    if vib:
        x *= 1 + vib * np.sin(2 * np.pi * vib_hz * t)
    if sub:
        ft, fv = zip(*f_pts)
        f0 = np.interp(t, ft, fv)
        x *= 1 + sub * np.sin(np.pi * np.cumsum(f0) / SR)  # nửa tần số -> tiếng vỡ đôi, khàn
    x *= 1 + rough * np.sin(2 * np.pi * rough_hz * t + rng.uniform(0, 6.28))
    return x


def _syl_amp(d, a=0.02, r=0.05, level=1.0):
    return [(0, 0), (a, level), (max(a, d - r), level * 0.9), (d, 0)]


def chicken_cough(rng, strength=1.0):
    """Gà ho 'khục': hơi bật mạnh (nhiễu dải giữa) + tiếng rè ngắn tụt giọng."""
    d = 0.11
    t = tt(d)
    burst = norm(fft_filter(noise(d, rng), lo=500, hi=4000)) * env_ad(t, 0.002, 0.03)
    v = crow_syl(rng, 0.07, [(0, 480), (0.07, 300)], _syl_amp(0.07, 0.005, 0.03), rough=0.6, rough_hz=35, breathy=0.6, sub=0.5)
    out = 0.7 * burst
    place(out, 0.8 * norm(v), 0.008)
    return out * strength


def choke(rng):
    """'Ặc': tắc họng — tiếng rè bị bóp, cao độ tụt gấp, tắt cụt."""
    d = 0.075
    v = crow_syl(rng, d, [(0, 760), (d, 360)], [(0, 0), (0.004, 1), (d - 0.008, 0.8), (d, 0)],
                 rough=0.7, rough_hz=30, breathy=0.3, sub=0.7, form=((600, 1200, 2600),) * 3)
    out = norm(v)
    place(out, _grain(rng, 0.004, 800, 4000) * 0.5, d - 0.006)  # tiếng 'cạch' họng đóng
    return out


def _crow_normal(rng, scale_t=1.0, scale_f=1.0, rough=0.3, level=1.0):
    """Câu gáy chuẩn 'ò – ó – o – oooo' (~1.55 s)."""
    s, k = scale_t, scale_f
    out = np.zeros(int(SR * 1.6 * s) + SR // 10)
    parts = [(0.00, 0.13, [(0, 520), (0.13, 560)], 0.75),
             (0.17, 0.20, [(0, 650), (0.2, 780)], 0.9),
             (0.40, 0.14, [(0, 760), (0.14, 800)], 0.8)]
    for at, d, fp, lv in parts:
        dd = d * s
        place(out, crow_syl(rng, dd, [(a * s, f * k) for a, f in fp], _syl_amp(dd, level=lv * level), rough=rough), at * s)
    d4 = 0.95 * s
    place(out, crow_syl(rng, d4, [(0, 820 * k), (0.3 * s, 900 * k), (0.7 * s, 860 * k), (d4, 560 * k)],
                        [(0, 0), (0.02, level), (0.7 * s, 0.9 * level), (d4, 0)], rough=rough, vib=0.04), 0.58 * s)
    return out


def _sparrows(rng, total, n):
    out = np.zeros(int(SR * total))
    for _ in range(n):
        at = rng.uniform(0.0, 0.55 * total)  # chim chỉ hót trong lúc gà gáy, không kéo dài file
        for k in range(int(rng.integers(2, 4))):
            dch = rng.uniform(0.035, 0.055)
            tc = tt(dch)
            f = rng.uniform(3200, 4800) * (1 + rng.choice([-1, 1]) * 0.25 * tc / dch)
            place(out, np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tc / dch) ** 2 * rng.uniform(0.1, 0.22),
                  at + k * rng.uniform(0.06, 0.09))
    return out


ROOSTER_KINDS = {1: "binh-thuong", 2: "tac-hong", 3: "khan", 4: "vo-giong", 5: "ngai-ngu", 6: "gay-lai"}


def r_rooster_fun(rng, v):
    """Bộ gà gáy theo ngày: v1 bình thường, v2 tắc họng giữa chừng rồi ho, v3 khàn cổ hụt hơi,
    v4 vỡ giọng vọt cao, v5 ngái ngủ chậm rì rồi ngáp, v6 gáy hỏng phải gáy lại. Vang xa nhẹ + chim sẻ khẽ."""
    if v == 1:
        crow = _crow_normal(rng)
    elif v == 2:
        crow = np.zeros(int(SR * 2.1))
        part = _crow_normal(rng)[: int(SR * 0.58)]
        place(crow, part, 0)
        d = 0.33  # bắt đầu kéo dài, rướn lên rồi tắc cụt
        place(crow, crow_syl(rng, d, [(0, 820), (d, 960)], [(0, 0), (0.02, 1), (d - 0.006, 1), (d, 0)], rough=0.35), 0.58)
        place(crow, choke(rng) * 0.9, 1.05)
        place(crow, chicken_cough(rng, 0.85), 1.38)
        place(crow, chicken_cough(rng, 0.7), 1.62)
        place(crow, chicken_cough(rng, 0.4), 1.84)
    elif v == 3:
        k, s = 0.82, 1.1
        crow = np.zeros(int(SR * 2.3))
        for at, d, fp, lv in ((0.0, 0.14, [(0, 520), (0.14, 540)], 0.7), (0.19, 0.22, [(0, 620), (0.22, 700)], 0.8),
                              (0.45, 0.15, [(0, 690), (0.15, 700)], 0.7)):
            place(crow, crow_syl(rng, d, [(a, f * k) for a, f in fp], _syl_amp(d, level=lv), rough=0.65, rough_hz=38,
                                 breathy=0.8, sub=0.55), at)
        d4 = 1.15
        amp = [(0, 0), (0.03, 0.9), (0.25, 0.8), (0.3, 0.15), (0.34, 0.75), (0.62, 0.6), (0.66, 0.1), (0.7, 0.5),
               (1.0, 0.3), (d4, 0)]  # hụt hơi: hai chỗ đứt tiếng
        place(crow, crow_syl(rng, d4, [(0, 700 * k), (0.25, 720 * k), (0.8, 520 * k), (d4, 380 * k)], amp,
                             rough=0.75, rough_hz=36, breathy=1.0, sub=0.7), 0.64 * s)
        air = norm(fft_filter(noise(0.3, rng), lo=900, hi=4500)) * env_ad(tt(0.3), 0.04, 0.09) * 0.35
        place(crow, air, 0.64 * s + d4 - 0.05)  # 'khè' hết hơi
    elif v == 4:
        crow = np.zeros(int(SR * 1.9))
        place(crow, _crow_normal(rng)[: int(SR * 0.58)], 0)
        d4 = 1.05
        fp = [(0, 820), (0.14, 880), (0.16, 1700), (0.3, 1800), (0.55, 1650), (0.58, 640), (0.8, 560), (d4, 430)]
        hi_form = ((1500, 2300, 3600),) * 3
        a = crow_syl(rng, d4, fp, [(0, 0), (0.02, 1), (0.9, 0.8), (d4, 0)], rough=0.2, vib=0.12, vib_hz=9)
        b = crow_syl(rng, d4, fp, [(0, 0), (0.02, 1), (0.9, 0.8), (d4, 0)], rough=0.2, form=hi_form, vib=0.12, vib_hz=9)
        t = tt(d4)
        w = ((t > 0.155) & (t < 0.575)).astype(float)
        w = np.convolve(w, np.ones(200) / 200, mode="same")
        place(crow, norm(a) * (1 - w) + 0.85 * norm(b) * w, 0.58)
    elif v == 5:
        crow = np.zeros(int(SR * 2.8))
        s, k = 1.45, 0.85
        for at, d, fp, lv in ((0.0, 0.13, [(0, 520), (0.13, 540)], 0.5), (0.17, 0.2, [(0, 620), (0.2, 690)], 0.6),
                              (0.4, 0.14, [(0, 680), (0.14, 690)], 0.55)):
            dd = d * s
            place(crow, crow_syl(rng, dd, [(x * s, f * k) for x, f in fp], _syl_amp(dd, 0.05, 0.08, lv), rough=0.25,
                                 breathy=0.5), at * s)
        d4 = 1.5
        place(crow, crow_syl(rng, d4, [(0, 700 * k), (0.35, 730 * k), (0.95, 560 * k), (d4, 280 * k)],
                             [(0, 0), (0.06, 0.8), (0.8, 0.75), (1.2, 0.5), (d4, 0)], rough=0.3, breathy=0.7,
                             form=((850, 1500, 3000), (900, 1400, 2900), (320, 800, 2300))), 0.58 * s)
    else:
        crow = np.zeros(int(SR * 2.95))
        place(crow, crow_syl(rng, 0.13, [(0, 520), (0.13, 560)], _syl_amp(0.13, level=0.75)), 0.0)
        place(crow, crow_syl(rng, 0.11, [(0, 650), (0.11, 720)], [(0, 0), (0.02, 0.9), (0.105, 0.9), (0.11, 0)]), 0.16)
        place(crow, choke(rng) * 0.8, 0.3)
        place(crow, chicken_cough(rng, 0.5), 0.5)
        place(crow, _crow_normal(rng, scale_t=0.92, level=1.0), 1.0)  # lấy hơi, gáy lại đủ câu
    crow = np.tanh(2.2 * norm(crow)) / np.tanh(2.2)
    crow = fft_filter(crow, lo=380, hi=6500)
    crow = reverb(crow * 0.8, rt=0.8, mix=0.22, tone=5000, rng=rng)
    out = crow + _sparrows(rng, len(crow) / SR, 3)[: len(crow)] * np.abs(crow).max()
    return out


RECIPES = {
    "sow_seed": (r_sow_seed, "sfx-gieo-hat", "Gieo hạt 'lách tách' + tay vùi đất (v1–v4 khác tính cách, T-003)"),
    "harvest_pop": (r_harvest_pop, "sfx-hai-cay", "Hái cây 'pop' có cao độ + rễ bật + đất rơi (v1–v4, T-003)"),
    "hoe": (r_hoe, "sfx-cuoc-dat", "Cuốc đất 'bộp' (bản cũ, bước 2.3)"),
    "hoe_soil": (r_hoe_soil, "sfx-cuoc-dat-soil", "Cuốc xắn đất ẩm 'phập' + đất vụn (v1–v4 khác tính cách)"),
    "coin": (r_coin, "sfx-nhat-xu", "Nhặt xu 'leng keng'"),
    "water": (r_water, "sfx-tuoi-nuoc", "Tưới nước 'róc rách'"),
    "levelup": (r_levelup, "sfx-len-level", "Lên level: trống + sáo (v1) / kèn bầu (v2)"),
    "frown": (r_frown, "sfx-bo-vo-nhan", "Bố vợ nhăn: trống trầm (v1) / mõ + đàn bầu luyến xuống (v2)"),
    "damn": (r_damn, "meme-daaamn-trong", "Meme zoom: 3 tiếng trống to dần"),
    "oidoioi": (r_oidoioi, "meme-oi-doi-oi-chum-choe", "Meme ối dồi ôi: chũm chọe + chiêng"),
    "levelup_bright": (r_levelup_bright, "sfx-len-level-tuoi", "Lên level tươi: marimba + glockenspiel + vỗ tay"),
    "coin_bright": (r_coin_bright, "sfx-nhat-xu-tuoi", "Nhặt xu tươi: xu + 'ting' glockenspiel đi lên"),
    "grumble": (r_grumble, "voice-cau-nhau", "Càu nhàu: 'ú ớ' (v1) / 'hừm' (v2)"),
    # T-025 Lô 1 Vườn
    "hoe_finish": (r_hoe_finish, "sfx-cuoc-chot", "Nhát cuốc chốt xong ô: phập đầy + đất vỡ tung (v3 thêm marimba trầm)"),
    "wither": (r_wither, "sfx-cay-heo", "Cây héo 'phù': hơi xì + nốt tụt mềm + lá rũ"),
    "clear_wither": (r_clear_wither, "sfx-don-cay-heo", "Dọn cây héo: rắc + lá khô sột soạt + vứt"),
    "eat": (r_eat, "sfx-an-nhom-nhoam", "Ăn 'nhồm nhoàm' (giọng mũi + chóp; v2 giòn)"),
    "stomach": (r_stomach, "sfx-bung-reo", "Bụng réo 'ọc ọc'"),
    "yawn": (r_yawn, "voice-ngap", "Ngáp dài 'hà-ááá-ồm'"),
    "snore": (r_snore, "voice-ngay", "Ngáy 'khò… phù…' 2 nhịp, lặp được (v2 có huýt)"),
    "rooster": (r_rooster, "sfx-ga-gay", "Gà gáy 6h (v1 gần, v2 xa + chim, v3 chỉ chim)"),
    "rooster_fun": (r_rooster_fun, "sfx-ga-gay-kieu", "Gà gáy lầy theo ngày: v1 bình thường, v2 tắc họng, v3 khàn, v4 vỡ giọng, v5 ngái ngủ, v6 gáy lại"),
    "cook": (r_cook, "sfx-nau-bep", "Nấu bếp rơm: lửa + lách tách + xèo"),
    "count_tick": (r_count_tick, "sfx-dem-tien", "Đếm tiền 'tách' (v1/v2 xu, v3/v4 bàn tính)"),
    "thunder": (r_thunder, "sfx-sam-xa", "Sấm xa ì ầm (v2 có tiếng rạch đầu)"),
    "rain": (r_rain, "amb-mua", "Nền mưa trên lá + mái rạ (stereo ~22 s, chưa loop)"),
    "indoor": (r_indoor, "amb-trong-nha", "Nền trong nhà: bếp rơm + gió lùa (v2 đêm thêm dế; stereo ~16 s)"),
    "footstep": (r_footstep, "sfx-buoc", "Bước chân: v1–3 đất nện, v4–6 cỏ"),
    "door": (r_door, "sfx-cua-nha", "Cửa nhà: v1 vào (kẹt lên + bước), v2 ra (bước + kẹt xuống + khép)"),
    "chest": (r_chest, "sfx-ruong", "Rương gỗ: v1 mở, v2 đóng"),
    "fence": (r_fence, "sfx-dong-coc", "Đóng cọc rào 'cộc cộc cộc'"),
    "basket_drop": (r_basket_drop, "sfx-thung-bich", "Bỏ đồ vào thúng bán 'bịch'"),
    "quest_done": (r_quest_done, "jng-xong-nhiem-vu", "Xong nhiệm vụ: dấu cộp + chiêng + marimba Đô–Mi–Sol"),
    "ui_click": (r_ui_click, "ui-click", "UI click: gỗ + marimba (v1 Đô6, v2 Sol5)"),
    "ui_hover": (r_ui_hover, "ui-hover", "UI hover: tích rất khẽ"),
    "ui_open": (r_ui_open, "ui-mo", "UI mở cửa sổ: giấy sột + gõ gỗ"),
    "ui_close": (r_ui_close, "ui-dong", "UI đóng cửa sổ: gõ gỗ + giấy"),
    "ui_error": (r_ui_error, "ui-loi", "UI lỗi: mõ cộc (v2 cộc-cộc)"),
    "ui_tick": (r_ui_tick, "ui-doi-o", "UI đổi ô hotbar: tick gỗ"),
    "ui_pick": (r_ui_pick, "ui-keo-tha", "UI kéo thả: v1 nhấc, v2 thả"),
}
# Peak mặc định riêng (dBFS): giọng đi kèm bong bóng chữ nhỏ hơn SFX gameplay; UI −5; nền (AMB) chuẩn hóa lại bằng loop --rms
PEAKS = {"grumble": -6.0, "yawn": -6.0, "snore": -6.0,
         "ui_click": -5.0, "ui_open": -5.0, "ui_close": -5.0, "ui_error": -5.0, "ui_tick": -6.0,
         "ui_pick": -6.0, "ui_hover": -9.0}


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
            print(f"{k:14} {p:28} {d}")
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
