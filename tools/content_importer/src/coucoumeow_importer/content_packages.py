from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, ValidationError, model_validator

ContentKey = Annotated[str, Field(min_length=1, pattern=r"^[a-z0-9][a-z0-9-]*$")]
PositiveInt = Annotated[int, Field(gt=0)]
Hash = Annotated[str, Field(pattern=r"^[a-f0-9]{64}$")]


class ContentPackageError(ValueError):
    """Raised when a versioned content package cannot be safely imported."""


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class TextbookRecord(StrictModel):
    content_key: ContentKey
    curriculum: Annotated[str, Field(min_length=1)]
    grade: Annotated[int, Field(ge=1, le=12)]
    semester: Literal["upper", "lower"]
    title: Annotated[str, Field(min_length=1)]
    current_unit_key: ContentKey


class UnitRecord(StrictModel):
    content_key: ContentKey
    sequence_no: PositiveInt
    title: Annotated[str, Field(min_length=1)]
    chinese_title: str
    big_question: str
    big_question_chinese: str
    objectives: list[dict[str, str]]


class LessonRecord(StrictModel):
    content_key: ContentKey
    unit_key: ContentKey
    sequence_no: PositiveInt
    title: Annotated[str, Field(min_length=1)]
    subtitle: str
    page_references: list[PositiveInt]
    duration_minutes: PositiveInt
    concepts: list[str]
    steps: list[dict[str, str]]
    explanation: str


class PageRecord(StrictModel):
    content_key: ContentKey
    unit_key: ContentKey
    printed_page: PositiveInt
    title: Annotated[str, Field(min_length=1)]
    chinese_title: str
    schema_version: Literal[1]
    sections: list[dict]
    practice_prompts: list[dict]
    finish_items: list[str]


class SchoolItemRecord(StrictModel):
    content_key: ContentKey
    unit_key: ContentKey
    item_kind: Literal["word", "sentence", "phonics", "project"]
    english: Annotated[str, Field(min_length=1)]
    chinese: str
    phonetic: str | None = None
    attributes: dict = Field(default_factory=dict)


class PageItemRecord(StrictModel):
    page_key: ContentKey
    item_key: ContentKey
    sequence_no: PositiveInt
    item_role: Literal["focus", "body", "finish"]
    source: Literal["body", "appendix-word", "appendix-vocabulary", "appendix-expression"]
    note: str = ""


class LessonItemRecord(StrictModel):
    lesson_key: ContentKey
    item_key: ContentKey
    sequence_no: PositiveInt
    item_role: Literal["vocabulary", "sentence", "phonics"]


class ExerciseRecord(StrictModel):
    content_key: ContentKey
    lesson_key: ContentKey | None = None
    page_key: ContentKey | None = None
    item_key: ContentKey | None = None
    sequence_no: PositiveInt
    stage: Literal["practice", "check"]
    exercise_kind: Literal["choice", "typing", "self_check"]
    prompt: Annotated[str, Field(min_length=1)]
    answer: Annotated[str, Field(min_length=1)]
    options: list[str] = Field(default_factory=list)
    hint: str = ""

    @model_validator(mode="after")
    def exactly_one_owner(self) -> ExerciseRecord:
        if int(self.lesson_key is not None) + int(self.page_key is not None) != 1:
            raise ValueError("exercise must have exactly one owner")
        return self


class SchoolTextbookPackage(StrictModel):
    kind: Literal["school_textbook"]
    schema_version: Literal[1]
    content_version: PositiveInt
    content_hash: Hash
    textbook: TextbookRecord
    units: list[UnitRecord]
    lessons: list[LessonRecord]
    pages: list[PageRecord]
    items: list[SchoolItemRecord]
    lesson_items: list[LessonItemRecord]
    page_items: list[PageItemRecord]
    exercises: list[ExerciseRecord]

    @model_validator(mode="after")
    def references_are_complete(self) -> SchoolTextbookPackage:
        groups = (self.units, self.lessons, self.pages, self.items, self.exercises)
        keys = [record.content_key for group in groups for record in group]
        if len(keys) != len(set(keys)):
            raise ValueError("duplicate content_key in school package")

        unit_keys = {unit.content_key for unit in self.units}
        if self.textbook.current_unit_key not in unit_keys:
            raise ValueError(f"missing unit {self.textbook.current_unit_key}")
        for record in (*self.lessons, *self.pages, *self.items):
            if record.unit_key not in unit_keys:
                raise ValueError(f"missing unit {record.unit_key}")

        lesson_keys = {lesson.content_key for lesson in self.lessons}
        page_keys = {page.content_key for page in self.pages}
        item_keys = {item.content_key for item in self.items}
        for link in self.page_items:
            if link.page_key not in page_keys:
                raise ValueError(f"missing page {link.page_key}")
            if link.item_key not in item_keys:
                raise ValueError(f"missing item {link.item_key}")
        for link in self.lesson_items:
            if link.lesson_key not in lesson_keys:
                raise ValueError(f"missing lesson {link.lesson_key}")
            if link.item_key not in item_keys:
                raise ValueError(f"missing item {link.item_key}")
        for exercise in self.exercises:
            if exercise.lesson_key is not None and exercise.lesson_key not in lesson_keys:
                raise ValueError(f"missing lesson {exercise.lesson_key}")
            if exercise.page_key is not None and exercise.page_key not in page_keys:
                raise ValueError(f"missing page {exercise.page_key}")
            if exercise.item_key is not None and exercise.item_key not in item_keys:
                raise ValueError(f"missing item {exercise.item_key}")

        _require_contiguous("units", [unit.sequence_no for unit in self.units])
        for unit_key in unit_keys:
            _require_contiguous(
                f"lessons for {unit_key}",
                [lesson.sequence_no for lesson in self.lessons if lesson.unit_key == unit_key],
                allow_empty=True,
            )
        return self


class ExtraEpisodeRecord(StrictModel):
    content_key: ContentKey
    level: Annotated[int, Field(ge=1, le=9)]
    series_title: Annotated[str, Field(min_length=1)]
    episode_number: PositiveInt
    title: Annotated[str, Field(min_length=1)]
    chinese_title: str
    local_video_filename: str | None = None
    local_srt_filename: str | None = None
    media_provider: Annotated[str, Field(min_length=1)]
    media_locator: str | None = None
    story_summary: str
    story_theme: str
    comprehension_questions: list[str]
    retell_steps: list[str]
    past_tense_pairs: list[dict[str, str]]

    @model_validator(mode="after")
    def filenames_have_no_paths(self) -> ExtraEpisodeRecord:
        for filename in (self.local_video_filename, self.local_srt_filename):
            if filename and ("/" in filename or "\\" in filename):
                raise ValueError("local media filename must not contain a path")
        return self


class ExtraSentenceRecord(StrictModel):
    content_key: ContentKey
    sequence_no: PositiveInt
    english_text: Annotated[str, Field(min_length=1)]
    chinese_translation: str
    is_featured: bool = False


class ExtraVocabRecord(StrictModel):
    content_key: ContentKey
    sequence_no: PositiveInt
    word: Annotated[str, Field(min_length=1)]
    phonetic: str
    chinese_meaning: str


class ExtraKnowledgeRecord(StrictModel):
    content_key: ContentKey
    sequence_no: PositiveInt
    title: Annotated[str, Field(min_length=1)]
    grammar_explanation: str
    core_knowledge: str
    examples: list[str]


class ExtraEpisodePackage(StrictModel):
    kind: Literal["extra_episode"]
    schema_version: Literal[1]
    content_version: PositiveInt
    content_hash: Hash
    episode: ExtraEpisodeRecord
    sentences: list[ExtraSentenceRecord]
    vocab: list[ExtraVocabRecord]
    knowledge: list[ExtraKnowledgeRecord]

    @model_validator(mode="after")
    def keys_and_sequences_are_valid(self) -> ExtraEpisodePackage:
        groups = (self.sentences, self.vocab, self.knowledge)
        keys = [self.episode.content_key, *(record.content_key for group in groups for record in group)]
        if len(keys) != len(set(keys)):
            raise ValueError("duplicate content_key in extra package")
        for name, records in zip(("sentences", "vocab", "knowledge"), groups, strict=True):
            _require_contiguous(name, [record.sequence_no for record in records])
        return self


ContentPackage = SchoolTextbookPackage | ExtraEpisodePackage


def _require_contiguous(name: str, values: list[int], *, allow_empty: bool = False) -> None:
    if not values and allow_empty:
        return
    if sorted(values) != list(range(1, len(values) + 1)):
        raise ValueError(f"{name} sequence_no values must be contiguous from 1")


def _reject_sensitive_or_local_strings(value: object) -> None:
    if isinstance(value, dict):
        for child in value.values():
            _reject_sensitive_or_local_strings(child)
    elif isinstance(value, list):
        for child in value:
            _reject_sensitive_or_local_strings(child)
    elif isinstance(value, str):
        if re.search(r"sb_secret_[A-Za-z0-9_-]{10,}|eyJ[A-Za-z0-9_-]{20,}", value):
            raise ContentPackageError("content package contains a secret-shaped value")
        if re.search(r"^(?:/(?:Users|home|var|tmp)/|[A-Za-z]:\\)", value):
            raise ContentPackageError("content package contains an absolute path")


def load_content_package(path: Path) -> ContentPackage:
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise ContentPackageError(f"cannot read {path.name}: {error}") from error

    _reject_sensitive_or_local_strings(payload)
    try:
        kind = payload.get("kind") if isinstance(payload, dict) else None
        if kind == "school_textbook":
            return SchoolTextbookPackage.model_validate(payload)
        if kind == "extra_episode":
            return ExtraEpisodePackage.model_validate(payload)
        raise ContentPackageError(f"unsupported content package kind: {kind!r}")
    except ValidationError as error:
        messages = "; ".join(
            f"{'.'.join(str(part) for part in item['loc'])}: {item['msg']}"
            for item in error.errors()
        )
        raise ContentPackageError(f"invalid {path.name}: {messages}") from error
