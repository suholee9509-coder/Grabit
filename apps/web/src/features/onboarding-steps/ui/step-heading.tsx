import styles from './step-heading.module.css';

/**
 * 온보딩 단계 헤딩 — 측정 2087:8699 외 (column gap 6):
 *   제목 36/600/130%/-2% #FAFAFA · 부제 16/400/160%/-2% #CECECE.
 * 부제 없는 단계(②연차 G4)는 subtitle 생략(추측 추가 ❌).
 */
export interface StepHeadingProps {
  title: string;
  subtitle?: string;
}

export function StepHeading({ title, subtitle }: StepHeadingProps) {
  return (
    <div className={styles.heading}>
      <h1 className={styles.title}>{title}</h1>
      {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
    </div>
  );
}
