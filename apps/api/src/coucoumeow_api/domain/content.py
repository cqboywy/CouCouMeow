from typing import Annotated

from pydantic import BaseModel, Field

NonEmptyText = Annotated[str, Field(min_length=1)]
SequenceNo = Annotated[int, Field(ge=1)]


class SentenceContent(BaseModel):
    sequence_no: SequenceNo
    english_text: NonEmptyText
    chinese_translation: NonEmptyText


class VocabContent(BaseModel):
    sequence_no: SequenceNo
    word: NonEmptyText
    phonetic: NonEmptyText
    chinese_meaning: NonEmptyText


class KnowledgeContent(BaseModel):
    sequence_no: SequenceNo
    title: NonEmptyText
    grammar_explanation: NonEmptyText
    core_knowledge: NonEmptyText


class ContentGenerationRequest(BaseModel):
    level: Annotated[int, Field(ge=1, le=9)]
    title: NonEmptyText
    sentences: list[NonEmptyText] = Field(min_length=1)


class GeneratedEpisodeContent(BaseModel):
    sentences: list[SentenceContent] = Field(min_length=1)
    vocab: list[VocabContent] = Field(min_length=1)
    knowledge: list[KnowledgeContent] = Field(min_length=1)
