from typing import Protocol

from coucoumeow_api.domain.speech import TranscriptionResult


class SpeechTranscriber(Protocol):
    async def transcribe(self, audio: bytes, content_type: str) -> TranscriptionResult: ...
