import { getSupabaseClient, type SupabaseClient } from './supabase';
import type {
  FolderCountDto,
  FolderRow,
  LibraryCardDto,
  LibrarySort,
  SourceCountDto,
} from './types';

/**
 * 라이브러리 RPC 래퍼 — u7. 0011 RPC 7종을 **호출만**(시그니처 변경 ❌).
 *   create_folder · rename_folder · soft_delete_folder · move_clips_to_folder ·
 *   library_folder_counts · library_source_counts · library_cards.
 *
 * ★ 누출 0(ADR-0002 #3): 모두 security invoker → auth.uid() 본인 행만(RLS).
 *   raw cross-user clips/folders 직접 쿼리 ❌(RLS=self → 0행). 본인 데이터라 sanitized 불필요.
 *
 * 인자 키는 0011 시그니처대로 정확히(p_name·p_folder_id·p_content_ids·p_target_folder_id·p_sort).
 * snake→camel 매핑은 이 모듈 내부에서만(content-read.ts toXxx 패턴 거울).
 * client==null(미구성) → throw → 상위 features가 demo 폴백.
 */

function requireClient(client: SupabaseClient | null): SupabaseClient {
  if (!client) {
    throw new Error('Supabase가 구성되지 않았습니다.');
  }
  return client;
}

function toFolderRow(row: Record<string, unknown>): FolderRow {
  return {
    id: String(row.id ?? ''),
    name: String(row.name ?? ''),
  };
}

function toLibraryCard(row: Record<string, unknown>): LibraryCardDto {
  return {
    contentId: String(row.content_id ?? ''),
    title: (row.title as string | null) ?? null,
    thumbnailUrl: (row.thumbnail_url as string | null) ?? null,
    provider: String(row.provider ?? ''),
    tags: Array.isArray(row.tags) ? (row.tags as unknown[]).map(String) : [],
    grabCount: Number(row.grab_count ?? 0),
    lastClipAt: (row.last_clip_at as string | null) ?? null,
  };
}

function toFolderCount(row: Record<string, unknown>): FolderCountDto {
  return {
    folderId: String(row.folder_id ?? ''),
    name: String(row.name ?? ''),
    contentCount: Number(row.content_count ?? 0),
  };
}

function toSourceCount(row: Record<string, unknown>): SourceCountDto {
  return {
    provider: String(row.provider ?? ''),
    contentCount: Number(row.content_count ?? 0),
  };
}

/** 폴더 생성 — create_folder(p_name). 공백/중복 23514·21번째 23514·미인증 28000. */
export async function createFolder(
  name: string,
  client: SupabaseClient | null = getSupabaseClient(),
): Promise<FolderRow> {
  const { data, error } = await requireClient(client).rpc('create_folder', {
    p_name: name,
  });
  if (error) throw error;
  // RPC returns the inserted row (setof folders → single row object).
  const row = (Array.isArray(data) ? data[0] : data) as Record<string, unknown> | null;
  return toFolderRow(row ?? {});
}

/** 폴더 이름변경 — rename_folder(p_folder_id, p_name). 0행=null(no-op). 공백 23514. */
export async function renameFolder(
  id: string,
  name: string,
  client: SupabaseClient | null = getSupabaseClient(),
): Promise<FolderRow | null> {
  const { data, error } = await requireClient(client).rpc('rename_folder', {
    p_folder_id: id,
    p_name: name,
  });
  if (error) throw error;
  const row = (Array.isArray(data) ? data[0] : data) as Record<string, unknown> | null;
  return row && row.id ? toFolderRow(row) : null;
}

/** 폴더 삭제(soft) — soft_delete_folder(p_folder_id). 부착 clips.folder_id NULL해제. 0행=null. */
export async function softDeleteFolder(
  id: string,
  client: SupabaseClient | null = getSupabaseClient(),
): Promise<FolderRow | null> {
  const { data, error } = await requireClient(client).rpc('soft_delete_folder', {
    p_folder_id: id,
  });
  if (error) throw error;
  const row = (Array.isArray(data) ? data[0] : data) as Record<string, unknown> | null;
  return row && row.id ? toFolderRow(row) : null;
}

/**
 * 다중선택 이동 — move_clips_to_folder(p_content_ids[], p_target_folder_id).
 * folderId=null → detach(전체 폴더). 비소유/미존재 타깃 23503·미인증 28000. 이동수 반환.
 */
export async function moveClipsToFolder(
  contentIds: string[],
  folderId: string | null = null,
  client: SupabaseClient | null = getSupabaseClient(),
): Promise<number> {
  const { data, error } = await requireClient(client).rpc('move_clips_to_folder', {
    p_content_ids: contentIds,
    p_target_folder_id: folderId,
  });
  if (error) throw error;
  return Number(data ?? 0);
}

/** 폴더별 카운트 — library_folder_counts() → 폴더별 distinct content 수. */
export async function getFolderCounts(
  client: SupabaseClient | null = getSupabaseClient(),
): Promise<FolderCountDto[]> {
  const { data, error } = await requireClient(client).rpc('library_folder_counts');
  if (error) throw error;
  const rows = (data ?? []) as Record<string, unknown>[];
  return rows.map(toFolderCount);
}

/** 출처 카운트 — library_source_counts(p_folder_id). null=전체 / 폴더 내. provider별 distinct content. */
export async function getSourceCounts(
  folderId: string | null = null,
  client: SupabaseClient | null = getSupabaseClient(),
): Promise<SourceCountDto[]> {
  const { data, error } = await requireClient(client).rpc('library_source_counts', {
    p_folder_id: folderId,
  });
  if (error) throw error;
  const rows = (data ?? []) as Record<string, unknown>[];
  return rows.map(toSourceCount);
}

/** 카드/정렬 — library_cards(p_folder_id, p_sort). null=전체 / 폴더 내. distinct content 1행. */
export async function getLibraryCards(
  folderId: string | null = null,
  sort: LibrarySort = 'recent',
  client: SupabaseClient | null = getSupabaseClient(),
): Promise<LibraryCardDto[]> {
  const { data, error } = await requireClient(client).rpc('library_cards', {
    p_folder_id: folderId,
    p_sort: sort,
  });
  if (error) throw error;
  const rows = (data ?? []) as Record<string, unknown>[];
  return rows.map(toLibraryCard);
}
