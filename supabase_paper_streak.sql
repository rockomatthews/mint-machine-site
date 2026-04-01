-- PAPER Protocol: streak + daily cap
-- Apply after supabase_paper.sql

create table if not exists public.paper_session_state (
  session_id text primary key,
  streak int not null default 0,
  last_ok_at timestamptz,
  day text not null default '',
  challenges_issued int not null default 0,
  submissions_total int not null default 0,
  submissions_ok int not null default 0,
  updated_at timestamptz not null default now()
);

create index if not exists paper_session_state_day_idx on public.paper_session_state(day);
