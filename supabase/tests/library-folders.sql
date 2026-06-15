-- tests/library-folders.sql
-- u7-library BE contract (spec §Validation library-folders.contract). ADDITIVE — does NOT
-- restate u0b's rls-isolation / derived-api-no-leak; asserts u7's NEW behavior on top of the
-- FROZEN u0b schema (folders, clips.folder_id, contents.provider):
--   * folder create / rename / soft-delete (clips preserved, folder_id NULL-released)
--   * max-20 ACTIVE folders enforced (21st blocked); soft-delete frees a slot
--   * blank folder name rejected
--   * multiselect bulk move (move_clips_to_folder) self-only + transactional
--   * move into / soft-delete of another user's folder rejected (RLS / 23503)
--   * unauthenticated writes blocked (28000)
--   * per-folder distinct-content counts + provider counts (own rows)
--   * cross-user folders/clips read = 0 rows (no leak), via the u7 read RPCs
--
-- Pattern (same as rls-isolation.sql): seed as superuser (owner bypasses RLS), then
-- `set local role authenticated` + request.jwt.claims sub → RLS enforced as that user.
-- Setup statements use do$$/perform so only pgTAP functions emit TAP lines.

begin;
select plan(20);

-- ── seed two users (profiles auto-created by on_auth_user_created) + one shared content ──
insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-1111-1111-111111111111', 'alice@test.dev', '{"full_name":"Alice Kim"}'::jsonb),
  ('22222222-2222-2222-2222-222222222222', 'bob@test.dev',   '{"full_name":"Bob Lee"}'::jsonb);

update public.profiles set job = '개발자',   years = '1-3년' where id = '11111111-1111-1111-1111-111111111111';
update public.profiles set job = '디자이너', years = '4-6년' where id = '22222222-2222-2222-2222-222222222222';

-- two distinct contents (different providers' provider_content_id) for source-count coverage
do $$ begin
  perform public.get_or_create_content('https://youtu.be/dQw4w9WgXcQ', 'Vid A');
  perform public.get_or_create_content('https://www.youtube.com/watch?v=abcdefghijk', 'Vid B');
end $$;

-- ════════════════════════════════════════════════════════════════════════════════════════════
-- ALICE
-- ════════════════════════════════════════════════════════════════════════════════════════════
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

-- (1) create a folder via RPC → owned by alice
do $$ begin perform public.create_folder('창업가 정신'); end $$;
select is( (select count(*)::int from public.folders where deleted_at is null), 1,
  'create: alice has 1 active folder after create_folder' );
select is( (select user_id from public.folders limit 1), '11111111-1111-1111-1111-111111111111'::uuid,
  'create: folder owned by alice (invoker → RLS-owned)' );

-- (2) blank / whitespace-only name rejected (folders_name_not_blank, 23514)
select throws_ok( $$ select public.create_folder('   ') $$, '23514', null,
  'create: blank/whitespace folder name rejected' );

-- (3) rename via RPC (UPDATE) — name changes, still own
do $$ begin perform public.rename_folder(
  (select id from public.folders where deleted_at is null limit 1), '피그마 실습 강의'); end $$;
select is( (select name from public.folders where deleted_at is null limit 1), '피그마 실습 강의',
  'rename: rename_folder updates the name' );

-- (4) attach clips: 2 clips on Vid A + 1 clip on Vid B, all into the folder
do $$
declare fid uuid := (select id from public.folders where deleted_at is null limit 1);
        a uuid := (select id from public.contents where provider_content_id = 'dQw4w9WgXcQ');
        b uuid := (select id from public.contents where provider_content_id = 'abcdefghijk');
begin
  insert into public.clips (user_id, content_id, start_sec, end_sec, folder_id) values
    ('11111111-1111-1111-1111-111111111111', a, 10, 30, fid),
    ('11111111-1111-1111-1111-111111111111', a, 40, 60, fid),
    ('11111111-1111-1111-1111-111111111111', b,  0, 15, fid);
end $$;

-- (5) per-folder distinct-content count = 2 (Vid A counted once despite 2 clips) — DM2-A
select is( (select content_count from public.library_folder_counts() limit 1), 2::bigint,
  'folder count: distinct content = 2 (2 clips on A counted once + B)' );

-- (6) provider counts: youtube = 2 distinct contents in this library
select is( (select content_count from public.library_source_counts() where provider = 'youtube'), 2::bigint,
  'source count: youtube provider has 2 distinct contents' );

-- (7) card surface: 2 cards; the A card has grab_count 2
select is( (select count(*)::int from public.library_cards()), 2,
  'cards: 2 distinct-content cards surfaced' );
select is(
  (select grab_count from public.library_cards()
     where content_id = (select id from public.contents where provider_content_id = 'dQw4w9WgXcQ')),
  2::bigint, 'cards: Vid A grab_count = 2 (two live clips)' );

-- (8) soft-delete the folder → folder inactive AND attached clips' folder_id NULL-released
--     (DM-folder-delete: clips PRESERVED)
do $$ begin perform public.soft_delete_folder(
  (select id from public.folders where deleted_at is null limit 1)); end $$;
select is( (select count(*)::int from public.folders where deleted_at is null), 0,
  'soft-delete: 0 active folders after soft_delete_folder' );
select is( (select count(*)::int from public.clips), 3,
  'soft-delete: all 3 clips PRESERVED (not deleted)' );
select is( (select count(*)::int from public.clips where folder_id is not null), 0,
  'soft-delete: attached clips folder_id NULL-released (returned to 전체 폴더)' );

-- (9) max-20 ACTIVE limit: the soft-deleted folder freed a slot → 20 fresh creates OK, 21st blocked
do $$ begin for i in 1..20 loop perform public.create_folder('f'||i); end loop; end $$;
select is( (select count(*)::int from public.folders where deleted_at is null), 20,
  'limit: exactly 20 active folders created (soft-deleted one freed a slot)' );
select throws_ok( $$ select public.create_folder('overflow') $$, '23514', null,
  'limit: 21st active folder rejected (max 20)' );

-- (10) multiselect bulk move: re-attach alice's clips of both contents to a target folder
do $$
declare tgt uuid := (select id from public.folders where deleted_at is null order by created_at limit 1);
        a uuid := (select id from public.contents where provider_content_id = 'dQw4w9WgXcQ');
        b uuid := (select id from public.contents where provider_content_id = 'abcdefghijk');
        n int;
begin
  n := public.move_clips_to_folder(array[a, b], tgt);
  perform set_config('test.moved', n::text, true);
end $$;
select is( current_setting('test.moved')::int, 3,
  'move: bulk move re-attached all 3 of alice''s clips' );
select is( (select count(distinct folder_id)::int from public.clips where folder_id is not null), 1,
  'move: all moved clips now point at the single target folder' );

-- (11) move to a NONEXISTENT / not-owned folder rejected (23503)
select throws_ok(
  $$ select public.move_clips_to_folder(
       array[(select id from public.contents where provider_content_id = 'dQw4w9WgXcQ')],
       '99999999-9999-9999-9999-999999999999') $$,
  '23503', null, 'move: target folder that does not exist is rejected' );

-- ════════════════════════════════════════════════════════════════════════════════════════════
-- BOB — cross-user isolation (no leak; cannot touch alice's folders/clips)
-- ════════════════════════════════════════════════════════════════════════════════════════════
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';

-- (12) bob sees 0 of alice's folders and 0 cards (RLS read-own → no leak)
select is( (select count(*)::int from public.library_folder_counts()), 0,
  'no-leak: bob sees 0 folders (alice''s 20 folders invisible)' );
select is( (select count(*)::int from public.library_cards()), 0,
  'no-leak: bob sees 0 library cards (alice''s clips invisible)' );

-- (13) bob soft-deleting alice's folder is a no-op (RLS update-own → 0 rows → null; folder stays active)
do $$ begin perform public.soft_delete_folder(
  (select id from public.folders where user_id = '11111111-1111-1111-1111-111111111111'
     and deleted_at is null order by created_at limit 1)); end $$;
reset role;
select is(
  (select count(*)::int from public.folders
     where user_id = '11111111-1111-1111-1111-111111111111' and deleted_at is null), 20,
  'no-leak: bob''s soft-delete of alice''s folder is a no-op (her 20 folders intact)' );

-- (14) UNAUTHENTICATED (no jwt sub → auth.uid() null) write blocked at the RPC guard (28000)
set local role authenticated;
set local "request.jwt.claims" = '';   -- clear sub → auth.uid() returns null
select throws_ok( $$ select public.create_folder('hax') $$, '28000', null,
  'auth: unauthenticated create_folder blocked at guard (28000)' );
reset role;

select * from finish();
rollback;
