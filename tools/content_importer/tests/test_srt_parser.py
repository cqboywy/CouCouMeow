from coucoumeow_importer.srt_parser import parse_srt


def test_parse_srt_cleans_markup_and_consecutive_duplicates(tmp_path) -> None:
    srt_path = tmp_path / "the-sleepy-cat.srt"
    srt_path.write_text(
        """1
00:00:00,000 --> 00:00:01,000
<i>The cat is sleepy.</i>

2
00:00:01,000 --> 00:00:02,000
The cat is sleepy.

3
00:00:02,000 --> 00:00:03,000
<font color="yellow">Good night, little cat.</font>
""",
        encoding="utf-8",
    )

    result = parse_srt(srt_path)

    assert [item.text for item in result] == [
        "The cat is sleepy.",
        "Good night, little cat.",
    ]
    assert [item.sequence_no for item in result] == [1, 2]
