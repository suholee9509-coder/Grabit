import { useQuery } from '@tanstack/react-query';
import { fetchContentHeatmap } from './heatmap-query';
import {
  fetchContentDetail,
  fetchContentInsights,
  fetchSimilarContent,
} from './insights-query';

/**
 * 콘텐츠 상세 TanStack Query 훅(view-insights 소유 쿼리 키).
 * 결정론: 미구성/실패 시 demo 폴백. retry:false(부분 실패 즉시 격리).
 */
export const contentDetailKeys = {
  all: ['content-detail'] as const,
  insights: (id: string) => ['content-detail', 'insights', id] as const,
  meta: (id: string) => ['content-detail', 'meta', id] as const,
  heatmap: (id: string) => ['content-detail', 'heatmap', id] as const,
  similar: (id: string) => ['content-detail', 'similar', id] as const,
};

const STALE = 60_000;

/** 인사이트(공개 클립, sanitized). */
export function useContentInsights(contentId: string) {
  return useQuery({
    queryKey: contentDetailKeys.insights(contentId),
    queryFn: () => fetchContentInsights(contentId),
    staleTime: STALE,
    retry: false,
  });
}

/** 히트맵(구간 밀도). */
export function useContentHeatmap(contentId: string) {
  return useQuery({
    queryKey: contentDetailKeys.heatmap(contentId),
    queryFn: () => fetchContentHeatmap(contentId),
    staleTime: STALE,
    retry: false,
  });
}

/**
 * 콘텐츠 메타(제목·채널·길이·그랩수·코호트). 인사이트(그랩수/코호트 합성)에 의존 →
 * insights 데이터가 준비되면 그 위에서 메타를 합성한다.
 */
export function useContentDetail(
  contentId: string,
  insights: import('@/entities/clip').PublicClip[] | undefined,
) {
  return useQuery({
    queryKey: [...contentDetailKeys.meta(contentId), (insights ?? []).length],
    queryFn: () => fetchContentDetail(contentId, insights ?? []),
    enabled: insights != null,
    staleTime: STALE,
    retry: false,
  });
}

/** 비슷한 컨텐츠(콜드스타트 폴백 시드). */
export function useSimilarContent(contentId: string) {
  return useQuery({
    queryKey: contentDetailKeys.similar(contentId),
    queryFn: () => fetchSimilarContent(contentId),
    staleTime: STALE,
    retry: false,
  });
}
