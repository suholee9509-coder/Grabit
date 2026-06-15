import { useMutation, useQueryClient } from '@tanstack/react-query';
import { softDeleteFolder, isSupabaseReady, mapLibraryError, type FolderRow } from '@/shared/api';

/**
 * 폴더 삭제(soft) mutation — soft_delete_folder RPC(부착 clips.folder_id NULL해제·클립 보존).
 *   미구성 → 로컬 no-op(데모). 성공 시 invalidate(['library']).
 */
export function useDeleteFolder() {
  const qc = useQueryClient();
  return useMutation<FolderRow | null, Error, string>({
    mutationFn: async (id: string) => {
      if (!isSupabaseReady) {
        return { id, name: '' };
      }
      try {
        return await softDeleteFolder(id);
      } catch (err) {
        throw new Error(mapLibraryError(err).message);
      }
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['library'] });
    },
  });
}
