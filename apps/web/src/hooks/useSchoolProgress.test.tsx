import { act, renderHook } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { getLessonById } from '../curriculum/pepGrade4UpperUnit1';
import { LearningDataReadyProvider } from '../data/LearningDataProvider';
import type { LearningProgressRepository } from '../data/learningProgressRepository';
import { useSchoolProgress } from './useSchoolProgress';

const createRepository = (): LearningProgressRepository => ({
  loadEvents: vi.fn(async () => []), appendEvents: vi.fn(async () => undefined),
  getSelectedTextbookId: vi.fn(async () => 'pep4a'), setSelectedTextbookId: vi.fn(async () => undefined),
  getImportReceipt: vi.fn(async () => null), saveImportReceipt: vi.fn(async () => undefined), findEventIds: vi.fn(async () => new Set()),
});

describe('useSchoolProgress', () => {
  it('moves to the next lesson only after online completion is saved', async () => {
    const repository = createRepository();
    const wrapper = ({ children }: PropsWithChildren) => <LearningDataReadyProvider userId="user-1" repository={repository} initialEvents={[]} initialSelectedTextbookId="pep4a">{children}</LearningDataReadyProvider>;
    const lesson = getLessonById('pep4a-u1-l1')!;
    const { result } = renderHook(() => useSchoolProgress(), { wrapper });

    await act(async () => { await result.current.completeLesson(lesson); });

    expect(repository.appendEvents).toHaveBeenCalledTimes(1);
    expect(result.current.summary.completedLessonIds).toEqual(['pep4a-u1-l1']);
    expect(result.current.currentLesson?.id).toBe('pep4a-u1-l2');
  });
});
