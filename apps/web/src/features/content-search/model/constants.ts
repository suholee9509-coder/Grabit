import type { SearchSort } from '@/entities/content';

/**
 * 검색 정적 상수 (비-AI · 결정론). 프레임 카피 그대로.
 *   KEYWORD_CHIPS: 추천 키워드 칩 6개(2087:40685) · SEARCH_CATEGORIES: 카테고리 13개(2557:7614) ·
 *   SORT_OPTIONS: 정렬 3옵션(RPC 계약 recent/oldest/most_clips · "최신순"만 프레임 명시 → 2건 [디자인공백]).
 */

/** 추천 키워드 칩 — 클릭 시 해당 쿼리 검색. 프레임 카피(2087:40688~40703). */
export const KEYWORD_CHIPS: readonly string[] = [
  'AI 활용법',
  '시간 관리',
  'AI 업계 소식',
  '커리어 전환',
  '실리콘밸리',
  '창업 스토리',
];

/** 카테고리(전체 + 12) — 클릭 시 카테고리 필터. 프레임 카피(2557:7616~7640 · 13항목). */
export const SEARCH_CATEGORIES: readonly string[] = [
  '전체',
  '면접 · 자소서',
  '포트폴리오',
  '프로덕트 · 서비스 기획',
  '디자인',
  '프로그래밍',
  '커리어',
  '리더십',
  '협업 · 커뮤니케이션',
  '마케팅 · 그로스',
  '업무 생산성',
  '마인드셋',
  '창업 · 스타트업',
];

/** "전체" 카테고리 라벨(필터 미적용 sentinel). */
export const CATEGORY_ALL = '전체';

/** 정렬 옵션 — 라벨↔RPC sort 키 1:1. "최신순"=프레임 명시 · 2건=[디자인공백] 기획 §5.1. */
export interface SortOption {
  id: SearchSort;
  label: string;
}
export const SORT_OPTIONS: readonly SortOption[] = [
  { id: 'recent', label: '최신순' },
  { id: 'oldest', label: '오래된순' },
  { id: 'most_clips', label: '클립많은순' },
];

/** sort 키 → 라벨(드롭다운 트리거 표시용). */
export function sortLabel(sort: SearchSort): string {
  return SORT_OPTIONS.find((o) => o.id === sort)?.label ?? '최신순';
}
