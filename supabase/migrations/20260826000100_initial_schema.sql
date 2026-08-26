create type public.content_status as enum ('draft', 'validated', 'published');
create type public.practice_type as enum (
  'chinese_dictation',
  'audio_dictation',
  'sentence_reading',
  'review'
);
create type public.mistake_type as enum ('vocab', 'sentence');
create type public.mastery_status as enum ('learning', 'reviewing', 'mastered');

create table public.lf_episodes (
  id uuid primary key default gen_random_uuid(),
  level smallint not null check (level between 1 and 9),
  title text not null check (length(btrim(title)) > 0),
  local_video_filename text not null check (
    length(btrim(local_video_filename)) > 0
    and local_video_filename !~ '[/\\]'
  ),
  local_srt_filename text not null check (
    length(btrim(local_srt_filename)) > 0
    and local_srt_filename !~ '[/\\]'
  ),
  is_learned boolean not null default false,
  content_status public.content_status not null default 'draft',
  content_hash text not null check (length(btrim(content_hash)) > 0),
  media_provider text not null default 'local' check (length(btrim(media_provider)) > 0),
  media_locator text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (level, local_video_filename)
);

create table public.lf_sentences (
  id uuid primary key default gen_random_uuid(),
  episode_id uuid not null references public.lf_episodes(id) on delete cascade,
  sequence_no integer not null check (sequence_no > 0),
  english_text text not null check (length(btrim(english_text)) > 0),
  chinese_translation text not null check (length(btrim(chinese_translation)) > 0),
  created_at timestamptz not null default now(),
  unique (episode_id, sequence_no)
);

create table public.lf_vocab (
  id uuid primary key default gen_random_uuid(),
  episode_id uuid not null references public.lf_episodes(id) on delete cascade,
  word text not null check (length(btrim(word)) > 0),
  normalized_word text generated always as (lower(btrim(word))) stored,
  phonetic text not null,
  chinese_meaning text not null check (length(btrim(chinese_meaning)) > 0),
  sequence_no integer not null check (sequence_no > 0),
  created_at timestamptz not null default now(),
  unique (episode_id, normalized_word),
  unique (episode_id, sequence_no)
);

create table public.lf_knowledge (
  id uuid primary key default gen_random_uuid(),
  episode_id uuid not null references public.lf_episodes(id) on delete cascade,
  title text not null check (length(btrim(title)) > 0),
  grammar_explanation text not null check (length(btrim(grammar_explanation)) > 0),
  core_knowledge text not null check (length(btrim(core_knowledge)) > 0),
  sequence_no integer not null check (sequence_no > 0),
  created_at timestamptz not null default now(),
  unique (episode_id, sequence_no)
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  child_display_name text not null check (length(btrim(child_display_name)) > 0),
  timezone text not null default 'Asia/Shanghai' check (length(btrim(timezone)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.practice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  episode_id uuid not null references public.lf_episodes(id),
  practice_type public.practice_type not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  question_count integer not null default 0 check (question_count >= 0),
  correct_count integer not null default 0 check (
    correct_count >= 0 and correct_count <= question_count
  ),
  score numeric(5, 2) check (score between 0 and 100),
  unique (id, user_id),
  check (completed_at is null or completed_at >= started_at)
);

create table public.practice_attempts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  vocab_id uuid references public.lf_vocab(id),
  sentence_id uuid references public.lf_sentences(id),
  expected_answer text not null check (length(btrim(expected_answer)) > 0),
  user_answer text,
  speech_transcript text,
  similarity_score numeric(6, 5) check (similarity_score between 0 and 1),
  original_is_correct boolean not null,
  corrected_is_correct boolean,
  correction_reason text,
  created_at timestamptz not null default now(),
  foreign key (session_id, user_id)
    references public.practice_sessions(id, user_id)
    on delete cascade,
  check ((vocab_id is not null)::integer + (sentence_id is not null)::integer = 1),
  check (corrected_is_correct is null or length(btrim(correction_reason)) > 0)
);

create table public.mistake_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mistake_type public.mistake_type not null,
  vocab_id uuid references public.lf_vocab(id) on delete cascade,
  sentence_id uuid references public.lf_sentences(id) on delete cascade,
  error_count integer not null default 1 check (error_count > 0),
  last_error_at timestamptz not null default now(),
  mastery_status public.mastery_status not null default 'learning',
  review_stage smallint not null default 0 check (review_stage >= 0),
  next_review_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (mistake_type = 'vocab' and vocab_id is not null and sentence_id is null)
    or
    (mistake_type = 'sentence' and sentence_id is not null and vocab_id is null)
  )
);

create table public.content_import_jobs (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null,
  mode text not null check (mode in ('single', 'batch')),
  input_filename text not null check (
    length(btrim(input_filename)) > 0
    and input_filename !~ '[/\\]'
  ),
  content_hash text check (content_hash is null or length(btrim(content_hash)) > 0),
  status text not null check (
    status in ('pending', 'running', 'succeeded', 'failed', 'needs_review', 'skipped')
  ),
  error_code text,
  error_summary text check (error_summary is null or length(error_summary) <= 500),
  created_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz,
  updated_at timestamptz not null default now(),
  check (finished_at is null or started_at is null or finished_at >= started_at)
);

create index lf_sentences_episode_id_idx on public.lf_sentences(episode_id);
create index lf_vocab_episode_id_idx on public.lf_vocab(episode_id);
create index lf_knowledge_episode_id_idx on public.lf_knowledge(episode_id);
create index practice_sessions_user_started_idx
  on public.practice_sessions(user_id, started_at desc);
create index practice_sessions_episode_idx on public.practice_sessions(episode_id);
create index practice_attempts_user_created_idx
  on public.practice_attempts(user_id, created_at desc);
create index practice_attempts_session_idx on public.practice_attempts(session_id);
create index practice_attempts_vocab_idx
  on public.practice_attempts(vocab_id) where vocab_id is not null;
create index practice_attempts_sentence_idx
  on public.practice_attempts(sentence_id) where sentence_id is not null;
create unique index mistake_items_user_vocab_uidx
  on public.mistake_items(user_id, vocab_id) where vocab_id is not null;
create unique index mistake_items_user_sentence_uidx
  on public.mistake_items(user_id, sentence_id) where sentence_id is not null;
create index mistake_items_due_idx
  on public.mistake_items(user_id, next_review_at)
  where mastery_status <> 'mastered';
create index content_import_jobs_run_id_idx on public.content_import_jobs(run_id);
create index content_import_jobs_hash_idx on public.content_import_jobs(content_hash);
create index content_import_jobs_status_idx
  on public.content_import_jobs(status, created_at);

create or replace function public.replace_episode_content(
  p_episode_id uuid,
  p_content_hash text,
  p_sentences jsonb,
  p_vocab jsonb,
  p_knowledge jsonb
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if length(btrim(p_content_hash)) = 0 then
    raise exception 'content hash must not be empty' using errcode = '22023';
  end if;

  if jsonb_typeof(p_sentences) is distinct from 'array'
    or jsonb_typeof(p_vocab) is distinct from 'array'
    or jsonb_typeof(p_knowledge) is distinct from 'array'
  then
    raise exception 'episode content payloads must be JSON arrays'
      using errcode = '22023';
  end if;

  perform 1
  from public.lf_episodes
  where id = p_episode_id
  for update;

  if not found then
    raise exception 'episode % does not exist', p_episode_id
      using errcode = 'P0002';
  end if;

  delete from public.lf_sentences where episode_id = p_episode_id;
  delete from public.lf_vocab where episode_id = p_episode_id;
  delete from public.lf_knowledge where episode_id = p_episode_id;

  insert into public.lf_sentences (
    episode_id,
    sequence_no,
    english_text,
    chinese_translation
  )
  select
    p_episode_id,
    item.sequence_no,
    item.english_text,
    item.chinese_translation
  from jsonb_to_recordset(p_sentences) as item(
    sequence_no integer,
    english_text text,
    chinese_translation text
  );

  insert into public.lf_vocab (
    episode_id,
    word,
    phonetic,
    chinese_meaning,
    sequence_no
  )
  select
    p_episode_id,
    item.word,
    item.phonetic,
    item.chinese_meaning,
    item.sequence_no
  from jsonb_to_recordset(p_vocab) as item(
    word text,
    phonetic text,
    chinese_meaning text,
    sequence_no integer
  );

  insert into public.lf_knowledge (
    episode_id,
    title,
    grammar_explanation,
    core_knowledge,
    sequence_no
  )
  select
    p_episode_id,
    item.title,
    item.grammar_explanation,
    item.core_knowledge,
    item.sequence_no
  from jsonb_to_recordset(p_knowledge) as item(
    title text,
    grammar_explanation text,
    core_knowledge text,
    sequence_no integer
  );

  update public.lf_episodes
  set
    content_hash = p_content_hash,
    content_status = 'validated',
    updated_at = now()
  where id = p_episode_id;
end;
$$;

revoke all privileges on table
  public.lf_episodes,
  public.lf_sentences,
  public.lf_vocab,
  public.lf_knowledge,
  public.profiles,
  public.practice_sessions,
  public.practice_attempts,
  public.mistake_items,
  public.content_import_jobs
from public, anon, authenticated;

grant all privileges on table
  public.lf_episodes,
  public.lf_sentences,
  public.lf_vocab,
  public.lf_knowledge,
  public.profiles,
  public.practice_sessions,
  public.practice_attempts,
  public.mistake_items,
  public.content_import_jobs
to service_role;

revoke all on function public.replace_episode_content(uuid, text, jsonb, jsonb, jsonb)
  from public;
revoke all on function public.replace_episode_content(uuid, text, jsonb, jsonb, jsonb)
  from anon, authenticated;
grant execute on function public.replace_episode_content(uuid, text, jsonb, jsonb, jsonb)
  to service_role;

alter table public.lf_episodes enable row level security;
alter table public.lf_sentences enable row level security;
alter table public.lf_vocab enable row level security;
alter table public.lf_knowledge enable row level security;
alter table public.profiles enable row level security;
alter table public.practice_sessions enable row level security;
alter table public.practice_attempts enable row level security;
alter table public.mistake_items enable row level security;
alter table public.content_import_jobs enable row level security;

create policy "authenticated users read published episodes"
on public.lf_episodes for select to authenticated
using (content_status = 'published');

create policy "authenticated users read published sentences"
on public.lf_sentences for select to authenticated
using (exists (
  select 1
  from public.lf_episodes
  where lf_episodes.id = lf_sentences.episode_id
    and lf_episodes.content_status = 'published'
));

create policy "authenticated users read published vocabulary"
on public.lf_vocab for select to authenticated
using (exists (
  select 1
  from public.lf_episodes
  where lf_episodes.id = lf_vocab.episode_id
    and lf_episodes.content_status = 'published'
));

create policy "authenticated users read published knowledge"
on public.lf_knowledge for select to authenticated
using (exists (
  select 1
  from public.lf_episodes
  where lf_episodes.id = lf_knowledge.episode_id
    and lf_episodes.content_status = 'published'
));

create policy "users read own profile"
on public.profiles for select to authenticated
using (id = auth.uid());
create policy "users insert own profile"
on public.profiles for insert to authenticated
with check (id = auth.uid());
create policy "users update own profile"
on public.profiles for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());
create policy "users delete own profile"
on public.profiles for delete to authenticated
using (id = auth.uid());

create policy "users read own practice sessions"
on public.practice_sessions for select to authenticated
using (user_id = auth.uid());
create policy "users insert own practice sessions"
on public.practice_sessions for insert to authenticated
with check (user_id = auth.uid());
create policy "users update own practice sessions"
on public.practice_sessions for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());
create policy "users delete own practice sessions"
on public.practice_sessions for delete to authenticated
using (user_id = auth.uid());

create policy "users read own practice attempts"
on public.practice_attempts for select to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1
    from public.practice_sessions
    where practice_sessions.id = practice_attempts.session_id
      and practice_sessions.user_id = auth.uid()
  )
);
create policy "users insert own practice attempts"
on public.practice_attempts for insert to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.practice_sessions
    where practice_sessions.id = practice_attempts.session_id
      and practice_sessions.user_id = auth.uid()
  )
);
create policy "users update own practice attempts"
on public.practice_attempts for update to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1
    from public.practice_sessions
    where practice_sessions.id = practice_attempts.session_id
      and practice_sessions.user_id = auth.uid()
  )
)
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.practice_sessions
    where practice_sessions.id = practice_attempts.session_id
      and practice_sessions.user_id = auth.uid()
  )
);
create policy "users delete own practice attempts"
on public.practice_attempts for delete to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1
    from public.practice_sessions
    where practice_sessions.id = practice_attempts.session_id
      and practice_sessions.user_id = auth.uid()
  )
);

create policy "users read own mistakes"
on public.mistake_items for select to authenticated
using (user_id = auth.uid());
create policy "users insert own mistakes"
on public.mistake_items for insert to authenticated
with check (user_id = auth.uid());
create policy "users update own mistakes"
on public.mistake_items for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());
create policy "users delete own mistakes"
on public.mistake_items for delete to authenticated
using (user_id = auth.uid());

grant select on table
  public.lf_episodes,
  public.lf_sentences,
  public.lf_vocab,
  public.lf_knowledge
to authenticated;

grant select, insert, update, delete on table
  public.profiles,
  public.practice_sessions,
  public.practice_attempts,
  public.mistake_items
to authenticated;
