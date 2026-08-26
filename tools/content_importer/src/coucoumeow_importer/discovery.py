from pathlib import Path

from .models import DiscoveryError, DiscoveryResult, MediaPair


def discover_pairs(directory: Path) -> DiscoveryResult:
    pairs: list[MediaPair] = []
    errors: list[DiscoveryError] = []
    for srt_path in sorted(directory.glob("*.srt"), key=lambda item: item.name.lower()):
        video_path = _find_video(directory, srt_path.stem)
        if video_path is None:
            errors.append(DiscoveryError("MISSING_VIDEO", srt_path.name))
            continue
        pairs.append(MediaPair(srt_path.stem, srt_path, video_path))
    return DiscoveryResult(tuple(pairs), tuple(errors))


def _find_video(directory: Path, stem: str) -> Path | None:
    for suffix in (".mp4", ".MP4"):
        candidate = directory / f"{stem}{suffix}"
        if candidate.is_file():
            return candidate
    return None

