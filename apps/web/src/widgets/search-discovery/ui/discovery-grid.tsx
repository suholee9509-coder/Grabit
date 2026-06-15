import { ContentCard, type SearchContentItem } from '@/entities/content';
import styles from './discovery-grid.module.css';

/**
 * DiscoveryGrid — "카테고리별 추천 컨텐츠" 4열 그리드. 측정: 2557:7642.
 *   섹션 제목 24/700/130%/-2.5% #FAFAFA · 컨테이너 gap24(제목↔그리드) ·
 *   그리드 행간42 · 열간28 · width1092(제목)/1083(그리드) · 카드 = ContentCard(소비).
 * 카드 클릭 → onSelect(id) → /content/:id.
 */
export interface DiscoveryGridProps {
  items: SearchContentItem[];
  onSelect: (id: string) => void;
}

export function DiscoveryGrid({ items, onSelect }: DiscoveryGridProps) {
  return (
    <section className={styles.section} aria-label="카테고리별 추천 컨텐츠">
      <h2 className={styles.title}>카테고리별 추천 컨텐츠</h2>
      <div className={styles.grid}>
        {items.map((item) => (
          <ContentCard key={item.id} model={item} onSelect={onSelect} />
        ))}
      </div>
    </section>
  );
}
