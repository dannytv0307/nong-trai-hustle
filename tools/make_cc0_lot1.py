"""T-025 vòng 3 (D-039): làm lại các âm "thật" của Lô 1 từ bản ghi CC0 / Public domain (Wikimedia Commons).

Bản gốc + trang nguồn + source.json (URL, tác giả, giấy phép) ở audio-source/raw/<ID>/cc0/ (đã giải mã .wav 44.1 kHz).
Nguồn đầy đủ: docs/audio/credits.md.  Chỉ numpy (không thêm thư viện).

Chạy:  .venv/Scripts/python tools/make_cc0_lot1.py [tên ...]
-> ghi thẳng file game web/client/public/assets/audio/sfx/<tên>.wav (mono; nền AMB stereo), chuẩn hóa theo To A
   như bảng trong docs/audio/prompts/AUD-LO1-SFX.md. Bản tổng hợp cũ đã chép sang audio-source/raw/<ID>/tong-hop-cu/.
"""
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from audio_tools import limit_to_rms, trim  # noqa: E402
from common import ROOT, read_wav, write_wav  # noqa: E402
from gen_folk_sfx import fft_filter, reverb  # noqa: E402

SR = 44100
RAW = ROOT / "audio-source" / "raw"
GAME = ROOT / "web" / "client" / "public" / "assets" / "audio" / "sfx"


def src(aid, name):
    s, sr = read_wav(RAW / aid / "cc0" / name)
    assert sr == SR, (name, sr)
    return s.mean(axis=1).astype(np.float64) if s.shape[1] > 1 else s[:, 0].astype(np.float64)


def src_st(aid, name):
    s, sr = read_wav(RAW / aid / "cc0" / name)
    assert sr == SR
    return np.repeat(s, 2, axis=1) if s.shape[1] == 1 else s.astype(np.float64)


def cut(x, a, b, fin=0.01, fout=0.03):
    y = x[int(a * SR): int(b * SR)].copy()
    i, o = int(fin * SR), int(fout * SR)
    if i:
        y[:i] *= np.linspace(0, 1, i)[:, None] if y.ndim == 2 else np.linspace(0, 1, i)
    if o:
        y[-o:] *= np.linspace(1, 0, o)[:, None] if y.ndim == 2 else np.linspace(1, 0, o)
    return y


def gate(x, floor_db=-50, ratio=0.15, att=0.003, rel=0.06):
    """Cổng nhiễu mềm: chỗ nhỏ hơn floor (so với đỉnh) bị hạ còn `ratio` — bỏ xì nền giữa các tiếng."""
    m = np.abs(x).max() + 1e-12
    env = np.abs(x) / m
    a, r = np.exp(-1 / (SR * att)), np.exp(-1 / (SR * rel))
    e, out = 0.0, np.empty_like(env)
    for i, v in enumerate(env):
        e = a * e + (1 - a) * v if v > e else r * e + (1 - r) * v
        out[i] = e
    g = np.where(out > 10 ** (floor_db / 20), 1.0, ratio)
    g = np.convolve(g, np.ones(int(SR * 0.01)) / int(SR * 0.01), mode="same")
    return x * g


def onsets(x, thr_db=-12, min_gap=0.15, win=0.01):
    """Thời điểm các tiếng (ví dụ nhát nhai) vượt ngưỡng so với đỉnh."""
    w = int(SR * win)
    e = np.sqrt(np.convolve(x ** 2, np.ones(w) / w, mode="same"))
    th = e.max() * 10 ** (thr_db / 20)
    res, last = [], -1e9
    for i in np.where((e[1:] > th) & (e[:-1] <= th))[0]:
        if (i - last) / SR >= min_gap:
            res.append(i / SR)
            last = i
    return res


def a_weight(f):
    f2 = f ** 2
    ra = (12194 ** 2 * f2 ** 2) / ((f2 + 20.6 ** 2) * np.sqrt((f2 + 107.7 ** 2) * (f2 + 737.9 ** 2)) * (f2 + 12194 ** 2))
    return ra / 0.7943


def toa(m):
    X = np.fft.rfft(m)
    f = np.fft.rfftfreq(len(m), 1 / SR)
    ya = np.fft.irfft(X * a_weight(np.maximum(f, 1)), len(m))
    w = int(SR * 0.1)
    return 10 * np.log10(np.convolve(ya ** 2, np.ones(w) / w, mode="valid").max() + 1e-18)


def save_toa(name, x, target, ceil=-1.0):
    """Mono: chuẩn To A (limiter khi chạm trần)."""
    s = trim(x[:, None], SR)
    for _ in range(6):
        m = s[:, 0]
        rms = 20 * np.log10(np.sqrt(np.mean(m ** 2)))
        need = rms + target - toa(m)
        if np.abs(m).max() * 10 ** ((need - rms) / 20) <= 10 ** (ceil / 20):
            s = s * 10 ** ((need - rms) / 20)
            break
        s = limit_to_rms(s, SR, need, ceiling_db=ceil)
    else:
        s = limit_to_rms(s, SR, 20 * np.log10(np.sqrt(np.mean(s[:, 0] ** 2))) + target - toa(s[:, 0]), ceiling_db=ceil)
    n = int(SR * 0.01)
    s[-n:] *= np.linspace(1, 0, n)[:, None]
    write_wav(GAME / f"{name}.wav", s, SR)
    m = s[:, 0]
    print(f"{name:22} {len(m) / SR:5.2f}s peak {20 * np.log10(np.abs(m).max()):5.1f} "
          f"RMS {20 * np.log10(np.sqrt(np.mean(m ** 2))):5.1f} ToA {toa(m):5.1f}")


def save_loop(name, x, rms_db, xf=2.0):
    """Stereo loop: crossfade đuôi vào đầu, chuẩn RMS."""
    n = int(SR * xf)
    ramp = np.linspace(0, 1, n)[:, None]
    y = np.concatenate([x[:n] * ramp + x[-n:] * (1 - ramp), x[n:-n]])
    y = limit_to_rms(y, SR, rms_db, ceiling_db=-3.0, circular=True)  # lửa / giọt mưa có đỉnh nhọn: limiter vòng tròn
    write_wav(GAME / f"{name}.wav", y, SR)
    print(f"{name:22} {len(y) / SR:5.2f}s stereo loop peak {20 * np.log10(np.abs(y).max()):5.1f} RMS {rms_db}")


# ---------------- từng âm ----------------
def do_ngap():
    """Ngáp: Yawning twice (ezwa, PD) — tiếng ngáp thứ hai: hít vào + 'háááá' + thở ra (2.9–5.1 s)."""
    x = src("AUD-SFX-107", "Yawning_twice.wav")
    y = gate(fft_filter(cut(x, 2.88, 5.15, 0.02, 0.15), lo=90), floor_db=-38, ratio=0.3)
    save_toa("voice-ngap", y, -15, ceil=-6)


def do_ngay():
    """Ngáy: Joseph Sardin - Ronflements (CC0) — 2 tiếng ngáy liền (0.15–1.8 s, 4.25–5.8 s) cách 0.6 s; đầu/cuối lặng -> lặp được."""
    x = fft_filter(src("AUD-SFX-108", "Joseph_Sardin_-_Ronflements.wav"), lo=60)
    a = cut(x, 0.15, 1.85, 0.05, 0.12)
    b = cut(x, 4.25, 5.85, 0.05, 0.12)
    y = np.concatenate([np.zeros(int(0.05 * SR)), a, np.zeros(int(0.6 * SR)), b, np.zeros(int(0.3 * SR))])
    save_toa("voice-ngay", y, -17, ceil=-3)


def chew_set(x, starts, spacing, length=0.2):
    out = np.zeros(int(SR * (spacing * len(starts) + length + 0.05)))
    for k, t in enumerate(starts):
        c = cut(x, max(0, t - 0.015), t + length, 0.004, 0.05)
        i = int(SR * k * spacing)
        out[i: i + len(c)] += c * (1.0 if k != 1 else 0.85)
    return out


def do_an():
    """Ăn 'nhồm nhoàm': ghép 3 nhát nhai thật sát nhau (nhịp ~0.19 s).
    Nhai ướt chóp chép từ Chewing gum mouth open (ezwa, PD) + lớp 'rộp' từ Crunching munching grinding (stephan, PD); v1/v2 khác nhát."""
    x = gate(fft_filter(src("AUD-SFX-105", "Chewing_gum_mouth_open.wav"), lo=220, hi=9000, order=4), floor_db=-28, ratio=0.1)
    on = onsets(x, thr_db=-16, min_gap=0.25)
    v1 = chew_set(x, on[0:3], 0.19)
    v2 = chew_set(x, on[3:6], 0.2)
    cr = gate(fft_filter(src("AUD-SFX-105", "Crunching_munching_grinding.wav"), lo=220, hi=9000, order=4), floor_db=-24, ratio=0.1)
    con = onsets(cr, thr_db=-10, min_gap=0.25)
    def layer(chew, crunch, k=0.55):  # cả 2 bản đều có lớp 'rộp' để xen kẽ không lệch chất
        n = min(len(chew), len(crunch))
        return chew[:n] / (np.abs(chew).max() + 1e-9) + k * crunch[:n] / (np.abs(crunch).max() + 1e-9)
    v1 = layer(v1, chew_set(cr, con[3:6], 0.19))
    v2 = layer(v2, chew_set(cr, con[0:3], 0.2))
    save_toa("an-nhom-nhoam-1", v1, -14)
    save_toa("an-nhom-nhoam-2", v2, -14)


def do_sam():
    """Sấm xa: v1 'Rain and thunder' (User:Caesar, PD) 2.6–8.0 s; v2 'Thunder and rain on a veranda' (ezwa, PD) 6.5–12.5 s.
    Có mưa nền lẫn (khớp ngày mưa). Fade-in 0.15 s, fade-out dài."""
    a = fft_filter(src("AUD-SFX-121", "Rain_and_thunder.wav"), lo=35)
    b = fft_filter(src("AUD-SFX-121", "Thunder_and_rain_on_a_v.wav"), lo=35)
    save_toa("sam-xa-1", cut(a, 2.6, 7.6, 0.15, 1.5), -17)
    save_toa("sam-xa-2", cut(b, 6.6, 12.0, 0.15, 1.5), -17)


def do_mua():
    """Nền mưa: 'Rain on a veranda and thunder' (ezwa, PD) 0–13 s (đoạn đều, chưa có sấm) -> loop 11 s, stereo giả (lệch 0.4 s)."""
    x = fft_filter(src("AUD-AMB-001", "Rain_on_a_veranda_and_t.wav"), lo=150)
    seg = x[: int(13 * SR)]
    d = int(0.4 * SR)
    st = np.stack([seg[d:], seg[:-d]], axis=1)
    save_loop("amb-mua", st, -30)


def do_bep():
    """Bếp rơm: 'Dry grass burning in open fireplace' (ezwa, PD). Nấu = 1.5 s rơm bùng lên (fade-in) + lớp xèo tổng hợp cũ khẽ;
    nền trong nhà = 14 s lửa thật lách tách + lớp gió / dế tổng hợp cũ nhỏ."""
    x = fft_filter(src("AUD-SFX-110", "Dry_grass_burning_in_open_fireplace.wav"), lo=70)
    w = int(1.5 * SR)
    e = np.convolve(np.abs(fft_filter(x, lo=1500)), np.ones(w), mode="valid")
    i = int(np.argmax(e[: len(x) - w]))
    seg = fft_filter(x[i: i + w], lo=150, hi=8000, order=4)
    t = np.arange(w) / SR
    seg *= np.clip(t / 0.18, 0.25, 1) * np.clip((1.5 - t) / 0.4, 0, 1)
    old, _ = read_wav(RAW / "AUD-SFX-110" / "tong-hop-cu" / "nau-bep.wav")
    old = old[:, 0][: w]
    sizzle = fft_filter(np.pad(old, (0, w - len(old))), lo=2800)
    mix = seg / np.abs(seg).max() + 0.3 * sizzle / (np.abs(sizzle).max() + 1e-9)
    save_toa("nau-bep", mix, -16)
    for name in ("amb-trong-nha", "amb-trong-nha-dem"):
        old_st, _ = read_wav(RAW / "AUD-AMB-011" / "tong-hop-cu" / f"{name}.wav")
        n = int(16 * SR)
        f = fft_filter(x[int(4 * SR): int(4 * SR) + n], lo=120, hi=7000)  # nền: bớt xì cao + ù trầm
        d = int(0.3 * SR)
        fire = np.stack([f[d:], f[:-d]], axis=1)
        fire = fire / np.sqrt(np.mean(fire ** 2))
        o = old_st[: len(fire)]
        o = np.pad(o, ((0, len(fire) - len(o)), (0, 0)), mode="wrap") / np.sqrt(np.mean(old_st ** 2))
        save_loop(name, fire + 0.5 * o, -32)


def varispeed(x, rate):
    """Phát nhanh / chậm như băng (đổi cả cao độ lẫn độ dài)."""
    if rate > 1.05:
        x = fft_filter(x, hi=SR / 2 / rate * 0.9, order=4)
    return np.interp(np.arange(0, len(x) - 1, rate), np.arange(len(x)), x)


def put(buf, y, at):
    i = int(at * SR)
    e = min(len(buf), i + len(y))
    buf[i:e] += y[: e - i]


def do_cua():
    """Cửa nhà + rương: 'Squeaky door' (leonmire, PD) — tiếng kẹt mở 4.6–5.15 s, kẹt khép + sập 6.55–7.3 s.
    Bước chân: dùng buoc-dat-1/2 (tổng hợp, AUD-SFX-111). Rương: cùng bản ghi, phát nhanh ×1.3 (bản lề nhỏ, nắp nhẹ)."""
    x = gate(fft_filter(src("AUD-SFX-115", "Squeaky_door.wav"), lo=120, hi=9000), floor_db=-30, ratio=0.2)
    creak_open = cut(x, 4.6, 5.15, 0.03, 0.08)
    close = cut(x, 6.55, 7.32, 0.03, 0.06)  # kẹt khép + 'cạch' sập (6.98 s)
    st = [read_wav(GAME / f"buoc-dat-{k}.wav")[0][:, 0] for k in (1, 2)]
    pk = np.abs(creak_open).max()
    vao = np.zeros(int(0.95 * SR))
    put(vao, creak_open, 0)
    put(vao, st[0] / np.abs(st[0]).max() * pk * 0.7, 0.5)
    put(vao, st[1] / np.abs(st[1]).max() * pk * 0.6, 0.68)
    ra = np.zeros(int(1.05 * SR))
    put(ra, st[0] / np.abs(st[0]).max() * pk * 0.7, 0.0)
    put(ra, st[1] / np.abs(st[1]).max() * pk * 0.6, 0.17)
    put(ra, close, 0.25)
    save_toa("cua-nha-vao", vao, -15.5)
    save_toa("cua-nha-ra", ra, -15.5)
    save_toa("ruong-mo", varispeed(cut(x, 4.75, 5.1, 0.02, 0.06), 1.3), -16)
    save_toa("ruong-dong", varispeed(cut(x, 6.8, 7.25, 0.02, 0.05), 1.3), -16)


JOBS = {"ngap": do_ngap, "ngay": do_ngay, "an": do_an, "sam": do_sam, "mua": do_mua, "bep": do_bep, "cua": do_cua}

if __name__ == "__main__":
    for k in (sys.argv[1:] or JOBS):
        JOBS[k]()
