import { useCallback, useState } from 'react';
import { env } from '@/shared/config';

/**
 * 확장 설치 모달 상태 — E5 노출 정책: 온보딩 직후 1회 자동 + "나중에 하기" 보존(재노출 억제).
 * E4: "설치하러 가기" = 크롬 웹스토어 새 탭(env.extensionWebstoreUrl, 실제 ID는 u6 주입).
 */
const DISMISS_KEY = 'grabit.extension-modal.dismissed';

function isDismissed(): boolean {
  if (typeof localStorage === 'undefined') return false;
  return localStorage.getItem(DISMISS_KEY) === '1';
}

function markDismissed(): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(DISMISS_KEY, '1');
}

export interface UseExtensionModalResult {
  open: boolean;
  /** 설치 이동 중 펜딩(웹스토어 탭 여는 중). */
  pending: boolean;
  /** "나중에 하기" — 닫고 재노출 억제. */
  dismiss: () => void;
  /** "설치하러 가기" — 웹스토어 새 탭(E4). 닫지 않음(돌아올 수 있게)·억제는 함. */
  install: () => void;
}

/**
 * @param autoOpen 온보딩 완료 직후 자동 노출 여부(페이지가 결정).
 *   이미 dismiss된 사용자는 autoOpen이어도 열지 않음(E5).
 */
export function useExtensionModal(autoOpen: boolean): UseExtensionModalResult {
  const [open, setOpen] = useState<boolean>(autoOpen && !isDismissed());
  const [pending, setPending] = useState(false);

  const dismiss = useCallback(() => {
    markDismissed();
    setOpen(false);
  }, []);

  const install = useCallback(() => {
    setPending(true);
    markDismissed(); // 설치 시도 시에도 재노출 억제
    window.open(env.extensionWebstoreUrl, '_blank', 'noopener,noreferrer');
    setPending(false);
    setOpen(false);
  }, []);

  return { open, pending, dismiss, install };
}
