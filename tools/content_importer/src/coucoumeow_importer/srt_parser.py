import html
import re
from pathlib import Path

from .models import CleanSentence, SrtParseError

_TAG_RE = re.compile(r"<[^>]+>")
_TIMING_RE = re.compile(
    r"^\d{2}:\d{2}:\d{2}[,.]\d{3}\s+-->\s+\d{2}:\d{2}:\d{2}[,.]\d{3}"
)


def parse_srt(path: Path) -> list[CleanSentence]:
    text = path.read_text(encoding="utf-8-sig")
    sentences: list[CleanSentence] = []

    for block in re.split(r"\r?\n\s*\r?\n", text.strip()):
        lines = [line.strip() for line in block.splitlines() if line.strip()]
        content_lines = [
            line for line in lines if not line.isdigit() and not _TIMING_RE.match(line)
        ]
        cleaned = " ".join(content_lines)
        cleaned = html.unescape(_TAG_RE.sub("", cleaned))
        cleaned = " ".join(cleaned.split())
        if not cleaned or (sentences and sentences[-1].text == cleaned):
            continue
        sentences.append(CleanSentence(len(sentences) + 1, cleaned))

    if not sentences:
        raise SrtParseError(f"No usable subtitles found in {path.name}")
    return sentences

