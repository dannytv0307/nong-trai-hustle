"""Tạo hiệu ứng âm thanh (SFX) bằng tổng hợp âm (kiểu sfxr) — miễn phí, chạy offline, kiểm soát chính xác.

Vertex AI chưa có model chuyên SFX, nên SFX ngắn (nhảy, ăn điểm, chạm, va chạm, UI…) tạo bằng script này.
Tham số lưu trong prompt card (khối ```json dưới '## Thông số SFX') để tạo lại được.

Ví dụ:
  python tools/gen_sfx.py --list                                   # xem preset
  python tools/gen_sfx.py --preset jump --name AUD-SFX-001 --variants 3
  python tools/gen_sfx.py --preset coin --set wave=sine freq=900 --name AUD-SFX-002
  python tools/gen_sfx.py --card docs/audio/prompts/AUD-SFX-003.md --name AUD-SFX-003

Tham số (đơn vị giây / Hz):
  wave       square | saw | sine | triangle | noise
  freq       tần số bắt đầu        freq_end   tần số kết thúc (trượt pitch)
  attack / sustain / decay         punch      nhấn mạnh đầu âm 0–1
  duty       độ rộng xung (square) vibrato_depth (tỉ lệ) / vibrato_speed (Hz)
  arp        [[thời điểm, hệ số nhân tần số], …]  vd. [[0.06, 1.5]] -> nốt nhảy lên
  lowpass    Hz (âm mềm hơn)       volume     0–1
"""
import argparse
import json
import random
import re
import sys
from pathlib import Path

import numpy as np

from common import ROOT, rel, timestamp, write_wav

SR = 44100

PRESETS = {
    # UI
    "click":   dict(wave="sine", freq=1400, freq_end=900, attack=0.001, sustain=0.01, decay=0.04, lowpass=6000),
    "tap":     dict(wave="triangle", freq=700, freq_end=500, attack=0.001, sustain=0.015, decay=0.05),
    "pop":     dict(wave="sine", freq=400, freq_end=1200, attack=0.002, sustain=0.02, decay=0.08),
    # Người chơi
    "jump":    dict(wave="square", duty=0.3, freq=300, freq_end=750, attack=0.005, sustain=0.06, decay=0.12, lowpass=5000),
    "bounce":  dict(wave="sine", freq=220, freq_end=520, attack=0.003, sustain=0.04, decay=0.1, vibrato_depth=0.05, vibrato_speed=25),
    "whoosh":  dict(wave="noise", freq=2000, freq_end=500, attack=0.05, sustain=0.05, decay=0.15, lowpass=3000, volume=0.6),
    # Tích cực
    "coin":    dict(wave="square", duty=0.5, freq=988, attack=0.001, sustain=0.06, decay=0.2, arp=[[0.06, 1.335]], punch=0.4, lowpass=7000),
    "powerup": dict(wave="square", duty=0.4, freq=330, freq_end=990, attack=0.005, sustain=0.25, decay=0.2, vibrato_depth=0.03, vibrato_speed=18),
    "win":     dict(wave="triangle", freq=523, attack=0.005, sustain=0.45, decay=0.35, arp=[[0.12, 1.26], [0.24, 1.5], [0.36, 2.0]]),
    # Tiêu cực
    "hit":     dict(wave="noise", freq=1200, freq_end=300, attack=0.001, sustain=0.03, decay=0.12, punch=0.6, lowpass=4000),
    "hurt":    dict(wave="saw", freq=420, freq_end=180, attack=0.002, sustain=0.06, decay=0.15, lowpass=3000),
    "explode": dict(wave="noise", freq=800, freq_end=80, attack=0.002, sustain=0.15, decay=0.5, punch=0.7, lowpass=2500),
    "lose":    dict(wave="triangle", freq=440, attack=0.005, sustain=0.5, decay=0.4, arp=[[0.15, 0.94], [0.3, 0.84], [0.45, 0.7]], vibrato_depth=0.02, vibrato_speed=6),
}

DEFAULTS = dict(wave="square", freq=440, freq_end=None, attack=0.005, sustain=0.1, decay=0.2, punch=0.0,
                duty=0.5, vibrato_depth=0.0, vibrato_speed=0.0, arp=None, lowpass=None, volume=0.8)


def synth(p, rng):
    p = {**DEFAULTS, **p}
    total = p["attack"] + p["sustain"] + p["decay"]
    n = int(SR * total)
    t = np.arange(n) / SR

    f = np.full(n, float(p["freq"]))
    if p["freq_end"]:
        f = p["freq"] * (p["freq_end"] / p["freq"]) ** (t / total)
    for at, mult in p["arp"] or []:
        f[t >= at] *= mult
    if p["vibrato_depth"]:
        f *= 1 + p["vibrato_depth"] * np.sin(2 * np.pi * p["vibrato_speed"] * t)
    phase = np.cumsum(f / SR)
    frac = phase % 1.0

    w = p["wave"]
    if w == "square":
        s = np.where(frac < p["duty"], 1.0, -1.0)
    elif w == "saw":
        s = 2 * frac - 1
    elif w == "triangle":
        s = 1 - 4 * np.abs(frac - 0.5)
    elif w == "sine":
        s = np.sin(2 * np.pi * phase)
    elif w == "noise":
        # Nhiễu "sample & hold" theo tần số -> chất retro, trượt pitch được
        steps = np.floor(phase * 2).astype(np.int64)
        table = rng.uniform(-1, 1, steps.max() + 2)
        s = table[steps]
    else:
        sys.exit(f"wave không hợp lệ: {w}")

    a, su = p["attack"], p["sustain"]
    env = np.ones(n)
    env[t < a] = t[t < a] / max(a, 1e-6)
    sus = (t >= a) & (t < a + su)
    env[sus] = 1 + p["punch"] * (1 - (t[sus] - a) / max(su, 1e-6))
    dec = t >= a + su
    env[dec] = (1 - (t[dec] - a - su) / max(p["decay"], 1e-6)).clip(0, 1) ** 1.5
    s = s * env

    if p["lowpass"]:
        alpha = 1 - np.exp(-2 * np.pi * p["lowpass"] / SR)
        out = np.empty_like(s)
        y = 0.0
        for i, x in enumerate(s):
            y += alpha * (x - y)
            out[i] = y
        s = out

    # Chuẩn hóa peak -1 dBFS rồi nhân volume; fade 3 ms chống tiếng "click"
    s = s / max(np.abs(s).max(), 1e-9) * 0.891 * p["volume"]
    fade = min(int(SR * 0.003), n // 4)
    if fade:
        s[:fade] *= np.linspace(0, 1, fade)
        s[-fade:] *= np.linspace(1, 0, fade)
    return s


def jitter(p, rng, amount=0.08):
    q = dict(p)
    for k in ("freq", "freq_end"):
        if q.get(k):
            q[k] = q[k] * (1 + rng.uniform(-amount, amount))
    for k in ("sustain", "decay"):
        if k in q:
            q[k] = q[k] * (1 + rng.uniform(-amount, amount))
    return q


def parse_set(items):
    out = {}
    for it in items or []:
        k, _, v = it.partition("=")
        try:
            out[k] = json.loads(v)
        except json.JSONDecodeError:
            out[k] = v
    return out


def params_from_card(path):
    text = Path(path).read_text(encoding="utf-8")
    m = re.search(r"^##\s*Thông số SFX.*?```json\s*\n(.*?)```", text, re.S | re.M)
    if not m:
        sys.exit(f"Không thấy khối ```json dưới '## Thông số SFX' trong {path}")
    return json.loads(m.group(1))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--list", action="store_true")
    ap.add_argument("--preset", choices=sorted(PRESETS))
    ap.add_argument("--card")
    ap.add_argument("--set", nargs="*", help="Ghi đè tham số: key=value")
    ap.add_argument("--variants", type=int, default=1)
    ap.add_argument("--seed", type=int, default=None)
    ap.add_argument("--name", default="sfx")
    ap.add_argument("--out")
    a = ap.parse_args()

    if a.list:
        for k, v in PRESETS.items():
            print(f"{k:8} {json.dumps(v)}")
        return

    base = {}
    if a.card:
        card = params_from_card(a.card)
        base = {**PRESETS.get(card.pop("preset", None), {}), **card}
    elif a.preset:
        base = dict(PRESETS[a.preset])
    base.update(parse_set(a.set))
    if not base:
        sys.exit("Cần --preset, --card hoặc --set")

    rng = np.random.default_rng(a.seed if a.seed is not None else random.randrange(2**31))
    out_dir = Path(a.out) if a.out else ROOT / "audio-source" / "raw" / a.name
    stamp = timestamp()
    for i in range(1, a.variants + 1):
        p = base if i == 1 else jitter(base, rng)
        path = out_dir / f"{a.name}_{stamp}_{i}.wav"
        write_wav(path, synth(p, rng), SR)
        print(f"{rel(path)}  {json.dumps({k: (round(v, 4) if isinstance(v, float) else v) for k, v in p.items()})}")


if __name__ == "__main__":
    main()
