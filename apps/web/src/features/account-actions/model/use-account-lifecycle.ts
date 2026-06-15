import { useSoftDelete, useRestoreAccount } from '@/entities/profile';

/**
 * useAccountLifecycle — 탈퇴(soft-delete)·복구(L1-d).
 *   soft_delete_account()/restore_account() (0013) 위 뮤테이션. 멱등(이미 deleted/live 무해).
 *   hard-delete ❌ — deleted_at 토글만. 30일 유예·복구는 카피/배너로 안내(색 발명 ❌).
 */
export function useAccountLifecycle() {
  const softDelete = useSoftDelete();
  const restore = useRestoreAccount();

  return {
    withdraw: (cb: { onSuccess: () => void; onError: () => void }) =>
      softDelete.mutate(undefined, { onSuccess: () => cb.onSuccess(), onError: () => cb.onError() }),
    withdrawPending: softDelete.isPending,
    restoreAccount: (cb: { onSuccess: () => void; onError: () => void }) =>
      restore.mutate(undefined, { onSuccess: () => cb.onSuccess(), onError: () => cb.onError() }),
    restorePending: restore.isPending,
  };
}

/** 유예 종료일(deleted_at + 30일) — 복구 안내 카피용(결정론 포맷). */
export function graceEndDate(deletedAt: string | null | undefined): string | null {
  if (!deletedAt) return null;
  const start = new Date(deletedAt);
  if (Number.isNaN(start.getTime())) return null;
  const end = new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000);
  return `${end.getFullYear()}.${String(end.getMonth() + 1).padStart(2, '0')}.${String(
    end.getDate(),
  ).padStart(2, '0')}`;
}
