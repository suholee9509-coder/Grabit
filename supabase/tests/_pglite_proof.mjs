// _pglite_proof.mjs — Docker-free execution proof of the u0b-data-core data model + RLS.
//
// Uses pglite (real Postgres compiled to WASM): RLS, definer views, SECURITY DEFINER and
// SECURITY INVOKER all behave identically to Supabase Postgres. This is NOT a replacement for
// the canonical pgTAP suite (the *.sql files in this dir, run via `supabase test db`) or the
// deno contract test — it is a fast, dependency-light *execution* proof that the migrations
// apply and the RLS / sanitized-read / dedup / interval / heatmap / threshold logic is correct.
// The migrations, policies, views and functions exercised here are byte-identical to Supabase.
//
//   prereq: pnpm add -D @electric-sql/pglite
//   run:    node supabase/tests/_pglite_proof.mjs   (exit 0 = all pass)
//
// `supabase test db` globs *.sql, so this .mjs is ignored by the pgTAP runner.

import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";

const migDir = fileURLToPath(new URL("../migrations", import.meta.url));

const db = new PGlite();
const q = (sql, params) => db.query(sql, params);
const exec = (sql) => db.exec(sql);
await q("select 1");

let pass = 0, fail = 0;
const out = [];
const check = (name, cond, detail = "") => {
  if (cond) { pass++; out.push(`  ok   ${name}`); }
  else { fail++; out.push(`  FAIL ${name}${detail ? "  — " + detail : ""}`); }
};
async function expectErr(name, sql, re) {
  try { await q(sql); check(name, false, "expected error, got success"); }
  catch (e) { check(name, re.test(e.message), `got: ${e.message}`); }
}
const one = async (sql, params) => (await q(sql, params)).rows[0];

const A = "11111111-1111-1111-1111-111111111111";
const B = "22222222-2222-2222-2222-222222222222";
const asUser = (sub) =>
  exec(`set local role authenticated; set local "request.jwt.claims" = '{"sub":"${sub}","role":"authenticated"}';`);

// ── minimal Supabase shim (gotrue auth.users + auth.uid() + roles) ──
await exec(`
create role anon nologin noinherit;
create role authenticated nologin noinherit;
create role service_role nologin noinherit bypassrls;
grant usage on schema public to anon, authenticated, service_role;
create schema if not exists auth;
create table auth.users (
  id uuid primary key default gen_random_uuid(),
  email text,
  raw_user_meta_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create or replace function auth.uid() returns uuid language sql stable as $func$
  select coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$func$;
grant usage on schema auth to anon, authenticated, service_role;
grant execute on function auth.uid() to anon, authenticated, service_role;
`);

// ── migrations 0001-0009 ──
const files = readdirSync(migDir).filter((f) => f.endsWith(".sql")).sort();
for (const f of files) {
  try { await exec(readFileSync(migDir + "/" + f, "utf8")); }
  catch (e) { console.error(`MIGRATION FAILED at ${f}:\n  ${e.message}`); process.exit(3); }
}
check(`migrations: all ${files.length} apply cleanly`, true);

async function seedTwo() {
  await exec(`
insert into auth.users (id, email, raw_user_meta_data) values
 ('${A}','a@t.dev','{"full_name":"Alice Kim"}'),
 ('${B}','b@t.dev','{"full_name":"Bob Lee"}');
update public.profiles set job='개발자', years='1-3년' where id='${A}';
update public.profiles set job='디자이너', years='4-6년' where id='${B}';`);
  await q(`select public.get_or_create_content('https://youtu.be/dQw4w9WgXcQ')`);
  return (await one(`select id from public.contents where provider_content_id='dQw4w9WgXcQ'`)).id;
}

// ═══ 1. RLS isolation ═══
await exec("begin");
{
  const cid = await seedTwo();
  await q(
    `insert into public.clips (user_id,content_id,start_sec,end_sec,memo,is_public) values
     ('${A}',$1,10,30,'alice public',true),('${A}',$1,40,60,'alice private',false),('${B}',$1,15,35,'bob public',true)`, [cid]);
  check("rls seed: 3 clips (owner bypass)", (await one(`select count(*)::int n from public.clips`)).n === 3);
  await asUser(B);
  check("rls: bob sees only own (1)", (await one(`select count(*)::int n from public.clips`)).n === 1);
  check("rls: bob sees 0 of alice clips", (await one(`select count(*)::int n from public.clips where user_id='${A}'`)).n === 0);
  check("rls: bob sees 0 alice profile (deanon guard)", (await one(`select count(*)::int n from public.profiles where id='${A}'`)).n === 0);
  await exec("savepoint sp");
  await expectErr("rls: bob cannot insert as alice",
    `insert into public.clips(user_id,content_id,start_sec,end_sec,is_public) values('${A}','${cid}',1,2,true)`, /row-level security/i);
  await exec("rollback to savepoint sp");
}
await exec("rollback");

// ═══ 2. derived-api-no-leak ═══
await exec("begin");
{
  const cid = await seedTwo();
  await q(
    `insert into public.clips (user_id,content_id,start_sec,end_sec,memo,is_public) values
     ('${A}',$1,10,30,'great point on funding',true),('${A}',$1,40,60,'PRIVATE my own note',false)`, [cid]);
  check("no-leak: view has no user_id/display_name/email column",
    (await one(`select count(*)::int n from information_schema.columns where table_schema='public' and table_name='content_clips_public' and column_name in ('user_id','display_name','email')`)).n === 0);
  await asUser(B);
  check("no-leak: bob sees alice PUBLIC clip via sanitized view (1)",
    (await one(`select count(*)::int n from public.content_clips_public where content_id='${cid}'`)).n === 1);
  check("no-leak: private clip not exposed",
    (await one(`select count(*)::int n from public.content_clips_public where memo like '%PRIVATE%'`)).n === 0);
  check("no-leak: real name never in any row value",
    (await one(`select count(*)::int n from public.content_clips_public v where to_jsonb(v)::text ilike '%Alice Kim%'`)).n === 0);
  check("no-leak: base clips still RLS-isolated", (await one(`select count(*)::int n from public.clips where user_id='${A}'`)).n === 0);
  check("no-leak: cohort not directly readable cross-user", (await one(`select count(*)::int n from public.profiles where id='${A}'`)).n === 0);
  check("no-leak: sub-threshold cohort label hidden (job null)",
    (await one(`select cohort_job from public.content_clips_public where content_id='${cid}' limit 1`)).cohort_job === null);
}
await exec("rollback");

// ═══ 3. content-dedup ═══
await exec("begin");
{
  await exec(`do $$ begin
    perform public.get_or_create_content('https://www.youtube.com/watch?v=dQw4w9WgXcQ','Rick','RickCh',213,'http://thumb');
    perform public.get_or_create_content('https://youtu.be/dQw4w9WgXcQ');
    perform public.get_or_create_content('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s');
    perform public.get_or_create_content('https://m.youtube.com/watch?v=dQw4w9WgXcQ');
    perform public.get_or_create_content('https://www.youtube.com/shorts/dQw4w9WgXcQ');
    perform public.get_or_create_content('https://www.youtube.com/embed/dQw4w9WgXcQ?start=10');
    perform public.get_or_create_content('https://music.youtube.com/watch?v=dQw4w9WgXcQ&list=PLabc123');
    perform public.get_or_create_content('https://www.youtube.com/live/dQw4w9WgXcQ');
  end $$;`);
  check("dedup: 8 URL forms → 1 content", (await one(`select count(*)::int n from public.contents where provider_content_id='dQw4w9WgXcQ'`)).n === 1);
  check("dedup: canonical_url normalized", (await one(`select canonical_url u from public.contents where provider_content_id='dQw4w9WgXcQ'`)).u === "https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  check("dedup: title preserved across null-meta re-ingest", (await one(`select title t from public.contents where provider_content_id='dQw4w9WgXcQ'`)).t === "Rick");
  check("dedup: duration preserved", (await one(`select duration_sec d from public.contents where provider_content_id='dQw4w9WgXcQ'`)).d === 213);
  await q(`select public.get_or_create_content('https://youtu.be/abcdefghijk')`);
  check("dedup: distinct video id → new content", (await one(`select count(*)::int n from public.contents`)).n === 2);
  await exec("savepoint sp");
  await expectErr("dedup: invalid URL raises", `select public.get_or_create_content('https://example.com/not-a-video')`, /invalid|unsupported/i);
  await exec("rollback to savepoint sp");
}
await exec("rollback");

// ═══ 4. clip-interval ═══
await exec("begin");
{
  await q(`insert into auth.users (id,email) values ('${A}','u@t.dev')`);
  await q(`select public.get_or_create_content('https://youtu.be/dQw4w9WgXcQ')`);
  await asUser(A);
  await q(`select public.ingest_clip('https://youtu.be/dQw4w9WgXcQ',10,30,'first note',true)`);
  check("interval: valid clip inserted", (await one(`select count(*)::int n from public.clips`)).n === 1);
  await q(`select public.ingest_clip('https://youtu.be/dQw4w9WgXcQ',10,30,'second note',true)`);
  check("interval: re-clip same interval → no dup row", (await one(`select count(*)::int n from public.clips`)).n === 1);
  const m = (await one(`select memo from public.clips`)).memo;
  check("interval: re-clip merged both memos", /first note/.test(m) && /second note/.test(m), `memo=${JSON.stringify(m)}`);
  await q(`select public.ingest_clip('https://youtu.be/dQw4w9WgXcQ',20,40,'overlap',true)`);
  check("interval: overlapping different interval allowed (2)", (await one(`select count(*)::int n from public.clips`)).n === 2);
  for (const [s, e, label] of [[50, 50, "0-length"], [50, 40, "end<start"], [-1, 5, "negative start"]]) {
    await exec("savepoint sp");
    await expectErr(`interval: ${label} rejected`, `select public.ingest_clip('https://youtu.be/dQw4w9WgXcQ',${s},${e})`, /invalid interval/i);
    await exec("rollback to savepoint sp");
  }
  await exec("reset role");
  await exec("savepoint sp");
  await expectErr("interval: table CHECK rejects 0-length direct insert",
    `insert into public.clips(user_id,content_id,start_sec,end_sec) values('${A}',(select id from public.contents where provider_content_id='dQw4w9WgXcQ'),10,10)`, /clips_end_after_start|check/i);
  await exec("rollback to savepoint sp");
}
await exec("rollback");

// ═══ 5. heatmap ═══
await exec("begin");
{
  const cid = await seedTwo();
  await q(`insert into public.clips (user_id,content_id,start_sec,end_sec,is_public) values
     ('${A}',$1,0,20,true),('${B}',$1,10,30,true),('${A}',$1,10,15,true),('${B}',$1,5,8,false)`, [cid]);
  const d = async (bs) => (await one(`select density from public.content_heatmap($1,10) where bucket_start=$2`, [cid, bs])).density;
  check("heatmap: [0,10) density=1 (private excluded)", (await d(0)) === 1);
  check("heatmap: [10,20) density=3", (await d(10)) === 3);
  check("heatmap: [20,30) density=1 (end-exclusive)", (await d(20)) === 1);
  check("heatmap: 3 buckets over max_end=30", (await one(`select count(*)::int n from public.content_heatmap($1,10)`, [cid])).n === 3);
  await asUser(B);
  check("heatmap: cross-user aggregate readable via definer view", (await d(10)) === 3);
}
await exec("rollback");

// ═══ 6. anonymize-threshold ═══
await exec("begin");
{
  await q(`select public.get_or_create_content('https://youtu.be/dQw4w9WgXcQ')`);
  const cid = (await one(`select id from public.contents where provider_content_id='dQw4w9WgXcQ'`)).id;
  for (let i = 1; i <= 5; i++) {
    const u = `00000000-0000-0000-0000-00000000000${i}`;
    await q(`insert into auth.users(id,email) values($1,$2)`, [u, `dev${i}@t.dev`]);
    await q(`update public.profiles set job='개발자', years='1-3년' where id=$1`, [u]);
    await q(`insert into public.clips(user_id,content_id,start_sec,end_sec,is_public) values($1,$2,$3,$4,true)`, [u, cid, i * 10, i * 10 + 5]);
  }
  const u9 = "00000000-0000-0000-0000-000000000009";
  await q(`insert into auth.users(id,email) values($1,$2)`, [u9, "dsn@t.dev"]);
  await q(`update public.profiles set job='디자이너', years='1-3년' where id=$1`, [u9]);
  await q(`insert into public.clips(user_id,content_id,start_sec,end_sec,is_public) values($1,$2,999,1000,true)`, [u9, cid]);
  const rev = await one(`select cohort_job, cohort_revealed from public.content_clips_public where start_sec=10`);
  check("threshold: >=5 users reveals job label", rev.cohort_job === "개발자" && rev.cohort_revealed === true, JSON.stringify(rev));
  const hid = await one(`select cohort_job, cohort_years, cohort_revealed from public.content_clips_public where start_sec=999`);
  check("threshold: <5 users hides job+years label", hid.cohort_job === null && hid.cohort_years === null && hid.cohort_revealed === false, JSON.stringify(hid));
}
await exec("rollback");

console.log(out.join("\n"));
console.log(`\n  ${pass} passed, ${fail} failed`);
await db.close();
process.exit(fail ? 1 : 0);
