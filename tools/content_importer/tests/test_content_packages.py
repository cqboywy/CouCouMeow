import json
from pathlib import Path

import pytest
from coucoumeow_importer.content_packages import (
    ContentPackageError,
    ExtraEpisodePackage,
    SchoolTextbookPackage,
    load_content_package,
)


def valid_school_package() -> dict:
    return {
        "kind": "school_textbook",
        "schema_version": 1,
        "content_version": 1,
        "content_hash": "a" * 64,
        "textbook": {
            "content_key": "pep-grade4-upper",
            "curriculum": "PEP",
            "grade": 4,
            "semester": "upper",
            "title": "PEP Grade 4 Upper",
            "current_unit_key": "pep4a-u1",
        },
        "units": [
            {
                "content_key": "pep4a-u1",
                "sequence_no": 1,
                "title": "Helping at home",
                "chinese_title": "在家帮忙",
                "big_question": "What do families do together?",
                "big_question_chinese": "家人会一起做什么？",
                "objectives": [{"id": "objective-1", "title": "学会帮忙"}],
            }
        ],
        "lessons": [
            {
                "content_key": "pep4a-u1-l1",
                "unit_key": "pep4a-u1",
                "sequence_no": 1,
                "title": "Helping at home",
                "subtitle": "Part A",
                "page_references": [2],
                "duration_minutes": 10,
                "concepts": ["family"],
                "steps": [{"kind": "learn", "title": "学课本"}],
                "explanation": "先观察课本。",
            }
        ],
        "pages": [
            {
                "content_key": "pep4a-u1-p2",
                "unit_key": "pep4a-u1",
                "printed_page": 2,
                "title": "Helping at home",
                "chinese_title": "在家帮忙",
                "schema_version": 1,
                "sections": [],
                "practice_prompts": [],
                "finish_items": ["会说 family"],
            }
        ],
        "items": [
            {
                "content_key": "pep4a-u1-family",
                "unit_key": "pep4a-u1",
                "item_kind": "word",
                "english": "family",
                "chinese": "家庭",
                "phonetic": "/ˈfæməli/",
                "attributes": {},
            }
        ],
        "lesson_items": [],
        "page_items": [
            {
                "page_key": "pep4a-u1-p2",
                "item_key": "pep4a-u1-family",
                "sequence_no": 1,
                "item_role": "focus",
                "source": "body",
                "note": "本页重点",
            }
        ],
        "exercises": [
            {
                "content_key": "pep4a-u1-l1-e1",
                "lesson_key": "pep4a-u1-l1",
                "item_key": "pep4a-u1-family",
                "sequence_no": 1,
                "stage": "practice",
                "exercise_kind": "choice",
                "prompt": "family 是什么意思？",
                "answer": "家庭",
                "options": ["家庭", "朋友"],
                "hint": "想一想家人。",
            }
        ],
    }


def valid_extra_package() -> dict:
    return {
        "kind": "extra_episode",
        "schema_version": 1,
        "content_version": 1,
        "content_hash": "b" * 64,
        "episode": {
            "content_key": "episode-the-park",
            "level": 1,
            "series_title": "Dino Buddies",
            "episode_number": 1,
            "title": "The Park",
            "chinese_title": "公园奇遇",
            "local_video_filename": "the-park.mp4",
            "local_srt_filename": None,
            "media_provider": "remote",
            "media_locator": "media/the-park.mp4",
            "story_summary": "Rex 在公园帮助朋友。",
            "story_theme": "友善地帮助别人。",
            "comprehension_questions": ["Rex 在哪里？"],
            "retell_steps": ["Rex 来到公园。"],
            "past_tense_pairs": [{"base": "see", "past": "saw", "meaning": "看见"}],
        },
        "sentences": [
            {
                "content_key": "sentence-park-1",
                "sequence_no": 1,
                "english_text": "Rex was in the park.",
                "chinese_translation": "Rex 在公园里。",
                "is_featured": True,
            }
        ],
        "vocab": [
            {
                "content_key": "vocab-park",
                "sequence_no": 1,
                "word": "park",
                "phonetic": "/pɑːk/",
                "chinese_meaning": "公园",
            }
        ],
        "knowledge": [
            {
                "content_key": "knowledge-park-1",
                "sequence_no": 1,
                "title": "was / were",
                "grammar_explanation": "讲过去的事情。",
                "core_knowledge": "Subject + was / were",
                "examples": ["I was at home."],
            }
        ],
    }


def write_package(tmp_path: Path, package: dict) -> Path:
    path = tmp_path / "manifest.json"
    path.write_text(json.dumps(package, ensure_ascii=False), encoding="utf-8")
    return path


def test_loads_strict_school_and_extra_packages(tmp_path: Path) -> None:
    school = load_content_package(write_package(tmp_path, valid_school_package()))
    assert isinstance(school, SchoolTextbookPackage)
    assert school.textbook.content_key == "pep-grade4-upper"

    extra_path = tmp_path / "extra.json"
    extra_path.write_text(json.dumps(valid_extra_package(), ensure_ascii=False), encoding="utf-8")
    extra = load_content_package(extra_path)
    assert isinstance(extra, ExtraEpisodePackage)
    assert extra.episode.content_key == "episode-the-park"


def test_school_package_rejects_broken_item_reference(tmp_path: Path) -> None:
    package = valid_school_package()
    package["page_items"][0]["item_key"] = "missing-item"
    with pytest.raises(ContentPackageError, match="missing-item"):
        load_content_package(write_package(tmp_path, package))


def test_school_package_rejects_duplicate_content_key(tmp_path: Path) -> None:
    package = valid_school_package()
    package["items"].append({**package["items"][0]})
    with pytest.raises(ContentPackageError, match="duplicate content_key"):
        load_content_package(write_package(tmp_path, package))


@pytest.mark.parametrize("owner_fields", [{}, {"lesson_key": "pep4a-u1-l1", "page_key": "pep4a-u1-p2"}])
def test_school_exercise_requires_exactly_one_owner(tmp_path: Path, owner_fields: dict) -> None:
    package = valid_school_package()
    exercise = package["exercises"][0]
    exercise.pop("lesson_key")
    exercise.update(owner_fields)
    with pytest.raises(ContentPackageError, match="exactly one owner"):
        load_content_package(write_package(tmp_path, package))


def test_package_rejects_unknown_schema_version(tmp_path: Path) -> None:
    package = valid_extra_package()
    package["schema_version"] = 2
    with pytest.raises(ContentPackageError, match="schema_version"):
        load_content_package(write_package(tmp_path, package))


def test_extra_package_rejects_absolute_media_path_and_secret_shape(tmp_path: Path) -> None:
    package = valid_extra_package()
    package["episode"]["media_locator"] = "/Users/example/private/the-park.mp4"
    package["episode"]["story_summary"] = "sb_secret_abcdefghijklmnopqrstuvwxyz"
    with pytest.raises(ContentPackageError, match="absolute path|secret"):
        load_content_package(write_package(tmp_path, package))


def test_repository_content_packages_are_complete_and_valid() -> None:
    repository_root = Path(__file__).resolve().parents[3]
    manifests = sorted((repository_root / "content").glob("**/manifest.json"))

    assert len(manifests) == 4
    packages = [load_content_package(path) for path in manifests]
    school = next(package for package in packages if package.kind == "school_textbook")
    extras = [package for package in packages if package.kind == "extra_episode"]

    assert len(school.units) == 6
    assert len(school.lessons) == 12
    assert len(school.pages) == 72
    assert sorted(package.episode.episode_number for package in extras) == [1, 1, 2]
