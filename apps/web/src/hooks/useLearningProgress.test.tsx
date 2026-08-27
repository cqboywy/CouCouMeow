import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useLearningProgress } from './useLearningProgress';

const vocab = { id: 'vocab-park', word: 'park', meaning: '公园' };
let memory: Storage;

beforeEach(() => {
  const values = new Map<string, string>();
  memory = { get length() { return values.size; }, clear: () => values.clear(), getItem: key => values.get(key) ?? null, key: index => [...values.keys()][index] ?? null, removeItem: key => values.delete(key), setItem: (key, value) => values.set(key, value) };
});

describe('useLearningProgress', () => {
  it('updates today after a correct dictation result', () => {
    const { result } = renderHook(() => useLearningProgress({ storage: memory }));

    act(() => result.current.recordDictation(vocab, 'episode-1', true, 'written'));

    expect(result.current.summary.today.newWords[0]?.english).toBe('park');
  });

  it('records a confirmed pattern as a distinct daily item', () => {
    const { result } = renderHook(() => useLearningProgress({ storage: memory }));

    act(() => result.current.markPattern({ id: 'pattern-must', title: 'must + 动词原形', explanation: '表示必须做什么。' }, 'episode-1'));

    expect(result.current.summary.today.newPatterns[0]?.english).toBe('must + 动词原形');
  });
});
