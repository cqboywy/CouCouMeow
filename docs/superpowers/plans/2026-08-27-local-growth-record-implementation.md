# Local Growth Record Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build browser-local learning records and a drill-down growth record for words, sentences, patterns, and episodes.

**Architecture:** A versioned `ProgressRepository` persists immutable events in `localStorage` and derives mastery items and daily summaries. A React hook exposes the repository to the current learning screens. Existing APIs still judge answers; local events own visible progress.

**Tech Stack:** React 19, TypeScript, Vitest, Testing Library, browser `localStorage`, existing Lucide icons and CSS tokens.

**Spec:** `docs/superpowers/specs/2026-08-27-local-growth-record-design.md`

## Global Constraints

- Persist only in the current browser; do not add Supabase, login persistence, or dependencies.
- Only explicit learning actions count as mastered; viewing or playing content does not.
- Keep copy child-friendly and non-competitive; use existing Motion tokens without gradients or new animation.
- Every new flow needs an observable-behaviour test, then full web test, typecheck, and build verification.

---

## File Structure

- Create `apps/web/src/progress/types.ts` for event, mastery, summary, and repository types.
- Create `apps/web/src/progress/localProgressRepository.ts` for versioned persistence and derived summaries.
- Create `apps/web/src/progress/localProgressRepository.test.ts` for storage and deduplication tests.
- Create `apps/web/src/hooks/useLearningProgress.ts` and `apps/web/src/hooks/useLearningProgress.test.tsx` for React integration.
- Create `apps/web/src/components/progress/GrowthRecord.tsx` and `apps/web/src/components/progress/GrowthRecord.test.tsx` for the progress UI.
- Modify `apps/web/src/App.tsx`, `apps/web/src/App.test.tsx`, `apps/web/src/MotionApp.test.tsx`, `apps/web/src/styles/global.css`, and `apps/web/src/styles/motion.css`.

### Task 1: Create the versioned local progress repository

**Files:** Create `apps/web/src/progress/types.ts`, `apps/web/src/progress/localProgressRepository.ts`, and `apps/web/src/progress/localProgressRepository.test.ts`.

**Interfaces:** `createLocalProgressRepository(storage: Storage, now: () => Date)` returns `recordPractice(item, correct, method)`, `markMastered(item)`, and `getSummary()`.

- [ ] **Step 1: Write the failing tests**

```ts
it('keeps a second correct word answer as practice, not a new word', () => {
  const repo = createLocalProgressRepository(localStorage, () => new Date('2026-08-27T09:00:00'));
  repo.recordPractice(word, true, 'written');
  repo.recordPractice(word, true, 'written');
  expect(repo.getSummary().today.newWords).toHaveLength(1);
  expect(repo.getSummary().items.words[0]).toMatchObject({ correctCount: 2, totalPracticeCount: 2 });
});
```

- [ ] **Step 2: Verify RED** — Run `pnpm --filter @coucoumeow/web test -- --run src/progress/localProgressRepository.test.ts`; expect failure because the module does not exist.

- [ ] **Step 3: Implement the storage contract**

```ts
export type MasteryKind = 'word' | 'sentence' | 'pattern' | 'episode';
export type LearningItem = { id: string; kind: MasteryKind; english: string; chinese: string; episodeId: string };
export const PROGRESS_STORAGE_KEY = 'coucoumeow.learning-progress.v1';
```

Append immutable events; derive one mastery item per content ID; calculate local `YYYY-MM-DD`; use an empty record if JSON is malformed; turn `setItem` failures into a caught repository error.

- [ ] **Step 4: Verify GREEN** — Run the Task 1 test command; expect duplicate mastery not to increase new items and malformed data not to throw.

- [ ] **Step 5: Commit** — `git add apps/web/src/progress && git commit -m "feat: add local learning progress repository"`.

### Task 2: Expose local progress through a React hook

**Files:** Create `apps/web/src/hooks/useLearningProgress.ts` and `apps/web/src/hooks/useLearningProgress.test.tsx`.

**Interfaces:** Consumes Task 1 and produces `{ summary, storageError, recordDictation, recordSentence, markPattern, markEpisode }`.

- [ ] **Step 1: Write the failing hook test**

```tsx
it('updates today after a correct dictation result', () => {
  const { result } = renderHook(() => useLearningProgress());
  act(() => result.current.recordDictation(vocab, 'episode-1', true, 'written'));
  expect(result.current.summary.today.newWords[0]?.english).toBe('park');
});
```

- [ ] **Step 2: Verify RED** — Run `pnpm --filter @coucoumeow/web test -- --run src/hooks/useLearningProgress.test.tsx`; expect missing-hook failure.

- [ ] **Step 3: Implement the hook** — Keep the repository in `useRef`, refresh summary after every record, and expose `这次学习还没有记进成长记录，请检查浏览器存储空间后再试。` when a local write fails.

- [ ] **Step 4: Verify GREEN and commit** — Run the Task 2 test command, then `git add apps/web/src/hooks/useLearningProgress* && git commit -m "feat: expose local learning progress hook"`.

### Task 3: Record the current learning actions

**Files:** Modify `apps/web/src/App.tsx` and `apps/web/src/App.test.tsx`.

**Interfaces:** App creates the hook; `Dictation`, `Speaking`, `Content`, and `Learning` receive typed progress callbacks.

- [ ] **Step 1: Write failing integration tests**

```tsx
it('shows a correct dictation word in growth details', async () => {
  render(<App />);
  await submitDictation('park');
  fireEvent.click(screen.getByRole('button', { name: '成长记录' }));
  fireEvent.click(screen.getByRole('tab', { name: '单词' }));
  expect(screen.getByText('park')).toBeInTheDocument();
});
```

- [ ] **Step 2: Verify RED** — Run `pnpm --filter @coucoumeow/web test -- --run src/App.test.tsx`; expect no local record.

- [ ] **Step 3: Implement all explicit rules** — Correct dictation creates word mastery; correct or manually corrected speaking creates sentence mastery; add an accessible `收下句式：{title}` button inside each knowledge card for pattern mastery; only a successful `/learned` response marks an episode. Every attempt also updates practice counts.

- [ ] **Step 4: Verify GREEN and commit** — Run the Task 3 test command, then `git add apps/web/src/App.tsx apps/web/src/App.test.tsx && git commit -m "feat: record local learning mastery"`.

### Task 4: Build the drill-down growth record

**Files:** Create `apps/web/src/components/progress/GrowthRecord.tsx` and test; modify `apps/web/src/App.tsx`.

**Interfaces:** `GrowthRecord` accepts `summary` and `onStartLearning`; it renders overview totals, date selection, and category details.

- [ ] **Step 1: Write failing component tests**

```tsx
it('changes daily detail after selecting another active day', () => {
  render(<GrowthRecord summary={summaryWithTwoDays} onStartLearning={vi.fn()} />);
  fireEvent.click(screen.getByRole('tab', { name: '查看 2026-08-26 的学习' }));
  expect(screen.getByText('wet')).toBeInTheDocument();
  expect(screen.queryByText('park')).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Verify RED** — Run `pnpm --filter @coucoumeow/web test -- --run src/components/progress/GrowthRecord.test.tsx`; expect missing-component failure.

- [ ] **Step 3: Implement the UI** — Render clickable total cards, a seven-day labelled `tablist`, an `aria-live` selected-day detail, and a `学习收藏分类` tablist for 单词、句子、句式、已完成剧集. Each row shows title, supporting text, first learned day, latest practice day, and gentle familiarity label. Empty states provide `开始今天的学习`.

- [ ] **Step 4: Replace both static home progress sections, verify GREEN, and commit** — Run the Task 4 test command, then `git add apps/web/src/components/progress apps/web/src/App.tsx && git commit -m "feat: add local growth record details"`.

### Task 5: Style responsive growth details and run acceptance checks

**Files:** Modify `apps/web/src/styles/global.css`, `apps/web/src/styles/motion.css`, and `apps/web/src/MotionApp.test.tsx`.

- [ ] **Step 1: Write the failing motion entry test**

```tsx
it('opens local growth details from motion navigation', async () => {
  window.history.replaceState(null, '', '/?ui=motion');
  render(<App />);
  fireEvent.click(await screen.findByRole('button', { name: '成长记录' }));
  expect(screen.getByRole('tablist', { name: '学习收藏分类' })).toBeInTheDocument();
});
```

- [ ] **Step 2: Verify RED** — Run `pnpm --filter @coucoumeow/web test -- --run src/MotionApp.test.tsx`; expect progress details to be absent.

- [ ] **Step 3: Implement CSS** — Use seven equal date buttons, 48px touch targets, filter overflow protection, long-sentence wrapping, and narrow single-column layout. Use only existing cream, coral, sky, butter, and ink tokens.

- [ ] **Step 4: Verify all checks** — Run `pnpm --filter @coucoumeow/web test -- --run`, `pnpm --filter @coucoumeow/web typecheck`, and `pnpm --filter @coucoumeow/web build`; expect all exit successfully.

- [ ] **Step 5: Browser acceptance and commit** — At tablet and phone widths, complete a word, corrected sentence, pattern, and episode; refresh; select an earlier active day; open all four filters; confirm the same items remain visible and no header overlays content. Then run `git add apps/web/src/styles apps/web/src/MotionApp.test.tsx && git commit -m "feat: style responsive growth record"`.

## Plan Self-Review

- Tasks 1–2 cover local versioning, corruption recovery, repository boundaries, and action-local persistence errors.
- Task 3 covers all four explicit mastery rules without treating views as learning.
- Task 4 covers daily change, seven-day drill-down, specific collections, and empty states.
- Task 5 covers responsive styling, Motion entry, reload persistence, and full validation.
