import { useCallback, useState } from 'react';
import {
  demoSearchTags,
  demoVideoMeta,
  isSupabaseConfigured,
  mapIngestError,
  searchTags,
} from '@/shared/api';
import { parseYoutubeUrl, type ContentMeta, type VideoRef } from '@/entities/content';
import type { IngestClipInput } from '@/entities/clip';
import type { Tag } from '@/entities/tag';
import { useIngestClip } from '@/features/clip-add';
import { useFolders } from './use-folders';
import { useToasts } from './use-toasts';

export type FlowStep = 'closed' | 'link' | 'loading-meta' | 'edit';

export interface ClipAddFlow {
  step: FlowStep;
  url: string;
  videoRef: VideoRef | null;
  meta: ContentMeta | null;
  folders: ReturnType<typeof useFolders>['data'];
  toasts: ReturnType<typeof useToasts>['toasts'];
  submitting: boolean;
  open: () => void;
  close: () => void;
  submitUrl: (url: string) => void;
  searchTags: (prefix: string) => Promise<Tag[]>;
  submitClip: (input: IngestClipInput) => void;
  dismissToast: (id: number) => void;
}

/**
 * 콘텐츠 추가 플로우 컨트롤러 — Step1 링크 → (메타 로드) → Step2 편집 → ingest → 완료 토스트/닫힘.
 * 메타 fetch는 서버/엣지 소관(브라우저측 외부키 호출 금지) → 현재 결정론적 데모 메타.
 * 실패 시에도 title/length null 허용해 진행(영상은 iframe).
 */
export function useClipAddFlow(): ClipAddFlow {
  const [step, setStep] = useState<FlowStep>('closed');
  const [url, setUrl] = useState('');
  const [videoRef, setVideoRef] = useState<VideoRef | null>(null);
  const [meta, setMeta] = useState<ContentMeta | null>(null);

  const foldersQuery = useFolders();
  const { toasts, push, dismiss } = useToasts();
  const ingest = useIngestClip();

  const open = useCallback(() => {
    setUrl('');
    setVideoRef(null);
    setMeta(null);
    setStep('link');
  }, []);

  const close = useCallback(() => {
    setStep('closed');
    setUrl('');
    setVideoRef(null);
    setMeta(null);
  }, []);

  const submitUrl = useCallback((nextUrl: string) => {
    const ref = parseYoutubeUrl(nextUrl);
    setUrl(nextUrl);
    setVideoRef(ref);
    setStep('loading-meta');
    // 메타 해석(결정론적 데모 — 서버 메타 fetch 자리). 실패해도 null 허용 진행.
    queueMicrotask(() => {
      try {
        setMeta(demoVideoMeta(nextUrl));
      } catch {
        setMeta(null);
      }
      setStep('edit');
    });
  }, []);

  const doSearchTags = useCallback(async (prefix: string): Promise<Tag[]> => {
    if (!isSupabaseConfigured()) return demoSearchTags(prefix);
    try {
      return await searchTags(prefix);
    } catch {
      return [];
    }
  }, []);

  const submitClip = useCallback(
    (input: IngestClipInput) => {
      ingest.mutate(input, {
        onSuccess: () => {
          push('success', '클립을 저장했어요.');
          close();
        },
        onError: (err) => {
          const mapped = mapIngestError(err);
          push('error', mapped.message);
        },
      });
    },
    [ingest, push, close],
  );

  return {
    step,
    url,
    videoRef,
    meta,
    folders: foldersQuery.data,
    toasts,
    submitting: ingest.isPending,
    open,
    close,
    submitUrl,
    searchTags: doSearchTags,
    submitClip,
    dismissToast: dismiss,
  };
}
