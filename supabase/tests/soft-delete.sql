-- tests/soft-delete.sql
-- Proves the u11 soft-delete lifecycle (L1-d · ADR-0002 #9): withdrawal sets profiles.deleted_at
-- (NOT a hard-delete — the row + clips survive), is idempotent (re-request keeps the original
-- grace-start), get_my_profile exposes deleted_at for the recovery banner, restore clears it,
-- and the whole path is self-only (RLS: a user cannot delete another's account).
--
-- Pattern (u0b): seed as superuser, then become the user via role+jwt so the invoker RPCs act
-- on the SELF row under RLS.

begin;
select plan(11);

insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-1111-1111-111111111111', 'alice@test.dev', '{"full_name":"Alice Kim"}'::jsonb),
  ('22222222-2222-2222-2222-222222222222', 'bob@test.dev',   '{"full_name":"Bob Lee"}'::jsonb);

do $$ begin perform public.get_or_create_content('https://youtu.be/dQw4w9WgXcQ'); end $$;
insert into public.clips (user_id, content_id, start_sec, end_sec, memo, is_public) values
  ('11111111-1111-1111-1111-111111111111', (select id from public.contents where provider_content_id = 'dQw4w9WgXcQ'), 10, 30, 'alice clip', true);

-- ── become alice ──
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

-- live to start
select is( (select (public.get_my_profile()).deleted_at), null::timestamptz, 'soft-delete: account starts live (deleted_at null)' );

-- withdraw → deleted_at set
do $$ begin perform public.soft_delete_account(); end $$;
select is( (select (public.get_my_profile()).deleted_at is not null), true,
  'soft-delete: withdrawal sets deleted_at (grace started)' );

-- NOT a hard-delete: the profile row AND the clips still exist (self-readable)
select is( (select count(*)::int from public.profiles where id = (select auth.uid())), 1,
  'soft-delete: profile row still exists (soft, not hard-delete)' );
select is( (select count(*)::int from public.clips where user_id = (select auth.uid())), 1,
  'soft-delete: user clips still exist (not cascaded/hard-deleted)' );

-- idempotent: re-request is harmless and keeps the original grace-start timestamp
select set_config('test.first_deleted', (select deleted_at::text from public.profiles where id = (select auth.uid())), true);
do $$ begin perform pg_sleep(0); perform public.soft_delete_account(); end $$;
select is( (select deleted_at::text from public.profiles where id = (select auth.uid())),
  current_setting('test.first_deleted'),
  'soft-delete: idempotent — re-request keeps the original grace-start (no reset)' );

-- editing a soft-deleted profile is refused (must restore first)
select throws_ok( $$ select public.update_profile('수호','개발자','2-3년차','취업·이직', array['커리어']) $$,
  'P0002', null, 'soft-delete: update_profile refused while in grace (must restore)' );

-- restore → live again (deleted_at cleared)
do $$ begin perform public.restore_account(); end $$;
select is( (select (public.get_my_profile()).deleted_at), null::timestamptz,
  'soft-delete: restore clears deleted_at (account live again)' );

-- after restore, editing works again
do $$ begin perform public.update_profile('수호','개발자','2-3년차','취업·이직', array['커리어']); end $$;
select is( (select display_name from public.profiles where id = (select auth.uid())), '수호',
  'soft-delete: edit works again after restore' );

-- ── self-only: bob cannot soft-delete alice (RLS targets auth.uid() only) ──
set local "request.jwt.claims" = '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';
do $$ begin perform public.soft_delete_account(); end $$;   -- deletes BOB, not alice

reset role;
select is( (select deleted_at is null from public.profiles where id = '11111111-1111-1111-1111-111111111111'),
  true, 'soft-delete: alice NOT deleted by bob''s withdrawal (self-only)' );
select is( (select deleted_at is not null from public.profiles where id = '22222222-2222-2222-2222-222222222222'),
  true, 'soft-delete: bob''s own withdrawal applied (self target)' );

-- unauthenticated → rejected (42501 → 401/403)
set local role anon;
set local "request.jwt.claims" = '';
select throws_ok( $$ select public.soft_delete_account() $$,
  '42501', null, 'soft-delete: unauthenticated withdrawal rejected' );

reset role;
select * from finish();
rollback;
