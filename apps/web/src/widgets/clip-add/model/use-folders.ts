import { useQuery } from '@tanstack/react-query';
import { DEMO_FOLDERS, fetchFolders, isSupabaseConfigured } from '@/shared/api';
import type { Folder } from '@/entities/folder';

/** 폴더 목록 쿼리(본인 RLS). Supabase 미구성 시 결정론적 데모 폴더. */
export function useFolders() {
  return useQuery<Folder[]>({
    queryKey: ['folders'],
    queryFn: async () => {
      if (!isSupabaseConfigured()) return DEMO_FOLDERS;
      return fetchFolders();
    },
    staleTime: 60_000,
  });
}
