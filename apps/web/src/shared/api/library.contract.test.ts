import { describe, expect, it, vi } from 'vitest';
import {
  createFolder,
  renameFolder,
  softDeleteFolder,
  moveClipsToFolder,
  getFolderCounts,
  getSourceCounts,
  getLibraryCards,
} from './library';
import { mapLibraryError } from './errors';
import type { SupabaseClient } from './supabase';

/**
 * library RPC 배선 테스트(0011 계약 소비) — 정확 인자 키·snake→camel 매핑·정렬 파라미터·에러 매핑.
 *   ★ 본인 행만(RLS) — cross-user 누출 0은 u0b pgTAP 정본(여기서 재단언 ❌, 동어반복 회피).
 */

function makeClient(rpc: ReturnType<typeof vi.fn>) {
  return { rpc } as unknown as SupabaseClient & { rpc: ReturnType<typeof vi.fn> };
}

describe('createFolder', () => {
  it('create_folder(p_name)을 정확 인자로 호출하고 row 매핑', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: { id: 'f-1', name: '창업가 정신' }, error: null });
    const row = await createFolder('창업가 정신', makeClient(rpc));
    expect(rpc).toHaveBeenCalledWith('create_folder', { p_name: '창업가 정신' });
    expect(row).toEqual({ id: 'f-1', name: '창업가 정신' });
  });

  it('서버 23514(공백) → 에러 throw(래퍼는 thin passthrough · 서버가 차단)', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: null, error: { code: '23514', message: 'name not blank' } });
    await expect(createFolder('   ', makeClient(rpc))).rejects.toThrow();
    expect(rpc).toHaveBeenCalledWith('create_folder', { p_name: '   ' });
  });
});

describe('renameFolder', () => {
  it('rename_folder(p_folder_id, p_name) 정확 인자', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: { id: 'f-1', name: '새 이름' }, error: null });
    const row = await renameFolder('f-1', '새 이름', makeClient(rpc));
    expect(rpc).toHaveBeenCalledWith('rename_folder', { p_folder_id: 'f-1', p_name: '새 이름' });
    expect(row).toEqual({ id: 'f-1', name: '새 이름' });
  });

  it('0행(null) = no-op 반환', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: null, error: null });
    const row = await renameFolder('f-x', '이름', makeClient(rpc));
    expect(row).toBeNull();
  });
});

describe('softDeleteFolder', () => {
  it('soft_delete_folder(p_folder_id) 정확 인자', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: { id: 'f-1', name: '삭제됨' }, error: null });
    const row = await softDeleteFolder('f-1', makeClient(rpc));
    expect(rpc).toHaveBeenCalledWith('soft_delete_folder', { p_folder_id: 'f-1' });
    expect(row).toEqual({ id: 'f-1', name: '삭제됨' });
  });
});

describe('moveClipsToFolder', () => {
  it('move_clips_to_folder(p_content_ids[], p_target_folder_id) 정확 인자 + 이동수 반환', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: 3, error: null });
    const moved = await moveClipsToFolder(['c-1', 'c-2', 'c-3'], 'f-2', makeClient(rpc));
    expect(rpc).toHaveBeenCalledWith('move_clips_to_folder', {
      p_content_ids: ['c-1', 'c-2', 'c-3'],
      p_target_folder_id: 'f-2',
    });
    expect(moved).toBe(3);
  });

  it('folderId=null = detach(전체 폴더)', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: 2, error: null });
    await moveClipsToFolder(['c-1', 'c-2'], null, makeClient(rpc));
    expect(rpc).toHaveBeenCalledWith('move_clips_to_folder', {
      p_content_ids: ['c-1', 'c-2'],
      p_target_folder_id: null,
    });
  });
});

describe('getFolderCounts', () => {
  it('library_folder_counts() 호출 + snake→camel', async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: [
        { folder_id: 'f-1', name: '창업가 정신', content_count: 32 },
        { folder_id: 'f-2', name: '피그마 실습 강의', content_count: 22 },
      ],
      error: null,
    });
    const rows = await getFolderCounts(makeClient(rpc));
    expect(rpc).toHaveBeenCalledWith('library_folder_counts');
    expect(rows).toEqual([
      { folderId: 'f-1', name: '창업가 정신', contentCount: 32 },
      { folderId: 'f-2', name: '피그마 실습 강의', contentCount: 22 },
    ]);
  });
});

describe('getSourceCounts', () => {
  it('library_source_counts(p_folder_id) 호출 + 매핑', async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: [
        { provider: 'youtube', content_count: 16 },
        { provider: 'medium', content_count: 6 },
      ],
      error: null,
    });
    const rows = await getSourceCounts('f-1', makeClient(rpc));
    expect(rpc).toHaveBeenCalledWith('library_source_counts', { p_folder_id: 'f-1' });
    expect(rows).toEqual([
      { provider: 'youtube', contentCount: 16 },
      { provider: 'medium', contentCount: 6 },
    ]);
  });

  it('folderId 미지정 시 null(전체)', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: [], error: null });
    await getSourceCounts(null, makeClient(rpc));
    expect(rpc).toHaveBeenCalledWith('library_source_counts', { p_folder_id: null });
  });
});

describe('getLibraryCards', () => {
  it('library_cards(p_folder_id, p_sort) 정확 인자 + 카드 매핑', async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: [
        {
          content_id: 'lc-1',
          title: '제목',
          thumbnail_url: 'https://t/1.jpg',
          provider: 'youtube',
          tags: ['폰트', '로고디자인'],
          grab_count: 15,
          last_clip_at: '2026-06-15T09:00:00.000Z',
        },
      ],
      error: null,
    });
    const rows = await getLibraryCards('f-1', 'most_clips', makeClient(rpc));
    expect(rpc).toHaveBeenCalledWith('library_cards', { p_folder_id: 'f-1', p_sort: 'most_clips' });
    expect(rows).toEqual([
      {
        contentId: 'lc-1',
        title: '제목',
        thumbnailUrl: 'https://t/1.jpg',
        provider: 'youtube',
        tags: ['폰트', '로고디자인'],
        grabCount: 15,
        lastClipAt: '2026-06-15T09:00:00.000Z',
      },
    ]);
  });

  it('정렬 파라미터 매핑(recent 기본 / oldest / most_clips)', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: [], error: null });
    await getLibraryCards(null, 'recent', makeClient(rpc));
    expect(rpc).toHaveBeenCalledWith('library_cards', { p_folder_id: null, p_sort: 'recent' });
    await getLibraryCards(null, 'oldest', makeClient(rpc));
    expect(rpc).toHaveBeenCalledWith('library_cards', { p_folder_id: null, p_sort: 'oldest' });
  });
});

describe('mapLibraryError (errcode 매핑)', () => {
  it('23514(공백/중복) → folder-name, 23514(limit) → folder-limit', () => {
    expect(mapLibraryError({ code: '23514', message: 'name not blank' }).kind).toBe('folder-name');
    expect(mapLibraryError({ code: '23514', message: 'folder limit reached (max 20 active)' }).kind).toBe(
      'folder-limit',
    );
  });

  it('23503 → target-folder, 28000 → unauthenticated, 23505 → folder-name', () => {
    expect(mapLibraryError({ code: '23503', message: 'target not found' }).kind).toBe('target-folder');
    expect(mapLibraryError({ code: '28000', message: 'unauthenticated' }).kind).toBe('unauthenticated');
    expect(mapLibraryError({ code: '23505', message: 'duplicate' }).kind).toBe('folder-name');
  });

  it('미지정 코드 → unknown', () => {
    expect(mapLibraryError({ code: '99999', message: 'x' }).kind).toBe('unknown');
  });
});
