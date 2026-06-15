// chrome.storage.local adapter for supabase-js auth persistence (ADR-0001).
// MV3 service workers sleep → the session MUST survive in chrome.storage (not in-memory / not
// localStorage, which a SW has no access to). supabase-js persists the session through this
// SupportedStorage shape so token auto-refresh resumes after the SW wakes.

import type { SupportedStorage } from '@supabase/supabase-js';

export const chromeStorageAdapter: SupportedStorage = {
  async getItem(key: string): Promise<string | null> {
    const result = await chrome.storage.local.get(key);
    const value = result[key];
    return typeof value === 'string' ? value : null;
  },
  async setItem(key: string, value: string): Promise<void> {
    await chrome.storage.local.set({ [key]: value });
  },
  async removeItem(key: string): Promise<void> {
    await chrome.storage.local.remove(key);
  },
};
