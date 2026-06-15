import { useState } from 'react';
import { CrossTrendTabs } from '@/features/cross-trend-filter';
import {
  CrossCard,
  CardSkeleton,
  SectionEmpty,
  SectionError,
  useCrossTrend,
  type CrossFieldId,
} from '@/entities/recommendation';
import styles from './cross-trend-section.module.css';

/**
 * CrossTrendSection — "직군별 크로스 트렌드"(취향관). 측정 2087:69497 / 재필터 2278:136026.
 * 제목 + underline 탭(분야 재필터) + CrossCard 캐러셀. 탭 선택 → queryKey 변경 → 재필터.
 * onSelect = 카드 클릭 → widget이 navigate 연결(상위에서 주입).
 */
export interface CrossTrendSectionProps {
  onSelect?: (id: string) => void;
}

export function CrossTrendSection({ onSelect }: CrossTrendSectionProps) {
  const [field, setField] = useState<CrossFieldId>('data');
  const { data, isPending, isError, refetch } = useCrossTrend(field);

  return (
    <section className={styles.section} aria-label="직군별 크로스 트렌드">
      <div className={styles.head}>
        <h2 className={styles.title}>직군별 크로스 트렌드</h2>
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
