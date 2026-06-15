-- 0002_contents.sql
-- ADR-0002 #1 (canonical content identity / dedup)
--
-- contents = canonical, SHARED video identity (no per-user owner).
-- Dedup guarantee = UNIQUE(provider, provider_content_id): one row per video
-- regardless of URL form (youtu.be / shorts / mobile / timestamp / playlist params).
-- Writes go ONLY through get_or_create_content() (0006, SECURITY DEFINER) — direct
-- client writes are denied by RLS (no write policy) to prevent spoofed/duplicate rows.

create table public.contents (
  id                   uuid primary key default gen_random_uuid(),
  provider             text not null,                          -- 'youtube'
  provider_content_id  text not null,                          -- canonical video id (e.g. 11-char YT id)
  canonical_url        text not null,                          -- normalized canonical URL
  title                text,                                   -- metadata (null if meta fetch failed)
  channel              text,
  duration_sec         integer,                                -- null if unknown / fetch failed
  thumbnail_url        text,
  is_unavailable       boolean     not null default false,     -- deleted/private video flag (set by ingest meta fetch)
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  constraint contents_provider_not_blank check (length(provider) > 0),
  constraint contents_pcid_not_blank     check (length(provider_content_id) > 0),
  constraint contents_duration_nonneg    check (duration_sec is null or duration_sec >= 0),
  unique (provider, provider_content_id)                       -- ★ DEDUP KEY
);

comment on table  public.contents is 'Canonical shared video identity. Dedup via UNIQUE(provider,provider_content_id). Writes only via get_or_create_content().';
comment on constraint contents_provider_not_blank on public.contents is 'ADR-0002 #1 dedup key component.';

create trigger contents_touch_updated_at
  before update on public.contents
  for each row execute function public.touch_updated_at();

-- RLS: metadata is readable by everyone (needed to render any content); NO write policy
-- → all direct INSERT/UPDATE/DELETE denied. Mutations happen via SECURITY DEFINER RPC only.
alter table public.contents enable row level security;

create policy contents_select_all on public.contents
  for select using ( true );

grant select on public.contents to anon, authenticated;
