import { Fragment, useState } from 'react';
import { FeedCategoryFilter } from '@/features/feed-category-filter';
import {
  StreamCard,
  GridCard,
  CardSkeleton,
  SectionEmpty,
  SectionError,
  useStreamGrabs,
  useTrendGrid,
  type FeedCategoryId,
} from '@/entities/recommendation';
import { HeroCarousel } from './hero-carousel';
import { InsightSection } from './insight-section';
import styles from './feed-tab-stream.module.css';

/**
 * FeedTabStream — "피드" 탭 본문. 측정: 피드 2087:71867.
 * 카테고리 칩행(필터) + 히어로(EO Korea) + 실시간 인기 그랩 + 현직자 인사이트 + 분야별 트렌드 그리드.
 * 카테고리 선택 → 그랩/그리드 재필터(queryKey 변경, L1-c). 기본=전체.
 */
export interface FeedTabStreamProps {
  onSelect?: (id: string) => void;
}

export function FeedTabStream({ onSelect }: FeedTabStreamProps) {
  const [category, setCategory] = useState<FeedCategoryId>('all');
  const stream = useStreamGrabs(category);
  const grid = useTrendGrid(category);

  return (
    <div className={styles.tab}>
      <div className={styles.chipRow}>
        <FeedCategoryFilter value={category} onChange={setCategory} />
      </div>

      <HeroCarousel variant="stream" />

      {/* 실시간 인기 그랩 */}
      <section className={styles.section} aria-label="실시간 인기 그랩">
        <h2 className={styles.title}>실시간 인기 그랩</h2>
        {stream.isPending ? (
          <CardSkeleton variant="stream" />
        ) : stream.isError ? (
          <SectionError message="실시간 인기 그랩을 불러오지 못했어요" onRetry={() => stream.refetch()} />
        ) : stream.data.items.length === 0 ? (
          <SectionEmpty message="이 분야의 인기 그랩이 곧 추가돼요" />
        ) : (
          <div className={styles.streamRow}>
            {stream.data.items.map((m, i) => (
              <Fragment key={m.id}>
                {i > 0 ? <span className={styles.streamDivider} aria-hidden="true" /> : null}
                <StreamCard model={m} onSelect={onSelect} />
              </Fragment>
            ))}
          </div>
        )}
      </section>

      {/* 현직자들의 인사이트 */}
      <div className={styles.group}>
        <InsightSection onSelect={onSelect} />
      </div>

      {/* 분야별 트렌드 그리드 */}
      <section className={styles.section} aria-label="분야별 트렌드">
        <h2 className={styles.title}>분야별 트렌드</h2>
        {grid.isPending ? (
          <CardSkeleton variant="grid" />
        ) : grid.isError ? (
          <SectionError message="분야별 트렌드를 불러오지 못했어요" onRetry={() => grid.refetch()} />
        ) : grid.data.items.length === 0 ? (
          <SectionEmpty message="이 분야의 트렌드가 곧 추가돼요" />
        ) : (
          <div className={styles.group}>
            <div className={styles.gridRow}>
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
