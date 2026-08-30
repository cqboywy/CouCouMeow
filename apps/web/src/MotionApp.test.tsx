import { fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App, applyLocalEpisodeStatus, getSchoolReviewDestination, selectVisibleProgress } from './App';
import type { GrowthSummary } from './progress/extraProgressSummary';
import { renderWithLearningData } from './test/renderWithLearningData';

const episode = {
  id: 'l1-001-dino-buddies-the-park',
  level: 1,
  series_title: 'Dino Buddies',
  episode_number: 1,
  title: 'The Park',
  local_video_filename: '001_Dino Buddies 1_The Park.mp4',
  is_published: true,
  is_learned: false,
};

afterEach(() => {
  window.history.replaceState(null, '', '/');
  vi.unstubAllGlobals();
});

describe('motion interface', () => {
  it('keeps real local growth data visible unless demo mode is explicitly requested', () => {
    const actual = { today: { day: '2026-08-29', practiceCount: 1, newWords: [], newSentences: [], newPatterns: [], newEpisodes: [] }, days: [], items: { words: [], sentences: [], patterns: [], episodes: [] }, reviewItems: [] } satisfies GrowthSummary;

    expect(selectVisibleProgress(new URLSearchParams('ui=motion'), actual)).toBe(actual);
  });

  it('marks completed extracurricular episodes in the bookshelf from local growth data', () => {
    const summary = { today: { day: '2026-08-29', practiceCount: 0, newWords: [], newSentences: [], newPatterns: [], newEpisodes: [] }, days: [], items: { words: [], sentences: [], patterns: [], episodes: [{ id: episode.id, kind: 'episode', english: episode.title, chinese: '', episodeId: episode.id, firstLearnedDay: '2026-08-29', latestPracticeDay: '2026-08-29', correctCount: 1, totalPracticeCount: 1 }] }, reviewItems: [] } satisfies GrowthSummary;

    expect(applyLocalEpisodeStatus([episode], summary)[0]?.is_learned).toBe(true);
  });

  it('returns a page destination for a school check that needs review', () => {
    expect(getSchoolReviewDestination({ pageId: 'pep4a-u1-p3' })).toEqual({ type: 'page', id: 'pep4a-u1-p3' });
  });

  it('opens a simple school-first stage from the ui query', async () => {
    window.history.replaceState(null, '', '/?ui=motion');
    vi.stubGlobal('fetch', vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      const body = url.endsWith('/episodes')
        ? { items: [episode] }
        : { learned_episodes: 0, total_words: 17, practice_count: 0, mistake_count: 0 };
      return { ok: true, json: async () => body };
    }));

    renderWithLearningData(<App />);

    expect(await screen.findByRole('region', { name: '今日校内学习舞台' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '今天，把课本学轻松一点' })).toHaveClass('motion-heading');
    expect(screen.getAllByRole('button', { name: /开始校内学习/ })).toHaveLength(1);
    expect(screen.getByText('PEP 四年级上册 · Unit 1')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: '首页内容' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '校内同步' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '课外动画' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '家人做什么工作' })).not.toBeInTheDocument();
  });

  it('keeps school, extracurricular, and progress destinations separate and usable', async () => {
    window.history.replaceState(null, '', '/?ui=motion');
    vi.stubGlobal('fetch', vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      const body = url.endsWith('/episodes')
        ? { items: [episode] }
        : { learned_episodes: 2, total_words: 17, practice_count: 5, mistake_count: 1 };
      return { ok: true, json: async () => body };
    }));

    renderWithLearningData(<App />);

    fireEvent.click(await screen.findByRole('button', { name: '校内同步' }));
    expect(screen.getByText('继续学习 · 课本第 2 页')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /开始学习/ })).toHaveLength(1);
    expect(screen.queryByText('三步完成今天的校内任务')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /开始学习/ }));
    expect(screen.getByRole('heading', { name: '在家帮忙' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '本页重点' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '开始开口挑战' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '回到 Unit 1' }));

    fireEvent.click(screen.getByRole('button', { name: '课外动画' }));
    expect(screen.getByRole('heading', { name: '动画学习小书架' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Level 1/ })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '成长记录' }));
    expect(screen.getByRole('heading', { name: '我的成长记录' })).toBeInTheDocument();
    expect(screen.getByRole('tablist', { name: '成长记录范围' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '校内成长' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.queryByRole('tablist', { name: '学习收藏分类' })).not.toBeInTheDocument();
  });

  it('uses imported extracurricular lessons when the local learning API is unavailable', async () => {
    window.history.replaceState(null, '', '/?ui=motion');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    renderWithLearningData(<App />);

    fireEvent.click(await screen.findByRole('button', { name: '课外动画' }));
    expect(screen.getByRole('button', { name: /Level 1 3 集已发布/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Bat and Friends 2 集' })).toBeInTheDocument();
  });
});
