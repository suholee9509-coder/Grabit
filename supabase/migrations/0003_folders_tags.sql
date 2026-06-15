-- 0003_folders_tags.sql
-- ADR-0002 #8 (library relations · tags global vs per-user)
--
-- Decision (locked by this spike):
--   * folders : per-user, tree (parent_id self-ref). Max 20 per user (design gap §7).
--               A clip carries folder_id (clip-add modal sets 폴더 at creation).
--   * tags    : PER-USER (not global) — privacy (tags can be personal), simpler RLS,
--               no global namespace collisions. Autocomplete draws from the user's own tags.
--   * clip_tags: M:N clip↔tag, both owned by the same user (user_id denormalized for RLS).

create table public.folders (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  name        text not null,
  parent_id   uuid references public.folders (id) on delete cascade,
  sort_order  integer     not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint folders_name_not_blank check (length(btrim(name)) > 0)
);
create index folders_user_idx on public.folders (user_id);

comment on table public.folders is 'Per-user library folders (tree). Max 20 per user. clips.folder_id references this.';

create trigger folders_touch_updated_at
  before update on public.folders
  for each row execute function public.touch_updated_at();

-- Enforce max-20 folders per user (design gap §7). Lightweight count guard.
create or replace function public.enforce_folder_limit()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select count(*) from public.folders where user_id = new.user_id) >= 20 then
    raise exception 'folder limit reached (max 20 per user)' using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger folders_limit_guard
  before insert on public.folders
  for each row execute function public.enforce_folder_limit();

alter table public.folders enable row level security;
create policy folders_select_own on public.folders for select using ( (select auth.uid()) = user_id );
create policy folders_insert_own on public.folders for insert with check ( (select auth.uid()) = user_id );
create policy folders_update_own on public.folders for update using ( (select auth.uid()) = user_id ) with check ( (select auth.uid()) = user_id );
create policy folders_delete_own on public.folders for delete using ( (select auth.uid()) = user_id );
grant select, insert, update, delete on public.folders to authenticated;

-- tags (per-user, case-insensitive unique per user)
create table public.tags (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  name        text not null,
  created_at  timestamptz not null default now(),
  constraint tags_name_not_blank check (length(btrim(name)) > 0)
);
create unique index tags_user_lower_name_uq on public.tags (user_id, lower(name));
create index tags_user_idx on public.tags (user_id);

comment on table public.tags is 'PER-USER tags (ADR-0002 #8). Case-insensitive unique per user. Global trending = future sanitized aggregate.';

alter table public.tags enable row level security;
create policy tags_select_own on public.tags for select using ( (select auth.uid()) = user_id );
create policy tags_insert_own on public.tags for insert with check ( (select auth.uid()) = user_id );
create policy tags_update_own on public.tags for update using ( (select auth.uid()) = user_id ) with check ( (select auth.uid()) = user_id );
create policy tags_delete_own on public.tags for delete using ( (select auth.uid()) = user_id );
grant select, insert, update, delete on public.tags to authenticated;
