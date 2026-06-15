import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

/**
 * home-empty-cold-start — 추천/트렌드 0건(콜드스타트) 시나리오.
 * __setForceEmpty(true)로 모든 표면 items=[] 강제 → 각 섹션 빈 상태 문구 렌더, 콘솔 에러 0, 레이아웃 유지.
 */
vi.mock('@/shared/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/api')>();
  return { ...actual, isSupabaseReady: false, isSupabaseConfigured: () => false, supabase: null };
});

import { HomePage } from '@/pages/home';
import { __setForceEmpty } from '@/entities/recommendation';

function renderHome() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={['/']}>
        <HomePage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  sessionStorage.clear();
  __setForceEmpty(true);
});
afterEach(() => {
  __setForceEmpty(false);
});

describe('home-feed cold-start (0건)', () => {
  it('취향관: 추천 0건 → 빈 상태 문구 렌더, 콘솔 에러 0', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    renderHome();

    // 추천 빈 상태
    expect(await screen.findByText(/아직 추천이 없어요/)).toBeInTheDocument();
    // 크로스 트렌드 빈 상태(탭은 떠도 카드 0건 → "곧 추가돼요")
    expect(screen.getByText(/이 분야 콘텐츠가 곧 추가돼요/)).toBeInTheDocument();
    // 우레일 빈 상태
    expect(screen.getByText(/실시간 그랩이 아직 없어요/)).toBeInTheDocument();
    // 제목(레이아웃 골격)은 유지
    expect(screen.getByRole('heading', { name: '직군별 크로스 트렌드' })).toBeInTheDocument();

    expect(errSpy).not.toHaveBeenCalled();
    errSpy.mockRestore();
  });

  it('피드: 그랩/그리드 0건 → 빈 상태 문구, 레이아웃 유지', async () => {
    const user = userEvent.setup();
    renderHome();
    await screen.findByText(/아직 추천이 없어요/);

    await user.click(screen.getByRole('tab', { name: '피드' }));

    expect(await screen.findByText(/이 분야의 인기 그랩이 곧 추가돼요/)).toBeInTheDocument();
    expect(screen.getByText(/이 분야의 트렌드가 곧 추가돼요/)).toBeInTheDocument();
    // 섹션 제목(레이아웃 골격) 유지
    expect(screen.getByRole('heading', { name: '실시간 인기 그랩' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '분야별 트렌드' })).toBeInTheDocument();
  });
});
