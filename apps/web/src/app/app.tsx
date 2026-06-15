import { Outlet, type RouteObject } from 'react-router-dom';
import { UiPreviewPage } from '@/app/ui-preview/ui-preview';
import { LoginPage, OAuthCallbackPage } from '@/pages/auth';
import { OnboardingPage } from '@/pages/onboarding';
import { HomePage } from '@/pages/home';
import {
  RequireOnboarded,
  OnboardingRouteGuard,
  RedirectIfAuthed,
} from '@/app/guards/route-guards';

/**
 * 라우터 셸 — u1 인증/온보딩 라우트 등록(라우팅 가드 = 온보딩 게이팅).
 *   /login          : 로그인 진입(이미 인증 시 게이트 따라 리다이렉트).
 *   /auth/callback  : OAuth 콜백(세션 확정 → 온보딩/홈 분기).
 *   /onboarding     : 4단계 프로필(인증 필수 · 이미 완료 시 홈 스킵).
 *   /               : 홈(인증 + 온보딩 완료 필수 — 미완료 시 온보딩 게이팅).
 *   /ui-preview     : u0 디자인 시스템 미리보기(공개).
 * routes(RouteObject[])만 export → 라우터 인스턴스는 main.tsx에서 생성.
 */
function RootLayout() {
  return <Outlet />;
}

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: (
          <RequireOnboarded>
            <HomePage />
          </RequireOnboarded>
        ),
      },
      {
        path: 'login',
        element: (
          <RedirectIfAuthed>
            <LoginPage />
          </RedirectIfAuthed>
        ),
      },
      {
        path: 'auth/callback',
        element: <OAuthCallbackPage />,
      },
      {
        path: 'onboarding',
        element: (
          <OnboardingRouteGuard>
            <OnboardingPage />
          </OnboardingRouteGuard>
        ),
      },
      {
        path: 'ui-preview',
        element: <UiPreviewPage />,
      },
    ],
  },
];
