/** clip 엔티티 배럴 — 구간 모델·시간 포맷·ingest 입력 타입·공개클립 표현 타입. */
export type { Clip, ClipInterval, IngestClipInput, PublicClip } from './model/types';
export {
  formatClock,
  formatClockInterval,
  formatIntervalLength,
  intervalLengthSec,
  isValidInterval,
} from './lib/format-time';
