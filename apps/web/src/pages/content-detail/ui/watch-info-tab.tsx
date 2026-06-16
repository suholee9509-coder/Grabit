import type { ContentDetail } from '@/entities/content';
import type { PublicClip } from '@/entities/clip';
import type { SimilarContentDto } from '@/shared/api';
import { SimilarContent } from '@/widgets/similar-content';
import {
  InsightCard,
  PopularSegments,
  topCohortChips,
  type TopCohortChips,
} from '@/features/view-insights';
import styles from './content-detail-page.module.css';

/** detail.cohortLabel(문자열) → 칩 분해 fallback("…년차" 접미 분리). */
function cohortFromLabel(label: string | null): TopCohortChips | null {
  if (!label) return null;
  const m = label.match(/^(.*?)\s*([~\d][\d~]*년차(?:\s*이상)?)$/);
  if (m) return { job: m[1].trim(), years: m[2].trim() };
  return { job: label.trim(), years: null };
}

/**
 * 시청 정보 탭 본문(디바이더 아래) — 측정 2087:12538 §7.
 *   분석 그룹: 코호트 배너 · 가장 인기있는 구간 · 인상깊게 본 인사이트 · 비슷한 컨텐츠.
 *   (플레이어·히트맵·메타·디바이더는 페이지 공통 헤더가 담당 — 두 탭 공유.)
 */
export interface WatchInfoTabProps {
  detail: ContentDetail;
  insights: PublicClip[];
  similar: SimilarContentDto[];
  loadingSimilar: boolean;
  onSeek: (startSec: number) => void;
  onSelectSimilar: (id: string) => void;
}

export function WatchInfoTab({
  detail,
  insights,
  similar,
  loadingSimilar,
  onSeek,
  onSelectSimilar,
}: WatchInfoTabProps) {
  const cohort = topCohortChips(insights) ?? cohortFromLabel(detail.cohortLabel);

  return (
    <div className={styles.analyticsGroup}>
      <PopularSegments
        clips={insights}
        cohort={cohort}
        onSeek={onSeek}
        thumbnailUrl={detail.thumbnailUrl}
      />

      <section className={styles.insightSection} aria-label="인상깊게 본 인사이트">
        <h2 className={styles.sectionTitle}>인상깊게 본 인사이트</h2>
        {insights.length === 0 ? (
          <p className={styles.empty}>아직 공유된 인사이트가 없어요.</p>
        ) : (
          <div className={styles.insightScroller}>
            <div className={styles.insightRow}>
              {insights.map((clip) => (
                <InsightCard
                  key={clip.clipId}
                  clip={clip}
                  channel={detail.channel ?? 'EO 채널'}
                  channelAvatar={detail.thumbnailUrl ?? undefined}
                  onSeek={onSeek}
                  likeCount={3}
                />
              ))}
            </div>
            <span className={styles.insightFade} aria-hidden="true" />
          </div>
        )}
      </section>

      <SimilarContent items={similar} onSelect={onSelectSimilar} loading={loadingSimilar} />
    </div>
  );
}
