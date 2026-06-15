import { useMutation, useQueryClient } from '@tanstack/react-query';
import { renameFolder, isSupabaseReady, mapLibraryError, type FolderRow } from '@/shared/api';

/**
 * 폴더 이름변경 mutation — rename_folder RPC(0행=null no-op·공백 23514·미인증 28000).
 *   미구성 → 로컬 반영(데모). 성공 시 invalidate(['library']).
 */
export function useRenameFolder() {
  const qc = useQueryClient();
  return useMutation<FolderRow | null, Error, { id: string; name: string }>({
    mutationFn: async ({ id, name }) => {
      const trimmed = name.trim();
      if (trimmed === '') {
        throw new Error('폴더 이름을 입력해 주세요.');
      }
      if (!isSupabaseReady) {
        return { id, name: trimmed };
      }
      try {
        return await renameFolder(id, trimmed);
      } catch (err) {
        throw new Error(mapLibraryError(err).message);
      }
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['library'] });
    },
  });
}
