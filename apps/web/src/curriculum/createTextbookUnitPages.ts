import type { TextbookFocusItem, TextbookPage, TextbookPageCheck } from './types';

export type TextbookLine = { english: string; chinese: string; focus?: string[] };
export type TextbookFocus = { english: string; chinese: string; source?: TextbookFocusItem['source']; note?: string };
export type TextbookPageSeed = {
  printedPage: number;
  title: string;
  chineseTitle: string;
  lines: TextbookLine[];
  focus: TextbookFocus[];
};

/** Keeps later units compact while preserving every page's learning interactions. */
export const createTextbookUnitPages = (unitId: string, seeds: TextbookPageSeed[]): TextbookPage[] => seeds.map(seed => {
  const focusItems = seed.focus.map((item, index) => ({
    id: `${unitId}-p${seed.printedPage}-focus-${index}`,
    kind: item.english.includes(' ') || item.english.includes('?') ? 'sentence' as const : 'word' as const,
    english: item.english,
    chinese: item.chinese,
    source: item.source ?? 'appendix-vocabulary',
    note: item.note ?? '教材页重点词块',
  }));
  const focusByEnglish = new Map(seed.focus.map((item, index) => [item.english, focusItems[index].id]));
  const sentences = seed.lines.map((line, index) => ({
    id: `p${seed.printedPage}-line-${index + 1}`,
    english: line.english,
    chinese: line.chinese,
    focusItemIds: line.focus?.map(item => focusByEnglish.get(item)).filter((id): id is string => Boolean(id)),
  }));
  const first = sentences[0];
  const second = sentences[1] ?? first;
  const firstFocus = focusItems[0];
  const checks: TextbookPageCheck[] = [
    { id: `p${seed.printedPage}-check-1`, prompt: `“${firstFocus.chinese}”用英语怎么说？`, answer: firstFocus.english, hint: '回到本页重点词块看一看。', item: firstFocus },
    { id: `p${seed.printedPage}-check-2`, prompt: `说出这句话：${second.chinese}`, answer: second.english, hint: '先想句子的开头。', item: { id: `${unitId}-p${seed.printedPage}-line-check`, kind: 'sentence', english: second.english, chinese: second.chinese } },
  ];
  return {
    id: `${unitId}-p${seed.printedPage}`,
    textbookId: 'pep-grade4-upper',
    unitId,
    printedPage: seed.printedPage,
    title: seed.title,
    chineseTitle: seed.chineseTitle,
    focusItems,
    sections: [{ id: 'page-learning', label: seed.title, chineseLabel: seed.chineseTitle, sentences }],
    practicePrompts: [
      { id: `p${seed.printedPage}-practice-1`, chinesePrompt: first.chinese, answer: first.english, relatedSentenceId: first.id },
      { id: `p${seed.printedPage}-practice-2`, chinesePrompt: second.chinese, answer: second.english, relatedSentenceId: second.id },
    ],
    checks,
    finishItems: [`读懂“${seed.chineseTitle}”的核心内容。`, `能说出：${first.english}`, `完成本页的开口挑战和小检查。`],
  } satisfies TextbookPage;
});
