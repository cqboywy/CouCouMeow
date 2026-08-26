#!/usr/bin/env bash
set -euo pipefail

project_root=$(cd "$(dirname "$0")/.." && pwd)
schema_dir="$project_root/packages/api-client/src/generated"
mkdir -p "$schema_dir"
json_file=$(mktemp)
trap 'rm -f "$json_file"' EXIT

cd "$project_root"
uv run --package coucoumeow-api python scripts/export-openapi.py > "$json_file"
pnpm exec openapi-typescript "$json_file" -o "$schema_dir/schema.d.ts"
