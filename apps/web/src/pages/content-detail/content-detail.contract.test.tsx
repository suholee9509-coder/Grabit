import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route, useParams } from 'react-router-dom';

/**
 * content-detail 계약 테스트 — 탭 전환·사이드바 펼침/접힘·마커 seek·인사이트 sanitized 셰이프·
 *   히트맵 0건·AI 노트 탭/Sparkle FAB 미렌더·댓글 목킹 비활성·유사컨텐츠 navigate.
 * 결정론: vi.mock('@/shared/api')로 supabase null 강제 → demo 시드 경로(콜드스타트 폴백).
 *   인증 mock(setMockSession)로 쓰기 액션 분기.
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

// VideoPlayer seekTo 스파이 — ref 명령 단언(실 iframe 미로드).
const seekToSpy = vi.fn();
vi.mock('@/widgets/video-player', async () => {
  const React = await import('react');
  return {
    VideoPlayer: React.forwardRef(function MockPlayer(
      _props: Record<string, unknown>,
      ref: React.Ref<{ seekTo: (s: number) => void }>,
    ) {
      React.useImperativeHandle(ref, () => ({ seekTo: seekToSpy }), []);
      return React.createElement('div', { 'data-testid': 'mock-player' });
    }),
  };
});

import { ContentDetailPage } from '@/pages/content-detail';
import { setMockSession } from '@/entities/session';

/** 라우팅 타깃 검증용 인라인 스텁(app 레이어 import = 상향 금지 → 테스트 내 정의). */
function ContentRouteProbe() {
  const { id } = useParams();
  return <div>route:content:{id}</div>;
}

function renderDetail(authed = false) {
  if (authed) setMockSession(true);
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={['/content/c-1']}>
        <Routes>
          <Route path="/content/:id" element={<ContentDetailPage />} />
          <Route path="/login" element={<div>route:login</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  seekToSpy.mockClear();
  sessionStorage.clear();
});

describe('content-detail contract', () => {
  it('탭 전환: 시청 정보 ↔ 원본 소스 (플레이어 공유 · 디바이더 아래 본문 스왑)', async () => {
    const user = userEvent.setup();
    renderDetail();

    // 시청 정보 탭: 플레이어 + 인사이트 섹션(디바이더 아래 분석 그룹)
    expect(await screen.findByTestId('mock-player')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '인상깊게 본 인사이트' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '원본 컨텐츠 정보' })).not.toBeInTheDocument();

    // 원본 소스 탭으로 전환 → 디바이더 아래만 "원본 컨텐츠 정보"로 스왑(플레이어는 공유 유지)
    await user.click(screen.getByRole('tab', { name: '원본 소스' }));
    expect(await screen.findByRole('heading', { name: '원본 컨텐츠 정보' })).toBeInTheDocument();
    expect(screen.getByTestId('mock-player')).toBeInTheDocument(); // ★플레이어 공유(프레임 1:1)
    expect(screen.queryByRole('heading', { name: '인상깊게 본 인사이트' })).not.toBeInTheDocument();
    // active 표시(segment selected)
    expect(screen.getByRole('tab', { name: '원본 소스' })).toHaveAttribute('aria-selected', 'true');

    // 다시 시청 정보로
    await user.click(screen.getByRole('tab', { name: '시청 정보' }));
    expect(await screen.findByRole('heading', { name: '인상깊게 본 인사이트' })).toBeInTheDocument();
    expect(screen.getByTestId('mock-player')).toBeInTheDocument();
  });

  it('사이드바 토글: 펼침(인사이트 탭) → 접힘(작성+expand만) → 복귀', async () => {
    const user = userEvent.setup();
    renderDetail();
    await screen.findByTestId('mock-player');

    // 펼침: 인사이트 탭 + 댓글 카드 노출
    expect(screen.getByRole('tab', { name: /인사이트/ })).toBeInTheDocument();
    expect(screen.getByText('성공 사례보다 실패를 견디는 태도가 더 오래 남는다는 말이 인상 깊었어요. 결국 버티는 사람이 이긴다는 것.')).toBeInTheDocument();

    // 접기
    await user.click(screen.getByRole('button', { name: '사이드바 접기' }));
    // 접힘 = 펼치기 토글 노출, 인사이트 탭/댓글 사라짐
    expect(await screen.findByRole('button', { name: '사이드바 펼치기' })).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: /인사이트/ })).not.toBeInTheDocument();

    // 다시 펼치기
    await user.click(screen.getByRole('button', { name: '사이드바 펼치기' }));
    expect(await screen.findByRole('tab', { name: /인사이트/ })).toBeInTheDocument();
  });

  it('마커 seek: 히트맵 마커 클릭 → VideoPlayer.seekTo(startSec) 호출', async () => {
    const user = userEvent.setup();
    renderDetail();
    await screen.findByTestId('mock-player');

    // 히트맵 마커(aria-label "N초로 이동") 중 하나 클릭
    const markers = await screen.findAllByRole('button', { name: /초로 이동$/ });
    expect(markers.length).toBeGreaterThan(0);
    await user.click(markers[0]);
    expect(seekToSpy).toHaveBeenCalledTimes(1);
    expect(typeof seekToSpy.mock.calls[0][0]).toBe('number');
  });

  it('인기 구간 카드 클릭 → seekTo 호출', async () => {
    const user = userEvent.setup();
    renderDetail();
    await screen.findByTestId('mock-player');

    // "가장 인기있는 구간" 패널의 인기 클립 row(구간 라벨 포함) 클릭
    const segHeading = screen.getByRole('heading', { name: '가장 인기있는 구간' });
    expect(segHeading).toBeInTheDocument();
    const clipButtons = await screen.findAllByText(/\d+명이 그랩함/);
    await user.click(clipButtons[0].closest('button')!);
    expect(seekToSpy).toHaveBeenCalled();
  });

  it('인사이트 sanitized: cohortRevealed=false 행은 코호트 라벨 미렌더', async () => {
    renderDetail();
    await screen.findByTestId('mock-player');

    // 공개 코호트(3년차 프로덕트 디자이너) 라벨은 인사이트 카드에 등장
    expect(screen.getAllByText('3년차 프로덕트 디자이너').length).toBeGreaterThan(0);
    // 임계 미달 행의 메모는 렌더되나, 그 행의 코호트 라벨(직군)은 없음 → 메모 자체는 존재
    expect(
      screen.getAllByText('실패를 데이터로 쌓아두면 다음 의사결정이 빨라진다는 관점이 좋았습니다.')
        .length,
    ).toBeGreaterThan(0);
  });

  it('★AI 노트 탭 · Sparkle mini FAB 미렌더(게이트ⓐ 제외)', async () => {
    renderDetail();
    await screen.findByTestId('mock-player');
    expect(screen.queryByText('AI 노트')).toBeNull();
    expect(screen.queryByRole('tab', { name: /AI 노트/ })).toBeNull();
    // Sparkle FAB(접근성 라벨/텍스트) 부재
    expect(screen.queryByText(/Sparkle/i)).toBeNull();
  });

  it('댓글 목킹 비활성: 댓글 카드는 DEMO_COMMENTS로 렌더(BE 미호출)', async () => {
    renderDetail();
    await screen.findByTestId('mock-player');
    // 우측 사이드바 댓글 카드(목 작성자/답글 카피)
    expect(screen.getByText('이수호')).toBeInTheDocument();
    expect(screen.getByText('답글 3개 모두 보기')).toBeInTheDocument();
  });

  it('비로그인 쓰기: 좋아요/클립추가 클릭 → 로그인 유도(/login)', async () => {
    const user = userEvent.setup();
    renderDetail(false);
    await screen.findByTestId('mock-player');

    await user.click(screen.getByRole('button', { name: '클립 추가' }));
    expect(await screen.findByText('route:login')).toBeInTheDocument();
  });

  it('유사컨텐츠 navigate: 카드 클릭 → /content/:otherId 라우팅', async () => {
    const user = userEvent.setup();
    render(
      <QueryClientProvider
        client={new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })}
      >
        <MemoryRouter initialEntries={['/content/c-1']}>
          <Routes>
            <Route path="/content/c-1" element={<ContentDetailPage />} />
            <Route path="/content/:id" element={<ContentRouteProbe />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );
    await screen.findByTestId('mock-player');

    // 비슷한 컨텐츠 카드(시드 카피) 클릭
    const simCard = await screen.findByText('실리콘밸리에서 살아남는 한국 스타트업의 조건');
    await user.click(simCard.closest('button')!);
    expect(await screen.findByText('route:content:sim-1')).toBeInTheDocument();
  });
});
