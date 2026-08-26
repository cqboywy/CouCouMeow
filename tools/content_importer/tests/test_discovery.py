from pathlib import Path

from coucoumeow_importer.discovery import discover_pairs


def test_discover_pairs_matches_stems_and_reports_missing_video(tmp_path: Path) -> None:
    (tmp_path / "episode-01.srt").write_text("subtitle", encoding="utf-8")
    (tmp_path / "episode-01.mp4").touch()
    (tmp_path / "episode-02.srt").write_text("subtitle", encoding="utf-8")

    result = discover_pairs(tmp_path)

    assert [pair.stem for pair in result.pairs] == ["episode-01"]
    assert result.errors[0].code == "MISSING_VIDEO"
    assert result.errors[0].filename == "episode-02.srt"

