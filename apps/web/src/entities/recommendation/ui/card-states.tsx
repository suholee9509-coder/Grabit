import type { ReactNode } from 'react';
import { Button } from '@/shared/ui';
import styles from './card-states.module.css';

/**
 * 카드 상태 프리미티브 — 섹션 공용 로딩/빈/에러. 디자인 공백 → 파운데이션 토큰만.
 * 각 섹션 독립(한 섹션 에러가 전체를 죽이지 않음).
 */
export type CardSkeletonVariant = 'rec' | 'grid' | 'cross' | 'grab' | 'stream';

const COUNT: Record<CardSkeletonVariant, number> = {
  rec: 4,
  grid: 3,
  cross: 4,
  grab: 3,
  stream: 3,
};

export interface CardSkeletonProps {
  variant: CardSkeletonVariant;
  /** 표시 개수(기본 = 변형별 권장). */
  count?: number;
}

export function CardSkeleton({ variant, count }: CardSkeletonProps) {
  const n = count ?? COUNT[variant];
  return (
    <div className={styles.skeletonRow} aria-hidden="true" data-testid={`skeleton-${variant}`}>
      {Array.from({ length: n }).map((_, i) => (
        <span key={i} className={[styles.skeleton, styles[variant]].join(' ')} />
      ))}
    </div>
  );
}

export interface SectionEmptyProps {
  message: string;
  cta?: ReactNode;
}

export function SectionEmpty({ message, cta }: SectionEmptyProps) {
  return (
    <div className={styles.empty} role="status">
      <span>{message}</span>
      {cta}
    </div>
  );
}

export interface SectionErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function SectionError({
  message = '콘텐츠를 불러오지 못했어요',
  onRetry,
}: SectionErrorProps) {
  return (
    <div className={styles.error} role="alert">
      <span className={styles.errorMsg}>{message}</span>
      {onRetry ? (
        <Button variant="secondary" size="md" onClick={onRetry}>
          다시 시도
        </Button>
      ) : null}
    </div>
  );
}
