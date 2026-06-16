import { useState } from 'react';
import { InterestChipRow } from '@/features/interest-chip-row';
import {
  RecCard,
  GridCard,
  CardSkeleton,
  SectionEmpty,
  SectionError,
  useRecommendationFeed,
  useTrendGrid,
  type InterestFieldId,
} from '@/entities/recommendation';
import { useMyProfileJob } from '@/entities/profile';
import { HeroCarousel } from './hero-carousel';
import { CrossTrendSection } from './cross-trend-section';
import styles from './feed-tab-default.module.css';

/**
 * FeedTabDefault — "취향관" 탭 본문. 측정: 취향관 2087:69031 / 풀스크롤 2087:70384.
 * 히어로 + 관심분야 칩행(재필터) + 추천 캐러셀(내 직군 라벨) + 직군별 크로스 트렌드 + 분야별 트렌드 그리드.
 * 관심분야 칩 선택 → 추천 캐러셀 재필터(queryKey 변경, L1-d). onSelect → 카드 → navigate(상위 주입).
 * 분야별 트렌드 그리드(2087:71184/69678): 콜드스타트 폴백 = useTrendGrid('all')(취향관은 카테고리 칩 없음 → 전체).
 */
export interface FeedTabDefaultProps {
  onSelect?: (id: string) => void;
}

export function FeedTabDefault({ onSelect }: FeedTabDefaultProps) {
  const [field, setField] = useState<InterestFieldId>('mine');
  const { data: jobData } = useMyProfileJob();
  const job = jobData?.job ?? '내 직군';
  const { data, isPending, isError, refetch } = useRecommendationFeed(job, field);
  const grid = useTrendGrid('all');

  return (
    <div className={styles.tab}>
      <HeroCarousel variant="default" />

      <div className={styles.chipRow}>
        <InterestChipRow value={field} onChange={setField} />
      </div>

      <section className={styles.recSection} aria-label="추천 컨텐츠">
        <h2 className={styles.recTitle}>{data?.title ?? `${job}이 많이 본 컨텐츠`}</h2>
        {isPending ? (
          <CardSkeleton variant="rec" />
        ) : isError ? (
          <SectionError message="추천을 불러오지 못했어요" onRetry={() => refetch()} />
        ) : data.items.length === 0 ? (
          <SectionEmpty message="아직 추천이 없어요. 관심분야를 추가하면 더 잘 맞는 그랩을 추천해드려요." />
        ) : (
          <div className={styles.recCarousel}>
            {data.items.map((m) => (
              <RecCard key={m.id} model={m} onSelect={onSelect} />
            ))}
          </div>
        )}
      </section>

      <div className={styles.group}>
        <CrossTrendSection onSelect={onSelect} />
      </div>

      {/* 분야별 트렌드 그리드 — 측정 2087:71184(70384) / 2087:69678(69031). 4행×N열 wrap. */}
      <section className={styles.gridSection} aria-label="분야별 트렌드">
        <h2 className={styles.gridTitle}>분야별 트렌드</h2>
        {grid.isPending ? (
          <CardSkeleton variant="grid" />
        ) : grid.isError ? (
          <SectionError message="분야별 트렌드를 불러오지 못했어요" onRetry={() => grid.refetch()} />
        ) : grid.data.items.length === 0 ? (
          <SectionEmpty message="이 분야의 트렌드가 곧 추가돼요" />
        ) : (
          <div className={styles.group}>
            <div className={styles.gridWrap}>
              {grid.data.items.map((m) => (
                <GridCard key={m.id} model={m} onSelect={onSelect} />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
