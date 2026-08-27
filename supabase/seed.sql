-- Fully fictional development content created for this project.
insert into public.lf_episodes (
  id,
  level,
  title,
  local_video_filename,
  local_srt_filename,
  content_status,
  content_hash
) values (
  'a1000000-0000-0000-0000-000000000001',
  1,
  'The Sleepy Cat',
  'the-sleepy-cat.mp4',
  'the-sleepy-cat.srt',
  'published',
  'fictional-sleepy-cat-v1'
);

insert into public.lf_sentences (
  id,
  episode_id,
  sequence_no,
  english_text,
  chinese_translation
) values
  (
    'a2000000-0000-0000-0000-000000000001',
    'a1000000-0000-0000-0000-000000000001',
    1,
    'Mimi naps beside a blue pillow.',
    '米米在蓝色枕头旁打盹。'
  ),
  (
    'a2000000-0000-0000-0000-000000000002',
    'a1000000-0000-0000-0000-000000000001',
    2,
    'A tiny bell rings, and she opens one eye.',
    '一只小铃铛响了，她睁开一只眼睛。'
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
    'a3000000-0000-0000-0000-000000000001',
    'a1000000-0000-0000-0000-000000000001',
    'sleepy',
    '/ˈsliːpi/',
    '困倦的',
    1
  ),
  (
    'a3000000-0000-0000-0000-000000000002',
    'a1000000-0000-0000-0000-000000000001',
    'pillow',
    '/ˈpɪləʊ/',
    '枕头',
    2
  );

insert into public.lf_knowledge (
  id,
  episode_id,
  title,
  grammar_explanation,
  core_knowledge,
  sequence_no
) values (
  'a4000000-0000-0000-0000-000000000001',
  'a1000000-0000-0000-0000-000000000001',
  'Simple present actions',
  'Use a verb ending in -s for what one character does now or regularly.',
  'Mimi naps. A bell rings. She opens one eye.',
  1
);
