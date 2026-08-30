"""Offline contract checks for the Supabase SQL artifacts.

These checks intentionally do not emulate PostgreSQL or RLS. They make the
deferred database suite safer by checking that its required DDL and pgTAP
coverage remain present when Docker/cloud execution is unavailable.
"""

from __future__ import annotations

import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SUPABASE = ROOT / "supabase"
MIGRATION = (SUPABASE / "migrations" / "20260826000100_initial_schema.sql").read_text()
ATTEMPT_EVIDENCE_MIGRATION = SUPABASE / "migrations" / "20260827000200_add_attempt_answer_method.sql"
ONLINE_PROGRESS_MIGRATION = SUPABASE / "migrations" / "20260830000100_online_learning_progress.sql"
ONLINE_PROGRESS_TEST = SUPABASE / "tests" / "003_online_learning_progress.test.sql"
SCHEMA_TEST = (SUPABASE / "tests" / "001_schema.test.sql").read_text()
RLS_TEST = (SUPABASE / "tests" / "002_rls.test.sql").read_text()
SEED_PATH = SUPABASE / "seed.sql"
ROOT_ENV_EXAMPLE = ROOT / ".env.example"
WEB_ENV_EXAMPLE = ROOT / "apps" / "web" / ".env.example"
LEARNING_MIGRATION_GUIDE = ROOT / "docs" / "development" / "supabase-learning-migration.md"


def normalized(sql: str) -> str:
    return re.sub(r"\s+", " ", sql.lower()).strip()


class SupabaseStaticContractTest(unittest.TestCase):
    def setUp(self) -> None:
        self.migration = normalized(MIGRATION)

    def assert_sql(self, fragment: str) -> None:
        self.assertIn(normalized(fragment), self.migration)

    def test_schema_contains_required_tables_enums_and_data_constraints(self) -> None:
        for enum_name in (
            "content_status",
            "practice_type",
            "mistake_type",
            "mastery_status",
        ):
            self.assertRegex(
                self.migration,
                rf"create type public\.{enum_name} as enum \(",
            )
        self.assert_sql(
            "create type public.content_status as enum "
            "('draft', 'validated', 'published')"
        )
        self.assert_sql("create type public.mistake_type as enum ('vocab', 'sentence')")

        for table in (
            "lf_episodes",
            "lf_sentences",
            "lf_vocab",
            "lf_knowledge",
            "profiles",
            "practice_sessions",
            "practice_attempts",
            "mistake_items",
            "content_import_jobs",
        ):
            self.assert_sql(f"create table public.{table}")

        self.assert_sql("unique (level, local_video_filename)")
        for child in ("lf_sentences", "lf_vocab", "lf_knowledge"):
            self.assertRegex(
                self.migration,
                rf"create table public\.{child} \([^;]+"
                r"references public\.lf_episodes\(id\) on delete cascade",
            )
        self.assert_sql("normalized_word text generated always as (lower(btrim(word))) stored")
        self.assert_sql("unique (episode_id, normalized_word)")
        self.assert_sql("foreign key (session_id, user_id) references public.practice_sessions(id, user_id)")
        self.assert_sql("item_type = 'vocab' and sentence_id is null")
        self.assert_sql("item_type = 'sentence' and vocab_id is null")
        self.assert_sql("create unique index mistake_items_user_vocab_uidx")
        self.assert_sql("create unique index mistake_items_user_sentence_uidx")
        self.assert_sql("create index practice_attempts_session_idx")
        self.assert_sql("create index content_import_jobs_status_idx")
        self.assert_sql("mistake_type = 'vocab' and vocab_id is not null and sentence_id is null")
        self.assert_sql("mistake_type = 'sentence' and sentence_id is not null and vocab_id is null")
        self.assert_sql("error_summary text check (error_summary is null or length(error_summary) <= 500)")

    def test_replace_function_is_atomic_and_service_role_only(self) -> None:
        signature = (
            "public.replace_episode_content(uuid, text, jsonb, jsonb, jsonb)"
        )
        self.assert_sql("create or replace function public.replace_episode_content")
        self.assert_sql("for update")
        for table in ("lf_sentences", "lf_vocab", "lf_knowledge"):
            self.assert_sql(f"delete from public.{table}")
            self.assert_sql(f"insert into public.{table}")
        self.assert_sql("content_status = 'validated'")
        self.assert_sql(f"revoke all on function {signature} from public")
        self.assert_sql(f"revoke all on function {signature} from anon, authenticated")
        self.assert_sql(f"grant execute on function {signature} to service_role")
        self.assertIn("replacement is atomic when a child insert fails", SCHEMA_TEST.lower())

    def test_attempt_history_survives_replacement_and_new_items_match_session_episode(self) -> None:
        self.assertEqual(self.migration.count("on delete set null"), 2)
        self.assert_sql("item_type public.mistake_type not null")
        self.assert_sql("create or replace function public.validate_practice_attempt_item")
        self.assert_sql("create trigger validate_practice_attempt_item")
        self.assert_sql("tg_op = 'insert' and v_item_count <> 1")
        self.assert_sql("where id = new.session_id and user_id = new.user_id")
        self.assert_sql("from public.lf_vocab where id = new.vocab_id")
        self.assert_sql("from public.lf_sentences where id = new.sentence_id")
        self.assert_sql("v_item_episode_id <> v_session_episode_id")
        self.assertIn("replacement preserves historical attempt snapshots", SCHEMA_TEST.lower())
        self.assertIn("attempt item must belong to the session episode", SCHEMA_TEST.lower())
        self.assertIn("new attempts require exactly one content item", SCHEMA_TEST.lower())

    def test_attempt_history_keeps_the_learning_evidence_type(self) -> None:
        self.assertTrue(ATTEMPT_EVIDENCE_MIGRATION.is_file())
        migration = normalized(ATTEMPT_EVIDENCE_MIGRATION.read_text())
        self.assertIn("add column if not exists answer_method text", migration)
        self.assertIn("answer_method in ('written', 'spoken', 'sentence_reading')", migration)

    def test_online_progress_schema_is_owner_scoped_and_append_only(self) -> None:
        self.assertTrue(ONLINE_PROGRESS_MIGRATION.is_file())
        self.assertTrue(ONLINE_PROGRESS_TEST.is_file())
        migration = normalized(ONLINE_PROGRESS_MIGRATION.read_text())
        rls_test = normalized(ONLINE_PROGRESS_TEST.read_text())

        self.assertIn("create type public.learning_track as enum ('extra', 'school')", migration)
        self.assertIn("create type public.learning_event_type as enum", migration)
        for table in ("learning_events", "learner_preferences", "local_progress_imports"):
            self.assertIn(f"create table public.{table}", migration)
            self.assertIn(f"alter table public.{table} enable row level security", migration)
        self.assertIn("check (jsonb_typeof(payload) = 'object')", migration)
        self.assertIn("create index learning_events_user_occurred_idx", migration)
        self.assertIn("grant select, insert, delete on table public.learning_events to authenticated", migration)
        self.assertNotRegex(
            migration,
            r"grant\s+[^;]*update[^;]*public\.learning_events[^;]*authenticated",
        )
        for table in ("learning_events", "learner_preferences", "local_progress_imports"):
            self.assertRegex(
                migration,
                rf"create policy [^;]+ on public\.{table}[^;]+auth\.uid\(\)",
            )
        self.assertIn("user a sees only its online learning event", rls_test)
        self.assertIn("user a sees only its learner preference", rls_test)
        self.assertIn("user a sees only its import receipt", rls_test)

    def test_replace_function_has_exactly_the_public_contract_signature(self) -> None:
        declaration = re.search(
            r"create or replace function public\.replace_episode_content\((.*?)\) "
            r"returns void",
            self.migration,
        )
        self.assertIsNotNone(declaration)
        parameters = [part.strip() for part in declaration.group(1).split(",")]
        self.assertEqual(
            parameters,
            [
                "p_episode_id uuid",
                "p_content_hash text",
                "p_sentences jsonb",
                "p_vocab jsonb",
                "p_knowledge jsonb",
            ],
        )

    def test_rls_policies_cover_parent_publication_and_owner_isolation(self) -> None:
        all_tables = (
            "lf_episodes",
            "lf_sentences",
            "lf_vocab",
            "lf_knowledge",
            "profiles",
            "practice_sessions",
            "practice_attempts",
            "mistake_items",
            "content_import_jobs",
        )
        for table in all_tables:
            self.assert_sql(f"alter table public.{table} enable row level security")

        for child in ("lf_sentences", "lf_vocab", "lf_knowledge"):
            self.assertRegex(
                self.migration,
                rf"create policy [^;]+ on public\.{child} for select to authenticated "
                rf"using \(exists \( select 1 from public\.lf_episodes",
            )
        self.assert_sql(
            "on public.lf_episodes for select to authenticated "
            "using (content_status = 'published')"
        )
        for table in (
            "profiles",
            "practice_sessions",
            "practice_attempts",
            "mistake_items",
        ):
            for operation in ("select", "insert", "update", "delete"):
                self.assertRegex(
                    self.migration,
                    rf"create policy [^;]+ on public\.{table} for {operation} "
                    r"to authenticated",
                )
        self.assertRegex(
            self.migration,
            r"create policy [^;]+ on public\.practice_attempts[^;]+"
            r"public\.practice_sessions",
        )
        self.assertNotRegex(
            self.migration,
            r"create policy [^;]+ on public\.content_import_jobs",
        )
        self.assert_sql("grant select on table public.lf_episodes")
        self.assertNotRegex(
            self.migration,
            r"grant\s+[^;]*update[^;]*public\.lf_episodes[^;]*authenticated",
        )
        self.assertNotRegex(
            self.migration,
            r"grant\s+[^;]*public\.content_import_jobs[^;]*authenticated",
        )
        self.assertIn("attempt rows cannot cross session owners", RLS_TEST.lower())
        self.assertIn("visibility follows the published parent", RLS_TEST.lower())
        self.assertNotIn("select count(*) from public.", RLS_TEST.lower())
        self.assertGreaterEqual(RLS_TEST.lower().count("select array_agg("), 8)
        self.assertGreaterEqual(RLS_TEST.lower().count("not exists ("), 8)
        self.assertIn("exact published fixture title set", RLS_TEST.lower())
        self.assertIn("draft episode fixture is absent", RLS_TEST.lower())
        self.assertIn("other-user attempt fixture is absent", RLS_TEST.lower())

    def test_seed_is_one_fictional_episode_without_real_paths_or_source_text(self) -> None:
        self.assertTrue(SEED_PATH.is_file(), "supabase/seed.sql must exist")
        seed = SEED_PATH.read_text()
        seed_normalized = normalized(seed)
        self.assertEqual(seed_normalized.count("insert into public.lf_episodes"), 1)
        self.assertIn("the sleepy cat", seed_normalized)
        self.assertNotIn("little fox", seed_normalized)
        self.assertNotRegex(seed, r"/(Users|home|var|tmp)/|[A-Za-z]:\\\\")

    def test_online_learning_configuration_examples_do_not_contain_credentials(self) -> None:
        for path in (ROOT_ENV_EXAMPLE, WEB_ENV_EXAMPLE):
            content = path.read_text()
            self.assertIn("VITE_SUPABASE_URL=", content)
            self.assertIn("VITE_SUPABASE_ANON_KEY=", content)
            self.assertNotRegex(content, r"https://[a-z0-9]{8,}\.supabase\.co")
            self.assertNotRegex(content, r"eyJ[a-zA-Z0-9_-]{20,}")
        self.assertTrue(LEARNING_MIGRATION_GUIDE.is_file())


if __name__ == "__main__":
    unittest.main()
