import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { getLessonById } from '../../curriculum/pepGrade4UpperUnit1';
import { SchoolLesson } from './SchoolLesson';

describe('SchoolLesson', () => {
  it('keeps one active learning step and records the practice result near the question', () => {
    const lesson = getLessonById('pep4a-u1-l2')!;
    const record = vi.fn();

    render(<SchoolLesson lesson={lesson} onRecordExercise={record} onComplete={vi.fn()} onBack={vi.fn()} storageError="" />);

    expect(screen.getByRole('heading', { name: lesson.title })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '开始练习' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '检查答案' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '开始练习' }));
    fireEvent.click(screen.getByRole('button', { name: 'nurse' }));
    fireEvent.click(screen.getByRole('button', { name: '检查答案' }));

    expect(record).toHaveBeenCalledWith(lesson, lesson.exercises[0], true);
    expect(screen.getByRole('status')).toHaveTextContent('答对啦');
  });

  it('finishes the lesson only after the small check is completed', () => {
    const lesson = getLessonById('pep4a-u1-l2')!;
    const complete = vi.fn();

    render(<SchoolLesson lesson={lesson} onRecordExercise={vi.fn()} onComplete={complete} onBack={vi.fn()} storageError="" />);

    fireEvent.click(screen.getByRole('button', { name: '开始练习' }));
    fireEvent.click(screen.getByRole('button', { name: 'nurse' }));
    fireEvent.click(screen.getByRole('button', { name: '检查答案' }));
    fireEvent.click(screen.getByRole('button', { name: '下一题' }));
    fireEvent.click(screen.getByRole('button', { name: "She's a doctor." }));
    fireEvent.click(screen.getByRole('button', { name: '检查答案' }));
    fireEvent.click(screen.getByRole('button', { name: '去做小检查' }));
    fireEvent.change(screen.getByLabelText('填写答案'), { target: { value: 'doctor' } });
    fireEvent.click(screen.getByRole('button', { name: '检查答案' }));
    fireEvent.click(screen.getByRole('button', { name: '下一题' }));
    fireEvent.change(screen.getByLabelText('填写答案'), { target: { value: 'job' } });
    fireEvent.click(screen.getByRole('button', { name: '检查答案' }));
    fireEvent.click(screen.getByRole('button', { name: '完成本课' }));

    expect(complete).toHaveBeenCalledWith(lesson);
  });

  it('moves through two practice questions before revealing the small check', () => {
    const lesson = getLessonById('pep4a-u1-l2')!;

    render(<SchoolLesson lesson={lesson} onRecordExercise={vi.fn()} onComplete={vi.fn()} onBack={vi.fn()} storageError="" />);

    fireEvent.click(screen.getByRole('button', { name: '开始练习' }));
    expect(screen.getByText('第 1 / 2 题')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'nurse' }));
    fireEvent.click(screen.getByRole('button', { name: '检查答案' }));
    fireEvent.click(screen.getByRole('button', { name: '下一题' }));

    expect(screen.getByText('第 2 / 2 题')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '哪一句是在介绍朋友的职业？' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '去做小检查' })).not.toBeInTheDocument();
  });

  it('shows the actual Unit 2 breadcrumb for a Unit 2 lesson', () => {
    const lesson = getLessonById('pep4a-u2-l1')!;
    render(<SchoolLesson lesson={lesson} onRecordExercise={vi.fn()} onComplete={vi.fn()} onBack={vi.fn()} storageError="" />);

    expect(screen.getByText('PEP 四年级上册 · Unit 2 · 第 1 课')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '回到 Unit 2' })).toBeInTheDocument();
  });
});
