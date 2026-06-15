// Build the SHARED ingest payload (web == extension) from the clip-modal draft.
// Guarantees the [start, end) integer contract before it leaves the client (mirrors the SQL CHECK +
// Edge Function parseIngestBody), and normalizes optionals to null so the shape is byte-stable.
// memo is NULLABLE (런북 §6 u6: 구간만 저장 허용) — empty/whitespace memo → null, NOT a blank string.
// url is sent AS-IS (server get_or_create_content canonicalizes — client invents no content).

import type { IngestPayload } from './contract';

export interface ClipDraft {
  url: string;
  startSec: number;
  endSec: number;
  memo: string;
  isPublic: boolean;
  folderId: string | null;
  tags: string[];
  // video metadata captured from the host page (advisory — server keeps existing good metadata).
  title: string | null;
  channel: string | null;
  durationSec: number | null;
  thumbnailUrl: string | null;
}

function nullIfBlank(s: string | null): string | null {
  if (s === null) return null;
  const t = s.trim();
  return t === '' ? null : s;
}

export function buildIngestPayload(draft: ClipDraft): IngestPayload {
  const start = Math.max(0, Math.round(draft.startSec));
  // end EXCLUSIVE, 0-length forbidden — enforce end > start (UI also blocks this).
  const end = Math.max(start + 1, Math.round(draft.endSec));
  const tags = draft.tags.map((t) => t.trim()).filter((t) => t !== '');
  return {
    url: draft.url,
    start_sec: start,
    end_sec: end,
    memo: nullIfBlank(draft.memo),
    is_public: draft.isPublic === true,
    folder_id: nullIfBlank(draft.folderId),
    tags: tags.length > 0 ? tags : null,
    title: nullIfBlank(draft.title),
    channel: nullIfBlank(draft.channel),
    duration_sec:
      draft.durationSec != null && Number.isFinite(draft.durationSec)
        ? Math.round(draft.durationSec)
        : null,
    thumbnail_url: nullIfBlank(draft.thumbnailUrl),
  };
}
