begin;

select plan(16);

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
  vocab_id,
  expected_answer,
  user_answer,
  original_is_correct
) values
  (
    '62000000-0000-0000-0000-000000000001',
    '61000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    '52000000-0000-0000-0000-000000000001',
    'sunbeam',
    'sunbeam',
    true
  ),
  (
    '62000000-0000-0000-0000-000000000002',
    '61000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000002',
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

select is((select count(*) from public.lf_episodes), 1::bigint,
  'authenticated users see only published episodes');
select is((select count(*) from public.lf_sentences), 1::bigint,
  'sentence visibility follows the published parent');
select is((select count(*) from public.lf_vocab), 1::bigint,
  'vocabulary visibility follows the published parent');
select is((select count(*) from public.lf_knowledge), 1::bigint,
  'knowledge visibility follows the published parent');
select is((select count(*) from public.profiles), 1::bigint,
  'users see only their own profile');
select is((select count(*) from public.practice_sessions), 1::bigint,
  'users see only their own sessions');
select is((select count(*) from public.practice_attempts), 1::bigint,
  'attempt rows cannot cross session owners');
select is((select count(*) from public.mistake_items), 1::bigint,
  'users see only their own mistakes');

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
