import { useMemo } from 'react';
import type { HeatmapBucketDto } from '@/shared/api';
import styles from './clip-heatmap.module.css';

/**
 * ClipHeatmap — 타임라인 위 6px 밀도 바 + 피크/틱 마커(측정 2875:19656, 컨테이너 h18).
 *   베이스 트랙 h6 rgba(255,255,255,0.12) + 진행 세그먼트 h6 #777777 + 피크 마커 25×18 #26FA01
 *   + 틱 마커 21×15 #26FA01. 마커 클릭 → onSeek(bucketStart).
 * ★ 히트맵 density 전부 0 / 빈 배열 → 바 비활성(마커 미표시, 트랙만).
 *   bucket→px 매핑: duration_sec(또는 max bucket_end)로 타임라인 스케일.
 */
export interface ClipHeatmapProps {
  buckets: HeatmapBucketDto[];
  /** 영상 총 길이(초) — 타임라인 스케일. null이면 max(bucket_end) 폴백(0008 거울). */
  durationSec: number | null;
  /** 마커 클릭 → 해당 초로 seek. */
  onSeek?: (startSec: number) => void;
  /** 로딩 — 트랙만(마커 없음). */
  loading?: boolean;
}

interface Marker {
  startSec: number;
  /** 0~1 정규화 위치. */
  pos: number;
  /** 밀도(피크 판정). */
  density: number;
}

export function ClipHeatmap({
  buckets,
  durationSec,
  onSeek,
  loading = false,
}: ClipHeatmapProps) {
  const { markers, peakThreshold, active } = useMemo(() => {
    const total =
      durationSec && durationSec > 0
        ? durationSec
        : Math.max(0, ...buckets.map((b) => b.bucketEnd));
    const nonZero = buckets.filter((b) => b.density > 0);
    if (loading || total <= 0 || nonZero.length === 0) {
      return { markers: [] as Marker[], peakThreshold: 0, active: false };
    }
    const maxDensity = Math.max(...nonZero.map((b) => b.density));
    const mk: Marker[] = nonZero.map((b) => ({
      startSec: b.bucketStart,
      pos: Math.min(1, Math.max(0, b.bucketStart / total)),
      density: b.density,
    }));
    // 피크 = 최대 밀도 근처(>= max*0.8) → 큰 25×18 마커, 그 외 → 작은 틱 21×15.
    return { markers: mk, peakThreshold: maxDensity * 0.8, active: true };
  }, [buckets, durationSec, loading]);

  // 진행 세그먼트(시청밀도) 폭 — 비활성 시 0(트랙만).
  const playedPct = active ? 27 : 0; // 측정: 313/1148 ≈ 27%(데모 한정, 실 재생진행 미배선)

  return (
    <div className={styles.container} role="group" aria-label="클립 밀도 히트맵">
      <div className={styles.track} />
      {active ? (
        <div className={styles.played} style={{ width: `${playedPct}%` }} />
      ) : null}
      {markers.map((m) => {
        const isPeak = m.density >= peakThreshold;
        return (
          <button
            key={m.startSec}
            type="button"
            className={[styles.marker, isPeak ? styles.peak : styles.tick].join(' ')}
            style={{ left: `${m.pos * 100}%` }}
            aria-label={`${m.startSec}초로 이동`}
            onClick={() => onSeek?.(m.startSec)}
          >
            <span className={styles.markerGlyph} aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
