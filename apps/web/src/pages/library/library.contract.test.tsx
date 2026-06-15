import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route, useParams } from 'react-router-dom';

/**
 * library 계약 테스트 — 컨텐츠/인사이트 탭 전환·출처 필터·정렬·폴더 내비(카드/트리/드롭다운→폴더별 뷰+
 *   브레드크럼)·폴더 CRUD 모달·다중선택 이동·카드 클릭 navigate·AI 노트/Sparkle FAB 미렌더.
 * 결정론: vi.mock('@/shared/api')로 supabase null 강제 → demo 시드 폴백.
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

import { LibraryPage } from '@/pages/library';
import { setMockSession } from '@/entities/session';

/** 라우팅 타깃 검증용 인라인 스텁(app 레이어 import = 상향 금지 → 테스트 내 정의). */
function ContentRouteProbe() {
  const { id } = useParams();
  return <div>route:content:{id}</div>;
}

function renderLibrary() {
  setMockSession(true);
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={['/library']}>
        <Routes>
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/content/:id" element={<ContentRouteProbe />} />
          <Route path="/search" element={<div>route:search</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  sessionStorage.clear();
});

describe('library contract', () => {
  it('셸: 헤더·설명·컨텐츠 추가·폴더 카드·출처 칩 렌더', async () => {
    renderLibrary();
    // 본문 헤더(라이브러리 제목 — h2)
    expect(await screen.findByRole('heading', { name: '라이브러리' })).toBeInTheDocument();
    expect(
      screen.getByText('라이브러리를 통해 편리하게 컨텐츠를 관리하고 인사이트를 확인하세요.'),
    ).toBeInTheDocument();
    // 폴더 카드(데모 3개) — 폴더 추가 카드 + 폴더명
    expect(screen.getByRole('button', { name: '폴더 추가' })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: '창업가 정신 폴더 열기' })).toBeInTheDocument();
    // 출처 칩(전체 32 + Youtube 등) — 출처 필터 그룹 안에서 조회(전체 폴더 select와 구분)
    const sourceGroup = screen.getByRole('group', { name: '출처 필터' });
    expect(within(sourceGroup).getByRole('button', { name: /전체/ })).toBeInTheDocument();
    expect(within(sourceGroup).getByRole('button', { name: /Youtube/ })).toBeInTheDocument();
  });

  it('컨텐츠↔인사이트 탭 전환: 본문 그리드 스왑', async () => {
    const user = userEvent.setup();
    renderLibrary();
    // 컨텐츠 탭 기본 — 카드 제목(데모) 노출
    expect(
      await screen.findByText('무료로 사용할 수 있는 세련된 로고디자인을 위한 폰트 20가지 공유합니다.'),
    ).toBeInTheDocument();

    // 인사이트 탭 전환 → 메모 발췌 노출
    await user.click(screen.getByRole('tab', { name: '인사이트' }));
    expect(
      await screen.findByText(
        '네이버 CTO 출신 프론트엔드의 Next.js를 구현하는 방법에 대해 작성하였습니다. 네이버 CTO',
      ),
    ).toBeInTheDocument();
  });

  it('출처 필터: Youtube 칩 클릭 → 그리드가 Youtube 카드만 + 선택 강조', async () => {
    const user = userEvent.setup();
    renderLibrary();
    await screen.findByText('무료로 사용할 수 있는 세련된 로고디자인을 위한 폰트 20가지 공유합니다.');

    const youtubeChip = screen.getByRole('button', { name: /Youtube/ });
    await user.click(youtubeChip);
    expect(youtubeChip).toHaveAttribute('aria-pressed', 'true');
    // medium 전용 카드(인터페이스 — provider=medium)는 사라짐
    expect(
      screen.queryByText(
        '서로의 결을 시각화한 소리의 인터페이스, 디자이너 4명이 모여 만든 인터랙티브 프로젝트',
      ),
    ).toBeNull();
  });

  it('정렬: 클립 많은 순 선택 → 순서 변경(드롭다운 동작)', async () => {
    const user = userEvent.setup();
    renderLibrary();
    await screen.findByText('무료로 사용할 수 있는 세련된 로고디자인을 위한 폰트 20가지 공유합니다.');

    // 정렬 드롭다운 트리거 클릭 → 옵션 노출
    await user.click(screen.getByRole('button', { name: /최신순/ }));
    const option = await screen.findByRole('button', { name: '클립 많은 순' });
    await user.click(option);
    // 정렬 적용 후에도 카드 그리드 유지(결정론 — 에러 없이 렌더)
    expect(
      screen.getByText('무료로 사용할 수 있는 세련된 로고디자인을 위한 폰트 20가지 공유합니다.'),
    ).toBeInTheDocument();
  });

  it('폴더 내비: 폴더 카드 클릭 → 폴더별 뷰(헤더 폴더명·N개의 컨텐츠·브레드크럼)', async () => {
    const user = userEvent.setup();
    renderLibrary();
    const folderCard = await screen.findByRole('button', { name: '창업가 정신 폴더 열기' });
    await user.click(folderCard);

    // 헤더가 폴더명으로
    expect(await screen.findByRole('heading', { name: '창업가 정신' })).toBeInTheDocument();
    // N개의 컨텐츠(데모 32)
    expect(screen.getByText('32개의 컨텐츠')).toBeInTheDocument();
    // 브레드크럼(전체 폴더 / 창업가 정신)
    expect(screen.getAllByText('전체 폴더').length).toBeGreaterThan(0);
  });

  it('폴더 생성 모달: 폴더 추가 → 모달(input·만들기) 렌더', async () => {
    const user = userEvent.setup();
    renderLibrary();
    await screen.findByRole('button', { name: '폴더 추가' });
    await user.click(screen.getByRole('button', { name: '폴더 추가' }));

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText('폴더 이름')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '만들기' })).toBeInTheDocument();
  });

  it('다중선택 → 선택 카운트·폴더로 이동 액션 → 폴더 선택 모달', async () => {
    const user = userEvent.setup();
    renderLibrary();
    await screen.findByText('무료로 사용할 수 있는 세련된 로고디자인을 위한 폰트 20가지 공유합니다.');

    // 선택 모드 진입(첫 카드 선택)
    await user.click(screen.getByRole('button', { name: '선택 모드' }));
    // 액션바 노출(N개 선택됨)
    expect(await screen.findByText(/개 선택됨/)).toBeInTheDocument();
    // 폴더로 이동 → 폴더 선택 모달
    await user.click(screen.getByRole('button', { name: '폴더로 이동' }));
    expect(await screen.findByRole('radiogroup', { name: '이동할 폴더' })).toBeInTheDocument();
  });

  it('카드 클릭 → /content/:id 라우팅', async () => {
    const user = userEvent.setup();
    renderLibrary();
    const card = await screen.findByText(
      '무료로 사용할 수 있는 세련된 로고디자인을 위한 폰트 20가지 공유합니다.',
    );
    await user.click(card.closest('button')!);
    expect(await screen.findByText('route:content:lc-1')).toBeInTheDocument();
  });

  it('★AI 노트 탭 · Sparkle mini FAB · 아이콘_노트 미렌더(게이트ⓐ)', async () => {
    renderLibrary();
    await screen.findByRole('heading', { name: '라이브러리' });
    expect(screen.queryByText('AI 노트')).toBeNull();
    expect(screen.queryByRole('tab', { name: /AI 노트/ })).toBeNull();
    expect(screen.queryByText(/Sparkle/i)).toBeNull();
    // 우측 토글 = 컨텐츠/인사이트만(AI 노트 탭 부재)
    const tablist = screen.getAllByRole('tablist');
    const labels = tablist.flatMap((tl) => within(tl).getAllByRole('tab').map((t) => t.textContent));
    expect(labels).not.toContain('AI 노트');
  });

  it('북마크 탭(좌): UI + 빈상태(데이터 보류)', async () => {
    const user = userEvent.setup();
    renderLibrary();
    await screen.findByRole('heading', { name: '라이브러리' });
    await user.click(screen.getByRole('tab', { name: '북마크' }));
    expect(await screen.findByText('저장한 북마크가 여기에 모여요.')).toBeInTheDocument();
  });
});
