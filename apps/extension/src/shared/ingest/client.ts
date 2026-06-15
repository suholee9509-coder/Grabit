// clip-ingest client — POSTs the SHARED payload (web == extension) to the u0b clip-ingest Edge
// Function with a Bearer Supabase JWT, then interprets the response. The Edge Function + ingest_clip
// RPC are FROZEN (consume only): the client builds the exact IngestPayload, never invents a content
// row (server get_or_create_content canonicalizes any YouTube URL form → one content), and reads the
// returned clip row to decide between "saved" and "이미 클립한 구간"(메모만 추가).
//
// Dedup signal (no separate status code — server returns the clip either way): a re-clip of the same
// (user, content, interval) merges the memo onto the EXISTING live row, so updated_at > created_at.
// A brand-new clip has updated_at == created_at. This is the only client-side interpretation; the
// server is the judge of identity (ADR-0002 dedup), the client only reads its row.

import { ingestEndpoint } from '@/shared/config/env';
import { env } from '@/shared/config/env';
import type { IngestPayload } from './contract';

/** The clip row shape returned by ingest_clip() — only the fields the client interprets. */
export interface ClipRow {
  id: string;
  start_sec: number;
  end_sec: number;
  memo: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export type IngestResult =
  | { kind: 'saved'; clip: ClipRow } // new clip created
  | { kind: 'duplicate'; clip: ClipRow } // existing interval — memo merged
  | { kind: 'unauthenticated' } // 401 — drop session + re-login (draft preserved by caller)
  | { kind: 'invalid'; error: string } // 400 — bad interval/url/tags (should not happen with UI guards)
  | { kind: 'network-error'; message: string } // fetch failed — toast + retry, draft preserved
  | { kind: 'unconfigured' }; // Supabase env missing — auth/ingest not wired

/** A re-clip merged the memo onto an existing row iff updated_at strictly after created_at. */
function isDuplicate(clip: ClipRow): boolean {
  const created = Date.parse(clip.created_at);
  const updated = Date.parse(clip.updated_at);
  // Guard NaN (malformed timestamps) → treat as new (saved) rather than misreport duplicate.
  if (Number.isNaN(created) || Number.isNaN(updated)) return false;
  return updated > created;
}

/**
 * POST one clip. `bearer` is resolved by the background session manager (currentBearer). The endpoint
 * also needs the Supabase anon key as apikey (gateway requirement) — public, RLS-protected.
 */
export async function postClip(
  payload: IngestPayload,
  bearer: string | null,
): Promise<IngestResult> {
  const endpoint = ingestEndpoint();
  if (!endpoint) return { kind: 'unconfigured' };
  if (!bearer) return { kind: 'unauthenticated' };

  let res: Response;
  try {
    res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bearer}`,
        apikey: env.supabaseAnonKey,
      },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    return {
      kind: 'network-error',
      message: e instanceof Error ? e.message : 'network request failed',
    };
  }

  if (res.status === 401) return { kind: 'unauthenticated' };

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    if (!res.ok) return { kind: 'network-error', message: `HTTP ${res.status}` };
    return { kind: 'network-error', message: 'invalid server response' };
  }

  if (!res.ok) {
    const error =
      typeof body === 'object' && body !== null && 'error' in body
        ? String((body as { error: unknown }).error)
        : `HTTP ${res.status}`;
    if (res.status === 400) return { kind: 'invalid', error };
    return { kind: 'network-error', message: error };
  }

  const clip = (body as { clip?: ClipRow }).clip;
  if (!clip || typeof clip.id !== 'string') {
    return { kind: 'network-error', message: 'malformed ingest response' };
  }
  return isDuplicate(clip)
    ? { kind: 'duplicate', clip }
    : { kind: 'saved', clip };
}
