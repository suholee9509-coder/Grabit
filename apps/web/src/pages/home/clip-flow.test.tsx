import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * clip-flow 통합 테스트 — Step1→Step2 전환·트림 상태·태그 추가/자동완성/제거·
 *   [완료] 시 ingest_clip payload(구간 정수·tags[]·is_public·folder_id) 단언.
 * supabase-js는 shared/api 목킹으로 결정론적. (DB 불변식은 u0b pgTAP가 증명.)
 */

const ingestClip = vi.fn();

vi.mock('@/shared/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/api')>();
  return {
    ...actual,
    isSupabaseConfigured: () => true, // 실 ingest 경로 사용(데모 스텁 우회)
    ingestClip: (...args: unknown[]) => ingestClip(...args),
    // 폴더/태그는 결정론적 데모 풀로 반환(쿼리 함수 대체)
    fetchFolders: async () => actual.DEMO_FOLDERS,
    searchTags: async (prefix: string) => actual.demoSearchTags(prefix),
  };
});

import { HomePage } from '@/pages/home';

function renderApp() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <HomePage />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  ingestClip.mockReset();
  ingestClip.mockResolvedValue({
    id: 'c1',
    contentId: 'k1',
    startSec: 32,
    endSec: 61,
    memo: null,
    isPublic: false,
    folderId: null,
  });
});

const YT = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

async function openStep2(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: '컨텐츠 추가' }));
  // Step1 모달
  const dialog = await screen.findByRole('dialog');
  expect(within(dialog).getByText('새 클립 추가')).toBeInTheDocument();
  const input = within(dialog).getByLabelText('컨텐츠 링크');
  await user.type(input, YT);
  await user.click(within(dialog).getByRole('button', { name: '다음' }));
  // Step2 모달(편집)
  await screen.findByText('컨텐츠 추가', { selector: 'h2' });
}

describe('clip-flow', () => {
  it('Step1 → Step2 전환(유효 URL)', async () => {
    const user = userEvent.setup();
    renderApp();
    await openStep2(user);
    // 편집 모달 핵심 영역 노출
    expect(screen.getByText('인사이트')).toBeInTheDocument();
    expect(screen.getByText('공개 범위 설정')).toBeInTheDocument();
    expect(screen.getByText('저장 폴더')).toBeInTheDocument();
    expect(screen.getByText('태그')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '완료' })).toBeInTheDocument();
  });

  it('잘못된 URL → [다음] 비활성 + 에러', async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByRole('button', { name: '컨텐츠 추가' }));
    const dialog = await screen.findByRole('dialog');
    const next = within(dialog).getByRole('button', { name: '다음' });
    expect(next).toBeDisabled();
    await user.type(within(dialog).getByLabelText('컨텐츠 링크'), 'https://vimeo.com/123');
    expect(next).toBeDisabled();
    // 입력 blur(touched) → 에러 노출
    await user.tab();
    expect(within(dialog).getByRole('alert')).toBeInTheDocument();
  });

  it('트림: 시작/끝 핸들 상태(초 정수, [start,end) 길이)', async () => {
    const user = userEvent.setup();
    renderApp();
    await openStep2(user);
    const startHandle = screen.getByRole('slider', { name: '시작 지점' });
    const endHandle = screen.getByRole('slider', { name: '끝 지점' });
    // 초기 구간(32→61) = 29초
    expect(startHandle).toHaveAttribute('aria-valuenow', '32');
    expect(endHandle).toHaveAttribute('aria-valuenow', '61');
    expect(screen.getByText('29초')).toBeInTheDocument();
    // 키보드로 끝 +1 → 30초
    endHandle.focus();
    await user.keyboard('{ArrowRight}');
    expect(endHandle).toHaveAttribute('aria-valuenow', '62');
    expect(screen.getByText('30초')).toBeInTheDocument();
  });

  it('태그: 자동완성 추천 + Enter 추가 + 삽입 순서 + 제거', async () => {
    const user = userEvent.setup();
    renderApp();
    await openStep2(user);
    // [추가] 칩 → 입력 모드
    await user.click(screen.getByRole('button', { name: '태그 추가' }));
    const tagInput = screen.getByLabelText('태그 입력');
    await user.type(tagInput, '개발');
    // 자동완성 추천(데모: 개발자/클라우드 개발/백엔드 개발/프론트엔드 개발)
    const listbox = await screen.findByRole('listbox');
    const options = within(listbox).getAllByRole('option');
    expect(options.length).toBeGreaterThanOrEqual(3);
    // 첫 추천(개발자) 텍스트 존재
    expect(within(listbox).getByText('자')).toBeInTheDocument(); // 개발(매칭)+자(디밍)
    // 첫 추천 선택(개발자)
    await user.click(options[0]);
    // 새 칩 추가
    expect(screen.getByText('개발자')).toBeInTheDocument();

    // 둘째 태그를 Enter 신규 생성
    await user.click(screen.getByRole('button', { name: '태그 추가' }));
    const tagInput2 = screen.getByLabelText('태그 입력');
    await user.type(tagInput2, '신규태그{Enter}');
    expect(screen.getByText('신규태그')).toBeInTheDocument();

    // 제거
    const chip = screen.getByText('개발자').closest('button')!;
    await user.click(within(chip).getByLabelText('제거'));
    expect(screen.queryByText('개발자')).not.toBeInTheDocument();
  });

  it('[완료] → ingest_clip payload 단언(구간 정수·tags[]·is_public·folder_id)', async () => {
    const user = userEvent.setup();
    renderApp();
    await openStep2(user);

    // 메모
    await user.type(screen.getByLabelText('인사이트 메모'), '  회복 탄력성  ');
    // 공개 토글 ON
    await user.click(screen.getByRole('switch', { name: '공개 범위 설정' }));
    // 폴더 선택(창업가 정신) — 셀렉트 트리거 = aria-haspopup listbox
    const folderTrigger = screen.getByRole('button', { expanded: false, name: /폴더 선택/ });
    await user.click(folderTrigger);
    // Dropdown 옵션은 <li role=option><button> 구조 → 내부 버튼 클릭
    const folderOption = await screen.findByRole('option', { name: '창업가 정신' });
    await user.click(folderOption.querySelector('button') ?? folderOption);
    // 태그 추가
    await user.click(screen.getByRole('button', { name: '태그 추가' }));
    await user.type(screen.getByLabelText('태그 입력'), '창업{Enter}');

    // 완료
    await user.click(screen.getByRole('button', { name: '완료' }));

    await waitFor(() => expect(ingestClip).toHaveBeenCalledTimes(1));
    const payload = ingestClip.mock.calls[0][0];
    expect(payload.url).toBe(YT);
    expect(Number.isInteger(payload.startSec)).toBe(true);
    expect(Number.isInteger(payload.endSec)).toBe(true);
    expect(payload.endSec).toBeGreaterThan(payload.startSec);
    expect(payload.memo).toBe('회복 탄력성'); // trim
    expect(payload.isPublic).toBe(true);
    expect(payload.folderId).toBe('f-startup');
    expect(payload.tags).toEqual(['창업']);
  });

  it('[완료] 성공 → 완료 토스트 + 모달 닫힘', async () => {
    const user = userEvent.setup();
    renderApp();
    await openStep2(user);
    await user.click(screen.getByRole('button', { name: '완료' }));
    await screen.findByText('클립을 저장했어요.');
    await waitFor(() =>
      expect(screen.queryByText('컨텐츠 추가', { selector: 'h2' })).not.toBeInTheDocument(),
    );
  });

  it('중복 태그 무시', async () => {
    const user = userEvent.setup();
    renderApp();
    await openStep2(user);
    await user.click(screen.getByRole('button', { name: '태그 추가' }));
    await user.type(screen.getByLabelText('태그 입력'), '창업{Enter}');
    await user.click(screen.getByRole('button', { name: '태그 추가' }));
    await user.type(screen.getByLabelText('태그 입력'), '창업{Enter}');
    expect(screen.getAllByText('창업')).toHaveLength(1);
  });
});
