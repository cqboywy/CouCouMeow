import { describe, expect, it } from 'vitest';
import type { SchoolLearningItem } from '../curriculum/types';
import type { SchoolLearningEvent } from './learningEvents';
import { deriveSchoolProgress } from './schoolProgressSummary';

const word: SchoolLearningItem = { id: 'pep4a-clean', kind: 'word', english: 'clean', chinese: '打扫' };
const event = (
  id: string,
  eventType: SchoolLearningEvent['eventType'],
  overrides: Partial<SchoolLearningEvent['payload']> = {},
): SchoolLearningEvent => ({
  id,
  userId: 'user-1',
  track: 'school',
  eventType,
  occurredAt: '2026-08-30T09:00:00.000Z',
  localDay: '2026-08-30',
  payload: {
    textbookId: 'pep4a',
    unitId: 'pep4a-u1',
    lessonId: 'pep4a-u1-l1',
    ...overrides,
  },
});

describe('deriveSchoolProgress', () => {
  it('derives page completion, mastery, practice, and latest incorrect review', () => {
    const summary = deriveSchoolProgress([
      event('10000000-0000-0000-0000-000000000001', 'page_completed', { pageId: 'pep4a-u1-p2', masteredItems: [word] }),
      event('10000000-0000-0000-0000-000000000002', 'page_check', { pageId: 'pep4a-u1-p2', exerciseId: 'check-1', item: word, correct: false }),
    ], 'pep4a');

    expect(summary).toMatchObject({
      completedPageIds: ['pep4a-u1-p2'],
      currentPageId: 'pep4a-u1-p3',
      practiceCount: 1,
    });
    expect(summary.masteredItems).toEqual([expect.objectContaining({ id: word.id, firstLearnedDay: '2026-08-30' })]);
    expect(summary.reviewItems).toEqual([expect.objectContaining({ id: word.id, pageId: 'pep4a-u1-p2' })]);
  });

  it('resolves later review and locates progress in Unit 2', () => {
    const summary = deriveSchoolProgress([
      event('10000000-0000-0000-0000-000000000003', 'later_review_added', { unitId: 'pep4a-u2', lessonId: 'pep4a-u2-l1', pageId: 'pep4a-u2-p14', item: word }),
      event('10000000-0000-0000-0000-000000000004', 'later_review_resolved', { unitId: 'pep4a-u2', lessonId: 'pep4a-u2-l1', pageId: 'pep4a-u2-p14', item: word }),
      event('10000000-0000-0000-0000-000000000005', 'page_completed', { unitId: 'pep4a-u2', lessonId: 'pep4a-u2-l1', pageId: 'pep4a-u2-p14', masteredItems: [] }),
    ], 'pep4a');

    expect(summary.laterReviewItems).toEqual([]);
    expect(summary.completedPageIds).toContain('pep4a-u2-p14');
  });
});
