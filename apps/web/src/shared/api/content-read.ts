import { getSupabaseClient, type SupabaseClient } from './supabase';
import type { ContentMetaDto, HeatmapBucketDto, PublicClipDto } from './types';

/**
 * 콘텐츠 상세 read 래퍼 — u0b 락 계약(0002/0007/0008)을 **호출만**(변경 ❌).
 *
 * ★ 누출 0 보장(ADR-0002 #3): 인사이트/히트맵은 sanitized 뷰/RPC 경로만 사용.
 *   raw cross-user `clips` 테이블은 **직접 쿼리하지 않는다**(RLS=self만 → cross-user 0행).
 *   content_clips_public/content_heatmap은 definer 뷰 경유라 user_id/실명 키 부재.
 *
 * snake→camel 매핑은 이 모듈 내부에서만(ingest-clip.ts toClip 패턴 거울).
 * client==null(미구성) → throw → 상위 features가 demo 폴백.
 */

function toPublicClip(row: Record<string, unknown>): PublicClipDto {
  return {
    contentId: String(row.content_id ?? ''),
    clipId: String(row.clip_id ?? ''),
    startSec: Number(row.start_sec ?? 0),
    endSec: Number(row.end_sec ?? 0),
    memo: (row.memo as string | null) ?? null,
    cohortJob: (row.cohort_job as string | null) ?? null,
    cohortYears:
      row.cohort_years == null ? null : Number(row.cohort_years),
    cohortRevealed: Boolean(row.cohort_revealed),
    createdAt: (row.created_at as string | null) ?? null,
  };
}

function toHeatmapBucket(row: Record<string, unknown>): HeatmapBucketDto {
  return {
    bucketStart: Number(row.bucket_start ?? 0),
    bucketEnd: Number(row.bucket_end ?? 0),
    density: Number(row.density ?? 0),
  };
}

function toContentMeta(row: Record<string, unknown>): ContentMetaDto {
  return {
    id: String(row.id ?? ''),
    provider: String(row.provider ?? ''),
    providerContentId: String(row.provider_content_id ?? ''),
    canonicalUrl: String(row.canonical_url ?? ''),
    title: (row.title as string | null) ?? null,
    channel: (row.channel as string | null) ?? null,
    durationSec: row.duration_sec == null ? null : Number(row.duration_sec),
    thumbnailUrl: (row.thumbnail_url as string | null) ?? null,
    isUnavailable: Boolean(row.is_unavailable),
  };
}

/**
 * 인사이트(공개 클립) — get_content_social_clips(p_content_id) → setof content_clips_public.
 * ★ raw clips 미쿼리. sanitized 셰이프만 반환(user_id/실명 부재).
 */
export async function getContentSocialClips(
  contentId: string,
  client: SupabaseClient | null = getSupabaseClient(),
): Promise<PublicClipDto[]> {
  if (!client) {
    throw new Error('Supabase가 구성되지 않았습니다.');
  }
  const { data, error } = await client.rpc('get_content_social_clips', {
    p_content_id: contentId,
  });
  if (error) {
    throw error;
  }
  const rows = (data ?? []) as Record<string, unknown>[];
  return rows.map(toPublicClip);
}

/**
 * 히트맵 — content_heatmap(p_content_id) → table(bucket_start, bucket_end, density).
 * 식별-프리 밀도 집계(content_clips_public 파생). bucket_sec은 RPC 기본(10) 사용.
 */
export async function getContentHeatmap(
  contentId: string,
  client: SupabaseClient | null = getSupabaseClient(),
): Promise<HeatmapBucketDto[]> {
  if (!client) {
    throw new Error('Supabase가 구성되지 않았습니다.');
  }
  const { data, error } = await client.rpc('content_heatmap', {
    p_content_id: contentId,
  });
  if (error) {
    throw error;
  }
  const rows = (data ?? []) as Record<string, unknown>[];
  return rows.map(toHeatmapBucket);
}

/**
 * 콘텐츠 메타 — contents 테이블 select(RLS select=true). 없으면 null(404 표면).
 */
export async function getContentMeta(
  contentId: string,
  client: SupabaseClient | null = getSupabaseClient(),
): Promise<ContentMetaDto | null> {
  if (!client) {
    throw new Error('Supabase가 구성되지 않았습니다.');
  }
  const { data, error } = await client
    .from('contents')
    .select(
      'id, provider, provider_content_id, canonical_url, title, channel, duration_sec, thumbnail_url, is_unavailable',
    )
    .eq('id', contentId)
    .maybeSingle();
  if (error) {
    throw error;
  }
  if (!data) {
    return null;
  }
  return toContentMeta(data as Record<string, unknown>);
}
