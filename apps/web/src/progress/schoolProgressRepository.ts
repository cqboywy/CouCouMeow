import { getLessonById, pepGrade4Upper } from '../curriculum/pepGrade4UpperUnit1';
import type { SchoolLearningItem } from '../curriculum/types';

export const SCHOOL_PROGRESS_STORAGE_KEY = 'coucoumeow.school-progress.v1';
const VERSION = 1;

type SchoolEvent = {
  id: string;
  occurredAt: string;
  day: string;
  type: 'exercise' | 'lesson_completed';
  textbookId: string;
  unitId: string;
  lessonId: string;
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
  practiceCount: number;
  masteredItems: SchoolMasteryItem[];
  reviewItems: SchoolReviewItem[];
  days: SchoolDailySummary[];
};

export type SchoolExerciseResult = {
  lessonId: string;
  exerciseId: string;
  item?: SchoolLearningItem;
  correct: boolean;
};

const orderedLessonIds = pepGrade4Upper.units.flatMap(unit => unit.lessons).map(lesson => lesson.id);
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
      unitId: getLessonById(event.lessonId)?.unitId ?? pepGrade4Upper.currentUnitId,
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
  const selectTextbook = (textbookId: string) => {
    const record = read();
    record.selectedTextbookId = textbookId;
    write(record);
  };
  const getSummary = (): SchoolProgressSummary => {
    const record = read();
    const completedLessonIds = [...new Set(record.events.filter(event => event.type === 'lesson_completed').map(event => event.lessonId))];
    const mastered = new Map<string, SchoolMasteryItem>();
    for (const event of record.events) {
      if (event.type === 'lesson_completed') {
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
      if (event.type === 'exercise' && event.item) latestPractice.set(event.item.id, event);
    }
    const reviewItems = [...latestPractice.values()]
      .filter(event => event.correct === false && event.item && event.exerciseId)
      .map(event => ({ ...event.item!, source: 'school' as const, lessonId: event.lessonId, exerciseId: event.exerciseId! }));
    const dailyMap = new Map<string, SchoolDailySummary>();
    for (const event of record.events) {
      const daily = dailyMap.get(event.day) ?? { day: event.day, practiceCount: 0, completedLessonCount: 0 };
      if (event.type === 'exercise') daily.practiceCount += 1;
      if (event.type === 'lesson_completed') daily.completedLessonCount += 1;
      dailyMap.set(event.day, daily);
    }
    const currentLessonId = orderedLessonIds.find(id => !completedLessonIds.includes(id)) ?? orderedLessonIds.at(-1)!;
    return {
      textbookId: record.selectedTextbookId,
      unitId: getLessonById(currentLessonId)?.unitId ?? pepGrade4Upper.currentUnitId,
      completedLessonIds,
      currentLessonId,
      practiceCount: record.events.filter(event => event.type === 'exercise').length,
      masteredItems: [...mastered.values()],
      reviewItems,
      days: [...dailyMap.values()].sort((a, b) => b.day.localeCompare(a.day)).slice(0, 7),
    };
  };
  return { getSummary, recordExercise, completeLesson, selectTextbook };
}
