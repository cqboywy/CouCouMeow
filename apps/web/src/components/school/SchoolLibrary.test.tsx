import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SchoolLibrary } from './SchoolLibrary';

describe('SchoolLibrary', () => {
  it('opens the current real textbook page instead of an empty lesson route', () => {
    const onOpenPage = vi.fn();
    render(<SchoolLibrary completedPageIds={[]} currentPageId="pep4a-u1-p3" laterReviewCount={2} onOpenPage={onOpenPage} />);

    expect(screen.getByText('课本第 3 页 · 在家帮忙')).toBeInTheDocument();
    expect(screen.queryByText('三步完成今天的校内任务')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /开始学习/ }));

    expect(onOpenPage).toHaveBeenCalledWith(expect.objectContaining({ id: 'pep4a-u1-p3' }));
  });
});
