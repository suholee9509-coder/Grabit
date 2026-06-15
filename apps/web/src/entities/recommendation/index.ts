/**
 * recommendation 엔티티 배럴 — 홈 취향관/피드 추천·트렌드 읽기 모델 + 쿼리 훅 + 카드 표현.
 * 콜드스타트 폴백(demo-seed)이 MVP 주 경로(E1: 신규 BE RPC ❌).
 * 카드는 router 의존 ❌ → onSelect(id) 콜백만(widget이 navigate 연결).
 */
export type {
  AuthorTone,
  AuthorBadge,
  RecCardModel,
  GridCardModel,
  CrossCardModel,
  GrabModel,
  StreamGrabModel,
  FieldTab,
  HeroFeature,
  RecommendationFeed,
  CrossTrendFeed,
  StreamFeed,
  TrendGridFeed,
  GrabFeed,
} from './model/types';

/** 피드 카테고리/분야 상수 SoT(칩·탭 카피). */
export {
  FEED_CATEGORIES,
  INTEREST_FIELDS,
  CROSS_FIELDS,
} from './model/feed-data';
export type {
  FeedCategoryId,
  InterestFieldId,
  CrossFieldId,
} from './model/feed-data';

/** 쿼리 훅. */
export {
  useHeroFeature,
  useRecommendationFeed,
  useCrossTrend,
  useInsightFeed,
  useStreamGrabs,
  useTrendGrid,
  useRealtimeGrabs,
  recommendationKeys,
} from './api/queries';
export { __setForceEmpty } from './api/feed-api';

/** 카드 표현 컴포넌트(onSelect 콜백만). */
export { RecCard, type RecCardProps } from './ui/rec-card';
export { GridCard, type GridCardProps } from './ui/grid-card';
export { CrossCard, type CrossCardProps } from './ui/cross-card';
export { GrabCard, type GrabCardProps } from './ui/grab-card';
export { StreamCard, type StreamCardProps } from './ui/stream-card';
export {
  CardSkeleton,
  SectionEmpty,
  SectionError,
  type CardSkeletonVariant,
} from './ui/card-states';
