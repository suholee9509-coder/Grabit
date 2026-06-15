import { useMemo } from 'react';
import { demoDiscovery } from '@/shared/api';
import { SearchBar, CATEGORY_ALL } from '@/features/content-search';
import { KeywordChips } from './keyword-chips';
import { CategoryList } from './category-list';
import { DiscoveryGrid } from './discovery-grid';
import styles from './search-discovery.module.css';

/**
 * SearchDiscovery — 디폴트 발견(검색 전). 측정: 2087:40320.
 *   히어로(713×48, 32/600/150%/-2.5% CENTER #FFFFFF) + 검색바 + 추천칩6 + 카테고리 패널(좌 리스트 + divider + 우 그리드).
 * 추천 그리드 = 콜드스타트 폴백 시드(demoDiscovery, 비-AI) · 카테고리 선택 시 시드 필터.
 * 검색바·칩·카테고리는 features/use-content-search 상태에 위임(props).
 */
export interface SearchDiscoveryProps {
  input: string;
  onInputChange: (v: string) => void;
  onSubmit: (q: string) => void;
  category: string;
  onCategorySelect: (c: string) => void;
  recent: string[];
  onRecentSelect: (q: string) => void;
  onRecentRemove: (q: string) => void;
  onCardSelect: (id: string) => void;
}

export function SearchDiscovery({
  input,
  onInputChange,
  onSubmit,
  category,
  onCategorySelect,
  recent,
  onRecentSelect,
  onRecentRemove,
  onCardSelect,
}: SearchDiscoveryProps) {
  // 콜드스타트 폴백(비-AI 결정론 시드) — 카테고리 선택 시 필터.
  const gridItems = useMemo(() => demoDiscovery(category === CATEGORY_ALL ? null : category), [category]);

  return (
    <div className={styles.discovery}>
      <div className={styles.heroBlock}>
        <h1 className={styles.hero}>어디서든 발견한 인사이트를 한 곳에서 관리하고 성장하세요</h1>
        <div className={styles.searchBarWrap}>
          <SearchBar
            mode="default"
            input={input}
            onInputChange={onInputChange}
            onSubmit={onSubmit}
            recent={recent}
            onRecentSelect={onRecentSelect}
            onRecentRemove={onRecentRemove}
          />
        </div>
        <div className={styles.chipsWrap}>
          <KeywordChips onSelect={onSubmit} />
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.left}>
          <CategoryList
            title="모든 카테고리"
            subtitle="다양한 컨텐츠와 함께 성장하는 매일을 만나보세요."
            selected={category}
            onSelect={onCategorySelect}
          />
        </div>
        <span className={styles.vDivider} aria-hidden="true" />
        <div className={styles.right}>
          <DiscoveryGrid items={gridItems} onSelect={onCardSelect} />
        </div>
      </div>
    </div>
  );
}
