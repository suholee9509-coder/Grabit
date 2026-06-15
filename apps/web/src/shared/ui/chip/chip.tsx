import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './chip.module.css';

/**
 * Chip — Figma 2562:7927 (Selected=True/False). pill 형태.
 * 온보딩 직업/연차/관심분야 칩 + 홈 카테고리 필터 칩에 쓰임.
 */
export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  leadingIcon?: ReactNode;
}

export function Chip({
  selected = false,
  leadingIcon,
  className,
  children,
  type = 'button',
  ...rest
}: ChipProps) {
  const classes = [styles.chip, selected ? styles.selected : '', className ?? '']
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={classes} aria-pressed={selected} {...rest}>
      {leadingIcon ? <span className={styles.icon}>{leadingIcon}</span> : null}
      {children}
    </button>
  );
}
