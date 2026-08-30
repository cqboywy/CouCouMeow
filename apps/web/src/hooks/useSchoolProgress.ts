import { useMemo, useState } from 'react';
import { getLessonById, getUnitById, pepGrade4Upper } from '../curriculum/pepGrade4UpperUnit1';
import { getTextbookPageById } from '../curriculum/pepGrade4UpperTextbookPages';
import type { CurriculumLesson, SchoolExercise, SchoolLearningItem, TextbookFocusItem, TextbookPage, TextbookPageCheck } from '../curriculum/types';
import { useLearningData } from '../data/LearningDataProvider';
import type { SchoolLearningEvent, SchoolEventPayload } from '../progress/learningEvents';
import { deriveSchoolProgress } from '../progress/schoolProgressSummary';

const localDay = (date: Date) => new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
const lessonIdForPage = (pageId: string) => {
  const page = getTextbookPageById(pageId);
  return page ? getUnitById(page.unitId)?.lessons[0]?.id ?? pageId : '';
};

export function useSchoolProgress() {
  const data = useLearningData();
  const [storageError, setStorageError] = useState('');
  const schoolEvents = useMemo(() => data.events.filter((event): event is SchoolLearningEvent => event.track === 'school'), [data.events]);
  const summary = useMemo(() => deriveSchoolProgress(schoolEvents, data.selectedTextbookId), [schoolEvents, data.selectedTextbookId]);
  const createEvent = (eventType: SchoolLearningEvent['eventType'], payload: SchoolEventPayload): SchoolLearningEvent => {
    const date = new Date();
    return { id: crypto.randomUUID(), userId: data.userId, track: 'school', eventType, occurredAt: date.toISOString(), localDay: localDay(date), payload };
  };
  const persist = async (events: SchoolLearningEvent[]) => {
    try {
      await data.appendEvents(events);
      setStorageError('');
      return true;
    } catch {
      setStorageError('这次校内学习还没有保存到线上，请检查网络后重试。');
      return false;
    }
  };
  const location = (lessonId: string, pageId?: string) => ({
    textbookId: data.selectedTextbookId,
    unitId: getTextbookPageById(pageId ?? '')?.unitId ?? getLessonById(lessonId)?.unitId ?? pepGrade4Upper.currentUnitId,
    lessonId,
    ...(pageId ? { pageId } : {}),
  });

  return {
    summary,
    currentLesson: getLessonById(summary.currentLessonId),
    storageError,
    recordExercise: (lesson: CurriculumLesson, exercise: SchoolExercise, correct: boolean) => persist([createEvent('exercise', { ...location(lesson.id), exerciseId: exercise.id, item: exercise.item, correct })]),
    completeLesson: (lesson: CurriculumLesson) => {
      if (schoolEvents.some(event => event.eventType === 'lesson_completed' && event.payload.lessonId === lesson.id)) return Promise.resolve(true);
      const items = [...lesson.vocabulary, ...lesson.sentences, ...lesson.phonics];
      const masteredItems = [...new Map(items.map(item => [item.id, item])).values()];
      return persist([createEvent('lesson_completed', { ...location(lesson.id), masteredItems })]);
    },
    completePage: (page: TextbookPage) => {
      if (schoolEvents.some(event => event.eventType === 'page_completed' && event.payload.pageId === page.id)) return Promise.resolve(true);
      return persist([createEvent('page_completed', { ...location(lessonIdForPage(page.id), page.id), masteredItems: page.focusItems })]);
    },
    recordPageCheck: (page: TextbookPage, check: TextbookPageCheck, correct: boolean) => persist([createEvent('page_check', { ...location(lessonIdForPage(page.id), page.id), exerciseId: check.id, item: check.item, correct })]),
    addLaterReview: (page: TextbookPage, item: TextbookFocusItem) => persist([createEvent('later_review_added', { ...location(lessonIdForPage(page.id), page.id), item })]),
    resolveLaterReview: (page: TextbookPage, itemId: string) => persist([createEvent('later_review_resolved', { ...location(lessonIdForPage(page.id), page.id), item: { id: itemId, kind: 'word', english: '', chinese: '' } as SchoolLearningItem })]),
    selectTextbook: async (textbookId: string) => {
      try {
        await data.selectTextbook(textbookId);
        setStorageError('');
        return true;
      } catch {
        setStorageError('教材选择还没有保存到线上，请检查网络后重试。');
        return false;
      }
    },
  };
}
