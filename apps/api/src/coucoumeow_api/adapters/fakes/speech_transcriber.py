from coucoumeow_api.domain.speech import TranscriptionResult
from coucoumeow_api.ports.speech_transcriber import SpeechTranscriber


class FakeSpeechTranscriber(SpeechTranscriber):
    def __init__(self, transcript: str) -> None:
        self._result = TranscriptionResult(
            transcript=transcript,
            confidence=1.0,
            provider="fake",
        )

    async def transcribe(self, audio: bytes, content_type: str) -> TranscriptionResult:
        return self._result
