-- tests/search-rls-isolation.sql
-- Proves L1-b search privacy: search_my_content surfaces ONLY the caller's own clips.
-- Another user's clips on the SAME content are NEVER matched (cross-user leak = 0), even when
-- their title/memo/tag would match the query. Counts reflect only the caller's matched clips.
-- (ADR-0002 #10 search privacy · #3 RLS write=self/read=self · spec §Validation BE search-rls-isolation)
--
-- Pattern (mirrors rls-isolation.sql): seed both users as superuser, ingest each user's clips
-- under their own JWT, then search AS bob and assert alice's rows are invisible.

begin;
select plan(6);

insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-1111-1111-111111111111', 'alice@test.dev', '{"full_name":"Alice Kim"}'::jsonb),
  ('22222222-2222-2222-2222-222222222222', 'bob@test.dev',   '{"full_name":"Bob Lee"}'::jsonb);

do $$ begin perform public.get_or_create_content('https://youtu.be/dQw4w9WgXcQ', '데이터 분석 강의', '채널'); end $$;

-- alice: two clips on the shared content, memo + tag both contain the search term "성장"
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';
do $$ begin perform public.ingest_clip('https://youtu.be/dQw4w9WgXcQ', 10, 30, '성장 인사이트 메모', true, null, array['성장','커리어']); end $$;
do $$ begin perform public.ingest_clip('https://youtu.be/dQw4w9WgXcQ', 40, 60, '두번째 성장 메모',   true, null, array['성장']); end $$;
reset role;

-- bob: ONE clip on the SAME content, also matching "성장"
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';
do $$ begin perform public.ingest_clip('https://youtu.be/dQw4w9WgXcQ', 15, 35, '성장 노트', true, null, array['성장']); end $$;

-- ── search AS BOB: must see ONLY his own clip (1), never alice's 2 ──
select is(
  (select count(*)::int from public.search_my_content('성장')),
  1, 'search-rls: bob''s 성장 search returns exactly 1 content row (his own)' );
select is(
  (select clip_count::int from public.search_my_content('성장') limit 1),
  1, 'search-rls: clip_count counts ONLY bob''s matched clip, not alice''s 2 on same content' );
select is(
  (select content_count::int from public.search_my_content_sources('성장') limit 1),
  1, 'search-rls: source count is bob''s 1 content (alice''s clips excluded)' );
reset role;

-- ── search AS ALICE: she sees her own 2 clips on that content (clip_count 2), bob excluded ──
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';
select is(
  (select clip_count::int from public.search_my_content('성장') limit 1),
  2, 'search-rls: alice sees her own 2 matched clips (bob''s clip not counted)' );
reset role;

-- ── a user with NO clips searching the same term gets 0 rows (no cross-user bleed) ──
insert into auth.users (id, email) values ('33333333-3333-3333-3333-333333333333', 'carol@test.dev');
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated"}';
select is(
  (select count(*)::int from public.search_my_content('성장')),
  0, 'search-rls: a clip-less user gets 0 results (no leak of alice/bob clips)' );
select is(
  (select count(*)::int from public.search_my_content_sources('성장')),
  0, 'search-rls: clip-less user gets 0 source rows' );
reset role;

select * from finish();
rollback;
