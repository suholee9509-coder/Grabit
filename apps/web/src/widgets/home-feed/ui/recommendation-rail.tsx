import {
  GrabCard,
  CardSkeleton,
  SectionEmpty,
  SectionError,
  useRealtimeGrabs,
} from '@/entities/recommendation';
import styles from './recommendation-rail.module.css';

/**
 * RecommendationRail — 우측 추천 레일("내 취향에 맞는 실시간 그랩", 420). 측정 2087:71744.
 * E4 결정: u2 범위 포함(AI 패널·FAB와 별개). 데이터 = useRealtimeGrabs(콜드스타트 폴백).
 * 상단 "작성" 버튼은 시각만(u3/u6 진입은 별도 — 여기선 no-op 콜백).
 */
export interface RecommendationRailProps {
  onSelect?: (id: string) => void;
  /** "작성" 버튼(스코프 외 — 미연결 시 no-op). */
  onWrite?: () => void;
}

export function RecommendationRail({ onSelect, onWrite }: RecommendationRailProps) {
  const { data, isPending, isError, refetch } = useRealtimeGrabs();

  return (
    <aside className={styles.rail} aria-label="내 취향에 맞는 실시간 그랩">
      <div className={styles.top}>
        <h2 className={styles.title}>내 취향에 맞는 실시간 그랩</h2>
        <button type="button" className={styles.writeBtn} onClick={onWrite}>
          작성
        </button>
      </div>
      {isPending ? (
        <div className={styles.list}>
          <CardSkeleton variant="grab" />
        </div>
      ) : isError ? (
        <div className={styles.list}>
          <SectionError message="실시간 그랩을 불러오지 못했어요" onRetry={() => refetch()} />
        </div>
      ) : data.items.length === 0 ? (
        <div className={styles.list}>
          <SectionEmpty message="실시간 그랩이 아직 없어요" />
        </div>
      ) : (
        <div className={styles.list}>
          {data.items.map((m) => (
            <GrabCard key={m.id} model={m} onSelect={onSelect} />
          ))}
        </div>
      )}
    </aside>
  );
}
