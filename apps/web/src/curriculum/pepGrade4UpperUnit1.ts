import type { CurriculumLesson, CurriculumTextbook, CurriculumUnit, SchoolLearningItem } from './types';

const word = (id: string, english: string, chinese: string, phonetic?: string): SchoolLearningItem => ({
  id: `pep4a-u1-${id}`,
  kind: 'word',
  english,
  chinese,
  phonetic,
});

const sentence = (id: string, english: string, chinese: string): SchoolLearningItem => ({
  id: `pep4a-u1-${id}`,
  kind: 'sentence',
  english,
  chinese,
});

const phonics = (id: string, english: string, chinese: string): SchoolLearningItem => ({
  id: `pep4a-u1-${id}`,
  kind: 'phonics',
  english,
  chinese,
});

const steps = [
  { kind: 'learn' as const, title: '学课本' },
  { kind: 'practice' as const, title: '练一练' },
  { kind: 'check' as const, title: '小检查' },
];

const lesson = (value: Omit<CurriculumLesson, 'unitId' | 'textbookId' | 'steps'>): CurriculumLesson => ({
  ...value,
  unitId: 'pep4a-u1',
  textbookId: 'pep-grade4-upper',
  steps,
});

const jobs = [
  word('farmer', 'farmer', '农民', '/ˈfɑːrmər/'),
  word('nurse', 'nurse', '护士', '/nɜːrs/'),
  word('doctor', 'doctor', '医生', '/ˈdɑːktər/'),
  word('office-worker', 'office worker', '办公室职员', '/ˈɔːfɪs ˌwɜːrkər/'),
  word('factory-worker', 'factory worker', '工厂工人', '/ˈfæktəri ˌwɜːrkər/'),
];

const chores = [
  word('cook', 'cook', '做饭', '/kʊk/'),
  word('look-after', 'look after', '照顾', '/lʊk ˈæftər/'),
  word('sweep-floor', 'sweep the floor', '扫地', '/swiːp ðə flɔːr/'),
  word('clean-room', 'clean the room', '打扫房间', '/kliːn ðə ruːm/'),
];

const chWords = ['Chinese', 'chair', 'child', 'lunch', 'teacher', 'kitchen'].map((english, index) =>
  phonics(`ch-${index + 1}`, english, `听一听 ${english} 里的 ch 发音`),
);

export const pepGrade4UpperUnit1: CurriculumUnit = {
  id: 'pep4a-u1',
  textbookId: 'pep-grade4-upper',
  sequence: 1,
  title: 'Helping at home',
  chineseTitle: '在家帮忙',
  bigQuestion: 'What do family do together?',
  bigQuestionChinese: '家人会一起做什么？',
  objectives: [
    { id: 'pep4a-u1-objective-jobs', title: '询问并介绍家人的职业' },
    { id: 'pep4a-u1-objective-family', title: '表达自己和家人一起做什么' },
    { id: 'pep4a-u1-objective-help', title: '表达自己怎样帮助家人' },
    { id: 'pep4a-u1-objective-ch', title: '认读和拼写含 ch 的单词' },
  ],
  lessons: [
    lesson({
      id: 'pep4a-u1-l1', sequence: 1, title: '认识 Helping at home', subtitle: '看看家人怎样一起帮忙',
      pageReferences: [2, 3], durationMinutes: 10, concepts: ['family', 'help', 'chores'],
      vocabulary: [word('family', 'family', '家庭', '/ˈfæməli/'), word('chores', 'chores', '家务', '/tʃɔːrz/'), ...chores.slice(2)],
      sentences: [sentence('can-you-help', 'Can you help?', '你能帮忙吗？'), sentence('yes-i-can', 'Yes, I can.', '是的，我能。')],
      phonics: [], explanation: '先观察课本里的家庭场景，再说一说自己在家能做什么。',
      exercises: [
        { id: 'pep4a-u1-l1-e1', stage: 'practice', kind: 'choice', prompt: '“家务”用英语怎么说？', answer: 'chores', options: ['chores', 'chairs', 'doctors'], hint: '课本歌谣里出现了 do some chores。', item: word('chores', 'chores', '家务') },
        { id: 'pep4a-u1-l1-e2', stage: 'practice', kind: 'choice', prompt: '哪一句是在说“我能帮忙”？', answer: 'Yes, I can.', options: ['Yes, I can.', 'I am a nurse.', 'She has long hair.'], hint: '回答 Can you help? 时使用 can。', item: sentence('yes-i-can', 'Yes, I can.', '是的，我能。') },
        { id: 'pep4a-u1-l1-e3', stage: 'check', kind: 'typing', prompt: '补全：Yes, I ___.', answer: 'can', hint: '回答 Can you help? 时使用 can。', item: sentence('yes-i-can', 'Yes, I can.', '是的，我能。') },
        { id: 'pep4a-u1-l1-e4', stage: 'check', kind: 'typing', prompt: '写出“家务”：', answer: 'chores', hint: '想一想 do some ...。', item: word('chores', 'chores', '家务') },
      ],
    }),
    lesson({
      id: 'pep4a-u1-l2', sequence: 2, title: '家人做什么工作', subtitle: 'Part A · 职业与家人',
      pageReferences: [4, 5], durationMinutes: 15, concepts: ['family', 'job'], vocabulary: jobs,
      sentences: [sentence('whats-job', "What's your mother's job?", '你妈妈是做什么工作的？'), sentence('shes-doctor', "She's a doctor.", '她是一名医生。')],
      phonics: [], explanation: '用 What’s ... job? 询问职业，再用 He’s/She’s ... 回答。',
      exercises: [
        { id: 'pep4a-u1-l2-e1', stage: 'practice', kind: 'choice', prompt: '护士是哪个单词？', answer: 'nurse', options: ['farmer', 'nurse', 'doctor'], hint: '照顾病人的职业。', item: jobs[1] },
        { id: 'pep4a-u1-l2-e2', stage: 'practice', kind: 'choice', prompt: '哪一句是在介绍朋友的职业？', answer: "She's a doctor.", options: ["She's a doctor.", 'Can you help?', 'I can cook.'], hint: '用 She is 或 She’s 来介绍她的职业。', item: sentence('shes-doctor', "She's a doctor.", '她是一名医生。') },
        { id: 'pep4a-u1-l2-e3', stage: 'check', kind: 'typing', prompt: "补全：She's a ___.", answer: 'doctor', hint: '课本对话中妈妈是一名医生。', item: jobs[2] },
        { id: 'pep4a-u1-l2-e4', stage: 'check', kind: 'typing', prompt: "补全：What's your mother's __?", answer: 'job', hint: '用这个词询问职业。', item: sentence('whats-job', "What's your mother's job?", '你妈妈是做什么工作的？') },
      ],
    }),
    lesson({
      id: 'pep4a-u1-l3', sequence: 3, title: 'ch 拼读小课堂', subtitle: '听出并读准 ch',
      pageReferences: [6], durationMinutes: 10, concepts: ['phonics-ch'], vocabulary: [], sentences: [], phonics: chWords,
      explanation: '在 Chinese、chair、child、lunch、teacher 和 kitchen 中寻找 ch 的发音。',
      exercises: [
        { id: 'pep4a-u1-l3-e1', stage: 'practice', kind: 'choice', prompt: '哪个单词含有 ch？', answer: 'chair', options: ['chair', 'farmer', 'nurse'], hint: '观察单词的开头。', item: chWords[1] },
        { id: 'pep4a-u1-l3-e2', stage: 'practice', kind: 'choice', prompt: '哪个词里有 ch 的发音？', answer: 'lunch', options: ['lunch', 'farmer', 'nurse'], hint: '看一看单词中间。', item: chWords[3] },
        { id: 'pep4a-u1-l3-e3', stage: 'check', kind: 'typing', prompt: '补全单词：__ild', answer: 'ch', hint: '孩子是 child。', item: chWords[2] },
        { id: 'pep4a-u1-l3-e4', stage: 'check', kind: 'typing', prompt: '补全单词：tea__er', answer: 'ch', hint: '老师是 teacher。', item: chWords[4] },
      ],
    }),
    lesson({
      id: 'pep4a-u1-l4', sequence: 4, title: '我能帮助家人', subtitle: 'Part B · 家务表达',
      pageReferences: [7, 8], durationMinutes: 15, concepts: ['help', 'can', 'chores'], vocabulary: chores,
      sentences: [sentence('i-can-cook', 'I can cook.', '我会做饭。'), sentence('we-can-chores', 'We can do some chores.', '我们可以做一些家务。')],
      phonics: [], explanation: '用 I can ... 说一说自己能为家人做什么。',
      exercises: [
        { id: 'pep4a-u1-l4-e1', stage: 'practice', kind: 'choice', prompt: '“扫地”是哪一个表达？', answer: 'sweep the floor', options: ['look after', 'sweep the floor', 'office worker'], hint: 'sweep 表示“扫”。', item: chores[2] },
        { id: 'pep4a-u1-l4-e2', stage: 'practice', kind: 'choice', prompt: '哪一句在说“我会做饭”？', answer: 'I can cook.', options: ['I can cook.', 'She is a nurse.', 'He has short hair.'], hint: '用 I can 加动作。', item: sentence('i-can-cook', 'I can cook.', '我会做饭。') },
        { id: 'pep4a-u1-l4-e3', stage: 'check', kind: 'typing', prompt: '补全：I can ___ for my family.', answer: 'cook', hint: '做饭是 cook。', item: chores[0] },
        { id: 'pep4a-u1-l4-e4', stage: 'check', kind: 'typing', prompt: '补全：We can do some ___.', answer: 'chores', hint: '家务是 chores。', item: sentence('we-can-chores', 'We can do some chores.', '我们可以做一些家务。') },
      ],
    }),
    lesson({
      id: 'pep4a-u1-l5', sequence: 5, title: '读便条，写一写', subtitle: 'Read and write',
      pageReferences: [9], durationMinutes: 15, concepts: ['reading', 'job', 'help'], vocabulary: [jobs[1], chores[1], chores[2]],
      sentences: [sentence('mum-great-nurse', 'You are a great nurse.', '你是一位很棒的护士。'), sentence('look-after-sister', 'I can look after my baby sister.', '我能照顾我的小妹妹。')],
      phonics: [], explanation: '读懂小林和妈妈的便条，找出妈妈的职业和小林能做的家务。',
      exercises: [
        { id: 'pep4a-u1-l5-e1', stage: 'practice', kind: 'choice', prompt: "What's the mother's job?", answer: 'nurse', options: ['nurse', 'farmer', 'office worker'], hint: '便条开头写着 You are a great nurse。', item: jobs[1] },
        { id: 'pep4a-u1-l5-e2', stage: 'practice', kind: 'choice', prompt: '“照顾”是哪一个表达？', answer: 'look after', options: ['look after', 'sweep the floor', 'cook'], hint: 'look after 表示照顾。', item: chores[1] },
        { id: 'pep4a-u1-l5-e3', stage: 'check', kind: 'typing', prompt: '补全：I can look ___ my baby sister.', answer: 'after', hint: 'look after 表示“照顾”。', item: chores[1] },
        { id: 'pep4a-u1-l5-e4', stage: 'check', kind: 'typing', prompt: '补全：You are a great ___.', answer: 'nurse', hint: '便条里夸妈妈是一位很棒的护士。', item: sentence('mum-great-nurse', 'You are a great nurse.', '你是一位很棒的护士。') },
      ],
    }),
    lesson({
      id: 'pep4a-u1-l6', sequence: 6, title: '我的 Happy family', subtitle: 'Project · Self-check · Reading time',
      pageReferences: [10, 11, 12, 13], durationMinutes: 15, concepts: ['project', 'family', 'review'], vocabulary: [...jobs.slice(0, 3), ...chores.slice(0, 3)],
      sentences: [sentence('happy-family', 'I have a happy family.', '我有一个幸福的家庭。'), sentence('cook-together', 'We often cook together.', '我们经常一起做饭。')],
      phonics: chWords, explanation: '做一张家庭海报，用本单元的职业和家务表达介绍家人，并完成自评。',
      exercises: [
        { id: 'pep4a-u1-l6-e1', stage: 'practice', kind: 'self_check', prompt: '我能用英语说出家人的职业。', answer: 'yes', options: ['yes'], hint: '想一想 What’s your mother’s job? 应该怎样回答。' },
        { id: 'pep4a-u1-l6-e2', stage: 'practice', kind: 'self_check', prompt: '我能用 I can 说一件自己能做的家务。', answer: 'yes', options: ['yes'], hint: '可以试试 I can cook.。' },
        { id: 'pep4a-u1-l6-e3', stage: 'check', kind: 'typing', prompt: '补全：We often ___ together.', answer: 'cook', hint: '用本单元学过的一项家庭活动完成句子。', item: sentence('cook-together', 'We often cook together.', '我们经常一起做饭。') },
        { id: 'pep4a-u1-l6-e4', stage: 'check', kind: 'typing', prompt: '补全：I have a happy ___.', answer: 'family', hint: '家人组成 family。', item: sentence('happy-family', 'I have a happy family.', '我有一个幸福的家庭。') },
      ],
    }),
  ],
};

export const pepGrade4Upper: CurriculumTextbook = {
  id: 'pep-grade4-upper',
  curriculum: 'PEP',
  grade: 4,
  semester: 'upper',
  title: '人教版 PEP 四年级上册',
  currentUnitId: pepGrade4UpperUnit1.id,
  units: [pepGrade4UpperUnit1],
};

export const getLessonById = (lessonId: string) => pepGrade4UpperUnit1.lessons.find(lessonItem => lessonItem.id === lessonId);
