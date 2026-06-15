-- 0011_library_folders.sql
-- Grabit · u7-library · Sprint 0 (Wave) · ADDITIVE over u0b (does NOT touch 0001-0010)
-- ADR-0002 #8 (library relations · folder=clip attachment) · #9 (lifecycle · soft-delete)
-- spec docs/units/u7-library/spec.md §Acceptance(BE) · DM2 (folder=clip attach) · DM-folder-delete
--
-- u0b ALREADY provides (FROZEN — consumed/extended only here, never altered):
--   * folders(id,user_id,name,parent_id,sort_order,created_at,updated_at)  [0003]
--       + folders_name_not_blank CHECK, RLS (select/insert/update/delete own),
--         enforce_folder_limit()+folders_limit_guard (max 20), folders_touch_updated_at.
--   * clips.folder_id uuid REFERENCES folders ON DELETE SET NULL  [0004]
--       → a folder HARD-delete already NULLs attachments (clips preserved).
--   * contents.provider (canonical source key, e.g. 'youtube')  [0002] → source counts.
--
-- This file adds ONLY what u7 needs on top, idempotently (re-runnable from 0001):
--   (1) folders.deleted_at   — soft-delete column (ADR-0002 #9). u0b had hard DELETE only.
--   (2) enforce_folder_limit() redefined to count ACTIVE folders (deleted_at IS NULL) ≤ 20
--       so soft-deleted folders free a slot. (CREATE OR REPLACE = additive; 0003's
--       folders_limit_guard trigger keeps calling it — trigger untouched.)
--   (3) soft_delete_folder(folder_id) — RPC: set deleted_at + NULL attached clips.folder_id
--       (DM-folder-delete = clips preserved, folder_id NULL-released). Self-only (RLS).
--   (4) rename_folder / create_folder — thin self-only write RPCs (invoker → RLS-owned).
--   (5) move_clips_to_folder(content_ids[], folder_id) — bulk re-attach own clips of the
--       given contents to a target folder (or NULL=detach), transactional, self-only,
--       rejects nonexistent/other-user target folder.
--   (6) library_folder_counts / library_source_counts — read RPCs (own rows; sanitized
--       not needed — own data) for 폴더별 distinct-content counts + provider counts.
--   (7) library_cards(folder_id) — card surface read RPC
--       (content_id·title·thumbnail·tags·grab_count·provider), own rows, sort param.
--
-- pglite-safe: no Docker / extensions; only ALTER ... IF NOT EXISTS, CREATE OR REPLACE,
-- CREATE INDEX IF NOT EXISTS, plain SQL/PLpgSQL.

-- ── (1) soft-delete column on the FROZEN folders table (additive) ────────────────────────────
alter table public.folders
  add column if not exists deleted_at timestamptz;

comment on column public.folders.deleted_at is
  'u7/ADR-0002 #9 soft-delete. NULL=active. Set by soft_delete_folder() which also NULL-releases attached clips.folder_id (clips preserved). Active folders (deleted_at IS NULL) are the only ones surfaced/counted.';

-- active-folder filter helper index (RLS-scoped reads filter deleted_at IS NULL)
create index if not exists folders_user_active_idx
  on public.folders (user_id) where deleted_at is null;

-- ── (2) max-20 limit now counts ACTIVE folders only (soft-deleted free a slot) ───────────────
-- CREATE OR REPLACE of the existing function (0003) — additive redefinition, NOT a file edit.
-- 0003's folders_limit_guard (BEFORE INSERT) keeps invoking this; raises 23514 on the 21st.
create or replace function public.enforce_folder_limit()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select count(*) from public.folders
        where user_id = new.user_id and deleted_at is null) >= 20 then
    raise exception 'folder limit reached (max 20 active per user)' using errcode = '23514';
  end if;
  return new;
end;
$$;

-- ── (3) create_folder — self-only create (RLS insert-own + limit guard apply) ─────────────────
-- Invoker → the row is owned by auth.uid(); blank name rejected by folders_name_not_blank.
create or replace function public.create_folder(p_name text)
returns public.folders
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_row public.folders;
begin
  if v_uid is null then
    raise exception 'unauthenticated' using errcode = '28000';
  end if;
  insert into public.folders (user_id, name)
  values (v_uid, btrim(p_name))
  returning * into v_row;
  return v_row;
end;
$$;

comment on function public.create_folder(text) is
  'u7 L1-e: self-only folder create (invoker → RLS-owned). Blank name → 23514 (folders_name_not_blank). 21st active folder → 23514 (enforce_folder_limit). 28000 unauthenticated.';

-- ── (4) rename_folder — self-only UPDATE (RLS update-own enforces ownership) ───────────────────
create or replace function public.rename_folder(p_folder_id uuid, p_name text)
returns public.folders
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_row public.folders;
begin
  if (select auth.uid()) is null then
    raise exception 'unauthenticated' using errcode = '28000';
  end if;
  update public.folders
     set name = btrim(p_name)
   where id = p_folder_id and deleted_at is null   -- RLS additionally scopes to own rows
  returning * into v_row;
  -- not found / not own / already-deleted → 0 rows → v_row is null
  return v_row;   -- caller treats null as no-op (RLS denies cross-user → 0 rows)
end;
$$;

comment on function public.rename_folder(uuid,text) is
  'u7 L1-e: self-only folder rename (invoker → RLS update-own). Other-user/missing/deleted → 0 rows (null). Blank name → 23514.';

-- ── (5) soft_delete_folder — soft-delete + NULL-release attached clips (DM-folder-delete) ──────
-- DM-folder-delete = clips PRESERVED, their folder_id NULL-released (returned to "전체 폴더").
-- Transactional (single function body). Self-only: RLS on folders + clips both scope to owner.
create or replace function public.soft_delete_folder(p_folder_id uuid)
returns public.folders
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_row public.folders;
begin
  if (select auth.uid()) is null then
    raise exception 'unauthenticated' using errcode = '28000';
  end if;

  -- mark folder deleted (RLS update-own → other-user/missing yields 0 rows / null)
  update public.folders
     set deleted_at = now()
   where id = p_folder_id and deleted_at is null
  returning * into v_row;

  if v_row.id is null then
    return null;   -- nothing deleted (not own / missing / already deleted)
  end if;

  -- release attachments: own clips that pointed at this folder → folder_id NULL (clips kept).
  -- RLS on clips already scopes to auth.uid(); the folder_id match is the predicate.
  update public.clips
     set folder_id = null
   where folder_id = p_folder_id;

  return v_row;
end;
$$;

comment on function public.soft_delete_folder(uuid) is
  'u7 L1-e/DM-folder-delete (ADR-0002 #9): soft-delete a folder (deleted_at=now) and NULL-release attached clips.folder_id (clips PRESERVED → 전체 폴더). Self-only via RLS. Frees a slot vs the max-20 active limit. Other-user/missing → null (no-op).';

-- ── (6) move_clips_to_folder — bulk re-attach own clips of given contents (multiselect 이동) ───
-- p_target_folder_id NULL = detach (move to "전체 폴더"). Non-null target MUST be an active
-- folder owned by the caller, else 23503 (rejects nonexistent / other-user folder). All own
-- clips of the given contents are re-pointed in one statement (transactional). RLS update-own
-- guarantees only the caller's clips are touched.
create or replace function public.move_clips_to_folder(
  p_content_ids uuid[],
  p_target_folder_id uuid default null
)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_uid    uuid := (select auth.uid());
  v_moved  integer;
begin
  if v_uid is null then
    raise exception 'unauthenticated' using errcode = '28000';
  end if;
  if p_content_ids is null or array_length(p_content_ids, 1) is null then
    return 0;   -- nothing selected
  end if;

  -- validate target folder: must exist, be active, and belong to the caller.
  -- (RLS on folders already hides other users' rows, so a non-visible folder = not found.)
  if p_target_folder_id is not null then
    if not exists (
      select 1 from public.folders
       where id = p_target_folder_id and user_id = v_uid and deleted_at is null
    ) then
      raise exception 'target folder not found or not owned: %', p_target_folder_id
        using errcode = '23503';   -- foreign_key_violation flavour: invalid target
    end if;
  end if;

  -- bulk re-attach: only the caller's own live clips of the selected contents.
  -- RLS update-own makes the user_id predicate defense-in-depth (cross-user rows invisible).
  update public.clips
     set folder_id = p_target_folder_id
   where user_id = v_uid
     and content_id = any (p_content_ids)
     and deleted_at is null;
  get diagnostics v_moved = row_count;
  return v_moved;
end;
$$;

comment on function public.move_clips_to_folder(uuid[],uuid) is
  'u7 L1-e: bulk-move the caller''s own clips of the given contents to a target folder (NULL=detach to 전체 폴더). Transactional, self-only (RLS). Target must be an active folder owned by caller else 23503. Returns # of clips re-attached. 28000 unauthenticated.';

-- ── (7) library_folder_counts — per-folder distinct-content count (DM2: count distinct content)
-- folder=clip attachment (DM2-A), so a folder's "N개의 컨텐츠" = distinct content of the
-- caller's live clips attached to that folder. Own rows only (RLS on clips/folders).
create or replace function public.library_folder_counts()
returns table (folder_id uuid, name text, content_count bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select f.id, f.name, count(distinct c.content_id)
    from public.folders f
    left join public.clips c
      on c.folder_id = f.id and c.deleted_at is null
   where f.deleted_at is null
   group by f.id, f.name
   order by f.created_at;
$$;

comment on function public.library_folder_counts() is
  'u7 L1-d (DM2-A): per active folder → distinct content count of the caller''s live attached clips. Own rows only (RLS). count(distinct content_id) so a content with multiple clips in a folder counts once.';

-- ── (7b) library_source_counts — provider counts over the caller's library (출처 카운트) ───────
-- p_folder_id NULL = whole library ("전체 폴더"); non-null = within that folder. Counts
-- distinct content per provider (전체 32 / Youtube 16 / …). Own live clips only (RLS).
create or replace function public.library_source_counts(p_folder_id uuid default null)
returns table (provider text, content_count bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select ct.provider, count(distinct ct.id)
    from public.clips c
    join public.contents ct on ct.id = c.content_id
   where c.deleted_at is null
     and (p_folder_id is null or c.folder_id = p_folder_id)
   group by ct.provider
   order by count(distinct ct.id) desc, ct.provider;
$$;

comment on function public.library_source_counts(uuid) is
  'u7 L1-c: provider counts (출처 카운트 필터) over the caller''s library. NULL folder = whole library; else within folder. count(distinct content) per provider. Own live clips only (RLS).';

-- ── (7c) library_cards — card surface read (content_id·title·thumbnail·tags·grab_count·provider)
-- p_folder_id NULL = whole library; non-null = within folder. p_sort: 'recent' (default) /
-- 'oldest' / 'most_clips' (기획 §5.1.1). One row per distinct content the caller has clipped
-- (grab_count = # of the caller's live clips on that content). Own rows only (RLS).
create or replace function public.library_cards(
  p_folder_id uuid default null,
  p_sort      text default 'recent'
)
returns table (
  content_id    uuid,
  title         text,
  thumbnail_url text,
  provider      text,
  tags          text[],
  grab_count    bigint,
  last_clip_at  timestamptz
)
language sql
stable
security invoker
set search_path = ''
as $$
  with my_clips as (
    select c.content_id, c.id as clip_id, c.created_at
      from public.clips c
     where c.deleted_at is null
       and (p_folder_id is null or c.folder_id = p_folder_id)
  ),
  per_content as (
    select mc.content_id,
           count(distinct mc.clip_id)  as grab_count,
           max(mc.created_at)          as last_clip_at,
           min(mc.created_at)          as first_clip_at
      from my_clips mc
     group by mc.content_id
  ),
  tags_per_content as (
    select c.content_id, array_agg(distinct t.name order by t.name) as tags
      from public.clips c
      join public.clip_tags ctg on ctg.clip_id = c.id
      join public.tags t        on t.id = ctg.tag_id
     where c.deleted_at is null
       and (p_folder_id is null or c.folder_id = p_folder_id)
     group by c.content_id
  )
  select pc.content_id,
         ct.title,
         ct.thumbnail_url,
         ct.provider,
         coalesce(tpc.tags, '{}'::text[]) as tags,
         pc.grab_count,
         pc.last_clip_at
    from per_content pc
    join public.contents ct on ct.id = pc.content_id
    left join tags_per_content tpc on tpc.content_id = pc.content_id
   order by
     case when p_sort = 'oldest' then pc.first_clip_at end asc nulls last,
     case when p_sort = 'most_clips' then pc.grab_count end desc nulls last,
     pc.last_clip_at desc;   -- 'recent' default + stable tiebreak
$$;

comment on function public.library_cards(uuid,text) is
  'u7 L1-a/c/d: card surface for the caller''s library. NULL folder=whole library; else within folder. One row per distinct clipped content (content_id·title·thumbnail·provider·tags·grab_count). p_sort: recent(default)/oldest/most_clips (기획 §5.1.1). Own rows only (RLS).';

-- ── grants (authenticated only; these are self-scoped writes/reads) ───────────────────────────
grant execute on function public.create_folder(text)                       to authenticated;
grant execute on function public.rename_folder(uuid,text)                  to authenticated;
grant execute on function public.soft_delete_folder(uuid)                  to authenticated;
grant execute on function public.move_clips_to_folder(uuid[],uuid)         to authenticated;
grant execute on function public.library_folder_counts()                   to authenticated;
grant execute on function public.library_source_counts(uuid)              to authenticated;
grant execute on function public.library_cards(uuid,text)                  to authenticated;
