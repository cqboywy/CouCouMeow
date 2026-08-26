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
    is_featured: bool = False


class Vocab(BaseModel):
    id: str
    word: str
    phonetic: str
    meaning: str


class Knowledge(BaseModel):
    id: str
    title: str
    explanation: str
    examples: list[str]


class PastTensePair(BaseModel):
    base: str
    past: str
    meaning: str


class EpisodeDetail(EpisodeListItem):
    chinese_title: str
    story_summary: str
    story_theme: str
    sentences: list[Sentence]
    vocab: list[Vocab]
    knowledge: list[Knowledge]
    comprehension_questions: list[str]
    retell_steps: list[str]
    past_tense_pairs: list[PastTensePair]


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
    id="l1-001-dino-buddies-the-park",
    level=1,
    title="Dino Buddies 1: The Park",
    chinese_title="恐龙伙伴：公园奇遇",
    local_video_filename="001_Dino Buddies 1_The Park.mp4",
    is_published=True,
    is_learned=False,
    story_summary=(
        "Rex 在公园里想和其他恐龙交朋友，可大家因为他是霸王龙而害怕地跑开了。"
        "失落的 Rex 后来听见呼救声，才发现一只恐龙并不是害怕他，而是尾巴上的尖刺卡在了树里。"
    ),
    story_theme="不要只凭外表判断别人。先认真听，再用善意帮助需要帮助的朋友。",
    sentences=[
        Sentence(id="sentence-1", english="One day Rex was in the park.", chinese="一天，Rex 在公园里。", is_featured=True),
        Sentence(id="sentence-2", english="He saw other dinosaurs.", chinese="他看到了其他恐龙。", is_featured=True),
        Sentence(id="sentence-3", english='"Hi!" Rex said.', chinese="“嗨！”Rex 说道。"),
        Sentence(id="sentence-4", english='"Help!" a dinosaur cried.', chinese="“救命！”一只恐龙喊道。"),
        Sentence(id="sentence-5", english='"A T. rex!" the other one screamed.', chinese="“一只霸王龙！”另一只恐龙尖叫道。"),
        Sentence(id="sentence-6", english="They ran away.", chinese="他们跑开了。", is_featured=True),
        Sentence(id="sentence-7", english='Rex saw another dinosaur. "Hello!"', chinese="Rex 看见了另一只恐龙。“你好！”"),
        Sentence(id="sentence-8", english='"Don\'t eat me!" she said.', chinese="“别吃我！”她说道。", is_featured=True),
        Sentence(id="sentence-9", english="She ran away too.", chinese="她也跑开了。"),
        Sentence(id="sentence-10", english="Rex sighed.", chinese="Rex 叹了口气。"),
        Sentence(id="sentence-11", english='"Nobody will be my friend."', chinese="“没有人愿意做我的朋友。”", is_featured=True),
        Sentence(id="sentence-12", english="Rex kicked a rock.", chinese="Rex 踢了一块石头。"),
        Sentence(id="sentence-13", english="He sat down.", chinese="他坐了下来。"),
        Sentence(id="sentence-14", english='"Help!" cried a dinosaur.', chinese="“救命！”一只恐龙喊道。"),
        Sentence(id="sentence-15", english="He stood behind a tree.", chinese="他站在一棵树后面。", is_featured=True),
        Sentence(id="sentence-16", english='"Oh no," Rex said.', chinese="“哦，不。”Rex 说道。"),
        Sentence(id="sentence-17", english='"He\'s afraid of me too!"', chinese="“他也害怕我！”", is_featured=True),
        Sentence(id="sentence-18", english='"Help!" the dinosaur cried again.', chinese="“救命！”那只恐龙又喊了一次。"),
        Sentence(id="sentence-19", english="Rex got mad.", chinese="Rex 生气了。"),
        Sentence(id="sentence-20", english='"I won\'t eat you!" he said.', chinese="“我不会吃你的！”他说道。", is_featured=True),
        Sentence(id="sentence-21", english="The dinosaur blinked.", chinese="那只恐龙眨了眨眼。"),
        Sentence(id="sentence-22", english='Then he said, "Help me!"', chinese="然后他说：“帮帮我！”"),
        Sentence(id="sentence-23", english='"Huh?" Rex said.', chinese="“啊？”Rex 说道。"),
        Sentence(id="sentence-24", english='"I\'m stuck!" the dinosaur said.', chinese="“我被卡住了！”那只恐龙说道。", is_featured=True),
        Sentence(id="sentence-25", english='"See?"', chinese="“看见了吗？”"),
        Sentence(id="sentence-26", english="Rex looked.", chinese="Rex 看了看。"),
        Sentence(id="sentence-27", english="The dinosaur's tail had spikes.", chinese="这只恐龙的尾巴上有尖刺。", is_featured=True),
        Sentence(id="sentence-28", english="One spike was stuck in a tree.", chinese="一根尖刺卡在了树里。", is_featured=True),
        Sentence(id="sentence-29", english="The dinosaur grinned.", chinese="那只恐龙咧嘴笑了。"),
        Sentence(id="sentence-30", english='"Can you please help me?"', chinese="“你可以帮帮我吗？”", is_featured=True),
    ],
    vocab=[
        Vocab(id="vocab-park", word="park", phonetic="/pɑːk/", meaning="公园"),
        Vocab(id="vocab-dinosaur", word="dinosaur", phonetic="/ˈdaɪ.nə.sɔːr/", meaning="恐龙"),
        Vocab(id="vocab-other", word="other", phonetic="/ˈʌð.ər/", meaning="其他的"),
        Vocab(id="vocab-run-away", word="run away", phonetic="/rʌn əˈweɪ/", meaning="跑开；逃走"),
        Vocab(id="vocab-friend", word="friend", phonetic="/frend/", meaning="朋友"),
        Vocab(id="vocab-afraid", word="afraid", phonetic="/əˈfreɪd/", meaning="害怕的"),
        Vocab(id="vocab-rock", word="rock", phonetic="/rɒk/", meaning="石头"),
        Vocab(id="vocab-behind", word="behind", phonetic="/bɪˈhaɪnd/", meaning="在……后面"),
        Vocab(id="vocab-tree", word="tree", phonetic="/triː/", meaning="树"),
        Vocab(id="vocab-mad", word="mad", phonetic="/mæd/", meaning="生气的"),
        Vocab(id="vocab-stuck", word="stuck", phonetic="/stʌk/", meaning="被卡住的"),
        Vocab(id="vocab-tail", word="tail", phonetic="/teɪl/", meaning="尾巴"),
        Vocab(id="vocab-spike", word="spike", phonetic="/spaɪk/", meaning="尖刺"),
        Vocab(id="vocab-help", word="help", phonetic="/help/", meaning="帮助；救命"),
        Vocab(id="vocab-please", word="please", phonetic="/pliːz/", meaning="请"),
        Vocab(id="vocab-grin", word="grin", phonetic="/ɡrɪn/", meaning="咧嘴笑"),
        Vocab(id="vocab-blink", word="blink", phonetic="/blɪŋk/", meaning="眨眼"),
    ],
    knowledge=[
        Knowledge(
            id="knowledge-1",
            title="主语 + was / were + 地点",
            explanation="讲过去发生的故事时，用 was 或 were 表示某人当时在哪里。",
            examples=["I was in the library.", "The cat was in the garden.", "We were in the playground."],
        ),
        Knowledge(
            id="knowledge-2",
            title="Don't + 动词原形",
            explanation="用 Don't 加动作，告诉别人不要做某件事。",
            examples=["Don't run here.", "Don't touch it.", "Don't open the door."],
        ),
        Knowledge(
            id="knowledge-3",
            title="be afraid of + 人或事物",
            explanation="用 be afraid of 表达害怕某个人或某样东西。",
            examples=["I am afraid of spiders.", "She is afraid of the dark.", "The kitten is afraid of the dog."],
        ),
        Knowledge(
            id="knowledge-4",
            title="will / won't + 动词原形",
            explanation="will 表示将会做，won't 表示将不会做。",
            examples=["I will help you.", "We will be friends.", "I won't run away."],
        ),
        Knowledge(
            id="knowledge-5",
            title="Can you please + 动词原形?",
            explanation="需要别人帮忙时，用这个句式会更礼貌。",
            examples=["Can you please open the door?", "Can you please read this word?", "Can you please wait for me?"],
        ),
        Knowledge(
            id="knowledge-6",
            title="be stuck + 地点",
            explanation="be stuck 表示某人或某物被卡住了。",
            examples=["The ball is stuck under the chair.", "My zipper is stuck.", "The kite is stuck in the tree."],
        ),
    ],
    comprehension_questions=[
        "Rex 在哪里遇到了其他恐龙？",
        "为什么其他恐龙看到 Rex 后跑开了？",
        "Rex 觉得没有朋友时是什么心情？",
        "最后那只恐龙是真的害怕 Rex 吗？",
        "什么东西卡在了树里？",
        "恐龙用了哪句话礼貌地请求帮助？",
    ],
    retell_steps=[
        "Rex 来到公园，想认识新朋友。",
        "其他恐龙误会 Rex，害怕地跑开了。",
        "Rex 感到孤单和难过。",
        "Rex 听到另一只恐龙呼救。",
        "Rex 发现恐龙的尾巴尖刺卡在了树里。",
    ],
    past_tense_pairs=[
        PastTensePair(base="see", past="saw", meaning="看见"),
        PastTensePair(base="say", past="said", meaning="说"),
        PastTensePair(base="run", past="ran", meaning="跑"),
        PastTensePair(base="sit", past="sat", meaning="坐"),
        PastTensePair(base="stand", past="stood", meaning="站"),
        PastTensePair(base="get", past="got", meaning="变得；得到"),
        PastTensePair(base="kick", past="kicked", meaning="踢"),
        PastTensePair(base="look", past="looked", meaning="看"),
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
