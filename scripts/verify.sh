#!/usr/bin/env bash
set -euo pipefail

pnpm --filter @coucoumeow/api-client test -- --run
pnpm --filter @coucoumeow/api-client typecheck
pnpm test:web -- --run
pnpm typecheck:web
pnpm build:web
uv run pytest apps/api/tests tools/content_importer/tests -q
uv run ruff check apps/api tools/content_importer
uv run mypy apps/api/src
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest supabase.tests.test_static_contract -v

