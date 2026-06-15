import {
  getContentHeatmap,
  demoContentHeatmap,
  isSupabaseReady,
  type HeatmapBucketDto,
} from '@/shared/api';

/**
 * 히트맵 조회 표면 — isSupabaseReady 분기(실배선=content_heatmap RPC, 미구성/실패=demo 시드).
 * ★ content_clips_public 파생(식별-프리 집계). raw clips 미쿼리.
 */
export async function fetchContentHeatmap(
  contentId: string,
): Promise<HeatmapBucketDto[]> {
  if (isSupabaseReady) {
    try {
      return await getContentHeatmap(contentId);
    } catch {
      return demoContentHeatmap();
    }
  }
  return demoContentHeatmap();
}
