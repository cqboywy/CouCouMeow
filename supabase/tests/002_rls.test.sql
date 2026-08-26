begin;

select plan(24);

insert into auth.users (
  id,
  aud,
  role,
  email,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) values
  (
    '10000000-0000-0000-0000-000000000001',
    'authenticated',
    'authenticated',
    'child-a@example.test',
    '{}',
    '{}',
    now(),
    now()
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    'authenticated',
    'authenticated',
    'child-b@example.test',
    '{}',
    '{}',
    now(),
    now()
  );

insert into public.lf_episodes (
  id,
  level,
  title,
  local_video_filename,
  local_srt_filename,
  content_status,
  content_hash
) values
  (
    '30000000-0000-0000-0000-000000000003',
    1,
    'Published Test Story',
    'published-test.mp4',
    'published-test.srt',
    'published',
    'published-test-hash'
  ),
  (
    '40000000-0000-0000-0000-000000000004',
    1,
    'Draft Test Story',
    'draft-test.mp4',
    'draft-test.srt',
    'draft',
    'draft-test-hash'
  );

insert into public.lf_sentences (
  id,
  episode_id,
  sequence_no,
  english_text,
  chinese_translation
) values
  (
    '51000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000003',
    1,
    'Published sentence.',
    '已发布句子。'
  ),
  (
    '51000000-0000-0000-0000-000000000002',
    '40000000-0000-0000-0000-000000000004',
    1,
    'Draft sentence.',
    '草稿句子。'
  );

insert into public.lf_vocab (
  id,
  episode_id,
  word,
  phonetic,
  chinese_meaning,
  sequence_no
) values
  (
    '52000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000003',
    'sunbeam',
    '/ˈsʌnbiːm/',
    '阳光',
    1
  ),
  (
    '52000000-0000-0000-0000-000000000002',
    '40000000-0000-0000-0000-000000000004',
    'moonbeam',
    '/ˈmuːnbiːm/',
    '月光',
    1
  );

insert into public.lf_knowledge (
  id,
  episode_id,
  title,
  grammar_explanation,
  core_knowledge,
  sequence_no
) values
  (
    '53000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000003',
    'Published knowledge',
    'A fictional grammar note.',
    'A fictional core note.',
    1
  ),
  (
    '53000000-0000-0000-0000-000000000002',
    '40000000-0000-0000-0000-000000000004',
    'Draft knowledge',
    'A draft grammar note.',
    'A draft core note.',
    1
  );

insert into public.profiles (id, child_display_name) values
  ('10000000-0000-0000-0000-000000000001', 'Child A'),
  ('20000000-0000-0000-0000-000000000002', 'Child B');

insert into public.practice_sessions (
  id,
  user_id,
  episode_id,
  practice_type,
  question_count,
  correct_count
) values
  (
    '61000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000003',
    'review',
    1,
    1
  ),
  (
    '61000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000002',
    '30000000-0000-0000-0000-000000000003',
    'review',
    1,
    0
  );

insert into public.practice_attempts (
  id,
  session_id,
  user_id,
  item_type,
  vocab_id,
  expected_answer,
  user_answer,
  original_is_correct
) values
  (
    '62000000-0000-0000-0000-000000000001',
    '61000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'vocab',
    '52000000-0000-0000-0000-000000000001',
    'sunbeam',
    'sunbeam',
    true
  ),
  (
    '62000000-0000-0000-0000-000000000002',
    '61000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000002',
    'vocab',
    '52000000-0000-0000-0000-000000000001',
    'sunbeam',
    'sun',
    false
  );

insert into public.mistake_items (user_id, mistake_type, vocab_id) values
  (
    '10000000-0000-0000-0000-000000000001',
    'vocab',
    '52000000-0000-0000-0000-000000000001'
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    'vocab',
    '52000000-0000-0000-0000-000000000002'
  );

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '10000000-0000-0000-0000-000000000001',
  true
);

select is(
  (
    select array_agg(title order by title)
    from public.lf_episodes
    where id in (
      '30000000-0000-0000-0000-000000000003',
      '40000000-0000-0000-0000-000000000004'
    )
  ),
  array['Published Test Story']::text[],
  'exact published fixture title set'
);
select ok(
  not exists (
    select 1 from public.lf_episodes
    where id = '40000000-0000-0000-0000-000000000004'
  ),
  'draft episode fixture is absent'
);

select is(
  (
    select array_agg(id::text order by id)
    from public.lf_sentences
    where id in (
      '51000000-0000-0000-0000-000000000001',
      '51000000-0000-0000-0000-000000000002'
    )
  ),
  array['51000000-0000-0000-0000-000000000001']::text[],
  'exact sentence fixture visibility follows the published parent'
);
select ok(
  not exists (
    select 1 from public.lf_sentences
    where id = '51000000-0000-0000-0000-000000000002'
  ),
  'draft sentence fixture is absent'
);

select is(
  (
    select array_agg(id::text order by id)
    from public.lf_vocab
    where id in (
      '52000000-0000-0000-0000-000000000001',
      '52000000-0000-0000-0000-000000000002'
    )
  ),
  array['52000000-0000-0000-0000-000000000001']::text[],
  'exact vocabulary fixture visibility follows the published parent'
);
select ok(
  not exists (
    select 1 from public.lf_vocab
    where id = '52000000-0000-0000-0000-000000000002'
  ),
  'draft vocabulary fixture is absent'
);

select is(
  (
    select array_agg(id::text order by id)
    from public.lf_knowledge
    where id in (
      '53000000-0000-0000-0000-000000000001',
      '53000000-0000-0000-0000-000000000002'
    )
  ),
  array['53000000-0000-0000-0000-000000000001']::text[],
  'exact knowledge fixture visibility follows the published parent'
);
select ok(
  not exists (
    select 1 from public.lf_knowledge
    where id = '53000000-0000-0000-0000-000000000002'
  ),
  'draft knowledge fixture is absent'
);

select is(
  (
    select array_agg(id::text order by id)
    from public.profiles
    where id in (
      '10000000-0000-0000-0000-000000000001',
      '20000000-0000-0000-0000-000000000002'
    )
  ),
  array['10000000-0000-0000-0000-000000000001']::text[],
  'exact own-profile fixture set'
);
select ok(
  not exists (
    select 1 from public.profiles
    where id = '20000000-0000-0000-0000-000000000002'
  ),
  'other-user profile fixture is absent'
);

select is(
  (
    select array_agg(id::text order by id)
    from public.practice_sessions
    where id in (
      '61000000-0000-0000-0000-000000000001',
      '61000000-0000-0000-0000-000000000002'
    )
  ),
  array['61000000-0000-0000-0000-000000000001']::text[],
  'exact own-session fixture set'
);
select ok(
  not exists (
    select 1 from public.practice_sessions
    where id = '61000000-0000-0000-0000-000000000002'
  ),
  'other-user session fixture is absent'
);

select is(
  (
    select array_agg(id::text order by id)
    from public.practice_attempts
    where id in (
      '62000000-0000-0000-0000-000000000001',
      '62000000-0000-0000-0000-000000000002'
    )
  ),
  array['62000000-0000-0000-0000-000000000001']::text[],
  'exact own-attempt fixture set proves attempt rows cannot cross session owners'
);
select ok(
  not exists (
    select 1 from public.practice_attempts
    where id = '62000000-0000-0000-0000-000000000002'
  ),
  'other-user attempt fixture is absent'
);

select is(
  (
    select array_agg(user_id::text order by user_id)
    from public.mistake_items
    where user_id in (
      '10000000-0000-0000-0000-000000000001',
      '20000000-0000-0000-0000-000000000002'
    )
  ),
  array['10000000-0000-0000-0000-000000000001']::text[],
  'exact own-mistake fixture set'
);
select ok(
  not exists (
    select 1 from public.mistake_items
    where user_id = '20000000-0000-0000-0000-000000000002'
  ),
  'other-user mistake fixture is absent'
);

select lives_ok(
  $$update public.profiles set child_display_name = 'Child A Updated'$$,
  'users can update their own profile'
);
select is(
  (select child_display_name from public.profiles),
  'Child A Updated',
  'own-profile update is persisted'
);

select throws_ok(
  $$
    insert into public.practice_sessions (
      user_id,
      episode_id,
      practice_type
    ) values (
      '20000000-0000-0000-0000-000000000002',
      '30000000-0000-0000-0000-000000000003',
      'review'
    )
  $$,
  '42501',
  null,
  'users cannot create sessions for another owner'
);
select throws_ok(
  $$
    insert into public.lf_episodes (
      level,
      title,
      local_video_filename,
      local_srt_filename,
      content_hash
    ) values (1, 'Blocked', 'blocked.mp4', 'blocked.srt', 'blocked-hash')
  $$,
  '42501',
  null,
  'authenticated users cannot insert content'
);
select throws_ok(
  $$
    insert into public.content_import_jobs (
      run_id,
      mode,
      input_filename,
      status
    ) values (gen_random_uuid(), 'single', 'blocked.srt', 'pending')
  $$,
  '42501',
  null,
  'authenticated users cannot insert import jobs'
);
select ok(
  not has_table_privilege('authenticated', 'public.lf_episodes', 'UPDATE'),
  'authenticated has no episode UPDATE grant, including is_learned'
);
select ok(
  not has_table_privilege('authenticated', 'public.content_import_jobs', 'SELECT'),
  'authenticated cannot read import jobs'
);
select ok(
  not has_table_privilege('authenticated', 'public.content_import_jobs', 'INSERT'),
  'authenticated cannot write import jobs'
);

select * from finish();
rollback;
