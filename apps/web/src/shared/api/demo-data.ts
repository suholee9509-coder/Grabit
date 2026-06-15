import { parseYoutubeUrl } from '@/shared/lib';
import type { FolderRow, TagRow, VideoMetaDto } from './types';

/**
 * 데모(오프라인) 데이터 — Supabase 미구성 시 결정론적 폴백.
 * 프레임 1:1 시연·테스트용(프레임의 "창업가 정신" 폴더·"업무생산성/창업/마인드셋" 등 태그).
 * 실 백엔드 구성 시 shared/api 쿼리가 우선(이 모듈은 폴백 경로).
 */

/** 프레임 폴더("창업가 정신" 현재값 + 라이브러리 폴더). */
export const DEMO_FOLDERS: FolderRow[] = [
  { id: 'f-startup', name: '창업가 정신' },
  { id: 'f-product', name: '프로덕트' },
  { id: 'f-growth', name: '그로스' },
  { id: 'f-dev', name: '개발' },
];

/** 프레임 자동완성 추천 풀(본인 태그). "개발" 입력 시 "개발자/클라우드 개발/백엔드 개발" 매칭. */
export const DEMO_TAGS: TagRow[] = [
  { id: 't1', name: '업무생산성' },
  { id: 't2', name: '창업' },
  { id: 't3', name: '마인드셋' },
  { id: 't4', name: '개발자' },
  { id: 't5', name: '클라우드 개발' },
  { id: 't6', name: '백엔드 개발' },
  { id: 't7', name: '프론트엔드 개발' },
  { id: 't8', name: '디자인' },
];

/** 데모 태그 prefix 매칭(searchTags 거울 — 결정론적). */
export function demoSearchTags(prefix: string): TagRow[] {
  const q = prefix.trim().toLowerCase();
  if (q === '') return [];
  return DEMO_TAGS.filter((t) => t.name.toLowerCase().includes(q)).slice(0, 8);
}

/**
 * 데모 영상 메타 — 실 메타 fetch는 서버/엣지 함수 소관(브라우저측 외부 API 키 호출 금지).
 * URL이 유효하면 결정론적 폴백 메타 반환. (프레임 헤더 영상 제목 시연.)
 */
export function demoVideoMeta(url: string): VideoMetaDto {
  const ref = parseYoutubeUrl(url);
  return {
    title: '최선을 다했지만 결과가 좋지 않았다면 | 스탠포드 돌돌콩',
    channel: '스탠포드 돌돌콩',
    durationSec: 92,
    thumbnailUrl: ref
      ? `https://i.ytimg.com/vi/${ref.providerContentId}/hqdefault.jpg`
      : null,
  };
}
