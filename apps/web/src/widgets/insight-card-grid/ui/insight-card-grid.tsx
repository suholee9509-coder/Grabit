import type { ReactNode } from 'react';
import { SourceIcon, type InsightCard } from '@/entities/content';
import { sanitizeUserText } from '@/shared/lib';
import styles from './insight-card-grid.module.css';

/**
 * InsightCardGrid — 인사이트 카드 그리드(2117:24898, 2열 fill · row gap42 · col gap28).
 *   카드(column gap12): 썸네일 h142 r6 + [출처 아이콘20 + 제목 14/#B4B4B4] + 메모 발췌 14/160%/#FAFAFA(2줄).
 *   ⚠ 위계 반전: 제목 #B4B4B4(흐림) · 메모 #FAFAFA(강조) — 실측 그대로.
 * 순수 프레젠테이션. 빈/로딩/에러 = u0c 파운데이션 표면(측정 부재).
 */
export interface InsightCardGridProps {
  insights: InsightCard[];
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  onOpen?: (contentId: string) => void;
  emptySlot?: ReactNode;
}

const SKELETON_COUNT = 6;

export function InsightCardGrid({
  insights,
  loading = false,
  error = false,
  onRetry,
  onOpen,
  emptySlot,
}: InsightCardGridProps) {
  if (loading) {
    return (
      <div className={styles.grid} aria-busy="true" aria-label="인사이트 불러오는 중">
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <div key={i} className={styles.skeletonCard}>
            <div className={styles.skeletonThumb} />
            <div className={styles.skeletonLine} />
            <div className={styles.skeletonLine} />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.state} role="alert">
        <p className={styles.stateText}>인사이트를 불러오지 못했어요.</p>
        {onRetry ? (
          <button type="button" className={styles.retry} onClick={onRetry}>
            다시 시도
          </button>
        ) : null}
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <>
        {emptySlot ?? (
          <div className={styles.state}>
            <p className={styles.stateText}>아직 작성한 인사이트 메모가 없어요.</p>
          </div>
        )}
      </>
    );
  }

  return (
    <div className={styles.grid} role="list">
      {insights.map((ins) => (
        <button
          key={ins.contentId + ins.memoExcerpt.slice(0, 8)}
          type="button"
          className={styles.card}
          role="listitem"
          onClick={() => onOpen?.(ins.contentId)}
        >
          <div className={styles.thumb}>
            {ins.thumbnailUrl ? (
              <img className={styles.thumbImg} src={ins.thumbnailUrl} alt="" loading="lazy" />
            ) : (
              <span className={styles.thumbFallback} aria-hidden="true" />
            )}
          </div>
          <div className={styles.sourceRow}>
            <span className={styles.sourceIcon}>
              <SourceIcon provider={ins.provider} />
            </span>
            <p className={styles.title}>{sanitizeUserText(ins.title)}</p>
          </div>
          <p className={styles.memo}>{sanitizeUserText(ins.memoExcerpt)}</p>
        </button>
      ))}
    </div>
  );
}
