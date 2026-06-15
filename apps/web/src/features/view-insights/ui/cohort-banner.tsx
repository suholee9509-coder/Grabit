import { Avatar } from '@/shared/ui';
import styles from './cohort-banner.module.css';

/**
 * "이 컨텐츠를 [코호트]가 많이 봤어요" 배너 — 측정 2087:12538 §7.1.
 * 코호트 라벨 없으면(임계 미달) 미렌더. 칩 = 아바타 + 직군 라벨.
 */
export interface CohortBannerProps {
  /** 최상위 공개 코호트 라벨(예: "프로덕트 디자이너 3~5년차"). null이면 미렌더. */
  cohortLabel: string | null;
}

export function CohortBanner({ cohortLabel }: CohortBannerProps) {
  if (!cohortLabel) return null;
  return (
    <div className={styles.banner}>
      <span className={styles.text}>이 컨텐츠를</span>
      <span className={styles.chip}>
        <Avatar size="xs" initials={cohortLabel.slice(0, 1)} />
        <span className={styles.chipLabel}>{cohortLabel}</span>
      </span>
      <span className={styles.text}>가 많이 봤어요</span>
    </div>
  );
}
