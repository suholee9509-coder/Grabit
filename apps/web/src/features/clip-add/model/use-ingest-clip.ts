import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ingestClip, isSupabaseConfigured } from '@/shared/api';
import type { Clip, IngestClipInput } from '@/entities/clip';

/**
 * useIngestClip — [완료] 시 `ingest_clip` 단일 호출(TanStack Query mutation).
 * 성공 시 라이브러리/홈/폴더 캐시 무효화. Supabase 미구성(데모) 시 결정론적 성공 스텁.
 * dedup·정준화·구간검증·메모병합·태그는 RPC가 수행(여기선 위임).
 */
export function useIngestClip() {
  const qc = useQueryClient();

  return useMutation<Clip, unknown, IngestClipInput>({
    mutationFn: async (input) => {
      if (!isSupabaseConfigured()) {
        // 데모/오프라인: 결정론적 성공(백엔드 미구성). 실 검증은 e2e(로컬 Supabase).
        return {
          id: 'demo-clip',
          contentId: 'demo-content',
          startSec: input.startSec,
          endSec: input.endSec,
          memo: input.memo,
          isPublic: input.isPublic,
          folderId: input.folderId,
        };
      }
      return ingestClip(input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clips'] });
      qc.invalidateQueries({ queryKey: ['library'] });
      qc.invalidateQueries({ queryKey: ['home'] });
      qc.invalidateQueries({ queryKey: ['folders'] });
    },
  });
}
