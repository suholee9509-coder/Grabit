import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { signOut, sessionKeys, fetchSession } from '@/entities/session';

/**
 * useLogout — 로그아웃(L1-c): signOut → 세션 캐시 갱신 → 호출처가 /login 리다이렉트.
 *   signOut(entities/session) 재사용(인증 흐름 변경 ❌). 목 경로(supabase null)는 setMockSession(false).
 *   onAuthStateChange가 없을 수도 있는 목 환경을 위해 명시적으로 세션 쿼리를 갱신한다.
 */
export function useLogout() {
  const qc = useQueryClient();
  const [pending, setPending] = useState(false);

  const logout = async (cb: { onSuccess: () => void; onError: () => void }) => {
    setPending(true);
    try {
      await signOut();
      // 세션 캐시 즉시 갱신(목 환경엔 onAuthStateChange 미발화) → 가드가 /login.
      const info = await fetchSession();
      qc.setQueryData(sessionKeys.current, info);
      qc.invalidateQueries({ queryKey: ['profile'] });
      cb.onSuccess();
    } catch {
      cb.onError();
    } finally {
      setPending(false);
    }
  };

  return { logout, pending };
}
