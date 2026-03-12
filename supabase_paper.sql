-- PAPER Protocol (MVP) Supabase schema
-- Run in Supabase SQL editor.

create table if not exists public.paper_challenges (
  id text primary key,
  session_id text not null,
  seed text not null,
  instructions text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists paper_challenges_session_idx on public.paper_challenges(session_id);

create table if not exists public.paper_submissions (
  id text primary key,
  challenge_id text not null references public.paper_challenges(id) on delete cascade,
  session_id text not null,
  artifact text not null,
  points int not null default 0,
  verdict text not null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists paper_submissions_session_idx on public.paper_submissions(session_id);
create index if not exists paper_submissions_challenge_idx on public.paper_submissions(challenge_id);

create table if not exists public.paper_balances (
  session_id text primary key,
  points bigint not null default 0,
  updated_at timestamptz not null default now()
);

-- Idempotent accumulator function
create or replace function public.paper_add_points(p_session_id text, p_points int)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.paper_balances(session_id, points)
  values (p_session_id, p_points)
  on conflict (session_id)
  do update set points = public.paper_balances.points + excluded.points,
               updated_at = now();
end;
$$;

-- NOTE: For MVP, keep RLS off on these tables, or add policies later.
