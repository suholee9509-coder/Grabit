import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route, useParams } from 'react-router-dom';

/**
 * home-feed 계약 테스트 — 탭 전환·카테고리 필터·크로스 트렌드 재필터·관심분야 칩·카드→navigate.
 * 결정론: vi.mock('@/shared/api')로 supabase null 강제 → demo-seed 경로(콜드스타트 폴백).
 * 데이터 소스는 프레임 카피 시드로 단언(동어반복 아님 — 필터 인자에 따라 다른 배열 반환을 검증).
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

import { HomePage } from '@/pages/home';

/** 라우팅 타깃 검증용 인라인 스텁(app 레이어 import = 상향 금지 → 테스트 내 정의). */
function ContentRouteProbe() {
  const { id } = useParams();
  return <div>route:content:{id}</div>;
}

function renderHome() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/content/:id" element={<ContentRouteProbe />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  sessionStorage.clear();
});

describe('home-feed contract', () => {
  it('기본 = 취향관 탭: 추천 캐러셀 + 직군별 크로스 트렌드 렌더', async () => {
    renderHome();
    // 추천 캐러셀 제목(내 직군 폴백 라벨 — 목 프로필 job 없음 → "내 직군이 많이 본 컨텐츠")
    expect(await screen.findByText(/많이 본 컨텐츠/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '직군별 크로스 트렌드' })).toBeInTheDocument();
    // 데이터 사이언스 시드 카피(크로스 트렌드 기본 분야 = data) — 별도 쿼리라 async
    expect(
      await screen.findByText(/데이터 분석으로 사용자 행동 패턴 읽기/),
    ).toBeInTheDocument();
  });

  it('세그먼트 토글: 취향관 → 피드 전환', async () => {
    const user = userEvent.setup();
    renderHome();
    await screen.findByText(/많이 본 컨텐츠/);

    await user.click(screen.getByRole('tab', { name: '피드' }));

    // 피드 섹션 노출
    expect(await screen.findByRole('heading', { name: '실시간 인기 그랩' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '현직자들의 인사이트' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '분야별 트렌드' })).toBeInTheDocument();
    // 취향관 섹션은 사라짐
    expect(screen.queryByRole('heading', { name: '직군별 크로스 트렌드' })).not.toBeInTheDocument();
  });

  it('피드 카테고리 필터: AI 선택 → 그리드가 AI 시드로 변경', async () => {
    const user = userEvent.setup();
    renderHome();
    await screen.findByText(/많이 본 컨텐츠/);
    await user.click(screen.getByRole('tab', { name: '피드' }));
    await screen.findByRole('heading', { name: '분야별 트렌드' });

    // 기본 "전체" = AI/마케팅/UXUI/백엔드 시드 모두 노출(마케팅 트렌드 카피 등장)
    expect(screen.getByText(/2026 마케팅 트렌드/)).toBeInTheDocument();

    // AI 칩 선택
    const aiChip = screen.getByRole('button', { name: 'AI' });
    await user.click(aiChip);
    expect(aiChip).toHaveAttribute('aria-pressed', 'true');

    // 그리드가 AI 시드(노코드)로 재필터 → 비AI(마케팅 트렌드) 소거
    expect(await screen.findByText(/Lovable로 노코드 웹앱/)).toBeInTheDocument();
    expect(screen.queryByText(/2026 마케팅 트렌드/)).not.toBeInTheDocument();
  });

  it('크로스 트렌드 재필터: 마케팅 탭 선택 → 캐러셀이 마케팅 시드로 재필터', async () => {
    const user = userEvent.setup();
    renderHome();
    await screen.findByRole('heading', { name: '직군별 크로스 트렌드' });
    // 기본 data 분야 카피
    expect(await screen.findByText(/데이터 분석으로 사용자 행동 패턴 읽기/)).toBeInTheDocument();

    // 마케팅 탭(강조어 "마케팅" 포함) 클릭
    await user.click(screen.getByRole('tab', { name: /프로덕트 디자이너가 보는 마케팅 아티클/ }));

    // 마케팅 시드 카피 등장 → 데이터 시드 소거
    expect(await screen.findByText(/브랜드 퍼널 전략으로 마케팅 ROI/)).toBeInTheDocument();
    expect(screen.queryByText(/데이터 분석으로 사용자 행동 패턴 읽기/)).not.toBeInTheDocument();
    // active 표시(재조회 — 재필터 후 노드 갱신)
    expect(
      screen.getByRole('tab', { name: /프로덕트 디자이너가 보는 마케팅 아티클/ }),
    ).toHaveAttribute('aria-selected', 'true');
  });

  it('관심분야 칩 재필터: 리더십 선택 → active 표시 + 추천 캐러셀 재필터', async () => {
    const user = userEvent.setup();
    renderHome();
    await screen.findByText(/많이 본 컨텐츠/);
    // 기본 'mine' 분야 시드
    expect(await screen.findByText(/디자인 시스템 구축 시 꼭 알아야 할 토큰 체계/)).toBeInTheDocument();

    const leadership = screen.getByRole('button', { name: '리더십' });
    await user.click(leadership);
    expect(leadership).toHaveAttribute('aria-pressed', 'true');

    // 리더십 시드 카피 등장
    expect(await screen.findByText(/실리콘밸리 리더가 말하는 팀 신뢰의 조건/)).toBeInTheDocument();
  });

  it('카드 클릭 → /content/:id 라우팅(상세 스텁 노출)', async () => {
    const user = userEvent.setup();
    renderHome();
    const recCard = await screen.findByText(/디자인 시스템 구축 시 꼭 알아야 할 토큰 체계/);
    await user.click(recCard.closest('button')!);

    // /content/:id 라우팅 도착(라우팅 타깃 — 상세 화면 자체는 u4)
    expect(await screen.findByText('route:content:rec-mine-1')).toBeInTheDocument();
  });
});
