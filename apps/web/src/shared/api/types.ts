/**
 * shared/api DTO 타입 — u0b RPC/테이블 계약의 전송 형태(snake 매핑은 각 래퍼 내부).
 * ⚠ FSD: shared는 entities를 의존할 수 없음 → API 경계 타입은 여기(shared) 정의.
 *   도메인 엔티티(entities/*)는 이 DTO를 소비/매핑(하향 임포트 entities→shared 허용).
 */

/** ingest_clip 입력(0009 시그니처, camel — 래퍼가 p_* snake로 매핑). */
export interface IngestClipParams {
  url: string;
  startSec: number;
  endSec: number;
  memo: string | null;
  isPublic: boolean;
  folderId: string | null;
  tags: string[];
  title: string | null;
  channel: string | null;
  durationSec: number | null;
  thumbnailUrl: string | null;
}

/** clips 1행(0004) — ingest_clip 반환(camel). */
export interface ClipRow {
  id: string;
  contentId: string;
  startSec: number;
  endSec: number;
  memo: string | null;
  isPublic: boolean;
  folderId: string | null;
}

/** folders 1행(0003). */
export interface FolderRow {
  id: string;
  name: string;
}

/** tags 1행(0003). */
export interface TagRow {
  id: string;
  name: string;
}

/** 영상 메타(서버/엣지 fetch 결과 — 없으면 null 허용). */
export interface VideoMetaDto {
  title: string | null;
  channel: string | null;
  durationSec: number | null;
  thumbnailUrl: string | null;
}

/**
 * search_my_content 1행(0012) — camel 매핑(래퍼 내부에서 snake→camel).
 * RPC가 SECURITY INVOKER + user_id pin → 본인 행만(user_id/실명 필드 부재 = no-leak).
 * entities/content가 이 DTO를 SearchContentItem으로 소비/매핑(하향 임포트 entities→shared).
 */
export interface SearchRow {
  id: string;
  title: string;
  provider: string;
  clipCount: number;
  tags: string[];
  lastClippedAt: string | null;
  thumbnailUrl?: string | null;
}

/** search_my_content_sources 1행(0012) — provider별 카운트(출처 필터 배지). */
export interface SourceCountRow {
  provider: string;
  count: number;
}
