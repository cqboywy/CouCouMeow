import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('renders the official product names', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: '凑凑喵英语乐园' })).toBeInTheDocument();
    expect(screen.getByText('CouCouMeow English Land')).toBeInTheDocument();
  });

  it('shows a gentle ready message when the API responds', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'ok', service: 'coucoumeow-api', version: '0.1.0' }),
    }));
    render(<App />);
    expect(await screen.findByText('学习服务已准备好')).toBeInTheDocument();
    vi.unstubAllGlobals();
  });
});
