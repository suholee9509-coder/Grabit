/** content 엔티티 배럴 — 정준 영상 메타·상세·라이브러리/검색 카드 모델·URL 파싱·포맷터(u4·u7·u8). */
export type {
  ContentMeta,
  ContentDetail,
  VideoRef,
  LibraryCard,
  InsightCard,
} from './model/types';
export { parseYoutubeUrl, isSupportedVideoUrl } from './lib/parse-youtube-url';
export { SourceIcon } from './ui/source-icon';
export {
  formatUploadDate,
  formatGrabCount,
  formatCount,
  formatContentCount,
  formatProviderLabel,
  formatRelativeTime,
} from './lib/format-meta';

/** u8 검색 카드 모델 + 표현(additive). */
export type { SearchContentItem, SourceCount, SearchSort } from './model/search';
export { ContentCard, type ContentCardProps } from './ui/content-card';
export { SourceLogo, type SourceLogoProps } from './ui/source-logo';
export { providerLabel, PROVIDER_LABELS } from './lib/provider-labels';
