-- Shared school and extracurricular content platform.
-- UUIDs are internal relations; content_key values are stable public IDs used
-- by URLs and immutable learning-event snapshots.

create table public.school_textbooks (
  id uuid primary key default gen_random_uuid(),
  content_key text not null unique check (length(btrim(content_key)) > 0),
  curriculum text not null check (length(btrim(curriculum)) > 0),
  grade smallint not null check (grade between 1 and 12),
  semester text not null check (semester in ('upper', 'lower')),
  title text not null check (length(btrim(title)) > 0),
  current_unit_key text,
  content_version integer not null check (content_version > 0),
  content_hash text not null check (length(content_hash) = 64),
  content_status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.school_units (
  id uuid primary key default gen_random_uuid(),
  textbook_id uuid not null references public.school_textbooks(id) on delete cascade,
  content_key text not null unique check (length(btrim(content_key)) > 0),
  sequence_no integer not null check (sequence_no > 0),
  title text not null check (length(btrim(title)) > 0),
  chinese_title text not null,
  big_question text not null,
  big_question_chinese text not null,
  objectives jsonb not null default '[]'::jsonb check (jsonb_typeof(objectives) = 'array'),
  unique (textbook_id, sequence_no)
);

create table public.school_lessons (
  id uuid primary key default gen_random_uuid(),
  textbook_id uuid not null references public.school_textbooks(id) on delete cascade,
  unit_id uuid not null references public.school_units(id) on delete cascade,
  content_key text not null unique check (length(btrim(content_key)) > 0),
  sequence_no integer not null check (sequence_no > 0),
  title text not null check (length(btrim(title)) > 0),
  subtitle text not null,
  page_references integer[] not null default '{}',
  duration_minutes integer not null check (duration_minutes > 0),
  concepts text[] not null default '{}',
  steps jsonb not null default '[]'::jsonb check (jsonb_typeof(steps) = 'array'),
  explanation text not null,
  unique (unit_id, sequence_no)
);

create table public.school_pages (
  id uuid primary key default gen_random_uuid(),
  textbook_id uuid not null references public.school_textbooks(id) on delete cascade,
  unit_id uuid not null references public.school_units(id) on delete cascade,
  content_key text not null unique check (length(btrim(content_key)) > 0),
  printed_page integer not null check (printed_page > 0),
  title text not null check (length(btrim(title)) > 0),
  chinese_title text not null,
  schema_version integer not null default 1 check (schema_version > 0),
  sections jsonb not null default '[]'::jsonb check (jsonb_typeof(sections) = 'array'),
  practice_prompts jsonb not null default '[]'::jsonb check (jsonb_typeof(practice_prompts) = 'array'),
  finish_items text[] not null default '{}',
  unique (textbook_id, printed_page)
);

create table public.school_content_items (
  id uuid primary key default gen_random_uuid(),
  textbook_id uuid not null references public.school_textbooks(id) on delete cascade,
  unit_id uuid references public.school_units(id) on delete cascade,
  content_key text not null unique check (length(btrim(content_key)) > 0),
  item_kind text not null check (item_kind in ('word', 'sentence', 'phonics', 'project')),
  english text not null check (length(btrim(english)) > 0),
  chinese text not null,
  phonetic text,
  attributes jsonb not null default '{}'::jsonb check (jsonb_typeof(attributes) = 'object')
);

create table public.school_page_items (
  page_id uuid not null references public.school_pages(id) on delete cascade,
  item_id uuid not null references public.school_content_items(id) on delete cascade,
  sequence_no integer not null check (sequence_no > 0),
  item_role text not null check (item_role in ('focus', 'body', 'finish')),
  source text not null check (source in ('body', 'appendix-word', 'appendix-vocabulary', 'appendix-expression')),
  note text not null default '',
  primary key (page_id, item_id, item_role),
  unique (page_id, item_role, sequence_no)
);

create table public.school_exercises (
  id uuid primary key default gen_random_uuid(),
  textbook_id uuid not null references public.school_textbooks(id) on delete cascade,
  lesson_id uuid references public.school_lessons(id) on delete cascade,
  page_id uuid references public.school_pages(id) on delete cascade,
  item_id uuid references public.school_content_items(id) on delete set null,
  content_key text not null unique check (length(btrim(content_key)) > 0),
  sequence_no integer not null check (sequence_no > 0),
  stage text not null check (stage in ('practice', 'check')),
  exercise_kind text not null check (exercise_kind in ('choice', 'typing', 'self_check')),
  prompt text not null check (length(btrim(prompt)) > 0),
  answer text not null check (length(btrim(answer)) > 0),
  options jsonb not null default '[]'::jsonb check (jsonb_typeof(options) = 'array'),
  hint text not null,
  check (num_nonnulls(lesson_id, page_id) = 1)
);

create index school_units_textbook_sequence_idx on public.school_units(textbook_id, sequence_no);
create index school_lessons_unit_sequence_idx on public.school_lessons(unit_id, sequence_no);
create index school_pages_textbook_page_idx on public.school_pages(textbook_id, printed_page);
create index school_items_textbook_kind_idx on public.school_content_items(textbook_id, item_kind);
create index school_exercises_lesson_idx on public.school_exercises(lesson_id) where lesson_id is not null;
create index school_exercises_page_idx on public.school_exercises(page_id) where page_id is not null;

alter table public.lf_episodes
  add column content_key text,
  add column chinese_title text,
  add column story_summary text not null default '',
  add column story_theme text not null default '',
  add column comprehension_questions jsonb not null default '[]'::jsonb,
  add column retell_steps jsonb not null default '[]'::jsonb,
  add column past_tense_pairs jsonb not null default '[]'::jsonb;

update public.lf_episodes
set content_key = 'legacy-episode-' || id::text,
    chinese_title = title
where content_key is null;

alter table public.lf_episodes
  alter column content_key set not null,
  alter column chinese_title set not null,
  alter column local_video_filename drop not null,
  alter column local_srt_filename drop not null,
  add constraint lf_episodes_content_key_key unique (content_key),
  add constraint lf_episodes_questions_array check (jsonb_typeof(comprehension_questions) = 'array'),
  add constraint lf_episodes_retell_array check (jsonb_typeof(retell_steps) = 'array'),
  add constraint lf_episodes_past_pairs_array check (jsonb_typeof(past_tense_pairs) = 'array'),
  drop column if exists is_learned;

alter table public.lf_sentences
  add column content_key text,
  add column is_featured boolean not null default false;
update public.lf_sentences set content_key = 'legacy-sentence-' || id::text where content_key is null;
alter table public.lf_sentences
  alter column content_key set not null,
  add constraint lf_sentences_content_key_key unique (content_key);

alter table public.lf_vocab add column content_key text;
update public.lf_vocab set content_key = 'legacy-vocab-' || id::text where content_key is null;
alter table public.lf_vocab
  alter column content_key set not null,
  add constraint lf_vocab_content_key_key unique (content_key);

alter table public.lf_knowledge
  add column content_key text,
  add column examples jsonb not null default '[]'::jsonb;
update public.lf_knowledge set content_key = 'legacy-knowledge-' || id::text where content_key is null;
alter table public.lf_knowledge
  alter column content_key set not null,
  add constraint lf_knowledge_content_key_key unique (content_key),
  add constraint lf_knowledge_examples_array check (jsonb_typeof(examples) = 'array');

alter table public.school_textbooks enable row level security;
alter table public.school_units enable row level security;
alter table public.school_lessons enable row level security;
alter table public.school_pages enable row level security;
alter table public.school_content_items enable row level security;
alter table public.school_page_items enable row level security;
alter table public.school_exercises enable row level security;

create policy school_textbooks_read_published
  on public.school_textbooks for select to authenticated
  using (content_status = 'published');
create policy school_units_read_published
  on public.school_units for select to authenticated
  using (exists (
    select 1 from public.school_textbooks
    where school_textbooks.id = school_units.textbook_id
      and school_textbooks.content_status = 'published'
  ));
create policy school_lessons_read_published
  on public.school_lessons for select to authenticated
  using (exists (
    select 1 from public.school_textbooks
    where school_textbooks.id = school_lessons.textbook_id
      and school_textbooks.content_status = 'published'
  ));
create policy school_pages_read_published
  on public.school_pages for select to authenticated
  using (exists (
    select 1 from public.school_textbooks
    where school_textbooks.id = school_pages.textbook_id
      and school_textbooks.content_status = 'published'
  ));
create policy school_items_read_published
  on public.school_content_items for select to authenticated
  using (exists (
    select 1 from public.school_textbooks
    where school_textbooks.id = school_content_items.textbook_id
      and school_textbooks.content_status = 'published'
  ));
create policy school_page_items_read_published
  on public.school_page_items for select to authenticated
  using (exists (
    select 1
    from public.school_pages
    join public.school_textbooks on school_textbooks.id = school_pages.textbook_id
    where school_pages.id = school_page_items.page_id
      and school_textbooks.content_status = 'published'
  ));
create policy school_exercises_read_published
  on public.school_exercises for select to authenticated
  using (exists (
    select 1 from public.school_textbooks
    where school_textbooks.id = school_exercises.textbook_id
      and school_textbooks.content_status = 'published'
  ));

grant select on table
  public.school_textbooks,
  public.school_units,
  public.school_lessons,
  public.school_pages,
  public.school_content_items,
  public.school_page_items,
  public.school_exercises
to authenticated;

grant all privileges on table
  public.school_textbooks,
  public.school_units,
  public.school_lessons,
  public.school_pages,
  public.school_content_items,
  public.school_page_items,
  public.school_exercises
to service_role;

create or replace function public.import_school_textbook(p_package jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_textbook jsonb := p_package -> 'textbook';
  v_textbook_id uuid;
  v_unit jsonb;
  v_lesson jsonb;
  v_page jsonb;
  v_item jsonb;
  v_link jsonb;
  v_exercise jsonb;
  v_unit_id uuid;
  v_lesson_id uuid;
  v_page_id uuid;
  v_item_id uuid;
begin
  if p_package ->> 'kind' <> 'school_textbook'
    or (p_package ->> 'schema_version')::integer <> 1
    or length(coalesce(v_textbook ->> 'content_key', '')) = 0
  then
    raise exception 'invalid school textbook package' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_textbook ->> 'content_key', 0));

  insert into public.school_textbooks (
    content_key, curriculum, grade, semester, title, current_unit_key,
    content_version, content_hash, content_status, updated_at
  ) values (
    v_textbook ->> 'content_key', v_textbook ->> 'curriculum',
    (v_textbook ->> 'grade')::smallint, v_textbook ->> 'semester',
    v_textbook ->> 'title', v_textbook ->> 'current_unit_key',
    (p_package ->> 'content_version')::integer, p_package ->> 'content_hash',
    'draft', now()
  )
  on conflict (content_key) do update set
    curriculum = excluded.curriculum,
    grade = excluded.grade,
    semester = excluded.semester,
    title = excluded.title,
    current_unit_key = excluded.current_unit_key,
    content_version = excluded.content_version,
    content_hash = excluded.content_hash,
    content_status = 'draft',
    updated_at = now()
  returning id into v_textbook_id;

  delete from public.school_units where textbook_id = v_textbook_id;

  for v_unit in select value from jsonb_array_elements(p_package -> 'units') loop
    insert into public.school_units (
      textbook_id, content_key, sequence_no, title, chinese_title,
      big_question, big_question_chinese, objectives
    ) values (
      v_textbook_id, v_unit ->> 'content_key', (v_unit ->> 'sequence_no')::integer,
      v_unit ->> 'title', v_unit ->> 'chinese_title', v_unit ->> 'big_question',
      v_unit ->> 'big_question_chinese', coalesce(v_unit -> 'objectives', '[]'::jsonb)
    );
  end loop;

  for v_item in select value from jsonb_array_elements(p_package -> 'items') loop
    select id into v_unit_id from public.school_units
    where textbook_id = v_textbook_id and content_key = v_item ->> 'unit_key';
    insert into public.school_content_items (
      textbook_id, unit_id, content_key, item_kind, english, chinese, phonetic, attributes
    ) values (
      v_textbook_id, v_unit_id, v_item ->> 'content_key', v_item ->> 'item_kind',
      v_item ->> 'english', v_item ->> 'chinese', v_item ->> 'phonetic',
      coalesce(v_item -> 'attributes', '{}'::jsonb)
    );
  end loop;

  for v_lesson in select value from jsonb_array_elements(p_package -> 'lessons') loop
    select id into strict v_unit_id from public.school_units
    where textbook_id = v_textbook_id and content_key = v_lesson ->> 'unit_key';
    insert into public.school_lessons (
      textbook_id, unit_id, content_key, sequence_no, title, subtitle,
      page_references, duration_minutes, concepts, steps, explanation
    ) values (
      v_textbook_id, v_unit_id, v_lesson ->> 'content_key',
      (v_lesson ->> 'sequence_no')::integer, v_lesson ->> 'title',
      coalesce(v_lesson ->> 'subtitle', ''),
      array(select value::integer from jsonb_array_elements_text(coalesce(v_lesson -> 'page_references', '[]'::jsonb))),
      (v_lesson ->> 'duration_minutes')::integer,
      array(select value from jsonb_array_elements_text(coalesce(v_lesson -> 'concepts', '[]'::jsonb))),
      coalesce(v_lesson -> 'steps', '[]'::jsonb), coalesce(v_lesson ->> 'explanation', '')
    );
  end loop;

  for v_page in select value from jsonb_array_elements(p_package -> 'pages') loop
    select id into strict v_unit_id from public.school_units
    where textbook_id = v_textbook_id and content_key = v_page ->> 'unit_key';
    insert into public.school_pages (
      textbook_id, unit_id, content_key, printed_page, title, chinese_title,
      schema_version, sections, practice_prompts, finish_items
    ) values (
      v_textbook_id, v_unit_id, v_page ->> 'content_key',
      (v_page ->> 'printed_page')::integer, v_page ->> 'title',
      coalesce(v_page ->> 'chinese_title', ''),
      coalesce((v_page ->> 'schema_version')::integer, 1),
      coalesce(v_page -> 'sections', '[]'::jsonb),
      coalesce(v_page -> 'practice_prompts', '[]'::jsonb),
      array(select value from jsonb_array_elements_text(coalesce(v_page -> 'finish_items', '[]'::jsonb)))
    );
  end loop;

  for v_link in select value from jsonb_array_elements(p_package -> 'page_items') loop
    select id into strict v_page_id from public.school_pages
    where textbook_id = v_textbook_id and content_key = v_link ->> 'page_key';
    select id into strict v_item_id from public.school_content_items
    where textbook_id = v_textbook_id and content_key = v_link ->> 'item_key';
    insert into public.school_page_items (
      page_id, item_id, sequence_no, item_role, source, note
    ) values (
      v_page_id, v_item_id, (v_link ->> 'sequence_no')::integer,
      v_link ->> 'item_role', v_link ->> 'source', coalesce(v_link ->> 'note', '')
    );
  end loop;

  for v_exercise in select value from jsonb_array_elements(p_package -> 'exercises') loop
    v_lesson_id := null;
    v_page_id := null;
    v_item_id := null;
    if v_exercise ? 'lesson_key' then
      select id into strict v_lesson_id from public.school_lessons
      where textbook_id = v_textbook_id and content_key = v_exercise ->> 'lesson_key';
    end if;
    if v_exercise ? 'page_key' then
      select id into strict v_page_id from public.school_pages
      where textbook_id = v_textbook_id and content_key = v_exercise ->> 'page_key';
    end if;
    if v_exercise ? 'item_key' then
      select id into strict v_item_id from public.school_content_items
      where textbook_id = v_textbook_id and content_key = v_exercise ->> 'item_key';
    end if;
    insert into public.school_exercises (
      textbook_id, lesson_id, page_id, item_id, content_key, sequence_no,
      stage, exercise_kind, prompt, answer, options, hint
    ) values (
      v_textbook_id, v_lesson_id, v_page_id, v_item_id,
      v_exercise ->> 'content_key', (v_exercise ->> 'sequence_no')::integer,
      v_exercise ->> 'stage', v_exercise ->> 'exercise_kind',
      v_exercise ->> 'prompt', v_exercise ->> 'answer',
      coalesce(v_exercise -> 'options', '[]'::jsonb), coalesce(v_exercise ->> 'hint', '')
    );
  end loop;
end;
$$;

create or replace function public.import_extra_episode(p_package jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_episode jsonb := p_package -> 'episode';
  v_episode_id uuid;
  v_item jsonb;
begin
  if p_package ->> 'kind' <> 'extra_episode'
    or (p_package ->> 'schema_version')::integer <> 1
    or length(coalesce(v_episode ->> 'content_key', '')) = 0
  then
    raise exception 'invalid extra episode package' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_episode ->> 'content_key', 0));

  insert into public.lf_episodes (
    content_key, level, series_title, episode_number, title, chinese_title,
    local_video_filename, local_srt_filename, content_status, content_hash,
    media_provider, media_locator, story_summary, story_theme,
    comprehension_questions, retell_steps, past_tense_pairs, updated_at
  ) values (
    v_episode ->> 'content_key', (v_episode ->> 'level')::smallint,
    v_episode ->> 'series_title', (v_episode ->> 'episode_number')::integer,
    v_episode ->> 'title', coalesce(v_episode ->> 'chinese_title', ''),
    v_episode ->> 'local_video_filename', v_episode ->> 'local_srt_filename',
    'draft', p_package ->> 'content_hash', coalesce(v_episode ->> 'media_provider', 'remote'),
    v_episode ->> 'media_locator', coalesce(v_episode ->> 'story_summary', ''),
    coalesce(v_episode ->> 'story_theme', ''),
    coalesce(v_episode -> 'comprehension_questions', '[]'::jsonb),
    coalesce(v_episode -> 'retell_steps', '[]'::jsonb),
    coalesce(v_episode -> 'past_tense_pairs', '[]'::jsonb), now()
  )
  on conflict (content_key) do update set
    level = excluded.level,
    series_title = excluded.series_title,
    episode_number = excluded.episode_number,
    title = excluded.title,
    chinese_title = excluded.chinese_title,
    local_video_filename = excluded.local_video_filename,
    local_srt_filename = excluded.local_srt_filename,
    content_status = 'draft',
    content_hash = excluded.content_hash,
    media_provider = excluded.media_provider,
    media_locator = excluded.media_locator,
    story_summary = excluded.story_summary,
    story_theme = excluded.story_theme,
    comprehension_questions = excluded.comprehension_questions,
    retell_steps = excluded.retell_steps,
    past_tense_pairs = excluded.past_tense_pairs,
    updated_at = now()
  returning id into v_episode_id;

  delete from public.lf_sentences where episode_id = v_episode_id;
  delete from public.lf_vocab where episode_id = v_episode_id;
  delete from public.lf_knowledge where episode_id = v_episode_id;

  for v_item in select value from jsonb_array_elements(p_package -> 'sentences') loop
    insert into public.lf_sentences (
      episode_id, content_key, sequence_no, english_text, chinese_translation, is_featured
    ) values (
      v_episode_id, v_item ->> 'content_key', (v_item ->> 'sequence_no')::integer,
      v_item ->> 'english_text', v_item ->> 'chinese_translation',
      coalesce((v_item ->> 'is_featured')::boolean, false)
    );
  end loop;

  for v_item in select value from jsonb_array_elements(p_package -> 'vocab') loop
    insert into public.lf_vocab (
      episode_id, content_key, word, phonetic, chinese_meaning, sequence_no
    ) values (
      v_episode_id, v_item ->> 'content_key', v_item ->> 'word',
      coalesce(v_item ->> 'phonetic', ''), v_item ->> 'chinese_meaning',
      (v_item ->> 'sequence_no')::integer
    );
  end loop;

  for v_item in select value from jsonb_array_elements(p_package -> 'knowledge') loop
    insert into public.lf_knowledge (
      episode_id, content_key, title, grammar_explanation, core_knowledge,
      sequence_no, examples
    ) values (
      v_episode_id, v_item ->> 'content_key', v_item ->> 'title',
      coalesce(v_item ->> 'grammar_explanation', ''),
      coalesce(v_item ->> 'core_knowledge', ''),
      (v_item ->> 'sequence_no')::integer,
      coalesce(v_item -> 'examples', '[]'::jsonb)
    );
  end loop;
end;
$$;

create or replace function public.publish_content(p_kind text, p_content_key text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_root_id uuid;
begin
  if p_kind = 'school' then
    select id into v_root_id from public.school_textbooks where content_key = p_content_key;
    if v_root_id is null
      or not exists (select 1 from public.school_units where textbook_id = v_root_id)
      or not exists (select 1 from public.school_pages where textbook_id = v_root_id)
    then
      raise exception 'school textbook is incomplete' using errcode = '23514';
    end if;
    update public.school_textbooks set content_status = 'published', updated_at = now()
    where id = v_root_id;
  elsif p_kind = 'extra' then
    select id into v_root_id from public.lf_episodes where content_key = p_content_key;
    if v_root_id is null
      or not exists (select 1 from public.lf_sentences where episode_id = v_root_id)
      or not exists (select 1 from public.lf_vocab where episode_id = v_root_id)
    then
      raise exception 'extra episode is incomplete' using errcode = '23514';
    end if;
    update public.lf_episodes set content_status = 'published', updated_at = now()
    where id = v_root_id;
  else
    raise exception 'unsupported content kind' using errcode = '22023';
  end if;
end;
$$;

revoke all on function public.import_school_textbook(jsonb) from public, anon, authenticated;
revoke all on function public.import_extra_episode(jsonb) from public, anon, authenticated;
revoke all on function public.publish_content(text, text) from public, anon, authenticated;
grant execute on function public.import_school_textbook(jsonb) to service_role;
grant execute on function public.import_extra_episode(jsonb) to service_role;
grant execute on function public.publish_content(text, text) to service_role;
