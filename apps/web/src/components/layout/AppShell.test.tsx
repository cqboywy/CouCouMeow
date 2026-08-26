import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppShell } from './AppShell';

describe('AppShell', () => {
  it('provides one main landmark and the official brand', () => {
    render(<AppShell><p>内容</p></AppShell>);
    expect(screen.getAllByRole('main')).toHaveLength(1);
    expect(screen.getByText('凑凑喵英语乐园')).toBeInTheDocument();
  });
});
