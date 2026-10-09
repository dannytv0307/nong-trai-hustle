"""Hậu kỳ âm thanh (WAV) cho game.

Lệnh:
  info       Thông tin: độ dài, kênh, sample rate, peak, RMS
  process    Cắt lặng đầu/cuối, chuyển mono, fade, chuẩn hóa -> file mới
  loop       Làm nhạc lặp liền mạch (crossfade đuôi vào đầu)

Ví dụ:
  python tools/audio_tools.py info audio-source/raw/AUD-MUS-001/*.wav
  python tools/audio_tools.py process in.wav game/Assets/Audio/SFX/jump.wav --mono --trim --peak -1
  python tools/audio_tools.py process in.wav out.wav --rms -18      # nhạc: chuẩn hóa theo độ to trung bình
  python tools/audio_tools.py loop in.wav web/client/public/assets/audio/music/vuon.wav --crossfade 2 --rms -18 --limit

--limit: nâng tới đúng RMS mục tiêu rồi dùng limiter (nhìn trước 5 ms, nhả 80 ms) giữ peak <= -1 dBFS,
thay vì hạ cả bài xuống khi peak vượt. Với `loop`, limiter chạy vòng tròn để chỗ nối vẫn liền.
Lưu ý: chỗ nối loop không căn theo phách — nghe đoạn cuối -> đầu để kiểm tra hụt nhịp.
"""
import argparse
import glob

import numpy as np

from common import db, read_wav, write_wav


def info(path):
    s, sr = read_wav(path)
    peak = np.abs(s).max()
    rms = np.sqrt(np.mean(s ** 2))
    print(f"{path}: {len(s) / sr:.2f}s, {s.shape[1]}ch, {sr}Hz, peak {db(peak):.1f} dBFS, RMS {db(rms):.1f} dBFS")


def trim(s, sr, thresh_db=-50, keep=0.005):
    level = np.abs(s).max(axis=1)
    idx = np.where(level > 10 ** (thresh_db / 20))[0]
    if not len(idx):
        return s
    pad = int(sr * keep)
    return s[max(0, idx[0] - pad): idx[-1] + pad + 1]


def fades(s, sr, fin=0.005, fout=0.01):
    s = s.copy()
    a, b = min(int(sr * fin), len(s) // 2), min(int(sr * fout), len(s) // 2)
    if a:
        s[:a] *= np.linspace(0, 1, a)[:, None]
    if b:
        s[-b:] *= np.linspace(1, 0, b)[:, None]
    return s


def normalize(s, peak_db=None, rms_db=None):
    if rms_db is not None:
        s = s * (10 ** (rms_db / 20) / max(np.sqrt(np.mean(s ** 2)), 1e-9))
        # Không để vượt -1 dBFS
        limit = 10 ** (-1 / 20)
        if np.abs(s).max() > limit:
            s = s * (limit / np.abs(s).max())
    elif peak_db is not None:
        s = s * (10 ** (peak_db / 20) / max(np.abs(s).max(), 1e-9))
    return s


def limit_to_rms(s, sr, rms_db, ceiling_db=-1.0, circular=False, passes=3):
    """Nâng tới RMS mục tiêu, limiter giữ peak <= ceiling. circular=True: tính bao đầu-cuối (cho loop)."""
    from numpy.lib.stride_tricks import sliding_window_view
    ceil = 10 ** (ceiling_db / 20)
    la, a = int(sr * 0.005), np.exp(-1 / (sr * 0.08))
    for _ in range(passes):
        s = s * (10 ** (rms_db / 20) / max(np.sqrt(np.mean(s ** 2)), 1e-9))
        pk = np.abs(s).max(axis=1)
        pad = int(sr * 0.5) if circular else 0
        if pad:
            pk = np.concatenate([pk[-pad:], pk, pk[:pad]])
        need = np.minimum(1.0, ceil / np.maximum(pk, 1e-9))
        g = sliding_window_view(np.pad(need, (la, la), mode="edge"), 2 * la + 1).min(axis=1)
        out, y = np.empty_like(g), 1.0
        for i, v in enumerate(g):
            y = v if v < y else a * y + (1 - a) * v
            out[i] = y
        out = np.minimum(out, g)
        s = s * (out[pad:len(out) - pad] if pad else out)[:, None]
    return np.clip(s, -ceil, ceil)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    p = sub.add_parser("info")
    p.add_argument("files", nargs="+")
    p = sub.add_parser("process")
    p.add_argument("src")
    p.add_argument("dst")
    p.add_argument("--mono", action="store_true")
    p.add_argument("--trim", action="store_true")
    p.add_argument("--fade-in", type=float, default=0.005)
    p.add_argument("--fade-out", type=float, default=0.01)
    p.add_argument("--peak", type=float, help="Chuẩn hóa peak (dBFS), vd. -1")
    p.add_argument("--rms", type=float, help="Chuẩn hóa RMS (dBFS), vd. -18 cho nhạc")
    p.add_argument("--limit", action="store_true", help="Đạt đúng --rms bằng limiter (peak <= -1)")
    p = sub.add_parser("loop")
    p.add_argument("src")
    p.add_argument("dst")
    p.add_argument("--crossfade", type=float, default=2.0, help="Giây")
    p.add_argument("--rms", type=float, default=-18)
    p.add_argument("--limit", action="store_true", help="Đạt đúng --rms bằng limiter vòng tròn (peak <= -1)")
    a = ap.parse_args()

    if a.cmd == "info":
        for pattern in a.files:
            for f in sorted(glob.glob(pattern)) or [pattern]:
                info(f)
        return

    s, sr = read_wav(a.src)
    if a.cmd == "process":
        if a.mono:
            s = s.mean(axis=1, keepdims=True)
        if a.trim:
            s = trim(s, sr)
        s = limit_to_rms(s, sr, a.rms) if (a.limit and a.rms is not None) else normalize(s, a.peak, a.rms)
        s = fades(s, sr, a.fade_in, a.fade_out)
    elif a.cmd == "loop":
        s = trim(s, sr)
        x = min(int(sr * a.crossfade), len(s) // 3)
        ramp = np.linspace(0, 1, x)[:, None]
        head = s[:x] * ramp + s[-x:] * (1 - ramp)
        s = np.concatenate([head, s[x:-x]])
        s = limit_to_rms(s, sr, a.rms, circular=True) if a.limit else normalize(s, rms_db=a.rms)
    write_wav(a.dst, s, sr)
    info(a.dst)


if __name__ == "__main__":
    main()
