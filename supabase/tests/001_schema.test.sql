begin;

select plan(21);

select has_table('public', 'lf_episodes');
select has_table('public', 'lf_sentences');
select has_table('public', 'lf_vocab');
select has_table('public', 'lf_knowledge');
select has_table('public', 'profiles');
select has_table('public', 'practice_sessions');
select has_table('public', 'practice_attempts');
select has_table('public', 'mistake_items');
select has_table('public', 'content_import_jobs');

select has_type('public', 'content_status');
select has_type('public', 'practice_type');
select has_type('public', 'mistake_type');
select has_type('public', 'mastery_status');
select has_function(
  'public',
  'replace_episode_content',
  array['uuid', 'text', 'jsonb', 'jsonb', 'jsonb']
);
select ok(
  has_function_privilege(
    'service_role',
    'public.replace_episode_content(uuid,text,jsonb,jsonb,jsonb)',
    'EXECUTE'
  ),
  'service_role can execute replace_episode_content'
);
select ok(
  not has_function_privilege(
    'authenticated',
    'public.replace_episode_content(uuid,text,jsonb,jsonb,jsonb)',
    'EXECUTE'
  ),
  'authenticated cannot execute replace_episode_content'
);

insert into public.lf_episodes (
  id,
  level,
  title,
  local_video_filename,
  local_srt_filename,
  content_hash
) values (
  '90000000-0000-0000-0000-000000000009',
  1,
  'Atomic Replacement Test',
  'atomic-test.mp4',
  'atomic-test.srt',
  'original-hash'
);

insert into public.lf_sentences (
  episode_id,
  sequence_no,
  english_text,
  chinese_translation
) values (
  '90000000-0000-0000-0000-000000000009',
  1,
  'Original sentence.',
  '原始句子。'
);

select lives_ok(
  $$
    select public.replace_episode_content(
      '90000000-0000-0000-0000-000000000009',
      'replacement-hash',
      '[{"sequence_no":1,"english_text":"Replacement sentence.","chinese_translation":"替换句子。"}]',
      '[{"word":"cloud","phonetic":"/klaʊd/","chinese_meaning":"云","sequence_no":1}]',
      '[{"title":"A note","grammar_explanation":"A fictional explanation.","core_knowledge":"A fictional core point.","sequence_no":1}]'
    )
  $$,
  'replace_episode_content accepts valid child arrays'
);
select is(
  (select content_hash from public.lf_episodes
   where id = '90000000-0000-0000-0000-000000000009'),
  'replacement-hash',
  'replacement updates the content hash'
);
select is(
  (select count(*) from public.lf_sentences
   where episode_id = '90000000-0000-0000-0000-000000000009'),
  1::bigint,
  'replacement creates the requested sentence set'
);

do $$
begin
  perform public.replace_episode_content(
    '90000000-0000-0000-0000-000000000009',
    'must-roll-back',
    '[{"sequence_no":1,"english_text":"First duplicate.","chinese_translation":"重复一。"},{"sequence_no":1,"english_text":"Second duplicate.","chinese_translation":"重复二。"}]',
    '[]',
    '[]'
  );
exception
  when unique_violation then null;
end;
$$;

select is(
  (select content_hash from public.lf_episodes
   where id = '90000000-0000-0000-0000-000000000009'),
  'replacement-hash',
  'replacement is atomic when a child insert fails'
);
select is(
  (select english_text from public.lf_sentences
   where episode_id = '90000000-0000-0000-0000-000000000009'),
  'Replacement sentence.',
  'failed replacement preserves the prior child rows'
);

select * from finish();
rollback;
