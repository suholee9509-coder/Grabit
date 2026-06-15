-- 0005_annotations.sql
-- ADR-0002 #8/#9 (annotation entity · lifecycle)
--
-- DECISION POINT (locked here, flagged for PM in status.md):
--   annotations = a PUBLIC, content+timestamp-anchored social note (single at_sec, a body),
--   born public, NOT a library save. This is the lightweight "annotate this moment" social
--   layer, distinct from interval clips (which carry the heatmap + private-or-public insight).
--   Both feed the social sidebar; both are sanitized to cohort. If design later folds this
--   into clips, the table is dropped (reversible). RLS/no-leak coverage is uniform with clips.

create table public.annotations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  content_id  uuid not null references public.contents (id) on delete cascade,
  at_sec      integer not null,                                 -- point-in-time anchor
  body        text    not null,
  is_public   boolean     not null default true,                -- born public (social layer)
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz,                                      -- soft delete (ADR-0002 #9)
  constraint annotations_at_nonneg   check (at_sec >= 0),
  constraint annotations_body_not_blank check (length(btrim(body)) > 0)
);
create index annotations_public_by_content_idx
  on public.annotations (content_id)
  where is_public and deleted_at is null;
create index annotations_user_idx on public.annotations (user_id);

comment on table public.annotations is 'Public timestamp-anchored social note on a content (distinct from interval clips). Surfaces via sanitized model (0007).';

create trigger annotations_touch_updated_at
  before update on public.annotations
  for each row execute function public.touch_updated_at();

-- RLS: write SELF ONLY; direct read SELF ONLY. Public annotations surface ONLY via the
-- sanitized definer-view (0007), identically to clips.
alter table public.annotations enable row level security;
create policy annotations_select_own on public.annotations for select using ( (select auth.uid()) = user_id );
create policy annotations_insert_own on public.annotations for insert with check ( (select auth.uid()) = user_id );
create policy annotations_update_own on public.annotations for update using ( (select auth.uid()) = user_id ) with check ( (select auth.uid()) = user_id );
create policy annotations_delete_own on public.annotations for delete using ( (select auth.uid()) = user_id );
grant select, insert, update, delete on public.annotations to authenticated;
