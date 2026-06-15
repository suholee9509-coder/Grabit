import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExtensionInstallModal } from './extension-install-modal';
import { renderWithProviders } from '@/test/render';

/**
 * 확장 설치 모달 — L1-d: 두 CTA(설치하러 가기=웹스토어 새 탭 / 나중에 하기=닫기) + E5 1회 정책.
 */
describe('ExtensionInstallModal', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('autoOpen → 모달 + 체크 3행 + 두 CTA 렌더', () => {
    renderWithProviders(<ExtensionInstallModal autoOpen />);
    expect(screen.getByTestId('extension-install-modal')).toBeInTheDocument();
    expect(screen.getByText('탭 전환이 필요없는 논스톱 컨텐츠 등록')).toBeInTheDocument();
    expect(screen.getByText('영상 또는 아티클 시청 중 즉각적인 클리핑')).toBeInTheDocument();
    expect(screen.getByText('빠르고 접근성 좋은 인사이트 기록 환경')).toBeInTheDocument();
    expect(screen.getByTestId('extension-install')).toHaveTextContent('설치하러 가기');
    expect(screen.getByTestId('extension-dismiss')).toHaveTextContent('나중에 하기');
  });

  it('"나중에 하기" → 닫힘 + 재노출 억제(E5)', async () => {
    const user = userEvent.setup();
    const { unmount } = renderWithProviders(<ExtensionInstallModal autoOpen />);
    await user.click(screen.getByTestId('extension-dismiss'));
    expect(screen.queryByTestId('extension-install-modal')).not.toBeInTheDocument();
    unmount();
    // 재마운트(홈 재진입) — dismiss 보존으로 안 열림
    renderWithProviders(<ExtensionInstallModal autoOpen />);
    expect(screen.queryByTestId('extension-install-modal')).not.toBeInTheDocument();
  });

  it('"설치하러 가기" → 웹스토어 새 탭(window.open) + 닫힘', async () => {
    const open = vi.fn();
    vi.stubGlobal('open', open);
    const user = userEvent.setup();
    renderWithProviders(<ExtensionInstallModal autoOpen />);
    await user.click(screen.getByTestId('extension-install'));
    expect(open).toHaveBeenCalledWith(
      expect.stringContaining('chrome.google.com/webstore'),
      '_blank',
      'noopener,noreferrer',
    );
    expect(screen.queryByTestId('extension-install-modal')).not.toBeInTheDocument();
  });

  it('autoOpen=false → 닫힌 채 시작', () => {
    renderWithProviders(<ExtensionInstallModal autoOpen={false} />);
    expect(screen.queryByTestId('extension-install-modal')).not.toBeInTheDocument();
  });
});
