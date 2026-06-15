import { useQuery } from '@tanstack/react-query';
import { searchMyContent, searchMyContentSources } from '@/shared/api';
import type { SearchContentItem, SourceCount, SearchSort } from '@/entities/content';

/**
 * 검색 TanStack Query 훅 (features/content-search 소유 키).
 *   useSearchResults(query, {category,source,sort}) — 그리드 행(search_my_content).
 *   useSearchSources(query, {category})           — 출처 카운트 배지(search_my_content_sources).
 * enabled = query.trim()≠'' → 빈 쿼리는 호출 ❌(디폴트 발견만). staleTime 60s(recommendation 거울).
 * 디바운스된 query만 인자로 전달 → 0.5s 내 입력은 1 호출(use-content-search).
 */
export const searchKeys = {
  all: ['search'] as const,
  results: (query: string, category: string | null, source: string | null, sort: SearchSort) =>
    ['search', 'results', query, category, source, sort] as const,
  sources: (query: string, category: string | null) =>
    ['search', 'sources', query, category] as const,
};

const STALE = 60_000;

export interface ResultFilters {
  category: string | null;
  source: string | null;
  sort: SearchSort;
}

export function useSearchResults(query: string, filters: ResultFilters) {
  const trimmed = query.trim();
  return useQuery<SearchContentItem[]>({
    queryKey: searchKeys.results(trimmed, filters.category, filters.source, filters.sort),
    queryFn: () =>
      searchMyContent({
        query: trimmed,
        category: filters.category,
        source: filters.source,
        sort: filters.sort,
      }),
    enabled: trimmed.length > 0,
    staleTime: STALE,
  });
}

export function useSearchSources(query: string, category: string | null) {
  const trimmed = query.trim();
  return useQuery<SourceCount[]>({
    queryKey: searchKeys.sources(trimmed, category),
    queryFn: () => searchMyContentSources({ query: trimmed, category }),
    enabled: trimmed.length > 0,
    staleTime: STALE,
  });
}
