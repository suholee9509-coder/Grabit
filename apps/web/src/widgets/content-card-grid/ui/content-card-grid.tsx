import type { ReactNode } from 'react';
import type { LibraryCard } from '@/entities/content';
import { ContentCard } from './content-card';
import styles from './content-card-grid.module.css';

/**
 * ContentCardGrid — 컨텐츠 카드 그리드(2117:22165, 행당 5열 fill · h232 · row gap28 · 행간 gap24).
 * 순수 프레젠테이션. 빈/로딩/에러 슬롯은 상태별 분기(측정 프레임 부재 → u0c 파운데이션 표면).
 */
export interface ContentCardGridProps {
  cards: LibraryCard[];
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  /** 다중선택 모드. */
  selectable?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (contentId: string) => void;
  onOpen?: (contentId: string) => void;
  /** 빈 상태 표면(폴더0/컨텐츠0/폴더내0 컨텍스트별 — page 주입). */
  emptySlot?: ReactNode;
}

const SKELETON_COUNT = 10;

export function ContentCardGrid({
  cards,
  loading = false,
  error = false,
  onRetry,
  selectable = false,
  selectedIds,
  onToggleSelect,
  onOpen,
  emptySlot,
}: ContentCardGridProps) {
  if (loading) {
    return (
      <div className={styles.grid} aria-busy="true" aria-label="컨텐츠 불러오는 중">
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <div key={i} className={styles.skeletonCard}>
            <div className={styles.skeletonThumb} />
            <div className={styles.skeletonLine} />
            <div className={[styles.skeletonLine, styles.skeletonLineShort].join(' ')} />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.state} role="alert">
        <p className={styles.stateText}>컨텐츠를 불러오지 못했어요.</p>
        {onRetry ? (
          <button type="button" className={styles.retry} onClick={onRetry}>
            다시 시도
          </button>
        ) : null}
      </div>
    );
  }

  if (cards.length === 0) {
    return <>{emptySlot ?? <DefaultEmpty />}</>;
  }

  return (
    <div className={styles.grid} role="list">
      {cards.map((card) => (
        <div key={card.contentId} role="listitem" className={styles.cell}>
          <ContentCard
            card={card}
            selectable={selectable}
            selected={selectedIds?.has(card.contentId) ?? false}
            onToggleSelect={() => onToggleSelect?.(card.contentId)}
            onOpen={() => onOpen?.(card.contentId)}
          />
        </div>
      ))}
    </div>
  );
}

function DefaultEmpty() {
  return (
    <div className={styles.state}>
      <p className={styles.stateText}>아직 클립한 컨텐츠가 없어요.</p>
    </div>
  );
}
