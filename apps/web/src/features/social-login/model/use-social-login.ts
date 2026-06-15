import { useCallback, useState } from 'react';
import { supabase } from '@/shared/api';
import { setMockSession } from '@/entities/session';

/**
 * 소셜 로그인 (OAuth) 트리거 — ADR-0001: Google + Kakao만(E1 컷, Naver/이메일 제외).
 * Supabase Auth signInWithOAuth → 제공자 화면(2087:6043, DS 외) → 콜백(/auth/callback).
 * 미배선 시 결정론적 목 세션 설정 + 콜백으로 이동(BE 미완/로컬·데모).
 */
export type OAuthProvider = 'google' | 'kakao';

/** OAuth 콜백 라우트(앱 등록). 제공자가 인증 후 이리로 리다이렉트. */
export const OAUTH_CALLBACK_PATH = '/auth/callback';

export interface UseSocialLoginResult {
  /** 진행 중인 제공자(버튼 펜딩/스피너) — 없으면 null. */
  pending: OAuthProvider | null;
  /** OAuth 실패/취소 에러 메시지(토스트) — 없으면 null. */
  error: string | null;
  /** 제공자로 로그인 시작. */
  signIn: (provider: OAuthProvider) => Promise<void>;
  /** 에러 해제(재시도 시). */
  clearError: () => void;
}

export function useSocialLogin(): UseSocialLoginResult {
  const [pending, setPending] = useState<OAuthProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  const signIn = useCallback(async (provider: OAuthProvider) => {
    setPending(provider);
    setError(null);
    try {
      if (!supabase) {
        // TODO(BE 배선): Supabase 자격 주입 후 목 경로 제거. 데모: 즉시 인증 + 콜백 이동.
        setMockSession(true);
        window.location.assign(OAUTH_CALLBACK_PATH);
        return;
      }
      const redirectTo = `${window.location.origin}${OAUTH_CALLBACK_PATH}`;
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo },
      });
      if (oauthError) throw oauthError;
      // 성공 시 supabase가 제공자 화면으로 리다이렉트(이 페이지 떠남).
    } catch (e) {
      setPending(null);
      setError(
        e instanceof Error
          ? `로그인에 실패했어요. 다시 시도해 주세요. (${e.message})`
          : '로그인에 실패했어요. 다시 시도해 주세요.',
      );
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { pending, error, signIn, clearError };
}
