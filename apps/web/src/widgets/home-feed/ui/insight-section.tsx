import { useState } from 'react';
import { CrossTrendTabs } from '@/features/cross-trend-filter';
import {
  CrossCard,
  CardSkeleton,
  SectionEmpty,
  SectionError,
  useInsightFeed,
  type CrossFieldId,
} from '@/entities/recommendation';
import styles from './insight-section.module.css';

/**
 * InsightSection — "현직자들의 인사이트"(피드). 측정 2087:73087.
 * 제목 + underline 탭(분야 전환) + CrossCard(인사이트 카드행). 크로스 트렌드와 동형.
 */
export interface InsightSectionProps {
  onSelect?: (id: string) => void;
}

export function InsightSection({ onSelect }: InsightSectionProps) {
  const [field, setField] = useState<CrossFieldId>('data');
  const { data, isPending, isError, refetch } = useInsightFeed(field);

  return (
    <section className={styles.section} aria-label="현직자들의 인사이트">
      <div className={styles.head}>
        <h2 className={styles.title}>현직자들의 인사이트</h2>
        {data ? <CrossTrendTabs tabs={data.tabs} value={field} onChange={setField} /> : null}
      </div>
      {isPending ? (
        <CardSkeleton variant="cross" />
      ) : isError ? (
        <SectionError message="콘텐츠를 불러오지 못했어요" onRetry={() => refetch()} />
      ) : data.items.length === 0 ? (
        <SectionEmpty message="이 분야 콘텐츠가 곧 추가돼요" />
      ) : (
        <div className={styles.carousel}>
          {data.items.map((m) => (
            <CrossCard key={m.id} model={m} onSelect={onSelect} />
          ))}
        </div>
      )}
    </section>
  );
}
