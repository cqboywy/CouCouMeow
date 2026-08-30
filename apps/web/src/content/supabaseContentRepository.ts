import { ContentIntegrityError, type ContentRepository } from './contentRepository';
import type { SupabaseContentGateway } from './supabaseContentGateway';
import type { ContentCatalog, ExtraEpisode, SchoolExercise, SchoolLearningItem, SchoolLesson, SchoolPage, SchoolTextbook } from './types';

const ordered = <T extends { sequence_no: number }>(rows: T[]) => [...rows].sort((a, b) => a.sequence_no - b.sequence_no);
const findOrThrow = <T>(map: Map<string, T>, key: string, kind: string): T => {
  const value = map.get(key);
  if (!value) throw new ContentIntegrityError(`missing ${kind} ${key}`);
  return value;
};

export function createSupabaseContentRepository(gateway: SupabaseContentGateway): ContentRepository {
  let catalogPromise: Promise<ContentCatalog> | undefined;

  const buildCatalog = async (): Promise<ContentCatalog> => {
    const rows = await gateway.loadRows();
    if (!rows.textbooks.length && !rows.episodes.length) throw new ContentIntegrityError('empty catalog');
    if ([...rows.textbooks, ...rows.episodes].some(row => row.content_status !== 'published')) {
      throw new ContentIntegrityError('unpublished root leaked through content policy');
    }

    const itemByUuid = new Map<string, SchoolLearningItem>(rows.items.map(row => [row.id, {
      id: row.content_key,
      kind: row.item_kind,
      english: row.english,
      chinese: row.chinese,
      ...(row.phonetic ? { phonetic: row.phonetic } : {}),
    }]));
    const textbookKeyByUuid = new Map(rows.textbooks.map(row => [row.id, row.content_key]));
    const unitKeyByUuid = new Map(rows.units.map(row => [row.id, row.content_key]));

    const exerciseFrom = (row: Record<string, any>): SchoolExercise => ({
      id: row.content_key, stage: row.stage, kind: row.exercise_kind, prompt: row.prompt,
      answer: row.answer, options: row.options, hint: row.hint,
      ...(row.item_id ? { item: findOrThrow(itemByUuid, row.item_id, 'item') } : {}),
    });

    const pageByUuid = new Map<string, SchoolPage>();
    for (const row of rows.pages) {
      pageByUuid.set(row.id, {
        id: row.content_key,
        textbookId: findOrThrow(textbookKeyByUuid, row.textbook_id, 'textbook'),
        unitId: findOrThrow(unitKeyByUuid, row.unit_id, 'unit'),
        printedPage: row.printed_page,
        title: row.title,
        chineseTitle: row.chinese_title,
        sections: row.sections,
        practicePrompts: row.practice_prompts,
        finishItems: row.finish_items,
        focusItems: ordered(rows.pageItems.filter(link => link.page_id === row.id && link.item_role === 'focus')).map(link => ({
          ...findOrThrow(itemByUuid, link.item_id, 'item'), source: link.source, note: link.note,
        })),
        checks: ordered(rows.exercises.filter(item => item.page_id === row.id)).map(exerciseFrom),
      });
    }

    const lessonByUuid = new Map<string, SchoolLesson>();
    for (const row of rows.lessons) {
      const linked = (role: string) => ordered(rows.lessonItems.filter(link => link.lesson_id === row.id && link.item_role === role))
        .map(link => findOrThrow(itemByUuid, link.item_id, 'item'));
      lessonByUuid.set(row.id, {
        id: row.content_key,
        textbookId: findOrThrow(textbookKeyByUuid, row.textbook_id, 'textbook'),
        unitId: findOrThrow(unitKeyByUuid, row.unit_id, 'unit'),
        sequence: row.sequence_no,
        title: row.title,
        subtitle: row.subtitle,
        pageReferences: row.page_references,
        durationMinutes: row.duration_minutes,
        concepts: row.concepts,
        steps: row.steps,
        vocabulary: linked('vocabulary'),
        sentences: linked('sentence'),
        phonics: linked('phonics'),
        explanation: row.explanation,
        exercises: ordered(rows.exercises.filter(item => item.lesson_id === row.id)).map(exerciseFrom),
      });
    }

    const textbooks: SchoolTextbook[] = rows.textbooks.map(textbook => ({
      id: textbook.content_key,
      curriculum: textbook.curriculum,
      grade: textbook.grade,
      semester: textbook.semester,
      title: textbook.title,
      currentUnitId: textbook.current_unit_key,
      units: ordered(rows.units.filter(unit => unit.textbook_id === textbook.id)).map(unit => ({
        id: unit.content_key,
        textbookId: textbook.content_key,
        sequence: unit.sequence_no,
        title: unit.title,
        chineseTitle: unit.chinese_title,
        bigQuestion: unit.big_question,
        bigQuestionChinese: unit.big_question_chinese,
        objectives: unit.objectives,
        lessons: ordered(rows.lessons.filter(lesson => lesson.unit_id === unit.id)).map(lesson => findOrThrow(lessonByUuid, lesson.id, 'lesson')),
        pages: [...rows.pages.filter(page => page.unit_id === unit.id)].sort((a, b) => a.printed_page - b.printed_page).map(page => findOrThrow(pageByUuid, page.id, 'page')),
      })),
    }));

    const extraEpisodes: ExtraEpisode[] = rows.episodes.map(episode => ({
      id: episode.content_key,
      level: episode.level,
      seriesTitle: episode.series_title,
      episodeNumber: episode.episode_number,
      title: episode.title,
      chineseTitle: episode.chinese_title,
      media: { provider: episode.media_provider, locator: episode.media_locator, localVideoFilename: episode.local_video_filename, localSrtFilename: episode.local_srt_filename },
      storySummary: episode.story_summary,
      storyTheme: episode.story_theme,
      comprehensionQuestions: episode.comprehension_questions,
      retellSteps: episode.retell_steps,
      pastTensePairs: episode.past_tense_pairs,
      sentences: ordered(rows.sentences.filter(item => item.episode_id === episode.id)).map(item => ({ id: item.content_key, english: item.english_text, chinese: item.chinese_translation, isFeatured: item.is_featured })),
      vocab: ordered(rows.vocab.filter(item => item.episode_id === episode.id)).map(item => ({ id: item.content_key, word: item.word, phonetic: item.phonetic, meaning: item.chinese_meaning })),
      knowledge: ordered(rows.knowledge.filter(item => item.episode_id === episode.id)).map(item => ({ id: item.content_key, title: item.title, explanation: item.grammar_explanation, coreKnowledge: item.core_knowledge, examples: item.examples })),
    })).sort((a, b) => a.level - b.level || a.seriesTitle.localeCompare(b.seriesTitle) || a.episodeNumber - b.episodeNumber);

    return { textbooks, extraEpisodes };
  };

  const loadCatalog = () => catalogPromise ??= buildCatalog();
  return {
    loadCatalog,
    async loadSchoolPage(contentKey) {
      const catalog = await loadCatalog();
      const page = catalog.textbooks.flatMap(book => book.units).flatMap(unit => unit.pages).find(item => item.id === contentKey);
      if (!page) throw new ContentIntegrityError(`missing page ${contentKey}`);
      return page;
    },
    async loadSchoolLesson(contentKey) {
      const catalog = await loadCatalog();
      const lesson = catalog.textbooks.flatMap(book => book.units).flatMap(unit => unit.lessons).find(item => item.id === contentKey);
      if (!lesson) throw new ContentIntegrityError(`missing lesson ${contentKey}`);
      return lesson;
    },
    async loadExtraEpisode(contentKey) {
      const catalog = await loadCatalog();
      const episode = catalog.extraEpisodes.find(item => item.id === contentKey);
      if (!episode) throw new ContentIntegrityError(`missing episode ${contentKey}`);
      return episode;
    },
  };
}
