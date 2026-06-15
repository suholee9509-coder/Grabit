import { getSupabaseClient, type SupabaseClient } from './supabase';
import type { TagRow } from './types';

/**
 * 태그 자동완성 — 본인 태그 prefix 매칭(RLS, 유저별).
 * `select name from tags where lower(name) like lower($1)||'%'`(0003 tags_user_lower_name_uq).
 * 빈 prefix면 빈 결과(추천 없음 → 그대로 Enter 신규 생성).
 */
export async function searchTags(
  prefix: string,
  client: SupabaseClient | null = getSupabaseClient(),
): Promise<TagRow[]> {
  const q = prefix.trim();
  if (!client || q === '') return [];

  // PostgREST ilike — prefix 매칭. 특수문자 escape(%, _).
  const escaped = q.replace(/[%_]/g, (m) => `\\${m}`);

  const { data, error } = await client
    .from('tags')
    .select('id, name')
    .ilike('name', `${escaped}%`)
    .order('name', { ascending: true })
    .limit(8);

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: String((row as Record<string, unknown>).id ?? ''),
    name: String((row as Record<string, unknown>).name ?? ''),
  }));
}
