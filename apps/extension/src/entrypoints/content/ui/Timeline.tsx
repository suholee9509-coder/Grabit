// Timeline scrubber + trim handles (Figma 2074:88538 strip · 2074:88560 handles · 2074:88567 playhead
// · 2074:88515-518 ruler). The 405px-wide strip maps the full video duration; the green selection
// (#7FC573) spans [start, end). Dragging a handle calls back into the trim model (bidirectional with
// the timecode chips). Ruler labels render the 4 tick times from the visible window.

import { useCallback, useRef, type CSSProperties, type PointerEvent } from 'react';
import { color, radius, font } from '@/shared/ui/tokens';
import { formatTimecode } from '@/shared/lib/time';

const STRIP_W = 405;
const STRIP_H = 52;

interface TimelineProps {
  startSec: number;
  endSec: number;
  durationSec: number;
  playheadSec: number;
  thumbnailUrl: string | null;
  onSetStart: (sec: number) => void;
  onSetEnd: (sec: number) => void;
}

const labelStyle: CSSProperties = {
  fontFamily: font.family,
  fontWeight: 400,
  fontSize: 12,
  lineHeight: '130%',
  letterSpacing: font.letterSpacing,
};

export function Timeline({
  startSec,
  endSec,
  durationSec,
  playheadSec,
  thumbnailUrl,
  onSetStart,
  onSetEnd,
}: TimelineProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  // Effective span for px↔sec mapping. With an unknown/huge duration, fall back to the selection
  // window padded out, so the handles remain usable (the server stores end_sec as-is regardless).
  const span =
    durationSec > 0 && durationSec < Number.MAX_SAFE_INTEGER
      ? durationSec
      : Math.max(endSec + 30, 60);

  const secToPx = (sec: number) => (sec / span) * STRIP_W;
  const pxToSec = useCallback(
    (clientX: number) => {
      const rect = trackRef.current?.getBoundingClientRect();
      if (!rect) return 0;
      const ratio = (clientX - rect.left) / rect.width;
      return Math.round(Math.min(Math.max(0, ratio), 1) * span);
    },
    [span],
  );

  function startDrag(edge: 'start' | 'end', e: PointerEvent) {
    e.preventDefault();
    e.stopPropagation();
    const move = (ev: globalThis.PointerEvent) => {
      const sec = pxToSec(ev.clientX);
      if (edge === 'start') onSetStart(sec);
      else onSetEnd(sec);
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }

  const selLeft = secToPx(startSec);
  const selWidth = Math.max(2, secToPx(endSec) - secToPx(startSec));
  const playheadLeft = secToPx(playheadSec);

  // 4 evenly spaced tick labels across the strip (mirrors 0:32 / 0:52 / 1:12 / 1:32 spacing).
  const ticks = [0, 1, 2, 3].map((i) => ({
    left: (STRIP_W * i) / 4,
    sec: Math.round((span * i) / 4),
  }));

  return (
    <div style={{ width: STRIP_W }}>
      {/* strip */}
      <div
        ref={trackRef}
        style={{
          position: 'relative',
          width: STRIP_W,
          height: STRIP_H,
          borderBottom: `1px solid ${color.stripBottomBorder}`,
          backgroundImage: thumbnailUrl ? `url(${thumbnailUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundColor: color.skeleton,
          touchAction: 'none',
        }}
      >
        {/* vertical density dividers ×4 (rgba 255,255,255,.16) */}
        {[0.25, 0.5, 0.75].map((p) => (
          <div
            key={p}
            style={{
              position: 'absolute',
              left: STRIP_W * p,
              top: 0,
              width: 1,
              height: STRIP_H,
              background: color.divider,
            }}
          />
        ))}

        {/* selected interval thumbnail overlay (brightened green border region) */}
        <div
          style={{
            position: 'absolute',
            left: selLeft,
            top: 0,
            width: selWidth,
            height: STRIP_H,
            boxSizing: 'border-box',
          }}
        >
          {/* top/bottom green bars (171×4 in frame → full selection width here) */}
          <div style={{ position: 'absolute', left: 8, right: 8, top: 0, height: 4, background: color.trimHandle }} />
          <div style={{ position: 'absolute', left: 8, right: 8, bottom: 0, height: 4, background: color.trimHandle }} />
          {/* left handle (14×60-ish → strip height) */}
          <div
            onPointerDown={(e) => startDrag('start', e)}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: 14,
              height: STRIP_H,
              background: color.trimHandle,
              borderRadius: `4px 0 0 4px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'ew-resize',
            }}
          >
            <span style={{ width: 2, height: 24, background: color.textPrimary, borderRadius: radius.handle }} />
          </div>
          {/* right handle */}
          <div
            onPointerDown={(e) => startDrag('end', e)}
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              width: 14,
              height: STRIP_H,
              background: color.trimHandle,
              borderRadius: `0 4px 4px 0`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'ew-resize',
            }}
          >
            <span style={{ width: 2, height: 24, background: color.textPrimary, borderRadius: radius.handle }} />
          </div>
        </div>

        {/* playhead (3×52, #BE1616, radius 100) */}
        <div
          style={{
            position: 'absolute',
            left: Math.min(Math.max(0, playheadLeft), STRIP_W - 3),
            top: 0,
            width: 3,
            height: STRIP_H,
            background: color.playhead,
            borderRadius: radius.handle,
          }}
        />
      </div>

      {/* ruler labels */}
      <div style={{ position: 'relative', width: STRIP_W, height: 16, marginTop: 10 }}>
        {ticks.map((t, i) => (
          <span
            key={i}
            style={{
              ...labelStyle,
              position: 'absolute',
              left: i === 0 ? 5 : t.left,
              color: i < 2 ? color.textPrimary : color.textSecondary,
            }}
          >
            {formatTimecode(t.sec)}
          </span>
        ))}
      </div>
    </div>
  );
}
