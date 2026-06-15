import styles from './tabs.module.css';

/**
 * Tabs — Figma 2562:7927 Tab/FilterTab/Item.
 * variant 'underline' = 홈 취향관↔피드 / 상세 시청정보↔원본소스(밑줄 인디케이터).
 * variant 'pill' = 필터 탭(선택 시 채움).
 */
export interface TabItem {
  id: string;
  label: string;
}

export interface TabsProps {
  items: TabItem[];
  value: string;
  onValueChange?: (id: string) => void;
  variant?: 'underline' | 'pill';
  className?: string;
}

export function Tabs({
  items,
  value,
  onValueChange,
  variant = 'underline',
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
