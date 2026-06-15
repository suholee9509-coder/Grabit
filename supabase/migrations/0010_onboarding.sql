-- 0010_onboarding.sql
-- Grabit · u1-auth-onboarding · Sprint 1 · ADDITIVE over u0b (does NOT touch 0001-0009)
-- ADR-0001 (Auth=Google+Kakao) · ADR-0002 #6 (profile private/public split) · #4 (anonymization)
--
-- Adds onboarding completion on top of the FROZEN u0b profiles contract (0001):
--   onboarded_at  : completion flag/timestamp (gating). NULL = incomplete.
--   complete_onboarding(job,years,goal,interests[]) : the single onboarding-save write
--       primitive. SECURITY INVOKER → RLS-owned (self-only write); auth.uid() is the only
--       target (no id param) → cannot write another user's profile. Validates single-required
--       job/years/goal, interests 1..5, sanitizes every label (XSS-harmless, length-capped).
--   is_onboarded() : self gating predicate (auth → onboarding route vs home).
--   onboarding_cohorts_public : PUBLIC cohort aggregate (job+years counts) over COMPLETED
--       onboarding only. interests/goal/display_name/auth are never selected → private stays
--       private (#6). Sub-threshold cohorts dropped (#4). Incomplete profiles contribute 0.
--
-- u0b stays untouched: profiles base columns/RLS/handle_new_user, clips, get_or_create_content,
-- content_clips_public, content_heatmap. Only an additive column + new functions/view here.

-- ── onboarding completion flag (additive column; NULL = not yet onboarded) ──────────────────
alter table public.profiles
  add column if not exists onboarded_at timestamptz;

comment on column public.profiles.onboarded_at is
  'Onboarding completion timestamp. NULL=incomplete (gated to onboarding route). Set by complete_onboarding(). Gates public cohort exposure (onboarding_cohorts_public).';

-- ── label sanitizer (XSS-harmless): strip tags + stray angle brackets + control chars,
--    collapse whitespace, length-cap, empty→NULL. Reused for job/years/goal + each interest. ──
create or replace function public._sanitize_label(p_in text)
returns text
language sql
immutable
set search_path = ''
as $$
  select nullif(
    btrim(
      left(
        regexp_replace(
          regexp_replace(
            regexp_replace(coalesce(p_in, ''), '<[^>]*>', '', 'g'),  -- strip tag-like spans
            '[<>[:cntrl:]]', '', 'g'                                  -- strip stray < > + control chars
          ),
          '\s+', ' ', 'g'                                             -- collapse whitespace runs
        ),
        40                                                            -- per-label length cap
      )
    ),
  '')
$$;

comment on function public._sanitize_label(text) is
  'Onboarding input sanitizer: removes HTML tags/angle brackets/control chars, collapses whitespace, caps length 40, empty→NULL. Makes free-text interests XSS-harmless.';

-- ── onboarding save: the single profile-completion write primitive (web .rpc calls this) ─────
create or replace function public.complete_onboarding(
  p_job       text,
  p_years     text,
  p_goal      text,
  p_interests text[]
)
returns public.profiles
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_uid   uuid := (select auth.uid());
  v_job   text := public._sanitize_label(p_job);
  v_years text := public._sanitize_label(p_years);
  v_goal  text := public._sanitize_label(p_goal);
  v_clean text[];
  v_n     integer;
  v_row   public.profiles;
begin
  -- ① auth required → unauthenticated/expired rejected (42501 → 401/403 at the API)
  if v_uid is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501',
      detail = 'complete_onboarding requires an authenticated user';
  end if;

  -- ② single-required fields present after sanitize (job/years/goal)
  if v_job is null then
    raise exception 'JOB_REQUIRED'   using errcode = '23514', detail = 'job (single) required';
  end if;
  if v_years is null then
    raise exception 'YEARS_REQUIRED' using errcode = '23514', detail = 'years (single) required';
  end if;
  if v_goal is null then
    raise exception 'GOAL_REQUIRED'  using errcode = '23514', detail = 'goal/situation (single) required';
  end if;

  -- ③ interests: sanitize each, drop blanks, order-preserving dedupe (custom input included)
  select coalesce(array_agg(d.s order by d.ord), '{}'::text[])
    into v_clean
  from (
    select public._sanitize_label(u.e) as s, min(u.ord) as ord
    from unnest(coalesce(p_interests, '{}'::text[])) with ordinality as u(e, ord)
    group by public._sanitize_label(u.e)
  ) d
  where d.s is not null;

  -- ④ interests count boundary: reject 0 and 6+ (keep 1..5)
  v_n := coalesce(array_length(v_clean, 1), 0);
  if v_n < 1 then
    raise exception 'INTERESTS_MIN' using errcode = '23514', detail = 'at least 1 interest required';
  end if;
  if v_n > 5 then
    raise exception 'INTERESTS_MAX' using errcode = '23514', detail = 'at most 5 interests allowed';
  end if;

  -- ⑤ write SELF row only — RLS with-check (auth.uid()=id); no id param → others unreachable
  update public.profiles
     set job          = v_job,
         years        = v_years,
         goal         = v_goal,
         interests    = v_clean,
         onboarded_at = now()
   where id = v_uid
  returning * into v_row;

  if not found then
    raise exception 'PROFILE_MISSING' using errcode = 'P0002',
      detail = 'no profile row for the authenticated user';
  end if;

  return v_row;
end;
$$;

comment on function public.complete_onboarding(text,text,text,text[]) is
  'u1 onboarding-save (L1-c). Invoker (RLS self-write). job/years/goal single-required, interests 1..5 sanitized+deduped, sets onboarded_at. 42501=unauth, 23514=validation.';

revoke execute on function public.complete_onboarding(text,text,text,text[]) from public;
grant  execute on function public.complete_onboarding(text,text,text,text[]) to authenticated;

-- ── gating predicate (auth → onboarding vs home; L1-b/e) ─────────────────────────────────────
create or replace function public.is_onboarded()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and onboarded_at is not null
  )
$$;

comment on function public.is_onboarded() is
  'u1 onboarding gate (L1-b/e): true iff the authenticated user completed onboarding (onboarded_at not null). anon → false.';

grant execute on function public.is_onboarded() to anon, authenticated;

-- ── PUBLIC cohort aggregate (ADR-0002 #6): job+years counts, COMPLETED-only, threshold-gated ─
-- Definer view = cross-user elevation, but exposes ONLY (job,years,count): interests/goal/
-- display_name/auth are never selected → private separated. onboarded_at filter → incomplete
-- profiles contribute 0. Sub-threshold cohorts dropped (re-identification guard, #4).
create view public.onboarding_cohorts_public
with (security_invoker = false) as
with completed as (
  select job, years
  from public.profiles
  where onboarded_at is not null
    and job   is not null
    and years is not null
),
agg as (
  select job, years, count(*)::integer as users
  from completed
  group by job, years
)
select
  job   as cohort_job,
  years as cohort_years,
  users
from agg
where users >= public.anonymization_threshold();

comment on view public.onboarding_cohorts_public is
  'ADR-0002 #6: PUBLIC cohort aggregate (job+years user counts) over COMPLETED onboarding only (onboarded_at not null). No interests/goal/display_name/auth → private separated. Sub-threshold cohorts dropped (#4). Incomplete profiles contribute 0.';

grant select on public.onboarding_cohorts_public to anon, authenticated;

create or replace function public.get_onboarding_cohorts()
returns setof public.onboarding_cohorts_public
language sql
stable
security invoker
set search_path = ''
as $$
  select * from public.onboarding_cohorts_public
  order by users desc, cohort_job, cohort_years
$$;

comment on function public.get_onboarding_cohorts() is
  'Thin invoker wrapper over the definer cohort aggregate (parity with 0007 accessors).';

grant execute on function public.get_onboarding_cohorts() to anon, authenticated;
