import { describe, expect, it } from 'vitest';
import {
  formatClock,
  formatIntervalLength,
  intervalLengthSec,
  isValidInterval,
} from './format-time';

describe('formatClock', () => {
  it('m:ss 포맷(측정 0:32 / 1:01)', () => {
    expect(formatClock(32)).toBe('0:32');
    expect(formatClock(61)).toBe('1:01');
    expect(formatClock(92)).toBe('1:32');
    expect(formatClock(0)).toBe('0:00');
  });
  it('음수/NaN → 0 클램프', () => {
    expect(formatClock(-5)).toBe('0:00');
    expect(formatClock(Number.NaN)).toBe('0:00');
  });
});

describe('interval [start,end) 끝 배타', () => {
  it('길이 = end - start (측정 61-32=29)', () => {
    expect(intervalLengthSec({ startSec: 32, endSec: 61 })).toBe(29);
    expect(formatIntervalLength({ startSec: 32, endSec: 61 })).toBe('29초');
  });
  it('유효성: 정수·start>=0·end>start (RPC 22023 거울)', () => {
    expect(isValidInterval({ startSec: 32, endSec: 61 })).toBe(true);
    expect(isValidInterval({ startSec: 0, endSec: 1 })).toBe(true);
    expect(isValidInterval({ startSec: 10, endSec: 10 })).toBe(false); // 0길이
    expect(isValidInterval({ startSec: 20, endSec: 10 })).toBe(false); // 역전
    expect(isValidInterval({ startSec: -1, endSec: 5 })).toBe(false); // 음수
    expect(isValidInterval({ startSec: 1.5, endSec: 5 })).toBe(false); // 비정수
  });
});
