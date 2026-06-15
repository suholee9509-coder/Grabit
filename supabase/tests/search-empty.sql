-- tests/search-empty.sql
-- Proves L1-c empty/zero-result behavior + negative cases: search_my_content returns an EMPTY
-- result set (NO error) for ① empty/whitespace query, ② a query matching nothing, ③ a category
-- filter excluding all rows, ④ a source filter excluding all rows — and is injection-inert
-- (LIKE metacharacters and tsquery operators in the query never error / never widen the match).
-- (spec §Validation BE search-empty + 빈/공백/인젝션 무해화)

begin;
select plan(11);

insert into auth.users (id, email) values ('11111111-1111-1111-1111-111111111111', 'u@test.dev');
do $$ begin perform public.get_or_create_content('https://youtu.be/dQw4w9WgXcQ', '데이터 분석', '채널'); end $$;
do $$ begin perform public.get_or_create_content('https://youtu.be/abcdefghijk', '순수 영상', '채널2'); end $$;

set local role authenticated;
set local "request.jwt.claims" = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';
do $$ begin perform public.ingest_clip('https://youtu.be/dQw4w9WgXcQ', 10, 30, '50% 할인 메모', true, null, array['분석']); end $$;
-- a second content with NO percent/underscore anywhere (to prove "%"/"_" are not wildcards)
do $$ begin perform public.ingest_clip('https://youtu.be/abcdefghijk', 1, 9, '깨끗한 메모', true, null, null); end $$;

-- ① empty / whitespace → empty, no error
select is( (select count(*)::int from public.search_my_content('')),    0, 'empty: 빈 문자열 query → 0건(에러 ❌)' );
select is( (select count(*)::int from public.search_my_content('   ')), 0, 'empty: 공백만 query → 0건' );
select is( (select count(*)::int from public.search_my_content(null)),  0, 'empty: null query → 0건' );
select is( (select count(*)::int from public.search_my_content_sources('   ')), 0, 'empty: 공백 query → 출처 facet 0건' );

-- ② a real query matching nothing → empty, no error
select is( (select count(*)::int from public.search_my_content('절대없는검색어xyz')), 0, 'empty: 매칭 0건 → 빈 응답(에러 ❌)' );

-- ③ category filter excludes everything → empty
select is(
  (select count(*)::int from public.search_my_content('분석', '존재안하는카테고리')),
  0, 'empty: 카테고리 필터가 전부 배제 → 0건' );

-- ④ source filter excludes everything → empty
select is(
  (select count(*)::int from public.search_my_content('분석', null, 'vimeo')),
  0, 'empty: 출처 필터가 전부 배제 → 0건' );

-- ── injection inertness: LIKE metacharacters are matched literally, not as wildcards ──
-- "%" alone matches ONLY the content whose memo literally contains "%" (the 50% memo) — it does
-- NOT act as a wildcard matching the clean second content → 1 row, not 2. (no-wildcard-leak)
select is(
  (select count(*)::int from public.search_my_content('%')),
  1, 'empty: 단독 "%" → 와일드카드 ❌, "50%" 메모만 리터럴 매칭(클린 컨텐츠 비매칭)' );
select is(
  (select count(*)::int from public.search_my_content('_')),
  0, 'empty: 단독 "_" → 와일드카드 ❌(어떤 메모도 "_" 미포함 → 0건)' );
-- literal "50%" matches the memo containing "50%"
select is(
  (select count(*)::int from public.search_my_content('50%')),
  1, 'empty: "50%" → 리터럴 매칭(메모의 "50%")' );

-- ── tsquery-operator injection: raw operators must not error (websearch parser sanitizes) ──
select is(
  (select count(*)::int from public.search_my_content('분석 & | ! : *')),
  1, 'empty: tsquery 연산자 포함 query → 에러 ❌, "분석" 토큰만 매칭' );

reset role;
select * from finish();
rollback;
