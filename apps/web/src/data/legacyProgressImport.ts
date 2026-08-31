import type { LearningEvent, LearningItem, SchoolEventPayload } from '../progress/learningEvents';
import type { SchoolLearningItem } from '../content/types';
import type { LearningProgressRepository, LegacySourceKey } from './learningProgressRepository';

const EXTRA_KEY: LegacySourceKey = 'coucoumeow.learning-progress.v1';
const SCHOOL_KEY: LegacySourceKey = 'coucoumeow.school-progress.v1';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DAY = /^\d{4}-\d{2}-\d{2}$/;
const EXTRA_TYPES = new Set(['practice_completed', 'mastered']);
const SCHOOL_TYPES = new Set(['exercise', 'lesson_completed', 'page_completed', 'page_check', 'later_review_added', 'later_review_resolved']);

export class LegacyProgressImportError extends Error {
  constructor(message = '旧的学习记录无法安全读取，请保留当前浏览器数据并重试。') {
    super(message);
    this.name = 'LegacyProgressImportError';
  }
}

type ParsedSource = {
  key: LegacySourceKey;
  version: number;
  events: LearningEvent[];
  selectedTextbookId?: string;
};

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const isString = (value: unknown): value is string => typeof value === 'string' && value.length > 0;
const isTimestamp = (value: unknown): value is string => isString(value) && !Number.isNaN(Date.parse(value));

const readItem = (value: unknown, school = false): LearningItem | SchoolLearningItem => {
  if (!isObject(value) || !isString(value.id) || !isString(value.kind) || !isString(value.english) || typeof value.chinese !== 'string') {
    throw new LegacyProgressImportError();
  }
  if (!['word', 'sentence', 'pattern', 'episode', 'phonics'].includes(value.kind)) throw new LegacyProgressImportError();
  if (school) return { id: value.id, kind: value.kind as SchoolLearningItem['kind'], english: value.english, chinese: value.chinese };
  if (!isString(value.episodeId) || !['word', 'sentence', 'pattern', 'episode'].includes(value.kind)) throw new LegacyProgressImportError();
  return { id: value.id, kind: value.kind as LearningItem['kind'], english: value.english, chinese: value.chinese, episodeId: value.episodeId };
};

const readBase = (value: unknown) => {
  if (!isObject(value) || !isString(value.id) || !UUID.test(value.id) || !isTimestamp(value.occurredAt) || !isString(value.day) || !DAY.test(value.day) || !isString(value.type)) {
    throw new LegacyProgressImportError();
  }
  return value;
};

const readExtra = (storage: Storage, userId: string): ParsedSource => {
  const raw = storage.getItem(EXTRA_KEY);
  if (raw === null) return { key: EXTRA_KEY, version: 1, events: [] };
  let root: unknown;
  try { root = JSON.parse(raw); } catch { throw new LegacyProgressImportError(); }
  if (!isObject(root) || root.version !== 1 || !Array.isArray(root.events)) throw new LegacyProgressImportError();
  const events = root.events.map(value => {
    const old = readBase(value);
    if (!EXTRA_TYPES.has(old.type as string)) throw new LegacyProgressImportError();
    const item = readItem(old.item) as LearningItem;
    if (old.correct !== undefined && typeof old.correct !== 'boolean') throw new LegacyProgressImportError();
    if (old.method !== undefined && !['written', 'spoken', 'sentence_reading'].includes(old.method as string)) throw new LegacyProgressImportError();
    return {
      id: old.id,
      userId,
      track: 'extra',
      eventType: old.type,
      occurredAt: old.occurredAt,
      localDay: old.day,
      payload: { item, correct: old.correct, method: old.method },
    } as LearningEvent;
  });
  return { key: EXTRA_KEY, version: 1, events };
};

const readSchool = (storage: Storage, userId: string): ParsedSource => {
  const raw = storage.getItem(SCHOOL_KEY);
  if (raw === null) return { key: SCHOOL_KEY, version: 1, events: [] };
  let root: unknown;
  try { root = JSON.parse(raw); } catch { throw new LegacyProgressImportError(); }
  if (!isObject(root) || root.version !== 1 || !Array.isArray(root.events) || !isString(root.selectedTextbookId)) throw new LegacyProgressImportError();
  const events = root.events.map(value => {
    const old = readBase(value);
    if (!SCHOOL_TYPES.has(old.type as string) || !isString(old.textbookId) || !isString(old.unitId) || !isString(old.lessonId)) {
      throw new LegacyProgressImportError();
    }
    if (old.correct !== undefined && typeof old.correct !== 'boolean') throw new LegacyProgressImportError();
    const payload: SchoolEventPayload = {
      textbookId: old.textbookId,
      unitId: old.unitId,
      lessonId: old.lessonId,
    };
    for (const key of ['pageId', 'exerciseId'] as const) {
      if (old[key] !== undefined && !isString(old[key])) throw new LegacyProgressImportError();
      if (isString(old[key])) payload[key] = old[key];
    }
    if (old.correct !== undefined) payload.correct = old.correct;
    if (old.item !== undefined) payload.item = readItem(old.item, true) as SchoolLearningItem;
    if (old.masteredItems !== undefined) {
      if (!Array.isArray(old.masteredItems)) throw new LegacyProgressImportError();
      payload.masteredItems = old.masteredItems.map(item => readItem(item, true) as SchoolLearningItem);
    }
    return {
      id: old.id,
      userId,
      track: 'school',
      eventType: old.type,
      occurredAt: old.occurredAt,
      localDay: old.day,
      payload,
    } as LearningEvent;
  });
  return { key: SCHOOL_KEY, version: 1, events, selectedTextbookId: root.selectedTextbookId };
};

const chunks = <T>(values: T[], size: number): T[][] => {
  const result: T[][] = [];
  for (let index = 0; index < values.length; index += size) result.push(values.slice(index, index + size));
  return result;
};

export type LegacyImportResult = { importedEventCount: number; skippedSourceCount: number };

export async function importLegacyProgress(
  storage: Storage,
  repository: LearningProgressRepository,
  userId: string,
): Promise<LegacyImportResult> {
  const sources = [readExtra(storage, userId), readSchool(storage, userId)];
  let importedEventCount = 0;
  let skippedSourceCount = 0;

  for (const source of sources) {
    if (await repository.getImportReceipt(source.key)) {
      skippedSourceCount += 1;
      continue;
    }
    for (const batch of chunks(source.events, 100)) await repository.appendEvents(batch);
    const verified = new Set<string>();
    for (const ids of chunks(source.events.map(event => event.id), 100)) {
      for (const id of await repository.findEventIds(ids)) verified.add(id);
    }
    if (verified.size !== source.events.length || source.events.some(event => !verified.has(event.id))) {
      throw new LegacyProgressImportError('旧学习记录已经上传，但云端校验未通过，请重试。');
    }
    if (source.selectedTextbookId) await repository.setSelectedTextbookId(source.selectedTextbookId);
    await repository.saveImportReceipt({ sourceKey: source.key, sourceVersion: source.version, eventCount: source.events.length });
    importedEventCount += source.events.length;
  }

  return { importedEventCount, skippedSourceCount };
}
