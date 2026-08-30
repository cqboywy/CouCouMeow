# Supabase Content Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move every school and extracurricular content record to Supabase, make the Web runtime consume only the cloud content repository, and remove obsolete local content/progress compatibility paths without breaking existing learning history.

**Architecture:** Add a normalized shared-content schema with stable text `content_key` values and transactional import RPCs. Store versioned source packages outside the Web bundle, load published catalogs through a focused Supabase content repository/provider, and inject the catalog into progress derivation. Keep only the read-only legacy learning-progress importer; remove static runtime content, writable local repositories, hosted-preview fallbacks, and the duplicate in-memory API.

**Tech Stack:** PostgreSQL 15/Supabase RLS and RPC, React 19, TypeScript 7, `@supabase/supabase-js`, Vitest/Testing Library, Python 3.12/Pydantic/httpx, pytest/pgTAP.

**Spec:** `docs/superpowers/specs/2026-08-30-supabase-content-platform-design.md`

## Global Constraints

- Supabase is the only production content and learning-data source.
- Preserve every existing curriculum, page, lesson, episode, vocabulary, and sentence ID as an immutable `content_key`.
- Source JSON packages may exist under `content/`, but may not be imported by `apps/web` or included as a runtime fallback.
- The browser receives only the Supabase URL and Publishable/anon key; service-role credentials remain management-only environment variables.
- Existing UI behavior and existing `learning_events` history must remain valid.
- Keep localStorage access only in the read-only legacy progress importer and Supabase Auth internals.
- Write a failing behavior test and observe the expected failure before every production-code change.

---

## File Map

- `supabase/migrations/20260830000200_content_platform.sql`: school schema, extracurricular extensions, import RPCs, constraints, grants, and RLS.
- `supabase/tests/004_content_platform.test.sql`: executable database contract.
- `supabase/tests/test_static_contract.py`: offline schema/RLS/import-RPC coverage.
- `content/school/pep-grade4-upper/manifest.json`: canonical current school package.
- `content/extra/*/manifest.json`: canonical current episode packages.
- `tools/content_importer/src/coucoumeow_importer/content_packages.py`: strict package models and cross-reference validation.
- `tools/content_importer/src/coucoumeow_importer/supabase_content.py`: management-only RPC client and import orchestration.
- `tools/content_importer/src/coucoumeow_importer/content_cli.py`: validate/import/publish CLI.
- `apps/web/src/content/types.ts`: runtime content domain.
- `apps/web/src/content/contentRepository.ts`: async repository contract.
- `apps/web/src/content/supabaseContentGateway.ts`: Supabase query boundary.
- `apps/web/src/content/supabaseContentRepository.ts`: row mapping, ordering, and integrity validation.
- `apps/web/src/content/ContentProvider.tsx`: load/error/retry lifecycle.
- `apps/web/src/progress/schoolProgressSummary.ts`: catalog-injected progress derivation.
- `apps/web/src/App.tsx` and focused extracted modules: UI orchestration with no content fallback.
- Delete after cutover: old static curriculum modules, `extra/localExtraContent.ts`, `hostedPreview.ts`, writable local progress repositories, and the hardcoded learning API route.

---

### Task 1: Shared Content Database Contract

**Files:**
- Create: `supabase/migrations/20260830000200_content_platform.sql`
- Create: `supabase/tests/004_content_platform.test.sql`
- Modify: `supabase/tests/test_static_contract.py`

**Interfaces:**
- Produces published school tables, extended `lf_*` tables, `import_school_textbook(jsonb)` and `import_extra_episode(jsonb)` RPCs.
- Stable keys are returned to later repository tasks as `content_key text`.

- [ ] **Step 1: Write failing static and pgTAP contracts.**

Assert literal requirements: all seven school tables exist; every public content entity has a non-empty unique `content_key`; exactly one lesson or page owns an exercise; authenticated users can select only published trees; authenticated/anon cannot mutate content; import RPC execution is service-role-only; `lf_episodes.is_learned` is absent after migration.

```python
def test_content_platform_has_stable_keys_and_service_only_imports(self) -> None:
    sql = CONTENT_PLATFORM.read_text()
    for table in ("school_textbooks", "school_units", "school_lessons", "school_pages", "school_content_items", "school_page_items", "school_exercises"):
        self.assertRegex(sql, rf"create table public\.{table}\b")
    self.assertIn("content_key text not null unique", normalized(sql))
    self.assertIn("grant execute on function public.import_school_textbook(jsonb) to service_role", normalized(sql))
    self.assertNotIn("grant execute on function public.import_school_textbook(jsonb) to authenticated", normalized(sql))
```

- [ ] **Step 2: Run the contracts and verify the expected missing-migration failure.**

Run: `PYTHONDONTWRITEBYTECODE=1 python3 -m unittest supabase.tests.test_static_contract -v`

Expected: FAIL because `20260830000200_content_platform.sql` and its required objects do not exist.

- [ ] **Step 3: Implement the minimal schema, RLS, and transactional import RPCs.**

Use UUID foreign keys internally and text stable keys externally. `import_school_textbook` and `import_extra_episode` must take one validated JSON tree, acquire an advisory transaction lock for its root key, upsert the complete tree, delete stale unpublished children inside the transaction, and finish in `draft`. A separate `publish_content(text, text)` RPC validates child counts and changes the root to `published`.

- [ ] **Step 4: Run static contracts and local pgTAP when available.**

Run:

```bash
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest supabase.tests.test_static_contract -v
supabase test db
```

Expected: static tests PASS; pgTAP PASS when a local Supabase runtime is installed, otherwise record the environment limitation without weakening the SQL tests.

- [ ] **Step 5: Commit.**

```bash
git add supabase/migrations/20260830000200_content_platform.sql supabase/tests/004_content_platform.test.sql supabase/tests/test_static_contract.py
git commit -m "feat: add shared content platform schema"
```

### Task 2: Versioned Content Packages and Strict Validation

**Files:**
- Create: `content/school/pep-grade4-upper/manifest.json`
- Create: `content/extra/the-park/manifest.json`
- Create: `content/extra/hunting-for-bugs/manifest.json`
- Create: `content/extra/lost-in-the-rain/manifest.json`
- Create: `tools/content_importer/src/coucoumeow_importer/content_packages.py`
- Create: `tools/content_importer/tests/test_content_packages.py`
- Temporary create/delete: `scripts/export-current-content.ts`

**Interfaces:**
- Produces `load_content_package(path: Path) -> SchoolTextbookPackage | ExtraEpisodePackage`.
- Produces literal JSON payloads matching the Task 1 RPC contracts.

- [ ] **Step 1: Write failing package-validation tests.**

Name the breaks: duplicate `content_key`, missing page item reference, exercise with both/no owner, non-contiguous order, wrong `schema_version`, and a secret/path appearing in the package.

```python
def test_school_package_rejects_broken_item_reference(tmp_path: Path) -> None:
    package = valid_school_package()
    package["pages"][0]["item_keys"] = ["missing-item"]
    path = write_package(tmp_path, package)
    with pytest.raises(ContentPackageError, match="missing-item"):
        load_content_package(path)
```

- [ ] **Step 2: Run tests and verify failure because the loader is missing.**

Run: `uv run pytest tools/content_importer/tests/test_content_packages.py -q`

Expected: FAIL on missing `content_packages` module.

- [ ] **Step 3: Implement strict Pydantic models and cross-reference validation.**

The loader must reject extra fields, normalize no identifiers, preserve all literal keys, and return a typed package. Validation errors must name the package and offending key without printing environment variables.

- [ ] **Step 4: Export current TypeScript fixtures once, validate them, and commit only canonical JSON.**

Use a temporary `vite-node` exporter that imports the existing school/extra modules and writes deterministic, pretty-printed manifests. Compare literal counts and representative content, then delete the exporter so the canonical package does not depend on production TypeScript.

Run:

```bash
pnpm exec vite-node scripts/export-current-content.ts
uv run pytest tools/content_importer/tests/test_content_packages.py -q
```

Expected: all package tests PASS; school package contains six units and printed pages 2 through 73; extra directory contains exactly three episodes.

- [ ] **Step 5: Commit.**

```bash
git add content tools/content_importer/src/coucoumeow_importer/content_packages.py tools/content_importer/tests/test_content_packages.py
git commit -m "feat: add validated content packages"
```

### Task 3: Management-Only Supabase Content Importer

**Files:**
- Create: `tools/content_importer/src/coucoumeow_importer/supabase_content.py`
- Create: `tools/content_importer/src/coucoumeow_importer/content_cli.py`
- Create: `tools/content_importer/tests/test_supabase_content.py`
- Modify: `pyproject.toml`
- Modify: `docs/development/content-import-guide.md`

**Interfaces:**
- Consumes: `load_content_package` and Task 1 RPCs.
- Produces: `import_package(package, client, publish: bool) -> ImportResult` and CLI `coucoumeow-content`.

- [ ] **Step 1: Write failing importer behavior tests.**

Use an in-memory HTTP transport and assert observable RPC order and redacted failures: school package calls `import_school_textbook`, optional publish calls `publish_content` only after import success, repeated content hashes are reported as skipped, and error text never contains the service key.

- [ ] **Step 2: Run the tests and verify the missing client failure.**

Run: `uv run pytest tools/content_importer/tests/test_supabase_content.py -q`

Expected: FAIL on missing module/functions.

- [ ] **Step 3: Implement the RPC client and CLI.**

Read `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` only at command execution. Support `validate`, `import --draft`, and `import --publish`; default to validation only. Print root key, content hash, counts, and final status, never request headers or response bodies containing credentials.

- [ ] **Step 4: Run importer and existing tool tests.**

Run: `uv run pytest tools/content_importer/tests -q`

Expected: PASS.

- [ ] **Step 5: Commit.**

```bash
git add pyproject.toml tools/content_importer docs/development/content-import-guide.md
git commit -m "feat: add Supabase content importer"
```

### Task 4: Web Content Domain and Supabase Repository

**Files:**
- Create: `apps/web/src/content/types.ts`
- Create: `apps/web/src/content/contentRepository.ts`
- Create: `apps/web/src/content/supabaseContentGateway.ts`
- Create: `apps/web/src/content/supabaseContentRepository.ts`
- Create: `apps/web/src/content/supabaseContentRepository.test.ts`

**Interfaces:**
- Produces `ContentCatalog`, `SchoolTextbook`, `SchoolPage`, `SchoolLesson`, `ExtraEpisode`, and `ContentRepository`.
- `ContentRepository` methods: `loadCatalog()`, `loadSchoolPage(contentKey)`, `loadSchoolLesson(contentKey)`, `loadExtraEpisode(contentKey)`.

- [ ] **Step 1: Write failing mapping and integrity tests.**

Breaks covered: wrong unit/page order, unpublished child leakage, missing referenced content item, extra episode detail field loss, and repository silently accepting an empty catalog.

```typescript
it('orders pages by printed page and preserves stable keys', async () => {
  const repository = createRepositoryWithRows(rowsOutOfOrder);
  const catalog = await repository.loadCatalog();
  expect(catalog.textbooks[0].units[0].pages.map(page => page.id)).toEqual(['pep4a-u1-p2', 'pep4a-u1-p3']);
});
```

- [ ] **Step 2: Run the repository test and verify missing-module failure.**

Run: `pnpm --filter @coucoumeow/web exec vitest run src/content/supabaseContentRepository.test.ts`

Expected: FAIL because the repository is absent.

- [ ] **Step 3: Implement domain, gateway, and repository.**

Keep Supabase row shapes inside the gateway. Map every UUID relation to stable keys before returning domain objects. Validate root counts and references once at catalog load; detail methods reuse the verified index.

- [ ] **Step 4: Run repository tests and Web typecheck.**

Run:

```bash
pnpm --filter @coucoumeow/web exec vitest run src/content/supabaseContentRepository.test.ts
pnpm --filter @coucoumeow/web typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit.**

```bash
git add apps/web/src/content
git commit -m "feat: add Supabase content repository"
```

### Task 5: Content Provider and Catalog-Driven Progress

**Files:**
- Create: `apps/web/src/content/ContentProvider.tsx`
- Create: `apps/web/src/content/ContentProvider.test.tsx`
- Modify: `apps/web/src/main.tsx`
- Modify: `apps/web/src/progress/schoolProgressSummary.ts`
- Modify: `apps/web/src/progress/schoolProgressSummary.test.ts`
- Modify: `apps/web/src/data/LearningDataProvider.tsx`

**Interfaces:**
- Produces `useContent(): { catalog, repository }` after authenticated startup.
- Changes `summarizeSchoolProgress(events, selectedTextbookId, catalog)` to depend only on injected content.

- [ ] **Step 1: Write failing provider and progress tests.**

Breaks covered: StrictMode double-load, retry after repository failure, empty catalog entering the app, page order accidentally coming from PEP static imports, and old stable-key events failing against catalog data.

- [ ] **Step 2: Run tests and verify failures against the old static dependency.**

Run:

```bash
pnpm --filter @coucoumeow/web exec vitest run src/content/ContentProvider.test.tsx src/progress/schoolProgressSummary.test.ts
```

Expected: FAIL because no provider exists and summary does not accept a catalog.

- [ ] **Step 3: Implement provider composition and catalog injection.**

Authenticate first, construct both repositories from one Supabase client, load shared content, import legacy progress, then load user events. Surface content and learning failures separately while preserving one retry action.

- [ ] **Step 4: Run focused tests and typecheck.**

Expected: PASS with no direct curriculum imports in `schoolProgressSummary.ts`.

- [ ] **Step 5: Commit.**

```bash
git add apps/web/src/content apps/web/src/main.tsx apps/web/src/progress apps/web/src/data
git commit -m "feat: load learning content from Supabase"
```

### Task 6: Switch School and Extra Learning Flows

**Files:**
- Modify: `apps/web/src/App.tsx`
- Modify: `apps/web/src/hooks/useSchoolProgress.ts`
- Modify: `apps/web/src/hooks/useLearningProgress.ts`
- Modify: `apps/web/src/components/school/*.tsx`
- Modify: `apps/web/src/App.test.tsx`
- Modify: `apps/web/src/MotionApp.test.tsx`
- Modify: `apps/web/src/components/school/SchoolLibrary.test.tsx`
- Modify: `apps/web/src/components/school/SchoolLesson.test.tsx`
- Modify: `apps/web/src/components/school/SchoolTextbookPage.test.tsx`
- Create: `apps/web/src/navigation/appNavigation.ts`
- Create: `apps/web/src/extra/types.ts`
- Create: `apps/web/src/extra/answerEvaluation.ts`
- Create: `apps/web/src/extra/answerEvaluation.test.ts`

**Interfaces:**
- Consumes only `useContent()` domain objects and the cloud learning repository.
- Produces unchanged user-visible school/extra screens and learning-event writes.

- [ ] **Step 1: Change component tests first to provide a literal `ContentCatalog`.**

Breaks covered: school library still imports PEP modules, extra shelf still calls HTTP/local API, detail loses database content, and correct/incorrect practice does not append the expected stable key event.

- [ ] **Step 2: Run focused UI tests and observe failures.**

Run: `pnpm --filter @coucoumeow/web exec vitest run src/App.test.tsx src/MotionApp.test.tsx src/components/school`

Expected: FAIL until components consume the provider/catalog.

- [ ] **Step 3: Implement the minimal UI cutover.**

Extract domain types and navigation helpers from `App.tsx`. Replace `api`, `hostedPreviewApi`, and `localExtraApi` with repository detail calls. Pass selected textbook/unit/page objects through component props. Keep answer comparison pure and write only learning events.

- [ ] **Step 4: Run all Web tests and typecheck.**

Run:

```bash
pnpm --filter @coucoumeow/web test -- --run
pnpm --filter @coucoumeow/web typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit.**

```bash
git add apps/web/src
git commit -m "feat: run school and extra content from Supabase"
```

### Task 7: Remove Obsolete Runtime Paths

**Files:**
- Delete: `apps/web/src/extra/localExtraContent.ts`
- Delete: `apps/web/src/extra/localExtraContent.test.ts`
- Delete: `apps/web/src/hostedPreview.ts`
- Delete: `apps/web/src/hostedPreview.test.ts`
- Delete: `apps/web/src/progress/localProgressRepository.ts`
- Delete: `apps/web/src/progress/localProgressRepository.test.ts`
- Delete: `apps/web/src/progress/schoolProgressRepository.ts`
- Delete: `apps/web/src/progress/schoolProgressRepository.test.ts`
- Delete: migrated `apps/web/src/curriculum/pepGrade4Upper*.ts` runtime content modules.
- Modify/Delete: `apps/api/src/coucoumeow_api/api/routes/learning.py` and its hardcoded-content tests.
- Create: `apps/web/src/architecture/runtimeBoundaries.test.ts`

**Interfaces:**
- Keeps `legacyProgressImport.ts` as the only product code allowed to read old progress keys.
- Leaves API health scaffolding; no duplicate in-memory content or progress state.

- [ ] **Step 1: Write a failing behavioral architecture test.**

Build the production app with fixture content served by the repository, then make content loading fail and assert that no school page or episode appears. Assert the legacy importer still migrates a literal old record. Do not merely grep source text for removed names.

- [ ] **Step 2: Run the architecture and legacy tests and observe the fallback failure.**

Expected: FAIL because current hosted/local paths can still render content.

- [ ] **Step 3: Delete obsolete paths and simplify API routing.**

Remove runtime imports first, verify typecheck, then delete dead files. Keep only focused pure summary/domain modules. Remove generated API-client operations that no current UI consumes if their server routes are removed.

- [ ] **Step 4: Run Web/API/tool tests, typechecks, Ruff, and mypy.**

Expected: PASS.

- [ ] **Step 5: Commit.**

```bash
git add -A apps/web apps/api packages/api-client
git commit -m "refactor: remove local content compatibility paths"
```

### Task 8: Documentation, Production Migration, and Release Verification

**Files:**
- Modify: `README.md`
- Modify: `docs/architecture/database-design.md`
- Modify: `docs/architecture/system-overview.md`
- Modify: `docs/development/deployment.md`
- Modify: `docs/development/supabase-learning-migration.md`
- Create: `docs/development/supabase-content-rollout.md`

**Interfaces:**
- Produces exact database-first rollout and rollback instructions.

- [ ] **Step 1: Document schema application, package validation/import, publication, count queries, frontend rollout, and rollback.**

Include literal expected counts and SQL queries; explain that a project Secret Key cannot apply DDL and that a database password, SQL Editor session, or Supabase management access is required.

- [ ] **Step 2: Run the complete local verification suite.**

Run:

```bash
bash scripts/verify.sh
git diff --check
```

Expected: exit 0.

- [ ] **Step 3: Apply database migration and import packages before frontend deployment.**

Verify tables/RLS/RPCs, import all four root packages, publish them, and run documented count/reference queries. If database DDL authority is unavailable, stop before merging the frontend and report the exact single external action required.

- [ ] **Step 4: Push branch, create/merge PR only after database verification, and wait for CI/Netlify.**

Expected: GitHub CI and Netlify production deploy succeed.

- [ ] **Step 5: Perform production smoke tests.**

Verify anonymous auth, published school catalog, a representative page, all three extra episodes, existing growth history, and one new learning-event write. Confirm the production JS bundle does not contain representative full textbook paragraphs or local episode fixtures.

- [ ] **Step 6: Commit documentation before release actions.**

```bash
git add README.md docs
git commit -m "docs: explain Supabase content operations"
```
