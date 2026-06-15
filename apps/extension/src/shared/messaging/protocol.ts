// Typed messaging protocol — content script ↔ background SW ↔ popup.
// The background SW owns the session + network (it attaches the bearer and handles 401), so the
// content script never touches tokens. All cross-context calls go through chrome.runtime.sendMessage
// with these discriminated shapes; responses are awaited via the Promise form of sendMessage.

import type { IngestPayload } from '@/shared/ingest/contract';
import type { IngestResult } from '@/shared/ingest/client';
import type { AuthState } from '@/shared/auth/session-manager';
import type { FolderOption } from '@/shared/folders/client';

export type ExtMessage =
  | { type: 'GET_AUTH_STATE' }
  | { type: 'SIGN_IN' }
  | { type: 'SIGN_OUT' }
  | { type: 'GET_FOLDERS' }
  | { type: 'INGEST_CLIP'; payload: IngestPayload }
  // web login handoff: the web app (externally_connectable) posts tokens back after OAuth.
  | { type: 'AUTH_HANDOFF'; accessToken: string; refreshToken: string };

export type ExtResponse =
  | { type: 'AUTH_STATE'; state: AuthState }
  | { type: 'SIGN_IN_STARTED'; ok: boolean }
  | { type: 'SIGN_OUT_DONE' }
  | { type: 'FOLDERS'; folders: FolderOption[] }
  | { type: 'INGEST_RESULT'; result: IngestResult }
  | { type: 'AUTH_HANDOFF_DONE'; state: AuthState };

/** Send a typed message to the background SW and await its typed response. */
export async function sendToBackground<R extends ExtResponse = ExtResponse>(
  message: ExtMessage,
): Promise<R> {
  return (await chrome.runtime.sendMessage(message)) as R;
}
