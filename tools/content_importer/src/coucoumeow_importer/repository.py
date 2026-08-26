from dataclasses import dataclass, field
from typing import Protocol
from uuid import UUID, uuid4

from coucoumeow_api.domain.content import GeneratedEpisodeContent

from .models import ExistingEpisode, MediaPair


class ContentRepository(Protocol):
    async def find_episode(
        self, level: int, video_filename: str
    ) -> ExistingEpisode | None: ...

    async def save_draft(
        self,
        *,
        level: int,
        pair: MediaPair,
        content_hash: str,
        content: GeneratedEpisodeContent,
    ) -> UUID: ...


@dataclass
class InMemoryContentRepository:
    existing: dict[tuple[int, str], ExistingEpisode] = field(default_factory=dict)
    saved: list[tuple[int, str, str]] = field(default_factory=list)

    async def find_episode(
        self, level: int, video_filename: str
    ) -> ExistingEpisode | None:
        return self.existing.get((level, video_filename))

    async def save_draft(
        self,
        *,
        level: int,
        pair: MediaPair,
        content_hash: str,
        content: GeneratedEpisodeContent,
    ) -> UUID:
        self.saved.append((level, pair.video_path.name, content_hash))
        return uuid4()

