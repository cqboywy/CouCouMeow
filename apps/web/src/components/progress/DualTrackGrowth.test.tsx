import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { GrowthSummary } from '../../progress/localProgressRepository';
import type { SchoolProgressSummary } from '../../progress/schoolProgressRepository';
import { DualTrackGrowth } from './DualTrackGrowth';

const school: SchoolProgressSummary = {
  textbookId: 'pep-grade4-upper', unitId: 'pep4a-u1', completedLessonIds: ['pep4a-u1-l1'], currentLessonId: 'pep4a-u1-l2', practiceCount: 3,
  masteredItems: [{ id: 'school-help', kind: 'word', english: 'help', chinese: '帮助', source: 'school', lessonId: 'pep4a-u1-l1', firstLearnedDay: '2026-08-27', latestPracticeDay: '2026-08-27' }],
  reviewItems: [], days: [{ day: '2026-08-27', practiceCount: 3, completedLessonCount: 1 }],
};

const emptyDay = { day: '2026-08-27', practiceCount: 0, newWords: [], newSentences: [], newPatterns: [], newEpisodes: [] };
const extra: GrowthSummary = {
  today: emptyDay,
  days: [emptyDay],
  items: { words: [], sentences: [], patterns: [], episodes: [{ id: 'episode-1', kind: 'episode', english: 'The Park', chinese: '公园', episodeId: 'episode-1', firstLearnedDay: '2026-08-26', latestPracticeDay: '2026-08-26', correctCount: 1, totalPracticeCount: 1 }] },
  reviewItems: [],
};

describe('DualTrackGrowth', () => {
  it('keeps school and extracurricular growth in separate views', () => {
    render(<DualTrackGrowth school={school} extra={extra} onStartSchool={vi.fn()} onStartExtra={vi.fn()} />);

    expect(screen.getByRole('tab', { name: '校内成长' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('已完成课时')).toBeInTheDocument();
    expect(screen.queryByText('已学剧集')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: '课外成长' }));

    expect(screen.getByText('已学剧集')).toBeInTheDocument();
    expect(screen.queryByText('已完成课时')).not.toBeInTheDocument();
  });

  it('shows a side-by-side overview without a combined total', () => {
    render(<DualTrackGrowth school={school} extra={extra} onStartSchool={vi.fn()} onStartExtra={vi.fn()} />);

    fireEvent.click(screen.getByRole('tab', { name: '学习总览' }));

    expect(screen.getByRole('region', { name: '校内学习摘要' })).toHaveTextContent('1 课时');
    expect(screen.getByRole('region', { name: '课外学习摘要' })).toHaveTextContent('1 集动画');
    expect(screen.queryByText('学习总数')).not.toBeInTheDocument();
  });
});
