import type { TextbookFocusItem, TextbookPage, TextbookPageCheck, TextbookPageSection } from './types';

const focus = (page: number, id: string, english: string, chinese: string, source: TextbookFocusItem['source'], note: string): TextbookFocusItem => ({
  id: `u1-p${page}-${id}`, kind: english.includes(' ') || english.includes('?') ? 'sentence' : 'word', english, chinese, source, note,
});

const checks = (page: number, first: Omit<TextbookPageCheck, 'id'>, second: Omit<TextbookPageCheck, 'id'>): TextbookPageCheck[] => [
  { id: `p${page}-check-1`, ...first }, { id: `p${page}-check-2`, ...second },
];

const page = (printedPage: number, title: string, chineseTitle: string, focusItems: TextbookFocusItem[], sections: TextbookPageSection[], practicePrompts: TextbookPage['practicePrompts'], pageChecks: TextbookPageCheck[], finishItems: string[]): TextbookPage => ({
  id: `pep4a-u1-p${printedPage}`, textbookId: 'pep-grade4-upper', unitId: 'pep4a-u1', printedPage, title, chineseTitle, focusItems, sections, practicePrompts, checks: pageChecks, finishItems,
});

const page2 = page(2, 'Helping at home', '在家帮忙', [
  focus(2, 'family', 'family', '家人；家庭', 'appendix-word', 'Unit 1 单元词（Appendix 2）'),
  focus(2, 'together', 'together', '一起', 'appendix-vocabulary', '本单元大问题中的常用词'),
], [{ id: 'big-question', label: 'Big Question', chineseLabel: '大问题', sentences: [
  { id: 'p2-question', english: 'What do family do together?', chinese: '家人会一起做什么？', focusItemIds: ['u1-p2-family', 'u1-p2-together'] },
] }], [
  { id: 'p2-practice-question', chinesePrompt: '家人会一起做什么？', answer: 'What do family do together?', relatedSentenceId: 'p2-question' },
  { id: 'p2-practice-family', chinesePrompt: '家人一起做什么？', answer: 'What does the family do together?', relatedSentenceId: 'p2-question' },
], checks(2,
  { prompt: '“家人；家庭”用英语怎么说？', answer: 'family', hint: '本单元大问题中的关键词。', item: { id: 'u1-p2-family', kind: 'word', english: 'family', chinese: '家人；家庭' } },
  { prompt: '补全：What do family do __?', answer: 'together', hint: '表示“一起”。', item: { id: 'u1-p2-together', kind: 'word', english: 'together', chinese: '一起' } },
), ['读出本单元的大问题。', '知道本单元会学习家人、职业和家务。', '想一想：今天我能和家人一起做什么？']);

const page5 = page(5, 'How are families different?', '家人各有不同', [
  focus(5, 'farmer', 'farmer', '农民', 'appendix-word', 'Unit 1 单元词（Appendix 2）'),
  focus(5, 'nurse', 'nurse', '护士', 'appendix-word', 'Unit 1 单元词（Appendix 2）'),
  focus(5, 'doctor', 'doctor', '医生', 'appendix-word', 'Unit 1 单元词（Appendix 2）'),
  focus(5, 'office-worker', 'office worker', '办公室职员', 'appendix-vocabulary', 'Unit 1 词汇表（Appendix 3）'),
  focus(5, 'factory-worker', 'factory worker', '工厂工人', 'appendix-vocabulary', 'Unit 1 词汇表（Appendix 3）'),
  focus(5, 'job-question', "What's your father's job?", '你爸爸是做什么工作的？', 'appendix-expression', '询问职业的常用表达（Appendix 4）'),
], [
  { id: 'lets-learn', label: 'Let’s learn', chineseLabel: '学一学', sentences: [
    { id: 'p5-helpful', english: 'They are helpful!', chinese: '他们很乐于助人！' },
    { id: 'p5-farmer', english: 'farmer', chinese: '农民', focusItemIds: ['u1-p5-farmer'] },
    { id: 'p5-nurse', english: 'nurse', chinese: '护士', focusItemIds: ['u1-p5-nurse'] },
    { id: 'p5-doctor', english: 'doctor', chinese: '医生', focusItemIds: ['u1-p5-doctor'] },
    { id: 'p5-office-worker', english: 'office worker', chinese: '办公室职员', focusItemIds: ['u1-p5-office-worker'] },
    { id: 'p5-factory-worker', english: 'factory worker', chinese: '工厂工人', focusItemIds: ['u1-p5-factory-worker'] },
    { id: 'p5-father-job', english: "What's your father's job?", chinese: '你爸爸是做什么工作的？', focusItemIds: ['u1-p5-job-question'] },
    { id: 'p5-factory-answer', english: "He's a factory worker.", chinese: '他是一名工厂工人。', focusItemIds: ['u1-p5-factory-worker'] },
  ] },
  { id: 'match-and-say', label: 'Match and say', chineseLabel: '连一连，说一说', sentences: [
    { id: 'p5-mike-job', english: "What's Mike's job?", chinese: '迈克是做什么工作的？' },
    { id: 'p5-mike-doctor', english: "He's a doctor.", chinese: '他是一名医生。', focusItemIds: ['u1-p5-doctor'] },
  ] },
], [
  { id: 'p5-practice-nurse', chinesePrompt: '她是一名护士。', answer: "She's a nurse.", relatedSentenceId: 'p5-nurse' },
  { id: 'p5-practice-job', chinesePrompt: '你爸爸是做什么工作的？', answer: "What's your father's job?", relatedSentenceId: 'p5-father-job' },
  { id: 'p5-practice-doctor', chinesePrompt: '他是一名医生。', answer: "He's a doctor.", relatedSentenceId: 'p5-mike-doctor' },
], checks(5,
  { prompt: '“工厂工人”用英语怎么说？', answer: 'factory worker', hint: 'factory 是工厂。', item: { id: 'u1-p5-factory-worker', kind: 'word', english: 'factory worker', chinese: '工厂工人' } },
  { prompt: '补全：He’s a ___.（医生）', answer: 'doctor', hint: '表示医生的职业词。', item: { id: 'u1-p5-doctor', kind: 'word', english: 'doctor', chinese: '医生' } },
), ['说出五种职业。', '用 What’s your father’s job? 问职业。', '用 He’s / She’s a ... 回答。']);

const page6 = page(6, 'Let’s spell', '拼读 ch', [
  focus(6, 'ch', 'ch', '字母组合 ch', 'body', '本页要读准的字母组合'),
  focus(6, 'chinese', 'Chinese', '中文；中国人', 'appendix-word', 'Unit 1 单元词（Appendix 2）'),
  focus(6, 'chair', 'chair', '椅子', 'appendix-word', 'Unit 1 单元词（Appendix 2）'),
  focus(6, 'child', 'child', '孩子', 'appendix-word', 'Unit 1 单元词（Appendix 2）'),
], [
  { id: 'repeat', label: 'Listen and repeat. Then read aloud.', chineseLabel: '听一听，跟读，再大声读', sentences: [
    { id: 'p6-ch', english: 'ch', chinese: 'ch 常发 /tʃ/ 音', focusItemIds: ['u1-p6-ch'] },
    { id: 'p6-grandpa', english: 'My grandpa can teach Chinese.', chinese: '我的爷爷会教中文。', focusItemIds: ['u1-p6-chinese'] },
    { id: 'p6-chairs', english: 'He can make nice chairs.', chinese: '他会做漂亮的椅子。', focusItemIds: ['u1-p6-chair'] },
    { id: 'p6-lunches', english: 'My grandma can make good lunches.', chinese: '我的奶奶会做好吃的午餐。' },
    { id: 'p6-peaches', english: 'Her peaches are great!', chinese: '她的桃子很棒！' },
  ] },
  { id: 'circle', label: 'Read, listen and circle.', chineseLabel: '读一读，听一听，圈一圈', sentences: [
    { id: 'p6-words', english: 'lunch, China, chair, kitchen, much, Chinese, child, teacher', chinese: '找一找含 ch 的单词。', focusItemIds: ['u1-p6-chair', 'u1-p6-child'] },
  ] },
], [
  { id: 'p6-practice-child', chinesePrompt: '孩子', answer: 'child', relatedSentenceId: 'p6-words' },
  { id: 'p6-practice-chair', chinesePrompt: '椅子', answer: 'chair', relatedSentenceId: 'p6-chairs' },
], checks(6,
  { prompt: '补全：__ild（孩子）', answer: 'ch', hint: '本页练习的字母组合。', item: { id: 'u1-p6-ch', kind: 'phonics', english: 'ch', chinese: '字母组合 ch' } },
  { prompt: '“椅子”用英语怎么说？', answer: 'chair', hint: '它含有 ch。', item: { id: 'u1-p6-chair', kind: 'word', english: 'chair', chinese: '椅子' } },
), ['读准 ch 的发音。', '能读出 child、chair 和 Chinese。', '在单词里找到 ch。']);

const page7 = page(7, 'How can we help our family?', '怎样帮助家人', [
  focus(7, 'busy-tired', 'busy and tired', '忙碌又疲惫', 'body', '描述家人的状态'),
  focus(7, 'chores', 'do some chores', '做一些家务', 'appendix-vocabulary', 'Unit 1 词汇表（Appendix 3）'),
  focus(7, 'cook', 'cook', '做饭', 'appendix-word', 'Unit 1 单元词（Appendix 2）'),
  focus(7, 'clean-room', 'clean the room', '打扫房间', 'appendix-vocabulary', 'Unit 1 词汇表（Appendix 3）'),
], [
  { id: 'lets-talk', label: 'Let’s talk', chineseLabel: '说一说', sentences: [
    { id: 'p7-busy', english: 'Mum and Dad are busy and tired.', chinese: '妈妈和爸爸很忙也很累。', focusItemIds: ['u1-p7-busy-tired'] },
    { id: 'p7-what-do', english: 'What can we do for them?', chinese: '我们能为他们做什么？' },
    { id: 'p7-chores', english: 'We can do some chores.', chinese: '我们可以做一些家务。', focusItemIds: ['u1-p7-chores'] },
    { id: 'p7-cook', english: 'I can cook.', chinese: '我会做饭。', focusItemIds: ['u1-p7-cook'] },
    { id: 'p7-clean', english: 'I can clean the room.', chinese: '我可以打扫房间。', focusItemIds: ['u1-p7-clean-room'] },
    { id: 'p7-gift', english: 'We can also make a gift!', chinese: '我们还可以做一份礼物！' },
  ] },
  { id: 'make-list', label: 'Make a list and talk', chineseLabel: '列一列，说一说', sentences: [
    { id: 'p7-festival', english: 'The Double Ninth Festival is coming. What can we do for our grandparents?', chinese: '重阳节快到了。我们能为祖父母做什么？' },
    { id: 'p7-i-can', english: 'I can ...', chinese: '我可以……' },
  ] },
], [
  { id: 'p7-practice-chores', chinesePrompt: '我们可以做一些家务。', answer: 'We can do some chores.', relatedSentenceId: 'p7-chores' },
  { id: 'p7-practice-cook', chinesePrompt: '我会做饭。', answer: 'I can cook.', relatedSentenceId: 'p7-cook' },
  { id: 'p7-practice-clean', chinesePrompt: '我可以打扫房间。', answer: 'I can clean the room.', relatedSentenceId: 'p7-clean' },
], checks(7,
  { prompt: '补全：We can do some ___.', answer: 'chores', hint: '表示“家务”。', item: { id: 'u1-p7-chores', kind: 'word', english: 'chores', chinese: '家务' } },
  { prompt: '“做饭”用英语怎么说？', answer: 'cook', hint: 'I can ... 后面接动作。', item: { id: 'u1-p7-cook', kind: 'word', english: 'cook', chinese: '做饭' } },
), ['说出家人忙碌时的感受。', '用 We can ... 提出帮助。', '用 I can ... 说一件自己能做的事。']);

const page8 = page(8, 'How can we help our family?', '一起做家务', [
  focus(8, 'look-after', 'look after', '照顾', 'appendix-vocabulary', 'Unit 1 词汇表（Appendix 3）'),
  focus(8, 'sweep-floor', 'sweep the floor', '扫地', 'appendix-vocabulary', 'Unit 1 词汇表（Appendix 3）'),
  focus(8, 'together', 'together', '一起', 'appendix-vocabulary', '表示一起完成事情'),
  focus(8, 'happy-family', 'happy family', '幸福的家庭', 'body', '本页主题词块'),
], [
  { id: 'lets-learn', label: 'Let’s learn', chineseLabel: '学一学', sentences: [
    { id: 'p8-look-after', english: 'I look after my sister.', chinese: '我照顾我的妹妹。', focusItemIds: ['u1-p8-look-after'] },
    { id: 'p8-sweep', english: 'We sweep the floor.', chinese: '我们扫地。', focusItemIds: ['u1-p8-sweep-floor'] },
    { id: 'p8-cook', english: 'We cook together.', chinese: '我们一起做饭。', focusItemIds: ['u1-p8-together'] },
    { id: 'p8-happy', english: 'We are happy together.', chinese: '我们在一起很快乐。', focusItemIds: ['u1-p8-together'] },
    { id: 'p8-family', english: 'I have a happy family.', chinese: '我有一个幸福的家庭。', focusItemIds: ['u1-p8-happy-family'] },
  ] },
  { id: 'chant', label: 'Listen and chant', chineseLabel: '听一听，念一念', sentences: [
    { id: 'p8-chant-busy', english: 'Mum and Dad are busy.', chinese: '妈妈和爸爸很忙。' },
    { id: 'p8-chant-cook', english: 'I cook for my family.', chinese: '我为家人做饭。' },
    { id: 'p8-chant-doggy', english: 'I look after my doggy.', chinese: '我照顾我的小狗。', focusItemIds: ['u1-p8-look-after'] },
    { id: 'p8-chant-sweep', english: 'I sweep the floor. It’s easy.', chinese: '我扫地。这很容易。', focusItemIds: ['u1-p8-sweep-floor'] },
    { id: 'p8-chant-family', english: 'We are a happy family.', chinese: '我们是幸福的一家人。', focusItemIds: ['u1-p8-happy-family'] },
  ] },
], [
  { id: 'p8-practice-look-after', chinesePrompt: '我照顾我的妹妹。', answer: 'I look after my sister.', relatedSentenceId: 'p8-look-after' },
  { id: 'p8-practice-sweep', chinesePrompt: '我们扫地。', answer: 'We sweep the floor.', relatedSentenceId: 'p8-sweep' },
  { id: 'p8-practice-cook', chinesePrompt: '我们一起做饭。', answer: 'We cook together.', relatedSentenceId: 'p8-cook' },
], checks(8,
  { prompt: '补全：I look ___ my sister.', answer: 'after', hint: 'look after 表示“照顾”。', item: { id: 'u1-p8-look-after', kind: 'sentence', english: 'look after', chinese: '照顾' } },
  { prompt: '补全：We sweep the ___.', answer: 'floor', hint: 'sweep the floor 表示扫地。', item: { id: 'u1-p8-sweep-floor', kind: 'sentence', english: 'sweep the floor', chinese: '扫地' } },
), ['用 look after 说“照顾”。', '用 sweep the floor 说“扫地”。', '介绍一件和家人一起做的事。']);

const page9 = page(9, 'Read and write', '读一读，写一写', [
  focus(9, 'nurse', 'nurse', '护士', 'appendix-word', 'Unit 1 单元词（Appendix 2）'),
  focus(9, 'sweep-floor', 'sweep the floor', '扫地', 'appendix-vocabulary', 'Unit 1 词汇表（Appendix 3）'),
  focus(9, 'look-after', 'look after', '照顾', 'appendix-vocabulary', 'Unit 1 词汇表（Appendix 3）'),
], [
  { id: 'read-and-tick', label: 'Read and tick', chineseLabel: '读一读，勾一勾', sentences: [
    { id: 'p9-mum-nurse', english: 'Mum, you are a great nurse.', chinese: '妈妈，你是一位很棒的护士。', focusItemIds: ['u1-p9-nurse'] },
    { id: 'p9-xiaolin-sweep', english: 'I am a big boy now. I can sweep the floor.', chinese: '我现在是大男孩了。我会扫地。', focusItemIds: ['u1-p9-sweep-floor'] },
    { id: 'p9-mum-child', english: 'You are still a child. What can you do?', chinese: '你仍然是个孩子。你能做什么？' },
    { id: 'p9-xiaolin-help', english: 'I can help you at home! I can cook. I can look after my baby sister too!', chinese: '我能在家帮你！我会做饭。我也会照顾我的小妹妹！', focusItemIds: ['u1-p9-look-after'] },
  ] },
  { id: 'choose-and-write', label: 'Choose and write', chineseLabel: '选一选，写一写', sentences: [
    { id: 'p9-mother-job', english: "What's the mother's job? She is a nurse.", chinese: '妈妈的职业是什么？她是一名护士。', focusItemIds: ['u1-p9-nurse'] },
    { id: 'p9-boy-help', english: 'What can the boy do? He can sweep the floor, cook and look after his sister.', chinese: '男孩会做什么？他会扫地、做饭和照顾妹妹。', focusItemIds: ['u1-p9-sweep-floor', 'u1-p9-look-after'] },
  ] },
], [
  { id: 'p9-practice-nurse', chinesePrompt: '妈妈，你是一位很棒的护士。', answer: 'Mum, you are a great nurse.', relatedSentenceId: 'p9-mum-nurse' },
  { id: 'p9-practice-sweep', chinesePrompt: '我会扫地。', answer: 'I can sweep the floor.', relatedSentenceId: 'p9-xiaolin-sweep' },
  { id: 'p9-practice-help', chinesePrompt: '我也会照顾我的小妹妹。', answer: 'I can look after my baby sister too.', relatedSentenceId: 'p9-xiaolin-help' },
], checks(9,
  { prompt: '妈妈的职业是什么？填写：She is a ___.', answer: 'nurse', hint: '便条第一句夸妈妈。', item: { id: 'u1-p9-nurse', kind: 'word', english: 'nurse', chinese: '护士' } },
  { prompt: '补全：I can look ___ my baby sister.', answer: 'after', hint: '表示“照顾”。', item: { id: 'u1-p9-look-after', kind: 'sentence', english: 'look after', chinese: '照顾' } },
), ['读懂两张家庭便条。', '说出妈妈的职业。', '说出小林能做的三件事。']);

const page10 = page(10, 'Project: Make a poster of a happy family', '项目：制作幸福家庭海报', [
  focus(10, 'parents', 'parents', '父母', 'appendix-word', '家庭成员词汇'),
  focus(10, 'often', 'often', '经常', 'appendix-vocabulary', '描述经常做的事'),
  focus(10, 'survey', 'Do a survey.', '做一个调查', 'body', '本页项目指令'),
], [
  { id: 'project-one', label: 'Project', chineseLabel: '项目活动', sentences: [
    { id: 'p10-parents', english: 'What do Chen Jie’s parents do?', chinese: '陈洁的父母是做什么工作的？', focusItemIds: ['u1-p10-parents'] },
    { id: 'p10-father-job', english: "What is the job of Chen Jie’s father?", chinese: '陈洁爸爸的职业是什么？' },
    { id: 'p10-mother-job', english: "What is the job of Chen Jie’s mother?", chinese: '陈洁妈妈的职业是什么？' },
  ] },
  { id: 'project-two', label: 'Do a survey', chineseLabel: '做一个调查', sentences: [
    { id: 'p10-family-do', english: 'What do you do with your family?', chinese: '你和家人一起做什么？' },
    { id: 'p10-often', english: 'I often ...', chinese: '我经常……', focusItemIds: ['u1-p10-often'] },
    { id: 'p10-survey', english: 'Do a survey.', chinese: '做一个调查。', focusItemIds: ['u1-p10-survey'] },
  ] },
], [
  { id: 'p10-practice-question', chinesePrompt: '你和家人一起做什么？', answer: 'What do you do with your family?', relatedSentenceId: 'p10-family-do' },
  { id: 'p10-practice-often', chinesePrompt: '我经常和家人一起做饭。', answer: 'I often cook with my family.', relatedSentenceId: 'p10-often' },
], checks(10,
  { prompt: '“父母”用英语怎么说？', answer: 'parents', hint: '爸爸和妈妈合起来。', item: { id: 'u1-p10-parents', kind: 'word', english: 'parents', chinese: '父母' } },
  { prompt: '补全：I ___ cook with my family.', answer: 'often', hint: '表示“经常”。', item: { id: 'u1-p10-often', kind: 'word', english: 'often', chinese: '经常' } },
), ['问出父母的职业。', '调查家人一起做的事。', '用 I often ... 介绍自己的家庭活动。']);

const page11 = page(11, 'Project: Make a poster of a happy family', '完成家庭海报', [
  focus(11, 'poster', 'poster', '海报', 'body', '本页要完成的作品'),
  focus(11, 'self-check', 'Self-check', '自我检查', 'body', '完成后做四项自评'),
  focus(11, 'happy-family', 'happy family', '幸福的家庭', 'body', '本单元项目主题'),
], [
  { id: 'make-poster', label: 'Make a poster of your family', chineseLabel: '制作你的家庭海报', sentences: [
    { id: 'p11-mother', english: 'My mother is a/an ...', chinese: '我的妈妈是一名……' },
    { id: 'p11-father', english: 'My father is a/an ...', chinese: '我的爸爸是一名……' },
    { id: 'p11-often', english: 'We often ... together.', chinese: '我们经常一起……' },
    { id: 'p11-happy-family', english: 'I have a happy family.', chinese: '我有一个幸福的家庭。', focusItemIds: ['u1-p11-happy-family'] },
    { id: 'p11-look-after', english: 'I can look after ...', chinese: '我可以照顾……' },
  ] },
  { id: 'self-check', label: 'Self-check', chineseLabel: '自我检查', sentences: [
    { id: 'p11-check-job', english: 'I can ask about people’s jobs.', chinese: '我能询问人们的职业。', focusItemIds: ['u1-p11-self-check'] },
    { id: 'p11-check-family', english: 'I can say what I do with my family.', chinese: '我能说出我和家人一起做什么。' },
    { id: 'p11-check-help', english: 'I can talk about how to help my family.', chinese: '我能谈论怎样帮助家人。' },
    { id: 'p11-check-ch', english: 'I can read and spell words with ch.', chinese: '我能读和拼写含 ch 的单词。' },
  ] },
], [
  { id: 'p11-practice-family', chinesePrompt: '我有一个幸福的家庭。', answer: 'I have a happy family.', relatedSentenceId: 'p11-happy-family' },
  { id: 'p11-practice-help', chinesePrompt: '我可以照顾我的妹妹。', answer: 'I can look after my sister.', relatedSentenceId: 'p11-look-after' },
], checks(11,
  { prompt: '补全：I have a happy ___.', answer: 'family', hint: '本单元的主题词。', item: { id: 'u1-p11-happy-family', kind: 'word', english: 'family', chinese: '家庭' } },
  { prompt: '完成项目后要做什么？填写：Self-___.', answer: 'check', hint: '自我检查。', item: { id: 'u1-p11-self-check', kind: 'project', english: 'Self-check', chinese: '自我检查' } },
), ['完成一张家庭海报。', '介绍家人的职业和一起做的事。', '用四项 Self-check 检查自己。']);

const page12 = page(12, 'Reading time', '阅读时间（一）', [
  focus(12, 'writer', 'writer', '作家', 'appendix-vocabulary', '阅读中的职业词'),
  focus(12, 'writes', 'writes', '写；写作', 'body', 'writer 对应的动作'),
  focus(12, 'cook', 'cook', '做饭；厨师', 'appendix-word', 'Unit 1 单元词（Appendix 2）'),
], [{ id: 'reading', label: 'Reading time', chineseLabel: '阅读时间', sentences: [
  { id: 'p12-writer', english: 'My mum is a writer.', chinese: '我的妈妈是一名作家。', focusItemIds: ['u1-p12-writer'] },
  { id: 'p12-books', english: 'She writes a lot of good books.', chinese: '她写了许多好书。', focusItemIds: ['u1-p12-writes'] },
  { id: 'p12-cook', english: 'Mum is also a great cook.', chinese: '妈妈也是一名很棒的厨师。', focusItemIds: ['u1-p12-cook'] },
  { id: 'p12-food', english: 'She can cook great food!', chinese: '她会做很棒的食物！', focusItemIds: ['u1-p12-cook'] },
] }], [
  { id: 'p12-practice-writer', chinesePrompt: '我的妈妈是一名作家。', answer: 'My mum is a writer.', relatedSentenceId: 'p12-writer' },
  { id: 'p12-practice-cook', chinesePrompt: '妈妈也是一名很棒的厨师。', answer: 'Mum is also a great cook.', relatedSentenceId: 'p12-cook' },
], checks(12,
  { prompt: '“作家”用英语怎么说？', answer: 'writer', hint: '写书的人。', item: { id: 'u1-p12-writer', kind: 'word', english: 'writer', chinese: '作家' } },
  { prompt: '补全：She ___ a lot of good books.', answer: 'writes', hint: '主语是 she，write 要加 s。', item: { id: 'u1-p12-writes', kind: 'word', english: 'writes', chinese: '写作' } },
), ['读懂妈妈的两种本领。', '知道 writer 是作家。', '说出妈妈还会做什么。']);

const page13 = page(13, 'Reading time', '阅读时间（二）', [
  focus(13, 'busy', 'busy', '忙碌的', 'appendix-vocabulary', '描述妈妈的状态'),
  focus(13, 'help', 'help at home', '在家帮忙', 'appendix-expression', '本单元核心表达'),
  focus(13, 'happy', 'happy', '快乐的', 'appendix-word', '本单元主题词'),
], [{ id: 'reading', label: 'Reading time', chineseLabel: '阅读时间', sentences: [
  { id: 'p13-busy', english: 'Mum is very busy.', chinese: '妈妈非常忙。', focusItemIds: ['u1-p13-busy'] },
  { id: 'p13-help', english: 'We can help her at home.', chinese: '我们可以在家帮她。', focusItemIds: ['u1-p13-help'] },
  { id: 'p13-this', english: 'But now we have this!', chinese: '但是现在我们有这个！' },
  { id: 'p13-make', english: 'We want to make this.', chinese: '我们想做这个。' },
  { id: 'p13-happy', english: 'Mum is still happy! She’s a great mum!', chinese: '妈妈仍然很开心！她是一位很棒的妈妈！', focusItemIds: ['u1-p13-happy'] },
] }], [
  { id: 'p13-practice-help', chinesePrompt: '我们可以在家帮她。', answer: 'We can help her at home.', relatedSentenceId: 'p13-help' },
  { id: 'p13-practice-busy', chinesePrompt: '妈妈非常忙。', answer: 'Mum is very busy.', relatedSentenceId: 'p13-busy' },
  { id: 'p13-practice-happy', chinesePrompt: '妈妈仍然很开心。', answer: 'Mum is still happy.', relatedSentenceId: 'p13-happy' },
], checks(13,
  { prompt: '补全：We can ___ her at home.', answer: 'help', hint: '本单元的核心动作。', item: { id: 'u1-p13-help', kind: 'word', english: 'help', chinese: '帮助' } },
  { prompt: '“快乐的”用英语怎么说？', answer: 'happy', hint: '故事结尾的心情。', item: { id: 'u1-p13-happy', kind: 'word', english: 'happy', chinese: '快乐的' } },
), ['读完妈妈的小故事。', '说出我们可以怎样在家帮忙。', '完成 Unit 1 的最后一页。']);

export const pepGrade4UpperUnit1RemainingPages = [page2, page5, page6, page7, page8, page9, page10, page11, page12, page13];
