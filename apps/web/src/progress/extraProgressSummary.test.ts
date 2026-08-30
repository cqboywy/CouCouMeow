import { describe, expect, it } from 'vitest';
import { deriveExtraProgress } from './extraProgressSummary';
import type { ExtraLearningEvent, LearningItem } from './learningEvents';

const word: LearningItem = { id: 'word-park', kind: 'word', english: 'park', chinese: '公园', episodeId: 'episode-1' };
const event = (id: string, eventType: ExtraLearningEvent['eventType'], day: string, correct?: boolean): ExtraLearningEvent => ({
  id,
  userId: 'user-1',
  track: 'extra',
  eventType,
  occurredAt: `${day}T09:00:00.000Z`,
  localDay: day,
  payload: { item: word, correct, method: 'written' },
});

describe('deriveExtraProgress', () => {
  it('counts repeated correct practice but only one first mastery', () => {
    const summary = deriveExtraProgress([
      event('00000000-0000-0000-0000-000000000001', 'practice_completed', '2026-08-30', true),
      event('00000000-0000-0000-0000-000000000002', 'mastered', '2026-08-30'),
      event('00000000-0000-0000-0000-000000000003', 'practice_completed', '2026-08-30', true),
    ], '2026-08-30');

    expect(summary.today.practiceCount).toBe(2);
    expect(summary.today.newWords).toHaveLength(1);
    expect(summary.items.words[0]).toMatchObject({ id: word.id, correctCount: 2, totalPracticeCount: 2 });
  });

  it('uses the latest practice result for the review queue', () => {
    const summary = deriveExtraProgress([
      event('00000000-0000-0000-0000-000000000004', 'practice_completed', '2026-08-29', true),
      event('00000000-0000-0000-0000-000000000005', 'practice_completed', '2026-08-30', false),
    ], '2026-08-30');

    expect(summary.reviewItems).toEqual([word]);
  });
});
