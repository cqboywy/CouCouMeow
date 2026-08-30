import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { LearningProgressRepository, ImportReceipt, LegacySourceKey } from './learningProgressRepository';
import { LegacyProgressImportError, importLegacyProgress } from './legacyProgressImport';
import type { LearningEvent } from '../progress/learningEvents';

const EXTRA_KEY: LegacySourceKey = 'coucoumeow.learning-progress.v1';
const SCHOOL_KEY: LegacySourceKey = 'coucoumeow.school-progress.v1';
let storage: Storage;

const createRepository = () => {
  const events = new Map<string, LearningEvent>();
  const receipts = new Map<LegacySourceKey, ImportReceipt>();
  const repository: LearningProgressRepository = {
    loadEvents: vi.fn(async () => [...events.values()]),
    appendEvents: vi.fn(async batch => batch.forEach(event => events.set(event.id, event))),
    getSelectedTextbookId: vi.fn(async () => null),
    setSelectedTextbookId: vi.fn(async () => undefined),
    getImportReceipt: vi.fn(async key => receipts.get(key) ?? null),
    saveImportReceipt: vi.fn(async receipt => receipts.set(receipt.sourceKey, { ...receipt, importedAt: '2026-08-30T10:00:00Z' })),
    findEventIds: vi.fn(async ids => new Set(ids.filter(id => events.has(id)))),
  };
  return { repository, events, receipts };
};

beforeEach(() => {
  const values = new Map<string, string>();
  storage = {
    get length() { return values.size; },
    clear: vi.fn(() => values.clear()),
    getItem: vi.fn(key => values.get(key) ?? null),
    key: vi.fn(index => [...values.keys()][index] ?? null),
    removeItem: vi.fn(key => values.delete(key)),
    setItem: vi.fn((key, value) => values.set(key, value)),
  };
});

describe('importLegacyProgress', () => {
  it('imports both v1 stores with original event IDs and the selected textbook', async () => {
    storage.setItem(EXTRA_KEY, JSON.stringify({ version: 1, events: [{
      id: '00000000-0000-4000-8000-000000000001', occurredAt: '2026-08-29T09:00:00.000Z', day: '2026-08-29', type: 'practice_completed',
      item: { id: 'word-1', kind: 'word', english: 'cat', chinese: '猫', episodeId: 'episode-1' }, correct: true, method: 'written',
    }] }));
    storage.setItem(SCHOOL_KEY, JSON.stringify({ version: 1, selectedTextbookId: 'pep4a', events: [{
      id: '00000000-0000-4000-8000-000000000002', occurredAt: '2026-08-30T09:00:00.000Z', day: '2026-08-30', type: 'page_completed',
      textbookId: 'pep4a', unitId: 'pep4a-u1', lessonId: 'pep4a-u1-l1', pageId: 'pep4a-u1-p2', masteredItems: [],
    }] }));
    const { repository, events, receipts } = createRepository();

    await expect(importLegacyProgress(storage, repository, 'user-1')).resolves.toEqual({ importedEventCount: 2, skippedSourceCount: 0 });

    expect(events.get('00000000-0000-4000-8000-000000000001')).toMatchObject({ userId: 'user-1', track: 'extra', eventType: 'practice_completed' });
    expect(events.get('00000000-0000-4000-8000-000000000002')).toMatchObject({ track: 'school', payload: { pageId: 'pep4a-u1-p2' } });
    expect(repository.setSelectedTextbookId).toHaveBeenCalledWith('pep4a');
    expect(receipts.get(EXTRA_KEY)?.eventCount).toBe(1);
    expect(receipts.get(SCHOOL_KEY)?.eventCount).toBe(1);
    expect(storage.removeItem).not.toHaveBeenCalled();
  });

  it('records empty sources and skips sources that already have receipts', async () => {
    const { repository, receipts } = createRepository();
    receipts.set(EXTRA_KEY, { sourceKey: EXTRA_KEY, sourceVersion: 1, eventCount: 4, importedAt: '2026-08-29T10:00:00Z' });

    await expect(importLegacyProgress(storage, repository, 'user-1')).resolves.toEqual({ importedEventCount: 0, skippedSourceCount: 1 });

    expect(receipts.get(SCHOOL_KEY)?.eventCount).toBe(0);
    expect(repository.appendEvents).not.toHaveBeenCalled();
  });

  it('does not write a receipt until every uploaded event is visible remotely', async () => {
    storage.setItem(EXTRA_KEY, JSON.stringify({ version: 1, events: [{
      id: '00000000-0000-4000-8000-000000000003', occurredAt: '2026-08-30T09:00:00.000Z', day: '2026-08-30', type: 'mastered',
      item: { id: 'episode-1', kind: 'episode', english: 'Story', chinese: '故事', episodeId: 'episode-1' },
    }] }));
    const { repository } = createRepository();
    vi.mocked(repository.findEventIds).mockResolvedValue(new Set());

    await expect(importLegacyProgress(storage, repository, 'user-1')).rejects.toThrow('云端校验未通过');
    expect(repository.saveImportReceipt).not.toHaveBeenCalledWith(expect.objectContaining({ sourceKey: EXTRA_KEY }));
  });

  it('blocks startup for corrupt legacy JSON without treating it as empty', async () => {
    storage.setItem(EXTRA_KEY, '{broken-json');
    const { repository } = createRepository();

    await expect(importLegacyProgress(storage, repository, 'user-1')).rejects.toBeInstanceOf(LegacyProgressImportError);
    expect(repository.saveImportReceipt).not.toHaveBeenCalled();
    expect(storage.removeItem).not.toHaveBeenCalled();
  });
});
