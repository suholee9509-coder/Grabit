import { useMemo, useState } from 'react';
import {
  NOTIFICATION_CATEGORIES,
  mergeNotificationState,
  useNotificationPrefs,
  useSetNotificationPref,
  type NotificationCategoryOption,
} from '@/entities/profile';

export interface NotificationRow extends NotificationCategoryOption {
  enabled: boolean;
}

export interface NotificationSettingsState {
  loading: boolean;
  loadError: boolean;
  rows: NotificationRow[];
  /** 현재 저장중인 카테고리(토글 disabled). */
  pendingCategory: string | null;
  toggle: (category: string, next: boolean, onError: () => void) => void;
}

/**
 * useNotificationPrefsState — 설정 '알림' 섹션(L1-e). 카탈로그 + 저장된 prefs 병합 → 토글 행.
 *   get_notification_prefs(0013) 조회 → mergeNotificationState(0건=카탈로그 기본값). 토글 = 낙관 갱신 +
 *   set_notification_pref 저장, 실패 시 롤백(onError 토스트). 비결제 카테고리만(카탈로그가 보장).
 */
export function useNotificationPrefsState(enabled = true): NotificationSettingsState {
  const query = useNotificationPrefs(enabled);
  const mutation = useSetNotificationPref();

  // 낙관 오버라이드(서버 반영 전 즉시 토글). 서버 데이터가 권위 — 오버라이드는 보조.
  const [optimistic, setOptimistic] = useState<Record<string, boolean>>({});
  const [pendingCategory, setPendingCategory] = useState<string | null>(null);

  const merged = useMemo(() => mergeNotificationState(query.data ?? []), [query.data]);

  const rows: NotificationRow[] = NOTIFICATION_CATEGORIES.map((cat) => {
    const server = merged.find((m) => m.category === cat.category)?.enabled ?? cat.enabledByDefault;
    const enabled = cat.category in optimistic ? optimistic[cat.category] : server;
    return { ...cat, enabled };
  });

  return {
    loading: query.isLoading,
    loadError: query.isError,
    rows,
    pendingCategory,
    toggle: (category, next, onError) => {
      setOptimistic((o) => ({ ...o, [category]: next })); // 낙관 반영
      setPendingCategory(category);
      mutation.mutate(
        { category, enabled: next },
        {
          onError: () => {
            // 롤백(낙관 제거 → 서버값 복귀).
            setOptimistic((o) => {
              const copy = { ...o };
              delete copy[category];
              return copy;
            });
            onError();
          },
          onSettled: () => setPendingCategory(null),
        },
      );
    },
  };
}
