import { Toast } from '@/shared/ui';
import type { ClipAddFlow } from '../model/use-clip-add-flow';
import { Step1LinkModal } from './step1-link-modal';
import { Step2EditModal } from './step2-edit-modal';
import toastStyles from './toast-host.module.css';

export interface ClipAddFlowViewProps {
  flow: ClipAddFlow;
}

/**
 * ClipAddFlowView — 콘텐츠 추가 모달 플로우 렌더(Step1 → 메타로딩 → Step2) + 토스트 호스트.
 * 상태/로직은 useClipAddFlow(상위 페이지가 소유)에서 주입.
 */
export function ClipAddFlowView({ flow }: ClipAddFlowViewProps) {
  return (
    <>
      <Step1LinkModal
        open={flow.step === 'link' || flow.step === 'loading-meta'}
        onClose={flow.close}
        onSubmit={flow.submitUrl}
        loading={flow.step === 'loading-meta'}
      />

      {flow.step === 'edit' ? (
        <Step2EditModal
          open
          onClose={flow.close}
          url={flow.url}
          videoRef={flow.videoRef}
          meta={flow.meta}
          folders={flow.folders ?? []}
          onSearchTags={flow.searchTags}
          onSubmit={flow.submitClip}
          submitting={flow.submitting}
        />
      ) : null}

      {/* 토스트 호스트(완료/실패) */}
      <div className={toastStyles.host} aria-live="polite">
        {flow.toasts.map((t) => (
          <Toast key={t.id} variant={t.variant}>
            {t.message}
          </Toast>
        ))}
      </div>
    </>
  );
}
