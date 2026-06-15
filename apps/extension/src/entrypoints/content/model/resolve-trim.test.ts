// Trim invariant tests (spec Validation: 트림 핸들 ↔ 칩 값 양방향, [start,end) 경계·0길이·역전 방지).
// resolveTrim is the load-bearing logic shared by the trim handles and the timecode chips.

import { describe, it, expect } from 'vitest';
import { resolveTrim } from './use-trim';

const MAX = 720;

describe('resolveTrim — [start, end) invariant', () => {
  it('moving start below end keeps the window', () => {
    expect(resolveTrim('start', 10, { start: 32, end: 61 }, MAX)).toEqual({ start: 10, end: 61 });
  });

  it('moving start to/past end bumps end up by 1 (0-length forbidden)', () => {
    expect(resolveTrim('start', 61, { start: 32, end: 61 }, MAX)).toEqual({ start: 61, end: 62 });
    expect(resolveTrim('start', 80, { start: 32, end: 61 }, MAX)).toEqual({ start: 80, end: 81 });
  });

  it('moving end above start keeps the window', () => {
    expect(resolveTrim('end', 120, { start: 32, end: 61 }, MAX)).toEqual({ start: 32, end: 120 });
  });

  it('moving end to/below start is clamped to start+1 (inversion prevented)', () => {
    expect(resolveTrim('end', 32, { start: 32, end: 61 }, MAX)).toEqual({ start: 32, end: 33 });
    expect(resolveTrim('end', 10, { start: 32, end: 61 }, MAX)).toEqual({ start: 32, end: 33 });
  });

  it('clamps to [0, max] (start can never reach max; end never exceeds max)', () => {
    expect(resolveTrim('start', -5, { start: 32, end: 61 }, MAX)).toEqual({ start: 0, end: 61 });
    expect(resolveTrim('end', 9999, { start: 32, end: 61 }, MAX)).toEqual({ start: 32, end: MAX });
    expect(resolveTrim('start', 9999, { start: 32, end: 61 }, MAX).start).toBe(MAX - 1);
  });

  it('integerizes fractional drag positions', () => {
    expect(resolveTrim('start', 10.7, { start: 32, end: 61 }, MAX).start).toBe(11);
    expect(resolveTrim('end', 120.4, { start: 32, end: 61 }, MAX).end).toBe(120);
  });
});
