import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

/**
 * inbox 계약 테스트 — 빈상태(발송 인프라 부재) · 수신함 진입점(GNB inbox nav active) ·
 *   라우팅(settings 연결). 결정론: vi.mock('@/shared/api') supabase null.
 */
vi.mock('@/shared/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/api')>();
  return {
    ...actual,
    isSupabaseReady: false,
    isSupabaseConfigured: () => false,
    supabase: null,
  };
});

import { InboxPage } from '@/pages/inbox';
import { setMockSession } from '@/entities/session';

function renderInbox() {
  setMockSession(true);
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={['/inbox']}>
        <Routes>
          <Route path="/inbox" element={<InboxPage />} />
          <Route path="/settings" element={<div>route:settings</div>} />
          <Route path="/library" element={<div>route:library</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  sessionStorage.clear();
});

describe('inbox contract', () => {
  it('셸: 수신함 제목 + 빈상태 카피(발송 인프라 부재)', async () => {
    renderInbox();
    expect(await screen.findByRole('heading', { name: '수신함', level: 1 })).toBeInTheDocument();
    expect(await screen.findByText('받은 알림이 없어요.')).toBeInTheDocument();
  });

  it('GNB 수신함 nav active(진입점) — 수신함 메뉴 선택 표시', async () => {
    renderInbox();
    await screen.findByRole('heading', { name: '수신함', level: 1 });
    // 사이드바(GNB) 내 수신함 nav 항목 — 진입점 비주얼 보존(미수정 위젯 소비). active=aria-current.
    const gnb = screen.getByRole('complementary', { name: '글로벌 내비게이션' });
    const inboxNav = within(gnb).getByRole('button', { name: '수신함' });
    expect(inboxNav).toHaveAttribute('aria-current', 'page');
  });

  it('계정 메뉴(프로필 카드) → 설정 라우팅', async () => {
    const user = userEvent.setup();
    renderInbox();
    await screen.findByRole('heading', { name: '수신함', level: 1 });
    await user.click(screen.getByRole('button', { name: /Grabit 사용자|Leesuho/ }));
    await user.click(await screen.findByRole('menuitem', { name: '프로필 설정' }));
    expect(await screen.findByText('route:settings')).toBeInTheDocument();
  });
});
