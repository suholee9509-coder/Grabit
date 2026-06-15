// Trim model — bidirectional binding between the timeline trim handles and the timecode chips
// (spec L1-c · [behavior] 타임코드 칩 위젯). Owns start/end in integer seconds with the [start, end)
// invariant: start >= 0, end > start (0-length forbidden), both within [0, duration]. Dragging a
// handle or editing a chip funnels through setStart/setEnd which clamp + preserve the invariant.

import { useCallback, useState } from 'react';

export interface TrimState {
  startSec: number;
  endSec: number;
  durationSec: number;
  setStart: (sec: number) => void;
  setEnd: (sec: number) => void;
}

export function clampInt(value: number, min: number, max: number): number {
  return Math.min(Math.max(min, Math.round(value)), max);
}

/** Pure resolver for the [start, end) invariant — the load-bearing trim logic (unit-tested). */
export function resolveTrim(
  edge: 'start' | 'end',
  sec: number,
  current: { start: number; end: number },
  max: number,
): { start: number; end: number } {
  if (edge === 'start') {
    const next = clampInt(sec, 0, max - 1);
    // bump end up to keep at least a 1s window (end EXCLUSIVE, > start)
    const end = current.end <= next ? clampInt(next + 1, next + 1, max) : current.end;
    return { start: next, end };
  }
  // end must be > start (0-length / inversion forbidden)
  return { start: current.start, end: clampInt(sec, current.start + 1, max) };
}

/**
 * @param duration  full video length (seconds). When unknown (null), a sane upper bound is used so
 *                  the chips/handles still operate; the server stores end_sec as-is (no clamp).
 * @param initialStart / initialEnd  initial selection (defaults to a 30s window at current time).
 */
export function useTrim(
  duration: number | null,
  initialStart: number,
  initialEnd: number,
): TrimState {
  // Upper bound for clamping. With unknown duration, allow a large ceiling (no false clamp).
  const max = duration != null && duration > 0 ? Math.floor(duration) : Number.MAX_SAFE_INTEGER;

  const [sel, setSel] = useState(() => {
    const start = clampInt(initialStart, 0, Math.max(0, max - 1));
    return { start, end: clampInt(initialEnd, start + 1, max) };
  });

  const setStart = useCallback(
    (sec: number) => setSel((cur) => resolveTrim('start', sec, cur, max)),
    [max],
  );
  const setEnd = useCallback(
    (sec: number) => setSel((cur) => resolveTrim('end', sec, cur, max)),
    [max],
  );

  return { startSec: sel.start, endSec: sel.end, durationSec: max, setStart, setEnd };
}
