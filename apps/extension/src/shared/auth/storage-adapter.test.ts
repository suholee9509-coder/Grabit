// chrome.storage session-persistence test (spec Validation: 세션 저장/만료 — chrome.storage 목킹).
// Proves the supabase-js SupportedStorage adapter round-trips through chrome.storage.local, which is
// what lets the session survive MV3 service-worker sleep (ADR-0001 auth threat model).

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { chromeStorageAdapter } from './storage-adapter';

function installChromeStorageMock() {
  const store = new Map<string, string>();
  const local = {
    get: vi.fn(async (key: string) => {
      const v = store.get(key);
      return v === undefined ? {} : { [key]: v };
    }),
    set: vi.fn(async (items: Record<string, string>) => {
      for (const [k, v] of Object.entries(items)) store.set(k, v);
    }),
    remove: vi.fn(async (key: string) => {
      store.delete(key);
    }),
  };
  // @ts-expect-error — minimal chrome mock for the adapter under test.
  globalThis.chrome = { storage: { local } };
  return { store, local };
}

describe('chromeStorageAdapter (MV3 session persistence)', () => {
  beforeEach(() => {
    installChromeStorageMock();
  });

  it('setItem then getItem round-trips the persisted session', async () => {
    await chromeStorageAdapter.setItem('grabit.auth.session', '{"access_token":"jwt"}');
    expect(await chromeStorageAdapter.getItem('grabit.auth.session')).toBe('{"access_token":"jwt"}');
  });

  it('getItem returns null for an absent key (signed-out / SW first wake)', async () => {
    expect(await chromeStorageAdapter.getItem('missing')).toBeNull();
  });

  it('removeItem wipes the session (401 drop / sign-out)', async () => {
    await chromeStorageAdapter.setItem('grabit.auth.session', 'x');
    await chromeStorageAdapter.removeItem('grabit.auth.session');
    expect(await chromeStorageAdapter.getItem('grabit.auth.session')).toBeNull();
  });
});
