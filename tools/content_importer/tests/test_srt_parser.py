from pathlib import Path

from coucoumeow_importer.srt_parser import parse_srt

FIXTURE_DIR = Path(__file__).parent / "fixtures" / "level1"


def test_parse_srt_cleans_markup_and_consecutive_duplicates() -> None:
    result = parse_srt(FIXTURE_DIR / "the-sleepy-cat.srt")

    assert [item.text for item in result] == [
        "The cat is sleepy.",
        "Good night, little cat.",
    ]
    assert [item.sequence_no for item in result] == [1, 2]

