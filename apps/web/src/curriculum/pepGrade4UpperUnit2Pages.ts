import type { TextbookFocusItem, TextbookPage, TextbookPageCheck, TextbookPageSection } from './types';

const focus = (page: number, id: string, english: string, chinese: string, source: TextbookFocusItem['source'], note: string): TextbookFocusItem => ({
  id: `u2-p${page}-${id}`, kind: english.includes(' ') || english.includes('?') ? 'sentence' : 'word', english, chinese, source, note,
});

const checks = (page: number, first: Omit<TextbookPageCheck, 'id'>, second: Omit<TextbookPageCheck, 'id'>): TextbookPageCheck[] => [
  { id: `p${page}-check-1`, ...first }, { id: `p${page}-check-2`, ...second },
];

const page = (printedPage: number, title: string, chineseTitle: string, focusItems: TextbookFocusItem[], sections: TextbookPageSection[], practicePrompts: TextbookPage['practicePrompts'], pageChecks: TextbookPageCheck[], finishItems: string[]): TextbookPage => ({
  id: `pep4a-u2-p${printedPage}`, textbookId: 'pep-grade4-upper', unitId: 'pep4a-u2', printedPage, title, chineseTitle, focusItems, sections, practicePrompts, checks: pageChecks, finishItems,
});

const page14 = page(14, 'My friends', '我的朋友', [
  focus(14, 'friend', 'friend', '朋友', 'appendix-word', 'Unit 2 单元词（Appendix 2）'),
  focus(14, 'different', 'different', '不同的', 'appendix-vocabulary', '本单元大问题中的关键词'),
], [{ id: 'big-question', label: 'Big Question', chineseLabel: '大问题', sentences: [
  { id: 'p14-question', english: 'What makes your friends different?', chinese: '是什么让你的朋友与众不同？', focusItemIds: ['u2-p14-friend', 'u2-p14-different'] },
] }], [
  { id: 'p14-practice-question', chinesePrompt: '是什么让你的朋友与众不同？', answer: 'What makes your friends different?', relatedSentenceId: 'p14-question' },
  { id: 'p14-practice-friend', chinesePrompt: '我的朋友很特别。', answer: 'My friend is special.', relatedSentenceId: 'p14-question' },
], checks(14,
  { prompt: '“朋友”用英语怎么说？', answer: 'friend', hint: 'Unit 2 的主题词。', item: { id: 'u2-p14-friend', kind: 'word', english: 'friend', chinese: '朋友' } },
  { prompt: '补全：My friends are ___.（不同的）', answer: 'different', hint: '大问题里的关键词。', item: { id: 'u2-p14-different', kind: 'word', english: 'different', chinese: '不同的' } },
), ['读出 Unit 2 的大问题。', '想一想：我的朋友有什么特别的地方。', '准备学习外貌、性格和共同活动。']);

const page15 = page(15, 'My friends', '我的朋友', [
  focus(15, 'short', 'short', '矮的；短的', 'appendix-word', 'Unit 2 单元词（Appendix 2）'),
  focus(15, 'tall', 'tall', '高的', 'appendix-word', 'Unit 2 单元词（Appendix 2）'),
  focus(15, 'special', 'special', '特别的', 'appendix-vocabulary', '描述朋友的常用词'),
  focus(15, 'get-along', 'get along', '相处融洽', 'appendix-expression', '本页歌曲中的常用表达'),
], [
  { id: 'look-and-think', label: 'Look and think', chineseLabel: '看一看，想一想', sentences: [
    { id: 'p15-children', english: 'How are these children different?', chinese: '这些孩子有什么不同？' },
    { id: 'p15-friends', english: 'How are your friends different?', chinese: '你的朋友有什么不同？' },
  ] },
  { id: 'listen-and-chant', label: 'Listen and chant', chineseLabel: '听一听，念一念', sentences: [
    { id: 'p15-short', english: 'Some friends are short.', chinese: '有些朋友个子矮。', focusItemIds: ['u2-p15-short'] },
    { id: 'p15-tall', english: 'Some friends are tall.', chinese: '有些朋友个子高。', focusItemIds: ['u2-p15-tall'] },
    { id: 'p15-special', english: 'My friends are special. I love them all.', chinese: '我的朋友很特别。我爱他们每一个人。', focusItemIds: ['u2-p15-special'] },
    { id: 'p15-hair', english: "Some friends' hair is short. Some friends' hair is long.", chinese: '有些朋友的头发短，有些朋友的头发长。', focusItemIds: ['u2-p15-short'] },
    { id: 'p15-great', english: 'My friends are great. We all get along.', chinese: '我的朋友很棒。我们相处融洽。', focusItemIds: ['u2-p15-get-along'] },
  ] },
  { id: 'listen-and-sing', label: 'Listen and sing', chineseLabel: '听一听，唱一唱', sentences: [{ id: 'p15-song', english: 'My friends', chinese: '我的朋友' }] },
], [
  { id: 'p15-practice-tall', chinesePrompt: '有些朋友个子高。', answer: 'Some friends are tall.', relatedSentenceId: 'p15-tall' },
  { id: 'p15-practice-hair', chinesePrompt: '有些朋友的头发长。', answer: "Some friends' hair is long.", relatedSentenceId: 'p15-hair' },
  { id: 'p15-practice-great', chinesePrompt: '我们相处融洽。', answer: 'We all get along.', relatedSentenceId: 'p15-great' },
], checks(15,
  { prompt: '“高的”用英语怎么说？', answer: 'tall', hint: '和 short 相对。', item: { id: 'u2-p15-tall', kind: 'word', english: 'tall', chinese: '高的' } },
  { prompt: '补全：We all get ___.', answer: 'along', hint: '表示“相处融洽”。', item: { id: 'u2-p15-get-along', kind: 'sentence', english: 'get along', chinese: '相处融洽' } },
), ['用 short 和 tall 描述朋友。', '能说出朋友头发的长短。', '知道朋友之间可以 get along。']);

const page16 = page(16, 'Who are your friends?', '谁是你的朋友？', [
  focus(16, 'name', 'name', '名字', 'appendix-word', 'Unit 2 单元词（Appendix 2）'),
  focus(16, 'strong', 'strong', '强壮的', 'appendix-word', 'Unit 2 单元词（Appendix 2）'),
  focus(16, 'kind', 'kind', '友善的', 'appendix-word', 'Unit 2 单元词（Appendix 2）'),
  focus(16, 'has-hair', 'He has short hair.', '他有短头发。', 'appendix-expression', '描述外貌的核心句型'),
], [{ id: 'lets-talk', label: 'Let’s talk', chineseLabel: '说一说', sentences: [
  { id: 'p16-new-friend', english: 'Mum, I have a new friend.', chinese: '妈妈，我有一位新朋友。' },
  { id: 'p16-name-question', english: "Really? What's your friend's name?", chinese: '真的吗？你的朋友叫什么名字？', focusItemIds: ['u2-p16-name'] },
  { id: 'p16-name-answer', english: 'His name is Zhang Peng.', chinese: '他的名字叫张鹏。', focusItemIds: ['u2-p16-name'] },
  { id: 'p16-tall-strong', english: "Look! He's tall and strong.", chinese: '看！他又高又壮。', focusItemIds: ['u2-p16-strong'] },
  { id: 'p16-hair', english: 'He has nice short hair too.', chinese: '他也有好看的短头发。', focusItemIds: ['u2-p16-has-hair'] },
  { id: 'p16-kind', english: 'Yes. He’s also kind. He often helps me.', chinese: '是的。他也很友善。他经常帮助我。', focusItemIds: ['u2-p16-kind'] },
] }, { id: 'say-and-draw', label: 'Say and draw', chineseLabel: '说一说，画一画', sentences: [
  { id: 'p16-clue', english: "He's tall and strong. He has short hair.", chinese: '他又高又壮。他有短头发。', focusItemIds: ['u2-p16-strong', 'u2-p16-has-hair'] },
  { id: 'p16-guess', english: 'I know! It’s Zhang Peng.', chinese: '我知道！是张鹏。' },
] }], [
  { id: 'p16-practice-name', chinesePrompt: '你的朋友叫什么名字？', answer: "What's your friend's name?", relatedSentenceId: 'p16-name-question' },
  { id: 'p16-practice-strong', chinesePrompt: '他又高又壮。', answer: "He's tall and strong.", relatedSentenceId: 'p16-tall-strong' },
  { id: 'p16-practice-hair', chinesePrompt: '他有短头发。', answer: 'He has short hair.', relatedSentenceId: 'p16-hair' },
], checks(16,
  { prompt: '补全：His ___ is Zhang Peng.', answer: 'name', hint: '表示“名字”。', item: { id: 'u2-p16-name', kind: 'word', english: 'name', chinese: '名字' } },
  { prompt: '“友善的”用英语怎么说？', answer: 'kind', hint: '他经常帮助别人。', item: { id: 'u2-p16-kind', kind: 'word', english: 'kind', chinese: '友善的' } },
), ['问出朋友的名字。', '用 tall and strong 描述外貌。', '用 He has ... 描述头发。']);

const page17 = page(17, 'Let’s learn', '学一学：描述朋友', [
  focus(17, 'short-hair', 'short hair', '短头发', 'appendix-vocabulary', 'Unit 2 词汇表（Appendix 3）'),
  focus(17, 'long-hair', 'long hair', '长头发', 'appendix-vocabulary', 'Unit 2 词汇表（Appendix 3）'),
  focus(17, 'quiet', 'quiet', '安静的', 'appendix-word', 'Unit 2 单元词（Appendix 2）'),
  focus(17, 'thin', 'thin', '瘦的', 'appendix-word', 'Unit 2 单元词（Appendix 2）'),
], [{ id: 'lets-learn', label: 'Let’s learn', chineseLabel: '学一学', sentences: [
  { id: 'p17-short-hair', english: 'short hair', chinese: '短头发', focusItemIds: ['u2-p17-short-hair'] },
  { id: 'p17-tall-strong', english: 'tall and strong', chinese: '又高又壮' },
  { id: 'p17-kind', english: 'kind', chinese: '友善的' },
  { id: 'p17-long-hair', english: 'long hair', chinese: '长头发', focusItemIds: ['u2-p17-long-hair'] },
  { id: 'p17-short-thin', english: 'short and thin', chinese: '又矮又瘦', focusItemIds: ['u2-p17-thin'] },
  { id: 'p17-quiet', english: 'quiet', chinese: '安静的', focusItemIds: ['u2-p17-quiet'] },
  { id: 'p17-friend', english: 'I have a friend. She has long hair and ... Who is she?', chinese: '我有一个朋友。她有长头发，而且……她是谁？', focusItemIds: ['u2-p17-long-hair'] },
  { id: 'p17-sarah', english: 'Her name is Sarah.', chinese: '她的名字叫萨拉。' },
] }, { id: 'listen-and-chant', label: 'Listen and chant', chineseLabel: '听一听，念一念', sentences: [
  { id: 'p17-tim', english: "Tim is my friend. He's tall and thin.", chinese: '蒂姆是我的朋友。他又高又瘦。', focusItemIds: ['u2-p17-thin'] },
  { id: 'p17-lily', english: "Lily is my friend. She's quiet and kind.", chinese: '莉莉是我的朋友。她安静又友善。', focusItemIds: ['u2-p17-quiet'] },
] }], [
  { id: 'p17-practice-long-hair', chinesePrompt: '她有长头发。', answer: 'She has long hair.', relatedSentenceId: 'p17-friend' },
  { id: 'p17-practice-quiet', chinesePrompt: '她安静又友善。', answer: "She's quiet and kind.", relatedSentenceId: 'p17-lily' },
], checks(17,
  { prompt: '“安静的”用英语怎么说？', answer: 'quiet', hint: 'Lily 的性格。', item: { id: 'u2-p17-quiet', kind: 'word', english: 'quiet', chinese: '安静的' } },
  { prompt: '补全：He’s tall and ___.', answer: 'thin', hint: '表示“瘦的”。', item: { id: 'u2-p17-thin', kind: 'word', english: 'thin', chinese: '瘦的' } },
), ['掌握六个描述朋友的词块。', '用 He/She has ... 描述头发。', '用 He/She is ... 描述外貌和性格。']);

const page18 = page(18, 'Let’s spell', '拼读 sh', [
  focus(18, 'sh', 'sh', '字母组合 sh', 'body', '本页要读准的字母组合'),
  focus(18, 'share', 'share', '分享', 'appendix-vocabulary', '朋友间的常用动作'),
  focus(18, 'fish', 'fish', '鱼', 'appendix-word', '含 sh 的单词'),
], [{ id: 'repeat', label: 'Listen and repeat. Then read aloud.', chineseLabel: '听一听，跟读，再大声读', sentences: [
  { id: 'p18-sh', english: 'sh', chinese: 'sh 常发 /ʃ/ 音', focusItemIds: ['u2-p18-sh'] },
  { id: 'p18-share', english: 'Can we share? I have no shell. You can share my shell!', chinese: '我们能分享吗？我没有贝壳。你可以分享我的贝壳！', focusItemIds: ['u2-p18-share'] },
  { id: 'p18-fish', english: 'Shoo! Go away, Fish!', chinese: '嘘！走开，鱼！', focusItemIds: ['u2-p18-fish'] },
] }, { id: 'read-listen-number', label: 'Read, listen and number', chineseLabel: '读一读，听一听，标序号', sentences: [
  { id: 'p18-words', english: 'English, share, shop, fish, she, ship', chinese: '找一找带 sh 的单词。', focusItemIds: ['u2-p18-share', 'u2-p18-fish'] },
  { id: 'p18-true-friends', english: 'True friends help each other.', chinese: '真正的朋友互相帮助。' },
] }], [
  { id: 'p18-practice-share', chinesePrompt: '我们能分享吗？', answer: 'Can we share?', relatedSentenceId: 'p18-share' },
  { id: 'p18-practice-friends', chinesePrompt: '真正的朋友互相帮助。', answer: 'True friends help each other.', relatedSentenceId: 'p18-true-friends' },
], checks(18,
  { prompt: '补全：__are（分享）', answer: 'sh', hint: '本页练习的字母组合。', item: { id: 'u2-p18-sh', kind: 'phonics', english: 'sh', chinese: '字母组合 sh' } },
  { prompt: '“分享”用英语怎么说？', answer: 'share', hint: '朋友之间可以一起做。', item: { id: 'u2-p18-share', kind: 'word', english: 'share', chinese: '分享' } },
), ['读准 sh 的发音。', '能读出 share、fish、ship。', '记住真正的朋友会互相帮助。']);

const page19 = page(19, 'How do we choose our friends?', '怎样选择朋友？', [
  focus(19, 'best-friend', 'best friend', '最好的朋友', 'appendix-vocabulary', '本页核心词块'),
  focus(19, 'funny', 'funny', '有趣的', 'appendix-word', 'Unit 2 单元词（Appendix 2）'),
  focus(19, 'smile', 'make me smile', '让我微笑', 'appendix-expression', '描述朋友带来的感受'),
  focus(19, 'help-english', 'help me with English', '帮助我学英语', 'appendix-expression', '朋友互助的表达'),
], [{ id: 'lets-talk', label: 'Let’s talk', chineseLabel: '说一说', sentences: [
  { id: 'p19-best-question', english: "Who's your best friend?", chinese: '谁是你最好的朋友？', focusItemIds: ['u2-p19-best-friend'] },
  { id: 'p19-chen-jie', english: 'Chen Jie. She’s funny. She often makes me smile.', chinese: '陈洁。她很有趣。她经常让我微笑。', focusItemIds: ['u2-p19-funny', 'u2-p19-smile'] },
  { id: 'p19-how-about', english: 'How about you?', chinese: '你呢？' },
  { id: 'p19-john', english: 'My best friend is John. He’s very kind. He often helps me with English.', chinese: '我最好的朋友是约翰。他很友善。他经常帮助我学英语。', focusItemIds: ['u2-p19-best-friend', 'u2-p19-help-english'] },
] }, { id: 'talk-about', label: 'Talk about your best friend', chineseLabel: '谈谈你最好的朋友', sentences: [
  { id: 'p19-template', english: "Liu Jia. She's tall and ... She has long hair. She often ...", chinese: '刘佳。她又高又……她有长头发。她经常……' },
] }], [
  { id: 'p19-practice-best', chinesePrompt: '谁是你最好的朋友？', answer: "Who's your best friend?", relatedSentenceId: 'p19-best-question' },
  { id: 'p19-practice-smile', chinesePrompt: '她经常让我微笑。', answer: 'She often makes me smile.', relatedSentenceId: 'p19-chen-jie' },
  { id: 'p19-practice-english', chinesePrompt: '他经常帮助我学英语。', answer: 'He often helps me with English.', relatedSentenceId: 'p19-john' },
], checks(19,
  { prompt: '“最好的朋友”用英语怎么说？', answer: 'best friend', hint: 'best 表示“最好的”。', item: { id: 'u2-p19-best-friend', kind: 'sentence', english: 'best friend', chinese: '最好的朋友' } },
  { prompt: '补全：She often makes me ___.', answer: 'smile', hint: '开心时会做的表情。', item: { id: 'u2-p19-smile', kind: 'word', english: 'smile', chinese: '微笑' } },
), ['问出谁是最好的朋友。', '说出朋友的有趣和友善。', '说出朋友如何帮助自己。']);

const page20 = page(20, 'Let’s learn', '学一学：和朋友一起做什么', [
  focus(20, 'read-books', 'read books with me', '和我一起读书', 'appendix-expression', '本页共同活动表达'),
  focus(20, 'play-games', 'play games together', '一起玩游戏', 'appendix-expression', '本页共同活动表达'),
  focus(20, 'play-football', 'play football together', '一起踢足球', 'appendix-expression', '本页共同活动表达'),
  focus(20, 'often', 'often', '经常', 'appendix-vocabulary', '描述经常发生的事'),
], [{ id: 'lets-learn', label: 'Let’s learn', chineseLabel: '学一学', sentences: [
  { id: 'p20-best', english: "Who's your best friend? Zhang Peng.", chinese: '谁是你最好的朋友？张鹏。' },
  { id: 'p20-read', english: 'He often reads books with me.', chinese: '他经常和我一起读书。', focusItemIds: ['u2-p20-read-books', 'u2-p20-often'] },
  { id: 'p20-reads', english: 'He reads books with me.', chinese: '他和我一起读书。', focusItemIds: ['u2-p20-read-books'] },
  { id: 'p20-chinese', english: 'He helps me with Chinese.', chinese: '他帮助我学中文。' },
  { id: 'p20-games', english: 'We play games together.', chinese: '我们一起玩游戏。', focusItemIds: ['u2-p20-play-games'] },
  { id: 'p20-football', english: 'We play football together.', chinese: '我们一起踢足球。', focusItemIds: ['u2-p20-play-football'] },
] }, { id: 'choose-and-say', label: 'Look, choose and say', chineseLabel: '看一看，选一选，说一说', sentences: [
  { id: 'p20-grammar-read', english: 'I read books. My friend reads books with me.', chinese: '我读书。我的朋友和我一起读书。', focusItemIds: ['u2-p20-read-books'] },
  { id: 'p20-grammar-play', english: 'I play games. My friend plays games with me.', chinese: '我玩游戏。我的朋友和我一起玩游戏。', focusItemIds: ['u2-p20-play-games'] },
  { id: 'p20-grammar-help', english: 'I help my friend with Chinese. My friend helps me with English.', chinese: '我帮助朋友学中文。我的朋友帮助我学英语。' },
] }], [
  { id: 'p20-practice-read', chinesePrompt: '他经常和我一起读书。', answer: 'He often reads books with me.', relatedSentenceId: 'p20-read' },
  { id: 'p20-practice-games', chinesePrompt: '我们一起玩游戏。', answer: 'We play games together.', relatedSentenceId: 'p20-games' },
  { id: 'p20-practice-helps', chinesePrompt: '我的朋友帮助我学英语。', answer: 'My friend helps me with English.', relatedSentenceId: 'p20-grammar-help' },
], checks(20,
  { prompt: '补全：He ___ books with me.', answer: 'reads', hint: '主语是 he，read 要加 s。', item: { id: 'u2-p20-read-books', kind: 'sentence', english: 'reads books with me', chinese: '和我一起读书' } },
  { prompt: '补全：We play games ___.', answer: 'together', hint: '表示“一起”。', item: { id: 'u2-p20-play-games', kind: 'sentence', english: 'play games together', chinese: '一起玩游戏' } },
), ['说出和朋友一起做的三件事。', '注意 he / she 后动词加 s。', '用 often 介绍经常一起做的事。']);

const page21 = page(21, 'Read and write', '读一读，写一写', [
  focus(21, 'animal-books', 'animal books', '动物书', 'appendix-vocabulary', '阅读中的兴趣词块'),
  focus(21, 'weiqi', 'weiqi', '围棋', 'body', '课文中的兴趣活动'),
  focus(21, 'always', 'always', '总是', 'appendix-vocabulary', '表示频率'),
  focus(21, 'best-friends', 'best friends', '最好的朋友', 'appendix-vocabulary', '阅读主题词块'),
], [{ id: 'read-and-compare', label: 'Read and compare', chineseLabel: '读一读，比较一下', sentences: [
  { id: 'p21-tall', english: 'Liu Jia is tall. She has long hair.', chinese: '刘佳很高。她有长头发。' },
  { id: 'p21-books', english: 'She often reads books with me. We like animal books and often share.', chinese: '她经常和我一起读书。我们喜欢动物书，也经常分享。', focusItemIds: ['u2-p21-animal-books'] },
  { id: 'p21-weiqi', english: 'She likes weiqi, but I like ball games.', chinese: '她喜欢围棋，但我喜欢球类运动。', focusItemIds: ['u2-p21-weiqi'] },
  { id: 'p21-sports', english: 'I often play football and basketball.', chinese: '我经常踢足球和打篮球。' },
  { id: 'p21-kind', english: 'Liu Jia is kind. She always makes me smile.', chinese: '刘佳很友善。她总是让我微笑。', focusItemIds: ['u2-p21-always'] },
  { id: 'p21-best', english: 'We are best friends.', chinese: '我们是最好的朋友。', focusItemIds: ['u2-p21-best-friends'] },
] }, { id: 'choose-and-write', label: 'Choose and write', chineseLabel: '选一选，写一写', sentences: [
  { id: 'p21-write', english: 'Liu Jia is kind. She has long hair. She often reads books.', chinese: '刘佳很友善。她有长头发。她经常读书。' },
  { id: 'p21-about', english: 'What about your best friend?', chinese: '你的好朋友呢？' },
] }], [
  { id: 'p21-practice-books', chinesePrompt: '我们喜欢动物书，也经常分享。', answer: 'We like animal books and often share.', relatedSentenceId: 'p21-books' },
  { id: 'p21-practice-smile', chinesePrompt: '她总是让我微笑。', answer: 'She always makes me smile.', relatedSentenceId: 'p21-kind' },
  { id: 'p21-practice-best', chinesePrompt: '我们是最好的朋友。', answer: 'We are best friends.', relatedSentenceId: 'p21-best' },
], checks(21,
  { prompt: '“总是”用英语怎么说？', answer: 'always', hint: '比 often 频率更高。', item: { id: 'u2-p21-always', kind: 'word', english: 'always', chinese: '总是' } },
  { prompt: '补全：We are best ___.', answer: 'friends', hint: '课文结尾的词。', item: { id: 'u2-p21-best-friends', kind: 'word', english: 'friends', chinese: '朋友' } },
), ['读懂两位朋友的相同和不同。', '说出自己和朋友喜欢的活动。', '用 always 表达朋友的好品质。']);

const page22 = page(22, 'Project: Make a book about your friend', '项目：制作朋友小书', [
  focus(22, 'his-her', 'His/Her name is ...', '他的/她的名字是……', 'appendix-expression', '介绍朋友的表达'),
  focus(22, 'big-eyes', 'big eyes', '大眼睛', 'appendix-vocabulary', '描述外貌的词块'),
  focus(22, 'small-eyes', 'small eyes', '小眼睛', 'appendix-vocabulary', '描述外貌的词块'),
], [{ id: 'project-one', label: 'Project', chineseLabel: '项目活动', sentences: [
  { id: 'p22-picture', english: 'Who are the children in the picture? Listen and circle Mike’s best friend.', chinese: '图片里的孩子是谁？听一听，圈出迈克最好的朋友。' },
  { id: 'p22-talk', english: 'Talk about your friends.', chinese: '谈谈你的朋友。' },
  { id: 'p22-structure', english: 'He/She is ... He/She has ... He/She often ...', chinese: '他/她…… 他/她有…… 他/她经常……' },
  { id: 'p22-name', english: "What's his/her name? His/Her name is ...", chinese: '他/她叫什么名字？他/她的名字是……', focusItemIds: ['u2-p22-his-her'] },
] }, { id: 'word-bank', label: 'Word bank', chineseLabel: '词语小仓库', sentences: [
  { id: 'p22-bank-one', english: 'kind, quiet, short/tall, strong/thin', chinese: '友善的，安静的，矮的/高的，强壮的/瘦的' },
  { id: 'p22-bank-two', english: 'long hair, short hair, big eyes, small eyes', chinese: '长头发，短头发，大眼睛，小眼睛', focusItemIds: ['u2-p22-big-eyes', 'u2-p22-small-eyes'] },
  { id: 'p22-bank-three', english: 'reads books, plays games, plays football, helps me with English', chinese: '读书，玩游戏，踢足球，帮助我学英语' },
] }], [
  { id: 'p22-practice-name', chinesePrompt: '他叫什么名字？', answer: "What's his name?", relatedSentenceId: 'p22-name' },
  { id: 'p22-practice-eyes', chinesePrompt: '她有大眼睛。', answer: 'She has big eyes.', relatedSentenceId: 'p22-bank-two' },
], checks(22,
  { prompt: '补全：___ name is Mike.（他的）', answer: 'His', hint: '男生用 His。', item: { id: 'u2-p22-his-her', kind: 'sentence', english: 'His name is ...', chinese: '他的名字是……' } },
  { prompt: '“小眼睛”用英语怎么说？', answer: 'small eyes', hint: 'small 表示“小”。', item: { id: 'u2-p22-small-eyes', kind: 'sentence', english: 'small eyes', chinese: '小眼睛' } },
), ['收集介绍朋友的词语。', '用 He/She is、has、often 组织介绍。', '准备制作朋友小书。']);

const page23 = page(23, 'Make a book about your friend', '完成朋友小书', [
  focus(23, 'likes', 'He/She likes ...', '他/她喜欢……', 'appendix-expression', '介绍兴趣的句型'),
  focus(23, 'fun', 'We have so much fun.', '我们玩得很开心。', 'appendix-expression', '本页结尾表达'),
  focus(23, 'self-check', 'Self-check', '自我检查', 'body', '完成项目后自评'),
], [{ id: 'make-book', label: 'Make a book about your friend', chineseLabel: '制作朋友小书', sentences: [
  { id: 'p23-intro', english: 'I have a friend. His/Her name is ...', chinese: '我有一个朋友。他/她的名字是……' },
  { id: 'p23-likes', english: 'He/She likes ...', chinese: '他/她喜欢……', focusItemIds: ['u2-p23-likes'] },
  { id: 'p23-character', english: 'He/She is ... He/She has ... He/She often ...', chinese: '他/她…… 他/她有…… 他/她经常……' },
  { id: 'p23-fun', english: 'We often ... We have so much fun.', chinese: '我们经常……我们玩得很开心。', focusItemIds: ['u2-p23-fun'] },
  { id: 'p23-best', english: 'He/She is my best friend.', chinese: '他/她是我最好的朋友。' },
  { id: 'p23-share', english: 'Share your book in class.', chinese: '在班上分享你的小书。' },
] }, { id: 'self-check', label: 'Self-check', chineseLabel: '自我检查', sentences: [
  { id: 'p23-check-talk', english: 'I can talk about my friends.', chinese: '我能谈论我的朋友。', focusItemIds: ['u2-p23-self-check'] },
  { id: 'p23-check-do', english: 'I can say what I do with my friends.', chinese: '我能说出我和朋友一起做什么。' },
  { id: 'p23-check-why', english: 'I can tell why someone is my friend.', chinese: '我能说出某人为什么是我的朋友。' },
  { id: 'p23-check-sh', english: 'I can read and spell words with “sh”.', chinese: '我能读和拼写含 sh 的单词。' },
] }], [
  { id: 'p23-practice-likes', chinesePrompt: '她喜欢围棋。', answer: 'She likes weiqi.', relatedSentenceId: 'p23-likes' },
  { id: 'p23-practice-fun', chinesePrompt: '我们玩得很开心。', answer: 'We have so much fun.', relatedSentenceId: 'p23-fun' },
  { id: 'p23-practice-best', chinesePrompt: '他是我最好的朋友。', answer: 'He is my best friend.', relatedSentenceId: 'p23-best' },
], checks(23,
  { prompt: '补全：She ___ animal books.', answer: 'likes', hint: '主语是 she，like 要加 s。', item: { id: 'u2-p23-likes', kind: 'word', english: 'likes', chinese: '喜欢' } },
  { prompt: '补全：We have so much ___.', answer: 'fun', hint: '表示“乐趣”。', item: { id: 'u2-p23-fun', kind: 'sentence', english: 'We have so much fun.', chinese: '我们玩得很开心。' } },
), ['完成一页朋友小书。', '介绍朋友的外貌、性格和兴趣。', '完成 Unit 2 的 Self-check。']);

const page24 = page(24, 'Reading time', '阅读时间（一）', [
  focus(24, 'good-friend', 'good friend', '好朋友', 'appendix-vocabulary', '阅读主题词块'),
  focus(24, 'small-eyes', 'small eyes', '小眼睛', 'appendix-vocabulary', '描述外貌'),
  focus(24, 'big-ears', 'big ears', '大耳朵', 'appendix-vocabulary', '描述外貌'),
], [{ id: 'reading', label: 'Reading time', chineseLabel: '阅读时间', sentences: [
  { id: 'p24-tell', english: 'Tell me about your good friend.', chinese: '告诉我你的好朋友吧。', focusItemIds: ['u2-p24-good-friend'] },
  { id: 'p24-great', english: 'Oh, he’s great.', chinese: '哦，他很棒。' },
  { id: 'p24-look', english: 'What does he look like?', chinese: '他长什么样？' },
  { id: 'p24-eyes-ears', english: 'He has small eyes and very big ears.', chinese: '他有小眼睛和非常大的耳朵。', focusItemIds: ['u2-p24-small-eyes', 'u2-p24-big-ears'] },
  { id: 'p24-legs-body', english: 'He has short legs, but his body is very long.', chinese: '他有短腿，但是身体很长。' },
] }], [
  { id: 'p24-practice-look', chinesePrompt: '他长什么样？', answer: 'What does he look like?', relatedSentenceId: 'p24-look' },
  { id: 'p24-practice-ears', chinesePrompt: '他有小眼睛和非常大的耳朵。', answer: 'He has small eyes and very big ears.', relatedSentenceId: 'p24-eyes-ears' },
], checks(24,
  { prompt: '补全：He has small ___ and big ears.', answer: 'eyes', hint: '表示“眼睛”。', item: { id: 'u2-p24-small-eyes', kind: 'sentence', english: 'small eyes', chinese: '小眼睛' } },
  { prompt: '“好朋友”用英语怎么说？', answer: 'good friend', hint: '阅读开头的称呼。', item: { id: 'u2-p24-good-friend', kind: 'sentence', english: 'good friend', chinese: '好朋友' } },
), ['用 What does he/she look like? 提问。', '用 He/She has ... 描述外貌。', '读懂朋友原来是一只小动物。']);

const page25 = page(25, 'Reading time', '阅读时间（二）', [
  focus(25, 'park', 'park', '公园', 'appendix-word', 'Unit 2 单元词（Appendix 2）'),
  focus(25, 'play-games', 'play games together', '一起玩游戏', 'appendix-expression', '描述共同活动'),
  focus(25, 'here-he-comes', 'Here he comes.', '他来了。', 'appendix-expression', '阅读中的常用表达'),
], [{ id: 'reading', label: 'Reading time', chineseLabel: '阅读时间', sentences: [
  { id: 'p25-together-question', english: 'What do you do together?', chinese: '你们一起做什么？' },
  { id: 'p25-park', english: 'He likes the park very much. We often play games together.', chinese: '他非常喜欢公园。我们经常一起玩游戏。', focusItemIds: ['u2-p25-park', 'u2-p25-play-games'] },
  { id: 'p25-meet', english: 'Can I meet your friend?', chinese: '我能见见你的朋友吗？' },
  { id: 'p25-comes', english: 'Sure. Look! Here he comes.', chinese: '当然。看！他来了。', focusItemIds: ['u2-p25-here-he-comes'] },
  { id: 'p25-friend', english: 'This is my good friend!', chinese: '这是我的好朋友！' },
] }], [
  { id: 'p25-practice-together', chinesePrompt: '你们一起做什么？', answer: 'What do you do together?', relatedSentenceId: 'p25-together-question' },
  { id: 'p25-practice-games', chinesePrompt: '我们经常一起玩游戏。', answer: 'We often play games together.', relatedSentenceId: 'p25-park' },
  { id: 'p25-practice-comes', chinesePrompt: '看！他来了。', answer: 'Look! Here he comes.', relatedSentenceId: 'p25-comes' },
], checks(25,
  { prompt: '“公园”用英语怎么说？', answer: 'park', hint: '朋友很喜欢去的地方。', item: { id: 'u2-p25-park', kind: 'word', english: 'park', chinese: '公园' } },
  { prompt: '补全：Here he ___.', answer: 'comes', hint: '表示“他来了”。', item: { id: 'u2-p25-here-he-comes', kind: 'sentence', english: 'Here he comes.', chinese: '他来了。' } },
), ['说出和朋友一起做的事。', '用 Here he comes. 介绍朋友出现。', '完成 Unit 2 的阅读时间。']);

export const pepGrade4UpperUnit2Pages = [page14, page15, page16, page17, page18, page19, page20, page21, page22, page23, page24, page25];
