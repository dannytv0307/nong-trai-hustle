"""Gen nhạc nền / jingle bằng Lyria trên Vertex AI (nhạc không lời, WAV 48 kHz, ~30 giây/clip).

Ví dụ:
  python tools/gen_music.py --card docs/audio/prompts/AUD-MUS-001.md --name AUD-MUS-001 -n 2
  python tools/gen_music.py --prompt "cozy marimba loop, 100 BPM" --negative "vocals, drums" --seed 42

Kết quả: audio-source/raw/<name>/<name>_<thời gian>_<i>.wav + log .json

-n N: gọi API N lần (lyria-002 bỏ qua sample_count, mỗi lần chỉ trả 1 clip). Mỗi lần dùng seed riêng:
có --seed thì seed, seed+1, …; không có thì seed ngẫu nhiên (ghi vào log để tái tạo). Mỗi clip tính phí.
Lỗi 500 "Could not generate audio" thỉnh thoảng xảy ra: lần đó bỏ qua, các lần khác vẫn chạy.
"""
import argparse
import base64
import json
import sys
from pathlib import Path

from common import ROOT, load_config, read_prompt_card, rel, timestamp


def access_token():
    import google.auth
    from google.auth.transport.requests import Request

    creds, _ = google.auth.default(scopes=["https://www.googleapis.com/auth/cloud-platform"])
    creds.refresh(Request())
    return creds.token


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--prompt")
    ap.add_argument("--card", help="Prompt card .md ('## Prompt chính' + '## Negative')")
    ap.add_argument("--negative", help="Những gì không muốn có")
    ap.add_argument("-n", type=int, default=2, help="Số bản (1–4) = số lần gọi, mỗi lần một seed")
    ap.add_argument("--seed", type=int, help="Seed đầu; các bản sau dùng seed+1, seed+2…")
    ap.add_argument("--name", default="music")
    ap.add_argument("--out")
    ap.add_argument("--model")
    args = ap.parse_args()

    import httpx

    cfg = load_config()
    mcfg = cfg["music"]
    model = args.model or mcfg["model"]
    prompt = args.prompt or (read_prompt_card(args.card) if args.card else None)
    if not prompt:
        sys.exit("Cần --prompt hoặc --card có '## Prompt chính'")
    negative = args.negative or (read_prompt_card(args.card, "Negative") if args.card else None)

    import random

    n = max(1, min(4, args.n))
    base_seed = args.seed if args.seed is not None else random.randrange(2**31 - 8)
    seeds = [base_seed + i for i in range(n)]

    loc = mcfg["location"]
    url = (f"https://{loc}-aiplatform.googleapis.com/v1/projects/{cfg['gcp_project']}"
           f"/locations/{loc}/publishers/google/models/{model}:predict")
    out_dir = Path(args.out) if args.out else ROOT / "audio-source" / "raw" / args.name
    out_dir.mkdir(parents=True, exist_ok=True)
    stamp = timestamp()
    token = access_token()
    saved, results = [], []
    for i, seed in enumerate(seeds, 1):
        instance = {"prompt": prompt, "seed": seed}
        if negative:
            instance["negative_prompt"] = negative
        r = httpx.post(url, json={"instances": [instance], "parameters": {}},
                       headers={"Authorization": f"Bearer {token}"}, timeout=300)
        if r.status_code != 200:
            print(f"[{i}] seed {seed}: LỖI {r.status_code}: {r.text[:300]}", file=sys.stderr)
            results.append({"seed": seed, "error": r.status_code})
            continue
        preds = r.json().get("predictions", [])
        b64 = (preds[0].get("bytesBase64Encoded") or preds[0].get("audioContent")) if preds else None
        if not b64:
            print(f"[{i}] seed {seed}: không có audio", file=sys.stderr)
            results.append({"seed": seed, "error": "no audio"})
            continue
        path = out_dir / f"{args.name}_{stamp}_{i}.wav"
        path.write_bytes(base64.b64decode(b64))
        saved.append(str(rel(path)))
        results.append({"seed": seed, "file": saved[-1]})
        print(f"[{i}] seed {seed}: {saved[-1]}")

    log = {"model": model, "prompt": prompt, "negative": negative, "seeds": seeds, "results": results, "files": saved}
    (out_dir / f"{args.name}_{stamp}.json").write_text(json.dumps(log, ensure_ascii=False, indent=2), encoding="utf-8")
    if not saved:
        sys.exit(1)


if __name__ == "__main__":
    main()
