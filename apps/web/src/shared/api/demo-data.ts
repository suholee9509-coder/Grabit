import { parseYoutubeUrl } from '@/shared/lib';
import type {
  ContentMetaDto,
  FolderRow,
  HeatmapBucketDto,
  PublicClipDto,
  SimilarContentDto,
  TagRow,
  VideoMetaDto,
} from './types';

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

/* ============================================================
 * u4 콘텐츠 상세 — 데모 시드(Supabase 미구성/실패 시 결정론 폴백).
 *   프레임(2087:12538) 카피 1:1. sanitized 셰이프(user_id/실명 부재).
 * ============================================================ */

/** 데모 정준 영상 id(프레임 영상 — REAL Money "한국의 젊은 창업가들…"). */
const DEMO_PROVIDER_CONTENT_ID = 'W3F8I0GNuFg';
const DEMO_DURATION_SEC = 1500; // 25:00 — 인기구간 10:11~12:42 등 마커 스케일

/** 데모 콘텐츠 메타(프레임 헤더 1:1). 어떤 id로 진입해도 동일 시드. */
export function demoContentMeta(contentId: string): ContentMetaDto {
  return {
    id: contentId,
    provider: 'youtube',
    providerContentId: DEMO_PROVIDER_CONTENT_ID,
    canonicalUrl: `https://www.youtube.com/watch?v=${DEMO_PROVIDER_CONTENT_ID}&t=140s`,
    title: '한국의 젊은 창업가들이 미국으로 가는 이유',
    channel: 'EO 채널',
    durationSec: DEMO_DURATION_SEC,
    thumbnailUrl: `https://i.ytimg.com/vi/${DEMO_PROVIDER_CONTENT_ID}/hqdefault.jpg`,
    isUnavailable: false,
  };
}

/**
 * 데모 공개 클립(인사이트) 시드 — content_clips_public 셰이프 1:1(user_id/실명 부재).
 * ★ cohortRevealed:false 행 1건 포함(임계 미달 코호트 숨김 검증).
 */
export function demoContentSocialClips(contentId: string): PublicClipDto[] {
  return [
    {
      contentId,
      clipId: 'dc-1',
      startSec: 611, // 10:11
      endSec: 762, // 12:42
      memo: '성공 사례보다 실패를 견디는 태도가 더 오래 남는다는 말이 인상 깊었어요.',
      cohortJob: '프로덕트 디자이너',
      cohortYears: 3,
      cohortRevealed: true,
      createdAt: '2026-06-16T09:00:00.000Z',
    },
    {
      contentId,
      clipId: 'dc-2',
      startSec: 504, // 08:24
      endSec: 591, // 09:51
      memo: '미국 진출 이유가 시장 크기가 아니라 거절에 익숙한 문화였다는 점이 새로웠어요.',
      cohortJob: '백엔드 개발자',
      cohortYears: 5,
      cohortRevealed: true,
      createdAt: '2026-06-16T08:00:00.000Z',
    },
    {
      contentId,
      clipId: 'dc-3',
      startSec: 842, // 14:02
      endSec: 930, // 15:30
      memo: '초기 팀 빌딩에서 가장 중요한 건 신뢰라는 부분.',
      cohortJob: 'IT 기획자',
      cohortYears: 4,
      cohortRevealed: true,
      createdAt: '2026-06-16T07:00:00.000Z',
    },
    {
      // ★임계 미달(N<5) — 뷰가 이미 null화. 코호트 라벨 숨김 검증용.
      contentId,
      clipId: 'dc-4',
      startSec: 1065, // 17:45
      endSec: 1150, // 19:10
      memo: '실패를 데이터로 쌓아두면 다음 의사결정이 빨라진다는 관점이 좋았습니다.',
      cohortJob: null,
      cohortYears: null,
      cohortRevealed: false,
      createdAt: '2026-06-16T06:00:00.000Z',
    },
  ];
}

/**
 * 데모 히트맵 — content_heatmap 셰이프(bucket 10초). 위 클립 시드의 밀도와 정합.
 * 인기 구간(10:11~12:42·08:24~09:51 등)에 density 피크.
 */
export function demoContentHeatmap(): HeatmapBucketDto[] {
  const buckets: HeatmapBucketDto[] = [];
  const step = 10;
  for (let start = 0; start < DEMO_DURATION_SEC; start += step) {
    const end = start + step;
    // 클립 구간 overlap 카운트(end-exclusive, 0008 거울).
    const intervals = [
      [611, 762],
      [504, 591],
      [842, 930],
      [1065, 1150],
      [611, 762], // 인기 구간 가중(7명 그랩 시연)
      [620, 700],
    ];
    let density = 0;
    for (const [s, e] of intervals) {
      if (start < e && end > s) density += 1;
    }
    buckets.push({ bucketStart: start, bucketEnd: end, density });
  }
  return buckets;
}

/** 비슷한 컨텐츠 콜드스타트 폴백 시드(전역 인기/시드 — 추천 알고리즘 없음). 클릭→다른 상세. */
export function demoSimilarContent(excludeId: string): SimilarContentDto[] {
  const seed: SimilarContentDto[] = [
    {
      id: 'sim-1',
      title: '실리콘밸리에서 살아남는 한국 스타트업의 조건',
      thumbnailUrl: 'https://i.ytimg.com/vi/W3F8I0GNuFg/hqdefault.jpg',
      tags: ['창업', '글로벌'],
      clipCount: 16,
    },
    {
      id: 'sim-2',
      title: '0에서 1을 만드는 초기 창업가의 사고법',
      thumbnailUrl: 'https://i.ytimg.com/vi/W3F8I0GNuFg/hqdefault.jpg',
      tags: ['마인드셋', '창업'],
      clipCount: 23,
    },
    {
      id: 'sim-3',
      title: '실패를 자산으로 바꾸는 회고의 기술',
      thumbnailUrl: 'https://i.ytimg.com/vi/W3F8I0GNuFg/hqdefault.jpg',
      tags: ['업무생산성', '성장'],
      clipCount: 9,
    },
    {
      id: 'sim-4',
      title: 'AI 시대, 프로덕트 디자이너의 새로운 역할',
      thumbnailUrl: 'https://i.ytimg.com/vi/W3F8I0GNuFg/hqdefault.jpg',
      tags: ['AI', '업무생산성'],
      clipCount: 31,
    },
    {
      id: 'sim-5',
      title: '투자자가 진짜 보는 초기 팀의 신호',
      thumbnailUrl: 'https://i.ytimg.com/vi/W3F8I0GNuFg/hqdefault.jpg',
      tags: ['창업', 'IT'],
      clipCount: 14,
    },
    {
      id: 'sim-6',
      title: '거절에 익숙해지는 멘탈 관리법',
      thumbnailUrl: 'https://i.ytimg.com/vi/W3F8I0GNuFg/hqdefault.jpg',
      tags: ['마인드셋', '리더십'],
      clipCount: 18,
    },
  ];
  return seed.filter((s) => s.id !== excludeId);
}
