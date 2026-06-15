import { Outlet, type RouteObject } from 'react-router-dom';
import { UiPreviewPage } from '@/app/ui-preview/ui-preview';
import { HomePage } from '@/pages/home';

/**
 * 라우터 셸.
 * '/' = 홈(앱 셸 + 콘텐츠 추가 진입점, u3). '/ui-preview' = u0 디자인 시스템 미리보기.
 *
 * routes(공개 타입 RouteObject[])만 export → 라우터 인스턴스는 main.tsx에서 생성
 * (composite 빌드의 타입 portability 이슈 회피).
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
        element: <HomePage />,
      },
      {
        path: 'ui-preview',
        element: <UiPreviewPage />,
      },
    ],
  },
];
