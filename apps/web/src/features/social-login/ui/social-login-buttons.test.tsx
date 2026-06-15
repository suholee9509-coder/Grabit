import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SocialLoginButtons } from './social-login-buttons';
import { renderWithProviders } from '@/test/render';

/**
 * 소셜 로그인 버튼 — L1-a: Google/Kakao만 렌더(E1 컷), 클릭 시 OAuth 트리거(목 콜백 이동).
 */
describe('SocialLoginButtons', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('Google·Kakao 버튼만 렌더(Naver/이메일 없음 — E1)', () => {
    renderWithProviders(<SocialLoginButtons />);
    expect(screen.getByTestId('social-google')).toBeInTheDocument();
    expect(screen.getByTestId('social-kakao')).toBeInTheDocument();
    expect(screen.queryByText(/Naver/)).not.toBeInTheDocument();
    expect(screen.queryByText(/이메일 주소를 입력/)).not.toBeInTheDocument();
  });

  it('Google 클릭 → OAuth 트리거(목: 콜백 라우트로 이동)', async () => {
    const assign = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { ...window.location, origin: 'http://localhost', assign },
      writable: true,
    });
    const user = userEvent.setup();
    renderWithProviders(<SocialLoginButtons />);
    await user.click(screen.getByTestId('social-google'));
    expect(assign).toHaveBeenCalledWith('/auth/callback');
  });
});
