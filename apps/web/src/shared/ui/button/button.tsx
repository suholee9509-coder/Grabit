import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './button.module.css';

/**
 * Button — 실화면 측정 정밀(phase ②).
 * Primary = 네온 brand #66FF4B + 다크 글자(측정) · Secondary = 투명+rgba(white,.12) 보더+밝은 글자.
 * size medium=42px / small=38px(측정). shape pill=요금제 CTA(radius 100). compact=108px 페어(이전/다음).
 * Tertiary·disabled·hover는 실화면 부재 → 합리값(gap: status.md).
 */
export type ButtonVariant = 'primary' | 'secondary' | 'tertiary';
export type ButtonSize = 'small' | 'medium';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Resizing=Fill (full width) vs Hug (content). */
  fullWidth?: boolean;
  /** 이전/다음 페어 등 고정 108px 폭(측정). */
  compact?: boolean;
  /** 요금제 CTA 등 pill 형태(radius 100, 측정). */
  pill?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  compact = false,
  pill = false,
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
    compact ? styles.compact : '',
    pill ? styles.pill : '',
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
