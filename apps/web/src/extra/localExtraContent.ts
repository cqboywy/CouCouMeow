export type ExtraSentence = { id: string; english: string; chinese: string; is_featured: boolean };
export type ExtraVocab = { id: string; word: string; phonetic: string; meaning: string };
export type ExtraEpisode = {
  id: string; level: number; series_title: string; episode_number: number; title: string; chinese_title: string;
  local_video_filename: string; is_published: boolean; is_learned: boolean; story_summary: string; story_theme: string;
  sentences: ExtraSentence[]; vocab: ExtraVocab[]; knowledge: Array<{ id: string; title: string; explanation: string; examples: string[] }>;
  comprehension_questions: string[]; retell_steps: string[]; past_tense_pairs: Array<{ base: string; past: string; meaning: string }>;
};

const material = (id: string, english: string, chinese: string, featured = true): ExtraSentence => ({ id, english, chinese, is_featured: featured });
const word = (id: string, value: string, phonetic: string, meaning: string): ExtraVocab => ({ id, word: value, phonetic, meaning });

const thePark: ExtraEpisode = {
  id: 'l1-001-dino-buddies-the-park', level: 1, series_title: 'Dino Buddies', episode_number: 1, title: 'The Park', chinese_title: '恐龙伙伴：公园奇遇', local_video_filename: '001_Dino Buddies 1_The Park.mp4', is_published: true, is_learned: false,
  story_summary: 'Rex 想在公园交朋友，却因为大家误会他而感到孤单。后来他发现一只恐龙的尾巴尖刺卡在树里，终于有机会用善意帮助朋友。',
  story_theme: '不要只凭外表判断别人。先认真听，再用善意帮助需要帮助的朋友。',
  sentences: [material('sentence-1', 'One day Rex was in the park.', '一天，Rex 在公园里。'), material('sentence-2', 'He saw other dinosaurs.', '他看到了其他恐龙。'), material('sentence-6', 'They ran away.', '他们跑开了。'), material('sentence-8', "Don't eat me!", '别吃我！'), material('sentence-11', 'Nobody will be my friend.', '没有人愿意做我的朋友。'), material('sentence-20', "I won't eat you!", '我不会吃你！'), material('sentence-24', "I'm stuck!", '我被卡住了！'), material('sentence-30', 'Can you please help me?', '你可以帮帮我吗？')],
  vocab: [word('vocab-park', 'park', '/pɑːk/', '公园'), word('vocab-dinosaur', 'dinosaur', '/ˈdaɪ.nə.sɔːr/', '恐龙'), word('vocab-other', 'other', '/ˈʌð.ər/', '其他的'), word('vocab-run-away', 'run away', '/rʌn əˈweɪ/', '跑开；逃走'), word('vocab-friend', 'friend', '/frend/', '朋友'), word('vocab-afraid', 'afraid', '/əˈfreɪd/', '害怕的'), word('vocab-stuck', 'stuck', '/stʌk/', '被卡住的'), word('vocab-help', 'help', '/help/', '帮助；救命')],
  knowledge: [{ id: 'knowledge-1', title: '主语 + was / were + 地点', explanation: '讲过去发生的故事时，用 was 或 were 表示某人当时在哪里。', examples: ['I was in the library.', 'We were in the playground.'] }, { id: 'knowledge-2', title: 'Can you please + 动词原形?', explanation: '需要帮助时，用这个句式会更礼貌。', examples: ['Can you please open the door?', 'Can you please help me?'] }],
  comprehension_questions: ['Rex 在哪里遇到了其他恐龙？', '什么东西卡在了树里？'], retell_steps: ['Rex 来到公园，想认识新朋友。', '其他恐龙误会 Rex，害怕地跑开了。', 'Rex 发现朋友需要帮助。'], past_tense_pairs: [{ base: 'see', past: 'saw', meaning: '看见' }, { base: 'run', past: 'ran', meaning: '跑' }, { base: 'say', past: 'said', meaning: '说' }],
};

const huntingForBugs: ExtraEpisode = {
  id: 'l1-bat-and-friends-001-hunting-for-bugs', level: 1, series_title: 'Bat and Friends', episode_number: 1, title: 'Hunting for Bugs', chinese_title: '蝙蝠和朋友们：寻找小虫子', local_video_filename: '001_Bat and Friends 1_Hunting for Bugs.mp4', is_published: true, is_learned: false,
  story_summary: 'Bat 醒来后飞出山洞找虫子当晚餐。他飞过房子和树，吃饱后却发现天黑、起风又下雨，自己已经离家很远。',
  story_theme: '开心探索时也要留意时间和天气。遇到变化不慌张，下一集再和 Bat 一起找安全的回家路。',
  sentences: [material('bat-1-sentence-1', 'Bat woke up.', 'Bat 醒来了。'), material('bat-1-sentence-2', 'He flew out of his cave.', '他飞出了自己的山洞。'), material('bat-1-sentence-5', 'And I will eat them!', '然后我会吃掉它们！'), material('bat-1-sentence-9', 'He found some big bugs.', '他找到了一些大虫子。'), material('bat-1-sentence-11', 'He ate and ate and ate.', '他吃呀吃呀吃。'), material('bat-1-sentence-15', 'But now it was very dark.', '可是现在天已经很黑了。'), material('bat-1-sentence-16', 'Where is home?', '家在哪里呢？'), material('bat-1-sentence-19', 'Bat was far from home.', 'Bat 离家很远。')],
  vocab: [word('bat-1-vocab-bat', 'bat', '/bæt/', '蝙蝠'), word('bat-1-vocab-wake-up', 'wake up', '/weɪk ʌp/', '醒来'), word('bat-1-vocab-fly', 'fly', '/flaɪ/', '飞'), word('bat-1-vocab-cave', 'cave', '/keɪv/', '山洞'), word('bat-1-vocab-bug', 'bug', '/bʌɡ/', '小虫子'), word('bat-1-vocab-dark', 'dark', '/dɑːk/', '黑暗的'), word('bat-1-vocab-rain', 'rain', '/reɪn/', '雨'), word('bat-1-vocab-home', 'home', '/həʊm/', '家')],
  knowledge: [{ id: 'bat-1-knowledge-1', title: '主语 + will + 动词原形', explanation: 'will 表示“将会做”。Bat 在说自己的计划。', examples: ['I will find my book.', 'She will help her friend.'] }, { id: 'bat-1-knowledge-2', title: 'be far from + 地点', explanation: 'far from 表示“离……很远”。', examples: ['My school is far from home.', 'Bat was far from home.'] }],
  comprehension_questions: ['Bat 从哪里飞出来？', '故事结尾的天气怎么样？'], retell_steps: ['Bat 醒来，飞出山洞。', '他想找虫子吃。', '天黑、起风又下雨，Bat 发现自己离家很远。'], past_tense_pairs: [{ base: 'wake', past: 'woke', meaning: '醒来' }, { base: 'fly', past: 'flew', meaning: '飞' }, { base: 'find', past: 'found', meaning: '找到' }],
};

const lostInTheRain: ExtraEpisode = {
  id: 'l1-bat-and-friends-002-lost-in-the-rain', level: 1, series_title: 'Bat and Friends', episode_number: 2, title: 'Lost in the Rain', chinese_title: '蝙蝠和朋友们：雨中迷路', local_video_filename: '002_Bat and Friends 2_Lost in the Rain.mp4', is_published: true, is_learned: false,
  story_summary: 'Bat 在雨中又湿又迷路，想找一个干燥又安全的地方。他四处寻找，最后发现一座大大的红谷仓和一个可以进去的小洞。',
  story_theme: '迷路时先说清自己的需要，再认真观察周围。一步一步找线索，就能靠近安全的地方。',
  sentences: [material('bat-2-sentence-1', 'I am wet.', '我湿了。'), material('bat-2-sentence-2', 'And I am lost.', '而且我迷路了。'), material('bat-2-sentence-3', 'I must find a dry place.', '我必须找到一个干燥的地方。'), material('bat-2-sentence-4', 'I must find a safe place.', '我必须找到一个安全的地方。'), material('bat-2-sentence-7', 'The wind was strong.', '风很大。'), material('bat-2-sentence-12', 'It was big and red.', '它又大又红。'), material('bat-2-sentence-13', 'It was a barn!', '那是一座谷仓！'), material('bat-2-sentence-20', 'But so was Bat.', '但 Bat 也很小。')],
  vocab: [word('bat-2-vocab-wet', 'wet', '/wet/', '湿的'), word('bat-2-vocab-lost', 'lost', '/lɒst/', '迷路的'), word('bat-2-vocab-must', 'must', '/mʌst/', '必须'), word('bat-2-vocab-dry', 'dry', '/draɪ/', '干燥的'), word('bat-2-vocab-safe', 'safe', '/seɪf/', '安全的'), word('bat-2-vocab-barn', 'barn', '/bɑːn/', '谷仓'), word('bat-2-vocab-roof', 'roof', '/ruːf/', '屋顶'), word('bat-2-vocab-hole', 'hole', '/həʊl/', '洞')],
  knowledge: [{ id: 'bat-2-knowledge-1', title: 'I am + 状态', explanation: '用 I am 说出自己现在的状态或感受。', examples: ['I am happy.', 'I am lost.'] }, { id: 'bat-2-knowledge-2', title: 'must + 动词原形', explanation: 'must 表示“必须”，后面接动作。', examples: ['I must go home.', 'I must find my bag.'] }],
  comprehension_questions: ['Bat 想找哪两种地方？', 'Bat 最后看见了什么？'], retell_steps: ['Bat 在雨中淋湿，也迷路了。', '他想找干燥又安全的地方。', 'Bat 发现一座大大的红谷仓。'], past_tense_pairs: [{ base: 'see', past: 'saw', meaning: '看见' }, { base: 'fly', past: 'flew', meaning: '飞' }, { base: 'go', past: 'went', meaning: '去' }],
};

export const localExtraEpisodes = [thePark, huntingForBugs, lostInTheRain];

export function getLocalExtraEpisode(id: string) { return localExtraEpisodes.find(item => item.id === id); }

export function localExtraApi(path: string, init?: RequestInit): unknown {
  if (path === '/episodes') return { items: localExtraEpisodes };
  if (path === '/stats') return { learned_episodes: 0, total_words: localExtraEpisodes.reduce((count, item) => count + item.vocab.length, 0), practice_count: 0, mistake_count: 0 };
  const detail = getLocalExtraEpisode(path.replace('/episodes/', '').replace('/learned', ''));
  if (detail && path.endsWith('/learned')) return { ...detail, is_learned: true };
  if (detail) return detail;
  if (path === '/practice/dictation') {
    const body = JSON.parse(String(init?.body ?? '{}')) as { vocab_id?: string; answer?: string; answer_method?: string };
    const expected = localExtraEpisodes.flatMap(item => item.vocab).find(item => item.id === body.vocab_id)?.word;
    const correct = expected?.toLocaleLowerCase() === body.answer?.trim().toLocaleLowerCase();
    return { attempt_id: `offline-${body.vocab_id ?? 'attempt'}`, is_correct: Boolean(correct), message: correct ? '太棒啦，这个单词被你抓住了！' : '再听一遍，慢慢写也没关系。', similarity: correct ? 1 : 0, answer_method: body.answer_method ?? 'written' };
  }
  throw new Error(`No local extracurricular content for ${path}`);
}
