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
export {
  createFolder,
  renameFolder,
  softDeleteFolder,
  moveClipsToFolder,
  getFolderCounts,
  getSourceCounts,
  getLibraryCards,
} from './library';
export {
  mapIngestError,
  mapLibraryError,
  type MappedError,
  type IngestErrorKind,
  type MappedLibraryError,
  type LibraryErrorKind,
} from './errors';
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
  LibraryCardDto,
  LibrarySort,
  FolderCountDto,
  SourceCountDto,
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
  DEMO_LIBRARY_FOLDERS,
  DEMO_FOLDER_COUNTS,
  DEMO_SOURCE_COUNTS,
  DEMO_LIBRARY_CARDS,
  DEMO_INSIGHTS,
  demoLibraryCards,
  demoFolderCounts,
  demoSourceCounts,
  demoInsights,
  type DemoInsightCard,
} from './demo-data';
