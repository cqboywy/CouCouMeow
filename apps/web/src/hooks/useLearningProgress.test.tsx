import { act, renderHook } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { LearningDataReadyProvider } from '../data/LearningDataProvider';
import type { LearningProgressRepository } from '../data/learningProgressRepository';
import { useLearningProgress } from './useLearningProgress';

const vocab = { id: 'vocab-park', word: 'park', meaning: '公园' };
const createRepository = (): LearningProgressRepository => ({
  loadEvents: vi.fn(async () => []), appendEvents: vi.fn(async () => undefined),
  getSelectedTextbookId: vi.fn(async () => 'pep4a'), setSelectedTextbookId: vi.fn(async () => undefined),
  getImportReceipt: vi.fn(async () => null), saveImportReceipt: vi.fn(async () => undefined), findEventIds: vi.fn(async () => new Set()),
});

describe('useLearningProgress', () => {
  it('persists a correct dictation before updating today', async () => {
    const repository = createRepository();
    const wrapper = ({ children }: PropsWithChildren) => <LearningDataReadyProvider userId="user-1" repository={repository} initialEvents={[]} initialSelectedTextbookId="pep4a">{children}</LearningDataReadyProvider>;
    const { result } = renderHook(() => useLearningProgress(), { wrapper });

    await act(async () => { await result.current.recordDictation(vocab, 'episode-1', true, 'written'); });

    expect(repository.appendEvents).toHaveBeenCalledTimes(1);
    expect(result.current.summary.today.newWords[0]?.english).toBe('park');
  });

  it('keeps the prior summary when an online write fails', async () => {
    const repository = createRepository();
    vi.mocked(repository.appendEvents).mockRejectedValue(new Error('offline'));
    const wrapper = ({ children }: PropsWithChildren) => <LearningDataReadyProvider userId="user-1" repository={repository} initialEvents={[]} initialSelectedTextbookId="pep4a">{children}</LearningDataReadyProvider>;
    const { result } = renderHook(() => useLearningProgress(), { wrapper });

    await act(async () => { await result.current.markPattern({ id: 'pattern-must', title: 'must + 动词原形', explanation: '表示必须做什么。' }, 'episode-1'); });

    expect(result.current.summary.today.newPatterns).toEqual([]);
    expect(result.current.storageError).toContain('线上成长记录');
  });
});
