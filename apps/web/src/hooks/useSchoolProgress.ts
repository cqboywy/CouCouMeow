import { useRef, useState } from 'react';
import { getLessonById } from '../curriculum/pepGrade4UpperUnit1';
import type { CurriculumLesson, SchoolExercise } from '../curriculum/types';
import { createSchoolProgressRepository } from '../progress/schoolProgressRepository';

type Options = { storage?: Storage };

export function useSchoolProgress({ storage = window.localStorage }: Options = {}) {
  const repository = useRef(createSchoolProgressRepository(storage, () => new Date()));
  const [summary, setSummary] = useState(() => repository.current.getSummary());
  const [storageError, setStorageError] = useState('');
  const update = (action: () => void) => {
    try {
      action();
      setSummary(repository.current.getSummary());
      setStorageError('');
    } catch {
      setStorageError('这次校内学习还没有保存，请检查浏览器存储空间后再试。');
    }
  };
  return {
    summary,
    currentLesson: getLessonById(summary.currentLessonId),
    storageError,
    recordExercise: (lesson: CurriculumLesson, exercise: SchoolExercise, correct: boolean) => update(() => repository.current.recordExercise({
      lessonId: lesson.id,
      exerciseId: exercise.id,
      item: exercise.item,
      correct,
    })),
    completeLesson: (lesson: CurriculumLesson) => update(() => {
      const items = [...lesson.vocabulary, ...lesson.sentences, ...lesson.phonics];
      repository.current.completeLesson(lesson.id, [...new Map(items.map(item => [item.id, item])).values()]);
    }),
    selectTextbook: (textbookId: string) => update(() => repository.current.selectTextbook(textbookId)),
  };
}
