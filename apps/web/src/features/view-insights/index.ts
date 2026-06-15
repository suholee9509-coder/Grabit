/**
 * features/view-insights 배럴 — 콘텐츠 상세 인사이트(공개 클립) 조회 훅 + 표현 컴포넌트.
 * ★ sanitized read(content_clips_public/content_heatmap)만 — raw clips 미쿼리, user_id/실명 부재.
 */
export {
  useContentInsights,
  useContentHeatmap,
  useContentDetail,
  useSimilarContent,
  contentDetailKeys,
} from './api/queries';
export {
  cohortLabel,
  topCohortLabel,
  deriveCohortRanking,
  yearsBucket,
  type CohortRank,
} from './model/cohort';
export { InsightCard } from './ui/insight-card';
export { CohortBanner } from './ui/cohort-banner';
export { PopularSegments } from './ui/popular-segments';
