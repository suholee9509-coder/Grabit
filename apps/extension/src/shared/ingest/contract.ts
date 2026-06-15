// Self-contained mirror of the u0b clip-ingest payload contract
// (supabase/functions/_shared/ingest-contract.ts — FROZEN, consume only).
// The extension POSTs THIS exact shape (web == extension) to the clip-ingest Edge Function with a
// Bearer Supabase JWT. Kept local to apps/extension to avoid touching apps/web during scaffold
// (shared extraction to packages/* is a later PM integration step — ADR-0001). Wiring + contract
// test (byte-equal to web fixture, 401, dedup response) land in the ingest sub-spec.
export interface IngestPayload {
  /** Original watch URL — sent as-is; server get_or_create_content canonicalizes (ADR-0002). */
  url: string;
  /** Inclusive start second (integer, >= 0). */
  start_sec: number;
  /** EXCLUSIVE end second (integer, > start_sec — 0-length forbidden). */
  end_sec: number;
  memo: string | null;
  is_public: boolean;
  folder_id: string | null;
  tags: string[] | null;
  title: string | null;
  channel: string | null;
  duration_sec: number | null;
  thumbnail_url: string | null;
}
