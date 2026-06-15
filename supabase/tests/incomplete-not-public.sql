-- tests/incomplete-not-public.sql
-- Proves: an INCOMPLETE profile contributes 0 to the public cohort aggregate. This is why the
-- gate is the onboarded_at FLAG, not "cohort NOT NULL": a profile with job+years set but
-- onboarded_at still NULL (partial / abandoned) must NOT inflate or reveal a cohort.
-- Sub-threshold completed cohorts are also dropped (#4). (ADR-0002 #6 · #4)

begin;
select plan(5);

-- 5 COMPLETED users in cohort (개발자, 2-3년차) → at threshold → exposed, count 5
do $$
declare i int; uid uuid;
begin
  for i in 1..5 loop
    uid := ('00000000-0000-0000-0000-00000000000' || i)::uuid;
    insert into auth.users (id, email) values (uid, 'done'||i||'@test.dev');
    update public.profiles
       set job='개발자', years='2-3년차', goal='취업·이직',
           interests=array['커리어'], onboarded_at=now()
     where id = uid;
  end loop;
end $$;

-- 2 PARTIAL users in the SAME cohort dims but onboarded_at STILL NULL → must be excluded
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-000000000006', 'partial1@test.dev'),
  ('00000000-0000-0000-0000-000000000007', 'partial2@test.dev');
update public.profiles set job='개발자', years='2-3년차'
 where id in ('00000000-0000-0000-0000-000000000006','00000000-0000-0000-0000-000000000007');

-- 1 COMPLETED user in a lone cohort (디자이너, 7~9년차) → below threshold → dropped
insert into auth.users (id, email) values ('00000000-0000-0000-0000-000000000008','lone@test.dev');
update public.profiles set job='디자이너', years='7~9년차', goal='승진·직급 상승',
       interests=array['리더십'], onboarded_at=now()
 where id='00000000-0000-0000-0000-000000000008';

-- (1) THE flag guarantee: count = 5 (completed only), NOT 7 → 2 partial profiles contribute 0
select is( (select users from public.onboarding_cohorts_public
              where cohort_job='개발자' and cohort_years='2-3년차'),
  5, 'incomplete: partial profiles (onboarded_at null) excluded — count is 5 not 7' );

-- (2) total exposed users = 5 (incomplete contribute 0; sub-threshold cohort dropped)
select is( (select coalesce(sum(users),0)::int from public.onboarding_cohorts_public),
  5, 'incomplete: total exposed users = 5' );

-- (3) lone completed cohort (1 user < threshold 5) hidden
select is( (select count(*)::int from public.onboarding_cohorts_public where cohort_job='디자이너'),
  0, 'incomplete: sub-threshold completed cohort (1<5) hidden (re-identification guard)' );

-- (4) exactly one cohort exposed
select is( (select count(*)::int from public.onboarding_cohorts_public),
  1, 'incomplete: exactly one cohort exposed (only >=threshold completed)' );

-- (5) a partial-profile user reading cross-user sees only the 5 completed (no incomplete leak)
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-000000000006","role":"authenticated"}';
select is( (select users from public.onboarding_cohorts_public where cohort_job='개발자'),
  5, 'incomplete: a partial-profile user still sees only the 5 completed in the aggregate' );

reset role;
select * from finish();
rollback;
