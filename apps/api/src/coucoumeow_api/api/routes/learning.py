"""MVP learning APIs backed by an in-memory repository.

The routes deliberately depend on a small repository boundary so the next
iteration can replace this demo data with Supabase without changing the UI API.
"""

from __future__ import annotations

from difflib import SequenceMatcher
from typing import Literal
from uuid import uuid4

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(tags=["learning"])


class EpisodeListItem(BaseModel):
    id: str
    level: int
    title: str
    local_video_filename: str
    is_published: bool
    is_learned: bool


class Sentence(BaseModel):
    id: str
    english: str
    chinese: str


class Vocab(BaseModel):
    id: str
    word: str
    phonetic: str
    meaning: str


class Knowledge(BaseModel):
    id: str
    title: str
    explanation: str


class EpisodeDetail(EpisodeListItem):
    sentences: list[Sentence]
    vocab: list[Vocab]
    knowledge: list[Knowledge]


class EpisodeListResponse(BaseModel):
    items: list[EpisodeListItem]


class DictationRequest(BaseModel):
    vocab_id: str
    answer: str = Field(min_length=1, max_length=120)
    mode: Literal["meaning", "audio"]


class SpeakingRequest(BaseModel):
    sentence_id: str
    transcript: str = Field(min_length=1, max_length=500)


class PracticeResult(BaseModel):
    attempt_id: str
    is_correct: bool
    message: str
    similarity: float | None = None


class StatsResponse(BaseModel):
    learned_episodes: int
    total_words: int
    practice_count: int
    mistake_count: int


class LoginRequest(BaseModel):
    email: str = Field(pattern=r"^.+@.+\..+$")


class Profile(BaseModel):
    id: str
    display_name: str
    role: str


class LoginResponse(BaseModel):
    profile: Profile


_episode = EpisodeDetail(
    id="l1-01-the-lost-kitten",
    level=1,
    title="The Lost Kitten",
    local_video_filename="L1-01-The-Lost-Kitten.mp4",
    is_published=True,
    is_learned=False,
    sentences=[
        Sentence(id="sentence-1", english="Hello, little kitten.", chinese="你好，小猫咪。"),
        Sentence(id="sentence-2", english="Are you looking for your home?", chinese="你在找你的家吗？"),
        Sentence(id="sentence-3", english="Let's walk together.", chinese="让我们一起走吧。"),
    ],
    vocab=[
        Vocab(id="vocab-kitten", word="kitten", phonetic="/ˈkɪtən/", meaning="小猫"),
        Vocab(id="vocab-little", word="little", phonetic="/ˈlɪtəl/", meaning="小的；年幼的"),
        Vocab(id="vocab-home", word="home", phonetic="/həʊm/", meaning="家"),
        Vocab(id="vocab-walk", word="walk", phonetic="/wɔːk/", meaning="走路；散步"),
    ],
    knowledge=[
        Knowledge(id="knowledge-1", title="Are you ...?", explanation="用 Are you ...? 温柔地问对方现在是不是正在做某件事。"),
        Knowledge(id="knowledge-2", title="Let's ...", explanation="用 Let's 加动词原形，邀请朋友一起做一件事。"),
    ],
)
_learned_episode_ids: set[str] = set()
_attempts: dict[str, PracticeResult] = {}
_mistake_attempt_ids: set[str] = set()


def _normalise(value: str) -> str:
    return " ".join("".join(character for character in value.lower() if character.isalnum() or character.isspace()).split())


def _episode_summary() -> EpisodeListItem:
    payload = _episode.model_dump(exclude={"sentences", "vocab", "knowledge"})
    payload["is_learned"] = _episode.id in _learned_episode_ids
    return EpisodeListItem(**payload)


@router.post("/auth/login", response_model=LoginResponse)
def login(_: LoginRequest) -> LoginResponse:
    return LoginResponse(profile=Profile(id="demo-child", display_name="小咪", role="child"))


@router.get("/episodes", response_model=EpisodeListResponse)
def list_episodes() -> EpisodeListResponse:
    # The presentation endpoint is intentionally published-only.
    return EpisodeListResponse(items=[_episode_summary()] if _episode.is_published else [])


@router.get("/episodes/{episode_id}", response_model=EpisodeDetail)
def get_episode(episode_id: str) -> EpisodeDetail:
    if episode_id != _episode.id or not _episode.is_published:
        raise HTTPException(status_code=404, detail="Episode not found")
    payload = _episode.model_dump()
    payload["is_learned"] = episode_id in _learned_episode_ids
    return EpisodeDetail(**payload)


@router.post("/episodes/{episode_id}/learned", response_model=EpisodeListItem)
def mark_episode_learned(episode_id: str) -> EpisodeListItem:
    if episode_id != _episode.id:
        raise HTTPException(status_code=404, detail="Episode not found")
    _learned_episode_ids.add(episode_id)
    return _episode_summary()


@router.post("/practice/dictation", response_model=PracticeResult)
def check_dictation(request: DictationRequest) -> PracticeResult:
    vocab = next((item for item in _episode.vocab if item.id == request.vocab_id), None)
    if vocab is None:
        raise HTTPException(status_code=404, detail="Vocab not found")
    is_correct = _normalise(request.answer) == _normalise(vocab.word)
    result = PracticeResult(
        attempt_id=str(uuid4()),
        is_correct=is_correct,
        message="太棒啦，这个单词被你抓住了！" if is_correct else "差一点点，凑凑喵陪你再试一次。",
    )
    _attempts[result.attempt_id] = result
    if not is_correct:
        _mistake_attempt_ids.add(result.attempt_id)
    return result


@router.post("/practice/speaking", response_model=PracticeResult)
def check_speaking(request: SpeakingRequest) -> PracticeResult:
    sentence = next((item for item in _episode.sentences if item.id == request.sentence_id), None)
    if sentence is None:
        raise HTTPException(status_code=404, detail="Sentence not found")
    similarity = SequenceMatcher(None, _normalise(request.transcript), _normalise(sentence.english)).ratio()
    is_correct = similarity >= 0.82
    result = PracticeResult(
        attempt_id=str(uuid4()),
        is_correct=is_correct,
        similarity=round(similarity, 2),
        message="读得真认真，凑凑喵听懂啦！" if is_correct else "已经很接近啦，你可以再慢一点读一次。",
    )
    _attempts[result.attempt_id] = result
    if not is_correct:
        _mistake_attempt_ids.add(result.attempt_id)
    return result


@router.post("/practice/attempts/{attempt_id}/correct", response_model=PracticeResult)
def manually_correct_attempt(attempt_id: str) -> PracticeResult:
    attempt = _attempts.get(attempt_id)
    if attempt is None:
        raise HTTPException(status_code=404, detail="Attempt not found")
    corrected = attempt.model_copy(update={"is_correct": True, "message": "已按你的判断收好啦，凑凑喵相信你！"})
    _attempts[attempt_id] = corrected
    _mistake_attempt_ids.discard(attempt_id)
    return corrected


@router.get("/stats", response_model=StatsResponse)
def get_stats() -> StatsResponse:
    return StatsResponse(
        learned_episodes=len(_learned_episode_ids),
        total_words=len(_episode.vocab),
        practice_count=len(_attempts),
        mistake_count=len(_mistake_attempt_ids),
    )
