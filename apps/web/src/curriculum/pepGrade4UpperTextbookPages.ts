import type { TextbookPage } from './types';
import { pepGrade4UpperUnit1RemainingPages } from './pepGrade4UpperUnit1RemainingPages';

const page3: TextbookPage = {
  id: 'pep4a-u1-p3', textbookId: 'pep-grade4-upper', unitId: 'pep4a-u1', printedPage: 3,
  title: 'Helping at home', chineseTitle: '在家帮忙',
  focusItems: [
    { id: 'u1-children', kind: 'word', english: 'children', chinese: '儿童；小孩', source: 'appendix-word', note: '对应 Unit 1 单元词 child / children（Appendix 2）' },
    { id: 'u1-clean', kind: 'word', english: 'clean', chinese: '打扫；干净的', source: 'appendix-vocabulary', note: 'Unit 1 词汇表（Appendix 3）' },
    { id: 'u1-room', kind: 'word', english: 'room', chinese: '房间', source: 'appendix-word', note: 'Unit 1 单元词（Appendix 2）' },
    { id: 'u1-chores', kind: 'word', english: 'chore / chores', chinese: '家务；家庭杂务', source: 'appendix-vocabulary', note: 'Unit 1 词汇表（Appendix 3）' },
    { id: 'u1-sweep-floor', kind: 'sentence', english: 'sweep the floor', chinese: '扫地', source: 'body', note: '由本页 sweep 和 floor 组成的动作词块' },
    { id: 'u1-can-help', kind: 'sentence', english: 'Can ... help?', chinese: '……能帮忙吗？', source: 'appendix-expression', note: '本页核心问句（Appendix 4）' },
  ],
  sections: [
    { id: 'look-and-think', label: 'Look and think', chineseLabel: '看一看，想一想', sentences: [
      { id: 'p3-look-children', english: 'How do these children help at home?', chinese: '这些孩子在家怎样帮忙？', focusItemIds: ['u1-children'] },
      { id: 'p3-look-you', english: 'How do you help at home?', chinese: '你在家怎样帮忙？' },
    ] },
    { id: 'listen-and-chant', label: 'Listen and chant', chineseLabel: '听一听，念一念', sentences: [
      { id: 'p3-can-you', english: 'Can you help?', chinese: '你能帮忙吗？', focusItemIds: ['u1-can-help'] },
      { id: 'p3-clean-room', english: 'Yes, I can. I can clean my room.', chinese: '是的，我能。我可以打扫自己的房间。', focusItemIds: ['u1-clean', 'u1-room'] },
      { id: 'p3-can-she', english: 'Can she help?', chinese: '她能帮忙吗？', focusItemIds: ['u1-can-help'] },
      { id: 'p3-chores', english: 'Yes, she can. She can do some chores.', chinese: '是的，她能。她可以做一些家务。', focusItemIds: ['u1-chores'] },
      { id: 'p3-can-he', english: 'Can he help?', chinese: '他能帮忙吗？', focusItemIds: ['u1-can-help'] },
      { id: 'p3-sweep', english: 'Yes, he can. He can sweep the floor.', chinese: '是的，他能。他可以扫地。', focusItemIds: ['u1-sweep-floor'] },
      { id: 'p3-can-we', english: 'Can we help?', chinese: '我们能帮忙吗？', focusItemIds: ['u1-can-help'] },
      { id: 'p3-for-sure', english: "Yes, we can. That's for sure!", chinese: '是的，我们能。当然可以！' },
    ] },
    { id: 'listen-and-sing', label: 'Listen and sing', chineseLabel: '听一听，唱一唱', sentences: [
      { id: 'p3-helping-at-home', english: 'Helping at home', chinese: '在家帮忙' },
    ] },
  ],
  practicePrompts: [
    { id: 'p3-practice-children', chinesePrompt: '这些孩子在家怎样帮忙？', answer: 'How do these children help at home?', relatedSentenceId: 'p3-look-children' },
    { id: 'p3-practice-you', chinesePrompt: '你在家怎样帮忙？', answer: 'How do you help at home?', relatedSentenceId: 'p3-look-you' },
    { id: 'p3-practice-clean', chinesePrompt: '你能打扫自己的房间吗？', answer: 'Can you clean your room?', relatedSentenceId: 'p3-clean-room' },
  ],
  checks: [
    { id: 'p3-check-can-help', prompt: '“你能帮忙吗？”用英语怎么说？', answer: 'Can you help?', hint: '用 Can 开头。', item: { id: 'u1-can-help', kind: 'sentence', english: 'Can you help?', chinese: '你能帮忙吗？' } },
    { id: 'p3-check-clean-room', prompt: '补全：I can clean my ___.', answer: 'room', hint: '表示“房间”的单词。', item: { id: 'u1-room', kind: 'word', english: 'room', chinese: '房间' } },
  ],
};

const page4: TextbookPage = {
  id: 'pep4a-u1-p4', textbookId: 'pep-grade4-upper', unitId: 'pep4a-u1', printedPage: 4,
  title: 'How are families different?', chineseTitle: '家人各不相同',
  focusItems: [
    { id: 'u1-family', kind: 'word', english: 'family', chinese: '家庭；家人', source: 'appendix-word', note: 'Unit 1 单元词（Appendix 2）' },
    { id: 'u1-father', kind: 'word', english: 'father', chinese: '父亲', source: 'appendix-word', note: 'Unit 1 单元词（Appendix 2）' },
    { id: 'u1-mother', kind: 'word', english: 'mother', chinese: '母亲', source: 'appendix-word', note: 'Unit 1 单元词（Appendix 2）' },
    { id: 'u1-job', kind: 'word', english: 'job', chinese: '工作；职业', source: 'appendix-vocabulary', note: 'Unit 1 词汇表（Appendix 3）' },
    { id: 'u1-mother-job', kind: 'sentence', english: "What's your mother's job?", chinese: '你妈妈是做什么工作的？', source: 'appendix-expression', note: '询问职业的常用表达（Appendix 4）' },
  ],
  sections: [
    { id: 'lets-talk', label: 'Let’s talk', chineseLabel: '说一说', sentences: [
      { id: 'p4-big-family', english: 'You have a big family. Is this your father?', chinese: '你有一个大家庭。这是你的爸爸吗？', focusItemIds: ['u1-family', 'u1-father'] },
      { id: 'p4-pe-teacher', english: "Yes, it is. He's a PE teacher.", chinese: '是的。他是一名体育老师。' },
      { id: 'p4-mother-job', english: "What's your mother's job?", chinese: '你妈妈是做什么工作的？', focusItemIds: ['u1-mother', 'u1-job', 'u1-mother-job'] },
      { id: 'p4-doctor', english: "She's a doctor.", chinese: '她是一名医生。' },
      { id: 'p4-father-doctor', english: 'Doctors are great! My father is a doctor too.', chinese: '医生很棒！我的爸爸也是一名医生。', focusItemIds: ['u1-father'] },
    ] },
    { id: 'draw-and-say', label: 'Draw and say', chineseLabel: '画一画，说一说', sentences: [
      { id: 'p4-draw-job', english: "What's your mother's job?", chinese: '你妈妈是做什么工作的？', focusItemIds: ['u1-mother-job'] },
      { id: 'p4-teacher', english: "She's a teacher.", chinese: '她是一名老师。' },
    ] },
  ],
  practicePrompts: [
    { id: 'p4-practice-job', chinesePrompt: '你妈妈是做什么工作的？', answer: "What's your mother's job?", relatedSentenceId: 'p4-mother-job' },
    { id: 'p4-practice-doctor', chinesePrompt: '她是一名医生。', answer: "She's a doctor.", relatedSentenceId: 'p4-doctor' },
    { id: 'p4-practice-father-job', chinesePrompt: '你爸爸是做什么工作的？', answer: "What's your father's job?", relatedSentenceId: 'p4-mother-job' },
  ],
  checks: [
    { id: 'p4-check-job', prompt: '“职业”用英语怎么说？', answer: 'job', hint: '三个字母。', item: { id: 'u1-job', kind: 'word', english: 'job', chinese: '工作；职业' } },
    { id: 'p4-check-teacher', prompt: '补全：She’s a ___.（老师）', answer: 'teacher', hint: '表示“老师”的单词。', item: { id: 'u1-teacher', kind: 'word', english: 'teacher', chinese: '老师' } },
  ],
};

const pages = [...pepGrade4UpperUnit1RemainingPages, page3, page4].sort((a, b) => a.printedPage - b.printedPage);

export const getTextbookPageById = (pageId: string) => pages.find(page => page.id === pageId);
export const getUnitTextbookPages = (unitId: string) => pages.filter(page => page.unitId === unitId).sort((a, b) => a.printedPage - b.printedPage);
export const getNextTextbookPage = (pageId: string) => {
  const index = pages.findIndex(page => page.id === pageId);
  return index >= 0 ? pages[index + 1] : undefined;
};
