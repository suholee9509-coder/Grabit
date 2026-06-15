import { describe, it, expect } from 'vitest';
import { formatTimecode, formatDurationKo, clampSec } from './time';

describe('formatTimecode (m:ss — matches Figma copy)', () => {
  it('formats seconds to m:ss with zero-padded seconds', () => {
    expect(formatTimecode(32)).toBe('0:32'); // 타임코드 칩 start
    expect(formatTimecode(61)).toBe('1:01'); // 타임코드 칩 end
    expect(formatTimecode(52)).toBe('0:52');
    expect(formatTimecode(72)).toBe('1:12');
    expect(formatTimecode(92)).toBe('1:32');
    expect(formatTimecode(0)).toBe('0:00');
  });
  it('floors fractional and clamps negative', () => {
    expect(formatTimecode(32.9)).toBe('0:32');
    expect(formatTimecode(-5)).toBe('0:00');
  });
});

describe('formatDurationKo (구간 길이 칩)', () => {
  it('end EXCLUSIVE → length = end - start', () => {
    expect(formatDurationKo(32, 61)).toBe('29초'); // Figma "29초"
    expect(formatDurationKo(0, 1)).toBe('1초');
  });
  it('never negative', () => {
    expect(formatDurationKo(61, 32)).toBe('0초');
  });
});

describe('clampSec', () => {
  it('integerizes and clamps into [0, max]', () => {
    expect(clampSec(10.6, 100)).toBe(11);
    expect(clampSec(-3, 100)).toBe(0);
    expect(clampSec(150, 100)).toBe(100);
  });
});
