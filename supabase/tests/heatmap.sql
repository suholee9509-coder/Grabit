-- tests/heatmap.sql
-- Proves ADR-0002 #5: content_heatmap() per-bucket public-clip density with end-exclusive
-- overlap; private clips excluded; aggregate readable cross-user via the definer view.

begin;
select plan(5);

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'a@test.dev'),
  ('22222222-2222-2222-2222-222222222222', 'b@test.dev');
update public.profiles set job = '개발자', years = '1-3년' where id = '11111111-1111-1111-1111-111111111111';
update public.profiles set job = '개발자', years = '1-3년' where id = '22222222-2222-2222-2222-222222222222';
do $$ begin perform public.get_or_create_content('https://youtu.be/dQw4w9WgXcQ'); end $$;

-- public clips A[0,20) B[10,30) C[10,15)  + one PRIVATE clip D[5,8) that must NOT count
insert into public.clips (user_id, content_id, start_sec, end_sec, is_public) values
  ('11111111-1111-1111-1111-111111111111', (select id from public.contents where provider_content_id = 'dQw4w9WgXcQ'), 0,  20, true),
  ('22222222-2222-2222-2222-222222222222', (select id from public.contents where provider_content_id = 'dQw4w9WgXcQ'), 10, 30, true),
  ('11111111-1111-1111-1111-111111111111', (select id from public.contents where provider_content_id = 'dQw4w9WgXcQ'), 10, 15, true),
  ('22222222-2222-2222-2222-222222222222', (select id from public.contents where provider_content_id = 'dQw4w9WgXcQ'), 5,  8,  false);

select is( (select density from public.content_heatmap((select id from public.contents where provider_content_id = 'dQw4w9WgXcQ'), 10) where bucket_start = 0),  1,
  'heatmap: [0,10) density=1 (only A overlaps; private D excluded)' );
select is( (select density from public.content_heatmap((select id from public.contents where provider_content_id = 'dQw4w9WgXcQ'), 10) where bucket_start = 10), 3,
  'heatmap: [10,20) density=3 (A,B,C overlap)' );
select is( (select density from public.content_heatmap((select id from public.contents where provider_content_id = 'dQw4w9WgXcQ'), 10) where bucket_start = 20), 1,
  'heatmap: [20,30) density=1 (only B; A ends at 20, end-exclusive)' );
select is( (select count(*)::int from public.content_heatmap((select id from public.contents where provider_content_id = 'dQw4w9WgXcQ'), 10)), 3,
  'heatmap: 3 buckets over max_end=30' );

-- aggregate is readable by a logged-in user (definer view source bypasses RLS for aggregate only)
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';
select is( (select density from public.content_heatmap((select id from public.contents where provider_content_id = 'dQw4w9WgXcQ'), 10) where bucket_start = 10), 3,
  'heatmap: cross-user aggregate readable via definer view' );

reset role;
select * from finish();
rollback;
