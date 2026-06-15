import type { HTMLAttributes } from 'react';
import styles from './card.module.css';

/**
 * Card — 콘텐츠 카드 컨테이너(측정: overlay-white(0.04) surface · radius 12).
 *  - 기본 = 인사이트 카드 패딩 20(측정).
 *  - compact = 홈 가로 카드 패딩 18/14(측정).
 *  - flush = 라이브러리 그리드(컨테이너 투명·보더 없음, 측정).
 * interactive=hover 강조(hover 상태 미측정 → 합리값).
 */
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** 호버/포커스 강조(클릭 가능한 카드). */
  interactive?: boolean;
  /** 패딩 없는 미디어 카드(라이브러리 그리드, 컨테이너 투명). */
  flush?: boolean;
  /** 홈 가로 카드 패딩(18/14, 측정). */
  compact?: boolean;
}

export function Card({
  interactive = false,
  flush = false,
  compact = false,
  className,
  children,
  ...rest
}: CardProps) {
  const classes = [
    styles.card,
    interactive ? styles.interactive : '',
    flush ? styles.flush : '',
    compact ? styles.compact : '',
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
