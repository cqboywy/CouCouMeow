import type { SchoolLearningEvent } from './learningEvents';
import type { SchoolLearningItem, SchoolTextbook } from '../content/types';

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

export type SchoolLaterReviewItem = SchoolLearningItem & { source: 'school'; pageId: string };
export type SchoolDailySummary = { day: string; practiceCount: number; completedLessonCount: number; completedPageCount: number };
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

export function deriveSchoolProgress(events: SchoolLearningEvent[], selectedTextbookId: string, textbook: SchoolTextbook): SchoolProgressSummary {
  const lessons = textbook.units.flatMap(unit => unit.lessons);
  const pages = textbook.units.flatMap(unit => unit.pages);
  const orderedLessonIds = lessons.map(lesson => lesson.id);
  const orderedPageIds = pages.map(page => page.id);
  const sorted = [...events].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
  const completedLessonIds = [...new Set(sorted.filter(event => event.eventType === 'lesson_completed').map(event => event.payload.lessonId))];
  const completedPageIds = [...new Set(sorted.filter(event => event.eventType === 'page_completed' && event.payload.pageId).map(event => event.payload.pageId!))];
  const mastered = new Map<string, SchoolMasteryItem>();

  for (const event of sorted) {
    if (event.eventType === 'lesson_completed' || event.eventType === 'page_completed') {
      for (const item of event.payload.masteredItems ?? []) {
        if (!mastered.has(item.id)) {
          mastered.set(item.id, {
            ...item,
            source: 'school',
            lessonId: event.payload.lessonId,
            firstLearnedDay: event.localDay,
            latestPracticeDay: event.localDay,
          });
        }
      }
    }
    if ((event.eventType === 'exercise' || event.eventType === 'page_check') && event.payload.correct && event.payload.item) {
      const current = mastered.get(event.payload.item.id);
      if (current) current.latestPracticeDay = event.localDay;
    }
  }

  const latestPractice = new Map<string, SchoolLearningEvent>();
  for (const event of sorted) {
    if ((event.eventType === 'exercise' || event.eventType === 'page_check') && event.payload.item) {
      latestPractice.set(event.payload.item.id, event);
    }
  }
  const reviewItems = [...latestPractice.values()]
    .filter(event => event.payload.correct === false && event.payload.item && event.payload.exerciseId)
    .map(event => ({
      ...event.payload.item!,
      source: 'school' as const,
      lessonId: event.payload.lessonId,
      exerciseId: event.payload.exerciseId!,
      pageId: event.payload.pageId,
    }));

  const dailyMap = new Map<string, SchoolDailySummary>();
  for (const event of sorted) {
    const daily = dailyMap.get(event.localDay) ?? { day: event.localDay, practiceCount: 0, completedLessonCount: 0, completedPageCount: 0 };
    if (event.eventType === 'exercise' || event.eventType === 'page_check') daily.practiceCount += 1;
    if (event.eventType === 'lesson_completed') daily.completedLessonCount += 1;
    if (event.eventType === 'page_completed') daily.completedPageCount += 1;
    dailyMap.set(event.localDay, daily);
  }

  const currentLessonId = orderedLessonIds.find(id => !completedLessonIds.includes(id)) ?? orderedLessonIds.at(-1)!;
  const currentPageId = orderedPageIds.find(id => !completedPageIds.includes(id)) ?? orderedPageIds.at(-1) ?? '';
  const laterReview = new Map<string, SchoolLaterReviewItem>();
  for (const event of sorted) {
    if (!event.payload.pageId || !event.payload.item) continue;
    const key = `${event.payload.pageId}:${event.payload.item.id}`;
    if (event.eventType === 'later_review_added') laterReview.set(key, { ...event.payload.item, source: 'school', pageId: event.payload.pageId });
    if (event.eventType === 'later_review_resolved') laterReview.delete(key);
  }

  return {
    textbookId: selectedTextbookId,
    unitId: pages.find(page => page.id === currentPageId)?.unitId ?? lessons.find(lesson => lesson.id === currentLessonId)?.unitId ?? textbook.currentUnitId,
    completedLessonIds,
    currentLessonId,
    completedPageIds,
    currentPageId,
    practiceCount: sorted.filter(event => event.eventType === 'exercise' || event.eventType === 'page_check').length,
    masteredItems: [...mastered.values()],
    reviewItems,
    laterReviewItems: [...laterReview.values()],
    days: [...dailyMap.values()].sort((a, b) => b.day.localeCompare(a.day)).slice(0, 7),
  };
}
