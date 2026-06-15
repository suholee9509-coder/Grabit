import { useCallback, useState } from 'react';
import type { ToastVariant } from '@/shared/ui';

export interface ToastItem {
  id: number;
  variant: ToastVariant;
  message: string;
}

let seq = 0;

/** 토스트 스택 상태(완료/실패 알림). 자동 소멸(기본 3.2s). */
export function useToasts() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (variant: ToastVariant, message: string, ttl = 3200) => {
      const id = ++seq;
      setToasts((prev) => [...prev, { id, variant, message }]);
      if (ttl > 0) {
        window.setTimeout(() => dismiss(id), ttl);
      }
      return id;
    },
    [dismiss],
  );

  return { toasts, push, dismiss };
}
