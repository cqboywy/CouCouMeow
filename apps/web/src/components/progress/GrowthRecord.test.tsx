import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { getDemoGrowthSummary } from '../../progress/demoGrowthSummary';
import { GrowthRecord } from './GrowthRecord';

describe('GrowthRecord', () => {
  it('opens the matching detailed collection from a summary card', () => {
    render(<GrowthRecord summary={getDemoGrowthSummary(new Date('2026-08-27T12:00:00'))} onStartLearning={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: '查看已学句子清单' }));

    expect(screen.getByRole('tab', { name: /句子 3/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Bat woke up.')).toBeInTheDocument();
  });
});
