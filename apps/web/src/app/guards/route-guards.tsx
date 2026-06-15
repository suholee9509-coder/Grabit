import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useSession } from '@/entities/session';
import { useOnboardingGate } from '@/entities/profile';
import styles from './route-guards.module.css';

/**
 * 라우팅 가드 (app) — 온보딩 게이팅(L1-b/e). app 레이어만 전 레이어 임포트 가능.
 *   RequireAuth: 미인증 → /login.
 *   RequireOnboarded: 인증 + 미완료 → /onboarding (홈/보호 라우트 진입 차단).
 *   RedirectIfOnboarded: /onboarding에서 이미 완료 → / (재진입 시 4단계 스킵).
 * 세션·게이트 조회 중 = 로딩(파운데이션 스피너).
 */

function GuardLoading() {
  return (
    <div className={styles.loading}>
      <span className={styles.spinner} role="status" aria-label="로딩 중" />
    </div>
  );
}

/** 미인증 시 로그인으로. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const session = useSession();
  if (session.isLoading) return <GuardLoading />;
  if (!session.data?.authenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

/** 인증 + 온보딩 완료해야 통과. 미완료 → /onboarding. */
export function RequireOnboarded({ children }: { children: ReactNode }) {
  const session = useSession();
  const authed = Boolean(session.data?.authenticated);
  const gate = useOnboardingGate(authed && !session.isLoading);

  if (session.isLoading) return <GuardLoading />;
  if (!authed) return <Navigate to="/login" replace />;
  if (gate.isLoading) return <GuardLoading />;
  if (!gate.data) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

/** /onboarding 진입 가드: 미인증 → /login · 이미 완료 → / (스킵). */
export function OnboardingRouteGuard({ children }: { children: ReactNode }) {
  const session = useSession();
  const authed = Boolean(session.data?.authenticated);
  const gate = useOnboardingGate(authed && !session.isLoading);

  if (session.isLoading) return <GuardLoading />;
  if (!authed) return <Navigate to="/login" replace />;
  if (gate.isLoading) return <GuardLoading />;
  if (gate.data) return <Navigate to="/" replace />; // 이미 완료 → 홈 직행
  return <>{children}</>;
}

/** /login 진입 가드: 이미 인증됐으면 게이트 따라 라우팅(로그인 화면 재노출 방지). */
export function RedirectIfAuthed({ children }: { children: ReactNode }) {
  const session = useSession();
  const authed = Boolean(session.data?.authenticated);
  const gate = useOnboardingGate(authed && !session.isLoading);

  if (session.isLoading) return <GuardLoading />;
  if (authed) {
    if (gate.isLoading) return <GuardLoading />;
    return <Navigate to={gate.data ? '/' : '/onboarding'} replace />;
  }
  return <>{children}</>;
}
