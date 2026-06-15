-- tests/anonymize-threshold.sql
-- Proves ADR-0002 #4: a (job,years) cohort with >= anonymization_threshold() (5) distinct
-- users reveals its label; a cohort below threshold has its label hidden (job/years nulled)
-- while the anonymous interval still shows.

begin;
select plan(5);

do $$
declare
  i   integer;
  uid uuid;
begin
  perform public.get_or_create_content('https://youtu.be/dQw4w9WgXcQ');

  -- 5 distinct users in cohort (개발자, 1-3년) → at threshold → revealed
  for i in 1..5 loop
    uid := ('00000000-0000-0000-0000-00000000000' || i)::uuid;
    insert into auth.users (id, email) values (uid, 'dev' || i || '@test.dev');
    update public.profiles set job = '개발자', years = '1-3년' where id = uid;
    insert into public.clips (user_id, content_id, start_sec, end_sec, is_public)
      values (uid, (select id from public.contents where provider_content_id = 'dQw4w9WgXcQ'), i * 10, i * 10 + 5, true);
  end loop;

  -- 1 user in cohort (디자이너, 1-3년) → below threshold → hidden. Distinctive interval 999.
  insert into auth.users (id, email) values ('00000000-0000-0000-0000-000000000009', 'dsn@test.dev');
  update public.profiles set job = '디자이너', years = '1-3년' where id = '00000000-0000-0000-0000-000000000009';
  insert into public.clips (user_id, content_id, start_sec, end_sec, is_public)
    values ('00000000-0000-0000-0000-000000000009', (select id from public.contents where provider_content_id = 'dQw4w9WgXcQ'), 999, 1000, true);
end $$;

-- revealed cohort (5 users): user1's clip (start_sec=10) carries the job/years label
select is( (select cohort_job from public.content_clips_public where start_sec = 10), '개발자',
  'threshold: cohort with >=5 users reveals job label' );
select is( (select cohort_revealed from public.content_clips_public where start_sec = 10), true,
  'threshold: cohort_revealed=true at/above threshold' );

-- hidden cohort (1 user): label nulled, but the row (anonymous interval) still present
select is( (select cohort_job   from public.content_clips_public where start_sec = 999), null::text,
  'threshold: sub-threshold cohort hides job label' );
select is( (select cohort_years from public.content_clips_public where start_sec = 999), null::text,
  'threshold: sub-threshold cohort hides years label' );
select is( (select cohort_revealed from public.content_clips_public where start_sec = 999), false,
  'threshold: cohort_revealed=false below threshold (interval still anonymous-visible)' );

select * from finish();
rollback;
