import { getSupabaseClient, type SupabaseClient } from './supabase';
import type { ClipRow, IngestClipParams } from './types';

/**
 * `ingest_clip` RPC 래퍼 — u0b 0009 frozen 계약을 호출만(변경 ❌).
 * dedup·정준화·구간검증·메모병합·태그 get-or-create는 전부 RPC가 수행.
 * snake-case 인자 매핑은 여기서만(시그니처 정확순: p_url·p_start_sec·…·p_thumbnail_url).
 */

/** clips 1행 raw(snake) → ClipRow(camel). */
function toClip(row: Record<string, unknown>): ClipRow {
  return {
    id: String(row.id ?? ''),
    contentId: String(row.content_id ?? ''),
    startSec: Number(row.start_sec ?? 0),
    endSec: Number(row.end_sec ?? 0),
    memo: (row.memo as string | null) ?? null,
    isPublic: Boolean(row.is_public),
    folderId: (row.folder_id as string | null) ?? null,
  };
}

/** [완료] — 단일 RPC 호출. 실패 시 PostgREST 에러를 throw(상위가 mapIngestError). */
export async function ingestClip(
  input: IngestClipParams,
  client: SupabaseClient | null = getSupabaseClient(),
): Promise<ClipRow> {
  if (!client) {
    throw new Error('Supabase가 구성되지 않았습니다.');
  }

  const { data, error } = await client.rpc('ingest_clip', {
    p_url: input.url,
    p_start_sec: input.startSec,
    p_end_sec: input.endSec,
    p_memo: input.memo,
    p_is_public: input.isPublic,
    p_folder_id: input.folderId,
    p_tags: input.tags,
    p_title: input.title,
    p_channel: input.channel,
    p_duration_sec: input.durationSec,
    p_thumbnail_url: input.thumbnailUrl,
  });

  if (error) {
    throw error;
  }

  // RPC `returns public.clips` → 단일 행(또는 1행 배열).
  const row = Array.isArray(data) ? data[0] : data;
  return toClip((row ?? {}) as Record<string, unknown>);
}
