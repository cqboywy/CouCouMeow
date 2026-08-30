import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ContentProvider, useContent } from './ContentProvider';
import type { ContentCatalog } from './types';

const catalog: ContentCatalog = { textbooks: [{ id: 'book', curriculum: 'PEP', grade: 4, semester: 'upper', title: '四上', currentUnitId: 'u1', units: [] }], extraEpisodes: [] };

function Consumer() {
  const content = useContent();
  return <p>{content.catalog === catalog ? '云端内容已加载' : '错误内容'}</p>;
}

describe('ContentProvider', () => {
  it('blocks children until the cloud catalog is ready', async () => {
    render(<ContentProvider initialize={async () => ({ catalog })}><Consumer /></ContentProvider>);
    expect(screen.getByText('正在加载线上课程内容…')).toBeInTheDocument();
    expect(await screen.findByText('云端内容已加载')).toBeInTheDocument();
  });

  it('shows a retryable error and never falls back to bundled content', async () => {
    const initialize = vi.fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce({ catalog });
    render(<ContentProvider initialize={initialize}><Consumer /></ContentProvider>);
    expect(await screen.findByRole('alert')).toHaveTextContent('线上课程内容暂时没有准备好');
    fireEvent.click(screen.getByRole('button', { name: '重新连接' }));
    await waitFor(() => expect(initialize).toHaveBeenCalledTimes(2));
    expect(await screen.findByText('云端内容已加载')).toBeInTheDocument();
  });
});
