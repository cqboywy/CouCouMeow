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
  it('opens a simple school-first stage from the ui query', async () => {
    window.history.replaceState(null, '', '/?ui=motion');
    vi.stubGlobal('fetch', vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      const body = url.endsWith('/episodes')
        ? { items: [episode] }
        : { learned_episodes: 0, total_words: 17, practice_count: 0, mistake_count: 0 };
      return { ok: true, json: async () => body };
    }));

    render(<App />);

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

    render(<App />);

    fireEvent.click(await screen.findByRole('button', { name: '校内同步' }));
    expect(screen.getByRole('heading', { name: 'Unit 1 Helping at home' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /开始第/ })).toHaveLength(6);

    fireEvent.click(screen.getByRole('button', { name: '课外动画' }));
    expect(screen.getByRole('heading', { name: '动画学习小书架' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Level 1/ })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '成长记录' }));
    expect(screen.getByRole('heading', { name: '我的成长记录' })).toBeInTheDocument();
    expect(screen.getByRole('tablist', { name: '成长记录范围' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '校内成长' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.queryByRole('tablist', { name: '学习收藏分类' })).not.toBeInTheDocument();
  });
});
