# School Learning Mainline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make PEP Grade 4 Upper school learning a complete daily path through Unit 2, with separate school growth and optional extracurricular recommendations.

**Architecture:** Extend curriculum exercises with an explicit stage and render one question at a time in `SchoolLesson`. Keep textbook units in the existing curriculum data source, expose unit-level growth from the existing school repository, and use a small static map for optional animation recommendations.

**Tech Stack:** React, TypeScript, Vitest, Testing Library, browser localStorage, existing CSS.

**Spec:** `docs/superpowers/specs/2026-08-28-school-learning-mainline-design.md`

## Global Constraints

- Work only on `codex/school-curriculum-foundation`; do not modify the old motion branch.
- Do not add animations, gradients, network dependencies, or cloud persistence.
- Keep school and extracurricular localStorage repositories separate.
- Use one-column responsive layouts with 44px minimum interactive controls.

---

### Task 1: Staged Unit 1 exercises

**Files:**
- Modify: `apps/web/src/curriculum/types.ts`, `apps/web/src/curriculum/pepGrade4UpperUnit1.ts`, `apps/web/src/components/school/SchoolLesson.tsx`
- Test: `apps/web/src/components/school/SchoolLesson.test.tsx`

**Interfaces:**
- Produces `SchoolExercise.stage: 'practice' | 'check'`.
- `SchoolLesson` renders a question list filtered by the active stage and calls `onRecordExercise` once per submitted question.

- [ ] **Step 1: Write the failing stage-completion test**

```tsx
expect(screen.getByText('第 1 / 2 题')).toBeInTheDocument();
// answer the first practice question correctly
expect(screen.getByText('第 2 / 2 题')).toBeInTheDocument();
```

- [ ] **Step 2: Run the SchoolLesson test and verify it fails because staged question progress is absent.**

Run: `pnpm --filter @coucoumeow/web test -- --run src/components/school/SchoolLesson.test.tsx`

- [ ] **Step 3: Add `stage`, two questions per stage, and a stage-local question index.**

```ts
const stageExercises = lesson.exercises.filter(item => item.stage === activeStage);
const exercise = stageExercises[questionIndex];
```

- [ ] **Step 4: Re-run the SchoolLesson test and verify it passes.**

- [ ] **Step 5: Commit the staged exercise path.**

### Task 2: Unit 2 curriculum and textbook library

**Files:**
- Modify: `apps/web/src/curriculum/pepGrade4UpperUnit1.ts`, `apps/web/src/components/school/SchoolLibrary.tsx`, `apps/web/src/hooks/useSchoolProgress.ts`
- Test: `apps/web/src/curriculum/pepGrade4UpperUnit1.test.ts`, `apps/web/src/components/school/SchoolLibrary.test.tsx`

**Interfaces:**
- Produces `pepGrade4Upper.units` containing Unit 1 and Unit 2.
- `SchoolLibrary` renders a selectable Unit card and its six lesson actions.

- [ ] **Step 1: Write failing tests for Unit 2 title, six lessons, and its first lesson card.**

```ts
expect(pepGrade4Upper.units.map(unit => unit.title)).toContain('My friends');
expect(unit2.lessons).toHaveLength(6);
```

- [ ] **Step 2: Run the curriculum and library tests and verify Unit 2 is missing.**

- [ ] **Step 3: Add Unit 2 content from textbook pages 14-25 and show both units in the library.**

- [ ] **Step 4: Re-run the targeted tests and verify they pass.**

- [ ] **Step 5: Commit Unit 2 content and library navigation.**

### Task 3: Detailed school growth and animation associations

**Files:**
- Create: `apps/web/src/curriculum/extraRecommendations.ts`
- Modify: `apps/web/src/components/progress/DualTrackGrowth.tsx`, `apps/web/src/components/school/SchoolLibrary.tsx`, `apps/web/src/App.tsx`
- Test: `apps/web/src/components/progress/DualTrackGrowth.test.tsx`, `apps/web/src/curriculum/extraRecommendations.test.ts`

**Interfaces:**
- `getExtraRecommendation(unitId)` returns `{ episodeId, label, reason } | undefined`.
- School growth displays completed lessons grouped under their unit title and deep-links only to the separate extracurricular shelf.

- [ ] **Step 1: Write failing tests for Unit 1 and Unit 2 recommendations and a Unit-labelled school growth collection.**

```ts
expect(getExtraRecommendation('pep4a-u2')?.episodeId).toBe('l1-bat-and-friends-002-lost-in-the-rain');
expect(screen.getByText('Unit 1 · Helping at home')).toBeInTheDocument();
```

- [ ] **Step 2: Run targeted tests and verify the recommendation module and unit labels are absent.**

- [ ] **Step 3: Implement static recommendations, unit-labelled growth cards, and a callback that opens the extracurricular shelf.**

- [ ] **Step 4: Re-run targeted tests and verify they pass.**

- [ ] **Step 5: Commit growth detail and recommendations.**

### Task 4: Responsive device verification

**Files:**
- Modify only if a measured overflow or unreadable control is found.
- Test: existing `MotionApp.test.tsx` and browser responsive checks.

- [ ] **Step 1: Run complete tests, typecheck, build, and `git diff --check`.**
- [ ] **Step 2: Inspect 390×844, 768×1024, and 1024×768 preview layouts; confirm `scrollWidth === clientWidth`.**
- [ ] **Step 3: Verify school practice, check, Unit 2 library, and recommended animation navigation in the browser.**
- [ ] **Step 4: Commit only measured CSS corrections, if any.**
