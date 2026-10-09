"""Tiện ích dùng chung cho các script gen asset: đọc config, tạo client Vertex AI, xử lý WAV."""
import json
import re
import sys
import wave
from datetime import datetime
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
CONFIG_PATH = ROOT / "tools" / "config.json"

# Console Windows mặc định không phải UTF-8 -> in tiếng Việt bị lỗi
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")


def load_config():
    return json.loads(CONFIG_PATH.read_text(encoding="utf-8"))


def genai_client(location):
    from google import genai

    return genai.Client(vertexai=True, project=load_config()["gcp_project"], location=location)


def timestamp():
    return datetime.now().strftime("%Y%m%d-%H%M%S")


def read_prompt_card(path, section="Prompt chính"):
    """Lấy code block đầu tiên dưới heading `## <section>` của một prompt card (.md)."""
    text = Path(path).read_text(encoding="utf-8")
    m = re.search(rf"^##\s*{re.escape(section)}.*?```[^\n]*\n(.*?)```", text, re.S | re.M)
    return m.group(1).strip() if m else None


def prompt_from_args(args):
    """Ghép prompt từ --prompt hoặc --card (+ phần Negative trong card)."""
    if args.prompt:
        return args.prompt
    if not args.card:
        sys.exit("Cần --prompt hoặc --card")
    main = read_prompt_card(args.card, "Prompt chính")
    if not main:
        sys.exit(f"Không tìm thấy code block dưới '## Prompt chính' trong {args.card}")
    neg = read_prompt_card(args.card, "Negative")
    return main + (f"\n\nAvoid: {neg}" if neg else "")


# ---------- WAV ----------

def read_wav(path):
    """Trả về (samples float32 shape [n, ch] trong [-1,1], sample_rate)."""
    with wave.open(str(path), "rb") as w:
        ch, width, sr, n = w.getnchannels(), w.getsampwidth(), w.getframerate(), w.getnframes()
        raw = w.readframes(n)
    if width == 2:
        data = np.frombuffer(raw, dtype="<i2").astype(np.float32) / 32768
    elif width == 3:
        b = np.frombuffer(raw, dtype=np.uint8).reshape(-1, 3)
        v = (b[:, 0].astype(np.int32) | (b[:, 1].astype(np.int32) << 8) | (b[:, 2].astype(np.int32) << 16))
        v = np.where(v & 0x800000, v - 0x1000000, v)
        data = v.astype(np.float32) / 8388608
    elif width == 4:
        data = np.frombuffer(raw, dtype="<i4").astype(np.float32) / 2147483648
    else:
        sys.exit(f"WAV {width * 8}-bit chưa hỗ trợ: {path}")
    return data.reshape(-1, ch), sr


def write_wav(path, samples, sr):
    """Ghi WAV PCM 16-bit. samples: float [n] hoặc [n, ch]."""
    s = np.asarray(samples, dtype=np.float32)
    if s.ndim == 1:
        s = s[:, None]
    pcm = (np.clip(s, -1, 1) * 32767).astype("<i2")
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(s.shape[1])
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes(pcm.tobytes())


def db(x):
    return 20 * np.log10(max(float(x), 1e-9))


def rel(path):
    """Đường dẫn tương đối so với gốc dự án (nếu được) để in gọn."""
    try:
        return str(Path(path).resolve().relative_to(ROOT))
    except ValueError:
        return str(path)
