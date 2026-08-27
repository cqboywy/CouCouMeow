import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { getLessonById } from '../curriculum/pepGrade4UpperUnit1';
import { useSchoolProgress } from './useSchoolProgress';

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

describe('useSchoolProgress', () => {
  it('moves to the next lesson after the current school lesson is completed', () => {
    const lesson = getLessonById('pep4a-u1-l1')!;
    const { result } = renderHook(() => useSchoolProgress({ storage: memory }));

    act(() => result.current.completeLesson(lesson));

    expect(result.current.summary.completedLessonIds).toEqual(['pep4a-u1-l1']);
    expect(result.current.currentLesson?.id).toBe('pep4a-u1-l2');
  });
});
