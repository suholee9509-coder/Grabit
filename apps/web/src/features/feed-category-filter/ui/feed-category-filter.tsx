import { Chip } from '@/shared/ui';
import { FEED_CATEGORIES, type FeedCategoryId } from '@/entities/recommendation';
import styles from './feed-category-filter.module.css';

/**
 * FeedCategoryFilter — 피드 카테고리 칩 행(제어형). 측정 2087:71870~71884.
 * shared/ui Chip(variant=filter) + selected. 기본=전체.
 * 선택 #FAFAFA/#111111/600 · 비선택 .06/#B4B4B4/400(컴포넌트 실측 확정값 보유).
 */
export interface FeedCategoryFilterProps {
  value: FeedCategoryId;
  onChange: (value: FeedCategoryId) => void;
}

export function FeedCategoryFilter({ value, onChange }: FeedCategoryFilterProps) {
  return (
    <div className={styles.row} role="group" aria-label="카테고리 필터">
      {FEED_CATEGORIES.map((c) => (
        <Chip
          key={c.id}
          variant="filter"
          selected={value === c.id}
          onClick={() => onChange(c.id)}
        >
          {c.label}
        </Chip>
      ))}
    </div>
  );
}
