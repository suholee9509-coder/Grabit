import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

/**
 * search-discovery 계약 테스트 — 디폴트 발견 렌더(추천칩6·카테고리13·추천그리드 시드)·RPC 미호출·
 *   카테고리 필터(그리드 재필터)·추천칩 클릭→검색. 결정론: vi.mock('@/shared/api') supabase null.
 */

const searchMyContent = vi.fn();

vi.mock('@/shared/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/api')>();
  return {
    ...actual,
    isSupabaseReady: false,
    isSupabaseConfigured: () => false,
    supabase: null,
    searchMyContent: (...args: unknown[]) => searchMyContent(...args),
  };
});

import { SearchPage } from '@/pages/search';

function renderSearch() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={['/search']}>
        <Routes>
          <Route path="/search" element={<SearchPage />} />
          <Route path="/content/:id" element={<div>detail</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
  searchMyContent.mockReset();
  searchMyContent.mockResolvedValue([]);
});

describe('search-discovery contract', () => {
  it('디폴트 발견: 추천칩 6개 + 카테고리 13개 + 추천그리드 시드 노출, RPC 미호출', () => {
    renderSearch();

    // 추천 키워드 칩 6개(프레임 카피)
    for (const kw of ['AI 활용법', '시간 관리', 'AI 업계 소식', '커리어 전환', '실리콘밸리', '창업 스토리']) {
      expect(screen.getByRole('button', { name: new RegExp(kw) })).toBeInTheDocument();
    }
    // 카테고리 13개 일부
    expect(screen.getByRole('button', { name: '전체' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '창업 · 스타트업' })).toBeInTheDocument();
    // 추천 그리드 시드 카피
    expect(
      screen.getByText('쿠팡 디자인 리드가 전하는 스케일러블한 토큰 구조 설계'),
    ).toBeInTheDocument();
    // RPC 미호출(빈 쿼리 → enabled false)
    expect(searchMyContent).not.toHaveBeenCalled();
  });

  it('히어로 카피 + 검색 placeholder 노출', () => {
    renderSearch();
    expect(
      screen.getByText('어디서든 발견한 인사이트를 한 곳에서 관리하고 성장하세요'),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText('제목, 메모, 태그로 검색하기')).toBeInTheDocument();
  });

  it('추천 키워드 칩 클릭 → 해당 쿼리로 검색 진입(쿼리칩 노출)', async () => {
    const user = userEvent.setup();
    renderSearch();
    await user.click(screen.getByRole('button', { name: /AI 활용법/ }));

    // 결과/빈 상태 진입 — 쿼리칩(dismiss) 노출
    expect(await screen.findByLabelText('검색어 지우기')).toBeInTheDocument();
  });

  it('카테고리 클릭 → 선택 표시(weight/색) + 추천 그리드가 해당 카테고리 시드로 재필터', async () => {
    const user = userEvent.setup();
    renderSearch();
    // 전체(기본) = 마케팅 태그 시드 노출
    expect(
      screen.getByText('팔로워 수보다 중요한 인플루언서 선정 기준과 협업 ROI 측정 프레임워크'),
    ).toBeInTheDocument();

    // '디자인' 카테고리 선택 → 디자인 태그(디자인시스템) 시드 유지
    const designCat = screen.getByRole('button', { name: '디자인' });
    await user.click(designCat);
    expect(designCat).toHaveAttribute('aria-pressed', 'true');
    expect(
      screen.getByText('쿠팡 디자인 리드가 전하는 스케일러블한 토큰 구조 설계'),
    ).toBeInTheDocument();
    // 디자인 태그가 없는 마케팅 시드는 소거(재필터 검증 — 동어반복 ❌)
    expect(
      screen.queryByText('팔로워 수보다 중요한 인플루언서 선정 기준과 협업 ROI 측정 프레임워크'),
    ).not.toBeInTheDocument();
  });
});
