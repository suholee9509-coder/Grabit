import { useCallback, useRef, type PointerEvent as ReactPointerEvent } from 'react';
import {
  formatClock,
  formatIntervalLength,
  isValidInterval,
  type ClipInterval,
} from '@/entities/clip';
import type { VideoRef } from '@/entities/content';
import {
  buildTicks,
  computeWindow,
  ratioToSec,
  secToRatio,
} from '../lib/ticks';
import styles from './clip-trim.module.css';

const TRACK_WIDTH = 405; // 측정: 트랙 폭 405
const MIN_LEN = 1; // 최소 구간 1초(끝 배타, end>start)

export interface ClipTrimProps {
  /** YouTube 임베드 참조(영상 플레이어). null이면 폴백 면. */
  videoRef: VideoRef | null;
  /** 영상 총 길이(초) — 핸들 상한·윈도우 산출. 없으면 선택 주변 윈도우. */
  durationSec: number | null;
  /** 현재 구간 [start, end). */
  interval: ClipInterval;
  onChange: (next: ClipInterval) => void;
}

/**
 * ClipTrim — 영상 플레이어 + 트림 타임라인(시작/끝 핸들 [start,end)).
 * 측정 2087:33548 §3 1:1(절대좌표). 핸들 드래그로 초(정수) 지정, 길이 라벨, 재생헤드.
 * u0c 프리미티브 없음 → 토큰만(발명 ❌).
 */
export function ClipTrim({ videoRef, durationSec, interval, onChange }: ClipTrimProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const { startSec, endSec } = interval;
  const { windowStart, windowEnd } = computeWindow(startSec, endSec, durationSec);

  const ticks = buildTicks(windowStart, windowEnd);
  const startRatio = secToRatio(startSec, windowStart, windowEnd);
  const endRatio = secToRatio(endSec, windowStart, windowEnd);
  // 재생헤드: 선택 시작 직후(측정: 트랙 x59 ≈ start보다 약간 오른쪽). 시작 지점에 고정.
  const playheadRatio = startRatio;

  const valid = isValidInterval(interval);

  const dragHandle = useCallback(
    (which: 'start' | 'end') => (e: ReactPointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      const track = trackRef.current;
      if (!track) return;
      track.setPointerCapture?.(e.pointerId);

      const move = (clientX: number) => {
        const rect = track.getBoundingClientRect();
        const ratio = (clientX - rect.left) / rect.width;
        const sec = ratioToSec(ratio, windowStart, windowEnd);
        if (which === 'start') {
          const next = Math.min(sec, endSec - MIN_LEN);
          onChange({ startSec: Math.max(0, next), endSec });
        } else {
          const max = durationSec && durationSec > 0 ? durationSec : windowEnd;
          const next = Math.max(sec, startSec + MIN_LEN);
          onChange({ startSec, endSec: Math.min(max, next) });
        }
      };

      const onPointerMove = (ev: PointerEvent) => move(ev.clientX);
      const onPointerUp = (ev: PointerEvent) => {
        track.releasePointerCapture?.(ev.pointerId);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
      };
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
    },
    [windowStart, windowEnd, startSec, endSec, durationSec, onChange],
  );

  const selLeft = startRatio * TRACK_WIDTH;
  const selWidth = Math.max(0, (endRatio - startRatio) * TRACK_WIDTH);

  return (
    <div className={[styles.root, valid ? '' : styles.invalid].filter(Boolean).join(' ')}>
      {/* 영상 프리뷰 (측정: 405×228 radius8) */}
      <div className={styles.video}>
        {videoRef ? (
          <iframe
            title="영상 미리보기"
            src={`https://www.youtube.com/embed/${videoRef.providerContentId}?start=${startSec}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className={styles.videoFallback}>영상을 불러오는 중…</div>
        )}
      </div>

      {/* 타임라인 트랙 + 핸들 + 재생헤드 */}
      <div className={styles.timeline}>
        <div className={styles.track} ref={trackRef}>
          {/* 선택 밖 딤 */}
          <div className={styles.dim} style={{ left: 0, width: selLeft }} />
          <div className={styles.dim} style={{ left: selLeft + selWidth, right: 0 }} />

          {/* 선택 오버레이(테두리바) */}
          <div className={styles.selection} style={{ left: selLeft, width: selWidth }}>
            <div className={styles.selectionBarTop} />
            <div className={styles.selectionBarBottom} />
          </div>

          {/* 핸들(좌=start / 우=end) */}
          <div
            className={[styles.handle, styles.handleStart].join(' ')}
            style={{ left: selLeft }}
            role="slider"
            aria-label="시작 지점"
            aria-valuemin={0}
            aria-valuemax={endSec - MIN_LEN}
            aria-valuenow={startSec}
            aria-valuetext={formatClock(startSec)}
            tabIndex={0}
            onPointerDown={dragHandle('start')}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft') onChange({ startSec: Math.max(0, startSec - 1), endSec });
              if (e.key === 'ArrowRight')
                onChange({ startSec: Math.min(endSec - MIN_LEN, startSec + 1), endSec });
            }}
          >
            <span className={styles.grip} />
          </div>
          <div
            className={[styles.handle, styles.handleEnd].join(' ')}
            style={{ left: selLeft + selWidth - 14 }}
            role="slider"
            aria-label="끝 지점"
            aria-valuemin={startSec + MIN_LEN}
            aria-valuemax={durationSec ?? windowEnd}
            aria-valuenow={endSec}
            aria-valuetext={formatClock(endSec)}
            tabIndex={0}
            onPointerDown={dragHandle('end')}
            onKeyDown={(e) => {
              const max = durationSec && durationSec > 0 ? durationSec : windowEnd;
              if (e.key === 'ArrowLeft')
                onChange({ startSec, endSec: Math.max(startSec + MIN_LEN, endSec - 1) });
              if (e.key === 'ArrowRight') onChange({ startSec, endSec: Math.min(max, endSec + 1) });
            }}
          >
            <span className={styles.grip} />
          </div>

          {/* 재생헤드 */}
          <div className={styles.playhead} style={{ left: playheadRatio * TRACK_WIDTH }} />
        </div>

        {/* 눈금 라벨 */}
        <div className={styles.ticks}>
          {ticks.map((t, i) => (
            <span
              key={`${t.sec}-${i}`}
              className={[
                styles.tick,
                i >= 2 ? styles.tickDim : '',
                i === 0 ? styles.tickFirst : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{ left: `${t.ratio * 100}%` }}
            >
              {t.label}
            </span>
          ))}
        </div>
      </div>

      {/* 구간 컨트롤 — 시작칩 → 화살표 → 끝칩 → 길이 */}
      <div className={styles.controls}>
        <span className={styles.timeChip}>{formatClock(startSec)}</span>
        <span className={styles.arrow} aria-hidden />
        <span className={styles.timeChip}>{formatClock(endSec)}</span>
        <span className={styles.length}>
          <span className={styles.lengthIcon} aria-hidden>
            <ClockGlyph />
          </span>
          {formatIntervalLength(interval)}
        </span>
      </div>

      {!valid ? (
        <p className={styles.error} role="alert">
          클립 구간을 1초 이상으로 지정해 주세요.
        </p>
      ) : null}
    </div>
  );
}

/** 길이 라벨 앞 시계 글리프(측정: 길이 row 아이콘 16px). */
function ClockGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 5v3.2l2 1.3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
