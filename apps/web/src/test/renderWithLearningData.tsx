import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement } from 'react';
import { LearningDataReadyProvider } from '../data/LearningDataProvider';
import type { LearningProgressRepository } from '../data/learningProgressRepository';

export const createTestLearningRepository = (): LearningProgressRepository => ({
  loadEvents: async () => [],
  appendEvents: async () => undefined,
  getSelectedTextbookId: async () => 'pep4a',
  setSelectedTextbookId: async () => undefined,
  getImportReceipt: async () => null,
  saveImportReceipt: async () => undefined,
  findEventIds: async () => new Set(),
});

export function renderWithLearningData(ui: ReactElement, options?: RenderOptions) {
  const repository = createTestLearningRepository();
  return render(
    <LearningDataReadyProvider userId="test-user" repository={repository} initialEvents={[]} initialSelectedTextbookId="pep4a">
      {ui}
    </LearningDataReadyProvider>,
    options,
  );
}
