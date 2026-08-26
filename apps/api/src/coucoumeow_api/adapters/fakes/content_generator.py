from coucoumeow_api.domain.content import (
    ContentGenerationRequest,
    GeneratedEpisodeContent,
)
from coucoumeow_api.ports.content_generator import ContentGenerator


class FakeContentGenerator(ContentGenerator):
    def __init__(self, content: GeneratedEpisodeContent) -> None:
        self._content = content

    async def generate(self, request: ContentGenerationRequest) -> GeneratedEpisodeContent:
        return self._content
