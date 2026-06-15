import type { SearchRow, SourceCountRow } from './types';

/**
 * 검색 콜드스타트/오프라인 폴백 시드 (비-AI · 결정론). recommendation/demo-seed 패턴 거울.
 *
 * ★ AI 게이트ⓐ 제외: 추천 그리드·결과·출처카운트는 전부 정적 시드(개인화/시맨틱 ❌).
 * ★ no-leak: 모든 시드는 "본인 행만" 셰이프(user_id/실명 필드 부재). 타 user 행 없음.
 * client null(미구성) 또는 테스트 시 search.ts가 이 시드를 결정론적으로 반환.
 *
 * 디폴트 발견 그리드(8카드)는 프레임 2087:40320 실측 카피 그대로. 카테고리 선택 시 시드 필터.
 */

/** 디폴트 발견 — "카테고리별 추천 컨텐츠" 그리드 시드(프레임 카피 8카드). */
export const DEMO_DISCOVERY: SearchRow[] = [
  {
    id: 'demo-disc-1',
    title: '쿠팡 디자인 리드가 전하는 스케일러블한 토큰 구조 설계',
    provider: 'youtube',
    clipCount: 43,
    tags: ['디자인시스템', '토큰'],
    lastClippedAt: '2026-06-15T09:00:00.000Z',
    thumbnailUrl: null,
  },
  {
    id: 'demo-disc-2',
    title:
      '토스뱅크 프로덕트 디자이너가 실험한 첫 경험 이탈률을 45% 낮춘 온보딩 설계 전략',
    provider: 'longblack',
    clipCount: 27,
    tags: ['UX전략', '온보딩'],
    lastClippedAt: '2026-06-14T09:00:00.000Z',
    thumbnailUrl: null,
  },
  {
    id: 'demo-disc-3',
    title: '아마존이 어떻게 비범한 성과를 창출했는지, 그 질문에 대한 답을 공유합니다',
    provider: 'medium',
    clipCount: 22,
    tags: ['번아웃', '자기관리'],
    lastClippedAt: '2026-06-13T09:00:00.000Z',
    thumbnailUrl: null,
  },
  {
    id: 'demo-disc-4',
    title: '팔로워 수보다 중요한 인플루언서 선정 기준과 협업 ROI 측정 프레임워크',
    provider: 'tistory',
    clipCount: 20,
    tags: ['마케팅', '협업성과'],
    lastClippedAt: '2026-06-12T09:00:00.000Z',
    thumbnailUrl: null,
  },
  {
    id: 'demo-disc-5',
    title: '사운드 경험을 시각화한 스피커 인터페이스 디자인과 사용자 테스트 인사이트',
    provider: 'eoplanet',
    clipCount: 12,
    tags: ['제품디자인', '오디오'],
    lastClippedAt: '2026-06-11T09:00:00.000Z',
    thumbnailUrl: null,
  },
  {
    id: 'demo-disc-6',
    title: '무료로 사용할 수 있는 세련된 로고디자인을 위한 폰트 20가지 공유합니다',
    provider: 'publy',
    clipCount: 15,
    tags: ['폰트', '로고디자인'],
    lastClippedAt: '2026-06-10T09:00:00.000Z',
    thumbnailUrl: null,
  },
  {
    id: 'demo-disc-7',
    title: '단계별 온보딩 플로우 최적화로 활성 사용자를 35% 증가시킨 실전 전략',
    provider: 'youtube',
    clipCount: 29,
    tags: ['모바일UX', '온보딩'],
    lastClippedAt: '2026-06-09T09:00:00.000Z',
    thumbnailUrl: null,
  },
  {
    id: 'demo-disc-8',
    title: '2026년은 디지털 탐색 방식과 이용자 행태가 다시 정의되는 전환점으로 전망됩니다',
    provider: 'medium',
    clipCount: 16,
    tags: ['마케팅', '2026트렌드'],
    lastClippedAt: '2026-06-08T09:00:00.000Z',
    thumbnailUrl: null,
  },
];

/** 검색 결과 데모(오프라인 시연·테스트) — 쿼리 토큰을 제목/태그에 포함하는 본인 시드. */
const DEMO_RESULTS: SearchRow[] = [
  {
    id: 'demo-res-1',
    title: 'IT 업계 동향 2026 — 반도체·AI 인프라 투자 사이클 정리',
    provider: 'youtube',
    clipCount: 5,
    tags: ['AI', '반도체'],
    lastClippedAt: '2026-06-15T10:00:00.000Z',
    thumbnailUrl: null,
  },
  {
    id: 'demo-res-2',
    title: '실리콘밸리 빅테크의 IT 업계 동향과 조직 개편 흐름',
    provider: 'longblack',
    clipCount: 3,
    tags: ['실리콘밸리', '조직'],
    lastClippedAt: '2026-06-14T10:00:00.000Z',
    thumbnailUrl: null,
  },
  {
    id: 'demo-res-3',
    title: 'AI 활용법 — IT 업계 동향을 읽는 7가지 데이터 소스',
    provider: 'medium',
    clipCount: 2,
    tags: ['AI', '데이터'],
    lastClippedAt: '2026-06-13T10:00:00.000Z',
    thumbnailUrl: null,
  },
  {
    id: 'demo-res-4',
    title: '커리어 전환 관점에서 본 IT 업계 동향과 직무 수요 변화',
    provider: 'tistory',
    clipCount: 4,
    tags: ['커리어', '직무'],
    lastClippedAt: '2026-06-12T10:00:00.000Z',
    thumbnailUrl: null,
  },
];

/** lower-trim 정규화(매칭용). */
function norm(v: string): string {
  return v.trim().toLowerCase();
}

/** 시드를 쿼리(제목/태그 부분일치 — 비-AI ILIKE 거울)로 필터. 빈 쿼리 → 빈 결과. */
function matchQuery(items: SearchRow[], query: string): SearchRow[] {
  const q = norm(query);
  if (q === '') return [];
  return items.filter(
    (it) =>
      norm(it.title).includes(q) ||
      it.tags.some((t) => norm(t).includes(q)),
  );
}

/** 정렬(RPC 계약 거울: recent/oldest/most_clips). */
function sortItems(items: SearchRow[], sort: string): SearchRow[] {
  const out = [...items];
  const ts = (v: string | null) => (v ? new Date(v).getTime() : 0);
  if (sort === 'most_clips') {
    out.sort((a, b) => b.clipCount - a.clipCount || a.id.localeCompare(b.id));
  } else if (sort === 'oldest') {
    out.sort((a, b) => ts(a.lastClippedAt) - ts(b.lastClippedAt) || a.id.localeCompare(b.id));
  } else {
    out.sort((a, b) => ts(b.lastClippedAt) - ts(a.lastClippedAt) || a.id.localeCompare(b.id));
  }
  return out;
}

export interface DemoSearchArgs {
  query: string;
  category?: string | null;
  source?: string | null;
  sort?: string;
}

/** 디폴트 발견 그리드 — 카테고리 선택 시 태그 매칭으로 필터(전체=null → 전 시드). */
export function demoDiscovery(category?: string | null): SearchRow[] {
  const cat = category ? norm(category) : '';
  if (cat === '' || cat === '전체') return DEMO_DISCOVERY;
  return DEMO_DISCOVERY.filter((it) => it.tags.some((t) => norm(t).includes(cat)));
}

/** 검색 결과 폴백(그리드 행). category/source/sort 분기(동어반복 ❌). */
export function demoSearchMyContent(args: DemoSearchArgs): SearchRow[] {
  let rows = matchQuery(DEMO_RESULTS, args.query);
  const cat = args.category ? norm(args.category) : '';
  if (cat && cat !== '전체') {
    rows = rows.filter((it) => it.tags.some((t) => norm(t).includes(cat)));
  }
  const src = args.source ? norm(args.source) : '';
  if (src) {
    rows = rows.filter((it) => norm(it.provider) === src);
  }
  return sortItems(rows, args.sort ?? 'recent');
}

/** 출처 카운트 폴백 — source 미적용·category 적용(RPC 계약 거울). 카운트 내림차순. */
export function demoSearchSources(args: {
  query: string;
  category?: string | null;
}): SourceCountRow[] {
  let rows = matchQuery(DEMO_RESULTS, args.query);
  const cat = args.category ? norm(args.category) : '';
  if (cat && cat !== '전체') {
    rows = rows.filter((it) => it.tags.some((t) => norm(t).includes(cat)));
  }
  const byProvider = new Map<string, number>();
  for (const it of rows) {
    byProvider.set(it.provider, (byProvider.get(it.provider) ?? 0) + 1);
  }
  return [...byProvider.entries()]
    .map(([provider, count]) => ({ provider, count }))
    .sort((a, b) => b.count - a.count || a.provider.localeCompare(b.provider));
}
