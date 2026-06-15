export type { IngestPayload } from './contract';
export { buildIngestPayload, type ClipDraft } from './build-payload';
export { postClip, type IngestResult, type ClipRow } from './client';
export { ingestWithAuth, type IngestFlowDeps } from './ingest-flow';
