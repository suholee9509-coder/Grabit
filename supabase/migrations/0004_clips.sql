-- 0004_clips.sql
-- ADR-0002 #2 (clip interval semantics) · #3/#9 (RLS write=self) · L1-a
--
-- clips = the atomic SAVE UNIT (a "grab": video interval + memo on a canonical content).
-- Interval semantics (LOCKED):
--   * integer seconds.
--   * start_sec >= 0.
--   * end EXCLUSIVE, 0-length forbidden  → CHECK(end_sec > start_sec).  Interval = [start, end).
--   * overlaps ALLOWED (distinct grabs may overlap).
--   * exact-duplicate re-clip (same user+content+interval) is NOT a new row → memo merged
--     by ingest_clip() (0009) via the partial-unique index below ("중복 클립 → 메모 추가만").
--   * video-length change / meta-fetch failure: end_sec stored as-is (duration may be null);
--     no clamp — duration is advisory metadata, not an interval invariant.

create table public.clips (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  content_id  uuid not null references public.contents (id) on delete cascade,
  start_sec   integer not null,
  end_sec     integer not null,
  memo        text,
  is_public   boolean     not null default false,                 -- social visibility (L1-b)
  folder_id   uuid references public.folders (id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz,                                        -- soft delete (ADR-0002 #9)
  constraint clips_start_nonneg     check (start_sec >= 0),
  constraint clips_end_after_start  check (end_sec > start_sec)   -- end exclusive, 0-length forbidden
);

comment on table  public.clips is 'Atomic grab: [start_sec,end_sec) + memo on a content. RLS: read/write self only. Public clips surface via sanitized model (0007).';
comment on column public.clips.is_public is 'When true, the grab feeds the anonymized social read model + heatmap (0007/0008).';

-- dedup / re-clip target: one live row per (user, content, exact interval)
create unique index clips_user_content_interval_uq
  on public.clips (user_id, content_id, start_sec, end_sec)
  where deleted_at is null;

-- social/heatmap read path: public, live clips per content
create index clips_public_by_content_idx
  on public.clips (content_id)
  where is_public and deleted_at is null;

-- library paths
create index clips_user_content_idx on public.clips (user_id, content_id);
create index clips_folder_idx       on public.clips (folder_id) where folder_id is not null;

create trigger clips_touch_updated_at
  before update on public.clips
  for each row execute function public.touch_updated_at();

-- RLS: read/write SELF ONLY. Cross-user public clips are reachable ONLY via the
-- sanitized definer-view (0007) — direct cross-user SELECT of clips is impossible.
alter table public.clips enable row level security;
create policy clips_select_own on public.clips for select using ( (select auth.uid()) = user_id );
create policy clips_insert_own on public.clips for insert with check ( (select auth.uid()) = user_id );
create policy clips_update_own on public.clips for update using ( (select auth.uid()) = user_id ) with check ( (select auth.uid()) = user_id );
create policy clips_delete_own on public.clips for delete using ( (select auth.uid()) = user_id );
grant select, insert, update, delete on public.clips to authenticated;

-- clip_tags (M:N, same owner; user_id denormalized so RLS needs no subquery)
create table public.clip_tags (
  clip_id     uuid not null references public.clips (id) on delete cascade,
  tag_id      uuid not null references public.tags (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (clip_id, tag_id)
);
create index clip_tags_tag_idx on public.clip_tags (tag_id);

alter table public.clip_tags enable row level security;
create policy clip_tags_select_own on public.clip_tags for select using ( (select auth.uid()) = user_id );
create policy clip_tags_insert_own on public.clip_tags for insert with check ( (select auth.uid()) = user_id );
create policy clip_tags_delete_own on public.clip_tags for delete using ( (select auth.uid()) = user_id );
grant select, insert, delete on public.clip_tags to authenticated;
