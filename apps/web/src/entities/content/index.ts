/** content 엔티티 배럴 — 정준 영상 메타·URL 파싱 + 검색 카드 모델/표현(u8). */
export type { ContentMeta, VideoRef } from './model/types';
export { parseYoutubeUrl, isSupportedVideoUrl } from './lib/parse-youtube-url';

/** u8 검색 카드 모델 + 표현(additive). */
export type { SearchContentItem, SourceCount, SearchSort } from './model/search';
export { ContentCard, type ContentCardProps } from './ui/content-card';
export { SourceLogo, type SourceLogoProps } from './ui/source-logo';
export { providerLabel, PROVIDER_LABELS } from './lib/provider-labels';
