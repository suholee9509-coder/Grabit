-- tests/profile-update.sql
-- Proves the u11 profile-edit RPC (L1-b): self-only edit of display_name + cohort dims,
-- the SAME validation contract as onboarding (display_name non-blank, job/years/goal single-
-- required, interests 1..5 boundary, XSS/blank/over-length neutralized), and the public/private
-- split — editing leaves onboarded_at intact and never exposes private fields cross-user.
--
-- Pattern (u0b): seed as superuser (trigger auto-creates the profile), then become the user via
-- role+jwt so the invoker RPC writes the SELF row under RLS.

begin;
select plan(13);

insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-1111-1111-111111111111', 'alice@test.dev', '{"full_name":"Alice Kim"}'::jsonb);

-- ── become alice ──
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

-- establish an onboarded baseline, then edit it
do $$ begin perform public.complete_onboarding('개발자','2-3년차','취업·이직', array['면접·자소서']); end $$;

-- happy path: edit display_name + cohort + interests (preset + direct input)
do $$ begin perform public.update_profile('수호','기획·PM','4-6년차','역량 강화·스킬업', array['UX 리서치','커리어']); end $$;

select is( (select display_name from public.profiles where id = (select auth.uid())), '수호',       'update: display_name persisted' );
select is( (select job          from public.profiles where id = (select auth.uid())), '기획·PM',     'update: public cohort job edited' );
select is( (select years         from public.profiles where id = (select auth.uid())), '4-6년차',    'update: public cohort years edited' );
select is( (select goal          from public.profiles where id = (select auth.uid())), '역량 강화·스킬업', 'update: goal (private) edited' );
select is( (select array_length(interests,1) from public.profiles where id = (select auth.uid())), 2, 'update: 2 interests persisted' );

-- onboarded_at must survive an edit (editing ≠ re-onboarding)
select is( public.is_onboarded(), true, 'update: profile stays onboarded after edit (onboarded_at untouched)' );

-- get_my_profile returns the caller's own row (with deleted_at null = live)
select is( (select (public.get_my_profile()).display_name), '수호',        'update: get_my_profile returns own display_name' );
select is( (select (public.get_my_profile()).deleted_at),  null::timestamptz, 'update: get_my_profile shows live account (deleted_at null)' );

-- direct-input neutralization: angle brackets stripped, blank dropped, duplicate deduped, capped
do $$ begin perform public.update_profile(
  '수호','개발자','2-3년차','취업·이직',
  array['<script>alert(1)</script>그로스', '   ', '커리어', '커리어', repeat('가',200)]
); end $$;
select is( (select count(*)::int from unnest(
             (select interests from public.profiles where id = (select auth.uid()))
           ) as t(val) where val like '%<%' or val like '%>%'),
  0, 'update: no interest contains angle brackets (XSS-harmless)' );
select is( (select array_length(interests,1) from public.profiles where id = (select auth.uid())),
  3, 'update: blank dropped + duplicate deduped (4 distinct non-blank → 3 stored)' );

-- negative: blank display_name rejected (no write)
select throws_ok( $$ select public.update_profile('   ','개발자','2-3년차','취업·이직', array['커리어']) $$,
  '23514', null, 'update: blank display_name rejected' );

-- negative: interests boundary (reject 0 and 6+)
select throws_ok( $$ select public.update_profile('수호','개발자','2-3년차','취업·이직', array[]::text[]) $$,
  '23514', null, 'update: 0 interests rejected (min 1)' );
select throws_ok( $$ select public.update_profile('수호','개발자','2-3년차','취업·이직', array['a','b','c','d','e','f']) $$,
  '23514', null, 'update: 6 interests rejected (max 5)' );

reset role;
select * from finish();
rollback;
