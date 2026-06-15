import type { ReactNode } from 'react';
import styles from './tabs.module.css';

/**
 * Tabs — 실화면 측정 정밀(phase ③ u0c 충실도).
 * variant 'segment' = 세그먼트 pill 컨트롤. size=sm(13·ghost bg, 라이브러리/대시보드/상세)
 *   / lg(15·#1B1B1B bg, 홈 1차 내비 2173:124313). 선택 탭 #363636 채움 pill.
 * variant 'underline' = 밑줄 인디케이터 탭(상세 사이드바 2557:23067). ★FD3: active 흰 #FAFAFA
 *   글자+밑줄 2px(네온 제거). inactive #B4B4B4. 카운트(trailing) 16/400/#B4B4B4.
 * variant 'list' = 검색 카테고리 세로 텍스트탭(2557:7615/7617). 선택=색(#FAFAFA)+굵기(500)만.
 * leading/trailing = Figma 슬롯(segment 아이콘 gap4 · underline 아이콘/카운트 · list 아이콘 gap10).
 */
export interface TabItem {
  id: string;
  label: string;
  /** 측정: leading 슬롯 — segment/list 아이콘(16×16/gap4·10), underline 아이콘(20). */
  leading?: ReactNode;
  /** 측정: trailing 슬롯 — underline 카운트 텍스트("16" 16/400/#B4B4B4). */
  trailing?: ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  value: string;
  onValueChange?: (id: string) => void;
  variant?: 'segment' | 'underline' | 'list';
  /** 측정: segment 두 사이즈 분기 — sm(13, 기본) / lg(15, 홈 1차 내비). underline/list엔 무영향. */
  size?: 'sm' | 'lg';
  className?: string;
}

export function Tabs({
  items,
  value,
  onValueChange,
  variant = 'segment',
  size = 'sm',
  className,
}: TabsProps) {
  const classes = [
    styles.tabs,
    styles[variant],
    size === 'lg' ? styles.lg : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} role="tablist">
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            className={[styles.tab, active ? styles.active : ''].filter(Boolean).join(' ')}
            onClick={() => onValueChange?.(item.id)}
          >
            {item.leading}
            {item.label}
            {item.trailing}
          </button>
        );
      })}
    </div>
  );
}
