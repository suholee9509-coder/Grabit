-- tests/derived-api-no-leak.sql
-- Proves L1-b sanitized read: the derived API (content_clips_public) exposes cross-user
-- PUBLIC clips WITHOUT identity (no user_id/display_name/email column, no real name in any
-- value), never exposes PRIVATE clips, never bypasses RLS on the base tables, and hides the
-- cohort label below the anonymization threshold. (ADR-0002 #3/#4)

begin;
select plan(7);

insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-1111-1111-111111111111', 'alice@test.dev', '{"full_name":"Alice Kim"}'::jsonb),
  ('22222222-2222-2222-2222-222222222222', 'bob@test.dev',   '{"full_name":"Bob Lee"}'::jsonb);

update public.profiles set job = '개발자',   years = '1-3년' where id = '11111111-1111-1111-1111-111111111111';
update public.profiles set job = '디자이너', years = '4-6년' where id = '22222222-2222-2222-2222-222222222222';

do $$ begin perform public.get_or_create_content('https://youtu.be/dQw4w9WgXcQ'); end $$;

insert into public.clips (user_id, content_id, start_sec, end_sec, memo, is_public) values
  ('11111111-1111-1111-1111-111111111111', (select id from public.contents where provider_content_id = 'dQw4w9WgXcQ'), 10, 30, 'great point on funding', true),
  ('11111111-1111-1111-1111-111111111111', (select id from public.contents where provider_content_id = 'dQw4w9WgXcQ'), 40, 60, 'PRIVATE my own note',    false);

-- (A) structural: read model has NO identity columns (asserted as superuser, full visibility)
select is(
  (select count(*)::int from information_schema.columns
     where table_schema = 'public' and table_name = 'content_clips_public'
       and column_name in ('user_id', 'display_name', 'email')),
  0, 'no-leak: content_clips_public has no user_id/display_name/email column' );

-- ── become BOB (different user) and read the sanitized cross-user model ──
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';

-- (B) cross-user PUBLIC clip IS visible via the sanitized model
select is(
  (select count(*)::int from public.content_clips_public
     where content_id = (select id from public.contents where provider_content_id = 'dQw4w9WgXcQ')),
  1, 'no-leak: bob sees alice''s PUBLIC clip via the sanitized model (1 row)' );

-- (C) PRIVATE clip is never exposed
select is(
  (select count(*)::int from public.content_clips_public where memo like '%PRIVATE%'),
  0, 'no-leak: private clip never appears in the sanitized model' );

-- (D) the real display_name never appears anywhere in an exposed row
select is(
  (select count(*)::int from public.content_clips_public v where to_jsonb(v)::text ilike '%Alice Kim%'),
  0, 'no-leak: real display_name never appears in any read-model value' );

-- (E) base tables remain RLS-isolated even though the derived view is readable
select is( (select count(*)::int from public.clips    where user_id = '11111111-1111-1111-1111-111111111111'), 0,
  'no-leak: base clips still RLS-isolated (no bypass)' );
select is( (select count(*)::int from public.profiles where id      = '11111111-1111-1111-1111-111111111111'), 0,
  'no-leak: cohort not directly readable cross-user (only via aggregate)' );

-- (F) cohort label hidden below anonymization threshold (1 user < 5) — interval still shows
select is(
  (select cohort_job from public.content_clips_public
     where content_id = (select id from public.contents where provider_content_id = 'dQw4w9WgXcQ') limit 1),
  null::text, 'no-leak: sub-threshold cohort label is hidden (job nulled), interval still anonymous-visible' );

reset role;
select * from finish();
rollback;
