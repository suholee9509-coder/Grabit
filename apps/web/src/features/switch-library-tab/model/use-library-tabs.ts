import { useState } from 'react';

/** 우측 본문 토글(컨텐츠/인사이트) — AI 노트 탭 미렌더(게이트ⓐ). */
export type PanelTab = 'content' | 'insight';
/** 좌 사이드바 탭(내 컨텐츠/북마크) — 북마크=UI+빈상태(DM-bookmark 옵션1). */
export type SideTab = 'content' | 'bookmark';

/**
 * useLibraryTabs — 컨텐츠↔인사이트(우)·내 컨텐츠↔북마크(좌) 탭 상태 머신.
 *   순수 로컬 상태(라우팅 비의존). page가 본문 그리드 스왑에 사용.
 */
export function useLibraryTabs(initialPanel: PanelTab = 'content', initialSide: SideTab = 'content') {
  const [panelTab, setPanelTab] = useState<PanelTab>(initialPanel);
  const [sideTab, setSideTab] = useState<SideTab>(initialSide);
  return { panelTab, setPanelTab, sideTab, setSideTab };
}
