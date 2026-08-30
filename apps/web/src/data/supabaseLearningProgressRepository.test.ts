import { describe, expect, it, vi } from 'vitest';
import type { LearningEventRow, LearningProgressGateway } from './supabaseLearningProgressRepository';
import { createSupabaseLearningProgressRepository } from './supabaseLearningProgressRepository';

const row = (index: number): LearningEventRow => ({
  id: `00000000-0000-0000-0000-${String(index).padStart(12, '0')}`,
  user_id: 'user-1',
  track: 'extra',
  event_type: 'mastered',
  occurred_at: '2026-08-30T09:00:00.000Z',
  local_day: '2026-08-30',
  payload: { item: { id: `word-${index}`, kind: 'word', english: 'cat', chinese: '猫', episodeId: 'episode-1' } },
});

const gateway = (overrides: Partial<LearningProgressGateway> = {}): LearningProgressGateway => ({
  listEvents: vi.fn().mockResolvedValue([]),
  upsertEvents: vi.fn().mockResolvedValue(undefined),
  getSelectedTextbookId: vi.fn().mockResolvedValue(null),
  upsertSelectedTextbookId: vi.fn().mockResolvedValue(undefined),
  getImportReceipt: vi.fn().mockResolvedValue(null),
  upsertImportReceipt: vi.fn().mockResolvedValue(undefined),
  findEventIds: vi.fn().mockResolvedValue([]),
  ...overrides,
});

describe('createSupabaseLearningProgressRepository', () => {
  it('paginates event reads and maps database names to domain names', async () => {
    const firstPage = Array.from({ length: 500 }, (_, index) => row(index));
    const store = gateway({ listEvents: vi.fn().mockResolvedValueOnce(firstPage).mockResolvedValueOnce([row(500)]) });
    const repository = createSupabaseLearningProgressRepository(store, 'user-1');

    const events = await repository.loadEvents();

    expect(store.listEvents).toHaveBeenNthCalledWith(1, 'user-1', 0, 499);
    expect(store.listEvents).toHaveBeenNthCalledWith(2, 'user-1', 500, 999);
    expect(events).toHaveLength(501);
    expect(events[0]).toMatchObject({ userId: 'user-1', eventType: 'mastered', localDay: '2026-08-30' });
  });

  it('writes owner-scoped event rows and returns verified IDs', async () => {
    const store = gateway({ findEventIds: vi.fn().mockResolvedValue(['00000000-0000-0000-0000-000000000001']) });
    const repository = createSupabaseLearningProgressRepository(store, 'user-1');
    const event = {
      id: '00000000-0000-0000-0000-000000000001', userId: 'ignored', track: 'extra' as const,
      eventType: 'mastered' as const, occurredAt: '2026-08-30T09:00:00.000Z', localDay: '2026-08-30',
      payload: { item: { id: 'word-1', kind: 'word' as const, english: 'cat', chinese: '猫', episodeId: 'episode-1' } },
    };

    await repository.appendEvents([event]);

    expect(store.upsertEvents).toHaveBeenCalledWith([expect.objectContaining({ user_id: 'user-1', event_type: 'mastered' })]);
    await expect(repository.findEventIds([event.id])).resolves.toEqual(new Set([event.id]));
  });

  it('reads and writes preferences and import receipts for the authenticated owner', async () => {
    const store = gateway({
      getSelectedTextbookId: vi.fn().mockResolvedValue('pep4a'),
      getImportReceipt: vi.fn().mockResolvedValue({ source_key: 'coucoumeow.learning-progress.v1', source_version: 1, event_count: 3, imported_at: '2026-08-30T10:00:00Z' }),
    });
    const repository = createSupabaseLearningProgressRepository(store, 'user-1');

    await expect(repository.getSelectedTextbookId()).resolves.toBe('pep4a');
    await repository.setSelectedTextbookId('pep4b');
    await expect(repository.getImportReceipt('coucoumeow.learning-progress.v1')).resolves.toMatchObject({ eventCount: 3 });

    expect(store.upsertSelectedTextbookId).toHaveBeenCalledWith('user-1', 'pep4b');
  });
});
