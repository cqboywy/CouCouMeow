export type MasteryKind = 'word' | 'sentence' | 'pattern' | 'episode';
export type PracticeMethod = 'written' | 'spoken' | 'sentence_reading';

export type LearningItem = {
  id: string;
  kind: MasteryKind;
  english: string;
  chinese: string;
  episodeId: string;
};

type LearningEvent = {
  id: string;
  occurredAt: string;
  day: string;
  type: 'practice_completed' | 'mastered';
  item: LearningItem;
  correct?: boolean;
  method?: PracticeMethod;
};

export type MasteryItem = LearningItem & {
  firstLearnedDay: string;
  latestPracticeDay: string;
  correctCount: number;
  totalPracticeCount: number;
};

export type DailySummary = {
  day: string;
  practiceCount: number;
  newWords: MasteryItem[];
  newSentences: MasteryItem[];
  newPatterns: MasteryItem[];
  newEpisodes: MasteryItem[];
};

export type GrowthSummary = {
  today: DailySummary;
  days: DailySummary[];
  items: Record<'words' | 'sentences' | 'patterns' | 'episodes', MasteryItem[]>;
};

export const PROGRESS_STORAGE_KEY = 'coucoumeow.learning-progress.v1';
const VERSION = 1;

type StoredRecord = { version: number; events: LearningEvent[] };

const dayKey = (date: Date) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
};

const emptyDaily = (day: string): DailySummary => ({ day, practiceCount: 0, newWords: [], newSentences: [], newPatterns: [], newEpisodes: [] });

export function createLocalProgressRepository(storage: Storage, now: () => Date) {
  const read = (): StoredRecord => {
    try {
      const raw = storage.getItem(PROGRESS_STORAGE_KEY);
      if (!raw) return { version: VERSION, events: [] };
      const parsed = JSON.parse(raw) as StoredRecord;
      if (parsed.version !== VERSION || !Array.isArray(parsed.events)) return { version: VERSION, events: [] };
      return parsed;
    } catch {
      return { version: VERSION, events: [] };
    }
  };
  const write = (record: StoredRecord) => storage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(record));
  const add = (type: LearningEvent['type'], item: LearningItem, correct?: boolean, method?: PracticeMethod) => {
    const date = now();
    const record = read();
    record.events.push({ id: crypto.randomUUID(), occurredAt: date.toISOString(), day: dayKey(date), type, item, correct, method });
    write(record);
  };
  const hasMastery = (item: LearningItem) => read().events.some(event => event.type === 'mastered' && event.item.id === item.id);
  const recordPractice = (item: LearningItem, correct: boolean, method: PracticeMethod) => {
    add('practice_completed', item, correct, method);
    if (correct && !hasMastery(item)) add('mastered', item);
  };
  const markMastered = (item: LearningItem) => {
    add('practice_completed', item, true);
    if (!hasMastery(item)) add('mastered', item);
  };
  const getSummary = (): GrowthSummary => {
    const record = read();
    const today = emptyDaily(dayKey(now()));
    const masteries = new Map<string, MasteryItem>();
    for (const event of record.events) {
      if (event.type === 'mastered' && !masteries.has(event.item.id)) {
        masteries.set(event.item.id, { ...event.item, firstLearnedDay: event.day, latestPracticeDay: event.day, correctCount: 0, totalPracticeCount: 0 });
      }
    }
    for (const event of record.events) {
      if (event.type === 'practice_completed' && event.day === today.day) today.practiceCount += 1;
      const mastery = masteries.get(event.item.id);
      if (mastery && event.type === 'practice_completed') {
        mastery.totalPracticeCount += 1;
        mastery.correctCount += event.correct ? 1 : 0;
        mastery.latestPracticeDay = event.day;
      }
    }
    for (const mastery of masteries.values()) {
      if (mastery.firstLearnedDay !== today.day) continue;
      const bucket = mastery.kind === 'word' ? today.newWords : mastery.kind === 'sentence' ? today.newSentences : mastery.kind === 'pattern' ? today.newPatterns : today.newEpisodes;
      bucket.push(mastery);
    }
    const items = { words: [] as MasteryItem[], sentences: [] as MasteryItem[], patterns: [] as MasteryItem[], episodes: [] as MasteryItem[] };
    for (const mastery of masteries.values()) {
      if (mastery.kind === 'word') items.words.push(mastery);
      if (mastery.kind === 'sentence') items.sentences.push(mastery);
      if (mastery.kind === 'pattern') items.patterns.push(mastery);
      if (mastery.kind === 'episode') items.episodes.push(mastery);
    }
    const days = new Map<string, DailySummary>();
    for (const event of record.events) {
      const daily = days.get(event.day) ?? emptyDaily(event.day);
      if (event.type === 'practice_completed') daily.practiceCount += 1;
      if (event.type === 'mastered') {
        const mastery = masteries.get(event.item.id);
        if (mastery) (mastery.kind === 'word' ? daily.newWords : mastery.kind === 'sentence' ? daily.newSentences : mastery.kind === 'pattern' ? daily.newPatterns : daily.newEpisodes).push(mastery);
      }
      days.set(event.day, daily);
    }
    if (!days.has(today.day)) days.set(today.day, today);
    return { today, days: [...days.values()].sort((a, b) => b.day.localeCompare(a.day)).slice(0, 7), items };
  };
  return { getSummary, recordPractice, markMastered };
}
