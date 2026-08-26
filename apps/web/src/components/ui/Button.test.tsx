import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders a large accessible primary action', () => {
    render(<Button>开始学习</Button>);
    expect(screen.getByRole('button', { name: '开始学习' })).toHaveClass(
      'button',
      'button--primary',
    );
  });
});
