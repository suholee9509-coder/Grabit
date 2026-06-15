import type { ReactNode } from 'react';
import styles from './badge.module.css';

/**
 * Badge — 라벨/카운트/Pro 배지. Figma 2562:7927 (Solid=True/False).
 * tone: neutral·accent(그린)·pro(보라 fill_7M6ZZP #6D5DFF)·danger.
 * solid=채움 vs soft(false)=연한 배경.
 */
export type BadgeTone = 'neutral' | 'accent' | 'pro' | 'danger';

export interface BadgeProps {
  tone?: BadgeTone;
  /** Solid=True (채움) vs False (soft). */
  solid?: boolean;
  children: ReactNode;
}

export function Badge({ tone = 'neutral', solid = false, children }: BadgeProps) {
  const classes = [styles.badge, styles[tone], solid ? styles.solid : styles.soft]
    .filter(Boolean)
    .join(' ');
  return <span className={classes}>{children}</span>;
}
