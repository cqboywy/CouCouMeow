import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { GrowthSummary } from '../../progress/extraProgressSummary';
import type { SchoolProgressSummary } from '../../progress/schoolProgressSummary';
import { DualTrackGrowth } from './DualTrackGrowth';

const school: SchoolProgressSummary = {
  textbookId: 'pep-grade4-upper', unitId: 'pep4a-u1', completedLessonIds: ['pep4a-u1-l1'], currentLessonId: 'pep4a-u1-l2', practiceCount: 3,
  completedPageIds: ['pep4a-u1-p3'], currentPageId: 'pep4a-u1-p4', laterReviewItems: [],
  masteredItems: [
    { id: 'school-help', kind: 'word', english: 'help', chinese: '帮助', source: 'school', lessonId: 'pep4a-u1-l1', firstLearnedDay: '2026-08-27', latestPracticeDay: '2026-08-27' },
    { id: 'school-can-help', kind: 'sentence', english: 'Can you help?', chinese: '你能帮忙吗？', source: 'school', lessonId: 'pep4a-u1-l1', firstLearnedDay: '2026-08-27', latestPracticeDay: '2026-08-27' },
  ],
  reviewItems: [], days: [{ day: '2026-08-27', practiceCount: 3, completedLessonCount: 1, completedPageCount: 1 }],
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
    expect(screen.getByText('已完成页面')).toBeInTheDocument();
    expect(screen.getByText('Unit 1 · Helping at home · 第 1 课')).toBeInTheDocument();
    expect(screen.getByText('这一周的小脚印')).toBeInTheDocument();
    expect(screen.getByText('我学会的内容')).toBeInTheDocument();
    expect(screen.getByText('8月27日学会了这些')).toBeInTheDocument();
    expect(screen.queryByText('已学剧集')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: '课外成长' }));

    expect(screen.getByText('已学剧集')).toBeInTheDocument();
    expect(screen.queryByText('已完成页面')).not.toBeInTheDocument();
  }, 15_000);

  it('lets school learning be viewed by vocabulary and sentences', () => {
    render(<DualTrackGrowth school={school} extra={extra} onStartSchool={vi.fn()} onStartExtra={vi.fn()} />);

    const collection = screen.getByRole('heading', { name: '我学会的内容' }).closest('section')!;
    expect(within(collection).getByText('help')).toBeInTheDocument();
    fireEvent.click(within(collection).getByRole('tab', { name: /句子 1/ }));
    expect(within(collection).getByText('Can you help?')).toBeInTheDocument();
    expect(within(collection).queryByText('help')).not.toBeInTheDocument();
  });

  it('shows a side-by-side overview without a combined total', () => {
    render(<DualTrackGrowth school={school} extra={extra} onStartSchool={vi.fn()} onStartExtra={vi.fn()} />);

    fireEvent.click(screen.getByRole('tab', { name: '学习总览' }));

    expect(screen.getByRole('region', { name: '校内学习摘要' })).toHaveTextContent('1 课时');
    expect(screen.getByRole('region', { name: '课外学习摘要' })).toHaveTextContent('1 集动画');
    expect(screen.queryByText('学习总数')).not.toBeInTheDocument();
  });
});
