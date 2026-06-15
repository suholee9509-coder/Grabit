import { formatClock } from '@/entities/clip';

export interface TimelineTick {
  /** 초 위치. */
  sec: number;
  /** 트랙 폭 대비 0~1 비율. */
  ratio: number;
  /** "m:ss" 라벨. */
  label: string;
}

/**
 * 타임라인 눈금 4개 생성(측정: 0:32/0:52/1:12/1:32 = 20초 간격, 4틱).
 * 영상 길이에 비례해 균등 4틱 — duration 없으면 가까운 기준(start 주변)으로 폴백.
 * 프레임은 start(0:32)부터 시작하는 윈도우를 보여줌 → start~end를 포함하는 윈도우로 4틱 산출.
 */
export function buildTicks(windowStart: number, windowEnd: number): TimelineTick[] {
  const span = Math.max(1, windowEnd - windowStart);
  const ticks: TimelineTick[] = [];
  for (let i = 0; i < 4; i += 1) {
    const ratio = i / 3; // 0, 1/3, 2/3, 1
    const sec = Math.round(windowStart + span * ratio);
    ticks.push({ sec, ratio, label: formatClock(sec) });
  }
  return ticks;
}

/**
 * 표시 윈도우 산출 — 선택 구간을 중심으로 한 가시 범위.
 * 프레임은 선택(0:32→1:01)이 트랙의 일부를 차지(187/405 ≈ 46%)하고 양옆 여백이 있음.
 * 선택 길이의 약 0.4배 패딩을 양옆에 두되 0..duration로 클램프.
 */
export function computeWindow(
  startSec: number,
  endSec: number,
  durationSec: number | null,
): { windowStart: number; windowEnd: number } {
  const sel = Math.max(1, endSec - startSec);
  const pad = sel * 0.45;
  let windowStart = Math.max(0, startSec - pad);
  let windowEnd = endSec + pad;
  if (durationSec && durationSec > 0) {
    windowEnd = Math.min(durationSec, windowEnd);
    if (windowEnd - windowStart < sel) windowStart = Math.max(0, windowEnd - sel);
  }
  if (windowEnd <= windowStart) windowEnd = windowStart + sel;
  return { windowStart, windowEnd };
}

/** 초 → 윈도우 내 0~1 비율(클램프). */
export function secToRatio(sec: number, windowStart: number, windowEnd: number): number {
  const span = Math.max(1, windowEnd - windowStart);
  return Math.min(1, Math.max(0, (sec - windowStart) / span));
}

/** 윈도우 내 0~1 비율 → 초(반올림). */
export function ratioToSec(ratio: number, windowStart: number, windowEnd: number): number {
  const span = Math.max(1, windowEnd - windowStart);
  return Math.round(windowStart + Math.min(1, Math.max(0, ratio)) * span);
}
