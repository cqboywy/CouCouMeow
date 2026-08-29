import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { getTextbookPageById } from '../../curriculum/pepGrade4UpperTextbookPages';
import { SchoolTextbookPage } from './SchoolTextbookPage';

const page = getTextbookPageById('pep4a-u1-p3')!;
const props = { onRecordCheck: vi.fn(), onComplete: vi.fn(), onLaterReview: vi.fn(), onBack: vi.fn(), onOpenNext: vi.fn() };

describe('SchoolTextbookPage', () => {
  it('在当前句子下方显示重点提示', () => {
    render(<SchoolTextbookPage page={page} {...props} />);

    fireEvent.click(screen.getByRole('button', { name: '查看 children 提示' }));

    const section = screen.getByText('Look and think').closest('section')!;
    expect(within(section).getByText(/儿童；小孩/)).toBeInTheDocument();
  });

  it('用底部开关显示中文，且未完成小检查前不展示完成按钮', () => {
    render(<SchoolTextbookPage page={page} {...props} />);

    fireEvent.click(screen.getAllByRole('button', { name: '显示中文' })[0]);

    expect(screen.getAllByText('这些孩子在家怎样帮忙？')[0]).toBeVisible();
    expect(screen.queryByRole('button', { name: '完成本页' })).not.toBeInTheDocument();
  });

  it('先显示开口挑战入口和本页收尾，再在点击后开始抽查', () => {
    render(<SchoolTextbookPage page={page} {...props} />);

    expect(screen.getByText('读完了，试着不用看英文说出来。')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '开始开口挑战' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '这一页，我能做到' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '开始开口挑战' }));
    expect(screen.getByText('开口挑战 · 看中文，说英文 · 第 1/3 题')).toBeInTheDocument();
  });
});
