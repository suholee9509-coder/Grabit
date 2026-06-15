import { useQuery } from '@tanstack/react-query';
import { getSourceCounts, isSupabaseReady, demoSourceCounts } from '@/shared/api';
import type { SourceCount } from '@/entities/content';

/**
 * useSourceCounts — 출처 카운트 필터 데이터(library_source_counts, folderId 스코프).
 *   isSupabaseReady 분기 → 실패/미구성 시 demo 폴백(결정론). 본인 행만(RLS).
 *   반환: { sources(provider별), total(distinct content 합) }.
 */
export interface SourceCountsResult {
  sources: SourceCount[];
  total: number;
}

export function useSourceCounts(folderId: string | null) {
  return useQuery<SourceCountsResult>({
    queryKey: ['library', 'sourceCounts', folderId],
    queryFn: async () => {
      const rows = await loadSourceCounts(folderId);
      const sources = rows.map((r) => ({ provider: r.provider, count: r.contentCount }));
      const total = sources.reduce((sum, s) => sum + s.count, 0);
      return { sources, total };
    },
    retry: false,
  });
}

async function loadSourceCounts(folderId: string | null) {
  if (isSupabaseReady) {
    try {
      return await getSourceCounts(folderId);
    } catch {
      return demoSourceCounts(folderId);
    }
  }
  return demoSourceCounts(folderId);
}
