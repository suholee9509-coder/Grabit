import { Textarea } from '@/shared/ui';
import styles from './clip-insight.module.css';

export interface ClipInsightProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * ClipInsight — "인사이트" 메모(측정 2087:35013). ★AI 요약 아님 — 사용자 직접 메모(spec L1-c).
 * u0c Textarea(mode lg) 재사용 + 콜아웃 고정 높이 174.
 */
export function ClipInsight({ value, onChange }: ClipInsightProps) {
  return (
    <div className={styles.root}>
      <span className={styles.label}>인사이트</span>
      <Textarea
        mode="lg"
        className={styles.memo}
        value={value}
        placeholder="이 클립을 저장한 이유나 떠오른 생각을 남겨 보세요."
        aria-label="인사이트 메모"
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
