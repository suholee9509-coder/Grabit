import styles from './stepper.module.css';

/**
 * Stepper — 온보딩 진행 인디케이터 (실화면 측정 정밀, phase ③ u0c).
 *   Figma 2087:8488: row · gap 4 · hug, 세그먼트 4개 각 40×4 radius100.
 *   active #66FF4B(brand-primary) / inactive #434343(stepper-inactive).
 *   진행 = current개의 선행 세그먼트가 active(1/4~4/4 = 2087:8489~8492 상태 전수).
 * props: total(세그먼트 수, 기본 4) · current(active 개수).
 */
export interface StepperProps {
  /** 전체 세그먼트 수 (측정 기본 = 4). */
  total?: number;
  /** 현재 단계 = active 세그먼트 개수 (1-기반; 0 = 전부 inactive). */
  current: number;
  'aria-label'?: string;
}

export function Stepper({ total = 4, current, 'aria-label': ariaLabel }: StepperProps) {
  const count = Math.max(0, total);
  const active = Math.min(Math.max(0, current), count);

  return (
    <div
      className={styles.stepper}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={count}
      aria-valuenow={active}
      aria-label={ariaLabel}
    >
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className={[styles.segment, i < active ? styles.active : ''].filter(Boolean).join(' ')}
        />
      ))}
    </div>
  );
}
