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
        id: 'l1-01-the-lost-kitten', level: 1, title: 'The Lost Kitten',
        local_video_filename: 'L1-01-The-Lost-Kitten.mp4', is_published: true, is_learned: false,
      }] }),
    }));
    render(<App />);
    expect(await screen.findByRole('heading', { name: '今天继续学习' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Level 1/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Level 9/ })).toBeInTheDocument();
    expect(screen.getByText('The Lost Kitten')).toBeInTheDocument();
    vi.unstubAllGlobals();
  });

  it('opens an episode learning view', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ items: [{ id: 'l1-01-the-lost-kitten', level: 1, title: 'The Lost Kitten', local_video_filename: 'L1-01-The-Lost-Kitten.mp4', is_published: true, is_learned: false }] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ learned_episodes: 0, total_words: 8, practice_count: 0 }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 'l1-01-the-lost-kitten', level: 1, title: 'The Lost Kitten', local_video_filename: 'L1-01-The-Lost-Kitten.mp4', sentences: [{ id: 'sentence-1', english: 'Hello, little kitten.', chinese: '你好，小猫咪。' }], vocab: [], knowledge: [] }) })
    );
    render(<App />);
    fireEvent.click(await screen.findByRole('button', { name: /开始这一集/ }));
    expect(await screen.findByText('请在本地打开对应视频观看')).toBeInTheDocument();
    expect(screen.getByText('你好，小猫咪。')).toBeInTheDocument();
    vi.unstubAllGlobals();
  });
});
