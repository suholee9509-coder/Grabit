-- tests/profile-cohort-split.sql
-- Proves ADR-0002 #6 public/private split in the cohort aggregate: onboarding_cohorts_public
-- exposes ONLY the public cohort dims (job, years) + a user count, and NEVER the private fields
-- (interests, goal, display_name) or identity (id/email). A revealed cohort (>= threshold)
-- shows job+years; private values appear in 0 exposed rows.

begin;
select plan(7);

-- 5 completed users in one cohort (개발자, 2-3년차) with distinctive PRIVATE values
do $$
declare i int; uid uuid;
begin
  for i in 1..5 loop
    uid := ('00000000-0000-0000-0000-00000000000' || i)::uuid;
    insert into auth.users (id, email, raw_user_meta_data)
      values (uid, 'dev'||i||'@test.dev', '{"full_name":"Alice Kim"}'::jsonb);
    update public.profiles
       set job='개발자', years='2-3년차', goal='역량 강화·스킬업',
           interests = array['SECRETXYZ','커리어'], onboarded_at = now()
     where id = uid;
  end loop;
end $$;

-- (A) structural: the aggregate has NO private/identity columns at all
select is( (select count(*)::int from information_schema.columns
             where table_schema='public' and table_name='onboarding_cohorts_public'
               and column_name in ('interests','goal','display_name','email','id','user_id')),
  0, 'split: cohort aggregate exposes no interests/goal/display_name/email/id/user_id column' );

-- ── become a cross-user reader ──
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-000000000001","role":"authenticated"}';

-- (B) PUBLIC cohort (job+years) IS exposed in the aggregate
select is( (select users from public.onboarding_cohorts_public
              where cohort_job='개발자' and cohort_years='2-3년차'),
  5, 'split: completed cohort exposes job+years with user count 5' );
select is( (select cohort_job   from public.onboarding_cohorts_public limit 1), '개발자',  'split: public cohort job exposed' );
select is( (select cohort_years from public.onboarding_cohorts_public limit 1), '2-3년차', 'split: public cohort years exposed' );

-- (C) PRIVATE values never appear in any exposed aggregate row
select is( (select count(*)::int from public.onboarding_cohorts_public v where to_jsonb(v)::text ilike '%SECRETXYZ%'),
  0, 'split: private interest never appears in the public aggregate' );
select is( (select count(*)::int from public.onboarding_cohorts_public v where to_jsonb(v)::text ilike '%역량 강화%'),
  0, 'split: private goal never appears in the public aggregate' );
select is( (select count(*)::int from public.onboarding_cohorts_public v where to_jsonb(v)::text ilike '%Alice Kim%'),
  0, 'split: private display_name never appears in the public aggregate' );

reset role;
select * from finish();
rollback;
