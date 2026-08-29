export type SchoolItemKind = 'word' | 'sentence' | 'phonics' | 'project';

export type SchoolLearningItem = {
  id: string;
  kind: SchoolItemKind;
  english: string;
  chinese: string;
  phonetic?: string;
};

export type TextbookFocusSource = 'body' | 'appendix-word' | 'appendix-vocabulary' | 'appendix-expression';

export type TextbookFocusItem = SchoolLearningItem & {
  source: TextbookFocusSource;
  note: string;
};

export type TextbookSentence = {
  id: string;
  english: string;
  chinese: string;
  focusItemIds?: string[];
};

export type TextbookPageSection = {
  id: string;
  label: string;
  chineseLabel: string;
  sentences: TextbookSentence[];
};

export type TextbookPagePracticePrompt = {
  id: string;
  chinesePrompt: string;
  answer: string;
  relatedSentenceId: string;
};

export type TextbookPageCheck = {
  id: string;
  prompt: string;
  answer: string;
  hint: string;
  item?: SchoolLearningItem;
};

export type TextbookPage = {
  id: string;
  textbookId: string;
  unitId: string;
  printedPage: number;
  title: string;
  chineseTitle: string;
  sections: TextbookPageSection[];
  focusItems: TextbookFocusItem[];
  practicePrompts: TextbookPagePracticePrompt[];
  checks: TextbookPageCheck[];
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

export type LessonStep = {
  kind: 'learn' | 'practice' | 'check';
  title: string;
};

export type CurriculumLesson = {
  id: string;
  unitId: string;
  textbookId: string;
  sequence: number;
  title: string;
  subtitle: string;
  pageReferences: number[];
  durationMinutes: number;
  concepts: string[];
  steps: LessonStep[];
  vocabulary: SchoolLearningItem[];
  sentences: SchoolLearningItem[];
  phonics: SchoolLearningItem[];
  explanation: string;
  exercises: SchoolExercise[];
};

export type CurriculumObjective = {
  id: string;
  title: string;
};

export type CurriculumUnit = {
  id: string;
  textbookId: string;
  sequence: number;
  title: string;
  chineseTitle: string;
  bigQuestion: string;
  bigQuestionChinese: string;
  objectives: CurriculumObjective[];
  lessons: CurriculumLesson[];
};

export type CurriculumTextbook = {
  id: string;
  curriculum: string;
  grade: number;
  semester: 'upper' | 'lower';
  title: string;
  currentUnitId: string;
  units: CurriculumUnit[];
};
