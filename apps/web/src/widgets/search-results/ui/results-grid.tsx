import { ContentCard, type SearchContentItem } from '@/entities/content';
import styles from './results-grid.module.css';

/**
 * ResultsGrid — 결과 4열 그리드. 측정: 2087:38953 행간42 열간28 width1092(컬럼폭).
 *   카드 = ContentCard(소비) · 252×4 + 28×3 = 1092. 카드 클릭 → onSelect(id) → /content/:id.
 */
export interface ResultsGridProps {
  items: SearchContentItem[];
  onSelect: (id: string) => void;
}

export function ResultsGrid({ items, onSelect }: ResultsGridProps) {
  return (
    <div className={styles.grid}>
      {items.map((item) => (
        <ContentCard key={item.id} model={item} onSelect={onSelect} />
      ))}
    </div>
  );
}
