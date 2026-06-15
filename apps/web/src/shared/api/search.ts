import { getSupabaseClient, type SupabaseClient } from './supabase';
import type { SearchRow, SourceCountRow } from './types';
import {
  demoSearchMyContent,
  demoSearchSources,
  type DemoSearchArgs,
} from './demo-search';

/**
 * 검색 RPC 래퍼(0012 — FE는 호출만, 변경 ❌). ingest-clip.ts 거울.
 *   searchMyContent → rpc('search_my_content', {p_query,p_category,p_source,p_sort}) → camel.
 *   searchMyContentSources → rpc('search_my_content_sources', {p_query,p_category}) → camel.
 * client null(미구성/테스트) → demo-search 결정론 폴백(isSupabaseReady 분기와 동치).
 * 인젝션: query는 RPC 인자로만 전달(0012가 websearch 파서·바인드 ILIKE로 무해화) — FE 결합 ❌.
 * 본인 행만: RPC가 user_id pin → FE는 user 필터 미전송.
 */

/** search_my_content 1행 raw(snake) → SearchRow(camel). */
function toSearchRow(row: Record<string, unknown>): SearchRow {
  return {
    id: String(row.content_id ?? ''),
    title: (row.title as string | null) ?? '',
    provider: (row.provider as string | null) ?? '',
    clipCount: Number(row.clip_count ?? 0),
    tags: Array.isArray(row.tags) ? (row.tags as unknown[]).map(String) : [],
    lastClippedAt: (row.last_clipped_at as string | null) ?? null,
    thumbnailUrl: (row.thumbnail_url as string | null) ?? null,
  };
}

/** search_my_content_sources 1행 raw(snake) → SourceCountRow(camel). */
function toSourceCount(row: Record<string, unknown>): SourceCountRow {
  return {
    provider: (row.provider as string | null) ?? '',
    count: Number(row.content_count ?? 0),
  };
}

export interface SearchContentArgs {
  query: string;
  category?: string | null;
  source?: string | null;
  sort?: string;
}

/** 본인 클립 컨텐츠 통합검색(그리드 행). 빈/공백 query → 빈 결과(RPC가 보장). */
export async function searchMyContent(
  args: SearchContentArgs,
  client: SupabaseClient | null = getSupabaseClient(),
): Promise<SearchRow[]> {
  if (!client) {
    // 미구성/테스트 — 결정론 폴백.
    return demoSearchMyContent(args as DemoSearchArgs);
  }

  const { data, error } = await client.rpc('search_my_content', {
    p_query: args.query,
    p_category: args.category ?? null,
    p_source: args.source ?? null,
    p_sort: args.sort ?? 'recent',
  });

  if (error) {
    throw error;
  }
  const rows = Array.isArray(data) ? data : [];
  return rows.map((r) => toSearchRow(r as Record<string, unknown>));
}

/** provider별 결과 카운트(출처 필터 배지). source 미적용·category 적용. */
export async function searchMyContentSources(
  args: { query: string; category?: string | null },
  client: SupabaseClient | null = getSupabaseClient(),
): Promise<SourceCountRow[]> {
  if (!client) {
    return demoSearchSources(args);
  }

  const { data, error } = await client.rpc('search_my_content_sources', {
    p_query: args.query,
    p_category: args.category ?? null,
  });

  if (error) {
    throw error;
  }
  const rows = Array.isArray(data) ? data : [];
  return rows.map((r) => toSourceCount(r as Record<string, unknown>));
}
