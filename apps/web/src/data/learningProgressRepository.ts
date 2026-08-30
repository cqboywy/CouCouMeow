import type { LearningEvent } from '../progress/learningEvents';

export type LegacySourceKey = 'coucoumeow.learning-progress.v1' | 'coucoumeow.school-progress.v1';
export type ImportReceipt = {
  sourceKey: LegacySourceKey;
  sourceVersion: number;
  eventCount: number;
  importedAt: string;
};

export type LearningProgressRepository = {
  loadEvents(): Promise<LearningEvent[]>;
  appendEvents(events: LearningEvent[]): Promise<void>;
  getSelectedTextbookId(): Promise<string | null>;
  setSelectedTextbookId(textbookId: string): Promise<void>;
  getImportReceipt(sourceKey: LegacySourceKey): Promise<ImportReceipt | null>;
  saveImportReceipt(receipt: Omit<ImportReceipt, 'importedAt'>): Promise<void>;
  findEventIds(ids: string[]): Promise<Set<string>>;
};
