"""Gen ảnh bằng Gemini image trên Vertex AI.

Ví dụ:
  python tools/gen_image.py --card docs/art/prompts/ART-CHR-001.md --name ART-CHR-001 -n 4
  python tools/gen_image.py --prompt "..." --ref art-source/reference/style-anchor.png --aspect 9:16
  python tools/gen_image.py --card ... --hq          # dùng model chất lượng cao (đắt hơn)

Kết quả: art-source/raw/<name>/<name>_<thời gian>_<i>.png, file log .json cùng tên,
và một ảnh contact sheet (_sheet.png) đánh số để so sánh/chọn.
"""
import argparse
import json
import mimetypes
import sys
from pathlib import Path

from common import ROOT, genai_client, load_config, prompt_from_args, rel, timestamp


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--prompt", help="Prompt trực tiếp")
    ap.add_argument("--card", help="Prompt card .md (lấy '## Prompt chính' + '## Negative')")
    ap.add_argument("--ref", action="append", default=[], help="Ảnh tham chiếu (style anchor / nhân vật), lặp lại được")
    ap.add_argument("-n", type=int, default=2, help="Số ảnh (mặc định 2)")
    ap.add_argument("--aspect", default="1:1", help="Tỉ lệ khung: 1:1, 9:16, 16:9, 3:4, 4:3…")
    ap.add_argument("--size", help="Độ phân giải (1K/2K/4K) nếu model hỗ trợ")
    ap.add_argument("--hq", action="store_true", help="Dùng model chất lượng cao trong config")
    ap.add_argument("--model", help="Ghi đè model")
    ap.add_argument("--name", default="img", help="Tên/ID asset, dùng đặt tên file")
    ap.add_argument("--out", help="Thư mục ra (mặc định art-source/raw/<name>)")
    args = ap.parse_args()

    from google.genai import types

    cfg = load_config()["image"]
    model = args.model or (cfg["model_hq"] if args.hq else cfg["model"])
    prompt = prompt_from_args(args)
    out_dir = Path(args.out) if args.out else ROOT / "art-source" / "raw" / args.name
    out_dir.mkdir(parents=True, exist_ok=True)

    parts = []
    for ref in args.ref:
        mime = mimetypes.guess_type(ref)[0] or "image/png"
        parts.append(types.Part.from_bytes(data=Path(ref).read_bytes(), mime_type=mime))
    if args.ref:
        prompt = "Use the attached image(s) as the strict style and character reference.\n\n" + prompt
    parts.append(types.Part.from_text(text=prompt))

    image_cfg = {"aspect_ratio": args.aspect}
    if args.size:
        image_cfg["image_size"] = args.size
    config = types.GenerateContentConfig(
        response_modalities=["IMAGE", "TEXT"],
        image_config=types.ImageConfig(**image_cfg),
    )

    client = genai_client(cfg["location"])
    stamp = timestamp()
    saved = []
    for i in range(1, args.n + 1):
        try:
            resp = client.models.generate_content(model=model, contents=parts, config=config)
        except Exception as e:  # noqa: BLE001 — báo lỗi API rõ ràng, tiếp tục ảnh khác
            print(f"[{i}/{args.n}] LỖI: {e}", file=sys.stderr)
            continue
        got = False
        for part in (resp.candidates[0].content.parts if resp.candidates else []) or []:
            if part.inline_data and part.inline_data.data:
                path = out_dir / f"{args.name}_{stamp}_{i}.png"
                path.write_bytes(part.inline_data.data)
                saved.append(path)
                got = True
                print(f"[{i}/{args.n}] {rel(path)}")
            elif part.text:
                print(f"[{i}/{args.n}] model nói: {part.text.strip()[:200]}")
        if not got:
            reason = resp.candidates[0].finish_reason if resp.candidates else resp.prompt_feedback
            print(f"[{i}/{args.n}] không có ảnh (lý do: {reason})", file=sys.stderr)

    log = {"model": model, "aspect": args.aspect, "size": args.size, "refs": args.ref,
           "card": args.card, "prompt": prompt, "files": [str(rel(p)) for p in saved]}
    (out_dir / f"{args.name}_{stamp}.json").write_text(json.dumps(log, ensure_ascii=False, indent=2), encoding="utf-8")

    if len(saved) > 1:
        from process_image import contact_sheet

        sheet = out_dir / f"{args.name}_{stamp}_sheet.png"
        contact_sheet(saved, sheet)
        print(f"Sheet so sánh: {rel(sheet)}")
    if not saved:
        sys.exit(1)


if __name__ == "__main__":
    main()
