from typing import Any

import pytest
from pydantic import ValidationError

from coucoumeow_api.adapters.fakes.content_generator import FakeContentGenerator
from coucoumeow_api.domain.content import (
    ContentGenerationRequest,
    GeneratedEpisodeContent,
)


def generated_content() -> dict[str, object]:
    return {
        "sentences": [
            {
                "sequence_no": 1,
                "english_text": "Hello, Cat!",
                "chinese_translation": "你好，小猫！",
            }
        ],
        "vocab": [
            {
                "sequence_no": 1,
                "word": "hello",
                "phonetic": "/həˈləʊ/",
                "chinese_meaning": "你好",
            }
        ],
        "knowledge": [
            {
                "sequence_no": 1,
                "title": "问候",
                "grammar_explanation": "Hello 用于问候。",
                "core_knowledge": "使用 Hello 打招呼。",
            }
        ],
    }


def test_generated_episode_requires_sentences_vocab_and_knowledge() -> None:
    content = GeneratedEpisodeContent.model_validate(generated_content())

    assert content.sentences[0].english_text == "Hello, Cat!"


@pytest.mark.parametrize(
    ("field", "value"),
    [
        ("sentences", []),
        ("vocab", []),
        ("knowledge", []),
    ],
)
def test_generated_episode_rejects_empty_content_collections(
    field: str, value: list[object]
) -> None:
    data = generated_content()
    data[field] = value

    with pytest.raises(ValidationError):
        GeneratedEpisodeContent.model_validate(data)


@pytest.mark.parametrize(
    ("collection", "field", "invalid_value"),
    [
        ("sentences", "sequence_no", 0),
        ("sentences", "english_text", ""),
        ("sentences", "chinese_translation", ""),
        ("vocab", "sequence_no", 0),
        ("vocab", "word", ""),
        ("vocab", "phonetic", ""),
        ("vocab", "chinese_meaning", ""),
        ("knowledge", "sequence_no", 0),
        ("knowledge", "title", ""),
        ("knowledge", "grammar_explanation", ""),
        ("knowledge", "core_knowledge", ""),
    ],
)
def test_generated_episode_rejects_empty_text_and_invalid_sequence_numbers(
    collection: str, field: str, invalid_value: int | str
) -> None:
    data: dict[str, Any] = generated_content()
    data[collection][0][field] = invalid_value

    with pytest.raises(ValidationError):
        GeneratedEpisodeContent.model_validate(data)


@pytest.mark.parametrize(
    "payload",
    [
        {"level": 0, "title": "Greeting", "sentences": ["Hello, Cat!"]},
        {"level": 10, "title": "Greeting", "sentences": ["Hello, Cat!"]},
        {"level": 1, "title": "", "sentences": ["Hello, Cat!"]},
        {"level": 1, "title": "Greeting", "sentences": [""]},
    ],
)
def test_content_generation_request_rejects_invalid_content(
    payload: dict[str, object],
) -> None:
    with pytest.raises(ValidationError):
        ContentGenerationRequest.model_validate(payload)


@pytest.mark.asyncio
async def test_fake_content_generator_returns_its_injected_content() -> None:
    expected = GeneratedEpisodeContent.model_validate(generated_content())
    generator = FakeContentGenerator(content=expected)

    result = await generator.generate(
        ContentGenerationRequest(level=1, title="Greeting", sentences=["Hello, Cat!"])
    )

    assert result == expected
