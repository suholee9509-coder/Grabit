import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route, useParams } from 'react-router-dom';

/**
 * search-results 계약 테스트 — 디바운스0.5s·쿼리칩·출처필터·카테고리·정렬·0건빈·카드→상세.
 * 결정론: vi.mock('@/shared/api')로 supabase null + searchMyContent/Sources를 결정론 픽스처로 대체.
 * 동어반복 ❌: 필터/정렬 인자에 따라 다른 배열 반환을 검증. 본인행만(타 user 식별자 부재).
 */

const searchMyContent = vi.fn();
const searchMyContentSources = vi.fn();

vi.mock('@/shared/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/api')>();
  return {
    ...actual,
    isSupabaseReady: false,
    isSupabaseConfigured: () => false,
    supabase: null,
    searchMyContent: (...args: unknown[]) => searchMyContent(...args),
    searchMyContentSources: (...args: unknown[]) => searchMyContentSources(...args),
  };
});

import { SearchPage } from '@/pages/search';

function ContentRouteProbe() {
  const { id } = useParams();
  return <div>route:content:{id}</div>;
}

function renderSearch() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={['/search']}>
        <Routes>
          <Route path="/search" element={<SearchPage />} />
          <Route path="/content/:id" element={<ContentRouteProbe />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

/** 본인행 픽스처(타 user 식별자 부재). category/source/sort 인자에 따라 분기. */
const ROW_BASE = {
  id: 'c-1',
  title: 'IT 업계 동향 — AI 인프라',
  provider: 'youtube',
  clipCount: 3,
  tags: ['AI', '반도체'],
  lastClippedAt: '2026-06-15T10:00:00.000Z',
  thumbnailUrl: null,
};

beforeEach(() => {
  localStorage.clear();
  searchMyContent.mockReset();
  searchMyContentSources.mockReset();
  // 기본: 1행 + Youtube 카운트
  searchMyContent.mockResolvedValue([ROW_BASE]);
  searchMyContentSources.mockResolvedValue([
    { provider: 'youtube', count: 1 },
    { provider: 'medium', count: 1 },
  ]);
});

describe('search-results contract', () => {
  it('디바운스 0.5s → 연타 후 searchMyContent 정확히 1회(최종 쿼리) 호출', async () => {
    const user = userEvent.setup();
    renderSearch();

    // 연속 입력(각 키 입력이 0.5s 타이머 리셋 → 최종값 1회로 collapse)
    await user.type(screen.getByLabelText('검색'), 'IT 업계 동향');

    // 디바운스 확정 후 정확히 1회 호출(최종 쿼리값) — 중간 입력값 호출 없음
    await waitFor(() => expect(searchMyContent).toHaveBeenCalledTimes(1));
    expect(searchMyContent).toHaveBeenCalledWith(
      expect.objectContaining({ query: 'IT 업계 동향' }),
    );
  });

  it('결과 헤더(쿼리 보간 + 카운트) + 카드 렌더', async () => {
    const user = userEvent.setup();
    renderSearch();
    await user.type(screen.getByLabelText('검색'), 'IT 업계 동향');
    await user.keyboard('{Enter}');

    expect(await screen.findByText('‘IT 업계 동향’ 검색 결과')).toBeInTheDocument();
    expect(screen.getByText('IT 업계 동향 — AI 인프라')).toBeInTheDocument();
  });

  it('쿼리 칩 dismiss → discovery 복귀(추천칩 재노출)', async () => {
    const user = userEvent.setup();
    renderSearch();
    await user.type(screen.getByLabelText('검색'), 'IT 업계 동향');
    await user.keyboard('{Enter}');
    await screen.findByText('‘IT 업계 동향’ 검색 결과');

    await user.click(screen.getByLabelText('검색어 지우기'));

    // discovery 복귀 — 추천 키워드 칩 재노출, 결과 헤더 소거
    expect(await screen.findByRole('button', { name: /AI 활용법/ })).toBeInTheDocument();
    expect(screen.queryByText('‘IT 업계 동향’ 검색 결과')).not.toBeInTheDocument();
  });

  it('출처 필터: Youtube 클릭 → source 인자 반영 재조회', async () => {
    const user = userEvent.setup();
    renderSearch();
    await user.type(screen.getByLabelText('검색'), 'IT 업계 동향');
    await user.keyboard('{Enter}');
    await screen.findByText('‘IT 업계 동향’ 검색 결과');

    // 출처필터 칩(Youtube 1) 노출
    const ytChip = await screen.findByRole('button', { name: /Youtube/ });
    await user.click(ytChip);

    await waitFor(() =>
      expect(searchMyContent).toHaveBeenCalledWith(
        expect.objectContaining({ source: 'youtube' }),
      ),
    );
  });

  it('카테고리 필터: 디자인 클릭 → category 인자 반영', async () => {
    const user = userEvent.setup();
    renderSearch();
    await user.type(screen.getByLabelText('검색'), 'IT 업계 동향');
    await user.keyboard('{Enter}');
    await screen.findByText('‘IT 업계 동향’ 검색 결과');

    await user.click(screen.getByRole('button', { name: '디자인' }));

    await waitFor(() =>
      expect(searchMyContent).toHaveBeenCalledWith(
        expect.objectContaining({ category: '디자인' }),
      ),
    );
  });

  it('정렬: 클립많은순 선택 → sort=most_clips 인자 반영', async () => {
    const user = userEvent.setup();
    renderSearch();
    await user.type(screen.getByLabelText('검색'), 'IT 업계 동향');
    await user.keyboard('{Enter}');
    await screen.findByText('‘IT 업계 동향’ 검색 결과');

    // 정렬 트리거(최신순) 열기 → 클립많은순
    await user.click(screen.getByRole('button', { name: /최신순/ }));
    await user.click(screen.getByRole('button', { name: '클립많은순' }));

    await waitFor(() =>
      expect(searchMyContent).toHaveBeenCalledWith(
        expect.objectContaining({ sort: 'most_clips' }),
      ),
    );
  });

  it('0건 → 빈 문구 정확 보간 + 출처필터·그리드 부재 + 카운트 0', async () => {
    searchMyContent.mockResolvedValue([]);
    searchMyContentSources.mockResolvedValue([]);
    const user = userEvent.setup();
    renderSearch();
    await user.type(screen.getByLabelText('검색'), '없는검색어');
    await user.keyboard('{Enter}');

    expect(
      await screen.findByText('‘없는검색어’의 검색 결과가 없습니다.'),
    ).toBeInTheDocument();
    // 정렬 유지 · 카테고리 스트립 유지
    expect(screen.getByRole('button', { name: /최신순/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '전체' })).toBeInTheDocument();
    // 출처필터 부재
    expect(screen.queryByRole('group', { name: '출처 필터' })).not.toBeInTheDocument();
  });

  it('카드 클릭 → /content/:id 라우팅', async () => {
    const user = userEvent.setup();
    renderSearch();
    await user.type(screen.getByLabelText('검색'), 'IT 업계 동향');
    await user.keyboard('{Enter}');
    const card = await screen.findByText('IT 업계 동향 — AI 인프라');
    await user.click(card.closest('button')!);

    expect(await screen.findByText('route:content:c-1')).toBeInTheDocument();
  });

  it('본인행만: 렌더 결과에 타 user 식별자/행 부재(no-leak 셰이프)', async () => {
    const user = userEvent.setup();
    renderSearch();
    await user.type(screen.getByLabelText('검색'), 'IT 업계 동향');
    await user.keyboard('{Enter}');
    await screen.findByText('‘IT 업계 동향’ 검색 결과');

    // 픽스처는 본인행만 — user_id/실명류 텍스트가 DOM에 없음
    expect(screen.queryByText(/user_id/i)).not.toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/@[\w.-]+\.(com|io|net)/);
  });
});
