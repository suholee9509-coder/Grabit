import { useState } from 'react';
import {
  GrabCard,
  CardSkeleton,
  SectionEmpty,
  SectionError,
  useRealtimeGrabs,
} from '@/entities/recommendation';
import styles from './recommendation-rail.module.css';

/**
 * RecommendationRail — 우측 추천 레일("내 취향에 맞는 실시간 그랩").
 *   펼침(2087:71744): 420×1108 패널 — 헤더행(56h, 접힘토글 2087:71747 + 작성 버튼) + 제목 + GrabCard 리스트 + 하단 페이드.
 *   접힘(2087:70377): 40×1080 엣지 바 — 중앙 펼침 화살표(24×24). r8/0/0/8.
 * u4 social-sidebar 토글 패턴 이식: collapsed useState + 토글 핸들러. 기본 = 펼침.
 * E4 결정: u2 범위 포함(AI 패널·FAB와 별개 — AI Sparkle FAB는 게이트ⓐ 제외, 미구현).
 * 데이터 = useRealtimeGrabs(콜드스타트 폴백). "작성" 버튼은 시각만(no-op 콜백).
 */
export interface RecommendationRailProps {
  onSelect?: (id: string) => void;
  /** "작성" 버튼(스코프 외 — 미연결 시 no-op). */
  onWrite?: () => void;
}

/** 헤더 접힘 토글 아이콘(layout-right-18px, 2087:71748) — 측정 20×20. */
function CollapseIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2" y="3" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M13 3v14" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

/** 접힘 엣지 바 펼침 화살표(아이콘_화살표, 2087:70378) — 측정 24×24, fill #B4B4B4. */
function ExpandArrowIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M14 6l-6 6 6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function RecommendationRail({ onSelect, onWrite }: RecommendationRailProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { data, isPending, isError, refetch } = useRealtimeGrabs();

  if (collapsed) {
    return (
      <aside
        className={[styles.rail, styles.collapsed].join(' ')}
        aria-label="내 취향에 맞는 실시간 그랩(접힘)"
      >
        <button
          type="button"
          className={styles.edgeToggle}
          aria-label="추천 레일 펼치기"
          aria-expanded={false}
          onClick={() => setCollapsed(false)}
        >
          <ExpandArrowIcon />
        </button>
      </aside>
    );
  }

  return (
    <aside className={styles.rail} aria-label="내 취향에 맞는 실시간 그랩">
      <div className={styles.header}>
        <button
          type="button"
          className={styles.collapseToggle}
          aria-label="추천 레일 접기"
          aria-expanded
          onClick={() => setCollapsed(true)}
        >
          <CollapseIcon />
        </button>
        <button type="button" className={styles.writeBtn} onClick={onWrite}>
          작성
        </button>
      </div>

      <h2 className={styles.title}>내 취향에 맞는 실시간 그랩</h2>

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

      <div className={styles.bottomFade} aria-hidden="true" />
    </aside>
  );
}
