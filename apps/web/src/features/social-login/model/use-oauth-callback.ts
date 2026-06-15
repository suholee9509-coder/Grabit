import { useEffect, useState } from 'react';
import { supabase } from '@/shared/api';
import { fetchSession } from '@/entities/session';
import { fetchIsOnboarded } from '@/entities/profile';

/** OAuth 콜백 처리 결과 — 라우팅 목적지 결정. */
export type CallbackStatus =
  | { phase: 'loading' }
  | { phase: 'authenticated'; onboarded: boolean }
  | { phase: 'error'; message: string };

/**
 * OAuth 콜백 처리 — 제공자 리다이렉트 후 세션 확정 → 온보딩 게이트 판정.
 *   detectSessionInUrl=true(supabase 설정)이 URL의 토큰을 자동 교환 → getSession이 세션 반환.
 *   세션 있음 + 온보딩 완료 → 홈 / 세션 있음 + 미완료 → 온보딩 / 세션 없음(취소·실패) → 에러(로그인 복귀).
 */
export function useOAuthCallback(): CallbackStatus {
  const [status, setStatus] = useState<CallbackStatus>({ phase: 'loading' });

  useEffect(() => {
    let cancelled = false;

    async function resolve() {
      try {
        // supabase 배선 시 URL 토큰 교환을 위해 한 틱 양보(detectSessionInUrl).
        if (supabase) {
          // getSession은 detectSessionInUrl 처리 후의 세션을 반환.
          await supabase.auth.getSession();
        }
        const session = await fetchSession();
        if (!session.authenticated) {
          if (!cancelled)
            setStatus({
              phase: 'error',
              message: '로그인이 취소되었거나 실패했어요. 다시 시도해 주세요.',
            });
          return;
        }
        const onboarded = await fetchIsOnboarded();
        if (!cancelled) setStatus({ phase: 'authenticated', onboarded });
      } catch (e) {
        if (!cancelled)
          setStatus({
            phase: 'error',
            message:
              e instanceof Error
                ? `로그인 처리 중 오류가 발생했어요. (${e.message})`
                : '로그인 처리 중 오류가 발생했어요.',
          });
      }
    }

    void resolve();
    return () => {
      cancelled = true;
    };
  }, []);

  return status;
}
