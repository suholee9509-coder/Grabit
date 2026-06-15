// Background service worker (MV3) — the session + network owner (ADR-0001).
//  - holds/refreshes the Supabase web session (chrome.storage via supabase-js) and attaches the
//    bearer to every clip-ingest POST; on 401 it drops the session and reports unauthenticated so
//    the content UI prompts re-login (draft preserved by the content script).
//  - relays clip-ingest POSTs from the content script to the u0b clip-ingest Edge Function
//    (browser-side external API key / LLM calls forbidden — server ingest only, spec §Frozen).
//  - receives the web-login handoff (externally_connectable) and imports the session.

import {
  getAuthState,
  currentBearer,
  importSession,
  dropSession,
  signInViaWeb,
} from '@/shared/auth';
import { postClip, ingestWithAuth } from '@/shared/ingest';
import { listFolders } from '@/shared/folders/client';
import type { ExtMessage, ExtResponse } from '@/shared/messaging/protocol';

export default defineBackground(() => {
  async function handle(message: ExtMessage): Promise<ExtResponse> {
    switch (message.type) {
      case 'GET_AUTH_STATE':
        return { type: 'AUTH_STATE', state: await getAuthState() };

      case 'SIGN_IN': {
        const { ok } = await signInViaWeb();
        return { type: 'SIGN_IN_STARTED', ok };
      }

      case 'SIGN_OUT':
        await dropSession();
        return { type: 'SIGN_OUT_DONE' };

      case 'GET_FOLDERS':
        return { type: 'FOLDERS', folders: await listFolders() };

      case 'AUTH_HANDOFF': {
        const state = await importSession(message.accessToken, message.refreshToken);
        return { type: 'AUTH_HANDOFF_DONE', state };
      }

      case 'INGEST_CLIP': {
        // ingestWithAuth ties bearer → POST → 401 session-wipe in one tested flow (re-login next time).
        const result = await ingestWithAuth(message.payload, {
          currentBearer,
          postClip,
          dropSession,
        });
        return { type: 'INGEST_RESULT', result };
      }
    }
  }

  // Internal messages (content script + popup).
  chrome.runtime.onMessage.addListener((message: ExtMessage, _sender, sendResponse) => {
    handle(message).then(sendResponse);
    return true; // async response
  });

  // External messages — the web login page hands the session back after OAuth (AUTH_HANDOFF only).
  chrome.runtime.onMessageExternal?.addListener((message: ExtMessage, _sender, sendResponse) => {
    if (message?.type !== 'AUTH_HANDOFF') {
      sendResponse({ type: 'AUTH_HANDOFF_DONE', state: { status: 'signed-out' } });
      return false;
    }
    handle(message).then(sendResponse);
    return true;
  });
});
