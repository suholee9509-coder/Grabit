// ingest-contract.ts
// THE shared web+extension ingest contract (L1-c). The web app calls the `ingest_clip`
// RPC directly with this exact payload shape; the chrome extension POSTs the same shape to
// the clip-ingest Edge Function, which validates it here and forwards to the same RPC.
// Validation lives in one pure module so "웹/확장 동일 payload" is guaranteed by construction
// and unit-testable without a running stack (contract_test.ts).

export interface IngestPayload {
  url: string;
  start_sec: number;
  end_sec: number;
  memo: string | null;
  is_public: boolean;
  folder_id: string | null;
  tags: string[] | null;
  title: string | null;
  channel: string | null;
  duration_sec: number | null;
  thumbnail_url: string | null;
}

export type ParseBodyResult =
  | { ok: true; value: IngestPayload }
  | { ok: false; status: 400; error: string };

export type ParseAuthResult =
  | { ok: true; token: string }
  | { ok: false; status: 401; error: string };

/** Bearer JWT required (extension + web both send the Supabase session token). */
export function parseAuth(authHeader: string | null): ParseAuthResult {
  const prefix = "Bearer ";
  if (!authHeader || !authHeader.startsWith(prefix)) {
    return { ok: false, status: 401, error: "unauthenticated" };
  }
  const token = authHeader.slice(prefix.length).trim();
  if (token === "") return { ok: false, status: 401, error: "unauthenticated" };
  return { ok: true, token };
}

function asOptString(v: unknown): string | null {
  return typeof v === "string" && v.trim() !== "" ? v : null;
}

/** Validate the request body against the shared contract. Mirrors ingest_clip() SQL rules. */
export function parseIngestBody(body: unknown): ParseBodyResult {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { ok: false, status: 400, error: "invalid_payload" };
  }
  const b = body as Record<string, unknown>;

  if (typeof b.url !== "string" || b.url.trim() === "") {
    return { ok: false, status: 400, error: "invalid_url" };
  }
  if (!Number.isInteger(b.start_sec) || !Number.isInteger(b.end_sec)) {
    return { ok: false, status: 400, error: "invalid_interval" };
  }
  const start = b.start_sec as number;
  const end = b.end_sec as number;
  if (start < 0 || end <= start) {
    // end EXCLUSIVE, 0-length forbidden — identical to the SQL CHECK + ingest_clip guard
    return { ok: false, status: 400, error: "invalid_interval" };
  }

  let tags: string[] | null = null;
  if (b.tags !== undefined && b.tags !== null) {
    if (!Array.isArray(b.tags) || b.tags.some((t) => typeof t !== "string")) {
      return { ok: false, status: 400, error: "invalid_tags" };
    }
    tags = b.tags as string[];
  }

  return {
    ok: true,
    value: {
      url: b.url,
      start_sec: start,
      end_sec: end,
      memo: asOptString(b.memo),
      is_public: b.is_public === true,
      folder_id: asOptString(b.folder_id),
      tags,
      title: asOptString(b.title),
      channel: asOptString(b.channel),
      duration_sec: Number.isInteger(b.duration_sec) ? (b.duration_sec as number) : null,
      thumbnail_url: asOptString(b.thumbnail_url),
    },
  };
}

/** Map the payload to ingest_clip() RPC args (single source of the RPC contract). */
export function toRpcArgs(p: IngestPayload) {
  return {
    p_url: p.url,
    p_start_sec: p.start_sec,
    p_end_sec: p.end_sec,
    p_memo: p.memo,
    p_is_public: p.is_public,
    p_folder_id: p.folder_id,
    p_tags: p.tags,
    p_title: p.title,
    p_channel: p.channel,
    p_duration_sec: p.duration_sec,
    p_thumbnail_url: p.thumbnail_url,
  };
}
