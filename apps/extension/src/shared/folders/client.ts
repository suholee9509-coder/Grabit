// Folders read (attach-only) — the clip modal's 저장 폴더 dropdown lists the user's existing folders.
// Folder *management* CRUD is out of scope (u7); this only reads to attach folder_id at clip time.
// Runs in the background SW (it owns the authed supabase client). RLS scopes to the user (own folders).

import { supabase } from '@/shared/auth/supabase-client';

export interface FolderOption {
  id: string;
  name: string;
}

/** List the signed-in user's folders (RLS-scoped). Returns [] when unconfigured/signed-out/empty. */
export async function listFolders(): Promise<FolderOption[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('folders')
    .select('id, name')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });
  if (error || !data) return [];
  return data.map((f) => ({ id: String(f.id), name: String(f.name) }));
}
