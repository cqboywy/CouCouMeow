import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SchoolLibrary } from './SchoolLibrary';

describe('SchoolLibrary', () => {
  it('lets a child choose Unit 2 without hiding the Unit 1 learning history', () => {
    render(<SchoolLibrary completedLessonIds={['pep4a-u1-l1']} currentLessonId="pep4a-u1-l2" onOpenLesson={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'Unit 1 Helping at home' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'Unit 2 My friends' }));

    expect(screen.getByRole('heading', { name: 'Unit 2 My friends' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /开始第 1 课：认识 My friends/ })).toBeInTheDocument();
  });
});
