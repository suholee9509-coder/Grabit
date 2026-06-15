-- tests/search-source-count.sql
-- Proves L1-b source (출처) facet: search_my_content_sources groups the caller's matched
-- contents by provider and counts them (the source-filter tab badges), and the source filter
-- on search_my_content narrows results to one provider — while the source-count facet itself is
-- provider-agnostic (shows every provider's badge for the same query).
-- (spec §Validation BE search-source-count · provider = u0b canonical key contents.provider)
--
-- contents.provider is set by get_or_create_content (always 'youtube'); to exercise multiple
-- sources we patch provider as superuser (contents has definer-only writes — superuser bypasses).

begin;
select plan(6);

insert into auth.users (id, email) values ('11111111-1111-1111-1111-111111111111', 'u@test.dev');

do $$ begin perform public.get_or_create_content('https://youtu.be/dQw4w9WgXcQ', '컨텐츠 유튜브', '채널A'); end $$;
do $$ begin perform public.get_or_create_content('https://youtu.be/abcdefghijk', '컨텐츠 미디엄', '채널B'); end $$;
do $$ begin perform public.get_or_create_content('https://youtu.be/zzzzzzzzzzz', '컨텐츠 티스토리', '채널C'); end $$;

set local role authenticated;
set local "request.jwt.claims" = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';
-- "컨텐츠" is the common search term across all three (in each title)
do $$ begin perform public.ingest_clip('https://youtu.be/dQw4w9WgXcQ', 10, 30, '메모', true, null, null); end $$;  -- youtube
do $$ begin perform public.ingest_clip('https://youtu.be/dQw4w9WgXcQ', 40, 60, '메모2', true, null, null); end $$; -- youtube (2nd clip, same content)
do $$ begin perform public.ingest_clip('https://youtu.be/abcdefghijk', 5, 25, '메모', true, null, null); end $$;  -- medium
do $$ begin perform public.ingest_clip('https://youtu.be/zzzzzzzzzzz', 1, 9, '메모', true, null, null); end $$;   -- tistory
reset role;

-- patch providers to simulate multi-source (superuser)
update public.contents set provider = 'medium'  where provider_content_id = 'abcdefghijk';
update public.contents set provider = 'tistory' where provider_content_id = 'zzzzzzzzzzz';

set local role authenticated;
set local "request.jwt.claims" = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

-- ── facet returns one row per provider (3 distinct sources) ──
select is(
  (select count(*)::int from public.search_my_content_sources('컨텐츠')),
  3, 'source-count: "컨텐츠" 검색 → 3개 provider 그룹' );

-- ── per-provider content count (youtube has 1 content even though it has 2 clips) ──
select is(
  (select content_count::int from public.search_my_content_sources('컨텐츠') where provider = 'youtube'),
  1, 'source-count: youtube=1 content (다중 클립이어도 컨텐츠 단위 카운트)' );
select is(
  (select content_count::int from public.search_my_content_sources('컨텐츠') where provider = 'medium'),
  1, 'source-count: medium=1 content' );
select is(
  (select content_count::int from public.search_my_content_sources('컨텐츠') where provider = 'tistory'),
  1, 'source-count: tistory=1 content' );

-- ── source filter on the main RPC narrows to one provider ──
select is(
  (select provider from public.search_my_content('컨텐츠', null, 'medium') ),
  'medium', 'source-count: source 필터=medium → medium 행만' );

-- ── the source FACET ignores the source filter argument (all providers still listed) so the
--    UI can show every badge regardless of the active source tab ──
select is(
  (select count(*)::int from public.search_my_content_sources('컨텐츠')),
  3, 'source-count: facet은 모든 provider 배지를 동시 노출(소스필터 무관)' );

reset role;
select * from finish();
rollback;
