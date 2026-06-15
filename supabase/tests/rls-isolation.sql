-- tests/rls-isolation.sql
-- Proves L1-a RLS: write/read SELF ONLY; cross-user clip/profile reads return 0;
-- cross-user write is rejected. (ADR-0002 #3)
--
-- Pattern: seed as superuser (owner bypasses RLS), then `set local role authenticated`
-- + request.jwt.claims sub → RLS enforced as that user. Setup statements use PERFORM/SET
-- so only pgTAP functions emit TAP output.

begin;
select plan(6);

-- ── seed two users (profiles auto-created by on_auth_user_created trigger) ──
insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-1111-1111-111111111111', 'alice@test.dev', '{"full_name":"Alice Kim"}'::jsonb),
  ('22222222-2222-2222-2222-222222222222', 'bob@test.dev',   '{"full_name":"Bob Lee"}'::jsonb);

update public.profiles set job = '개발자',   years = '1-3년' where id = '11111111-1111-1111-1111-111111111111';
update public.profiles set job = '디자이너', years = '4-6년' where id = '22222222-2222-2222-2222-222222222222';

do $$ begin perform public.get_or_create_content('https://youtu.be/dQw4w9WgXcQ'); end $$;

insert into public.clips (user_id, content_id, start_sec, end_sec, memo, is_public) values
  ('11111111-1111-1111-1111-111111111111', (select id from public.contents where provider_content_id = 'dQw4w9WgXcQ'), 10, 30, 'alice public',  true),
  ('11111111-1111-1111-1111-111111111111', (select id from public.contents where provider_content_id = 'dQw4w9WgXcQ'), 40, 60, 'alice private', false),
  ('22222222-2222-2222-2222-222222222222', (select id from public.contents where provider_content_id = 'dQw4w9WgXcQ'), 15, 35, 'bob public',    true);

select is( (select count(*)::int from public.clips), 3, 'seed: 3 clips total (superuser bypasses RLS)' );

-- ── become BOB ──
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';

select is( (select count(*)::int from public.clips), 1,
  'rls: bob sees only his own clips via base table' );
select is( (select count(*)::int from public.clips where user_id = '11111111-1111-1111-1111-111111111111'), 0,
  'rls: bob sees 0 of alice''s clip rows (no cross-user read)' );
select is( (select count(*)::int from public.profiles where id = '11111111-1111-1111-1111-111111111111'), 0,
  'rls: bob cannot read alice''s profile row (deanonymization guard)' );
with d as (delete from public.clips where user_id = '11111111-1111-1111-1111-111111111111' returning 1)
select is( (select count(*)::int from d), 0,
  'rls: bob''s delete of alice''s rows affects 0 rows' );
select throws_ok(
  $$ insert into public.clips (user_id, content_id, start_sec, end_sec, is_public)
     values ('11111111-1111-1111-1111-111111111111', (select id from public.contents where provider_content_id = 'dQw4w9WgXcQ'), 1, 2, true) $$,
  '42501', null,
  'rls: bob cannot insert a clip owned by alice (with check)' );

reset role;
select * from finish();
rollback;
