-- 0013_settings_account.sql
-- Grabit · u11-settings-account · Sprint 0 (후행) · ADDITIVE over u0b (does NOT touch 0001-0012)
-- ADR-0002 #6 (profile public/private split) · #9 (lifecycle = soft-delete, 30-day grace) ·
--            #3 (sanitized public read model)
--
-- Adds account settings on top of the FROZEN u0b/u1 contracts:
--   ① profiles.deleted_at  : 30-day grace soft-delete flag (additive column; NULL = live).
--   ② update_profile(...)  : self-only edit of the existing profile cohort dims + display_name.
--        Reuses _sanitize_label (0010) + the SAME validation as complete_onboarding
--        (job/years/goal single-required, interests 1..5). PRIVATE (interests/goal/display_name)
--        stays self-only; PUBLIC cohort (job/years) keeps its aggregate-only exposure (#6).
--        Does NOT touch onboarded_at → editing an onboarded profile stays onboarded.
--   ③ get_my_profile() / soft_delete_account() / restore_account() : self lifecycle primitives.
--        soft_delete is idempotent (re-request on an already-deleted row is harmless, no
--        hard-delete ever). Restore clears deleted_at within the grace window.
--   ④ notification_settings : per-user per-category ON/OFF table (own RLS), non-billing only.
--        set_notification_pref / get_notification_prefs : self read/write primitives.
--   ⑤ sanitized views (0007) + onboarding_cohorts_public (0010) get a deleted_at IS NULL
--        filter ADDED (privacy-strengthening, #9): a grace-period user's clips/annotations/
--        cohort are EXCLUDED from every public aggregate. Column signatures are PRESERVED
--        (CREATE OR REPLACE VIEW keeps identical output columns) → 0007/0008/0010 readers and
--        the existing pgTAP (derived-api-no-leak / rls-isolation / profile-cohort-split) do NOT
--        regress. No existing column dropped, no RLS weakened.
--
-- u0b/u1 stay untouched: 0001-0012 files, base columns/RLS, complete_onboarding, clips,
-- get_or_create_content, content_heatmap signatures. Only additive columns/functions/table +
-- privacy-only CREATE OR REPLACE VIEW filters here.

-- ── ① soft-delete flag (additive column; NULL = live account) ────────────────────────────────
alter table public.profiles
  add column if not exists deleted_at timestamptz;

comment on column public.profiles.deleted_at is
  'ADR-0002 #9 soft-delete: NULL=live. Set by soft_delete_account() (30-day grace, no hard-delete). Cleared by restore_account(). While set, the user is excluded from every sanitized public aggregate (0007/0008/0010).';

-- ── ② profile edit: self-only update of cohort dims + display_name (L1-b) ─────────────────────
-- SECURITY INVOKER → RLS-owned (profiles_update_own: auth.uid()=id). No id param → others
-- unreachable. Same sanitize/validate contract as complete_onboarding (0010). Does NOT change
-- onboarded_at and does NOT resurrect a soft-deleted row (raises if deleted_at set).
create or replace function public.update_profile(
  p_display_name text,
  p_job          text,
  p_years        text,
  p_goal         text,
  p_interests    text[]
)
returns public.profiles
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_uid    uuid := (select auth.uid());
  v_name   text := public._sanitize_label(p_display_name);
  v_job    text := public._sanitize_label(p_job);
  v_years  text := public._sanitize_label(p_years);
  v_goal   text := public._sanitize_label(p_goal);
  v_clean  text[];
  v_n      integer;
  v_row    public.profiles;
begin
  -- ① auth required → unauthenticated/expired rejected (42501 → 401/403 at the API)
  if v_uid is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501',
      detail = 'update_profile requires an authenticated user';
  end if;

  -- ② display_name: empty/whitespace blocked (re-identification-safe but must be non-blank)
  if v_name is null then
    raise exception 'DISPLAY_NAME_REQUIRED' using errcode = '23514',
      detail = 'display_name must be non-blank';
  end if;

  -- ③ single-required cohort dims present after sanitize (job/years/goal) — parity with onboarding
  if v_job is null then
    raise exception 'JOB_REQUIRED'   using errcode = '23514', detail = 'job (single) required';
  end if;
  if v_years is null then
    raise exception 'YEARS_REQUIRED' using errcode = '23514', detail = 'years (single) required';
  end if;
  if v_goal is null then
    raise exception 'GOAL_REQUIRED'  using errcode = '23514', detail = 'goal/situation (single) required';
  end if;

  -- ④ interests: sanitize each, drop blanks, order-preserving dedupe (custom input included)
  select coalesce(array_agg(d.s order by d.ord), '{}'::text[])
    into v_clean
  from (
    select public._sanitize_label(u.e) as s, min(u.ord) as ord
    from unnest(coalesce(p_interests, '{}'::text[])) with ordinality as u(e, ord)
    group by public._sanitize_label(u.e)
  ) d
  where d.s is not null;

  -- ⑤ interests count boundary: reject 0 and 6+ (keep 1..5) — parity with onboarding
  v_n := coalesce(array_length(v_clean, 1), 0);
  if v_n < 1 then
    raise exception 'INTERESTS_MIN' using errcode = '23514', detail = 'at least 1 interest required';
  end if;
  if v_n > 5 then
    raise exception 'INTERESTS_MAX' using errcode = '23514', detail = 'at most 5 interests allowed';
  end if;

  -- ⑥ write SELF row only — RLS with-check (auth.uid()=id); skip soft-deleted rows (must restore
  --    first). onboarded_at is NOT touched → an onboarded profile stays onboarded.
  update public.profiles
     set display_name = v_name,
         job          = v_job,
         years        = v_years,
         goal         = v_goal,
         interests    = v_clean
   where id = v_uid
     and deleted_at is null
  returning * into v_row;

  if not found then
    -- either no profile row, or the row is in soft-delete grace (must restore before editing)
    if exists (select 1 from public.profiles where id = v_uid and deleted_at is not null) then
      raise exception 'ACCOUNT_DELETED' using errcode = 'P0002',
        detail = 'profile is in soft-delete grace; restore before editing';
    end if;
    raise exception 'PROFILE_MISSING' using errcode = 'P0002',
      detail = 'no profile row for the authenticated user';
  end if;

  return v_row;
end;
$$;

comment on function public.update_profile(text,text,text,text,text[]) is
  'u11 profile edit (L1-b). Invoker (RLS self-write). display_name non-blank, job/years/goal single-required, interests 1..5 sanitized+deduped (parity with complete_onboarding). Leaves onboarded_at intact; refuses soft-deleted rows. 42501=unauth, 23514=validation.';

revoke execute on function public.update_profile(text,text,text,text,text[]) from public;
grant  execute on function public.update_profile(text,text,text,text,text[]) to authenticated;

-- ── ③ self profile read (includes deleted_at for recovery-banner UX; L1-b/d) ──────────────────
-- Thin invoker accessor: returns the caller's own profile row (RLS already self-scoped). Exposed
-- so the web can read display_name/cohort + deleted_at (recovery state) in one call.
create or replace function public.get_my_profile()
returns public.profiles
language sql
stable
security invoker
set search_path = ''
as $$
  select * from public.profiles where id = (select auth.uid())
$$;

comment on function public.get_my_profile() is
  'u11 self profile read (L1-b/d). Invoker (RLS self-only). Returns own row incl. deleted_at so the client can render the soft-delete recovery banner.';

grant execute on function public.get_my_profile() to authenticated;

-- ── ③ soft-delete (L1-d): 30-day grace, NO hard-delete, idempotent ───────────────────────────
create or replace function public.soft_delete_account()
returns public.profiles
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_row public.profiles;
begin
  if v_uid is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501',
      detail = 'soft_delete_account requires an authenticated user';
  end if;

  -- Idempotent: set deleted_at only if not already set (re-request is harmless, keeps the
  -- original grace-start). RLS (profiles_update_own) restricts the target to the caller.
  update public.profiles
     set deleted_at = now()
   where id = v_uid
     and deleted_at is null
  returning * into v_row;

  if not found then
    -- either already soft-deleted (idempotent no-op → return current row) or missing profile
    select * into v_row from public.profiles where id = v_uid;
    if not found then
      raise exception 'PROFILE_MISSING' using errcode = 'P0002',
        detail = 'no profile row for the authenticated user';
    end if;
  end if;

  return v_row;  -- deleted_at is non-null; grace = deleted_at + 30 days
end;
$$;

comment on function public.soft_delete_account() is
  'u11 account withdrawal (L1-d). Invoker (RLS self-only). Sets profiles.deleted_at = now() (30-day grace; client computes deleted_at+30d). NEVER hard-deletes. Idempotent: re-request on an already-deleted row is a no-op keeping the original grace-start. 42501=unauth.';

revoke execute on function public.soft_delete_account() from public;
grant  execute on function public.soft_delete_account() to authenticated;

-- ── ③ restore (L1-d): clear deleted_at within the grace window; idempotent ───────────────────
create or replace function public.restore_account()
returns public.profiles
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_row public.profiles;
begin
  if v_uid is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501',
      detail = 'restore_account requires an authenticated user';
  end if;

  update public.profiles
     set deleted_at = null
   where id = v_uid
  returning * into v_row;

  if not found then
    raise exception 'PROFILE_MISSING' using errcode = 'P0002',
      detail = 'no profile row for the authenticated user';
  end if;

  return v_row;  -- deleted_at cleared → account live again
end;
$$;

comment on function public.restore_account() is
  'u11 account recovery (L1-d). Invoker (RLS self-only). Clears profiles.deleted_at → live again. Idempotent on a live row. 42501=unauth.';

revoke execute on function public.restore_account() from public;
grant  execute on function public.restore_account() to authenticated;

-- ── ④ notification settings: per-user per-category ON/OFF (L1-e) ─────────────────────────────
-- Per-user key/value (category → enabled). Own RLS (parity with folders/tags). Non-billing
-- categories only (billing/subscription-expiry alerts are out of scope per gate ⓐ). Toggling
-- here is settings-only; the send pipeline is a follow-up unit.
create table if not exists public.notification_settings (
  user_id     uuid        not null references auth.users (id) on delete cascade,
  category    text        not null,
  enabled     boolean     not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  primary key (user_id, category),
  constraint notification_settings_category_not_blank check (length(btrim(category)) > 0),
  -- guard: no billing/subscription/receipt category persisted (gate ⓐ scope)
  constraint notification_settings_non_billing
    check (category not in ('billing', 'subscription', 'subscription_expiry', 'receipt', 'payment'))
);

comment on table public.notification_settings is
  'u11 per-user per-category notification ON/OFF (L1-e). Own RLS. Non-billing categories only (gate ⓐ: no subscription-expiry/receipt). Settings-only; send pipeline is a follow-up.';

-- touch updated_at on change (reuses the shared trigger fn from 0001)
drop trigger if exists notification_settings_touch_updated_at on public.notification_settings;
create trigger notification_settings_touch_updated_at
  before update on public.notification_settings
  for each row execute function public.touch_updated_at();

alter table public.notification_settings enable row level security;

drop policy if exists notification_settings_select_own on public.notification_settings;
drop policy if exists notification_settings_insert_own on public.notification_settings;
drop policy if exists notification_settings_update_own on public.notification_settings;
drop policy if exists notification_settings_delete_own on public.notification_settings;
create policy notification_settings_select_own on public.notification_settings
  for select using ( (select auth.uid()) = user_id );
create policy notification_settings_insert_own on public.notification_settings
  for insert with check ( (select auth.uid()) = user_id );
create policy notification_settings_update_own on public.notification_settings
  for update using ( (select auth.uid()) = user_id ) with check ( (select auth.uid()) = user_id );
create policy notification_settings_delete_own on public.notification_settings
  for delete using ( (select auth.uid()) = user_id );
grant select, insert, update, delete on public.notification_settings to authenticated;

-- self write primitive: upsert a category toggle (self only, RLS-enforced)
create or replace function public.set_notification_pref(
  p_category text,
  p_enabled  boolean
)
returns public.notification_settings
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_cat text := public._sanitize_label(p_category);
  v_row public.notification_settings;
begin
  if v_uid is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501',
      detail = 'set_notification_pref requires an authenticated user';
  end if;
  if v_cat is null then
    raise exception 'CATEGORY_REQUIRED' using errcode = '23514', detail = 'category must be non-blank';
  end if;
  if p_enabled is null then
    raise exception 'ENABLED_REQUIRED' using errcode = '23514', detail = 'enabled must be true/false';
  end if;

  insert into public.notification_settings (user_id, category, enabled)
  values (v_uid, v_cat, p_enabled)
  on conflict (user_id, category)
    do update set enabled = excluded.enabled
  returning * into v_row;   -- the non-billing CHECK rejects billing categories (23514)

  return v_row;
end;
$$;

comment on function public.set_notification_pref(text,boolean) is
  'u11 notification toggle (L1-e). Invoker (RLS self-only) upsert of (category→enabled). Non-billing only (table CHECK rejects billing/subscription/receipt → 23514). 42501=unauth.';

revoke execute on function public.set_notification_pref(text,boolean) from public;
grant  execute on function public.set_notification_pref(text,boolean) to authenticated;

-- self read primitive: own toggles
create or replace function public.get_notification_prefs()
returns setof public.notification_settings
language sql
stable
security invoker
set search_path = ''
as $$
  select * from public.notification_settings
  where user_id = (select auth.uid())
  order by category
$$;

comment on function public.get_notification_prefs() is
  'u11 notification settings read (L1-e). Invoker (RLS self-only). Returns the caller''s category toggles.';

grant execute on function public.get_notification_prefs() to authenticated;

-- ── ⑤ privacy-strengthening: exclude grace-period users from every public aggregate (#9) ──────
-- CREATE OR REPLACE VIEW keeps the EXACT output columns/order/names of 0007/0010 (signature
-- preserved). Only an ADDED `p.deleted_at is null` predicate (clips already filter their own
-- deleted_at). No column dropped, no RLS weakened → derived-api-no-leak / rls-isolation /
-- profile-cohort-split do not regress; a soft-deleted user's clips/annotations/cohort drop to 0.

create or replace view public.content_clips_public
with (security_invoker = false) as
with pub as (
  select c.content_id, c.id as clip_id, c.start_sec, c.end_sec, c.memo, c.created_at,
         c.user_id, p.job as cohort_job, p.years as cohort_years
  from public.clips c
  join public.profiles p on p.id = c.user_id
  where c.is_public and c.deleted_at is null
    and p.deleted_at is null                         -- #9: exclude grace-period owners (ADDED)
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

comment on view public.content_clips_public is 'SANITIZED cross-user read model of PUBLIC clips. Definer view = sole RLS-elevation point. No user_id/display_name. Cohort hidden below anonymization_threshold(). Grace-period (soft-deleted) owners excluded (#9).';

create or replace view public.content_annotations_public
with (security_invoker = false) as
with pub as (
  select a.content_id, a.id as annotation_id, a.at_sec, a.body, a.created_at,
         a.user_id, p.job as cohort_job, p.years as cohort_years
  from public.annotations a
  join public.profiles p on p.id = a.user_id
  where a.is_public and a.deleted_at is null
    and p.deleted_at is null                         -- #9: exclude grace-period owners (ADDED)
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

comment on view public.content_annotations_public is 'SANITIZED cross-user read model of PUBLIC annotations. Same elevation/sanitization as content_clips_public. Grace-period (soft-deleted) owners excluded (#9).';

-- onboarding cohort aggregate: also exclude grace-period users (signature preserved)
create or replace view public.onboarding_cohorts_public
with (security_invoker = false) as
with completed as (
  select job, years
  from public.profiles
  where onboarded_at is not null
    and deleted_at is null                           -- #9: exclude grace-period users (ADDED)
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
  'ADR-0002 #6: PUBLIC cohort aggregate (job+years user counts) over COMPLETED onboarding only (onboarded_at not null). No interests/goal/display_name/auth → private separated. Sub-threshold cohorts dropped (#4). Incomplete profiles contribute 0. Grace-period (soft-deleted) users excluded (#9).';
