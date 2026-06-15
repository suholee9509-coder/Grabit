import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

/**
 * settings 계약 테스트 — 계정메뉴 오픈·프로필 수정 검증(표시이름·관심 1~5·단일필수)·저장 토스트·
 *   로그아웃 확인→/login·탈퇴 확인모달(30일 유예·2단계 확인)·알림 토글·오발화 방지·결제 카테고리 부재.
 * 결정론: vi.mock('@/shared/api') supabase null → entities/profile·session 목 폴백.
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

import { SettingsPage } from '@/pages/settings';
import { setMockSession } from '@/entities/session';

function renderSettings() {
  setMockSession(true);
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={['/settings']}>
        <Routes>
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/login" element={<div>route:login</div>} />
          <Route path="/inbox" element={<div>route:inbox</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  sessionStorage.clear();
});

describe('settings contract', () => {
  it('셸: 설정 페이지 제목 + 3개 섹션(프로필·알림·계정)', async () => {
    renderSettings();
    expect(await screen.findByRole('heading', { name: '설정', level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '프로필', level: 2 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '알림', level: 2 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '계정', level: 2 })).toBeInTheDocument();
  });

  it('계정 메뉴 오픈: 프로필 카드 클릭 → 팝오버 4항목', async () => {
    const user = userEvent.setup();
    renderSettings();
    await screen.findByRole('heading', { name: '설정', level: 1 });

    // 프로필 카드(sidebar 진입점) 클릭 → 계정 메뉴
    const profileCard = screen.getByRole('button', { name: /Grabit 사용자|Leesuho/ });
    await user.click(profileCard);

    const menu = await screen.findByRole('menu', { name: '계정 메뉴' });
    expect(within(menu).getByRole('menuitem', { name: '프로필 설정' })).toBeInTheDocument();
    expect(within(menu).getByRole('menuitem', { name: '설정' })).toBeInTheDocument();
    expect(within(menu).getByRole('menuitem', { name: '로그아웃' })).toBeInTheDocument();
    expect(within(menu).getByRole('menuitem', { name: '회원 탈퇴' })).toBeInTheDocument();
  });

  it('프로필 수정: 목값 렌더(표시이름·직업·관심 칩 선택 상태)', async () => {
    renderSettings();
    const nameInput = (await screen.findByLabelText('표시 이름')) as HTMLInputElement;
    expect(nameInput.value).toBe('Leesuho');
    // 직업 칩 '개발자' 선택 상태
    const jobGroup = screen.getByRole('group', { name: '직업' });
    expect(within(jobGroup).getByRole('button', { name: '개발자' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    // 관심분야 칩 '프로그래밍' 선택 상태
    const interestGroup = screen.getByRole('group', { name: '관심분야' });
    expect(within(interestGroup).getByRole('button', { name: '프로그래밍' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('프로필 수정: 빈 표시이름 → invalid + 저장 차단', async () => {
    const user = userEvent.setup();
    renderSettings();
    const nameInput = (await screen.findByLabelText('표시 이름')) as HTMLInputElement;
    await user.clear(nameInput);
    expect(await screen.findByText('표시 이름을 입력해 주세요.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '저장' })).toBeDisabled();
  });

  it('프로필 수정: 관심분야 전부 해제 → 저장 차단(INTERESTS_MIN)', async () => {
    const user = userEvent.setup();
    renderSettings();
    await screen.findByLabelText('표시 이름');
    const interestGroup = screen.getByRole('group', { name: '관심분야' });
    // 선택된 칩(프로그래밍·커리어) 해제
    await user.click(within(interestGroup).getByRole('button', { name: '프로그래밍' }));
    await user.click(within(interestGroup).getByRole('button', { name: '커리어' }));
    expect(await screen.findByText('관심분야를 1개 이상 선택해 주세요.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '저장' })).toBeDisabled();
  });

  it('프로필 수정: 관심 5개 도달 → 미선택 칩 비활성(MAX 강제)', async () => {
    const user = userEvent.setup();
    renderSettings();
    await screen.findByLabelText('표시 이름');
    const interestGroup = screen.getByRole('group', { name: '관심분야' });
    // 현재 2개 선택 → 3개 더 선택해 5개
    await user.click(within(interestGroup).getByRole('button', { name: '디자인' }));
    await user.click(within(interestGroup).getByRole('button', { name: '리더십' }));
    await user.click(within(interestGroup).getByRole('button', { name: '마인드셋' }));
    // 6번째 미선택 칩은 비활성
    expect(within(interestGroup).getByRole('button', { name: '포트폴리오' })).toBeDisabled();
  });

  it('프로필 수정: 표시이름 변경 → 저장 → 성공 토스트', async () => {
    const user = userEvent.setup();
    renderSettings();
    const nameInput = (await screen.findByLabelText('표시 이름')) as HTMLInputElement;
    await user.clear(nameInput);
    await user.type(nameInput, 'NewName');
    const save = screen.getByRole('button', { name: '저장' });
    expect(save).toBeEnabled();
    await user.click(save);
    expect(await screen.findByText('프로필을 저장했어요.')).toBeInTheDocument();
  });

  it('로그아웃: 메뉴 → 확인 모달 → 확정 → /login 리다이렉트', async () => {
    const user = userEvent.setup();
    renderSettings();
    await screen.findByRole('heading', { name: '설정', level: 1 });
    await user.click(screen.getByRole('button', { name: /Grabit 사용자|Leesuho/ }));
    await user.click(await screen.findByRole('menuitem', { name: '로그아웃' }));

    // 확인 모달
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('로그아웃 할까요?')).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: '로그아웃' }));
    expect(await screen.findByText('route:login')).toBeInTheDocument();
  });

  it('탈퇴: 확인 모달(30일 유예·복구 안내) + 동의 전 확정 비활성(오발화 방지)', async () => {
    const user = userEvent.setup();
    renderSettings();
    await screen.findByRole('heading', { name: '설정', level: 1 });
    await user.click(screen.getByRole('button', { name: /Grabit 사용자|Leesuho/ }));
    await user.click(await screen.findByRole('menuitem', { name: '회원 탈퇴' }));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('정말 탈퇴하시겠어요?')).toBeInTheDocument();
    expect(within(dialog).getByText(/30일간 유예/)).toBeInTheDocument();
    // 복구 안내 문구 존재(여러 곳 — 최소 1개 이상)
    expect(within(dialog).getAllByText(/복구/).length).toBeGreaterThan(0);

    // 동의 체크 전 → 확정 버튼 비활성(soft_delete 미호출)
    const confirm = within(dialog).getByRole('button', { name: '탈퇴하기' });
    expect(confirm).toBeDisabled();

    // 동의 체크 → 활성 → 확정 → 안내 토스트
    await user.click(within(dialog).getByRole('checkbox'));
    expect(confirm).toBeEnabled();
    await user.click(confirm);
    expect(
      await screen.findByText('탈퇴가 접수됐어요. 30일 안에 재로그인하면 복구할 수 있어요.'),
    ).toBeInTheDocument();
  });

  it('알림: 토글 행 렌더 + ON/OFF 저장 + 결제 카테고리 부재', async () => {
    const user = userEvent.setup();
    renderSettings();
    await screen.findByRole('heading', { name: '알림', level: 2 });

    // 트렌드 알림 토글(기본 ON) → OFF
    const trend = await screen.findByRole('switch', { name: '트렌드 알림 알림' });
    expect(trend).toHaveAttribute('aria-checked', 'true');
    await user.click(trend);
    await screen.findByRole('switch', { name: '트렌드 알림 알림', checked: false });

    // 결제/구독 카테고리 부재(게이트 ⓐ)
    expect(screen.queryByRole('switch', { name: /구독|결제|영수증|만료/ })).toBeNull();
  });

  it('오발화 방지: 메뉴에서 탈퇴 선택만으로는 soft_delete 미실행(확인 모달 필요)', async () => {
    const user = userEvent.setup();
    renderSettings();
    await screen.findByRole('heading', { name: '설정', level: 1 });
    await user.click(screen.getByRole('button', { name: /Grabit 사용자|Leesuho/ }));
    await user.click(await screen.findByRole('menuitem', { name: '회원 탈퇴' }));
    // 모달만 열림 — 접수 토스트 없음(확정 전)
    expect(screen.queryByText(/탈퇴가 접수됐어요/)).toBeNull();
  });
});
