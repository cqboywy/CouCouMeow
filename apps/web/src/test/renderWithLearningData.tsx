import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement } from 'react';
import { LearningDataReadyProvider } from '../data/LearningDataProvider';
import type { LearningProgressRepository } from '../data/learningProgressRepository';
import { ContentReadyProvider } from '../content/ContentProvider';
import type { ContentCatalog } from '../content/types';
import schoolManifest from '../../../../content/school/pep-grade4-upper/manifest.json';
import theParkManifest from '../../../../content/extra/l1-001-dino-buddies-the-park/manifest.json';
import huntingManifest from '../../../../content/extra/l1-bat-and-friends-001-hunting-for-bugs/manifest.json';
import rainManifest from '../../../../content/extra/l1-bat-and-friends-002-lost-in-the-rain/manifest.json';

const school = schoolManifest as any;
const itemByKey = new Map(school.items.map((item: any) => [item.content_key, {
  id: item.content_key, kind: item.item_kind, english: item.english, chinese: item.chinese,
  ...(item.phonetic ? { phonetic: item.phonetic } : {}),
}]));
const item = (key: string) => itemByKey.get(key)!;
const exercises = (owner: 'lesson_key' | 'page_key', key: string) => school.exercises.filter((value: any) => value[owner] === key).map((value: any) => ({
  id: value.content_key, stage: value.stage, kind: value.exercise_kind, prompt: value.prompt,
  answer: value.answer, options: value.options, hint: value.hint,
  ...(value.item_key ? { item: item(value.item_key) } : {}),
}));
const extraPackage = (manifest: any) => ({
  id: manifest.episode.content_key, level: manifest.episode.level, seriesTitle: manifest.episode.series_title,
  episodeNumber: manifest.episode.episode_number, title: manifest.episode.title, chineseTitle: manifest.episode.chinese_title,
  media: { provider: manifest.episode.media_provider, locator: manifest.episode.media_locator, localVideoFilename: manifest.episode.local_video_filename, localSrtFilename: manifest.episode.local_srt_filename },
  storySummary: manifest.episode.story_summary, storyTheme: manifest.episode.story_theme,
  comprehensionQuestions: manifest.episode.comprehension_questions, retellSteps: manifest.episode.retell_steps, pastTensePairs: manifest.episode.past_tense_pairs,
  sentences: manifest.sentences.map((value: any) => ({ id: value.content_key, english: value.english_text, chinese: value.chinese_translation, isFeatured: value.is_featured })),
  vocab: manifest.vocab.map((value: any) => ({ id: value.content_key, word: value.word, phonetic: value.phonetic, meaning: value.chinese_meaning })),
  knowledge: manifest.knowledge.map((value: any) => ({ id: value.content_key, title: value.title, explanation: value.grammar_explanation, coreKnowledge: value.core_knowledge, examples: value.examples })),
});

export const testContentCatalog: ContentCatalog = {
  textbooks: [{
    id: school.textbook.content_key, curriculum: school.textbook.curriculum, grade: school.textbook.grade,
    semester: school.textbook.semester, title: school.textbook.title, currentUnitId: school.textbook.current_unit_key,
    units: school.units.map((unit: any) => ({
      id: unit.content_key, textbookId: school.textbook.content_key, sequence: unit.sequence_no,
      title: unit.title, chineseTitle: unit.chinese_title, bigQuestion: unit.big_question,
      bigQuestionChinese: unit.big_question_chinese, objectives: unit.objectives,
      lessons: school.lessons.filter((lesson: any) => lesson.unit_key === unit.content_key).map((lesson: any) => {
        const linked = (role: string) => school.lesson_items.filter((link: any) => link.lesson_key === lesson.content_key && link.item_role === role).map((link: any) => item(link.item_key));
        return { id: lesson.content_key, unitId: unit.content_key, textbookId: school.textbook.content_key, sequence: lesson.sequence_no, title: lesson.title, subtitle: lesson.subtitle, pageReferences: lesson.page_references, durationMinutes: lesson.duration_minutes, concepts: lesson.concepts, steps: lesson.steps, vocabulary: linked('vocabulary'), sentences: linked('sentence'), phonics: linked('phonics'), explanation: lesson.explanation, exercises: exercises('lesson_key', lesson.content_key) };
      }),
      pages: school.pages.filter((page: any) => page.unit_key === unit.content_key).map((page: any) => ({
        id: page.content_key, textbookId: school.textbook.content_key, unitId: unit.content_key,
        printedPage: page.printed_page, title: page.title, chineseTitle: page.chinese_title,
        sections: page.sections, practicePrompts: page.practice_prompts, finishItems: page.finish_items,
        focusItems: school.page_items.filter((link: any) => link.page_key === page.content_key).map((link: any) => ({ ...item(link.item_key), source: link.source, note: link.note })),
        checks: exercises('page_key', page.content_key),
      })),
    })),
  }],
  extraEpisodes: [theParkManifest, huntingManifest, rainManifest].map(extraPackage),
};
export const testTextbook = testContentCatalog.textbooks[0]!;
export const getTestLesson = (id: string) => testTextbook.units.flatMap(unit => unit.lessons).find(lesson => lesson.id === id);
export const getTestPage = (id: string) => testTextbook.units.flatMap(unit => unit.pages).find(page => page.id === id);

export const createTestLearningRepository = (): LearningProgressRepository => ({
  loadEvents: async () => [],
  appendEvents: async () => undefined,
  getSelectedTextbookId: async () => 'pep4a',
  setSelectedTextbookId: async () => undefined,
  getImportReceipt: async () => null,
  saveImportReceipt: async () => undefined,
  findEventIds: async () => new Set(),
});

export function renderWithLearningData(ui: ReactElement, options?: RenderOptions) {
  const repository = createTestLearningRepository();
  return render(
    <ContentReadyProvider catalog={testContentCatalog}>
      <LearningDataReadyProvider userId="test-user" repository={repository} initialEvents={[]} initialSelectedTextbookId="pep-grade4-upper">
        {ui}
      </LearningDataReadyProvider>
    </ContentReadyProvider>,
    options,
  );
}
