export type SchoolItemKind = 'word' | 'sentence' | 'phonics' | 'project';

export type SchoolLearningItem = {
  id: string;
  kind: SchoolItemKind;
  english: string;
  chinese: string;
  phonetic?: string;
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
