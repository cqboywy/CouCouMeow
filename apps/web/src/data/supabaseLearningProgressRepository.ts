import type { LearningEvent, LearningEventType, LearningTrack } from '../progress/learningEvents';
import type { ImportReceipt, LearningProgressRepository, LegacySourceKey } from './learningProgressRepository';

export type LearningEventRow = {
  id: string;
  user_id: string;
  track: LearningTrack;
  event_type: LearningEventType;
  occurred_at: string;
  local_day: string;
  payload: LearningEvent['payload'];
};

export type ImportReceiptRow = {
  source_key: LegacySourceKey;
  source_version: number;
  event_count: number;
  imported_at: string;
};

export type LearningProgressGateway = {
  listEvents(userId: string, from: number, to: number): Promise<LearningEventRow[]>;
  upsertEvents(rows: LearningEventRow[]): Promise<void>;
  getSelectedTextbookId(userId: string): Promise<string | null>;
  upsertSelectedTextbookId(userId: string, textbookId: string): Promise<void>;
  getImportReceipt(userId: string, sourceKey: LegacySourceKey): Promise<ImportReceiptRow | null>;
  upsertImportReceipt(userId: string, receipt: Omit<ImportReceipt, 'importedAt'>): Promise<void>;
  findEventIds(userId: string, ids: string[]): Promise<string[]>;
};

const PAGE_SIZE = 500;

const fromRow = (row: LearningEventRow): LearningEvent => ({
  id: row.id,
  userId: row.user_id,
  track: row.track,
  eventType: row.event_type,
  occurredAt: row.occurred_at,
  localDay: row.local_day,
  payload: row.payload,
} as LearningEvent);

const toRow = (event: LearningEvent, userId: string): LearningEventRow => ({
  id: event.id,
  user_id: userId,
  track: event.track,
  event_type: event.eventType,
  occurred_at: event.occurredAt,
  local_day: event.localDay,
  payload: event.payload,
});

export function createSupabaseLearningProgressRepository(
  gateway: LearningProgressGateway,
  userId: string,
): LearningProgressRepository {
  return {
    async loadEvents() {
      const events: LearningEvent[] = [];
      for (let from = 0; ; from += PAGE_SIZE) {
        const rows = await gateway.listEvents(userId, from, from + PAGE_SIZE - 1);
        events.push(...rows.map(fromRow));
        if (rows.length < PAGE_SIZE) return events;
      }
    },
    async appendEvents(events) {
      if (events.length) await gateway.upsertEvents(events.map(event => toRow(event, userId)));
    },
    getSelectedTextbookId: () => gateway.getSelectedTextbookId(userId),
    setSelectedTextbookId: textbookId => gateway.upsertSelectedTextbookId(userId, textbookId),
    async getImportReceipt(sourceKey) {
      const row = await gateway.getImportReceipt(userId, sourceKey);
      return row ? {
        sourceKey: row.source_key,
        sourceVersion: row.source_version,
        eventCount: row.event_count,
        importedAt: row.imported_at,
      } : null;
    },
    saveImportReceipt: receipt => gateway.upsertImportReceipt(userId, receipt),
    async findEventIds(ids) {
      if (!ids.length) return new Set();
      return new Set(await gateway.findEventIds(userId, ids));
    },
  };
}
