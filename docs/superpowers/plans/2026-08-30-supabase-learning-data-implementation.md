# Supabase Learning Data Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace browser-local learning persistence with an authenticated Supabase event repository while importing existing browser progress exactly once.

**Architecture:** Keep the existing school and extracurricular event semantics, extract summary derivation into pure functions, and place an asynchronous repository behind a React provider. Supabase is the only runtime store; localStorage is read only by the one-time legacy importer.

**Tech Stack:** React 19, TypeScript 5, Vite 7, Vitest, `@supabase/supabase-js` 2.x, PostgreSQL/Supabase Auth/RLS, pgTAP, Python static SQL contract tests.

**Spec:** `docs/superpowers/specs/2026-08-30-supabase-learning-data-design.md`

## Global Constraints

- Work only on `codex/supabase-migration-rebuild`, based on `8cbcbcd`; do not modify `main`, push, or deploy.
- Supabase is the only runtime persistence store; localStorage is read only for legacy import.
- Use automatic Supabase anonymous sign-in and isolate every row with `auth.uid()` RLS.
- Read `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` only from the environment; never commit real credentials.
- Preserve existing UI, school/extra track separation, summary semantics, stable content IDs, and legacy event UUIDs.
- Keep curriculum content in TypeScript; do not build a course CMS.

---

### Task 1: Database event ledger and RLS

**Files:**
- Create: `supabase/migrations/20260830000100_online_learning_progress.sql`
- Create: `supabase/tests/003_online_learning_progress.test.sql`
- Modify: `supabase/tests/test_static_contract.py`

**Interfaces:**
- Produces: `public.learning_events`, `public.learner_preferences`, `public.local_progress_imports`, `public.learning_track`, and `public.learning_event_type` for authenticated clients.
- Security contract: authenticated users can select/insert/delete only rows where `user_id = auth.uid()`; event updates are not granted.

- [ ] **Step 1: Add failing static and pgTAP contract assertions**

Add assertions that the migration declares both enums, all three tables, JSON-object payload checks, owner indexes, RLS enablement, owner policies, authenticated grants, and no authenticated update grant on `learning_events`. Add pgTAP fixtures for two authenticated users and assert that each sees only their own event, preference, and import receipt.

- [ ] **Step 2: Run the static contract to verify failure**

Run: `PYTHONDONTWRITEBYTECODE=1 python3 -m unittest supabase.tests.test_static_contract -v`

Expected: FAIL because `20260830000100_online_learning_progress.sql` and its required declarations do not exist.

- [ ] **Step 3: Implement the migration**

Create enums with the exact values from the spec. Define the event ledger using this envelope:

```sql
create table public.learning_events (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  track public.learning_track not null,
  event_type public.learning_event_type not null,
  occurred_at timestamptz not null,
  local_day date not null,
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  created_at timestamptz not null default now()
);
```

Add owner-scoped preferences and import receipts, indexes, grants, RLS, `auth.uid()` select/insert/delete policies for events, and select/insert/update/delete owner policies for preferences and receipts. Do not grant event update.

- [ ] **Step 4: Run database contract tests**

Run: `PYTHONDONTWRITEBYTECODE=1 python3 -m unittest supabase.tests.test_static_contract -v`

Expected: PASS. If a local Supabase stack is available, also run `supabase test db`; otherwise document that pgTAP remains pending real PostgreSQL execution.

- [ ] **Step 5: Commit the database contract**

```bash
git add supabase/migrations/20260830000100_online_learning_progress.sql supabase/tests/003_online_learning_progress.test.sql supabase/tests/test_static_contract.py
git commit -m "feat: add online learning event schema"
```

### Task 2: Shared event types and pure summary derivation

**Files:**
- Create: `apps/web/src/progress/learningEvents.ts`
- Create: `apps/web/src/progress/extraProgressSummary.ts`
- Create: `apps/web/src/progress/schoolProgressSummary.ts`
- Create: `apps/web/src/progress/extraProgressSummary.test.ts`
- Create: `apps/web/src/progress/schoolProgressSummary.test.ts`
- Modify: `apps/web/src/progress/localProgressRepository.ts`
- Modify: `apps/web/src/progress/schoolProgressRepository.ts`

**Interfaces:**
- Produces: `LearningEventEnvelope`, `ExtraLearningEvent`, `SchoolLearningEvent`, `deriveExtraProgress(events, today)`, and `deriveSchoolProgress(events, selectedTextbookId)`.
- Preserves: `GrowthSummary`, `SchoolProgressSummary`, `LearningItem`, `PracticeMethod`, and all existing summary field names consumed by UI components.

- [ ] **Step 1: Write failing pure-derivation tests**

Cover repeated correct practice producing one mastery, latest incorrect practice entering review, completed school lesson/page IDs, current page selection, Unit 2/3 location, later-review add/resolve, daily counts, and damaged/irrelevant track events being excluded by type.

- [ ] **Step 2: Run focused tests to verify failure**

Run: `pnpm --filter @coucoumeow/web test -- --run src/progress/extraProgressSummary.test.ts src/progress/schoolProgressSummary.test.ts`

Expected: FAIL because the pure modules do not exist.

- [ ] **Step 3: Extract event unions and summary reducers**

Use an envelope whose serialized form matches the database:

```ts
export type LearningEventEnvelope<T extends LearningTrack, P> = {
  id: string;
  userId: string;
  track: T;
  eventType: LearningEventType;
  occurredAt: string;
  localDay: string;
  payload: P;
};
```

Move current reducer behavior without changing calculations. Keep the old repository exports temporarily as compatibility re-exports so existing imports compile during the transition.

- [ ] **Step 4: Run focused and legacy repository tests**

Run: `pnpm --filter @coucoumeow/web test -- --run src/progress/extraProgressSummary.test.ts src/progress/schoolProgressSummary.test.ts src/progress/localProgressRepository.test.ts src/progress/schoolProgressRepository.test.ts`

Expected: PASS with unchanged summary results.

- [ ] **Step 5: Commit the domain extraction**

```bash
git add apps/web/src/progress
git commit -m "refactor: extract learning event summaries"
```

### Task 3: Supabase client, authentication, and repository

**Files:**
- Modify: `apps/web/package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `apps/web/src/vite-env.d.ts`
- Create: `apps/web/src/data/supabaseConfig.ts`
- Create: `apps/web/src/data/supabaseConfig.test.ts`
- Create: `apps/web/src/data/supabaseAuth.ts`
- Create: `apps/web/src/data/supabaseAuth.test.ts`
- Create: `apps/web/src/data/learningProgressRepository.ts`
- Create: `apps/web/src/data/supabaseLearningProgressRepository.ts`
- Create: `apps/web/src/data/supabaseLearningProgressRepository.test.ts`

**Interfaces:**
- Produces: `readSupabaseConfig(env)`, `ensureAuthenticatedUser(auth)`, `LearningProgressRepository`, and `createSupabaseLearningProgressRepository(client, userId)`.
- Repository signatures:

```ts
type LearningProgressRepository = {
  loadEvents(): Promise<LearningEventEnvelope[]>;
  appendEvents(events: LearningEventEnvelope[]): Promise<void>;
  getSelectedTextbookId(): Promise<string | null>;
  setSelectedTextbookId(textbookId: string): Promise<void>;
  getImportReceipt(sourceKey: LegacySourceKey): Promise<ImportReceipt | null>;
  saveImportReceipt(receipt: ImportReceipt): Promise<void>;
  findEventIds(ids: string[]): Promise<Set<string>>;
};
```

- [ ] **Step 1: Write failing config, auth, and repository tests**

Assert both env values are mandatory and error text does not expose values; existing auth session is reused; absent session calls `signInAnonymously`; auth errors throw a typed startup error. With a fake query client, assert event reads paginate in 500-row ranges, database snake_case maps to domain camelCase, appends use upsert on `id`, settings and receipts are owner-scoped, and query errors reject.

- [ ] **Step 2: Run focused tests to verify failure**

Run: `pnpm --filter @coucoumeow/web test -- --run src/data`

Expected: FAIL because the data modules do not exist.

- [ ] **Step 3: Install the client and implement the narrow adapter**

Run: `pnpm --filter @coucoumeow/web add @supabase/supabase-js@^2`

Keep SDK-specific chaining inside `supabaseLearningProgressRepository.ts`; consumers use only `LearningProgressRepository`. Select all pages until a page has fewer than 500 rows. Map `event_type`, `occurred_at`, and `local_day` explicitly. Pass `user_id` on every mutation even though RLS also checks ownership.

- [ ] **Step 4: Run focused tests and typecheck**

Run: `pnpm --filter @coucoumeow/web test -- --run src/data && pnpm typecheck:web`

Expected: PASS.

- [ ] **Step 5: Commit the online repository**

```bash
git add apps/web/package.json pnpm-lock.yaml apps/web/src/vite-env.d.ts apps/web/src/data
git commit -m "feat: add authenticated Supabase progress repository"
```

### Task 4: Strict one-time legacy import

**Files:**
- Create: `apps/web/src/data/legacyProgressImport.ts`
- Create: `apps/web/src/data/legacyProgressImport.test.ts`
- Modify: `apps/web/src/progress/localProgressRepository.ts`
- Modify: `apps/web/src/progress/schoolProgressRepository.ts`

**Interfaces:**
- Consumes: `LearningProgressRepository` from Task 3 and the two existing storage keys.
- Produces: `importLegacyProgress(storage, repository, userId): Promise<LegacyImportResult>`.
- Guarantees: valid v1 events retain UUID/timestamp/day/payload semantics; corrupt JSON or shape mismatch throws `LegacyProgressImportError`; receipts are written only after all source event IDs are found remotely.

- [ ] **Step 1: Write failing migration tests**

Create valid extra and school v1 fixtures and assert exact converted envelopes, selected textbook upload, batches of at most 100 events, empty-source receipts, already-receipted sources skipped, interrupted upload safely retried, missing remote ID prevents receipt, and corrupt JSON blocks startup without modifying storage.

- [ ] **Step 2: Run focused tests to verify failure**

Run: `pnpm --filter @coucoumeow/web test -- --run src/data/legacyProgressImport.test.ts`

Expected: FAIL because the importer does not exist.

- [ ] **Step 3: Implement strict readers and importer**

Validate root version, events array, event UUID, ISO timestamp, local day, allowed event type, and required payload fields before conversion. Process the two source keys independently; skip only a source with a receipt. Upsert batches, call `findEventIds`, compare every source ID, then save the receipt. Never call `removeItem` or `setItem` on `Storage`.

- [ ] **Step 4: Run importer and reducer tests**

Run: `pnpm --filter @coucoumeow/web test -- --run src/data/legacyProgressImport.test.ts src/progress`

Expected: PASS.

- [ ] **Step 5: Commit the importer**

```bash
git add apps/web/src/data/legacyProgressImport.ts apps/web/src/data/legacyProgressImport.test.ts apps/web/src/progress/localProgressRepository.ts apps/web/src/progress/schoolProgressRepository.ts
git commit -m "feat: import legacy browser progress"
```

### Task 5: React startup provider and asynchronous learning actions

**Files:**
- Create: `apps/web/src/data/LearningDataProvider.tsx`
- Create: `apps/web/src/data/LearningDataProvider.test.tsx`
- Create: `apps/web/src/components/data/LearningDataStartup.tsx`
- Create: `apps/web/src/components/data/LearningDataStartup.test.tsx`
- Modify: `apps/web/src/main.tsx`
- Modify: `apps/web/src/App.tsx`
- Modify: `apps/web/src/hooks/useLearningProgress.ts`
- Modify: `apps/web/src/hooks/useLearningProgress.test.tsx`
- Modify: `apps/web/src/hooks/useSchoolProgress.ts`
- Modify: `apps/web/src/hooks/useSchoolProgress.test.tsx`
- Modify: `apps/web/src/components/school/SchoolLesson.tsx`
- Modify: `apps/web/src/components/school/SchoolTextbookPage.tsx`

**Interfaces:**
- Produces: `LearningDataProvider`, `useLearningData()`, startup states `loading | ready | error`, `retry()`, and shared in-memory event state.
- Existing hooks retain the same public summary and action names; actions return `Promise<boolean>` so completion navigation occurs only after persistence succeeds.

- [ ] **Step 1: Write failing provider and hook tests**

Assert startup validates config, authenticates, imports, loads events/preferences in order, exposes a loading screen, retries an error, and never renders `App` while unready. Assert each hook builds the correct event envelope, persists before updating summary, retains the prior summary on rejection, exposes the existing Chinese inline error, and shares events between both tracks.

- [ ] **Step 2: Run focused tests to verify failure**

Run: `pnpm --filter @coucoumeow/web test -- --run src/data/LearningDataProvider.test.tsx src/components/data src/hooks/useLearningProgress.test.tsx src/hooks/useSchoolProgress.test.tsx`

Expected: FAIL because the provider and asynchronous contracts are absent.

- [ ] **Step 3: Implement startup and inject the repository**

Build the production client only in the provider bootstrap. On ready, hold the complete event list and textbook selection in context. `appendEvents` awaits the repository first and appends to context only on success. Render a branded loading state and a retryable error state that does not include raw Supabase messages.

- [ ] **Step 4: Convert completion flows to await successful persistence**

Update page/lesson/episode completion handlers so navigation and success badges occur only when the returned promise is successful. Await practice writes where the interaction already has an asynchronous submit path. Preserve the current error placement and disable duplicate submits while a write is pending where needed.

- [ ] **Step 5: Run focused and UI regression tests**

Run: `pnpm --filter @coucoumeow/web test -- --run src/data src/hooks src/components src/App.test.tsx src/MotionApp.test.tsx`

Expected: PASS.

- [ ] **Step 6: Commit the application integration**

```bash
git add apps/web/src
git commit -m "feat: run learning progress on Supabase"
```

### Task 6: Configuration, migration guide, and full verification

**Files:**
- Modify: `.env.example`
- Modify: `apps/web/.env.example`
- Modify: `README.md`
- Modify: `docs/architecture/database-design.md`
- Create: `docs/development/supabase-learning-migration.md`

**Interfaces:**
- Documents: required env names, anonymous-auth prerequisite, migration application, old-browser import verification, rollback boundaries, and the fact that no credentials were committed or remote project modified.

- [ ] **Step 1: Add documentation contract assertions**

Extend the static contract test to require both example env files to contain `VITE_SUPABASE_URL=` and `VITE_SUPABASE_ANON_KEY=` while rejecting JWT-like values and concrete Supabase project URLs.

- [ ] **Step 2: Run the contract to verify failure**

Run: `PYTHONDONTWRITEBYTECODE=1 python3 -m unittest supabase.tests.test_static_contract -v`

Expected: FAIL until the examples and guide are updated.

- [ ] **Step 3: Write configuration and migration documentation**

Document these operator steps precisely: create/select a development Supabase project; enable Anonymous Sign-Ins; apply migrations in timestamp order; copy URL and anon key into an untracked `.env`; run the web app in the old-data browser; verify `local_progress_imports`, event counts, completed pages, review queues, and growth summaries; retain localStorage through acceptance; do not deploy or clear local data during this task.

- [ ] **Step 4: Run complete verification**

Run: `bash scripts/verify.sh`

Expected: all API-client tests, web tests, typechecks, build, Python tests, Ruff, mypy, and static Supabase contracts PASS.

Also run:

```bash
git diff --check
git status --short
git log --oneline --decorate origin/main..HEAD
```

Expected: no whitespace errors; only intended branch changes; `main` remains at `8cbcbcd`; no push or deployment occurred.

- [ ] **Step 5: Commit documentation**

```bash
git add .env.example apps/web/.env.example README.md docs/architecture/database-design.md docs/development/supabase-learning-migration.md supabase/tests/test_static_contract.py
git commit -m "docs: explain Supabase learning migration"
```
