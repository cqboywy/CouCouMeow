import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('renders the official product names', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: '凑凑喵英语乐园' })).toBeInTheDocument();
    expect(screen.getByText('CouCouMeow English Land')).toBeInTheDocument();
  });

  it('shows the published episode and Level 1–9 accordion when the API responds', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ items: [{
        id: 'l1-001-dino-buddies-the-park', level: 1, title: 'Dino Buddies 1: The Park',
        local_video_filename: '001_Dino Buddies 1_The Park.mp4', is_published: true, is_learned: false,
      }] }),
    }));
    render(<App />);
    expect(await screen.findByRole('heading', { name: '今天继续学习' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Level 1/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Level 9/ })).toBeInTheDocument();
    expect(screen.getByText('Dino Buddies 1: The Park')).toBeInTheDocument();
    vi.unstubAllGlobals();
  });

  it('opens an episode learning view', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ items: [{ id: 'l1-001-dino-buddies-the-park', level: 1, title: 'Dino Buddies 1: The Park', local_video_filename: '001_Dino Buddies 1_The Park.mp4', is_published: true, is_learned: false }] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ learned_episodes: 0, total_words: 17, practice_count: 0, mistake_count: 0 }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({
        id: 'l1-001-dino-buddies-the-park', level: 1, title: 'Dino Buddies 1: The Park',
        chinese_title: '恐龙伙伴：公园奇遇', local_video_filename: '001_Dino Buddies 1_The Park.mp4',
        story_summary: 'Rex 想和其他恐龙交朋友，却被大家误会了。',
        story_theme: '不要只凭外表判断别人。',
        sentences: [{ id: 'sentence-1', english: 'One day Rex was in the park.', chinese: '一天，Rex 在公园里。', is_featured: true }],
        vocab: [{ id: 'vocab-park', word: 'park', phonetic: '/pɑːk/', meaning: '公园' }],
        knowledge: [{ id: 'knowledge-1', title: 'was / were + 地点', explanation: '表示过去在哪里。', examples: ['I was in the library.'] }],
        comprehension_questions: ['Rex 在哪里？'], retell_steps: ['Rex 来到公园。'],
        past_tense_pairs: [{ base: 'see', past: 'saw', meaning: '看见' }],
      }) })
    );
    render(<App />);
    fireEvent.click(await screen.findByRole('button', { name: /开始这一集/ }));
    expect(await screen.findByText('请在本地打开对应视频观看')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '恐龙伙伴：公园奇遇' })).toBeInTheDocument();
    expect(screen.getByText('Rex 想和其他恐龙交朋友，却被大家误会了。')).toBeInTheDocument();
    expect(screen.getByText('完整台词（1句）')).toBeInTheDocument();
    vi.unstubAllGlobals();
  });
});
