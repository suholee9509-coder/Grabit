/**
 * content 엔티티의 URL 파싱 — 순수 유틸은 shared/lib에 위치(FSD: shared가 최하위).
 * 엔티티 레이어는 도메인 진입점으로 재노출(상위는 @/entities/content 또는 @/shared/lib 사용).
 */
export { parseYoutubeUrl, isSupportedVideoUrl } from '@/shared/lib';
