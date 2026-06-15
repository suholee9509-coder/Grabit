// clip-ingest Edge Function (L1-c)
// Chrome extension POSTs the shared ingest payload here with a Bearer Supabase JWT; we
// validate against the shared contract and forward to the SAME ingest_clip RPC the web app
// calls (with the user's JWT so RLS + auth.uid() apply). Web and extension thus ingest
// identically. Postgres is the single source of truth — this function is a thin gateway.

import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { parseAuth, parseIngestBody, toRpcArgs } from "../_shared/ingest-contract.ts";

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const auth = parseAuth(req.headers.get("Authorization"));
  if (!auth.ok) return json({ error: auth.error }, auth.status);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const parsed = parseIngestBody(body);
  if (!parsed.ok) return json({ error: parsed.error }, parsed.status);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: `Bearer ${auth.token}` } } },
  );

  const { data, error } = await supabase.rpc("ingest_clip", toRpcArgs(parsed.value));

  if (error) {
    // Map SQL errors to HTTP: 28000 unauthenticated → 401; 22023 bad interval/url → 400.
    const status = error.code === "28000" ? 401 : 400;
    return json({ error: error.message, code: error.code }, status);
  }

  return json({ clip: data }, 200);
});
