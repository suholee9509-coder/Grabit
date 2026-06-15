/**
 * Clip 엔티티 — 사용자 클립(영상 구간 + 메모 + 공개 + 폴더 + 태그).
 * u0b `clips`(0004) + `ingest_clip`(0009) 계약 소비. 변경 ❌(호출/표현만).
 */

/** 클립 구간 [start, end) — 끝 배타(ADR-0002 #2). start>=0, end>start (RPC가 최종 검증). */
export interface ClipInterval {
  /** 시작 초(정수, >=0). */
  startSec: number;
  /** 끝 초(정수, > startSec). 끝 배타. */
  endSec: number;
}

/** `ingest_clip` 단일 호출 입력(0009 시그니처 1:1 — snake는 래퍼에서 매핑). */
export interface IngestClipInput {
  /** Step1 URL 원문(RPC가 정준화). */
  url: string;
  startSec: number;
  endSec: number;
  /** 인사이트 메모(없으면 null). */
  memo: string | null;
  /** 공개 토글(is_public). */
  isPublic: boolean;
  /** 저장 폴더 id(미선택 null). */
  folderId: string | null;
  /** 태그 라벨 배열(RPC가 btrim·빈값 skip·per-user get-or-create). */
  tags: string[];
  /** 영상 메타(없으면 null 허용). */
  title: string | null;
  channel: string | null;
  durationSec: number | null;
  thumbnailUrl: string | null;
}

/** `clips` 1행(0004) — ingest_clip 반환. 표시/캐시용 최소 필드. */
export interface Clip {
  id: string;
  contentId: string;
  startSec: number;
  endSec: number;
  memo: string | null;
  isPublic: boolean;
  folderId: string | null;
}

/**
 * 공개 클립(=content_clips_public 1행, 0007) — sanitized cross-user read 표현 타입.
 * ★ ADR-0002 #3: user_id·display_name·email 키 **부재**(뷰가 SELECT 안 함) → 구조적으로 누출 불가.
 * 코호트(직군+연차)는 익명 임계(N=5) 미달 시 cohort_revealed=false → 라벨 숨김(클라는 이 플래그만 신뢰).
 */
export interface PublicClip {
  /** 정준 콘텐츠 id. */
  contentId: string;
  /** 클립 id(식별자 — 식별 불가, 단순 키). */
  clipId: string;
  /** 구간 시작 초. */
  startSec: number;
  /** 구간 끝 초(끝 배타). */
  endSec: number;
  /** 인사이트 메모(없으면 null). */
  memo: string | null;
  /** 코호트 직군(임계 미달 시 null). */
  cohortJob: string | null;
  /** 코호트 연차(임계 미달 시 null). */
  cohortYears: number | null;
  /** 코호트 공개 여부(true일 때만 직군/연차 신뢰). */
  cohortRevealed: boolean;
  /** 생성 시각(ISO, "1시간 전" 폴백 표시용). */
  createdAt: string | null;
}
