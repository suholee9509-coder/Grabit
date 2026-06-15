import { useQuery } from '@tanstack/react-query';
import type { CrossFieldId, FeedCategoryId } from '../model/feed-data';
import {
  fetchCrossTrend,
  fetchHeroFeature,
  fetchInsightFeed,
  fetchRealtimeGrabs,
  fetchRecommendationFeed,
  fetchStreamGrabs,
  fetchTrendGrid,
} from './feed-api';

/**
 * 추천/트렌드 TanStack Query 훅 (entities/recommendation 소유 쿼리 키).
 * 필터/재필터 = 클라 상태 → 훅 인자 → queryKey 변경 → 캐시 분기(결정론 시드).
 */
export const recommendationKeys = {
  all: ['recommendation'] as const,
  hero: (variant: string) => ['recommendation', 'hero', variant] as const,
  rec: (job: string, field: string) => ['recommendation', 'rec', job, field] as const,
  cross: (field: string) => ['recommendation', 'cross', field] as const,
  insight: (field: string) => ['recommendation', 'insight', field] as const,
  stream: (category: string) => ['recommendation', 'stream', category] as const,
  grid: (category: string) => ['recommendation', 'grid', category] as const,
  realtime: () => ['recommendation', 'realtime'] as const,
};

const STALE = 60_000;

export function useHeroFeature(variant: 'default' | 'stream') {
  return useQuery({
    queryKey: recommendationKeys.hero(variant),
    queryFn: () => fetchHeroFeature(variant),
    staleTime: STALE,
  });
}

export function useRecommendationFeed(job: string, field: string) {
  return useQuery({
    queryKey: recommendationKeys.rec(job, field),
    queryFn: () => fetchRecommendationFeed(job, field),
    staleTime: STALE,
  });
}

export function useCrossTrend(field: CrossFieldId) {
  return useQuery({
    queryKey: recommendationKeys.cross(field),
    queryFn: () => fetchCrossTrend(field),
    staleTime: STALE,
  });
}

export function useInsightFeed(field: CrossFieldId) {
  return useQuery({
    queryKey: recommendationKeys.insight(field),
    queryFn: () => fetchInsightFeed(field),
    staleTime: STALE,
  });
}

export function useStreamGrabs(category: FeedCategoryId) {
  return useQuery({
    queryKey: recommendationKeys.stream(category),
    queryFn: () => fetchStreamGrabs(category),
    staleTime: STALE,
  });
}

export function useTrendGrid(category: FeedCategoryId) {
  return useQuery({
    queryKey: recommendationKeys.grid(category),
    queryFn: () => fetchTrendGrid(category),
    staleTime: STALE,
  });
}

export function useRealtimeGrabs() {
  return useQuery({
    queryKey: recommendationKeys.realtime(),
    queryFn: fetchRealtimeGrabs,
    staleTime: STALE,
  });
}
