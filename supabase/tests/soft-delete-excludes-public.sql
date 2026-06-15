-- tests/soft-delete-excludes-public.sql
-- Proves the privacy-strengthening of ADR-0002 #9: while a user is in soft-delete grace
-- (profiles.deleted_at set), their PUBLIC clips/annotations/cohort are EXCLUDED from every
-- sanitized public aggregate (content_clips_public, content_annotations_public, content_heatmap,
-- onboarding_cohorts_public) → cross-user exposure of a withdrawing user drops to 0. Restoring
-- brings them back. The view column signatures are unchanged (no-regression checked elsewhere).
--
-- Pattern (u0b): seed as superuser, read the cross-user sanitized model as a DIFFERENT user.

begin;
select plan(8);

-- a single cohort (개발자, 2-3년차) of 5 users so the cohort label would normally REVEAL,
-- plus a 6th cross-user reader (bob). All 5 post a public clip + annotation on one content.
do $$
declare i int; uid uuid; cid uuid;
begin
  perform public.get_or_create_content('https://youtu.be/dQw4w9WgXcQ');
  select id into cid from public.contents where provider_content_id = 'dQw4w9WgXcQ';
  for i in 1..5 loop
    uid := ('aaaaaaaa-0000-0000-0000-00000000000' || i)::uuid;
    insert into auth.users (id, email, raw_user_meta_data)
      values (uid, 'dev'||i||'@test.dev', '{"full_name":"Dev User"}'::jsonb);
    update public.profiles set job='개발자', years='2-3년차', goal='취업·이직',
           interests=array['커리어'], onboarded_at=now() where id = uid;
    insert into public.clips (user_id, content_id, start_sec, end_sec, memo, is_public)
      values (uid, cid, 10, 30, 'public clip', true);
    insert into public.annotations (user_id, content_id, at_sec, body, is_public)
      values (uid, cid, 12, 'public note', true);
  end loop;
end $$;

-- a cross-user reader (not one of the 5)
insert into auth.users (id, email) values ('bbbbbbbb-0000-0000-0000-000000000001', 'bob@test.dev');

-- baseline (all live): cohort reveals at threshold 5, all rows present
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"bbbbbbbb-0000-0000-0000-000000000001","role":"authenticated"}';
select is( (select count(*)::int from public.content_clips_public
             where content_id = (select id from public.contents where provider_content_id='dQw4w9WgXcQ')),
  5, 'exclude: baseline — 5 public clips visible (all live)' );
select is( (select count(*)::int from public.onboarding_cohorts_public
             where cohort_job='개발자' and cohort_years='2-3년차'),
  1, 'exclude: baseline — cohort present (5 users >= threshold)' );

-- ── one of the 5 (dev1) withdraws → soft-delete ──
reset role;
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"aaaaaaaa-0000-0000-0000-000000000001","role":"authenticated"}';
do $$ begin perform public.soft_delete_account(); end $$;

-- ── back to the cross-user reader: dev1 is now excluded everywhere ──
set local "request.jwt.claims" = '{"sub":"bbbbbbbb-0000-0000-0000-000000000001","role":"authenticated"}';
select is( (select count(*)::int from public.content_clips_public
             where content_id = (select id from public.contents where provider_content_id='dQw4w9WgXcQ')),
  4, 'exclude: grace-period user''s public clip removed from sanitized clips model' );
select is( (select count(*)::int from public.content_annotations_public
             where content_id = (select id from public.contents where provider_content_id='dQw4w9WgXcQ')),
  4, 'exclude: grace-period user''s public annotation removed from sanitized annotations model' );

-- heatmap density derives from content_clips_public → also drops by one
select is( (select max(density)::int from public.content_heatmap(
             (select id from public.contents where provider_content_id='dQw4w9WgXcQ'), 60)),
  4, 'exclude: heatmap density excludes the grace-period user''s clip' );

-- cohort now 4 users (< threshold 5) → cohort label dropped entirely
select is( (select count(*)::int from public.onboarding_cohorts_public
             where cohort_job='개발자' and cohort_years='2-3년차'),
  0, 'exclude: grace-period user drops the cohort below threshold (label hidden)' );

-- zero cross-user exposure of the withdrawing user's id anywhere in the clips read model
select is( (select count(*)::int from public.content_clips_public v
             where to_jsonb(v)::text ilike '%aaaaaaaa-0000-0000-0000-000000000001%'),
  0, 'exclude: withdrawing user''s id never appears in the sanitized model' );

-- ── dev1 restores → reappears ──
reset role;
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"aaaaaaaa-0000-0000-0000-000000000001","role":"authenticated"}';
do $$ begin perform public.restore_account(); end $$;
set local "request.jwt.claims" = '{"sub":"bbbbbbbb-0000-0000-0000-000000000001","role":"authenticated"}';
select is( (select count(*)::int from public.content_clips_public
             where content_id = (select id from public.contents where provider_content_id='dQw4w9WgXcQ')),
  5, 'exclude: restore brings the user back into the sanitized model' );

reset role;
select * from finish();
rollback;
