import type { ReactNode } from 'react';
import styles from './badge.module.css';

/**
 * Badge — 실화면 측정 정밀(phase ②).
 *  - 기본(채움) = DS 'Tag' 폼팩터(측정: #2E2E2E·pad 4/10·radius 6·13/400/150%).
 *  - inline = 배경/패딩 0 인라인 라벨(측정: Premium #199E41·Pro #66FF4B + 아이콘).
 * tone: neutral·accent(브랜드 네온)·premium·pro·violet(#6D5DFF)·danger.
 * solid=채움 vs 기본(soft). inline=인라인 라벨 모드(아이콘 동반 가능).
 */
export type BadgeTone = 'neutral' | 'accent' | 'premium' | 'pro' | 'violet' | 'danger';

export interface BadgeProps {
  tone?: BadgeTone;
  /** Solid=True (강조 채움). */
  solid?: boolean;
  /** 인라인 라벨 모드(Premium/Pro 옆 텍스트 — 배경/패딩 없음). */
  inline?: boolean;
  /** inline 모드 선행 아이콘(번개 등). */
  icon?: ReactNode;
  children: ReactNode;
}

export function Badge({
  tone = 'neutral',
  solid = false,
  inline = false,
  icon,
  children,
}: BadgeProps) {
  const classes = [
    styles.badge,
    styles[tone],
    inline ? styles.inline : '',
    solid ? styles.solid : '',
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <span className={classes}>
      {inline && icon ? icon : null}
      {children}
    </span>
  );
}
