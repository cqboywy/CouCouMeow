import { beforeEach, describe, expect, it } from 'vitest';
import type { SchoolLearningItem } from '../curriculum/types';
import { PROGRESS_STORAGE_KEY } from './localProgressRepository';
import { createSchoolProgressRepository, SCHOOL_PROGRESS_STORAGE_KEY } from './schoolProgressRepository';

const schoolWord: SchoolLearningItem = {
  id: 'pep4a-u1-doctor',
  kind: 'word',
  english: 'doctor',
  chinese: '医生',
};

let memory: Storage;

beforeEach(() => {
  const values = new Map<string, string>();
  memory = {
    get length() { return values.size; },
    clear: () => values.clear(),
    getItem: key => values.get(key) ?? null,
    key: index => [...values.keys()][index] ?? null,
    removeItem: key => values.delete(key),
    setItem: (key, value) => values.set(key, value),
  };
});

describe('school progress repository', () => {
  it('stores completed lessons and school review items without touching animation progress', () => {
    const repo = createSchoolProgressRepository(memory, () => new Date('2026-08-27T09:00:00'));

    repo.recordExercise({ lessonId: 'pep4a-u1-l1', exerciseId: 'pep4a-u1-l1-e1', item: schoolWord, correct: false });
    repo.completeLesson('pep4a-u1-l1', [schoolWord]);

    expect(repo.getSummary().completedLessonIds).toEqual(['pep4a-u1-l1']);
    expect(repo.getSummary().currentLessonId).toBe('pep4a-u1-l2');
    expect(repo.getSummary().reviewItems).toEqual([
      expect.objectContaining({ id: schoolWord.id, lessonId: 'pep4a-u1-l1', source: 'school' }),
    ]);
    expect(memory.getItem(SCHOOL_PROGRESS_STORAGE_KEY)).not.toBeNull();
    expect(memory.getItem(PROGRESS_STORAGE_KEY)).toBeNull();
  });

  it('does not duplicate lesson completion or mastered school content', () => {
    const repo = createSchoolProgressRepository(memory, () => new Date('2026-08-27T09:00:00'));

    repo.completeLesson('pep4a-u1-l1', [schoolWord]);
    repo.completeLesson('pep4a-u1-l1', [schoolWord]);

    expect(repo.getSummary().completedLessonIds).toEqual(['pep4a-u1-l1']);
    expect(repo.getSummary().masteredItems).toEqual([
      expect.objectContaining({ id: schoolWord.id, firstLearnedDay: '2026-08-27' }),
    ]);
  });

  it('stores page completion and later review without touching animation progress', () => {
    const repo = createSchoolProgressRepository(memory, () => new Date('2026-08-27T09:00:00'));

    repo.addLaterReview('pep4a-u1-p3', schoolWord);
    repo.completePage('pep4a-u1-p3', [schoolWord]);

    expect(repo.getSummary()).toMatchObject({
      completedPageIds: ['pep4a-u1-p3'],
      currentPageId: 'pep4a-u1-p4',
      laterReviewItems: [expect.objectContaining({ id: schoolWord.id, pageId: 'pep4a-u1-p3', source: 'school' })],
    });
    expect(memory.getItem(PROGRESS_STORAGE_KEY)).toBeNull();
  });

  it('recovers from damaged school progress data', () => {
    memory.setItem(SCHOOL_PROGRESS_STORAGE_KEY, '{bad-json');

    const summary = createSchoolProgressRepository(memory, () => new Date('2026-08-27T09:00:00')).getSummary();

    expect(summary.completedLessonIds).toEqual([]);
    expect(summary.currentLessonId).toBe('pep4a-u1-l1');
    expect(summary.practiceCount).toBe(0);
  });
});
