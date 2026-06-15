import { useCallback, useMemo, useState } from 'react';
import type { LibrarySort } from '@/shared/api';
import { useLibraryTabs } from '@/features/switch-library-tab';

/**
 * useLibraryView — 라이브러리 뷰 상태 머신(folderId·tab·source·sort·selection·expanded).
 *   상세(u4)로 진입했다 복귀해도 상태 유지([non-regression]) — 라우팅 비의존 로컬 상태(페이지 마운트 유지)
 *   + 라이브러리는 라우트 단일이라 카드 클릭이 navigate('/content/:id')로 이동·뒤로가기 복귀 시
 *   브라우저 히스토리로 페이지 재마운트되나, 폴더/필터는 URL이 아닌 세션 보존이 필요하면 후속(현재 로컬).
 */
export function useLibraryView() {
  const tabs = useLibraryTabs();

  const [folderId, setFolderId] = useState<string | null>(null);
  const [sort, setSort] = useState<LibrarySort>('recent');
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());

  /** 폴더 진입 — 출처 필터 초기화(폴더 컨텍스트 재집계). */
  const openFolder = useCallback((id: string | null) => {
    setFolderId(id);
    setSelectedProvider(null);
    setSelectedIds(new Set());
  }, []);

  const toggleExpanded = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelect = useCallback((contentId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(contentId)) next.delete(contentId);
      else next.add(contentId);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const selectable = selectedIds.size > 0;

  return useMemo(
    () => ({
      // tabs
      panelTab: tabs.panelTab,
      setPanelTab: tabs.setPanelTab,
      sideTab: tabs.sideTab,
      setSideTab: tabs.setSideTab,
      // folder nav
      folderId,
      openFolder,
      // sort / source
      sort,
      setSort,
      selectedProvider,
      setSelectedProvider,
      // selection (multiselect)
      selectedIds,
      selectable,
      toggleSelect,
      clearSelection,
      // tree
      expandedIds,
      toggleExpanded,
    }),
    [
      tabs.panelTab,
      tabs.setPanelTab,
      tabs.sideTab,
      tabs.setSideTab,
      folderId,
      openFolder,
      sort,
      selectedProvider,
      selectedIds,
      selectable,
      toggleSelect,
      clearSelection,
      expandedIds,
      toggleExpanded,
    ],
  );
}
