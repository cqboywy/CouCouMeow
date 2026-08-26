from dataclasses import dataclass
from pathlib import Path
from typing import Literal


class SrtParseError(ValueError):
    """Raised when an SRT file contains no usable subtitles."""


class ContentGenerationError(RuntimeError):
    """Raised when structured content generation fails."""


@dataclass(frozen=True)
class CleanSentence:
    sequence_no: int
    text: str


@dataclass(frozen=True)
class MediaPair:
    stem: str
    srt_path: Path
    video_path: Path


@dataclass(frozen=True)
class DiscoveryError:
    code: str
    filename: str


@dataclass(frozen=True)
class DiscoveryResult:
    pairs: tuple[MediaPair, ...]
    errors: tuple[DiscoveryError, ...]


@dataclass(frozen=True)
class ExistingEpisode:
    content_hash: str


ImportStatus = Literal["dry_run", "draft", "skipped", "needs_review", "failed"]


@dataclass(frozen=True)
class ImportResult:
    stem: str
    status: ImportStatus
    sentence_count: int
    content_hash: str
    error_code: str | None = None


@dataclass(frozen=True)
class BatchImportResult:
    results: tuple[ImportResult, ...]
    discovery_errors: tuple[DiscoveryError, ...]

