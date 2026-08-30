begin;

select plan(18);

select has_table('public', 'school_textbooks');
select has_table('public', 'school_units');
select has_table('public', 'school_lessons');
select has_table('public', 'school_pages');
select has_table('public', 'school_content_items');
select has_table('public', 'school_page_items');
select has_table('public', 'school_lesson_items');
select has_table('public', 'school_exercises');

insert into auth.users (
  id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  'c0000000-0000-0000-0000-000000000003',
  'authenticated',
  'authenticated',
  'content-reader@example.test',
  '{}',
  '{}',
  now(),
  now()
);

insert into public.school_textbooks (
  content_key, curriculum, grade, semester, title, content_version, content_hash, content_status
) values
  ('published-book', 'PEP', 4, 'upper', 'Published book', 1, repeat('a', 64), 'published'),
  ('draft-book', 'PEP', 5, 'upper', 'Draft book', 1, repeat('b', 64), 'draft');

insert into public.lf_episodes (
  content_key, level, series_title, episode_number, title, chinese_title,
  content_status, content_hash, media_provider
) values
  ('published-episode', 1, 'Series', 1, 'Published episode', '已发布', 'published', repeat('c', 64), 'remote'),
  ('draft-episode', 1, 'Series', 2, 'Draft episode', '草稿', 'draft', repeat('d', 64), 'remote');

set local role authenticated;
select set_config('request.jwt.claim.sub', 'c0000000-0000-0000-0000-000000000003', true);

select is(
  (select array_agg(content_key order by content_key) from public.school_textbooks),
  array['published-book']::text[],
  'authenticated user reads the published school textbook'
);
select is(
  (select array_agg(content_key order by content_key) from public.lf_episodes),
  array['published-episode']::text[],
  'draft extracurricular episode is hidden'
);
select throws_ok(
  $$ select public.import_school_textbook('{}'::jsonb) $$,
  '42501',
  null,
  'authenticated user cannot execute the school importer'
);
select throws_ok(
  $$ select public.import_extra_episode('{}'::jsonb) $$,
  '42501',
  null,
  'authenticated user cannot execute the extra importer'
);
select throws_ok(
  $$ select public.publish_content('school', 'published-book') $$,
  '42501',
  null,
  'authenticated user cannot publish content'
);

select col_is_unique('public', 'school_textbooks', 'content_key');
select col_is_unique('public', 'school_units', 'content_key');
select col_is_unique('public', 'school_lessons', 'content_key');
select col_is_unique('public', 'school_pages', 'content_key');
select col_is_unique('public', 'school_content_items', 'content_key');

select * from finish();
rollback;
