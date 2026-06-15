import styles from './grid-skeleton.module.css';

/**
 * GridSkeleton — 로딩 스켈레톤([디자인공백] 파운데이션 패턴). ContentCard 형태(썸네일142h + 제목 + 메타) 4열.
 *   surface 토큰 면만 사용(신규 스타일 ❌). entities/recommendation CardSkeleton cross-slice ❌ → 자체.
 */
export function GridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className={styles.grid} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={styles.card}>
          <div className={styles.thumb} />
          <div className={styles.line} />
          <div className={[styles.line, styles.lineShort].join(' ')} />
        </div>
      ))}
    </div>
  );
}
