import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useOAuthCallback } from '@/features/social-login';
import { Toast } from '@/shared/ui';
import { OnboardingHeader } from '@/widgets/onboarding-header';
import { Spinner } from './callback-spinner';
import styles from './oauth-callback-page.module.css';

/**
 * OAuth 콜백 페이지 (/auth/callback) — 제공자 인증 후 진입.
 *   세션 확정 → 온보딩 게이트 판정 → (미완료)온보딩 / (완료)홈 / (실패·취소)로그인 복귀.
 *   처리 중 = 로딩(파운데이션 스피너) · 실패 = 에러 안내 + 로그인 복귀(E6).
 */
export function OAuthCallbackPage() {
  const status = useOAuthCallback();
  const navigate = useNavigate();
  const qc = useQueryClient();

  useEffect(() => {
    if (status.phase === 'authenticated') {
      // 세션·게이트 캐시 갱신 후 라우팅.
      qc.invalidateQueries({ queryKey: ['session', 'current'] });
      qc.invalidateQueries({ queryKey: ['profile', 'onboarding-gate'] });
      navigate(status.onboarded ? '/' : '/onboarding', { replace: true });
    }
  }, [status, navigate, qc]);

  return (
    <div className={styles.page}>
      <OnboardingHeader />
      <div className={styles.center}>
        {status.phase === 'error' ? (
          <div className={styles.errorBox}>
            <Toast variant="error">{status.message}</Toast>
            <button className={styles.retry} onClick={() => navigate('/login', { replace: true })}>
              로그인으로 돌아가기
            </button>
          </div>
        ) : (
          <div className={styles.loading}>
            <Spinner />
            <p className={styles.loadingText}>로그인 처리 중...</p>
          </div>
        )}
      </div>
    </div>
  );
}
