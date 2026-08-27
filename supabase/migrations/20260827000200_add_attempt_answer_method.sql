-- Preserve how a child demonstrated an answer, so progress can distinguish
-- spelling mastery, spoken-word recognition, and sentence reading.
alter table public.practice_attempts
  add column if not exists answer_method text not null default 'written',
  add constraint practice_attempts_answer_method_check
    check (answer_method in ('written', 'spoken', 'sentence_reading'));

alter table public.practice_attempts
  alter column answer_method drop default;

create index if not exists practice_attempts_user_answer_method_idx
  on public.practice_attempts(user_id, answer_method, created_at desc);
