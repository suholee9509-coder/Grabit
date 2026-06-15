/**
 * shared/api 배럴 — Supabase 클라이언트 + u0b RPC 래퍼(호출만) + 읽기 쿼리 + 에러 매핑.
 * 상위 레이어는 '@/shared/api'에서 임포트(개별 경로 ❌).
 */
export {
  supabase,
  isSupabaseReady,
  getSupabaseClient,
  isSupabaseConfigured,
  type SupabaseClient,
} from './supabase';
export { ingestClip } from './ingest-clip';
export { fetchFolders } from './folders';
export { searchTags } from './tags';
export {
  getContentSocialClips,
  getContentHeatmap,
  getContentMeta,
} from './content-read';
export { mapIngestError, type MappedError, type IngestErrorKind } from './errors';
export type {
  IngestClipParams,
  ClipRow,
  FolderRow,
  TagRow,
  VideoMetaDto,
  PublicClipDto,
  HeatmapBucketDto,
  ContentMetaDto,
  SimilarContentDto,
} from './types';
export {
  DEMO_FOLDERS,
  DEMO_TAGS,
  demoSearchTags,
  demoVideoMeta,
  demoContentMeta,
  demoContentSocialClips,
  demoContentHeatmap,
  demoSimilarContent,
} from './demo-data';
