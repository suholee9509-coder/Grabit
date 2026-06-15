-- tests/notification-pref.sql
-- Proves the u11 notification settings (L1-e): a user toggles a non-billing category ON/OFF,
-- the toggle is upserted (re-toggle updates, not duplicates), reads are self-only (RLS — a user
-- never sees another's prefs), billing categories are refused (gate ⓐ scope), and unauthenticated
-- writes are rejected.
--
-- Pattern (u0b): seed as superuser, then become the user via role+jwt so the invoker RPCs act
-- on the SELF rows under RLS.

begin;
select plan(9);

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'alice@test.dev'),
  ('22222222-2222-2222-2222-222222222222', 'bob@test.dev');

-- ── become alice ──
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

-- empty to start
select is( (select count(*)::int from public.get_notification_prefs()), 0,
  'notif: no prefs to start (empty default)' );

-- toggle trend ON
do $$ begin perform public.set_notification_pref('trend', true); end $$;
select is( (select enabled from public.notification_settings
             where user_id = (select auth.uid()) and category = 'trend'),
  true, 'notif: trend toggled ON (saved)' );

-- re-toggle trend OFF → upsert updates the SAME row (no duplicate)
do $$ begin perform public.set_notification_pref('trend', false); end $$;
select is( (select enabled from public.notification_settings
             where user_id = (select auth.uid()) and category = 'trend'),
  false, 'notif: trend re-toggled OFF (upsert updates in place)' );
select is( (select count(*)::int from public.notification_settings
             where user_id = (select auth.uid()) and category = 'trend'),
  1, 'notif: re-toggle does not create a duplicate row' );

-- billing/subscription category refused (gate ⓐ scope — non-billing only)
select throws_ok( $$ select public.set_notification_pref('subscription_expiry', true) $$,
  '23514', null, 'notif: billing/subscription category refused (non-billing only)' );

-- alice also sets a second category; get_notification_prefs returns only her own
do $$ begin perform public.set_notification_pref('digest', true); end $$;
select is( (select count(*)::int from public.get_notification_prefs()), 2,
  'notif: alice reads her own 2 prefs' );

-- ── become bob: sets his own; cannot see alice's (RLS self-only) ──
set local "request.jwt.claims" = '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';
do $$ begin perform public.set_notification_pref('trend', true); end $$;
select is( (select count(*)::int from public.get_notification_prefs()), 1,
  'notif: bob sees only his own pref (RLS isolates alice''s 2)' );
select is( (select count(*)::int from public.notification_settings
             where user_id = '11111111-1111-1111-1111-111111111111'),
  0, 'notif: bob cannot read alice''s rows directly (RLS)' );

-- unauthenticated → rejected (42501 → 401/403)
set local role anon;
set local "request.jwt.claims" = '';
select throws_ok( $$ select public.set_notification_pref('trend', true) $$,
  '42501', null, 'notif: unauthenticated toggle rejected' );

reset role;
select * from finish();
rollback;
