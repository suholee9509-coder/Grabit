import type { ReactNode } from 'react';
import { Chip } from '@/shared/ui';
import styles from './chip-grid.module.css';

/**
 * 칩 그리드 — 온보딩 칩 목록 (측정 2087:8476 외: row wrap · gap 14 · align start).
 * 직업/연차/목표(단일)·관심분야(복수) 공용. width는 페이지가 지정(직업 609 / 그 외 642).
 * 칩 = u0c Chip default(selected = 브랜드 보더 강조 — u0c 결정 재사용, 추측 ❌).
 */
export interface ChipGridProps {
  options: readonly string[];
  /** 선택 판정. */
  isSelected: (value: string) => boolean;
  /** 칩 클릭(선택/토글). */
  onSelect: (value: string) => void;
  /** 칩 비활성 판정(예: 관심분야 5개 도달 시 미선택 칩 — 시각적 차단). 선택된 칩은 항상 활성. */
  isDisabled?: (value: string) => boolean;
  /** 그리드 폭(px) — 측정: 직업 609 / 연차·관심·목표 642. */
  width: number;
  children?: ReactNode;
}

export function ChipGrid({
  options,
  isSelected,
  onSelect,
  isDisabled,
  width,
}: ChipGridProps) {
  return (
    <div className={styles.grid} style={{ width }}>
      {options.map((opt) => {
        const selected = isSelected(opt);
        const disabled = !selected && (isDisabled?.(opt) ?? false);
        return (
          <Chip
            key={opt}
            variant="default"
            selected={selected}
            disabled={disabled}
            onClick={() => onSelect(opt)}
            data-testid={`chip-${opt}`}
          >
            {opt}
          </Chip>
        );
      })}
    </div>
  );
}
