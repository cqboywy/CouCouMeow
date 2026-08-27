import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { getLessonById } from '../../curriculum/pepGrade4UpperUnit1';
import { SchoolLesson } from './SchoolLesson';

describe('SchoolLesson direct steps', () => {
  it('opens the practice activity directly from the school task entry', () => {
    const lesson = getLessonById('pep4a-u1-l2')!;

    render(<SchoolLesson initialStep="practice" lesson={lesson} onRecordExercise={vi.fn()} onComplete={vi.fn()} onBack={vi.fn()} storageError="" />);

    expect(screen.getByText('练一练', { selector: '[aria-current="step"]' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '护士是哪个单词？' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '开始练习' })).not.toBeInTheDocument();
  });

  it('opens the small check directly and keeps it answerable', () => {
    const lesson = getLessonById('pep4a-u1-l2')!;

    render(<SchoolLesson initialStep="check" lesson={lesson} onRecordExercise={vi.fn()} onComplete={vi.fn()} onBack={vi.fn()} storageError="" />);

    expect(screen.getByText('小检查', { selector: '[aria-current="step"]' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: "补全：She's a ___." })).toBeInTheDocument();
    expect(screen.getByLabelText('填写答案')).toBeInTheDocument();
  });
});
