import { getSupabaseClient, type SupabaseClient } from './supabase';
import type { FolderRow } from './types';

/** 본인 폴더 목록(RLS). `select id, name from folders`(0003, max 20). */
export async function fetchFolders(
  client: SupabaseClient | null = getSupabaseClient(),
): Promise<FolderRow[]> {
  if (!client) return [];

  const { data, error } = await client
    .from('folders')
    .select('id, name')
    .order('name', { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: String((row as Record<string, unknown>).id ?? ''),
    name: String((row as Record<string, unknown>).name ?? ''),
  }));
}
