import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SchoolLibrary } from './SchoolLibrary';

describe('SchoolLibrary', () => {
  it('opens the current real textbook page instead of an empty lesson route', () => {
    const onOpenPage = vi.fn();
    render(<SchoolLibrary completedPageIds={[]} currentPageId="pep4a-u1-p3" laterReviewItems={[]} onOpenPage={onOpenPage} />);

    expect(screen.getByText('继续学习 · 课本第 3 页')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Unit 2 · My friends/ })).toBeInTheDocument();
    expect(screen.queryByText('三步完成今天的校内任务')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /开始学习/ }));

    expect(onOpenPage).toHaveBeenCalledWith(expect.objectContaining({ id: 'pep4a-u1-p3' }));
  });

  it('opens Unit 2 from its first real textbook page', () => {
    const onOpenPage = vi.fn();
    render(<SchoolLibrary completedPageIds={[]} currentPageId="pep4a-u1-p3" laterReviewItems={[]} onOpenPage={onOpenPage} />);

    fireEvent.click(screen.getByRole('button', { name: /Unit 2 · My friends/ }));

    expect(screen.getByText('继续学习 · 课本第 14 页')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /开始学习/ }));
    expect(onOpenPage).toHaveBeenCalledWith(expect.objectContaining({ id: 'pep4a-u2-p14' }));
  });
});
