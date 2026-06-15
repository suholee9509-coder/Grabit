import { useMutation, useQueryClient } from '@tanstack/react-query';
import { moveClipsToFolder, isSupabaseReady, mapLibraryError } from '@/shared/api';

/**
 * 다중선택 이동 mutation — move_clips_to_folder RPC(folderId=null=detach·비소유 23503·미인증 28000).
 *   미구성 → 선택 수 반환(데모). 성공 시 invalidate(['library']).
 */
export function useMoveToFolder() {
  const qc = useQueryClient();
  return useMutation<number, Error, { contentIds: string[]; folderId: string | null }>({
    mutationFn: async ({ contentIds, folderId }) => {
      if (contentIds.length === 0) return 0;
      if (!isSupabaseReady) {
        return contentIds.length;
      }
      try {
        return await moveClipsToFolder(contentIds, folderId);
      } catch (err) {
        throw new Error(mapLibraryError(err).message);
      }
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['library'] });
    },
  });
}
