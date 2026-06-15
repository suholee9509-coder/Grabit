// clip-ingest contract test (spec Validation: 확장 payload가 u0b 계약과 동일 + 401 + 중복).
// The STRONGEST possible proof of "web == extension": we import the FROZEN server validator
// (supabase/functions/_shared/ingest-contract.ts — zero deps) and feed it the extension's built
// payload. It must parse to a byte-identical object. We also assert the dedup interpretation
// (updated_at > created_at → duplicate) and the 401/network handling, with fetch fully mocked
// (deterministic, no running stack).

import { describe, it, expect, vi, afterEach } from 'vitest';
import { buildIngestPayload, type ClipDraft } from './build-payload';
import { postClip, type ClipRow } from './client';
// FROZEN server contract — the single source of truth the extension must match (consume only).
import {
  parseIngestBody,
  toRpcArgs,
} from '../../../../../supabase/functions/_shared/ingest-contract';

const baseDraft: ClipDraft = {
  url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s',
  startSec: 32,
  endSec: 61,
  memo: '성공 사례보다 실패를 견디는 회복 탄력성',
  isPublic: true,
  folderId: '11111111-1111-1111-1111-111111111111',
  tags: ['업무생산성', '창업', '마인드셋'],
  title: '최선을 다했지만 실패한 당신에게',
  channel: '스탠포드 돌돌콩',
  durationSec: 720,
  thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
};

describe('extension payload == u0b clip-ingest contract', () => {
  it('built payload passes the FROZEN server validator and round-trips byte-equal', () => {
    const payload = buildIngestPayload(baseDraft);
    const parsed = parseIngestBody(payload);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      // The server normalizes to the SAME object the client sends — identical shape, no drift.
      expect(parsed.value).toEqual(payload);
    }
  });

  it('url is sent AS-IS (server canonicalizes — client invents no content)', () => {
    const payload = buildIngestPayload(baseDraft);
    expect(payload.url).toBe(baseDraft.url); // timestamp param preserved; server strips it
  });

  it('[start, end) integer contract: end exclusive, 0-length forbidden', () => {
    // a 0-length draft is bumped to a valid 1s window by the builder (UI also blocks this).
    const zero = buildIngestPayload({ ...baseDraft, startSec: 30, endSec: 30 });
    expect(zero.start_sec).toBe(30);
    expect(zero.end_sec).toBe(31);
    expect(parseIngestBody(zero).ok).toBe(true);
    // integers only
    const frac = buildIngestPayload({ ...baseDraft, startSec: 32.7, endSec: 61.2 });
    expect(Number.isInteger(frac.start_sec)).toBe(true);
    expect(Number.isInteger(frac.end_sec)).toBe(true);
  });

  it('memo nullable (구간만 저장 허용): blank memo → null, not ""', () => {
    expect(buildIngestPayload({ ...baseDraft, memo: '' }).memo).toBeNull();
    expect(buildIngestPayload({ ...baseDraft, memo: '   ' }).memo).toBeNull();
    const payload = buildIngestPayload({ ...baseDraft, memo: '' });
    expect(parseIngestBody(payload).ok).toBe(true);
  });

  it('empty tags/folder normalize to null (stable shape)', () => {
    const payload = buildIngestPayload({ ...baseDraft, tags: [], folderId: null });
    expect(payload.tags).toBeNull();
    expect(payload.folder_id).toBeNull();
  });

  it('toRpcArgs mapping is stable for the built payload (web == extension RPC)', () => {
    const payload = buildIngestPayload(baseDraft);
    const args = toRpcArgs(payload);
    expect(args.p_url).toBe(payload.url);
    expect(args.p_start_sec).toBe(payload.start_sec);
    expect(args.p_end_sec).toBe(payload.end_sec);
    expect(args.p_tags).toEqual(payload.tags);
  });
});

// ---- postClip response interpretation (fetch mocked) ----

function mockFetch(status: number, body: unknown): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify(body), { status })),
  );
}

const newClip: ClipRow = {
  id: 'c1',
  start_sec: 32,
  end_sec: 61,
  memo: 'note',
  is_public: true,
  created_at: '2026-06-16T00:00:00.000Z',
  updated_at: '2026-06-16T00:00:00.000Z', // == created_at → new
};

const mergedClip: ClipRow = {
  ...newClip,
  created_at: '2026-06-16T00:00:00.000Z',
  updated_at: '2026-06-16T00:05:00.000Z', // > created_at → duplicate (memo merged)
};

describe('postClip response interpretation', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('200 + updated_at == created_at → saved', async () => {
    mockFetch(200, { clip: newClip });
    const r = await postClip(buildIngestPayload(baseDraft), 'jwt');
    expect(r.kind).toBe('saved');
  });

  it('200 + updated_at > created_at → duplicate (이미 클립한 구간)', async () => {
    mockFetch(200, { clip: mergedClip });
    const r = await postClip(buildIngestPayload(baseDraft), 'jwt');
    expect(r.kind).toBe('duplicate');
  });

  it('401 → unauthenticated (재로그인 유도)', async () => {
    mockFetch(401, { error: 'unauthenticated' });
    const r = await postClip(buildIngestPayload(baseDraft), 'jwt');
    expect(r.kind).toBe('unauthenticated');
  });

  it('missing bearer → unauthenticated (no network call)', async () => {
    const r = await postClip(buildIngestPayload(baseDraft), null);
    expect(r.kind).toBe('unauthenticated');
  });

  it('400 → invalid (surfaces server error)', async () => {
    mockFetch(400, { error: 'invalid_interval' });
    const r = await postClip(buildIngestPayload(baseDraft), 'jwt');
    expect(r.kind).toBe('invalid');
    if (r.kind === 'invalid') expect(r.error).toBe('invalid_interval');
  });

  it('fetch throws → network-error (toast + retry, draft preserved)', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('offline'); }));
    const r = await postClip(buildIngestPayload(baseDraft), 'jwt');
    expect(r.kind).toBe('network-error');
  });
});
