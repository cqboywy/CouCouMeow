import pytest

from coucoumeow_api.adapters.fakes.speech_transcriber import FakeSpeechTranscriber


@pytest.mark.asyncio
async def test_fake_transcriber_returns_deterministic_result() -> None:
    transcriber = FakeSpeechTranscriber(transcript="I like cats.")

    result = await transcriber.transcribe(b"audio", "audio/webm")

    assert result.transcript == "I like cats."
    assert result.confidence == 1.0
    assert result.provider == "fake"
