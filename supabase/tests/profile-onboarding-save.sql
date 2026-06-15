-- tests/profile-onboarding-save.sql
-- Proves the u1 onboarding-save RPC (L1-c): single-required job/years/goal, interests 1..5
-- (direct-input included), completion flag set, and the negative contract — missing single
-- field rejected, 0 / 6+ interests rejected, direct-input XSS/blank/over-length neutralized.
--
-- Pattern (u0b): seed as superuser (trigger auto-creates the profile), then become the user
-- via role+jwt so the invoker RPC writes the SELF row under RLS.

begin;
select plan(15);

insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-1111-1111-111111111111', 'alice@test.dev', '{"full_name":"Alice Kim"}'::jsonb);

-- pre-onboarding: profile exists (trigger) but not completed
select is( (select onboarded_at from public.profiles where id = '11111111-1111-1111-1111-111111111111'),
  null::timestamptz, 'save: profile starts un-onboarded (onboarded_at null)' );

-- ── become alice ──
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

-- happy path: single-required + 2 interests (preset + direct input)
do $$ begin perform public.complete_onboarding('개발자','2-3년차','취업·이직', array['면접·자소서','UX 리서치']); end $$;

select is( (select job   from public.profiles where id = (select auth.uid())), '개발자',   'save: job persisted' );
select is( (select years from public.profiles where id = (select auth.uid())), '2-3년차',  'save: years persisted' );
select is( (select goal  from public.profiles where id = (select auth.uid())), '취업·이직', 'save: goal persisted' );
select is( (select array_length(interests,1) from public.profiles where id = (select auth.uid())),
  2, 'save: 2 interests persisted (preset + direct input)' );
select is( (select onboarded_at is not null from public.profiles where id = (select auth.uid())),
  true, 'save: onboarded_at set (completion flag)' );
select is( public.is_onboarded(), true, 'save: is_onboarded() true after completion' );

-- direct-input neutralization: tags/angle-brackets stripped, blank dropped, duplicate deduped,
-- over-length capped. raw 5 → '<script>alert(1)</script>그로스', blank, '커리어', '커리어', '가'x200
do $$ begin perform public.complete_onboarding(
  '개발자','2-3년차','취업·이직',
  array['<script>alert(1)</script>그로스', '   ', '커리어', '커리어', repeat('가',200)]
); end $$;
select is( (select count(*)::int from unnest(
             (select interests from public.profiles where id = (select auth.uid()))
           ) as t(val) where val like '%<%' or val like '%>%'),
  0, 'save: no interest contains angle brackets (XSS-harmless)' );
select is( (select max(length(val))::int from unnest(
             (select interests from public.profiles where id = (select auth.uid()))
           ) as t(val)),
  40, 'save: over-length interest capped to 40 chars' );
select is( (select array_length(interests,1) from public.profiles where id = (select auth.uid())),
  3, 'save: blank dropped + duplicate deduped (4 distinct non-blank → 3 stored)' );

-- negative: single-required field missing → reject (no write)
select throws_ok( $$ select public.complete_onboarding(null,'2-3년차','취업·이직', array['커리어']) $$,
  '23514', null, 'save: missing job rejected' );
select throws_ok( $$ select public.complete_onboarding('개발자',null,'취업·이직', array['커리어']) $$,
  '23514', null, 'save: missing years rejected' );
select throws_ok( $$ select public.complete_onboarding('개발자','2-3년차',null, array['커리어']) $$,
  '23514', null, 'save: missing goal rejected' );

-- negative: interests count boundary (reject 0 and 6+)
select throws_ok( $$ select public.complete_onboarding('개발자','2-3년차','취업·이직', array[]::text[]) $$,
  '23514', null, 'save: 0 interests rejected (min 1)' );
select throws_ok( $$ select public.complete_onboarding('개발자','2-3년차','취업·이직', array['a','b','c','d','e','f']) $$,
  '23514', null, 'save: 6 interests rejected (max 5)' );

reset role;
select * from finish();
rollback;
