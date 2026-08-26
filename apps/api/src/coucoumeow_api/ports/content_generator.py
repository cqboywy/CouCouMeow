from typing import Protocol

from coucoumeow_api.domain.content import (
    ContentGenerationRequest,
    GeneratedEpisodeContent,
)


class ContentGenerator(Protocol):
    async def generate(self, request: ContentGenerationRequest) -> GeneratedEpisodeContent: ...
