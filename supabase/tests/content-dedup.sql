-- tests/content-dedup.sql
-- Proves ADR-0002 #1: every URL form of one video → exactly 1 content; canonicalization;
-- metadata preserved across null-meta re-ingest (meta-fetch failure safe); invalid URL rejected.

begin;
select plan(7);

-- 8 distinct URL forms of the SAME video (dQw4w9WgXcQ)
do $$ begin
  perform public.get_or_create_content('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Rick', 'RickCh', 213, 'http://thumb');
  perform public.get_or_create_content('https://youtu.be/dQw4w9WgXcQ');
  perform public.get_or_create_content('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s');
  perform public.get_or_create_content('https://m.youtube.com/watch?v=dQw4w9WgXcQ');
  perform public.get_or_create_content('https://www.youtube.com/shorts/dQw4w9WgXcQ');
  perform public.get_or_create_content('https://www.youtube.com/embed/dQw4w9WgXcQ?start=10');
  perform public.get_or_create_content('https://music.youtube.com/watch?v=dQw4w9WgXcQ&list=PLabc123');
  perform public.get_or_create_content('https://www.youtube.com/live/dQw4w9WgXcQ');
end $$;

select is( (select count(*)::int from public.contents where provider_content_id = 'dQw4w9WgXcQ'), 1,
  'dedup: 8 URL forms of one video → exactly 1 content' );
select is( (select canonical_url from public.contents where provider_content_id = 'dQw4w9WgXcQ'),
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dedup: canonical_url normalized' );
select is( (select provider from public.contents where provider_content_id = 'dQw4w9WgXcQ'), 'youtube',
  'dedup: provider = youtube' );

-- metadata from the first (rich) call is NOT clobbered by later null-metadata calls
select is( (select title from public.contents where provider_content_id = 'dQw4w9WgXcQ'), 'Rick',
  'dedup: existing title preserved across null-meta re-ingest (meta-fetch failure safe)' );
select is( (select duration_sec from public.contents where provider_content_id = 'dQw4w9WgXcQ'), 213,
  'dedup: duration preserved' );

-- a different video id → a separate content row
do $$ begin perform public.get_or_create_content('https://youtu.be/abcdefghijk'); end $$;
select is( (select count(*)::int from public.contents), 2, 'dedup: distinct video id → new content row' );

-- invalid / non-YouTube URL is rejected
select throws_ok( $$ select public.get_or_create_content('https://example.com/not-a-video') $$,
  '22023', null, 'dedup: invalid / non-YouTube URL raises 22023' );

select * from finish();
rollback;
