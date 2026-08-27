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
    series_title: str
    episode_number: int
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
    answer_method: Literal["written", "spoken"] = "written"


class SpeakingRequest(BaseModel):
    sentence_id: str
    transcript: str = Field(min_length=1, max_length=500)


class PracticeResult(BaseModel):
    attempt_id: str
    is_correct: bool
    message: str
    similarity: float | None = None
    answer_method: Literal["written", "spoken", "sentence_reading"] | None = None


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


_dino_episode = EpisodeDetail(
    id="l1-001-dino-buddies-the-park",
    level=1,
    series_title="Dino Buddies",
    episode_number=1,
    title="The Park",
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
        Vocab(id="vocab-dinosaur", word="dinosaur", phonetic="/ˈdaɪnəsɔː/", meaning="恐龙"),
        Vocab(id="vocab-other", word="other", phonetic="/ˈʌðə/", meaning="其他的"),
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
_bat_hunting_episode = EpisodeDetail(
    id="l1-bat-and-friends-001-hunting-for-bugs",
    level=1,
    series_title="Bat and Friends",
    episode_number=1,
    title="Hunting for Bugs",
    chinese_title="蝙蝠和朋友们：寻找小虫子",
    local_video_filename="001_Bat and Friends 1_Hunting for Bugs.mp4",
    is_published=True,
    is_learned=False,
    story_summary="Bat 醒来后飞出山洞，想找虫子当晚餐。他在天空中飞过房子和树，终于找到了大虫子和小虫子；吃饱后才发现天黑、起风又下雨，自己离家很远。",
    story_theme="开心探索时也要留意时间和天气。遇到变化不慌张，下一集再和 Bat 一起找安全的回家路。",
    sentences=[
        Sentence(id="bat-1-sentence-1", english="Bat woke up.", chinese="Bat 醒来了。", is_featured=True),
        Sentence(id="bat-1-sentence-2", english="He flew out of his cave.", chinese="他飞出了自己的山洞。", is_featured=True),
        Sentence(id="bat-1-sentence-3", english='"I want bugs!" Bat said.', chinese="Bat 说：“我想要虫子！”"),
        Sentence(id="bat-1-sentence-4", english="I will find bugs.", chinese="我会找到虫子。"),
        Sentence(id="bat-1-sentence-5", english="And I will eat them!", chinese="然后我会吃掉它们！", is_featured=True),
        Sentence(id="bat-1-sentence-6", english="Bat flew up in the sky.", chinese="Bat 飞上了天空。"),
        Sentence(id="bat-1-sentence-7", english="Bat flew over houses.", chinese="Bat 飞过房屋。"),
        Sentence(id="bat-1-sentence-8", english="He flew over trees.", chinese="他飞过树木。"),
        Sentence(id="bat-1-sentence-9", english="He found some big bugs.", chinese="他找到了一些大虫子。", is_featured=True),
        Sentence(id="bat-1-sentence-10", english="He found some little bugs.", chinese="他找到了一些小虫子。"),
        Sentence(id="bat-1-sentence-11", english="He ate and ate and ate.", chinese="他吃呀吃呀吃。", is_featured=True),
        Sentence(id="bat-1-sentence-12", english="He flew and flew and flew.", chinese="他飞呀飞呀飞。"),
        Sentence(id="bat-1-sentence-13", english="Bat was happy.", chinese="Bat 很开心。", is_featured=True),
        Sentence(id="bat-1-sentence-14", english='"It\'s time to go home and sleep!"', chinese="“该回家睡觉啦！”"),
        Sentence(id="bat-1-sentence-15", english="But now it was very dark.", chinese="可是现在天已经很黑了。", is_featured=True),
        Sentence(id="bat-1-sentence-16", english='"Where is home?" Bat said.', chinese="Bat 说：“家在哪里呢？”", is_featured=True),
        Sentence(id="bat-1-sentence-17", english="A big wind came up.", chinese="刮起了一阵大风。"),
        Sentence(id="bat-1-sentence-18", english="A lot of rain came down.", chinese="下起了很大的雨。", is_featured=True),
        Sentence(id="bat-1-sentence-19", english="Bat was far from home.", chinese="Bat 离家很远。", is_featured=True),
    ],
    vocab=[
        Vocab(id="bat-1-vocab-bat", word="bat", phonetic="/bæt/", meaning="蝙蝠"),
        Vocab(id="bat-1-vocab-wake-up", word="wake up", phonetic="/weɪk ʌp/", meaning="醒来"),
        Vocab(id="bat-1-vocab-fly", word="fly", phonetic="/flaɪ/", meaning="飞"),
        Vocab(id="bat-1-vocab-cave", word="cave", phonetic="/keɪv/", meaning="山洞"),
        Vocab(id="bat-1-vocab-bug", word="bug", phonetic="/bʌɡ/", meaning="小虫子"),
        Vocab(id="bat-1-vocab-find", word="find", phonetic="/faɪnd/", meaning="找到"),
        Vocab(id="bat-1-vocab-sky", word="sky", phonetic="/skaɪ/", meaning="天空"),
        Vocab(id="bat-1-vocab-house", word="house", phonetic="/haʊs/", meaning="房子"),
        Vocab(id="bat-1-vocab-tree", word="tree", phonetic="/triː/", meaning="树"),
        Vocab(id="bat-1-vocab-big", word="big", phonetic="/bɪɡ/", meaning="大的"),
        Vocab(id="bat-1-vocab-little", word="little", phonetic="/ˈlɪtəl/", meaning="小的"),
        Vocab(id="bat-1-vocab-dark", word="dark", phonetic="/dɑːk/", meaning="黑暗的"),
        Vocab(id="bat-1-vocab-wind", word="wind", phonetic="/wɪnd/", meaning="风"),
        Vocab(id="bat-1-vocab-rain", word="rain", phonetic="/reɪn/", meaning="雨"),
        Vocab(id="bat-1-vocab-far", word="far", phonetic="/fɑː/", meaning="远的"),
        Vocab(id="bat-1-vocab-home", word="home", phonetic="/həʊm/", meaning="家"),
    ],
    knowledge=[
        Knowledge(id="bat-1-knowledge-1", title="主语 + will + 动词原形", explanation="will 表示“将会做”。Bat 在说自己的计划。", examples=["I will find my book.", "We will play outside.", "She will help her friend."]),
        Knowledge(id="bat-1-knowledge-2", title="some + 名词复数", explanation="some 表示“一些”，后面可以接不止一个东西。", examples=["some red apples", "some little fish", "some big trees"]),
        Knowledge(id="bat-1-knowledge-3", title="动词 + and + 动词 + and + 动词", explanation="重复动作词，能让我们听见动作一直在继续。", examples=["The bird sang and sang and sang.", "We ran and ran and ran.", "The baby laughed and laughed."]),
        Knowledge(id="bat-1-knowledge-4", title="be far from + 地点", explanation="far from 表示“离……很远”。", examples=["My school is far from home.", "The park is far from here.", "Bat was far from home."]),
    ],
    comprehension_questions=["Bat 从哪里飞出来？", "Bat 想找什么？", "他飞过了哪些地方？", "Bat 找到了哪两种大小的虫子？", "为什么 Bat 后来担心了？", "故事结尾的天气怎么样？"],
    retell_steps=["Bat 醒来，飞出山洞。", "他想找虫子吃。", "他飞过房子和树，找到了虫子。", "Bat 吃饱后准备回家。", "天黑、起风又下雨，Bat 发现自己离家很远。"],
    past_tense_pairs=[PastTensePair(base="wake", past="woke", meaning="醒来"), PastTensePair(base="fly", past="flew", meaning="飞"), PastTensePair(base="find", past="found", meaning="找到"), PastTensePair(base="eat", past="ate", meaning="吃"), PastTensePair(base="come", past="came", meaning="来"), PastTensePair(base="say", past="said", meaning="说")],
)

_bat_rain_episode = EpisodeDetail(
    id="l1-bat-and-friends-002-lost-in-the-rain",
    level=1,
    series_title="Bat and Friends",
    episode_number=2,
    title="Lost in the Rain",
    chinese_title="蝙蝠和朋友们：雨中迷路",
    local_video_filename="002_Bat and Friends 2_Lost in the Rain.mp4",
    is_published=True,
    is_learned=False,
    story_summary="Bat 在雨中又湿又迷路，想找一个干燥又安全的地方。他迎着大风和雨四处寻找，终于看见一座又大又红的谷仓；Bat 飞到屋顶，倒挂着寻找进去的路，并发现了一个小洞。",
    story_theme="迷路时先说清自己的需要，再认真观察周围。一步一步找线索，就能靠近安全的地方。",
    sentences=[
        Sentence(id="bat-2-sentence-1", english='"I am wet," said Bat.', chinese="Bat 说：“我湿了。”", is_featured=True),
        Sentence(id="bat-2-sentence-2", english="And I am lost.", chinese="而且我迷路了。"),
        Sentence(id="bat-2-sentence-3", english="I must find a dry place.", chinese="我必须找到一个干燥的地方。", is_featured=True),
        Sentence(id="bat-2-sentence-4", english="I must find a safe place.", chinese="我必须找到一个安全的地方。", is_featured=True),
        Sentence(id="bat-2-sentence-5", english="So Bat flew and flew.", chinese="于是 Bat 飞呀飞呀。"),
        Sentence(id="bat-2-sentence-6", english="He looked all around.", chinese="他四处张望。", is_featured=True),
        Sentence(id="bat-2-sentence-7", english="The wind was strong.", chinese="风很大。", is_featured=True),
        Sentence(id="bat-2-sentence-8", english="The rain was wet.", chinese="雨是湿的。"),
        Sentence(id="bat-2-sentence-9", english="Bat did not see a dry place.", chinese="Bat 没有看见干燥的地方。", is_featured=True),
        Sentence(id="bat-2-sentence-10", english="He did not see a safe place.", chinese="他没有看见安全的地方。"),
        Sentence(id="bat-2-sentence-11", english="Then Bat saw something.", chinese="然后 Bat 看见了什么东西。"),
        Sentence(id="bat-2-sentence-12", english="It was big and red.", chinese="它又大又红。", is_featured=True),
        Sentence(id="bat-2-sentence-13", english="It was a barn!", chinese="那是一座谷仓！", is_featured=True),
        Sentence(id="bat-2-sentence-14", english="Bat flew to the roof.", chinese="Bat 飞到屋顶。"),
        Sentence(id="bat-2-sentence-15", english="He went over the side.", chinese="他越过了边缘。"),
        Sentence(id="bat-2-sentence-16", english="He hung by his toes.", chinese="他用脚趾倒挂着。", is_featured=True),
        Sentence(id="bat-2-sentence-17", english="He looked for a way to get in.", chinese="他寻找进去的办法。", is_featured=True),
        Sentence(id="bat-2-sentence-18", english="Then Bat saw a hole.", chinese="然后 Bat 看见了一个洞。"),
        Sentence(id="bat-2-sentence-19", english="It was little.", chinese="它很小。"),
        Sentence(id="bat-2-sentence-20", english="But so was Bat.", chinese="但 Bat 也很小。", is_featured=True),
    ],
    vocab=[
        Vocab(id="bat-2-vocab-wet", word="wet", phonetic="/wet/", meaning="湿的"),
        Vocab(id="bat-2-vocab-lost", word="lost", phonetic="/lɒst/", meaning="迷路的"),
        Vocab(id="bat-2-vocab-must", word="must", phonetic="/mʌst/", meaning="必须"),
        Vocab(id="bat-2-vocab-dry", word="dry", phonetic="/draɪ/", meaning="干燥的"),
        Vocab(id="bat-2-vocab-safe", word="safe", phonetic="/seɪf/", meaning="安全的"),
        Vocab(id="bat-2-vocab-place", word="place", phonetic="/pleɪs/", meaning="地方"),
        Vocab(id="bat-2-vocab-around", word="around", phonetic="/əˈraʊnd/", meaning="周围"),
        Vocab(id="bat-2-vocab-strong", word="strong", phonetic="/strɒŋ/", meaning="强的；大的"),
        Vocab(id="bat-2-vocab-rain", word="rain", phonetic="/reɪn/", meaning="雨"),
        Vocab(id="bat-2-vocab-barn", word="barn", phonetic="/bɑːn/", meaning="谷仓"),
        Vocab(id="bat-2-vocab-roof", word="roof", phonetic="/ruːf/", meaning="屋顶"),
        Vocab(id="bat-2-vocab-hang", word="hang", phonetic="/hæŋ/", meaning="悬挂；倒挂"),
        Vocab(id="bat-2-vocab-toe", word="toe", phonetic="/təʊ/", meaning="脚趾"),
        Vocab(id="bat-2-vocab-way", word="way", phonetic="/weɪ/", meaning="办法；道路"),
        Vocab(id="bat-2-vocab-hole", word="hole", phonetic="/həʊl/", meaning="洞"),
        Vocab(id="bat-2-vocab-little", word="little", phonetic="/ˈlɪtəl/", meaning="小的"),
    ],
    knowledge=[
        Knowledge(id="bat-2-knowledge-1", title="I am + 状态", explanation="用 I am 说出自己现在的状态或感受。", examples=["I am happy.", "I am cold.", "I am lost."]),
        Knowledge(id="bat-2-knowledge-2", title="must + 动词原形", explanation="must 表示“必须”，后面接动作。", examples=["I must go home.", "We must be careful.", "I must find my bag."]),
        Knowledge(id="bat-2-knowledge-3", title="It was + 描述", explanation="用 It was 描述刚刚看到的东西。", examples=["It was big.", "It was red.", "It was a barn."]),
        Knowledge(id="bat-2-knowledge-4", title="look for + 东西", explanation="look for 表示“寻找”。", examples=["I look for my pencil.", "She looks for a friend.", "Bat looked for a way in."]),
    ],
    comprehension_questions=["Bat 觉得自己怎么样？", "他想找哪两种地方？", "外面的风和雨怎么样？", "Bat 最后看见了什么？", "他飞到了谷仓的哪里？", "为什么小洞可能帮得上 Bat？"],
    retell_steps=["Bat 在雨中淋湿，也迷路了。", "他想找干燥又安全的地方。", "Bat 顶着风雨四处看。", "他发现一座大大的红谷仓。", "Bat 在屋顶找到一个小洞，准备想办法进去。"],
    past_tense_pairs=[PastTensePair(base="see", past="saw", meaning="看见"), PastTensePair(base="fly", past="flew", meaning="飞"), PastTensePair(base="look", past="looked", meaning="看"), PastTensePair(base="go", past="went", meaning="去"), PastTensePair(base="hang", past="hung", meaning="悬挂"), PastTensePair(base="is", past="was", meaning="是；处于")],
)

_episodes = [_dino_episode, _bat_hunting_episode, _bat_rain_episode]
_learned_episode_ids: set[str] = set()
_attempts: dict[str, PracticeResult] = {}
_mistake_attempt_ids: set[str] = set()


def _normalise(value: str) -> str:
    return " ".join("".join(character for character in value.lower() if character.isalnum() or character.isspace()).split())


def _episode_summary(episode: EpisodeDetail) -> EpisodeListItem:
    payload = episode.model_dump(exclude={"sentences", "vocab", "knowledge"})
    payload["is_learned"] = episode.id in _learned_episode_ids
    return EpisodeListItem(**payload)


def _find_episode(episode_id: str) -> EpisodeDetail | None:
    return next((episode for episode in _episodes if episode.id == episode_id), None)


@router.post("/auth/login", response_model=LoginResponse)
def login(_: LoginRequest) -> LoginResponse:
    return LoginResponse(profile=Profile(id="demo-child", display_name="小咪", role="child"))


@router.get("/episodes", response_model=EpisodeListResponse)
def list_episodes() -> EpisodeListResponse:
    # The presentation endpoint is intentionally published-only.
    return EpisodeListResponse(items=[_episode_summary(episode) for episode in _episodes if episode.is_published])


@router.get("/episodes/{episode_id}", response_model=EpisodeDetail)
def get_episode(episode_id: str) -> EpisodeDetail:
    episode = _find_episode(episode_id)
    if episode is None or not episode.is_published:
        raise HTTPException(status_code=404, detail="Episode not found")
    payload = episode.model_dump()
    payload["is_learned"] = episode_id in _learned_episode_ids
    return EpisodeDetail(**payload)


@router.post("/episodes/{episode_id}/learned", response_model=EpisodeListItem)
def mark_episode_learned(episode_id: str) -> EpisodeListItem:
    episode = _find_episode(episode_id)
    if episode is None:
        raise HTTPException(status_code=404, detail="Episode not found")
    _learned_episode_ids.add(episode_id)
    return _episode_summary(episode)


@router.post("/practice/dictation", response_model=PracticeResult)
def check_dictation(request: DictationRequest) -> PracticeResult:
    vocab = next((item for episode in _episodes for item in episode.vocab if item.id == request.vocab_id), None)
    if vocab is None:
        raise HTTPException(status_code=404, detail="Vocab not found")
    is_correct = _normalise(request.answer) == _normalise(vocab.word)
    result = PracticeResult(
        attempt_id=str(uuid4()),
        is_correct=is_correct,
        answer_method=request.answer_method,
        message=(
            "太棒啦，你说对了这个单词！"
            if is_correct and request.answer_method == "spoken"
            else "太棒啦，这个单词被你抓住了！"
            if is_correct
            else "差一点点，凑凑喵陪你再试一次。"
        ),
    )
    _attempts[result.attempt_id] = result
    if not is_correct:
        _mistake_attempt_ids.add(result.attempt_id)
    return result


@router.post("/practice/speaking", response_model=PracticeResult)
def check_speaking(request: SpeakingRequest) -> PracticeResult:
    sentence = next((item for episode in _episodes for item in episode.sentences if item.id == request.sentence_id), None)
    if sentence is None:
        raise HTTPException(status_code=404, detail="Sentence not found")
    similarity = SequenceMatcher(None, _normalise(request.transcript), _normalise(sentence.english)).ratio()
    is_correct = similarity >= 0.82
    result = PracticeResult(
        attempt_id=str(uuid4()),
        is_correct=is_correct,
        similarity=round(similarity, 2),
        answer_method="sentence_reading",
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
        total_words=sum(len(episode.vocab) for episode in _episodes if episode.is_published),
        practice_count=len(_attempts),
        mistake_count=len(_mistake_attempt_ids),
    )
