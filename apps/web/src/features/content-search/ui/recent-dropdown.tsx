import { Search, X } from 'lucide-react';
import styles from './recent-dropdown.module.css';

/**
 * RecentDropdown — 최근 검색어 패널([디자인공백] — 파운데이션 Dropdown 패턴 거울).
 * 프레임 미존재 → 검색바 surface/border/radius·드롭다운 shadow-overlay 토큰으로만 구성(신규 스타일 ❌).
 * 각 항목: 검색아이콘16 + 쿼리텍스트 + 우측 제거(X). XSS: React 텍스트 노드 escape.
 */
export interface RecentDropdownProps {
  items: string[];
  onSelect: (q: string) => void;
  onRemove: (q: string) => void;
  onPointerDownCapture?: () => void;
}

export function RecentDropdown({
  items,
  onSelect,
  onRemove,
  onPointerDownCapture,
}: RecentDropdownProps) {
  return (
    <ul
      className={styles.panel}
      role="listbox"
      aria-label="최근 검색어"
      onPointerDownCapture={onPointerDownCapture}
    >
      {items.map((q) => (
        <li key={q} role="option" aria-selected={false} className={styles.row}>
          <button type="button" className={styles.item} onClick={() => onSelect(q)}>
            <span className={styles.icon} aria-hidden="true">
              <Search size={16} strokeWidth={1.8} />
            </span>
            <span className={styles.text}>{q}</span>
          </button>
          <button
            type="button"
            className={styles.remove}
            aria-label={`${q} 최근 검색어 삭제`}
            onClick={() => onRemove(q)}
          >
            <X size={14} strokeWidth={1.8} />
          </button>
        </li>
      ))}
    </ul>
  );
}
