// Auth flow test (spec Validation: 인증 플로우 — 세션 만료/401 → 재로그인). Proves the EXACT
// background INGEST_CLIP orchestration: a valid bearer ingests; a 401 (expired/revoked token) wipes
// the session so the next attempt routes through re-login; a signed-out bearer never hits the network.
// Deps are injected (chrome.storage / supabase mocked away) → deterministic, no running stack.

import { describe, it, expect, vi } from 'vitest';
import { ingestWithAuth } from './ingest-flow';
import type { IngestPayload } from './contract';
import type { IngestResult } from './client';

const payload: IngestPayload = {
  url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  start_sec: 32,
  end_sec: 61,
  memo: 'note',
  is_public: true,
  folder_id: null,
  tags: null,
  title: null,
  channel: null,
  duration_sec: null,
  thumbnail_url: null,
};

describe('ingestWithAuth — session/expiry/401 → re-login (background INGEST_CLIP flow)', () => {
  it('valid session: attaches the current bearer and ingests without dropping the session', async () => {
    const dropSession = vi.fn(async () => {});
    const postClip = vi.fn(async (_p: IngestPayload, bearer: string | null): Promise<IngestResult> => {
      expect(bearer).toBe('valid-jwt'); // bearer attached
      return { kind: 'saved', clip: { id: 'c1' } as never };
    });
    const r = await ingestWithAuth(payload, {
      currentBearer: async () => 'valid-jwt',
      postClip,
      dropSession,
    });
    expect(r.kind).toBe('saved');
    expect(dropSession).not.toHaveBeenCalled();
  });

  it('expired/revoked token → server 401 → session WIPED so the next attempt re-logs in', async () => {
    const dropSession = vi.fn(async () => {});
    const r = await ingestWithAuth(payload, {
      currentBearer: async () => 'expired-jwt',
      postClip: async () => ({ kind: 'unauthenticated' }),
      dropSession,
    });
    expect(r.kind).toBe('unauthenticated'); // UI prompts re-login, draft preserved
    expect(dropSession).toHaveBeenCalledTimes(1); // session dropped → forces re-login
  });

  it('signed-out (no bearer) → unauthenticated without dropping again (idempotent)', async () => {
    const dropSession = vi.fn(async () => {});
    const r = await ingestWithAuth(payload, {
      currentBearer: async () => null, // signed out / SW first wake with no session
      postClip: async (_p, bearer) =>
        bearer === null ? { kind: 'unauthenticated' } : { kind: 'saved', clip: { id: 'x' } as never },
      dropSession,
    });
    expect(r.kind).toBe('unauthenticated');
    // still wipes (harmless) to keep the state consistent — the key invariant is "must re-login".
    expect(dropSession).toHaveBeenCalledTimes(1);
  });

  it('network error does NOT wipe the session (transient — retry keeps the bearer)', async () => {
    const dropSession = vi.fn(async () => {});
    const r = await ingestWithAuth(payload, {
      currentBearer: async () => 'valid-jwt',
      postClip: async () => ({ kind: 'network-error', message: 'offline' }),
      dropSession,
    });
    expect(r.kind).toBe('network-error');
    expect(dropSession).not.toHaveBeenCalled(); // session preserved for retry
  });
});
