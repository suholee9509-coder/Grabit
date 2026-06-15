import { SEARCH_CATEGORIES } from '@/features/content-search';
import styles from './category-list.module.css';

/**
 * CategoryList — 세로 카테고리 리스트(헤더 + divider + 13항목). 측정: 2557:7608(디폴트) / 2087:38864(결과).
 *   헤더: 제목 24/700/130%/-2.5% #FAFAFA + 부제 14/400/140%/-2% #B4B4B4(width 176) · divider 68 hairline ·
 *   항목 h32 · pad6/0 · 15/130%/-2.5% — 선택 500/#FAFAFA · 비선택 400/#999(배경/언더라인 없음, 색+weight만, width 196).
 * 선택/클릭 → onSelect(category). 디폴트=헤더 "모든 카테고리" · 결과/빈=헤더 "카테고리"(분리 props).
 */
export interface CategoryListProps {
  title: string;
  subtitle: string;
  selected: string;
  onSelect: (category: string) => void;
}

export function CategoryList({ title, subtitle, selected, onSelect }: CategoryListProps) {
  return (
    <div className={styles.list}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.subtitle}>{subtitle}</p>
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
  );
}
