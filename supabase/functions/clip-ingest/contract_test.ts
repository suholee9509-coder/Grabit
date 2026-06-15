// deno test — clip-ingest contract (runs WITHOUT a running stack).
// Proves the shared web/extension contract: auth required, interval rules identical to the
// SQL guard, optional-field normalization, and stable RPC arg mapping.
//   run: deno test supabase/functions/

import { assertEquals } from "jsr:@std/assert@1";
import {
  parseAuth,
  parseIngestBody,
  toRpcArgs,
} from "../_shared/ingest-contract.ts";

const VALID = {
  url: "https://youtu.be/dQw4w9WgXcQ",
  start_sec: 10,
  end_sec: 30,
  memo: "note",
  is_public: true,
  tags: ["커리어", "창업"],
};

Deno.test("auth: missing/blank/non-bearer → 401", () => {
  assertEquals(parseAuth(null).ok, false);
  assertEquals(parseAuth("").ok, false);
  assertEquals(parseAuth("Bearer ").ok, false);
  assertEquals(parseAuth("Basic xyz").ok, false);
  const ok = parseAuth("Bearer abc.def.ghi");
  assertEquals(ok.ok, true);
  if (ok.ok) assertEquals(ok.token, "abc.def.ghi");
});

Deno.test("body: valid payload parses and normalizes", () => {
  const r = parseIngestBody(VALID);
  assertEquals(r.ok, true);
  if (r.ok) {
    assertEquals(r.value.url, VALID.url);
    assertEquals(r.value.start_sec, 10);
    assertEquals(r.value.end_sec, 30);
    assertEquals(r.value.is_public, true);
    assertEquals(r.value.tags, ["커리어", "창업"]);
    // unset optionals normalize to null (stable shape, web == extension)
    assertEquals(r.value.folder_id, null);
    assertEquals(r.value.channel, null);
    assertEquals(r.value.duration_sec, null);
  }
});

Deno.test("body: missing/blank url → 400 invalid_url", () => {
  assertEquals(parseIngestBody({ ...VALID, url: undefined }).ok, false);
  const r = parseIngestBody({ ...VALID, url: "   " });
  assertEquals(r.ok, false);
  if (!r.ok) assertEquals(r.error, "invalid_url");
});

Deno.test("body: non-integer interval → 400", () => {
  assertEquals(parseIngestBody({ ...VALID, start_sec: 1.5 }).ok, false);
  assertEquals(parseIngestBody({ ...VALID, end_sec: "30" }).ok, false);
});

Deno.test("body: end<=start and negative start → 400 (end exclusive, 0-length forbidden)", () => {
  assertEquals(parseIngestBody({ ...VALID, start_sec: 30, end_sec: 30 }).ok, false); // 0-length
  assertEquals(parseIngestBody({ ...VALID, start_sec: 30, end_sec: 20 }).ok, false); // inverted
  assertEquals(parseIngestBody({ ...VALID, start_sec: -1, end_sec: 5 }).ok, false); // negative
});

Deno.test("body: non-string tags → 400 invalid_tags", () => {
  const r = parseIngestBody({ ...VALID, tags: [1, 2] });
  assertEquals(r.ok, false);
  if (!r.ok) assertEquals(r.error, "invalid_tags");
});

Deno.test("rpc args: stable mapping to ingest_clip params", () => {
  const r = parseIngestBody(VALID);
  if (!r.ok) throw new Error("expected ok");
  const args = toRpcArgs(r.value);
  assertEquals(args.p_url, VALID.url);
  assertEquals(args.p_start_sec, 10);
  assertEquals(args.p_end_sec, 30);
  assertEquals(args.p_is_public, true);
  assertEquals(args.p_tags, ["커리어", "창업"]);
  assertEquals(args.p_folder_id, null);
});
