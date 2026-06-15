// Supabase client for the extension (ADR-0001). Anon key only (RLS-protected public key); session
// persists in chrome.storage so it survives MV3 SW sleep, and auto-refresh keeps the bearer valid.
// detectSessionInUrl=false: the extension never receives the OAuth redirect URL directly — it
// imports the session from the web login window (see session-manager.ts). No external API/LLM keys.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env, hasSupabaseConfig } from '@/shared/config/env';
import { chromeStorageAdapter } from './storage-adapter';

// Single namespaced storage key so the session is easy to wipe on 401 (session-manager.dropSession).
export const AUTH_STORAGE_KEY = 'grabit.auth.session';

export const supabase: SupabaseClient | null = hasSupabaseConfig()
  ? createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        storage: chromeStorageAdapter,
        storageKey: AUTH_STORAGE_KEY,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  : null;

export const isAuthReady = supabase != null;
