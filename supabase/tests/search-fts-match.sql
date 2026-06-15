-- tests/search-fts-match.sql
-- Proves L1-b Korean unified search: search_my_content matches the caller's clipped content by
-- (1) TITLE token, (2) MEMO token, (3) TAG name — Korean tokens via to_tsvector('simple'), AND
-- partial/mid-token substrings via the ILIKE fallback (the pg_trgm replacement under pglite).
-- Result rows are the card surface (content_id·title·provider·clip_count·tags).
-- (ADR-0002 #10 한국어 FTS over 제목/메모/태그 · spec §Validation BE search-fts-match)

begin;
select plan(9);

insert into auth.users (id, email) values ('11111111-1111-1111-1111-111111111111', 'u@test.dev');

-- 3 distinct contents, each matchable through a DIFFERENT field only:
do $$ begin perform public.get_or_create_content('https://youtu.be/dQw4w9WgXcQ', '실리콘밸리 창업 스토리', '채널A'); end $$;  -- TITLE carrier
do $$ begin perform public.get_or_create_content('https://youtu.be/abcdefghijk', '오늘의 영상',           '채널B'); end $$;  -- MEMO carrier
do $$ begin perform public.get_or_create_content('https://youtu.be/zzzzzzzzzzz', '무제',                 '채널C'); end $$;  -- TAG carrier

set local role authenticated;
set local "request.jwt.claims" = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

-- (A) title carrier: memo/tag do NOT contain the term
do $$ begin perform public.ingest_clip('https://youtu.be/dQw4w9WgXcQ', 10, 30, '메모없음', true, null, array['기타']); end $$;
-- (B) memo carrier: title/tag do NOT contain the term
do $$ begin perform public.ingest_clip('https://youtu.be/abcdefghijk', 5, 25, '시간 관리 노하우 정리', true, null, array['기타']); end $$;
-- (C) tag carrier: title/memo do NOT contain the term
do $$ begin perform public.ingest_clip('https://youtu.be/zzzzzzzzzzz', 1, 9, '딴 내용', true, null, array['마케팅']); end $$;

-- ── (1) TITLE token match ──
select is(
  (select title from public.search_my_content('창업') limit 1),
  '실리콘밸리 창업 스토리', 'fts: 제목 토큰 "창업" 매칭' );

-- ── (2) MEMO token match ──
select is(
  (select title from public.search_my_content('관리') limit 1),
  '오늘의 영상', 'fts: 메모 토큰 "관리" 매칭' );

-- ── (3) TAG match ──
select is(
  (select title from public.search_my_content('마케팅') limit 1),
  '무제', 'fts: 태그 "마케팅" 매칭' );

-- ── partial / mid-token substring (pg_trgm replacement via ILIKE): "실리콘" hits "실리콘밸리" ──
select is(
  (select title from public.search_my_content('실리콘') limit 1),
  '실리콘밸리 창업 스토리', 'fts: 부분 토큰 "실리콘" → "실리콘밸리" ILIKE 매칭' );

-- ── card surface shape: provider + clip_count + tags returned ──
select is(
  (select provider from public.search_my_content('창업') limit 1),
  'youtube', 'fts: 결과 행에 provider(출처) 노출' );
select is(
  (select clip_count::int from public.search_my_content('창업') limit 1),
  1, 'fts: 결과 행에 clip_count 노출' );
select ok(
  (select '마케팅' = any(tags) from public.search_my_content('마케팅') limit 1),
  'fts: 결과 행에 tags 배열 노출' );

-- ── a term present in NO field matches nothing ──
select is(
  (select count(*)::int from public.search_my_content('전혀없는단어')),
  0, 'fts: 어느 필드에도 없는 토큰 → 0건' );

-- ── multi-token query (websearch) — both tokens present across title/memo of one content ──
do $$ begin perform public.ingest_clip('https://youtu.be/dQw4w9WgXcQ', 50, 70, '창업 투자 메모', true, null, array['기타']); end $$;
select ok(
  (select count(*) > 0 from public.search_my_content('창업 투자')),
  'fts: 다중 토큰 질의("창업 투자") 매칭' );

reset role;
select * from finish();
rollback;
