from pathlib import Path

from coucoumeow_api.domain.content import ContentGenerationRequest
from coucoumeow_api.ports.content_generator import ContentGenerator

from .discovery import discover_pairs
from .hashing import hash_sentences
from .models import (
    BatchImportResult,
    ContentGenerationError,
    ImportResult,
    MediaPair,
    SrtParseError,
)
from .repository import ContentRepository
from .srt_parser import parse_srt


async def run_single(
    *,
    level: int,
    pair: MediaPair,
    dry_run: bool,
    generator: ContentGenerator,
    repository: ContentRepository,
) -> ImportResult:
    sentences = parse_srt(pair.srt_path)
    content_hash = hash_sentences(sentences)
    if dry_run:
        return ImportResult(pair.stem, "dry_run", len(sentences), content_hash)

    existing = await repository.find_episode(level, pair.video_path.name)
    if existing and existing.content_hash == content_hash:
        return ImportResult(pair.stem, "skipped", len(sentences), content_hash)
    if existing:
        return ImportResult(pair.stem, "needs_review", len(sentences), content_hash)

    request = ContentGenerationRequest(
        level=level,
        title=pair.stem,
        sentences=[sentence.text for sentence in sentences],
    )
    content = await generator.generate(request)
    await repository.save_draft(
        level=level,
        pair=pair,
        content_hash=content_hash,
        content=content,
    )
    return ImportResult(pair.stem, "draft", len(sentences), content_hash)


async def run_batch(
    *,
    level: int,
    directory: Path,
    dry_run: bool,
    generator: ContentGenerator,
    repository: ContentRepository,
) -> BatchImportResult:
    discovery = discover_pairs(directory)
    results: list[ImportResult] = []
    for pair in discovery.pairs:
        try:
            result = await run_single(
                level=level,
                pair=pair,
                dry_run=dry_run,
                generator=generator,
                repository=repository,
            )
        except (OSError, ValueError, SrtParseError, ContentGenerationError) as error:
            result = ImportResult(
                pair.stem,
                "failed",
                0,
                "",
                error_code=type(error).__name__,
            )
        results.append(result)
    return BatchImportResult(tuple(results), discovery.errors)

