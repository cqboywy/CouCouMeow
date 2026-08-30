create type public.learning_track as enum ('extra', 'school');

create type public.learning_event_type as enum (
  'practice_completed',
  'mastered',
  'exercise',
  'lesson_completed',
  'page_completed',
  'page_check',
  'later_review_added',
  'later_review_resolved'
);

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

create table public.learner_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  selected_textbook_id text not null check (length(btrim(selected_textbook_id)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.local_progress_imports (
  user_id uuid not null references auth.users(id) on delete cascade,
  source_key text not null check (
    source_key in (
      'coucoumeow.learning-progress.v1',
      'coucoumeow.school-progress.v1'
    )
  ),
  source_version integer not null check (source_version > 0),
  event_count integer not null check (event_count >= 0),
  imported_at timestamptz not null default now(),
  primary key (user_id, source_key)
);

create index learning_events_user_occurred_idx
  on public.learning_events(user_id, occurred_at desc);

alter table public.learning_events enable row level security;
alter table public.learner_preferences enable row level security;
alter table public.local_progress_imports enable row level security;

create policy learning_events_select_own
  on public.learning_events for select to authenticated
  using (user_id = auth.uid());
create policy learning_events_insert_own
  on public.learning_events for insert to authenticated
  with check (user_id = auth.uid());
create policy learning_events_delete_own
  on public.learning_events for delete to authenticated
  using (user_id = auth.uid());

create policy learner_preferences_select_own
  on public.learner_preferences for select to authenticated
  using (user_id = auth.uid());
create policy learner_preferences_insert_own
  on public.learner_preferences for insert to authenticated
  with check (user_id = auth.uid());
create policy learner_preferences_update_own
  on public.learner_preferences for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy learner_preferences_delete_own
  on public.learner_preferences for delete to authenticated
  using (user_id = auth.uid());

create policy local_progress_imports_select_own
  on public.local_progress_imports for select to authenticated
  using (user_id = auth.uid());
create policy local_progress_imports_insert_own
  on public.local_progress_imports for insert to authenticated
  with check (user_id = auth.uid());
create policy local_progress_imports_update_own
  on public.local_progress_imports for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy local_progress_imports_delete_own
  on public.local_progress_imports for delete to authenticated
  using (user_id = auth.uid());

grant select, insert, delete on table public.learning_events to authenticated;
grant select, insert, update, delete on table public.learner_preferences to authenticated;
grant select, insert, update, delete on table public.local_progress_imports to authenticated;
