import { SEARCH_CATEGORIES } from '@/features/content-search';
import styles from './category-strip.module.css';

/**
 * CategoryStrip — 결과/빈 좌측 카테고리 필터 스트립. 측정: 2087:38864(결과) / 2087:40142(빈).
 *   헤더 "카테고리"(24/700/130%/-2.5% #FAFAFA) + "카테고리별로 검색 결과를\n확인해 보세요."(14/400/140%/-2% #B4B4B4) ·
 *   divider 68 hairline · 항목 13개 h32 pad6/0 15/130%/-2.5%(선택 500/#FAFAFA · 비선택 400/#999).
 * ⚠ FSD: search-discovery의 CategoryList와 동형이나 동일레이어 cross-slice 금지 → 분리 컴포(자체 소유).
 * 결과/빈 공용(13개 유지). 선택/클릭 → onSelect(category).
 */
export interface CategoryStripProps {
  selected: string;
  onSelect: (category: string) => void;
}

export function CategoryStrip({ selected, onSelect }: CategoryStripProps) {
  return (
    <div className={styles.strip}>
      <div className={styles.col}>
        <div className={styles.header}>
          <h2 className={styles.title}>카테고리</h2>
          <p className={styles.subtitle}>
            카테고리별로 검색 결과를{'\n'}확인해 보세요.
          </p>
        </div>
        <hr className={styles.divider} />
        <div className={styles.items}>
          {SEARCH_CATEGORIES.map((cat) => {
            const isSelected = cat === selected;
            return (
              <button
                key={cat}
                type="button"
                className={[styles.item, isSelected ? styles.selected : ''].filter(Boolean).join(' ')}
                aria-pressed={isSelected}
                onClick={() => onSelect(cat)}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>
      <span className={styles.vDivider} aria-hidden="true" />
    </div>
  );
}
