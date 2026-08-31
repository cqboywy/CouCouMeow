import { act, renderHook } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { LearningDataReadyProvider } from '../data/LearningDataProvider';
import type { LearningProgressRepository } from '../data/learningProgressRepository';
import { useSchoolProgress } from './useSchoolProgress';
import { ContentReadyProvider } from '../content/ContentProvider';
import { getTestLesson, testContentCatalog } from '../test/renderWithLearningData';

const createRepository = (): LearningProgressRepository => ({
  loadEvents: vi.fn(async () => []), appendEvents: vi.fn(async () => undefined),
  getSelectedTextbookId: vi.fn(async () => 'pep4a'), setSelectedTextbookId: vi.fn(async () => undefined),
  getImportReceipt: vi.fn(async () => null), saveImportReceipt: vi.fn(async () => undefined), findEventIds: vi.fn(async (_ids: string[]) => new Set<string>()),
});

describe('useSchoolProgress', () => {
  it('moves to the next lesson only after online completion is saved', async () => {
    const repository = createRepository();
    const wrapper = ({ children }: PropsWithChildren) => <ContentReadyProvider catalog={testContentCatalog}><LearningDataReadyProvider userId="user-1" repository={repository} initialEvents={[]} initialSelectedTextbookId="pep-grade4-upper">{children}</LearningDataReadyProvider></ContentReadyProvider>;
    const lesson = getTestLesson('pep4a-u1-l1')!;
    const { result } = renderHook(() => useSchoolProgress(), { wrapper });

    await act(async () => { await result.current.completeLesson(lesson); });

    expect(repository.appendEvents).toHaveBeenCalledTimes(1);
    expect(result.current.summary.completedLessonIds).toEqual(['pep4a-u1-l1']);
    expect(result.current.currentLesson?.id).toBe('pep4a-u1-l2');
  });
});
