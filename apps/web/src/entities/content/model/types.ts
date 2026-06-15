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
