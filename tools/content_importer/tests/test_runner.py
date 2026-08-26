from pathlib import Path

import pytest
from coucoumeow_api.adapters.fakes.content_generator import FakeContentGenerator
from coucoumeow_api.domain.content import (
    GeneratedEpisodeContent,
    KnowledgeContent,
    SentenceContent,
    VocabContent,
)
from coucoumeow_importer.models import ExistingEpisode, MediaPair
from coucoumeow_importer.repository import InMemoryContentRepository
from coucoumeow_importer.runner import run_single


@pytest.mark.asyncio
async def test_dry_run_never_calls_generator_or_repository(tmp_path: Path) -> None:
    srt_path = tmp_path / "episode.srt"
    srt_path.write_text(
        "1\n00:00:00,000 --> 00:00:01,000\nHello, cat.\n",
        encoding="utf-8",
    )
    video_path = tmp_path / "episode.mp4"
    video_path.touch()
    repository = InMemoryContentRepository()
    generator = FakeContentGenerator(_generated())

    result = await run_single(
        level=1,
        pair=MediaPair("episode", srt_path, video_path),
        dry_run=True,
        generator=generator,
        repository=repository,
    )

    assert result.status == "dry_run"
    assert result.sentence_count == 1
    assert repository.saved == []


@pytest.mark.asyncio
async def test_unchanged_episode_is_skipped(tmp_path: Path) -> None:
    srt_path = tmp_path / "episode.srt"
    srt_path.write_text(
        "1\n00:00:00,000 --> 00:00:01,000\nHello, cat.\n",
        encoding="utf-8",
    )
    video_path = tmp_path / "episode.mp4"
    video_path.touch()
    repository = InMemoryContentRepository()
    first = await run_single(
        level=1,
        pair=MediaPair("episode", srt_path, video_path),
        dry_run=True,
        generator=FakeContentGenerator(_generated()),
        repository=repository,
    )
    repository.existing[(1, "episode.mp4")] = ExistingEpisode(first.content_hash)

    result = await run_single(
        level=1,
        pair=MediaPair("episode", srt_path, video_path),
        dry_run=False,
        generator=FakeContentGenerator(_generated()),
        repository=repository,
    )

    assert result.status == "skipped"


def _generated() -> GeneratedEpisodeContent:
    return GeneratedEpisodeContent(
        sentences=[SentenceContent(sequence_no=1, english_text="Hello, cat.", chinese_translation="你好，小猫。")],
        vocab=[VocabContent(sequence_no=1, word="hello", phonetic="/həˈləʊ/", chinese_meaning="你好")],
        knowledge=[KnowledgeContent(sequence_no=1, title="问候", grammar_explanation="Hello 用于问候。", core_knowledge="友好问候。")],
    )
