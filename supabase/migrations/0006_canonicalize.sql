-- 0006_canonicalize.sql
-- ADR-0002 #1 (canonical content identity / URL normalization) · L1-a
--
-- extract_video_ref()    : URL (any YouTube form) → (provider, provider_content_id).
--                          Normalizes youtu.be / watch?v= / shorts / embed / live / v,
--                          across www/m/music hosts, ignoring timestamp/playlist/extra params.
-- get_or_create_content(): SECURITY DEFINER upsert on the dedup key → URL-form-agnostic,
--                          one content per video. Meta-fetch failure → null metadata kept,
--                          existing good metadata never overwritten with null.

create or replace function public.extract_video_ref(p_url text)
returns table (provider text, provider_content_id text)
language plpgsql
immutable
set search_path = ''
as $$
declare
  u   text := btrim(coalesce(p_url, ''));
  vid text;
begin
  if u = '' then
    raise exception 'invalid url: empty' using errcode = '22023';
  end if;

  -- youtu.be/<id>
  vid := substring(u from 'youtu\.be/([A-Za-z0-9_-]{11})');

  -- youtube.com/{shorts|embed|live|v}/<id>  (www/m/music hosts all contain "youtube.com")
  if vid is null and u ~* 'youtube\.com' then
    vid := substring(u from 'youtube\.com/(?:shorts|embed|live|v)/([A-Za-z0-9_-]{11})');
  end if;

  -- watch?v=<id> or ...&v=<id>  (guarded to youtube host so foreign ?v= is not misclassified)
  if vid is null and u ~* 'youtube\.com' then
    vid := substring(u from '[?&]v=([A-Za-z0-9_-]{11})');
  end if;

  if vid is null then
    raise exception 'unsupported or invalid video url: %', p_url using errcode = '22023';
  end if;

  provider := 'youtube';
  provider_content_id := vid;
  return next;
end;
$$;

comment on function public.extract_video_ref(text) is 'ADR-0002 #1: normalize any YouTube URL form to (provider, 11-char id). Raises 22023 on invalid/unsupported.';

create or replace function public.get_or_create_content(
  p_url           text,
  p_title         text default null,
  p_channel       text default null,
  p_duration_sec  integer default null,
  p_thumbnail_url text default null
)
returns public.contents
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_ref record;
  v_row public.contents;
begin
  select provider, provider_content_id into v_ref from public.extract_video_ref(p_url);

  insert into public.contents (provider, provider_content_id, canonical_url, title, channel, duration_sec, thumbnail_url)
  values (
    v_ref.provider,
    v_ref.provider_content_id,
    'https://www.youtube.com/watch?v=' || v_ref.provider_content_id,
    p_title, p_channel, p_duration_sec, p_thumbnail_url
  )
  on conflict (provider, provider_content_id) do update
    set title         = coalesce(excluded.title,         public.contents.title),
        channel       = coalesce(excluded.channel,       public.contents.channel),
        duration_sec  = coalesce(excluded.duration_sec,  public.contents.duration_sec),
        thumbnail_url = coalesce(excluded.thumbnail_url, public.contents.thumbnail_url),
        updated_at    = now()
  returning * into v_row;

  return v_row;
end;
$$;

comment on function public.get_or_create_content(text,text,text,integer,text) is 'ADR-0002 #1: URL-form-agnostic upsert → one content per video. SECURITY DEFINER (contents has no client write policy).';

grant execute on function public.extract_video_ref(text) to authenticated;
grant execute on function public.get_or_create_content(text,text,text,integer,text) to authenticated;
