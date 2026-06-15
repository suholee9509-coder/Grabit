-- tests/clip-interval.sql
-- Proves ADR-0002 #2: interval semantics [start,end) — end exclusive, 0-length forbidden,
-- negative rejected, overlaps allowed, exact-duplicate re-clip merges memo (no new row).
-- Exercised through the shared ingest_clip() contract (web == extension) + the table CHECK.

begin;
select plan(8);

insert into auth.users (id, email) values ('11111111-1111-1111-1111-111111111111', 'u@test.dev');
do $$ begin perform public.get_or_create_content('https://youtu.be/dQw4w9WgXcQ'); end $$;

set local role authenticated;
set local "request.jwt.claims" = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

do $$ begin perform public.ingest_clip('https://youtu.be/dQw4w9WgXcQ', 10, 30, 'first note', true); end $$;
select is( (select count(*)::int from public.clips), 1, 'interval: valid clip inserted' );

-- re-clip the SAME interval → no new row, memo merged ("중복 클립 → 메모 추가만")
do $$ begin perform public.ingest_clip('https://youtu.be/dQw4w9WgXcQ', 10, 30, 'second note', true); end $$;
select is( (select count(*)::int from public.clips), 1, 'interval: re-clip same interval → no duplicate row' );
select ok(
  (select memo from public.clips) like '%first note%' and (select memo from public.clips) like '%second note%',
  'interval: re-clip merged both memos' );

-- overlapping but DIFFERENT interval → allowed (distinct grab)
do $$ begin perform public.ingest_clip('https://youtu.be/dQw4w9WgXcQ', 20, 40, 'overlap', true); end $$;
select is( (select count(*)::int from public.clips), 2, 'interval: overlapping different interval allowed' );

-- ingest guard rejects degenerate intervals (22023)
select throws_ok( $$ select public.ingest_clip('https://youtu.be/dQw4w9WgXcQ', 50, 50) $$, '22023', null, 'interval: 0-length rejected (end exclusive)' );
select throws_ok( $$ select public.ingest_clip('https://youtu.be/dQw4w9WgXcQ', 50, 40) $$, '22023', null, 'interval: end < start rejected' );
select throws_ok( $$ select public.ingest_clip('https://youtu.be/dQw4w9WgXcQ', -1, 5) $$,  '22023', null, 'interval: negative start rejected' );

reset role;
-- defense in depth: the table CHECK also rejects 0-length on a direct insert
select throws_ok(
  $$ insert into public.clips (user_id, content_id, start_sec, end_sec)
     values ('11111111-1111-1111-1111-111111111111', (select id from public.contents where provider_content_id = 'dQw4w9WgXcQ'), 10, 10) $$,
  '23514', null, 'interval: table CHECK rejects 0-length on direct insert' );

select * from finish();
rollback;
