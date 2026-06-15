import type { ClipInterval } from '../model/types';

/** 초 → "m:ss" (타임라인 눈금·시작/끝칩 라벨, 측정 "0:32"/"1:01"). 음수/NaN은 0 클램프. */
export function formatClock(totalSec: number): string {
  const s = Math.max(0, Math.floor(Number.isFinite(totalSec) ? totalSec : 0));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${rem.toString().padStart(2, '0')}`;
}

/** 구간 길이(끝 배타) → "N초" (측정 "29초" = 61−32). */
export function intervalLengthSec(interval: ClipInterval): number {
  return Math.max(0, interval.endSec - interval.startSec);
}

/** 구간 길이 라벨 "N초". */
export function formatIntervalLength(interval: ClipInterval): string {
  return `${intervalLengthSec(interval)}초`;
}

/** [start,end) 유효: 정수·start>=0·end>start (RPC 22023 거울). */
export function isValidInterval(interval: ClipInterval): boolean {
  const { startSec, endSec } = interval;
  return (
    Number.isInteger(startSec) &&
    Number.isInteger(endSec) &&
    startSec >= 0 &&
    endSec > startSec
  );
}
