// Ingest-with-auth orchestration (ADR-0001 — 401→재로그인). The single place that ties the session
// bearer to a clip POST and reacts to expiry: attach the current bearer → POST → on 401 wipe the
// session so the NEXT attempt routes through re-login (the content UI surfaces the prompt; the clip
// draft is preserved by the caller for re-submit). Extracted so the background SW and the auth
// validation test exercise the EXACT same flow (no running stack — deps injected/mocked).

import type { IngestPayload } from './contract';
import type { IngestResult } from './client';

export interface IngestFlowDeps {
  /** Resolve the current session access token (auto-refreshed), or null when signed-out/expired. */
  currentBearer: () => Promise<string | null>;
  /** POST the clip with the bearer and interpret the response. */
  postClip: (payload: IngestPayload, bearer: string | null) => Promise<IngestResult>;
  /** Wipe the persisted session on 401 (expired/revoked) → forces re-login next time. */
  dropSession: () => Promise<void>;
}

/**
 * Run one authenticated ingest. On 401 (unauthenticated) the session is dropped so the user must
 * re-login before retrying; the result is returned unchanged for the UI to surface the re-login path.
 */
export async function ingestWithAuth(
  payload: IngestPayload,
  deps: IngestFlowDeps,
): Promise<IngestResult> {
  const bearer = await deps.currentBearer();
  const result = await deps.postClip(payload, bearer);
  if (result.kind === 'unauthenticated') {
    // expired/revoked → wipe so the next attempt re-logs in (draft kept by the content script).
    await deps.dropSession();
  }
  return result;
}
