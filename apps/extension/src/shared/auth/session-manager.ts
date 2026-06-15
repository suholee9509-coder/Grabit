// Session manager (ADR-0001 auth) — the single owner of the Supabase web session inside the
// extension. Lives in the background SW (and is read by the popup). Responsibilities:
//   - currentBearer(): the access_token to attach to clip-ingest, refreshing if supabase-js says so.
//   - signInViaWeb(): open the web login window; the web app, after OAuth, hands tokens back to the
//     extension which imports them via supabase.auth.setSession → persisted in chrome.storage.
//   - importSession(): apply tokens received from the web login handoff.
//   - dropSession(): wipe the session on 401 (token expired / revoked) so the user re-logs in.
// MV3 SW sleep: the session is re-hydrated from chrome.storage on each wake (supabase-js storage).

import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase-client';
import { env } from '@/shared/config/env';

export type AuthState =
  | { status: 'unconfigured' } // Supabase 미배선 (env 없음) — 결정론적 폴백
  | { status: 'signed-out' }
  | { status: 'signed-in'; email: string | null; userId: string };

/** Map a supabase Session (or null) to the popup/UI auth state. */
function toState(session: Session | null): AuthState {
  if (!supabase) return { status: 'unconfigured' };
  if (!session) return { status: 'signed-out' };
  return {
    status: 'signed-in',
    email: session.user.email ?? null,
    userId: session.user.id,
  };
}

/** Current auth state for the popup / content UI. */
export async function getAuthState(): Promise<AuthState> {
  if (!supabase) return { status: 'unconfigured' };
  const { data } = await supabase.auth.getSession();
  return toState(data.session ?? null);
}

/**
 * Current bearer access token, or null if signed-out/unconfigured. supabase-js auto-refreshes a
 * stale token here (getSession returns a fresh one), so the value attached to ingest is valid.
 */
export async function currentBearer(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

/**
 * Import tokens handed back from the web login window (the web app posts {access_token,
 * refresh_token} to the extension after OAuth). Persists the session via chrome.storage.
 */
export async function importSession(
  accessToken: string,
  refreshToken: string,
): Promise<AuthState> {
  if (!supabase) return { status: 'unconfigured' };
  const { data, error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  if (error) return { status: 'signed-out' };
  return toState(data.session ?? null);
}

/**
 * Wipe the session (401 = expired/revoked, or explicit sign-out). After this the next ingest
 * attempt routes through the re-login path; the clip draft is preserved by the caller.
 */
export async function dropSession(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}

/**
 * Open the web app login. The web origin must be configured (env.webAppUrl); the page completes
 * OAuth and hands the session back via the messaging bridge (handoff). Returns the opened tab id.
 * If the web origin is unconfigured we cannot drive login — the caller surfaces an error.
 */
export async function signInViaWeb(): Promise<{ ok: boolean; tabId?: number }> {
  if (!supabase || !env.webAppUrl) return { ok: false };
  // The web login page reads ?ext_login=<extensionId> and, on success, posts tokens back to the
  // extension (chrome.runtime.sendMessage to the externally_connectable extension id).
  const loginUrl = `${env.webAppUrl.replace(/\/$/, '')}/auth/login?ext_login=${encodeURIComponent(
    chrome.runtime.id,
  )}`;
  const tab = await chrome.tabs.create({ url: loginUrl, active: true });
  return { ok: true, tabId: tab.id };
}
