import type { TopCohortChips } from '../model/cohort';
import styles from './cohort-banner.module.css';

/**
 * "이 컨텐츠를 [직군칩][연차칩]가 많이 봤어요" 배너 — 측정 2087:12838.
 * ★ Figma = 직군칩 + 연차칩 2개 분리(각 h28 r4, .04bg + .08border, 아바타 없음).
 *   코호트 없으면(임계 미달) 미렌더. 인기있는 구간 좌 카드 헤더로 배치(2패널 §C3).
 */
export interface CohortBannerProps {
  /** 최상위 공개 코호트 칩 분해({job, years}). null이면 미렌더. */
  cohort: TopCohortChips | null;
}

export function CohortBanner({ cohort }: CohortBannerProps) {
  if (!cohort) return null;
  return (
    <div className={styles.banner}>
      <span className={styles.text}>이 컨텐츠를</span>
      <span className={styles.chip}>{cohort.job}</span>
      {cohort.years ? <span className={styles.chip}>{cohort.years}</span> : null}
      <span className={styles.text}>가 많이 봤어요</span>
    </div>
  );
}
