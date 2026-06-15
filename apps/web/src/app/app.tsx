import { Outlet, type RouteObject } from 'react-router-dom';

/**
 * 라우터 셸 (placeholder).
 * Sprint 0 스캐폴드 — 실제 화면 ❌. 라우트는 후속 유닛(u1~)이 채운다.
 * '/ui-preview'는 u0(디자인 시스템)의 토큰/컴포넌트 미리보기 자리.
 *
 * routes(공개 타입 RouteObject[])만 export → 라우터 인스턴스는 main.tsx에서 생성
 * (composite 빌드의 타입 portability 이슈 회피).
 */
function RootLayout() {
  return <Outlet />;
}

function UiPreviewPage() {
  return <div>Grabit — design system preview (u0)</div>;
}

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        path: 'ui-preview',
        element: <UiPreviewPage />,
      },
    ],
  },
];
