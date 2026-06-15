import { Fragment } from 'react';
import styles from './breadcrumb.module.css';

/**
 * Breadcrumb — 톱바 좌측 경로 셀렉트 박스. 측정 정준: 상세 톱바 2087:13114 layout_E6F9SQ.
 * 칩 = h26·pad6/8·radius6·gap2(칩 간) · 마지막 크럼 = 활성(★FD3 #FAFAFA), 나머지 = 비활성(#767676).
 * 구분자 '/' = rgba(255,255,255,0.16) SemiBold.
 * FSD widgets — shared만 의존(프리미티브 불필요, 토큰만).
 */
export interface BreadcrumbItem {
  id: string;
  label: string;
  onClick?: () => void;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav className={[styles.breadcrumb, className ?? ''].filter(Boolean).join(' ')} aria-label="현재 위치">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <Fragment key={item.id}>
            <button
              type="button"
              className={[styles.chip, isLast ? styles.active : styles.inactive].join(' ')}
              onClick={isLast ? undefined : item.onClick}
              aria-current={isLast ? 'page' : undefined}
              disabled={isLast}
            >
              {item.label}
            </button>
            {isLast ? null : (
              <span className={styles.separator} aria-hidden="true">
                /
              </span>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
