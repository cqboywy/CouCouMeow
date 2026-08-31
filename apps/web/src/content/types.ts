export type SchoolItemKind = 'word' | 'sentence' | 'phonics' | 'project';

export type SchoolLearningItem = {
  id: string;
  kind: SchoolItemKind;
  english: string;
  chinese: string;
  phonetic?: string;
};

export type TextbookFocusItem = SchoolLearningItem & {
  source: 'body' | 'appendix-word' | 'appendix-vocabulary' | 'appendix-expression';
  note: string;
};

export type SchoolExercise = {
  id: string;
  stage: 'practice' | 'check';
  kind: 'choice' | 'typing' | 'self_check';
  prompt: string;
  answer: string;
  options?: string[];
  hint: string;
  item?: SchoolLearningItem;
};

export type SchoolPage = {
  id: string;
  textbookId: string;
  unitId: string;
  printedPage: number;
  title: string;
  chineseTitle: string;
  sections: Array<{ id: string; label: string; chineseLabel: string; sentences: Array<{ id: string; english: string; chinese: string; focusItemIds?: string[] }> }>;
  focusItems: TextbookFocusItem[];
  practicePrompts: Array<{ id: string; chinesePrompt: string; answer: string; relatedSentenceId: string }>;
  checks: Array<{ id: string; prompt: string; answer: string; hint: string; item?: SchoolLearningItem }>;
  finishItems?: string[];
};

export type SchoolLesson = {
  id: string;
  unitId: string;
  textbookId: string;
  sequence: number;
  title: string;
  subtitle: string;
  pageReferences: number[];
  durationMinutes: number;
  concepts: string[];
  steps: Array<{ kind: 'learn' | 'practice' | 'check'; title: string }>;
  vocabulary: SchoolLearningItem[];
  sentences: SchoolLearningItem[];
  phonics: SchoolLearningItem[];
  explanation: string;
  exercises: SchoolExercise[];
};

export type SchoolUnit = {
  id: string;
  textbookId: string;
  sequence: number;
  title: string;
  chineseTitle: string;
  bigQuestion: string;
  bigQuestionChinese: string;
  objectives: Array<{ id: string; title: string }>;
  lessons: SchoolLesson[];
  pages: SchoolPage[];
};

export type SchoolTextbook = {
  id: string;
  curriculum: string;
  grade: number;
  semester: 'upper' | 'lower';
  title: string;
  currentUnitId: string;
  units: SchoolUnit[];
};

export type ExtraEpisode = {
  id: string;
  level: number;
  seriesTitle: string;
  episodeNumber: number;
  title: string;
  chineseTitle: string;
  media: { provider: string; locator: string | null; localVideoFilename: string | null; localSrtFilename: string | null };
  storySummary: string;
  storyTheme: string;
  comprehensionQuestions: string[];
  retellSteps: string[];
  pastTensePairs: Array<{ base: string; past: string; meaning: string }>;
  sentences: Array<{ id: string; english: string; chinese: string; isFeatured: boolean }>;
  vocab: Array<{ id: string; word: string; phonetic: string; meaning: string }>;
  knowledge: Array<{ id: string; title: string; explanation: string; coreKnowledge: string; examples: string[] }>;
};

export type ContentCatalog = { textbooks: SchoolTextbook[]; extraEpisodes: ExtraEpisode[] };
