-- Mint Machine: Profiles (username + avatar)

create table if not exists public.mint_profiles (
  session_id text primary key,
  username text,
  avatar_url text,
  updated_at timestamptz not null default now()
);

create index if not exists mint_profiles_updated_idx on public.mint_profiles(updated_at);
