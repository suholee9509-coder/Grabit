import { Chip } from '@/shared/ui';
import { SourceLogo, providerLabel, type SourceCount } from '@/entities/content';
import styles from './source-filter.module.css';

/**
 * SourceFilter — 출처(소스) 필터 탭+카운트. 측정: 2087:38907 row gap8 · 6칩.
 *   각 칩 = Chip variant="source" pill · leadingIcon=SourceLogo20 · count={n}
 *   (32h · pad10/12/10/10 · radius100 · ghost(.04)/border(.08) · 라벨14/500/130 · 카운트14/400/130).
 * 선택 토글: 같은 출처 재클릭 → 해제(전체). source 미적용 카운트(search_my_content_sources) 그대로.
 */
export interface SourceFilterProps {
  sources: SourceCount[];
  selected: string | null;
  onSelect: (provider: string | null) => void;
}

export function SourceFilter({ sources, selected, onSelect }: SourceFilterProps) {
  if (sources.length === 0) return null;
  return (
    <div className={styles.row} role="group" aria-label="출처 필터">
      {sources.map((s) => {
        const isSelected = selected === s.provider;
        return (
          <Chip
            key={s.provider}
            variant="source"
            pill
            selected={isSelected}
            leadingIcon={<SourceLogo provider={s.provider} size={20} />}
            count={s.count}
            onClick={() => onSelect(isSelected ? null : s.provider)}
          >
            {providerLabel(s.provider)}
          </Chip>
        );
      })}
    </div>
  );
}
