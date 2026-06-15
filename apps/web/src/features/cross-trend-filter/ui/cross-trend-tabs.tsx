import { Tabs } from '@/shared/ui';
import type { CrossFieldId, FieldTab } from '@/entities/recommendation';
import styles from './cross-trend-tabs.module.css';

/**
 * CrossTrendTabs — 크로스 트렌드/인사이트 분야 전환 underline 탭(제어형, 재필터 트리거).
 * 측정 2087:69500 / 재필터 2278:136030. shared/ui Tabs(variant=underline) + 강조어 그린 span.
 * label = prefix + <span 그린>emphasis</span> + suffix (Tabs label은 ReactNode 가능).
 */
export interface CrossTrendTabsProps {
  tabs: FieldTab[];
  value: CrossFieldId;
  onChange: (value: CrossFieldId) => void;
}

export function CrossTrendTabs({ tabs, value, onChange }: CrossTrendTabsProps) {
  return (
    <Tabs
      variant="underline"
      className={styles.tabs}
      value={value}
      onValueChange={(id) => onChange(id as CrossFieldId)}
      items={tabs.map((t) => ({
        id: t.id,
        label: '',
        leading: (
          <span>
            {t.prefix}
            <span className={styles.emphasis}>{t.emphasis}</span>
            {t.suffix}
          </span>
        ),
      }))}
    />
  );
}
