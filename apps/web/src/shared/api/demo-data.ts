import { parseYoutubeUrl } from '@/shared/lib';
import type {
  ContentMetaDto,
  FolderCountDto,
  FolderRow,
  HeatmapBucketDto,
  LibraryCardDto,
  LibrarySort,
  PublicClipDto,
  SimilarContentDto,
  SourceCountDto,
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

/* ============================================================
 * u7 라이브러리 — 데모 시드(Supabase 미구성/콜드스타트/테스트 폴백).
 *   프레임 1:1 카피(창업가 정신 32·피그마 실습 강의 22·디자인 트렌드 8 / 출처 32·16·8·6·2·2).
 *   본인 데이터 표현(식별자 없음). 데이터=32/22/8 우선(명세 — 카드 카피의 Figma "32" 오타 무시).
 * ============================================================ */

/** 라이브러리 폴더(좌 트리·폴더 카드·드롭다운 공유). DEMO_FOLDERS와 별개의 u7 폴더 셋. */
export const DEMO_LIBRARY_FOLDERS: FolderRow[] = [
  { id: 'lf-startup', name: '창업가 정신' },
  { id: 'lf-figma', name: '피그마 실습 강의' },
  { id: 'lf-trend', name: '디자인 트렌드' },
];

/** 폴더별 distinct content 수("N개의 컨텐츠") — 명세 카운트 32/22/8. */
export const DEMO_FOLDER_COUNTS: FolderCountDto[] = [
  { folderId: 'lf-startup', name: '창업가 정신', contentCount: 32 },
  { folderId: 'lf-figma', name: '피그마 실습 강의', contentCount: 22 },
  { folderId: 'lf-trend', name: '디자인 트렌드', contentCount: 8 },
];

/** 출처 카운트(전체 라이브러리) — 프레임 칩 1:1(provider별 distinct content). */
export const DEMO_SOURCE_COUNTS: SourceCountDto[] = [
  { provider: 'youtube', contentCount: 16 },
  { provider: 'longblack', contentCount: 8 },
  { provider: 'medium', contentCount: 6 },
  { provider: 'eoplanet', contentCount: 2 },
  { provider: 'publy', contentCount: 2 },
];

/** 라이브러리 카드 시드(전체 폴더) — 썸네일·태그·grabCount·provider. 클릭 → /content/:id. */
export const DEMO_LIBRARY_CARDS: LibraryCardDto[] = [
  {
    contentId: 'lc-1',
    title: '무료로 사용할 수 있는 세련된 로고디자인을 위한 폰트 20가지 공유합니다.',
    thumbnailUrl: 'https://i.ytimg.com/vi/W3F8I0GNuFg/hqdefault.jpg',
    provider: 'youtube',
    tags: ['폰트', '로고디자인'],
    grabCount: 15,
    lastClipAt: '2026-06-15T09:00:00.000Z',
  },
  {
    contentId: 'lc-2',
    title: '서로의 결을 시각화한 소리의 인터페이스, 디자이너 4명이 모여 만든 인터랙티브 프로젝트',
    thumbnailUrl: 'https://i.ytimg.com/vi/W3F8I0GNuFg/hqdefault.jpg',
    provider: 'medium',
    tags: ['인터랙션', 'UX'],
    grabCount: 8,
    lastClipAt: '2026-06-14T09:00:00.000Z',
  },
  {
    contentId: 'lc-3',
    title: '23년 프로토타이핑 실습 강의에서 다루는 Lovable 환경 설정 가이드',
    thumbnailUrl: 'https://i.ytimg.com/vi/W3F8I0GNuFg/hqdefault.jpg',
    provider: 'youtube',
    tags: ['Lovable', '노코드'],
    grabCount: 12,
    lastClipAt: '2026-06-13T09:00:00.000Z',
  },
  {
    contentId: 'lc-4',
    title: '2026년 다가올 디자인 업계의 트렌드를 미리 살펴보고 준비하는 방법',
    thumbnailUrl: 'https://i.ytimg.com/vi/W3F8I0GNuFg/hqdefault.jpg',
    provider: 'longblack',
    tags: ['트렌드', '디자인'],
    grabCount: 22,
    lastClipAt: '2026-06-12T09:00:00.000Z',
  },
  {
    contentId: 'lc-5',
    title: '단계별 코딩 없이 웹사이트를 만드는 노코드 툴 총정리 — 입문자를 위한 추천',
    thumbnailUrl: 'https://i.ytimg.com/vi/W3F8I0GNuFg/hqdefault.jpg',
    provider: 'publy',
    tags: ['노코드', '입문'],
    grabCount: 9,
    lastClipAt: '2026-06-11T09:00:00.000Z',
  },
  {
    contentId: 'lc-6',
    title: '디자이너를 위한 AI 도구 ChatGPT·Gemini·Claude 비교',
    thumbnailUrl: 'https://i.ytimg.com/vi/W3F8I0GNuFg/hqdefault.jpg',
    provider: 'youtube',
    tags: ['AI', '업무생산성'],
    grabCount: 16,
    lastClipAt: '2026-06-10T09:00:00.000Z',
  },
  {
    contentId: 'lc-7',
    title: '스타트업 초기 창업가가 알아야 할 자금 조달과 팀 빌딩의 기본',
    thumbnailUrl: 'https://i.ytimg.com/vi/W3F8I0GNuFg/hqdefault.jpg',
    provider: 'eoplanet',
    tags: ['창업', '팀빌딩'],
    grabCount: 7,
    lastClipAt: '2026-06-09T09:00:00.000Z',
  },
  {
    contentId: 'lc-8',
    title: '디자인 트렌드 2026: 미니멀에서 맥시멀로 — 시각 언어의 변화',
    thumbnailUrl: 'https://i.ytimg.com/vi/W3F8I0GNuFg/hqdefault.jpg',
    provider: 'longblack',
    tags: ['트렌드', '시각디자인'],
    grabCount: 11,
    lastClipAt: '2026-06-08T09:00:00.000Z',
  },
  {
    contentId: 'lc-9',
    title: 'Notion으로 만드는 개인 지식관리 시스템 — 세컨드 브레인 구축',
    thumbnailUrl: 'https://i.ytimg.com/vi/W3F8I0GNuFg/hqdefault.jpg',
    provider: 'medium',
    tags: ['Notion', '생산성'],
    grabCount: 14,
    lastClipAt: '2026-06-07T09:00:00.000Z',
  },
  {
    contentId: 'lc-10',
    title: '최신 모션 트렌드와 마이크로 인터랙션으로 사용자 경험을 끌어올리는 방법',
    thumbnailUrl: 'https://i.ytimg.com/vi/W3F8I0GNuFg/hqdefault.jpg',
    provider: 'youtube',
    tags: ['모션', '인터랙션'],
    grabCount: 6,
    lastClipAt: '2026-06-06T09:00:00.000Z',
  },
];

/** 폴더별 카드 매핑(데모) — 폴더 진입 시 그 폴더 콘텐츠만(프레임 시연용 분할). */
const DEMO_CARDS_BY_FOLDER: Record<string, string[]> = {
  'lf-startup': ['lc-1', 'lc-3', 'lc-6', 'lc-7', 'lc-9', 'lc-10'],
  'lf-figma': ['lc-1', 'lc-3', 'lc-5'],
  'lf-trend': ['lc-4', 'lc-8'],
};

/** 데모 라이브러리 카드(folder/sort 적용 — 결정론). */
export function demoLibraryCards(
  folderId: string | null = null,
  sort: LibrarySort = 'recent',
): LibraryCardDto[] {
  let cards = DEMO_LIBRARY_CARDS;
  if (folderId) {
    const ids = DEMO_CARDS_BY_FOLDER[folderId] ?? [];
    cards = DEMO_LIBRARY_CARDS.filter((c) => ids.includes(c.contentId));
  }
  const sorted = [...cards];
  const ts = (c: LibraryCardDto) => new Date(c.lastClipAt ?? 0).getTime();
  if (sort === 'oldest') sorted.sort((a, b) => ts(a) - ts(b));
  else if (sort === 'most_clips') sorted.sort((a, b) => b.grabCount - a.grabCount);
  else sorted.sort((a, b) => ts(b) - ts(a)); // recent
  return sorted;
}

/** 데모 폴더 카운트. */
export function demoFolderCounts(): FolderCountDto[] {
  return DEMO_FOLDER_COUNTS;
}

/** 데모 출처 카운트(folder/전체 — 결정론). 폴더 지정 시 그 폴더 카드에서 재집계. */
export function demoSourceCounts(folderId: string | null = null): SourceCountDto[] {
  if (!folderId) return DEMO_SOURCE_COUNTS;
  const cards = demoLibraryCards(folderId);
  const byProvider = new Map<string, number>();
  for (const c of cards) byProvider.set(c.provider, (byProvider.get(c.provider) ?? 0) + 1);
  return [...byProvider.entries()]
    .map(([provider, contentCount]) => ({ provider, contentCount }))
    .sort((a, b) => b.contentCount - a.contentCount || a.provider.localeCompare(b.provider));
}

/** 인사이트(내 메모 발췌) 카드 시드 — 썸네일 + 출처행/제목 + 메모 발췌(2117:24721). */
export interface DemoInsightCard {
  contentId: string;
  thumbnailUrl: string | null;
  provider: string;
  title: string;
  memoExcerpt: string;
}

export const DEMO_INSIGHTS: DemoInsightCard[] = [
  {
    contentId: 'lc-7',
    thumbnailUrl: 'https://i.ytimg.com/vi/W3F8I0GNuFg/hqdefault.jpg',
    provider: 'youtube',
    title: '지금 당신은 원하던 삶을 살고 있나요? 나답게 살기 위한 실리콘밸리 리더의 도전 이야기',
    memoExcerpt:
      '네이버 CTO 출신 프론트엔드의 Next.js를 구현하는 방법에 대해 작성하였습니다. 네이버 CTO',
  },
  {
    contentId: 'lc-1',
    thumbnailUrl: 'https://i.ytimg.com/vi/W3F8I0GNuFg/hqdefault.jpg',
    provider: 'medium',
    title: '무료로 사용할 수 있는 세련된 로고디자인을 위한 폰트 20가지',
    memoExcerpt:
      '폰트 선택이 브랜드 인상의 70%를 결정한다는 점, 가변 폰트로 로딩 비용을 줄이는 전략이 유용했어요.',
  },
  {
    contentId: 'lc-6',
    thumbnailUrl: 'https://i.ytimg.com/vi/W3F8I0GNuFg/hqdefault.jpg',
    provider: 'youtube',
    title: '디자이너를 위한 AI 도구 ChatGPT·Gemini·Claude 비교',
    memoExcerpt:
      '도구별 강점이 명확히 갈린다는 점, 리서치는 Gemini·초안은 Claude·이미지는 별도 라는 워크플로우가 좋았습니다.',
  },
  {
    contentId: 'lc-4',
    thumbnailUrl: 'https://i.ytimg.com/vi/W3F8I0GNuFg/hqdefault.jpg',
    provider: 'longblack',
    title: '2026년 다가올 디자인 업계의 트렌드',
    memoExcerpt:
      '트렌드를 좇기보다 우리 제품의 맥락에 맞는 요소만 취사선택하라는 조언이 인상 깊었어요.',
  },
  {
    contentId: 'lc-9',
    thumbnailUrl: 'https://i.ytimg.com/vi/W3F8I0GNuFg/hqdefault.jpg',
    provider: 'medium',
    title: 'Notion으로 만드는 개인 지식관리 시스템',
    memoExcerpt:
      '메모는 입력보다 회수가 중요하다는 점, 태그보다 링크 중심으로 연결하면 재발견이 쉬워진다는 부분.',
  },
  {
    contentId: 'lc-10',
    thumbnailUrl: 'https://i.ytimg.com/vi/W3F8I0GNuFg/hqdefault.jpg',
    provider: 'youtube',
    title: '최신 모션 트렌드와 마이크로 인터랙션',
    memoExcerpt:
      '모션은 장식이 아니라 상태 변화를 설명하는 언어라는 정의, 200ms 이하 전환의 체감 차이가 흥미로웠어요.',
  },
];

/** 데모 인사이트 카드(folder 적용 — 결정론). */
export function demoInsights(folderId: string | null = null): DemoInsightCard[] {
  if (!folderId) return DEMO_INSIGHTS;
  const ids = DEMO_CARDS_BY_FOLDER[folderId] ?? [];
  return DEMO_INSIGHTS.filter((i) => ids.includes(i.contentId));
}
