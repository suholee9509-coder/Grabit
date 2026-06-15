-- tests/search-auth.sql
-- Proves the search RPCs reject unauthenticated callers: with no JWT sub (auth.uid() is null),
-- search_my_content / search_my_content_sources raise 28000 (PostgREST → 401/403). An
-- authenticated caller with the same query succeeds (does not raise). The sort parameter is
-- also defensively defaulted (unknown value → 'recent') so a bad sort never errors.
-- (spec §Validation BE search-auth · 미인증 차단)

begin;
select plan(5);

insert into auth.users (id, email) values ('11111111-1111-1111-1111-111111111111', 'u@test.dev');
do $$ begin perform public.get_or_create_content('https://youtu.be/dQw4w9WgXcQ', '데이터 분석', '채널'); end $$;

set local role authenticated;
set local "request.jwt.claims" = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';
do $$ begin perform public.ingest_clip('https://youtu.be/dQw4w9WgXcQ', 10, 30, '메모', true, null, array['분석']); end $$;
reset role;

-- ── authenticated role but NO JWT sub (logged-out / expired) → auth.uid() is null → 28000 ──
-- This is the PostgREST model: role stays authenticated; identity comes from the JWT claims.
-- The function's own guard raises 28000 (the table-level grant to anon is intentionally absent
-- as a second layer, but 28000 is the contract the API surfaces).
set local role authenticated;
set local "request.jwt.claims" = '';      -- no sub → auth.uid() null
select throws_ok(
  $$ select * from public.search_my_content('분석') $$,
  '28000', null, 'auth: 미인증(uid null) search_my_content → 28000(차단)' );
select throws_ok(
  $$ select * from public.search_my_content_sources('분석') $$,
  '28000', null, 'auth: 미인증(uid null) search_my_content_sources → 28000(차단)' );
reset role;

-- ── authenticated → no exception, returns the row ──
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';
select is(
  (select count(*)::int from public.search_my_content('분석')),
  1, 'auth: 인증 사용자는 동일 query로 결과 1건' );

-- bad / unknown sort must not error (defaults to recent)
select is(
  (select count(*)::int from public.search_my_content('분석', null, null, 'not_a_sort')),
  1, 'auth: 알 수 없는 sort 값 → 에러 ❌(기본 recent로 처리)' );
-- empty query is still safe for an authenticated user (0건, no error)
select is(
  (select count(*)::int from public.search_my_content('')),
  0, 'auth: 인증 사용자 빈 query → 0건(에러 ❌)' );

reset role;
select * from finish();
rollback;
