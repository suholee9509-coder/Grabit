import { Dropdown, type DropdownItem } from '@/shared/ui';
import type { LibrarySort } from '@/shared/api';
import styles from './sort-library.module.css';

/**
 * SortLibrary — 정렬 드롭다운(u0c Dropdown). 측정 텍스트 불명 → 기획 §5.1.1 옵션으로 채움.
 *   최신순(recent) / 오래된순(oldest) / 클립 많은 순(most_clips).
 */
export interface SortLibraryProps {
  value: LibrarySort;
  onChange: (sort: LibrarySort) => void;
}

const ITEMS: DropdownItem[] = [
  { id: 'recent', label: '최신순' },
  { id: 'oldest', label: '오래된순' },
  { id: 'most_clips', label: '클립 많은 순' },
];

const LABELS: Record<LibrarySort, string> = {
  recent: '최신순',
  oldest: '오래된순',
  most_clips: '클립 많은 순',
};

export function SortLibrary({ value, onChange }: SortLibraryProps) {
  return (
    <Dropdown
      className={styles.dropdown}
      trigger={<span className={styles.triggerLabel}>{LABELS[value]}</span>}
      items={ITEMS}
      value={value}
      onSelect={(id) => onChange(id as LibrarySort)}
    />
  );
}
