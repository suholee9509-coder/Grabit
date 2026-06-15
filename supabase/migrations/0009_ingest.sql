-- 0009_ingest.sql
-- ADR-0002 #1/#2 · L1-a/L1-c (web + extension ingest = ONE contract)
--
-- ingest_clip() is the single write primitive the WEB app (supabase-js .rpc) and the CHROME
-- EXTENSION (via the clip-ingest Edge Function, which forwards the user's JWT to this same
-- RPC) both call → identical ingest. SECURITY INVOKER so the clip is owned by auth.uid()
-- and RLS applies; it composes get_or_create_content() (definer) for the shared content row.
--
-- Re-clip dedup ("중복 클립 → 메모 추가만"): exact (user,content,interval) is not a new row;
-- the memo is merged (deduped, newline-joined) onto the existing live clip.

create or replace function public.ingest_clip(
  p_url           text,
  p_start_sec     integer,
  p_end_sec       integer,
  p_memo          text default null,
  p_is_public     boolean default false,
  p_folder_id     uuid default null,
  p_tags          text[] default null,
  p_title         text default null,
  p_channel       text default null,
  p_duration_sec  integer default null,
  p_thumbnail_url text default null
)
returns public.clips
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_uid      uuid := (select auth.uid());
  v_content  public.contents;
  v_clip     public.clips;
  v_tag_name text;
  v_tag_id   uuid;
begin
  if v_uid is null then
    raise exception 'unauthenticated' using errcode = '28000';
  end if;
  if p_start_sec is null or p_end_sec is null or p_start_sec < 0 or p_end_sec <= p_start_sec then
    raise exception 'invalid interval: [%, %) (need start>=0 and end>start)', p_start_sec, p_end_sec
      using errcode = '22023';
  end if;

  -- shared canonical content (dedup by URL form)
  v_content := public.get_or_create_content(p_url, p_title, p_channel, p_duration_sec, p_thumbnail_url);

  -- upsert the grab; exact-duplicate interval → merge memo (no new row)
  insert into public.clips (user_id, content_id, start_sec, end_sec, memo, is_public, folder_id)
  values (v_uid, v_content.id, p_start_sec, p_end_sec, p_memo, coalesce(p_is_public, false), p_folder_id)
  on conflict (user_id, content_id, start_sec, end_sec) where (deleted_at is null)
  do update set
    memo = case
             when excluded.memo is null then public.clips.memo
             when public.clips.memo is null then excluded.memo
             when position(excluded.memo in public.clips.memo) > 0 then public.clips.memo  -- already present
             else public.clips.memo || E'\n' || excluded.memo
           end,
    is_public = public.clips.is_public or excluded.is_public,
    folder_id = coalesce(excluded.folder_id, public.clips.folder_id),
    updated_at = now()
  returning * into v_clip;

  -- attach per-user tags (get-or-create, idempotent)
  if p_tags is not null then
    foreach v_tag_name in array p_tags loop
      v_tag_name := btrim(v_tag_name);
      continue when v_tag_name = '';
      insert into public.tags (user_id, name) values (v_uid, v_tag_name)
        on conflict (user_id, lower(name)) do update set name = public.tags.name
        returning id into v_tag_id;
      insert into public.clip_tags (clip_id, tag_id, user_id) values (v_clip.id, v_tag_id, v_uid)
        on conflict do nothing;
    end loop;
  end if;

  return v_clip;
end;
$$;

comment on function public.ingest_clip(text,integer,integer,text,boolean,uuid,text[],text,text,integer,text) is
  'L1-a/c: single web+extension ingest contract. Invoker (RLS-owned clip). Re-clip merges memo. 22023=bad interval, 28000=unauthenticated.';

grant execute on function public.ingest_clip(text,integer,integer,text,boolean,uuid,text[],text,text,integer,text) to authenticated;
