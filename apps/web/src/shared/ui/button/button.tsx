import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './button.module.css';

/**
 * Button — Figma 컴포넌트 2562:7927 (Type=Primary/Secondary/Tertiary × State × Size × Resizing).
 * phase ① 스켈레톤: 구조 + 토큰 + 상태(기본/호버/비활성/포커스). 픽셀-퍼펙트 마감 = 사용자(phase ②).
 */
export type ButtonVariant = 'primary' | 'secondary' | 'tertiary';
export type ButtonSize = 'small' | 'medium';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Resizing=Fill (full width) vs Hug (content). */
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  leadingIcon,
  trailingIcon,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  const classes = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={classes} {...rest}>
      {leadingIcon ? <span className={styles.icon}>{leadingIcon}</span> : null}
      {children}
      {trailingIcon ? <span className={styles.icon}>{trailingIcon}</span> : null}
    </button>
  );
}
