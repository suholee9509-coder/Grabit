-- tests/profile-rls.sql
-- Proves the u1 write-path authorization: a user writes ONLY their own profile (RLS self-write),
-- the onboarding RPC always targets auth.uid() (cannot complete onboarding for another user),
-- and an unauthenticated caller is rejected (42501 → 401/403). (ADR-0002 #6 · L1-c negative)

begin;
select plan(4);

insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-1111-1111-111111111111', 'alice@test.dev', '{"full_name":"Alice Kim"}'::jsonb),
  ('22222222-2222-2222-2222-222222222222', 'bob@test.dev',   '{"full_name":"Bob Lee"}'::jsonb);

-- ── become BOB ──
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';

-- (1) bob cannot write alice's profile row (RLS update matches 0 rows)
with d as (
  update public.profiles set job = 'hacked' where id = '11111111-1111-1111-1111-111111111111' returning 1
)
select is( (select count(*)::int from d), 0, 'rls: bob''s update of alice profile affects 0 rows' );

-- (2) bob completes only his own onboarding (RPC targets auth.uid(); no id param)
do $$ begin perform public.complete_onboarding('디자이너','4-6년차','역량 강화·스킬업', array['디자인','협업·커뮤니케이션']); end $$;
select is( (select onboarded_at is not null from public.profiles where id = (select auth.uid())),
  true, 'rls: bob completes his own profile' );

-- ── superuser view: alice was NOT written by bob ──
reset role;
select is( (select onboarded_at from public.profiles where id = '11111111-1111-1111-1111-111111111111'),
  null::timestamptz, 'rls: alice onboarding not written by bob (self-only)' );

-- (4) unauthenticated → rejected (42501)
set local role anon;
set local "request.jwt.claims" = '';
select throws_ok(
  $$ select public.complete_onboarding('개발자','2-3년차','취업·이직', array['커리어']) $$,
  '42501', null, 'rls: unauthenticated complete_onboarding rejected (401/permission)' );

reset role;
select * from finish();
rollback;
