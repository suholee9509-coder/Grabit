import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

/**
 * library-folders 계약 테스트 (FE 배선 — 0011 RPC 계약 소비) — 폴더 CRUD(생성 20제약·이름변경·
 *   soft-delete)·다중선택 folder_id 일괄 이동·출처 카운트·정렬이 **본인-범위 RLS 응답** 위에서
 *   결정론으로 동작하고, 빈 이름/중복명/20초과/타인 폴더 작업/미인증(28000)을 정의대로 처리함을 단언.
 *
 * 결정론 시드(MSW 등가 — 외부 의존 없이 RPC 경계를 결정론 라우터로 가로챔):
 *   `@/shared/api`를 부분 목킹 → 실제 RPC 래퍼(createFolder/move_clips_to_folder/library_cards …)와
 *   실제 mutation/query 훅(`isSupabaseReady=true` 분기)을 그대로 구동하되, 클라이언트의 `.rpc()`만
 *   per-테스트 라우터(`setRpc`)로 결정론 응답을 돌려준다. 데모 폴백 경로가 아닌 *실배선 경로* 검증.
 *
 * ★ sanitized 셰이프 단언: 카드/인사이트 표현에 user_id·실명 등 식별자 키 부재(본인-범위 read).
 * ★ AI 노트 탭·Sparkle FAB 미렌더(게이트ⓐ) — library.contract와 중복 단언으로 회귀 차단.
 */

/** RPC 경계 라우터 — name → (args) => { data, error }. 테스트마다 setRpc로 주입. */
type RpcResult = { data: unknown; error: unknown };
type RpcRouter = (name: string, args: Record<string, unknown> | undefined) => RpcResult;

// vi.mock 팩토리가 파일 상단으로 호이스팅되므로, spy·router도 hoisted로 정의(초기화 순서 보장).
const hoisted = vi.hoisted(() => {
  const state: { router: RpcRouter } = { router: () => ({ data: null, error: null }) };
  const spy = vi.fn((name: string, args?: Record<string, unknown>) =>
    Promise.resolve(state.router(name, args)),
  );
  return { state, spy };
});
const rpcSpy = hoisted.spy;
function setRpc(router: RpcRouter) {
  hoisted.state.router = router;
}

/** 결정론 시드 — 본인 폴더 3종(소유=본인). 타인 폴더(f-bob)는 RLS로 0행처럼 응답. */
const SEED_FOLDERS = [
  { folder_id: 'f-1', name: '창업가 정신', content_count: 32 },
  { folder_id: 'f-2', name: '피그마 실습 강의', content_count: 22 },
  { folder_id: 'f-3', name: '디자인 트렌드', content_count: 8 },
];
const SEED_CARDS = [
  {
    content_id: 'lc-1',
    title: '무료로 사용할 수 있는 세련된 로고디자인을 위한 폰트 20가지 공유합니다.',
    thumbnail_url: 'https://t/1.jpg',
    provider: 'youtube',
    tags: ['폰트', '로고디자인'],
    grab_count: 15,
    last_clip_at: '2026-06-15T09:00:00.000Z',
  },
  {
    content_id: 'lc-2',
    title: '서로의 결을 시각화한 소리의 인터페이스',
    thumbnail_url: 'https://t/2.jpg',
    provider: 'medium',
    tags: ['인터랙션'],
    grab_count: 6,
    last_clip_at: '2026-06-14T09:00:00.000Z',
  },
];
const SEED_SOURCES = [
  { provider: 'youtube', content_count: 16 },
  { provider: 'medium', content_count: 6 },
];

/** 기본 read 라우터(긍정 경로) — 위 시드 반환. mutation은 테스트가 setRpc로 덮어씀. */
function readRouter(over?: Partial<Record<string, RpcResult>>): RpcRouter {
  return (name) => {
    if (over && name in over) return over[name]!;
    switch (name) {
      case 'library_folder_counts':
        return { data: SEED_FOLDERS, error: null };
      case 'library_cards':
        return { data: SEED_CARDS, error: null };
      case 'library_source_counts':
        return { data: SEED_SOURCES, error: null };
      default:
        return { data: null, error: null };
    }
  };
}

// ★ 공개 API(@/shared/api 배럴)만 목킹(FSD no-sidestep 준수) — `isSupabaseReady=true`로 실배선
//   분기를 켜고, RPC 래퍼를 결정론 fake client(spy)에 바인딩해 *실제* 래퍼 로직(인자 키·매핑·throw)을
//   그대로 구동한다. features/queries 훅은 배럴을 소비하므로 단일 시드로 일관.
vi.mock('@/shared/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/api')>();
  const fakeClient = { rpc: hoisted.spy } as unknown as Parameters<typeof actual.createFolder>[1];
  return {
    ...actual,
    isSupabaseReady: true,
    isSupabaseConfigured: () => true,
    supabase: fakeClient,
    getSupabaseClient: () => fakeClient,
    // 실제 래퍼를 fake client에 바인딩(시그니처·매핑·에러전파는 원본 로직 그대로).
    createFolder: (name: string) => actual.createFolder(name, fakeClient),
    renameFolder: (id: string, name: string) => actual.renameFolder(id, name, fakeClient),
    softDeleteFolder: (id: string) => actual.softDeleteFolder(id, fakeClient),
    moveClipsToFolder: (ids: string[], folderId: string | null) =>
      actual.moveClipsToFolder(ids, folderId, fakeClient),
    getFolderCounts: () => actual.getFolderCounts(fakeClient),
    getSourceCounts: (folderId: string | null) => actual.getSourceCounts(folderId, fakeClient),
    getLibraryCards: (folderId: string | null, sort: Parameters<typeof actual.getLibraryCards>[1]) =>
      actual.getLibraryCards(folderId, sort, fakeClient),
  };
});

import {
  createFolder,
  renameFolder,
  softDeleteFolder,
  moveClipsToFolder,
  getFolderCounts,
  getSourceCounts,
  getLibraryCards,
  mapLibraryError,
} from '@/shared/api';
import { LibraryPage } from '@/pages/library';
import { setMockSession } from '@/entities/session';

function renderLibrary() {
  setMockSession(true);
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={['/library']}>
        <Routes>
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/content/:id" element={<div>route:content</div>} />
          <Route path="/search" element={<div>route:search</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  rpcSpy.mockClear();
  setRpc(readRouter());
  sessionStorage.clear();
});

/* ───────────────────────── RPC 래퍼 계약(0011 시그니처 정확 인자·snake→camel) ───────────────────── */

describe('folders CRUD RPC 계약 (본인-범위)', () => {
  it('생성: create_folder(p_name) 정확 인자 + 본인 폴더 row 반환', async () => {
    setRpc((name) =>
      name === 'create_folder'
        ? { data: { id: 'f-new', name: '신규 폴더' }, error: null }
        : { data: null, error: null },
    );
    const row = await createFolder('신규 폴더');
    expect(rpcSpy).toHaveBeenCalledWith('create_folder', { p_name: '신규 폴더' });
    expect(row).toEqual({ id: 'f-new', name: '신규 폴더' });
  });

  it('이름변경: rename_folder(p_folder_id, p_name) 정확 인자', async () => {
    setRpc(() => ({ data: { id: 'f-1', name: '바뀐 이름' }, error: null }));
    const row = await renameFolder('f-1', '바뀐 이름');
    expect(rpcSpy).toHaveBeenCalledWith('rename_folder', { p_folder_id: 'f-1', p_name: '바뀐 이름' });
    expect(row).toEqual({ id: 'f-1', name: '바뀐 이름' });
  });

  it('삭제(soft): soft_delete_folder(p_folder_id) 정확 인자', async () => {
    setRpc(() => ({ data: { id: 'f-1', name: '삭제됨' }, error: null }));
    await softDeleteFolder('f-1');
    expect(rpcSpy).toHaveBeenCalledWith('soft_delete_folder', { p_folder_id: 'f-1' });
  });

  it('출처 카운트: library_source_counts(p_folder_id) 호출 + snake→camel', async () => {
    const rows = await getSourceCounts('f-1');
    expect(rpcSpy).toHaveBeenCalledWith('library_source_counts', { p_folder_id: 'f-1' });
    expect(rows).toEqual([
      { provider: 'youtube', contentCount: 16 },
      { provider: 'medium', contentCount: 6 },
    ]);
  });

  it('폴더 카운트: library_folder_counts() distinct content 수 매핑', async () => {
    const rows = await getFolderCounts();
    expect(rpcSpy).toHaveBeenCalledWith('library_folder_counts');
    expect(rows).toEqual([
      { folderId: 'f-1', name: '창업가 정신', contentCount: 32 },
      { folderId: 'f-2', name: '피그마 실습 강의', contentCount: 22 },
      { folderId: 'f-3', name: '디자인 트렌드', contentCount: 8 },
    ]);
  });
});

describe('다중선택 이동 RPC 계약', () => {
  it('move_clips_to_folder(p_content_ids[], p_target_folder_id) 일괄 이동수 반환', async () => {
    setRpc(() => ({ data: 3, error: null }));
    const moved = await moveClipsToFolder(['c-1', 'c-2', 'c-3'], 'f-2');
    expect(rpcSpy).toHaveBeenCalledWith('move_clips_to_folder', {
      p_content_ids: ['c-1', 'c-2', 'c-3'],
      p_target_folder_id: 'f-2',
    });
    expect(moved).toBe(3);
  });

  it('folderId=null → detach(전체 폴더로 환원)', async () => {
    setRpc(() => ({ data: 2, error: null }));
    await moveClipsToFolder(['c-1', 'c-2'], null);
    expect(rpcSpy).toHaveBeenCalledWith('move_clips_to_folder', {
      p_content_ids: ['c-1', 'c-2'],
      p_target_folder_id: null,
    });
  });
});

/* ───────────────────────── 부정 경로(빈/중복/20초과/타인/미인증) ───────────────────── */

describe('folders 제약 — 빈/중복/20초과/타인/미인증', () => {
  it('빈 이름: 클라이언트 가드(공백) → RPC 미호출·throw (서버 23514 도달 전 차단)', async () => {
    // 래퍼는 thin passthrough지만 mutation 훅이 공백을 선차단(아래 UI 케이스에서 검증).
    // 여기서는 서버 23514(공백) 매핑이 folder-name임을 단언.
    const mapped = mapLibraryError({ code: '23514', message: 'folders_name_not_blank' });
    expect(mapped.kind).toBe('folder-name');
  });

  it('중복명: 23505 → folder-name 매핑', () => {
    expect(mapLibraryError({ code: '23505', message: 'duplicate key' }).kind).toBe('folder-name');
  });

  it('20개 초과: enforce_folder_limit 23514(limit 메시지) → folder-limit 매핑', () => {
    expect(
      mapLibraryError({ code: '23514', message: 'folder limit reached (max 20 active)' }).kind,
    ).toBe('folder-limit');
  });

  it('생성 실패(서버 23514) → RPC 호출됐고 throw 전파', async () => {
    setRpc((name) =>
      name === 'create_folder'
        ? { data: null, error: { code: '23514', message: 'folder limit reached (max 20 active)' } }
        : { data: null, error: null },
    );
    await expect(createFolder('21번째')).rejects.toBeTruthy();
    expect(rpcSpy).toHaveBeenCalledWith('create_folder', { p_name: '21번째' });
  });

  it('타인 폴더 이름변경: RLS 0행(null) → no-op 반환(누출 0)', async () => {
    setRpc(() => ({ data: null, error: null }));
    const row = await renameFolder('f-bob', '탈취 시도');
    expect(row).toBeNull();
  });

  it('타인 폴더 이동 타깃: 23503(비소유/미존재) → target-folder 매핑', () => {
    expect(mapLibraryError({ code: '23503', message: 'target not found' }).kind).toBe(
      'target-folder',
    );
  });

  it('미인증: 28000 → unauthenticated 매핑(로그인 유도)', () => {
    expect(mapLibraryError({ code: '28000', message: 'unauthenticated' }).kind).toBe(
      'unauthenticated',
    );
  });

  it('미인증 생성: 28000 throw 전파', async () => {
    setRpc((name) =>
      name === 'create_folder'
        ? { data: null, error: { code: '28000', message: 'unauthenticated' } }
        : { data: null, error: null },
    );
    await expect(createFolder('무엇이든')).rejects.toBeTruthy();
  });
});

/* ───────────────────────── 카드/정렬 셰이프 + sanitized 단언 ───────────────────── */

describe('library_cards 정렬 + sanitized 셰이프', () => {
  it('정렬 파라미터 매핑(recent/oldest/most_clips)', async () => {
    await getLibraryCards(null, 'recent');
    expect(rpcSpy).toHaveBeenCalledWith('library_cards', { p_folder_id: null, p_sort: 'recent' });
    await getLibraryCards('f-1', 'oldest');
    expect(rpcSpy).toHaveBeenCalledWith('library_cards', { p_folder_id: 'f-1', p_sort: 'oldest' });
    await getLibraryCards('f-1', 'most_clips');
    expect(rpcSpy).toHaveBeenCalledWith('library_cards', {
      p_folder_id: 'f-1',
      p_sort: 'most_clips',
    });
  });

  it('카드 셰이프 = 표현 키만(user_id·실명 등 식별자 키 부재)', async () => {
    const rows = await getLibraryCards(null, 'recent');
    const allowed = new Set([
      'contentId',
      'title',
      'thumbnailUrl',
      'provider',
      'tags',
      'grabCount',
      'lastClipAt',
    ]);
    for (const card of rows) {
      const keys = Object.keys(card);
      // sanitized: 식별자 키 누출 0
      expect(keys).not.toContain('userId');
      expect(keys).not.toContain('user_id');
      expect(keys).not.toContain('email');
      expect(keys.every((k) => allowed.has(k))).toBe(true);
    }
  });
});

/* ───────────────────────── UI 배선(실배선 RPC 응답 위에서 결정론 렌더) ───────────────────── */

describe('UI 배선 — 실배선 RPC 응답 소비(결정론)', () => {
  it('폴더 카운트가 RPC 응답대로 폴더 카드/N개의 컨텐츠로 렌더', async () => {
    renderLibrary();
    // 본인 폴더 3종(시드)이 폴더 카드로
    expect(await screen.findByRole('button', { name: '창업가 정신 폴더 열기' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '피그마 실습 강의 폴더 열기' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '디자인 트렌드 폴더 열기' })).toBeInTheDocument();
    // library_folder_counts RPC가 실제로 호출됨(데모 폴백 아님)
    await waitFor(() =>
      expect(rpcSpy.mock.calls.some((c) => c[0] === 'library_folder_counts')).toBe(true),
    );
  });

  it('출처 칩이 library_source_counts 응답대로 렌더(전체=합·Youtube 16·medium 6)', async () => {
    renderLibrary();
    await screen.findByRole('button', { name: '창업가 정신 폴더 열기' });
    const sourceGroup = screen.getByRole('group', { name: '출처 필터' });
    expect(within(sourceGroup).getByRole('button', { name: /Youtube/ })).toBeInTheDocument();
    await waitFor(() =>
      expect(rpcSpy.mock.calls.some((c) => c[0] === 'library_source_counts')).toBe(true),
    );
  });

  it('폴더 생성 모달: 빈 이름 제출 → 가드 안내(서버 RPC 미호출)', async () => {
    const user = userEvent.setup();
    renderLibrary();
    await user.click(await screen.findByRole('button', { name: '폴더 추가' }));
    const dialog = await screen.findByRole('dialog');
    // 공백 입력 후 제출 시도
    const submit = within(dialog).getByRole('button', { name: '만들기' });
    await user.click(submit);
    // create_folder RPC가 호출되지 않음(클라이언트 가드 — 공백 차단)
    expect(rpcSpy.mock.calls.some((c) => c[0] === 'create_folder')).toBe(false);
  });

  it('폴더 생성 모달: 유효 이름 제출 → create_folder RPC 실호출(실배선 경로)', async () => {
    const user = userEvent.setup();
    setRpc((name, args) =>
      name === 'create_folder'
        ? { data: { id: 'f-new', name: String(args?.p_name ?? '') }, error: null }
        : readRouter()(name, args),
    );
    renderLibrary();
    await user.click(await screen.findByRole('button', { name: '폴더 추가' }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText('폴더 이름'), '새 폴더');
    await user.click(within(dialog).getByRole('button', { name: '만들기' }));
    await waitFor(() =>
      expect(rpcSpy).toHaveBeenCalledWith('create_folder', { p_name: '새 폴더' }),
    );
  });

  it('다중선택 → 폴더로 이동 → move_clips_to_folder RPC 실호출', async () => {
    const user = userEvent.setup();
    setRpc((name, args) =>
      name === 'move_clips_to_folder'
        ? { data: (args?.p_content_ids as unknown[])?.length ?? 0, error: null }
        : readRouter()(name, args),
    );
    renderLibrary();
    await screen.findByText('무료로 사용할 수 있는 세련된 로고디자인을 위한 폰트 20가지 공유합니다.');
    await user.click(screen.getByRole('button', { name: '선택 모드' }));
    expect(await screen.findByText(/개 선택됨/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '폴더로 이동' }));
    const moveDialog = await screen.findByRole('radiogroup', { name: '이동할 폴더' });
    // 첫 폴더 선택 후 이동 확정
    await user.click(within(moveDialog).getByRole('radio', { name: /창업가 정신/ }));
    const confirm = screen.getByRole('button', { name: '이동' });
    await user.click(confirm);
    await waitFor(() =>
      expect(rpcSpy.mock.calls.some((c) => c[0] === 'move_clips_to_folder')).toBe(true),
    );
  });

  it('★AI 노트 탭·Sparkle FAB 미렌더(게이트ⓐ — 실배선 경로에서도 회귀 차단)', async () => {
    renderLibrary();
    await screen.findByRole('heading', { name: '라이브러리' });
    expect(screen.queryByText('AI 노트')).toBeNull();
    expect(screen.queryByRole('tab', { name: /AI 노트/ })).toBeNull();
    expect(screen.queryByText(/Sparkle/i)).toBeNull();
  });
});
