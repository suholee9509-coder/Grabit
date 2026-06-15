import { useQuery } from '@tanstack/react-query';
import {
  getLibraryCards,
  getFolderCounts,
  isSupabaseReady,
  demoLibraryCards,
  demoFolderCounts,
  demoInsights,
  type LibrarySort,
} from '@/shared/api';
import type { LibraryCard, InsightCard } from '@/entities/content';
import type { FolderWithCount } from '@/entities/folder';

/**
 * 라이브러리 read 훅(TanStack Query) — isSupabaseReady 분기, 실패/미구성 시 demo 폴백(결정론).
 *   ★ 본인 행만(RLS). raw cross-user clips/folders 직접 쿼리 ❌(library_* RPC만).
 *   queryKey 모두 ['library', ...] prefix → mutation 성공 시 invalidate(['library'])로 일괄 갱신.
 */

/** 카드 그리드(전체/폴더 내 · 정렬). */
export function useLibraryCards(folderId: string | null, sort: LibrarySort) {
  return useQuery<LibraryCard[]>({
    queryKey: ['library', 'cards', folderId, sort],
    queryFn: () => loadCards(folderId, sort),
    retry: false,
  });
}

async function loadCards(folderId: string | null, sort: LibrarySort): Promise<LibraryCard[]> {
  if (isSupabaseReady) {
    try {
      const rows = await getLibraryCards(folderId, sort);
      return rows.map((r) => ({
        contentId: r.contentId,
        title: r.title,
        thumbnailUrl: r.thumbnailUrl,
        provider: r.provider,
        tags: r.tags,
        grabCount: r.grabCount,
        lastClipAt: r.lastClipAt,
      }));
    } catch {
      return demoLibraryCards(folderId, sort) as LibraryCard[];
    }
  }
  return demoLibraryCards(folderId, sort) as LibraryCard[];
}

/** 폴더별 카운트(좌 트리·폴더 카드·드롭다운). */
export function useFolderCounts() {
  return useQuery<FolderWithCount[]>({
    queryKey: ['library', 'folderCounts'],
    queryFn: loadFolderCounts,
    retry: false,
  });
}

async function loadFolderCounts(): Promise<FolderWithCount[]> {
  const rows = isSupabaseReady
    ? await getFolderCounts().catch(() => demoFolderCounts())
    : demoFolderCounts();
  return rows.map((r) => ({ id: r.folderId, name: r.name, contentCount: r.contentCount }));
}

/**
 * 인사이트 카드(내 메모 발췌) — 0011 전용 RPC 부재(library_cards는 메모 미반환) →
 *   [OPEN-A] 잠정: demo 폴백(본인 read·sanitized 불필요). 실배선 RPC 확보 시 교체.
 */
export function useInsights(folderId: string | null) {
  return useQuery<InsightCard[]>({
    queryKey: ['library', 'insights', folderId],
    queryFn: async () =>
      demoInsights(folderId).map((d) => ({
        contentId: d.contentId,
        thumbnailUrl: d.thumbnailUrl,
        provider: d.provider,
        title: d.title,
        memoExcerpt: d.memoExcerpt,
      })),
    retry: false,
  });
}
