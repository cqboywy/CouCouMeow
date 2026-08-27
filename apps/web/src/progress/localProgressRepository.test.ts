import { beforeEach, describe, expect, it } from 'vitest';
import { createLocalProgressRepository, PROGRESS_STORAGE_KEY } from './localProgressRepository';

const word = { id: 'vocab-park', kind: 'word' as const, english: 'park', chinese: '公园', episodeId: 'episode-1' };
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

describe('local progress repository', () => {
  it('keeps a second correct word answer as practice, not a new word', () => {
    const repo = createLocalProgressRepository(memory, () => new Date('2026-08-27T09:00:00'));

    repo.recordPractice(word, true, 'written');
    repo.recordPractice(word, true, 'written');

    expect(repo.getSummary().today.newWords).toHaveLength(1);
    expect(repo.getSummary().today.practiceCount).toBe(2);
    expect(repo.getSummary().items.words[0]).toMatchObject({ correctCount: 2, totalPracticeCount: 2 });
  });

  it('returns an empty record when stored JSON is invalid', () => {
    memory.setItem(PROGRESS_STORAGE_KEY, '{bad-json');

    expect(createLocalProgressRepository(memory, () => new Date('2026-08-27T09:00:00')).getSummary().today.practiceCount).toBe(0);
  });
});
