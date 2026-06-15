-- 0007_sanitized_read.sql
-- ADR-0002 #3 (sanitized public read model) · #4 (anonymization threshold) · L1-b
--
-- ★ THE single cross-user elevation point. content_clips_public / content_annotations_public
--   are definer views (security_invoker=false, owner=postgres) — the ONLY place RLS on
--   clips/annotations/profiles is bypassed. They expose ONLY sanitized columns:
--     content_id, *_id, interval/anchor, memo/body, cohort_job, cohort_years, cohort_revealed.
--   user_id / display_name / email are NOT selected → structurally impossible to leak identity.
--   Every social/heatmap read (0008) derives from these views, so the no-leak guarantee is
--   audited in exactly one place. (Proven by tests/derived-api-no-leak.sql.)

-- Anonymization threshold N (ADR-0002 #4): a (job,years) cohort smaller than N has its
-- cohort label hidden (job/years → null) to prevent re-identification; the anonymous
-- interval/memo still shows. Bump here to tune; default 5.
create or replace function public.anonymization_threshold()
returns integer language sql immutable set search_path = '' as $$ select 5 $$;
comment on function public.anonymization_threshold() is 'ADR-0002 #4: min distinct users per (job,years) cohort to reveal the cohort label.';

-- ── Public clips read model (anonymized social annotations + heatmap source) ──────────────
create view public.content_clips_public
with (security_invoker = false) as
with pub as (
  select c.content_id, c.id as clip_id, c.start_sec, c.end_sec, c.memo, c.created_at,
         c.user_id, p.job as cohort_job, p.years as cohort_years
  from public.clips c
  join public.profiles p on p.id = c.user_id
  where c.is_public and c.deleted_at is null
),
cohort as (
  select content_id, cohort_job, cohort_years, count(distinct user_id) as users
  from pub
  group by content_id, cohort_job, cohort_years
)
select
  pub.content_id,
  pub.clip_id,
  pub.start_sec,
  pub.end_sec,
  pub.memo,
  case when co.users >= public.anonymization_threshold() then pub.cohort_job   end as cohort_job,
  case when co.users >= public.anonymization_threshold() then pub.cohort_years end as cohort_years,
  (co.users >= public.anonymization_threshold())                                  as cohort_revealed,
  pub.created_at
from pub
join cohort co
  on  co.content_id   is not distinct from pub.content_id
  and co.cohort_job   is not distinct from pub.cohort_job
  and co.cohort_years is not distinct from pub.cohort_years;

comment on view public.content_clips_public is 'SANITIZED cross-user read model of PUBLIC clips. Definer view = sole RLS-elevation point. No user_id/display_name. Cohort hidden below anonymization_threshold().';

grant select on public.content_clips_public to anon, authenticated;

-- ── Public annotations read model (parallel, same sanitization) ────────────────────────────
create view public.content_annotations_public
with (security_invoker = false) as
with pub as (
  select a.content_id, a.id as annotation_id, a.at_sec, a.body, a.created_at,
         a.user_id, p.job as cohort_job, p.years as cohort_years
  from public.annotations a
  join public.profiles p on p.id = a.user_id
  where a.is_public and a.deleted_at is null
),
cohort as (
  select content_id, cohort_job, cohort_years, count(distinct user_id) as users
  from pub
  group by content_id, cohort_job, cohort_years
)
select
  pub.content_id,
  pub.annotation_id,
  pub.at_sec,
  pub.body,
  case when co.users >= public.anonymization_threshold() then pub.cohort_job   end as cohort_job,
  case when co.users >= public.anonymization_threshold() then pub.cohort_years end as cohort_years,
  (co.users >= public.anonymization_threshold())                                  as cohort_revealed,
  pub.created_at
from pub
join cohort co
  on  co.content_id   is not distinct from pub.content_id
  and co.cohort_job   is not distinct from pub.cohort_job
  and co.cohort_years is not distinct from pub.cohort_years;

comment on view public.content_annotations_public is 'SANITIZED cross-user read model of PUBLIC annotations. Same elevation/sanitization as content_clips_public.';

grant select on public.content_annotations_public to anon, authenticated;

-- ── Per-content RPC accessors (web + extension call these; thin invoker wrappers) ──────────
create or replace function public.get_content_social_clips(p_content_id uuid)
returns setof public.content_clips_public
language sql stable security invoker set search_path = '' as $$
  select * from public.content_clips_public where content_id = p_content_id order by start_sec, clip_id
$$;

create or replace function public.get_content_annotations(p_content_id uuid)
returns setof public.content_annotations_public
language sql stable security invoker set search_path = '' as $$
  select * from public.content_annotations_public where content_id = p_content_id order by at_sec, annotation_id
$$;

grant execute on function public.get_content_social_clips(uuid) to anon, authenticated;
grant execute on function public.get_content_annotations(uuid) to anon, authenticated;
