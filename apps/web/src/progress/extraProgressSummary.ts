import type { ExtraLearningEvent, LearningItem } from './learningEvents';

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
  reviewItems: LearningItem[];
};

const emptyDaily = (day: string): DailySummary => ({
  day,
  practiceCount: 0,
  newWords: [],
  newSentences: [],
  newPatterns: [],
  newEpisodes: [],
});

const masteryBucket = (daily: DailySummary, mastery: MasteryItem) => (
  mastery.kind === 'word'
    ? daily.newWords
    : mastery.kind === 'sentence'
      ? daily.newSentences
      : mastery.kind === 'pattern'
        ? daily.newPatterns
        : daily.newEpisodes
);

export function deriveExtraProgress(events: ExtraLearningEvent[], todayDay: string): GrowthSummary {
  const sorted = [...events].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
  const today = emptyDaily(todayDay);
  const masteries = new Map<string, MasteryItem>();

  for (const event of sorted) {
    if (event.eventType === 'mastered' && !masteries.has(event.payload.item.id)) {
      masteries.set(event.payload.item.id, {
        ...event.payload.item,
        firstLearnedDay: event.localDay,
        latestPracticeDay: event.localDay,
        correctCount: 0,
        totalPracticeCount: 0,
      });
    }
  }

  for (const event of sorted) {
    if (event.eventType === 'practice_completed' && event.localDay === today.day) today.practiceCount += 1;
    const mastery = masteries.get(event.payload.item.id);
    if (mastery && event.eventType === 'practice_completed') {
      mastery.totalPracticeCount += 1;
      mastery.correctCount += event.payload.correct ? 1 : 0;
      mastery.latestPracticeDay = event.localDay;
    }
  }

  for (const mastery of masteries.values()) {
    if (mastery.firstLearnedDay === today.day) masteryBucket(today, mastery).push(mastery);
  }

  const items = { words: [] as MasteryItem[], sentences: [] as MasteryItem[], patterns: [] as MasteryItem[], episodes: [] as MasteryItem[] };
  for (const mastery of masteries.values()) {
    if (mastery.kind === 'word') items.words.push(mastery);
    if (mastery.kind === 'sentence') items.sentences.push(mastery);
    if (mastery.kind === 'pattern') items.patterns.push(mastery);
    if (mastery.kind === 'episode') items.episodes.push(mastery);
  }

  const days = new Map<string, DailySummary>();
  for (const event of sorted) {
    const daily = days.get(event.localDay) ?? emptyDaily(event.localDay);
    if (event.eventType === 'practice_completed') daily.practiceCount += 1;
    if (event.eventType === 'mastered') {
      const mastery = masteries.get(event.payload.item.id);
      if (mastery) masteryBucket(daily, mastery).push(mastery);
    }
    days.set(event.localDay, daily);
  }
  if (!days.has(today.day)) days.set(today.day, today);

  const latestPractice = new Map<string, ExtraLearningEvent>();
  for (const event of sorted) {
    if (event.eventType === 'practice_completed') latestPractice.set(event.payload.item.id, event);
  }
  const reviewItems = [...latestPractice.values()]
    .filter(event => !event.payload.correct)
    .map(event => event.payload.item);

  return {
    today,
    days: [...days.values()].sort((a, b) => b.day.localeCompare(a.day)).slice(0, 7),
    items,
    reviewItems,
  };
}
