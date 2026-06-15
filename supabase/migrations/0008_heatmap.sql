-- 0008_heatmap.sql
-- ADR-0002 #5 (heatmap aggregate = SQL view/RPC, NOT an Edge Function side-channel) · L1-b
--
-- content_heatmap(content_id, bucket_sec) → per-bucket clip-density over the timeline.
-- Sourced from content_clips_public (0007) so it inherits is_public + soft-delete filtering
-- and the single elevation point — density is aggregate (count of overlapping public clips),
-- inherently identity-free. Overlap uses end-exclusive semantics: clip overlaps bucket
-- [bs,be) iff start_sec < be AND end_sec > bs.

create or replace function public.content_heatmap(
  p_content_id uuid,
  p_bucket_sec integer default 10
)
returns table (bucket_start integer, bucket_end integer, density integer)
language sql
stable
security invoker
set search_path = ''
as $$
  with cfg as (
    select greatest(coalesce(p_bucket_sec, 10), 1) as step
  ),
  bounds as (
    select coalesce(max(end_sec), 0) as max_end
    from public.content_clips_public
    where content_id = p_content_id
  ),
  buckets as (
    select g as bucket_start, g + cfg.step as bucket_end
    from cfg, bounds, generate_series(0, greatest(bounds.max_end - 1, 0), cfg.step) as g
    where bounds.max_end > 0
  )
  select
    b.bucket_start,
    b.bucket_end,
    count(c.clip_id)::integer as density
  from buckets b
  left join public.content_clips_public c
    on  c.content_id = p_content_id
    and c.start_sec  < b.bucket_end      -- end-exclusive overlap
    and c.end_sec    > b.bucket_start
  group by b.bucket_start, b.bucket_end
  order by b.bucket_start;
$$;

comment on function public.content_heatmap(uuid,integer) is 'ADR-0002 #5: per-bucket public-clip density. SQL primitive (no Edge Function). Identity-free aggregate over content_clips_public.';

grant execute on function public.content_heatmap(uuid, integer) to anon, authenticated;
