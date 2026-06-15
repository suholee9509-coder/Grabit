/**
 * 피드 카테고리/분야 상수 SoT — 칩/탭 카피 정본.
 * 측정 정본: 피드 카테고리 칩(2087:71870~71884) · 취향관 관심분야 칩(2173:120904).
 * 이 모듈은 표현 상수만 보유(데이터 fetch ❌ — recommendation 엔티티 소관).
 */

/** 피드 탭 카테고리 칩(고정 — 측정 순서: 전체/AI/기획/UXUI 디자인/프론트엔드/백엔드/마케팅). */
export const FEED_CATEGORIES = [
  { id: 'all', label: '전체' },
  { id: 'ai', label: 'AI' },
  { id: 'planning', label: '기획' },
  { id: 'uxui', label: 'UXUI 디자인' },
  { id: 'frontend', label: '프론트엔드' },
  { id: 'backend', label: '백엔드' },
  { id: 'marketing', label: '마케팅' },
] as const;

export type FeedCategoryId = (typeof FEED_CATEGORIES)[number]['id'];

/** 취향관 관심분야 아바타 칩(측정 카피 순서). "분야 추가"는 정적(별도 마크업). */
export const INTEREST_FIELDS = [
  { id: 'mine', label: '내 분야' },
  { id: 'programming', label: '프로그래밍' },
  { id: 'uxui', label: 'UXUI 디자인' },
  { id: 'productivity', label: '업무 생산성' },
  { id: 'planning', label: 'IT 기획' },
  { id: 'leadership', label: '리더십' },
  { id: 'collaboration', label: '협업' },
] as const;

export type InterestFieldId = (typeof INTEREST_FIELDS)[number]['id'];

/** 크로스 트렌드/인사이트 분야 전환 키(measure: 데이터 사이언스/프론트엔드/마케팅). */
export const CROSS_FIELDS = ['data', 'frontend', 'marketing'] as const;
export type CrossFieldId = (typeof CROSS_FIELDS)[number];
