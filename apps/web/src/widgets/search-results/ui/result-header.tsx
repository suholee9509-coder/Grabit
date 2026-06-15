import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { SORT_OPTIONS, sortLabel } from '@/features/content-search';
import type { SearchSort } from '@/entities/content';
import styles from './result-header.module.css';

/**
 * ResultHeader — 결과 헤더. 측정: 2087:38900(결과) / 2087:40178(빈).
 *   좌: "'<쿼리>' 검색 결과"(24/700/130%/-2.5% #FAFAFA) + 카운트(24/400/130%/-2.5% #B4B4B4) gap8.
 *   우: 정렬 드롭다운(라벨 14/400/130%/-2% #B4B4B4 + 화살표14 gap2). space-between.
 * 따옴표 = ‘ ’(U+2018/U+2019 곡선). 정렬 드롭다운 = 보더리스 텍스트+화살표(프레임 정합) ·
 *   3옵션 패널([디자인공백] 파운데이션 패턴 — surface/shadow 토큰).
 */
export interface ResultHeaderProps {
  query: string;
  count: number;
  sort: SearchSort;
  onSortChange: (s: SearchSort) => void;
}

export function ResultHeader({ query, count, sort, onSortChange }: ResultHeaderProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 닫힘.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  return (
    <div className={styles.header}>
      <div className={styles.titleGroup}>
        <span className={styles.title}>{`‘${query}’ 검색 결과`}</span>
        <span className={styles.count}>{count}</span>
      </div>

      <div className={styles.sort} ref={wrapRef}>
        <button
          type="button"
          className={styles.sortTrigger}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span className={styles.sortLabel}>{sortLabel(sort)}</span>
          <ChevronDown className={styles.sortCaret} size={14} strokeWidth={1.8} aria-hidden />
        </button>
        {open ? (
          <ul className={styles.sortMenu} role="listbox" aria-label="정렬">
            {SORT_OPTIONS.map((o) => (
              <li key={o.id} role="option" aria-selected={o.id === sort}>
                <button
                  type="button"
                  className={[styles.sortItem, o.id === sort ? styles.sortItemActive : '']
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => {
                    onSortChange(o.id);
                    setOpen(false);
                  }}
                >
                  {o.label}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
