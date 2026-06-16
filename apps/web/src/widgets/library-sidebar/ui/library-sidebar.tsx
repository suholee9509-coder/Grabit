import type { ReactNode } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { Tabs, type TabItem } from '@/shared/ui';
import styles from './library-sidebar.module.css';

/**
 * LibrarySidebar — 좌측 "내 라이브러리" 사이드바(2117:22557, 382×1080 · #121212 · r8).
 *   제목(Bold 20 #FFFFFF 순백·FD3) + 내 컨텐츠/북마크 토글(h36 pill) +
 *   "전체 폴더" select 트리거(298×38 r6 surface-ghost +border-subtle) + 검색 버튼(38×38 r6) +
 *   폴더 리스트/트리 슬롯(children).
 * 순수 프레젠테이션. 폴더 데이터·라우팅은 page가 children 슬롯으로 주입(같은레이어 크로스슬라이스 회피).
 * ★ AI 노트 탭 미렌더 — 좌 탭은 내 컨텐츠/북마크만(게이트ⓐ).
 */
export interface LibrarySidebarProps {
  /** 좌 탭 값(내 컨텐츠/북마크). */
  tab: 'content' | 'bookmark';
  onTabChange: (tab: 'content' | 'bookmark') => void;
  /** "전체 폴더" select 라벨(현재 폴더명 또는 '전체 폴더'). */
  selectLabel: string;
  /** select 트리거 활성(B3) — 사이드바 폴더 트리가 인라인 전체 펼침 상태. */
  selectExpanded?: boolean;
  /** select 트리거 클릭 → 사이드바 폴더 트리 인라인 확장/접힘 토글(B3). */
  onSelectClick: () => void;
  /** 사이드바 검색 버튼 클릭(검색 진입점). */
  onSearchClick?: () => void;
  /** 폴더 리스트/트리 슬롯. */
  children?: ReactNode;
}

const TAB_ITEMS: TabItem[] = [
  { id: 'content', label: '내 컨텐츠' },
  { id: 'bookmark', label: '북마크' },
];

export function LibrarySidebar({
  tab,
  onTabChange,
  selectLabel,
  selectExpanded = false,
  onSelectClick,
  onSearchClick,
  children,
}: LibrarySidebarProps) {
  return (
    <aside className={styles.sidebar} aria-label="내 라이브러리">
      <div className={styles.header}>
        <h1 className={styles.title}>내 라이브러리</h1>
        <Tabs
          items={TAB_ITEMS}
          value={tab}
          onValueChange={(id) => onTabChange(id as 'content' | 'bookmark')}
          variant="segment"
          size="sm"
          className={styles.tabs}
        />
      </div>

      <div className={styles.selectRow}>
        <button
          type="button"
          className={[styles.selectTrigger, selectExpanded ? styles.selectTriggerActive : '']
            .filter(Boolean)
            .join(' ')}
          onClick={onSelectClick}
          aria-expanded={selectExpanded}
          aria-controls="library-folder-tree"
        >
          <span className={styles.selectLabel}>{selectLabel}</span>
          <ChevronDown
            width={18}
            height={18}
            color="#5E5E5E"
            strokeWidth={1.8}
            aria-hidden="true"
            className={[styles.selectChevron, selectExpanded ? styles.selectChevronOpen : '']
              .filter(Boolean)
              .join(' ')}
          />
        </button>
        <button type="button" className={styles.searchBtn} onClick={onSearchClick} aria-label="라이브러리 검색">
          <Search width={20} height={20} color="#B4B4B4" strokeWidth={1.8} aria-hidden="true" />
        </button>
      </div>

      <div className={styles.list} id="library-folder-tree">
        {children}
      </div>
    </aside>
  );
}
