import { Search } from 'lucide-react';
import { Chip } from '@/shared/ui';
import { KEYWORD_CHIPS } from '@/features/content-search';
import styles from './keyword-chips.module.css';

/**
 * KeywordChips — 추천 키워드 칩 6개. 측정: 2087:40685 row gap8 · 각 칩 Chip variant="recommend"
 *   (32h · pad10/12/10/10 · radius100 · ghost(.04)/border(.08) · 14/500/130%/-2% #FAFAFA) · leadingIcon=검색16.
 * 클릭 → 해당 쿼리 검색(onSelect). 비-AI 정적 칩.
 */
export interface KeywordChipsProps {
  onSelect: (q: string) => void;
}

export function KeywordChips({ onSelect }: KeywordChipsProps) {
  return (
    <div className={styles.row}>
      {KEYWORD_CHIPS.map((kw) => (
        <Chip
          key={kw}
          variant="recommend"
          leadingIcon={<Search size={16} strokeWidth={1.8} aria-hidden />}
          onClick={() => onSelect(kw)}
        >
          {kw}
        </Chip>
      ))}
    </div>
  );
}
