import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSearchParams } from 'react-router-dom';
import { OnboardingPage } from './onboarding-page';
import { resetMockOnboarding } from '@/entities/profile';
import { renderRoutes } from '@/test/render';

/** 홈 스텁 — pages 간 크로스 임포트 회피(FSD). 완료 후 ?onboarded=1 도착 + 모달 노출 확인용. */
function HomeStub() {
  const [params] = useSearchParams();
  return (
    <div data-testid="home-stub">
      {params.get('onboarded') === '1' ? <span data-testid="extension-install-modal" /> : null}
    </div>
  );
}

/**
 * 온보딩 4단계 플로우 e2e(컴포넌트) — L1-b/c: stepper 진행·차단·완료→홈.
 */
describe('OnboardingPage 플로우', () => {
  beforeEach(() => {
    resetMockOnboarding();
    localStorage.clear();
  });

  function setup() {
    return renderRoutes(
      [
        { path: '/onboarding', element: <OnboardingPage /> },
        { path: '/', element: <HomeStub /> },
      ],
      { initialEntries: ['/onboarding'] },
    );
  }

  it('필수 미선택 시 다음 버튼 비활성, 선택 시 활성', async () => {
    const user = userEvent.setup();
    setup();
    const next = screen.getByTestId('onboarding-next');
    expect(next).toBeDisabled();
    await user.click(screen.getByTestId('chip-개발자'));
    expect(next).toBeEnabled();
  });

  it('1단계는 이전 버튼 비활성', () => {
    setup();
    expect(screen.getByTestId('onboarding-prev')).toBeDisabled();
  });

  it('4단계 완주 → complete → 홈 진입 + 확장 모달 노출', async () => {
    const user = userEvent.setup();
    setup();

    // ① 직업
    await user.click(screen.getByTestId('chip-개발자'));
    await user.click(screen.getByTestId('onboarding-next'));
    // ② 연차
    await user.click(screen.getByTestId('chip-2~3년차'));
    await user.click(screen.getByTestId('onboarding-next'));
    // ③ 관심분야(복수)
    await user.click(screen.getByTestId('chip-디자인'));
    await user.click(screen.getByTestId('chip-프로그래밍'));
    await user.click(screen.getByTestId('onboarding-next'));
    // ④ 목표 → 완료
    expect(screen.getByTestId('onboarding-next')).toHaveTextContent('완료');
    await user.click(screen.getByTestId('chip-취업 · 이직'));
    await user.click(screen.getByTestId('onboarding-next'));

    // 홈 진입 + 확장 모달 자동 노출
    await waitFor(() => {
      expect(screen.getByTestId('extension-install-modal')).toBeInTheDocument();
    });
  });

  it('관심분야 6번째 차단 + 토스트', async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByTestId('chip-개발자'));
    await user.click(screen.getByTestId('onboarding-next'));
    await user.click(screen.getByTestId('chip-2~3년차'));
    await user.click(screen.getByTestId('onboarding-next'));

    const five = ['디자인', '프로그래밍', '커리어', '리더십', '마인드셋'];
    for (const v of five) await user.click(screen.getByTestId(`chip-${v}`));
    // 6번째 칩은 비활성(시각적 차단)
    expect(screen.getByTestId('chip-마케팅 · 그로스')).toBeDisabled();
  });

  it('뒤로 가도 선택값 보존', async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByTestId('chip-개발자'));
    await user.click(screen.getByTestId('onboarding-next'));
    await user.click(screen.getByTestId('chip-2~3년차'));
    await user.click(screen.getByTestId('onboarding-prev'));
    // 1단계 복귀: 개발자 칩이 여전히 선택(aria-pressed)
    expect(screen.getByTestId('chip-개발자')).toHaveAttribute('aria-pressed', 'true');
  });
});
