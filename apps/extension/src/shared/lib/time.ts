// Time formatting — shared by the timecode chips, ruler labels, and 구간 길이 칩.
// Matches Figma copy: "0:32" (m:ss, no leading-zero minute) and "29초" (Korean seconds suffix).

/** seconds → "m:ss" (e.g. 32 → "0:32", 61 → "1:01", 3661 → "61:01"). Negative clamps to 0. */
export function formatTimecode(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(s / 60);
  const seconds = s % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/** interval length in seconds → "29초" (Korean). end is EXCLUSIVE → length = end - start. */
export function formatDurationKo(startSec: number, endSec: number): string {
  const len = Math.max(0, Math.floor(endSec) - Math.floor(startSec));
  return `${len}초`;
}

/** Clamp + integerize a second value into [0, max]. */
export function clampSec(value: number, max: number): number {
  return Math.min(Math.max(0, Math.round(value)), Math.floor(max));
}
