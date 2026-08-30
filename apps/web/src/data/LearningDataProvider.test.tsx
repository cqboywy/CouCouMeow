import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { StrictMode } from 'react';
import type { LearningProgressRepository } from './learningProgressRepository';
import { LearningDataProvider, useLearningData, type InitializedLearningData } from './LearningDataProvider';

const repository: LearningProgressRepository = {
  loadEvents: vi.fn(async () => []), appendEvents: vi.fn(async () => undefined),
  getSelectedTextbookId: vi.fn(async () => 'pep4a'), setSelectedTextbookId: vi.fn(async () => undefined),
  getImportReceipt: vi.fn(async () => null), saveImportReceipt: vi.fn(async () => undefined), findEventIds: vi.fn(async () => new Set()),
};
const initialized: InitializedLearningData = { userId: 'user-1', repository, events: [], selectedTextbookId: 'pep4a' };

function Child() {
  const data = useLearningData();
  return <p>ready:{data.userId}:{data.selectedTextbookId}</p>;
}

describe('LearningDataProvider', () => {
  it('does not render the application until online data is ready', async () => {
    let resolve!: (value: InitializedLearningData) => void;
    const initialize = vi.fn(() => new Promise<InitializedLearningData>(done => { resolve = done; }));
    render(<LearningDataProvider initialize={initialize}><Child /></LearningDataProvider>);

    expect(screen.getByRole('status')).toHaveTextContent('正在连接线上学习档案');
    expect(screen.queryByText(/ready:/)).not.toBeInTheDocument();

    resolve(initialized);
    expect(await screen.findByText('ready:user-1:pep4a')).toBeInTheDocument();
  });

  it('shows a safe retryable startup error', async () => {
    const initialize = vi.fn().mockRejectedValueOnce(new Error('raw-token')).mockResolvedValueOnce(initialized);
    render(<LearningDataProvider initialize={initialize}><Child /></LearningDataProvider>);

    expect(await screen.findByText('线上学习档案暂时没有准备好')).toBeInTheDocument();
    expect(screen.queryByText('raw-token')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '重新连接' }));

    await waitFor(() => expect(screen.getByText('ready:user-1:pep4a')).toBeInTheDocument());
    expect(initialize).toHaveBeenCalledTimes(2);
  });

  it('initializes one online session under React StrictMode', async () => {
    const initialize = vi.fn().mockResolvedValue(initialized);
    render(<StrictMode><LearningDataProvider initialize={initialize}><Child /></LearningDataProvider></StrictMode>);

    expect(await screen.findByText('ready:user-1:pep4a')).toBeInTheDocument();
    expect(initialize).toHaveBeenCalledTimes(1);
  });
});
