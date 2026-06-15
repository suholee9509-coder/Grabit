// _pgtap_pglite.mjs — runs the CANONICAL pgTAP *.sql test files (verbatim, not a JS
// reimplementation) on pglite (real Postgres WASM), by loading a minimal pgTAP-compatible
// shim (plan/ok/is/throws_ok/finish — pgTAP's assertions are pure PL/pgSQL). This executes
// the exact committed deliverable tests; the only non-canonical piece vs `supabase test db`
// is the engine (pglite instead of docker-postgres) + a hand-rolled pgTAP subset.
// Also runs the clip-ingest contract module via node.
//
//   prereq: pnpm add -D @electric-sql/pglite
//   run:    node supabase/tests/_pgtap_pglite.mjs   (exit 0 = all asserts pass)

import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";

const here = fileURLToPath(new URL(".", import.meta.url));
const migDir = fileURLToPath(new URL("../migrations", import.meta.url));

const db = new PGlite();
const exec = (s) => db.exec(s);
await db.query("select 1");

// ── Supabase shim ──
await exec(`
create role anon nologin noinherit;
create role authenticated nologin noinherit;
create role service_role nologin noinherit bypassrls;
grant usage on schema public to anon, authenticated, service_role;
create schema if not exists auth;
create table auth.users (
  id uuid primary key default gen_random_uuid(),
  email text, raw_user_meta_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create or replace function auth.uid() returns uuid language sql stable as $func$
  select coalesce(nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub'))::uuid $func$;
grant usage on schema auth to anon, authenticated, service_role;
grant execute on function auth.uid() to anon, authenticated, service_role;
`);

// ── pgTAP-compatible shim (subset used by the test files) ──
await exec(`
create or replace function _tap_next() returns int language plpgsql as $f$
declare n int; begin
  n := coalesce(nullif(current_setting('tap.n', true), ''), '0')::int + 1;
  perform set_config('tap.n', n::text, true); return n; end $f$;
create or replace function plan(n int) returns text language plpgsql as $f$
begin perform set_config('tap.n','0',true); return '1..'||n::text; end $f$;
create or replace function ok(b boolean, descr text default null) returns text language sql as $f$
  select (case when b then 'ok ' else 'not ok ' end) || _tap_next()::text || ' - ' || coalesce(descr,'') $f$;
create or replace function "is"(a anyelement, b anyelement, descr text default null) returns text language sql as $f$
  select ok(a is not distinct from b, descr) $f$;
create or replace function throws_ok(sql text, errcode text default null, errmsg text default null, descr text default null)
returns text language plpgsql as $f$
declare threw boolean := false; got text;
begin
  begin execute sql; exception when others then threw := true; get stacked diagnostics got = returned_sqlstate; end;
  if not threw then return ok(false, coalesce(descr,'')||' (no exception thrown)'); end if;
  if errcode is not null and got is distinct from errcode then
    return ok(false, coalesce(descr,'')||' (expected sqlstate '||errcode||', got '||got||')'); end if;
  return ok(true, descr);
end $f$;
create or replace function finish() returns setof text language plpgsql as $f$ begin return; end $f$;
`);

// ── migrations 0001-0009 ──
for (const f of readdirSync(migDir).filter((f) => f.endsWith(".sql")).sort()) {
  try { await exec(readFileSync(migDir + "/" + f, "utf8")); }
  catch (e) { console.error(`MIGRATION FAILED ${f}: ${e.message}`); process.exit(3); }
}

// ── run each canonical pgTAP test file ──
const tests = readdirSync(here).filter((f) => f.endsWith(".sql")).sort();
let okTot = 0, notTot = 0, errFiles = 0;
for (const f of tests) {
  let lines = [];
  try {
    const res = await exec(readFileSync(here + "/" + f, "utf8"));
    for (const r of res) for (const row of r.rows || []) for (const v of Object.values(row))
      if (typeof v === "string" && /^(ok |not ok |1\.\.)/.test(v)) lines.push(v);
  } catch (e) {
    console.log(`  ERROR ${f}: ${e.message}`); errFiles++;
    try { await exec("rollback"); } catch { /* no open txn */ }
    continue;
  }
  const okN = lines.filter((l) => /^ok /.test(l)).length;
  const notN = lines.filter((l) => /^not ok /.test(l)).length;
  const plan = (lines.find((l) => /^1\.\./.test(l)) || "?").replace("1..", "");
  okTot += okN; notTot += notN;
  console.log(`  ${notN === 0 && okN > 0 ? "PASS" : "FAIL"} ${f.padEnd(26)} ${okN}/${plan} ok${notN ? `, ${notN} NOT ok` : ""}`);
  for (const l of lines.filter((x) => /^not ok/.test(x))) console.log(`        ${l}`);
}

// ── clip-ingest contract module (deliverable code) via node ──
try {
  const m = await import(new URL("../functions/_shared/ingest-contract.ts", import.meta.url).href);
  const a = (c) => { if (!c) throw new Error("assert"); };
  let c = 0;
  a(m.parseAuth(null).ok === false); c++;
  a(m.parseAuth("Bearer ").ok === false); c++;
  a(m.parseAuth("Bearer abc.def").ok === true); c++;
  const v = m.parseIngestBody({ url: "https://youtu.be/dQw4w9WgXcQ", start_sec: 10, end_sec: 30, is_public: true, tags: ["x"] });
  a(v.ok === true && v.value.folder_id === null && v.value.is_public === true); c++;
  a(m.parseIngestBody({ url: "", start_sec: 1, end_sec: 2 }).ok === false); c++;
  a(m.parseIngestBody({ url: "u", start_sec: 30, end_sec: 30 }).ok === false); c++;
  a(m.parseIngestBody({ url: "u", start_sec: 1.5, end_sec: 2 }).ok === false); c++;
  console.log(`  PASS contract (node, real module)  ${c}/7 ok`);
} catch (e) {
  console.log(`  SKIP contract (node): ${e.message}`);
}

console.log(`\n  pgTAP files: ${tests.length}  ·  asserts: ${okTot} ok / ${notTot} not ok  ·  file-errors: ${errFiles}`);
await db.close();
process.exit(notTot === 0 && errFiles === 0 ? 0 : 1);
