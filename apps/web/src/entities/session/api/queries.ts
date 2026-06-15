import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchSession, subscribeSession } from './session-api';
import type { SessionInfo } from './session-api';

export const sessionKeys = {
  current: ['session', 'current'] as const,
};

/**
 * 현재 세션 쿼리 + Auth 상태 변경 구독.
 * onAuthStateChange가 발화하면 캐시를 즉시 갱신(로그인/로그아웃·OAuth 콜백 반영).
 */
export function useSession() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: sessionKeys.current,
    queryFn: fetchSession,
    staleTime: 10_000,
  });

  useEffect(() => {
    const unsub = subscribeSession((info: SessionInfo) => {
      qc.setQueryData(sessionKeys.current, info);
      // 세션 변경 시 온보딩 게이트도 재평가 필요.
      qc.invalidateQueries({ queryKey: ['profile', 'onboarding-gate'] });
    });
    return unsub;
  }, [qc]);

  return query;
}
