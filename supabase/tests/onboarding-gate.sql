-- tests/onboarding-gate.sql
-- Proves the onboarding completion gate (L1-b/e): a new user (no completion) is NOT onboarded
-- (routed to onboarding); after complete_onboarding() the user IS onboarded (skips onboarding,
-- home direct); an incomplete user stays gated across re-login. is_onboarded() is the predicate.

begin;
select plan(5);

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'alice@test.dev'),   -- stays incomplete
  ('22222222-2222-2222-2222-222222222222', 'bob@test.dev');     -- completes

-- ── alice: new / incomplete → gated to onboarding ──
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';
select is( public.is_onboarded(), false, 'gate: new user (no completion) not onboarded → routed to onboarding' );
select is( (select onboarded_at from public.profiles where id = (select auth.uid())),
  null::timestamptz, 'gate: incomplete profile has null onboarded_at' );

-- ── bob: completes → skips onboarding ──
set local "request.jwt.claims" = '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';
select is( public.is_onboarded(), false, 'gate: bob not onboarded before completing' );
do $$ begin perform public.complete_onboarding('기획·PM','0~1년차','취업·이직', array['프로덕트·서비스 기획']); end $$;
select is( public.is_onboarded(), true, 'gate: bob onboarded after completion → home direct (skips onboarding)' );

-- ── alice still gated (independent of bob) ──
set local "request.jwt.claims" = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';
select is( public.is_onboarded(), false, 'gate: alice still gated on re-login until she completes' );

reset role;
select * from finish();
rollback;
