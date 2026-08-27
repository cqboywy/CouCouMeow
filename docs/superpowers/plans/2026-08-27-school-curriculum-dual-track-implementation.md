# School Curriculum Dual-Track Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a simple school-first PEP Grade 4 Unit 1 learning path while keeping extracurricular animation content and progress visibly and technically separate.

**Architecture:** Introduce a focused curriculum content module and a versioned school-progress repository beside the existing animation repository. Compose the two tracks in the Motion home and growth screens without merging their events or completion counts, while reusing existing speech, button, surface, and responsive design primitives.

**Tech Stack:** React 19, TypeScript, Vitest, Testing Library, localStorage, Lucide React, existing CSS design tokens.

**Spec:** `docs/superpowers/specs/2026-08-27-school-curriculum-dual-track-design.md`

## Global Constraints

- Work only on `codex/school-curriculum-foundation`.
- Preserve the classic interface and all existing animation learning flows.
- Keep school and extracurricular content, completion, mistakes, review queues, and growth totals separate.
- The home screen has one primary task and one primary button.
- Mobile controls remain at least 44×44 CSS pixels and do not overflow horizontally.
- The first delivery contains only PEP Grade 4 Upper Unit 1 and six lessons.
- Use local structured content and versioned localStorage; do not add Supabase or new runtime dependencies.
- Follow TDD for each behavior change and commit after each independently testable task.

---

### Task 1: Curriculum Types and Unit 1 Content

**Files:**
- Create: `apps/web/src/curriculum/types.ts`
- Create: `apps/web/src/curriculum/pepGrade4UpperUnit1.ts`
- Create: `apps/web/src/curriculum/pepGrade4UpperUnit1.test.ts`

**Interfaces:**
- Produces: `CurriculumTextbook`, `CurriculumUnit`, `CurriculumLesson`, `SchoolExercise`, `SchoolLearningItem`.
- Produces: `pepGrade4Upper`, `pepGrade4UpperUnit1`, `getLessonById(lessonId: string)`.

- [ ] **Step 1: Write the failing content contract test**

```ts
expect(pepGrade4UpperUnit1.lessons).toHaveLength(6);
expect(pepGrade4UpperUnit1.lessons.map(item => item.sequence)).toEqual([1, 2, 3, 4, 5, 6]);
expect(pepGrade4UpperUnit1.objectives).toEqual(expect.arrayContaining([
  expect.objectContaining({ id: 'pep4a-u1-objective-jobs' }),
  expect.objectContaining({ id: 'pep4a-u1-objective-ch' }),
]));
for (const lesson of pepGrade4UpperUnit1.lessons) {
  expect(lesson.steps.map(step => step.kind)).toEqual(['learn', 'practice', 'check']);
  expect(lesson.pageReferences.length).toBeGreaterThan(0);
}
```

- [ ] **Step 2: Run the test and confirm imports fail**

Run: `pnpm --filter @coucoumeow/web test -- src/curriculum/pepGrade4UpperUnit1.test.ts`

Expected: FAIL because the curriculum module does not exist.

- [ ] **Step 3: Add focused curriculum types and the six Unit 1 lessons**

```ts
export type SchoolExercise = {
  id: string;
  kind: 'choice' | 'typing' | 'self_check';
  prompt: string;
  answer: string;
  options?: string[];
  hint: string;
  item?: SchoolLearningItem;
};

export type CurriculumLesson = {
  id: string;
  sequence: number;
  title: string;
  subtitle: string;
  pageReferences: number[];
  durationMinutes: number;
  concepts: string[];
  steps: Array<{ kind: 'learn' | 'practice' | 'check'; title: string }>;
  vocabulary: SchoolLearningItem[];
  sentences: SchoolLearningItem[];
  phonics: SchoolLearningItem[];
  explanation: string;
  exercises: SchoolExercise[];
};
```

Populate all six lessons with verified Unit 1 vocabulary, sentence patterns, phonics `ch`, reading, project, page references, and short practice/check exercises.

- [ ] **Step 4: Run the content contract test**

Expected: PASS with six ordered lessons and no empty exercise answers.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/curriculum
git commit -m "feat: add PEP unit one curriculum content"
```

---

### Task 2: Independent School Progress Repository

**Files:**
- Create: `apps/web/src/progress/schoolProgressRepository.ts`
- Create: `apps/web/src/progress/schoolProgressRepository.test.ts`
- Create: `apps/web/src/hooks/useSchoolProgress.ts`
- Create: `apps/web/src/hooks/useSchoolProgress.test.tsx`

**Interfaces:**
- Consumes: `SchoolLearningItem`, `CurriculumLesson` from Task 1.
- Produces: `SCHOOL_PROGRESS_STORAGE_KEY`, `createSchoolProgressRepository`, `SchoolProgressSummary`.
- Produces hook methods: `recordExercise`, `completeLesson`, `selectTextbook`, `resetCurrentLesson`.

- [ ] **Step 1: Write failing repository tests**

```ts
repo.recordExercise({ lessonId: 'pep4a-u1-l2', exerciseId: 'jobs-1', item: schoolWord, correct: false });
repo.completeLesson('pep4a-u1-l2', [schoolWord]);

expect(repo.getSummary().completedLessonIds).toContain('pep4a-u1-l2');
expect(repo.getSummary().reviewItems).toEqual([expect.objectContaining({ source: 'school' })]);
expect(memory.getItem(PROGRESS_STORAGE_KEY)).toBeNull();
```

Also assert that repeat completion does not duplicate lesson counts and invalid JSON returns an empty school record.

- [ ] **Step 2: Run tests and confirm the repository is missing**

Run: `pnpm --filter @coucoumeow/web test -- src/progress/schoolProgressRepository.test.ts`

Expected: FAIL because the school repository does not exist.

- [ ] **Step 3: Implement a separate versioned repository**

```ts
export const SCHOOL_PROGRESS_STORAGE_KEY = 'coucoumeow.school-progress.v1';

export type SchoolProgressSummary = {
  textbookId: string;
  completedLessonIds: string[];
  currentLessonId: string;
  practiceCount: number;
  masteredItems: SchoolMasteryItem[];
  reviewItems: SchoolReviewItem[];
  days: SchoolDailySummary[];
};
```

Use immutable local events with `source: 'school'`, `textbookId`, `unitId`, `lessonId`, `exerciseId`, correctness, and item snapshots. Never read or write the existing animation progress key.

- [ ] **Step 4: Add the hook and hook error-state test**

The hook refreshes its summary after each action and exposes the same gentle local-storage failure message near the active school task.

- [ ] **Step 5: Run repository and hook tests**

Expected: PASS; school and animation storage keys remain independent.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/progress/schoolProgressRepository* apps/web/src/hooks/useSchoolProgress*
git commit -m "feat: track school learning separately"
```

---

### Task 3: School Library and Unit Learning Flow

**Files:**
- Create: `apps/web/src/components/school/SchoolLibrary.tsx`
- Create: `apps/web/src/components/school/SchoolLesson.tsx`
- Create: `apps/web/src/components/school/SchoolLesson.test.tsx`
- Create: `apps/web/src/components/school/SchoolUnit.tsx`

**Interfaces:**
- Consumes: Unit 1 content and `useSchoolProgress` actions.
- Produces: `SchoolLibrary`, `SchoolUnit`, `SchoolLesson` components.
- `SchoolLesson` props include `lesson`, `onBack`, `onComplete`, `onRecordExercise`, and `storageError`.

- [ ] **Step 1: Write failing lesson-flow tests**

```tsx
render(<SchoolLesson lesson={lesson} onRecordExercise={record} onComplete={complete} onBack={back} storageError="" />);
expect(screen.getByRole('heading', { name: lesson.title })).toBeInTheDocument();
expect(screen.getByRole('button', { name: '开始练习' })).toBeInTheDocument();

fireEvent.click(screen.getByRole('button', { name: '开始练习' }));
fireEvent.click(screen.getByRole('button', { name: '检查答案' }));
expect(record).toHaveBeenCalledWith(expect.objectContaining({ lessonId: lesson.id }));
```

Add tests for one visible primary step, warm incorrect feedback, correct completion, and back navigation to the Unit page.

- [ ] **Step 2: Run the tests and confirm components are missing**

Expected: FAIL on missing imports.

- [ ] **Step 3: Build the three-step lesson component**

Show only one active step at a time: `学课本`, `练一练`, or `小检查`. Reuse `Surface`, `Button`, and `useEnglishSpeech`; render official page references as text such as `请打开课本第 4–5 页`.

- [ ] **Step 4: Build the textbook and Unit views**

`SchoolLibrary` shows only the current PEP Grade 4 Upper textbook card. `SchoolUnit` renders six vertical lesson cards with completed/current/locked visual states, without blocking review of completed lessons.

- [ ] **Step 5: Run component tests**

Expected: PASS, including keyboard-accessible buttons and local feedback.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/components/school
git commit -m "feat: add school unit learning flow"
```

---

### Task 4: Simple School-First Motion Home and Navigation

**Files:**
- Modify: `apps/web/src/App.tsx`
- Modify: `apps/web/src/MotionApp.test.tsx`
- Create: `apps/web/src/components/school/SchoolToday.tsx`

**Interfaces:**
- Consumes: `SchoolToday`, `SchoolLibrary`, `SchoolUnit`, `SchoolLesson`, school progress hook.
- Extends home sections to `today | school | extra | progress`.
- Extends application views with `school-unit | school-lesson` while retaining all animation views.

- [ ] **Step 1: Update Motion tests first**

Assert that the first screen contains one `开始校内学习` button, the current textbook label, no expanded six-lesson list, and navigation buttons named `校内同步`, `课外动画`, and `成长记录`. Assert `课外动画` still opens the existing Level bookshelf.

- [ ] **Step 2: Run Motion tests and confirm they fail against the animation-first home**

Expected: FAIL because the current home says `今天，一起走进英语故事` and `剧集书架`.

- [ ] **Step 3: Integrate school-first routing**

Keep `?ui=motion` as the experiment entry. The Motion first screen reads school content locally, starts the current school lesson with one primary action, and places the optional animation card after the school journey. The classic interface remains unchanged.

- [ ] **Step 4: Verify extracurricular regression paths**

The existing episode `open`, dictation, speaking, review deep links, and bookshelf behavior remain reachable under `课外动画`.

- [ ] **Step 5: Run Motion and existing App tests**

Run: `pnpm --filter @coucoumeow/web test -- src/MotionApp.test.tsx src/App.test.tsx`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/App.tsx apps/web/src/MotionApp.test.tsx apps/web/src/components/school/SchoolToday.tsx
git commit -m "feat: make school learning the primary track"
```

---

### Task 5: Separate School and Extracurricular Growth Views

**Files:**
- Create: `apps/web/src/components/progress/DualTrackGrowth.tsx`
- Create: `apps/web/src/components/progress/DualTrackGrowth.test.tsx`
- Modify: `apps/web/src/App.tsx`

**Interfaces:**
- Consumes: existing `GrowthSummary` as extracurricular summary and new `SchoolProgressSummary` as school summary.
- Produces three tabs: `校内成长`, `课外成长`, `学习总览`.
- Reuses `GrowthRecord` unchanged for detailed extracurricular history.

- [ ] **Step 1: Write failing dual-track tests**

```tsx
expect(screen.getByRole('tab', { name: '校内成长' })).toHaveAttribute('aria-selected', 'true');
expect(screen.getByText('已完成课时')).toBeInTheDocument();
expect(screen.queryByText('已学剧集')).not.toBeInTheDocument();

fireEvent.click(screen.getByRole('tab', { name: '课外成长' }));
expect(screen.getByText('已学剧集')).toBeInTheDocument();
```

Assert that overview renders two labeled cards and does not compute a combined total.

- [ ] **Step 2: Run the test and confirm the component is missing**

- [ ] **Step 3: Implement the tabbed growth view**

School detail shows completed lessons, mastered school items, school review items, and recent activity. Extra detail delegates to `GrowthRecord`. Overview remains a two-card comparison with at most four numbers visible per card.

- [ ] **Step 4: Integrate it into Motion home progress**

Review actions route to their own track: school review opens the lesson; animation review retains existing episode deep links.

- [ ] **Step 5: Run growth and repository tests**

Expected: PASS with no mixed counts.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/components/progress/DualTrackGrowth* apps/web/src/App.tsx
git commit -m "feat: separate school and animation growth"
```

---

### Task 6: Responsive Styling, Accessibility, and Full Verification

**Files:**
- Create: `apps/web/src/styles/school.css`
- Modify: `apps/web/src/styles/global.css`
- Modify: `apps/web/src/styles/motion-header-refinement.css`
- Modify: tests only where accessibility assertions expose a real regression.

**Interfaces:**
- Styles existing semantic school classes; adds no new JavaScript behavior.

- [ ] **Step 1: Add a failing semantic/layout assertion where needed**

Check that the mobile navigation has an accessible label, lesson tabs expose `aria-current` or `aria-selected`, and no school task relies only on color for state.

- [ ] **Step 2: Add school track styling**

Use existing tokens and typefaces. Keep one-column cards on phones, a maximum readable content width on iPad/desktop, 44px minimum controls, restrained school/extra color accents, and no dense dashboard grid.

- [ ] **Step 3: Run all frontend tests**

Run: `pnpm --filter @coucoumeow/web test -- --run`

Expected: all test files pass with zero failures.

- [ ] **Step 4: Run typecheck and production build**

Run: `pnpm --filter @coucoumeow/web typecheck`

Run: `pnpm --filter @coucoumeow/web build`

Expected: both exit 0.

- [ ] **Step 5: Visually verify the existing local preview**

Inspect `?ui=motion` at desktop, iPad portrait/landscape, and phone widths. Verify the first screen has one school action, the Unit page is not crowded, animation remains reachable, growth tabs are clear, and no sticky element blocks content.

- [ ] **Step 6: Commit the verified UI**

```bash
git add apps/web/src/styles apps/web/src
git commit -m "style: polish the dual-track learning experience"
```

---

### Task 7: Final Content and Regression Audit

**Files:**
- Modify only files with verified defects found during the audit.

**Interfaces:**
- No new interface; this task validates the complete Unit 1 delivery.

- [ ] **Step 1: Check the spec requirement list against the running product**

Confirm six lessons, school-first home, separate storage and growth, optional animation recommendation, refresh persistence, mobile simplicity, and unchanged extracurricular practice.

- [ ] **Step 2: Run the full frontend verification again after any fix**

Run: `pnpm --filter @coucoumeow/web test -- --run`

Run: `pnpm --filter @coucoumeow/web build`

Expected: zero test failures and build exit 0.

- [ ] **Step 3: Confirm git scope**

Run: `git status --short` and `git diff --stat codex/motion-growth-foundation...HEAD`.

Expected: only the dual-track feature, its content, tests, styles, plan, and spec differ from the preserved source branch.

- [ ] **Step 4: Commit final verified fixes if present**

```bash
git add apps/web/src
git commit -m "fix: complete the school curriculum pilot"
```
