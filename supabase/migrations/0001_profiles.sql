-- 0001_profiles.sql
-- Grabit · u0b-data-core · Sprint 0 · greenfield first migration
-- ADR-0002 #6 (profile split) · #4 (anonymization cohort = job+years)
--
-- profiles = 1:1 with auth.users.
--   PUBLIC cohort dims  : (job, years)  → exposed ONLY in aggregate via the sanitized
--                         read model (0007); NEVER selectable row-level cross-user.
--   PRIVATE             : display_name, interests, goal  → recommendation inputs /
--                         self-only; never present in any cross-user read.

create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  -- public cohort dimensions (aggregate-only exposure; see 0007 sanitized read model)
  job           text,                                  -- 직업 칩(10). null until onboarding.
  years         text,                                  -- 연차 버킷 칩(6). already coarse-bucketed.
  -- private (self-only — never in cross-user sanitized reads)
  display_name  text,                                  -- 실명/표시명 — 재식별 위험, 비노출.
  interests     text[]      not null default '{}',     -- 관심분야(복수). 추천 입력. private.
  goal          text,                                  -- 목표/상황 칩(단일). private.
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table  public.profiles            is 'User profile. (job,years)=public cohort, exposed only via sanitized aggregate (0007). display_name/interests/goal=private, self-only.';
comment on column public.profiles.job        is 'Public cohort dim. Exposed only in aggregate (>= anonymization_threshold).';
comment on column public.profiles.years      is 'Public cohort dim (already bucketed). Exposed only in aggregate.';
comment on column public.profiles.display_name is 'PRIVATE — never exposed in cross-user sanitized reads (re-identification risk).';

-- shared updated_at touch (reused by contents/folders/annotations)
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- RLS: a user reads/writes ONLY their own profile row.
-- Cross-user cohort (job+years) is reachable ONLY through the SECURITY DEFINER /
-- definer-view sanitized aggregates (0007) — this row-level lock is the deanonymization guard.
alter table public.profiles enable row level security;

create policy profiles_select_own on public.profiles
  for select using ( (select auth.uid()) = id );
create policy profiles_insert_own on public.profiles
  for insert with check ( (select auth.uid()) = id );
create policy profiles_update_own on public.profiles
  for update using ( (select auth.uid()) = id ) with check ( (select auth.uid()) = id );

grant select, insert, update on public.profiles to authenticated;

-- Auto-provision a profile row on signup (display_name seeded from OAuth metadata if present).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
