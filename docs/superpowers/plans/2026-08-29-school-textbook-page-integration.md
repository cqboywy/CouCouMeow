# 校内同步逐页学习整合 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the school lesson-first flow with a concise unit route and reusable textbook-page learning flow, starting with Unit 1 printed pages 3 and 4.

**Architecture:** Keep the existing PEP textbook and local school-progress boundary, but add page-first curriculum entities and versioned page progress. `SchoolLibrary` becomes the unit route; a focused `SchoolTextbookPage` renders source text, contextual focus hints, speaking, practice, check, and page completion. Existing lesson links resolve to their first matching textbook page so existing internal entry points stay usable.

**Tech Stack:** React 18, TypeScript, Vitest + Testing Library, browser Web Speech API, browser `localStorage`, existing CSS design tokens and lucide-react.

**Spec:** `docs/superpowers/specs/2026-08-29-school-textbook-page-integration-design.md`

## Global Constraints

- Keep school and extracurricular records, review queues, completion totals, and localStorage keys isolated.
- Use PDF printed page numbers, not PDF viewer indices, in child-facing copy and page IDs.
- Preserve `?ui=motion`; do not change the classic interface or animation learning path.
- Maintain 44px controls, phone/iPad layouts, non-colour-only progress states, and no sticky element that hides reading content.
- English speech ignores expected `canceled` and `interrupted` callbacks when switching sentences.
- Add no server or third-party dependency.

---

## File Structure

- `apps/web/src/curriculum/types.ts`: page-first types.
- `apps/web/src/curriculum/pepGrade4UpperTextbookPages.ts`: Unit 1 pages 3 and 4.
- `apps/web/src/progress/schoolProgressRepository.ts`: page records and v1 compatibility.
- `apps/web/src/hooks/useSchoolProgress.ts`: page actions.
- `apps/web/src/components/school/SchoolLibrary.tsx` and `SchoolUnit.tsx`: concise page route.
- `apps/web/src/components/school/SchoolTextbookPage.tsx`: reader and practice/check flow.
- `apps/web/src/App.tsx`: school-page routing and legacy redirects.
- `apps/web/src/components/progress/DualTrackGrowth.tsx`: page-aware school growth.
- Matching `.test.ts` / `.test.tsx` files and `apps/web/src/styles/school.css`.

### Task 1: Define verified page-first Unit 1 content

**Files:**
- Modify: `apps/web/src/curriculum/types.ts`
- Create: `apps/web/src/curriculum/pepGrade4UpperTextbookPages.ts`
- Create: `apps/web/src/curriculum/pepGrade4UpperTextbookPages.test.ts`

**Interfaces:**
- Produce `TextbookPage`, `TextbookPageSection`, `TextbookFocusItem`, `TextbookPagePracticePrompt`, and `TextbookPageCheck`.
- Produce `getTextbookPageById(pageId)`, `getUnitTextbookPages(unitId)`, and `getNextTextbookPage(pageId)`.

- [ ] **Step 1: Write the failing content tests**

```ts
it('orders Unit 1 by printed page and routes page 3 to page 4', () => {
  expect(getUnitTextbookPages('pep4a-u1').map(page => page.printedPage)).toEqual([3, 4]);
  expect(getNextTextbookPage('pep4a-u1-p3')?.id).toBe('pep4a-u1-p4');
});

it('keeps source text and appendix-backed focus sources', () => {
  expect(getTextbookPageById('pep4a-u1-p3')!.focusItems)
    .toEqual(expect.arrayContaining([expect.objectContaining({ english: 'children', source: 'appendix-word' })]));
});
```

- [ ] **Step 2: Run it and confirm failure**

Run: `pnpm --filter @coucoumeow/web test -- --run src/curriculum/pepGrade4UpperTextbookPages.test.ts`

Expected: FAIL because the page module and page-first types do not exist.

- [ ] **Step 3: Add minimal page-first types and records**

```ts
export type TextbookFocusSource = 'body' | 'appendix-word' | 'appendix-vocabulary' | 'appendix-expression';
export type TextbookPage = {
  id: string; textbookId: string; unitId: string; printedPage: number;
  title: string; chineseTitle: string; sections: TextbookPageSection[];
  focusItems: TextbookFocusItem[]; practicePrompts: TextbookPagePracticePrompt[];
  checks: TextbookPageCheck[];
};
```

Use the verified page 3 `Look and think / Listen and chant / Listen and sing` and page 4 `Let's talk / Draw and say` text from the prototypes. Give sentences stable IDs. Only attach Appendix 2/3/4 sources when verified; otherwise use `body`.

- [ ] **Step 4: Run tests and commit**

Run: `pnpm --filter @coucoumeow/web test -- --run src/curriculum/pepGrade4UpperTextbookPages.test.ts`

Expected: PASS.

```bash
git add apps/web/src/curriculum/types.ts apps/web/src/curriculum/pepGrade4UpperTextbookPages.ts apps/web/src/curriculum/pepGrade4UpperTextbookPages.test.ts
git commit -m "feat: add Unit 1 textbook page content"
```

### Task 2: Add versioned textbook-page progress

**Files:**
- Modify: `apps/web/src/progress/schoolProgressRepository.ts`
- Modify: `apps/web/src/progress/schoolProgressRepository.test.ts`
- Modify: `apps/web/src/hooks/useSchoolProgress.ts`

**Interfaces:**
- Extend summary with `completedPageIds`, `currentPageId`, and `laterReviewItems`.
- Add `completePage(pageId, masteredItems)`, `recordPageCheck(pageId, checkId, item, correct)`, `addLaterReview(pageId, item)`, and `resolveLaterReview(pageId, itemId)`.
- Retain `completeLesson` and `recordExercise` for legacy routes.

- [ ] **Step 1: Write a failing page-progress test**

```ts
repo.addLaterReview('pep4a-u1-p3', schoolWord);
repo.completePage('pep4a-u1-p3', [schoolWord]);
expect(repo.getSummary()).toMatchObject({
  completedPageIds: ['pep4a-u1-p3'],
  currentPageId: 'pep4a-u1-p4',
  laterReviewItems: [expect.objectContaining({ pageId: 'pep4a-u1-p3', id: schoolWord.id })],
});
expect(storage.getItem('coucoumeow.progress.v1')).toBeNull();
```

- [ ] **Step 2: Run it and confirm failure**

Run: `pnpm --filter @coucoumeow/web test -- --run src/progress/schoolProgressRepository.test.ts`

Expected: FAIL because page actions and fields do not exist.

- [ ] **Step 3: Implement compatible events**

Add `page_completed`, `page_check`, `later_review_added`, and `later_review_resolved`. On read, accept v1 lesson events and map completed lessons to their first available printed page. Keep `coucoumeow.school-progress.v1` and never read/write extracurricular storage.

- [ ] **Step 4: Expose hook methods, verify, and commit**

```ts
completePage: (page) => update(() => repository.current.completePage(page.id, page.focusItems)),
recordPageCheck: (page, check, correct) => update(() => repository.current.recordPageCheck(page.id, check.id, check.item, correct)),
addLaterReview: (page, item) => update(() => repository.current.addLaterReview(page.id, item)),
```

Run: `pnpm --filter @coucoumeow/web test -- --run src/progress/schoolProgressRepository.test.ts src/components/progress/DualTrackGrowth.test.tsx`

Expected: PASS.

```bash
git add apps/web/src/progress/schoolProgressRepository.ts apps/web/src/progress/schoolProgressRepository.test.ts apps/web/src/hooks/useSchoolProgress.ts
git commit -m "feat: track textbook page progress locally"
```

### Task 3: Build the reusable textbook-page reader

**Files:**
- Create: `apps/web/src/components/school/SchoolTextbookPage.tsx`
- Create: `apps/web/src/components/school/SchoolTextbookPage.test.tsx`
- Modify: `apps/web/src/styles/school.css`

**Interfaces:**
- Consume one `TextbookPage` and `useEnglishSpeech`.
- Receive `onRecordCheck`, `onComplete`, `onLaterReview`, `onResolveReview`, `onBack`, and `onOpenNext`.

- [ ] **Step 1: Write failing interaction tests**

```tsx
await user.click(screen.getByRole('button', { name: '查看 children 提示' }));
expect(screen.getByTestId('page-3-section-look-and-think')).toContainElement(screen.getByText(/children · 儿童/));

await user.click(screen.getByRole('button', { name: '显示中文' }));
expect(screen.getByText('这些孩子怎么在家帮忙？')).toBeVisible();
expect(screen.queryByRole('button', { name: '完成本页' })).not.toBeInTheDocument();
```

- [ ] **Step 2: Run it and confirm failure**

Run: `pnpm --filter @coucoumeow/web test -- --run src/components/school/SchoolTextbookPage.test.tsx`

Expected: FAIL because the page component does not exist.

- [ ] **Step 3: Implement reading and voice behavior**

Render source sections in order. Each sentence has an accessible speaker button and optional focus chips. Render exactly one focus detail directly below the selected sentence, never in a page-top summary. Use one `useEnglishSpeech` instance per page to warm English voices and suppress ordinary interruption/cancel signals.

- [ ] **Step 4: Implement practice, review, and page check**

Randomly present a Chinese-to-English prompt. Support answer reveal, `我会了`, and `稍后再学`. Render 2–4 page checks after practice. Correct completion of all checks is required before `完成本页` appears; wrong attempts record a reviewable item and show the hint.

- [ ] **Step 5: Add constrained responsive CSS, verify, and commit**

Use a readable maximum width, 44px controls, `aria-pressed` toggles, and bottom safe-area padding for the fixed Chinese control.

Run: `pnpm --filter @coucoumeow/web test -- --run src/components/school/SchoolTextbookPage.test.tsx`

Expected: PASS.

```bash
git add apps/web/src/components/school/SchoolTextbookPage.tsx apps/web/src/components/school/SchoolTextbookPage.test.tsx apps/web/src/styles/school.css
git commit -m "feat: add reusable textbook page learning flow"
```

### Task 4: Replace lesson cards with a concise page route

**Files:**
- Modify: `apps/web/src/components/school/SchoolLibrary.tsx`
- Modify: `apps/web/src/components/school/SchoolUnit.tsx`
- Modify: `apps/web/src/components/school/SchoolToday.tsx`
- Modify: `apps/web/src/components/school/SchoolLibrary.test.tsx`
- Modify: `apps/web/src/MotionApp.test.tsx`
- Modify: `apps/web/src/styles/school.css`

**Interfaces:**
- `SchoolLibrary` receives `completedPageIds`, `currentPageId`, `laterReviewCount`, and `onOpenPage(page)`.
- `SchoolUnit` lists `TextbookPage[]`, not `CurriculumLesson[]`.

- [ ] **Step 1: Write a failing route test**

```tsx
await user.click(screen.getByRole('button', { name: '校内同步' }));
expect(screen.getByRole('button', { name: /继续学习.*第 3 页/ })).toBeInTheDocument();
expect(screen.queryByText('三步完成今天的校内任务')).not.toBeInTheDocument();
```

- [ ] **Step 2: Run it and confirm failure**

Run: `pnpm --filter @coucoumeow/web test -- --run src/components/school/SchoolLibrary.test.tsx src/MotionApp.test.tsx`

Expected: FAIL because the current UI counts lessons and renders three task stages.

- [ ] **Step 3: Implement sparse page navigation**

Show the current textbook, one selected real-content unit, two small metrics, one primary continue button, and a vertical route. Every row includes printed page, title, and text state: `已完成` / `正在学习` / `可以学习`. Retain one clearly-secondary `课外` recommendation. Do not expose empty units as selectable tabs.

- [ ] **Step 4: Simplify Today and verify**

Remove the three-stage task tray. `SchoolToday` shows the current textbook page and one `开始学习` / `继续学习` control.

Run: `pnpm --filter @coucoumeow/web test -- --run src/components/school/SchoolLibrary.test.tsx src/MotionApp.test.tsx`

Expected: PASS.

```bash
git add apps/web/src/components/school/SchoolLibrary.tsx apps/web/src/components/school/SchoolUnit.tsx apps/web/src/components/school/SchoolToday.tsx apps/web/src/components/school/SchoolLibrary.test.tsx apps/web/src/MotionApp.test.tsx apps/web/src/styles/school.css
git commit -m "feat: make school unit navigation page-first"
```

### Task 5: Integrate routing and page-aware growth

**Files:**
- Modify: `apps/web/src/App.tsx`
- Modify: `apps/web/src/components/progress/DualTrackGrowth.tsx`
- Modify: `apps/web/src/components/progress/DualTrackGrowth.test.tsx`
- Modify: `apps/web/src/components/school/SchoolLesson.tsx`
- Modify: `apps/web/src/components/school/SchoolLesson.test.tsx`

**Interfaces:**
- Add `school-page` view with selected `TextbookPage`.
- Existing `openSchoolLesson(lesson)` resolves to a matching textbook page first; `SchoolLesson` is a compatibility fallback only.
- Growth labels pages as `Unit 1 · 第 3 页` and routes later-review actions back to the source page.

- [ ] **Step 1: Write a failing app test**

```tsx
await user.click(screen.getByRole('button', { name: /继续学习.*第 3 页/ }));
expect(screen.getByRole('heading', { name: '一起在家帮忙' })).toBeInTheDocument();
await user.click(screen.getByRole('button', { name: /回到 Unit 1/ }));
expect(screen.getByText('课本页面')).toBeInTheDocument();
```

- [ ] **Step 2: Run it and confirm failure**

Run: `pnpm --filter @coucoumeow/web test -- --run src/MotionApp.test.tsx src/components/progress/DualTrackGrowth.test.tsx`

Expected: FAIL because `school-page` routing and page labels do not exist.

- [ ] **Step 3: Implement routing and legacy-safe redirects**

Add selected-page state and callbacks. Resolve any old Unit 1 lesson entry to the first matching printed page; retain `SchoolLesson` only for uncurated content. Update school growth detail to show completed pages, focus items, and later-review actions without mixing them into extracurricular statistics.

- [ ] **Step 4: Verify all regression paths**

Run: `pnpm --filter @coucoumeow/web test -- --run`

Expected: PASS.

Run: `pnpm build:web`

Expected: PASS.

- [ ] **Step 5: Browser acceptance checks**

At `http://127.0.0.1:5174/?ui=motion`, verify desktop, iPad portrait, and phone widths. Confirm one school continue action, readable page 3/4 text, inline focus help, a visible Chinese switch that does not cover checks, speaking status near the page, school/extra navigation, refresh persistence, and unchanged extracurricular path.

- [ ] **Step 6: Commit integration**

```bash
git add apps/web/src/App.tsx apps/web/src/components/progress/DualTrackGrowth.tsx apps/web/src/components/progress/DualTrackGrowth.test.tsx apps/web/src/components/school/SchoolLesson.tsx apps/web/src/components/school/SchoolLesson.test.tsx
git commit -m "feat: integrate textbook pages into school learning"
```

## Plan Self-Review

- Spec coverage: content, page-first progress, contextual Chinese/help/speech, practice/check/review, concise unit navigation, compatibility routing, separate growth, and responsive browser verification are covered by Tasks 1–5.
- Placeholder scan: no task defers implementation. Pages after page 4 remain intentionally outside this implementation and are added only through `$textbook-page-curation`.
- Type consistency: `TextbookPage` is created in Task 1, stored by `pageId` in Task 2, rendered in Task 3, listed in Task 4, and routed in Task 5.
