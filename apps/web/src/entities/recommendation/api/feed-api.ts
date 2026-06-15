import { isSupabaseReady } from '@/shared/api';
import type { CrossFieldId, FeedCategoryId } from '../model/feed-data';
import {
  CROSS_TABS,
  HERO_DEFAULT,
  HERO_STREAM,
  INSIGHT_TABS,
  REALTIME_GRABS,
  seedCrossItems,
  seedGridItems,
  seedRecItems,
  seedStreamItems,
} from './demo-seed';
import type {
  CrossTrendFeed,
  GrabFeed,
  HeroFeature,
  RecommendationFeed,
  StreamFeed,
  TrendGridFeed,
} from '../model/types';

/**
 * 추천/트렌드 데이터 표면(feed-api) — 콜드스타트 폴백 인터페이스.
 *
 * ★ E1 결정: u0b에 "내 직군 인기"·"크로스 트렌드"·"실시간 인기" 집계 RPC 없음.
 *   신규 BE RPC ❌ → 모든 표면은 demo-seed를 결정론적으로 반환(MVP 주 경로).
 *   isSupabaseReady=true여도 집계 RPC가 없으므로 동일 시드 폴백(TODO 주석).
 *   cross-user clips 직접쿼리 ❌ · user_id/실명 미노출(모델 셰이프에 필드 부재).
 *
 * ★ 테스트 결정론: 모든 함수 동기 시드 → Promise.resolve. (vi.mock('@/shared/api')로
 *   isSupabaseReady=false 강제 시에도 동일 시드 경로. __forceEmpty로 0건 시나리오 주입.)
 */

/** 테스트 전용: 0건(콜드스타트 빈) 시나리오 강제. 프로덕션 경로 무영향. */
let forceEmpty = false;
/** @internal 테스트 훅 — items=[] 강제(home-empty-cold-start). */
export function __setForceEmpty(v: boolean): void {
  forceEmpty = v;
}

function maybeEmpty<T>(items: T[]): T[] {
  return forceEmpty ? [] : items;
}

/** 히어로 피처(취향관/피드 카피 분기). 폴백 시드. */
export function fetchHeroFeature(variant: 'default' | 'stream'): Promise<HeroFeature | null> {
  if (forceEmpty) return Promise.resolve(null);
  return Promise.resolve(variant === 'stream' ? HERO_STREAM : HERO_DEFAULT);
}

/** 취향관 추천 캐러셀 — 내 직군 라벨 + 분야 인자에 따라 재필터. */
export function fetchRecommendationFeed(job: string, field: string): Promise<RecommendationFeed> {
  // TODO(E1 후속 RPC): isSupabaseReady && 인기집계RPC 도입 시 그 경로로 교체.
  void isSupabaseReady;
  return Promise.resolve({
    title: `${job}이 많이 본 컨텐츠`,
    items: maybeEmpty(seedRecItems(field)),
  });
}

/** 직군별 크로스 트렌드 — 탭(정적) + 분야별 카드 시드. */
export function fetchCrossTrend(field: CrossFieldId): Promise<CrossTrendFeed> {
  return Promise.resolve({
    tabs: CROSS_TABS,
    items: maybeEmpty(seedCrossItems(field)),
  });
}

/** 현직자 인사이트 — 탭(정적) + 분야별 카드 시드(크로스와 동형). */
export function fetchInsightFeed(field: CrossFieldId): Promise<CrossTrendFeed> {
  return Promise.resolve({
    tabs: INSIGHT_TABS,
    items: maybeEmpty(seedCrossItems(field)),
  });
}

/** 피드: 실시간 인기 그랩 — 카테고리 인자에 따라 필터. */
export function fetchStreamGrabs(category: FeedCategoryId): Promise<StreamFeed> {
  return Promise.resolve({ items: maybeEmpty(seedStreamItems(category)) });
}

/** 피드: 분야별 트렌드 그리드 — 카테고리 인자에 따라 필터. */
export function fetchTrendGrid(category: FeedCategoryId): Promise<TrendGridFeed> {
  return Promise.resolve({ items: maybeEmpty(seedGridItems(category)) });
}

/** 우레일: 실시간 그랩(버블 + 임베드). */
export function fetchRealtimeGrabs(): Promise<GrabFeed> {
  return Promise.resolve({ items: maybeEmpty(REALTIME_GRABS) });
}
