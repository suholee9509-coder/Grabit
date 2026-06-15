import { Outlet, type RouteObject } from 'react-router-dom';
import { UiPreviewPage } from '@/app/ui-preview/ui-preview';
import { LoginPage, OAuthCallbackPage } from '@/pages/auth';
import { OnboardingPage } from '@/pages/onboarding';
import { HomePage } from '@/pages/home';
import { ContentDetailPage } from '@/pages/content-detail';
import { SearchPage } from '@/pages/search';
import { LibraryPage } from '@/pages/library';
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
 *   /search         : 검색(u8 — 회원 + 온보딩 완료 필수). GNB 검색 활성.
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
        // u8 검색(L1-a~d) — 홈과 동일 가드(회원 + 온보딩 완료).
        path: 'search',
        element: (
          <RequireOnboarded>
            <SearchPage />
          </RequireOnboarded>
        ),
      },
      {
        // u2 카드 클릭 → 상세 라우팅. u4 콘텐츠 상세 페이지(시청정보/원본소스 + 우 소셜 사이드바).
        // 가드 없음(spec [state] 비로그인: 상세는 비회원도 열람 가능 — 역할에 비회원 포함).
        // 페이지 내부에서 쓰기(좋아요·클립추가·작성)만 로그인 유도(onRequireLogin → /login).
        path: 'content/:id',
        element: <ContentDetailPage />,
      },
      {
        // u7 라이브러리 — 인증 + 온보딩 완료 필수(RequireOnboarded).
        // GNB 라이브러리 링크는 페이지 onMenuSelect→navigate('/library') · activeMenu="library".
        path: 'library',
        element: (
          <RequireOnboarded>
            <LibraryPage />
          </RequireOnboarded>
        ),
      },
      {
        path: 'ui-preview',
        element: <UiPreviewPage />,
      },
    ],
  },
];
