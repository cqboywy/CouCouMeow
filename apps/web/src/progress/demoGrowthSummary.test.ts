import { describe, expect, it } from 'vitest';
import { getDemoGrowthSummary } from './demoGrowthSummary';

describe('getDemoGrowthSummary', () => {
  it('creates a varied four-day growth record for the visual demo', () => {
    const summary = getDemoGrowthSummary(new Date('2026-08-27T12:00:00'));

    expect(summary.days).toHaveLength(4);
    expect(summary.today.practiceCount).toBeGreaterThan(0);
    expect(summary.items.words).toHaveLength(4);
    expect(summary.items.sentences).toHaveLength(3);
    expect(summary.items.patterns).toHaveLength(2);
    expect(summary.items.episodes).toHaveLength(1);
    expect(summary.reviewItems.map(item => item.english)).toEqual(['creature', 'He flew out of his cave.']);
  });
});
