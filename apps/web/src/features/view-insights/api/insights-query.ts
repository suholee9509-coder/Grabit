import {
  getContentMeta,
  getContentSocialClips,
  demoContentMeta,
  demoContentSocialClips,
  demoSimilarContent,
  isSupabaseReady,
  type SimilarContentDto,
} from '@/shared/api';
import type { ContentDetail } from '@/entities/content';
import type { PublicClip } from '@/entities/clip';
import { formatUploadDate } from '@/entities/content';
import { topCohortLabel } from '../model/cohort';

/**
 * 콘텐츠 상세 read 표면 — isSupabaseReady 분기(실배선=래퍼, 미구성/실패=demo 시드).
 * ★ 인사이트는 sanitized 경로(content_clips_public RPC)만 — raw clips 미쿼리.
 *   home feed-api 패턴 거울(결정론 폴백, retry:false는 훅에서).
 */

/** PublicClipDto → entities/clip PublicClip(셰이프 동일, 명시 매핑). */
function toPublicClip(d: {
  contentId: string;
  clipId: string;
  startSec: number;
  endSec: number;
  memo: string | null;
  cohortJob: string | null;
  cohortYears: number | null;
  cohortRevealed: boolean;
  createdAt: string | null;
}): PublicClip {
  return {
    contentId: d.contentId,
    clipId: d.clipId,
    startSec: d.startSec,
    endSec: d.endSec,
    memo: d.memo,
    cohortJob: d.cohortJob,
    cohortYears: d.cohortYears,
    cohortRevealed: d.cohortRevealed,
    createdAt: d.createdAt,
  };
}

/** 인사이트(공개 클립) 조회 — 실패/미구성 시 demo 폴백. */
export async function fetchContentInsights(contentId: string): Promise<PublicClip[]> {
  if (isSupabaseReady) {
    try {
      const rows = await getContentSocialClips(contentId);
      return rows.map(toPublicClip);
    } catch {
      return demoContentSocialClips(contentId).map(toPublicClip);
    }
  }
  return demoContentSocialClips(contentId).map(toPublicClip);
}

/**
 * 콘텐츠 상세 메타 조회 — contents select + 그랩수/태그/코호트 합성.
 * 404(maybeSingle null)면 null 반환 → 상위가 에러 표면.
 */
export async function fetchContentDetail(
  contentId: string,
  insights: PublicClip[],
): Promise<ContentDetail | null> {
  const grabCount = insights.length;
  const cohortLabel = topCohortLabel(insights);

  if (isSupabaseReady) {
    try {
      const meta = await getContentMeta(contentId);
      if (!meta) return null; // 404
      return {
        id: meta.id,
        provider: meta.provider,
        providerContentId: meta.providerContentId,
        canonicalUrl: meta.canonicalUrl,
        title: meta.title,
        channel: meta.channel,
        durationSec: meta.durationSec,
        thumbnailUrl: meta.thumbnailUrl,
        isUnavailable: meta.isUnavailable,
        uploadedAt: null, // contents에 게시일 컬럼 없음 → 표시 폴백 null
        grabCount,
        tags: ['마인드셋', 'IT', '창업'],
        cohortLabel,
      };
    } catch {
      // 실패 → demo 폴백(부분 실패 격리는 호출부에서; 메타 자체 throw는 폴백)
    }
  }

  const demo = demoContentMeta(contentId);
  return {
    id: demo.id,
    provider: demo.provider,
    providerContentId: demo.providerContentId,
    canonicalUrl: demo.canonicalUrl,
    title: demo.title,
    channel: demo.channel,
    durationSec: demo.durationSec,
    thumbnailUrl: demo.thumbnailUrl,
    isUnavailable: demo.isUnavailable,
    uploadedAt: formatUploadDate('2025-03-17'),
    grabCount: grabCount || 4,
    tags: ['마인드셋', 'IT', '창업'],
    cohortLabel: cohortLabel ?? '프로덕트 디자이너 3~5년차',
  };
}

/** 비슷한 컨텐츠 — 콜드스타트 폴백 시드(추천 알고리즘 없음, ADR-0002 #7). */
export async function fetchSimilarContent(
  contentId: string,
): Promise<SimilarContentDto[]> {
  // 집계/추천 RPC 부재 → 항상 시드 폴백(자기 자신 제외).
  return demoSimilarContent(contentId);
}
