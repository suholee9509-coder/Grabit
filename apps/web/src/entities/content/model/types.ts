/**
 * Content 엔티티 — 정준 영상(영상 1편 = 1 content, ADR-0002 #1).
 * u0b `contents` 테이블(0006 get_or_create_content) 소비 타입. 변경 ❌(읽기/표현만).
 *
 * 메타(title/channel/duration/thumbnail)는 메타 fetch 실패 시 null 허용 — dedup은 url 기준.
 */
export interface ContentMeta {
  /** 영상 제목(없으면 null — 헤더 표시 폴백). */
  title: string | null;
  /** 채널명(없으면 null). */
  channel: string | null;
  /** 영상 총 길이(초, 없으면 null — 타임라인 스케일 폴백). */
  durationSec: number | null;
  /** 썸네일/아바타 URL(없으면 null). */
  thumbnailUrl: string | null;
}

import type { YoutubeRef } from '@/shared/lib';

/** YouTube provider 영상 참조 (extract_video_ref 결과 형태, 클라 1차 파싱용). */
export type VideoRef = YoutubeRef;

/**
 * 콘텐츠 상세 표현 합성 타입(meta + 식별/원본/표시 필드). u0b `contents`(0002) select 소비.
 * ★ 읽기/표현만 — 계약 변경 ❌. user_id 등 소유자 키 부재(contents는 소유자 없는 공유 정체성).
 */
export interface ContentDetail {
  /** contents.id(정준 콘텐츠 id). */
  id: string;
  /** provider('youtube'). */
  provider: string;
  /** 정준 영상 id(11자 YT id) — iframe 임베드/seek에 사용. */
  providerContentId: string;
  /** 정준 URL(원본 링크 새 탭). */
  canonicalUrl: string;
  /** 제목(없으면 null). */
  title: string | null;
  /** 채널명(없으면 null). */
  channel: string | null;
  /** 영상 총 길이(초, 없으면 null — 히트맵 타임라인 스케일). */
  durationSec: number | null;
  /** 썸네일 URL(없으면 null). */
  thumbnailUrl: string | null;
  /** 삭제/비공개 영상 플래그 — true면 에러 표면 + 원본 링크 폴백. */
  isUnavailable: boolean;
  /** 업로드/게시일 라벨(표시용 "2025.03.17", 없으면 null). */
  uploadedAt: string | null;
  /** 그랩(공개 클립) 수 — 표시용 합성. */
  grabCount: number;
  /** 태그 라벨(표시용 — 마인드셋/IT/창업). */
  tags: string[];
  /** 작성자(코호트) 직군 라벨(예: "프로덕트 디자이너 5년차") — 식별자 아님. */
  cohortLabel: string | null;
}
