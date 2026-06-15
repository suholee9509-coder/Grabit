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
