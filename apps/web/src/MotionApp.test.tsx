import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';

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
  it('opens the independent cloud story stage from the ui query', async () => {
    window.history.replaceState(null, '', '/?ui=motion');
    vi.stubGlobal('fetch', vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      const body = url.endsWith('/episodes')
        ? { items: [episode] }
        : { learned_episodes: 0, total_words: 17, practice_count: 0, mistake_count: 0 };
      return { ok: true, json: async () => body };
    }));

    render(<App />);

    expect(await screen.findByRole('region', { name: '今日英语故事舞台' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '今天，一起走进英语故事' })).toHaveClass('motion-heading');
    expect(screen.getByRole('button', { name: /开始学习 The Park/ })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: '首页内容' })).toBeInTheDocument();
    expect(screen.queryByText('今天的英语故事')).not.toBeInTheDocument();
    expect(screen.queryByText('第 1 集')).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: '今日学习路径' })).toBeInTheDocument();
    expect(screen.getByText('先看懂故事，再练单词，最后勇敢开口。').closest('[aria-label="今日学习路径"]')).toBeInTheDocument();
  });

  it('keeps the bookshelf and progress destinations usable', async () => {
    window.history.replaceState(null, '', '/?ui=motion');
    vi.stubGlobal('fetch', vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      const body = url.endsWith('/episodes')
        ? { items: [episode] }
        : { learned_episodes: 2, total_words: 17, practice_count: 5, mistake_count: 1 };
      return { ok: true, json: async () => body };
    }));

    render(<App />);

    fireEvent.click(await screen.findByRole('button', { name: '剧集书架' }));
    expect(screen.getByRole('heading', { name: '动画学习小书架' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Level 1/ })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '成长记录' }));
    expect(screen.getByRole('heading', { name: '我的成长记录' })).toBeInTheDocument();
    expect(screen.getByRole('tablist', { name: '学习收藏分类' })).toBeInTheDocument();
  });
});
