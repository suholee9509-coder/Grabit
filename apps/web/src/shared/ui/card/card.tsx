import type { HTMLAttributes } from 'react';
import styles from './card.module.css';

/**
 * Card — 콘텐츠 카드 컨테이너(홈 피드/라이브러리 그리드의 surface 래퍼).
 * Figma: surface(Dark-Gray-100) + stroke + radius. interactive=hover 상태 토글.
 */
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** 호버/포커스 강조(클릭 가능한 카드). */
  interactive?: boolean;
  /** 패딩 없는 미디어 카드(썸네일 풀블리드)용. */
  flush?: boolean;
}

export function Card({
  interactive = false,
  flush = false,
  className,
  children,
  ...rest
}: CardProps) {
  const classes = [
    styles.card,
    interactive ? styles.interactive : '',
    flush ? styles.flush : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}
