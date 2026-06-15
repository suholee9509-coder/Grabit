import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createFolder, isSupabaseReady, mapLibraryError, type FolderRow } from '@/shared/api';

/**
 * 폴더 생성 mutation — create_folder RPC(공백/중복/20초과 23514·미인증 28000).
 *   미구성(isSupabaseReady=false) → 로컬 낙관적 생성(데모) 반환.
 *   성공 시 invalidate(['library']) → 폴더 카운트/트리/select 갱신.
 */
export function useCreateFolder() {
  const qc = useQueryClient();
  return useMutation<FolderRow, Error, string>({
    mutationFn: async (name: string) => {
      const trimmed = name.trim();
      if (trimmed === '') {
        throw new Error('폴더 이름을 입력해 주세요.');
      }
      if (!isSupabaseReady) {
        // 데모: 결정론 로컬 생성(BE 미구성).
        return { id: `local-${Date.now()}`, name: trimmed };
      }
      try {
        return await createFolder(trimmed);
      } catch (err) {
        throw new Error(mapLibraryError(err).message);
      }
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['library'] });
    },
  });
}
