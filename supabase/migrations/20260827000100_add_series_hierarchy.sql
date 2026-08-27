-- Keep learning units addressable as Level → series → numbered episode.
-- The temporary defaults safely backfill any development data created before
-- series metadata existed; defaults are removed before new writes are allowed.
alter table public.lf_episodes
  add column if not exists series_title text not null default 'Unsorted'
    check (length(btrim(series_title)) > 0),
  add column if not exists episode_number integer not null default 1
    check (episode_number > 0);

update public.lf_episodes
set series_title = title,
    episode_number = 1
where series_title = 'Unsorted';

alter table public.lf_episodes
  alter column series_title drop default,
  alter column episode_number drop default,
  add constraint lf_episodes_level_series_episode_key
    unique (level, series_title, episode_number);
