import { describe, expect, it } from 'vitest';
import type { GrowthSummary } from './localProgressRepository';
import type { SchoolProgressSummary } from './schoolProgressRepository';
import { getTodayReviewItems } from './todayReview';

const school = { textbookId: 'pep-grade4-upper', unitId: 'pep4a-u1', completedLessonIds: [], currentLessonId: 'pep4a-u1-l1', completedPageIds: [], currentPageId: 'pep4a-u1-p3', practiceCount: 0, masteredItems: [], reviewItems: [{ id: 'room', kind: 'word', english: 'room', chinese: '房间', source: 'school', lessonId: 'pep4a-u1-l1', exerciseId: 'p3-check-room', pageId: 'pep4a-u1-p3' }], laterReviewItems: [{ id: 'can-help', kind: 'sentence', english: 'Can you help?', chinese: '你能帮忙吗？', source: 'school', pageId: 'pep4a-u1-p3' }], days: [] } satisfies SchoolProgressSummary;
const emptyDay = { day: '2026-08-29', practiceCount: 0, newWords: [], newSentences: [], newPatterns: [], newEpisodes: [] };
const extra = { today: emptyDay, days: [emptyDay], items: { words: [], sentences: [], patterns: [], episodes: [] }, reviewItems: [{ id: 'friend', kind: 'word', english: 'friend', chinese: '朋友', episodeId: 'l1-001-dino-buddies-the-park' }] } satisfies GrowthSummary;

describe('today review', () => {
  it('combines school later items, school mistakes, and extracurricular mistakes in priority order', () => {
    expect(getTodayReviewItems(school, extra)).toEqual([
      expect.objectContaining({ source: 'school-later', item: expect.objectContaining({ english: 'Can you help?' }) }),
      expect.objectContaining({ source: 'school-check', item: expect.objectContaining({ english: 'room' }) }),
      expect.objectContaining({ source: 'extra', item: expect.objectContaining({ english: 'friend' }) }),
    ]);
  });
});
