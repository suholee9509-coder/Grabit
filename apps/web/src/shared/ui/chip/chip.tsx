import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './chip.module.css';

/**
 * Chip — 실화면 측정 정밀(phase ②).
 * default(온보딩 직업/관심분야): 투명+rgba(white,.12) 보더+흰 글자·42h·radius 6(★pill 아님, 측정 정정).
 * recommend(검색 추천칩): surface-ghost·32h·radius pill(측정).
 * ⚠ selected 채움 상태는 실화면 정적 export 부재 → 미측정(브랜드 보더로 표시, gap).
 */
export type ChipVariant = 'default' | 'recommend';

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ChipVariant;
  selected?: boolean;
  leadingIcon?: ReactNode;
}

export function Chip({
  variant = 'default',
  selected = false,
  leadingIcon,
  className,
  children,
  type = 'button',
  ...rest
}: ChipProps) {
  const classes = [
    styles.chip,
    variant === 'recommend' ? styles.recommend : '',
    selected ? styles.selected : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={classes} aria-pressed={selected} {...rest}>
      {leadingIcon ? <span className={styles.icon}>{leadingIcon}</span> : null}
      {children}
    </button>
  );
}
