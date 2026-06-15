-- 0012_search.sql  (u8-search · ADDITIVE — touches NO frozen object)
-- ADR-0002 #10 (search data shape = Korean FTS over 제목/메모/태그, privacy) · #8 (per-user tags)
-- · #7 (cold-start fallback) · L1-b / L1-c / L1-d
--
-- ★ ADDITIVE ONLY. This migration creates new functions + new indexes on existing tables.
--   It changes NO existing table / RLS policy / function / view (0001-0010 are FROZEN).
--   Read path elevation: NONE. search_my_content is SECURITY INVOKER and additionally
--   pins user_id = auth.uid() → it can ONLY ever surface the caller's own clips. A different
--   user's clips are structurally non-matchable (RLS on clips/clip_tags/tags already denies
--   cross-user SELECT; the explicit user_id pin is defense-in-depth).
--
-- Korean FTS strategy (pglite-compatible — DECISION):
--   Postgres has no 'korean' text-search dictionary, and pglite (the canonical pgTAP runner
--   _pgtap_pglite.mjs) does NOT ship pg_trgm (`create extension pg_trgm` → "not available";
--   similarity() absent). So matching is built on two engines that BOTH run under pglite:
--     (1) FTS token match:  to_tsvector('simple', 제목||' '||메모||' '||태그)
--                           @@ websearch_to_tsquery('simple', query)   — whitespace-token / phrase.
--     (2) substring match:  document ILIKE '%'||escaped(query)||'%'    — partial / mid-word,
--                           the pg_trgm-replacement fuzzy layer (Korean has no word breaks,
--                           so a contiguous substring is the practical "부분/오타 근접" match).
--   A row matches if (1) OR (2). pg_trgm, if present in real Postgres, only ADDS a trigram GIN
--   index for speed — it is created in a guarded DO-block that no-ops under pglite and is never
--   required by the query logic.
--
-- Injection: query is NEVER concatenated into executable SQL. It flows only through
--   websearch_to_tsquery() (parser-sanitized) and a parameter-bound ILIKE whose LIKE
--   metacharacters (% _ \) are escaped → FTS/LIKE injection is structurally impossible.

-- ── pg_trgm: speed-only, optional. Guarded so a pglite/restricted env does not abort. ──
do $$
begin
  create extension if not exists pg_trgm;
exception when others then
  raise notice 'pg_trgm unavailable (e.g. pglite) — search falls back to FTS(simple)+ILIKE: %', sqlerrm;
end $$;

-- ── Per-clip search document = 제목 + 메모 + (본인) 태그명. Immutable helper, search_path locked. ──
-- Kept as a plain expression source (not stored) so it stays additive (no column/trigger on
-- the frozen clips/contents tables). The GIN index below indexes the same expression.
create or replace function public.clip_search_doc(p_title text, p_memo text, p_tags text)
returns text
language sql
immutable
set search_path = ''
as $$
  select lower(btrim(
    coalesce(p_title, '') || ' ' || coalesce(p_memo, '') || ' ' || coalesce(p_tags, '')
  ))
$$;
comment on function public.clip_search_doc(text,text,text) is
  'u8: builds the per-clip search document (제목+메모+태그) for FTS(simple)+ILIKE. ADR-0002 #10.';

-- ── LIKE-metacharacter escape so a query like "50%_x" is matched literally (no wildcard injection). ──
create or replace function public.like_escape(p_query text)
returns text
language sql
immutable
set search_path = ''
as $$
  -- escape backslash first, then % and _  (default ESCAPE '\' in LIKE)
  select replace(replace(replace(lower(btrim(coalesce(p_query, ''))), '\', '\\'), '%', '\%'), '_', '\_')
$$;
comment on function public.like_escape(text) is 'u8: escapes LIKE metacharacters (% _ \\) so query substrings match literally.';

-- ── Additive FTS index on clips.memo (simple). GIN over the memo tsvector. ──
-- (Title/tags live on other tables; the RPC composes the document at query time. This index
--  accelerates the dominant memo-token path. NO change to the clips table itself.)
create index if not exists clips_memo_fts_idx
  on public.clips using gin (to_tsvector('simple', coalesce(memo, '')))
  where deleted_at is null;

-- ── Additive trigram index (speed only, real Postgres). Guarded → no-op under pglite. ──
do $$
begin
  create index if not exists clips_memo_trgm_idx
    on public.clips using gin (memo gin_trgm_ops)
    where deleted_at is null;
exception when others then
  raise notice 'trgm index on clips.memo skipped (pg_trgm absent): %', sqlerrm;
end $$;

-- ════════════════════════════════════════════════════════════════════════════════════════
--  search_my_content() — 본인 클립 컨텐츠 통합검색 (카드 표면 결과)
-- ════════════════════════════════════════════════════════════════════════════════════════
-- query    : 한국어 검색어. ''/공백/null → 빈 결과 (에러 ❌; 디폴트 발견은 FE가 그림).
-- category : 태그명(전체=null). ADR-0002 #8 per-user 태그를 카테고리로 사용 → content가 그
--            태그를 (본인 클립에) 부착했으면 통과.
-- source   : provider 필터(예 'youtube'). null=전체.
-- sort     : 'recent'(기본)/'oldest'/'most_clips'.
-- 결과 행   : content_id · title · provider · clip_count(매칭된 본인 클립 수) · tags(본인 부착 태그 배열).
create or replace function public.search_my_content(
  p_query    text,
  p_category text default null,
  p_source   text default null,
  p_sort     text default 'recent'
)
returns table (
  content_id  uuid,
  title       text,
  provider    text,
  clip_count  bigint,
  tags        text[],
  last_clipped_at timestamptz
)
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  v_uid     uuid := (select auth.uid());
  v_q       text := btrim(coalesce(p_query, ''));
  v_cat     text := nullif(btrim(coalesce(p_category, '')), '');
  v_src     text := nullif(btrim(coalesce(p_source, '')), '');
  v_sort    text := lower(coalesce(nullif(btrim(p_sort), ''), 'recent'));
  v_like    text;
begin
  if v_uid is null then
    raise exception 'unauthenticated' using errcode = '28000';   -- 미인증 차단 (PostgREST → 401/403)
  end if;
  if v_q = '' then
    return;                                                       -- 빈/공백 query → 빈 결과 (no error)
  end if;
  if v_sort not in ('recent', 'oldest', 'most_clips') then
    v_sort := 'recent';
  end if;
  v_like := '%' || public.like_escape(v_q) || '%';

  return query
  with matched as (
    select
      c.content_id,
      c.id            as clip_id,
      c.created_at,
      ct.title,
      ct.provider,
      -- the caller's own tag names attached to this clip (per-user tags · ADR-0002 #8)
      coalesce(
        (select array_agg(distinct t.name)
           from public.clip_tags clt
           join public.tags t on t.id = clt.tag_id
          where clt.clip_id = c.id and clt.user_id = v_uid),
        '{}'::text[]
      ) as clip_tags,
      -- the search document (제목+메모+태그)
      public.clip_search_doc(
        ct.title,
        c.memo,
        (select string_agg(t.name, ' ')
           from public.clip_tags clt
           join public.tags t on t.id = clt.tag_id
          where clt.clip_id = c.id and clt.user_id = v_uid)
      ) as doc
    from public.clips c
    join public.contents ct on ct.id = c.content_id
    where c.user_id = v_uid                  -- ★ own rows only (RLS + explicit pin)
      and c.deleted_at is null
  ),
  filtered as (
    select *
    from matched m
    where
      -- (1) FTS token match  OR  (2) ILIKE substring (pg_trgm replacement)
      ( to_tsvector('simple', m.doc) @@ websearch_to_tsquery('simple', v_q)
        or m.doc like v_like escape '\' )
      -- provider (출처) filter
      and (v_src is null or m.provider = v_src)
      -- category filter = per-user tag membership (전체=null bypass)
      and (v_cat is null or exists (
            select 1 from unnest(m.clip_tags) tn where lower(tn) = lower(v_cat)))
  )
  select
    f.content_id,
    max(f.title)                       as title,
    max(f.provider)                    as provider,
    count(*)::bigint                   as clip_count,
    -- union of the caller's tag names across the matched clips of this content
    coalesce(
      (select array_agg(distinct t.name)
         from public.clip_tags clt
         join public.tags t on t.id = clt.tag_id
         join public.clips c2 on c2.id = clt.clip_id
        where clt.user_id = v_uid
          and c2.content_id = f.content_id
          and c2.deleted_at is null),
      '{}'::text[]
    )                                  as tags,
    max(f.created_at)                  as last_clipped_at
  from filtered f
  group by f.content_id
  order by
    case when v_sort = 'most_clips' then count(*) end desc nulls last,
    case when v_sort = 'oldest'     then min(f.created_at) end asc,
    case when v_sort = 'recent'     then max(f.created_at) end desc,
    f.content_id;                      -- stable tiebreak
end;
$$;
comment on function public.search_my_content(text,text,text,text) is
  'u8/L1-b: 본인 클립 컨텐츠 한국어 통합검색(제목/메모/태그). SECURITY INVOKER + user_id pin → 타 user 비매칭. FTS(simple)+ILIKE. ADR-0002 #10/#8.';

grant execute on function public.search_my_content(text,text,text,text) to authenticated;

-- ════════════════════════════════════════════════════════════════════════════════════════
--  search_my_content_sources() — provider별 결과 카운트 (출처 필터 배지)
-- ════════════════════════════════════════════════════════════════════════════════════════
-- 동일 매칭 집합을 provider로 그룹·카운트(컨텐츠 단위). source 필터는 적용 ❌ (모든 출처의
-- 배지 카운트를 동시에 보여줘야 하므로). category 필터는 적용(○) — 화면상 카테고리 스트립과
-- 출처 탭이 같은 결과 집합을 좁히기 때문.
create or replace function public.search_my_content_sources(
  p_query    text,
  p_category text default null
)
returns table (
  provider     text,
  content_count bigint
)
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  v_uid  uuid := (select auth.uid());
  v_q    text := btrim(coalesce(p_query, ''));
  v_cat  text := nullif(btrim(coalesce(p_category, '')), '');
  v_like text;
begin
  if v_uid is null then
    raise exception 'unauthenticated' using errcode = '28000';
  end if;
  if v_q = '' then
    return;
  end if;
  v_like := '%' || public.like_escape(v_q) || '%';

  return query
  with matched as (
    select
      c.content_id,
      ct.provider,
      coalesce(
        (select array_agg(distinct t.name)
           from public.clip_tags clt
           join public.tags t on t.id = clt.tag_id
          where clt.clip_id = c.id and clt.user_id = v_uid),
        '{}'::text[]
      ) as clip_tags,
      public.clip_search_doc(
        ct.title,
        c.memo,
        (select string_agg(t.name, ' ')
           from public.clip_tags clt
           join public.tags t on t.id = clt.tag_id
          where clt.clip_id = c.id and clt.user_id = v_uid)
      ) as doc
    from public.clips c
    join public.contents ct on ct.id = c.content_id
    where c.user_id = v_uid
      and c.deleted_at is null
  ),
  filtered as (
    select distinct m.content_id, m.provider
    from matched m
    where ( to_tsvector('simple', m.doc) @@ websearch_to_tsquery('simple', v_q)
            or m.doc like v_like escape '\' )
      and (v_cat is null or exists (
            select 1 from unnest(m.clip_tags) tn where lower(tn) = lower(v_cat)))
  )
  select f.provider, count(*)::bigint as content_count
  from filtered f
  group by f.provider
  order by content_count desc, f.provider;
end;
$$;
comment on function public.search_my_content_sources(text,text) is
  'u8/L1-b: provider별 검색결과 카운트(출처 필터 배지). 매칭 집합은 search_my_content와 동일 규칙; source 필터는 미적용(모든 출처 배지 동시 표시). own rows only.';

grant execute on function public.search_my_content_sources(text,text) to authenticated;
