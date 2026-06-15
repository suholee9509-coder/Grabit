/**
 * 검색 카드 도메인 모델 (u8) — `search_my_content` RPC(0012) 반환 행의 표현 셰이프.
 * ⚠ FSD: API 경계 타입은 shared/api/types(SearchRow·SourceCountRow)에 정의(shared가 entities 의존 ❌).
 *   entities/content는 그 DTO를 도메인 타입으로 재노출(하향 임포트 entities→shared 허용) → 단일 출처.
 *
 * 매핑(snake→camel)은 shared/api/search.ts가 수행:
 *   content_id→id · title→title · provider→provider · clip_count→clipCount(Number) ·
 *   tags→tags(본인 부착 태그) · last_clipped_at→lastClippedAt.
 * RPC는 SECURITY INVOKER + user_id pin → 본인 행만(user_id/실명 필드 부재 = no-leak).
 */
import type { SearchRow, SourceCountRow } from '@/shared/api';

/** 검색 결과/추천 카드 1행(= shared SearchRow 도메인 별칭). */
export type SearchContentItem = SearchRow;

/** provider별 결과 카운트(= shared SourceCountRow 도메인 별칭). */
export type SourceCount = SourceCountRow;

/** 정렬 키 — RPC `p_sort` 계약과 1:1(recent 기본/oldest/most_clips). */
export type SearchSort = 'recent' | 'oldest' | 'most_clips';
