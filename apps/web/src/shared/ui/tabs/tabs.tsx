import styles from './tabs.module.css';

/**
 * Tabs — 실화면 측정 정밀(phase ②).
 * variant 'segment' = 세그먼트 pill 컨트롤(측정 2087:12540: 선택 탭이 #363636 채움 pill).
 * variant 'underline' = 카테고리 밑줄 탭(측정 2087:11010: active #66FF4B 밑줄).
 */
export interface TabItem {
  id: string;
  label: string;
}

export interface TabsProps {
  items: TabItem[];
  value: string;
  onValueChange?: (id: string) => void;
  variant?: 'segment' | 'underline';
  className?: string;
}

export function Tabs({
  items,
  value,
  onValueChange,
  variant = 'segment',
  className,
}: TabsProps) {
  const classes = [styles.tabs, styles[variant], className ?? '']
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
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
