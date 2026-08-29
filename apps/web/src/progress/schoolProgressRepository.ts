import { getLessonById, getUnitById, pepGrade4Upper } from '../curriculum/pepGrade4UpperUnit1';
import { getTextbookPageById, getUnitTextbookPages } from '../curriculum/pepGrade4UpperTextbookPages';
import { pepGrade4UpperTextbookUnits } from '../curriculum/pepGrade4UpperTextbookStructure';
import type { SchoolLearningItem } from '../curriculum/types';

export const SCHOOL_PROGRESS_STORAGE_KEY = 'coucoumeow.school-progress.v1';
const VERSION = 1;

type SchoolEvent = {
  id: string;
  occurredAt: string;
  day: string;
  type: 'exercise' | 'lesson_completed' | 'page_completed' | 'page_check' | 'later_review_added' | 'later_review_resolved';
  textbookId: string;
  unitId: string;
  lessonId: string;
  pageId?: string;
  exerciseId?: string;
  correct?: boolean;
  item?: SchoolLearningItem;
  masteredItems?: SchoolLearningItem[];
};

type StoredSchoolProgress = {
  version: number;
  selectedTextbookId: string;
  events: SchoolEvent[];
};

export type SchoolMasteryItem = SchoolLearningItem & {
  source: 'school';
  lessonId: string;
  firstLearnedDay: string;
  latestPracticeDay: string;
};

export type SchoolReviewItem = SchoolLearningItem & {
  source: 'school';
  lessonId: string;
  exerciseId: string;
  pageId?: string;
};

export type SchoolLaterReviewItem = SchoolLearningItem & {
  source: 'school';
  pageId: string;
};

export type SchoolDailySummary = {
  day: string;
  practiceCount: number;
  completedLessonCount: number;
};

export type SchoolProgressSummary = {
  textbookId: string;
  unitId: string;
  completedLessonIds: string[];
  currentLessonId: string;
  completedPageIds: string[];
  currentPageId: string;
  practiceCount: number;
  masteredItems: SchoolMasteryItem[];
  reviewItems: SchoolReviewItem[];
  laterReviewItems: SchoolLaterReviewItem[];
  days: SchoolDailySummary[];
};

export type SchoolExerciseResult = {
  lessonId: string;
  exerciseId: string;
  item?: SchoolLearningItem;
  correct: boolean;
};

const orderedLessonIds = pepGrade4Upper.units.flatMap(unit => unit.lessons).map(lesson => lesson.id);
const orderedPageIds = pepGrade4UpperTextbookUnits.flatMap(unit => getUnitTextbookPages(unit.id)).map(page => page.id);
const lessonIdForPage = (pageId: string) => {
  const unitId = getTextbookPageById(pageId)?.unitId;
  return unitId ? getUnitById(unitId)?.lessons[0]?.id ?? pageId : '';
};
const localDay = (date: Date) => new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);

export function createSchoolProgressRepository(storage: Storage, now: () => Date) {
  const emptyRecord = (): StoredSchoolProgress => ({ version: VERSION, selectedTextbookId: pepGrade4Upper.id, events: [] });
  const read = (): StoredSchoolProgress => {
    try {
      const raw = storage.getItem(SCHOOL_PROGRESS_STORAGE_KEY);
      if (!raw) return emptyRecord();
      const parsed = JSON.parse(raw) as StoredSchoolProgress;
      if (parsed.version !== VERSION || !Array.isArray(parsed.events)) return emptyRecord();
      return parsed;
    } catch {
      return emptyRecord();
    }
  };
  const write = (record: StoredSchoolProgress) => storage.setItem(SCHOOL_PROGRESS_STORAGE_KEY, JSON.stringify(record));
  const append = (event: Omit<SchoolEvent, 'id' | 'occurredAt' | 'day' | 'textbookId' | 'unitId'>) => {
    const date = now();
    const record = read();
    record.events.push({
      ...event,
      id: crypto.randomUUID(),
      occurredAt: date.toISOString(),
      day: localDay(date),
      textbookId: record.selectedTextbookId,
      unitId: getTextbookPageById(event.pageId ?? '')?.unitId ?? getLessonById(event.lessonId)?.unitId ?? pepGrade4Upper.currentUnitId,
    });
    write(record);
  };
  const recordExercise = (result: SchoolExerciseResult) => append({
    type: 'exercise',
    lessonId: result.lessonId,
    exerciseId: result.exerciseId,
    correct: result.correct,
    item: result.item,
  });
  const completeLesson = (lessonId: string, masteredItems: SchoolLearningItem[]) => {
    const alreadyCompleted = read().events.some(event => event.type === 'lesson_completed' && event.lessonId === lessonId);
    if (!alreadyCompleted) append({ type: 'lesson_completed', lessonId, masteredItems });
  };
  const completePage = (pageId: string, masteredItems: SchoolLearningItem[]) => {
    const alreadyCompleted = read().events.some(event => event.type === 'page_completed' && event.pageId === pageId);
    if (!alreadyCompleted) append({ type: 'page_completed', lessonId: lessonIdForPage(pageId), pageId, masteredItems });
  };
  const addLaterReview = (pageId: string, item: SchoolLearningItem) => {
    append({ type: 'later_review_added', lessonId: lessonIdForPage(pageId), pageId, item });
  };
  const recordPageCheck = (pageId: string, checkId: string, item: SchoolLearningItem | undefined, correct: boolean) => {
    append({ type: 'page_check', lessonId: lessonIdForPage(pageId), pageId, exerciseId: checkId, item, correct });
  };
  const resolveLaterReview = (pageId: string, itemId: string) => {
    append({ type: 'later_review_resolved', lessonId: lessonIdForPage(pageId), pageId, item: { id: itemId, kind: 'word', english: '', chinese: '' } });
  };
  const selectTextbook = (textbookId: string) => {
    const record = read();
    record.selectedTextbookId = textbookId;
    write(record);
  };
  const getSummary = (): SchoolProgressSummary => {
    const record = read();
    const completedLessonIds = [...new Set(record.events.filter(event => event.type === 'lesson_completed').map(event => event.lessonId))];
    const completedPageIds = [...new Set(record.events.filter(event => event.type === 'page_completed' && event.pageId).map(event => event.pageId!))];
    const mastered = new Map<string, SchoolMasteryItem>();
    for (const event of record.events) {
      if (event.type === 'lesson_completed' || event.type === 'page_completed') {
        for (const item of event.masteredItems ?? []) {
          if (!mastered.has(item.id)) mastered.set(item.id, { ...item, source: 'school', lessonId: event.lessonId, firstLearnedDay: event.day, latestPracticeDay: event.day });
        }
      }
      if (event.type === 'exercise' && event.correct && event.item) {
        const current = mastered.get(event.item.id);
        if (current) current.latestPracticeDay = event.day;
      }
    }
    const latestPractice = new Map<string, SchoolEvent>();
    for (const event of record.events) {
      if ((event.type === 'exercise' || event.type === 'page_check') && event.item) latestPractice.set(event.item.id, event);
    }
    const reviewItems = [...latestPractice.values()]
      .filter(event => event.correct === false && event.item && event.exerciseId)
      .map(event => ({ ...event.item!, source: 'school' as const, lessonId: event.lessonId, exerciseId: event.exerciseId!, pageId: event.pageId }));
    const dailyMap = new Map<string, SchoolDailySummary>();
    for (const event of record.events) {
      const daily = dailyMap.get(event.day) ?? { day: event.day, practiceCount: 0, completedLessonCount: 0 };
      if (event.type === 'exercise' || event.type === 'page_check') daily.practiceCount += 1;
      if (event.type === 'lesson_completed') daily.completedLessonCount += 1;
      dailyMap.set(event.day, daily);
    }
    const currentLessonId = orderedLessonIds.find(id => !completedLessonIds.includes(id)) ?? orderedLessonIds.at(-1)!;
    const currentPageId = orderedPageIds.find(id => !completedPageIds.includes(id)) ?? orderedPageIds.at(-1) ?? '';
    const laterReview = new Map<string, SchoolLaterReviewItem>();
    for (const event of record.events) {
      if (!event.pageId || !event.item) continue;
      const key = `${event.pageId}:${event.item.id}`;
      if (event.type === 'later_review_added') laterReview.set(key, { ...event.item, source: 'school', pageId: event.pageId });
      if (event.type === 'later_review_resolved') laterReview.delete(key);
    }
    return {
      textbookId: record.selectedTextbookId,
      unitId: getTextbookPageById(currentPageId)?.unitId ?? getLessonById(currentLessonId)?.unitId ?? pepGrade4Upper.currentUnitId,
      completedLessonIds,
      currentLessonId,
      completedPageIds,
      currentPageId,
      practiceCount: record.events.filter(event => event.type === 'exercise' || event.type === 'page_check').length,
      masteredItems: [...mastered.values()],
      reviewItems,
      laterReviewItems: [...laterReview.values()],
      days: [...dailyMap.values()].sort((a, b) => b.day.localeCompare(a.day)).slice(0, 7),
    };
  };
  return { getSummary, recordExercise, completeLesson, completePage, recordPageCheck, addLaterReview, resolveLaterReview, selectTextbook };
}
