begin;

select plan(9);

select has_type('public', 'learning_track');
select has_type('public', 'learning_event_type');
select has_table('public', 'learning_events');
select has_table('public', 'learner_preferences');
select has_table('public', 'local_progress_imports');

insert into auth.users (
  id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('a0000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'online-a@example.test', '{}', '{}', now(), now()),
  ('b0000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'online-b@example.test', '{}', '{}', now(), now());

insert into public.learning_events (
  id, user_id, track, event_type, occurred_at, local_day, payload
) values
  ('a1000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'extra', 'mastered', now(), current_date, '{"item":{"id":"word-a"}}'),
  ('b1000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'school', 'page_completed', now(), current_date, '{"pageId":"page-b"}');

insert into public.learner_preferences (user_id, selected_textbook_id) values
  ('a0000000-0000-0000-0000-000000000001', 'pep4a'),
  ('b0000000-0000-0000-0000-000000000002', 'pep4b');

insert into public.local_progress_imports (user_id, source_key, source_version, event_count) values
  ('a0000000-0000-0000-0000-000000000001', 'coucoumeow.learning-progress.v1', 1, 1),
  ('b0000000-0000-0000-0000-000000000002', 'coucoumeow.school-progress.v1', 1, 1);

set local role authenticated;
select set_config('request.jwt.claim.sub', 'a0000000-0000-0000-0000-000000000001', true);

select is(
  (select array_agg(id::text order by id) from public.learning_events),
  array['a1000000-0000-0000-0000-000000000001']::text[],
  'user A sees only its online learning event'
);
select is(
  (select array_agg(selected_textbook_id order by selected_textbook_id) from public.learner_preferences),
  array['pep4a']::text[],
  'user A sees only its learner preference'
);
select is(
  (select array_agg(source_key order by source_key) from public.local_progress_imports),
  array['coucoumeow.learning-progress.v1']::text[],
  'user A sees only its import receipt'
);
select throws_ok(
  $$
    insert into public.learning_events (
      id, user_id, track, event_type, occurred_at, local_day, payload
    ) values (
      'a2000000-0000-0000-0000-000000000001',
      'b0000000-0000-0000-0000-000000000002',
      'extra',
      'mastered',
      now(),
      current_date,
      '{}'
    )
  $$,
  '42501',
  null,
  'user A cannot insert an online learning event for user B'
);

select * from finish();
rollback;
