import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { getDemoGrowthSummary } from '../../test/demoGrowthSummary';
import { GrowthRecord } from './GrowthRecord';

describe('GrowthRecord', () => {
  it('opens the matching detailed collection from a summary card', () => {
    render(<GrowthRecord summary={getDemoGrowthSummary(new Date('2026-08-27T12:00:00'))} onStartLearning={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: '查看已学句子清单' }));

    expect(screen.getByRole('tab', { name: /句子 3/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Bat woke up.')).toBeInTheDocument();
  });

  it('shows the exact words, sentences, patterns, and episode learned on the selected day', () => {
    render(<GrowthRecord summary={getDemoGrowthSummary(new Date('2026-08-27T12:00:00'))} onStartLearning={vi.fn()} />);

    fireEvent.click(screen.getByRole('tab', { name: '查看 2026-08-26 的学习' }));

    expect(screen.getByRole('heading', { name: '8月26日学会了这些' })).toBeInTheDocument();
    const dailyItems = within(screen.getByLabelText('8月26日 学习内容'));
    expect(dailyItems.getByText('cave')).toBeInTheDocument();
    expect(dailyItems.getByText('Bat woke up.')).toBeInTheDocument();
    expect(dailyItems.getByText('The Park')).toBeInTheDocument();
  });

  it('sends the selected review item back to the learning flow', () => {
    const onReviewItem = vi.fn();
    render(<GrowthRecord summary={getDemoGrowthSummary(new Date('2026-08-27T12:00:00'))} onStartLearning={vi.fn()} onReviewItem={onReviewItem} />);

    fireEvent.click(screen.getByRole('button', { name: '复习：friend' }));

    expect(onReviewItem).toHaveBeenCalledWith(expect.objectContaining({ id: 'vocab-friend', kind: 'word' }));
  });
});
